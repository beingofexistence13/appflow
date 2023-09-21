/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/model/utils", "vs/editor/contrib/folding/browser/foldingRanges"], function (require, exports, utils_1, foldingRanges_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.computeRanges = exports.RangesCollector = exports.IndentRangeProvider = void 0;
    const MAX_FOLDING_REGIONS_FOR_INDENT_DEFAULT = 5000;
    const ID_INDENT_PROVIDER = 'indent';
    class IndentRangeProvider {
        constructor(editorModel, languageConfigurationService, foldingRangesLimit) {
            this.editorModel = editorModel;
            this.languageConfigurationService = languageConfigurationService;
            this.foldingRangesLimit = foldingRangesLimit;
            this.id = ID_INDENT_PROVIDER;
        }
        dispose() { }
        compute(cancelationToken) {
            const foldingRules = this.languageConfigurationService.getLanguageConfiguration(this.editorModel.getLanguageId()).foldingRules;
            const offSide = foldingRules && !!foldingRules.offSide;
            const markers = foldingRules && foldingRules.markers;
            return Promise.resolve(computeRanges(this.editorModel, offSide, markers, this.foldingRangesLimit));
        }
    }
    exports.IndentRangeProvider = IndentRangeProvider;
    // public only for testing
    class RangesCollector {
        constructor(foldingRangesLimit) {
            this._startIndexes = [];
            this._endIndexes = [];
            this._indentOccurrences = [];
            this._length = 0;
            this._foldingRangesLimit = foldingRangesLimit;
        }
        insertFirst(startLineNumber, endLineNumber, indent) {
            if (startLineNumber > foldingRanges_1.MAX_LINE_NUMBER || endLineNumber > foldingRanges_1.MAX_LINE_NUMBER) {
                return;
            }
            const index = this._length;
            this._startIndexes[index] = startLineNumber;
            this._endIndexes[index] = endLineNumber;
            this._length++;
            if (indent < 1000) {
                this._indentOccurrences[indent] = (this._indentOccurrences[indent] || 0) + 1;
            }
        }
        toIndentRanges(model) {
            const limit = this._foldingRangesLimit.limit;
            if (this._length <= limit) {
                this._foldingRangesLimit.update(this._length, false);
                // reverse and create arrays of the exact length
                const startIndexes = new Uint32Array(this._length);
                const endIndexes = new Uint32Array(this._length);
                for (let i = this._length - 1, k = 0; i >= 0; i--, k++) {
                    startIndexes[k] = this._startIndexes[i];
                    endIndexes[k] = this._endIndexes[i];
                }
                return new foldingRanges_1.FoldingRegions(startIndexes, endIndexes);
            }
            else {
                this._foldingRangesLimit.update(this._length, limit);
                let entries = 0;
                let maxIndent = this._indentOccurrences.length;
                for (let i = 0; i < this._indentOccurrences.length; i++) {
                    const n = this._indentOccurrences[i];
                    if (n) {
                        if (n + entries > limit) {
                            maxIndent = i;
                            break;
                        }
                        entries += n;
                    }
                }
                const tabSize = model.getOptions().tabSize;
                // reverse and create arrays of the exact length
                const startIndexes = new Uint32Array(limit);
                const endIndexes = new Uint32Array(limit);
                for (let i = this._length - 1, k = 0; i >= 0; i--) {
                    const startIndex = this._startIndexes[i];
                    const lineContent = model.getLineContent(startIndex);
                    const indent = (0, utils_1.computeIndentLevel)(lineContent, tabSize);
                    if (indent < maxIndent || (indent === maxIndent && entries++ < limit)) {
                        startIndexes[k] = startIndex;
                        endIndexes[k] = this._endIndexes[i];
                        k++;
                    }
                }
                return new foldingRanges_1.FoldingRegions(startIndexes, endIndexes);
            }
        }
    }
    exports.RangesCollector = RangesCollector;
    const foldingRangesLimitDefault = {
        limit: MAX_FOLDING_REGIONS_FOR_INDENT_DEFAULT,
        update: () => { }
    };
    function computeRanges(model, offSide, markers, foldingRangesLimit = foldingRangesLimitDefault) {
        const tabSize = model.getOptions().tabSize;
        const result = new RangesCollector(foldingRangesLimit);
        let pattern = undefined;
        if (markers) {
            pattern = new RegExp(`(${markers.start.source})|(?:${markers.end.source})`);
        }
        const previousRegions = [];
        const line = model.getLineCount() + 1;
        previousRegions.push({ indent: -1, endAbove: line, line }); // sentinel, to make sure there's at least one entry
        for (let line = model.getLineCount(); line > 0; line--) {
            const lineContent = model.getLineContent(line);
            const indent = (0, utils_1.computeIndentLevel)(lineContent, tabSize);
            let previous = previousRegions[previousRegions.length - 1];
            if (indent === -1) {
                if (offSide) {
                    // for offSide languages, empty lines are associated to the previous block
                    // note: the next block is already written to the results, so this only
                    // impacts the end position of the block before
                    previous.endAbove = line;
                }
                continue; // only whitespace
            }
            let m;
            if (pattern && (m = lineContent.match(pattern))) {
                // folding pattern match
                if (m[1]) { // start pattern match
                    // discard all regions until the folding pattern
                    let i = previousRegions.length - 1;
                    while (i > 0 && previousRegions[i].indent !== -2) {
                        i--;
                    }
                    if (i > 0) {
                        previousRegions.length = i + 1;
                        previous = previousRegions[i];
                        // new folding range from pattern, includes the end line
                        result.insertFirst(line, previous.line, indent);
                        previous.line = line;
                        previous.indent = indent;
                        previous.endAbove = line;
                        continue;
                    }
                    else {
                        // no end marker found, treat line as a regular line
                    }
                }
                else { // end pattern match
                    previousRegions.push({ indent: -2, endAbove: line, line });
                    continue;
                }
            }
            if (previous.indent > indent) {
                // discard all regions with larger indent
                do {
                    previousRegions.pop();
                    previous = previousRegions[previousRegions.length - 1];
                } while (previous.indent > indent);
                // new folding range
                const endLineNumber = previous.endAbove - 1;
                if (endLineNumber - line >= 1) { // needs at east size 1
                    result.insertFirst(line, endLineNumber, indent);
                }
            }
            if (previous.indent === indent) {
                previous.endAbove = line;
            }
            else { // previous.indent < indent
                // new region with a bigger indent
                previousRegions.push({ indent, endAbove: line, line });
            }
        }
        return result.toIndentRanges(model);
    }
    exports.computeRanges = computeRanges;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZW50UmFuZ2VQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2ZvbGRpbmcvYnJvd3Nlci9pbmRlbnRSYW5nZVByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVVoRyxNQUFNLHNDQUFzQyxHQUFHLElBQUksQ0FBQztJQUVwRCxNQUFNLGtCQUFrQixHQUFHLFFBQVEsQ0FBQztJQUVwQyxNQUFhLG1CQUFtQjtRQUcvQixZQUNrQixXQUF1QixFQUN2Qiw0QkFBMkQsRUFDM0Qsa0JBQXdDO1lBRnhDLGdCQUFXLEdBQVgsV0FBVyxDQUFZO1lBQ3ZCLGlDQUE0QixHQUE1Qiw0QkFBNEIsQ0FBK0I7WUFDM0QsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFzQjtZQUxqRCxPQUFFLEdBQUcsa0JBQWtCLENBQUM7UUFNN0IsQ0FBQztRQUVMLE9BQU8sS0FBSyxDQUFDO1FBRWIsT0FBTyxDQUFDLGdCQUFtQztZQUMxQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsNEJBQTRCLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQztZQUMvSCxNQUFNLE9BQU8sR0FBRyxZQUFZLElBQUksQ0FBQyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUM7WUFDdkQsTUFBTSxPQUFPLEdBQUcsWUFBWSxJQUFJLFlBQVksQ0FBQyxPQUFPLENBQUM7WUFDckQsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztRQUNwRyxDQUFDO0tBQ0Q7SUFqQkQsa0RBaUJDO0lBRUQsMEJBQTBCO0lBQzFCLE1BQWEsZUFBZTtRQU8zQixZQUFZLGtCQUF3QztZQUNuRCxJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztZQUN4QixJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztZQUN0QixJQUFJLENBQUMsa0JBQWtCLEdBQUcsRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxrQkFBa0IsQ0FBQztRQUMvQyxDQUFDO1FBRU0sV0FBVyxDQUFDLGVBQXVCLEVBQUUsYUFBcUIsRUFBRSxNQUFjO1lBQ2hGLElBQUksZUFBZSxHQUFHLCtCQUFlLElBQUksYUFBYSxHQUFHLCtCQUFlLEVBQUU7Z0JBQ3pFLE9BQU87YUFDUDtZQUNELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDM0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FBRyxlQUFlLENBQUM7WUFDNUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxhQUFhLENBQUM7WUFDeEMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2YsSUFBSSxNQUFNLEdBQUcsSUFBSSxFQUFFO2dCQUNsQixJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQzdFO1FBQ0YsQ0FBQztRQUVNLGNBQWMsQ0FBQyxLQUFpQjtZQUN0QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDO1lBQzdDLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxLQUFLLEVBQUU7Z0JBQzFCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFFckQsZ0RBQWdEO2dCQUNoRCxNQUFNLFlBQVksR0FBRyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ25ELE1BQU0sVUFBVSxHQUFHLElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDakQsS0FBSyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3ZELFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN4QyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDcEM7Z0JBQ0QsT0FBTyxJQUFJLDhCQUFjLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2FBQ3BEO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFFckQsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO2dCQUNoQixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDO2dCQUMvQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDeEQsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNyQyxJQUFJLENBQUMsRUFBRTt3QkFDTixJQUFJLENBQUMsR0FBRyxPQUFPLEdBQUcsS0FBSyxFQUFFOzRCQUN4QixTQUFTLEdBQUcsQ0FBQyxDQUFDOzRCQUNkLE1BQU07eUJBQ047d0JBQ0QsT0FBTyxJQUFJLENBQUMsQ0FBQztxQkFDYjtpQkFDRDtnQkFDRCxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUMsT0FBTyxDQUFDO2dCQUMzQyxnREFBZ0Q7Z0JBQ2hELE1BQU0sWUFBWSxHQUFHLElBQUksV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM1QyxNQUFNLFVBQVUsR0FBRyxJQUFJLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDMUMsS0FBSyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ2xELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3pDLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQ3JELE1BQU0sTUFBTSxHQUFHLElBQUEsMEJBQWtCLEVBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO29CQUN4RCxJQUFJLE1BQU0sR0FBRyxTQUFTLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxJQUFJLE9BQU8sRUFBRSxHQUFHLEtBQUssQ0FBQyxFQUFFO3dCQUN0RSxZQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDO3dCQUM3QixVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDcEMsQ0FBQyxFQUFFLENBQUM7cUJBQ0o7aUJBQ0Q7Z0JBQ0QsT0FBTyxJQUFJLDhCQUFjLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2FBQ3BEO1FBRUYsQ0FBQztLQUNEO0lBMUVELDBDQTBFQztJQVNELE1BQU0seUJBQXlCLEdBQXlCO1FBQ3ZELEtBQUssRUFBRSxzQ0FBc0M7UUFDN0MsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7S0FDakIsQ0FBQztJQUVGLFNBQWdCLGFBQWEsQ0FBQyxLQUFpQixFQUFFLE9BQWdCLEVBQUUsT0FBd0IsRUFBRSxxQkFBMkMseUJBQXlCO1FBQ2hLLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxPQUFPLENBQUM7UUFDM0MsTUFBTSxNQUFNLEdBQUcsSUFBSSxlQUFlLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUV2RCxJQUFJLE9BQU8sR0FBdUIsU0FBUyxDQUFDO1FBQzVDLElBQUksT0FBTyxFQUFFO1lBQ1osT0FBTyxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLFFBQVEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1NBQzVFO1FBRUQsTUFBTSxlQUFlLEdBQXFCLEVBQUUsQ0FBQztRQUM3QyxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3RDLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsb0RBQW9EO1FBRWhILEtBQUssSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLFlBQVksRUFBRSxFQUFFLElBQUksR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUU7WUFDdkQsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMvQyxNQUFNLE1BQU0sR0FBRyxJQUFBLDBCQUFrQixFQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN4RCxJQUFJLFFBQVEsR0FBRyxlQUFlLENBQUMsZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMzRCxJQUFJLE1BQU0sS0FBSyxDQUFDLENBQUMsRUFBRTtnQkFDbEIsSUFBSSxPQUFPLEVBQUU7b0JBQ1osMEVBQTBFO29CQUMxRSx1RUFBdUU7b0JBQ3ZFLCtDQUErQztvQkFDL0MsUUFBUSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7aUJBQ3pCO2dCQUNELFNBQVMsQ0FBQyxrQkFBa0I7YUFDNUI7WUFDRCxJQUFJLENBQUMsQ0FBQztZQUNOLElBQUksT0FBTyxJQUFJLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRTtnQkFDaEQsd0JBQXdCO2dCQUN4QixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLHNCQUFzQjtvQkFDakMsZ0RBQWdEO29CQUNoRCxJQUFJLENBQUMsR0FBRyxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztvQkFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLEVBQUU7d0JBQ2pELENBQUMsRUFBRSxDQUFDO3FCQUNKO29CQUNELElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTt3QkFDVixlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQy9CLFFBQVEsR0FBRyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBRTlCLHdEQUF3RDt3QkFDeEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQzt3QkFDaEQsUUFBUSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7d0JBQ3JCLFFBQVEsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO3dCQUN6QixRQUFRLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQzt3QkFDekIsU0FBUztxQkFDVDt5QkFBTTt3QkFDTixvREFBb0Q7cUJBQ3BEO2lCQUNEO3FCQUFNLEVBQUUsb0JBQW9CO29CQUM1QixlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztvQkFDM0QsU0FBUztpQkFDVDthQUNEO1lBQ0QsSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLE1BQU0sRUFBRTtnQkFDN0IseUNBQXlDO2dCQUN6QyxHQUFHO29CQUNGLGVBQWUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztvQkFDdEIsUUFBUSxHQUFHLGVBQWUsQ0FBQyxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO2lCQUN2RCxRQUFRLFFBQVEsQ0FBQyxNQUFNLEdBQUcsTUFBTSxFQUFFO2dCQUVuQyxvQkFBb0I7Z0JBQ3BCLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO2dCQUM1QyxJQUFJLGFBQWEsR0FBRyxJQUFJLElBQUksQ0FBQyxFQUFFLEVBQUUsdUJBQXVCO29CQUN2RCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7aUJBQ2hEO2FBQ0Q7WUFDRCxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssTUFBTSxFQUFFO2dCQUMvQixRQUFRLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQzthQUN6QjtpQkFBTSxFQUFFLDJCQUEyQjtnQkFDbkMsa0NBQWtDO2dCQUNsQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQzthQUN2RDtTQUNEO1FBQ0QsT0FBTyxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUExRUQsc0NBMEVDIn0=