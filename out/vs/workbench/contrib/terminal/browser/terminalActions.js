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
define(["require", "exports", "vs/base/browser/canIUse", "vs/base/common/actions", "vs/base/common/codicons", "vs/base/common/keyCodes", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/types", "vs/base/common/uri", "vs/editor/browser/services/codeEditorService", "vs/nls", "vs/platform/accessibility/common/accessibility", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/label/common/label", "vs/platform/list/browser/listService", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/platform/terminal/common/terminal", "vs/platform/workspace/common/workspace", "vs/workbench/browser/actions/workspaceCommands", "vs/workbench/browser/parts/editor/editorCommands", "vs/workbench/common/contextkeys", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/terminalQuickAccess", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/platform/terminal/common/terminalProfiles", "vs/workbench/contrib/terminal/common/terminalStrings", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/history/common/history", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/editor/common/editorService", "vs/base/common/path", "vs/workbench/services/configurationResolver/common/variableResolver", "vs/platform/theme/common/themeService", "vs/workbench/contrib/terminal/browser/terminalIcon", "vs/workbench/contrib/terminal/common/history", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/base/common/cancellation", "vs/base/common/resources", "vs/editor/common/services/getIconClasses", "vs/platform/files/common/files", "vs/platform/clipboard/common/clipboardService", "vs/workbench/contrib/terminal/browser/terminalIcons", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/common/iterator", "vs/workbench/contrib/accessibility/browser/accessibilityConfiguration"], function (require, exports, canIUse_1, actions_1, codicons_1, keyCodes_1, network_1, platform_1, types_1, uri_1, codeEditorService_1, nls_1, accessibility_1, actions_2, commands_1, configuration_1, contextkey_1, label_1, listService_1, notification_1, opener_1, quickInput_1, terminal_1, workspace_1, workspaceCommands_1, editorCommands_1, contextkeys_1, terminal_2, terminalQuickAccess_1, terminal_3, terminalContextKey_1, terminalProfiles_1, terminalStrings_1, configurationResolver_1, environmentService_1, history_1, preferences_1, remoteAgentService_1, editorService_1, path_1, variableResolver_1, themeService_1, terminalIcon_1, history_2, model_1, language_1, cancellation_1, resources_1, getIconClasses_1, files_1, clipboardService_1, terminalIcons_1, editorGroupsService_1, iterator_1, accessibilityConfiguration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.shrinkWorkspaceFolderCwdPairs = exports.refreshTerminalActions = exports.validateTerminalName = exports.registerTerminalActions = exports.registerActiveXtermAction = exports.registerActiveInstanceAction = exports.registerTerminalAction = exports.TerminalLaunchHelpAction = exports.terminalSendSequenceCommand = exports.getCwdForSplit = exports.switchTerminalShowTabsTitle = exports.switchTerminalActionViewItemSeparator = void 0;
    exports.switchTerminalActionViewItemSeparator = '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500';
    exports.switchTerminalShowTabsTitle = (0, nls_1.localize)('showTerminalTabs', "Show Tabs");
    const category = terminalStrings_1.terminalStrings.actionCategory;
    async function getCwdForSplit(configHelper, instance, folders, commandService) {
        switch (configHelper.config.splitCwd) {
            case 'workspaceRoot':
                if (folders !== undefined && commandService !== undefined) {
                    if (folders.length === 1) {
                        return folders[0].uri;
                    }
                    else if (folders.length > 1) {
                        // Only choose a path when there's more than 1 folder
                        const options = {
                            placeHolder: (0, nls_1.localize)('workbench.action.terminal.newWorkspacePlaceholder', "Select current working directory for new terminal")
                        };
                        const workspace = await commandService.executeCommand(workspaceCommands_1.PICK_WORKSPACE_FOLDER_COMMAND_ID, [options]);
                        if (!workspace) {
                            // Don't split the instance if the workspace picker was canceled
                            return undefined;
                        }
                        return Promise.resolve(workspace.uri);
                    }
                }
                return '';
            case 'initial':
                return instance.getInitialCwd();
            case 'inherited':
                return instance.getCwd();
        }
    }
    exports.getCwdForSplit = getCwdForSplit;
    const terminalSendSequenceCommand = async (accessor, args) => {
        const instance = accessor.get(terminal_2.ITerminalService).activeInstance;
        if (instance) {
            const text = (0, types_1.isObject)(args) && 'text' in args ? toOptionalString(args.text) : undefined;
            if (!text) {
                return;
            }
            const configurationResolverService = accessor.get(configurationResolver_1.IConfigurationResolverService);
            const workspaceContextService = accessor.get(workspace_1.IWorkspaceContextService);
            const historyService = accessor.get(history_1.IHistoryService);
            const activeWorkspaceRootUri = historyService.getLastActiveWorkspaceRoot(instance.isRemote ? network_1.Schemas.vscodeRemote : network_1.Schemas.file);
            const lastActiveWorkspaceRoot = activeWorkspaceRootUri ? workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? undefined : undefined;
            const resolvedText = await configurationResolverService.resolveAsync(lastActiveWorkspaceRoot, text);
            instance.sendText(resolvedText, false);
        }
    };
    exports.terminalSendSequenceCommand = terminalSendSequenceCommand;
    let TerminalLaunchHelpAction = class TerminalLaunchHelpAction extends actions_1.Action {
        constructor(_openerService) {
            super('workbench.action.terminal.launchHelp', (0, nls_1.localize)('terminalLaunchHelp', "Open Help"));
            this._openerService = _openerService;
        }
        async run() {
            this._openerService.open('https://aka.ms/vscode-troubleshoot-terminal-launch');
        }
    };
    exports.TerminalLaunchHelpAction = TerminalLaunchHelpAction;
    exports.TerminalLaunchHelpAction = TerminalLaunchHelpAction = __decorate([
        __param(0, opener_1.IOpenerService)
    ], TerminalLaunchHelpAction);
    /**
     * A wrapper function around registerAction2 to help make registering terminal actions more concise.
     * The following default options are used if undefined:
     *
     * - `f1`: true
     * - `category`: Terminal
     * - `precondition`: TerminalContextKeys.processSupported
     */
    function registerTerminalAction(options) {
        // Set defaults
        options.f1 = options.f1 ?? true;
        options.category = options.category ?? category;
        options.precondition = options.precondition ?? terminalContextKey_1.TerminalContextKeys.processSupported;
        // Remove run function from options so it's not passed through to registerAction2
        const runFunc = options.run;
        const strictOptions = options;
        delete strictOptions['run'];
        // Register
        return (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super(strictOptions);
            }
            run(accessor, args) {
                return runFunc(getTerminalServices(accessor), accessor, args);
            }
        });
    }
    exports.registerTerminalAction = registerTerminalAction;
    /**
     * A wrapper around {@link registerTerminalAction} that ensures an active instance exists and
     * provides it to the run function.
     */
    function registerActiveInstanceAction(options) {
        const originalRun = options.run;
        return registerTerminalAction({
            ...options,
            run: (c, accessor, args) => {
                const activeInstance = c.service.activeInstance;
                if (activeInstance) {
                    return originalRun(activeInstance, c, accessor, args);
                }
            }
        });
    }
    exports.registerActiveInstanceAction = registerActiveInstanceAction;
    /**
     * A wrapper around {@link registerTerminalAction} that ensures an active terminal
     * exists and provides it to the run function.
     *
     * This includes detached xterm terminals that are not managed by an {@link ITerminalInstance}.
     */
    function registerActiveXtermAction(options) {
        const originalRun = options.run;
        return registerTerminalAction({
            ...options,
            run: (c, accessor, args) => {
                const activeDetached = iterator_1.Iterable.find(c.service.detachedXterms, d => d.isFocused);
                if (activeDetached) {
                    return originalRun(activeDetached, accessor, undefined, args);
                }
                const activeInstance = c.service.activeInstance;
                if (activeInstance?.xterm) {
                    return originalRun(activeInstance.xterm, accessor, activeInstance, args);
                }
            }
        });
    }
    exports.registerActiveXtermAction = registerActiveXtermAction;
    function getTerminalServices(accessor) {
        return {
            service: accessor.get(terminal_2.ITerminalService),
            groupService: accessor.get(terminal_2.ITerminalGroupService),
            instanceService: accessor.get(terminal_2.ITerminalInstanceService),
            editorService: accessor.get(terminal_2.ITerminalEditorService),
            profileService: accessor.get(terminal_3.ITerminalProfileService),
            profileResolverService: accessor.get(terminal_3.ITerminalProfileResolverService)
        };
    }
    function registerTerminalActions() {
        registerTerminalAction({
            id: "workbench.action.terminal.newInActiveWorkspace" /* TerminalCommandId.NewInActiveWorkspace */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.newInActiveWorkspace', "Create New Terminal (In Active Workspace)"), original: 'Create New Terminal (In Active Workspace)' },
            run: async (c) => {
                if (c.service.isProcessSupportRegistered) {
                    const instance = await c.service.createTerminal({ location: c.service.defaultLocation });
                    if (!instance) {
                        return;
                    }
                    c.service.setActiveInstance(instance);
                }
                await c.groupService.showPanel(true);
            }
        });
        // Register new with profile command
        refreshTerminalActions([]);
        registerTerminalAction({
            id: "workbench.action.createTerminalEditor" /* TerminalCommandId.CreateTerminalEditor */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.createTerminalEditor', "Create New Terminal in Editor Area"), original: 'Create New Terminal in Editor Area' },
            run: async (c, _, args) => {
                const options = ((0, types_1.isObject)(args) && 'location' in args) ? args : { location: terminal_1.TerminalLocation.Editor };
                const instance = await c.service.createTerminal(options);
                instance.focusWhenReady();
            }
        });
        registerTerminalAction({
            id: "workbench.action.createTerminalEditorSameGroup" /* TerminalCommandId.CreateTerminalEditorSameGroup */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.createTerminalEditor', "Create New Terminal in Editor Area"), original: 'Create New Terminal in Editor Area' },
            f1: false,
            run: async (c, accessor, args) => {
                // Force the editor into the same editor group if it's locked. This command is only ever
                // called when a terminal is the active editor
                const editorGroupsService = accessor.get(editorGroupsService_1.IEditorGroupsService);
                const instance = await c.service.createTerminal({
                    location: { viewColumn: editorGroupsService.activeGroup.index }
                });
                instance.focusWhenReady();
            }
        });
        registerTerminalAction({
            id: "workbench.action.createTerminalEditorSide" /* TerminalCommandId.CreateTerminalEditorSide */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.createTerminalEditorSide', "Create New Terminal in Editor Area to the Side"), original: 'Create New Terminal in Editor Area to the Side' },
            run: async (c) => {
                const instance = await c.service.createTerminal({
                    location: { viewColumn: editorService_1.SIDE_GROUP }
                });
                instance.focusWhenReady();
            }
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.moveToEditor" /* TerminalCommandId.MoveToEditor */,
            title: terminalStrings_1.terminalStrings.moveToEditor,
            precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.terminalEditorActive.toNegated(), terminalContextKey_1.TerminalContextKeys.viewShowing),
            run: (activeInstance, c) => c.service.moveToEditor(activeInstance)
        });
        registerTerminalAction({
            id: "workbench.action.terminal.moveToEditorActiveTab" /* TerminalCommandId.MoveToEditorActiveTab */,
            title: terminalStrings_1.terminalStrings.moveToEditor,
            f1: false,
            precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.isOpen),
            run: async (c, accessor) => {
                const selectedInstances = getSelectedInstances(accessor);
                if (!selectedInstances || selectedInstances.length === 0) {
                    return;
                }
                for (const instance of selectedInstances) {
                    c.service.moveToEditor(instance);
                }
                selectedInstances[selectedInstances.length - 1].focus();
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.moveToTerminalPanel" /* TerminalCommandId.MoveToTerminalPanel */,
            title: terminalStrings_1.terminalStrings.moveToTerminalPanel,
            precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.terminalEditorActive),
            run: (c, _, args) => {
                const source = toOptionalUri(args) ?? c.editorService.activeInstance;
                if (source) {
                    c.service.moveToTerminalView(source);
                }
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.focusPreviousPane" /* TerminalCommandId.FocusPreviousPane */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.focusPreviousPane', "Focus Previous Terminal in Terminal Group"), original: 'Focus Previous Terminal in Terminal Group' },
            keybinding: {
                primary: 512 /* KeyMod.Alt */ | 15 /* KeyCode.LeftArrow */,
                secondary: [512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */],
                mac: {
                    primary: 512 /* KeyMod.Alt */ | 2048 /* KeyMod.CtrlCmd */ | 15 /* KeyCode.LeftArrow */,
                    secondary: [512 /* KeyMod.Alt */ | 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */]
                },
                when: terminalContextKey_1.TerminalContextKeys.focus,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: async (c) => {
                c.groupService.activeGroup?.focusPreviousPane();
                await c.groupService.showPanel(true);
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.focusNextPane" /* TerminalCommandId.FocusNextPane */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.focusNextPane', "Focus Next Terminal in Terminal Group"), original: 'Focus Next Terminal in Terminal Group' },
            keybinding: {
                primary: 512 /* KeyMod.Alt */ | 17 /* KeyCode.RightArrow */,
                secondary: [512 /* KeyMod.Alt */ | 18 /* KeyCode.DownArrow */],
                mac: {
                    primary: 512 /* KeyMod.Alt */ | 2048 /* KeyMod.CtrlCmd */ | 17 /* KeyCode.RightArrow */,
                    secondary: [512 /* KeyMod.Alt */ | 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */]
                },
                when: terminalContextKey_1.TerminalContextKeys.focus,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: async (c) => {
                c.groupService.activeGroup?.focusNextPane();
                await c.groupService.showPanel(true);
            }
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.runRecentCommand" /* TerminalCommandId.RunRecentCommand */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.runRecentCommand', "Run Recent Command..."), original: 'Run Recent Command...' },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            keybinding: [
                {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 48 /* KeyCode.KeyR */,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 48 /* KeyCode.KeyR */ },
                    when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focus, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 48 /* KeyCode.KeyR */,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 512 /* KeyMod.Alt */ | 48 /* KeyCode.KeyR */ },
                    when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focus, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                }
            ],
            run: async (activeInstance, c) => {
                await activeInstance.runRecent('command');
                if (activeInstance?.target === terminal_1.TerminalLocation.Editor) {
                    await c.editorService.revealActiveEditor();
                }
                else {
                    await c.groupService.showPanel(false);
                }
            }
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.copyLastCommandOutput" /* TerminalCommandId.CopyLastCommandOutput */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.copyLastCommand', 'Copy Last Command Output'), original: 'Copy Last Command Output' },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: async (instance, c, accessor) => {
                const clipboardService = accessor.get(clipboardService_1.IClipboardService);
                const commands = instance.capabilities.get(2 /* TerminalCapability.CommandDetection */)?.commands;
                if (!commands || commands.length === 0) {
                    return;
                }
                const command = commands[commands.length - 1];
                if (!command?.hasOutput()) {
                    return;
                }
                const output = command.getOutput();
                if ((0, types_1.isString)(output)) {
                    await clipboardService.writeText(output);
                }
            }
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.goToRecentDirectory" /* TerminalCommandId.GoToRecentDirectory */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.goToRecentDirectory', "Go to Recent Directory..."), original: 'Go to Recent Directory...' },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 37 /* KeyCode.KeyG */,
                when: terminalContextKey_1.TerminalContextKeys.focus,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            run: async (activeInstance, c) => {
                await activeInstance.runRecent('cwd');
                if (activeInstance?.target === terminal_1.TerminalLocation.Editor) {
                    await c.editorService.revealActiveEditor();
                }
                else {
                    await c.groupService.showPanel(false);
                }
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.resizePaneLeft" /* TerminalCommandId.ResizePaneLeft */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.resizePaneLeft', "Resize Terminal Left"), original: 'Resize Terminal Left' },
            keybinding: {
                linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 15 /* KeyCode.LeftArrow */ },
                mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 15 /* KeyCode.LeftArrow */ },
                when: terminalContextKey_1.TerminalContextKeys.focus,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (c) => c.groupService.activeGroup?.resizePane(0 /* Direction.Left */)
        });
        registerTerminalAction({
            id: "workbench.action.terminal.resizePaneRight" /* TerminalCommandId.ResizePaneRight */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.resizePaneRight', "Resize Terminal Right"), original: 'Resize Terminal Right' },
            keybinding: {
                linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 17 /* KeyCode.RightArrow */ },
                mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 17 /* KeyCode.RightArrow */ },
                when: terminalContextKey_1.TerminalContextKeys.focus,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (c) => c.groupService.activeGroup?.resizePane(1 /* Direction.Right */)
        });
        registerTerminalAction({
            id: "workbench.action.terminal.resizePaneUp" /* TerminalCommandId.ResizePaneUp */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.resizePaneUp', "Resize Terminal Up"), original: 'Resize Terminal Up' },
            keybinding: {
                mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 16 /* KeyCode.UpArrow */ },
                when: terminalContextKey_1.TerminalContextKeys.focus,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (c) => c.groupService.activeGroup?.resizePane(2 /* Direction.Up */)
        });
        registerTerminalAction({
            id: "workbench.action.terminal.resizePaneDown" /* TerminalCommandId.ResizePaneDown */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.resizePaneDown', "Resize Terminal Down"), original: 'Resize Terminal Down' },
            keybinding: {
                mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 18 /* KeyCode.DownArrow */ },
                when: terminalContextKey_1.TerminalContextKeys.focus,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (c) => c.groupService.activeGroup?.resizePane(3 /* Direction.Down */)
        });
        registerTerminalAction({
            id: "workbench.action.terminal.focus" /* TerminalCommandId.Focus */,
            title: terminalStrings_1.terminalStrings.focus,
            keybinding: {
                when: contextkey_1.ContextKeyExpr.and(accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED, accessibilityConfiguration_1.accessibleViewOnLastLine, accessibilityConfiguration_1.accessibleViewCurrentProviderId.isEqualTo("terminal" /* AccessibleViewProviderId.Terminal */)),
                primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: async (c) => {
                const instance = c.service.activeInstance || await c.service.createTerminal({ location: terminal_1.TerminalLocation.Panel });
                if (!instance) {
                    return;
                }
                c.service.setActiveInstance(instance);
                focusActiveTerminal(instance, c);
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.focusTabs" /* TerminalCommandId.FocusTabs */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.focus.tabsView', "Focus Terminal Tabs View"), original: 'Focus Terminal Tabs View' },
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 93 /* KeyCode.Backslash */,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.tabsFocus, terminalContextKey_1.TerminalContextKeys.focus),
            },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (c) => c.groupService.focusTabs()
        });
        registerTerminalAction({
            id: "workbench.action.terminal.focusNext" /* TerminalCommandId.FocusNext */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.focusNext', "Focus Next Terminal Group"), original: 'Focus Next Terminal Group' },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 12 /* KeyCode.PageDown */,
                mac: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 94 /* KeyCode.BracketRight */
                },
                when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.editorFocus.negate()),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            run: async (c) => {
                c.groupService.setActiveGroupToNext();
                await c.groupService.showPanel(true);
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.focusPrevious" /* TerminalCommandId.FocusPrevious */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.focusPrevious', "Focus Previous Terminal Group"), original: 'Focus Previous Terminal Group' },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 11 /* KeyCode.PageUp */,
                mac: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 92 /* KeyCode.BracketLeft */
                },
                when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.editorFocus.negate()),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            run: async (c) => {
                c.groupService.setActiveGroupToPrevious();
                await c.groupService.showPanel(true);
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.runSelectedText" /* TerminalCommandId.RunSelectedText */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.runSelectedText', "Run Selected Text In Active Terminal"), original: 'Run Selected Text In Active Terminal' },
            run: async (c, accessor) => {
                const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
                const editor = codeEditorService.getActiveCodeEditor();
                if (!editor || !editor.hasModel()) {
                    return;
                }
                const instance = await c.service.getActiveOrCreateInstance({ acceptsInput: true });
                const selection = editor.getSelection();
                let text;
                if (selection.isEmpty()) {
                    text = editor.getModel().getLineContent(selection.selectionStartLineNumber).trim();
                }
                else {
                    const endOfLinePreference = platform_1.isWindows ? 1 /* EndOfLinePreference.LF */ : 2 /* EndOfLinePreference.CRLF */;
                    text = editor.getModel().getValueInRange(selection, endOfLinePreference);
                }
                instance.sendText(text, true, true);
                await c.service.revealActiveTerminal();
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.runActiveFile" /* TerminalCommandId.RunActiveFile */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.runActiveFile', "Run Active File In Active Terminal"), original: 'Run Active File In Active Terminal' },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: async (c, accessor) => {
                const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
                const notificationService = accessor.get(notification_1.INotificationService);
                const workbenchEnvironmentService = accessor.get(environmentService_1.IWorkbenchEnvironmentService);
                const editor = codeEditorService.getActiveCodeEditor();
                if (!editor || !editor.hasModel()) {
                    return;
                }
                const instance = await c.service.getActiveOrCreateInstance({ acceptsInput: true });
                const isRemote = instance ? instance.isRemote : (workbenchEnvironmentService.remoteAuthority ? true : false);
                const uri = editor.getModel().uri;
                if ((!isRemote && uri.scheme !== network_1.Schemas.file && uri.scheme !== network_1.Schemas.vscodeUserData) || (isRemote && uri.scheme !== network_1.Schemas.vscodeRemote)) {
                    notificationService.warn((0, nls_1.localize)('workbench.action.terminal.runActiveFile.noFile', 'Only files on disk can be run in the terminal'));
                    return;
                }
                // TODO: Convert this to ctrl+c, ctrl+v for pwsh?
                await instance.sendPath(uri, true);
                return c.groupService.showPanel();
            }
        });
        registerActiveXtermAction({
            id: "workbench.action.terminal.scrollDown" /* TerminalCommandId.ScrollDownLine */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.scrollDown', "Scroll Down (Line)"), original: 'Scroll Down (Line)' },
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 12 /* KeyCode.PageDown */,
                linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 18 /* KeyCode.DownArrow */ },
                when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focusInAny, terminalContextKey_1.TerminalContextKeys.altBufferActive.negate()),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (xterm) => xterm.scrollDownLine()
        });
        registerActiveXtermAction({
            id: "workbench.action.terminal.scrollDownPage" /* TerminalCommandId.ScrollDownPage */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.scrollDownPage', "Scroll Down (Page)"), original: 'Scroll Down (Page)' },
            keybinding: {
                primary: 1024 /* KeyMod.Shift */ | 12 /* KeyCode.PageDown */,
                mac: { primary: 12 /* KeyCode.PageDown */ },
                when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focusInAny, terminalContextKey_1.TerminalContextKeys.altBufferActive.negate()),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (xterm) => xterm.scrollDownPage()
        });
        registerActiveXtermAction({
            id: "workbench.action.terminal.scrollToBottom" /* TerminalCommandId.ScrollToBottom */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.scrollToBottom', "Scroll to Bottom"), original: 'Scroll to Bottom' },
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 13 /* KeyCode.End */,
                linux: { primary: 1024 /* KeyMod.Shift */ | 13 /* KeyCode.End */ },
                when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focusInAny, terminalContextKey_1.TerminalContextKeys.altBufferActive.negate()),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (xterm) => xterm.scrollToBottom()
        });
        registerActiveXtermAction({
            id: "workbench.action.terminal.scrollUp" /* TerminalCommandId.ScrollUpLine */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.scrollUp', "Scroll Up (Line)"), original: 'Scroll Up (Line)' },
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 11 /* KeyCode.PageUp */,
                linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 16 /* KeyCode.UpArrow */ },
                when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focusInAny, terminalContextKey_1.TerminalContextKeys.altBufferActive.negate()),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (xterm) => xterm.scrollUpLine()
        });
        registerActiveXtermAction({
            id: "workbench.action.terminal.scrollUpPage" /* TerminalCommandId.ScrollUpPage */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.scrollUpPage', "Scroll Up (Page)"), original: 'Scroll Up (Page)' },
            f1: true,
            category,
            keybinding: {
                primary: 1024 /* KeyMod.Shift */ | 11 /* KeyCode.PageUp */,
                mac: { primary: 11 /* KeyCode.PageUp */ },
                when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focusInAny, terminalContextKey_1.TerminalContextKeys.altBufferActive.negate()),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (xterm) => xterm.scrollUpPage()
        });
        registerActiveXtermAction({
            id: "workbench.action.terminal.scrollToTop" /* TerminalCommandId.ScrollToTop */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.scrollToTop', "Scroll to Top"), original: 'Scroll to Top' },
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 14 /* KeyCode.Home */,
                linux: { primary: 1024 /* KeyMod.Shift */ | 14 /* KeyCode.Home */ },
                when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focusInAny, terminalContextKey_1.TerminalContextKeys.altBufferActive.negate()),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (xterm) => xterm.scrollToTop()
        });
        registerActiveXtermAction({
            id: "workbench.action.terminal.clearSelection" /* TerminalCommandId.ClearSelection */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.clearSelection', "Clear Selection"), original: 'Clear Selection' },
            keybinding: {
                primary: 9 /* KeyCode.Escape */,
                when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focusInAny, terminalContextKey_1.TerminalContextKeys.textSelected, terminalContextKey_1.TerminalContextKeys.notFindVisible),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (xterm) => {
                if (xterm.hasSelection()) {
                    xterm.clearSelection();
                }
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.changeIcon" /* TerminalCommandId.ChangeIcon */,
            title: terminalStrings_1.terminalStrings.changeIcon,
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (c, _, args) => getResourceOrActiveInstance(c, args)?.changeIcon()
        });
        registerTerminalAction({
            id: "workbench.action.terminal.changeIconPanel" /* TerminalCommandId.ChangeIconPanel */,
            title: terminalStrings_1.terminalStrings.changeIcon,
            f1: false,
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (c) => c.groupService.activeInstance?.changeIcon()
        });
        registerTerminalAction({
            id: "workbench.action.terminal.changeIconActiveTab" /* TerminalCommandId.ChangeIconActiveTab */,
            title: terminalStrings_1.terminalStrings.changeIcon,
            f1: false,
            precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.tabsSingularSelection),
            run: (c, accessor) => getSelectedInstances(accessor)?.[0].changeIcon()
        });
        registerTerminalAction({
            id: "workbench.action.terminal.changeColor" /* TerminalCommandId.ChangeColor */,
            title: terminalStrings_1.terminalStrings.changeColor,
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (c, _, args) => getResourceOrActiveInstance(c, args)?.changeColor()
        });
        registerTerminalAction({
            id: "workbench.action.terminal.changeColorPanel" /* TerminalCommandId.ChangeColorPanel */,
            title: terminalStrings_1.terminalStrings.changeColor,
            f1: false,
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (c) => c.groupService.activeInstance?.changeColor()
        });
        registerTerminalAction({
            id: "workbench.action.terminal.changeColorActiveTab" /* TerminalCommandId.ChangeColorActiveTab */,
            title: terminalStrings_1.terminalStrings.changeColor,
            f1: false,
            precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.tabsSingularSelection),
            run: (c, accessor) => getSelectedInstances(accessor)?.[0].changeColor()
        });
        registerTerminalAction({
            id: "workbench.action.terminal.rename" /* TerminalCommandId.Rename */,
            title: terminalStrings_1.terminalStrings.rename,
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (c, accessor, args) => renameWithQuickPick(c, accessor, args)
        });
        registerTerminalAction({
            id: "workbench.action.terminal.renamePanel" /* TerminalCommandId.RenamePanel */,
            title: terminalStrings_1.terminalStrings.rename,
            f1: false,
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (c, accessor) => renameWithQuickPick(c, accessor)
        });
        registerTerminalAction({
            id: "workbench.action.terminal.renameActiveTab" /* TerminalCommandId.RenameActiveTab */,
            title: terminalStrings_1.terminalStrings.rename,
            f1: false,
            keybinding: {
                primary: 60 /* KeyCode.F2 */,
                mac: {
                    primary: 3 /* KeyCode.Enter */
                },
                when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.tabsFocus),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.tabsSingularSelection),
            run: async (c, accessor) => {
                const notificationService = accessor.get(notification_1.INotificationService);
                const instance = getSelectedInstances(accessor)?.[0];
                if (!instance) {
                    return;
                }
                c.service.setEditingTerminal(instance);
                c.service.setEditable(instance, {
                    validationMessage: value => validateTerminalName(value),
                    onFinish: async (value, success) => {
                        // Cancel editing first as instance.rename will trigger a rerender automatically
                        c.service.setEditable(instance, null);
                        c.service.setEditingTerminal(undefined);
                        if (success) {
                            try {
                                await instance.rename(value);
                            }
                            catch (e) {
                                notificationService.error(e);
                            }
                        }
                    }
                });
            }
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.detachSession" /* TerminalCommandId.DetachSession */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.detachSession', "Detach Session"), original: 'Detach Session' },
            run: (activeInstance) => activeInstance.detachProcessAndDispose(terminal_1.TerminalExitReason.User)
        });
        registerTerminalAction({
            id: "workbench.action.terminal.attachToSession" /* TerminalCommandId.AttachToSession */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.attachToSession', "Attach to Session"), original: 'Attach to Session' },
            run: async (c, accessor) => {
                const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                const labelService = accessor.get(label_1.ILabelService);
                const remoteAgentService = accessor.get(remoteAgentService_1.IRemoteAgentService);
                const notificationService = accessor.get(notification_1.INotificationService);
                const remoteAuthority = remoteAgentService.getConnection()?.remoteAuthority ?? undefined;
                const backend = await accessor.get(terminal_2.ITerminalInstanceService).getBackend(remoteAuthority);
                if (!backend) {
                    throw new Error(`No backend registered for remote authority '${remoteAuthority}'`);
                }
                const terms = await backend.listProcesses();
                backend.reduceConnectionGraceTime();
                const unattachedTerms = terms.filter(term => !c.service.isAttachedToTerminal(term));
                const items = unattachedTerms.map(term => {
                    const cwdLabel = labelService.getUriLabel(uri_1.URI.file(term.cwd));
                    return {
                        label: term.title,
                        detail: term.workspaceName ? `${term.workspaceName} \u2E31 ${cwdLabel}` : cwdLabel,
                        description: term.pid ? String(term.pid) : '',
                        term
                    };
                });
                if (items.length === 0) {
                    notificationService.info((0, nls_1.localize)('noUnattachedTerminals', 'There are no unattached terminals to attach to'));
                    return;
                }
                const selected = await quickInputService.pick(items, { canPickMany: false });
                if (selected) {
                    const instance = await c.service.createTerminal({
                        config: { attachPersistentProcess: selected.term }
                    });
                    c.service.setActiveInstance(instance);
                    await focusActiveTerminal(instance, c);
                }
            }
        });
        registerTerminalAction({
            id: "workbench.action.quickOpenTerm" /* TerminalCommandId.QuickOpenTerm */,
            title: { value: (0, nls_1.localize)('quickAccessTerminal', "Switch Active Terminal"), original: 'Switch Active Terminal' },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (c, accessor) => accessor.get(quickInput_1.IQuickInputService).quickAccess.show(terminalQuickAccess_1.TerminalQuickAccessProvider.PREFIX)
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.scrollToPreviousCommand" /* TerminalCommandId.ScrollToPreviousCommand */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.scrollToPreviousCommand', "Scroll To Previous Command"), original: 'Scroll To Previous Command' },
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */,
                when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focus, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (activeInstance) => activeInstance.xterm?.markTracker.scrollToPreviousMark(undefined, undefined, activeInstance.capabilities.has(2 /* TerminalCapability.CommandDetection */))
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.scrollToNextCommand" /* TerminalCommandId.ScrollToNextCommand */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.scrollToNextCommand', "Scroll To Next Command"), original: 'Scroll To Next Command' },
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
                when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focus, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (activeInstance) => {
                activeInstance.xterm?.markTracker.scrollToNextMark();
                activeInstance.focus();
            }
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.selectToPreviousCommand" /* TerminalCommandId.SelectToPreviousCommand */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.selectToPreviousCommand', "Select To Previous Command"), original: 'Select To Previous Command' },
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 16 /* KeyCode.UpArrow */,
                when: terminalContextKey_1.TerminalContextKeys.focus,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (activeInstance) => {
                activeInstance.xterm?.markTracker.selectToPreviousMark();
                activeInstance.focus();
            }
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.selectToNextCommand" /* TerminalCommandId.SelectToNextCommand */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.selectToNextCommand', "Select To Next Command"), original: 'Select To Next Command' },
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 18 /* KeyCode.DownArrow */,
                when: terminalContextKey_1.TerminalContextKeys.focus,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (activeInstance) => {
                activeInstance.xterm?.markTracker.selectToNextMark();
                activeInstance.focus();
            }
        });
        registerActiveXtermAction({
            id: "workbench.action.terminal.selectToPreviousLine" /* TerminalCommandId.SelectToPreviousLine */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.selectToPreviousLine', "Select To Previous Line"), original: 'Select To Previous Line' },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: async (xterm, _, instance) => {
                xterm.markTracker.selectToPreviousLine();
                // prefer to call focus on the TerminalInstance for additional accessibility triggers
                (instance || xterm).focus();
            }
        });
        registerActiveXtermAction({
            id: "workbench.action.terminal.selectToNextLine" /* TerminalCommandId.SelectToNextLine */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.selectToNextLine', "Select To Next Line"), original: 'Select To Next Line' },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: async (xterm, _, instance) => {
                xterm.markTracker.selectToNextLine();
                // prefer to call focus on the TerminalInstance for additional accessibility triggers
                (instance || xterm).focus();
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.sendSequence" /* TerminalCommandId.SendSequence */,
            title: terminalStrings_1.terminalStrings.sendSequence,
            f1: false,
            description: {
                description: terminalStrings_1.terminalStrings.sendSequence.value,
                args: [{
                        name: 'args',
                        schema: {
                            type: 'object',
                            required: ['text'],
                            properties: {
                                text: {
                                    description: (0, nls_1.localize)('sendSequence', "The sequence of text to send to the terminal"),
                                    type: 'string'
                                }
                            },
                        }
                    }]
            },
            run: (c, accessor, args) => (0, exports.terminalSendSequenceCommand)(accessor, args)
        });
        registerTerminalAction({
            id: "workbench.action.terminal.newWithCwd" /* TerminalCommandId.NewWithCwd */,
            title: terminalStrings_1.terminalStrings.newWithCwd,
            description: {
                description: terminalStrings_1.terminalStrings.newWithCwd.value,
                args: [{
                        name: 'args',
                        schema: {
                            type: 'object',
                            required: ['cwd'],
                            properties: {
                                cwd: {
                                    description: (0, nls_1.localize)('workbench.action.terminal.newWithCwd.cwd', "The directory to start the terminal at"),
                                    type: 'string'
                                }
                            },
                        }
                    }]
            },
            run: async (c, _, args) => {
                const cwd = (0, types_1.isObject)(args) && 'cwd' in args ? toOptionalString(args.cwd) : undefined;
                const instance = await c.service.createTerminal({ cwd });
                if (!instance) {
                    return;
                }
                c.service.setActiveInstance(instance);
                await focusActiveTerminal(instance, c);
            }
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.renameWithArg" /* TerminalCommandId.RenameWithArgs */,
            title: terminalStrings_1.terminalStrings.renameWithArgs,
            description: {
                description: terminalStrings_1.terminalStrings.renameWithArgs.value,
                args: [{
                        name: 'args',
                        schema: {
                            type: 'object',
                            required: ['name'],
                            properties: {
                                name: {
                                    description: (0, nls_1.localize)('workbench.action.terminal.renameWithArg.name', "The new name for the terminal"),
                                    type: 'string',
                                    minLength: 1
                                }
                            }
                        }
                    }]
            },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: async (activeInstance, c, accessor, args) => {
                const notificationService = accessor.get(notification_1.INotificationService);
                const name = (0, types_1.isObject)(args) && 'name' in args ? toOptionalString(args.name) : undefined;
                if (!name) {
                    notificationService.warn((0, nls_1.localize)('workbench.action.terminal.renameWithArg.noName', "No name argument provided"));
                    return;
                }
                activeInstance.rename(name);
            }
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.relaunch" /* TerminalCommandId.Relaunch */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.relaunch', "Relaunch Active Terminal"), original: 'Relaunch Active Terminal' },
            run: (activeInstance) => activeInstance.relaunch()
        });
        registerTerminalAction({
            id: "workbench.action.terminal.split" /* TerminalCommandId.Split */,
            title: terminalStrings_1.terminalStrings.split,
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.webExtensionContributedProfile),
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 26 /* KeyCode.Digit5 */,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                mac: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 93 /* KeyCode.Backslash */,
                    secondary: [256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 26 /* KeyCode.Digit5 */]
                },
                when: terminalContextKey_1.TerminalContextKeys.focus
            },
            icon: codicons_1.Codicon.splitHorizontal,
            run: async (c, accessor, args) => {
                const optionsOrProfile = (0, types_1.isObject)(args) ? args : undefined;
                const commandService = accessor.get(commands_1.ICommandService);
                const workspaceContextService = accessor.get(workspace_1.IWorkspaceContextService);
                const options = convertOptionsOrProfileToOptions(optionsOrProfile);
                const activeInstance = (await c.service.getInstanceHost(options?.location)).activeInstance;
                if (!activeInstance) {
                    return;
                }
                const cwd = await getCwdForSplit(c.service.configHelper, activeInstance, workspaceContextService.getWorkspace().folders, commandService);
                if (cwd === undefined) {
                    return;
                }
                const instance = await c.service.createTerminal({ location: { parentTerminal: activeInstance }, config: options?.config, cwd });
                await focusActiveTerminal(instance, c);
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.splitActiveTab" /* TerminalCommandId.SplitActiveTab */,
            title: terminalStrings_1.terminalStrings.split,
            f1: false,
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 26 /* KeyCode.Digit5 */,
                mac: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 93 /* KeyCode.Backslash */,
                    secondary: [256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 26 /* KeyCode.Digit5 */]
                },
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: terminalContextKey_1.TerminalContextKeys.tabsFocus
            },
            run: async (c, accessor) => {
                const instances = getSelectedInstances(accessor);
                if (instances) {
                    const promises = [];
                    for (const t of instances) {
                        promises.push((async () => {
                            await c.service.createTerminal({ location: { parentTerminal: t } });
                            await c.groupService.showPanel(true);
                        })());
                    }
                    await Promise.all(promises);
                }
            }
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.unsplit" /* TerminalCommandId.Unsplit */,
            title: terminalStrings_1.terminalStrings.unsplit,
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (activeInstance, c) => c.groupService.unsplitInstance(activeInstance)
        });
        registerTerminalAction({
            id: "workbench.action.terminal.unsplitActiveTab" /* TerminalCommandId.UnsplitActiveTab */,
            title: terminalStrings_1.terminalStrings.unsplit,
            f1: false,
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: async (c, accessor) => {
                const instances = getSelectedInstances(accessor);
                // should not even need this check given the context key
                // but TS complains
                if (instances?.length === 1) {
                    const group = c.groupService.getGroupForInstance(instances[0]);
                    if (group && group?.terminalInstances.length > 1) {
                        c.groupService.unsplitInstance(instances[0]);
                    }
                }
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.joinActiveTab" /* TerminalCommandId.JoinActiveTab */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.joinInstance', "Join Terminals"), original: 'Join Terminals' },
            precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.tabsSingularSelection.toNegated()),
            run: async (c, accessor) => {
                const instances = getSelectedInstances(accessor);
                if (instances && instances.length > 1) {
                    c.groupService.joinInstances(instances);
                }
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.join" /* TerminalCommandId.Join */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.join', "Join Terminals"), original: 'Join Terminals' },
            precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated)),
            run: async (c, accessor) => {
                const themeService = accessor.get(themeService_1.IThemeService);
                const notificationService = accessor.get(notification_1.INotificationService);
                const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                const picks = [];
                if (c.groupService.instances.length <= 1) {
                    notificationService.warn((0, nls_1.localize)('workbench.action.terminal.join.insufficientTerminals', 'Insufficient terminals for the join action'));
                    return;
                }
                const otherInstances = c.groupService.instances.filter(i => i.instanceId !== c.groupService.activeInstance?.instanceId);
                for (const terminal of otherInstances) {
                    const group = c.groupService.getGroupForInstance(terminal);
                    if (group?.terminalInstances.length === 1) {
                        const iconId = (0, terminalIcon_1.getIconId)(accessor, terminal);
                        const label = `$(${iconId}): ${terminal.title}`;
                        const iconClasses = [];
                        const colorClass = (0, terminalIcon_1.getColorClass)(terminal);
                        if (colorClass) {
                            iconClasses.push(colorClass);
                        }
                        const uriClasses = (0, terminalIcon_1.getUriClasses)(terminal, themeService.getColorTheme().type);
                        if (uriClasses) {
                            iconClasses.push(...uriClasses);
                        }
                        picks.push({
                            terminal,
                            label,
                            iconClasses
                        });
                    }
                }
                if (picks.length === 0) {
                    notificationService.warn((0, nls_1.localize)('workbench.action.terminal.join.onlySplits', 'All terminals are joined already'));
                    return;
                }
                const result = await quickInputService.pick(picks, {});
                if (result) {
                    c.groupService.joinInstances([result.terminal, c.groupService.activeInstance]);
                }
            }
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.splitInActiveWorkspace" /* TerminalCommandId.SplitInActiveWorkspace */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.splitInActiveWorkspace', "Split Terminal (In Active Workspace)"), original: 'Split Terminal (In Active Workspace)' },
            run: async (instance, c) => {
                const newInstance = await c.service.createTerminal({ location: { parentTerminal: instance } });
                if (newInstance?.target !== terminal_1.TerminalLocation.Editor) {
                    await c.groupService.showPanel(true);
                }
            }
        });
        registerActiveXtermAction({
            id: "workbench.action.terminal.selectAll" /* TerminalCommandId.SelectAll */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.selectAll', "Select All"), original: 'Select All' },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            keybinding: [{
                    // Don't use ctrl+a by default as that would override the common go to start
                    // of prompt shell binding
                    primary: 0,
                    // Technically this doesn't need to be here as it will fall back to this
                    // behavior anyway when handed to xterm.js, having this handled by VS Code
                    // makes it easier for users to see how it works though.
                    mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */ },
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: terminalContextKey_1.TerminalContextKeys.focusInAny
                }],
            run: (xterm) => xterm.selectAll()
        });
        registerTerminalAction({
            id: "workbench.action.terminal.new" /* TerminalCommandId.New */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.new', "Create New Terminal"), original: 'Create New Terminal' },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.webExtensionContributedProfile),
            icon: terminalIcons_1.newTerminalIcon,
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 91 /* KeyCode.Backquote */,
                mac: { primary: 256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 91 /* KeyCode.Backquote */ },
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            run: async (c, accessor, args) => {
                let eventOrOptions = (0, types_1.isObject)(args) ? args : undefined;
                const workspaceContextService = accessor.get(workspace_1.IWorkspaceContextService);
                const commandService = accessor.get(commands_1.ICommandService);
                const folders = workspaceContextService.getWorkspace().folders;
                if (eventOrOptions && eventOrOptions instanceof MouseEvent && (eventOrOptions.altKey || eventOrOptions.ctrlKey)) {
                    await c.service.createTerminal({ location: { splitActiveTerminal: true } });
                    return;
                }
                if (c.service.isProcessSupportRegistered) {
                    eventOrOptions = !eventOrOptions || eventOrOptions instanceof MouseEvent ? {} : eventOrOptions;
                    let instance;
                    if (folders.length <= 1) {
                        // Allow terminal service to handle the path when there is only a
                        // single root
                        instance = await c.service.createTerminal(eventOrOptions);
                    }
                    else {
                        const cwd = (await pickTerminalCwd(accessor))?.cwd;
                        if (!cwd) {
                            // Don't create the instance if the workspace picker was canceled
                            return;
                        }
                        eventOrOptions.cwd = cwd;
                        instance = await c.service.createTerminal(eventOrOptions);
                    }
                    c.service.setActiveInstance(instance);
                    await focusActiveTerminal(instance, c);
                }
                else {
                    if (c.profileService.contributedProfiles.length > 0) {
                        commandService.executeCommand("workbench.action.terminal.newWithProfile" /* TerminalCommandId.NewWithProfile */);
                    }
                    else {
                        commandService.executeCommand("workbench.action.terminal.toggleTerminal" /* TerminalCommandId.Toggle */);
                    }
                }
            }
        });
        async function killInstance(c, instance) {
            if (!instance) {
                return;
            }
            await c.service.safeDisposeTerminal(instance);
            if (c.groupService.instances.length > 0) {
                await c.groupService.showPanel(true);
            }
        }
        registerTerminalAction({
            id: "workbench.action.terminal.kill" /* TerminalCommandId.Kill */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.kill', "Kill the Active Terminal Instance"), original: 'Kill the Active Terminal Instance' },
            precondition: contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.isOpen),
            icon: terminalIcons_1.killTerminalIcon,
            run: async (c) => killInstance(c, c.groupService.activeInstance)
        });
        registerTerminalAction({
            id: "workbench.action.terminal.killViewOrEditor" /* TerminalCommandId.KillViewOrEditor */,
            title: terminalStrings_1.terminalStrings.kill,
            f1: false,
            precondition: contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.isOpen),
            run: async (c) => killInstance(c, c.service.activeInstance)
        });
        registerTerminalAction({
            id: "workbench.action.terminal.killAll" /* TerminalCommandId.KillAll */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.killAll', "Kill All Terminals"), original: 'Kill All Terminals' },
            precondition: contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.isOpen),
            icon: codicons_1.Codicon.trash,
            run: async (c) => {
                const disposePromises = [];
                for (const instance of c.service.instances) {
                    disposePromises.push(c.service.safeDisposeTerminal(instance));
                }
                await Promise.all(disposePromises);
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.killEditor" /* TerminalCommandId.KillEditor */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.killEditor', "Kill the Active Terminal in Editor Area"), original: 'Kill the Active Terminal in Editor Area' },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 53 /* KeyCode.KeyW */,
                win: { primary: 2048 /* KeyMod.CtrlCmd */ | 62 /* KeyCode.F4 */, secondary: [2048 /* KeyMod.CtrlCmd */ | 53 /* KeyCode.KeyW */] },
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focus, contextkeys_1.ResourceContextKey.Scheme.isEqualTo(network_1.Schemas.vscodeTerminal), terminalContextKey_1.TerminalContextKeys.editorFocus)
            },
            run: (c, accessor) => accessor.get(commands_1.ICommandService).executeCommand(editorCommands_1.CLOSE_EDITOR_COMMAND_ID)
        });
        registerTerminalAction({
            id: "workbench.action.terminal.killActiveTab" /* TerminalCommandId.KillActiveTab */,
            title: terminalStrings_1.terminalStrings.kill,
            f1: false,
            precondition: contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.isOpen),
            keybinding: {
                primary: 20 /* KeyCode.Delete */,
                mac: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */,
                    secondary: [20 /* KeyCode.Delete */]
                },
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: terminalContextKey_1.TerminalContextKeys.tabsFocus
            },
            run: async (c, accessor) => {
                const selectedInstances = getSelectedInstances(accessor);
                if (!selectedInstances) {
                    return;
                }
                const listService = accessor.get(listService_1.IListService);
                const disposePromises = [];
                for (const instance of selectedInstances) {
                    disposePromises.push(c.service.safeDisposeTerminal(instance));
                }
                await Promise.all(disposePromises);
                if (c.service.instances.length > 0) {
                    c.groupService.focusTabs();
                    listService.lastFocusedList?.focusNext();
                }
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.focusHover" /* TerminalCommandId.FocusHover */,
            title: terminalStrings_1.terminalStrings.focusHover,
            precondition: contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.isOpen),
            keybinding: {
                primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.tabsFocus, terminalContextKey_1.TerminalContextKeys.focus)
            },
            run: (c) => c.groupService.focusHover()
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.clear" /* TerminalCommandId.Clear */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.clear', "Clear"), original: 'Clear' },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            keybinding: [{
                    primary: 0,
                    mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */ },
                    // Weight is higher than work workbench contributions so the keybinding remains
                    // highest priority when chords are registered afterwards
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
                    // Disable the keybinding when accessibility mode is enabled as chords include
                    // important screen reader keybindings such as cmd+k, cmd+i to show the hover
                    when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focus, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
                }],
            run: (activeInstance) => activeInstance.clearBuffer()
        });
        registerTerminalAction({
            id: "workbench.action.terminal.selectDefaultShell" /* TerminalCommandId.SelectDefaultProfile */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.selectDefaultShell', "Select Default Profile"), original: 'Select Default Profile' },
            run: (c) => c.service.showProfileQuickPick('setDefault')
        });
        registerTerminalAction({
            id: "workbench.action.terminal.openSettings" /* TerminalCommandId.ConfigureTerminalSettings */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.openSettings', "Configure Terminal Settings"), original: 'Configure Terminal Settings' },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (c, accessor) => accessor.get(preferences_1.IPreferencesService).openSettings({ jsonEditor: false, query: '@feature:terminal' })
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.setDimensions" /* TerminalCommandId.SetDimensions */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.setFixedDimensions', "Set Fixed Dimensions"), original: 'Set Fixed Dimensions' },
            precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.isOpen),
            run: (activeInstance) => activeInstance.setFixedDimensions()
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.sizeToContentWidth" /* TerminalCommandId.SizeToContentWidth */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.sizeToContentWidth', "Toggle Size to Content Width"), original: 'Toggle Size to Content Width' },
            precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.isOpen),
            keybinding: {
                primary: 512 /* KeyMod.Alt */ | 56 /* KeyCode.KeyZ */,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: terminalContextKey_1.TerminalContextKeys.focus
            },
            run: (instancactiveInstance) => instancactiveInstance.toggleSizeToContentWidth()
        });
        registerTerminalAction({
            id: "workbench.action.terminal.sizeToContentWidthActiveTab" /* TerminalCommandId.SizeToContentWidthActiveTab */,
            title: terminalStrings_1.terminalStrings.toggleSizeToContentWidth,
            f1: false,
            precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.focus),
            run: (c, accessor) => getSelectedInstances(accessor)?.[0].toggleSizeToContentWidth()
        });
        registerTerminalAction({
            id: "workbench.action.terminal.clearPreviousSessionHistory" /* TerminalCommandId.ClearPreviousSessionHistory */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.clearPreviousSessionHistory', "Clear Previous Session History"), original: 'Clear Previous Session History' },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: async (c, accessor) => {
                (0, history_2.getCommandHistory)(accessor).clear();
                (0, history_2.clearShellFileHistory)();
            }
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.selectPrevSuggestion" /* TerminalCommandId.SelectPrevSuggestion */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.selectPrevSuggestion', "Select the Previous Suggestion"), original: 'Select the Previous Suggestion' },
            f1: false,
            precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.isOpen, terminalContextKey_1.TerminalContextKeys.suggestWidgetVisible),
            keybinding: {
                // Up is bound to other workbench keybindings that this needs to beat
                primary: 16 /* KeyCode.UpArrow */,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1
            },
            run: (activeInstance) => activeInstance.selectPreviousSuggestion()
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.selectPrevPageSuggestion" /* TerminalCommandId.SelectPrevPageSuggestion */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.selectPrevPageSuggestion', "Select the Previous Page Suggestion"), original: 'Select the Previous Page Suggestion' },
            f1: false,
            precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.isOpen, terminalContextKey_1.TerminalContextKeys.suggestWidgetVisible),
            keybinding: {
                // Up is bound to other workbench keybindings that this needs to beat
                primary: 11 /* KeyCode.PageUp */,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1
            },
            run: (activeInstance) => activeInstance.selectPreviousPageSuggestion()
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.selectNextSuggestion" /* TerminalCommandId.SelectNextSuggestion */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.selectNextSuggestion', "Select the Next Suggestion"), original: 'Select the Next Suggestion' },
            f1: false,
            precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.isOpen, terminalContextKey_1.TerminalContextKeys.suggestWidgetVisible),
            keybinding: {
                // Down is bound to other workbench keybindings that this needs to beat
                primary: 18 /* KeyCode.DownArrow */,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1
            },
            run: (insactiveInstanceance) => insactiveInstanceance.selectNextSuggestion()
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.selectNextPageSuggestion" /* TerminalCommandId.SelectNextPageSuggestion */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.selectNextPageSuggestion', "Select the Next Page Suggestion"), original: 'Select the Next Page Suggestion' },
            f1: false,
            precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.isOpen, terminalContextKey_1.TerminalContextKeys.suggestWidgetVisible),
            keybinding: {
                // Down is bound to other workbench keybindings that this needs to beat
                primary: 12 /* KeyCode.PageDown */,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1
            },
            run: (activeInstance) => activeInstance.selectNextPageSuggestion()
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.acceptSelectedSuggestion" /* TerminalCommandId.AcceptSelectedSuggestion */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.acceptSelectedSuggestion', "Accept Selected Suggestion"), original: 'Accept Selected Suggestion' },
            f1: false,
            precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.isOpen, terminalContextKey_1.TerminalContextKeys.suggestWidgetVisible),
            keybinding: {
                primary: 3 /* KeyCode.Enter */,
                secondary: [2 /* KeyCode.Tab */],
                // Enter is bound to other workbench keybindings that this needs to beat
                weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1
            },
            run: (activeInstance) => activeInstance.acceptSelectedSuggestion()
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.hideSuggestWidget" /* TerminalCommandId.HideSuggestWidget */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.hideSuggestWidget', "Hide Suggest Widget"), original: 'Hide Suggest Widget' },
            f1: false,
            precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.isOpen, terminalContextKey_1.TerminalContextKeys.suggestWidgetVisible),
            keybinding: {
                primary: 9 /* KeyCode.Escape */,
                // Escape is bound to other workbench keybindings that this needs to beat
                weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1
            },
            run: (activeInstance) => activeInstance.hideSuggestWidget()
        });
        // Some commands depend on platform features
        if (canIUse_1.BrowserFeatures.clipboard.writeText) {
            registerActiveXtermAction({
                id: "workbench.action.terminal.copySelection" /* TerminalCommandId.CopySelection */,
                title: { value: (0, nls_1.localize)('workbench.action.terminal.copySelection', "Copy Selection"), original: 'Copy Selection' },
                // TODO: Why is copy still showing up when text isn't selected?
                precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.textSelectedInFocused, contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.textSelected)),
                keybinding: [{
                        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 33 /* KeyCode.KeyC */,
                        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */ },
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.textSelected, terminalContextKey_1.TerminalContextKeys.focus), terminalContextKey_1.TerminalContextKeys.textSelectedInFocused)
                    }],
                run: (activeInstance) => activeInstance.copySelection()
            });
            registerActiveXtermAction({
                id: "workbench.action.terminal.copyAndClearSelection" /* TerminalCommandId.CopyAndClearSelection */,
                title: { value: (0, nls_1.localize)('workbench.action.terminal.copyAndClearSelection', "Copy and Clear Selection"), original: 'Copy and Clear Selection' },
                precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.textSelectedInFocused, contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.textSelected)),
                keybinding: [{
                        win: { primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */ },
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.textSelected, terminalContextKey_1.TerminalContextKeys.focus), terminalContextKey_1.TerminalContextKeys.textSelectedInFocused)
                    }],
                run: async (xterm) => {
                    await xterm.copySelection();
                    xterm.clearSelection();
                }
            });
            registerActiveXtermAction({
                id: "workbench.action.terminal.copySelectionAsHtml" /* TerminalCommandId.CopySelectionAsHtml */,
                title: { value: (0, nls_1.localize)('workbench.action.terminal.copySelectionAsHtml', "Copy Selection as HTML"), original: 'Copy Selection as HTML' },
                f1: true,
                category,
                precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.textSelectedInFocused, contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.textSelected)),
                run: (xterm) => xterm.copySelection(true)
            });
        }
        if (canIUse_1.BrowserFeatures.clipboard.readText) {
            registerActiveInstanceAction({
                id: "workbench.action.terminal.paste" /* TerminalCommandId.Paste */,
                title: { value: (0, nls_1.localize)('workbench.action.terminal.paste', "Paste into Active Terminal"), original: 'Paste into Active Terminal' },
                precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
                keybinding: [{
                        primary: 2048 /* KeyMod.CtrlCmd */ | 52 /* KeyCode.KeyV */,
                        win: { primary: 2048 /* KeyMod.CtrlCmd */ | 52 /* KeyCode.KeyV */, secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 52 /* KeyCode.KeyV */] },
                        linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 52 /* KeyCode.KeyV */ },
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: terminalContextKey_1.TerminalContextKeys.focus
                    }],
                run: (activeInstance) => activeInstance.paste()
            });
        }
        if (canIUse_1.BrowserFeatures.clipboard.readText && platform_1.isLinux) {
            registerActiveInstanceAction({
                id: "workbench.action.terminal.pasteSelection" /* TerminalCommandId.PasteSelection */,
                title: { value: (0, nls_1.localize)('workbench.action.terminal.pasteSelection', "Paste Selection into Active Terminal"), original: 'Paste Selection into Active Terminal' },
                precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
                keybinding: [{
                        linux: { primary: 1024 /* KeyMod.Shift */ | 19 /* KeyCode.Insert */ },
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: terminalContextKey_1.TerminalContextKeys.focus
                    }],
                run: (activeInstance) => activeInstance.pasteSelection()
            });
        }
        registerTerminalAction({
            id: "workbench.action.terminal.switchTerminal" /* TerminalCommandId.SwitchTerminal */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.switchTerminal', "Switch Terminal"), original: 'Switch Terminal' },
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: async (c, accessor, args) => {
                const item = toOptionalString(args);
                if (!item) {
                    return;
                }
                if (item === exports.switchTerminalActionViewItemSeparator) {
                    c.service.refreshActiveGroup();
                    return;
                }
                if (item === exports.switchTerminalShowTabsTitle) {
                    accessor.get(configuration_1.IConfigurationService).updateValue("terminal.integrated.tabs.enabled" /* TerminalSettingId.TabsEnabled */, true);
                    return;
                }
                const terminalIndexRe = /^([0-9]+): /;
                const indexMatches = terminalIndexRe.exec(item);
                if (indexMatches) {
                    c.groupService.setActiveGroupByIndex(Number(indexMatches[1]) - 1);
                    return c.groupService.showPanel(true);
                }
                const quickSelectProfiles = c.profileService.availableProfiles;
                // Remove 'New ' from the selected item to get the profile name
                const profileSelection = item.substring(4);
                if (quickSelectProfiles) {
                    const profile = quickSelectProfiles.find(profile => profile.profileName === profileSelection);
                    if (profile) {
                        const instance = await c.service.createTerminal({
                            config: profile
                        });
                        c.service.setActiveInstance(instance);
                    }
                    else {
                        console.warn(`No profile with name "${profileSelection}"`);
                    }
                }
                else {
                    console.warn(`Unmatched terminal item: "${item}"`);
                }
            }
        });
    }
    exports.registerTerminalActions = registerTerminalActions;
    function getSelectedInstances(accessor) {
        const listService = accessor.get(listService_1.IListService);
        const terminalService = accessor.get(terminal_2.ITerminalService);
        const terminalGroupService = accessor.get(terminal_2.ITerminalGroupService);
        // Get inline tab instance
        if (terminalGroupService.lastAccessedMenu === 'inline-tab') {
            const instance = terminalGroupService.activeInstance;
            return instance ? [terminalGroupService.activeInstance] : undefined;
        }
        // Get tab list instance
        if (!listService.lastFocusedList?.getSelection()) {
            return undefined;
        }
        const selections = listService.lastFocusedList.getSelection();
        const focused = listService.lastFocusedList.getFocus();
        const instances = [];
        if (focused.length === 1 && !selections.includes(focused[0])) {
            // focused length is always a max of 1
            // if the focused one is not in the selected list, return that item
            instances.push(terminalService.getInstanceFromIndex(focused[0]));
            return instances;
        }
        // multi-select
        for (const selection of selections) {
            instances.push(terminalService.getInstanceFromIndex(selection));
        }
        return instances;
    }
    function validateTerminalName(name) {
        if (!name || name.trim().length === 0) {
            return {
                content: (0, nls_1.localize)('emptyTerminalNameInfo', "Providing no name will reset it to the default value"),
                severity: notification_1.Severity.Info
            };
        }
        return null;
    }
    exports.validateTerminalName = validateTerminalName;
    function convertOptionsOrProfileToOptions(optionsOrProfile) {
        if ((0, types_1.isObject)(optionsOrProfile) && 'profileName' in optionsOrProfile) {
            return { config: optionsOrProfile, location: optionsOrProfile.location };
        }
        return optionsOrProfile;
    }
    let newWithProfileAction;
    function refreshTerminalActions(detectedProfiles) {
        const profileEnum = (0, terminalProfiles_1.createProfileSchemaEnums)(detectedProfiles);
        newWithProfileAction?.dispose();
        // TODO: Use new register function
        newWithProfileAction = (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.newWithProfile" /* TerminalCommandId.NewWithProfile */,
                    title: { value: (0, nls_1.localize)('workbench.action.terminal.newWithProfile', "Create New Terminal (With Profile)"), original: 'Create New Terminal (With Profile)' },
                    f1: true,
                    category,
                    precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.webExtensionContributedProfile),
                    description: {
                        description: "workbench.action.terminal.newWithProfile" /* TerminalCommandId.NewWithProfile */,
                        args: [{
                                name: 'args',
                                schema: {
                                    type: 'object',
                                    required: ['profileName'],
                                    properties: {
                                        profileName: {
                                            description: (0, nls_1.localize)('workbench.action.terminal.newWithProfile.profileName', "The name of the profile to create"),
                                            type: 'string',
                                            enum: profileEnum.values,
                                            markdownEnumDescriptions: profileEnum.markdownDescriptions
                                        }
                                    }
                                }
                            }]
                    },
                });
            }
            async run(accessor, eventOrOptionsOrProfile, profile) {
                const c = getTerminalServices(accessor);
                const workspaceContextService = accessor.get(workspace_1.IWorkspaceContextService);
                const commandService = accessor.get(commands_1.ICommandService);
                let event;
                let options;
                let instance;
                let cwd;
                if ((0, types_1.isObject)(eventOrOptionsOrProfile) && eventOrOptionsOrProfile && 'profileName' in eventOrOptionsOrProfile) {
                    const config = c.profileService.availableProfiles.find(profile => profile.profileName === eventOrOptionsOrProfile.profileName);
                    if (!config) {
                        throw new Error(`Could not find terminal profile "${eventOrOptionsOrProfile.profileName}"`);
                    }
                    options = { config };
                }
                else if (eventOrOptionsOrProfile instanceof MouseEvent || eventOrOptionsOrProfile instanceof PointerEvent || eventOrOptionsOrProfile instanceof KeyboardEvent) {
                    event = eventOrOptionsOrProfile;
                    options = profile ? { config: profile } : undefined;
                }
                else {
                    options = convertOptionsOrProfileToOptions(eventOrOptionsOrProfile);
                }
                // split terminal
                if (event && (event.altKey || event.ctrlKey)) {
                    const parentTerminal = c.service.activeInstance;
                    if (parentTerminal) {
                        await c.service.createTerminal({ location: { parentTerminal }, config: options?.config });
                        return;
                    }
                }
                const folders = workspaceContextService.getWorkspace().folders;
                if (folders.length > 1) {
                    // multi-root workspace, create root picker
                    const options = {
                        placeHolder: (0, nls_1.localize)('workbench.action.terminal.newWorkspacePlaceholder', "Select current working directory for new terminal")
                    };
                    const workspace = await commandService.executeCommand(workspaceCommands_1.PICK_WORKSPACE_FOLDER_COMMAND_ID, [options]);
                    if (!workspace) {
                        // Don't create the instance if the workspace picker was canceled
                        return;
                    }
                    cwd = workspace.uri;
                }
                if (options) {
                    options.cwd = cwd;
                    instance = await c.service.createTerminal(options);
                }
                else {
                    instance = await c.service.showProfileQuickPick('createInstance', cwd);
                }
                if (instance) {
                    c.service.setActiveInstance(instance);
                    await focusActiveTerminal(instance, c);
                }
            }
        });
    }
    exports.refreshTerminalActions = refreshTerminalActions;
    function getResourceOrActiveInstance(c, resource) {
        return c.service.getInstanceFromResource(toOptionalUri(resource)) || c.service.activeInstance;
    }
    async function pickTerminalCwd(accessor, cancel) {
        const quickInputService = accessor.get(quickInput_1.IQuickInputService);
        const labelService = accessor.get(label_1.ILabelService);
        const contextService = accessor.get(workspace_1.IWorkspaceContextService);
        const modelService = accessor.get(model_1.IModelService);
        const languageService = accessor.get(language_1.ILanguageService);
        const configurationService = accessor.get(configuration_1.IConfigurationService);
        const configurationResolverService = accessor.get(configurationResolver_1.IConfigurationResolverService);
        const folders = contextService.getWorkspace().folders;
        if (!folders.length) {
            return;
        }
        const folderCwdPairs = await Promise.all(folders.map(x => resolveWorkspaceFolderCwd(x, configurationService, configurationResolverService)));
        const shrinkedPairs = shrinkWorkspaceFolderCwdPairs(folderCwdPairs);
        if (shrinkedPairs.length === 1) {
            return shrinkedPairs[0];
        }
        const folderPicks = shrinkedPairs.map(pair => {
            const label = pair.folder.name;
            const description = pair.isOverridden
                ? (0, nls_1.localize)('workbench.action.terminal.overriddenCwdDescription', "(Overriden) {0}", labelService.getUriLabel(pair.cwd, { relative: !pair.isAbsolute }))
                : labelService.getUriLabel((0, resources_1.dirname)(pair.cwd), { relative: true });
            return {
                label,
                description: description !== label ? description : undefined,
                pair: pair,
                iconClasses: (0, getIconClasses_1.getIconClasses)(modelService, languageService, pair.cwd, files_1.FileKind.ROOT_FOLDER)
            };
        });
        const options = {
            placeHolder: (0, nls_1.localize)('workbench.action.terminal.newWorkspacePlaceholder', "Select current working directory for new terminal"),
            matchOnDescription: true,
            canPickMany: false,
        };
        const token = cancel || cancellation_1.CancellationToken.None;
        const pick = await quickInputService.pick(folderPicks, options, token);
        return pick?.pair;
    }
    async function resolveWorkspaceFolderCwd(folder, configurationService, configurationResolverService) {
        const cwdConfig = configurationService.getValue("terminal.integrated.cwd" /* TerminalSettingId.Cwd */, { resource: folder.uri });
        if (!(0, types_1.isString)(cwdConfig) || cwdConfig.length === 0) {
            return { folder, cwd: folder.uri, isAbsolute: false, isOverridden: false };
        }
        const resolvedCwdConfig = await configurationResolverService.resolveAsync(folder, cwdConfig);
        return (0, path_1.isAbsolute)(resolvedCwdConfig) || resolvedCwdConfig.startsWith(variableResolver_1.AbstractVariableResolverService.VARIABLE_LHS)
            ? { folder, isAbsolute: true, isOverridden: true, cwd: uri_1.URI.from({ scheme: folder.uri.scheme, path: resolvedCwdConfig }) }
            : { folder, isAbsolute: false, isOverridden: true, cwd: uri_1.URI.joinPath(folder.uri, resolvedCwdConfig) };
    }
    /**
     * Drops repeated CWDs, if any, by keeping the one which best matches the workspace folder. It also preserves the original order.
     */
    function shrinkWorkspaceFolderCwdPairs(pairs) {
        const map = new Map();
        for (const pair of pairs) {
            const key = pair.cwd.toString();
            const value = map.get(key);
            if (!value || key === pair.folder.uri.toString()) {
                map.set(key, pair);
            }
        }
        const selectedPairs = new Set(map.values());
        const selectedPairsInOrder = pairs.filter(x => selectedPairs.has(x));
        return selectedPairsInOrder;
    }
    exports.shrinkWorkspaceFolderCwdPairs = shrinkWorkspaceFolderCwdPairs;
    async function focusActiveTerminal(instance, c) {
        if (instance.target === terminal_1.TerminalLocation.Editor) {
            await c.editorService.revealActiveEditor();
            await instance.focusWhenReady(true);
        }
        else {
            await c.groupService.showPanel(true);
        }
    }
    async function renameWithQuickPick(c, accessor, resource) {
        const instance = getResourceOrActiveInstance(c, resource);
        if (instance) {
            const title = await accessor.get(quickInput_1.IQuickInputService).input({
                value: instance.title,
                prompt: (0, nls_1.localize)('workbench.action.terminal.rename.prompt', "Enter terminal name"),
            });
            instance.rename(title);
        }
    }
    function toOptionalUri(obj) {
        return uri_1.URI.isUri(obj) ? obj : undefined;
    }
    function toOptionalString(obj) {
        return (0, types_1.isString)(obj) ? obj : undefined;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxBY3Rpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvYnJvd3Nlci90ZXJtaW5hbEFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBOERuRixRQUFBLHFDQUFxQyxHQUFHLHdEQUF3RCxDQUFDO0lBQ2pHLFFBQUEsMkJBQTJCLEdBQUcsSUFBQSxjQUFRLEVBQUMsa0JBQWtCLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFFckYsTUFBTSxRQUFRLEdBQUcsaUNBQWUsQ0FBQyxjQUFjLENBQUM7SUFTekMsS0FBSyxVQUFVLGNBQWMsQ0FBQyxZQUFtQyxFQUFFLFFBQTJCLEVBQUUsT0FBNEIsRUFBRSxjQUFnQztRQUNwSyxRQUFRLFlBQVksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO1lBQ3JDLEtBQUssZUFBZTtnQkFDbkIsSUFBSSxPQUFPLEtBQUssU0FBUyxJQUFJLGNBQWMsS0FBSyxTQUFTLEVBQUU7b0JBQzFELElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7d0JBQ3pCLE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztxQkFDdEI7eUJBQU0sSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTt3QkFDOUIscURBQXFEO3dCQUNyRCxNQUFNLE9BQU8sR0FBaUM7NEJBQzdDLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyxtREFBbUQsRUFBRSxtREFBbUQsQ0FBQzt5QkFDL0gsQ0FBQzt3QkFDRixNQUFNLFNBQVMsR0FBRyxNQUFNLGNBQWMsQ0FBQyxjQUFjLENBQUMsb0RBQWdDLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO3dCQUNuRyxJQUFJLENBQUMsU0FBUyxFQUFFOzRCQUNmLGdFQUFnRTs0QkFDaEUsT0FB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