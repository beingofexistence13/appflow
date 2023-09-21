/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$hib = void 0;
    var Constants;
    (function (Constants) {
        /**
         * The minimum size of the prompt in which to assume the line is a command.
         */
        Constants[Constants["MinimumPromptLength"] = 2] = "MinimumPromptLength";
    })(Constants || (Constants = {}));
    /**
     * This capability guesses where commands are based on where the cursor was when enter was pressed.
     * It's very hit or miss but it's often correct and better than nothing.
     */
    class $hib extends lifecycle_1.$jc {
        get commands() { return this.a; }
        constructor(c) {
            super();
            this.c = c;
            this.type = 3 /* TerminalCapability.PartialCommandDetection */;
            this.a = [];
            this.b = this.add(new event_1.$fd());
            this.onCommandFinished = this.b.event;
            this.add(this.c.onData(e => this.h(e)));
            this.add(this.c.parser.registerCsiHandler({ final: 'J' }, params => {
                if (params.length >= 1 && (params[0] === 2 || params[0] === 3)) {
                    this.m();
                }
                // We don't want to override xterm.js' default behavior, just augment it
                return false;
            }));
        }
        h(data) {
            if (data === '\x0d') {
                this.j();
            }
        }
        j() {
            if (!this.c) {
                return;
            }
            if (this.c.buffer.active.cursorX >= 2 /* Constants.MinimumPromptLength */) {
                const marker = this.c.registerMarker(0);
                if (marker) {
                    this.a.push(marker);
                    this.b.fire(marker);
                }
            }
        }
        m() {
            // Find the number of commands on the tail end of the array that are within the viewport
            let count = 0;
            for (let i = this.a.length - 1; i >= 0; i--) {
                if (this.a[i].line < this.c.buffer.active.baseY) {
                    break;
                }
                count++;
            }
            // Remove them
            this.a.splice(this.a.length - count, count);
        }
    }
    exports.$hib = $hib;
});
//# sourceMappingURL=partialCommandDetectionCapability.js.map