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
define(["require", "exports", "vs/base/browser/canIUse", "vs/base/common/actions", "vs/base/common/codicons", "vs/base/common/keyCodes", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/types", "vs/base/common/uri", "vs/editor/browser/services/codeEditorService", "vs/nls!vs/workbench/contrib/terminal/browser/terminalActions", "vs/platform/accessibility/common/accessibility", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/label/common/label", "vs/platform/list/browser/listService", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/platform/terminal/common/terminal", "vs/platform/workspace/common/workspace", "vs/workbench/browser/actions/workspaceCommands", "vs/workbench/browser/parts/editor/editorCommands", "vs/workbench/common/contextkeys", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/terminalQuickAccess", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/platform/terminal/common/terminalProfiles", "vs/workbench/contrib/terminal/common/terminalStrings", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/history/common/history", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/editor/common/editorService", "vs/base/common/path", "vs/workbench/services/configurationResolver/common/variableResolver", "vs/platform/theme/common/themeService", "vs/workbench/contrib/terminal/browser/terminalIcon", "vs/workbench/contrib/terminal/common/history", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/base/common/cancellation", "vs/base/common/resources", "vs/editor/common/services/getIconClasses", "vs/platform/files/common/files", "vs/platform/clipboard/common/clipboardService", "vs/workbench/contrib/terminal/browser/terminalIcons", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/common/iterator", "vs/workbench/contrib/accessibility/browser/accessibilityConfiguration"], function (require, exports, canIUse_1, actions_1, codicons_1, keyCodes_1, network_1, platform_1, types_1, uri_1, codeEditorService_1, nls_1, accessibility_1, actions_2, commands_1, configuration_1, contextkey_1, label_1, listService_1, notification_1, opener_1, quickInput_1, terminal_1, workspace_1, workspaceCommands_1, editorCommands_1, contextkeys_1, terminal_2, terminalQuickAccess_1, terminal_3, terminalContextKey_1, terminalProfiles_1, terminalStrings_1, configurationResolver_1, environmentService_1, history_1, preferences_1, remoteAgentService_1, editorService_1, path_1, variableResolver_1, themeService_1, terminalIcon_1, history_2, model_1, language_1, cancellation_1, resources_1, getIconClasses_1, files_1, clipboardService_1, terminalIcons_1, editorGroupsService_1, iterator_1, accessibilityConfiguration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$NVb = exports.$MVb = exports.$LVb = exports.$KVb = exports.$JVb = exports.$IVb = exports.$HVb = exports.$GVb = exports.$FVb = exports.$EVb = exports.$DVb = exports.$CVb = void 0;
    exports.$CVb = '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500';
    exports.$DVb = (0, nls_1.localize)(0, null);
    const category = terminalStrings_1.$pVb.actionCategory;
    async function $EVb(configHelper, instance, folders, commandService) {
        switch (configHelper.config.splitCwd) {
            case 'workspaceRoot':
                if (folders !== undefined && commandService !== undefined) {
                    if (folders.length === 1) {
                        return folders[0].uri;
                    }
                    else if (folders.length > 1) {
                        // Only choose a path when there's more than 1 folder
                        const options = {
                            placeHolder: (0, nls_1.localize)(1, null)
                        };
                        const workspace = await commandService.executeCommand(workspaceCommands_1.$dgb, [options]);
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
    exports.$EVb = $EVb;
    const $FVb = async (accessor, args) => {
        const instance = accessor.get(terminal_2.$Mib).activeInstance;
        if (instance) {
            const text = (0, types_1.$lf)(args) && 'text' in args ? toOptionalString(args.text) : undefined;
            if (!text) {
                return;
            }
            const configurationResolverService = accessor.get(configurationResolver_1.$NM);
            const workspaceContextService = accessor.get(workspace_1.$Kh);
            const historyService = accessor.get(history_1.$SM);
            const activeWorkspaceRootUri = historyService.getLastActiveWorkspaceRoot(instance.isRemote ? network_1.Schemas.vscodeRemote : network_1.Schemas.file);
            const lastActiveWorkspaceRoot = activeWorkspaceRootUri ? workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? undefined : undefined;
            const resolvedText = await configurationResolverService.resolveAsync(lastActiveWorkspaceRoot, text);
            instance.sendText(resolvedText, false);
        }
    };
    exports.$FVb = $FVb;
    let $GVb = class $GVb extends actions_1.$gi {
        constructor(a) {
            super('workbench.action.terminal.launchHelp', (0, nls_1.localize)(2, null));
            this.a = a;
        }
        async run() {
            this.a.open('https://aka.ms/vscode-troubleshoot-terminal-launch');
        }
    };
    exports.$GVb = $GVb;
    exports.$GVb = $GVb = __decorate([
        __param(0, opener_1.$NT)
    ], $GVb);
    /**
     * A wrapper function around registerAction2 to help make registering terminal actions more concise.
     * The following default options are used if undefined:
     *
     * - `f1`: true
     * - `category`: Terminal
     * - `precondition`: TerminalContextKeys.processSupported
     */
    function $HVb(options) {
        // Set defaults
        options.f1 = options.f1 ?? true;
        options.category = options.category ?? category;
        options.precondition = options.precondition ?? terminalContextKey_1.TerminalContextKeys.processSupported;
        // Remove run function from options so it's not passed through to registerAction2
        const runFunc = options.run;
        const strictOptions = options;
        delete strictOptions['run'];
        // Register
        return (0, actions_2.$Xu)(class extends actions_2.$Wu {
            constructor() {
                super(strictOptions);
            }
            run(accessor, args) {
                return runFunc(getTerminalServices(accessor), accessor, args);
            }
        });
    }
    exports.$HVb = $HVb;
    /**
     * A wrapper around {@link $HVb} that ensures an active instance exists and
     * provides it to the run function.
     */
    function $IVb(options) {
        const originalRun = options.run;
        return $HVb({
            ...options,
            run: (c, accessor, args) => {
                const activeInstance = c.service.activeInstance;
                if (activeInstance) {
                    return originalRun(activeInstance, c, accessor, args);
                }
            }
        });
    }
    exports.$IVb = $IVb;
    /**
     * A wrapper around {@link $HVb} that ensures an active terminal
     * exists and provides it to the run function.
     *
     * This includes detached xterm terminals that are not managed by an {@link ITerminalInstance}.
     */
    function $JVb(options) {
        const originalRun = options.run;
        return $HVb({
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
    exports.$JVb = $JVb;
    function getTerminalServices(accessor) {
        return {
            service: accessor.get(terminal_2.$Mib),
            groupService: accessor.get(terminal_2.$Oib),
            instanceService: accessor.get(terminal_2.$Pib),
            editorService: accessor.get(terminal_2.$Nib),
            profileService: accessor.get(terminal_3.$GM),
            profileResolverService: accessor.get(terminal_3.$EM)
        };
    }
    function $KVb() {
        $HVb({
            id: "workbench.action.terminal.newInActiveWorkspace" /* TerminalCommandId.NewInActiveWorkspace */,
            title: { value: (0, nls_1.localize)(3, null), original: 'Create New Terminal (In Active Workspace)' },
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
        $MVb([]);
        $HVb({
            id: "workbench.action.createTerminalEditor" /* TerminalCommandId.CreateTerminalEditor */,
            title: { value: (0, nls_1.localize)(4, null), original: 'Create New Terminal in Editor Area' },
            run: async (c, _, args) => {
                const options = ((0, types_1.$lf)(args) && 'location' in args) ? args : { location: terminal_1.TerminalLocation.Editor };
                const instance = await c.service.createTerminal(options);
                instance.focusWhenReady();
            }
        });
        $HVb({
            id: "workbench.action.createTerminalEditorSameGroup" /* TerminalCommandId.CreateTerminalEditorSameGroup */,
            title: { value: (0, nls_1.localize)(5, null), original: 'Create New Terminal in Editor Area' },
            f1: false,
            run: async (c, accessor, args) => {
                // Force the editor into the same editor group if it's locked. This command is only ever
                // called when a terminal is the active editor
                const editorGroupsService = accessor.get(editorGroupsService_1.$5C);
                const instance = await c.service.createTerminal({
                    location: { viewColumn: editorGroupsService.activeGroup.index }
                });
                instance.focusWhenReady();
            }
        });
        $HVb({
            id: "workbench.action.createTerminalEditorSide" /* TerminalCommandId.CreateTerminalEditorSide */,
            title: { value: (0, nls_1.localize)(6, null), original: 'Create New Terminal in Editor Area to the Side' },
            run: async (c) => {
                const instance = await c.service.createTerminal({
                    location: { viewColumn: editorService_1.$$C }
                });
                instance.focusWhenReady();
            }
        });
        $IVb({
            id: "workbench.action.terminal.moveToEditor" /* TerminalCommandId.MoveToEditor */,
            title: terminalStrings_1.$pVb.moveToEditor,
            precondition: contextkey_1.$Ii.and(contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.terminalEditorActive.toNegated(), terminalContextKey_1.TerminalContextKeys.viewShowing),
            run: (activeInstance, c) => c.service.moveToEditor(activeInstance)
        });
        $HVb({
            id: "workbench.action.terminal.moveToEditorActiveTab" /* TerminalCommandId.MoveToEditorActiveTab */,
            title: terminalStrings_1.$pVb.moveToEditor,
            f1: false,
            precondition: contextkey_1.$Ii.and(contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.isOpen),
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
        $HVb({
            id: "workbench.action.terminal.moveToTerminalPanel" /* TerminalCommandId.MoveToTerminalPanel */,
            title: terminalStrings_1.$pVb.moveToTerminalPanel,
            precondition: contextkey_1.$Ii.and(contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.terminalEditorActive),
            run: (c, _, args) => {
                const source = toOptionalUri(args) ?? c.editorService.activeInstance;
                if (source) {
                    c.service.moveToTerminalView(source);
                }
            }
        });
        $HVb({
            id: "workbench.action.terminal.focusPreviousPane" /* TerminalCommandId.FocusPreviousPane */,
            title: { value: (0, nls_1.localize)(7, null), original: 'Focus Previous Terminal in Terminal Group' },
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
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: async (c) => {
                c.groupService.activeGroup?.focusPreviousPane();
                await c.groupService.showPanel(true);
            }
        });
        $HVb({
            id: "workbench.action.terminal.focusNextPane" /* TerminalCommandId.FocusNextPane */,
            title: { value: (0, nls_1.localize)(8, null), original: 'Focus Next Terminal in Terminal Group' },
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
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: async (c) => {
                c.groupService.activeGroup?.focusNextPane();
                await c.groupService.showPanel(true);
            }
        });
        $IVb({
            id: "workbench.action.terminal.runRecentCommand" /* TerminalCommandId.RunRecentCommand */,
            title: { value: (0, nls_1.localize)(9, null), original: 'Run Recent Command...' },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            keybinding: [
                {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 48 /* KeyCode.KeyR */,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 48 /* KeyCode.KeyR */ },
                    when: contextkey_1.$Ii.and(terminalContextKey_1.TerminalContextKeys.focus, accessibility_1.$2r),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 48 /* KeyCode.KeyR */,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 512 /* KeyMod.Alt */ | 48 /* KeyCode.KeyR */ },
                    when: contextkey_1.$Ii.and(terminalContextKey_1.TerminalContextKeys.focus, accessibility_1.$2r.negate()),
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
        $IVb({
            id: "workbench.action.terminal.copyLastCommandOutput" /* TerminalCommandId.CopyLastCommandOutput */,
            title: { value: (0, nls_1.localize)(10, null), original: 'Copy Last Command Output' },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: async (instance, c, accessor) => {
                const clipboardService = accessor.get(clipboardService_1.$UZ);
                const commands = instance.capabilities.get(2 /* TerminalCapability.CommandDetection */)?.commands;
                if (!commands || commands.length === 0) {
                    return;
                }
                const command = commands[commands.length - 1];
                if (!command?.hasOutput()) {
                    return;
                }
                const output = command.getOutput();
                if ((0, types_1.$jf)(output)) {
                    await clipboardService.writeText(output);
                }
            }
        });
        $IVb({
            id: "workbench.action.terminal.goToRecentDirectory" /* TerminalCommandId.GoToRecentDirectory */,
            title: { value: (0, nls_1.localize)(11, null), original: 'Go to Recent Directory...' },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
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
        $HVb({
            id: "workbench.action.terminal.resizePaneLeft" /* TerminalCommandId.ResizePaneLeft */,
            title: { value: (0, nls_1.localize)(12, null), original: 'Resize Terminal Left' },
            keybinding: {
                linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 15 /* KeyCode.LeftArrow */ },
                mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 15 /* KeyCode.LeftArrow */ },
                when: terminalContextKey_1.TerminalContextKeys.focus,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (c) => c.groupService.activeGroup?.resizePane(0 /* Direction.Left */)
        });
        $HVb({
            id: "workbench.action.terminal.resizePaneRight" /* TerminalCommandId.ResizePaneRight */,
            title: { value: (0, nls_1.localize)(13, null), original: 'Resize Terminal Right' },
            keybinding: {
                linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 17 /* KeyCode.RightArrow */ },
                mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 17 /* KeyCode.RightArrow */ },
                when: terminalContextKey_1.TerminalContextKeys.focus,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (c) => c.groupService.activeGroup?.resizePane(1 /* Direction.Right */)
        });
        $HVb({
            id: "workbench.action.terminal.resizePaneUp" /* TerminalCommandId.ResizePaneUp */,
            title: { value: (0, nls_1.localize)(14, null), original: 'Resize Terminal Up' },
            keybinding: {
                mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 16 /* KeyCode.UpArrow */ },
                when: terminalContextKey_1.TerminalContextKeys.focus,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (c) => c.groupService.activeGroup?.resizePane(2 /* Direction.Up */)
        });
        $HVb({
            id: "workbench.action.terminal.resizePaneDown" /* TerminalCommandId.ResizePaneDown */,
            title: { value: (0, nls_1.localize)(15, null), original: 'Resize Terminal Down' },
            keybinding: {
                mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 18 /* KeyCode.DownArrow */ },
                when: terminalContextKey_1.TerminalContextKeys.focus,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (c) => c.groupService.activeGroup?.resizePane(3 /* Direction.Down */)
        });
        $HVb({
            id: "workbench.action.terminal.focus" /* TerminalCommandId.Focus */,
            title: terminalStrings_1.$pVb.focus,
            keybinding: {
                when: contextkey_1.$Ii.and(accessibility_1.$2r, accessibilityConfiguration_1.$nqb, accessibilityConfiguration_1.$oqb.isEqualTo("terminal" /* AccessibleViewProviderId.Terminal */)),
                primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: async (c) => {
                const instance = c.service.activeInstance || await c.service.createTerminal({ location: terminal_1.TerminalLocation.Panel });
                if (!instance) {
                    return;
                }
                c.service.setActiveInstance(instance);
                focusActiveTerminal(instance, c);
            }
        });
        $HVb({
            id: "workbench.action.terminal.focusTabs" /* TerminalCommandId.FocusTabs */,
            title: { value: (0, nls_1.localize)(16, null), original: 'Focus Terminal Tabs View' },
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 93 /* KeyCode.Backslash */,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.tabsFocus, terminalContextKey_1.TerminalContextKeys.focus),
            },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (c) => c.groupService.focusTabs()
        });
        $HVb({
            id: "workbench.action.terminal.focusNext" /* TerminalCommandId.FocusNext */,
            title: { value: (0, nls_1.localize)(17, null), original: 'Focus Next Terminal Group' },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 12 /* KeyCode.PageDown */,
                mac: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 94 /* KeyCode.BracketRight */
                },
                when: contextkey_1.$Ii.and(terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.editorFocus.negate()),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            run: async (c) => {
                c.groupService.setActiveGroupToNext();
                await c.groupService.showPanel(true);
            }
        });
        $HVb({
            id: "workbench.action.terminal.focusPrevious" /* TerminalCommandId.FocusPrevious */,
            title: { value: (0, nls_1.localize)(18, null), original: 'Focus Previous Terminal Group' },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 11 /* KeyCode.PageUp */,
                mac: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 92 /* KeyCode.BracketLeft */
                },
                when: contextkey_1.$Ii.and(terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.editorFocus.negate()),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            run: async (c) => {
                c.groupService.setActiveGroupToPrevious();
                await c.groupService.showPanel(true);
            }
        });
        $HVb({
            id: "workbench.action.terminal.runSelectedText" /* TerminalCommandId.RunSelectedText */,
            title: { value: (0, nls_1.localize)(19, null), original: 'Run Selected Text In Active Terminal' },
            run: async (c, accessor) => {
                const codeEditorService = accessor.get(codeEditorService_1.$nV);
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
                    const endOfLinePreference = platform_1.$i ? 1 /* EndOfLinePreference.LF */ : 2 /* EndOfLinePreference.CRLF */;
                    text = editor.getModel().getValueInRange(selection, endOfLinePreference);
                }
                instance.sendText(text, true, true);
                await c.service.revealActiveTerminal();
            }
        });
        $HVb({
            id: "workbench.action.terminal.runActiveFile" /* TerminalCommandId.RunActiveFile */,
            title: { value: (0, nls_1.localize)(20, null), original: 'Run Active File In Active Terminal' },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: async (c, accessor) => {
                const codeEditorService = accessor.get(codeEditorService_1.$nV);
                const notificationService = accessor.get(notification_1.$Yu);
                const workbenchEnvironmentService = accessor.get(environmentService_1.$hJ);
                const editor = codeEditorService.getActiveCodeEditor();
                if (!editor || !editor.hasModel()) {
                    return;
                }
                const instance = await c.service.getActiveOrCreateInstance({ acceptsInput: true });
                const isRemote = instance ? instance.isRemote : (workbenchEnvironmentService.remoteAuthority ? true : false);
                const uri = editor.getModel().uri;
                if ((!isRemote && uri.scheme !== network_1.Schemas.file && uri.scheme !== network_1.Schemas.vscodeUserData) || (isRemote && uri.scheme !== network_1.Schemas.vscodeRemote)) {
                    notificationService.warn((0, nls_1.localize)(21, null));
                    return;
                }
                // TODO: Convert this to ctrl+c, ctrl+v for pwsh?
                await instance.sendPath(uri, true);
                return c.groupService.showPanel();
            }
        });
        $JVb({
            id: "workbench.action.terminal.scrollDown" /* TerminalCommandId.ScrollDownLine */,
            title: { value: (0, nls_1.localize)(22, null), original: 'Scroll Down (Line)' },
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 12 /* KeyCode.PageDown */,
                linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 18 /* KeyCode.DownArrow */ },
                when: contextkey_1.$Ii.and(terminalContextKey_1.TerminalContextKeys.focusInAny, terminalContextKey_1.TerminalContextKeys.altBufferActive.negate()),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (xterm) => xterm.scrollDownLine()
        });
        $JVb({
            id: "workbench.action.terminal.scrollDownPage" /* TerminalCommandId.ScrollDownPage */,
            title: { value: (0, nls_1.localize)(23, null), original: 'Scroll Down (Page)' },
            keybinding: {
                primary: 1024 /* KeyMod.Shift */ | 12 /* KeyCode.PageDown */,
                mac: { primary: 12 /* KeyCode.PageDown */ },
                when: contextkey_1.$Ii.and(terminalContextKey_1.TerminalContextKeys.focusInAny, terminalContextKey_1.TerminalContextKeys.altBufferActive.negate()),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (xterm) => xterm.scrollDownPage()
        });
        $JVb({
            id: "workbench.action.terminal.scrollToBottom" /* TerminalCommandId.ScrollToBottom */,
            title: { value: (0, nls_1.localize)(24, null), original: 'Scroll to Bottom' },
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 13 /* KeyCode.End */,
                linux: { primary: 1024 /* KeyMod.Shift */ | 13 /* KeyCode.End */ },
                when: contextkey_1.$Ii.and(terminalContextKey_1.TerminalContextKeys.focusInAny, terminalContextKey_1.TerminalContextKeys.altBufferActive.negate()),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (xterm) => xterm.scrollToBottom()
        });
        $JVb({
            id: "workbench.action.terminal.scrollUp" /* TerminalCommandId.ScrollUpLine */,
            title: { value: (0, nls_1.localize)(25, null), original: 'Scroll Up (Line)' },
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 11 /* KeyCode.PageUp */,
                linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 16 /* KeyCode.UpArrow */ },
                when: contextkey_1.$Ii.and(terminalContextKey_1.TerminalContextKeys.focusInAny, terminalContextKey_1.TerminalContextKeys.altBufferActive.negate()),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (xterm) => xterm.scrollUpLine()
        });
        $JVb({
            id: "workbench.action.terminal.scrollUpPage" /* TerminalCommandId.ScrollUpPage */,
            title: { value: (0, nls_1.localize)(26, null), original: 'Scroll Up (Page)' },
            f1: true,
            category,
            keybinding: {
                primary: 1024 /* KeyMod.Shift */ | 11 /* KeyCode.PageUp */,
                mac: { primary: 11 /* KeyCode.PageUp */ },
                when: contextkey_1.$Ii.and(terminalContextKey_1.TerminalContextKeys.focusInAny, terminalContextKey_1.TerminalContextKeys.altBufferActive.negate()),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (xterm) => xterm.scrollUpPage()
        });
        $JVb({
            id: "workbench.action.terminal.scrollToTop" /* TerminalCommandId.ScrollToTop */,
            title: { value: (0, nls_1.localize)(27, null), original: 'Scroll to Top' },
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 14 /* KeyCode.Home */,
                linux: { primary: 1024 /* KeyMod.Shift */ | 14 /* KeyCode.Home */ },
                when: contextkey_1.$Ii.and(terminalContextKey_1.TerminalContextKeys.focusInAny, terminalContextKey_1.TerminalContextKeys.altBufferActive.negate()),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (xterm) => xterm.scrollToTop()
        });
        $JVb({
            id: "workbench.action.terminal.clearSelection" /* TerminalCommandId.ClearSelection */,
            title: { value: (0, nls_1.localize)(28, null), original: 'Clear Selection' },
            keybinding: {
                primary: 9 /* KeyCode.Escape */,
                when: contextkey_1.$Ii.and(terminalContextKey_1.TerminalContextKeys.focusInAny, terminalContextKey_1.TerminalContextKeys.textSelected, terminalContextKey_1.TerminalContextKeys.notFindVisible),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (xterm) => {
                if (xterm.hasSelection()) {
                    xterm.clearSelection();
                }
            }
        });
        $HVb({
            id: "workbench.action.terminal.changeIcon" /* TerminalCommandId.ChangeIcon */,
            title: terminalStrings_1.$pVb.changeIcon,
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (c, _, args) => getResourceOrActiveInstance(c, args)?.changeIcon()
        });
        $HVb({
            id: "workbench.action.terminal.changeIconPanel" /* TerminalCommandId.ChangeIconPanel */,
            title: terminalStrings_1.$pVb.changeIcon,
            f1: false,
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (c) => c.groupService.activeInstance?.changeIcon()
        });
        $HVb({
            id: "workbench.action.terminal.changeIconActiveTab" /* TerminalCommandId.ChangeIconActiveTab */,
            title: terminalStrings_1.$pVb.changeIcon,
            f1: false,
            precondition: contextkey_1.$Ii.and(contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.tabsSingularSelection),
            run: (c, accessor) => getSelectedInstances(accessor)?.[0].changeIcon()
        });
        $HVb({
            id: "workbench.action.terminal.changeColor" /* TerminalCommandId.ChangeColor */,
            title: terminalStrings_1.$pVb.changeColor,
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (c, _, args) => getResourceOrActiveInstance(c, args)?.changeColor()
        });
        $HVb({
            id: "workbench.action.terminal.changeColorPanel" /* TerminalCommandId.ChangeColorPanel */,
            title: terminalStrings_1.$pVb.changeColor,
            f1: false,
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (c) => c.groupService.activeInstance?.changeColor()
        });
        $HVb({
            id: "workbench.action.terminal.changeColorActiveTab" /* TerminalCommandId.ChangeColorActiveTab */,
            title: terminalStrings_1.$pVb.changeColor,
            f1: false,
            precondition: contextkey_1.$Ii.and(contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.tabsSingularSelection),
            run: (c, accessor) => getSelectedInstances(accessor)?.[0].changeColor()
        });
        $HVb({
            id: "workbench.action.terminal.rename" /* TerminalCommandId.Rename */,
            title: terminalStrings_1.$pVb.rename,
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (c, accessor, args) => renameWithQuickPick(c, accessor, args)
        });
        $HVb({
            id: "workbench.action.terminal.renamePanel" /* TerminalCommandId.RenamePanel */,
            title: terminalStrings_1.$pVb.rename,
            f1: false,
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (c, accessor) => renameWithQuickPick(c, accessor)
        });
        $HVb({
            id: "workbench.action.terminal.renameActiveTab" /* TerminalCommandId.RenameActiveTab */,
            title: terminalStrings_1.$pVb.rename,
            f1: false,
            keybinding: {
                primary: 60 /* KeyCode.F2 */,
                mac: {
                    primary: 3 /* KeyCode.Enter */
                },
                when: contextkey_1.$Ii.and(terminalContextKey_1.TerminalContextKeys.tabsFocus),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.$Ii.and(contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.tabsSingularSelection),
            run: async (c, accessor) => {
                const notificationService = accessor.get(notification_1.$Yu);
                const instance = getSelectedInstances(accessor)?.[0];
                if (!instance) {
                    return;
                }
                c.service.setEditingTerminal(instance);
                c.service.setEditable(instance, {
                    validationMessage: value => $LVb(value),
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
        $IVb({
            id: "workbench.action.terminal.detachSession" /* TerminalCommandId.DetachSession */,
            title: { value: (0, nls_1.localize)(29, null), original: 'Detach Session' },
            run: (activeInstance) => activeInstance.detachProcessAndDispose(terminal_1.TerminalExitReason.User)
        });
        $HVb({
            id: "workbench.action.terminal.attachToSession" /* TerminalCommandId.AttachToSession */,
            title: { value: (0, nls_1.localize)(30, null), original: 'Attach to Session' },
            run: async (c, accessor) => {
                const quickInputService = accessor.get(quickInput_1.$Gq);
                const labelService = accessor.get(label_1.$Vz);
                const remoteAgentService = accessor.get(remoteAgentService_1.$jm);
                const notificationService = accessor.get(notification_1.$Yu);
                const remoteAuthority = remoteAgentService.getConnection()?.remoteAuthority ?? undefined;
                const backend = await accessor.get(terminal_2.$Pib).getBackend(remoteAuthority);
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
                    notificationService.info((0, nls_1.localize)(31, null));
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
        $HVb({
            id: "workbench.action.quickOpenTerm" /* TerminalCommandId.QuickOpenTerm */,
            title: { value: (0, nls_1.localize)(32, null), original: 'Switch Active Terminal' },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (c, accessor) => accessor.get(quickInput_1.$Gq).quickAccess.show(terminalQuickAccess_1.$qVb.PREFIX)
        });
        $IVb({
            id: "workbench.action.terminal.scrollToPreviousCommand" /* TerminalCommandId.ScrollToPreviousCommand */,
            title: { value: (0, nls_1.localize)(33, null), original: 'Scroll To Previous Command' },
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */,
                when: contextkey_1.$Ii.and(terminalContextKey_1.TerminalContextKeys.focus, accessibility_1.$2r.negate()),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (activeInstance) => activeInstance.xterm?.markTracker.scrollToPreviousMark(undefined, undefined, activeInstance.capabilities.has(2 /* TerminalCapability.CommandDetection */))
        });
        $IVb({
            id: "workbench.action.terminal.scrollToNextCommand" /* TerminalCommandId.ScrollToNextCommand */,
            title: { value: (0, nls_1.localize)(34, null), original: 'Scroll To Next Command' },
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
                when: contextkey_1.$Ii.and(terminalContextKey_1.TerminalContextKeys.focus, accessibility_1.$2r.negate()),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (activeInstance) => {
                activeInstance.xterm?.markTracker.scrollToNextMark();
                activeInstance.focus();
            }
        });
        $IVb({
            id: "workbench.action.terminal.selectToPreviousCommand" /* TerminalCommandId.SelectToPreviousCommand */,
            title: { value: (0, nls_1.localize)(35, null), original: 'Select To Previous Command' },
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 16 /* KeyCode.UpArrow */,
                when: terminalContextKey_1.TerminalContextKeys.focus,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (activeInstance) => {
                activeInstance.xterm?.markTracker.selectToPreviousMark();
                activeInstance.focus();
            }
        });
        $IVb({
            id: "workbench.action.terminal.selectToNextCommand" /* TerminalCommandId.SelectToNextCommand */,
            title: { value: (0, nls_1.localize)(36, null), original: 'Select To Next Command' },
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 18 /* KeyCode.DownArrow */,
                when: terminalContextKey_1.TerminalContextKeys.focus,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (activeInstance) => {
                activeInstance.xterm?.markTracker.selectToNextMark();
                activeInstance.focus();
            }
        });
        $JVb({
            id: "workbench.action.terminal.selectToPreviousLine" /* TerminalCommandId.SelectToPreviousLine */,
            title: { value: (0, nls_1.localize)(37, null), original: 'Select To Previous Line' },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: async (xterm, _, instance) => {
                xterm.markTracker.selectToPreviousLine();
                // prefer to call focus on the TerminalInstance for additional accessibility triggers
                (instance || xterm).focus();
            }
        });
        $JVb({
            id: "workbench.action.terminal.selectToNextLine" /* TerminalCommandId.SelectToNextLine */,
            title: { value: (0, nls_1.localize)(38, null), original: 'Select To Next Line' },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: async (xterm, _, instance) => {
                xterm.markTracker.selectToNextLine();
                // prefer to call focus on the TerminalInstance for additional accessibility triggers
                (instance || xterm).focus();
            }
        });
        $HVb({
            id: "workbench.action.terminal.sendSequence" /* TerminalCommandId.SendSequence */,
            title: terminalStrings_1.$pVb.sendSequence,
            f1: false,
            description: {
                description: terminalStrings_1.$pVb.sendSequence.value,
                args: [{
                        name: 'args',
                        schema: {
                            type: 'object',
                            required: ['text'],
                            properties: {
                                text: {
                                    description: (0, nls_1.localize)(39, null),
                                    type: 'string'
                                }
                            },
                        }
                    }]
            },
            run: (c, accessor, args) => (0, exports.$FVb)(accessor, args)
        });
        $HVb({
            id: "workbench.action.terminal.newWithCwd" /* TerminalCommandId.NewWithCwd */,
            title: terminalStrings_1.$pVb.newWithCwd,
            description: {
                description: terminalStrings_1.$pVb.newWithCwd.value,
                args: [{
                        name: 'args',
                        schema: {
                            type: 'object',
                            required: ['cwd'],
                            properties: {
                                cwd: {
                                    description: (0, nls_1.localize)(40, null),
                                    type: 'string'
                                }
                            },
                        }
                    }]
            },
            run: async (c, _, args) => {
                const cwd = (0, types_1.$lf)(args) && 'cwd' in args ? toOptionalString(args.cwd) : undefined;
                const instance = await c.service.createTerminal({ cwd });
                if (!instance) {
                    return;
                }
                c.service.setActiveInstance(instance);
                await focusActiveTerminal(instance, c);
            }
        });
        $IVb({
            id: "workbench.action.terminal.renameWithArg" /* TerminalCommandId.RenameWithArgs */,
            title: terminalStrings_1.$pVb.renameWithArgs,
            description: {
                description: terminalStrings_1.$pVb.renameWithArgs.value,
                args: [{
                        name: 'args',
                        schema: {
                            type: 'object',
                            required: ['name'],
                            properties: {
                                name: {
                                    description: (0, nls_1.localize)(41, null),
                                    type: 'string',
                                    minLength: 1
                                }
                            }
                        }
                    }]
            },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: async (activeInstance, c, accessor, args) => {
                const notificationService = accessor.get(notification_1.$Yu);
                const name = (0, types_1.$lf)(args) && 'name' in args ? toOptionalString(args.name) : undefined;
                if (!name) {
                    notificationService.warn((0, nls_1.localize)(42, null));
                    return;
                }
                activeInstance.rename(name);
            }
        });
        $IVb({
            id: "workbench.action.terminal.relaunch" /* TerminalCommandId.Relaunch */,
            title: { value: (0, nls_1.localize)(43, null), original: 'Relaunch Active Terminal' },
            run: (activeInstance) => activeInstance.relaunch()
        });
        $HVb({
            id: "workbench.action.terminal.split" /* TerminalCommandId.Split */,
            title: terminalStrings_1.$pVb.split,
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.webExtensionContributedProfile),
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 26 /* KeyCode.Digit5 */,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                mac: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 93 /* KeyCode.Backslash */,
                    secondary: [256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 26 /* KeyCode.Digit5 */]
                },
                when: terminalContextKey_1.TerminalContextKeys.focus
            },
            icon: codicons_1.$Pj.splitHorizontal,
            run: async (c, accessor, args) => {
                const optionsOrProfile = (0, types_1.$lf)(args) ? args : undefined;
                const commandService = accessor.get(commands_1.$Fr);
                const workspaceContextService = accessor.get(workspace_1.$Kh);
                const options = convertOptionsOrProfileToOptions(optionsOrProfile);
                const activeInstance = (await c.service.getInstanceHost(options?.location)).activeInstance;
                if (!activeInstance) {
                    return;
                }
                const cwd = await $EVb(c.service.configHelper, activeInstance, workspaceContextService.getWorkspace().folders, commandService);
                if (cwd === undefined) {
                    return;
                }
                const instance = await c.service.createTerminal({ location: { parentTerminal: activeInstance }, config: options?.config, cwd });
                await focusActiveTerminal(instance, c);
            }
        });
        $HVb({
            id: "workbench.action.terminal.splitActiveTab" /* TerminalCommandId.SplitActiveTab */,
            title: terminalStrings_1.$pVb.split,
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
        $IVb({
            id: "workbench.action.terminal.unsplit" /* TerminalCommandId.Unsplit */,
            title: terminalStrings_1.$pVb.unsplit,
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (activeInstance, c) => c.groupService.unsplitInstance(activeInstance)
        });
        $HVb({
            id: "workbench.action.terminal.unsplitActiveTab" /* TerminalCommandId.UnsplitActiveTab */,
            title: terminalStrings_1.$pVb.unsplit,
            f1: false,
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
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
        $HVb({
            id: "workbench.action.terminal.joinActiveTab" /* TerminalCommandId.JoinActiveTab */,
            title: { value: (0, nls_1.localize)(44, null), original: 'Join Terminals' },
            precondition: contextkey_1.$Ii.and(contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.tabsSingularSelection.toNegated()),
            run: async (c, accessor) => {
                const instances = getSelectedInstances(accessor);
                if (instances && instances.length > 1) {
                    c.groupService.joinInstances(instances);
                }
            }
        });
        $HVb({
            id: "workbench.action.terminal.join" /* TerminalCommandId.Join */,
            title: { value: (0, nls_1.localize)(45, null), original: 'Join Terminals' },
            precondition: contextkey_1.$Ii.and(contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated)),
            run: async (c, accessor) => {
                const themeService = accessor.get(themeService_1.$gv);
                const notificationService = accessor.get(notification_1.$Yu);
                const quickInputService = accessor.get(quickInput_1.$Gq);
                const picks = [];
                if (c.groupService.instances.length <= 1) {
                    notificationService.warn((0, nls_1.localize)(46, null));
                    return;
                }
                const otherInstances = c.groupService.instances.filter(i => i.instanceId !== c.groupService.activeInstance?.instanceId);
                for (const terminal of otherInstances) {
                    const group = c.groupService.getGroupForInstance(terminal);
                    if (group?.terminalInstances.length === 1) {
                        const iconId = (0, terminalIcon_1.$Yib)(accessor, terminal);
                        const label = `$(${iconId}): ${terminal.title}`;
                        const iconClasses = [];
                        const colorClass = (0, terminalIcon_1.$Tib)(terminal);
                        if (colorClass) {
                            iconClasses.push(colorClass);
                        }
                        const uriClasses = (0, terminalIcon_1.$Xib)(terminal, themeService.getColorTheme().type);
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
                    notificationService.warn((0, nls_1.localize)(47, null));
                    return;
                }
                const result = await quickInputService.pick(picks, {});
                if (result) {
                    c.groupService.joinInstances([result.terminal, c.groupService.activeInstance]);
                }
            }
        });
        $IVb({
            id: "workbench.action.terminal.splitInActiveWorkspace" /* TerminalCommandId.SplitInActiveWorkspace */,
            title: { value: (0, nls_1.localize)(48, null), original: 'Split Terminal (In Active Workspace)' },
            run: async (instance, c) => {
                const newInstance = await c.service.createTerminal({ location: { parentTerminal: instance } });
                if (newInstance?.target !== terminal_1.TerminalLocation.Editor) {
                    await c.groupService.showPanel(true);
                }
            }
        });
        $JVb({
            id: "workbench.action.terminal.selectAll" /* TerminalCommandId.SelectAll */,
            title: { value: (0, nls_1.localize)(49, null), original: 'Select All' },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
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
        $HVb({
            id: "workbench.action.terminal.new" /* TerminalCommandId.New */,
            title: { value: (0, nls_1.localize)(50, null), original: 'Create New Terminal' },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.webExtensionContributedProfile),
            icon: terminalIcons_1.$qib,
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 91 /* KeyCode.Backquote */,
                mac: { primary: 256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 91 /* KeyCode.Backquote */ },
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            run: async (c, accessor, args) => {
                let eventOrOptions = (0, types_1.$lf)(args) ? args : undefined;
                const workspaceContextService = accessor.get(workspace_1.$Kh);
                const commandService = accessor.get(commands_1.$Fr);
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
        $HVb({
            id: "workbench.action.terminal.kill" /* TerminalCommandId.Kill */,
            title: { value: (0, nls_1.localize)(51, null), original: 'Kill the Active Terminal Instance' },
            precondition: contextkey_1.$Ii.or(contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.isOpen),
            icon: terminalIcons_1.$pib,
            run: async (c) => killInstance(c, c.groupService.activeInstance)
        });
        $HVb({
            id: "workbench.action.terminal.killViewOrEditor" /* TerminalCommandId.KillViewOrEditor */,
            title: terminalStrings_1.$pVb.kill,
            f1: false,
            precondition: contextkey_1.$Ii.or(contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.isOpen),
            run: async (c) => killInstance(c, c.service.activeInstance)
        });
        $HVb({
            id: "workbench.action.terminal.killAll" /* TerminalCommandId.KillAll */,
            title: { value: (0, nls_1.localize)(52, null), original: 'Kill All Terminals' },
            precondition: contextkey_1.$Ii.or(contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.isOpen),
            icon: codicons_1.$Pj.trash,
            run: async (c) => {
                const disposePromises = [];
                for (const instance of c.service.instances) {
                    disposePromises.push(c.service.safeDisposeTerminal(instance));
                }
                await Promise.all(disposePromises);
            }
        });
        $HVb({
            id: "workbench.action.terminal.killEditor" /* TerminalCommandId.KillEditor */,
            title: { value: (0, nls_1.localize)(53, null), original: 'Kill the Active Terminal in Editor Area' },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 53 /* KeyCode.KeyW */,
                win: { primary: 2048 /* KeyMod.CtrlCmd */ | 62 /* KeyCode.F4 */, secondary: [2048 /* KeyMod.CtrlCmd */ | 53 /* KeyCode.KeyW */] },
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.$Ii.and(terminalContextKey_1.TerminalContextKeys.focus, contextkeys_1.$Kdb.Scheme.isEqualTo(network_1.Schemas.vscodeTerminal), terminalContextKey_1.TerminalContextKeys.editorFocus)
            },
            run: (c, accessor) => accessor.get(commands_1.$Fr).executeCommand(editorCommands_1.$iub)
        });
        $HVb({
            id: "workbench.action.terminal.killActiveTab" /* TerminalCommandId.KillActiveTab */,
            title: terminalStrings_1.$pVb.kill,
            f1: false,
            precondition: contextkey_1.$Ii.or(contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.isOpen),
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
                const listService = accessor.get(listService_1.$03);
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
        $HVb({
            id: "workbench.action.terminal.focusHover" /* TerminalCommandId.FocusHover */,
            title: terminalStrings_1.$pVb.focusHover,
            precondition: contextkey_1.$Ii.or(contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.isOpen),
            keybinding: {
                primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.tabsFocus, terminalContextKey_1.TerminalContextKeys.focus)
            },
            run: (c) => c.groupService.focusHover()
        });
        $IVb({
            id: "workbench.action.terminal.clear" /* TerminalCommandId.Clear */,
            title: { value: (0, nls_1.localize)(54, null), original: 'Clear' },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            keybinding: [{
                    primary: 0,
                    mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */ },
                    // Weight is higher than work workbench contributions so the keybinding remains
                    // highest priority when chords are registered afterwards
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
                    // Disable the keybinding when accessibility mode is enabled as chords include
                    // important screen reader keybindings such as cmd+k, cmd+i to show the hover
                    when: contextkey_1.$Ii.and(terminalContextKey_1.TerminalContextKeys.focus, accessibility_1.$2r.negate()),
                }],
            run: (activeInstance) => activeInstance.clearBuffer()
        });
        $HVb({
            id: "workbench.action.terminal.selectDefaultShell" /* TerminalCommandId.SelectDefaultProfile */,
            title: { value: (0, nls_1.localize)(55, null), original: 'Select Default Profile' },
            run: (c) => c.service.showProfileQuickPick('setDefault')
        });
        $HVb({
            id: "workbench.action.terminal.openSettings" /* TerminalCommandId.ConfigureTerminalSettings */,
            title: { value: (0, nls_1.localize)(56, null), original: 'Configure Terminal Settings' },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: (c, accessor) => accessor.get(preferences_1.$BE).openSettings({ jsonEditor: false, query: '@feature:terminal' })
        });
        $IVb({
            id: "workbench.action.terminal.setDimensions" /* TerminalCommandId.SetDimensions */,
            title: { value: (0, nls_1.localize)(57, null), original: 'Set Fixed Dimensions' },
            precondition: contextkey_1.$Ii.and(contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.isOpen),
            run: (activeInstance) => activeInstance.setFixedDimensions()
        });
        $IVb({
            id: "workbench.action.terminal.sizeToContentWidth" /* TerminalCommandId.SizeToContentWidth */,
            title: { value: (0, nls_1.localize)(58, null), original: 'Toggle Size to Content Width' },
            precondition: contextkey_1.$Ii.and(contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.isOpen),
            keybinding: {
                primary: 512 /* KeyMod.Alt */ | 56 /* KeyCode.KeyZ */,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: terminalContextKey_1.TerminalContextKeys.focus
            },
            run: (instancactiveInstance) => instancactiveInstance.toggleSizeToContentWidth()
        });
        $HVb({
            id: "workbench.action.terminal.sizeToContentWidthActiveTab" /* TerminalCommandId.SizeToContentWidthActiveTab */,
            title: terminalStrings_1.$pVb.toggleSizeToContentWidth,
            f1: false,
            precondition: contextkey_1.$Ii.and(contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.focus),
            run: (c, accessor) => getSelectedInstances(accessor)?.[0].toggleSizeToContentWidth()
        });
        $HVb({
            id: "workbench.action.terminal.clearPreviousSessionHistory" /* TerminalCommandId.ClearPreviousSessionHistory */,
            title: { value: (0, nls_1.localize)(59, null), original: 'Clear Previous Session History' },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: async (c, accessor) => {
                (0, history_2.$sVb)(accessor).clear();
                (0, history_2.$vVb)();
            }
        });
        $IVb({
            id: "workbench.action.terminal.selectPrevSuggestion" /* TerminalCommandId.SelectPrevSuggestion */,
            title: { value: (0, nls_1.localize)(60, null), original: 'Select the Previous Suggestion' },
            f1: false,
            precondition: contextkey_1.$Ii.and(contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.isOpen, terminalContextKey_1.TerminalContextKeys.suggestWidgetVisible),
            keybinding: {
                // Up is bound to other workbench keybindings that this needs to beat
                primary: 16 /* KeyCode.UpArrow */,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1
            },
            run: (activeInstance) => activeInstance.selectPreviousSuggestion()
        });
        $IVb({
            id: "workbench.action.terminal.selectPrevPageSuggestion" /* TerminalCommandId.SelectPrevPageSuggestion */,
            title: { value: (0, nls_1.localize)(61, null), original: 'Select the Previous Page Suggestion' },
            f1: false,
            precondition: contextkey_1.$Ii.and(contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.isOpen, terminalContextKey_1.TerminalContextKeys.suggestWidgetVisible),
            keybinding: {
                // Up is bound to other workbench keybindings that this needs to beat
                primary: 11 /* KeyCode.PageUp */,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1
            },
            run: (activeInstance) => activeInstance.selectPreviousPageSuggestion()
        });
        $IVb({
            id: "workbench.action.terminal.selectNextSuggestion" /* TerminalCommandId.SelectNextSuggestion */,
            title: { value: (0, nls_1.localize)(62, null), original: 'Select the Next Suggestion' },
            f1: false,
            precondition: contextkey_1.$Ii.and(contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.isOpen, terminalContextKey_1.TerminalContextKeys.suggestWidgetVisible),
            keybinding: {
                // Down is bound to other workbench keybindings that this needs to beat
                primary: 18 /* KeyCode.DownArrow */,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1
            },
            run: (insactiveInstanceance) => insactiveInstanceance.selectNextSuggestion()
        });
        $IVb({
            id: "workbench.action.terminal.selectNextPageSuggestion" /* TerminalCommandId.SelectNextPageSuggestion */,
            title: { value: (0, nls_1.localize)(63, null), original: 'Select the Next Page Suggestion' },
            f1: false,
            precondition: contextkey_1.$Ii.and(contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.isOpen, terminalContextKey_1.TerminalContextKeys.suggestWidgetVisible),
            keybinding: {
                // Down is bound to other workbench keybindings that this needs to beat
                primary: 12 /* KeyCode.PageDown */,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1
            },
            run: (activeInstance) => activeInstance.selectNextPageSuggestion()
        });
        $IVb({
            id: "workbench.action.terminal.acceptSelectedSuggestion" /* TerminalCommandId.AcceptSelectedSuggestion */,
            title: { value: (0, nls_1.localize)(64, null), original: 'Accept Selected Suggestion' },
            f1: false,
            precondition: contextkey_1.$Ii.and(contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.isOpen, terminalContextKey_1.TerminalContextKeys.suggestWidgetVisible),
            keybinding: {
                primary: 3 /* KeyCode.Enter */,
                secondary: [2 /* KeyCode.Tab */],
                // Enter is bound to other workbench keybindings that this needs to beat
                weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1
            },
            run: (activeInstance) => activeInstance.acceptSelectedSuggestion()
        });
        $IVb({
            id: "workbench.action.terminal.hideSuggestWidget" /* TerminalCommandId.HideSuggestWidget */,
            title: { value: (0, nls_1.localize)(65, null), original: 'Hide Suggest Widget' },
            f1: false,
            precondition: contextkey_1.$Ii.and(contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.isOpen, terminalContextKey_1.TerminalContextKeys.suggestWidgetVisible),
            keybinding: {
                primary: 9 /* KeyCode.Escape */,
                // Escape is bound to other workbench keybindings that this needs to beat
                weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1
            },
            run: (activeInstance) => activeInstance.hideSuggestWidget()
        });
        // Some commands depend on platform features
        if (canIUse_1.$bO.clipboard.writeText) {
            $JVb({
                id: "workbench.action.terminal.copySelection" /* TerminalCommandId.CopySelection */,
                title: { value: (0, nls_1.localize)(66, null), original: 'Copy Selection' },
                // TODO: Why is copy still showing up when text isn't selected?
                precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.textSelectedInFocused, contextkey_1.$Ii.and(contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.textSelected)),
                keybinding: [{
                        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 33 /* KeyCode.KeyC */,
                        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */ },
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: contextkey_1.$Ii.or(contextkey_1.$Ii.and(terminalContextKey_1.TerminalContextKeys.textSelected, terminalContextKey_1.TerminalContextKeys.focus), terminalContextKey_1.TerminalContextKeys.textSelectedInFocused)
                    }],
                run: (activeInstance) => activeInstance.copySelection()
            });
            $JVb({
                id: "workbench.action.terminal.copyAndClearSelection" /* TerminalCommandId.CopyAndClearSelection */,
                title: { value: (0, nls_1.localize)(67, null), original: 'Copy and Clear Selection' },
                precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.textSelectedInFocused, contextkey_1.$Ii.and(contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.textSelected)),
                keybinding: [{
                        win: { primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */ },
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: contextkey_1.$Ii.or(contextkey_1.$Ii.and(terminalContextKey_1.TerminalContextKeys.textSelected, terminalContextKey_1.TerminalContextKeys.focus), terminalContextKey_1.TerminalContextKeys.textSelectedInFocused)
                    }],
                run: async (xterm) => {
                    await xterm.copySelection();
                    xterm.clearSelection();
                }
            });
            $JVb({
                id: "workbench.action.terminal.copySelectionAsHtml" /* TerminalCommandId.CopySelectionAsHtml */,
                title: { value: (0, nls_1.localize)(68, null), original: 'Copy Selection as HTML' },
                f1: true,
                category,
                precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.textSelectedInFocused, contextkey_1.$Ii.and(contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.textSelected)),
                run: (xterm) => xterm.copySelection(true)
            });
        }
        if (canIUse_1.$bO.clipboard.readText) {
            $IVb({
                id: "workbench.action.terminal.paste" /* TerminalCommandId.Paste */,
                title: { value: (0, nls_1.localize)(69, null), original: 'Paste into Active Terminal' },
                precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
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
        if (canIUse_1.$bO.clipboard.readText && platform_1.$k) {
            $IVb({
                id: "workbench.action.terminal.pasteSelection" /* TerminalCommandId.PasteSelection */,
                title: { value: (0, nls_1.localize)(70, null), original: 'Paste Selection into Active Terminal' },
                precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
                keybinding: [{
                        linux: { primary: 1024 /* KeyMod.Shift */ | 19 /* KeyCode.Insert */ },
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: terminalContextKey_1.TerminalContextKeys.focus
                    }],
                run: (activeInstance) => activeInstance.pasteSelection()
            });
        }
        $HVb({
            id: "workbench.action.terminal.switchTerminal" /* TerminalCommandId.SwitchTerminal */,
            title: { value: (0, nls_1.localize)(71, null), original: 'Switch Terminal' },
            precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
            run: async (c, accessor, args) => {
                const item = toOptionalString(args);
                if (!item) {
                    return;
                }
                if (item === exports.$CVb) {
                    c.service.refreshActiveGroup();
                    return;
                }
                if (item === exports.$DVb) {
                    accessor.get(configuration_1.$8h).updateValue("terminal.integrated.tabs.enabled" /* TerminalSettingId.TabsEnabled */, true);
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
    exports.$KVb = $KVb;
    function getSelectedInstances(accessor) {
        const listService = accessor.get(listService_1.$03);
        const terminalService = accessor.get(terminal_2.$Mib);
        const terminalGroupService = accessor.get(terminal_2.$Oib);
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
    function $LVb(name) {
        if (!name || name.trim().length === 0) {
            return {
                content: (0, nls_1.localize)(72, null),
                severity: notification_1.Severity.Info
            };
        }
        return null;
    }
    exports.$LVb = $LVb;
    function convertOptionsOrProfileToOptions(optionsOrProfile) {
        if ((0, types_1.$lf)(optionsOrProfile) && 'profileName' in optionsOrProfile) {
            return { config: optionsOrProfile, location: optionsOrProfile.location };
        }
        return optionsOrProfile;
    }
    let newWithProfileAction;
    function $MVb(detectedProfiles) {
        const profileEnum = (0, terminalProfiles_1.$5q)(detectedProfiles);
        newWithProfileAction?.dispose();
        // TODO: Use new register function
        newWithProfileAction = (0, actions_2.$Xu)(class extends actions_2.$Wu {
            constructor() {
                super({
                    id: "workbench.action.terminal.newWithProfile" /* TerminalCommandId.NewWithProfile */,
                    title: { value: (0, nls_1.localize)(73, null), original: 'Create New Terminal (With Profile)' },
                    f1: true,
                    category,
                    precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.webExtensionContributedProfile),
                    description: {
                        description: "workbench.action.terminal.newWithProfile" /* TerminalCommandId.NewWithProfile */,
                        args: [{
                                name: 'args',
                                schema: {
                                    type: 'object',
                                    required: ['profileName'],
                                    properties: {
                                        profileName: {
                                            description: (0, nls_1.localize)(74, null),
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
                const workspaceContextService = accessor.get(workspace_1.$Kh);
                const commandService = accessor.get(commands_1.$Fr);
                let event;
                let options;
                let instance;
                let cwd;
                if ((0, types_1.$lf)(eventOrOptionsOrProfile) && eventOrOptionsOrProfile && 'profileName' in eventOrOptionsOrProfile) {
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
                        placeHolder: (0, nls_1.localize)(75, null)
                    };
                    const workspace = await commandService.executeCommand(workspaceCommands_1.$dgb, [options]);
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
    exports.$MVb = $MVb;
    function getResourceOrActiveInstance(c, resource) {
        return c.service.getInstanceFromResource(toOptionalUri(resource)) || c.service.activeInstance;
    }
    async function pickTerminalCwd(accessor, cancel) {
        const quickInputService = accessor.get(quickInput_1.$Gq);
        const labelService = accessor.get(label_1.$Vz);
        const contextService = accessor.get(workspace_1.$Kh);
        const modelService = accessor.get(model_1.$yA);
        const languageService = accessor.get(language_1.$ct);
        const configurationService = accessor.get(configuration_1.$8h);
        const configurationResolverService = accessor.get(configurationResolver_1.$NM);
        const folders = contextService.getWorkspace().folders;
        if (!folders.length) {
            return;
        }
        const folderCwdPairs = await Promise.all(folders.map(x => resolveWorkspaceFolderCwd(x, configurationService, configurationResolverService)));
        const shrinkedPairs = $NVb(folderCwdPairs);
        if (shrinkedPairs.length === 1) {
            return shrinkedPairs[0];
        }
        const folderPicks = shrinkedPairs.map(pair => {
            const label = pair.folder.name;
            const description = pair.isOverridden
                ? (0, nls_1.localize)(76, null, labelService.getUriLabel(pair.cwd, { relative: !pair.isAbsolute }))
                : labelService.getUriLabel((0, resources_1.$hg)(pair.cwd), { relative: true });
            return {
                label,
                description: description !== label ? description : undefined,
                pair: pair,
                iconClasses: (0, getIconClasses_1.$x6)(modelService, languageService, pair.cwd, files_1.FileKind.ROOT_FOLDER)
            };
        });
        const options = {
            placeHolder: (0, nls_1.localize)(77, null),
            matchOnDescription: true,
            canPickMany: false,
        };
        const token = cancel || cancellation_1.CancellationToken.None;
        const pick = await quickInputService.pick(folderPicks, options, token);
        return pick?.pair;
    }
    async function resolveWorkspaceFolderCwd(folder, configurationService, configurationResolverService) {
        const cwdConfig = configurationService.getValue("terminal.integrated.cwd" /* TerminalSettingId.Cwd */, { resource: folder.uri });
        if (!(0, types_1.$jf)(cwdConfig) || cwdConfig.length === 0) {
            return { folder, cwd: folder.uri, isAbsolute: false, isOverridden: false };
        }
        const resolvedCwdConfig = await configurationResolverService.resolveAsync(folder, cwdConfig);
        return (0, path_1.$8d)(resolvedCwdConfig) || resolvedCwdConfig.startsWith(variableResolver_1.$3M.VARIABLE_LHS)
            ? { folder, isAbsolute: true, isOverridden: true, cwd: uri_1.URI.from({ scheme: folder.uri.scheme, path: resolvedCwdConfig }) }
            : { folder, isAbsolute: false, isOverridden: true, cwd: uri_1.URI.joinPath(folder.uri, resolvedCwdConfig) };
    }
    /**
     * Drops repeated CWDs, if any, by keeping the one which best matches the workspace folder. It also preserves the original order.
     */
    function $NVb(pairs) {
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
    exports.$NVb = $NVb;
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
            const title = await accessor.get(quickInput_1.$Gq).input({
                value: instance.title,
                prompt: (0, nls_1.localize)(78, null),
            });
            instance.rename(title);
        }
    }
    function toOptionalUri(obj) {
        return uri_1.URI.isUri(obj) ? obj : undefined;
    }
    function toOptionalString(obj) {
        return (0, types_1.$jf)(obj) ? obj : undefined;
    }
});
//# sourceMappingURL=terminalActions.js.map