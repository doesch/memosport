var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "../../lib/tsLib/tsLib"], function (require, exports, tsLib) {
    "use strict";
    exports.__esModule = true;
    exports.BoxStats = exports.IndexCardBox = void 0;
    var IndexCardBox = (function (_super) {
        __extends(IndexCardBox, _super);
        function IndexCardBox(pArgs) {
            var _this = _super.call(this) || this;
            _this.id = null;
            _this.name = null;
            _this.userId = null;
            _this.dateLastLearned = null;
            _this.dateLastLearnedDays = null;
            _this.archived = false;
            _this.boxStats = null;
            _super.prototype.autoConstructor.call(_this, pArgs);
            if (typeof pArgs !== 'undefined' && pArgs.hasOwnProperty("dateLastLearned") && pArgs.datedateLastLearned !== null) {
                _this.dateLastLearned = new Date(pArgs.dateLastLearned);
            }
            if (typeof pArgs !== 'undefined' && pArgs.hasOwnProperty("boxStats") && pArgs.boxStats !== null) {
                _this.boxStats = new BoxStats(pArgs.boxStats);
            }
            return _this;
        }
        return IndexCardBox;
    }(tsLib.HelperBase));
    exports.IndexCardBox = IndexCardBox;
    var BoxStats = (function (_super) {
        __extends(BoxStats, _super);
        function BoxStats(pArgs) {
            var _this = _super.call(this) || this;
            _this.totalCount = null;
            _this.unlearned = null;
            _this.percentLearned = null;
            _super.prototype.autoConstructor.call(_this, pArgs);
            return _this;
        }
        return BoxStats;
    }(tsLib.HelperBase));
    exports.BoxStats = BoxStats;
});
//# sourceMappingURL=IndexCardBox.js.map