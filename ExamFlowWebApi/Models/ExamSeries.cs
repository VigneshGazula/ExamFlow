using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExamFlowWebApi.Models
{
    [Table("ExamSeries")]
    public class ExamSeries
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public ExamType ExamType { get; set; }

        [Required]
        [Range(1, 4)]
        public int Year { get; set; }

        [Required]
        [Column(TypeName = "jsonb")]
        public List<string> Branches { get; set; } = new List<string>();

        [Required]
        public DateOnly StartDate { get; set; }

        [Required]
        public DateOnly EndDate { get; set; }

        [Required]
        [MaxLength(50)]
        public string CreatedBy { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public ICollection<Exam> Exams { get; set; } = new List<Exam>();
    }
}
