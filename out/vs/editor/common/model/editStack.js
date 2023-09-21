/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/errors", "vs/editor/common/core/selection", "vs/base/common/uri", "vs/editor/common/core/textChange", "vs/base/common/buffer", "vs/base/common/resources"], function (require, exports, nls, errors_1, selection_1, uri_1, textChange_1, buffer, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditStack = exports.isEditStackElement = exports.MultiModelEditStackElement = exports.SingleModelEditStackElement = exports.SingleModelEditStackData = void 0;
    function uriGetComparisonKey(resource) {
        return resource.toString();
    }
    class SingleModelEditStackData {
        static create(model, beforeCursorState) {
            const alternativeVersionId = model.getAlternativeVersionId();
            const eol = getModelEOL(model);
            return new SingleModelEditStackData(alternativeVersionId, alternativeVersionId, eol, eol, beforeCursorState, beforeCursorState, []);
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
                this.changes = (0, textChange_1.compressConsecutiveTextChanges)(this.changes, textChanges);
            }
            this.afterEOL = afterEOL;
            this.afterVersionId = afterVersionId;
            this.afterCursorState = afterCursorState;
        }
        static _writeSelectionsSize(selections) {
            return 4 + 4 * 4 * (selections ? selections.length : 0);
        }
        static _writeSelections(b, selections, offset) {
            buffer.writeUInt32BE(b, (selections ? selections.length : 0), offset);
            offset += 4;
            if (selections) {
                for (const selection of selections) {
                    buffer.writeUInt32BE(b, selection.selectionStartLineNumber, offset);
                    offset += 4;
                    buffer.writeUInt32BE(b, selection.selectionStartColumn, offset);
                    offset += 4;
                    buffer.writeUInt32BE(b, selection.positionLineNumber, offset);
                    offset += 4;
                    buffer.writeUInt32BE(b, selection.positionColumn, offset);
                    offset += 4;
                }
            }
            return offset;
        }
        static _readSelections(b, offset, dest) {
            const count = buffer.readUInt32BE(b, offset);
            offset += 4;
            for (let i = 0; i < count; i++) {
                const selectionStartLineNumber = buffer.readUInt32BE(b, offset);
                offset += 4;
                const selectionStartColumn = buffer.readUInt32BE(b, offset);
                offset += 4;
                const positionLineNumber = buffer.readUInt32BE(b, offset);
                offset += 4;
                const positionColumn = buffer.readUInt32BE(b, offset);
                offset += 4;
                dest.push(new selection_1.Selection(selectionStartLineNumber, selectionStartColumn, positionLineNumber, positionColumn));
            }
            return offset;
        }
        serialize() {
            let necessarySize = (+4 // beforeVersionId
                + 4 // afterVersionId
                + 1 // beforeEOL
                + 1 // afterEOL
                + SingleModelEditStackData._writeSelectionsSize(this.beforeCursorState)
                + SingleModelEditStackData._writeSelectionsSize(this.afterCursorState)
                + 4 // change count
            );
            for (const change of this.changes) {
                necessarySize += change.writeSize();
            }
            const b = new Uint8Array(necessarySize);
            let offset = 0;
            buffer.writeUInt32BE(b, this.beforeVersionId, offset);
            offset += 4;
            buffer.writeUInt32BE(b, this.afterVersionId, offset);
            offset += 4;
            buffer.writeUInt8(b, this.beforeEOL, offset);
            offset += 1;
            buffer.writeUInt8(b, this.afterEOL, offset);
            offset += 1;
            offset = SingleModelEditStackData._writeSelections(b, this.beforeCursorState, offset);
            offset = SingleModelEditStackData._writeSelections(b, this.afterCursorState, offset);
            buffer.writeUInt32BE(b, this.changes.length, offset);
            offset += 4;
            for (const change of this.changes) {
                offset = change.write(b, offset);
            }
            return b.buffer;
        }
        static deserialize(source) {
            const b = new Uint8Array(source);
            let offset = 0;
            const beforeVersionId = buffer.readUInt32BE(b, offset);
            offset += 4;
            const afterVersionId = buffer.readUInt32BE(b, offset);
            offset += 4;
            const beforeEOL = buffer.readUInt8(b, offset);
            offset += 1;
            const afterEOL = buffer.readUInt8(b, offset);
            offset += 1;
            const beforeCursorState = [];
            offset = SingleModelEditStackData._readSelections(b, offset, beforeCursorState);
            const afterCursorState = [];
            offset = SingleModelEditStackData._readSelections(b, offset, afterCursorState);
            const changeCount = buffer.readUInt32BE(b, offset);
            offset += 4;
            const changes = [];
            for (let i = 0; i < changeCount; i++) {
                offset = textChange_1.TextChange.read(b, offset, changes);
            }
            return new SingleModelEditStackData(beforeVersionId, afterVersionId, beforeEOL, afterEOL, beforeCursorState, afterCursorState, changes);
        }
    }
    exports.SingleModelEditStackData = SingleModelEditStackData;
    class SingleModelEditStackElement {
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
            this._data = SingleModelEditStackData.create(model, beforeCursorState);
        }
        toString() {
            const data = (this._data instanceof SingleModelEditStackData ? this._data : SingleModelEditStackData.deserialize(this._data));
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
            return (this.model === model && this._data instanceof SingleModelEditStackData);
        }
        append(model, textChanges, afterEOL, afterVersionId, afterCursorState) {
            if (this._data instanceof SingleModelEditStackData) {
                this._data.append(model, textChanges, afterEOL, afterVersionId, afterCursorState);
            }
        }
        close() {
            if (this._data instanceof SingleModelEditStackData) {
                this._data = this._data.serialize();
            }
        }
        open() {
            if (!(this._data instanceof SingleModelEditStackData)) {
                this._data = SingleModelEditStackData.deserialize(this._data);
            }
        }
        undo() {
            if (uri_1.URI.isUri(this.model)) {
                // don't have a model
                throw new Error(`Invalid SingleModelEditStackElement`);
            }
            if (this._data instanceof SingleModelEditStackData) {
                this._data = this._data.serialize();
            }
            const data = SingleModelEditStackData.deserialize(this._data);
            this.model._applyUndo(data.changes, data.beforeEOL, data.beforeVersionId, data.beforeCursorState);
        }
        redo() {
            if (uri_1.URI.isUri(this.model)) {
                // don't have a model
                throw new Error(`Invalid SingleModelEditStackElement`);
            }
            if (this._data instanceof SingleModelEditStackData) {
                this._data = this._data.serialize();
            }
            const data = SingleModelEditStackData.deserialize(this._data);
            this.model._applyRedo(data.changes, data.afterEOL, data.afterVersionId, data.afterCursorState);
        }
        heapSize() {
            if (this._data instanceof SingleModelEditStackData) {
                this._data = this._data.serialize();
            }
            return this._data.byteLength + 168 /*heap overhead*/;
        }
    }
    exports.SingleModelEditStackElement = SingleModelEditStackElement;
    class MultiModelEditStackElement {
        get resources() {
            return this._editStackElementsArr.map(editStackElement => editStackElement.resource);
        }
        constructor(label, code, editStackElements) {
            this.label = label;
            this.code = code;
            this.type = 1 /* UndoRedoElementType.Workspace */;
            this._isOpen = true;
            this._editStackElementsArr = editStackElements.slice(0);
            this._editStackElementsMap = new Map();
            for (const editStackElement of this._editStackElementsArr) {
                const key = uriGetComparisonKey(editStackElement.resource);
                this._editStackElementsMap.set(key, editStackElement);
            }
            this._delegate = null;
        }
        setDelegate(delegate) {
            this._delegate = delegate;
        }
        prepareUndoRedo() {
            if (this._delegate) {
                return this._delegate.prepareUndoRedo(this);
            }
        }
        getMissingModels() {
            const result = [];
            for (const editStackElement of this._editStackElementsArr) {
                if (uri_1.URI.isUri(editStackElement.model)) {
                    result.push(editStackElement.model);
                }
            }
            return result;
        }
        matchesResource(resource) {
            const key = uriGetComparisonKey(resource);
            return (this._editStackElementsMap.has(key));
        }
        setModel(model) {
            const key = uriGetComparisonKey(uri_1.URI.isUri(model) ? model : model.uri);
            if (this._editStackElementsMap.has(key)) {
                this._editStackElementsMap.get(key).setModel(model);
            }
        }
        canAppend(model) {
            if (!this._isOpen) {
                return false;
            }
            const key = uriGetComparisonKey(model.uri);
            if (this._editStackElementsMap.has(key)) {
                const editStackElement = this._editStackElementsMap.get(key);
                return editStackElement.canAppend(model);
            }
            return false;
        }
        append(model, textChanges, afterEOL, afterVersionId, afterCursorState) {
            const key = uriGetComparisonKey(model.uri);
            const editStackElement = this._editStackElementsMap.get(key);
            editStackElement.append(model, textChanges, afterEOL, afterVersionId, afterCursorState);
        }
        close() {
            this._isOpen = false;
        }
        open() {
            // cannot reopen
        }
        undo() {
            this._isOpen = false;
            for (const editStackElement of this._editStackElementsArr) {
                editStackElement.undo();
            }
        }
        redo() {
            for (const editStackElement of this._editStackElementsArr) {
                editStackElement.redo();
            }
        }
        heapSize(resource) {
            const key = uriGetComparisonKey(resource);
            if (this._editStackElementsMap.has(key)) {
                const editStackElement = this._editStackElementsMap.get(key);
                return editStackElement.heapSize();
            }
            return 0;
        }
        split() {
            return this._editStackElementsArr;
        }
        toString() {
            const result = [];
            for (const editStackElement of this._editStackElementsArr) {
                result.push(`${(0, resources_1.basename)(editStackElement.resource)}: ${editStackElement}`);
            }
            return `{${result.join(', ')}}`;
        }
    }
    exports.MultiModelEditStackElement = MultiModelEditStackElement;
    function getModelEOL(model) {
        const eol = model.getEOL();
        if (eol === '\n') {
            return 0 /* EndOfLineSequence.LF */;
        }
        else {
            return 1 /* EndOfLineSequence.CRLF */;
        }
    }
    function isEditStackElement(element) {
        if (!element) {
            return false;
        }
        return ((element instanceof SingleModelEditStackElement) || (element instanceof MultiModelEditStackElement));
    }
    exports.isEditStackElement = isEditStackElement;
    class EditStack {
        constructor(model, undoRedoService) {
            this._model = model;
            this._undoRedoService = undoRedoService;
        }
        pushStackElement() {
            const lastElement = this._undoRedoService.getLastElement(this._model.uri);
            if (isEditStackElement(lastElement)) {
                lastElement.close();
            }
        }
        popStackElement() {
            const lastElement = this._undoRedoService.getLastElement(this._model.uri);
            if (isEditStackElement(lastElement)) {
                lastElement.open();
            }
        }
        clear() {
            this._undoRedoService.removeElements(this._model.uri);
        }
        _getOrCreateEditStackElement(beforeCursorState, group) {
            const lastElement = this._undoRedoService.getLastElement(this._model.uri);
            if (isEditStackElement(lastElement) && lastElement.canAppend(this._model)) {
                return lastElement;
            }
            const newElement = new SingleModelEditStackElement(nls.localize('edit', "Typing"), 'undoredo.textBufferEdit', this._model, beforeCursorState);
            this._undoRedoService.pushElement(newElement, group);
            return newElement;
        }
        pushEOL(eol) {
            const editStackElement = this._getOrCreateEditStackElement(null, undefined);
            this._model.setEOL(eol);
            editStackElement.append(this._model, [], getModelEOL(this._model), this._model.getAlternativeVersionId(), null);
        }
        pushEditOperation(beforeCursorState, editOperations, cursorStateComputer, group) {
            const editStackElement = this._getOrCreateEditStackElement(beforeCursorState, group);
            const inverseEditOperations = this._model.applyEdits(editOperations, true);
            const afterCursorState = EditStack._computeCursorState(cursorStateComputer, inverseEditOperations);
            const textChanges = inverseEditOperations.map((op, index) => ({ index: index, textChange: op.textChange }));
            textChanges.sort((a, b) => {
                if (a.textChange.oldPosition === b.textChange.oldPosition) {
                    return a.index - b.index;
                }
                return a.textChange.oldPosition - b.textChange.oldPosition;
            });
            editStackElement.append(this._model, textChanges.map(op => op.textChange), getModelEOL(this._model), this._model.getAlternativeVersionId(), afterCursorState);
            return afterCursorState;
        }
        static _computeCursorState(cursorStateComputer, inverseEditOperations) {
            try {
                return cursorStateComputer ? cursorStateComputer(inverseEditOperations) : null;
            }
            catch (e) {
                (0, errors_1.onUnexpectedError)(e);
                return null;
            }
        }
    }
    exports.EditStack = EditStack;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdFN0YWNrLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9tb2RlbC9lZGl0U3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZWhHLFNBQVMsbUJBQW1CLENBQUMsUUFBYTtRQUN6QyxPQUFPLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBRUQsTUFBYSx3QkFBd0I7UUFFN0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFpQixFQUFFLGlCQUFxQztZQUM1RSxNQUFNLG9CQUFvQixHQUFHLEtBQUssQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1lBQzdELE1BQU0sR0FBRyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQixPQUFPLElBQUksd0JBQXdCLENBQ2xDLG9CQUFvQixFQUNwQixvQkFBb0IsRUFDcEIsR0FBRyxFQUNILEdBQUcsRUFDSCxpQkFBaUIsRUFDakIsaUJBQWlCLEVBQ2pCLEVBQUUsQ0FDRixDQUFDO1FBQ0gsQ0FBQztRQUVELFlBQ2lCLGVBQXVCLEVBQ2hDLGNBQXNCLEVBQ2IsU0FBNEIsRUFDckMsUUFBMkIsRUFDbEIsaUJBQXFDLEVBQzlDLGdCQUFvQyxFQUNwQyxPQUFxQjtZQU5aLG9CQUFlLEdBQWYsZUFBZSxDQUFRO1lBQ2hDLG1CQUFjLEdBQWQsY0FBYyxDQUFRO1lBQ2IsY0FBUyxHQUFULFNBQVMsQ0FBbUI7WUFDckMsYUFBUSxHQUFSLFFBQVEsQ0FBbUI7WUFDbEIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUM5QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW9CO1lBQ3BDLFlBQU8sR0FBUCxPQUFPLENBQWM7UUFDekIsQ0FBQztRQUVFLE1BQU0sQ0FBQyxLQUFpQixFQUFFLFdBQXlCLEVBQUUsUUFBMkIsRUFBRSxjQUFzQixFQUFFLGdCQUFvQztZQUNwSixJ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