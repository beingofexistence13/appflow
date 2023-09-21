/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/coreCommands", "vs/editor/common/core/position", "vs/base/common/platform"], function (require, exports, coreCommands_1, position_1, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$kW = void 0;
    class $kW {
        constructor(configuration, viewModel, userInputEvents, commandDelegate) {
            this.a = configuration;
            this.b = viewModel;
            this.c = userInputEvents;
            this.d = commandDelegate;
        }
        paste(text, pasteOnNewLine, multicursorText, mode) {
            this.d.paste(text, pasteOnNewLine, multicursorText, mode);
        }
        type(text) {
            this.d.type(text);
        }
        compositionType(text, replacePrevCharCnt, replaceNextCharCnt, positionDelta) {
            this.d.compositionType(text, replacePrevCharCnt, replaceNextCharCnt, positionDelta);
        }
        compositionStart() {
            this.d.startComposition();
        }
        compositionEnd() {
            this.d.endComposition();
        }
        cut() {
            this.d.cut();
        }
        setSelection(modelSelection) {
            coreCommands_1.CoreNavigationCommands.SetSelection.runCoreEditorCommand(this.b, {
                source: 'keyboard',
                selection: modelSelection
            });
        }
        f(viewPosition) {
            const minColumn = this.b.getLineMinColumn(viewPosition.lineNumber);
            if (viewPosition.column < minColumn) {
                return new position_1.$js(viewPosition.lineNumber, minColumn);
            }
            return viewPosition;
        }
        g(data) {
            switch (this.a.options.get(77 /* EditorOption.multiCursorModifier */)) {
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
        h(data) {
            switch (this.a.options.get(77 /* EditorOption.multiCursorModifier */)) {
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
            const options = this.a.options;
            const selectionClipboardIsOn = (platform.$k && options.get(106 /* EditorOption.selectionClipboard */));
            const columnSelection = options.get(22 /* EditorOption.columnSelection */);
            if (data.middleButton && !selectionClipboardIsOn) {
                this.k(data.position, data.mouseColumn, data.inSelectionMode);
            }
            else if (data.startedOnLineNumbers) {
                // If the dragging started on the gutter, then have operations work on the entire line
                if (this.g(data)) {
                    if (data.inSelectionMode) {
                        this.s(data.position, data.revealType);
                    }
                    else {
                        this.l(data.position, true);
                    }
                }
                else {
                    if (data.inSelectionMode) {
                        this.r(data.position, data.revealType);
                    }
                    else {
                        this.q(data.position, data.revealType);
                    }
                }
            }
            else if (data.mouseDownCount >= 4) {
                this.u();
            }
            else if (data.mouseDownCount === 3) {
                if (this.g(data)) {
                    if (data.inSelectionMode) {
                        this.t(data.position, data.revealType);
                    }
                    else {
                        this.s(data.position, data.revealType);
                    }
                }
                else {
                    if (data.inSelectionMode) {
                        this.r(data.position, data.revealType);
                    }
                    else {
                        this.q(data.position, data.revealType);
                    }
                }
            }
            else if (data.mouseDownCount === 2) {
                if (!data.onInjectedText) {
                    if (this.g(data)) {
                        this.p(data.position, data.revealType);
                    }
                    else {
                        if (data.inSelectionMode) {
                            this.o(data.position, data.revealType);
                        }
                        else {
                            this.n(data.position, data.revealType);
                        }
                    }
                }
            }
            else {
                if (this.g(data)) {
                    if (!this.h(data)) {
                        if (data.shiftKey) {
                            this.k(data.position, data.mouseColumn, true);
                        }
                        else {
                            // Do multi-cursor operations only when purely alt is pressed
                            if (data.inSelectionMode) {
                                this.m(data.position, data.revealType);
                            }
                            else {
                                this.l(data.position, false);
                            }
                        }
                    }
                }
                else {
                    if (data.inSelectionMode) {
                        if (data.altKey) {
                            this.k(data.position, data.mouseColumn, true);
                        }
                        else {
                            if (columnSelection) {
                                this.k(data.position, data.mouseColumn, true);
                            }
                            else {
                                this.j(data.position, data.revealType);
                            }
                        }
                    }
                    else {
                        this.moveTo(data.position, data.revealType);
                    }
                }
            }
        }
        i(viewPosition, revealType) {
            viewPosition = this.f(viewPosition);
            return {
                source: 'mouse',
                position: this.v(viewPosition),
                viewPosition,
                revealType
            };
        }
        moveTo(viewPosition, revealType) {
            coreCommands_1.CoreNavigationCommands.MoveTo.runCoreEditorCommand(this.b, this.i(viewPosition, revealType));
        }
        j(viewPosition, revealType) {
            coreCommands_1.CoreNavigationCommands.MoveToSelect.runCoreEditorCommand(this.b, this.i(viewPosition, revealType));
        }
        k(viewPosition, mouseColumn, doColumnSelect) {
            viewPosition = this.f(viewPosition);
            coreCommands_1.CoreNavigationCommands.ColumnSelect.runCoreEditorCommand(this.b, {
                source: 'mouse',
                position: this.v(viewPosition),
                viewPosition: viewPosition,
                mouseColumn: mouseColumn,
                doColumnSelect: doColumnSelect
            });
        }
        l(viewPosition, wholeLine) {
            viewPosition = this.f(viewPosition);
            coreCommands_1.CoreNavigationCommands.CreateCursor.runCoreEditorCommand(this.b, {
                source: 'mouse',
                position: this.v(viewPosition),
                viewPosition: viewPosition,
                wholeLine: wholeLine
            });
        }
        m(viewPosition, revealType) {
            coreCommands_1.CoreNavigationCommands.LastCursorMoveToSelect.runCoreEditorCommand(this.b, this.i(viewPosition, revealType));
        }
        n(viewPosition, revealType) {
            coreCommands_1.CoreNavigationCommands.WordSelect.runCoreEditorCommand(this.b, this.i(viewPosition, revealType));
        }
        o(viewPosition, revealType) {
            coreCommands_1.CoreNavigationCommands.WordSelectDrag.runCoreEditorCommand(this.b, this.i(viewPosition, revealType));
        }
        p(viewPosition, revealType) {
            coreCommands_1.CoreNavigationCommands.LastCursorWordSelect.runCoreEditorCommand(this.b, this.i(viewPosition, revealType));
        }
        q(viewPosition, revealType) {
            coreCommands_1.CoreNavigationCommands.LineSelect.runCoreEditorCommand(this.b, this.i(viewPosition, revealType));
        }
        r(viewPosition, revealType) {
            coreCommands_1.CoreNavigationCommands.LineSelectDrag.runCoreEditorCommand(this.b, this.i(viewPosition, revealType));
        }
        s(viewPosition, revealType) {
            coreCommands_1.CoreNavigationCommands.LastCursorLineSelect.runCoreEditorCommand(this.b, this.i(viewPosition, revealType));
        }
        t(viewPosition, revealType) {
            coreCommands_1.CoreNavigationCommands.LastCursorLineSelectDrag.runCoreEditorCommand(this.b, this.i(viewPosition, revealType));
        }
        u() {
            coreCommands_1.CoreNavigationCommands.SelectAll.runCoreEditorCommand(this.b, { source: 'mouse' });
        }
        // ----------------------
        v(viewPosition) {
            return this.b.coordinatesConverter.convertViewPositionToModelPosition(viewPosition);
        }
        emitKeyDown(e) {
            this.c.emitKeyDown(e);
        }
        emitKeyUp(e) {
            this.c.emitKeyUp(e);
        }
        emitContextMenu(e) {
            this.c.emitContextMenu(e);
        }
        emitMouseMove(e) {
            this.c.emitMouseMove(e);
        }
        emitMouseLeave(e) {
            this.c.emitMouseLeave(e);
        }
        emitMouseUp(e) {
            this.c.emitMouseUp(e);
        }
        emitMouseDown(e) {
            this.c.emitMouseDown(e);
        }
        emitMouseDrag(e) {
            this.c.emitMouseDrag(e);
        }
        emitMouseDrop(e) {
            this.c.emitMouseDrop(e);
        }
        emitMouseDropCanceled() {
            this.c.emitMouseDropCanceled();
        }
        emitMouseWheel(e) {
            this.c.emitMouseWheel(e);
        }
    }
    exports.$kW = $kW;
});
//# sourceMappingURL=viewController.js.map