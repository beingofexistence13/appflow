/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/commands/replaceCommand", "vs/editor/common/cursorCommon", "vs/editor/common/core/cursorColumns", "vs/editor/common/cursor/cursorMoveOperations", "vs/editor/common/core/range", "vs/editor/common/core/position"], function (require, exports, strings, replaceCommand_1, cursorCommon_1, cursorColumns_1, cursorMoveOperations_1, range_1, position_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DeleteOperations = void 0;
    class DeleteOperations {
        static deleteRight(prevEditOperationType, config, model, selections) {
            const commands = [];
            let shouldPushStackElementBefore = (prevEditOperationType !== 3 /* EditOperationType.DeletingRight */);
            for (let i = 0, len = selections.length; i < len; i++) {
                const selection = selections[i];
                let deleteSelection = selection;
                if (deleteSelection.isEmpty()) {
                    const position = selection.getPosition();
                    const rightOfPosition = cursorMoveOperations_1.MoveOperations.right(config, model, position);
                    deleteSelection = new range_1.Range(rightOfPosition.lineNumber, rightOfPosition.column, position.lineNumber, position.column);
                }
                if (deleteSelection.isEmpty()) {
                    // Probably at end of file => ignore
                    commands[i] = null;
                    continue;
                }
                if (deleteSelection.startLineNumber !== deleteSelection.endLineNumber) {
                    shouldPushStackElementBefore = true;
                }
                commands[i] = new replaceCommand_1.ReplaceCommand(deleteSelection, '');
            }
            return [shouldPushStackElementBefore, commands];
        }
        static isAutoClosingPairDelete(autoClosingDelete, autoClosingBrackets, autoClosingQuotes, autoClosingPairsOpen, model, selections, autoClosedCharacters) {
            if (autoClosingBrackets === 'never' && autoClosingQuotes === 'never') {
                return false;
            }
            if (autoClosingDelete === 'never') {
                return false;
            }
            for (let i = 0, len = selections.length; i < len; i++) {
                const selection = selections[i];
                const position = selection.getPosition();
                if (!selection.isEmpty()) {
                    return false;
                }
                const lineText = model.getLineContent(position.lineNumber);
                if (position.column < 2 || position.column >= lineText.length + 1) {
                    return false;
                }
                const character = lineText.charAt(position.column - 2);
                const autoClosingPairCandidates = autoClosingPairsOpen.get(character);
                if (!autoClosingPairCandidates) {
                    return false;
                }
                if ((0, cursorCommon_1.isQuote)(character)) {
                    if (autoClosingQuotes === 'never') {
                        return false;
                    }
                }
                else {
                    if (autoClosingBrackets === 'never') {
                        return false;
                    }
                }
                const afterCharacter = lineText.charAt(position.column - 1);
                let foundAutoClosingPair = false;
                for (const autoClosingPairCandidate of autoClosingPairCandidates) {
                    if (autoClosingPairCandidate.open === character && autoClosingPairCandidate.close === afterCharacter) {
                        foundAutoClosingPair = true;
                    }
                }
                if (!foundAutoClosingPair) {
                    return false;
                }
                // Must delete the pair only if it was automatically inserted by the editor
                if (autoClosingDelete === 'auto') {
                    let found = false;
                    for (let j = 0, lenJ = autoClosedCharacters.length; j < lenJ; j++) {
                        const autoClosedCharacter = autoClosedCharacters[j];
                        if (position.lineNumber === autoClosedCharacter.startLineNumber && position.column === autoClosedCharacter.startColumn) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        return false;
                    }
                }
            }
            return true;
        }
        static _runAutoClosingPairDelete(config, model, selections) {
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                const position = selections[i].getPosition();
                const deleteSelection = new range_1.Range(position.lineNumber, position.column - 1, position.lineNumber, position.column + 1);
                commands[i] = new replaceCommand_1.ReplaceCommand(deleteSelection, '');
            }
            return [true, commands];
        }
        static deleteLeft(prevEditOperationType, config, model, selections, autoClosedCharacters) {
            if (this.isAutoClosingPairDelete(config.autoClosingDelete, config.autoClosingBrackets, config.autoClosingQuotes, config.autoClosingPairs.autoClosingPairsOpenByEnd, model, selections, autoClosedCharacters)) {
                return this._runAutoClosingPairDelete(config, model, selections);
            }
            const commands = [];
            let shouldPushStackElementBefore = (prevEditOperationType !== 2 /* EditOperationType.DeletingLeft */);
            for (let i = 0, len = selections.length; i < len; i++) {
                const deleteRange = DeleteOperations.getDeleteRange(selections[i], model, config);
                // Ignore empty delete ranges, as they have no effect
                // They happen if the cursor is at the beginning of the file.
                if (deleteRange.isEmpty()) {
                    commands[i] = null;
                    continue;
                }
                if (deleteRange.startLineNumber !== deleteRange.endLineNumber) {
                    shouldPushStackElementBefore = true;
                }
                commands[i] = new replaceCommand_1.ReplaceCommand(deleteRange, '');
            }
            return [shouldPushStackElementBefore, commands];
        }
        static getDeleteRange(selection, model, config) {
            if (!selection.isEmpty()) {
                return selection;
            }
            const position = selection.getPosition();
            // Unintend when using tab stops and cursor is within indentation
            if (config.useTabStops && position.column > 1) {
                const lineContent = model.getLineContent(position.lineNumber);
                const firstNonWhitespaceIndex = strings.firstNonWhitespaceIndex(lineContent);
                const lastIndentationColumn = (firstNonWhitespaceIndex === -1
                    ? /* entire string is whitespace */ lineContent.length + 1
                    : firstNonWhitespaceIndex + 1);
                if (position.column <= lastIndentationColumn) {
                    const fromVisibleColumn = config.visibleColumnFromColumn(model, position);
                    const toVisibleColumn = cursorColumns_1.CursorColumns.prevIndentTabStop(fromVisibleColumn, config.indentSize);
                    const toColumn = config.columnFromVisibleColumn(model, position.lineNumber, toVisibleColumn);
                    return new range_1.Range(position.lineNumber, toColumn, position.lineNumber, position.column);
                }
            }
            return range_1.Range.fromPositions(DeleteOperations.getPositionAfterDeleteLeft(position, model), position);
        }
        static getPositionAfterDeleteLeft(position, model) {
            if (position.column > 1) {
                // Convert 1-based columns to 0-based offsets and back.
                const idx = strings.getLeftDeleteOffset(position.column - 1, model.getLineContent(position.lineNumber));
                return position.with(undefined, idx + 1);
            }
            else if (position.lineNumber > 1) {
                const newLine = position.lineNumber - 1;
                return new position_1.Position(newLine, model.getLineMaxColumn(newLine));
            }
            else {
                return position;
            }
        }
        static cut(config, model, selections) {
            const commands = [];
            let lastCutRange = null;
            selections.sort((a, b) => position_1.Position.compare(a.getStartPosition(), b.getEndPosition()));
            for (let i = 0, len = selections.length; i < len; i++) {
                const selection = selections[i];
                if (selection.isEmpty()) {
                    if (config.emptySelectionClipboard) {
                        // This is a full line cut
                        const position = selection.getPosition();
                        let startLineNumber, startColumn, endLineNumber, endColumn;
                        if (position.lineNumber < model.getLineCount()) {
                            // Cutting a line in the middle of the model
                            startLineNumber = position.lineNumber;
                            startColumn = 1;
                            endLineNumber = position.lineNumber + 1;
                            endColumn = 1;
                        }
                        else if (position.lineNumber > 1 && lastCutRange?.endLineNumber !== position.lineNumber) {
                            // Cutting the last line & there are more than 1 lines in the model & a previous cut operation does not touch the current cut operation
                            startLineNumber = position.lineNumber - 1;
                            startColumn = model.getLineMaxColumn(position.lineNumber - 1);
                            endLineNumber = position.lineNumber;
                            endColumn = model.getLineMaxColumn(position.lineNumber);
                        }
                        else {
                            // Cutting the single line that the model contains
                            startLineNumber = position.lineNumber;
                            startColumn = 1;
                            endLineNumber = position.lineNumber;
                            endColumn = model.getLineMaxColumn(position.lineNumber);
                        }
                        const deleteSelection = new range_1.Range(startLineNumber, startColumn, endLineNumber, endColumn);
                        lastCutRange = deleteSelection;
                        if (!deleteSelection.isEmpty()) {
                            commands[i] = new replaceCommand_1.ReplaceCommand(deleteSelection, '');
                        }
                        else {
                            commands[i] = null;
                        }
                    }
                    else {
                        // Cannot cut empty selection
                        commands[i] = null;
                    }
                }
                else {
                    commands[i] = new replaceCommand_1.ReplaceCommand(selection, '');
                }
            }
            return new cursorCommon_1.EditOperationResult(0 /* EditOperationType.Other */, commands, {
                shouldPushStackElementBefore: true,
                shouldPushStackElementAfter: true
            });
        }
    }
    exports.DeleteOperations = DeleteOperations;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Vyc29yRGVsZXRlT3BlcmF0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vY3Vyc29yL2N1cnNvckRlbGV0ZU9wZXJhdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBY2hHLE1BQWEsZ0JBQWdCO1FBRXJCLE1BQU0sQ0FBQyxXQUFXLENBQUMscUJBQXdDLEVBQUUsTUFBMkIsRUFBRSxLQUF5QixFQUFFLFVBQXVCO1lBQ2xKLE1BQU0sUUFBUSxHQUEyQixFQUFFLENBQUM7WUFDNUMsSUFBSSw0QkFBNEIsR0FBRyxDQUFDLHFCQUFxQiw0Q0FBb0MsQ0FBQyxDQUFDO1lBQy9GLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3RELE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFaEMsSUFBSSxlQUFlLEdBQVUsU0FBUyxDQUFDO2dCQUV2QyxJQUFJLGVBQWUsQ0FBQyxPQUFPLEVBQUUsRUFBRTtvQkFDOUIsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO29CQUN6QyxNQUFNLGVBQWUsR0FBRyxxQ0FBYyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO29CQUN0RSxlQUFlLEdBQUcsSUFBSSxhQUFLLENBQzFCLGVBQWUsQ0FBQyxVQUFVLEVBQzFCLGVBQWUsQ0FBQyxNQUFNLEVBQ3RCLFFBQVEsQ0FBQyxVQUFVLEVBQ25CLFFBQVEsQ0FBQyxNQUFNLENBQ2YsQ0FBQztpQkFDRjtnQkFFRCxJQUFJLGVBQWUsQ0FBQyxPQUFPLEVBQUUsRUFBRTtvQkFDOUIsb0NBQW9DO29CQUNwQyxRQUFRLENB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