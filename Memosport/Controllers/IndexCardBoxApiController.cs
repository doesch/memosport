using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Memosport.Controllers;
using Memosport.Data;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Memosport.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize]
    public class IndexCardBoxApiController : BaseApiController
    {
        /// <summary> The database context. </summary>
        private MemosportContext _context;

        public IndexCardBoxApiController(MemosportContext context)
        {
            _context = context;
        }

        /// <summary> (An Action that handles HTTP GET requests) indexes the given context. </summary>
        /// <remarks> Doetsch, 17.12.19. </remarks>
        /// <returns> An IActionResult. </returns>
        [HttpGet]
        public async Task<IActionResult> Index()
        {
            // get current User
            var lUser = base.GetCurrentUser(_context);

            // get indexcardboxes
            var lQuery = _context.IndexCardBoxes.OrderBy(x => x.Name).Select(x => x).Where(x => x.UserId == lUser.Id);
            var lResult = await lQuery.ToListAsync();

            return Json(lResult);
        }
    }
}