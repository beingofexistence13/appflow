/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/commands/shiftCommand", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/languages/languageConfiguration", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/contrib/indentation/browser/indentUtils", "vs/editor/common/languages/autoIndent", "vs/editor/common/languages/enterAction"], function (require, exports, strings, shiftCommand_1, range_1, selection_1, languageConfiguration_1, languageConfigurationRegistry_1, indentUtils, autoIndent_1, enterAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$y9 = void 0;
    let $y9 = class $y9 {
        constructor(selection, isMovingDown, autoIndent, g) {
            this.g = g;
            this.a = selection;
            this.b = isMovingDown;
            this.c = autoIndent;
            this.d = null;
            this.f = false;
        }
        getEditOperations(model, builder) {
            const modelLineCount = model.getLineCount();
            if (this.b && this.a.endLineNumber === modelLineCount) {
                this.d = builder.trackSelection(this.a);
                return;
            }
            if (!this.b && this.a.startLineNumber === 1) {
                this.d = builder.trackSelection(this.a);
                return;
            }
            this.e = false;
            let s = this.a;
            if (s.startLineNumber < s.endLineNumber && s.endColumn === 1) {
                this.e = true;
                s = s.setEndPosition(s.endLineNumber - 1, model.getLineMaxColumn(s.endLineNumber - 1));
            }
            const { tabSize, indentSize, insertSpaces } = model.getOptions();
            const indentConverter = this.h(tabSize, indentSize, insertSpaces);
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
                getLineContent: null,
            };
            if (s.startLineNumber === s.endLineNumber && model.getLineMaxColumn(s.startLineNumber) === 1) {
                // Current line is empty
                const lineNumber = s.startLineNumber;
                const otherLineNumber = (this.b ? lineNumber + 1 : lineNumber - 1);
                if (model.getLineMaxColumn(otherLineNumber) === 1) {
                    // Other line number is empty too, so no editing is needed
                    // Add a no-op to force running by the model
                    builder.addEditOperation(new range_1.$ks(1, 1, 1, 1), null);
                }
                else {
                    // Type content from other line number on line number
                    builder.addEditOperation(new range_1.$ks(lineNumber, 1, lineNumber, 1), model.getLineContent(otherLineNumber));
                    // Remove content from other line number
                    builder.addEditOperation(new range_1.$ks(otherLineNumber, 1, otherLineNumber, model.getLineMaxColumn(otherLineNumber)), null);
                }
                // Track selection at the other line number
                s = new selection_1.$ms(otherLineNumber, 1, otherLineNumber, 1);
            }
            else {
                let movingLineNumber;
                let movingLineText;
                if (this.b) {
                    movingLineNumber = s.endLineNumber + 1;
                    movingLineText = model.getLineContent(movingLineNumber);
                    // Delete line that needs to be moved
                    builder.addEditOperation(new range_1.$ks(movingLineNumber - 1, model.getLineMaxColumn(movingLineNumber - 1), movingLineNumber, model.getLineMaxColumn(movingLineNumber)), null);
                    let insertingText = movingLineText;
                    if (this.n(model, s)) {
                        const movingLineMatchResult = this.l(model, indentConverter, tabSize, movingLineNumber, s.startLineNumber - 1);
                        // if s.startLineNumber - 1 matches onEnter rule, we still honor that.
                        if (movingLineMatchResult !== null) {
                            const oldIndentation = strings.$Ce(model.getLineContent(movingLineNumber));
                            const newSpaceCnt = movingLineMatchResult + indentUtils.$78(oldIndentation, tabSize);
                            const newIndentation = indentUtils.$88(newSpaceCnt, tabSize, insertSpaces);
                            insertingText = newIndentation + this.m(movingLineText);
                        }
                        else {
                            // no enter rule matches, let's check indentatin rules then.
                            virtualModel.getLineContent = (lineNumber) => {
                                if (lineNumber === s.startLineNumber) {
                                    return model.getLineContent(movingLineNumber);
                                }
                                else {
                                    return model.getLineContent(lineNumber);
                                }
                            };
                            const indentOfMovingLine = (0, autoIndent_1.$_V)(this.c, virtualModel, model.getLanguageIdAtPosition(movingLineNumber, 1), s.startLineNumber, indentConverter, this.g);
                            if (indentOfMovingLine !== null) {
                                const oldIndentation = strings.$Ce(model.getLineContent(movingLineNumber));
                                const newSpaceCnt = indentUtils.$78(indentOfMovingLine, tabSize);
                                const oldSpaceCnt = indentUtils.$78(oldIndentation, tabSize);
                                if (newSpaceCnt !== oldSpaceCnt) {
                                    const newIndentation = indentUtils.$88(newSpaceCnt, tabSize, insertSpaces);
                                    insertingText = newIndentation + this.m(movingLineText);
                                }
                            }
                        }
                        // add edit operations for moving line first to make sure it's executed after we make indentation change
                        // to s.startLineNumber
                        builder.addEditOperation(new range_1.$ks(s.startLineNumber, 1, s.startLineNumber, 1), insertingText + '\n');
                        const ret = this.k(model, indentConverter, tabSize, s.startLineNumber, movingLineNumber, insertingText);
                        // check if the line being moved before matches onEnter rules, if so let's adjust the indentation by onEnter rules.
                        if (ret !== null) {
                            if (ret !== 0) {
                                this.o(model, builder, s, tabSize, insertSpaces, ret);
                            }
                        }
                        else {
                            // it doesn't match onEnter rules, let's check indentation rules then.
                            virtualModel.getLineContent = (lineNumber) => {
                                if (lineNumber === s.startLineNumber) {
                                    return insertingText;
                                }
                                else if (lineNumber >= s.startLineNumber + 1 && lineNumber <= s.endLineNumber + 1) {
                                    return model.getLineContent(lineNumber - 1);
                                }
                                else {
                                    return model.getLineContent(lineNumber);
                                }
                            };
                            const newIndentatOfMovingBlock = (0, autoIndent_1.$_V)(this.c, virtualModel, model.getLanguageIdAtPosition(movingLineNumber, 1), s.startLineNumber + 1, indentConverter, this.g);
                            if (newIndentatOfMovingBlock !== null) {
                                const oldIndentation = strings.$Ce(model.getLineContent(s.startLineNumber));
                                const newSpaceCnt = indentUtils.$78(newIndentatOfMovingBlock, tabSize);
                                const oldSpaceCnt = indentUtils.$78(oldIndentation, tabSize);
                                if (newSpaceCnt !== oldSpaceCnt) {
                                    const spaceCntOffset = newSpaceCnt - oldSpaceCnt;
                                    this.o(model, builder, s, tabSize, insertSpaces, spaceCntOffset);
                                }
                            }
                        }
                    }
                    else {
                        // Insert line that needs to be moved before
                        builder.addEditOperation(new range_1.$ks(s.startLineNumber, 1, s.startLineNumber, 1), insertingText + '\n');
                    }
                }
                else {
                    movingLineNumber = s.startLineNumber - 1;
                    movingLineText = model.getLineContent(movingLineNumber);
                    // Delete line that needs to be moved
                    builder.addEditOperation(new range_1.$ks(movingLineNumber, 1, movingLineNumber + 1, 1), null);
                    // Insert line that needs to be moved after
                    builder.addEditOperation(new range_1.$ks(s.endLineNumber, model.getLineMaxColumn(s.endLineNumber), s.endLineNumber, model.getLineMaxColumn(s.endLineNumber)), '\n' + movingLineText);
                    if (this.n(model, s)) {
                        virtualModel.getLineContent = (lineNumber) => {
                            if (lineNumber === movingLineNumber) {
                                return model.getLineContent(s.startLineNumber);
                            }
                            else {
                                return model.getLineContent(lineNumber);
                            }
                        };
                        const ret = this.l(model, indentConverter, tabSize, s.startLineNumber, s.startLineNumber - 2);
                        // check if s.startLineNumber - 2 matches onEnter rules, if so adjust the moving block by onEnter rules.
                        if (ret !== null) {
                            if (ret !== 0) {
                                this.o(model, builder, s, tabSize, insertSpaces, ret);
                            }
                        }
                        else {
                            // it doesn't match any onEnter rule, let's check indentation rules then.
                            const indentOfFirstLine = (0, autoIndent_1.$_V)(this.c, virtualModel, model.getLanguageIdAtPosition(s.startLineNumber, 1), movingLineNumber, indentConverter, this.g);
                            if (indentOfFirstLine !== null) {
                                // adjust the indentation of the moving block
                                const oldIndent = strings.$Ce(model.getLineContent(s.startLineNumber));
                                const newSpaceCnt = indentUtils.$78(indentOfFirstLine, tabSize);
                                const oldSpaceCnt = indentUtils.$78(oldIndent, tabSize);
                                if (newSpaceCnt !== oldSpaceCnt) {
                                    const spaceCntOffset = newSpaceCnt - oldSpaceCnt;
                                    this.o(model, builder, s, tabSize, insertSpaces, spaceCntOffset);
                                }
                            }
                        }
                    }
                }
            }
            this.d = builder.trackSelection(s);
        }
        h(tabSize, indentSize, insertSpaces) {
            return {
                shiftIndent: (indentation) => {
                    return shiftCommand_1.$8V.shiftIndent(indentation, indentation.length + 1, tabSize, indentSize, insertSpaces);
                },
                unshiftIndent: (indentation) => {
                    return shiftCommand_1.$8V.unshiftIndent(indentation, indentation.length + 1, tabSize, indentSize, insertSpaces);
                }
            };
        }
        j(model, indentConverter, tabSize, line, enter) {
            if (enter) {
                let enterPrefix = enter.indentation;
                if (enter.indentAction === languageConfiguration_1.IndentAction.None) {
                    enterPrefix = enter.indentation + enter.appendText;
                }
                else if (enter.indentAction === languageConfiguration_1.IndentAction.Indent) {
                    enterPrefix = enter.indentation + enter.appendText;
                }
                else if (enter.indentAction === languageConfiguration_1.IndentAction.IndentOutdent) {
                    enterPrefix = enter.indentation;
                }
                else if (enter.indentAction === languageConfiguration_1.IndentAction.Outdent) {
                    enterPrefix = indentConverter.unshiftIndent(enter.indentation) + enter.appendText;
                }
                const movingLineText = model.getLineContent(line);
                if (this.m(movingLineText).indexOf(this.m(enterPrefix)) >= 0) {
                    const oldIndentation = strings.$Ce(model.getLineContent(line));
                    let newIndentation = strings.$Ce(enterPrefix);
                    const indentMetadataOfMovelingLine = (0, autoIndent_1.$cW)(model, line, this.g);
                    if (indentMetadataOfMovelingLine !== null && indentMetadataOfMovelingLine & 2 /* IndentConsts.DECREASE_MASK */) {
                        newIndentation = indentConverter.unshiftIndent(newIndentation);
                    }
                    const newSpaceCnt = indentUtils.$78(newIndentation, tabSize);
                    const oldSpaceCnt = indentUtils.$78(oldIndentation, tabSize);
                    return newSpaceCnt - oldSpaceCnt;
                }
            }
            return null;
        }
        /**
         *
         * @param model
         * @param indentConverter
         * @param tabSize
         * @param line the line moving down
         * @param futureAboveLineNumber the line which will be at the `line` position
         * @param futureAboveLineText
         */
        k(model, indentConverter, tabSize, line, futureAboveLineNumber, futureAboveLineText) {
            if (strings.$De(futureAboveLineText) >= 0) {
                // break
                const maxColumn = model.getLineMaxColumn(futureAboveLineNumber);
                const enter = (0, enterAction_1.$7V)(this.c, model, new range_1.$ks(futureAboveLineNumber, maxColumn, futureAboveLineNumber, maxColumn), this.g);
                return this.j(model, indentConverter, tabSize, line, enter);
            }
            else {
                // go upwards, starting from `line - 1`
                let validPrecedingLine = line - 1;
                while (validPrecedingLine >= 1) {
                    const lineContent = model.getLineContent(validPrecedingLine);
                    const nonWhitespaceIdx = strings.$De(lineContent);
                    if (nonWhitespaceIdx >= 0) {
                        break;
                    }
                    validPrecedingLine--;
                }
                if (validPrecedingLine < 1 || line > model.getLineCount()) {
                    return null;
                }
                const maxColumn = model.getLineMaxColumn(validPrecedingLine);
                const enter = (0, enterAction_1.$7V)(this.c, model, new range_1.$ks(validPrecedingLine, maxColumn, validPrecedingLine, maxColumn), this.g);
                return this.j(model, indentConverter, tabSize, line, enter);
            }
        }
        l(model, indentConverter, tabSize, line, oneLineAbove, previousLineText) {
            let validPrecedingLine = oneLineAbove;
            while (validPrecedingLine >= 1) {
                // ship empty lines as empty lines just inherit indentation
                let lineContent;
                if (validPrecedingLine === oneLineAbove && previousLineText !== undefined) {
                    lineContent = previousLineText;
                }
                else {
                    lineContent = model.getLineContent(validPrecedingLine);
                }
                const nonWhitespaceIdx = strings.$De(lineContent);
                if (nonWhitespaceIdx >= 0) {
                    break;
                }
                validPrecedingLine--;
            }
            if (validPrecedingLine < 1 || line > model.getLineCount()) {
                return null;
            }
            const maxColumn = model.getLineMaxColumn(validPrecedingLine);
            const enter = (0, enterAction_1.$7V)(this.c, model, new range_1.$ks(validPrecedingLine, maxColumn, validPrecedingLine, maxColumn), this.g);
            return this.j(model, indentConverter, tabSize, line, enter);
        }
        m(str) {
            return str.replace(/^\s+/, '');
        }
        n(model, selection) {
            if (this.c < 4 /* EditorAutoIndentStrategy.Full */) {
                return false;
            }
            // if it's not easy to tokenize, we stop auto indent.
            if (!model.tokenization.isCheapToTokenize(selection.startLineNumber)) {
                return false;
            }
            const languageAtSelectionStart = model.getLanguageIdAtPosition(selection.startLineNumber, 1);
            const languageAtSelectionEnd = model.getLanguageIdAtPosition(selection.endLineNumber, 1);
            if (languageAtSelectionStart !== languageAtSelectionEnd) {
                return false;
            }
            if (this.g.getLanguageConfiguration(languageAtSelectionStart).indentRulesSupport === null) {
                return false;
            }
            return true;
        }
        o(model, builder, s, tabSize, insertSpaces, offset) {
            for (let i = s.startLineNumber; i <= s.endLineNumber; i++) {
                const lineContent = model.getLineContent(i);
                const originalIndent = strings.$Ce(lineContent);
                const originalSpacesCnt = indentUtils.$78(originalIndent, tabSize);
                const newSpacesCnt = originalSpacesCnt + offset;
                const newIndent = indentUtils.$88(newSpacesCnt, tabSize, insertSpaces);
                if (newIndent !== originalIndent) {
                    builder.addEditOperation(new range_1.$ks(i, 1, i, originalIndent.length + 1), newIndent);
                    if (i === s.endLineNumber && s.endColumn <= originalIndent.length + 1 && newIndent === '') {
                        // as users select part of the original indent white spaces
                        // when we adjust the indentation of endLine, we should adjust the cursor position as well.
                        this.f = true;
                    }
                }
            }
        }
        computeCursorState(model, helper) {
            let result = helper.getTrackedSelection(this.d);
            if (this.e) {
                result = result.setEndPosition(result.endLineNumber + 1, 1);
            }
            if (this.f && result.startLineNumber < result.endLineNumber) {
                result = result.setEndPosition(result.endLineNumber, 2);
            }
            return result;
        }
    };
    exports.$y9 = $y9;
    exports.$y9 = $y9 = __decorate([
        __param(3, languageConfigurationRegistry_1.$2t)
    ], $y9);
});
//# sourceMappingURL=moveLinesCommand.js.map