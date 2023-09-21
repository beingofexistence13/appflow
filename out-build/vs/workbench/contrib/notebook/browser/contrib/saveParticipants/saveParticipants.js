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
define(["require", "exports", "vs/nls!vs/workbench/contrib/notebook/browser/contrib/saveParticipants/saveParticipants", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/editor/browser/services/bulkEditService", "vs/editor/common/commands/trimTrailingWhitespaceCommand", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/services/editorWorker", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/resolverService", "vs/editor/contrib/codeAction/browser/codeAction", "vs/editor/contrib/codeAction/common/types", "vs/editor/contrib/format/browser/format", "vs/editor/contrib/snippet/browser/snippetController2", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/registry/common/platform", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/common/contributions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookEditorModel", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/workingCopy/common/workingCopyFileService"], function (require, exports, nls_1, lifecycle_1, resources_1, bulkEditService_1, trimTrailingWhitespaceCommand_1, position_1, range_1, editorWorker_1, languageFeatures_1, resolverService_1, codeAction_1, types_1, format_1, snippetController2_1, configuration_1, instantiation_1, log_1, platform_1, workspaceTrust_1, contributions_1, notebookBrowser_1, notebookCommon_1, notebookEditorModel_1, editorService_1, workingCopyFileService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$pFb = void 0;
    let FormatOnSaveParticipant = class FormatOnSaveParticipant {
        constructor(c, d, e, f, g) {
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
        }
        async participate(workingCopy, context, progress, token) {
            if (!workingCopy.model || !(workingCopy.model instanceof notebookEditorModel_1.$asb)) {
                return;
            }
            if (context.reason === 2 /* SaveReason.AUTO */) {
                return undefined;
            }
            const enabled = this.g.getValue(notebookCommon_1.$7H.formatOnSave);
            if (!enabled) {
                return undefined;
            }
            const notebook = workingCopy.model.notebookModel;
            progress.report({ message: (0, nls_1.localize)(0, null) });
            const disposable = new lifecycle_1.$jc();
            try {
                const allCellEdits = await Promise.all(notebook.cells.map(async (cell) => {
                    const ref = await this.e.createModelReference(cell.uri);
                    disposable.add(ref);
                    const model = ref.object.textEditorModel;
                    const formatEdits = await (0, format_1.$K8)(this.c, this.d, model, model.getOptions(), token);
                    const edits = [];
                    if (formatEdits) {
                        edits.push(...formatEdits.map(edit => new bulkEditService_1.$p1(model.uri, edit, model.getVersionId())));
                        return edits;
                    }
                    return [];
                }));
                await this.f.apply(/* edit */ allCellEdits.flat(), { label: (0, nls_1.localize)(1, null), code: 'undoredo.formatNotebook', });
            }
            finally {
                progress.report({ increment: 100 });
                disposable.dispose();
            }
        }
    };
    FormatOnSaveParticipant = __decorate([
        __param(0, editorWorker_1.$4Y),
        __param(1, languageFeatures_1.$hF),
        __param(2, resolverService_1.$uA),
        __param(3, bulkEditService_1.$n1),
        __param(4, configuration_1.$8h)
    ], FormatOnSaveParticipant);
    let TrimWhitespaceParticipant = class TrimWhitespaceParticipant {
        constructor(c, d, e, f) {
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
        }
        async participate(workingCopy, context, progress, _token) {
            if (this.c.getValue('files.trimTrailingWhitespace')) {
                await this.g(workingCopy, context.reason === 2 /* SaveReason.AUTO */, progress);
            }
        }
        async g(workingCopy, isAutoSaved, progress) {
            if (!workingCopy.model || !(workingCopy.model instanceof notebookEditorModel_1.$asb)) {
                return;
            }
            const disposable = new lifecycle_1.$jc();
            const notebook = workingCopy.model.notebookModel;
            const activeCellEditor = getActiveCellCodeEditor(this.d);
            let cursors = [];
            let prevSelection = [];
            try {
                const allCellEdits = await Promise.all(notebook.cells.map(async (cell) => {
                    if (cell.cellKind !== notebookCommon_1.CellKind.Code) {
                        return [];
                    }
                    const ref = await this.e.createModelReference(cell.uri);
                    disposable.add(ref);
                    const model = ref.object.textEditorModel;
                    const isActiveCell = (activeCellEditor && cell.uri.toString() === activeCellEditor.getModel()?.uri.toString());
                    if (isActiveCell) {
                        prevSelection = activeCellEditor.getSelections() ?? [];
                        if (isAutoSaved) {
                            cursors = prevSelection.map(s => s.getPosition()); // get initial cursor positions
                            const snippetsRange = snippetController2_1.$05.get(activeCellEditor)?.getSessionEnclosingRange();
                            if (snippetsRange) {
                                for (let lineNumber = snippetsRange.startLineNumber; lineNumber <= snippetsRange.endLineNumber; lineNumber++) {
                                    cursors.push(new position_1.$js(lineNumber, model.getLineMaxColumn(lineNumber)));
                                }
                            }
                        }
                    }
                    const ops = (0, trimTrailingWhitespaceCommand_1.$w9)(model, cursors);
                    if (!ops.length) {
                        return []; // Nothing to do
                    }
                    return ops.map(op => new bulkEditService_1.$p1(model.uri, { ...op, text: op.text || '' }, model.getVersionId()));
                }));
                const filteredEdits = allCellEdits.flat().filter(edit => edit !== undefined);
                await this.f.apply(filteredEdits, { label: (0, nls_1.localize)(2, null), code: 'undoredo.notebookTrimTrailingWhitespace' });
            }
            finally {
                progress.report({ increment: 100 });
                disposable.dispose();
            }
        }
    };
    TrimWhitespaceParticipant = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, editorService_1.$9C),
        __param(2, resolverService_1.$uA),
        __param(3, bulkEditService_1.$n1)
    ], TrimWhitespaceParticipant);
    let TrimFinalNewLinesParticipant = class TrimFinalNewLinesParticipant {
        constructor(c, d, e) {
            this.c = c;
            this.d = d;
            this.e = e;
        }
        async participate(workingCopy, context, progress, _token) {
            if (this.c.getValue('files.trimTrailingWhitespace')) {
                this.g(workingCopy, context.reason === 2 /* SaveReason.AUTO */, progress);
            }
        }
        /**
         * returns 0 if the entire file is empty
         */
        f(textBuffer) {
            for (let lineNumber = textBuffer.getLineCount(); lineNumber >= 1; lineNumber--) {
                const lineLength = textBuffer.getLineLength(lineNumber);
                if (lineLength) {
                    // this line has content
                    return lineNumber;
                }
            }
            // no line has content
            return 0;
        }
        async g(workingCopy, isAutoSaved, progress) {
            if (!workingCopy.model || !(workingCopy.model instanceof notebookEditorModel_1.$asb)) {
                return;
            }
            const disposable = new lifecycle_1.$jc();
            const notebook = workingCopy.model.notebookModel;
            const activeCellEditor = getActiveCellCodeEditor(this.d);
            try {
                const allCellEdits = await Promise.all(notebook.cells.map(async (cell) => {
                    if (cell.cellKind !== notebookCommon_1.CellKind.Code) {
                        return;
                    }
                    // autosave -- don't trim every trailing line, just up to the cursor line
                    let cannotTouchLineNumber = 0;
                    const isActiveCell = (activeCellEditor && cell.uri.toString() === activeCellEditor.getModel()?.uri.toString());
                    if (isAutoSaved && isActiveCell) {
                        const selections = activeCellEditor.getSelections() ?? [];
                        for (const sel of selections) {
                            cannotTouchLineNumber = Math.max(cannotTouchLineNumber, sel.selectionStartLineNumber);
                        }
                    }
                    const textBuffer = cell.textBuffer;
                    const lastNonEmptyLine = this.f(textBuffer);
                    const deleteFromLineNumber = Math.max(lastNonEmptyLine + 1, cannotTouchLineNumber + 1);
                    const deletionRange = new range_1.$ks(deleteFromLineNumber, 1, textBuffer.getLineCount(), textBuffer.getLineLastNonWhitespaceColumn(textBuffer.getLineCount()));
                    if (deletionRange.isEmpty()) {
                        return;
                    }
                    // create the edit to delete all lines in deletionRange
                    return new bulkEditService_1.$p1(cell.uri, { range: deletionRange, text: '' }, cell.textModel?.getVersionId());
                }));
                const filteredEdits = allCellEdits.flat().filter(edit => edit !== undefined);
                await this.e.apply(filteredEdits, { label: (0, nls_1.localize)(3, null), code: 'undoredo.trimFinalNewLines' });
            }
            finally {
                progress.report({ increment: 100 });
                disposable.dispose();
            }
        }
    };
    TrimFinalNewLinesParticipant = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, editorService_1.$9C),
        __param(2, bulkEditService_1.$n1)
    ], TrimFinalNewLinesParticipant);
    let FinalNewLineParticipant = class FinalNewLineParticipant {
        constructor(c, d) {
            this.c = c;
            this.d = d;
        }
        async participate(workingCopy, context, progress, _token) {
            if (this.c.getValue('files.insertFinalNewline')) {
                this.e(workingCopy, context, progress);
            }
        }
        async e(workingCopy, context, progress) {
            if (!workingCopy.model || !(workingCopy.model instanceof notebookEditorModel_1.$asb)) {
                return;
            }
            const disposable = new lifecycle_1.$jc();
            const notebook = workingCopy.model.notebookModel;
            try {
                const allCellEdits = await Promise.all(notebook.cells.map(async (cell) => {
                    if (cell.cellKind !== notebookCommon_1.CellKind.Code) {
                        return;
                    }
                    const lineCount = cell.textBuffer.getLineCount();
                    const lastLineIsEmptyOrWhitespace = cell.textBuffer.getLineFirstNonWhitespaceColumn(lineCount) === 0;
                    if (!lineCount || lastLineIsEmptyOrWhitespace) {
                        return;
                    }
                    return new bulkEditService_1.$p1(cell.uri, { range: new range_1.$ks(lineCount + 1, cell.textBuffer.getLineLength(lineCount), lineCount + 1, cell.textBuffer.getLineLength(lineCount)), text: cell.textBuffer.getEOL() }, cell.textModel?.getVersionId());
                }));
                const filteredEdits = allCellEdits.filter(edit => edit !== undefined);
                await this.d.apply(filteredEdits, { label: (0, nls_1.localize)(4, null), code: 'undoredo.insertFinalNewLine' });
            }
            finally {
                progress.report({ increment: 100 });
                disposable.dispose();
            }
        }
    };
    FinalNewLineParticipant = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, bulkEditService_1.$n1)
    ], FinalNewLineParticipant);
    let CodeActionOnSaveParticipant = class CodeActionOnSaveParticipant {
        constructor(c, d, e, f, g, h) {
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
            this.h = h;
        }
        async participate(workingCopy, context, progress, token) {
            const nbDisposable = new lifecycle_1.$jc();
            const isTrusted = this.e.isWorkspaceTrusted();
            if (!isTrusted) {
                return;
            }
            if (!workingCopy.model || !(workingCopy.model instanceof notebookEditorModel_1.$asb)) {
                return;
            }
            let saveTrigger = '';
            if (context.reason === 2 /* SaveReason.AUTO */) {
                // currently this won't happen, as vs/editor/contrib/codeAction/browser/codeAction.ts L#104 filters out codeactions on autosave. Just future-proofing
                // ? notebook CodeActions on autosave seems dangerous (perf-wise)
                saveTrigger = 'always';
            }
            else if (context.reason === 1 /* SaveReason.EXPLICIT */) {
                saveTrigger = 'explicit';
            }
            else {
                // 	SaveReason.FOCUS_CHANGE, WINDOW_CHANGE need to be addressed when autosaves are enabled
                return undefined;
            }
            const notebookModel = workingCopy.model.notebookModel;
            const setting = this.c.getValue(notebookCommon_1.$7H.codeActionsOnSave);
            if (!setting) {
                return undefined;
            }
            const settingItems = Array.isArray(setting)
                ? setting
                : Object.keys(setting).filter(x => setting[x]);
            if (!settingItems.length) {
                return undefined;
            }
            const allCodeActions = this.i(settingItems);
            const excludedActions = allCodeActions
                .filter(x => setting[x.value] === 'never');
            const includedActions = allCodeActions
                .filter(x => setting[x.value] === saveTrigger);
            const editorCodeActionsOnSave = includedActions.filter(x => !types_1.$v1.Notebook.contains(x));
            const notebookCodeActionsOnSave = includedActions.filter(x => types_1.$v1.Notebook.contains(x));
            if (!editorCodeActionsOnSave.length && !notebookCodeActionsOnSave.length) {
                return undefined;
            }
            // prioritize `source.fixAll` code actions
            if (!Array.isArray(setting)) {
                editorCodeActionsOnSave.sort((a, b) => {
                    if (types_1.$v1.SourceFixAll.contains(a)) {
                        if (types_1.$v1.SourceFixAll.contains(b)) {
                            return 0;
                        }
                        return -1;
                    }
                    if (types_1.$v1.SourceFixAll.contains(b)) {
                        return 1;
                    }
                    return 0;
                });
            }
            // run notebook code actions
            progress.report({ message: (0, nls_1.localize)(5, null) });
            try {
                const cell = notebookModel.cells[0];
                const ref = await this.g.createModelReference(cell.uri);
                nbDisposable.add(ref);
                const textEditorModel = ref.object.textEditorModel;
                await this.j(textEditorModel, notebookCodeActionsOnSave, excludedActions, progress, token);
            }
            catch {
                this.d.error('Failed to apply notebook code action on save');
            }
            finally {
                progress.report({ increment: 100 });
                nbDisposable.dispose();
            }
            // run cell level code actions
            const disposable = new lifecycle_1.$jc();
            progress.report({ message: (0, nls_1.localize)(6, null) });
            try {
                await Promise.all(notebookModel.cells.map(async (cell) => {
                    const ref = await this.g.createModelReference(cell.uri);
                    disposable.add(ref);
                    const textEditorModel = ref.object.textEditorModel;
                    await this.j(textEditorModel, editorCodeActionsOnSave, excludedActions, progress, token);
                }));
            }
            catch {
                this.d.error('Failed to apply code action on save');
            }
            finally {
                progress.report({ increment: 100 });
                disposable.dispose();
            }
        }
        i(settingItems) {
            const kinds = settingItems.map(x => new types_1.$v1(x));
            // Remove subsets
            return kinds.filter(kind => {
                return kinds.every(otherKind => otherKind.equals(kind) || !otherKind.contains(kind));
            });
        }
        async j(model, codeActionsOnSave, excludes, progress, token) {
            const getActionProgress = new class {
                constructor() {
                    this.c = new Set();
                }
                d() {
                    progress.report({
                        message: (0, nls_1.localize)(7, null, [...this.c].map(name => `'${name}'`).join(', '), 'command:workbench.action.openSettings?%5B%22editor.codeActionsOnSave%22%5D')
                    });
                }
                report(provider) {
                    if (provider.displayName && !this.c.has(provider.displayName)) {
                        this.c.add(provider.displayName);
                        this.d();
                    }
                }
            };
            for (const codeActionKind of codeActionsOnSave) {
                const actionsToRun = await this.k(model, codeActionKind, excludes, getActionProgress, token);
                if (token.isCancellationRequested) {
                    actionsToRun.dispose();
                    return;
                }
                try {
                    for (const action of actionsToRun.validActions) {
                        const codeActionEdits = action.action.edit?.edits;
                        let breakFlag = false;
                        if (!action.action.kind?.startsWith('notebook')) {
                            for (const edit of codeActionEdits ?? []) {
                                const workspaceTextEdit = edit;
                                if (workspaceTextEdit.resource && (0, resources_1.$bg)(workspaceTextEdit.resource, model.uri)) {
                                    continue;
                                }
                                else {
                                    // error -> applied to multiple resources
                                    breakFlag = true;
                                    break;
                                }
                            }
                        }
                        if (breakFlag) {
                            this.d.warn('Failed to apply code action on save, applied to multiple resources.');
                            continue;
                        }
                        progress.report({ message: (0, nls_1.localize)(8, null, action.action.title) });
                        await this.h.invokeFunction(codeAction_1.$J1, action, codeAction_1.ApplyCodeActionReason.OnSave, {}, token);
                        if (token.isCancellationRequested) {
                            return;
                        }
                    }
                }
                catch {
                    // Failure to apply a code action should not block other on save actions
                }
                finally {
                    actionsToRun.dispose();
                }
            }
        }
        k(model, codeActionKind, excludes, progress, token) {
            return (0, codeAction_1.$I1)(this.f.codeActionProvider, model, model.getFullModelRange(), {
                type: 1 /* CodeActionTriggerType.Invoke */,
                triggerAction: types_1.CodeActionTriggerSource.OnSave,
                filter: { include: codeActionKind, excludes: excludes, includeSourceActions: true },
            }, progress, token);
        }
    };
    CodeActionOnSaveParticipant = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, log_1.$5i),
        __param(2, workspaceTrust_1.$$z),
        __param(3, languageFeatures_1.$hF),
        __param(4, resolverService_1.$uA),
        __param(5, instantiation_1.$Ah)
    ], CodeActionOnSaveParticipant);
    function getActiveCellCodeEditor(editorService) {
        const activePane = editorService.activeEditorPane;
        const notebookEditor = (0, notebookBrowser_1.$Zbb)(activePane);
        const activeCodeEditor = notebookEditor?.activeCodeEditor;
        return activeCodeEditor;
    }
    let $pFb = class $pFb extends lifecycle_1.$kc {
        constructor(c, f) {
            super();
            this.c = c;
            this.f = f;
            this.g();
        }
        g() {
            this.B(this.f.addSaveParticipant(this.c.createInstance(TrimWhitespaceParticipant)));
            this.B(this.f.addSaveParticipant(this.c.createInstance(CodeActionOnSaveParticipant)));
            this.B(this.f.addSaveParticipant(this.c.createInstance(FormatOnSaveParticipant)));
            this.B(this.f.addSaveParticipant(this.c.createInstance(FinalNewLineParticipant)));
            this.B(this.f.addSaveParticipant(this.c.createInstance(TrimFinalNewLinesParticipant)));
        }
    };
    exports.$pFb = $pFb;
    exports.$pFb = $pFb = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, workingCopyFileService_1.$HD)
    ], $pFb);
    const workbenchContributionsRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution($pFb, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=saveParticipants.js.map