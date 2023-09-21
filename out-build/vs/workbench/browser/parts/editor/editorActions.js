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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/editor/editorActions", "vs/base/common/actions", "vs/base/common/arrays", "vs/workbench/common/editor", "vs/workbench/common/editor/sideBySideEditorInput", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/services/history/common/history", "vs/platform/keybinding/common/keybinding", "vs/platform/commands/common/commands", "vs/workbench/browser/parts/editor/editorCommands", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/platform/configuration/common/configuration", "vs/platform/workspaces/common/workspaces", "vs/platform/dialogs/common/dialogs", "vs/platform/quickinput/common/quickInput", "vs/workbench/browser/parts/editor/editorQuickAccess", "vs/base/common/codicons", "vs/base/common/themables", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/editor/common/editorResolverService", "vs/base/common/platform", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/base/common/keyCodes", "vs/platform/log/common/log", "vs/platform/action/common/actionCommonCategories", "vs/workbench/common/contextkeys"], function (require, exports, nls_1, actions_1, arrays_1, editor_1, sideBySideEditorInput_1, layoutService_1, history_1, keybinding_1, commands_1, editorCommands_1, editorGroupsService_1, editorService_1, configuration_1, workspaces_1, dialogs_1, quickInput_1, editorQuickAccess_1, codicons_1, themables_1, filesConfigurationService_1, editorResolverService_1, platform_1, actions_2, contextkey_1, keyCodes_1, log_1, actionCommonCategories_1, contextkeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$qxb = exports.$pxb = exports.$oxb = exports.$nxb = exports.$mxb = exports.$lxb = exports.$kxb = exports.$jxb = exports.$ixb = exports.$hxb = exports.$gxb = exports.$fxb = exports.$exb = exports.$dxb = exports.$cxb = exports.$bxb = exports.$axb = exports.$_wb = exports.$$wb = exports.$0wb = exports.$9wb = exports.$8wb = exports.$7wb = exports.$6wb = exports.$5wb = exports.$4wb = exports.$3wb = exports.$2wb = exports.$1wb = exports.$Zwb = exports.$Ywb = exports.$Xwb = exports.$Wwb = exports.$Vwb = exports.$Uwb = exports.$Twb = exports.$Swb = exports.$Rwb = exports.$Qwb = exports.$Pwb = exports.$Owb = exports.$Nwb = exports.$Mwb = exports.$Lwb = exports.$Kwb = exports.$Jwb = exports.$Iwb = exports.$Hwb = exports.$Gwb = exports.$Fwb = exports.$Ewb = exports.$Dwb = exports.$Cwb = exports.$Bwb = exports.$Awb = exports.$zwb = exports.$ywb = exports.$xwb = exports.$wwb = exports.$vwb = exports.$uwb = exports.$twb = exports.$swb = exports.$rwb = exports.$qwb = exports.$pwb = exports.$owb = exports.$nwb = exports.$mwb = exports.$lwb = exports.$kwb = exports.$jwb = exports.$iwb = exports.$hwb = exports.$gwb = exports.$fwb = exports.$ewb = exports.$dwb = exports.$cwb = exports.$bwb = exports.$awb = exports.$_vb = exports.$$vb = exports.$0vb = exports.$9vb = exports.$8vb = exports.$7vb = exports.$6vb = exports.$5vb = exports.$4vb = exports.$3vb = exports.$2vb = exports.$1vb = exports.$Zvb = exports.$Yvb = exports.$Xvb = exports.$Wvb = exports.$Vvb = exports.$Uvb = exports.$Tvb = exports.$Svb = exports.$Rvb = exports.$Qvb = void 0;
    class ExecuteCommandAction extends actions_2.$Wu {
        constructor(desc, a, b) {
            super(desc);
            this.a = a;
            this.b = b;
        }
        run(accessor) {
            const commandService = accessor.get(commands_1.$Fr);
            return commandService.executeCommand(this.a, this.b);
        }
    }
    class AbstractSplitEditorAction extends actions_2.$Wu {
        a(configurationService) {
            return (0, editorGroupsService_1.$8C)(configurationService);
        }
        async run(accessor, context) {
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
            const configurationService = accessor.get(configuration_1.$8h);
            (0, editorCommands_1.$Zub)(editorGroupService, this.a(configurationService), context);
        }
    }
    class $Qvb extends AbstractSplitEditorAction {
        static { this.ID = 'workbench.action.splitEditor'; }
        constructor() {
            super({
                id: $Qvb.ID,
                title: { value: (0, nls_1.localize)(0, null), original: 'Split Editor' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 93 /* KeyCode.Backslash */
                },
                category: actionCommonCategories_1.$Nl.View
            });
        }
    }
    exports.$Qvb = $Qvb;
    class $Rvb extends AbstractSplitEditorAction {
        constructor() {
            super({
                id: 'workbench.action.splitEditorOrthogonal',
                title: { value: (0, nls_1.localize)(1, null), original: 'Split Editor Orthogonal' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 93 /* KeyCode.Backslash */)
                },
                category: actionCommonCategories_1.$Nl.View
            });
        }
        a(configurationService) {
            const direction = (0, editorGroupsService_1.$8C)(configurationService);
            return direction === 3 /* GroupDirection.RIGHT */ ? 1 /* GroupDirection.DOWN */ : 3 /* GroupDirection.RIGHT */;
        }
    }
    exports.$Rvb = $Rvb;
    class $Svb extends ExecuteCommandAction {
        constructor() {
            super({
                id: editorCommands_1.$Iub,
                title: { value: (0, nls_1.localize)(2, null), original: 'Split Editor Left' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 93 /* KeyCode.Backslash */)
                },
                category: actionCommonCategories_1.$Nl.View
            }, editorCommands_1.$Iub);
        }
    }
    exports.$Svb = $Svb;
    class $Tvb extends ExecuteCommandAction {
        constructor() {
            super({
                id: editorCommands_1.$Jub,
                title: { value: (0, nls_1.localize)(3, null), original: 'Split Editor Right' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 93 /* KeyCode.Backslash */)
                },
                category: actionCommonCategories_1.$Nl.View
            }, editorCommands_1.$Jub);
        }
    }
    exports.$Tvb = $Tvb;
    class $Uvb extends ExecuteCommandAction {
        static { this.LABEL = (0, nls_1.localize)(4, null); }
        constructor() {
            super({
                id: editorCommands_1.$Gub,
                title: { value: (0, nls_1.localize)(5, null), original: 'Split Editor Up' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 93 /* KeyCode.Backslash */)
                },
                category: actionCommonCategories_1.$Nl.View
            }, editorCommands_1.$Gub);
        }
    }
    exports.$Uvb = $Uvb;
    class $Vvb extends ExecuteCommandAction {
        static { this.LABEL = (0, nls_1.localize)(6, null); }
        constructor() {
            super({
                id: editorCommands_1.$Hub,
                title: { value: (0, nls_1.localize)(7, null), original: 'Split Editor Down' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 93 /* KeyCode.Backslash */)
                },
                category: actionCommonCategories_1.$Nl.View
            }, editorCommands_1.$Hub);
        }
    }
    exports.$Vvb = $Vvb;
    class $Wvb extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.joinTwoGroups',
                title: { value: (0, nls_1.localize)(8, null), original: 'Join Editor Group with Next Group' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            });
        }
        async run(accessor, context) {
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
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
    exports.$Wvb = $Wvb;
    class $Xvb extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.joinAllGroups',
                title: { value: (0, nls_1.localize)(9, null), original: 'Join All Editor Groups' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            });
        }
        async run(accessor) {
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
            editorGroupService.mergeAllGroups();
        }
    }
    exports.$Xvb = $Xvb;
    class $Yvb extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.navigateEditorGroups',
                title: { value: (0, nls_1.localize)(10, null), original: 'Navigate Between Editor Groups' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            });
        }
        async run(accessor) {
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
            const nextGroup = editorGroupService.findGroup({ location: 2 /* GroupLocation.NEXT */ }, editorGroupService.activeGroup, true);
            nextGroup?.focus();
        }
    }
    exports.$Yvb = $Yvb;
    class $Zvb extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.focusActiveEditorGroup',
                title: { value: (0, nls_1.localize)(11, null), original: 'Focus Active Editor Group' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            });
        }
        async run(accessor) {
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
            editorGroupService.activeGroup.focus();
        }
    }
    exports.$Zvb = $Zvb;
    class AbstractFocusGroupAction extends actions_2.$Wu {
        constructor(desc, a) {
            super(desc);
            this.a = a;
        }
        async run(accessor) {
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
            const group = editorGroupService.findGroup(this.a, editorGroupService.activeGroup, true);
            group?.focus();
        }
    }
    class $1vb extends AbstractFocusGroupAction {
        constructor() {
            super({
                id: 'workbench.action.focusFirstEditorGroup',
                title: { value: (0, nls_1.localize)(12, null), original: 'Focus First Editor Group' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 22 /* KeyCode.Digit1 */
                },
                category: actionCommonCategories_1.$Nl.View
            }, { location: 0 /* GroupLocation.FIRST */ });
        }
    }
    exports.$1vb = $1vb;
    class $2vb extends AbstractFocusGroupAction {
        constructor() {
            super({
                id: 'workbench.action.focusLastEditorGroup',
                title: { value: (0, nls_1.localize)(13, null), original: 'Focus Last Editor Group' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, { location: 1 /* GroupLocation.LAST */ });
        }
    }
    exports.$2vb = $2vb;
    class $3vb extends AbstractFocusGroupAction {
        constructor() {
            super({
                id: 'workbench.action.focusNextGroup',
                title: { value: (0, nls_1.localize)(14, null), original: 'Focus Next Editor Group' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, { location: 2 /* GroupLocation.NEXT */ });
        }
    }
    exports.$3vb = $3vb;
    class $4vb extends AbstractFocusGroupAction {
        constructor() {
            super({
                id: 'workbench.action.focusPreviousGroup',
                title: { value: (0, nls_1.localize)(15, null), original: 'Focus Previous Editor Group' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, { location: 3 /* GroupLocation.PREVIOUS */ });
        }
    }
    exports.$4vb = $4vb;
    class $5vb extends AbstractFocusGroupAction {
        constructor() {
            super({
                id: 'workbench.action.focusLeftGroup',
                title: { value: (0, nls_1.localize)(16, null), original: 'Focus Left Editor Group' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 15 /* KeyCode.LeftArrow */)
                },
                category: actionCommonCategories_1.$Nl.View
            }, { direction: 2 /* GroupDirection.LEFT */ });
        }
    }
    exports.$5vb = $5vb;
    class $6vb extends AbstractFocusGroupAction {
        constructor() {
            super({
                id: 'workbench.action.focusRightGroup',
                title: { value: (0, nls_1.localize)(17, null), original: 'Focus Right Editor Group' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 17 /* KeyCode.RightArrow */)
                },
                category: actionCommonCategories_1.$Nl.View
            }, { direction: 3 /* GroupDirection.RIGHT */ });
        }
    }
    exports.$6vb = $6vb;
    class $7vb extends AbstractFocusGroupAction {
        constructor() {
            super({
                id: 'workbench.action.focusAboveGroup',
                title: { value: (0, nls_1.localize)(18, null), original: 'Focus Editor Group Above' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */)
                },
                category: actionCommonCategories_1.$Nl.View
            }, { direction: 0 /* GroupDirection.UP */ });
        }
    }
    exports.$7vb = $7vb;
    class $8vb extends AbstractFocusGroupAction {
        constructor() {
            super({
                id: 'workbench.action.focusBelowGroup',
                title: { value: (0, nls_1.localize)(19, null), original: 'Focus Editor Group Below' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */)
                },
                category: actionCommonCategories_1.$Nl.View
            }, { direction: 1 /* GroupDirection.DOWN */ });
        }
    }
    exports.$8vb = $8vb;
    let $9vb = class $9vb extends actions_1.$gi {
        static { this.ID = 'workbench.action.closeActiveEditor'; }
        static { this.LABEL = (0, nls_1.localize)(20, null); }
        constructor(id, label, a) {
            super(id, label, themables_1.ThemeIcon.asClassName(codicons_1.$Pj.close));
            this.a = a;
        }
        run(context) {
            return this.a.executeCommand(editorCommands_1.$iub, undefined, context);
        }
    };
    exports.$9vb = $9vb;
    exports.$9vb = $9vb = __decorate([
        __param(2, commands_1.$Fr)
    ], $9vb);
    let $0vb = class $0vb extends actions_1.$gi {
        static { this.ID = 'workbench.action.unpinActiveEditor'; }
        static { this.LABEL = (0, nls_1.localize)(21, null); }
        constructor(id, label, a) {
            super(id, label, themables_1.ThemeIcon.asClassName(codicons_1.$Pj.pinned));
            this.a = a;
        }
        run(context) {
            return this.a.executeCommand(editorCommands_1.$xub, undefined, context);
        }
    };
    exports.$0vb = $0vb;
    exports.$0vb = $0vb = __decorate([
        __param(2, commands_1.$Fr)
    ], $0vb);
    let $$vb = class $$vb extends actions_1.$gi {
        static { this.ID = 'workbench.action.closeActiveEditor'; }
        static { this.LABEL = (0, nls_1.localize)(22, null); }
        constructor(id, label, a) {
            super(id, label, themables_1.ThemeIcon.asClassName(codicons_1.$Pj.close));
            this.a = a;
        }
        async run(context) {
            let group;
            let editorIndex;
            if (context) {
                group = this.a.getGroup(context.groupId);
                if (group) {
                    editorIndex = context.editorIndex; // only allow editor at index if group is valid
                }
            }
            if (!group) {
                group = this.a.activeGroup;
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
    exports.$$vb = $$vb;
    exports.$$vb = $$vb = __decorate([
        __param(2, editorGroupsService_1.$5C)
    ], $$vb);
    class $_vb extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.revertAndCloseActiveEditor',
                title: { value: (0, nls_1.localize)(23, null), original: 'Revert and Close Editor' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const logService = accessor.get(log_1.$5i);
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
    exports.$_vb = $_vb;
    class $awb extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.closeEditorsToTheLeft',
                title: { value: (0, nls_1.localize)(24, null), original: 'Close Editors to the Left in Group' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            });
        }
        async run(accessor, context) {
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
            const { group, editor } = this.a(editorGroupService, context);
            if (group && editor) {
                await group.closeEditors({ direction: 0 /* CloseDirection.LEFT */, except: editor, excludeSticky: true });
            }
        }
        a(editorGroupService, context) {
            if (context) {
                return { editor: context.editor, group: editorGroupService.getGroup(context.groupId) };
            }
            // Fallback to active group
            return { group: editorGroupService.activeGroup, editor: editorGroupService.activeGroup.activeEditor };
        }
    }
    exports.$awb = $awb;
    class AbstractCloseAllAction extends actions_2.$Wu {
        a(editorGroupService) {
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
            const editorService = accessor.get(editorService_1.$9C);
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
            const filesConfigurationService = accessor.get(filesConfigurationService_1.$yD);
            const fileDialogService = accessor.get(dialogs_1.$qA);
            // Depending on the editor and auto save configuration,
            // split editors into buckets for handling confirmation
            const dirtyEditorsWithDefaultConfirm = new Set();
            const dirtyAutoSaveOnFocusChangeEditors = new Set();
            const dirtyAutoSaveOnWindowChangeEditors = new Set();
            const editorsWithCustomConfirm = new Map();
            for (const { editor, groupId } of editorService.getEditors(1 /* EditorsOrder.SEQUENTIAL */, { excludeSticky: this.c })) {
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
                else if ((platform_1.$m && (platform_1.$i || platform_1.$k)) && filesConfigurationService.getAutoSaveMode() === 4 /* AutoSaveMode.ON_WINDOW_CHANGE */ && !editor.hasCapability(4 /* EditorInputCapabilities.Untitled */)) {
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
                await this.b(editors, editorGroupService); // help user make a decision by revealing editors
                const confirmation = await fileDialogService.showSaveConfirm(editors.map(({ editor }) => {
                    if (editor instanceof sideBySideEditorInput_1.$VC) {
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
                await this.b(editors, editorGroupService); // help user make a decision by revealing editors
                const confirmation = await (0, arrays_1.$Mb)(editors)?.editor.closeHandler?.confirm?.(editors);
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
            return this.d(editorGroupService);
        }
        async b(editors, editorGroupService) {
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
        async d(editorGroupService) {
            await Promise.all(this.a(editorGroupService).map(group => group.closeAllEditors({ excludeSticky: this.c })));
        }
    }
    class $bwb extends AbstractCloseAllAction {
        static { this.ID = 'workbench.action.closeAllEditors'; }
        static { this.LABEL = { value: (0, nls_1.localize)(25, null), original: 'Close All Editors' }; }
        constructor() {
            super({
                id: $bwb.ID,
                title: $bwb.LABEL,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 53 /* KeyCode.KeyW */)
                },
                icon: codicons_1.$Pj.closeAll,
                category: actionCommonCategories_1.$Nl.View
            });
        }
        get c() {
            return true; // exclude sticky from this mass-closing operation
        }
    }
    exports.$bwb = $bwb;
    class $cwb extends AbstractCloseAllAction {
        constructor() {
            super({
                id: 'workbench.action.closeAllGroups',
                title: { value: (0, nls_1.localize)(26, null), original: 'Close All Editor Groups' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 53 /* KeyCode.KeyW */)
                },
                category: actionCommonCategories_1.$Nl.View
            });
        }
        get c() {
            return false; // the intent to close groups means, even sticky are included
        }
        async d(editorGroupService) {
            await super.d(editorGroupService);
            for (const groupToClose of this.a(editorGroupService)) {
                editorGroupService.removeGroup(groupToClose);
            }
        }
    }
    exports.$cwb = $cwb;
    class $dwb extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.closeEditorsInOtherGroups',
                title: { value: (0, nls_1.localize)(27, null), original: 'Close Editors in Other Groups' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            });
        }
        async run(accessor, context) {
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
            const groupToSkip = context ? editorGroupService.getGroup(context.groupId) : editorGroupService.activeGroup;
            await Promise.all(editorGroupService.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */).map(async (group) => {
                if (groupToSkip && group.id === groupToSkip.id) {
                    return;
                }
                return group.closeAllEditors({ excludeSticky: true });
            }));
        }
    }
    exports.$dwb = $dwb;
    class $ewb extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.closeEditorInAllGroups',
                title: { value: (0, nls_1.localize)(28, null), original: 'Close Editor in All Groups' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
            const activeEditor = editorService.activeEditor;
            if (activeEditor) {
                await Promise.all(editorGroupService.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */).map(group => group.closeEditor(activeEditor)));
            }
        }
    }
    exports.$ewb = $ewb;
    class AbstractMoveCopyGroupAction extends actions_2.$Wu {
        constructor(desc, a, b) {
            super(desc);
            this.a = a;
            this.b = b;
        }
        async run(accessor, context) {
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
            let sourceGroup;
            if (context && typeof context.groupId === 'number') {
                sourceGroup = editorGroupService.getGroup(context.groupId);
            }
            else {
                sourceGroup = editorGroupService.activeGroup;
            }
            if (sourceGroup) {
                let resultGroup = undefined;
                if (this.b) {
                    const targetGroup = this.c(editorGroupService, sourceGroup);
                    if (targetGroup) {
                        resultGroup = editorGroupService.moveGroup(sourceGroup, targetGroup, this.a);
                    }
                }
                else {
                    resultGroup = editorGroupService.copyGroup(sourceGroup, sourceGroup, this.a);
                }
                if (resultGroup) {
                    editorGroupService.activateGroup(resultGroup);
                }
            }
        }
        c(editorGroupService, sourceGroup) {
            const targetNeighbours = [this.a];
            // Allow the target group to be in alternative locations to support more
            // scenarios of moving the group to the taret location.
            // Helps for https://github.com/microsoft/vscode/issues/50741
            switch (this.a) {
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
    class $fwb extends AbstractMoveGroupAction {
        constructor() {
            super({
                id: 'workbench.action.moveActiveEditorGroupLeft',
                title: { value: (0, nls_1.localize)(29, null), original: 'Move Editor Group Left' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 15 /* KeyCode.LeftArrow */)
                },
                category: actionCommonCategories_1.$Nl.View
            }, 2 /* GroupDirection.LEFT */);
        }
    }
    exports.$fwb = $fwb;
    class $gwb extends AbstractMoveGroupAction {
        constructor() {
            super({
                id: 'workbench.action.moveActiveEditorGroupRight',
                title: { value: (0, nls_1.localize)(30, null), original: 'Move Editor Group Right' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 17 /* KeyCode.RightArrow */)
                },
                category: actionCommonCategories_1.$Nl.View
            }, 3 /* GroupDirection.RIGHT */);
        }
    }
    exports.$gwb = $gwb;
    class $hwb extends AbstractMoveGroupAction {
        constructor() {
            super({
                id: 'workbench.action.moveActiveEditorGroupUp',
                title: { value: (0, nls_1.localize)(31, null), original: 'Move Editor Group Up' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 16 /* KeyCode.UpArrow */)
                },
                category: actionCommonCategories_1.$Nl.View
            }, 0 /* GroupDirection.UP */);
        }
    }
    exports.$hwb = $hwb;
    class $iwb extends AbstractMoveGroupAction {
        constructor() {
            super({
                id: 'workbench.action.moveActiveEditorGroupDown',
                title: { value: (0, nls_1.localize)(32, null), original: 'Move Editor Group Down' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 18 /* KeyCode.DownArrow */)
                },
                category: actionCommonCategories_1.$Nl.View
            }, 1 /* GroupDirection.DOWN */);
        }
    }
    exports.$iwb = $iwb;
    class AbstractDuplicateGroupAction extends AbstractMoveCopyGroupAction {
        constructor(desc, direction) {
            super(desc, direction, false);
        }
    }
    class $jwb extends AbstractDuplicateGroupAction {
        constructor() {
            super({
                id: 'workbench.action.duplicateActiveEditorGroupLeft',
                title: { value: (0, nls_1.localize)(33, null), original: 'Duplicate Editor Group Left' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, 2 /* GroupDirection.LEFT */);
        }
    }
    exports.$jwb = $jwb;
    class $kwb extends AbstractDuplicateGroupAction {
        constructor() {
            super({
                id: 'workbench.action.duplicateActiveEditorGroupRight',
                title: { value: (0, nls_1.localize)(34, null), original: 'Duplicate Editor Group Right' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, 3 /* GroupDirection.RIGHT */);
        }
    }
    exports.$kwb = $kwb;
    class $lwb extends AbstractDuplicateGroupAction {
        constructor() {
            super({
                id: 'workbench.action.duplicateActiveEditorGroupUp',
                title: { value: (0, nls_1.localize)(35, null), original: 'Duplicate Editor Group Up' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, 0 /* GroupDirection.UP */);
        }
    }
    exports.$lwb = $lwb;
    class $mwb extends AbstractDuplicateGroupAction {
        constructor() {
            super({
                id: 'workbench.action.duplicateActiveEditorGroupDown',
                title: { value: (0, nls_1.localize)(36, null), original: 'Duplicate Editor Group Down' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, 1 /* GroupDirection.DOWN */);
        }
    }
    exports.$mwb = $mwb;
    class $nwb extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.minimizeOtherEditors',
                title: { value: (0, nls_1.localize)(37, null), original: 'Maximize Editor Group' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            });
        }
        async run(accessor) {
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
            editorGroupService.arrangeGroups(0 /* GroupsArrangement.MAXIMIZE */);
        }
    }
    exports.$nwb = $nwb;
    class $owb extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.evenEditorWidths',
                title: { value: (0, nls_1.localize)(38, null), original: 'Reset Editor Group Sizes' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            });
        }
        async run(accessor) {
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
            editorGroupService.arrangeGroups(1 /* GroupsArrangement.EVEN */);
        }
    }
    exports.$owb = $owb;
    class $pwb extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.toggleEditorWidths',
                title: { value: (0, nls_1.localize)(39, null), original: 'Toggle Editor Group Sizes' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            });
        }
        async run(accessor) {
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
            editorGroupService.arrangeGroups(2 /* GroupsArrangement.TOGGLE */);
        }
    }
    exports.$pwb = $pwb;
    class $qwb extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.maximizeEditor',
                title: { value: (0, nls_1.localize)(40, null), original: 'Maximize Editor Group and Hide Side Bars' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            });
        }
        async run(accessor) {
            const layoutService = accessor.get(layoutService_1.$Meb);
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
            const editorService = accessor.get(editorService_1.$9C);
            if (editorService.activeEditor) {
                layoutService.setPartHidden(true, "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
                layoutService.setPartHidden(true, "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
                editorGroupService.arrangeGroups(0 /* GroupsArrangement.MAXIMIZE */);
            }
        }
    }
    exports.$qwb = $qwb;
    class AbstractNavigateEditorAction extends actions_2.$Wu {
        async run(accessor) {
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
            const result = this.a(editorGroupService);
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
    class $rwb extends AbstractNavigateEditorAction {
        constructor() {
            super({
                id: 'workbench.action.nextEditor',
                title: { value: (0, nls_1.localize)(41, null), original: 'Open Next Editor' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 12 /* KeyCode.PageDown */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 17 /* KeyCode.RightArrow */,
                        secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 94 /* KeyCode.BracketRight */]
                    }
                },
                category: actionCommonCategories_1.$Nl.View
            });
        }
        a(editorGroupService) {
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
    exports.$rwb = $rwb;
    class $swb extends AbstractNavigateEditorAction {
        constructor() {
            super({
                id: 'workbench.action.previousEditor',
                title: { value: (0, nls_1.localize)(42, null), original: 'Open Previous Editor' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 11 /* KeyCode.PageUp */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 15 /* KeyCode.LeftArrow */,
                        secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 92 /* KeyCode.BracketLeft */]
                    }
                },
                category: actionCommonCategories_1.$Nl.View
            });
        }
        a(editorGroupService) {
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
    exports.$swb = $swb;
    class $twb extends AbstractNavigateEditorAction {
        constructor() {
            super({
                id: 'workbench.action.nextEditorInGroup',
                title: { value: (0, nls_1.localize)(43, null), original: 'Open Next Editor in Group' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 12 /* KeyCode.PageDown */),
                    mac: {
                        primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 17 /* KeyCode.RightArrow */)
                    }
                },
                category: actionCommonCategories_1.$Nl.View
            });
        }
        a(editorGroupService) {
            const group = editorGroupService.activeGroup;
            const editors = group.getEditors(1 /* EditorsOrder.SEQUENTIAL */);
            const index = group.activeEditor ? editors.indexOf(group.activeEditor) : -1;
            return { editor: index + 1 < editors.length ? editors[index + 1] : editors[0], groupId: group.id };
        }
    }
    exports.$twb = $twb;
    class $uwb extends AbstractNavigateEditorAction {
        constructor() {
            super({
                id: 'workbench.action.previousEditorInGroup',
                title: { value: (0, nls_1.localize)(44, null), original: 'Open Previous Editor in Group' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 11 /* KeyCode.PageUp */),
                    mac: {
                        primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 15 /* KeyCode.LeftArrow */)
                    }
                },
                category: actionCommonCategories_1.$Nl.View
            });
        }
        a(editorGroupService) {
            const group = editorGroupService.activeGroup;
            const editors = group.getEditors(1 /* EditorsOrder.SEQUENTIAL */);
            const index = group.activeEditor ? editors.indexOf(group.activeEditor) : -1;
            return { editor: index > 0 ? editors[index - 1] : editors[editors.length - 1], groupId: group.id };
        }
    }
    exports.$uwb = $uwb;
    class $vwb extends AbstractNavigateEditorAction {
        constructor() {
            super({
                id: 'workbench.action.firstEditorInGroup',
                title: { value: (0, nls_1.localize)(45, null), original: 'Open First Editor in Group' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            });
        }
        a(editorGroupService) {
            const group = editorGroupService.activeGroup;
            const editors = group.getEditors(1 /* EditorsOrder.SEQUENTIAL */);
            return { editor: editors[0], groupId: group.id };
        }
    }
    exports.$vwb = $vwb;
    class $wwb extends AbstractNavigateEditorAction {
        constructor() {
            super({
                id: 'workbench.action.lastEditorInGroup',
                title: { value: (0, nls_1.localize)(46, null), original: 'Open Last Editor in Group' },
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
                category: actionCommonCategories_1.$Nl.View
            });
        }
        a(editorGroupService) {
            const group = editorGroupService.activeGroup;
            const editors = group.getEditors(1 /* EditorsOrder.SEQUENTIAL */);
            return { editor: editors[editors.length - 1], groupId: group.id };
        }
    }
    exports.$wwb = $wwb;
    class $xwb extends actions_2.$Wu {
        static { this.ID = 'workbench.action.navigateForward'; }
        static { this.LABEL = (0, nls_1.localize)(47, null); }
        constructor() {
            super({
                id: $xwb.ID,
                title: { value: (0, nls_1.localize)(48, null), original: 'Go Forward', mnemonicTitle: (0, nls_1.localize)(49, null) },
                f1: true,
                icon: codicons_1.$Pj.arrowRight,
                precondition: contextkey_1.$Ii.has('canNavigateForward'),
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    win: { primary: 512 /* KeyMod.Alt */ | 17 /* KeyCode.RightArrow */ },
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 88 /* KeyCode.Minus */ },
                    linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 88 /* KeyCode.Minus */ }
                },
                menu: [
                    { id: actions_2.$Ru.MenubarGoMenu, group: '1_history_nav', order: 2 },
                    { id: actions_2.$Ru.CommandCenter, order: 2 }
                ]
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.$SM);
            await historyService.goForward(0 /* GoFilter.NONE */);
        }
    }
    exports.$xwb = $xwb;
    class $ywb extends actions_2.$Wu {
        static { this.ID = 'workbench.action.navigateBack'; }
        static { this.LABEL = (0, nls_1.localize)(50, null); }
        constructor() {
            super({
                id: $ywb.ID,
                title: { value: (0, nls_1.localize)(51, null), original: 'Go Back', mnemonicTitle: (0, nls_1.localize)(52, null) },
                f1: true,
                precondition: contextkey_1.$Ii.has('canNavigateBack'),
                icon: codicons_1.$Pj.arrowLeft,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    win: { primary: 512 /* KeyMod.Alt */ | 15 /* KeyCode.LeftArrow */ },
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 88 /* KeyCode.Minus */ },
                    linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 88 /* KeyCode.Minus */ }
                },
                menu: [
                    { id: actions_2.$Ru.MenubarGoMenu, group: '1_history_nav', order: 1 },
                    { id: actions_2.$Ru.CommandCenter, order: 1 }
                ]
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.$SM);
            await historyService.goBack(0 /* GoFilter.NONE */);
        }
    }
    exports.$ywb = $ywb;
    class $zwb extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.navigateLast',
                title: { value: (0, nls_1.localize)(53, null), original: 'Go Previous' },
                f1: true
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.$SM);
            await historyService.goPrevious(0 /* GoFilter.NONE */);
        }
    }
    exports.$zwb = $zwb;
    class $Awb extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.navigateForwardInEditLocations',
                title: { value: (0, nls_1.localize)(54, null), original: 'Go Forward in Edit Locations' },
                f1: true
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.$SM);
            await historyService.goForward(1 /* GoFilter.EDITS */);
        }
    }
    exports.$Awb = $Awb;
    class $Bwb extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.navigateBackInEditLocations',
                title: { value: (0, nls_1.localize)(55, null), original: 'Go Back in Edit Locations' },
                f1: true
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.$SM);
            await historyService.goBack(1 /* GoFilter.EDITS */);
        }
    }
    exports.$Bwb = $Bwb;
    class $Cwb extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.navigatePreviousInEditLocations',
                title: { value: (0, nls_1.localize)(56, null), original: 'Go Previous in Edit Locations' },
                f1: true
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.$SM);
            await historyService.goPrevious(1 /* GoFilter.EDITS */);
        }
    }
    exports.$Cwb = $Cwb;
    class $Dwb extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.navigateToLastEditLocation',
                title: { value: (0, nls_1.localize)(57, null), original: 'Go to Last Edit Location' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 47 /* KeyCode.KeyQ */)
                }
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.$SM);
            await historyService.goLast(1 /* GoFilter.EDITS */);
        }
    }
    exports.$Dwb = $Dwb;
    class $Ewb extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.navigateForwardInNavigationLocations',
                title: { value: (0, nls_1.localize)(58, null), original: 'Go Forward in Navigation Locations' },
                f1: true
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.$SM);
            await historyService.goForward(2 /* GoFilter.NAVIGATION */);
        }
    }
    exports.$Ewb = $Ewb;
    class $Fwb extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.navigateBackInNavigationLocations',
                title: { value: (0, nls_1.localize)(59, null), original: 'Go Back in Navigation Locations' },
                f1: true
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.$SM);
            await historyService.goBack(2 /* GoFilter.NAVIGATION */);
        }
    }
    exports.$Fwb = $Fwb;
    class $Gwb extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.navigatePreviousInNavigationLocations',
                title: { value: (0, nls_1.localize)(60, null), original: 'Go Previous in Navigation Locations' },
                f1: true
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.$SM);
            await historyService.goPrevious(2 /* GoFilter.NAVIGATION */);
        }
    }
    exports.$Gwb = $Gwb;
    class $Hwb extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.navigateToLastNavigationLocation',
                title: { value: (0, nls_1.localize)(61, null), original: 'Go to Last Navigation Location' },
                f1: true
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.$SM);
            await historyService.goLast(2 /* GoFilter.NAVIGATION */);
        }
    }
    exports.$Hwb = $Hwb;
    class $Iwb extends actions_2.$Wu {
        static { this.ID = 'workbench.action.reopenClosedEditor'; }
        constructor() {
            super({
                id: $Iwb.ID,
                title: { value: (0, nls_1.localize)(62, null), original: 'Reopen Closed Editor' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 50 /* KeyCode.KeyT */
                },
                category: actionCommonCategories_1.$Nl.View
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.$SM);
            await historyService.reopenLastClosedEditor();
        }
    }
    exports.$Iwb = $Iwb;
    class $Jwb extends actions_2.$Wu {
        static { this.ID = 'workbench.action.clearRecentFiles'; }
        constructor() {
            super({
                id: $Jwb.ID,
                title: { value: (0, nls_1.localize)(63, null), original: 'Clear Recently Opened' },
                f1: true,
                category: actionCommonCategories_1.$Nl.File
            });
        }
        async run(accessor) {
            const dialogService = accessor.get(dialogs_1.$oA);
            const workspacesService = accessor.get(workspaces_1.$fU);
            const historyService = accessor.get(history_1.$SM);
            // Ask for confirmation
            const { confirmed } = await dialogService.confirm({
                type: 'warning',
                message: (0, nls_1.localize)(64, null),
                detail: (0, nls_1.localize)(65, null),
                primaryButton: (0, nls_1.localize)(66, null)
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
    exports.$Jwb = $Jwb;
    class $Kwb extends actions_2.$Wu {
        static { this.ID = 'workbench.action.showEditorsInActiveGroup'; }
        constructor() {
            super({
                id: $Kwb.ID,
                title: { value: (0, nls_1.localize)(67, null), original: 'Show Editors in Active Group By Most Recently Used' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            });
        }
        async run(accessor) {
            const quickInputService = accessor.get(quickInput_1.$Gq);
            quickInputService.quickAccess.show(editorQuickAccess_1.$aub.PREFIX);
        }
    }
    exports.$Kwb = $Kwb;
    class $Lwb extends actions_2.$Wu {
        static { this.ID = 'workbench.action.showAllEditors'; }
        constructor() {
            super({
                id: $Lwb.ID,
                title: { value: (0, nls_1.localize)(68, null), original: 'Show All Editors By Appearance' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 46 /* KeyCode.KeyP */),
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 2 /* KeyCode.Tab */
                    }
                },
                category: actionCommonCategories_1.$Nl.File
            });
        }
        async run(accessor) {
            const quickInputService = accessor.get(quickInput_1.$Gq);
            quickInputService.quickAccess.show(editorQuickAccess_1.$bub.PREFIX);
        }
    }
    exports.$Lwb = $Lwb;
    class $Mwb extends actions_2.$Wu {
        static { this.ID = 'workbench.action.showAllEditorsByMostRecentlyUsed'; }
        constructor() {
            super({
                id: $Mwb.ID,
                title: { value: (0, nls_1.localize)(69, null), original: 'Show All Editors By Most Recently Used' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            });
        }
        async run(accessor) {
            const quickInputService = accessor.get(quickInput_1.$Gq);
            quickInputService.quickAccess.show(editorQuickAccess_1.$cub.PREFIX);
        }
    }
    exports.$Mwb = $Mwb;
    class AbstractQuickAccessEditorAction extends actions_2.$Wu {
        constructor(desc, a, b) {
            super(desc);
            this.a = a;
            this.b = b;
        }
        async run(accessor) {
            const keybindingService = accessor.get(keybinding_1.$2D);
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const keybindings = keybindingService.lookupKeybindings(this.desc.id);
            quickInputService.quickAccess.show(this.a, {
                quickNavigateConfiguration: { keybindings },
                itemActivation: this.b
            });
        }
    }
    class $Nwb extends AbstractQuickAccessEditorAction {
        constructor() {
            super({
                id: 'workbench.action.quickOpenPreviousRecentlyUsedEditor',
                title: { value: (0, nls_1.localize)(70, null), original: 'Quick Open Previous Recently Used Editor' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, editorQuickAccess_1.$cub.PREFIX, undefined);
        }
    }
    exports.$Nwb = $Nwb;
    class $Owb extends AbstractQuickAccessEditorAction {
        constructor() {
            super({
                id: 'workbench.action.quickOpenLeastRecentlyUsedEditor',
                title: { value: (0, nls_1.localize)(71, null), original: 'Quick Open Least Recently Used Editor' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, editorQuickAccess_1.$cub.PREFIX, undefined);
        }
    }
    exports.$Owb = $Owb;
    class $Pwb extends AbstractQuickAccessEditorAction {
        constructor() {
            super({
                id: 'workbench.action.quickOpenPreviousRecentlyUsedEditorInGroup',
                title: { value: (0, nls_1.localize)(72, null), original: 'Quick Open Previous Recently Used Editor in Group' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 2 /* KeyCode.Tab */,
                    mac: {
                        primary: 256 /* KeyMod.WinCtrl */ | 2 /* KeyCode.Tab */
                    }
                },
                precondition: contextkeys_1.$edb.toNegated(),
                category: actionCommonCategories_1.$Nl.View
            }, editorQuickAccess_1.$aub.PREFIX, undefined);
        }
    }
    exports.$Pwb = $Pwb;
    class $Qwb extends AbstractQuickAccessEditorAction {
        constructor() {
            super({
                id: 'workbench.action.quickOpenLeastRecentlyUsedEditorInGroup',
                title: { value: (0, nls_1.localize)(73, null), original: 'Quick Open Least Recently Used Editor in Group' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */,
                    mac: {
                        primary: 256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */
                    }
                },
                precondition: contextkeys_1.$edb.toNegated(),
                category: actionCommonCategories_1.$Nl.View
            }, editorQuickAccess_1.$aub.PREFIX, quickInput_1.ItemActivation.LAST);
        }
    }
    exports.$Qwb = $Qwb;
    class $Rwb extends actions_2.$Wu {
        static { this.a = 'workbench.action.openPreviousEditorFromHistory'; }
        constructor() {
            super({
                id: $Rwb.a,
                title: { value: (0, nls_1.localize)(74, null), original: 'Quick Open Previous Editor from History' },
                f1: true
            });
        }
        async run(accessor) {
            const keybindingService = accessor.get(keybinding_1.$2D);
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
            const keybindings = keybindingService.lookupKeybindings($Rwb.a);
            // Enforce to activate the first item in quick access if
            // the currently active editor group has n editor opened
            let itemActivation = undefined;
            if (editorGroupService.activeGroup.count === 0) {
                itemActivation = quickInput_1.ItemActivation.FIRST;
            }
            quickInputService.quickAccess.show('', { quickNavigateConfiguration: { keybindings }, itemActivation });
        }
    }
    exports.$Rwb = $Rwb;
    class $Swb extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.openNextRecentlyUsedEditor',
                title: { value: (0, nls_1.localize)(75, null), original: 'Open Next Recently Used Editor' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.$SM);
            historyService.openNextRecentlyUsedEditor();
        }
    }
    exports.$Swb = $Swb;
    class $Twb extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.openPreviousRecentlyUsedEditor',
                title: { value: (0, nls_1.localize)(76, null), original: 'Open Previous Recently Used Editor' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.$SM);
            historyService.openPreviouslyUsedEditor();
        }
    }
    exports.$Twb = $Twb;
    class $Uwb extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.openNextRecentlyUsedEditorInGroup',
                title: { value: (0, nls_1.localize)(77, null), original: 'Open Next Recently Used Editor In Group' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.$SM);
            const editorGroupsService = accessor.get(editorGroupsService_1.$5C);
            historyService.openNextRecentlyUsedEditor(editorGroupsService.activeGroup.id);
        }
    }
    exports.$Uwb = $Uwb;
    class $Vwb extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.openPreviousRecentlyUsedEditorInGroup',
                title: { value: (0, nls_1.localize)(78, null), original: 'Open Previous Recently Used Editor In Group' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            });
        }
        async run(accessor) {
            const historyService = accessor.get(history_1.$SM);
            const editorGroupsService = accessor.get(editorGroupsService_1.$5C);
            historyService.openPreviouslyUsedEditor(editorGroupsService.activeGroup.id);
        }
    }
    exports.$Vwb = $Vwb;
    class $Wwb extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.clearEditorHistory',
                title: { value: (0, nls_1.localize)(79, null), original: 'Clear Editor History' },
                f1: true
            });
        }
        async run(accessor) {
            const dialogService = accessor.get(dialogs_1.$oA);
            const historyService = accessor.get(history_1.$SM);
            // Ask for confirmation
            const { confirmed } = await dialogService.confirm({
                type: 'warning',
                message: (0, nls_1.localize)(80, null),
                detail: (0, nls_1.localize)(81, null),
                primaryButton: (0, nls_1.localize)(82, null)
            });
            if (!confirmed) {
                return;
            }
            // Clear editor history
            historyService.clear();
        }
    }
    exports.$Wwb = $Wwb;
    class $Xwb extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.moveEditorLeftInGroup',
                title: { value: (0, nls_1.localize)(83, null), original: 'Move Editor Left' },
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 11 /* KeyCode.PageUp */,
                    mac: {
                        primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 15 /* KeyCode.LeftArrow */)
                    }
                },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, editorCommands_1.$mub, { to: 'left' });
        }
    }
    exports.$Xwb = $Xwb;
    class $Ywb extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.moveEditorRightInGroup',
                title: { value: (0, nls_1.localize)(84, null), original: 'Move Editor Right' },
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 12 /* KeyCode.PageDown */,
                    mac: {
                        primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 17 /* KeyCode.RightArrow */)
                    }
                },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, editorCommands_1.$mub, { to: 'right' });
        }
    }
    exports.$Ywb = $Ywb;
    class $Zwb extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.moveEditorToPreviousGroup',
                title: { value: (0, nls_1.localize)(85, null), original: 'Move Editor into Previous Group' },
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 15 /* KeyCode.LeftArrow */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 15 /* KeyCode.LeftArrow */
                    }
                },
                f1: true,
                category: actionCommonCategories_1.$Nl.View,
            }, editorCommands_1.$mub, { to: 'previous', by: 'group' });
        }
    }
    exports.$Zwb = $Zwb;
    class $1wb extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.moveEditorToNextGroup',
                title: { value: (0, nls_1.localize)(86, null), original: 'Move Editor into Next Group' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 17 /* KeyCode.RightArrow */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 17 /* KeyCode.RightArrow */
                    }
                },
                category: actionCommonCategories_1.$Nl.View
            }, editorCommands_1.$mub, { to: 'next', by: 'group' });
        }
    }
    exports.$1wb = $1wb;
    class $2wb extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.moveEditorToAboveGroup',
                title: { value: (0, nls_1.localize)(87, null), original: 'Move Editor into Group Above' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, editorCommands_1.$mub, { to: 'up', by: 'group' });
        }
    }
    exports.$2wb = $2wb;
    class $3wb extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.moveEditorToBelowGroup',
                title: { value: (0, nls_1.localize)(88, null), original: 'Move Editor into Group Below' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, editorCommands_1.$mub, { to: 'down', by: 'group' });
        }
    }
    exports.$3wb = $3wb;
    class $4wb extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.moveEditorToLeftGroup',
                title: { value: (0, nls_1.localize)(89, null), original: 'Move Editor into Left Group' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, editorCommands_1.$mub, { to: 'left', by: 'group' });
        }
    }
    exports.$4wb = $4wb;
    class $5wb extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.moveEditorToRightGroup',
                title: { value: (0, nls_1.localize)(90, null), original: 'Move Editor into Right Group' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, editorCommands_1.$mub, { to: 'right', by: 'group' });
        }
    }
    exports.$5wb = $5wb;
    class $6wb extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.moveEditorToFirstGroup',
                title: { value: (0, nls_1.localize)(91, null), original: 'Move Editor into First Group' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 22 /* KeyCode.Digit1 */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 22 /* KeyCode.Digit1 */
                    }
                },
                category: actionCommonCategories_1.$Nl.View
            }, editorCommands_1.$mub, { to: 'first', by: 'group' });
        }
    }
    exports.$6wb = $6wb;
    class $7wb extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.moveEditorToLastGroup',
                title: { value: (0, nls_1.localize)(92, null), original: 'Move Editor into Last Group' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 30 /* KeyCode.Digit9 */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 30 /* KeyCode.Digit9 */
                    }
                },
                category: actionCommonCategories_1.$Nl.View
            }, editorCommands_1.$mub, { to: 'last', by: 'group' });
        }
    }
    exports.$7wb = $7wb;
    class $8wb extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.splitEditorToPreviousGroup',
                title: { value: (0, nls_1.localize)(93, null), original: 'Split Editor into Previous Group' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, editorCommands_1.$nub, { to: 'previous', by: 'group' });
        }
    }
    exports.$8wb = $8wb;
    class $9wb extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.splitEditorToNextGroup',
                title: { value: (0, nls_1.localize)(94, null), original: 'Split Editor into Next Group' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, editorCommands_1.$nub, { to: 'next', by: 'group' });
        }
    }
    exports.$9wb = $9wb;
    class $0wb extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.splitEditorToAboveGroup',
                title: { value: (0, nls_1.localize)(95, null), original: 'Split Editor into Group Above' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, editorCommands_1.$nub, { to: 'up', by: 'group' });
        }
    }
    exports.$0wb = $0wb;
    class $$wb extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.splitEditorToBelowGroup',
                title: { value: (0, nls_1.localize)(96, null), original: 'Split Editor into Group Below' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, editorCommands_1.$nub, { to: 'down', by: 'group' });
        }
    }
    exports.$$wb = $$wb;
    class $_wb extends ExecuteCommandAction {
        static { this.ID = 'workbench.action.splitEditorToLeftGroup'; }
        static { this.LABEL = (0, nls_1.localize)(97, null); }
        constructor() {
            super({
                id: 'workbench.action.splitEditorToLeftGroup',
                title: { value: (0, nls_1.localize)(98, null), original: 'Split Editor into Left Group' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, editorCommands_1.$nub, { to: 'left', by: 'group' });
        }
    }
    exports.$_wb = $_wb;
    class $axb extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.splitEditorToRightGroup',
                title: { value: (0, nls_1.localize)(99, null), original: 'Split Editor into Right Group' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, editorCommands_1.$nub, { to: 'right', by: 'group' });
        }
    }
    exports.$axb = $axb;
    class $bxb extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.splitEditorToFirstGroup',
                title: { value: (0, nls_1.localize)(100, null), original: 'Split Editor into First Group' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, editorCommands_1.$nub, { to: 'first', by: 'group' });
        }
    }
    exports.$bxb = $bxb;
    class $cxb extends ExecuteCommandAction {
        constructor() {
            super({
                id: 'workbench.action.splitEditorToLastGroup',
                title: { value: (0, nls_1.localize)(101, null), original: 'Split Editor into Last Group' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, editorCommands_1.$nub, { to: 'last', by: 'group' });
        }
    }
    exports.$cxb = $cxb;
    class $dxb extends ExecuteCommandAction {
        static { this.ID = 'workbench.action.editorLayoutSingle'; }
        constructor() {
            super({
                id: $dxb.ID,
                title: { value: (0, nls_1.localize)(102, null), original: 'Single Column Editor Layout' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, editorCommands_1.$oub, { groups: [{}] });
        }
    }
    exports.$dxb = $dxb;
    class $exb extends ExecuteCommandAction {
        static { this.ID = 'workbench.action.editorLayoutTwoColumns'; }
        constructor() {
            super({
                id: $exb.ID,
                title: { value: (0, nls_1.localize)(103, null), original: 'Two Columns Editor Layout' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, editorCommands_1.$oub, { groups: [{}, {}], orientation: 0 /* GroupOrientation.HORIZONTAL */ });
        }
    }
    exports.$exb = $exb;
    class $fxb extends ExecuteCommandAction {
        static { this.ID = 'workbench.action.editorLayoutThreeColumns'; }
        constructor() {
            super({
                id: $fxb.ID,
                title: { value: (0, nls_1.localize)(104, null), original: 'Three Columns Editor Layout' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, editorCommands_1.$oub, { groups: [{}, {}, {}], orientation: 0 /* GroupOrientation.HORIZONTAL */ });
        }
    }
    exports.$fxb = $fxb;
    class $gxb extends ExecuteCommandAction {
        static { this.ID = 'workbench.action.editorLayoutTwoRows'; }
        constructor() {
            super({
                id: $gxb.ID,
                title: { value: (0, nls_1.localize)(105, null), original: 'Two Rows Editor Layout' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, editorCommands_1.$oub, { groups: [{}, {}], orientation: 1 /* GroupOrientation.VERTICAL */ });
        }
    }
    exports.$gxb = $gxb;
    class $hxb extends ExecuteCommandAction {
        static { this.ID = 'workbench.action.editorLayoutThreeRows'; }
        constructor() {
            super({
                id: $hxb.ID,
                title: { value: (0, nls_1.localize)(106, null), original: 'Three Rows Editor Layout' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, editorCommands_1.$oub, { groups: [{}, {}, {}], orientation: 1 /* GroupOrientation.VERTICAL */ });
        }
    }
    exports.$hxb = $hxb;
    class $ixb extends ExecuteCommandAction {
        static { this.ID = 'workbench.action.editorLayoutTwoByTwoGrid'; }
        constructor() {
            super({
                id: $ixb.ID,
                title: { value: (0, nls_1.localize)(107, null), original: 'Grid Editor Layout (2x2)' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, editorCommands_1.$oub, { groups: [{ groups: [{}, {}] }, { groups: [{}, {}] }] });
        }
    }
    exports.$ixb = $ixb;
    class $jxb extends ExecuteCommandAction {
        static { this.ID = 'workbench.action.editorLayoutTwoColumnsBottom'; }
        constructor() {
            super({
                id: $jxb.ID,
                title: { value: (0, nls_1.localize)(108, null), original: 'Two Columns Bottom Editor Layout' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, editorCommands_1.$oub, { groups: [{}, { groups: [{}, {}] }], orientation: 1 /* GroupOrientation.VERTICAL */ });
        }
    }
    exports.$jxb = $jxb;
    class $kxb extends ExecuteCommandAction {
        static { this.ID = 'workbench.action.editorLayoutTwoRowsRight'; }
        constructor() {
            super({
                id: $kxb.ID,
                title: { value: (0, nls_1.localize)(109, null), original: 'Two Rows Right Editor Layout' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, editorCommands_1.$oub, { groups: [{}, { groups: [{}, {}] }], orientation: 0 /* GroupOrientation.HORIZONTAL */ });
        }
    }
    exports.$kxb = $kxb;
    class AbstractCreateEditorGroupAction extends actions_2.$Wu {
        constructor(desc, a) {
            super(desc);
            this.a = a;
        }
        async run(accessor) {
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
            const layoutService = accessor.get(layoutService_1.$Meb);
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
            const group = editorGroupService.addGroup(editorGroupService.activeGroup, this.a);
            editorGroupService.activateGroup(group);
            if (focusNewGroup) {
                group.focus();
            }
        }
    }
    class $lxb extends AbstractCreateEditorGroupAction {
        constructor() {
            super({
                id: 'workbench.action.newGroupLeft',
                title: { value: (0, nls_1.localize)(110, null), original: 'New Editor Group to the Left' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, 2 /* GroupDirection.LEFT */);
        }
    }
    exports.$lxb = $lxb;
    class $mxb extends AbstractCreateEditorGroupAction {
        constructor() {
            super({
                id: 'workbench.action.newGroupRight',
                title: { value: (0, nls_1.localize)(111, null), original: 'New Editor Group to the Right' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, 3 /* GroupDirection.RIGHT */);
        }
    }
    exports.$mxb = $mxb;
    class $nxb extends AbstractCreateEditorGroupAction {
        constructor() {
            super({
                id: 'workbench.action.newGroupAbove',
                title: { value: (0, nls_1.localize)(112, null), original: 'New Editor Group Above' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, 0 /* GroupDirection.UP */);
        }
    }
    exports.$nxb = $nxb;
    class $oxb extends AbstractCreateEditorGroupAction {
        constructor() {
            super({
                id: 'workbench.action.newGroupBelow',
                title: { value: (0, nls_1.localize)(113, null), original: 'New Editor Group Below' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View
            }, 1 /* GroupDirection.DOWN */);
        }
    }
    exports.$oxb = $oxb;
    class $pxb extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.toggleEditorType',
                title: { value: (0, nls_1.localize)(114, null), original: 'Toggle Editor Type' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View,
                precondition: contextkeys_1.$_cb
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const editorResolverService = accessor.get(editorResolverService_1.$pbb);
            const activeEditorPane = editorService.activeEditorPane;
            if (!activeEditorPane) {
                return;
            }
            const activeEditorResource = editor_1.$3E.getCanonicalUri(activeEditorPane.input);
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
    exports.$pxb = $pxb;
    class $qxb extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.reopenTextEditor',
                title: { value: (0, nls_1.localize)(115, null), original: 'Reopen Editor With Text Editor' },
                f1: true,
                category: actionCommonCategories_1.$Nl.View,
                precondition: contextkeys_1.$_cb
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const activeEditorPane = editorService.activeEditorPane;
            if (!activeEditorPane) {
                return;
            }
            const activeEditorResource = editor_1.$3E.getCanonicalUri(activeEditorPane.input);
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
                            override: editor_1.$HE.id
                        }
                    }
                }
            ], activeEditorPane.group);
        }
    }
    exports.$qxb = $qxb;
});
//# sourceMappingURL=editorActions.js.map