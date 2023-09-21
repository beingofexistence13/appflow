/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/nls", "vs/platform/configuration/common/configuration", "vs/workbench/common/views", "vs/workbench/contrib/search/common/constants", "vs/workbench/contrib/searchEditor/browser/constants", "vs/workbench/contrib/search/browser/searchModel", "vs/workbench/contrib/searchEditor/browser/searchEditorInput", "vs/workbench/services/editor/common/editorService", "vs/platform/contextkey/common/contextkey", "vs/base/common/types", "vs/platform/actions/common/actions", "vs/editor/contrib/find/browser/findModel", "vs/workbench/contrib/search/browser/searchActionsBase", "vs/platform/accessibility/common/accessibility"], function (require, exports, platform_1, nls, configuration_1, views_1, Constants, SearchEditorConstants, searchModel_1, searchEditorInput_1, editorService_1, contextkey_1, types_1, actions_1, findModel_1, searchActionsBase_1, accessibility_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#region Actions: Changing Search Input Options
    (0, actions_1.registerAction2)(class ToggleQueryDetailsAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.ToggleQueryDetailsActionId,
                title: {
                    value: nls.localize('ToggleQueryDetailsAction.label', "Toggle Query Details"),
                    original: 'Toggle Query Details'
                },
                category: searchActionsBase_1.category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.ContextKeyExpr.or(Constants.SearchViewFocusedKey, SearchEditorConstants.InSearchEditor),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 40 /* KeyCode.KeyJ */,
                },
            });
        }
        run(accessor, ...args) {
            const contextService = accessor.get(contextkey_1.IContextKeyService).getContext(document.activeElement);
            if (contextService.getValue(SearchEditorConstants.InSearchEditor.serialize())) {
                accessor.get(editorService_1.IEditorService).activeEditorPane.toggleQueryDetails(args[0]?.show);
            }
            else if (contextService.getValue(Constants.SearchViewFocusedKey.serialize())) {
                const searchView = (0, searchActionsBase_1.getSearchView)(accessor.get(views_1.IViewsService));
                (0, types_1.assertIsDefined)(searchView).toggleQueryDetails(undefined, args[0]?.show);
            }
        }
    });
    (0, actions_1.registerAction2)(class CloseReplaceAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.CloseReplaceWidgetActionId,
                title: {
                    value: nls.localize('CloseReplaceWidget.label', "Close Replace Widget"),
                    original: 'Close Replace Widget'
                },
                category: searchActionsBase_1.category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.ReplaceInputBoxFocusedKey),
                    primary: 9 /* KeyCode.Escape */,
                },
            });
        }
        run(accessor) {
            const searchView = (0, searchActionsBase_1.getSearchView)(accessor.get(views_1.IViewsService));
            if (searchView) {
                searchView.searchAndReplaceWidget.toggleReplace(false);
                searchView.searchAndReplaceWidget.focus();
            }
            return Promise.resolve(null);
        }
    });
    (0, actions_1.registerAction2)(class ToggleCaseSensitiveCommandAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.ToggleCaseSensitiveCommandId,
                title: {
                    value: nls.localize('ToggleCaseSensitiveCommandId.label', "Toggle Case Sensitive"),
                    original: 'Toggle Case Sensitive'
                },
                category: searchActionsBase_1.category,
                keybinding: Object.assign({
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: platform_1.isMacintosh ? contextkey_1.ContextKeyExpr.and(Constants.SearchViewFocusedKey, Constants.FileMatchOrFolderMatchFocusKey.toNegated()) : Constants.SearchViewFocusedKey,
                }, findModel_1.ToggleCaseSensitiveKeybinding)
            });
        }
        async run(accessor) {
            toggleCaseSensitiveCommand(accessor);
        }
    });
    (0, actions_1.registerAction2)(class ToggleWholeWordCommandAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.ToggleWholeWordCommandId,
                title: {
                    value: nls.localize('ToggleWholeWordCommandId.label', 'Toggle Whole Word'),
                    original: 'Toggle Whole Word'
                },
                keybinding: Object.assign({
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: Constants.SearchViewFocusedKey,
                }, findModel_1.ToggleWholeWordKeybinding),
                category: searchActionsBase_1.category,
            });
        }
        async run(accessor) {
            return toggleWholeWordCommand(accessor);
        }
    });
    (0, actions_1.registerAction2)(class ToggleRegexCommandAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.ToggleRegexCommandId,
                title: {
                    value: nls.localize('ToggleRegexCommandId.label', 'Toggle Regex'),
                    original: 'Toggle Regex'
                },
                keybinding: Object.assign({
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: Constants.SearchViewFocusedKey,
                }, findModel_1.ToggleRegexKeybinding),
                category: searchActionsBase_1.category,
            });
        }
        async run(accessor) {
            return toggleRegexCommand(accessor);
        }
    });
    (0, actions_1.registerAction2)(class TogglePreserveCaseAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.TogglePreserveCaseId,
                title: {
                    value: nls.localize('TogglePreserveCaseId.label', 'Toggle Preserve Case'),
                    original: 'Toggle Preserve Case'
                },
                keybinding: Object.assign({
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: Constants.SearchViewFocusedKey,
                }, findModel_1.TogglePreserveCaseKeybinding),
                category: searchActionsBase_1.category,
            });
        }
        async run(accessor) {
            return togglePreserveCaseCommand(accessor);
        }
    });
    //#endregion
    //#region Actions: Opening Matches
    (0, actions_1.registerAction2)(class OpenMatchAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.OpenMatch,
                title: {
                    value: nls.localize('OpenMatch.label', "Open Match"),
                    original: 'Open Match'
                },
                category: searchActionsBase_1.category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.FileMatchOrMatchFocusKey),
                    primary: 3 /* KeyCode.Enter */,
                    mac: {
                        primary: 3 /* KeyCode.Enter */,
                        secondary: [2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */]
                    },
                },
            });
        }
        run(accessor) {
            const searchView = (0, searchActionsBase_1.getSearchView)(accessor.get(views_1.IViewsService));
            if (searchView) {
                const tree = searchView.getControl();
                const viewer = searchView.getControl();
                const focus = tree.getFocus()[0];
                if (focus instanceof searchModel_1.FolderMatch) {
                    viewer.toggleCollapsed(focus);
                }
                else {
                    searchView.open(tree.getFocus()[0], false, false, true);
                }
            }
        }
    });
    (0, actions_1.registerAction2)(class OpenMatchToSideAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.OpenMatchToSide,
                title: {
                    value: nls.localize('OpenMatchToSide.label', "Open Match To Side"),
                    original: 'Open Match To Side'
                },
                category: searchActionsBase_1.category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.FileMatchOrMatchFocusKey),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
                    mac: {
                        primary: 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */
                    },
                },
            });
        }
        run(accessor) {
            const searchView = (0, searchActionsBase_1.getSearchView)(accessor.get(views_1.IViewsService));
            if (searchView) {
                const tree = searchView.getControl();
                searchView.open(tree.getFocus()[0], false, true, true);
            }
        }
    });
    (0, actions_1.registerAction2)(class AddCursorsAtSearchResultsAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.AddCursorsAtSearchResults,
                title: {
                    value: nls.localize('AddCursorsAtSearchResults.label', 'Add Cursors at Search Results'),
                    original: 'Add Cursors at Search Results'
                },
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.FileMatchOrMatchFocusKey),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 42 /* KeyCode.KeyL */,
                },
                category: searchActionsBase_1.category,
            });
        }
        async run(accessor) {
            const searchView = (0, searchActionsBase_1.getSearchView)(accessor.get(views_1.IViewsService));
            if (searchView) {
                const tree = searchView.getControl();
                searchView.openEditorWithMultiCursor(tree.getFocus()[0]);
            }
        }
    });
    //#endregion
    //#region Actions: Toggling Focus
    (0, actions_1.registerAction2)(class FocusNextInputAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.FocusNextInputActionId,
                title: {
                    value: nls.localize('FocusNextInputAction.label', "Focus Next Input"),
                    original: 'Focus Next Input'
                },
                category: searchActionsBase_1.category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.and(SearchEditorConstants.InSearchEditor, Constants.InputBoxFocusedKey), contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.InputBoxFocusedKey)),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
                },
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const input = editorService.activeEditor;
            if (input instanceof searchEditorInput_1.SearchEditorInput) {
                // cast as we cannot import SearchEditor as a value b/c cyclic dependency.
                editorService.activeEditorPane.focusNextInput();
            }
            const searchView = (0, searchActionsBase_1.getSearchView)(accessor.get(views_1.IViewsService));
            searchView?.focusNextInputBox();
        }
    });
    (0, actions_1.registerAction2)(class FocusPreviousInputAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.FocusPreviousInputActionId,
                title: {
                    value: nls.localize('FocusPreviousInputAction.label', "Focus Previous Input"),
                    original: 'Focus Previous Input'
                },
                category: searchActionsBase_1.category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.and(SearchEditorConstants.InSearchEditor, Constants.InputBoxFocusedKey), contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.InputBoxFocusedKey, Constants.SearchInputBoxFocusedKey.toNegated())),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */,
                },
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const input = editorService.activeEditor;
            if (input instanceof searchEditorInput_1.SearchEditorInput) {
                // cast as we cannot import SearchEditor as a value b/c cyclic dependency.
                editorService.activeEditorPane.focusPrevInput();
            }
            const searchView = (0, searchActionsBase_1.getSearchView)(accessor.get(views_1.IViewsService));
            searchView?.focusPreviousInputBox();
        }
    });
    (0, actions_1.registerAction2)(class FocusSearchFromResultsAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.FocusSearchFromResults,
                title: {
                    value: nls.localize('FocusSearchFromResults.label', "Focus Search From Results"),
                    original: 'Focus Search From Results'
                },
                category: searchActionsBase_1.category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, contextkey_1.ContextKeyExpr.or(Constants.FirstMatchFocusKey, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED)),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */,
                },
            });
        }
        run(accessor) {
            const searchView = (0, searchActionsBase_1.getSearchView)(accessor.get(views_1.IViewsService));
            searchView?.focusPreviousInputBox();
        }
    });
    (0, actions_1.registerAction2)(class ToggleSearchOnTypeAction extends actions_1.Action2 {
        static { this.searchOnTypeKey = 'search.searchOnType'; }
        constructor() {
            super({
                id: Constants.ToggleSearchOnTypeActionId,
                title: {
                    value: nls.localize('toggleTabs', 'Toggle Search on Type'),
                    original: 'Toggle Search on Type'
                },
                category: searchActionsBase_1.category,
            });
        }
        async run(accessor) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const searchOnType = configurationService.getValue(ToggleSearchOnTypeAction.searchOnTypeKey);
            return configurationService.updateValue(ToggleSearchOnTypeAction.searchOnTypeKey, !searchOnType);
        }
    });
    (0, actions_1.registerAction2)(class FocusSearchListCommandAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.FocusSearchListCommandID,
                title: {
                    value: nls.localize('focusSearchListCommandLabel', "Focus List"),
                    original: 'Focus List'
                },
                category: searchActionsBase_1.category,
                f1: true
            });
        }
        async run(accessor) {
            focusSearchListCommand(accessor);
        }
    });
    (0, actions_1.registerAction2)(class FocusNextSearchResultAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.FocusNextSearchResultActionId,
                title: {
                    value: nls.localize('FocusNextSearchResult.label', 'Focus Next Search Result'),
                    original: 'Focus Next Search Result'
                },
                keybinding: [{
                        primary: 62 /* KeyCode.F4 */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    }],
                category: searchActionsBase_1.category,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.or(Constants.HasSearchResults, SearchEditorConstants.InSearchEditor),
            });
        }
        async run(accessor) {
            return await focusNextSearchResult(accessor);
        }
    });
    (0, actions_1.registerAction2)(class FocusPreviousSearchResultAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.FocusPreviousSearchResultActionId,
                title: {
                    value: nls.localize('FocusPreviousSearchResult.label', 'Focus Previous Search Result'),
                    original: 'Focus Previous Search Result'
                },
                keybinding: [{
                        primary: 1024 /* KeyMod.Shift */ | 62 /* KeyCode.F4 */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    }],
                category: searchActionsBase_1.category,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.or(Constants.HasSearchResults, SearchEditorConstants.InSearchEditor),
            });
        }
        async run(accessor) {
            return await focusPreviousSearchResult(accessor);
        }
    });
    (0, actions_1.registerAction2)(class ReplaceInFilesAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.ReplaceInFilesActionId,
                title: {
                    value: nls.localize('replaceInFiles', 'Replace in Files'),
                    original: 'Replace in Files'
                },
                keybinding: [{
                        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 38 /* KeyCode.KeyH */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    }],
                category: searchActionsBase_1.category,
                f1: true,
                menu: [{
                        id: actions_1.MenuId.MenubarEditMenu,
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
        const searchView = (0, searchActionsBase_1.getSearchView)(accessor.get(views_1.IViewsService));
        searchView?.toggleCaseSensitive();
    }
    function toggleWholeWordCommand(accessor) {
        const searchView = (0, searchActionsBase_1.getSearchView)(accessor.get(views_1.IViewsService));
        searchView?.toggleWholeWords();
    }
    function toggleRegexCommand(accessor) {
        const searchView = (0, searchActionsBase_1.getSearchView)(accessor.get(views_1.IViewsService));
        searchView?.toggleRegex();
    }
    function togglePreserveCaseCommand(accessor) {
        const searchView = (0, searchActionsBase_1.getSearchView)(accessor.get(views_1.IViewsService));
        searchView?.togglePreserveCase();
    }
    const focusSearchListCommand = accessor => {
        const viewsService = accessor.get(views_1.IViewsService);
        (0, searchActionsBase_1.openSearchView)(viewsService).then(searchView => {
            searchView?.moveFocusToResults();
        });
    };
    async function focusNextSearchResult(accessor) {
        const editorService = accessor.get(editorService_1.IEditorService);
        const input = editorService.activeEditor;
        if (input instanceof searchEditorInput_1.SearchEditorInput) {
            // cast as we cannot import SearchEditor as a value b/c cyclic dependency.
            return editorService.activeEditorPane.focusNextResult();
        }
        return (0, searchActionsBase_1.openSearchView)(accessor.get(views_1.IViewsService)).then(searchView => {
            searchView?.selectNextMatch();
        });
    }
    async function focusPreviousSearchResult(accessor) {
        const editorService = accessor.get(editorService_1.IEditorService);
        const input = editorService.activeEditor;
        if (input instanceof searchEditorInput_1.SearchEditorInput) {
            // cast as we cannot import SearchEditor as a value b/c cyclic dependency.
            return editorService.activeEditorPane.focusPreviousResult();
        }
        return (0, searchActionsBase_1.openSearchView)(accessor.get(views_1.IViewsService)).then(searchView => {
            searchView?.selectPreviousMatch();
        });
    }
    async function findOrReplaceInFiles(accessor, expandSearchReplaceWidget) {
        return (0, searchActionsBase_1.openSearchView)(accessor.get(views_1.IViewsService), false).then(openedView => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoQWN0aW9uc05hdi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NlYXJjaC9icm93c2VyL3NlYXJjaEFjdGlvbnNOYXYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUF3QmhHLGdEQUFnRDtJQUNoRCxJQUFBLHlCQUFlLEVBQUMsTUFBTSx3QkFBeUIsU0FBUSxpQkFBTztRQUM3RDtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsU0FBUyxDQUFDLDBCQUEwQjtnQkFDeEMsS0FBSyxFQUFFO29CQUNOLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGdDQUFnQyxFQUFFLHNCQUFzQixDQUFDO29CQUM3RSxRQUFRLEVBQUUsc0JBQXNCO2lCQUNoQztnQkFDRCxRQUFRLEVBQVIsNEJBQVE7Z0JBQ1IsVUFBVSxFQUFFO29CQUNYLE1BQU0sNkNBQW1DO29CQUN6QyxJQUFJLEVBQUUsMkJBQWMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLG9CQUFvQixFQUFFLHFCQUFxQixDQUFDLGNBQWMsQ0FBQztvQkFDN0YsT0FBTyxFQUFFLG1EQUE2Qix3QkFBZTtpQkFDckQ7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBQ0QsR0FBRyxDQUFDLFFBQTBCLEVBQUUsR0FBRyxJQUFXO1lBQzdDLE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsK0JBQWtCLENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzNGLElBQUksY0FBYyxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRTtnQkFDN0UsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4QkFBYyxDQUFDLENBQUMsZ0JBQWlDLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENB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