import tsLib = require("../../lib/tsLib/tsLib");
import { IndexCard } from "./IndexCard";
import { IndexCardBox } from "./IndexCardBox";

export class SearchResult
{
    public IndexCard: IndexCard = null;
    public IndexCardBox: IndexCardBox = null;

    public constructor(pArgs: any) {
        // map arguments
        this.IndexCard = new IndexCard(pArgs.indexCard);
        this.IndexCardBox = new IndexCardBox(pArgs.indexCardBox);
    }
}