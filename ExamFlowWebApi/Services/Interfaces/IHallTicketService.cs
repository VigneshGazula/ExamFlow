using ExamFlowWebApi.DTO.HallTicket;

namespace ExamFlowWebApi.Services.Interfaces
{
    public interface IHallTicketService
    {
        // Release hall tickets to selected students
        Task<ReleaseHallTicketResponse> ReleaseHallTicketsAsync(ReleaseHallTicketRequest request);

        // Get exam series list with eligibility status for a student
        Task<List<ExamSeriesEligibilityDTO>> GetExamSeriesWithEligibilityAsync(int studentId);

        // Get hall ticket data for download
        Task<HallTicketDownloadDTO?> GetHallTicketForDownloadAsync(int studentId, Guid examSeriesId);

        // Get students for hall ticket release (admin view)
        Task<List<StudentForHallTicketDTO>> GetStudentsForHallTicketAsync(
            Guid? examSeriesId,
            List<string>? branches,
            List<string>? sections,
            string? year);
    }
}
