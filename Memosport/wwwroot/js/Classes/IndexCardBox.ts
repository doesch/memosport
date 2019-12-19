import tsLib = require("../lib/tsLib/tsLib");
import * as ko from "../lib/knockout.js";

export class IndexCardBox extends tsLib.HelperBase
{
    id: number = null; // the id in the database
    name: string = null;
    userId: number = null;

    public constructor(pArgs: any)
    {
        super();
        super.autoConstructor(pArgs);
    }
}