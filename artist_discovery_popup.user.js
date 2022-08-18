// ==UserScript==
// @name         Ticketmaster/Live Nation EDP Discovery Popup
// @namespace    http://bubbleup.net/
// @version      0.1
// @description  Shows an alert popup on TM EDP to give you the discovery ID
// @author       daniel@bubbleup.net
// @match        https://www.ticketmaster.com/*/artist/*
// @match        https://www.livenation.com/artist/*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ticketmaster.com
// @grant        GM_addStyle
// @downloadURL  https://github.com/bubbleupdotnet/ln-userscripts/raw/main/artist_discovery_popup.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Create Discovery Popup
    var popup = document.createElement('div');
    popup.setAttribute('id', 'popup-container');

    var closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.setAttribute('class', 'close-button');
    closeButton.onclick = function(){ popup.style.display = 'none';};

    function getDiscoveryInfo() {
        var event = digitalData.page.attributes.discovery.attraction[0];

        return {
            'Artist' : event.name,
            'Artist ID' : event.id,
            'Artist Genre' : event.classifications.genre.name,
        }
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

    var details = getDiscoveryInfo();
    var message = formatObjectToString(details);

    var textarea = document.createElement('textarea');
    textarea.innerHTML = message;

    var copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.innerHTML = 'Copy Content';
    copyButton.onclick = function() {
        navigator.clipboard.writeText(textarea.value).then(() => {
            alert("Copied to clipboard!");
        });
    };

    var popupEndText = document.createElement('p');
    popupEndText.innerHTML = 'Tip: You can disable this popup in the TamperMonkey extension.';

    document.body.appendChild(popup);
    popup.appendChild(closeButton);
    popup.appendChild(textarea);
    popup.appendChild(copyButton);
    popup.appendChild(popupEndText);
})();

GM_addStyle ( `
    #popup-container {
        position: absolute;
        top: 8%;
        left: 38.25%;
        margin: 0;
        padding: 9px;
        background: #0156B2;
        box-shadow: rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px;;
        display: block;
        width: 26%;
        height: 28%;
    }

    .close-button {
        float: right;
        background: transparent;
        border: none;
        color: white;
        font-size: 1.5em;
        cursor: pointer;
    }

    textarea {
        background: #0156B2;
        color: white;
        font-size: 1.25em;
        text-align: center;
        width: 100%;
        height: 55%;
        resize: none;
        outline: none;
        border: none;
        margin: 0 auto;
    }

    .copy-button {
        background: rgb(255, 255, 255);
        border: solid black;
        border-radius: .25em;
        color: black;
        font-size: 1em;
        text-align: center;
        margin: 0 9em;
        cursor: pointer;
    }

    .copy-button:hover {
       background: #ccc;
       cursor: pointer;
    }

    p {
        font-size: .75em;
        color: white;
    }
` );
