// ==UserScript==
// @name         Ticketmaster EDP Discovery Popup
// @namespace    https://bubbleup.net
// @version      0.1
// @description  Shows an alert popup on TM EDP to give you the discovery ID
// @author       eric@bubbleup.net
// @match        https://www.ticketmaster.com/event/*
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

        console.log(JSON.stringify(detailsToShow))

        var popupMessage = formatObjectToString(detailsToShow)

        showPopup(popupMessage)
    }

    initialize()
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
        self.wrapper = document.createElement('div')
        self.wrapper.className = 'quick-copy-popup quick-copy-popup__wrapper'

        self.contentContainer = document.createElement('textarea')
        self.contentContainer.className = 'quick-copy-popup__content'

        self.wrapper.appendChild(self.contentContainer)

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
.quick-copy-popup__wrapper{
    position: fixed;
    left: 40%;
    top: 40%;
    width: 20vw;
    height: 13vw;
    border: thin solid grey;

}

.quick-copy-popup__content{
    width: 100%;
    height: 100%;
}
`
        document.head.appendChild(style)


    }

    createElements()

    return self;
}
