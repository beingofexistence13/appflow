/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/languages/languageConfiguration", "vs/editor/common/languages/supports", "vs/editor/common/languages/languageConfigurationRegistry"], function (require, exports, strings, languageConfiguration_1, supports_1, languageConfigurationRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getIndentMetadata = exports.getIndentActionForType = exports.getIndentForEnter = exports.getGoodIndentForLine = exports.getInheritIndentForLine = void 0;
    /**
     * Get nearest preceding line which doesn't match unIndentPattern or contains all whitespace.
     * Result:
     * -1: run into the boundary of embedded languages
     * 0: every line above are invalid
     * else: nearest preceding line of the same language
     */
    function getPrecedingValidLine(model, lineNumber, indentRulesSupport) {
        const languageId = model.tokenization.getLanguageIdAtPosition(lineNumber, 0);
        if (lineNumber > 1) {
            let lastLineNumber;
            let resultLineNumber = -1;
            for (lastLineNumber = lineNumber - 1; lastLineNumber >= 1; lastLineNumber--) {
                if (model.tokenization.getLanguageIdAtPosition(lastLineNumber, 0) !== languageId) {
                    return resultLineNumber;
                }
                const text = model.getLineContent(lastLineNumber);
                if (indentRulesSupport.shouldIgnore(text) || /^\s+$/.test(text) || text === '') {
                    resultLineNumber = lastLineNumber;
                    continue;
                }
                return lastLineNumber;
            }
        }
        return -1;
    }
    /**
     * Get inherited indentation from above lines.
     * 1. Find the nearest preceding line which doesn't match unIndentedLinePattern.
     * 2. If this line matches indentNextLinePattern or increaseIndentPattern, it means that the indent level of `lineNumber` should be 1 greater than this line.
     * 3. If this line doesn't match any indent rules
     *   a. check whether the line above it matches indentNextLinePattern
     *   b. If not, the indent level of this line is the result
     *   c. If so, it means the indent of this line is *temporary*, go upward utill we find a line whose indent is not temporary (the same workflow a -> b -> c).
     * 4. Otherwise, we fail to get an inherited indent from aboves. Return null and we should not touch the indent of `lineNumber`
     *
     * This function only return the inherited indent based on above lines, it doesn't check whether current line should decrease or not.
     */
    function getInheritIndentForLine(autoIndent, model, lineNumber, honorIntentialIndent = true, languageConfigurationService) {
        if (autoIndent < 4 /* EditorAutoIndentStrategy.Full */) {
            return null;
        }
        const indentRulesSupport = languageConfigurationService.getLanguageConfiguration(model.tokenization.getLanguageId()).indentRulesSupport;
        if (!indentRulesSupport) {
            return null;
        }
        if (lineNumber <= 1) {
            return {
                indentation: '',
                action: null
            };
        }
        // Use no indent if this is the first non-blank line
        for (let priorLineNumber = lineNumber - 1; priorLineNumber > 0; priorLineNumber--) {
            if (model.getLineContent(priorLineNumber) !== '') {
                break;
            }
            if (priorLineNumber === 1) {
                return {
                    indentation: '',
                    action: null
                };
            }
        }
        const precedingUnIgnoredLine = getPrecedingValidLine(model, lineNumber, indentRulesSupport);
        if (precedingUnIgnoredLine < 0) {
            return null;
        }
        else if (precedingUnIgnoredLine < 1) {
            return {
                indentation: '',
                action: null
            };
        }
        const precedingUnIgnoredLineContent = model.getLineContent(precedingUnIgnoredLine);
        if (indentRulesSupport.shouldIncrease(precedingUnIgnoredLineContent) || indentRulesSupport.shouldIndentNextLine(precedingUnIgnoredLineContent)) {
            return {
                indentation: strings.getLeadingWhitespace(precedingUnIgnoredLineContent),
                action: languageConfiguration_1.IndentAction.Indent,
                line: precedingUnIgnoredLine
            };
        }
        else if (indentRulesSupport.shouldDecrease(precedingUnIgnoredLineContent)) {
            return {
                indentation: strings.getLeadingWhitespace(precedingUnIgnoredLineContent),
                action: null,
                line: precedingUnIgnoredLine
            };
        }
        else {
            // precedingUnIgnoredLine can not be ignored.
            // it doesn't increase indent of following lines
            // it doesn't increase just next line
            // so current line is not affect by precedingUnIgnoredLine
            // and then we should get a correct inheritted indentation from above lines
            if (precedingUnIgnoredLine === 1) {
                return {
                    indentation: strings.getLeadingWhitespace(model.getLineContent(precedingUnIgnoredLine)),
                    action: null,
                    line: precedingUnIgnoredLine
                };
            }
            const previousLine = precedingUnIgnoredLine - 1;
            const previousLineIndentMetadata = indentRulesSupport.getIndentMetadata(model.getLineContent(previousLine));
            if (!(previousLineIndentMetadata & (1 /* IndentConsts.INCREASE_MASK */ | 2 /* IndentConsts.DECREASE_MASK */)) &&
                (previousLineIndentMetadata & 4 /* IndentConsts.INDENT_NEXTLINE_MASK */)) {
                let stopLine = 0;
                for (let i = previousLine - 1; i > 0; i--) {
                    if (indentRulesSupport.shouldIndentNextLine(model.getLineContent(i))) {
                        continue;
                    }
                    stopLine = i;
                    break;
                }
                return {
                    indentation: strings.getLeadingWhitespace(model.getLineContent(stopLine + 1)),
                    action: null,
                    line: stopLine + 1
                };
            }
            if (honorIntentialIndent) {
                return {
                    indentation: strings.getLeadingWhitespace(model.getLineContent(precedingUnIgnoredLine)),
                    action: null,
                    line: precedingUnIgnoredLine
                };
            }
            else {
                // search from precedingUnIgnoredLine until we find one whose indent is not temporary
                for (let i = precedingUnIgnoredLine; i > 0; i--) {
                    const lineContent = model.getLineContent(i);
                    if (indentRulesSupport.shouldIncrease(lineContent)) {
                        return {
                            indentation: strings.getLeadingWhitespace(lineContent),
                            action: languageConfiguration_1.IndentAction.Indent,
                            line: i
                        };
                    }
                    else if (indentRulesSupport.shouldIndentNextLine(lineContent)) {
                        let stopLine = 0;
                        for (let j = i - 1; j > 0; j--) {
                            if (indentRulesSupport.shouldIndentNextLine(model.getLineContent(i))) {
                                continue;
                            }
                            stopLine = j;
                            break;
                        }
                        return {
                            indentation: strings.getLeadingWhitespace(model.getLineContent(stopLine + 1)),
                            action: null,
                            line: stopLine + 1
                        };
                    }
                    else if (indentRulesSupport.shouldDecrease(lineContent)) {
                        return {
                            indentation: strings.getLeadingWhitespace(lineContent),
                            action: null,
                            line: i
                        };
                    }
                }
                return {
                    indentation: strings.getLeadingWhitespace(model.getLineContent(1)),
                    action: null,
                    line: 1
                };
            }
        }
    }
    exports.getInheritIndentForLine = getInheritIndentForLine;
    function getGoodIndentForLine(autoIndent, virtualModel, languageId, lineNumber, indentConverter, languageConfigurationService) {
        if (autoIndent < 4 /* EditorAutoIndentStrategy.Full */) {
            return null;
        }
        const richEditSupport = languageConfigurationService.getLanguageConfiguration(languageId);
        if (!richEditSupport) {
            return null;
        }
        const indentRulesSupport = languageConfigurationService.getLanguageConfiguration(languageId).indentRulesSupport;
        if (!indentRulesSupport) {
            return null;
        }
        const indent = getInheritIndentForLine(autoIndent, virtualModel, lineNumber, undefined, languageConfigurationService);
        const lineContent = virtualModel.getLineContent(lineNumber);
        if (indent) {
            const inheritLine = indent.line;
            if (inheritLine !== undefined) {
                // Apply enter action as long as there are only whitespace lines between inherited line and this line.
                let shouldApplyEnterRules = true;
                for (let inBetweenLine = inheritLine; inBetweenLine < lineNumber - 1; inBetweenLine++) {
                    if (!/^\s*$/.test(virtualModel.getLineContent(inBetweenLine))) {
                        shouldApplyEnterRules = false;
                        break;
                    }
                }
                if (shouldApplyEnterRules) {
                    const enterResult = richEditSupport.onEnter(autoIndent, '', virtualModel.getLineContent(inheritLine), '');
                    if (enterResult) {
                        let indentation = strings.getLeadingWhitespace(virtualModel.getLineContent(inheritLine));
                        if (enterResult.removeText) {
                            indentation = indentation.substring(0, indentation.length - enterResult.removeText);
                        }
                        if ((enterResult.indentAction === languageConfiguration_1.IndentAction.Indent) ||
                            (enterResult.indentAction === languageConfiguration_1.IndentAction.IndentOutdent)) {
                            indentation = indentConverter.shiftIndent(indentation);
                        }
                        else if (enterResult.indentAction === languageConfiguration_1.IndentAction.Outdent) {
                            indentation = indentConverter.unshiftIndent(indentation);
                        }
                        if (indentRulesSupport.shouldDecrease(lineContent)) {
                            indentation = indentConverter.unshiftIndent(indentation);
                        }
                        if (enterResult.appendText) {
                            indentation += enterResult.appendText;
                        }
                        return strings.getLeadingWhitespace(indentation);
                    }
                }
            }
            if (indentRulesSupport.shouldDecrease(lineContent)) {
                if (indent.action === languageConfiguration_1.IndentAction.Indent) {
                    return indent.indentation;
                }
                else {
                    return indentConverter.unshiftIndent(indent.indentation);
                }
            }
            else {
                if (indent.action === languageConfiguration_1.IndentAction.Indent) {
                    return indentConverter.shiftIndent(indent.indentation);
                }
                else {
                    return indent.indentation;
                }
            }
        }
        return null;
    }
    exports.getGoodIndentForLine = getGoodIndentForLine;
    function getIndentForEnter(autoIndent, model, range, indentConverter, languageConfigurationService) {
        if (autoIndent < 4 /* EditorAutoIndentStrategy.Full */) {
            return null;
        }
        model.tokenization.forceTokenization(range.startLineNumber);
        const lineTokens = model.tokenization.getLineTokens(range.startLineNumber);
        const scopedLineTokens = (0, supports_1.createScopedLineTokens)(lineTokens, range.startColumn - 1);
        const scopedLineText = scopedLineTokens.getLineContent();
        let embeddedLanguage = false;
        let beforeEnterText;
        if (scopedLineTokens.firstCharOffset > 0 && lineTokens.getLanguageId(0) !== scopedLineTokens.languageId) {
            // we are in the embeded language content
            embeddedLanguage = true; // if embeddedLanguage is true, then we don't touch the indentation of current line
            beforeEnterText = scopedLineText.substr(0, range.startColumn - 1 - scopedLineTokens.firstCharOffset);
        }
        else {
            beforeEnterText = lineTokens.getLineContent().substring(0, range.startColumn - 1);
        }
        let afterEnterText;
        if (range.isEmpty()) {
            afterEnterText = scopedLineText.substr(range.startColumn - 1 - scopedLineTokens.firstCharOffset);
        }
        else {
            const endScopedLineTokens = (0, languageConfigurationRegistry_1.getScopedLineTokens)(model, range.endLineNumber, range.endColumn);
            afterEnterText = endScopedLineTokens.getLineContent().substr(range.endColumn - 1 - scopedLineTokens.firstCharOffset);
        }
        const indentRulesSupport = languageConfigurationService.getLanguageConfiguration(scopedLineTokens.languageId).indentRulesSupport;
        if (!indentRulesSupport) {
            return null;
        }
        const beforeEnterResult = beforeEnterText;
        const beforeEnterIndent = strings.getLeadingWhitespace(beforeEnterText);
        const virtualModel = {
            tokenization: {
                getLineTokens: (lineNumber) => {
                    return model.tokenization.getLineTokens(lineNumber);
                },
                getLanguageId: () => {
                    return model.getLanguageId();
                },
                getLanguageIdAtPosition: (lineNumber, column) => {
                    return model.getLanguageIdAtPosition(lineNumber, column);
                },
            },
            getLineContent: (lineNumber) => {
                if (lineNumber === range.startLineNumber) {
                    return beforeEnterResult;
                }
                else {
                    return model.getLineContent(lineNumber);
                }
            }
        };
        const currentLineIndent = strings.getLeadingWhitespace(lineTokens.getLineContent());
        const afterEnterAction = getInheritIndentForLine(autoIndent, virtualModel, range.startLineNumber + 1, undefined, languageConfigurationService);
        if (!afterEnterAction) {
            const beforeEnter = embeddedLanguage ? currentLineIndent : beforeEnterIndent;
            return {
                beforeEnter: beforeEnter,
                afterEnter: beforeEnter
            };
        }
        let afterEnterIndent = embeddedLanguage ? currentLineIndent : afterEnterAction.indentation;
        if (afterEnterAction.action === languageConfiguration_1.IndentAction.Indent) {
            afterEnterIndent = indentConverter.shiftIndent(afterEnterIndent);
        }
        if (indentRulesSupport.shouldDecrease(afterEnterText)) {
            afterEnterIndent = indentConverter.unshiftIndent(afterEnterIndent);
        }
        return {
            beforeEnter: embeddedLanguage ? currentLineIndent : beforeEnterIndent,
            afterEnter: afterEnterIndent
        };
    }
    exports.getIndentForEnter = getIndentForEnter;
    /**
     * We should always allow intentional indentation. It means, if users change the indentation of `lineNumber` and the content of
     * this line doesn't match decreaseIndentPattern, we should not adjust the indentation.
     */
    function getIndentActionForType(autoIndent, model, range, ch, indentConverter, languageConfigurationService) {
        if (autoIndent < 4 /* EditorAutoIndentStrategy.Full */) {
            return null;
        }
        const scopedLineTokens = (0, languageConfigurationRegistry_1.getScopedLineTokens)(model, range.startLineNumber, range.startColumn);
        if (scopedLineTokens.firstCharOffset) {
            // this line has mixed languages and indentation rules will not work
            return null;
        }
        const indentRulesSupport = languageConfigurationService.getLanguageConfiguration(scopedLineTokens.languageId).indentRulesSupport;
        if (!indentRulesSupport) {
            return null;
        }
        const scopedLineText = scopedLineTokens.getLineContent();
        const beforeTypeText = scopedLineText.substr(0, range.startColumn - 1 - scopedLineTokens.firstCharOffset);
        // selection support
        let afterTypeText;
        if (range.isEmpty()) {
            afterTypeText = scopedLineText.substr(range.startColumn - 1 - scopedLineTokens.firstCharOffset);
        }
        else {
            const endScopedLineTokens = (0, languageConfigurationRegistry_1.getScopedLineTokens)(model, range.endLineNumber, range.endColumn);
            afterTypeText = endScopedLineTokens.getLineContent().substr(range.endColumn - 1 - scopedLineTokens.firstCharOffset);
        }
        // If previous content already matches decreaseIndentPattern, it means indentation of this line should already be adjusted
        // Users might change the indentation by purpose and we should honor that instead of readjusting.
        if (!indentRulesSupport.shouldDecrease(beforeTypeText + afterTypeText) && indentRulesSupport.shouldDecrease(beforeTypeText + ch + afterTypeText)) {
            // after typing `ch`, the content matches decreaseIndentPattern, we should adjust the indent to a good manner.
            // 1. Get inherited indent action
            const r = getInheritIndentForLine(autoIndent, model, range.startLineNumber, false, languageConfigurationService);
            if (!r) {
                return null;
            }
            let indentation = r.indentation;
            if (r.action !== languageConfiguration_1.IndentAction.Indent) {
                indentation = indentConverter.unshiftIndent(indentation);
            }
            return indentation;
        }
        return null;
    }
    exports.getIndentActionForType = getIndentActionForType;
    function getIndentMetadata(model, lineNumber, languageConfigurationService) {
        const indentRulesSupport = languageConfigurationService.getLanguageConfiguration(model.getLanguageId()).indentRulesSupport;
        if (!indentRulesSupport) {
            return null;
        }
        if (lineNumber < 1 || lineNumber > model.getLineCount()) {
            return null;
        }
        return indentRulesSupport.getIndentMetadata(model.getLineContent(lineNumber));
    }
    exports.getIndentMetadata = getIndentMetadata;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b0luZGVudC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vbGFuZ3VhZ2VzL2F1dG9JbmRlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBMkJoRzs7Ozs7O09BTUc7SUFDSCxTQUFTLHFCQUFxQixDQUFDLEtBQW9CLEVBQUUsVUFBa0IsRUFBRSxrQkFBc0M7UUFDOUcsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQyx1QkFBdUIsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDN0UsSUFBSSxVQUFVLEdBQUcsQ0FBQyxFQUFFO1lBQ25CLElBQUksY0FBc0IsQ0FBQztZQUMzQixJQUFJLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRTFCLEtBQUssY0FBYyxHQUFHLFVBQVUsR0FBRyxDQUFDLEVBQUUsY0FBYyxJQUFJLENBQUMsRUFBRSxjQUFjLEVBQUUsRUFBRTtnQkFDNUUsSUFBSSxLQUFLLENBQUMsWUFBWSxDQUFDLHVCQUF1QixDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsS0FBSyxVQUFVLEVBQUU7b0JBQ2pGLE9BQU8sZ0JBQWdCLENBQUM7aUJBQ3hCO2dCQUNELE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQ2xELElBQUksa0JBQWtCLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxLQUFLLEVBQUUsRUFBRTtvQkFDL0UsZ0JBQWdCLEdBQUcsY0FBYyxDQUFDO29CQUNsQyxTQUFTO2lCQUNUO2dCQUVELE9BQU8sY0FBYyxDQUFDO2FBQ3RCO1NBQ0Q7UUFFRCxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUVEOzs7Ozs7Ozs7OztPQVdHO0lBQ0gs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