/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/base/parts/ipc/common/ipc", "vs/base/parts/ipc/node/ipc.cp", "vs/platform/files/common/watcher"], function (require, exports, network_1, ipc_1, ipc_cp_1, watcher_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Tp = void 0;
    class $Tp extends watcher_1.$Hp {
        constructor(onFileChanges, onLogMessage, verboseLogging) {
            super(onFileChanges, onLogMessage, verboseLogging);
            this.s();
        }
        r(disposables) {
            // Fork the universal file watcher and build a client around
            // its server for passing over requests and receiving events.
            const client = disposables.add(new ipc_cp_1.$Sp(network_1.$2f.asFileUri('bootstrap-fork').fsPath, {
                serverName: 'File Watcher',
                args: ['--type=fileWatcher'],
                env: {
                    VSCODE_AMD_ENTRYPOINT: 'vs/platform/files/node/watcher/watcherMain',
                    VSCODE_PIPE_LOGGING: 'true',
                    VSCODE_VERBOSE_LOGGING: 'true' // transmit console logs from server to client
                }
            }));
            // React on unexpected termination of the watcher process
            disposables.add(client.onDidProcessExit(({ code, signal }) => this.t(`terminated by itself with code ${code}, signal: ${signal}`)));
            return ipc_1.ProxyChannel.toService((0, ipc_1.$ih)(client.getChannel('watcher')));
        }
    }
    exports.$Tp = $Tp;
});
//# sourceMappingURL=watcherClient.js.map