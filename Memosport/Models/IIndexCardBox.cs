using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Memosport.Models
{
    public interface IIndexCardBox
    {
        int? Id { get; set; }

        int? UserId { get; set; }

        string Name { get; set; }

        bool Archived { get; set; }

        DateTime Created { get; set; }

        DateTime Modified { get; set; }
    }
}
