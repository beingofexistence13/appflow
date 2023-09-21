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
define(["require", "exports", "vs/base/common/path", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/node/ps", "vs/platform/log/common/log"], function (require, exports, path_1, decorators_1, event_1, lifecycle_1, ps_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$O$b = exports.$N$b = void 0;
    var Constants;
    (function (Constants) {
        /**
         * The amount of time to throttle checks when the process receives output.
         */
        Constants[Constants["InactiveThrottleDuration"] = 5000] = "InactiveThrottleDuration";
        /**
         * The amount of time to debounce check when the process receives input.
         */
        Constants[Constants["ActiveDebounceDuration"] = 1000] = "ActiveDebounceDuration";
    })(Constants || (Constants = {}));
    exports.$N$b = [];
    /**
     * Monitors a process for child processes, checking at differing times depending on input and output
     * calls into the monitor.
     */
    let $O$b = class $O$b extends lifecycle_1.$kc {
        set hasChildProcesses(value) {
            if (this.a !== value) {
                this.a = value;
                this.f.debug('ChildProcessMonitor: Has child processes changed', value);
                this.b.fire(value);
            }
        }
        /**
         * Whether the process has child processes.
         */
        get hasChildProcesses() { return this.a; }
        constructor(c, f) {
            super();
            this.c = c;
            this.f = f;
            this.a = false;
            this.b = this.B(new event_1.$fd());
            /**
             * An event that fires when whether the process has child processes changes.
             */
            this.onDidChangeHasChildProcesses = this.b.event;
        }
        /**
         * Input was triggered on the process.
         */
        handleInput() {
            this.g();
        }
        /**
         * Output was triggered on the process.
         */
        handleOutput() {
            this.h();
        }
        async g() {
            if (this.q.isDisposed) {
                return;
            }
            try {
                const processItem = await (0, ps_1.$sr)(this.c);
                this.hasChildProcesses = this.j(processItem);
            }
            catch (e) {
                this.f.debug('ChildProcessMonitor: Fetching process tree failed', e);
            }
        }
        h() {
            this.g();
        }
        j(processItem) {
            // No child processes
            if (!processItem.children) {
                return false;
            }
            // A single child process, handle special cases
            if (processItem.children.length === 1) {
                const item = processItem.children[0];
                let cmd;
                if (item.cmd.startsWith(`"`)) {
                    cmd = item.cmd.substring(1, item.cmd.indexOf(`"`, 1));
                }
                else {
                    const spaceIndex = item.cmd.indexOf(` `);
                    if (spaceIndex === -1) {
                        cmd = item.cmd;
                    }
                    else {
                        cmd = item.cmd.substring(0, spaceIndex);
                    }
                }
                return exports.$N$b.indexOf((0, path_1.$de)(cmd).name) === -1;
            }
            // Fallback, count child processes
            return processItem.children.length > 0;
        }
    };
    exports.$O$b = $O$b;
    __decorate([
        (0, decorators_1.$7g)(1000 /* Constants.ActiveDebounceDuration */)
    ], $O$b.prototype, "g", null);
    __decorate([
        (0, decorators_1.$8g)(5000 /* Constants.InactiveThrottleDuration */)
    ], $O$b.prototype, "h", null);
    exports.$O$b = $O$b = __decorate([
        __param(1, log_1.$5i)
    ], $O$b);
});
//# sourceMappingURL=childProcessMonitor.js.map