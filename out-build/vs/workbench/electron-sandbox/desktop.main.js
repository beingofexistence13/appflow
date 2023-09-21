/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/electron-sandbox/desktop.main", "vs/platform/product/common/product", "vs/workbench/browser/workbench", "vs/workbench/electron-sandbox/window", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/common/errors", "vs/base/common/uri", "vs/workbench/services/configuration/browser/configurationService", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/instantiation/common/serviceCollection", "vs/platform/log/common/log", "vs/workbench/services/storage/electron-sandbox/storageService", "vs/platform/workspace/common/workspace", "vs/workbench/services/configuration/common/configuration", "vs/platform/storage/common/storage", "vs/base/common/lifecycle", "vs/platform/ipc/electron-sandbox/services", "vs/platform/ipc/common/mainProcessService", "vs/workbench/services/sharedProcess/electron-sandbox/sharedProcessService", "vs/platform/remote/electron-sandbox/remoteAuthorityResolverService", "vs/platform/remote/common/remoteAuthorityResolver", "vs/workbench/services/remote/electron-sandbox/remoteAgentService", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/files/common/fileService", "vs/workbench/services/files/common/files", "vs/workbench/services/remote/common/remoteFileSystemProviderClient", "vs/workbench/services/configuration/common/configurationCache", "vs/platform/sign/common/sign", "vs/platform/product/common/productService", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/workbench/services/keybinding/electron-sandbox/nativeKeyboardLayoutService", "vs/platform/ipc/electron-sandbox/mainProcessService", "vs/platform/log/common/logIpc", "vs/base/parts/ipc/common/ipc", "vs/workbench/services/log/electron-sandbox/logService", "vs/workbench/services/workspaces/common/workspaceTrust", "vs/platform/workspace/common/workspaceTrust", "vs/base/common/objects", "vs/workbench/services/utilityProcess/electron-sandbox/utilityProcessWorkerWorkbenchService", "vs/base/common/platform", "vs/base/common/network", "vs/workbench/services/files/electron-sandbox/diskFileSystemProvider", "vs/platform/userData/common/fileUserDataProvider", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataProfile/common/userDataProfileIpc", "vs/platform/policy/common/policyIpc", "vs/platform/policy/common/policy", "vs/workbench/services/userDataProfile/common/userDataProfileService", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/remote/browser/browserSocketFactory", "vs/platform/remote/common/remoteSocketFactoryService", "vs/platform/remote/electron-sandbox/electronRemoteResourceLoader", "vs/platform/window/electron-sandbox/window"], function (require, exports, nls_1, product_1, workbench_1, window_1, browser_1, dom_1, errors_1, uri_1, configurationService_1, environmentService_1, serviceCollection_1, log_1, storageService_1, workspace_1, configuration_1, storage_1, lifecycle_1, services_1, mainProcessService_1, sharedProcessService_1, remoteAuthorityResolverService_1, remoteAuthorityResolver_1, remoteAgentService_1, remoteAgentService_2, fileService_1, files_1, remoteFileSystemProviderClient_1, configurationCache_1, sign_1, productService_1, uriIdentity_1, uriIdentityService_1, nativeKeyboardLayoutService_1, mainProcessService_2, logIpc_1, ipc_1, logService_1, workspaceTrust_1, workspaceTrust_2, objects_1, utilityProcessWorkerWorkbenchService_1, platform_1, network_1, diskFileSystemProvider_1, fileUserDataProvider_1, userDataProfile_1, userDataProfileIpc_1, policyIpc_1, policy_1, userDataProfileService_1, userDataProfile_2, browserSocketFactory_1, remoteSocketFactoryService_1, electronRemoteResourceLoader_1, window_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.main = exports.$b_b = void 0;
    class $b_b extends lifecycle_1.$kc {
        constructor(a) {
            super();
            this.a = a;
            this.b();
        }
        b() {
            // Massage configuration file URIs
            this.c();
            // Apply fullscreen early if configured
            (0, browser_1.$2N)(!!this.a.fullscreen);
        }
        c() {
            // Workspace
            const workspace = (0, workspace_1.$Rh)(this.a.workspace);
            if ((0, workspace_1.$Qh)(workspace) || (0, workspace_1.$Lh)(workspace)) {
                this.a.workspace = workspace;
            }
            // Files
            const filesToWait = this.a.filesToWait;
            const filesToWaitPaths = filesToWait?.paths;
            for (const paths of [filesToWaitPaths, this.a.filesToOpenOrCreate, this.a.filesToDiff, this.a.filesToMerge]) {
                if (Array.isArray(paths)) {
                    for (const path of paths) {
                        if (path.fileUri) {
                            path.fileUri = uri_1.URI.revive(path.fileUri);
                        }
                    }
                }
            }
            if (filesToWait) {
                filesToWait.waitMarkerFileUri = uri_1.URI.revive(filesToWait.waitMarkerFileUri);
            }
        }
        async open() {
            // Init services and wait for DOM to be ready in parallel
            const [services] = await Promise.all([this.j(), (0, dom_1.$hP)()]);
            // Apply zoom level early once we have a configuration service
            // and before the workbench is created to prevent flickering.
            // We also need to respect that zoom level can be configured per
            // workspace, so we need the resolved configuration service.
            // (fixes https://github.com/microsoft/vscode/issues/187982)
            this.f(services.configurationService);
            // Create Workbench
            const workbench = new workbench_1.$g2b(document.body, { extraClasses: this.g() }, services.serviceCollection, services.logService);
            // Listeners
            this.h(workbench, services.storageService);
            // Startup
            const instantiationService = workbench.startup();
            // Window
            this.B(instantiationService.createInstance(window_1.$5$b));
        }
        f(configurationService) {
            const windowConfig = configurationService.getValue();
            const windowZoomLevel = typeof windowConfig.window?.zoomLevel === 'number' ? windowConfig.window.zoomLevel : 0;
            (0, window_2.$t7b)(windowZoomLevel);
        }
        g() {
            if (platform_1.$j) {
                if (this.a.os.release > '20.0.0') {
                    return ['macos-bigsur-or-newer'];
                }
            }
            return [];
        }
        h(workbench, storageService) {
            // Workbench Lifecycle
            this.B(workbench.onWillShutdown(event => event.join(storageService.close(), { id: 'join.closeStorage', label: (0, nls_1.localize)(0, null) })));
            this.B(workbench.onDidShutdown(() => this.dispose()));
        }
        async j() {
            const serviceCollection = new serviceCollection_1.$zh();
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            //
            // NOTE: Please do NOT register services here. Use `registerSingleton()`
            //       from `workbench.common.main.ts` if the service is shared between
            //       desktop and web or `workbench.desktop.main.ts` if the service
            //       is desktop only.
            //
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            // Main Process
            const mainProcessService = this.B(new mainProcessService_2.$q7b(this.a.windowId));
            serviceCollection.set(mainProcessService_1.$o7b, mainProcessService);
            // Policies
            const policyService = this.a.policiesData ? new policyIpc_1.$16b(this.a.policiesData, mainProcessService.getChannel('policy')) : new policy_1.$_m();
            serviceCollection.set(policy_1.$0m, policyService);
            // Product
            const productService = { _serviceBrand: undefined, ...product_1.default };
            serviceCollection.set(productService_1.$kj, productService);
            // Environment
            const environmentService = new environmentService_1.$2$b(this.a, productService);
            serviceCollection.set(environmentService_1.$1$b, environmentService);
            // Logger
            const loggers = [
                ...this.a.loggers.global.map(loggerResource => ({ ...loggerResource, resource: uri_1.URI.revive(loggerResource.resource) })),
                ...this.a.loggers.window.map(loggerResource => ({ ...loggerResource, resource: uri_1.URI.revive(loggerResource.resource), hidden: true })),
            ];
            const loggerService = new logIpc_1.$1q(this.a.windowId, this.a.logLevel, environmentService.windowLogsPath, loggers, mainProcessService.getChannel('logger'));
            serviceCollection.set(log_1.$6i, loggerService);
            // Log
            const logService = this.B(new logService_1.$$$b(loggerService, environmentService));
            serviceCollection.set(log_1.$5i, logService);
            if (platform_1.$s) {
                logService.info('workbench#open()'); // marking workbench open helps to diagnose flaky integration/smoke tests
            }
            if (logService.getLevel() === log_1.LogLevel.Trace) {
                logService.trace('workbench#open(): with configuration', (0, objects_1.$1m)(this.a));
            }
            // Shared Process
            const sharedProcessService = new sharedProcessService_1.$7$b(this.a.windowId, logService);
            serviceCollection.set(services_1.$A7b, sharedProcessService);
            // Utility Process Worker
            const utilityProcessWorkerWorkbenchService = new utilityProcessWorkerWorkbenchService_1.$4$b(this.a.windowId, logService, mainProcessService);
            serviceCollection.set(utilityProcessWorkerWorkbenchService_1.$3$b, utilityProcessWorkerWorkbenchService);
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            //
            // NOTE: Please do NOT register services here. Use `registerSingleton()`
            //       from `workbench.common.main.ts` if the service is shared between
            //       desktop and web or `workbench.desktop.main.ts` if the service
            //       is desktop only.
            //
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            // Sign
            const signService = ipc_1.ProxyChannel.toService(mainProcessService.getChannel('sign'));
            serviceCollection.set(sign_1.$Wk, signService);
            // Files
            const fileService = this.B(new fileService_1.$Dp(logService));
            serviceCollection.set(files_1.$okb, fileService);
            // Remote
            const remoteAuthorityResolverService = new remoteAuthorityResolverService_1.$J$b(productService, new electronRemoteResourceLoader_1.$I$b(environmentService.window.id, mainProcessService, fileService));
            serviceCollection.set(remoteAuthorityResolver_1.$Jk, remoteAuthorityResolverService);
            // Local Files
            const diskFileSystemProvider = this.B(new diskFileSystemProvider_1.$a_b(mainProcessService, utilityProcessWorkerWorkbenchService, logService));
            fileService.registerProvider(network_1.Schemas.file, diskFileSystemProvider);
            // URI Identity
            const uriIdentityService = new uriIdentityService_1.$pr(fileService);
            serviceCollection.set(uriIdentity_1.$Ck, uriIdentityService);
            // User Data Profiles
            const userDataProfilesService = new userDataProfileIpc_1.$tN(this.a.profiles.all, uri_1.URI.revive(this.a.profiles.home).with({ scheme: environmentService.userRoamingDataHome.scheme }), mainProcessService.getChannel('userDataProfiles'));
            serviceCollection.set(userDataProfile_1.$Ek, userDataProfilesService);
            const userDataProfileService = new userDataProfileService_1.$I2b((0, userDataProfile_1.$Fk)(this.a.profiles.profile, userDataProfilesService.profilesHome.scheme));
            serviceCollection.set(userDataProfile_2.$CJ, userDataProfileService);
            // Use FileUserDataProvider for user data to
            // enable atomic read / write operations.
            fileService.registerProvider(network_1.Schemas.vscodeUserData, this.B(new fileUserDataProvider_1.$n7b(network_1.Schemas.file, diskFileSystemProvider, network_1.Schemas.vscodeUserData, userDataProfilesService, uriIdentityService, logService)));
            // Remote Agent
            const remoteSocketFactoryService = new remoteSocketFactoryService_1.$Uk();
            remoteSocketFactoryService.register(0 /* RemoteConnectionType.WebSocket */, new browserSocketFactory_1.$HT(null));
            serviceCollection.set(remoteSocketFactoryService_1.$Tk, remoteSocketFactoryService);
            const remoteAgentService = this.B(new remoteAgentService_1.$8$b(remoteSocketFactoryService, userDataProfileService, environmentService, productService, remoteAuthorityResolverService, signService, logService));
            serviceCollection.set(remoteAgentService_2.$jm, remoteAgentService);
            // Remote Files
            this.B(remoteFileSystemProviderClient_1.$0M.register(remoteAgentService, fileService, logService));
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            //
            // NOTE: Please do NOT register services here. Use `registerSingleton()`
            //       from `workbench.common.main.ts` if the service is shared between
            //       desktop and web or `workbench.desktop.main.ts` if the service
            //       is desktop only.
            //
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            // Create services that require resolving in parallel
            const workspace = this.m(environmentService);
            const [configurationService, storageService] = await Promise.all([
                this.n(workspace, environmentService, userDataProfileService, userDataProfilesService, fileService, remoteAgentService, uriIdentityService, logService, policyService).then(service => {
                    // Workspace
                    serviceCollection.set(workspace_1.$Kh, service);
                    // Configuration
                    serviceCollection.set(configuration_1.$mE, service);
                    return service;
                }),
                this.r(workspace, environmentService, userDataProfileService, userDataProfilesService, mainProcessService).then(service => {
                    // Storage
                    serviceCollection.set(storage_1.$Vo, service);
                    return service;
                }),
                this.s(mainProcessService).then(service => {
                    // KeyboardLayout
                    serviceCollection.set(nativeKeyboardLayoutService_1.$9$b, service);
                    return service;
                })
            ]);
            // Workspace Trust Service
            const workspaceTrustEnablementService = new workspaceTrust_1.$scb(configurationService, environmentService);
            serviceCollection.set(workspaceTrust_2.$0z, workspaceTrustEnablementService);
            const workspaceTrustManagementService = new workspaceTrust_1.$tcb(configurationService, remoteAuthorityResolverService, storageService, uriIdentityService, environmentService, configurationService, workspaceTrustEnablementService, fileService);
            serviceCollection.set(workspaceTrust_2.$$z, workspaceTrustManagementService);
            // Update workspace trust so that configuration is updated accordingly
            configurationService.updateWorkspaceTrust(workspaceTrustManagementService.isWorkspaceTrusted());
            this.B(workspaceTrustManagementService.onDidChangeTrust(() => configurationService.updateWorkspaceTrust(workspaceTrustManagementService.isWorkspaceTrusted())));
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            //
            // NOTE: Please do NOT register services here. Use `registerSingleton()`
            //       from `workbench.common.main.ts` if the service is shared between
            //       desktop and web or `workbench.desktop.main.ts` if the service
            //       is desktop only.
            //
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            return { serviceCollection, logService, storageService, configurationService };
        }
        m(environmentService) {
            // Return early for when a folder or multi-root is opened
            if (this.a.workspace) {
                return this.a.workspace;
            }
            // Otherwise, workspace is empty, so we derive an identifier
            return (0, workspace_1.$Ph)(this.a.backupPath, environmentService.isExtensionDevelopment);
        }
        async n(workspace, environmentService, userDataProfileService, userDataProfilesService, fileService, remoteAgentService, uriIdentityService, logService, policyService) {
            const configurationCache = new configurationCache_1.$w2b([network_1.Schemas.file, network_1.Schemas.vscodeUserData] /* Cache all non native resources */, environmentService, fileService);
            const workspaceService = new configurationService_1.$v2b({ remoteAuthority: environmentService.remoteAuthority, configurationCache }, environmentService, userDataProfileService, userDataProfilesService, fileService, remoteAgentService, uriIdentityService, logService, policyService);
            try {
                await workspaceService.initialize(workspace);
                return workspaceService;
            }
            catch (error) {
                (0, errors_1.$Y)(error);
                return workspaceService;
            }
        }
        async r(workspace, environmentService, userDataProfileService, userDataProfilesService, mainProcessService) {
            const storageService = new storageService_1.$6$b(workspace, userDataProfileService, userDataProfilesService, mainProcessService, environmentService);
            try {
                await storageService.initialize();
                return storageService;
            }
            catch (error) {
                (0, errors_1.$Y)(error);
                return storageService;
            }
        }
        async s(mainProcessService) {
            const keyboardLayoutService = new nativeKeyboardLayoutService_1.$0$b(mainProcessService);
            try {
                await keyboardLayoutService.initialize();
                return keyboardLayoutService;
            }
            catch (error) {
                (0, errors_1.$Y)(error);
                return keyboardLayoutService;
            }
        }
    }
    exports.$b_b = $b_b;
    function main(configuration) {
        const workbench = new $b_b(configuration);
        return workbench.open();
    }
    exports.main = main;
});
//# sourceMappingURL=desktop.main.js.map