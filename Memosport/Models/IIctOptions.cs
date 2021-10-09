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

    /// <summary> Number of cards per learning-block. </summary>
    /// <remarks> Doetsch, 09.10.2021. </remarks>
    public enum QuantityMode
    { 
        Custom = 0,
        All = 1
    }

    /// <summary> Options for the index card trainer </summary>
    /// <remarks> Doetsch, 20.12.19. </remarks>
    interface IIctOptions
    {
        // if all known index cards should be shown
        bool Known { get; set; }

        // the order of the index cards in the trainer 
        Order Order { get; set; }

        /// <summary> Gets or sets the quantity mode. </summary>
        /// <value> The quantity mode. </value>
        QuantityMode QuantityMode { get; set; }

        /// <summary> Number of cards per learning-block. </summary>
        /// <value> The quantity. </value>
        int Quantity { get; set; }
    }
}
