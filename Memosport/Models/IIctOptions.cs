using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Memosport.Models
{
    /// <summary> Order of index cards in the trainer </summary>
    /// <remarks> Doetsch, 20.12.19. </remarks>
    public enum Order
    {
        Random = 0,
        Newest = 1,
        Oldest = 2
    }

    /// <summary> Options for the index card trainer </summary>
    /// <remarks> Doetsch, 20.12.19. </remarks>
    interface IIctOptions
    {
        // if all known index cards should be shown
        bool Known { get; set; }

        // the order of the index cards in the trainer 
        Order Order { get; set; }
    }
}
