/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "net", "vs/platform/debug/common/extensionHostDebugIpc", "vs/platform/environment/node/argv"], function (require, exports, net_1, extensionHostDebugIpc_1, argv_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ElectronExtensionHostDebugBroadcastChannel = void 0;
    class ElectronExtensionHostDebugBroadcastChannel extends extensionHostDebugIpc_1.ExtensionHostDebugBroadcastChannel {
        constructor(windowsMainService) {
            super();
            this.windowsMainService = windowsMainService;
        }
        call(ctx, command, arg) {
            if (command === 'openExtensionDevelopmentHostWindow') {
                return this.openExtensionDevelopmentHostWindow(arg[0], arg[1]);
            }
            else {
                return super.call(ctx, command, arg);
            }
        }
        async openExtensionDevelopmentHostWindow(args, debugRenderer) {
            const pargs = (0, argv_1.parseArgs)(args, argv_1.OPTIONS);
            pargs.debugRenderer = debugRenderer;
            const extDevPaths = pargs.extensionDevelopmentPath;
            if (!extDevPaths) {
                return { success: false };
            }
            const [codeWindow] = await this.windowsMainService.openExtensionDevelopmentHostWindow(extDevPaths, {
                context: 5 /* OpenContext.API */,
                cli: pargs,
                forceProfile: pargs.profile,
                forceTempProfile: pargs['profile-temp']
            });
            if (!debugRenderer) {
                return { success: true };
            }
            const win = codeWindow.win;
            if (!win) {
                return { success: true };
            }
            const debug = win.webContents.debugger;
            let listeners = debug.isAttached() ? Infinity : 0;
            const server = (0, net_1.createServer)(listener => {
                if (listeners++ === 0) {
                    debug.attach();
                }
                let closed = false;
                const writeMessage = (message) => {
                    if (!closed) { // in case sendCommand promises settle after closed
                        listener.write(JSON.stringify(message) + '\0'); // null-delimited, CDP-compatible
                    }
                };
                const onMessage = (_event, method, params, sessionId) => writeMessage(({ method, params, sessionId }));
                win.on('close', () => {
                    debug.removeListener('message', onMessage);
                    listener.end();
                    closed = true;
                });
                debug.addListener('message', onMessage);
                let buf = Buffer.alloc(0);
                listener.on('data', data => {
                    buf = Buffer.concat([buf, data]);
                    for (let delimiter = buf.indexOf(0); delimiter !== -1; delimiter = buf.indexOf(0)) {
                        let data;
                        try {
                            const contents = buf.slice(0, delimiter).toString('utf8');
                            buf = buf.slice(delimiter + 1);
                            data = JSON.parse(contents);
                        }
                        catch (e) {
                            console.error('error reading cdp line', e);
                        }
                        // depends on a new API for which electron.d.ts has not been updated:
                        // @ts-ignore
                        debug.sendCommand(data.method, data.params, data.sessionId)
                            .then((result) => writeMessage({ id: data.id, sessionId: data.sessionId, result }))
                            .catch((error) => writeMessage({ id: data.id, sessionId: data.sessionId, error: { code: 0, message: error.message } }));
                    }
                });
                listener.on('error', err => {
                    console.error('error on cdp pipe:', err);
                });
                listener.on('close', () => {
                    closed = true;
                    if (--listeners === 0) {
                        debug.detach();
                    }
                });
            });
            await new Promise(r => server.listen(0, r));
            win.on('close', () => server.close());
            return { rendererDebugPort: server.address().port, success: true };
        }
    }
    exports.ElectronExtensionHostDebugBroadcastChannel = ElectronExtensionHostDebugBroadcastChannel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uSG9zdERlYnVnSXBjLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZGVidWcvZWxlY3Ryb24tbWFpbi9leHRlbnNpb25Ib3N0RGVidWdJcGMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLE1BQWEsMENBQXFELFNBQVEsMERBQTRDO1FBRXJILFlBQ1Msa0JBQXVDO1lBRS9DLEtBQUssRUFBRSxDQUFDO1lBRkEsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtRQUdoRCxDQUFDO1FBRVEsSUFBSSxDQUFDLEdBQWEsRUFBRSxPQUFlLEVBQUUsR0FBUztZQUN0RCxJQUFJLE9BQU8sS0FBSyxvQ0FBb0MsRUFBRTtnQkFDckQsT0FBTyxJQUFJLENBQUMsa0NBQWtDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQy9EO2lCQUFNO2dCQUNOLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQ3JDO1FBQ0YsQ0FBQztRQUVPLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxJQUFjLEVBQUUsYUFBc0I7WUFDdEYsTUFBTSxLQUFLLEdBQUcsSUFBQSxnQkFBUyxFQUFDLElBQUksRUFBRSxjQUFPLENBQUMsQ0FBQztZQUN2QyxLQUFLLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztZQUVwQyxNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsd0JBQXdCLENBQUM7WUFDbkQsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDakIsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQzthQUMxQjtZQUVELE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxrQ0FBa0MsQ0FBQyxX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