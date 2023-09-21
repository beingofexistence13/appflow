/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/types", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybindingsRegistry", "vs/workbench/common/editor", "vs/workbench/common/contextkeys", "vs/workbench/services/editor/common/editorGroupColumn", "vs/workbench/services/editor/common/editorService", "vs/editor/common/editorContextKeys", "vs/workbench/browser/parts/editor/textDiffEditor", "vs/base/common/keyCodes", "vs/base/common/uri", "vs/platform/quickinput/common/quickInput", "vs/platform/list/browser/listService", "vs/base/browser/ui/list/listWidget", "vs/base/common/arrays", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/contextkey/common/contextkey", "vs/platform/configuration/common/configuration", "vs/platform/commands/common/commands", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/workbench/browser/parts/editor/editorQuickAccess", "vs/platform/opener/common/opener", "vs/platform/editor/common/editor", "vs/base/common/network", "vs/workbench/common/editor/sideBySideEditorInput", "vs/workbench/browser/parts/editor/sideBySideEditor", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/services/path/common/pathService", "vs/platform/telemetry/common/telemetry", "vs/base/common/resources", "vs/workbench/common/editor/diffEditorInput", "vs/editor/browser/editorBrowser", "vs/workbench/services/untitled/common/untitledTextEditorService"], function (require, exports, nls_1, types_1, instantiation_1, keybindingsRegistry_1, editor_1, contextkeys_1, editorGroupColumn_1, editorService_1, editorContextKeys_1, textDiffEditor_1, keyCodes_1, uri_1, quickInput_1, listService_1, listWidget_1, arrays_1, editorGroupsService_1, contextkey_1, configuration_1, commands_1, actions_1, actionCommonCategories_1, editorQuickAccess_1, opener_1, editor_2, network_1, sideBySideEditorInput_1, sideBySideEditor_1, editorResolverService_1, pathService_1, telemetry_1, resources_1, diffEditorInput_1, editorBrowser_1, untitledTextEditorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.setup = exports.getMultiSelectedEditorContexts = exports.splitEditor = exports.API_OPEN_WITH_EDITOR_COMMAND_ID = exports.API_OPEN_DIFF_EDITOR_COMMAND_ID = exports.API_OPEN_EDITOR_COMMAND_ID = exports.OPEN_EDITOR_AT_INDEX_COMMAND_ID = exports.FOCUS_BELOW_GROUP_WITHOUT_WRAP_COMMAND_ID = exports.FOCUS_ABOVE_GROUP_WITHOUT_WRAP_COMMAND_ID = exports.FOCUS_RIGHT_GROUP_WITHOUT_WRAP_COMMAND_ID = exports.FOCUS_LEFT_GROUP_WITHOUT_WRAP_COMMAND_ID = exports.FOCUS_OTHER_SIDE_EDITOR = exports.FOCUS_SECOND_SIDE_EDITOR = exports.FOCUS_FIRST_SIDE_EDITOR = exports.TOGGLE_SPLIT_EDITOR_IN_GROUP_LAYOUT = exports.JOIN_EDITOR_IN_GROUP = exports.TOGGLE_SPLIT_EDITOR_IN_GROUP = exports.SPLIT_EDITOR_IN_GROUP = exports.SPLIT_EDITOR_RIGHT = exports.SPLIT_EDITOR_LEFT = exports.SPLIT_EDITOR_DOWN = exports.SPLIT_EDITOR_UP = exports.TOGGLE_DIFF_IGNORE_TRIM_WHITESPACE = exports.DIFF_OPEN_SIDE = exports.DIFF_FOCUS_OTHER_SIDE = exports.DIFF_FOCUS_SECONDARY_SIDE = exports.DIFF_FOCUS_PRIMARY_SIDE = exports.GOTO_PREVIOUS_CHANGE = exports.GOTO_NEXT_CHANGE = exports.TOGGLE_DIFF_SIDE_BY_SIDE = exports.UNPIN_EDITOR_COMMAND_ID = exports.PIN_EDITOR_COMMAND_ID = exports.REOPEN_WITH_COMMAND_ID = exports.SHOW_EDITORS_IN_GROUP = exports.UNLOCK_GROUP_COMMAND_ID = exports.LOCK_GROUP_COMMAND_ID = exports.TOGGLE_LOCK_GROUP_COMMAND_ID = exports.TOGGLE_KEEP_EDITORS_COMMAND_ID = exports.KEEP_EDITOR_COMMAND_ID = exports.LAYOUT_EDITOR_GROUPS_COMMAND_ID = exports.COPY_ACTIVE_EDITOR_COMMAND_ID = exports.MOVE_ACTIVE_EDITOR_COMMAND_ID = exports.CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID = exports.CLOSE_EDITOR_GROUP_COMMAND_ID = exports.CLOSE_PINNED_EDITOR_COMMAND_ID = exports.CLOSE_EDITOR_COMMAND_ID = exports.CLOSE_EDITORS_TO_THE_RIGHT_COMMAND_ID = exports.CLOSE_EDITORS_AND_GROUP_COMMAND_ID = exports.CLOSE_EDITORS_IN_GROUP_COMMAND_ID = exports.CLOSE_SAVED_EDITORS_COMMAND_ID = void 0;
    exports.CLOSE_SAVED_EDITORS_COMMAND_ID = 'workbench.action.closeUnmodifiedEditors';
    exports.CLOSE_EDITORS_IN_GROUP_COMMAND_ID = 'workbench.action.closeEditorsInGroup';
    exports.CLOSE_EDITORS_AND_GROUP_COMMAND_ID = 'workbench.action.closeEditorsAndGroup';
    exports.CLOSE_EDITORS_TO_THE_RIGHT_COMMAND_ID = 'workbench.action.closeEditorsToTheRight';
    exports.CLOSE_EDITOR_COMMAND_ID = 'workbench.action.closeActiveEditor';
    exports.CLOSE_PINNED_EDITOR_COMMAND_ID = 'workbench.action.closeActivePinnedEditor';
    exports.CLOSE_EDITOR_GROUP_COMMAND_ID = 'workbench.action.closeGroup';
    exports.CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID = 'workbench.action.closeOtherEditors';
    exports.MOVE_ACTIVE_EDITOR_COMMAND_ID = 'moveActiveEditor';
    exports.COPY_ACTIVE_EDITOR_COMMAND_ID = 'copyActiveEditor';
    exports.LAYOUT_EDITOR_GROUPS_COMMAND_ID = 'layoutEditorGroups';
    exports.KEEP_EDITOR_COMMAND_ID = 'workbench.action.keepEditor';
    exports.TOGGLE_KEEP_EDITORS_COMMAND_ID = 'workbench.action.toggleKeepEditors';
    exports.TOGGLE_LOCK_GROUP_COMMAND_ID = 'workbench.action.toggleEditorGroupLock';
    exports.LOCK_GROUP_COMMAND_ID = 'workbench.action.lockEditorGroup';
    exports.UNLOCK_GROUP_COMMAND_ID = 'workbench.action.unlockEditorGroup';
    exports.SHOW_EDITORS_IN_GROUP = 'workbench.action.showEditorsInGroup';
    exports.REOPEN_WITH_COMMAND_ID = 'workbench.action.reopenWithEditor';
    exports.PIN_EDITOR_COMMAND_ID = 'workbench.action.pinEditor';
    exports.UNPIN_EDITOR_COMMAND_ID = 'workbench.action.unpinEditor';
    exports.TOGGLE_DIFF_SIDE_BY_SIDE = 'toggle.diff.renderSideBySide';
    exports.GOTO_NEXT_CHANGE = 'workbench.action.compareEditor.nextChange';
    exports.GOTO_PREVIOUS_CHANGE = 'workbench.action.compareEditor.previousChange';
    exports.DIFF_FOCUS_PRIMARY_SIDE = 'workbench.action.compareEditor.focusPrimarySide';
    exports.DIFF_FOCUS_SECONDARY_SIDE = 'workbench.action.compareEditor.focusSecondarySide';
    exports.DIFF_FOCUS_OTHER_SIDE = 'workbench.action.compareEditor.focusOtherSide';
    exports.DIFF_OPEN_SIDE = 'workbench.action.compareEditor.openSide';
    exports.TOGGLE_DIFF_IGNORE_TRIM_WHITESPACE = 'toggle.diff.ignoreTrimWhitespace';
    exports.SPLIT_EDITOR_UP = 'workbench.action.splitEditorUp';
    exports.SPLIT_EDITOR_DOWN = 'workbench.action.splitEditorDown';
    exports.SPLIT_EDITOR_LEFT = 'workbench.action.splitEditorLeft';
    exports.SPLIT_EDITOR_RIGHT = 'workbench.action.splitEditorRight';
    exports.SPLIT_EDITOR_IN_GROUP = 'workbench.action.splitEditorInGroup';
    exports.TOGGLE_SPLIT_EDITOR_IN_GROUP = 'workbench.action.toggleSplitEditorInGroup';
    exports.JOIN_EDITOR_IN_GROUP = 'workbench.action.joinEditorInGroup';
    exports.TOGGLE_SPLIT_EDITOR_IN_GROUP_LAYOUT = 'workbench.action.toggleSplitEditorInGroupLayout';
    exports.FOCUS_FIRST_SIDE_EDITOR = 'workbench.action.focusFirstSideEditor';
    exports.FOCUS_SECOND_SIDE_EDITOR = 'workbench.action.focusSecondSideEditor';
    exports.FOCUS_OTHER_SIDE_EDITOR = 'workbench.action.focusOtherSideEditor';
    exports.FOCUS_LEFT_GROUP_WITHOUT_WRAP_COMMAND_ID = 'workbench.action.focusLeftGroupWithoutWrap';
    exports.FOCUS_RIGHT_GROUP_WITHOUT_WRAP_COMMAND_ID = 'workbench.action.focusRightGroupWithoutWrap';
    exports.FOCUS_ABOVE_GROUP_WITHOUT_WRAP_COMMAND_ID = 'workbench.action.focusAboveGroupWithoutWrap';
    exports.FOCUS_BELOW_GROUP_WITHOUT_WRAP_COMMAND_ID = 'workbench.action.focusBelowGroupWithoutWrap';
    exports.OPEN_EDITOR_AT_INDEX_COMMAND_ID = 'workbench.action.openEditorAtIndex';
    exports.API_OPEN_EDITOR_COMMAND_ID = '_workbench.open';
    exports.API_OPEN_DIFF_EDITOR_COMMAND_ID = '_workbench.diff';
    exports.API_OPEN_WITH_EDITOR_COMMAND_ID = '_workbench.openWith';
    const isActiveEditorMoveCopyArg = function (arg) {
        if (!(0, types_1.isObject)(arg)) {
            return false;
        }
        if (!(0, types_1.isString)(arg.to)) {
            return false;
        }
        if (!(0, types_1.isUndefined)(arg.by) && !(0, types_1.isString)(arg.by)) {
            return false;
        }
        if (!(0, types_1.isUndefined)(arg.value) && !(0, types_1.isNumber)(arg.value)) {
            return false;
        }
        return true;
    };
    function registerActiveEditorMoveCopyCommand() {
        const moveCopyJSONSchema = {
            'type': 'object',
            'required': ['to'],
            'properties': {
                'to': {
                    'type': 'string',
                    'enum': ['left', 'right']
                },
                'by': {
                    'type': 'string',
                    'enum': ['tab', 'group']
                },
                'value': {
                    'type': 'number'
                }
            }
        };
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.MOVE_ACTIVE_EDITOR_COMMAND_ID,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
            primary: 0,
            handler: (accessor, args) => moveCopyActiveEditor(true, args, accessor),
            description: {
                description: (0, nls_1.localize)('editorCommand.activeEditorMove.description', "Move the active editor by tabs or groups"),
                args: [
                    {
                        name: (0, nls_1.localize)('editorCommand.activeEditorMove.arg.name', "Active editor move argument"),
                        description: (0, nls_1.localize)('editorCommand.activeEditorMove.arg.description', "Argument Properties:\n\t* 'to': String value providing where to move.\n\t* 'by': String value providing the unit for move (by tab or by group).\n\t* 'value': Number value providing how many positions or an absolute position to move."),
                        constraint: isActiveEditorMoveCopyArg,
                        schema: moveCopyJSONSchema
                    }
                ]
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.COPY_ACTIVE_EDITOR_COMMAND_ID,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
            primary: 0,
            handler: (accessor, args) => moveCopyActiveEditor(false, args, accessor),
            description: {
                description: (0, nls_1.localize)('editorCommand.activeEditorCopy.description', "Copy the active editor by groups"),
                args: [
                    {
                        name: (0, nls_1.localize)('editorCommand.activeEditorCopy.arg.name', "Active editor copy argument"),
                        description: (0, nls_1.localize)('editorCommand.activeEditorCopy.arg.description', "Argument Properties:\n\t* 'to': String value providing where to copy.\n\t* 'value': Number value providing how many positions or an absolute position to copy."),
                        constraint: isActiveEditorMoveCopyArg,
                        schema: moveCopyJSONSchema
                    }
                ]
            }
        });
        function moveCopyActiveEditor(isMove, args = Object.create(null), accessor) {
            args.to = args.to || 'right';
            args.by = args.by || 'tab';
            args.value = typeof args.value === 'number' ? args.value : 1;
            const activeEditorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
            if (activeEditorPane) {
                switch (args.by) {
                    case 'tab':
                        if (isMove) {
                            return moveActiveTab(args, activeEditorPane);
                        }
                        break;
                    case 'group':
                        return moveCopyActiveEditorToGroup(isMove, args, activeEditorPane, accessor);
                }
            }
        }
        function moveActiveTab(args, control) {
            const group = control.group;
            let index = group.getIndexOfEditor(control.input);
            switch (args.to) {
                case 'first':
                    index = 0;
                    break;
                case 'last':
                    index = group.count - 1;
                    break;
                case 'left':
                    index = index - args.value;
                    break;
                case 'right':
                    index = index + args.value;
                    break;
                case 'center':
                    index = Math.round(group.count / 2) - 1;
                    break;
                case 'position':
                    index = args.value - 1;
                    break;
            }
            index = index < 0 ? 0 : index >= group.count ? group.count - 1 : index;
            group.moveEditor(control.input, group, { index });
        }
        function moveCopyActiveEditorToGroup(isMove, args, control, accessor) {
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const sourceGroup = control.group;
            let targetGroup;
            switch (args.to) {
                case 'left':
                    targetGroup = editorGroupService.findGroup({ direction: 2 /* GroupDirection.LEFT */ }, sourceGroup);
                    if (!targetGroup) {
                        targetGroup = editorGroupService.addGroup(sourceGroup, 2 /* GroupDirection.LEFT */);
                    }
                    break;
                case 'right':
                    targetGroup = editorGroupService.findGroup({ direction: 3 /* GroupDirection.RIGHT */ }, sourceGroup);
                    if (!targetGroup) {
                        targetGroup = editorGroupService.addGroup(sourceGroup, 3 /* GroupDirection.RIGHT */);
                    }
                    break;
                case 'up':
                    targetGroup = editorGroupService.findGroup({ direction: 0 /* GroupDirection.UP */ }, sourceGroup);
                    if (!targetGroup) {
                        targetGroup = editorGroupService.addGroup(sourceGroup, 0 /* GroupDirection.UP */);
                    }
                    break;
                case 'down':
                    targetGroup = editorGroupService.findGroup({ direction: 1 /* GroupDirection.DOWN */ }, sourceGroup);
                    if (!targetGroup) {
                        targetGroup = editorGroupService.addGroup(sourceGroup, 1 /* GroupDirection.DOWN */);
                    }
                    break;
                case 'first':
                    targetGroup = editorGroupService.findGroup({ location: 0 /* GroupLocation.FIRST */ }, sourceGroup);
                    break;
                case 'last':
                    targetGroup = editorGroupService.findGroup({ location: 1 /* GroupLocation.LAST */ }, sourceGroup);
                    break;
                case 'previous':
                    targetGroup = editorGroupService.findGroup({ location: 3 /* GroupLocation.PREVIOUS */ }, sourceGroup);
                    break;
                case 'next':
                    targetGroup = editorGroupService.findGroup({ location: 2 /* GroupLocation.NEXT */ }, sourceGroup);
                    if (!targetGroup) {
                        targetGroup = editorGroupService.addGroup(sourceGroup, (0, editorGroupsService_1.preferredSideBySideGroupDirection)(configurationService));
                    }
                    break;
                case 'center':
                    targetGroup = editorGroupService.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */)[(editorGroupService.count / 2) - 1];
                    break;
                case 'position':
                    targetGroup = editorGroupService.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */)[args.value - 1];
                    break;
            }
            if (targetGroup) {
                if (isMove) {
                    sourceGroup.moveEditor(control.input, targetGroup);
                }
                else if (sourceGroup.id !== targetGroup.id) {
                    sourceGroup.copyEditor(control.input, targetGroup);
                }
                targetGroup.focus();
            }
        }
    }
    function registerEditorGroupsLayoutCommands() {
        function applyEditorLayout(accessor, layout) {
            if (!layout || typeof layout !== 'object') {
                return;
            }
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            editorGroupService.applyLayout(layout);
        }
        commands_1.CommandsRegistry.registerCommand(exports.LAYOUT_EDITOR_GROUPS_COMMAND_ID, (accessor, args) => {
            applyEditorLayout(accessor, args);
        });
        // API Commands
        commands_1.CommandsRegistry.registerCommand({
            id: 'vscode.setEditorLayout',
            handler: (accessor, args) => applyEditorLayout(accessor, args),
            description: {
                description: 'Set Editor Layout',
                args: [{
                        name: 'args',
                        schema: {
                            'type': 'object',
                            'required': ['groups'],
                            'properties': {
                                'orientation': {
                                    'type': 'number',
                                    'default': 0,
                                    'enum': [0, 1]
                                },
                                'groups': {
                                    '$ref': '#/definitions/editorGroupsSchema',
                                    'default': [{}, {}]
                                }
                            }
                        }
                    }]
            }
        });
        commands_1.CommandsRegistry.registerCommand({
            id: 'vscode.getEditorLayout',
            handler: (accessor) => {
                const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
                return editorGroupService.getLayout();
            },
            description: {
                description: 'Get Editor Layout',
                args: [],
                returns: 'An editor layout object, in the same format as vscode.setEditorLayout'
            }
        });
    }
    function registerDiffEditorCommands() {
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.GOTO_NEXT_CHANGE,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkeys_1.TextCompareEditorVisibleContext,
            primary: 512 /* KeyMod.Alt */ | 63 /* KeyCode.F5 */,
            handler: accessor => navigateInDiffEditor(accessor, true)
        });
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
            command: {
                id: exports.GOTO_NEXT_CHANGE,
                title: { value: (0, nls_1.localize)('compare.nextChange', "Go to Next Change"), original: 'Go to Next Change' },
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.GOTO_PREVIOUS_CHANGE,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkeys_1.TextCompareEditorVisibleContext,
            primary: 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 63 /* KeyCode.F5 */,
            handler: accessor => navigateInDiffEditor(accessor, false)
        });
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
            command: {
                id: exports.GOTO_PREVIOUS_CHANGE,
                title: { value: (0, nls_1.localize)('compare.previousChange', "Go to Previous Change"), original: 'Go to Previous Change' },
            }
        });
        function getActiveTextDiffEditor(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            for (const editor of [editorService.activeEditorPane, ...editorService.visibleEditorPanes]) {
                if (editor instanceof textDiffEditor_1.TextDiffEditor) {
                    return editor;
                }
            }
            return undefined;
        }
        function navigateInDiffEditor(accessor, next) {
            const activeTextDiffEditor = getActiveTextDiffEditor(accessor);
            if (activeTextDiffEditor) {
                activeTextDiffEditor.getControl()?.goToDiff(next ? 'next' : 'previous');
            }
        }
        let FocusTextDiffEditorMode;
        (function (FocusTextDiffEditorMode) {
            FocusTextDiffEditorMode[FocusTextDiffEditorMode["Original"] = 0] = "Original";
            FocusTextDiffEditorMode[FocusTextDiffEditorMode["Modified"] = 1] = "Modified";
            FocusTextDiffEditorMode[FocusTextDiffEditorMode["Toggle"] = 2] = "Toggle";
        })(FocusTextDiffEditorMode || (FocusTextDiffEditorMode = {}));
        function focusInDiffEditor(accessor, mode) {
            const activeTextDiffEditor = getActiveTextDiffEditor(accessor);
            if (activeTextDiffEditor) {
                switch (mode) {
                    case FocusTextDiffEditorMode.Original:
                        activeTextDiffEditor.getControl()?.getOriginalEditor().focus();
                        break;
                    case FocusTextDiffEditorMode.Modified:
                        activeTextDiffEditor.getControl()?.getModifiedEditor().focus();
                        break;
                    case FocusTextDiffEditorMode.Toggle:
                        if (activeTextDiffEditor.getControl()?.getModifiedEditor().hasWidgetFocus()) {
                            return focusInDiffEditor(accessor, FocusTextDiffEditorMode.Original);
                        }
                        else {
                            return focusInDiffEditor(accessor, FocusTextDiffEditorMode.Modified);
                        }
                }
            }
        }
        function toggleDiffSideBySide(accessor) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const newValue = !configurationService.getValue('diffEditor.renderSideBySide');
            configurationService.updateValue('diffEditor.renderSideBySide', newValue);
        }
        function toggleDiffIgnoreTrimWhitespace(accessor) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const newValue = !configurationService.getValue('diffEditor.ignoreTrimWhitespace');
            configurationService.updateValue('diffEditor.ignoreTrimWhitespace', newValue);
        }
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.TOGGLE_DIFF_SIDE_BY_SIDE,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: undefined,
            primary: undefined,
            handler: accessor => toggleDiffSideBySide(accessor)
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.DIFF_FOCUS_PRIMARY_SIDE,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: undefined,
            primary: undefined,
            handler: accessor => focusInDiffEditor(accessor, FocusTextDiffEditorMode.Modified)
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.DIFF_FOCUS_SECONDARY_SIDE,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: undefined,
            primary: undefined,
            handler: accessor => focusInDiffEditor(accessor, FocusTextDiffEditorMode.Original)
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.DIFF_FOCUS_OTHER_SIDE,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: undefined,
            primary: undefined,
            handler: accessor => focusInDiffEditor(accessor, FocusTextDiffEditorMode.Toggle)
        });
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
            command: {
                id: exports.TOGGLE_DIFF_SIDE_BY_SIDE,
                title: {
                    value: (0, nls_1.localize)('toggleInlineView', "Toggle Inline View"),
                    original: 'Compare: Toggle Inline View'
                },
                category: (0, nls_1.localize)('compare', "Compare")
            },
            when: contextkeys_1.TextCompareEditorActiveContext
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.TOGGLE_DIFF_IGNORE_TRIM_WHITESPACE,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: undefined,
            primary: undefined,
            handler: accessor => toggleDiffIgnoreTrimWhitespace(accessor)
        });
    }
    function registerOpenEditorAPICommands() {
        function mixinContext(context, options, column) {
            if (!context) {
                return [options, column];
            }
            return [
                { ...context.editorOptions, ...(options ?? Object.create(null)) },
                context.sideBySide ? editorService_1.SIDE_GROUP : column
            ];
        }
        // partial, renderer-side API command to open editor
        // complements https://github.com/microsoft/vscode/blob/2b164efb0e6a5de3826bff62683eaeafe032284f/src/vs/workbench/api/common/extHostApiCommands.ts#L373
        commands_1.CommandsRegistry.registerCommand({
            id: 'vscode.open',
            handler: (accessor, arg) => {
                accessor.get(commands_1.ICommandService).executeCommand(exports.API_OPEN_EDITOR_COMMAND_ID, arg);
            },
            description: {
                description: 'Opens the provided resource in the editor.',
                args: [{ name: 'Uri' }]
            }
        });
        commands_1.CommandsRegistry.registerCommand(exports.API_OPEN_EDITOR_COMMAND_ID, async function (accessor, resourceArg, columnAndOptions, label, context) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const openerService = accessor.get(opener_1.IOpenerService);
            const pathService = accessor.get(pathService_1.IPathService);
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const untitledTextEditorService = accessor.get(untitledTextEditorService_1.IUntitledTextEditorService);
            const resourceOrString = typeof resourceArg === 'string' ? resourceArg : uri_1.URI.from(resourceArg, true);
            const [columnArg, optionsArg] = columnAndOptions ?? [];
            // use editor options or editor view column or resource scheme
            // as a hint to use the editor service for opening directly
            if (optionsArg || typeof columnArg === 'number' || (0, opener_1.matchesScheme)(resourceOrString, network_1.Schemas.untitled)) {
                const [options, column] = mixinContext(context, optionsArg, columnArg);
                const resource = uri_1.URI.isUri(resourceOrString) ? resourceOrString : uri_1.URI.parse(resourceOrString);
                let input;
                if (untitledTextEditorService.isUntitledWithAssociatedResource(resource)) {
                    // special case for untitled: we are getting a resource with meaningful
                    // path from an extension to use for the untitled editor. as such, we
                    // have to assume it as an associated resource to use when saving. we
                    // do so by setting the `forceUntitled: true` and changing the scheme
                    // to a file based one. the untitled editor service takes care to
                    // associate the path properly then.
                    input = { resource: resource.with({ scheme: pathService.defaultUriScheme }), forceUntitled: true, options, label };
                }
                else {
                    // use any other resource as is
                    input = { resource, options, label };
                }
                await editorService.openEditor(input, (0, editorGroupColumn_1.columnToEditorGroup)(editorGroupService, configurationService, column));
            }
            // do not allow to execute commands from here
            else if ((0, opener_1.matchesScheme)(resourceOrString, network_1.Schemas.command)) {
                return;
            }
            // finally, delegate to opener service
            else {
                await openerService.open(resourceOrString, { openToSide: context?.sideBySide, editorOptions: context?.editorOptions });
            }
        });
        // partial, renderer-side API command to open diff editor
        // complements https://github.com/microsoft/vscode/blob/2b164efb0e6a5de3826bff62683eaeafe032284f/src/vs/workbench/api/common/extHostApiCommands.ts#L397
        commands_1.CommandsRegistry.registerCommand({
            id: 'vscode.diff',
            handler: (accessor, left, right, label) => {
                accessor.get(commands_1.ICommandService).executeCommand(exports.API_OPEN_DIFF_EDITOR_COMMAND_ID, left, right, label);
            },
            description: {
                description: 'Opens the provided resources in the diff editor to compare their contents.',
                args: [
                    { name: 'left', description: 'Left-hand side resource of the diff editor' },
                    { name: 'right', description: 'Right-hand side resource of the diff editor' },
                    { name: 'title', description: 'Human readable title for the diff editor' },
                ]
            }
        });
        commands_1.CommandsRegistry.registerCommand(exports.API_OPEN_DIFF_EDITOR_COMMAND_ID, async function (accessor, originalResource, modifiedResource, labelAndOrDescription, columnAndOptions, context) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const [columnArg, optionsArg] = columnAndOptions ?? [];
            const [options, column] = mixinContext(context, optionsArg, columnArg);
            let label = undefined;
            let description = undefined;
            if (typeof labelAndOrDescription === 'string') {
                label = labelAndOrDescription;
            }
            else if (labelAndOrDescription) {
                label = labelAndOrDescription.label;
                description = labelAndOrDescription.description;
            }
            await editorService.openEditor({
                original: { resource: uri_1.URI.from(originalResource, true) },
                modified: { resource: uri_1.URI.from(modifiedResource, true) },
                label,
                description,
                options
            }, (0, editorGroupColumn_1.columnToEditorGroup)(editorGroupService, configurationService, column));
        });
        commands_1.CommandsRegistry.registerCommand(exports.API_OPEN_WITH_EDITOR_COMMAND_ID, async (accessor, resource, id, columnAndOptions) => {
            const editorService = accessor.get(editorService_1.IEditorService);
            const editorGroupsService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const [columnArg, optionsArg] = columnAndOptions ?? [];
            await editorService.openEditor({ resource: uri_1.URI.from(resource, true), options: { ...optionsArg, pinned: true, override: id } }, (0, editorGroupColumn_1.columnToEditorGroup)(editorGroupsService, configurationService, columnArg));
        });
    }
    function registerOpenEditorAtIndexCommands() {
        const openEditorAtIndex = (accessor, editorIndex) => {
            const editorService = accessor.get(editorService_1.IEditorService);
            const activeEditorPane = editorService.activeEditorPane;
            if (activeEditorPane) {
                const editor = activeEditorPane.group.getEditorByIndex(editorIndex);
                if (editor) {
                    editorService.openEditor(editor);
                }
            }
        };
        // This command takes in the editor index number to open as an argument
        commands_1.CommandsRegistry.registerCommand({
            id: exports.OPEN_EDITOR_AT_INDEX_COMMAND_ID,
            handler: openEditorAtIndex
        });
        // Keybindings to focus a specific index in the tab folder if tabs are enabled
        for (let i = 0; i < 9; i++) {
            const editorIndex = i;
            const visibleIndex = i + 1;
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: exports.OPEN_EDITOR_AT_INDEX_COMMAND_ID + visibleIndex,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: undefined,
                primary: 512 /* KeyMod.Alt */ | toKeyCode(visibleIndex),
                mac: { primary: 256 /* KeyMod.WinCtrl */ | toKeyCode(visibleIndex) },
                handler: accessor => openEditorAtIndex(accessor, editorIndex)
            });
        }
        function toKeyCode(index) {
            switch (index) {
                case 0: return 21 /* KeyCode.Digit0 */;
                case 1: return 22 /* KeyCode.Digit1 */;
                case 2: return 23 /* KeyCode.Digit2 */;
                case 3: return 24 /* KeyCode.Digit3 */;
                case 4: return 25 /* KeyCode.Digit4 */;
                case 5: return 26 /* KeyCode.Digit5 */;
                case 6: return 27 /* KeyCode.Digit6 */;
                case 7: return 28 /* KeyCode.Digit7 */;
                case 8: return 29 /* KeyCode.Digit8 */;
                case 9: return 30 /* KeyCode.Digit9 */;
            }
            throw new Error('invalid index');
        }
    }
    function registerFocusEditorGroupAtIndexCommands() {
        // Keybindings to focus a specific group (2-8) in the editor area
        for (let groupIndex = 1; groupIndex < 8; groupIndex++) {
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: toCommandId(groupIndex),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: undefined,
                primary: 2048 /* KeyMod.CtrlCmd */ | toKeyCode(groupIndex),
                handler: accessor => {
                    const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
                    const configurationService = accessor.get(configuration_1.IConfigurationService);
                    // To keep backwards compatibility (pre-grid), allow to focus a group
                    // that does not exist as long as it is the next group after the last
                    // opened group. Otherwise we return.
                    if (groupIndex > editorGroupService.count) {
                        return;
                    }
                    // Group exists: just focus
                    const groups = editorGroupService.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */);
                    if (groups[groupIndex]) {
                        return groups[groupIndex].focus();
                    }
                    // Group does not exist: create new by splitting the active one of the last group
                    const direction = (0, editorGroupsService_1.preferredSideBySideGroupDirection)(configurationService);
                    const lastGroup = editorGroupService.findGroup({ location: 1 /* GroupLocation.LAST */ });
                    if (!lastGroup) {
                        return;
                    }
                    const newGroup = editorGroupService.addGroup(lastGroup, direction);
                    // Focus
                    newGroup.focus();
                }
            });
        }
        function toCommandId(index) {
            switch (index) {
                case 1: return 'workbench.action.focusSecondEditorGroup';
                case 2: return 'workbench.action.focusThirdEditorGroup';
                case 3: return 'workbench.action.focusFourthEditorGroup';
                case 4: return 'workbench.action.focusFifthEditorGroup';
                case 5: return 'workbench.action.focusSixthEditorGroup';
                case 6: return 'workbench.action.focusSeventhEditorGroup';
                case 7: return 'workbench.action.focusEighthEditorGroup';
            }
            throw new Error('Invalid index');
        }
        function toKeyCode(index) {
            switch (index) {
                case 1: return 23 /* KeyCode.Digit2 */;
                case 2: return 24 /* KeyCode.Digit3 */;
                case 3: return 25 /* KeyCode.Digit4 */;
                case 4: return 26 /* KeyCode.Digit5 */;
                case 5: return 27 /* KeyCode.Digit6 */;
                case 6: return 28 /* KeyCode.Digit7 */;
                case 7: return 29 /* KeyCode.Digit8 */;
            }
            throw new Error('Invalid index');
        }
    }
    function splitEditor(editorGroupService, direction, context) {
        let sourceGroup;
        if (context && typeof context.groupId === 'number') {
            sourceGroup = editorGroupService.getGroup(context.groupId);
        }
        else {
            sourceGroup = editorGroupService.activeGroup;
        }
        if (!sourceGroup) {
            return;
        }
        // Add group
        const newGroup = editorGroupService.addGroup(sourceGroup, direction);
        // Split editor (if it can be split)
        let editorToCopy;
        if (context && typeof context.editorIndex === 'number') {
            editorToCopy = sourceGroup.getEditorByIndex(context.editorIndex);
        }
        else {
            editorToCopy = sourceGroup.activeEditor ?? undefined;
        }
        // Copy the editor to the new group, else create an empty group
        if (editorToCopy && !editorToCopy.hasCapability(8 /* EditorInputCapabilities.Singleton */)) {
            sourceGroup.copyEditor(editorToCopy, newGroup, { preserveFocus: context?.preserveFocus });
        }
        // Focus
        newGroup.focus();
    }
    exports.splitEditor = splitEditor;
    function registerSplitEditorCommands() {
        [
            { id: exports.SPLIT_EDITOR_UP, direction: 0 /* GroupDirection.UP */ },
            { id: exports.SPLIT_EDITOR_DOWN, direction: 1 /* GroupDirection.DOWN */ },
            { id: exports.SPLIT_EDITOR_LEFT, direction: 2 /* GroupDirection.LEFT */ },
            { id: exports.SPLIT_EDITOR_RIGHT, direction: 3 /* GroupDirection.RIGHT */ }
        ].forEach(({ id, direction }) => {
            commands_1.CommandsRegistry.registerCommand(id, function (accessor, resourceOrContext, context) {
                splitEditor(accessor.get(editorGroupsService_1.IEditorGroupsService), direction, getCommandsContext(resourceOrContext, context));
            });
        });
    }
    function registerCloseEditorCommands() {
        // A special handler for "Close Editor" depending on context
        // - keybindining: do not close sticky editors, rather open the next non-sticky editor
        // - menu: always close editor, even sticky ones
        function closeEditorHandler(accessor, forceCloseStickyEditors, resourceOrContext, context) {
            const editorGroupsService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const editorService = accessor.get(editorService_1.IEditorService);
            let keepStickyEditors = undefined;
            if (forceCloseStickyEditors) {
                keepStickyEditors = false; // explicitly close sticky editors
            }
            else if (resourceOrContext || context) {
                keepStickyEditors = false; // we have a context, as such this command was used e.g. from the tab context menu
            }
            else {
                keepStickyEditors = editorGroupsService.partOptions.preventPinnedEditorClose === 'keyboard' || editorGroupsService.partOptions.preventPinnedEditorClose === 'keyboardAndMouse'; // respect setting otherwise
            }
            // Skip over sticky editor and select next if we are configured to do so
            if (keepStickyEditors) {
                const activeGroup = editorGroupsService.activeGroup;
                const activeEditor = activeGroup.activeEditor;
                if (activeEditor && activeGroup.isSticky(activeEditor)) {
                    // Open next recently active in same group
                    const nextNonStickyEditorInGroup = activeGroup.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */, { excludeSticky: true })[0];
                    if (nextNonStickyEditorInGroup) {
                        return activeGroup.openEditor(nextNonStickyEditorInGroup);
                    }
                    // Open next recently active across all groups
                    const nextNonStickyEditorInAllGroups = editorService.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */, { excludeSticky: true })[0];
                    if (nextNonStickyEditorInAllGroups) {
                        return Promise.resolve(editorGroupsService.getGroup(nextNonStickyEditorInAllGroups.groupId)?.openEditor(nextNonStickyEditorInAllGroups.editor));
                    }
                }
            }
            // With context: proceed to close editors as instructed
            const { editors, groups } = getEditorsContext(accessor, resourceOrContext, context);
            return Promise.all(groups.map(async (group) => {
                if (group) {
                    const editorsToClose = (0, arrays_1.coalesce)(editors
                        .filter(editor => editor.groupId === group.id)
                        .map(editor => typeof editor.editorIndex === 'number' ? group.getEditorByIndex(editor.editorIndex) : group.activeEditor))
                        .filter(editor => !keepStickyEditors || !group.isSticky(editor));
                    await group.closeEditors(editorsToClose, { preserveFocus: context?.preserveFocus });
                }
            }));
        }
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.CLOSE_EDITOR_COMMAND_ID,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: undefined,
            primary: 2048 /* KeyMod.CtrlCmd */ | 53 /* KeyCode.KeyW */,
            win: { primary: 2048 /* KeyMod.CtrlCmd */ | 62 /* KeyCode.F4 */, secondary: [2048 /* KeyMod.CtrlCmd */ | 53 /* KeyCode.KeyW */] },
            handler: (accessor, resourceOrContext, context) => {
                return closeEditorHandler(accessor, false, resourceOrContext, context);
            }
        });
        commands_1.CommandsRegistry.registerCommand(exports.CLOSE_PINNED_EDITOR_COMMAND_ID, (accessor, resourceOrContext, context) => {
            return closeEditorHandler(accessor, true /* force close pinned editors */, resourceOrContext, context);
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.CLOSE_EDITORS_IN_GROUP_COMMAND_ID,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: undefined,
            primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 53 /* KeyCode.KeyW */),
            handler: (accessor, resourceOrContext, context) => {
                return Promise.all(getEditorsContext(accessor, resourceOrContext, context).groups.map(async (group) => {
                    if (group) {
                        await group.closeAllEditors({ excludeSticky: true });
                        return;
                    }
                }));
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.CLOSE_EDITOR_GROUP_COMMAND_ID,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkey_1.ContextKeyExpr.and(contextkeys_1.ActiveEditorGroupEmptyContext, contextkeys_1.MultipleEditorGroupsContext),
            primary: 2048 /* KeyMod.CtrlCmd */ | 53 /* KeyCode.KeyW */,
            win: { primary: 2048 /* KeyMod.CtrlCmd */ | 62 /* KeyCode.F4 */, secondary: [2048 /* KeyMod.CtrlCmd */ | 53 /* KeyCode.KeyW */] },
            handler: (accessor, resourceOrContext, context) => {
                const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
                const commandsContext = getCommandsContext(resourceOrContext, context);
                let group;
                if (commandsContext && typeof commandsContext.groupId === 'number') {
                    group = editorGroupService.getGroup(commandsContext.groupId);
                }
                else {
                    group = editorGroupService.activeGroup;
                }
                if (group) {
                    editorGroupService.removeGroup(group);
                }
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.CLOSE_SAVED_EDITORS_COMMAND_ID,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: undefined,
            primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 51 /* KeyCode.KeyU */),
            handler: (accessor, resourceOrContext, context) => {
                return Promise.all(getEditorsContext(accessor, resourceOrContext, context).groups.map(async (group) => {
                    if (group) {
                        await group.closeEditors({ savedOnly: true, excludeSticky: true }, { preserveFocus: context?.preserveFocus });
                    }
                }));
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: undefined,
            primary: undefined,
            mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 50 /* KeyCode.KeyT */ },
            handler: (accessor, resourceOrContext, context) => {
                const { editors, groups } = getEditorsContext(accessor, resourceOrContext, context);
                return Promise.all(groups.map(async (group) => {
                    if (group) {
                        const editorsToKeep = editors
                            .filter(editor => editor.groupId === group.id)
                            .map(editor => typeof editor.editorIndex === 'number' ? group.getEditorByIndex(editor.editorIndex) : group.activeEditor);
                        const editorsToClose = group.getEditors(1 /* EditorsOrder.SEQUENTIAL */, { excludeSticky: true }).filter(editor => !editorsToKeep.includes(editor));
                        for (const editorToKeep of editorsToKeep) {
                            if (editorToKeep) {
                                group.pinEditor(editorToKeep);
                            }
                        }
                        await group.closeEditors(editorsToClose, { preserveFocus: context?.preserveFocus });
                    }
                }));
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.CLOSE_EDITORS_TO_THE_RIGHT_COMMAND_ID,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: undefined,
            primary: undefined,
            handler: async (accessor, resourceOrContext, context) => {
                const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
                const { group, editor } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
                if (group && editor) {
                    if (group.activeEditor) {
                        group.pinEditor(group.activeEditor);
                    }
                    await group.closeEditors({ direction: 1 /* CloseDirection.RIGHT */, except: editor, excludeSticky: true }, { preserveFocus: context?.preserveFocus });
                }
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.REOPEN_WITH_COMMAND_ID,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: undefined,
            primary: undefined,
            handler: async (accessor, resourceOrContext, context) => {
                const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
                const editorService = accessor.get(editorService_1.IEditorService);
                const editorResolverService = accessor.get(editorResolverService_1.IEditorResolverService);
                const telemetryService = accessor.get(telemetry_1.ITelemetryService);
                const { group, editor } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
                if (!editor) {
                    return;
                }
                const untypedEditor = editor.toUntyped();
                // Resolver can only resolve untyped editors
                if (!untypedEditor) {
                    return;
                }
                untypedEditor.options = { ...editorService.activeEditorPane?.options, override: editor_2.EditorResolution.PICK };
                const resolvedEditor = await editorResolverService.resolveEditor(untypedEditor, group);
                if (!(0, editor_1.isEditorInputWithOptionsAndGroup)(resolvedEditor)) {
                    return;
                }
                // Replace editor with resolved one
                await resolvedEditor.group.replaceEditors([
                    {
                        editor: editor,
                        replacement: resolvedEditor.editor,
                        forceReplaceDirty: editor.resource?.scheme === network_1.Schemas.untitled,
                        options: resolvedEditor.options
                    }
                ]);
                telemetryService.publicLog2('workbenchEditorReopen', {
                    scheme: editor.resource?.scheme ?? '',
                    ext: editor.resource ? (0, resources_1.extname)(editor.resource) : '',
                    from: editor.editorId ?? '',
                    to: resolvedEditor.editor.editorId ?? ''
                });
                // Make sure it becomes active too
                await resolvedEditor.group.openEditor(resolvedEditor.editor);
            }
        });
        commands_1.CommandsRegistry.registerCommand(exports.CLOSE_EDITORS_AND_GROUP_COMMAND_ID, async (accessor, resourceOrContext, context) => {
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const { group } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
            if (group) {
                await group.closeAllEditors();
                if (group.count === 0 && editorGroupService.getGroup(group.id) /* could be gone by now */) {
                    editorGroupService.removeGroup(group); // only remove group if it is now empty
                }
            }
        });
    }
    function registerFocusEditorGroupWihoutWrapCommands() {
        const commands = [
            {
                id: exports.FOCUS_LEFT_GROUP_WITHOUT_WRAP_COMMAND_ID,
                direction: 2 /* GroupDirection.LEFT */
            },
            {
                id: exports.FOCUS_RIGHT_GROUP_WITHOUT_WRAP_COMMAND_ID,
                direction: 3 /* GroupDirection.RIGHT */
            },
            {
                id: exports.FOCUS_ABOVE_GROUP_WITHOUT_WRAP_COMMAND_ID,
                direction: 0 /* GroupDirection.UP */,
            },
            {
                id: exports.FOCUS_BELOW_GROUP_WITHOUT_WRAP_COMMAND_ID,
                direction: 1 /* GroupDirection.DOWN */
            }
        ];
        for (const command of commands) {
            commands_1.CommandsRegistry.registerCommand(command.id, async (accessor) => {
                const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
                const group = editorGroupService.findGroup({ direction: command.direction }, editorGroupService.activeGroup, false);
                group?.focus();
            });
        }
    }
    function registerSplitEditorInGroupCommands() {
        async function splitEditorInGroup(accessor, resourceOrContext, context) {
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const { group, editor } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
            if (!editor) {
                return;
            }
            await group.replaceEditors([{
                    editor,
                    replacement: instantiationService.createInstance(sideBySideEditorInput_1.SideBySideEditorInput, undefined, undefined, editor, editor),
                    forceReplaceDirty: true
                }]);
        }
        (0, actions_1.registerAction2)(class extends actions_1.Action2 {
            constructor() {
                super({
                    id: exports.SPLIT_EDITOR_IN_GROUP,
                    title: { value: (0, nls_1.localize)('splitEditorInGroup', "Split Editor in Group"), original: 'Split Editor in Group' },
                    category: actionCommonCategories_1.Categories.View,
                    precondition: contextkeys_1.ActiveEditorCanSplitInGroupContext,
                    f1: true,
                    keybinding: {
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: contextkeys_1.ActiveEditorCanSplitInGroupContext,
                        primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 93 /* KeyCode.Backslash */)
                    }
                });
            }
            run(accessor, resourceOrContext, context) {
                return splitEditorInGroup(accessor, resourceOrContext, context);
            }
        });
        async function joinEditorInGroup(accessor, resourceOrContext, context) {
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const { group, editor } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
            if (!(editor instanceof sideBySideEditorInput_1.SideBySideEditorInput)) {
                return;
            }
            let options = undefined;
            const activeEditorPane = group.activeEditorPane;
            if (activeEditorPane instanceof sideBySideEditor_1.SideBySideEditor && group.activeEditor === editor) {
                for (const pane of [activeEditorPane.getPrimaryEditorPane(), activeEditorPane.getSecondaryEditorPane()]) {
                    if (pane?.hasFocus()) {
                        options = { viewState: pane.getViewState() };
                        break;
                    }
                }
            }
            await group.replaceEditors([{
                    editor,
                    replacement: editor.primary,
                    options
                }]);
        }
        (0, actions_1.registerAction2)(class extends actions_1.Action2 {
            constructor() {
                super({
                    id: exports.JOIN_EDITOR_IN_GROUP,
                    title: { value: (0, nls_1.localize)('joinEditorInGroup', "Join Editor in Group"), original: 'Join Editor in Group' },
                    category: actionCommonCategories_1.Categories.View,
                    precondition: contextkeys_1.SideBySideEditorActiveContext,
                    f1: true,
                    keybinding: {
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: contextkeys_1.SideBySideEditorActiveContext,
                        primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 93 /* KeyCode.Backslash */)
                    }
                });
            }
            run(accessor, resourceOrContext, context) {
                return joinEditorInGroup(accessor, resourceOrContext, context);
            }
        });
        (0, actions_1.registerAction2)(class extends actions_1.Action2 {
            constructor() {
                super({
                    id: exports.TOGGLE_SPLIT_EDITOR_IN_GROUP,
                    title: { value: (0, nls_1.localize)('toggleJoinEditorInGroup', "Toggle Split Editor in Group"), original: 'Toggle Split Editor in Group' },
                    category: actionCommonCategories_1.Categories.View,
                    precondition: contextkey_1.ContextKeyExpr.or(contextkeys_1.ActiveEditorCanSplitInGroupContext, contextkeys_1.SideBySideEditorActiveContext),
                    f1: true
                });
            }
            async run(accessor, resourceOrContext, context) {
                const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
                const { editor } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
                if (editor instanceof sideBySideEditorInput_1.SideBySideEditorInput) {
                    await joinEditorInGroup(accessor, resourceOrContext, context);
                }
                else if (editor) {
                    await splitEditorInGroup(accessor, resourceOrContext, context);
                }
            }
        });
        (0, actions_1.registerAction2)(class extends actions_1.Action2 {
            constructor() {
                super({
                    id: exports.TOGGLE_SPLIT_EDITOR_IN_GROUP_LAYOUT,
                    title: { value: (0, nls_1.localize)('toggleSplitEditorInGroupLayout', "Toggle Layout of Split Editor in Group"), original: 'Toggle Layout of Split Editor in Group' },
                    category: actionCommonCategories_1.Categories.View,
                    precondition: contextkeys_1.SideBySideEditorActiveContext,
                    f1: true
                });
            }
            async run(accessor) {
                const configurationService = accessor.get(configuration_1.IConfigurationService);
                const currentSetting = configurationService.getValue(sideBySideEditor_1.SideBySideEditor.SIDE_BY_SIDE_LAYOUT_SETTING);
                let newSetting;
                if (currentSetting !== 'horizontal') {
                    newSetting = 'horizontal';
                }
                else {
                    newSetting = 'vertical';
                }
                return configurationService.updateValue(sideBySideEditor_1.SideBySideEditor.SIDE_BY_SIDE_LAYOUT_SETTING, newSetting);
            }
        });
    }
    function registerFocusSideEditorsCommands() {
        (0, actions_1.registerAction2)(class extends actions_1.Action2 {
            constructor() {
                super({
                    id: exports.FOCUS_FIRST_SIDE_EDITOR,
                    title: { value: (0, nls_1.localize)('focusLeftSideEditor', "Focus First Side in Active Editor"), original: 'Focus First Side in Active Editor' },
                    category: actionCommonCategories_1.Categories.View,
                    precondition: contextkey_1.ContextKeyExpr.or(contextkeys_1.SideBySideEditorActiveContext, contextkeys_1.TextCompareEditorActiveContext),
                    f1: true
                });
            }
            async run(accessor) {
                const editorService = accessor.get(editorService_1.IEditorService);
                const commandService = accessor.get(commands_1.ICommandService);
                const activeEditorPane = editorService.activeEditorPane;
                if (activeEditorPane instanceof sideBySideEditor_1.SideBySideEditor) {
                    activeEditorPane.getSecondaryEditorPane()?.focus();
                }
                else if (activeEditorPane instanceof textDiffEditor_1.TextDiffEditor) {
                    await commandService.executeCommand(exports.DIFF_FOCUS_SECONDARY_SIDE);
                }
            }
        });
        (0, actions_1.registerAction2)(class extends actions_1.Action2 {
            constructor() {
                super({
                    id: exports.FOCUS_SECOND_SIDE_EDITOR,
                    title: { value: (0, nls_1.localize)('focusRightSideEditor', "Focus Second Side in Active Editor"), original: 'Focus Second Side in Active Editor' },
                    category: actionCommonCategories_1.Categories.View,
                    precondition: contextkey_1.ContextKeyExpr.or(contextkeys_1.SideBySideEditorActiveContext, contextkeys_1.TextCompareEditorActiveContext),
                    f1: true
                });
            }
            async run(accessor) {
                const editorService = accessor.get(editorService_1.IEditorService);
                const commandService = accessor.get(commands_1.ICommandService);
                const activeEditorPane = editorService.activeEditorPane;
                if (activeEditorPane instanceof sideBySideEditor_1.SideBySideEditor) {
                    activeEditorPane.getPrimaryEditorPane()?.focus();
                }
                else if (activeEditorPane instanceof textDiffEditor_1.TextDiffEditor) {
                    await commandService.executeCommand(exports.DIFF_FOCUS_PRIMARY_SIDE);
                }
            }
        });
        (0, actions_1.registerAction2)(class extends actions_1.Action2 {
            constructor() {
                super({
                    id: exports.FOCUS_OTHER_SIDE_EDITOR,
                    title: { value: (0, nls_1.localize)('focusOtherSideEditor', "Focus Other Side in Active Editor"), original: 'Focus Other Side in Active Editor' },
                    category: actionCommonCategories_1.Categories.View,
                    precondition: contextkey_1.ContextKeyExpr.or(contextkeys_1.SideBySideEditorActiveContext, contextkeys_1.TextCompareEditorActiveContext),
                    f1: true
                });
            }
            async run(accessor) {
                const editorService = accessor.get(editorService_1.IEditorService);
                const commandService = accessor.get(commands_1.ICommandService);
                const activeEditorPane = editorService.activeEditorPane;
                if (activeEditorPane instanceof sideBySideEditor_1.SideBySideEditor) {
                    if (activeEditorPane.getPrimaryEditorPane()?.hasFocus()) {
                        activeEditorPane.getSecondaryEditorPane()?.focus();
                    }
                    else {
                        activeEditorPane.getPrimaryEditorPane()?.focus();
                    }
                }
                else if (activeEditorPane instanceof textDiffEditor_1.TextDiffEditor) {
                    await commandService.executeCommand(exports.DIFF_FOCUS_OTHER_SIDE);
                }
            }
        });
    }
    function registerOtherEditorCommands() {
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.KEEP_EDITOR_COMMAND_ID,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: undefined,
            primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 3 /* KeyCode.Enter */),
            handler: async (accessor, resourceOrContext, context) => {
                const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
                const { group, editor } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
                if (group && editor) {
                    return group.pinEditor(editor);
                }
            }
        });
        commands_1.CommandsRegistry.registerCommand({
            id: exports.TOGGLE_KEEP_EDITORS_COMMAND_ID,
            handler: accessor => {
                const configurationService = accessor.get(configuration_1.IConfigurationService);
                const currentSetting = configurationService.getValue('workbench.editor.enablePreview');
                const newSetting = currentSetting === true ? false : true;
                configurationService.updateValue('workbench.editor.enablePreview', newSetting);
            }
        });
        function setEditorGroupLock(accessor, resourceOrContext, context, locked) {
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const { group } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
            group?.lock(locked ?? !group.isLocked);
        }
        (0, actions_1.registerAction2)(class extends actions_1.Action2 {
            constructor() {
                super({
                    id: exports.TOGGLE_LOCK_GROUP_COMMAND_ID,
                    title: { value: (0, nls_1.localize)('toggleEditorGroupLock', "Toggle Editor Group Lock"), original: 'Toggle Editor Group Lock' },
                    category: actionCommonCategories_1.Categories.View,
                    precondition: contextkeys_1.MultipleEditorGroupsContext,
                    f1: true
                });
            }
            async run(accessor, resourceOrContext, context) {
                setEditorGroupLock(accessor, resourceOrContext, context);
            }
        });
        (0, actions_1.registerAction2)(class extends actions_1.Action2 {
            constructor() {
                super({
                    id: exports.LOCK_GROUP_COMMAND_ID,
                    title: { value: (0, nls_1.localize)('lockEditorGroup', "Lock Editor Group"), original: 'Lock Editor Group' },
                    category: actionCommonCategories_1.Categories.View,
                    precondition: contextkey_1.ContextKeyExpr.and(contextkeys_1.MultipleEditorGroupsContext, contextkeys_1.ActiveEditorGroupLockedContext.toNegated()),
                    f1: true
                });
            }
            async run(accessor, resourceOrContext, context) {
                setEditorGroupLock(accessor, resourceOrContext, context, true);
            }
        });
        (0, actions_1.registerAction2)(class extends actions_1.Action2 {
            constructor() {
                super({
                    id: exports.UNLOCK_GROUP_COMMAND_ID,
                    title: { value: (0, nls_1.localize)('unlockEditorGroup', "Unlock Editor Group"), original: 'Unlock Editor Group' },
                    precondition: contextkey_1.ContextKeyExpr.and(contextkeys_1.MultipleEditorGroupsContext, contextkeys_1.ActiveEditorGroupLockedContext),
                    category: actionCommonCategories_1.Categories.View,
                    f1: true
                });
            }
            async run(accessor, resourceOrContext, context) {
                setEditorGroupLock(accessor, resourceOrContext, context, false);
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.PIN_EDITOR_COMMAND_ID,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkeys_1.ActiveEditorStickyContext.toNegated(),
            primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */),
            handler: async (accessor, resourceOrContext, context) => {
                const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
                const { group, editor } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
                if (group && editor) {
                    return group.stickEditor(editor);
                }
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.DIFF_OPEN_SIDE,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: editorContextKeys_1.EditorContextKeys.inDiffEditor,
            primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 1024 /* KeyMod.Shift */ | 45 /* KeyCode.KeyO */),
            handler: async (accessor) => {
                const editorService = accessor.get(editorService_1.IEditorService);
                const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
                const activeEditor = editorService.activeEditor;
                const activeTextEditorControl = editorService.activeTextEditorControl;
                if (!(0, editorBrowser_1.isDiffEditor)(activeTextEditorControl) || !(activeEditor instanceof diffEditorInput_1.DiffEditorInput)) {
                    return;
                }
                let editor;
                const originalEditor = activeTextEditorControl.getOriginalEditor();
                if (originalEditor.hasTextFocus()) {
                    editor = activeEditor.original;
                }
                else {
                    editor = activeEditor.modified;
                }
                return editorGroupService.activeGroup.openEditor(editor);
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.UNPIN_EDITOR_COMMAND_ID,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkeys_1.ActiveEditorStickyContext,
            primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */),
            handler: async (accessor, resourceOrContext, context) => {
                const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
                const { group, editor } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
                if (group && editor) {
                    return group.unstickEditor(editor);
                }
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.SHOW_EDITORS_IN_GROUP,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: undefined,
            primary: undefined,
            handler: (accessor, resourceOrContext, context) => {
                const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
                const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                const commandsContext = getCommandsContext(resourceOrContext, context);
                if (commandsContext && typeof commandsContext.groupId === 'number') {
                    const group = editorGroupService.getGroup(commandsContext.groupId);
                    if (group) {
                        editorGroupService.activateGroup(group); // we need the group to be active
                    }
                }
                return quickInputService.quickAccess.show(editorQuickAccess_1.ActiveGroupEditorsByMostRecentlyUsedQuickAccess.PREFIX);
            }
        });
    }
    function getEditorsContext(accessor, resourceOrContext, context) {
        const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
        const listService = accessor.get(listService_1.IListService);
        const editorContext = getMultiSelectedEditorContexts(getCommandsContext(resourceOrContext, context), listService, editorGroupService);
        const activeGroup = editorGroupService.activeGroup;
        if (editorContext.length === 0 && activeGroup.activeEditor) {
            // add the active editor as fallback
            editorContext.push({
                groupId: activeGroup.id,
                editorIndex: activeGroup.getIndexOfEditor(activeGroup.activeEditor)
            });
        }
        return {
            editors: editorContext,
            groups: (0, arrays_1.distinct)(editorContext.map(context => context.groupId)).map(groupId => editorGroupService.getGroup(groupId))
        };
    }
    function getCommandsContext(resourceOrContext, context) {
        if (uri_1.URI.isUri(resourceOrContext)) {
            return context;
        }
        if (resourceOrContext && typeof resourceOrContext.groupId === 'number') {
            return resourceOrContext;
        }
        if (context && typeof context.groupId === 'number') {
            return context;
        }
        return undefined;
    }
    function resolveCommandsContext(editorGroupService, context) {
        // Resolve from context
        let group = context && typeof context.groupId === 'number' ? editorGroupService.getGroup(context.groupId) : undefined;
        let editor = group && context && typeof context.editorIndex === 'number' ? group.getEditorByIndex(context.editorIndex) ?? undefined : undefined;
        // Fallback to active group as needed
        if (!group) {
            group = editorGroupService.activeGroup;
        }
        // Fallback to active editor as needed
        if (!editor) {
            editor = group.activeEditor ?? undefined;
        }
        return { group, editor };
    }
    function getMultiSelectedEditorContexts(editorContext, listService, editorGroupService) {
        // First check for a focused list to return the selected items from
        const list = listService.lastFocusedList;
        if (list instanceof listWidget_1.List && list.getHTMLElement() === document.activeElement) {
            const elementToContext = (element) => {
                if ((0, editorGroupsService_1.isEditorGroup)(element)) {
                    return { groupId: element.id, editorIndex: undefined };
                }
                const group = editorGroupService.getGroup(element.groupId);
                return { groupId: element.groupId, editorIndex: group ? group.getIndexOfEditor(element.editor) : -1 };
            };
            const onlyEditorGroupAndEditor = (e) => (0, editorGroupsService_1.isEditorGroup)(e) || (0, editor_1.isEditorIdentifier)(e);
            const focusedElements = list.getFocusedElements().filter(onlyEditorGroupAndEditor);
            const focus = editorContext ? editorContext : focusedElements.length ? focusedElements.map(elementToContext)[0] : undefined; // need to take into account when editor context is { group: group }
            if (focus) {
                const selection = list.getSelectedElements().filter(onlyEditorGroupAndEditor);
                if (selection.length > 0) {
                    return selection.map(elementToContext);
                }
                return [focus];
            }
        }
        // Otherwise go with passed in context
        return !!editorContext ? [editorContext] : [];
    }
    exports.getMultiSelectedEditorContexts = getMultiSelectedEditorContexts;
    function setup() {
        registerActiveEditorMoveCopyCommand();
        registerEditorGroupsLayoutCommands();
        registerDiffEditorCommands();
        registerOpenEditorAPICommands();
        registerOpenEditorAtIndexCommands();
        registerCloseEditorCommands();
        registerOtherEditorCommands();
        registerSplitEditorInGroupCommands();
        registerFocusSideEditorsCommands();
        registerFocusEditorGroupAtIndexCommands();
        registerSplitEditorCommands();
        registerFocusEditorGroupWihoutWrapCommands();
    }
    exports.setup = setup;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yQ29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy9lZGl0b3IvZWRpdG9yQ29tbWFuZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBd0NuRixRQUFBLDhCQUE4QixHQUFHLHlDQUF5QyxDQUFDO0lBQzNFLFFBQUEsaUNBQWlDLEdBQUcsc0NBQXNDLENBQUM7SUFDM0UsUUFBQSxrQ0FBa0MsR0FBRyx1Q0FBdUMsQ0FBQztJQUM3RSxRQUFBLHFDQUFxQyxHQUFHLHlDQUF5QyxDQUFDO0lBQ2xGLFFBQUEsdUJBQXVCLEdBQUcsb0NBQW9DLENBQUM7SUFDL0QsUUFBQSw4QkFBOEIsR0FBRywwQ0FBMEMsQ0FBQztJQUM1RSxRQUFBLDZCQUE2QixHQUFHLDZCQUE2QixDQUFDO0lBQzlELFFBQUEsdUNBQXVDLEdBQUcsb0NBQW9DLENBQUM7SUFFL0UsUUFBQSw2QkFBNkIsR0FBRyxrQkFBa0IsQ0FBQztJQUNuRCxRQUFBLDZCQUE2QixHQUFHLGtCQUFrQixDQUFDO0lBQ25ELFFBQUEsK0JBQStCLEdBQUcsb0JBQW9CLENBQUM7SUFDdkQsUUFBQSxzQkFBc0IsR0FBRyw2QkFBNkIsQ0FBQztJQUN2RCxRQUFBLDhCQUE4QixHQUFHLG9DQUFvQyxDQUFDO0lBQ3RFLFFBQUEsNEJBQTRCLEdBQUcsd0NBQXdDLENBQUM7SUFDeEUsUUFBQSxxQkFBcUIsR0FBRyxrQ0FBa0MsQ0FBQztJQUMzRCxRQUFBLHVCQUF1QixHQUFHLG9DQUFvQyxDQUFDO0lBQy9ELFFBQUEscUJBQXFCLEdBQUcscUNBQXFDLENBQUM7SUFDOUQsUUFBQSxzQkFBc0IsR0FBRyxtQ0FBbUMsQ0FBQztJQUU3RCxRQUFBLHFCQUFxQixHQUFHLDRCQUE0QixDQUFDO0lBQ3JELFFBQUEsdUJBQXVCLEdBQUcsOEJBQThCLENBQUM7SUFFekQs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