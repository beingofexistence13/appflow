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
define(["require", "exports", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/environment/common/environment", "vs/base/common/decorators", "vs/base/common/errors", "vs/base/common/extpath", "vs/platform/log/common/log", "vs/base/common/types", "vs/platform/instantiation/common/instantiation", "vs/platform/environment/common/environmentService"], function (require, exports, network_1, resources_1, uri_1, environment_1, decorators_1, errors_1, extpath_1, log_1, types_1, instantiation_1, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$MT = exports.$LT = void 0;
    exports.$LT = (0, instantiation_1.$Ch)(environment_1.$Ih);
    class $MT {
        get remoteAuthority() { return this.options.remoteAuthority; }
        get expectsResolverExtension() {
            return !!this.options.remoteAuthority?.includes('+') && !this.options.webSocketFactory;
        }
        get isBuilt() { return !!this.f.commit; }
        get logLevel() {
            const logLevelFromPayload = this.b?.get('logLevel');
            if (logLevelFromPayload) {
                return logLevelFromPayload.split(',').find(entry => !environmentService_1.$8l.test(entry));
            }
            return this.options.developmentOptions?.logLevel !== undefined ? (0, log_1.$hj)(this.options.developmentOptions?.logLevel) : undefined;
        }
        get extensionLogLevel() {
            const logLevelFromPayload = this.b?.get('logLevel');
            if (logLevelFromPayload) {
                const result = [];
                for (const entry of logLevelFromPayload.split(',')) {
                    const matches = environmentService_1.$8l.exec(entry);
                    if (matches && matches[1] && matches[2]) {
                        result.push([matches[1], matches[2]]);
                    }
                }
                return result.length ? result : undefined;
            }
            return this.options.developmentOptions?.extensionLogLevel !== undefined ? this.options.developmentOptions?.extensionLogLevel.map(([extension, logLevel]) => ([extension, (0, log_1.$hj)(logLevel)])) : undefined;
        }
        get profDurationMarkers() {
            const profDurationMarkersFromPayload = this.b?.get('profDurationMarkers');
            if (profDurationMarkersFromPayload) {
                const result = [];
                for (const entry of profDurationMarkersFromPayload.split(',')) {
                    result.push(entry);
                }
                return result.length === 2 ? result : undefined;
            }
            return undefined;
        }
        get windowLogsPath() { return this.logsHome; }
        get logFile() { return (0, resources_1.$ig)(this.windowLogsPath, 'window.log'); }
        get userRoamingDataHome() { return uri_1.URI.file('/User').with({ scheme: network_1.Schemas.vscodeUserData }); }
        get argvResource() { return (0, resources_1.$ig)(this.userRoamingDataHome, 'argv.json'); }
        get cacheHome() { return (0, resources_1.$ig)(this.userRoamingDataHome, 'caches'); }
        get workspaceStorageHome() { return (0, resources_1.$ig)(this.userRoamingDataHome, 'workspaceStorage'); }
        get localHistoryHome() { return (0, resources_1.$ig)(this.userRoamingDataHome, 'History'); }
        get stateResource() { return (0, resources_1.$ig)(this.userRoamingDataHome, 'State', 'storage.json'); }
        /**
         * In Web every workspace can potentially have scoped user-data
         * and/or extensions and if Sync state is shared then it can make
         * Sync error prone - say removing extensions from another workspace.
         * Hence scope Sync state per workspace. Sync scoped to a workspace
         * is capable of handling opening same workspace in multiple windows.
         */
        get userDataSyncHome() { return (0, resources_1.$ig)(this.userRoamingDataHome, 'sync', this.d); }
        get sync() { return undefined; }
        get keyboardLayoutResource() { return (0, resources_1.$ig)(this.userRoamingDataHome, 'keyboardLayout.json'); }
        get untitledWorkspacesHome() { return (0, resources_1.$ig)(this.userRoamingDataHome, 'Workspaces'); }
        get serviceMachineIdResource() { return (0, resources_1.$ig)(this.userRoamingDataHome, 'machineid'); }
        get extHostLogsPath() { return (0, resources_1.$ig)(this.logsHome, 'exthost'); }
        get extHostTelemetryLogFile() {
            return (0, resources_1.$ig)(this.extHostLogsPath, 'extensionTelemetry.log');
        }
        get debugExtensionHost() {
            if (!this.a) {
                this.a = this.g();
            }
            return this.a.params;
        }
        get isExtensionDevelopment() {
            if (!this.a) {
                this.a = this.g();
            }
            return this.a.isExtensionDevelopment;
        }
        get extensionDevelopmentLocationURI() {
            if (!this.a) {
                this.a = this.g();
            }
            return this.a.extensionDevelopmentLocationURI;
        }
        get extensionDevelopmentLocationKind() {
            if (!this.a) {
                this.a = this.g();
            }
            return this.a.extensionDevelopmentKind;
        }
        get extensionTestsLocationURI() {
            if (!this.a) {
                this.a = this.g();
            }
            return this.a.extensionTestsLocationURI;
        }
        get extensionEnabledProposedApi() {
            if (!this.a) {
                this.a = this.g();
            }
            return this.a.extensionEnabledProposedApi;
        }
        get debugRenderer() {
            if (!this.a) {
                this.a = this.g();
            }
            return this.a.debugRenderer;
        }
        get enableSmokeTestDriver() { return this.options.developmentOptions?.enableSmokeTestDriver; }
        get disableExtensions() { return this.b?.get('disableExtensions') === 'true'; }
        get enableExtensions() { return this.options.enabledExtensions; }
        get webviewExternalEndpoint() {
            const endpoint = this.options.webviewEndpoint
                || this.f.webviewContentExternalBaseUrlTemplate
                || 'https://{{uuid}}.vscode-cdn.net/{{quality}}/{{commit}}/out/vs/workbench/contrib/webview/browser/pre/';
            const webviewExternalEndpointCommit = this.b?.get('webviewExternalEndpointCommit');
            return endpoint
                .replace('{{commit}}', webviewExternalEndpointCommit ?? this.f.commit ?? 'ef65ac1ba57f57f2a3961bfe94aa20481caca4c6')
                .replace('{{quality}}', (webviewExternalEndpointCommit ? 'insider' : this.f.quality) ?? 'insider');
        }
        get extensionTelemetryLogResource() { return (0, resources_1.$ig)(this.logsHome, 'extensionTelemetry.log'); }
        get disableTelemetry() { return false; }
        get verbose() { return this.b?.get('verbose') === 'true'; }
        get logExtensionHostCommunication() { return this.b?.get('logExtensionHostCommunication') === 'true'; }
        get skipReleaseNotes() { return this.b?.get('skipReleaseNotes') === 'true'; }
        get skipWelcome() { return this.b?.get('skipWelcome') === 'true'; }
        get disableWorkspaceTrust() { return !this.options.enableWorkspaceTrust; }
        get lastActiveProfile() { return this.b?.get('lastActiveProfile'); }
        constructor(d, logsHome, options, f) {
            this.d = d;
            this.logsHome = logsHome;
            this.options = options;
            this.f = f;
            this.a = undefined;
            this.editSessionId = this.options.editSessionId;
            if (options.workspaceProvider && Array.isArray(options.workspaceProvider.payload)) {
                try {
                    this.b = new Map(options.workspaceProvider.payload);
                }
                catch (error) {
                    (0, errors_1.$Y)(error); // possible invalid payload for map
                }
            }
        }
        g() {
            const extensionHostDebugEnvironment = {
                params: {
                    port: null,
                    break: false
                },
                debugRenderer: false,
                isExtensionDevelopment: false,
                extensionDevelopmentLocationURI: undefined,
                extensionDevelopmentKind: undefined
            };
            // Fill in selected extra environmental properties
            if (this.b) {
                for (const [key, value] of this.b) {
                    switch (key) {
                        case 'extensionDevelopmentPath':
                            if (!extensionHostDebugEnvironment.extensionDevelopmentLocationURI) {
                                extensionHostDebugEnvironment.extensionDevelopmentLocationURI = [];
                            }
                            extensionHostDebugEnvironment.extensionDevelopmentLocationURI.push(uri_1.URI.parse(value));
                            extensionHostDebugEnvironment.isExtensionDevelopment = true;
                            break;
                        case 'extensionDevelopmentKind':
                            extensionHostDebugEnvironment.extensionDevelopmentKind = [value];
                            break;
                        case 'extensionTestsPath':
                            extensionHostDebugEnvironment.extensionTestsLocationURI = uri_1.URI.parse(value);
                            break;
                        case 'debugRenderer':
                            extensionHostDebugEnvironment.debugRenderer = value === 'true';
                            break;
                        case 'debugId':
                            extensionHostDebugEnvironment.params.debugId = value;
                            break;
                        case 'inspect-brk-extensions':
                            extensionHostDebugEnvironment.params.port = parseInt(value);
                            extensionHostDebugEnvironment.params.break = true;
                            break;
                        case 'inspect-extensions':
                            extensionHostDebugEnvironment.params.port = parseInt(value);
                            break;
                        case 'enableProposedApi':
                            extensionHostDebugEnvironment.extensionEnabledProposedApi = [];
                            break;
                    }
                }
            }
            const developmentOptions = this.options.developmentOptions;
            if (developmentOptions && !extensionHostDebugEnvironment.isExtensionDevelopment) {
                if (developmentOptions.extensions?.length) {
                    extensionHostDebugEnvironment.extensionDevelopmentLocationURI = developmentOptions.extensions.map(e => uri_1.URI.revive(e));
                    extensionHostDebugEnvironment.isExtensionDevelopment = true;
                }
                if (developmentOptions.extensionTestsPath) {
                    extensionHostDebugEnvironment.extensionTestsLocationURI = uri_1.URI.revive(developmentOptions.extensionTestsPath);
                }
            }
            return extensionHostDebugEnvironment;
        }
        get filesToOpenOrCreate() {
            if (this.b) {
                const fileToOpen = this.b.get('openFile');
                if (fileToOpen) {
                    const fileUri = uri_1.URI.parse(fileToOpen);
                    // Support: --goto parameter to open on line/col
                    if (this.b.has('gotoLineMode')) {
                        const pathColumnAware = (0, extpath_1.$Pf)(fileUri.path);
                        return [{
                                fileUri: fileUri.with({ path: pathColumnAware.path }),
                                options: {
                                    selection: !(0, types_1.$qf)(pathColumnAware.line) ? { startLineNumber: pathColumnAware.line, startColumn: pathColumnAware.column || 1 } : undefined
                                }
                            }];
                    }
                    return [{ fileUri }];
                }
            }
            return undefined;
        }
        get filesToDiff() {
            if (this.b) {
                const fileToDiffPrimary = this.b.get('diffFilePrimary');
                const fileToDiffSecondary = this.b.get('diffFileSecondary');
                if (fileToDiffPrimary && fileToDiffSecondary) {
                    return [
                        { fileUri: uri_1.URI.parse(fileToDiffSecondary) },
                        { fileUri: uri_1.URI.parse(fileToDiffPrimary) }
                    ];
                }
            }
            return undefined;
        }
        get filesToMerge() {
            if (this.b) {
                const fileToMerge1 = this.b.get('mergeFile1');
                const fileToMerge2 = this.b.get('mergeFile2');
                const fileToMergeBase = this.b.get('mergeFileBase');
                const fileToMergeResult = this.b.get('mergeFileResult');
                if (fileToMerge1 && fileToMerge2 && fileToMergeBase && fileToMergeResult) {
                    return [
                        { fileUri: uri_1.URI.parse(fileToMerge1) },
                        { fileUri: uri_1.URI.parse(fileToMerge2) },
                        { fileUri: uri_1.URI.parse(fileToMergeBase) },
                        { fileUri: uri_1.URI.parse(fileToMergeResult) }
                    ];
                }
            }
            return undefined;
        }
    }
    exports.$MT = $MT;
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "remoteAuthority", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "expectsResolverExtension", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "isBuilt", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "logLevel", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "windowLogsPath", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "logFile", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "userRoamingDataHome", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "argvResource", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "cacheHome", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "workspaceStorageHome", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "localHistoryHome", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "stateResource", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "userDataSyncHome", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "sync", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "keyboardLayoutResource", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "untitledWorkspacesHome", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "serviceMachineIdResource", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "extHostLogsPath", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "extHostTelemetryLogFile", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "debugExtensionHost", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "isExtensionDevelopment", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "extensionDevelopmentLocationURI", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "extensionDevelopmentLocationKind", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "extensionTestsLocationURI", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "extensionEnabledProposedApi", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "debugRenderer", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "enableSmokeTestDriver", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "disableExtensions", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "enableExtensions", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "webviewExternalEndpoint", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "extensionTelemetryLogResource", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "disableTelemetry", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "verbose", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "logExtensionHostCommunication", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "skipReleaseNotes", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "skipWelcome", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "disableWorkspaceTrust", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "lastActiveProfile", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "filesToOpenOrCreate", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "filesToDiff", null);
    __decorate([
        decorators_1.$6g
    ], $MT.prototype, "filesToMerge", null);
});
//# sourceMappingURL=environmentService.js.map