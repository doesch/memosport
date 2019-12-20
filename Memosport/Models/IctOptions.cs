using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Memosport.Models
{
    /// <summary> Options for the trainer </summary>
    /// <remarks> Doetsch, 20.12.19. </remarks>
    public class IctOptions : IIctOptions
    {
        /// <summary> Show known (>3) index cards </summary>
        /// <value> True if known, false if not. </value>
        public bool Known { get; set; } = false; // default: do not show known (>3) index cards 

        /// <summary> Gets or sets the order of the index cards in the trainer </summary>
        /// <value> The order. </value>
        public Order Order { get; set; } = Order.Random; // default is randowm
    }
}
