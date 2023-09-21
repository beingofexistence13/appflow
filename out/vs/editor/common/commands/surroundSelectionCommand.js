/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/range", "vs/editor/common/core/selection"], function (require, exports, range_1, selection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CompositionSurroundSelectionCommand = exports.SurroundSelectionCommand = void 0;
    class SurroundSelectionCommand {
        constructor(range, charBeforeSelection, charAfterSelection) {
            this._range = range;
            this._charBeforeSelection = charBeforeSelection;
            this._charAfterSelection = charAfterSelection;
        }
        getEditOperations(model, builder) {
            builder.addTrackedEditOperation(new range_1.Range(this._range.startLineNumber, this._range.startColumn, this._range.startLineNumber, this._range.startColumn), this._charBeforeSelection);
            builder.addTrackedEditOperation(new range_1.Range(this._range.endLineNumber, this._range.endColumn, this._range.endLineNumber, this._range.endColumn), this._charAfterSelection);
        }
        computeCursorState(model, helper) {
            const inverseEditOperations = helper.getInverseEditOperations();
            const firstOperationRange = inverseEditOperations[0].range;
            const secondOperationRange = inverseEditOperations[1].range;
            return new selection_1.Selection(firstOperationRange.endLineNumber, firstOperationRange.endColumn, secondOperationRange.endLineNumber, secondOperationRange.endColumn - this._charAfterSelection.length);
        }
    }
    exports.SurroundSelectionCommand = SurroundSelectionCommand;
    /**
     * A surround selection command that runs after composition finished.
     */
    class CompositionSurroundSelectionCommand {
        constructor(_position, _text, _charAfter) {
            this._position = _position;
            this._text = _text;
            this._charAfter = _charAfter;
        }
        getEditOperations(model, builder) {
            builder.addTrackedEditOperation(new range_1.Range(this._position.lineNumber, this._position.column, this._position.lineNumber, this._position.column), this._text + this._charAfter);
        }
        computeCursorState(model, helper) {
            const inverseEditOperations = helper.getInverseEditOperations();
            const opRange = inverseEditOperations[0].range;
            return new selection_1.Selection(opRange.endLineNumber, opRange.startColumn, opRange.endLineNumber, opRange.endColumn - this._charAfter.length);
        }
    }
    exports.CompositionSurroundSelectionCommand = CompositionSurroundSelectionCommand;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Vycm91bmRTZWxlY3Rpb25Db21tYW5kLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9jb21tYW5kcy9zdXJyb3VuZFNlbGVjdGlvbkNvbW1hbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLE1BQWEsd0JBQXdCO1FBS3BDLFlBQVksS0FBZ0IsRUFBRSxtQkFBMkIsRUFBRSxrQkFBMEI7WUFDcEYsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFDcEIsSUFBSSxDQUFDLG9CQUFvQixHQUFHLG1CQUFtQixDQUFDO1lBQ2hELElBQUksQ0FBQyxtQkFBbUIsR0FBRyxrQkFBa0IsQ0FBQztRQUMvQyxDQUFDO1FBRU0saUJBQWlCLENBQUMsS0FBaUIsRUFBRSxPQUE4QjtZQUN6RSxPQUFPLENBQUMsdUJBQXVCLENBQUMsSUFBSSxhQUFLLENBQ3hDLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUMzQixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFDdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQzNCLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUN2QixFQUFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBRTlCLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLGFBQUssQ0FDeEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUNyQixJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFDekIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQ3JCLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDOUIsQ0FBQztRQUVNLGtCQUFrQixDQUFDLEtBQWlCLEVBQUUsTUFBZ0M7WUFDNUUsTUFBTSxxQkFBcUIsR0FBRyxNQUFNLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztZQUNoRSxNQUFNLG1CQUFtQixHQUFHLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUMzRCxNQUFNLG9CQUFvQixHQUFHLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUU1RCxPQUFPLElBQUkscUJBQVMsQ0FDbkIsbUJBQW1CLENBQUMsYUFBYSxFQUNqQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQzdCLG9CQUFvQixDQUFDLGFBQWEsRUFDbEMsb0JBQW9CLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQ2hFLENBQUM7UUFDSCxDQUFDO0tBQ0Q7SUF2Q0QsNERBdUNDO0lBRUQ7O09BRUc7SUFDSCxNQUFhLG1DQUFtQztRQUUvQyxZQUNrQixTQUFtQixFQUNuQixLQUFhLEVBQ2IsVUFBa0I7WUFGbEIsY0FBUyxHQUFULFNBQVMsQ0FBVTtZQUNuQixVQUFLLEdBQUwsS0FBSyxDQUFRO1lBQ2IsZUFBVSxHQUFWLFVBQVUsQ0FBUTtRQUNoQyxDQUFDO1FBRUUsaUJBQWlCLENBQUMsS0FBaUIsRUFBRSxPQUE4QjtZQUN6RSxPQUFPLENBQUMsdUJBQXVCLENBQUMsSUFBSSxhQUFLLENBQ3hDLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUN6QixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFDckIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQ3pCLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUNyQixFQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFFTSxrQkFBa0IsQ0FBQyxLQUFpQixFQUFFLE1BQWdDO1lBQzVFLE1BQU0scUJBQXFCLEdBQUcsTUFBTSxDQUFDLHdCQUF3QixFQUFFLENBQUM7WUFDaEUsTUFBTSxPQUFPLEdBQUcscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBRS9DLE9BQU8sSUFBSSxxQkFBUyxDQUNuQixPQUFPLENBQUMsYUFBYSxFQUNyQixPQUFPLENBQUMsV0FBVyxFQUNuQixPQUFPLENBQUMsYUFBYSxFQUNyQixPQUFPLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUMxQyxDQUFDO1FBQ0gsQ0FBQztLQUNEO0lBNUJELGtGQTRCQyJ9