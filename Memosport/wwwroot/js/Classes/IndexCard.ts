// the MyClass.ts which uses also knockout:
import tsLib = require("../lib/tsLib/tsLib");
// import * as ko from "../lib/knockout.js";

/// <summary> An index card. </summary>
/// <remarks> Doetsch, 17.12.19. </remarks>
class IndexCard extends tsLib.HelperBase
{
    id: number = null;
    index_card_box_id: number = null;
    question: string = null;
    question_image_url: string = null;
    question_image_file: KnockoutObservable<any> = ko.observable(null);
    question_audio_url: string = null;
    question_audio_file: KnockoutObservable<any> = ko.observable(null);
    jingle: string = null;
    answer: string = null;
    answer_image_url: string = null;
    answer_image_file: KnockoutObservable<any> = ko.observable(null);
    answer_audio_url: string = null;
    answer_audio_file: KnockoutObservable<any> = ko.observable(null);
    source: string = null;
    known: number = null;

    // marker to delete images or audio
    delete_question_image: boolean = false;
    delete_answer_image: boolean = false;
    delete_question_audio: boolean = false;
    delete_answer_audio: boolean = false;

    public constructor(pArgs: any) {
        super();
        super.autoConstructor(pArgs);

        // pase integer
        // this.known = parseInt(this.known);

        // when its a new index card, set known to 0
        if (this.id === null) {
            this.known = 0;
        }
    }
}