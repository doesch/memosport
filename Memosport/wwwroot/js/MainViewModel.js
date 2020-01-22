var GLOBAL = {};
GLOBAL.Uploads = "/uploads/"; // upload path (e.g,. for images)
GLOBAL.BlankImg = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D"; // Blank Image
GLOBAL.NoImg = "//:0"; // No image -> use alt text

requirejs(["lib/tsLib/tsLib", "Classes/IndexCard", "Classes/IndexCardBox", "Classes/IctOptions", "Classes/SearchResult"], function (tsLib, indexCard, indexCardBox, ictOptions, searchResult) {

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

    }());

    // my viewmodel
    function MainViewModel() {

        let self = this;

        self.dataset = ko.observableArray(); // contains all index cards for the current training instance

        // Dropdown for boxes
        self.boxPlaceholder = { name: "Bitte wählen..." };
        self.box = ko.observable(self.boxPlaceholder); /* manual, auto */
        self.boxes = ko.observableArray(); // all available boxes

        // move indexcard to box - dialog
        self.boxMoveSelected = ko.observable(); // cache id of the selected box the current indexcard should be move to.

        // options
        if (localStorage.getItem('ictOptions') === null) { // use default options when nothing cached
            localStorage.setItem('ictOptions', JSON.stringify(new ictOptions.IctOptions()));
        }

        // self.ictOptions is dedicated for the form
        self.ictOptions = ko.observable(new ictOptions.IctOptions(JSON.parse(localStorage.getItem('ictOptions')))); 

        self.boxesShowDropdown = ko.observable(false); // if the dropdown is visible or not
        self.mainMenuShowDropdown = ko.observable(false); // toggle dropdown of the main menu
        self.showQuestion = ko.observable(true); // toggles between question an answer
        self.currentIndexCard = ko.observable(new indexCard.IndexCard()); // current showing index card in trainer
        self.showProgressButtonBubble = ko.observable(false);
        self.latestSources = ko.observableArray();
        self.latestSourcesDropdown = null;

        self.i = ko.observable(-1);
        self.pointerTraffic = true;

        // save the actual answer
        self.answer = ko.observable('');
        self.step = ko.observable(); //restart, learn

        // IndexCard edit mode
        self.editMode = ko.observable(false);
        self.editIndexCard = ko.observable(); // current editing index card
        self.editIndexCardIsLoading = ko.observable(false); // current state of saving

        // IndeCardBox edit form
        self.editIndexCardBox = ko.observable(); // current editing index card box

        // search window
        self.searchDialog = null; // the search-dialog instance
        self.searchShowHourGlass = ko.observable(false);
        self.searchResult = ko.observableArray();

        // global audio player
        self.Audio = null;
        self.AudioIsPlaying = ko.observable(false); // if the audio is currently playing

        // sandtimer
        self.sandtimerRunning = ko.observable(false);
        self.sandtimerInterval = null;
        self.sandtimerTotalSeconds = null; // caches the current time of the sandtimer in seconds
        self.sandtimerDisplayValue = ko.observable("00:00:00"); // the formatted, displayed sandtimer

        self.sandtimerHours = ko.observable();
        self.sandtimerMinutes = ko.observable();
        self.sandtimerSeconds = ko.observable();

        // stats dialog
        self.boxStats = ko.observableArray(); // box statistics
        self.boxStatsDialog = null; // dialog of the box stats

        // Show Options diaclog
        self.showOptionsDialog = function () {

            // ToDo -oDoetsch: close main menu if open

            // create buttons
            let lButtonApply = new tsLib.Button("Anwenden", function() {

                // write settings into cache
                // validate shema
                if (self.ictOptions() instanceof ictOptions.IctOptions === false) {
                    throw new Error("Invalid data type. Expected type: 'Options'");
                }
                
                // save options
                localStorage.setItem('ictOptions', JSON.stringify(self.ictOptions()));

                // restart app when any box selected
                if (self.box() instanceof indexCardBox.IndexCardBox) {
                    self.restart();
                }
            });

            let lButtonCancel = new tsLib.Button("Abbrechen", function() {

                // cancel settings and apply cached options
                self.ictOptions(new ictOptions.IctOptions(JSON.parse(localStorage.getItem('ictOptions'))));
            });

            var lTemplate = document.getElementById("ict-options-dialog-template");

            // show dialog
            let lDialog = new tsLib.Dialog(lTemplate, "Einstellungen", [lButtonApply, lButtonCancel]);
            lDialog.afterRenderCallback = function () { ko.applyBindings(GLOBAL.MainViewModel, this.mHtmlWindow); };
            lDialog.show();
        };

        /// Check if any box is currently selected
        self.anyBoxIsSelected = function() {
            return self.box() instanceof indexCardBox.IndexCardBox;
        };

        // click on radio box for order
        self.ictOptionOrderChanged = function(pOrder) {

            self.ictOptions().order = pOrder;
            self.ictOptions(self.ictOptions()); // trigger re-render

            return true;
        };

        self.toggleJingle = function () {
            let lTemplate = document.getElementById("ict-dialog-jingle-template");
            let lDialog = new tsLib.Dialog(lTemplate, "Eselsbrücke");

            lDialog.afterRenderCallback = function () { ko.applyBindings(GLOBAL.MainViewModel, this.mHtmlWindow); };
            lDialog.show();
        };

        self.toggleQuestionImage = function () {
            self.showImage("question");
        };

        self.toggleAnswerImage = function () {
            self.showImage("answer");
        };

        // show the question/answer image
        self.showImage = function (pType) {
            
            // validate type
            if (pType !== "question" && pType !== "answer") {
                throw new Error("Invalid type. Expected: 'answer' or 'question'.");
            }

            // create image element
            let lImage = new Image();

            // add "load" event
            lImage.addEventListener("load", function (a, b) {

                // create html-template
                let lContainer = document.createElement("div");
                lContainer.setAttribute("class", "ict-" + pType + "-image-dialog");

                let lInnerContainer = document.createElement("div");
                lInnerContainer.setAttribute("class", pType + "-image-content");

                // add the <img>
                lInnerContainer.appendChild(lImage);

                // add the template + loaded image to the dialog
                let lDialog = new tsLib.Dialog(lInnerContainer, "Bild zur Frage");

                // add callbacks
                lDialog.afterRenderCallback = function () { ko.applyBindings(GLOBAL.MainViewModel, this.mHtmlWindow); };
                lDialog.show();
            });

            // get url
            let lUrl = pType === "question" ? self.currentIndexCard().questionImageUrl : self.currentIndexCard().answerImageUrl;

            // load image from server now
            lImage.src = GLOBAL.Uploads + lUrl;
        };

        // show the source of the index card
        self.toggleShowSource = function () {

            let lTemplate = document.getElementById("ict-dialog-source-template");
            let lDialog = new tsLib.Dialog(lTemplate, "Quelle");

            lDialog.afterRenderCallback = function () { ko.applyBindings(GLOBAL.MainViewModel, this.mHtmlWindow); };
            lDialog.show();
        };

        self.boxesToggleShowDropdown = function () {

            self.boxesShowDropdown(!self.boxesShowDropdown());

            // when showing, then align the dropdown
            if (self.boxesShowDropdown()) {
                let lNavbarContainerElement = document.getElementById("navbar-container");
                let lControlElement = document.getElementById("ict-boxes-dropdown-bttn");
                let lDropDownElement = document.getElementById("ict-boxes-dropdown-list-container");
                let lDropDownScrollContainerElement = document.getElementById("ict-boxes-dropdown-scroll-container");
                let lDropDownListElementNewBox = document.getElementById("ict-boxes-dropdown-listitem-new-box");
                let lDropDownElementPositionLeft = 0; // the position of the dropdown element

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
                        new tsLib.MessageBox("Das Audio-File konnte nicht abgespielt werden. Bitte versuchen Sie es später erneut.").show();
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

            // when using back button (e.g. smartphone), warn user
            // window.onbeforeunload = function () { return "Möchten Sie den Trainier wirklich verlassen? Sie müssten beim nächsten mal von vorne beginnen."; };

            // close all context-menus and dropdowns when clicking in an free field
            document.body.addEventListener("click", function (e) { GLOBAL.MainViewModel.closeAllMenus(e); });

            // register paste event
            window.addEventListener("paste", function (pEvent) {

                GLOBAL.MainViewModel.PastedFile(pEvent);

            }, false);
            
            // remove class on click
            document.getElementById('software-bttn-start').addEventListener("click", function () {
                tsLib.Style.removeClass(document.getElementById('software-bttn-start'), "mark-start-button");
            });

            // get Index Card Boxes into dropdown
            let lCallback = self.LoadLatestLearnedBox;
            self.GetIndexCardBoxes(lCallback);
        };

        // close all menus (click-event on body)
        self.closeAllMenus = function(e) {

            // the dropdown for the latest sources of an indexcard.
            self.latestSourcesDropdownHide();
            self.mainMenuShowDropdown(false);
            self.boxesShowDropdown(false);
        };

        /// Get all index card boxes from the server
        self.GetIndexCardBoxes = function (pCallback) {

            $.ajax({
                url: '/IndexCardBoxApi',
                type: 'get',
                dataType: 'json',
                success: function (data) {

                    var lTmpArr = [];

                    // convert response into instances
                    for (var i = 0, len = data.length; i < len; i++) {
                        lTmpArr.push(new indexCardBox.IndexCardBox(data[i]));
                    }

                    // sort by name
                    lTmpArr.sort((a, b) => (a.name.toUpperCase() > b.name.toUpperCase()) ? 1 : -1);

                    // add all boxes to dropdown
                    self.boxes(lTmpArr);
                    
                    // execute callback if exists
                    if (typeof pCallback !== "undefined") {
                        pCallback();
                    }
                }
            });
        };

        // load the latest learned box
        self.LoadLatestLearnedBox = function() {

            let lBox = null;

            // get latest learned box
            for (let i = 0, len = self.boxes().length; i < len; i++) {
                // could be null when never learned → skip!
                if (typeof self.boxes()[i] === "undefined" || self.boxes()[i].dateLastLearned === null || typeof self.boxes()[i].dateLastLearned === "undefined") {
                    continue;
                }

                if (lBox === null || typeof lBox === "undefined" || lBox.dateLastLearned < self.boxes()[i].dateLastLearned) {
                    lBox = self.boxes()[i];
                }
            }

            // now load the dataset of the latest box
            if (lBox !== null) {
                self.BoxSelected(lBox);
            }
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
        };

        /*
         * button start pressed
         */

        self.start = function () {

            // set index back
            self.i(-1);

            self.loadData(); // init set data and start       
        };

        self.loadData = function () {

            // get options
            let lPayload = JSON.parse(localStorage.getItem('ictOptions'));

            // ajax call
            $.ajax({
                url: "/IndexCardApi/GetDataSet/" + self.box().id,
                type: 'get',
                data: lPayload,
                dataType: 'json',
                success: function (data) {

                    if (data !== null && data.length > 0) {
                        // create objects
                        var lTmpArr = [];
                        for (var i = 0, len = data.length; i < len; i++) {
                            lTmpArr.push(new indexCard.IndexCard(data[i]));
                        }

                        // order 'random' if set (default)
                        if (self.ictOptions().order === 0) {
                            lTmpArr = self.randomArr(lTmpArr);
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
                    new tsLib.MessageBox("Unbekannter Fehler beim Laden des Lernsatzes").show();
                }
            });
        };

        /// <summary> Random array. </summary>
        /// <remarks> Doetsch, 17.12.19. </remarks>
        /// <param name="pArr"> The array. </param>
        /// <returns> . </returns>
        self.randomArr = function (pArr) {

            var lTmpArr = [];

            while (pArr.length > 0) {
                lTmpArr.push(pArr.splice(Math.floor(Math.random() * (pArr.length)), 1)[0]);
            }

            return lTmpArr;
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

            // convert into payload (formdata)
            lFormData = self.indexCardToFormData(self.currentIndexCard());

            // ged id of current index card
            $.ajax({
                type: 'put',
                data: lFormData,
                url: "/IndexCardApi/" + self.currentIndexCard().id,
                contentType: false,
                processData: false,
                dataType: 'json',
                success: function (data) {

                },
                error: function () {
                    new tsLib.MessageBox("Das Setzen von 'gewusst' hat für diese Karteikarte leider nicht funktioniert. Bitte versuchen Sie es später erneut.").show();
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
            if (lElement !== null && typeof lElement !== "undefined") {
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

        /// user clicked on a text box to edit the index card
        self.editForm = function (pIndexCard) {

            if (!(pIndexCard instanceof indexCard.IndexCard)) {
                throw new Error("Invalid Arguments. Expected type: IndexCard");
            }

            // A box must be selected to relate the new card to an box
            if (!(self.box() instanceof indexCardBox.IndexCardBox)) {

                new tsLib.MessageBox("Bitte wählen Sie einen Karteikasten aus.").show();

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
                let lQueryElement = self.showQuestion() ? ".ict-question-container" : ".ict-result-container";
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

            let lIndexCard = self.editIndexCard();

            if (lIndexCard.id === null) {
                // remove id when not set (new)
                delete lIndexCard.id;

                // when id is null then it is a new index card. Assign selected box id
                lIndexCard.indexCardBoxId = self.box().id;
            }

            // convert indexcard to payload
            let lFormData = self.indexCardToFormData(lIndexCard);

            // post or put. When there is no id then it is a new one.
            let lHttpVerb = typeof lIndexCard.id === "undefined" ? "POST" : "PUT";
            let lUri = "/IndexCardApi";

            if (lHttpVerb === "PUT") {
                lUri += "/" + lIndexCard.id;
            }

            $.ajax({
                url: lUri,
                data: lFormData,
                type: lHttpVerb,
                contentType: false,
                processData: false,
                dataType: "json",
                success: function (xhr) {

                    var lXhrIndexCard = new indexCard.IndexCard(xhr);

                    // replace (when update) or insert (when new) the response
                    let i = 0;
                    let len = self.dataset().length;
                    for (; i < len; i++) {
                        if (self.dataset()[i].id === lXhrIndexCard.id) {
                            self.dataset()[i] = lXhrIndexCard;
                            break;
                        }
                    }

                    // when it is a new index card and the same box, then push it into the stack to the current next position
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
                    new tsLib.MessageBox("Der Post konnte nicht gespeichert werden. Bitte versuchen Sie es später erneut.").show();
                },
                complete: function () {

                    // show buttons again
                    self.editIndexCardIsLoading(false);
                }
            });
        };

        /// convert an indexcard to an FormData-payload
        self.indexCardToFormData = function (pIndexCard) {

            // create post payload for form
            let lFormData = new FormData();

            // add data to formdata payload
            for (let lProp in pIndexCard) {

                // do not send properties which are null
                if (pIndexCard.hasOwnProperty(lProp) === false || pIndexCard[lProp] === null || typeof pIndexCard[lProp] === "function" && pIndexCard[lProp] === null) {
                    continue;
                }

                // check also in observable
                if (pIndexCard.hasOwnProperty(lProp) === true) {

                    // assign data
                    // distinguish between observable and not observable
                    if (typeof pIndexCard[lProp] === "function") {
                        // it´s an observable
                        lFormData.append(lProp, pIndexCard[lProp]());
                    }
                    else {
                        lFormData.append(lProp, pIndexCard[lProp]);
                    }
                }
            }

            return lFormData;

        };

        // delete an index card (button-click-event in edit mode)
        self.editDelete = function () {

            // show prompt
            let lBttnDelete = new tsLib.Button("Löschen", function() {

                // show buttons again
                self.editIndexCardIsLoading(true);

                $.ajax({
                    url: "/IndexCardApi/" + self.editIndexCard().id,
                    data: { pId: self.editIndexCard().id },
                    type: "DELETE",
                    dataType: "json",
                    success: function (data) {

                        // remove item from deck
                        let lArr = self.dataset();
                        for (let i = 0, len = lArr.length; i < len; i++) {
                            if (lArr[i].id === self.editIndexCard().id) {

                                lArr.splice(i, 1);
                                self.dataset(lArr);
                                break;
                            }
                        }

                        // get show next or previous index card
                        if (self.dataset().length > 0) {
                            // when last index card, go one back.
                            if (self.i() === self.dataset().length) {
                                self.i(self.i() - 1);
                            }

                            self.currentIndexCard(self.dataset()[self.i()]);
                            self.editMode(false); // go back to learn-mode
                            self.editIndexCard(null);
                            self.showQuestion(true); // go to question
                            self.setProgress();
                        }
                        else {
                            // the deck is empty. show form for a new index card
                            self.currentIndexCard(new indexCard.IndexCard());
                        }
                    },
                    error: function () {
                        new tsLib.MessageBox("Could not delete this post. Please try again later.").show();
                    },
                    complete: function () {

                        // show buttons again
                        self.editIndexCardIsLoading(false);
                    }
                });

            });

            let lBttnCancel = new tsLib.Button("Abbrechen", function () {
                return false;
            });

            let lDialog = new tsLib.Dialog("Möchten Sie diese Karteikarte löschen?", null, [lBttnDelete, lBttnCancel]);
            lDialog.show();
        };

        /**
         * Show dialog which provides functionality to move an index card into another box 
         */
        self.indexCardMoveClick = function () {

            // validate param
            if (self.currentIndexCard instanceof indexCard.IndexCard === true) {
                throw new Error("Invalid argument. Expected type: 'IndexCard'.");
            }

            // cache old boxid
            let lOldBoxId = self.currentIndexCard().indexCardBoxId;

            // preselect target box with current box
            self.boxMoveSelected(self.currentIndexCard().indexCardBoxId);

            // create buttons
            let lBttnCancel = new tsLib.Button("Abbrechen", function () {
                self.boxMoveSelected(null);
            });

            let lBttnOk = new tsLib.Button("OK", function () {

                // assign cached box-index
                self.currentIndexCard().indexCardBoxId = self.boxMoveSelected();

                // show sandtimer
                let lSandtimer = new tsLib.Sandtimer("Änderungen werden gespeichert. Bitte warten...");

                // convert payload into form data
                let lFormData = self.indexCardToFormData(self.currentIndexCard());

                // save changes
                $.ajax({
                    url: "/IndexCardApi/" + self.currentIndexCard().id,
                    data: lFormData,
                    type: "PUT",
                    contentType: false,
                    processData: false,
                    dataType: "json",
                    beforeSend: function () {
                        lSandtimer.show();
                    },
                    success: function (xhr) {
                        
                        // when indexcard belonged to current selected box, then remove
                        if (lOldBoxId === self.box().id) {

                            for (var i = 0, len = self.dataset().length; i < len; i++) {
                                if (self.dataset()[i].id === self.currentIndexCard().id) {

                                    self.dataset.remove(self.dataset()[i]);

                                    // when in edit-mode, then switch to learn-mode
                                    self.editMode(false);

                                    // go to next indexcard
                                    self.i(self.i() - 1); // we need to move one back before, because we have removed one from the stack
                                    self.workflow();

                                    break;
                                }
                            } 
                        }

                    }, complete: function () {
                        // close hour glass
                        lSandtimer.close();
                    }
                });
            });

            let lTemplate = document.getElementById("ict-move-indexcard-to-box-template");

            // show dialog
            let lDialog = new tsLib.Dialog(lTemplate, "Karteikarte in Box verschieben:", [lBttnOk, lBttnCancel]);
            lDialog.afterRenderCallback = function () { ko.applyBindings(GLOBAL.MainViewModel, this.mHtmlWindow); };
            lDialog.show();
        };

        // the user selects an differen box for the current indexcard via the dialog
        self.indexCardMoveBoxSelectedClick = function (pIndexCardBox) {

            if (pIndexCardBox instanceof indexCardBox.IndexCardBox === false) {
                throw new Error("Invalid argument. Expected type: 'IndexCardBox'.");
            }

            // assign new box-id to cache
            self.boxMoveSelected(pIndexCardBox.id);
        };

        /// <summary> Index card duplicate click. </summary>
        /// <remarks> Doetsch, 15.01.20. </remarks>
        /// <returns> . </returns>
        self.indexCardDuplicateClick = function() {

            // duplicate an indexcard

            // show sandtimer
            let lSandtimer = new tsLib.Sandtimer("Eine Kopie der Karteikarte wird erstellt. Bitte warten...");

            // convert into payload (formdata)
            let lFormData = self.indexCardToFormData(self.currentIndexCard());

            $.ajax({
                url: "/IndexCardApi/duplicate",
                data: lFormData,
                type: "POST",
                contentType: false,
                processData: false,
                dataType: "json",
                beforeSend: function() {
                    lSandtimer.show();
                },
                success: function (xhr) {

                    // render indexcard
                    let lIndexCard = new indexCard.IndexCard(xhr);

                    // close sandtimer
                    lSandtimer.close();

                    // show message to the user
                    new tsLib.MessageBox("Es wurde erfolgreich eine Kopie erstellt. Sie können die Kopie jetzt bearbeiten.").show();

                    // add copy to current dataset
                    self.dataset().splice(self.i(), 0, lIndexCard);
                    self.setProgress();

                        // updated view (show index card) (show also when it is a different selected box for verification)
                    self.currentIndexCard(lIndexCard);

                    // show in edit more
                    self.showQuestion(true);
                    self.editForm(lIndexCard);
                },
                complete: function () {
                    lSandtimer.close();
                }
            });

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

        ///changed the question image element
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

        /// Audio file of question changed
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
         * seachbttn clicked
         */
        self.searchBttnClick = function () {

            let lTemplate = document.getElementById("ict-search-dialog");
            self.searchDialog = new tsLib.Dialog(lTemplate, null, null, "ict-search-dialog-container"); //pass callback that binds the knockout viewmodel it´s template
            self.searchDialog.afterRenderCallback = function () { ko.applyBindings(GLOBAL.MainViewModel, this.mHtmlWindow); };
            self.searchDialog.show();

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
                url: "/IndexCardApi/search",
                data: { pSearchstring: lSearchString },
                type: "GET",
                dataType: "json",
                success: function (data) {

                    // parse data
                    var lTmpArr = [];
                    for (var i = 0, len = data.length; i < len; i++) {
                        lTmpArr.push(new searchResult.SearchResult(data[i]));
                    }

                    // render search
                    self.searchResult(lTmpArr);

                }, complete: function () {

                    document.getElementById("ict-bttn-search-idc").disabled = false;
                    self.searchShowHourGlass(false);
                }
            });
        };

        // Search index Card click event
        self.searchEditIndexCardClick = function (pIndexCard) {

            if (!(pIndexCard instanceof indexCard.IndexCard)) {
                throw "Invalid argument. Expected type IndexCard.";                
            }

            // close search window
            if (self.searchDialog !== null) {
                self.searchDialog.close();
            }

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
                if (lClipboardData.items[i].type.indexOf(lFileType) === -1) {
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
                return false;
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
                    self.editIndexCard().answerAudioFile(lPastedFile);
                    break;
                default:
                    throw new Error("invalid element id");
            }
        };

        // click on button to create a new index card box
        self.createNewIndexCardBoxClick = function () {

            // fill form with new indexcardbox
            self.editIndexCardBoxForm(new indexCardBox.IndexCardBox());

        };

        // show form to create or edit an indexcardbox
        self.editIndexCardBoxForm = function(pIndexCardBox) {

            // validate argument
            if (pIndexCardBox instanceof indexCardBox.IndexCardBox === false) {
                throw new Error("Invalid Argument. Expected: IndexCardBox.");
            }

            // fill form
            self.editIndexCardBox(pIndexCardBox);

            // show dialog
            let lTitle = self.editIndexCardBox().id === null ? "Neue Box anlegen" : "Box bearbeiten";

            // create buttons
            let lBttnSave = new tsLib.Button("Speichern", function() {

                    // edit or create (new)
                    let lHttpVerb = self.editIndexCardBox().id === null ? "POST" : "PUT";
                    let lUri = "/IndexCardBoxApi";

                    if (lHttpVerb === "PUT") {
                        lUri += "/" + self.editIndexCardBox().id;
                    }

                    $.ajax({
                        url: lUri,
                        data: JSON.stringify(self.editIndexCardBox()),
                        type: lHttpVerb,
                        contentType: "application/json",
                        dataType: "json",
                        success: function(xhr) {

                            let lIndexCardBox = new indexCardBox.IndexCardBox(xhr);

                            // when new, then put into the list
                            // when update, then replace in list

                            // find position in list
                            let lArr = self.boxes();
                            let lPos = null;

                            for (let i = 0, len = lArr.length; i < len; i++) {
                                if (lArr[i].id === lIndexCardBox.id) {
                                    lPos = i;
                                    break;
                                }
                            }

                            if (lPos === null) {
                                // add new
                                lArr.push(lIndexCardBox);
                            } else {
                                // replace
                                lArr[lPos] = lIndexCardBox;
                            }

                            // sort by name
                            lArr.sort((a, b) => (a.name.toUpperCase() > b.name.toUpperCase()) ? 1 : -1);

                            // update dropdownlist
                            self.boxes(lArr);

                            // Select new box
                            self.BoxSelected(self.boxes()[self.boxes().indexOf(lIndexCardBox)]);
                        }
                    });
            });

            let lBttnDelete = new tsLib.Button("Löschen", function() {

                // show propt and ask user to delete
                
                let lBttnConfirmDelete = new tsLib.Button("Löschen", function () {

                    // show hour glass
                    let lSandtimer = new tsLib.Sandtimer();

                    // send delete
                    $.ajax({
                        url: "/IndexCardBoxApi/" + self.editIndexCardBox().id,
                        type: "DELETE",
                        dataType: "json",
                        beforeSend: function () {
                            lSandtimer.show();
                        },
                        success: function (xhr) {

                            let lIndexCardBox = new indexCardBox.IndexCardBox(xhr);

                            // remove from dropdown list
                            let lArr = self.boxes();
                            for (let i = 0, len = lArr.length; i < len; i++) {
                                if (lArr[i].id === lIndexCardBox.id) {

                                    lArr.splice(i, 1);
                                    self.boxes(lArr);
                                    break;
                                }
                            }

                            // when indexboxcard currently selected, then remove
                            if (self.box().id === self.editIndexCardBox().id) {

                                // leave edit mode
                                self.editMode(false);
                                self.box(self.boxPlaceholder);
                                self.currentIndexCard(new indexCard.IndexCard());
                                self.dataset([]); // clear datasets
                            }

                            self.editIndexCardBox(null);

                        }, complete: function () {

                            // remove hour glass
                            lSandtimer.close();
                        }
                    });
                });

                let lBttnConfirmCancel = new tsLib.Button("Abbrechen", function () { });

                // show prompt now
                new tsLib.MessageBox("Möchten Sie die Box wirklich löschen? Es werden alle Karteikarten darin gelöscht.", null, [lBttnConfirmDelete, lBttnConfirmCancel]).show();

            }, "float-left"); // position button left

            let lBttnCancel = new tsLib.Button("Abbrechen", function() {});

            // concat all buttons
            let lButtons = [lBttnSave, lBttnCancel];

            // add delete button when it is not a new indexcardbox
            if (self.editIndexCardBox().id !== null) {
                lButtons.push(lBttnDelete);
            }

            // get template
            var lTemplate = document.getElementById("index-card-box-form-template");
            let lDialog = new tsLib.Dialog(lTemplate, lTitle, lButtons);
            lDialog.afterRenderCallback = function() { ko.applyBindings(GLOBAL.MainViewModel, this.mHtmlWindow); };
            lDialog.show();

            // set cursor into text field
            document.querySelector("#index-card-box-form-container input[name='name']").focus();
        };

        /// click on menu button
        self.menuBttnClick = function () {

            // toggle menu
            self.mainMenuShowDropdown(!self.mainMenuShowDropdown());

            // when show(), then align on x-axis
            if (self.mainMenuShowDropdown())
            {
                let lDropdownElement = document.getElementById("menu");
                let lButton = document.getElementById("bttn-menu");

                // calculate position for the menu
                let lButtonOffsetRight = lButton.offsetLeft + lButton.offsetWidth;
                let lTargetPosition = lButtonOffsetRight - lDropdownElement.clientWidth;
                lDropdownElement.style.left = lTargetPosition + "px";
            }
        };

        // validate if the source input field has an value
        self.sourceInputHasValue = function() {

            let lInputElement = document.getElementById("ict-input-source");

            if (typeof lInputElement === "undefined" || lInputElement === null) {
                throw new Error("Cannot find input element id='ict-input-source'.");
            }

            // get value
            let lValue = lInputElement.value;

            // validate
            if (lValue === null || typeof lValue === "undefined") {
                return false;
            }

            if (lValue.trim() === "") {
                return false;
            }

            return true;
        };

        /// click or keypress on sources field
        self.sourcesGetFromServer = function() {

            // when input filled then hide the dropdown and do not load source from server
            if (self.sourceInputHasValue()) {
                // user has entered an value
                self.latestSourcesDropdownHide();
                return;
            }

            // when field empty, then show dropdown

            // get latest sources from server
            $.ajax({
                url: "/IndexCardApi/GetLatestSources",
                type: "GET",
                dataType: "json",
                success: function (xhr) {

                    // add results to observable
                    self.latestSources(xhr);

                    // create an dropdown when not exists
                    if (self.latestSourcesDropdown instanceof tsLib.DropdownTextfield === false) {
                        // show results in an dropdown
                        let lTemplate = document.getElementById("latest-sources-dropdown-template");
                        self.latestSourcesDropdown = new tsLib.DropdownTextfield(lTemplate);
                        // now bind the knockout
                        self.latestSourcesDropdown.afterRenderCallback = function () { ko.applyBindings(GLOBAL.MainViewModel, this.mHtmlWindow); };
                        self.latestSourcesDropdown.appendTo("ict-input-source");
                    }

                    // show the dropdown
                    self.latestSourcesDropdown.show();
                }
            });

        };

        /// click on resource in dropdown
        self.latestSourcesClick = function(pSource) {

            // assign selected value
            document.getElementById("ict-input-source").value = pSource;
            self.editIndexCard().source = pSource;

            // close dropdown
            self.latestSourcesDropdownHide(); // close the dropdown
        };

        /// hide the dropdown
        self.latestSourcesDropdownHide = function() {

            if (self.latestSourcesDropdown instanceof tsLib.DropdownTextfield === true) {
                self.latestSourcesDropdown.hide();
            }
        };

        /// When source is not an url, then convert the source-termin into an google-search
        self.indexcardGetSourceUrl = function (pSource) {

            let lSource = pSource.trim();

            // validate param
            if (lSource === null || typeof lSource === "undefined" || lSource === "") {
                return;
            }

            // check if source begins with "http".
            if (lSource.toLowerCase().lastIndexOf("http", 0) === 0)
            {
                // it is an url.
                return lSource;
            }
            else
            {
                // it is not an url. put it into an google search
                return "https://www.google.com/search?q=" + lSource;
            }
        };

        // Region sandtimer

        // show the sandtimer dialog
        self.sandtimerDialog = function() {

            // preallocate the fields
            self.sandtimerReset(); 

            // show the dialog
            let lTemplate = document.getElementById("sandtimer-dialog-template");
            let lDialog = new tsLib.Dialog(lTemplate, "Sanduhr");
            lDialog.afterRenderCallback = function () { ko.applyBindings(GLOBAL.MainViewModel, this.mHtmlWindow); };
            lDialog.show();
        };

        // start the sandtimer
        self.sandtimerStart = function () {

            // clear old interval when exists
            self.sandtimerStop();

            // get seconds
            self.sandtimerTotalSeconds = (Number(self.sandtimerHours()) * 3600) +
                (Number(self.sandtimerMinutes()) * 60) +
                Number(self.sandtimerSeconds());

            // validate time (minimum 1 second)
            if (self.sandtimerTotalSeconds <= 0) {
                new tsLib.MessageBox("Bitte geben Sie eine gültige Zeit ein.").show();
                return;
            }

            // save in cache
            localStorage.setItem('sandtimerHours', self.sandtimerHours());
            localStorage.setItem('sandtimerMinutes', self.sandtimerMinutes());
            localStorage.setItem('sandtimerSeconds', self.sandtimerSeconds());

            // switch layout
            self.sandtimerRunning(true);

            // start interval
            self.sandtimerInterval = setInterval(function() {

                // show dialog when time is over
                if (self.sandtimerTotalSeconds <= 0) {

                    // stop timer
                    self.sandtimerStop();

                    // reset values
                    self.sandtimerReset();

                    // show message
                    let lBttnOk = new tsLib.Button("OK", function() {});
                    let lTemplate = document.getElementById("sandtimer-elapsed-template");
                    new tsLib.Dialog(lTemplate, null, [lBttnOk]).show();
                    return;
                }

                // substract one second
                self.sandtimerTotalSeconds = self.sandtimerTotalSeconds - 1;
                
                // fill input fields
                self.sandtimerSeconds(Math.floor(self.sandtimerTotalSeconds) % 60);
                self.sandtimerMinutes(Math.floor(self.sandtimerTotalSeconds / 60 % 60));
                self.sandtimerHours(Math.floor(self.sandtimerTotalSeconds / 3600 % 24));

                // display formatted value
                let lHours = self.sandtimerHours() < 10 ? "0" + self.sandtimerHours() : self.sandtimerHours();
                let lMinutes = self.sandtimerMinutes() < 10 ? "0" + self.sandtimerMinutes() : self.sandtimerMinutes();
                let lSeconds = self.sandtimerSeconds() < 10 ? "0" + self.sandtimerSeconds() : self.sandtimerSeconds();

                // render value
                self.sandtimerDisplayValue(lHours + ":" + lMinutes + ":" + lSeconds);

            }, 1000);
        };

        // stop the sandtimer
        self.sandtimerStop = function () {

            if (self.sandtimerInterval !== null) {
                clearInterval(self.sandtimerInterval);
            }
            
            self.sandtimerRunning(false);
        };

        // reset the sandtimer
        self.sandtimerReset = function () {
            self.sandtimerHours(localStorage.getItem('sandtimerHours') !== null ? localStorage.getItem('sandtimerHours') : 0);
            self.sandtimerMinutes(localStorage.getItem('sandtimerMinutes') !== null ? localStorage.getItem('sandtimerMinutes') : 30);
            self.sandtimerSeconds(localStorage.getItem('sandtimerSeconds') !== null ? localStorage.getItem('sandtimerSeconds') : 0);
        };

        // EndRegion Sandtimer

        // Region ArchiveBox
        self.archiveIndexCardBoxDialog = function () {

            let lBttnOk = new tsLib.Button("OK", function () { });
            let lTemplate = document.getElementById("ict-archive-template");
            let lDialog = new tsLib.Dialog(lTemplate, "Archivierte Karteikästen", [lBttnOk]);
            lDialog.afterRenderCallback = function () { ko.applyBindings(GLOBAL.MainViewModel, this.mHtmlWindow); };
            lDialog.show();
        };

        self.indexCardBoxToggleArchived = function (pIndexCardBox) {

            if (pIndexCardBox instanceof indexCardBox.IndexCardBox === false) {
                throw new Error("Invalid argument. Expected type: 'IndexCardBox'.");
            }

            // toggle value
            pIndexCardBox.archived = !pIndexCardBox.archived;

            // save box
            $.ajax({
                url: "/IndexCardBoxApi/" + pIndexCardBox.id,
                data: JSON.stringify(pIndexCardBox),
                type: "PUT",
                contentType: "application/json",
                dataType: "json",
                success: function (xhr) {

                    let lIndexCardBox = new indexCardBox.IndexCardBox(xhr);
                    let lArr = self.boxes();

                    // replace box in list
                    for (let i = 0, len = lArr.length; i < len; i++) {

                        // found box. Replace now
                        if (lArr[i].id === lIndexCardBox.id) {
                            lArr[i] = lIndexCardBox;
                            break; 
                        }
                    }

                    // re-render boxes
                    self.boxes(lArr);

                    // when box is currently selected, then remove from selection and current index card
                    if (self.anyBoxIsSelected() && self.box().id === lIndexCardBox.id) {
                        self.box(self.boxPlaceholder);
                        self.editMode(false);
                        self.editIndexCard(null); // current editing index card
                    }                    
                }
            });
        };

        // EndRegion ArchiveBox

        // Region BoxStatistics

        self.showBoxStatistics = function() {

            // save box
            $.ajax({
                url: "/IndexCardBoxApi/GetStats",
                type: "GET",
                contentType: "application/json",
                dataType: "json",
                success: function (xhr) {

                    // maps objects
                    let lTmpArr = [];

                    for (let i = 0, len = xhr.length; i < len; i++) {
                        lTmpArr.push(new indexCardBox.IndexCardBox(xhr[i]));
                    }

                    // render stats
                    self.boxStats(lTmpArr);

                    // show dialog
                    let lBttnOk = new tsLib.Button("OK", function () { });
                    let lTemplate = document.getElementById("ict-boxstats-template");
                    self.boxStatsDialog = new tsLib.Dialog(lTemplate, "Statistik", [lBttnOk]);
                    self.boxStatsDialog.afterRenderCallback = function () { ko.applyBindings(GLOBAL.MainViewModel, this.mHtmlWindow); };
                    self.boxStatsDialog.show();
                }
            });
        };

        // selected box in stats
        self.boxSelectedInStats = function(pIndexCardBox) {
            
            // close the dialog
            self.boxStatsDialog.close();

            // load the box
            self.BoxSelected(pIndexCardBox);
        };

        // EndRegion BoxStatistics
    }
});