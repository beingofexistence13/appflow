/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/parts/ipc/common/ipc", "vs/platform/files/common/watcher"], function (require, exports, lifecycle_1, ipc_1, watcher_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$_$b = void 0;
    class $_$b extends watcher_1.$Hp {
        constructor(onFileChanges, onLogMessage, verboseLogging, C) {
            super(onFileChanges, onLogMessage, verboseLogging);
            this.C = C;
            this.s();
        }
        r(disposables) {
            const watcher = ipc_1.ProxyChannel.toService((0, ipc_1.$hh)((async () => {
                // Acquire universal watcher via utility process worker
                //
                // We explicitly do not add the worker as a disposable
                // because we need to call `stop` on disposal to prevent
                // a crash on shutdown (see below).
                //
                // The utility process worker services ensures to terminate
                // the process automatically when the window closes or reloads.
                const { client, onDidTerminate } = await this.C.createWorker({
                    moduleId: 'vs/platform/files/node/watcher/watcherMain',
                    type: 'fileWatcher'
                });
                // React on unexpected termination of the watcher process
                // by listening to the `onDidTerminate` event. We do not
                // consider an exit code of `0` as abnormal termination.
                onDidTerminate.then(({ reason }) => {
                    if (reason?.code === 0) {
                        this.y(`terminated by itself with code ${reason.code}, signal: ${reason.signal}`);
                    }
                    else {
                        this.t(`terminated by itself unexpectedly with code ${reason?.code}, signal: ${reason?.signal}`);
                    }
                });
                return client.getChannel('watcher');
            })()));
            // Looks like universal watcher needs an explicit stop
            // to prevent access on data structures after process
            // exit. This only seem to be happening when used from
            // Electron, not pure node.js.
            // https://github.com/microsoft/vscode/issues/136264
            disposables.add((0, lifecycle_1.$ic)(() => watcher.stop()));
            return watcher;
        }
    }
    exports.$_$b = $_$b;
});
//# sourceMappingURL=watcherClient.js.map