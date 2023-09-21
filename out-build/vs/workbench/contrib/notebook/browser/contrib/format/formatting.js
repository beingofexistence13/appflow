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
define(["require", "exports", "vs/nls!vs/workbench/contrib/notebook/browser/contrib/format/formatting", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/bulkEditService", "vs/editor/common/editorContextKeys", "vs/editor/common/services/editorWorker", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/resolverService", "vs/editor/contrib/format/browser/format", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/progress/common/progress", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/notebook/common/notebookExecutionService", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/platform/configuration/common/configuration", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/notebook/common/notebookService"], function (require, exports, nls_1, cancellation_1, lifecycle_1, editorExtensions_1, bulkEditService_1, editorContextKeys_1, editorWorker_1, languageFeatures_1, resolverService_1, format_1, actions_1, contextkey_1, instantiation_1, progress_1, coreActions_1, notebookBrowser_1, notebookContextKeys_1, editorService_1, notebookExecutionService_1, notebookCommon_1, configuration_1, platform_1, contributions_1, notebookService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$oFb = void 0;
    // format notebook
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'notebook.format',
                title: { value: (0, nls_1.localize)(0, null), original: 'Format Notebook' },
                category: coreActions_1.$7ob,
                precondition: contextkey_1.$Ii.and(notebookContextKeys_1.$Wnb, notebookContextKeys_1.$3nb),
                keybinding: {
                    when: editorContextKeys_1.EditorContextKeys.editorTextFocus.toNegated(),
                    primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 36 /* KeyCode.KeyF */,
                    linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 39 /* KeyCode.KeyI */ },
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                f1: true,
                menu: {
                    id: actions_1.$Ru.EditorContext,
                    when: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.inCompositeEditor, editorContextKeys_1.EditorContextKeys.hasDocumentFormattingProvider),
                    group: '1_modification',
                    order: 1.3
                }
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const textModelService = accessor.get(resolverService_1.$uA);
            const editorWorkerService = accessor.get(editorWorker_1.$4Y);
            const languageFeaturesService = accessor.get(languageFeatures_1.$hF);
            const bulkEditService = accessor.get(bulkEditService_1.$n1);
            const editor = (0, notebookBrowser_1.$Zbb)(editorService.activeEditorPane);
            if (!editor || !editor.hasModel()) {
                return;
            }
            const notebook = editor.textModel;
            const disposable = new lifecycle_1.$jc();
            try {
                const allCellEdits = await Promise.all(notebook.cells.map(async (cell) => {
                    const ref = await textModelService.createModelReference(cell.uri);
                    disposable.add(ref);
                    const model = ref.object.textEditorModel;
                    const formatEdits = await (0, format_1.$K8)(editorWorkerService, languageFeaturesService, model, model.getOptions(), cancellation_1.CancellationToken.None);
                    const edits = [];
                    if (formatEdits) {
                        for (const edit of formatEdits) {
                            edits.push(new bulkEditService_1.$p1(model.uri, edit, model.getVersionId()));
                        }
                        return edits;
                    }
                    return [];
                }));
                await bulkEditService.apply(/* edit */ allCellEdits.flat(), { label: (0, nls_1.localize)(1, null), code: 'undoredo.formatNotebook', });
            }
            finally {
                disposable.dispose();
            }
        }
    });
    // format cell
    (0, editorExtensions_1.$xV)(class FormatCellAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'notebook.formatCell',
                label: (0, nls_1.localize)(2, null),
                alias: 'Format Cell',
                precondition: contextkey_1.$Ii.and(notebookContextKeys_1.$Wnb, notebookContextKeys_1.$3nb, editorContextKeys_1.EditorContextKeys.inCompositeEditor, editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasDocumentFormattingProvider),
                kbOpts: {
                    kbExpr: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.editorTextFocus),
                    primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 36 /* KeyCode.KeyF */,
                    linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 39 /* KeyCode.KeyI */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                contextMenuOpts: {
                    group: '1_modification',
                    order: 1.301
                }
            });
        }
        async run(accessor, editor) {
            if (editor.hasModel()) {
                const instaService = accessor.get(instantiation_1.$Ah);
                await instaService.invokeFunction(format_1.$H8, editor, 1 /* FormattingMode.Explicit */, progress_1.$4u.None, cancellation_1.CancellationToken.None);
            }
        }
    });
    let FormatOnCellExecutionParticipant = class FormatOnCellExecutionParticipant {
        constructor(a, b, c, d, e, f) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
        }
        async onWillExecuteCell(executions) {
            const enabled = this.e.getValue(notebookCommon_1.$7H.formatOnCellExecution);
            if (!enabled) {
                return;
            }
            const disposable = new lifecycle_1.$jc();
            try {
                const allCellEdits = await Promise.all(executions.map(async (cellExecution) => {
                    const nbModel = this.f.getNotebookTextModel(cellExecution.notebook);
                    if (!nbModel) {
                        return [];
                    }
                    let activeCell;
                    for (const cell of nbModel.cells) {
                        if (cell.handle === cellExecution.cellHandle) {
                            activeCell = cell;
                            break;
                        }
                    }
                    if (!activeCell) {
                        return [];
                    }
                    const ref = await this.c.createModelReference(activeCell.uri);
                    disposable.add(ref);
                    const model = ref.object.textEditorModel;
                    // todo: eventually support cancellation. potential leak if cell deleted mid execution
                    const formatEdits = await (0, format_1.$K8)(this.d, this.b, model, model.getOptions(), cancellation_1.CancellationToken.None);
                    const edits = [];
                    if (formatEdits) {
                        edits.push(...formatEdits.map(edit => new bulkEditService_1.$p1(model.uri, edit, model.getVersionId())));
                        return edits;
                    }
                    return [];
                }));
                await this.a.apply(/* edit */ allCellEdits.flat(), { label: (0, nls_1.localize)(3, null), code: 'undoredo.notebooks.onWillExecuteFormat', });
            }
            finally {
                disposable.dispose();
            }
        }
    };
    FormatOnCellExecutionParticipant = __decorate([
        __param(0, bulkEditService_1.$n1),
        __param(1, languageFeatures_1.$hF),
        __param(2, resolverService_1.$uA),
        __param(3, editorWorker_1.$4Y),
        __param(4, configuration_1.$8h),
        __param(5, notebookService_1.$ubb)
    ], FormatOnCellExecutionParticipant);
    let $oFb = class $oFb extends lifecycle_1.$kc {
        constructor(a, b) {
            super();
            this.a = a;
            this.b = b;
            this.c();
        }
        c() {
            this.B(this.b.registerExecutionParticipant(this.a.createInstance(FormatOnCellExecutionParticipant)));
        }
    };
    exports.$oFb = $oFb;
    exports.$oFb = $oFb = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, notebookExecutionService_1.$aI)
    ], $oFb);
    const workbenchContributionsRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution($oFb, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=formatting.js.map