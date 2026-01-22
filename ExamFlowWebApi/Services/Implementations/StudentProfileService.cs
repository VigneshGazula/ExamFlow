using ExamFlowWebApi.DTO.StudentProfile;
using ExamFlowWebApi.Entities;
using ExamFlowWebApi.Models;
using ExamFlowWebApi.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ExamFlowWebApi.Services.Implementations
{
    public class StudentProfileService : IStudentProfileService
    {
        private readonly ApplicationDbContext _context;

        public StudentProfileService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ProfileStatusResponse> CheckProfileStatusAsync(int userId)
        {
            var profile = await _context.StudentProfiles
                .FirstOrDefaultAsync(p => p.StudentId == userId);

            if (profile == null)
            {
                return new ProfileStatusResponse
                {
                    HasProfile = false,
                    Profile = null
                };
            }

            return new ProfileStatusResponse
            {
                HasProfile = true,
                Profile = MapToResponse(profile)
            };
        }

        public async Task<StudentProfileResponse> CreateProfileAsync(int userId, StudentProfileRequest request)
        {
            // Check if profile already exists
            var existingProfile = await _context.StudentProfiles
                .FirstOrDefaultAsync(p => p.StudentId == userId);

            if (existingProfile != null)
            {
                throw new InvalidOperationException("Student profile already exists");
            }

            // Verify user exists and is a student
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            if (user.Role != "Student")
            {
                throw new InvalidOperationException("Only students can create student profiles");
            }

            // Create new profile
            var profile = new Models.StudentProfile
            {
                StudentId = userId,
                RollNumber = request.RollNumber.Trim(),
                Department = request.Department.Trim(),
                Year = request.Year.Trim(),
                Section = request.Section.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _context.StudentProfiles.Add(profile);
            await _context.SaveChangesAsync();

            return MapToResponse(profile);
        }

        public async Task<StudentProfileResponse?> GetProfileAsync(int userId)
        {
            var profile = await _context.StudentProfiles
                .FirstOrDefaultAsync(p => p.StudentId == userId);

            return profile == null ? null : MapToResponse(profile);
        }

        private StudentProfileResponse MapToResponse(Models.StudentProfile profile)
        {
            return new StudentProfileResponse
            {
                Id = profile.Id,
                StudentId = profile.StudentId,
                RollNumber = profile.RollNumber,
                Department = profile.Department,
                Year = profile.Year,
                Section = profile.Section,
                CreatedAt = profile.CreatedAt
            };
        }
    }
}
