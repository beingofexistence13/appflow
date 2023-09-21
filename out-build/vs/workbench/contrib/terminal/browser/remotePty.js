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
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/performance", "vs/base/common/uri", "vs/platform/terminal/common/terminal", "vs/workbench/services/remote/common/remoteAgentService"], function (require, exports, async_1, event_1, lifecycle_1, performance_1, uri_1, terminal_1, remoteAgentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$oWb = void 0;
    let $oWb = class $oWb extends lifecycle_1.$kc {
        constructor(id, shouldPersist, s, t, u) {
            super();
            this.id = id;
            this.shouldPersist = shouldPersist;
            this.s = s;
            this.t = t;
            this.u = u;
            this.b = {
                cwd: '',
                initialCwd: '',
                fixedDimensions: { cols: undefined, rows: undefined },
                title: '',
                shellType: undefined,
                hasChildProcesses: true,
                resolvedShellLaunchConfig: {},
                overrideDimensions: undefined,
                failedShellIntegrationActivation: false,
                usedShellIntegrationInjection: undefined
            };
            this.c = { cols: -1, rows: -1 };
            this.f = false;
            this.g = this.B(new event_1.$fd());
            this.onProcessData = this.g.event;
            this.h = this.B(new event_1.$fd());
            this.onProcessReplayComplete = this.h.event;
            this.j = this.B(new event_1.$fd());
            this.onProcessReady = this.j.event;
            this.m = this.B(new event_1.$fd());
            this.onDidChangeProperty = this.m.event;
            this.n = this.B(new event_1.$fd());
            this.onProcessExit = this.n.event;
            this.r = this.B(new event_1.$fd());
            this.onRestoreCommands = this.r.event;
            this.a = new async_1.$Fg();
        }
        async start() {
            // Fetch the environment to check shell permissions
            const env = await this.t.getEnvironment();
            if (!env) {
                // Extension host processes are only allowed in remote extension hosts currently
                throw new Error('Could not fetch remote environment');
            }
            this.u.trace('Spawning remote agent process', { terminalId: this.id });
            const startResult = await this.s.start(this.id);
            if (startResult && 'message' in startResult) {
                // An error occurred
                return startResult;
            }
            this.a.open();
            return startResult;
        }
        async detach(forcePersist) {
            await this.a.wait();
            return this.s.detachFromProcess(this.id, forcePersist);
        }
        shutdown(immediate) {
            this.a.wait().then(_ => {
                this.s.shutdown(this.id, immediate);
            });
        }
        input(data) {
            if (this.f) {
                return;
            }
            this.a.wait().then(_ => {
                this.s.input(this.id, data);
            });
        }
        resize(cols, rows) {
            if (this.f || this.c.cols === cols && this.c.rows === rows) {
                return;
            }
            this.a.wait().then(_ => {
                this.c.cols = cols;
                this.c.rows = rows;
                this.s.resize(this.id, cols, rows);
            });
        }
        async clearBuffer() {
            await this.s.clearBuffer(this.id);
        }
        freePortKillProcess(port) {
            if (!this.s.freePortKillProcess) {
                throw new Error('freePortKillProcess does not exist on the local pty service');
            }
            return this.s.freePortKillProcess(port);
        }
        acknowledgeDataEvent(charCount) {
            // Support flow control for server spawned processes
            if (this.f) {
                return;
            }
            this.a.wait().then(_ => {
                this.s.acknowledgeDataEvent(this.id, charCount);
            });
        }
        async setUnicodeVersion(version) {
            return this.s.setUnicodeVersion(this.id, version);
        }
        async getInitialCwd() {
            return this.b.initialCwd;
        }
        async getCwd() {
            return this.b.cwd || this.b.initialCwd;
        }
        async refreshProperty(type) {
            return this.s.refreshProperty(this.id, type);
        }
        async updateProperty(type, value) {
            return this.s.updateProperty(this.id, type, value);
        }
        handleData(e) {
            this.g.fire(e);
        }
        handleExit(e) {
            this.n.fire(e);
        }
        processBinary(e) {
            return this.s.processBinary(this.id, e);
        }
        handleReady(e) {
            this.j.fire(e);
        }
        handleDidChangeProperty({ type, value }) {
            switch (type) {
                case "cwd" /* ProcessPropertyType.Cwd */:
                    this.b.cwd = value;
                    break;
                case "initialCwd" /* ProcessPropertyType.InitialCwd */:
                    this.b.initialCwd = value;
                    break;
                case "resolvedShellLaunchConfig" /* ProcessPropertyType.ResolvedShellLaunchConfig */:
                    if (value.cwd && typeof value.cwd !== 'string') {
                        value.cwd = uri_1.URI.revive(value.cwd);
                    }
            }
            this.m.fire({ type, value });
        }
        async handleReplay(e) {
            (0, performance_1.mark)(`code/terminal/willHandleReplay/${this.id}`);
            try {
                this.f = true;
                for (const innerEvent of e.events) {
                    if (innerEvent.cols !== 0 || innerEvent.rows !== 0) {
                        // never override with 0x0 as that is a marker for an unknown initial size
                        this.m.fire({ type: "overrideDimensions" /* ProcessPropertyType.OverrideDimensions */, value: { cols: innerEvent.cols, rows: innerEvent.rows, forceExactSize: true } });
                    }
                    const e = { data: innerEvent.data, trackCommit: true };
                    this.g.fire(e);
                    await e.writePromise;
                }
            }
            finally {
                this.f = false;
            }
            if (e.commands) {
                this.r.fire(e.commands);
            }
            // remove size override
            this.m.fire({ type: "overrideDimensions" /* ProcessPropertyType.OverrideDimensions */, value: undefined });
            (0, performance_1.mark)(`code/terminal/didHandleReplay/${this.id}`);
            this.h.fire();
        }
        handleOrphanQuestion() {
            this.s.orphanQuestionReply(this.id);
        }
    };
    exports.$oWb = $oWb;
    exports.$oWb = $oWb = __decorate([
        __param(3, remoteAgentService_1.$jm),
        __param(4, terminal_1.$Zq)
    ], $oWb);
});
//# sourceMappingURL=remotePty.js.map