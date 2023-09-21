/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/range"], function (require, exports, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReplaceAllCommand = void 0;
    class ReplaceAllCommand {
        constructor(editorSelection, ranges, replaceStrings) {
            this._editorSelection = editorSelection;
            this._ranges = ranges;
            this._replaceStrings = replaceStrings;
            this._trackedEditorSelectionId = null;
        }
        getEditOperations(model, builder) {
            if (this._ranges.length > 0) {
                // Collect all edit operations
                const ops = [];
                for (let i = 0; i < this._ranges.length; i++) {
                    ops.push({
                        range: this._ranges[i],
                        text: this._replaceStrings[i]
                    });
                }
                // Sort them in ascending order by range starts
                ops.sort((o1, o2) => {
                    return range_1.Range.compareRangesUsingStarts(o1.range, o2.range);
                });
                // Merge operations that touch each other
                const resultOps = [];
                let previousOp = ops[0];
                for (let i = 1; i < ops.length; i++) {
                    if (previousOp.range.endLineNumber === ops[i].range.startLineNumber && previousOp.range.endColumn === ops[i].range.startColumn) {
                        // These operations are one after another and can be merged
                        previousOp.range = previousOp.range.plusRange(ops[i].range);
                        previousOp.text = previousOp.text + ops[i].text;
                    }
                    else {
                        resultOps.push(previousOp);
                        previousOp = ops[i];
                    }
                }
                resultOps.push(previousOp);
                for (const op of resultOps) {
                    builder.addEditOperation(op.range, op.text);
                }
            }
            this._trackedEditorSelectionId = builder.trackSelection(this._editorSelection);
        }
        computeCursorState(model, helper) {
            return helper.getTrackedSelection(this._trackedEditorSelectionId);
        }
    }
    exports.ReplaceAllCommand = ReplaceAllCommand;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwbGFjZUFsbENvbW1hbmQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9maW5kL2Jyb3dzZXIvcmVwbGFjZUFsbENvbW1hbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBWWhHLE1BQWEsaUJBQWlCO1FBTzdCLFlBQVksZUFBMEIsRUFBRSxNQUFlLEVBQUUsY0FBd0I7WUFDaEYsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGVBQWUsQ0FBQztZQUN4QyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUN0QixJQUFJLENBQUMsZUFBZSxHQUFHLGNBQWMsQ0FBQztZQUN0QyxJQUFJLENBQUMseUJBQXlCLEdBQUcsSUFBSSxDQUFDO1FBQ3ZDLENBQUM7UUFFTSxpQkFBaUIsQ0FBQyxLQUFpQixFQUFFLE9BQThCO1lBQ3pFLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUM1Qiw4QkFBOEI7Z0JBQzlCLE1BQU0sR0FBRyxHQUFxQixFQUFFLENBQUM7Z0JBQ2pDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDN0MsR0FBRyxDQUFDLElBQUksQ0FBQzt3QkFDUixLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7d0JBQ3RCLElBQUksRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztxQkFDN0IsQ0FBQyxDQUFDO2lCQUNIO2dCQUVELCtDQUErQztnQkFDL0MsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRTtvQkFDbkIsT0FBTyxhQUFLLENBQUMsd0JBQXdCLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzNELENBQUMsQ0FBQyxDQUFDO2dCQUVILHlDQUF5QztnQkFDekMsTUFBTSxTQUFTLEdBQXFCLEVBQUUsQ0FBQztnQkFDdkMsSUFBSSxVQUFVLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDcEMsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLGFBQWEsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGVBQWUsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLFNBQVMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRTt3QkFDL0gsMkRBQTJEO3dCQUMzRCxVQUFVLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDNUQsVUFBVSxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7cUJBQ2hEO3lCQUFNO3dCQUNOLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7d0JBQzNCLFVBQVUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQ3BCO2lCQUNEO2dCQUNELFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBRTNCLEtBQUssTUFBTSxFQUFFLElBQUksU0FBUyxFQUFFO29CQUMzQixPQUFPLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQzVDO2FBQ0Q7WUFFRCxJQUFJLENBQUMseUJBQXlCLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUNoRixDQUFDO1FBRU0sa0JBQWtCLENBQUMsS0FBaUIsRUFBRSxNQUFnQztZQUM1RSxPQUFPLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMseUJBQTBCLENBQUMsQ0FBQztRQUNwRSxDQUFDO0tBQ0Q7SUF4REQsOENBd0RDIn0=