using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Memosport.Models
{
    public interface IIndexCard
    {
        int? Id { get; set; }

        int IndexCardBoxId { get; set; }

        string Question { get; set; }

        string QuestionImageUrl { get; set; }

        [NotMapped]
        IFormFile QuestionImageFile { get; set; }

        string QuestionAudioUrl { get; set; }

        [NotMapped]
        IFormFile QuestionAudioFile { get; set; }

        string Jingle { get; set; }

        string Answer { get; set; }

        string AnswerImageUrl { get; set; }

        [NotMapped]
        IFormFile AnswerImageFile { get; set; }

        string AnswerAudioUrl { get; set; }

        [NotMapped]
        IFormFile AnswerAudioFile { get; set; }

        string Source { get; set; }

        int Known { get; set; }

        [NotMapped]
        bool DeleteQuestionImage { get; set; }

        [NotMapped]
        bool DeleteAnswerImage { get; set; }

        [NotMapped]
        bool DeleteQuestionAudio { get; set; }

        [NotMapped]
        bool DeleteAnswerAudio { get; set; }

        DateTime Created { get; set; }

        DateTime Modified { get; set; }
    }
}
