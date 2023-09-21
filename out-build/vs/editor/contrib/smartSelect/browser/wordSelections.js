/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/core/range"], function (require, exports, strings_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$J0 = void 0;
    class $J0 {
        constructor(a = true) {
            this.a = a;
        }
        provideSelectionRanges(model, positions) {
            const result = [];
            for (const position of positions) {
                const bucket = [];
                result.push(bucket);
                if (this.a) {
                    this.b(bucket, model, position);
                }
                this.c(bucket, model, position);
                this.d(bucket, model, position);
                bucket.push({ range: model.getFullModelRange() });
            }
            return result;
        }
        b(bucket, model, pos) {
            const obj = model.getWordAtPosition(pos);
            if (!obj) {
                return;
            }
            const { word, startColumn } = obj;
            const offset = pos.column - startColumn;
            let start = offset;
            let end = offset;
            let lastCh = 0;
            // LEFT anchor (start)
            for (; start >= 0; start--) {
                const ch = word.charCodeAt(start);
                if ((start !== offset) && (ch === 95 /* CharCode.Underline */ || ch === 45 /* CharCode.Dash */)) {
                    // foo-bar OR foo_bar
                    break;
                }
                else if ((0, strings_1.$Ke)(ch) && (0, strings_1.$Le)(lastCh)) {
                    // fooBar
                    break;
                }
                lastCh = ch;
            }
            start += 1;
            // RIGHT anchor (end)
            for (; end < word.length; end++) {
                const ch = word.charCodeAt(end);
                if ((0, strings_1.$Le)(ch) && (0, strings_1.$Ke)(lastCh)) {
                    // fooBar
                    break;
                }
                else if (ch === 95 /* CharCode.Underline */ || ch === 45 /* CharCode.Dash */) {
                    // foo-bar OR foo_bar
                    break;
                }
                lastCh = ch;
            }
            if (start < end) {
                bucket.push({ range: new range_1.$ks(pos.lineNumber, startColumn + start, pos.lineNumber, startColumn + end) });
            }
        }
        c(bucket, model, pos) {
            const word = model.getWordAtPosition(pos);
            if (word) {
                bucket.push({ range: new range_1.$ks(pos.lineNumber, word.startColumn, pos.lineNumber, word.endColumn) });
            }
        }
        d(bucket, model, pos) {
            if (model.getLineLength(pos.lineNumber) > 0
                && model.getLineFirstNonWhitespaceColumn(pos.lineNumber) === 0
                && model.getLineLastNonWhitespaceColumn(pos.lineNumber) === 0) {
                bucket.push({ range: new range_1.$ks(pos.lineNumber, 1, pos.lineNumber, model.getLineMaxColumn(pos.lineNumber)) });
            }
        }
    }
    exports.$J0 = $J0;
});
//# sourceMappingURL=wordSelections.js.map