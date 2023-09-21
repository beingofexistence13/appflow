/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/strings", "vs/editor/common/commands/replaceCommand", "vs/editor/common/commands/shiftCommand", "vs/editor/common/commands/surroundSelectionCommand", "vs/editor/common/cursorCommon", "vs/editor/common/core/wordCharacterClassifier", "vs/editor/common/core/range", "vs/editor/common/core/position", "vs/editor/common/languages/languageConfiguration", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/languages/supports", "vs/editor/common/languages/autoIndent", "vs/editor/common/languages/enterAction"], function (require, exports, errors_1, strings, replaceCommand_1, shiftCommand_1, surroundSelectionCommand_1, cursorCommon_1, wordCharacterClassifier_1, range_1, position_1, languageConfiguration_1, languageConfigurationRegistry_1, supports_1, autoIndent_1, enterAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$fW = exports.$eW = exports.$dW = void 0;
    class $dW {
        static indent(config, model, selections) {
            if (model === null || selections === null) {
                return [];
            }
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                commands[i] = new shiftCommand_1.$8V(selections[i], {
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
                commands[i] = new shiftCommand_1.$8V(selections[i], {
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
            return shiftCommand_1.$8V.shiftIndent(indentation, indentation.length + count, config.tabSize, config.indentSize, config.insertSpaces);
        }
        static unshiftIndent(config, indentation, count) {
            count = count || 1;
            return shiftCommand_1.$8V.unshiftIndent(indentation, indentation.length + count, config.tabSize, config.indentSize, config.insertSpaces);
        }
        static a(config, model, selections, text) {
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                commands[i] = new replaceCommand_1.$UV(selections[i], text[i]);
            }
            return new cursorCommon_1.$NU(0 /* EditOperationType.Other */, commands, {
                shouldPushStackElementBefore: true,
                shouldPushStackElementAfter: true
            });
        }
        static b(config, model, selections, text, pasteOnNewLine) {
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
                    const typeSelection = new range_1.$ks(position.lineNumber, 1, position.lineNumber, 1);
                    commands[i] = new replaceCommand_1.$YV(typeSelection, text, selection, true);
                }
                else {
                    commands[i] = new replaceCommand_1.$UV(selection, text);
                }
            }
            return new cursorCommon_1.$NU(0 /* EditOperationType.Other */, commands, {
                shouldPushStackElementBefore: true,
                shouldPushStackElementAfter: true
            });
        }
        static c(config, selections, text, pasteOnNewLine, multicursorText) {
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
                const lines = strings.$Ae(text);
                if (lines.length === selections.length) {
                    return lines;
                }
            }
            return null;
        }
        static paste(config, model, selections, text, pasteOnNewLine, multicursorText) {
            const distributedPaste = this.c(config, selections, text, pasteOnNewLine, multicursorText);
            if (distributedPaste) {
                selections = selections.sort(range_1.$ks.compareRangesUsingStarts);
                return this.a(config, model, selections, distributedPaste);
            }
            else {
                return this.b(config, model, selections, text, pasteOnNewLine);
            }
        }
        static d(config, model, lineNumber) {
            let action = null;
            let indentation = '';
            const expectedIndentAction = (0, autoIndent_1.$$V)(config.autoIndent, model, lineNumber, false, config.languageConfigurationService);
            if (expectedIndentAction) {
                action = expectedIndentAction.action;
                indentation = expectedIndentAction.indentation;
            }
            else if (lineNumber > 1) {
                let lastLineNumber;
                for (lastLineNumber = lineNumber - 1; lastLineNumber >= 1; lastLineNumber--) {
                    const lineText = model.getLineContent(lastLineNumber);
                    const nonWhitespaceIdx = strings.$De(lineText);
                    if (nonWhitespaceIdx >= 0) {
                        break;
                    }
                }
                if (lastLineNumber < 1) {
                    // No previous line with content found
                    return null;
                }
                const maxColumn = model.getLineMaxColumn(lastLineNumber);
                const expectedEnterAction = (0, enterAction_1.$7V)(config.autoIndent, model, new range_1.$ks(lastLineNumber, maxColumn, lastLineNumber, maxColumn), config.languageConfigurationService);
                if (expectedEnterAction) {
                    indentation = expectedEnterAction.indentation + expectedEnterAction.appendText;
                }
            }
            if (action) {
                if (action === languageConfiguration_1.IndentAction.Indent) {
                    indentation = $dW.shiftIndent(config, indentation);
                }
                if (action === languageConfiguration_1.IndentAction.Outdent) {
                    indentation = $dW.unshiftIndent(config, indentation);
                }
                indentation = config.normalizeIndentation(indentation);
            }
            if (!indentation) {
                return null;
            }
            return indentation;
        }
        static f(config, model, selection, insertsAutoWhitespace) {
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
            return new replaceCommand_1.$UV(selection, typeText, insertsAutoWhitespace);
        }
        static tab(config, model, selections) {
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                const selection = selections[i];
                if (selection.isEmpty()) {
                    const lineText = model.getLineContent(selection.startLineNumber);
                    if (/^\s*$/.test(lineText) && model.tokenization.isCheapToTokenize(selection.startLineNumber)) {
                        let goodIndent = this.d(config, model, selection.startLineNumber);
                        goodIndent = goodIndent || '\t';
                        const possibleTypeText = config.normalizeIndentation(goodIndent);
                        if (!lineText.startsWith(possibleTypeText)) {
                            commands[i] = new replaceCommand_1.$UV(new range_1.$ks(selection.startLineNumber, 1, selection.startLineNumber, lineText.length + 1), possibleTypeText, true);
                            continue;
                        }
                    }
                    commands[i] = this.f(config, model, selection, true);
                }
                else {
                    if (selection.startLineNumber === selection.endLineNumber) {
                        const lineMaxColumn = model.getLineMaxColumn(selection.startLineNumber);
                        if (selection.startColumn !== 1 || selection.endColumn !== lineMaxColumn) {
                            // This is a single line selection that is not the entire line
                            commands[i] = this.f(config, model, selection, false);
                            continue;
                        }
                    }
                    commands[i] = new shiftCommand_1.$8V(selection, {
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
            const commands = selections.map(selection => this.g(model, selection, text, replacePrevCharCnt, replaceNextCharCnt, positionDelta));
            return new cursorCommon_1.$NU(4 /* EditOperationType.TypingOther */, commands, {
                shouldPushStackElementBefore: shouldPushStackElementBetween(prevEditOperationType, 4 /* EditOperationType.TypingOther */),
                shouldPushStackElementAfter: false
            });
        }
        static g(model, selection, text, replacePrevCharCnt, replaceNextCharCnt, positionDelta) {
            if (!selection.isEmpty()) {
                // looks like https://github.com/microsoft/vscode/issues/2773
                // where a cursor operation occurred before a canceled composition
                // => ignore composition
                return null;
            }
            const pos = selection.getPosition();
            const startColumn = Math.max(1, pos.column - replacePrevCharCnt);
            const endColumn = Math.min(model.getLineMaxColumn(pos.lineNumber), pos.column + replaceNextCharCnt);
            const range = new range_1.$ks(pos.lineNumber, startColumn, pos.lineNumber, endColumn);
            const oldText = model.getValueInRange(range);
            if (oldText === text && positionDelta === 0) {
                // => ignore composition that doesn't do anything
                return null;
            }
            return new replaceCommand_1.$XV(range, text, 0, positionDelta);
        }
        static h(range, text, keepPosition) {
            if (keepPosition) {
                return new replaceCommand_1.$WV(range, text, true);
            }
            else {
                return new replaceCommand_1.$UV(range, text, true);
            }
        }
        static k(config, model, keepPosition, range) {
            if (config.autoIndent === 0 /* EditorAutoIndentStrategy.None */) {
                return $dW.h(range, '\n', keepPosition);
            }
            if (!model.tokenization.isCheapToTokenize(range.getStartPosition().lineNumber) || config.autoIndent === 1 /* EditorAutoIndentStrategy.Keep */) {
                const lineText = model.getLineContent(range.startLineNumber);
                const indentation = strings.$Ce(lineText).substring(0, range.startColumn - 1);
                return $dW.h(range, '\n' + config.normalizeIndentation(indentation), keepPosition);
            }
            const r = (0, enterAction_1.$7V)(config.autoIndent, model, range, config.languageConfigurationService);
            if (r) {
                if (r.indentAction === languageConfiguration_1.IndentAction.None) {
                    // Nothing special
                    return $dW.h(range, '\n' + config.normalizeIndentation(r.indentation + r.appendText), keepPosition);
                }
                else if (r.indentAction === languageConfiguration_1.IndentAction.Indent) {
                    // Indent once
                    return $dW.h(range, '\n' + config.normalizeIndentation(r.indentation + r.appendText), keepPosition);
                }
                else if (r.indentAction === languageConfiguration_1.IndentAction.IndentOutdent) {
                    // Ultra special
                    const normalIndent = config.normalizeIndentation(r.indentation);
                    const increasedIndent = config.normalizeIndentation(r.indentation + r.appendText);
                    const typeText = '\n' + increasedIndent + '\n' + normalIndent;
                    if (keepPosition) {
                        return new replaceCommand_1.$WV(range, typeText, true);
                    }
                    else {
                        return new replaceCommand_1.$XV(range, typeText, -1, increasedIndent.length - normalIndent.length, true);
                    }
                }
                else if (r.indentAction === languageConfiguration_1.IndentAction.Outdent) {
                    const actualIndentation = $dW.unshiftIndent(config, r.indentation);
                    return $dW.h(range, '\n' + config.normalizeIndentation(actualIndentation + r.appendText), keepPosition);
                }
            }
            const lineText = model.getLineContent(range.startLineNumber);
            const indentation = strings.$Ce(lineText).substring(0, range.startColumn - 1);
            if (config.autoIndent >= 4 /* EditorAutoIndentStrategy.Full */) {
                const ir = (0, autoIndent_1.$aW)(config.autoIndent, model, range, {
                    unshiftIndent: (indent) => {
                        return $dW.unshiftIndent(config, indent);
                    },
                    shiftIndent: (indent) => {
                        return $dW.shiftIndent(config, indent);
                    },
                    normalizeIndentation: (indent) => {
                        return config.normalizeIndentation(indent);
                    }
                }, config.languageConfigurationService);
                if (ir) {
                    let oldEndViewColumn = config.visibleColumnFromColumn(model, range.getEndPosition());
                    const oldEndColumn = range.endColumn;
                    const newLineContent = model.getLineContent(range.endLineNumber);
                    const firstNonWhitespace = strings.$Be(newLineContent);
                    if (firstNonWhitespace >= 0) {
                        range = range.setEndPosition(range.endLineNumber, Math.max(range.endColumn, firstNonWhitespace + 1));
                    }
                    else {
                        range = range.setEndPosition(range.endLineNumber, model.getLineMaxColumn(range.endLineNumber));
                    }
                    if (keepPosition) {
                        return new replaceCommand_1.$WV(range, '\n' + config.normalizeIndentation(ir.afterEnter), true);
                    }
                    else {
                        let offset = 0;
                        if (oldEndColumn <= firstNonWhitespace + 1) {
                            if (!config.insertSpaces) {
                                oldEndViewColumn = Math.ceil(oldEndViewColumn / config.indentSize);
                            }
                            offset = Math.min(oldEndViewColumn + 1 - config.normalizeIndentation(ir.afterEnter).length - 1, 0);
                        }
                        return new replaceCommand_1.$XV(range, '\n' + config.normalizeIndentation(ir.afterEnter), 0, offset, true);
                    }
                }
            }
            return $dW.h(range, '\n' + config.normalizeIndentation(indentation), keepPosition);
        }
        static l(config, model, selections) {
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
        static m(config, model, range, ch) {
            const currentIndentation = (0, languageConfigurationRegistry_1.$4t)(model, range.startLineNumber, range.startColumn);
            const actualIndentation = (0, autoIndent_1.$bW)(config.autoIndent, model, range, ch, {
                shiftIndent: (indentation) => {
                    return $dW.shiftIndent(config, indentation);
                },
                unshiftIndent: (indentation) => {
                    return $dW.unshiftIndent(config, indentation);
                },
            }, config.languageConfigurationService);
            if (actualIndentation === null) {
                return null;
            }
            if (actualIndentation !== config.normalizeIndentation(currentIndentation)) {
                const firstNonWhitespace = model.getLineFirstNonWhitespaceColumn(range.startLineNumber);
                if (firstNonWhitespace === 0) {
                    return $dW.h(new range_1.$ks(range.startLineNumber, 1, range.endLineNumber, range.endColumn), config.normalizeIndentation(actualIndentation) + ch, false);
                }
                else {
                    return $dW.h(new range_1.$ks(range.startLineNumber, 1, range.endLineNumber, range.endColumn), config.normalizeIndentation(actualIndentation) +
                        model.getLineContent(range.startLineNumber).substring(firstNonWhitespace - 1, range.startColumn - 1) + ch, false);
                }
            }
            return null;
        }
        static n(config, model, selections, autoClosedCharacters, ch) {
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
                const chIsQuote = (0, cursorCommon_1.$OU)(ch);
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
        static o(prevEditOperationType, config, model, selections, ch) {
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                const selection = selections[i];
                const position = selection.getPosition();
                const typeSelection = new range_1.$ks(position.lineNumber, position.column, position.lineNumber, position.column + 1);
                commands[i] = new replaceCommand_1.$UV(typeSelection, ch);
            }
            return new cursorCommon_1.$NU(4 /* EditOperationType.TypingOther */, commands, {
                shouldPushStackElementBefore: shouldPushStackElementBetween(prevEditOperationType, 4 /* EditOperationType.TypingOther */),
                shouldPushStackElementAfter: false
            });
        }
        static q(config, lineAfter) {
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
        static t(config, model, positions, ch) {
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
                        const relevantText = model.getValueInRange(new range_1.$ks(position.lineNumber, position.column - candidate.open.length + 1, position.lineNumber, position.column));
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
        static u(config, pair) {
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
        static v(config, model, selections, ch, chIsAlreadyTyped) {
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
            const pair = this.t(config, model, positions.map(p => new position_1.$js(p.lineNumber, p.beforeColumn)), ch);
            if (!pair) {
                return null;
            }
            let autoCloseConfig;
            let shouldAutoCloseBefore;
            const chIsQuote = (0, cursorCommon_1.$OU)(ch);
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
            const containedPair = this.u(config, pair);
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
                    const isBeforeCloseBrace = $dW.q(config, lineAfter);
                    if (!isBeforeCloseBrace && !shouldAutoCloseBefore(characterAfter)) {
                        return null;
                    }
                }
                // Do not auto-close ' or " after a word character
                if (pair.open.length === 1 && (ch === '\'' || ch === '"') && autoCloseConfig !== 'always') {
                    const wordSeparators = (0, wordCharacterClassifier_1.$Ks)(config.wordSeparators);
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
                const scopedLineTokens = (0, supports_1.$dt)(lineTokens, beforeColumn - 1);
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
        static w(prevEditOperationType, config, model, selections, ch, chIsAlreadyTyped, autoClosingPairClose) {
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                const selection = selections[i];
                commands[i] = new $eW(selection, ch, !chIsAlreadyTyped, autoClosingPairClose);
            }
            return new cursorCommon_1.$NU(4 /* EditOperationType.TypingOther */, commands, {
                shouldPushStackElementBefore: true,
                shouldPushStackElementAfter: false
            });
        }
        static y(config, ch) {
            if ((0, cursorCommon_1.$OU)(ch)) {
                return (config.autoSurround === 'quotes' || config.autoSurround === 'languageDefined');
            }
            else {
                // Character is a bracket
                return (config.autoSurround === 'brackets' || config.autoSurround === 'languageDefined');
            }
        }
        static z(config, model, selections, ch) {
            if (!$dW.y(config, ch) || !config.surroundingPairs.hasOwnProperty(ch)) {
                return false;
            }
            const isTypingAQuoteCharacter = (0, cursorCommon_1.$OU)(ch);
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
                    if ((0, cursorCommon_1.$OU)(selectionText)) {
                        // Typing a quote character on top of another quote character
                        // => disable surround selection type
                        return false;
                    }
                }
            }
            return true;
        }
        static A(prevEditOperationType, config, model, selections, ch) {
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                const selection = selections[i];
                const closeCharacter = config.surroundingPairs[ch];
                commands[i] = new surroundSelectionCommand_1.$9V(selection, ch, closeCharacter);
            }
            return new cursorCommon_1.$NU(0 /* EditOperationType.Other */, commands, {
                shouldPushStackElementBefore: true,
                shouldPushStackElementAfter: true
            });
        }
        static B(config, model, selections) {
            if (selections.length === 1 && model.tokenization.isCheapToTokenize(selections[0].getEndPosition().lineNumber)) {
                return true;
            }
            return false;
        }
        static C(prevEditOperationType, config, model, selection, ch) {
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
                (0, errors_1.$Y)(e);
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
                    const matchLineIndentation = strings.$Ce(matchLine);
                    const newIndentation = config.normalizeIndentation(matchLineIndentation);
                    const lineText = model.getLineContent(position.lineNumber);
                    const lineFirstNonBlankColumn = model.getLineFirstNonWhitespaceColumn(position.lineNumber) || position.column;
                    const prefix = lineText.substring(lineFirstNonBlankColumn - 1, position.column - 1);
                    const typeText = newIndentation + prefix + ch;
                    const typeSelection = new range_1.$ks(position.lineNumber, 1, position.lineNumber, position.column);
                    const command = new replaceCommand_1.$UV(typeSelection, typeText);
                    return new cursorCommon_1.$NU(getTypingOperation(typeText, prevEditOperationType), [command], {
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
                if (!$dW.y(config, ch) || !config.surroundingPairs.hasOwnProperty(ch)) {
                    return null;
                }
                const isTypingAQuoteCharacter = (0, cursorCommon_1.$OU)(ch);
                for (const composition of compositions) {
                    if (composition.deletedSelectionStart !== 0 || composition.deletedSelectionEnd !== composition.deletedText.length) {
                        // more text was deleted than was selected, so this could not have been a surround selection
                        return null;
                    }
                    if (/^[ \t]+$/.test(composition.deletedText)) {
                        // deleted text was only whitespace
                        return null;
                    }
                    if (isTypingAQuoteCharacter && (0, cursorCommon_1.$OU)(composition.deletedText)) {
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
                    commands.push(new surroundSelectionCommand_1.$0V(positions[i], compositions[i].deletedText, config.surroundingPairs[ch]));
                }
                return new cursorCommon_1.$NU(4 /* EditOperationType.TypingOther */, commands, {
                    shouldPushStackElementBefore: true,
                    shouldPushStackElementAfter: false
                });
            }
            if (this.n(config, model, selections, autoClosedCharacters, ch)) {
                // Unfortunately, the close character is at this point "doubled", so we need to delete it...
                const commands = selections.map(s => new replaceCommand_1.$UV(new range_1.$ks(s.positionLineNumber, s.positionColumn, s.positionLineNumber, s.positionColumn + 1), '', false));
                return new cursorCommon_1.$NU(4 /* EditOperationType.TypingOther */, commands, {
                    shouldPushStackElementBefore: true,
                    shouldPushStackElementAfter: false
                });
            }
            const autoClosingPairClose = this.v(config, model, selections, ch, true);
            if (autoClosingPairClose !== null) {
                return this.w(prevEditOperationType, config, model, selections, ch, true, autoClosingPairClose);
            }
            return null;
        }
        static typeWithInterceptors(isDoingComposition, prevEditOperationType, config, model, selections, autoClosedCharacters, ch) {
            if (!isDoingComposition && ch === '\n') {
                const commands = [];
                for (let i = 0, len = selections.length; i < len; i++) {
                    commands[i] = $dW.k(config, model, false, selections[i]);
                }
                return new cursorCommon_1.$NU(4 /* EditOperationType.TypingOther */, commands, {
                    shouldPushStackElementBefore: true,
                    shouldPushStackElementAfter: false,
                });
            }
            if (!isDoingComposition && this.l(config, model, selections)) {
                const commands = [];
                let autoIndentFails = false;
                for (let i = 0, len = selections.length; i < len; i++) {
                    commands[i] = this.m(config, model, selections[i], ch);
                    if (!commands[i]) {
                        autoIndentFails = true;
                        break;
                    }
                }
                if (!autoIndentFails) {
                    return new cursorCommon_1.$NU(4 /* EditOperationType.TypingOther */, commands, {
                        shouldPushStackElementBefore: true,
                        shouldPushStackElementAfter: false,
                    });
                }
            }
            if (this.n(config, model, selections, autoClosedCharacters, ch)) {
                return this.o(prevEditOperationType, config, model, selections, ch);
            }
            if (!isDoingComposition) {
                const autoClosingPairClose = this.v(config, model, selections, ch, false);
                if (autoClosingPairClose) {
                    return this.w(prevEditOperationType, config, model, selections, ch, false, autoClosingPairClose);
                }
            }
            if (!isDoingComposition && this.z(config, model, selections, ch)) {
                return this.A(prevEditOperationType, config, model, selections, ch);
            }
            // Electric characters make sense only when dealing with a single cursor,
            // as multiple cursors typing brackets for example would interfer with bracket matching
            if (!isDoingComposition && this.B(config, model, selections)) {
                const r = this.C(prevEditOperationType, config, model, selections[0], ch);
                if (r) {
                    return r;
                }
            }
            // A simple character type
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                commands[i] = new replaceCommand_1.$UV(selections[i], ch);
            }
            const opType = getTypingOperation(ch, prevEditOperationType);
            return new cursorCommon_1.$NU(opType, commands, {
                shouldPushStackElementBefore: shouldPushStackElementBetween(prevEditOperationType, opType),
                shouldPushStackElementAfter: false
            });
        }
        static typeWithoutInterceptors(prevEditOperationType, config, model, selections, str) {
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                commands[i] = new replaceCommand_1.$UV(selections[i], str);
            }
            const opType = getTypingOperation(str, prevEditOperationType);
            return new cursorCommon_1.$NU(opType, commands, {
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
                    commands[i] = new replaceCommand_1.$WV(new range_1.$ks(1, 1, 1, 1), '\n');
                }
                else {
                    lineNumber--;
                    const column = model.getLineMaxColumn(lineNumber);
                    commands[i] = this.k(config, model, false, new range_1.$ks(lineNumber, column, lineNumber, column));
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
                commands[i] = this.k(config, model, false, new range_1.$ks(lineNumber, column, lineNumber, column));
            }
            return commands;
        }
        static lineBreakInsert(config, model, selections) {
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                commands[i] = this.k(config, model, true, selections[i]);
            }
            return commands;
        }
    }
    exports.$dW = $dW;
    class $eW extends replaceCommand_1.$XV {
        constructor(selection, openCharacter, insertOpenCharacter, closeCharacter) {
            super(selection, (insertOpenCharacter ? openCharacter : '') + closeCharacter, 0, -closeCharacter.length);
            this.f = openCharacter;
            this.g = closeCharacter;
            this.closeCharacterRange = null;
            this.enclosingRange = null;
        }
        computeCursorState(model, helper) {
            const inverseEditOperations = helper.getInverseEditOperations();
            const range = inverseEditOperations[0].range;
            this.closeCharacterRange = new range_1.$ks(range.startLineNumber, range.endColumn - this.g.length, range.endLineNumber, range.endColumn);
            this.enclosingRange = new range_1.$ks(range.startLineNumber, range.endColumn - this.f.length - this.g.length, range.endLineNumber, range.endColumn);
            return super.computeCursorState(model, helper);
        }
    }
    exports.$eW = $eW;
    class $fW {
        constructor(deletedText, deletedSelectionStart, deletedSelectionEnd, insertedText, insertedSelectionStart, insertedSelectionEnd) {
            this.deletedText = deletedText;
            this.deletedSelectionStart = deletedSelectionStart;
            this.deletedSelectionEnd = deletedSelectionEnd;
            this.insertedText = insertedText;
            this.insertedSelectionStart = insertedSelectionStart;
            this.insertedSelectionEnd = insertedSelectionEnd;
        }
    }
    exports.$fW = $fW;
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
//# sourceMappingURL=cursorTypeOperations.js.map