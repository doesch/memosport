using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Memosport.Models;

namespace Memosport.Classes
{
    public static class Helper
    {
        /// <summary> Hash password. </summary>
        /// <remarks> Doetsch, 16.12.19. </remarks>
        /// <param name="pPlainPassword"> The plain password. </param>
        /// <returns> An hash as string. </returns>
        /// Source: https://stackoverflow.com/questions/4181198/how-to-hash-a-password/10402129#10402129
        public static string HashPassword(string pPlainPassword)
        {
            // create the salt value
            byte[] salt;
            new RNGCryptoServiceProvider().GetBytes(salt = new byte[16]);

            // Create the Rfc2898DeriveBytes and get the hash value:
            var pbkdf2 = new Rfc2898DeriveBytes(pPlainPassword, salt, 10000);
            byte[] hash = pbkdf2.GetBytes(20);

            // Combine the salt and password bytes for later use:
            byte[] hashBytes = new byte[36];
            Array.Copy(salt, 0, hashBytes, 0, 16);
            Array.Copy(hash, 0, hashBytes, 16, 20);

            // Turn the combined salt+hash into a string for storage
            string lSavedPasswordHash = Convert.ToBase64String(hashBytes);

            return lSavedPasswordHash;
        }

        /// <summary> Query if 'pEnteredPassword' hashed password matched. </summary>
        /// <remarks> Doetsch, 16.12.19. </remarks>
        /// <param name="pEnteredPassword"> The entered password. </param>
        /// <param name="pHashedPassword">  The hashed password. </param>
        /// <returns> True if it succeeds, false if it fails. </returns>
        /// Source: https://stackoverflow.com/questions/4181198/how-to-hash-a-password/10402129#10402129
        public static bool HashedPasswordMatches(string pEnteredPassword, string pHashedPassword)
        {
            /* Extract the bytes */
            byte[] hashBytes = Convert.FromBase64String(pHashedPassword);
            /* Get the salt */
            byte[] salt = new byte[16];
            Array.Copy(hashBytes, 0, salt, 0, 16);
            /* Compute the hash on the password the user entered */
            var pbkdf2 = new Rfc2898DeriveBytes(pEnteredPassword, salt, 10000);
            byte[] hash = pbkdf2.GetBytes(20);
            /* Compare the results */
            for (int i = 0; i < 20; i++)
            {
                if (hashBytes[i + 16] != hash[i])
                    return false;
            }

            return true;
        }
    }
}
