/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/base/common/performance", "vs/base/common/uri", "vs/workbench/api/node/uriTransformer", "vs/base/common/uriIpc", "vs/base/node/ps", "vs/platform/diagnostics/node/diagnosticsService", "vs/base/common/path", "vs/base/common/resources"], function (require, exports, platform, performance, uri_1, uriTransformer_1, uriIpc_1, ps_1, diagnosticsService_1, path_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$xr = void 0;
    class $xr {
        static { this.a = 1; }
        constructor(b, c, d, e) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
        }
        async call(_, command, arg) {
            switch (command) {
                case 'getEnvironmentData': {
                    const args = arg;
                    const uriTransformer = (0, uriTransformer_1.$qr)(args.remoteAuthority);
                    let environmentData = await this.f(args.profile);
                    environmentData = (0, uriIpc_1.$Dm)(environmentData, uriTransformer);
                    return environmentData;
                }
                case 'getExtensionHostExitInfo': {
                    const args = arg;
                    return this.e.getExitInfo(args.reconnectionToken);
                }
                case 'getDiagnosticInfo': {
                    const options = arg;
                    const diagnosticInfo = {
                        machineInfo: (0, diagnosticsService_1.$ur)()
                    };
                    const processesPromise = options.includeProcesses ? (0, ps_1.$sr)(process.pid) : Promise.resolve();
                    let workspaceMetadataPromises = [];
                    const workspaceMetadata = {};
                    if (options.folders) {
                        // only incoming paths are transformed, so remote authority is unneeded.
                        const uriTransformer = (0, uriTransformer_1.$qr)('');
                        const folderPaths = options.folders
                            .map(folder => uri_1.URI.revive(uriTransformer.transformIncoming(folder)))
                            .filter(uri => uri.scheme === 'file');
                        workspaceMetadataPromises = folderPaths.map(folder => {
                            return (0, diagnosticsService_1.$tr)(folder.fsPath, ['node_modules', '.git'])
                                .then(stats => {
                                workspaceMetadata[(0, path_1.$ae)(folder.fsPath)] = stats;
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
        async f(profile) {
            if (profile && !this.d.profiles.some(p => p.id === profile)) {
                await this.d.createProfile(profile, profile);
            }
            return {
                pid: process.pid,
                connectionToken: (this.b.type !== 0 /* ServerConnectionTokenType.None */ ? this.b.value : ''),
                appRoot: uri_1.URI.file(this.c.appRoot),
                settingsPath: this.c.machineSettingsResource,
                logsPath: this.c.logsHome,
                extensionHostLogsPath: (0, resources_1.$ig)(this.c.logsHome, `exthost${$xr.a++}`),
                globalStorageHome: this.d.defaultProfile.globalStorageHome,
                workspaceStorageHome: this.c.workspaceStorageHome,
                localHistoryHome: this.c.localHistoryHome,
                userHome: this.c.userHome,
                os: platform.OS,
                arch: process.arch,
                marks: performance.getMarks(),
                useHostProxy: !!this.c.args['use-host-proxy'],
                profiles: {
                    home: this.d.profilesHome,
                    all: [...this.d.profiles].map(profile => ({ ...profile }))
                }
            };
        }
    }
    exports.$xr = $xr;
});
//# sourceMappingURL=remoteAgentEnvironmentImpl.js.map