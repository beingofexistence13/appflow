/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/types", "vs/editor/common/cursorCommon", "vs/editor/common/cursor/cursorMoveOperations", "vs/editor/common/cursor/cursorWordOperations", "vs/editor/common/core/position", "vs/editor/common/core/range"], function (require, exports, types, cursorCommon_1, cursorMoveOperations_1, cursorWordOperations_1, position_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CursorMove = exports.CursorMoveCommands = void 0;
    class CursorMoveCommands {
        static addCursorDown(viewModel, cursors, useLogicalLine) {
            const result = [];
            let resultLen = 0;
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                result[resultLen++] = new cursorCommon_1.CursorState(cursor.modelState, cursor.viewState);
                if (useLogicalLine) {
                    result[resultLen++] = cursorCommon_1.CursorState.fromModelState(cursorMoveOperations_1.MoveOperations.translateDown(viewModel.cursorConfig, viewModel.model, cursor.modelState));
                }
                else {
                    result[resultLen++] = cursorCommon_1.CursorState.fromViewState(cursorMoveOperations_1.MoveOperations.translateDown(viewModel.cursorConfig, viewModel, cursor.viewState));
                }
            }
            return result;
        }
        static addCursorUp(viewModel, cursors, useLogicalLine) {
            const result = [];
            let resultLen = 0;
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                result[resultLen++] = new cursorCommon_1.CursorState(cursor.modelState, cursor.viewState);
                if (useLogicalLine) {
                    result[resultLen++] = cursorCommon_1.CursorState.fromModelState(cursorMoveOperations_1.MoveOperations.translateUp(viewModel.cursorConfig, viewModel.model, cursor.modelState));
                }
                else {
                    result[resultLen++] = cursorCommon_1.CursorState.fromViewState(cursorMoveOperations_1.MoveOperations.translateUp(viewModel.cursorConfig, viewModel, cursor.viewState));
                }
            }
            return result;
        }
        static moveToBeginningOfLine(viewModel, cursors, inSelectionMode) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                result[i] = this._moveToLineStart(viewModel, cursor, inSelectionMode);
            }
            return result;
        }
        static _moveToLineStart(viewModel, cursor, inSelectionMode) {
            const currentViewStateColumn = cursor.viewState.position.column;
            const currentModelStateColumn = cursor.modelState.position.column;
            const isFirstLineOfWrappedLine = currentViewStateColumn === currentModelStateColumn;
            const currentViewStatelineNumber = cursor.viewState.position.lineNumber;
            const firstNonBlankColumn = viewModel.getLineFirstNonWhitespaceColumn(currentViewStatelineNumber);
            const isBeginningOfViewLine = currentViewStateColumn === firstNonBlankColumn;
            if (!isFirstLineOfWrappedLine && !isBeginningOfViewLine) {
                return this._moveToLineStartByView(viewModel, cursor, inSelectionMode);
            }
            else {
                return this._moveToLineStartByModel(viewModel, cursor, inSelectionMode);
            }
        }
        static _moveToLineStartByView(viewModel, cursor, inSelectionMode) {
            return cursorCommon_1.CursorState.fromViewState(cursorMoveOperations_1.MoveOperations.moveToBeginningOfLine(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode));
        }
        static _moveToLineStartByModel(viewModel, cursor, inSelectionMode) {
            return cursorCommon_1.CursorState.fromModelState(cursorMoveOperations_1.MoveOperations.moveToBeginningOfLine(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode));
        }
        static moveToEndOfLine(viewModel, cursors, inSelectionMode, sticky) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                result[i] = this._moveToLineEnd(viewModel, cursor, inSelectionMode, sticky);
            }
            return result;
        }
        static _moveToLineEnd(viewModel, cursor, inSelectionMode, sticky) {
            const viewStatePosition = cursor.viewState.position;
            const viewModelMaxColumn = viewModel.getLineMaxColumn(viewStatePosition.lineNumber);
            const isEndOfViewLine = viewStatePosition.column === viewModelMaxColumn;
            const modelStatePosition = cursor.modelState.position;
            const modelMaxColumn = viewModel.model.getLineMaxColumn(modelStatePosition.lineNumber);
            const isEndLineOfWrappedLine = viewModelMaxColumn - viewStatePosition.column === modelMaxColumn - modelStatePosition.column;
            if (isEndOfViewLine || isEndLineOfWrappedLine) {
                return this._moveToLineEndByModel(viewModel, cursor, inSelectionMode, sticky);
            }
            else {
                return this._moveToLineEndByView(viewModel, cursor, inSelectionMode, sticky);
            }
        }
        static _moveToLineEndByView(viewModel, cursor, inSelectionMode, sticky) {
            return cursorCommon_1.CursorState.fromViewState(cursorMoveOperations_1.MoveOperations.moveToEndOfLine(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode, sticky));
        }
        static _moveToLineEndByModel(viewModel, cursor, inSelectionMode, sticky) {
            return cursorCommon_1.CursorState.fromModelState(cursorMoveOperations_1.MoveOperations.moveToEndOfLine(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode, sticky));
        }
        static expandLineSelection(viewModel, cursors) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                const startLineNumber = cursor.modelState.selection.startLineNumber;
                const lineCount = viewModel.model.getLineCount();
                let endLineNumber = cursor.modelState.selection.endLineNumber;
                let endColumn;
                if (endLineNumber === lineCount) {
                    endColumn = viewModel.model.getLineMaxColumn(lineCount);
                }
                else {
                    endLineNumber++;
                    endColumn = 1;
                }
                result[i] = cursorCommon_1.CursorState.fromModelState(new cursorCommon_1.SingleCursorState(new range_1.Range(startLineNumber, 1, startLineNumber, 1), 0 /* SelectionStartKind.Simple */, 0, new position_1.Position(endLineNumber, endColumn), 0));
            }
            return result;
        }
        static moveToBeginningOfBuffer(viewModel, cursors, inSelectionMode) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                result[i] = cursorCommon_1.CursorState.fromModelState(cursorMoveOperations_1.MoveOperations.moveToBeginningOfBuffer(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode));
            }
            return result;
        }
        static moveToEndOfBuffer(viewModel, cursors, inSelectionMode) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                result[i] = cursorCommon_1.CursorState.fromModelState(cursorMoveOperations_1.MoveOperations.moveToEndOfBuffer(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode));
            }
            return result;
        }
        static selectAll(viewModel, cursor) {
            const lineCount = viewModel.model.getLineCount();
            const maxColumn = viewModel.model.getLineMaxColumn(lineCount);
            return cursorCommon_1.CursorState.fromModelState(new cursorCommon_1.SingleCursorState(new range_1.Range(1, 1, 1, 1), 0 /* SelectionStartKind.Simple */, 0, new position_1.Position(lineCount, maxColumn), 0));
        }
        static line(viewModel, cursor, inSelectionMode, _position, _viewPosition) {
            const position = viewModel.model.validatePosition(_position);
            const viewPosition = (_viewPosition
                ? viewModel.coordinatesConverter.validateViewPosition(new position_1.Position(_viewPosition.lineNumber, _viewPosition.column), position)
                : viewModel.coordinatesConverter.convertModelPositionToViewPosition(position));
            if (!inSelectionMode) {
                // Entering line selection for the first time
                const lineCount = viewModel.model.getLineCount();
                let selectToLineNumber = position.lineNumber + 1;
                let selectToColumn = 1;
                if (selectToLineNumber > lineCount) {
                    selectToLineNumber = lineCount;
                    selectToColumn = viewModel.model.getLineMaxColumn(selectToLineNumber);
                }
                return cursorCommon_1.CursorState.fromModelState(new cursorCommon_1.SingleCursorState(new range_1.Range(position.lineNumber, 1, selectToLineNumber, selectToColumn), 2 /* SelectionStartKind.Line */, 0, new position_1.Position(selectToLineNumber, selectToColumn), 0));
            }
            // Continuing line selection
            const enteringLineNumber = cursor.modelState.selectionStart.getStartPosition().lineNumber;
            if (position.lineNumber < enteringLineNumber) {
                return cursorCommon_1.CursorState.fromViewState(cursor.viewState.move(true, viewPosition.lineNumber, 1, 0));
            }
            else if (position.lineNumber > enteringLineNumber) {
                const lineCount = viewModel.getLineCount();
                let selectToViewLineNumber = viewPosition.lineNumber + 1;
                let selectToViewColumn = 1;
                if (selectToViewLineNumber > lineCount) {
                    selectToViewLineNumber = lineCount;
                    selectToViewColumn = viewModel.getLineMaxColumn(selectToViewLineNumber);
                }
                return cursorCommon_1.CursorState.fromViewState(cursor.viewState.move(true, selectToViewLineNumber, selectToViewColumn, 0));
            }
            else {
                const endPositionOfSelectionStart = cursor.modelState.selectionStart.getEndPosition();
                return cursorCommon_1.CursorState.fromModelState(cursor.modelState.move(true, endPositionOfSelectionStart.lineNumber, endPositionOfSelectionStart.column, 0));
            }
        }
        static word(viewModel, cursor, inSelectionMode, _position) {
            const position = viewModel.model.validatePosition(_position);
            return cursorCommon_1.CursorState.fromModelState(cursorWordOperations_1.WordOperations.word(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode, position));
        }
        static cancelSelection(viewModel, cursor) {
            if (!cursor.modelState.hasSelection()) {
                return new cursorCommon_1.CursorState(cursor.modelState, cursor.viewState);
            }
            const lineNumber = cursor.viewState.position.lineNumber;
            const column = cursor.viewState.position.column;
            return cursorCommon_1.CursorState.fromViewState(new cursorCommon_1.SingleCursorState(new range_1.Range(lineNumber, column, lineNumber, column), 0 /* SelectionStartKind.Simple */, 0, new position_1.Position(lineNumber, column), 0));
        }
        static moveTo(viewModel, cursor, inSelectionMode, _position, _viewPosition) {
            if (inSelectionMode) {
                if (cursor.modelState.selectionStartKind === 1 /* SelectionStartKind.Word */) {
                    return this.word(viewModel, cursor, inSelectionMode, _position);
                }
                if (cursor.modelState.selectionStartKind === 2 /* SelectionStartKind.Line */) {
                    return this.line(viewModel, cursor, inSelectionMode, _position, _viewPosition);
                }
            }
            const position = viewModel.model.validatePosition(_position);
            const viewPosition = (_viewPosition
                ? viewModel.coordinatesConverter.validateViewPosition(new position_1.Position(_viewPosition.lineNumber, _viewPosition.column), position)
                : viewModel.coordinatesConverter.convertModelPositionToViewPosition(position));
            return cursorCommon_1.CursorState.fromViewState(cursor.viewState.move(inSelectionMode, viewPosition.lineNumber, viewPosition.column, 0));
        }
        static simpleMove(viewModel, cursors, direction, inSelectionMode, value, unit) {
            switch (direction) {
                case 0 /* CursorMove.Direction.Left */: {
                    if (unit === 4 /* CursorMove.Unit.HalfLine */) {
                        // Move left by half the current line length
                        return this._moveHalfLineLeft(viewModel, cursors, inSelectionMode);
                    }
                    else {
                        // Move left by `moveParams.value` columns
                        return this._moveLeft(viewModel, cursors, inSelectionMode, value);
                    }
                }
                case 1 /* CursorMove.Direction.Right */: {
                    if (unit === 4 /* CursorMove.Unit.HalfLine */) {
                        // Move right by half the current line length
                        return this._moveHalfLineRight(viewModel, cursors, inSelectionMode);
                    }
                    else {
                        // Move right by `moveParams.value` columns
                        return this._moveRight(viewModel, cursors, inSelectionMode, value);
                    }
                }
                case 2 /* CursorMove.Direction.Up */: {
                    if (unit === 2 /* CursorMove.Unit.WrappedLine */) {
                        // Move up by view lines
                        return this._moveUpByViewLines(viewModel, cursors, inSelectionMode, value);
                    }
                    else {
                        // Move up by model lines
                        return this._moveUpByModelLines(viewModel, cursors, inSelectionMode, value);
                    }
                }
                case 3 /* CursorMove.Direction.Down */: {
                    if (unit === 2 /* CursorMove.Unit.WrappedLine */) {
                        // Move down by view lines
                        return this._moveDownByViewLines(viewModel, cursors, inSelectionMode, value);
                    }
                    else {
                        // Move down by model lines
                        return this._moveDownByModelLines(viewModel, cursors, inSelectionMode, value);
                    }
                }
                case 4 /* CursorMove.Direction.PrevBlankLine */: {
                    if (unit === 2 /* CursorMove.Unit.WrappedLine */) {
                        return cursors.map(cursor => cursorCommon_1.CursorState.fromViewState(cursorMoveOperations_1.MoveOperations.moveToPrevBlankLine(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode)));
                    }
                    else {
                        return cursors.map(cursor => cursorCommon_1.CursorState.fromModelState(cursorMoveOperations_1.MoveOperations.moveToPrevBlankLine(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode)));
                    }
                }
                case 5 /* CursorMove.Direction.NextBlankLine */: {
                    if (unit === 2 /* CursorMove.Unit.WrappedLine */) {
                        return cursors.map(cursor => cursorCommon_1.CursorState.fromViewState(cursorMoveOperations_1.MoveOperations.moveToNextBlankLine(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode)));
                    }
                    else {
                        return cursors.map(cursor => cursorCommon_1.CursorState.fromModelState(cursorMoveOperations_1.MoveOperations.moveToNextBlankLine(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode)));
                    }
                }
                case 6 /* CursorMove.Direction.WrappedLineStart */: {
                    // Move to the beginning of the current view line
                    return this._moveToViewMinColumn(viewModel, cursors, inSelectionMode);
                }
                case 7 /* CursorMove.Direction.WrappedLineFirstNonWhitespaceCharacter */: {
                    // Move to the first non-whitespace column of the current view line
                    return this._moveToViewFirstNonWhitespaceColumn(viewModel, cursors, inSelectionMode);
                }
                case 8 /* CursorMove.Direction.WrappedLineColumnCenter */: {
                    // Move to the "center" of the current view line
                    return this._moveToViewCenterColumn(viewModel, cursors, inSelectionMode);
                }
                case 9 /* CursorMove.Direction.WrappedLineEnd */: {
                    // Move to the end of the current view line
                    return this._moveToViewMaxColumn(viewModel, cursors, inSelectionMode);
                }
                case 10 /* CursorMove.Direction.WrappedLineLastNonWhitespaceCharacter */: {
                    // Move to the last non-whitespace column of the current view line
                    return this._moveToViewLastNonWhitespaceColumn(viewModel, cursors, inSelectionMode);
                }
                default:
                    return null;
            }
        }
        static viewportMove(viewModel, cursors, direction, inSelectionMode, value) {
            const visibleViewRange = viewModel.getCompletelyVisibleViewRange();
            const visibleModelRange = viewModel.coordinatesConverter.convertViewRangeToModelRange(visibleViewRange);
            switch (direction) {
                case 11 /* CursorMove.Direction.ViewPortTop */: {
                    // Move to the nth line start in the viewport (from the top)
                    const modelLineNumber = this._firstLineNumberInRange(viewModel.model, visibleModelRange, value);
                    const modelColumn = viewModel.model.getLineFirstNonWhitespaceColumn(modelLineNumber);
                    return [this._moveToModelPosition(viewModel, cursors[0], inSelectionMode, modelLineNumber, modelColumn)];
                }
                case 13 /* CursorMove.Direction.ViewPortBottom */: {
                    // Move to the nth line start in the viewport (from the bottom)
                    const modelLineNumber = this._lastLineNumberInRange(viewModel.model, visibleModelRange, value);
                    const modelColumn = viewModel.model.getLineFirstNonWhitespaceColumn(modelLineNumber);
                    return [this._moveToModelPosition(viewModel, cursors[0], inSelectionMode, modelLineNumber, modelColumn)];
                }
                case 12 /* CursorMove.Direction.ViewPortCenter */: {
                    // Move to the line start in the viewport center
                    const modelLineNumber = Math.round((visibleModelRange.startLineNumber + visibleModelRange.endLineNumber) / 2);
                    const modelColumn = viewModel.model.getLineFirstNonWhitespaceColumn(modelLineNumber);
                    return [this._moveToModelPosition(viewModel, cursors[0], inSelectionMode, modelLineNumber, modelColumn)];
                }
                case 14 /* CursorMove.Direction.ViewPortIfOutside */: {
                    // Move to a position inside the viewport
                    const result = [];
                    for (let i = 0, len = cursors.length; i < len; i++) {
                        const cursor = cursors[i];
                        result[i] = this.findPositionInViewportIfOutside(viewModel, cursor, visibleViewRange, inSelectionMode);
                    }
                    return result;
                }
                default:
                    return null;
            }
        }
        static findPositionInViewportIfOutside(viewModel, cursor, visibleViewRange, inSelectionMode) {
            const viewLineNumber = cursor.viewState.position.lineNumber;
            if (visibleViewRange.startLineNumber <= viewLineNumber && viewLineNumber <= visibleViewRange.endLineNumber - 1) {
                // Nothing to do, cursor is in viewport
                return new cursorCommon_1.CursorState(cursor.modelState, cursor.viewState);
            }
            else {
                let newViewLineNumber;
                if (viewLineNumber > visibleViewRange.endLineNumber - 1) {
                    newViewLineNumber = visibleViewRange.endLineNumber - 1;
                }
                else if (viewLineNumber < visibleViewRange.startLineNumber) {
                    newViewLineNumber = visibleViewRange.startLineNumber;
                }
                else {
                    newViewLineNumber = viewLineNumber;
                }
                const position = cursorMoveOperations_1.MoveOperations.vertical(viewModel.cursorConfig, viewModel, viewLineNumber, cursor.viewState.position.column, cursor.viewState.leftoverVisibleColumns, newViewLineNumber, false);
                return cursorCommon_1.CursorState.fromViewState(cursor.viewState.move(inSelectionMode, position.lineNumber, position.column, position.leftoverVisibleColumns));
            }
        }
        /**
         * Find the nth line start included in the range (from the start).
         */
        static _firstLineNumberInRange(model, range, count) {
            let startLineNumber = range.startLineNumber;
            if (range.startColumn !== model.getLineMinColumn(startLineNumber)) {
                // Move on to the second line if the first line start is not included in the range
                startLineNumber++;
            }
            return Math.min(range.endLineNumber, startLineNumber + count - 1);
        }
        /**
         * Find the nth line start included in the range (from the end).
         */
        static _lastLineNumberInRange(model, range, count) {
            let startLineNumber = range.startLineNumber;
            if (range.startColumn !== model.getLineMinColumn(startLineNumber)) {
                // Move on to the second line if the first line start is not included in the range
                startLineNumber++;
            }
            return Math.max(startLineNumber, range.endLineNumber - count + 1);
        }
        static _moveLeft(viewModel, cursors, inSelectionMode, noOfColumns) {
            return cursors.map(cursor => cursorCommon_1.CursorState.fromViewState(cursorMoveOperations_1.MoveOperations.moveLeft(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode, noOfColumns)));
        }
        static _moveHalfLineLeft(viewModel, cursors, inSelectionMode) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                const viewLineNumber = cursor.viewState.position.lineNumber;
                const halfLine = Math.round(viewModel.getLineContent(viewLineNumber).length / 2);
                result[i] = cursorCommon_1.CursorState.fromViewState(cursorMoveOperations_1.MoveOperations.moveLeft(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode, halfLine));
            }
            return result;
        }
        static _moveRight(viewModel, cursors, inSelectionMode, noOfColumns) {
            return cursors.map(cursor => cursorCommon_1.CursorState.fromViewState(cursorMoveOperations_1.MoveOperations.moveRight(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode, noOfColumns)));
        }
        static _moveHalfLineRight(viewModel, cursors, inSelectionMode) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                const viewLineNumber = cursor.viewState.position.lineNumber;
                const halfLine = Math.round(viewModel.getLineContent(viewLineNumber).length / 2);
                result[i] = cursorCommon_1.CursorState.fromViewState(cursorMoveOperations_1.MoveOperations.moveRight(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode, halfLine));
            }
            return result;
        }
        static _moveDownByViewLines(viewModel, cursors, inSelectionMode, linesCount) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                result[i] = cursorCommon_1.CursorState.fromViewState(cursorMoveOperations_1.MoveOperations.moveDown(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode, linesCount));
            }
            return result;
        }
        static _moveDownByModelLines(viewModel, cursors, inSelectionMode, linesCount) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                result[i] = cursorCommon_1.CursorState.fromModelState(cursorMoveOperations_1.MoveOperations.moveDown(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode, linesCount));
            }
            return result;
        }
        static _moveUpByViewLines(viewModel, cursors, inSelectionMode, linesCount) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                result[i] = cursorCommon_1.CursorState.fromViewState(cursorMoveOperations_1.MoveOperations.moveUp(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode, linesCount));
            }
            return result;
        }
        static _moveUpByModelLines(viewModel, cursors, inSelectionMode, linesCount) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                result[i] = cursorCommon_1.CursorState.fromModelState(cursorMoveOperations_1.MoveOperations.moveUp(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode, linesCount));
            }
            return result;
        }
        static _moveToViewPosition(viewModel, cursor, inSelectionMode, toViewLineNumber, toViewColumn) {
            return cursorCommon_1.CursorState.fromViewState(cursor.viewState.move(inSelectionMode, toViewLineNumber, toViewColumn, 0));
        }
        static _moveToModelPosition(viewModel, cursor, inSelectionMode, toModelLineNumber, toModelColumn) {
            return cursorCommon_1.CursorState.fromModelState(cursor.modelState.move(inSelectionMode, toModelLineNumber, toModelColumn, 0));
        }
        static _moveToViewMinColumn(viewModel, cursors, inSelectionMode) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                const viewLineNumber = cursor.viewState.position.lineNumber;
                const viewColumn = viewModel.getLineMinColumn(viewLineNumber);
                result[i] = this._moveToViewPosition(viewModel, cursor, inSelectionMode, viewLineNumber, viewColumn);
            }
            return result;
        }
        static _moveToViewFirstNonWhitespaceColumn(viewModel, cursors, inSelectionMode) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                const viewLineNumber = cursor.viewState.position.lineNumber;
                const viewColumn = viewModel.getLineFirstNonWhitespaceColumn(viewLineNumber);
                result[i] = this._moveToViewPosition(viewModel, cursor, inSelectionMode, viewLineNumber, viewColumn);
            }
            return result;
        }
        static _moveToViewCenterColumn(viewModel, cursors, inSelectionMode) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                const viewLineNumber = cursor.viewState.position.lineNumber;
                const viewColumn = Math.round((viewModel.getLineMaxColumn(viewLineNumber) + viewModel.getLineMinColumn(viewLineNumber)) / 2);
                result[i] = this._moveToViewPosition(viewModel, cursor, inSelectionMode, viewLineNumber, viewColumn);
            }
            return result;
        }
        static _moveToViewMaxColumn(viewModel, cursors, inSelectionMode) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                const viewLineNumber = cursor.viewState.position.lineNumber;
                const viewColumn = viewModel.getLineMaxColumn(viewLineNumber);
                result[i] = this._moveToViewPosition(viewModel, cursor, inSelectionMode, viewLineNumber, viewColumn);
            }
            return result;
        }
        static _moveToViewLastNonWhitespaceColumn(viewModel, cursors, inSelectionMode) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                const viewLineNumber = cursor.viewState.position.lineNumber;
                const viewColumn = viewModel.getLineLastNonWhitespaceColumn(viewLineNumber);
                result[i] = this._moveToViewPosition(viewModel, cursor, inSelectionMode, viewLineNumber, viewColumn);
            }
            return result;
        }
    }
    exports.CursorMoveCommands = CursorMoveCommands;
    var CursorMove;
    (function (CursorMove) {
        const isCursorMoveArgs = function (arg) {
            if (!types.isObject(arg)) {
                return false;
            }
            const cursorMoveArg = arg;
            if (!types.isString(cursorMoveArg.to)) {
                return false;
            }
            if (!types.isUndefined(cursorMoveArg.select) && !types.isBoolean(cursorMoveArg.select)) {
                return false;
            }
            if (!types.isUndefined(cursorMoveArg.by) && !types.isString(cursorMoveArg.by)) {
                return false;
            }
            if (!types.isUndefined(cursorMoveArg.value) && !types.isNumber(cursorMoveArg.value)) {
                return false;
            }
            return true;
        };
        CursorMove.description = {
            description: 'Move cursor to a logical position in the view',
            args: [
                {
                    name: 'Cursor move argument object',
                    description: `Property-value pairs that can be passed through this argument:
					* 'to': A mandatory logical position value providing where to move the cursor.
						\`\`\`
						'left', 'right', 'up', 'down', 'prevBlankLine', 'nextBlankLine',
						'wrappedLineStart', 'wrappedLineEnd', 'wrappedLineColumnCenter'
						'wrappedLineFirstNonWhitespaceCharacter', 'wrappedLineLastNonWhitespaceCharacter'
						'viewPortTop', 'viewPortCenter', 'viewPortBottom', 'viewPortIfOutside'
						\`\`\`
					* 'by': Unit to move. Default is computed based on 'to' value.
						\`\`\`
						'line', 'wrappedLine', 'character', 'halfLine'
						\`\`\`
					* 'value': Number of units to move. Default is '1'.
					* 'select': If 'true' makes the selection. Default is 'false'.
				`,
                    constraint: isCursorMoveArgs,
                    schema: {
                        'type': 'object',
                        'required': ['to'],
                        'properties': {
                            'to': {
                                'type': 'string',
                                'enum': ['left', 'right', 'up', 'down', 'prevBlankLine', 'nextBlankLine', 'wrappedLineStart', 'wrappedLineEnd', 'wrappedLineColumnCenter', 'wrappedLineFirstNonWhitespaceCharacter', 'wrappedLineLastNonWhitespaceCharacter', 'viewPortTop', 'viewPortCenter', 'viewPortBottom', 'viewPortIfOutside']
                            },
                            'by': {
                                'type': 'string',
                                'enum': ['line', 'wrappedLine', 'character', 'halfLine']
                            },
                            'value': {
                                'type': 'number',
                                'default': 1
                            },
                            'select': {
                                'type': 'boolean',
                                'default': false
                            }
                        }
                    }
                }
            ]
        };
        /**
         * Positions in the view for cursor move command.
         */
        CursorMove.RawDirection = {
            Left: 'left',
            Right: 'right',
            Up: 'up',
            Down: 'down',
            PrevBlankLine: 'prevBlankLine',
            NextBlankLine: 'nextBlankLine',
            WrappedLineStart: 'wrappedLineStart',
            WrappedLineFirstNonWhitespaceCharacter: 'wrappedLineFirstNonWhitespaceCharacter',
            WrappedLineColumnCenter: 'wrappedLineColumnCenter',
            WrappedLineEnd: 'wrappedLineEnd',
            WrappedLineLastNonWhitespaceCharacter: 'wrappedLineLastNonWhitespaceCharacter',
            ViewPortTop: 'viewPortTop',
            ViewPortCenter: 'viewPortCenter',
            ViewPortBottom: 'viewPortBottom',
            ViewPortIfOutside: 'viewPortIfOutside'
        };
        /**
         * Units for Cursor move 'by' argument
         */
        CursorMove.RawUnit = {
            Line: 'line',
            WrappedLine: 'wrappedLine',
            Character: 'character',
            HalfLine: 'halfLine'
        };
        function parse(args) {
            if (!args.to) {
                // illegal arguments
                return null;
            }
            let direction;
            switch (args.to) {
                case CursorMove.RawDirection.Left:
                    direction = 0 /* Direction.Left */;
                    break;
                case CursorMove.RawDirection.Right:
                    direction = 1 /* Direction.Right */;
                    break;
                case CursorMove.RawDirection.Up:
                    direction = 2 /* Direction.Up */;
                    break;
                case CursorMove.RawDirection.Down:
                    direction = 3 /* Direction.Down */;
                    break;
                case CursorMove.RawDirection.PrevBlankLine:
                    direction = 4 /* Direction.PrevBlankLine */;
                    break;
                case CursorMove.RawDirection.NextBlankLine:
                    direction = 5 /* Direction.NextBlankLine */;
                    break;
                case CursorMove.RawDirection.WrappedLineStart:
                    direction = 6 /* Direction.WrappedLineStart */;
                    break;
                case CursorMove.RawDirection.WrappedLineFirstNonWhitespaceCharacter:
                    direction = 7 /* Direction.WrappedLineFirstNonWhitespaceCharacter */;
                    break;
                case CursorMove.RawDirection.WrappedLineColumnCenter:
                    direction = 8 /* Direction.WrappedLineColumnCenter */;
                    break;
                case CursorMove.RawDirection.WrappedLineEnd:
                    direction = 9 /* Direction.WrappedLineEnd */;
                    break;
                case CursorMove.RawDirection.WrappedLineLastNonWhitespaceCharacter:
                    direction = 10 /* Direction.WrappedLineLastNonWhitespaceCharacter */;
                    break;
                case CursorMove.RawDirection.ViewPortTop:
                    direction = 11 /* Direction.ViewPortTop */;
                    break;
                case CursorMove.RawDirection.ViewPortBottom:
                    direction = 13 /* Direction.ViewPortBottom */;
                    break;
                case CursorMove.RawDirection.ViewPortCenter:
                    direction = 12 /* Direction.ViewPortCenter */;
                    break;
                case CursorMove.RawDirection.ViewPortIfOutside:
                    direction = 14 /* Direction.ViewPortIfOutside */;
                    break;
                default:
                    // illegal arguments
                    return null;
            }
            let unit = 0 /* Unit.None */;
            switch (args.by) {
                case CursorMove.RawUnit.Line:
                    unit = 1 /* Unit.Line */;
                    break;
                case CursorMove.RawUnit.WrappedLine:
                    unit = 2 /* Unit.WrappedLine */;
                    break;
                case CursorMove.RawUnit.Character:
                    unit = 3 /* Unit.Character */;
                    break;
                case CursorMove.RawUnit.HalfLine:
                    unit = 4 /* Unit.HalfLine */;
                    break;
            }
            return {
                direction: direction,
                unit: unit,
                select: (!!args.select),
                value: (args.value || 1)
            };
        }
        CursorMove.parse = parse;
        let Direction;
        (function (Direction) {
            Direction[Direction["Left"] = 0] = "Left";
            Direction[Direction["Right"] = 1] = "Right";
            Direction[Direction["Up"] = 2] = "Up";
            Direction[Direction["Down"] = 3] = "Down";
            Direction[Direction["PrevBlankLine"] = 4] = "PrevBlankLine";
            Direction[Direction["NextBlankLine"] = 5] = "NextBlankLine";
            Direction[Direction["WrappedLineStart"] = 6] = "WrappedLineStart";
            Direction[Direction["WrappedLineFirstNonWhitespaceCharacter"] = 7] = "WrappedLineFirstNonWhitespaceCharacter";
            Direction[Direction["WrappedLineColumnCenter"] = 8] = "WrappedLineColumnCenter";
            Direction[Direction["WrappedLineEnd"] = 9] = "WrappedLineEnd";
            Direction[Direction["WrappedLineLastNonWhitespaceCharacter"] = 10] = "WrappedLineLastNonWhitespaceCharacter";
            Direction[Direction["ViewPortTop"] = 11] = "ViewPortTop";
            Direction[Direction["ViewPortCenter"] = 12] = "ViewPortCenter";
            Direction[Direction["ViewPortBottom"] = 13] = "ViewPortBottom";
            Direction[Direction["ViewPortIfOutside"] = 14] = "ViewPortIfOutside";
        })(Direction = CursorMove.Direction || (CursorMove.Direction = {}));
        let Unit;
        (function (Unit) {
            Unit[Unit["None"] = 0] = "None";
            Unit[Unit["Line"] = 1] = "Line";
            Unit[Unit["WrappedLine"] = 2] = "WrappedLine";
            Unit[Unit["Character"] = 3] = "Character";
            Unit[Unit["HalfLine"] = 4] = "HalfLine";
        })(Unit = CursorMove.Unit || (CursorMove.Unit = {}));
    })(CursorMove || (exports.CursorMove = CursorMove = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Vyc29yTW92ZUNvbW1hbmRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9jdXJzb3IvY3Vyc29yTW92ZUNvbW1hbmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVdoRyxNQUFhLGtCQUFrQjtRQUV2QixNQUFNLENBQUMsYUFBYSxDQUFDLFNBQXFCLEVBQUUsT0FBc0IsRUFBRSxjQUF1QjtZQUNqRyxNQUFNLE1BQU0sR0FBeUIsRUFBRSxDQUFDO1lBQ3hDLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztZQUNsQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNuRCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLElBQUksMEJBQVcsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDM0UsSUFBSSxjQUFjLEVBQUU7b0JBQ25CLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLDBCQUFXLENBQUMsY0FBYyxDQUFDLHFDQUFjLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztpQkFDM0k7cUJBQU07b0JBQ04sTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUcsMEJBQVcsQ0FBQyxhQUFhLENBQUMscUNBQWMsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7aUJBQ25J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