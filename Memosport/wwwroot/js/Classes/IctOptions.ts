import tsLib = require("../lib/tsLib/tsLib");

/// <summary> Order of index cards in the trainer </summary>
/// <remarks> Doetsch, 20.12.19. </remarks>
export enum Order {
    Random = 0,
    Newest = 1,
    Oldest = 2
}

// Options for the index card trainer
export class IctOptions extends tsLib.HelperBase {
    
    // if all known index cards should be shown
    known: Boolean = false;

    // the order of the index cards in the trainer 
    order: Order = Order.Random;

    public constructor(pArgs: any) {
        super();
        super.autoConstructor(pArgs);
    }
}