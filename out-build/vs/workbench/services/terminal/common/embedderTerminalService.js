/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, extensions_1, instantiation_1, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$GV = void 0;
    exports.$GV = (0, instantiation_1.$Bh)('embedderTerminalService');
    class EmbedderTerminalService {
        constructor() {
            this.a = new event_1.$fd();
            this.onDidCreateTerminal = event_1.Event.buffer(this.a.event);
        }
        createTerminal(options) {
            const slc = {
                name: options.name,
                isFeatureTerminal: true,
                customPtyImplementation(terminalId, cols, rows) {
                    return new EmbedderTerminalProcess(terminalId, options.pty);
                },
            };
            this.a.fire(slc);
        }
    }
    class EmbedderTerminalProcess extends lifecycle_1.$kc {
        constructor(id, pty) {
            super();
            this.id = id;
            this.shouldPersist = false;
            this.b = this.B(new event_1.$fd());
            this.onProcessReady = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onDidChangeProperty = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onProcessExit = this.f.event;
            this.a = pty;
            this.onProcessData = this.a.onDidWrite;
            if (this.a.onDidClose) {
                this.B(this.a.onDidClose(e => this.f.fire(e || undefined)));
            }
            if (this.a.onDidChangeName) {
                this.B(this.a.onDidChangeName(e => this.c.fire({
                    type: "title" /* ProcessPropertyType.Title */,
                    value: e
                })));
            }
        }
        async start() {
            this.b.fire({ pid: -1, cwd: '', windowsPty: undefined });
            this.a.open();
            return undefined;
        }
        shutdown() {
            this.a.close();
        }
        // TODO: A lot of these aren't useful for some implementations of ITerminalChildProcess, should
        // they be optional? Should there be a base class for "external" consumers to implement?
        input() {
            // not supported
        }
        async processBinary() {
            // not supported
        }
        resize() {
            // no-op
        }
        clearBuffer() {
            // no-op
        }
        acknowledgeDataEvent() {
            // no-op, flow control not currently implemented
        }
        async setUnicodeVersion() {
            // no-op
        }
        async getInitialCwd() {
            return '';
        }
        async getCwd() {
            return '';
        }
        refreshProperty(property) {
            throw new Error(`refreshProperty is not suppported in EmbedderTerminalProcess. property: ${property}`);
        }
        updateProperty(property, value) {
            throw new Error(`updateProperty is not suppported in EmbedderTerminalProcess. property: ${property}, value: ${value}`);
        }
    }
    (0, extensions_1.$mr)(exports.$GV, EmbedderTerminalService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=embedderTerminalService.js.map