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
define(["require", "exports", "vs/base/common/actions", "vs/base/common/cancellation", "vs/base/common/network", "vs/base/common/severity", "vs/base/common/uri", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/notification/common/notification", "vs/platform/remote/common/remoteAuthorityResolver", "vs/workbench/api/common/extHost.protocol", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/services/host/browser/host", "vs/workbench/services/timer/browser/timerService"], function (require, exports, actions_1, cancellation_1, network_1, severity_1, uri_1, nls_1, commands_1, extensionManagementUtil_1, notification_1, remoteAuthorityResolver_1, extHost_protocol_1, extensions_1, environmentService_1, extensionManagement_1, extensions_2, extHostCustomers_1, host_1, timerService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadExtensionService = void 0;
    let MainThreadExtensionService = class MainThreadExtensionService {
        constructor(extHostContext, _extensionService, _notificationService, _extensionsWorkbenchService, _hostService, _extensionEnablementService, _timerService, _commandService, _environmentService) {
            this._extensionService = _extensionService;
            this._notificationService = _notificationService;
            this._extensionsWorkbenchService = _extensionsWorkbenchService;
            this._hostService = _hostService;
            this._extensionEnablementService = _extensionEnablementService;
            this._timerService = _timerService;
            this._commandService = _commandService;
            this._environmentService = _environmentService;
            this._extensionHostKind = extHostContext.extensionHostKind;
            const internalExtHostContext = extHostContext;
            this._internalExtensionService = internalExtHostContext.internalExtensionService;
            internalExtHostContext._setExtensionHostProxy(new ExtensionHostProxy(extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostExtensionService)));
            internalExtHostContext._setAllMainProxyIdentifiers(Object.keys(extHost_protocol_1.MainContext).map((key) => extHost_protocol_1.MainContext[key]));
        }
        dispose() {
        }
        $getExtension(extensionId) {
            return this._extensionService.getExtension(extensionId);
        }
        $activateExtension(extensionId, reason) {
            return this._internalExtensionService._activateById(extensionId, reason);
        }
        async $onWillActivateExtension(extensionId) {
            this._internalExtensionService._onWillActivateExtension(extensionId);
        }
        $onDidActivateExtension(extensionId, codeLoadingTime, activateCallTime, activateResolvedTime, activationReason) {
            this._internalExtensionService._onDidActivateExtension(extensionId, codeLoadingTime, activateCallTime, activateResolvedTime, activationReason);
        }
        $onExtensionRuntimeError(extensionId, data) {
            const error = new Error();
            error.name = data.name;
            error.message = data.message;
            error.stack = data.stack;
            this._internalExtensionService._onExtensionRuntimeError(extensionId, error);
            console.error(`[${extensionId.value}]${error.message}`);
            console.error(error.stack);
        }
        async $onExtensionActivationError(extensionId, data, missingExtensionDependency) {
            const error = new Error();
            error.name = data.name;
            error.message = data.message;
            error.stack = data.stack;
            this._internalExtensionService._onDidActivateExtensionError(extensionId, error);
            if (missingExtensionDependency) {
                const extension = await this._extensionService.getExtension(extensionId.value);
                if (extension) {
                    const local = await this._extensionsWorkbenchService.queryLocal();
                    const installedDependency = local.find(i => (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, { id: missingExtensionDependency.dependency }));
                    if (installedDependency?.local) {
                        await this._handleMissingInstalledDependency(extension, installedDependency.local);
                        return;
                    }
                    else {
                        await this._handleMissingNotInstalledDependency(extension, missingExtensionDependency.dependency);
                        return;
                    }
                }
            }
            const isDev = !this._environmentService.isBuilt || this._environmentService.isExtensionDevelopment;
            if (isDev) {
                this._notificationService.error(error);
                return;
            }
            console.error(error.message);
        }
        async _handleMissingInstalledDependency(extension, missingInstalledDependency) {
            const extName = extension.displayName || extension.name;
            if (this._extensionEnablementService.isEnabled(missingInstalledDependency)) {
                this._notificationService.notify({
                    severity: severity_1.default.Error,
                    message: (0, nls_1.localize)('reload window', "Cannot activate the '{0}' extension because it depends on the '{1}' extension, which is not loaded. Would you like to reload the window to load the extension?", extName, missingInstalledDependency.manifest.displayName || missingInstalledDependency.manifest.name),
                    actions: {
                        primary: [new actions_1.Action('reload', (0, nls_1.localize)('reload', "Reload Window"), '', true, () => this._hostService.reload())]
                    }
                });
            }
            else {
                const enablementState = this._extensionEnablementService.getEnablementState(missingInstalledDependency);
                if (enablementState === 4 /* EnablementState.DisabledByVirtualWorkspace */) {
                    this._notificationService.notify({
                        severity: severity_1.default.Error,
                        message: (0, nls_1.localize)('notSupportedInWorkspace', "Cannot activate the '{0}' extension because it depends on the '{1}' extension which is not supported in the current workspace", extName, missingInstalledDependency.manifest.displayName || missingInstalledDependency.manifest.name),
                    });
                }
                else if (enablementState === 0 /* EnablementState.DisabledByTrustRequirement */) {
                    this._notificationService.notify({
                        severity: severity_1.default.Error,
                        message: (0, nls_1.localize)('restrictedMode', "Cannot activate the '{0}' extension because it depends on the '{1}' extension which is not supported in Restricted Mode", extName, missingInstalledDependency.manifest.displayName || missingInstalledDependency.manifest.name),
                        actions: {
                            primary: [new actions_1.Action('manageWorkspaceTrust', (0, nls_1.localize)('manageWorkspaceTrust', "Manage Workspace Trust"), '', true, () => this._commandService.executeCommand('workbench.trust.manage'))]
                        }
                    });
                }
                else if (this._extensionEnablementService.canChangeEnablement(missingInstalledDependency)) {
                    this._notificationService.notify({
                        severity: severity_1.default.Error,
                        message: (0, nls_1.localize)('disabledDep', "Cannot activate the '{0}' extension because it depends on the '{1}' extension which is disabled. Would you like to enable the extension and reload the window?", extName, missingInstalledDependency.manifest.displayName || missingInstalledDependency.manifest.name),
                        actions: {
                            primary: [new actions_1.Action('enable', (0, nls_1.localize)('enable dep', "Enable and Reload"), '', true, () => this._extensionEnablementService.setEnablement([missingInstalledDependency], enablementState === 6 /* EnablementState.DisabledGlobally */ ? 8 /* EnablementState.EnabledGlobally */ : 9 /* EnablementState.EnabledWorkspace */)
                                    .then(() => this._hostService.reload(), e => this._notificationService.error(e)))]
                        }
                    });
                }
                else {
                    this._notificationService.notify({
                        severity: severity_1.default.Error,
                        message: (0, nls_1.localize)('disabledDepNoAction', "Cannot activate the '{0}' extension because it depends on the '{1}' extension which is disabled.", extName, missingInstalledDependency.manifest.displayName || missingInstalledDependency.manifest.name),
                    });
                }
            }
        }
        async _handleMissingNotInstalledDependency(extension, missingDependency) {
            const extName = extension.displayName || extension.name;
            let dependencyExtension = null;
            try {
                dependencyExtension = (await this._extensionsWorkbenchService.getExtensions([{ id: missingDependency }], cancellation_1.CancellationToken.None))[0];
            }
            catch (err) {
            }
            if (dependencyExtension) {
                this._notificationService.notify({
                    severity: severity_1.default.Error,
                    message: (0, nls_1.localize)('uninstalledDep', "Cannot activate the '{0}' extension because it depends on the '{1}' extension, which is not installed. Would you like to install the extension and reload the window?", extName, dependencyExtension.displayName),
                    actions: {
                        primary: [new actions_1.Action('install', (0, nls_1.localize)('install missing dep', "Install and Reload"), '', true, () => this._extensionsWorkbenchService.install(dependencyExtension)
                                .then(() => this._hostService.reload(), e => this._notificationService.error(e)))]
                    }
                });
            }
            else {
                this._notificationService.error((0, nls_1.localize)('unknownDep', "Cannot activate the '{0}' extension because it depends on an unknown '{1}' extension.", extName, missingDependency));
            }
        }
        async $setPerformanceMarks(marks) {
            if (this._extensionHostKind === 1 /* ExtensionHostKind.LocalProcess */) {
                this._timerService.setPerformanceMarks('localExtHost', marks);
            }
            else if (this._extensionHostKind === 2 /* ExtensionHostKind.LocalWebWorker */) {
                this._timerService.setPerformanceMarks('workerExtHost', marks);
            }
            else {
                this._timerService.setPerformanceMarks('remoteExtHost', marks);
            }
        }
        async $asBrowserUri(uri) {
            return network_1.FileAccess.uriToBrowserUri(uri_1.URI.revive(uri));
        }
    };
    exports.MainThreadExtensionService = MainThreadExtensionService;
    exports.MainThreadExtensionService = MainThreadExtensionService = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadExtensionService),
        __param(1, extensions_2.IExtensionService),
        __param(2, notification_1.INotificationService),
        __param(3, extensions_1.IExtensionsWorkbenchService),
        __param(4, host_1.IHostService),
        __param(5, extensionManagement_1.IWorkbenchExtensionEnablementService),
        __param(6, timerService_1.ITimerService),
        __param(7, commands_1.ICommandService),
        __param(8, environmentService_1.IWorkbenchEnvironmentService)
    ], MainThreadExtensionService);
    class ExtensionHostProxy {
        constructor(_actual) {
            this._actual = _actual;
        }
        async resolveAuthority(remoteAuthority, resolveAttempt) {
            const resolved = reviveResolveAuthorityResult(await this._actual.$resolveAuthority(remoteAuthority, resolveAttempt));
            return resolved;
        }
        async getCanonicalURI(remoteAuthority, uri) {
            const uriComponents = await this._actual.$getCanonicalURI(remoteAuthority, uri);
            return (uriComponents ? uri_1.URI.revive(uriComponents) : uriComponents);
        }
        startExtensionHost(extensionsDelta) {
            return this._actual.$startExtensionHost(extensionsDelta);
        }
        extensionTestsExecute() {
            return this._actual.$extensionTestsExecute();
        }
        activateByEvent(activationEvent, activationKind) {
            return this._actual.$activateByEvent(activationEvent, activationKind);
        }
        activate(extensionId, reason) {
            return this._actual.$activate(extensionId, reason);
        }
        setRemoteEnvironment(env) {
            return this._actual.$setRemoteEnvironment(env);
        }
        updateRemoteConnectionData(connectionData) {
            return this._actual.$updateRemoteConnectionData(connectionData);
        }
        deltaExtensions(extensionsDelta) {
            return this._actual.$deltaExtensions(extensionsDelta);
        }
        test_latency(n) {
            return this._actual.$test_latency(n);
        }
        test_up(b) {
            return this._actual.$test_up(b);
        }
        test_down(size) {
            return this._actual.$test_down(size);
        }
    }
    function reviveResolveAuthorityResult(result) {
        if (result.type === 'ok') {
            return {
                type: 'ok',
                value: {
                    ...result.value,
                    authority: reviveResolvedAuthority(result.value.authority),
                }
            };
        }
        else {
            return result;
        }
    }
    function reviveResolvedAuthority(resolvedAuthority) {
        return {
            ...resolvedAuthority,
            connectTo: reviveConnection(resolvedAuthority.connectTo),
        };
    }
    function reviveConnection(connection) {
        if (connection.type === 0 /* RemoteConnectionType.WebSocket */) {
            return new remoteAuthorityResolver_1.WebSocketRemoteConnection(connection.host, connection.port);
        }
        return new remoteAuthorityResolver_1.ManagedRemoteConnection(connection.id);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZEV4dGVuc2lvblNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2Jyb3dzZXIvbWFpblRocmVhZEV4dGVuc2lvblNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBOEJ6RixJQUFNLDBCQUEwQixHQUFoQyxNQUFNLDBCQUEwQjtRQUt0QyxZQUNDLGNBQStCLEVBQ0ssaUJBQW9DLEVBQ2pDLG9CQUEwQyxFQUNuQywyQkFBd0QsRUFDdkUsWUFBMEIsRUFDRiwyQkFBaUUsRUFDeEYsYUFBNEIsRUFDMUIsZUFBZ0MsRUFDakIsbUJBQWlEO1lBUDlELHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7WUFDakMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtZQUNuQyxnQ0FBMkIsR0FBM0IsMkJBQTJCLENBQTZCO1lBQ3ZFLGlCQUFZLEdBQVosWUFBWSxDQUFjO1lBQ0YsZ0NBQTJCLEdBQTNCLDJCQUEyQixDQUFzQztZQUN4RixrQkFBYSxHQUFiLGFBQWEsQ0FBZTtZQUMxQixvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFDakIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUE4QjtZQUVsRyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsY0FBYyxDQUFDLGlCQUFpQixDQUFDO1lBRTNELE1BQU0sc0JBQXNCLEdBQTZCLGNBQWUsQ0FBQztZQUN6RSxJQUFJLENBQUMseUJBQXlCLEdBQUcsc0JBQXNCLENBQUMsd0JBQXdCLENBQUM7WUFDakYsc0JBQXNCLENBQUMsc0JBQXNCLENBQzVDLElBQUksa0JBQWtCLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxpQ0FBYyxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FDdkYsQ0FBQztZQUNGLHNCQUFzQixDQUFDLDJCQUEyQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENB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