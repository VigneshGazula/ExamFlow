using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExamFlowWebApi.Models
{
    [Table("HallTickets")]
    public class HallTicket
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int StudentId { get; set; }

        [Required]
        public Guid ExamSeriesId { get; set; }

        [Required]
        [MaxLength(50)]
        public string HallTicketNumber { get; set; } = string.Empty;

        [Required]
        public DateTime IssuedAt { get; set; } = DateTime.UtcNow;

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Released"; // Released / Revoked

        [MaxLength(500)]
        public string? Remarks { get; set; }

        // Navigation properties
        [ForeignKey(nameof(StudentId))]
        public User Student { get; set; } = null!;

        [ForeignKey(nameof(ExamSeriesId))]
        public ExamSeries ExamSeries { get; set; } = null!;
    }
}
