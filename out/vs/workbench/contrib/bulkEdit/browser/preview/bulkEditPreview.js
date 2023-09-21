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
define(["require", "exports", "vs/editor/common/services/resolverService", "vs/base/common/uri", "vs/editor/common/languages/language", "vs/editor/common/services/model", "vs/editor/common/model/textModel", "vs/base/common/lifecycle", "vs/base/common/arrays", "vs/editor/common/core/range", "vs/editor/common/core/editOperation", "vs/platform/instantiation/common/instantiation", "vs/platform/files/common/files", "vs/base/common/event", "vs/workbench/contrib/bulkEdit/browser/conflicts", "vs/base/common/map", "vs/nls", "vs/base/common/resources", "vs/editor/browser/services/bulkEditService", "vs/base/common/codicons", "vs/base/common/uuid", "vs/editor/contrib/snippet/browser/snippetParser", "vs/base/common/symbols"], function (require, exports, resolverService_1, uri_1, language_1, model_1, textModel_1, lifecycle_1, arrays_1, range_1, editOperation_1, instantiation_1, files_1, event_1, conflicts_1, map_1, nls_1, resources_1, bulkEditService_1, codicons_1, uuid_1, snippetParser_1, symbols_1) {
    "use strict";
    var BulkFileOperations_1, BulkEditPreviewProvider_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BulkEditPreviewProvider = exports.BulkFileOperations = exports.BulkCategory = exports.BulkFileOperation = exports.BulkFileOperationType = exports.BulkTextEdit = exports.CheckedStates = void 0;
    class CheckedStates {
        constructor() {
            this._states = new WeakMap();
            this._checkedCount = 0;
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
        }
        dispose() {
            this._onDidChange.dispose();
        }
        get checkedCount() {
            return this._checkedCount;
        }
        isChecked(obj) {
            return this._states.get(obj) ?? false;
        }
        updateChecked(obj, value) {
            const valueNow = this._states.get(obj);
            if (valueNow === value) {
                return;
            }
            if (valueNow === undefined) {
                if (value) {
                    this._checkedCount += 1;
                }
            }
            else {
                if (value) {
                    this._checkedCount += 1;
                }
                else {
                    this._checkedCount -= 1;
                }
            }
            this._states.set(obj, value);
            this._onDidChange.fire(obj);
        }
    }
    exports.CheckedStates = CheckedStates;
    class BulkTextEdit {
        constructor(parent, textEdit) {
            this.parent = parent;
            this.textEdit = textEdit;
        }
    }
    exports.BulkTextEdit = BulkTextEdit;
    var BulkFileOperationType;
    (function (BulkFileOperationType) {
        BulkFileOperationType[BulkFileOperationType["TextEdit"] = 1] = "TextEdit";
        BulkFileOperationType[BulkFileOperationType["Create"] = 2] = "Create";
        BulkFileOperationType[BulkFileOperationType["Delete"] = 4] = "Delete";
        BulkFileOperationType[BulkFileOperationType["Rename"] = 8] = "Rename";
    })(BulkFileOperationType || (exports.BulkFileOperationType = BulkFileOperationType = {}));
    class BulkFileOperation {
        constructor(uri, parent) {
            this.uri = uri;
            this.parent = parent;
            this.type = 0;
            this.textEdits = [];
            this.originalEdits = new Map();
        }
        addEdit(index, type, edit) {
            this.type |= type;
            this.originalEdits.set(index, edit);
            if (edit instanceof bulkEditService_1.ResourceTextEdit) {
                this.textEdits.push(new BulkTextEdit(this, edit));
            }
            else if (type === 8 /* BulkFileOperationType.Rename */) {
                this.newUri = edit.newResource;
            }
        }
        needsConfirmation() {
            for (const [, edit] of this.originalEdits) {
                if (!this.parent.checked.isChecked(edit)) {
                    return true;
                }
            }
            return false;
        }
    }
    exports.BulkFileOperation = BulkFileOperation;
    class BulkCategory {
        static { this._defaultMetadata = Object.freeze({
            label: (0, nls_1.localize)('default', "Other"),
            icon: codicons_1.Codicon.symbolFile,
            needsConfirmation: false
        }); }
        static keyOf(metadata) {
            return metadata?.label || '<default>';
        }
        constructor(metadata = BulkCategory._defaultMetadata) {
            this.metadata = metadata;
            this.operationByResource = new Map();
        }
        get fileOperations() {
            return this.operationByResource.values();
        }
    }
    exports.BulkCategory = BulkCategory;
    let BulkFileOperations = BulkFileOperations_1 = class BulkFileOperations {
        static async create(accessor, bulkEdit) {
            const result = accessor.get(instantiation_1.IInstantiationService).createInstance(BulkFileOperations_1, bulkEdit);
            return await result._init();
        }
        constructor(_bulkEdit, _fileService, instaService) {
            this._bulkEdit = _bulkEdit;
            this._fileService = _fileService;
            this.checked = new CheckedStates();
            this.fileOperations = [];
            this.categories = [];
            this.conflicts = instaService.createInstance(conflicts_1.ConflictDetector, _bulkEdit);
        }
        dispose() {
            this.checked.dispose();
            this.conflicts.dispose();
        }
        async _init() {
            const operationByResource = new Map();
            const operationByCategory = new Map();
            const newToOldUri = new map_1.ResourceMap();
            for (let idx = 0; idx < this._bulkEdit.length; idx++) {
                const edit = this._bulkEdit[idx];
                let uri;
                let type;
                // store inital checked state
                this.checked.updateChecked(edit, !edit.metadata?.needsConfirmation);
                if (edit instanceof bulkEditService_1.ResourceTextEdit) {
                    type = 1 /* BulkFileOperationType.TextEdit */;
                    uri = edit.resource;
                }
                else if (edit instanceof bulkEditService_1.ResourceFileEdit) {
                    if (edit.newResource && edit.oldResource) {
                        type = 8 /* BulkFileOperationType.Rename */;
                        uri = edit.oldResource;
                        if (edit.options?.overwrite === undefined && edit.options?.ignoreIfExists && await this._fileService.exists(uri)) {
                            // noop -> "soft" rename to something that already exists
                            continue;
                        }
                        // map newResource onto oldResource so that text-edit appear for
                        // the same file element
                        newToOldUri.set(edit.newResource, uri);
                    }
                    else if (edit.oldResource) {
                        type = 4 /* BulkFileOperationType.Delete */;
                        uri = edit.oldResource;
                        if (edit.options?.ignoreIfNotExists && !await this._fileService.exists(uri)) {
                            // noop -> "soft" delete something that doesn't exist
                            continue;
                        }
                    }
                    else if (edit.newResource) {
                        type = 2 /* BulkFileOperationType.Create */;
                        uri = edit.newResource;
                        if (edit.options?.overwrite === undefined && edit.options?.ignoreIfExists && await this._fileService.exists(uri)) {
                            // noop -> "soft" create something that already exists
                            continue;
                        }
                    }
                    else {
                        // invalid edit -> skip
                        continue;
                    }
                }
                else {
                    // unsupported edit
                    continue;
                }
                const insert = (uri, map) => {
                    let key = resources_1.extUri.getComparisonKey(uri, true);
                    let operation = map.get(key);
                    // rename
                    if (!operation && newToOldUri.has(uri)) {
                        uri = newToOldUri.get(uri);
                        key = resources_1.extUri.getComparisonKey(uri, true);
                        operation = map.get(key);
                    }
                    if (!operation) {
                        operation = new BulkFileOperation(uri, this);
                        map.set(key, operation);
                    }
                    operation.addEdit(idx, type, edit);
                };
                insert(uri, operationByResource);
                // insert into "this" category
                const key = BulkCategory.keyOf(edit.metadata);
                let category = operationByCategory.get(key);
                if (!category) {
                    category = new BulkCategory(edit.metadata);
                    operationByCategory.set(key, category);
                }
                insert(uri, category.operationByResource);
            }
            operationByResource.forEach(value => this.fileOperations.push(value));
            operationByCategory.forEach(value => this.categories.push(value));
            // "correct" invalid parent-check child states that is
            // unchecked file edits (rename, create, delete) uncheck
            // all edits for a file, e.g no text change without rename
            for (const file of this.fileOperations) {
                if (file.type !== 1 /* BulkFileOperationType.TextEdit */) {
                    let checked = true;
                    for (const edit of file.originalEdits.values()) {
                        if (edit instanceof bulkEditService_1.ResourceFileEdit) {
                            checked = checked && this.checked.isChecked(edit);
                        }
                    }
                    if (!checked) {
                        for (const edit of file.originalEdits.values()) {
                            this.checked.updateChecked(edit, checked);
                        }
                    }
                }
            }
            // sort (once) categories atop which have unconfirmed edits
            this.categories.sort((a, b) => {
                if (a.metadata.needsConfirmation === b.metadata.needsConfirmation) {
                    return a.metadata.label.localeCompare(b.metadata.label);
                }
                else if (a.metadata.needsConfirmation) {
                    return -1;
                }
                else {
                    return 1;
                }
            });
            return this;
        }
        getWorkspaceEdit() {
            const result = [];
            let allAccepted = true;
            for (let i = 0; i < this._bulkEdit.length; i++) {
                const edit = this._bulkEdit[i];
                if (this.checked.isChecked(edit)) {
                    result[i] = edit;
                    continue;
                }
                allAccepted = false;
            }
            if (allAccepted) {
                return this._bulkEdit;
            }
            // not all edits have been accepted
            (0, arrays_1.coalesceInPlace)(result);
            return result;
        }
        getFileEdits(uri) {
            for (const file of this.fileOperations) {
                if (file.uri.toString() === uri.toString()) {
                    const result = [];
                    let ignoreAll = false;
                    for (const edit of file.originalEdits.values()) {
                        if (edit instanceof bulkEditService_1.ResourceTextEdit) {
                            if (this.checked.isChecked(edit)) {
                                result.push(editOperation_1.EditOperation.replaceMove(range_1.Range.lift(edit.textEdit.range), !edit.textEdit.insertAsSnippet ? edit.textEdit.text : snippetParser_1.SnippetParser.asInsertText(edit.textEdit.text)));
                            }
                        }
                        else if (!this.checked.isChecked(edit)) {
                            // UNCHECKED WorkspaceFileEdit disables all text edits
                            ignoreAll = true;
                        }
                    }
                    if (ignoreAll) {
                        return [];
                    }
                    return result.sort((a, b) => range_1.Range.compareRangesUsingStarts(a.range, b.range));
                }
            }
            return [];
        }
        getUriOfEdit(edit) {
            for (const file of this.fileOperations) {
                for (const value of file.originalEdits.values()) {
                    if (value === edit) {
                        return file.uri;
                    }
                }
            }
            throw new Error('invalid edit');
        }
    };
    exports.BulkFileOperations = BulkFileOperations;
    exports.BulkFileOperations = BulkFileOperations = BulkFileOperations_1 = __decorate([
        __param(1, files_1.IFileService),
        __param(2, instantiation_1.IInstantiationService)
    ], BulkFileOperations);
    let BulkEditPreviewProvider = class BulkEditPreviewProvider {
        static { BulkEditPreviewProvider_1 = this; }
        static { this.Schema = 'vscode-bulkeditpreview'; }
        static { this.emptyPreview = uri_1.URI.from({ scheme: BulkEditPreviewProvider_1.Schema, fragment: 'empty' }); }
        static fromPreviewUri(uri) {
            return uri_1.URI.parse(uri.query);
        }
        constructor(_operations, _languageService, _modelService, _textModelResolverService) {
            this._operations = _operations;
            this._languageService = _languageService;
            this._modelService = _modelService;
            this._textModelResolverService = _textModelResolverService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._modelPreviewEdits = new Map();
            this._instanceId = (0, uuid_1.generateUuid)();
            this._disposables.add(this._textModelResolverService.registerTextModelContentProvider(BulkEditPreviewProvider_1.Schema, this));
            this._ready = this._init();
        }
        dispose() {
            this._disposables.dispose();
        }
        asPreviewUri(uri) {
            return uri_1.URI.from({ scheme: BulkEditPreviewProvider_1.Schema, authority: this._instanceId, path: uri.path, query: uri.toString() });
        }
        async _init() {
            for (const operation of this._operations.fileOperations) {
                await this._applyTextEditsToPreviewModel(operation.uri);
            }
            this._disposables.add(event_1.Event.debounce(this._operations.checked.onDidChange, (_last, e) => e, symbols_1.MicrotaskDelay)(e => {
                const uri = this._operations.getUriOfEdit(e);
                this._applyTextEditsToPreviewModel(uri);
            }));
        }
        async _applyTextEditsToPreviewModel(uri) {
            const model = await this._getOrCreatePreviewModel(uri);
            // undo edits that have been done before
            const undoEdits = this._modelPreviewEdits.get(model.id);
            if (undoEdits) {
                model.applyEdits(undoEdits);
            }
            // apply new edits and keep (future) undo edits
            const newEdits = this._operations.getFileEdits(uri);
            const newUndoEdits = model.applyEdits(newEdits, true);
            this._modelPreviewEdits.set(model.id, newUndoEdits);
        }
        async _getOrCreatePreviewModel(uri) {
            const previewUri = this.asPreviewUri(uri);
            let model = this._modelService.getModel(previewUri);
            if (!model) {
                try {
                    // try: copy existing
                    const ref = await this._textModelResolverService.createModelReference(uri);
                    const sourceModel = ref.object.textEditorModel;
                    model = this._modelService.createModel((0, textModel_1.createTextBufferFactoryFromSnapshot)(sourceModel.createSnapshot()), this._languageService.createById(sourceModel.getLanguageId()), previewUri);
                    ref.dispose();
                }
                catch {
                    // create NEW model
                    model = this._modelService.createModel('', this._languageService.createByFilepathOrFirstLine(previewUri), previewUri);
                }
                // this is a little weird but otherwise editors and other cusomers
                // will dispose my models before they should be disposed...
                // And all of this is off the eventloop to prevent endless recursion
                queueMicrotask(async () => {
                    this._disposables.add(await this._textModelResolverService.createModelReference(model.uri));
                });
            }
            return model;
        }
        async provideTextContent(previewUri) {
            if (previewUri.toString() === BulkEditPreviewProvider_1.emptyPreview.toString()) {
                return this._modelService.createModel('', null, previewUri);
            }
            await this._ready;
            return this._modelService.getModel(previewUri);
        }
    };
    exports.BulkEditPreviewProvider = BulkEditPreviewProvider;
    exports.BulkEditPreviewProvider = BulkEditPreviewProvider = BulkEditPreviewProvider_1 = __decorate([
        __param(1, language_1.ILanguageService),
        __param(2, model_1.IModelService),
        __param(3, resolverService_1.ITextModelService)
    ], BulkEditPreviewProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVsa0VkaXRQcmV2aWV3LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvYnVsa0VkaXQvYnJvd3Nlci9wcmV2aWV3L2J1bGtFZGl0UHJldmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBeUJoRyxNQUFhLGFBQWE7UUFBMUI7WUFFa0IsWUFBTyxHQUFHLElBQUksT0FBTyxFQUFjLENBQUM7WUFDN0Msa0JBQWEsR0FBVyxDQUFDLENBQUM7WUFFakIsaUJBQVksR0FBRyxJQUFJLGVBQU8sRUFBSyxDQUFDO1lBQ3hDLGdCQUFXLEdBQWEsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7UUFpQzFELENBQUM7UUEvQkEsT0FBTztZQUNOLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDN0IsQ0FBQztRQUVELElBQUksWUFBWTtZQUNmLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUMzQixDQUFDO1FBRUQsU0FBUyxDQUFDLEdBQU07WUFDZixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQztRQUN2QyxDQUFDO1FBRUQsYUFBYSxDQUFDLEdBQU0sRUFBRSxLQUFjO1lBQ25DLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZDLElBQUksUUFBUSxLQUFLLEtBQUssRUFBRTtnQkFDdkIsT0FBTzthQUNQO1lBQ0QsSUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO2dCQUMzQixJQUFJLEtBQUssRUFBRTtvQkFDVixJQUFJLENBQUMsYUFBYSxJQUFJLENBQUMsQ0FBQztpQkFDeEI7YUFDRDtpQkFBTTtnQkFDTixJQUFJLEtBQUssRUFBRTtvQkFDVixJQUFJLENBQUMs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