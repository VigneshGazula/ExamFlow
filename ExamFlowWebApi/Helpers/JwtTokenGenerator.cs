using ExamFlowWebApi.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ExamFlowWebApi.Helpers
{
    public class JwtTokenGenerator
    {
            private readonly IConfiguration _config;

            public JwtTokenGenerator(IConfiguration config)
            {
                _config = config;
            }

            public string GenerateToken(User user)
            {
                var claims = new[]
                {
                new Claim(ClaimTypes.Name, user.UserId),
                new Claim(ClaimTypes.Role, user.Role)
            };

                var key = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(_config["Jwt:Key"]));

                var token = new JwtSecurityToken(
                    issuer: _config["Jwt:Issuer"],
                    audience: _config["Jwt:Audience"],
                    claims: claims,
                    expires: DateTime.Now.AddHours(2),
                    signingCredentials:
                        new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
                );

                return new JwtSecurityTokenHandler().WriteToken(token);
            }
        }
}
