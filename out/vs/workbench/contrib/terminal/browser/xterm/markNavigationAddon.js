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
    exports.selectLines = exports.getLine = exports.MarkNavigationAddon = exports.ScrollPosition = void 0;
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
    let MarkNavigationAddon = class MarkNavigationAddon extends lifecycle_1.Disposable {
        activate(terminal) {
            this._terminal = terminal;
            this._register(this._terminal.onData(() => {
                this._currentMarker = Boundary.Bottom;
            }));
        }
        constructor(_capabilities, _themeService) {
            super();
            this._capabilities = _capabilities;
            this._themeService = _themeService;
            this._currentMarker = Boundary.Bottom;
            this._selectionStart = null;
            this._isDisposable = false;
        }
        _getMarkers(skipEmptyCommands) {
            const commandCapability = this._capabilities.get(2 /* TerminalCapability.CommandDetection */);
            const partialCommandCapability = this._capabilities.get(3 /* TerminalCapability.PartialCommandDetection */);
            const markCapability = this._capabilities.get(4 /* TerminalCapability.BufferMarkDetection */);
            let markers = [];
            if (commandCapability) {
                markers = (0, arrays_1.coalesce)(commandCapability.commands.map(e => e.marker));
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
            this._currentMarker = Boundary.Bottom;
            this._resetNavigationDecorations();
            this._selectionStart = null;
        }
        _resetNavigationDecorations() {
            if (this._navigationDecorations) {
                (0, lifecycle_1.dispose)(this._navigationDecorations);
            }
            this._navigationDecorations = [];
        }
        _isEmptyCommand(marker) {
            if (marker === Boundary.Bottom) {
                return true;
            }
            if (marker === Boundary.Top) {
                return !this._getMarkers(true).map(e => e.line).includes(0);
            }
            return !this._getMarkers(true).includes(marker);
        }
        scrollToPreviousMark(scrollPosition = 1 /* ScrollPosition.Middle */, retainSelection = false, skipEmptyCommands = false) {
            if (!this._terminal) {
                return;
            }
            if (!retainSelection) {
                this._selectionStart = null;
            }
            let markerIndex;
            const currentLineY = typeof this._currentMarker === 'object'
                ? this._getTargetScrollLine(this._terminal, this._currentMarker, scrollPosition)
                : Math.min(getLine(this._terminal, this._currentMarker), this._terminal.buffer.active.baseY);
            const viewportY = this._terminal.buffer.active.viewportY;
            if (typeof this._currentMarker === 'object' ? !this._isMarkerInViewport(this._terminal, this._currentMarker) : currentLineY !== viewportY) {
                // The user has scrolled, find the line based on the current scroll position. This only
                // works when not retaining selection
                const markersBelowViewport = this._getMarkers(skipEmptyCommands).filter(e => e.line >= viewportY).length;
                // -1 will scroll to the top
                markerIndex = this._getMarkers(skipEmptyCommands).length - markersBelowViewport - 1;
            }
            else if (this._currentMarker === Boundary.Bottom) {
                markerIndex = this._getMarkers(skipEmptyCommands).length - 1;
            }
            else if (this._currentMarker === Boundary.Top) {
                markerIndex = -1;
            }
            else if (this._isDisposable) {
                markerIndex = this._findPreviousMarker(this._terminal, skipEmptyCommands);
                this._currentMarker.dispose();
                this._isDisposable = false;
            }
            else {
                if (skipEmptyCommands && this._isEmptyCommand(this._currentMarker)) {
                    markerIndex = this._findPreviousMarker(this._terminal, true);
                }
                else {
                    markerIndex = this._getMarkers(skipEmptyCommands).indexOf(this._currentMarker) - 1;
                }
            }
            if (markerIndex < 0) {
                this._currentMarker = Boundary.Top;
                this._terminal.scrollToTop();
                this._resetNavigationDecorations();
                return;
            }
            this._currentMarker = this._getMarkers(skipEmptyCommands)[markerIndex];
            this._scrollToMarker(this._currentMarker, scrollPosition);
        }
        scrollToNextMark(scrollPosition = 1 /* ScrollPosition.Middle */, retainSelection = false, skipEmptyCommands = true) {
            if (!this._terminal) {
                return;
            }
            if (!retainSelection) {
                this._selectionStart = null;
            }
            let markerIndex;
            const currentLineY = typeof this._currentMarker === 'object'
                ? this._getTargetScrollLine(this._terminal, this._currentMarker, scrollPosition)
                : Math.min(getLine(this._terminal, this._currentMarker), this._terminal.buffer.active.baseY);
            const viewportY = this._terminal.buffer.active.viewportY;
            if (typeof this._currentMarker === 'object' ? !this._isMarkerInViewport(this._terminal, this._currentMarker) : currentLineY !== viewportY) {
                // The user has scrolled, find the line based on the current scroll position. This only
                // works when not retaining selection
                const markersAboveViewport = this._getMarkers(skipEmptyCommands).filter(e => e.line <= viewportY).length;
                // markers.length will scroll to the bottom
                markerIndex = markersAboveViewport;
            }
            else if (this._currentMarker === Boundary.Bottom) {
                markerIndex = this._getMarkers(skipEmptyCommands).length;
            }
            else if (this._currentMarker === Boundary.Top) {
                markerIndex = 0;
            }
            else if (this._isDisposable) {
                markerIndex = this._findNextMarker(this._terminal, skipEmptyCommands);
                this._currentMarker.dispose();
                this._isDisposable = false;
            }
            else {
                if (skipEmptyCommands && this._isEmptyCommand(this._currentMarker)) {
                    markerIndex = this._findNextMarker(this._terminal, true);
                }
                else {
                    markerIndex = this._getMarkers(skipEmptyCommands).indexOf(this._currentMarker) + 1;
                }
            }
            if (markerIndex >= this._getMarkers(skipEmptyCommands).length) {
                this._currentMarker = Boundary.Bottom;
                this._terminal.scrollToBottom();
                this._resetNavigationDecorations();
                return;
            }
            this._currentMarker = this._getMarkers(skipEmptyCommands)[markerIndex];
            this._scrollToMarker(this._currentMarker, scrollPosition);
        }
        _scrollToMarker(marker, position, endMarker, hideDecoration) {
            if (!this._terminal) {
                return;
            }
            if (!this._isMarkerInViewport(this._terminal, marker)) {
                const line = this._getTargetScrollLine(this._terminal, marker, position);
                this._terminal.scrollToLine(line);
            }
            if (!hideDecoration) {
                this._registerTemporaryDecoration(marker, endMarker);
            }
        }
        _createMarkerForOffset(marker, offset) {
            if (offset === 0) {
                return marker;
            }
            else {
                const offsetMarker = this._terminal?.registerMarker(-this._terminal.buffer.active.cursorY + marker.line - this._terminal.buffer.active.baseY + offset);
                if (offsetMarker) {
                    return offsetMarker;
                }
                else {
                    throw new Error(`Could not register marker with offset ${marker.line}, ${offset}`);
                }
            }
        }
        _registerTemporaryDecoration(marker, endMarker) {
            if (!this._terminal) {
                return;
            }
            this._resetNavigationDecorations();
            const color = this._themeService.getColorTheme().getColor(terminalColorRegistry_1.TERMINAL_OVERVIEW_RULER_CURSOR_FOREGROUND_COLOR);
            const startLine = marker.line;
            const decorationCount = endMarker ? endMarker.line - startLine + 1 : 1;
            for (let i = 0; i < decorationCount; i++) {
                const decoration = this._terminal.registerDecoration({
                    marker: this._createMarkerForOffset(marker, i),
                    width: this._terminal.cols,
                    overviewRulerOptions: {
                        color: color?.toString() || '#a0a0a0cc'
                    }
                });
                if (decoration) {
                    this._navigationDecorations?.push(decoration);
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
                            if (this._terminal?.element) {
                                element.style.marginLeft = `-${getComputedStyle(this._terminal.element).paddingLeft}`;
                            }
                        }
                    });
                    decoration.onDispose(() => { this._navigationDecorations = this._navigationDecorations?.filter(d => d !== decoration); });
                    // Number picked to align with symbol highlight in the editor
                    (0, async_1.timeout)(350).then(() => {
                        if (renderedElement) {
                            renderedElement.classList.remove('terminal-scroll-highlight-outline');
                        }
                    });
                }
            }
        }
        _getTargetScrollLine(terminal, marker, position) {
            // Middle is treated at 1/4 of the viewport's size because context below is almost always
            // more important than context above in the terminal.
            if (position === 1 /* ScrollPosition.Middle */) {
                return Math.max(marker.line - Math.floor(terminal.rows / 4), 0);
            }
            return marker.line;
        }
        _isMarkerInViewport(terminal, marker) {
            const viewportY = terminal.buffer.active.viewportY;
            return marker.line >= viewportY && marker.line < viewportY + terminal.rows;
        }
        scrollToClosestMarker(startMarkerId, endMarkerId, highlight) {
            const detectionCapability = this._capabilities.get(4 /* TerminalCapability.BufferMarkDetection */);
            if (!detectionCapability) {
                return;
            }
            const startMarker = detectionCapability.getMark(startMarkerId);
            if (!startMarker) {
                return;
            }
            const endMarker = endMarkerId ? detectionCapability.getMark(endMarkerId) : startMarker;
            this._scrollToMarker(startMarker, 0 /* ScrollPosition.Top */, endMarker, !highlight);
        }
        selectToPreviousMark() {
            if (!this._terminal) {
                return;
            }
            if (this._selectionStart === null) {
                this._selectionStart = this._currentMarker;
            }
            if (this._capabilities.has(2 /* TerminalCapability.CommandDetection */)) {
                this.scrollToPreviousMark(1 /* ScrollPosition.Middle */, true, true);
            }
            else {
                this.scrollToPreviousMark(1 /* ScrollPosition.Middle */, true, false);
            }
            selectLines(this._terminal, this._currentMarker, this._selectionStart);
        }
        selectToNextMark() {
            if (!this._terminal) {
                return;
            }
            if (this._selectionStart === null) {
                this._selectionStart = this._currentMarker;
            }
            if (this._capabilities.has(2 /* TerminalCapability.CommandDetection */)) {
                this.scrollToNextMark(1 /* ScrollPosition.Middle */, true, true);
            }
            else {
                this.scrollToNextMark(1 /* ScrollPosition.Middle */, true, false);
            }
            selectLines(this._terminal, this._currentMarker, this._selectionStart);
        }
        selectToPreviousLine() {
            if (!this._terminal) {
                return;
            }
            if (this._selectionStart === null) {
                this._selectionStart = this._currentMarker;
            }
            this.scrollToPreviousLine(this._terminal, 1 /* ScrollPosition.Middle */, true);
            selectLines(this._terminal, this._currentMarker, this._selectionStart);
        }
        selectToNextLine() {
            if (!this._terminal) {
                return;
            }
            if (this._selectionStart === null) {
                this._selectionStart = this._currentMarker;
            }
            this.scrollToNextLine(this._terminal, 1 /* ScrollPosition.Middle */, true);
            selectLines(this._terminal, this._currentMarker, this._selectionStart);
        }
        scrollToPreviousLine(xterm, scrollPosition = 1 /* ScrollPosition.Middle */, retainSelection = false) {
            if (!retainSelection) {
                this._selectionStart = null;
            }
            if (this._currentMarker === Boundary.Top) {
                xterm.scrollToTop();
                return;
            }
            if (this._currentMarker === Boundary.Bottom) {
                this._currentMarker = this._registerMarkerOrThrow(xterm, this._getOffset(xterm) - 1);
            }
            else {
                const offset = this._getOffset(xterm);
                if (this._isDisposable) {
                    this._currentMarker.dispose();
                }
                this._currentMarker = this._registerMarkerOrThrow(xterm, offset - 1);
            }
            this._isDisposable = true;
            this._scrollToMarker(this._currentMarker, scrollPosition);
        }
        scrollToNextLine(xterm, scrollPosition = 1 /* ScrollPosition.Middle */, retainSelection = false) {
            if (!retainSelection) {
                this._selectionStart = null;
            }
            if (this._currentMarker === Boundary.Bottom) {
                xterm.scrollToBottom();
                return;
            }
            if (this._currentMarker === Boundary.Top) {
                this._currentMarker = this._registerMarkerOrThrow(xterm, this._getOffset(xterm) + 1);
            }
            else {
                const offset = this._getOffset(xterm);
                if (this._isDisposable) {
                    this._currentMarker.dispose();
                }
                this._currentMarker = this._registerMarkerOrThrow(xterm, offset + 1);
            }
            this._isDisposable = true;
            this._scrollToMarker(this._currentMarker, scrollPosition);
        }
        _registerMarkerOrThrow(xterm, cursorYOffset) {
            const marker = xterm.registerMarker(cursorYOffset);
            if (!marker) {
                throw new Error(`Could not create marker for ${cursorYOffset}`);
            }
            return marker;
        }
        _getOffset(xterm) {
            if (this._currentMarker === Boundary.Bottom) {
                return 0;
            }
            else if (this._currentMarker === Boundary.Top) {
                return 0 - (xterm.buffer.active.baseY + xterm.buffer.active.cursorY);
            }
            else {
                let offset = getLine(xterm, this._currentMarker);
                offset -= xterm.buffer.active.baseY + xterm.buffer.active.cursorY;
                return offset;
            }
        }
        _findPreviousMarker(xterm, skipEmptyCommands = false) {
            if (this._currentMarker === Boundary.Top) {
                return 0;
            }
            else if (this._currentMarker === Boundary.Bottom) {
                return this._getMarkers(skipEmptyCommands).length - 1;
            }
            let i;
            for (i = this._getMarkers(skipEmptyCommands).length - 1; i >= 0; i--) {
                if (this._getMarkers(skipEmptyCommands)[i].line < this._currentMarker.line) {
                    return i;
                }
            }
            return -1;
        }
        _findNextMarker(xterm, skipEmptyCommands = false) {
            if (this._currentMarker === Boundary.Top) {
                return 0;
            }
            else if (this._currentMarker === Boundary.Bottom) {
                return this._getMarkers(skipEmptyCommands).length - 1;
            }
            let i;
            for (i = 0; i < this._getMarkers(skipEmptyCommands).length; i++) {
                if (this._getMarkers(skipEmptyCommands)[i].line > this._currentMarker.line) {
                    return i;
                }
            }
            return this._getMarkers(skipEmptyCommands).length;
        }
    };
    exports.MarkNavigationAddon = MarkNavigationAddon;
    exports.MarkNavigationAddon = MarkNavigationAddon = __decorate([
        __param(1, themeService_1.IThemeService)
    ], MarkNavigationAddon);
    function getLine(xterm, marker) {
        // Use the _second last_ row as the last row is likely the prompt
        if (marker === Boundary.Bottom) {
            return xterm.buffer.active.baseY + xterm.rows - 1;
        }
        if (marker === Boundary.Top) {
            return 0;
        }
        return marker.line;
    }
    exports.getLine = getLine;
    function selectLines(xterm, start, end) {
        if (end === null) {
            end = Boundary.Bottom;
        }
        let startLine = getLine(xterm, start);
        let endLine = getLine(xterm, end);
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
    exports.selectLines = selectLines;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya05hdmlnYXRpb25BZGRvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsL2Jyb3dzZXIveHRlcm0vbWFya05hdmlnYXRpb25BZGRvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFXaEcsSUFBSyxRQUdKO0lBSEQsV0FBSyxRQUFRO1FBQ1oscUNBQUcsQ0FBQTtRQUNILDJDQUFNLENBQUE7SUFDUCxDQUFDLEVBSEksUUFBUSxLQUFSLFFBQVEsUUFHWjtJQUVELElBQWtCLGNBR2pCO0lBSEQsV0FBa0IsY0FBYztRQUMvQixpREFBRyxDQUFBO1FBQ0gsdURBQU0sQ0FBQTtJQUNQLENBQUMsRUFIaUIsY0FBYyw4QkFBZCxjQUFjLFFBRy9CO0lBRU0sSUFBTSxtQkFBbUIsR0FBekIsTUFBTSxtQkFBb0IsU0FBUSxzQkFBVTtRQU9sRCxRQUFRLENBQUMsUUFBa0I7WUFDMUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7WUFDMUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUU7Z0JBQ3pDLElBQUksQ0FBQyxjQUFjLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUN2QyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVELFlBQ2tCLGFBQXVDLEVBQ3pDLGFBQTZDO1lBRTVELEtBQUssRUFBRSxDQUFDO1lBSFMsa0JBQWEsR0FBYixhQUFhLENBQTBCO1lBQ3hCLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1lBZnJELG1CQUFjLEdBQXVCLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFDckQsb0JBQWUsR0FBOEIsSUFBSSxDQUFDO1lBQ2xELGtCQUFhLEdBQVksS0FBSyxDQUFDO1FBZ0J2QyxDQUFDO1FBRU8sV0FBVyxDQUFD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