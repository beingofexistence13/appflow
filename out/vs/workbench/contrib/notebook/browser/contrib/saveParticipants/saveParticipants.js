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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/editor/browser/services/bulkEditService", "vs/editor/common/commands/trimTrailingWhitespaceCommand", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/services/editorWorker", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/resolverService", "vs/editor/contrib/codeAction/browser/codeAction", "vs/editor/contrib/codeAction/common/types", "vs/editor/contrib/format/browser/format", "vs/editor/contrib/snippet/browser/snippetController2", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/registry/common/platform", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/common/contributions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookEditorModel", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/workingCopy/common/workingCopyFileService"], function (require, exports, nls_1, lifecycle_1, resources_1, bulkEditService_1, trimTrailingWhitespaceCommand_1, position_1, range_1, editorWorker_1, languageFeatures_1, resolverService_1, codeAction_1, types_1, format_1, snippetController2_1, configuration_1, instantiation_1, log_1, platform_1, workspaceTrust_1, contributions_1, notebookBrowser_1, notebookCommon_1, notebookEditorModel_1, editorService_1, workingCopyFileService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SaveParticipantsContribution = void 0;
    let FormatOnSaveParticipant = class FormatOnSaveParticipant {
        constructor(editorWorkerService, languageFeaturesService, textModelService, bulkEditService, configurationService) {
            this.editorWorkerService = editorWorkerService;
            this.languageFeaturesService = languageFeaturesService;
            this.textModelService = textModelService;
            this.bulkEditService = bulkEditService;
            this.configurationService = configurationService;
        }
        async participate(workingCopy, context, progress, token) {
            if (!workingCopy.model || !(workingCopy.model instanceof notebookEditorModel_1.NotebookFileWorkingCopyModel)) {
                return;
            }
            if (context.reason === 2 /* SaveReason.AUTO */) {
                return undefined;
            }
            const enabled = this.configurationService.getValue(notebookCommon_1.NotebookSetting.formatOnSave);
            if (!enabled) {
                return undefined;
            }
            const notebook = workingCopy.model.notebookModel;
            progress.report({ message: (0, nls_1.localize)('notebookFormatSave.formatting', "Formatting") });
            const disposable = new lifecycle_1.DisposableStore();
            try {
                const allCellEdits = await Promise.all(notebook.cells.map(async (cell) => {
                    const ref = await this.textModelService.createModelReference(cell.uri);
                    disposable.add(ref);
                    const model = ref.object.textEditorModel;
                    const formatEdits = await (0, format_1.getDocumentFormattingEditsUntilResult)(this.editorWorkerService, this.languageFeaturesService, model, model.getOptions(), token);
                    const edits = [];
                    if (formatEdits) {
                        edits.push(...formatEdits.map(edit => new bulkEditService_1.ResourceTextEdit(model.uri, edit, model.getVersionId())));
                        return edits;
                    }
                    return [];
                }));
                await this.bulkEditService.apply(/* edit */ allCellEdits.flat(), { label: (0, nls_1.localize)('formatNotebook', "Format Notebook"), code: 'undoredo.formatNotebook', });
            }
            finally {
                progress.report({ increment: 100 });
                disposable.dispose();
            }
        }
    };
    FormatOnSaveParticipant = __decorate([
        __param(0, editorWorker_1.IEditorWorkerService),
        __param(1, languageFeatures_1.ILanguageFeaturesService),
        __param(2, resolverService_1.ITextModelService),
        __param(3, bulkEditService_1.IBulkEditService),
        __param(4, configuration_1.IConfigurationService)
    ], FormatOnSaveParticipant);
    let TrimWhitespaceParticipant = class TrimWhitespaceParticipant {
        constructor(configurationService, editorService, textModelService, bulkEditService) {
            this.configurationService = configurationService;
            this.editorService = editorService;
            this.textModelService = textModelService;
            this.bulkEditService = bulkEditService;
        }
        async participate(workingCopy, context, progress, _token) {
            if (this.configurationService.getValue('files.trimTrailingWhitespace')) {
                await this.doTrimTrailingWhitespace(workingCopy, context.reason === 2 /* SaveReason.AUTO */, progress);
            }
        }
        async doTrimTrailingWhitespace(workingCopy, isAutoSaved, progress) {
            if (!workingCopy.model || !(workingCopy.model instanceof notebookEditorModel_1.NotebookFileWorkingCopyModel)) {
                return;
            }
            const disposable = new lifecycle_1.DisposableStore();
            const notebook = workingCopy.model.notebookModel;
            const activeCellEditor = getActiveCellCodeEditor(this.editorService);
            let cursors = [];
            let prevSelection = [];
            try {
                const allCellEdits = await Promise.all(notebook.cells.map(async (cell) => {
                    if (cell.cellKind !== notebookCommon_1.CellKind.Code) {
                        return [];
                    }
                    const ref = await this.textModelService.createModelReference(cell.uri);
                    disposable.add(ref);
                    const model = ref.object.textEditorModel;
                    const isActiveCell = (activeCellEditor && cell.uri.toString() === activeCellEditor.getModel()?.uri.toString());
                    if (isActiveCell) {
                        prevSelection = activeCellEditor.getSelections() ?? [];
                        if (isAutoSaved) {
                            cursors = prevSelection.map(s => s.getPosition()); // get initial cursor positions
                            const snippetsRange = snippetController2_1.SnippetController2.get(activeCellEditor)?.getSessionEnclosingRange();
                            if (snippetsRange) {
                                for (let lineNumber = snippetsRange.startLineNumber; lineNumber <= snippetsRange.endLineNumber; lineNumber++) {
                                    cursors.push(new position_1.Position(lineNumber, model.getLineMaxColumn(lineNumber)));
                                }
                            }
                        }
                    }
                    const ops = (0, trimTrailingWhitespaceCommand_1.trimTrailingWhitespace)(model, cursors);
                    if (!ops.length) {
                        return []; // Nothing to do
                    }
                    return ops.map(op => new bulkEditService_1.ResourceTextEdit(model.uri, { ...op, text: op.text || '' }, model.getVersionId()));
                }));
                const filteredEdits = allCellEdits.flat().filter(edit => edit !== undefined);
                await this.bulkEditService.apply(filteredEdits, { label: (0, nls_1.localize)('trimNotebookWhitespace', "Notebook Trim Trailing Whitespace"), code: 'undoredo.notebookTrimTrailingWhitespace' });
            }
            finally {
                progress.report({ increment: 100 });
                disposable.dispose();
            }
        }
    };
    TrimWhitespaceParticipant = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, editorService_1.IEditorService),
        __param(2, resolverService_1.ITextModelService),
        __param(3, bulkEditService_1.IBulkEditService)
    ], TrimWhitespaceParticipant);
    let TrimFinalNewLinesParticipant = class TrimFinalNewLinesParticipant {
        constructor(configurationService, editorService, bulkEditService) {
            this.configurationService = configurationService;
            this.editorService = editorService;
            this.bulkEditService = bulkEditService;
        }
        async participate(workingCopy, context, progress, _token) {
            if (this.configurationService.getValue('files.trimTrailingWhitespace')) {
                this.doTrimFinalNewLines(workingCopy, context.reason === 2 /* SaveReason.AUTO */, progress);
            }
        }
        /**
         * returns 0 if the entire file is empty
         */
        findLastNonEmptyLine(textBuffer) {
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
        async doTrimFinalNewLines(workingCopy, isAutoSaved, progress) {
            if (!workingCopy.model || !(workingCopy.model instanceof notebookEditorModel_1.NotebookFileWorkingCopyModel)) {
                return;
            }
            const disposable = new lifecycle_1.DisposableStore();
            const notebook = workingCopy.model.notebookModel;
            const activeCellEditor = getActiveCellCodeEditor(this.editorService);
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
                    const lastNonEmptyLine = this.findLastNonEmptyLine(textBuffer);
                    const deleteFromLineNumber = Math.max(lastNonEmptyLine + 1, cannotTouchLineNumber + 1);
                    const deletionRange = new range_1.Range(deleteFromLineNumber, 1, textBuffer.getLineCount(), textBuffer.getLineLastNonWhitespaceColumn(textBuffer.getLineCount()));
                    if (deletionRange.isEmpty()) {
                        return;
                    }
                    // create the edit to delete all lines in deletionRange
                    return new bulkEditService_1.ResourceTextEdit(cell.uri, { range: deletionRange, text: '' }, cell.textModel?.getVersionId());
                }));
                const filteredEdits = allCellEdits.flat().filter(edit => edit !== undefined);
                await this.bulkEditService.apply(filteredEdits, { label: (0, nls_1.localize)('trimNotebookNewlines', "Trim Final New Lines"), code: 'undoredo.trimFinalNewLines' });
            }
            finally {
                progress.report({ increment: 100 });
                disposable.dispose();
            }
        }
    };
    TrimFinalNewLinesParticipant = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, editorService_1.IEditorService),
        __param(2, bulkEditService_1.IBulkEditService)
    ], TrimFinalNewLinesParticipant);
    let FinalNewLineParticipant = class FinalNewLineParticipant {
        constructor(configurationService, bulkEditService) {
            this.configurationService = configurationService;
            this.bulkEditService = bulkEditService;
        }
        async participate(workingCopy, context, progress, _token) {
            if (this.configurationService.getValue('files.insertFinalNewline')) {
                this.doInsertFinalNewLine(workingCopy, context, progress);
            }
        }
        async doInsertFinalNewLine(workingCopy, context, progress) {
            if (!workingCopy.model || !(workingCopy.model instanceof notebookEditorModel_1.NotebookFileWorkingCopyModel)) {
                return;
            }
            const disposable = new lifecycle_1.DisposableStore();
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
                    return new bulkEditService_1.ResourceTextEdit(cell.uri, { range: new range_1.Range(lineCount + 1, cell.textBuffer.getLineLength(lineCount), lineCount + 1, cell.textBuffer.getLineLength(lineCount)), text: cell.textBuffer.getEOL() }, cell.textModel?.getVersionId());
                }));
                const filteredEdits = allCellEdits.filter(edit => edit !== undefined);
                await this.bulkEditService.apply(filteredEdits, { label: (0, nls_1.localize)('insertFinalNewLine', "Insert Final New Line"), code: 'undoredo.insertFinalNewLine' });
            }
            finally {
                progress.report({ increment: 100 });
                disposable.dispose();
            }
        }
    };
    FinalNewLineParticipant = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, bulkEditService_1.IBulkEditService)
    ], FinalNewLineParticipant);
    let CodeActionOnSaveParticipant = class CodeActionOnSaveParticipant {
        constructor(configurationService, logService, workspaceTrustManagementService, languageFeaturesService, textModelService, instantiationService) {
            this.configurationService = configurationService;
            this.logService = logService;
            this.workspaceTrustManagementService = workspaceTrustManagementService;
            this.languageFeaturesService = languageFeaturesService;
            this.textModelService = textModelService;
            this.instantiationService = instantiationService;
        }
        async participate(workingCopy, context, progress, token) {
            const nbDisposable = new lifecycle_1.DisposableStore();
            const isTrusted = this.workspaceTrustManagementService.isWorkspaceTrusted();
            if (!isTrusted) {
                return;
            }
            if (!workingCopy.model || !(workingCopy.model instanceof notebookEditorModel_1.NotebookFileWorkingCopyModel)) {
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
            const setting = this.configurationService.getValue(notebookCommon_1.NotebookSetting.codeActionsOnSave);
            if (!setting) {
                return undefined;
            }
            const settingItems = Array.isArray(setting)
                ? setting
                : Object.keys(setting).filter(x => setting[x]);
            if (!settingItems.length) {
                return undefined;
            }
            const allCodeActions = this.createCodeActionsOnSave(settingItems);
            const excludedActions = allCodeActions
                .filter(x => setting[x.value] === 'never');
            const includedActions = allCodeActions
                .filter(x => setting[x.value] === saveTrigger);
            const editorCodeActionsOnSave = includedActions.filter(x => !types_1.CodeActionKind.Notebook.contains(x));
            const notebookCodeActionsOnSave = includedActions.filter(x => types_1.CodeActionKind.Notebook.contains(x));
            if (!editorCodeActionsOnSave.length && !notebookCodeActionsOnSave.length) {
                return undefined;
            }
            // prioritize `source.fixAll` code actions
            if (!Array.isArray(setting)) {
                editorCodeActionsOnSave.sort((a, b) => {
                    if (types_1.CodeActionKind.SourceFixAll.contains(a)) {
                        if (types_1.CodeActionKind.SourceFixAll.contains(b)) {
                            return 0;
                        }
                        return -1;
                    }
                    if (types_1.CodeActionKind.SourceFixAll.contains(b)) {
                        return 1;
                    }
                    return 0;
                });
            }
            // run notebook code actions
            progress.report({ message: (0, nls_1.localize)('notebookSaveParticipants.notebookCodeActions', "Running 'Notebook' code actions") });
            try {
                const cell = notebookModel.cells[0];
                const ref = await this.textModelService.createModelReference(cell.uri);
                nbDisposable.add(ref);
                const textEditorModel = ref.object.textEditorModel;
                await this.applyOnSaveActions(textEditorModel, notebookCodeActionsOnSave, excludedActions, progress, token);
            }
            catch {
                this.logService.error('Failed to apply notebook code action on save');
            }
            finally {
                progress.report({ increment: 100 });
                nbDisposable.dispose();
            }
            // run cell level code actions
            const disposable = new lifecycle_1.DisposableStore();
            progress.report({ message: (0, nls_1.localize)('notebookSaveParticipants.cellCodeActions', "Running 'Cell' code actions") });
            try {
                await Promise.all(notebookModel.cells.map(async (cell) => {
                    const ref = await this.textModelService.createModelReference(cell.uri);
                    disposable.add(ref);
                    const textEditorModel = ref.object.textEditorModel;
                    await this.applyOnSaveActions(textEditorModel, editorCodeActionsOnSave, excludedActions, progress, token);
                }));
            }
            catch {
                this.logService.error('Failed to apply code action on save');
            }
            finally {
                progress.report({ increment: 100 });
                disposable.dispose();
            }
        }
        createCodeActionsOnSave(settingItems) {
            const kinds = settingItems.map(x => new types_1.CodeActionKind(x));
            // Remove subsets
            return kinds.filter(kind => {
                return kinds.every(otherKind => otherKind.equals(kind) || !otherKind.contains(kind));
            });
        }
        async applyOnSaveActions(model, codeActionsOnSave, excludes, progress, token) {
            const getActionProgress = new class {
                constructor() {
                    this._names = new Set();
                }
                _report() {
                    progress.report({
                        message: (0, nls_1.localize)({ key: 'codeaction.get2', comment: ['[configure]({1}) is a link. Only translate `configure`. Do not change brackets and parentheses or {1}'] }, "Getting code actions from '{0}' ([configure]({1})).", [...this._names].map(name => `'${name}'`).join(', '), 'command:workbench.action.openSettings?%5B%22editor.codeActionsOnSave%22%5D')
                    });
                }
                report(provider) {
                    if (provider.displayName && !this._names.has(provider.displayName)) {
                        this._names.add(provider.displayName);
                        this._report();
                    }
                }
            };
            for (const codeActionKind of codeActionsOnSave) {
                const actionsToRun = await this.getActionsToRun(model, codeActionKind, excludes, getActionProgress, token);
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
                                if (workspaceTextEdit.resource && (0, resources_1.isEqual)(workspaceTextEdit.resource, model.uri)) {
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
                            this.logService.warn('Failed to apply code action on save, applied to multiple resources.');
                            continue;
                        }
                        progress.report({ message: (0, nls_1.localize)('codeAction.apply', "Applying code action '{0}'.", action.action.title) });
                        await this.instantiationService.invokeFunction(codeAction_1.applyCodeAction, action, codeAction_1.ApplyCodeActionReason.OnSave, {}, token);
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
        getActionsToRun(model, codeActionKind, excludes, progress, token) {
            return (0, codeAction_1.getCodeActions)(this.languageFeaturesService.codeActionProvider, model, model.getFullModelRange(), {
                type: 1 /* CodeActionTriggerType.Invoke */,
                triggerAction: types_1.CodeActionTriggerSource.OnSave,
                filter: { include: codeActionKind, excludes: excludes, includeSourceActions: true },
            }, progress, token);
        }
    };
    CodeActionOnSaveParticipant = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, log_1.ILogService),
        __param(2, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(3, languageFeatures_1.ILanguageFeaturesService),
        __param(4, resolverService_1.ITextModelService),
        __param(5, instantiation_1.IInstantiationService)
    ], CodeActionOnSaveParticipant);
    function getActiveCellCodeEditor(editorService) {
        const activePane = editorService.activeEditorPane;
        const notebookEditor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(activePane);
        const activeCodeEditor = notebookEditor?.activeCodeEditor;
        return activeCodeEditor;
    }
    let SaveParticipantsContribution = class SaveParticipantsContribution extends lifecycle_1.Disposable {
        constructor(instantiationService, workingCopyFileService) {
            super();
            this.instantiationService = instantiationService;
            this.workingCopyFileService = workingCopyFileService;
            this.registerSaveParticipants();
        }
        registerSaveParticipants() {
            this._register(this.workingCopyFileService.addSaveParticipant(this.instantiationService.createInstance(TrimWhitespaceParticipant)));
            this._register(this.workingCopyFileService.addSaveParticipant(this.instantiationService.createInstance(CodeActionOnSaveParticipant)));
            this._register(this.workingCopyFileService.addSaveParticipant(this.instantiationService.createInstance(FormatOnSaveParticipant)));
            this._register(this.workingCopyFileService.addSaveParticipant(this.instantiationService.createInstance(FinalNewLineParticipant)));
            this._register(this.workingCopyFileService.addSaveParticipant(this.instantiationService.createInstance(TrimFinalNewLinesParticipant)));
        }
    };
    exports.SaveParticipantsContribution = SaveParticipantsContribution;
    exports.SaveParticipantsContribution = SaveParticipantsContribution = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, workingCopyFileService_1.IWorkingCopyFileService)
    ], SaveParticipantsContribution);
    const workbenchContributionsRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(SaveParticipantsContribution, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZVBhcnRpY2lwYW50cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvY29udHJpYi9zYXZlUGFydGljaXBhbnRzL3NhdmVQYXJ0aWNpcGFudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBcUNoRyxJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF1QjtRQUM1QixZQUN3QyxtQkFBeUMsRUFDckMsdUJBQWlELEVBQ3hELGdCQUFtQyxFQUNwQyxlQUFpQyxFQUM1QixvQkFBMkM7WUFKNUMsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFzQjtZQUNyQyw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQTBCO1lBQ3hELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDcEMsb0JBQWUsR0FBZixlQUFlLENBQWtCO1lBQzVCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7UUFFcEYsQ0FBQztRQUVELEtBQUssQ0FBQyxXQUFXLENBQUMsV0FBZ0UsRUFBRSxPQUErQixFQUFFLFFBQWtDLEVBQUUsS0FBd0I7WUFDaEwsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLFlBQVksa0RBQTRCLENBQUMsRUFBRTtnQkFDdkYsT0FBTzthQUNQO1lBRUQsSUFBSSxPQUFPLENBQUMsTUFBTSw0QkFBb0IsRUFBRTtnQkFDdkMsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFVLGdDQUFlLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDMUYsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDYixPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUVELE1BQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQyxL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