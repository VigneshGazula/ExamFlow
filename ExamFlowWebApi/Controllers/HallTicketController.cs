using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExamFlowWebApi.Entities;
using ExamFlowWebApi.DTO.HallTicket;

namespace ExamFlowWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class HallTicketController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public HallTicketController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/hallticket/students?examSeriesId=xxx
        [HttpGet("students")]
        public async Task<ActionResult<List<StudentForHallTicketDTO>>> GetStudentsForHallTicket(
            [FromQuery] Guid? examSeriesId,
            [FromQuery] List<string>? branches,
            [FromQuery] List<string>? sections,
            [FromQuery] string? year)
        {
            try
            {
                // Start with all students who have profiles and are active
                var query = _context.Users
                    .Include(u => u.StudentProfile)
                    .Where(u => u.Role == "Student" && 
                               u.IsActive && 
                               u.StudentProfile != null);

                // Filter by branches if provided
                if (branches != null && branches.Any())
                {
                    query = query.Where(u => branches.Contains(u.StudentProfile!.Department));
                }

                // Filter by sections if provided
                if (sections != null && sections.Any())
                {
                    query = query.Where(u => sections.Contains(u.StudentProfile!.Section));
                }

                // Filter by year if provided
                if (!string.IsNullOrEmpty(year))
                {
                    query = query.Where(u => u.StudentProfile!.Year == year);
                }

                var students = await query
                    .Select(u => new StudentForHallTicketDTO
                    {
                        Id = u.Id,
                        UserId = u.UserId,
                        FullName = u.FullName,
                        Email = u.Email,
                        RollNumber = u.StudentProfile!.RollNumber,
                        Department = u.StudentProfile.Department,
                        Year = u.StudentProfile.Year,
                        Section = u.StudentProfile.Section
                    })
                    .OrderBy(s => s.Department)
                    .ThenBy(s => s.Section)
                    .ThenBy(s => s.RollNumber)
                    .ToListAsync();

                return Ok(students);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching students", error = ex.Message });
            }
        }

        // GET: api/hallticket/students/count
        [HttpGet("students/count")]
        public async Task<ActionResult<Dictionary<string, int>>> GetStudentsCount(
            [FromQuery] Guid? examSeriesId)
        {
            try
            {
                var students = await _context.Users
                    .Include(u => u.StudentProfile)
                    .Where(u => u.Role == "Student" && 
                               u.IsActive && 
                               u.StudentProfile != null)
                    .ToListAsync();

                var counts = new Dictionary<string, int>
                {
                    ["total"] = students.Count,
                    ["byBranch"] = students.GroupBy(s => s.StudentProfile!.Department).Count(),
                    ["bySections"] = students.GroupBy(s => s.StudentProfile!.Section).Count()
                };

                return Ok(counts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching student counts", error = ex.Message });
            }
        }

        // POST: api/hallticket/release
        [HttpPost("release")]
        public async Task<ActionResult<ReleaseHallTicketResponse>> ReleaseHallTickets(
            [FromBody] ReleaseHallTicketRequest request)
        {
            try
            {
                // Validate request
                if (request.ExamSeriesId == Guid.Empty)
                {
                    return BadRequest(new { message = "Exam series ID is required" });
                }

                if (!request.StudentIds.Any())
                {
                    return BadRequest(new { message = "At least one student must be selected" });
                }

                // Verify exam series exists
                var examSeries = await _context.ExamSeries
                    .FirstOrDefaultAsync(es => es.Id == request.ExamSeriesId);

                if (examSeries == null)
                {
                    return NotFound(new { message = "Exam series not found" });
                }

                // Get selected students
                var students = await _context.Users
                    .Include(u => u.StudentProfile)
                    .Where(u => request.StudentIds.Contains(u.Id) && 
                               u.Role == "Student" && 
                               u.IsActive)
                    .ToListAsync();

                if (!students.Any())
                {
                    return NotFound(new { message = "No valid students found" });
                }

                // Here you would typically:
                // 1. Generate hall ticket PDFs
                // 2. Store hall ticket records in database
                // 3. Send email notifications
                // For now, we'll just return success

                var response = new ReleaseHallTicketResponse
                {
                    Success = true,
                    Message = $"Hall tickets released successfully for {students.Count} students",
                    TotalStudents = students.Count,
                    ReleasedStudentIds = students.Select(s => s.UserId).ToList()
                };

                // Log the release action (you can add audit logging here)
                Console.WriteLine($"Hall tickets released for exam series {request.ExamSeriesId}");
                Console.WriteLine($"Branches: {string.Join(", ", request.Branches)}");
                Console.WriteLine($"Sections: {string.Join(", ", request.Sections)}");
                Console.WriteLine($"Students: {students.Count}");

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error releasing hall tickets", error = ex.Message });
            }
        }

        // GET: api/hallticket/branches
        [HttpGet("branches")]
        public async Task<ActionResult<List<string>>> GetAvailableBranches()
        {
            try
            {
                var branches = await _context.Users
                    .Include(u => u.StudentProfile)
                    .Where(u => u.Role == "Student" && 
                               u.IsActive && 
                               u.StudentProfile != null)
                    .Select(u => u.StudentProfile!.Department)
                    .Distinct()
                    .OrderBy(b => b)
                    .ToListAsync();

                return Ok(branches);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching branches", error = ex.Message });
            }
        }

        // GET: api/hallticket/sections
        [HttpGet("sections")]
        public async Task<ActionResult<List<string>>> GetAvailableSections()
        {
            try
            {
                var sections = await _context.Users
                    .Include(u => u.StudentProfile)
                    .Where(u => u.Role == "Student" && 
                               u.IsActive && 
                               u.StudentProfile != null)
                    .Select(u => u.StudentProfile!.Section)
                    .Distinct()
                    .OrderBy(s => s)
                    .ToListAsync();

                return Ok(sections);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching sections", error = ex.Message });
            }
        }
    }
}
