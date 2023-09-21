/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/strings", "vs/editor/common/commands/replaceCommand", "vs/editor/common/commands/shiftCommand", "vs/editor/common/commands/surroundSelectionCommand", "vs/editor/common/cursorCommon", "vs/editor/common/core/wordCharacterClassifier", "vs/editor/common/core/range", "vs/editor/common/core/position", "vs/editor/common/languages/languageConfiguration", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/languages/supports", "vs/editor/common/languages/autoIndent", "vs/editor/common/languages/enterAction"], function (require, exports, errors_1, strings, replaceCommand_1, shiftCommand_1, surroundSelectionCommand_1, cursorCommon_1, wordCharacterClassifier_1, range_1, position_1, languageConfiguration_1, languageConfigurationRegistry_1, supports_1, autoIndent_1, enterAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CompositionOutcome = exports.TypeWithAutoClosingCommand = exports.TypeOperations = void 0;
    class TypeOperations {
        static indent(config, model, selections) {
            if (model === null || selections === null) {
                return [];
            }
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                commands[i] = new shiftCommand_1.ShiftCommand(selections[i], {
                    isUnshift: false,
                    tabSize: config.tabSize,
                    indentSize: config.indentSize,
                    insertSpaces: config.insertSpaces,
                    useTabStops: config.useTabStops,
                    autoIndent: config.autoIndent
                }, config.languageConfigurationService);
            }
            return commands;
        }
        static outdent(config, model, selections) {
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                commands[i] = new shiftCommand_1.ShiftCommand(selections[i], {
                    isUnshift: true,
                    tabSize: config.tabSize,
                    indentSize: config.indentSize,
                    insertSpaces: config.insertSpaces,
                    useTabStops: config.useTabStops,
                    autoIndent: config.autoIndent
                }, config.languageConfigurationService);
            }
            return commands;
        }
        static shiftIndent(config, indentation, count) {
            count = count || 1;
            return shiftCommand_1.ShiftCommand.shiftIndent(indentation, indentation.length + count, config.tabSize, config.indentSize, config.insertSpaces);
        }
        static unshiftIndent(config, indentation, count) {
            count = count || 1;
            return shiftCommand_1.ShiftCommand.unshiftIndent(indentation, indentation.length + count, config.tabSize, config.indentSize, config.insertSpaces);
        }
        static _distributedPaste(config, model, selections, text) {
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                commands[i] = new replaceCommand_1.ReplaceCommand(selections[i], text[i]);
            }
            return new cursorCommon_1.EditOperationResult(0 /* EditOperationType.Other */, commands, {
                shouldPushStackElementBefore: true,
                shouldPushStackElementAfter: true
            });
        }
        static _simplePaste(config, model, selections, text, pasteOnNewLine) {
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                const selection = selections[i];
                const position = selection.getPosition();
                if (pasteOnNewLine && !selection.isEmpty()) {
                    pasteOnNewLine = false;
                }
                if (pasteOnNewLine && text.indexOf('\n') !== text.length - 1) {
                    pasteOnNewLine = false;
                }
                if (pasteOnNewLine) {
                    // Paste entire line at the beginning of line
                    const typeSelection = new range_1.Range(position.lineNumber, 1, position.lineNumber, 1);
                    commands[i] = new replaceCommand_1.ReplaceCommandThatPreservesSelection(typeSelection, text, selection, true);
                }
                else {
                    commands[i] = new replaceCommand_1.ReplaceCommand(selection, text);
                }
            }
            return new cursorCommon_1.EditOperationResult(0 /* EditOperationType.Other */, commands, {
                shouldPushStackElementBefore: true,
                shouldPushStackElementAfter: true
            });
        }
        static _distributePasteToCursors(config, selections, text, pasteOnNewLine, multicursorText) {
            if (pasteOnNewLine) {
                return null;
            }
            if (selections.length === 1) {
                return null;
            }
            if (multicursorText && multicursorText.length === selections.length) {
                return multicursorText;
            }
            if (config.multiCursorPaste === 'spread') {
                // Try to spread the pasted text in case the line count matches the cursor count
                // Remove trailing \n if present
                if (text.charCodeAt(text.length - 1) === 10 /* CharCode.LineFeed */) {
                    text = text.substr(0, text.length - 1);
                }
                // Remove trailing \r if present
                if (text.charCodeAt(text.length - 1) === 13 /* CharCode.CarriageReturn */) {
                    text = text.substr(0, text.length - 1);
                }
                const lines = strings.splitLines(text);
                if (lines.length === selections.length) {
                    return lines;
                }
            }
            return null;
        }
        static paste(config, model, selections, text, pasteOnNewLine, multicursorText) {
            const distributedPaste = this._distributePasteToCursors(config, selections, text, pasteOnNewLine, multicursorText);
            if (distributedPaste) {
                selections = selections.sort(range_1.Range.compareRangesUsingStarts);
                return this._distributedPaste(config, model, selections, distributedPaste);
            }
            else {
                return this._simplePaste(config, model, selections, text, pasteOnNewLine);
            }
        }
        static _goodIndentForLine(config, model, lineNumber) {
            let action = null;
            let indentation = '';
            const expectedIndentAction = (0, autoIndent_1.getInheritIndentForLine)(config.autoIndent, model, lineNumber, false, config.languageConfigurationService);
            if (expectedIndentAction) {
                action = expectedIndentAction.action;
                indentation = expectedIndentAction.indentation;
            }
            else if (lineNumber > 1) {
                let lastLineNumber;
                for (lastLineNumber = lineNumber - 1; lastLineNumber >= 1; lastLineNumber--) {
                    const lineText = model.getLineContent(lastLineNumber);
                    const nonWhitespaceIdx = strings.lastNonWhitespaceIndex(lineText);
                    if (nonWhitespaceIdx >= 0) {
                        break;
                    }
                }
                if (lastLineNumber < 1) {
                    // No previous line with content found
                    return null;
                }
                const maxColumn = model.getLineMaxColumn(lastLineNumber);
                const expectedEnterAction = (0, enterAction_1.getEnterAction)(config.autoIndent, model, new range_1.Range(lastLineNumber, maxColumn, lastLineNumber, maxColumn), config.languageConfigurationService);
                if (expectedEnterAction) {
                    indentation = expectedEnterAction.indentation + expectedEnterAction.appendText;
                }
            }
            if (action) {
                if (action === languageConfiguration_1.IndentAction.Indent) {
                    indentation = TypeOperations.shiftIndent(config, indentation);
                }
                if (action === languageConfiguration_1.IndentAction.Outdent) {
                    indentation = TypeOperations.unshiftIndent(config, indentation);
                }
                indentation = config.normalizeIndentation(indentation);
            }
            if (!indentation) {
                return null;
            }
            return indentation;
        }
        static _replaceJumpToNextIndent(config, model, selection, insertsAutoWhitespace) {
            let typeText = '';
            const position = selection.getStartPosition();
            if (config.insertSpaces) {
                const visibleColumnFromColumn = config.visibleColumnFromColumn(model, position);
                const indentSize = config.indentSize;
                const spacesCnt = indentSize - (visibleColumnFromColumn % indentSize);
                for (let i = 0; i < spacesCnt; i++) {
                    typeText += ' ';
                }
            }
            else {
                typeText = '\t';
            }
            return new replaceCommand_1.ReplaceCommand(selection, typeText, insertsAutoWhitespace);
        }
        static tab(config, model, selections) {
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                const selection = selections[i];
                if (selection.isEmpty()) {
                    const lineText = model.getLineContent(selection.startLineNumber);
                    if (/^\s*$/.test(lineText) && model.tokenization.isCheapToTokenize(selection.startLineNumber)) {
                        let goodIndent = this._goodIndentForLine(config, model, selection.startLineNumber);
                        goodIndent = goodIndent || '\t';
                        const possibleTypeText = config.normalizeIndentation(goodIndent);
                        if (!lineText.startsWith(possibleTypeText)) {
                            commands[i] = new replaceCommand_1.ReplaceCommand(new range_1.Range(selection.startLineNumber, 1, selection.startLineNumber, lineText.length + 1), possibleTypeText, true);
                            continue;
                        }
                    }
                    commands[i] = this._replaceJumpToNextIndent(config, model, selection, true);
                }
                else {
                    if (selection.startLineNumber === selection.endLineNumber) {
                        const lineMaxColumn = model.getLineMaxColumn(selection.startLineNumber);
                        if (selection.startColumn !== 1 || selection.endColumn !== lineMaxColumn) {
                            // This is a single line selection that is not the entire line
                            commands[i] = this._replaceJumpToNextIndent(config, model, selection, false);
                            continue;
                        }
                    }
                    commands[i] = new shiftCommand_1.ShiftCommand(selection, {
                        isUnshift: false,
                        tabSize: config.tabSize,
                        indentSize: config.indentSize,
                        insertSpaces: config.insertSpaces,
                        useTabStops: config.useTabStops,
                        autoIndent: config.autoIndent
                    }, config.languageConfigurationService);
                }
            }
            return commands;
        }
        static compositionType(prevEditOperationType, config, model, selections, text, replacePrevCharCnt, replaceNextCharCnt, positionDelta) {
            const commands = selections.map(selection => this._compositionType(model, selection, text, replacePrevCharCnt, replaceNextCharCnt, positionDelta));
            return new cursorCommon_1.EditOperationResult(4 /* EditOperationType.TypingOther */, commands, {
                shouldPushStackElementBefore: shouldPushStackElementBetween(prevEditOperationType, 4 /* EditOperationType.TypingOther */),
                shouldPushStackElementAfter: false
            });
        }
        static _compositionType(model, selection, text, replacePrevCharCnt, replaceNextCharCnt, positionDelta) {
            if (!selection.isEmpty()) {
                // looks like https://github.com/microsoft/vscode/issues/2773
                // where a cursor operation occurred before a canceled composition
                // => ignore composition
                return null;
            }
            const pos = selection.getPosition();
            const startColumn = Math.max(1, pos.column - replacePrevCharCnt);
            const endColumn = Math.min(model.getLineMaxColumn(pos.lineNumber), pos.column + replaceNextCharCnt);
            const range = new range_1.Range(pos.lineNumber, startColumn, pos.lineNumber, endColumn);
            const oldText = model.getValueInRange(range);
            if (oldText === text && positionDelta === 0) {
                // => ignore composition that doesn't do anything
                return null;
            }
            return new replaceCommand_1.ReplaceCommandWithOffsetCursorState(range, text, 0, positionDelta);
        }
        static _typeCommand(range, text, keepPosition) {
            if (keepPosition) {
                return new replaceCommand_1.ReplaceCommandWithoutChangingPosition(range, text, true);
            }
            else {
                return new replaceCommand_1.ReplaceCommand(range, text, true);
            }
        }
        static _enter(config, model, keepPosition, range) {
            if (config.autoIndent === 0 /* EditorAutoIndentStrategy.None */) {
                return TypeOperations._typeCommand(range, '\n', keepPosition);
            }
            if (!model.tokenization.isCheapToTokenize(range.getStartPosition().lineNumber) || config.autoIndent === 1 /* EditorAutoIndentStrategy.Keep */) {
                const lineText = model.getLineContent(range.startLineNumber);
                const indentation = strings.getLeadingWhitespace(lineText).substring(0, range.startColumn - 1);
                return TypeOperations._typeCommand(range, '\n' + config.normalizeIndentation(indentation), keepPosition);
            }
            const r = (0, enterAction_1.getEnterAction)(config.autoIndent, model, range, config.languageConfigurationService);
            if (r) {
                if (r.indentAction === languageConfiguration_1.IndentAction.None) {
                    // Nothing special
                    return TypeOperations._typeCommand(range, '\n' + config.normalizeIndentation(r.indentation + r.appendText), keepPosition);
                }
                else if (r.indentAction === languageConfiguration_1.IndentAction.Indent) {
                    // Indent once
                    return TypeOperations._typeCommand(range, '\n' + config.normalizeIndentation(r.indentation + r.appendText), keepPosition);
                }
                else if (r.indentAction === languageConfiguration_1.IndentAction.IndentOutdent) {
                    // Ultra special
                    const normalIndent = config.normalizeIndentation(r.indentation);
                    const increasedIndent = config.normalizeIndentation(r.indentation + r.appendText);
                    const typeText = '\n' + increasedIndent + '\n' + normalIndent;
                    if (keepPosition) {
                        return new replaceCommand_1.ReplaceCommandWithoutChangingPosition(range, typeText, true);
                    }
                    else {
                        return new replaceCommand_1.ReplaceCommandWithOffsetCursorState(range, typeText, -1, increasedIndent.length - normalIndent.length, true);
                    }
                }
                else if (r.indentAction === languageConfiguration_1.IndentAction.Outdent) {
                    const actualIndentation = TypeOperations.unshiftIndent(config, r.indentation);
                    return TypeOperations._typeCommand(range, '\n' + config.normalizeIndentation(actualIndentation + r.appendText), keepPosition);
                }
            }
            const lineText = model.getLineContent(range.startLineNumber);
            const indentation = strings.getLeadingWhitespace(lineText).substring(0, range.startColumn - 1);
            if (config.autoIndent >= 4 /* EditorAutoIndentStrategy.Full */) {
                const ir = (0, autoIndent_1.getIndentForEnter)(config.autoIndent, model, range, {
                    unshiftIndent: (indent) => {
                        return TypeOperations.unshiftIndent(config, indent);
                    },
                    shiftIndent: (indent) => {
                        return TypeOperations.shiftIndent(config, indent);
                    },
                    normalizeIndentation: (indent) => {
                        return config.normalizeIndentation(indent);
                    }
                }, config.languageConfigurationService);
                if (ir) {
                    let oldEndViewColumn = config.visibleColumnFromColumn(model, range.getEndPosition());
                    const oldEndColumn = range.endColumn;
                    const newLineContent = model.getLineContent(range.endLineNumber);
                    const firstNonWhitespace = strings.firstNonWhitespaceIndex(newLineContent);
                    if (firstNonWhitespace >= 0) {
                        range = range.setEndPosition(range.endLineNumber, Math.max(range.endColumn, firstNonWhitespace + 1));
                    }
                    else {
                        range = range.setEndPosition(range.endLineNumber, model.getLineMaxColumn(range.endLineNumber));
                    }
                    if (keepPosition) {
                        return new replaceCommand_1.ReplaceCommandWithoutChangingPosition(range, '\n' + config.normalizeIndentation(ir.afterEnter), true);
                    }
                    else {
                        let offset = 0;
                        if (oldEndColumn <= firstNonWhitespace + 1) {
                            if (!config.insertSpaces) {
                                oldEndViewColumn = Math.ceil(oldEndViewColumn / config.indentSize);
                            }
                            offset = Math.min(oldEndViewColumn + 1 - config.normalizeIndentation(ir.afterEnter).length - 1, 0);
                        }
                        return new replaceCommand_1.ReplaceCommandWithOffsetCursorState(range, '\n' + config.normalizeIndentation(ir.afterEnter), 0, offset, true);
                    }
                }
            }
            return TypeOperations._typeCommand(range, '\n' + config.normalizeIndentation(indentation), keepPosition);
        }
        static _isAutoIndentType(config, model, selections) {
            if (config.autoIndent < 4 /* EditorAutoIndentStrategy.Full */) {
                return false;
            }
            for (let i = 0, len = selections.length; i < len; i++) {
                if (!model.tokenization.isCheapToTokenize(selections[i].getEndPosition().lineNumber)) {
                    return false;
                }
            }
            return true;
        }
        static _runAutoIndentType(config, model, range, ch) {
            const currentIndentation = (0, languageConfigurationRegistry_1.getIndentationAtPosition)(model, range.startLineNumber, range.startColumn);
            const actualIndentation = (0, autoIndent_1.getIndentActionForType)(config.autoIndent, model, range, ch, {
                shiftIndent: (indentation) => {
                    return TypeOperations.shiftIndent(config, indentation);
                },
                unshiftIndent: (indentation) => {
                    return TypeOperations.unshiftIndent(config, indentation);
                },
            }, config.languageConfigurationService);
            if (actualIndentation === null) {
                return null;
            }
            if (actualIndentation !== config.normalizeIndentation(currentIndentation)) {
                const firstNonWhitespace = model.getLineFirstNonWhitespaceColumn(range.startLineNumber);
                if (firstNonWhitespace === 0) {
                    return TypeOperations._typeCommand(new range_1.Range(range.startLineNumber, 1, range.endLineNumber, range.endColumn), config.normalizeIndentation(actualIndentation) + ch, false);
                }
                else {
                    return TypeOperations._typeCommand(new range_1.Range(range.startLineNumber, 1, range.endLineNumber, range.endColumn), config.normalizeIndentation(actualIndentation) +
                        model.getLineContent(range.startLineNumber).substring(firstNonWhitespace - 1, range.startColumn - 1) + ch, false);
                }
            }
            return null;
        }
        static _isAutoClosingOvertype(config, model, selections, autoClosedCharacters, ch) {
            if (config.autoClosingOvertype === 'never') {
                return false;
            }
            if (!config.autoClosingPairs.autoClosingPairsCloseSingleChar.has(ch)) {
                return false;
            }
            for (let i = 0, len = selections.length; i < len; i++) {
                const selection = selections[i];
                if (!selection.isEmpty()) {
                    return false;
                }
                const position = selection.getPosition();
                const lineText = model.getLineContent(position.lineNumber);
                const afterCharacter = lineText.charAt(position.column - 1);
                if (afterCharacter !== ch) {
                    return false;
                }
                // Do not over-type quotes after a backslash
                const chIsQuote = (0, cursorCommon_1.isQuote)(ch);
                const beforeCharacter = position.column > 2 ? lineText.charCodeAt(position.column - 2) : 0 /* CharCode.Null */;
                if (beforeCharacter === 92 /* CharCode.Backslash */ && chIsQuote) {
                    return false;
                }
                // Must over-type a closing character typed by the editor
                if (config.autoClosingOvertype === 'auto') {
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
        static _runAutoClosingOvertype(prevEditOperationType, config, model, selections, ch) {
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                const selection = selections[i];
                const position = selection.getPosition();
                const typeSelection = new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column + 1);
                commands[i] = new replaceCommand_1.ReplaceCommand(typeSelection, ch);
            }
            return new cursorCommon_1.EditOperationResult(4 /* EditOperationType.TypingOther */, commands, {
                shouldPushStackElementBefore: shouldPushStackElementBetween(prevEditOperationType, 4 /* EditOperationType.TypingOther */),
                shouldPushStackElementAfter: false
            });
        }
        static _isBeforeClosingBrace(config, lineAfter) {
            // If the start of lineAfter can be interpretted as both a starting or ending brace, default to returning false
            const nextChar = lineAfter.charAt(0);
            const potentialStartingBraces = config.autoClosingPairs.autoClosingPairsOpenByStart.get(nextChar) || [];
            const potentialClosingBraces = config.autoClosingPairs.autoClosingPairsCloseByStart.get(nextChar) || [];
            const isBeforeStartingBrace = potentialStartingBraces.some(x => lineAfter.startsWith(x.open));
            const isBeforeClosingBrace = potentialClosingBraces.some(x => lineAfter.startsWith(x.close));
            return !isBeforeStartingBrace && isBeforeClosingBrace;
        }
        /**
         * Determine if typing `ch` at all `positions` in the `model` results in an
         * auto closing open sequence being typed.
         *
         * Auto closing open sequences can consist of multiple characters, which
         * can lead to ambiguities. In such a case, the longest auto-closing open
         * sequence is returned.
         */
        static _findAutoClosingPairOpen(config, model, positions, ch) {
            const candidates = config.autoClosingPairs.autoClosingPairsOpenByEnd.get(ch);
            if (!candidates) {
                return null;
            }
            // Determine which auto-closing pair it is
            let result = null;
            for (const candidate of candidates) {
                if (result === null || candidate.open.length > result.open.length) {
                    let candidateIsMatch = true;
                    for (const position of positions) {
                        const relevantText = model.getValueInRange(new range_1.Range(position.lineNumber, position.column - candidate.open.length + 1, position.lineNumber, position.column));
                        if (relevantText + ch !== candidate.open) {
                            candidateIsMatch = false;
                            break;
                        }
                    }
                    if (candidateIsMatch) {
                        result = candidate;
                    }
                }
            }
            return result;
        }
        /**
         * Find another auto-closing pair that is contained by the one passed in.
         *
         * e.g. when having [(,)] and [(*,*)] as auto-closing pairs
         * this method will find [(,)] as a containment pair for [(*,*)]
         */
        static _findContainedAutoClosingPair(config, pair) {
            if (pair.open.length <= 1) {
                return null;
            }
            const lastChar = pair.close.charAt(pair.close.length - 1);
            // get candidates with the same last character as close
            const candidates = config.autoClosingPairs.autoClosingPairsCloseByEnd.get(lastChar) || [];
            let result = null;
            for (const candidate of candidates) {
                if (candidate.open !== pair.open && pair.open.includes(candidate.open) && pair.close.endsWith(candidate.close)) {
                    if (!result || candidate.open.length > result.open.length) {
                        result = candidate;
                    }
                }
            }
            return result;
        }
        static _getAutoClosingPairClose(config, model, selections, ch, chIsAlreadyTyped) {
            for (const selection of selections) {
                if (!selection.isEmpty()) {
                    return null;
                }
            }
            // This method is called both when typing (regularly) and when composition ends
            // This means that we need to work with a text buffer where sometimes `ch` is not
            // there (it is being typed right now) or with a text buffer where `ch` has already been typed
            //
            // In order to avoid adding checks for `chIsAlreadyTyped` in all places, we will work
            // with two conceptual positions, the position before `ch` and the position after `ch`
            //
            const positions = selections.map((s) => {
                const position = s.getPosition();
                if (chIsAlreadyTyped) {
                    return { lineNumber: position.lineNumber, beforeColumn: position.column - ch.length, afterColumn: position.column };
                }
                else {
                    return { lineNumber: position.lineNumber, beforeColumn: position.column, afterColumn: position.column };
                }
            });
            // Find the longest auto-closing open pair in case of multiple ending in `ch`
            // e.g. when having [f","] and [","], it picks [f","] if the character before is f
            const pair = this._findAutoClosingPairOpen(config, model, positions.map(p => new position_1.Position(p.lineNumber, p.beforeColumn)), ch);
            if (!pair) {
                return null;
            }
            let autoCloseConfig;
            let shouldAutoCloseBefore;
            const chIsQuote = (0, cursorCommon_1.isQuote)(ch);
            if (chIsQuote) {
                autoCloseConfig = config.autoClosingQuotes;
                shouldAutoCloseBefore = config.shouldAutoCloseBefore.quote;
            }
            else {
                const pairIsForComments = config.blockCommentStartToken ? pair.open.includes(config.blockCommentStartToken) : false;
                if (pairIsForComments) {
                    autoCloseConfig = config.autoClosingComments;
                    shouldAutoCloseBefore = config.shouldAutoCloseBefore.comment;
                }
                else {
                    autoCloseConfig = config.autoClosingBrackets;
                    shouldAutoCloseBefore = config.shouldAutoCloseBefore.bracket;
                }
            }
            if (autoCloseConfig === 'never') {
                return null;
            }
            // Sometimes, it is possible to have two auto-closing pairs that have a containment relationship
            // e.g. when having [(,)] and [(*,*)]
            // - when typing (, the resulting state is (|)
            // - when typing *, the desired resulting state is (*|*), not (*|*))
            const containedPair = this._findContainedAutoClosingPair(config, pair);
            const containedPairClose = containedPair ? containedPair.close : '';
            let isContainedPairPresent = true;
            for (const position of positions) {
                const { lineNumber, beforeColumn, afterColumn } = position;
                const lineText = model.getLineContent(lineNumber);
                const lineBefore = lineText.substring(0, beforeColumn - 1);
                const lineAfter = lineText.substring(afterColumn - 1);
                if (!lineAfter.startsWith(containedPairClose)) {
                    isContainedPairPresent = false;
                }
                // Only consider auto closing the pair if an allowed character follows or if another autoclosed pair closing brace follows
                if (lineAfter.length > 0) {
                    const characterAfter = lineAfter.charAt(0);
                    const isBeforeCloseBrace = TypeOperations._isBeforeClosingBrace(config, lineAfter);
                    if (!isBeforeCloseBrace && !shouldAutoCloseBefore(characterAfter)) {
                        return null;
                    }
                }
                // Do not auto-close ' or " after a word character
                if (pair.open.length === 1 && (ch === '\'' || ch === '"') && autoCloseConfig !== 'always') {
                    const wordSeparators = (0, wordCharacterClassifier_1.getMapForWordSeparators)(config.wordSeparators);
                    if (lineBefore.length > 0) {
                        const characterBefore = lineBefore.charCodeAt(lineBefore.length - 1);
                        if (wordSeparators.get(characterBefore) === 0 /* WordCharacterClass.Regular */) {
                            return null;
                        }
                    }
                }
                if (!model.tokenization.isCheapToTokenize(lineNumber)) {
                    // Do not force tokenization
                    return null;
                }
                model.tokenization.forceTokenization(lineNumber);
                const lineTokens = model.tokenization.getLineTokens(lineNumber);
                const scopedLineTokens = (0, supports_1.createScopedLineTokens)(lineTokens, beforeColumn - 1);
                if (!pair.shouldAutoClose(scopedLineTokens, beforeColumn - scopedLineTokens.firstCharOffset)) {
                    return null;
                }
                // Typing for example a quote could either start a new string, in which case auto-closing is desirable
                // or it could end a previously started string, in which case auto-closing is not desirable
                //
                // In certain cases, it is really not possible to look at the previous token to determine
                // what would happen. That's why we do something really unusual, we pretend to type a different
                // character and ask the tokenizer what the outcome of doing that is: after typing a neutral
                // character, are we in a string (i.e. the quote would most likely end a string) or not?
                //
                const neutralCharacter = pair.findNeutralCharacter();
                if (neutralCharacter) {
                    const tokenType = model.tokenization.getTokenTypeIfInsertingCharacter(lineNumber, beforeColumn, neutralCharacter);
                    if (!pair.isOK(tokenType)) {
                        return null;
                    }
                }
            }
            if (isContainedPairPresent) {
                return pair.close.substring(0, pair.close.length - containedPairClose.length);
            }
            else {
                return pair.close;
            }
        }
        static _runAutoClosingOpenCharType(prevEditOperationType, config, model, selections, ch, chIsAlreadyTyped, autoClosingPairClose) {
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                const selection = selections[i];
                commands[i] = new TypeWithAutoClosingCommand(selection, ch, !chIsAlreadyTyped, autoClosingPairClose);
            }
            return new cursorCommon_1.EditOperationResult(4 /* EditOperationType.TypingOther */, commands, {
                shouldPushStackElementBefore: true,
                shouldPushStackElementAfter: false
            });
        }
        static _shouldSurroundChar(config, ch) {
            if ((0, cursorCommon_1.isQuote)(ch)) {
                return (config.autoSurround === 'quotes' || config.autoSurround === 'languageDefined');
            }
            else {
                // Character is a bracket
                return (config.autoSurround === 'brackets' || config.autoSurround === 'languageDefined');
            }
        }
        static _isSurroundSelectionType(config, model, selections, ch) {
            if (!TypeOperations._shouldSurroundChar(config, ch) || !config.surroundingPairs.hasOwnProperty(ch)) {
                return false;
            }
            const isTypingAQuoteCharacter = (0, cursorCommon_1.isQuote)(ch);
            for (const selection of selections) {
                if (selection.isEmpty()) {
                    return false;
                }
                let selectionContainsOnlyWhitespace = true;
                for (let lineNumber = selection.startLineNumber; lineNumber <= selection.endLineNumber; lineNumber++) {
                    const lineText = model.getLineContent(lineNumber);
                    const startIndex = (lineNumber === selection.startLineNumber ? selection.startColumn - 1 : 0);
                    const endIndex = (lineNumber === selection.endLineNumber ? selection.endColumn - 1 : lineText.length);
                    const selectedText = lineText.substring(startIndex, endIndex);
                    if (/[^ \t]/.test(selectedText)) {
                        // this selected text contains something other than whitespace
                        selectionContainsOnlyWhitespace = false;
                        break;
                    }
                }
                if (selectionContainsOnlyWhitespace) {
                    return false;
                }
                if (isTypingAQuoteCharacter && selection.startLineNumber === selection.endLineNumber && selection.startColumn + 1 === selection.endColumn) {
                    const selectionText = model.getValueInRange(selection);
                    if ((0, cursorCommon_1.isQuote)(selectionText)) {
                        // Typing a quote character on top of another quote character
                        // => disable surround selection type
                        return false;
                    }
                }
            }
            return true;
        }
        static _runSurroundSelectionType(prevEditOperationType, config, model, selections, ch) {
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                const selection = selections[i];
                const closeCharacter = config.surroundingPairs[ch];
                commands[i] = new surroundSelectionCommand_1.SurroundSelectionCommand(selection, ch, closeCharacter);
            }
            return new cursorCommon_1.EditOperationResult(0 /* EditOperationType.Other */, commands, {
                shouldPushStackElementBefore: true,
                shouldPushStackElementAfter: true
            });
        }
        static _isTypeInterceptorElectricChar(config, model, selections) {
            if (selections.length === 1 && model.tokenization.isCheapToTokenize(selections[0].getEndPosition().lineNumber)) {
                return true;
            }
            return false;
        }
        static _typeInterceptorElectricChar(prevEditOperationType, config, model, selection, ch) {
            if (!config.electricChars.hasOwnProperty(ch) || !selection.isEmpty()) {
                return null;
            }
            const position = selection.getPosition();
            model.tokenization.forceTokenization(position.lineNumber);
            const lineTokens = model.tokenization.getLineTokens(position.lineNumber);
            let electricAction;
            try {
                electricAction = config.onElectricCharacter(ch, lineTokens, position.column);
            }
            catch (e) {
                (0, errors_1.onUnexpectedError)(e);
                return null;
            }
            if (!electricAction) {
                return null;
            }
            if (electricAction.matchOpenBracket) {
                const endColumn = (lineTokens.getLineContent() + ch).lastIndexOf(electricAction.matchOpenBracket) + 1;
                const match = model.bracketPairs.findMatchingBracketUp(electricAction.matchOpenBracket, {
                    lineNumber: position.lineNumber,
                    column: endColumn
                }, 500 /* give at most 500ms to compute */);
                if (match) {
                    if (match.startLineNumber === position.lineNumber) {
                        // matched something on the same line => no change in indentation
                        return null;
                    }
                    const matchLine = model.getLineContent(match.startLineNumber);
                    const matchLineIndentation = strings.getLeadingWhitespace(matchLine);
                    const newIndentation = config.normalizeIndentation(matchLineIndentation);
                    const lineText = model.getLineContent(position.lineNumber);
                    const lineFirstNonBlankColumn = model.getLineFirstNonWhitespaceColumn(position.lineNumber) || position.column;
                    const prefix = lineText.substring(lineFirstNonBlankColumn - 1, position.column - 1);
                    const typeText = newIndentation + prefix + ch;
                    const typeSelection = new range_1.Range(position.lineNumber, 1, position.lineNumber, position.column);
                    const command = new replaceCommand_1.ReplaceCommand(typeSelection, typeText);
                    return new cursorCommon_1.EditOperationResult(getTypingOperation(typeText, prevEditOperationType), [command], {
                        shouldPushStackElementBefore: false,
                        shouldPushStackElementAfter: true
                    });
                }
            }
            return null;
        }
        /**
         * This is very similar with typing, but the character is already in the text buffer!
         */
        static compositionEndWithInterceptors(prevEditOperationType, config, model, compositions, selections, autoClosedCharacters) {
            if (!compositions) {
                // could not deduce what the composition did
                return null;
            }
            let insertedText = null;
            for (const composition of compositions) {
                if (insertedText === null) {
                    insertedText = composition.insertedText;
                }
                else if (insertedText !== composition.insertedText) {
                    // not all selections agree on what was typed
                    return null;
                }
            }
            if (!insertedText || insertedText.length !== 1) {
                // we're only interested in the case where a single character was inserted
                return null;
            }
            const ch = insertedText;
            let hasDeletion = false;
            for (const composition of compositions) {
                if (composition.deletedText.length !== 0) {
                    hasDeletion = true;
                    break;
                }
            }
            if (hasDeletion) {
                // Check if this could have been a surround selection
                if (!TypeOperations._shouldSurroundChar(config, ch) || !config.surroundingPairs.hasOwnProperty(ch)) {
                    return null;
                }
                const isTypingAQuoteCharacter = (0, cursorCommon_1.isQuote)(ch);
                for (const composition of compositions) {
                    if (composition.deletedSelectionStart !== 0 || composition.deletedSelectionEnd !== composition.deletedText.length) {
                        // more text was deleted than was selected, so this could not have been a surround selection
                        return null;
                    }
                    if (/^[ \t]+$/.test(composition.deletedText)) {
                        // deleted text was only whitespace
                        return null;
                    }
                    if (isTypingAQuoteCharacter && (0, cursorCommon_1.isQuote)(composition.deletedText)) {
                        // deleted text was a quote
                        return null;
                    }
                }
                const positions = [];
                for (const selection of selections) {
                    if (!selection.isEmpty()) {
                        return null;
                    }
                    positions.push(selection.getPosition());
                }
                if (positions.length !== compositions.length) {
                    return null;
                }
                const commands = [];
                for (let i = 0, len = positions.length; i < len; i++) {
                    commands.push(new surroundSelectionCommand_1.CompositionSurroundSelectionCommand(positions[i], compositions[i].deletedText, config.surroundingPairs[ch]));
                }
                return new cursorCommon_1.EditOperationResult(4 /* EditOperationType.TypingOther */, commands, {
                    shouldPushStackElementBefore: true,
                    shouldPushStackElementAfter: false
                });
            }
            if (this._isAutoClosingOvertype(config, model, selections, autoClosedCharacters, ch)) {
                // Unfortunately, the close character is at this point "doubled", so we need to delete it...
                const commands = selections.map(s => new replaceCommand_1.ReplaceCommand(new range_1.Range(s.positionLineNumber, s.positionColumn, s.positionLineNumber, s.positionColumn + 1), '', false));
                return new cursorCommon_1.EditOperationResult(4 /* EditOperationType.TypingOther */, commands, {
                    shouldPushStackElementBefore: true,
                    shouldPushStackElementAfter: false
                });
            }
            const autoClosingPairClose = this._getAutoClosingPairClose(config, model, selections, ch, true);
            if (autoClosingPairClose !== null) {
                return this._runAutoClosingOpenCharType(prevEditOperationType, config, model, selections, ch, true, autoClosingPairClose);
            }
            return null;
        }
        static typeWithInterceptors(isDoingComposition, prevEditOperationType, config, model, selections, autoClosedCharacters, ch) {
            if (!isDoingComposition && ch === '\n') {
                const commands = [];
                for (let i = 0, len = selections.length; i < len; i++) {
                    commands[i] = TypeOperations._enter(config, model, false, selections[i]);
                }
                return new cursorCommon_1.EditOperationResult(4 /* EditOperationType.TypingOther */, commands, {
                    shouldPushStackElementBefore: true,
                    shouldPushStackElementAfter: false,
                });
            }
            if (!isDoingComposition && this._isAutoIndentType(config, model, selections)) {
                const commands = [];
                let autoIndentFails = false;
                for (let i = 0, len = selections.length; i < len; i++) {
                    commands[i] = this._runAutoIndentType(config, model, selections[i], ch);
                    if (!commands[i]) {
                        autoIndentFails = true;
                        break;
                    }
                }
                if (!autoIndentFails) {
                    return new cursorCommon_1.EditOperationResult(4 /* EditOperationType.TypingOther */, commands, {
                        shouldPushStackElementBefore: true,
                        shouldPushStackElementAfter: false,
                    });
                }
            }
            if (this._isAutoClosingOvertype(config, model, selections, autoClosedCharacters, ch)) {
                return this._runAutoClosingOvertype(prevEditOperationType, config, model, selections, ch);
            }
            if (!isDoingComposition) {
                const autoClosingPairClose = this._getAutoClosingPairClose(config, model, selections, ch, false);
                if (autoClosingPairClose) {
                    return this._runAutoClosingOpenCharType(prevEditOperationType, config, model, selections, ch, false, autoClosingPairClose);
                }
            }
            if (!isDoingComposition && this._isSurroundSelectionType(config, model, selections, ch)) {
                return this._runSurroundSelectionType(prevEditOperationType, config, model, selections, ch);
            }
            // Electric characters make sense only when dealing with a single cursor,
            // as multiple cursors typing brackets for example would interfer with bracket matching
            if (!isDoingComposition && this._isTypeInterceptorElectricChar(config, model, selections)) {
                const r = this._typeInterceptorElectricChar(prevEditOperationType, config, model, selections[0], ch);
                if (r) {
                    return r;
                }
            }
            // A simple character type
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                commands[i] = new replaceCommand_1.ReplaceCommand(selections[i], ch);
            }
            const opType = getTypingOperation(ch, prevEditOperationType);
            return new cursorCommon_1.EditOperationResult(opType, commands, {
                shouldPushStackElementBefore: shouldPushStackElementBetween(prevEditOperationType, opType),
                shouldPushStackElementAfter: false
            });
        }
        static typeWithoutInterceptors(prevEditOperationType, config, model, selections, str) {
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                commands[i] = new replaceCommand_1.ReplaceCommand(selections[i], str);
            }
            const opType = getTypingOperation(str, prevEditOperationType);
            return new cursorCommon_1.EditOperationResult(opType, commands, {
                shouldPushStackElementBefore: shouldPushStackElementBetween(prevEditOperationType, opType),
                shouldPushStackElementAfter: false
            });
        }
        static lineInsertBefore(config, model, selections) {
            if (model === null || selections === null) {
                return [];
            }
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                let lineNumber = selections[i].positionLineNumber;
                if (lineNumber === 1) {
                    commands[i] = new replaceCommand_1.ReplaceCommandWithoutChangingPosition(new range_1.Range(1, 1, 1, 1), '\n');
                }
                else {
                    lineNumber--;
                    const column = model.getLineMaxColumn(lineNumber);
                    commands[i] = this._enter(config, model, false, new range_1.Range(lineNumber, column, lineNumber, column));
                }
            }
            return commands;
        }
        static lineInsertAfter(config, model, selections) {
            if (model === null || selections === null) {
                return [];
            }
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                const lineNumber = selections[i].positionLineNumber;
                const column = model.getLineMaxColumn(lineNumber);
                commands[i] = this._enter(config, model, false, new range_1.Range(lineNumber, column, lineNumber, column));
            }
            return commands;
        }
        static lineBreakInsert(config, model, selections) {
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                commands[i] = this._enter(config, model, true, selections[i]);
            }
            return commands;
        }
    }
    exports.TypeOperations = TypeOperations;
    class TypeWithAutoClosingCommand extends replaceCommand_1.ReplaceCommandWithOffsetCursorState {
        constructor(selection, openCharacter, insertOpenCharacter, closeCharacter) {
            super(selection, (insertOpenCharacter ? openCharacter : '') + closeCharacter, 0, -closeCharacter.length);
            this._openCharacter = openCharacter;
            this._closeCharacter = closeCharacter;
            this.closeCharacterRange = null;
            this.enclosingRange = null;
        }
        computeCursorState(model, helper) {
            const inverseEditOperations = helper.getInverseEditOperations();
            const range = inverseEditOperations[0].range;
            this.closeCharacterRange = new range_1.Range(range.startLineNumber, range.endColumn - this._closeCharacter.length, range.endLineNumber, range.endColumn);
            this.enclosingRange = new range_1.Range(range.startLineNumber, range.endColumn - this._openCharacter.length - this._closeCharacter.length, range.endLineNumber, range.endColumn);
            return super.computeCursorState(model, helper);
        }
    }
    exports.TypeWithAutoClosingCommand = TypeWithAutoClosingCommand;
    class CompositionOutcome {
        constructor(deletedText, deletedSelectionStart, deletedSelectionEnd, insertedText, insertedSelectionStart, insertedSelectionEnd) {
            this.deletedText = deletedText;
            this.deletedSelectionStart = deletedSelectionStart;
            this.deletedSelectionEnd = deletedSelectionEnd;
            this.insertedText = insertedText;
            this.insertedSelectionStart = insertedSelectionStart;
            this.insertedSelectionEnd = insertedSelectionEnd;
        }
    }
    exports.CompositionOutcome = CompositionOutcome;
    function getTypingOperation(typedText, previousTypingOperation) {
        if (typedText === ' ') {
            return previousTypingOperation === 5 /* EditOperationType.TypingFirstSpace */
                || previousTypingOperation === 6 /* EditOperationType.TypingConsecutiveSpace */
                ? 6 /* EditOperationType.TypingConsecutiveSpace */
                : 5 /* EditOperationType.TypingFirstSpace */;
        }
        return 4 /* EditOperationType.TypingOther */;
    }
    function shouldPushStackElementBetween(previousTypingOperation, typingOperation) {
        if (isTypingOperation(previousTypingOperation) && !isTypingOperation(typingOperation)) {
            // Always set an undo stop before non-type operations
            return true;
        }
        if (previousTypingOperation === 5 /* EditOperationType.TypingFirstSpace */) {
            // `abc |d`: No undo stop
            // `abc  |d`: Undo stop
            return false;
        }
        // Insert undo stop between different operation types
        return normalizeOperationType(previousTypingOperation) !== normalizeOperationType(typingOperation);
    }
    function normalizeOperationType(type) {
        return (type === 6 /* EditOperationType.TypingConsecutiveSpace */ || type === 5 /* EditOperationType.TypingFirstSpace */)
            ? 'space'
            : type;
    }
    function isTypingOperation(type) {
        return type === 4 /* EditOperationType.TypingOther */
            || type === 5 /* EditOperationType.TypingFirstSpace */
            || type === 6 /* EditOperationType.TypingConsecutiveSpace */;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Vyc29yVHlwZU9wZXJhdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL2N1cnNvci9jdXJzb3JUeXBlT3BlcmF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF1QmhHLE1BQWEsY0FBYztRQUVuQixNQUFNLENBQUMsTUFBTSxDQUFDLE1BQTJCLEVBQUUsS0FBZ0MsRUFBRSxVQUE4QjtZQUNqSCxJQUFJLEtBQUssS0FBSyxJQUFJLElBQUksVUFBVSxLQUFLLElBQUksRUFBRTtnQkFDMUMsT0FBTyxFQUFFLENBQUM7YUFDVjtZQUVELE1BQU0sUUFBUSxHQUFlLEVBQUUsQ0FBQztZQUNoQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN0RCxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSwyQkFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDN0MsU0FBUyxFQUFFLEtBQUs7b0JBQ2hCLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTztvQkFDdkIsVUFBVSxFQUFFLE1BQU0sQ0FBQyxVQUFVO29CQUM3QixZQUFZLEVBQUUsTUFBTSxDQUFDLFlBQVk7b0JBQ2pDLFdBQVcsRUFBRSxNQUFNLENBQUMsV0FBVztvQkFDL0IsVUFBVSxFQUFFLE1BQU0sQ0FBQyxVQUFVO2lCQUM3QixFQUFFLE1BQU0sQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO2FBQ3hDO1lBQ0QsT0FBTyxRQUFRLENBQUM7UUFDakIsQ0FBQztRQUVNLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBMkIsRUFBRSxLQUF5QixFQUFFLFVBQXVCO1lBQ3BHLE1BQU0sUUFBUSxHQUFlLEVBQUUsQ0FBQztZQUNoQyxLQUFL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