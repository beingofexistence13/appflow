/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/editor/common/core/cursorColumns", "./length", "./smallImmutableSet"], function (require, exports, errors_1, cursorColumns_1, length_1, smallImmutableSet_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InvalidBracketAstNode = exports.BracketAstNode = exports.TextAstNode = exports.ListAstNode = exports.PairAstNode = exports.AstNodeKind = void 0;
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
            return this._length;
        }
        constructor(length) {
            this._length = length;
        }
    }
    /**
     * Represents a bracket pair including its child (e.g. `{ ... }`).
     * Might be unclosed.
     * Immutable, if all children are immutable.
    */
    class PairAstNode extends BaseAstNode {
        static create(openingBracket, child, closingBracket) {
            let length = openingBracket.length;
            if (child) {
                length = (0, length_1.lengthAdd)(length, child.length);
            }
            if (closingBracket) {
                length = (0, length_1.lengthAdd)(length, closingBracket.length);
            }
            return new PairAstNode(length, openingBracket, child, closingBracket, child ? child.missingOpeningBracketIds : smallImmutableSet_1.SmallImmutableSet.getEmpty());
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
            return PairAstNode.create(this.openingBracket.flattenLists(), this.child && this.child.flattenLists(), this.closingBracket && this.closingBracket.flattenLists());
        }
        deepClone() {
            return new PairAstNode(this.length, this.openingBracket.deepClone(), this.child && this.child.deepClone(), this.closingBracket && this.closingBracket.deepClone(), this.missingOpeningBracketIds);
        }
        computeMinIndentation(offset, textModel) {
            return this.child ? this.child.computeMinIndentation((0, length_1.lengthAdd)(offset, this.openingBracket.length), textModel) : Number.MAX_SAFE_INTEGER;
        }
    }
    exports.PairAstNode = PairAstNode;
    class ListAstNode extends BaseAstNode {
        /**
         * This method uses more memory-efficient list nodes that can only store 2 or 3 children.
        */
        static create23(item1, item2, item3, immutable = false) {
            let length = item1.length;
            let missingBracketIds = item1.missingOpeningBracketIds;
            if (item1.listHeight !== item2.listHeight) {
                throw new Error('Invalid list heights');
            }
            length = (0, length_1.lengthAdd)(length, item2.length);
            missingBracketIds = missingBracketIds.merge(item2.missingOpeningBracketIds);
            if (item3) {
                if (item1.listHeight !== item3.listHeight) {
                    throw new Error('Invalid list heights');
                }
                length = (0, length_1.lengthAdd)(length, item3.length);
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
                    length = (0, length_1.lengthAdd)(length, items[i].length);
                    unopenedBrackets = unopenedBrackets.merge(items[i].missingOpeningBracketIds);
                }
                return immutable
                    ? new ImmutableArrayListAstNode(length, items[0].listHeight + 1, items, unopenedBrackets)
                    : new ArrayListAstNode(length, items[0].listHeight + 1, items, unopenedBrackets);
            }
        }
        static getEmpty() {
            return new ImmutableArrayListAstNode(length_1.lengthZero, 0, [], smallImmutableSet_1.SmallImmutableSet.getEmpty());
        }
        get kind() {
            return 4 /* AstNodeKind.List */;
        }
        get missingOpeningBracketIds() {
            return this._missingOpeningBracketIds;
        }
        /**
         * Use ListAstNode.create.
        */
        constructor(length, listHeight, _missingOpeningBracketIds) {
            super(length);
            this.listHeight = listHeight;
            this._missingOpeningBracketIds = _missingOpeningBracketIds;
            this.cachedMinIndentation = -1;
        }
        throwIfImmutable() {
            // NOOP
        }
        makeLastElementMutable() {
            this.throwIfImmutable();
            const childCount = this.childrenLength;
            if (childCount === 0) {
                return undefined;
            }
            const lastChild = this.getChild(childCount - 1);
            const mutable = lastChild.kind === 4 /* AstNodeKind.List */ ? lastChild.toMutable() : lastChild;
            if (lastChild !== mutable) {
                this.setChild(childCount - 1, mutable);
            }
            return mutable;
        }
        makeFirstElementMutable() {
            this.throwIfImmutable();
            const childCount = this.childrenLength;
            if (childCount === 0) {
                return undefined;
            }
            const firstChild = this.getChild(0);
            const mutable = firstChild.kind === 4 /* AstNodeKind.List */ ? firstChild.toMutable() : firstChild;
            if (firstChild !== mutable) {
                this.setChild(0, mutable);
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
                    throw new errors_1.BugIndicatingError();
                }
                lastChild = lastChild.getChild(lastLength - 1);
            }
            return lastChild.canBeReused(openBracketIds);
        }
        handleChildrenChanged() {
            this.throwIfImmutable();
            const count = this.childrenLength;
            let length = this.getChild(0).length;
            let unopenedBrackets = this.getChild(0).missingOpeningBracketIds;
            for (let i = 1; i < count; i++) {
                const child = this.getChild(i);
                length = (0, length_1.lengthAdd)(length, child.length);
                unopenedBrackets = unopenedBrackets.merge(child.missingOpeningBracketIds);
            }
            this._length = length;
            this._missingOpeningBracketIds = unopenedBrackets;
            this.cachedMinIndentation = -1;
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
            return ListAstNode.create(items);
        }
        computeMinIndentation(offset, textModel) {
            if (this.cachedMinIndentation !== -1) {
                return this.cachedMinIndentation;
            }
            let minIndentation = Number.MAX_SAFE_INTEGER;
            let childOffset = offset;
            for (let i = 0; i < this.childrenLength; i++) {
                const child = this.getChild(i);
                if (child) {
                    minIndentation = Math.min(minIndentation, child.computeMinIndentation(childOffset, textModel));
                    childOffset = (0, length_1.lengthAdd)(childOffset, child.length);
                }
            }
            this.cachedMinIndentation = minIndentation;
            return minIndentation;
        }
    }
    exports.ListAstNode = ListAstNode;
    class TwoThreeListAstNode extends ListAstNode {
        get childrenLength() {
            return this._item3 !== null ? 3 : 2;
        }
        getChild(idx) {
            switch (idx) {
                case 0: return this._item1;
                case 1: return this._item2;
                case 2: return this._item3;
            }
            throw new Error('Invalid child index');
        }
        setChild(idx, node) {
            switch (idx) {
                case 0:
                    this._item1 = node;
                    return;
                case 1:
                    this._item2 = node;
                    return;
                case 2:
                    this._item3 = node;
                    return;
            }
            throw new Error('Invalid child index');
        }
        get children() {
            return this._item3 ? [this._item1, this._item2, this._item3] : [this._item1, this._item2];
        }
        get item1() {
            return this._item1;
        }
        get item2() {
            return this._item2;
        }
        get item3() {
            return this._item3;
        }
        constructor(length, listHeight, _item1, _item2, _item3, missingOpeningBracketIds) {
            super(length, listHeight, missingOpeningBracketIds);
            this._item1 = _item1;
            this._item2 = _item2;
            this._item3 = _item3;
        }
        deepClone() {
            return new TwoThreeListAstNode(this.length, this.listHeight, this._item1.deepClone(), this._item2.deepClone(), this._item3 ? this._item3.deepClone() : null, this.missingOpeningBracketIds);
        }
        appendChildOfSameHeight(node) {
            if (this._item3) {
                throw new Error('Cannot append to a full (2,3) tree node');
            }
            this.throwIfImmutable();
            this._item3 = node;
            this.handleChildrenChanged();
        }
        unappendChild() {
            if (!this._item3) {
                throw new Error('Cannot remove from a non-full (2,3) tree node');
            }
            this.throwIfImmutable();
            const result = this._item3;
            this._item3 = null;
            this.handleChildrenChanged();
            return result;
        }
        prependChildOfSameHeight(node) {
            if (this._item3) {
                throw new Error('Cannot prepend to a full (2,3) tree node');
            }
            this.throwIfImmutable();
            this._item3 = this._item2;
            this._item2 = this._item1;
            this._item1 = node;
            this.handleChildrenChanged();
        }
        unprependChild() {
            if (!this._item3) {
                throw new Error('Cannot remove from a non-full (2,3) tree node');
            }
            this.throwIfImmutable();
            const result = this._item1;
            this._item1 = this._item2;
            this._item2 = this._item3;
            this._item3 = null;
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
        throwIfImmutable() {
            throw new Error('this instance is immutable');
        }
    }
    /**
     * For debugging.
    */
    class ArrayListAstNode extends ListAstNode {
        get childrenLength() {
            return this._children.length;
        }
        getChild(idx) {
            return this._children[idx];
        }
        setChild(idx, child) {
            this._children[idx] = child;
        }
        get children() {
            return this._children;
        }
        constructor(length, listHeight, _children, missingOpeningBracketIds) {
            super(length, listHeight, missingOpeningBracketIds);
            this._children = _children;
        }
        deepClone() {
            const children = new Array(this._children.length);
            for (let i = 0; i < this._children.length; i++) {
                children[i] = this._children[i].deepClone();
            }
            return new ArrayListAstNode(this.length, this.listHeight, children, this.missingOpeningBracketIds);
        }
        appendChildOfSameHeight(node) {
            this.throwIfImmutable();
            this._children.push(node);
            this.handleChildrenChanged();
        }
        unappendChild() {
            this.throwIfImmutable();
            const item = this._children.pop();
            this.handleChildrenChanged();
            return item;
        }
        prependChildOfSameHeight(node) {
            this.throwIfImmutable();
            this._children.unshift(node);
            this.handleChildrenChanged();
        }
        unprependChild() {
            this.throwIfImmutable();
            const item = this._children.shift();
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
        throwIfImmutable() {
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
    class TextAstNode extends ImmutableLeafAstNode {
        get kind() {
            return 0 /* AstNodeKind.Text */;
        }
        get missingOpeningBracketIds() {
            return smallImmutableSet_1.SmallImmutableSet.getEmpty();
        }
        canBeReused(_openedBracketIds) {
            return true;
        }
        computeMinIndentation(offset, textModel) {
            const start = (0, length_1.lengthToObj)(offset);
            // Text ast nodes don't have partial indentation (ensured by the tokenizer).
            // Thus, if this text node does not start at column 0, the first line cannot have any indentation at all.
            const startLineNumber = (start.columnCount === 0 ? start.lineCount : start.lineCount + 1) + 1;
            const endLineNumber = (0, length_1.lengthGetLineCount)((0, length_1.lengthAdd)(offset, this.length)) + 1;
            let result = Number.MAX_SAFE_INTEGER;
            for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
                const firstNonWsColumn = textModel.getLineFirstNonWhitespaceColumn(lineNumber);
                const lineContent = textModel.getLineContent(lineNumber);
                if (firstNonWsColumn === 0) {
                    continue;
                }
                const visibleColumn = cursorColumns_1.CursorColumns.visibleColumnFromColumn(lineContent, firstNonWsColumn, textModel.getOptions().tabSize);
                result = Math.min(result, visibleColumn);
            }
            return result;
        }
    }
    exports.TextAstNode = TextAstNode;
    class BracketAstNode extends ImmutableLeafAstNode {
        static create(length, bracketInfo, bracketIds) {
            const node = new BracketAstNode(length, bracketInfo, bracketIds);
            return node;
        }
        get kind() {
            return 1 /* AstNodeKind.Bracket */;
        }
        get missingOpeningBracketIds() {
            return smallImmutableSet_1.SmallImmutableSet.getEmpty();
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
    exports.BracketAstNode = BracketAstNode;
    class InvalidBracketAstNode extends ImmutableLeafAstNode {
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
    exports.InvalidBracketAstNode = InvalidBracketAstNode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9tb2RlbC9icmFja2V0UGFpcnNUZXh0TW9kZWxQYXJ0L2JyYWNrZXRQYWlyc1RyZWUvYXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVVoRyxJQUFrQixXQU1qQjtJQU5ELFdBQWtCLFdBQVc7UUFDNUIsNkNBQVEsQ0FBQTtRQUNSLG1EQUFXLENBQUE7UUFDWCw2Q0FBUSxDQUFBO1FBQ1IscUZBQTRCLENBQUE7UUFDNUIsNkNBQVEsQ0FBQTtJQUNULENBQUMsRUFOaUIsV0FBVywyQkFBWCxXQUFXLFFBTTVCO0lBSUQ7O01BRUU7SUFDRixNQUFlLFdBQVc7UUE0QnpCOztVQUVFO1FBQ0YsSUFBVyxNQUFNO1lBQ2hCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUNyQixDQUFDO1FBRUQsWUFBbUIsTUFBYztZQUNoQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUN2QixDQUFDO0tBb0JEO0lBRUQ7Ozs7TUFJRTtJQUNGLE1BQWEsV0FBWSxTQUFRLFdBQVc7UUFDcEMsTUFBTSxDQUFDLE1BQU0sQ0FDbkIsY0FBOEIsRUFDOUIsS0FBcUIsRUFDckIsY0FBcUM7WUFFckMsSUFBSSxNQUFNLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQztZQUNuQyxJQUFJLEtBQUssRUFBRTtnQkFDVixNQUFNLEdBQUcsSUFBQSxrQkFBUyxFQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDekM7WUFDRCxJQUFJLGNBQWMsRUFBRTtnQkFDbkIsTUFBTSxHQUFHLElBQUEsa0JBQVMsRUFBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ2xEO1lBQ0QsT0FBTyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEVBQUUsY0FBYyxFQUFFLEtBQUssRUFB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