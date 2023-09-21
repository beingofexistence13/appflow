/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/nls!vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/common/notebookRange", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/platform/telemetry/common/telemetry", "vs/base/common/resources"], function (require, exports, uri_1, nls_1, actions_1, contextkey_1, notebookBrowser_1, notebookContextKeys_1, notebookRange_1, editorService_1, notebookEditorService_1, telemetry_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$hpb = exports.$gpb = exports.$fpb = exports.$epb = exports.$dpb = exports.$cpb = exports.$bpb = exports.$apb = exports.$_ob = exports.$$ob = exports.CellOverflowToolbarGroups = exports.CellToolbarOrder = exports.$0ob = exports.$9ob = exports.$8ob = exports.$7ob = exports.$6ob = void 0;
    // Kernel Command
    exports.$6ob = '_notebook.selectKernel';
    exports.$7ob = { value: (0, nls_1.localize)(0, null), original: 'Notebook' };
    exports.$8ob = 'inline/cell';
    exports.$9ob = 'inline/output';
    exports.$0ob = 100 /* KeybindingWeight.EditorContrib */; // smaller than Suggest Widget, etc
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
    function $$ob(editorService) {
        const editor = (0, notebookBrowser_1.$Zbb)(editorService.activeEditorPane);
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
    exports.$$ob = $$ob;
    function getWidgetFromUri(accessor, uri) {
        const notebookEditorService = accessor.get(notebookEditorService_1.$1rb);
        const widget = notebookEditorService.listNotebookEditors().find(widget => widget.hasModel() && widget.textModel.uri.toString() === uri.toString());
        if (widget && widget.hasModel()) {
            return widget;
        }
        return undefined;
    }
    function $_ob(accessor, context) {
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
    exports.$_ob = $_ob;
    function $apb(context, targetCell) {
        let foundEditor = undefined;
        for (const [, codeEditor] of context.notebookEditor.codeEditors) {
            if ((0, resources_1.$bg)(codeEditor.getModel()?.uri, targetCell.uri)) {
                foundEditor = codeEditor;
                break;
            }
        }
        return foundEditor;
    }
    exports.$apb = $apb;
    class $bpb extends actions_1.$Wu {
        constructor(desc) {
            if (desc.f1 !== false) {
                desc.f1 = false;
                const f1Menu = {
                    id: actions_1.$Ru.CommandPalette,
                    when: contextkey_1.$Ii.or(notebookContextKeys_1.$Wnb, notebookContextKeys_1.$Xnb)
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
            desc.category = exports.$7ob;
            super(desc);
        }
        async run(accessor, context, ...additionalArgs) {
            const isFromUI = !!context;
            const from = isFromUI ? (this.c(context) ? 'notebookToolbar' : 'editorToolbar') : undefined;
            if (!this.c(context)) {
                context = this.getEditorContextFromArgsOrActive(accessor, context, ...additionalArgs);
                if (!context) {
                    return;
                }
            }
            if (from !== undefined) {
                const telemetryService = accessor.get(telemetry_1.$9k);
                telemetryService.publicLog2('workbenchActionExecuted', { id: this.desc.id, from: from });
            }
            return this.runWithContext(accessor, context);
        }
        c(context) {
            return !!context && !!context.notebookEditor;
        }
        getEditorContextFromArgsOrActive(accessor, context, ...additionalArgs) {
            return $$ob(accessor.get(editorService_1.$9C));
        }
    }
    exports.$bpb = $bpb;
    // todo@rebornix, replace NotebookAction with this
    class $cpb extends actions_1.$Wu {
        constructor(desc) {
            if (desc.f1 !== false) {
                desc.f1 = false;
                const f1Menu = {
                    id: actions_1.$Ru.CommandPalette,
                    when: notebookContextKeys_1.$Wnb
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
            desc.category = exports.$7ob;
            super(desc);
        }
        parseArgs(accessor, ...args) {
            return undefined;
        }
        a(context) {
            return !!context && !!context.notebookEditor && context.$mid === 13 /* MarshalledId.NotebookCellActionContext */;
        }
        b(context) {
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
            const isFromCellToolbar = this.a(context);
            const isFromEditorToolbar = this.b(context);
            const from = isFromCellToolbar ? 'cellToolbar' : (isFromEditorToolbar ? 'editorToolbar' : 'other');
            const telemetryService = accessor.get(telemetry_1.$9k);
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
            const editor = $fpb(accessor);
            if (editor) {
                telemetryService.publicLog2('workbenchActionExecuted', { id: this.desc.id, from: from });
                return this.runWithContext(accessor, {
                    ui: false,
                    notebookEditor: editor,
                    selectedCells: (0, notebookBrowser_1.$2bb)(editor, editor.getSelections())
                });
            }
        }
    }
    exports.$cpb = $cpb;
    class $dpb extends $bpb {
        d(context) {
            return !!context && !!context.notebookEditor && !!context.cell;
        }
        e(accessor, context, ...additionalArgs) {
            return undefined;
        }
        async run(accessor, context, ...additionalArgs) {
            if (this.d(context)) {
                const telemetryService = accessor.get(telemetry_1.$9k);
                telemetryService.publicLog2('workbenchActionExecuted', { id: this.desc.id, from: 'cellToolbar' });
                return this.runWithContext(accessor, context);
            }
            const contextFromArgs = this.e(accessor, context, ...additionalArgs);
            if (contextFromArgs) {
                return this.runWithContext(accessor, contextFromArgs);
            }
            const activeEditorContext = this.getEditorContextFromArgsOrActive(accessor);
            if (this.d(activeEditorContext)) {
                return this.runWithContext(accessor, activeEditorContext);
            }
        }
    }
    exports.$dpb = $dpb;
    exports.$epb = contextkey_1.$Ii.or(contextkey_1.$Ii.greater(notebookContextKeys_1.$mob.key, 0), contextkey_1.$Ii.greater(notebookContextKeys_1.$nob.key, 0));
    function isMultiCellArgs(arg) {
        if (arg === undefined) {
            return false;
        }
        const ranges = arg.ranges;
        if (!ranges) {
            return false;
        }
        if (!Array.isArray(ranges) || ranges.some(range => !(0, notebookRange_1.$NH)(range))) {
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
    function $fpb(accessor, context) {
        const editorFromUri = $_ob(accessor, context)?.notebookEditor;
        if (editorFromUri) {
            return editorFromUri;
        }
        const editor = (0, notebookBrowser_1.$Zbb)(accessor.get(editorService_1.$9C).activeEditorPane);
        if (!editor || !editor.hasModel()) {
            return;
        }
        return editor;
    }
    exports.$fpb = $fpb;
    function $gpb(accessor, ...args) {
        const firstArg = args[0];
        if (isMultiCellArgs(firstArg)) {
            const editor = $fpb(accessor, firstArg.document);
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
        if ((0, notebookRange_1.$NH)(firstArg)) {
            // cellRange, document
            const secondArg = args[1];
            const editor = $fpb(accessor, secondArg);
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
        const context = $$ob(accessor.get(editorService_1.$9C));
        return context ? {
            ui: false,
            notebookEditor: context.notebookEditor,
            selectedCells: context.selectedCells ?? []
        } : undefined;
    }
    exports.$gpb = $gpb;
    exports.$hpb = [
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
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.NotebookCellTitle, {
        submenu: actions_1.$Ru.NotebookCellInsert,
        title: (0, nls_1.localize)(1, null),
        group: "2_insert" /* CellOverflowToolbarGroups.Insert */,
        when: notebookContextKeys_1.$3nb.isEqualTo(true)
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorContext, {
        submenu: actions_1.$Ru.NotebookCellTitle,
        title: (0, nls_1.localize)(2, null),
        group: "2_insert" /* CellOverflowToolbarGroups.Insert */,
        when: notebookContextKeys_1.$Ynb
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.NotebookCellTitle, {
        title: (0, nls_1.localize)(3, null),
        submenu: actions_1.$Ru.EditorContextShare,
        group: "4_share" /* CellOverflowToolbarGroups.Share */
    });
});
//# sourceMappingURL=coreActions.js.map