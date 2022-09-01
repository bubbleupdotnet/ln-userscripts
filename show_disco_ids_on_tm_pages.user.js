// ==UserScript==
// @name         Ticketmaster EDP Discovery Popup
// @namespace    https://bubbleup.net
// @version      0.7
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

    function formatDiscoveryDetails(event) {
        return {
            'Event Discovery ID': event.discoveryId,
            'Artist' : event.primaryArtist.name,
            'Artist ID': event.primaryArtist.discoveryId,
            'Venue': event.venue.name,
            'Venue ID': event.venue.discoveryId,
            'Artist Genre': event.primaryArtist.classifications[0].genre.name,
           // 'TM1 Reports':  `https://one.ticketmaster.com/app/reporting/${event.discoveryId}`
        }

    }

    var popup;
    function showPopup(textToShow, links) {
        popup = popup || initializePopupWindow({
            bottom: popupEndText
        })

        popup.setLinks(links)

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
        var discoveryEvent = window._storeUtils.eventJSONData
        var detailsToShow = formatDiscoveryDetails(discoveryEvent)

        //console.log(JSON.stringify(detailsToShow))

        var popupMessage = formatObjectToString(detailsToShow).trim()

        const links = {}
        if(discoveryEvent.discoveryId){
            links['TM1 Reports'] = `https://one.ticketmaster.com/app/reporting/${discoveryEvent.discoveryId}`
        }

        if(window.location.hash.includes('go-to-tm1-reports=true') && links['TM1 Reports'] ) {
            window.location.href = links['TM1 Reports']
        }

        showPopup(popupMessage, links)
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
        hide,
        setLinks
    }

    function show(content) {
        addStyling()

        self.contentContainer.value = content

        document.body.appendChild(self.wrapper)

        self.bottomElement.textContent = self.config.bottom || ''

    }

    var linksContainer;
    function setLinks(links) {
        if(linksContainer){
            linksContainer.remove()
        }

        linksContainer = renderPopupLinks(links)

        self.wrapper.append(linksContainer)
    }

    function hide() {
        self.wrapper.remove()
    }

    function createElements() {
        self.closeButton = document.createElement('button')
        self.closeButton.className = 'close-button'
        self.closeButton.innerHTML = getCloseButtonHtml()
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

    function getCloseButtonHtml() {
        return `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 460.775 460.775" style="enable-background:new 0 0 460.775 460.775;" xml:space="preserve"><path d="M285.08,230.397L456.218,59.27c6.076-6.077,6.076-15.911,0-21.986L423.511,4.565c-2.913-2.911-6.866-4.55-10.992-4.55 c-4.127,0-8.08,1.639-10.993,4.55l-171.138,171.14L59.25,4.565c-2.913-2.911-6.866-4.55-10.993-4.55 c-4.126,0-8.08,1.639-10.992,4.55L4.558,37.284c-6.077,6.075-6.077,15.909,0,21.986l171.138,171.128L4.575,401.505 c-6.074,6.077-6.074,15.911,0,21.986l32.709,32.719c2.911,2.911,6.865,4.55,10.992,4.55c4.127,0,8.08-1.639,10.994-4.55 l171.117-171.12l171.118,171.12c2.913,2.911,6.866,4.55,10.993,4.55c4.128,0,8.081-1.639,10.992-4.55l32.709-32.719 c6.074-6.075,6.074-15.909,0-21.986L285.08,230.397z"/><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg>`
    }

    function addStyling() {
        var styleElementId = 'quick-copy-popup-styles'

        // Don't re-add styles if another popup instance already did it.
        if(document.getElementById(styleElementId)) return

        var style = document.createElement('style')

        style.id = styleElementId

        style.textContent = `
.close-button {
    background: transparent;
    border: none;
    color: white;
    position: absolute;
    top: 0;
    right: 0;
    font-size: 8em;
    padding: 0;
    margin: 0;
    display: block;
    height: 0.33em;
    aspect-ratio: 1/1;
}
.close-button svg {
vertical-align: top;
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
    padding: 0 .25em;
    position: absolute;
    top: 0;
    left: 0;
}


.quick-copy-popup__wrapper {
    position: absolute;
    background: #0156b2;
    left: 24%;
    top: 40%;
    width: 25vw;
    height: 18vw;
    border: solid 5px #0156b2;
    padding: 3em;
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
    position: absolute;
    bottom: 0;
    left: 0;
}

.quick-copy-popup__link-list {
    font-size: 1.5em;
}
.quick-copy-popup__link-list a {
    color: white;
    text-decoration: underline;
}
.quick-copy-popup__link-list__link::after {
    content: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M13.5 10.5L21 3' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M16 3L21 3L21 8' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M21 14V19C21 20.1046 20.1046 21 19 21H12H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H10' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E%0A");
    width: 16px;
    display: inline-block;
    margin-left: 2px;
    vertical-align: middle;
}
`
        document.head.appendChild(style)


    }

    createElements()

    return self;
}

function renderPopupLinks(links) {
    const container = document.createElement('ul')
    container.className = "quick-copy-popup__link-list"

    for (const [key, value] of Object.entries(links)) {
        const link = document.createElement('a')
        link.className = "quick-copy-popup__link-list__link"
        link.setAttribute('href', value)
        link.textContent = key


        const wrapper = document.createElement('li')
        wrapper.className = "quick-copy-popup__list-item"
        wrapper.append(link)

        container.append(wrapper)
    }

    return container
}
