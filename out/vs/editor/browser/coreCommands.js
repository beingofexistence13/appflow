/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/browser/browser", "vs/base/common/types", "vs/base/browser/ui/aria/aria", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/common/cursor/cursorColumnSelection", "vs/editor/common/cursorCommon", "vs/editor/common/cursor/cursorDeleteOperations", "vs/editor/common/cursor/cursorMoveCommands", "vs/editor/common/cursor/cursorTypeOperations", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybindingsRegistry", "vs/base/browser/dom"], function (require, exports, nls, browser_1, types, aria_1, editorExtensions_1, codeEditorService_1, cursorColumnSelection_1, cursorCommon_1, cursorDeleteOperations_1, cursorMoveCommands_1, cursorTypeOperations_1, position_1, range_1, editorContextKeys_1, contextkey_1, keybindingsRegistry_1, dom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CoreEditingCommands = exports.CoreNavigationCommands = exports.NavigationCommandRevealType = exports.RevealLine_ = exports.EditorScroll_ = exports.CoreEditorCommand = void 0;
    const CORE_WEIGHT = 0 /* KeybindingWeight.EditorCore */;
    class CoreEditorCommand extends editorExtensions_1.EditorCommand {
        runEditorCommand(accessor, editor, args) {
            const viewModel = editor._getViewModel();
            if (!viewModel) {
                // the editor has no view => has no cursors
                return;
            }
            this.runCoreEditorCommand(viewModel, args || {});
        }
    }
    exports.CoreEditorCommand = CoreEditorCommand;
    var EditorScroll_;
    (function (EditorScroll_) {
        const isEditorScrollArgs = function (arg) {
            if (!types.isObject(arg)) {
                return false;
            }
            const scrollArg = arg;
            if (!types.isString(scrollArg.to)) {
                return false;
            }
            if (!types.isUndefined(scrollArg.by) && !types.isString(scrollArg.by)) {
                return false;
            }
            if (!types.isUndefined(scrollArg.value) && !types.isNumber(scrollArg.value)) {
                return false;
            }
            if (!types.isUndefined(scrollArg.revealCursor) && !types.isBoolean(scrollArg.revealCursor)) {
                return false;
            }
            return true;
        };
        EditorScroll_.description = {
            description: 'Scroll editor in the given direction',
            args: [
                {
                    name: 'Editor scroll argument object',
                    description: `Property-value pairs that can be passed through this argument:
					* 'to': A mandatory direction value.
						\`\`\`
						'up', 'down'
						\`\`\`
					* 'by': Unit to move. Default is computed based on 'to' value.
						\`\`\`
						'line', 'wrappedLine', 'page', 'halfPage', 'editor'
						\`\`\`
					* 'value': Number of units to move. Default is '1'.
					* 'revealCursor': If 'true' reveals the cursor if it is outside view port.
				`,
                    constraint: isEditorScrollArgs,
                    schema: {
                        'type': 'object',
                        'required': ['to'],
                        'properties': {
                            'to': {
                                'type': 'string',
                                'enum': ['up', 'down']
                            },
                            'by': {
                                'type': 'string',
                                'enum': ['line', 'wrappedLine', 'page', 'halfPage', 'editor']
                            },
                            'value': {
                                'type': 'number',
                                'default': 1
                            },
                            'revealCursor': {
                                'type': 'boolean',
                            }
                        }
                    }
                }
            ]
        };
        /**
         * Directions in the view for editor scroll command.
         */
        EditorScroll_.RawDirection = {
            Up: 'up',
            Right: 'right',
            Down: 'down',
            Left: 'left'
        };
        /**
         * Units for editor scroll 'by' argument
         */
        EditorScroll_.RawUnit = {
            Line: 'line',
            WrappedLine: 'wrappedLine',
            Page: 'page',
            HalfPage: 'halfPage',
            Editor: 'editor',
            Column: 'column'
        };
        function parse(args) {
            let direction;
            switch (args.to) {
                case EditorScroll_.RawDirection.Up:
                    direction = 1 /* Direction.Up */;
                    break;
                case EditorScroll_.RawDirection.Right:
                    direction = 2 /* Direction.Right */;
                    break;
                case EditorScroll_.RawDirection.Down:
                    direction = 3 /* Direction.Down */;
                    break;
                case EditorScroll_.RawDirection.Left:
                    direction = 4 /* Direction.Left */;
                    break;
                default:
                    // Illegal arguments
                    return null;
            }
            let unit;
            switch (args.by) {
                case EditorScroll_.RawUnit.Line:
                    unit = 1 /* Unit.Line */;
                    break;
                case EditorScroll_.RawUnit.WrappedLine:
                    unit = 2 /* Unit.WrappedLine */;
                    break;
                case EditorScroll_.RawUnit.Page:
                    unit = 3 /* Unit.Page */;
                    break;
                case EditorScroll_.RawUnit.HalfPage:
                    unit = 4 /* Unit.HalfPage */;
                    break;
                case EditorScroll_.RawUnit.Editor:
                    unit = 5 /* Unit.Editor */;
                    break;
                case EditorScroll_.RawUnit.Column:
                    unit = 6 /* Unit.Column */;
                    break;
                default:
                    unit = 2 /* Unit.WrappedLine */;
            }
            const value = Math.floor(args.value || 1);
            const revealCursor = !!args.revealCursor;
            return {
                direction: direction,
                unit: unit,
                value: value,
                revealCursor: revealCursor,
                select: (!!args.select)
            };
        }
        EditorScroll_.parse = parse;
        let Direction;
        (function (Direction) {
            Direction[Direction["Up"] = 1] = "Up";
            Direction[Direction["Right"] = 2] = "Right";
            Direction[Direction["Down"] = 3] = "Down";
            Direction[Direction["Left"] = 4] = "Left";
        })(Direction = EditorScroll_.Direction || (EditorScroll_.Direction = {}));
        let Unit;
        (function (Unit) {
            Unit[Unit["Line"] = 1] = "Line";
            Unit[Unit["WrappedLine"] = 2] = "WrappedLine";
            Unit[Unit["Page"] = 3] = "Page";
            Unit[Unit["HalfPage"] = 4] = "HalfPage";
            Unit[Unit["Editor"] = 5] = "Editor";
            Unit[Unit["Column"] = 6] = "Column";
        })(Unit = EditorScroll_.Unit || (EditorScroll_.Unit = {}));
    })(EditorScroll_ || (exports.EditorScroll_ = EditorScroll_ = {}));
    var RevealLine_;
    (function (RevealLine_) {
        const isRevealLineArgs = function (arg) {
            if (!types.isObject(arg)) {
                return false;
            }
            const reveaLineArg = arg;
            if (!types.isNumber(reveaLineArg.lineNumber) && !types.isString(reveaLineArg.lineNumber)) {
                return false;
            }
            if (!types.isUndefined(reveaLineArg.at) && !types.isString(reveaLineArg.at)) {
                return false;
            }
            return true;
        };
        RevealLine_.description = {
            description: 'Reveal the given line at the given logical position',
            args: [
                {
                    name: 'Reveal line argument object',
                    description: `Property-value pairs that can be passed through this argument:
					* 'lineNumber': A mandatory line number value.
					* 'at': Logical position at which line has to be revealed.
						\`\`\`
						'top', 'center', 'bottom'
						\`\`\`
				`,
                    constraint: isRevealLineArgs,
                    schema: {
                        'type': 'object',
                        'required': ['lineNumber'],
                        'properties': {
                            'lineNumber': {
                                'type': ['number', 'string'],
                            },
                            'at': {
                                'type': 'string',
                                'enum': ['top', 'center', 'bottom']
                            }
                        }
                    }
                }
            ]
        };
        /**
         * Values for reveal line 'at' argument
         */
        RevealLine_.RawAtArgument = {
            Top: 'top',
            Center: 'center',
            Bottom: 'bottom'
        };
    })(RevealLine_ || (exports.RevealLine_ = RevealLine_ = {}));
    class EditorOrNativeTextInputCommand {
        constructor(target) {
            // 1. handle case when focus is in editor.
            target.addImplementation(10000, 'code-editor', (accessor, args) => {
                // Only if editor text focus (i.e. not if editor has widget focus).
                const focusedEditor = accessor.get(codeEditorService_1.ICodeEditorService).getFocusedCodeEditor();
                if (focusedEditor && focusedEditor.hasTextFocus()) {
                    return this._runEditorCommand(accessor, focusedEditor, args);
                }
                return false;
            });
            // 2. handle case when focus is in some other `input` / `textarea`.
            target.addImplementation(1000, 'generic-dom-input-textarea', (accessor, args) => {
                // Only if focused on an element that allows for entering text
                const activeElement = (0, dom_1.getActiveElement)();
                if (activeElement && ['input', 'textarea'].indexOf(activeElement.tagName.toLowerCase()) >= 0) {
                    this.runDOMCommand(activeElement);
                    return true;
                }
                return false;
            });
            // 3. (default) handle case when focus is somewhere else.
            target.addImplementation(0, 'generic-dom', (accessor, args) => {
                // Redirecting to active editor
                const activeEditor = accessor.get(codeEditorService_1.ICodeEditorService).getActiveCodeEditor();
                if (activeEditor) {
                    activeEditor.focus();
                    return this._runEditorCommand(accessor, activeEditor, args);
                }
                return false;
            });
        }
        _runEditorCommand(accessor, editor, args) {
            const result = this.runEditorCommand(accessor, editor, args);
            if (result) {
                return result;
            }
            return true;
        }
    }
    var NavigationCommandRevealType;
    (function (NavigationCommandRevealType) {
        /**
         * Do regular revealing.
         */
        NavigationCommandRevealType[NavigationCommandRevealType["Regular"] = 0] = "Regular";
        /**
         * Do only minimal revealing.
         */
        NavigationCommandRevealType[NavigationCommandRevealType["Minimal"] = 1] = "Minimal";
        /**
         * Do not reveal the position.
         */
        NavigationCommandRevealType[NavigationCommandRevealType["None"] = 2] = "None";
    })(NavigationCommandRevealType || (exports.NavigationCommandRevealType = NavigationCommandRevealType = {}));
    var CoreNavigationCommands;
    (function (CoreNavigationCommands) {
        class BaseMoveToCommand extends CoreEditorCommand {
            constructor(opts) {
                super(opts);
                this._inSelectionMode = opts.inSelectionMode;
            }
            runCoreEditorCommand(viewModel, args) {
                if (!args.position) {
                    return;
                }
                viewModel.model.pushStackElement();
                const cursorStateChanged = viewModel.setCursorStates(args.source, 3 /* CursorChangeReason.Explicit */, [
                    cursorMoveCommands_1.CursorMoveCommands.moveTo(viewModel, viewModel.getPrimaryCursorState(), this._inSelectionMode, args.position, args.viewPosition)
                ]);
                if (cursorStateChanged && args.revealType !== 2 /* NavigationCommandRevealType.None */) {
                    viewModel.revealPrimaryCursor(args.source, true, true);
                }
            }
        }
        CoreNavigationCommands.MoveTo = (0, editorExtensions_1.registerEditorCommand)(new BaseMoveToCommand({
            id: '_moveTo',
            inSelectionMode: false,
            precondition: undefined
        }));
        CoreNavigationCommands.MoveToSelect = (0, editorExtensions_1.registerEditorCommand)(new BaseMoveToCommand({
            id: '_moveToSelect',
            inSelectionMode: true,
            precondition: undefined
        }));
        class ColumnSelectCommand extends CoreEditorCommand {
            runCoreEditorCommand(viewModel, args) {
                viewModel.model.pushStackElement();
                const result = this._getColumnSelectResult(viewModel, viewModel.getPrimaryCursorState(), viewModel.getCursorColumnSelectData(), args);
                if (result === null) {
                    // invalid arguments
                    return;
                }
                viewModel.setCursorStates(args.source, 3 /* CursorChangeReason.Explicit */, result.viewStates.map((viewState) => cursorCommon_1.CursorState.fromViewState(viewState)));
                viewModel.setCursorColumnSelectData({
                    isReal: true,
                    fromViewLineNumber: result.fromLineNumber,
                    fromViewVisualColumn: result.fromVisualColumn,
                    toViewLineNumber: result.toLineNumber,
                    toViewVisualColumn: result.toVisualColumn
                });
                if (result.reversed) {
                    viewModel.revealTopMostCursor(args.source);
                }
                else {
                    viewModel.revealBottomMostCursor(args.source);
                }
            }
        }
        CoreNavigationCommands.ColumnSelect = (0, editorExtensions_1.registerEditorCommand)(new class extends ColumnSelectCommand {
            constructor() {
                super({
                    id: 'columnSelect',
                    precondition: undefined
                });
            }
            _getColumnSelectResult(viewModel, primary, prevColumnSelectData, args) {
                if (typeof args.position === 'undefined' || typeof args.viewPosition === 'undefined' || typeof args.mouseColumn === 'undefined') {
                    return null;
                }
                // validate `args`
                const validatedPosition = viewModel.model.validatePosition(args.position);
                const validatedViewPosition = viewModel.coordinatesConverter.validateViewPosition(new position_1.Position(args.viewPosition.lineNumber, args.viewPosition.column), validatedPosition);
                const fromViewLineNumber = args.doColumnSelect ? prevColumnSelectData.fromViewLineNumber : validatedViewPosition.lineNumber;
                const fromViewVisualColumn = args.doColumnSelect ? prevColumnSelectData.fromViewVisualColumn : args.mouseColumn - 1;
                return cursorColumnSelection_1.ColumnSelection.columnSelect(viewModel.cursorConfig, viewModel, fromViewLineNumber, fromViewVisualColumn, validatedViewPosition.lineNumber, args.mouseColumn - 1);
            }
        });
        CoreNavigationCommands.CursorColumnSelectLeft = (0, editorExtensions_1.registerEditorCommand)(new class extends ColumnSelectCommand {
            constructor() {
                super({
                    id: 'cursorColumnSelectLeft',
                    precondition: undefined,
                    kbOpts: {
                        weight: CORE_WEIGHT,
                        kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 15 /* KeyCode.LeftArrow */,
                        linux: { primary: 0 }
                    }
                });
            }
            _getColumnSelectResult(viewModel, primary, prevColumnSelectData, args) {
                return cursorColumnSelection_1.ColumnSelection.columnSelectLeft(viewModel.cursorConfig, viewModel, prevColumnSelectData);
            }
        });
        CoreNavigationCommands.CursorColumnSelectRight = (0, editorExtensions_1.registerEditorCommand)(new class extends ColumnSelectCommand {
            constructor() {
                super({
                    id: 'cursorColumnSelectRight',
                    precondition: undefined,
                    kbOpts: {
                        weight: CORE_WEIGHT,
                        kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 17 /* KeyCode.RightArrow */,
                        linux: { primary: 0 }
                    }
                });
            }
            _getColumnSelectResult(viewModel, primary, prevColumnSelectData, args) {
                return cursorColumnSelection_1.ColumnSelection.columnSelectRight(viewModel.cursorConfig, viewModel, prevColumnSelectData);
            }
        });
        class ColumnSelectUpCommand extends ColumnSelectCommand {
            constructor(opts) {
                super(opts);
                this._isPaged = opts.isPaged;
            }
            _getColumnSelectResult(viewModel, primary, prevColumnSelectData, args) {
                return cursorColumnSelection_1.ColumnSelection.columnSelectUp(viewModel.cursorConfig, viewModel, prevColumnSelectData, this._isPaged);
            }
        }
        CoreNavigationCommands.CursorColumnSelectUp = (0, editorExtensions_1.registerEditorCommand)(new ColumnSelectUpCommand({
            isPaged: false,
            id: 'cursorColumnSelectUp',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */,
                linux: { primary: 0 }
            }
        }));
        CoreNavigationCommands.CursorColumnSelectPageUp = (0, editorExtensions_1.registerEditorCommand)(new ColumnSelectUpCommand({
            isPaged: true,
            id: 'cursorColumnSelectPageUp',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 11 /* KeyCode.PageUp */,
                linux: { primary: 0 }
            }
        }));
        class ColumnSelectDownCommand extends ColumnSelectCommand {
            constructor(opts) {
                super(opts);
                this._isPaged = opts.isPaged;
            }
            _getColumnSelectResult(viewModel, primary, prevColumnSelectData, args) {
                return cursorColumnSelection_1.ColumnSelection.columnSelectDown(viewModel.cursorConfig, viewModel, prevColumnSelectData, this._isPaged);
            }
        }
        CoreNavigationCommands.CursorColumnSelectDown = (0, editorExtensions_1.registerEditorCommand)(new ColumnSelectDownCommand({
            isPaged: false,
            id: 'cursorColumnSelectDown',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 18 /* KeyCode.DownArrow */,
                linux: { primary: 0 }
            }
        }));
        CoreNavigationCommands.CursorColumnSelectPageDown = (0, editorExtensions_1.registerEditorCommand)(new ColumnSelectDownCommand({
            isPaged: true,
            id: 'cursorColumnSelectPageDown',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 12 /* KeyCode.PageDown */,
                linux: { primary: 0 }
            }
        }));
        class CursorMoveImpl extends CoreEditorCommand {
            constructor() {
                super({
                    id: 'cursorMove',
                    precondition: undefined,
                    description: cursorMoveCommands_1.CursorMove.description
                });
            }
            runCoreEditorCommand(viewModel, args) {
                const parsed = cursorMoveCommands_1.CursorMove.parse(args);
                if (!parsed) {
                    // illegal arguments
                    return;
                }
                this._runCursorMove(viewModel, args.source, parsed);
            }
            _runCursorMove(viewModel, source, args) {
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(source, 3 /* CursorChangeReason.Explicit */, CursorMoveImpl._move(viewModel, viewModel.getCursorStates(), args));
                viewModel.revealPrimaryCursor(source, true);
            }
            static _move(viewModel, cursors, args) {
                const inSelectionMode = args.select;
                const value = args.value;
                switch (args.direction) {
                    case 0 /* CursorMove_.Direction.Left */:
                    case 1 /* CursorMove_.Direction.Right */:
                    case 2 /* CursorMove_.Direction.Up */:
                    case 3 /* CursorMove_.Direction.Down */:
                    case 4 /* CursorMove_.Direction.PrevBlankLine */:
                    case 5 /* CursorMove_.Direction.NextBlankLine */:
                    case 6 /* CursorMove_.Direction.WrappedLineStart */:
                    case 7 /* CursorMove_.Direction.WrappedLineFirstNonWhitespaceCharacter */:
                    case 8 /* CursorMove_.Direction.WrappedLineColumnCenter */:
                    case 9 /* CursorMove_.Direction.WrappedLineEnd */:
                    case 10 /* CursorMove_.Direction.WrappedLineLastNonWhitespaceCharacter */:
                        return cursorMoveCommands_1.CursorMoveCommands.simpleMove(viewModel, cursors, args.direction, inSelectionMode, value, args.unit);
                    case 11 /* CursorMove_.Direction.ViewPortTop */:
                    case 13 /* CursorMove_.Direction.ViewPortBottom */:
                    case 12 /* CursorMove_.Direction.ViewPortCenter */:
                    case 14 /* CursorMove_.Direction.ViewPortIfOutside */:
                        return cursorMoveCommands_1.CursorMoveCommands.viewportMove(viewModel, cursors, args.direction, inSelectionMode, value);
                    default:
                        return null;
                }
            }
        }
        CoreNavigationCommands.CursorMoveImpl = CursorMoveImpl;
        CoreNavigationCommands.CursorMove = (0, editorExtensions_1.registerEditorCommand)(new CursorMoveImpl());
        let Constants;
        (function (Constants) {
            Constants[Constants["PAGE_SIZE_MARKER"] = -1] = "PAGE_SIZE_MARKER";
        })(Constants || (Constants = {}));
        class CursorMoveBasedCommand extends CoreEditorCommand {
            constructor(opts) {
                super(opts);
                this._staticArgs = opts.args;
            }
            runCoreEditorCommand(viewModel, dynamicArgs) {
                let args = this._staticArgs;
                if (this._staticArgs.value === -1 /* Constants.PAGE_SIZE_MARKER */) {
                    // -1 is a marker for page size
                    args = {
                        direction: this._staticArgs.direction,
                        unit: this._staticArgs.unit,
                        select: this._staticArgs.select,
                        value: dynamicArgs.pageSize || viewModel.cursorConfig.pageSize
                    };
                }
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(dynamicArgs.source, 3 /* CursorChangeReason.Explicit */, cursorMoveCommands_1.CursorMoveCommands.simpleMove(viewModel, viewModel.getCursorStates(), args.direction, args.select, args.value, args.unit));
                viewModel.revealPrimaryCursor(dynamicArgs.source, true);
            }
        }
        CoreNavigationCommands.CursorLeft = (0, editorExtensions_1.registerEditorCommand)(new CursorMoveBasedCommand({
            args: {
                direction: 0 /* CursorMove_.Direction.Left */,
                unit: 0 /* CursorMove_.Unit.None */,
                select: false,
                value: 1
            },
            id: 'cursorLeft',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 15 /* KeyCode.LeftArrow */,
                mac: { primary: 15 /* KeyCode.LeftArrow */, secondary: [256 /* KeyMod.WinCtrl */ | 32 /* KeyCode.KeyB */] }
            }
        }));
        CoreNavigationCommands.CursorLeftSelect = (0, editorExtensions_1.registerEditorCommand)(new CursorMoveBasedCommand({
            args: {
                direction: 0 /* CursorMove_.Direction.Left */,
                unit: 0 /* CursorMove_.Unit.None */,
                select: true,
                value: 1
            },
            id: 'cursorLeftSelect',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 1024 /* KeyMod.Shift */ | 15 /* KeyCode.LeftArrow */
            }
        }));
        CoreNavigationCommands.CursorRight = (0, editorExtensions_1.registerEditorCommand)(new CursorMoveBasedCommand({
            args: {
                direction: 1 /* CursorMove_.Direction.Right */,
                unit: 0 /* CursorMove_.Unit.None */,
                select: false,
                value: 1
            },
            id: 'cursorRight',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 17 /* KeyCode.RightArrow */,
                mac: { primary: 17 /* KeyCode.RightArrow */, secondary: [256 /* KeyMod.WinCtrl */ | 36 /* KeyCode.KeyF */] }
            }
        }));
        CoreNavigationCommands.CursorRightSelect = (0, editorExtensions_1.registerEditorCommand)(new CursorMoveBasedCommand({
            args: {
                direction: 1 /* CursorMove_.Direction.Right */,
                unit: 0 /* CursorMove_.Unit.None */,
                select: true,
                value: 1
            },
            id: 'cursorRightSelect',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 1024 /* KeyMod.Shift */ | 17 /* KeyCode.RightArrow */
            }
        }));
        CoreNavigationCommands.CursorUp = (0, editorExtensions_1.registerEditorCommand)(new CursorMoveBasedCommand({
            args: {
                direction: 2 /* CursorMove_.Direction.Up */,
                unit: 2 /* CursorMove_.Unit.WrappedLine */,
                select: false,
                value: 1
            },
            id: 'cursorUp',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 16 /* KeyCode.UpArrow */,
                mac: { primary: 16 /* KeyCode.UpArrow */, secondary: [256 /* KeyMod.WinCtrl */ | 46 /* KeyCode.KeyP */] }
            }
        }));
        CoreNavigationCommands.CursorUpSelect = (0, editorExtensions_1.registerEditorCommand)(new CursorMoveBasedCommand({
            args: {
                direction: 2 /* CursorMove_.Direction.Up */,
                unit: 2 /* CursorMove_.Unit.WrappedLine */,
                select: true,
                value: 1
            },
            id: 'cursorUpSelect',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 1024 /* KeyMod.Shift */ | 16 /* KeyCode.UpArrow */,
                secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 16 /* KeyCode.UpArrow */],
                mac: { primary: 1024 /* KeyMod.Shift */ | 16 /* KeyCode.UpArrow */ },
                linux: { primary: 1024 /* KeyMod.Shift */ | 16 /* KeyCode.UpArrow */ }
            }
        }));
        CoreNavigationCommands.CursorPageUp = (0, editorExtensions_1.registerEditorCommand)(new CursorMoveBasedCommand({
            args: {
                direction: 2 /* CursorMove_.Direction.Up */,
                unit: 2 /* CursorMove_.Unit.WrappedLine */,
                select: false,
                value: -1 /* Constants.PAGE_SIZE_MARKER */
            },
            id: 'cursorPageUp',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 11 /* KeyCode.PageUp */
            }
        }));
        CoreNavigationCommands.CursorPageUpSelect = (0, editorExtensions_1.registerEditorCommand)(new CursorMoveBasedCommand({
            args: {
                direction: 2 /* CursorMove_.Direction.Up */,
                unit: 2 /* CursorMove_.Unit.WrappedLine */,
                select: true,
                value: -1 /* Constants.PAGE_SIZE_MARKER */
            },
            id: 'cursorPageUpSelect',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 1024 /* KeyMod.Shift */ | 11 /* KeyCode.PageUp */
            }
        }));
        CoreNavigationCommands.CursorDown = (0, editorExtensions_1.registerEditorCommand)(new CursorMoveBasedCommand({
            args: {
                direction: 3 /* CursorMove_.Direction.Down */,
                unit: 2 /* CursorMove_.Unit.WrappedLine */,
                select: false,
                value: 1
            },
            id: 'cursorDown',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 18 /* KeyCode.DownArrow */,
                mac: { primary: 18 /* KeyCode.DownArrow */, secondary: [256 /* KeyMod.WinCtrl */ | 44 /* KeyCode.KeyN */] }
            }
        }));
        CoreNavigationCommands.CursorDownSelect = (0, editorExtensions_1.registerEditorCommand)(new CursorMoveBasedCommand({
            args: {
                direction: 3 /* CursorMove_.Direction.Down */,
                unit: 2 /* CursorMove_.Unit.WrappedLine */,
                select: true,
                value: 1
            },
            id: 'cursorDownSelect',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 1024 /* KeyMod.Shift */ | 18 /* KeyCode.DownArrow */,
                secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 18 /* KeyCode.DownArrow */],
                mac: { primary: 1024 /* KeyMod.Shift */ | 18 /* KeyCode.DownArrow */ },
                linux: { primary: 1024 /* KeyMod.Shift */ | 18 /* KeyCode.DownArrow */ }
            }
        }));
        CoreNavigationCommands.CursorPageDown = (0, editorExtensions_1.registerEditorCommand)(new CursorMoveBasedCommand({
            args: {
                direction: 3 /* CursorMove_.Direction.Down */,
                unit: 2 /* CursorMove_.Unit.WrappedLine */,
                select: false,
                value: -1 /* Constants.PAGE_SIZE_MARKER */
            },
            id: 'cursorPageDown',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 12 /* KeyCode.PageDown */
            }
        }));
        CoreNavigationCommands.CursorPageDownSelect = (0, editorExtensions_1.registerEditorCommand)(new CursorMoveBasedCommand({
            args: {
                direction: 3 /* CursorMove_.Direction.Down */,
                unit: 2 /* CursorMove_.Unit.WrappedLine */,
                select: true,
                value: -1 /* Constants.PAGE_SIZE_MARKER */
            },
            id: 'cursorPageDownSelect',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 1024 /* KeyMod.Shift */ | 12 /* KeyCode.PageDown */
            }
        }));
        CoreNavigationCommands.CreateCursor = (0, editorExtensions_1.registerEditorCommand)(new class extends CoreEditorCommand {
            constructor() {
                super({
                    id: 'createCursor',
                    precondition: undefined
                });
            }
            runCoreEditorCommand(viewModel, args) {
                if (!args.position) {
                    return;
                }
                let newState;
                if (args.wholeLine) {
                    newState = cursorMoveCommands_1.CursorMoveCommands.line(viewModel, viewModel.getPrimaryCursorState(), false, args.position, args.viewPosition);
                }
                else {
                    newState = cursorMoveCommands_1.CursorMoveCommands.moveTo(viewModel, viewModel.getPrimaryCursorState(), false, args.position, args.viewPosition);
                }
                const states = viewModel.getCursorStates();
                // Check if we should remove a cursor (sort of like a toggle)
                if (states.length > 1) {
                    const newModelPosition = (newState.modelState ? newState.modelState.position : null);
                    const newViewPosition = (newState.viewState ? newState.viewState.position : null);
                    for (let i = 0, len = states.length; i < len; i++) {
                        const state = states[i];
                        if (newModelPosition && !state.modelState.selection.containsPosition(newModelPosition)) {
                            continue;
                        }
                        if (newViewPosition && !state.viewState.selection.containsPosition(newViewPosition)) {
                            continue;
                        }
                        // => Remove the cursor
                        states.splice(i, 1);
                        viewModel.model.pushStackElement();
                        viewModel.setCursorStates(args.source, 3 /* CursorChangeReason.Explicit */, states);
                        return;
                    }
                }
                // => Add the new cursor
                states.push(newState);
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* CursorChangeReason.Explicit */, states);
            }
        });
        CoreNavigationCommands.LastCursorMoveToSelect = (0, editorExtensions_1.registerEditorCommand)(new class extends CoreEditorCommand {
            constructor() {
                super({
                    id: '_lastCursorMoveToSelect',
                    precondition: undefined
                });
            }
            runCoreEditorCommand(viewModel, args) {
                if (!args.position) {
                    return;
                }
                const lastAddedCursorIndex = viewModel.getLastAddedCursorIndex();
                const states = viewModel.getCursorStates();
                const newStates = states.slice(0);
                newStates[lastAddedCursorIndex] = cursorMoveCommands_1.CursorMoveCommands.moveTo(viewModel, states[lastAddedCursorIndex], true, args.position, args.viewPosition);
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* CursorChangeReason.Explicit */, newStates);
            }
        });
        class HomeCommand extends CoreEditorCommand {
            constructor(opts) {
                super(opts);
                this._inSelectionMode = opts.inSelectionMode;
            }
            runCoreEditorCommand(viewModel, args) {
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* CursorChangeReason.Explicit */, cursorMoveCommands_1.CursorMoveCommands.moveToBeginningOfLine(viewModel, viewModel.getCursorStates(), this._inSelectionMode));
                viewModel.revealPrimaryCursor(args.source, true);
            }
        }
        CoreNavigationCommands.CursorHome = (0, editorExtensions_1.registerEditorCommand)(new HomeCommand({
            inSelectionMode: false,
            id: 'cursorHome',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 14 /* KeyCode.Home */,
                mac: { primary: 14 /* KeyCode.Home */, secondary: [2048 /* KeyMod.CtrlCmd */ | 15 /* KeyCode.LeftArrow */] }
            }
        }));
        CoreNavigationCommands.CursorHomeSelect = (0, editorExtensions_1.registerEditorCommand)(new HomeCommand({
            inSelectionMode: true,
            id: 'cursorHomeSelect',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 1024 /* KeyMod.Shift */ | 14 /* KeyCode.Home */,
                mac: { primary: 1024 /* KeyMod.Shift */ | 14 /* KeyCode.Home */, secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 15 /* KeyCode.LeftArrow */] }
            }
        }));
        class LineStartCommand extends CoreEditorCommand {
            constructor(opts) {
                super(opts);
                this._inSelectionMode = opts.inSelectionMode;
            }
            runCoreEditorCommand(viewModel, args) {
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* CursorChangeReason.Explicit */, this._exec(viewModel.getCursorStates()));
                viewModel.revealPrimaryCursor(args.source, true);
            }
            _exec(cursors) {
                const result = [];
                for (let i = 0, len = cursors.length; i < len; i++) {
                    const cursor = cursors[i];
                    const lineNumber = cursor.modelState.position.lineNumber;
                    result[i] = cursorCommon_1.CursorState.fromModelState(cursor.modelState.move(this._inSelectionMode, lineNumber, 1, 0));
                }
                return result;
            }
        }
        CoreNavigationCommands.CursorLineStart = (0, editorExtensions_1.registerEditorCommand)(new LineStartCommand({
            inSelectionMode: false,
            id: 'cursorLineStart',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 0,
                mac: { primary: 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */ }
            }
        }));
        CoreNavigationCommands.CursorLineStartSelect = (0, editorExtensions_1.registerEditorCommand)(new LineStartCommand({
            inSelectionMode: true,
            id: 'cursorLineStartSelect',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 0,
                mac: { primary: 256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 31 /* KeyCode.KeyA */ }
            }
        }));
        class EndCommand extends CoreEditorCommand {
            constructor(opts) {
                super(opts);
                this._inSelectionMode = opts.inSelectionMode;
            }
            runCoreEditorCommand(viewModel, args) {
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* CursorChangeReason.Explicit */, cursorMoveCommands_1.CursorMoveCommands.moveToEndOfLine(viewModel, viewModel.getCursorStates(), this._inSelectionMode, args.sticky || false));
                viewModel.revealPrimaryCursor(args.source, true);
            }
        }
        CoreNavigationCommands.CursorEnd = (0, editorExtensions_1.registerEditorCommand)(new EndCommand({
            inSelectionMode: false,
            id: 'cursorEnd',
            precondition: undefined,
            kbOpts: {
                args: { sticky: false },
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 13 /* KeyCode.End */,
                mac: { primary: 13 /* KeyCode.End */, secondary: [2048 /* KeyMod.CtrlCmd */ | 17 /* KeyCode.RightArrow */] }
            },
            description: {
                description: `Go to End`,
                args: [{
                        name: 'args',
                        schema: {
                            type: 'object',
                            properties: {
                                'sticky': {
                                    description: nls.localize('stickydesc', "Stick to the end even when going to longer lines"),
                                    type: 'boolean',
                                    default: false
                                }
                            }
                        }
                    }]
            }
        }));
        CoreNavigationCommands.CursorEndSelect = (0, editorExtensions_1.registerEditorCommand)(new EndCommand({
            inSelectionMode: true,
            id: 'cursorEndSelect',
            precondition: undefined,
            kbOpts: {
                args: { sticky: false },
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 1024 /* KeyMod.Shift */ | 13 /* KeyCode.End */,
                mac: { primary: 1024 /* KeyMod.Shift */ | 13 /* KeyCode.End */, secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 17 /* KeyCode.RightArrow */] }
            },
            description: {
                description: `Select to End`,
                args: [{
                        name: 'args',
                        schema: {
                            type: 'object',
                            properties: {
                                'sticky': {
                                    description: nls.localize('stickydesc', "Stick to the end even when going to longer lines"),
                                    type: 'boolean',
                                    default: false
                                }
                            }
                        }
                    }]
            }
        }));
        class LineEndCommand extends CoreEditorCommand {
            constructor(opts) {
                super(opts);
                this._inSelectionMode = opts.inSelectionMode;
            }
            runCoreEditorCommand(viewModel, args) {
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* CursorChangeReason.Explicit */, this._exec(viewModel, viewModel.getCursorStates()));
                viewModel.revealPrimaryCursor(args.source, true);
            }
            _exec(viewModel, cursors) {
                const result = [];
                for (let i = 0, len = cursors.length; i < len; i++) {
                    const cursor = cursors[i];
                    const lineNumber = cursor.modelState.position.lineNumber;
                    const maxColumn = viewModel.model.getLineMaxColumn(lineNumber);
                    result[i] = cursorCommon_1.CursorState.fromModelState(cursor.modelState.move(this._inSelectionMode, lineNumber, maxColumn, 0));
                }
                return result;
            }
        }
        CoreNavigationCommands.CursorLineEnd = (0, editorExtensions_1.registerEditorCommand)(new LineEndCommand({
            inSelectionMode: false,
            id: 'cursorLineEnd',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 0,
                mac: { primary: 256 /* KeyMod.WinCtrl */ | 35 /* KeyCode.KeyE */ }
            }
        }));
        CoreNavigationCommands.CursorLineEndSelect = (0, editorExtensions_1.registerEditorCommand)(new LineEndCommand({
            inSelectionMode: true,
            id: 'cursorLineEndSelect',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 0,
                mac: { primary: 256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 35 /* KeyCode.KeyE */ }
            }
        }));
        class TopCommand extends CoreEditorCommand {
            constructor(opts) {
                super(opts);
                this._inSelectionMode = opts.inSelectionMode;
            }
            runCoreEditorCommand(viewModel, args) {
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* CursorChangeReason.Explicit */, cursorMoveCommands_1.CursorMoveCommands.moveToBeginningOfBuffer(viewModel, viewModel.getCursorStates(), this._inSelectionMode));
                viewModel.revealPrimaryCursor(args.source, true);
            }
        }
        CoreNavigationCommands.CursorTop = (0, editorExtensions_1.registerEditorCommand)(new TopCommand({
            inSelectionMode: false,
            id: 'cursorTop',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 2048 /* KeyMod.CtrlCmd */ | 14 /* KeyCode.Home */,
                mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */ }
            }
        }));
        CoreNavigationCommands.CursorTopSelect = (0, editorExtensions_1.registerEditorCommand)(new TopCommand({
            inSelectionMode: true,
            id: 'cursorTopSelect',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 14 /* KeyCode.Home */,
                mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 16 /* KeyCode.UpArrow */ }
            }
        }));
        class BottomCommand extends CoreEditorCommand {
            constructor(opts) {
                super(opts);
                this._inSelectionMode = opts.inSelectionMode;
            }
            runCoreEditorCommand(viewModel, args) {
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* CursorChangeReason.Explicit */, cursorMoveCommands_1.CursorMoveCommands.moveToEndOfBuffer(viewModel, viewModel.getCursorStates(), this._inSelectionMode));
                viewModel.revealPrimaryCursor(args.source, true);
            }
        }
        CoreNavigationCommands.CursorBottom = (0, editorExtensions_1.registerEditorCommand)(new BottomCommand({
            inSelectionMode: false,
            id: 'cursorBottom',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 2048 /* KeyMod.CtrlCmd */ | 13 /* KeyCode.End */,
                mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */ }
            }
        }));
        CoreNavigationCommands.CursorBottomSelect = (0, editorExtensions_1.registerEditorCommand)(new BottomCommand({
            inSelectionMode: true,
            id: 'cursorBottomSelect',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 13 /* KeyCode.End */,
                mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 18 /* KeyCode.DownArrow */ }
            }
        }));
        class EditorScrollImpl extends CoreEditorCommand {
            constructor() {
                super({
                    id: 'editorScroll',
                    precondition: undefined,
                    description: EditorScroll_.description
                });
            }
            determineScrollMethod(args) {
                const horizontalUnits = [6 /* EditorScroll_.Unit.Column */];
                const verticalUnits = [
                    1 /* EditorScroll_.Unit.Line */,
                    2 /* EditorScroll_.Unit.WrappedLine */,
                    3 /* EditorScroll_.Unit.Page */,
                    4 /* EditorScroll_.Unit.HalfPage */,
                    5 /* EditorScroll_.Unit.Editor */,
                    6 /* EditorScroll_.Unit.Column */
                ];
                const horizontalDirections = [4 /* EditorScroll_.Direction.Left */, 2 /* EditorScroll_.Direction.Right */];
                const verticalDirections = [1 /* EditorScroll_.Direction.Up */, 3 /* EditorScroll_.Direction.Down */];
                if (horizontalUnits.includes(args.unit) && horizontalDirections.includes(args.direction)) {
                    return this._runHorizontalEditorScroll.bind(this);
                }
                if (verticalUnits.includes(args.unit) && verticalDirections.includes(args.direction)) {
                    return this._runVerticalEditorScroll.bind(this);
                }
                return null;
            }
            runCoreEditorCommand(viewModel, args) {
                const parsed = EditorScroll_.parse(args);
                if (!parsed) {
                    // illegal arguments
                    return;
                }
                const runEditorScroll = this.determineScrollMethod(parsed);
                if (!runEditorScroll) {
                    // Incompatible unit and direction
                    return;
                }
                runEditorScroll(viewModel, args.source, parsed);
            }
            _runVerticalEditorScroll(viewModel, source, args) {
                const desiredScrollTop = this._computeDesiredScrollTop(viewModel, args);
                if (args.revealCursor) {
                    // must ensure cursor is in new visible range
                    const desiredVisibleViewRange = viewModel.getCompletelyVisibleViewRangeAtScrollTop(desiredScrollTop);
                    viewModel.setCursorStates(source, 3 /* CursorChangeReason.Explicit */, [
                        cursorMoveCommands_1.CursorMoveCommands.findPositionInViewportIfOutside(viewModel, viewModel.getPrimaryCursorState(), desiredVisibleViewRange, args.select)
                    ]);
                }
                viewModel.viewLayout.setScrollPosition({ scrollTop: desiredScrollTop }, 0 /* ScrollType.Smooth */);
            }
            _computeDesiredScrollTop(viewModel, args) {
                if (args.unit === 1 /* EditorScroll_.Unit.Line */) {
                    // scrolling by model lines
                    const futureViewport = viewModel.viewLayout.getFutureViewport();
                    const visibleViewRange = viewModel.getCompletelyVisibleViewRangeAtScrollTop(futureViewport.top);
                    const visibleModelRange = viewModel.coordinatesConverter.convertViewRangeToModelRange(visibleViewRange);
                    let desiredTopModelLineNumber;
                    if (args.direction === 1 /* EditorScroll_.Direction.Up */) {
                        // must go x model lines up
                        desiredTopModelLineNumber = Math.max(1, visibleModelRange.startLineNumber - args.value);
                    }
                    else {
                        // must go x model lines down
                        desiredTopModelLineNumber = Math.min(viewModel.model.getLineCount(), visibleModelRange.startLineNumber + args.value);
                    }
                    const viewPosition = viewModel.coordinatesConverter.convertModelPositionToViewPosition(new position_1.Position(desiredTopModelLineNumber, 1));
                    return viewModel.viewLayout.getVerticalOffsetForLineNumber(viewPosition.lineNumber);
                }
                if (args.unit === 5 /* EditorScroll_.Unit.Editor */) {
                    let desiredTopModelLineNumber = 0;
                    if (args.direction === 3 /* EditorScroll_.Direction.Down */) {
                        desiredTopModelLineNumber = viewModel.model.getLineCount() - viewModel.cursorConfig.pageSize;
                    }
                    return viewModel.viewLayout.getVerticalOffsetForLineNumber(desiredTopModelLineNumber);
                }
                let noOfLines;
                if (args.unit === 3 /* EditorScroll_.Unit.Page */) {
                    noOfLines = viewModel.cursorConfig.pageSize * args.value;
                }
                else if (args.unit === 4 /* EditorScroll_.Unit.HalfPage */) {
                    noOfLines = Math.round(viewModel.cursorConfig.pageSize / 2) * args.value;
                }
                else {
                    noOfLines = args.value;
                }
                const deltaLines = (args.direction === 1 /* EditorScroll_.Direction.Up */ ? -1 : 1) * noOfLines;
                return viewModel.viewLayout.getCurrentScrollTop() + deltaLines * viewModel.cursorConfig.lineHeight;
            }
            _runHorizontalEditorScroll(viewModel, source, args) {
                const desiredScrollLeft = this._computeDesiredScrollLeft(viewModel, args);
                viewModel.viewLayout.setScrollPosition({ scrollLeft: desiredScrollLeft }, 0 /* ScrollType.Smooth */);
            }
            _computeDesiredScrollLeft(viewModel, args) {
                const deltaColumns = (args.direction === 4 /* EditorScroll_.Direction.Left */ ? -1 : 1) * args.value;
                return viewModel.viewLayout.getCurrentScrollLeft() + deltaColumns * viewModel.cursorConfig.typicalHalfwidthCharacterWidth;
            }
        }
        CoreNavigationCommands.EditorScrollImpl = EditorScrollImpl;
        CoreNavigationCommands.EditorScroll = (0, editorExtensions_1.registerEditorCommand)(new EditorScrollImpl());
        CoreNavigationCommands.ScrollLineUp = (0, editorExtensions_1.registerEditorCommand)(new class extends CoreEditorCommand {
            constructor() {
                super({
                    id: 'scrollLineUp',
                    precondition: undefined,
                    kbOpts: {
                        weight: CORE_WEIGHT,
                        kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                        primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */,
                        mac: { primary: 256 /* KeyMod.WinCtrl */ | 11 /* KeyCode.PageUp */ }
                    }
                });
            }
            runCoreEditorCommand(viewModel, args) {
                CoreNavigationCommands.EditorScroll.runCoreEditorCommand(viewModel, {
                    to: EditorScroll_.RawDirection.Up,
                    by: EditorScroll_.RawUnit.WrappedLine,
                    value: 1,
                    revealCursor: false,
                    select: false,
                    source: args.source
                });
            }
        });
        CoreNavigationCommands.ScrollPageUp = (0, editorExtensions_1.registerEditorCommand)(new class extends CoreEditorCommand {
            constructor() {
                super({
                    id: 'scrollPageUp',
                    precondition: undefined,
                    kbOpts: {
                        weight: CORE_WEIGHT,
                        kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                        primary: 2048 /* KeyMod.CtrlCmd */ | 11 /* KeyCode.PageUp */,
                        win: { primary: 512 /* KeyMod.Alt */ | 11 /* KeyCode.PageUp */ },
                        linux: { primary: 512 /* KeyMod.Alt */ | 11 /* KeyCode.PageUp */ }
                    }
                });
            }
            runCoreEditorCommand(viewModel, args) {
                CoreNavigationCommands.EditorScroll.runCoreEditorCommand(viewModel, {
                    to: EditorScroll_.RawDirection.Up,
                    by: EditorScroll_.RawUnit.Page,
                    value: 1,
                    revealCursor: false,
                    select: false,
                    source: args.source
                });
            }
        });
        CoreNavigationCommands.ScrollEditorTop = (0, editorExtensions_1.registerEditorCommand)(new class extends CoreEditorCommand {
            constructor() {
                super({
                    id: 'scrollEditorTop',
                    precondition: undefined,
                    kbOpts: {
                        weight: CORE_WEIGHT,
                        kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    }
                });
            }
            runCoreEditorCommand(viewModel, args) {
                CoreNavigationCommands.EditorScroll.runCoreEditorCommand(viewModel, {
                    to: EditorScroll_.RawDirection.Up,
                    by: EditorScroll_.RawUnit.Editor,
                    value: 1,
                    revealCursor: false,
                    select: false,
                    source: args.source
                });
            }
        });
        CoreNavigationCommands.ScrollLineDown = (0, editorExtensions_1.registerEditorCommand)(new class extends CoreEditorCommand {
            constructor() {
                super({
                    id: 'scrollLineDown',
                    precondition: undefined,
                    kbOpts: {
                        weight: CORE_WEIGHT,
                        kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                        primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
                        mac: { primary: 256 /* KeyMod.WinCtrl */ | 12 /* KeyCode.PageDown */ }
                    }
                });
            }
            runCoreEditorCommand(viewModel, args) {
                CoreNavigationCommands.EditorScroll.runCoreEditorCommand(viewModel, {
                    to: EditorScroll_.RawDirection.Down,
                    by: EditorScroll_.RawUnit.WrappedLine,
                    value: 1,
                    revealCursor: false,
                    select: false,
                    source: args.source
                });
            }
        });
        CoreNavigationCommands.ScrollPageDown = (0, editorExtensions_1.registerEditorCommand)(new class extends CoreEditorCommand {
            constructor() {
                super({
                    id: 'scrollPageDown',
                    precondition: undefined,
                    kbOpts: {
                        weight: CORE_WEIGHT,
                        kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                        primary: 2048 /* KeyMod.CtrlCmd */ | 12 /* KeyCode.PageDown */,
                        win: { primary: 512 /* KeyMod.Alt */ | 12 /* KeyCode.PageDown */ },
                        linux: { primary: 512 /* KeyMod.Alt */ | 12 /* KeyCode.PageDown */ }
                    }
                });
            }
            runCoreEditorCommand(viewModel, args) {
                CoreNavigationCommands.EditorScroll.runCoreEditorCommand(viewModel, {
                    to: EditorScroll_.RawDirection.Down,
                    by: EditorScroll_.RawUnit.Page,
                    value: 1,
                    revealCursor: false,
                    select: false,
                    source: args.source
                });
            }
        });
        CoreNavigationCommands.ScrollEditorBottom = (0, editorExtensions_1.registerEditorCommand)(new class extends CoreEditorCommand {
            constructor() {
                super({
                    id: 'scrollEditorBottom',
                    precondition: undefined,
                    kbOpts: {
                        weight: CORE_WEIGHT,
                        kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    }
                });
            }
            runCoreEditorCommand(viewModel, args) {
                CoreNavigationCommands.EditorScroll.runCoreEditorCommand(viewModel, {
                    to: EditorScroll_.RawDirection.Down,
                    by: EditorScroll_.RawUnit.Editor,
                    value: 1,
                    revealCursor: false,
                    select: false,
                    source: args.source
                });
            }
        });
        CoreNavigationCommands.ScrollLeft = (0, editorExtensions_1.registerEditorCommand)(new class extends CoreEditorCommand {
            constructor() {
                super({
                    id: 'scrollLeft',
                    precondition: undefined,
                    kbOpts: {
                        weight: CORE_WEIGHT,
                        kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    }
                });
            }
            runCoreEditorCommand(viewModel, args) {
                CoreNavigationCommands.EditorScroll.runCoreEditorCommand(viewModel, {
                    to: EditorScroll_.RawDirection.Left,
                    by: EditorScroll_.RawUnit.Column,
                    value: 2,
                    revealCursor: false,
                    select: false,
                    source: args.source
                });
            }
        });
        CoreNavigationCommands.ScrollRight = (0, editorExtensions_1.registerEditorCommand)(new class extends CoreEditorCommand {
            constructor() {
                super({
                    id: 'scrollRight',
                    precondition: undefined,
                    kbOpts: {
                        weight: CORE_WEIGHT,
                        kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    }
                });
            }
            runCoreEditorCommand(viewModel, args) {
                CoreNavigationCommands.EditorScroll.runCoreEditorCommand(viewModel, {
                    to: EditorScroll_.RawDirection.Right,
                    by: EditorScroll_.RawUnit.Column,
                    value: 2,
                    revealCursor: false,
                    select: false,
                    source: args.source
                });
            }
        });
        class WordCommand extends CoreEditorCommand {
            constructor(opts) {
                super(opts);
                this._inSelectionMode = opts.inSelectionMode;
            }
            runCoreEditorCommand(viewModel, args) {
                if (!args.position) {
                    return;
                }
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* CursorChangeReason.Explicit */, [
                    cursorMoveCommands_1.CursorMoveCommands.word(viewModel, viewModel.getPrimaryCursorState(), this._inSelectionMode, args.position)
                ]);
                if (args.revealType !== 2 /* NavigationCommandRevealType.None */) {
                    viewModel.revealPrimaryCursor(args.source, true, true);
                }
            }
        }
        CoreNavigationCommands.WordSelect = (0, editorExtensions_1.registerEditorCommand)(new WordCommand({
            inSelectionMode: false,
            id: '_wordSelect',
            precondition: undefined
        }));
        CoreNavigationCommands.WordSelectDrag = (0, editorExtensions_1.registerEditorCommand)(new WordCommand({
            inSelectionMode: true,
            id: '_wordSelectDrag',
            precondition: undefined
        }));
        CoreNavigationCommands.LastCursorWordSelect = (0, editorExtensions_1.registerEditorCommand)(new class extends CoreEditorCommand {
            constructor() {
                super({
                    id: 'lastCursorWordSelect',
                    precondition: undefined
                });
            }
            runCoreEditorCommand(viewModel, args) {
                if (!args.position) {
                    return;
                }
                const lastAddedCursorIndex = viewModel.getLastAddedCursorIndex();
                const states = viewModel.getCursorStates();
                const newStates = states.slice(0);
                const lastAddedState = states[lastAddedCursorIndex];
                newStates[lastAddedCursorIndex] = cursorMoveCommands_1.CursorMoveCommands.word(viewModel, lastAddedState, lastAddedState.modelState.hasSelection(), args.position);
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* CursorChangeReason.Explicit */, newStates);
            }
        });
        class LineCommand extends CoreEditorCommand {
            constructor(opts) {
                super(opts);
                this._inSelectionMode = opts.inSelectionMode;
            }
            runCoreEditorCommand(viewModel, args) {
                if (!args.position) {
                    return;
                }
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* CursorChangeReason.Explicit */, [
                    cursorMoveCommands_1.CursorMoveCommands.line(viewModel, viewModel.getPrimaryCursorState(), this._inSelectionMode, args.position, args.viewPosition)
                ]);
                if (args.revealType !== 2 /* NavigationCommandRevealType.None */) {
                    viewModel.revealPrimaryCursor(args.source, false, true);
                }
            }
        }
        CoreNavigationCommands.LineSelect = (0, editorExtensions_1.registerEditorCommand)(new LineCommand({
            inSelectionMode: false,
            id: '_lineSelect',
            precondition: undefined
        }));
        CoreNavigationCommands.LineSelectDrag = (0, editorExtensions_1.registerEditorCommand)(new LineCommand({
            inSelectionMode: true,
            id: '_lineSelectDrag',
            precondition: undefined
        }));
        class LastCursorLineCommand extends CoreEditorCommand {
            constructor(opts) {
                super(opts);
                this._inSelectionMode = opts.inSelectionMode;
            }
            runCoreEditorCommand(viewModel, args) {
                if (!args.position) {
                    return;
                }
                const lastAddedCursorIndex = viewModel.getLastAddedCursorIndex();
                const states = viewModel.getCursorStates();
                const newStates = states.slice(0);
                newStates[lastAddedCursorIndex] = cursorMoveCommands_1.CursorMoveCommands.line(viewModel, states[lastAddedCursorIndex], this._inSelectionMode, args.position, args.viewPosition);
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* CursorChangeReason.Explicit */, newStates);
            }
        }
        CoreNavigationCommands.LastCursorLineSelect = (0, editorExtensions_1.registerEditorCommand)(new LastCursorLineCommand({
            inSelectionMode: false,
            id: 'lastCursorLineSelect',
            precondition: undefined
        }));
        CoreNavigationCommands.LastCursorLineSelectDrag = (0, editorExtensions_1.registerEditorCommand)(new LastCursorLineCommand({
            inSelectionMode: true,
            id: 'lastCursorLineSelectDrag',
            precondition: undefined
        }));
        CoreNavigationCommands.CancelSelection = (0, editorExtensions_1.registerEditorCommand)(new class extends CoreEditorCommand {
            constructor() {
                super({
                    id: 'cancelSelection',
                    precondition: editorContextKeys_1.EditorContextKeys.hasNonEmptySelection,
                    kbOpts: {
                        weight: CORE_WEIGHT,
                        kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                        primary: 9 /* KeyCode.Escape */,
                        secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */]
                    }
                });
            }
            runCoreEditorCommand(viewModel, args) {
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* CursorChangeReason.Explicit */, [
                    cursorMoveCommands_1.CursorMoveCommands.cancelSelection(viewModel, viewModel.getPrimaryCursorState())
                ]);
                viewModel.revealPrimaryCursor(args.source, true);
            }
        });
        CoreNavigationCommands.RemoveSecondaryCursors = (0, editorExtensions_1.registerEditorCommand)(new class extends CoreEditorCommand {
            constructor() {
                super({
                    id: 'removeSecondaryCursors',
                    precondition: editorContextKeys_1.EditorContextKeys.hasMultipleSelections,
                    kbOpts: {
                        weight: CORE_WEIGHT + 1,
                        kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                        primary: 9 /* KeyCode.Escape */,
                        secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */]
                    }
                });
            }
            runCoreEditorCommand(viewModel, args) {
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* CursorChangeReason.Explicit */, [
                    viewModel.getPrimaryCursorState()
                ]);
                viewModel.revealPrimaryCursor(args.source, true);
                (0, aria_1.status)(nls.localize('removedCursor', "Removed secondary cursors"));
            }
        });
        CoreNavigationCommands.RevealLine = (0, editorExtensions_1.registerEditorCommand)(new class extends CoreEditorCommand {
            constructor() {
                super({
                    id: 'revealLine',
                    precondition: undefined,
                    description: RevealLine_.description
                });
            }
            runCoreEditorCommand(viewModel, args) {
                const revealLineArg = args;
                const lineNumberArg = revealLineArg.lineNumber || 0;
                let lineNumber = typeof lineNumberArg === 'number' ? (lineNumberArg + 1) : (parseInt(lineNumberArg) + 1);
                if (lineNumber < 1) {
                    lineNumber = 1;
                }
                const lineCount = viewModel.model.getLineCount();
                if (lineNumber > lineCount) {
                    lineNumber = lineCount;
                }
                const range = new range_1.Range(lineNumber, 1, lineNumber, viewModel.model.getLineMaxColumn(lineNumber));
                let revealAt = 0 /* VerticalRevealType.Simple */;
                if (revealLineArg.at) {
                    switch (revealLineArg.at) {
                        case RevealLine_.RawAtArgument.Top:
                            revealAt = 3 /* VerticalRevealType.Top */;
                            break;
                        case RevealLine_.RawAtArgument.Center:
                            revealAt = 1 /* VerticalRevealType.Center */;
                            break;
                        case RevealLine_.RawAtArgument.Bottom:
                            revealAt = 4 /* VerticalRevealType.Bottom */;
                            break;
                        default:
                            break;
                    }
                }
                const viewRange = viewModel.coordinatesConverter.convertModelRangeToViewRange(range);
                viewModel.revealRange(args.source, false, viewRange, revealAt, 0 /* ScrollType.Smooth */);
            }
        });
        CoreNavigationCommands.SelectAll = new class extends EditorOrNativeTextInputCommand {
            constructor() {
                super(editorExtensions_1.SelectAllCommand);
            }
            runDOMCommand(activeElement) {
                if (browser_1.isFirefox) {
                    activeElement.focus();
                    activeElement.select();
                }
                activeElement.ownerDocument.execCommand('selectAll');
            }
            runEditorCommand(accessor, editor, args) {
                const viewModel = editor._getViewModel();
                if (!viewModel) {
                    // the editor has no view => has no cursors
                    return;
                }
                this.runCoreEditorCommand(viewModel, args);
            }
            runCoreEditorCommand(viewModel, args) {
                viewModel.model.pushStackElement();
                viewModel.setCursorStates('keyboard', 3 /* CursorChangeReason.Explicit */, [
                    cursorMoveCommands_1.CursorMoveCommands.selectAll(viewModel, viewModel.getPrimaryCursorState())
                ]);
            }
        }();
        CoreNavigationCommands.SetSelection = (0, editorExtensions_1.registerEditorCommand)(new class extends CoreEditorCommand {
            constructor() {
                super({
                    id: 'setSelection',
                    precondition: undefined
                });
            }
            runCoreEditorCommand(viewModel, args) {
                if (!args.selection) {
                    return;
                }
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* CursorChangeReason.Explicit */, [
                    cursorCommon_1.CursorState.fromModelSelection(args.selection)
                ]);
            }
        });
    })(CoreNavigationCommands || (exports.CoreNavigationCommands = CoreNavigationCommands = {}));
    const columnSelectionCondition = contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.textInputFocus, editorContextKeys_1.EditorContextKeys.columnSelection);
    function registerColumnSelection(id, keybinding) {
        keybindingsRegistry_1.KeybindingsRegistry.registerKeybindingRule({
            id: id,
            primary: keybinding,
            when: columnSelectionCondition,
            weight: CORE_WEIGHT + 1
        });
    }
    registerColumnSelection(CoreNavigationCommands.CursorColumnSelectLeft.id, 1024 /* KeyMod.Shift */ | 15 /* KeyCode.LeftArrow */);
    registerColumnSelection(CoreNavigationCommands.CursorColumnSelectRight.id, 1024 /* KeyMod.Shift */ | 17 /* KeyCode.RightArrow */);
    registerColumnSelection(CoreNavigationCommands.CursorColumnSelectUp.id, 1024 /* KeyMod.Shift */ | 16 /* KeyCode.UpArrow */);
    registerColumnSelection(CoreNavigationCommands.CursorColumnSelectPageUp.id, 1024 /* KeyMod.Shift */ | 11 /* KeyCode.PageUp */);
    registerColumnSelection(CoreNavigationCommands.CursorColumnSelectDown.id, 1024 /* KeyMod.Shift */ | 18 /* KeyCode.DownArrow */);
    registerColumnSelection(CoreNavigationCommands.CursorColumnSelectPageDown.id, 1024 /* KeyMod.Shift */ | 12 /* KeyCode.PageDown */);
    function registerCommand(command) {
        command.register();
        return command;
    }
    var CoreEditingCommands;
    (function (CoreEditingCommands) {
        class CoreEditingCommand extends editorExtensions_1.EditorCommand {
            runEditorCommand(accessor, editor, args) {
                const viewModel = editor._getViewModel();
                if (!viewModel) {
                    // the editor has no view => has no cursors
                    return;
                }
                this.runCoreEditingCommand(editor, viewModel, args || {});
            }
        }
        CoreEditingCommands.CoreEditingCommand = CoreEditingCommand;
        CoreEditingCommands.LineBreakInsert = (0, editorExtensions_1.registerEditorCommand)(new class extends CoreEditingCommand {
            constructor() {
                super({
                    id: 'lineBreakInsert',
                    precondition: editorContextKeys_1.EditorContextKeys.writable,
                    kbOpts: {
                        weight: CORE_WEIGHT,
                        kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                        primary: 0,
                        mac: { primary: 256 /* KeyMod.WinCtrl */ | 45 /* KeyCode.KeyO */ }
                    }
                });
            }
            runCoreEditingCommand(editor, viewModel, args) {
                editor.pushUndoStop();
                editor.executeCommands(this.id, cursorTypeOperations_1.TypeOperations.lineBreakInsert(viewModel.cursorConfig, viewModel.model, viewModel.getCursorStates().map(s => s.modelState.selection)));
            }
        });
        CoreEditingCommands.Outdent = (0, editorExtensions_1.registerEditorCommand)(new class extends CoreEditingCommand {
            constructor() {
                super({
                    id: 'outdent',
                    precondition: editorContextKeys_1.EditorContextKeys.writable,
                    kbOpts: {
                        weight: CORE_WEIGHT,
                        kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.editorTextFocus, editorContextKeys_1.EditorContextKeys.tabDoesNotMoveFocus),
                        primary: 1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */
                    }
                });
            }
            runCoreEditingCommand(editor, viewModel, args) {
                editor.pushUndoStop();
                editor.executeCommands(this.id, cursorTypeOperations_1.TypeOperations.outdent(viewModel.cursorConfig, viewModel.model, viewModel.getCursorStates().map(s => s.modelState.selection)));
                editor.pushUndoStop();
            }
        });
        CoreEditingCommands.Tab = (0, editorExtensions_1.registerEditorCommand)(new class extends CoreEditingCommand {
            constructor() {
                super({
                    id: 'tab',
                    precondition: editorContextKeys_1.EditorContextKeys.writable,
                    kbOpts: {
                        weight: CORE_WEIGHT,
                        kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.editorTextFocus, editorContextKeys_1.EditorContextKeys.tabDoesNotMoveFocus),
                        primary: 2 /* KeyCode.Tab */
                    }
                });
            }
            runCoreEditingCommand(editor, viewModel, args) {
                editor.pushUndoStop();
                editor.executeCommands(this.id, cursorTypeOperations_1.TypeOperations.tab(viewModel.cursorConfig, viewModel.model, viewModel.getCursorStates().map(s => s.modelState.selection)));
                editor.pushUndoStop();
            }
        });
        CoreEditingCommands.DeleteLeft = (0, editorExtensions_1.registerEditorCommand)(new class extends CoreEditingCommand {
            constructor() {
                super({
                    id: 'deleteLeft',
                    precondition: undefined,
                    kbOpts: {
                        weight: CORE_WEIGHT,
                        kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                        primary: 1 /* KeyCode.Backspace */,
                        secondary: [1024 /* KeyMod.Shift */ | 1 /* KeyCode.Backspace */],
                        mac: { primary: 1 /* KeyCode.Backspace */, secondary: [1024 /* KeyMod.Shift */ | 1 /* KeyCode.Backspace */, 256 /* KeyMod.WinCtrl */ | 38 /* KeyCode.KeyH */, 256 /* KeyMod.WinCtrl */ | 1 /* KeyCode.Backspace */] }
                    }
                });
            }
            runCoreEditingCommand(editor, viewModel, args) {
                const [shouldPushStackElementBefore, commands] = cursorDeleteOperations_1.DeleteOperations.deleteLeft(viewModel.getPrevEditOperationType(), viewModel.cursorConfig, viewModel.model, viewModel.getCursorStates().map(s => s.modelState.selection), viewModel.getCursorAutoClosedCharacters());
                if (shouldPushStackElementBefore) {
                    editor.pushUndoStop();
                }
                editor.executeCommands(this.id, commands);
                viewModel.setPrevEditOperationType(2 /* EditOperationType.DeletingLeft */);
            }
        });
        CoreEditingCommands.DeleteRight = (0, editorExtensions_1.registerEditorCommand)(new class extends CoreEditingCommand {
            constructor() {
                super({
                    id: 'deleteRight',
                    precondition: undefined,
                    kbOpts: {
                        weight: CORE_WEIGHT,
                        kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                        primary: 20 /* KeyCode.Delete */,
                        mac: { primary: 20 /* KeyCode.Delete */, secondary: [256 /* KeyMod.WinCtrl */ | 34 /* KeyCode.KeyD */, 256 /* KeyMod.WinCtrl */ | 20 /* KeyCode.Delete */] }
                    }
                });
            }
            runCoreEditingCommand(editor, viewModel, args) {
                const [shouldPushStackElementBefore, commands] = cursorDeleteOperations_1.DeleteOperations.deleteRight(viewModel.getPrevEditOperationType(), viewModel.cursorConfig, viewModel.model, viewModel.getCursorStates().map(s => s.modelState.selection));
                if (shouldPushStackElementBefore) {
                    editor.pushUndoStop();
                }
                editor.executeCommands(this.id, commands);
                viewModel.setPrevEditOperationType(3 /* EditOperationType.DeletingRight */);
            }
        });
        CoreEditingCommands.Undo = new class extends EditorOrNativeTextInputCommand {
            constructor() {
                super(editorExtensions_1.UndoCommand);
            }
            runDOMCommand(activeElement) {
                activeElement.ownerDocument.execCommand('undo');
            }
            runEditorCommand(accessor, editor, args) {
                if (!editor.hasModel() || editor.getOption(90 /* EditorOption.readOnly */) === true) {
                    return;
                }
                return editor.getModel().undo();
            }
        }();
        CoreEditingCommands.Redo = new class extends EditorOrNativeTextInputCommand {
            constructor() {
                super(editorExtensions_1.RedoCommand);
            }
            runDOMCommand(activeElement) {
                activeElement.ownerDocument.execCommand('redo');
            }
            runEditorCommand(accessor, editor, args) {
                if (!editor.hasModel() || editor.getOption(90 /* EditorOption.readOnly */) === true) {
                    return;
                }
                return editor.getModel().redo();
            }
        }();
    })(CoreEditingCommands || (exports.CoreEditingCommands = CoreEditingCommands = {}));
    /**
     * A command that will invoke a command on the focused editor.
     */
    class EditorHandlerCommand extends editorExtensions_1.Command {
        constructor(id, handlerId, description) {
            super({
                id: id,
                precondition: undefined,
                description: description
            });
            this._handlerId = handlerId;
        }
        runCommand(accessor, args) {
            const editor = accessor.get(codeEditorService_1.ICodeEditorService).getFocusedCodeEditor();
            if (!editor) {
                return;
            }
            editor.trigger('keyboard', this._handlerId, args);
        }
    }
    function registerOverwritableCommand(handlerId, description) {
        registerCommand(new EditorHandlerCommand('default:' + handlerId, handlerId));
        registerCommand(new EditorHandlerCommand(handlerId, handlerId, description));
    }
    registerOverwritableCommand("type" /* Handler.Type */, {
        description: `Type`,
        args: [{
                name: 'args',
                schema: {
                    'type': 'object',
                    'required': ['text'],
                    'properties': {
                        'text': {
                            'type': 'string'
                        }
                    },
                }
            }]
    });
    registerOverwritableCommand("replacePreviousChar" /* Handler.ReplacePreviousChar */);
    registerOverwritableCommand("compositionType" /* Handler.CompositionType */);
    registerOverwritableCommand("compositionStart" /* Handler.CompositionStart */);
    registerOverwritableCommand("compositionEnd" /* Handler.CompositionEnd */);
    registerOverwritableCommand("paste" /* Handler.Paste */);
    registerOverwritableCommand("cut" /* Handler.Cut */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZUNvbW1hbmRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvY29yZUNvbW1hbmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQThCaEcsTUFBTSxXQUFXLHNDQUE4QixDQUFDO0lBRWhELE1BQXNCLGlCQUFxQixTQUFRLGdDQUFhO1FBQ3hELGdCQUFnQixDQUFDLFFBQWlDLEVBQUUsTUFBbUIsRUFBRSxJQUF3QjtZQUN2RyxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDekMsSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDZiwyQ0FBMkM7Z0JBQzNDLE9BQU87YUFDUDtZQUNELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ2xELENBQUM7S0FHRDtJQVhELDhDQVdDO0lBRUQsSUFBaUIsYUFBYSxDQXdMN0I7SUF4TEQsV0FBaUIsYUFBYTtRQUU3QixNQUFNLGtCQUFrQixHQUFHLFVBQVUsR0FBUTtZQUM1QyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDekIsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELE1BQU0sU0FBUyxHQUFpQixHQUFHLENBQUM7WUFFcEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUNsQyxPQUFPLEtBQUssQ0FBQzthQUNiO1lBRUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUU7Z0JBQ3RFLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCxJQUFJLENBQUMsS0FBSyxDQUFD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