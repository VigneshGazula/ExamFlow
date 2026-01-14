using System.ComponentModel.DataAnnotations;

namespace ExamFlowWebApi.Models
{
    public class User
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string Role { get; set; }
        public bool IsActive { get; set; } = true;

        // Navigation property for one-to-one relationship
        public StudentProfile? StudentProfile { get; set; }
    }

    public class StudentProfile
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string RollNumber { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Year { get; set; } = string.Empty;
        public string Section { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public User Student { get; set; } = null!;
    }
}
