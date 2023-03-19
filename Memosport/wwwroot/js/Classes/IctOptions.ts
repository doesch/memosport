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
export const LearnModeOne = {
    known: false,
    order: Order.Oldest,
    quantityMode: QuantityMode.Custom,
    quantity: 20,
    mergeLearningSet: true,
    quantityExactKnown: 3,
};

// options values when user wants to repeat learning
export const LearnModeTwo = {
    known: true,
    order: Order.Oldest,
    quantityMode: QuantityMode.All,
    mergeLearningSet: true,
    quantityExactKnown: 3,
};

export const LearnModeThree = {
    known: true,
    order: Order.Oldest,
    quantityMode: QuantityMode.All,
    mergeLearningSet: true
};

// Options for the index card trainer
export class IctOptions extends tsLib.HelperBase {

    // checkox, if all known index cards should be shown 
    known: boolean = LearnModeOne.known;

    // the order of the index cards in the trainer
    order: Order = LearnModeOne.order;

    // the quantity mode
    quantityMode: QuantityMode = LearnModeOne.quantityMode;

    // the quantity of index cards, when users has selected the QuantityMode.Custom
    quantity: number = LearnModeOne.quantity;

    // if the leraning set should be merged random
    mergeLearningSet: boolean = LearnModeOne.mergeLearningSet;

    // filter all index cards which have exact value of 'known'
    quantityExactKnown: number = LearnModeOne.quantityExactKnown;

    public constructor(pArgs: object) {
        super();
        super.autoConstructor(pArgs);
    }
}