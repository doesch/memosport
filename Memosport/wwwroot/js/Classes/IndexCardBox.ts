import tsLib = require("../../lib/tsLib/tsLib");
import * as ko from "../lib/knockout.js";

export class IndexCardBox extends tsLib.HelperBase {
    id: number = null; // the id in the database
    name: string = null;
    userId: number = null;
    dateLastLearned: Date = null; // date when last learned this box
    dateLastLearnedDays: number = null; // last learned this box in days ago
    archived: boolean = false;
    boxStats: IBoxStats = null; // IndexCardBox statistics

    public constructor(pArgs: any) {
        super();
        super.autoConstructor(pArgs);

        // the property dateLastLearned is an date. create object of date if possible.
        if (typeof pArgs !== 'undefined' && pArgs.hasOwnProperty("dateLastLearned") && pArgs.datedateLastLearned !== null) {
            this.dateLastLearned = new Date(pArgs.dateLastLearned);
        }

        // apply box statistics if exists
        if (typeof pArgs !== 'undefined' && pArgs.hasOwnProperty("boxStats") && pArgs.boxStats !== null) {
            this.boxStats = new BoxStats(pArgs.boxStats);
        }
    }
}

// box statistics
export interface IBoxStats {
    totalCount: number;
    unlearned: number;
    percentLearned: number;
}

export interface IBoxStatsGroupedKnown {
    known: number;
    count: number;
}

export class BoxStats extends tsLib.HelperBase implements IBoxStats {
    totalCount: number = null; // total number of index cards
    unlearned: number = null; // number of not learned index cards
    percentLearned: number = null; // number of not learned index cards in %
    boxStatsGroupedKnown: Array<IBoxStatsGroupedKnown> = null;

    public constructor(pArgs: any) {
        super();
        super.autoConstructor(pArgs);

        // apply further statistics if exists
        this.boxStatsGroupedKnown = [];
        if (typeof pArgs !== 'undefined' && pArgs.hasOwnProperty("boxStatsGroupedKnown") && Array.isArray(pArgs.boxStatsGroupedKnown)) {
            for (let i = 0; i < pArgs.boxStatsGroupedKnown.length; i++) {
                let tmp = new BoxStatsGroupedKnown(pArgs.boxStatsGroupedKnown[i]);
                // calculate the % for the size of the bar
                tmp.countPercent = this.totalCount == 0 || null ? 0 : this.totalCount / tmp.count * 100;
                // add groupedKnown to list
                this.boxStatsGroupedKnown.push(tmp);
            }           
        }
    }
}

export class BoxStatsGroupedKnown extends tsLib.HelperBase implements IBoxStatsGroupedKnown {
    known: number = null;
    count: number = null;
    countPercent: number = null;

    public constructor(pArgs: any) {
        super();
        super.autoConstructor(pArgs);
    }
}