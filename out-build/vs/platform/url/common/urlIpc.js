/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri"], function (require, exports, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$N6b = exports.$M6b = exports.$L6b = void 0;
    class $L6b {
        constructor(a) {
            this.a = a;
        }
        listen(_, event) {
            throw new Error(`Event not found: ${event}`);
        }
        call(_, command, arg) {
            switch (command) {
                case 'handleURL': return this.a.handleURL(uri_1.URI.revive(arg[0]), arg[1]);
            }
            throw new Error(`Call not found: ${command}`);
        }
    }
    exports.$L6b = $L6b;
    class $M6b {
        constructor(a) {
            this.a = a;
        }
        handleURL(uri, options) {
            return this.a.call('handleURL', [uri.toJSON(), options]);
        }
    }
    exports.$M6b = $M6b;
    class $N6b {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        async routeCall(hub, command, arg, cancellationToken) {
            if (command !== 'handleURL') {
                throw new Error(`Call not found: ${command}`);
            }
            if (Array.isArray(arg) && arg.length > 0) {
                const uri = uri_1.URI.revive(arg[0]);
                this.b.trace('URLHandlerRouter#routeCall() with URI argument', uri.toString(true));
                if (uri.query) {
                    const match = /\bwindowId=(\d+)/.exec(uri.query);
                    if (match) {
                        const windowId = match[1];
                        this.b.trace(`URLHandlerRouter#routeCall(): found windowId query parameter with value "${windowId}"`, uri.toString(true));
                        const regex = new RegExp(`window:${windowId}`);
                        const connection = hub.connections.find(c => {
                            this.b.trace('URLHandlerRouter#routeCall(): testing connection', c.ctx);
                            return regex.test(c.ctx);
                        });
                        if (connection) {
                            this.b.trace('URLHandlerRouter#routeCall(): found a connection to route', uri.toString(true));
                            return connection;
                        }
                        else {
                            this.b.trace('URLHandlerRouter#routeCall(): did not find a connection to route', uri.toString(true));
                        }
                    }
                    else {
                        this.b.trace('URLHandlerRouter#routeCall(): did not find windowId query parameter', uri.toString(true));
                    }
                }
            }
            else {
                this.b.trace('URLHandlerRouter#routeCall() without URI argument');
            }
            return this.a.routeCall(hub, command, arg, cancellationToken);
        }
        routeEvent(_, event) {
            throw new Error(`Event not found: ${event}`);
        }
    }
    exports.$N6b = $N6b;
});
//# sourceMappingURL=urlIpc.js.map