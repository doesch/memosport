var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "../../lib/tsLib/tsLib"], function (require, exports, tsLib) {
    "use strict";
    exports.__esModule = true;
    exports.IndexCard = void 0;
    var IndexCard = (function (_super) {
        __extends(IndexCard, _super);
        function IndexCard(pArgs) {
            var _this = _super.call(this) || this;
            _this.id = null;
            _this.indexCardBoxId = null;
            _this.question = null;
            _this.questionImageUrl = null;
            _this.questionImageThumbUrl = null;
            _this.questionImageFile = ko.observable(null);
            _this.questionAudioUrl = null;
            _this.questionAudioFile = ko.observable(null);
            _this.jingle = null;
            _this.answer = null;
            _this.answerImageUrl = null;
            _this.answerImageThumbUrl = null;
            _this.answerImageFile = ko.observable(null);
            _this.answerAudioUrl = null;
            _this.answerAudioFile = ko.observable(null);
            _this.source = null;
            _this.known = null;
            _this.modified = null;
            _this.origin = IndexCardOrigin["new"];
            _this.deleteQuestionImage = false;
            _this.deleteAnswerImage = false;
            _this.deleteQuestionAudio = false;
            _this.deleteAnswerAudio = false;
            _super.prototype.autoConstructor.call(_this, pArgs);
            if (_this.id === null) {
                _this.known = 0;
            }
            return _this;
        }
        return IndexCard;
    }(tsLib.HelperBase));
    exports.IndexCard = IndexCard;
    var IndexCardOrigin;
    (function (IndexCardOrigin) {
        IndexCardOrigin[IndexCardOrigin["unknown"] = 0] = "unknown";
        IndexCardOrigin[IndexCardOrigin["new"] = 1] = "new";
        IndexCardOrigin[IndexCardOrigin["learnStack"] = 2] = "learnStack";
        IndexCardOrigin[IndexCardOrigin["searchResult"] = 3] = "searchResult";
    })(IndexCardOrigin || (IndexCardOrigin = {}));
});
//# sourceMappingURL=IndexCard.js.map