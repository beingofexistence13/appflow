/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection"], function (require, exports, editOperation_1, position_1, range_1, selection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BlockCommentCommand = void 0;
    class BlockCommentCommand {
        constructor(selection, insertSpace, languageConfigurationService) {
            this.languageConfigurationService = languageConfigurationService;
            this._selection = selection;
            this._insertSpace = insertSpace;
            this._usedEndToken = null;
        }
        static _haystackHasNeedleAtOffset(haystack, needle, offset) {
            if (offset < 0) {
                return false;
            }
            const needleLength = needle.length;
            const haystackLength = haystack.length;
            if (offset + needleLength > haystackLength) {
                return false;
            }
            for (let i = 0; i < needleLength; i++) {
                const codeA = haystack.charCodeAt(offset + i);
                const codeB = needle.charCodeAt(i);
                if (codeA === codeB) {
                    continue;
                }
                if (codeA >= 65 /* CharCode.A */ && codeA <= 90 /* CharCode.Z */ && codeA + 32 === codeB) {
                    // codeA is upper-case variant of codeB
                    continue;
                }
                if (codeB >= 65 /* CharCode.A */ && codeB <= 90 /* CharCode.Z */ && codeB + 32 === codeA) {
                    // codeB is upper-case variant of codeA
                    continue;
                }
                return false;
            }
            return true;
        }
        _createOperationsForBlockComment(selection, startToken, endToken, insertSpace, model, builder) {
            const startLineNumber = selection.startLineNumber;
            const startColumn = selection.startColumn;
            const endLineNumber = selection.endLineNumber;
            const endColumn = selection.endColumn;
            const startLineText = model.getLineContent(startLineNumber);
            const endLineText = model.getLineContent(endLineNumber);
            let startTokenIndex = startLineText.lastIndexOf(startToken, startColumn - 1 + startToken.length);
            let endTokenIndex = endLineText.indexOf(endToken, endColumn - 1 - endToken.length);
            if (startTokenIndex !== -1 && endTokenIndex !== -1) {
                if (startLineNumber === endLineNumber) {
                    const lineBetweenTokens = startLineText.substring(startTokenIndex + startToken.length, endTokenIndex);
                    if (lineBetweenTokens.indexOf(endToken) >= 0) {
                        // force to add a block comment
                        startTokenIndex = -1;
                        endTokenIndex = -1;
                    }
                }
                else {
                    const startLineAfterStartToken = startLineText.substring(startTokenIndex + startToken.length);
                    const endLineBeforeEndToken = endLineText.substring(0, endTokenIndex);
                    if (startLineAfterStartToken.indexOf(endToken) >= 0 || endLineBeforeEndToken.indexOf(endToken) >= 0) {
                        // force to add a block comment
                        startTokenIndex = -1;
                        endTokenIndex = -1;
                    }
                }
            }
            let ops;
            if (startTokenIndex !== -1 && endTokenIndex !== -1) {
                // Consider spaces as part of the comment tokens
                if (insertSpace && startTokenIndex + startToken.length < startLineText.length && startLineText.charCodeAt(startTokenIndex + startToken.length) === 32 /* CharCode.Space */) {
                    // Pretend the start token contains a trailing space
                    startToken = startToken + ' ';
                }
                if (insertSpace && endTokenIndex > 0 && endLineText.charCodeAt(endTokenIndex - 1) === 32 /* CharCode.Space */) {
                    // Pretend the end token contains a leading space
                    endToken = ' ' + endToken;
                    endTokenIndex -= 1;
                }
                ops = BlockCommentCommand._createRemoveBlockCommentOperations(new range_1.Range(startLineNumber, startTokenIndex + startToken.length + 1, endLineNumber, endTokenIndex + 1), startToken, endToken);
            }
            else {
                ops = BlockCommentCommand._createAddBlockCommentOperations(selection, startToken, endToken, this._insertSpace);
                this._usedEndToken = ops.length === 1 ? endToken : null;
            }
            for (const op of ops) {
                builder.addTrackedEditOperation(op.range, op.text);
            }
        }
        static _createRemoveBlockCommentOperations(r, startToken, endToken) {
            const res = [];
            if (!range_1.Range.isEmpty(r)) {
                // Remove block comment start
                res.push(editOperation_1.EditOperation.delete(new range_1.Range(r.startLineNumber, r.startColumn - startToken.length, r.startLineNumber, r.startColumn)));
                // Remove block comment end
                res.push(editOperation_1.EditOperation.delete(new range_1.Range(r.endLineNumber, r.endColumn, r.endLineNumber, r.endColumn + endToken.length)));
            }
            else {
                // Remove both continuously
                res.push(editOperation_1.EditOperation.delete(new range_1.Range(r.startLineNumber, r.startColumn - startToken.length, r.endLineNumber, r.endColumn + endToken.length)));
            }
            return res;
        }
        static _createAddBlockCommentOperations(r, startToken, endToken, insertSpace) {
            const res = [];
            if (!range_1.Range.isEmpty(r)) {
                // Insert block comment start
                res.push(editOperation_1.EditOperation.insert(new position_1.Position(r.startLineNumber, r.startColumn), startToken + (insertSpace ? ' ' : '')));
                // Insert block comment end
                res.push(editOperation_1.EditOperation.insert(new position_1.Position(r.endLineNumber, r.endColumn), (insertSpace ? ' ' : '') + endToken));
            }
            else {
                // Insert both continuously
                res.push(editOperation_1.EditOperation.replace(new range_1.Range(r.startLineNumber, r.startColumn, r.endLineNumber, r.endColumn), startToken + '  ' + endToken));
            }
            return res;
        }
        getEditOperations(model, builder) {
            const startLineNumber = this._selection.startLineNumber;
            const startColumn = this._selection.startColumn;
            model.tokenization.tokenizeIfCheap(startLineNumber);
            const languageId = model.getLanguageIdAtPosition(startLineNumber, startColumn);
            const config = this.languageConfigurationService.getLanguageConfiguration(languageId).comments;
            if (!config || !config.blockCommentStartToken || !config.blockCommentEndToken) {
                // Mode does not support block comments
                return;
            }
            this._createOperationsForBlockComment(this._selection, config.blockCommentStartToken, config.blockCommentEndToken, this._insertSpace, model, builder);
        }
        computeCursorState(model, helper) {
            const inverseEditOperations = helper.getInverseEditOperations();
            if (inverseEditOperations.length === 2) {
                const startTokenEditOperation = inverseEditOperations[0];
                const endTokenEditOperation = inverseEditOperations[1];
                return new selection_1.Selection(startTokenEditOperation.range.endLineNumber, startTokenEditOperation.range.endColumn, endTokenEditOperation.range.startLineNumber, endTokenEditOperation.range.startColumn);
            }
            else {
                const srcRange = inverseEditOperations[0].range;
                const deltaColumn = this._usedEndToken ? -this._usedEndToken.length - 1 : 0; // minus 1 space before endToken
                return new selection_1.Selection(srcRange.endLineNumber, srcRange.endColumn + deltaColumn, srcRange.endLineNumber, srcRange.endColumn + deltaColumn);
            }
        }
    }
    exports.BlockCommentCommand = BlockCommentCommand;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2tDb21tZW50Q29tbWFuZC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2NvbW1lbnQvYnJvd3Nlci9ibG9ja0NvbW1lbnRDb21tYW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVdoRyxNQUFhLG1CQUFtQjtRQU0vQixZQUNDLFNBQW9CLEVBQ3BCLFdBQW9CLEVBQ0gsNEJBQTJEO1lBQTNELGlDQUE0QixHQUE1Qiw0QkFBNEIsQ0FBK0I7WUFFNUUsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7WUFDNUIsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7WUFDaEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFDM0IsQ0FBQztRQUVNLE1BQU0sQ0FBQywwQkFBMEIsQ0FBQyxRQUFnQixFQUFFLE1BQWMsRUFBRSxNQUFjO1lBQ3hGLElBQUksTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDZixPQUFPLEtBQUssQ0FBQzthQUNiO1lBQ0QsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUNuQyxNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQ3ZDLElBQUksTUFBTSxHQUFHLFlBQVksR0FBRyxjQUFjLEVBQUU7Z0JBQzNDLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN0QyxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDOUMsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFbkMsSUFBSSxLQUFLLEtBQUssS0FBSyxFQUFFO29C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