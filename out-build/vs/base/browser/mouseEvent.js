/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/iframe", "vs/base/common/platform"], function (require, exports, browser, iframe_1, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$gO = exports.$fO = exports.$eO = void 0;
    class $eO {
        constructor(e) {
            this.timestamp = Date.now();
            this.browserEvent = e;
            this.leftButton = e.button === 0;
            this.middleButton = e.button === 1;
            this.rightButton = e.button === 2;
            this.buttons = e.buttons;
            this.target = e.target;
            this.detail = e.detail || 1;
            if (e.type === 'dblclick') {
                this.detail = 2;
            }
            this.ctrlKey = e.ctrlKey;
            this.shiftKey = e.shiftKey;
            this.altKey = e.altKey;
            this.metaKey = e.metaKey;
            if (typeof e.pageX === 'number') {
                this.posx = e.pageX;
                this.posy = e.pageY;
            }
            else {
                // Probably hit by MSGestureEvent
                this.posx = e.clientX + this.target.ownerDocument.body.scrollLeft + this.target.ownerDocument.documentElement.scrollLeft;
                this.posy = e.clientY + this.target.ownerDocument.body.scrollTop + this.target.ownerDocument.documentElement.scrollTop;
            }
            // Find the position of the iframe this code is executing in relative to the iframe where the event was captured.
            const iframeOffsets = iframe_1.$cO.getPositionOfChildWindowRelativeToAncestorWindow(window, e.view);
            this.posx -= iframeOffsets.left;
            this.posy -= iframeOffsets.top;
        }
        preventDefault() {
            this.browserEvent.preventDefault();
        }
        stopPropagation() {
            this.browserEvent.stopPropagation();
        }
    }
    exports.$eO = $eO;
    class $fO extends $eO {
        constructor(e) {
            super(e);
            this.dataTransfer = e.dataTransfer;
        }
    }
    exports.$fO = $fO;
    class $gO {
        constructor(e, deltaX = 0, deltaY = 0) {
            this.browserEvent = e || null;
            this.target = e ? (e.target || e.targetNode || e.srcElement) : null;
            this.deltaY = deltaY;
            this.deltaX = deltaX;
            if (e) {
                // Old (deprecated) wheel events
                const e1 = e;
                const e2 = e;
                // vertical delta scroll
                if (typeof e1.wheelDeltaY !== 'undefined') {
                    this.deltaY = e1.wheelDeltaY / 120;
                }
                else if (typeof e2.VERTICAL_AXIS !== 'undefined' && e2.axis === e2.VERTICAL_AXIS) {
                    this.deltaY = -e2.detail / 3;
                }
                else if (e.type === 'wheel') {
                    // Modern wheel event
                    // https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent
                    const ev = e;
                    if (ev.deltaMode === ev.DOM_DELTA_LINE) {
                        // the deltas are expressed in lines
                        if (browser.$5N && !platform.$j) {
                            this.deltaY = -e.deltaY / 3;
                        }
                        else {
                            this.deltaY = -e.deltaY;
                        }
                    }
                    else {
                        this.deltaY = -e.deltaY / 40;
                    }
                }
                // horizontal delta scroll
                if (typeof e1.wheelDeltaX !== 'undefined') {
                    if (browser.$8N && platform.$i) {
                        this.deltaX = -(e1.wheelDeltaX / 120);
                    }
                    else {
                        this.deltaX = e1.wheelDeltaX / 120;
                    }
                }
                else if (typeof e2.HORIZONTAL_AXIS !== 'undefined' && e2.axis === e2.HORIZONTAL_AXIS) {
                    this.deltaX = -e.detail / 3;
                }
                else if (e.type === 'wheel') {
                    // Modern wheel event
                    // https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent
                    const ev = e;
                    if (ev.deltaMode === ev.DOM_DELTA_LINE) {
                        // the deltas are expressed in lines
                        if (browser.$5N && !platform.$j) {
                            this.deltaX = -e.deltaX / 3;
                        }
                        else {
                            this.deltaX = -e.deltaX;
                        }
                    }
                    else {
                        this.deltaX = -e.deltaX / 40;
                    }
                }
                // Assume a vertical scroll if nothing else worked
                if (this.deltaY === 0 && this.deltaX === 0 && e.wheelDelta) {
                    this.deltaY = e.wheelDelta / 120;
                }
            }
        }
        preventDefault() {
            this.browserEvent?.preventDefault();
        }
        stopPropagation() {
            this.browserEvent?.stopPropagation();
        }
    }
    exports.$gO = $gO;
});
//# sourceMappingURL=mouseEvent.js.map