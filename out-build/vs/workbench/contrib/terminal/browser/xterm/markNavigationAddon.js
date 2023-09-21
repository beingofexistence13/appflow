/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/base/common/async", "vs/platform/theme/common/themeService", "vs/workbench/contrib/terminal/common/terminalColorRegistry"], function (require, exports, arrays_1, lifecycle_1, async_1, themeService_1, terminalColorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Mfb = exports.$Lfb = exports.$Kfb = exports.ScrollPosition = void 0;
    var Boundary;
    (function (Boundary) {
        Boundary[Boundary["Top"] = 0] = "Top";
        Boundary[Boundary["Bottom"] = 1] = "Bottom";
    })(Boundary || (Boundary = {}));
    var ScrollPosition;
    (function (ScrollPosition) {
        ScrollPosition[ScrollPosition["Top"] = 0] = "Top";
        ScrollPosition[ScrollPosition["Middle"] = 1] = "Middle";
    })(ScrollPosition || (exports.ScrollPosition = ScrollPosition = {}));
    let $Kfb = class $Kfb extends lifecycle_1.$kc {
        activate(terminal) {
            this.f = terminal;
            this.B(this.f.onData(() => {
                this.a = Boundary.Bottom;
            }));
        }
        constructor(h, j) {
            super();
            this.h = h;
            this.j = j;
            this.a = Boundary.Bottom;
            this.b = null;
            this.c = false;
        }
        m(skipEmptyCommands) {
            const commandCapability = this.h.get(2 /* TerminalCapability.CommandDetection */);
            const partialCommandCapability = this.h.get(3 /* TerminalCapability.PartialCommandDetection */);
            const markCapability = this.h.get(4 /* TerminalCapability.BufferMarkDetection */);
            let markers = [];
            if (commandCapability) {
                markers = (0, arrays_1.$Fb)(commandCapability.commands.map(e => e.marker));
            }
            else if (partialCommandCapability) {
                markers.push(...partialCommandCapability.commands);
            }
            if (markCapability && !skipEmptyCommands) {
                let next = markCapability.markers().next()?.value;
                const arr = [];
                while (next) {
                    arr.push(next);
                    next = markCapability.markers().next()?.value;
                }
                markers = arr;
            }
            return markers;
        }
        clearMarker() {
            // Clear the current marker so successive focus/selection actions are performed from the
            // bottom of the buffer
            this.a = Boundary.Bottom;
            this.n();
            this.b = null;
        }
        n() {
            if (this.g) {
                (0, lifecycle_1.$fc)(this.g);
            }
            this.g = [];
        }
        r(marker) {
            if (marker === Boundary.Bottom) {
                return true;
            }
            if (marker === Boundary.Top) {
                return !this.m(true).map(e => e.line).includes(0);
            }
            return !this.m(true).includes(marker);
        }
        scrollToPreviousMark(scrollPosition = 1 /* ScrollPosition.Middle */, retainSelection = false, skipEmptyCommands = false) {
            if (!this.f) {
                return;
            }
            if (!retainSelection) {
                this.b = null;
            }
            let markerIndex;
            const currentLineY = typeof this.a === 'object'
                ? this.w(this.f, this.a, scrollPosition)
                : Math.min($Lfb(this.f, this.a), this.f.buffer.active.baseY);
            const viewportY = this.f.buffer.active.viewportY;
            if (typeof this.a === 'object' ? !this.y(this.f, this.a) : currentLineY !== viewportY) {
                // The user has scrolled, find the line based on the current scroll position. This only
                // works when not retaining selection
                const markersBelowViewport = this.m(skipEmptyCommands).filter(e => e.line >= viewportY).length;
                // -1 will scroll to the top
                markerIndex = this.m(skipEmptyCommands).length - markersBelowViewport - 1;
            }
            else if (this.a === Boundary.Bottom) {
                markerIndex = this.m(skipEmptyCommands).length - 1;
            }
            else if (this.a === Boundary.Top) {
                markerIndex = -1;
            }
            else if (this.c) {
                markerIndex = this.D(this.f, skipEmptyCommands);
                this.a.dispose();
                this.c = false;
            }
            else {
                if (skipEmptyCommands && this.r(this.a)) {
                    markerIndex = this.D(this.f, true);
                }
                else {
                    markerIndex = this.m(skipEmptyCommands).indexOf(this.a) - 1;
                }
            }
            if (markerIndex < 0) {
                this.a = Boundary.Top;
                this.f.scrollToTop();
                this.n();
                return;
            }
            this.a = this.m(skipEmptyCommands)[markerIndex];
            this.s(this.a, scrollPosition);
        }
        scrollToNextMark(scrollPosition = 1 /* ScrollPosition.Middle */, retainSelection = false, skipEmptyCommands = true) {
            if (!this.f) {
                return;
            }
            if (!retainSelection) {
                this.b = null;
            }
            let markerIndex;
            const currentLineY = typeof this.a === 'object'
                ? this.w(this.f, this.a, scrollPosition)
                : Math.min($Lfb(this.f, this.a), this.f.buffer.active.baseY);
            const viewportY = this.f.buffer.active.viewportY;
            if (typeof this.a === 'object' ? !this.y(this.f, this.a) : currentLineY !== viewportY) {
                // The user has scrolled, find the line based on the current scroll position. This only
                // works when not retaining selection
                const markersAboveViewport = this.m(skipEmptyCommands).filter(e => e.line <= viewportY).length;
                // markers.length will scroll to the bottom
                markerIndex = markersAboveViewport;
            }
            else if (this.a === Boundary.Bottom) {
                markerIndex = this.m(skipEmptyCommands).length;
            }
            else if (this.a === Boundary.Top) {
                markerIndex = 0;
            }
            else if (this.c) {
                markerIndex = this.F(this.f, skipEmptyCommands);
                this.a.dispose();
                this.c = false;
            }
            else {
                if (skipEmptyCommands && this.r(this.a)) {
                    markerIndex = this.F(this.f, true);
                }
                else {
                    markerIndex = this.m(skipEmptyCommands).indexOf(this.a) + 1;
                }
            }
            if (markerIndex >= this.m(skipEmptyCommands).length) {
                this.a = Boundary.Bottom;
                this.f.scrollToBottom();
                this.n();
                return;
            }
            this.a = this.m(skipEmptyCommands)[markerIndex];
            this.s(this.a, scrollPosition);
        }
        s(marker, position, endMarker, hideDecoration) {
            if (!this.f) {
                return;
            }
            if (!this.y(this.f, marker)) {
                const line = this.w(this.f, marker, position);
                this.f.scrollToLine(line);
            }
            if (!hideDecoration) {
                this.u(marker, endMarker);
            }
        }
        t(marker, offset) {
            if (offset === 0) {
                return marker;
            }
            else {
                const offsetMarker = this.f?.registerMarker(-this.f.buffer.active.cursorY + marker.line - this.f.buffer.active.baseY + offset);
                if (offsetMarker) {
                    return offsetMarker;
                }
                else {
                    throw new Error(`Could not register marker with offset ${marker.line}, ${offset}`);
                }
            }
        }
        u(marker, endMarker) {
            if (!this.f) {
                return;
            }
            this.n();
            const color = this.j.getColorTheme().getColor(terminalColorRegistry_1.$yfb);
            const startLine = marker.line;
            const decorationCount = endMarker ? endMarker.line - startLine + 1 : 1;
            for (let i = 0; i < decorationCount; i++) {
                const decoration = this.f.registerDecoration({
                    marker: this.t(marker, i),
                    width: this.f.cols,
                    overviewRulerOptions: {
                        color: color?.toString() || '#a0a0a0cc'
                    }
                });
                if (decoration) {
                    this.g?.push(decoration);
                    let renderedElement;
                    decoration.onRender(element => {
                        if (!renderedElement) {
                            renderedElement = element;
                            if (decorationCount > 1) {
                                element.classList.add('terminal-scroll-highlight');
                            }
                            else {
                                element.classList.add('terminal-scroll-highlight', 'terminal-scroll-highlight-outline');
                            }
                            if (this.f?.element) {
                                element.style.marginLeft = `-${getComputedStyle(this.f.element).paddingLeft}`;
                            }
                        }
                    });
                    decoration.onDispose(() => { this.g = this.g?.filter(d => d !== decoration); });
                    // Number picked to align with symbol highlight in the editor
                    (0, async_1.$Hg)(350).then(() => {
                        if (renderedElement) {
                            renderedElement.classList.remove('terminal-scroll-highlight-outline');
                        }
                    });
                }
            }
        }
        w(terminal, marker, position) {
            // Middle is treated at 1/4 of the viewport's size because context below is almost always
            // more important than context above in the terminal.
            if (position === 1 /* ScrollPosition.Middle */) {
                return Math.max(marker.line - Math.floor(terminal.rows / 4), 0);
            }
            return marker.line;
        }
        y(terminal, marker) {
            const viewportY = terminal.buffer.active.viewportY;
            return marker.line >= viewportY && marker.line < viewportY + terminal.rows;
        }
        scrollToClosestMarker(startMarkerId, endMarkerId, highlight) {
            const detectionCapability = this.h.get(4 /* TerminalCapability.BufferMarkDetection */);
            if (!detectionCapability) {
                return;
            }
            const startMarker = detectionCapability.getMark(startMarkerId);
            if (!startMarker) {
                return;
            }
            const endMarker = endMarkerId ? detectionCapability.getMark(endMarkerId) : startMarker;
            this.s(startMarker, 0 /* ScrollPosition.Top */, endMarker, !highlight);
        }
        selectToPreviousMark() {
            if (!this.f) {
                return;
            }
            if (this.b === null) {
                this.b = this.a;
            }
            if (this.h.has(2 /* TerminalCapability.CommandDetection */)) {
                this.scrollToPreviousMark(1 /* ScrollPosition.Middle */, true, true);
            }
            else {
                this.scrollToPreviousMark(1 /* ScrollPosition.Middle */, true, false);
            }
            $Mfb(this.f, this.a, this.b);
        }
        selectToNextMark() {
            if (!this.f) {
                return;
            }
            if (this.b === null) {
                this.b = this.a;
            }
            if (this.h.has(2 /* TerminalCapability.CommandDetection */)) {
                this.scrollToNextMark(1 /* ScrollPosition.Middle */, true, true);
            }
            else {
                this.scrollToNextMark(1 /* ScrollPosition.Middle */, true, false);
            }
            $Mfb(this.f, this.a, this.b);
        }
        selectToPreviousLine() {
            if (!this.f) {
                return;
            }
            if (this.b === null) {
                this.b = this.a;
            }
            this.scrollToPreviousLine(this.f, 1 /* ScrollPosition.Middle */, true);
            $Mfb(this.f, this.a, this.b);
        }
        selectToNextLine() {
            if (!this.f) {
                return;
            }
            if (this.b === null) {
                this.b = this.a;
            }
            this.scrollToNextLine(this.f, 1 /* ScrollPosition.Middle */, true);
            $Mfb(this.f, this.a, this.b);
        }
        scrollToPreviousLine(xterm, scrollPosition = 1 /* ScrollPosition.Middle */, retainSelection = false) {
            if (!retainSelection) {
                this.b = null;
            }
            if (this.a === Boundary.Top) {
                xterm.scrollToTop();
                return;
            }
            if (this.a === Boundary.Bottom) {
                this.a = this.z(xterm, this.C(xterm) - 1);
            }
            else {
                const offset = this.C(xterm);
                if (this.c) {
                    this.a.dispose();
                }
                this.a = this.z(xterm, offset - 1);
            }
            this.c = true;
            this.s(this.a, scrollPosition);
        }
        scrollToNextLine(xterm, scrollPosition = 1 /* ScrollPosition.Middle */, retainSelection = false) {
            if (!retainSelection) {
                this.b = null;
            }
            if (this.a === Boundary.Bottom) {
                xterm.scrollToBottom();
                return;
            }
            if (this.a === Boundary.Top) {
                this.a = this.z(xterm, this.C(xterm) + 1);
            }
            else {
                const offset = this.C(xterm);
                if (this.c) {
                    this.a.dispose();
                }
                this.a = this.z(xterm, offset + 1);
            }
            this.c = true;
            this.s(this.a, scrollPosition);
        }
        z(xterm, cursorYOffset) {
            const marker = xterm.registerMarker(cursorYOffset);
            if (!marker) {
                throw new Error(`Could not create marker for ${cursorYOffset}`);
            }
            return marker;
        }
        C(xterm) {
            if (this.a === Boundary.Bottom) {
                return 0;
            }
            else if (this.a === Boundary.Top) {
                return 0 - (xterm.buffer.active.baseY + xterm.buffer.active.cursorY);
            }
            else {
                let offset = $Lfb(xterm, this.a);
                offset -= xterm.buffer.active.baseY + xterm.buffer.active.cursorY;
                return offset;
            }
        }
        D(xterm, skipEmptyCommands = false) {
            if (this.a === Boundary.Top) {
                return 0;
            }
            else if (this.a === Boundary.Bottom) {
                return this.m(skipEmptyCommands).length - 1;
            }
            let i;
            for (i = this.m(skipEmptyCommands).length - 1; i >= 0; i--) {
                if (this.m(skipEmptyCommands)[i].line < this.a.line) {
                    return i;
                }
            }
            return -1;
        }
        F(xterm, skipEmptyCommands = false) {
            if (this.a === Boundary.Top) {
                return 0;
            }
            else if (this.a === Boundary.Bottom) {
                return this.m(skipEmptyCommands).length - 1;
            }
            let i;
            for (i = 0; i < this.m(skipEmptyCommands).length; i++) {
                if (this.m(skipEmptyCommands)[i].line > this.a.line) {
                    return i;
                }
            }
            return this.m(skipEmptyCommands).length;
        }
    };
    exports.$Kfb = $Kfb;
    exports.$Kfb = $Kfb = __decorate([
        __param(1, themeService_1.$gv)
    ], $Kfb);
    function $Lfb(xterm, marker) {
        // Use the _second last_ row as the last row is likely the prompt
        if (marker === Boundary.Bottom) {
            return xterm.buffer.active.baseY + xterm.rows - 1;
        }
        if (marker === Boundary.Top) {
            return 0;
        }
        return marker.line;
    }
    exports.$Lfb = $Lfb;
    function $Mfb(xterm, start, end) {
        if (end === null) {
            end = Boundary.Bottom;
        }
        let startLine = $Lfb(xterm, start);
        let endLine = $Lfb(xterm, end);
        if (startLine > endLine) {
            const temp = startLine;
            startLine = endLine;
            endLine = temp;
        }
        // Subtract a line as the marker is on the line the command run, we do not want the next
        // command in the selection for the current command
        endLine -= 1;
        xterm.selectLines(startLine, endLine);
    }
    exports.$Mfb = $Mfb;
});
//# sourceMappingURL=markNavigationAddon.js.map