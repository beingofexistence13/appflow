/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/common/core/position", "vs/editor/common/core/range"], function (require, exports, errors_1, lifecycle_1, observable_1, position_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$p5 = exports.$o5 = exports.$n5 = exports.$m5 = exports.$l5 = exports.$k5 = void 0;
    function $k5(text, edits) {
        const transformer = new PositionOffsetTransformer(text);
        const offsetEdits = edits.map(e => {
            const range = range_1.$ks.lift(e.range);
            return ({
                startOffset: transformer.getOffset(range.getStartPosition()),
                endOffset: transformer.getOffset(range.getEndPosition()),
                text: e.text
            });
        });
        offsetEdits.sort((a, b) => b.startOffset - a.startOffset);
        for (const edit of offsetEdits) {
            text = text.substring(0, edit.startOffset) + edit.text + text.substring(edit.endOffset);
        }
        return text;
    }
    exports.$k5 = $k5;
    class PositionOffsetTransformer {
        constructor(text) {
            this.f = [];
            this.f.push(0);
            for (let i = 0; i < text.length; i++) {
                if (text.charAt(i) === '\n') {
                    this.f.push(i + 1);
                }
            }
        }
        getOffset(position) {
            return this.f[position.lineNumber - 1] + position.column - 1;
        }
    }
    const array = [];
    function $l5() {
        return array;
    }
    exports.$l5 = $l5;
    class $m5 {
        constructor(startColumn, endColumnExclusive) {
            this.startColumn = startColumn;
            this.endColumnExclusive = endColumnExclusive;
            if (startColumn > endColumnExclusive) {
                throw new errors_1.$ab(`startColumn ${startColumn} cannot be after endColumnExclusive ${endColumnExclusive}`);
            }
        }
        toRange(lineNumber) {
            return new range_1.$ks(lineNumber, this.startColumn, lineNumber, this.endColumnExclusive);
        }
        equals(other) {
            return this.startColumn === other.startColumn
                && this.endColumnExclusive === other.endColumnExclusive;
        }
    }
    exports.$m5 = $m5;
    function $n5(editor, decorations) {
        const d = new lifecycle_1.$jc();
        const decorationsCollection = editor.createDecorationsCollection();
        d.add((0, observable_1.autorunOpts)({ debugName: () => `Apply decorations from ${decorations.debugName}` }, reader => {
            const d = decorations.read(reader);
            decorationsCollection.set(d);
        }));
        d.add({
            dispose: () => {
                decorationsCollection.clear();
            }
        });
        return d;
    }
    exports.$n5 = $n5;
    function $o5(pos1, pos2) {
        return new position_1.$js(pos1.lineNumber + pos2.lineNumber - 1, pos2.lineNumber === 1 ? pos1.column + pos2.column - 1 : pos2.column);
    }
    exports.$o5 = $o5;
    function $p5(text) {
        let line = 1;
        let column = 1;
        for (const c of text) {
            if (c === '\n') {
                line++;
                column = 1;
            }
            else {
                column++;
            }
        }
        return new position_1.$js(line, column);
    }
    exports.$p5 = $p5;
});
//# sourceMappingURL=utils.js.map