/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/services/bulkEditService", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/contextkeys", "vs/workbench/contrib/notebook/browser/diff/diffElementViewModel", "vs/workbench/contrib/notebook/browser/diff/notebookDiffEditorBrowser", "vs/workbench/contrib/notebook/browser/diff/notebookDiffEditor", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/services/editor/common/editorService", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/editor", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, bulkEditService_1, nls_1, actions_1, configuration_1, contextkey_1, contextkeys_1, diffElementViewModel_1, notebookDiffEditorBrowser_1, notebookDiffEditor_1, notebookIcons_1, editorService_1, platform_1, configurationRegistry_1, editor_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // ActiveEditorContext.isEqualTo(SearchEditorConstants.SearchEditorID)
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'notebook.diff.switchToText',
                icon: notebookIcons_1.openAsTextIcon,
                title: { value: (0, nls_1.localize)('notebook.diff.switchToText', "Open Text Diff Editor"), original: 'Open Text Diff Editor' },
                precondition: contextkeys_1.ActiveEditorContext.isEqualTo(notebookDiffEditor_1.NotebookTextDiffEditor.ID),
                menu: [{
                        id: actions_1.MenuId.EditorTitle,
                        group: 'navigation',
                        when: contextkeys_1.ActiveEditorContext.isEqualTo(notebookDiffEditor_1.NotebookTextDiffEditor.ID)
                    }]
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const activeEditor = editorService.activeEditorPane;
            if (activeEditor && activeEditor instanceof notebookDiffEditor_1.NotebookTextDiffEditor) {
                const diffEditorInput = activeEditor.input;
                await editorService.openEditor({
                    original: { resource: diffEditorInput.original.resource },
                    modified: { resource: diffEditorInput.resource },
                    label: diffEditorInput.getName(),
                    options: {
                        preserveFocus: false,
                        override: editor_1.DEFAULT_EDITOR_ASSOCIATION.id
                    }
                });
            }
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'notebook.diff.cell.revertMetadata',
                title: (0, nls_1.localize)('notebook.diff.cell.revertMetadata', "Revert Metadata"),
                icon: notebookIcons_1.revertIcon,
                f1: false,
                menu: {
                    id: actions_1.MenuId.NotebookDiffCellMetadataTitle,
                    when: notebookDiffEditorBrowser_1.NOTEBOOK_DIFF_CELL_PROPERTY
                },
                precondition: notebookDiffEditorBrowser_1.NOTEBOOK_DIFF_CELL_PROPERTY
            });
        }
        run(accessor, context) {
            if (!context) {
                return;
            }
            const original = context.cell.original;
            const modified = context.cell.modified;
            if (!original || !modified) {
                return;
            }
            modified.textModel.metadata = original.metadata;
        }
    });
    // registerAction2(class extends Action2 {
    // 	constructor() {
    // 		super(
    // 			{
    // 				id: 'notebook.diff.cell.switchOutputRenderingStyle',
    // 				title: localize('notebook.diff.cell.switchOutputRenderingStyle', "Switch Outputs Rendering"),
    // 				icon: renderOutputIcon,
    // 				f1: false,
    // 				menu: {
    // 					id: MenuId.NotebookDiffCellOutputsTitle
    // 				}
    // 			}
    // 		);
    // 	}
    // 	run(accessor: ServicesAccessor, context?: { cell: DiffElementViewModelBase }) {
    // 		if (!context) {
    // 			return;
    // 		}
    // 		context.cell.renderOutput = true;
    // 	}
    // });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'notebook.diff.cell.switchOutputRenderingStyleToText',
                title: (0, nls_1.localize)('notebook.diff.cell.switchOutputRenderingStyleToText', "Switch Output Rendering"),
                icon: notebookIcons_1.renderOutputIcon,
                f1: false,
                menu: {
                    id: actions_1.MenuId.NotebookDiffCellOutputsTitle,
                    when: notebookDiffEditorBrowser_1.NOTEBOOK_DIFF_CELL_PROPERTY_EXPANDED
                }
            });
        }
        run(accessor, context) {
            if (!context) {
                return;
            }
            context.cell.renderOutput = !context.cell.renderOutput;
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'notebook.diff.cell.revertOutputs',
                title: (0, nls_1.localize)('notebook.diff.cell.revertOutputs', "Revert Outputs"),
                icon: notebookIcons_1.revertIcon,
                f1: false,
                menu: {
                    id: actions_1.MenuId.NotebookDiffCellOutputsTitle,
                    when: notebookDiffEditorBrowser_1.NOTEBOOK_DIFF_CELL_PROPERTY
                },
                precondition: notebookDiffEditorBrowser_1.NOTEBOOK_DIFF_CELL_PROPERTY
            });
        }
        run(accessor, context) {
            if (!context) {
                return;
            }
            if (!(context.cell instanceof diffElementViewModel_1.SideBySideDiffElementViewModel)) {
                return;
            }
            const original = context.cell.original;
            const modified = context.cell.modified;
            const modifiedCellIndex = context.cell.mainDocumentTextModel.cells.indexOf(modified.textModel);
            if (modifiedCellIndex === -1) {
                return;
            }
            context.cell.mainDocumentTextModel.applyEdits([{
                    editType: 2 /* CellEditType.Output */, index: modifiedCellIndex, outputs: original.outputs
                }], true, undefined, () => undefined, undefined, true);
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'notebook.diff.cell.revertInput',
                title: (0, nls_1.localize)('notebook.diff.cell.revertInput', "Revert Input"),
                icon: notebookIcons_1.revertIcon,
                f1: false,
                menu: {
                    id: actions_1.MenuId.NotebookDiffCellInputTitle,
                    when: notebookDiffEditorBrowser_1.NOTEBOOK_DIFF_CELL_INPUT
                },
                precondition: notebookDiffEditorBrowser_1.NOTEBOOK_DIFF_CELL_INPUT
            });
        }
        run(accessor, context) {
            if (!context) {
                return;
            }
            const original = context.cell.original;
            const modified = context.cell.modified;
            if (!original || !modified) {
                return;
            }
            const bulkEditService = accessor.get(bulkEditService_1.IBulkEditService);
            return bulkEditService.apply([
                new bulkEditService_1.ResourceTextEdit(modified.uri, { range: modified.textModel.getFullModelRange(), text: original.textModel.getValue() }),
            ], { quotableLabel: 'Revert Notebook Cell Content Change' });
        }
    });
    class ToggleRenderAction extends actions_1.Action2 {
        constructor(id, title, precondition, toggled, order, toggleOutputs, toggleMetadata) {
            super({
                id: id,
                title,
                precondition: precondition,
                menu: [{
                        id: actions_1.MenuId.EditorTitle,
                        group: 'notebook',
                        when: precondition,
                        order: order,
                    }],
                toggled: toggled
            });
            this.toggleOutputs = toggleOutputs;
            this.toggleMetadata = toggleMetadata;
        }
        async run(accessor) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            if (this.toggleOutputs !== undefined) {
                const oldValue = configurationService.getValue('notebook.diff.ignoreOutputs');
                configurationService.updateValue('notebook.diff.ignoreOutputs', !oldValue);
            }
            if (this.toggleMetadata !== undefined) {
                const oldValue = configurationService.getValue('notebook.diff.ignoreMetadata');
                configurationService.updateValue('notebook.diff.ignoreMetadata', !oldValue);
            }
        }
    }
    (0, actions_1.registerAction2)(class extends ToggleRenderAction {
        constructor() {
            super('notebook.diff.showOutputs', { value: (0, nls_1.localize)('notebook.diff.showOutputs', "Show Outputs Differences"), original: 'Show Outputs Differences' }, contextkeys_1.ActiveEditorContext.isEqualTo(notebookDiffEditor_1.NotebookTextDiffEditor.ID), contextkey_1.ContextKeyExpr.notEquals('config.notebook.diff.ignoreOutputs', true), 2, true, undefined);
        }
    });
    (0, actions_1.registerAction2)(class extends ToggleRenderAction {
        constructor() {
            super('notebook.diff.showMetadata', { value: (0, nls_1.localize)('notebook.diff.showMetadata', "Show Metadata Differences"), original: 'Show Metadata Differences' }, contextkeys_1.ActiveEditorContext.isEqualTo(notebookDiffEditor_1.NotebookTextDiffEditor.ID), contextkey_1.ContextKeyExpr.notEquals('config.notebook.diff.ignoreMetadata', true), 1, undefined, true);
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'notebook.diff.action.previous',
                title: (0, nls_1.localize)('notebook.diff.action.previous.title', "Show Previous Change"),
                icon: notebookIcons_1.previousChangeIcon,
                f1: false,
                keybinding: {
                    primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 61 /* KeyCode.F3 */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkeys_1.ActiveEditorContext.isEqualTo(notebookDiffEditor_1.NotebookTextDiffEditor.ID)
                },
                menu: {
                    id: actions_1.MenuId.EditorTitle,
                    group: 'navigation',
                    when: contextkeys_1.ActiveEditorContext.isEqualTo(notebookDiffEditor_1.NotebookTextDiffEditor.ID)
                }
            });
        }
        run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            if (editorService.activeEditorPane?.getId() !== notebookCommon_1.NOTEBOOK_DIFF_EDITOR_ID) {
                return;
            }
            const editor = editorService.activeEditorPane.getControl();
            editor?.previousChange();
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'notebook.diff.action.next',
                title: (0, nls_1.localize)('notebook.diff.action.next.title', "Show Next Change"),
                icon: notebookIcons_1.nextChangeIcon,
                f1: false,
                keybinding: {
                    primary: 512 /* KeyMod.Alt */ | 61 /* KeyCode.F3 */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkeys_1.ActiveEditorContext.isEqualTo(notebookDiffEditor_1.NotebookTextDiffEditor.ID)
                },
                menu: {
                    id: actions_1.MenuId.EditorTitle,
                    group: 'navigation',
                    when: contextkeys_1.ActiveEditorContext.isEqualTo(notebookDiffEditor_1.NotebookTextDiffEditor.ID)
                }
            });
        }
        run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            if (editorService.activeEditorPane?.getId() !== notebookCommon_1.NOTEBOOK_DIFF_EDITOR_ID) {
                return;
            }
            const editor = editorService.activeEditorPane.getControl();
            editor?.nextChange();
        }
    });
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        id: 'notebook',
        order: 100,
        type: 'object',
        'properties': {
            'notebook.diff.ignoreMetadata': {
                type: 'boolean',
                default: false,
                markdownDescription: (0, nls_1.localize)('notebook.diff.ignoreMetadata', "Hide Metadata Differences")
            },
            'notebook.diff.ignoreOutputs': {
                type: 'boolean',
                default: false,
                markdownDescription: (0, nls_1.localize)('notebook.diff.ignoreOutputs', "Hide Outputs Differences")
            },
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tEaWZmQWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvZGlmZi9ub3RlYm9va0RpZmZBY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBdUJoRyxzRUFBc0U7SUFFdEUsSUFBQSx5QkFBZSxFQUFDLEtBQU0sU0FBUSxpQkFBTztRQUNwQztZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsNEJBQTRCO2dCQUNoQyxJQUFJLEVBQUUsOEJBQWM7Z0JBQ3BCLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyw0QkFBNEIsRUFBRSx1QkFBdUIsQ0FBQyxFQUFFLFFBQVEsRUFBRSx1QkFBdUIsRUFBRTtnQkFDcEgsWUFBWSxFQUFFLGlDQUFtQixDQUFDLFNBQVMsQ0FBQywyQ0FBc0IsQ0FBQyxFQUFFLENBQUM7Z0JBQ3RFLElBQUksRUFBRSxDQUFDO3dCQUNOLEVBQUUsRUFBRSxnQkFBTSxDQUFDLFdBQVc7d0JBQ3RCLEtBQUssRUFBRSxZQUFZO3dCQUNuQixJQUFJLEVBQUUsaUNBQW1CLENBQUMsU0FBUyxDQUFDLDJDQUFzQixDQUFDLEVBQUUsQ0FBQztxQkFDOUQsQ0FBQzthQUNGLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCO1lBQ25DLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsOEJBQWMsQ0FBQyxDQUFDO1lBRW5ELE1BQU0sWUFBWSxHQUFHLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQztZQUNwRCxJQUFJLFlBQVksSUFBSSxZQUFZLFlBQVksMkNBQXNCLEVBQUU7Z0JBQ25FLE1BQU0sZUFBZSxHQUFHLFlBQVksQ0FBQyxLQUFnQyxDQUFDO2dCQUV0RSxNQUFNLGFBQWEsQ0FB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