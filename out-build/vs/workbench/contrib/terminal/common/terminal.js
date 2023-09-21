/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/terminal/common/terminal", "vs/platform/instantiation/common/instantiation"], function (require, exports, nls, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$LM = exports.$KM = exports.TerminalCommandId = exports.$JM = exports.ProcessState = exports.$IM = exports.$HM = exports.$GM = exports.$FM = exports.$EM = exports.$DM = exports.$CM = exports.$BM = exports.$AM = exports.$zM = exports.$yM = exports.$xM = exports.$wM = exports.$vM = exports.$uM = exports.$tM = void 0;
    exports.$tM = 'terminal';
    exports.$uM = ['workbench.action.terminal.toggleTerminal', 'workbench.action.terminal.new', 'workbench.action.togglePanel', 'workbench.action.terminal.focus'];
    exports.$vM = 'terminal.integrated';
    exports.$wM = 0;
    exports.$xM = -5;
    exports.$yM = 1;
    exports.$zM = 1;
    exports.$AM = 1000;
    exports.$BM = 'normal';
    exports.$CM = 'bold';
    exports.$DM = ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
    exports.$EM = (0, instantiation_1.$Bh)('terminalProfileResolverService');
    /*
     * When there were shell integration args injected
     * and createProcess returns an error, this exit code will be used.
     */
    exports.$FM = 633;
    exports.$GM = (0, instantiation_1.$Bh)('terminalProfileService');
    exports.$HM = ['vim', 'vi', 'nano', 'tmux'];
    const $IM = (t) => typeof t.write === 'function';
    exports.$IM = $IM;
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
    exports.$JM = 'workbench.action.terminal.profile.choice';
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
    exports.$KM = [
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
    exports.$LM = {
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
            description: nls.localize(0, null),
            type: 'object',
            properties: {
                profiles: {
                    type: 'array',
                    description: nls.localize(1, null),
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
                                description: nls.localize(2, null),
                                type: 'string',
                            },
                            title: {
                                description: nls.localize(3, null),
                                type: 'string',
                            },
                            icon: {
                                description: nls.localize(4, null),
                                anyOf: [{
                                        type: 'string',
                                    },
                                    {
                                        type: 'object',
                                        properties: {
                                            light: {
                                                description: nls.localize(5, null),
                                                type: 'string'
                                            },
                                            dark: {
                                                description: nls.localize(6, null),
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
//# sourceMappingURL=terminal.js.map