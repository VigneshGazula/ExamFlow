using ExamFlowWebApi.Models;

namespace ExamFlowWebApi.Repositories.Interfaces
{
    public interface IUserRespository
    {
        User GetUserByUserID(string userId);
        User GetUserByEmail(string email);
        string GetLastUserIdByRole(string role);
        void AddUser(User user);
        void Save();
    }
}
