/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NestedWorker = void 0;
    const _bootstrapFnSource = (function _bootstrapFn(workerUrl) {
        const listener = (event) => {
            // uninstall handler
            globalThis.removeEventListener('message', listener);
            // get data
            const port = event.data;
            // postMessage
            // onmessage
            Object.defineProperties(globalThis, {
                'postMessage': {
                    value(data, transferOrOptions) {
                        port.postMessage(data, transferOrOptions);
                    }
                },
                'onmessage': {
                    get() {
                        return port.onmessage;
                    },
                    set(value) {
                        port.onmessage = value;
                    }
                }
                // todo onerror
            });
            port.addEventListener('message', msg => {
                globalThis.dispatchEvent(new MessageEvent('message', { data: msg.data, ports: msg.ports ? [...msg.ports] : undefined }));
            });
            port.start();
            // fake recursively nested worker
            globalThis.Worker = class {
                constructor() { throw new TypeError('Nested workers from within nested worker are NOT supported.'); }
            };
            // load module
            importScripts(workerUrl);
        };
        globalThis.addEventListener('message', listener);
    }).toString();
    class NestedWorker extends EventTarget {
        constructor(nativePostMessage, stringOrUrl, options) {
            super();
            this.onmessage = null;
            this.onmessageerror = null;
            this.onerror = null;
            // create bootstrap script
            const bootstrap = `((${_bootstrapFnSource})('${stringOrUrl}'))`;
            const blob = new Blob([bootstrap], { type: 'application/javascript' });
            const blobUrl = URL.createObjectURL(blob);
            const channel = new MessageChannel();
            const id = blobUrl; // works because blob url is unique, needs ID pool otherwise
            const msg = {
                type: '_newWorker',
                id,
                port: channel.port2,
                url: blobUrl,
                options,
            };
            nativePostMessage(msg, [channel.port2]);
            // worker-impl: functions
            this.postMessage = channel.port1.postMessage.bind(channel.port1);
            this.terminate = () => {
                const msg = {
                    type: '_terminateWorker',
                    id
                };
                nativePostMessage(msg);
                URL.revokeObjectURL(blobUrl);
                channel.port1.close();
                channel.port2.close();
            };
            // worker-impl: events
            Object.defineProperties(this, {
                'onmessage': {
                    get() {
                        return channel.port1.onmessage;
                    },
                    set(value) {
                        channel.port1.onmessage = value;
                    }
                },
                'onmessageerror': {
                    get() {
                        return channel.port1.onmessageerror;
                    },
                    set(value) {
                        channel.port1.onmessageerror = value;
                    }
                },
                // todo onerror
            });
            channel.port1.addEventListener('messageerror', evt => {
                const msgEvent = new MessageEvent('messageerror', { data: evt.data });
                this.dispatchEvent(msgEvent);
            });
            channel.port1.addEventListener('message', evt => {
                const msgEvent = new MessageEvent('message', { data: evt.data });
                this.dispatchEvent(msgEvent);
            });
            channel.port1.start();
        }
    }
    exports.NestedWorker = NestedWorker;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWZpbGxOZXN0ZWRXb3JrZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZXh0ZW5zaW9ucy93b3JrZXIvcG9seWZpbGxOZXN0ZWRXb3JrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxTQUFTLFlBQVksQ0FBQyxTQUFpQjtRQUVsRSxNQUFNLFFBQVEsR0FBa0IsQ0FBQyxLQUFZLEVBQVEsRUFBRTtZQUN0RCxvQkFBb0I7WUFDcEIsVUFBVSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUVwRCxXQUFXO1lBQ1gsTUFBTSxJQUFJLEdBQStCLEtBQU0sQ0FBQyxJQUFJLENBQUM7WUFFckQsY0FBYztZQUNkLFlBQVk7WUFDWixNQUFNLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFO2dCQUNuQyxhQUFhLEVBQUU7b0JBQ2QsS0FBSyxDQUFDLElBQVMsRUFBRSxpQkFBdUI7d0JBQ3ZDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLGlCQUFpQixDQUFDLENBQUM7b0JBQzNDLENBQUM7aUJBQ0Q7Z0JBQ0QsV0FBVyxFQUFFO29CQUNaLEdBQUc7d0JBQ0YsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO29CQUN2QixDQUFDO29CQUNELEdBQUcsQ0FBQyxLQUEwQjt3QkFDN0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7b0JBQ3hCLENBQUM7aUJBQ0Q7Z0JBQ0QsZUFBZTthQUNmLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLEVBQUU7Z0JBQ3RDLFVBQVUsQ0FBQyxhQUFhLENBQUMsSUFBSSxZQUFZLENBQUMsU0FBUyxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FB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