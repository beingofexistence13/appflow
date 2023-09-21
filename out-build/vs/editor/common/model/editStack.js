/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/editor/common/model/editStack", "vs/base/common/errors", "vs/editor/common/core/selection", "vs/base/common/uri", "vs/editor/common/core/textChange", "vs/base/common/buffer", "vs/base/common/resources"], function (require, exports, nls, errors_1, selection_1, uri_1, textChange_1, buffer, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$VB = exports.$UB = exports.$TB = exports.$SB = exports.$RB = void 0;
    function uriGetComparisonKey(resource) {
        return resource.toString();
    }
    class $RB {
        static create(model, beforeCursorState) {
            const alternativeVersionId = model.getAlternativeVersionId();
            const eol = getModelEOL(model);
            return new $RB(alternativeVersionId, alternativeVersionId, eol, eol, beforeCursorState, beforeCursorState, []);
        }
        constructor(beforeVersionId, afterVersionId, beforeEOL, afterEOL, beforeCursorState, afterCursorState, changes) {
            this.beforeVersionId = beforeVersionId;
            this.afterVersionId = afterVersionId;
            this.beforeEOL = beforeEOL;
            this.afterEOL = afterEOL;
            this.beforeCursorState = beforeCursorState;
            this.afterCursorState = afterCursorState;
            this.changes = changes;
        }
        append(model, textChanges, afterEOL, afterVersionId, afterCursorState) {
            if (textChanges.length > 0) {
                this.changes = (0, textChange_1.$Gs)(this.changes, textChanges);
            }
            this.afterEOL = afterEOL;
            this.afterVersionId = afterVersionId;
            this.afterCursorState = afterCursorState;
        }
        static c(selections) {
            return 4 + 4 * 4 * (selections ? selections.length : 0);
        }
        static d(b, selections, offset) {
            buffer.$Kd(b, (selections ? selections.length : 0), offset);
            offset += 4;
            if (selections) {
                for (const selection of selections) {
                    buffer.$Kd(b, selection.selectionStartLineNumber, offset);
                    offset += 4;
                    buffer.$Kd(b, selection.selectionStartColumn, offset);
                    offset += 4;
                    buffer.$Kd(b, selection.positionLineNumber, offset);
                    offset += 4;
                    buffer.$Kd(b, selection.positionColumn, offset);
                    offset += 4;
                }
            }
            return offset;
        }
        static f(b, offset, dest) {
            const count = buffer.$Jd(b, offset);
            offset += 4;
            for (let i = 0; i < count; i++) {
                const selectionStartLineNumber = buffer.$Jd(b, offset);
                offset += 4;
                const selectionStartColumn = buffer.$Jd(b, offset);
                offset += 4;
                const positionLineNumber = buffer.$Jd(b, offset);
                offset += 4;
                const positionColumn = buffer.$Jd(b, offset);
                offset += 4;
                dest.push(new selection_1.$ms(selectionStartLineNumber, selectionStartColumn, positionLineNumber, positionColumn));
            }
            return offset;
        }
        serialize() {
            let necessarySize = (+4 // beforeVersionId
                + 4 // afterVersionId
                + 1 // beforeEOL
                + 1 // afterEOL
                + $RB.c(this.beforeCursorState)
                + $RB.c(this.afterCursorState)
                + 4 // change count
            );
            for (const change of this.changes) {
                necessarySize += change.writeSize();
            }
            const b = new Uint8Array(necessarySize);
            let offset = 0;
            buffer.$Kd(b, this.beforeVersionId, offset);
            offset += 4;
            buffer.$Kd(b, this.afterVersionId, offset);
            offset += 4;
            buffer.$Od(b, this.beforeEOL, offset);
            offset += 1;
            buffer.$Od(b, this.afterEOL, offset);
            offset += 1;
            offset = $RB.d(b, this.beforeCursorState, offset);
            offset = $RB.d(b, this.afterCursorState, offset);
            buffer.$Kd(b, this.changes.length, offset);
            offset += 4;
            for (const change of this.changes) {
                offset = change.write(b, offset);
            }
            return b.buffer;
        }
        static deserialize(source) {
            const b = new Uint8Array(source);
            let offset = 0;
            const beforeVersionId = buffer.$Jd(b, offset);
            offset += 4;
            const afterVersionId = buffer.$Jd(b, offset);
            offset += 4;
            const beforeEOL = buffer.$Nd(b, offset);
            offset += 1;
            const afterEOL = buffer.$Nd(b, offset);
            offset += 1;
            const beforeCursorState = [];
            offset = $RB.f(b, offset, beforeCursorState);
            const afterCursorState = [];
            offset = $RB.f(b, offset, afterCursorState);
            const changeCount = buffer.$Jd(b, offset);
            offset += 4;
            const changes = [];
            for (let i = 0; i < changeCount; i++) {
                offset = textChange_1.$Fs.read(b, offset, changes);
            }
            return new $RB(beforeVersionId, afterVersionId, beforeEOL, afterEOL, beforeCursorState, afterCursorState, changes);
        }
    }
    exports.$RB = $RB;
    class $SB {
        get type() {
            return 0 /* UndoRedoElementType.Resource */;
        }
        get resource() {
            if (uri_1.URI.isUri(this.model)) {
                return this.model;
            }
            return this.model.uri;
        }
        constructor(label, code, model, beforeCursorState) {
            this.label = label;
            this.code = code;
            this.model = model;
            this.c = $RB.create(model, beforeCursorState);
        }
        toString() {
            const data = (this.c instanceof $RB ? this.c : $RB.deserialize(this.c));
            return data.changes.map(change => change.toString()).join(', ');
        }
        matchesResource(resource) {
            const uri = (uri_1.URI.isUri(this.model) ? this.model : this.model.uri);
            return (uri.toString() === resource.toString());
        }
        setModel(model) {
            this.model = model;
        }
        canAppend(model) {
            return (this.model === model && this.c instanceof $RB);
        }
        append(model, textChanges, afterEOL, afterVersionId, afterCursorState) {
            if (this.c instanceof $RB) {
                this.c.append(model, textChanges, afterEOL, afterVersionId, afterCursorState);
            }
        }
        close() {
            if (this.c instanceof $RB) {
                this.c = this.c.serialize();
            }
        }
        open() {
            if (!(this.c instanceof $RB)) {
                this.c = $RB.deserialize(this.c);
            }
        }
        undo() {
            if (uri_1.URI.isUri(this.model)) {
                // don't have a model
                throw new Error(`Invalid SingleModelEditStackElement`);
            }
            if (this.c instanceof $RB) {
                this.c = this.c.serialize();
            }
            const data = $RB.deserialize(this.c);
            this.model._applyUndo(data.changes, data.beforeEOL, data.beforeVersionId, data.beforeCursorState);
        }
        redo() {
            if (uri_1.URI.isUri(this.model)) {
                // don't have a model
                throw new Error(`Invalid SingleModelEditStackElement`);
            }
            if (this.c instanceof $RB) {
                this.c = this.c.serialize();
            }
            const data = $RB.deserialize(this.c);
            this.model._applyRedo(data.changes, data.afterEOL, data.afterVersionId, data.afterCursorState);
        }
        heapSize() {
            if (this.c instanceof $RB) {
                this.c = this.c.serialize();
            }
            return this.c.byteLength + 168 /*heap overhead*/;
        }
    }
    exports.$SB = $SB;
    class $TB {
        get resources() {
            return this.d.map(editStackElement => editStackElement.resource);
        }
        constructor(label, code, editStackElements) {
            this.label = label;
            this.code = code;
            this.type = 1 /* UndoRedoElementType.Workspace */;
            this.c = true;
            this.d = editStackElements.slice(0);
            this.f = new Map();
            for (const editStackElement of this.d) {
                const key = uriGetComparisonKey(editStackElement.resource);
                this.f.set(key, editStackElement);
            }
            this.g = null;
        }
        setDelegate(delegate) {
            this.g = delegate;
        }
        prepareUndoRedo() {
            if (this.g) {
                return this.g.prepareUndoRedo(this);
            }
        }
        getMissingModels() {
            const result = [];
            for (const editStackElement of this.d) {
                if (uri_1.URI.isUri(editStackElement.model)) {
                    result.push(editStackElement.model);
                }
            }
            return result;
        }
        matchesResource(resource) {
            const key = uriGetComparisonKey(resource);
            return (this.f.has(key));
        }
        setModel(model) {
            const key = uriGetComparisonKey(uri_1.URI.isUri(model) ? model : model.uri);
            if (this.f.has(key)) {
                this.f.get(key).setModel(model);
            }
        }
        canAppend(model) {
            if (!this.c) {
                return false;
            }
            const key = uriGetComparisonKey(model.uri);
            if (this.f.has(key)) {
                const editStackElement = this.f.get(key);
                return editStackElement.canAppend(model);
            }
            return false;
        }
        append(model, textChanges, afterEOL, afterVersionId, afterCursorState) {
            const key = uriGetComparisonKey(model.uri);
            const editStackElement = this.f.get(key);
            editStackElement.append(model, textChanges, afterEOL, afterVersionId, afterCursorState);
        }
        close() {
            this.c = false;
        }
        open() {
            // cannot reopen
        }
        undo() {
            this.c = false;
            for (const editStackElement of this.d) {
                editStackElement.undo();
            }
        }
        redo() {
            for (const editStackElement of this.d) {
                editStackElement.redo();
            }
        }
        heapSize(resource) {
            const key = uriGetComparisonKey(resource);
            if (this.f.has(key)) {
                const editStackElement = this.f.get(key);
                return editStackElement.heapSize();
            }
            return 0;
        }
        split() {
            return this.d;
        }
        toString() {
            const result = [];
            for (const editStackElement of this.d) {
                result.push(`${(0, resources_1.$fg)(editStackElement.resource)}: ${editStackElement}`);
            }
            return `{${result.join(', ')}}`;
        }
    }
    exports.$TB = $TB;
    function getModelEOL(model) {
        const eol = model.getEOL();
        if (eol === '\n') {
            return 0 /* EndOfLineSequence.LF */;
        }
        else {
            return 1 /* EndOfLineSequence.CRLF */;
        }
    }
    function $UB(element) {
        if (!element) {
            return false;
        }
        return ((element instanceof $SB) || (element instanceof $TB));
    }
    exports.$UB = $UB;
    class $VB {
        constructor(model, undoRedoService) {
            this.c = model;
            this.d = undoRedoService;
        }
        pushStackElement() {
            const lastElement = this.d.getLastElement(this.c.uri);
            if ($UB(lastElement)) {
                lastElement.close();
            }
        }
        popStackElement() {
            const lastElement = this.d.getLastElement(this.c.uri);
            if ($UB(lastElement)) {
                lastElement.open();
            }
        }
        clear() {
            this.d.removeElements(this.c.uri);
        }
        f(beforeCursorState, group) {
            const lastElement = this.d.getLastElement(this.c.uri);
            if ($UB(lastElement) && lastElement.canAppend(this.c)) {
                return lastElement;
            }
            const newElement = new $SB(nls.localize(0, null), 'undoredo.textBufferEdit', this.c, beforeCursorState);
            this.d.pushElement(newElement, group);
            return newElement;
        }
        pushEOL(eol) {
            const editStackElement = this.f(null, undefined);
            this.c.setEOL(eol);
            editStackElement.append(this.c, [], getModelEOL(this.c), this.c.getAlternativeVersionId(), null);
        }
        pushEditOperation(beforeCursorState, editOperations, cursorStateComputer, group) {
            const editStackElement = this.f(beforeCursorState, group);
            const inverseEditOperations = this.c.applyEdits(editOperations, true);
            const afterCursorState = $VB.g(cursorStateComputer, inverseEditOperations);
            const textChanges = inverseEditOperations.map((op, index) => ({ index: index, textChange: op.textChange }));
            textChanges.sort((a, b) => {
                if (a.textChange.oldPosition === b.textChange.oldPosition) {
                    return a.index - b.index;
                }
                return a.textChange.oldPosition - b.textChange.oldPosition;
            });
            editStackElement.append(this.c, textChanges.map(op => op.textChange), getModelEOL(this.c), this.c.getAlternativeVersionId(), afterCursorState);
            return afterCursorState;
        }
        static g(cursorStateComputer, inverseEditOperations) {
            try {
                return cursorStateComputer ? cursorStateComputer(inverseEditOperations) : null;
            }
            catch (e) {
                (0, errors_1.$Y)(e);
                return null;
            }
        }
    }
    exports.$VB = $VB;
});
//# sourceMappingURL=editStack.js.map