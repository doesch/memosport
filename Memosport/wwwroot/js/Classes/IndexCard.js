var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "../lib/tsLib/tsLib"], function (require, exports, tsLib) {
    "use strict";
    exports.__esModule = true;
    var IndexCard = (function (_super) {
        __extends(IndexCard, _super);
        function IndexCard(pArgs) {
            var _this = _super.call(this) || this;
            _this.id = null;
            _this.index_card_box_id = null;
            _this.question = null;
            _this.question_image_url = null;
            _this.question_image_file = ko.observable(null);
            _this.question_audio_url = null;
            _this.question_audio_file = ko.observable(null);
            _this.jingle = null;
            _this.answer = null;
            _this.answer_image_url = null;
            _this.answer_image_file = ko.observable(null);
            _this.answer_audio_url = null;
            _this.answer_audio_file = ko.observable(null);
            _this.source = null;
            _this.known = null;
            _this.delete_question_image = false;
            _this.delete_answer_image = false;
            _this.delete_question_audio = false;
            _this.delete_answer_audio = false;
            _super.prototype.autoConstructor.call(_this, pArgs);
            if (_this.id === null) {
                _this.known = 0;
            }
            return _this;
        }
        return IndexCard;
    }(tsLib.HelperBase));
    exports.IndexCard = IndexCard;
});
//# sourceMappingURL=IndexCard.js.map