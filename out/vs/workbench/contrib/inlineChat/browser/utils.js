/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/lineRange", "vs/editor/common/core/range"], function (require, exports, lineRange_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.lineRangeAsRange = exports.invertLineRange = void 0;
    function invertLineRange(range, model) {
        if (range.isEmpty) {
            return [];
        }
        const result = [];
        result.push(new lineRange_1.LineRange(1, range.startLineNumber));
        result.push(new lineRange_1.LineRange(range.endLineNumberExclusive, model.getLineCount() + 1));
        return result.filter(r => !r.isEmpty);
    }
    exports.invertLineRange = invertLineRange;
    function lineRangeAsRange(r) {
        return new range_1.Range(r.startLineNumber, 1, r.endLineNumberExclusive - 1, 1);
    }
    exports.lineRangeAsRange = lineRangeAsRange;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9pbmxpbmVDaGF0L2Jyb3dzZXIvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLFNBQWdCLGVBQWUsQ0FBQyxLQUFnQixFQUFFLEtBQWlCO1FBQ2xFLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRTtZQUNsQixPQUFPLEVBQUUsQ0FBQztTQUNWO1FBQ0QsTUFBTSxNQUFNLEdBQWdCLEVBQUUsQ0FBQztRQUMvQixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7UUFDckQsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLHFCQUFTLENBQUMsS0FBSyxDQUFDLHNCQUFzQixFQUFFLEtBQUssQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25GLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFSRCwwQ0FRQztJQUVELFNBQWdCLGdCQUFnQixDQUFDLENBQVk7UUFDNUMsT0FBTyxJQUFJLGFBQUssQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsc0JBQXNCLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFGRCw0Q0FFQyJ9