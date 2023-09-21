/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/editor/common/core/range"], function (require, exports, arrays_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LineEdits = exports.RangeEdit = exports.LineRangeEdit = void 0;
    /**
     * Represents an edit, expressed in whole lines:
     * At (before) {@link LineRange.startLineNumber}, delete {@link LineRange.lineCount} many lines and insert {@link newLines}.
    */
    class LineRangeEdit {
        constructor(range, newLines) {
            this.range = range;
            this.newLines = newLines;
        }
        equals(other) {
            return this.range.equals(other.range) && (0, arrays_1.equals)(this.newLines, other.newLines);
        }
        toEdits(modelLineCount) {
            return new LineEdits([this]).toEdits(modelLineCount);
        }
    }
    exports.LineRangeEdit = LineRangeEdit;
    class RangeEdit {
        constructor(range, newText) {
            this.range = range;
            this.newText = newText;
        }
        equals(other) {
            return range_1.Range.equalsRange(this.range, other.range) && this.newText === other.newText;
        }
    }
    exports.RangeEdit = RangeEdit;
    class LineEdits {
        constructor(edits) {
            this.edits = edits;
        }
        toEdits(modelLineCount) {
            return this.edits.map((e) => {
                if (e.range.endLineNumberExclusive <= modelLineCount) {
                    return {
                        range: new range_1.Range(e.range.startLineNumber, 1, e.range.endLineNumberExclusive, 1),
                        text: e.newLines.map(s => s + '\n').join(''),
                    };
                }
                if (e.range.startLineNumber === 1) {
                    return {
                        range: new range_1.Range(1, 1, modelLineCount, Number.MAX_SAFE_INTEGER),
                        text: e.newLines.join('\n'),
                    };
                }
                return {
                    range: new range_1.Range(e.range.startLineNumber - 1, Number.MAX_SAFE_INTEGER, modelLineCount, Number.MAX_SAFE_INTEGER),
                    text: e.newLines.map(s => '\n' + s).join(''),
                };
            });
        }
    }
    exports.LineEdits = LineEdits;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdGluZy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL21lcmdlRWRpdG9yL2Jyb3dzZXIvbW9kZWwvZWRpdGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFPaEc7OztNQUdFO0lBQ0YsTUFBYSxhQUFhO1FBQ3pCLFlBQ2lCLEtBQWdCLEVBQ2hCLFFBQWtCO1lBRGxCLFVBQUssR0FBTCxLQUFLLENBQVc7WUFDaEIsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUMvQixDQUFDO1FBRUUsTUFBTSxDQUFDLEtBQW9CO1lBQ2pDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUEsZUFBTSxFQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7UUFFTSxPQUFPLENBQUMsY0FBc0I7WUFDcEMsT0FBTyxJQUFJLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3RELENBQUM7S0FDRDtJQWJELHNDQWFDO0lBRUQsTUFBYSxTQUFTO1FBQ3JCLFlBQ2lCLEtBQVksRUFDWixPQUFlO1lBRGYsVUFBSyxHQUFMLEtBQUssQ0FBTztZQUNaLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDNUIsQ0FBQztRQUVFLE1BQU0sQ0FBQyxLQUFnQjtZQUM3QixPQUFPLGFBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxLQUFLLENBQUMsT0FBTyxDQUFDO1FBQ3JGLENBQUM7S0FDRDtJQVRELDhCQVNDO0lBRUQsTUFBYSxTQUFTO1FBQ3JCLFlBQTRCLEtBQStCO1lBQS9CLFVBQUssR0FBTCxLQUFLLENBQTBCO1FBQUksQ0FBQztRQUV6RCxPQUFPLENBQUMsY0FBc0I7WUFDcEMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUMzQixJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsc0JBQXNCLElBQUksY0FBYyxFQUFFO29CQUNyRCxPQUFPO3dCQUNOLEtBQUssRUFBRSxJQUFJLGFBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUM7d0JBQy9FLElBQUksRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO3FCQUM1QyxDQUFDO2lCQUNGO2dCQUVELElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxlQUFlLEtBQUssQ0FBQyxFQUFFO29CQUNsQyxPQUFPO3dCQUNOLEtBQUssRUFBRSxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLGNBQWMsRUFBRSxNQUFNLENBQUMsZ0JBQWdCLENBQUM7d0JBQy9ELElBQUksRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7cUJBQzNCLENBQUM7aUJBQ0Y7Z0JBRUQsT0FBTztvQkFDTixLQUFLLEVBQUUsSUFBSSxhQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxjQUFjLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixDQUFDO29CQUMvRyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztpQkFDNUMsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztLQUNEO0lBekJELDhCQXlCQyJ9