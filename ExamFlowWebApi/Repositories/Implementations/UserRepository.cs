using ExamFlowWebApi.Repositories.Interfaces;
using ExamFlowWebApi.Entities;
using ExamFlowWebApi.Models;

namespace ExamFlowWebApi.Repositories.Implementations
{
    public class UserRepository : IUserRespository
    {
        private readonly ApplicationDbContext _context;
        public UserRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public User GetUserByUserID(string userId)
        {
            return _context.Users.FirstOrDefault(u => u.UserId == userId);
        }

        public User GetUserByEmail(string email)
        {
            return _context.Users.FirstOrDefault(u => u.Email == email);
        }

        public string GetLastUserIdByRole(string role)
        {
            var prefix = role.ToLower() switch
            {
                "student" => "st",
                "faculty" => "fc",
                "admin" => "ad",
                "digitizer" => "dg",
                _ => ""
            };

            if (string.IsNullOrEmpty(prefix))
                return null;

            // Get the last user with this role prefix, ordered by UserId descending
            var lastUser = _context.Users
                .Where(u => u.Role == role && u.UserId.StartsWith(prefix))
                .OrderByDescending(u => u.UserId)
                .FirstOrDefault();

            return lastUser?.UserId;
        }

        public void AddUser(User user)
        {
            _context.Users.Add(user);
        }

        public void Save()
        {
            _context.SaveChanges();
        }
    }
}
