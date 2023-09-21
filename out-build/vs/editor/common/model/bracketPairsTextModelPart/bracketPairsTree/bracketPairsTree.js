/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/textModelBracketPairs", "./beforeEditPositionMapper", "./brackets", "./length", "./parser", "./smallImmutableSet", "./tokenizer", "vs/base/common/arrays", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/combineTextEditInfos"], function (require, exports, event_1, lifecycle_1, textModelBracketPairs_1, beforeEditPositionMapper_1, brackets_1, length_1, parser_1, smallImmutableSet_1, tokenizer_1, arrays_1, combineTextEditInfos_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$PA = void 0;
    class $PA extends lifecycle_1.$kc {
        didLanguageChange(languageId) {
            return this.g.didLanguageChange(languageId);
        }
        constructor(m, n) {
            super();
            this.m = m;
            this.n = n;
            this.a = new event_1.$fd();
            this.f = new smallImmutableSet_1.$Nt();
            this.g = new brackets_1.$0t(this.f, this.n);
            this.onDidChange = this.a.event;
            this.h = [];
            this.j = [];
            if (!m.tokenization.hasTokens) {
                const brackets = this.g.getSingleLanguageBracketTokens(this.m.getLanguageId());
                const tokenizer = new tokenizer_1.$au(this.m.getValue(), brackets);
                this.b = (0, parser_1.$NA)(tokenizer, [], undefined, true);
                this.c = this.b;
            }
            else if (m.tokenization.backgroundTokenizationState === 2 /* BackgroundTokenizationState.Completed */) {
                // Skip the initial ast, as there is no flickering.
                // Directly create the tree with token information.
                this.b = undefined;
                this.c = this.u([], undefined, false);
            }
            else {
                // We missed some token changes already, so we cannot use the fast tokenizer + delta increments
                this.b = this.u([], undefined, true);
                this.c = this.b;
            }
        }
        //#region TextModel events
        handleDidChangeBackgroundTokenizationState() {
            if (this.m.tokenization.backgroundTokenizationState === 2 /* BackgroundTokenizationState.Completed */) {
                const wasUndefined = this.b === undefined;
                // Clear the initial tree as we can use the tree with token information now.
                this.b = undefined;
                if (!wasUndefined) {
                    this.a.fire();
                }
            }
        }
        handleDidChangeTokens({ ranges }) {
            const edits = ranges.map(r => new beforeEditPositionMapper_1.$IA((0, length_1.$rt)(r.fromLineNumber - 1, 0), (0, length_1.$rt)(r.toLineNumber, 0), (0, length_1.$rt)(r.toLineNumber - r.fromLineNumber + 1, 0)));
            this.s(edits, true);
            if (!this.b) {
                this.a.fire();
            }
        }
        handleContentChanged(change) {
            const edits = beforeEditPositionMapper_1.$IA.fromModelContentChanges(change.changes);
            this.s(edits, false);
        }
        s(edits, tokenChange) {
            // Lazily queue the edits and only apply them when the tree is accessed.
            const result = (0, combineTextEditInfos_1.$OA)(this.j, edits);
            this.j = result;
            if (this.b && !tokenChange) {
                this.h = (0, combineTextEditInfos_1.$OA)(this.h, edits);
            }
        }
        //#endregion
        t() {
            if (this.j.length > 0) {
                this.c = this.u(this.j, this.c, false);
                this.j = [];
            }
            if (this.h.length > 0) {
                if (this.b) {
                    this.b = this.u(this.h, this.b, false);
                }
                this.h = [];
            }
        }
        /**
         * @pure (only if isPure = true)
        */
        u(edits, previousAst, immutable) {
            // Is much faster if `isPure = false`.
            const isPure = false;
            const previousAstClone = isPure ? previousAst?.deepClone() : previousAst;
            const tokenizer = new tokenizer_1.$_t(this.m, this.g);
            const result = (0, parser_1.$NA)(tokenizer, edits, previousAstClone, immutable);
            return result;
        }
        getBracketsInRange(range, onlyColorizedBrackets) {
            this.t();
            const startOffset = (0, length_1.$rt)(range.startLineNumber - 1, range.startColumn - 1);
            const endOffset = (0, length_1.$rt)(range.endLineNumber - 1, range.endColumn - 1);
            return new arrays_1.$$b(cb => {
                const node = this.b || this.c;
                collectBrackets(node, length_1.$pt, node.length, startOffset, endOffset, cb, 0, 0, new Map(), onlyColorizedBrackets);
            });
        }
        getBracketPairsInRange(range, includeMinIndentation) {
            this.t();
            const startLength = (0, length_1.$Dt)(range.getStartPosition());
            const endLength = (0, length_1.$Dt)(range.getEndPosition());
            return new arrays_1.$$b(cb => {
                const node = this.b || this.c;
                const context = new CollectBracketPairsContext(cb, includeMinIndentation, this.m);
                collectBracketPairs(node, length_1.$pt, node.length, startLength, endLength, context, 0, new Map());
            });
        }
        getFirstBracketAfter(position) {
            this.t();
            const node = this.b || this.c;
            return getFirstBracketAfter(node, length_1.$pt, node.length, (0, length_1.$Dt)(position));
        }
        getFirstBracketBefore(position) {
            this.t();
            const node = this.b || this.c;
            return getFirstBracketBefore(node, length_1.$pt, node.length, (0, length_1.$Dt)(position));
        }
    }
    exports.$PA = $PA;
    function getFirstBracketBefore(node, nodeOffsetStart, nodeOffsetEnd, position) {
        if (node.kind === 4 /* AstNodeKind.List */ || node.kind === 2 /* AstNodeKind.Pair */) {
            const lengths = [];
            for (const child of node.children) {
                nodeOffsetEnd = (0, length_1.$vt)(nodeOffsetStart, child.length);
                lengths.push({ nodeOffsetStart, nodeOffsetEnd });
                nodeOffsetStart = nodeOffsetEnd;
            }
            for (let i = lengths.length - 1; i >= 0; i--) {
                const { nodeOffsetStart, nodeOffsetEnd } = lengths[i];
                if ((0, length_1.$zt)(nodeOffsetStart, position)) {
                    const result = getFirstBracketBefore(node.children[i], nodeOffsetStart, nodeOffsetEnd, position);
                    if (result) {
                        return result;
                    }
                }
            }
            return null;
        }
        else if (node.kind === 3 /* AstNodeKind.UnexpectedClosingBracket */) {
            return null;
        }
        else if (node.kind === 1 /* AstNodeKind.Bracket */) {
            const range = (0, length_1.$Et)(nodeOffsetStart, nodeOffsetEnd);
            return {
                bracketInfo: node.bracketInfo,
                range
            };
        }
        return null;
    }
    function getFirstBracketAfter(node, nodeOffsetStart, nodeOffsetEnd, position) {
        if (node.kind === 4 /* AstNodeKind.List */ || node.kind === 2 /* AstNodeKind.Pair */) {
            for (const child of node.children) {
                nodeOffsetEnd = (0, length_1.$vt)(nodeOffsetStart, child.length);
                if ((0, length_1.$zt)(position, nodeOffsetEnd)) {
                    const result = getFirstBracketAfter(child, nodeOffsetStart, nodeOffsetEnd, position);
                    if (result) {
                        return result;
                    }
                }
                nodeOffsetStart = nodeOffsetEnd;
            }
            return null;
        }
        else if (node.kind === 3 /* AstNodeKind.UnexpectedClosingBracket */) {
            return null;
        }
        else if (node.kind === 1 /* AstNodeKind.Bracket */) {
            const range = (0, length_1.$Et)(nodeOffsetStart, nodeOffsetEnd);
            return {
                bracketInfo: node.bracketInfo,
                range
            };
        }
        return null;
    }
    function collectBrackets(node, nodeOffsetStart, nodeOffsetEnd, startOffset, endOffset, push, level, nestingLevelOfEqualBracketType, levelPerBracketType, onlyColorizedBrackets, parentPairIsIncomplete = false) {
        if (level > 200) {
            return true;
        }
        whileLoop: while (true) {
            switch (node.kind) {
                case 4 /* AstNodeKind.List */: {
                    const childCount = node.childrenLength;
                    for (let i = 0; i < childCount; i++) {
                        const child = node.getChild(i);
                        if (!child) {
                            continue;
                        }
                        nodeOffsetEnd = (0, length_1.$vt)(nodeOffsetStart, child.length);
                        if ((0, length_1.$At)(nodeOffsetStart, endOffset) &&
                            (0, length_1.$Bt)(nodeOffsetEnd, startOffset)) {
                            const childEndsAfterEnd = (0, length_1.$Bt)(nodeOffsetEnd, endOffset);
                            if (childEndsAfterEnd) {
                                // No child after this child in the requested window, don't recurse
                                node = child;
                                continue whileLoop;
                            }
                            const shouldContinue = collectBrackets(child, nodeOffsetStart, nodeOffsetEnd, startOffset, endOffset, push, level, 0, levelPerBracketType, onlyColorizedBrackets);
                            if (!shouldContinue) {
                                return false;
                            }
                        }
                        nodeOffsetStart = nodeOffsetEnd;
                    }
                    return true;
                }
                case 2 /* AstNodeKind.Pair */: {
                    const colorize = !onlyColorizedBrackets || !node.closingBracket || node.closingBracket.bracketInfo.closesColorized(node.openingBracket.bracketInfo);
                    let levelPerBracket = 0;
                    if (levelPerBracketType) {
                        let existing = levelPerBracketType.get(node.openingBracket.text);
                        if (existing === undefined) {
                            existing = 0;
                        }
                        levelPerBracket = existing;
                        if (colorize) {
                            existing++;
                            levelPerBracketType.set(node.openingBracket.text, existing);
                        }
                    }
                    const childCount = node.childrenLength;
                    for (let i = 0; i < childCount; i++) {
                        const child = node.getChild(i);
                        if (!child) {
                            continue;
                        }
                        nodeOffsetEnd = (0, length_1.$vt)(nodeOffsetStart, child.length);
                        if ((0, length_1.$At)(nodeOffsetStart, endOffset) &&
                            (0, length_1.$Bt)(nodeOffsetEnd, startOffset)) {
                            const childEndsAfterEnd = (0, length_1.$Bt)(nodeOffsetEnd, endOffset);
                            if (childEndsAfterEnd && child.kind !== 1 /* AstNodeKind.Bracket */) {
                                // No child after this child in the requested window, don't recurse
                                // Don't do this for brackets because of unclosed/unopened brackets
                                node = child;
                                if (colorize) {
                                    level++;
                                    nestingLevelOfEqualBracketType = levelPerBracket + 1;
                                }
                                else {
                                    nestingLevelOfEqualBracketType = levelPerBracket;
                                }
                                continue whileLoop;
                            }
                            if (colorize || child.kind !== 1 /* AstNodeKind.Bracket */ || !node.closingBracket) {
                                const shouldContinue = collectBrackets(child, nodeOffsetStart, nodeOffsetEnd, startOffset, endOffset, push, colorize ? level + 1 : level, colorize ? levelPerBracket + 1 : levelPerBracket, levelPerBracketType, onlyColorizedBrackets, !node.closingBracket);
                                if (!shouldContinue) {
                                    return false;
                                }
                            }
                        }
                        nodeOffsetStart = nodeOffsetEnd;
                    }
                    levelPerBracketType?.set(node.openingBracket.text, levelPerBracket);
                    return true;
                }
                case 3 /* AstNodeKind.UnexpectedClosingBracket */: {
                    const range = (0, length_1.$Et)(nodeOffsetStart, nodeOffsetEnd);
                    return push(new textModelBracketPairs_1.$gu(range, level - 1, 0, true));
                }
                case 1 /* AstNodeKind.Bracket */: {
                    const range = (0, length_1.$Et)(nodeOffsetStart, nodeOffsetEnd);
                    return push(new textModelBracketPairs_1.$gu(range, level - 1, nestingLevelOfEqualBracketType - 1, parentPairIsIncomplete));
                }
                case 0 /* AstNodeKind.Text */:
                    return true;
            }
        }
    }
    class CollectBracketPairsContext {
        constructor(push, includeMinIndentation, textModel) {
            this.push = push;
            this.includeMinIndentation = includeMinIndentation;
            this.textModel = textModel;
        }
    }
    function collectBracketPairs(node, nodeOffsetStart, nodeOffsetEnd, startOffset, endOffset, context, level, levelPerBracketType) {
        if (level > 200) {
            return true;
        }
        let shouldContinue = true;
        if (node.kind === 2 /* AstNodeKind.Pair */) {
            let levelPerBracket = 0;
            if (levelPerBracketType) {
                let existing = levelPerBracketType.get(node.openingBracket.text);
                if (existing === undefined) {
                    existing = 0;
                }
                levelPerBracket = existing;
                existing++;
                levelPerBracketType.set(node.openingBracket.text, existing);
            }
            const openingBracketEnd = (0, length_1.$vt)(nodeOffsetStart, node.openingBracket.length);
            let minIndentation = -1;
            if (context.includeMinIndentation) {
                minIndentation = node.computeMinIndentation(nodeOffsetStart, context.textModel);
            }
            shouldContinue = context.push(new textModelBracketPairs_1.$iu((0, length_1.$Et)(nodeOffsetStart, nodeOffsetEnd), (0, length_1.$Et)(nodeOffsetStart, openingBracketEnd), node.closingBracket
                ? (0, length_1.$Et)((0, length_1.$vt)(openingBracketEnd, node.child?.length || length_1.$pt), nodeOffsetEnd)
                : undefined, level, levelPerBracket, node, minIndentation));
            nodeOffsetStart = openingBracketEnd;
            if (shouldContinue && node.child) {
                const child = node.child;
                nodeOffsetEnd = (0, length_1.$vt)(nodeOffsetStart, child.length);
                if ((0, length_1.$At)(nodeOffsetStart, endOffset) &&
                    (0, length_1.$Bt)(nodeOffsetEnd, startOffset)) {
                    shouldContinue = collectBracketPairs(child, nodeOffsetStart, nodeOffsetEnd, startOffset, endOffset, context, level + 1, levelPerBracketType);
                    if (!shouldContinue) {
                        return false;
                    }
                }
            }
            levelPerBracketType?.set(node.openingBracket.text, levelPerBracket);
        }
        else {
            let curOffset = nodeOffsetStart;
            for (const child of node.children) {
                const childOffset = curOffset;
                curOffset = (0, length_1.$vt)(curOffset, child.length);
                if ((0, length_1.$At)(childOffset, endOffset) &&
                    (0, length_1.$At)(startOffset, curOffset)) {
                    shouldContinue = collectBracketPairs(child, childOffset, curOffset, startOffset, endOffset, context, level, levelPerBracketType);
                    if (!shouldContinue) {
                        return false;
                    }
                }
            }
        }
        return shouldContinue;
    }
});
//# sourceMappingURL=bracketPairsTree.js.map