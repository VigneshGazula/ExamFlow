using System.Security.Cryptography;
using System.Text;

namespace ExamFlowWebApi.Helpers
{
    public class PasswordService
    {
        private const int SaltSize = 16;   // 128-bit
        private const int KeySize = 32;    // 256-bit
        private const int Iterations = 10000;

        public string HashPassword(string password)
        {
            using var rng = RandomNumberGenerator.Create();
            byte[] salt = new byte[SaltSize];
            rng.GetBytes(salt);

            using var pbkdf2 = new Rfc2898DeriveBytes(
                password,
                salt,
                Iterations,
                HashAlgorithmName.SHA256
            );

            byte[] hash = pbkdf2.GetBytes(KeySize);

            // Store as: iterations.salt.hash
            return $"{Iterations}.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
        }

        public bool VerifyPassword(string password, string storedHash)
        {
            if (string.IsNullOrWhiteSpace(storedHash))
                throw new Exception("Stored password hash is missing.");

            var parts = storedHash.Split('.');
            if (parts.Length != 3)
                throw new Exception("Stored password hash format is invalid.");

            int iterations = int.Parse(parts[0]);
            byte[] salt = Convert.FromBase64String(parts[1]);
            byte[] hash = Convert.FromBase64String(parts[2]);

            using var pbkdf2 = new Rfc2898DeriveBytes(
                password,
                salt,
                iterations,
                HashAlgorithmName.SHA256
            );

            byte[] computedHash = pbkdf2.GetBytes(hash.Length);

            return CryptographicOperations.FixedTimeEquals(hash, computedHash);
        }
    }
}
