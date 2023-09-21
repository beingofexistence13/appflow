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
define(["require", "exports", "vs/platform/commands/common/commands", "vs/base/common/arrays", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/editor/common/editorService", "vs/base/common/errors", "vs/platform/workspace/common/workspace", "vs/platform/configuration/common/configuration", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/files/common/files", "vs/base/common/resources", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedInput", "vs/workbench/services/environment/common/environmentService", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/product/common/productService", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/nls", "vs/workbench/services/editor/common/editorResolverService"], function (require, exports, commands_1, arrays, instantiation_1, editorService_1, errors_1, workspace_1, configuration_1, workingCopyBackup_1, lifecycle_1, files_1, resources_1, layoutService_1, gettingStartedInput_1, environmentService_1, storage_1, telemetryUtils_1, productService_1, log_1, notification_1, nls_1, editorResolverService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StartupPageContribution = exports.restoreWalkthroughsConfigurationKey = void 0;
    exports.restoreWalkthroughsConfigurationKey = 'workbench.welcomePage.restorableWalkthroughs';
    const configurationKey = 'workbench.startupEditor';
    const oldConfigurationKey = 'workbench.welcome.enabled';
    const telemetryOptOutStorageKey = 'workbench.telemetryOptOutShown';
    let StartupPageContribution = class StartupPageContribution {
        constructor(instantiationService, configurationService, editorService, workingCopyBackupService, fileService, contextService, lifecycleService, layoutService, productService, commandService, environmentService, storageService, logService, notificationService, editorResolverService) {
            this.instantiationService = instantiationService;
            this.configurationService = configurationService;
            this.editorService = editorService;
            this.workingCopyBackupService = workingCopyBackupService;
            this.fileService = fileService;
            this.contextService = contextService;
            this.lifecycleService = lifecycleService;
            this.layoutService = layoutService;
            this.productService = productService;
            this.commandService = commandService;
            this.environmentService = environmentService;
            this.storageService = storageService;
            this.logService = logService;
            this.notificationService = notificationService;
            editorResolverService.registerEditor(`${gettingStartedInput_1.GettingStartedInput.RESOURCE.scheme}:/**`, {
                id: gettingStartedInput_1.GettingStartedInput.ID,
                label: (0, nls_1.localize)('welcome.displayName', "Welcome Page"),
                priority: editorResolverService_1.RegisteredEditorPriority.builtin,
            }, {
                singlePerResource: false,
                canSupportResource: uri => uri.scheme === gettingStartedInput_1.GettingStartedInput.RESOURCE.scheme,
            }, {
                createEditorInput: ({ resource, options }) => {
                    return {
                        editor: this.instantiationService.createInstance(gettingStartedInput_1.GettingStartedInput, options),
                        options: {
                            ...options,
                            pinned: false
                        }
                    };
                }
            });
            this.run().then(undefined, errors_1.onUnexpectedError);
        }
        async run() {
            // Always open Welcome page for first-launch, no matter what is open or which startupEditor is set.
            if (this.productService.enableTelemetry
                && this.productService.showTelemetryOptOut
                && (0, telemetryUtils_1.getTelemetryLevel)(this.configurationService) !== 0 /* TelemetryLevel.NONE */
                && !this.environmentService.skipWelcome
                && !this.storageService.get(telemetryOptOutStorageKey, 0 /* StorageScope.PROFILE */)) {
                this.storageService.store(telemetryOptOutStorageKey, true, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
                await this.openGettingStarted(true);
                return;
            }
            if (this.tryOpenWalkthroughForFolder()) {
                return;
            }
            const enabled = isStartupPageEnabled(this.configurationService, this.contextService, this.environmentService);
            if (enabled && this.lifecycleService.startupKind !== 3 /* StartupKind.ReloadedWindow */) {
                const hasBackups = await this.workingCopyBackupService.hasBackups();
                if (hasBackups) {
                    return;
                }
                // Open the welcome even if we opened a set of default editors
                if (!this.editorService.activeEditor || this.layoutService.openedDefaultEditors) {
                    const startupEditorSetting = this.configurationService.inspect(configurationKey);
                    const isStartupEditorReadme = startupEditorSetting.value === 'readme';
                    const isStartupEditorUserReadme = startupEditorSetting.userValue === 'readme';
                    const isStartupEditorDefaultReadme = startupEditorSetting.defaultValue === 'readme';
                    // 'readme' should not be set in workspace settings to prevent tracking,
                    // but it can be set as a default (as in codespaces or from configurationDefaults) or a user setting
                    if (isStartupEditorReadme && (!isStartupEditorUserReadme || !isStartupEditorDefaultReadme)) {
                        this.logService.warn(`Warning: 'workbench.startupEditor: readme' setting ignored due to being set somewhere other than user or default settings (user=${startupEditorSetting.userValue}, default=${startupEditorSetting.defaultValue})`);
                    }
                    const openWithReadme = isStartupEditorReadme && (isStartupEditorUserReadme || isStartupEditorDefaultReadme);
                    if (openWithReadme) {
                        await this.openReadme();
                    }
                    else if (startupEditorSetting.value === 'welcomePage' || startupEditorSetting.value === 'welcomePageInEmptyWorkbench') {
                        await this.openGettingStarted();
                    }
                }
            }
        }
        tryOpenWalkthroughForFolder() {
            const toRestore = this.storageService.get(exports.restoreWalkthroughsConfigurationKey, 0 /* StorageScope.PROFILE */);
            if (!toRestore) {
                return false;
            }
            else {
                const restoreData = JSON.parse(toRestore);
                const currentWorkspace = this.contextService.getWorkspace();
                if (restoreData.folder === workspace_1.UNKNOWN_EMPTY_WINDOW_WORKSPACE.id || restoreData.folder === currentWorkspace.folders[0].uri.toString()) {
                    this.editorService.openEditor({
                        resource: gettingStartedInput_1.GettingStartedInput.RESOURCE,
                        options: { selectedCategory: restoreData.category, selectedStep: restoreData.step, pinned: false },
                    });
                    this.storageService.remove(exports.restoreWalkthroughsConfigurationKey, 0 /* StorageScope.PROFILE */);
                    return true;
                }
            }
            return false;
        }
        async openReadme() {
            const readmes = arrays.coalesce(await Promise.all(this.contextService.getWorkspace().folders.map(async (folder) => {
                const folderUri = folder.uri;
                const folderStat = await this.fileService.resolve(folderUri).catch(errors_1.onUnexpectedError);
                const files = folderStat?.children ? folderStat.children.map(child => child.name).sort() : [];
                const file = files.find(file => file.toLowerCase() === 'readme.md') || files.find(file => file.toLowerCase().startsWith('readme'));
                if (file) {
                    return (0, resources_1.joinPath)(folderUri, file);
                }
                else {
                    return undefined;
                }
            })));
            if (!this.editorService.activeEditor) {
                if (readmes.length) {
                    const isMarkDown = (readme) => readme.path.toLowerCase().endsWith('.md');
                    await Promise.all([
                        this.commandService.executeCommand('markdown.showPreview', null, readmes.filter(isMarkDown), { locked: true }).catch(error => {
                            this.notificationService.error((0, nls_1.localize)('startupPage.markdownPreviewError', 'Could not open markdown preview: {0}.\n\nPlease make sure the markdown extension is enabled.', error.message));
                        }),
                        this.editorService.openEditors(readmes.filter(readme => !isMarkDown(readme)).map(readme => ({ resource: readme }))),
                    ]);
                }
                else {
                    // If no readme is found, default to showing the welcome page.
                    await this.openGettingStarted();
                }
            }
        }
        async openGettingStarted(showTelemetryNotice) {
            const startupEditorTypeID = gettingStartedInput_1.gettingStartedInputTypeId;
            const editor = this.editorService.activeEditor;
            // Ensure that the welcome editor won't get opened more than once
            if (editor?.typeId === startupEditorTypeID || this.editorService.editors.some(e => e.typeId === startupEditorTypeID)) {
                return;
            }
            const options = editor ? { pinned: false, index: 0 } : { pinned: false };
            if (startupEditorTypeID === gettingStartedInput_1.gettingStartedInputTypeId) {
                this.editorService.openEditor({
                    resource: gettingStartedInput_1.GettingStartedInput.RESOURCE,
                    options: { showTelemetryNotice, ...options },
                });
            }
        }
    };
    exports.StartupPageContribution = StartupPageContribution;
    exports.StartupPageContribution = StartupPageContribution = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, editorService_1.IEditorService),
        __param(3, workingCopyBackup_1.IWorkingCopyBackupService),
        __param(4, files_1.IFileService),
        __param(5, workspace_1.IWorkspaceContextService),
        __param(6, lifecycle_1.ILifecycleService),
        __param(7, layoutService_1.IWorkbenchLayoutService),
        __param(8, productService_1.IProductService),
        __param(9, commands_1.ICommandService),
        __param(10, environmentService_1.IWorkbenchEnvironmentService),
        __param(11, storage_1.IStorageService),
        __param(12, log_1.ILogService),
        __param(13, notification_1.INotificationService),
        __param(14, editorResolverService_1.IEditorResolverService)
    ], StartupPageContribution);
    function isStartupPageEnabled(configurationService, contextService, environmentService) {
        if (environmentService.skipWelcome) {
            return false;
        }
        const startupEditor = configurationService.inspect(configurationKey);
        if (!startupEditor.userValue && !startupEditor.workspaceValue) {
            const welcomeEnabled = configurationService.inspect(oldConfigurationKey);
            if (welcomeEnabled.value !== undefined && welcomeEnabled.value !== null) {
                return welcomeEnabled.value;
            }
        }
        return startupEditor.value === 'welcomePage'
            || startupEditor.value === 'readme' && (startupEditor.userValue === 'readme' || startupEditor.defaultValue === 'readme')
            || (contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ && startupEditor.value === 'welcomePageInEmptyWorkbench');
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcnR1cFBhZ2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi93ZWxjb21lR2V0dGluZ1N0YXJ0ZWQvYnJvd3Nlci9zdGFydHVwUGFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUE0Qm5GLFFBQUEsbUNBQW1DLEdBQUcsOENBQThDLENBQUM7SUFHbEcsTUFBTSxnQkFBZ0IsR0FBRyx5QkFBeUIsQ0FBQztJQUNuRCxNQUFNLG1CQUFtQixHQUFHLDJCQUEyQixDQUFDO0lBQ3hELE1BQU0seUJBQXlCLEdBQUcsZ0NBQWdDLENBQUM7SUFFNUQsSUFBTSx1QkFBdUIsR0FBN0IsTUFBTSx1QkFBdUI7UUFFbkMsWUFDeUMsb0JBQTJDLEVBQzNDLG9CQUEyQyxFQUNsRCxhQUE2QixFQUNsQix3QkFBbUQsRUFDaEUsV0FBeUIsRUFDYixjQUF3QyxFQUMvQyxnQkFBbUMsRUFDN0IsYUFBc0MsRUFDOUMsY0FBK0IsRUFDL0IsY0FBK0IsRUFDbEIsa0JBQWdELEVBQzdELGNBQStCLEVBQ25DLFVBQXVCLEVBQ2QsbUJBQXlDLEVBQ3hELHFCQUE2QztZQWQ3Qix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQzNDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDbEQsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQ2xCLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMkI7WUFDaEUsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDYixtQkFBYyxHQUFkLGNBQWMsQ0FBMEI7WUFDL0MscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUM3QixrQkFBYSxHQUFiLGFBQWEsQ0FBeUI7WUFDOUMsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQy9CLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUNsQix1QkFBa0IsR0FBbEIsa0JBQWtC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