/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/async"], function (require, exports, event_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$um = void 0;
    function printTime(ms) {
        let h = 0;
        let m = 0;
        let s = 0;
        if (ms >= 1000) {
            s = Math.floor(ms / 1000);
            ms -= s * 1000;
        }
        if (s >= 60) {
            m = Math.floor(s / 60);
            s -= m * 60;
        }
        if (m >= 60) {
            h = Math.floor(m / 60);
            m -= h * 60;
        }
        const _h = h ? `${h}h` : ``;
        const _m = m ? `${m}m` : ``;
        const _s = s ? `${s}s` : ``;
        const _ms = ms ? `${ms}ms` : ``;
        return `${_h}${_m}${_s}${_ms}`;
    }
    class $um {
        constructor(i, j, remoteAddress, protocol) {
            this.i = i;
            this.j = j;
            this.a = new event_1.$fd();
            this.onClose = this.a.event;
            this.b = 10800000 /* ProtocolConstants.ReconnectionGraceTime */;
            this.c = 300000 /* ProtocolConstants.ReconnectionShortGraceTime */;
            this.d = remoteAddress;
            this.protocol = protocol;
            this.e = false;
            this.f = new async_1.$Tg(() => {
                this.k(`The reconnection grace time of ${printTime(this.b)} has expired, so the connection will be disposed.`);
                this.l();
            }, this.b);
            this.g = new async_1.$Tg(() => {
                this.k(`The reconnection short grace time of ${printTime(this.c)} has expired, so the connection will be disposed.`);
                this.l();
            }, this.c);
            this.protocol.onDidDispose(() => {
                this.k(`The client has disconnected gracefully, so the connection will be disposed.`);
                this.l();
            });
            this.protocol.onSocketClose(() => {
                this.k(`The client has disconnected, will wait for reconnection ${printTime(this.b)} before disposing...`);
                // The socket has closed, let's give the renderer a certain amount of time to reconnect
                this.f.schedule();
            });
            this.k(`New connection established.`);
        }
        k(_str) {
            this.i.info(`[${this.d}][${this.j.substr(0, 8)}][ManagementConnection] ${_str}`);
        }
        shortenReconnectionGraceTimeIfNecessary() {
            if (this.g.isScheduled()) {
                // we are disconnected and already running the short reconnection timer
                return;
            }
            if (this.f.isScheduled()) {
                this.k(`Another client has connected, will shorten the wait for reconnection ${printTime(this.c)} before disposing...`);
                // we are disconnected and running the long reconnection timer
                this.g.schedule();
            }
        }
        l() {
            if (this.e) {
                // already called
                return;
            }
            this.e = true;
            this.f.dispose();
            this.g.dispose();
            const socket = this.protocol.getSocket();
            this.protocol.sendDisconnect();
            this.protocol.dispose();
            socket.end();
            this.a.fire(undefined);
        }
        acceptReconnection(remoteAddress, socket, initialDataChunk) {
            this.d = remoteAddress;
            this.k(`The client has reconnected.`);
            this.f.cancel();
            this.g.cancel();
            this.protocol.beginAcceptReconnection(socket, initialDataChunk);
            this.protocol.endAcceptReconnection();
        }
    }
    exports.$um = $um;
});
//# sourceMappingURL=remoteExtensionManagement.js.map