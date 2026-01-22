using ExamFlowWebApi.DTO.ExamSeries;

namespace ExamFlowWebApi.Services.Interfaces
{
    public interface IExamService
    {
        Task<ExamSeriesResponse> CreateExamSeriesAsync(CreateExamSeriesRequest request, string createdBy);
        Task<List<BranchStatusResponse>> GetUnscheduledBranchesAsync(Guid examSeriesId);
        Task<List<AvailableDateResponse>> GetAvailableDatesAsync(Guid examSeriesId, string branch);
        Task<List<string>> GetBranchSubjectsAsync(string branch);
        Task<List<ExamResponse>> ScheduleBranchExamsAsync(Guid examSeriesId, string branch, ScheduleBranchRequest request);
        Task<ExamSeriesSummaryResponse> GetExamSeriesSummaryAsync(Guid examSeriesId);
        Task<List<ExamSeriesResponse>> GetAllExamSeriesAsync();
        Task<ExamSeriesResponse?> GetExamSeriesByIdAsync(Guid id);
        
        // Student-specific methods
        Task<List<StudentExamSeriesResponse>> GetStudentExamSeriesAsync(string branch);
        Task<List<ExamResponse>> GetStudentExamsAsync(Guid examSeriesId, string branch);
    }
}
