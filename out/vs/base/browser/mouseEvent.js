/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/iframe", "vs/base/common/platform"], function (require, exports, browser, iframe_1, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StandardWheelEvent = exports.DragMouseEvent = exports.StandardMouseEvent = void 0;
    class StandardMouseEvent {
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
            const iframeOffsets = iframe_1.IframeUtils.getPositionOfChildWindowRelativeToAncestorWindow(window, e.view);
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
    exports.StandardMouseEvent = StandardMouseEvent;
    class DragMouseEvent extends StandardMouseEvent {
        constructor(e) {
            super(e);
            this.dataTransfer = e.dataTransfer;
        }
    }
    exports.DragMouseEvent = DragMouseEvent;
    class StandardWheelEvent {
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
                        if (browser.isFirefox && !platform.isMacintosh) {
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
                    if (browser.isSafari && platform.isWindows) {
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
                        if (browser.isFirefox && !platform.isMacintosh) {
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
    exports.StandardWheelEvent = StandardWheelEvent;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW91c2VFdmVudC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci9tb3VzZUV2ZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQTBCaEcsTUFBYSxrQkFBa0I7UUFrQjlCLFlBQVksQ0FBYTtZQUN4QixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUM1QixJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQztZQUN0QixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO1lBQ2pDLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztZQUNsQyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUM7WUFFekIsSUFBSSxDQUFDLE1BQU0sR0FBZ0IsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUVwQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDO1lBQzVCLElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxVQUFVLEVBQUU7Z0JBQzFCLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2FBQ2hCO1lBQ0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQztZQUMzQixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7WUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDO1lBRXpCLElBQUksT0FBTyxDQUFDLENBQUMs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