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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/workbench/services/host/browser/host", "vs/platform/configuration/common/configuration", "vs/nls", "vs/platform/workspace/common/workspace", "vs/workbench/services/extensions/common/extensions", "vs/base/common/async", "vs/base/common/resources", "vs/base/common/platform", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/environment/common/environmentService", "vs/platform/product/common/productService"], function (require, exports, lifecycle_1, contributions_1, platform_1, host_1, configuration_1, nls_1, workspace_1, extensions_1, async_1, resources_1, platform_2, dialogs_1, environmentService_1, productService_1) {
    "use strict";
    var SettingsChangeRelauncher_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspaceChangeExtHostRelauncher = exports.SettingsChangeRelauncher = void 0;
    let SettingsChangeRelauncher = class SettingsChangeRelauncher extends lifecycle_1.Disposable {
        static { SettingsChangeRelauncher_1 = this; }
        static { this.SETTINGS = [
            'window.titleBarStyle',
            'window.nativeTabs',
            'window.nativeFullScreen',
            'window.clickThroughInactive',
            'update.mode',
            'editor.accessibilitySupport',
            'security.workspace.trust.enabled',
            'workbench.enableExperiments',
            '_extensionsGallery.enablePPE',
            'security.restrictUNCAccess'
        ]; }
        constructor(hostService, configurationService, productService, dialogService) {
            super();
            this.hostService = hostService;
            this.configurationService = configurationService;
            this.productService = productService;
            this.dialogService = dialogService;
            this.titleBarStyle = new ChangeObserver('string');
            this.nativeTabs = new ChangeObserver('boolean');
            this.nativeFullScreen = new ChangeObserver('boolean');
            this.clickThroughInactive = new ChangeObserver('boolean');
            this.updateMode = new ChangeObserver('string');
            this.workspaceTrustEnabled = new ChangeObserver('boolean');
            this.experimentsEnabled = new ChangeObserver('boolean');
            this.enablePPEExtensionsGallery = new ChangeObserver('boolean');
            this.restrictUNCAccess = new ChangeObserver('boolean');
            this.onConfigurationChange(undefined);
            this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationChange(e)));
        }
        onConfigurationChange(e) {
            if (e && !SettingsChangeRelauncher_1.SETTINGS.some(key => e.affectsConfiguration(key))) {
                return;
            }
            let changed = false;
            function processChanged(didChange) {
                changed = changed || didChange;
            }
            const config = this.configurationService.getValue();
            if (platform_2.isNative) {
                // Titlebar style
                processChanged((config.window.titleBarStyle === 'native' || config.window.titleBarStyle === 'custom') && this.titleBarStyle.handleChange(config.window?.titleBarStyle));
                // macOS: Native tabs
                processChanged(platform_2.isMacintosh && this.nativeTabs.handleChange(config.window?.nativeTabs));
                // macOS: Native fullscreen
                processChanged(platform_2.isMacintosh && this.nativeFullScreen.handleChange(config.window?.nativeFullScreen));
                // macOS: Click through (accept first mouse)
                processChanged(platform_2.isMacintosh && this.clickThroughInactive.handleChange(config.window?.clickThroughInactive));
                // Update mode
                processChanged(this.updateMode.handleChange(config.update?.mode));
                // On linux turning on accessibility support will also pass this flag to the chrome renderer, thus a restart is required
                if (platform_2.isLinux && typeof config.editor?.accessibilitySupport === 'string' && config.editor.accessibilitySupport !== this.accessibilitySupport) {
                    this.accessibilitySupport = config.editor.accessibilitySupport;
                    if (this.accessibilitySupport === 'on') {
                        changed = true;
                    }
                }
                // Workspace trust
                processChanged(this.workspaceTrustEnabled.handleChange(config?.security?.workspace?.trust?.enabled));
                // UNC host access restrictions
                processChanged(this.restrictUNCAccess.handleChange(config?.security?.restrictUNCAccess));
            }
            // Experiments
            processChanged(this.experimentsEnabled.handleChange(config.workbench?.enableExperiments));
            // Profiles
            processChanged(this.productService.quality !== 'stable' && this.enablePPEExtensionsGallery.handleChange(config._extensionsGallery?.enablePPE));
            // Notify only when changed from an event and the change
            // was not triggerd programmatically (e.g. from experiments)
            if (changed && e && e.source !== 7 /* ConfigurationTarget.DEFAULT */) {
                this.doConfirm(platform_2.isNative ?
                    (0, nls_1.localize)('relaunchSettingMessage', "A setting has changed that requires a restart to take effect.") :
                    (0, nls_1.localize)('relaunchSettingMessageWeb', "A setting has changed that requires a reload to take effect."), platform_2.isNative ?
                    (0, nls_1.localize)('relaunchSettingDetail', "Press the restart button to restart {0} and enable the setting.", this.productService.nameLong) :
                    (0, nls_1.localize)('relaunchSettingDetailWeb', "Press the reload button to reload {0} and enable the setting.", this.productService.nameLong), platform_2.isNative ?
                    (0, nls_1.localize)({ key: 'restart', comment: ['&& denotes a mnemonic'] }, "&&Restart") :
                    (0, nls_1.localize)({ key: 'restartWeb', comment: ['&& denotes a mnemonic'] }, "&&Reload"), () => this.hostService.restart());
            }
        }
        async doConfirm(message, detail, primaryButton, confirmedFn) {
            if (this.hostService.hasFocus) {
                const { confirmed } = await this.dialogService.confirm({ message, detail, primaryButton });
                if (confirmed) {
                    confirmedFn();
                }
            }
        }
    };
    exports.SettingsChangeRelauncher = SettingsChangeRelauncher;
    exports.SettingsChangeRelauncher = SettingsChangeRelauncher = SettingsChangeRelauncher_1 = __decorate([
        __param(0, host_1.IHostService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, productService_1.IProductService),
        __param(3, dialogs_1.IDialogService)
    ], SettingsChangeRelauncher);
    class ChangeObserver {
        static create(typeName) {
            return new ChangeObserver(typeName);
        }
        constructor(typeName) {
            this.typeName = typeName;
            this.lastValue = undefined;
        }
        /**
         * Returns if there was a change compared to the last value
         */
        handleChange(value) {
            if (typeof value === this.typeName && value !== this.lastValue) {
                this.lastValue = value;
                return true;
            }
            return false;
        }
    }
    let WorkspaceChangeExtHostRelauncher = class WorkspaceChangeExtHostRelauncher extends lifecycle_1.Disposable {
        constructor(contextService, extensionService, hostService, environmentService) {
            super();
            this.contextService = contextService;
            this.extensionHostRestarter = this._register(new async_1.RunOnceScheduler(async () => {
                if (!!environmentService.extensionTestsLocationURI) {
                    return; // no restart when in tests: see https://github.com/microsoft/vscode/issues/66936
                }
                if (environmentService.remoteAuthority) {
                    hostService.reload(); // TODO@aeschli, workaround
                }
                else if (platform_2.isNative) {
                    const stopped = await extensionService.stopExtensionHosts((0, nls_1.localize)('restartExtensionHost.reason', "Restarting extension host due to a workspace folder change."));
                    if (stopped) {
                        extensionService.startExtensionHosts();
                    }
                }
            }, 10));
            this.contextService.getCompleteWorkspace()
                .then(workspace => {
                this.firstFolderResource = workspace.folders.length > 0 ? workspace.folders[0].uri : undefined;
                this.handleWorkbenchState();
                this._register(this.contextService.onDidChangeWorkbenchState(() => setTimeout(() => this.handleWorkbenchState())));
            });
            this._register((0, lifecycle_1.toDisposable)(() => {
                this.onDidChangeWorkspaceFoldersUnbind?.dispose();
            }));
        }
        handleWorkbenchState() {
            // React to folder changes when we are in workspace state
            if (this.contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
                // Update our known first folder path if we entered workspace
                const workspace = this.contextService.getWorkspace();
                this.firstFolderResource = workspace.folders.length > 0 ? workspace.folders[0].uri : undefined;
                // Install workspace folder listener
                if (!this.onDidChangeWorkspaceFoldersUnbind) {
                    this.onDidChangeWorkspaceFoldersUnbind = this.contextService.onDidChangeWorkspaceFolders(() => this.onDidChangeWorkspaceFolders());
                }
            }
            // Ignore the workspace folder changes in EMPTY or FOLDER state
            else {
                (0, lifecycle_1.dispose)(this.onDidChangeWorkspaceFoldersUnbind);
                this.onDidChangeWorkspaceFoldersUnbind = undefined;
            }
        }
        onDidChangeWorkspaceFolders() {
            const workspace = this.contextService.getWorkspace();
            // Restart extension host if first root folder changed (impact on deprecated workspace.rootPath API)
            const newFirstFolderResource = workspace.folders.length > 0 ? workspace.folders[0].uri : undefined;
            if (!(0, resources_1.isEqual)(this.firstFolderResource, newFirstFolderResource)) {
                this.firstFolderResource = newFirstFolderResource;
                this.extensionHostRestarter.schedule(); // buffer calls to extension host restart
            }
        }
    };
    exports.WorkspaceChangeExtHostRelauncher = WorkspaceChangeExtHostRelauncher;
    exports.WorkspaceChangeExtHostRelauncher = WorkspaceChangeExtHostRelauncher = __decorate([
        __param(0, workspace_1.IWorkspaceContextService),
        __param(1, extensions_1.IExtensionService),
        __param(2, host_1.IHostService),
        __param(3, environmentService_1.IWorkbenchEnvironmentService)
    ], WorkspaceChangeExtHostRelauncher);
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(SettingsChangeRelauncher, 3 /* LifecyclePhase.Restored */);
    workbenchRegistry.registerWorkbenchContribution(WorkspaceChangeExtHostRelauncher, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsYXVuY2hlci5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9yZWxhdW5jaGVyL2Jyb3dzZXIvcmVsYXVuY2hlci5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQThCekYsSUFBTSx3QkFBd0IsR0FBOUIsTUFBTSx3QkFBeUIsU0FBUSxzQkFBVTs7aUJBRXhDLGFBQVEsR0FBRztZQUN6QixzQkFBc0I7WUFDdEIsbUJBQW1CO1lBQ25CLHlCQUF5QjtZQUN6Qiw2QkFBNkI7WUFDN0IsYUFBYTtZQUNiLDZCQUE2QjtZQUM3QixrQ0FBa0M7WUFDbEMsNkJBQTZCO1lBQzdCLDhCQUE4QjtZQUM5Qiw0QkFBNEI7U0FDNUIsQUFYc0IsQ0FXckI7UUFhRixZQUNlLFdBQTBDLEVBQ2pDLG9CQUE0RCxFQUNsRSxjQUFnRCxFQUNqRCxhQUE4QztZQUU5RCxLQUFLLEVBQUUsQ0FBQztZQUx1QixnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUNoQix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ2pELG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUNoQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFmOUMsa0JBQWEsR0FBRyxJQUFJLGNBQWMsQ0FBc0IsUUFBUSxDQUFDLENBQUM7WUFDbEUsZUFBVSxHQUFHLElBQUksY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzNDLHFCQUFnQixHQUFHLElBQUksY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2pELHlCQUFvQixHQUFHLElBQUksY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3JELGVBQVUsR0FBRyxJQUFJLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUUxQywwQkFBcUIsR0FBRyxJQUFJLGNBQWMsQ0FBQyxTQUFT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