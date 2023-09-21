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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/contrib/terminal/browser/terminal"], function (require, exports, event_1, lifecycle_1, terminal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Tkb = void 0;
    let $Tkb = class $Tkb extends lifecycle_1.$kc {
        get onProcessReady() { return this.b.event; }
        constructor(instanceId, y, z, C) {
            super();
            this.instanceId = instanceId;
            this.y = y;
            this.z = z;
            this.C = C;
            this.id = 0;
            this.shouldPersist = false;
            this.a = this.B(new event_1.$fd());
            this.onProcessData = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.c = this.B(new event_1.$fd());
            this.onStart = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onInput = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onBinary = this.g.event;
            this.h = this.B(new event_1.$fd());
            this.onResize = this.h.event;
            this.j = this.B(new event_1.$fd());
            this.onAcknowledgeDataEvent = this.j.event;
            this.m = this.B(new event_1.$fd());
            this.onShutdown = this.m.event;
            this.n = this.B(new event_1.$fd());
            this.onRequestInitialCwd = this.n.event;
            this.r = this.B(new event_1.$fd());
            this.onRequestCwd = this.r.event;
            this.s = this.B(new event_1.$fd());
            this.onDidChangeProperty = this.s.event;
            this.t = this.B(new event_1.$fd());
            this.onProcessExit = this.t.event;
            this.u = [];
            this.w = [];
        }
        emitData(data) {
            this.a.fire(data);
        }
        emitTitle(title) {
            this.s.fire({ type: "title" /* ProcessPropertyType.Title */, value: title });
        }
        emitReady(pid, cwd) {
            this.b.fire({ pid, cwd, windowsPty: undefined });
        }
        emitProcessProperty({ type, value }) {
            switch (type) {
                case "cwd" /* ProcessPropertyType.Cwd */:
                    this.emitCwd(value);
                    break;
                case "initialCwd" /* ProcessPropertyType.InitialCwd */:
                    this.emitInitialCwd(value);
                    break;
                case "title" /* ProcessPropertyType.Title */:
                    this.emitTitle(value);
                    break;
                case "overrideDimensions" /* ProcessPropertyType.OverrideDimensions */:
                    this.emitOverrideDimensions(value);
                    break;
                case "resolvedShellLaunchConfig" /* ProcessPropertyType.ResolvedShellLaunchConfig */:
                    this.emitResolvedShellLaunchConfig(value);
                    break;
            }
        }
        emitExit(exitCode) {
            this.t.fire(exitCode);
            this.dispose();
        }
        emitOverrideDimensions(dimensions) {
            this.s.fire({ type: "overrideDimensions" /* ProcessPropertyType.OverrideDimensions */, value: dimensions });
        }
        emitResolvedShellLaunchConfig(shellLaunchConfig) {
            this.s.fire({ type: "resolvedShellLaunchConfig" /* ProcessPropertyType.ResolvedShellLaunchConfig */, value: shellLaunchConfig });
        }
        emitInitialCwd(initialCwd) {
            while (this.u.length > 0) {
                this.u.pop()(initialCwd);
            }
        }
        emitCwd(cwd) {
            while (this.w.length > 0) {
                this.w.pop()(cwd);
            }
        }
        async start() {
            return this.C.requestStartExtensionTerminal(this, this.y, this.z);
        }
        shutdown(immediate) {
            this.m.fire(immediate);
        }
        input(data) {
            this.f.fire(data);
        }
        resize(cols, rows) {
            this.h.fire({ cols, rows });
        }
        clearBuffer() {
            // no-op
        }
        acknowledgeDataEvent() {
            // Flow control is disabled for extension terminals
        }
        async setUnicodeVersion(version) {
            // No-op
        }
        async processBinary(data) {
            // Disabled for extension terminals
            this.g.fire(data);
        }
        getInitialCwd() {
            return new Promise(resolve => {
                this.n.fire();
                this.u.push(resolve);
            });
        }
        getCwd() {
            return new Promise(resolve => {
                this.r.fire();
                this.w.push(resolve);
            });
        }
        async refreshProperty(type) {
            // throws if called in extHostTerminalService
        }
        async updateProperty(type, value) {
            // throws if called in extHostTerminalService
        }
    };
    exports.$Tkb = $Tkb;
    exports.$Tkb = $Tkb = __decorate([
        __param(3, terminal_1.$Mib)
    ], $Tkb);
});
//# sourceMappingURL=terminalProcessExtHostProxy.js.map