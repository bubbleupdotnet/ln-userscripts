// ==UserScript==
// @name         Ticketmaster EDP Discovery Popup
// @namespace    https://bubbleup.net
// @version      0.4
// @description  Shows an alert popup on TM EDP to give you the discovery ID
// @author       eric@bubbleup.net
// @match        https://www.ticketmaster.com/event/*
// @match        https://www.ticketmaster.com/*/event/*
// @match        https://concerts.livenation.com/*/event/*
// @match        https://concerts.livenation.com/event/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ticketmaster.com
// @grant        none
// @downloadURL  https://github.com/bubbleupdotnet/ln-userscripts/raw/main/show_disco_ids_on_tm_pages.user.js
// ==/UserScript==

(function() {
    'use strict';

    var popupEndText = 'Tip: You can disable this popup in the TamperMonkey extension.'

    function getDiscoveryInfo() {
        var event = window._storeUtils.eventJSONData

//
        return {
            'Event ID': event.discoveryId,
            'Artist' : event.primaryArtist.name,
            'Artist ID': event.primaryArtist.discoveryId,
            'Venue': event.venue.name,
            'Venue ID': event.venue.discoveryId
        }

    }

    var popup;
    function showPopup(textToShow) {
        popup = popup || initializePopupWindow({
            bottom: popupEndText
        })

        popup.show(textToShow)
    }

    function formatObjectToString(e) {
        var t = '';
        if (typeof e == "object") {
            if (e instanceof Array) {
                for (var r in e) t += formatObjectToString(e[r]);
            } else {
                for (var r in e) {
                    var n = e[r];
                    typeof n == "object" ? t += r + "\n" + formatObjectToString(n) : t += r + " : " + formatObjectToString(n)
                }
            }
        }
        else {
            t += e.toString() + "\n";
        }
        return t
    }

    function initialize(){
        var detailsToShow = getDiscoveryInfo()

        //console.log(JSON.stringify(detailsToShow))

        var popupMessage = formatObjectToString(detailsToShow)

        showPopup(popupMessage)
    }

    try {
        initialize()
    } catch(e){
        console.warn('Discovery ID Popup tried to load, but encountered an error.', e);
    }

})();

function initializePopupWindow(config){

    var self = {
        config,
        show,
        hide
    }

    function show(content) {
        addStyling()

        self.contentContainer.value = content

        document.body.appendChild(self.wrapper)

        self.bottomElement.textContent = self.config.bottom || ''

    }

    function hide() {
        self.wrapper.remove()
    }

    function createElements() {
        self.closeButton = document.createElement('button')
        self.closeButton.className = 'close-button'
        self.closeButton.innerHTML = '&times;'
        self.closeButton.onclick = function() { hide() }

        self.wrapper = document.createElement('div')
        self.wrapper.className = 'quick-copy-popup quick-copy-popup__wrapper'

        self.wrapper.appendChild(self.closeButton)

        self.contentContainer = document.createElement('textarea')
        self.contentContainer.className = 'quick-copy-popup__content'

        self.wrapper.appendChild(self.contentContainer)

        self.copyButton = document.createElement('button')
        self.copyButton.className = 'copy-button'
        self.copyButton.innerHTML = 'Copy Content'
        self.copyButton.onclick = function() {
            navigator.clipboard.writeText(self.contentContainer.value);
        }

        self.wrapper.appendChild(self.copyButton)

        self.bottomElement = document.createElement('div')
        self.bottomElement.className = 'quick-copy-popup__bottom'
        self.wrapper.appendChild(self.bottomElement)

    }

    function addStyling() {
        var styleElementId = 'quick-copy-popup-styles'

        // Don't re-add styles if another popup instance already did it.
        if(document.getElementById(styleElementId)) return

        var style = document.createElement('style')

        style.id = styleElementId

        style.textContent = `
.close-button {
    float: right;
    background: transparent;
    border: none;
    color: white;
    font-size: 3em;
    padding-right: .25em;
}

.copy-button:hover {
    background: #ccc;
}

.copy-button {
    background: rgb(255, 255, 255);
    border: solid .05em black;
    border-radius: .25em;
    color: black;
    font-size: 2em;
    text-align: center;
    margin: 0 0 .75em 5.25em;
    padding: 0 .25em;
}

.quick-copy-popup__wrapper {
    position: absolute;
    background: #0156b2;
    left: 24%;
    top: 40%;
    width: 25vw;
    height: 18vw;
    border: solid 5px #0156b2;;
}

.quick-copy-popup__content {
    text-align: justified;
    background: #0156b2;
    color: white;
    padding: 1.5em 1.5em 1.5em 5em;
    font-size: 1.42em;
    width: 100%;
    height: 65%;
    resize: none;
    outline: none;
    border: none;
}
.quick-copy-popup__bottom {
    color: white;
}
`
        document.head.appendChild(style)


    }

    createElements()

    return self;
}
