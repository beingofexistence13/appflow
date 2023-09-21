/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "./ast", "./beforeEditPositionMapper", "./smallImmutableSet", "./length", "./concat23Trees", "./nodeReader"], function (require, exports, ast_1, beforeEditPositionMapper_1, smallImmutableSet_1, length_1, concat23Trees_1, nodeReader_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseDocument = void 0;
    /**
     * Non incrementally built ASTs are immutable.
    */
    function parseDocument(tokenizer, edits, oldNode, createImmutableLists) {
        const parser = new Parser(tokenizer, edits, oldNode, createImmutableLists);
        return parser.parseDocument();
    }
    exports.parseDocument = parseDocument;
    /**
     * Non incrementally built ASTs are immutable.
    */
    class Parser {
        /**
         * Reports how many nodes were constructed in the last parse operation.
        */
        get nodesConstructed() {
            return this._itemsConstructed;
        }
        /**
         * Reports how many nodes were reused in the last parse operation.
        */
        get nodesReused() {
            return this._itemsFromCache;
        }
        constructor(tokenizer, edits, oldNode, createImmutableLists) {
            this.tokenizer = tokenizer;
            this.createImmutableLists = createImmutableLists;
            this._itemsConstructed = 0;
            this._itemsFromCache = 0;
            if (oldNode && createImmutableLists) {
                throw new Error('Not supported');
            }
            this.oldNodeReader = oldNode ? new nodeReader_1.NodeReader(oldNode) : undefined;
            this.positionMapper = new beforeEditPositionMapper_1.BeforeEditPositionMapper(edits);
        }
        parseDocument() {
            this._itemsConstructed = 0;
            this._itemsFromCache = 0;
            let result = this.parseList(smallImmutableSet_1.SmallImmutableSet.getEmpty(), 0);
            if (!result) {
                result = ast_1.ListAstNode.getEmpty();
            }
            return result;
        }
        parseList(openedBracketIds, level) {
            const items = [];
            while (true) {
                let child = this.tryReadChildFromCache(openedBracketIds);
                if (!child) {
                    const token = this.tokenizer.peek();
                    if (!token ||
                        (token.kind === 2 /* TokenKind.ClosingBracket */ &&
                            token.bracketIds.intersects(openedBracketIds))) {
                        break;
                    }
                    child = this.parseChild(openedBracketIds, level + 1);
                }
                if (child.kind === 4 /* AstNodeKind.List */ && child.childrenLength === 0) {
                    continue;
                }
                items.push(child);
            }
            // When there is no oldNodeReader, all items are created from scratch and must have the same height.
            const result = this.oldNodeReader ? (0, concat23Trees_1.concat23Trees)(items) : (0, concat23Trees_1.concat23TreesOfSameHeight)(items, this.createImmutableLists);
            return result;
        }
        tryReadChildFromCache(openedBracketIds) {
            if (this.oldNodeReader) {
                const maxCacheableLength = this.positionMapper.getDistanceToNextChange(this.tokenizer.offset);
                if (maxCacheableLength === null || !(0, length_1.lengthIsZero)(maxCacheableLength)) {
                    const cachedNode = this.oldNodeReader.readLongestNodeAt(this.positionMapper.getOffsetBeforeChange(this.tokenizer.offset), curNode => {
                        // The edit could extend the ending token, thus we cannot re-use nodes that touch the edit.
                        // If there is no edit anymore, we can re-use the node in any case.
                        if (maxCacheableLength !== null && !(0, length_1.lengthLessThan)(curNode.length, maxCacheableLength)) {
                            // Either the node contains edited text or touches edited text.
                            // In the latter case, brackets might have been extended (`end` -> `ending`), so even touching nodes cannot be reused.
                            return false;
                        }
                        const canBeReused = curNode.canBeReused(openedBracketIds);
                        return canBeReused;
                    });
                    if (cachedNode) {
                        this._itemsFromCache++;
                        this.tokenizer.skip(cachedNode.length);
                        return cachedNode;
                    }
                }
            }
            return undefined;
        }
        parseChild(openedBracketIds, level) {
            this._itemsConstructed++;
            const token = this.tokenizer.read();
            switch (token.kind) {
                case 2 /* TokenKind.ClosingBracket */:
                    return new ast_1.InvalidBracketAstNode(token.bracketIds, token.length);
                case 0 /* TokenKind.Text */:
                    return token.astNode;
                case 1 /* TokenKind.OpeningBracket */: {
                    if (level > 300) {
                        // To prevent stack overflows
                        return new ast_1.TextAstNode(token.length);
                    }
                    const set = openedBracketIds.merge(token.bracketIds);
                    const child = this.parseList(set, level + 1);
                    const nextToken = this.tokenizer.peek();
                    if (nextToken &&
                        nextToken.kind === 2 /* TokenKind.ClosingBracket */ &&
                        (nextToken.bracketId === token.bracketId || nextToken.bracketIds.intersects(token.bracketIds))) {
                        this.tokenizer.read();
                        return ast_1.PairAstNode.create(token.astNode, child, nextToken.astNode);
                    }
                    else {
                        return ast_1.PairAstNode.create(token.astNode, child, null);
                    }
                }
                default:
                    throw new Error('unexpected');
            }
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9tb2RlbC9icmFja2V0UGFpcnNUZXh0TW9kZWxQYXJ0L2JyYWNrZXRQYWlyc1RyZWUvcGFyc2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVVoRzs7TUFFRTtJQUNGLFNBQWdCLGFBQWEsQ0FBQyxTQUFvQixFQUFFLEtBQXFCLEVBQUUsT0FBNEIsRUFBRSxvQkFBNkI7UUFDckksTUFBTSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztRQUMzRSxPQUFPLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBSEQsc0NBR0M7SUFFRDs7TUFFRTtJQUNGLE1BQU0sTUFBTTtRQU1YOztVQUVFO1FBQ0YsSUFBSSxnQkFBZ0I7WUFDbkIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUM7UUFDL0IsQ0FBQztRQUVEOztVQUVFO1FBQ0YsSUFBSSxXQUFXO1lBQ2QsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO1FBQzdCLENBQUM7UUFFRCxZQUNrQixTQUFvQixFQUNyQyxLQUFxQixFQUNyQixPQUE0QixFQUNYLG9CQUE2QjtZQUg3QixjQUFTLEdBQVQsU0FBUyxDQUFXO1lBR3BCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBUztZQXJCdkMsc0JBQWlCLEdBQVcsQ0FBQyxDQUFDO1lBQzlCLG9CQUFlLEdBQVcsQ0FBQyxDQUFDO1lBc0JuQyxJQUFJLE9BQU8sSUFBSSxvQkFBb0IsRUFBRTtnQkFDcEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQzthQUNqQztZQUVELElBQUksQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLHVCQUFVLENBQUMsT0FB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