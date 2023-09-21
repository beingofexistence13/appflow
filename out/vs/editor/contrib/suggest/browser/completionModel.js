/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/filters", "vs/base/common/strings"], function (require, exports, arrays_1, filters_1, strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CompletionModel = exports.LineContext = void 0;
    class LineContext {
        constructor(leadingLineContent, characterCountDelta) {
            this.leadingLineContent = leadingLineContent;
            this.characterCountDelta = characterCountDelta;
        }
    }
    exports.LineContext = LineContext;
    var Refilter;
    (function (Refilter) {
        Refilter[Refilter["Nothing"] = 0] = "Nothing";
        Refilter[Refilter["All"] = 1] = "All";
        Refilter[Refilter["Incr"] = 2] = "Incr";
    })(Refilter || (Refilter = {}));
    /**
     * Sorted, filtered completion view model
     * */
    class CompletionModel {
        constructor(items, column, lineContext, wordDistance, options, snippetSuggestions, fuzzyScoreOptions = filters_1.FuzzyScoreOptions.default, clipboardText = undefined) {
            this.clipboardText = clipboardText;
            this._snippetCompareFn = CompletionModel._compareCompletionItems;
            this._items = items;
            this._column = column;
            this._wordDistance = wordDistance;
            this._options = options;
            this._refilterKind = 1 /* Refilter.All */;
            this._lineContext = lineContext;
            this._fuzzyScoreOptions = fuzzyScoreOptions;
            if (snippetSuggestions === 'top') {
                this._snippetCompareFn = CompletionModel._compareCompletionItemsSnippetsUp;
            }
            else if (snippetSuggestions === 'bottom') {
                this._snippetCompareFn = CompletionModel._compareCompletionItemsSnippetsDown;
            }
        }
        get lineContext() {
            return this._lineContext;
        }
        set lineContext(value) {
            if (this._lineContext.leadingLineContent !== value.leadingLineContent
                || this._lineContext.characterCountDelta !== value.characterCountDelta) {
                this._refilterKind = this._lineContext.characterCountDelta < value.characterCountDelta && this._filteredItems ? 2 /* Refilter.Incr */ : 1 /* Refilter.All */;
                this._lineContext = value;
            }
        }
        get items() {
            this._ensureCachedState();
            return this._filteredItems;
        }
        getItemsByProvider() {
            this._ensureCachedState();
            return this._itemsByProvider;
        }
        getIncompleteProvider() {
            this._ensureCachedState();
            const result = new Set();
            for (const [provider, items] of this.getItemsByProvider()) {
                if (items.length > 0 && items[0].container.incomplete) {
                    result.add(provider);
                }
            }
            return result;
        }
        get stats() {
            this._ensureCachedState();
            return this._stats;
        }
        _ensureCachedState() {
            if (this._refilterKind !== 0 /* Refilter.Nothing */) {
                this._createCachedState();
            }
        }
        _createCachedState() {
            this._itemsByProvider = new Map();
            const labelLengths = [];
            const { leadingLineContent, characterCountDelta } = this._lineContext;
            let word = '';
            let wordLow = '';
            // incrementally filter less
            const source = this._refilterKind === 1 /* Refilter.All */ ? this._items : this._filteredItems;
            const target = [];
            // picks a score function based on the number of
            // items that we have to score/filter and based on the
            // user-configuration
            const scoreFn = (!this._options.filterGraceful || source.length > 2000) ? filters_1.fuzzyScore : filters_1.fuzzyScoreGracefulAggressive;
            for (let i = 0; i < source.length; i++) {
                const item = source[i];
                if (item.isInvalid) {
                    continue; // SKIP invalid items
                }
                // keep all items by their provider
                const arr = this._itemsByProvider.get(item.provider);
                if (arr) {
                    arr.push(item);
                }
                else {
                    this._itemsByProvider.set(item.provider, [item]);
                }
                // 'word' is that remainder of the current line that we
                // filter and score against. In theory each suggestion uses a
                // different word, but in practice not - that's why we cache
                const overwriteBefore = item.position.column - item.editStart.column;
                const wordLen = overwriteBefore + characterCountDelta - (item.position.column - this._column);
                if (word.length !== wordLen) {
                    word = wordLen === 0 ? '' : leadingLineContent.slice(-wordLen);
                    wordLow = word.toLowerCase();
                }
                // remember the word against which this item was
                // scored
                item.word = word;
                if (wordLen === 0) {
                    // when there is nothing to score against, don't
                    // event try to do. Use a const rank and rely on
                    // the fallback-sort using the initial sort order.
                    // use a score of `-100` because that is out of the
                    // bound of values `fuzzyScore` will return
                    item.score = filters_1.FuzzyScore.Default;
                }
                else {
                    // skip word characters that are whitespace until
                    // we have hit the replace range (overwriteBefore)
                    let wordPos = 0;
                    while (wordPos < overwriteBefore) {
                        const ch = word.charCodeAt(wordPos);
                        if (ch === 32 /* CharCode.Space */ || ch === 9 /* CharCode.Tab */) {
                            wordPos += 1;
                        }
                        else {
                            break;
                        }
                    }
                    if (wordPos >= wordLen) {
                        // the wordPos at which scoring starts is the whole word
                        // and therefore the same rules as not having a word apply
                        item.score = filters_1.FuzzyScore.Default;
                    }
                    else if (typeof item.completion.filterText === 'string') {
                        // when there is a `filterText` it must match the `word`.
                        // if it matches we check with the label to compute highlights
                        // and if that doesn't yield a result we have no highlights,
                        // despite having the match
                        const match = scoreFn(word, wordLow, wordPos, item.completion.filterText, item.filterTextLow, 0, this._fuzzyScoreOptions);
                        if (!match) {
                            continue; // NO match
                        }
                        if ((0, strings_1.compareIgnoreCase)(item.completion.filterText, item.textLabel) === 0) {
                            // filterText and label are actually the same -> use good highlights
                            item.score = match;
                        }
                        else {
                            // re-run the scorer on the label in the hope of a result BUT use the rank
                            // of the filterText-match
                            item.score = (0, filters_1.anyScore)(word, wordLow, wordPos, item.textLabel, item.labelLow, 0);
                            item.score[0] = match[0]; // use score from filterText
                        }
                    }
                    else {
                        // by default match `word` against the `label`
                        const match = scoreFn(word, wordLow, wordPos, item.textLabel, item.labelLow, 0, this._fuzzyScoreOptions);
                        if (!match) {
                            continue; // NO match
                        }
                        item.score = match;
                    }
                }
                item.idx = i;
                item.distance = this._wordDistance.distance(item.position, item.completion);
                target.push(item);
                // update stats
                labelLengths.push(item.textLabel.length);
            }
            this._filteredItems = target.sort(this._snippetCompareFn);
            this._refilterKind = 0 /* Refilter.Nothing */;
            this._stats = {
                pLabelLen: labelLengths.length ?
                    (0, arrays_1.quickSelect)(labelLengths.length - .85, labelLengths, (a, b) => a - b)
                    : 0
            };
        }
        static _compareCompletionItems(a, b) {
            if (a.score[0] > b.score[0]) {
                return -1;
            }
            else if (a.score[0] < b.score[0]) {
                return 1;
            }
            else if (a.distance < b.distance) {
                return -1;
            }
            else if (a.distance > b.distance) {
                return 1;
            }
            else if (a.idx < b.idx) {
                return -1;
            }
            else if (a.idx > b.idx) {
                return 1;
            }
            else {
                return 0;
            }
        }
        static _compareCompletionItemsSnippetsDown(a, b) {
            if (a.completion.kind !== b.completion.kind) {
                if (a.completion.kind === 27 /* CompletionItemKind.Snippet */) {
                    return 1;
                }
                else if (b.completion.kind === 27 /* CompletionItemKind.Snippet */) {
                    return -1;
                }
            }
            return CompletionModel._compareCompletionItems(a, b);
        }
        static _compareCompletionItemsSnippetsUp(a, b) {
            if (a.completion.kind !== b.completion.kind) {
                if (a.completion.kind === 27 /* CompletionItemKind.Snippet */) {
                    return -1;
                }
                else if (b.completion.kind === 27 /* CompletionItemKind.Snippet */) {
                    return 1;
                }
            }
            return CompletionModel._compareCompletionItems(a, b);
        }
    }
    exports.CompletionModel = CompletionModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGxldGlvbk1vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvc3VnZ2VzdC9icm93c2VyL2NvbXBsZXRpb25Nb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFpQmhHLE1BQWEsV0FBVztRQUN2QixZQUNVLGtCQUEwQixFQUMxQixtQkFBMkI7WUFEM0IsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFRO1lBQzFCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBUTtRQUNqQyxDQUFDO0tBQ0w7SUFMRCxrQ0FLQztJQUVELElBQVcsUUFJVjtJQUpELFdBQVcsUUFBUTtRQUNsQiw2Q0FBVyxDQUFBO1FBQ1gscUNBQU8sQ0FBQTtRQUNQLHVDQUFRLENBQUE7SUFDVCxDQUFDLEVBSlUsUUFBUSxLQUFSLFFBQVEsUUFJbEI7SUFFRDs7U0FFSztJQUNMLE1BQWEsZUFBZTtRQWdCM0IsWUFDQyxLQUF1QixFQUN2QixNQUFjLEVBQ2QsV0FBd0IsRUFDeEIsWUFBMEIsRUFDMUIsT0FBK0IsRUFDL0Isa0JBQXdELEVBQ3hELG9CQUFtRCwyQkFBaUIsQ0FBQyxPQUFPLEVBQ25FLGdCQUFvQyxTQUFTO1lBQTdDLGtCQUFhLEdBQWIsYUFBYSxDQUFnQztZQWxCdEMsc0JBQWlCLEdBQUcsZUFBZSxDQUFDLHVCQUF1QixDQUFDO1lBb0I1RSxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztZQUNwQixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUN0QixJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztZQUNsQyxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztZQUN4QixJQUFJLENBQUMsYUFBYSx1QkFBZSxDQUFDO1lBQ2xDLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxrQkFB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