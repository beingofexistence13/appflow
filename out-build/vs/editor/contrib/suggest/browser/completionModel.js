/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/filters", "vs/base/common/strings"], function (require, exports, arrays_1, filters_1, strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$85 = exports.$75 = void 0;
    class $75 {
        constructor(leadingLineContent, characterCountDelta) {
            this.leadingLineContent = leadingLineContent;
            this.characterCountDelta = characterCountDelta;
        }
    }
    exports.$75 = $75;
    var Refilter;
    (function (Refilter) {
        Refilter[Refilter["Nothing"] = 0] = "Nothing";
        Refilter[Refilter["All"] = 1] = "All";
        Refilter[Refilter["Incr"] = 2] = "Incr";
    })(Refilter || (Refilter = {}));
    /**
     * Sorted, filtered completion view model
     * */
    class $85 {
        constructor(items, column, lineContext, wordDistance, options, snippetSuggestions, fuzzyScoreOptions = filters_1.$Jj.default, clipboardText = undefined) {
            this.clipboardText = clipboardText;
            this.g = $85.q;
            this.c = items;
            this.d = column;
            this.e = wordDistance;
            this.f = options;
            this.k = 1 /* Refilter.All */;
            this.j = lineContext;
            this.h = fuzzyScoreOptions;
            if (snippetSuggestions === 'top') {
                this.g = $85.s;
            }
            else if (snippetSuggestions === 'bottom') {
                this.g = $85.r;
            }
        }
        get lineContext() {
            return this.j;
        }
        set lineContext(value) {
            if (this.j.leadingLineContent !== value.leadingLineContent
                || this.j.characterCountDelta !== value.characterCountDelta) {
                this.k = this.j.characterCountDelta < value.characterCountDelta && this.l ? 2 /* Refilter.Incr */ : 1 /* Refilter.All */;
                this.j = value;
            }
        }
        get items() {
            this.o();
            return this.l;
        }
        getItemsByProvider() {
            this.o();
            return this.m;
        }
        getIncompleteProvider() {
            this.o();
            const result = new Set();
            for (const [provider, items] of this.getItemsByProvider()) {
                if (items.length > 0 && items[0].container.incomplete) {
                    result.add(provider);
                }
            }
            return result;
        }
        get stats() {
            this.o();
            return this.n;
        }
        o() {
            if (this.k !== 0 /* Refilter.Nothing */) {
                this.p();
            }
        }
        p() {
            this.m = new Map();
            const labelLengths = [];
            const { leadingLineContent, characterCountDelta } = this.j;
            let word = '';
            let wordLow = '';
            // incrementally filter less
            const source = this.k === 1 /* Refilter.All */ ? this.c : this.l;
            const target = [];
            // picks a score function based on the number of
            // items that we have to score/filter and based on the
            // user-configuration
            const scoreFn = (!this.f.filterGraceful || source.length > 2000) ? filters_1.$Kj : filters_1.$Lj;
            for (let i = 0; i < source.length; i++) {
                const item = source[i];
                if (item.isInvalid) {
                    continue; // SKIP invalid items
                }
                // keep all items by their provider
                const arr = this.m.get(item.provider);
                if (arr) {
                    arr.push(item);
                }
                else {
                    this.m.set(item.provider, [item]);
                }
                // 'word' is that remainder of the current line that we
                // filter and score against. In theory each suggestion uses a
                // different word, but in practice not - that's why we cache
                const overwriteBefore = item.position.column - item.editStart.column;
                const wordLen = overwriteBefore + characterCountDelta - (item.position.column - this.d);
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
                        const match = scoreFn(word, wordLow, wordPos, item.completion.filterText, item.filterTextLow, 0, this.h);
                        if (!match) {
                            continue; // NO match
                        }
                        if ((0, strings_1.$He)(item.completion.filterText, item.textLabel) === 0) {
                            // filterText and label are actually the same -> use good highlights
                            item.score = match;
                        }
                        else {
                            // re-run the scorer on the label in the hope of a result BUT use the rank
                            // of the filterText-match
                            item.score = (0, filters_1.$Gj)(word, wordLow, wordPos, item.textLabel, item.labelLow, 0);
                            item.score[0] = match[0]; // use score from filterText
                        }
                    }
                    else {
                        // by default match `word` against the `label`
                        const match = scoreFn(word, wordLow, wordPos, item.textLabel, item.labelLow, 0, this.h);
                        if (!match) {
                            continue; // NO match
                        }
                        item.score = match;
                    }
                }
                item.idx = i;
                item.distance = this.e.distance(item.position, item.completion);
                target.push(item);
                // update stats
                labelLengths.push(item.textLabel.length);
            }
            this.l = target.sort(this.g);
            this.k = 0 /* Refilter.Nothing */;
            this.n = {
                pLabelLen: labelLengths.length ?
                    (0, arrays_1.$wb)(labelLengths.length - .85, labelLengths, (a, b) => a - b)
                    : 0
            };
        }
        static q(a, b) {
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
        static r(a, b) {
            if (a.completion.kind !== b.completion.kind) {
                if (a.completion.kind === 27 /* CompletionItemKind.Snippet */) {
                    return 1;
                }
                else if (b.completion.kind === 27 /* CompletionItemKind.Snippet */) {
                    return -1;
                }
            }
            return $85.q(a, b);
        }
        static s(a, b) {
            if (a.completion.kind !== b.completion.kind) {
                if (a.completion.kind === 27 /* CompletionItemKind.Snippet */) {
                    return -1;
                }
                else if (b.completion.kind === 27 /* CompletionItemKind.Snippet */) {
                    return 1;
                }
            }
            return $85.q(a, b);
        }
    }
    exports.$85 = $85;
});
//# sourceMappingURL=completionModel.js.map