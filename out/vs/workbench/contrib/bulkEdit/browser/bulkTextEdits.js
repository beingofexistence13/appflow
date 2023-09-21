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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/core/editOperation", "vs/editor/common/core/range", "vs/editor/common/services/resolverService", "vs/editor/common/services/editorWorker", "vs/platform/undoRedo/common/undoRedo", "vs/editor/common/model/editStack", "vs/base/common/map", "vs/editor/common/services/model", "vs/editor/browser/services/bulkEditService", "vs/editor/contrib/snippet/browser/snippetController2", "vs/editor/contrib/snippet/browser/snippetParser"], function (require, exports, lifecycle_1, editOperation_1, range_1, resolverService_1, editorWorker_1, undoRedo_1, editStack_1, map_1, model_1, bulkEditService_1, snippetController2_1, snippetParser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BulkTextEdits = void 0;
    class ModelEditTask {
        constructor(_modelReference) {
            this._modelReference = _modelReference;
            this.model = this._modelReference.object.textEditorModel;
            this._edits = [];
        }
        dispose() {
            this._modelReference.dispose();
        }
        isNoOp() {
            if (this._edits.length > 0) {
                // contains textual edits
                return false;
            }
            if (this._newEol !== undefined && this._newEol !== this.model.getEndOfLineSequence()) {
                // contains an eol change that is a real change
                return false;
            }
            return true;
        }
        addEdit(resourceEdit) {
            this._expectedModelVersionId = resourceEdit.versionId;
            const { textEdit } = resourceEdit;
            if (typeof textEdit.eol === 'number') {
                // honor eol-change
                this._newEol = textEdit.eol;
            }
            if (!textEdit.range && !textEdit.text) {
                // lacks both a range and the text
                return;
            }
            if (range_1.Range.isEmpty(textEdit.range) && !textEdit.text) {
                // no-op edit (replace empty range with empty text)
                return;
            }
            // create edit operation
            let range;
            if (!textEdit.range) {
                range = this.model.getFullModelRange();
            }
            else {
                range = range_1.Range.lift(textEdit.range);
            }
            this._edits.push({ ...editOperation_1.EditOperation.replaceMove(range, textEdit.text), insertAsSnippet: textEdit.insertAsSnippet });
        }
        validate() {
            if (typeof this._expectedModelVersionId === 'undefined' || this.model.getVersionId() === this._expectedModelVersionId) {
                return { canApply: true };
            }
            return { canApply: false, reason: this.model.uri };
        }
        getBeforeCursorState() {
            return null;
        }
        apply() {
            if (this._edits.length > 0) {
                this._edits = this._edits
                    .map(this._transformSnippetStringToInsertText, this) // no editor -> no snippet mode
                    .sort((a, b) => range_1.Range.compareRangesUsingStarts(a.range, b.range));
                this.model.pushEditOperations(null, this._edits, () => null);
            }
            if (this._newEol !== undefined) {
                this.model.pushEOL(this._newEol);
            }
        }
        _transformSnippetStringToInsertText(edit) {
            // transform a snippet edit (and only those) into a normal text edit
            // for that we need to parse the snippet and get its actual text, e.g without placeholder
            // or variable syntaxes
            if (!edit.insertAsSnippet) {
                return edit;
            }
            if (!edit.text) {
                return edit;
            }
            const text = snippetParser_1.SnippetParser.asInsertText(edit.text);
            return { ...edit, insertAsSnippet: false, text };
        }
    }
    class EditorEditTask extends ModelEditTask {
        constructor(modelReference, editor) {
            super(modelReference);
            this._editor = editor;
        }
        getBeforeCursorState() {
            return this._canUseEditor() ? this._editor.getSelections() : null;
        }
        apply() {
            // Check that the editor is still for the wanted model. It might have changed in the
            // meantime and that means we cannot use the editor anymore (instead we perform the edit through the model)
            if (!this._canUseEditor()) {
                super.apply();
                return;
            }
            if (this._edits.length > 0) {
                const snippetCtrl = snippetController2_1.SnippetController2.get(this._editor);
                if (snippetCtrl && this._edits.some(edit => edit.insertAsSnippet)) {
                    // some edit is a snippet edit -> use snippet controller and ISnippetEdits
                    const snippetEdits = [];
                    for (const edit of this._edits) {
                        if (edit.range && edit.text !== null) {
                            snippetEdits.push({
                                range: range_1.Range.lift(edit.range),
                                template: edit.insertAsSnippet ? edit.text : snippetParser_1.SnippetParser.escape(edit.text)
                            });
                        }
                    }
                    snippetCtrl.apply(snippetEdits, { undoStopBefore: false, undoStopAfter: false });
                }
                else {
                    // normal edit
                    this._edits = this._edits
                        .map(this._transformSnippetStringToInsertText, this) // mixed edits (snippet and normal) -> no snippet mode
                        .sort((a, b) => range_1.Range.compareRangesUsingStarts(a.range, b.range));
                    this._editor.executeEdits('', this._edits);
                }
            }
            if (this._newEol !== undefined) {
                if (this._editor.hasModel()) {
                    this._editor.getModel().pushEOL(this._newEol);
                }
            }
        }
        _canUseEditor() {
            return this._editor?.getModel()?.uri.toString() === this.model.uri.toString();
        }
    }
    let BulkTextEdits = class BulkTextEdits {
        constructor(_label, _code, _editor, _undoRedoGroup, _undoRedoSource, _progress, _token, edits, _editorWorker, _modelService, _textModelResolverService, _undoRedoService) {
            this._label = _label;
            this._code = _code;
            this._editor = _editor;
            this._undoRedoGroup = _undoRedoGroup;
            this._undoRedoSource = _undoRedoSource;
            this._progress = _progress;
            this._token = _token;
            this._editorWorker = _editorWorker;
            this._modelService = _modelService;
            this._textModelResolverService = _textModelResolverService;
            this._undoRedoService = _undoRedoService;
            this._edits = new map_1.ResourceMap();
            for (const edit of edits) {
                let array = this._edits.get(edit.resource);
                if (!array) {
                    array = [];
                    this._edits.set(edit.resource, array);
                }
                array.push(edit);
            }
        }
        _validateBeforePrepare() {
            // First check if loaded models were not changed in the meantime
            for (const array of this._edits.values()) {
                for (const edit of array) {
                    if (typeof edit.versionId === 'number') {
                        const model = this._modelService.getModel(edit.resource);
                        if (model && model.getVersionId() !== edit.versionId) {
                            // model changed in the meantime
                            throw new Error(`${model.uri.toString()} has changed in the meantime`);
                        }
                    }
                }
            }
        }
        async _createEditsTasks() {
            const tasks = [];
            const promises = [];
            for (const [key, edits] of this._edits) {
                const promise = this._textModelResolverService.createModelReference(key).then(async (ref) => {
                    let task;
                    let makeMinimal = false;
                    if (this._editor?.getModel()?.uri.toString() === ref.object.textEditorModel.uri.toString()) {
                        task = new EditorEditTask(ref, this._editor);
                        makeMinimal = true;
                    }
                    else {
                        task = new ModelEditTask(ref);
                    }
                    tasks.push(task);
                    if (!makeMinimal) {
                        edits.forEach(task.addEdit, task);
                        return;
                    }
                    // group edits by type (snippet, metadata, or simple) and make simple groups more minimal
                    const makeGroupMoreMinimal = async (start, end) => {
                        const oldEdits = edits.slice(start, end);
                        const newEdits = await this._editorWorker.computeMoreMinimalEdits(ref.object.textEditorModel.uri, oldEdits.map(e => e.textEdit), false);
                        if (!newEdits) {
                            oldEdits.forEach(task.addEdit, task);
                        }
                        else {
                            newEdits.forEach(edit => task.addEdit(new bulkEditService_1.ResourceTextEdit(ref.object.textEditorModel.uri, edit, undefined, undefined)));
                        }
                    };
                    let start = 0;
                    let i = 0;
                    for (; i < edits.length; i++) {
                        if (edits[i].textEdit.insertAsSnippet || edits[i].metadata) {
                            await makeGroupMoreMinimal(start, i); // grouped edits until now
                            task.addEdit(edits[i]); // this edit
                            start = i + 1;
                        }
                    }
                    await makeGroupMoreMinimal(start, i);
                });
                promises.push(promise);
            }
            await Promise.all(promises);
            return tasks;
        }
        _validateTasks(tasks) {
            for (const task of tasks) {
                const result = task.validate();
                if (!result.canApply) {
                    return result;
                }
            }
            return { canApply: true };
        }
        async apply() {
            this._validateBeforePrepare();
            const tasks = await this._createEditsTasks();
            try {
                if (this._token.isCancellationRequested) {
                    return [];
                }
                const resources = [];
                const validation = this._validateTasks(tasks);
                if (!validation.canApply) {
                    throw new Error(`${validation.reason.toString()} has changed in the meantime`);
                }
                if (tasks.length === 1) {
                    // This edit touches a single model => keep things simple
                    const task = tasks[0];
                    if (!task.isNoOp()) {
                        const singleModelEditStackElement = new editStack_1.SingleModelEditStackElement(this._label, this._code, task.model, task.getBeforeCursorState());
                        this._undoRedoService.pushElement(singleModelEditStackElement, this._undoRedoGroup, this._undoRedoSource);
                        task.apply();
                        singleModelEditStackElement.close();
                        resources.push(task.model.uri);
                    }
                    this._progress.report(undefined);
                }
                else {
                    // prepare multi model undo element
                    const multiModelEditStackElement = new editStack_1.MultiModelEditStackElement(this._label, this._code, tasks.map(t => new editStack_1.SingleModelEditStackElement(this._label, this._code, t.model, t.getBeforeCursorState())));
                    this._undoRedoService.pushElement(multiModelEditStackElement, this._undoRedoGroup, this._undoRedoSource);
                    for (const task of tasks) {
                        task.apply();
                        this._progress.report(undefined);
                        resources.push(task.model.uri);
                    }
                    multiModelEditStackElement.close();
                }
                return resources;
            }
            finally {
                (0, lifecycle_1.dispose)(tasks);
            }
        }
    };
    exports.BulkTextEdits = BulkTextEdits;
    exports.BulkTextEdits = BulkTextEdits = __decorate([
        __param(8, editorWorker_1.IEditorWorkerService),
        __param(9, model_1.IModelService),
        __param(10, resolverService_1.ITextModelService),
        __param(11, undoRedo_1.IUndoRedoService)
    ], BulkTextEdits);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVsa1RleHRFZGl0cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2J1bGtFZGl0L2Jyb3dzZXIvYnVsa1RleHRFZGl0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUEwQmhHLE1BQU0sYUFBYTtRQVFsQixZQUE2QixlQUFxRDtZQUFyRCxvQkFBZSxHQUFmLGVBQWUsQ0FBc0M7WUFDakYsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUM7WUFDekQsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDbEIsQ0FBQztRQUVELE9BQU87WUFDTixJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2hDLENBQUM7UUFFRCxNQUFNO1lBQ0wsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQzNCLHlCQUF5QjtnQkFDekIsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUNELElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLG9CQUFvQixFQUFFLEVBQUU7Z0JBQ3JGLCtDQUErQztnQkFDL0MsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVELE9BQU8sQ0FBQyxZQUE4QjtZQUNyQyxJQUFJLENBQUMsdUJBQXVCLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQztZQUN0RCxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsWUFBWSxDQUFDO1lBRWxDLElBQUksT0FBTyxRQUFRLENBQUMsR0FBRyxLQUFLLFFBQVEsRUFBRTtnQkFDckMsbUJBQW1CO2dCQUNuQixJQUFJLENBQUMsT0FB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