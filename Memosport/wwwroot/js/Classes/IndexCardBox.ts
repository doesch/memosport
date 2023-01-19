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
    boxStatsGroupedKnown: Array<BoxStatsGroupedKnown>;
}

export interface IBoxStatsGroupedKnown {
    known: number;
    count: number;
    countPercent: number;
}

export class BoxStats extends tsLib.HelperBase implements IBoxStats {
    totalCount: number = null; // total number of index cards
    boxStatsGroupedKnown: Array<BoxStatsGroupedKnown> = null;

    public constructor(pArgs: any) {
        super();
        super.autoConstructor(pArgs);

        // apply further statistics if exists
        this.boxStatsGroupedKnown = [];
        if (typeof pArgs !== 'undefined' && pArgs.hasOwnProperty("boxStatsGroupedKnown") && Array.isArray(pArgs.boxStatsGroupedKnown)) {
            for (let i = 0; i < pArgs.boxStatsGroupedKnown.length; i++) {
                let tmp = new BoxStatsGroupedKnown(pArgs.boxStatsGroupedKnown[i]);
                // add groupedKnown to list
                this.boxStatsGroupedKnown.push(tmp);
            }
            // sum up the first 3 known values
            let tmpBoxStatsKnown = new BoxStatsGroupedKnown({known: 0, count: 0});
            for (let i = this.boxStatsGroupedKnown.length - 1; i >= 0; i--) {
                if (this.boxStatsGroupedKnown[i].known < 3) {
                    tmpBoxStatsKnown.count += this.boxStatsGroupedKnown[i].count;
                    // remove from List
                    this.boxStatsGroupedKnown.splice(i, 1);
                }
            }
            // add to list
            if (tmpBoxStatsKnown.count > 0) {
                this.boxStatsGroupedKnown.push(tmpBoxStatsKnown);
            }
            // calculate the % for the size of the bar
            for (let i = 0; i < this.boxStatsGroupedKnown.length; i++) {
                this.boxStatsGroupedKnown[i].countPercent = this.totalCount == 0 || this.totalCount == null ? 0 : this.boxStatsGroupedKnown[i].count * 100 / this.totalCount;
            }
            // sort list
            this.boxStatsGroupedKnown.sort((a, b) => a.known - b.known);
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