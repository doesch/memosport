using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using Memosport.Classes;
using Memosport.Controllers;
using Memosport.Data;
using Memosport.Models;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
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
        private IWebHostEnvironment _env;

        public IndexCardBoxApiController(MemosportContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
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

        /// <summary>
        /// Created index card box
        /// </summary>
        /// <param name="indexCardBox"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> Index(IndexCardBox indexCardBox)
        {
            var lIndexCardBox = indexCardBox;

            // ToDo: Validate data

            // add user id
            IUser lUser = base.GetCurrentUser(_context);
            lIndexCardBox.UserId = lUser.Id;

            // set date
            lIndexCardBox.Created = DateTime.UtcNow;
            lIndexCardBox.Modified = DateTime.UtcNow;

            // add Owner
            lIndexCardBox.UserId = lUser.Id;

            // save in database
            _context.IndexCardBoxes.Add(lIndexCardBox);
            await _context.SaveChangesAsync();

            return Json(lIndexCardBox);
        }

        /// <summary>
        /// update indexcardbox
        /// </summary>
        /// <param name="id"></param>
        /// <param name="indexcardbox"></param>
        /// <returns></returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> Index(int id, IndexCardBox indexcardbox)
        {
            var lIndexCardBox = indexcardbox;

            if (id != lIndexCardBox.Id)
            {
                return BadRequest();
            }

            // check if user is owner of the index card
            if (IndexCardBox.UserIsOwnerOfIndexCardBox(id, base.GetCurrentUser(_context), _context) == false)
            {
                return Forbid();
            }

            // set modified date
            lIndexCardBox.Modified = DateTime.UtcNow;

            // set save
            _context.Entry(lIndexCardBox).State = EntityState.Modified;
            _context.SaveChanges();

            return Json(lIndexCardBox);
        }

        // delete
        [HttpDelete("{pId}")]
        // Example URI for DELETE: todos/1
        public async Task<IActionResult> Index(int pId)
        {
            var lIndexCardBox = _context.IndexCardBoxes.Single(x => x.Id == pId);
            
            if (lIndexCardBox == null)
            {
                return NotFound(); // returns an 404 page not found
            }

            IUser lUser = base.GetCurrentUser(_context);

            // check if box belongs to authenticated user
            if (IndexCardBox.UserIsOwnerOfIndexCardBox(pId, lUser, _context) == false)
            {
                return Forbid();
            }

            // delete all index cards and uploads
            // loop all indexcards
            var lIndexCards = _context.IndexCards.Select(x => x).Where(x => x.IndexCardBoxId == pId);
            var lIndexCardsAsList = lIndexCards.ToList<IIndexCard>();
            foreach (IIndexCard lIndexCard in lIndexCardsAsList)
            {
                // removed dependen uploaded files
                IndexCard.RemoveAllUploadedFiles(lIndexCard, _env.WebRootPath);
            }

            // remove all indexcards
            _context.IndexCards.RemoveRange(lIndexCards);
            _context.SaveChanges();

            // remove box
            _context.IndexCardBoxes.Remove(lIndexCardBox);
            _context.SaveChanges();

            return Json(lIndexCardBox);
        }

        /// <summary> (An Action that handles HTTP GET requests) gets the statistics. </summary>
        /// <remarks> Doetsch, 21.01.20. </remarks>
        /// <returns> An asynchronous result that yields the statistics. </returns>
        [HttpGet("getStats")]
        public async Task<IActionResult> GetStats()
        {
            // get current User
            var lUser = base.GetCurrentUser(_context);

            // get indexcardboxes
            var lQuery = _context.IndexCardBoxes.OrderBy(x => x.Name).Select(x => x).Where(x => x.UserId == lUser.Id);
            List<IndexCardBox> lIndexCardBoxes = await lQuery.ToListAsync();

            // now count the stats
            foreach (var lIndexCardBox in lIndexCardBoxes)
            {
                IBoxStats lBoxStats = new BoxStats();

                // count total indexcards
                lBoxStats.TotalCount = _context.IndexCards.Select(x => x).Count(x => x.IndexCardBoxId == lIndexCardBox.Id);
                lBoxStats.Learned = _context.IndexCards.Select(x => x).Count(x => x.IndexCardBoxId == lIndexCardBox.Id && x.Known >= 3);

                // assign stats
                lIndexCardBox.BoxStats = lBoxStats;
            }

            return Json(lIndexCardBoxes);
        }
    }
}