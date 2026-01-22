using ExamFlowWebApi.DTO.ExamSeries;
using ExamFlowWebApi.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ExamFlowWebApi.Controllers
{
    [ApiController]
    [Route("api/examseries")]
    [Authorize(Roles = "Admin")]
    public class ExamSeriesController : ControllerBase
    {
        private readonly IExamService _examService;
        private readonly ILogger<ExamSeriesController> _logger;

        public ExamSeriesController(IExamService examService, ILogger<ExamSeriesController> logger)
        {
            _examService = examService;
            _logger = logger;
        }

        /// <summary>
        /// Create a new exam series (Admin only)
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateExamSeries([FromBody] CreateExamSeriesRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "Unknown";
                var examSeries = await _examService.CreateExamSeriesAsync(request, userId);

                return Ok(new { message = "Exam series created successfully", examSeries });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning($"Invalid operation: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating exam series: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while creating the exam series" });
            }
        }

        /// <summary>
        /// Get all exam series
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllExamSeries()
        {
            try
            {
                var examSeriesList = await _examService.GetAllExamSeriesAsync();
                return Ok(examSeriesList);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching exam series: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while fetching exam series" });
            }
        }

        /// <summary>
        /// Get exam series by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetExamSeriesById(Guid id)
        {
            try
            {
                var examSeries = await _examService.GetExamSeriesByIdAsync(id);
                if (examSeries == null)
                {
                    return NotFound(new { message = "Exam series not found" });
                }
                return Ok(examSeries);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching exam series: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        /// <summary>
        /// Get unscheduled branches for an exam series
        /// </summary>
        [HttpGet("{id}/branches")]
        public async Task<IActionResult> GetUnscheduledBranches(Guid id)
        {
            try
            {
                var branches = await _examService.GetUnscheduledBranchesAsync(id);
                return Ok(branches);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching branches: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        /// <summary>
        /// Get available dates for a branch in an exam series
        /// </summary>
        [HttpGet("{id}/branches/{branch}/dates")]
        public async Task<IActionResult> GetAvailableDates(Guid id, string branch)
        {
            try
            {
                var dates = await _examService.GetAvailableDatesAsync(id, branch);
                return Ok(dates);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching dates: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        /// <summary>
        /// Get subjects for a branch
        /// </summary>
        [HttpGet("branches/{branch}/subjects")]
        public async Task<IActionResult> GetBranchSubjects(string branch)
        {
            try
            {
                var subjects = await _examService.GetBranchSubjectsAsync(branch);
                return Ok(subjects);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching subjects: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        /// <summary>
        /// Schedule exams for a branch
        /// </summary>
        [HttpPost("{id}/branches/{branch}/schedule")]
        public async Task<IActionResult> ScheduleBranchExams(Guid id, string branch, [FromBody] ScheduleBranchRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var exams = await _examService.ScheduleBranchExamsAsync(id, branch, request);
                return Ok(new { message = $"Successfully scheduled {exams.Count} exams for {branch}", exams });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning($"Invalid operation: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error scheduling exams: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while scheduling exams" });
            }
        }

        /// <summary>
        /// Get exam series summary with all scheduled exams
        /// </summary>
        [HttpGet("{id}/summary")]
        public async Task<IActionResult> GetExamSeriesSummary(Guid id)
        {
            try
            {
                var summary = await _examService.GetExamSeriesSummaryAsync(id);
                return Ok(summary);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching summary: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        /// <summary>
        /// Get list of all available branches (Public endpoint)
        /// </summary>
        [HttpGet("branches")]
        [AllowAnonymous]
        public IActionResult GetAllBranches()
        {
            return Ok(Models.BranchSubjects.AllBranches);
        }

        /// <summary>
        /// Debug endpoint to check current user claims
        /// </summary>
        [HttpGet("debug/claims")]
        [Authorize]
        public IActionResult GetClaims()
        {
            var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var isInStudentRole = User.IsInRole("Student");
            
            return Ok(new
            {
                userId = userId,
                role = role,
                isInStudentRole = isInStudentRole,
                allClaims = claims
            });
        }

        /// <summary>
        /// Get exam series for a student's branch (Student role)
        /// </summary>
        [HttpGet("student/{branch}")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetStudentExamSeries(string branch)
        {
            try
            {
                var examSeries = await _examService.GetStudentExamSeriesAsync(branch);
                return Ok(examSeries);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching student exam series: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while fetching exam series" });
            }
        }

        /// <summary>
        /// Get exams for a specific exam series and branch (Student role)
        /// </summary>
        [HttpGet("{id}/student/{branch}/exams")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetStudentExams(Guid id, string branch)
        {
            try
            {
                var exams = await _examService.GetStudentExamsAsync(id, branch);
                return Ok(exams);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching student exams: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while fetching exams" });
            }
        }
    }
}
