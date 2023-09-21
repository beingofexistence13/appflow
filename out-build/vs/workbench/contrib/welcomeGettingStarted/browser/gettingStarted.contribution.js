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
define(["require", "exports", "vs/nls!vs/workbench/contrib/welcomeGettingStarted/browser/gettingStarted.contribution", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStarted", "vs/platform/registry/common/platform", "vs/workbench/common/editor", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/instantiation", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/editor/common/editorService", "vs/workbench/browser/editor", "vs/platform/instantiation/common/descriptors", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedService", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedInput", "vs/workbench/common/contributions", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/configuration", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/commands/common/commands", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/remote/common/remoteAgentService", "vs/base/common/platform", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensions/common/extensions", "vs/workbench/contrib/welcomeGettingStarted/browser/startupPage", "vs/workbench/contrib/extensions/common/extensionsInput", "vs/platform/action/common/actionCommonCategories", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedIcons"], function (require, exports, nls_1, gettingStarted_1, platform_1, editor_1, actions_1, instantiation_1, contextkey_1, editorService_1, editor_2, descriptors_1, gettingStartedService_1, gettingStartedInput_1, contributions_1, configurationRegistry_1, configuration_1, editorGroupsService_1, commands_1, quickInput_1, remoteAgentService_1, platform_2, extensionManagement_1, extensions_1, startupPage_1, extensionsInput_1, actionCommonCategories_1, icons) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$XYb = exports.icons = void 0;
    exports.icons = icons;
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.openWalkthrough',
                title: { value: (0, nls_1.localize)(0, null), original: 'Welcome' },
                category: actionCommonCategories_1.$Nl.Help,
                f1: true,
                menu: {
                    id: actions_1.$Ru.MenubarHelpMenu,
                    group: '1_welcome',
                    order: 1,
                }
            });
        }
        run(accessor, walkthroughID, toSide) {
            const editorGroupsService = accessor.get(editorGroupsService_1.$5C);
            const instantiationService = accessor.get(instantiation_1.$Ah);
            const editorService = accessor.get(editorService_1.$9C);
            const commandService = accessor.get(commands_1.$Fr);
            if (walkthroughID) {
                const selectedCategory = typeof walkthroughID === 'string' ? walkthroughID : walkthroughID.category;
                const selectedStep = typeof walkthroughID === 'string' ? undefined : walkthroughID.step;
                // Try first to select the walkthrough on an active welcome page with no selected walkthrough
                for (const group of editorGroupsService.groups) {
                    if (group.activeEditor instanceof gettingStartedInput_1.$MYb) {
                        group.activeEditorPane.makeCategoryVisibleWhenAvailable(selectedCategory, selectedStep);
                        return;
                    }
                }
                // Otherwise, try to find a welcome input somewhere with no selected walkthrough, and open it to this one.
                const result = editorService.findEditors({ typeId: gettingStartedInput_1.$MYb.ID, editorId: undefined, resource: gettingStartedInput_1.$MYb.RESOURCE });
                for (const { editor, groupId } of result) {
                    if (editor instanceof gettingStartedInput_1.$MYb) {
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
                if (selectedStep && activeEditor instanceof gettingStartedInput_1.$MYb && activeEditor.selectedCategory === selectedCategory) {
                    commandService.executeCommand('walkthroughs.selectStep', selectedStep);
                    return;
                }
                // If it's the extension install page then lets replace it with the getting started page
                if (activeEditor instanceof extensionsInput_1.$Nfb) {
                    const activeGroup = editorGroupsService.activeGroup;
                    activeGroup.replaceEditors([{
                            editor: activeEditor,
                            replacement: instantiationService.createInstance(gettingStartedInput_1.$MYb, { selectedCategory: selectedCategory, selectedStep: selectedStep })
                        }]);
                }
                else {
                    // else open respecting toSide
                    editorService.openEditor({
                        resource: gettingStartedInput_1.$MYb.RESOURCE,
                        options: { selectedCategory: selectedCategory, selectedStep: selectedStep, preserveFocus: toSide ?? false }
                    }).then((editor) => {
                        editor?.makeCategoryVisibleWhenAvailable(selectedCategory, selectedStep);
                    });
                }
            }
            else {
                editorService.openEditor({ resource: gettingStartedInput_1.$MYb.RESOURCE });
            }
        }
    });
    platform_1.$8m.as(editor_1.$GE.EditorFactory).registerEditorSerializer(gettingStartedInput_1.$MYb.ID, gettingStarted_1.$WYb);
    platform_1.$8m.as(editor_1.$GE.EditorPane).registerEditorPane(editor_2.$_T.create(gettingStarted_1.$VYb, gettingStarted_1.$VYb.ID, (0, nls_1.localize)(1, null)), [
        new descriptors_1.$yh(gettingStartedInput_1.$MYb)
    ]);
    const category = { value: (0, nls_1.localize)(2, null), original: 'Welcome' };
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'welcome.goBack',
                title: { value: (0, nls_1.localize)(3, null), original: 'Go Back' },
                category,
                keybinding: {
                    weight: 100 /* KeybindingWeight.EditorContrib */,
                    primary: 9 /* KeyCode.Escape */,
                    when: gettingStarted_1.$UYb
                },
                precondition: contextkey_1.$Ii.equals('activeEditor', 'gettingStartedPage'),
                f1: true
            });
        }
        run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const editorPane = editorService.activeEditorPane;
            if (editorPane instanceof gettingStarted_1.$VYb) {
                editorPane.escape();
            }
        }
    });
    commands_1.$Gr.registerCommand({
        id: 'walkthroughs.selectStep',
        handler: (accessor, stepID) => {
            const editorService = accessor.get(editorService_1.$9C);
            const editorPane = editorService.activeEditorPane;
            if (editorPane instanceof gettingStarted_1.$VYb) {
                editorPane.selectStepLoose(stepID);
            }
            else {
                console.error('Cannot run walkthroughs.selectStep outside of walkthrough context');
            }
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'welcome.markStepComplete',
                title: (0, nls_1.localize)(4, null),
                category,
            });
        }
        run(accessor, arg) {
            if (!arg) {
                return;
            }
            const gettingStartedService = accessor.get(gettingStartedService_1.$XXb);
            gettingStartedService.progressStep(arg);
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'welcome.markStepIncomplete',
                title: (0, nls_1.localize)(5, null),
                category,
            });
        }
        run(accessor, arg) {
            if (!arg) {
                return;
            }
            const gettingStartedService = accessor.get(gettingStartedService_1.$XXb);
            gettingStartedService.deprogressStep(arg);
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'welcome.showAllWalkthroughs',
                title: { value: (0, nls_1.localize)(6, null), original: 'Open Walkthrough...' },
                category,
                f1: true,
            });
        }
        async a(contextService, gettingStartedService) {
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
            const commandService = accessor.get(commands_1.$Fr);
            const contextService = accessor.get(contextkey_1.$3i);
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const gettingStartedService = accessor.get(gettingStartedService_1.$XXb);
            const extensionService = accessor.get(extensions_1.$MF);
            const quickPick = quickInputService.createQuickPick();
            quickPick.canSelectMany = false;
            quickPick.matchOnDescription = true;
            quickPick.matchOnDetail = true;
            quickPick.placeholder = (0, nls_1.localize)(7, null);
            quickPick.items = await this.a(contextService, gettingStartedService);
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
                quickPick.items = await this.a(contextService, gettingStartedService);
            });
            quickPick.show();
            quickPick.busy = false;
        }
    });
    exports.$XYb = new contextkey_1.$2i('workspacePlatform', undefined, (0, nls_1.localize)(8, null));
    let WorkspacePlatformContribution = class WorkspacePlatformContribution {
        constructor(a, b, d) {
            this.a = a;
            this.b = b;
            this.d = d;
            this.b.getEnvironment().then(env => {
                const remoteOS = env?.os;
                const remotePlatform = remoteOS === 2 /* OS.Macintosh */ ? 'mac'
                    : remoteOS === 1 /* OS.Windows */ ? 'windows'
                        : remoteOS === 3 /* OS.Linux */ ? 'linux'
                            : undefined;
                if (remotePlatform) {
                    exports.$XYb.bindTo(this.d).set(remotePlatform);
                }
                else if (this.a.localExtensionManagementServer) {
                    if (platform_2.$j) {
                        exports.$XYb.bindTo(this.d).set('mac');
                    }
                    else if (platform_2.$k) {
                        exports.$XYb.bindTo(this.d).set('linux');
                    }
                    else if (platform_2.$i) {
                        exports.$XYb.bindTo(this.d).set('windows');
                    }
                }
                else if (this.a.webExtensionManagementServer) {
                    exports.$XYb.bindTo(this.d).set('webworker');
                }
                else {
                    console.error('Error: Unable to detect workspace platform');
                }
            });
        }
    };
    WorkspacePlatformContribution = __decorate([
        __param(0, extensionManagement_1.$fcb),
        __param(1, remoteAgentService_1.$jm),
        __param(2, contextkey_1.$3i)
    ], WorkspacePlatformContribution);
    platform_1.$8m.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(WorkspacePlatformContribution, 3 /* LifecyclePhase.Restored */);
    const configurationRegistry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
    configurationRegistry.registerConfiguration({
        ...configuration_1.$$y,
        properties: {
            'workbench.welcomePage.walkthroughs.openOnInstall': {
                scope: 2 /* ConfigurationScope.MACHINE */,
                type: 'boolean',
                default: true,
                description: (0, nls_1.localize)(9, null)
            },
            'workbench.startupEditor': {
                'scope': 4 /* ConfigurationScope.RESOURCE */,
                'type': 'string',
                'enum': ['none', 'welcomePage', 'readme', 'newUntitledFile', 'welcomePageInEmptyWorkbench'],
                'enumDescriptions': [
                    (0, nls_1.localize)(10, null),
                    (0, nls_1.localize)(11, null),
                    (0, nls_1.localize)(12, null),
                    (0, nls_1.localize)(13, null),
                    (0, nls_1.localize)(14, null),
                ],
                'default': 'welcomePage',
                'description': (0, nls_1.localize)(15, null)
            },
            'workbench.welcomePage.preferReducedMotion': {
                scope: 1 /* ConfigurationScope.APPLICATION */,
                type: 'boolean',
                default: false,
                deprecationMessage: (0, nls_1.localize)(16, null),
                description: (0, nls_1.localize)(17, null)
            }
        }
    });
    platform_1.$8m.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(startupPage_1.$PYb, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=gettingStarted.contribution.js.map