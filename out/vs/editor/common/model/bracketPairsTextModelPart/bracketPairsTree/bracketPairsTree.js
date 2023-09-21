/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/textModelBracketPairs", "./beforeEditPositionMapper", "./brackets", "./length", "./parser", "./smallImmutableSet", "./tokenizer", "vs/base/common/arrays", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/combineTextEditInfos"], function (require, exports, event_1, lifecycle_1, textModelBracketPairs_1, beforeEditPositionMapper_1, brackets_1, length_1, parser_1, smallImmutableSet_1, tokenizer_1, arrays_1, combineTextEditInfos_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BracketPairsTree = void 0;
    class BracketPairsTree extends lifecycle_1.Disposable {
        didLanguageChange(languageId) {
            return this.brackets.didLanguageChange(languageId);
        }
        constructor(textModel, getLanguageConfiguration) {
            super();
            this.textModel = textModel;
            this.getLanguageConfiguration = getLanguageConfiguration;
            this.didChangeEmitter = new event_1.Emitter();
            this.denseKeyProvider = new smallImmutableSet_1.DenseKeyProvider();
            this.brackets = new brackets_1.LanguageAgnosticBracketTokens(this.denseKeyProvider, this.getLanguageConfiguration);
            this.onDidChange = this.didChangeEmitter.event;
            this.queuedTextEditsForInitialAstWithoutTokens = [];
            this.queuedTextEdits = [];
            if (!textModel.tokenization.hasTokens) {
                const brackets = this.brackets.getSingleLanguageBracketTokens(this.textModel.getLanguageId());
                const tokenizer = new tokenizer_1.FastTokenizer(this.textModel.getValue(), brackets);
                this.initialAstWithoutTokens = (0, parser_1.parseDocument)(tokenizer, [], undefined, true);
                this.astWithTokens = this.initialAstWithoutTokens;
            }
            else if (textModel.tokenization.backgroundTokenizationState === 2 /* BackgroundTokenizationState.Completed */) {
                // Skip the initial ast, as there is no flickering.
                // Directly create the tree with token information.
                this.initialAstWithoutTokens = undefined;
                this.astWithTokens = this.parseDocumentFromTextBuffer([], undefined, false);
            }
            else {
                // We missed some token changes already, so we cannot use the fast tokenizer + delta increments
                this.initialAstWithoutTokens = this.parseDocumentFromTextBuffer([], undefined, true);
                this.astWithTokens = this.initialAstWithoutTokens;
            }
        }
        //#region TextModel events
        handleDidChangeBackgroundTokenizationState() {
            if (this.textModel.tokenization.backgroundTokenizationState === 2 /* BackgroundTokenizationState.Completed */) {
                const wasUndefined = this.initialAstWithoutTokens === undefined;
                // Clear the initial tree as we can use the tree with token information now.
                this.initialAstWithoutTokens = undefined;
                if (!wasUndefined) {
                    this.didChangeEmitter.fire();
                }
            }
        }
        handleDidChangeTokens({ ranges }) {
            const edits = ranges.map(r => new beforeEditPositionMapper_1.TextEditInfo((0, length_1.toLength)(r.fromLineNumber - 1, 0), (0, length_1.toLength)(r.toLineNumber, 0), (0, length_1.toLength)(r.toLineNumber - r.fromLineNumber + 1, 0)));
            this.handleEdits(edits, true);
            if (!this.initialAstWithoutTokens) {
                this.didChangeEmitter.fire();
            }
        }
        handleContentChanged(change) {
            const edits = beforeEditPositionMapper_1.TextEditInfo.fromModelContentChanges(change.changes);
            this.handleEdits(edits, false);
        }
        handleEdits(edits, tokenChange) {
            // Lazily queue the edits and only apply them when the tree is accessed.
            const result = (0, combineTextEditInfos_1.combineTextEditInfos)(this.queuedTextEdits, edits);
            this.queuedTextEdits = result;
            if (this.initialAstWithoutTokens && !tokenChange) {
                this.queuedTextEditsForInitialAstWithoutTokens = (0, combineTextEditInfos_1.combineTextEditInfos)(this.queuedTextEditsForInitialAstWithoutTokens, edits);
            }
        }
        //#endregion
        flushQueue() {
            if (this.queuedTextEdits.length > 0) {
                this.astWithTokens = this.parseDocumentFromTextBuffer(this.queuedTextEdits, this.astWithTokens, false);
                this.queuedTextEdits = [];
            }
            if (this.queuedTextEditsForInitialAstWithoutTokens.length > 0) {
                if (this.initialAstWithoutTokens) {
                    this.initialAstWithoutTokens = this.parseDocumentFromTextBuffer(this.queuedTextEditsForInitialAstWithoutTokens, this.initialAstWithoutTokens, false);
                }
                this.queuedTextEditsForInitialAstWithoutTokens = [];
            }
        }
        /**
         * @pure (only if isPure = true)
        */
        parseDocumentFromTextBuffer(edits, previousAst, immutable) {
            // Is much faster if `isPure = false`.
            const isPure = false;
            const previousAstClone = isPure ? previousAst?.deepClone() : previousAst;
            const tokenizer = new tokenizer_1.TextBufferTokenizer(this.textModel, this.brackets);
            const result = (0, parser_1.parseDocument)(tokenizer, edits, previousAstClone, immutable);
            return result;
        }
        getBracketsInRange(range, onlyColorizedBrackets) {
            this.flushQueue();
            const startOffset = (0, length_1.toLength)(range.startLineNumber - 1, range.startColumn - 1);
            const endOffset = (0, length_1.toLength)(range.endLineNumber - 1, range.endColumn - 1);
            return new arrays_1.CallbackIterable(cb => {
                const node = this.initialAstWithoutTokens || this.astWithTokens;
                collectBrackets(node, length_1.lengthZero, node.length, startOffset, endOffset, cb, 0, 0, new Map(), onlyColorizedBrackets);
            });
        }
        getBracketPairsInRange(range, includeMinIndentation) {
            this.flushQueue();
            const startLength = (0, length_1.positionToLength)(range.getStartPosition());
            const endLength = (0, length_1.positionToLength)(range.getEndPosition());
            return new arrays_1.CallbackIterable(cb => {
                const node = this.initialAstWithoutTokens || this.astWithTokens;
                const context = new CollectBracketPairsContext(cb, includeMinIndentation, this.textModel);
                collectBracketPairs(node, length_1.lengthZero, node.length, startLength, endLength, context, 0, new Map());
            });
        }
        getFirstBracketAfter(position) {
            this.flushQueue();
            const node = this.initialAstWithoutTokens || this.astWithTokens;
            return getFirstBracketAfter(node, length_1.lengthZero, node.length, (0, length_1.positionToLength)(position));
        }
        getFirstBracketBefore(position) {
            this.flushQueue();
            const node = this.initialAstWithoutTokens || this.astWithTokens;
            return getFirstBracketBefore(node, length_1.lengthZero, node.length, (0, length_1.positionToLength)(position));
        }
    }
    exports.BracketPairsTree = BracketPairsTree;
    function getFirstBracketBefore(node, nodeOffsetStart, nodeOffsetEnd, position) {
        if (node.kind === 4 /* AstNodeKind.List */ || node.kind === 2 /* AstNodeKind.Pair */) {
            const lengths = [];
            for (const child of node.children) {
                nodeOffsetEnd = (0, length_1.lengthAdd)(nodeOffsetStart, child.length);
                lengths.push({ nodeOffsetStart, nodeOffsetEnd });
                nodeOffsetStart = nodeOffsetEnd;
            }
            for (let i = lengths.length - 1; i >= 0; i--) {
                const { nodeOffsetStart, nodeOffsetEnd } = lengths[i];
                if ((0, length_1.lengthLessThan)(nodeOffsetStart, position)) {
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
            const range = (0, length_1.lengthsToRange)(nodeOffsetStart, nodeOffsetEnd);
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
                nodeOffsetEnd = (0, length_1.lengthAdd)(nodeOffsetStart, child.length);
                if ((0, length_1.lengthLessThan)(position, nodeOffsetEnd)) {
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
            const range = (0, length_1.lengthsToRange)(nodeOffsetStart, nodeOffsetEnd);
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
                        nodeOffsetEnd = (0, length_1.lengthAdd)(nodeOffsetStart, child.length);
                        if ((0, length_1.lengthLessThanEqual)(nodeOffsetStart, endOffset) &&
                            (0, length_1.lengthGreaterThanEqual)(nodeOffsetEnd, startOffset)) {
                            const childEndsAfterEnd = (0, length_1.lengthGreaterThanEqual)(nodeOffsetEnd, endOffset);
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
                        nodeOffsetEnd = (0, length_1.lengthAdd)(nodeOffsetStart, child.length);
                        if ((0, length_1.lengthLessThanEqual)(nodeOffsetStart, endOffset) &&
                            (0, length_1.lengthGreaterThanEqual)(nodeOffsetEnd, startOffset)) {
                            const childEndsAfterEnd = (0, length_1.lengthGreaterThanEqual)(nodeOffsetEnd, endOffset);
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
                    const range = (0, length_1.lengthsToRange)(nodeOffsetStart, nodeOffsetEnd);
                    return push(new textModelBracketPairs_1.BracketInfo(range, level - 1, 0, true));
                }
                case 1 /* AstNodeKind.Bracket */: {
                    const range = (0, length_1.lengthsToRange)(nodeOffsetStart, nodeOffsetEnd);
                    return push(new textModelBracketPairs_1.BracketInfo(range, level - 1, nestingLevelOfEqualBracketType - 1, parentPairIsIncomplete));
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
            const openingBracketEnd = (0, length_1.lengthAdd)(nodeOffsetStart, node.openingBracket.length);
            let minIndentation = -1;
            if (context.includeMinIndentation) {
                minIndentation = node.computeMinIndentation(nodeOffsetStart, context.textModel);
            }
            shouldContinue = context.push(new textModelBracketPairs_1.BracketPairWithMinIndentationInfo((0, length_1.lengthsToRange)(nodeOffsetStart, nodeOffsetEnd), (0, length_1.lengthsToRange)(nodeOffsetStart, openingBracketEnd), node.closingBracket
                ? (0, length_1.lengthsToRange)((0, length_1.lengthAdd)(openingBracketEnd, node.child?.length || length_1.lengthZero), nodeOffsetEnd)
                : undefined, level, levelPerBracket, node, minIndentation));
            nodeOffsetStart = openingBracketEnd;
            if (shouldContinue && node.child) {
                const child = node.child;
                nodeOffsetEnd = (0, length_1.lengthAdd)(nodeOffsetStart, child.length);
                if ((0, length_1.lengthLessThanEqual)(nodeOffsetStart, endOffset) &&
                    (0, length_1.lengthGreaterThanEqual)(nodeOffsetEnd, startOffset)) {
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
                curOffset = (0, length_1.lengthAdd)(curOffset, child.length);
                if ((0, length_1.lengthLessThanEqual)(childOffset, endOffset) &&
                    (0, length_1.lengthLessThanEqual)(startOffset, curOffset)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJhY2tldFBhaXJzVHJlZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vbW9kZWwvYnJhY2tldFBhaXJzVGV4dE1vZGVsUGFydC9icmFja2V0UGFpcnNUcmVlL2JyYWNrZXRQYWlyc1RyZWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBdUJoRyxNQUFhLGdCQUFpQixTQUFRLHNCQUFVO1FBa0J4QyxpQkFBaUIsQ0FBQyxVQUFrQjtZQUMxQyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDcEQsQ0FBQztRQU1ELFlBQ2tCLFNBQW9CLEVBQ3BCLHdCQUErRTtZQUVoRyxLQUFLLEVBQUUsQ0FBQztZQUhTLGNBQVMsR0FBVCxTQUFTLENBQVc7WUFDcEIsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUF1RDtZQTNCaEYscUJBQWdCLEdBQUcsSUFBSSxlQUFPLEVBQVEsQ0FBQztZQWN2QyxxQkFBZ0IsR0FBRyxJQUFJLG9DQUFnQixFQUFVLENBQUM7WUFDbEQsYUFBUSxHQUFHLElBQUksd0NBQTZCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1lBTXBHLGdCQUFXLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQztZQUNsRCw4Q0FBeUMsR0FBbUIsRUFBRSxDQUFDO1lBQy9ELG9CQUFlLEdBQW1CLEVBQUUsQ0FBQztZQVE1QyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUU7Z0JBQ3RDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO2dCQUM5RixNQUFNLFNBQVMsR0FBRyxJQUFJLHlCQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDekUsSUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUEsc0JBQWEsRUFBQyxTQUFTLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDN0UsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUM7YUFDbEQ7aUJBQU0sSUFBSSxTQUFTLENBQUMsWUFBWSxDQUFDLDJCQUEyQixrREFBMEMsRUFBRTtnQkFDeEcsbURBQW1EO2dCQUNuRCxtREFBbUQ7Z0JBQ25ELElBQUksQ0FBQyx1QkFBdUIsR0FBRyxTQUFTLENBQUM7Z0JBQ3pDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLDJCQUEyQixDQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDNUU7aUJBQU07Z0JBQ04sK0ZBQStGO2dCQUMvRixJQUFJLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFDLDJCQUEyQixDQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3JGLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDO2FBQ2xEO1FBQ0YsQ0FBQztRQUVELDBCQUEwQjtRQUVuQiwwQ0FBMEM7WUFDaEQsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQywyQkFBMkIsa0RBQTBDLEVBQUU7Z0JBQ3RHLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyx1QkFBdUIsS0FBSyxTQUFTLENBQUM7Z0JBQ2hFLDRFQUE0RTtnQkFDNUUsSUFBSSxDQUFDLHVCQUF1QixHQUFHLFNBQVMsQ0FBQztnQkFDekMsSUFBSSxDQUFDLFlBQVksRUFBRTtvQkFDbEIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxDQUFDO2lCQUM3QjthQUNEO1FBQ0YsQ0FBQztRQUVNLHFCQUFxQixDQUFDLEVBQUUsTUFBTSxFQUE0QjtZQUNoRSxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQzVCLElBQUksdUNBQVksQ0FDZixJQUFBLGlCQUFRLEVBQUMsQ0FBQyxDQUFDLGNBQWMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ2pDLElBQUEsaUJBQVEsRUFBQyxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxFQUMzQixJQUFBLGlCQUFRLEVBQUMsQ0FBQyxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsY0FBYyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDbEQsQ0FDRCxDQUFDO1lBRUYsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFOUIsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsRUFBRTtnQkFDbEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxDQUFDO2FBQzdCO1FBQ0YsQ0FBQztRQUVNLG9CQUFvQixDQUFDLE1BQWlDO1lBQzVELE1BQU0sS0FBSyxHQUFHLHVDQUFZLENBQUMsdUJBQXVCLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ25FLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2hDLENBQUM7UUFFTyxXQUFXLENBQUMsS0FBcUIsRUFBRSxXQUFvQjtZQUM5RCx3RUFBd0U7WUFDeEUsTUFBTSxNQUFNLEdBQUcsSUFBQSwyQ0FBb0IsRUFBQyxJQUFJLENBQUMsZUFBZSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRWpFLElBQUksQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDO1lBQzlCLElBQUksSUFBSSxDQUFDLHVCQUF1QixJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNqRCxJQUFJLENBQUMseUNBQXlDLEdBQUcsSUFBQSwyQ0FBb0IsRUFBQyxJQUFJLENBQUMseUNBQXlDLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDN0g7UUFDRixDQUFDO1FBRUQsWUFBWTtRQUVKLFVBQVU7WUFDakIsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3BDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLDJCQUEyQixDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDdkcsSUFBSSxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUM7YUFDMUI7WUFDRCxJQUFJLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUM5RCxJQUFJLElBQUksQ0FBQyx1QkFBdUIsRUFBRTtvQkFDakMsSUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxJQUFJLENBQUMseUNBQXlDLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixFQUFFLEtBQUssQ0FBQyxDQUFDO2lCQUNySjtnQkFDRCxJQUFJLENBQUMseUNBQXlDLEdBQUcsRUFBRSxDQUFDO2FBQ3BEO1FBQ0YsQ0FBQztRQUVEOztVQUVFO1FBQ00sMkJBQTJCLENBQUMsS0FBcUIsRUFBRSxXQUFnQyxFQUFFLFNBQWtCO1lBQzlHLHNDQUFzQztZQUN0QyxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFDckIsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO1lBQ3pFLE1BQU0sU0FBUyxHQUFHLElBQUksK0JBQW1CLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDekUsTUFBTSxNQUFNLEdBQUcsSUFBQSxzQkFBYSxFQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDNUUsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRU0sa0JBQWtCLENBQUMsS0FBWSxFQUFFLHFCQUE4QjtZQUNyRSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFFbEIsTUFBTSxXQUFXLEdBQUcsSUFBQSxpQkFBUSxFQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0UsTUFBTSxTQUFTLEdBQUcsSUFBQSxpQkFBUSxFQUFDLEtBQUssQ0FBQyxhQUFhLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDekUsT0FBTyxJQUFJLHlCQUFnQixDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUNoQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsdUJBQXVCLElBQUksSUFBSSxDQUFDLGFBQWMsQ0FBQztnQkFDakUsZUFBZSxDQUFDLElBQUksRUFBRSxtQkFBVSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEdBQUcsRUFBRSxFQUFFLHFCQUFxQixDQUFDLENBQUM7WUFDcEgsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU0sc0JBQXNCLENBQUMsS0FBWSxFQUFFLHFCQUE4QjtZQUN6RSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFFbEIsTUFBTSxXQUFXLEdBQUcsSUFBQSx5QkFBZ0IsRUFBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO1lBQy9ELE1BQU0sU0FBUyxHQUFHLElBQUEseUJBQWdCLEVBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7WUFFM0QsT0FBTyxJQUFJLHlCQUFnQixDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUNoQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsdUJBQXVCLElBQUksSUFBSSxDQUFDLGFBQWMsQ0FBQztnQkFDakUsTUFBTSxPQUFPLEdBQUcsSUFBSSwwQkFBMEIsQ0FBQyxFQUFFLEVBQUUscUJBQXFCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUMxRixtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsbUJBQVUsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDbkcsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU0sb0JBQW9CLENBQUMsUUFBa0I7WUFDN0MsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBRWxCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyx1QkFBdUIsSUFBSSxJQUFJLENBQUMsYUFBYyxDQUFDO1lBQ2pFLE9BQU8sb0JBQW9CLENBQUMsSUFBSSxFQUFFLG1CQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFBLHlCQUFnQixFQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDeEYsQ0FBQztRQUVNLHFCQUFxQixDQUFDLFFBQWtCO1lBQzlDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUVsQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsdUJBQXVCLElBQUksSUFBSSxDQUFDLGFBQWMsQ0FBQztZQUNqRSxPQUFPLHFCQUFxQixDQUFDLElBQUksRUFBRSxtQkFBVSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBQSx5QkFBZ0IsRUFBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3pGLENBQUM7S0FDRDtJQTdKRCw0Q0E2SkM7SUFFRCxTQUFTLHFCQUFxQixDQUFDLElBQWEsRUFBRSxlQUF1QixFQUFFLGFBQXFCLEVBQUUsUUFBZ0I7UUFDN0csSUFBSSxJQUFJLENBQUMsSUFBSSw2QkFBcUIsSUFBSSxJQUFJLENBQUMsSUFBSSw2QkFBcUIsRUFBRTtZQUNyRSxNQUFNLE9BQU8sR0FBeUQsRUFBRSxDQUFDO1lBQ3pFLEtBQUssTUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDbEMsYUFBYSxHQUFHLElBQUEsa0JBQVMsRUFBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN6RCxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUM7Z0JBQ2pELGVBQWUsR0FBRyxhQUFhLENBQUM7YUFDaEM7WUFDRCxLQUFLLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzdDLE1BQU0sRUFBRSxlQUFlLEVBQUUsYUFBYSxFQUFFLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0RCxJQUFJLElBQUEsdUJBQWMsRUFBQyxlQUFlLEVBQUUsUUFBUSxDQUFDLEVBQUU7b0JBQzlDLE1BQU0sTUFBTSxHQUFHLHFCQUFxQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQztvQkFDakcsSUFBSSxNQUFNLEVBQUU7d0JBQ1gsT0FBTyxNQUFNLENBQUM7cUJBQ2Q7aUJBQ0Q7YUFDRDtZQUNELE9BQU8sSUFBSSxDQUFDO1NBQ1o7YUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLGlEQUF5QyxFQUFFO1lBQzlELE9BQU8sSUFBSSxDQUFDO1NBQ1o7YUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLGdDQUF3QixFQUFFO1lBQzdDLE1BQU0sS0FBSyxHQUFHLElBQUEsdUJBQWMsRUFBQyxlQUFlLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDN0QsT0FBTztnQkFDTixXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7Z0JBQzdCLEtBQUs7YUFDTCxDQUFDO1NBQ0Y7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRCxTQUFTLG9CQUFvQixDQUFDLElBQWEsRUFBRSxlQUF1QixFQUFFLGFBQXFCLEVBQUUsUUFBZ0I7UUFDNUcsSUFBSSxJQUFJLENBQUMsSUFBSSw2QkFBcUIsSUFBSSxJQUFJLENBQUMsSUFBSSw2QkFBcUIsRUFBRTtZQUNyRSxLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2xDLGFBQWEsR0FBRyxJQUFBLGtCQUFTLEVBQUMsZUFBZSxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDekQsSUFBSSxJQUFBLHVCQUFjLEVBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxFQUFFO29CQUM1QyxNQUFNLE1BQU0sR0FBRyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQztvQkFDckYsSUFBSSxNQUFNLEVBQUU7d0JBQ1gsT0FBTyxNQUFNLENBQUM7cUJBQ2Q7aUJBQ0Q7Z0JBQ0QsZUFBZSxHQUFHLGFBQWEsQ0FBQzthQUNoQztZQUNELE9BQU8sSUFBSSxDQUFDO1NBQ1o7YUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLGlEQUF5QyxFQUFFO1lBQzlELE9BQU8sSUFBSSxDQUFDO1NBQ1o7YUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLGdDQUF3QixFQUFFO1lBQzdDLE1BQU0sS0FBSyxHQUFHLElBQUEsdUJBQWMsRUFBQyxlQUFlLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDN0QsT0FBTztnQkFDTixXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7Z0JBQzdCLEtBQUs7YUFDTCxDQUFDO1NBQ0Y7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRCxTQUFTLGVBQWUsQ0FDdkIsSUFBYSxFQUNiLGVBQXVCLEVBQ3ZCLGFBQXFCLEVBQ3JCLFdBQW1CLEVBQ25CLFNBQWlCLEVBQ2pCLElBQW9DLEVBQ3BDLEtBQWEsRUFDYiw4QkFBc0MsRUFDdEMsbUJBQXdDLEVBQ3hDLHFCQUE4QixFQUM5Qix5QkFBa0MsS0FBSztRQUV2QyxJQUFJLEtBQUssR0FBRyxHQUFHLEVBQUU7WUFDaEIsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUVELFNBQVMsRUFDVCxPQUFPLElBQUksRUFBRTtZQUNaLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDbEIsNkJBQXFCLENBQUMsQ0FBQztvQkFDdEIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztvQkFDdkMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsRUFBRSxDQUFDLEVBQUUsRUFBRTt3QkFDcEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDL0IsSUFBSSxDQUFDLEtBQUssRUFBRTs0QkFDWCxTQUFTO3lCQUNUO3dCQUNELGFBQWEsR0FBRyxJQUFBLGtCQUFTLEVBQUMsZUFBZSxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDekQsSUFDQyxJQUFBLDRCQUFtQixFQUFDLGVBQWUsRUFBRSxTQUFTLENBQUM7NEJBQy9DLElBQUEsK0JBQXNCLEVBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxFQUNqRDs0QkFDRCxNQUFNLGlCQUFpQixHQUFHLElBQUEsK0JBQXNCLEVBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDOzRCQUMzRSxJQUFJLGlCQUFpQixFQUFFO2dDQUN0QixtRUFBbUU7Z0NBQ25FLElBQUksR0FBRyxLQUFLLENBQUM7Z0NBQ2IsU0FBUyxTQUFTLENBQUM7NkJBQ25COzRCQUVELE1BQU0sY0FBYyxHQUFHLGVBQWUsQ0FBQyxLQUFLLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLG1CQUFtQixFQUFFLHFCQUFxQixDQUFDLENBQUM7NEJBQ2xLLElBQUksQ0FBQyxjQUFjLEVBQUU7Z0NBQ3BCLE9BQU8sS0FBSyxDQUFDOzZCQUNiO3lCQUNEO3dCQUNELGVBQWUsR0FBRyxhQUFhLENBQUM7cUJBQ2hDO29CQUNELE9BQU8sSUFBSSxDQUFDO2lCQUNaO2dCQUNELDZCQUFxQixDQUFDLENBQUM7b0JBQ3RCLE1BQU0sUUFBUSxHQUFHLENBQUMscUJBQXFCLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxJQUFLLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBa0MsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFpQyxDQUFDLENBQUM7b0JBRWxNLElBQUksZUFBZSxHQUFHLENBQUMsQ0FBQztvQkFDeEIsSUFBSSxtQkFBbUIsRUFBRTt3QkFDeEIsSUFBSSxRQUFRLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ2pFLElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTs0QkFDM0IsUUFBUSxHQUFHLENBQUMsQ0FBQzt5QkFDYjt3QkFDRCxlQUFlLEdBQUcsUUFBUSxDQUFDO3dCQUMzQixJQUFJLFFBQVEsRUFBRTs0QkFDYixRQUFRLEVBQUUsQ0FBQzs0QkFDWCxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7eUJBQzVEO3FCQUNEO29CQUVELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7b0JBQ3ZDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLEVBQUUsQ0FBQyxFQUFFLEVBQUU7d0JBQ3BDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQy9CLElBQUksQ0FBQyxLQUFLLEVBQUU7NEJBQ1gsU0FBUzt5QkFDVDt3QkFDRCxhQUFhLEdBQUcsSUFBQSxrQkFBUyxFQUFDLGVBQWUsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQ3pELElBQ0MsSUFBQSw0QkFBbUIsRUFBQyxlQUFlLEVBQUUsU0FBUyxDQUFDOzRCQUMvQyxJQUFBLCtCQUFzQixFQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsRUFDakQ7NEJBQ0QsTUFBTSxpQkFBaUIsR0FBRyxJQUFBLCtCQUFzQixFQUFDLGFBQWEsRUFBRSxTQUFTLENBQUMsQ0FBQzs0QkFDM0UsSUFBSSxpQkFBaUIsSUFBSSxLQUFLLENBQUMsSUFBSSxnQ0FBd0IsRUFBRTtnQ0FDNUQsbUVBQW1FO2dDQUNuRSxtRUFBbUU7Z0NBQ25FLElBQUksR0FBRyxLQUFLLENBQUM7Z0NBQ2IsSUFBSSxRQUFRLEVBQUU7b0NBQ2IsS0FBSyxFQUFFLENBQUM7b0NBQ1IsOEJBQThCLEdBQUcsZUFBZSxHQUFHLENBQUMsQ0FBQztpQ0FDckQ7cUNBQU07b0NBQ04sOEJBQThCLEdBQUcsZUFBZSxDQUFDO2lDQUNqRDtnQ0FDRCxTQUFTLFNBQVMsQ0FBQzs2QkFDbkI7NEJBRUQsSUFBSSxRQUFRLElBQUksS0FBSyxDQUFDLElBQUksZ0NBQXdCLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFO2dDQUMzRSxNQUFNLGNBQWMsR0FBRyxlQUFlLENBQ3JDLEtBQUssRUFDTCxlQUFlLEVBQ2YsYUFBYSxFQUNiLFdBQVcsRUFDWCxTQUFTLEVBQ1QsSUFBSSxFQUNKLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUM1QixRQUFRLENBQUMsQ0FBQyxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFDaEQsbUJBQW1CLEVBQ25CLHFCQUFxQixFQUNyQixDQUFDLElBQUksQ0FBQyxjQUFjLENBQ3BCLENBQUM7Z0NBQ0YsSUFBSSxDQUFDLGNBQWMsRUFBRTtvQ0FDcEIsT0FBTyxLQUFLLENBQUM7aUNBQ2I7NkJBQ0Q7eUJBQ0Q7d0JBQ0QsZUFBZSxHQUFHLGFBQWEsQ0FBQztxQkFDaEM7b0JBRUQsbUJBQW1CLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxDQUFDO29CQUVwRSxPQUFPLElBQUksQ0FBQztpQkFDWjtnQkFDRCxpREFBeUMsQ0FBQyxDQUFDO29CQUMxQyxNQUFNLEtBQUssR0FBRyxJQUFBLHVCQUFjLEVBQUMsZUFBZSxFQUFFLGFBQWEsQ0FBQyxDQUFDO29CQUM3RCxPQUFPLElBQUksQ0FBQyxJQUFJLG1DQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7aUJBQ3hEO2dCQUNELGdDQUF3QixDQUFDLENBQUM7b0JBQ3pCLE1BQU0sS0FBSyxHQUFHLElBQUEsdUJBQWMsRUFBQyxlQUFlLEVBQUUsYUFBYSxDQUFDLENBQUM7b0JBQzdELE9BQU8sSUFBSSxDQUFDLElBQUksbUNBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxHQUFHLENBQUMsRUFBRSw4QkFBOEIsR0FBRyxDQUFDLEVBQUUsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO2lCQUMzRztnQkFDRDtvQkFDQyxPQUFPLElBQUksQ0FBQzthQUNiO1NBQ0Q7SUFDRixDQUFDO0lBRUQsTUFBTSwwQkFBMEI7UUFDL0IsWUFDaUIsSUFBMEQsRUFDMUQscUJBQThCLEVBQzlCLFNBQXFCO1lBRnJCLFNBQUksR0FBSixJQUFJLENBQXNEO1lBQzFELDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBUztZQUM5QixjQUFTLEdBQVQsU0FBUyxDQUFZO1FBRXRDLENBQUM7S0FDRDtJQUVELFNBQVMsbUJBQW1CLENBQzNCLElBQWEsRUFDYixlQUF1QixFQUN2QixhQUFxQixFQUNyQixXQUFtQixFQUNuQixTQUFpQixFQUNqQixPQUFtQyxFQUNuQyxLQUFhLEVBQ2IsbUJBQXdDO1FBRXhDLElBQUksS0FBSyxHQUFHLEdBQUcsRUFBRTtZQUNoQixPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDO1FBRTFCLElBQUksSUFBSSxDQUFDLElBQUksNkJBQXFCLEVBQUU7WUFDbkMsSUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLElBQUksbUJBQW1CLEVBQUU7Z0JBQ3hCLElBQUksUUFBUSxHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNqRSxJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7b0JBQzNCLFFBQVEsR0FBRyxDQUFDLENBQUM7aUJBQ2I7Z0JBQ0QsZUFBZSxHQUFHLFFBQVEsQ0FBQztnQkFDM0IsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsbUJBQW1CLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQzVEO1lBRUQsTUFBTSxpQkFBaUIsR0FBRyxJQUFBLGtCQUFTLEVBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakYsSUFBSSxjQUFjLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDeEIsSUFBSSxPQUFPLENBQUMscUJBQXFCLEVBQUU7Z0JBQ2xDLGNBQWMsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQzFDLGVBQWUsRUFDZixPQUFPLENBQUMsU0FBUyxDQUNqQixDQUFDO2FBQ0Y7WUFFRCxjQUFjLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FDNUIsSUFBSSx5REFBaUMsQ0FDcEMsSUFBQSx1QkFBYyxFQUFDLGVBQWUsRUFBRSxhQUFhLENBQUMsRUFDOUMsSUFBQSx1QkFBYyxFQUFDLGVBQWUsRUFBRSxpQkFBaUIsQ0FBQyxFQUNsRCxJQUFJLENBQUMsY0FBYztnQkFDbEIsQ0FBQyxDQUFDLElBQUEsdUJBQWMsRUFDZixJQUFBLGtCQUFTLEVBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLElBQUksbUJBQVUsQ0FBQyxFQUM5RCxhQUFhLENBQ2I7Z0JBQ0QsQ0FBQyxDQUFDLFNBQVMsRUFDWixLQUFLLEVBQ0wsZUFBZSxFQUNmLElBQUksRUFDSixjQUFjLENBQ2QsQ0FDRCxDQUFDO1lBRUYsZUFBZSxHQUFHLGlCQUFpQixDQUFDO1lBQ3BDLElBQUksY0FBYyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ2pDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQ3pCLGFBQWEsR0FBRyxJQUFBLGtCQUFTLEVBQUMsZUFBZSxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDekQsSUFDQyxJQUFBLDRCQUFtQixFQUFDLGVBQWUsRUFBRSxTQUFTLENBQUM7b0JBQy9DLElBQUEsK0JBQXNCLEVBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxFQUNqRDtvQkFDRCxjQUFjLEdBQUcsbUJBQW1CLENBQ25DLEtBQUssRUFDTCxlQUFlLEVBQ2YsYUFBYSxFQUNiLFdBQVcsRUFDWCxTQUFTLEVBQ1QsT0FBTyxFQUNQLEtBQUssR0FBRyxDQUFDLEVBQ1QsbUJBQW1CLENBQ25CLENBQUM7b0JBQ0YsSUFBSSxDQUFDLGNBQWMsRUFBRTt3QkFDcEIsT0FBTyxLQUFLLENBQUM7cUJBQ2I7aUJBQ0Q7YUFDRDtZQUVELG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxlQUFlLENBQUMsQ0FBQztTQUNwRTthQUFNO1lBQ04sSUFBSSxTQUFTLEdBQUcsZUFBZSxDQUFDO1lBQ2hDLEtBQUssTUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDbEMsTUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDO2dCQUM5QixTQUFTLEdBQUcsSUFBQSxrQkFBUyxFQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRS9DLElBQ0MsSUFBQSw0QkFBbUIsRUFBQyxXQUFXLEVBQUUsU0FBUyxDQUFDO29CQUMzQyxJQUFBLDRCQUFtQixFQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsRUFDMUM7b0JBQ0QsY0FBYyxHQUFHLG1CQUFtQixDQUNuQyxLQUFLLEVBQ0wsV0FBVyxFQUNYLFNBQVMsRUFDVCxXQUFXLEVBQ1gsU0FBUyxFQUNULE9BQU8sRUFDUCxLQUFLLEVBQ0wsbUJBQW1CLENBQ25CLENBQUM7b0JBQ0YsSUFBSSxDQUFDLGNBQWMsRUFBRTt3QkFDcEIsT0FBTyxLQUFLLENBQUM7cUJBQ2I7aUJBQ0Q7YUFDRDtTQUNEO1FBQ0QsT0FBTyxjQUFjLENBQUM7SUFDdkIsQ0FBQyJ9