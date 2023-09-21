/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/range", "vs/editor/common/model", "vs/editor/common/model/textModel", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService"], function (require, exports, range_1, model_1, textModel_1, colorRegistry_1, themeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FindDecorations = void 0;
    class FindDecorations {
        constructor(editor) {
            this._editor = editor;
            this._decorations = [];
            this._overviewRulerApproximateDecorations = [];
            this._findScopeDecorationIds = [];
            this._rangeHighlightDecorationId = null;
            this._highlightedDecorationId = null;
            this._startPosition = this._editor.getPosition();
        }
        dispose() {
            this._editor.removeDecorations(this._allDecorations());
            this._decorations = [];
            this._overviewRulerApproximateDecorations = [];
            this._findScopeDecorationIds = [];
            this._rangeHighlightDecorationId = null;
            this._highlightedDecorationId = null;
        }
        reset() {
            this._decorations = [];
            this._overviewRulerApproximateDecorations = [];
            this._findScopeDecorationIds = [];
            this._rangeHighlightDecorationId = null;
            this._highlightedDecorationId = null;
        }
        getCount() {
            return this._decorations.length;
        }
        /** @deprecated use getFindScopes to support multiple selections */
        getFindScope() {
            if (this._findScopeDecorationIds[0]) {
                return this._editor.getModel().getDecorationRange(this._findScopeDecorationIds[0]);
            }
            return null;
        }
        getFindScopes() {
            if (this._findScopeDecorationIds.length) {
                const scopes = this._findScopeDecorationIds.map(findScopeDecorationId => this._editor.getModel().getDecorationRange(findScopeDecorationId)).filter(element => !!element);
                if (scopes.length) {
                    return scopes;
                }
            }
            return null;
        }
        getStartPosition() {
            return this._startPosition;
        }
        setStartPosition(newStartPosition) {
            this._startPosition = newStartPosition;
            this.setCurrentFindMatch(null);
        }
        _getDecorationIndex(decorationId) {
            const index = this._decorations.indexOf(decorationId);
            if (index >= 0) {
                return index + 1;
            }
            return 1;
        }
        getDecorationRangeAt(index) {
            const decorationId = index < this._decorations.length ? this._decorations[index] : null;
            if (decorationId) {
                return this._editor.getModel().getDecorationRange(decorationId);
            }
            return null;
        }
        getCurrentMatchesPosition(desiredRange) {
            const candidates = this._editor.getModel().getDecorationsInRange(desiredRange);
            for (const candidate of candidates) {
                const candidateOpts = candidate.options;
                if (candidateOpts === FindDecorations._FIND_MATCH_DECORATION || candidateOpts === FindDecorations._CURRENT_FIND_MATCH_DECORATION) {
                    return this._getDecorationIndex(candidate.id);
                }
            }
            // We don't know the current match position, so returns zero to show '?' in find widget
            return 0;
        }
        setCurrentFindMatch(nextMatch) {
            let newCurrentDecorationId = null;
            let matchPosition = 0;
            if (nextMatch) {
                for (let i = 0, len = this._decorations.length; i < len; i++) {
                    const range = this._editor.getModel().getDecorationRange(this._decorations[i]);
                    if (nextMatch.equalsRange(range)) {
                        newCurrentDecorationId = this._decorations[i];
                        matchPosition = (i + 1);
                        break;
                    }
                }
            }
            if (this._highlightedDecorationId !== null || newCurrentDecorationId !== null) {
                this._editor.changeDecorations((changeAccessor) => {
                    if (this._highlightedDecorationId !== null) {
                        changeAccessor.changeDecorationOptions(this._highlightedDecorationId, FindDecorations._FIND_MATCH_DECORATION);
                        this._highlightedDecorationId = null;
                    }
                    if (newCurrentDecorationId !== null) {
                        this._highlightedDecorationId = newCurrentDecorationId;
                        changeAccessor.changeDecorationOptions(this._highlightedDecorationId, FindDecorations._CURRENT_FIND_MATCH_DECORATION);
                    }
                    if (this._rangeHighlightDecorationId !== null) {
                        changeAccessor.removeDecoration(this._rangeHighlightDecorationId);
                        this._rangeHighlightDecorationId = null;
                    }
                    if (newCurrentDecorationId !== null) {
                        let rng = this._editor.getModel().getDecorationRange(newCurrentDecorationId);
                        if (rng.startLineNumber !== rng.endLineNumber && rng.endColumn === 1) {
                            const lineBeforeEnd = rng.endLineNumber - 1;
                            const lineBeforeEndMaxColumn = this._editor.getModel().getLineMaxColumn(lineBeforeEnd);
                            rng = new range_1.Range(rng.startLineNumber, rng.startColumn, lineBeforeEnd, lineBeforeEndMaxColumn);
                        }
                        this._rangeHighlightDecorationId = changeAccessor.addDecoration(rng, FindDecorations._RANGE_HIGHLIGHT_DECORATION);
                    }
                });
            }
            return matchPosition;
        }
        set(findMatches, findScopes) {
            this._editor.changeDecorations((accessor) => {
                let findMatchesOptions = FindDecorations._FIND_MATCH_DECORATION;
                const newOverviewRulerApproximateDecorations = [];
                if (findMatches.length > 1000) {
                    // we go into a mode where the overview ruler gets "approximate" decorations
                    // the reason is that the overview ruler paints all the decorations in the file and we don't want to cause freezes
                    findMatchesOptions = FindDecorations._FIND_MATCH_NO_OVERVIEW_DECORATION;
                    // approximate a distance in lines where matches should be merged
                    const lineCount = this._editor.getModel().getLineCount();
                    const height = this._editor.getLayoutInfo().height;
                    const approxPixelsPerLine = height / lineCount;
                    const mergeLinesDelta = Math.max(2, Math.ceil(3 / approxPixelsPerLine));
                    // merge decorations as much as possible
                    let prevStartLineNumber = findMatches[0].range.startLineNumber;
                    let prevEndLineNumber = findMatches[0].range.endLineNumber;
                    for (let i = 1, len = findMatches.length; i < len; i++) {
                        const range = findMatches[i].range;
                        if (prevEndLineNumber + mergeLinesDelta >= range.startLineNumber) {
                            if (range.endLineNumber > prevEndLineNumber) {
                                prevEndLineNumber = range.endLineNumber;
                            }
                        }
                        else {
                            newOverviewRulerApproximateDecorations.push({
                                range: new range_1.Range(prevStartLineNumber, 1, prevEndLineNumber, 1),
                                options: FindDecorations._FIND_MATCH_ONLY_OVERVIEW_DECORATION
                            });
                            prevStartLineNumber = range.startLineNumber;
                            prevEndLineNumber = range.endLineNumber;
                        }
                    }
                    newOverviewRulerApproximateDecorations.push({
                        range: new range_1.Range(prevStartLineNumber, 1, prevEndLineNumber, 1),
                        options: FindDecorations._FIND_MATCH_ONLY_OVERVIEW_DECORATION
                    });
                }
                // Find matches
                const newFindMatchesDecorations = new Array(findMatches.length);
                for (let i = 0, len = findMatches.length; i < len; i++) {
                    newFindMatchesDecorations[i] = {
                        range: findMatches[i].range,
                        options: findMatchesOptions
                    };
                }
                this._decorations = accessor.deltaDecorations(this._decorations, newFindMatchesDecorations);
                // Overview ruler approximate decorations
                this._overviewRulerApproximateDecorations = accessor.deltaDecorations(this._overviewRulerApproximateDecorations, newOverviewRulerApproximateDecorations);
                // Range highlight
                if (this._rangeHighlightDecorationId) {
                    accessor.removeDecoration(this._rangeHighlightDecorationId);
                    this._rangeHighlightDecorationId = null;
                }
                // Find scope
                if (this._findScopeDecorationIds.length) {
                    this._findScopeDecorationIds.forEach(findScopeDecorationId => accessor.removeDecoration(findScopeDecorationId));
                    this._findScopeDecorationIds = [];
                }
                if (findScopes?.length) {
                    this._findScopeDecorationIds = findScopes.map(findScope => accessor.addDecoration(findScope, FindDecorations._FIND_SCOPE_DECORATION));
                }
            });
        }
        matchBeforePosition(position) {
            if (this._decorations.length === 0) {
                return null;
            }
            for (let i = this._decorations.length - 1; i >= 0; i--) {
                const decorationId = this._decorations[i];
                const r = this._editor.getModel().getDecorationRange(decorationId);
                if (!r || r.endLineNumber > position.lineNumber) {
                    continue;
                }
                if (r.endLineNumber < position.lineNumber) {
                    return r;
                }
                if (r.endColumn > position.column) {
                    continue;
                }
                return r;
            }
            return this._editor.getModel().getDecorationRange(this._decorations[this._decorations.length - 1]);
        }
        matchAfterPosition(position) {
            if (this._decorations.length === 0) {
                return null;
            }
            for (let i = 0, len = this._decorations.length; i < len; i++) {
                const decorationId = this._decorations[i];
                const r = this._editor.getModel().getDecorationRange(decorationId);
                if (!r || r.startLineNumber < position.lineNumber) {
                    continue;
                }
                if (r.startLineNumber > position.lineNumber) {
                    return r;
                }
                if (r.startColumn < position.column) {
                    continue;
                }
                return r;
            }
            return this._editor.getModel().getDecorationRange(this._decorations[0]);
        }
        _allDecorations() {
            let result = [];
            result = result.concat(this._decorations);
            result = result.concat(this._overviewRulerApproximateDecorations);
            if (this._findScopeDecorationIds.length) {
                result.push(...this._findScopeDecorationIds);
            }
            if (this._rangeHighlightDecorationId) {
                result.push(this._rangeHighlightDecorationId);
            }
            return result;
        }
        static { this._CURRENT_FIND_MATCH_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'current-find-match',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            zIndex: 13,
            className: 'currentFindMatch',
            showIfCollapsed: true,
            overviewRuler: {
                color: (0, themeService_1.themeColorFromId)(colorRegistry_1.overviewRulerFindMatchForeground),
                position: model_1.OverviewRulerLane.Center
            },
            minimap: {
                color: (0, themeService_1.themeColorFromId)(colorRegistry_1.minimapFindMatch),
                position: model_1.MinimapPosition.Inline
            }
        }); }
        static { this._FIND_MATCH_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'find-match',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            zIndex: 10,
            className: 'findMatch',
            showIfCollapsed: true,
            overviewRuler: {
                color: (0, themeService_1.themeColorFromId)(colorRegistry_1.overviewRulerFindMatchForeground),
                position: model_1.OverviewRulerLane.Center
            },
            minimap: {
                color: (0, themeService_1.themeColorFromId)(colorRegistry_1.minimapFindMatch),
                position: model_1.MinimapPosition.Inline
            }
        }); }
        static { this._FIND_MATCH_NO_OVERVIEW_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'find-match-no-overview',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            className: 'findMatch',
            showIfCollapsed: true
        }); }
        static { this._FIND_MATCH_ONLY_OVERVIEW_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'find-match-only-overview',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            overviewRuler: {
                color: (0, themeService_1.themeColorFromId)(colorRegistry_1.overviewRulerFindMatchForeground),
                position: model_1.OverviewRulerLane.Center
            }
        }); }
        static { this._RANGE_HIGHLIGHT_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'find-range-highlight',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            className: 'rangeHighlight',
            isWholeLine: true
        }); }
        static { this._FIND_SCOPE_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'find-scope',
            className: 'findScope',
            isWholeLine: true
        }); }
    }
    exports.FindDecorations = FindDecorations;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZERlY29yYXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvZmluZC9icm93c2VyL2ZpbmREZWNvcmF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFXaEcsTUFBYSxlQUFlO1FBVTNCLFlBQVksTUFBeUI7WUFDcEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFDdEIsSUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7WUFDdkIsSUFBSSxDQUFDLG9DQUFvQyxHQUFHLEVBQUUsQ0FBQztZQUMvQyxJQUFJLENBQUMsdUJBQXVCLEdBQUcsRUFBRSxDQUFDO1lBQ2xDLElBQUksQ0FBQywyQkFBMkIsR0FBRyxJQUFJLENBQUM7WUFDeEMsSUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksQ0FBQztZQUNyQyxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbEQsQ0FBQztRQUVNLE9BQU87WUFDYixJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO1lBRXZELElBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxvQ0FBb0MsR0FBRyxFQUFFLENBQUM7WUFDL0MsSUFBSSxDQUFDLHVCQUF1QixHQUFHLEVBQUUsQ0FBQztZQUNsQyxJQUFJLENBQUMsMkJBQTJCLEdBQUcsSUFBSSxDQUFDO1lBQ3hDLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLENBQUM7UUFDdEMsQ0FBQztRQUVNLEtBQUs7WUFDWCxJQUFJLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQztZQUN2QixJQUFJLENBQUMsb0NBQW9DLEdBQUcsRUFBRSxDQUFDO1lBQy9DLElBQUksQ0FBQyx1QkFB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