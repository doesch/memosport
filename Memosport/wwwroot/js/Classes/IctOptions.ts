import tsLib = require("../../lib/tsLib/tsLib");

/// <summary> Order of index cards in the trainer </summary>
/// <remarks> Doetsch, 20.12.19. </remarks>
export enum Order {
    Oldest = 0,
    Newest = 1
}

/// <summary> Values that represent quantity modes. </summary>
/// <remarks> Doetsch, 09.10.2021. </remarks>
export enum QuantityMode {
    Custom = 0,
    All = 1
}

// the default option values
export const DefaultOptionValues = {
    known: false,
    order: Order.Oldest,
    quantityMode: QuantityMode.Custom,
    quantity: 20,
    mergeLearningSet: true,
    quantityExactKnown: 3,
};

// Options for the index card trainer
export class IctOptions extends tsLib.HelperBase {

    // if all known index cards should be shown
    known: Boolean = DefaultOptionValues.known;

    // the order of the index cards in the trainer
    order: Order = DefaultOptionValues.order;

    // the quantity mode
    quantityMode: QuantityMode = DefaultOptionValues.quantityMode;

    // the quantity of index cards, when users has selected the QuantityMode.Custom
    quantity: Number = DefaultOptionValues.quantity;

    // if the leraning set should be merged random
    mergeLearningSet: Boolean = DefaultOptionValues.mergeLearningSet;

    // filter all index cards which have exact value of 'known'
    quantityExactKnown: Number = DefaultOptionValues.quantityExactKnown;

    public constructor(pArgs: any) {
        super();
        super.autoConstructor(pArgs);
    }
}