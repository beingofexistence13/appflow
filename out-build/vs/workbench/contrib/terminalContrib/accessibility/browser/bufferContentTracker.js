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
    exports.$tWb = void 0;
    let $tWb = class $tWb extends lifecycle_1.$kc {
        get lines() { return this.c; }
        constructor(f, g, h) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            /**
             * The number of wrapped lines in the viewport when the last cached marker was set
             */
            this.b = 0;
            this.c = [];
            this.bufferToEditorLineMapping = new Map();
        }
        reset() {
            this.c = [];
            this.a = undefined;
            this.update();
        }
        update() {
            if (this.a?.isDisposed) {
                // the terminal was cleared, reset the cache
                this.c = [];
                this.a = undefined;
            }
            this.m();
            this.j();
            this.n();
            this.a = this.B(this.f.raw.registerMarker());
            this.g.debug('Buffer content tracker: set ', this.c.length, ' lines');
        }
        j() {
            const buffer = this.f.raw.buffer.active;
            const start = this.a?.line ? this.a.line - this.f.raw.rows + 1 : 0;
            const end = buffer.baseY;
            if (start < 0 || start > end) {
                // in the viewport, no need to cache
                return;
            }
            // to keep the cache size down, remove any lines that are no longer in the scrollback
            const scrollback = this.h.getValue("terminal.integrated.scrollback" /* TerminalSettingId.Scrollback */);
            const maxBufferSize = scrollback + this.f.raw.rows - 1;
            const linesToAdd = end - start;
            if (linesToAdd + this.c.length > maxBufferSize) {
                const numToRemove = linesToAdd + this.c.length - maxBufferSize;
                for (let i = 0; i < numToRemove; i++) {
                    this.c.shift();
                }
                this.g.debug('Buffer content tracker: removed ', numToRemove, ' lines from top of cached lines, now ', this.c.length, ' lines');
            }
            // iterate through the buffer lines and add them to the editor line cache
            const cachedLines = [];
            let currentLine = '';
            for (let i = start; i < end; i++) {
                const line = buffer.getLine(i);
                if (!line) {
                    continue;
                }
                this.bufferToEditorLineMapping.set(i, this.c.length + cachedLines.length);
                const isWrapped = buffer.getLine(i + 1)?.isWrapped;
                currentLine += line.translateToString(!isWrapped);
                if (currentLine && !isWrapped || i === (buffer.baseY + this.f.raw.rows - 1)) {
                    if (line.length) {
                        cachedLines.push(currentLine);
                        currentLine = '';
                    }
                }
            }
            this.g.debug('Buffer content tracker:', cachedLines.length, ' lines cached');
            this.c.push(...cachedLines);
        }
        m() {
            if (!this.c.length) {
                return;
            }
            // remove previous viewport content in case it has changed
            let linesToRemove = this.b;
            let index = 1;
            while (linesToRemove) {
                this.bufferToEditorLineMapping.forEach((value, key) => { if (value === this.c.length - index) {
                    this.bufferToEditorLineMapping.delete(key);
                } });
                this.c.pop();
                index++;
                linesToRemove--;
            }
            this.g.debug('Buffer content tracker: removed lines from viewport, now ', this.c.length, ' lines cached');
        }
        n() {
            const buffer = this.f.raw.buffer.active;
            this.b = 0;
            let currentLine = '';
            for (let i = buffer.baseY; i < buffer.baseY + this.f.raw.rows; i++) {
                const line = buffer.getLine(i);
                if (!line) {
                    continue;
                }
                this.bufferToEditorLineMapping.set(i, this.c.length);
                const isWrapped = buffer.getLine(i + 1)?.isWrapped;
                currentLine += line.translateToString(!isWrapped);
                if (currentLine && !isWrapped || i === (buffer.baseY + this.f.raw.rows - 1)) {
                    if (currentLine.length) {
                        this.b++;
                        this.c.push(currentLine);
                        currentLine = '';
                    }
                }
            }
            this.g.debug('Viewport content update complete, ', this.c.length, ' lines in the viewport');
        }
    };
    exports.$tWb = $tWb;
    exports.$tWb = $tWb = __decorate([
        __param(1, terminal_1.$Zq),
        __param(2, configuration_1.$8h)
    ], $tWb);
});
//# sourceMappingURL=bufferContentTracker.js.map