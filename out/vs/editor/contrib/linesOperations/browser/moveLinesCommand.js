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
    exports.MoveLinesCommand = void 0;
    let MoveLinesCommand = class MoveLinesCommand {
        constructor(selection, isMovingDown, autoIndent, _languageConfigurationService) {
            this._languageConfigurationService = _languageConfigurationService;
            this._selection = selection;
            this._isMovingDown = isMovingDown;
            this._autoIndent = autoIndent;
            this._selectionId = null;
            this._moveEndLineSelectionShrink = false;
        }
        getEditOperations(model, builder) {
            const modelLineCount = model.getLineCount();
            if (this._isMovingDown && this._selection.endLineNumber === modelLineCount) {
                this._selectionId = builder.trackSelection(this._selection);
                return;
            }
            if (!this._isMovingDown && this._selection.startLineNumber === 1) {
                this._selectionId = builder.trackSelection(this._selection);
                return;
            }
            this._moveEndPositionDown = false;
            let s = this._selection;
            if (s.startLineNumber < s.endLineNumber && s.endColumn === 1) {
                this._moveEndPositionDown = true;
                s = s.setEndPosition(s.endLineNumber - 1, model.getLineMaxColumn(s.endLineNumber - 1));
            }
            const { tabSize, indentSize, insertSpaces } = model.getOptions();
            const indentConverter = this.buildIndentConverter(tabSize, indentSize, insertSpaces);
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
                const otherLineNumber = (this._isMovingDown ? lineNumber + 1 : lineNumber - 1);
                if (model.getLineMaxColumn(otherLineNumber) === 1) {
                    // Other line number is empty too, so no editing is needed
                    // Add a no-op to force running by the model
                    builder.addEditOperation(new range_1.Range(1, 1, 1, 1), null);
                }
                else {
                    // Type content from other line number on line number
                    builder.addEditOperation(new range_1.Range(lineNumber, 1, lineNumber, 1), model.getLineContent(otherLineNumber));
                    // Remove content from other line number
                    builder.addEditOperation(new range_1.Range(otherLineNumber, 1, otherLineNumber, model.getLineMaxColumn(otherLineNumber)), null);
                }
                // Track selection at the other line number
                s = new selection_1.Selection(otherLineNumber, 1, otherLineNumber, 1);
            }
            else {
                let movingLineNumber;
                let movingLineText;
                if (this._isMovingDown) {
                    movingLineNumber = s.endLineNumber + 1;
                    movingLineText = model.getLineContent(movingLineNumber);
                    // Delete line that needs to be moved
                    builder.addEditOperation(new range_1.Range(movingLineNumber - 1, model.getLineMaxColumn(movingLineNumber - 1), movingLineNumber, model.getLineMaxColumn(movingLineNumber)), null);
                    let insertingText = movingLineText;
                    if (this.shouldAutoIndent(model, s)) {
                        const movingLineMatchResult = this.matchEnterRule(model, indentConverter, tabSize, movingLineNumber, s.startLineNumber - 1);
                        // if s.startLineNumber - 1 matches onEnter rule, we still honor that.
                        if (movingLineMatchResult !== null) {
                            const oldIndentation = strings.getLeadingWhitespace(model.getLineContent(movingLineNumber));
                            const newSpaceCnt = movingLineMatchResult + indentUtils.getSpaceCnt(oldIndentation, tabSize);
                            const newIndentation = indentUtils.generateIndent(newSpaceCnt, tabSize, insertSpaces);
                            insertingText = newIndentation + this.trimStart(movingLineText);
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
                            const indentOfMovingLine = (0, autoIndent_1.getGoodIndentForLine)(this._autoIndent, virtualModel, model.getLanguageIdAtPosition(movingLineNumber, 1), s.startLineNumber, indentConverter, this._languageConfigurationService);
                            if (indentOfMovingLine !== null) {
                                const oldIndentation = strings.getLeadingWhitespace(model.getLineContent(movingLineNumber));
                                const newSpaceCnt = indentUtils.getSpaceCnt(indentOfMovingLine, tabSize);
                                const oldSpaceCnt = indentUtils.getSpaceCnt(oldIndentation, tabSize);
                                if (newSpaceCnt !== oldSpaceCnt) {
                                    const newIndentation = indentUtils.generateIndent(newSpaceCnt, tabSize, insertSpaces);
                                    insertingText = newIndentation + this.trimStart(movingLineText);
                                }
                            }
                        }
                        // add edit operations for moving line first to make sure it's executed after we make indentation change
                        // to s.startLineNumber
                        builder.addEditOperation(new range_1.Range(s.startLineNumber, 1, s.startLineNumber, 1), insertingText + '\n');
                        const ret = this.matchEnterRuleMovingDown(model, indentConverter, tabSize, s.startLineNumber, movingLineNumber, insertingText);
                        // check if the line being moved before matches onEnter rules, if so let's adjust the indentation by onEnter rules.
                        if (ret !== null) {
                            if (ret !== 0) {
                                this.getIndentEditsOfMovingBlock(model, builder, s, tabSize, insertSpaces, ret);
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
                            const newIndentatOfMovingBlock = (0, autoIndent_1.getGoodIndentForLine)(this._autoIndent, virtualModel, model.getLanguageIdAtPosition(movingLineNumber, 1), s.startLineNumber + 1, indentConverter, this._languageConfigurationService);
                            if (newIndentatOfMovingBlock !== null) {
                                const oldIndentation = strings.getLeadingWhitespace(model.getLineContent(s.startLineNumber));
                                const newSpaceCnt = indentUtils.getSpaceCnt(newIndentatOfMovingBlock, tabSize);
                                const oldSpaceCnt = indentUtils.getSpaceCnt(oldIndentation, tabSize);
                                if (newSpaceCnt !== oldSpaceCnt) {
                                    const spaceCntOffset = newSpaceCnt - oldSpaceCnt;
                                    this.getIndentEditsOfMovingBlock(model, builder, s, tabSize, insertSpaces, spaceCntOffset);
                                }
                            }
                        }
                    }
                    else {
                        // Insert line that needs to be moved before
                        builder.addEditOperation(new range_1.Range(s.startLineNumber, 1, s.startLineNumber, 1), insertingText + '\n');
                    }
                }
                else {
                    movingLineNumber = s.startLineNumber - 1;
                    movingLineText = model.getLineContent(movingLineNumber);
                    // Delete line that needs to be moved
                    builder.addEditOperation(new range_1.Range(movingLineNumber, 1, movingLineNumber + 1, 1), null);
                    // Insert line that needs to be moved after
                    builder.addEditOperation(new range_1.Range(s.endLineNumber, model.getLineMaxColumn(s.endLineNumber), s.endLineNumber, model.getLineMaxColumn(s.endLineNumber)), '\n' + movingLineText);
                    if (this.shouldAutoIndent(model, s)) {
                        virtualModel.getLineContent = (lineNumber) => {
                            if (lineNumber === movingLineNumber) {
                                return model.getLineContent(s.startLineNumber);
                            }
                            else {
                                return model.getLineContent(lineNumber);
                            }
                        };
                        const ret = this.matchEnterRule(model, indentConverter, tabSize, s.startLineNumber, s.startLineNumber - 2);
                        // check if s.startLineNumber - 2 matches onEnter rules, if so adjust the moving block by onEnter rules.
                        if (ret !== null) {
                            if (ret !== 0) {
                                this.getIndentEditsOfMovingBlock(model, builder, s, tabSize, insertSpaces, ret);
                            }
                        }
                        else {
                            // it doesn't match any onEnter rule, let's check indentation rules then.
                            const indentOfFirstLine = (0, autoIndent_1.getGoodIndentForLine)(this._autoIndent, virtualModel, model.getLanguageIdAtPosition(s.startLineNumber, 1), movingLineNumber, indentConverter, this._languageConfigurationService);
                            if (indentOfFirstLine !== null) {
                                // adjust the indentation of the moving block
                                const oldIndent = strings.getLeadingWhitespace(model.getLineContent(s.startLineNumber));
                                const newSpaceCnt = indentUtils.getSpaceCnt(indentOfFirstLine, tabSize);
                                const oldSpaceCnt = indentUtils.getSpaceCnt(oldIndent, tabSize);
                                if (newSpaceCnt !== oldSpaceCnt) {
                                    const spaceCntOffset = newSpaceCnt - oldSpaceCnt;
                                    this.getIndentEditsOfMovingBlock(model, builder, s, tabSize, insertSpaces, spaceCntOffset);
                                }
                            }
                        }
                    }
                }
            }
            this._selectionId = builder.trackSelection(s);
        }
        buildIndentConverter(tabSize, indentSize, insertSpaces) {
            return {
                shiftIndent: (indentation) => {
                    return shiftCommand_1.ShiftCommand.shiftIndent(indentation, indentation.length + 1, tabSize, indentSize, insertSpaces);
                },
                unshiftIndent: (indentation) => {
                    return shiftCommand_1.ShiftCommand.unshiftIndent(indentation, indentation.length + 1, tabSize, indentSize, insertSpaces);
                }
            };
        }
        parseEnterResult(model, indentConverter, tabSize, line, enter) {
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
                if (this.trimStart(movingLineText).indexOf(this.trimStart(enterPrefix)) >= 0) {
                    const oldIndentation = strings.getLeadingWhitespace(model.getLineContent(line));
                    let newIndentation = strings.getLeadingWhitespace(enterPrefix);
                    const indentMetadataOfMovelingLine = (0, autoIndent_1.getIndentMetadata)(model, line, this._languageConfigurationService);
                    if (indentMetadataOfMovelingLine !== null && indentMetadataOfMovelingLine & 2 /* IndentConsts.DECREASE_MASK */) {
                        newIndentation = indentConverter.unshiftIndent(newIndentation);
                    }
                    const newSpaceCnt = indentUtils.getSpaceCnt(newIndentation, tabSize);
                    const oldSpaceCnt = indentUtils.getSpaceCnt(oldIndentation, tabSize);
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
        matchEnterRuleMovingDown(model, indentConverter, tabSize, line, futureAboveLineNumber, futureAboveLineText) {
            if (strings.lastNonWhitespaceIndex(futureAboveLineText) >= 0) {
                // break
                const maxColumn = model.getLineMaxColumn(futureAboveLineNumber);
                const enter = (0, enterAction_1.getEnterAction)(this._autoIndent, model, new range_1.Range(futureAboveLineNumber, maxColumn, futureAboveLineNumber, maxColumn), this._languageConfigurationService);
                return this.parseEnterResult(model, indentConverter, tabSize, line, enter);
            }
            else {
                // go upwards, starting from `line - 1`
                let validPrecedingLine = line - 1;
                while (validPrecedingLine >= 1) {
                    const lineContent = model.getLineContent(validPrecedingLine);
                    const nonWhitespaceIdx = strings.lastNonWhitespaceIndex(lineContent);
                    if (nonWhitespaceIdx >= 0) {
                        break;
                    }
                    validPrecedingLine--;
                }
                if (validPrecedingLine < 1 || line > model.getLineCount()) {
                    return null;
                }
                const maxColumn = model.getLineMaxColumn(validPrecedingLine);
                const enter = (0, enterAction_1.getEnterAction)(this._autoIndent, model, new range_1.Range(validPrecedingLine, maxColumn, validPrecedingLine, maxColumn), this._languageConfigurationService);
                return this.parseEnterResult(model, indentConverter, tabSize, line, enter);
            }
        }
        matchEnterRule(model, indentConverter, tabSize, line, oneLineAbove, previousLineText) {
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
                const nonWhitespaceIdx = strings.lastNonWhitespaceIndex(lineContent);
                if (nonWhitespaceIdx >= 0) {
                    break;
                }
                validPrecedingLine--;
            }
            if (validPrecedingLine < 1 || line > model.getLineCount()) {
                return null;
            }
            const maxColumn = model.getLineMaxColumn(validPrecedingLine);
            const enter = (0, enterAction_1.getEnterAction)(this._autoIndent, model, new range_1.Range(validPrecedingLine, maxColumn, validPrecedingLine, maxColumn), this._languageConfigurationService);
            return this.parseEnterResult(model, indentConverter, tabSize, line, enter);
        }
        trimStart(str) {
            return str.replace(/^\s+/, '');
        }
        shouldAutoIndent(model, selection) {
            if (this._autoIndent < 4 /* EditorAutoIndentStrategy.Full */) {
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
            if (this._languageConfigurationService.getLanguageConfiguration(languageAtSelectionStart).indentRulesSupport === null) {
                return false;
            }
            return true;
        }
        getIndentEditsOfMovingBlock(model, builder, s, tabSize, insertSpaces, offset) {
            for (let i = s.startLineNumber; i <= s.endLineNumber; i++) {
                const lineContent = model.getLineContent(i);
                const originalIndent = strings.getLeadingWhitespace(lineContent);
                const originalSpacesCnt = indentUtils.getSpaceCnt(originalIndent, tabSize);
                const newSpacesCnt = originalSpacesCnt + offset;
                const newIndent = indentUtils.generateIndent(newSpacesCnt, tabSize, insertSpaces);
                if (newIndent !== originalIndent) {
                    builder.addEditOperation(new range_1.Range(i, 1, i, originalIndent.length + 1), newIndent);
                    if (i === s.endLineNumber && s.endColumn <= originalIndent.length + 1 && newIndent === '') {
                        // as users select part of the original indent white spaces
                        // when we adjust the indentation of endLine, we should adjust the cursor position as well.
                        this._moveEndLineSelectionShrink = true;
                    }
                }
            }
        }
        computeCursorState(model, helper) {
            let result = helper.getTrackedSelection(this._selectionId);
            if (this._moveEndPositionDown) {
                result = result.setEndPosition(result.endLineNumber + 1, 1);
            }
            if (this._moveEndLineSelectionShrink && result.startLineNumber < result.endLineNumber) {
                result = result.setEndPosition(result.endLineNumber, 2);
            }
            return result;
        }
    };
    exports.MoveLinesCommand = MoveLinesCommand;
    exports.MoveLinesCommand = MoveLinesCommand = __decorate([
        __param(3, languageConfigurationRegistry_1.ILanguageConfigurationService)
    ], MoveLinesCommand);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW92ZUxpbmVzQ29tbWFuZC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2xpbmVzT3BlcmF0aW9ucy9icm93c2VyL21vdmVMaW5lc0NvbW1hbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBZ0J6RixJQUFNLGdCQUFnQixHQUF0QixNQUFNLGdCQUFnQjtRQVU1QixZQUNDLFNBQW9CLEVBQ3BCLFlBQXFCLEVBQ3JCLFVBQW9DLEVBQ1ksNkJBQTREO1lBQTVELGtDQUE2QixHQUE3Qiw2QkFBNkIsQ0FBK0I7WUFFNUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7WUFDNUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxZQUFZLENBQUM7WUFDbEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7WUFDOUIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7WUFDekIsSUFBSSxDQUFDLDJCQUEyQixHQUFHLEtBQUssQ0FBQztRQUMxQyxDQUFDO1FBRU0saUJBQWlCLENBQUMsS0FBaUIsRUFBRSxPQUE4QjtZQUV6RSxNQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUM7WUFFNUMsSUFBSSxJQUFJLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxLQUFLLGNBQWMsRUFBRTtnQkFDM0UsSUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDNUQsT0FBTzthQUNQO1lBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLEtBQUssQ0FBQyxFQUFFO2dCQUNqRSxJQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUM1RCxPQUFPO2FBQ1A7WUFFRCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsS0FBSyxDQUFDO1lBQ2xDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7WUFFeEIsSUFBSSxDQUFDLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQyxhQUFhLElBQUksQ0FBQyxDQUFDLFNBQVMsS0FBSyxDQUFDLEVBQUU7Z0JBQzdELElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7Z0JBQ2pDLENBQUMsR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxhQUFhLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDdkY7WUFFRCxNQUFNLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsR0FBRyxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDakUsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDckYsTUFBTSxZQUFZLEdBQWtCO2dCQUNuQyxZQUFZLEVBQUU7b0JBQ2IsYUFBYSxFQUFFLENBQUMsVUFBa0IsRUFBRSxFQUFFO3dCQUNyQyxPQUFPLEtBQUssQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUNyRCxDQUFDO29CQUNELGFBQWEsRUFBRSxHQUFHLEVBQUU7d0JBQ25CLE9BQU8sS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO29CQUM5QixDQUFDO29CQUNELHVCQUF1QixFQUFFLENBQUMsVUFBa0IsRUFBRSxNQUFjLEVBQUUsRUFBRTt3QkFDL0QsT0FBTyxLQUFLLENBQUMsdUJBQXVCLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUMxRCxDQUFDO2lCQUNEO2dCQUNELGNBQWMsRUFBRSxJQUFpRDthQUNqRSxDQUFDO1lBRUYsSUFBSSxDQUFDLENBQUMsZUFBZSxLQUFLLENBQUMsQ0FBQyxhQUFhLElBQUksS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQzdGLHdCQUF3QjtnQkFDeEIsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQztnQkFDckMsTUFBTSxlQUFlLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBRS9FLElBQUksS0FBSyxDQUFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsRUFBRTtvQkFDbEQsMERBQTBEO29CQUMxRCw0Q0FBNEM7b0JBQzVDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztpQkFDdEQ7cUJBQU07b0JBQ04scURBQXFEO29CQUNyRCxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxhQUFLLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO29CQUV6Ryx3Q0FBd0M7b0JBQ3hDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLGFBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQyxFQUFFLGVBQWUsRUFBRSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztpQkFDeEg7Z0JBQ0QsMkNBQTJDO2dCQUMzQyxDQUFDLEdBQUcsSUFBSSxxQkFBUyxDQUFDLGVBQWUsRUFBRSxDQUFDLEVBQUUsZUFBZSxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBRTFEO2lCQUFNO2dCQUVOLElBQUksZ0JBQXdCLENBQUM7Z0JBQzdCLElBQUksY0FBc0IsQ0FBQztnQkFFM0IsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO29CQUN2QixnQkFBZ0IsR0FBRyxDQUFDLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztvQkFDdkMsY0FBYyxHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztvQkFDeEQscUNBQXFDO29CQUNyQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxhQUFLLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUUxSyxJQUFJLGFBQWEsR0FBRyxjQUFjLENBQUM7b0JBRW5DLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRTt3QkFDcEMsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxlQUFlLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDLENBQUM7d0JBQzVILHNFQUFzRTt3QkFDdEUsSUFBSSxxQkFBcUIsS0FBSyxJQUFJLEVBQUU7NEJBQ25DLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQzs0QkFDNUYsTUFBTSxXQUFXLEdBQUcscUJBQXFCLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7NEJBQzdGLE1BQU0sY0FBYyxHQUFHLFdBQVcsQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQzs0QkFDdEYsYUFBYSxHQUFHLGNBQWMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDO3lCQUNoRTs2QkFBTTs0QkFDTiw0REFBNEQ7NEJBQzVELFlBQVksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxVQUFrQixFQUFFLEVBQUU7Z0NBQ3BELElBQUksVUFBVSxLQUFLLENBQUMsQ0FBQyxlQUFlLEVBQUU7b0NBQ3JDLE9BQU8sS0FBSyxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2lDQUM5QztxQ0FBTTtvQ0FDTixPQUFPLEtBQUssQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7aUNBQ3hDOzRCQUNGLENBQUMsQ0FBQzs0QkFDRixNQUFNLGtCQUFrQixHQUFHLElBQUEsaUNBQW9CLEVBQzlDLElBQUksQ0FBQyxXQUFXLEVBQ2hCLFlBQVksRUFDWixLQUFLLENBQUMsdUJBQXVCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLEVBQ2xELENBQUMsQ0FBQyxlQUFlLEVBQ2pCLGVBQWUsRUFDZixJQUFJLENBQUMsNkJBQTZCLENBQ2xDLENBQUM7NEJBQ0YsSUFBSSxrQkFBa0IsS0FBSyxJQUFJLEVBQUU7Z0NBQ2hDLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztnQ0FDNUYsTUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsRUFBRSxPQUFPLENBQUMsQ0FBQztnQ0FDekUsTUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0NBQ3JFLElBQUksV0FBVyxLQUFLLFdBQVcsRUFBRTtvQ0FDaEMsTUFBTSxjQUFjLEdBQUcsV0FBVyxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUFDO29DQUN0RixhQUFhLEdBQUcsY0FBYyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUM7aUNBQ2hFOzZCQUNEO3lCQUNEO3dCQUVELHdHQUF3Rzt3QkFDeEcsdUJBQXVCO3dCQUN2QixPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxhQUFLLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsRUFBRSxhQUFhLEdBQUcsSUFBSSxDQUFDLENBQUM7d0JBRXRHLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsZUFBZSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsZUFBZSxFQUFFLGdCQUFnQixFQUFFLGFBQWEsQ0FBQyxDQUFDO3dCQUUvSCxtSEFBbUg7d0JBQ25ILElBQUksR0FBRyxLQUFLLElBQUksRUFBRTs0QkFDakIsSUFBSSxHQUFHLEtBQUssQ0FBQyxFQUFFO2dDQUNkLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLEdBQUcsQ0FBQyxDQUFDOzZCQUNoRjt5QkFDRDs2QkFBTTs0QkFDTixzRUFBc0U7NEJBQ3RFLFlBQVksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxVQUFrQixFQUFFLEVBQUU7Z0NBQ3BELElBQUksVUFBVSxLQUFLLENBQUMsQ0FBQyxlQUFlLEVBQUU7b0NBQ3JDLE9BQU8sYUFBYSxDQUFDO2lDQUNyQjtxQ0FBTSxJQUFJLFVBQVUsSUFBSSxDQUFDLENBQUMsZUFBZSxHQUFHLENBQUMsSUFBSSxVQUFVLElBQUksQ0FBQyxDQUFDLGFBQWEsR0FBRyxDQUFDLEVBQUU7b0NBQ3BGLE9BQU8sS0FBSyxDQUFDLGNBQWMsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUM7aUNBQzVDO3FDQUFNO29DQUNOLE9BQU8sS0FBSyxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztpQ0FDeEM7NEJBQ0YsQ0FBQyxDQUFDOzRCQUVGLE1BQU0sd0JBQXdCLEdBQUcsSUFBQSxpQ0FBb0IsRUFDcEQsSUFBSSxDQUFDLFdBQVcsRUFDaEIsWUFBWSxFQUNaLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsRUFDbEQsQ0FBQyxDQUFDLGVBQWUsR0FBRyxDQUFDLEVBQ3JCLGVBQWUsRUFDZixJQUFJLENBQUMsNkJBQTZCLENBQ2xDLENBQUM7NEJBRUYsSUFBSSx3QkFBd0IsS0FBSyxJQUFJLEVBQUU7Z0NBQ3RDLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO2dDQUM3RixNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDLHdCQUF3QixFQUFFLE9BQU8sQ0FBQyxDQUFDO2dDQUMvRSxNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztnQ0FDckUsSUFBSSxXQUFXLEtBQUssV0FBVyxFQUFFO29DQUNoQyxNQUFNLGNBQWMsR0FBRyxXQUFXLEdBQUcsV0FBVyxDQUFDO29DQUVqRCxJQUFJLENBQUMsMkJBQTJCLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxjQUFjLENBQUMsQ0FBQztpQ0FDM0Y7NkJBQ0Q7eUJBQ0Q7cUJBQ0Q7eUJBQU07d0JBQ04sNENBQTRDO3dCQUM1QyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxhQUFLLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsRUFBRSxhQUFhLEdBQUcsSUFBSSxDQUFDLENBQUM7cUJBQ3RHO2lCQUNEO3FCQUFNO29CQUNOLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDO29CQUN6QyxjQUFjLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO29CQUV4RCxxQ0FBcUM7b0JBQ3JDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLGFBQUssQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsZ0JBQWdCLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUV4RiwyQ0FBMkM7b0JBQzNDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLGFBQUssQ0FBQyxDQUFDLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUUsSUFBSSxHQUFHLGNBQWMsQ0FBQyxDQUFDO29CQUUvSyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUU7d0JBQ3BDLFlBQVksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxVQUFrQixFQUFFLEVBQUU7NEJBQ3BELElBQUksVUFBVSxLQUFLLGdCQUFnQixFQUFFO2dDQUNwQyxPQUFPLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDOzZCQUMvQztpQ0FBTTtnQ0FDTixPQUFPLEtBQUssQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7NkJBQ3hDO3dCQUNGLENBQUMsQ0FBQzt3QkFFRixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxlQUFlLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUMsQ0FBQzt3QkFDM0csd0dBQXdHO3dCQUN4RyxJQUFJLEdBQUcsS0FBSyxJQUFJLEVBQUU7NEJBQ2pCLElBQUksR0FBRyxLQUFLLENBQUMsRUFBRTtnQ0FDZCxJQUFJLENBQUMsMkJBQTJCLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxHQUFHLENBQUMsQ0FBQzs2QkFDaEY7eUJBQ0Q7NkJBQU07NEJBQ04seUVBQXlFOzRCQUN6RSxNQUFNLGlCQUFpQixHQUFHLElBQUEsaUNBQW9CLEVBQzdDLElBQUksQ0FBQyxXQUFXLEVBQ2hCLFlBQVksRUFDWixLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsRUFDbkQsZ0JBQWdCLEVBQ2hCLGVBQWUsRUFDZixJQUFJLENBQUMsNkJBQTZCLENBQ2xDLENBQUM7NEJBQ0YsSUFBSSxpQkFBaUIsS0FBSyxJQUFJLEVBQUU7Z0NBQy9CLDZDQUE2QztnQ0FDN0MsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7Z0NBQ3hGLE1BQU0sV0FBVyxHQUFHLFdBQVcsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0NBQ3hFLE1BQU0sV0FBVyxHQUFHLFdBQVcsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dDQUNoRSxJQUFJLFdBQVcsS0FBSyxXQUFXLEVBQUU7b0NBQ2hDLE1BQU0sY0FBYyxHQUFHLFdBQVcsR0FBRyxXQUFXLENBQUM7b0NBRWpELElBQUksQ0FBQywyQkFBMkIsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLGNBQWMsQ0FBQyxDQUFDO2lDQUMzRjs2QkFDRDt5QkFDRDtxQkFDRDtpQkFDRDthQUNEO1lBRUQsSUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFTyxvQkFBb0IsQ0FBQyxPQUFlLEVBQUUsVUFBa0IsRUFBRSxZQUFxQjtZQUN0RixPQUFPO2dCQUNOLFdBQVcsRUFBRSxDQUFDLFdBQVcsRUFBRSxFQUFFO29CQUM1QixPQUFPLDJCQUFZLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDO2dCQUN6RyxDQUFDO2dCQUNELGFBQWEsRUFBRSxDQUFDLFdBQVcsRUFBRSxFQUFFO29CQUM5QixPQUFPLDJCQUFZLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDO2dCQUMzRyxDQUFDO2FBQ0QsQ0FBQztRQUNILENBQUM7UUFFTyxnQkFBZ0IsQ0FBQyxLQUFpQixFQUFFLGVBQWlDLEVBQUUsT0FBZSxFQUFFLElBQVksRUFBRSxLQUFpQztZQUM5SSxJQUFJLEtBQUssRUFBRTtnQkFDVixJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDO2dCQUVwQyxJQUFJLEtBQUssQ0FBQyxZQUFZLEtBQUssb0NBQVksQ0FBQyxJQUFJLEVBQUU7b0JBQzdDLFdBQVcsR0FBRyxLQUFLLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUM7aUJBQ25EO3FCQUFNLElBQUksS0FBSyxDQUFDLFlBQVksS0FBSyxvQ0FBWSxDQUFDLE1BQU0sRUFBRTtvQkFDdEQsV0FBVyxHQUFHLEtBQUssQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQztpQkFDbkQ7cUJBQU0sSUFBSSxLQUFLLENBQUMsWUFBWSxLQUFLLG9DQUFZLENBQUMsYUFBYSxFQUFFO29CQUM3RCxXQUFXLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQztpQkFDaEM7cUJBQU0sSUFBSSxLQUFLLENBQUMsWUFBWSxLQUFLLG9DQUFZLENBQUMsT0FBTyxFQUFFO29CQUN2RCxXQUFXLEdBQUcsZUFBZSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQztpQkFDbEY7Z0JBQ0QsTUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDbEQsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUM3RSxNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUNoRixJQUFJLGNBQWMsR0FBRyxPQUFPLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQy9ELE1BQU0sNEJBQTRCLEdBQUcsSUFBQSw4QkFBaUIsRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO29CQUN4RyxJQUFJLDRCQUE0QixLQUFLLElBQUksSUFBSSw0QkFBNEIscUNBQTZCLEVBQUU7d0JBQ3ZHLGNBQWMsR0FBRyxlQUFlLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO3FCQUMvRDtvQkFDRCxNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFDckUsTUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7b0JBQ3JFLE9BQU8sV0FBVyxHQUFHLFdBQVcsQ0FBQztpQkFDakM7YUFDRDtZQUVELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVEOzs7Ozs7OztXQVFHO1FBQ0ssd0JBQXdCLENBQUMsS0FBaUIsRUFBRSxlQUFpQyxFQUFFLE9BQWUsRUFBRSxJQUFZLEVBQUUscUJBQTZCLEVBQUUsbUJBQTJCO1lBQy9LLElBQUksT0FBTyxDQUFDLHNCQUFzQixDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUM3RCxRQUFRO2dCQUNSLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2dCQUNoRSxNQUFNLEtBQUssR0FBRyxJQUFBLDRCQUFjLEVBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsSUFBSSxhQUFLLENBQUMscUJBQXFCLEVBQUUsU0FBUyxFQUFFLHFCQUFxQixFQUFFLFNBQVMsQ0FBQyxFQUFFLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO2dCQUN6SyxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsZUFBZSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDM0U7aUJBQU07Z0JBQ04sdUNBQXVDO2dCQUN2QyxJQUFJLGtCQUFrQixHQUFHLElBQUksR0FBRyxDQUFDLENBQUM7Z0JBQ2xDLE9BQU8sa0JBQWtCLElBQUksQ0FBQyxFQUFFO29CQUMvQixNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLENBQUM7b0JBQzdELE1BQU0sZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLFdBQVcsQ0FBQyxDQUFDO29CQUVyRSxJQUFJLGdCQUFnQixJQUFJLENBQUMsRUFBRTt3QkFDMUIsTUFBTTtxQkFDTjtvQkFFRCxrQkFBa0IsRUFBRSxDQUFDO2lCQUNyQjtnQkFFRCxJQUFJLGtCQUFrQixHQUFHLENBQUMsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLFlBQVksRUFBRSxFQUFFO29CQUMxRCxPQUFPLElBQUksQ0FBQztpQkFDWjtnQkFFRCxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsQ0FBQztnQkFDN0QsTUFBTSxLQUFLLEdBQUcsSUFBQSw0QkFBYyxFQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLElBQUksYUFBSyxDQUFDLGtCQUFrQixFQUFFLFNBQVMsRUFBRSxrQkFBa0IsRUFBRSxTQUFTLENBQUMsRUFBRSxJQUFJLENBQUMsNkJBQTZCLENBQUMsQ0FBQztnQkFDbkssT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLGVBQWUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQzNFO1FBQ0YsQ0FBQztRQUVPLGNBQWMsQ0FBQyxLQUFpQixFQUFFLGVBQWlDLEVBQUUsT0FBZSxFQUFFLElBQVksRUFBRSxZQUFvQixFQUFFLGdCQUF5QjtZQUMxSixJQUFJLGtCQUFrQixHQUFHLFlBQVksQ0FBQztZQUN0QyxPQUFPLGtCQUFrQixJQUFJLENBQUMsRUFBRTtnQkFDL0IsMkRBQTJEO2dCQUMzRCxJQUFJLFdBQVcsQ0FBQztnQkFDaEIsSUFBSSxrQkFBa0IsS0FBSyxZQUFZLElBQUksZ0JBQWdCLEtBQUssU0FBUyxFQUFFO29CQUMxRSxXQUFXLEdBQUcsZ0JBQWdCLENBQUM7aUJBQy9CO3FCQUFNO29CQUNOLFdBQVcsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLENBQUM7aUJBQ3ZEO2dCQUVELE1BQU0sZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUNyRSxJQUFJLGdCQUFnQixJQUFJLENBQUMsRUFBRTtvQkFDMUIsTUFBTTtpQkFDTjtnQkFDRCxrQkFBa0IsRUFBRSxDQUFDO2FBQ3JCO1lBRUQsSUFBSSxrQkFBa0IsR0FBRyxDQUFDLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxZQUFZLEVBQUUsRUFBRTtnQkFDMUQsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQzdELE1BQU0sS0FBSyxHQUFHLElBQUEsNEJBQWMsRUFBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssRUFBRSxJQUFJLGFBQUssQ0FBQyxrQkFBa0IsRUFBRSxTQUFTLEVBQUUsa0JBQWtCLEVBQUUsU0FBUyxDQUFDLEVBQUUsSUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUM7WUFDbkssT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLGVBQWUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzVFLENBQUM7UUFFTyxTQUFTLENBQUMsR0FBVztZQUM1QixPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2hDLENBQUM7UUFFTyxnQkFBZ0IsQ0FBQyxLQUFpQixFQUFFLFNBQW9CO1lBQy9ELElBQUksSUFBSSxDQUFDLFdBQVcsd0NBQWdDLEVBQUU7Z0JBQ3JELE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFDRCxxREFBcUQ7WUFDckQsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxFQUFFO2dCQUNyRSxPQUFPLEtBQUssQ0FBQzthQUNiO1lBQ0QsTUFBTSx3QkFBd0IsR0FBRyxLQUFLLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3RixNQUFNLHNCQUFzQixHQUFHLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRXpGLElBQUksd0JBQXdCLEtBQUssc0JBQXNCLEVBQUU7Z0JBQ3hELE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCxJQUFJLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyx3QkFBd0IsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLGtCQUFrQixLQUFLLElBQUksRUFBRTtnQkFDdEgsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVPLDJCQUEyQixDQUFDLEtBQWlCLEVBQUUsT0FBOEIsRUFBRSxDQUFZLEVBQUUsT0FBZSxFQUFFLFlBQXFCLEVBQUUsTUFBYztZQUMxSixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzFELE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVDLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDakUsTUFBTSxpQkFBaUIsR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDM0UsTUFBTSxZQUFZLEdBQUcsaUJBQWlCLEdBQUcsTUFBTSxDQUFDO2dCQUNoRCxNQUFNLFNBQVMsR0FBRyxXQUFXLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7Z0JBRWxGLElBQUksU0FBUyxLQUFLLGNBQWMsRUFBRTtvQkFDakMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7b0JBRW5GLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxhQUFhLElBQUksQ0FBQyxDQUFDLFNBQVMsSUFBSSxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxTQUFTLEtBQUssRUFBRSxFQUFFO3dCQUMxRiwyREFBMkQ7d0JBQzNELDJGQUEyRjt3QkFDM0YsSUFBSSxDQUFDLDJCQUEyQixHQUFHLElBQUksQ0FBQztxQkFDeEM7aUJBQ0Q7YUFFRDtRQUNGLENBQUM7UUFFTSxrQkFBa0IsQ0FBQyxLQUFpQixFQUFFLE1BQWdDO1lBQzVFLElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsWUFBYSxDQUFDLENBQUM7WUFFNUQsSUFBSSxJQUFJLENBQUMsb0JBQW9CLEVBQUU7Z0JBQzlCLE1BQU0sR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQzVEO1lBRUQsSUFBSSxJQUFJLENBQUMsMkJBQTJCLElBQUksTUFBTSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUMsYUFBYSxFQUFFO2dCQUN0RixNQUFNLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ3hEO1lBRUQsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO0tBQ0QsQ0FBQTtJQTdZWSw0Q0FBZ0I7K0JBQWhCLGdCQUFnQjtRQWMxQixXQUFBLDZEQUE2QixDQUFBO09BZG5CLGdCQUFnQixDQTZZNUIifQ==