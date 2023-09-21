/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/event", "vs/workbench/services/extensions/common/extensionHostProtocol", "vs/workbench/api/common/extensionHostMain", "vs/workbench/services/extensions/worker/polyfillNestedWorker", "vs/base/common/path", "vs/base/common/performance", "vs/base/common/network", "vs/base/common/uri", "vs/workbench/api/common/extHost.common.services", "vs/workbench/api/worker/extHost.worker.services"], function (require, exports, buffer_1, event_1, extensionHostProtocol_1, extensionHostMain_1, polyfillNestedWorker_1, path, performance, network_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.create = void 0;
    const nativeClose = self.close.bind(self);
    self.close = () => console.trace(`'close' has been blocked`);
    const nativePostMessage = postMessage.bind(self);
    self.postMessage = () => console.trace(`'postMessage' has been blocked`);
    function shouldTransformUri(uri) {
        // In principle, we could convert any URI, but we have concerns
        // that parsing https URIs might end up decoding escape characters
        // and result in an unintended transformation
        return /^(file|vscode-remote):/i.test(uri);
    }
    const nativeFetch = fetch.bind(self);
    function patchFetching(asBrowserUri) {
        self.fetch = async function (input, init) {
            if (input instanceof Request) {
                // Request object - massage not supported
                return nativeFetch(input, init);
            }
            if (shouldTransformUri(String(input))) {
                input = (await asBrowserUri(uri_1.URI.parse(String(input)))).toString(true);
            }
            return nativeFetch(input, init);
        };
        self.XMLHttpRequest = class extends XMLHttpRequest {
            open(method, url, async, username, password) {
                (async () => {
                    if (shouldTransformUri(url.toString())) {
                        url = (await asBrowserUri(uri_1.URI.parse(url.toString()))).toString(true);
                    }
                    super.open(method, url, async ?? true, username, password);
                })();
            }
        };
    }
    self.importScripts = () => { throw new Error(`'importScripts' has been blocked`); };
    // const nativeAddEventListener = addEventListener.bind(self);
    self.addEventListener = () => console.trace(`'addEventListener' has been blocked`);
    self['AMDLoader'] = undefined;
    self['NLSLoaderPlugin'] = undefined;
    self['define'] = undefined;
    self['require'] = undefined;
    self['webkitRequestFileSystem'] = undefined;
    self['webkitRequestFileSystemSync'] = undefined;
    self['webkitResolveLocalFileSystemSyncURL'] = undefined;
    self['webkitResolveLocalFileSystemURL'] = undefined;
    if (self.Worker) {
        // make sure new Worker(...) always uses blob: (to maintain current origin)
        const _Worker = self.Worker;
        Worker = function (stringUrl, options) {
            if (/^file:/i.test(stringUrl.toString())) {
                stringUrl = network_1.$2f.uriToBrowserUri(uri_1.URI.parse(stringUrl.toString())).toString(true);
            }
            else if (/^vscode-remote:/i.test(stringUrl.toString())) {
                // Supporting transformation of vscode-remote URIs requires an async call to the main thread,
                // but we cannot do this call from within the embedded Worker, and the only way out would be
                // to use templating instead of a function in the web api (`resourceUriProvider`)
                throw new Error(`Creating workers from remote extensions is currently not supported.`);
            }
            // IMPORTANT: bootstrapFn is stringified and injected as worker blob-url. Because of that it CANNOT
            // have dependencies on other functions or variables. Only constant values are supported. Due to
            // that logic of FileAccess.asBrowserUri had to be copied, see `asWorkerBrowserUrl` (below).
            const bootstrapFnSource = (function bootstrapFn(workerUrl) {
                function asWorkerBrowserUrl(url) {
                    if (typeof url === 'string' || url instanceof URL) {
                        return String(url).replace(/^file:\/\//i, 'vscode-file://vscode-app');
                    }
                    return url;
                }
                const nativeFetch = fetch.bind(self);
                self.fetch = function (input, init) {
                    if (input instanceof Request) {
                        // Request object - massage not supported
                        return nativeFetch(input, init);
                    }
                    return nativeFetch(asWorkerBrowserUrl(input), init);
                };
                self.XMLHttpRequest = class extends XMLHttpRequest {
                    open(method, url, async, username, password) {
                        return super.open(method, asWorkerBrowserUrl(url), async ?? true, username, password);
                    }
                };
                const nativeImportScripts = importScripts.bind(self);
                self.importScripts = (...urls) => {
                    nativeImportScripts(...urls.map(asWorkerBrowserUrl));
                };
                nativeImportScripts(workerUrl);
            }).toString();
            const js = `(${bootstrapFnSource}('${stringUrl}'))`;
            options = options || {};
            options.name = options.name || path.$ae(stringUrl.toString());
            const blob = new Blob([js], { type: 'application/javascript' });
            const blobUrl = URL.createObjectURL(blob);
            return new _Worker(blobUrl, options);
        };
    }
    else {
        self.Worker = class extends polyfillNestedWorker_1.$lfc {
            constructor(stringOrUrl, options) {
                super(nativePostMessage, stringOrUrl, { name: path.$ae(stringOrUrl.toString()), ...options });
            }
        };
    }
    //#endregion ---
    const hostUtil = new class {
        constructor() {
            this.pid = undefined;
        }
        exit(_code) {
            nativeClose();
        }
    };
    class ExtensionWorker {
        constructor() {
            const channel = new MessageChannel();
            const emitter = new event_1.$fd();
            let terminating = false;
            // send over port2, keep port1
            nativePostMessage(channel.port2, [channel.port2]);
            channel.port1.onmessage = event => {
                const { data } = event;
                if (!(data instanceof ArrayBuffer)) {
                    console.warn('UNKNOWN data received', data);
                    return;
                }
                const msg = buffer_1.$Fd.wrap(new Uint8Array(data, 0, data.byteLength));
                if ((0, extensionHostProtocol_1.$5l)(msg, 2 /* MessageType.Terminate */)) {
                    // handle terminate-message right here
                    terminating = true;
                    onTerminate('received terminate message from renderer');
                    return;
                }
                // emit non-terminate messages to the outside
                emitter.fire(msg);
            };
            this.protocol = {
                onMessage: emitter.event,
                send: vsbuf => {
                    if (!terminating) {
                        const data = vsbuf.buffer.buffer.slice(vsbuf.buffer.byteOffset, vsbuf.buffer.byteOffset + vsbuf.buffer.byteLength);
                        channel.port1.postMessage(data, [data]);
                    }
                }
            };
        }
    }
    function connectToRenderer(protocol) {
        return new Promise(resolve => {
            const once = protocol.onMessage(raw => {
                once.dispose();
                const initData = JSON.parse(raw.toString());
                protocol.send((0, extensionHostProtocol_1.$4l)(0 /* MessageType.Initialized */));
                resolve({ protocol, initData });
            });
            protocol.send((0, extensionHostProtocol_1.$4l)(1 /* MessageType.Ready */));
        });
    }
    let onTerminate = (reason) => nativeClose();
    function isInitMessage(a) {
        return !!a && typeof a === 'object' && a.type === 'vscode.init' && a.data instanceof Map;
    }
    function create() {
        performance.mark(`code/extHost/willConnectToRenderer`);
        const res = new ExtensionWorker();
        return {
            onmessage(message) {
                if (!isInitMessage(message)) {
                    return; // silently ignore foreign messages
                }
                connectToRenderer(res.protocol).then(data => {
                    performance.mark(`code/extHost/didWaitForInitData`);
                    const extHostMain = new extensionHostMain_1.$gdc(data.protocol, data.initData, hostUtil, null, message.data);
                    patchFetching(uri => extHostMain.asBrowserUri(uri));
                    onTerminate = (reason) => extHostMain.terminate(reason);
                });
            }
        };
    }
    exports.create = create;
});
//# sourceMappingURL=extensionHostWorker.js.map