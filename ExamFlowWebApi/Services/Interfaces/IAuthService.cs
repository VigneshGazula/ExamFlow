using ExamFlowWebApi.DTO.Auth;

namespace ExamFlowWebApi.Services.Interfaces
{
    public interface IAuthService
    { 
        void signUp(SignUpDTORequest signUpDTORequest);
        AuthResponseDTO signIn(LoginDTORequest loginDTORequest);
    }
}
