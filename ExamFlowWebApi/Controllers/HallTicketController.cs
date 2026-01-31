using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExamFlowWebApi.Entities;
using ExamFlowWebApi.DTO.HallTicket;
using ExamFlowWebApi.Services.Interfaces;
using System.Security.Claims;

namespace ExamFlowWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HallTicketController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHallTicketService _hallTicketService;

        public HallTicketController(
            ApplicationDbContext context,
            IHallTicketService hallTicketService)
        {
            _context = context;
            _hallTicketService = hallTicketService;
        }

        // POST: api/hallticket/release
        [HttpPost("release")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ReleaseHallTicketResponse>> ReleaseHallTickets(
            [FromBody] ReleaseHallTicketRequest request)
        {
            try
            {
                var response = await _hallTicketService.ReleaseHallTicketsAsync(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error releasing hall tickets", error = ex.Message });
            }
        }

        // GET: api/hallticket/student
        [HttpGet("student")]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult<List<ExamSeriesEligibilityDTO>>> GetStudentExamSeries()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
                
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                var examSeries = await _hallTicketService.GetExamSeriesWithEligibilityAsync(user.Id);
                return Ok(examSeries);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching exam series", error = ex.Message });
            }
        }

        // GET: api/hallticket/{examSeriesId}/download
        [HttpGet("{examSeriesId}/download")]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult<HallTicketDownloadDTO>> DownloadHallTicket(Guid examSeriesId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
                
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                var hallTicket = await _hallTicketService.GetHallTicketForDownloadAsync(user.Id, examSeriesId);
                
                if (hallTicket == null)
                {
                    return NotFound(new { message = "Hall ticket not available. Either you are not eligible or it hasn't been released yet." });
                }

                return Ok(hallTicket);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error downloading hall ticket", error = ex.Message });
            }
        }

        // GET: api/hallticket/students (Admin only)
        [HttpGet("students")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<StudentForHallTicketDTO>>> GetStudentsForHallTicket(
            [FromQuery] Guid? examSeriesId,
            [FromQuery] List<string>? branches,
            [FromQuery] List<string>? sections,
            [FromQuery] string? year)
        {
            try
            {
                var students = await _hallTicketService.GetStudentsForHallTicketAsync(
                    examSeriesId,
                    branches,
                    sections,
                    year);

                return Ok(students);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching students", error = ex.Message });
            }
        }

        // GET: api/hallticket/students/count
        [HttpGet("students/count")]
        [Authorize(Roles = "Admin")]
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

        // GET: api/hallticket/branches
        [HttpGet("branches")]
        [Authorize(Roles = "Admin")]
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
        [Authorize(Roles = "Admin")]
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
