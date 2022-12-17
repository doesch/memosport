// the MyClass.ts which uses also knockout:
import tsLib = require("../../lib/tsLib/tsLib");
// import * as ko from "../lib/knockout.js";

/// <summary> An index card. </summary>
/// <remarks> Doetsch, 17.12.19. </remarks>
export class IndexCard extends tsLib.HelperBase {
    id: number = null;
    indexCardBoxId: number = null;
    question: string = null;
    questionImageUrl: string = null;
    questionImageThumbUrl: string = null;
    questionImageFile: KnockoutObservable<any> = ko.observable(null);
    questionAudioUrl: string = null;
    questionAudioFile: KnockoutObservable<any> = ko.observable(null);
    jingle: string = null;
    answer: string = null;
    answerImageUrl: string = null;
    answerImageThumbUrl: string = null;
    answerImageFile: KnockoutObservable<any> = ko.observable(null);
    answerAudioUrl: string = null;
    answerAudioFile: KnockoutObservable<any> = ko.observable(null);
    source: string = null;
    known: number = null;
    modified: Date = null;

    // marker to delete images or audio
    deleteQuestionImage: boolean = false;
    deleteAnswerImage: boolean = false;
    deleteQuestionAudio: boolean = false;
    deleteAnswerAudio: boolean = false;

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