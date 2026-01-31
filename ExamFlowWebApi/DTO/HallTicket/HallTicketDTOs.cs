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
        public bool HallTicketReleased { get; set; } // Whether student already has hall ticket
    }

    // Request DTO for releasing hall tickets
    public class ReleaseHallTicketRequest
    {
        public Guid ExamSeriesId { get; set; }
        public List<string> Branches { get; set; } = new();
        public List<string> Sections { get; set; } = new();
        public List<int> StudentIds { get; set; } = new();
        public bool SelectAll { get; set; } = false;
    }

    // Response DTO for release confirmation
    public class ReleaseHallTicketResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int TotalStudents { get; set; }
        public int NewlyReleased { get; set; }
        public int AlreadyReleased { get; set; }
        public List<string> ReleasedStudentIds { get; set; } = new();
    }

    // DTO for exam series with eligibility status
    public class ExamSeriesEligibilityDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int ExamType { get; set; }
        public string ExamTypeName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int Year { get; set; }
        public string Status { get; set; } = string.Empty; // Upcoming, Ongoing, Completed
        public bool IsEligible { get; set; } // Department-based eligibility
        public bool StudentHasHallTicket { get; set; } // Individual student's hall ticket status
    }

    // DTO for hall ticket download data
    public class HallTicketDownloadDTO
    {
        public string HallTicketNumber { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public string RollNumber { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string ExamSeriesName { get; set; } = string.Empty;
        public DateTime IssuedAt { get; set; }
        public List<ExamScheduleDTO> ExamSchedule { get; set; } = new();
    }

    // DTO for individual exam in schedule
    public class ExamScheduleDTO
    {
        public string SubjectName { get; set; } = string.Empty;
        public string SubjectCode { get; set; } = string.Empty;
        public DateTime ExamDate { get; set; }
        public string ExamTime { get; set; } = string.Empty;
    }
}

