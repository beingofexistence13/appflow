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
    exports.ChildProcessMonitor = exports.ignoreProcessNames = void 0;
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
    exports.ignoreProcessNames = [];
    /**
     * Monitors a process for child processes, checking at differing times depending on input and output
     * calls into the monitor.
     */
    let ChildProcessMonitor = class ChildProcessMonitor extends lifecycle_1.Disposable {
        set hasChildProcesses(value) {
            if (this._hasChildProcesses !== value) {
                this._hasChildProcesses = value;
                this._logService.debug('ChildProcessMonitor: Has child processes changed', value);
                this._onDidChangeHasChildProcesses.fire(value);
            }
        }
        /**
         * Whether the process has child processes.
         */
        get hasChildProcesses() { return this._hasChildProcesses; }
        constructor(_pid, _logService) {
            super();
            this._pid = _pid;
            this._logService = _logService;
            this._hasChildProcesses = false;
            this._onDidChangeHasChildProcesses = this._register(new event_1.Emitter());
            /**
             * An event that fires when whether the process has child processes changes.
             */
            this.onDidChangeHasChildProcesses = this._onDidChangeHasChildProcesses.event;
        }
        /**
         * Input was triggered on the process.
         */
        handleInput() {
            this._refreshActive();
        }
        /**
         * Output was triggered on the process.
         */
        handleOutput() {
            this._refreshInactive();
        }
        async _refreshActive() {
            if (this._store.isDisposed) {
                return;
            }
            try {
                const processItem = await (0, ps_1.listProcesses)(this._pid);
                this.hasChildProcesses = this._processContainsChildren(processItem);
            }
            catch (e) {
                this._logService.debug('ChildProcessMonitor: Fetching process tree failed', e);
            }
        }
        _refreshInactive() {
            this._refreshActive();
        }
        _processContainsChildren(processItem) {
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
                return exports.ignoreProcessNames.indexOf((0, path_1.parse)(cmd).name) === -1;
            }
            // Fallback, count child processes
            return processItem.children.length > 0;
        }
    };
    exports.ChildProcessMonitor = ChildProcessMonitor;
    __decorate([
        (0, decorators_1.debounce)(1000 /* Constants.ActiveDebounceDuration */)
    ], ChildProcessMonitor.prototype, "_refreshActive", null);
    __decorate([
        (0, decorators_1.throttle)(5000 /* Constants.InactiveThrottleDuration */)
    ], ChildProcessMonitor.prototype, "_refreshInactive", null);
    exports.ChildProcessMonitor = ChildProcessMonitor = __decorate([
        __param(1, log_1.ILogService)
    ], ChildProcessMonitor);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hpbGRQcm9jZXNzTW9uaXRvci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3Rlcm1pbmFsL25vZGUvY2hpbGRQcm9jZXNzTW9uaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFVaEcsSUFBVyxTQVNWO0lBVEQsV0FBVyxTQUFTO1FBQ25COztXQUVHO1FBQ0gsb0ZBQStCLENBQUE7UUFDL0I7O1dBRUc7UUFDSCxnRkFBNkIsQ0FBQTtJQUM5QixDQUFDLEVBVFUsU0FBUyxLQUFULFNBQVMsUUFTbkI7SUFFWSxRQUFBLGtCQUFrQixHQUFhLEVBQUUsQ0FBQztJQUUvQzs7O09BR0c7SUFDSSxJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFvQixTQUFRLHNCQUFVO1FBRWxELElBQVksaUJBQWlCLENBQUMsS0FBYztZQUMzQyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsS0FBSyxLQUFLLEVBQUU7Z0JBQ3RDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUM7Z0JBQ2hDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLGtEQUFrRCxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNsRixJQUFJLENBQUMsNkJBQTZCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQy9DO1FBQ0YsQ0FBQztRQUNEOztXQUVHO1FBQ0gsSUFBSSxpQkFBaUIsS0FBYyxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7UUFRcEUsWUFDa0IsSUFBWSxFQUNoQixXQUF5QztZQUV0RCxLQUFLLEVBQUUsQ0FBQztZQUhTLFNBQUksR0FBSixJQUFJLENBQVE7WUFDQyxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQXJCL0MsdUJBQWtCLEdBQVksS0FBSyxDQUFDO1lBYTNCLGtDQUE2QixHQUFHLElBQUksQ0FBQyxTQUFTLENB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