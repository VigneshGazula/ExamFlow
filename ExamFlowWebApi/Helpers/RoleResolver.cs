namespace ExamFlowWebApi.Helpers
{
    public class RoleResolver
    {
        public static string GetRoleFromUserId(string userId)
        {
            if (userId.ToLower().StartsWith("st")) return "Student";
            if (userId.ToLower().StartsWith("fc")) return "Faculty";
            if (userId.ToLower().StartsWith("ad")) return "Admin";
            if (userId.ToLower().StartsWith("dg")) return "Digitizer";

            throw new Exception("Invalid User ID format");
        }
    }
}
