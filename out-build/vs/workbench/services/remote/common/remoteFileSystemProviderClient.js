/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/network", "vs/platform/files/common/diskFileSystemProviderClient"], function (require, exports, errors_1, lifecycle_1, network_1, diskFileSystemProviderClient_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$0M = exports.$9M = void 0;
    exports.$9M = 'remoteFilesystem';
    class $0M extends diskFileSystemProviderClient_1.$8M {
        static register(remoteAgentService, fileService, logService) {
            const connection = remoteAgentService.getConnection();
            if (!connection) {
                return lifecycle_1.$kc.None;
            }
            const disposables = new lifecycle_1.$jc();
            const environmentPromise = (async () => {
                try {
                    const environment = await remoteAgentService.getRawEnvironment();
                    if (environment) {
                        // Register remote fsp even before it is asked to activate
                        // because, some features (configuration) wait for its
                        // registration before making fs calls.
                        fileService.registerProvider(network_1.Schemas.vscodeRemote, disposables.add(new $0M(environment, connection)));
                    }
                    else {
                        logService.error('Cannot register remote filesystem provider. Remote environment doesnot exist.');
                    }
                }
                catch (error) {
                    logService.error('Cannot register remote filesystem provider. Error while fetching remote environment.', (0, errors_1.$8)(error));
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
            super(connection.getChannel(exports.$9M), { pathCaseSensitive: remoteAgentEnvironment.os === 3 /* OperatingSystem.Linux */ });
        }
    }
    exports.$0M = $0M;
});
//# sourceMappingURL=remoteFileSystemProviderClient.js.map