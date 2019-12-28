using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Memosport.Models
{
    // search result for index cards
    // each object represents an row.
    interface ISearchResult
    {
        public IIndexCard IndexCard { get; set; }

        public IIndexCardBox IndexCardBox { get; set; }
    }
}
