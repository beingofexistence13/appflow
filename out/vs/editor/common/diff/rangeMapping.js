/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/lineRange"], function (require, exports, lineRange_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RangeMapping = exports.DetailedLineRangeMapping = exports.LineRangeMapping = void 0;
    /**
     * Maps a line range in the original text model to a line range in the modified text model.
     */
    class LineRangeMapping {
        static inverse(mapping, originalLineCount, modifiedLineCount) {
            const result = [];
            let lastOriginalEndLineNumber = 1;
            let lastModifiedEndLineNumber = 1;
            for (const m of mapping) {
                const r = new DetailedLineRangeMapping(new lineRange_1.LineRange(lastOriginalEndLineNumber, m.original.startLineNumber), new lineRange_1.LineRange(lastModifiedEndLineNumber, m.modified.startLineNumber), undefined);
                if (!r.modified.isEmpty) {
                    result.push(r);
                }
                lastOriginalEndLineNumber = m.original.endLineNumberExclusive;
                lastModifiedEndLineNumber = m.modified.endLineNumberExclusive;
            }
            const r = new DetailedLineRangeMapping(new lineRange_1.LineRange(lastOriginalEndLineNumber, originalLineCount + 1), new lineRange_1.LineRange(lastModifiedEndLineNumber, modifiedLineCount + 1), undefined);
            if (!r.modified.isEmpty) {
                result.push(r);
            }
            return result;
        }
        constructor(originalRange, modifiedRange) {
            this.original = originalRange;
            this.modified = modifiedRange;
        }
        toString() {
            return `{${this.original.toString()}->${this.modified.toString()}}`;
        }
        flip() {
            return new LineRangeMapping(this.modified, this.original);
        }
        join(other) {
            return new LineRangeMapping(this.original.join(other.original), this.modified.join(other.modified));
        }
        get changedLineCount() {
            return Math.max(this.original.length, this.modified.length);
        }
    }
    exports.LineRangeMapping = LineRangeMapping;
    /**
     * Maps a line range in the original text model to a line range in the modified text model.
     * Also contains inner range mappings.
     */
    class DetailedLineRangeMapping extends LineRangeMapping {
        constructor(originalRange, modifiedRange, innerChanges) {
            super(originalRange, modifiedRange);
            this.innerChanges = innerChanges;
        }
        flip() {
            return new DetailedLineRangeMapping(this.modified, this.original, this.innerChanges?.map(c => c.flip()));
        }
    }
    exports.DetailedLineRangeMapping = DetailedLineRangeMapping;
    /**
     * Maps a range in the original text model to a range in the modified text model.
     */
    class RangeMapping {
        constructor(originalRange, modifiedRange) {
            this.originalRange = originalRange;
            this.modifiedRange = modifiedRange;
        }
        toString() {
            return `{${this.originalRange.toString()}->${this.modifiedRange.toString()}}`;
        }
        flip() {
            return new RangeMapping(this.modifiedRange, this.originalRange);
        }
    }
    exports.RangeMapping = RangeMapping;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZ2VNYXBwaW5nLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9kaWZmL3JhbmdlTWFwcGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFLaEc7O09BRUc7SUFDSCxNQUFhLGdCQUFnQjtRQUNyQixNQUFNLENBQUMsT0FBTyxDQUFDLE9BQTRDLEVBQUUsaUJBQXlCLEVBQUUsaUJBQXlCO1lBQ3ZILE1BQU0sTUFBTSxHQUErQixFQUFFLENBQUM7WUFDOUMsSUFBSSx5QkFBeUIsR0FBRyxDQUFDLENBQUM7WUFDbEMsSUFBSSx5QkFBeUIsR0FBRyxDQUFDLENBQUM7WUFFbEMsS0FBSyxNQUFNLENBQUMsSUFBSSxPQUFPLEVBQUU7Z0JBQ3hCLE1BQU0sQ0FBQyxHQUFHLElBQUksd0JBQXdCLENBQ3JDLElBQUkscUJBQVMsQ0FBQyx5QkFBeUIsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxFQUNwRSxJQUFJLHFCQUFTLENBQUMseUJBQXlCLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsRUFDcEUsU0FBUyxDQUNULENBQUM7Z0JBQ0YsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFO29CQUN4QixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNmO2dCQUNELHlCQUF5QixHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLENBQUM7Z0JBQzlELHlCQUF5QixHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLENBQUM7YUFDOUQ7WUFDRCxNQUFNLENBQUMsR0FBRyxJQUFJLHdCQUF3QixDQUNyQyxJQUFJLHFCQUFTLENBQUMseUJBQXlCLEVBQUUsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDLEVBQy9ELElBQUkscUJBQVMsQ0FBQyx5QkFBeUIsRUFB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