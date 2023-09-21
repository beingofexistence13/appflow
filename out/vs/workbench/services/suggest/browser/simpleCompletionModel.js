/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/filters"], function (require, exports, arrays_1, filters_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SimpleCompletionModel = exports.LineContext = void 0;
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
    class SimpleCompletionModel {
        constructor(_items, _lineContext, replacementIndex, replacementLength) {
            this._items = _items;
            this._lineContext = _lineContext;
            this.replacementIndex = replacementIndex;
            this.replacementLength = replacementLength;
            this._refilterKind = 1 /* Refilter.All */;
            this._fuzzyScoreOptions = filters_1.FuzzyScoreOptions.default;
            // TODO: Pass in options
            this._options = {};
        }
        get items() {
            this._ensureCachedState();
            return this._filteredItems;
        }
        get stats() {
            this._ensureCachedState();
            return this._stats;
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
        _ensureCachedState() {
            if (this._refilterKind !== 0 /* Refilter.Nothing */) {
                this._createCachedState();
            }
        }
        _createCachedState() {
            // this._providerInfo = new Map();
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
                        const match = scoreFn(word, wordLow, wordPos, item.completion.label, item.labelLow, 0, this._fuzzyScoreOptions);
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
            this._filteredItems = target; // target.sort(this._snippetCompareFn);
            this._refilterKind = 0 /* Refilter.Nothing */;
            this._stats = {
                pLabelLen: labelLengths.length ?
                    (0, arrays_1.quickSelect)(labelLengths.length - .85, labelLengths, (a, b) => a - b)
                    : 0
            };
        }
    }
    exports.SimpleCompletionModel = SimpleCompletionModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltcGxlQ29tcGxldGlvbk1vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3N1Z2dlc3QvYnJvd3Nlci9zaW1wbGVDb21wbGV0aW9uTW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBV2hHLE1BQWEsV0FBVztRQUN2QixZQUNVLGtCQUEwQixFQUMxQixtQkFBMkI7WUFEM0IsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFRO1lBQzFCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBUTtRQUNqQyxDQUFDO0tBQ0w7SUFMRCxrQ0FLQztJQUVELElBQVcsUUFJVjtJQUpELFdBQVcsUUFBUTtRQUNsQiw2Q0FBVyxDQUFBO1FBQ1gscUNBQU8sQ0FBQTtRQUNQLHVDQUFRLENBQUE7SUFDVCxDQUFDLEVBSlUsUUFBUSxLQUFSLFFBQVEsUUFJbEI7SUFFRCxNQUFhLHFCQUFxQjtRQVdqQyxZQUNrQixNQUE4QixFQUN2QyxZQUF5QixFQUN4QixnQkFBd0IsRUFDeEIsaUJBQXlCO1lBSGpCLFdBQU0sR0FBTixNQUFNLENBQXdCO1lBQ3ZDLGlCQUFZLEdBQVosWUFBWSxDQUFhO1lBQ3hCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBUTtZQUN4QixzQkFBaUIsR0FBakIsaUJBQWlCLENBQVE7WUFaM0Isa0JBQWEsd0JBQTBCO1lBQ3ZDLHVCQUFrQixHQUFrQywyQkFBaUIsQ0FBQyxPQUFPLENBQUM7WUFFdEYsd0JBQXdCO1lBQ2hCLGFBQVEsR0FFWixFQUFFLENBQUM7UUFRUCxDQUFDO1FBRUQsSUFBSSxLQUFLO1lBQ1IsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFDMUIsT0FBTyxJQUFJLENBQUMsY0FBZSxDQUFDO1FBQzdCLENBQUM7UUFFRCxJQUFJLEtBQUs7WUFDUixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUMxQixPQUFPLElBQUksQ0FBQyxNQUFPLENBQUM7UUFDckIsQ0FBQztRQUdELElBQUksV0FBVztZQUNkLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztRQUMxQixDQUFDO1FBRUQsSUFBSSxXQUFXLENBQUMsS0FBa0I7WUFDakMsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLGtCQUFrQixLQUFLLEtBQUssQ0FBQyxrQkFBa0I7bUJBQ2pFLElBQUksQ0FBQyxZQUFZLENBQUMsbUJBQW1CLEtBQUssS0FBSyxDQUFDLG1CQUFtQixFQUNyRTtnQkFDRCxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxDQUFDLG1CQUFtQixJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyx1QkFBZSxDQUFDLHFCQUFhLENBQUM7Z0JBQzdJLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO2FBQzFCO1FBQ0YsQ0FBQztRQUVPLGtCQUFrQjtZQUN6QixJQUFJLElBQUksQ0FBQyxhQUFhLDZCQUFxQixFQUFFO2dCQUM1QyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQzthQUMxQjtRQUNGLENBQUM7UUFDTyxrQkFBa0I7WUFFekIsa0NBQWtDO1lBRWxDLE1BQU0sWUFBWSxHQUFhLEVBQUUsQ0FBQztZQUVsQyxNQUFNLEVBQUUsa0JBQWtCLEVBQUUsbUJBQW1CLEVBQUUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO1lBQ3RFLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNkLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUVqQiw0QkFBNEI7WUFDNUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEseUJBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFlLENBQUM7WUFDeEYsTUFBTSxNQUFNLEdBQTJCLEVBQUUsQ0FBQztZQUUxQyxnREFBZ0Q7WUFDaEQsc0RBQXNEO1lBQ3RELHFCQUFxQjtZQUNyQixNQUFNLE9BQU8sR0FBZ0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLG9CQUFVLENBQUMsQ0FBQyxDQUFDLHNDQUE0QixDQUFDO1lBRWpJLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUV2QyxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXZCLHdCQUF3QjtnQkFDeEIsbUNBQW1DO2dCQUNuQyxJQUFJO2dCQUVKLDBEQUEwRDtnQkFDMUQsNkVBQTZFO2dCQUU3RSx1REFBdUQ7Z0JBQ3ZELDZEQUE2RDtnQkFDN0QsNERBQTREO2dCQUM1RCxZQUFZO2dCQUNaLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLGdEQUFnRDtnQkFDaEcsTUFBTSxPQUFPLEdBQUcsZUFBZSxHQUFHLG1CQUFtQixDQUFDLENBQUMsMkNBQTJDO2dCQUNsRyxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssT0FBTyxFQUFFO29CQUM1QixJQUFJLEdBQUcsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDL0QsT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztpQkFDN0I7Z0JBRUQsZ0RBQWdEO2dCQUNoRCxTQUFTO2dCQUNULElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO2dCQUVqQixJQUFJLE9BQU8sS0FBSyxDQUFDLEVBQUU7b0JBQ2xCLGdEQUFnRDtvQkFDaEQsZ0RBQWdEO29CQUNoRCxrREFBa0Q7b0JBQ2xELG1EQUFtRDtvQkFDbkQsMkNBQTJDO29CQUMzQyxJQUFJLENBQUMsS0FBSyxHQUFHLG9CQUFVLENBQUMsT0FBTyxDQUFDO2lCQUVoQztxQkFBTTtvQkFDTixpREFBaUQ7b0JBQ2pELGtEQUFrRDtvQkFDbEQsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO29CQUNoQixPQUFPLE9BQU8sR0FBRyxlQUFlLEVBQUU7d0JBQ2pDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQ3BDLElBQUksRUFBRSw0QkFBbUIsSUFBSSxFQUFFLHlCQUFpQixFQUFFOzRCQUNqRCxPQUFPLElBQUksQ0FBQyxDQUFDO3lCQUNiOzZCQUFNOzRCQUNOLE1BQU07eUJBQ047cUJBQ0Q7b0JBRUQsSUFBSSxPQUFPLElBQUksT0FBTyxFQUFFO3dCQUN2Qix3REFBd0Q7d0JBQ3hELDBEQUEwRDt3QkFDMUQsSUFBSSxDQUFDLEtBQUssR0FBRyxvQkFBVSxDQUFDLE9BQU8sQ0FBQzt3QkFFaEMsK0RBQStEO3dCQUMvRCw2REFBNkQ7d0JBQzdELGtFQUFrRTt3QkFDbEUsZ0VBQWdFO3dCQUNoRSwrQkFBK0I7d0JBQy9CLCtIQUErSDt3QkFDL0gsaUJBQWlCO3dCQUNqQiwwQkFBMEI7d0JBQzFCLEtBQUs7d0JBQ0wsOEVBQThFO3dCQUM5RSx5RUFBeUU7d0JBQ3pFLHdCQUF3Qjt3QkFDeEIsWUFBWTt3QkFDWiwrRUFBK0U7d0JBQy9FLCtCQUErQjt3QkFDL0IscUZBQXFGO3dCQUNyRiwyREFBMkQ7d0JBQzNELEtBQUs7cUJBRUw7eUJBQU07d0JBQ04sOENBQThDO3dCQUM5QyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7d0JBQ2hILElBQUksQ0FBQyxLQUFLLEVBQUU7NEJBQ1gsU0FBUyxDQUFDLFdBQVc7eUJBQ3JCO3dCQUNELElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO3FCQUNuQjtpQkFDRDtnQkFFRCxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDYixzQkFBc0I7Z0JBQ3RCLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUEsOERBQThEO2dCQUNoRixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUVsQixlQUFlO2dCQUNmLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDaEQ7WUFFRCxJQUFJLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQyxDQUFDLHVDQUF1QztZQUNyRSxJQUFJLENBQUMsYUFBYSwyQkFBbUIsQ0FBQztZQUV0QyxJQUFJLENBQUMsTUFBTSxHQUFHO2dCQUNiLFNBQVMsRUFBRSxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQy9CLElBQUEsb0JBQVcsRUFBQyxZQUFZLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNyRSxDQUFDLENBQUMsQ0FBQzthQUNKLENBQUM7UUFDSCxDQUFDO0tBQ0Q7SUF0S0Qsc0RBc0tDIn0=