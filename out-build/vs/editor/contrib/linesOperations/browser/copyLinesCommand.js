/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/range", "vs/editor/common/core/selection"], function (require, exports, range_1, selection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$x9 = void 0;
    class $x9 {
        constructor(selection, isCopyingDown, noop) {
            this.a = selection;
            this.b = isCopyingDown;
            this.c = noop || false;
            this.d = 0 /* SelectionDirection.LTR */;
            this.e = null;
            this.f = 0;
            this.g = 0;
        }
        getEditOperations(model, builder) {
            let s = this.a;
            this.f = 0;
            this.g = 0;
            if (s.startLineNumber < s.endLineNumber && s.endColumn === 1) {
                this.g = 1;
                s = s.setEndPosition(s.endLineNumber - 1, model.getLineMaxColumn(s.endLineNumber - 1));
            }
            const sourceLines = [];
            for (let i = s.startLineNumber; i <= s.endLineNumber; i++) {
                sourceLines.push(model.getLineContent(i));
            }
            const sourceText = sourceLines.join('\n');
            if (sourceText === '') {
                // Duplicating empty line
                if (this.b) {
                    this.f++;
                    this.g++;
                }
            }
            if (this.c) {
                builder.addEditOperation(new range_1.$ks(s.endLineNumber, model.getLineMaxColumn(s.endLineNumber), s.endLineNumber + 1, 1), s.endLineNumber === model.getLineCount() ? '' : '\n');
            }
            else {
                if (!this.b) {
                    builder.addEditOperation(new range_1.$ks(s.endLineNumber, model.getLineMaxColumn(s.endLineNumber), s.endLineNumber, model.getLineMaxColumn(s.endLineNumber)), '\n' + sourceText);
                }
                else {
                    builder.addEditOperation(new range_1.$ks(s.startLineNumber, 1, s.startLineNumber, 1), sourceText + '\n');
                }
            }
            this.e = builder.trackSelection(s);
            this.d = this.a.getDirection();
        }
        computeCursorState(model, helper) {
            let result = helper.getTrackedSelection(this.e);
            if (this.f !== 0 || this.g !== 0) {
                let startLineNumber = result.startLineNumber;
                let startColumn = result.startColumn;
                let endLineNumber = result.endLineNumber;
                let endColumn = result.endColumn;
                if (this.f !== 0) {
                    startLineNumber = startLineNumber + this.f;
                    startColumn = 1;
                }
                if (this.g !== 0) {
                    endLineNumber = endLineNumber + this.g;
                    endColumn = 1;
                }
                result = selection_1.$ms.createWithDirection(startLineNumber, startColumn, endLineNumber, endColumn, this.d);
            }
            return result;
        }
    }
    exports.$x9 = $x9;
});
//# sourceMappingURL=copyLinesCommand.js.map