import tsLib = require("../lib/tsLib/tsLib");
import * as ko from "../lib/knockout.js";

export class IndexCardBox extends tsLib.HelperBase
{
    id: number = null; // the id in the database
    name: string = null;
    userId: number = null;
    dateLastLearned: Date = null;
    archived: boolean = null;
    boxStats: IBoxStats = null; // IndexCardBox statistics
    
    public constructor(pArgs: any)
    {
        super();
        super.autoConstructor(pArgs);

        // the property dateLastLearned is an date. create object of date if possible.
        if (pArgs.hasOwnProperty("dateLastLearned") && pArgs.datedateLastLearned !== null) {
            this.dateLastLearned = new Date(pArgs.datedateLastLearned);
        }

        // apply box statistics if exists
        if (pArgs.hasOwnProperty("boxStats") && pArgs.boxStats !== null) {
            this.boxStats = new BoxStats(pArgs.boxStats);
        }
    }
}

// box statistics
export interface IBoxStats {
    totalCount: number;
    learned: number;
    percentLearned: number;
}

// box statistics
export class BoxStats extends tsLib.HelperBase implements IBoxStats 
{
    totalCount: number = null; // total number of index cards
    learned: number = null; // number of learned index cards
    percentLearned: number = null; // number of not learned index cards in %

    public constructor(pArgs: any) {
        super();
        super.autoConstructor(pArgs);
    }
}