/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/base/parts/ipc/common/ipc", "vs/base/parts/ipc/node/ipc.cp", "vs/platform/files/common/watcher"], function (require, exports, network_1, ipc_1, ipc_cp_1, watcher_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UniversalWatcherClient = void 0;
    class UniversalWatcherClient extends watcher_1.AbstractUniversalWatcherClient {
        constructor(onFileChanges, onLogMessage, verboseLogging) {
            super(onFileChanges, onLogMessage, verboseLogging);
            this.init();
        }
        createWatcher(disposables) {
            // Fork the universal file watcher and build a client around
            // its server for passing over requests and receiving events.
            const client = disposables.add(new ipc_cp_1.Client(network_1.FileAccess.asFileUri('bootstrap-fork').fsPath, {
                serverName: 'File Watcher',
                args: ['--type=fileWatcher'],
                env: {
                    VSCODE_AMD_ENTRYPOINT: 'vs/platform/files/node/watcher/watcherMain',
                    VSCODE_PIPE_LOGGING: 'true',
                    VSCODE_VERBOSE_LOGGING: 'true' // transmit console logs from server to client
                }
            }));
            // React on unexpected termination of the watcher process
            disposables.add(client.onDidProcessExit(({ code, signal }) => this.onError(`terminated by itself with code ${code}, signal: ${signal}`)));
            return ipc_1.ProxyChannel.toService((0, ipc_1.getNextTickChannel)(client.getChannel('watcher')));
        }
    }
    exports.UniversalWatcherClient = UniversalWatcherClient;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2F0Y2hlckNsaWVudC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2ZpbGVzL25vZGUvd2F0Y2hlci93YXRjaGVyQ2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVFoRyxNQUFhLHNCQUF1QixTQUFRLHdDQUE4QjtRQUV6RSxZQUNDLGFBQW1ELEVBQ25ELFlBQXdDLEVBQ3hDLGNBQXVCO1lBRXZCLEtBQUssQ0FBQyxhQUFhLEVBQUUsWUFBWSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBRW5ELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNiLENBQUM7UUFFa0IsYUFBYSxDQUFDLFdBQTRCO1lBRTVELDREQUE0RDtZQUM1RCw2REFBNkQ7WUFDN0QsTUFBTSxNQUFNLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLGVBQU0sQ0FDeEMsb0JBQVUsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxNQUFNLEVBQzdDO2dCQUNDLFVBQVUsRUFBRSxjQUFjO2dCQUMxQixJQUFJLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztnQkFDNUIsR0FBRyxFQUFFO29CQUNKLHFCQUFxQixFQUFFLDRDQUE0QztvQkFDbkUsbUJBQW1CLEVBQUUsTUFBTTtvQkFDM0Isc0JBQXNCLEVBQUUsTUFBTSxDQUFDLDhDQUE4QztpQkFDN0U7YUFDRCxDQUNELENBQUMsQ0FBQztZQUVILHlEQUF5RDtZQUN6RCxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGtDQUFrQyxJQUFJLGFBQWEsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFMUksT0FBTyxrQkFBWSxDQUFDLFNBQVMsQ0FBb0IsSUFBQSx3QkFBa0IsRUFBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwRyxDQUFDO0tBQ0Q7SUFsQ0Qsd0RBa0NDIn0=