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
define(["require", "exports", "vs/editor/common/services/resolverService", "vs/base/common/uri", "vs/editor/common/languages/language", "vs/editor/common/services/model", "vs/editor/common/model/textModel", "vs/base/common/lifecycle", "vs/base/common/arrays", "vs/editor/common/core/range", "vs/editor/common/core/editOperation", "vs/platform/instantiation/common/instantiation", "vs/platform/files/common/files", "vs/base/common/event", "vs/workbench/contrib/bulkEdit/browser/conflicts", "vs/base/common/map", "vs/nls!vs/workbench/contrib/bulkEdit/browser/preview/bulkEditPreview", "vs/base/common/resources", "vs/editor/browser/services/bulkEditService", "vs/base/common/codicons", "vs/base/common/uuid", "vs/editor/contrib/snippet/browser/snippetParser", "vs/base/common/symbols"], function (require, exports, resolverService_1, uri_1, language_1, model_1, textModel_1, lifecycle_1, arrays_1, range_1, editOperation_1, instantiation_1, files_1, event_1, conflicts_1, map_1, nls_1, resources_1, bulkEditService_1, codicons_1, uuid_1, snippetParser_1, symbols_1) {
    "use strict";
    var $jMb_1, $kMb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$kMb = exports.$jMb = exports.$iMb = exports.$hMb = exports.BulkFileOperationType = exports.$gMb = exports.$fMb = void 0;
    class $fMb {
        constructor() {
            this.c = new WeakMap();
            this.d = 0;
            this.f = new event_1.$fd();
            this.onDidChange = this.f.event;
        }
        dispose() {
            this.f.dispose();
        }
        get checkedCount() {
            return this.d;
        }
        isChecked(obj) {
            return this.c.get(obj) ?? false;
        }
        updateChecked(obj, value) {
            const valueNow = this.c.get(obj);
            if (valueNow === value) {
                return;
            }
            if (valueNow === undefined) {
                if (value) {
                    this.d += 1;
                }
            }
            else {
                if (value) {
                    this.d += 1;
                }
                else {
                    this.d -= 1;
                }
            }
            this.c.set(obj, value);
            this.f.fire(obj);
        }
    }
    exports.$fMb = $fMb;
    class $gMb {
        constructor(parent, textEdit) {
            this.parent = parent;
            this.textEdit = textEdit;
        }
    }
    exports.$gMb = $gMb;
    var BulkFileOperationType;
    (function (BulkFileOperationType) {
        BulkFileOperationType[BulkFileOperationType["TextEdit"] = 1] = "TextEdit";
        BulkFileOperationType[BulkFileOperationType["Create"] = 2] = "Create";
        BulkFileOperationType[BulkFileOperationType["Delete"] = 4] = "Delete";
        BulkFileOperationType[BulkFileOperationType["Rename"] = 8] = "Rename";
    })(BulkFileOperationType || (exports.BulkFileOperationType = BulkFileOperationType = {}));
    class $hMb {
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
            if (edit instanceof bulkEditService_1.$p1) {
                this.textEdits.push(new $gMb(this, edit));
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
    exports.$hMb = $hMb;
    class $iMb {
        static { this.c = Object.freeze({
            label: (0, nls_1.localize)(0, null),
            icon: codicons_1.$Pj.symbolFile,
            needsConfirmation: false
        }); }
        static keyOf(metadata) {
            return metadata?.label || '<default>';
        }
        constructor(metadata = $iMb.c) {
            this.metadata = metadata;
            this.operationByResource = new Map();
        }
        get fileOperations() {
            return this.operationByResource.values();
        }
    }
    exports.$iMb = $iMb;
    let $jMb = $jMb_1 = class $jMb {
        static async create(accessor, bulkEdit) {
            const result = accessor.get(instantiation_1.$Ah).createInstance($jMb_1, bulkEdit);
            return await result._init();
        }
        constructor(c, d, instaService) {
            this.c = c;
            this.d = d;
            this.checked = new $fMb();
            this.fileOperations = [];
            this.categories = [];
            this.conflicts = instaService.createInstance(conflicts_1.$eMb, c);
        }
        dispose() {
            this.checked.dispose();
            this.conflicts.dispose();
        }
        async _init() {
            const operationByResource = new Map();
            const operationByCategory = new Map();
            const newToOldUri = new map_1.$zi();
            for (let idx = 0; idx < this.c.length; idx++) {
                const edit = this.c[idx];
                let uri;
                let type;
                // store inital checked state
                this.checked.updateChecked(edit, !edit.metadata?.needsConfirmation);
                if (edit instanceof bulkEditService_1.$p1) {
                    type = 1 /* BulkFileOperationType.TextEdit */;
                    uri = edit.resource;
                }
                else if (edit instanceof bulkEditService_1.$q1) {
                    if (edit.newResource && edit.oldResource) {
                        type = 8 /* BulkFileOperationType.Rename */;
                        uri = edit.oldResource;
                        if (edit.options?.overwrite === undefined && edit.options?.ignoreIfExists && await this.d.exists(uri)) {
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
                        if (edit.options?.ignoreIfNotExists && !await this.d.exists(uri)) {
                            // noop -> "soft" delete something that doesn't exist
                            continue;
                        }
                    }
                    else if (edit.newResource) {
                        type = 2 /* BulkFileOperationType.Create */;
                        uri = edit.newResource;
                        if (edit.options?.overwrite === undefined && edit.options?.ignoreIfExists && await this.d.exists(uri)) {
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
                    let key = resources_1.$$f.getComparisonKey(uri, true);
                    let operation = map.get(key);
                    // rename
                    if (!operation && newToOldUri.has(uri)) {
                        uri = newToOldUri.get(uri);
                        key = resources_1.$$f.getComparisonKey(uri, true);
                        operation = map.get(key);
                    }
                    if (!operation) {
                        operation = new $hMb(uri, this);
                        map.set(key, operation);
                    }
                    operation.addEdit(idx, type, edit);
                };
                insert(uri, operationByResource);
                // insert into "this" category
                const key = $iMb.keyOf(edit.metadata);
                let category = operationByCategory.get(key);
                if (!category) {
                    category = new $iMb(edit.metadata);
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
                        if (edit instanceof bulkEditService_1.$q1) {
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
            for (let i = 0; i < this.c.length; i++) {
                const edit = this.c[i];
                if (this.checked.isChecked(edit)) {
                    result[i] = edit;
                    continue;
                }
                allAccepted = false;
            }
            if (allAccepted) {
                return this.c;
            }
            // not all edits have been accepted
            (0, arrays_1.$Gb)(result);
            return result;
        }
        getFileEdits(uri) {
            for (const file of this.fileOperations) {
                if (file.uri.toString() === uri.toString()) {
                    const result = [];
                    let ignoreAll = false;
                    for (const edit of file.originalEdits.values()) {
                        if (edit instanceof bulkEditService_1.$p1) {
                            if (this.checked.isChecked(edit)) {
                                result.push(editOperation_1.$ls.replaceMove(range_1.$ks.lift(edit.textEdit.range), !edit.textEdit.insertAsSnippet ? edit.textEdit.text : snippetParser_1.$G5.asInsertText(edit.textEdit.text)));
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
                    return result.sort((a, b) => range_1.$ks.compareRangesUsingStarts(a.range, b.range));
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
    exports.$jMb = $jMb;
    exports.$jMb = $jMb = $jMb_1 = __decorate([
        __param(1, files_1.$6j),
        __param(2, instantiation_1.$Ah)
    ], $jMb);
    let $kMb = class $kMb {
        static { $kMb_1 = this; }
        static { this.Schema = 'vscode-bulkeditpreview'; }
        static { this.emptyPreview = uri_1.URI.from({ scheme: $kMb_1.Schema, fragment: 'empty' }); }
        static fromPreviewUri(uri) {
            return uri_1.URI.parse(uri.query);
        }
        constructor(h, j, k, l) {
            this.h = h;
            this.j = j;
            this.k = k;
            this.l = l;
            this.c = new lifecycle_1.$jc();
            this.f = new Map();
            this.g = (0, uuid_1.$4f)();
            this.c.add(this.l.registerTextModelContentProvider($kMb_1.Schema, this));
            this.d = this.m();
        }
        dispose() {
            this.c.dispose();
        }
        asPreviewUri(uri) {
            return uri_1.URI.from({ scheme: $kMb_1.Schema, authority: this.g, path: uri.path, query: uri.toString() });
        }
        async m() {
            for (const operation of this.h.fileOperations) {
                await this.n(operation.uri);
            }
            this.c.add(event_1.Event.debounce(this.h.checked.onDidChange, (_last, e) => e, symbols_1.$cd)(e => {
                const uri = this.h.getUriOfEdit(e);
                this.n(uri);
            }));
        }
        async n(uri) {
            const model = await this.o(uri);
            // undo edits that have been done before
            const undoEdits = this.f.get(model.id);
            if (undoEdits) {
                model.applyEdits(undoEdits);
            }
            // apply new edits and keep (future) undo edits
            const newEdits = this.h.getFileEdits(uri);
            const newUndoEdits = model.applyEdits(newEdits, true);
            this.f.set(model.id, newUndoEdits);
        }
        async o(uri) {
            const previewUri = this.asPreviewUri(uri);
            let model = this.k.getModel(previewUri);
            if (!model) {
                try {
                    // try: copy existing
                    const ref = await this.l.createModelReference(uri);
                    const sourceModel = ref.object.textEditorModel;
                    model = this.k.createModel((0, textModel_1.$KC)(sourceModel.createSnapshot()), this.j.createById(sourceModel.getLanguageId()), previewUri);
                    ref.dispose();
                }
                catch {
                    // create NEW model
                    model = this.k.createModel('', this.j.createByFilepathOrFirstLine(previewUri), previewUri);
                }
                // this is a little weird but otherwise editors and other cusomers
                // will dispose my models before they should be disposed...
                // And all of this is off the eventloop to prevent endless recursion
                queueMicrotask(async () => {
                    this.c.add(await this.l.createModelReference(model.uri));
                });
            }
            return model;
        }
        async provideTextContent(previewUri) {
            if (previewUri.toString() === $kMb_1.emptyPreview.toString()) {
                return this.k.createModel('', null, previewUri);
            }
            await this.d;
            return this.k.getModel(previewUri);
        }
    };
    exports.$kMb = $kMb;
    exports.$kMb = $kMb = $kMb_1 = __decorate([
        __param(1, language_1.$ct),
        __param(2, model_1.$yA),
        __param(3, resolverService_1.$uA)
    ], $kMb);
});
//# sourceMappingURL=bulkEditPreview.js.map