using ExamFlowWebApi.DTO.StudentProfile;

namespace ExamFlowWebApi.Services.Interfaces
{
    public interface IStudentProfileService
    {
        Task<ProfileStatusResponse> CheckProfileStatusAsync(int userId);
        Task<StudentProfileResponse> CreateProfileAsync(int userId, StudentProfileRequest request);
        Task<StudentProfileResponse?> GetProfileAsync(int userId);
    }
}
