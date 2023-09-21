/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/editor/common/core/cursorColumns", "./length", "./smallImmutableSet"], function (require, exports, errors_1, cursorColumns_1, length_1, smallImmutableSet_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$fu = exports.$eu = exports.$du = exports.$cu = exports.$bu = exports.AstNodeKind = void 0;
    var AstNodeKind;
    (function (AstNodeKind) {
        AstNodeKind[AstNodeKind["Text"] = 0] = "Text";
        AstNodeKind[AstNodeKind["Bracket"] = 1] = "Bracket";
        AstNodeKind[AstNodeKind["Pair"] = 2] = "Pair";
        AstNodeKind[AstNodeKind["UnexpectedClosingBracket"] = 3] = "UnexpectedClosingBracket";
        AstNodeKind[AstNodeKind["List"] = 4] = "List";
    })(AstNodeKind || (exports.AstNodeKind = AstNodeKind = {}));
    /**
     * The base implementation for all AST nodes.
    */
    class BaseAstNode {
        /**
         * The length of the entire node, which should equal the sum of lengths of all children.
        */
        get length() {
            return this.a;
        }
        constructor(length) {
            this.a = length;
        }
    }
    /**
     * Represents a bracket pair including its child (e.g. `{ ... }`).
     * Might be unclosed.
     * Immutable, if all children are immutable.
    */
    class $bu extends BaseAstNode {
        static create(openingBracket, child, closingBracket) {
            let length = openingBracket.length;
            if (child) {
                length = (0, length_1.$vt)(length, child.length);
            }
            if (closingBracket) {
                length = (0, length_1.$vt)(length, closingBracket.length);
            }
            return new $bu(length, openingBracket, child, closingBracket, child ? child.missingOpeningBracketIds : smallImmutableSet_1.$Lt.getEmpty());
        }
        get kind() {
            return 2 /* AstNodeKind.Pair */;
        }
        get listHeight() {
            return 0;
        }
        get childrenLength() {
            return 3;
        }
        getChild(idx) {
            switch (idx) {
                case 0: return this.openingBracket;
                case 1: return this.child;
                case 2: return this.closingBracket;
            }
            throw new Error('Invalid child index');
        }
        /**
         * Avoid using this property, it allocates an array!
        */
        get children() {
            const result = [];
            result.push(this.openingBracket);
            if (this.child) {
                result.push(this.child);
            }
            if (this.closingBracket) {
                result.push(this.closingBracket);
            }
            return result;
        }
        constructor(length, openingBracket, child, closingBracket, missingOpeningBracketIds) {
            super(length);
            this.openingBracket = openingBracket;
            this.child = child;
            this.closingBracket = closingBracket;
            this.missingOpeningBracketIds = missingOpeningBracketIds;
        }
        canBeReused(openBracketIds) {
            if (this.closingBracket === null) {
                // Unclosed pair ast nodes only
                // end at the end of the document
                // or when a parent node is closed.
                // This could be improved:
                // Only return false if some next token is neither "undefined" nor a bracket that closes a parent.
                return false;
            }
            if (openBracketIds.intersects(this.missingOpeningBracketIds)) {
                return false;
            }
            return true;
        }
        flattenLists() {
            return $bu.create(this.openingBracket.flattenLists(), this.child && this.child.flattenLists(), this.closingBracket && this.closingBracket.flattenLists());
        }
        deepClone() {
            return new $bu(this.length, this.openingBracket.deepClone(), this.child && this.child.deepClone(), this.closingBracket && this.closingBracket.deepClone(), this.missingOpeningBracketIds);
        }
        computeMinIndentation(offset, textModel) {
            return this.child ? this.child.computeMinIndentation((0, length_1.$vt)(offset, this.openingBracket.length), textModel) : Number.MAX_SAFE_INTEGER;
        }
    }
    exports.$bu = $bu;
    class $cu extends BaseAstNode {
        /**
         * This method uses more memory-efficient list nodes that can only store 2 or 3 children.
        */
        static create23(item1, item2, item3, immutable = false) {
            let length = item1.length;
            let missingBracketIds = item1.missingOpeningBracketIds;
            if (item1.listHeight !== item2.listHeight) {
                throw new Error('Invalid list heights');
            }
            length = (0, length_1.$vt)(length, item2.length);
            missingBracketIds = missingBracketIds.merge(item2.missingOpeningBracketIds);
            if (item3) {
                if (item1.listHeight !== item3.listHeight) {
                    throw new Error('Invalid list heights');
                }
                length = (0, length_1.$vt)(length, item3.length);
                missingBracketIds = missingBracketIds.merge(item3.missingOpeningBracketIds);
            }
            return immutable
                ? new Immutable23ListAstNode(length, item1.listHeight + 1, item1, item2, item3, missingBracketIds)
                : new TwoThreeListAstNode(length, item1.listHeight + 1, item1, item2, item3, missingBracketIds);
        }
        static create(items, immutable = false) {
            if (items.length === 0) {
                return this.getEmpty();
            }
            else {
                let length = items[0].length;
                let unopenedBrackets = items[0].missingOpeningBracketIds;
                for (let i = 1; i < items.length; i++) {
                    length = (0, length_1.$vt)(length, items[i].length);
                    unopenedBrackets = unopenedBrackets.merge(items[i].missingOpeningBracketIds);
                }
                return immutable
                    ? new ImmutableArrayListAstNode(length, items[0].listHeight + 1, items, unopenedBrackets)
                    : new ArrayListAstNode(length, items[0].listHeight + 1, items, unopenedBrackets);
            }
        }
        static getEmpty() {
            return new ImmutableArrayListAstNode(length_1.$pt, 0, [], smallImmutableSet_1.$Lt.getEmpty());
        }
        get kind() {
            return 4 /* AstNodeKind.List */;
        }
        get missingOpeningBracketIds() {
            return this.d;
        }
        /**
         * Use ListAstNode.create.
        */
        constructor(length, listHeight, d) {
            super(length);
            this.listHeight = listHeight;
            this.d = d;
            this.b = -1;
        }
        e() {
            // NOOP
        }
        makeLastElementMutable() {
            this.e();
            const childCount = this.childrenLength;
            if (childCount === 0) {
                return undefined;
            }
            const lastChild = this.getChild(childCount - 1);
            const mutable = lastChild.kind === 4 /* AstNodeKind.List */ ? lastChild.toMutable() : lastChild;
            if (lastChild !== mutable) {
                this.f(childCount - 1, mutable);
            }
            return mutable;
        }
        makeFirstElementMutable() {
            this.e();
            const childCount = this.childrenLength;
            if (childCount === 0) {
                return undefined;
            }
            const firstChild = this.getChild(0);
            const mutable = firstChild.kind === 4 /* AstNodeKind.List */ ? firstChild.toMutable() : firstChild;
            if (firstChild !== mutable) {
                this.f(0, mutable);
            }
            return mutable;
        }
        canBeReused(openBracketIds) {
            if (openBracketIds.intersects(this.missingOpeningBracketIds)) {
                return false;
            }
            if (this.childrenLength === 0) {
                // Don't reuse empty lists.
                return false;
            }
            let lastChild = this;
            while (lastChild.kind === 4 /* AstNodeKind.List */) {
                const lastLength = lastChild.childrenLength;
                if (lastLength === 0) {
                    // Empty lists should never be contained in other lists.
                    throw new errors_1.$ab();
                }
                lastChild = lastChild.getChild(lastLength - 1);
            }
            return lastChild.canBeReused(openBracketIds);
        }
        handleChildrenChanged() {
            this.e();
            const count = this.childrenLength;
            let length = this.getChild(0).length;
            let unopenedBrackets = this.getChild(0).missingOpeningBracketIds;
            for (let i = 1; i < count; i++) {
                const child = this.getChild(i);
                length = (0, length_1.$vt)(length, child.length);
                unopenedBrackets = unopenedBrackets.merge(child.missingOpeningBracketIds);
            }
            this.a = length;
            this.d = unopenedBrackets;
            this.b = -1;
        }
        flattenLists() {
            const items = [];
            for (const c of this.children) {
                const normalized = c.flattenLists();
                if (normalized.kind === 4 /* AstNodeKind.List */) {
                    items.push(...normalized.children);
                }
                else {
                    items.push(normalized);
                }
            }
            return $cu.create(items);
        }
        computeMinIndentation(offset, textModel) {
            if (this.b !== -1) {
                return this.b;
            }
            let minIndentation = Number.MAX_SAFE_INTEGER;
            let childOffset = offset;
            for (let i = 0; i < this.childrenLength; i++) {
                const child = this.getChild(i);
                if (child) {
                    minIndentation = Math.min(minIndentation, child.computeMinIndentation(childOffset, textModel));
                    childOffset = (0, length_1.$vt)(childOffset, child.length);
                }
            }
            this.b = minIndentation;
            return minIndentation;
        }
    }
    exports.$cu = $cu;
    class TwoThreeListAstNode extends $cu {
        get childrenLength() {
            return this.k !== null ? 3 : 2;
        }
        getChild(idx) {
            switch (idx) {
                case 0: return this.h;
                case 1: return this.j;
                case 2: return this.k;
            }
            throw new Error('Invalid child index');
        }
        f(idx, node) {
            switch (idx) {
                case 0:
                    this.h = node;
                    return;
                case 1:
                    this.j = node;
                    return;
                case 2:
                    this.k = node;
                    return;
            }
            throw new Error('Invalid child index');
        }
        get children() {
            return this.k ? [this.h, this.j, this.k] : [this.h, this.j];
        }
        get item1() {
            return this.h;
        }
        get item2() {
            return this.j;
        }
        get item3() {
            return this.k;
        }
        constructor(length, listHeight, h, j, k, missingOpeningBracketIds) {
            super(length, listHeight, missingOpeningBracketIds);
            this.h = h;
            this.j = j;
            this.k = k;
        }
        deepClone() {
            return new TwoThreeListAstNode(this.length, this.listHeight, this.h.deepClone(), this.j.deepClone(), this.k ? this.k.deepClone() : null, this.missingOpeningBracketIds);
        }
        appendChildOfSameHeight(node) {
            if (this.k) {
                throw new Error('Cannot append to a full (2,3) tree node');
            }
            this.e();
            this.k = node;
            this.handleChildrenChanged();
        }
        unappendChild() {
            if (!this.k) {
                throw new Error('Cannot remove from a non-full (2,3) tree node');
            }
            this.e();
            const result = this.k;
            this.k = null;
            this.handleChildrenChanged();
            return result;
        }
        prependChildOfSameHeight(node) {
            if (this.k) {
                throw new Error('Cannot prepend to a full (2,3) tree node');
            }
            this.e();
            this.k = this.j;
            this.j = this.h;
            this.h = node;
            this.handleChildrenChanged();
        }
        unprependChild() {
            if (!this.k) {
                throw new Error('Cannot remove from a non-full (2,3) tree node');
            }
            this.e();
            const result = this.h;
            this.h = this.j;
            this.j = this.k;
            this.k = null;
            this.handleChildrenChanged();
            return result;
        }
        toMutable() {
            return this;
        }
    }
    /**
     * Immutable, if all children are immutable.
    */
    class Immutable23ListAstNode extends TwoThreeListAstNode {
        toMutable() {
            return new TwoThreeListAstNode(this.length, this.listHeight, this.item1, this.item2, this.item3, this.missingOpeningBracketIds);
        }
        e() {
            throw new Error('this instance is immutable');
        }
    }
    /**
     * For debugging.
    */
    class ArrayListAstNode extends $cu {
        get childrenLength() {
            return this.h.length;
        }
        getChild(idx) {
            return this.h[idx];
        }
        f(idx, child) {
            this.h[idx] = child;
        }
        get children() {
            return this.h;
        }
        constructor(length, listHeight, h, missingOpeningBracketIds) {
            super(length, listHeight, missingOpeningBracketIds);
            this.h = h;
        }
        deepClone() {
            const children = new Array(this.h.length);
            for (let i = 0; i < this.h.length; i++) {
                children[i] = this.h[i].deepClone();
            }
            return new ArrayListAstNode(this.length, this.listHeight, children, this.missingOpeningBracketIds);
        }
        appendChildOfSameHeight(node) {
            this.e();
            this.h.push(node);
            this.handleChildrenChanged();
        }
        unappendChild() {
            this.e();
            const item = this.h.pop();
            this.handleChildrenChanged();
            return item;
        }
        prependChildOfSameHeight(node) {
            this.e();
            this.h.unshift(node);
            this.handleChildrenChanged();
        }
        unprependChild() {
            this.e();
            const item = this.h.shift();
            this.handleChildrenChanged();
            return item;
        }
        toMutable() {
            return this;
        }
    }
    /**
     * Immutable, if all children are immutable.
    */
    class ImmutableArrayListAstNode extends ArrayListAstNode {
        toMutable() {
            return new ArrayListAstNode(this.length, this.listHeight, [...this.children], this.missingOpeningBracketIds);
        }
        e() {
            throw new Error('this instance is immutable');
        }
    }
    const emptyArray = [];
    class ImmutableLeafAstNode extends BaseAstNode {
        get listHeight() {
            return 0;
        }
        get childrenLength() {
            return 0;
        }
        getChild(idx) {
            return null;
        }
        get children() {
            return emptyArray;
        }
        flattenLists() {
            return this;
        }
        deepClone() {
            return this;
        }
    }
    class $du extends ImmutableLeafAstNode {
        get kind() {
            return 0 /* AstNodeKind.Text */;
        }
        get missingOpeningBracketIds() {
            return smallImmutableSet_1.$Lt.getEmpty();
        }
        canBeReused(_openedBracketIds) {
            return true;
        }
        computeMinIndentation(offset, textModel) {
            const start = (0, length_1.$st)(offset);
            // Text ast nodes don't have partial indentation (ensured by the tokenizer).
            // Thus, if this text node does not start at column 0, the first line cannot have any indentation at all.
            const startLineNumber = (start.columnCount === 0 ? start.lineCount : start.lineCount + 1) + 1;
            const endLineNumber = (0, length_1.$tt)((0, length_1.$vt)(offset, this.length)) + 1;
            let result = Number.MAX_SAFE_INTEGER;
            for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
                const firstNonWsColumn = textModel.getLineFirstNonWhitespaceColumn(lineNumber);
                const lineContent = textModel.getLineContent(lineNumber);
                if (firstNonWsColumn === 0) {
                    continue;
                }
                const visibleColumn = cursorColumns_1.$mt.visibleColumnFromColumn(lineContent, firstNonWsColumn, textModel.getOptions().tabSize);
                result = Math.min(result, visibleColumn);
            }
            return result;
        }
    }
    exports.$du = $du;
    class $eu extends ImmutableLeafAstNode {
        static create(length, bracketInfo, bracketIds) {
            const node = new $eu(length, bracketInfo, bracketIds);
            return node;
        }
        get kind() {
            return 1 /* AstNodeKind.Bracket */;
        }
        get missingOpeningBracketIds() {
            return smallImmutableSet_1.$Lt.getEmpty();
        }
        constructor(length, bracketInfo, 
        /**
         * In case of a opening bracket, this is the id of the opening bracket.
         * In case of a closing bracket, this contains the ids of all opening brackets it can close.
        */
        bracketIds) {
            super(length);
            this.bracketInfo = bracketInfo;
            this.bracketIds = bracketIds;
        }
        get text() {
            return this.bracketInfo.bracketText;
        }
        get languageId() {
            return this.bracketInfo.languageId;
        }
        canBeReused(_openedBracketIds) {
            // These nodes could be reused,
            // but not in a general way.
            // Their parent may be reused.
            return false;
        }
        computeMinIndentation(offset, textModel) {
            return Number.MAX_SAFE_INTEGER;
        }
    }
    exports.$eu = $eu;
    class $fu extends ImmutableLeafAstNode {
        get kind() {
            return 3 /* AstNodeKind.UnexpectedClosingBracket */;
        }
        constructor(closingBrackets, length) {
            super(length);
            this.missingOpeningBracketIds = closingBrackets;
        }
        canBeReused(openedBracketIds) {
            return !openedBracketIds.intersects(this.missingOpeningBracketIds);
        }
        computeMinIndentation(offset, textModel) {
            return Number.MAX_SAFE_INTEGER;
        }
    }
    exports.$fu = $fu;
});
//# sourceMappingURL=ast.js.map