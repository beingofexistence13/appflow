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
    exports.BrowserWorkbenchEnvironmentService = exports.IBrowserWorkbenchEnvironmentService = void 0;
    exports.IBrowserWorkbenchEnvironmentService = (0, instantiation_1.refineServiceDecorator)(environment_1.IEnvironmentService);
    class BrowserWorkbenchEnvironmentService {
        get remoteAuthority() { return this.options.remoteAuthority; }
        get expectsResolverExtension() {
            return !!this.options.remoteAuthority?.includes('+') && !this.options.webSocketFactory;
        }
        get isBuilt() { return !!this.productService.commit; }
        get logLevel() {
            const logLevelFromPayload = this.payload?.get('logLevel');
            if (logLevelFromPayload) {
                return logLevelFromPayload.split(',').find(entry => !environmentService_1.EXTENSION_IDENTIFIER_WITH_LOG_REGEX.test(entry));
            }
            return this.options.developmentOptions?.logLevel !== undefined ? (0, log_1.LogLevelToString)(this.options.developmentOptions?.logLevel) : undefined;
        }
        get extensionLogLevel() {
            const logLevelFromPayload = this.payload?.get('logLevel');
            if (logLevelFromPayload) {
                const result = [];
                for (const entry of logLevelFromPayload.split(',')) {
                    const matches = environmentService_1.EXTENSION_IDENTIFIER_WITH_LOG_REGEX.exec(entry);
                    if (matches && matches[1] && matches[2]) {
                        result.push([matches[1], matches[2]]);
                    }
                }
                return result.length ? result : undefined;
            }
            return this.options.developmentOptions?.extensionLogLevel !== undefined ? this.options.developmentOptions?.extensionLogLevel.map(([extension, logLevel]) => ([extension, (0, log_1.LogLevelToString)(logLevel)])) : undefined;
        }
        get profDurationMarkers() {
            const profDurationMarkersFromPayload = this.payload?.get('profDurationMarkers');
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
        get logFile() { return (0, resources_1.joinPath)(this.windowLogsPath, 'window.log'); }
        get userRoamingDataHome() { return uri_1.URI.file('/User').with({ scheme: network_1.Schemas.vscodeUserData }); }
        get argvResource() { return (0, resources_1.joinPath)(this.userRoamingDataHome, 'argv.json'); }
        get cacheHome() { return (0, resources_1.joinPath)(this.userRoamingDataHome, 'caches'); }
        get workspaceStorageHome() { return (0, resources_1.joinPath)(this.userRoamingDataHome, 'workspaceStorage'); }
        get localHistoryHome() { return (0, resources_1.joinPath)(this.userRoamingDataHome, 'History'); }
        get stateResource() { return (0, resources_1.joinPath)(this.userRoamingDataHome, 'State', 'storage.json'); }
        /**
         * In Web every workspace can potentially have scoped user-data
         * and/or extensions and if Sync state is shared then it can make
         * Sync error prone - say removing extensions from another workspace.
         * Hence scope Sync state per workspace. Sync scoped to a workspace
         * is capable of handling opening same workspace in multiple windows.
         */
        get userDataSyncHome() { return (0, resources_1.joinPath)(this.userRoamingDataHome, 'sync', this.workspaceId); }
        get sync() { return undefined; }
        get keyboardLayoutResource() { return (0, resources_1.joinPath)(this.userRoamingDataHome, 'keyboardLayout.json'); }
        get untitledWorkspacesHome() { return (0, resources_1.joinPath)(this.userRoamingDataHome, 'Workspaces'); }
        get serviceMachineIdResource() { return (0, resources_1.joinPath)(this.userRoamingDataHome, 'machineid'); }
        get extHostLogsPath() { return (0, resources_1.joinPath)(this.logsHome, 'exthost'); }
        get extHostTelemetryLogFile() {
            return (0, resources_1.joinPath)(this.extHostLogsPath, 'extensionTelemetry.log');
        }
        get debugExtensionHost() {
            if (!this.extensionHostDebugEnvironment) {
                this.extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
            }
            return this.extensionHostDebugEnvironment.params;
        }
        get isExtensionDevelopment() {
            if (!this.extensionHostDebugEnvironment) {
                this.extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
            }
            return this.extensionHostDebugEnvironment.isExtensionDevelopment;
        }
        get extensionDevelopmentLocationURI() {
            if (!this.extensionHostDebugEnvironment) {
                this.extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
            }
            return this.extensionHostDebugEnvironment.extensionDevelopmentLocationURI;
        }
        get extensionDevelopmentLocationKind() {
            if (!this.extensionHostDebugEnvironment) {
                this.extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
            }
            return this.extensionHostDebugEnvironment.extensionDevelopmentKind;
        }
        get extensionTestsLocationURI() {
            if (!this.extensionHostDebugEnvironment) {
                this.extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
            }
            return this.extensionHostDebugEnvironment.extensionTestsLocationURI;
        }
        get extensionEnabledProposedApi() {
            if (!this.extensionHostDebugEnvironment) {
                this.extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
            }
            return this.extensionHostDebugEnvironment.extensionEnabledProposedApi;
        }
        get debugRenderer() {
            if (!this.extensionHostDebugEnvironment) {
                this.extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
            }
            return this.extensionHostDebugEnvironment.debugRenderer;
        }
        get enableSmokeTestDriver() { return this.options.developmentOptions?.enableSmokeTestDriver; }
        get disableExtensions() { return this.payload?.get('disableExtensions') === 'true'; }
        get enableExtensions() { return this.options.enabledExtensions; }
        get webviewExternalEndpoint() {
            const endpoint = this.options.webviewEndpoint
                || this.productService.webviewContentExternalBaseUrlTemplate
                || 'https://{{uuid}}.vscode-cdn.net/{{quality}}/{{commit}}/out/vs/workbench/contrib/webview/browser/pre/';
            const webviewExternalEndpointCommit = this.payload?.get('webviewExternalEndpointCommit');
            return endpoint
                .replace('{{commit}}', webviewExternalEndpointCommit ?? this.productService.commit ?? 'ef65ac1ba57f57f2a3961bfe94aa20481caca4c6')
                .replace('{{quality}}', (webviewExternalEndpointCommit ? 'insider' : this.productService.quality) ?? 'insider');
        }
        get extensionTelemetryLogResource() { return (0, resources_1.joinPath)(this.logsHome, 'extensionTelemetry.log'); }
        get disableTelemetry() { return false; }
        get verbose() { return this.payload?.get('verbose') === 'true'; }
        get logExtensionHostCommunication() { return this.payload?.get('logExtensionHostCommunication') === 'true'; }
        get skipReleaseNotes() { return this.payload?.get('skipReleaseNotes') === 'true'; }
        get skipWelcome() { return this.payload?.get('skipWelcome') === 'true'; }
        get disableWorkspaceTrust() { return !this.options.enableWorkspaceTrust; }
        get lastActiveProfile() { return this.payload?.get('lastActiveProfile'); }
        constructor(workspaceId, logsHome, options, productService) {
            this.workspaceId = workspaceId;
            this.logsHome = logsHome;
            this.options = options;
            this.productService = productService;
            this.extensionHostDebugEnvironment = undefined;
            this.editSessionId = this.options.editSessionId;
            if (options.workspaceProvider && Array.isArray(options.workspaceProvider.payload)) {
                try {
                    this.payload = new Map(options.workspaceProvider.payload);
                }
                catch (error) {
                    (0, errors_1.onUnexpectedError)(error); // possible invalid payload for map
                }
            }
        }
        resolveExtensionHostDebugEnvironment() {
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
            if (this.payload) {
                for (const [key, value] of this.payload) {
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
            if (this.payload) {
                const fileToOpen = this.payload.get('openFile');
                if (fileToOpen) {
                    const fileUri = uri_1.URI.parse(fileToOpen);
                    // Support: --goto parameter to open on line/col
                    if (this.payload.has('gotoLineMode')) {
                        const pathColumnAware = (0, extpath_1.parseLineAndColumnAware)(fileUri.path);
                        return [{
                                fileUri: fileUri.with({ path: pathColumnAware.path }),
                                options: {
                                    selection: !(0, types_1.isUndefined)(pathColumnAware.line) ? { startLineNumber: pathColumnAware.line, startColumn: pathColumnAware.column || 1 } : undefined
                                }
                            }];
                    }
                    return [{ fileUri }];
                }
            }
            return undefined;
        }
        get filesToDiff() {
            if (this.payload) {
                const fileToDiffPrimary = this.payload.get('diffFilePrimary');
                const fileToDiffSecondary = this.payload.get('diffFileSecondary');
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
            if (this.payload) {
                const fileToMerge1 = this.payload.get('mergeFile1');
                const fileToMerge2 = this.payload.get('mergeFile2');
                const fileToMergeBase = this.payload.get('mergeFileBase');
                const fileToMergeResult = this.payload.get('mergeFileResult');
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
    exports.BrowserWorkbenchEnvironmentService = BrowserWorkbenchEnvironmentService;
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "remoteAuthority", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "expectsResolverExtension", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "isBuilt", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "logLevel", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "windowLogsPath", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "logFile", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "userRoamingDataHome", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "argvResource", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "cacheHome", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "workspaceStorageHome", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "localHistoryHome", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "stateResource", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "userDataSyncHome", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "sync", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "keyboardLayoutResource", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "untitledWorkspacesHome", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "serviceMachineIdResource", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "extHostLogsPath", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "extHostTelemetryLogFile", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "debugExtensionHost", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "isExtensionDevelopment", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "extensionDevelopmentLocationURI", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "extensionDevelopmentLocationKind", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "extensionTestsLocationURI", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "extensionEnabledProposedApi", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "debugRenderer", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "enableSmokeTestDriver", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "disableExtensions", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "enableExtensions", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "webviewExternalEndpoint", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "extensionTelemetryLogResource", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "disableTelemetry", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "verbose", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "logExtensionHostCommunication", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "skipReleaseNotes", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "skipWelcome", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "disableWorkspaceTrust", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "lastActiveProfile", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "filesToOpenOrCreate", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "filesToDiff", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "filesToMerge", null);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52aXJvbm1lbnRTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2Vudmlyb25tZW50L2Jyb3dzZXIvZW52aXJvbm1lbnRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7OztJQW1CbkYsUUFBQSxtQ0FBbUMsR0FBRyxJQUFBLHNDQUFzQixFQUEyRCxpQ0FBbUIsQ0FBQyxDQUFDO0lBbUJ6SixNQUFhLGtDQUFrQztRQUs5QyxJQUFJLGVBQWUsS0FBeUIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7UUFHbEYsSUFBSSx3QkFBd0I7WUFDM0IsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztRQUN4RixDQUFDO1FBR0QsSUFBSSxPQUFPLEtBQWMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBRy9ELElBQUksUUFBUTtZQUNYLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDMUQsSUFBSSxtQkFBbUIsRUFBRTtnQkFDeEIsT0FBTyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyx3REFBbUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUN0RztZQUVELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxRQUFRLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFBLHNCQUFnQixF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