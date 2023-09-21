/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/common/notebookRange", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/platform/telemetry/common/telemetry", "vs/base/common/resources"], function (require, exports, uri_1, nls_1, actions_1, contextkey_1, notebookBrowser_1, notebookContextKeys_1, notebookRange_1, editorService_1, notebookEditorService_1, telemetry_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cellExecutionArgs = exports.parseMultiCellExecutionArgs = exports.getEditorFromArgsOrActivePane = exports.executeNotebookCondition = exports.NotebookCellAction = exports.NotebookMultiCellAction = exports.NotebookAction = exports.findTargetCellEditor = exports.getContextFromUri = exports.getContextFromActiveEditor = exports.CellOverflowToolbarGroups = exports.CellToolbarOrder = exports.NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT = exports.CELL_TITLE_OUTPUT_GROUP_ID = exports.CELL_TITLE_CELL_GROUP_ID = exports.NOTEBOOK_ACTIONS_CATEGORY = exports.SELECT_KERNEL_ID = void 0;
    // Kernel Command
    exports.SELECT_KERNEL_ID = '_notebook.selectKernel';
    exports.NOTEBOOK_ACTIONS_CATEGORY = { value: (0, nls_1.localize)('notebookActions.category', "Notebook"), original: 'Notebook' };
    exports.CELL_TITLE_CELL_GROUP_ID = 'inline/cell';
    exports.CELL_TITLE_OUTPUT_GROUP_ID = 'inline/output';
    exports.NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT = 100 /* KeybindingWeight.EditorContrib */; // smaller than Suggest Widget, etc
    var CellToolbarOrder;
    (function (CellToolbarOrder) {
        CellToolbarOrder[CellToolbarOrder["EditCell"] = 0] = "EditCell";
        CellToolbarOrder[CellToolbarOrder["ExecuteAboveCells"] = 1] = "ExecuteAboveCells";
        CellToolbarOrder[CellToolbarOrder["ExecuteCellAndBelow"] = 2] = "ExecuteCellAndBelow";
        CellToolbarOrder[CellToolbarOrder["SaveCell"] = 3] = "SaveCell";
        CellToolbarOrder[CellToolbarOrder["SplitCell"] = 4] = "SplitCell";
        CellToolbarOrder[CellToolbarOrder["ClearCellOutput"] = 5] = "ClearCellOutput";
    })(CellToolbarOrder || (exports.CellToolbarOrder = CellToolbarOrder = {}));
    var CellOverflowToolbarGroups;
    (function (CellOverflowToolbarGroups) {
        CellOverflowToolbarGroups["Copy"] = "1_copy";
        CellOverflowToolbarGroups["Insert"] = "2_insert";
        CellOverflowToolbarGroups["Edit"] = "3_edit";
        CellOverflowToolbarGroups["Share"] = "4_share";
    })(CellOverflowToolbarGroups || (exports.CellOverflowToolbarGroups = CellOverflowToolbarGroups = {}));
    function getContextFromActiveEditor(editorService) {
        const editor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(editorService.activeEditorPane);
        if (!editor || !editor.hasModel()) {
            return;
        }
        const activeCell = editor.getActiveCell();
        const selectedCells = editor.getSelectionViewModels();
        return {
            cell: activeCell,
            selectedCells,
            notebookEditor: editor
        };
    }
    exports.getContextFromActiveEditor = getContextFromActiveEditor;
    function getWidgetFromUri(accessor, uri) {
        const notebookEditorService = accessor.get(notebookEditorService_1.INotebookEditorService);
        const widget = notebookEditorService.listNotebookEditors().find(widget => widget.hasModel() && widget.textModel.uri.toString() === uri.toString());
        if (widget && widget.hasModel()) {
            return widget;
        }
        return undefined;
    }
    function getContextFromUri(accessor, context) {
        const uri = uri_1.URI.revive(context);
        if (uri) {
            const widget = getWidgetFromUri(accessor, uri);
            if (widget) {
                return {
                    notebookEditor: widget,
                };
            }
        }
        return undefined;
    }
    exports.getContextFromUri = getContextFromUri;
    function findTargetCellEditor(context, targetCell) {
        let foundEditor = undefined;
        for (const [, codeEditor] of context.notebookEditor.codeEditors) {
            if ((0, resources_1.isEqual)(codeEditor.getModel()?.uri, targetCell.uri)) {
                foundEditor = codeEditor;
                break;
            }
        }
        return foundEditor;
    }
    exports.findTargetCellEditor = findTargetCellEditor;
    class NotebookAction extends actions_1.Action2 {
        constructor(desc) {
            if (desc.f1 !== false) {
                desc.f1 = false;
                const f1Menu = {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyExpr.or(notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR, notebookContextKeys_1.INTERACTIVE_WINDOW_IS_ACTIVE_EDITOR)
                };
                if (!desc.menu) {
                    desc.menu = [];
                }
                else if (!Array.isArray(desc.menu)) {
                    desc.menu = [desc.menu];
                }
                desc.menu = [
                    ...desc.menu,
                    f1Menu
                ];
            }
            desc.category = exports.NOTEBOOK_ACTIONS_CATEGORY;
            super(desc);
        }
        async run(accessor, context, ...additionalArgs) {
            const isFromUI = !!context;
            const from = isFromUI ? (this.isNotebookActionContext(context) ? 'notebookToolbar' : 'editorToolbar') : undefined;
            if (!this.isNotebookActionContext(context)) {
                context = this.getEditorContextFromArgsOrActive(accessor, context, ...additionalArgs);
                if (!context) {
                    return;
                }
            }
            if (from !== undefined) {
                const telemetryService = accessor.get(telemetry_1.ITelemetryService);
                telemetryService.publicLog2('workbenchActionExecuted', { id: this.desc.id, from: from });
            }
            return this.runWithContext(accessor, context);
        }
        isNotebookActionContext(context) {
            return !!context && !!context.notebookEditor;
        }
        getEditorContextFromArgsOrActive(accessor, context, ...additionalArgs) {
            return getContextFromActiveEditor(accessor.get(editorService_1.IEditorService));
        }
    }
    exports.NotebookAction = NotebookAction;
    // todo@rebornix, replace NotebookAction with this
    class NotebookMultiCellAction extends actions_1.Action2 {
        constructor(desc) {
            if (desc.f1 !== false) {
                desc.f1 = false;
                const f1Menu = {
                    id: actions_1.MenuId.CommandPalette,
                    when: notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR
                };
                if (!desc.menu) {
                    desc.menu = [];
                }
                else if (!Array.isArray(desc.menu)) {
                    desc.menu = [desc.menu];
                }
                desc.menu = [
                    ...desc.menu,
                    f1Menu
                ];
            }
            desc.category = exports.NOTEBOOK_ACTIONS_CATEGORY;
            super(desc);
        }
        parseArgs(accessor, ...args) {
            return undefined;
        }
        isCellToolbarContext(context) {
            return !!context && !!context.notebookEditor && context.$mid === 13 /* MarshalledId.NotebookCellActionContext */;
        }
        isEditorContext(context) {
            return !!context && context.groupId !== undefined;
        }
        /**
         * The action/command args are resolved in following order
         * `run(accessor, cellToolbarContext)` from cell toolbar
         * `run(accessor, ...args)` from command service with arguments
         * `run(accessor, undefined)` from keyboard shortcuts, command palatte, etc
         */
        async run(accessor, ...additionalArgs) {
            const context = additionalArgs[0];
            const isFromCellToolbar = this.isCellToolbarContext(context);
            const isFromEditorToolbar = this.isEditorContext(context);
            const from = isFromCellToolbar ? 'cellToolbar' : (isFromEditorToolbar ? 'editorToolbar' : 'other');
            const telemetryService = accessor.get(telemetry_1.ITelemetryService);
            if (isFromCellToolbar) {
                telemetryService.publicLog2('workbenchActionExecuted', { id: this.desc.id, from: from });
                return this.runWithContext(accessor, context);
            }
            // handle parsed args
            const parsedArgs = this.parseArgs(accessor, ...additionalArgs);
            if (parsedArgs) {
                telemetryService.publicLog2('workbenchActionExecuted', { id: this.desc.id, from: from });
                return this.runWithContext(accessor, parsedArgs);
            }
            // no parsed args, try handle active editor
            const editor = getEditorFromArgsOrActivePane(accessor);
            if (editor) {
                telemetryService.publicLog2('workbenchActionExecuted', { id: this.desc.id, from: from });
                return this.runWithContext(accessor, {
                    ui: false,
                    notebookEditor: editor,
                    selectedCells: (0, notebookBrowser_1.cellRangeToViewCells)(editor, editor.getSelections())
                });
            }
        }
    }
    exports.NotebookMultiCellAction = NotebookMultiCellAction;
    class NotebookCellAction extends NotebookAction {
        isCellActionContext(context) {
            return !!context && !!context.notebookEditor && !!context.cell;
        }
        getCellContextFromArgs(accessor, context, ...additionalArgs) {
            return undefined;
        }
        async run(accessor, context, ...additionalArgs) {
            if (this.isCellActionContext(context)) {
                const telemetryService = accessor.get(telemetry_1.ITelemetryService);
                telemetryService.publicLog2('workbenchActionExecuted', { id: this.desc.id, from: 'cellToolbar' });
                return this.runWithContext(accessor, context);
            }
            const contextFromArgs = this.getCellContextFromArgs(accessor, context, ...additionalArgs);
            if (contextFromArgs) {
                return this.runWithContext(accessor, contextFromArgs);
            }
            const activeEditorContext = this.getEditorContextFromArgsOrActive(accessor);
            if (this.isCellActionContext(activeEditorContext)) {
                return this.runWithContext(accessor, activeEditorContext);
            }
        }
    }
    exports.NotebookCellAction = NotebookCellAction;
    exports.executeNotebookCondition = contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.greater(notebookContextKeys_1.NOTEBOOK_KERNEL_COUNT.key, 0), contextkey_1.ContextKeyExpr.greater(notebookContextKeys_1.NOTEBOOK_KERNEL_SOURCE_COUNT.key, 0));
    function isMultiCellArgs(arg) {
        if (arg === undefined) {
            return false;
        }
        const ranges = arg.ranges;
        if (!ranges) {
            return false;
        }
        if (!Array.isArray(ranges) || ranges.some(range => !(0, notebookRange_1.isICellRange)(range))) {
            return false;
        }
        if (arg.document) {
            const uri = uri_1.URI.revive(arg.document);
            if (!uri) {
                return false;
            }
        }
        return true;
    }
    function getEditorFromArgsOrActivePane(accessor, context) {
        const editorFromUri = getContextFromUri(accessor, context)?.notebookEditor;
        if (editorFromUri) {
            return editorFromUri;
        }
        const editor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(accessor.get(editorService_1.IEditorService).activeEditorPane);
        if (!editor || !editor.hasModel()) {
            return;
        }
        return editor;
    }
    exports.getEditorFromArgsOrActivePane = getEditorFromArgsOrActivePane;
    function parseMultiCellExecutionArgs(accessor, ...args) {
        const firstArg = args[0];
        if (isMultiCellArgs(firstArg)) {
            const editor = getEditorFromArgsOrActivePane(accessor, firstArg.document);
            if (!editor) {
                return;
            }
            const ranges = firstArg.ranges;
            const selectedCells = ranges.map(range => editor.getCellsInRange(range).slice(0)).flat();
            const autoReveal = firstArg.autoReveal;
            return {
                ui: false,
                notebookEditor: editor,
                selectedCells,
                autoReveal
            };
        }
        // handle legacy arguments
        if ((0, notebookRange_1.isICellRange)(firstArg)) {
            // cellRange, document
            const secondArg = args[1];
            const editor = getEditorFromArgsOrActivePane(accessor, secondArg);
            if (!editor) {
                return;
            }
            return {
                ui: false,
                notebookEditor: editor,
                selectedCells: editor.getCellsInRange(firstArg)
            };
        }
        // let's just execute the active cell
        const context = getContextFromActiveEditor(accessor.get(editorService_1.IEditorService));
        return context ? {
            ui: false,
            notebookEditor: context.notebookEditor,
            selectedCells: context.selectedCells ?? []
        } : undefined;
    }
    exports.parseMultiCellExecutionArgs = parseMultiCellExecutionArgs;
    exports.cellExecutionArgs = [
        {
            isOptional: true,
            name: 'options',
            description: 'The cell range options',
            schema: {
                'type': 'object',
                'required': ['ranges'],
                'properties': {
                    'ranges': {
                        'type': 'array',
                        items: [
                            {
                                'type': 'object',
                                'required': ['start', 'end'],
                                'properties': {
                                    'start': {
                                        'type': 'number'
                                    },
                                    'end': {
                                        'type': 'number'
                                    }
                                }
                            }
                        ]
                    },
                    'document': {
                        'type': 'object',
                        'description': 'The document uri',
                    },
                    'autoReveal': {
                        'type': 'boolean',
                        'description': 'Whether the cell should be revealed into view automatically'
                    }
                }
            }
        }
    ];
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.NotebookCellTitle, {
        submenu: actions_1.MenuId.NotebookCellInsert,
        title: (0, nls_1.localize)('notebookMenu.insertCell', "Insert Cell"),
        group: "2_insert" /* CellOverflowToolbarGroups.Insert */,
        when: notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true)
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorContext, {
        submenu: actions_1.MenuId.NotebookCellTitle,
        title: (0, nls_1.localize)('notebookMenu.cellTitle', "Notebook Cell"),
        group: "2_insert" /* CellOverflowToolbarGroups.Insert */,
        when: notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.NotebookCellTitle, {
        title: (0, nls_1.localize)('miShare', "Share"),
        submenu: actions_1.MenuId.EditorContextShare,
        group: "4_share" /* CellOverflowToolbarGroups.Share */
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZUFjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL2NvbnRyb2xsZXIvY29yZUFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBc0JoRyxpQkFBaUI7SUFDSixRQUFBLGdCQUFnQixHQUFHLHdCQUF3QixDQUFDO0lBQzVDLFFBQUEseUJBQXlCLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsMEJBQTBCLEVBQUUsVUFBVSxDQUFDLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxDQUFDO0lBRTlHLFFBQUEsd0JBQXdCLEdBQUcsYUFBYSxDQUFDO0lBQ3pDLFFBQUEsMEJBQTBCLEdBQUcsZUFBZSxDQUFDO0lBRTdDLFFBQUEsb0NBQW9DLDRDQUFrQyxDQUFDLG1DQUFtQztJQUV2SCxJQUFrQixnQkFPakI7SUFQRCxXQUFrQixnQkFBZ0I7UUFDakMsK0RBQVEsQ0FBQTtRQUNSLGlGQUFpQixDQUFBO1FBQ2pCLHFGQUFtQixDQUFBO1FBQ25CLCtEQUFRLENBQUE7UUFDUixpRUFBUyxDQUFBO1FBQ1QsNkVBQWUsQ0FBQTtJQUNoQixDQUFDLEVBUGlCLGdCQUFnQixnQ0FBaEIsZ0JBQWdCLFFBT2pDO0lBRUQsSUFBa0IseUJBS2pCO0lBTEQsV0FBa0IseUJBQXlCO1FBQzFDLDRDQUFlLENBQUE7UUFDZixnREFBbUIsQ0FBQTtRQUNuQiw0Q0FBZSxDQUFBO1FBQ2YsOENBQWlCLENBQUE7SUFDbEIsQ0FBQyxFQUxpQix5QkFBeUIseUNBQXpCLHlCQUF5QixRQUsxQztJQTRCRCxTQUFnQiwwQkFBMEIsQ0FBQyxhQUE2QjtRQUN2RSxNQUFNLE1BQU0sR0FBRyxJQUFBLGlEQUErQixFQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQy9FLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUU7WUFDbEMsT0FBTztTQUNQO1FBRUQsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQzFDLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1FBQ3RELE9BQU87WUFDTixJQUFJLEVBQUUsVUFBVTtZQUNoQixhQUFhO1lBQ2IsY0FBYyxFQUFFLE1BQU07U0FDdEIsQ0FBQztJQUNILENBQUM7SUFiRCxnRUFhQztJQUVELFNBQVMsZ0JBQWdCLENBQUMsUUFBMEIsRUFBRSxHQUFRO1FBQzdELE1BQU0scUJBQXFCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4Q0FBc0IsQ0FBQyxDQUFDO1FBQ25FLE1BQU0sTUFBTSxHQUFHLHFCQUFxQixDQUFDLG1CQUFtQixFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBRW5KLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRTtZQUNoQyxPQUFPLE1BQU0sQ0FBQztTQUNkO1FBRUQsT0FBTyxTQUFTLENBQUM7SUFDbEIsQ0FBQztJQUVELFNBQWdCLGlCQUFpQixDQUFDLFFBQTBCLEVBQUUsT0FBYTtRQUMxRSxNQUFNLEdBQUcsR0FBRyxTQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRWhDLElBQUksR0FBRyxFQUFFO1lBQ1IsTUFBTSxNQUFNLEdBQUcsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBRS9DLElBQUksTUFBTSxFQUFFO2dCQUNYLE9BQU87b0JBQ04sY0FBYyxFQUFFLE1BQU07aUJBQ3RCLENBQUM7YUFDRjtTQUNEO1FBRUQsT0FBTyxTQUFTLENBQUM7SUFDbEIsQ0FBQztJQWRELDhDQWNDO0lBRUQsU0FBZ0Isb0JBQW9CLENBQUMsT0FBbUMsRUFBRSxVQUEwQjtRQUNuRyxJQUFJLFdBQVcsR0FBNEIsU0FBUyxDQUFDO1FBQ3JELEtBQUssTUFBTSxDQUFDLEVBQUUsVUFBVSxDQUFDLElBQUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUU7WUFDaEUsSUFBSSxJQUFBLG1CQUFPLEVBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxFQUFFLEdBQUcsRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ3hELFdBQVcsR0FBRyxVQUFVLENBQUM7Z0JBQ3pCLE1BQU07YUFDTjtTQUNEO1FBRUQsT0FBTyxXQUFXLENBQUM7SUFDcEIsQ0FBQztJQVZELG9EQVVDO0lBRUQsTUFBc0IsY0FBZSxTQUFRLGlCQUFPO1FBQ25ELFlBQVksSUFBcUI7WUFDaEMsSUFBSSxJQUFJLENBQUMsRUFBRSxLQUFLLEtBQUssRUFBRTtnQkFDdEIsSUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLENBQUM7Z0JBQ2hCLE1BQU0sTUFBTSxHQUFHO29CQUNkLEVBQUUsRUFBRSxnQkFBTSxDQUFDLGNBQWM7b0JBQ3pCLElBQUksRUFBRSwyQkFBYyxDQUFDLEVBQUUsQ0FBQywrQ0FBeUIsRUFBRSx5REFBbUMsQ0FBQztpQkFDdkYsQ0FBQztnQkFFRixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtvQkFDZixJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztpQkFDZjtxQkFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ3JDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ3hCO2dCQUVELElBQUksQ0FBQyxJQUFJLEdBQUc7b0JBQ1gsR0FBRyxJQUFJLENBQUMsSUFBSTtvQkFDWixNQUFNO2lCQUNOLENBQUM7YUFDRjtZQUVELElBQUksQ0FBQyxRQUFRLEdBQUcsaUNBQXlCLENBQUM7WUFFMUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2IsQ0FBQztRQUVELEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEIsRUFBRSxPQUFhLEVBQUUsR0FBRyxjQUFxQjtZQUM1RSxNQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDO1lBQzNCLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQ2xILElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQzNDLE9BQU8sR0FBRyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxHQUFHLGNBQWMsQ0FBQyxDQUFDO2dCQUN0RixJQUFJLENBQUMsT0FBTyxFQUFFO29CQUNiLE9BQU87aUJBQ1A7YUFDRDtZQUVELElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRTtnQkFDdkIsTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDZCQUFpQixDQUFDLENBQUM7Z0JBQ3pELGdCQUFnQixDQUFDLFVBQVUsQ0FBc0UseUJBQXlCLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7YUFDOUo7WUFFRCxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFJTyx1QkFBdUIsQ0FBQyxPQUFpQjtZQUNoRCxPQUFPLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFFLE9BQWtDLENBQUMsY0FBYyxDQUFDO1FBQzFFLENBQUM7UUFFRCxnQ0FBZ0MsQ0FBQyxRQUEwQixFQUFFLE9BQWEsRUFBRSxHQUFHLGNBQXFCO1lBQ25HLE9BQU8sMEJBQTBCLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4QkFBYyxDQUFDLENBQUMsQ0FBQztRQUNqRSxDQUFDO0tBQ0Q7SUFyREQsd0NBcURDO0lBRUQsa0RBQWtEO0lBQ2xELE1BQXNCLHVCQUF3QixTQUFRLGlCQUFPO1FBQzVELFlBQVksSUFBcUI7WUFDaEMsSUFBSSxJQUFJLENBQUMsRUFBRSxLQUFLLEtBQUssRUFBRTtnQkFDdEIsSUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLENBQUM7Z0JBQ2hCLE1BQU0sTUFBTSxHQUFHO29CQUNkLEVBQUUsRUFBRSxnQkFBTSxDQUFDLGNBQWM7b0JBQ3pCLElBQUksRUFBRSwrQ0FBeUI7aUJBQy9CLENBQUM7Z0JBRUYsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7b0JBQ2YsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7aUJBQ2Y7cUJBQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUNyQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUN4QjtnQkFFRCxJQUFJLENBQUMsSUFBSSxHQUFHO29CQUNYLEdBQUcsSUFBSSxDQUFDLElBQUk7b0JBQ1osTUFBTTtpQkFDTixDQUFDO2FBQ0Y7WUFFRCxJQUFJLENBQUMsUUFBUSxHQUFHLGlDQUF5QixDQUFDO1lBRTFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNiLENBQUM7UUFFRCxTQUFTLENBQUMsUUFBMEIsRUFBRSxHQUFHLElBQVc7WUFDbkQsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUlPLG9CQUFvQixDQUFDLE9BQWlCO1lBQzdDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUUsT0FBa0MsQ0FBQyxjQUFjLElBQUssT0FBZSxDQUFDLElBQUksb0RBQTJDLENBQUM7UUFDOUksQ0FBQztRQUNPLGVBQWUsQ0FBQyxPQUFpQjtZQUN4QyxPQUFPLENBQUMsQ0FBQyxPQUFPLElBQUssT0FBa0MsQ0FBQyxPQUFPLEtBQUssU0FBUyxDQUFDO1FBQy9FLENBQUM7UUFFRDs7Ozs7V0FLRztRQUNILEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEIsRUFBRSxHQUFHLGNBQXFCO1lBQzdELE1BQU0sT0FBTyxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQyxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM3RCxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDMUQsTUFBTSxJQUFJLEdBQUcsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNuRyxNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsNkJBQWlCLENBQUMsQ0FBQztZQUV6RCxJQUFJLGlCQUFpQixFQUFFO2dCQUN0QixnQkFBZ0IsQ0FBQyxVQUFVLENBQXNFLHlCQUF5QixFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUM5SixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2FBQzlDO1lBRUQscUJBQXFCO1lBRXJCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLEdBQUcsY0FBYyxDQUFDLENBQUM7WUFDL0QsSUFBSSxVQUFVLEVBQUU7Z0JBQ2YsZ0JBQWdCLENBQUMsVUFBVSxDQUFzRSx5QkFBeUIsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDOUosT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQzthQUNqRDtZQUVELDJDQUEyQztZQUMzQyxNQUFNLE1BQU0sR0FBRyw2QkFBNkIsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN2RCxJQUFJLE1BQU0sRUFBRTtnQkFDWCxnQkFBZ0IsQ0FBQyxVQUFVLENBQXNFLHlCQUF5QixFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUU5SixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFO29CQUNwQyxFQUFFLEVBQUUsS0FBSztvQkFDVCxjQUFjLEVBQUUsTUFBTTtvQkFDdEIsYUFBYSxFQUFFLElBQUEsc0NBQW9CLEVBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztpQkFDbkUsQ0FBQyxDQUFDO2FBQ0g7UUFDRixDQUFDO0tBQ0Q7SUE3RUQsMERBNkVDO0lBRUQsTUFBc0Isa0JBQW1ELFNBQVEsY0FBYztRQUNwRixtQkFBbUIsQ0FBQyxPQUFpQjtZQUM5QyxPQUFPLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFFLE9BQXNDLENBQUMsY0FBYyxJQUFJLENBQUMsQ0FBRSxPQUFzQyxDQUFDLElBQUksQ0FBQztRQUNoSSxDQUFDO1FBRVMsc0JBQXNCLENBQUMsUUFBMEIsRUFBRSxPQUFXLEVBQUUsR0FBRyxjQUFxQjtZQUNqRyxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRVEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQixFQUFFLE9BQW9DLEVBQUUsR0FBRyxjQUFxQjtZQUM1RyxJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDdEMsTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDZCQUFpQixDQUFDLENBQUM7Z0JBQ3pELGdCQUFnQixDQUFDLFVBQVUsQ0FBc0UseUJBQXlCLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUM7Z0JBRXZLLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7YUFDOUM7WUFFRCxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxHQUFHLGNBQWMsQ0FBQyxDQUFDO1lBRTFGLElBQUksZUFBZSxFQUFFO2dCQUNwQixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLGVBQWUsQ0FBQyxDQUFDO2FBQ3REO1lBRUQsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDNUUsSUFBSSxJQUFJLENBQUMsbUJBQW1CLENBQUMsbUJBQW1CLENBQUMsRUFBRTtnQkFDbEQsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO2FBQzFEO1FBQ0YsQ0FBQztLQUdEO0lBOUJELGdEQThCQztJQUVZLFFBQUEsd0JBQXdCLEdBQUcsMkJBQWMsQ0FBQyxFQUFFLENBQUMsMkJBQWMsQ0FBQyxPQUFPLENBQUMsMkNBQXFCLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLDJCQUFjLENBQUMsT0FBTyxDQUFDLGtEQUE0QixDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBUTdLLFNBQVMsZUFBZSxDQUFDLEdBQVk7UUFDcEMsSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFO1lBQ3RCLE9BQU8sS0FBSyxDQUFDO1NBQ2I7UUFDRCxNQUFNLE1BQU0sR0FBSSxHQUFzQixDQUFDLE1BQU0sQ0FBQztRQUM5QyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1osT0FBTyxLQUFLLENBQUM7U0FDYjtRQUVELElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUEsNEJBQVksRUFBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQ3pFLE9BQU8sS0FBSyxDQUFDO1NBQ2I7UUFFRCxJQUFLLEdBQXNCLENBQUMsUUFBUSxFQUFFO1lBQ3JDLE1BQU0sR0FBRyxHQUFHLFNBQUcsQ0FBQyxNQUFNLENBQUUsR0FBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUV6RCxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNULE9BQU8sS0FBSyxDQUFDO2FBQ2I7U0FDRDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVELFNBQWdCLDZCQUE2QixDQUFDLFFBQTBCLEVBQUUsT0FBdUI7UUFDaEcsTUFBTSxhQUFhLEdBQUcsaUJBQWlCLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxFQUFFLGNBQWMsQ0FBQztRQUUzRSxJQUFJLGFBQWEsRUFBRTtZQUNsQixPQUFPLGFBQWEsQ0FBQztTQUNyQjtRQUVELE1BQU0sTUFBTSxHQUFHLElBQUEsaURBQStCLEVBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4QkFBYyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUM5RixJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFO1lBQ2xDLE9BQU87U0FDUDtRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQWJELHNFQWFDO0lBRUQsU0FBZ0IsMkJBQTJCLENBQUMsUUFBMEIsRUFBRSxHQUFHLElBQVc7UUFDckYsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXpCLElBQUksZUFBZSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQzlCLE1BQU0sTUFBTSxHQUFHLDZCQUE2QixDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDMUUsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDWixPQUFPO2FBQ1A7WUFFRCxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQy9CLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3pGLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUM7WUFDdkMsT0FBTztnQkFDTixFQUFFLEVBQUUsS0FBSztnQkFDVCxjQUFjLEVBQUUsTUFBTTtnQkFDdEIsYUFBYTtnQkFDYixVQUFVO2FBQ1YsQ0FBQztTQUNGO1FBRUQsMEJBQTBCO1FBQzFCLElBQUksSUFBQSw0QkFBWSxFQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQzNCLHNCQUFzQjtZQUN0QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUIsTUFBTSxNQUFNLEdBQUcsNkJBQTZCLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ2xFLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1osT0FBTzthQUNQO1lBRUQsT0FBTztnQkFDTixFQUFFLEVBQUUsS0FBSztnQkFDVCxjQUFjLEVBQUUsTUFBTTtnQkFDdEIsYUFBYSxFQUFFLE1BQU0sQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDO2FBQy9DLENBQUM7U0FDRjtRQUVELHFDQUFxQztRQUNyQyxNQUFNLE9BQU8sR0FBRywwQkFBMEIsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFjLENBQUMsQ0FBQyxDQUFDO1FBQ3pFLE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNoQixFQUFFLEVBQUUsS0FBSztZQUNULGNBQWMsRUFBRSxPQUFPLENBQUMsY0FBYztZQUN0QyxhQUFhLEVBQUUsT0FBTyxDQUFDLGFBQWEsSUFBSSxFQUFFO1NBQzFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztJQUNmLENBQUM7SUEzQ0Qsa0VBMkNDO0lBRVksUUFBQSxpQkFBaUIsR0FNekI7UUFDSDtZQUNDLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLElBQUksRUFBRSxTQUFTO1lBQ2YsV0FBVyxFQUFFLHdCQUF3QjtZQUNyQyxNQUFNLEVBQUU7Z0JBQ1AsTUFBTSxFQUFFLFFBQVE7Z0JBQ2hCLFVBQVUsRUFBRSxDQUFDLFFBQVEsQ0FBQztnQkFDdEIsWUFBWSxFQUFFO29CQUNiLFFBQVEsRUFBRTt3QkFDVCxNQUFNLEVBQUUsT0FBTzt3QkFDZixLQUFLLEVBQUU7NEJBQ047Z0NBQ0MsTUFBTSxFQUFFLFFBQVE7Z0NBQ2hCLFVBQVUsRUFBRSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUM7Z0NBQzVCLFlBQVksRUFBRTtvQ0FDYixPQUFPLEVBQUU7d0NBQ1IsTUFBTSxFQUFFLFFBQVE7cUNBQ2hCO29DQUNELEtBQUssRUFBRTt3Q0FDTixNQUFNLEVBQUUsUUFBUTtxQ0FDaEI7aUNBQ0Q7NkJBQ0Q7eUJBQ0Q7cUJBQ0Q7b0JBQ0QsVUFBVSxFQUFFO3dCQUNYLE1BQU0sRUFBRSxRQUFRO3dCQUNoQixhQUFhLEVBQUUsa0JBQWtCO3FCQUNqQztvQkFDRCxZQUFZLEVBQUU7d0JBQ2IsTUFBTSxFQUFFLFNBQVM7d0JBQ2pCLGFBQWEsRUFBRSw2REFBNkQ7cUJBQzVFO2lCQUNEO2FBQ0Q7U0FDRDtLQUNELENBQUM7SUFHSCxzQkFBWSxDQUFDLGNBQWMsQ0FBQyxnQkFBTSxDQUFDLGlCQUFpQixFQUFFO1FBQ3JELE9BQU8sRUFBRSxnQkFBTSxDQUFDLGtCQUFrQjtRQUNsQyxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMseUJBQXlCLEVBQUUsYUFBYSxDQUFDO1FBQ3pELEtBQUssbURBQWtDO1FBQ3ZDLElBQUksRUFBRSw4Q0FBd0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO0tBQzlDLENBQUMsQ0FBQztJQUVILHNCQUFZLENBQUMsY0FBYyxDQUFDLGdCQUFNLENBQUMsYUFBYSxFQUFFO1FBQ2pELE9BQU8sRUFBRSxnQkFBTSxDQUFDLGlCQUFpQjtRQUNqQyxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsd0JBQXdCLEVBQUUsZUFBZSxDQUFDO1FBQzFELEtBQUssbURBQWtDO1FBQ3ZDLElBQUksRUFBRSw2Q0FBdUI7S0FDN0IsQ0FBQyxDQUFDO0lBRUgsc0JBQVksQ0FBQyxjQUFjLENBQUMsZ0JBQU0sQ0FBQyxpQkFBaUIsRUFBRTtRQUNyRCxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQztRQUNuQyxPQUFPLEVBQUUsZ0JBQU0sQ0FBQyxrQkFBa0I7UUFDbEMsS0FBSyxpREFBaUM7S0FDdEMsQ0FBQyxDQUFDIn0=