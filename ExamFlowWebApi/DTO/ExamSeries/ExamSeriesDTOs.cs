using System.ComponentModel.DataAnnotations;
using ExamFlowWebApi.Models;

namespace ExamFlowWebApi.DTO.ExamSeries
{
    public class CreateExamSeriesRequest
    {
        [Required(ErrorMessage = "Name is required")]
        [MaxLength(100, ErrorMessage = "Name cannot exceed 100 characters")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Exam type is required")]
        public ExamType ExamType { get; set; }

        [Required(ErrorMessage = "Year is required")]
        [Range(1, 4, ErrorMessage = "Year must be between 1 and 4")]
        public int Year { get; set; }

        [Required(ErrorMessage = "Branches are required")]
        [MinLength(1, ErrorMessage = "At least one branch must be selected")]
        public List<string> Branches { get; set; } = new List<string>();

        [Required(ErrorMessage = "Start date is required")]
        public DateOnly StartDate { get; set; }

        [Required(ErrorMessage = "End date is required")]
        public DateOnly EndDate { get; set; }
    }

    public class ExamSeriesResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public ExamType ExamType { get; set; }
        public int Year { get; set; }
        public List<string> Branches { get; set; } = new List<string>();
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class ScheduleBranchRequest
    {
        [Required]
        public List<ExamScheduleItem> Exams { get; set; } = new List<ExamScheduleItem>();

        [Required]
        public TimeOnly GlobalStartTime { get; set; }

        [Required]
        public TimeOnly GlobalEndTime { get; set; }
    }

    public class ExamScheduleItem
    {
        [Required]
        public DateOnly ExamDate { get; set; }

        [MaxLength(100)]
        public string? Subject { get; set; }

        public bool IsHoliday { get; set; } = false;
    }

    public class ExamResponse
    {
        public Guid Id { get; set; }
        public Guid ExamSeriesId { get; set; }
        public string Subject { get; set; } = string.Empty;
        public DateOnly ExamDate { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public string Branch { get; set; } = string.Empty;
        public int Year { get; set; }
        public bool IsHoliday { get; set; }
    }

    public class BranchStatusResponse
    {
        public string Branch { get; set; } = string.Empty;
        public bool IsScheduled { get; set; }
        public int ScheduledExamsCount { get; set; }
    }

    public class AvailableDateResponse
    {
        public DateOnly Date { get; set; }
        public string DayOfWeek { get; set; } = string.Empty;
        public bool IsScheduled { get; set; }
        public string? ScheduledSubject { get; set; }
    }

    public class ExamSeriesSummaryResponse
    {
        public Guid ExamSeriesId { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<ExamResponse> Exams { get; set; } = new List<ExamResponse>();
        public Dictionary<string, int> BranchScheduledCounts { get; set; } = new Dictionary<string, int>();
    }

    // Student-specific DTOs
    public class StudentExamSeriesResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public ExamType ExamType { get; set; }
        public int Year { get; set; }
        public string Branch { get; set; } = string.Empty;
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public int TotalExams { get; set; }
        public int UpcomingExams { get; set; }
        public int CompletedExams { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
