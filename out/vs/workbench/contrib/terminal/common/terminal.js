/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/instantiation/common/instantiation"], function (require, exports, nls, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.terminalContributionsDescriptor = exports.DEFAULT_COMMANDS_TO_SKIP_SHELL = exports.TerminalCommandId = exports.QUICK_LAUNCH_PROFILE_CHOICE = exports.ProcessState = exports.isTerminalProcessManager = exports.DEFAULT_LOCAL_ECHO_EXCLUDE = exports.ITerminalProfileService = exports.ShellIntegrationExitCode = exports.ITerminalProfileResolverService = exports.SUGGESTIONS_FONT_WEIGHT = exports.DEFAULT_BOLD_FONT_WEIGHT = exports.DEFAULT_FONT_WEIGHT = exports.MAXIMUM_FONT_WEIGHT = exports.MINIMUM_FONT_WEIGHT = exports.DEFAULT_LINE_HEIGHT = exports.MINIMUM_LETTER_SPACING = exports.DEFAULT_LETTER_SPACING = exports.TERMINAL_CONFIG_SECTION = exports.TERMINAL_CREATION_COMMANDS = exports.TERMINAL_VIEW_ID = void 0;
    exports.TERMINAL_VIEW_ID = 'terminal';
    exports.TERMINAL_CREATION_COMMANDS = ['workbench.action.terminal.toggleTerminal', 'workbench.action.terminal.new', 'workbench.action.togglePanel', 'workbench.action.terminal.focus'];
    exports.TERMINAL_CONFIG_SECTION = 'terminal.integrated';
    exports.DEFAULT_LETTER_SPACING = 0;
    exports.MINIMUM_LETTER_SPACING = -5;
    exports.DEFAULT_LINE_HEIGHT = 1;
    exports.MINIMUM_FONT_WEIGHT = 1;
    exports.MAXIMUM_FONT_WEIGHT = 1000;
    exports.DEFAULT_FONT_WEIGHT = 'normal';
    exports.DEFAULT_BOLD_FONT_WEIGHT = 'bold';
    exports.SUGGESTIONS_FONT_WEIGHT = ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
    exports.ITerminalProfileResolverService = (0, instantiation_1.createDecorator)('terminalProfileResolverService');
    /*
     * When there were shell integration args injected
     * and createProcess returns an error, this exit code will be used.
     */
    exports.ShellIntegrationExitCode = 633;
    exports.ITerminalProfileService = (0, instantiation_1.createDecorator)('terminalProfileService');
    exports.DEFAULT_LOCAL_ECHO_EXCLUDE = ['vim', 'vi', 'nano', 'tmux'];
    const isTerminalProcessManager = (t) => typeof t.write === 'function';
    exports.isTerminalProcessManager = isTerminalProcessManager;
    var ProcessState;
    (function (ProcessState) {
        // The process has not been initialized yet.
        ProcessState[ProcessState["Uninitialized"] = 1] = "Uninitialized";
        // The process is currently launching, the process is marked as launching
        // for a short duration after being created and is helpful to indicate
        // whether the process died as a result of bad shell and args.
        ProcessState[ProcessState["Launching"] = 2] = "Launching";
        // The process is running normally.
        ProcessState[ProcessState["Running"] = 3] = "Running";
        // The process was killed during launch, likely as a result of bad shell and
        // args.
        ProcessState[ProcessState["KilledDuringLaunch"] = 4] = "KilledDuringLaunch";
        // The process was killed by the user (the event originated from VS Code).
        ProcessState[ProcessState["KilledByUser"] = 5] = "KilledByUser";
        // The process was killed by itself, for example the shell crashed or `exit`
        // was run.
        ProcessState[ProcessState["KilledByProcess"] = 6] = "KilledByProcess";
    })(ProcessState || (exports.ProcessState = ProcessState = {}));
    exports.QUICK_LAUNCH_PROFILE_CHOICE = 'workbench.action.terminal.profile.choice';
    var TerminalCommandId;
    (function (TerminalCommandId) {
        TerminalCommandId["FindNext"] = "workbench.action.terminal.findNext";
        TerminalCommandId["FindPrevious"] = "workbench.action.terminal.findPrevious";
        TerminalCommandId["Toggle"] = "workbench.action.terminal.toggleTerminal";
        TerminalCommandId["Kill"] = "workbench.action.terminal.kill";
        TerminalCommandId["KillViewOrEditor"] = "workbench.action.terminal.killViewOrEditor";
        TerminalCommandId["KillEditor"] = "workbench.action.terminal.killEditor";
        TerminalCommandId["KillActiveTab"] = "workbench.action.terminal.killActiveTab";
        TerminalCommandId["KillAll"] = "workbench.action.terminal.killAll";
        TerminalCommandId["QuickKill"] = "workbench.action.terminal.quickKill";
        TerminalCommandId["ConfigureTerminalSettings"] = "workbench.action.terminal.openSettings";
        TerminalCommandId["OpenDetectedLink"] = "workbench.action.terminal.openDetectedLink";
        TerminalCommandId["OpenWordLink"] = "workbench.action.terminal.openWordLink";
        TerminalCommandId["ShellIntegrationLearnMore"] = "workbench.action.terminal.learnMore";
        TerminalCommandId["OpenFileLink"] = "workbench.action.terminal.openFileLink";
        TerminalCommandId["OpenWebLink"] = "workbench.action.terminal.openUrlLink";
        TerminalCommandId["RunRecentCommand"] = "workbench.action.terminal.runRecentCommand";
        TerminalCommandId["FocusAccessibleBuffer"] = "workbench.action.terminal.focusAccessibleBuffer";
        TerminalCommandId["AccessibleBufferGoToNextCommand"] = "workbench.action.terminal.accessibleBufferGoToNextCommand";
        TerminalCommandId["AccessibleBufferGoToPreviousCommand"] = "workbench.action.terminal.accessibleBufferGoToPreviousCommand";
        TerminalCommandId["CopyLastCommandOutput"] = "workbench.action.terminal.copyLastCommandOutput";
        TerminalCommandId["GoToRecentDirectory"] = "workbench.action.terminal.goToRecentDirectory";
        TerminalCommandId["CopyAndClearSelection"] = "workbench.action.terminal.copyAndClearSelection";
        TerminalCommandId["CopySelection"] = "workbench.action.terminal.copySelection";
        TerminalCommandId["CopySelectionAsHtml"] = "workbench.action.terminal.copySelectionAsHtml";
        TerminalCommandId["SelectAll"] = "workbench.action.terminal.selectAll";
        TerminalCommandId["DeleteWordLeft"] = "workbench.action.terminal.deleteWordLeft";
        TerminalCommandId["DeleteWordRight"] = "workbench.action.terminal.deleteWordRight";
        TerminalCommandId["DeleteToLineStart"] = "workbench.action.terminal.deleteToLineStart";
        TerminalCommandId["MoveToLineStart"] = "workbench.action.terminal.moveToLineStart";
        TerminalCommandId["MoveToLineEnd"] = "workbench.action.terminal.moveToLineEnd";
        TerminalCommandId["New"] = "workbench.action.terminal.new";
        TerminalCommandId["NewWithCwd"] = "workbench.action.terminal.newWithCwd";
        TerminalCommandId["NewLocal"] = "workbench.action.terminal.newLocal";
        TerminalCommandId["NewInActiveWorkspace"] = "workbench.action.terminal.newInActiveWorkspace";
        TerminalCommandId["NewWithProfile"] = "workbench.action.terminal.newWithProfile";
        TerminalCommandId["Split"] = "workbench.action.terminal.split";
        TerminalCommandId["SplitActiveTab"] = "workbench.action.terminal.splitActiveTab";
        TerminalCommandId["SplitInActiveWorkspace"] = "workbench.action.terminal.splitInActiveWorkspace";
        TerminalCommandId["ShowQuickFixes"] = "workbench.action.terminal.showQuickFixes";
        TerminalCommandId["Unsplit"] = "workbench.action.terminal.unsplit";
        TerminalCommandId["UnsplitActiveTab"] = "workbench.action.terminal.unsplitActiveTab";
        TerminalCommandId["JoinActiveTab"] = "workbench.action.terminal.joinActiveTab";
        TerminalCommandId["Join"] = "workbench.action.terminal.join";
        TerminalCommandId["Relaunch"] = "workbench.action.terminal.relaunch";
        TerminalCommandId["FocusPreviousPane"] = "workbench.action.terminal.focusPreviousPane";
        TerminalCommandId["CreateTerminalEditor"] = "workbench.action.createTerminalEditor";
        TerminalCommandId["CreateTerminalEditorSameGroup"] = "workbench.action.createTerminalEditorSameGroup";
        TerminalCommandId["CreateTerminalEditorSide"] = "workbench.action.createTerminalEditorSide";
        TerminalCommandId["FocusTabs"] = "workbench.action.terminal.focusTabs";
        TerminalCommandId["FocusNextPane"] = "workbench.action.terminal.focusNextPane";
        TerminalCommandId["ResizePaneLeft"] = "workbench.action.terminal.resizePaneLeft";
        TerminalCommandId["ResizePaneRight"] = "workbench.action.terminal.resizePaneRight";
        TerminalCommandId["ResizePaneUp"] = "workbench.action.terminal.resizePaneUp";
        TerminalCommandId["SizeToContentWidth"] = "workbench.action.terminal.sizeToContentWidth";
        TerminalCommandId["SizeToContentWidthActiveTab"] = "workbench.action.terminal.sizeToContentWidthActiveTab";
        TerminalCommandId["ResizePaneDown"] = "workbench.action.terminal.resizePaneDown";
        TerminalCommandId["Focus"] = "workbench.action.terminal.focus";
        TerminalCommandId["FocusNext"] = "workbench.action.terminal.focusNext";
        TerminalCommandId["FocusPrevious"] = "workbench.action.terminal.focusPrevious";
        TerminalCommandId["Paste"] = "workbench.action.terminal.paste";
        TerminalCommandId["PasteSelection"] = "workbench.action.terminal.pasteSelection";
        TerminalCommandId["SelectDefaultProfile"] = "workbench.action.terminal.selectDefaultShell";
        TerminalCommandId["RunSelectedText"] = "workbench.action.terminal.runSelectedText";
        TerminalCommandId["RunActiveFile"] = "workbench.action.terminal.runActiveFile";
        TerminalCommandId["SwitchTerminal"] = "workbench.action.terminal.switchTerminal";
        TerminalCommandId["ScrollDownLine"] = "workbench.action.terminal.scrollDown";
        TerminalCommandId["ScrollDownPage"] = "workbench.action.terminal.scrollDownPage";
        TerminalCommandId["ScrollToBottom"] = "workbench.action.terminal.scrollToBottom";
        TerminalCommandId["ScrollUpLine"] = "workbench.action.terminal.scrollUp";
        TerminalCommandId["ScrollUpPage"] = "workbench.action.terminal.scrollUpPage";
        TerminalCommandId["ScrollToTop"] = "workbench.action.terminal.scrollToTop";
        TerminalCommandId["Clear"] = "workbench.action.terminal.clear";
        TerminalCommandId["ClearSelection"] = "workbench.action.terminal.clearSelection";
        TerminalCommandId["ChangeIcon"] = "workbench.action.terminal.changeIcon";
        TerminalCommandId["ChangeIconPanel"] = "workbench.action.terminal.changeIconPanel";
        TerminalCommandId["ChangeIconActiveTab"] = "workbench.action.terminal.changeIconActiveTab";
        TerminalCommandId["ChangeColor"] = "workbench.action.terminal.changeColor";
        TerminalCommandId["ChangeColorPanel"] = "workbench.action.terminal.changeColorPanel";
        TerminalCommandId["ChangeColorActiveTab"] = "workbench.action.terminal.changeColorActiveTab";
        TerminalCommandId["Rename"] = "workbench.action.terminal.rename";
        TerminalCommandId["RenamePanel"] = "workbench.action.terminal.renamePanel";
        TerminalCommandId["RenameActiveTab"] = "workbench.action.terminal.renameActiveTab";
        TerminalCommandId["RenameWithArgs"] = "workbench.action.terminal.renameWithArg";
        TerminalCommandId["FindFocus"] = "workbench.action.terminal.focusFind";
        TerminalCommandId["FindHide"] = "workbench.action.terminal.hideFind";
        TerminalCommandId["QuickOpenTerm"] = "workbench.action.quickOpenTerm";
        TerminalCommandId["ScrollToPreviousCommand"] = "workbench.action.terminal.scrollToPreviousCommand";
        TerminalCommandId["ScrollToNextCommand"] = "workbench.action.terminal.scrollToNextCommand";
        TerminalCommandId["SelectToPreviousCommand"] = "workbench.action.terminal.selectToPreviousCommand";
        TerminalCommandId["SelectToNextCommand"] = "workbench.action.terminal.selectToNextCommand";
        TerminalCommandId["SelectToPreviousLine"] = "workbench.action.terminal.selectToPreviousLine";
        TerminalCommandId["SelectToNextLine"] = "workbench.action.terminal.selectToNextLine";
        TerminalCommandId["SendSequence"] = "workbench.action.terminal.sendSequence";
        TerminalCommandId["ToggleFindRegex"] = "workbench.action.terminal.toggleFindRegex";
        TerminalCommandId["ToggleFindWholeWord"] = "workbench.action.terminal.toggleFindWholeWord";
        TerminalCommandId["ToggleFindCaseSensitive"] = "workbench.action.terminal.toggleFindCaseSensitive";
        TerminalCommandId["SearchWorkspace"] = "workbench.action.terminal.searchWorkspace";
        TerminalCommandId["AttachToSession"] = "workbench.action.terminal.attachToSession";
        TerminalCommandId["DetachSession"] = "workbench.action.terminal.detachSession";
        TerminalCommandId["MoveToEditor"] = "workbench.action.terminal.moveToEditor";
        TerminalCommandId["MoveToEditorActiveTab"] = "workbench.action.terminal.moveToEditorActiveTab";
        TerminalCommandId["MoveToTerminalPanel"] = "workbench.action.terminal.moveToTerminalPanel";
        TerminalCommandId["SetDimensions"] = "workbench.action.terminal.setDimensions";
        TerminalCommandId["ClearPreviousSessionHistory"] = "workbench.action.terminal.clearPreviousSessionHistory";
        TerminalCommandId["SelectPrevSuggestion"] = "workbench.action.terminal.selectPrevSuggestion";
        TerminalCommandId["SelectPrevPageSuggestion"] = "workbench.action.terminal.selectPrevPageSuggestion";
        TerminalCommandId["SelectNextSuggestion"] = "workbench.action.terminal.selectNextSuggestion";
        TerminalCommandId["SelectNextPageSuggestion"] = "workbench.action.terminal.selectNextPageSuggestion";
        TerminalCommandId["AcceptSelectedSuggestion"] = "workbench.action.terminal.acceptSelectedSuggestion";
        TerminalCommandId["HideSuggestWidget"] = "workbench.action.terminal.hideSuggestWidget";
        TerminalCommandId["FocusHover"] = "workbench.action.terminal.focusHover";
        TerminalCommandId["ShowEnvironmentContributions"] = "workbench.action.terminal.showEnvironmentContributions";
        // Developer commands
        TerminalCommandId["WriteDataToTerminal"] = "workbench.action.terminal.writeDataToTerminal";
        TerminalCommandId["ShowTextureAtlas"] = "workbench.action.terminal.showTextureAtlas";
        TerminalCommandId["RestartPtyHost"] = "workbench.action.terminal.restartPtyHost";
    })(TerminalCommandId || (exports.TerminalCommandId = TerminalCommandId = {}));
    exports.DEFAULT_COMMANDS_TO_SKIP_SHELL = [
        "workbench.action.terminal.clearSelection" /* TerminalCommandId.ClearSelection */,
        "workbench.action.terminal.clear" /* TerminalCommandId.Clear */,
        "workbench.action.terminal.copyAndClearSelection" /* TerminalCommandId.CopyAndClearSelection */,
        "workbench.action.terminal.copySelection" /* TerminalCommandId.CopySelection */,
        "workbench.action.terminal.copySelectionAsHtml" /* TerminalCommandId.CopySelectionAsHtml */,
        "workbench.action.terminal.copyLastCommandOutput" /* TerminalCommandId.CopyLastCommandOutput */,
        "workbench.action.terminal.deleteToLineStart" /* TerminalCommandId.DeleteToLineStart */,
        "workbench.action.terminal.deleteWordLeft" /* TerminalCommandId.DeleteWordLeft */,
        "workbench.action.terminal.deleteWordRight" /* TerminalCommandId.DeleteWordRight */,
        "workbench.action.terminal.focusFind" /* TerminalCommandId.FindFocus */,
        "workbench.action.terminal.hideFind" /* TerminalCommandId.FindHide */,
        "workbench.action.terminal.findNext" /* TerminalCommandId.FindNext */,
        "workbench.action.terminal.findPrevious" /* TerminalCommandId.FindPrevious */,
        "workbench.action.terminal.goToRecentDirectory" /* TerminalCommandId.GoToRecentDirectory */,
        "workbench.action.terminal.toggleFindRegex" /* TerminalCommandId.ToggleFindRegex */,
        "workbench.action.terminal.toggleFindWholeWord" /* TerminalCommandId.ToggleFindWholeWord */,
        "workbench.action.terminal.toggleFindCaseSensitive" /* TerminalCommandId.ToggleFindCaseSensitive */,
        "workbench.action.terminal.focusNextPane" /* TerminalCommandId.FocusNextPane */,
        "workbench.action.terminal.focusNext" /* TerminalCommandId.FocusNext */,
        "workbench.action.terminal.focusPreviousPane" /* TerminalCommandId.FocusPreviousPane */,
        "workbench.action.terminal.focusPrevious" /* TerminalCommandId.FocusPrevious */,
        "workbench.action.terminal.focus" /* TerminalCommandId.Focus */,
        "workbench.action.terminal.sizeToContentWidth" /* TerminalCommandId.SizeToContentWidth */,
        "workbench.action.terminal.kill" /* TerminalCommandId.Kill */,
        "workbench.action.terminal.killEditor" /* TerminalCommandId.KillEditor */,
        "workbench.action.terminal.moveToEditor" /* TerminalCommandId.MoveToEditor */,
        "workbench.action.terminal.moveToLineEnd" /* TerminalCommandId.MoveToLineEnd */,
        "workbench.action.terminal.moveToLineStart" /* TerminalCommandId.MoveToLineStart */,
        "workbench.action.terminal.moveToTerminalPanel" /* TerminalCommandId.MoveToTerminalPanel */,
        "workbench.action.terminal.newInActiveWorkspace" /* TerminalCommandId.NewInActiveWorkspace */,
        "workbench.action.terminal.new" /* TerminalCommandId.New */,
        "workbench.action.terminal.paste" /* TerminalCommandId.Paste */,
        "workbench.action.terminal.pasteSelection" /* TerminalCommandId.PasteSelection */,
        "workbench.action.terminal.resizePaneDown" /* TerminalCommandId.ResizePaneDown */,
        "workbench.action.terminal.resizePaneLeft" /* TerminalCommandId.ResizePaneLeft */,
        "workbench.action.terminal.resizePaneRight" /* TerminalCommandId.ResizePaneRight */,
        "workbench.action.terminal.resizePaneUp" /* TerminalCommandId.ResizePaneUp */,
        "workbench.action.terminal.runActiveFile" /* TerminalCommandId.RunActiveFile */,
        "workbench.action.terminal.runSelectedText" /* TerminalCommandId.RunSelectedText */,
        "workbench.action.terminal.runRecentCommand" /* TerminalCommandId.RunRecentCommand */,
        "workbench.action.terminal.scrollDown" /* TerminalCommandId.ScrollDownLine */,
        "workbench.action.terminal.scrollDownPage" /* TerminalCommandId.ScrollDownPage */,
        "workbench.action.terminal.scrollToBottom" /* TerminalCommandId.ScrollToBottom */,
        "workbench.action.terminal.scrollToNextCommand" /* TerminalCommandId.ScrollToNextCommand */,
        "workbench.action.terminal.scrollToPreviousCommand" /* TerminalCommandId.ScrollToPreviousCommand */,
        "workbench.action.terminal.scrollToTop" /* TerminalCommandId.ScrollToTop */,
        "workbench.action.terminal.scrollUp" /* TerminalCommandId.ScrollUpLine */,
        "workbench.action.terminal.scrollUpPage" /* TerminalCommandId.ScrollUpPage */,
        "workbench.action.terminal.sendSequence" /* TerminalCommandId.SendSequence */,
        "workbench.action.terminal.selectAll" /* TerminalCommandId.SelectAll */,
        "workbench.action.terminal.selectToNextCommand" /* TerminalCommandId.SelectToNextCommand */,
        "workbench.action.terminal.selectToNextLine" /* TerminalCommandId.SelectToNextLine */,
        "workbench.action.terminal.selectToPreviousCommand" /* TerminalCommandId.SelectToPreviousCommand */,
        "workbench.action.terminal.selectToPreviousLine" /* TerminalCommandId.SelectToPreviousLine */,
        "workbench.action.terminal.splitInActiveWorkspace" /* TerminalCommandId.SplitInActiveWorkspace */,
        "workbench.action.terminal.split" /* TerminalCommandId.Split */,
        "workbench.action.terminal.toggleTerminal" /* TerminalCommandId.Toggle */,
        "workbench.action.terminal.selectPrevSuggestion" /* TerminalCommandId.SelectPrevSuggestion */,
        "workbench.action.terminal.selectPrevPageSuggestion" /* TerminalCommandId.SelectPrevPageSuggestion */,
        "workbench.action.terminal.selectNextSuggestion" /* TerminalCommandId.SelectNextSuggestion */,
        "workbench.action.terminal.selectNextPageSuggestion" /* TerminalCommandId.SelectNextPageSuggestion */,
        "workbench.action.terminal.acceptSelectedSuggestion" /* TerminalCommandId.AcceptSelectedSuggestion */,
        "workbench.action.terminal.hideSuggestWidget" /* TerminalCommandId.HideSuggestWidget */,
        "workbench.action.terminal.focusHover" /* TerminalCommandId.FocusHover */,
        "workbench.action.terminal.focusAccessibleBuffer" /* TerminalCommandId.FocusAccessibleBuffer */,
        "editor.action.accessibilityHelp" /* AccessibilityCommandId.OpenAccessibilityHelp */,
        'editor.action.toggleTabFocusMode',
        'notifications.hideList',
        'notifications.hideToasts',
        'workbench.action.closeQuickOpen',
        'workbench.action.quickOpen',
        'workbench.action.quickOpenPreviousEditor',
        'workbench.action.showCommands',
        'workbench.action.tasks.build',
        'workbench.action.tasks.restartTask',
        'workbench.action.tasks.runTask',
        'workbench.action.tasks.reRunTask',
        'workbench.action.tasks.showLog',
        'workbench.action.tasks.showTasks',
        'workbench.action.tasks.terminate',
        'workbench.action.tasks.test',
        'workbench.action.toggleFullScreen',
        'workbench.action.terminal.focusAtIndex1',
        'workbench.action.terminal.focusAtIndex2',
        'workbench.action.terminal.focusAtIndex3',
        'workbench.action.terminal.focusAtIndex4',
        'workbench.action.terminal.focusAtIndex5',
        'workbench.action.terminal.focusAtIndex6',
        'workbench.action.terminal.focusAtIndex7',
        'workbench.action.terminal.focusAtIndex8',
        'workbench.action.terminal.focusAtIndex9',
        'workbench.action.focusSecondEditorGroup',
        'workbench.action.focusThirdEditorGroup',
        'workbench.action.focusFourthEditorGroup',
        'workbench.action.focusFifthEditorGroup',
        'workbench.action.focusSixthEditorGroup',
        'workbench.action.focusSeventhEditorGroup',
        'workbench.action.focusEighthEditorGroup',
        'workbench.action.focusNextPart',
        'workbench.action.focusPreviousPart',
        'workbench.action.nextPanelView',
        'workbench.action.previousPanelView',
        'workbench.action.nextSideBarView',
        'workbench.action.previousSideBarView',
        'workbench.action.debug.start',
        'workbench.action.debug.stop',
        'workbench.action.debug.run',
        'workbench.action.debug.restart',
        'workbench.action.debug.continue',
        'workbench.action.debug.pause',
        'workbench.action.debug.stepInto',
        'workbench.action.debug.stepOut',
        'workbench.action.debug.stepOver',
        'workbench.action.nextEditor',
        'workbench.action.previousEditor',
        'workbench.action.nextEditorInGroup',
        'workbench.action.previousEditorInGroup',
        'workbench.action.openNextRecentlyUsedEditor',
        'workbench.action.openPreviousRecentlyUsedEditor',
        'workbench.action.openNextRecentlyUsedEditorInGroup',
        'workbench.action.openPreviousRecentlyUsedEditorInGroup',
        'workbench.action.quickOpenPreviousRecentlyUsedEditor',
        'workbench.action.quickOpenLeastRecentlyUsedEditor',
        'workbench.action.quickOpenPreviousRecentlyUsedEditorInGroup',
        'workbench.action.quickOpenLeastRecentlyUsedEditorInGroup',
        'workbench.action.focusActiveEditorGroup',
        'workbench.action.focusFirstEditorGroup',
        'workbench.action.focusLastEditorGroup',
        'workbench.action.firstEditorInGroup',
        'workbench.action.lastEditorInGroup',
        'workbench.action.navigateUp',
        'workbench.action.navigateDown',
        'workbench.action.navigateRight',
        'workbench.action.navigateLeft',
        'workbench.action.togglePanel',
        'workbench.action.quickOpenView',
        'workbench.action.toggleMaximizedPanel',
        'notification.acceptPrimaryAction',
        'runCommands'
    ];
    exports.terminalContributionsDescriptor = {
        extensionPoint: 'terminal',
        defaultExtensionKind: ['workspace'],
        activationEventsGenerator: (contribs, result) => {
            for (const contrib of contribs) {
                for (const profileContrib of (contrib.profiles ?? [])) {
                    result.push(`onTerminalProfile:${profileContrib.id}`);
                }
            }
        },
        jsonSchema: {
            description: nls.localize('vscode.extension.contributes.terminal', 'Contributes terminal functionality.'),
            type: 'object',
            properties: {
                profiles: {
                    type: 'array',
                    description: nls.localize('vscode.extension.contributes.terminal.profiles', "Defines additional terminal profiles that the user can create."),
                    items: {
                        type: 'object',
                        required: ['id', 'title'],
                        defaultSnippets: [{
                                body: {
                                    id: '$1',
                                    title: '$2'
                                }
                            }],
                        properties: {
                            id: {
                                description: nls.localize('vscode.extension.contributes.terminal.profiles.id', "The ID of the terminal profile provider."),
                                type: 'string',
                            },
                            title: {
                                description: nls.localize('vscode.extension.contributes.terminal.profiles.title', "Title for this terminal profile."),
                                type: 'string',
                            },
                            icon: {
                                description: nls.localize('vscode.extension.contributes.terminal.types.icon', "A codicon, URI, or light and dark URIs to associate with this terminal type."),
                                anyOf: [{
                                        type: 'string',
                                    },
                                    {
                                        type: 'object',
                                        properties: {
                                            light: {
                                                description: nls.localize('vscode.extension.contributes.terminal.types.icon.light', 'Icon path when a light theme is used'),
                                                type: 'string'
                                            },
                                            dark: {
                                                description: nls.localize('vscode.extension.contributes.terminal.types.icon.dark', 'Icon path when a dark theme is used'),
                                                type: 'string'
                                            }
                                        }
                                    }]
                            },
                        },
                    },
                },
            },
        },
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC9jb21tb24vdGVybWluYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBa0JuRixRQUFBLGdCQUFnQixHQUFHLFVBQVUsQ0FBQztJQUU5QixRQUFBLDBCQUEwQixHQUFHLENBQUMsMENBQTBDLEVBQUUsK0JBQStCLEVBQUUsOEJBQThCLEVBQUUsaUNBQWlDLENBQUMsQ0FBQztJQUU5SyxRQUFBLHVCQUF1QixHQUFHLHFCQUFxQixDQUFDO0lBRWhELFFBQUEsc0JBQXNCLEdBQUcsQ0FBQyxDQUFDO0lBQzNCLFFBQUEsc0JBQXNCLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDNUIsUUFBQSxtQkFBbUIsR0FBRyxDQUFDLENBQUM7SUFFeEIsUUFBQSxtQkFBbUIsR0FBRyxDQUFDLENBQUM7SUFDeEIsUUFBQSxtQkFBbUIsR0FBRyxJQUFJLENBQUM7SUFDM0IsUUFBQSxtQkFBbUIsR0FBRyxRQUFRLENBQUM7SUFDL0IsUUFBQSx3QkFBd0IsR0FBRyxNQUFNLENBQUM7SUFDbEMsUUFBQSx1QkFBdUIsR0FBRyxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUU1RyxRQUFBLCtCQUErQixHQUFHLElBQUEsK0JBQWUsRUFBa0MsZ0NBQWdDLENBQUMsQ0FBQztJQW1CbEk7OztPQUdHO0lBQ1UsUUFBQSx3QkFBd0IsR0FBRyxHQUFHLENBQUM7SUFNL0IsUUFBQSx1QkFBdUIsR0FBRyxJQUFBLCtCQUFlLEVBQTBCLHdCQUF3QixDQUFDLENBQUM7SUErSTdGLFFBQUEsMEJBQTBCLEdBQTBCLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFtRXhGLE1BQU0sd0JBQXdCLEdBQUcsQ0FBQyxDQUFpRCxFQUFnQyxFQUFFLENBQUMsT0FBUSxDQUE2QixDQUFDLEtBQUssS0FBSyxVQUFVLENBQUM7SUFBM0ssUUFBQSx3QkFBd0IsNEJBQW1KO0lBa0N4TCxJQUFrQixZQWlCakI7SUFqQkQsV0FBa0IsWUFBWTtRQUM3Qiw0Q0FBNEM7UUFDNUMsaUVBQWlCLENBQUE7UUFDakIseUVBQXlFO1FBQ3pFLHNFQUFzRTtRQUN0RSw4REFBOEQ7UUFDOUQseURBQWEsQ0FBQTtRQUNiLG1DQUFtQztRQUNuQyxxREFBVyxDQUFBO1FBQ1gsNEVBQTRFO1FBQzVFLFFBQVE7UUFDUiwyRUFBc0IsQ0FBQTtRQUN0QiwwRUFBMEU7UUFDMUUsK0RBQWdCLENBQUE7UUFDaEIsNEVBQTRFO1FBQzVFLFdBQVc7UUFDWCxxRUFBbUIsQ0FBQTtJQUNwQixDQUFDLEVBakJpQixZQUFZLDRCQUFaLFlBQVksUUFpQjdCO0lBK0RZLFFBQUEsMkJBQTJCLEdBQUcsMENBQTBDLENBQUM7SUFFdEYsSUFBa0IsaUJBdUhqQjtJQXZIRCxXQUFrQixpQkFBaUI7UUFDbEMsb0VBQStDLENBQUE7UUFDL0MsNEVBQXVELENBQUE7UUFDdkQsd0VBQW1ELENBQUE7UUFDbkQsNERBQXVDLENBQUE7UUFDdkMsb0ZBQStELENBQUE7UUFDL0Qsd0VBQW1ELENBQUE7UUFDbkQsOEVBQXlELENBQUE7UUFDekQsa0VBQTZDLENBQUE7UUFDN0Msc0VBQWlELENBQUE7UUFDakQseUZBQW9FLENBQUE7UUFDcEUsb0ZBQStELENBQUE7UUFDL0QsNEVBQXVELENBQUE7UUFDdkQsc0ZBQWlFLENBQUE7UUFDakUsNEVBQXVELENBQUE7UUFDdkQsMEVBQXFELENBQUE7UUFDckQsb0ZBQStELENBQUE7UUFDL0QsOEZBQXlFLENBQUE7UUFDekUsa0hBQTZGLENBQUE7UUFDN0YsMEhBQXFHLENBQUE7UUFDckcsOEZBQXlFLENBQUE7UUFDekUsMEZBQXFFLENBQUE7UUFDckUsOEZBQXlFLENBQUE7UUFDekUsOEVBQXlELENBQUE7UUFDekQsMEZBQXFFLENBQUE7UUFDckUsc0VBQWlELENBQUE7UUFDakQsZ0ZBQTJELENBQUE7UUFDM0Qsa0ZBQTZELENBQUE7UUFDN0Qsc0ZBQWlFLENBQUE7UUFDakUsa0ZBQTZELENBQUE7UUFDN0QsOEVBQXlELENBQUE7UUFDekQsMERBQXFDLENBQUE7UUFDckMsd0VBQW1ELENBQUE7UUFDbkQsb0VBQStDLENBQUE7UUFDL0MsNEZBQXVFLENBQUE7UUFDdkUsZ0ZBQTJELENBQUE7UUFDM0QsOERBQXlDLENBQUE7UUFDekMsZ0ZBQTJELENBQUE7UUFDM0QsZ0dBQTJFLENBQUE7UUFDM0UsZ0ZBQTJELENBQUE7UUFDM0Qsa0VBQTZDLENBQUE7UUFDN0Msb0ZBQStELENBQUE7UUFDL0QsOEVBQXlELENBQUE7UUFDekQsNERBQXVDLENBQUE7UUFDdkMsb0VBQStDLENBQUE7UUFDL0Msc0ZBQWlFLENBQUE7UUFDakUsbUZBQThELENBQUE7UUFDOUQscUdBQWdGLENBQUE7UUFDaEYsMkZBQXNFLENBQUE7UUFDdEUsc0VBQWlELENBQUE7UUFDakQsOEVBQXlELENBQUE7UUFDekQsZ0ZBQTJELENBQUE7UUFDM0Qsa0ZBQTZELENBQUE7UUFDN0QsNEVBQXVELENBQUE7UUFDdkQsd0ZBQW1FLENBQUE7UUFDbkUsMEdBQXFGLENBQUE7UUFDckYsZ0ZBQTJELENBQUE7UUFDM0QsOERBQXlDLENBQUE7UUFDekMsc0VBQWlELENBQUE7UUFDakQsOEVBQXlELENBQUE7UUFDekQsOERBQXlDLENBQUE7UUFDekMsZ0ZBQTJELENBQUE7UUFDM0QsMEZBQXFFLENBQUE7UUFDckUsa0ZBQTZELENBQUE7UUFDN0QsOEVBQXlELENBQUE7UUFDekQsZ0ZBQTJELENBQUE7UUFDM0QsNEVBQXVELENBQUE7UUFDdkQsZ0ZBQTJELENBQUE7UUFDM0QsZ0ZBQTJELENBQUE7UUFDM0Qsd0VBQW1ELENBQUE7UUFDbkQsNEVBQXVELENBQUE7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