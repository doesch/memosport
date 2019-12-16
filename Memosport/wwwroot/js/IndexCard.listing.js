var IndexCardListing = function()
{
    var self = this;

    // variables
    self.IndexCards = ko.observableArray(); // contains all index cards
    self.SelectedBox = ko.observable(GetCookie(Global.CookiePrefix + '[ict][box]') !== null ? GetCookie(Global.CookiePrefix + '[ict][box]')  : 0); // preallocate select box from cookie
    self.Searchstring = ko.observable('');
    self.ShowHourGlass = ko.observable(false);

    /*
    When selection in box has changed
     */
    self.BoxChanged = function() {

        // save in cookie
        SetCookie(Global.CookiePrefix + '[ict][box]', self.SelectedBox());

        // get box
        self.GetList();
    };

    /*
    Get all Index cards
     */
    self.GetList = function() {

        // empty current list
        self.IndexCards([]);

        // show hour glass
        self.ShowHourGlass(true);

        var lIndexCardBoxId = $();

        $.ajax({
            type: 'get',
            url: '/IndexCard/getlist',
            data: {pBoxId: self.SelectedBox(), pSearchstring: self.Searchstring },
            dataType: 'json',
            success: function(data) {

                // render
                self.IndexCards(data);
            },
            complete: function() {
                self.ShowHourGlass(false);
            }
        });

    };

}

$(document).ready(function() {

    var lIndexCardListing = new IndexCardListing()
    ko.applyBindings(lIndexCardListing);

    // init: get list
    lIndexCardListing.GetList();
});