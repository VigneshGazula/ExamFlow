using Microsoft.AspNetCore.Mvc;

namespace ExamFlowWebApi.DTO.Auth
{
    public class SignUpDTORequest
    {
        public string UserId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string ConfirmPassword { get; set; }
    }
}
