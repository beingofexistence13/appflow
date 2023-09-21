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
    exports.$cMb = void 0;
    class ModelEditTask {
        constructor(g) {
            this.g = g;
            this.model = this.g.object.textEditorModel;
            this.d = [];
        }
        dispose() {
            this.g.dispose();
        }
        isNoOp() {
            if (this.d.length > 0) {
                // contains textual edits
                return false;
            }
            if (this.f !== undefined && this.f !== this.model.getEndOfLineSequence()) {
                // contains an eol change that is a real change
                return false;
            }
            return true;
        }
        addEdit(resourceEdit) {
            this.c = resourceEdit.versionId;
            const { textEdit } = resourceEdit;
            if (typeof textEdit.eol === 'number') {
                // honor eol-change
                this.f = textEdit.eol;
            }
            if (!textEdit.range && !textEdit.text) {
                // lacks both a range and the text
                return;
            }
            if (range_1.$ks.isEmpty(textEdit.range) && !textEdit.text) {
                // no-op edit (replace empty range with empty text)
                return;
            }
            // create edit operation
            let range;
            if (!textEdit.range) {
                range = this.model.getFullModelRange();
            }
            else {
                range = range_1.$ks.lift(textEdit.range);
            }
            this.d.push({ ...editOperation_1.$ls.replaceMove(range, textEdit.text), insertAsSnippet: textEdit.insertAsSnippet });
        }
        validate() {
            if (typeof this.c === 'undefined' || this.model.getVersionId() === this.c) {
                return { canApply: true };
            }
            return { canApply: false, reason: this.model.uri };
        }
        getBeforeCursorState() {
            return null;
        }
        apply() {
            if (this.d.length > 0) {
                this.d = this.d
                    .map(this.h, this) // no editor -> no snippet mode
                    .sort((a, b) => range_1.$ks.compareRangesUsingStarts(a.range, b.range));
                this.model.pushEditOperations(null, this.d, () => null);
            }
            if (this.f !== undefined) {
                this.model.pushEOL(this.f);
            }
        }
        h(edit) {
            // transform a snippet edit (and only those) into a normal text edit
            // for that we need to parse the snippet and get its actual text, e.g without placeholder
            // or variable syntaxes
            if (!edit.insertAsSnippet) {
                return edit;
            }
            if (!edit.text) {
                return edit;
            }
            const text = snippetParser_1.$G5.asInsertText(edit.text);
            return { ...edit, insertAsSnippet: false, text };
        }
    }
    class EditorEditTask extends ModelEditTask {
        constructor(modelReference, editor) {
            super(modelReference);
            this.j = editor;
        }
        getBeforeCursorState() {
            return this.k() ? this.j.getSelections() : null;
        }
        apply() {
            // Check that the editor is still for the wanted model. It might have changed in the
            // meantime and that means we cannot use the editor anymore (instead we perform the edit through the model)
            if (!this.k()) {
                super.apply();
                return;
            }
            if (this.d.length > 0) {
                const snippetCtrl = snippetController2_1.$05.get(this.j);
                if (snippetCtrl && this.d.some(edit => edit.insertAsSnippet)) {
                    // some edit is a snippet edit -> use snippet controller and ISnippetEdits
                    const snippetEdits = [];
                    for (const edit of this.d) {
                        if (edit.range && edit.text !== null) {
                            snippetEdits.push({
                                range: range_1.$ks.lift(edit.range),
                                template: edit.insertAsSnippet ? edit.text : snippetParser_1.$G5.escape(edit.text)
                            });
                        }
                    }
                    snippetCtrl.apply(snippetEdits, { undoStopBefore: false, undoStopAfter: false });
                }
                else {
                    // normal edit
                    this.d = this.d
                        .map(this.h, this) // mixed edits (snippet and normal) -> no snippet mode
                        .sort((a, b) => range_1.$ks.compareRangesUsingStarts(a.range, b.range));
                    this.j.executeEdits('', this.d);
                }
            }
            if (this.f !== undefined) {
                if (this.j.hasModel()) {
                    this.j.getModel().pushEOL(this.f);
                }
            }
        }
        k() {
            return this.j?.getModel()?.uri.toString() === this.model.uri.toString();
        }
    }
    let $cMb = class $cMb {
        constructor(d, f, g, h, j, k, l, edits, m, n, o, p) {
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.n = n;
            this.o = o;
            this.p = p;
            this.c = new map_1.$zi();
            for (const edit of edits) {
                let array = this.c.get(edit.resource);
                if (!array) {
                    array = [];
                    this.c.set(edit.resource, array);
                }
                array.push(edit);
            }
        }
        q() {
            // First check if loaded models were not changed in the meantime
            for (const array of this.c.values()) {
                for (const edit of array) {
                    if (typeof edit.versionId === 'number') {
                        const model = this.n.getModel(edit.resource);
                        if (model && model.getVersionId() !== edit.versionId) {
                            // model changed in the meantime
                            throw new Error(`${model.uri.toString()} has changed in the meantime`);
                        }
                    }
                }
            }
        }
        async r() {
            const tasks = [];
            const promises = [];
            for (const [key, edits] of this.c) {
                const promise = this.o.createModelReference(key).then(async (ref) => {
                    let task;
                    let makeMinimal = false;
                    if (this.g?.getModel()?.uri.toString() === ref.object.textEditorModel.uri.toString()) {
                        task = new EditorEditTask(ref, this.g);
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
                        const newEdits = await this.m.computeMoreMinimalEdits(ref.object.textEditorModel.uri, oldEdits.map(e => e.textEdit), false);
                        if (!newEdits) {
                            oldEdits.forEach(task.addEdit, task);
                        }
                        else {
                            newEdits.forEach(edit => task.addEdit(new bulkEditService_1.$p1(ref.object.textEditorModel.uri, edit, undefined, undefined)));
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
        s(tasks) {
            for (const task of tasks) {
                const result = task.validate();
                if (!result.canApply) {
                    return result;
                }
            }
            return { canApply: true };
        }
        async apply() {
            this.q();
            const tasks = await this.r();
            try {
                if (this.l.isCancellationRequested) {
                    return [];
                }
                const resources = [];
                const validation = this.s(tasks);
                if (!validation.canApply) {
                    throw new Error(`${validation.reason.toString()} has changed in the meantime`);
                }
                if (tasks.length === 1) {
                    // This edit touches a single model => keep things simple
                    const task = tasks[0];
                    if (!task.isNoOp()) {
                        const singleModelEditStackElement = new editStack_1.$SB(this.d, this.f, task.model, task.getBeforeCursorState());
                        this.p.pushElement(singleModelEditStackElement, this.h, this.j);
                        task.apply();
                        singleModelEditStackElement.close();
                        resources.push(task.model.uri);
                    }
                    this.k.report(undefined);
                }
                else {
                    // prepare multi model undo element
                    const multiModelEditStackElement = new editStack_1.$TB(this.d, this.f, tasks.map(t => new editStack_1.$SB(this.d, this.f, t.model, t.getBeforeCursorState())));
                    this.p.pushElement(multiModelEditStackElement, this.h, this.j);
                    for (const task of tasks) {
                        task.apply();
                        this.k.report(undefined);
                        resources.push(task.model.uri);
                    }
                    multiModelEditStackElement.close();
                }
                return resources;
            }
            finally {
                (0, lifecycle_1.$fc)(tasks);
            }
        }
    };
    exports.$cMb = $cMb;
    exports.$cMb = $cMb = __decorate([
        __param(8, editorWorker_1.$4Y),
        __param(9, model_1.$yA),
        __param(10, resolverService_1.$uA),
        __param(11, undoRedo_1.$wu)
    ], $cMb);
});
//# sourceMappingURL=bulkTextEdits.js.map