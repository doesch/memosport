﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Memosport.Models
{
    public interface IBoxStats
    {
        // total count of index cards in an box
        int TotalCount { get; set; }

        List<IBoxStatsGroupedKnown> BoxStatsGroupedKnown { get; set; }
    }
}
