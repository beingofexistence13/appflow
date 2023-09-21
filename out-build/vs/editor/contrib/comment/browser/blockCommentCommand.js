/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection"], function (require, exports, editOperation_1, position_1, range_1, selection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$V6 = void 0;
    class $V6 {
        constructor(selection, insertSpace, d) {
            this.d = d;
            this.a = selection;
            this.b = insertSpace;
            this.c = null;
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
        e(selection, startToken, endToken, insertSpace, model, builder) {
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
                ops = $V6._createRemoveBlockCommentOperations(new range_1.$ks(startLineNumber, startTokenIndex + startToken.length + 1, endLineNumber, endTokenIndex + 1), startToken, endToken);
            }
            else {
                ops = $V6._createAddBlockCommentOperations(selection, startToken, endToken, this.b);
                this.c = ops.length === 1 ? endToken : null;
            }
            for (const op of ops) {
                builder.addTrackedEditOperation(op.range, op.text);
            }
        }
        static _createRemoveBlockCommentOperations(r, startToken, endToken) {
            const res = [];
            if (!range_1.$ks.isEmpty(r)) {
                // Remove block comment start
                res.push(editOperation_1.$ls.delete(new range_1.$ks(r.startLineNumber, r.startColumn - startToken.length, r.startLineNumber, r.startColumn)));
                // Remove block comment end
                res.push(editOperation_1.$ls.delete(new range_1.$ks(r.endLineNumber, r.endColumn, r.endLineNumber, r.endColumn + endToken.length)));
            }
            else {
                // Remove both continuously
                res.push(editOperation_1.$ls.delete(new range_1.$ks(r.startLineNumber, r.startColumn - startToken.length, r.endLineNumber, r.endColumn + endToken.length)));
            }
            return res;
        }
        static _createAddBlockCommentOperations(r, startToken, endToken, insertSpace) {
            const res = [];
            if (!range_1.$ks.isEmpty(r)) {
                // Insert block comment start
                res.push(editOperation_1.$ls.insert(new position_1.$js(r.startLineNumber, r.startColumn), startToken + (insertSpace ? ' ' : '')));
                // Insert block comment end
                res.push(editOperation_1.$ls.insert(new position_1.$js(r.endLineNumber, r.endColumn), (insertSpace ? ' ' : '') + endToken));
            }
            else {
                // Insert both continuously
                res.push(editOperation_1.$ls.replace(new range_1.$ks(r.startLineNumber, r.startColumn, r.endLineNumber, r.endColumn), startToken + '  ' + endToken));
            }
            return res;
        }
        getEditOperations(model, builder) {
            const startLineNumber = this.a.startLineNumber;
            const startColumn = this.a.startColumn;
            model.tokenization.tokenizeIfCheap(startLineNumber);
            const languageId = model.getLanguageIdAtPosition(startLineNumber, startColumn);
            const config = this.d.getLanguageConfiguration(languageId).comments;
            if (!config || !config.blockCommentStartToken || !config.blockCommentEndToken) {
                // Mode does not support block comments
                return;
            }
            this.e(this.a, config.blockCommentStartToken, config.blockCommentEndToken, this.b, model, builder);
        }
        computeCursorState(model, helper) {
            const inverseEditOperations = helper.getInverseEditOperations();
            if (inverseEditOperations.length === 2) {
                const startTokenEditOperation = inverseEditOperations[0];
                const endTokenEditOperation = inverseEditOperations[1];
                return new selection_1.$ms(startTokenEditOperation.range.endLineNumber, startTokenEditOperation.range.endColumn, endTokenEditOperation.range.startLineNumber, endTokenEditOperation.range.startColumn);
            }
            else {
                const srcRange = inverseEditOperations[0].range;
                const deltaColumn = this.c ? -this.c.length - 1 : 0; // minus 1 space before endToken
                return new selection_1.$ms(srcRange.endLineNumber, srcRange.endColumn + deltaColumn, srcRange.endLineNumber, srcRange.endColumn + deltaColumn);
            }
        }
    }
    exports.$V6 = $V6;
});
//# sourceMappingURL=blockCommentCommand.js.map