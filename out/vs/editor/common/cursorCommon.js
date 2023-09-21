/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/languages/supports", "vs/editor/common/core/cursorColumns", "vs/editor/common/core/indentation"], function (require, exports, position_1, range_1, selection_1, supports_1, cursorColumns_1, indentation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isQuote = exports.EditOperationResult = exports.SingleCursorState = exports.SelectionStartKind = exports.PartialViewCursorState = exports.PartialModelCursorState = exports.CursorState = exports.CursorConfiguration = exports.EditOperationType = void 0;
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
    class CursorConfiguration {
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
            this._languageId = languageId;
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
            this._electricChars = null;
            this.shouldAutoCloseBefore = {
                quote: this._getShouldAutoClose(languageId, this.autoClosingQuotes, true),
                comment: this._getShouldAutoClose(languageId, this.autoClosingComments, false),
                bracket: this._getShouldAutoClose(languageId, this.autoClosingBrackets, false),
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
            if (!this._electricChars) {
                this._electricChars = {};
                const electricChars = this.languageConfigurationService.getLanguageConfiguration(this._languageId).electricCharacter?.getElectricCharacters();
                if (electricChars) {
                    for (const char of electricChars) {
                        this._electricChars[char] = true;
                    }
                }
            }
            return this._electricChars;
        }
        /**
         * Should return opening bracket type to match indentation with
         */
        onElectricCharacter(character, context, column) {
            const scopedLineTokens = (0, supports_1.createScopedLineTokens)(context, column - 1);
            const electricCharacterSupport = this.languageConfigurationService.getLanguageConfiguration(scopedLineTokens.languageId).electricCharacter;
            if (!electricCharacterSupport) {
                return null;
            }
            return electricCharacterSupport.onElectricCharacter(character, scopedLineTokens, column - scopedLineTokens.firstCharOffset);
        }
        normalizeIndentation(str) {
            return (0, indentation_1.normalizeIndentation)(str, this.indentSize, this.insertSpaces);
        }
        _getShouldAutoClose(languageId, autoCloseConfig, forQuotes) {
            switch (autoCloseConfig) {
                case 'beforeWhitespace':
                    return autoCloseBeforeWhitespace;
                case 'languageDefined':
                    return this._getLanguageDefinedShouldAutoClose(languageId, forQuotes);
                case 'always':
                    return autoCloseAlways;
                case 'never':
                    return autoCloseNever;
            }
        }
        _getLanguageDefinedShouldAutoClose(languageId, forQuotes) {
            const autoCloseBeforeSet = this.languageConfigurationService.getLanguageConfiguration(languageId).getAutoCloseBeforeSet(forQuotes);
            return c => autoCloseBeforeSet.indexOf(c) !== -1;
        }
        /**
         * Returns a visible column from a column.
         * @see {@link CursorColumns}
         */
        visibleColumnFromColumn(model, position) {
            return cursorColumns_1.CursorColumns.visibleColumnFromColumn(model.getLineContent(position.lineNumber), position.column, this.tabSize);
        }
        /**
         * Returns a visible column from a column.
         * @see {@link CursorColumns}
         */
        columnFromVisibleColumn(model, lineNumber, visibleColumn) {
            const result = cursorColumns_1.CursorColumns.columnFromVisibleColumn(model.getLineContent(lineNumber), visibleColumn, this.tabSize);
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
    exports.CursorConfiguration = CursorConfiguration;
    class CursorState {
        static fromModelState(modelState) {
            return new PartialModelCursorState(modelState);
        }
        static fromViewState(viewState) {
            return new PartialViewCursorState(viewState);
        }
        static fromModelSelection(modelSelection) {
            const selection = selection_1.Selection.liftSelection(modelSelection);
            const modelState = new SingleCursorState(range_1.Range.fromPositions(selection.getSelectionStart()), 0 /* SelectionStartKind.Simple */, 0, selection.getPosition(), 0);
            return CursorState.fromModelState(modelState);
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
    exports.CursorState = CursorState;
    class PartialModelCursorState {
        constructor(modelState) {
            this.modelState = modelState;
            this.viewState = null;
        }
    }
    exports.PartialModelCursorState = PartialModelCursorState;
    class PartialViewCursorState {
        constructor(viewState) {
            this.modelState = null;
            this.viewState = viewState;
        }
    }
    exports.PartialViewCursorState = PartialViewCursorState;
    var SelectionStartKind;
    (function (SelectionStartKind) {
        SelectionStartKind[SelectionStartKind["Simple"] = 0] = "Simple";
        SelectionStartKind[SelectionStartKind["Word"] = 1] = "Word";
        SelectionStartKind[SelectionStartKind["Line"] = 2] = "Line";
    })(SelectionStartKind || (exports.SelectionStartKind = SelectionStartKind = {}));
    /**
     * Represents the cursor state on either the model or on the view model.
     */
    class SingleCursorState {
        constructor(selectionStart, selectionStartKind, selectionStartLeftoverVisibleColumns, position, leftoverVisibleColumns) {
            this.selectionStart = selectionStart;
            this.selectionStartKind = selectionStartKind;
            this.selectionStartLeftoverVisibleColumns = selectionStartLeftoverVisibleColumns;
            this.position = position;
            this.leftoverVisibleColumns = leftoverVisibleColumns;
            this._singleCursorStateBrand = undefined;
            this.selection = SingleCursorState._computeSelection(this.selectionStart, this.position);
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
                return new SingleCursorState(this.selectionStart, this.selectionStartKind, this.selectionStartLeftoverVisibleColumns, new position_1.Position(lineNumber, column), leftoverVisibleColumns);
            }
            else {
                // move everything
                return new SingleCursorState(new range_1.Range(lineNumber, column, lineNumber, column), 0 /* SelectionStartKind.Simple */, leftoverVisibleColumns, new position_1.Position(lineNumber, column), leftoverVisibleColumns);
            }
        }
        static _computeSelection(selectionStart, position) {
            if (selectionStart.isEmpty() || !position.isBeforeOrEqual(selectionStart.getStartPosition())) {
                return selection_1.Selection.fromPositions(selectionStart.getStartPosition(), position);
            }
            else {
                return selection_1.Selection.fromPositions(selectionStart.getEndPosition(), position);
            }
        }
    }
    exports.SingleCursorState = SingleCursorState;
    class EditOperationResult {
        constructor(type, commands, opts) {
            this._editOperationResultBrand = undefined;
            this.type = type;
            this.commands = commands;
            this.shouldPushStackElementBefore = opts.shouldPushStackElementBefore;
            this.shouldPushStackElementAfter = opts.shouldPushStackElementAfter;
        }
    }
    exports.EditOperationResult = EditOperationResult;
    function isQuote(ch) {
        return (ch === '\'' || ch === '"' || ch === '`');
    }
    exports.isQuote = isQuote;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Vyc29yQ29tbW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9jdXJzb3JDb21tb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBeUJoRzs7O09BR0c7SUFDSCxJQUFrQixpQkFPakI7SUFQRCxXQUFrQixpQkFBaUI7UUFDbEMsMkRBQVMsQ0FBQTtRQUNULHlFQUFnQixDQUFBO1FBQ2hCLDJFQUFpQixDQUFBO1FBQ2pCLHVFQUFlLENBQUE7UUFDZixpRkFBb0IsQ0FBQTtRQUNwQiw2RkFBMEIsQ0FBQTtJQUMzQixDQUFDLEVBUGlCLGlCQUFpQixpQ0FBakIsaUJBQWlCLFFBT2xDO0lBTUQsTUFBTSxlQUFlLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO0lBQ25DLE1BQU0sY0FBYyxHQUFHLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztJQUNuQyxNQUFNLHlCQUF5QixHQUFHLENBQUMsR0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLElBQUksR0FBRyxLQUFLLElBQUksQ0FBQyxDQUFDO0lBRWpGLE1BQWEsbUJBQW1CO1FBaUN4QixNQUFNLENBQUMsY0FBYyxDQUFDLENBQTRCO1lBQ3hELE9BQU8sQ0FDTixDQUFDLENBQUMsVUFBVSxtQ0FBeUI7bUJBQ2xDLENBQUMsQ0FBQyxVQUFVLHVDQUE2QjttQkFDekMsQ0FBQyxDQUFDLFVBQVUsK0NBQXNDO21CQUNsRCxDQUFDLENBQUMsVUFBVSxtREFBMEM7bUJBQ3RELENBQUMsQ0FBQyxVQUFVLHdDQUErQjttQkFDM0MsQ0FBQyxDQUFDLFVBQVUsd0NBQStCO21CQUMzQyxDQUFDLENBQUMsVUFBVSwwQ0FBa0M7bUJBQzlDLENBQUMsQ0FBQyxVQUFVLDBDQUFrQzttQkFDOUMsQ0FBQyxDQUFDLFVBQVUseUNBQWdDO21CQUM1QyxDQUFDLENBQUMsVUFBVSx3Q0FBZ0M7bUJBQzVDLENBQUMsQ0FBQyxVQUFVLDJDQUFrQzttQkFDOUMsQ0FBQyxDQUFDLFVBQVUsb0NBQTJCO21CQUN2QyxDQUFDLENBQUMsVUFBVSxvQ0FBMEI7bUJBQ3RDLENBQUMsQ0FBQyxVQUFVLGdDQUF1QjttQkFDbkMsQ0FBQyxDQUFDLFVBQVUsZ0NBQXVCLENBQ3RDLENBQUM7UUFDSCxDQUFDO1FBRUQsWUFDQyxVQUFrQixFQUNsQixZQUFzQyxFQUN0QyxhQUFtQyxFQUNuQiw0QkFBMkQ7WUFBM0QsaUNBQTRCLEdBQTVCLDRCQUE0QixDQUErQjtZQXhENUUsa0NBQTZCLEdBQVMsU0FBUyxDQUFDO1lBMEQvQyxJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztZQUU5QixNQUFNLE9BQU8sR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDO1lBQ3RDLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxHQUFHLG1DQUF5QixDQUFDO1lBQ3hELE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxHQUFHLGdDQUF1QixDQUFDO1lBRXBELElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLEdBQUcsZ0NBQXVCLENBQUM7WUFDbkQsSUFBSSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxVQUFVLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQztZQUMxQyxJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQyxZQUFZLENBQUM7WUFDOUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUMsR0FBRyx1Q0FBNkIsQ0FBQztZQUMvRCxJQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUM7WUFDdEMsSUFBSSxDQUFDLDhCQUE4QixHQUFHLFFBQVEsQ0FBQyw4QkFBOEIsQ0FBQztZQUM5RSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDakYsSUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsR0FBRyxvQ0FBMEIsQ0FBQztZQUN6RCxJQUFJLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQyxHQUFHLHVDQUE2QixDQUFDO1lBQy9ELElBQUksQ0FBQyx1QkFBdUIsR0FBRyxPQUFPLENBQUMsR0FBRywrQ0FBc0MsQ0FBQztZQUNqRixJQUFJLENBQUMsMEJBQTBCLEdBQUcsT0FBTyxDQUFDLEdBQUcsa0RBQXlDLENBQUM7WUFDdkYsSUFBSSxDQUFDLDJCQUEyQixHQUFHLE9BQU8sQ0FBQyxHQUFHLG1EQUEwQyxDQUFDO1lBQ3pGLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsR0FBRyx3Q0FBK0IsQ0FBQztZQUNuRSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLEdBQUcsd0NBQStCLENBQUM7WUFDbkUsSUFBSSxDQUFDLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyxHQUFHLDBDQUFrQyxDQUFDO1lBQ3pFLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxPQUFPLENBQUMsR0FBRywwQ0FBa0MsQ0FBQztZQUN6RSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsT0FBTyxDQUFDLEdBQUcseUNBQWdDLENBQUM7WUFDckUsSUFBSSxDQUFDLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxHQUFHLHdDQUFnQyxDQUFDO1lBQ3JFLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxPQUFPLENBQUMsR0FBRywyQ0FBa0MsQ0FBQztZQUN6RSxJQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxHQUFHLG9DQUEyQixDQUFDO1lBQzNELElBQUksQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLEdBQUcsa0NBQXlCLENBQUM7WUFFdkQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztZQUMzQixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztZQUUzQixJQUFJLENBQUMscUJBQXFCLEdBQUc7Z0JBQzVCLEtBQUssRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUM7Z0JBQ3pFLE9BQU8sRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLENBQUM7Z0JBQzlFLE9BQU8sRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLENBQUM7YUFDOUUsQ0FBQztZQUVGLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsNEJBQTRCLENBQUMsd0JBQXdCLENBQUMsVUFBVSxDQUFDLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztZQUVySCxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyx3QkFBd0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQ3RILElBQUksZ0JBQWdCLEVBQUU7Z0JBQ3JCLEtBQUssTUFBTSxJQUFJLElBQUksZ0JBQWdCLEVBQUU7b0JBQ3BDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztpQkFDOUM7YUFDRDtZQUVELE1BQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLDRCQUE0QixDQUFDLHdCQUF3QixDQUFDLFVBQVUsQ0FBQyxDQUFDLFFBQVEsQ0FBQztZQUM5RyxJQUFJLENBQUMsc0JBQXNCLEdBQUcscUJBQXFCLEVBQUUsc0JBQXNCLElBQUksSUFBSSxDQUFDO1FBQ3JGLENBQUM7UUFFRCxJQUFXLGFBQWE7WUFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUU7Z0JBQ3pCLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO2dCQUN6QixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsNEJBQTRCLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLGlCQUFpQixFQUFFLHFCQUFxQixFQUFFLENBQUM7Z0JBQzlJLElBQUksYUFBYSxFQUFFO29CQUNsQixLQUFLLE1BQU0sSUFBSSxJQUFJLGFBQWEsRUFBRTt3QkFDakMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7cUJBQ2pDO2lCQUNEO2FBQ0Q7WUFDRCxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDNUIsQ0FBQztRQUVEOztXQUVHO1FBQ0ksbUJBQW1CLENBQUMsU0FBaUIsRUFBRSxPQUFtQixFQUFFLE1BQWM7WUFDaEYsTUFBTSxnQkFBZ0IsR0FBRyxJQUFBLGlDQUFzQixFQUFDLE9BQU8sRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckUsTUFBTSx3QkFBd0IsR0FBRyxJQUFJLENBQUMsNEJBQTRCLENBQUMsd0JBQXdCLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUMsaUJBQWlCLENBQUM7WUFDM0ksSUFBSSxDQUFDLHdCQUF3QixFQUFFO2dCQUM5QixPQUFPLElBQUksQ0FBQzthQUNaO1lBQ0QsT0FBTyx3QkFBd0IsQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxHQUFHLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzdILENBQUM7UUFFTSxvQkFBb0IsQ0FBQyxHQUFXO1lBQ3RDLE9BQU8sSUFBQSxrQ0FBb0IsRUFBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDdEUsQ0FBQztRQUVPLG1CQUFtQixDQUFDLFVBQWtCLEVBQUUsZUFBMEMsRUFBRSxTQUFrQjtZQUM3RyxRQUFRLGVBQWUsRUFBRTtnQkFDeEIsS0FBSyxrQkFBa0I7b0JBQ3RCLE9BQU8seUJBQXlCLENBQUM7Z0JBQ2xDLEtBQUssaUJBQWlCO29CQUNyQixPQUFPLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQ3ZFLEtBQUssUUFBUTtvQkFDWixPQUFPLGVBQWUsQ0FBQztnQkFDeEIsS0FBSyxPQUFPO29CQUNYLE9BQU8sY0FBYyxDQUFDO2FBQ3ZCO1FBQ0YsQ0FBQztRQUVPLGtDQUFrQyxDQUFDLFVBQWtCLEVBQUUsU0FBa0I7WUFDaEYsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsNEJBQTRCLENBQUMsd0JBQXdCLENBQUMsVUFBVSxDQUFDLENBQUMscUJBQXFCLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbkksT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBRUQ7OztXQUdHO1FBQ0ksdUJBQXVCLENBQUMsS0FBeUIsRUFBRSxRQUFrQjtZQUMzRSxPQUFPLDZCQUFhLENBQUMsdUJBQXVCLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUUsUUFBUSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDeEgsQ0FBQztRQUVEOzs7V0FHRztRQUNJLHVCQUF1QixDQUFDLEtBQXlCLEVBQUUsVUFBa0IsRUFBRSxhQUFxQjtZQUNsRyxNQUFNLE1BQU0sR0FBRyw2QkFBYSxDQUFDLHVCQUF1QixDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLEVBQUUsYUFBYSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUVwSCxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDckQsSUFBSSxNQUFNLEdBQUcsU0FBUyxFQUFFO2dCQUN2QixPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUVELE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNyRCxJQUFJLE1BQU0sR0FBRyxTQUFTLEVBQUU7Z0JBQ3ZCLE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBRUQsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO0tBQ0Q7SUF4TEQsa0RBd0xDO0lBdUJELE1BQWEsV0FBVztRQUdoQixNQUFNLENBQUMsY0FBYyxDQUFDLFVBQTZCO1lBQ3pELE9BQU8sSUFBSSx1QkFBdUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNoRCxDQUFDO1FBRU0sTUFBTSxDQUFDLGFBQWEsQ0FBQyxTQUE0QjtZQUN2RCxPQUFPLElBQUksc0JBQXNCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUVNLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxjQUEwQjtZQUMxRCxNQUFNLFNBQVMsR0FBRyxxQkFBUyxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUMxRCxNQUFNLFVBQVUsR0FBRyxJQUFJLGlCQUFpQixDQUN2QyxhQUFLLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLHFDQUN2QixDQUFDLEVBQzVCLFNBQVMsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQzFCLENBQUM7WUFDRixPQUFPLFdBQVcsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVNLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxlQUFzQztZQUN2RSxNQUFNLE1BQU0sR0FBOEIsRUFBRSxDQUFDO1lBQzdDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxlQUFlLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzNELE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDeEQ7WUFDRCxPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFLRCxZQUFZLFVBQTZCLEVBQUUsU0FBNEI7WUEvQnZFLHNCQUFpQixHQUFTLFNBQVMsQ0FBQztZQWdDbkMsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7WUFDN0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDNUIsQ0FBQztRQUVNLE1BQU0sQ0FBQyxLQUFrQjtZQUMvQixPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQzdGLENBQUM7S0FDRDtJQXhDRCxrQ0F3Q0M7SUFFRCxNQUFhLHVCQUF1QjtRQUluQyxZQUFZLFVBQTZCO1lBQ3hDLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1lBQzdCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLENBQUM7S0FDRDtJQVJELDBEQVFDO0lBRUQsTUFBYSxzQkFBc0I7UUFJbEMsWUFBWSxTQUE0QjtZQUN2QyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztZQUN2QixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUM1QixDQUFDO0tBQ0Q7SUFSRCx3REFRQztJQUVELElBQWtCLGtCQUlqQjtJQUpELFdBQWtCLGtCQUFrQjtRQUNuQywrREFBTSxDQUFBO1FBQ04sMkRBQUksQ0FBQTtRQUNKLDJEQUFJLENBQUE7SUFDTCxDQUFDLEVBSmlCLGtCQUFrQixrQ0FBbEIsa0JBQWtCLFFBSW5DO0lBRUQ7O09BRUc7SUFDSCxNQUFhLGlCQUFpQjtRQUs3QixZQUNpQixjQUFxQixFQUNyQixrQkFBc0MsRUFDdEMsb0NBQTRDLEVBQzVDLFFBQWtCLEVBQ2xCLHNCQUE4QjtZQUo5QixtQkFBYyxHQUFkLGNBQWMsQ0FBTztZQUNyQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBQ3RDLHlDQUFvQyxHQUFwQyxvQ0FBb0MsQ0FBUTtZQUM1QyxhQUFRLEdBQVIsUUFBUSxDQUFVO1lBQ2xCLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBUTtZQVQvQyw0QkFBdUIsR0FBUyxTQUFTLENBQUM7WUFXekMsSUFBSSxDQUFDLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMxRixDQUFDO1FBRU0sTUFBTSxDQUFDLEtBQXdCO1lBQ3JDLE9BQU8sQ0FDTixJQUFJLENBQUMsb0NBQW9DLEtBQUssS0FBSyxDQUFDLG9DQUFvQzttQkFDckYsSUFBSSxDQUFDLHNCQUFzQixLQUFLLEtBQUssQ0FBQyxzQkFBc0I7bUJBQzVELElBQUksQ0FBQyxrQkFBa0IsS0FBSyxLQUFLLENBQUMsa0JBQWtCO21CQUNwRCxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO21CQUNwQyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQ3hELENBQUM7UUFDSCxDQUFDO1FBRU0sWUFBWTtZQUNsQixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ3RFLENBQUM7UUFFTSxJQUFJLENBQUMsZUFBd0IsRUFBRSxVQUFrQixFQUFFLE1BQWMsRUFBRSxzQkFBOEI7WUFDdkcsSUFBSSxlQUFlLEVBQUU7Z0JBQ3BCLHFCQUFxQjtnQkFDckIsT0FBTyxJQUFJLGlCQUFpQixDQUMzQixJQUFJLENBQUMsY0FBYyxFQUNuQixJQUFJLENBQUMsa0JBQWtCLEVBQ3ZCLElBQUksQ0FBQyxvQ0FBb0MsRUFDekMsSUFBSSxtQkFBUSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsRUFDaEMsc0JBQXNCLENBQ3RCLENBQUM7YUFDRjtpQkFBTTtnQkFDTixrQkFBa0I7Z0JBQ2xCLE9BQU8sSUFBSSxpQkFBaUIsQ0FDM0IsSUFBSSxhQUFLLENBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDLHFDQUVqRCxzQkFBc0IsRUFDdEIsSUFBSSxtQkFBUSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsRUFDaEMsc0JBQXNCLENBQ3RCLENBQUM7YUFDRjtRQUNGLENBQUM7UUFFTyxNQUFNLENBQUMsaUJBQWlCLENBQUMsY0FBcUIsRUFBRSxRQUFrQjtZQUN6RSxJQUFJLGNBQWMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsY0FBYyxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRTtnQkFDN0YsT0FBTyxxQkFBUyxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUM1RTtpQkFBTTtnQkFDTixPQUFPLHFCQUFTLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxjQUFjLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUMxRTtRQUNGLENBQUM7S0FDRDtJQTFERCw4Q0EwREM7SUFFRCxNQUFhLG1CQUFtQjtRQVEvQixZQUNDLElBQXVCLEVBQ3ZCLFFBQWdDLEVBQ2hDLElBR0M7WUFiRiw4QkFBeUIsR0FBUyxTQUFTLENBQUM7WUFlM0MsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7WUFDakIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7WUFDekIsSUFBSSxDQUFDLDRCQUE0QixHQUFHLElBQUksQ0FBQyw0QkFBNEIsQ0FBQztZQUN0RSxJQUFJLENBQUMsMkJBQTJCLEdBQUcsSUFBSSxDQUFDLDJCQUEyQixDQUFDO1FBQ3JFLENBQUM7S0FDRDtJQXJCRCxrREFxQkM7SUFFRCxTQUFnQixPQUFPLENBQUMsRUFBVTtRQUNqQyxPQUFPLENBQUMsRUFBRSxLQUFLLElBQUksSUFBSSxFQUFFLEtBQUssR0FBRyxJQUFJLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRkQsMEJBRUMifQ==