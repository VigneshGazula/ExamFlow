namespace ExamFlowWebApi.DTO.Auth
{
    public class LoginDTORequest
    {
        public string UserId { get; set; }
        public string Password { get; set; }
        public string LoginAs { get; set; } // Student / Faculty / Admin / Digitizer
    }
}
