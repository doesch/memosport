using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Memosport.Models
{
    /// <summary> A box statistics. </summary>
    /// <remarks> Doetsch, 21.01.20. </remarks>
    public class BoxStats : IBoxStats
    {
        public int TotalCount { get; set; }

        // count of not learned cards
        public int Unlearned { get; set; }

        public int PercentLearned {
            get
            {
                var lResult = 0;

                if (TotalCount == 0 || Unlearned == 0)
                {
                    return lResult;
                }

                return (TotalCount - Unlearned) * 100 / TotalCount;
            }
        }

        public List<IBoxStatsGroupedKnown> BoxStatsGroupedKnown { get; set; }
    }
}
