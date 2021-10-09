import tsLib = require("../../lib/tsLib/tsLib");

/// <summary> Order of index cards in the trainer </summary>
/// <remarks> Doetsch, 20.12.19. </remarks>
export enum Order {
    Random = 0,
    Newest = 1,
    Oldest = 2
}

/// <summary> Values that represent quantity modes. </summary>
/// <remarks> Doetsch, 09.10.2021. </remarks>
export enum QuantityMode {
    Custom = 0,
    All = 1
}

// Options for the index card trainer
export class IctOptions extends tsLib.HelperBase {
    
    // if all known index cards should be shown
    known: Boolean = false;

    // the order of the index cards in the trainer 
    order: Order = Order.Oldest;

    // the quantity mode
    quantityMode: QuantityMode = QuantityMode.Custom;

    // the quantity of index cards, when users has selected the QuantityMode.Custom
    quantity: Number = 10; 

    public constructor(pArgs: any) {
        super();
        super.autoConstructor(pArgs);
    }
}