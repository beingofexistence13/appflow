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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/accessibility/common/accessibility", "vs/platform/terminal/common/terminal", "vs/base/common/decorators", "vs/base/browser/dom"], function (require, exports, lifecycle_1, accessibility_1, terminal_1, decorators_1, dom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$vWb = void 0;
    let $vWb = class $vWb extends lifecycle_1.$kc {
        activate(terminal) {
            this.a = terminal;
            if (this.h.isScreenReaderOptimized()) {
                this.m();
            }
        }
        constructor(g, h, j) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.b = this.B(new lifecycle_1.$lc());
            this.B(this.h.onDidChangeScreenReaderOptimized(() => {
                if (this.h.isScreenReaderOptimized()) {
                    this.n();
                    this.m();
                }
                else {
                    this.b.clear();
                }
            }));
        }
        m() {
            if (this.h.isScreenReaderOptimized() && this.a?.textarea) {
                this.b.value = new lifecycle_1.$jc();
                this.b.value.add(this.a.onCursorMove(() => this.n()));
                this.b.value.add(this.a.onData(() => this.n()));
                this.b.value.add((0, dom_1.$nO)(this.a.textarea, 'focus', () => this.n()));
            }
        }
        n() {
            this.j.debug('TextAreaSyncAddon#syncTextArea');
            const textArea = this.a?.textarea;
            if (!textArea) {
                this.j.debug(`TextAreaSyncAddon#syncTextArea: no textarea`);
                return;
            }
            this.r();
            if (this.c !== textArea.value) {
                textArea.value = this.c || '';
                this.j.debug(`TextAreaSyncAddon#syncTextArea: text changed to "${this.c}"`);
            }
            else if (!this.c) {
                textArea.value = '';
                this.j.debug(`TextAreaSyncAddon#syncTextArea: text cleared`);
            }
            if (this.f !== textArea.selectionStart) {
                textArea.selectionStart = this.f ?? 0;
                textArea.selectionEnd = this.f ?? 0;
                this.j.debug(`TextAreaSyncAddon#syncTextArea: selection start/end changed to ${this.f}`);
            }
        }
        r() {
            if (!this.a) {
                return;
            }
            const commandCapability = this.g.get(2 /* TerminalCapability.CommandDetection */);
            const currentCommand = commandCapability?.currentCommand;
            if (!currentCommand) {
                this.j.debug(`TextAreaSyncAddon#updateCommandAndCursor: no current command`);
                return;
            }
            const buffer = this.a.buffer.active;
            const lineNumber = currentCommand.commandStartMarker?.line;
            if (!lineNumber) {
                return;
            }
            const commandLine = buffer.getLine(lineNumber)?.translateToString(true);
            if (!commandLine) {
                this.j.debug(`TextAreaSyncAddon#updateCommandAndCursor: no line`);
                return;
            }
            if (currentCommand.commandStartX !== undefined) {
                this.c = commandLine.substring(currentCommand.commandStartX);
                this.f = buffer.cursorX - currentCommand.commandStartX;
            }
            else {
                this.c = undefined;
                this.f = undefined;
                this.j.debug(`TextAreaSyncAddon#updateCommandAndCursor: no commandStartX`);
            }
        }
    };
    exports.$vWb = $vWb;
    __decorate([
        (0, decorators_1.$7g)(50)
    ], $vWb.prototype, "n", null);
    exports.$vWb = $vWb = __decorate([
        __param(1, accessibility_1.$1r),
        __param(2, terminal_1.$Zq)
    ], $vWb);
});
//# sourceMappingURL=textAreaSyncAddon.js.map