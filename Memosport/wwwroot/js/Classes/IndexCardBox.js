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
    var IndexCardBox = (function (_super) {
        __extends(IndexCardBox, _super);
        function IndexCardBox(pArgs) {
            var _this = _super.call(this) || this;
            _this.id = null;
            _this.name = null;
            _this.dalyreminder = null;
            _this.monthlyreminder = null;
            _super.prototype.autoConstructor.call(_this, pArgs);
            return _this;
        }
        return IndexCardBox;
    }(tsLib.HelperBase));
});
//# sourceMappingURL=IndexCardBox.js.map