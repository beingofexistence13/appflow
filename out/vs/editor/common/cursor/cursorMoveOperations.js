/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/core/cursorColumns", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/cursor/cursorAtomicMoveOperations", "vs/editor/common/cursorCommon"], function (require, exports, strings, cursorColumns_1, position_1, range_1, cursorAtomicMoveOperations_1, cursorCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MoveOperations = exports.CursorPosition = void 0;
    class CursorPosition {
        constructor(lineNumber, column, leftoverVisibleColumns) {
            this._cursorPositionBrand = undefined;
            this.lineNumber = lineNumber;
            this.column = column;
            this.leftoverVisibleColumns = leftoverVisibleColumns;
        }
    }
    exports.CursorPosition = CursorPosition;
    class MoveOperations {
        static leftPosition(model, position) {
            if (position.column > model.getLineMinColumn(position.lineNumber)) {
                return position.delta(undefined, -strings.prevCharLength(model.getLineContent(position.lineNumber), position.column - 1));
            }
            else if (position.lineNumber > 1) {
                const newLineNumber = position.lineNumber - 1;
                return new position_1.Position(newLineNumber, model.getLineMaxColumn(newLineNumber));
            }
            else {
                return position;
            }
        }
        static leftPositionAtomicSoftTabs(model, position, tabSize) {
            if (position.column <= model.getLineIndentColumn(position.lineNumber)) {
                const minColumn = model.getLineMinColumn(position.lineNumber);
                const lineContent = model.getLineContent(position.lineNumber);
                const newPosition = cursorAtomicMoveOperations_1.AtomicTabMoveOperations.atomicPosition(lineContent, position.column - 1, tabSize, 0 /* Direction.Left */);
                if (newPosition !== -1 && newPosition + 1 >= minColumn) {
                    return new position_1.Position(position.lineNumber, newPosition + 1);
                }
            }
            return this.leftPosition(model, position);
        }
        static left(config, model, position) {
            const pos = config.stickyTabStops
                ? MoveOperations.leftPositionAtomicSoftTabs(model, position, config.tabSize)
                : MoveOperations.leftPosition(model, position);
            return new CursorPosition(pos.lineNumber, pos.column, 0);
        }
        /**
         * @param noOfColumns Must be either `1`
         * or `Math.round(viewModel.getLineContent(viewLineNumber).length / 2)` (for half lines).
        */
        static moveLeft(config, model, cursor, inSelectionMode, noOfColumns) {
            let lineNumber, column;
            if (cursor.hasSelection() && !inSelectionMode) {
                // If the user has a selection and does not want to extend it,
                // put the cursor at the beginning of the selection.
                lineNumber = cursor.selection.startLineNumber;
                column = cursor.selection.startColumn;
            }
            else {
                // This has no effect if noOfColumns === 1.
                // It is ok to do so in the half-line scenario.
                const pos = cursor.position.delta(undefined, -(noOfColumns - 1));
                // We clip the position before normalization, as normalization is not defined
                // for possibly negative columns.
                const normalizedPos = model.normalizePosition(MoveOperations.clipPositionColumn(pos, model), 0 /* PositionAffinity.Left */);
                const p = MoveOperations.left(config, model, normalizedPos);
                lineNumber = p.lineNumber;
                column = p.column;
            }
            return cursor.move(inSelectionMode, lineNumber, column, 0);
        }
        /**
         * Adjusts the column so that it is within min/max of the line.
        */
        static clipPositionColumn(position, model) {
            return new position_1.Position(position.lineNumber, MoveOperations.clipRange(position.column, model.getLineMinColumn(position.lineNumber), model.getLineMaxColumn(position.lineNumber)));
        }
        static clipRange(value, min, max) {
            if (value < min) {
                return min;
            }
            if (value > max) {
                return max;
            }
            return value;
        }
        static rightPosition(model, lineNumber, column) {
            if (column < model.getLineMaxColumn(lineNumber)) {
                column = column + strings.nextCharLength(model.getLineContent(lineNumber), column - 1);
            }
            else if (lineNumber < model.getLineCount()) {
                lineNumber = lineNumber + 1;
                column = model.getLineMinColumn(lineNumber);
            }
            return new position_1.Position(lineNumber, column);
        }
        static rightPositionAtomicSoftTabs(model, lineNumber, column, tabSize, indentSize) {
            if (column < model.getLineIndentColumn(lineNumber)) {
                const lineContent = model.getLineContent(lineNumber);
                const newPosition = cursorAtomicMoveOperations_1.AtomicTabMoveOperations.atomicPosition(lineContent, column - 1, tabSize, 1 /* Direction.Right */);
                if (newPosition !== -1) {
                    return new position_1.Position(lineNumber, newPosition + 1);
                }
            }
            return this.rightPosition(model, lineNumber, column);
        }
        static right(config, model, position) {
            const pos = config.stickyTabStops
                ? MoveOperations.rightPositionAtomicSoftTabs(model, position.lineNumber, position.column, config.tabSize, config.indentSize)
                : MoveOperations.rightPosition(model, position.lineNumber, position.column);
            return new CursorPosition(pos.lineNumber, pos.column, 0);
        }
        static moveRight(config, model, cursor, inSelectionMode, noOfColumns) {
            let lineNumber, column;
            if (cursor.hasSelection() && !inSelectionMode) {
                // If we are in selection mode, move right without selection cancels selection and puts cursor at the end of the selection
                lineNumber = cursor.selection.endLineNumber;
                column = cursor.selection.endColumn;
            }
            else {
                const pos = cursor.position.delta(undefined, noOfColumns - 1);
                const normalizedPos = model.normalizePosition(MoveOperations.clipPositionColumn(pos, model), 1 /* PositionAffinity.Right */);
                const r = MoveOperations.right(config, model, normalizedPos);
                lineNumber = r.lineNumber;
                column = r.column;
            }
            return cursor.move(inSelectionMode, lineNumber, column, 0);
        }
        static vertical(config, model, lineNumber, column, leftoverVisibleColumns, newLineNumber, allowMoveOnEdgeLine, normalizationAffinity) {
            const currentVisibleColumn = cursorColumns_1.CursorColumns.visibleColumnFromColumn(model.getLineContent(lineNumber), column, config.tabSize) + leftoverVisibleColumns;
            const lineCount = model.getLineCount();
            const wasOnFirstPosition = (lineNumber === 1 && column === 1);
            const wasOnLastPosition = (lineNumber === lineCount && column === model.getLineMaxColumn(lineNumber));
            const wasAtEdgePosition = (newLineNumber < lineNumber ? wasOnFirstPosition : wasOnLastPosition);
            lineNumber = newLineNumber;
            if (lineNumber < 1) {
                lineNumber = 1;
                if (allowMoveOnEdgeLine) {
                    column = model.getLineMinColumn(lineNumber);
                }
                else {
                    column = Math.min(model.getLineMaxColumn(lineNumber), column);
                }
            }
            else if (lineNumber > lineCount) {
                lineNumber = lineCount;
                if (allowMoveOnEdgeLine) {
                    column = model.getLineMaxColumn(lineNumber);
                }
                else {
                    column = Math.min(model.getLineMaxColumn(lineNumber), column);
                }
            }
            else {
                column = config.columnFromVisibleColumn(model, lineNumber, currentVisibleColumn);
            }
            if (wasAtEdgePosition) {
                leftoverVisibleColumns = 0;
            }
            else {
                leftoverVisibleColumns = currentVisibleColumn - cursorColumns_1.CursorColumns.visibleColumnFromColumn(model.getLineContent(lineNumber), column, config.tabSize);
            }
            if (normalizationAffinity !== undefined) {
                const position = new position_1.Position(lineNumber, column);
                const newPosition = model.normalizePosition(position, normalizationAffinity);
                leftoverVisibleColumns = leftoverVisibleColumns + (column - newPosition.column);
                lineNumber = newPosition.lineNumber;
                column = newPosition.column;
            }
            return new CursorPosition(lineNumber, column, leftoverVisibleColumns);
        }
        static down(config, model, lineNumber, column, leftoverVisibleColumns, count, allowMoveOnLastLine) {
            return this.vertical(config, model, lineNumber, column, leftoverVisibleColumns, lineNumber + count, allowMoveOnLastLine, 4 /* PositionAffinity.RightOfInjectedText */);
        }
        static moveDown(config, model, cursor, inSelectionMode, linesCount) {
            let lineNumber, column;
            if (cursor.hasSelection() && !inSelectionMode) {
                // If we are in selection mode, move down acts relative to the end of selection
                lineNumber = cursor.selection.endLineNumber;
                column = cursor.selection.endColumn;
            }
            else {
                lineNumber = cursor.position.lineNumber;
                column = cursor.position.column;
            }
            let i = 0;
            let r;
            do {
                r = MoveOperations.down(config, model, lineNumber + i, column, cursor.leftoverVisibleColumns, linesCount, true);
                const np = model.normalizePosition(new position_1.Position(r.lineNumber, r.column), 2 /* PositionAffinity.None */);
                if (np.lineNumber > lineNumber) {
                    break;
                }
            } while (i++ < 10 && lineNumber + i < model.getLineCount());
            return cursor.move(inSelectionMode, r.lineNumber, r.column, r.leftoverVisibleColumns);
        }
        static translateDown(config, model, cursor) {
            const selection = cursor.selection;
            const selectionStart = MoveOperations.down(config, model, selection.selectionStartLineNumber, selection.selectionStartColumn, cursor.selectionStartLeftoverVisibleColumns, 1, false);
            const position = MoveOperations.down(config, model, selection.positionLineNumber, selection.positionColumn, cursor.leftoverVisibleColumns, 1, false);
            return new cursorCommon_1.SingleCursorState(new range_1.Range(selectionStart.lineNumber, selectionStart.column, selectionStart.lineNumber, selectionStart.column), 0 /* SelectionStartKind.Simple */, selectionStart.leftoverVisibleColumns, new position_1.Position(position.lineNumber, position.column), position.leftoverVisibleColumns);
        }
        static up(config, model, lineNumber, column, leftoverVisibleColumns, count, allowMoveOnFirstLine) {
            return this.vertical(config, model, lineNumber, column, leftoverVisibleColumns, lineNumber - count, allowMoveOnFirstLine, 3 /* PositionAffinity.LeftOfInjectedText */);
        }
        static moveUp(config, model, cursor, inSelectionMode, linesCount) {
            let lineNumber, column;
            if (cursor.hasSelection() && !inSelectionMode) {
                // If we are in selection mode, move up acts relative to the beginning of selection
                lineNumber = cursor.selection.startLineNumber;
                column = cursor.selection.startColumn;
            }
            else {
                lineNumber = cursor.position.lineNumber;
                column = cursor.position.column;
            }
            const r = MoveOperations.up(config, model, lineNumber, column, cursor.leftoverVisibleColumns, linesCount, true);
            return cursor.move(inSelectionMode, r.lineNumber, r.column, r.leftoverVisibleColumns);
        }
        static translateUp(config, model, cursor) {
            const selection = cursor.selection;
            const selectionStart = MoveOperations.up(config, model, selection.selectionStartLineNumber, selection.selectionStartColumn, cursor.selectionStartLeftoverVisibleColumns, 1, false);
            const position = MoveOperations.up(config, model, selection.positionLineNumber, selection.positionColumn, cursor.leftoverVisibleColumns, 1, false);
            return new cursorCommon_1.SingleCursorState(new range_1.Range(selectionStart.lineNumber, selectionStart.column, selectionStart.lineNumber, selectionStart.column), 0 /* SelectionStartKind.Simple */, selectionStart.leftoverVisibleColumns, new position_1.Position(position.lineNumber, position.column), position.leftoverVisibleColumns);
        }
        static _isBlankLine(model, lineNumber) {
            if (model.getLineFirstNonWhitespaceColumn(lineNumber) === 0) {
                // empty or contains only whitespace
                return true;
            }
            return false;
        }
        static moveToPrevBlankLine(config, model, cursor, inSelectionMode) {
            let lineNumber = cursor.position.lineNumber;
            // If our current line is blank, move to the previous non-blank line
            while (lineNumber > 1 && this._isBlankLine(model, lineNumber)) {
                lineNumber--;
            }
            // Find the previous blank line
            while (lineNumber > 1 && !this._isBlankLine(model, lineNumber)) {
                lineNumber--;
            }
            return cursor.move(inSelectionMode, lineNumber, model.getLineMinColumn(lineNumber), 0);
        }
        static moveToNextBlankLine(config, model, cursor, inSelectionMode) {
            const lineCount = model.getLineCount();
            let lineNumber = cursor.position.lineNumber;
            // If our current line is blank, move to the next non-blank line
            while (lineNumber < lineCount && this._isBlankLine(model, lineNumber)) {
                lineNumber++;
            }
            // Find the next blank line
            while (lineNumber < lineCount && !this._isBlankLine(model, lineNumber)) {
                lineNumber++;
            }
            return cursor.move(inSelectionMode, lineNumber, model.getLineMinColumn(lineNumber), 0);
        }
        static moveToBeginningOfLine(config, model, cursor, inSelectionMode) {
            const lineNumber = cursor.position.lineNumber;
            const minColumn = model.getLineMinColumn(lineNumber);
            const firstNonBlankColumn = model.getLineFirstNonWhitespaceColumn(lineNumber) || minColumn;
            let column;
            const relevantColumnNumber = cursor.position.column;
            if (relevantColumnNumber === firstNonBlankColumn) {
                column = minColumn;
            }
            else {
                column = firstNonBlankColumn;
            }
            return cursor.move(inSelectionMode, lineNumber, column, 0);
        }
        static moveToEndOfLine(config, model, cursor, inSelectionMode, sticky) {
            const lineNumber = cursor.position.lineNumber;
            const maxColumn = model.getLineMaxColumn(lineNumber);
            return cursor.move(inSelectionMode, lineNumber, maxColumn, sticky ? 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */ - maxColumn : 0);
        }
        static moveToBeginningOfBuffer(config, model, cursor, inSelectionMode) {
            return cursor.move(inSelectionMode, 1, 1, 0);
        }
        static moveToEndOfBuffer(config, model, cursor, inSelectionMode) {
            const lastLineNumber = model.getLineCount();
            const lastColumn = model.getLineMaxColumn(lastLineNumber);
            return cursor.move(inSelectionMode, lastLineNumber, lastColumn, 0);
        }
    }
    exports.MoveOperations = MoveOperations;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Vyc29yTW92ZU9wZXJhdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL2N1cnNvci9jdXJzb3JNb3ZlT3BlcmF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFXaEcsTUFBYSxjQUFjO1FBTzFCLFlBQVksVUFBa0IsRUFBRSxNQUFjLEVBQUUsc0JBQThCO1lBTjlFLHlCQUFvQixHQUFTLFNBQVMsQ0FBQztZQU90QyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztZQUM3QixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUNyQixJQUFJLENBQUMsc0JBQXNCLEdBQUcsc0JBQXNCLENBQUM7UUFDdEQsQ0FBQztLQUNEO0lBWkQsd0NBWUM7SUFFRCxNQUFhLGNBQWM7UUFDbkIsTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUF5QixFQUFFLFFBQWtCO1lBQ3ZFLElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUNsRSxPQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDMUg7aUJBQU0sSUFBSSxRQUFRLENBQUMsVUFBVSxHQUFHLENBQUMsRUFBRTtnQkFDbkMsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7Z0JBQzlDLE9BQU8sSUFBSSxtQkFBUSxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQzthQUMxRTtpQkFBTTtnQkFD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