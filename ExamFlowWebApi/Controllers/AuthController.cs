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
        [HttpPost("SignUp")]
        public IActionResult SignUp(SignUpDTORequest signUpDTORequest)
        {
            _authService.signUp(signUpDTORequest);
            return Ok(new { Message = "User registered successfully." });
        }
        [HttpPost("login")]
        public IActionResult Login(LoginDTORequest loginDTORequest)
        {
            var authResponse = _authService.signIn(loginDTORequest);
            return Ok(authResponse);
        }
    }
}
