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
define(["require", "exports", "vs/nls", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStarted", "vs/platform/registry/common/platform", "vs/workbench/common/editor", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/instantiation", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/editor/common/editorService", "vs/workbench/browser/editor", "vs/platform/instantiation/common/descriptors", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedService", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedInput", "vs/workbench/common/contributions", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/configuration", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/commands/common/commands", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/remote/common/remoteAgentService", "vs/base/common/platform", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensions/common/extensions", "vs/workbench/contrib/welcomeGettingStarted/browser/startupPage", "vs/workbench/contrib/extensions/common/extensionsInput", "vs/platform/action/common/actionCommonCategories", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedIcons"], function (require, exports, nls_1, gettingStarted_1, platform_1, editor_1, actions_1, instantiation_1, contextkey_1, editorService_1, editor_2, descriptors_1, gettingStartedService_1, gettingStartedInput_1, contributions_1, configurationRegistry_1, configuration_1, editorGroupsService_1, commands_1, quickInput_1, remoteAgentService_1, platform_2, extensionManagement_1, extensions_1, startupPage_1, extensionsInput_1, actionCommonCategories_1, icons) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspacePlatform = exports.icons = void 0;
    exports.icons = icons;
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.openWalkthrough',
                title: { value: (0, nls_1.localize)('miWelcome', "Welcome"), original: 'Welcome' },
                category: actionCommonCategories_1.Categories.Help,
                f1: true,
                menu: {
                    id: actions_1.MenuId.MenubarHelpMenu,
                    group: '1_welcome',
                    order: 1,
                }
            });
        }
        run(accessor, walkthroughID, toSide) {
            const editorGroupsService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const editorService = accessor.get(editorService_1.IEditorService);
            const commandService = accessor.get(commands_1.ICommandService);
            if (walkthroughID) {
                const selectedCategory = typeof walkthroughID === 'string' ? walkthroughID : walkthroughID.category;
                const selectedStep = typeof walkthroughID === 'string' ? undefined : walkthroughID.step;
                // Try first to select the walkthrough on an active welcome page with no selected walkthrough
                for (const group of editorGroupsService.groups) {
                    if (group.activeEditor instanceof gettingStartedInput_1.GettingStartedInput) {
                        group.activeEditorPane.makeCategoryVisibleWhenAvailable(selectedCategory, selectedStep);
                        return;
                    }
                }
                // Otherwise, try to find a welcome input somewhere with no selected walkthrough, and open it to this one.
                const result = editorService.findEditors({ typeId: gettingStartedInput_1.GettingStartedInput.ID, editorId: undefined, resource: gettingStartedInput_1.GettingStartedInput.RESOURCE });
                for (const { editor, groupId } of result) {
                    if (editor instanceof gettingStartedInput_1.GettingStartedInput) {
                        const group = editorGroupsService.getGroup(groupId);
                        if (!editor.selectedCategory && group) {
                            editor.selectedCategory = selectedCategory;
                            editor.selectedStep = selectedStep;
                            group.openEditor(editor, { revealIfOpened: true });
                            return;
                        }
                    }
                }
                const activeEditor = editorService.activeEditor;
                // If the walkthrough is already open just reveal the step
                if (selectedStep && activeEditor instanceof gettingStartedInput_1.GettingStartedInput && activeEditor.selectedCategory === selectedCategory) {
                    commandService.executeCommand('walkthroughs.selectStep', selectedStep);
                    return;
                }
                // If it's the extension install page then lets replace it with the getting started page
                if (activeEditor instanceof extensionsInput_1.ExtensionsInput) {
                    const activeGroup = editorGroupsService.activeGroup;
                    activeGroup.replaceEditors([{
                            editor: activeEditor,
                            replacement: instantiationService.createInstance(gettingStartedInput_1.GettingStartedInput, { selectedCategory: selectedCategory, selectedStep: selectedStep })
                        }]);
                }
                else {
                    // else open respecting toSide
                    editorService.openEditor({
                        resource: gettingStartedInput_1.GettingStartedInput.RESOURCE,
                        options: { selectedCategory: selectedCategory, selectedStep: selectedStep, preserveFocus: toSide ?? false }
                    }).then((editor) => {
                        editor?.makeCategoryVisibleWhenAvailable(selectedCategory, selectedStep);
                    });
                }
            }
            else {
                editorService.openEditor({ resource: gettingStartedInput_1.GettingStartedInput.RESOURCE });
            }
        }
    });
    platform_1.Registry.as(editor_1.EditorExtensions.EditorFactory).registerEditorSerializer(gettingStartedInput_1.GettingStartedInput.ID, gettingStarted_1.GettingStartedInputSerializer);
    platform_1.Registry.as(editor_1.EditorExtensions.EditorPane).registerEditorPane(editor_2.EditorPaneDescriptor.create(gettingStarted_1.GettingStartedPage, gettingStarted_1.GettingStartedPage.ID, (0, nls_1.localize)('welcome', "Welcome")), [
        new descriptors_1.SyncDescriptor(gettingStartedInput_1.GettingStartedInput)
    ]);
    const category = { value: (0, nls_1.localize)('welcome', "Welcome"), original: 'Welcome' };
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'welcome.goBack',
                title: { value: (0, nls_1.localize)('welcome.goBack', "Go Back"), original: 'Go Back' },
                category,
                keybinding: {
                    weight: 100 /* KeybindingWeight.EditorContrib */,
                    primary: 9 /* KeyCode.Escape */,
                    when: gettingStarted_1.inWelcomeContext
                },
                precondition: contextkey_1.ContextKeyExpr.equals('activeEditor', 'gettingStartedPage'),
                f1: true
            });
        }
        run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const editorPane = editorService.activeEditorPane;
            if (editorPane instanceof gettingStarted_1.GettingStartedPage) {
                editorPane.escape();
            }
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: 'walkthroughs.selectStep',
        handler: (accessor, stepID) => {
            const editorService = accessor.get(editorService_1.IEditorService);
            const editorPane = editorService.activeEditorPane;
            if (editorPane instanceof gettingStarted_1.GettingStartedPage) {
                editorPane.selectStepLoose(stepID);
            }
            else {
                console.error('Cannot run walkthroughs.selectStep outside of walkthrough context');
            }
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'welcome.markStepComplete',
                title: (0, nls_1.localize)('welcome.markStepComplete', "Mark Step Complete"),
                category,
            });
        }
        run(accessor, arg) {
            if (!arg) {
                return;
            }
            const gettingStartedService = accessor.get(gettingStartedService_1.IWalkthroughsService);
            gettingStartedService.progressStep(arg);
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'welcome.markStepIncomplete',
                title: (0, nls_1.localize)('welcome.markStepInomplete', "Mark Step Incomplete"),
                category,
            });
        }
        run(accessor, arg) {
            if (!arg) {
                return;
            }
            const gettingStartedService = accessor.get(gettingStartedService_1.IWalkthroughsService);
            gettingStartedService.deprogressStep(arg);
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'welcome.showAllWalkthroughs',
                title: { value: (0, nls_1.localize)('welcome.showAllWalkthroughs', "Open Walkthrough..."), original: 'Open Walkthrough...' },
                category,
                f1: true,
            });
        }
        async getQuickPickItems(contextService, gettingStartedService) {
            const categories = await gettingStartedService.getWalkthroughs();
            return categories
                .filter(c => contextService.contextMatchesRules(c.when))
                .map(x => ({
                id: x.id,
                label: x.title,
                detail: x.description,
                description: x.source,
            }));
        }
        async run(accessor) {
            const commandService = accessor.get(commands_1.ICommandService);
            const contextService = accessor.get(contextkey_1.IContextKeyService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const gettingStartedService = accessor.get(gettingStartedService_1.IWalkthroughsService);
            const extensionService = accessor.get(extensions_1.IExtensionService);
            const quickPick = quickInputService.createQuickPick();
            quickPick.canSelectMany = false;
            quickPick.matchOnDescription = true;
            quickPick.matchOnDetail = true;
            quickPick.placeholder = (0, nls_1.localize)('pickWalkthroughs', 'Select a walkthrough to open');
            quickPick.items = await this.getQuickPickItems(contextService, gettingStartedService);
            quickPick.busy = true;
            quickPick.onDidAccept(() => {
                const selection = quickPick.selectedItems[0];
                if (selection) {
                    commandService.executeCommand('workbench.action.openWalkthrough', selection.id);
                }
                quickPick.hide();
            });
            quickPick.onDidHide(() => quickPick.dispose());
            await extensionService.whenInstalledExtensionsRegistered();
            gettingStartedService.onDidAddWalkthrough(async () => {
                quickPick.items = await this.getQuickPickItems(contextService, gettingStartedService);
            });
            quickPick.show();
            quickPick.busy = false;
        }
    });
    exports.WorkspacePlatform = new contextkey_1.RawContextKey('workspacePlatform', undefined, (0, nls_1.localize)('workspacePlatform', "The platform of the current workspace, which in remote or serverless contexts may be different from the platform of the UI"));
    let WorkspacePlatformContribution = class WorkspacePlatformContribution {
        constructor(extensionManagementServerService, remoteAgentService, contextService) {
            this.extensionManagementServerService = extensionManagementServerService;
            this.remoteAgentService = remoteAgentService;
            this.contextService = contextService;
            this.remoteAgentService.getEnvironment().then(env => {
                const remoteOS = env?.os;
                const remotePlatform = remoteOS === 2 /* OS.Macintosh */ ? 'mac'
                    : remoteOS === 1 /* OS.Windows */ ? 'windows'
                        : remoteOS === 3 /* OS.Linux */ ? 'linux'
                            : undefined;
                if (remotePlatform) {
                    exports.WorkspacePlatform.bindTo(this.contextService).set(remotePlatform);
                }
                else if (this.extensionManagementServerService.localExtensionManagementServer) {
                    if (platform_2.isMacintosh) {
                        exports.WorkspacePlatform.bindTo(this.contextService).set('mac');
                    }
                    else if (platform_2.isLinux) {
                        exports.WorkspacePlatform.bindTo(this.contextService).set('linux');
                    }
                    else if (platform_2.isWindows) {
                        exports.WorkspacePlatform.bindTo(this.contextService).set('windows');
                    }
                }
                else if (this.extensionManagementServerService.webExtensionManagementServer) {
                    exports.WorkspacePlatform.bindTo(this.contextService).set('webworker');
                }
                else {
                    console.error('Error: Unable to detect workspace platform');
                }
            });
        }
    };
    WorkspacePlatformContribution = __decorate([
        __param(0, extensionManagement_1.IExtensionManagementServerService),
        __param(1, remoteAgentService_1.IRemoteAgentService),
        __param(2, contextkey_1.IContextKeyService)
    ], WorkspacePlatformContribution);
    platform_1.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(WorkspacePlatformContribution, 3 /* LifecyclePhase.Restored */);
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        ...configuration_1.workbenchConfigurationNodeBase,
        properties: {
            'workbench.welcomePage.walkthroughs.openOnInstall': {
                scope: 2 /* ConfigurationScope.MACHINE */,
                type: 'boolean',
                default: true,
                description: (0, nls_1.localize)('workbench.welcomePage.walkthroughs.openOnInstall', "When enabled, an extension's walkthrough will open upon install of the extension.")
            },
            'workbench.startupEditor': {
                'scope': 4 /* ConfigurationScope.RESOURCE */,
                'type': 'string',
                'enum': ['none', 'welcomePage', 'readme', 'newUntitledFile', 'welcomePageInEmptyWorkbench'],
                'enumDescriptions': [
                    (0, nls_1.localize)({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'workbench.startupEditor.none' }, "Start without an editor."),
                    (0, nls_1.localize)({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'workbench.startupEditor.welcomePage' }, "Open the Welcome page, with content to aid in getting started with VS Code and extensions."),
                    (0, nls_1.localize)({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'workbench.startupEditor.readme' }, "Open the README when opening a folder that contains one, fallback to 'welcomePage' otherwise. Note: This is only observed as a global configuration, it will be ignored if set in a workspace or folder configuration."),
                    (0, nls_1.localize)({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'workbench.startupEditor.newUntitledFile' }, "Open a new untitled text file (only applies when opening an empty window)."),
                    (0, nls_1.localize)({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'workbench.startupEditor.welcomePageInEmptyWorkbench' }, "Open the Welcome page when opening an empty workbench."),
                ],
                'default': 'welcomePage',
                'description': (0, nls_1.localize)('workbench.startupEditor', "Controls which editor is shown at startup, if none are restored from the previous session.")
            },
            'workbench.welcomePage.preferReducedMotion': {
                scope: 1 /* ConfigurationScope.APPLICATION */,
                type: 'boolean',
                default: false,
                deprecationMessage: (0, nls_1.localize)('deprecationMessage', "Deprecated, use the global `workbench.reduceMotion`."),
                description: (0, nls_1.localize)('workbench.welcomePage.preferReducedMotion', "When enabled, reduce motion in welcome page.")
            }
        }
    });
    platform_1.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(startupPage_1.StartupPageContribution, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0dGluZ1N0YXJ0ZWQuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvd2VsY29tZUdldHRpbmdTdGFydGVkL2Jyb3dzZXIvZ2V0dGluZ1N0YXJ0ZWQuY29udHJpYnV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQStCaEcsc0JBQWdHO0lBRWhHLElBQUEseUJBQWUsRUFBQyxLQUFNLFNBQVEsaUJBQU87UUFDcEM7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLGtDQUFrQztnQkFDdEMsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFO2dCQUN2RSxRQUFRLEVBQUUsbUNBQVUsQ0FBQyxJQUFJO2dCQUN6QixFQUFFLEVBQUUsSUFBSTtnQkFDUixJQUFJLEVBQUU7b0JBQ0wsRUFBRSxFQUFFLGdCQUFNLENBQUMsZUFBZTtvQkFDMUIsS0FBSyxFQUFFLFdBQVc7b0JBQ2xCLEtBQUssRUFBRSxDQUFDO2lCQUNSO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVNLEdBQUcsQ0FDVCxRQUEwQixFQUMxQixhQUFzRSxFQUN0RSxNQUEyQjtZQUUzQixNQUFNLG1CQUFtQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMENBQW9CLENBQUMsQ0FBQztZQUMvRCxNQUFNLG9CQUFvQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUNBQXFCLENBQUMsQ0FBQztZQUNqRSxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFjLENBQUMsQ0FBQztZQUNuRCxNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDBCQUFlLENBQUMsQ0FBQztZQUVyRCxJQUFJLGFBQWEsRUFBRTtnQkFDbEIsTUFBTSxnQkFBZ0IsR0FBRyxPQUFPLGFBQWEsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQztnQkFDcEcsTUFBTSxZQUFZLEdBQUcsT0FBTyxhQUFhLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUM7Z0JBRXhGLDZGQUE2RjtnQkFDN0YsS0FBSyxNQUFNLEtBQUssSUFBSSxtQkFBbUIsQ0FBQyxNQUFNLEVBQUU7b0JBQy9DLElBQUksS0FBSyxDQUFDLFlBQVksWUFBWSx5Q0FBbUIsRUFBRTt3QkFDckQsS0FBSyxDQUFDLGdCQUF1QyxDQUFDLGdDQUFnQyxDQUFDLGdCQUFnQixFQUFFLFlBQVksQ0FBQyxDQUFDO3dCQUNoSCxPQUFPO3FCQUNQO2lCQUNEO2dCQUVELDBHQUEwRztnQkFDMUcsTUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDLFdBQVcsQ0FBQyxFQUFFLE1BQU0sRUFBRSx5Q0FBbUIsQ0FBQyxFQUFFLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUseUNBQW1CLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztnQkFDMUksS0FBSyxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLE1BQU0sRUFBRTtvQkFDekMsSUFBSSxNQUFNLFlBQVkseUNBQW1CLEVBQUU7d0JBQzFDLE1BQU0sS0FBSyxHQUFHLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDcEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsSUFBSSxLQUFLLEVBQUU7NEJBQ3RDLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQzs0QkFDM0MsTUFBTSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7NEJBQ25DLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7NEJBQ25ELE9BQU87eUJBQ1A7cUJBQ0Q7aUJBQ0Q7Z0JBRUQsTUFBTSxZQUFZLEdBQUcsYUFBYSxDQUFDLFlBQVksQ0FBQztnQkFDaEQsMERBQTBEO2dCQUMxRCxJQUFJLFlBQVksSUFBSSxZQUFZLFlBQVkseUNBQW1CLElBQUksWUFBWSxDQUFDLGdCQUFnQixLQUFLLGdCQUFnQixFQUFFO29CQUN0SCxjQUFjLENBQUMsY0FBYyxDQUFDLHlCQUF5QixFQUFFLFlBQVksQ0FBQyxDQUFDO29CQUN2RSxPQUFPO2lCQUNQO2dCQUVELHdGQUF3RjtnQkFDeEYsSUFBSSxZQUFZLFlBQVksaUNBQWUsRUFBRTtvQkFDNUMsTUFBTSxXQUFXLEdBQUcsbUJBQW1CLENBQUMsV0FBVyxDQUFDO29CQUNwRCxXQUFXLENBQUMsY0FBYyxDQUFDLENBQUM7NEJBQzNCLE1BQU0sRUFBRSxZQUFZOzRCQUNwQixXQUFXLEVBQUUsb0JBQW9CLENBQUMsY0FBYyxDQUFDLHlDQUFtQixFQUFFLEVBQUUsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxDQUFDO3lCQUN6SSxDQUFDLENBQUMsQ0FBQztpQkFDSjtxQkFBTTtvQkFDTiw4QkFBOEI7b0JBQzlCLGFBQWEsQ0FBQyxVQUFVLENBQUM7d0JBQ3hCLFFBQVEsRUFBRSx5Q0FBbUIsQ0FBQyxRQUFRO3dCQUN0QyxPQUFPLEVBQStCLEVBQUUsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxhQUFhLEVBQUUsTUFBTSxJQUFJLEtBQUssRUFBRTtxQkFDeEksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO3dCQUNqQixNQUE2QixFQUFFLGdDQUFnQyxDQUFDLGdCQUFnQixFQUFFLFlBQVksQ0FBQyxDQUFDO29CQUNsRyxDQUFDLENBQUMsQ0FBQztpQkFFSDthQUNEO2lCQUFNO2dCQUNOLGFBQWEsQ0FBQyxVQUFVLENBQUMsRUFBRSxRQUFRLEVBQUUseUNBQW1CLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQzthQUNyRTtRQUNGLENBQUM7S0FDRCxDQUFDLENBQUM7SUFFSCxtQkFBUSxDQUFDLEVBQUUsQ0FBeUIseUJBQWdCLENBQUMsYUFBYSxDQUFDLENBQUMsd0JBQXdCLENBQUMseUNBQW1CLENBQUMsRUFBRSxFQUFFLDhDQUE2QixDQUFDLENBQUM7SUFDcEosbUJBQVEsQ0FBQyxFQUFFLENBQXNCLHlCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDLGtCQUFrQixDQUMvRSw2QkFBb0IsQ0FBQyxNQUFNLENBQzFCLG1DQUFrQixFQUNsQixtQ0FBa0IsQ0FBQyxFQUFFLEVBQ3JCLElBQUEsY0FBUSxFQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FDOUIsRUFDRDtRQUNDLElBQUksNEJBQWMsQ0FBQyx5Q0FBbUIsQ0FBQztLQUN2QyxDQUNELENBQUM7SUFFRixNQUFNLFFBQVEsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxDQUFDO0lBRWhGLElBQUEseUJBQWUsRUFBQyxLQUFNLFNBQVEsaUJBQU87UUFDcEM7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLGdCQUFnQjtnQkFDcEIsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGdCQUFnQixFQUFFLFNBQVMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUU7Z0JBQzVFLFFBQVE7Z0JBQ1IsVUFBVSxFQUFFO29CQUNYLE1BQU0sMENBQWdDO29CQUN0QyxPQUFPLHdCQUFnQjtvQkFDdkIsSUFBSSxFQUFFLGlDQUFnQjtpQkFDdEI7Z0JBQ0QsWUFBWSxFQUFFLDJCQUFjLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxvQkFBb0IsQ0FBQztnQkFDekUsRUFBRSxFQUFFLElBQUk7YUFDUixDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsR0FBRyxDQUFDLFFBQTBCO1lBQzdCLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsOEJBQWMsQ0FBQyxDQUFDO1lBQ25ELE1BQU0sVUFBVSxHQUFHLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQztZQUNsRCxJQUFJLFVBQVUsWUFBWSxtQ0FBa0IsRUFBRTtnQkFDN0MsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQ3BCO1FBQ0YsQ0FBQztLQUNELENBQUMsQ0FBQztJQUVILDJCQUFnQixDQUFDLGVBQWUsQ0FBQztRQUNoQyxFQUFFLEVBQUUseUJBQXlCO1FBQzdCLE9BQU8sRUFBRSxDQUFDLFFBQVEsRUFBRSxNQUFjLEVBQUUsRUFBRTtZQUNyQyxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFjLENBQUMsQ0FBQztZQUNuRCxNQUFNLFVBQVUsR0FBRyxhQUFhLENBQUMsZ0JBQWdCLENBQUM7WUFDbEQsSUFBSSxVQUFVLFlBQVksbUNBQWtCLEVBQUU7Z0JBQzdDLFVBQVUsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDbkM7aUJBQU07Z0JBQ04sT0FBTyxDQUFDLEtBQUssQ0FBQyxtRUFBbUUsQ0FBQyxDQUFDO2FBQ25GO1FBQ0YsQ0FBQztLQUNELENBQUMsQ0FBQztJQUVILElBQUEseUJBQWUsRUFBQyxLQUFNLFNBQVEsaUJBQU87UUFDcEM7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLDBCQUEwQjtnQkFDOUIsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLDBCQUEwQixFQUFFLG9CQUFvQixDQUFDO2dCQUNqRSxRQUFRO2FBQ1IsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEdBQUcsQ0FBQyxRQUEwQixFQUFFLEdBQVc7WUFDMUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFBRSxPQUFPO2FBQUU7WUFDckIsTUFBTSxxQkFBcUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDRDQUFvQixDQUFDLENBQUM7WUFDakUscUJBQXFCLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3pDLENBQUM7S0FDRCxDQUFDLENBQUM7SUFFSCxJQUFBLHlCQUFlLEVBQUMsS0FBTSxTQUFRLGlCQUFPO1FBQ3BDO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSw0QkFBNEI7Z0JBQ2hDLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQywyQkFBMkIsRUFBRSxzQkFBc0IsQ0FBQztnQkFDcEUsUUFBUTthQUNSLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxHQUFHLENBQUMsUUFBMEIsRUFBRSxHQUFXO1lBQzFDLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQUUsT0FBTzthQUFFO1lBQ3JCLE1BQU0scUJBQXFCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw0Q0FBb0IsQ0FBQyxDQUFDO1lBQ2pFLHFCQUFxQixDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMzQyxDQUFDO0tBQ0QsQ0FBQyxDQUFDO0lBRUgsSUFBQSx5QkFBZSxFQUFDLEtBQU0sU0FBUSxpQkFBTztRQUNwQztZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsNkJBQTZCO2dCQUNqQyxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsNkJBQTZCLEVBQUUscUJBQXFCLENBQUMsRUFBRSxRQUFRLEVBQUUscUJBQXFCLEVBQUU7Z0JBQ2pILFFBQVE7Z0JBQ1IsRUFBRSxFQUFFLElBQUk7YUFDUixDQUFDLENBQUM7UUFDSixDQUFDO1FBRU8sS0FBSyxDQUFDLGlCQUFpQixDQUM5QixjQUFrQyxFQUNsQyxxQkFBMkM7WUFFM0MsTUFBTSxVQUFVLEdBQUcsTUFBTSxxQkFBcUIsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUNqRSxPQUFPLFVBQVU7aUJBQ2YsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsY0FBYyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDdkQsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDVixFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUU7Z0JBQ1IsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLO2dCQUNkLE1BQU0sRUFBRSxDQUFDLENBQUMsV0FBVztnQkFDckIsV0FBVyxFQUFFLENBQUMsQ0FBQyxNQUFNO2FBQ3JCLENBQUMsQ0FBQyxDQUFDO1FBQ04sQ0FBQztRQUVELEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEI7WUFDbkMsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywwQkFBZSxDQUFDLENBQUM7WUFDckQsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywrQkFBa0IsQ0FBQyxDQUFDO1lBQ3hELE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywrQkFBa0IsQ0FBQyxDQUFDO1lBQzNELE1BQU0scUJBQXFCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw0Q0FBb0IsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4QkFBaUIsQ0FBQyxDQUFDO1lBRXpELE1BQU0sU0FBUyxHQUFHLGlCQUFpQixDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3RELFNBQVMsQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO1lBQ2hDLFNBQVMsQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7WUFDcEMsU0FBUyxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7WUFDL0IsU0FBUyxDQUFDLFdBQVcsR0FBRyxJQUFBLGNBQVEsRUFBQyxrQkFBa0IsRUFBRSw4QkFBOEIsQ0FBQyxDQUFDO1lBQ3JGLFNBQVMsQ0FBQyxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsY0FBYyxFQUFFLHFCQUFxQixDQUFDLENBQUM7WUFDdEYsU0FBUyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7WUFDdEIsU0FBUyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUU7Z0JBQzFCLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzdDLElBQUksU0FBUyxFQUFFO29CQUNkLGNBQWMsQ0FBQyxjQUFjLENBQUMsa0NBQWtDLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUNoRjtnQkFDRCxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDbEIsQ0FBQyxDQUFDLENBQUM7WUFDSCxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sZ0JBQWdCLENBQUMsaUNBQWlDLEVBQUUsQ0FBQztZQUMzRCxxQkFBcUIsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFDcEQsU0FBUyxDQUFDLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLEVBQUUscUJBQXFCLENBQUMsQ0FBQztZQUN2RixDQUFDLENBQUMsQ0FBQztZQUNILFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNqQixTQUFTLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztRQUN4QixDQUFDO0tBQ0QsQ0FBQyxDQUFDO0lBRVUsUUFBQSxpQkFBaUIsR0FBRyxJQUFJLDBCQUFhLENBQXdELG1CQUFtQixFQUFFLFNBQVMsRUFBRSxJQUFBLGNBQVEsRUFBQyxtQkFBbUIsRUFBRSw0SEFBNEgsQ0FBQyxDQUFDLENBQUM7SUFDdlMsSUFBTSw2QkFBNkIsR0FBbkMsTUFBTSw2QkFBNkI7UUFDbEMsWUFDcUQsZ0NBQW1FLEVBQ2pGLGtCQUF1QyxFQUN4QyxjQUFrQztZQUZuQixxQ0FBZ0MsR0FBaEMsZ0NBQWdDLENBQW1DO1lBQ2pGLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFDeEMsbUJBQWMsR0FBZCxjQUFjLENBQW9CO1lBRXZFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ25ELE1BQU0sUUFBUSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUM7Z0JBRXpCLE1BQU0sY0FBYyxHQUFHLFFBQVEseUJBQWlCLENBQUMsQ0FBQyxDQUFDLEtBQUs7b0JBQ3ZELENBQUMsQ0FBQyxRQUFRLHVCQUFlLENBQUMsQ0FBQyxDQUFDLFNBQVM7d0JBQ3BDLENBQUMsQ0FBQyxRQUFRLHFCQUFhLENBQUMsQ0FBQyxDQUFDLE9BQU87NEJBQ2hDLENBQUMsQ0FBQyxTQUFTLENBQUM7Z0JBRWYsSUFBSSxjQUFjLEVBQUU7b0JBQ25CLHlCQUFpQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2lCQUNsRTtxQkFBTSxJQUFJLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyw4QkFBOEIsRUFBRTtvQkFDaEYsSUFBSSxzQkFBVyxFQUFFO3dCQUNoQix5QkFBaUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztxQkFDekQ7eUJBQU0sSUFBSSxrQkFBTyxFQUFFO3dCQUNuQix5QkFBaUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztxQkFDM0Q7eUJBQU0sSUFBSSxvQkFBUyxFQUFFO3dCQUNyQix5QkFBaUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztxQkFDN0Q7aUJBQ0Q7cUJBQU0sSUFBSSxJQUFJLENBQUMsZ0NBQWdDLENBQUMsNEJBQTRCLEVBQUU7b0JBQzlFLHlCQUFpQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2lCQUMvRDtxQkFBTTtvQkFDTixPQUFPLENBQUMsS0FBSyxDQUFDLDRDQUE0QyxDQUFDLENBQUM7aUJBQzVEO1lBQ0YsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO0tBQ0QsQ0FBQTtJQS9CSyw2QkFBNkI7UUFFaEMsV0FBQSx1REFBaUMsQ0FBQTtRQUNqQyxXQUFBLHdDQUFtQixDQUFBO1FBQ25CLFdBQUEsK0JBQWtCLENBQUE7T0FKZiw2QkFBNkIsQ0ErQmxDO0lBRUQsbUJBQVEsQ0FBQyxFQUFFLENBQWtDLDBCQUFtQixDQUFDLFNBQVMsQ0FBQztTQUN6RSw2QkFBNkIsQ0FBQyw2QkFBNkIsa0NBQTBCLENBQUM7SUFFeEYsTUFBTSxxQkFBcUIsR0FBRyxtQkFBUSxDQUFDLEVBQUUsQ0FBeUIsa0NBQXVCLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDekcscUJBQXFCLENBQUMscUJBQXFCLENBQUM7UUFDM0MsR0FBRyw4Q0FBOEI7UUFDakMsVUFBVSxFQUFFO1lBQ1gsa0RBQWtELEVBQUU7Z0JBQ25ELEtBQUssb0NBQTRCO2dCQUNqQyxJQUFJLEVBQUUsU0FBUztnQkFDZixPQUFPLEVBQUUsSUFBSTtnQkFDYixXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsa0RBQWtELEVBQUUsbUZBQW1GLENBQUM7YUFDOUo7WUFDRCx5QkFBeUIsRUFBRTtnQkFDMUIsT0FBTyxxQ0FBNkI7Z0JBQ3BDLE1BQU0sRUFBRSxRQUFRO2dCQUNoQixNQUFNLEVBQUUsQ0FBQyxNQUFNLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSw2QkFBNkIsQ0FBQztnQkFDM0Ysa0JBQWtCLEVBQUU7b0JBQ25CLElBQUEsY0FBUSxFQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMscUdBQXFHLENBQUMsRUFBRSxHQUFHLEVBQUUsOEJBQThCLEVBQUUsRUFBRSwwQkFBMEIsQ0FBQztvQkFDL0wsSUFBQSxjQUFRLEVBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxxR0FBcUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxxQ0FBcUMsRUFBRSxFQUFFLDRGQUE0RixDQUFDO29CQUN4USxJQUFBLGNBQVEsRUFBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLHFHQUFxRyxDQUFDLEVBQUUsR0FBRyxFQUFFLGdDQUFnQyxFQUFFLEVBQUUsd05BQXdOLENBQUM7b0JBQy9YLElBQUEsY0FBUSxFQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMscUdBQXFHLENBQUMsRUFBRSxHQUFHLEVBQUUseUNBQXlDLEVBQUUsRUFBRSw0RUFBNEUsQ0FBQztvQkFDNVAsSUFBQSxjQUFRLEVBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxxR0FBcUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxxREFBcUQsRUFBRSxFQUFFLHdEQUF3RCxDQUFDO2lCQUNwUDtnQkFDRCxTQUFTLEVBQUUsYUFBYTtnQkFDeEIsYUFBYSxFQUFFLElBQUEsY0FBUSxFQUFDLHlCQUF5QixFQUFFLDRGQUE0RixDQUFDO2FBQ2hKO1lBQ0QsMkNBQTJDLEVBQUU7Z0JBQzVDLEtBQUssd0NBQWdDO2dCQUNyQyxJQUFJLEVBQUUsU0FBUztnQkFDZixPQUFPLEVBQUUsS0FBSztnQkFDZCxrQkFBa0IsRUFBRSxJQUFBLGNBQVEsRUFBQyxvQkFBb0IsRUFBRSxzREFBc0QsQ0FBQztnQkFDMUcsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLDJDQUEyQyxFQUFFLDhDQUE4QyxDQUFDO2FBQ2xIO1NBQ0Q7S0FDRCxDQUFDLENBQUM7SUFFSCxtQkFBUSxDQUFDLEVBQUUsQ0FBa0MsMEJBQW1CLENBQUMsU0FBUyxDQUFDO1NBQ3pFLDZCQUE2QixDQUFDLHFDQUF1QixrQ0FBMEIsQ0FBQyJ9