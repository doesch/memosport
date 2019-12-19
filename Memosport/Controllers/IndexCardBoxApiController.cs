using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Memosport.Controllers;
using Memosport.Data;
using Memosport.Models;
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
            User lUser = base.GetCurrentUser(_context);
            lIndexCardBox.UserId = lUser.Id;

            // set date
            lIndexCardBox.Created = DateTime.UtcNow;
            lIndexCardBox.Modified = DateTime.UtcNow;

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
    }
}