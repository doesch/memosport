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
    exports.IctOptions = exports.QuantityMode = exports.Order = void 0;
    var Order;
    (function (Order) {
        Order[Order["Oldest"] = 0] = "Oldest";
        Order[Order["Newest"] = 1] = "Newest";
    })(Order = exports.Order || (exports.Order = {}));
    var QuantityMode;
    (function (QuantityMode) {
        QuantityMode[QuantityMode["Custom"] = 0] = "Custom";
        QuantityMode[QuantityMode["All"] = 1] = "All";
    })(QuantityMode = exports.QuantityMode || (exports.QuantityMode = {}));
    var IctOptions = (function (_super) {
        __extends(IctOptions, _super);
        function IctOptions(pArgs) {
            var _this = _super.call(this) || this;
            _this.known = false;
            _this.order = Order.Oldest;
            _this.quantityMode = QuantityMode.Custom;
            _this.quantity = 10;
            _this.mergeLearningSet = true;
            _this.quantityExactKnown = 3;
            _super.prototype.autoConstructor.call(_this, pArgs);
            return _this;
        }
        return IctOptions;
    }(tsLib.HelperBase));
    exports.IctOptions = IctOptions;
});
//# sourceMappingURL=IctOptions.js.map