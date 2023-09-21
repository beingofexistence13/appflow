/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/languages/supports", "vs/editor/common/core/cursorColumns", "vs/editor/common/core/indentation"], function (require, exports, position_1, range_1, selection_1, supports_1, cursorColumns_1, indentation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$OU = exports.$NU = exports.$MU = exports.SelectionStartKind = exports.$LU = exports.$KU = exports.$JU = exports.$IU = exports.EditOperationType = void 0;
    /**
     * This is an operation type that will be recorded for undo/redo purposes.
     * The goal is to introduce an undo stop when the controller switches between different operation types.
     */
    var EditOperationType;
    (function (EditOperationType) {
        EditOperationType[EditOperationType["Other"] = 0] = "Other";
        EditOperationType[EditOperationType["DeletingLeft"] = 2] = "DeletingLeft";
        EditOperationType[EditOperationType["DeletingRight"] = 3] = "DeletingRight";
        EditOperationType[EditOperationType["TypingOther"] = 4] = "TypingOther";
        EditOperationType[EditOperationType["TypingFirstSpace"] = 5] = "TypingFirstSpace";
        EditOperationType[EditOperationType["TypingConsecutiveSpace"] = 6] = "TypingConsecutiveSpace";
    })(EditOperationType || (exports.EditOperationType = EditOperationType = {}));
    const autoCloseAlways = () => true;
    const autoCloseNever = () => false;
    const autoCloseBeforeWhitespace = (chr) => (chr === ' ' || chr === '\t');
    class $IU {
        static shouldRecreate(e) {
            return (e.hasChanged(143 /* EditorOption.layoutInfo */)
                || e.hasChanged(129 /* EditorOption.wordSeparators */)
                || e.hasChanged(37 /* EditorOption.emptySelectionClipboard */)
                || e.hasChanged(76 /* EditorOption.multiCursorMergeOverlapping */)
                || e.hasChanged(78 /* EditorOption.multiCursorPaste */)
                || e.hasChanged(79 /* EditorOption.multiCursorLimit */)
                || e.hasChanged(6 /* EditorOption.autoClosingBrackets */)
                || e.hasChanged(7 /* EditorOption.autoClosingComments */)
                || e.hasChanged(11 /* EditorOption.autoClosingQuotes */)
                || e.hasChanged(9 /* EditorOption.autoClosingDelete */)
                || e.hasChanged(10 /* EditorOption.autoClosingOvertype */)
                || e.hasChanged(14 /* EditorOption.autoSurround */)
                || e.hasChanged(127 /* EditorOption.useTabStops */)
                || e.hasChanged(50 /* EditorOption.fontInfo */)
                || e.hasChanged(90 /* EditorOption.readOnly */));
        }
        constructor(languageId, modelOptions, configuration, languageConfigurationService) {
            this.languageConfigurationService = languageConfigurationService;
            this._cursorMoveConfigurationBrand = undefined;
            this.a = languageId;
            const options = configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            const fontInfo = options.get(50 /* EditorOption.fontInfo */);
            this.readOnly = options.get(90 /* EditorOption.readOnly */);
            this.tabSize = modelOptions.tabSize;
            this.indentSize = modelOptions.indentSize;
            this.insertSpaces = modelOptions.insertSpaces;
            this.stickyTabStops = options.get(115 /* EditorOption.stickyTabStops */);
            this.lineHeight = fontInfo.lineHeight;
            this.typicalHalfwidthCharacterWidth = fontInfo.typicalHalfwidthCharacterWidth;
            this.pageSize = Math.max(1, Math.floor(layoutInfo.height / this.lineHeight) - 2);
            this.useTabStops = options.get(127 /* EditorOption.useTabStops */);
            this.wordSeparators = options.get(129 /* EditorOption.wordSeparators */);
            this.emptySelectionClipboard = options.get(37 /* EditorOption.emptySelectionClipboard */);
            this.copyWithSyntaxHighlighting = options.get(25 /* EditorOption.copyWithSyntaxHighlighting */);
            this.multiCursorMergeOverlapping = options.get(76 /* EditorOption.multiCursorMergeOverlapping */);
            this.multiCursorPaste = options.get(78 /* EditorOption.multiCursorPaste */);
            this.multiCursorLimit = options.get(79 /* EditorOption.multiCursorLimit */);
            this.autoClosingBrackets = options.get(6 /* EditorOption.autoClosingBrackets */);
            this.autoClosingComments = options.get(7 /* EditorOption.autoClosingComments */);
            this.autoClosingQuotes = options.get(11 /* EditorOption.autoClosingQuotes */);
            this.autoClosingDelete = options.get(9 /* EditorOption.autoClosingDelete */);
            this.autoClosingOvertype = options.get(10 /* EditorOption.autoClosingOvertype */);
            this.autoSurround = options.get(14 /* EditorOption.autoSurround */);
            this.autoIndent = options.get(12 /* EditorOption.autoIndent */);
            this.surroundingPairs = {};
            this.b = null;
            this.shouldAutoCloseBefore = {
                quote: this.d(languageId, this.autoClosingQuotes, true),
                comment: this.d(languageId, this.autoClosingComments, false),
                bracket: this.d(languageId, this.autoClosingBrackets, false),
            };
            this.autoClosingPairs = this.languageConfigurationService.getLanguageConfiguration(languageId).getAutoClosingPairs();
            const surroundingPairs = this.languageConfigurationService.getLanguageConfiguration(languageId).getSurroundingPairs();
            if (surroundingPairs) {
                for (const pair of surroundingPairs) {
                    this.surroundingPairs[pair.open] = pair.close;
                }
            }
            const commentsConfiguration = this.languageConfigurationService.getLanguageConfiguration(languageId).comments;
            this.blockCommentStartToken = commentsConfiguration?.blockCommentStartToken ?? null;
        }
        get electricChars() {
            if (!this.b) {
                this.b = {};
                const electricChars = this.languageConfigurationService.getLanguageConfiguration(this.a).electricCharacter?.getElectricCharacters();
                if (electricChars) {
                    for (const char of electricChars) {
                        this.b[char] = true;
                    }
                }
            }
            return this.b;
        }
        /**
         * Should return opening bracket type to match indentation with
         */
        onElectricCharacter(character, context, column) {
            const scopedLineTokens = (0, supports_1.$dt)(context, column - 1);
            const electricCharacterSupport = this.languageConfigurationService.getLanguageConfiguration(scopedLineTokens.languageId).electricCharacter;
            if (!electricCharacterSupport) {
                return null;
            }
            return electricCharacterSupport.onElectricCharacter(character, scopedLineTokens, column - scopedLineTokens.firstCharOffset);
        }
        normalizeIndentation(str) {
            return (0, indentation_1.$HA)(str, this.indentSize, this.insertSpaces);
        }
        d(languageId, autoCloseConfig, forQuotes) {
            switch (autoCloseConfig) {
                case 'beforeWhitespace':
                    return autoCloseBeforeWhitespace;
                case 'languageDefined':
                    return this.f(languageId, forQuotes);
                case 'always':
                    return autoCloseAlways;
                case 'never':
                    return autoCloseNever;
            }
        }
        f(languageId, forQuotes) {
            const autoCloseBeforeSet = this.languageConfigurationService.getLanguageConfiguration(languageId).getAutoCloseBeforeSet(forQuotes);
            return c => autoCloseBeforeSet.indexOf(c) !== -1;
        }
        /**
         * Returns a visible column from a column.
         * @see {@link $mt}
         */
        visibleColumnFromColumn(model, position) {
            return cursorColumns_1.$mt.visibleColumnFromColumn(model.getLineContent(position.lineNumber), position.column, this.tabSize);
        }
        /**
         * Returns a visible column from a column.
         * @see {@link $mt}
         */
        columnFromVisibleColumn(model, lineNumber, visibleColumn) {
            const result = cursorColumns_1.$mt.columnFromVisibleColumn(model.getLineContent(lineNumber), visibleColumn, this.tabSize);
            const minColumn = model.getLineMinColumn(lineNumber);
            if (result < minColumn) {
                return minColumn;
            }
            const maxColumn = model.getLineMaxColumn(lineNumber);
            if (result > maxColumn) {
                return maxColumn;
            }
            return result;
        }
    }
    exports.$IU = $IU;
    class $JU {
        static fromModelState(modelState) {
            return new $KU(modelState);
        }
        static fromViewState(viewState) {
            return new $LU(viewState);
        }
        static fromModelSelection(modelSelection) {
            const selection = selection_1.$ms.liftSelection(modelSelection);
            const modelState = new $MU(range_1.$ks.fromPositions(selection.getSelectionStart()), 0 /* SelectionStartKind.Simple */, 0, selection.getPosition(), 0);
            return $JU.fromModelState(modelState);
        }
        static fromModelSelections(modelSelections) {
            const states = [];
            for (let i = 0, len = modelSelections.length; i < len; i++) {
                states[i] = this.fromModelSelection(modelSelections[i]);
            }
            return states;
        }
        constructor(modelState, viewState) {
            this._cursorStateBrand = undefined;
            this.modelState = modelState;
            this.viewState = viewState;
        }
        equals(other) {
            return (this.viewState.equals(other.viewState) && this.modelState.equals(other.modelState));
        }
    }
    exports.$JU = $JU;
    class $KU {
        constructor(modelState) {
            this.modelState = modelState;
            this.viewState = null;
        }
    }
    exports.$KU = $KU;
    class $LU {
        constructor(viewState) {
            this.modelState = null;
            this.viewState = viewState;
        }
    }
    exports.$LU = $LU;
    var SelectionStartKind;
    (function (SelectionStartKind) {
        SelectionStartKind[SelectionStartKind["Simple"] = 0] = "Simple";
        SelectionStartKind[SelectionStartKind["Word"] = 1] = "Word";
        SelectionStartKind[SelectionStartKind["Line"] = 2] = "Line";
    })(SelectionStartKind || (exports.SelectionStartKind = SelectionStartKind = {}));
    /**
     * Represents the cursor state on either the model or on the view model.
     */
    class $MU {
        constructor(selectionStart, selectionStartKind, selectionStartLeftoverVisibleColumns, position, leftoverVisibleColumns) {
            this.selectionStart = selectionStart;
            this.selectionStartKind = selectionStartKind;
            this.selectionStartLeftoverVisibleColumns = selectionStartLeftoverVisibleColumns;
            this.position = position;
            this.leftoverVisibleColumns = leftoverVisibleColumns;
            this._singleCursorStateBrand = undefined;
            this.selection = $MU.a(this.selectionStart, this.position);
        }
        equals(other) {
            return (this.selectionStartLeftoverVisibleColumns === other.selectionStartLeftoverVisibleColumns
                && this.leftoverVisibleColumns === other.leftoverVisibleColumns
                && this.selectionStartKind === other.selectionStartKind
                && this.position.equals(other.position)
                && this.selectionStart.equalsRange(other.selectionStart));
        }
        hasSelection() {
            return (!this.selection.isEmpty() || !this.selectionStart.isEmpty());
        }
        move(inSelectionMode, lineNumber, column, leftoverVisibleColumns) {
            if (inSelectionMode) {
                // move just position
                return new $MU(this.selectionStart, this.selectionStartKind, this.selectionStartLeftoverVisibleColumns, new position_1.$js(lineNumber, column), leftoverVisibleColumns);
            }
            else {
                // move everything
                return new $MU(new range_1.$ks(lineNumber, column, lineNumber, column), 0 /* SelectionStartKind.Simple */, leftoverVisibleColumns, new position_1.$js(lineNumber, column), leftoverVisibleColumns);
            }
        }
        static a(selectionStart, position) {
            if (selectionStart.isEmpty() || !position.isBeforeOrEqual(selectionStart.getStartPosition())) {
                return selection_1.$ms.fromPositions(selectionStart.getStartPosition(), position);
            }
            else {
                return selection_1.$ms.fromPositions(selectionStart.getEndPosition(), position);
            }
        }
    }
    exports.$MU = $MU;
    class $NU {
        constructor(type, commands, opts) {
            this._editOperationResultBrand = undefined;
            this.type = type;
            this.commands = commands;
            this.shouldPushStackElementBefore = opts.shouldPushStackElementBefore;
            this.shouldPushStackElementAfter = opts.shouldPushStackElementAfter;
        }
    }
    exports.$NU = $NU;
    function $OU(ch) {
        return (ch === '\'' || ch === '"' || ch === '`');
    }
    exports.$OU = $OU;
});
//# sourceMappingURL=cursorCommon.js.map