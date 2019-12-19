using System;
using System.ComponentModel.DataAnnotations.Schema;
using Memosport.Classes;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore.Metadata;

namespace Memosport.Models
{
    public class IndexCard : IIndexCard
    {
        public int? Id { get; set; }

        public int IndexCardBoxId { get; set; }

        public string Question { get; set; }

        public string QuestionImageUrl { get; set; }

        [NotMapped]
        public IFormFile QuestionImageFile { get; set; }

        public string QuestionAudioUrl { get; set; }

        [NotMapped]
        public IFormFile QuestionAudioFile { get; set; }

        public string Jingle { get; set; }

        public string Answer { get; set; }

        public string AnswerImageUrl { get; set; }

        [NotMapped]
        public IFormFile AnswerImageFile { get; set; }

        public string AnswerAudioUrl { get; set; }

        [NotMapped]
        public IFormFile AnswerAudioFile { get; set; }

        public string Source { get; set; }

        public int Known { get; set; }

        [NotMapped]
        public bool DeleteQuestionImage { get; set; }

        [NotMapped]
        public bool DeleteAnswerImage { get; set; }

        [NotMapped]
        public bool DeleteQuestionAudio { get; set; }

        [NotMapped]
        public bool DeleteAnswerAudio { get; set; }

        public DateTime Created { get; set; }

        public DateTime Modified { get; set; }

        /// <summary> Remove all uploaded files. </summary>
        /// <remarks> Doetsch, 19.12.19. </remarks>
        /// <param name="pIndexCard">   . </param>
        /// <param name="pWebRootPath"> Full pathname of the web root file. </param>
        internal static void RemoveAllUploadedFiles(IIndexCard pIndexCard, string pWebRootPath)
        {
            Upload.DeleteFile(pIndexCard.QuestionImageUrl, pWebRootPath);
            Upload.DeleteFile(pIndexCard.AnswerImageUrl, pWebRootPath);
            Upload.DeleteFile(pIndexCard.QuestionAudioUrl, pWebRootPath);
            Upload.DeleteFile(pIndexCard.AnswerAudioUrl, pWebRootPath);
        }
    }
}