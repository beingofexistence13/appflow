/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/contrib/comment/browser/blockCommentCommand"], function (require, exports, strings, editOperation_1, position_1, range_1, selection_1, blockCommentCommand_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$W6 = exports.Type = void 0;
    var Type;
    (function (Type) {
        Type[Type["Toggle"] = 0] = "Toggle";
        Type[Type["ForceAdd"] = 1] = "ForceAdd";
        Type[Type["ForceRemove"] = 2] = "ForceRemove";
    })(Type || (exports.Type = Type = {}));
    class $W6 {
        constructor(l, selection, tabSize, type, insertSpace, ignoreEmptyLines, ignoreFirstLine) {
            this.l = l;
            this.a = selection;
            this.b = tabSize;
            this.c = type;
            this.d = insertSpace;
            this.f = null;
            this.g = 0;
            this.h = false;
            this.e = ignoreEmptyLines;
            this.k = ignoreFirstLine || false;
        }
        /**
         * Do an initial pass over the lines and gather info about the line comment string.
         * Returns null if any of the lines doesn't support a line comment string.
         */
        static m(model, startLineNumber, endLineNumber, languageConfigurationService) {
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
                const lineContentStartOffset = strings.$Be(lineContent);
                if (lineContentStartOffset === -1) {
                    // Empty or whitespace only line
                    lineData.ignore = ignoreEmptyLines;
                    lineData.commentStrOffset = lineContent.length;
                    continue;
                }
                onlyWhitespaceLines = false;
                lineData.ignore = false;
                lineData.commentStrOffset = lineContentStartOffset;
                if (shouldRemoveComments && !blockCommentCommand_1.$V6._haystackHasNeedleAtOffset(lineContent, lineData.commentStr, lineContentStartOffset)) {
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
            const lines = $W6.m(model, startLineNumber, endLineNumber, languageConfigurationService);
            if (lines === null) {
                return {
                    supported: false
                };
            }
            return $W6._analyzeLines(type, insertSpace, model, lines, startLineNumber, ignoreEmptyLines, ignoreFirstLine, languageConfigurationService);
        }
        /**
         * Given a successful analysis, execute either insert line comments, either remove line comments
         */
        n(model, builder, data, s) {
            let ops;
            if (data.shouldRemoveComments) {
                ops = $W6._createRemoveLineCommentsOperations(data.lines, s.startLineNumber);
            }
            else {
                $W6._normalizeInsertionPoint(model, data.lines, s.startLineNumber, this.b);
                ops = this.q(data.lines, s.startLineNumber);
            }
            const cursorPosition = new position_1.$js(s.positionLineNumber, s.positionColumn);
            for (let i = 0, len = ops.length; i < len; i++) {
                builder.addEditOperation(ops[i].range, ops[i].text);
                if (range_1.$ks.isEmpty(ops[i].range) && range_1.$ks.getStartPosition(ops[i].range).equals(cursorPosition)) {
                    const lineContent = model.getLineContent(cursorPosition.lineNumber);
                    if (lineContent.length + 1 === cursorPosition.column) {
                        this.g = (ops[i].text || '').length;
                    }
                }
            }
            this.f = builder.trackSelection(s);
        }
        o(model, s, startToken, endToken) {
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
                return blockCommentCommand_1.$V6._createRemoveBlockCommentOperations(new range_1.$ks(startLineNumber, startTokenIndex + startToken.length + 1, endLineNumber, endTokenIndex + 1), startToken, endToken);
            }
            return null;
        }
        /**
         * Given an unsuccessful analysis, delegate to the block comment command
         */
        p(model, builder, s) {
            model.tokenization.tokenizeIfCheap(s.startLineNumber);
            const languageId = model.getLanguageIdAtPosition(s.startLineNumber, 1);
            const config = this.l.getLanguageConfiguration(languageId).comments;
            if (!config || !config.blockCommentStartToken || !config.blockCommentEndToken) {
                // Mode does not support block comments
                return;
            }
            const startToken = config.blockCommentStartToken;
            const endToken = config.blockCommentEndToken;
            let ops = this.o(model, s, startToken, endToken);
            if (!ops) {
                if (s.isEmpty()) {
                    const lineContent = model.getLineContent(s.startLineNumber);
                    let firstNonWhitespaceIndex = strings.$Be(lineContent);
                    if (firstNonWhitespaceIndex === -1) {
                        // Line is empty or contains only whitespace
                        firstNonWhitespaceIndex = lineContent.length;
                    }
                    ops = blockCommentCommand_1.$V6._createAddBlockCommentOperations(new range_1.$ks(s.startLineNumber, firstNonWhitespaceIndex + 1, s.startLineNumber, lineContent.length + 1), startToken, endToken, this.d);
                }
                else {
                    ops = blockCommentCommand_1.$V6._createAddBlockCommentOperations(new range_1.$ks(s.startLineNumber, model.getLineFirstNonWhitespaceColumn(s.startLineNumber), s.endLineNumber, model.getLineMaxColumn(s.endLineNumber)), startToken, endToken, this.d);
                }
                if (ops.length === 1) {
                    // Leave cursor after token and Space
                    this.g = startToken.length + 1;
                }
            }
            this.f = builder.trackSelection(s);
            for (const op of ops) {
                builder.addEditOperation(op.range, op.text);
            }
        }
        getEditOperations(model, builder) {
            let s = this.a;
            this.h = false;
            if (s.startLineNumber === s.endLineNumber && this.k) {
                builder.addEditOperation(new range_1.$ks(s.startLineNumber, model.getLineMaxColumn(s.startLineNumber), s.startLineNumber + 1, 1), s.startLineNumber === model.getLineCount() ? '' : '\n');
                this.f = builder.trackSelection(s);
                return;
            }
            if (s.startLineNumber < s.endLineNumber && s.endColumn === 1) {
                this.h = true;
                s = s.setEndPosition(s.endLineNumber - 1, model.getLineMaxColumn(s.endLineNumber - 1));
            }
            const data = $W6._gatherPreflightData(this.c, this.d, model, s.startLineNumber, s.endLineNumber, this.e, this.k, this.l);
            if (data.supported) {
                return this.n(model, builder, data, s);
            }
            return this.p(model, builder, s);
        }
        computeCursorState(model, helper) {
            let result = helper.getTrackedSelection(this.f);
            if (this.h) {
                result = result.setEndPosition(result.endLineNumber + 1, 1);
            }
            return new selection_1.$ms(result.selectionStartLineNumber, result.selectionStartColumn + this.g, result.positionLineNumber, result.positionColumn + this.g);
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
                res.push(editOperation_1.$ls.delete(new range_1.$ks(startLineNumber + i, lineData.commentStrOffset + 1, startLineNumber + i, lineData.commentStrOffset + lineData.commentStrLength + 1)));
            }
            return res;
        }
        /**
         * Generate edit operations in the add line comment case
         */
        q(lines, startLineNumber) {
            const res = [];
            const afterCommentStr = this.d ? ' ' : '';
            for (let i = 0, len = lines.length; i < len; i++) {
                const lineData = lines[i];
                if (lineData.ignore) {
                    continue;
                }
                res.push(editOperation_1.$ls.insert(new position_1.$js(startLineNumber + i, lineData.commentStrOffset + 1), lineData.commentStr + afterCommentStr));
            }
            return res;
        }
        static r(currentVisibleColumn, tabSize, isTab, columnSize) {
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
                    currentVisibleColumn = $W6.r(currentVisibleColumn, tabSize, lineContent.charCodeAt(j) === 9 /* CharCode.Tab */, 1);
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
                    currentVisibleColumn = $W6.r(currentVisibleColumn, tabSize, lineContent.charCodeAt(j) === 9 /* CharCode.Tab */, 1);
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
    exports.$W6 = $W6;
});
//# sourceMappingURL=lineCommentCommand.js.map