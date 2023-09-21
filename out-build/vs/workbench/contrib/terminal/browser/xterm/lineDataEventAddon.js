/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$0Vb = void 0;
    /**
     * Provides extensions to the xterm object in a modular, testable way.
     */
    class $0Vb extends lifecycle_1.$kc {
        constructor(f) {
            super();
            this.f = f;
            this.b = false;
            this.c = this.B(new event_1.$fd());
            this.onLineData = this.c.event;
        }
        async activate(xterm) {
            this.a = xterm;
            // If there is an initialization promise, wait for it before registering the event
            await this.f;
            // Fire onLineData when a line feed occurs, taking into account wrapped lines
            this.B(xterm.onLineFeed(() => {
                const buffer = xterm.buffer;
                const newLine = buffer.active.getLine(buffer.active.baseY + buffer.active.cursorY);
                if (newLine && !newLine.isWrapped) {
                    this.g(buffer.active, buffer.active.baseY + buffer.active.cursorY - 1);
                }
            }));
            // Fire onLineData when disposing object to flush last line
            this.B((0, lifecycle_1.$ic)(() => {
                const buffer = xterm.buffer;
                this.g(buffer.active, buffer.active.baseY + buffer.active.cursorY);
            }));
        }
        setOperatingSystem(os) {
            if (this.b || !this.a) {
                return;
            }
            this.b = true;
            // Force line data to be sent when the cursor is moved, the main purpose for
            // this is because ConPTY will often not do a line feed but instead move the
            // cursor, in which case we still want to send the current line's data to tasks.
            if (os === 1 /* OperatingSystem.Windows */) {
                const xterm = this.a;
                this.B(xterm.parser.registerCsiHandler({ final: 'H' }, () => {
                    const buffer = xterm.buffer;
                    this.g(buffer.active, buffer.active.baseY + buffer.active.cursorY);
                    return false;
                }));
            }
        }
        g(buffer, lineIndex) {
            let line = buffer.getLine(lineIndex);
            if (!line) {
                return;
            }
            let lineData = line.translateToString(true);
            while (lineIndex > 0 && line.isWrapped) {
                line = buffer.getLine(--lineIndex);
                if (!line) {
                    break;
                }
                lineData = line.translateToString(false) + lineData;
            }
            this.c.fire(lineData);
        }
    }
    exports.$0Vb = $0Vb;
});
//# sourceMappingURL=lineDataEventAddon.js.map