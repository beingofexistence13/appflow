/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/coreCommands", "vs/editor/common/core/position", "vs/base/common/platform"], function (require, exports, coreCommands_1, position_1, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ViewController = void 0;
    class ViewController {
        constructor(configuration, viewModel, userInputEvents, commandDelegate) {
            this.configuration = configuration;
            this.viewModel = viewModel;
            this.userInputEvents = userInputEvents;
            this.commandDelegate = commandDelegate;
        }
        paste(text, pasteOnNewLine, multicursorText, mode) {
            this.commandDelegate.paste(text, pasteOnNewLine, multicursorText, mode);
        }
        type(text) {
            this.commandDelegate.type(text);
        }
        compositionType(text, replacePrevCharCnt, replaceNextCharCnt, positionDelta) {
            this.commandDelegate.compositionType(text, replacePrevCharCnt, replaceNextCharCnt, positionDelta);
        }
        compositionStart() {
            this.commandDelegate.startComposition();
        }
        compositionEnd() {
            this.commandDelegate.endComposition();
        }
        cut() {
            this.commandDelegate.cut();
        }
        setSelection(modelSelection) {
            coreCommands_1.CoreNavigationCommands.SetSelection.runCoreEditorCommand(this.viewModel, {
                source: 'keyboard',
                selection: modelSelection
            });
        }
        _validateViewColumn(viewPosition) {
            const minColumn = this.viewModel.getLineMinColumn(viewPosition.lineNumber);
            if (viewPosition.column < minColumn) {
                return new position_1.Position(viewPosition.lineNumber, minColumn);
            }
            return viewPosition;
        }
        _hasMulticursorModifier(data) {
            switch (this.configuration.options.get(77 /* EditorOption.multiCursorModifier */)) {
                case 'altKey':
                    return data.altKey;
                case 'ctrlKey':
                    return data.ctrlKey;
                case 'metaKey':
                    return data.metaKey;
                default:
                    return false;
            }
        }
        _hasNonMulticursorModifier(data) {
            switch (this.configuration.options.get(77 /* EditorOption.multiCursorModifier */)) {
                case 'altKey':
                    return data.ctrlKey || data.metaKey;
                case 'ctrlKey':
                    return data.altKey || data.metaKey;
                case 'metaKey':
                    return data.ctrlKey || data.altKey;
                default:
                    return false;
            }
        }
        dispatchMouse(data) {
            const options = this.configuration.options;
            const selectionClipboardIsOn = (platform.isLinux && options.get(106 /* EditorOption.selectionClipboard */));
            const columnSelection = options.get(22 /* EditorOption.columnSelection */);
            if (data.middleButton && !selectionClipboardIsOn) {
                this._columnSelect(data.position, data.mouseColumn, data.inSelectionMode);
            }
            else if (data.startedOnLineNumbers) {
                // If the dragging started on the gutter, then have operations work on the entire line
                if (this._hasMulticursorModifier(data)) {
                    if (data.inSelectionMode) {
                        this._lastCursorLineSelect(data.position, data.revealType);
                    }
                    else {
                        this._createCursor(data.position, true);
                    }
                }
                else {
                    if (data.inSelectionMode) {
                        this._lineSelectDrag(data.position, data.revealType);
                    }
                    else {
                        this._lineSelect(data.position, data.revealType);
                    }
                }
            }
            else if (data.mouseDownCount >= 4) {
                this._selectAll();
            }
            else if (data.mouseDownCount === 3) {
                if (this._hasMulticursorModifier(data)) {
                    if (data.inSelectionMode) {
                        this._lastCursorLineSelectDrag(data.position, data.revealType);
                    }
                    else {
                        this._lastCursorLineSelect(data.position, data.revealType);
                    }
                }
                else {
                    if (data.inSelectionMode) {
                        this._lineSelectDrag(data.position, data.revealType);
                    }
                    else {
                        this._lineSelect(data.position, data.revealType);
                    }
                }
            }
            else if (data.mouseDownCount === 2) {
                if (!data.onInjectedText) {
                    if (this._hasMulticursorModifier(data)) {
                        this._lastCursorWordSelect(data.position, data.revealType);
                    }
                    else {
                        if (data.inSelectionMode) {
                            this._wordSelectDrag(data.position, data.revealType);
                        }
                        else {
                            this._wordSelect(data.position, data.revealType);
                        }
                    }
                }
            }
            else {
                if (this._hasMulticursorModifier(data)) {
                    if (!this._hasNonMulticursorModifier(data)) {
                        if (data.shiftKey) {
                            this._columnSelect(data.position, data.mouseColumn, true);
                        }
                        else {
                            // Do multi-cursor operations only when purely alt is pressed
                            if (data.inSelectionMode) {
                                this._lastCursorMoveToSelect(data.position, data.revealType);
                            }
                            else {
                                this._createCursor(data.position, false);
                            }
                        }
                    }
                }
                else {
                    if (data.inSelectionMode) {
                        if (data.altKey) {
                            this._columnSelect(data.position, data.mouseColumn, true);
                        }
                        else {
                            if (columnSelection) {
                                this._columnSelect(data.position, data.mouseColumn, true);
                            }
                            else {
                                this._moveToSelect(data.position, data.revealType);
                            }
                        }
                    }
                    else {
                        this.moveTo(data.position, data.revealType);
                    }
                }
            }
        }
        _usualArgs(viewPosition, revealType) {
            viewPosition = this._validateViewColumn(viewPosition);
            return {
                source: 'mouse',
                position: this._convertViewToModelPosition(viewPosition),
                viewPosition,
                revealType
            };
        }
        moveTo(viewPosition, revealType) {
            coreCommands_1.CoreNavigationCommands.MoveTo.runCoreEditorCommand(this.viewModel, this._usualArgs(viewPosition, revealType));
        }
        _moveToSelect(viewPosition, revealType) {
            coreCommands_1.CoreNavigationCommands.MoveToSelect.runCoreEditorCommand(this.viewModel, this._usualArgs(viewPosition, revealType));
        }
        _columnSelect(viewPosition, mouseColumn, doColumnSelect) {
            viewPosition = this._validateViewColumn(viewPosition);
            coreCommands_1.CoreNavigationCommands.ColumnSelect.runCoreEditorCommand(this.viewModel, {
                source: 'mouse',
                position: this._convertViewToModelPosition(viewPosition),
                viewPosition: viewPosition,
                mouseColumn: mouseColumn,
                doColumnSelect: doColumnSelect
            });
        }
        _createCursor(viewPosition, wholeLine) {
            viewPosition = this._validateViewColumn(viewPosition);
            coreCommands_1.CoreNavigationCommands.CreateCursor.runCoreEditorCommand(this.viewModel, {
                source: 'mouse',
                position: this._convertViewToModelPosition(viewPosition),
                viewPosition: viewPosition,
                wholeLine: wholeLine
            });
        }
        _lastCursorMoveToSelect(viewPosition, revealType) {
            coreCommands_1.CoreNavigationCommands.LastCursorMoveToSelect.runCoreEditorCommand(this.viewModel, this._usualArgs(viewPosition, revealType));
        }
        _wordSelect(viewPosition, revealType) {
            coreCommands_1.CoreNavigationCommands.WordSelect.runCoreEditorCommand(this.viewModel, this._usualArgs(viewPosition, revealType));
        }
        _wordSelectDrag(viewPosition, revealType) {
            coreCommands_1.CoreNavigationCommands.WordSelectDrag.runCoreEditorCommand(this.viewModel, this._usualArgs(viewPosition, revealType));
        }
        _lastCursorWordSelect(viewPosition, revealType) {
            coreCommands_1.CoreNavigationCommands.LastCursorWordSelect.runCoreEditorCommand(this.viewModel, this._usualArgs(viewPosition, revealType));
        }
        _lineSelect(viewPosition, revealType) {
            coreCommands_1.CoreNavigationCommands.LineSelect.runCoreEditorCommand(this.viewModel, this._usualArgs(viewPosition, revealType));
        }
        _lineSelectDrag(viewPosition, revealType) {
            coreCommands_1.CoreNavigationCommands.LineSelectDrag.runCoreEditorCommand(this.viewModel, this._usualArgs(viewPosition, revealType));
        }
        _lastCursorLineSelect(viewPosition, revealType) {
            coreCommands_1.CoreNavigationCommands.LastCursorLineSelect.runCoreEditorCommand(this.viewModel, this._usualArgs(viewPosition, revealType));
        }
        _lastCursorLineSelectDrag(viewPosition, revealType) {
            coreCommands_1.CoreNavigationCommands.LastCursorLineSelectDrag.runCoreEditorCommand(this.viewModel, this._usualArgs(viewPosition, revealType));
        }
        _selectAll() {
            coreCommands_1.CoreNavigationCommands.SelectAll.runCoreEditorCommand(this.viewModel, { source: 'mouse' });
        }
        // ----------------------
        _convertViewToModelPosition(viewPosition) {
            return this.viewModel.coordinatesConverter.convertViewPositionToModelPosition(viewPosition);
        }
        emitKeyDown(e) {
            this.userInputEvents.emitKeyDown(e);
        }
        emitKeyUp(e) {
            this.userInputEvents.emitKeyUp(e);
        }
        emitContextMenu(e) {
            this.userInputEvents.emitContextMenu(e);
        }
        emitMouseMove(e) {
            this.userInputEvents.emitMouseMove(e);
        }
        emitMouseLeave(e) {
            this.userInputEvents.emitMouseLeave(e);
        }
        emitMouseUp(e) {
            this.userInputEvents.emitMouseUp(e);
        }
        emitMouseDown(e) {
            this.userInputEvents.emitMouseDown(e);
        }
        emitMouseDrag(e) {
            this.userInputEvents.emitMouseDrag(e);
        }
        emitMouseDrop(e) {
            this.userInputEvents.emitMouseDrop(e);
        }
        emitMouseDropCanceled() {
            this.userInputEvents.emitMouseDropCanceled();
        }
        emitMouseWheel(e) {
            this.userInputEvents.emitMouseWheel(e);
        }
    }
    exports.ViewController = ViewController;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld0NvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci92aWV3L3ZpZXdDb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQTRDaEcsTUFBYSxjQUFjO1FBTzFCLFlBQ0MsYUFBbUMsRUFDbkMsU0FBcUIsRUFDckIsZUFBb0MsRUFDcEMsZUFBaUM7WUFFakMsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7WUFDbkMsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7WUFDM0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7WUFDdkMsSUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7UUFDeEMsQ0FBQztRQUVNLEtBQUssQ0FBQyxJQUFZLEVBQUUsY0FBdUIsRUFBRSxlQUFnQyxFQUFFLElBQW1CO1lBQ3hHLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3pFLENBQUM7UUFFTSxJQUFJLENBQUMsSUFBWTtZQUN2QixJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBRU0sZUFBZSxDQUFDLElBQVksRUFBRSxrQkFBMEIsRUFBRSxrQkFBMEIsRUFBRSxhQUFxQjtZQUNqSCxJQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsa0JBQWtCLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDbkcsQ0FBQztRQUVNLGdCQUFnQjtZQUN0QixJQUFJLENBQUMsZUFBZSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDekMsQ0FBQztRQUVNLGNBQWM7WUFDcEIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxjQUFjLEVBQUUsQ0FB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