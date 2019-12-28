using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Memosport.Models
{
    /// <summary>
    /// DAtaset about left joined Indexcard and Indexcardbox 
    /// </summary>
    public class SearchResult : ISearchResult
    {
        public IIndexCard IndexCard { get; set; }
        public IIndexCardBox IndexCardBox { get; set; }
    }
}
