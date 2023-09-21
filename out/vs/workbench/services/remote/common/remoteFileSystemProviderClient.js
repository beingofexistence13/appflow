/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/network", "vs/platform/files/common/diskFileSystemProviderClient"], function (require, exports, errors_1, lifecycle_1, network_1, diskFileSystemProviderClient_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteFileSystemProviderClient = exports.REMOTE_FILE_SYSTEM_CHANNEL_NAME = void 0;
    exports.REMOTE_FILE_SYSTEM_CHANNEL_NAME = 'remoteFilesystem';
    class RemoteFileSystemProviderClient extends diskFileSystemProviderClient_1.DiskFileSystemProviderClient {
        static register(remoteAgentService, fileService, logService) {
            const connection = remoteAgentService.getConnection();
            if (!connection) {
                return lifecycle_1.Disposable.None;
            }
            const disposables = new lifecycle_1.DisposableStore();
            const environmentPromise = (async () => {
                try {
                    const environment = await remoteAgentService.getRawEnvironment();
                    if (environment) {
                        // Register remote fsp even before it is asked to activate
                        // because, some features (configuration) wait for its
                        // registration before making fs calls.
                        fileService.registerProvider(network_1.Schemas.vscodeRemote, disposables.add(new RemoteFileSystemProviderClient(environment, connection)));
                    }
                    else {
                        logService.error('Cannot register remote filesystem provider. Remote environment doesnot exist.');
                    }
                }
                catch (error) {
                    logService.error('Cannot register remote filesystem provider. Error while fetching remote environment.', (0, errors_1.getErrorMessage)(error));
                }
            })();
            disposables.add(fileService.onWillActivateFileSystemProvider(e => {
                if (e.scheme === network_1.Schemas.vscodeRemote) {
                    e.join(environmentPromise);
                }
            }));
            return disposables;
        }
        constructor(remoteAgentEnvironment, connection) {
            super(connection.getChannel(exports.REMOTE_FILE_SYSTEM_CHANNEL_NAME), { pathCaseSensitive: remoteAgentEnvironment.os === 3 /* OperatingSystem.Linux */ });
        }
    }
    exports.RemoteFileSystemProviderClient = RemoteFileSystemProviderClient;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlRmlsZVN5c3RlbVByb3ZpZGVyQ2xpZW50LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3JlbW90ZS9jb21tb24vcmVtb3RlRmlsZVN5c3RlbVByb3ZpZGVyQ2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVluRixRQUFBLCtCQUErQixHQUFHLGtCQUFrQixDQUFDO0lBRWxFLE1BQWEsOEJBQStCLFNBQVEsMkRBQTRCO1FBRS9FLE1BQU0sQ0FBQyxRQUFRLENBQUMsa0JBQXVDLEVBQUUsV0FBeUIsRUFBRSxVQUF1QjtZQUMxRyxNQUFNLFVBQVUsR0FBRyxrQkFBa0IsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUN0RCxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUNoQixPQUFPLHNCQUFVLENBQUMsSUFBSSxDQUFDO2FBQ3ZCO1lBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFFMUMsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLEtBQUssSUFBSSxFQUFFO2dCQUN0QyxJQUFJO29CQUNILE1BQU0sV0FBVyxHQUFHLE1BQU0sa0JBQWtCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztvQkFDakUsSUFBSSxXQUFXLEVBQUU7d0JBQ2hCLDBEQUEwRDt3QkFDMUQsc0RBQXNEO3dCQUN0RCx1Q0FBdUM7d0JBQ3ZDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxpQkFBTyxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksOEJBQThCLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDakk7eUJBQU07d0JBQ04sVUFBVSxDQUFDLEtBQUssQ0FBQywrRUFBK0UsQ0FBQyxDQUFDO3FCQUNsRztpQkFDRDtnQkFBQyxPQUFPLEtBQUssRUFBRTtvQkFDZixVQUFVLENBQUMsS0FBSyxDQUFDLHNGQUFzRixFQUFFLElBQUEsd0JBQWUsRUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2lCQUNqSTtZQUNGLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFFTCxXQUFXLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDaEUsSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFLLGlCQUFPLENBQUMsWUFBWSxFQUFFO29CQUN0QyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7aUJBQzNCO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLE9BQU8sV0FBVyxDQUFDO1FBQ3BCLENBQUM7UUFFRCxZQUFvQixzQkFBK0MsRUFBRSxVQUFrQztZQUN0RyxLQUFLLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyx1Q0FBK0IsQ0FBQyxFQUFFLEVBQUUsaUJBQWlCLEVBQUUsc0JBQXNCLENBQUMsRUFBRSxrQ0FBMEIsRUFBRSxDQUFDLENBQUM7UUFDM0ksQ0FBQztLQUNEO0lBdENELHdFQXNDQyJ9