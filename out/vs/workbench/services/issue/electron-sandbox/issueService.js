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
define(["require", "exports", "vs/platform/issue/common/issue", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/workbench/common/theme", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/base/browser/browser", "vs/workbench/services/issue/common/issue", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/base/common/process", "vs/platform/product/common/productService", "vs/workbench/services/assignment/common/assignmentService", "vs/workbench/services/authentication/common/authentication", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/integrity/common/integrity", "vs/base/parts/sandbox/electron-sandbox/globals", "vs/base/common/cancellation", "vs/platform/instantiation/common/extensions"], function (require, exports, issue_1, themeService_1, colorRegistry_1, theme_1, extensionManagement_1, extensionManagement_2, browser_1, issue_2, environmentService_1, process_1, productService_1, assignmentService_1, authentication_1, workspaceTrust_1, integrity_1, globals_1, cancellation_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getIssueReporterStyles = exports.NativeIssueService = void 0;
    let NativeIssueService = class NativeIssueService {
        constructor(issueMainService, themeService, extensionManagementService, extensionEnablementService, environmentService, workspaceTrustManagementService, productService, experimentService, authenticationService, integrityService) {
            this.issueMainService = issueMainService;
            this.themeService = themeService;
            this.extensionManagementService = extensionManagementService;
            this.extensionEnablementService = extensionEnablementService;
            this.environmentService = environmentService;
            this.workspaceTrustManagementService = workspaceTrustManagementService;
            this.productService = productService;
            this.experimentService = experimentService;
            this.authenticationService = authenticationService;
            this.integrityService = integrityService;
            this._handlers = new Map();
            globals_1.ipcRenderer.on('vscode:triggerIssueUriRequestHandler', async (event, request) => {
                const result = await this.getIssueReporterUri(request.extensionId, cancellation_1.CancellationToken.None);
                globals_1.ipcRenderer.send(request.replyChannel, result.toString());
            });
        }
        async openReporter(dataOverrides = {}) {
            const extensionData = [];
            try {
                const extensions = await this.extensionManagementService.getInstalled();
                const enabledExtensions = extensions.filter(extension => this.extensionEnablementService.isEnabled(extension) || (dataOverrides.extensionId && extension.identifier.id === dataOverrides.extensionId));
                extensionData.push(...enabledExtensions.map((extension) => {
                    const { manifest } = extension;
                    const manifestKeys = manifest.contributes ? Object.keys(manifest.contributes) : [];
                    const isTheme = !manifest.main && !manifest.browser && manifestKeys.length === 1 && manifestKeys[0] === 'themes';
                    const isBuiltin = extension.type === 0 /* ExtensionType.System */;
                    return {
                        name: manifest.name,
                        publisher: manifest.publisher,
                        version: manifest.version,
                        repositoryUrl: manifest.repository && manifest.repository.url,
                        bugsUrl: manifest.bugs && manifest.bugs.url,
                        hasIssueUriRequestHandler: this._handlers.has(extension.identifier.id.toLowerCase()),
                        displayName: manifest.displayName,
                        id: extension.identifier.id,
                        isTheme,
                        isBuiltin,
                    };
                }));
            }
            catch (e) {
                extensionData.push({
                    name: 'Workbench Issue Service',
                    publisher: 'Unknown',
                    version: '0.0.0',
                    repositoryUrl: undefined,
                    bugsUrl: undefined,
                    displayName: `Extensions not loaded: ${e}`,
                    id: 'workbench.issue',
                    isTheme: false,
                    isBuiltin: true
                });
            }
            const experiments = await this.experimentService.getCurrentExperiments();
            let githubAccessToken = '';
            try {
                const githubSessions = await this.authenticationService.getSessions('github');
                const potentialSessions = githubSessions.filter(session => session.scopes.includes('repo'));
                githubAccessToken = potentialSessions[0]?.accessToken;
            }
            catch (e) {
                // Ignore
            }
            // air on the side of caution and have false be the default
            let isUnsupported = false;
            try {
                isUnsupported = !(await this.integrityService.isPure()).isPure;
            }
            catch (e) {
                // Ignore
            }
            const theme = this.themeService.getColorTheme();
            const issueReporterData = Object.assign({
                styles: getIssueReporterStyles(theme),
                zoomLevel: (0, browser_1.getZoomLevel)(),
                enabledExtensions: extensionData,
                experiments: experiments?.join('\n'),
                restrictedMode: !this.workspaceTrustManagementService.isWorkspaceTrusted(),
                isUnsupported,
                githubAccessToken
            }, dataOverrides);
            return this.issueMainService.openReporter(issueReporterData);
        }
        openProcessExplorer() {
            const theme = this.themeService.getColorTheme();
            const data = {
                pid: this.environmentService.mainPid,
                zoomLevel: (0, browser_1.getZoomLevel)(),
                styles: {
                    backgroundColor: getColor(theme, colorRegistry_1.editorBackground),
                    color: getColor(theme, colorRegistry_1.editorForeground),
                    listHoverBackground: getColor(theme, colorRegistry_1.listHoverBackground),
                    listHoverForeground: getColor(theme, colorRegistry_1.listHoverForeground),
                    listFocusBackground: getColor(theme, colorRegistry_1.listFocusBackground),
                    listFocusForeground: getColor(theme, colorRegistry_1.listFocusForeground),
                    listFocusOutline: getColor(theme, colorRegistry_1.listFocusOutline),
                    listActiveSelectionBackground: getColor(theme, colorRegistry_1.listActiveSelectionBackground),
                    listActiveSelectionForeground: getColor(theme, colorRegistry_1.listActiveSelectionForeground),
                    listHoverOutline: getColor(theme, colorRegistry_1.activeContrastBorder),
                    scrollbarShadowColor: getColor(theme, colorRegistry_1.scrollbarShadow),
                    scrollbarSliderActiveBackgroundColor: getColor(theme, colorRegistry_1.scrollbarSliderActiveBackground),
                    scrollbarSliderBackgroundColor: getColor(theme, colorRegistry_1.scrollbarSliderBackground),
                    scrollbarSliderHoverBackgroundColor: getColor(theme, colorRegistry_1.scrollbarSliderHoverBackground),
                },
                platform: process_1.platform,
                applicationName: this.productService.applicationName
            };
            return this.issueMainService.openProcessExplorer(data);
        }
        registerIssueUriRequestHandler(extensionId, handler) {
            this._handlers.set(extensionId.toLowerCase(), handler);
            return {
                dispose: () => this._handlers.delete(extensionId)
            };
        }
        async getIssueReporterUri(extensionId, token) {
            const handler = this._handlers.get(extensionId);
            if (!handler) {
                throw new Error(`No issue uri request handler registered for extension '${extensionId}'`);
            }
            return handler.provideIssueUrl(token);
        }
    };
    exports.NativeIssueService = NativeIssueService;
    exports.NativeIssueService = NativeIssueService = __decorate([
        __param(0, issue_1.IIssueMainService),
        __param(1, themeService_1.IThemeService),
        __param(2, extensionManagement_1.IExtensionManagementService),
        __param(3, extensionManagement_2.IWorkbenchExtensionEnablementService),
        __param(4, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(5, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(6, productService_1.IProductService),
        __param(7, assignmentService_1.IWorkbenchAssignmentService),
        __param(8, authentication_1.IAuthenticationService),
        __param(9, integrity_1.IIntegrityService)
    ], NativeIssueService);
    function getIssueReporterStyles(theme) {
        return {
            backgroundColor: getColor(theme, theme_1.SIDE_BAR_BACKGROUND),
            color: getColor(theme, colorRegistry_1.foreground),
            textLinkColor: getColor(theme, colorRegistry_1.textLinkForeground),
            textLinkActiveForeground: getColor(theme, colorRegistry_1.textLinkActiveForeground),
            inputBackground: getColor(theme, colorRegistry_1.inputBackground),
            inputForeground: getColor(theme, colorRegistry_1.inputForeground),
            inputBorder: getColor(theme, colorRegistry_1.inputBorder),
            inputActiveBorder: getColor(theme, colorRegistry_1.inputActiveOptionBorder),
            inputErrorBorder: getColor(theme, colorRegistry_1.inputValidationErrorBorder),
            inputErrorBackground: getColor(theme, colorRegistry_1.inputValidationErrorBackground),
            inputErrorForeground: getColor(theme, colorRegistry_1.inputValidationErrorForeground),
            buttonBackground: getColor(theme, colorRegistry_1.buttonBackground),
            buttonForeground: getColor(theme, colorRegistry_1.buttonForeground),
            buttonHoverBackground: getColor(theme, colorRegistry_1.buttonHoverBackground),
            sliderActiveColor: getColor(theme, colorRegistry_1.scrollbarSliderActiveBackground),
            sliderBackgroundColor: getColor(theme, colorRegistry_1.scrollbarSliderBackground),
            sliderHoverColor: getColor(theme, colorRegistry_1.scrollbarSliderHoverBackground),
        };
    }
    exports.getIssueReporterStyles = getIssueReporterStyles;
    function getColor(theme, key) {
        const color = theme.getColor(key);
        return color ? color.toString() : undefined;
    }
    (0, extensions_1.registerSingleton)(issue_2.IWorkbenchIssueService, NativeIssueService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNzdWVTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2lzc3VlL2VsZWN0cm9uLXNhbmRib3gvaXNzdWVTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXdCekYsSUFBTSxrQkFBa0IsR0FBeEIsTUFBTSxrQkFBa0I7UUFLOUIsWUFDb0IsZ0JBQW9ELEVBQ3hELFlBQTRDLEVBQzlCLDBCQUF3RSxFQUMvRCwwQkFBaUYsRUFDbkYsa0JBQXVFLEVBQ3pFLCtCQUFrRixFQUNuRyxjQUFnRCxFQUNwQyxpQkFBK0QsRUFDcEUscUJBQThELEVBQ25FLGdCQUFvRDtZQVRuQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQ3ZDLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ2IsK0JBQTBCLEdBQTFCLDBCQUEwQixDQUE2QjtZQUM5QywrQkFBMEIsR0FBMUIsMEJBQTBCLENBQXNDO1lBQ2xFLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0M7WUFDeEQsb0NBQStCLEdBQS9CLCtCQUErQixDQUFrQztZQUNsRixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDbkIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUE2QjtZQUNuRCwwQkFBcUIsR0FBckIscUJBQXFCLENBQXdCO1lBQ2xELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFadkQsY0FBUyxHQUFHLElBQUksR0FBRyxFQUFtQyxDQUFDO1lBY3ZFLHFCQUFXLENBQUMsRUFBRSxDQUFDLHNDQUFzQyxFQUFFLEtBQUssRUFBRSxLQUFjLEVBQUUsT0FBc0QsRUFBRSxFQUFFO2dCQUN2SSxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLGdDQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO2dC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