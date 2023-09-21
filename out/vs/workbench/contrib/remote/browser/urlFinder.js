/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UrlFinder = void 0;
    class UrlFinder extends lifecycle_1.Disposable {
        static { this.terminalCodesRegex = /(?:\u001B|\u009B)[\[\]()#;?]*(?:(?:(?:[a-zA-Z0-9]*(?:;[a-zA-Z0-9]*)*)?\u0007)|(?:(?:\d{1,4}(?:;\d{0,4})*)?[0-9A-PR-TZcf-ntqry=><~]))/g; }
        /**
         * Local server url pattern matching following urls:
         * http://localhost:3000/ - commonly used across multiple frameworks
         * https://127.0.0.1:5001/ - ASP.NET
         * http://:8080 - Beego Golang
         * http://0.0.0.0:4000 - Elixir Phoenix
         */
        static { this.localUrlRegex = /\b\w{2,20}:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|:\d{2,5})[\w\-\.\~:\/\?\#[\]\@!\$&\(\)\*\+\,\;\=]*/gim; }
        static { this.extractPortRegex = /(localhost|127\.0\.0\.1|0\.0\.0\.0):(\d{1,5})/; }
        /**
         * https://github.com/microsoft/vscode-remote-release/issues/3949
         */
        static { this.localPythonServerRegex = /HTTP\son\s(127\.0\.0\.1|0\.0\.0\.0)\sport\s(\d+)/; }
        static { this.excludeTerminals = ['Dev Containers']; }
        constructor(terminalService, debugService) {
            super();
            this._onDidMatchLocalUrl = new event_1.Emitter();
            this.onDidMatchLocalUrl = this._onDidMatchLocalUrl.event;
            this.listeners = new Map();
            this.replPositions = new Map();
            // Terminal
            terminalService.instances.forEach(instance => {
                this.registerTerminalInstance(instance);
            });
            this._register(terminalService.onDidCreateInstance(instance => {
                this.registerTerminalInstance(instance);
            }));
            this._register(terminalService.onDidDisposeInstance(instance => {
                this.listeners.get(instance)?.dispose();
                this.listeners.delete(instance);
            }));
            // Debug
            this._register(debugService.onDidNewSession(session => {
                if (!session.parentSession || (session.parentSession && session.hasSeparateRepl())) {
                    this.listeners.set(session.getId(), session.onDidChangeReplElements(() => {
                        this.processNewReplElements(session);
                    }));
                }
            }));
            this._register(debugService.onDidEndSession(session => {
                if (this.listeners.has(session.getId())) {
                    this.listeners.get(session.getId())?.dispose();
                    this.listeners.delete(session.getId());
                }
            }));
        }
        registerTerminalInstance(instance) {
            if (!UrlFinder.excludeTerminals.includes(instance.title)) {
                this.listeners.set(instance, instance.onData(data => {
                    this.processData(data);
                }));
            }
        }
        processNewReplElements(session) {
            const oldReplPosition = this.replPositions.get(session.getId());
            const replElements = session.getReplElements();
            this.replPositions.set(session.getId(), { position: replElements.length - 1, tail: replElements[replElements.length - 1] });
            if (!oldReplPosition && replElements.length > 0) {
                replElements.forEach(element => this.processData(element.toString()));
            }
            else if (oldReplPosition && (replElements.length - 1 !== oldReplPosition.position)) {
                // Process lines until we reach the old "tail"
                for (let i = replElements.length - 1; i >= 0; i--) {
                    const element = replElements[i];
                    if (element === oldReplPosition.tail) {
                        break;
                    }
                    else {
                        this.processData(element.toString());
                    }
                }
            }
        }
        dispose() {
            super.dispose();
            const listeners = this.listeners.values();
            for (const listener of listeners) {
                listener.dispose();
            }
        }
        processData(data) {
            // strip ANSI terminal codes
            data = data.replace(UrlFinder.terminalCodesRegex, '');
            const urlMatches = data.match(UrlFinder.localUrlRegex) || [];
            if (urlMatches && urlMatches.length > 0) {
                urlMatches.forEach((match) => {
                    // check if valid url
                    let serverUrl;
                    try {
                        serverUrl = new URL(match);
                    }
                    catch (e) {
                        // Not a valid URL
                    }
                    if (serverUrl) {
                        // check if the port is a valid integer value
                        const portMatch = match.match(UrlFinder.extractPortRegex);
                        const port = parseFloat(serverUrl.port ? serverUrl.port : (portMatch ? portMatch[2] : 'NaN'));
                        if (!isNaN(port) && Number.isInteger(port) && port > 0 && port <= 65535) {
                            // normalize the host name
                            let host = serverUrl.hostname;
                            if (host !== '0.0.0.0' && host !== '127.0.0.1') {
                                host = 'localhost';
                            }
                            // Exclude node inspect, except when using default port
                            if (port !== 9229 && data.startsWith('Debugger listening on')) {
                                return;
                            }
                            this._onDidMatchLocalUrl.fire({ port, host });
                        }
                    }
                });
            }
            else {
                // Try special python case
                const pythonMatch = data.match(UrlFinder.localPythonServerRegex);
                if (pythonMatch && pythonMatch.length === 3) {
                    this._onDidMatchLocalUrl.fire({ host: pythonMatch[1], port: Number(pythonMatch[2]) });
                }
            }
        }
    }
    exports.UrlFinder = UrlFinder;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJsRmluZGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvcmVtb3RlL2Jyb3dzZXIvdXJsRmluZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU9oRyxNQUFhLFNBQVUsU0FBUSxzQkFBVTtpQkFDaEIsdUJBQWtCLEdBQUcsdUlBQXVJLEFBQTFJLENBQTJJO1FBQ3JMOzs7Ozs7V0FNRztpQkFDcUIsa0JBQWEsR0FBRywyR0FBMkcsQUFBOUcsQ0FBK0c7aUJBQzVILHFCQUFnQixHQUFHLCtDQUErQyxBQUFsRCxDQUFtRDtRQUMzRjs7V0FFRztpQkFDcUIsMkJBQXNCLEdBQUcsa0RBQWtELEFBQXJELENBQXNEO2lCQUU1RSxxQkFBZ0IsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEFBQXJCLENBQXNCO1FBTTlELFlBQVksZUFBaUMsRUFBRSxZQUEyQjtZQUN6RSxLQUFLLEVBQUUsQ0FBQztZQUxELHdCQUFtQixHQUE0QyxJQUFJLGVBQU8sRUFBRSxDQUFDO1lBQ3JFLHVCQUFrQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUM7WUFDNUQsY0FBUyxHQUFpRCxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBd0NwRSxrQkFBYSxHQUEwRCxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBcEN4RixXQUFXO1lBQ1gsZUFBZSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQzVDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN6QyxDQUFDLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUM3RCxJQUFJLENBQUMsd0JBQXdCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDekMsQ0FBQyxDQUFD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