/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/browser/hash", "vs/base/common/errors", "vs/platform/files/common/files", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/contrib/tags/common/workspaceTags", "vs/platform/diagnostics/common/diagnostics", "vs/platform/request/common/request", "vs/base/common/platform", "vs/platform/extensionManagement/common/configRemotes", "vs/platform/native/common/native", "vs/platform/product/common/productService"], function (require, exports, hash_1, errors_1, files_1, telemetry_1, workspace_1, textfiles_1, workspaceTags_1, diagnostics_1, request_1, platform_1, configRemotes_1, native_1, productService_1) {
    "use strict";
    var WorkspaceTags_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspaceTags = exports.getHashedRemotesFromConfig = void 0;
    async function getHashedRemotesFromConfig(text, stripEndingDotGit = false) {
        return (0, workspaceTags_1.getHashedRemotesFromConfig)(text, stripEndingDotGit, remote => (0, hash_1.sha1Hex)(remote));
    }
    exports.getHashedRemotesFromConfig = getHashedRemotesFromConfig;
    let WorkspaceTags = WorkspaceTags_1 = class WorkspaceTags {
        constructor(fileService, contextService, telemetryService, requestService, textFileService, workspaceTagsService, diagnosticsService, productService, nativeHostService) {
            this.fileService = fileService;
            this.contextService = contextService;
            this.telemetryService = telemetryService;
            this.requestService = requestService;
            this.textFileService = textFileService;
            this.workspaceTagsService = workspaceTagsService;
            this.diagnosticsService = diagnosticsService;
            this.productService = productService;
            this.nativeHostService = nativeHostService;
            if (this.telemetryService.telemetryLevel === 3 /* TelemetryLevel.USAGE */) {
                this.report();
            }
        }
        async report() {
            // Windows-only Edition Event
            this.reportWindowsEdition();
            // Workspace Tags
            this.workspaceTagsService.getTags()
                .then(tags => this.reportWorkspaceTags(tags), error => (0, errors_1.onUnexpectedError)(error));
            // Cloud Stats
            this.reportCloudStats();
            this.reportProxyStats();
            this.getWorkspaceInformation().then(stats => this.diagnosticsService.reportWorkspaceStats(stats));
        }
        async reportWindowsEdition() {
            if (!platform_1.isWindows) {
                return;
            }
            let value = await this.nativeHostService.windowsGetStringRegKey('HKEY_LOCAL_MACHINE', 'SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion', 'EditionID');
            if (value === undefined) {
                value = 'Unknown';
            }
            this.telemetryService.publicLog2('windowsEdition', { edition: value });
        }
        async getWorkspaceInformation() {
            const workspace = this.contextService.getWorkspace();
            const state = this.contextService.getWorkbenchState();
            const telemetryId = await this.workspaceTagsService.getTelemetryWorkspaceId(workspace, state);
            return {
                id: workspace.id,
                telemetryId,
                rendererSessionId: this.telemetryService.sessionId,
                folders: workspace.folders,
                transient: workspace.transient,
                configuration: workspace.configuration
            };
        }
        reportWorkspaceTags(tags) {
            /* __GDPR__
                "workspce.tags" : {
                    "owner": "lramos15",
                    "${include}": [
                        "${WorkspaceTags}"
                    ]
                }
            */
            this.telemetryService.publicLog('workspce.tags', tags);
        }
        reportRemoteDomains(workspaceUris) {
            Promise.all(workspaceUris.map(workspaceUri => {
                const path = workspaceUri.path;
                const uri = workspaceUri.with({ path: `${path !== '/' ? path : ''}/.git/config` });
                return this.fileService.exists(uri).then(exists => {
                    if (!exists) {
                        return [];
                    }
                    return this.textFileService.read(uri, { acceptTextOnly: true }).then(content => (0, configRemotes_1.getDomainsOfRemotes)(content.value, configRemotes_1.AllowedSecondLevelDomains), err => [] // ignore missing or binary file
                    );
                });
            })).then(domains => {
                const set = domains.reduce((set, list) => list.reduce((set, item) => set.add(item), set), new Set());
                const list = [];
                set.forEach(item => list.push(item));
                /* __GDPR__
                    "workspace.remotes" : {
                        "owner": "lramos15",
                        "domains" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                    }
                */
                this.telemetryService.publicLog('workspace.remotes', { domains: list.sort() });
            }, errors_1.onUnexpectedError);
        }
        reportRemotes(workspaceUris) {
            Promise.all(workspaceUris.map(workspaceUri => {
                return this.workspaceTagsService.getHashedRemotesFromUri(workspaceUri, true);
            })).then(() => { }, errors_1.onUnexpectedError);
        }
        /* __GDPR__FRAGMENT__
            "AzureTags" : {
                "node" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true }
            }
        */
        reportAzureNode(workspaceUris, tags) {
            // TODO: should also work for `node_modules` folders several levels down
            const uris = workspaceUris.map(workspaceUri => {
                const path = workspaceUri.path;
                return workspaceUri.with({ path: `${path !== '/' ? path : ''}/node_modules` });
            });
            return this.fileService.resolveAll(uris.map(resource => ({ resource }))).then(results => {
                const names = [].concat(...results.map(result => result.success ? (result.stat.children || []) : [])).map(c => c.name);
                const referencesAzure = WorkspaceTags_1.searchArray(names, /azure/i);
                if (referencesAzure) {
                    tags['node'] = true;
                }
                return tags;
            }, err => {
                return tags;
            });
        }
        static searchArray(arr, regEx) {
            return arr.some(v => v.search(regEx) > -1) || undefined;
        }
        /* __GDPR__FRAGMENT__
            "AzureTags" : {
                "java" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true }
            }
        */
        reportAzureJava(workspaceUris, tags) {
            return Promise.all(workspaceUris.map(workspaceUri => {
                const path = workspaceUri.path;
                const uri = workspaceUri.with({ path: `${path !== '/' ? path : ''}/pom.xml` });
                return this.fileService.exists(uri).then(exists => {
                    if (!exists) {
                        return false;
                    }
                    return this.textFileService.read(uri, { acceptTextOnly: true }).then(content => !!content.value.match(/azure/i), err => false);
                });
            })).then(javas => {
                if (javas.indexOf(true) !== -1) {
                    tags['java'] = true;
                }
                return tags;
            });
        }
        reportAzure(uris) {
            const tags = Object.create(null);
            this.reportAzureNode(uris, tags).then((tags) => {
                return this.reportAzureJava(uris, tags);
            }).then((tags) => {
                if (Object.keys(tags).length) {
                    /* __GDPR__
                        "workspace.azure" : {
                            "owner": "lramos15",
                            "${include}": [
                                "${AzureTags}"
                            ]
                        }
                    */
                    this.telemetryService.publicLog('workspace.azure', tags);
                }
            }).then(undefined, errors_1.onUnexpectedError);
        }
        reportCloudStats() {
            const uris = this.contextService.getWorkspace().folders.map(folder => folder.uri);
            if (uris.length && this.fileService) {
                this.reportRemoteDomains(uris);
                this.reportRemotes(uris);
                this.reportAzure(uris);
            }
        }
        reportProxyStats() {
            const downloadUrl = this.productService.downloadUrl;
            if (!downloadUrl) {
                return;
            }
            this.requestService.resolveProxy(downloadUrl)
                .then(proxy => {
                let type = proxy ? String(proxy).trim().split(/\s+/, 1)[0] : 'EMPTY';
                if (['DIRECT', 'PROXY', 'HTTPS', 'SOCKS', 'EMPTY'].indexOf(type) === -1) {
                    type = 'UNKNOWN';
                }
            }).then(undefined, errors_1.onUnexpectedError);
        }
    };
    exports.WorkspaceTags = WorkspaceTags;
    exports.WorkspaceTags = WorkspaceTags = WorkspaceTags_1 = __decorate([
        __param(0, files_1.IFileService),
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, telemetry_1.ITelemetryService),
        __param(3, request_1.IRequestService),
        __param(4, textfiles_1.ITextFileService),
        __param(5, workspaceTags_1.IWorkspaceTagsService),
        __param(6, diagnostics_1.IDiagnosticsService),
        __param(7, productService_1.IProductService),
        __param(8, native_1.INativeHostService)
    ], WorkspaceTags);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlVGFncy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3RhZ3MvZWxlY3Ryb24tc2FuZGJveC93b3Jrc3BhY2VUYWdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFrQnpGLEtBQUssVUFBVSwwQkFBMEIsQ0FBQyxJQUFZLEVBQUUsb0JBQTZCLEtBQUs7UUFDaEcsT0FBTyxJQUFBLDBDQUE4QixFQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUEsY0FBTyxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDM0YsQ0FBQztJQUZELGdFQUVDO0lBRU0sSUFBTSxhQUFhLHFCQUFuQixNQUFNLGFBQWE7UUFFekIsWUFDZ0MsV0FBeUIsRUFDYixjQUF3QyxFQUMvQyxnQkFBbUMsRUFDckMsY0FBK0IsRUFDOUIsZUFBaUMsRUFDNUIsb0JBQTJDLEVBQzdDLGtCQUF1QyxFQUMzQyxjQUErQixFQUM1QixpQkFBcUM7WUFSM0MsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDYixtQkFBYyxHQUFkLGNBQWMsQ0FBMEI7WUFDL0MscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUNyQyxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDOUIsb0JBQWUsR0FBZixlQUFlLENBQWtCO1lBQzVCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDN0MsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUMzQyxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDNUIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUUxRSxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLGlDQUF5QixFQUFFO2dCQUNsRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7YUFDZDtRQUNGLENBQUM7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