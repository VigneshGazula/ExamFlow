namespace ExamFlowWebApi.DTO.HallTicket
{
    // Request DTO for filtering students
    public class StudentFilterRequest
    {
        public Guid ExamSeriesId { get; set; }
        public List<string>? Branches { get; set; }
        public List<string>? Sections { get; set; }
        public string? Year { get; set; }
    }

    // Response DTO for student details
    public class StudentForHallTicketDTO
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string RollNumber { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Year { get; set; } = string.Empty;
        public string Section { get; set; } = string.Empty;
    }

    // Request DTO for releasing hall tickets
    public class ReleaseHallTicketRequest
    {
        public Guid ExamSeriesId { get; set; }
        public List<string> Branches { get; set; } = new();
        public List<string> Sections { get; set; } = new();
        public List<int> StudentIds { get; set; } = new();
    }

    // Response DTO for release confirmation
    public class ReleaseHallTicketResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int TotalStudents { get; set; }
        public List<string> ReleasedStudentIds { get; set; } = new();
    }
}
