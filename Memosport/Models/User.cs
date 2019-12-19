using Memosport.Classes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Memosport.Models
{
    public class User
    {
        // all possible roles
        public enum Roles { 
            Default = 0,
            Administrator = 1
        }
        
        public int Id { get; set; }

        /// <summary> Gets or sets the identifier of the user. </summary>
        /// <value> The identifier of the name. </value>
        public Guid Guid { get; set; }

        public string Email { get; set; }

        /// <summary> Gets or sets the hashed password. </summary>
        /// <value> The password. </value>
        public string Password { get; set; }

        // the role of the user
        public Roles Role { get; set; }
    }
}
