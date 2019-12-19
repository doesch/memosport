using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Memosport.Models
{
    public interface IUser
    {
        int Id { get; set; }

        /// <summary> Gets or sets the identifier of the user. </summary>
        /// <value> The identifier of the name. </value>
        Guid Guid { get; set; }

        string Email { get; set; }

        /// <summary> Gets or sets the hashed password. </summary>
        /// <value> The password. </value>
        string Password { get; set; }

        // the role of the user
        User.Roles Role { get; set; }
    }
}
