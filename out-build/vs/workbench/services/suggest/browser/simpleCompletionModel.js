/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/filters"], function (require, exports, arrays_1, filters_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Fib = exports.$Eib = void 0;
    class $Eib {
        constructor(leadingLineContent, characterCountDelta) {
            this.leadingLineContent = leadingLineContent;
            this.characterCountDelta = characterCountDelta;
        }
    }
    exports.$Eib = $Eib;
    var Refilter;
    (function (Refilter) {
        Refilter[Refilter["Nothing"] = 0] = "Nothing";
        Refilter[Refilter["All"] = 1] = "All";
        Refilter[Refilter["Incr"] = 2] = "Incr";
    })(Refilter || (Refilter = {}));
    class $Fib {
        constructor(h, j, replacementIndex, replacementLength) {
            this.h = h;
            this.j = j;
            this.replacementIndex = replacementIndex;
            this.replacementLength = replacementLength;
            this.e = 1 /* Refilter.All */;
            this.f = filters_1.$Jj.default;
            // TODO: Pass in options
            this.g = {};
        }
        get items() {
            this.k();
            return this.d;
        }
        get stats() {
            this.k();
            return this.c;
        }
        get lineContext() {
            return this.j;
        }
        set lineContext(value) {
            if (this.j.leadingLineContent !== value.leadingLineContent
                || this.j.characterCountDelta !== value.characterCountDelta) {
                this.e = this.j.characterCountDelta < value.characterCountDelta && this.d ? 2 /* Refilter.Incr */ : 1 /* Refilter.All */;
                this.j = value;
            }
        }
        k() {
            if (this.e !== 0 /* Refilter.Nothing */) {
                this.l();
            }
        }
        l() {
            // this._providerInfo = new Map();
            const labelLengths = [];
            const { leadingLineContent, characterCountDelta } = this.j;
            let word = '';
            let wordLow = '';
            // incrementally filter less
            const source = this.e === 1 /* Refilter.All */ ? this.h : this.d;
            const target = [];
            // picks a score function based on the number of
            // items that we have to score/filter and based on the
            // user-configuration
            const scoreFn = (!this.g.filterGraceful || source.length > 2000) ? filters_1.$Kj : filters_1.$Lj;
            for (let i = 0; i < source.length; i++) {
                const item = source[i];
                // if (item.isInvalid) {
                // 	continue; // SKIP invalid items
                // }
                // collect all support, know if their result is incomplete
                // this._providerInfo.set(item.provider, Boolean(item.container.incomplete));
                // 'word' is that remainder of the current line that we
                // filter and score against. In theory each suggestion uses a
                // different word, but in practice not - that's why we cache
                // TODO: Fix
                const overwriteBefore = this.replacementLength; // item.position.column - item.editStart.column;
                const wordLen = overwriteBefore + characterCountDelta; // - (item.position.column - this._column);
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
                        // } else if (typeof item.completion.filterText === 'string') {
                        // 	// when there is a `filterText` it must match the `word`.
                        // 	// if it matches we check with the label to compute highlights
                        // 	// and if that doesn't yield a result we have no highlights,
                        // 	// despite having the match
                        // 	const match = scoreFn(word, wordLow, wordPos, item.completion.filterText, item.filterTextLow!, 0, this._fuzzyScoreOptions);
                        // 	if (!match) {
                        // 		continue; // NO match
                        // 	}
                        // 	if (compareIgnoreCase(item.completion.filterText, item.textLabel) === 0) {
                        // 		// filterText and label are actually the same -> use good highlights
                        // 		item.score = match;
                        // 	} else {
                        // 		// re-run the scorer on the label in the hope of a result BUT use the rank
                        // 		// of the filterText-match
                        // 		item.score = anyScore(word, wordLow, wordPos, item.textLabel, item.labelLow, 0);
                        // 		item.score[0] = match[0]; // use score from filterText
                        // 	}
                    }
                    else {
                        // by default match `word` against the `label`
                        const match = scoreFn(word, wordLow, wordPos, item.completion.label, item.labelLow, 0, this.f);
                        if (!match) {
                            continue; // NO match
                        }
                        item.score = match;
                    }
                }
                item.idx = i;
                // TODO: Word distance
                item.distance = 1; //this._wordDistance.distance(item.position, item.completion);
                target.push(item);
                // update stats
                labelLengths.push(item.completion.label.length);
            }
            this.d = target; // target.sort(this._snippetCompareFn);
            this.e = 0 /* Refilter.Nothing */;
            this.c = {
                pLabelLen: labelLengths.length ?
                    (0, arrays_1.$wb)(labelLengths.length - .85, labelLengths, (a, b) => a - b)
                    : 0
            };
        }
    }
    exports.$Fib = $Fib;
});
//# sourceMappingURL=simpleCompletionModel.js.map