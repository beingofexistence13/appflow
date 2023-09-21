/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, extensions_1, instantiation_1, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IEmbedderTerminalService = void 0;
    exports.IEmbedderTerminalService = (0, instantiation_1.createDecorator)('embedderTerminalService');
    class EmbedderTerminalService {
        constructor() {
            this._onDidCreateTerminal = new event_1.Emitter();
            this.onDidCreateTerminal = event_1.Event.buffer(this._onDidCreateTerminal.event);
        }
        createTerminal(options) {
            const slc = {
                name: options.name,
                isFeatureTerminal: true,
                customPtyImplementation(terminalId, cols, rows) {
                    return new EmbedderTerminalProcess(terminalId, options.pty);
                },
            };
            this._onDidCreateTerminal.fire(slc);
        }
    }
    class EmbedderTerminalProcess extends lifecycle_1.Disposable {
        constructor(id, pty) {
            super();
            this.id = id;
            this.shouldPersist = false;
            this._onProcessReady = this._register(new event_1.Emitter());
            this.onProcessReady = this._onProcessReady.event;
            this._onDidChangeProperty = this._register(new event_1.Emitter());
            this.onDidChangeProperty = this._onDidChangeProperty.event;
            this._onProcessExit = this._register(new event_1.Emitter());
            this.onProcessExit = this._onProcessExit.event;
            this._pty = pty;
            this.onProcessData = this._pty.onDidWrite;
            if (this._pty.onDidClose) {
                this._register(this._pty.onDidClose(e => this._onProcessExit.fire(e || undefined)));
            }
            if (this._pty.onDidChangeName) {
                this._register(this._pty.onDidChangeName(e => this._onDidChangeProperty.fire({
                    type: "title" /* ProcessPropertyType.Title */,
                    value: e
                })));
            }
        }
        async start() {
            this._onProcessReady.fire({ pid: -1, cwd: '', windowsPty: undefined });
            this._pty.open();
            return undefined;
        }
        shutdown() {
            this._pty.close();
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
    (0, extensions_1.registerSingleton)(exports.IEmbedderTerminalService, EmbedderTerminalService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1iZWRkZXJUZXJtaW5hbFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdGVybWluYWwvY29tbW9uL2VtYmVkZGVyVGVybWluYWxTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVFuRixRQUFBLHdCQUF3QixHQUFHLElBQUEsK0JBQWUsRUFBMkIseUJBQXlCLENBQUMsQ0FBQztJQTJDN0csTUFBTSx1QkFBdUI7UUFBN0I7WUFHa0IseUJBQW9CLEdBQUcsSUFBSSxlQUFPLEVBQXNCLENBQUM7WUFDakUsd0JBQW1CLEdBQUcsYUFBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUM7UUFZOUUsQ0FBQztRQVZBLGNBQWMsQ0FBQyxPQUFpQztZQUMvQyxNQUFNLEdBQUcsR0FBcUI7Z0JBQzdCLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSTtnQkFDbEIsaUJBQWlCLEVBQUUsSUFBSTtnQkFDdkIsdUJBQXVCLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxJQUFJO29CQUM3QyxPQUFPLElBQUksdUJBQXVCLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDN0QsQ0FBQzthQUNELENBQUM7WUFDRixJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7S0FDRDtJQUdELE1BQU0sdUJBQXdCLFNBQVEsc0JBQVU7UUFhL0MsWUFDVSxFQUFVLEVBQ25CLEdBQXlCO1lBRXpCLEtBQUssRUFBRSxDQUFDO1lBSEMsT0FBRSxHQUFGLEVBQUUsQ0FBUTtZQVhYLGtCQUFhLEdBQUcsS0FBSyxDQUFDO1lBR2Qsb0JBQWUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFzQixD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