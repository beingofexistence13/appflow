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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/platform/terminal/common/terminal"], function (require, exports, lifecycle_1, configuration_1, terminal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BufferContentTracker = void 0;
    let BufferContentTracker = class BufferContentTracker extends lifecycle_1.Disposable {
        get lines() { return this._lines; }
        constructor(_xterm, _logService, _configurationService) {
            super();
            this._xterm = _xterm;
            this._logService = _logService;
            this._configurationService = _configurationService;
            /**
             * The number of wrapped lines in the viewport when the last cached marker was set
             */
            this._priorEditorViewportLineCount = 0;
            this._lines = [];
            this.bufferToEditorLineMapping = new Map();
        }
        reset() {
            this._lines = [];
            this._lastCachedMarker = undefined;
            this.update();
        }
        update() {
            if (this._lastCachedMarker?.isDisposed) {
                // the terminal was cleared, reset the cache
                this._lines = [];
                this._lastCachedMarker = undefined;
            }
            this._removeViewportContent();
            this._updateCachedContent();
            this._updateViewportContent();
            this._lastCachedMarker = this._register(this._xterm.raw.registerMarker());
            this._logService.debug('Buffer content tracker: set ', this._lines.length, ' lines');
        }
        _updateCachedContent() {
            const buffer = this._xterm.raw.buffer.active;
            const start = this._lastCachedMarker?.line ? this._lastCachedMarker.line - this._xterm.raw.rows + 1 : 0;
            const end = buffer.baseY;
            if (start < 0 || start > end) {
                // in the viewport, no need to cache
                return;
            }
            // to keep the cache size down, remove any lines that are no longer in the scrollback
            const scrollback = this._configurationService.getValue("terminal.integrated.scrollback" /* TerminalSettingId.Scrollback */);
            const maxBufferSize = scrollback + this._xterm.raw.rows - 1;
            const linesToAdd = end - start;
            if (linesToAdd + this._lines.length > maxBufferSize) {
                const numToRemove = linesToAdd + this._lines.length - maxBufferSize;
                for (let i = 0; i < numToRemove; i++) {
                    this._lines.shift();
                }
                this._logService.debug('Buffer content tracker: removed ', numToRemove, ' lines from top of cached lines, now ', this._lines.length, ' lines');
            }
            // iterate through the buffer lines and add them to the editor line cache
            const cachedLines = [];
            let currentLine = '';
            for (let i = start; i < end; i++) {
                const line = buffer.getLine(i);
                if (!line) {
                    continue;
                }
                this.bufferToEditorLineMapping.set(i, this._lines.length + cachedLines.length);
                const isWrapped = buffer.getLine(i + 1)?.isWrapped;
                currentLine += line.translateToString(!isWrapped);
                if (currentLine && !isWrapped || i === (buffer.baseY + this._xterm.raw.rows - 1)) {
                    if (line.length) {
                        cachedLines.push(currentLine);
                        currentLine = '';
                    }
                }
            }
            this._logService.debug('Buffer content tracker:', cachedLines.length, ' lines cached');
            this._lines.push(...cachedLines);
        }
        _removeViewportContent() {
            if (!this._lines.length) {
                return;
            }
            // remove previous viewport content in case it has changed
            let linesToRemove = this._priorEditorViewportLineCount;
            let index = 1;
            while (linesToRemove) {
                this.bufferToEditorLineMapping.forEach((value, key) => { if (value === this._lines.length - index) {
                    this.bufferToEditorLineMapping.delete(key);
                } });
                this._lines.pop();
                index++;
                linesToRemove--;
            }
            this._logService.debug('Buffer content tracker: removed lines from viewport, now ', this._lines.length, ' lines cached');
        }
        _updateViewportContent() {
            const buffer = this._xterm.raw.buffer.active;
            this._priorEditorViewportLineCount = 0;
            let currentLine = '';
            for (let i = buffer.baseY; i < buffer.baseY + this._xterm.raw.rows; i++) {
                const line = buffer.getLine(i);
                if (!line) {
                    continue;
                }
                this.bufferToEditorLineMapping.set(i, this._lines.length);
                const isWrapped = buffer.getLine(i + 1)?.isWrapped;
                currentLine += line.translateToString(!isWrapped);
                if (currentLine && !isWrapped || i === (buffer.baseY + this._xterm.raw.rows - 1)) {
                    if (currentLine.length) {
                        this._priorEditorViewportLineCount++;
                        this._lines.push(currentLine);
                        currentLine = '';
                    }
                }
            }
            this._logService.debug('Viewport content update complete, ', this._lines.length, ' lines in the viewport');
        }
    };
    exports.BufferContentTracker = BufferContentTracker;
    exports.BufferContentTracker = BufferContentTracker = __decorate([
        __param(1, terminal_1.ITerminalLogService),
        __param(2, configuration_1.IConfigurationService)
    ], BufferContentTracker);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVmZmVyQ29udGVudFRyYWNrZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbENvbnRyaWIvYWNjZXNzaWJpbGl0eS9icm93c2VyL2J1ZmZlckNvbnRlbnRUcmFja2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVF6RixJQUFNLG9CQUFvQixHQUExQixNQUFNLG9CQUFxQixTQUFRLHNCQUFVO1FBV25ELElBQUksS0FBSyxLQUFlLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFJN0MsWUFDa0IsTUFBMkQsRUFDdkQsV0FBaUQsRUFDL0MscUJBQTZEO1lBQ3BGLEtBQUssRUFBRSxDQUFDO1lBSFMsV0FBTSxHQUFOLE1BQU0sQ0FBcUQ7WUFDdEMsZ0JBQVcsR0FBWCxXQUFXLENBQXFCO1lBQzlCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFickY7O2VBRUc7WUFDSyxrQ0FBNkIsR0FBVyxDQUFDLENBQUM7WUFFMUMsV0FBTSxHQUFhLEVBQUUsQ0FBQztZQUc5Qiw4QkFBeUIsR0FBd0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQU8zRCxDQUFDO1FBRUQsS0FBSztZQUNKLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1lBQ2pCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxTQUFTLENBQUM7WUFDbkMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2YsQ0FBQztRQUVELE1BQU07WUFDTCxJQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxVQUFVLEVBQUU7Z0JBQ3ZDLDRDQUE0QztnQkFDNUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7Z0JBQ2pCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxTQUFTLENBQUM7YUFDbkM7WUFDRCxJQUFJLENBQUMsc0JBQXNC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