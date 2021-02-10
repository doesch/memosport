using Memosport.Data;
using Memosport.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Memosport.Controllers
{
    /// <summary> public access (no authentication required). </summary>
    /// <remarks> Doetsch, 10.02.2021. </remarks>
    [Route("[controller]")]
    [ApiController]
    public class OpenApiController : BaseApiController
    {
        /// <summary> The database context. </summary>
        private MemosportContext _context;

        public OpenApiController(MemosportContext context)
        {
            _context = context;
        }

        /// <summary> (An Action that handles HTTP GET requests) master system. </summary>
        /// <remarks> Doetsch, 10.02.2021. </remarks>
        /// <returns> An asynchronous result that yields an IActionResult. </returns>
        [HttpGet("MasterSystem")]
        public async Task<IActionResult> MasterSystem()
        {
            var lBoxId = 20;

            // get indexcardboxes of the master system
            var lQuery = _context.IndexCards.Select(x => x).Where(x => x.IndexCardBoxId == lBoxId && x.Id <= 1220).OrderBy(x => x.Question);
            var lResult = await lQuery.ToListAsync();

            return Json(lResult);
        }
    }
}
