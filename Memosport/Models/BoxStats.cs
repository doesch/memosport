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
        public int Learned { get; set; }

        public int PercentLearned {
            get
            {
                var lResult = 0;

                if (TotalCount == 0 || Learned == 0)
                {
                    return lResult;
                }

                return Learned * 100 / TotalCount;
            }
        }
    }
}
