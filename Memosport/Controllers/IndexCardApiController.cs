using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using Memosport.Classes;
using Memosport.Data;
using Memosport.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Memosport.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize]
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
            var lIndexCard = _context.IndexCards.SingleOrDefault(x => x.Id == id);

            if (lIndexCard == null)
            {
                return NotFound(); // returns an 404 page not found
            }

            // ToDo: check if indexcard belongs to user
            if (IndexCardBox.UserIsOwnerOfIndexCardBox(lIndexCard.IndexCardBoxId, base.GetCurrentUser(_context), _context) == false)
            {
                return Forbid();
            }

            return Json(lIndexCard);
        }

        /// <summary> (An Action that handles HTTP GET requests) gets data set. </summary>
        /// <remarks> Doetsch, 17.12.19. </remarks>
        /// <param name="boxId">      Identifier for the box. </param>
        /// <param name="ictOptions"> True to known. </param>
        /// <returns> An asynchronous result that yields the data set. </returns>
        [HttpGet("GetDataSet/{boxId}")]
        public async Task<IActionResult> GetDataSet(int boxId, [FromQuery]IctOptions ictOptions)
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
            if (ictOptions.Known == false)
            {
                // add condition
                lQuery = lQuery.Where(x => x.Known < 3);
            }

            // get order
            if (ictOptions.Order == Order.Newest)
            {
                lQuery = lQuery.OrderByDescending(x => x.Created);
            }
            else
            {
                lQuery = lQuery.OrderBy(x => x.Created);
            }
            
            // execute sql
            var lResult = await lQuery.ToListAsync();

            // return dataset
            return Json(lResult);
        }

        /// <summary>
        /// Search index cards
        /// </summary>
        /// <param name="pSearchString"></param>
        /// <returns></returns>
        [HttpGet("search")]
        public async Task<IActionResult> Index(string pSearchString)
        {
            // get current user
            var lCurrentUser = GetCurrentUser(_context);

            // prepare query
            // we need to join index cards and boxes. The joined Record will be converted into an 'SearchResult' object.
            var lQuery = _context.IndexCards
                .Join(
                    _context.IndexCardBoxes,
                    IndexCard => IndexCard.IndexCardBoxId,
                    IndexCardBox => IndexCardBox.Id,
                    (IndexCard, IndexCardBox) => new SearchResult
                    {
                        IndexCard = IndexCard,
                        IndexCardBox = IndexCardBox
                    }
                )
                .OrderBy(x => x.IndexCard.Created)
                .Where(x => x.IndexCardBox.UserId == lCurrentUser.Id) // filter out by current userid
                .Select(x => x)
                // now filter out by searchstring
                .Where(
                    x => x.IndexCard.Question.ToLower().Contains(pSearchString.ToLower()) ||
                    x.IndexCard.Answer.ToLower().Contains(pSearchString.ToLower()) ||
                    x.IndexCard.Jingle.ToLower().Contains(pSearchString.ToLower()) ||
                    x.IndexCard.Source.ToLower().Contains(pSearchString.ToLower())
                );

            // execute query
            var lSearchResult = await lQuery.ToListAsync();

            // return created indexcard
            return Json(lSearchResult);
        }

        /// <summary> (An Action that handles HTTP PUT requests) indexes. </summary>
        /// <remarks> Doetsch, 18.12.19. </remarks>
        /// <param name="indexcard"> The indexcard. </param>
        /// <returns> An IActionResult. </returns>
        [HttpPost]
        public async Task<IActionResult> Index([FromForm]IndexCard indexcard)
        {
            IIndexCard lIndexCard = indexcard;

            // howto upload files: https://docs.microsoft.com/en-us/aspnet/core/mvc/models/file-uploads?view=aspnetcore-3.1#upload-small-files-with-buffered-model-binding-to-physical-storage

            // check if user is owner of the index card
            if (IndexCardBox.UserIsOwnerOfIndexCardBox(indexcard.IndexCardBoxId, base.GetCurrentUser(_context), _context) == false)
            {
                return Forbid();
            }

            // save uploaded files
            lIndexCard = await HandleUploadedFiles(lIndexCard);

            // set date
            lIndexCard.Created = DateTime.UtcNow;
            lIndexCard.Modified = DateTime.UtcNow;

            // save in database
            _context.IndexCards.Add((IndexCard)lIndexCard);
            await _context.SaveChangesAsync();

            // cleanup the indexcard response object
            lIndexCard = CleanupIndexCardResponse(lIndexCard);

            // return created indexcard
            return Json(lIndexCard);
        }

        /// <summary> (An Action that handles HTTP POST requests) makes a deep copy of this instance. </summary>
        /// <remarks> Doetsch, 15.01.20. </remarks>
        /// <param name="indexcard">            The indexcard. </param>
        /// <param name="invertQuestionAnswer"> (Optional) True to invert question answer. </param>
        /// <param name="invertImageFiles">     (Optional) True to invert image files. </param>
        /// <returns> An asynchronous result that yields a copy of this instance. </returns>
        [HttpPost("duplicate")]
        public async Task<IActionResult> Duplicate([FromForm]IndexCard indexcard, [FromQuery]bool invertQuestionAnswer, [FromQuery]bool invertImageFiles)
        {
            // get indexcard from Server
            IIndexCard lIndexCard = _context.IndexCards.SingleOrDefault(x => x.Id == indexcard.Id);

            if (lIndexCard == null)
            {
                return NotFound(); // returns an 404 page not found
            }

            // check if user is owner of the index card
            if (UserIsOwnerOfIndexCard(lIndexCard) == false)
            {
                return Forbid();
            }
            
            // remove id to mark as a new indexcard
            lIndexCard.Id = null;
            
            // copy files
            if (lIndexCard.QuestionImageUrl != null)
            {
                lIndexCard.QuestionImageUrl = Upload.CopyFile(lIndexCard.QuestionImageUrl, _env.WebRootPath);
            }

            if (lIndexCard.AnswerImageUrl != null)
            {
                lIndexCard.AnswerImageUrl = Upload.CopyFile(lIndexCard.AnswerImageUrl, _env.WebRootPath);
            }

            if (lIndexCard.QuestionAudioUrl != null)
            {
                lIndexCard.QuestionAudioUrl = Upload.CopyFile(lIndexCard.QuestionAudioUrl, _env.WebRootPath);
            }

            if (lIndexCard.AnswerAudioUrl != null)
            {
                lIndexCard.AnswerAudioUrl = Upload.CopyFile(lIndexCard.AnswerAudioUrl, _env.WebRootPath);
            }

            // when user wants to invert question/answer
            if (invertQuestionAnswer)
            {
                var lAnswer = lIndexCard.Answer;
                var lQuestion = lIndexCard.Question;

                lIndexCard.Answer = lQuestion;
                lIndexCard.Question = lAnswer;
            }

            // when user wants to invert image files
            if (invertImageFiles)
            {
                var lQuestionImageUrl = lIndexCard.QuestionImageUrl;
                var lAnswerImageUrl = lIndexCard.AnswerImageUrl;

                lIndexCard.QuestionImageUrl = lAnswerImageUrl;
                lIndexCard.AnswerImageUrl = lQuestionImageUrl;
            }

            // reset the stats to 0
            lIndexCard.Known = 0;

            // update created and updated time
            lIndexCard.Created = DateTime.UtcNow;
            lIndexCard.Modified = DateTime.UtcNow;

            // save in database
            _context.IndexCards.Add((IndexCard)lIndexCard);
            await _context.SaveChangesAsync();


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
            IIndexCard lIndexCard = indexcard;

            if (id != lIndexCard.Id)
            {
                return BadRequest();
            }

            // check if user is owner of the index card
            if (UserIsOwnerOfIndexCard(lIndexCard) == false)
            {
                return Forbid();
            }

            // check inconsistency by change date. Change-Date in PUT-Request should match the change date in the database
            // currently not working because PUT converts datetime in payload to Local time
            //var lIndexCardInDB = _context.IndexCards.SingleOrDefault(x => x.Id == id);

            //if (lIndexCardInDB == null || lIndexCardInDB.Modified != indexcard.Modified)
            //{
            //    return Conflict(); // returns an 409 conflic because of inconsistency
            //}

            // save uploaded files
            lIndexCard = await HandleUploadedFiles(lIndexCard);

            // set datelastlearned in box when user has learned the index card (Indicator: user has pushed buttons known/unknown)
            SetDateLastLearned(lIndexCard);

            // set modified date
            lIndexCard.Modified = DateTime.UtcNow;
            
            // set save
            _context.Entry(lIndexCard).State = EntityState.Modified;
            _context.Entry(lIndexCard).Property(x => x.Created).IsModified = false; // do not modify create date. The create date is an constant value.
            _context.SaveChanges();

            // cleanup the indexcard response object
            lIndexCard = CleanupIndexCardResponse(lIndexCard);

            return Json(lIndexCard);
        }

        /// <summary> Sets date last learned. </summary>
        /// <remarks> Doetsch, 07.02.20. </remarks>
        /// <param name="pIndexCard"> The index card. </param>
        private void SetDateLastLearned(IIndexCard pIndexCard)
        {
            // set datelastlearned in box when user has learned the index card(Indicator: user has pushed buttons known / unknown)
            // get from database
            var lIndexCard = _context.IndexCards.Single(x => x.Id == pIndexCard.Id);

            if (lIndexCard != null)
            {
                // check if value 'known' has changed
                if (pIndexCard.Known != lIndexCard.Known)
                {
                    // update value in box
                    var lIndexCardBox = _context.IndexCardBoxes.Single(x => x.Id == pIndexCard.IndexCardBoxId);
                    lIndexCardBox.DateLastLearned = DateTime.UtcNow;
                    _context.Entry(lIndexCardBox).State = EntityState.Modified;
                    _context.SaveChanges();

                    // detach
                    _context.Entry(lIndexCardBox).State = EntityState.Detached;
                }

                // detach
                _context.Entry(lIndexCard).State = EntityState.Detached;
            }
        }

        // delete
        [HttpDelete("{pId}")]
        // Example URI for DELETE: todos/1
        public IActionResult Index(int pId)
        {
            var lIndexCard = _context.IndexCards.Single(x => x.Id == pId);

            if (lIndexCard == null)
            {
                return NotFound(); // returns an 404 page not found
            }

            // checkk if index card belongs to user
            if (UserIsOwnerOfIndexCard(lIndexCard) == false)
            {
                return Forbid();
            }

            // remove uploaded files
            IndexCard.RemoveAllUploadedFiles(lIndexCard, _env.WebRootPath);

            _context.Remove(lIndexCard);
            _context.SaveChanges();

            return Json(lIndexCard);
        }

        /// <summary> (An Action that handles HTTP GET requests) gets latest sources. </summary>
        /// <remarks> Doetsch, 03.01.20. </remarks>
        /// <returns> An asynchronous result that yields the latest sources. </returns>
        [HttpGet("GetLatestSources")]
        public IActionResult GetLatestSources()
        {
            IUser lCurrentUser = GetCurrentUser(_context);
            
            // get the box ids, belonging to the user
            var lBoxIds = _context.IndexCardBoxes.Where(x => x.UserId == lCurrentUser.Id).Select(x => x.Id).ToList();

            // now query the sources.
            var lResult = _context.IndexCards.Where(x => lBoxIds.Contains(x.IndexCardBoxId) && x.Source != null && x.Source != string.Empty).OrderByDescending(z => z.Created).Select(x => x.Source).ToList().Distinct().Take(3).ToList();

            return Json(lResult);
        }

        /// <summary> (An Action that handles HTTP GET requests) gets latest sources. </summary>
        /// <remarks> Doetsch, 03.01.20. </remarks>
        /// <returns> An asynchronous result that yields the latest sources. </returns>
        [HttpGet("Translate")]
        public async Task<IActionResult> Translate(Language pCurrentLang, Language pTargetLang, string pText)
        {
            return Json(await Deepl.Translate(pCurrentLang, pTargetLang, pText));
        }

        /// <summary> Authenticated User is owner of index card. </summary>
        /// <remarks> Doetsch, 18.12.19. </remarks>
        /// <param name="pIndexCard"> The index card. </param>
        /// <returns> True if it succeeds, false if it fails. </returns>
        private bool UserIsOwnerOfIndexCard(IIndexCard pIndexCard)
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
                var lUser = base.GetCurrentUser(_context);
                lResult = IndexCardBox.UserIsOwnerOfIndexCardBox(lIndexCard.IndexCardBoxId, lUser, _context);            
                
                // detach
                _context.Entry(lIndexCard).State = EntityState.Detached;
            }
            
            return lResult;
        }



        /// <summary> Saves an uploaded files. </summary>
        /// <remarks> Doetsch, 18.12.19. </remarks>
        /// <param name="pIndexCard"> The index card. </param>
        /// <returns> An asynchronous result. </returns>
        private async Task<IIndexCard> HandleUploadedFiles(IIndexCard pIndexCard)
        {
            // get indexcard from database if exists (e.g. for put)
            IIndexCard lIndexCard = null;

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

                // reset flag to default
                pIndexCard.DeleteQuestionImage = false;
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

                // reset flag to default
                pIndexCard.DeleteAnswerImage = false;
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

                // reset flag to default
                pIndexCard.DeleteQuestionAudio = false;
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

                // reset flag to default
                pIndexCard.DeleteAnswerAudio = false;
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
        private IIndexCard CleanupIndexCardResponse(IIndexCard pIndexCard)
        {
            // do not return files to the client
            pIndexCard.QuestionImageFile = null;
            pIndexCard.AnswerAudioFile = null;
            pIndexCard.AnswerImageFile = null;
            pIndexCard.QuestionAudioFile = null;

            return pIndexCard;
        }

        ///// <summary> Creates thumbnails for all images. </summary>
        ///// <remarks> Doetsch, 20.03.20. </remarks>
        /////  ToDo: Delete this code when done.
        //[HttpGet("CreateThumbnailsForAllImages")]
        //public void CreateThumbnailsForAllImages()
        //{
        //    Upload.CreateThumbnailsForAllImages(_env.WebRootPath);
        //}
    }
}