/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Cn = exports.$Bn = void 0;
    class $Bn {
        constructor() {
            this.a = new event_1.$fd();
            this.b = new event_1.$fd();
            this.c = new event_1.$fd();
            this.d = new event_1.$fd();
        }
        static { this.ChannelName = 'extensionhostdebugservice'; }
        call(ctx, command, arg) {
            switch (command) {
                case 'close':
                    return Promise.resolve(this.a.fire({ sessionId: arg[0] }));
                case 'reload':
                    return Promise.resolve(this.b.fire({ sessionId: arg[0] }));
                case 'terminate':
                    return Promise.resolve(this.c.fire({ sessionId: arg[0] }));
                case 'attach':
                    return Promise.resolve(this.d.fire({ sessionId: arg[0], port: arg[1], subId: arg[2] }));
            }
            throw new Error('Method not implemented.');
        }
        listen(ctx, event, arg) {
            switch (event) {
                case 'close':
                    return this.a.event;
                case 'reload':
                    return this.b.event;
                case 'terminate':
                    return this.c.event;
                case 'attach':
                    return this.d.event;
            }
            throw new Error('Method not implemented.');
        }
    }
    exports.$Bn = $Bn;
    class $Cn extends lifecycle_1.$kc {
        constructor(b) {
            super();
            this.b = b;
        }
        reload(sessionId) {
            this.b.call('reload', [sessionId]);
        }
        get onReload() {
            return this.b.listen('reload');
        }
        close(sessionId) {
            this.b.call('close', [sessionId]);
        }
        get onClose() {
            return this.b.listen('close');
        }
        attachSession(sessionId, port, subId) {
            this.b.call('attach', [sessionId, port, subId]);
        }
        get onAttachSession() {
            return this.b.listen('attach');
        }
        terminateSession(sessionId, subId) {
            this.b.call('terminate', [sessionId, subId]);
        }
        get onTerminateSession() {
            return this.b.listen('terminate');
        }
        openExtensionDevelopmentHostWindow(args, debugRenderer) {
            return this.b.call('openExtensionDevelopmentHostWindow', [args, debugRenderer]);
        }
    }
    exports.$Cn = $Cn;
});
//# sourceMappingURL=extensionHostDebugIpc.js.map