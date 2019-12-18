using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Memosport.Classes;
using Memosport.Data;
using Memosport.Models;
using Microsoft.AspNetCore.Hosting;
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

        private IWebHostEnvironment _env;

        public IndexCardApiController(MemosportContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // select single row
        // Example URI: /ToDos/1
        [HttpGet("{id}")]
        public IActionResult GetSingle(int id)
        {
            var lResult = _context.IndexCards.SingleOrDefault(x => x.Id == id);

            if (lResult == null)
            {
                return NotFound(); // returns an 404 page not found
            }

            // ToDo: check if indexcard belongs to user
            if (UserIsOwnerOfIndexCardBox(lResult) == false)
            {
                return Forbid();
            }

            return Json(lResult);
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

        /// <summary> (An Action that handles HTTP PUT requests) indexes. </summary>
        /// <remarks> Doetsch, 18.12.19. </remarks>
        /// <param name="indexcard"> The indexcard. </param>
        /// <returns> An IActionResult. </returns>
        [HttpPost]
        public async Task<IActionResult> Index([FromForm]IndexCard indexcard)
        {
            var lIndexCard = indexcard;

            // howto upload files: https://docs.microsoft.com/en-us/aspnet/core/mvc/models/file-uploads?view=aspnetcore-3.1#upload-small-files-with-buffered-model-binding-to-physical-storage

            // check if user is owner of the index card
            if (UserIsOwnerOfIndexCardBox(indexcard) == false)
            {
                return Forbid();
            }

            // save uploaded files
            lIndexCard = await HandleUploadedFiles(lIndexCard);

            // save in database
            _context.IndexCards.Add(lIndexCard);
            await _context.SaveChangesAsync();

            // cleanup the indexcard response object
            lIndexCard = CleanupIndexCardResponse(lIndexCard);

            // return created indexcard
            return Json(lIndexCard);
        }

        /// <summary> (An Action that handles HTTP PUT requests) indexes. </summary>
        /// <remarks> Doetsch, 17.12.19. </remarks>
        /// <param name="id">        The identifier. </param>
        /// <param name="indexcard"> The indexcard. </param>
        /// <returns> An IActionResult. </returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> Index(int id, [FromForm]IndexCard indexcard)
        {
            var lIndexCard = indexcard;

            if (id != lIndexCard.Id)
            {
                return BadRequest();
            }

            // check if user is owner of the index card
            if (UserIsOwnerOfIndexCard(lIndexCard) == false)
            {
                return Forbid();
            }

            // save uploaded files
            lIndexCard = await HandleUploadedFiles(lIndexCard);

            // set save
            _context.Entry(lIndexCard).State = EntityState.Modified;
            _context.SaveChanges();

            // cleanup the indexcard response object
            lIndexCard = CleanupIndexCardResponse(lIndexCard);

            return Json(lIndexCard);
        }

        /// <summary> Authenticated User is owner of index card. </summary>
        /// <remarks> Doetsch, 18.12.19. </remarks>
        /// <param name="pIndexCard"> The index card. </param>
        /// <returns> True if it succeeds, false if it fails. </returns>
        private bool UserIsOwnerOfIndexCard(IndexCard pIndexCard)
        {
            var lResult = true;

            // check if indexcard belongs to user
            var lIndexCard = _context.IndexCards.SingleOrDefault(x => x.Id == pIndexCard.Id);

            if (lIndexCard == null)
            {
                lResult = false;
            }
            else
            {
                // request owner by indexcard box
                lResult = UserIsOwnerOfIndexCardBox(lIndexCard);            
                
                // detach
                _context.Entry(lIndexCard).State = EntityState.Detached;
            }
            
            return lResult;
        }

        /// <summary> User is owner of index card box. </summary>
        /// <remarks> Doetsch, 18.12.19. </remarks>
        /// <param name="pIndexCard"> The index card. </param>
        /// <returns> True if it succeeds, false if it fails. </returns>
        private bool UserIsOwnerOfIndexCardBox(IndexCard pIndexCard)
        {
            var lResult = true;

            // get current User
            var lUser = base.GetCurrentUser(_context);

            var lIndexCardBox = _context.IndexCardBoxes.SingleOrDefault(x => x.Id == pIndexCard.IndexCardBoxId);

            if (lIndexCardBox == null)
            {
                lResult = false;
            }
            else
            {
                lResult = lIndexCardBox.UserId == lUser.Id;

                // detach
                _context.Entry(lIndexCardBox).State = EntityState.Detached;
            }

            return lResult;
        }

        /// <summary> Saves an uploaded files. </summary>
        /// <remarks> Doetsch, 18.12.19. </remarks>
        /// <param name="pIndexCard"> The index card. </param>
        /// <returns> An asynchronous result. </returns>
        private async Task<IndexCard> HandleUploadedFiles(IndexCard pIndexCard)
        {
            // get indexcard from database if exists (e.g. for put)
            IndexCard lIndexCard = null;

            if (pIndexCard.Id != null)
            {
                lIndexCard = _context.IndexCards.Single(x => x.Id == pIndexCard.Id);
            }

            // save uploaded files
            if (pIndexCard.QuestionImageFile != null || pIndexCard.DeleteQuestionImage)
            {
                // delete old file if exists
                if (lIndexCard != null)
                {
                    // delete from file system
                    Upload.DeleteFile(lIndexCard.QuestionImageUrl, _env.WebRootPath);
                }

                if (pIndexCard.QuestionImageFile != null)
                {
                    // save new file
                    pIndexCard.QuestionImageUrl = await Upload.SaveImageFile(pIndexCard.QuestionImageFile, _env.WebRootPath);
                }
            }

            if (pIndexCard.AnswerImageFile != null || pIndexCard.DeleteAnswerImage)
            {
                // delete old file if exists
                if (lIndexCard != null)
                {
                    // delete from file system
                    Upload.DeleteFile(lIndexCard.AnswerImageUrl, _env.WebRootPath);
                }

                if (pIndexCard.AnswerImageFile != null)
                {
                    // save new file
                    pIndexCard.AnswerImageUrl = await Upload.SaveImageFile(pIndexCard.AnswerImageFile, _env.WebRootPath);
                }
            }

            if (pIndexCard.QuestionAudioFile != null || pIndexCard.DeleteQuestionAudio)
            {
                // delete old file if exists
                if (lIndexCard != null)
                {
                    // delete from file system
                    Upload.DeleteFile(lIndexCard.QuestionAudioUrl, _env.WebRootPath);
                }

                if (pIndexCard.QuestionAudioFile != null)
                {
                    // save new file
                    pIndexCard.QuestionAudioUrl = await Upload.SaveAudioFile(pIndexCard.QuestionAudioFile, _env.WebRootPath);
                }
            }

            if (pIndexCard.AnswerAudioFile != null || pIndexCard.DeleteAnswerAudio)
            {
                // delete old file if exists
                if (lIndexCard != null)
                {
                    // delete from file system
                    Upload.DeleteFile(lIndexCard.AnswerAudioUrl, _env.WebRootPath);
                }

                // save new file
                if (pIndexCard.AnswerAudioFile != null)
                {
                    pIndexCard.AnswerAudioUrl = await Upload.SaveAudioFile(pIndexCard.AnswerAudioFile, _env.WebRootPath);
                }
            }

            // detach
            if (lIndexCard != null)
            {
                _context.Entry(lIndexCard).State = EntityState.Detached;
            }
            
            return pIndexCard;
        }


        /// <summary> Cleanup index card response. </summary>
        /// <remarks> Doetsch, 18.12.19. </remarks>
        /// <param name="pIndexCard"> The index card. </param>
        /// <returns> An IndexCard. </returns>
        private IndexCard CleanupIndexCardResponse(IndexCard pIndexCard)
        {
            // do not return files to the client
            pIndexCard.QuestionImageFile = null;
            pIndexCard.AnswerAudioFile = null;
            pIndexCard.AnswerImageFile = null;
            pIndexCard.QuestionAudioFile = null;

            return pIndexCard;
        }
    }
}