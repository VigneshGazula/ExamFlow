using Azure.Core;
using ExamFlowWebApi.DTO.Auth;
using ExamFlowWebApi.Helpers;
using ExamFlowWebApi.Models;
using ExamFlowWebApi.Repositories.Interfaces;
using ExamFlowWebApi.Services.Interfaces;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Org.BouncyCastle.Crypto.Generators;

namespace ExamFlowWebApi.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly IUserRespository _userRepository;
        private readonly JwtTokenGenerator _jwtTokenGenerator;
        private readonly PasswordService _passwordService = new PasswordService();

        public AuthService(IUserRespository userRepository, JwtTokenGenerator jwtTokenGenerator)
        {
            _userRepository = userRepository;
            _jwtTokenGenerator = jwtTokenGenerator;
        }

        public AuthResponseDTO signIn(LoginDTORequest loginDTORequest)
        {
            var user = _userRepository.GetUserByUserID(loginDTORequest.UserId);
            if (user == null)
            {
                throw new Exception("Invalid UserID or Password.");
            }

            // Corrected BCrypt usage with the proper namespace
            if (_passwordService.VerifyPassword(loginDTORequest.Password, user.PasswordHash) == false)
            {
                throw new Exception("Invalid UserID or Password.");
            }
            var token = _jwtTokenGenerator.GenerateToken(user);

            return new AuthResponseDTO
            {
                Token = _jwtTokenGenerator.GenerateToken(user),
                Role = user.Role
            };
        }

        public void signUp(SignUpDTORequest signUpDTORequest)
        {
            if (signUpDTORequest.Password != signUpDTORequest.ConfirmPassword)
            {
                throw new Exception("Password and Confirm Password do not match.");
            }

            if (_userRepository.GetUserByUserID(signUpDTORequest.UserId) != null)
            {
                throw new Exception("User already exists.");
            }

            var role = RoleResolver.GetRoleFromUserId(signUpDTORequest.UserId);
            var user = new User
            {
                UserId = signUpDTORequest.UserId,
                FullName = signUpDTORequest.FullName,
                Email = signUpDTORequest.Email,
                PasswordHash = _passwordService.HashPassword(signUpDTORequest.Password), // Corrected BCrypt usage
                Role = role
            };

            _userRepository.AddUser(user);
            _userRepository.Save();
        }
    }
}
