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
define(["require", "exports", "vs/nls", "vs/base/common/actions", "vs/base/common/arrays", "vs/workbench/common/editor", "vs/workbench/common/editor/sideBySideEditorInput", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/services/history/common/history", "vs/platform/keybinding/common/keybinding", "vs/platform/commands/common/commands", "vs/workbench/browser/parts/editor/editorCommands", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/platform/configuration/common/configuration", "vs/platform/workspaces/common/workspaces", "vs/platform/dialogs/common/dialogs", "vs/platform/quickinput/common/quickInput", "vs/workbench/browser/parts/editor/editorQuickAccess", "vs/base/common/codicons", "vs/base/common/themables", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/editor/common/editorResolverService", "vs/base/common/platform", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/base/common/keyCodes", "vs/platform/log/common/log", "vs/platform/action/common/actionCommonCategories", "vs/workbench/common/contextkeys"], function (require, exports, nls_1, actions_1, arrays_1, editor_1, sideBySideEditorInput_1, layoutService_1, history_1, keybinding_1, commands_1, editorCommands_1, editorGroupsService_1, editorService_1, configuration_1, workspaces_1, dialogs_1, quickInput_1, editorQuickAccess_1, codicons_1, themables_1, filesConfigurationService_1, editorResolverService_1, platform_1, actions_2, contextkey_1, keyCodes_1, log_1, actionCommonCategories_1, contextkeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReOpenInTextEditorAction = exports.ToggleEditorTypeAction = exports.NewEditorGroupBelowAction = exports.NewEditorGroupAboveAction = exports.NewEditorGroupRightAction = exports.NewEditorGroupLeftAction = exports.EditorLayoutTwoRowsRightAction = exports.EditorLayoutTwoColumnsBottomAction = exports.EditorLayoutTwoByTwoGridAction = exports.EditorLayoutThreeRowsAction = exports.EditorLayoutTwoRowsAction = exports.EditorLayoutThreeColumnsAction = exports.EditorLayoutTwoColumnsAction = exports.EditorLayoutSingleAction = exports.SplitEditorToLastGroupAction = exports.SplitEditorToFirstGroupAction = exports.SplitEditorToRightGroupAction = exports.SplitEditorToLeftGroupAction = exports.SplitEditorToBelowGroupAction = exports.SplitEditorToAboveGroupAction = exports.SplitEditorToNextGroupAction = exports.SplitEditorToPreviousGroupAction = exports.MoveEditorToLastGroupAction = exports.MoveEditorToFirstGroupAction = exports.MoveEditorToRightGroupAction = exports.MoveEditorToLeftGroupAction = exports.MoveEditorToBelowGroupAction = exports.MoveEditorToAboveGroupAction = exports.MoveEditorToNextGroupAction = exports.MoveEditorToPreviousGroupAction = exports.MoveEditorRightInGroupAction = exports.MoveEditorLeftInGroupAction = exports.ClearEditorHistoryAction = exports.OpenPreviousRecentlyUsedEditorInGroupAction = exports.OpenNextRecentlyUsedEditorInGroupAction = exports.OpenPreviousRecentlyUsedEditorAction = exports.OpenNextRecentlyUsedEditorAction = exports.QuickAccessPreviousEditorFromHistoryAction = exports.QuickAccessLeastRecentlyUsedEditorInGroupAction = exports.QuickAccessPreviousRecentlyUsedEditorInGroupAction = exports.QuickAccessLeastRecentlyUsedEditorAction = exports.QuickAccessPreviousRecentlyUsedEditorAction = exports.ShowAllEditorsByMostRecentlyUsedAction = exports.ShowAllEditorsByAppearanceAction = exports.ShowEditorsInActiveGroupByMostRecentlyUsedAction = exports.ClearRecentFilesAction = exports.ReopenClosedEditorAction = exports.NavigateToLastNavigationLocationAction = exports.NavigatePreviousInNavigationsAction = exports.NavigateBackwardsInNavigationsAction = exports.NavigateForwardInNavigationsAction = exports.NavigateToLastEditLocationAction = exports.NavigatePreviousInEditsAction = exports.NavigateBackwardsInEditsAction = exports.NavigateForwardInEditsAction = exports.NavigatePreviousAction = exports.NavigateBackwardsAction = exports.NavigateForwardAction = exports.OpenLastEditorInGroup = exports.OpenFirstEditorInGroup = exports.OpenPreviousEditorInGroup = exports.OpenNextEditorInGroup = exports.OpenPreviousEditor = exports.OpenNextEditor = exports.MaximizeGroupAction = exports.ToggleGroupSizesAction = exports.ResetGroupSizesAction = exports.MinimizeOtherGroupsAction = exports.DuplicateGroupDownAction = exports.DuplicateGroupUpAction = exports.DuplicateGroupRightAction = exports.DuplicateGroupLeftAction = exports.MoveGroupDownAction = exports.MoveGroupUpAction = exports.MoveGroupRightAction = exports.MoveGroupLeftAction = exports.CloseEditorInAllGroupsAction = exports.CloseEditorsInOtherGroupsAction = exports.CloseAllEditorGroupsAction = exports.CloseAllEditorsAction = exports.CloseLeftEditorsInGroupAction = exports.RevertAndCloseEditorAction = exports.CloseOneEditorAction = exports.UnpinEditorAction = exports.CloseEditorAction = exports.FocusBelowGroup = exports.FocusAboveGroup = exports.FocusRightGroup = exports.FocusLeftGroup = exports.FocusPreviousGroup = exports.FocusNextGroup = exports.FocusLastGroupAction = exports.FocusFirstGroupAction = exports.FocusActiveGroupAction = exports.NavigateBetweenGroupsAction = exports.JoinAllGroupsAction = exports.JoinTwoGroupsAction = exports.SplitEditorDownAction = exports.SplitEditorUpAction = exports.SplitEditorRightAction = exports.SplitEditorLeftAction = exports.SplitEditorOrthogonalAction = exports.SplitEditorAction = void 0;
    class ExecuteCommandAction extends actions_2.Action2 {
        constructor(desc, commandId, commandArgs) {
            super(desc);
            this.commandId = commandId;
            this.commandArgs = commandArgs;
        }
        run(accessor) {
            const commandService = accessor.get(commands_1.ICommandService);
            return commandService.executeCommand(this.commandId, this.commandArgs);
        }
    }
    class AbstractSplitEditorAction extends actions_2.Action2 {
        getDirection(configurationService) {
            return (0, editorGroupsService_1.preferredSideBySideGroupDirection)(configurationService);
        }
        async run(accessor, context) {
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            (0, editorCommands_1.splitEditor)(editorGroupService, this.getDirection(configurationService), context);
        }
    }
    class SplitEditorAction extends AbstractSplitEditorAction {
        static { this.ID = 'workbench.action.splitEditor'; }
        constructor() {
            super({
                id: SplitEditorAction.ID,
                title: { value: (0, nls_1.localize)('splitEditor', "Split Editor"), original: 'Split Editor' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 93 /* KeyCode.Backslash */
                },
                category: actionCommonCategories_1.Categories.View
            });
        }
    }
    exports.SplitEditorAction = SplitEditorAction;
    class SplitEditorOrthogonalAction extends AbstractSplitEditorAction {
        constructor() {
            super({
                id: 'workbench.action.splitEditorOrthogonal',
                title: { value: (0, nls_1.localize)('splitEditorOrthogonal', "Split Editor Orthogonal"), original: 'Split Editor Orthogonal' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 93 /* KeyCode.Backslash */)
                },
                category: actionCommonCategories_1.Categories.View
            });
        }
        getDirection(configurationService) {
            const direction = (0, editorGroupsService_1.preferredSideBySideGroupDirection)(configurationService);
            return direction === 3 /* GroupDirection.RIGHT */ ? 1 /* GroupDirection.DOWN */ : 3 /* GroupDirection.RIGHT */;
        }
    }
    exports.SplitEditorOrthogonalAction = SplitEditorOrthogonalAction;
    class SplitEditorLeftAction extends ExecuteCommandAction {
        constructor() {
            super({
                id: editorCommands_1.SPLIT_EDITOR_LEFT,
                title: { value: (0, nls_1.localize)('splitEditorGroupLeft', "Split Editor Left"), original: 'Split Editor Left' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 93 /* KeyCode.Backslash */)
                },
                category: actionCommonCategories_1.Categories.View
            }, editorCommands_1.SPLIT_EDITOR_LEFT);
        }
    }
    exports.SplitEditorLeftAction = SplitEditorLeftAction;
    class SplitEditorRightAction extends ExecuteCommandAction {
        constructor() {
            super({
                id: editorCommands_1.SPLIT_EDITOR_RIGHT,
                title: { value: (0, nls_1.localize)('splitEditorGroupRight', "Split Editor Right"), original: 'Split Editor Right' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 93 /* KeyCode.Backslash */)
                },
                category: actionCommonCategories_1.Categories.View
            }, editorCommands_1.SPLIT_EDITOR_RIGHT);
        }
    }
    exports.SplitEditorRightAction = SplitEditorRightAction;
    class SplitEditorUpAction extends ExecuteCommandAction {
        static { this.LABEL = (0, nls_1.localize)('splitEditorGroupUp', "Split Editor Up"); }
        constructor() {
            super({
                id: editorCommands_1.SPLIT_EDITOR_UP,
                title: { value: (0, nls_1.localize)('splitEditorGroupUp', "Split Editor Up"), original: 'Split Editor Up' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 93 /* KeyCode.Backslash */)
                },
                category: actionCommonCategories_1.Categories.View
            }, editorCommands_1.SPLIT_EDITOR_UP);
        }
    }
    exports.SplitEditorUpAction = SplitEditorUpAction;
    class SplitEditorDownAction extends ExecuteCommandAction {
        static { this.LABEL = (0, nls_1.localize)('splitEditorGroupDown', "Split Editor Down"); }
        constructor() {
            super({
                id: editorCommands_1.SPLIT_EDITOR_DOWN,
                title: { value: (0, nls_1.localize)('splitEditorGroupDown', "Split Editor Down"), original: 'Split Editor Down' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 93 /* KeyCode.Backslash */)
                },
                category: actionCommonCategories_1.Categories.View
            }, editorCommands_1.SPLIT_EDITOR_DOWN);
        }
    }
    exports.SplitEditorDownAction = SplitEditorDownAction;
    class JoinTwoGroupsAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.joinTwoGroups',
                title: { value: (0, nls_1.localize)('joinTwoGroups', "Join Editor Group with Next Group"), original: 'Join Editor Group with Next Group' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            });
        }
        async run(accessor, context) {
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            let sourceGroup;
            if (context && typeof context.groupId === 'number') {
                sourceGroup = editorGroupService.getGroup(context.groupId);
            }
            else {
                sourceGroup = editorGroupService.activeGroup;
            }
            if (sourceGroup) {
                const targetGroupDirections = [3 /* GroupDirection.RIGHT */, 1 /* GroupDirection.DOWN */, 2 /* GroupDirection.LEFT */, 0 /* GroupDirection.UP */];
                for (const targetGroupDirection of targetGroupDirections) {
                    const targetGroup = editorGroupService.findGroup({ direction: targetGroupDirection }, sourceGroup);
                    if (targetGroup && sourceGroup !== targetGroup) {
                        editorGroupService.mergeGroup(sourceGroup, targetGroup);
                        break;
                    }
                }
            }
        }
    }
    exports.JoinTwoGroupsAction = JoinTwoGroupsAction;
    class JoinAllGroupsAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.joinAllGroups',
                title: { value: (0, nls_1.localize)('joinAllGroups', "Join All Editor Groups"), original: 'Join All Editor Groups' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            });
        }
        async run(accessor) {
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            editorGroupService.mergeAllGroups();
        }
    }
    exports.JoinAllGroupsAction = JoinAllGroupsAction;
    class NavigateBetweenGroupsAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.navigateEditorGroups',
                title: { value: (0, nls_1.localize)('navigateEditorGroups', "Navigate Between Editor Groups"), original: 'Navigate Between Editor Groups' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            });
        }
        async run(accessor) {
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const nextGroup = editorGroupService.findGroup({ location: 2 /* GroupLocation.NEXT */ }, editorGroupService.activeGroup, true);
            nextGroup?.focus();
        }
    }
    exports.NavigateBetweenGroupsAction = NavigateBetweenGroupsAction;
    class FocusActiveGroupAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.focusActiveEditorGroup',
                title: { value: (0, nls_1.localize)('focusActiveEditorGroup', "Focus Active Editor Group"), original: 'Focus Active Editor Group' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            });
        }
        async run(accessor) {
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            editorGroupService.activeGroup.focus();
        }
    }
    exports.FocusActiveGroupAction = FocusActiveGroupAction;
    class AbstractFocusGroupAction extends actions_2.Action2 {
        constructor(desc, scope) {
            super(desc);
            this.scope = scope;
        }
        async run(accessor) {
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const group = editorGroupService.findGroup(this.scope, editorGroupService.activeGroup, true);
            group?.focus();
        }
    }
    class FocusFirstGroupAction extends AbstractFocusGroupAction {
        constructor() {
            super({
                id: 'workbench.action.focusFirstEditorGroup',
                title: { value: (0, nls_1.localize)('focusFirstEditorGroup', "Focus First Editor Group"), original: 'Focus First Editor Group' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 22 /* KeyCode.Digit1 */
                },
                category: actionCommonCategories_1.Categories.View
            }, { location: 0 /* GroupLocation.FIRST */ });
        }
    }
    exports.FocusFirstGroupAction = FocusFirstGroupAction;
    class FocusLastGroupAction extends AbstractFocusGroupAction {
        constructor() {
            super({
                id: 'workbench.action.focusLastEditorGroup',
                title: { value: (0, nls_1.localize)('focusLastEditorGroup', "Focus Last Editor Group"), original: 'Focus Last Editor Group' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, { location: 1 /* GroupLocation.LAST */ });
        }
    }
    exports.FocusLastGroupAction = FocusLastGroupAction;
    class FocusNextGroup extends AbstractFocusGroupAction {
        constructor() {
            super({
                id: 'workbench.action.focusNextGroup',
                title: { value: (0, nls_1.localize)('focusNextGroup', "Focus Next Editor Group"), original: 'Focus Next Editor Group' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, { location: 2 /* GroupLocation.NEXT */ });
        }
    }
    exports.FocusNextGroup = FocusNextGroup;
    class FocusPreviousGroup extends AbstractFocusGroupAction {
        constructor() {
            super({
                id: 'workbench.action.focusPreviousGroup',
                title: { value: (0, nls_1.localize)('focusPreviousGroup', "Focus Previous Editor Group"), original: 'Focus Previous Editor Group' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, { location: 3 /* GroupLocation.PREVIOUS */ });
        }
    }
    exports.FocusPreviousGroup = FocusPreviousGroup;
    class FocusLeftGroup extends AbstractFocusGroupAction {
        constructor() {
            super({
                id: 'workbench.action.focusLeftGroup',
                title: { value: (0, nls_1.localize)('focusLeftGroup', "Focus Left Editor Group"), original: 'Focus Left Editor Group' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 15 /* KeyCode.LeftArrow */)
                },
                category: actionCommonCategories_1.Categories.View
            }, { direction: 2 /* GroupDirection.LEFT */ });
        }
    }
    exports.FocusLeftGroup = FocusLeftGroup;
    class FocusRightGroup extends AbstractFocusGroupAction {
        constructor() {
            super({
                id: 'workbench.action.focusRightGroup',
                title: { value: (0, nls_1.localize)('focusRightGroup', "Focus Right Editor Group"), original: 'Focus Right Editor Group' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 17 /* KeyCode.RightArrow */)
                },
                category: actionCommonCategories_1.Categories.View
            }, { direction: 3 /* GroupDirection.RIGHT */ });
        }
    }
    exports.FocusRightGroup = FocusRightGroup;
    class FocusAboveGroup extends AbstractFocusGroupAction {
        constructor() {
            super({
                id: 'workbench.action.focusAboveGroup',
                title: { value: (0, nls_1.localize)('focusAboveGroup', "Focus Editor Group Above"), original: 'Focus Editor Group Above' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */)
                },
                category: actionCommonCategories_1.Categories.View
            }, { direction: 0 /* GroupDirection.UP */ });
        }
    }
    exports.FocusAboveGroup = FocusAboveGroup;
    class FocusBelowGroup extends AbstractFocusGroupAction {
        constructor() {
            super({
                id: 'workbench.action.focusBelowGroup',
                title: { value: (0, nls_1.localize)('focusBelowGroup', "Focus Editor Group Below"), original: 'Focus Editor Group Below' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */)
                },
                category: actionCommonCategories_1.Categories.View
            }, { direction: 1 /* GroupDirection.DOWN */ });
        }
    }
    exports.FocusBelowGroup = FocusBelowGroup;
    let CloseEditorAction = class CloseEditorAction extends actions_1.Action {
        static { this.ID = 'workbench.action.closeActiveEditor'; }
        static { this.LABEL = (0, nls_1.localize)('closeEditor', "Close Editor"); }
        constructor(id, label, commandService) {
            super(id, label, themables_1.ThemeIcon.asClassName(codicons_1.Codicon.close));
            this.commandService = commandService;
        }
        run(context) {
            return this.commandService.executeCommand(editorCommands_1.CLOSE_EDITOR_COMMAND_ID, undefined, context);
        }
    };
    exports.CloseEditorAction = CloseEditorAction;
    exports.CloseEditorAction = CloseEditorAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], CloseEditorAction);
    let UnpinEditorAction = class UnpinEditorAction extends actions_1.Action {
        static { this.ID = 'workbench.action.unpinActiveEditor'; }
        static { this.LABEL = (0, nls_1.localize)('unpinEditor', "Unpin Editor"); }
        constructor(id, label, commandService) {
            super(id, label, themables_1.ThemeIcon.asClassName(codicons_1.Codicon.pinned));
            this.commandService = commandService;
        }
        run(context) {
            return this.commandService.executeCommand(editorCommands_1.UNPIN_EDITOR_COMMAND_ID, undefined, context);
        }
    };
    exports.UnpinEditorAction = UnpinEditorAction;
    exports.UnpinEditorAction = UnpinEditorAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], UnpinEditorAction);
    let CloseOneEditorAction = class CloseOneEditorAction extends actions_1.Action {
        static { this.ID = 'workbench.action.closeActiveEditor'; }
        static { this.LABEL = (0, nls_1.localize)('closeOneEditor', "Close"); }
        constructor(id, label, editorGroupService) {
            super(id, label, themables_1.ThemeIcon.asClassName(codicons_1.Codicon.close));
            this.editorGroupService = editorGroupService;
        }
        async run(context) {
            let group;
            let editorIndex;
            if (context) {
                group = this.editorGroupService.getGroup(context.groupId);
                if (group) {
                    editorIndex = context.editorIndex; // only allow editor at index if group is valid
                }
            }
            if (!group) {
                group = this.editorGroupService.activeGroup;
            }
            // Close specific editor in group
            if (typeof editorIndex === 'number') {
                const editorAtIndex = group.getEditorByIndex(editorIndex);
                if (editorAtIndex) {
                    await group.closeEditor(editorAtIndex, { preserveFocus: context?.preserveFocus });
                    return;
                }
            }
            // Otherwise close active editor in group
            if (group.activeEditor) {
                await group.closeEditor(group.activeEditor, { preserveFocus: context?.preserveFocus });
                return;
            }
        }
    };
    exports.CloseOneEditorAction = CloseOneEditorAction;
    exports.CloseOneEditorAction = CloseOneEditorAction = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], CloseOneEditorAction);
    class RevertAndCloseEditorAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.revertAndCloseActiveEditor',
                title: { value: (0, nls_1.localize)('revertAndCloseActiveEditor', "Revert and Close Editor"), original: 'Revert and Close Editor' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const logService = accessor.get(log_1.ILogService);
            const activeEditorPane = editorService.activeEditorPane;
            if (activeEditorPane) {
                const editor = activeEditorPane.input;
                const group = activeEditorPane.group;
                // first try a normal revert where the contents of the editor are restored
                try {
                    await editorService.revert({ editor, groupId: group.id });
                }
                catch (error) {
                    logService.error(error);
                    // if that fails, since we are about to close the editor, we accept that
                    // the editor cannot be reverted and instead do a soft revert that just
                    // enables us to close the editor. With this, a user can always close a
                    // dirty editor even when reverting fails.
                    await editorService.revert({ editor, groupId: group.id }, { soft: true });
                }
                await group.closeEditor(editor);
            }
        }
    }
    exports.RevertAndCloseEditorAction = RevertAndCloseEditorAction;
    class CloseLeftEditorsInGroupAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.closeEditorsToTheLeft',
                title: { value: (0, nls_1.localize)('closeEditorsToTheLeft', "Close Editors to the Left in Group"), original: 'Close Editors to the Left in Group' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            });
        }
        async run(accessor, context) {
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const { group, editor } = this.getTarget(editorGroupService, context);
            if (group && editor) {
                await group.closeEditors({ direction: 0 /* CloseDirection.LEFT */, except: editor, excludeSticky: true });
            }
        }
        getTarget(editorGroupService, context) {
            if (context) {
                return { editor: context.editor, group: editorGroupService.getGroup(context.groupId) };
            }
            // Fallback to active group
            return { group: editorGroupService.activeGroup, editor: editorGroupService.activeGroup.activeEditor };
        }
    }
    exports.CloseLeftEditorsInGroupAction = CloseLeftEditorsInGroupAction;
    class AbstractCloseAllAction extends actions_2.Action2 {
        groupsToClose(editorGroupService) {
            const groupsToClose = [];
            // Close editors in reverse order of their grid appearance so that the editor
            // group that is the first (top-left) remains. This helps to keep view state
            // for editors around that have been opened in this visually first group.
            const groups = editorGroupService.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */);
            for (let i = groups.length - 1; i >= 0; i--) {
                groupsToClose.push(groups[i]);
            }
            return groupsToClose;
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const filesConfigurationService = accessor.get(filesConfigurationService_1.IFilesConfigurationService);
            const fileDialogService = accessor.get(dialogs_1.IFileDialogService);
            // Depending on the editor and auto save configuration,
            // split editors into buckets for handling confirmation
            const dirtyEditorsWithDefaultConfirm = new Set();
            const dirtyAutoSaveOnFocusChangeEditors = new Set();
            const dirtyAutoSaveOnWindowChangeEditors = new Set();
            const editorsWithCustomConfirm = new Map();
            for (const { editor, groupId } of editorService.getEditors(1 /* EditorsOrder.SEQUENTIAL */, { excludeSticky: this.excludeSticky })) {
                let confirmClose = false;
                if (editor.closeHandler) {
                    confirmClose = editor.closeHandler.showConfirm(); // custom handling of confirmation on close
                }
                else {
                    confirmClose = editor.isDirty() && !editor.isSaving(); // default confirm only when dirty and not saving
                }
                if (!confirmClose) {
                    continue;
                }
                // Editor has custom confirm implementation
                if (typeof editor.closeHandler?.confirm === 'function') {
                    let customEditorsToConfirm = editorsWithCustomConfirm.get(editor.typeId);
                    if (!customEditorsToConfirm) {
                        customEditorsToConfirm = new Set();
                        editorsWithCustomConfirm.set(editor.typeId, customEditorsToConfirm);
                    }
                    customEditorsToConfirm.add({ editor, groupId });
                }
                // Editor will be saved on focus change when a
                // dialog appears, so just track that separate
                else if (filesConfigurationService.getAutoSaveMode() === 3 /* AutoSaveMode.ON_FOCUS_CHANGE */ && !editor.hasCapability(4 /* EditorInputCapabilities.Untitled */)) {
                    dirtyAutoSaveOnFocusChangeEditors.add({ editor, groupId });
                }
                // Windows, Linux: editor will be saved on window change
                // when a native dialog appears, so just track that separate
                // (see https://github.com/microsoft/vscode/issues/134250)
                else if ((platform_1.isNative && (platform_1.isWindows || platform_1.isLinux)) && filesConfigurationService.getAutoSaveMode() === 4 /* AutoSaveMode.ON_WINDOW_CHANGE */ && !editor.hasCapability(4 /* EditorInputCapabilities.Untitled */)) {
                    dirtyAutoSaveOnWindowChangeEditors.add({ editor, groupId });
                }
                // Editor will show in generic file based dialog
                else {
                    dirtyEditorsWithDefaultConfirm.add({ editor, groupId });
                }
            }
            // 1.) Show default file based dialog
            if (dirtyEditorsWithDefaultConfirm.size > 0) {
                const editors = Array.from(dirtyEditorsWithDefaultConfirm.values());
                await this.revealEditorsToConfirm(editors, editorGroupService); // help user make a decision by revealing editors
                const confirmation = await fileDialogService.showSaveConfirm(editors.map(({ editor }) => {
                    if (editor instanceof sideBySideEditorInput_1.SideBySideEditorInput) {
                        return editor.primary.getName(); // prefer shorter names by using primary's name in this case
                    }
                    return editor.getName();
                }));
                switch (confirmation) {
                    case 2 /* ConfirmResult.CANCEL */:
                        return;
                    case 1 /* ConfirmResult.DONT_SAVE */:
                        await editorService.revert(editors, { soft: true });
                        break;
                    case 0 /* ConfirmResult.SAVE */:
                        await editorService.save(editors, { reason: 1 /* SaveReason.EXPLICIT */ });
                        break;
                }
            }
            // 2.) Show custom confirm based dialog
            for (const [, editorIdentifiers] of editorsWithCustomConfirm) {
                const editors = Array.from(editorIdentifiers.values());
                await this.revealEditorsToConfirm(editors, editorGroupService); // help user make a decision by revealing editors
                const confirmation = await (0, arrays_1.firstOrDefault)(editors)?.editor.closeHandler?.confirm?.(editors);
                if (typeof confirmation === 'number') {
                    switch (confirmation) {
                        case 2 /* ConfirmResult.CANCEL */:
                            return;
                        case 1 /* ConfirmResult.DONT_SAVE */:
                            await editorService.revert(editors, { soft: true });
                            break;
                        case 0 /* ConfirmResult.SAVE */:
                            await editorService.save(editors, { reason: 1 /* SaveReason.EXPLICIT */ });
                            break;
                    }
                }
            }
            // 3.) Save autosaveable editors (focus change)
            if (dirtyAutoSaveOnFocusChangeEditors.size > 0) {
                const editors = Array.from(dirtyAutoSaveOnFocusChangeEditors.values());
                await editorService.save(editors, { reason: 3 /* SaveReason.FOCUS_CHANGE */ });
            }
            // 4.) Save autosaveable editors (window change)
            if (dirtyAutoSaveOnWindowChangeEditors.size > 0) {
                const editors = Array.from(dirtyAutoSaveOnWindowChangeEditors.values());
                await editorService.save(editors, { reason: 4 /* SaveReason.WINDOW_CHANGE */ });
            }
            // 5.) Finally close all editors: even if an editor failed to
            // save or revert and still reports dirty, the editor part makes
            // sure to bring up another confirm dialog for those editors
            // specifically.
            return this.doCloseAll(editorGroupService);
        }
        async revealEditorsToConfirm(editors, editorGroupService) {
            try {
                const handledGroups = new Set();
                for (const { editor, groupId } of editors) {
                    if (handledGroups.has(groupId)) {
                        continue;
                    }
                    handledGroups.add(groupId);
                    const group = editorGroupService.getGroup(groupId);
                    await group?.openEditor(editor);
                }
            }
            catch (error) {
                // ignore any error as the revealing is just convinience
            }
        }
        async doCloseAll(editorGroupService) {
            await Promise.all(this.groupsToClose(editorGroupService).map(group => group.closeAllEditors({ excludeSticky: this.excludeSticky })));
        }
    }
    class CloseAllEditorsAction extends AbstractCloseAllAction {
        static { this.ID = 'workbench.action.closeAllEditors'; }
        static { this.LABEL = { value: (0, nls_1.localize)('closeAllEditors', "Close All Editors"), original: 'Close All Editors' }; }
        constructor() {
            super({
                id: CloseAllEditorsAction.ID,
                title: CloseAllEditorsAction.LABEL,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 53 /* KeyCode.KeyW */)
                },
                icon: codicons_1.Codicon.closeAll,
                category: actionCommonCategories_1.Categories.View
            });
        }
        get excludeSticky() {
            return true; // exclude sticky from this mass-closing operation
        }
    }
    exports.CloseAllEditorsAction = CloseAllEditorsAction;
    class CloseAllEditorGroupsAction extends AbstractCloseAllAction {
        constructor() {
            super({
                id: 'workbench.action.closeAllGroups',
                title: { value: (0, nls_1.localize)('closeAllGroups', "Close All Editor Groups"), original: 'Close All Editor Groups' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 53 /* KeyCode.KeyW */)
                },
                category: actionCommonCategories_1.Categories.View
            });
        }
        get excludeSticky() {
            return false; // the intent to close groups means, even sticky are included
        }
        async doCloseAll(editorGroupService) {
            await super.doCloseAll(editorGroupService);
            for (const groupToClose of this.groupsToClose(editorGroupService)) {
                editorGroupService.removeGroup(groupToClose);
            }
        }
    }
    exports.CloseAllEditorGroupsAction = CloseAllEditorGroupsAction;
    class CloseEditorsInOtherGroupsAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.closeEditorsInOtherGroups',
                title: { value: (0, nls_1.localize)('closeEditorsInOtherGroups', "Close Editors in Other Groups"), original: 'Close Editors in Other Groups' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            });
        }
        async run(accessor, context) {
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const groupToSkip = context ? editorGroupService.getGroup(context.groupId) : editorGroupService.activeGroup;
            await Promise.all(editorGroupService.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */).map(async (group) => {
                if (groupToSkip && group.id === groupToSkip.id) {
                    return;
                }
                return group.closeAllEditors({ excludeSticky: true });
            }));
        }
    }
    exports.CloseEditorsInOtherGroupsAction = CloseEditorsInOtherGroupsAction;
    class CloseEditorInAllGroupsAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.closeEditorInAllGroups',
                title: { value: (0, nls_1.localize)('closeEditorInAllGroups', "Close Editor in All Groups"), original: 'Close Editor in All Groups' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const activeEditor = editorService.activeEditor;
            if (activeEditor) {
                await Promise.all(editorGroupService.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */).map(group => group.closeEditor(activeEditor)));
            }
        }
    }
    exports.CloseEditorInAllGroupsAction = CloseEditorInAllGroupsAction;
    class AbstractMoveCopyGroupAction extends actions_2.Action2 {
        constructor(desc, direction, isMove) {
            super(desc);
            this.direction = direction;
            this.isMove = isMove;
        }
        async run(accessor, context) {
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            let sourceGroup;
            if (context && typeof context.groupId === 'number') {
                sourceGroup = editorGroupService.getGroup(context.groupId);
            }
            else {
                sourceGroup = editorGroupService.activeGroup;
            }
            if (sourceGroup) {
                let resultGroup = undefined;
                if (this.isMove) {
                    const targetGroup = this.findTargetGroup(editorGroupService, sourceGroup);
                    if (targetGroup) {
                        resultGroup = editorGroupService.moveGroup(sourceGroup, targetGroup, this.direction);
                    }
                }
                else {
                    resultGroup = editorGroupService.copyGroup(sourceGroup, sourceGroup, this.direction);
                }
                if (resultGroup) {
                    editorGroupService.activateGroup(resultGroup);
                }
            }
        }
        findTargetGroup(editorGroupService, sourceGroup) {
            const targetNeighbours = [this.direction];
            // Allow the target group to be in alternative locations to support more
            // scenarios of moving the group to the taret location.
            // Helps for https://github.com/microsoft/vscode/issues/50741
            switch (this.direction) {
                case 2 /* GroupDirection.LEFT */:
                case 3 /* GroupDirection.RIGHT */:
                    targetNeighbours.push(0 /* GroupDirection.UP */, 1 /* GroupDirection.DOWN */);
                    break;
                case 0 /* GroupDirection.UP */:
                case 1 /* GroupDirection.DOWN */:
                    targetNeighbours.push(2 /* GroupDirection.LEFT */, 3 /* GroupDirection.RIGHT */);
                    break;
            }
            for (const targetNeighbour of targetNeighbours) {
                const targetNeighbourGroup = editorGroupService.findGroup({ direction: targetNeighbour }, sourceGroup);
                if (targetNeighbourGroup) {
                    return targetNeighbourGroup;
                }
            }
            return undefined;
        }
    }
    class AbstractMoveGroupAction extends AbstractMoveCopyGroupAction {
        constructor(desc, direction) {
            super(desc, direction, true);
        }
    }
    class MoveGroupLeftAction extends AbstractMoveGroupAction {
        constructor() {
            super({
                id: 'workbench.action.moveActiveEditorGroupLeft',
                title: { value: (0, nls_1.localize)('moveActiveGroupLeft', "Move Editor Group Left"), original: 'Move Editor Group Left' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 15 /* KeyCode.LeftArrow */)
                },
                category: actionCommonCategories_1.Categories.View
            }, 2 /* GroupDirection.LEFT */);
        }
    }
    exports.MoveGroupLeftAction = MoveGroupLeftAction;
    class MoveGroupRightAction extends AbstractMoveGroupAction {
        constructor() {
            super({
                id: 'workbench.action.moveActiveEditorGroupRight',
                title: { value: (0, nls_1.localize)('moveActiveGroupRight', "Move Editor Group Right"), original: 'Move Editor Group Right' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 17 /* KeyCode.RightArrow */)
                },
                category: actionCommonCategories_1.Categories.View
            }, 3 /* GroupDirection.RIGHT */);
        }
    }
    exports.MoveGroupRightAction = MoveGroupRightAction;
    class MoveGroupUpAction extends AbstractMoveGroupAction {
        constructor() {
            super({
                id: 'workbench.action.moveActiveEditorGroupUp',
                title: { value: (0, nls_1.localize)('moveActiveGroupUp', "Move Editor Group Up"), original: 'Move Editor Group Up' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 16 /* KeyCode.UpArrow */)
                },
                category: actionCommonCategories_1.Categories.View
            }, 0 /* GroupDirection.UP */);
        }
    }
    exports.MoveGroupUpAction = MoveGroupUpAction;
    class MoveGroupDownAction extends AbstractMoveGroupAction {
        constructor() {
            super({
                id: 'workbench.action.moveActiveEditorGroupDown',
                title: { value: (0, nls_1.localize)('moveActiveGroupDown', "Move Editor Group Down"), original: 'Move Editor Group Down' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 18 /* KeyCode.DownArrow */)
                },
                category: actionCommonCategories_1.Categories.View
            }, 1 /* GroupDirection.DOWN */);
        }
    }
    exports.MoveGroupDownAction = MoveGroupDownAction;
    class AbstractDuplicateGroupAction extends AbstractMoveCopyGroupAction {
        constructor(desc, direction) {
            super(desc, direction, false);
        }
    }
    class DuplicateGroupLeftAction extends AbstractDuplicateGroupAction {
        constructor() {
            super({
                id: 'workbench.action.duplicateActiveEditorGroupLeft',
                title: { value: (0, nls_1.localize)('duplicateActiveGroupLeft', "Duplicate Editor Group Left"), original: 'Duplicate Editor Group Left' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, 2 /* GroupDirection.LEFT */);
        }
    }
    exports.DuplicateGroupLeftAction = DuplicateGroupLeftAction;
    class DuplicateGroupRightAction extends AbstractDuplicateGroupAction {
        constructor() {
            super({
                id: 'workbench.action.duplicateActiveEditorGroupRight',
                title: { value: (0, nls_1.localize)('duplicateActiveGroupRight', "Duplicate Editor Group Right"), original: 'Duplicate Editor Group Right' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, 3 /* GroupDirection.RIGHT */);
        }
    }
    exports.DuplicateGroupRightAction = DuplicateGroupRightAction;
    class DuplicateGroupUpAction extends AbstractDuplicateGroupAction {
        constructor() {
            super({
                id: 'workbench.action.duplicateActiveEditorGroupUp',
                title: { value: (0, nls_1.localize)('duplicateActiveGroupUp', "Duplicate Editor Group Up"), original: 'Duplicate Editor Group Up' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, 0 /* GroupDirection.UP */);
        }
    }
    exports.DuplicateGroupUpAction = DuplicateGroupUpAction;
    class DuplicateGroupDownAction extends AbstractDuplicateGroupAction {
        constructor() {
            super({
                id: 'workbench.action.duplicateActiveEditorGroupDown',
                title: { value: (0, nls_1.localize)('duplicateActiveGroupDown', "Duplicate Editor Group Down"), original: 'Duplicate Editor Group Down' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, 1 /* GroupDirection.DOWN */);
        }
    }
    exports.DuplicateGroupDownAction = DuplicateGroupDownAction;
    class MinimizeOtherGroupsAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.minimizeOtherEditors',
                title: { value: (0, nls_1.localize)('minimizeOtherEditorGroups', "Maximize Editor Group"), original: 'Maximize Editor Group' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            });
        }
        async run(accessor) {
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            editorGroupService.arrangeGroups(0 /* GroupsArrangement.MAXIMIZE */);
        }
    }
    exports.MinimizeOtherGroupsAction = MinimizeOtherGroupsAction;
    class ResetGroupSizesAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.evenEditorWidths',
                title: { value: (0, nls_1.localize)('evenEditorGroups', "Reset Editor Group Sizes"), original: 'Reset Editor Group Sizes' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            });
        }
        async run(accessor) {
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            editorGroupService.arrangeGroups(1 /* GroupsArrangement.EVEN */);
        }
    }
    exports.ResetGroupSizesAction = ResetGroupSizesAction;
    class ToggleGroupSizesAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.toggleEditorWidths',
                title: { value: (0, nls_1.localize)('toggleEditorWidths', "Toggle Editor Group Sizes"), original: 'Toggle Editor Group Sizes' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            });
        }
        async run(accessor) {
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            editorGroupService.arrangeGroups(2 /* GroupsArrangement.TOGGLE */);
        }
    }
    exports.ToggleGroupSizesAction = ToggleGroupSizesAction;
    class MaximizeGroupAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.maximizeEditor',
                title: { value: (0, nls_1.localize)('maximizeEditor', "Maximize Editor Group and Hide Side Bars"), original: 'Maximize Editor Group and Hide Side Bars' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            });
        }
        async run(accessor) {
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const editorService = accessor.get(editorService_1.IEditorService);
            if (editorService.activeEditor) {
                layoutService.setPartHidden(true, "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
                layoutService.setPartHidden(true, "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
                editorGroupService.arrangeGroups(0 /* GroupsArrangement.MAXIMIZE */);
            }
        }
    }
    exports.MaximizeGroupAction = MaximizeGroupAction;
    class AbstractNavigateEditorAction extends actions_2.Action2 {
        async run(accessor) {
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const result = this.navigate(editorGroupService);
            if (!result) {
                return;
            }
            const { groupId, editor } = result;
            if (!editor) {
                return;
            }
            const group = editorGroupService.getGroup(groupId);
            if (group) {
                await group.openEditor(editor);
            }
        }
    }
    class OpenNextEditor extends AbstractNavigateEditorAction {
        constructor() {
            super({
                id: 'workbench.action.nextEditor',
                title: { value: (0, nls_1.localize)('openNextEditor', "Open Next Editor"), original: 'Open Next Editor' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 12 /* KeyCode.PageDown */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 17 /* KeyCode.RightArrow */,
                        secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 94 /* KeyCode.BracketRight */]
                    }
                },
                category: actionCommonCategories_1.Categories.View
            });
        }
        navigate(editorGroupService) {
            // Navigate in active group if possible
            const activeGroup = editorGroupService.activeGroup;
            const activeGroupEditors = activeGroup.getEditors(1 /* EditorsOrder.SEQUENTIAL */);
            const activeEditorIndex = activeGroup.activeEditor ? activeGroupEditors.indexOf(activeGroup.activeEditor) : -1;
            if (activeEditorIndex + 1 < activeGroupEditors.length) {
                return { editor: activeGroupEditors[activeEditorIndex + 1], groupId: activeGroup.id };
            }
            // Otherwise try in next group that has editors
            const handledGroups = new Set();
            let currentGroup = editorGroupService.activeGroup;
            while (currentGroup && !handledGroups.has(currentGroup.id)) {
                currentGroup = editorGroupService.findGroup({ location: 2 /* GroupLocation.NEXT */ }, currentGroup, true);
                if (currentGroup) {
                    handledGroups.add(currentGroup.id);
                    const groupEditors = currentGroup.getEditors(1 /* EditorsOrder.SEQUENTIAL */);
                    if (groupEditors.length > 0) {
                        return { editor: groupEditors[0], groupId: currentGroup.id };
                    }
                }
            }
            return undefined;
        }
    }
    exports.OpenNextEditor = OpenNextEditor;
    class OpenPreviousEditor extends AbstractNavigateEditorAction {
        constructor() {
            super({
                id: 'workbench.action.previousEditor',
                title: { value: (0, nls_1.localize)('openPreviousEditor', "Open Previous Editor"), original: 'Open Previous Editor' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 11 /* KeyCode.PageUp */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 15 /* KeyCode.LeftArrow */,
                        secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 92 /* KeyCode.BracketLeft */]
                    }
                },
                category: actionCommonCategories_1.Categories.View
            });
        }
        navigate(editorGroupService) {
            // Navigate in active group if possible
            const activeGroup = editorGroupService.activeGroup;
            const activeGroupEditors = activeGroup.getEditors(1 /* EditorsOrder.SEQUENTIAL */);
            const activeEditorIndex = activeGroup.activeEditor ? activeGroupEditors.indexOf(activeGroup.activeEditor) : -1;
            if (activeEditorIndex > 0) {
                return { editor: activeGroupEditors[activeEditorIndex - 1], groupId: activeGroup.id };
            }
            // Otherwise try in previous group that has editors
            const handledGroups = new Set();
            let currentGroup = editorGroupService.activeGroup;
            while (currentGroup && !handledGroups.has(currentGroup.id)) {
                currentGroup = editorGroupService.findGroup({ location: 3 /* GroupLocation.PREVIOUS */ }, currentGroup, true);
                if (currentGroup) {
                    handledGroups.add(currentGroup.id);
                    const groupEditors = currentGroup.getEditors(1 /* EditorsOrder.SEQUENTIAL */);
                    if (groupEditors.length > 0) {
                        return { editor: groupEditors[groupEditors.length - 1], groupId: currentGroup.id };
                    }
                }
            }
            return undefined;
        }
    }
    exports.OpenPreviousEditor = OpenPreviousEditor;
    class OpenNextEditorInGroup extends AbstractNavigateEditorAction {
        constructor() {
            super({
                id: 'workbench.action.nextEditorInGroup',
                title: { value: (0, nls_1.localize)('nextEditorInGroup', "Open Next Editor in Group"), original: 'Open Next Editor in Group' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 12 /* KeyCode.PageDown */),
                    mac: {
                        primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 17 /* KeyCode.RightArrow */)
                    }
                },
                category: actionCommonCategories_1.Categories.View
            });
        }
        navigate(editorGroupService) {
            const group = editorGroupService.activeGroup;
            const editors = group.getEditors(1 /* EditorsOrder.SEQUENTIAL */);
            const index = group.activeEditor ? editors.indexOf(group.activeEditor) : -1;
            return { editor: index + 1 < editors.length ? editors[index + 1] : editors[0], groupId: group.id };
        }
    }
    exports.OpenNextEditorInGroup = OpenNextEditorInGroup;
    class OpenPreviousEditorInGroup extends AbstractNavigateEditorAction {
        constructor() {
            super({
                id: 'workbench.action.previousEditorInGroup',
                title: { value: (0, nls_1.localize)('openPreviousEditorInGroup', "Open Previous Editor in Group"), original: 'Open Previous Editor in Group' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 11 /* KeyCode.PageUp */),
                    mac: {
                        primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 15 /* KeyCode.LeftArrow */)
                    }
                },
                category: actionCommonCategories_1.Categories.View
            });
        }
        navigate(editorGroupService) {
            const group = editorGroupService.activeGroup;
            const editors = group.getEditors(1 /* EditorsOrder.SEQUENTIAL */);
            const index = group.activeEditor ? editors.indexOf(group.activeEditor) : -1;
            return { editor: index > 0 ? editors[index - 1] : editors[editors.length - 1], groupId: group.id };
        }
    }
    exports.OpenPreviousEditorInGroup = OpenPreviousEditorInGroup;
    class OpenFirstEditorInGroup extends AbstractNavigateEditorAction {
        constructor() {
            super({
                id: 'workbench.action.firstEditorInGroup',
                title: { value: (0, nls_1.localize)('firstEditorInGroup', "Open First Editor in Group"), original: 'Open First Editor in Group' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            });
        }
        navigate(editorGroupService) {
            const group = editorGroupService.activeGroup;
            const editors = group.getEditors(1 /* EditorsOrder.SEQUENTIAL */);
            return { editor: editors[0], groupId: group.id };
        }
    }
    exports.OpenFirstEditorInGroup = OpenFirstEditorInGroup;
    class OpenLastEditorInGroup extends AbstractNavigateEditorAction {
        constructor() {
            super({
                id: 'workbench.action.lastEditorInGroup',
                title: { value: (0, nls_1.localize)('lastEditorInGroup', "Open Last Editor in Group"), original: 'Open Last Editor in Group' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 512 /* KeyMod.Alt */ | 21 /* KeyCode.Digit0 */,
                    secondary: [2048 /* KeyMod.CtrlCmd */ | 30 /* KeyCode.Digit9 */],
                    mac: {
                        primary: 256 /* KeyMod.WinCtrl */ | 21 /* KeyCode.Digit0 */,
                        secondary: [2048 /* KeyMod.CtrlCmd */ | 30 /* KeyCode.Digit9 */]
                    }
                },
                category: actionCommonCategories_1.Categories.View
            });
        }
        navigate(editorGroupService) {
            const group = editorGroupService.activeGroup;
            const editors = group.getEditors(1 /* EditorsOrder.SEQUENTIAL */);
            return { editor: editors[editors.length - 1], groupId: group.id };
        }
    }
    exports.OpenLastEditorInGroup = OpenLastEditorInGroup;
    class NavigateForwardAction extends actions_2.Action2 {
        static { this.ID = 'workbench.action.navigateForward'; }
        static { this.LABEL = (0, nls_1.localize)('navigateForward', "Go Forward"); }
        constructor() {
            super({
                id: NavigateForwardAction.ID,
                title: { value: (0, nls_1.localize)('navigateForward', "Go Forward"), original: 'Go Forward', mnemonicTitle: (0, nls_1.localize)({ key: 'miForward', comment: ['&& denotes a mnemonic'] }, "&&Forward") },
                f1: true,
                icon: codicons_1.Codicon.arrowRight,
                precondition: contextkey_1.ContextKeyExpr.has('canNavigateForward'),
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    win: { primary: 512 /* KeyMod.Alt */ | 17 /* KeyCode.RightArrow */ },
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 88 /* KeyCode.Minus */ },
                    linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 88 /* KeyCode.Minus */ }
                },
                menu: [
                    { id: actions_2.MenuId.MenubarGoMenu, group: '1_history_nav', order: 2 },
                    { id: actions_2.MenuId.CommandCenter, order: 2 }
                ]
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.IHistoryService);
            await historyService.goForward(0 /* GoFilter.NONE */);
        }
    }
    exports.NavigateForwardAction = NavigateForwardAction;
    class NavigateBackwardsAction extends actions_2.Action2 {
        static { this.ID = 'workbench.action.navigateBack'; }
        static { this.LABEL = (0, nls_1.localize)('navigateBack', "Go Back"); }
        constructor() {
            super({
                id: NavigateBackwardsAction.ID,
                title: { value: (0, nls_1.localize)('navigateBack', "Go Back"), original: 'Go Back', mnemonicTitle: (0, nls_1.localize)({ key: 'miBack', comment: ['&& denotes a mnemonic'] }, "&&Back") },
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.has('canNavigateBack'),
                icon: codicons_1.Codicon.arrowLeft,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    win: { primary: 512 /* KeyMod.Alt */ | 15 /* KeyCode.LeftArrow */ },
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 88 /* KeyCode.Minus */ },
                    linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 88 /* KeyCode.Minus */ }
                },
                menu: [
                    { id: actions_2.MenuId.MenubarGoMenu, group: '1_history_nav', order: 1 },
                    { id: actions_2.MenuId.CommandCenter, order: 1 }
                ]
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.IHistoryService);
            await historyService.goBack(0 /* GoFilter.NONE */);
        }
    }
    exports.NavigateBackwardsAction = NavigateBackwardsAction;
    class NavigatePreviousAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.navigateLast',
                title: { value: (0, nls_1.localize)('navigatePrevious', "Go Previous"), original: 'Go Previous' },
                f1: true
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.IHistoryService);
            await historyService.goPrevious(0 /* GoFilter.NONE */);
        }
    }
    exports.NavigatePreviousAction = NavigatePreviousAction;
    class NavigateForwardInEditsAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.navigateForwardInEditLocations',
                title: { value: (0, nls_1.localize)('navigateForwardInEdits', "Go Forward in Edit Locations"), original: 'Go Forward in Edit Locations' },
                f1: true
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.IHistoryService);
            await historyService.goForward(1 /* GoFilter.EDITS */);
        }
    }
    exports.NavigateForwardInEditsAction = NavigateForwardInEditsAction;
    class NavigateBackwardsInEditsAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.navigateBackInEditLocations',
                title: { value: (0, nls_1.localize)('navigateBackInEdits', "Go Back in Edit Locations"), original: 'Go Back in Edit Locations' },
                f1: true
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.IHistoryService);
            await historyService.goBack(1 /* GoFilter.EDITS */);
        }
    }
    exports.NavigateBackwardsInEditsAction = NavigateBackwardsInEditsAction;
    class NavigatePreviousInEditsAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.navigatePreviousInEditLocations',
                title: { value: (0, nls_1.localize)('navigatePreviousInEdits', "Go Previous in Edit Locations"), original: 'Go Previous in Edit Locations' },
                f1: true
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.IHistoryService);
            await historyService.goPrevious(1 /* GoFilter.EDITS */);
        }
    }
    exports.NavigatePreviousInEditsAction = NavigatePreviousInEditsAction;
    class NavigateToLastEditLocationAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.navigateToLastEditLocation',
                title: { value: (0, nls_1.localize)('navigateToLastEditLocation', "Go to Last Edit Location"), original: 'Go to Last Edit Location' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 47 /* KeyCode.KeyQ */)
                }
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.IHistoryService);
            await historyService.goLast(1 /* GoFilter.EDITS */);
        }
    }
    exports.NavigateToLastEditLocationAction = NavigateToLastEditLocationAction;
    class NavigateForwardInNavigationsAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.navigateForwardInNavigationLocations',
                title: { value: (0, nls_1.localize)('navigateForwardInNavigations', "Go Forward in Navigation Locations"), original: 'Go Forward in Navigation Locations' },
                f1: true
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.IHistoryService);
            await historyService.goForward(2 /* GoFilter.NAVIGATION */);
        }
    }
    exports.NavigateForwardInNavigationsAction = NavigateForwardInNavigationsAction;
    class NavigateBackwardsInNavigationsAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.navigateBackInNavigationLocations',
                title: { value: (0, nls_1.localize)('navigateBackInNavigations', "Go Back in Navigation Locations"), original: 'Go Back in Navigation Locations' },
                f1: true
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.IHistoryService);
            await historyService.goBack(2 /* GoFilter.NAVIGATION */);
        }
    }
    exports.NavigateBackwardsInNavigationsAction = NavigateBackwardsInNavigationsAction;
    class NavigatePreviousInNavigationsAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.navigatePreviousInNavigationLocations',
                title: { value: (0, nls_1.localize)('navigatePreviousInNavigationLocations', "Go Previous in Navigation Locations"), original: 'Go Previous in Navigation Locations' },
                f1: true
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.IHistoryService);
            await historyService.goPrevious(2 /* GoFilter.NAVIGATION */);
        }
    }
    exports.NavigatePreviousInNavigationsAction = NavigatePreviousInNavigationsAction;
    class NavigateToLastNavigationLocationAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.navigateToLastNavigationLocation',
                title: { value: (0, nls_1.localize)('navigateToLastNavigationLocation', "Go to Last Navigation Location"), original: 'Go to Last Navigation Location' },
                f1: true
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.IHistoryService);
            await historyService.goLast(2 /* GoFilter.NAVIGATION */);
        }
    }
    exports.NavigateToLastNavigationLocationAction = NavigateToLastNavigationLocationAction;
    class ReopenClosedEditorAction extends actions_2.Action2 {
        static { this.ID = 'workbench.action.reopenClosedEditor'; }
        constructor() {
            super({
                id: ReopenClosedEditorAction.ID,
                title: { value: (0, nls_1.localize)('reopenClosedEditor', "Reopen Closed Editor"), original: 'Reopen Closed Editor' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 50 /* KeyCode.KeyT */
                },
                category: actionCommonCategories_1.Categories.View
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.IHistoryService);
            await historyService.reopenLastClosedEditor();
        }
    }
    exports.ReopenClosedEditorAction = ReopenClosedEditorAction;
    class ClearRecentFilesAction extends actions_2.Action2 {
        static { this.ID = 'workbench.action.clearRecentFiles'; }
        constructor() {
            super({
                id: ClearRecentFilesAction.ID,
                title: { value: (0, nls_1.localize)('clearRecentFiles', "Clear Recently Opened"), original: 'Clear Recently Opened' },
                f1: true,
                category: actionCommonCategories_1.Categories.File
            });
        }
        async run(accessor) {
            const dialogService = accessor.get(dialogs_1.IDialogService);
            const workspacesService = accessor.get(workspaces_1.IWorkspacesService);
            const historyService = accessor.get(history_1.IHistoryService);
            // Ask for confirmation
            const { confirmed } = await dialogService.confirm({
                type: 'warning',
                message: (0, nls_1.localize)('confirmClearRecentsMessage', "Do you want to clear all recently opened files and workspaces?"),
                detail: (0, nls_1.localize)('confirmClearDetail', "This action is irreversible!"),
                primaryButton: (0, nls_1.localize)({ key: 'clearButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Clear")
            });
            if (!confirmed) {
                return;
            }
            // Clear global recently opened
            workspacesService.clearRecentlyOpened();
            // Clear workspace specific recently opened
            historyService.clearRecentlyOpened();
        }
    }
    exports.ClearRecentFilesAction = ClearRecentFilesAction;
    class ShowEditorsInActiveGroupByMostRecentlyUsedAction extends actions_2.Action2 {
        static { this.ID = 'workbench.action.showEditorsInActiveGroup'; }
        constructor() {
            super({
                id: ShowEditorsInActiveGroupByMostRecentlyUsedAction.ID,
                title: { value: (0, nls_1.localize)('showEditorsInActiveGroup', "Show Editors in Active Group By Most Recently Used"), original: 'Show Editors in Active Group By Most Recently Used' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            });
        }
        async run(accessor) {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            quickInputService.quickAccess.show(editorQuickAccess_1.ActiveGroupEditorsByMostRecentlyUsedQuickAccess.PREFIX);
        }
    }
    exports.ShowEditorsInActiveGroupByMostRecentlyUsedAction = ShowEditorsInActiveGroupByMostRecentlyUsedAction;
    class ShowAllEditorsByAppearanceAction extends actions_2.Action2 {
        static { this.ID = 'workbench.action.showAllEditors'; }
        constructor() {
            super({
                id: ShowAllEditorsByAppearanceAction.ID,
                title: { value: (0, nls_1.localize)('showAllEditors', "Show All Editors By Appearance"), original: 'Show All Editors By Appearance' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 46 /* KeyCode.KeyP */),
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 2 /* KeyCode.Tab */
                    }
                },
                category: actionCommonCategories_1.Categories.File
            });
        }
        async run(accessor) {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            quickInputService.quickAccess.show(editorQuickAccess_1.AllEditorsByAppearanceQuickAccess.PREFIX);
        }
    }
    exports.ShowAllEditorsByAppearanceAction = ShowAllEditorsByAppearanceAction;
    class ShowAllEditorsByMostRecentlyUsedAction extends actions_2.Action2 {
        static { this.ID = 'workbench.action.showAllEditorsByMostRecentlyUsed'; }
        constructor() {
            super({
                id: ShowAllEditorsByMostRecentlyUsedAction.ID,
                title: { value: (0, nls_1.localize)('showAllEditorsByMostRecentlyUsed', "Show All Editors By Most Recently Used"), original: 'Show All Editors By Most Recently Used' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            });
        }
        async run(accessor) {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            quickInputService.quickAccess.show(editorQuickAccess_1.AllEditorsByMostRecentlyUsedQuickAccess.PREFIX);
        }
    }
    exports.ShowAllEditorsByMostRecentlyUsedAction = ShowAllEditorsByMostRecentlyUsedAction;
    class AbstractQuickAccessEditorAction extends actions_2.Action2 {
        constructor(desc, prefix, itemActivation) {
            super(desc);
            this.prefix = prefix;
            this.itemActivation = itemActivation;
        }
        async run(accessor) {
            const keybindingService = accessor.get(keybinding_1.IKeybindingService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const keybindings = keybindingService.lookupKeybindings(this.desc.id);
            quickInputService.quickAccess.show(this.prefix, {
                quickNavigateConfiguration: { keybindings },
                itemActivation: this.itemActivation
            });
        }
    }
    class QuickAccessPreviousRecentlyUsedEditorAction extends AbstractQuickAccessEditorAction {
        constructor() {
            super({
                id: 'workbench.action.quickOpenPreviousRecentlyUsedEditor',
                title: { value: (0, nls_1.localize)('quickOpenPreviousRecentlyUsedEditor', "Quick Open Previous Recently Used Editor"), original: 'Quick Open Previous Recently Used Editor' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, editorQuickAccess_1.AllEditorsByMostRecentlyUsedQuickAccess.PREFIX, undefined);
        }
    }
    exports.QuickAccessPreviousRecentlyUsedEditorAction = QuickAccessPreviousRecentlyUsedEditorAction;
    class QuickAccessLeastRecentlyUsedEditorAction extends AbstractQuickAccessEditorAction {
        constructor() {
            super({
                id: 'workbench.action.quickOpenLeastRecentlyUsedEditor',
                title: { value: (0, nls_1.localize)('quickOpenLeastRecentlyUsedEditor', "Quick Open Least Recently Used Editor"), original: 'Quick Open Least Recently Used Editor' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, editorQuickAccess_1.AllEditorsByMostRecentlyUsedQuickAccess.PREFIX, undefined);
        }
    }
    exports.QuickAccessLeastRecentlyUsedEditorAction = QuickAccessLeastRecentlyUsedEditorAction;
    class QuickAccessPreviousRecentlyUsedEditorInGroupAction extends AbstractQuickAccessEditorAction {
        constructor() {
            super({
                id: 'workbench.action.quickOpenPreviousRecentlyUsedEditorInGroup',
                title: { value: (0, nls_1.localize)('quickOpenPreviousRecentlyUsedEditorInGroup', "Quick Open Previous Recently Used Editor in Group"), original: 'Quick Open Previous Recently Used Editor in Group' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 2 /* KeyCode.Tab */,
                    mac: {
                        primary: 256 /* KeyMod.WinCtrl */ | 2 /* KeyCode.Tab */
                    }
                },
                precondition: contextkeys_1.ActiveEditorGroupEmptyContext.toNegated(),
                category: actionCommonCategories_1.Categories.View
            }, editorQuickAccess_1.ActiveGroupEditorsByMostRecentlyUsedQuickAccess.PREFIX, undefined);
        }
    }
    exports.QuickAccessPreviousRecentlyUsedEditorInGroupAction = QuickAccessPreviousRecentlyUsedEditorInGroupAction;
    class QuickAccessLeastRecentlyUsedEditorInGroupAction extends AbstractQuickAccessEditorAction {
        constructor() {
            super({
                id: 'workbench.action.quickOpenLeastRecentlyUsedEditorInGroup',
                title: { value: (0, nls_1.localize)('quickOpenLeastRecentlyUsedEditorInGroup', "Quick Open Least Recently Used Editor in Group"), original: 'Quick Open Least Recently Used Editor in Group' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */,
                    mac: {
                        primary: 256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */
                    }
                },
                precondition: contextkeys_1.ActiveEditorGroupEmptyContext.toNegated(),
                category: actionCommonCategories_1.Categories.View
            }, editorQuickAccess_1.ActiveGroupEditorsByMostRecentlyUsedQuickAccess.PREFIX, quickInput_1.ItemActivation.LAST);
        }
    }
    exports.QuickAccessLeastRecentlyUsedEditorInGroupAction = QuickAccessLeastRecentlyUsedEditorInGroupAction;
    class QuickAccessPreviousEditorFromHistoryAction extends actions_2.Action2 {
        static { this.ID = 'workbench.action.openPreviousEditorFromHistory'; }
        constructor() {
            super({
                id: QuickAccessPreviousEditorFromHistoryAction.ID,
                title: { value: (0, nls_1.localize)('navigateEditorHistoryByInput', "Quick Open Previous Editor from History"), original: 'Quick Open Previous Editor from History' },
                f1: true
            });
        }
        async run(accessor) {
            const keybindingService = accessor.get(keybinding_1.IKeybindingService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const keybindings = keybindingService.lookupKeybindings(QuickAccessPreviousEditorFromHistoryAction.ID);
            // Enforce to activate the first item in quick access if
            // the currently active editor group has n editor opened
            let itemActivation = undefined;
            if (editorGroupService.activeGroup.count === 0) {
                itemActivation = quickInput_1.ItemActivation.FIRST;
            }
            quickInputService.quickAccess.show('', { quickNavigateConfiguration: { keybindings }, itemActivation });
        }
    }
    exports.QuickAccessPreviousEditorFromHistoryAction = QuickAccessPreviousEditorFromHistoryAction;
    class OpenNextRecentlyUsedEditorAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.openNextRecentlyUsedEditor',
                title: { value: (0, nls_1.localize)('openNextRecentlyUsedEditor', "Open Next Recently Used Editor"), original: 'Open Next Recently Used Editor' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.IHistoryService);
            historyService.openNextRecentlyUsedEditor();
        }
    }
    exports.OpenNextRecentlyUsedEditorAction = OpenNextRecentlyUsedEditorAction;
    class OpenPreviousRecentlyUsedEditorAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.openPreviousRecentlyUsedEditor',
                title: { value: (0, nls_1.localize)('openPreviousRecentlyUsedEditor', "Open Previous Recently Used Editor"), original: 'Open Previous Recently Used Editor' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.IHistoryService);
            historyService.openPreviouslyUsedEditor();
        }
    }
    exports.OpenPreviousRecentlyUsedEditorAction = OpenPreviousRecentlyUsedEditorAction;
    class OpenNextRecentlyUsedEditorInGroupAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.openNextRecentlyUsedEditorInGroup',
                title: { value: (0, nls_1.localize)('openNextRecentlyUsedEditorInGroup', "Open Next Recently Used Editor In Group"), original: 'Open Next Recently Used Editor In Group' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.IHistoryService);
            const editorGroupsService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            historyService.openNextRecentlyUsedEditor(editorGroupsService.activeGroup.id);
        }
    }
    exports.OpenNextRecentlyUsedEditorInGroupAction = OpenNextRecentlyUsedEditorInGroupAction;
    class OpenPreviousRecentlyUsedEditorInGroupAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.openPreviousRecentlyUsedEditorInGroup',
                title: { value: (0, nls_1.localize)('openPreviousRecentlyUsedEditorInGroup', "Open Previous Recently Used Editor In Group"), original: 'Open Previous Recently Used Editor In Group' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.IHistoryService);
            const editorGroupsService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            historyService.openPreviouslyUsedEditor(editorGroupsService.activeGroup.id);
        }
    }
    exports.OpenPreviousRecentlyUsedEditorInGroupAction = OpenPreviousRecentlyUsedEditorInGroupAction;
    class ClearEditorHistoryAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.clearEditorHistory',
                title: { value: (0, nls_1.localize)('clearEditorHistory', "Clear Editor History"), original: 'Clear Editor History' },
                f1: true
            });
        }
        async run(accessor) {
            const dialogService = accessor.get(dialogs_1.IDialogService);
            const historyService = accessor.get(history_1.IHistoryService);
            // Ask for confirmation
            const { confirmed } = await dialogService.confirm({
                type: 'warning',
                message: (0, nls_1.localize)('confirmClearEditorHistoryMessage', "Do you want to clear the history of recently opened editors?"),
                detail: (0, nls_1.localize)('confirmClearDetail', "This action is irreversible!"),
                primaryButton: (0, nls_1.localize)({ key: 'clearButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Clear")
            });
            if (!confirmed) {
                return;
            }
            // Clear editor history
            historyService.clear();
        }
    }
    exports.ClearEditorHistoryAction = ClearEditorHistoryAction;
    class MoveEditorLeftInGroupAction extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.moveEditorLeftInGroup',
                title: { value: (0, nls_1.localize)('moveEditorLeft', "Move Editor Left"), original: 'Move Editor Left' },
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 11 /* KeyCode.PageUp */,
                    mac: {
                        primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 15 /* KeyCode.LeftArrow */)
                    }
                },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, editorCommands_1.MOVE_ACTIVE_EDITOR_COMMAND_ID, { to: 'left' });
        }
    }
    exports.MoveEditorLeftInGroupAction = MoveEditorLeftInGroupAction;
    class MoveEditorRightInGroupAction extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.moveEditorRightInGroup',
                title: { value: (0, nls_1.localize)('moveEditorRight', "Move Editor Right"), original: 'Move Editor Right' },
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 12 /* KeyCode.PageDown */,
                    mac: {
                        primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 17 /* KeyCode.RightArrow */)
                    }
                },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, editorCommands_1.MOVE_ACTIVE_EDITOR_COMMAND_ID, { to: 'right' });
        }
    }
    exports.MoveEditorRightInGroupAction = MoveEditorRightInGroupAction;
    class MoveEditorToPreviousGroupAction extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.moveEditorToPreviousGroup',
                title: { value: (0, nls_1.localize)('moveEditorToPreviousGroup', "Move Editor into Previous Group"), original: 'Move Editor into Previous Group' },
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 15 /* KeyCode.LeftArrow */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 15 /* KeyCode.LeftArrow */
                    }
                },
                f1: true,
                category: actionCommonCategories_1.Categories.View,
            }, editorCommands_1.MOVE_ACTIVE_EDITOR_COMMAND_ID, { to: 'previous', by: 'group' });
        }
    }
    exports.MoveEditorToPreviousGroupAction = MoveEditorToPreviousGroupAction;
    class MoveEditorToNextGroupAction extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.moveEditorToNextGroup',
                title: { value: (0, nls_1.localize)('moveEditorToNextGroup', "Move Editor into Next Group"), original: 'Move Editor into Next Group' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 17 /* KeyCode.RightArrow */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 17 /* KeyCode.RightArrow */
                    }
                },
                category: actionCommonCategories_1.Categories.View
            }, editorCommands_1.MOVE_ACTIVE_EDITOR_COMMAND_ID, { to: 'next', by: 'group' });
        }
    }
    exports.MoveEditorToNextGroupAction = MoveEditorToNextGroupAction;
    class MoveEditorToAboveGroupAction extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.moveEditorToAboveGroup',
                title: { value: (0, nls_1.localize)('moveEditorToAboveGroup', "Move Editor into Group Above"), original: 'Move Editor into Group Above' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, editorCommands_1.MOVE_ACTIVE_EDITOR_COMMAND_ID, { to: 'up', by: 'group' });
        }
    }
    exports.MoveEditorToAboveGroupAction = MoveEditorToAboveGroupAction;
    class MoveEditorToBelowGroupAction extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.moveEditorToBelowGroup',
                title: { value: (0, nls_1.localize)('moveEditorToBelowGroup', "Move Editor into Group Below"), original: 'Move Editor into Group Below' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, editorCommands_1.MOVE_ACTIVE_EDITOR_COMMAND_ID, { to: 'down', by: 'group' });
        }
    }
    exports.MoveEditorToBelowGroupAction = MoveEditorToBelowGroupAction;
    class MoveEditorToLeftGroupAction extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.moveEditorToLeftGroup',
                title: { value: (0, nls_1.localize)('moveEditorToLeftGroup', "Move Editor into Left Group"), original: 'Move Editor into Left Group' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, editorCommands_1.MOVE_ACTIVE_EDITOR_COMMAND_ID, { to: 'left', by: 'group' });
        }
    }
    exports.MoveEditorToLeftGroupAction = MoveEditorToLeftGroupAction;
    class MoveEditorToRightGroupAction extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.moveEditorToRightGroup',
                title: { value: (0, nls_1.localize)('moveEditorToRightGroup', "Move Editor into Right Group"), original: 'Move Editor into Right Group' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, editorCommands_1.MOVE_ACTIVE_EDITOR_COMMAND_ID, { to: 'right', by: 'group' });
        }
    }
    exports.MoveEditorToRightGroupAction = MoveEditorToRightGroupAction;
    class MoveEditorToFirstGroupAction extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.moveEditorToFirstGroup',
                title: { value: (0, nls_1.localize)('moveEditorToFirstGroup', "Move Editor into First Group"), original: 'Move Editor into First Group' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 22 /* KeyCode.Digit1 */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 22 /* KeyCode.Digit1 */
                    }
                },
                category: actionCommonCategories_1.Categories.View
            }, editorCommands_1.MOVE_ACTIVE_EDITOR_COMMAND_ID, { to: 'first', by: 'group' });
        }
    }
    exports.MoveEditorToFirstGroupAction = MoveEditorToFirstGroupAction;
    class MoveEditorToLastGroupAction extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.moveEditorToLastGroup',
                title: { value: (0, nls_1.localize)('moveEditorToLastGroup', "Move Editor into Last Group"), original: 'Move Editor into Last Group' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 30 /* KeyCode.Digit9 */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 30 /* KeyCode.Digit9 */
                    }
                },
                category: actionCommonCategories_1.Categories.View
            }, editorCommands_1.MOVE_ACTIVE_EDITOR_COMMAND_ID, { to: 'last', by: 'group' });
        }
    }
    exports.MoveEditorToLastGroupAction = MoveEditorToLastGroupAction;
    class SplitEditorToPreviousGroupAction extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.splitEditorToPreviousGroup',
                title: { value: (0, nls_1.localize)('splitEditorToPreviousGroup', "Split Editor into Previous Group"), original: 'Split Editor into Previous Group' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, editorCommands_1.COPY_ACTIVE_EDITOR_COMMAND_ID, { to: 'previous', by: 'group' });
        }
    }
    exports.SplitEditorToPreviousGroupAction = SplitEditorToPreviousGroupAction;
    class SplitEditorToNextGroupAction extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.splitEditorToNextGroup',
                title: { value: (0, nls_1.localize)('splitEditorToNextGroup', "Split Editor into Next Group"), original: 'Split Editor into Next Group' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, editorCommands_1.COPY_ACTIVE_EDITOR_COMMAND_ID, { to: 'next', by: 'group' });
        }
    }
    exports.SplitEditorToNextGroupAction = SplitEditorToNextGroupAction;
    class SplitEditorToAboveGroupAction extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.splitEditorToAboveGroup',
                title: { value: (0, nls_1.localize)('splitEditorToAboveGroup', "Split Editor into Group Above"), original: 'Split Editor into Group Above' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, editorCommands_1.COPY_ACTIVE_EDITOR_COMMAND_ID, { to: 'up', by: 'group' });
        }
    }
    exports.SplitEditorToAboveGroupAction = SplitEditorToAboveGroupAction;
    class SplitEditorToBelowGroupAction extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.splitEditorToBelowGroup',
                title: { value: (0, nls_1.localize)('splitEditorToBelowGroup', "Split Editor into Group Below"), original: 'Split Editor into Group Below' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, editorCommands_1.COPY_ACTIVE_EDITOR_COMMAND_ID, { to: 'down', by: 'group' });
        }
    }
    exports.SplitEditorToBelowGroupAction = SplitEditorToBelowGroupAction;
    class SplitEditorToLeftGroupAction extends ExecuteCommandAction {
        static { this.ID = 'workbench.action.splitEditorToLeftGroup'; }
        static { this.LABEL = (0, nls_1.localize)('splitEditorToLeftGroup', "Split Editor into Left Group"); }
        constructor() {
            super({
                id: 'workbench.action.splitEditorToLeftGroup',
                title: { value: (0, nls_1.localize)('splitEditorToLeftGroup', "Split Editor into Left Group"), original: 'Split Editor into Left Group' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, editorCommands_1.COPY_ACTIVE_EDITOR_COMMAND_ID, { to: 'left', by: 'group' });
        }
    }
    exports.SplitEditorToLeftGroupAction = SplitEditorToLeftGroupAction;
    class SplitEditorToRightGroupAction extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.splitEditorToRightGroup',
                title: { value: (0, nls_1.localize)('splitEditorToRightGroup', "Split Editor into Right Group"), original: 'Split Editor into Right Group' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, editorCommands_1.COPY_ACTIVE_EDITOR_COMMAND_ID, { to: 'right', by: 'group' });
        }
    }
    exports.SplitEditorToRightGroupAction = SplitEditorToRightGroupAction;
    class SplitEditorToFirstGroupAction extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.splitEditorToFirstGroup',
                title: { value: (0, nls_1.localize)('splitEditorToFirstGroup', "Split Editor into First Group"), original: 'Split Editor into First Group' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, editorCommands_1.COPY_ACTIVE_EDITOR_COMMAND_ID, { to: 'first', by: 'group' });
        }
    }
    exports.SplitEditorToFirstGroupAction = SplitEditorToFirstGroupAction;
    class SplitEditorToLastGroupAction extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.splitEditorToLastGroup',
                title: { value: (0, nls_1.localize)('splitEditorToLastGroup', "Split Editor into Last Group"), original: 'Split Editor into Last Group' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, editorCommands_1.COPY_ACTIVE_EDITOR_COMMAND_ID, { to: 'last', by: 'group' });
        }
    }
    exports.SplitEditorToLastGroupAction = SplitEditorToLastGroupAction;
    class EditorLayoutSingleAction extends ExecuteCommandAction {
        static { this.ID = 'workbench.action.editorLayoutSingle'; }
        constructor() {
            super({
                id: EditorLayoutSingleAction.ID,
                title: { value: (0, nls_1.localize)('editorLayoutSingle', "Single Column Editor Layout"), original: 'Single Column Editor Layout' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, editorCommands_1.LAYOUT_EDITOR_GROUPS_COMMAND_ID, { groups: [{}] });
        }
    }
    exports.EditorLayoutSingleAction = EditorLayoutSingleAction;
    class EditorLayoutTwoColumnsAction extends ExecuteCommandAction {
        static { this.ID = 'workbench.action.editorLayoutTwoColumns'; }
        constructor() {
            super({
                id: EditorLayoutTwoColumnsAction.ID,
                title: { value: (0, nls_1.localize)('editorLayoutTwoColumns', "Two Columns Editor Layout"), original: 'Two Columns Editor Layout' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, editorCommands_1.LAYOUT_EDITOR_GROUPS_COMMAND_ID, { groups: [{}, {}], orientation: 0 /* GroupOrientation.HORIZONTAL */ });
        }
    }
    exports.EditorLayoutTwoColumnsAction = EditorLayoutTwoColumnsAction;
    class EditorLayoutThreeColumnsAction extends ExecuteCommandAction {
        static { this.ID = 'workbench.action.editorLayoutThreeColumns'; }
        constructor() {
            super({
                id: EditorLayoutThreeColumnsAction.ID,
                title: { value: (0, nls_1.localize)('editorLayoutThreeColumns', "Three Columns Editor Layout"), original: 'Three Columns Editor Layout' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, editorCommands_1.LAYOUT_EDITOR_GROUPS_COMMAND_ID, { groups: [{}, {}, {}], orientation: 0 /* GroupOrientation.HORIZONTAL */ });
        }
    }
    exports.EditorLayoutThreeColumnsAction = EditorLayoutThreeColumnsAction;
    class EditorLayoutTwoRowsAction extends ExecuteCommandAction {
        static { this.ID = 'workbench.action.editorLayoutTwoRows'; }
        constructor() {
            super({
                id: EditorLayoutTwoRowsAction.ID,
                title: { value: (0, nls_1.localize)('editorLayoutTwoRows', "Two Rows Editor Layout"), original: 'Two Rows Editor Layout' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, editorCommands_1.LAYOUT_EDITOR_GROUPS_COMMAND_ID, { groups: [{}, {}], orientation: 1 /* GroupOrientation.VERTICAL */ });
        }
    }
    exports.EditorLayoutTwoRowsAction = EditorLayoutTwoRowsAction;
    class EditorLayoutThreeRowsAction extends ExecuteCommandAction {
        static { this.ID = 'workbench.action.editorLayoutThreeRows'; }
        constructor() {
            super({
                id: EditorLayoutThreeRowsAction.ID,
                title: { value: (0, nls_1.localize)('editorLayoutThreeRows', "Three Rows Editor Layout"), original: 'Three Rows Editor Layout' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, editorCommands_1.LAYOUT_EDITOR_GROUPS_COMMAND_ID, { groups: [{}, {}, {}], orientation: 1 /* GroupOrientation.VERTICAL */ });
        }
    }
    exports.EditorLayoutThreeRowsAction = EditorLayoutThreeRowsAction;
    class EditorLayoutTwoByTwoGridAction extends ExecuteCommandAction {
        static { this.ID = 'workbench.action.editorLayoutTwoByTwoGrid'; }
        constructor() {
            super({
                id: EditorLayoutTwoByTwoGridAction.ID,
                title: { value: (0, nls_1.localize)('editorLayoutTwoByTwoGrid', "Grid Editor Layout (2x2)"), original: 'Grid Editor Layout (2x2)' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, editorCommands_1.LAYOUT_EDITOR_GROUPS_COMMAND_ID, { groups: [{ groups: [{}, {}] }, { groups: [{}, {}] }] });
        }
    }
    exports.EditorLayoutTwoByTwoGridAction = EditorLayoutTwoByTwoGridAction;
    class EditorLayoutTwoColumnsBottomAction extends ExecuteCommandAction {
        static { this.ID = 'workbench.action.editorLayoutTwoColumnsBottom'; }
        constructor() {
            super({
                id: EditorLayoutTwoColumnsBottomAction.ID,
                title: { value: (0, nls_1.localize)('editorLayoutTwoColumnsBottom', "Two Columns Bottom Editor Layout"), original: 'Two Columns Bottom Editor Layout' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, editorCommands_1.LAYOUT_EDITOR_GROUPS_COMMAND_ID, { groups: [{}, { groups: [{}, {}] }], orientation: 1 /* GroupOrientation.VERTICAL */ });
        }
    }
    exports.EditorLayoutTwoColumnsBottomAction = EditorLayoutTwoColumnsBottomAction;
    class EditorLayoutTwoRowsRightAction extends ExecuteCommandAction {
        static { this.ID = 'workbench.action.editorLayoutTwoRowsRight'; }
        constructor() {
            super({
                id: EditorLayoutTwoRowsRightAction.ID,
                title: { value: (0, nls_1.localize)('editorLayoutTwoRowsRight', "Two Rows Right Editor Layout"), original: 'Two Rows Right Editor Layout' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, editorCommands_1.LAYOUT_EDITOR_GROUPS_COMMAND_ID, { groups: [{}, { groups: [{}, {}] }], orientation: 0 /* GroupOrientation.HORIZONTAL */ });
        }
    }
    exports.EditorLayoutTwoRowsRightAction = EditorLayoutTwoRowsRightAction;
    class AbstractCreateEditorGroupAction extends actions_2.Action2 {
        constructor(desc, direction) {
            super(desc);
            this.direction = direction;
        }
        async run(accessor) {
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            // We are about to create a new empty editor group. We make an opiniated
            // decision here whether to focus that new editor group or not based
            // on what is currently focused. If focus is outside the editor area not
            // in the <body>, we do not focus, with the rationale that a user might
            // have focus on a tree/list with the intention to pick an element to
            // open in the new group from that tree/list.
            //
            // If focus is inside the editor area, we want to prevent the situation
            // of an editor having keyboard focus in an inactive editor group
            // (see https://github.com/microsoft/vscode/issues/189256)
            const focusNewGroup = layoutService.hasFocus("workbench.parts.editor" /* Parts.EDITOR_PART */) || document.activeElement === document.body;
            const group = editorGroupService.addGroup(editorGroupService.activeGroup, this.direction);
            editorGroupService.activateGroup(group);
            if (focusNewGroup) {
                group.focus();
            }
        }
    }
    class NewEditorGroupLeftAction extends AbstractCreateEditorGroupAction {
        constructor() {
            super({
                id: 'workbench.action.newGroupLeft',
                title: { value: (0, nls_1.localize)('newGroupLeft', "New Editor Group to the Left"), original: 'New Editor Group to the Left' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, 2 /* GroupDirection.LEFT */);
        }
    }
    exports.NewEditorGroupLeftAction = NewEditorGroupLeftAction;
    class NewEditorGroupRightAction extends AbstractCreateEditorGroupAction {
        constructor() {
            super({
                id: 'workbench.action.newGroupRight',
                title: { value: (0, nls_1.localize)('newGroupRight', "New Editor Group to the Right"), original: 'New Editor Group to the Right' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, 3 /* GroupDirection.RIGHT */);
        }
    }
    exports.NewEditorGroupRightAction = NewEditorGroupRightAction;
    class NewEditorGroupAboveAction extends AbstractCreateEditorGroupAction {
        constructor() {
            super({
                id: 'workbench.action.newGroupAbove',
                title: { value: (0, nls_1.localize)('newGroupAbove', "New Editor Group Above"), original: 'New Editor Group Above' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, 0 /* GroupDirection.UP */);
        }
    }
    exports.NewEditorGroupAboveAction = NewEditorGroupAboveAction;
    class NewEditorGroupBelowAction extends AbstractCreateEditorGroupAction {
        constructor() {
            super({
                id: 'workbench.action.newGroupBelow',
                title: { value: (0, nls_1.localize)('newGroupBelow', "New Editor Group Below"), original: 'New Editor Group Below' },
                f1: true,
                category: actionCommonCategories_1.Categories.View
            }, 1 /* GroupDirection.DOWN */);
        }
    }
    exports.NewEditorGroupBelowAction = NewEditorGroupBelowAction;
    class ToggleEditorTypeAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.toggleEditorType',
                title: { value: (0, nls_1.localize)('toggleEditorType', "Toggle Editor Type"), original: 'Toggle Editor Type' },
                f1: true,
                category: actionCommonCategories_1.Categories.View,
                precondition: contextkeys_1.ActiveEditorAvailableEditorIdsContext
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const editorResolverService = accessor.get(editorResolverService_1.IEditorResolverService);
            const activeEditorPane = editorService.activeEditorPane;
            if (!activeEditorPane) {
                return;
            }
            const activeEditorResource = editor_1.EditorResourceAccessor.getCanonicalUri(activeEditorPane.input);
            if (!activeEditorResource) {
                return;
            }
            const editorIds = editorResolverService.getEditors(activeEditorResource).map(editor => editor.id).filter(id => id !== activeEditorPane.input.editorId);
            if (editorIds.length === 0) {
                return;
            }
            // Replace the current editor with the next avaiable editor type
            await editorService.replaceEditors([
                {
                    editor: activeEditorPane.input,
                    replacement: {
                        resource: activeEditorResource,
                        options: {
                            override: editorIds[0]
                        }
                    }
                }
            ], activeEditorPane.group);
        }
    }
    exports.ToggleEditorTypeAction = ToggleEditorTypeAction;
    class ReOpenInTextEditorAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.reopenTextEditor',
                title: { value: (0, nls_1.localize)('reopenTextEditor', "Reopen Editor With Text Editor"), original: 'Reopen Editor With Text Editor' },
                f1: true,
                category: actionCommonCategories_1.Categories.View,
                precondition: contextkeys_1.ActiveEditorAvailableEditorIdsContext
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const activeEditorPane = editorService.activeEditorPane;
            if (!activeEditorPane) {
                return;
            }
            const activeEditorResource = editor_1.EditorResourceAccessor.getCanonicalUri(activeEditorPane.input);
            if (!activeEditorResource) {
                return;
            }
            // Replace the current editor with the text editor
            await editorService.replaceEditors([
                {
                    editor: activeEditorPane.input,
                    replacement: {
                        resource: activeEditorResource,
                        options: {
                            override: editor_1.DEFAULT_EDITOR_ASSOCIATION.id
                        }
                    }
                }
            ], activeEditorPane.group);
        }
    }
    exports.ReOpenInTextEditorAction = ReOpenInTextEditorAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yQWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL2VkaXRvci9lZGl0b3JBY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWtDaEcsTUFBTSxvQkFBcUIsU0FBUSxpQkFBTztRQUV6QyxZQUNDLElBQStCLEVBQ2QsU0FBaUIsRUFDakIsV0FBcUI7WUFFdEMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBSEssY0FBUyxHQUFULFNBQVMsQ0FBUTtZQUNqQixnQkFBVyxHQUFYLFdBQVcsQ0FBVTtRQUd2QyxDQUFDO1FBRVEsR0FBRyxDQUFDLFFBQTBCO1lBQ3RDLE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMEJBQWUsQ0FBQyxDQUFDO1lBRXJELE9BQU8sY0FBYyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN4RSxDQUFDO0tBQ0Q7SUFFRCxNQUFlLHlCQUEwQixTQUFRLGlCQUFPO1FBRTdDLFlBQVksQ0FBQyxvQkFBMkM7WUFDakUsT0FBTyxJQUFBLHVEQUFpQyxFQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDaEUsQ0FBQztRQUVRLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEIsRUFBRSxPQUEyQjtZQUN6RSxNQUFNLGtCQUFrQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMENBQW9CLENBQUMsQ0FBQztZQUM5RCxNQUFNLG9CQUFvQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUNBQXFCLENBQUMsQ0FBQztZQUVqRSxJQUFBLDRCQUFXLEVBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ25GLENBQUM7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