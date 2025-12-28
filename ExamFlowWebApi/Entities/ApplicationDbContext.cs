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
    }
}
