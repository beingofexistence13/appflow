/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/range", "vs/editor/common/model", "vs/editor/common/model/textModel", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService"], function (require, exports, range_1, model_1, textModel_1, colorRegistry_1, themeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$s7 = void 0;
    class $s7 {
        constructor(editor) {
            this.a = editor;
            this.b = [];
            this.c = [];
            this.d = [];
            this.e = null;
            this.f = null;
            this.g = this.a.getPosition();
        }
        dispose() {
            this.a.removeDecorations(this.j());
            this.b = [];
            this.c = [];
            this.d = [];
            this.e = null;
            this.f = null;
        }
        reset() {
            this.b = [];
            this.c = [];
            this.d = [];
            this.e = null;
            this.f = null;
        }
        getCount() {
            return this.b.length;
        }
        /** @deprecated use getFindScopes to support multiple selections */
        getFindScope() {
            if (this.d[0]) {
                return this.a.getModel().getDecorationRange(this.d[0]);
            }
            return null;
        }
        getFindScopes() {
            if (this.d.length) {
                const scopes = this.d.map(findScopeDecorationId => this.a.getModel().getDecorationRange(findScopeDecorationId)).filter(element => !!element);
                if (scopes.length) {
                    return scopes;
                }
            }
            return null;
        }
        getStartPosition() {
            return this.g;
        }
        setStartPosition(newStartPosition) {
            this.g = newStartPosition;
            this.setCurrentFindMatch(null);
        }
        h(decorationId) {
            const index = this.b.indexOf(decorationId);
            if (index >= 0) {
                return index + 1;
            }
            return 1;
        }
        getDecorationRangeAt(index) {
            const decorationId = index < this.b.length ? this.b[index] : null;
            if (decorationId) {
                return this.a.getModel().getDecorationRange(decorationId);
            }
            return null;
        }
        getCurrentMatchesPosition(desiredRange) {
            const candidates = this.a.getModel().getDecorationsInRange(desiredRange);
            for (const candidate of candidates) {
                const candidateOpts = candidate.options;
                if (candidateOpts === $s7._FIND_MATCH_DECORATION || candidateOpts === $s7._CURRENT_FIND_MATCH_DECORATION) {
                    return this.h(candidate.id);
                }
            }
            // We don't know the current match position, so returns zero to show '?' in find widget
            return 0;
        }
        setCurrentFindMatch(nextMatch) {
            let newCurrentDecorationId = null;
            let matchPosition = 0;
            if (nextMatch) {
                for (let i = 0, len = this.b.length; i < len; i++) {
                    const range = this.a.getModel().getDecorationRange(this.b[i]);
                    if (nextMatch.equalsRange(range)) {
                        newCurrentDecorationId = this.b[i];
                        matchPosition = (i + 1);
                        break;
                    }
                }
            }
            if (this.f !== null || newCurrentDecorationId !== null) {
                this.a.changeDecorations((changeAccessor) => {
                    if (this.f !== null) {
                        changeAccessor.changeDecorationOptions(this.f, $s7._FIND_MATCH_DECORATION);
                        this.f = null;
                    }
                    if (newCurrentDecorationId !== null) {
                        this.f = newCurrentDecorationId;
                        changeAccessor.changeDecorationOptions(this.f, $s7._CURRENT_FIND_MATCH_DECORATION);
                    }
                    if (this.e !== null) {
                        changeAccessor.removeDecoration(this.e);
                        this.e = null;
                    }
                    if (newCurrentDecorationId !== null) {
                        let rng = this.a.getModel().getDecorationRange(newCurrentDecorationId);
                        if (rng.startLineNumber !== rng.endLineNumber && rng.endColumn === 1) {
                            const lineBeforeEnd = rng.endLineNumber - 1;
                            const lineBeforeEndMaxColumn = this.a.getModel().getLineMaxColumn(lineBeforeEnd);
                            rng = new range_1.$ks(rng.startLineNumber, rng.startColumn, lineBeforeEnd, lineBeforeEndMaxColumn);
                        }
                        this.e = changeAccessor.addDecoration(rng, $s7.l);
                    }
                });
            }
            return matchPosition;
        }
        set(findMatches, findScopes) {
            this.a.changeDecorations((accessor) => {
                let findMatchesOptions = $s7._FIND_MATCH_DECORATION;
                const newOverviewRulerApproximateDecorations = [];
                if (findMatches.length > 1000) {
                    // we go into a mode where the overview ruler gets "approximate" decorations
                    // the reason is that the overview ruler paints all the decorations in the file and we don't want to cause freezes
                    findMatchesOptions = $s7._FIND_MATCH_NO_OVERVIEW_DECORATION;
                    // approximate a distance in lines where matches should be merged
                    const lineCount = this.a.getModel().getLineCount();
                    const height = this.a.getLayoutInfo().height;
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
                                range: new range_1.$ks(prevStartLineNumber, 1, prevEndLineNumber, 1),
                                options: $s7.k
                            });
                            prevStartLineNumber = range.startLineNumber;
                            prevEndLineNumber = range.endLineNumber;
                        }
                    }
                    newOverviewRulerApproximateDecorations.push({
                        range: new range_1.$ks(prevStartLineNumber, 1, prevEndLineNumber, 1),
                        options: $s7.k
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
                this.b = accessor.deltaDecorations(this.b, newFindMatchesDecorations);
                // Overview ruler approximate decorations
                this.c = accessor.deltaDecorations(this.c, newOverviewRulerApproximateDecorations);
                // Range highlight
                if (this.e) {
                    accessor.removeDecoration(this.e);
                    this.e = null;
                }
                // Find scope
                if (this.d.length) {
                    this.d.forEach(findScopeDecorationId => accessor.removeDecoration(findScopeDecorationId));
                    this.d = [];
                }
                if (findScopes?.length) {
                    this.d = findScopes.map(findScope => accessor.addDecoration(findScope, $s7.m));
                }
            });
        }
        matchBeforePosition(position) {
            if (this.b.length === 0) {
                return null;
            }
            for (let i = this.b.length - 1; i >= 0; i--) {
                const decorationId = this.b[i];
                const r = this.a.getModel().getDecorationRange(decorationId);
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
            return this.a.getModel().getDecorationRange(this.b[this.b.length - 1]);
        }
        matchAfterPosition(position) {
            if (this.b.length === 0) {
                return null;
            }
            for (let i = 0, len = this.b.length; i < len; i++) {
                const decorationId = this.b[i];
                const r = this.a.getModel().getDecorationRange(decorationId);
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
            return this.a.getModel().getDecorationRange(this.b[0]);
        }
        j() {
            let result = [];
            result = result.concat(this.b);
            result = result.concat(this.c);
            if (this.d.length) {
                result.push(...this.d);
            }
            if (this.e) {
                result.push(this.e);
            }
            return result;
        }
        static { this._CURRENT_FIND_MATCH_DECORATION = textModel_1.$RC.register({
            description: 'current-find-match',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            zIndex: 13,
            className: 'currentFindMatch',
            showIfCollapsed: true,
            overviewRuler: {
                color: (0, themeService_1.$hv)(colorRegistry_1.$zy),
                position: model_1.OverviewRulerLane.Center
            },
            minimap: {
                color: (0, themeService_1.$hv)(colorRegistry_1.$By),
                position: model_1.MinimapPosition.Inline
            }
        }); }
        static { this._FIND_MATCH_DECORATION = textModel_1.$RC.register({
            description: 'find-match',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            zIndex: 10,
            className: 'findMatch',
            showIfCollapsed: true,
            overviewRuler: {
                color: (0, themeService_1.$hv)(colorRegistry_1.$zy),
                position: model_1.OverviewRulerLane.Center
            },
            minimap: {
                color: (0, themeService_1.$hv)(colorRegistry_1.$By),
                position: model_1.MinimapPosition.Inline
            }
        }); }
        static { this._FIND_MATCH_NO_OVERVIEW_DECORATION = textModel_1.$RC.register({
            description: 'find-match-no-overview',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            className: 'findMatch',
            showIfCollapsed: true
        }); }
        static { this.k = textModel_1.$RC.register({
            description: 'find-match-only-overview',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            overviewRuler: {
                color: (0, themeService_1.$hv)(colorRegistry_1.$zy),
                position: model_1.OverviewRulerLane.Center
            }
        }); }
        static { this.l = textModel_1.$RC.register({
            description: 'find-range-highlight',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            className: 'rangeHighlight',
            isWholeLine: true
        }); }
        static { this.m = textModel_1.$RC.register({
            description: 'find-scope',
            className: 'findScope',
            isWholeLine: true
        }); }
    }
    exports.$s7 = $s7;
});
//# sourceMappingURL=findDecorations.js.map