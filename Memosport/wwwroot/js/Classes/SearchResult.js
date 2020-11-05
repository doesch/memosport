define(["require", "exports", "./IndexCard", "./IndexCardBox"], function (require, exports, IndexCard_1, IndexCardBox_1) {
    "use strict";
    exports.__esModule = true;
    var SearchResult = (function () {
        function SearchResult(pArgs) {
            this.IndexCard = null;
            this.IndexCardBox = null;
            this.IndexCard = new IndexCard_1.IndexCard(pArgs.indexCard);
            this.IndexCardBox = new IndexCardBox_1.IndexCardBox(pArgs.indexCardBox);
        }
        return SearchResult;
    }());
    exports.SearchResult = SearchResult;
});
//# sourceMappingURL=SearchResult.js.map