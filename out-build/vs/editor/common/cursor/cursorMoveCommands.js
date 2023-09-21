/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/types", "vs/editor/common/cursorCommon", "vs/editor/common/cursor/cursorMoveOperations", "vs/editor/common/cursor/cursorWordOperations", "vs/editor/common/core/position", "vs/editor/common/core/range"], function (require, exports, types, cursorCommon_1, cursorMoveOperations_1, cursorWordOperations_1, position_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CursorMove = exports.$6V = void 0;
    class $6V {
        static addCursorDown(viewModel, cursors, useLogicalLine) {
            const result = [];
            let resultLen = 0;
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                result[resultLen++] = new cursorCommon_1.$JU(cursor.modelState, cursor.viewState);
                if (useLogicalLine) {
                    result[resultLen++] = cursorCommon_1.$JU.fromModelState(cursorMoveOperations_1.$2V.translateDown(viewModel.cursorConfig, viewModel.model, cursor.modelState));
                }
                else {
                    result[resultLen++] = cursorCommon_1.$JU.fromViewState(cursorMoveOperations_1.$2V.translateDown(viewModel.cursorConfig, viewModel, cursor.viewState));
                }
            }
            return result;
        }
        static addCursorUp(viewModel, cursors, useLogicalLine) {
            const result = [];
            let resultLen = 0;
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                result[resultLen++] = new cursorCommon_1.$JU(cursor.modelState, cursor.viewState);
                if (useLogicalLine) {
                    result[resultLen++] = cursorCommon_1.$JU.fromModelState(cursorMoveOperations_1.$2V.translateUp(viewModel.cursorConfig, viewModel.model, cursor.modelState));
                }
                else {
                    result[resultLen++] = cursorCommon_1.$JU.fromViewState(cursorMoveOperations_1.$2V.translateUp(viewModel.cursorConfig, viewModel, cursor.viewState));
                }
            }
            return result;
        }
        static moveToBeginningOfLine(viewModel, cursors, inSelectionMode) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                result[i] = this.a(viewModel, cursor, inSelectionMode);
            }
            return result;
        }
        static a(viewModel, cursor, inSelectionMode) {
            const currentViewStateColumn = cursor.viewState.position.column;
            const currentModelStateColumn = cursor.modelState.position.column;
            const isFirstLineOfWrappedLine = currentViewStateColumn === currentModelStateColumn;
            const currentViewStatelineNumber = cursor.viewState.position.lineNumber;
            const firstNonBlankColumn = viewModel.getLineFirstNonWhitespaceColumn(currentViewStatelineNumber);
            const isBeginningOfViewLine = currentViewStateColumn === firstNonBlankColumn;
            if (!isFirstLineOfWrappedLine && !isBeginningOfViewLine) {
                return this.b(viewModel, cursor, inSelectionMode);
            }
            else {
                return this.c(viewModel, cursor, inSelectionMode);
            }
        }
        static b(viewModel, cursor, inSelectionMode) {
            return cursorCommon_1.$JU.fromViewState(cursorMoveOperations_1.$2V.moveToBeginningOfLine(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode));
        }
        static c(viewModel, cursor, inSelectionMode) {
            return cursorCommon_1.$JU.fromModelState(cursorMoveOperations_1.$2V.moveToBeginningOfLine(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode));
        }
        static moveToEndOfLine(viewModel, cursors, inSelectionMode, sticky) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                result[i] = this.d(viewModel, cursor, inSelectionMode, sticky);
            }
            return result;
        }
        static d(viewModel, cursor, inSelectionMode, sticky) {
            const viewStatePosition = cursor.viewState.position;
            const viewModelMaxColumn = viewModel.getLineMaxColumn(viewStatePosition.lineNumber);
            const isEndOfViewLine = viewStatePosition.column === viewModelMaxColumn;
            const modelStatePosition = cursor.modelState.position;
            const modelMaxColumn = viewModel.model.getLineMaxColumn(modelStatePosition.lineNumber);
            const isEndLineOfWrappedLine = viewModelMaxColumn - viewStatePosition.column === modelMaxColumn - modelStatePosition.column;
            if (isEndOfViewLine || isEndLineOfWrappedLine) {
                return this.f(viewModel, cursor, inSelectionMode, sticky);
            }
            else {
                return this.e(viewModel, cursor, inSelectionMode, sticky);
            }
        }
        static e(viewModel, cursor, inSelectionMode, sticky) {
            return cursorCommon_1.$JU.fromViewState(cursorMoveOperations_1.$2V.moveToEndOfLine(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode, sticky));
        }
        static f(viewModel, cursor, inSelectionMode, sticky) {
            return cursorCommon_1.$JU.fromModelState(cursorMoveOperations_1.$2V.moveToEndOfLine(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode, sticky));
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
                result[i] = cursorCommon_1.$JU.fromModelState(new cursorCommon_1.$MU(new range_1.$ks(startLineNumber, 1, startLineNumber, 1), 0 /* SelectionStartKind.Simple */, 0, new position_1.$js(endLineNumber, endColumn), 0));
            }
            return result;
        }
        static moveToBeginningOfBuffer(viewModel, cursors, inSelectionMode) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                result[i] = cursorCommon_1.$JU.fromModelState(cursorMoveOperations_1.$2V.moveToBeginningOfBuffer(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode));
            }
            return result;
        }
        static moveToEndOfBuffer(viewModel, cursors, inSelectionMode) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                result[i] = cursorCommon_1.$JU.fromModelState(cursorMoveOperations_1.$2V.moveToEndOfBuffer(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode));
            }
            return result;
        }
        static selectAll(viewModel, cursor) {
            const lineCount = viewModel.model.getLineCount();
            const maxColumn = viewModel.model.getLineMaxColumn(lineCount);
            return cursorCommon_1.$JU.fromModelState(new cursorCommon_1.$MU(new range_1.$ks(1, 1, 1, 1), 0 /* SelectionStartKind.Simple */, 0, new position_1.$js(lineCount, maxColumn), 0));
        }
        static line(viewModel, cursor, inSelectionMode, _position, _viewPosition) {
            const position = viewModel.model.validatePosition(_position);
            const viewPosition = (_viewPosition
                ? viewModel.coordinatesConverter.validateViewPosition(new position_1.$js(_viewPosition.lineNumber, _viewPosition.column), position)
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
                return cursorCommon_1.$JU.fromModelState(new cursorCommon_1.$MU(new range_1.$ks(position.lineNumber, 1, selectToLineNumber, selectToColumn), 2 /* SelectionStartKind.Line */, 0, new position_1.$js(selectToLineNumber, selectToColumn), 0));
            }
            // Continuing line selection
            const enteringLineNumber = cursor.modelState.selectionStart.getStartPosition().lineNumber;
            if (position.lineNumber < enteringLineNumber) {
                return cursorCommon_1.$JU.fromViewState(cursor.viewState.move(true, viewPosition.lineNumber, 1, 0));
            }
            else if (position.lineNumber > enteringLineNumber) {
                const lineCount = viewModel.getLineCount();
                let selectToViewLineNumber = viewPosition.lineNumber + 1;
                let selectToViewColumn = 1;
                if (selectToViewLineNumber > lineCount) {
                    selectToViewLineNumber = lineCount;
                    selectToViewColumn = viewModel.getLineMaxColumn(selectToViewLineNumber);
                }
                return cursorCommon_1.$JU.fromViewState(cursor.viewState.move(true, selectToViewLineNumber, selectToViewColumn, 0));
            }
            else {
                const endPositionOfSelectionStart = cursor.modelState.selectionStart.getEndPosition();
                return cursorCommon_1.$JU.fromModelState(cursor.modelState.move(true, endPositionOfSelectionStart.lineNumber, endPositionOfSelectionStart.column, 0));
            }
        }
        static word(viewModel, cursor, inSelectionMode, _position) {
            const position = viewModel.model.validatePosition(_position);
            return cursorCommon_1.$JU.fromModelState(cursorWordOperations_1.$4V.word(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode, position));
        }
        static cancelSelection(viewModel, cursor) {
            if (!cursor.modelState.hasSelection()) {
                return new cursorCommon_1.$JU(cursor.modelState, cursor.viewState);
            }
            const lineNumber = cursor.viewState.position.lineNumber;
            const column = cursor.viewState.position.column;
            return cursorCommon_1.$JU.fromViewState(new cursorCommon_1.$MU(new range_1.$ks(lineNumber, column, lineNumber, column), 0 /* SelectionStartKind.Simple */, 0, new position_1.$js(lineNumber, column), 0));
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
                ? viewModel.coordinatesConverter.validateViewPosition(new position_1.$js(_viewPosition.lineNumber, _viewPosition.column), position)
                : viewModel.coordinatesConverter.convertModelPositionToViewPosition(position));
            return cursorCommon_1.$JU.fromViewState(cursor.viewState.move(inSelectionMode, viewPosition.lineNumber, viewPosition.column, 0));
        }
        static simpleMove(viewModel, cursors, direction, inSelectionMode, value, unit) {
            switch (direction) {
                case 0 /* CursorMove.Direction.Left */: {
                    if (unit === 4 /* CursorMove.Unit.HalfLine */) {
                        // Move left by half the current line length
                        return this.k(viewModel, cursors, inSelectionMode);
                    }
                    else {
                        // Move left by `moveParams.value` columns
                        return this.j(viewModel, cursors, inSelectionMode, value);
                    }
                }
                case 1 /* CursorMove.Direction.Right */: {
                    if (unit === 4 /* CursorMove.Unit.HalfLine */) {
                        // Move right by half the current line length
                        return this.m(viewModel, cursors, inSelectionMode);
                    }
                    else {
                        // Move right by `moveParams.value` columns
                        return this.l(viewModel, cursors, inSelectionMode, value);
                    }
                }
                case 2 /* CursorMove.Direction.Up */: {
                    if (unit === 2 /* CursorMove.Unit.WrappedLine */) {
                        // Move up by view lines
                        return this.p(viewModel, cursors, inSelectionMode, value);
                    }
                    else {
                        // Move up by model lines
                        return this.q(viewModel, cursors, inSelectionMode, value);
                    }
                }
                case 3 /* CursorMove.Direction.Down */: {
                    if (unit === 2 /* CursorMove.Unit.WrappedLine */) {
                        // Move down by view lines
                        return this.n(viewModel, cursors, inSelectionMode, value);
                    }
                    else {
                        // Move down by model lines
                        return this.o(viewModel, cursors, inSelectionMode, value);
                    }
                }
                case 4 /* CursorMove.Direction.PrevBlankLine */: {
                    if (unit === 2 /* CursorMove.Unit.WrappedLine */) {
                        return cursors.map(cursor => cursorCommon_1.$JU.fromViewState(cursorMoveOperations_1.$2V.moveToPrevBlankLine(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode)));
                    }
                    else {
                        return cursors.map(cursor => cursorCommon_1.$JU.fromModelState(cursorMoveOperations_1.$2V.moveToPrevBlankLine(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode)));
                    }
                }
                case 5 /* CursorMove.Direction.NextBlankLine */: {
                    if (unit === 2 /* CursorMove.Unit.WrappedLine */) {
                        return cursors.map(cursor => cursorCommon_1.$JU.fromViewState(cursorMoveOperations_1.$2V.moveToNextBlankLine(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode)));
                    }
                    else {
                        return cursors.map(cursor => cursorCommon_1.$JU.fromModelState(cursorMoveOperations_1.$2V.moveToNextBlankLine(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode)));
                    }
                }
                case 6 /* CursorMove.Direction.WrappedLineStart */: {
                    // Move to the beginning of the current view line
                    return this.t(viewModel, cursors, inSelectionMode);
                }
                case 7 /* CursorMove.Direction.WrappedLineFirstNonWhitespaceCharacter */: {
                    // Move to the first non-whitespace column of the current view line
                    return this.u(viewModel, cursors, inSelectionMode);
                }
                case 8 /* CursorMove.Direction.WrappedLineColumnCenter */: {
                    // Move to the "center" of the current view line
                    return this.v(viewModel, cursors, inSelectionMode);
                }
                case 9 /* CursorMove.Direction.WrappedLineEnd */: {
                    // Move to the end of the current view line
                    return this.w(viewModel, cursors, inSelectionMode);
                }
                case 10 /* CursorMove.Direction.WrappedLineLastNonWhitespaceCharacter */: {
                    // Move to the last non-whitespace column of the current view line
                    return this.x(viewModel, cursors, inSelectionMode);
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
                    const modelLineNumber = this.g(viewModel.model, visibleModelRange, value);
                    const modelColumn = viewModel.model.getLineFirstNonWhitespaceColumn(modelLineNumber);
                    return [this.s(viewModel, cursors[0], inSelectionMode, modelLineNumber, modelColumn)];
                }
                case 13 /* CursorMove.Direction.ViewPortBottom */: {
                    // Move to the nth line start in the viewport (from the bottom)
                    const modelLineNumber = this.h(viewModel.model, visibleModelRange, value);
                    const modelColumn = viewModel.model.getLineFirstNonWhitespaceColumn(modelLineNumber);
                    return [this.s(viewModel, cursors[0], inSelectionMode, modelLineNumber, modelColumn)];
                }
                case 12 /* CursorMove.Direction.ViewPortCenter */: {
                    // Move to the line start in the viewport center
                    const modelLineNumber = Math.round((visibleModelRange.startLineNumber + visibleModelRange.endLineNumber) / 2);
                    const modelColumn = viewModel.model.getLineFirstNonWhitespaceColumn(modelLineNumber);
                    return [this.s(viewModel, cursors[0], inSelectionMode, modelLineNumber, modelColumn)];
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
                return new cursorCommon_1.$JU(cursor.modelState, cursor.viewState);
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
                const position = cursorMoveOperations_1.$2V.vertical(viewModel.cursorConfig, viewModel, viewLineNumber, cursor.viewState.position.column, cursor.viewState.leftoverVisibleColumns, newViewLineNumber, false);
                return cursorCommon_1.$JU.fromViewState(cursor.viewState.move(inSelectionMode, position.lineNumber, position.column, position.leftoverVisibleColumns));
            }
        }
        /**
         * Find the nth line start included in the range (from the start).
         */
        static g(model, range, count) {
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
        static h(model, range, count) {
            let startLineNumber = range.startLineNumber;
            if (range.startColumn !== model.getLineMinColumn(startLineNumber)) {
                // Move on to the second line if the first line start is not included in the range
                startLineNumber++;
            }
            return Math.max(startLineNumber, range.endLineNumber - count + 1);
        }
        static j(viewModel, cursors, inSelectionMode, noOfColumns) {
            return cursors.map(cursor => cursorCommon_1.$JU.fromViewState(cursorMoveOperations_1.$2V.moveLeft(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode, noOfColumns)));
        }
        static k(viewModel, cursors, inSelectionMode) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                const viewLineNumber = cursor.viewState.position.lineNumber;
                const halfLine = Math.round(viewModel.getLineContent(viewLineNumber).length / 2);
                result[i] = cursorCommon_1.$JU.fromViewState(cursorMoveOperations_1.$2V.moveLeft(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode, halfLine));
            }
            return result;
        }
        static l(viewModel, cursors, inSelectionMode, noOfColumns) {
            return cursors.map(cursor => cursorCommon_1.$JU.fromViewState(cursorMoveOperations_1.$2V.moveRight(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode, noOfColumns)));
        }
        static m(viewModel, cursors, inSelectionMode) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                const viewLineNumber = cursor.viewState.position.lineNumber;
                const halfLine = Math.round(viewModel.getLineContent(viewLineNumber).length / 2);
                result[i] = cursorCommon_1.$JU.fromViewState(cursorMoveOperations_1.$2V.moveRight(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode, halfLine));
            }
            return result;
        }
        static n(viewModel, cursors, inSelectionMode, linesCount) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                result[i] = cursorCommon_1.$JU.fromViewState(cursorMoveOperations_1.$2V.moveDown(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode, linesCount));
            }
            return result;
        }
        static o(viewModel, cursors, inSelectionMode, linesCount) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                result[i] = cursorCommon_1.$JU.fromModelState(cursorMoveOperations_1.$2V.moveDown(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode, linesCount));
            }
            return result;
        }
        static p(viewModel, cursors, inSelectionMode, linesCount) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                result[i] = cursorCommon_1.$JU.fromViewState(cursorMoveOperations_1.$2V.moveUp(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode, linesCount));
            }
            return result;
        }
        static q(viewModel, cursors, inSelectionMode, linesCount) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                result[i] = cursorCommon_1.$JU.fromModelState(cursorMoveOperations_1.$2V.moveUp(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode, linesCount));
            }
            return result;
        }
        static r(viewModel, cursor, inSelectionMode, toViewLineNumber, toViewColumn) {
            return cursorCommon_1.$JU.fromViewState(cursor.viewState.move(inSelectionMode, toViewLineNumber, toViewColumn, 0));
        }
        static s(viewModel, cursor, inSelectionMode, toModelLineNumber, toModelColumn) {
            return cursorCommon_1.$JU.fromModelState(cursor.modelState.move(inSelectionMode, toModelLineNumber, toModelColumn, 0));
        }
        static t(viewModel, cursors, inSelectionMode) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                const viewLineNumber = cursor.viewState.position.lineNumber;
                const viewColumn = viewModel.getLineMinColumn(viewLineNumber);
                result[i] = this.r(viewModel, cursor, inSelectionMode, viewLineNumber, viewColumn);
            }
            return result;
        }
        static u(viewModel, cursors, inSelectionMode) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                const viewLineNumber = cursor.viewState.position.lineNumber;
                const viewColumn = viewModel.getLineFirstNonWhitespaceColumn(viewLineNumber);
                result[i] = this.r(viewModel, cursor, inSelectionMode, viewLineNumber, viewColumn);
            }
            return result;
        }
        static v(viewModel, cursors, inSelectionMode) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                const viewLineNumber = cursor.viewState.position.lineNumber;
                const viewColumn = Math.round((viewModel.getLineMaxColumn(viewLineNumber) + viewModel.getLineMinColumn(viewLineNumber)) / 2);
                result[i] = this.r(viewModel, cursor, inSelectionMode, viewLineNumber, viewColumn);
            }
            return result;
        }
        static w(viewModel, cursors, inSelectionMode) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                const viewLineNumber = cursor.viewState.position.lineNumber;
                const viewColumn = viewModel.getLineMaxColumn(viewLineNumber);
                result[i] = this.r(viewModel, cursor, inSelectionMode, viewLineNumber, viewColumn);
            }
            return result;
        }
        static x(viewModel, cursors, inSelectionMode) {
            const result = [];
            for (let i = 0, len = cursors.length; i < len; i++) {
                const cursor = cursors[i];
                const viewLineNumber = cursor.viewState.position.lineNumber;
                const viewColumn = viewModel.getLineLastNonWhitespaceColumn(viewLineNumber);
                result[i] = this.r(viewModel, cursor, inSelectionMode, viewLineNumber, viewColumn);
            }
            return result;
        }
    }
    exports.$6V = $6V;
    var CursorMove;
    (function (CursorMove) {
        const isCursorMoveArgs = function (arg) {
            if (!types.$lf(arg)) {
                return false;
            }
            const cursorMoveArg = arg;
            if (!types.$jf(cursorMoveArg.to)) {
                return false;
            }
            if (!types.$qf(cursorMoveArg.select) && !types.$pf(cursorMoveArg.select)) {
                return false;
            }
            if (!types.$qf(cursorMoveArg.by) && !types.$jf(cursorMoveArg.by)) {
                return false;
            }
            if (!types.$qf(cursorMoveArg.value) && !types.$nf(cursorMoveArg.value)) {
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
//# sourceMappingURL=cursorMoveCommands.js.map