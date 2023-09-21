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
define(["require", "exports", "vs/base/common/network", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/common/dialogs", "vs/platform/files/common/files", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/log/browser/log", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/product/common/productService", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/remote/common/remoteExtensionsScanner", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensions/browser/webWorkerExtensionHost", "vs/workbench/services/extensions/browser/webWorkerFileSystemProvider", "vs/workbench/services/extensions/common/abstractExtensionService", "vs/workbench/services/extensions/common/extensionHostKind", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/workbench/services/extensions/common/extensionRunningLocationTracker", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionsProposedApi", "vs/workbench/services/extensions/common/extensionsUtil", "vs/workbench/services/extensions/common/remoteExtensionHost", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/remote/common/remoteExplorerService", "vs/workbench/services/userData/browser/userDataInit", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, network_1, configuration_1, dialogs_1, files_1, extensions_1, instantiation_1, log_1, log_2, notification_1, productService_1, remoteAuthorityResolver_1, remoteExtensionsScanner_1, telemetry_1, workspace_1, workspaceTrust_1, environmentService_1, extensionManagement_1, webWorkerExtensionHost_1, webWorkerFileSystemProvider_1, abstractExtensionService_1, extensionHostKind_1, extensionManifestPropertiesService_1, extensionRunningLocationTracker_1, extensions_2, extensionsProposedApi_1, extensionsUtil_1, remoteExtensionHost_1, lifecycle_1, remoteAgentService_1, remoteExplorerService_1, userDataInit_1, userDataProfile_1) {
    "use strict";
    var $W3b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$W3b = exports.$V3b = void 0;
    let $V3b = class $V3b extends abstractExtensionService_1.$N3b {
        constructor(instantiationService, notificationService, Sb, telemetryService, extensionEnablementService, fileService, productService, extensionManagementService, contextService, configurationService, extensionManifestPropertiesService, Tb, logService, remoteAgentService, remoteExtensionsScannerService, lifecycleService, remoteAuthorityResolverService, Ub, Vb, Wb, Xb, dialogService) {
            const extensionsProposedApi = instantiationService.createInstance(extensionsProposedApi_1.$M3b);
            const extensionHostFactory = new BrowserExtensionHostFactory(extensionsProposedApi, () => this.$b(), () => this.Db(), instantiationService, remoteAgentService, remoteAuthorityResolverService, extensionEnablementService, logService);
            super(extensionsProposedApi, extensionHostFactory, new $W3b(logService), instantiationService, notificationService, Sb, telemetryService, extensionEnablementService, fileService, productService, extensionManagementService, contextService, configurationService, extensionManifestPropertiesService, logService, remoteAgentService, remoteExtensionsScannerService, lifecycleService, remoteAuthorityResolverService, dialogService);
            this.Sb = Sb;
            this.Tb = Tb;
            this.Ub = Ub;
            this.Vb = Vb;
            this.Wb = Wb;
            this.Xb = Xb;
            // Initialize installed extensions first and do it only after workbench is ready
            lifecycleService.when(2 /* LifecyclePhase.Ready */).then(async () => {
                await this.Ub.initializeInstalledExtensions(this.I);
                this.jb();
            });
            this.Zb();
        }
        async Pb(extension) {
            if (extension.location.scheme === network_1.Schemas.vscodeRemote) {
                return this.Y.scanSingleExtension(extension.location, extension.type === 0 /* ExtensionType.System */);
            }
            const scannedExtension = await this.Tb.scanExistingExtension(extension.location, extension.type, this.Vb.currentProfile.extensionsResource);
            if (scannedExtension) {
                return (0, extensions_2.$UF)(scannedExtension);
            }
            return null;
        }
        Zb() {
            const provider = new webWorkerFileSystemProvider_1.$v3b();
            this.B(this.O.registerProvider(network_1.Schemas.http, provider));
            this.B(this.O.registerProvider(network_1.Schemas.https, provider));
        }
        async $b() {
            const system = [], user = [], development = [];
            try {
                await Promise.all([
                    this.Tb.scanSystemExtensions().then(extensions => system.push(...extensions.map(e => (0, extensions_2.$UF)(e)))),
                    this.Tb.scanUserExtensions(this.Vb.currentProfile.extensionsResource, { skipInvalidExtensions: true }).then(extensions => user.push(...extensions.map(e => (0, extensions_2.$UF)(e)))),
                    this.Tb.scanExtensionsUnderDevelopment().then(extensions => development.push(...extensions.map(e => (0, extensions_2.$UF)(e, true))))
                ]);
            }
            catch (error) {
                this.W.error(error);
            }
            return (0, extensionsUtil_1.$nN)(system, user, development, this.W);
        }
        async ac() {
            const [localExtensions, remoteExtensions] = await Promise.all([
                this.$b(),
                this.Y.scanExtensions()
            ]);
            return new abstractExtensionService_1.$O3b(localExtensions, remoteExtensions, /*hasLocalProcess*/ false, /*allowRemoteExtensionsInLocalWebWorker*/ true);
        }
        async Ob() {
            if (!this.Sb.expectsResolverExtension) {
                return this.ac();
            }
            const remoteAuthority = this.L.remoteAuthority;
            // Now that the canonical URI provider has been registered, we need to wait for the trust state to be
            // calculated. The trust state will be used while resolving the authority, however the resolver can
            // override the trust state through the resolver result.
            await this.Wb.workspaceResolved;
            let resolverResult;
            try {
                resolverResult = await this.ob(remoteAuthority);
            }
            catch (err) {
                if (remoteAuthorityResolver_1.$Mk.isHandled(err)) {
                    console.log(`Error handled: Not showing a notification for the error`);
                }
                this.$._setResolvedAuthorityError(remoteAuthority, err);
                // Proceed with the local extension host
                return this.ac();
            }
            // set the resolved authority
            this.$._setResolvedAuthority(resolverResult.authority, resolverResult.options);
            this.Xb.setTunnelInformation(resolverResult.tunnelInformation);
            // monitor for breakage
            const connection = this.X.getConnection();
            if (connection) {
                connection.onDidStateChange(async (e) => {
                    if (e.type === 0 /* PersistentConnectionEventType.ConnectionLost */) {
                        this.$._clearResolvedAuthority(remoteAuthority);
                    }
                });
                connection.onReconnecting(() => this.pb());
            }
            return this.ac();
        }
        async Qb(code) {
            // Dispose everything associated with the extension host
            this.sb();
            // If we are running extension tests, forward logs and exit code
            const automatedWindow = window;
            if (typeof automatedWindow.codeAutomationExit === 'function') {
                automatedWindow.codeAutomationExit(code, await (0, log_1.$Y1b)(this.O, this.L));
            }
        }
        async Rb(remoteAuthority) {
            return this.rb(2 /* ExtensionHostKind.LocalWebWorker */, remoteAuthority);
        }
    };
    exports.$V3b = $V3b;
    exports.$V3b = $V3b = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, notification_1.$Yu),
        __param(2, environmentService_1.$LT),
        __param(3, telemetry_1.$9k),
        __param(4, extensionManagement_1.$icb),
        __param(5, files_1.$6j),
        __param(6, productService_1.$kj),
        __param(7, extensionManagement_1.$hcb),
        __param(8, workspace_1.$Kh),
        __param(9, configuration_1.$8h),
        __param(10, extensionManifestPropertiesService_1.$vcb),
        __param(11, extensionManagement_1.$jcb),
        __param(12, log_2.$5i),
        __param(13, remoteAgentService_1.$jm),
        __param(14, remoteExtensionsScanner_1.$oN),
        __param(15, lifecycle_1.$7y),
        __param(16, remoteAuthorityResolver_1.$Jk),
        __param(17, userDataInit_1.$wzb),
        __param(18, userDataProfile_1.$CJ),
        __param(19, workspaceTrust_1.$$z),
        __param(20, remoteExplorerService_1.$tsb),
        __param(21, dialogs_1.$oA)
    ], $V3b);
    let BrowserExtensionHostFactory = class BrowserExtensionHostFactory {
        constructor(a, b, c, d, f, g, h, i) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
        }
        createExtensionHost(runningLocations, runningLocation, isInitialStart) {
            switch (runningLocation.kind) {
                case 1 /* ExtensionHostKind.LocalProcess */: {
                    return null;
                }
                case 2 /* ExtensionHostKind.LocalWebWorker */: {
                    const startup = (isInitialStart
                        ? 2 /* ExtensionHostStartup.EagerManualStart */
                        : 1 /* ExtensionHostStartup.EagerAutoStart */);
                    return this.d.createInstance(webWorkerExtensionHost_1.$u3b, runningLocation, startup, this.j(runningLocations, runningLocation, isInitialStart));
                }
                case 3 /* ExtensionHostKind.Remote */: {
                    const remoteAgentConnection = this.f.getConnection();
                    if (remoteAgentConnection) {
                        return this.d.createInstance(remoteExtensionHost_1.$U3b, runningLocation, this.k(runningLocations, remoteAgentConnection.remoteAuthority));
                    }
                    return null;
                }
            }
        }
        j(runningLocations, desiredRunningLocation, isInitialStart) {
            return {
                getInitData: async () => {
                    if (isInitialStart) {
                        // Here we load even extensions that would be disabled by workspace trust
                        const localExtensions = (0, abstractExtensionService_1.$P3b)(this.i, this.h, this.a, await this.b(), /* ignore workspace trust */ true);
                        const runningLocation = runningLocations.computeRunningLocation(localExtensions, [], false);
                        const myExtensions = (0, extensionRunningLocationTracker_1.$K3b)(localExtensions, runningLocation, extRunningLocation => desiredRunningLocation.equals(extRunningLocation));
                        const extensions = new extensions_2.$OF(0, localExtensions, myExtensions.map(extension => extension.identifier));
                        return { extensions };
                    }
                    else {
                        // restart case
                        const snapshot = await this.c();
                        const myExtensions = runningLocations.filterByRunningLocation(snapshot.extensions, desiredRunningLocation);
                        const extensions = new extensions_2.$OF(snapshot.versionId, snapshot.extensions, myExtensions.map(extension => extension.identifier));
                        return { extensions };
                    }
                }
            };
        }
        k(runningLocations, remoteAuthority) {
            return {
                remoteAuthority: remoteAuthority,
                getInitData: async () => {
                    const snapshot = await this.c();
                    const remoteEnv = await this.f.getEnvironment();
                    if (!remoteEnv) {
                        throw new Error('Cannot provide init data for remote extension host!');
                    }
                    const myExtensions = runningLocations.filterByExtensionHostKind(snapshot.extensions, 3 /* ExtensionHostKind.Remote */);
                    const extensions = new extensions_2.$OF(snapshot.versionId, snapshot.extensions, myExtensions.map(extension => extension.identifier));
                    return {
                        connectionData: this.g.getConnectionData(remoteAuthority),
                        pid: remoteEnv.pid,
                        appRoot: remoteEnv.appRoot,
                        extensionHostLogsPath: remoteEnv.extensionHostLogsPath,
                        globalStorageHome: remoteEnv.globalStorageHome,
                        workspaceStorageHome: remoteEnv.workspaceStorageHome,
                        extensions,
                    };
                }
            };
        }
    };
    BrowserExtensionHostFactory = __decorate([
        __param(3, instantiation_1.$Ah),
        __param(4, remoteAgentService_1.$jm),
        __param(5, remoteAuthorityResolver_1.$Jk),
        __param(6, extensionManagement_1.$icb),
        __param(7, log_2.$5i)
    ], BrowserExtensionHostFactory);
    let $W3b = $W3b_1 = class $W3b {
        constructor(a) {
            this.a = a;
        }
        pickExtensionHostKind(extensionId, extensionKinds, isInstalledLocally, isInstalledRemotely, preference) {
            const result = $W3b_1.pickRunningLocation(extensionKinds, isInstalledLocally, isInstalledRemotely, preference);
            this.a.trace(`pickRunningLocation for ${extensionId.value}, extension kinds: [${extensionKinds.join(', ')}], isInstalledLocally: ${isInstalledLocally}, isInstalledRemotely: ${isInstalledRemotely}, preference: ${(0, extensionHostKind_1.$EF)(preference)} => ${(0, extensionHostKind_1.$DF)(result)}`);
            return result;
        }
        static pickRunningLocation(extensionKinds, isInstalledLocally, isInstalledRemotely, preference) {
            const result = [];
            let canRunRemotely = false;
            for (const extensionKind of extensionKinds) {
                if (extensionKind === 'ui' && isInstalledRemotely) {
                    // ui extensions run remotely if possible (but only as a last resort)
                    if (preference === 2 /* ExtensionRunningPreference.Remote */) {
                        return 3 /* ExtensionHostKind.Remote */;
                    }
                    else {
                        canRunRemotely = true;
                    }
                }
                if (extensionKind === 'workspace' && isInstalledRemotely) {
                    // workspace extensions run remotely if possible
                    if (preference === 0 /* ExtensionRunningPreference.None */ || preference === 2 /* ExtensionRunningPreference.Remote */) {
                        return 3 /* ExtensionHostKind.Remote */;
                    }
                    else {
                        result.push(3 /* ExtensionHostKind.Remote */);
                    }
                }
                if (extensionKind === 'web' && (isInstalledLocally || isInstalledRemotely)) {
                    // web worker extensions run in the local web worker if possible
                    if (preference === 0 /* ExtensionRunningPreference.None */ || preference === 1 /* ExtensionRunningPreference.Local */) {
                        return 2 /* ExtensionHostKind.LocalWebWorker */;
                    }
                    else {
                        result.push(2 /* ExtensionHostKind.LocalWebWorker */);
                    }
                }
            }
            if (canRunRemotely) {
                result.push(3 /* ExtensionHostKind.Remote */);
            }
            return (result.length > 0 ? result[0] : null);
        }
    };
    exports.$W3b = $W3b;
    exports.$W3b = $W3b = $W3b_1 = __decorate([
        __param(0, log_2.$5i)
    ], $W3b);
    (0, extensions_1.$mr)(extensions_2.$MF, $V3b, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=extensionService.js.map