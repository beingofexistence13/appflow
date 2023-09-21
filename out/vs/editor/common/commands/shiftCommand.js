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
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/core/cursorColumns", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/languages/enterAction", "vs/editor/common/languages/languageConfigurationRegistry"], function (require, exports, strings, cursorColumns_1, range_1, selection_1, enterAction_1, languageConfigurationRegistry_1) {
    "use strict";
    var ShiftCommand_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ShiftCommand = void 0;
    const repeatCache = Object.create(null);
    function cachedStringRepeat(str, count) {
        if (count <= 0) {
            return '';
        }
        if (!repeatCache[str]) {
            repeatCache[str] = ['', str];
        }
        const cache = repeatCache[str];
        for (let i = cache.length; i <= count; i++) {
            cache[i] = cache[i - 1] + str;
        }
        return cache[count];
    }
    let ShiftCommand = ShiftCommand_1 = class ShiftCommand {
        static unshiftIndent(line, column, tabSize, indentSize, insertSpaces) {
            // Determine the visible column where the content starts
            const contentStartVisibleColumn = cursorColumns_1.CursorColumns.visibleColumnFromColumn(line, column, tabSize);
            if (insertSpaces) {
                const indent = cachedStringRepeat(' ', indentSize);
                const desiredTabStop = cursorColumns_1.CursorColumns.prevIndentTabStop(contentStartVisibleColumn, indentSize);
                const indentCount = desiredTabStop / indentSize; // will be an integer
                return cachedStringRepeat(indent, indentCount);
            }
            else {
                const indent = '\t';
                const desiredTabStop = cursorColumns_1.CursorColumns.prevRenderTabStop(contentStartVisibleColumn, tabSize);
                const indentCount = desiredTabStop / tabSize; // will be an integer
                return cachedStringRepeat(indent, indentCount);
            }
        }
        static shiftIndent(line, column, tabSize, indentSize, insertSpaces) {
            // Determine the visible column where the content starts
            const contentStartVisibleColumn = cursorColumns_1.CursorColumns.visibleColumnFromColumn(line, column, tabSize);
            if (insertSpaces) {
                const indent = cachedStringRepeat(' ', indentSize);
                const desiredTabStop = cursorColumns_1.CursorColumns.nextIndentTabStop(contentStartVisibleColumn, indentSize);
                const indentCount = desiredTabStop / indentSize; // will be an integer
                return cachedStringRepeat(indent, indentCount);
            }
            else {
                const indent = '\t';
                const desiredTabStop = cursorColumns_1.CursorColumns.nextRenderTabStop(contentStartVisibleColumn, tabSize);
                const indentCount = desiredTabStop / tabSize; // will be an integer
                return cachedStringRepeat(indent, indentCount);
            }
        }
        constructor(range, opts, _languageConfigurationService) {
            this._languageConfigurationService = _languageConfigurationService;
            this._opts = opts;
            this._selection = range;
            this._selectionId = null;
            this._useLastEditRangeForCursorEndPosition = false;
            this._selectionStartColumnStaysPut = false;
        }
        _addEditOperation(builder, range, text) {
            if (this._useLastEditRangeForCursorEndPosition) {
                builder.addTrackedEditOperation(range, text);
            }
            else {
                builder.addEditOperation(range, text);
            }
        }
        getEditOperations(model, builder) {
            const startLine = this._selection.startLineNumber;
            let endLine = this._selection.endLineNumber;
            if (this._selection.endColumn === 1 && startLine !== endLine) {
                endLine = endLine - 1;
            }
            const { tabSize, indentSize, insertSpaces } = this._opts;
            const shouldIndentEmptyLines = (startLine === endLine);
            if (this._opts.useTabStops) {
                // if indenting or outdenting on a whitespace only line
                if (this._selection.isEmpty()) {
                    if (/^\s*$/.test(model.getLineContent(startLine))) {
                        this._useLastEditRangeForCursorEndPosition = true;
                    }
                }
                // keep track of previous line's "miss-alignment"
                let previousLineExtraSpaces = 0, extraSpaces = 0;
                for (let lineNumber = startLine; lineNumber <= endLine; lineNumber++, previousLineExtraSpaces = extraSpaces) {
                    extraSpaces = 0;
                    const lineText = model.getLineContent(lineNumber);
                    let indentationEndIndex = strings.firstNonWhitespaceIndex(lineText);
                    if (this._opts.isUnshift && (lineText.length === 0 || indentationEndIndex === 0)) {
                        // empty line or line with no leading whitespace => nothing to do
                        continue;
                    }
                    if (!shouldIndentEmptyLines && !this._opts.isUnshift && lineText.length === 0) {
                        // do not indent empty lines => nothing to do
                        continue;
                    }
                    if (indentationEndIndex === -1) {
                        // the entire line is whitespace
                        indentationEndIndex = lineText.length;
                    }
                    if (lineNumber > 1) {
                        const contentStartVisibleColumn = cursorColumns_1.CursorColumns.visibleColumnFromColumn(lineText, indentationEndIndex + 1, tabSize);
                        if (contentStartVisibleColumn % indentSize !== 0) {
                            // The current line is "miss-aligned", so let's see if this is expected...
                            // This can only happen when it has trailing commas in the indent
                            if (model.tokenization.isCheapToTokenize(lineNumber - 1)) {
                                const enterAction = (0, enterAction_1.getEnterAction)(this._opts.autoIndent, model, new range_1.Range(lineNumber - 1, model.getLineMaxColumn(lineNumber - 1), lineNumber - 1, model.getLineMaxColumn(lineNumber - 1)), this._languageConfigurationService);
                                if (enterAction) {
                                    extraSpaces = previousLineExtraSpaces;
                                    if (enterAction.appendText) {
                                        for (let j = 0, lenJ = enterAction.appendText.length; j < lenJ && extraSpaces < indentSize; j++) {
                                            if (enterAction.appendText.charCodeAt(j) === 32 /* CharCode.Space */) {
                                                extraSpaces++;
                                            }
                                            else {
                                                break;
                                            }
                                        }
                                    }
                                    if (enterAction.removeText) {
                                        extraSpaces = Math.max(0, extraSpaces - enterAction.removeText);
                                    }
                                    // Act as if `prefixSpaces` is not part of the indentation
                                    for (let j = 0; j < extraSpaces; j++) {
                                        if (indentationEndIndex === 0 || lineText.charCodeAt(indentationEndIndex - 1) !== 32 /* CharCode.Space */) {
                                            break;
                                        }
                                        indentationEndIndex--;
                                    }
                                }
                            }
                        }
                    }
                    if (this._opts.isUnshift && indentationEndIndex === 0) {
                        // line with no leading whitespace => nothing to do
                        continue;
                    }
                    let desiredIndent;
                    if (this._opts.isUnshift) {
                        desiredIndent = ShiftCommand_1.unshiftIndent(lineText, indentationEndIndex + 1, tabSize, indentSize, insertSpaces);
                    }
                    else {
                        desiredIndent = ShiftCommand_1.shiftIndent(lineText, indentationEndIndex + 1, tabSize, indentSize, insertSpaces);
                    }
                    this._addEditOperation(builder, new range_1.Range(lineNumber, 1, lineNumber, indentationEndIndex + 1), desiredIndent);
                    if (lineNumber === startLine && !this._selection.isEmpty()) {
                        // Force the startColumn to stay put because we're inserting after it
                        this._selectionStartColumnStaysPut = (this._selection.startColumn <= indentationEndIndex + 1);
                    }
                }
            }
            else {
                // if indenting or outdenting on a whitespace only line
                if (!this._opts.isUnshift && this._selection.isEmpty() && model.getLineLength(startLine) === 0) {
                    this._useLastEditRangeForCursorEndPosition = true;
                }
                const oneIndent = (insertSpaces ? cachedStringRepeat(' ', indentSize) : '\t');
                for (let lineNumber = startLine; lineNumber <= endLine; lineNumber++) {
                    const lineText = model.getLineContent(lineNumber);
                    let indentationEndIndex = strings.firstNonWhitespaceIndex(lineText);
                    if (this._opts.isUnshift && (lineText.length === 0 || indentationEndIndex === 0)) {
                        // empty line or line with no leading whitespace => nothing to do
                        continue;
                    }
                    if (!shouldIndentEmptyLines && !this._opts.isUnshift && lineText.length === 0) {
                        // do not indent empty lines => nothing to do
                        continue;
                    }
                    if (indentationEndIndex === -1) {
                        // the entire line is whitespace
                        indentationEndIndex = lineText.length;
                    }
                    if (this._opts.isUnshift && indentationEndIndex === 0) {
                        // line with no leading whitespace => nothing to do
                        continue;
                    }
                    if (this._opts.isUnshift) {
                        indentationEndIndex = Math.min(indentationEndIndex, indentSize);
                        for (let i = 0; i < indentationEndIndex; i++) {
                            const chr = lineText.charCodeAt(i);
                            if (chr === 9 /* CharCode.Tab */) {
                                indentationEndIndex = i + 1;
                                break;
                            }
                        }
                        this._addEditOperation(builder, new range_1.Range(lineNumber, 1, lineNumber, indentationEndIndex + 1), '');
                    }
                    else {
                        this._addEditOperation(builder, new range_1.Range(lineNumber, 1, lineNumber, 1), oneIndent);
                        if (lineNumber === startLine && !this._selection.isEmpty()) {
                            // Force the startColumn to stay put because we're inserting after it
                            this._selectionStartColumnStaysPut = (this._selection.startColumn === 1);
                        }
                    }
                }
            }
            this._selectionId = builder.trackSelection(this._selection);
        }
        computeCursorState(model, helper) {
            if (this._useLastEditRangeForCursorEndPosition) {
                const lastOp = helper.getInverseEditOperations()[0];
                return new selection_1.Selection(lastOp.range.endLineNumber, lastOp.range.endColumn, lastOp.range.endLineNumber, lastOp.range.endColumn);
            }
            const result = helper.getTrackedSelection(this._selectionId);
            if (this._selectionStartColumnStaysPut) {
                // The selection start should not move
                const initialStartColumn = this._selection.startColumn;
                const resultStartColumn = result.startColumn;
                if (resultStartColumn <= initialStartColumn) {
                    return result;
                }
                if (result.getDirection() === 0 /* SelectionDirection.LTR */) {
                    return new selection_1.Selection(result.startLineNumber, initialStartColumn, result.endLineNumber, result.endColumn);
                }
                return new selection_1.Selection(result.endLineNumber, result.endColumn, result.startLineNumber, initialStartColumn);
            }
            return result;
        }
    };
    exports.ShiftCommand = ShiftCommand;
    exports.ShiftCommand = ShiftCommand = ShiftCommand_1 = __decorate([
        __param(2, languageConfigurationRegistry_1.ILanguageConfigurationService)
    ], ShiftCommand);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hpZnRDb21tYW5kLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9jb21tYW5kcy9zaGlmdENvbW1hbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQXNCaEcsTUFBTSxXQUFXLEdBQWdDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckUsU0FBUyxrQkFBa0IsQ0FBQyxHQUFXLEVBQUUsS0FBYTtRQUNyRCxJQUFJLEtBQUssSUFBSSxDQUFDLEVBQUU7WUFDZixPQUFPLEVBQUUsQ0FBQztTQUNWO1FBQ0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUN0QixXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDN0I7UUFDRCxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDL0IsS0FBSyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDM0MsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO1NBQzlCO1FBQ0QsT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDckIsQ0FBQztJQUVNLElBQU0sWUFBWSxvQkFBbEIsTUFBTSxZQUFZO1FBRWpCLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBWSxFQUFFLE1BQWMsRUFBRSxPQUFlLEVBQUUsVUFBa0IsRUFBRSxZQUFxQjtZQUNuSCx3REFBd0Q7WUFDeEQsTUFBTSx5QkFBeUIsR0FBRyw2QkFBYSxDQUFDLHVCQUF1QixDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFL0YsSUFBSSxZQUFZLEVBQUU7Z0JBQ2pCLE1BQU0sTUFBTSxHQUFHLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDbkQsTUFBTSxjQUFjLEdBQUcsNkJBQWEsQ0FBQyxpQkFBaUIsQ0FBQyx5QkFBeUIsRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDOUYsTUFBTSxXQUFXLEdBQUcsY0FBYyxHQUFHLFVBQVUsQ0FBQyxDQUFDLHFCQUFxQjtnQkFDdEUsT0FBTyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7YUFDL0M7aUJBQU07Z0JBQ04sTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDO2dCQUNwQixNQUFNLGNBQWMsR0FBRyw2QkFBYSxDQUFDLGlCQUFpQixDQUFDLHlCQUF5QixFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUMzRixNQUFNLFdBQVcsR0FBRyxjQUFjLEdBQUcsT0FBTyxDQUFDLENBQUMscUJBQXFCO2dCQUNuRSxPQUFPLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQzthQUMvQztRQUNGLENBQUM7UUFFTSxNQUFNLENBQUMsV0FBVyxDQUFDLElBQVksRUFBRSxNQUFjLEVBQUUsT0FBZSxFQUFFLFVBQWtCLEVBQUUsWUFBcUI7WUFDakgsd0RBQXdEO1lBQ3hELE1BQU0seUJBQXlCLEdBQUcsNkJBQWEsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRS9GLElBQUksWUFBWSxFQUFFO2dCQUNqQixNQUFNLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBQ25ELE1BQU0sY0FBYyxHQUFHLDZCQUFhLENBQUMsaUJBQWlCLENBQUMseUJBQXlCLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBQzlGLE1BQU0sV0FBVyxHQUFHLGNBQWMsR0FBRyxVQUFVLENBQUMsQ0FBQyxxQkFBcUI7Z0JBQ3RFLE9BQU8sa0JBQWtCLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO2FBQy9DO2lCQUFNO2dCQUNOLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQztnQkFDcEIsTUFBTSxjQUFjLEdBQUcsNkJBQWEsQ0FBQyxpQkFBaUIsQ0FBQyx5QkFBeUIsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDM0YsTUFBTSxXQUFXLEdBQUcsY0FBYyxHQUFHLE9BQU8sQ0FBQyxDQUFDLHFCQUFxQjtnQkFDbkUsT0FBTyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7YUFDL0M7UUFDRixDQUFDO1FBUUQsWUFDQyxLQUFnQixFQUNoQixJQUF1QixFQUN5Qiw2QkFBNEQ7WUFBNUQsa0NBQTZCLEdBQTdCLDZCQUE2QixDQUErQjtZQUU1RyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUNsQixJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztZQUN4QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztZQUN6QixJQUFJLENBQUMscUNBQXFDLEdBQUcsS0FBSyxDQUFDO1lBQ25ELElBQUksQ0FBQyw2QkFBNkIsR0FBRyxLQUFLLENBQUM7UUFDNUMsQ0FBQztRQUVPLGlCQUFpQixDQUFDLE9BQThCLEVBQUUsS0FBWSxFQUFFLElBQVk7WUFDbkYsSUFBSSxJQUFJLENBQUMscUNBQXFDLEVBQUU7Z0JBQy9DLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDN0M7aUJBQU07Z0JBQ04sT0FBTyxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQzthQUN0QztRQUNGLENBQUM7UUFFTSxpQkFBaUIsQ0FBQyxLQUFpQixFQUFFLE9BQThCO1lBQ3pFLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDO1lBRWxELElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDO1lBQzVDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEtBQUssQ0FBQyxJQUFJLFNBQVMsS0FBSyxPQUFPLEVBQUU7Z0JBQzdELE9BQU8sR0FBRyxPQUFPLEdBQUcsQ0FBQyxDQUFDO2FBQ3RCO1lBRUQsTUFBTSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUN6RCxNQUFNLHNCQUFzQixHQUFHLENBQUMsU0FBUyxLQUFLLE9BQU8sQ0FBQyxDQUFDO1lBRXZELElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUU7Z0JBQzNCLHVEQUF1RDtnQkFDdkQsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFO29CQUM5QixJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFO3dCQUNsRCxJQUFJLENBQUMscUNBQXFDLEdBQUcsSUFBSSxDQUFDO3FCQUNsRDtpQkFDRDtnQkFFRCxpREFBaUQ7Z0JBQ2pELElBQUksdUJBQXVCLEdBQUcsQ0FBQyxFQUFFLFdBQVcsR0FBRyxDQUFDLENBQUM7Z0JBQ2pELEtBQUssSUFBSSxVQUFVLEdBQUcsU0FBUyxFQUFFLFVBQVUsSUFBSSxPQUFPLEVBQUUsVUFBVSxFQUFFLEVBQUUsdUJBQXVCLEdBQUcsV0FBVyxFQUFFO29CQUM1RyxXQUFXLEdBQUcsQ0FBQyxDQUFDO29CQUNoQixNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUNsRCxJQUFJLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFFcEUsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLG1CQUFtQixLQUFLLENBQUMsQ0FBQyxFQUFFO3dCQUNqRixpRUFBaUU7d0JBQ2pFLFNBQVM7cUJBQ1Q7b0JBRUQsSUFBSSxDQUFDLHNCQUFzQixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7d0JBQzlFLDZDQUE2Qzt3QkFDN0MsU0FBUztxQkFDVDtvQkFFRCxJQUFJLG1CQUFtQixLQUFLLENBQUMsQ0FBQyxFQUFFO3dCQUMvQixnQ0FBZ0M7d0JBQ2hDLG1CQUFtQixHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7cUJBQ3RDO29CQUVELElBQUksVUFBVSxHQUFHLENBQUMsRUFBRTt3QkFDbkIsTUFBTSx5QkFBeUIsR0FBRyw2QkFBYSxDQUFDLHVCQUF1QixDQUFDLFFBQVEsRUFBRSxtQkFBbUIsR0FBRyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7d0JBQ3BILElBQUkseUJBQXlCLEdBQUcsVUFBVSxLQUFLLENBQUMsRUFBRTs0QkFDakQsMEVBQTBFOzRCQUMxRSxpRUFBaUU7NEJBQ2pFLElBQUksS0FBSyxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLEVBQUU7Z0NBQ3pELE1BQU0sV0FBVyxHQUFHLElBQUEsNEJBQWMsRUFBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsSUFBSSxhQUFLLENBQUMsVUFBVSxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxFQUFFLFVBQVUsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO2dDQUNoTyxJQUFJLFdBQVcsRUFBRTtvQ0FDaEIsV0FBVyxHQUFHLHVCQUF1QixDQUFDO29DQUN0QyxJQUFJLFdBQVcsQ0FBQyxVQUFVLEVBQUU7d0NBQzNCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxXQUFXLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsSUFBSSxJQUFJLFdBQVcsR0FBRyxVQUFVLEVBQUUsQ0FBQyxFQUFFLEVBQUU7NENBQ2hHLElBQUksV0FBVyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLDRCQUFtQixFQUFFO2dEQUM1RCxXQUFXLEVBQUUsQ0FBQzs2Q0FDZDtpREFBTTtnREFDTixNQUFNOzZDQUNOO3lDQUNEO3FDQUNEO29DQUNELElBQUksV0FBVyxDQUFDLFVBQVUsRUFBRTt3Q0FDM0IsV0FBVyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsR0FBRyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7cUNBQ2hFO29DQUVELDBEQUEwRDtvQ0FDMUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsRUFBRSxDQUFDLEVBQUUsRUFBRTt3Q0FDckMsSUFBSSxtQkFBbUIsS0FBSyxDQUFDLElBQUksUUFBUSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsR0FBRyxDQUFDLENBQUMsNEJBQW1CLEVBQUU7NENBQ2pHLE1BQU07eUNBQ047d0NBQ0QsbUJBQW1CLEVBQUUsQ0FBQztxQ0FDdEI7aUNBQ0Q7NkJBQ0Q7eUJBQ0Q7cUJBQ0Q7b0JBR0QsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsSUFBSSxtQkFBbUIsS0FBSyxDQUFDLEVBQUU7d0JBQ3RELG1EQUFtRDt3QkFDbkQsU0FBUztxQkFDVDtvQkFFRCxJQUFJLGFBQXFCLENBQUM7b0JBQzFCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUU7d0JBQ3pCLGFBQWEsR0FBRyxjQUFZLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxtQkFBbUIsR0FBRyxDQUFDLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztxQkFDakg7eUJBQU07d0JBQ04sYUFBYSxHQUFHLGNBQVksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLG1CQUFtQixHQUFHLENBQUMsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDO3FCQUMvRztvQkFFRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLElBQUksYUFBSyxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLG1CQUFtQixHQUFHLENBQUMsQ0FBQyxFQUFFLGFBQWEsQ0FBQyxDQUFDO29CQUM5RyxJQUFJLFVBQVUsS0FBSyxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFO3dCQUMzRCxxRUFBcUU7d0JBQ3JFLElBQUksQ0FBQyw2QkFBNkIsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxJQUFJLG1CQUFtQixHQUFHLENBQUMsQ0FBQyxDQUFDO3FCQUM5RjtpQkFDRDthQUNEO2lCQUFNO2dCQUVOLHVEQUF1RDtnQkFDdkQsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLElBQUksS0FBSyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQy9GLElBQUksQ0FBQyxxQ0FBcUMsR0FBRyxJQUFJLENBQUM7aUJBQ2xEO2dCQUVELE1BQU0sU0FBUyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUU5RSxLQUFLLElBQUksVUFBVSxHQUFHLFNBQVMsRUFBRSxVQUFVLElBQUksT0FBTyxFQUFFLFVBQVUsRUFBRSxFQUFFO29CQUNyRSxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUNsRCxJQUFJLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFFcEUsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLG1CQUFtQixLQUFLLENBQUMsQ0FBQyxFQUFFO3dCQUNqRixpRUFBaUU7d0JBQ2pFLFNBQVM7cUJBQ1Q7b0JBRUQsSUFBSSxDQUFDLHNCQUFzQixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7d0JBQzlFLDZDQUE2Qzt3QkFDN0MsU0FBUztxQkFDVDtvQkFFRCxJQUFJLG1CQUFtQixLQUFLLENBQUMsQ0FBQyxFQUFFO3dCQUMvQixnQ0FBZ0M7d0JBQ2hDLG1CQUFtQixHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7cUJBQ3RDO29CQUVELElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLElBQUksbUJBQW1CLEtBQUssQ0FBQyxFQUFFO3dCQUN0RCxtREFBbUQ7d0JBQ25ELFNBQVM7cUJBQ1Q7b0JBRUQsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRTt3QkFFekIsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxVQUFVLENBQUMsQ0FBQzt3QkFDaEUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLG1CQUFtQixFQUFFLENBQUMsRUFBRSxFQUFFOzRCQUM3QyxNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUNuQyxJQUFJLEdBQUcseUJBQWlCLEVBQUU7Z0NBQ3pCLG1CQUFtQixHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Z0NBQzVCLE1BQU07NkJBQ047eUJBQ0Q7d0JBRUQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxJQUFJLGFBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxtQkFBbUIsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztxQkFDbkc7eUJBQU07d0JBQ04sSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxJQUFJLGFBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQzt3QkFDcEYsSUFBSSxVQUFVLEtBQUssU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsRUFBRTs0QkFDM0QscUVBQXFFOzRCQUNyRSxJQUFJLENBQUMsNkJBQTZCLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsS0FBSyxDQUFDLENBQUMsQ0FBQzt5QkFDekU7cUJBQ0Q7aUJBQ0Q7YUFDRDtZQUVELElBQUksQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUVNLGtCQUFrQixDQUFDLEtBQWlCLEVBQUUsTUFBZ0M7WUFDNUUsSUFBSSxJQUFJLENBQUMscUNBQXFDLEVBQUU7Z0JBQy9DLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNwRCxPQUFPLElBQUkscUJBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQzdIO1lBQ0QsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxZQUFhLENBQUMsQ0FBQztZQUU5RCxJQUFJLElBQUksQ0FBQyw2QkFBNkIsRUFBRTtnQkFDdkMsc0NBQXNDO2dCQUN0QyxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDO2dCQUN2RCxNQUFNLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7Z0JBQzdDLElBQUksaUJBQWlCLElBQUksa0JBQWtCLEVBQUU7b0JBQzVDLE9BQU8sTUFBTSxDQUFDO2lCQUNkO2dCQUVELElBQUksTUFBTSxDQUFDLFlBQVksRUFBRSxtQ0FBMkIsRUFBRTtvQkFDckQsT0FBTyxJQUFJLHFCQUFTLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztpQkFDekc7Z0JBQ0QsT0FBTyxJQUFJLHFCQUFTLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxlQUFlLEVBQUUsa0JBQWtCLENBQUMsQ0FBQzthQUN6RztZQUVELE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztLQUNELENBQUE7SUE3T1ksb0NBQVk7MkJBQVosWUFBWTtRQTZDdEIsV0FBQSw2REFBNkIsQ0FBQTtPQTdDbkIsWUFBWSxDQTZPeEIifQ==