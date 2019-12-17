namespace Memosport.Models
{
    public class IndexCard
    {
        public int Id { get; set; }

        public int IndexCardBoxId { get; set; }

        public string Question { get; set; }

        public string QuestionImageUrl { get; set; }

        public string QuestionImageFile { get; set; }

        public string QuestionAudioUrl { get; set; }

        public string QuestionAudioFile { get; set; }

        public string Jingle { get; set; }

        public string Answer { get; set; }

        public string AnswerImageUrl { get; set; }

        public string AnswerImageFile { get; set; }

        public string AnswerAudioUrl { get; set; }

        public string AnswerAudioFile { get; set; }

        public string Source { get; set; }

        public int Known { get; set; }

        public bool DeleteQuestionImage { get; set; }

        public bool DeleteAnswerImage { get; set; }

        public bool DeleteQuestionAudio { get; set; }

        public bool DeleteAnswerAudio { get; set; }
    }
}