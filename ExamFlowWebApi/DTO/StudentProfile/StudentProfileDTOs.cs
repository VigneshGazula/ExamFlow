using System.ComponentModel.DataAnnotations;

namespace ExamFlowWebApi.DTO.StudentProfile
{
    public class StudentProfileRequest
    {
        [Required(ErrorMessage = "Roll number is required")]
        [MaxLength(20, ErrorMessage = "Roll number cannot exceed 20 characters")]
        public string RollNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "Department is required")]
        [MaxLength(50, ErrorMessage = "Department cannot exceed 50 characters")]
        public string Department { get; set; } = string.Empty;

        [Required(ErrorMessage = "Year is required")]
        [MaxLength(10, ErrorMessage = "Year cannot exceed 10 characters")]
        public string Year { get; set; } = string.Empty;

        [Required(ErrorMessage = "Section is required")]
        [MaxLength(5, ErrorMessage = "Section cannot exceed 5 characters")]
        public string Section { get; set; } = string.Empty;
    }

    public class StudentProfileResponse
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string RollNumber { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Year { get; set; } = string.Empty;
        public string Section { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class ProfileStatusResponse
    {
        public bool HasProfile { get; set; }
        public StudentProfileResponse? Profile { get; set; }
    }
}
