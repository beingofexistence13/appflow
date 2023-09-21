/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/contrib/comment/browser/blockCommentCommand"], function (require, exports, strings, editOperation_1, position_1, range_1, selection_1, blockCommentCommand_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LineCommentCommand = exports.Type = void 0;
    var Type;
    (function (Type) {
        Type[Type["Toggle"] = 0] = "Toggle";
        Type[Type["ForceAdd"] = 1] = "ForceAdd";
        Type[Type["ForceRemove"] = 2] = "ForceRemove";
    })(Type || (exports.Type = Type = {}));
    class LineCommentCommand {
        constructor(languageConfigurationService, selection, tabSize, type, insertSpace, ignoreEmptyLines, ignoreFirstLine) {
            this.languageConfigurationService = languageConfigurationService;
            this._selection = selection;
            this._tabSize = tabSize;
            this._type = type;
            this._insertSpace = insertSpace;
            this._selectionId = null;
            this._deltaColumn = 0;
            this._moveEndPositionDown = false;
            this._ignoreEmptyLines = ignoreEmptyLines;
            this._ignoreFirstLine = ignoreFirstLine || false;
        }
        /**
         * Do an initial pass over the lines and gather info about the line comment string.
         * Returns null if any of the lines doesn't support a line comment string.
         */
        static _gatherPreflightCommentStrings(model, startLineNumber, endLineNumber, languageConfigurationService) {
            model.tokenization.tokenizeIfCheap(startLineNumber);
            const languageId = model.getLanguageIdAtPosition(startLineNumber, 1);
            const config = languageConfigurationService.getLanguageConfiguration(languageId).comments;
            const commentStr = (config ? config.lineCommentToken : null);
            if (!commentStr) {
                // Mode does not support line comments
                return null;
            }
            const lines = [];
            for (let i = 0, lineCount = endLineNumber - startLineNumber + 1; i < lineCount; i++) {
                lines[i] = {
                    ignore: false,
                    commentStr: commentStr,
                    commentStrOffset: 0,
                    commentStrLength: commentStr.length
                };
            }
            return lines;
        }
        /**
         * Analyze lines and decide which lines are relevant and what the toggle should do.
         * Also, build up several offsets and lengths useful in the generation of editor operations.
         */
        static _analyzeLines(type, insertSpace, model, lines, startLineNumber, ignoreEmptyLines, ignoreFirstLine, languageConfigurationService) {
            let onlyWhitespaceLines = true;
            let shouldRemoveComments;
            if (type === 0 /* Type.Toggle */) {
                shouldRemoveComments = true;
            }
            else if (type === 1 /* Type.ForceAdd */) {
                shouldRemoveComments = false;
            }
            else {
                shouldRemoveComments = true;
            }
            for (let i = 0, lineCount = lines.length; i < lineCount; i++) {
                const lineData = lines[i];
                const lineNumber = startLineNumber + i;
                if (lineNumber === startLineNumber && ignoreFirstLine) {
                    // first line ignored
                    lineData.ignore = true;
                    continue;
                }
                const lineContent = model.getLineContent(lineNumber);
                const lineContentStartOffset = strings.firstNonWhitespaceIndex(lineContent);
                if (lineContentStartOffset === -1) {
                    // Empty or whitespace only line
                    lineData.ignore = ignoreEmptyLines;
                    lineData.commentStrOffset = lineContent.length;
                    continue;
                }
                onlyWhitespaceLines = false;
                lineData.ignore = false;
                lineData.commentStrOffset = lineContentStartOffset;
                if (shouldRemoveComments && !blockCommentCommand_1.BlockCommentCommand._haystackHasNeedleAtOffset(lineContent, lineData.commentStr, lineContentStartOffset)) {
                    if (type === 0 /* Type.Toggle */) {
                        // Every line so far has been a line comment, but this one is not
                        shouldRemoveComments = false;
                    }
                    else if (type === 1 /* Type.ForceAdd */) {
                        // Will not happen
                    }
                    else {
                        lineData.ignore = true;
                    }
                }
                if (shouldRemoveComments && insertSpace) {
                    // Remove a following space if present
                    const commentStrEndOffset = lineContentStartOffset + lineData.commentStrLength;
                    if (commentStrEndOffset < lineContent.length && lineContent.charCodeAt(commentStrEndOffset) === 32 /* CharCode.Space */) {
                        lineData.commentStrLength += 1;
                    }
                }
            }
            if (type === 0 /* Type.Toggle */ && onlyWhitespaceLines) {
                // For only whitespace lines, we insert comments
                shouldRemoveComments = false;
                // Also, no longer ignore them
                for (let i = 0, lineCount = lines.length; i < lineCount; i++) {
                    lines[i].ignore = false;
                }
            }
            return {
                supported: true,
                shouldRemoveComments: shouldRemoveComments,
                lines: lines
            };
        }
        /**
         * Analyze all lines and decide exactly what to do => not supported | insert line comments | remove line comments
         */
        static _gatherPreflightData(type, insertSpace, model, startLineNumber, endLineNumber, ignoreEmptyLines, ignoreFirstLine, languageConfigurationService) {
            const lines = LineCommentCommand._gatherPreflightCommentStrings(model, startLineNumber, endLineNumber, languageConfigurationService);
            if (lines === null) {
                return {
                    supported: false
                };
            }
            return LineCommentCommand._analyzeLines(type, insertSpace, model, lines, startLineNumber, ignoreEmptyLines, ignoreFirstLine, languageConfigurationService);
        }
        /**
         * Given a successful analysis, execute either insert line comments, either remove line comments
         */
        _executeLineComments(model, builder, data, s) {
            let ops;
            if (data.shouldRemoveComments) {
                ops = LineCommentCommand._createRemoveLineCommentsOperations(data.lines, s.startLineNumber);
            }
            else {
                LineCommentCommand._normalizeInsertionPoint(model, data.lines, s.startLineNumber, this._tabSize);
                ops = this._createAddLineCommentsOperations(data.lines, s.startLineNumber);
            }
            const cursorPosition = new position_1.Position(s.positionLineNumber, s.positionColumn);
            for (let i = 0, len = ops.length; i < len; i++) {
                builder.addEditOperation(ops[i].range, ops[i].text);
                if (range_1.Range.isEmpty(ops[i].range) && range_1.Range.getStartPosition(ops[i].range).equals(cursorPosition)) {
                    const lineContent = model.getLineContent(cursorPosition.lineNumber);
                    if (lineContent.length + 1 === cursorPosition.column) {
                        this._deltaColumn = (ops[i].text || '').length;
                    }
                }
            }
            this._selectionId = builder.trackSelection(s);
        }
        _attemptRemoveBlockComment(model, s, startToken, endToken) {
            let startLineNumber = s.startLineNumber;
            let endLineNumber = s.endLineNumber;
            const startTokenAllowedBeforeColumn = endToken.length + Math.max(model.getLineFirstNonWhitespaceColumn(s.startLineNumber), s.startColumn);
            let startTokenIndex = model.getLineContent(startLineNumber).lastIndexOf(startToken, startTokenAllowedBeforeColumn - 1);
            let endTokenIndex = model.getLineContent(endLineNumber).indexOf(endToken, s.endColumn - 1 - startToken.length);
            if (startTokenIndex !== -1 && endTokenIndex === -1) {
                endTokenIndex = model.getLineContent(startLineNumber).indexOf(endToken, startTokenIndex + startToken.length);
                endLineNumber = startLineNumber;
            }
            if (startTokenIndex === -1 && endTokenIndex !== -1) {
                startTokenIndex = model.getLineContent(endLineNumber).lastIndexOf(startToken, endTokenIndex);
                startLineNumber = endLineNumber;
            }
            if (s.isEmpty() && (startTokenIndex === -1 || endTokenIndex === -1)) {
                startTokenIndex = model.getLineContent(startLineNumber).indexOf(startToken);
                if (startTokenIndex !== -1) {
                    endTokenIndex = model.getLineContent(startLineNumber).indexOf(endToken, startTokenIndex + startToken.length);
                }
            }
            // We have to adjust to possible inner white space.
            // For Space after startToken, add Space to startToken - range math will work out.
            if (startTokenIndex !== -1 && model.getLineContent(startLineNumber).charCodeAt(startTokenIndex + startToken.length) === 32 /* CharCode.Space */) {
                startToken += ' ';
            }
            // For Space before endToken, add Space before endToken and shift index one left.
            if (endTokenIndex !== -1 && model.getLineContent(endLineNumber).charCodeAt(endTokenIndex - 1) === 32 /* CharCode.Space */) {
                endToken = ' ' + endToken;
                endTokenIndex -= 1;
            }
            if (startTokenIndex !== -1 && endTokenIndex !== -1) {
                return blockCommentCommand_1.BlockCommentCommand._createRemoveBlockCommentOperations(new range_1.Range(startLineNumber, startTokenIndex + startToken.length + 1, endLineNumber, endTokenIndex + 1), startToken, endToken);
            }
            return null;
        }
        /**
         * Given an unsuccessful analysis, delegate to the block comment command
         */
        _executeBlockComment(model, builder, s) {
            model.tokenization.tokenizeIfCheap(s.startLineNumber);
            const languageId = model.getLanguageIdAtPosition(s.startLineNumber, 1);
            const config = this.languageConfigurationService.getLanguageConfiguration(languageId).comments;
            if (!config || !config.blockCommentStartToken || !config.blockCommentEndToken) {
                // Mode does not support block comments
                return;
            }
            const startToken = config.blockCommentStartToken;
            const endToken = config.blockCommentEndToken;
            let ops = this._attemptRemoveBlockComment(model, s, startToken, endToken);
            if (!ops) {
                if (s.isEmpty()) {
                    const lineContent = model.getLineContent(s.startLineNumber);
                    let firstNonWhitespaceIndex = strings.firstNonWhitespaceIndex(lineContent);
                    if (firstNonWhitespaceIndex === -1) {
                        // Line is empty or contains only whitespace
                        firstNonWhitespaceIndex = lineContent.length;
                    }
                    ops = blockCommentCommand_1.BlockCommentCommand._createAddBlockCommentOperations(new range_1.Range(s.startLineNumber, firstNonWhitespaceIndex + 1, s.startLineNumber, lineContent.length + 1), startToken, endToken, this._insertSpace);
                }
                else {
                    ops = blockCommentCommand_1.BlockCommentCommand._createAddBlockCommentOperations(new range_1.Range(s.startLineNumber, model.getLineFirstNonWhitespaceColumn(s.startLineNumber), s.endLineNumber, model.getLineMaxColumn(s.endLineNumber)), startToken, endToken, this._insertSpace);
                }
                if (ops.length === 1) {
                    // Leave cursor after token and Space
                    this._deltaColumn = startToken.length + 1;
                }
            }
            this._selectionId = builder.trackSelection(s);
            for (const op of ops) {
                builder.addEditOperation(op.range, op.text);
            }
        }
        getEditOperations(model, builder) {
            let s = this._selection;
            this._moveEndPositionDown = false;
            if (s.startLineNumber === s.endLineNumber && this._ignoreFirstLine) {
                builder.addEditOperation(new range_1.Range(s.startLineNumber, model.getLineMaxColumn(s.startLineNumber), s.startLineNumber + 1, 1), s.startLineNumber === model.getLineCount() ? '' : '\n');
                this._selectionId = builder.trackSelection(s);
                return;
            }
            if (s.startLineNumber < s.endLineNumber && s.endColumn === 1) {
                this._moveEndPositionDown = true;
                s = s.setEndPosition(s.endLineNumber - 1, model.getLineMaxColumn(s.endLineNumber - 1));
            }
            const data = LineCommentCommand._gatherPreflightData(this._type, this._insertSpace, model, s.startLineNumber, s.endLineNumber, this._ignoreEmptyLines, this._ignoreFirstLine, this.languageConfigurationService);
            if (data.supported) {
                return this._executeLineComments(model, builder, data, s);
            }
            return this._executeBlockComment(model, builder, s);
        }
        computeCursorState(model, helper) {
            let result = helper.getTrackedSelection(this._selectionId);
            if (this._moveEndPositionDown) {
                result = result.setEndPosition(result.endLineNumber + 1, 1);
            }
            return new selection_1.Selection(result.selectionStartLineNumber, result.selectionStartColumn + this._deltaColumn, result.positionLineNumber, result.positionColumn + this._deltaColumn);
        }
        /**
         * Generate edit operations in the remove line comment case
         */
        static _createRemoveLineCommentsOperations(lines, startLineNumber) {
            const res = [];
            for (let i = 0, len = lines.length; i < len; i++) {
                const lineData = lines[i];
                if (lineData.ignore) {
                    continue;
                }
                res.push(editOperation_1.EditOperation.delete(new range_1.Range(startLineNumber + i, lineData.commentStrOffset + 1, startLineNumber + i, lineData.commentStrOffset + lineData.commentStrLength + 1)));
            }
            return res;
        }
        /**
         * Generate edit operations in the add line comment case
         */
        _createAddLineCommentsOperations(lines, startLineNumber) {
            const res = [];
            const afterCommentStr = this._insertSpace ? ' ' : '';
            for (let i = 0, len = lines.length; i < len; i++) {
                const lineData = lines[i];
                if (lineData.ignore) {
                    continue;
                }
                res.push(editOperation_1.EditOperation.insert(new position_1.Position(startLineNumber + i, lineData.commentStrOffset + 1), lineData.commentStr + afterCommentStr));
            }
            return res;
        }
        static nextVisibleColumn(currentVisibleColumn, tabSize, isTab, columnSize) {
            if (isTab) {
                return currentVisibleColumn + (tabSize - (currentVisibleColumn % tabSize));
            }
            return currentVisibleColumn + columnSize;
        }
        /**
         * Adjust insertion points to have them vertically aligned in the add line comment case
         */
        static _normalizeInsertionPoint(model, lines, startLineNumber, tabSize) {
            let minVisibleColumn = 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */;
            let j;
            let lenJ;
            for (let i = 0, len = lines.length; i < len; i++) {
                if (lines[i].ignore) {
                    continue;
                }
                const lineContent = model.getLineContent(startLineNumber + i);
                let currentVisibleColumn = 0;
                for (let j = 0, lenJ = lines[i].commentStrOffset; currentVisibleColumn < minVisibleColumn && j < lenJ; j++) {
                    currentVisibleColumn = LineCommentCommand.nextVisibleColumn(currentVisibleColumn, tabSize, lineContent.charCodeAt(j) === 9 /* CharCode.Tab */, 1);
                }
                if (currentVisibleColumn < minVisibleColumn) {
                    minVisibleColumn = currentVisibleColumn;
                }
            }
            minVisibleColumn = Math.floor(minVisibleColumn / tabSize) * tabSize;
            for (let i = 0, len = lines.length; i < len; i++) {
                if (lines[i].ignore) {
                    continue;
                }
                const lineContent = model.getLineContent(startLineNumber + i);
                let currentVisibleColumn = 0;
                for (j = 0, lenJ = lines[i].commentStrOffset; currentVisibleColumn < minVisibleColumn && j < lenJ; j++) {
                    currentVisibleColumn = LineCommentCommand.nextVisibleColumn(currentVisibleColumn, tabSize, lineContent.charCodeAt(j) === 9 /* CharCode.Tab */, 1);
                }
                if (currentVisibleColumn > minVisibleColumn) {
                    lines[i].commentStrOffset = j - 1;
                }
                else {
                    lines[i].commentStrOffset = j;
                }
            }
        }
    }
    exports.LineCommentCommand = LineCommentCommand;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZUNvbW1lbnRDb21tYW5kLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvY29tbWVudC9icm93c2VyL2xpbmVDb21tZW50Q29tbWFuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF3Q2hHLElBQWtCLElBSWpCO0lBSkQsV0FBa0IsSUFBSTtRQUNyQixtQ0FBVSxDQUFBO1FBQ1YsdUNBQVksQ0FBQTtRQUNaLDZDQUFlLENBQUE7SUFDaEIsQ0FBQyxFQUppQixJQUFJLG9CQUFKLElBQUksUUFJckI7SUFFRCxNQUFhLGtCQUFrQjtRQVk5QixZQUNrQiw0QkFBMkQsRUFDNUUsU0FBb0IsRUFDcEIsT0FBZSxFQUNmLElBQVUsRUFDVixXQUFvQixFQUNwQixnQkFBeUIsRUFDekIsZUFBeUI7WUFOUixpQ0FBNEIsR0FBNUIsNEJBQTRCLENBQStCO1lBUTVFLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1lBQzVCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ2xCLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO1lBQ3RCLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxLQUFLLENBQUM7WUFDbEMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGdCQUFnQixDQUFDO1lBQzFDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxlQUFlLElBQUksS0FBSyxDQUFDO1FBQ2xELENBQUM7UUFFRDs7O1dBR0c7UUFDSyxNQUFNLENBQUMsOEJBQThCLENBQUMsS0FBaUIsRUFBRSxlQUF1QixFQUFFLGFBQXFCLEVBQUUsNEJBQTJEO1lBRTNLLEtB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