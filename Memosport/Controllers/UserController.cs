using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Authentication;
using System.Security.Claims;
using System.Threading.Tasks;
using Memosport.Classes;
using Memosport.Data;
using Memosport.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using static Memosport.Models.User;

namespace Memosport.Controllers
{
    /// <summary> A controller for handling users. </summary>
    /// <remarks> Doetsch, 16.12.19. </remarks>
    public class UserController : Controller
    {
        /// <summary> The context. </summary>
        private readonly MemosportContext _context;

        public UserController(MemosportContext context)
        {
            _context = context;
        }

        /// <summary> (An Action that handles HTTP POST requests) login. </summary>
        /// <remarks> Doetsch, 13.12.19. </remarks>
        /// <returns> An IActionResult. </returns>
        [HttpGet]
        public IActionResult Login()
        {
            return View();
        }

        /// <summary> (An Action that handles HTTP POST requests) login. </summary>
        /// <remarks> Doetsch, 13.12.19. </remarks>
        /// <exception cref="AuthenticationException"> Thrown when an Authentication error condition occurs. </exception>
        /// <param name="email">      The name. </param>
        /// <param name="password">   The password. </param>
        /// <param name="remindUser"> (Optional) Checkbox True to remind user. </param>
        /// <returns> An IActionResult. </returns>
        [HttpPost]
        public async Task<IActionResult> Login(string email, string password, bool remindUser = true)
        {
            // query user by email and password from database
            var lUser = _context.Users.SingleOrDefault(x => x.Email == email);

            if (lUser == null || Helper.HashedPasswordMatches(password, lUser.Password) == false)
            {
                // ToDo: show error
                return View();
            }
            
            // login successful

            // set cookie
            // add user information to the cookie
            var lClaims = new List<Claim>
            {
                new Claim(ClaimTypes.Email, lUser.Email),
                new Claim(ClaimTypes.NameIdentifier, lUser.Guid.ToString()),
                new Claim(ClaimTypes.Role, lUser.Role.ToString()),
            };

            var lClaimsIdentity = new ClaimsIdentity(lClaims, CookieAuthenticationDefaults.AuthenticationScheme); // auth cookie
            var lExpireDate = DateTime.UtcNow.AddDays(Constants.AuthExpireInDays); // date when the login expires

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(lClaimsIdentity),
                new AuthenticationProperties() { 
                    IsPersistent = remindUser,
                    AllowRefresh = true, // Gets or sets if refreshing the authentication session should be allowed.
                    ExpiresUtc = new DateTimeOffset(lExpireDate) // Expire date of login
                });

            return RedirectToAction("Index", "Home");
        }

        /// <summary> (An Action that handles HTTP GET requests) logout. </summary>
        /// <remarks> Doetsch, 13.12.19. </remarks>
        /// <returns> An asynchronous result that yields an IActionResult. </returns>
        [HttpGet]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync();

            return RedirectToAction(nameof(Login));
        }

        ///// <summary> (An Action that handles HTTP POST requests) registers this instance. </summary>
        ///// <remarks> Doetsch, 16.12.19. </remarks>
        ///// <returns> An IActionResult. </returns>
        //[HttpGet]
        //public IActionResult Register()
        //{
        //    return View();
        //}

        //[HttpPost]
        //public async Task<IActionResult> Register(string email, string password, string passwordConfirmation)
        //{
        //    var lEmail = email.Trim();
        //    var lPassword = password.Trim();
        //    var lPasswordConfirmation = passwordConfirmation.Trim();

        //    // ToDo: check format of email address

        //    // ToDo: check if email address exists
        //    if (_context.Users.SingleOrDefault(x => x.Email == lEmail) != null)
        //    {
        //        throw new Exception("Email already exists");
        //    }

        //    // ToDo: check password confirmation
        //    if (lPassword != lPasswordConfirmation)
        //    {
        //        throw new Exception("Your password confirmation does not match!");
        //    }

        //    // ToDo: send email confirmation

        //    // create user
        //    var lUser = new User();
        //    lUser.Email = lEmail;

        //    // create guid
        //    var lGuid = Guid.NewGuid();
        //    lUser.Guid = lGuid;

        //    // hash password
        //    lUser.Password = Helper.HashPassword(lPassword);

        //    // save user
        //    _context.Users.Add(lUser);
        //    await _context.SaveChangesAsync();

        //    // show view
        //    return View();
        //}
    }
}