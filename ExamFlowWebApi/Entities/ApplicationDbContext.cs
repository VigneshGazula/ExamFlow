using Microsoft.EntityFrameworkCore;
using ExamFlowWebApi.Models;

namespace ExamFlowWebApi.Entities
{
    public class ApplicationDbContext : DbContext // Ensure ApplicationDbContext inherits from DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) // Call the base class constructor with options
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<StudentProfile> StudentProfiles { get; set; }
        public DbSet<ExamSeries> ExamSeries { get; set; }
        public DbSet<Exam> Exams { get; set; }
        public DbSet<HallTicket> HallTickets { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure one-to-one relationship between User and StudentProfile
            modelBuilder.Entity<User>()
                .HasOne(u => u.StudentProfile)
                .WithOne(sp => sp.Student)
                .HasForeignKey<StudentProfile>(sp => sp.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            // Ensure StudentId is unique (one-to-one relationship)
            modelBuilder.Entity<StudentProfile>()
                .HasIndex(sp => sp.StudentId)
                .IsUnique();

            // Configure StudentProfiles table
            modelBuilder.Entity<StudentProfile>()
                .Property(sp => sp.RollNumber)
                .IsRequired()
                .HasMaxLength(20);

            modelBuilder.Entity<StudentProfile>()
                .Property(sp => sp.Department)
                .IsRequired()
                .HasMaxLength(50);

            modelBuilder.Entity<StudentProfile>()
                .Property(sp => sp.Year)
                .IsRequired()
                .HasMaxLength(10);

            modelBuilder.Entity<StudentProfile>()
                .Property(sp => sp.Section)
                .IsRequired()
                .HasMaxLength(5);

            // Configure ExamSeries
            modelBuilder.Entity<ExamSeries>()
                .Property(es => es.Branches)
                .HasColumnType("jsonb");

            modelBuilder.Entity<ExamSeries>()
                .HasMany(es => es.Exams)
                .WithOne(e => e.ExamSeries)
                .HasForeignKey(e => e.ExamSeriesId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Exam - unique constraint for one exam per branch per date
            modelBuilder.Entity<Exam>()
                .HasIndex(e => new { e.ExamSeriesId, e.Branch, e.ExamDate })
                .IsUnique();

            // Configure HallTicket - unique constraint for one hall ticket per student per exam series
            modelBuilder.Entity<HallTicket>()
                .HasIndex(ht => new { ht.StudentId, ht.ExamSeriesId })
                .IsUnique();

            modelBuilder.Entity<HallTicket>()
                .HasOne(ht => ht.Student)
                .WithMany()
                .HasForeignKey(ht => ht.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<HallTicket>()
                .HasOne(ht => ht.ExamSeries)
                .WithMany()
                .HasForeignKey(ht => ht.ExamSeriesId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
