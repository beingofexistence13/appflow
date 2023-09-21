/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/editor/editorCommands", "vs/base/common/types", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybindingsRegistry", "vs/workbench/common/editor", "vs/workbench/common/contextkeys", "vs/workbench/services/editor/common/editorGroupColumn", "vs/workbench/services/editor/common/editorService", "vs/editor/common/editorContextKeys", "vs/workbench/browser/parts/editor/textDiffEditor", "vs/base/common/keyCodes", "vs/base/common/uri", "vs/platform/quickinput/common/quickInput", "vs/platform/list/browser/listService", "vs/base/browser/ui/list/listWidget", "vs/base/common/arrays", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/contextkey/common/contextkey", "vs/platform/configuration/common/configuration", "vs/platform/commands/common/commands", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/workbench/browser/parts/editor/editorQuickAccess", "vs/platform/opener/common/opener", "vs/platform/editor/common/editor", "vs/base/common/network", "vs/workbench/common/editor/sideBySideEditorInput", "vs/workbench/browser/parts/editor/sideBySideEditor", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/services/path/common/pathService", "vs/platform/telemetry/common/telemetry", "vs/base/common/resources", "vs/workbench/common/editor/diffEditorInput", "vs/editor/browser/editorBrowser", "vs/workbench/services/untitled/common/untitledTextEditorService"], function (require, exports, nls_1, types_1, instantiation_1, keybindingsRegistry_1, editor_1, contextkeys_1, editorGroupColumn_1, editorService_1, editorContextKeys_1, textDiffEditor_1, keyCodes_1, uri_1, quickInput_1, listService_1, listWidget_1, arrays_1, editorGroupsService_1, contextkey_1, configuration_1, commands_1, actions_1, actionCommonCategories_1, editorQuickAccess_1, opener_1, editor_2, network_1, sideBySideEditorInput_1, sideBySideEditor_1, editorResolverService_1, pathService_1, telemetry_1, resources_1, diffEditorInput_1, editorBrowser_1, untitledTextEditorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$2ub = exports.$1ub = exports.$Zub = exports.$Yub = exports.$Xub = exports.$Wub = exports.$Vub = exports.$Uub = exports.$Tub = exports.$Sub = exports.$Rub = exports.$Qub = exports.$Pub = exports.$Oub = exports.$Nub = exports.$Mub = exports.$Lub = exports.$Kub = exports.$Jub = exports.$Iub = exports.$Hub = exports.$Gub = exports.$Fub = exports.$Eub = exports.$Dub = exports.$Cub = exports.$Bub = exports.$Aub = exports.$zub = exports.$yub = exports.$xub = exports.$wub = exports.$vub = exports.$uub = exports.$tub = exports.$sub = exports.$rub = exports.$qub = exports.$pub = exports.$oub = exports.$nub = exports.$mub = exports.$lub = exports.$kub = exports.$jub = exports.$iub = exports.$hub = exports.$gub = exports.$fub = exports.$eub = void 0;
    exports.$eub = 'workbench.action.closeUnmodifiedEditors';
    exports.$fub = 'workbench.action.closeEditorsInGroup';
    exports.$gub = 'workbench.action.closeEditorsAndGroup';
    exports.$hub = 'workbench.action.closeEditorsToTheRight';
    exports.$iub = 'workbench.action.closeActiveEditor';
    exports.$jub = 'workbench.action.closeActivePinnedEditor';
    exports.$kub = 'workbench.action.closeGroup';
    exports.$lub = 'workbench.action.closeOtherEditors';
    exports.$mub = 'moveActiveEditor';
    exports.$nub = 'copyActiveEditor';
    exports.$oub = 'layoutEditorGroups';
    exports.$pub = 'workbench.action.keepEditor';
    exports.$qub = 'workbench.action.toggleKeepEditors';
    exports.$rub = 'workbench.action.toggleEditorGroupLock';
    exports.$sub = 'workbench.action.lockEditorGroup';
    exports.$tub = 'workbench.action.unlockEditorGroup';
    exports.$uub = 'workbench.action.showEditorsInGroup';
    exports.$vub = 'workbench.action.reopenWithEditor';
    exports.$wub = 'workbench.action.pinEditor';
    exports.$xub = 'workbench.action.unpinEditor';
    exports.$yub = 'toggle.diff.renderSideBySide';
    exports.$zub = 'workbench.action.compareEditor.nextChange';
    exports.$Aub = 'workbench.action.compareEditor.previousChange';
    exports.$Bub = 'workbench.action.compareEditor.focusPrimarySide';
    exports.$Cub = 'workbench.action.compareEditor.focusSecondarySide';
    exports.$Dub = 'workbench.action.compareEditor.focusOtherSide';
    exports.$Eub = 'workbench.action.compareEditor.openSide';
    exports.$Fub = 'toggle.diff.ignoreTrimWhitespace';
    exports.$Gub = 'workbench.action.splitEditorUp';
    exports.$Hub = 'workbench.action.splitEditorDown';
    exports.$Iub = 'workbench.action.splitEditorLeft';
    exports.$Jub = 'workbench.action.splitEditorRight';
    exports.$Kub = 'workbench.action.splitEditorInGroup';
    exports.$Lub = 'workbench.action.toggleSplitEditorInGroup';
    exports.$Mub = 'workbench.action.joinEditorInGroup';
    exports.$Nub = 'workbench.action.toggleSplitEditorInGroupLayout';
    exports.$Oub = 'workbench.action.focusFirstSideEditor';
    exports.$Pub = 'workbench.action.focusSecondSideEditor';
    exports.$Qub = 'workbench.action.focusOtherSideEditor';
    exports.$Rub = 'workbench.action.focusLeftGroupWithoutWrap';
    exports.$Sub = 'workbench.action.focusRightGroupWithoutWrap';
    exports.$Tub = 'workbench.action.focusAboveGroupWithoutWrap';
    exports.$Uub = 'workbench.action.focusBelowGroupWithoutWrap';
    exports.$Vub = 'workbench.action.openEditorAtIndex';
    exports.$Wub = '_workbench.open';
    exports.$Xub = '_workbench.diff';
    exports.$Yub = '_workbench.openWith';
    const isActiveEditorMoveCopyArg = function (arg) {
        if (!(0, types_1.$lf)(arg)) {
            return false;
        }
        if (!(0, types_1.$jf)(arg.to)) {
            return false;
        }
        if (!(0, types_1.$qf)(arg.by) && !(0, types_1.$jf)(arg.by)) {
            return false;
        }
        if (!(0, types_1.$qf)(arg.value) && !(0, types_1.$nf)(arg.value)) {
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
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: exports.$mub,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
            primary: 0,
            handler: (accessor, args) => moveCopyActiveEditor(true, args, accessor),
            description: {
                description: (0, nls_1.localize)(0, null),
                args: [
                    {
                        name: (0, nls_1.localize)(1, null),
                        description: (0, nls_1.localize)(2, null),
                        constraint: isActiveEditorMoveCopyArg,
                        schema: moveCopyJSONSchema
                    }
                ]
            }
        });
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: exports.$nub,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
            primary: 0,
            handler: (accessor, args) => moveCopyActiveEditor(false, args, accessor),
            description: {
                description: (0, nls_1.localize)(3, null),
                args: [
                    {
                        name: (0, nls_1.localize)(4, null),
                        description: (0, nls_1.localize)(5, null),
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
            const activeEditorPane = accessor.get(editorService_1.$9C).activeEditorPane;
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
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
            const configurationService = accessor.get(configuration_1.$8h);
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
                        targetGroup = editorGroupService.addGroup(sourceGroup, (0, editorGroupsService_1.$8C)(configurationService));
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
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
            editorGroupService.applyLayout(layout);
        }
        commands_1.$Gr.registerCommand(exports.$oub, (accessor, args) => {
            applyEditorLayout(accessor, args);
        });
        // API Commands
        commands_1.$Gr.registerCommand({
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
        commands_1.$Gr.registerCommand({
            id: 'vscode.getEditorLayout',
            handler: (accessor) => {
                const editorGroupService = accessor.get(editorGroupsService_1.$5C);
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
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: exports.$zub,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkeys_1.$adb,
            primary: 512 /* KeyMod.Alt */ | 63 /* KeyCode.F5 */,
            handler: accessor => navigateInDiffEditor(accessor, true)
        });
        actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, {
            command: {
                id: exports.$zub,
                title: { value: (0, nls_1.localize)(6, null), original: 'Go to Next Change' },
            }
        });
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: exports.$Aub,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkeys_1.$adb,
            primary: 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 63 /* KeyCode.F5 */,
            handler: accessor => navigateInDiffEditor(accessor, false)
        });
        actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, {
            command: {
                id: exports.$Aub,
                title: { value: (0, nls_1.localize)(7, null), original: 'Go to Previous Change' },
            }
        });
        function getActiveTextDiffEditor(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            for (const editor of [editorService.activeEditorPane, ...editorService.visibleEditorPanes]) {
                if (editor instanceof textDiffEditor_1.$$tb) {
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
            const configurationService = accessor.get(configuration_1.$8h);
            const newValue = !configurationService.getValue('diffEditor.renderSideBySide');
            configurationService.updateValue('diffEditor.renderSideBySide', newValue);
        }
        function toggleDiffIgnoreTrimWhitespace(accessor) {
            const configurationService = accessor.get(configuration_1.$8h);
            const newValue = !configurationService.getValue('diffEditor.ignoreTrimWhitespace');
            configurationService.updateValue('diffEditor.ignoreTrimWhitespace', newValue);
        }
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: exports.$yub,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: undefined,
            primary: undefined,
            handler: accessor => toggleDiffSideBySide(accessor)
        });
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: exports.$Bub,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: undefined,
            primary: undefined,
            handler: accessor => focusInDiffEditor(accessor, FocusTextDiffEditorMode.Modified)
        });
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: exports.$Cub,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: undefined,
            primary: undefined,
            handler: accessor => focusInDiffEditor(accessor, FocusTextDiffEditorMode.Original)
        });
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: exports.$Dub,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: undefined,
            primary: undefined,
            handler: accessor => focusInDiffEditor(accessor, FocusTextDiffEditorMode.Toggle)
        });
        actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, {
            command: {
                id: exports.$yub,
                title: {
                    value: (0, nls_1.localize)(8, null),
                    original: 'Compare: Toggle Inline View'
                },
                category: (0, nls_1.localize)(9, null)
            },
            when: contextkeys_1.$bdb
        });
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: exports.$Fub,
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
                context.sideBySide ? editorService_1.$$C : column
            ];
        }
        // partial, renderer-side API command to open editor
        // complements https://github.com/microsoft/vscode/blob/2b164efb0e6a5de3826bff62683eaeafe032284f/src/vs/workbench/api/common/extHostApiCommands.ts#L373
        commands_1.$Gr.registerCommand({
            id: 'vscode.open',
            handler: (accessor, arg) => {
                accessor.get(commands_1.$Fr).executeCommand(exports.$Wub, arg);
            },
            description: {
                description: 'Opens the provided resource in the editor.',
                args: [{ name: 'Uri' }]
            }
        });
        commands_1.$Gr.registerCommand(exports.$Wub, async function (accessor, resourceArg, columnAndOptions, label, context) {
            const editorService = accessor.get(editorService_1.$9C);
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
            const openerService = accessor.get(opener_1.$NT);
            const pathService = accessor.get(pathService_1.$yJ);
            const configurationService = accessor.get(configuration_1.$8h);
            const untitledTextEditorService = accessor.get(untitledTextEditorService_1.$tD);
            const resourceOrString = typeof resourceArg === 'string' ? resourceArg : uri_1.URI.from(resourceArg, true);
            const [columnArg, optionsArg] = columnAndOptions ?? [];
            // use editor options or editor view column or resource scheme
            // as a hint to use the editor service for opening directly
            if (optionsArg || typeof columnArg === 'number' || (0, opener_1.$OT)(resourceOrString, network_1.Schemas.untitled)) {
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
                await editorService.openEditor(input, (0, editorGroupColumn_1.$4I)(editorGroupService, configurationService, column));
            }
            // do not allow to execute commands from here
            else if ((0, opener_1.$OT)(resourceOrString, network_1.Schemas.command)) {
                return;
            }
            // finally, delegate to opener service
            else {
                await openerService.open(resourceOrString, { openToSide: context?.sideBySide, editorOptions: context?.editorOptions });
            }
        });
        // partial, renderer-side API command to open diff editor
        // complements https://github.com/microsoft/vscode/blob/2b164efb0e6a5de3826bff62683eaeafe032284f/src/vs/workbench/api/common/extHostApiCommands.ts#L397
        commands_1.$Gr.registerCommand({
            id: 'vscode.diff',
            handler: (accessor, left, right, label) => {
                accessor.get(commands_1.$Fr).executeCommand(exports.$Xub, left, right, label);
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
        commands_1.$Gr.registerCommand(exports.$Xub, async function (accessor, originalResource, modifiedResource, labelAndOrDescription, columnAndOptions, context) {
            const editorService = accessor.get(editorService_1.$9C);
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
            const configurationService = accessor.get(configuration_1.$8h);
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
            }, (0, editorGroupColumn_1.$4I)(editorGroupService, configurationService, column));
        });
        commands_1.$Gr.registerCommand(exports.$Yub, async (accessor, resource, id, columnAndOptions) => {
            const editorService = accessor.get(editorService_1.$9C);
            const editorGroupsService = accessor.get(editorGroupsService_1.$5C);
            const configurationService = accessor.get(configuration_1.$8h);
            const [columnArg, optionsArg] = columnAndOptions ?? [];
            await editorService.openEditor({ resource: uri_1.URI.from(resource, true), options: { ...optionsArg, pinned: true, override: id } }, (0, editorGroupColumn_1.$4I)(editorGroupsService, configurationService, columnArg));
        });
    }
    function registerOpenEditorAtIndexCommands() {
        const openEditorAtIndex = (accessor, editorIndex) => {
            const editorService = accessor.get(editorService_1.$9C);
            const activeEditorPane = editorService.activeEditorPane;
            if (activeEditorPane) {
                const editor = activeEditorPane.group.getEditorByIndex(editorIndex);
                if (editor) {
                    editorService.openEditor(editor);
                }
            }
        };
        // This command takes in the editor index number to open as an argument
        commands_1.$Gr.registerCommand({
            id: exports.$Vub,
            handler: openEditorAtIndex
        });
        // Keybindings to focus a specific index in the tab folder if tabs are enabled
        for (let i = 0; i < 9; i++) {
            const editorIndex = i;
            const visibleIndex = i + 1;
            keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
                id: exports.$Vub + visibleIndex,
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
            keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
                id: toCommandId(groupIndex),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: undefined,
                primary: 2048 /* KeyMod.CtrlCmd */ | toKeyCode(groupIndex),
                handler: accessor => {
                    const editorGroupService = accessor.get(editorGroupsService_1.$5C);
                    const configurationService = accessor.get(configuration_1.$8h);
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
                    const direction = (0, editorGroupsService_1.$8C)(configurationService);
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
    function $Zub(editorGroupService, direction, context) {
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
    exports.$Zub = $Zub;
    function registerSplitEditorCommands() {
        [
            { id: exports.$Gub, direction: 0 /* GroupDirection.UP */ },
            { id: exports.$Hub, direction: 1 /* GroupDirection.DOWN */ },
            { id: exports.$Iub, direction: 2 /* GroupDirection.LEFT */ },
            { id: exports.$Jub, direction: 3 /* GroupDirection.RIGHT */ }
        ].forEach(({ id, direction }) => {
            commands_1.$Gr.registerCommand(id, function (accessor, resourceOrContext, context) {
                $Zub(accessor.get(editorGroupsService_1.$5C), direction, getCommandsContext(resourceOrContext, context));
            });
        });
    }
    function registerCloseEditorCommands() {
        // A special handler for "Close Editor" depending on context
        // - keybindining: do not close sticky editors, rather open the next non-sticky editor
        // - menu: always close editor, even sticky ones
        function closeEditorHandler(accessor, forceCloseStickyEditors, resourceOrContext, context) {
            const editorGroupsService = accessor.get(editorGroupsService_1.$5C);
            const editorService = accessor.get(editorService_1.$9C);
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
                    const editorsToClose = (0, arrays_1.$Fb)(editors
                        .filter(editor => editor.groupId === group.id)
                        .map(editor => typeof editor.editorIndex === 'number' ? group.getEditorByIndex(editor.editorIndex) : group.activeEditor))
                        .filter(editor => !keepStickyEditors || !group.isSticky(editor));
                    await group.closeEditors(editorsToClose, { preserveFocus: context?.preserveFocus });
                }
            }));
        }
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: exports.$iub,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: undefined,
            primary: 2048 /* KeyMod.CtrlCmd */ | 53 /* KeyCode.KeyW */,
            win: { primary: 2048 /* KeyMod.CtrlCmd */ | 62 /* KeyCode.F4 */, secondary: [2048 /* KeyMod.CtrlCmd */ | 53 /* KeyCode.KeyW */] },
            handler: (accessor, resourceOrContext, context) => {
                return closeEditorHandler(accessor, false, resourceOrContext, context);
            }
        });
        commands_1.$Gr.registerCommand(exports.$jub, (accessor, resourceOrContext, context) => {
            return closeEditorHandler(accessor, true /* force close pinned editors */, resourceOrContext, context);
        });
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: exports.$fub,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: undefined,
            primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 53 /* KeyCode.KeyW */),
            handler: (accessor, resourceOrContext, context) => {
                return Promise.all(getEditorsContext(accessor, resourceOrContext, context).groups.map(async (group) => {
                    if (group) {
                        await group.closeAllEditors({ excludeSticky: true });
                        return;
                    }
                }));
            }
        });
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: exports.$kub,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkey_1.$Ii.and(contextkeys_1.$edb, contextkeys_1.$idb),
            primary: 2048 /* KeyMod.CtrlCmd */ | 53 /* KeyCode.KeyW */,
            win: { primary: 2048 /* KeyMod.CtrlCmd */ | 62 /* KeyCode.F4 */, secondary: [2048 /* KeyMod.CtrlCmd */ | 53 /* KeyCode.KeyW */] },
            handler: (accessor, resourceOrContext, context) => {
                const editorGroupService = accessor.get(editorGroupsService_1.$5C);
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
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: exports.$eub,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: undefined,
            primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 51 /* KeyCode.KeyU */),
            handler: (accessor, resourceOrContext, context) => {
                return Promise.all(getEditorsContext(accessor, resourceOrContext, context).groups.map(async (group) => {
                    if (group) {
                        await group.closeEditors({ savedOnly: true, excludeSticky: true }, { preserveFocus: context?.preserveFocus });
                    }
                }));
            }
        });
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: exports.$lub,
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
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: exports.$hub,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: undefined,
            primary: undefined,
            handler: async (accessor, resourceOrContext, context) => {
                const editorGroupService = accessor.get(editorGroupsService_1.$5C);
                const { group, editor } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
                if (group && editor) {
                    if (group.activeEditor) {
                        group.pinEditor(group.activeEditor);
                    }
                    await group.closeEditors({ direction: 1 /* CloseDirection.RIGHT */, except: editor, excludeSticky: true }, { preserveFocus: context?.preserveFocus });
                }
            }
        });
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: exports.$vub,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: undefined,
            primary: undefined,
            handler: async (accessor, resourceOrContext, context) => {
                const editorGroupService = accessor.get(editorGroupsService_1.$5C);
                const editorService = accessor.get(editorService_1.$9C);
                const editorResolverService = accessor.get(editorResolverService_1.$pbb);
                const telemetryService = accessor.get(telemetry_1.$9k);
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
                if (!(0, editor_1.$ZE)(resolvedEditor)) {
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
                    ext: editor.resource ? (0, resources_1.$gg)(editor.resource) : '',
                    from: editor.editorId ?? '',
                    to: resolvedEditor.editor.editorId ?? ''
                });
                // Make sure it becomes active too
                await resolvedEditor.group.openEditor(resolvedEditor.editor);
            }
        });
        commands_1.$Gr.registerCommand(exports.$gub, async (accessor, resourceOrContext, context) => {
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
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
                id: exports.$Rub,
                direction: 2 /* GroupDirection.LEFT */
            },
            {
                id: exports.$Sub,
                direction: 3 /* GroupDirection.RIGHT */
            },
            {
                id: exports.$Tub,
                direction: 0 /* GroupDirection.UP */,
            },
            {
                id: exports.$Uub,
                direction: 1 /* GroupDirection.DOWN */
            }
        ];
        for (const command of commands) {
            commands_1.$Gr.registerCommand(command.id, async (accessor) => {
                const editorGroupService = accessor.get(editorGroupsService_1.$5C);
                const group = editorGroupService.findGroup({ direction: command.direction }, editorGroupService.activeGroup, false);
                group?.focus();
            });
        }
    }
    function registerSplitEditorInGroupCommands() {
        async function splitEditorInGroup(accessor, resourceOrContext, context) {
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
            const instantiationService = accessor.get(instantiation_1.$Ah);
            const { group, editor } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
            if (!editor) {
                return;
            }
            await group.replaceEditors([{
                    editor,
                    replacement: instantiationService.createInstance(sideBySideEditorInput_1.$VC, undefined, undefined, editor, editor),
                    forceReplaceDirty: true
                }]);
        }
        (0, actions_1.$Xu)(class extends actions_1.$Wu {
            constructor() {
                super({
                    id: exports.$Kub,
                    title: { value: (0, nls_1.localize)(10, null), original: 'Split Editor in Group' },
                    category: actionCommonCategories_1.$Nl.View,
                    precondition: contextkeys_1.$0cb,
                    f1: true,
                    keybinding: {
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: contextkeys_1.$0cb,
                        primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 93 /* KeyCode.Backslash */)
                    }
                });
            }
            run(accessor, resourceOrContext, context) {
                return splitEditorInGroup(accessor, resourceOrContext, context);
            }
        });
        async function joinEditorInGroup(accessor, resourceOrContext, context) {
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
            const { group, editor } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
            if (!(editor instanceof sideBySideEditorInput_1.$VC)) {
                return;
            }
            let options = undefined;
            const activeEditorPane = group.activeEditorPane;
            if (activeEditorPane instanceof sideBySideEditor_1.$dub && group.activeEditor === editor) {
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
        (0, actions_1.$Xu)(class extends actions_1.$Wu {
            constructor() {
                super({
                    id: exports.$Mub,
                    title: { value: (0, nls_1.localize)(11, null), original: 'Join Editor in Group' },
                    category: actionCommonCategories_1.$Nl.View,
                    precondition: contextkeys_1.$cdb,
                    f1: true,
                    keybinding: {
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: contextkeys_1.$cdb,
                        primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 93 /* KeyCode.Backslash */)
                    }
                });
            }
            run(accessor, resourceOrContext, context) {
                return joinEditorInGroup(accessor, resourceOrContext, context);
            }
        });
        (0, actions_1.$Xu)(class extends actions_1.$Wu {
            constructor() {
                super({
                    id: exports.$Lub,
                    title: { value: (0, nls_1.localize)(12, null), original: 'Toggle Split Editor in Group' },
                    category: actionCommonCategories_1.$Nl.View,
                    precondition: contextkey_1.$Ii.or(contextkeys_1.$0cb, contextkeys_1.$cdb),
                    f1: true
                });
            }
            async run(accessor, resourceOrContext, context) {
                const editorGroupService = accessor.get(editorGroupsService_1.$5C);
                const { editor } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
                if (editor instanceof sideBySideEditorInput_1.$VC) {
                    await joinEditorInGroup(accessor, resourceOrContext, context);
                }
                else if (editor) {
                    await splitEditorInGroup(accessor, resourceOrContext, context);
                }
            }
        });
        (0, actions_1.$Xu)(class extends actions_1.$Wu {
            constructor() {
                super({
                    id: exports.$Nub,
                    title: { value: (0, nls_1.localize)(13, null), original: 'Toggle Layout of Split Editor in Group' },
                    category: actionCommonCategories_1.$Nl.View,
                    precondition: contextkeys_1.$cdb,
                    f1: true
                });
            }
            async run(accessor) {
                const configurationService = accessor.get(configuration_1.$8h);
                const currentSetting = configurationService.getValue(sideBySideEditor_1.$dub.SIDE_BY_SIDE_LAYOUT_SETTING);
                let newSetting;
                if (currentSetting !== 'horizontal') {
                    newSetting = 'horizontal';
                }
                else {
                    newSetting = 'vertical';
                }
                return configurationService.updateValue(sideBySideEditor_1.$dub.SIDE_BY_SIDE_LAYOUT_SETTING, newSetting);
            }
        });
    }
    function registerFocusSideEditorsCommands() {
        (0, actions_1.$Xu)(class extends actions_1.$Wu {
            constructor() {
                super({
                    id: exports.$Oub,
                    title: { value: (0, nls_1.localize)(14, null), original: 'Focus First Side in Active Editor' },
                    category: actionCommonCategories_1.$Nl.View,
                    precondition: contextkey_1.$Ii.or(contextkeys_1.$cdb, contextkeys_1.$bdb),
                    f1: true
                });
            }
            async run(accessor) {
                const editorService = accessor.get(editorService_1.$9C);
                const commandService = accessor.get(commands_1.$Fr);
                const activeEditorPane = editorService.activeEditorPane;
                if (activeEditorPane instanceof sideBySideEditor_1.$dub) {
                    activeEditorPane.getSecondaryEditorPane()?.focus();
                }
                else if (activeEditorPane instanceof textDiffEditor_1.$$tb) {
                    await commandService.executeCommand(exports.$Cub);
                }
            }
        });
        (0, actions_1.$Xu)(class extends actions_1.$Wu {
            constructor() {
                super({
                    id: exports.$Pub,
                    title: { value: (0, nls_1.localize)(15, null), original: 'Focus Second Side in Active Editor' },
                    category: actionCommonCategories_1.$Nl.View,
                    precondition: contextkey_1.$Ii.or(contextkeys_1.$cdb, contextkeys_1.$bdb),
                    f1: true
                });
            }
            async run(accessor) {
                const editorService = accessor.get(editorService_1.$9C);
                const commandService = accessor.get(commands_1.$Fr);
                const activeEditorPane = editorService.activeEditorPane;
                if (activeEditorPane instanceof sideBySideEditor_1.$dub) {
                    activeEditorPane.getPrimaryEditorPane()?.focus();
                }
                else if (activeEditorPane instanceof textDiffEditor_1.$$tb) {
                    await commandService.executeCommand(exports.$Bub);
                }
            }
        });
        (0, actions_1.$Xu)(class extends actions_1.$Wu {
            constructor() {
                super({
                    id: exports.$Qub,
                    title: { value: (0, nls_1.localize)(16, null), original: 'Focus Other Side in Active Editor' },
                    category: actionCommonCategories_1.$Nl.View,
                    precondition: contextkey_1.$Ii.or(contextkeys_1.$cdb, contextkeys_1.$bdb),
                    f1: true
                });
            }
            async run(accessor) {
                const editorService = accessor.get(editorService_1.$9C);
                const commandService = accessor.get(commands_1.$Fr);
                const activeEditorPane = editorService.activeEditorPane;
                if (activeEditorPane instanceof sideBySideEditor_1.$dub) {
                    if (activeEditorPane.getPrimaryEditorPane()?.hasFocus()) {
                        activeEditorPane.getSecondaryEditorPane()?.focus();
                    }
                    else {
                        activeEditorPane.getPrimaryEditorPane()?.focus();
                    }
                }
                else if (activeEditorPane instanceof textDiffEditor_1.$$tb) {
                    await commandService.executeCommand(exports.$Dub);
                }
            }
        });
    }
    function registerOtherEditorCommands() {
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: exports.$pub,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: undefined,
            primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 3 /* KeyCode.Enter */),
            handler: async (accessor, resourceOrContext, context) => {
                const editorGroupService = accessor.get(editorGroupsService_1.$5C);
                const { group, editor } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
                if (group && editor) {
                    return group.pinEditor(editor);
                }
            }
        });
        commands_1.$Gr.registerCommand({
            id: exports.$qub,
            handler: accessor => {
                const configurationService = accessor.get(configuration_1.$8h);
                const currentSetting = configurationService.getValue('workbench.editor.enablePreview');
                const newSetting = currentSetting === true ? false : true;
                configurationService.updateValue('workbench.editor.enablePreview', newSetting);
            }
        });
        function setEditorGroupLock(accessor, resourceOrContext, context, locked) {
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
            const { group } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
            group?.lock(locked ?? !group.isLocked);
        }
        (0, actions_1.$Xu)(class extends actions_1.$Wu {
            constructor() {
                super({
                    id: exports.$rub,
                    title: { value: (0, nls_1.localize)(17, null), original: 'Toggle Editor Group Lock' },
                    category: actionCommonCategories_1.$Nl.View,
                    precondition: contextkeys_1.$idb,
                    f1: true
                });
            }
            async run(accessor, resourceOrContext, context) {
                setEditorGroupLock(accessor, resourceOrContext, context);
            }
        });
        (0, actions_1.$Xu)(class extends actions_1.$Wu {
            constructor() {
                super({
                    id: exports.$sub,
                    title: { value: (0, nls_1.localize)(18, null), original: 'Lock Editor Group' },
                    category: actionCommonCategories_1.$Nl.View,
                    precondition: contextkey_1.$Ii.and(contextkeys_1.$idb, contextkeys_1.$hdb.toNegated()),
                    f1: true
                });
            }
            async run(accessor, resourceOrContext, context) {
                setEditorGroupLock(accessor, resourceOrContext, context, true);
            }
        });
        (0, actions_1.$Xu)(class extends actions_1.$Wu {
            constructor() {
                super({
                    id: exports.$tub,
                    title: { value: (0, nls_1.localize)(19, null), original: 'Unlock Editor Group' },
                    precondition: contextkey_1.$Ii.and(contextkeys_1.$idb, contextkeys_1.$hdb),
                    category: actionCommonCategories_1.$Nl.View,
                    f1: true
                });
            }
            async run(accessor, resourceOrContext, context) {
                setEditorGroupLock(accessor, resourceOrContext, context, false);
            }
        });
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: exports.$wub,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkeys_1.$6cb.toNegated(),
            primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */),
            handler: async (accessor, resourceOrContext, context) => {
                const editorGroupService = accessor.get(editorGroupsService_1.$5C);
                const { group, editor } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
                if (group && editor) {
                    return group.stickEditor(editor);
                }
            }
        });
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: exports.$Eub,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: editorContextKeys_1.EditorContextKeys.inDiffEditor,
            primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 1024 /* KeyMod.Shift */ | 45 /* KeyCode.KeyO */),
            handler: async (accessor) => {
                const editorService = accessor.get(editorService_1.$9C);
                const editorGroupService = accessor.get(editorGroupsService_1.$5C);
                const activeEditor = editorService.activeEditor;
                const activeTextEditorControl = editorService.activeTextEditorControl;
                if (!(0, editorBrowser_1.$jV)(activeTextEditorControl) || !(activeEditor instanceof diffEditorInput_1.$3eb)) {
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
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: exports.$xub,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkeys_1.$6cb,
            primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */),
            handler: async (accessor, resourceOrContext, context) => {
                const editorGroupService = accessor.get(editorGroupsService_1.$5C);
                const { group, editor } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
                if (group && editor) {
                    return group.unstickEditor(editor);
                }
            }
        });
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: exports.$uub,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: undefined,
            primary: undefined,
            handler: (accessor, resourceOrContext, context) => {
                const editorGroupService = accessor.get(editorGroupsService_1.$5C);
                const quickInputService = accessor.get(quickInput_1.$Gq);
                const commandsContext = getCommandsContext(resourceOrContext, context);
                if (commandsContext && typeof commandsContext.groupId === 'number') {
                    const group = editorGroupService.getGroup(commandsContext.groupId);
                    if (group) {
                        editorGroupService.activateGroup(group); // we need the group to be active
                    }
                }
                return quickInputService.quickAccess.show(editorQuickAccess_1.$aub.PREFIX);
            }
        });
    }
    function getEditorsContext(accessor, resourceOrContext, context) {
        const editorGroupService = accessor.get(editorGroupsService_1.$5C);
        const listService = accessor.get(listService_1.$03);
        const editorContext = $1ub(getCommandsContext(resourceOrContext, context), listService, editorGroupService);
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
            groups: (0, arrays_1.$Kb)(editorContext.map(context => context.groupId)).map(groupId => editorGroupService.getGroup(groupId))
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
    function $1ub(editorContext, listService, editorGroupService) {
        // First check for a focused list to return the selected items from
        const list = listService.lastFocusedList;
        if (list instanceof listWidget_1.$wQ && list.getHTMLElement() === document.activeElement) {
            const elementToContext = (element) => {
                if ((0, editorGroupsService_1.$7C)(element)) {
                    return { groupId: element.id, editorIndex: undefined };
                }
                const group = editorGroupService.getGroup(element.groupId);
                return { groupId: element.groupId, editorIndex: group ? group.getIndexOfEditor(element.editor) : -1 };
            };
            const onlyEditorGroupAndEditor = (e) => (0, editorGroupsService_1.$7C)(e) || (0, editor_1.$1E)(e);
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
    exports.$1ub = $1ub;
    function $2ub() {
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
    exports.$2ub = $2ub;
});
//# sourceMappingURL=editorCommands.js.map