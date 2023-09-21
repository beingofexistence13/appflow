/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/services/bulkEditService", "vs/nls!vs/workbench/contrib/notebook/browser/diff/notebookDiffActions", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/contextkeys", "vs/workbench/contrib/notebook/browser/diff/diffElementViewModel", "vs/workbench/contrib/notebook/browser/diff/notebookDiffEditorBrowser", "vs/workbench/contrib/notebook/browser/diff/notebookDiffEditor", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/services/editor/common/editorService", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/editor", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, bulkEditService_1, nls_1, actions_1, configuration_1, contextkey_1, contextkeys_1, diffElementViewModel_1, notebookDiffEditorBrowser_1, notebookDiffEditor_1, notebookIcons_1, editorService_1, platform_1, configurationRegistry_1, editor_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // ActiveEditorContext.isEqualTo(SearchEditorConstants.SearchEditorID)
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'notebook.diff.switchToText',
                icon: notebookIcons_1.$Mpb,
                title: { value: (0, nls_1.localize)(0, null), original: 'Open Text Diff Editor' },
                precondition: contextkeys_1.$$cb.isEqualTo(notebookDiffEditor_1.$1Eb.ID),
                menu: [{
                        id: actions_1.$Ru.EditorTitle,
                        group: 'navigation',
                        when: contextkeys_1.$$cb.isEqualTo(notebookDiffEditor_1.$1Eb.ID)
                    }]
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const activeEditor = editorService.activeEditorPane;
            if (activeEditor && activeEditor instanceof notebookDiffEditor_1.$1Eb) {
                const diffEditorInput = activeEditor.input;
                await editorService.openEditor({
                    original: { resource: diffEditorInput.original.resource },
                    modified: { resource: diffEditorInput.resource },
                    label: diffEditorInput.getName(),
                    options: {
                        preserveFocus: false,
                        override: editor_1.$HE.id
                    }
                });
            }
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'notebook.diff.cell.revertMetadata',
                title: (0, nls_1.localize)(1, null),
                icon: notebookIcons_1.$Npb,
                f1: false,
                menu: {
                    id: actions_1.$Ru.NotebookDiffCellMetadataTitle,
                    when: notebookDiffEditorBrowser_1.$AEb
                },
                precondition: notebookDiffEditorBrowser_1.$AEb
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
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'notebook.diff.cell.switchOutputRenderingStyleToText',
                title: (0, nls_1.localize)(2, null),
                icon: notebookIcons_1.$Opb,
                f1: false,
                menu: {
                    id: actions_1.$Ru.NotebookDiffCellOutputsTitle,
                    when: notebookDiffEditorBrowser_1.$BEb
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
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'notebook.diff.cell.revertOutputs',
                title: (0, nls_1.localize)(3, null),
                icon: notebookIcons_1.$Npb,
                f1: false,
                menu: {
                    id: actions_1.$Ru.NotebookDiffCellOutputsTitle,
                    when: notebookDiffEditorBrowser_1.$AEb
                },
                precondition: notebookDiffEditorBrowser_1.$AEb
            });
        }
        run(accessor, context) {
            if (!context) {
                return;
            }
            if (!(context.cell instanceof diffElementViewModel_1.$IEb)) {
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
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'notebook.diff.cell.revertInput',
                title: (0, nls_1.localize)(4, null),
                icon: notebookIcons_1.$Npb,
                f1: false,
                menu: {
                    id: actions_1.$Ru.NotebookDiffCellInputTitle,
                    when: notebookDiffEditorBrowser_1.$zEb
                },
                precondition: notebookDiffEditorBrowser_1.$zEb
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
            const bulkEditService = accessor.get(bulkEditService_1.$n1);
            return bulkEditService.apply([
                new bulkEditService_1.$p1(modified.uri, { range: modified.textModel.getFullModelRange(), text: original.textModel.getValue() }),
            ], { quotableLabel: 'Revert Notebook Cell Content Change' });
        }
    });
    class ToggleRenderAction extends actions_1.$Wu {
        constructor(id, title, precondition, toggled, order, a, b) {
            super({
                id: id,
                title,
                precondition: precondition,
                menu: [{
                        id: actions_1.$Ru.EditorTitle,
                        group: 'notebook',
                        when: precondition,
                        order: order,
                    }],
                toggled: toggled
            });
            this.a = a;
            this.b = b;
        }
        async run(accessor) {
            const configurationService = accessor.get(configuration_1.$8h);
            if (this.a !== undefined) {
                const oldValue = configurationService.getValue('notebook.diff.ignoreOutputs');
                configurationService.updateValue('notebook.diff.ignoreOutputs', !oldValue);
            }
            if (this.b !== undefined) {
                const oldValue = configurationService.getValue('notebook.diff.ignoreMetadata');
                configurationService.updateValue('notebook.diff.ignoreMetadata', !oldValue);
            }
        }
    }
    (0, actions_1.$Xu)(class extends ToggleRenderAction {
        constructor() {
            super('notebook.diff.showOutputs', { value: (0, nls_1.localize)(5, null), original: 'Show Outputs Differences' }, contextkeys_1.$$cb.isEqualTo(notebookDiffEditor_1.$1Eb.ID), contextkey_1.$Ii.notEquals('config.notebook.diff.ignoreOutputs', true), 2, true, undefined);
        }
    });
    (0, actions_1.$Xu)(class extends ToggleRenderAction {
        constructor() {
            super('notebook.diff.showMetadata', { value: (0, nls_1.localize)(6, null), original: 'Show Metadata Differences' }, contextkeys_1.$$cb.isEqualTo(notebookDiffEditor_1.$1Eb.ID), contextkey_1.$Ii.notEquals('config.notebook.diff.ignoreMetadata', true), 1, undefined, true);
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'notebook.diff.action.previous',
                title: (0, nls_1.localize)(7, null),
                icon: notebookIcons_1.$Rpb,
                f1: false,
                keybinding: {
                    primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 61 /* KeyCode.F3 */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkeys_1.$$cb.isEqualTo(notebookDiffEditor_1.$1Eb.ID)
                },
                menu: {
                    id: actions_1.$Ru.EditorTitle,
                    group: 'navigation',
                    when: contextkeys_1.$$cb.isEqualTo(notebookDiffEditor_1.$1Eb.ID)
                }
            });
        }
        run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            if (editorService.activeEditorPane?.getId() !== notebookCommon_1.$UH) {
                return;
            }
            const editor = editorService.activeEditorPane.getControl();
            editor?.previousChange();
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'notebook.diff.action.next',
                title: (0, nls_1.localize)(8, null),
                icon: notebookIcons_1.$Spb,
                f1: false,
                keybinding: {
                    primary: 512 /* KeyMod.Alt */ | 61 /* KeyCode.F3 */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkeys_1.$$cb.isEqualTo(notebookDiffEditor_1.$1Eb.ID)
                },
                menu: {
                    id: actions_1.$Ru.EditorTitle,
                    group: 'navigation',
                    when: contextkeys_1.$$cb.isEqualTo(notebookDiffEditor_1.$1Eb.ID)
                }
            });
        }
        run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            if (editorService.activeEditorPane?.getId() !== notebookCommon_1.$UH) {
                return;
            }
            const editor = editorService.activeEditorPane.getControl();
            editor?.nextChange();
        }
    });
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration({
        id: 'notebook',
        order: 100,
        type: 'object',
        'properties': {
            'notebook.diff.ignoreMetadata': {
                type: 'boolean',
                default: false,
                markdownDescription: (0, nls_1.localize)(9, null)
            },
            'notebook.diff.ignoreOutputs': {
                type: 'boolean',
                default: false,
                markdownDescription: (0, nls_1.localize)(10, null)
            },
        }
    });
});
//# sourceMappingURL=notebookDiffActions.js.map