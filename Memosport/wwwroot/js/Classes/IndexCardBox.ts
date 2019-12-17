import tsLib = require("../lib/tsLib/tsLib");
import * as ko from "../lib/knockout.js";

class IndexCardBox extends tsLib.HelperBase
{
    id: number = null; // the id in the database
    name: string = null;
    dalyreminder: any = null;
    monthlyreminder: any = null;

    public constructor(pArgs: any)
    {
        super();
        super.autoConstructor(pArgs);
    }
}