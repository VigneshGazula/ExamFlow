using ExamFlowWebApi.DTO.Auth;

namespace ExamFlowWebApi.Services.Interfaces
{
    public interface IAuthService
    { 
        SignUpResponseDTO signUp(SignUpDTORequest signUpDTORequest);
        AuthResponseDTO signIn(LoginDTORequest loginDTORequest);
    }
}
