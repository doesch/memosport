﻿var GLOBAL = {};

requirejs(["lib/tsLib/tsLib", "Classes/IndexCard", "Classes/IndexCardBox"], function (tsLib, indexCard, indexCardBox) {

    // init knockout
    (function () {

        /// <summary>JavaScript Init Settings</summary>

        ///
        /// when document is ready, init ViewModel
        /// 
        GLOBAL.MainViewModel = new MainViewModel();
        ko.applyBindings(GLOBAL.MainViewModel);

        // init the app
        GLOBAL.MainViewModel.Init();

        // when using back button (e.g. smartphone), warn user
        window.onbeforeunload = function () { return "Möchten Sie den Trainier wirklich verlassen? Sie müssten beim nächsten mal von vorne beginnen."; };

        // register paste event
        window.addEventListener("paste", function (pEvent) {

            GlobalIctViewModel.PastedFile(pEvent);

        }, false);

    }());

    // my viewmodel
    function MainViewModel() {

        let self = this;
        self.MyObservable = ko.observable();

        self.dataset = ko.observableArray(); // contains dataset

        // form data
        self.box = ko.observable({ name: "Bitte wählen..." }); /* manual, auto */
        self.boxes = ko.observableArray(); // all available boxes
        self.known = ko.observable(localStorage.getItem('known') && localStorage.getItem('known') === 'true' ? true : false);
        self.order = ko.observable(localStorage.getItem('order') ? localStorage.getItem('order') : 'random');
        self.boxesShowDropdown = ko.observable(false); // if the dropdown is visible or not
        self.showQuestion = ko.observable(true); // toggles between question an answer
        self.currentIndexCard = ko.observable(new indexCard.IndexCard()); // current showing index card in trainer
        self.showProgressButtonBubble = ko.observable(false);

        self.i = ko.observable(-1);
        self.pointerTraffic = true;

        // save the actual answer
        self.answer = ko.observable('');
        self.displayJingle = ko.observable(false);
        self.displayQuestionImage = ko.observable(false);
        self.displayAnswerImage = ko.observable(false);
        self.displaySource = ko.observable(false);
        self.step = ko.observable(); //restart, learn

        // edit mode
        self.editMode = ko.observable(false);
        self.editIndexCard = ko.observable(); // current editing index card
        self.editIndexCardIsLoading = ko.observable(false); // current state of saving

        // search window
        self.displaySearchWindow = ko.observable(false);
        self.searchShowHourGlass = ko.observable(false);
        self.searchResult = ko.observableArray();

        // global audio player
        self.Audio = null;
        self.AudioIsPlaying = ko.observable(false); // if the audio is currently playing

        /*
        * Toggle functions for Menu, jingle, image ...
        */

        self.toggleMenu = function () {

            // close main menu if open
            $('#menu').css({ display: 'none' });

            $('#ict-form-container').toggle();
        };

        self.toggleJingle = function () {
            self.displayJingle(self.displayJingle() ? false : true);
        };

        self.toggleQuestionImage = function () {
            self.displayQuestionImage(self.displayQuestionImage() ? false : true);
        };

        self.toggleAnswerImage = function () {
            self.displayAnswerImage(self.displayAnswerImage() ? false : true);
        };

        self.toggleShowSource = function () {
            self.displaySource(self.displaySource() ? false : true);
        };

        self.boxesToggleShowDropdown = function () {

            self.boxesShowDropdown(!self.boxesShowDropdown());

            // when showing, then align the dropdown
            if (self.boxesShowDropdown()) {
                var lNavbarContainerElement = document.getElementById("navbar-container");
                var lControlElement = document.getElementById("ict-boxes-dropdown-bttn");
                var lDropDownElement = document.getElementById("ict-boxes-dropdown-list-container");
                var lDropDownScrollContainerElement = document.getElementById("ict-boxes-dropdown-scroll-container");
                var lDropDownListElementNewBox = document.getElementById("ict-boxes-dropdown-listitem-new-box");
                var lDropDownElementPositionLeft = 0; // the position of the dropdown element

                lDropDownScrollContainerElement.style.height = "auto";

                // 1. now calculate the optimal left-position for the dropdown.
                // the dropdown should fit to the control
                lDropDownElementPositionLeft = lControlElement.offsetLeft;

                // if the position + widht of the dropdown does not fit into the viewport, then move the dropbox to the left
                if ((lDropDownElementPositionLeft + lDropDownElement.offsetWidth) > lNavbarContainerElement.offsetWidth) {
                    lDropDownElementPositionLeft = lNavbarContainerElement.offsetWidth - lDropDownElement.offsetWidth;
                }

                lDropDownElement.style.left = lDropDownElementPositionLeft + "px";

                // 2. reduce the height of the dropdown
                if (window.innerHeight < (lDropDownElement.offsetTop + lDropDownElement.offsetHeight)) {
                    lMarginBottom = 5; // a defined margin to the bottom
                    lDropDownScrollContainerElement.style.height = (window.innerHeight - (lDropDownElement.offsetTop + lDropDownListElementNewBox.offsetHeight + lMarginBottom)) + "px";
                }
            }
        };

        /// <summary> Play audio file. </summary>
        /// <remarks> Doetsch, 17.12.19. </remarks>
        /// <param name="pFileUrl"> URL of the file. </param>
        /// <returns> . </returns>
        self.PlayAudioFile = function (pFileUrl) {

            var lFullFileUrl = Global.Uploads + pFileUrl;

            // stop playing if it still plays (toggle)
            if (self.Audio instanceof HTMLAudioElement && self.Audio.paused === false) {
                self.Audio.pause();
                self.Audio.currentTime = 0;
            }
            // it doesn´t play. Play now
            else {
                if (self.Audio === null) {
                    self.Audio = new Audio();

                    // assign events
                    self.Audio.onerror = function () {
                        alert("Could not play the Audio File. Please try again later.");
                    };

                    // the pause event triggered
                    self.Audio.onpause = function () {
                        self.AudioIsPlaying(false);
                    };
                }

                // assign file url
                if (self.Audio.src !== lFullFileUrl) {
                    self.Audio.src = lFullFileUrl;
                }

                // play the file
                self.Audio.play();
                self.AudioIsPlaying(true);
            }
        };

        /*
         * button restart pressed
         */

        self.restart = function () {
            self.step('learn');
            self.start();
        };


        /**
         * Init the app
         * @constructor
         */
        self.Init = function () {

            // get Index Card Boxes
            $.ajax({
                url: '/IndexCardBoxApi',
                type: 'get',
                dataType: 'json',
                success: function (data) {

                    var lTmpArr = [];

                    for (var i = 0, len = data.length; i < len; i++) {
                        lTmpArr.push(new indexCardBox.IndexCardBox(data[i]));
                    }

                    // add all boxes to dropdown
                    self.boxes(lTmpArr);

                    // select last selected box when in cookie
                    var lId = tsLib.Cookie.Read("selected-icb");
                    if (lId != null) {
                        // find in list
                        for (var ii = 0, lenn = lTmpArr.length; ii < lenn; ii++) {
                            if (lTmpArr[ii].id === lId) {
                                // found index card box in list.
                                self.BoxSelected(lTmpArr[ii]);
                                break;
                            }
                        }
                    }
                }
            });
        };

        self.BoxSelected = function (pIndexCardBox) {

            // close menu
            self.boxesShowDropdown(false);

            // validate params
            if (!(pIndexCardBox instanceof indexCardBox.IndexCardBox)) {
                throw "Invalid argument";
            }

            // show selected box in select box
            self.box(pIndexCardBox);

            // load data
            self.loadData();

            // remember selected box in cookie
            tsLib.Cookie.Write("selected-icb", pIndexCardBox.id, 365);
        };

        /*
         * button start pressed
         */

        self.start = function () {

            // close form if open
            $('#ict-form-container').css({ display: 'none' });

            // set index back
            self.i(-1);

            self.loadData(); // init set data and start       
        };

        self.loadData = function () {
            var lConfigData = {
                trainer: 'ict',
                box: self.box().id,
                known: self.known(),
                order: self.order()
            };

            // ajax call
            $.ajax({
                url: "/IndexCardTrainer/getdataset",
                type: 'get',
                data: lConfigData,
                dataType: 'json',
                success: function (data) {

                    if (data !== null && data.length > 0) {
                        // create objects
                        var lTmpArr = [];
                        for (var i = 0, len = data.length; i < len; i++) {
                            lTmpArr.push(new IndexCard(data[i]));
                        }

                        // order random if set (default)

                        if (self.order() == 'random') {
                            lTmpArr = randomArr(lTmpArr);
                        }

                        // bind all index cards to the view
                        self.dataset(lTmpArr);

                        self.pointerTraffic = true;
                        $('.ict-main-bttn').css({ 'visibility': 'visible' });

                        // start at 0
                        self.i(-1);

                        // leave edit mode if active
                        self.editMode(false);

                        // show 'learn' mode
                        self.step("learn");

                        // start workflow
                        self.workflow();
                    }
                    else {
                        // there is no index card in the box. create a new one

                        // show 'learn' mode
                        self.step("learn");

                        self.NewIndexCard();
                    }
                },
                error: function (data) {
                    alert('Fehler beim Laden des Lernsatzes');
                }
            });
        };


        /*
         * 
         * Next button clicked
         */

        self.next = function (pKnown) {

            // set known / not known
            if (pKnown === 1) {
                self.currentIndexCard().known += 1;
            }
            else {
                self.currentIndexCard().known = 0;
            }


            // ged id of current index card
            $.ajax({
                type: 'post',
                data: {
                    id: self.currentIndexCard().id, // current index card
                    known: self.currentIndexCard().known
                },
                url: "/IndexCard/setknown",
                dataType: 'json',
                success: function (data) {

                }
            });

            // fire and forget. go to next
            self.workflow();
        };

        /*
        * workflow
        */

        self.workflow = function () {
            /*
             * next Question
             */

            self.i(self.i() + 1);

            if (self.i() >= self.dataset().length) {
                self.step('restart');
                return;
            }

            // clean imagages
            self.cleanImages();

            // render view with next index card
            self.currentIndexCard(self.dataset()[self.i()]);

            // show in progress bar
            self.setProgress();

            // show question
            self.showQuestion(true);
        };

        /**
         * set progress bar
         * @constructor
         */
        self.setProgress = function () {

            if (self.i() < 0) {
                return;
            }

            var lProgress = (self.i() + 1) / self.dataset().length * 100;
            document.getElementById("ict-progress").style.width = lProgress + '%';
        };

        /**
         * do not show the old image any more
         */
        self.cleanImages = function () {

            var lElement = document.querySelector("div.img-mini-container img");
            if (lElement != null) {
                lElement.src = "//:0";
            }
        };

        /**
         * crate a new index card
         * @constructor
         */
        self.NewIndexCard = function () {

            self.editForm(new indexCard.IndexCard(), true);
        };

        /**
         * user clicked on a text box to edit the index card
         */
        self.editForm = function (pIndexCard) {

            if (!(pIndexCard instanceof IndexCard)) {
                throw new Error("Invalid Arguments. Expected type: IndexCard");
            }

            // A box must be selected to relate the new card to an box
            if (!(self.box() instanceof indexCardBox.IndexCardBox)) {
                alert("Bitte wähle einen Karteikasten aus.");

                if (self.boxesShowDropdown() === false) {
                    self.boxesToggleShowDropdown();
                }

                // leave function
                return;
            }

            self.editIndexCard(pIndexCard);
            self.editMode(true);

            //set cursor into field
            if (pIndexCard.id === null) {
                // its a new index card
                self.showQuestion(true);
                document.querySelector(".ict-question-container .ict-question-answer-text").focus();
            }
            else {
                // set either into question or answer dependent what is current active
                lQueryElement = self.showQuestion() ? ".ict-question-container" : ".ict-result-container";
                lQueryElement += " .ict-question-answer-text";
                document.querySelector(lQueryElement).focus();
            }
        };

        /**
         * When user pressed the cancel button in the edit mode
         */
        self.editCancel = function () {

            self.editMode(false);
            self.editIndexCard(null);
            self.setProgress();
        };

        /**
         * save the post
         */
        self.editSave = function () {

            // show saving...
            self.editIndexCardIsLoading(true);

            var lIndexCard = self.editIndexCard();

            if (lIndexCard.id === null) {
                // remove id when not set (new)
                delete lIndexCard.id;

                // when id is null then it is a new index card. Assign selected box id
                lIndexCard.indexCardBoxId = self.box().id;
            }

            // create post payload for form
            var lFormData = new FormData();
            for (var lProp in lIndexCard) {
                // do only send property they are not null
                // check also in observable
                if (lIndexCard[lProp] == null || (typeof lIndexCard[lProp] === "function" && lIndexCard[lProp]() === null)) {
                    continue;
                }

                // assign data
                // distinguish between observable and not observable
                if ((typeof lIndexCard[lProp] === "function")) {
                    // it´s an observable
                    lFormData.append("data[IndexCard][" + lProp + "]", lIndexCard[lProp]());
                }
                else {
                    lFormData.append("data[IndexCard][" + lProp + "]", lIndexCard[lProp]);
                }
            }

            $.ajax({
                url: "/IndexCard/add",
                data: lFormData,
                type: "POST",
                contentType: false,
                processData: false,
                dataType: "json",
                success: function (data) {

                    var lXhrIndexCard = new IndexCard(data.IndexCard);

                    // replace (when update) or insert (when new) the response
                    var i = 0;
                    var len = self.dataset().length;
                    for (; i < len; i++) {
                        if (self.dataset()[i].id === lXhrIndexCard.id) {
                            self.dataset()[i] = lXhrIndexCard;
                            break;
                        }
                    }

                    // when it is a new index card and the same box, then push it into the stack to the current position
                    if (i === len && self.box().id === lXhrIndexCard.indexCardBoxId) {
                        // it´s new
                        self.dataset().splice(self.i(), 0, lXhrIndexCard);
                    }

                    // updated view (show index card) (show also when it is a different selected box for verification)
                    self.currentIndexCard(lXhrIndexCard);

                    self.editMode(false);
                    self.editIndexCard(null);
                    self.setProgress();
                },
                error: function () {
                    alert("Could not save this post. Please try again later.");
                },
                complete: function () {

                    // show buttons again
                    self.editIndexCardIsLoading(false);
                }
            });



        };

        self.editDelete = function () {

            // show prompt
            if (confirm("Möchtest du diese Karteikarte löschen?")) {
                // show buttons again
                self.editIndexCardIsLoading(true);

                $.ajax({
                    url: "/IndexCard/delete",
                    data: { pId: self.editIndexCard().id },
                    type: "POST",
                    dataType: "json",
                    success: function (data) {

                        // remove item from deck
                        self.dataset.splice(self.editIndexCard(), 1);

                        // get show next or previous index card
                        if (self.dataset().length > 0) {
                            // when last index card, go one back.
                            if (self.i() === self.dataset().length) {
                                self.i(self.i() - 1);
                            }

                            self.currentIndexCard(self.dataset()[self.i()])
                            self.editMode(false);
                            self.setProgress();
                        }
                        else {
                            // the deck is empty. show form for a new index card
                            self.currentIndexCard(new indexCard.IndexCard());
                        }
                    },
                    error: function () {
                        alert("Could not save this post. Please try again later.");
                    },
                    complete: function () {

                        // show buttons again
                        self.editIndexCardIsLoading(false);
                    }
                });
            }
        };

        /**
         * move forward to the next index card
         * @constructor
         */
        self.MoveForward = function () {
            if ((self.i() + 1) < self.dataset().length) {
                self.i(self.i() + 1);
                self.cleanImages();
                self.currentIndexCard(self.dataset()[self.i()]);
                self.setProgress();
            }
        };

        /**
         * move backward to the index card before
         * @constructor
         */
        self.MoveBackward = function () {
            if (self.i() > 0) {
                self.i(self.i() - 1);
                self.cleanImages();
                self.currentIndexCard(self.dataset()[self.i()]);
                self.setProgress();
            }
        };

        /**
         * changed the question image element
         * @param pHtmlElement
         * @constructor
         */
        self.QuestionImageChanged = function (pHtmlElement) {

            self.editIndexCard().questionImageFile(pHtmlElement.files[0]);
            // re-render
            self.editIndexCard(self.editIndexCard());
        };

        self.AnswerImageChanged = function (pHtmlElement) {

            self.editIndexCard().answerImageFile(pHtmlElement.files[0]);
            // re-render
            self.editIndexCard(self.editIndexCard());
        };

        /**
         * Audio file of question changed
         */
        self.QuestionAudioChanged = function (pHtmlElement) {

            self.editIndexCard().questionAudioFile(pHtmlElement.files[0]);
            // re-render
            self.editIndexCard(self.editIndexCard());
        };

        self.AnswerAudioChanged = function (pHtmlElement) {

            self.editIndexCard().answerAudioFile(pHtmlElement.files[0]);
            // re-render
            self.editIndexCard(self.editIndexCard());
        };


        /**
         * Delete the question image
         */
        self.DeleteQuestionImage = function () {

            var lIndexCard = self.editIndexCard();
            lIndexCard.questionImageUrl = null;
            lIndexCard.questionImageFile(null);
            lIndexCard.deleteQuestionImage = true; // set marker for server
            self.editIndexCard(lIndexCard);
        };

        /**
         * Delete the answer image
         */
        self.DeleteAnswerImage = function () {

            var lIndexCard = self.editIndexCard();
            lIndexCard.answerImageUrl = null;
            lIndexCard.answerImageFile(null);
            lIndexCard.deleteAnswerImage = true; // set marker for server
            self.editIndexCard(lIndexCard);
        };

        /**
         * Delete the question audio file
         */
        self.DeleteQuestionAudio = function () {

            var lIndexCard = self.editIndexCard();
            lIndexCard.questionAudioUrl = null;
            lIndexCard.questionAudioFile(null);
            lIndexCard.deleteQuestionAudio = true; // set marker for server
            self.editIndexCard(lIndexCard);
        };

        /**
         * Delete the ANSWER audio file
         */
        self.DeleteAnswerAudio = function () {

            var lIndexCard = self.editIndexCard();
            lIndexCard.answerAudioUrl = null;
            lIndexCard.answerAudioFile(null);
            lIndexCard.deleteAnswerAudio = true; // set marker for server
            self.editIndexCard(lIndexCard);
        };

        /**
         * toggle the search dialog window
         */
        self.toggleSearchWindow = function () {

            self.displaySearchWindow(!self.displaySearchWindow());

            // set cursor into search field
            if (self.displaySearchWindow()) {
                document.getElementById("ict-search-txt").focus();
            }

        };

        /**
         * seachbttn clicked
         */
        self.searchBttnClick = function () {

            // show window
            self.displaySearchWindow(true);

            // set cursor into the field
            document.getElementById("ict-search-txt").focus();
        };

        /**
         * search for an index card
         */
        self.searchIndexCard = function () {

            // clear view
            self.searchResult([]);

            // get entered text
            var lSearchString = document.getElementById("ict-search-txt").value;

            // deactivate search button
            document.getElementById("ict-bttn-search-idc").disabled = true;

            // show hour glass
            self.searchShowHourGlass(true);

            $.ajax({
                url: "/IndexCard/getlist",
                data: { pBoxId: 0, pSearchstring: lSearchString },
                type: "GET",
                dataType: "json",
                success: function (data) {

                    // parse data
                    var lTmpArr = [];
                    for (var i = 0, len = data.length; i < len; i++) {
                        lTmpArr.push({
                            IndexCard: new IndexCard(data[i].IndexCard),
                            IndexCardBox: new indexCardBox.IndexCardBox(data[i].IndexCardBox)
                        });
                    }

                    // render search
                    self.searchResult(lTmpArr);

                }, complete: function () {

                    document.getElementById("ict-bttn-search-idc").disabled = false;
                    self.searchShowHourGlass(false);
                }
            });
        };

        /**
         * edit an index card in search result
         * @param pIndexCard
         */
        self.searchEditIndexCardClick = function (pIndexCard) {
            if (!(pIndexCard instanceof IndexCard)) {
                throw "Invalid argument. Expected type IndexCard.";
                return;
            }

            // close search window
            self.displaySearchWindow(false);

            // show in ict
            self.currentIndexCard(pIndexCard);

        };

        /*
         * Paste Event
         * @param {any} pEvent
         */
        self.PastedFile = function (pEvent) {

            // get the current focussed html-element
            var lHtmlElement = document.activeElement;
            var lClipboardData = pEvent.clipboardData;
            var lPastedFile = null; // file from clipboard
            var lFileType = null; // either 'image' or 'audio'

            if (lHtmlElement === null || lClipboardData === false || typeof lClipboardData.items === 'undefined' || lClipboardData.items.Length === 0) {
                // no active Element or no clipboard data
                return false;
            }

            // validate selected (focussed) html element
            if (lHtmlElement.id === "ict-question-image-box" || lHtmlElement.id === "ict-answer-image-box") {
                // no image box is selected
                lFileType = "image";
            }
            else if (lHtmlElement.id === "ict-question-audio-box" || lHtmlElement.id === "ict-answer-audio-box") {
                lFileType = "audio";
            }
            else {
                // no provided html element selected
                return false;
            }

            // get file from clipboard
            for (var i = 0; i < lClipboardData.items.length; i++) {
                // Skip content if not image
                if (lClipboardData.items[i].type.indexOf(lFileType) == -1) {
                    continue;
                }

                // Retrieve file on clipboard as blob
                lPastedFile = lClipboardData.items[i].getAsFile();
                break;
            }

            /*
             * No file in clipboard
             */
            if (lPastedFile === null) {
                return;
            }

            // cache the file
            switch (lHtmlElement.id) {
                case "ict-question-image-box":
                    self.editIndexCard().questionImageFile(lPastedFile);
                    break;
                case "ict-answer-image-box":
                    self.editIndexCard().answerImageFile(lPastedFile);
                    break;
                case "ict-question-audio-box":
                    self.editIndexCard().questionAudioFile(lPastedFile);
                    break;
                case "ict-answer-audio-box":
                    self.editIndexCard().questionAudioFile(lPastedFile);
                    break;
                default:
                    throw new error("invalid element id");
            }
        };
    }

});