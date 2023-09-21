/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/range", "vs/workbench/services/search/common/search"], function (require, exports, range_1, search_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.addContextToEditorMatches = exports.editorMatchesToTextSearchResults = void 0;
    function editorMatchToTextSearchResult(matches, model, previewOptions) {
        const firstLine = matches[0].range.startLineNumber;
        const lastLine = matches[matches.length - 1].range.endLineNumber;
        const lineTexts = [];
        for (let i = firstLine; i <= lastLine; i++) {
            lineTexts.push(model.getLineContent(i));
        }
        return new search_1.TextSearchMatch(lineTexts.join('\n') + '\n', matches.map(m => new range_1.Range(m.range.startLineNumber - 1, m.range.startColumn - 1, m.range.endLineNumber - 1, m.range.endColumn - 1)), previewOptions);
    }
    /**
     * Combine a set of FindMatches into a set of TextSearchResults. They should be grouped by matches that start on the same line that the previous match ends on.
     */
    function editorMatchesToTextSearchResults(matches, model, previewOptions) {
        let previousEndLine = -1;
        const groupedMatches = [];
        let currentMatches = [];
        matches.forEach((match) => {
            if (match.range.startLineNumber !== previousEndLine) {
                currentMatches = [];
                groupedMatches.push(currentMatches);
            }
            currentMatches.push(match);
            previousEndLine = match.range.endLineNumber;
        });
        return groupedMatches.map(sameLineMatches => {
            return editorMatchToTextSearchResult(sameLineMatches, model, previewOptions);
        });
    }
    exports.editorMatchesToTextSearchResults = editorMatchesToTextSearchResults;
    function addContextToEditorMatches(matches, model, query) {
        const results = [];
        let prevLine = -1;
        for (let i = 0; i < matches.length; i++) {
            const { start: matchStartLine, end: matchEndLine } = getMatchStartEnd(matches[i]);
            if (typeof query.beforeContext === 'number' && query.beforeContext > 0) {
                const beforeContextStartLine = Math.max(prevLine + 1, matchStartLine - query.beforeContext);
                for (let b = beforeContextStartLine; b < matchStartLine; b++) {
                    results.push({
                        text: model.getLineContent(b + 1),
                        lineNumber: b
                    });
                }
            }
            results.push(matches[i]);
            const nextMatch = matches[i + 1];
            const nextMatchStartLine = nextMatch ? getMatchStartEnd(nextMatch).start : Number.MAX_VALUE;
            if (typeof query.afterContext === 'number' && query.afterContext > 0) {
                const afterContextToLine = Math.min(nextMatchStartLine - 1, matchEndLine + query.afterContext, model.getLineCount() - 1);
                for (let a = matchEndLine + 1; a <= afterContextToLine; a++) {
                    results.push({
                        text: model.getLineContent(a + 1),
                        lineNumber: a
                    });
                }
            }
            prevLine = matchEndLine;
        }
        return results;
    }
    exports.addContextToEditorMatches = addContextToEditorMatches;
    function getMatchStartEnd(match) {
        const matchRanges = match.ranges;
        const matchStartLine = Array.isArray(matchRanges) ? matchRanges[0].startLineNumber : matchRanges.startLineNumber;
        const matchEndLine = Array.isArray(matchRanges) ? matchRanges[matchRanges.length - 1].endLineNumber : matchRanges.endLineNumber;
        return {
            start: matchStartLine,
            end: matchEndLine
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoSGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9zZWFyY2gvY29tbW9uL3NlYXJjaEhlbHBlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLFNBQVMsNkJBQTZCLENBQUMsT0FBb0IsRUFBRSxLQUFpQixFQUFFLGNBQTBDO1FBQ3pILE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDO1FBQ25ELE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUM7UUFFakUsTUFBTSxTQUFTLEdBQWEsRUFBRSxDQUFDO1FBQy9CLEtBQUssSUFBSSxDQUFDLEdBQUcsU0FBUyxFQUFFLENBQUMsSUFBSSxRQUFRLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDM0MsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDeEM7UUFFRCxPQUFPLElBQUksd0JBQWUsQ0FDekIsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLEVBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLGFBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUNuSSxjQUFjLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBRUQ7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