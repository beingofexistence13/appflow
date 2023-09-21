/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/parts/ipc/common/ipc.net", "vs/platform/remote/common/remoteAuthorityResolver"], function (require, exports, dom, async_1, buffer_1, event_1, lifecycle_1, ipc_net_1, remoteAuthorityResolver_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$HT = void 0;
    class BrowserWebSocket extends lifecycle_1.$kc {
        traceSocketEvent(type, data) {
            ipc_net_1.SocketDiagnostics.traceSocketEvent(this.h, this.g, type, data);
        }
        constructor(url, debugLabel) {
            super();
            this.a = new event_1.$fd();
            this.onData = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onOpen = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onClose = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onError = this.f.event;
            this.g = debugLabel;
            this.h = new WebSocket(url);
            this.traceSocketEvent("created" /* SocketDiagnosticsEventType.Created */, { type: 'BrowserWebSocket', url });
            this.j = new FileReader();
            this.m = [];
            this.n = false;
            this.r = false;
            this.j.onload = (event) => {
                this.n = false;
                const buff = event.target.result;
                this.traceSocketEvent("read" /* SocketDiagnosticsEventType.Read */, buff);
                this.a.fire(buff);
                if (this.m.length > 0) {
                    enqueue(this.m.shift());
                }
            };
            const enqueue = (blob) => {
                if (this.n) {
                    this.m.push(blob);
                    return;
                }
                this.n = true;
                this.j.readAsArrayBuffer(blob);
            };
            this.s = (ev) => {
                const blob = ev.data;
                this.traceSocketEvent("browserWebSocketBlobReceived" /* SocketDiagnosticsEventType.BrowserWebSocketBlobReceived */, { type: blob.type, size: blob.size });
                enqueue(blob);
            };
            this.h.addEventListener('message', this.s);
            this.B(dom.$nO(this.h, 'open', (e) => {
                this.traceSocketEvent("open" /* SocketDiagnosticsEventType.Open */);
                this.b.fire();
            }));
            // WebSockets emit error events that do not contain any real information
            // Our only chance of getting to the root cause of an error is to
            // listen to the close event which gives out some real information:
            // - https://www.w3.org/TR/websockets/#closeevent
            // - https://tools.ietf.org/html/rfc6455#section-11.7
            //
            // But the error event is emitted before the close event, so we therefore
            // delay the error event processing in the hope of receiving a close event
            // with more information
            let pendingErrorEvent = null;
            const sendPendingErrorNow = () => {
                const err = pendingErrorEvent;
                pendingErrorEvent = null;
                this.f.fire(err);
            };
            const errorRunner = this.B(new async_1.$Sg(sendPendingErrorNow, 0));
            const sendErrorSoon = (err) => {
                errorRunner.cancel();
                pendingErrorEvent = err;
                errorRunner.schedule();
            };
            const sendErrorNow = (err) => {
                errorRunner.cancel();
                pendingErrorEvent = err;
                sendPendingErrorNow();
            };
            this.B(dom.$nO(this.h, 'close', (e) => {
                this.traceSocketEvent("close" /* SocketDiagnosticsEventType.Close */, { code: e.code, reason: e.reason, wasClean: e.wasClean });
                this.r = true;
                if (pendingErrorEvent) {
                    if (!window.navigator.onLine) {
                        // The browser is offline => this is a temporary error which might resolve itself
                        sendErrorNow(new remoteAuthorityResolver_1.$Mk('Browser is offline', remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.TemporarilyNotAvailable, e));
                    }
                    else {
                        // An error event is pending
                        // The browser appears to be online...
                        if (!e.wasClean) {
                            // Let's be optimistic and hope that perhaps the server could not be reached or something
                            sendErrorNow(new remoteAuthorityResolver_1.$Mk(e.reason || `WebSocket close with status code ${e.code}`, remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.TemporarilyNotAvailable, e));
                        }
                        else {
                            // this was a clean close => send existing error
                            errorRunner.cancel();
                            sendPendingErrorNow();
                        }
                    }
                }
                this.c.fire({ code: e.code, reason: e.reason, wasClean: e.wasClean, event: e });
            }));
            this.B(dom.$nO(this.h, 'error', (err) => {
                this.traceSocketEvent("error" /* SocketDiagnosticsEventType.Error */, { message: err?.message });
                sendErrorSoon(err);
            }));
        }
        send(data) {
            if (this.r) {
                // Refuse to write data to closed WebSocket...
                return;
            }
            this.traceSocketEvent("write" /* SocketDiagnosticsEventType.Write */, data);
            this.h.send(data);
        }
        close() {
            this.r = true;
            this.traceSocketEvent("close" /* SocketDiagnosticsEventType.Close */);
            this.h.close();
            this.h.removeEventListener('message', this.s);
            this.dispose();
        }
    }
    const defaultWebSocketFactory = new class {
        create(url, debugLabel) {
            return new BrowserWebSocket(url, debugLabel);
        }
    };
    class BrowserSocket {
        traceSocketEvent(type, data) {
            if (typeof this.socket.traceSocketEvent === 'function') {
                this.socket.traceSocketEvent(type, data);
            }
            else {
                ipc_net_1.SocketDiagnostics.traceSocketEvent(this.socket, this.debugLabel, type, data);
            }
        }
        constructor(socket, debugLabel) {
            this.socket = socket;
            this.debugLabel = debugLabel;
        }
        dispose() {
            this.socket.close();
        }
        onData(listener) {
            return this.socket.onData((data) => listener(buffer_1.$Fd.wrap(new Uint8Array(data))));
        }
        onClose(listener) {
            const adapter = (e) => {
                if (typeof e === 'undefined') {
                    listener(e);
                }
                else {
                    listener({
                        type: 1 /* SocketCloseEventType.WebSocketCloseEvent */,
                        code: e.code,
                        reason: e.reason,
                        wasClean: e.wasClean,
                        event: e.event
                    });
                }
            };
            return this.socket.onClose(adapter);
        }
        onEnd(listener) {
            return lifecycle_1.$kc.None;
        }
        write(buffer) {
            this.socket.send(buffer.buffer);
        }
        end() {
            this.socket.close();
        }
        drain() {
            return Promise.resolve();
        }
    }
    class $HT {
        constructor(webSocketFactory) {
            this.a = webSocketFactory || defaultWebSocketFactory;
        }
        supports(connectTo) {
            return true;
        }
        connect({ host, port }, path, query, debugLabel) {
            return new Promise((resolve, reject) => {
                const webSocketSchema = (/^https:/.test(window.location.href) ? 'wss' : 'ws');
                const socket = this.a.create(`${webSocketSchema}://${(/:/.test(host) && !/\[/.test(host)) ? `[${host}]` : host}:${port}${path}?${query}&skipWebSocketFrames=false`, debugLabel);
                const errorListener = socket.onError(reject);
                socket.onOpen(() => {
                    errorListener.dispose();
                    resolve(new BrowserSocket(socket, debugLabel));
                });
            });
        }
    }
    exports.$HT = $HT;
});
//# sourceMappingURL=browserSocketFactory.js.map