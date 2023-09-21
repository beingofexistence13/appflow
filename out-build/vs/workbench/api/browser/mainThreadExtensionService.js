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
define(["require", "exports", "vs/base/common/actions", "vs/base/common/cancellation", "vs/base/common/network", "vs/base/common/severity", "vs/base/common/uri", "vs/nls!vs/workbench/api/browser/mainThreadExtensionService", "vs/platform/commands/common/commands", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/notification/common/notification", "vs/platform/remote/common/remoteAuthorityResolver", "vs/workbench/api/common/extHost.protocol", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/services/host/browser/host", "vs/workbench/services/timer/browser/timerService"], function (require, exports, actions_1, cancellation_1, network_1, severity_1, uri_1, nls_1, commands_1, extensionManagementUtil_1, notification_1, remoteAuthorityResolver_1, extHost_protocol_1, extensions_1, environmentService_1, extensionManagement_1, extensions_2, extHostCustomers_1, host_1, timerService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$nkb = void 0;
    let $nkb = class $nkb {
        constructor(extHostContext, d, f, g, h, j, k, l, m) {
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.a = extHostContext.extensionHostKind;
            const internalExtHostContext = extHostContext;
            this.c = internalExtHostContext.internalExtensionService;
            internalExtHostContext._setExtensionHostProxy(new ExtensionHostProxy(extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostExtensionService)));
            internalExtHostContext._setAllMainProxyIdentifiers(Object.keys(extHost_protocol_1.$1J).map((key) => extHost_protocol_1.$1J[key]));
        }
        dispose() {
        }
        $getExtension(extensionId) {
            return this.d.getExtension(extensionId);
        }
        $activateExtension(extensionId, reason) {
            return this.c._activateById(extensionId, reason);
        }
        async $onWillActivateExtension(extensionId) {
            this.c._onWillActivateExtension(extensionId);
        }
        $onDidActivateExtension(extensionId, codeLoadingTime, activateCallTime, activateResolvedTime, activationReason) {
            this.c._onDidActivateExtension(extensionId, codeLoadingTime, activateCallTime, activateResolvedTime, activationReason);
        }
        $onExtensionRuntimeError(extensionId, data) {
            const error = new Error();
            error.name = data.name;
            error.message = data.message;
            error.stack = data.stack;
            this.c._onExtensionRuntimeError(extensionId, error);
            console.error(`[${extensionId.value}]${error.message}`);
            console.error(error.stack);
        }
        async $onExtensionActivationError(extensionId, data, missingExtensionDependency) {
            const error = new Error();
            error.name = data.name;
            error.message = data.message;
            error.stack = data.stack;
            this.c._onDidActivateExtensionError(extensionId, error);
            if (missingExtensionDependency) {
                const extension = await this.d.getExtension(extensionId.value);
                if (extension) {
                    const local = await this.g.queryLocal();
                    const installedDependency = local.find(i => (0, extensionManagementUtil_1.$po)(i.identifier, { id: missingExtensionDependency.dependency }));
                    if (installedDependency?.local) {
                        await this.o(extension, installedDependency.local);
                        return;
                    }
                    else {
                        await this.p(extension, missingExtensionDependency.dependency);
                        return;
                    }
                }
            }
            const isDev = !this.m.isBuilt || this.m.isExtensionDevelopment;
            if (isDev) {
                this.f.error(error);
                return;
            }
            console.error(error.message);
        }
        async o(extension, missingInstalledDependency) {
            const extName = extension.displayName || extension.name;
            if (this.j.isEnabled(missingInstalledDependency)) {
                this.f.notify({
                    severity: severity_1.default.Error,
                    message: (0, nls_1.localize)(0, null, extName, missingInstalledDependency.manifest.displayName || missingInstalledDependency.manifest.name),
                    actions: {
                        primary: [new actions_1.$gi('reload', (0, nls_1.localize)(1, null), '', true, () => this.h.reload())]
                    }
                });
            }
            else {
                const enablementState = this.j.getEnablementState(missingInstalledDependency);
                if (enablementState === 4 /* EnablementState.DisabledByVirtualWorkspace */) {
                    this.f.notify({
                        severity: severity_1.default.Error,
                        message: (0, nls_1.localize)(2, null, extName, missingInstalledDependency.manifest.displayName || missingInstalledDependency.manifest.name),
                    });
                }
                else if (enablementState === 0 /* EnablementState.DisabledByTrustRequirement */) {
                    this.f.notify({
                        severity: severity_1.default.Error,
                        message: (0, nls_1.localize)(3, null, extName, missingInstalledDependency.manifest.displayName || missingInstalledDependency.manifest.name),
                        actions: {
                            primary: [new actions_1.$gi('manageWorkspaceTrust', (0, nls_1.localize)(4, null), '', true, () => this.l.executeCommand('workbench.trust.manage'))]
                        }
                    });
                }
                else if (this.j.canChangeEnablement(missingInstalledDependency)) {
                    this.f.notify({
                        severity: severity_1.default.Error,
                        message: (0, nls_1.localize)(5, null, extName, missingInstalledDependency.manifest.displayName || missingInstalledDependency.manifest.name),
                        actions: {
                            primary: [new actions_1.$gi('enable', (0, nls_1.localize)(6, null), '', true, () => this.j.setEnablement([missingInstalledDependency], enablementState === 6 /* EnablementState.DisabledGlobally */ ? 8 /* EnablementState.EnabledGlobally */ : 9 /* EnablementState.EnabledWorkspace */)
                                    .then(() => this.h.reload(), e => this.f.error(e)))]
                        }
                    });
                }
                else {
                    this.f.notify({
                        severity: severity_1.default.Error,
                        message: (0, nls_1.localize)(7, null, extName, missingInstalledDependency.manifest.displayName || missingInstalledDependency.manifest.name),
                    });
                }
            }
        }
        async p(extension, missingDependency) {
            const extName = extension.displayName || extension.name;
            let dependencyExtension = null;
            try {
                dependencyExtension = (await this.g.getExtensions([{ id: missingDependency }], cancellation_1.CancellationToken.None))[0];
            }
            catch (err) {
            }
            if (dependencyExtension) {
                this.f.notify({
                    severity: severity_1.default.Error,
                    message: (0, nls_1.localize)(8, null, extName, dependencyExtension.displayName),
                    actions: {
                        primary: [new actions_1.$gi('install', (0, nls_1.localize)(9, null), '', true, () => this.g.install(dependencyExtension)
                                .then(() => this.h.reload(), e => this.f.error(e)))]
                    }
                });
            }
            else {
                this.f.error((0, nls_1.localize)(10, null, extName, missingDependency));
            }
        }
        async $setPerformanceMarks(marks) {
            if (this.a === 1 /* ExtensionHostKind.LocalProcess */) {
                this.k.setPerformanceMarks('localExtHost', marks);
            }
            else if (this.a === 2 /* ExtensionHostKind.LocalWebWorker */) {
                this.k.setPerformanceMarks('workerExtHost', marks);
            }
            else {
                this.k.setPerformanceMarks('remoteExtHost', marks);
            }
        }
        async $asBrowserUri(uri) {
            return network_1.$2f.uriToBrowserUri(uri_1.URI.revive(uri));
        }
    };
    exports.$nkb = $nkb;
    exports.$nkb = $nkb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadExtensionService),
        __param(1, extensions_2.$MF),
        __param(2, notification_1.$Yu),
        __param(3, extensions_1.$Pfb),
        __param(4, host_1.$VT),
        __param(5, extensionManagement_1.$icb),
        __param(6, timerService_1.$kkb),
        __param(7, commands_1.$Fr),
        __param(8, environmentService_1.$hJ)
    ], $nkb);
    class ExtensionHostProxy {
        constructor(a) {
            this.a = a;
        }
        async resolveAuthority(remoteAuthority, resolveAttempt) {
            const resolved = reviveResolveAuthorityResult(await this.a.$resolveAuthority(remoteAuthority, resolveAttempt));
            return resolved;
        }
        async getCanonicalURI(remoteAuthority, uri) {
            const uriComponents = await this.a.$getCanonicalURI(remoteAuthority, uri);
            return (uriComponents ? uri_1.URI.revive(uriComponents) : uriComponents);
        }
        startExtensionHost(extensionsDelta) {
            return this.a.$startExtensionHost(extensionsDelta);
        }
        extensionTestsExecute() {
            return this.a.$extensionTestsExecute();
        }
        activateByEvent(activationEvent, activationKind) {
            return this.a.$activateByEvent(activationEvent, activationKind);
        }
        activate(extensionId, reason) {
            return this.a.$activate(extensionId, reason);
        }
        setRemoteEnvironment(env) {
            return this.a.$setRemoteEnvironment(env);
        }
        updateRemoteConnectionData(connectionData) {
            return this.a.$updateRemoteConnectionData(connectionData);
        }
        deltaExtensions(extensionsDelta) {
            return this.a.$deltaExtensions(extensionsDelta);
        }
        test_latency(n) {
            return this.a.$test_latency(n);
        }
        test_up(b) {
            return this.a.$test_up(b);
        }
        test_down(size) {
            return this.a.$test_down(size);
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
            return new remoteAuthorityResolver_1.$Lk(connection.host, connection.port);
        }
        return new remoteAuthorityResolver_1.$Kk(connection.id);
    }
});
//# sourceMappingURL=mainThreadExtensionService.js.map