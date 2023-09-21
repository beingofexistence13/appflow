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
                stringUrl = network_1.FileAccess.uriToBrowserUri(uri_1.URI.parse(stringUrl.toString())).toString(true);
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
            options.name = options.name || path.basename(stringUrl.toString());
            const blob = new Blob([js], { type: 'application/javascript' });
            const blobUrl = URL.createObjectURL(blob);
            return new _Worker(blobUrl, options);
        };
    }
    else {
        self.Worker = class extends polyfillNestedWorker_1.NestedWorker {
            constructor(stringOrUrl, options) {
                super(nativePostMessage, stringOrUrl, { name: path.basename(stringOrUrl.toString()), ...options });
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
            const emitter = new event_1.Emitter();
            let terminating = false;
            // send over port2, keep port1
            nativePostMessage(channel.port2, [channel.port2]);
            channel.port1.onmessage = event => {
                const { data } = event;
                if (!(data instanceof ArrayBuffer)) {
                    console.warn('UNKNOWN data received', data);
                    return;
                }
                const msg = buffer_1.VSBuffer.wrap(new Uint8Array(data, 0, data.byteLength));
                if ((0, extensionHostProtocol_1.isMessageOfType)(msg, 2 /* MessageType.Terminate */)) {
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
                protocol.send((0, extensionHostProtocol_1.createMessageOfType)(0 /* MessageType.Initialized */));
                resolve({ protocol, initData });
            });
            protocol.send((0, extensionHostProtocol_1.createMessageOfType)(1 /* MessageType.Ready */));
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
                    const extHostMain = new extensionHostMain_1.ExtensionHostMain(data.protocol, data.initData, hostUtil, null, message.data);
                    patchFetching(uri => extHostMain.asBrowserUri(uri));
                    onTerminate = (reason) => extHostMain.terminate(reason);
                });
            }
        };
    }
    exports.create = create;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uSG9zdFdvcmtlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvd29ya2VyL2V4dGVuc2lvbkhvc3RXb3JrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBb0NoRyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxQyxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztJQUU3RCxNQUFNLGlCQUFpQixHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDakQsSUFBSSxDQUFDLFdBQVcsR0FBRyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7SUFFekUsU0FBUyxrQkFBa0IsQ0FBQyxHQUFXO1FBQ3RDLCtEQUErRDtRQUMvRCxrRUFBa0U7UUFDbEUsNkNBQTZDO1FBQzdDLE9BQU8seUJBQXlCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFRCxNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JDLFNBQVMsYUFBYSxDQUFDLFlBQXdDO1FBQzlELElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxXQUFXLEtBQUssRUFBRSxJQUFJO1lBQ3ZDLElBQUksS0FBSyxZQUFZLE9BQU8sRUFBRTtnQkFDN0IseUNBQXlDO2dCQUN6QyxPQUFPLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDaEM7WUFDRCxJQUFJLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO2dCQUN0QyxLQUFLLEdBQUcsQ0FBQyxNQUFNLFlBQVksQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDdEU7WUFDRCxPQUFPLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDakMsQ0FBQyxDQUFDO1FBRUYsSUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFNLFNBQVEsY0FBYztZQUN4QyxJQUFJLENBQUMsTUFBYyxFQUFFLEdBQWlCLEVBQUUsS0FBZSxFQUFFLFFBQXdCLEVBQUUsUUFBd0I7Z0JBQ25ILENBQUMsS0FBSyxJQUFJLEVBQUU7b0JBQ1gsSUFBSSxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRTt3QkFDdkMsR0FBRyxHQUFHLENBQUMsTUFBTSxZQUFZLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNyRTtvQkFDRCxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxJQUFJLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQzVELENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDTixDQUFDO1NBQ0QsQ0FBQztJQUNILENBQUM7SUFFRCxJQUFJLENBQUMsYUFBYSxHQUFHLEdBQUcsRUFBRSxHQUFHLE1BQU0sSUFBSSxLQUFLLENBQUMsa0NBQWtDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVwRiw4REFBOEQ7SUFDOUQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztJQUU3RSxJQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBQy9CLElBQUssQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLFNBQVMsQ0FBQztJQUNyQyxJQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBQzVCLElBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxTQUFTLENBQUM7SUFDN0IsSUFBSyxDQUFDLHlCQUF5QixDQUFDLEdBQUcsU0FBUyxDQUFDO0lBQzdDLElBQUssQ0FBQyw2QkFBNkIsQ0FBQyxHQUFHLFNBQVMsQ0FBQztJQUNqRCxJQUFLLENBQUMscUNBQXFDLENBQUMsR0FBRyxTQUFTLENBQUM7SUFDekQsSUFBSyxDQUFDLGlDQUFpQyxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBRTNELElBQVUsSUFBSyxDQUFDLE1BQU0sRUFBRTtRQUV2QiwyRUFBMkU7UUFDM0UsTUFBTSxPQUFPLEdBQVMsSUFBSyxDQUFDLE1BQU0sQ0FBQztRQUNuQyxNQUFNLEdBQVEsVUFBVSxTQUF1QixFQUFFLE9BQXVCO1lBQ3ZFLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRTtnQkFDekMsU0FBUyxHQUFHLG9CQUFVLENBQUMsZUFBZSxDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDdkY7aUJBQU0sSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUU7Z0JBQ3pELDZGQUE2RjtnQkFDN0YsNEZBQTRGO2dCQUM1RixpRkFBaUY7Z0JBQ2pGLE1BQU0sSUFBSSxLQUFLLENBQUMscUVBQXFFLENBQUMsQ0FBQzthQUN2RjtZQUVELG1HQUFtRztZQUNuRyxnR0FBZ0c7WUFDaEcsNEZBQTRGO1lBQzVGLE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxTQUFTLFdBQVcsQ0FBQyxTQUFpQjtnQkFDaEUsU0FBUyxrQkFBa0IsQ0FBQyxHQUFvQztvQkFDL0QsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLElBQUksR0FBRyxZQUFZLEdBQUcsRUFBRTt3QkFDbEQsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO3FCQUN0RTtvQkFDRCxPQUFPLEdBQUcsQ0FBQztnQkFDWixDQUFDO2dCQUVELE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxLQUFLLEdBQUcsVUFBVSxLQUFLLEVBQUUsSUFBSTtvQkFDakMsSUFBSSxLQUFLLFlBQVksT0FBTyxFQUFFO3dCQUM3Qix5Q0FBeUM7d0JBQ3pDLE9BQU8sV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztxQkFDaEM7b0JBQ0QsT0FBTyxXQUFXLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3JELENBQUMsQ0FBQztnQkFDRixJQUFJLENBQUMsY0FBYyxHQUFHLEtBQU0sU0FBUSxjQUFjO29CQUN4QyxJQUFJLENBQUMsTUFBYyxFQUFFLEdBQWlCLEVBQUUsS0FBZSxFQUFFLFFBQXdCLEVBQUUsUUFBd0I7d0JBQ25ILE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsa0JBQWtCLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxJQUFJLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7b0JBQ3ZGLENBQUM7aUJBQ0QsQ0FBQztnQkFDRixNQUFNLG1CQUFtQixHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3JELElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxHQUFHLElBQWMsRUFBRSxFQUFFO29CQUMxQyxtQkFBbUIsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO2dCQUN0RCxDQUFDLENBQUM7Z0JBRUYsbUJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDaEMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFZCxNQUFNLEVBQUUsR0FBRyxJQUFJLGlCQUFpQixLQUFLLFNBQVMsS0FBSyxDQUFDO1lBQ3BELE9BQU8sR0FBRyxPQUFPLElBQUksRUFBRSxDQUFDO1lBQ3hCLE9BQU8sQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ25FLE1BQU0sSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsd0JBQXdCLEVBQUUsQ0FBQyxDQUFDO1lBQ2hFLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDMUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdEMsQ0FBQyxDQUFDO0tBRUY7U0FBTTtRQUNBLElBQUssQ0FBQyxNQUFNLEdBQUcsS0FBTSxTQUFRLG1DQUFZO1lBQzlDLFlBQVksV0FBeUIsRUFBRSxPQUF1QjtnQkFDN0QsS0FBSyxDQUFDLGlCQUFpQixFQUFFLFdBQVcsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLEdBQUcsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUNwRyxDQUFDO1NBQ0QsQ0FBQztLQUNGO0lBRUQsZ0JBQWdCO0lBRWhCLE1BQU0sUUFBUSxHQUFHLElBQUk7UUFBQTtZQUVKLFFBQUcsR0FBRyxTQUFTLENBQUM7UUFJakMsQ0FBQztRQUhBLElBQUksQ0FBQyxLQUEwQjtZQUM5QixXQUFXLEVBQUUsQ0FBQztRQUNmLENBQUM7S0FDRCxDQUFDO0lBR0YsTUFBTSxlQUFlO1FBS3BCO1lBRUMsTUFBTSxPQUFPLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztZQUNyQyxNQUFNLE9BQU8sR0FBRyxJQUFJLGVBQU8sRUFBWSxDQUFDO1lBQ3hDLElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQztZQUV4Qiw4QkFBOEI7WUFDOUIsaUJBQWlCLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBRWxELE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxFQUFFO2dCQUNqQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDO2dCQUN2QixJQUFJLENBQUMsQ0FBQyxJQUFJLFlBQVksV0FBVyxDQUFDLEVBQUU7b0JBQ25DLE9BQU8sQ0FBQyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQzVDLE9BQU87aUJBQ1A7Z0JBRUQsTUFBTSxHQUFHLEdBQUcsaUJBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztnQkFDcEUsSUFBSSxJQUFBLHVDQUFlLEVBQUMsR0FBRyxnQ0FBd0IsRUFBRTtvQkFDaEQsc0NBQXNDO29CQUN0QyxXQUFXLEdBQUcsSUFBSSxDQUFDO29CQUNuQixXQUFXLENBQUMsMENBQTBDLENBQUMsQ0FBQztvQkFDeEQsT0FBTztpQkFDUDtnQkFFRCw2Q0FBNkM7Z0JBQzdDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbkIsQ0FBQyxDQUFDO1lBRUYsSUFBSSxDQUFDLFFBQVEsR0FBRztnQkFDZixTQUFTLEVBQUUsT0FBTyxDQUFDLEtBQUs7Z0JBQ3hCLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRTtvQkFDYixJQUFJLENBQUMsV0FBVyxFQUFFO3dCQUNqQixNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQzt3QkFDbkgsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztxQkFDeEM7Z0JBQ0YsQ0FBQzthQUNELENBQUM7UUFDSCxDQUFDO0tBQ0Q7SUFNRCxTQUFTLGlCQUFpQixDQUFDLFFBQWlDO1FBQzNELE9BQU8sSUFBSSxPQUFPLENBQXNCLE9BQU8sQ0FBQyxFQUFFO1lBQ2pELE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ3JDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDZixNQUFNLFFBQVEsR0FBMkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztnQkFDcEUsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFBLDJDQUFtQixrQ0FBeUIsQ0FBQyxDQUFDO2dCQUM1RCxPQUFPLENBQUMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNqQyxDQUFDLENBQUMsQ0FBQztZQUNILFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBQSwyQ0FBbUIsNEJBQW1CLENBQUMsQ0FBQztRQUN2RCxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRCxJQUFJLFdBQVcsR0FBRyxDQUFDLE1BQWMsRUFBRSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7SUFPcEQsU0FBUyxhQUFhLENBQUMsQ0FBTTtRQUM1QixPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLEtBQUssUUFBUSxJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssYUFBYSxJQUFJLENBQUMsQ0FBQyxJQUFJLFlBQVksR0FBRyxDQUFDO0lBQzFGLENBQUM7SUFFRCxTQUFnQixNQUFNO1FBQ3JCLFdBQVcsQ0FBQyxJQUFJLENBQUMsb0NBQW9DLENBQUMsQ0FBQztRQUN2RCxNQUFNLEdBQUcsR0FBRyxJQUFJLGVBQWUsRUFBRSxDQUFDO1FBRWxDLE9BQU87WUFDTixTQUFTLENBQUMsT0FBWTtnQkFDckIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDNUIsT0FBTyxDQUFDLG1DQUFtQztpQkFDM0M7Z0JBRUQsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDM0MsV0FBVyxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO29CQUNwRCxNQUFNLFdBQVcsR0FBRyxJQUFJLHFDQUFpQixDQUN4QyxJQUFJLENBQUMsUUFBUSxFQUNiLElBQUksQ0FBQyxRQUFRLEVBQ2IsUUFBUSxFQUNSLElBQUksRUFDSixPQUFPLENBQUMsSUFBSSxDQUNaLENBQUM7b0JBRUYsYUFBYSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUVwRCxXQUFXLEdBQUcsQ0FBQyxNQUFjLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ2pFLENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQztTQUNELENBQUM7SUFDSCxDQUFDO0lBMUJELHdCQTBCQyJ9