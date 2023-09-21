/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/common/core/position", "vs/editor/common/core/range"], function (require, exports, errors_1, lifecycle_1, observable_1, position_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.lengthOfText = exports.addPositions = exports.applyObservableDecorations = exports.ColumnRange = exports.getReadonlyEmptyArray = exports.applyEdits = void 0;
    function applyEdits(text, edits) {
        const transformer = new PositionOffsetTransformer(text);
        const offsetEdits = edits.map(e => {
            const range = range_1.Range.lift(e.range);
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
    exports.applyEdits = applyEdits;
    class PositionOffsetTransformer {
        constructor(text) {
            this.lineStartOffsetByLineIdx = [];
            this.lineStartOffsetByLineIdx.push(0);
            for (let i = 0; i < text.length; i++) {
                if (text.charAt(i) === '\n') {
                    this.lineStartOffsetByLineIdx.push(i + 1);
                }
            }
        }
        getOffset(position) {
            return this.lineStartOffsetByLineIdx[position.lineNumber - 1] + position.column - 1;
        }
    }
    const array = [];
    function getReadonlyEmptyArray() {
        return array;
    }
    exports.getReadonlyEmptyArray = getReadonlyEmptyArray;
    class ColumnRange {
        constructor(startColumn, endColumnExclusive) {
            this.startColumn = startColumn;
            this.endColumnExclusive = endColumnExclusive;
            if (startColumn > endColumnExclusive) {
                throw new errors_1.BugIndicatingError(`startColumn ${startColumn} cannot be after endColumnExclusive ${endColumnExclusive}`);
            }
        }
        toRange(lineNumber) {
            return new range_1.Range(lineNumber, this.startColumn, lineNumber, this.endColumnExclusive);
        }
        equals(other) {
            return this.startColumn === other.startColumn
                && this.endColumnExclusive === other.endColumnExclusive;
        }
    }
    exports.ColumnRange = ColumnRange;
    function applyObservableDecorations(editor, decorations) {
        const d = new lifecycle_1.DisposableStore();
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
    exports.applyObservableDecorations = applyObservableDecorations;
    function addPositions(pos1, pos2) {
        return new position_1.Position(pos1.lineNumber + pos2.lineNumber - 1, pos2.lineNumber === 1 ? pos1.column + pos2.column - 1 : pos2.column);
    }
    exports.addPositions = addPositions;
    function lengthOfText(text) {
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
        return new position_1.Position(line, column);
    }
    exports.lengthOfText = lengthOfText;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9pbmxpbmVDb21wbGV0aW9ucy9icm93c2VyL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVVoRyxTQUFnQixVQUFVLENBQUMsSUFBWSxFQUFFLEtBQXdDO1FBQ2hGLE1BQU0sV0FBVyxHQUFHLElBQUkseUJBQXlCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEQsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNqQyxNQUFNLEtBQUssR0FBRyxhQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNsQyxPQUFPLENBQUM7Z0JBQ1AsV0FBVyxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQzVELFNBQVMsRUFBRSxXQUFXLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDeEQsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJO2FBQ1osQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSCxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFMUQsS0FBSyxNQUFNLElBQUksSUFBSSxXQUFXLEVBQUU7WUFDL0IsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQ3hGO1FBRUQsT0FBTyxJ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