var jsLib = {};

/*
 * module modal
 */

jsLib.modal = (function() {

    var self = {};

    var m_title;
    var m_stateOpen = false;
    var m_content;
    var m_id;
    var m_width = 450;
    var m_height;
    var m_maxVerticalMargin = 0.1; // vertical pargin in percent

    // templates

    var m_header = '<div class="header">' +
            '<div class="bttn bttn-img bttn-close" onclick="jsLib.modal.close()"></div>' +
            '<span class="title"></span>' +
            '<div class="clearfix"></div>' +
            '</div>';

    var m_footer = null;

    var styleWidth = function()
    {
        // if desired width > window, set width of modal to window width

        if (m_width > $(window).outerWidth())
        {
            m_width = $(window).outerWidth();
        }

        $('#jsLib-modal-window').css({width: m_width + 'px'});

        // set horizontal position
        var lLeft = ($(window).outerWidth() / 2) - (m_width / 2);

        $('#jsLib-modal-window').css({left: lLeft + 'px'});
    };

    // style the height + position
    var styleHeight = function()
    {
        var lMarginTopInPx;

        if (!isNaN(m_height))
        {
            // reduce if greater than viewport
            if (m_height > $(window).height())
                m_height = $(window).height() * (1 - m_maxVerticalMargin);

            // fixed height
            $('#jsLib-modal-window').height(m_height);

            // calculate margin
            lMarginTopInPx = ($(window).height() - $('#jsLib-modal-window').outerHeight()) / 2;
        }
        else
        {
            // full viewport height

            // positon top dependend on width
            // if vertical margin < horizontal maring, vertical margin = horizontal margin
            var lHorizontalMargin = (($(window).width() - $('#jsLib-modal-window').outerWidth()) / 2) / $(window).width();
            var lVerticalMargin = m_maxVerticalMargin > lHorizontalMargin ? lHorizontalMargin : m_maxVerticalMargin;

            // standard
            var lMarginTopInPx = lVerticalMargin * $(window).height();
            m_height = $(window).height() - 2 * lMarginTopInPx;
            $('#jsLib-modal-window').height(m_height + 'px');
        }

        // set margin top as position
        $('#jsLib-modal-window').css({top: (lMarginTopInPx + $(window).scrollTop()) + 'px'});
    };

    var lockScroll = function(pBool)
    {

        if (pBool)
        {
            // lock
            $('body').addClass('stop-scrolling');
            
            // mobile
            $('body').bind('touchmove', function() {
                e.preventDefault()
            });

            // android, IOS
            $('body').unbind('touchmove');
        }
        else
        {
            // unlock
            $('body').removeClass('stop-scrolling');

            // android, IOS
            $('body').bind('touchmove');
        }
    }

    // calculate the height of the content
    var styleContent = function()
    {
        $('#jsLib-modal-content-container').outerHeight(m_height - $('#jsLib-modal-window .header').outerHeight());
    };

    // set the title in titlebar
    self.setTitle = function(pTitle)
    {
        m_title = pTitle;
    };

    self.setId = function(pId) {
        // ToDo: check id pattern: #string
        m_id = pId;
    };

    self.setContent = function(pContent) {
        // ToDo: check id pattern: #string
        m_content = pContent;
    };

    self.setMaxWidth = function(pWidthPx)
    {
        // ToDo: check pattern int% intpx
        m_width = pWidthPx;
    };

    self.setHeight = function(pHeightPx)
    {
        // ToDo: check if numeric
        m_height = pHeightPx;
    }

    self.setHeader = function(pHtmlString)
    {
        /// overwrite by custom html header
        m_header = pHtmlString;
    };

    // open the modal
    self.open = function()
    {
        // lock scrolling
        lockScroll(true);

        //  do only open, if already not open
        if (m_stateOpen)
            throw {type: "NotAllowedException", message: "Lightbox is already open."};

        if ((typeof (m_id) !== 'string' && typeof (m_content) !== 'string') || (typeof (m_id) == 'string' && typeof (m_content) == 'string'))
            throw "Please set either Id (use setId()) or setContent (use setContent()), but not both.";

        // wrap content only if not already exist
        if ($('#jsLib-modal-content-container ' + (m_id || '')).length <= 0)
        {
            // concerning templates with binding: wrap from inner to outer

            // either m_id, then wrap around template of given id, else insert m_content
            if (typeof (m_id) === 'string')
            {
                $(m_id).wrap('<div id="jsLib-modal-content-container"></div>');
            }
            else
            {
                $('body').append('<div id="jsLib-modal-content-container">' + m_content + '</div>');
            }

            $("#jsLib-modal-content-container").wrap('<div id="jsLib-modal-window"></div>');
            $("#jsLib-modal-window").wrap('<div id="jsLib-modal-container" class="jsLib"></div>');

            // add custom templates now
            typeof (m_header) !== 'string' || $("#jsLib-modal-window").prepend(m_header);
            typeof (m_footer) !== 'string' || $("#jsLib-modal-window").appen(m_footer);
        }

        // add title
        $('#jsLib-modal-window .title').html(m_title);

        // show
        m_id || $(m_id).css({display: 'block'}); // if id is set
        //m_content || $('#jsLib-modal-content-container').css({display: 'block'}); // if content is set

        $('#jsLib-modal-container').fadeTo('middle', 1);

        // style width
        styleWidth();

        // style height
        styleHeight();

        // style content
        styleContent();
    };

    // close the modal
    self.close = function() {
        $('#jsLib-modal-container').fadeOut('middle', function() {

            // unlock scroll
            lockScroll(false);

            // reset to default
            m_stateOpen = false;
            m_title;
            m_stateOpen = false;
            m_content = null;
            m_id = null;
            m_width = '450';
            m_height = null;
            m_maxVerticalMargin = 0.1; // vertical pargin in percent		
        });
    };

    return self;

})();

/*
 * module Thread
 */

jsLib.Thread = {};

jsLib.Thread.Run = function(pFunc) {

    setTimeout(pFunc, 0);
};


/*
 * module Cookie
 */

jsLib.Cookie = {};

jsLib.Cookie.Read = function (pName)
{
    // <summary> get a cookie value by name</summary>
    // found code at http://www.w3schools.com/js/js_cookies.asp

    var name = pName + "=";
    var ca = document.cookie.split(';');

    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
    }

    return null;
};

jsLib.Cookie.Write = function (pName, pValue, pExpiresInDays)
{
    // <summary> set a cookie value by name</summary>
    // found code at http://www.w3schools.com/js/js_cookies.asp

    if (typeof pExpiresInDays === 'undefined') {
        pExpiresInDays = 7; // one week by default
    }

    var d = new Date();
    d.setTime(d.getTime() + (pExpiresInDays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = pName + "=" + pValue + "; " + expires;
}


/*
 * module String
 */

jsLib.String = {};

jsLib.String.Format = function (pFormat) {

    // <summary>Equivalent of c#´s String.Format</summary>
    // found code at http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format

    var args = Array.prototype.slice.call(arguments, 1);
    return pFormat.replace(/{(\d+)}/g, function (pMatch, pNumber) {
        return typeof args[pNumber] != 'undefined'
            ? args[pNumber]
            : pMatch;
    });
};

/*
 * module AutoConstructor
 * Extend classes with this function to init all propertis with passed object on new automatically.
 * 1. Inherit this Function in an class via the prototype (e.g. MyClass.prototype.AutoConstructor = jsLib.AutoConstructor)
 * 2. Call this inherited Function on instanciation of the child class and pass the arguments of the class to the inherited function: MyClass = function(pArgs) { this.AutoConstructor(pArgs); };
 */

jsLib.AutoConstructor = function (pArgs) {

    if (typeof pArgs !== 'undefined')
    {
        for (var lAttr in pArgs)
        {
            if (this.hasOwnProperty(lAttr))
            {
                // check if own property is an knockout observable
                if (typeof this[lAttr] === 'function')
                {
                    this[lAttr](pArgs[lAttr]);
                }
                else
                {
                    this[lAttr] = pArgs[lAttr];
                }
            }
        }
    }
}


/**
 * get the "offset top" of the given element in px
 * @param pElement
 * @returns {number}
 * @constructor
 */
jsLib.GetOffsetTopToDocument = function(pElement){

    var lOffsetTop = 0; // return value
    var lCurrentElement = pElement; // the current element handled in the loop

    // loop while parent exists
    while(lCurrentElement)
    {
        // add offset top to offsetParent element
        lOffsetTop += lCurrentElement.offsetTop; // add offset top to the parent element

        // next parent element
        lCurrentElement = lCurrentElement.offsetParent;
    }

    return lOffsetTop;
};

jsLib.Time = {};

/**
 * calculates the time ago.
 * @param date
 * @returns {string}
 * @constructor
 */
jsLib.Time.TimeSince = function(date){

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";

};

/**
 * Calculates the age in months by an passed string
 * @param pDateString
 * @returns {number}
 * @constructor
 */
jsLib.Time.AgeInMonths = function(pDateString) {

    var lToday = new Date();
    var lGivenDate = new Date(pDateString);

    var lGivenDateMonths = (lGivenDate.getFullYear() * 12) + lGivenDate.getMonth();
    var lTodayMonths = (lToday.getFullYear() * 12) + lToday.getMonth();

    return lTodayMonths - lGivenDateMonths;
};

/**
 * Checks if f the given pElement has a parent with an CSS Id
 * @param pTargetElement
 * @param pParentId
 * @constructor
 */
jsLib.TargetHasParent = function(pTargetElement, pParentId) {

    // check if it is the context menu that is clicked
    while(pTargetElement.parentElement != null)
    {
        pTargetElement = pTargetElement.parentElement;

        if(pTargetElement.id === pParentId)
        {
            return true;
        }
    }

    return false;

};