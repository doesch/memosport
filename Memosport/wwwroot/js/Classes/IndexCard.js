function IndexCard(pArgs)
{
    var self = this;

    self.id = null; // the id in the database
    self.index_card_box_id = null;
    self.question = null;
    self.question_image_url = null;
    self.question_image_file = ko.observable(null);
    self.question_audio_url = null;
    self.question_audio_file = ko.observable(null);
    self.jingle = null;
    self.answer = null;
    self.answer_image_url = null;
    self.answer_image_file = ko.observable(null);
    self.answer_audio_url = null;
    self.answer_audio_file = ko.observable(null);
    self.source = null;
    self.known = null;

    // marker to delete images or audio
    self.delete_question_image = false;
    self.delete_answer_image = false;
    self.delete_question_audio = false;
    self.delete_answer_audio = false;

    // run inherited constructor
    self.AutoConstructor(pArgs);

    (function __construct() {

        // pase integer
        self.known = parseInt(self.known);

        // when its a new index card, set known to 0
        if (self.id === null)
        {
            self.known = 0;
        }

    }());
}

// inherit autoconstructor
IndexCard.prototype.AutoConstructor = jsLib.AutoConstructor;