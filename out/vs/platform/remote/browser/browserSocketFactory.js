/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/parts/ipc/common/ipc.net", "vs/platform/remote/common/remoteAuthorityResolver"], function (require, exports, dom, async_1, buffer_1, event_1, lifecycle_1, ipc_net_1, remoteAuthorityResolver_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserSocketFactory = void 0;
    class BrowserWebSocket extends lifecycle_1.Disposable {
        traceSocketEvent(type, data) {
            ipc_net_1.SocketDiagnostics.traceSocketEvent(this._socket, this._debugLabel, type, data);
        }
        constructor(url, debugLabel) {
            super();
            this._onData = new event_1.Emitter();
            this.onData = this._onData.event;
            this._onOpen = this._register(new event_1.Emitter());
            this.onOpen = this._onOpen.event;
            this._onClose = this._register(new event_1.Emitter());
            this.onClose = this._onClose.event;
            this._onError = this._register(new event_1.Emitter());
            this.onError = this._onError.event;
            this._debugLabel = debugLabel;
            this._socket = new WebSocket(url);
            this.traceSocketEvent("created" /* SocketDiagnosticsEventType.Created */, { type: 'BrowserWebSocket', url });
            this._fileReader = new FileReader();
            this._queue = [];
            this._isReading = false;
            this._isClosed = false;
            this._fileReader.onload = (event) => {
                this._isReading = false;
                const buff = event.target.result;
                this.traceSocketEvent("read" /* SocketDiagnosticsEventType.Read */, buff);
                this._onData.fire(buff);
                if (this._queue.length > 0) {
                    enqueue(this._queue.shift());
                }
            };
            const enqueue = (blob) => {
                if (this._isReading) {
                    this._queue.push(blob);
                    return;
                }
                this._isReading = true;
                this._fileReader.readAsArrayBuffer(blob);
            };
            this._socketMessageListener = (ev) => {
                const blob = ev.data;
                this.traceSocketEvent("browserWebSocketBlobReceived" /* SocketDiagnosticsEventType.BrowserWebSocketBlobReceived */, { type: blob.type, size: blob.size });
                enqueue(blob);
            };
            this._socket.addEventListener('message', this._socketMessageListener);
            this._register(dom.addDisposableListener(this._socket, 'open', (e) => {
                this.traceSocketEvent("open" /* SocketDiagnosticsEventType.Open */);
                this._onOpen.fire();
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
                this._onError.fire(err);
            };
            const errorRunner = this._register(new async_1.RunOnceScheduler(sendPendingErrorNow, 0));
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
            this._register(dom.addDisposableListener(this._socket, 'close', (e) => {
                this.traceSocketEvent("close" /* SocketDiagnosticsEventType.Close */, { code: e.code, reason: e.reason, wasClean: e.wasClean });
                this._isClosed = true;
                if (pendingErrorEvent) {
                    if (!window.navigator.onLine) {
                        // The browser is offline => this is a temporary error which might resolve itself
                        sendErrorNow(new remoteAuthorityResolver_1.RemoteAuthorityResolverError('Browser is offline', remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.TemporarilyNotAvailable, e));
                    }
                    else {
                        // An error event is pending
                        // The browser appears to be online...
                        if (!e.wasClean) {
                            // Let's be optimistic and hope that perhaps the server could not be reached or something
                            sendErrorNow(new remoteAuthorityResolver_1.RemoteAuthorityResolverError(e.reason || `WebSocket close with status code ${e.code}`, remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.TemporarilyNotAvailable, e));
                        }
                        else {
                            // this was a clean close => send existing error
                            errorRunner.cancel();
                            sendPendingErrorNow();
                        }
                    }
                }
                this._onClose.fire({ code: e.code, reason: e.reason, wasClean: e.wasClean, event: e });
            }));
            this._register(dom.addDisposableListener(this._socket, 'error', (err) => {
                this.traceSocketEvent("error" /* SocketDiagnosticsEventType.Error */, { message: err?.message });
                sendErrorSoon(err);
            }));
        }
        send(data) {
            if (this._isClosed) {
                // Refuse to write data to closed WebSocket...
                return;
            }
            this.traceSocketEvent("write" /* SocketDiagnosticsEventType.Write */, data);
            this._socket.send(data);
        }
        close() {
            this._isClosed = true;
            this.traceSocketEvent("close" /* SocketDiagnosticsEventType.Close */);
            this._socket.close();
            this._socket.removeEventListener('message', this._socketMessageListener);
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
            return this.socket.onData((data) => listener(buffer_1.VSBuffer.wrap(new Uint8Array(data))));
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
            return lifecycle_1.Disposable.None;
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
    class BrowserSocketFactory {
        constructor(webSocketFactory) {
            this._webSocketFactory = webSocketFactory || defaultWebSocketFactory;
        }
        supports(connectTo) {
            return true;
        }
        connect({ host, port }, path, query, debugLabel) {
            return new Promise((resolve, reject) => {
                const webSocketSchema = (/^https:/.test(window.location.href) ? 'wss' : 'ws');
                const socket = this._webSocketFactory.create(`${webSocketSchema}://${(/:/.test(host) && !/\[/.test(host)) ? `[${host}]` : host}:${port}${path}?${query}&skipWebSocketFrames=false`, debugLabel);
                const errorListener = socket.onError(reject);
                socket.onOpen(() => {
                    errorListener.dispose();
                    resolve(new BrowserSocket(socket, debugLabel));
                });
            });
        }
    }
    exports.BrowserSocketFactory = BrowserSocketFactory;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3NlclNvY2tldEZhY3RvcnkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9yZW1vdGUvYnJvd3Nlci9icm93c2VyU29ja2V0RmFjdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUE2Q2hHLE1BQU0sZ0JBQWlCLFNBQVEsc0JBQVU7UUF1QmpDLGdCQUFnQixDQUFDLElBQWdDLEVBQUUsSUFBa0U7WUFDM0gsMkJBQWlCLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNoRixDQUFDO1FBRUQsWUFBWSxHQUFXLEVBQUUsVUFBa0I7WUFDMUMsS0FBSyxFQUFFLENBQUM7WUExQlEsWUFBTyxHQUFHLElBQUksZUFBTyxFQUFlLENBQUM7WUFDdEMsV0FBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1lBRTNCLFlBQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUMvQyxXQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFFM0IsYUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQXdCLENBQUMsQ0FBQztZQUNoRSxZQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7WUFFN0IsYUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQU8sQ0FBQyxDQUFDO1lBQy9DLFlBQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztZQWlCN0MsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7WUFDOUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLFNBQVMsQ0FBQyxH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