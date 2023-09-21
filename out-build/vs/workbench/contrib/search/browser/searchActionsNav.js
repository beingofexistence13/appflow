/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/nls!vs/workbench/contrib/search/browser/searchActionsNav", "vs/platform/configuration/common/configuration", "vs/workbench/common/views", "vs/workbench/contrib/search/common/constants", "vs/workbench/contrib/searchEditor/browser/constants", "vs/workbench/contrib/search/browser/searchModel", "vs/workbench/contrib/searchEditor/browser/searchEditorInput", "vs/workbench/services/editor/common/editorService", "vs/platform/contextkey/common/contextkey", "vs/base/common/types", "vs/platform/actions/common/actions", "vs/editor/contrib/find/browser/findModel", "vs/workbench/contrib/search/browser/searchActionsBase", "vs/platform/accessibility/common/accessibility"], function (require, exports, platform_1, nls, configuration_1, views_1, Constants, SearchEditorConstants, searchModel_1, searchEditorInput_1, editorService_1, contextkey_1, types_1, actions_1, findModel_1, searchActionsBase_1, accessibility_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#region Actions: Changing Search Input Options
    (0, actions_1.$Xu)(class ToggleQueryDetailsAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$_Nb,
                title: {
                    value: nls.localize(0, null),
                    original: 'Toggle Query Details'
                },
                category: searchActionsBase_1.$vNb,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.$Ii.or(Constants.$hOb, SearchEditorConstants.$DOb),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 40 /* KeyCode.KeyJ */,
                },
            });
        }
        run(accessor, ...args) {
            const contextService = accessor.get(contextkey_1.$3i).getContext(document.activeElement);
            if (contextService.getValue(SearchEditorConstants.$DOb.serialize())) {
                accessor.get(editorService_1.$9C).activeEditorPane.toggleQueryDetails(args[0]?.show);
            }
            else if (contextService.getValue(Constants.$hOb.serialize())) {
                const searchView = (0, searchActionsBase_1.$yNb)(accessor.get(views_1.$$E));
                (0, types_1.$uf)(searchView).toggleQueryDetails(undefined, args[0]?.show);
            }
        }
    });
    (0, actions_1.$Xu)(class CloseReplaceAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$RNb,
                title: {
                    value: nls.localize(1, null),
                    original: 'Close Replace Widget'
                },
                category: searchActionsBase_1.$vNb,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.$Ii.and(Constants.$gOb, Constants.$kOb),
                    primary: 9 /* KeyCode.Escape */,
                },
            });
        }
        run(accessor) {
            const searchView = (0, searchActionsBase_1.$yNb)(accessor.get(views_1.$$E));
            if (searchView) {
                searchView.searchAndReplaceWidget.toggleReplace(false);
                searchView.searchAndReplaceWidget.focus();
            }
            return Promise.resolve(null);
        }
    });
    (0, actions_1.$Xu)(class ToggleCaseSensitiveCommandAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$SNb,
                title: {
                    value: nls.localize(2, null),
                    original: 'Toggle Case Sensitive'
                },
                category: searchActionsBase_1.$vNb,
                keybinding: Object.assign({
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: platform_1.$j ? contextkey_1.$Ii.and(Constants.$hOb, Constants.$rOb.toNegated()) : Constants.$hOb,
                }, findModel_1.$C7)
            });
        }
        async run(accessor) {
            toggleCaseSensitiveCommand(accessor);
        }
    });
    (0, actions_1.$Xu)(class ToggleWholeWordCommandAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$TNb,
                title: {
                    value: nls.localize(3, null),
                    original: 'Toggle Whole Word'
                },
                keybinding: Object.assign({
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: Constants.$hOb,
                }, findModel_1.$D7),
                category: searchActionsBase_1.$vNb,
            });
        }
        async run(accessor) {
            return toggleWholeWordCommand(accessor);
        }
    });
    (0, actions_1.$Xu)(class ToggleRegexCommandAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$UNb,
                title: {
                    value: nls.localize(4, null),
                    original: 'Toggle Regex'
                },
                keybinding: Object.assign({
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: Constants.$hOb,
                }, findModel_1.$E7),
                category: searchActionsBase_1.$vNb,
            });
        }
        async run(accessor) {
            return toggleRegexCommand(accessor);
        }
    });
    (0, actions_1.$Xu)(class TogglePreserveCaseAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$VNb,
                title: {
                    value: nls.localize(5, null),
                    original: 'Toggle Preserve Case'
                },
                keybinding: Object.assign({
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: Constants.$hOb,
                }, findModel_1.$G7),
                category: searchActionsBase_1.$vNb,
            });
        }
        async run(accessor) {
            return togglePreserveCaseCommand(accessor);
        }
    });
    //#endregion
    //#region Actions: Opening Matches
    (0, actions_1.$Xu)(class OpenMatchAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$FNb,
                title: {
                    value: nls.localize(6, null),
                    original: 'Open Match'
                },
                category: searchActionsBase_1.$vNb,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.$Ii.and(Constants.$gOb, Constants.$qOb),
                    primary: 3 /* KeyCode.Enter */,
                    mac: {
                        primary: 3 /* KeyCode.Enter */,
                        secondary: [2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */]
                    },
                },
            });
        }
        run(accessor) {
            const searchView = (0, searchActionsBase_1.$yNb)(accessor.get(views_1.$$E));
            if (searchView) {
                const tree = searchView.getControl();
                const viewer = searchView.getControl();
                const focus = tree.getFocus()[0];
                if (focus instanceof searchModel_1.$TMb) {
                    viewer.toggleCollapsed(focus);
                }
                else {
                    searchView.open(tree.getFocus()[0], false, false, true);
                }
            }
        }
    });
    (0, actions_1.$Xu)(class OpenMatchToSideAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$GNb,
                title: {
                    value: nls.localize(7, null),
                    original: 'Open Match To Side'
                },
                category: searchActionsBase_1.$vNb,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.$Ii.and(Constants.$gOb, Constants.$qOb),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
                    mac: {
                        primary: 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */
                    },
                },
            });
        }
        run(accessor) {
            const searchView = (0, searchActionsBase_1.$yNb)(accessor.get(views_1.$$E));
            if (searchView) {
                const tree = searchView.getControl();
                searchView.open(tree.getFocus()[0], false, true, true);
            }
        }
    });
    (0, actions_1.$Xu)(class AddCursorsAtSearchResultsAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$WNb,
                title: {
                    value: nls.localize(8, null),
                    original: 'Add Cursors at Search Results'
                },
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.$Ii.and(Constants.$gOb, Constants.$qOb),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 42 /* KeyCode.KeyL */,
                },
                category: searchActionsBase_1.$vNb,
            });
        }
        async run(accessor) {
            const searchView = (0, searchActionsBase_1.$yNb)(accessor.get(views_1.$$E));
            if (searchView) {
                const tree = searchView.getControl();
                searchView.openEditorWithMultiCursor(tree.getFocus()[0]);
            }
        }
    });
    //#endregion
    //#region Actions: Toggling Focus
    (0, actions_1.$Xu)(class FocusNextInputAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$bOb,
                title: {
                    value: nls.localize(9, null),
                    original: 'Focus Next Input'
                },
                category: searchActionsBase_1.$vNb,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.$Ii.or(contextkey_1.$Ii.and(SearchEditorConstants.$DOb, Constants.$iOb), contextkey_1.$Ii.and(Constants.$gOb, Constants.$iOb)),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
                },
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const input = editorService.activeEditor;
            if (input instanceof searchEditorInput_1.$1Ob) {
                // cast as we cannot import SearchEditor as a value b/c cyclic dependency.
                editorService.activeEditorPane.focusNextInput();
            }
            const searchView = (0, searchActionsBase_1.$yNb)(accessor.get(views_1.$$E));
            searchView?.focusNextInputBox();
        }
    });
    (0, actions_1.$Xu)(class FocusPreviousInputAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$cOb,
                title: {
                    value: nls.localize(10, null),
                    original: 'Focus Previous Input'
                },
                category: searchActionsBase_1.$vNb,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.$Ii.or(contextkey_1.$Ii.and(SearchEditorConstants.$DOb, Constants.$iOb), contextkey_1.$Ii.and(Constants.$gOb, Constants.$iOb, Constants.$jOb.toNegated())),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */,
                },
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const input = editorService.activeEditor;
            if (input instanceof searchEditorInput_1.$1Ob) {
                // cast as we cannot import SearchEditor as a value b/c cyclic dependency.
                editorService.activeEditorPane.focusPrevInput();
            }
            const searchView = (0, searchActionsBase_1.$yNb)(accessor.get(views_1.$$E));
            searchView?.focusPreviousInputBox();
        }
    });
    (0, actions_1.$Xu)(class FocusSearchFromResultsAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$ENb,
                title: {
                    value: nls.localize(11, null),
                    original: 'Focus Search From Results'
                },
                category: searchActionsBase_1.$vNb,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.$Ii.and(Constants.$gOb, contextkey_1.$Ii.or(Constants.$pOb, accessibility_1.$2r)),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */,
                },
            });
        }
        run(accessor) {
            const searchView = (0, searchActionsBase_1.$yNb)(accessor.get(views_1.$$E));
            searchView?.focusPreviousInputBox();
        }
    });
    (0, actions_1.$Xu)(class ToggleSearchOnTypeAction extends actions_1.$Wu {
        static { this.a = 'search.searchOnType'; }
        constructor() {
            super({
                id: Constants.$6Nb,
                title: {
                    value: nls.localize(12, null),
                    original: 'Toggle Search on Type'
                },
                category: searchActionsBase_1.$vNb,
            });
        }
        async run(accessor) {
            const configurationService = accessor.get(configuration_1.$8h);
            const searchOnType = configurationService.getValue(ToggleSearchOnTypeAction.a);
            return configurationService.updateValue(ToggleSearchOnTypeAction.a, !searchOnType);
        }
    });
    (0, actions_1.$Xu)(class FocusSearchListCommandAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$NNb,
                title: {
                    value: nls.localize(13, null),
                    original: 'Focus List'
                },
                category: searchActionsBase_1.$vNb,
                f1: true
            });
        }
        async run(accessor) {
            focusSearchListCommand(accessor);
        }
    });
    (0, actions_1.$Xu)(class FocusNextSearchResultAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$4Nb,
                title: {
                    value: nls.localize(14, null),
                    original: 'Focus Next Search Result'
                },
                keybinding: [{
                        primary: 62 /* KeyCode.F4 */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    }],
                category: searchActionsBase_1.$vNb,
                f1: true,
                precondition: contextkey_1.$Ii.or(Constants.$oOb, SearchEditorConstants.$DOb),
            });
        }
        async run(accessor) {
            return await focusNextSearchResult(accessor);
        }
    });
    (0, actions_1.$Xu)(class FocusPreviousSearchResultAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$5Nb,
                title: {
                    value: nls.localize(15, null),
                    original: 'Focus Previous Search Result'
                },
                keybinding: [{
                        primary: 1024 /* KeyMod.Shift */ | 62 /* KeyCode.F4 */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    }],
                category: searchActionsBase_1.$vNb,
                f1: true,
                precondition: contextkey_1.$Ii.or(Constants.$oOb, SearchEditorConstants.$DOb),
            });
        }
        async run(accessor) {
            return await focusPreviousSearchResult(accessor);
        }
    });
    (0, actions_1.$Xu)(class ReplaceInFilesAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$YNb,
                title: {
                    value: nls.localize(16, null),
                    original: 'Replace in Files'
                },
                keybinding: [{
                        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 38 /* KeyCode.KeyH */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    }],
                category: searchActionsBase_1.$vNb,
                f1: true,
                menu: [{
                        id: actions_1.$Ru.MenubarEditMenu,
                        group: '4_find_global',
                        order: 2
                    }],
            });
        }
        async run(accessor) {
            return await findOrReplaceInFiles(accessor, true);
        }
    });
    //#endregion
    //#region Helpers
    function toggleCaseSensitiveCommand(accessor) {
        const searchView = (0, searchActionsBase_1.$yNb)(accessor.get(views_1.$$E));
        searchView?.toggleCaseSensitive();
    }
    function toggleWholeWordCommand(accessor) {
        const searchView = (0, searchActionsBase_1.$yNb)(accessor.get(views_1.$$E));
        searchView?.toggleWholeWords();
    }
    function toggleRegexCommand(accessor) {
        const searchView = (0, searchActionsBase_1.$yNb)(accessor.get(views_1.$$E));
        searchView?.toggleRegex();
    }
    function togglePreserveCaseCommand(accessor) {
        const searchView = (0, searchActionsBase_1.$yNb)(accessor.get(views_1.$$E));
        searchView?.togglePreserveCase();
    }
    const focusSearchListCommand = accessor => {
        const viewsService = accessor.get(views_1.$$E);
        (0, searchActionsBase_1.$BNb)(viewsService).then(searchView => {
            searchView?.moveFocusToResults();
        });
    };
    async function focusNextSearchResult(accessor) {
        const editorService = accessor.get(editorService_1.$9C);
        const input = editorService.activeEditor;
        if (input instanceof searchEditorInput_1.$1Ob) {
            // cast as we cannot import SearchEditor as a value b/c cyclic dependency.
            return editorService.activeEditorPane.focusNextResult();
        }
        return (0, searchActionsBase_1.$BNb)(accessor.get(views_1.$$E)).then(searchView => {
            searchView?.selectNextMatch();
        });
    }
    async function focusPreviousSearchResult(accessor) {
        const editorService = accessor.get(editorService_1.$9C);
        const input = editorService.activeEditor;
        if (input instanceof searchEditorInput_1.$1Ob) {
            // cast as we cannot import SearchEditor as a value b/c cyclic dependency.
            return editorService.activeEditorPane.focusPreviousResult();
        }
        return (0, searchActionsBase_1.$BNb)(accessor.get(views_1.$$E)).then(searchView => {
            searchView?.selectPreviousMatch();
        });
    }
    async function findOrReplaceInFiles(accessor, expandSearchReplaceWidget) {
        return (0, searchActionsBase_1.$BNb)(accessor.get(views_1.$$E), false).then(openedView => {
            if (openedView) {
                const searchAndReplaceWidget = openedView.searchAndReplaceWidget;
                searchAndReplaceWidget.toggleReplace(expandSearchReplaceWidget);
                const updatedText = openedView.updateTextFromFindWidgetOrSelection({ allowUnselectedWord: !expandSearchReplaceWidget });
                openedView.searchAndReplaceWidget.focus(undefined, updatedText, updatedText);
            }
        });
    }
});
//#endregion
//# sourceMappingURL=searchActionsNav.js.map