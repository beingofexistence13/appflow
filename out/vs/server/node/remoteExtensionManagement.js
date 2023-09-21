/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/async"], function (require, exports, event_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ManagementConnection = void 0;
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
    class ManagementConnection {
        constructor(_logService, _reconnectionToken, remoteAddress, protocol) {
            this._logService = _logService;
            this._reconnectionToken = _reconnectionToken;
            this._onClose = new event_1.Emitter();
            this.onClose = this._onClose.event;
            this._reconnectionGraceTime = 10800000 /* ProtocolConstants.ReconnectionGraceTime */;
            this._reconnectionShortGraceTime = 300000 /* ProtocolConstants.ReconnectionShortGraceTime */;
            this._remoteAddress = remoteAddress;
            this.protocol = protocol;
            this._disposed = false;
            this._disconnectRunner1 = new async_1.ProcessTimeRunOnceScheduler(() => {
                this._log(`The reconnection grace time of ${printTime(this._reconnectionGraceTime)} has expired, so the connection will be disposed.`);
                this._cleanResources();
            }, this._reconnectionGraceTime);
            this._disconnectRunner2 = new async_1.ProcessTimeRunOnceScheduler(() => {
                this._log(`The reconnection short grace time of ${printTime(this._reconnectionShortGraceTime)} has expired, so the connection will be disposed.`);
                this._cleanResources();
            }, this._reconnectionShortGraceTime);
            this.protocol.onDidDispose(() => {
                this._log(`The client has disconnected gracefully, so the connection will be disposed.`);
                this._cleanResources();
            });
            this.protocol.onSocketClose(() => {
                this._log(`The client has disconnected, will wait for reconnection ${printTime(this._reconnectionGraceTime)} before disposing...`);
                // The socket has closed, let's give the renderer a certain amount of time to reconnect
                this._disconnectRunner1.schedule();
            });
            this._log(`New connection established.`);
        }
        _log(_str) {
            this._logService.info(`[${this._remoteAddress}][${this._reconnectionToken.substr(0, 8)}][ManagementConnection] ${_str}`);
        }
        shortenReconnectionGraceTimeIfNecessary() {
            if (this._disconnectRunner2.isScheduled()) {
                // we are disconnected and already running the short reconnection timer
                return;
            }
            if (this._disconnectRunner1.isScheduled()) {
                this._log(`Another client has connected, will shorten the wait for reconnection ${printTime(this._reconnectionShortGraceTime)} before disposing...`);
                // we are disconnected and running the long reconnection timer
                this._disconnectRunner2.schedule();
            }
        }
        _cleanResources() {
            if (this._disposed) {
                // already called
                return;
            }
            this._disposed = true;
            this._disconnectRunner1.dispose();
            this._disconnectRunner2.dispose();
            const socket = this.protocol.getSocket();
            this.protocol.sendDisconnect();
            this.protocol.dispose();
            socket.end();
            this._onClose.fire(undefined);
        }
        acceptReconnection(remoteAddress, socket, initialDataChunk) {
            this._remoteAddress = remoteAddress;
            this._log(`The client has reconnected.`);
            this._disconnectRunner1.cancel();
            this._disconnectRunner2.cancel();
            this.protocol.beginAcceptReconnection(socket, initialDataChunk);
            this.protocol.endAcceptReconnection();
        }
    }
    exports.ManagementConnection = ManagementConnection;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlRXh0ZW5zaW9uTWFuYWdlbWVudC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3NlcnZlci9ub2RlL3JlbW90ZUV4dGVuc2lvbk1hbmFnZW1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLFNBQVMsU0FBUyxDQUFDLEVBQVU7UUFDNUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1YsSUFBSSxFQUFFLElBQUksSUFBSSxFQUFFO1lBQ2YsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1lBQzFCLEVBQUUsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO1NBQ2Y7UUFDRCxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDWixDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDdkIsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7U0FDWjtRQUNELElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUNaLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUN2QixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztTQUNaO1FBQ0QsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDNUIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDNUIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENB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