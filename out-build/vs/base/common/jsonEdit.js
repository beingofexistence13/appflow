/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "./json", "./jsonFormatter"], function (require, exports, json_1, jsonFormatter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$FS = exports.$ES = exports.$DS = exports.$CS = exports.$BS = void 0;
    function $BS(text, path, formattingOptions) {
        return $CS(text, path, undefined, formattingOptions);
    }
    exports.$BS = $BS;
    function $CS(text, originalPath, value, formattingOptions, getInsertionIndex) {
        const path = originalPath.slice();
        const errors = [];
        const root = (0, json_1.$Mm)(text, errors);
        let parent = undefined;
        let lastSegment = undefined;
        while (path.length > 0) {
            lastSegment = path.pop();
            parent = (0, json_1.$Nm)(root, path);
            if (parent === undefined && value !== undefined) {
                if (typeof lastSegment === 'string') {
                    value = { [lastSegment]: value };
                }
                else {
                    value = [value];
                }
            }
            else {
                break;
            }
        }
        if (!parent) {
            // empty document
            if (value === undefined) { // delete
                throw new Error('Can not delete in empty document');
            }
            return $DS(text, { offset: root ? root.offset : 0, length: root ? root.length : 0, content: JSON.stringify(value) }, formattingOptions);
        }
        else if (parent.type === 'object' && typeof lastSegment === 'string' && Array.isArray(parent.children)) {
            const existing = (0, json_1.$Nm)(parent, [lastSegment]);
            if (existing !== undefined) {
                if (value === undefined) { // delete
                    if (!existing.parent) {
                        throw new Error('Malformed AST');
                    }
                    const propertyIndex = parent.children.indexOf(existing.parent);
                    let removeBegin;
                    let removeEnd = existing.parent.offset + existing.parent.length;
                    if (propertyIndex > 0) {
                        // remove the comma of the previous node
                        const previous = parent.children[propertyIndex - 1];
                        removeBegin = previous.offset + previous.length;
                    }
                    else {
                        removeBegin = parent.offset + 1;
                        if (parent.children.length > 1) {
                            // remove the comma of the next node
                            const next = parent.children[1];
                            removeEnd = next.offset;
                        }
                    }
                    return $DS(text, { offset: removeBegin, length: removeEnd - removeBegin, content: '' }, formattingOptions);
                }
                else {
                    // set value of existing property
                    return $DS(text, { offset: existing.offset, length: existing.length, content: JSON.stringify(value) }, formattingOptions);
                }
            }
            else {
                if (value === undefined) { // delete
                    return []; // property does not exist, nothing to do
                }
                const newProperty = `${JSON.stringify(lastSegment)}: ${JSON.stringify(value)}`;
                const index = getInsertionIndex ? getInsertionIndex(parent.children.map(p => p.children[0].value)) : parent.children.length;
                let edit;
                if (index > 0) {
                    const previous = parent.children[index - 1];
                    edit = { offset: previous.offset + previous.length, length: 0, content: ',' + newProperty };
                }
                else if (parent.children.length === 0) {
                    edit = { offset: parent.offset + 1, length: 0, content: newProperty };
                }
                else {
                    edit = { offset: parent.offset + 1, length: 0, content: newProperty + ',' };
                }
                return $DS(text, edit, formattingOptions);
            }
        }
        else if (parent.type === 'array' && typeof lastSegment === 'number' && Array.isArray(parent.children)) {
            if (value !== undefined) {
                // Insert
                const newProperty = `${JSON.stringify(value)}`;
                let edit;
                if (parent.children.length === 0 || lastSegment === 0) {
                    edit = { offset: parent.offset + 1, length: 0, content: parent.children.length === 0 ? newProperty : newProperty + ',' };
                }
                else {
                    const index = lastSegment === -1 || lastSegment > parent.children.length ? parent.children.length : lastSegment;
                    const previous = parent.children[index - 1];
                    edit = { offset: previous.offset + previous.length, length: 0, content: ',' + newProperty };
                }
                return $DS(text, edit, formattingOptions);
            }
            else {
                //Removal
                const removalIndex = lastSegment;
                const toRemove = parent.children[removalIndex];
                let edit;
                if (parent.children.length === 1) {
                    // only item
                    edit = { offset: parent.offset + 1, length: parent.length - 2, content: '' };
                }
                else if (parent.children.length - 1 === removalIndex) {
                    // last item
                    const previous = parent.children[removalIndex - 1];
                    const offset = previous.offset + previous.length;
                    const parentEndOffset = parent.offset + parent.length;
                    edit = { offset, length: parentEndOffset - 2 - offset, content: '' };
                }
                else {
                    edit = { offset: toRemove.offset, length: parent.children[removalIndex + 1].offset - toRemove.offset, content: '' };
                }
                return $DS(text, edit, formattingOptions);
            }
        }
        else {
            throw new Error(`Can not add ${typeof lastSegment !== 'number' ? 'index' : 'property'} to parent of type ${parent.type}`);
        }
    }
    exports.$CS = $CS;
    function $DS(text, edit, formattingOptions) {
        // apply the edit
        let newText = $ES(text, edit);
        // format the new text
        let begin = edit.offset;
        let end = edit.offset + edit.content.length;
        if (edit.length === 0 || edit.content.length === 0) { // insert or remove
            while (begin > 0 && !(0, jsonFormatter_1.$AS)(newText, begin - 1)) {
                begin--;
            }
            while (end < newText.length && !(0, jsonFormatter_1.$AS)(newText, end)) {
                end++;
            }
        }
        const edits = (0, jsonFormatter_1.$xS)(newText, { offset: begin, length: end - begin }, formattingOptions);
        // apply the formatting edits and track the begin and end offsets of the changes
        for (let i = edits.length - 1; i >= 0; i--) {
            const curr = edits[i];
            newText = $ES(newText, curr);
            begin = Math.min(begin, curr.offset);
            end = Math.max(end, curr.offset + curr.length);
            end += curr.content.length - curr.length;
        }
        // create a single edit with all changes
        const editLength = text.length - (newText.length - end) - begin;
        return [{ offset: begin, length: editLength, content: newText.substring(begin, end) }];
    }
    exports.$DS = $DS;
    function $ES(text, edit) {
        return text.substring(0, edit.offset) + edit.content + text.substring(edit.offset + edit.length);
    }
    exports.$ES = $ES;
    function $FS(text, edits) {
        const sortedEdits = edits.slice(0).sort((a, b) => {
            const diff = a.offset - b.offset;
            if (diff === 0) {
                return a.length - b.length;
            }
            return diff;
        });
        let lastModifiedOffset = text.length;
        for (let i = sortedEdits.length - 1; i >= 0; i--) {
            const e = sortedEdits[i];
            if (e.offset + e.length <= lastModifiedOffset) {
                text = $ES(text, e);
            }
            else {
                throw new Error('Overlapping edit');
            }
            lastModifiedOffset = e.offset;
        }
        return text;
    }
    exports.$FS = $FS;
});
//# sourceMappingURL=jsonEdit.js.map