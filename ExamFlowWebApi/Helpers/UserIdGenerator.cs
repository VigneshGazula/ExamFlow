namespace ExamFlowWebApi.Helpers
{
    public class UserIdGenerator
    {
        public static string GenerateUserId(string role, string lastUserId)
        {
            string prefix = GetPrefixFromRole(role);
            int nextNumber = 1;

            if (!string.IsNullOrEmpty(lastUserId) && lastUserId.StartsWith(prefix))
            {
                // Extract the numeric part from the last UserId
                string numericPart = lastUserId.Substring(prefix.Length);
                if (int.TryParse(numericPart, out int currentNumber))
                {
                    nextNumber = currentNumber + 1;
                }
            }

            // Format: prefix + 6-digit zero-padded number
            return $"{prefix}{nextNumber:D6}";
        }

        private static string GetPrefixFromRole(string role)
        {
            return role.ToLower() switch
            {
                "student" => "st",
                "faculty" => "fc",
                "admin" => "ad",
                "digitizer" => "dg",
                _ => throw new Exception("Invalid role specified")
            };
        }
    }
}
