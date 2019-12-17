using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Memosport.Data;
using Memosport.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Memosport.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize]
    public class IndexCardApiController : Controller
    {
        private readonly MemosportContext _context;

        // set context
        public IndexCardApiController(MemosportContext context)
        {
            _context = context;
        }

        [HttpGet("{pBoxId}")]
        public IActionResult Index(int pBoxId)
        {
            //var lResult = _context.IndexCards.Find<IndexCard>(x => x.IndexCardBoxId == pBoxId);

            //if (lResult == null)
            //{
            //    return NotFound(); // returns an 404 page not found
            //}

            //return Json(lResult);
            return null;
        }
    }
}