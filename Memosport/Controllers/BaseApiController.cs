using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Memosport.Data;
using Memosport.Models;
using Microsoft.AspNetCore.Mvc;

namespace Memosport.Controllers
{
    /// <summary> A controller for handling base apis. </summary>
    /// <remarks> Doetsch, 17.12.19. </remarks>
    public class BaseApiController : Controller
    {
        // Get current logged in user
        internal User GetCurrentUser(MemosportContext context)
        {
            var lGuidString = HttpContext.User.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value;
            var lGuid = Guid.Parse(lGuidString);
            var lUser = context.Users.SingleOrDefault(x => x.Guid == lGuid);

            return lUser;
        }
    }
}