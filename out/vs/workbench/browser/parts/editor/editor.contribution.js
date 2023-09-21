/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/nls", "vs/workbench/browser/editor", "vs/workbench/common/editor", "vs/workbench/common/contextkeys", "vs/workbench/common/editor/sideBySideEditorInput", "vs/workbench/browser/parts/editor/textResourceEditor", "vs/workbench/browser/parts/editor/sideBySideEditor", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/services/untitled/common/untitledTextEditorInput", "vs/workbench/common/editor/textResourceEditorInput", "vs/workbench/browser/parts/editor/textDiffEditor", "vs/workbench/browser/parts/editor/binaryDiffEditor", "vs/workbench/browser/parts/editor/editorStatus", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/descriptors", "vs/workbench/browser/parts/editor/editorActions", "vs/workbench/browser/parts/editor/editorCommands", "vs/workbench/browser/quickaccess", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/contextkey/common/contextkey", "vs/base/common/platform", "vs/editor/browser/editorExtensions", "vs/workbench/browser/codeeditor", "vs/workbench/common/contributions", "vs/workbench/browser/parts/editor/editorAutoSave", "vs/platform/quickinput/common/quickAccess", "vs/workbench/browser/parts/editor/editorQuickAccess", "vs/base/common/network", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/workbench/services/untitled/common/untitledTextEditorHandler", "vs/workbench/browser/parts/editor/editorConfiguration", "vs/workbench/browser/actions/layoutActions"], function (require, exports, platform_1, nls_1, editor_1, editor_2, contextkeys_1, sideBySideEditorInput_1, textResourceEditor_1, sideBySideEditor_1, diffEditorInput_1, untitledTextEditorInput_1, textResourceEditorInput_1, textDiffEditor_1, binaryDiffEditor_1, editorStatus_1, actionCommonCategories_1, actions_1, descriptors_1, editorActions_1, editorCommands_1, quickaccess_1, keybindingsRegistry_1, contextkey_1, platform_2, editorExtensions_1, codeeditor_1, contributions_1, editorAutoSave_1, quickAccess_1, editorQuickAccess_1, network_1, codicons_1, iconRegistry_1, untitledTextEditorHandler_1, editorConfiguration_1, layoutActions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#region Editor Registrations
    platform_1.Registry.as(editor_2.EditorExtensions.EditorPane).registerEditorPane(editor_1.EditorPaneDescriptor.create(textResourceEditor_1.TextResourceEditor, textResourceEditor_1.TextResourceEditor.ID, (0, nls_1.localize)('textEditor', "Text Editor")), [
        new descriptors_1.SyncDescriptor(untitledTextEditorInput_1.UntitledTextEditorInput),
        new descriptors_1.SyncDescriptor(textResourceEditorInput_1.TextResourceEditorInput)
    ]);
    platform_1.Registry.as(editor_2.EditorExtensions.EditorPane).registerEditorPane(editor_1.EditorPaneDescriptor.create(textDiffEditor_1.TextDiffEditor, textDiffEditor_1.TextDiffEditor.ID, (0, nls_1.localize)('textDiffEditor', "Text Diff Editor")), [
        new descriptors_1.SyncDescriptor(diffEditorInput_1.DiffEditorInput)
    ]);
    platform_1.Registry.as(editor_2.EditorExtensions.EditorPane).registerEditorPane(editor_1.EditorPaneDescriptor.create(binaryDiffEditor_1.BinaryResourceDiffEditor, binaryDiffEditor_1.BinaryResourceDiffEditor.ID, (0, nls_1.localize)('binaryDiffEditor', "Binary Diff Editor")), [
        new descriptors_1.SyncDescriptor(diffEditorInput_1.DiffEditorInput)
    ]);
    platform_1.Registry.as(editor_2.EditorExtensions.EditorPane).registerEditorPane(editor_1.EditorPaneDescriptor.create(sideBySideEditor_1.SideBySideEditor, sideBySideEditor_1.SideBySideEditor.ID, (0, nls_1.localize)('sideBySideEditor', "Side by Side Editor")), [
        new descriptors_1.SyncDescriptor(sideBySideEditorInput_1.SideBySideEditorInput)
    ]);
    platform_1.Registry.as(editor_2.EditorExtensions.EditorFactory).registerEditorSerializer(untitledTextEditorInput_1.UntitledTextEditorInput.ID, untitledTextEditorHandler_1.UntitledTextEditorInputSerializer);
    platform_1.Registry.as(editor_2.EditorExtensions.EditorFactory).registerEditorSerializer(sideBySideEditorInput_1.SideBySideEditorInput.ID, sideBySideEditorInput_1.SideBySideEditorInputSerializer);
    platform_1.Registry.as(editor_2.EditorExtensions.EditorFactory).registerEditorSerializer(diffEditorInput_1.DiffEditorInput.ID, diffEditorInput_1.DiffEditorInputSerializer);
    //#endregion
    //#region Workbench Contributions
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(editorAutoSave_1.EditorAutoSave, 2 /* LifecyclePhase.Ready */);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(editorStatus_1.EditorStatus, 2 /* LifecyclePhase.Ready */);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(untitledTextEditorHandler_1.UntitledTextEditorWorkingCopyEditorHandler, 2 /* LifecyclePhase.Ready */);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(editorConfiguration_1.DynamicEditorConfigurations, 2 /* LifecyclePhase.Ready */);
    (0, editorExtensions_1.registerEditorContribution)(codeeditor_1.FloatingEditorClickMenu.ID, codeeditor_1.FloatingEditorClickMenu, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    //#endregion
    //#region Quick Access
    const quickAccessRegistry = platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess);
    const editorPickerContextKey = 'inEditorsPicker';
    const editorPickerContext = contextkey_1.ContextKeyExpr.and(quickaccess_1.inQuickPickContext, contextkey_1.ContextKeyExpr.has(editorPickerContextKey));
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: editorQuickAccess_1.ActiveGroupEditorsByMostRecentlyUsedQuickAccess,
        prefix: editorQuickAccess_1.ActiveGroupEditorsByMostRecentlyUsedQuickAccess.PREFIX,
        contextKey: editorPickerContextKey,
        placeholder: (0, nls_1.localize)('editorQuickAccessPlaceholder', "Type the name of an editor to open it."),
        helpEntries: [{ description: (0, nls_1.localize)('activeGroupEditorsByMostRecentlyUsedQuickAccess', "Show Editors in Active Group by Most Recently Used"), commandId: editorActions_1.ShowEditorsInActiveGroupByMostRecentlyUsedAction.ID }]
    });
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: editorQuickAccess_1.AllEditorsByAppearanceQuickAccess,
        prefix: editorQuickAccess_1.AllEditorsByAppearanceQuickAccess.PREFIX,
        contextKey: editorPickerContextKey,
        placeholder: (0, nls_1.localize)('editorQuickAccessPlaceholder', "Type the name of an editor to open it."),
        helpEntries: [{ description: (0, nls_1.localize)('allEditorsByAppearanceQuickAccess', "Show All Opened Editors By Appearance"), commandId: editorActions_1.ShowAllEditorsByAppearanceAction.ID }]
    });
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: editorQuickAccess_1.AllEditorsByMostRecentlyUsedQuickAccess,
        prefix: editorQuickAccess_1.AllEditorsByMostRecentlyUsedQuickAccess.PREFIX,
        contextKey: editorPickerContextKey,
        placeholder: (0, nls_1.localize)('editorQuickAccessPlaceholder', "Type the name of an editor to open it."),
        helpEntries: [{ description: (0, nls_1.localize)('allEditorsByMostRecentlyUsedQuickAccess', "Show All Opened Editors By Most Recently Used"), commandId: editorActions_1.ShowAllEditorsByMostRecentlyUsedAction.ID }]
    });
    //#endregion
    //#region Actions & Commands
    // Editor Status
    (0, actions_1.registerAction2)(editorStatus_1.ChangeLanguageAction);
    (0, actions_1.registerAction2)(editorStatus_1.ChangeEOLAction);
    (0, actions_1.registerAction2)(editorStatus_1.ChangeEncodingAction);
    // Editor Management (new style)
    (0, actions_1.registerAction2)(editorActions_1.NavigateForwardAction);
    (0, actions_1.registerAction2)(editorActions_1.NavigateBackwardsAction);
    (0, actions_1.registerAction2)(editorActions_1.OpenNextEditor);
    (0, actions_1.registerAction2)(editorActions_1.OpenPreviousEditor);
    (0, actions_1.registerAction2)(editorActions_1.OpenNextEditorInGroup);
    (0, actions_1.registerAction2)(editorActions_1.OpenPreviousEditorInGroup);
    (0, actions_1.registerAction2)(editorActions_1.OpenFirstEditorInGroup);
    (0, actions_1.registerAction2)(editorActions_1.OpenLastEditorInGroup);
    (0, actions_1.registerAction2)(editorActions_1.OpenNextRecentlyUsedEditorAction);
    (0, actions_1.registerAction2)(editorActions_1.OpenPreviousRecentlyUsedEditorAction);
    (0, actions_1.registerAction2)(editorActions_1.OpenNextRecentlyUsedEditorInGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.OpenPreviousRecentlyUsedEditorInGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.ReopenClosedEditorAction);
    (0, actions_1.registerAction2)(editorActions_1.ClearRecentFilesAction);
    (0, actions_1.registerAction2)(editorActions_1.ShowAllEditorsByAppearanceAction);
    (0, actions_1.registerAction2)(editorActions_1.ShowAllEditorsByMostRecentlyUsedAction);
    (0, actions_1.registerAction2)(editorActions_1.ShowEditorsInActiveGroupByMostRecentlyUsedAction);
    (0, actions_1.registerAction2)(editorActions_1.CloseAllEditorsAction);
    (0, actions_1.registerAction2)(editorActions_1.CloseAllEditorGroupsAction);
    (0, actions_1.registerAction2)(editorActions_1.CloseLeftEditorsInGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.CloseEditorsInOtherGroupsAction);
    (0, actions_1.registerAction2)(editorActions_1.CloseEditorInAllGroupsAction);
    (0, actions_1.registerAction2)(editorActions_1.RevertAndCloseEditorAction);
    (0, actions_1.registerAction2)(editorActions_1.SplitEditorAction);
    (0, actions_1.registerAction2)(editorActions_1.SplitEditorOrthogonalAction);
    (0, actions_1.registerAction2)(editorActions_1.SplitEditorLeftAction);
    (0, actions_1.registerAction2)(editorActions_1.SplitEditorRightAction);
    (0, actions_1.registerAction2)(editorActions_1.SplitEditorUpAction);
    (0, actions_1.registerAction2)(editorActions_1.SplitEditorDownAction);
    (0, actions_1.registerAction2)(editorActions_1.JoinTwoGroupsAction);
    (0, actions_1.registerAction2)(editorActions_1.JoinAllGroupsAction);
    (0, actions_1.registerAction2)(editorActions_1.NavigateBetweenGroupsAction);
    (0, actions_1.registerAction2)(editorActions_1.ResetGroupSizesAction);
    (0, actions_1.registerAction2)(editorActions_1.ToggleGroupSizesAction);
    (0, actions_1.registerAction2)(editorActions_1.MaximizeGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.MinimizeOtherGroupsAction);
    (0, actions_1.registerAction2)(editorActions_1.MoveEditorLeftInGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.MoveEditorRightInGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.MoveGroupLeftAction);
    (0, actions_1.registerAction2)(editorActions_1.MoveGroupRightAction);
    (0, actions_1.registerAction2)(editorActions_1.MoveGroupUpAction);
    (0, actions_1.registerAction2)(editorActions_1.MoveGroupDownAction);
    (0, actions_1.registerAction2)(editorActions_1.DuplicateGroupLeftAction);
    (0, actions_1.registerAction2)(editorActions_1.DuplicateGroupRightAction);
    (0, actions_1.registerAction2)(editorActions_1.DuplicateGroupUpAction);
    (0, actions_1.registerAction2)(editorActions_1.DuplicateGroupDownAction);
    (0, actions_1.registerAction2)(editorActions_1.MoveEditorToPreviousGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.MoveEditorToNextGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.MoveEditorToFirstGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.MoveEditorToLastGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.MoveEditorToLeftGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.MoveEditorToRightGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.MoveEditorToAboveGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.MoveEditorToBelowGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.SplitEditorToPreviousGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.SplitEditorToNextGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.SplitEditorToFirstGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.SplitEditorToLastGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.SplitEditorToLeftGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.SplitEditorToRightGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.SplitEditorToAboveGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.SplitEditorToBelowGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.FocusActiveGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.FocusFirstGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.FocusLastGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.FocusPreviousGroup);
    (0, actions_1.registerAction2)(editorActions_1.FocusNextGroup);
    (0, actions_1.registerAction2)(editorActions_1.FocusLeftGroup);
    (0, actions_1.registerAction2)(editorActions_1.FocusRightGroup);
    (0, actions_1.registerAction2)(editorActions_1.FocusAboveGroup);
    (0, actions_1.registerAction2)(editorActions_1.FocusBelowGroup);
    (0, actions_1.registerAction2)(editorActions_1.NewEditorGroupLeftAction);
    (0, actions_1.registerAction2)(editorActions_1.NewEditorGroupRightAction);
    (0, actions_1.registerAction2)(editorActions_1.NewEditorGroupAboveAction);
    (0, actions_1.registerAction2)(editorActions_1.NewEditorGroupBelowAction);
    (0, actions_1.registerAction2)(editorActions_1.NavigatePreviousAction);
    (0, actions_1.registerAction2)(editorActions_1.NavigateForwardInEditsAction);
    (0, actions_1.registerAction2)(editorActions_1.NavigateBackwardsInEditsAction);
    (0, actions_1.registerAction2)(editorActions_1.NavigatePreviousInEditsAction);
    (0, actions_1.registerAction2)(editorActions_1.NavigateToLastEditLocationAction);
    (0, actions_1.registerAction2)(editorActions_1.NavigateForwardInNavigationsAction);
    (0, actions_1.registerAction2)(editorActions_1.NavigateBackwardsInNavigationsAction);
    (0, actions_1.registerAction2)(editorActions_1.NavigatePreviousInNavigationsAction);
    (0, actions_1.registerAction2)(editorActions_1.NavigateToLastNavigationLocationAction);
    (0, actions_1.registerAction2)(editorActions_1.ClearEditorHistoryAction);
    (0, actions_1.registerAction2)(editorActions_1.EditorLayoutSingleAction);
    (0, actions_1.registerAction2)(editorActions_1.EditorLayoutTwoColumnsAction);
    (0, actions_1.registerAction2)(editorActions_1.EditorLayoutThreeColumnsAction);
    (0, actions_1.registerAction2)(editorActions_1.EditorLayoutTwoRowsAction);
    (0, actions_1.registerAction2)(editorActions_1.EditorLayoutThreeRowsAction);
    (0, actions_1.registerAction2)(editorActions_1.EditorLayoutTwoByTwoGridAction);
    (0, actions_1.registerAction2)(editorActions_1.EditorLayoutTwoRowsRightAction);
    (0, actions_1.registerAction2)(editorActions_1.EditorLayoutTwoColumnsBottomAction);
    (0, actions_1.registerAction2)(editorActions_1.ToggleEditorTypeAction);
    (0, actions_1.registerAction2)(editorActions_1.ReOpenInTextEditorAction);
    (0, actions_1.registerAction2)(editorActions_1.QuickAccessPreviousRecentlyUsedEditorAction);
    (0, actions_1.registerAction2)(editorActions_1.QuickAccessLeastRecentlyUsedEditorAction);
    (0, actions_1.registerAction2)(editorActions_1.QuickAccessPreviousRecentlyUsedEditorInGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.QuickAccessLeastRecentlyUsedEditorInGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.QuickAccessPreviousEditorFromHistoryAction);
    const quickAccessNavigateNextInEditorPickerId = 'workbench.action.quickOpenNavigateNextInEditorPicker';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: quickAccessNavigateNextInEditorPickerId,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
        handler: (0, quickaccess_1.getQuickNavigateHandler)(quickAccessNavigateNextInEditorPickerId, true),
        when: editorPickerContext,
        primary: 2048 /* KeyMod.CtrlCmd */ | 2 /* KeyCode.Tab */,
        mac: { primary: 256 /* KeyMod.WinCtrl */ | 2 /* KeyCode.Tab */ }
    });
    const quickAccessNavigatePreviousInEditorPickerId = 'workbench.action.quickOpenNavigatePreviousInEditorPicker';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: quickAccessNavigatePreviousInEditorPickerId,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
        handler: (0, quickaccess_1.getQuickNavigateHandler)(quickAccessNavigatePreviousInEditorPickerId, false),
        when: editorPickerContext,
        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */,
        mac: { primary: 256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */ }
    });
    (0, editorCommands_1.setup)();
    //#endregion Workbench Actions
    //#region Menus
    // macOS: Touchbar
    if (platform_2.isMacintosh) {
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.TouchBarContext, {
            command: { id: editorActions_1.NavigateBackwardsAction.ID, title: editorActions_1.NavigateBackwardsAction.LABEL, icon: { dark: network_1.FileAccess.asFileUri('vs/workbench/browser/parts/editor/media/back-tb.png') } },
            group: 'navigation',
            order: 0
        });
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.TouchBarContext, {
            command: { id: editorActions_1.NavigateForwardAction.ID, title: editorActions_1.NavigateForwardAction.LABEL, icon: { dark: network_1.FileAccess.asFileUri('vs/workbench/browser/parts/editor/media/forward-tb.png') } },
            group: 'navigation',
            order: 1
        });
    }
    // Empty Editor Group Toolbar
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EmptyEditorGroup, { command: { id: editorCommands_1.UNLOCK_GROUP_COMMAND_ID, title: (0, nls_1.localize)('unlockGroupAction', "Unlock Group"), icon: codicons_1.Codicon.lock }, group: 'navigation', order: 10, when: contextkeys_1.ActiveEditorGroupLockedContext });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EmptyEditorGroup, { command: { id: editorCommands_1.CLOSE_EDITOR_GROUP_COMMAND_ID, title: (0, nls_1.localize)('closeGroupAction', "Close Group"), icon: codicons_1.Codicon.close }, group: 'navigation', order: 20 });
    // Empty Editor Group Context Menu
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EmptyEditorGroupContext, { command: { id: editorCommands_1.SPLIT_EDITOR_UP, title: (0, nls_1.localize)('splitUp', "Split Up") }, group: '2_split', order: 10 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EmptyEditorGroupContext, { command: { id: editorCommands_1.SPLIT_EDITOR_DOWN, title: (0, nls_1.localize)('splitDown', "Split Down") }, group: '2_split', order: 20 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EmptyEditorGroupContext, { command: { id: editorCommands_1.SPLIT_EDITOR_LEFT, title: (0, nls_1.localize)('splitLeft', "Split Left") }, group: '2_split', order: 30 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EmptyEditorGroupContext, { command: { id: editorCommands_1.SPLIT_EDITOR_RIGHT, title: (0, nls_1.localize)('splitRight', "Split Right") }, group: '2_split', order: 40 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EmptyEditorGroupContext, { command: { id: editorCommands_1.TOGGLE_LOCK_GROUP_COMMAND_ID, title: (0, nls_1.localize)('toggleLockGroup', "Lock Group"), toggled: contextkeys_1.ActiveEditorGroupLockedContext }, group: '3_lock', order: 10, when: contextkeys_1.MultipleEditorGroupsContext });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EmptyEditorGroupContext, { command: { id: editorCommands_1.CLOSE_EDITOR_GROUP_COMMAND_ID, title: (0, nls_1.localize)('close', "Close") }, group: '4_close', order: 10, when: contextkeys_1.MultipleEditorGroupsContext });
    // Editor Tab Container Context Menu
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTabsBarContext, { command: { id: editorCommands_1.SPLIT_EDITOR_UP, title: (0, nls_1.localize)('splitUp', "Split Up") }, group: '2_split', order: 10 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTabsBarContext, { command: { id: editorCommands_1.SPLIT_EDITOR_DOWN, title: (0, nls_1.localize)('splitDown', "Split Down") }, group: '2_split', order: 20 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTabsBarContext, { command: { id: editorCommands_1.SPLIT_EDITOR_LEFT, title: (0, nls_1.localize)('splitLeft', "Split Left") }, group: '2_split', order: 30 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTabsBarContext, { command: { id: editorCommands_1.SPLIT_EDITOR_RIGHT, title: (0, nls_1.localize)('splitRight', "Split Right") }, group: '2_split', order: 40 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTabsBarContext, { command: { id: layoutActions_1.ToggleTabsVisibilityAction.ID, title: (0, nls_1.localize)('toggleTabs', "Enable Tabs"), toggled: contextkey_1.ContextKeyExpr.has('config.workbench.editor.showTabs') }, group: '3_config', order: 10 });
    // Editor Title Context Menu
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.CLOSE_EDITOR_COMMAND_ID, title: (0, nls_1.localize)('close', "Close") }, group: '1_close', order: 10 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID, title: (0, nls_1.localize)('closeOthers', "Close Others"), precondition: contextkeys_1.EditorGroupEditorsCountContext.notEqualsTo('1') }, group: '1_close', order: 20 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.CLOSE_EDITORS_TO_THE_RIGHT_COMMAND_ID, title: (0, nls_1.localize)('closeRight', "Close to the Right"), precondition: contextkeys_1.ActiveEditorLastInGroupContext.toNegated() }, group: '1_close', order: 30, when: contextkeys_1.EditorTabsVisibleContext });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.CLOSE_SAVED_EDITORS_COMMAND_ID, title: (0, nls_1.localize)('closeAllSaved', "Close Saved") }, group: '1_close', order: 40 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.CLOSE_EDITORS_IN_GROUP_COMMAND_ID, title: (0, nls_1.localize)('closeAll', "Close All") }, group: '1_close', order: 50 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.REOPEN_WITH_COMMAND_ID, title: (0, nls_1.localize)('reopenWith', "Reopen Editor With...") }, group: '1_open', order: 10, when: contextkeys_1.ActiveEditorAvailableEditorIdsContext });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.KEEP_EDITOR_COMMAND_ID, title: (0, nls_1.localize)('keepOpen', "Keep Open"), precondition: contextkeys_1.ActiveEditorPinnedContext.toNegated() }, group: '3_preview', order: 10, when: contextkey_1.ContextKeyExpr.has('config.workbench.editor.enablePreview') });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.PIN_EDITOR_COMMAND_ID, title: (0, nls_1.localize)('pin', "Pin") }, group: '3_preview', order: 20, when: contextkeys_1.ActiveEditorStickyContext.toNegated() });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.UNPIN_EDITOR_COMMAND_ID, title: (0, nls_1.localize)('unpin', "Unpin") }, group: '3_preview', order: 20, when: contextkeys_1.ActiveEditorStickyContext });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.SPLIT_EDITOR_UP, title: (0, nls_1.localize)('splitUp', "Split Up") }, group: '5_split', order: 10 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.SPLIT_EDITOR_DOWN, title: (0, nls_1.localize)('splitDown', "Split Down") }, group: '5_split', order: 20 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.SPLIT_EDITOR_LEFT, title: (0, nls_1.localize)('splitLeft', "Split Left") }, group: '5_split', order: 30 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.SPLIT_EDITOR_RIGHT, title: (0, nls_1.localize)('splitRight', "Split Right") }, group: '5_split', order: 40 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.SPLIT_EDITOR_IN_GROUP, title: (0, nls_1.localize)('splitInGroup', "Split in Group") }, group: '6_split_in_group', order: 10, when: contextkeys_1.ActiveEditorCanSplitInGroupContext });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.JOIN_EDITOR_IN_GROUP, title: (0, nls_1.localize)('joinInGroup', "Join in Group") }, group: '6_split_in_group', order: 10, when: contextkeys_1.SideBySideEditorActiveContext });
    // Editor Title Menu
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, { command: { id: editorCommands_1.TOGGLE_DIFF_SIDE_BY_SIDE, title: (0, nls_1.localize)('inlineView', "Inline View"), toggled: contextkey_1.ContextKeyExpr.equals('config.diffEditor.renderSideBySide', false) }, group: '1_diff', order: 10, when: contextkey_1.ContextKeyExpr.has('isInDiffEditor') });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, { command: { id: editorCommands_1.SHOW_EDITORS_IN_GROUP, title: (0, nls_1.localize)('showOpenedEditors', "Show Opened Editors") }, group: '3_open', order: 10 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, { command: { id: editorCommands_1.CLOSE_EDITORS_IN_GROUP_COMMAND_ID, title: (0, nls_1.localize)('closeAll', "Close All") }, group: '5_close', order: 10 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, { command: { id: editorCommands_1.CLOSE_SAVED_EDITORS_COMMAND_ID, title: (0, nls_1.localize)('closeAllSaved', "Close Saved") }, group: '5_close', order: 20 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, { command: { id: layoutActions_1.ToggleTabsVisibilityAction.ID, title: (0, nls_1.localize)('toggleTabs', "Enable Tabs"), toggled: contextkey_1.ContextKeyExpr.has('config.workbench.editor.showTabs') }, group: '7_settings', order: 5, when: contextkey_1.ContextKeyExpr.has('config.workbench.editor.showTabs').negate() /* only shown here when tabs are disabled */ });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, { command: { id: editorCommands_1.TOGGLE_KEEP_EDITORS_COMMAND_ID, title: (0, nls_1.localize)('togglePreviewMode', "Enable Preview Editors"), toggled: contextkey_1.ContextKeyExpr.has('config.workbench.editor.enablePreview') }, group: '7_settings', order: 10 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, { command: { id: editorCommands_1.TOGGLE_LOCK_GROUP_COMMAND_ID, title: (0, nls_1.localize)('lockGroup', "Lock Group"), toggled: contextkeys_1.ActiveEditorGroupLockedContext }, group: '8_lock', order: 10, when: contextkeys_1.MultipleEditorGroupsContext });
    function appendEditorToolItem(primary, when, order, alternative, precondition) {
        const item = {
            command: {
                id: primary.id,
                title: primary.title,
                icon: primary.icon,
                precondition
            },
            group: 'navigation',
            when,
            order
        };
        if (alternative) {
            item.alt = {
                id: alternative.id,
                title: alternative.title,
                icon: alternative.icon
            };
        }
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, item);
    }
    const SPLIT_ORDER = 100000; // towards the end
    const CLOSE_ORDER = 1000000; // towards the far end
    // Editor Title Menu: Split Editor
    appendEditorToolItem({
        id: editorActions_1.SplitEditorAction.ID,
        title: (0, nls_1.localize)('splitEditorRight', "Split Editor Right"),
        icon: codicons_1.Codicon.splitHorizontal
    }, contextkey_1.ContextKeyExpr.not('splitEditorsVertically'), SPLIT_ORDER, {
        id: editorCommands_1.SPLIT_EDITOR_DOWN,
        title: (0, nls_1.localize)('splitEditorDown', "Split Editor Down"),
        icon: codicons_1.Codicon.splitVertical
    });
    appendEditorToolItem({
        id: editorActions_1.SplitEditorAction.ID,
        title: (0, nls_1.localize)('splitEditorDown', "Split Editor Down"),
        icon: codicons_1.Codicon.splitVertical
    }, contextkey_1.ContextKeyExpr.has('splitEditorsVertically'), SPLIT_ORDER, {
        id: editorCommands_1.SPLIT_EDITOR_RIGHT,
        title: (0, nls_1.localize)('splitEditorRight', "Split Editor Right"),
        icon: codicons_1.Codicon.splitHorizontal
    });
    // Side by side: layout
    appendEditorToolItem({
        id: editorCommands_1.TOGGLE_SPLIT_EDITOR_IN_GROUP_LAYOUT,
        title: (0, nls_1.localize)('toggleSplitEditorInGroupLayout', "Toggle Layout"),
        icon: codicons_1.Codicon.editorLayout
    }, contextkeys_1.SideBySideEditorActiveContext, SPLIT_ORDER - 1);
    // Editor Title Menu: Close (tabs disabled, normal editor)
    appendEditorToolItem({
        id: editorCommands_1.CLOSE_EDITOR_COMMAND_ID,
        title: (0, nls_1.localize)('close', "Close"),
        icon: codicons_1.Codicon.close
    }, contextkey_1.ContextKeyExpr.and(contextkeys_1.EditorTabsVisibleContext.toNegated(), contextkeys_1.ActiveEditorDirtyContext.toNegated(), contextkeys_1.ActiveEditorStickyContext.toNegated()), CLOSE_ORDER, {
        id: editorCommands_1.CLOSE_EDITORS_IN_GROUP_COMMAND_ID,
        title: (0, nls_1.localize)('closeAll', "Close All"),
        icon: codicons_1.Codicon.closeAll
    });
    // Editor Title Menu: Close (tabs disabled, dirty editor)
    appendEditorToolItem({
        id: editorCommands_1.CLOSE_EDITOR_COMMAND_ID,
        title: (0, nls_1.localize)('close', "Close"),
        icon: codicons_1.Codicon.closeDirty
    }, contextkey_1.ContextKeyExpr.and(contextkeys_1.EditorTabsVisibleContext.toNegated(), contextkeys_1.ActiveEditorDirtyContext, contextkeys_1.ActiveEditorStickyContext.toNegated()), CLOSE_ORDER, {
        id: editorCommands_1.CLOSE_EDITORS_IN_GROUP_COMMAND_ID,
        title: (0, nls_1.localize)('closeAll', "Close All"),
        icon: codicons_1.Codicon.closeAll
    });
    // Editor Title Menu: Close (tabs disabled, sticky editor)
    appendEditorToolItem({
        id: editorCommands_1.UNPIN_EDITOR_COMMAND_ID,
        title: (0, nls_1.localize)('unpin', "Unpin"),
        icon: codicons_1.Codicon.pinned
    }, contextkey_1.ContextKeyExpr.and(contextkeys_1.EditorTabsVisibleContext.toNegated(), contextkeys_1.ActiveEditorDirtyContext.toNegated(), contextkeys_1.ActiveEditorStickyContext), CLOSE_ORDER, {
        id: editorCommands_1.CLOSE_EDITOR_COMMAND_ID,
        title: (0, nls_1.localize)('close', "Close"),
        icon: codicons_1.Codicon.close
    });
    // Editor Title Menu: Close (tabs disabled, dirty & sticky editor)
    appendEditorToolItem({
        id: editorCommands_1.UNPIN_EDITOR_COMMAND_ID,
        title: (0, nls_1.localize)('unpin', "Unpin"),
        icon: codicons_1.Codicon.pinnedDirty
    }, contextkey_1.ContextKeyExpr.and(contextkeys_1.EditorTabsVisibleContext.toNegated(), contextkeys_1.ActiveEditorDirtyContext, contextkeys_1.ActiveEditorStickyContext), CLOSE_ORDER, {
        id: editorCommands_1.CLOSE_EDITOR_COMMAND_ID,
        title: (0, nls_1.localize)('close', "Close"),
        icon: codicons_1.Codicon.close
    });
    // Unlock Group: only when group is locked
    appendEditorToolItem({
        id: editorCommands_1.UNLOCK_GROUP_COMMAND_ID,
        title: (0, nls_1.localize)('unlockEditorGroup', "Unlock Group"),
        icon: codicons_1.Codicon.lock
    }, contextkeys_1.ActiveEditorGroupLockedContext, CLOSE_ORDER - 1);
    const previousChangeIcon = (0, iconRegistry_1.registerIcon)('diff-editor-previous-change', codicons_1.Codicon.arrowUp, (0, nls_1.localize)('previousChangeIcon', 'Icon for the previous change action in the diff editor.'));
    const nextChangeIcon = (0, iconRegistry_1.registerIcon)('diff-editor-next-change', codicons_1.Codicon.arrowDown, (0, nls_1.localize)('nextChangeIcon', 'Icon for the next change action in the diff editor.'));
    const toggleWhitespace = (0, iconRegistry_1.registerIcon)('diff-editor-toggle-whitespace', codicons_1.Codicon.whitespace, (0, nls_1.localize)('toggleWhitespace', 'Icon for the toggle whitespace action in the diff editor.'));
    // Diff Editor Title Menu: Previous Change
    appendEditorToolItem({
        id: editorCommands_1.GOTO_PREVIOUS_CHANGE,
        title: (0, nls_1.localize)('navigate.prev.label', "Previous Change"),
        icon: previousChangeIcon
    }, contextkeys_1.TextCompareEditorActiveContext, 10);
    // Diff Editor Title Menu: Next Change
    appendEditorToolItem({
        id: editorCommands_1.GOTO_NEXT_CHANGE,
        title: (0, nls_1.localize)('navigate.next.label', "Next Change"),
        icon: nextChangeIcon
    }, contextkeys_1.TextCompareEditorActiveContext, 11);
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, {
        command: {
            id: editorCommands_1.TOGGLE_DIFF_IGNORE_TRIM_WHITESPACE,
            title: (0, nls_1.localize)('ignoreTrimWhitespace.label', "Show Leading/Trailing Whitespace Differences"),
            icon: toggleWhitespace,
            precondition: contextkeys_1.TextCompareEditorActiveContext,
            toggled: contextkey_1.ContextKeyExpr.equals('config.diffEditor.ignoreTrimWhitespace', false),
        },
        group: 'navigation',
        when: contextkeys_1.TextCompareEditorActiveContext,
        order: 20,
    });
    // Editor Commands for Command Palette
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: editorCommands_1.KEEP_EDITOR_COMMAND_ID, title: { value: (0, nls_1.localize)('keepEditor', "Keep Editor"), original: 'Keep Editor' }, category: actionCommonCategories_1.Categories.View }, when: contextkey_1.ContextKeyExpr.has('config.workbench.editor.enablePreview') });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: editorCommands_1.PIN_EDITOR_COMMAND_ID, title: { value: (0, nls_1.localize)('pinEditor', "Pin Editor"), original: 'Pin Editor' }, category: actionCommonCategories_1.Categories.View } });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: editorCommands_1.UNPIN_EDITOR_COMMAND_ID, title: { value: (0, nls_1.localize)('unpinEditor', "Unpin Editor"), original: 'Unpin Editor' }, category: actionCommonCategories_1.Categories.View } });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: editorCommands_1.CLOSE_EDITOR_COMMAND_ID, title: { value: (0, nls_1.localize)('closeEditor', "Close Editor"), original: 'Close Editor' }, category: actionCommonCategories_1.Categories.View } });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: editorCommands_1.CLOSE_PINNED_EDITOR_COMMAND_ID, title: { value: (0, nls_1.localize)('closePinnedEditor', "Close Pinned Editor"), original: 'Close Pinned Editor' }, category: actionCommonCategories_1.Categories.View } });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: editorCommands_1.CLOSE_EDITORS_IN_GROUP_COMMAND_ID, title: { value: (0, nls_1.localize)('closeEditorsInGroup', "Close All Editors in Group"), original: 'Close All Editors in Group' }, category: actionCommonCategories_1.Categories.View } });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: editorCommands_1.CLOSE_SAVED_EDITORS_COMMAND_ID, title: { value: (0, nls_1.localize)('closeSavedEditors', "Close Saved Editors in Group"), original: 'Close Saved Editors in Group' }, category: actionCommonCategories_1.Categories.View } });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: editorCommands_1.CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID, title: { value: (0, nls_1.localize)('closeOtherEditors', "Close Other Editors in Group"), original: 'Close Other Editors in Group' }, category: actionCommonCategories_1.Categories.View } });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: editorCommands_1.CLOSE_EDITORS_TO_THE_RIGHT_COMMAND_ID, title: { value: (0, nls_1.localize)('closeRightEditors', "Close Editors to the Right in Group"), original: 'Close Editors to the Right in Group' }, category: actionCommonCategories_1.Categories.View }, when: contextkeys_1.ActiveEditorLastInGroupContext.toNegated() });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: editorCommands_1.CLOSE_EDITORS_AND_GROUP_COMMAND_ID, title: { value: (0, nls_1.localize)('closeEditorGroup', "Close Editor Group"), original: 'Close Editor Group' }, category: actionCommonCategories_1.Categories.View }, when: contextkeys_1.MultipleEditorGroupsContext });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: editorCommands_1.REOPEN_WITH_COMMAND_ID, title: { value: (0, nls_1.localize)('reopenWith', "Reopen Editor With..."), original: 'Reopen Editor With...' }, category: actionCommonCategories_1.Categories.View }, when: contextkeys_1.ActiveEditorAvailableEditorIdsContext });
    // File menu
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarRecentMenu, {
        group: '1_editor',
        command: {
            id: editorActions_1.ReopenClosedEditorAction.ID,
            title: (0, nls_1.localize)({ key: 'miReopenClosedEditor', comment: ['&& denotes a mnemonic'] }, "&&Reopen Closed Editor"),
            precondition: contextkey_1.ContextKeyExpr.has('canReopenClosedEditor')
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarRecentMenu, {
        group: 'z_clear',
        command: {
            id: editorActions_1.ClearRecentFilesAction.ID,
            title: (0, nls_1.localize)({ key: 'miClearRecentOpen', comment: ['&& denotes a mnemonic'] }, "&&Clear Recently Opened")
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        title: (0, nls_1.localize)('miShare', "Share"),
        submenu: actions_1.MenuId.MenubarShare,
        group: '45_share',
        order: 1,
    });
    // Layout menu
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarViewMenu, {
        group: '2_appearance',
        title: (0, nls_1.localize)({ key: 'miEditorLayout', comment: ['&& denotes a mnemonic'] }, "Editor &&Layout"),
        submenu: actions_1.MenuId.MenubarLayoutMenu,
        order: 2
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarLayoutMenu, {
        group: '1_split',
        command: {
            id: editorCommands_1.SPLIT_EDITOR_UP,
            title: {
                original: 'Split Up',
                value: (0, nls_1.localize)('miSplitEditorUpWithoutMnemonic', "Split Up"),
                mnemonicTitle: (0, nls_1.localize)({ key: 'miSplitEditorUp', comment: ['&& denotes a mnemonic'] }, "Split &&Up"),
            }
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarLayoutMenu, {
        group: '1_split',
        command: {
            id: editorCommands_1.SPLIT_EDITOR_DOWN,
            title: {
                original: 'Split Down',
                value: (0, nls_1.localize)('miSplitEditorDownWithoutMnemonic', "Split Down"),
                mnemonicTitle: (0, nls_1.localize)({ key: 'miSplitEditorDown', comment: ['&& denotes a mnemonic'] }, "Split &&Down")
            }
        },
        order: 2
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarLayoutMenu, {
        group: '1_split',
        command: {
            id: editorCommands_1.SPLIT_EDITOR_LEFT,
            title: {
                original: 'Split Left',
                value: (0, nls_1.localize)('miSplitEditorLeftWithoutMnemonic', "Split Left"),
                mnemonicTitle: (0, nls_1.localize)({ key: 'miSplitEditorLeft', comment: ['&& denotes a mnemonic'] }, "Split &&Left")
            }
        },
        order: 3
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarLayoutMenu, {
        group: '1_split',
        command: {
            id: editorCommands_1.SPLIT_EDITOR_RIGHT,
            title: {
                original: 'Split Right',
                value: (0, nls_1.localize)('miSplitEditorRightWithoutMnemonic', "Split Right"),
                mnemonicTitle: (0, nls_1.localize)({ key: 'miSplitEditorRight', comment: ['&& denotes a mnemonic'] }, "Split &&Right")
            }
        },
        order: 4
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarLayoutMenu, {
        group: '2_split_in_group',
        command: {
            id: editorCommands_1.SPLIT_EDITOR_IN_GROUP,
            title: {
                original: 'Split in Group',
                value: (0, nls_1.localize)('miSplitEditorInGroupWithoutMnemonic', "Split in Group"),
                mnemonicTitle: (0, nls_1.localize)({ key: 'miSplitEditorInGroup', comment: ['&& denotes a mnemonic'] }, "Split in &&Group")
            }
        },
        when: contextkeys_1.ActiveEditorCanSplitInGroupContext,
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarLayoutMenu, {
        group: '2_split_in_group',
        command: {
            id: editorCommands_1.JOIN_EDITOR_IN_GROUP,
            title: {
                original: 'Join in Group',
                value: (0, nls_1.localize)('miJoinEditorInGroupWithoutMnemonic', "Join in Group"),
                mnemonicTitle: (0, nls_1.localize)({ key: 'miJoinEditorInGroup', comment: ['&& denotes a mnemonic'] }, "Join in &&Group")
            }
        },
        when: contextkeys_1.SideBySideEditorActiveContext,
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarLayoutMenu, {
        group: '3_layouts',
        command: {
            id: editorActions_1.EditorLayoutSingleAction.ID,
            title: {
                original: 'Single',
                value: (0, nls_1.localize)('miSingleColumnEditorLayoutWithoutMnemonic', "Single"),
                mnemonicTitle: (0, nls_1.localize)({ key: 'miSingleColumnEditorLayout', comment: ['&& denotes a mnemonic'] }, "&&Single")
            }
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarLayoutMenu, {
        group: '3_layouts',
        command: {
            id: editorActions_1.EditorLayoutTwoColumnsAction.ID,
            title: {
                original: 'Two Columns',
                value: (0, nls_1.localize)('miTwoColumnsEditorLayoutWithoutMnemonic', "Two Columns"),
                mnemonicTitle: (0, nls_1.localize)({ key: 'miTwoColumnsEditorLayout', comment: ['&& denotes a mnemonic'] }, "&&Two Columns")
            }
        },
        order: 3
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarLayoutMenu, {
        group: '3_layouts',
        command: {
            id: editorActions_1.EditorLayoutThreeColumnsAction.ID,
            title: {
                original: 'Three Columns',
                value: (0, nls_1.localize)('miThreeColumnsEditorLayoutWithoutMnemonic', "Three Columns"),
                mnemonicTitle: (0, nls_1.localize)({ key: 'miThreeColumnsEditorLayout', comment: ['&& denotes a mnemonic'] }, "T&&hree Columns")
            }
        },
        order: 4
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarLayoutMenu, {
        group: '3_layouts',
        command: {
            id: editorActions_1.EditorLayoutTwoRowsAction.ID,
            title: {
                original: 'Two Rows',
                value: (0, nls_1.localize)('miTwoRowsEditorLayoutWithoutMnemonic', "Two Rows"),
                mnemonicTitle: (0, nls_1.localize)({ key: 'miTwoRowsEditorLayout', comment: ['&& denotes a mnemonic'] }, "T&&wo Rows")
            }
        },
        order: 5
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarLayoutMenu, {
        group: '3_layouts',
        command: {
            id: editorActions_1.EditorLayoutThreeRowsAction.ID,
            title: {
                original: 'Three Rows',
                value: (0, nls_1.localize)('miThreeRowsEditorLayoutWithoutMnemonic', "Three Rows"),
                mnemonicTitle: (0, nls_1.localize)({ key: 'miThreeRowsEditorLayout', comment: ['&& denotes a mnemonic'] }, "Three &&Rows")
            }
        },
        order: 6
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarLayoutMenu, {
        group: '3_layouts',
        command: {
            id: editorActions_1.EditorLayoutTwoByTwoGridAction.ID,
            title: {
                original: 'Grid (2x2)',
                value: (0, nls_1.localize)('miTwoByTwoGridEditorLayoutWithoutMnemonic', "Grid (2x2)"),
                mnemonicTitle: (0, nls_1.localize)({ key: 'miTwoByTwoGridEditorLayout', comment: ['&& denotes a mnemonic'] }, "&&Grid (2x2)")
            }
        },
        order: 7
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarLayoutMenu, {
        group: '3_layouts',
        command: {
            id: editorActions_1.EditorLayoutTwoRowsRightAction.ID,
            title: {
                original: 'Two Rows Right',
                value: (0, nls_1.localize)('miTwoRowsRightEditorLayoutWithoutMnemonic', "Two Rows Right"),
                mnemonicTitle: (0, nls_1.localize)({ key: 'miTwoRowsRightEditorLayout', comment: ['&& denotes a mnemonic'] }, "Two R&&ows Right")
            }
        },
        order: 8
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarLayoutMenu, {
        group: '3_layouts',
        command: {
            id: editorActions_1.EditorLayoutTwoColumnsBottomAction.ID,
            title: {
                original: 'Two Columns Bottom',
                value: (0, nls_1.localize)('miTwoColumnsBottomEditorLayoutWithoutMnemonic', "Two Columns Bottom"),
                mnemonicTitle: (0, nls_1.localize)({ key: 'miTwoColumnsBottomEditorLayout', comment: ['&& denotes a mnemonic'] }, "Two &&Columns Bottom")
            }
        },
        order: 9
    });
    // Main Menu Bar Contributions:
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarGoMenu, {
        group: '1_history_nav',
        command: {
            id: 'workbench.action.navigateToLastEditLocation',
            title: (0, nls_1.localize)({ key: 'miLastEditLocation', comment: ['&& denotes a mnemonic'] }, "&&Last Edit Location"),
            precondition: contextkey_1.ContextKeyExpr.has('canNavigateToLastEditLocation')
        },
        order: 3
    });
    // Switch Editor
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchEditorMenu, {
        group: '1_sideBySide',
        command: {
            id: editorCommands_1.FOCUS_FIRST_SIDE_EDITOR,
            title: (0, nls_1.localize)({ key: 'miFirstSideEditor', comment: ['&& denotes a mnemonic'] }, "&&First Side in Editor")
        },
        when: contextkey_1.ContextKeyExpr.or(contextkeys_1.SideBySideEditorActiveContext, contextkeys_1.TextCompareEditorActiveContext),
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchEditorMenu, {
        group: '1_sideBySide',
        command: {
            id: editorCommands_1.FOCUS_SECOND_SIDE_EDITOR,
            title: (0, nls_1.localize)({ key: 'miSecondSideEditor', comment: ['&& denotes a mnemonic'] }, "&&Second Side in Editor")
        },
        when: contextkey_1.ContextKeyExpr.or(contextkeys_1.SideBySideEditorActiveContext, contextkeys_1.TextCompareEditorActiveContext),
        order: 2
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchEditorMenu, {
        group: '2_any',
        command: {
            id: 'workbench.action.nextEditor',
            title: (0, nls_1.localize)({ key: 'miNextEditor', comment: ['&& denotes a mnemonic'] }, "&&Next Editor")
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchEditorMenu, {
        group: '2_any',
        command: {
            id: 'workbench.action.previousEditor',
            title: (0, nls_1.localize)({ key: 'miPreviousEditor', comment: ['&& denotes a mnemonic'] }, "&&Previous Editor")
        },
        order: 2
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchEditorMenu, {
        group: '3_any_used',
        command: {
            id: 'workbench.action.openNextRecentlyUsedEditor',
            title: (0, nls_1.localize)({ key: 'miNextRecentlyUsedEditor', comment: ['&& denotes a mnemonic'] }, "&&Next Used Editor")
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchEditorMenu, {
        group: '3_any_used',
        command: {
            id: 'workbench.action.openPreviousRecentlyUsedEditor',
            title: (0, nls_1.localize)({ key: 'miPreviousRecentlyUsedEditor', comment: ['&& denotes a mnemonic'] }, "&&Previous Used Editor")
        },
        order: 2
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchEditorMenu, {
        group: '4_group',
        command: {
            id: 'workbench.action.nextEditorInGroup',
            title: (0, nls_1.localize)({ key: 'miNextEditorInGroup', comment: ['&& denotes a mnemonic'] }, "&&Next Editor in Group")
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchEditorMenu, {
        group: '4_group',
        command: {
            id: 'workbench.action.previousEditorInGroup',
            title: (0, nls_1.localize)({ key: 'miPreviousEditorInGroup', comment: ['&& denotes a mnemonic'] }, "&&Previous Editor in Group")
        },
        order: 2
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchEditorMenu, {
        group: '5_group_used',
        command: {
            id: 'workbench.action.openNextRecentlyUsedEditorInGroup',
            title: (0, nls_1.localize)({ key: 'miNextUsedEditorInGroup', comment: ['&& denotes a mnemonic'] }, "&&Next Used Editor in Group")
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchEditorMenu, {
        group: '5_group_used',
        command: {
            id: 'workbench.action.openPreviousRecentlyUsedEditorInGroup',
            title: (0, nls_1.localize)({ key: 'miPreviousUsedEditorInGroup', comment: ['&& denotes a mnemonic'] }, "&&Previous Used Editor in Group")
        },
        order: 2
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarGoMenu, {
        group: '2_editor_nav',
        title: (0, nls_1.localize)({ key: 'miSwitchEditor', comment: ['&& denotes a mnemonic'] }, "Switch &&Editor"),
        submenu: actions_1.MenuId.MenubarSwitchEditorMenu,
        order: 1
    });
    // Switch Group
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchGroupMenu, {
        group: '1_focus_index',
        command: {
            id: 'workbench.action.focusFirstEditorGroup',
            title: (0, nls_1.localize)({ key: 'miFocusFirstGroup', comment: ['&& denotes a mnemonic'] }, "Group &&1")
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchGroupMenu, {
        group: '1_focus_index',
        command: {
            id: 'workbench.action.focusSecondEditorGroup',
            title: (0, nls_1.localize)({ key: 'miFocusSecondGroup', comment: ['&& denotes a mnemonic'] }, "Group &&2")
        },
        order: 2
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchGroupMenu, {
        group: '1_focus_index',
        command: {
            id: 'workbench.action.focusThirdEditorGroup',
            title: (0, nls_1.localize)({ key: 'miFocusThirdGroup', comment: ['&& denotes a mnemonic'] }, "Group &&3"),
            precondition: contextkeys_1.MultipleEditorGroupsContext
        },
        order: 3
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchGroupMenu, {
        group: '1_focus_index',
        command: {
            id: 'workbench.action.focusFourthEditorGroup',
            title: (0, nls_1.localize)({ key: 'miFocusFourthGroup', comment: ['&& denotes a mnemonic'] }, "Group &&4"),
            precondition: contextkeys_1.MultipleEditorGroupsContext
        },
        order: 4
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchGroupMenu, {
        group: '1_focus_index',
        command: {
            id: 'workbench.action.focusFifthEditorGroup',
            title: (0, nls_1.localize)({ key: 'miFocusFifthGroup', comment: ['&& denotes a mnemonic'] }, "Group &&5"),
            precondition: contextkeys_1.MultipleEditorGroupsContext
        },
        order: 5
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchGroupMenu, {
        group: '2_next_prev',
        command: {
            id: 'workbench.action.focusNextGroup',
            title: (0, nls_1.localize)({ key: 'miNextGroup', comment: ['&& denotes a mnemonic'] }, "&&Next Group"),
            precondition: contextkeys_1.MultipleEditorGroupsContext
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchGroupMenu, {
        group: '2_next_prev',
        command: {
            id: 'workbench.action.focusPreviousGroup',
            title: (0, nls_1.localize)({ key: 'miPreviousGroup', comment: ['&& denotes a mnemonic'] }, "&&Previous Group"),
            precondition: contextkeys_1.MultipleEditorGroupsContext
        },
        order: 2
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchGroupMenu, {
        group: '3_directional',
        command: {
            id: 'workbench.action.focusLeftGroup',
            title: (0, nls_1.localize)({ key: 'miFocusLeftGroup', comment: ['&& denotes a mnemonic'] }, "Group &&Left"),
            precondition: contextkeys_1.MultipleEditorGroupsContext
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchGroupMenu, {
        group: '3_directional',
        command: {
            id: 'workbench.action.focusRightGroup',
            title: (0, nls_1.localize)({ key: 'miFocusRightGroup', comment: ['&& denotes a mnemonic'] }, "Group &&Right"),
            precondition: contextkeys_1.MultipleEditorGroupsContext
        },
        order: 2
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchGroupMenu, {
        group: '3_directional',
        command: {
            id: 'workbench.action.focusAboveGroup',
            title: (0, nls_1.localize)({ key: 'miFocusAboveGroup', comment: ['&& denotes a mnemonic'] }, "Group &&Above"),
            precondition: contextkeys_1.MultipleEditorGroupsContext
        },
        order: 3
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchGroupMenu, {
        group: '3_directional',
        command: {
            id: 'workbench.action.focusBelowGroup',
            title: (0, nls_1.localize)({ key: 'miFocusBelowGroup', comment: ['&& denotes a mnemonic'] }, "Group &&Below"),
            precondition: contextkeys_1.MultipleEditorGroupsContext
        },
        order: 4
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarGoMenu, {
        group: '2_editor_nav',
        title: (0, nls_1.localize)({ key: 'miSwitchGroup', comment: ['&& denotes a mnemonic'] }, "Switch &&Group"),
        submenu: actions_1.MenuId.MenubarSwitchGroupMenu,
        order: 2
    });
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL2VkaXRvci9lZGl0b3IuY29udHJpYnV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBbUVoRyw4QkFBOEI7SUFFOUIsbUJBQVEsQ0FBQyxFQUFFLENBQXNCLHlCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDLGtCQUFrQixDQUMvRSw2QkFBb0IsQ0FBQyxNQUFNLENBQzFCLHVDQUFrQixFQUNsQix1Q0FBa0IsQ0FBQyxFQUFFLEVBQ3JCLElBQUEsY0FBUSxFQUFDLFlBQVksRUFBRSxhQUFhLENBQUMsQ0FDckMsRUFDRDtRQUNDLElBQUksNEJBQWMsQ0FBQyxpREFBdUIsQ0FBQztRQUMzQyxJQUFJLDRCQUFjLENBQUMsaURBQXVCLENBQUM7S0FDM0MsQ0FDRCxDQUFDO0lBRUYsbUJBQVEsQ0FBQyxFQUFFLENBQXNCLHlCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDLGtCQUFrQixDQUMvRSw2QkFBb0IsQ0FBQyxNQUFNLENBQzFCLCtCQUFjLEVBQ2QsK0JBQWMsQ0FBQyxFQUFFLEVBQ2pCLElBQUEsY0FBUSxFQUFDLGdCQUFnQixFQUFFLGtCQUFrQixDQUFDLENBQzlDLEVBQ0Q7UUFDQyxJQUFJLDRCQUFjLENBQUMsaUNBQWUsQ0FBQztLQUNuQyxDQUNELENBQUM7SUFFRixtQkFBUSxDQUFDLEVBQUUsQ0FBc0IseUJBQWdCLENBQUMsVUFBVSxDQUFDLENBQUMsa0JBQWtCLENBQy9FLDZCQUFvQixDQUFDLE1BQU0sQ0FDMUIsMkNBQXdCLEVBQ3hCLDJDQUF3QixDQUFDLEVBQUUsRUFDM0IsSUFBQSxjQUFRLEVBQUMsa0JBQWtCLEVBQUUsb0JBQW9CLENBQUMsQ0FDbEQsRUFDRDtRQUNDLElBQUksNEJBQWMsQ0FBQyxpQ0FBZSxDQUFD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