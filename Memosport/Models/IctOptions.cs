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
        public Order Order { get; set; } = Order.Oldest;

        /// <summary> Gets or sets the quantity mode. </summary>
        /// <value> The quantity mode. </value>
        public QuantityMode QuantityMode { get; set; } = QuantityMode.Custom;

        /// <summary> Number of cards per learning-block. </summary>
        /// <value> The quantity. </value>
        public int Quantity { get; set; } = 10;

        /// <summary> Gets a value indicating whether the merge learning set. </summary>
        /// <value> True if merge learning set, false if not. </value>
        public bool MergeLearningSet { get; set; } = true;
    }
}
