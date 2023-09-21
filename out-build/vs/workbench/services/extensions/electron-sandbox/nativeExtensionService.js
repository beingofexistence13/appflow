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
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/network", "vs/base/common/performance", "vs/base/common/platform", "vs/nls!vs/workbench/services/extensions/electron-sandbox/nativeExtensionService", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/common/dialogs", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/files/common/files", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/native/common/native", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/product/common/productService", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/remote/common/remoteExtensionsScanner", "vs/platform/remote/common/remoteHosts", "vs/platform/request/common/request", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensions/browser/webWorkerExtensionHost", "vs/workbench/services/extensions/common/abstractExtensionService", "vs/workbench/services/extensions/common/extensionDevOptions", "vs/workbench/services/extensions/common/extensionHostKind", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/workbench/services/extensions/common/extensionRunningLocationTracker", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionsProposedApi", "vs/workbench/services/extensions/common/remoteExtensionHost", "vs/workbench/services/extensions/electron-sandbox/cachedExtensionScanner", "vs/workbench/services/extensions/electron-sandbox/localProcessExtensionHost", "vs/workbench/services/host/browser/host", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/remote/common/remoteExplorerService"], function (require, exports, async_1, cancellation_1, network_1, performance, platform_1, nls, actionCommonCategories_1, actions_1, commands_1, configuration_1, dialogs_1, extensionManagement_1, files_1, extensions_1, instantiation_1, log_1, native_1, notification_1, opener_1, productService_1, remoteAuthorityResolver_1, remoteExtensionsScanner_1, remoteHosts_1, request_1, telemetry_1, workspace_1, workspaceTrust_1, environmentService_1, extensionManagement_2, webWorkerExtensionHost_1, abstractExtensionService_1, extensionDevOptions_1, extensionHostKind_1, extensionManifestPropertiesService_1, extensionRunningLocationTracker_1, extensions_2, extensionsProposedApi_1, remoteExtensionHost_1, cachedExtensionScanner_1, localProcessExtensionHost_1, host_1, lifecycle_1, remoteAgentService_1, remoteExplorerService_1) {
    "use strict";
    var $cac_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$cac = exports.$bac = void 0;
    let $bac = class $bac extends abstractExtensionService_1.$N3b {
        constructor(instantiationService, notificationService, environmentService, telemetryService, extensionEnablementService, fileService, productService, extensionManagementService, contextService, configurationService, extensionManifestPropertiesService, logService, remoteAgentService, remoteExtensionsScannerService, lifecycleService, remoteAuthorityResolverService, Ub, Vb, Wb, Xb, Yb, dialogService) {
            const extensionsProposedApi = instantiationService.createInstance(extensionsProposedApi_1.$M3b);
            const extensionScanner = instantiationService.createInstance(cachedExtensionScanner_1.$0_b);
            const extensionHostFactory = new NativeExtensionHostFactory(extensionsProposedApi, extensionScanner, () => this.Db(), instantiationService, environmentService, extensionEnablementService, configurationService, remoteAgentService, remoteAuthorityResolverService, logService);
            super(extensionsProposedApi, extensionHostFactory, new $cac(environmentService, configurationService, logService), instantiationService, notificationService, environmentService, telemetryService, extensionEnablementService, fileService, productService, extensionManagementService, contextService, configurationService, extensionManifestPropertiesService, logService, remoteAgentService, remoteExtensionsScannerService, lifecycleService, remoteAuthorityResolverService, dialogService);
            this.Ub = Ub;
            this.Vb = Vb;
            this.Wb = Wb;
            this.Xb = Xb;
            this.Yb = Yb;
            this.Tb = new abstractExtensionService_1.$T3b();
            this.Sb = extensionScanner;
            // delay extension host creation and extension scanning
            // until the workbench is running. we cannot defer the
            // extension host more (LifecyclePhase.Restored) because
            // some editors require the extension host to restore
            // and this would result in a deadlock
            // see https://github.com/microsoft/vscode/issues/41322
            lifecycleService.when(2 /* LifecyclePhase.Ready */).then(() => {
                // reschedule to ensure this runs after restoring viewlets, panels, and editors
                (0, async_1.$Wg)(() => {
                    this.jb();
                }, 50 /*max delay*/);
            });
        }
        Pb(extension) {
            if (extension.location.scheme === network_1.Schemas.vscodeRemote) {
                return this.Y.scanSingleExtension(extension.location, extension.type === 0 /* ExtensionType.System */);
            }
            return this.Sb.scanSingleExtension(extension.location.fsPath, extension.type === 0 /* ExtensionType.System */);
        }
        async $b() {
            return this.Sb.scannedExtensions;
        }
        yb(extensionHost, code, signal) {
            const activatedExtensions = [];
            const extensionsStatus = this.getExtensionsStatus();
            for (const key of Object.keys(extensionsStatus)) {
                const extensionStatus = extensionsStatus[key];
                if (extensionStatus.activationStarted && extensionHost.containsExtension(extensionStatus.id)) {
                    activatedExtensions.push(extensionStatus.id);
                }
            }
            super.yb(extensionHost, code, signal);
            if (extensionHost.kind === 1 /* ExtensionHostKind.LocalProcess */) {
                if (code === 55 /* ExtensionHostExitCode.VersionMismatch */) {
                    this.J.prompt(notification_1.Severity.Error, nls.localize(0, null), [{
                            label: nls.localize(1, null),
                            run: () => {
                                this.I.invokeFunction((accessor) => {
                                    const hostService = accessor.get(host_1.$VT);
                                    hostService.restart();
                                });
                            }
                        }]);
                    return;
                }
                this.Bb(extensionHost);
                this.bc(code, signal, activatedExtensions);
                this.Tb.registerCrash();
                if (this.Tb.shouldAutomaticallyRestart()) {
                    this.W.info(`Automatically restarting the extension host.`);
                    this.J.status(nls.localize(2, null), { hideAfter: 5000 });
                    this.startExtensionHosts();
                }
                else {
                    const choices = [];
                    if (this.L.isBuilt) {
                        choices.push({
                            label: nls.localize(3, null),
                            run: () => {
                                this.I.invokeFunction(accessor => {
                                    const commandService = accessor.get(commands_1.$Fr);
                                    commandService.executeCommand('extension.bisect.start');
                                });
                            }
                        });
                    }
                    else {
                        choices.push({
                            label: nls.localize(4, null),
                            run: () => this.Ub.openDevTools()
                        });
                    }
                    choices.push({
                        label: nls.localize(5, null),
                        run: () => this.startExtensionHosts()
                    });
                    if (this.L.isBuilt) {
                        choices.push({
                            label: nls.localize(6, null),
                            run: () => {
                                this.I.invokeFunction(accessor => {
                                    const openerService = accessor.get(opener_1.$NT);
                                    openerService.open('https://aka.ms/vscode-extension-bisect');
                                });
                            }
                        });
                    }
                    this.J.prompt(notification_1.Severity.Error, nls.localize(7, null), choices);
                }
            }
        }
        bc(code, signal, activatedExtensions) {
            this.M.publicLog2('extensionHostCrash', {
                code,
                signal,
                extensionIds: activatedExtensions.map(e => e.value)
            });
            for (const extensionId of activatedExtensions) {
                this.M.publicLog2('extensionHostCrashExtension', {
                    code,
                    signal,
                    extensionId: extensionId.value
                });
            }
        }
        // --- impl
        async Rb(remoteAuthority) {
            const authorityPlusIndex = remoteAuthority.indexOf('+');
            if (authorityPlusIndex === -1) {
                // This authority does not need to be resolved, simply parse the port number
                const { host, port } = (0, remoteHosts_1.$Rk)(remoteAuthority);
                return {
                    authority: {
                        authority: remoteAuthority,
                        connectTo: {
                            type: 0 /* RemoteConnectionType.WebSocket */,
                            host,
                            port
                        },
                        connectionToken: undefined
                    }
                };
            }
            return this.rb(1 /* ExtensionHostKind.LocalProcess */, remoteAuthority);
        }
        async dc(remoteAuthority, uri) {
            const authorityPlusIndex = remoteAuthority.indexOf('+');
            if (authorityPlusIndex === -1) {
                // This authority does not use a resolver
                return uri;
            }
            const localProcessExtensionHosts = this.bb(1 /* ExtensionHostKind.LocalProcess */);
            if (localProcessExtensionHosts.length === 0) {
                // no local process extension hosts
                throw new Error(`Cannot resolve canonical URI`);
            }
            const results = await Promise.all(localProcessExtensionHosts.map(extHost => extHost.getCanonicalURI(remoteAuthority, uri)));
            for (const result of results) {
                if (result) {
                    return result;
                }
            }
            // we can only reach this if there was no resolver extension that can return the cannonical uri
            throw new Error(`Cannot get canonical URI because no extension is installed to resolve ${(0, remoteAuthorityResolver_1.$Nk)(remoteAuthority)}`);
        }
        async Ob() {
            this.Sb.startScanningExtensions();
            const remoteAuthority = this.L.remoteAuthority;
            let remoteEnv = null;
            let remoteExtensions = [];
            if (remoteAuthority) {
                this.$._setCanonicalURIProvider(async (uri) => {
                    if (uri.scheme !== network_1.Schemas.vscodeRemote || uri.authority !== remoteAuthority) {
                        // The current remote authority resolver cannot give the canonical URI for this URI
                        return uri;
                    }
                    performance.mark(`code/willGetCanonicalURI/${(0, remoteAuthorityResolver_1.$Nk)(remoteAuthority)}`);
                    if (platform_1.$s) {
                        this.W.info(`Invoking getCanonicalURI for authority ${(0, remoteAuthorityResolver_1.$Nk)(remoteAuthority)}...`);
                    }
                    try {
                        return this.dc(remoteAuthority, uri);
                    }
                    finally {
                        performance.mark(`code/didGetCanonicalURI/${(0, remoteAuthorityResolver_1.$Nk)(remoteAuthority)}`);
                        if (platform_1.$s) {
                            this.W.info(`getCanonicalURI returned for authority ${(0, remoteAuthorityResolver_1.$Nk)(remoteAuthority)}.`);
                        }
                    }
                });
                if (platform_1.$s) {
                    this.W.info(`Starting to wait on IWorkspaceTrustManagementService.workspaceResolved...`);
                }
                // Now that the canonical URI provider has been registered, we need to wait for the trust state to be
                // calculated. The trust state will be used while resolving the authority, however the resolver can
                // override the trust state through the resolver result.
                await this.Yb.workspaceResolved;
                if (platform_1.$s) {
                    this.W.info(`Finished waiting on IWorkspaceTrustManagementService.workspaceResolved.`);
                }
                let resolverResult;
                try {
                    resolverResult = await this.ob(remoteAuthority);
                }
                catch (err) {
                    if (remoteAuthorityResolver_1.$Mk.isNoResolverFound(err)) {
                        err.isHandled = await this.hc(remoteAuthority);
                    }
                    else {
                        if (remoteAuthorityResolver_1.$Mk.isHandled(err)) {
                            console.log(`Error handled: Not showing a notification for the error`);
                        }
                    }
                    this.$._setResolvedAuthorityError(remoteAuthority, err);
                    // Proceed with the local extension host
                    return this.fc();
                }
                // set the resolved authority
                this.$._setResolvedAuthority(resolverResult.authority, resolverResult.options);
                this.Wb.setTunnelInformation(resolverResult.tunnelInformation);
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
                // fetch the remote environment
                [remoteEnv, remoteExtensions] = await Promise.all([
                    this.X.getEnvironment(),
                    this.Y.scanExtensions()
                ]);
                if (!remoteEnv) {
                    this.J.notify({ severity: notification_1.Severity.Error, message: nls.localize(8, null) });
                    // Proceed with the local extension host
                    return this.fc();
                }
                (0, request_1.$Po)(remoteEnv.useHostProxy ? 1 /* ConfigurationScope.APPLICATION */ : 2 /* ConfigurationScope.MACHINE */);
            }
            else {
                this.$._setCanonicalURIProvider(async (uri) => uri);
            }
            return this.fc(remoteExtensions);
        }
        async fc(remoteExtensions = []) {
            // Ensure that the workspace trust state has been fully initialized so
            // that the extension host can start with the correct set of extensions.
            await this.Yb.workspaceTrustInitialized;
            return new abstractExtensionService_1.$O3b(await this.$b(), remoteExtensions, /*hasLocalProcess*/ true, /*allowRemoteExtensionsInLocalWebWorker*/ false);
        }
        Qb(code) {
            // Dispose everything associated with the extension host
            this.sb();
            // Dispose the management connection to avoid reconnecting after the extension host exits
            const connection = this.X.getConnection();
            connection?.dispose();
            if ((0, extensionDevOptions_1.$Ccb)(this.L).isExtensionDevTestFromCli) {
                // When CLI testing make sure to exit with proper exit code
                if (platform_1.$s) {
                    this.W.info(`Asking native host service to exit with code ${code}.`);
                }
                this.Ub.exit(code);
            }
            else {
                // Expected development extension termination: When the extension host goes down we also shutdown the window
                this.Ub.closeWindow();
            }
        }
        async hc(remoteAuthority) {
            const remoteName = (0, remoteHosts_1.$Pk)(remoteAuthority);
            const recommendation = this.P.remoteExtensionTips?.[remoteName];
            if (!recommendation) {
                return false;
            }
            const sendTelemetry = (userReaction) => {
                /* __GDPR__
                "remoteExtensionRecommendations:popup" : {
                    "owner": "sandy081",
                    "userReaction" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "extensionId": { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight" }
                }
                */
                this.M.publicLog('remoteExtensionRecommendations:popup', { userReaction, extensionId: resolverExtensionId });
            };
            const resolverExtensionId = recommendation.extensionId;
            const allExtensions = await this.$b();
            const extension = allExtensions.filter(e => e.identifier.value === resolverExtensionId)[0];
            if (extension) {
                if (!(0, abstractExtensionService_1.$R3b)(this.W, this.N, extension, false)) {
                    const message = nls.localize(9, null, recommendation.friendlyName);
                    this.J.prompt(notification_1.Severity.Info, message, [{
                            label: nls.localize(10, null),
                            run: async () => {
                                sendTelemetry('enable');
                                await this.N.setEnablement([(0, extensions_2.$TF)(extension)], 8 /* EnablementState.EnabledGlobally */);
                                await this.Vb.reload();
                            }
                        }], {
                        sticky: true,
                        priority: notification_1.NotificationPriority.URGENT
                    });
                }
            }
            else {
                // Install the Extension and reload the window to handle.
                const message = nls.localize(11, null, recommendation.friendlyName);
                this.J.prompt(notification_1.Severity.Info, message, [{
                        label: nls.localize(12, null),
                        run: async () => {
                            sendTelemetry('install');
                            const [galleryExtension] = await this.Xb.getExtensions([{ id: resolverExtensionId }], cancellation_1.CancellationToken.None);
                            if (galleryExtension) {
                                await this.Q.installFromGallery(galleryExtension);
                                await this.Vb.reload();
                            }
                            else {
                                this.J.error(nls.localize(13, null));
                            }
                        }
                    }], {
                    sticky: true,
                    priority: notification_1.NotificationPriority.URGENT,
                    onCancel: () => sendTelemetry('cancel')
                });
            }
            return true;
        }
    };
    exports.$bac = $bac;
    exports.$bac = $bac = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, notification_1.$Yu),
        __param(2, environmentService_1.$hJ),
        __param(3, telemetry_1.$9k),
        __param(4, extensionManagement_2.$icb),
        __param(5, files_1.$6j),
        __param(6, productService_1.$kj),
        __param(7, extensionManagement_2.$hcb),
        __param(8, workspace_1.$Kh),
        __param(9, configuration_1.$8h),
        __param(10, extensionManifestPropertiesService_1.$vcb),
        __param(11, log_1.$5i),
        __param(12, remoteAgentService_1.$jm),
        __param(13, remoteExtensionsScanner_1.$oN),
        __param(14, lifecycle_1.$7y),
        __param(15, remoteAuthorityResolver_1.$Jk),
        __param(16, native_1.$05b),
        __param(17, host_1.$VT),
        __param(18, remoteExplorerService_1.$tsb),
        __param(19, extensionManagement_1.$Zn),
        __param(20, workspaceTrust_1.$$z),
        __param(21, dialogs_1.$oA)
    ], $bac);
    let NativeExtensionHostFactory = class NativeExtensionHostFactory {
        constructor(b, c, d, f, environmentService, g, configurationService, h, i, j) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.a = determineLocalWebWorkerExtHostEnablement(environmentService, configurationService);
        }
        createExtensionHost(runningLocations, runningLocation, isInitialStart) {
            switch (runningLocation.kind) {
                case 1 /* ExtensionHostKind.LocalProcess */: {
                    const startup = (isInitialStart
                        ? 2 /* ExtensionHostStartup.EagerManualStart */
                        : 1 /* ExtensionHostStartup.EagerAutoStart */);
                    return this.f.createInstance(localProcessExtensionHost_1.$__b, runningLocation, startup, this.l(runningLocations, isInitialStart, runningLocation));
                }
                case 2 /* ExtensionHostKind.LocalWebWorker */: {
                    if (this.a !== 0 /* LocalWebWorkerExtHostEnablement.Disabled */) {
                        const startup = (isInitialStart
                            ? (this.a === 2 /* LocalWebWorkerExtHostEnablement.Lazy */ ? 3 /* ExtensionHostStartup.Lazy */ : 2 /* ExtensionHostStartup.EagerManualStart */)
                            : 1 /* ExtensionHostStartup.EagerAutoStart */);
                        return this.f.createInstance(webWorkerExtensionHost_1.$u3b, runningLocation, startup, this.m(runningLocations, runningLocation));
                    }
                    return null;
                }
                case 3 /* ExtensionHostKind.Remote */: {
                    const remoteAgentConnection = this.h.getConnection();
                    if (remoteAgentConnection) {
                        return this.f.createInstance(remoteExtensionHost_1.$U3b, runningLocation, this.n(runningLocations, remoteAgentConnection.remoteAuthority));
                    }
                    return null;
                }
            }
        }
        l(runningLocations, isInitialStart, desiredRunningLocation) {
            return {
                getInitData: async () => {
                    if (isInitialStart) {
                        // Here we load even extensions that would be disabled by workspace trust
                        const scannedExtensions = await this.c.scannedExtensions;
                        if (platform_1.$s) {
                            this.j.info(`NativeExtensionHostFactory._createLocalProcessExtensionHostDataProvider.scannedExtensions: ${scannedExtensions.map(ext => ext.identifier.value).join(',')}`);
                        }
                        const localExtensions = (0, abstractExtensionService_1.$P3b)(this.j, this.g, this.b, scannedExtensions, /* ignore workspace trust */ true);
                        if (platform_1.$s) {
                            this.j.info(`NativeExtensionHostFactory._createLocalProcessExtensionHostDataProvider.localExtensions: ${localExtensions.map(ext => ext.identifier.value).join(',')}`);
                        }
                        const runningLocation = runningLocations.computeRunningLocation(localExtensions, [], false);
                        const myExtensions = (0, extensionRunningLocationTracker_1.$K3b)(localExtensions, runningLocation, extRunningLocation => desiredRunningLocation.equals(extRunningLocation));
                        const extensions = new extensions_2.$OF(0, localExtensions, myExtensions.map(extension => extension.identifier));
                        if (platform_1.$s) {
                            this.j.info(`NativeExtensionHostFactory._createLocalProcessExtensionHostDataProvider.myExtensions: ${myExtensions.map(ext => ext.identifier.value).join(',')}`);
                        }
                        return { extensions };
                    }
                    else {
                        // restart case
                        const snapshot = await this.d();
                        const myExtensions = runningLocations.filterByRunningLocation(snapshot.extensions, desiredRunningLocation);
                        const extensions = new extensions_2.$OF(snapshot.versionId, snapshot.extensions, myExtensions.map(extension => extension.identifier));
                        return { extensions };
                    }
                }
            };
        }
        m(runningLocations, desiredRunningLocation) {
            return {
                getInitData: async () => {
                    const snapshot = await this.d();
                    const myExtensions = runningLocations.filterByRunningLocation(snapshot.extensions, desiredRunningLocation);
                    const extensions = new extensions_2.$OF(snapshot.versionId, snapshot.extensions, myExtensions.map(extension => extension.identifier));
                    return { extensions };
                }
            };
        }
        n(runningLocations, remoteAuthority) {
            return {
                remoteAuthority: remoteAuthority,
                getInitData: async () => {
                    const snapshot = await this.d();
                    const remoteEnv = await this.h.getEnvironment();
                    if (!remoteEnv) {
                        throw new Error('Cannot provide init data for remote extension host!');
                    }
                    const myExtensions = runningLocations.filterByExtensionHostKind(snapshot.extensions, 3 /* ExtensionHostKind.Remote */);
                    const extensions = new extensions_2.$OF(snapshot.versionId, snapshot.extensions, myExtensions.map(extension => extension.identifier));
                    return {
                        connectionData: this.i.getConnectionData(remoteAuthority),
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
    NativeExtensionHostFactory = __decorate([
        __param(3, instantiation_1.$Ah),
        __param(4, environmentService_1.$hJ),
        __param(5, extensionManagement_2.$icb),
        __param(6, configuration_1.$8h),
        __param(7, remoteAgentService_1.$jm),
        __param(8, remoteAuthorityResolver_1.$Jk),
        __param(9, log_1.$5i)
    ], NativeExtensionHostFactory);
    function determineLocalWebWorkerExtHostEnablement(environmentService, configurationService) {
        if (environmentService.isExtensionDevelopment && environmentService.extensionDevelopmentKind?.some(k => k === 'web')) {
            return 1 /* LocalWebWorkerExtHostEnablement.Eager */;
        }
        else {
            const config = configurationService.getValue(extensions_2.$LF);
            if (config === true) {
                return 1 /* LocalWebWorkerExtHostEnablement.Eager */;
            }
            else if (config === 'auto') {
                return 2 /* LocalWebWorkerExtHostEnablement.Lazy */;
            }
            else {
                return 0 /* LocalWebWorkerExtHostEnablement.Disabled */;
            }
        }
    }
    var LocalWebWorkerExtHostEnablement;
    (function (LocalWebWorkerExtHostEnablement) {
        LocalWebWorkerExtHostEnablement[LocalWebWorkerExtHostEnablement["Disabled"] = 0] = "Disabled";
        LocalWebWorkerExtHostEnablement[LocalWebWorkerExtHostEnablement["Eager"] = 1] = "Eager";
        LocalWebWorkerExtHostEnablement[LocalWebWorkerExtHostEnablement["Lazy"] = 2] = "Lazy";
    })(LocalWebWorkerExtHostEnablement || (LocalWebWorkerExtHostEnablement = {}));
    let $cac = $cac_1 = class $cac {
        constructor(environmentService, configurationService, c) {
            this.c = c;
            this.a = Boolean(environmentService.remoteAuthority);
            const webWorkerExtHostEnablement = determineLocalWebWorkerExtHostEnablement(environmentService, configurationService);
            this.b = (webWorkerExtHostEnablement !== 0 /* LocalWebWorkerExtHostEnablement.Disabled */);
        }
        pickExtensionHostKind(extensionId, extensionKinds, isInstalledLocally, isInstalledRemotely, preference) {
            const result = $cac_1.pickExtensionHostKind(extensionKinds, isInstalledLocally, isInstalledRemotely, preference, this.a, this.b);
            this.c.trace(`pickRunningLocation for ${extensionId.value}, extension kinds: [${extensionKinds.join(', ')}], isInstalledLocally: ${isInstalledLocally}, isInstalledRemotely: ${isInstalledRemotely}, preference: ${(0, extensionHostKind_1.$EF)(preference)} => ${(0, extensionHostKind_1.$DF)(result)}`);
            return result;
        }
        static pickExtensionHostKind(extensionKinds, isInstalledLocally, isInstalledRemotely, preference, hasRemoteExtHost, hasWebWorkerExtHost) {
            const result = [];
            for (const extensionKind of extensionKinds) {
                if (extensionKind === 'ui' && isInstalledLocally) {
                    // ui extensions run locally if possible
                    if (preference === 0 /* ExtensionRunningPreference.None */ || preference === 1 /* ExtensionRunningPreference.Local */) {
                        return 1 /* ExtensionHostKind.LocalProcess */;
                    }
                    else {
                        result.push(1 /* ExtensionHostKind.LocalProcess */);
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
                if (extensionKind === 'workspace' && !hasRemoteExtHost) {
                    // workspace extensions also run locally if there is no remote
                    if (preference === 0 /* ExtensionRunningPreference.None */ || preference === 1 /* ExtensionRunningPreference.Local */) {
                        return 1 /* ExtensionHostKind.LocalProcess */;
                    }
                    else {
                        result.push(1 /* ExtensionHostKind.LocalProcess */);
                    }
                }
                if (extensionKind === 'web' && isInstalledLocally && hasWebWorkerExtHost) {
                    // web worker extensions run in the local web worker if possible
                    if (preference === 0 /* ExtensionRunningPreference.None */ || preference === 1 /* ExtensionRunningPreference.Local */) {
                        return 2 /* ExtensionHostKind.LocalWebWorker */;
                    }
                    else {
                        result.push(2 /* ExtensionHostKind.LocalWebWorker */);
                    }
                }
            }
            return (result.length > 0 ? result[0] : null);
        }
    };
    exports.$cac = $cac;
    exports.$cac = $cac = $cac_1 = __decorate([
        __param(0, environmentService_1.$hJ),
        __param(1, configuration_1.$8h),
        __param(2, log_1.$5i)
    ], $cac);
    class RestartExtensionHostAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.restartExtensionHost',
                title: { value: nls.localize(14, null), original: 'Restart Extension Host' },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        async run(accessor) {
            const extensionService = accessor.get(extensions_2.$MF);
            const stopped = await extensionService.stopExtensionHosts(nls.localize(15, null));
            if (stopped) {
                extensionService.startExtensionHosts();
            }
        }
    }
    (0, actions_1.$Xu)(RestartExtensionHostAction);
    (0, extensions_1.$mr)(extensions_2.$MF, $bac, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=nativeExtensionService.js.map