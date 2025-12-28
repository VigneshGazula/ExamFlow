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
