/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "./ast", "./beforeEditPositionMapper", "./smallImmutableSet", "./length", "./concat23Trees", "./nodeReader"], function (require, exports, ast_1, beforeEditPositionMapper_1, smallImmutableSet_1, length_1, concat23Trees_1, nodeReader_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$NA = void 0;
    /**
     * Non incrementally built ASTs are immutable.
    */
    function $NA(tokenizer, edits, oldNode, createImmutableLists) {
        const parser = new Parser(tokenizer, edits, oldNode, createImmutableLists);
        return parser.parseDocument();
    }
    exports.$NA = $NA;
    /**
     * Non incrementally built ASTs are immutable.
    */
    class Parser {
        /**
         * Reports how many nodes were constructed in the last parse operation.
        */
        get nodesConstructed() {
            return this.c;
        }
        /**
         * Reports how many nodes were reused in the last parse operation.
        */
        get nodesReused() {
            return this.d;
        }
        constructor(e, edits, oldNode, f) {
            this.e = e;
            this.f = f;
            this.c = 0;
            this.d = 0;
            if (oldNode && f) {
                throw new Error('Not supported');
            }
            this.a = oldNode ? new nodeReader_1.$MA(oldNode) : undefined;
            this.b = new beforeEditPositionMapper_1.$JA(edits);
        }
        parseDocument() {
            this.c = 0;
            this.d = 0;
            let result = this.g(smallImmutableSet_1.$Lt.getEmpty(), 0);
            if (!result) {
                result = ast_1.$cu.getEmpty();
            }
            return result;
        }
        g(openedBracketIds, level) {
            const items = [];
            while (true) {
                let child = this.h(openedBracketIds);
                if (!child) {
                    const token = this.e.peek();
                    if (!token ||
                        (token.kind === 2 /* TokenKind.ClosingBracket */ &&
                            token.bracketIds.intersects(openedBracketIds))) {
                        break;
                    }
                    child = this.i(openedBracketIds, level + 1);
                }
                if (child.kind === 4 /* AstNodeKind.List */ && child.childrenLength === 0) {
                    continue;
                }
                items.push(child);
            }
            // When there is no oldNodeReader, all items are created from scratch and must have the same height.
            const result = this.a ? (0, concat23Trees_1.$KA)(items) : (0, concat23Trees_1.$LA)(items, this.f);
            return result;
        }
        h(openedBracketIds) {
            if (this.a) {
                const maxCacheableLength = this.b.getDistanceToNextChange(this.e.offset);
                if (maxCacheableLength === null || !(0, length_1.$qt)(maxCacheableLength)) {
                    const cachedNode = this.a.readLongestNodeAt(this.b.getOffsetBeforeChange(this.e.offset), curNode => {
                        // The edit could extend the ending token, thus we cannot re-use nodes that touch the edit.
                        // If there is no edit anymore, we can re-use the node in any case.
                        if (maxCacheableLength !== null && !(0, length_1.$zt)(curNode.length, maxCacheableLength)) {
                            // Either the node contains edited text or touches edited text.
                            // In the latter case, brackets might have been extended (`end` -> `ending`), so even touching nodes cannot be reused.
                            return false;
                        }
                        const canBeReused = curNode.canBeReused(openedBracketIds);
                        return canBeReused;
                    });
                    if (cachedNode) {
                        this.d++;
                        this.e.skip(cachedNode.length);
                        return cachedNode;
                    }
                }
            }
            return undefined;
        }
        i(openedBracketIds, level) {
            this.c++;
            const token = this.e.read();
            switch (token.kind) {
                case 2 /* TokenKind.ClosingBracket */:
                    return new ast_1.$fu(token.bracketIds, token.length);
                case 0 /* TokenKind.Text */:
                    return token.astNode;
                case 1 /* TokenKind.OpeningBracket */: {
                    if (level > 300) {
                        // To prevent stack overflows
                        return new ast_1.$du(token.length);
                    }
                    const set = openedBracketIds.merge(token.bracketIds);
                    const child = this.g(set, level + 1);
                    const nextToken = this.e.peek();
                    if (nextToken &&
                        nextToken.kind === 2 /* TokenKind.ClosingBracket */ &&
                        (nextToken.bracketId === token.bracketId || nextToken.bracketIds.intersects(token.bracketIds))) {
                        this.e.read();
                        return ast_1.$bu.create(token.astNode, child, nextToken.astNode);
                    }
                    else {
                        return ast_1.$bu.create(token.astNode, child, null);
                    }
                }
                default:
                    throw new Error('unexpected');
            }
        }
    }
});
//# sourceMappingURL=parser.js.map