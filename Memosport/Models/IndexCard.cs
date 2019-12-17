using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Memosport.Models
{
    public class IndexCard
    {
        public int Id { get; set; }

        public int IndexCardBoxId { get; set; }

        public string Question { get; set; }

        public string QuestionImageUrl { get; set; }

        [NotMapped]
        public string QuestionImageFile { get; set; }

        public string QuestionAudioUrl { get; set; }

        [NotMapped]
        public string QuestionAudioFile { get; set; }

        public string Jingle { get; set; }

        public string Answer { get; set; }

        public string AnswerImageUrl { get; set; }

        [NotMapped]
        public string AnswerImageFile { get; set; }

        public string AnswerAudioUrl { get; set; }

        [NotMapped]
        public string AnswerAudioFile { get; set; }

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
    }
}