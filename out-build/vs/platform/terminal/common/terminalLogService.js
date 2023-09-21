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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event", "vs/nls!vs/platform/terminal/common/terminalLogService", "vs/platform/log/common/log", "vs/platform/workspace/common/workspace", "vs/platform/environment/common/environment", "vs/base/common/resources"], function (require, exports, lifecycle_1, event_1, nls_1, log_1, workspace_1, environment_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$rWb = void 0;
    let $rWb = class $rWb extends lifecycle_1.$kc {
        get onDidChangeLogLevel() { return this.a.onDidChangeLogLevel; }
        constructor(c, workspaceContextService, environmentService) {
            super();
            this.c = c;
            this.a = this.c.createLogger((0, resources_1.$ig)(environmentService.logsHome, 'terminal.log'), { id: 'terminal', name: (0, nls_1.localize)(0, null) });
            this.B(event_1.Event.runAndSubscribe(workspaceContextService.onDidChangeWorkspaceFolders, () => {
                this.b = workspaceContextService.getWorkspace().id.substring(0, 7);
            }));
        }
        getLevel() { return this.a.getLevel(); }
        setLevel(level) { this.a.setLevel(level); }
        flush() { this.a.flush(); }
        trace(message, ...args) { this.a.trace(this.f(message), args); }
        debug(message, ...args) { this.a.debug(this.f(message), args); }
        info(message, ...args) { this.a.info(this.f(message), args); }
        warn(message, ...args) { this.a.warn(this.f(message), args); }
        error(message, ...args) {
            if (message instanceof Error) {
                this.a.error(this.f(''), message, args);
                return;
            }
            this.a.error(this.f(message), args);
        }
        f(message) {
            if (this.a.getLevel() === log_1.LogLevel.Trace) {
                return `[${this.b}] ${message}`;
            }
            return message;
        }
    };
    exports.$rWb = $rWb;
    exports.$rWb = $rWb = __decorate([
        __param(0, log_1.$6i),
        __param(1, workspace_1.$Kh),
        __param(2, environment_1.$Ih)
    ], $rWb);
});
//# sourceMappingURL=terminalLogService.js.map