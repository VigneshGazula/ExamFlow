using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExamFlowWebApi.Models
{
    [Table("Exams")]
    public class Exam
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid ExamSeriesId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Subject { get; set; } = string.Empty;

        [Required]
        public DateOnly ExamDate { get; set; }

        [Required]
        public TimeOnly StartTime { get; set; }

        [Required]
        public TimeOnly EndTime { get; set; }

        [Required]
        [MaxLength(50)]
        public string Branch { get; set; } = string.Empty;

        [Required]
        [Range(1, 4)]
        public int Year { get; set; }

        public bool IsHoliday { get; set; } = false;

        // Navigation property
        [ForeignKey("ExamSeriesId")]
        public ExamSeries ExamSeries { get; set; } = null!;
    }
}
