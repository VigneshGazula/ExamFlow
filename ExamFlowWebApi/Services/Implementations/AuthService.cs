using ExamFlowWebApi.DTO.Auth;
using ExamFlowWebApi.Helpers;
using ExamFlowWebApi.Models;
using ExamFlowWebApi.Repositories.Interfaces;
using ExamFlowWebApi.Services.Interfaces;

namespace ExamFlowWebApi.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly IUserRespository _userRepository;
        private readonly JwtTokenGenerator _jwtTokenGenerator;
        private readonly PasswordService _passwordService;

        public AuthService(IUserRespository userRepository, JwtTokenGenerator jwtTokenGenerator,PasswordService passwordService)
        {
            _userRepository = userRepository;
            _jwtTokenGenerator = jwtTokenGenerator;
            _passwordService = passwordService;
        }

        public AuthResponseDTO signIn(LoginDTORequest loginDTORequest)
        {
            var user = _userRepository.GetUserByUserID(loginDTORequest.UserId);

            if (user == null)
            {
                throw new Exception("User not found. Please sign up first.");
            }

            if (loginDTORequest.Equals(user.PasswordHash))
            {
                throw new Exception("Incorrect password.");
            }

            if (user.Role != loginDTORequest.LoginAs)
            {
                throw new Exception("Selected role does not match this user.");
            }

            var token = _jwtTokenGenerator.GenerateToken(user);

            return new AuthResponseDTO
            {
                Token = token,
                Role = user.Role
            };
        }

        public SignUpResponseDTO signUp(SignUpDTORequest signUpDTORequest)
        {
            if (signUpDTORequest.Password != signUpDTORequest.ConfirmPassword)
            {
                throw new Exception("Password and Confirm Password do not match.");
            }

            if (_userRepository.GetUserByEmail(signUpDTORequest.Email) != null)
            {
                throw new Exception("Email already exists.");
            }

            // 🔹 Role is inferred internally (NO role from frontend)
            var role = signUpDTORequest.Role;
            // or based on logic you already decided

            var lastUserId = _userRepository.GetLastUserIdByRole(role);
            var generatedUserId = UserIdGenerator.GenerateUserId(role, lastUserId);

            var user = new User
            {
                UserId = generatedUserId,
                FullName = signUpDTORequest.FullName,
                Email = signUpDTORequest.Email,
                PasswordHash = signUpDTORequest.Password,
                Role = role
            };

            _userRepository.AddUser(user);
            _userRepository.Save();

            return new SignUpResponseDTO
            {
                Message = "User registered successfully.",
                UserId = generatedUserId,
                Role = role
            };
        }
    }
}
