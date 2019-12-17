using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Memosport.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Memosport.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class IndexCardApiController : BaseApiController
    {
        /// <summary> The database context. </summary>
        private MemosportContext _context;

        public IndexCardApiController(MemosportContext context)
        {
            _context = context;
        }

        /// <summary> (An Action that handles HTTP GET requests) gets data set. </summary>
        /// <remarks> Doetsch, 17.12.19. </remarks>
        /// <param name="box"> Identifier for the box. </param>
        /// <param name="known"> (Optional) True to known. </param>
        /// <param name="order"> (Optional) The order. </param>
        /// <returns> An asynchronous result that yields the data set. </returns>
        [HttpGet("GetDataSet/{boxId}")]
        public async Task<IActionResult> GetDataSet(int boxId, bool known = false, string order = "desc")
        {
            // get current User
            var lUser = base.GetCurrentUser(_context);

            // check if box belongs to user
            var lIndexCardBox = _context.IndexCardBoxes.SingleOrDefault(x => x.Id == boxId);

            // Index Card Box not found
            if (lIndexCardBox == null)
            {
                return NoContent();
            }

            // When box belongs not to the current user, then return forbidden
            if (lIndexCardBox.UserId != lUser.Id)
            {
                // return 403
                return Forbid();
            }

            // get indexcardboxes
            var lQuery = _context.IndexCards.Select(x => x).Where(x => x.IndexCardBoxId == boxId);

            // filter data by options
            if (known == false)
            {
                // add condition
                lQuery = lQuery.Where(x => x.Known < 3);
            }

            // get order
            if (order == "desc")
            {
                lQuery = lQuery.OrderByDescending(x => x.Created);
            }
            else
            {
                lQuery = lQuery.OrderBy(x => x.Created);
            }
            
            // execute sql
            var lResult = await lQuery.ToListAsync();

            return Json(lResult);
        }
    }
}