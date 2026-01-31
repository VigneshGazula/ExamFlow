using Microsoft.EntityFrameworkCore;
using ExamFlowWebApi.Entities;
using ExamFlowWebApi.DTO.HallTicket;
using ExamFlowWebApi.Models;
using ExamFlowWebApi.Services.Interfaces;

namespace ExamFlowWebApi.Services.Implementations
{
    public class HallTicketService : IHallTicketService
    {
        private readonly ApplicationDbContext _context;

        public HallTicketService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ReleaseHallTicketResponse> ReleaseHallTicketsAsync(ReleaseHallTicketRequest request)
        {
            var response = new ReleaseHallTicketResponse();

            // Verify exam series exists
            var examSeries = await _context.ExamSeries
                .FirstOrDefaultAsync(es => es.Id == request.ExamSeriesId);

            if (examSeries == null)
            {
                throw new Exception("Exam series not found");
            }

            // Get students to release hall tickets for
            List<int> studentIds;
            
            if (request.SelectAll)
            {
                // Get all students matching filters
                var query = _context.Users
                    .Include(u => u.StudentProfile)
                    .Where(u => u.Role == "Student" && 
                               u.IsActive && 
                               u.StudentProfile != null &&
                               u.StudentProfile.Year == examSeries.Year.ToString());

                if (request.Branches.Any())
                {
                    query = query.Where(u => request.Branches.Contains(u.StudentProfile!.Department));
                }

                if (request.Sections.Any())
                {
                    query = query.Where(u => request.Sections.Contains(u.StudentProfile!.Section));
                }

                studentIds = await query.Select(u => u.Id).ToListAsync();
            }
            else
            {
                studentIds = request.StudentIds;
            }

            if (!studentIds.Any())
            {
                throw new Exception("No students selected");
            }

            // Get existing hall tickets for these students
            var existingHallTickets = await _context.HallTickets
                .Where(ht => ht.ExamSeriesId == request.ExamSeriesId && 
                            studentIds.Contains(ht.StudentId))
                .Select(ht => ht.StudentId)
                .ToListAsync();

            var newStudentIds = studentIds.Except(existingHallTickets).ToList();

            // Get student details for new hall tickets
            var students = await _context.Users
                .Include(u => u.StudentProfile)
                .Where(u => newStudentIds.Contains(u.Id))
                .ToListAsync();

            // Generate and insert hall tickets
            var hallTickets = new List<HallTicket>();
            
            foreach (var student in students)
            {
                var hallTicket = new HallTicket
                {
                    StudentId = student.Id,
                    ExamSeriesId = request.ExamSeriesId,
                    HallTicketNumber = GenerateHallTicketNumber(examSeries.Year, student.Id),
                    IssuedAt = DateTime.UtcNow,
                    Status = "Released",
                    Remarks = null
                };
                
                hallTickets.Add(hallTicket);
            }

            if (hallTickets.Any())
            {
                await _context.HallTickets.AddRangeAsync(hallTickets);
                await _context.SaveChangesAsync();
            }

            response.Success = true;
            response.TotalStudents = studentIds.Count;
            response.NewlyReleased = newStudentIds.Count;
            response.AlreadyReleased = existingHallTickets.Count;
            response.Message = $"Released {newStudentIds.Count} new hall tickets. {existingHallTickets.Count} were already released.";
            response.ReleasedStudentIds = students.Select(s => s.UserId).ToList();

            return response;
        }

        public async Task<List<ExamSeriesEligibilityDTO>> GetExamSeriesWithEligibilityAsync(int studentId)
        {
            // Get student's department
            var student = await _context.Users
                .Include(u => u.StudentProfile)
                .FirstOrDefaultAsync(u => u.Id == studentId);

            if (student?.StudentProfile == null)
            {
                throw new Exception("Student profile not found");
            }

            var department = student.StudentProfile.Department;
            var year = int.Parse(student.StudentProfile.Year);

            // Get all exam series for student's year
            var examSeriesList = await _context.ExamSeries
                .Where(es => es.Year == year)
                .OrderByDescending(es => es.StartDate)
                .ToListAsync();

            var result = new List<ExamSeriesEligibilityDTO>();

            foreach (var series in examSeriesList)
            {
                // Check if department is eligible (at least one student from department has hall ticket)
                var departmentEligible = await _context.HallTickets
                    .Include(ht => ht.Student)
                        .ThenInclude(u => u.StudentProfile)
                    .AnyAsync(ht => ht.ExamSeriesId == series.Id && 
                                   ht.Student.StudentProfile!.Department == department &&
                                   ht.Status == "Released");

                // Check if this specific student has a hall ticket
                var studentHasHallTicket = await _context.HallTickets
                    .AnyAsync(ht => ht.StudentId == studentId && 
                                   ht.ExamSeriesId == series.Id &&
                                   ht.Status == "Released");

                var status = GetExamSeriesStatus(series.StartDate.ToDateTime(TimeOnly.MinValue), series.EndDate.ToDateTime(TimeOnly.MinValue));

                result.Add(new ExamSeriesEligibilityDTO
                {
                    Id = series.Id,
                    Name = series.Name,
                    ExamType = (int)series.ExamType,
                    ExamTypeName = GetExamTypeName((int)series.ExamType),
                    StartDate = series.StartDate.ToDateTime(TimeOnly.MinValue),
                    EndDate = series.EndDate.ToDateTime(TimeOnly.MinValue),
                    Year = series.Year,
                    Status = status,
                    IsEligible = departmentEligible,
                    StudentHasHallTicket = studentHasHallTicket
                });
            }

            return result;
        }

        public async Task<HallTicketDownloadDTO?> GetHallTicketForDownloadAsync(int studentId, Guid examSeriesId)
        {
            // Get student's department
            var student = await _context.Users
                .Include(u => u.StudentProfile)
                .FirstOrDefaultAsync(u => u.Id == studentId);

            if (student?.StudentProfile == null)
            {
                return null;
            }

            var department = student.StudentProfile.Department;

            // Check if department is eligible
            var departmentEligible = await _context.HallTickets
                .Include(ht => ht.Student)
                    .ThenInclude(u => u.StudentProfile)
                .AnyAsync(ht => ht.ExamSeriesId == examSeriesId && 
                               ht.Student.StudentProfile!.Department == department &&
                               ht.Status == "Released");

            if (!departmentEligible)
            {
                return null; // Not eligible
            }

            // Get student's hall ticket
            var hallTicket = await _context.HallTickets
                .Include(ht => ht.ExamSeries)
                .FirstOrDefaultAsync(ht => ht.StudentId == studentId && 
                                          ht.ExamSeriesId == examSeriesId &&
                                          ht.Status == "Released");

            if (hallTicket == null)
            {
                return null; // Student doesn't have hall ticket yet
            }

            // Get exam schedule for the student's branch
            var examSchedule = await _context.Exams
                .Where(e => e.ExamSeriesId == examSeriesId && 
                           e.Branch == department)
                .OrderBy(e => e.ExamDate)
                .Select(e => new ExamScheduleDTO
                {
                    SubjectName = e.Subject,
                    SubjectCode = e.Subject, // Using Subject as code since no separate code field
                    ExamDate = e.ExamDate.ToDateTime(TimeOnly.MinValue),
                    ExamTime = e.StartTime.ToString("hh:mm tt") + " - " + e.EndTime.ToString("hh:mm tt")
                })
                .ToListAsync();

            return new HallTicketDownloadDTO
            {
                HallTicketNumber = hallTicket.HallTicketNumber,
                StudentName = student.FullName,
                RollNumber = student.StudentProfile.RollNumber,
                Department = student.StudentProfile.Department,
                ExamSeriesName = hallTicket.ExamSeries.Name,
                IssuedAt = hallTicket.IssuedAt,
                ExamSchedule = examSchedule
            };
        }

        public async Task<List<StudentForHallTicketDTO>> GetStudentsForHallTicketAsync(
            Guid? examSeriesId,
            List<string>? branches,
            List<string>? sections,
            string? year)
        {
            var query = _context.Users
                .Include(u => u.StudentProfile)
                .Where(u => u.Role == "Student" && 
                           u.IsActive && 
                           u.StudentProfile != null);

            if (branches != null && branches.Any())
            {
                query = query.Where(u => branches.Contains(u.StudentProfile!.Department));
            }

            if (sections != null && sections.Any())
            {
                query = query.Where(u => sections.Contains(u.StudentProfile!.Section));
            }

            if (!string.IsNullOrEmpty(year))
            {
                query = query.Where(u => u.StudentProfile!.Year == year);
            }

            var students = await query
                .Select(u => new
                {
                    u.Id,
                    u.UserId,
                    u.FullName,
                    u.Email,
                    u.StudentProfile!.RollNumber,
                    u.StudentProfile.Department,
                    u.StudentProfile.Year,
                    u.StudentProfile.Section
                })
                .ToListAsync();

            // Get hall ticket status for each student if examSeriesId is provided
            var studentIds = students.Select(s => s.Id).ToList();
            var releasedStudentIds = new HashSet<int>();

            if (examSeriesId.HasValue && examSeriesId.Value != Guid.Empty)
            {
                releasedStudentIds = (await _context.HallTickets
                    .Where(ht => ht.ExamSeriesId == examSeriesId.Value && 
                                studentIds.Contains(ht.StudentId) &&
                                ht.Status == "Released")
                    .Select(ht => ht.StudentId)
                    .ToListAsync())
                    .ToHashSet();
            }

            return students.Select(s => new StudentForHallTicketDTO
            {
                Id = s.Id,
                UserId = s.UserId,
                FullName = s.FullName,
                Email = s.Email,
                RollNumber = s.RollNumber,
                Department = s.Department,
                Year = s.Year,
                Section = s.Section,
                HallTicketReleased = releasedStudentIds.Contains(s.Id)
            })
            .OrderBy(s => s.Department)
            .ThenBy(s => s.Section)
            .ThenBy(s => s.RollNumber)
            .ToList();
        }

        private string GenerateHallTicketNumber(int year, int studentId)
        {
            // Format: HT-YYYY-XXXXX
            return $"HT-{year}-{studentId:D5}";
        }

        private string GetExamSeriesStatus(DateTime startDate, DateTime endDate)
        {
            var now = DateTime.UtcNow;
            
            if (startDate > now)
                return "Upcoming";
            else if (startDate <= now && endDate >= now)
                return "Ongoing";
            else
                return "Completed";
        }

        private string GetExamTypeName(int examType)
        {
            return examType switch
            {
                1 => "Semester",
                2 => "Midterm",
                3 => "Internal Lab",
                4 => "External Lab",
                _ => "Unknown"
            };
        }
    }
}
