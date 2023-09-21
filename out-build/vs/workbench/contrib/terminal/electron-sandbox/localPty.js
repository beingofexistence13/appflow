/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/common/performance"], function (require, exports, event_1, lifecycle_1, uri_1, performance_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Dac = void 0;
    /**
     * Responsible for establishing and maintaining a connection with an existing terminal process
     * created on the local pty host.
     */
    class $Dac extends lifecycle_1.$kc {
        constructor(id, shouldPersist, r) {
            super();
            this.id = id;
            this.shouldPersist = shouldPersist;
            this.r = r;
            this.a = {
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
            this.b = { cols: -1, rows: -1 };
            this.c = false;
            this.f = this.B(new event_1.$fd());
            this.onProcessData = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onProcessReplayComplete = this.g.event;
            this.h = this.B(new event_1.$fd());
            this.onProcessReady = this.h.event;
            this.j = this.B(new event_1.$fd());
            this.onDidChangeProperty = this.j.event;
            this.m = this.B(new event_1.$fd());
            this.onProcessExit = this.m.event;
            this.n = this.B(new event_1.$fd());
            this.onRestoreCommands = this.n.event;
        }
        start() {
            return this.r.start(this.id);
        }
        detach(forcePersist) {
            return this.r.detachFromProcess(this.id, forcePersist);
        }
        shutdown(immediate) {
            this.r.shutdown(this.id, immediate);
        }
        async processBinary(data) {
            if (this.c) {
                return;
            }
            return this.r.processBinary(this.id, data);
        }
        input(data) {
            if (this.c) {
                return;
            }
            this.r.input(this.id, data);
        }
        resize(cols, rows) {
            if (this.c || this.b.cols === cols && this.b.rows === rows) {
                return;
            }
            this.b.cols = cols;
            this.b.rows = rows;
            this.r.resize(this.id, cols, rows);
        }
        async clearBuffer() {
            this.r.clearBuffer?.(this.id);
        }
        freePortKillProcess(port) {
            if (!this.r.freePortKillProcess) {
                throw new Error('freePortKillProcess does not exist on the local pty service');
            }
            return this.r.freePortKillProcess(port);
        }
        async getInitialCwd() {
            return this.a.initialCwd;
        }
        async getCwd() {
            return this.a.cwd || this.a.initialCwd;
        }
        async refreshProperty(type) {
            return this.r.refreshProperty(this.id, type);
        }
        async updateProperty(type, value) {
            return this.r.updateProperty(this.id, type, value);
        }
        acknowledgeDataEvent(charCount) {
            if (this.c) {
                return;
            }
            this.r.acknowledgeDataEvent(this.id, charCount);
        }
        setUnicodeVersion(version) {
            return this.r.setUnicodeVersion(this.id, version);
        }
        handleData(e) {
            this.f.fire(e);
        }
        handleExit(e) {
            this.m.fire(e);
        }
        handleReady(e) {
            this.h.fire(e);
        }
        handleDidChangeProperty({ type, value }) {
            switch (type) {
                case "cwd" /* ProcessPropertyType.Cwd */:
                    this.a.cwd = value;
                    break;
                case "initialCwd" /* ProcessPropertyType.InitialCwd */:
                    this.a.initialCwd = value;
                    break;
                case "resolvedShellLaunchConfig" /* ProcessPropertyType.ResolvedShellLaunchConfig */:
                    if (value.cwd && typeof value.cwd !== 'string') {
                        value.cwd = uri_1.URI.revive(value.cwd);
                    }
            }
            this.j.fire({ type, value });
        }
        async handleReplay(e) {
            (0, performance_1.mark)(`code/terminal/willHandleReplay/${this.id}`);
            try {
                this.c = true;
                for (const innerEvent of e.events) {
                    if (innerEvent.cols !== 0 || innerEvent.rows !== 0) {
                        // never override with 0x0 as that is a marker for an unknown initial size
                        this.j.fire({ type: "overrideDimensions" /* ProcessPropertyType.OverrideDimensions */, value: { cols: innerEvent.cols, rows: innerEvent.rows, forceExactSize: true } });
                    }
                    const e = { data: innerEvent.data, trackCommit: true };
                    this.f.fire(e);
                    await e.writePromise;
                }
            }
            finally {
                this.c = false;
            }
            if (e.commands) {
                this.n.fire(e.commands);
            }
            // remove size override
            this.j.fire({ type: "overrideDimensions" /* ProcessPropertyType.OverrideDimensions */, value: undefined });
            (0, performance_1.mark)(`code/terminal/didHandleReplay/${this.id}`);
            this.g.fire();
        }
        handleOrphanQuestion() {
            this.r.orphanQuestionReply(this.id);
        }
    }
    exports.$Dac = $Dac;
});
//# sourceMappingURL=localPty.js.map