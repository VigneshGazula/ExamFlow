using ExamFlowWebApi.DTO.ExamSeries;
using ExamFlowWebApi.Entities;
using ExamFlowWebApi.Models;
using ExamFlowWebApi.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ExamFlowWebApi.Services.Implementations
{
    public class ExamService : IExamService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ExamService> _logger;

        public ExamService(ApplicationDbContext context, ILogger<ExamService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ExamSeriesResponse> CreateExamSeriesAsync(CreateExamSeriesRequest request, string createdBy)
        {
            // Validation
            if (request.StartDate >= request.EndDate)
            {
                throw new InvalidOperationException("Start date must be before end date");
            }

            // Validate all branches
            foreach (var branch in request.Branches)
            {
                if (!BranchSubjects.IsValidBranch(branch))
                {
                    throw new InvalidOperationException($"Invalid branch: {branch}");
                }
            }

            var examSeries = new Models.ExamSeries
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                ExamType = request.ExamType,
                Year = request.Year,
                Branches = request.Branches,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                CreatedBy = createdBy,
                CreatedAt = DateTime.UtcNow
            };

            _context.ExamSeries.Add(examSeries);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"ExamSeries created: {examSeries.Id} by {createdBy}");

            return MapToExamSeriesResponse(examSeries);
        }

        public async Task<List<BranchStatusResponse>> GetUnscheduledBranchesAsync(Guid examSeriesId)
        {
            var examSeries = await _context.ExamSeries
                .Include(es => es.Exams)
                .FirstOrDefaultAsync(es => es.Id == examSeriesId);

            if (examSeries == null)
            {
                throw new InvalidOperationException("Exam series not found");
            }

            var branchStatuses = new List<BranchStatusResponse>();

            foreach (var branch in examSeries.Branches)
            {
                var scheduledCount = examSeries.Exams.Count(e => e.Branch == branch);
                branchStatuses.Add(new BranchStatusResponse
                {
                    Branch = branch,
                    IsScheduled = scheduledCount > 0,
                    ScheduledExamsCount = scheduledCount
                });
            }

            return branchStatuses;
        }

        public async Task<List<AvailableDateResponse>> GetAvailableDatesAsync(Guid examSeriesId, string branch)
        {
            var examSeries = await _context.ExamSeries
                .Include(es => es.Exams.Where(e => e.Branch == branch))
                .FirstOrDefaultAsync(es => es.Id == examSeriesId);

            if (examSeries == null)
            {
                throw new InvalidOperationException("Exam series not found");
            }

            if (!examSeries.Branches.Contains(branch))
            {
                throw new InvalidOperationException($"Branch {branch} not included in this exam series");
            }

            var availableDates = new List<AvailableDateResponse>();
            var currentDate = examSeries.StartDate;

            while (currentDate <= examSeries.EndDate)
            {
                var scheduledExam = examSeries.Exams.FirstOrDefault(e => e.ExamDate == currentDate);

                availableDates.Add(new AvailableDateResponse
                {
                    Date = currentDate,
                    DayOfWeek = currentDate.DayOfWeek.ToString(),
                    IsScheduled = scheduledExam != null,
                    ScheduledSubject = scheduledExam?.Subject
                });

                currentDate = currentDate.AddDays(1);
            }

            return availableDates;
        }

        public async Task<List<string>> GetBranchSubjectsAsync(string branch)
        {
            await Task.CompletedTask; // Async operation placeholder
            
            if (!BranchSubjects.IsValidBranch(branch))
            {
                throw new InvalidOperationException($"Invalid branch: {branch}");
            }

            return BranchSubjects.GetSubjects(branch);
        }

        public async Task<List<ExamResponse>> ScheduleBranchExamsAsync(Guid examSeriesId, string branch, ScheduleBranchRequest request)
        {
            var examSeries = await _context.ExamSeries
                .Include(es => es.Exams.Where(e => e.Branch == branch))
                .FirstOrDefaultAsync(es => es.Id == examSeriesId);

            if (examSeries == null)
            {
                throw new InvalidOperationException("Exam series not found");
            }

            if (!examSeries.Branches.Contains(branch))
            {
                throw new InvalidOperationException($"Branch {branch} not included in this exam series");
            }

            // Validate time
            if (request.GlobalStartTime >= request.GlobalEndTime)
            {
                throw new InvalidOperationException("Start time must be before end time");
            }

            // Remove existing exams for this branch
            var existingExams = examSeries.Exams.Where(e => e.Branch == branch).ToList();
            _context.Exams.RemoveRange(existingExams);

            var createdExams = new List<Exam>();

            foreach (var examItem in request.Exams)
            {
                // Validate date is within range
                if (examItem.ExamDate < examSeries.StartDate || examItem.ExamDate > examSeries.EndDate)
                {
                    throw new InvalidOperationException($"Exam date {examItem.ExamDate} is outside the exam series date range");
                }

                // Skip if holiday and no subject
                if (examItem.IsHoliday && string.IsNullOrWhiteSpace(examItem.Subject))
                {
                    continue;
                }

                // Validate subject for non-holidays
                if (!examItem.IsHoliday && string.IsNullOrWhiteSpace(examItem.Subject))
                {
                    throw new InvalidOperationException($"Subject is required for exam on {examItem.ExamDate}");
                }

                var exam = new Exam
                {
                    Id = Guid.NewGuid(),
                    ExamSeriesId = examSeriesId,
                    Subject = examItem.Subject ?? "Holiday",
                    ExamDate = examItem.ExamDate,
                    StartTime = request.GlobalStartTime,
                    EndTime = request.GlobalEndTime,
                    Branch = branch,
                    Year = examSeries.Year,
                    IsHoliday = examItem.IsHoliday
                };

                _context.Exams.Add(exam);
                createdExams.Add(exam);
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Scheduled {createdExams.Count} exams for branch {branch} in exam series {examSeriesId}");

            return createdExams.Select(MapToExamResponse).ToList();
        }

        public async Task<ExamSeriesSummaryResponse> GetExamSeriesSummaryAsync(Guid examSeriesId)
        {
            var examSeries = await _context.ExamSeries
                .Include(es => es.Exams)
                .FirstOrDefaultAsync(es => es.Id == examSeriesId);

            if (examSeries == null)
            {
                throw new InvalidOperationException("Exam series not found");
            }

            var branchCounts = examSeries.Branches.ToDictionary(
                branch => branch,
                branch => examSeries.Exams.Count(e => e.Branch == branch)
            );

            return new ExamSeriesSummaryResponse
            {
                ExamSeriesId = examSeries.Id,
                Name = examSeries.Name,
                Exams = examSeries.Exams.Select(MapToExamResponse).OrderBy(e => e.ExamDate).ThenBy(e => e.Branch).ToList(),
                BranchScheduledCounts = branchCounts
            };
        }

        public async Task<List<ExamSeriesResponse>> GetAllExamSeriesAsync()
        {
            var examSeriesList = await _context.ExamSeries
                .OrderByDescending(es => es.CreatedAt)
                .ToListAsync();

            return examSeriesList.Select(MapToExamSeriesResponse).ToList();
        }

        public async Task<ExamSeriesResponse?> GetExamSeriesByIdAsync(Guid id)
        {
            var examSeries = await _context.ExamSeries.FindAsync(id);
            return examSeries == null ? null : MapToExamSeriesResponse(examSeries);
        }

        private ExamSeriesResponse MapToExamSeriesResponse(Models.ExamSeries examSeries)
        {
            return new ExamSeriesResponse
            {
                Id = examSeries.Id,
                Name = examSeries.Name,
                ExamType = examSeries.ExamType,
                Year = examSeries.Year,
                Branches = examSeries.Branches,
                StartDate = examSeries.StartDate,
                EndDate = examSeries.EndDate,
                CreatedBy = examSeries.CreatedBy,
                CreatedAt = examSeries.CreatedAt
            };
        }

        private ExamResponse MapToExamResponse(Exam exam)
        {
            return new ExamResponse
            {
                Id = exam.Id,
                ExamSeriesId = exam.ExamSeriesId,
                Subject = exam.Subject,
                ExamDate = exam.ExamDate,
                StartTime = exam.StartTime,
                EndTime = exam.EndTime,
                Branch = exam.Branch,
                Year = exam.Year,
                IsHoliday = exam.IsHoliday
            };
        }

        // Student-specific methods
        public async Task<List<StudentExamSeriesResponse>> GetStudentExamSeriesAsync(string branch)
        {
            // Convert department name to branch code if needed
            var branchCode = BranchSubjects.GetBranchCode(branch);

            var examSeriesList = await _context.ExamSeries
                .Include(es => es.Exams)
                .Where(es => es.Branches.Contains(branchCode))
                .OrderByDescending(es => es.CreatedAt)
                .ToListAsync();

            var studentExamSeries = new List<StudentExamSeriesResponse>();

            foreach (var examSeries in examSeriesList)
            {
                var branchExams = examSeries.Exams
                    .Where(e => e.Branch == branchCode && !e.IsHoliday)
                    .ToList();
                
                // Only include exam series that have at least one scheduled exam for this branch
                if (branchExams.Count > 0)
                {
                    var now = DateOnly.FromDateTime(DateTime.UtcNow);
                    var upcomingExams = branchExams.Count(e => e.ExamDate >= now);
                    var completedExams = branchExams.Count(e => e.ExamDate < now);

                    studentExamSeries.Add(new StudentExamSeriesResponse
                    {
                        Id = examSeries.Id,
                        Name = examSeries.Name,
                        ExamType = examSeries.ExamType,
                        Year = examSeries.Year,
                        Branch = branchCode,
                        StartDate = examSeries.StartDate,
                        EndDate = examSeries.EndDate,
                        TotalExams = branchExams.Count,
                        UpcomingExams = upcomingExams,
                        CompletedExams = completedExams,
                        CreatedAt = examSeries.CreatedAt
                    });
                }
            }

            return studentExamSeries;
        }

        public async Task<List<ExamResponse>> GetStudentExamsAsync(Guid examSeriesId, string branch)
        {
            // Convert department name to branch code if needed
            var branchCode = BranchSubjects.GetBranchCode(branch);

            var examSeries = await _context.ExamSeries
                .Include(es => es.Exams)
                .FirstOrDefaultAsync(es => es.Id == examSeriesId);

            if (examSeries == null)
            {
                throw new InvalidOperationException("Exam series not found");
            }

            if (!examSeries.Branches.Contains(branchCode))
            {
                throw new InvalidOperationException($"This exam series is not available for {branch} branch");
            }

            var branchExams = examSeries.Exams
                .Where(e => e.Branch == branchCode)
                .OrderBy(e => e.ExamDate)
                .ThenBy(e => e.StartTime)
                .ToList();

            return branchExams.Select(MapToExamResponse).ToList();
        }
    }
}
