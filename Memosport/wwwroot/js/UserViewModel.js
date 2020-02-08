var GLOBAL = {};

requirejs(["lib/tsLib/tsLib"], function (tsLib) {

    // init knockout
    (function () {

        /// <summary>JavaScript Init Settings</summary>

        ///
        /// when document is ready, init ViewModel
        /// 
        GLOBAL.UserViewModel = new UserViewModel();
        ko.applyBindings(GLOBAL.UserViewModel);

        // init the app
        GLOBAL.UserViewModel.Init();

    }());

    // my viewmodel
    function UserViewModel() {

        let self = this;

        /**
         * Init the app
         * @constructor
         */
        self.Init = function () {

            // set focus into input field
            document.getElementById("login-input-email").focus();
        }; 

        // user clicked on login
        self.loginClick = function () {

            new tsLib.Sandtimer().show();

        };
    }
});