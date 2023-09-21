/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/base/common/performance", "vs/base/common/uri", "vs/workbench/api/node/uriTransformer", "vs/base/common/uriIpc", "vs/base/node/ps", "vs/platform/diagnostics/node/diagnosticsService", "vs/base/common/path", "vs/base/common/resources"], function (require, exports, platform, performance, uri_1, uriTransformer_1, uriIpc_1, ps_1, diagnosticsService_1, path_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteAgentEnvironmentChannel = void 0;
    class RemoteAgentEnvironmentChannel {
        static { this._namePool = 1; }
        constructor(_connectionToken, _environmentService, _userDataProfilesService, _extensionHostStatusService) {
            this._connectionToken = _connectionToken;
            this._environmentService = _environmentService;
            this._userDataProfilesService = _userDataProfilesService;
            this._extensionHostStatusService = _extensionHostStatusService;
        }
        async call(_, command, arg) {
            switch (command) {
                case 'getEnvironmentData': {
                    const args = arg;
                    const uriTransformer = (0, uriTransformer_1.createURITransformer)(args.remoteAuthority);
                    let environmentData = await this._getEnvironmentData(args.profile);
                    environmentData = (0, uriIpc_1.transformOutgoingURIs)(environmentData, uriTransformer);
                    return environmentData;
                }
                case 'getExtensionHostExitInfo': {
                    const args = arg;
                    return this._extensionHostStatusService.getExitInfo(args.reconnectionToken);
                }
                case 'getDiagnosticInfo': {
                    const options = arg;
                    const diagnosticInfo = {
                        machineInfo: (0, diagnosticsService_1.getMachineInfo)()
                    };
                    const processesPromise = options.includeProcesses ? (0, ps_1.listProcesses)(process.pid) : Promise.resolve();
                    let workspaceMetadataPromises = [];
                    const workspaceMetadata = {};
                    if (options.folders) {
                        // only incoming paths are transformed, so remote authority is unneeded.
                        const uriTransformer = (0, uriTransformer_1.createURITransformer)('');
                        const folderPaths = options.folders
                            .map(folder => uri_1.URI.revive(uriTransformer.transformIncoming(folder)))
                            .filter(uri => uri.scheme === 'file');
                        workspaceMetadataPromises = folderPaths.map(folder => {
                            return (0, diagnosticsService_1.collectWorkspaceStats)(folder.fsPath, ['node_modules', '.git'])
                                .then(stats => {
                                workspaceMetadata[(0, path_1.basename)(folder.fsPath)] = stats;
                            });
                        });
                    }
                    return Promise.all([processesPromise, ...workspaceMetadataPromises]).then(([processes, _]) => {
                        diagnosticInfo.processes = processes || undefined;
                        diagnosticInfo.workspaceMetadata = options.folders ? workspaceMetadata : undefined;
                        return diagnosticInfo;
                    });
                }
            }
            throw new Error(`IPC Command ${command} not found`);
        }
        listen(_, event, arg) {
            throw new Error('Not supported');
        }
        async _getEnvironmentData(profile) {
            if (profile && !this._userDataProfilesService.profiles.some(p => p.id === profile)) {
                await this._userDataProfilesService.createProfile(profile, profile);
            }
            return {
                pid: process.pid,
                connectionToken: (this._connectionToken.type !== 0 /* ServerConnectionTokenType.None */ ? this._connectionToken.value : ''),
                appRoot: uri_1.URI.file(this._environmentService.appRoot),
                settingsPath: this._environmentService.machineSettingsResource,
                logsPath: this._environmentService.logsHome,
                extensionHostLogsPath: (0, resources_1.joinPath)(this._environmentService.logsHome, `exthost${RemoteAgentEnvironmentChannel._namePool++}`),
                globalStorageHome: this._userDataProfilesService.defaultProfile.globalStorageHome,
                workspaceStorageHome: this._environmentService.workspaceStorageHome,
                localHistoryHome: this._environmentService.localHistoryHome,
                userHome: this._environmentService.userHome,
                os: platform.OS,
                arch: process.arch,
                marks: performance.getMarks(),
                useHostProxy: !!this._environmentService.args['use-host-proxy'],
                profiles: {
                    home: this._userDataProfilesService.profilesHome,
                    all: [...this._userDataProfilesService.profiles].map(profile => ({ ...profile }))
                }
            };
        }
    }
    exports.RemoteAgentEnvironmentChannel = RemoteAgentEnvironmentChannel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlQWdlbnRFbnZpcm9ubWVudEltcGwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9zZXJ2ZXIvbm9kZS9yZW1vdGVBZ2VudEVudmlyb25tZW50SW1wbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFxQmhHLE1BQWEsNkJBQTZCO2lCQUUxQixjQUFTLEdBQUcsQ0FBQyxDQUFDO1FBRTdCLFlBQ2tCLGdCQUF1QyxFQUN2QyxtQkFBOEMsRUFDOUMsd0JBQWtELEVBQ2xELDJCQUF3RDtZQUh4RCxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQXVCO1lBQ3ZDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBMkI7WUFDOUMsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEwQjtZQUNsRCxnQ0FBMkIsR0FBM0IsMkJBQTJCLENBQTZCO1FBRTFFLENBQUM7UUFFRCxLQUFLLENBQUMsSUFBSSxDQUFDLENBQU0sRUFBRSxPQUFlLEVBQUUsR0FBUztZQUM1QyxRQUFRLE9BQU8sRUFBRTtnQkFFaEIsS0FBSyxvQkFBb0IsQ0FBQyxDQUFDO29CQUMxQixNQUFNLElBQUksR0FBaUMsR0FBRyxDQUFDO29CQUMvQyxNQUFNLGNBQWMsR0FBRyxJQUFBLHFDQUFvQixFQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztvQkFFbEUsSUFBSSxlQUFlLEdBQUcsTUFBTSxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNuRSxlQUFlLEdBQUcsSUFBQSw4QkFBcUIsRUFBQyxlQUFlLEVBQUUsY0FBYyxDQUFDLENBQUM7b0JBRXpFLE9BQU8sZUFBZSxDQUFDO2lCQUN2QjtnQkFFRCxLQUFLLDBCQUEwQixDQUFDLENBQUM7b0JBQ2hDLE1BQU0sSUFBSSxHQUF1QyxHQUFHLENBQUM7b0JBQ3JELE9BQU8sSUFBSSxDQUFDLDJCQUEyQixDQUFDLFdBQVcs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