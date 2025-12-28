using ExamFlowWebApi.Models;

namespace ExamFlowWebApi.Repositories.Interfaces
{
    public interface IUserRespository
    {
        User GetUserByUserID(string userId);
        void AddUser(User user);
        void Save();

    }
}
