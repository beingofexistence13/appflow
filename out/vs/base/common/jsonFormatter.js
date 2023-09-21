/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "./json"], function (require, exports, json_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isEOL = exports.getEOL = exports.toFormattedString = exports.format = void 0;
    function format(documentText, range, options) {
        let initialIndentLevel;
        let formatText;
        let formatTextStart;
        let rangeStart;
        let rangeEnd;
        if (range) {
            rangeStart = range.offset;
            rangeEnd = rangeStart + range.length;
            formatTextStart = rangeStart;
            while (formatTextStart > 0 && !isEOL(documentText, formatTextStart - 1)) {
                formatTextStart--;
            }
            let endOffset = rangeEnd;
            while (endOffset < documentText.length && !isEOL(documentText, endOffset)) {
                endOffset++;
            }
            formatText = documentText.substring(formatTextStart, endOffset);
            initialIndentLevel = computeIndentLevel(formatText, options);
        }
        else {
            formatText = documentText;
            initialIndentLevel = 0;
            formatTextStart = 0;
            rangeStart = 0;
            rangeEnd = documentText.length;
        }
        const eol = getEOL(options, documentText);
        let lineBreak = false;
        let indentLevel = 0;
        let indentValue;
        if (options.insertSpaces) {
            indentValue = repeat(' ', options.tabSize || 4);
        }
        else {
            indentValue = '\t';
        }
        const scanner = (0, json_1.createScanner)(formatText, false);
        let hasError = false;
        function newLineAndIndent() {
            return eol + repeat(indentValue, initialIndentLevel + indentLevel);
        }
        function scanNext() {
            let token = scanner.scan();
            lineBreak = false;
            while (token === 15 /* SyntaxKind.Trivia */ || token === 14 /* SyntaxKind.LineBreakTrivia */) {
                lineBreak = lineBreak || (token === 14 /* SyntaxKind.LineBreakTrivia */);
                token = scanner.scan();
            }
            hasError = token === 16 /* SyntaxKind.Unknown */ || scanner.getTokenError() !== 0 /* ScanError.None */;
            return token;
        }
        const editOperations = [];
        function addEdit(text, startOffset, endOffset) {
            if (!hasError && startOffset < rangeEnd && endOffset > rangeStart && documentText.substring(startOffset, endOffset) !== text) {
                editOperations.push({ offset: startOffset, length: endOffset - startOffset, content: text });
            }
        }
        let firstToken = scanNext();
        if (firstToken !== 17 /* SyntaxKind.EOF */) {
            const firstTokenStart = scanner.getTokenOffset() + formatTextStart;
            const initialIndent = repeat(indentValue, initialIndentLevel);
            addEdit(initialIndent, formatTextStart, firstTokenStart);
        }
        while (firstToken !== 17 /* SyntaxKind.EOF */) {
            let firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
            let secondToken = scanNext();
            let replaceContent = '';
            while (!lineBreak && (secondToken === 12 /* SyntaxKind.LineCommentTrivia */ || secondToken === 13 /* SyntaxKind.BlockCommentTrivia */)) {
                // comments on the same line: keep them on the same line, but ignore them otherwise
                const commentTokenStart = scanner.getTokenOffset() + formatTextStart;
                addEdit(' ', firstTokenEnd, commentTokenStart);
                firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
                replaceContent = secondToken === 12 /* SyntaxKind.LineCommentTrivia */ ? newLineAndIndent() : '';
                secondToken = scanNext();
            }
            if (secondToken === 2 /* SyntaxKind.CloseBraceToken */) {
                if (firstToken !== 1 /* SyntaxKind.OpenBraceToken */) {
                    indentLevel--;
                    replaceContent = newLineAndIndent();
                }
            }
            else if (secondToken === 4 /* SyntaxKind.CloseBracketToken */) {
                if (firstToken !== 3 /* SyntaxKind.OpenBracketToken */) {
                    indentLevel--;
                    replaceContent = newLineAndIndent();
                }
            }
            else {
                switch (firstToken) {
                    case 3 /* SyntaxKind.OpenBracketToken */:
                    case 1 /* SyntaxKind.OpenBraceToken */:
                        indentLevel++;
                        replaceContent = newLineAndIndent();
                        break;
                    case 5 /* SyntaxKind.CommaToken */:
                    case 12 /* SyntaxKind.LineCommentTrivia */:
                        replaceContent = newLineAndIndent();
                        break;
                    case 13 /* SyntaxKind.BlockCommentTrivia */:
                        if (lineBreak) {
                            replaceContent = newLineAndIndent();
                        }
                        else {
                            // symbol following comment on the same line: keep on same line, separate with ' '
                            replaceContent = ' ';
                        }
                        break;
                    case 6 /* SyntaxKind.ColonToken */:
                        replaceContent = ' ';
                        break;
                    case 10 /* SyntaxKind.StringLiteral */:
                        if (secondToken === 6 /* SyntaxKind.ColonToken */) {
                            replaceContent = '';
                            break;
                        }
                    // fall through
                    case 7 /* SyntaxKind.NullKeyword */:
                    case 8 /* SyntaxKind.TrueKeyword */:
                    case 9 /* SyntaxKind.FalseKeyword */:
                    case 11 /* SyntaxKind.NumericLiteral */:
                    case 2 /* SyntaxKind.CloseBraceToken */:
                    case 4 /* SyntaxKind.CloseBracketToken */:
                        if (secondToken === 12 /* SyntaxKind.LineCommentTrivia */ || secondToken === 13 /* SyntaxKind.BlockCommentTrivia */) {
                            replaceContent = ' ';
                        }
                        else if (secondToken !== 5 /* SyntaxKind.CommaToken */ && secondToken !== 17 /* SyntaxKind.EOF */) {
                            hasError = true;
                        }
                        break;
                    case 16 /* SyntaxKind.Unknown */:
                        hasError = true;
                        break;
                }
                if (lineBreak && (secondToken === 12 /* SyntaxKind.LineCommentTrivia */ || secondToken === 13 /* SyntaxKind.BlockCommentTrivia */)) {
                    replaceContent = newLineAndIndent();
                }
            }
            const secondTokenStart = scanner.getTokenOffset() + formatTextStart;
            addEdit(replaceContent, firstTokenEnd, secondTokenStart);
            firstToken = secondToken;
        }
        return editOperations;
    }
    exports.format = format;
    /**
     * Creates a formatted string out of the object passed as argument, using the given formatting options
     * @param any The object to stringify and format
     * @param options The formatting options to use
     */
    function toFormattedString(obj, options) {
        const content = JSON.stringify(obj, undefined, options.insertSpaces ? options.tabSize || 4 : '\t');
        if (options.eol !== undefined) {
            return content.replace(/\r\n|\r|\n/g, options.eol);
        }
        return content;
    }
    exports.toFormattedString = toFormattedString;
    function repeat(s, count) {
        let result = '';
        for (let i = 0; i < count; i++) {
            result += s;
        }
        return result;
    }
    function computeIndentLevel(content, options) {
        let i = 0;
        let nChars = 0;
        const tabSize = options.tabSize || 4;
        while (i < content.length) {
            const ch = content.charAt(i);
            if (ch === ' ') {
                nChars++;
            }
            else if (ch === '\t') {
                nChars += tabSize;
            }
            else {
                break;
            }
            i++;
        }
        return Math.floor(nChars / tabSize);
    }
    function getEOL(options, text) {
        for (let i = 0; i < text.length; i++) {
            const ch = text.charAt(i);
            if (ch === '\r') {
                if (i + 1 < text.length && text.charAt(i + 1) === '\n') {
                    return '\r\n';
                }
                return '\r';
            }
            else if (ch === '\n') {
                return '\n';
            }
        }
        return (options && options.eol) || '\n';
    }
    exports.getEOL = getEOL;
    function isEOL(text, offset) {
        return '\r\n'.indexOf(text.charAt(offset)) !== -1;
    }
    exports.isEOL = isEOL;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbkZvcm1hdHRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL2pzb25Gb3JtYXR0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBb0RoRyxTQUFnQixNQUFNLENBQUMsWUFBb0IsRUFBRSxLQUF3QixFQUFFLE9BQTBCO1FBQ2hHLElBQUksa0JBQTBCLENBQUM7UUFDL0IsSUFBSSxVQUFrQixDQUFDO1FBQ3ZCLElBQUksZUFBdUIsQ0FBQztRQUM1QixJQUFJLFVBQWtCLENBQUM7UUFDdkIsSUFBSSxRQUFnQixDQUFDO1FBQ3JCLElBQUksS0FBSyxFQUFFO1lBQ1YsVUFBVSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7WUFDMUIsUUFBUSxHQUFHLFVBQVUsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO1lBRXJDLGVBQWUsR0FBRyxVQUFVLENBQUM7WUFDN0IsT0FBTyxlQUFlLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxlQUFlLEdBQUcsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3hFLGVBQWUsRUFBRSxDQUFDO2FBQ2xCO1lBQ0QsSUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDO1lBQ3pCLE9BQU8sU0FBUyxHQUFHLFlBQVksQ0FBQyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxFQUFFO2dCQUMxRSxTQUFTLEVBQUUsQ0FBQzthQUNaO1lBQ0QsVUFBVSxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUMsZUFBZSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ2hFLGtCQUFrQixHQUFHLGtCQUFrQixDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztTQUM3RDthQUFNO1lBQ04sVUFBVSxHQUFHLFlBQVksQ0FBQztZQUMxQixrQkFBa0IsR0FBRyxDQUFDLENBQUM7WUFDdkIsZUFBZSxH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