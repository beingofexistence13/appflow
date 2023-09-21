/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/css!./aria"], function (require, exports, dom) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$_P = exports.$$P = exports.$0P = void 0;
    // Use a max length since we are inserting the whole msg in the DOM and that can cause browsers to freeze for long messages #94233
    const MAX_MESSAGE_LENGTH = 20000;
    let ariaContainer;
    let alertContainer;
    let alertContainer2;
    let statusContainer;
    let statusContainer2;
    function $0P(parent) {
        ariaContainer = document.createElement('div');
        ariaContainer.className = 'monaco-aria-container';
        const createAlertContainer = () => {
            const element = document.createElement('div');
            element.className = 'monaco-alert';
            element.setAttribute('role', 'alert');
            element.setAttribute('aria-atomic', 'true');
            ariaContainer.appendChild(element);
            return element;
        };
        alertContainer = createAlertContainer();
        alertContainer2 = createAlertContainer();
        const createStatusContainer = () => {
            const element = document.createElement('div');
            element.className = 'monaco-status';
            element.setAttribute('aria-live', 'polite');
            element.setAttribute('aria-atomic', 'true');
            ariaContainer.appendChild(element);
            return element;
        };
        statusContainer = createStatusContainer();
        statusContainer2 = createStatusContainer();
        parent.appendChild(ariaContainer);
    }
    exports.$0P = $0P;
    /**
     * Given the provided message, will make sure that it is read as alert to screen readers.
     */
    function $$P(msg) {
        if (!ariaContainer) {
            return;
        }
        // Use alternate containers such that duplicated messages get read out by screen readers #99466
        if (alertContainer.textContent !== msg) {
            dom.$lO(alertContainer2);
            insertMessage(alertContainer, msg);
        }
        else {
            dom.$lO(alertContainer);
            insertMessage(alertContainer2, msg);
        }
    }
    exports.$$P = $$P;
    /**
     * Given the provided message, will make sure that it is read as status to screen readers.
     */
    function $_P(msg) {
        if (!ariaContainer) {
            return;
        }
        if (statusContainer.textContent !== msg) {
            dom.$lO(statusContainer2);
            insertMessage(statusContainer, msg);
        }
        else {
            dom.$lO(statusContainer);
            insertMessage(statusContainer2, msg);
        }
    }
    exports.$_P = $_P;
    function insertMessage(target, msg) {
        dom.$lO(target);
        if (msg.length > MAX_MESSAGE_LENGTH) {
            msg = msg.substr(0, MAX_MESSAGE_LENGTH);
        }
        target.textContent = msg;
        // See https://www.paciellogroup.com/blog/2012/06/html5-accessibility-chops-aria-rolealert-browser-support/
        target.style.visibility = 'hidden';
        target.style.visibility = 'visible';
    }
});
//# sourceMappingURL=aria.js.map