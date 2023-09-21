/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$uvb = void 0;
    class $uvb extends lifecycle_1.$kc {
        static { this.a = /(?:\u001B|\u009B)[\[\]()#;?]*(?:(?:(?:[a-zA-Z0-9]*(?:;[a-zA-Z0-9]*)*)?\u0007)|(?:(?:\d{1,4}(?:;\d{0,4})*)?[0-9A-PR-TZcf-ntqry=><~]))/g; }
        /**
         * Local server url pattern matching following urls:
         * http://localhost:3000/ - commonly used across multiple frameworks
         * https://127.0.0.1:5001/ - ASP.NET
         * http://:8080 - Beego Golang
         * http://0.0.0.0:4000 - Elixir Phoenix
         */
        static { this.b = /\b\w{2,20}:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|:\d{2,5})[\w\-\.\~:\/\?\#[\]\@!\$&\(\)\*\+\,\;\=]*/gim; }
        static { this.c = /(localhost|127\.0\.0\.1|0\.0\.0\.0):(\d{1,5})/; }
        /**
         * https://github.com/microsoft/vscode-remote-release/issues/3949
         */
        static { this.f = /HTTP\son\s(127\.0\.0\.1|0\.0\.0\.0)\sport\s(\d+)/; }
        static { this.g = ['Dev Containers']; }
        constructor(terminalService, debugService) {
            super();
            this.h = new event_1.$fd();
            this.onDidMatchLocalUrl = this.h.event;
            this.j = new Map();
            this.n = new Map();
            // Terminal
            terminalService.instances.forEach(instance => {
                this.m(instance);
            });
            this.B(terminalService.onDidCreateInstance(instance => {
                this.m(instance);
            }));
            this.B(terminalService.onDidDisposeInstance(instance => {
                this.j.get(instance)?.dispose();
                this.j.delete(instance);
            }));
            // Debug
            this.B(debugService.onDidNewSession(session => {
                if (!session.parentSession || (session.parentSession && session.hasSeparateRepl())) {
                    this.j.set(session.getId(), session.onDidChangeReplElements(() => {
                        this.r(session);
                    }));
                }
            }));
            this.B(debugService.onDidEndSession(session => {
                if (this.j.has(session.getId())) {
                    this.j.get(session.getId())?.dispose();
                    this.j.delete(session.getId());
                }
            }));
        }
        m(instance) {
            if (!$uvb.g.includes(instance.title)) {
                this.j.set(instance, instance.onData(data => {
                    this.s(data);
                }));
            }
        }
        r(session) {
            const oldReplPosition = this.n.get(session.getId());
            const replElements = session.getReplElements();
            this.n.set(session.getId(), { position: replElements.length - 1, tail: replElements[replElements.length - 1] });
            if (!oldReplPosition && replElements.length > 0) {
                replElements.forEach(element => this.s(element.toString()));
            }
            else if (oldReplPosition && (replElements.length - 1 !== oldReplPosition.position)) {
                // Process lines until we reach the old "tail"
                for (let i = replElements.length - 1; i >= 0; i--) {
                    const element = replElements[i];
                    if (element === oldReplPosition.tail) {
                        break;
                    }
                    else {
                        this.s(element.toString());
                    }
                }
            }
        }
        dispose() {
            super.dispose();
            const listeners = this.j.values();
            for (const listener of listeners) {
                listener.dispose();
            }
        }
        s(data) {
            // strip ANSI terminal codes
            data = data.replace($uvb.a, '');
            const urlMatches = data.match($uvb.b) || [];
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
                        const portMatch = match.match($uvb.c);
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
                            this.h.fire({ port, host });
                        }
                    }
                });
            }
            else {
                // Try special python case
                const pythonMatch = data.match($uvb.f);
                if (pythonMatch && pythonMatch.length === 3) {
                    this.h.fire({ host: pythonMatch[1], port: Number(pythonMatch[2]) });
                }
            }
        }
    }
    exports.$uvb = $uvb;
});
//# sourceMappingURL=urlFinder.js.map