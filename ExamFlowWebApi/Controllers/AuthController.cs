using ExamFlowWebApi.DTO.Auth;
using ExamFlowWebApi.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ExamFlowWebApi.Controllers
{
    [ApiController]
    [Route("api/Auth")]
    public class AuthController : Controller
    {
        private readonly IAuthService _authService;
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }
        [HttpPost("signup")]
        public IActionResult SignUp(SignUpDTORequest signUpDTORequest)
        {
            try
            {
                if (string.IsNullOrEmpty(signUpDTORequest?.FullName) || 
                    string.IsNullOrEmpty(signUpDTORequest?.Email) || 
                    string.IsNullOrEmpty(signUpDTORequest?.Password) || 
                    string.IsNullOrEmpty(signUpDTORequest?.ConfirmPassword) ||
                    string.IsNullOrEmpty(signUpDTORequest?.Role))
                {
                    return BadRequest(new { message = "All fields are required." });
                }

                var response = _authService.signUp(signUpDTORequest);
                return Ok(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Signup error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpPost("login")]
        public IActionResult Login(LoginDTORequest loginDTORequest)
        {
            try
            {
                if (string.IsNullOrEmpty(loginDTORequest?.UserId) || 
                    string.IsNullOrEmpty(loginDTORequest?.Password) || 
                    string.IsNullOrEmpty(loginDTORequest?.LoginAs))
                {
                    return BadRequest(new { message = "UserId, Password, and LoginAs are required." });
                }

                var authResponse = _authService.signIn(loginDTORequest);
                return Ok(authResponse);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Login error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
