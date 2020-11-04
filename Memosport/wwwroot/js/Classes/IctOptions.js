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
    exports.IctOptions = exports.Order = void 0;
    var Order;
    (function (Order) {
        Order[Order["Random"] = 0] = "Random";
        Order[Order["Newest"] = 1] = "Newest";
        Order[Order["Oldest"] = 2] = "Oldest";
    })(Order = exports.Order || (exports.Order = {}));
    var IctOptions = (function (_super) {
        __extends(IctOptions, _super);
        function IctOptions(pArgs) {
            var _this = _super.call(this) || this;
            _this.known = false;
            _this.order = Order.Random;
            _super.prototype.autoConstructor.call(_this, pArgs);
            return _this;
        }
        return IctOptions;
    }(tsLib.HelperBase));
    exports.IctOptions = IctOptions;
});
//# sourceMappingURL=IctOptions.js.map