function IndexCardBox(pArgs)
{
    var self = this;

    self.id = null; // the id in the database
    self.name = null;
    self.dalyreminder = null;
    self.monthlyreminder = null;

    // run inherited constructor
    self.AutoConstructor(pArgs);
}

// inherit autoconstructor
IndexCardBox.prototype.AutoConstructor = jsLib.AutoConstructor;