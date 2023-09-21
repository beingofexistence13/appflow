/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/strings", "vs/base/test/common/utils", "vs/editor/common/core/range", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/beforeEditPositionMapper", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/length"], function (require, exports, assert, strings_1, utils_1, range_1, beforeEditPositionMapper_1, length_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextEdit = void 0;
    suite('Bracket Pair Colorizer - BeforeEditPositionMapper', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('Single-Line 1', () => {
            assert.deepStrictEqual(compute([
                '0123456789',
            ], [
                new TextEdit((0, length_1.toLength)(0, 4), (0, length_1.toLength)(0, 7), 'xy')
            ]), [
                '0  1  2  3  x  y  7  8  9  ',
                '0  0  0  0  0  0  0  0  0  0  ',
                '0  1  2  3  4  5  7  8  9  10 ',
                '0  0  0  0  0  0  ∞  ∞  ∞  ∞  ',
                '4  3  2  1  0  0  ∞  ∞  ∞  ∞  ', // column count until next change
            ]);
        });
        test('Single-Line 2', () => {
            assert.deepStrictEqual(compute([
                '0123456789',
            ], [
                new TextEdit((0, length_1.toLength)(0, 2), (0, length_1.toLength)(0, 4), 'xxxx'),
                new TextEdit((0, length_1.toLength)(0, 6), (0, length_1.toLength)(0, 6), 'yy')
            ]), [
                '0  1  x  x  x  x  4  5  y  y  6  7  8  9  ',
                '0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  ',
                '0  1  2  3  4  5  4  5  6  7  6  7  8  9  10 ',
                '0  0  0  0  0  0  0  0  0  0  ∞  ∞  ∞  ∞  ∞  ',
                '2  1  0  0  0  0  2  1  0  0  ∞  ∞  ∞  ∞  ∞  ',
            ]);
        });
        test('Multi-Line Replace 1', () => {
            assert.deepStrictEqual(compute([
                '₀₁₂₃₄₅₆₇₈₉',
                '0123456789',
                '⁰¹²³⁴⁵⁶⁷⁸⁹',
            ], [
                new TextEdit((0, length_1.toLength)(0, 3), (0, length_1.toLength)(1, 3), 'xy'),
            ]), [
                '₀  ₁  ₂  x  y  3  4  5  6  7  8  9  ',
                '0  0  0  0  0  1  1  1  1  1  1  1  1  ',
                '0  1  2  3  4  3  4  5  6  7  8  9  10 ',
                "0  0  0  0  0  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ",
                '3  2  1  0  0  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ',
                // ------------------
                '⁰  ¹  ²  ³  ⁴  ⁵  ⁶  ⁷  ⁸  ⁹  ',
                '2  2  2  2  2  2  2  2  2  2  2  ',
                '0  1  2  3  4  5  6  7  8  9  10 ',
                '∞  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ',
                '∞  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ',
            ]);
        });
        test('Multi-Line Replace 2', () => {
            assert.deepStrictEqual(compute([
                '₀₁₂₃₄₅₆₇₈₉',
                '012345678',
                '⁰¹²³⁴⁵⁶⁷⁸⁹',
            ], [
                new TextEdit((0, length_1.toLength)(0, 3), (0, length_1.toLength)(1, 0), 'ab'),
                new TextEdit((0, length_1.toLength)(1, 5), (0, length_1.toLength)(1, 7), 'c'),
            ]), [
                '₀  ₁  ₂  a  b  0  1  2  3  4  c  7  8  ',
                '0  0  0  0  0  1  1  1  1  1  1  1  1  1  ',
                '0  1  2  3  4  0  1  2  3  4  5  7  8  9  ',
                '0  0  0  0  0  0  0  0  0  0  0  ∞  ∞  ∞  ',
                '3  2  1  0  0  5  4  3  2  1  0  ∞  ∞  ∞  ',
                // ------------------
                '⁰  ¹  ²  ³  ⁴  ⁵  ⁶  ⁷  ⁸  ⁹  ',
                '2  2  2  2  2  2  2  2  2  2  2  ',
                '0  1  2  3  4  5  6  7  8  9  10 ',
                '∞  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ',
                '∞  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ',
            ]);
        });
        test('Multi-Line Replace 3', () => {
            assert.deepStrictEqual(compute([
                '₀₁₂₃₄₅₆₇₈₉',
                '012345678',
                '⁰¹²³⁴⁵⁶⁷⁸⁹',
            ], [
                new TextEdit((0, length_1.toLength)(0, 3), (0, length_1.toLength)(1, 0), 'ab'),
                new TextEdit((0, length_1.toLength)(1, 5), (0, length_1.toLength)(1, 7), 'c'),
                new TextEdit((0, length_1.toLength)(1, 8), (0, length_1.toLength)(2, 4), 'd'),
            ]), [
                '₀  ₁  ₂  a  b  0  1  2  3  4  c  7  d  ⁴  ⁵  ⁶  ⁷  ⁸  ⁹  ',
                '0  0  0  0  0  1  1  1  1  1  1  1  1  2  2  2  2  2  2  2  ',
                '0  1  2  3  4  0  1  2  3  4  5  7  8  4  5  6  7  8  9  10 ',
                '0  0  0  0  0  0  0  0  0  0  0  0  0  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ',
                '3  2  1  0  0  5  4  3  2  1  0  1  0  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ',
            ]);
        });
        test('Multi-Line Insert 1', () => {
            assert.deepStrictEqual(compute([
                '012345678',
            ], [
                new TextEdit((0, length_1.toLength)(0, 3), (0, length_1.toLength)(0, 5), 'a\nb'),
            ]), [
                '0  1  2  a  ',
                '0  0  0  0  0  ',
                '0  1  2  3  4  ',
                '0  0  0  0  0  ',
                '3  2  1  0  0  ',
                // ------------------
                'b  5  6  7  8  ',
                '1  0  0  0  0  0  ',
                '0  5  6  7  8  9  ',
                '0  ∞  ∞  ∞  ∞  ∞  ',
                '0  ∞  ∞  ∞  ∞  ∞  ',
            ]);
        });
        test('Multi-Line Insert 2', () => {
            assert.deepStrictEqual(compute([
                '012345678',
            ], [
                new TextEdit((0, length_1.toLength)(0, 3), (0, length_1.toLength)(0, 5), 'a\nb'),
                new TextEdit((0, length_1.toLength)(0, 7), (0, length_1.toLength)(0, 8), 'x\ny'),
            ]), [
                '0  1  2  a  ',
                '0  0  0  0  0  ',
                '0  1  2  3  4  ',
                '0  0  0  0  0  ',
                '3  2  1  0  0  ',
                // ------------------
                'b  5  6  x  ',
                '1  0  0  0  0  ',
                '0  5  6  7  8  ',
                '0  0  0  0  0  ',
                '0  2  1  0  0  ',
                // ------------------
                'y  8  ',
                '1  0  0  ',
                '0  8  9  ',
                '0  ∞  ∞  ',
                '0  ∞  ∞  ',
            ]);
        });
        test('Multi-Line Replace/Insert 1', () => {
            assert.deepStrictEqual(compute([
                '₀₁₂₃₄₅₆₇₈₉',
                '012345678',
                '⁰¹²³⁴⁵⁶⁷⁸⁹',
            ], [
                new TextEdit((0, length_1.toLength)(0, 3), (0, length_1.toLength)(1, 1), 'aaa\nbbb'),
            ]), [
                '₀  ₁  ₂  a  a  a  ',
                '0  0  0  0  0  0  0  ',
                '0  1  2  3  4  5  6  ',
                '0  0  0  0  0  0  0  ',
                '3  2  1  0  0  0  0  ',
                // ------------------
                'b  b  b  1  2  3  4  5  6  7  8  ',
                '1  1  1  1  1  1  1  1  1  1  1  1  ',
                '0  1  2  1  2  3  4  5  6  7  8  9  ',
                '0  0  0  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ',
                '0  0  0  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ',
                // ------------------
                '⁰  ¹  ²  ³  ⁴  ⁵  ⁶  ⁷  ⁸  ⁹  ',
                '2  2  2  2  2  2  2  2  2  2  2  ',
                '0  1  2  3  4  5  6  7  8  9  10 ',
                '∞  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ',
                '∞  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ',
            ]);
        });
        test('Multi-Line Replace/Insert 2', () => {
            assert.deepStrictEqual(compute([
                '₀₁₂₃₄₅₆₇₈₉',
                '012345678',
                '⁰¹²³⁴⁵⁶⁷⁸⁹',
            ], [
                new TextEdit((0, length_1.toLength)(0, 3), (0, length_1.toLength)(1, 1), 'aaa\nbbb'),
                new TextEdit((0, length_1.toLength)(1, 5), (0, length_1.toLength)(1, 5), 'x\ny'),
                new TextEdit((0, length_1.toLength)(1, 7), (0, length_1.toLength)(2, 4), 'k\nl'),
            ]), [
                '₀  ₁  ₂  a  a  a  ',
                '0  0  0  0  0  0  0  ',
                '0  1  2  3  4  5  6  ',
                '0  0  0  0  0  0  0  ',
                '3  2  1  0  0  0  0  ',
                // ------------------
                'b  b  b  1  2  3  4  x  ',
                '1  1  1  1  1  1  1  1  1  ',
                '0  1  2  1  2  3  4  5  6  ',
                '0  0  0  0  0  0  0  0  0  ',
                '0  0  0  4  3  2  1  0  0  ',
                // ------------------
                'y  5  6  k  ',
                '2  1  1  1  1  ',
                '0  5  6  7  8  ',
                '0  0  0  0  0  ',
                '0  2  1  0  0  ',
                // ------------------
                'l  ⁴  ⁵  ⁶  ⁷  ⁸  ⁹  ',
                '2  2  2  2  2  2  2  2  ',
                '0  4  5  6  7  8  9  10 ',
                '0  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ',
                '0  ∞  ∞  ∞  ∞  ∞  ∞  ∞  ',
            ]);
        });
    });
    /** @pure */
    function compute(inputArr, edits) {
        const newLines = (0, strings_1.splitLines)(applyLineColumnEdits(inputArr.join('\n'), edits.map(e => ({
            text: e.newText,
            range: range_1.Range.fromPositions((0, length_1.lengthToPosition)(e.startOffset), (0, length_1.lengthToPosition)(e.endOffset))
        }))));
        const mapper = new beforeEditPositionMapper_1.BeforeEditPositionMapper(edits);
        const result = new Array();
        let lineIdx = 0;
        for (const line of newLines) {
            let lineLine = '';
            let colLine = '';
            let lineStr = '';
            let colDist = '';
            let lineDist = '';
            for (let colIdx = 0; colIdx <= line.length; colIdx++) {
                const before = mapper.getOffsetBeforeChange((0, length_1.toLength)(lineIdx, colIdx));
                const beforeObj = (0, length_1.lengthToObj)(before);
                if (colIdx < line.length) {
                    lineStr += rightPad(line[colIdx], 3);
                }
                lineLine += rightPad('' + beforeObj.lineCount, 3);
                colLine += rightPad('' + beforeObj.columnCount, 3);
                const distLen = mapper.getDistanceToNextChange((0, length_1.toLength)(lineIdx, colIdx));
                if (distLen === null) {
                    lineDist += '∞  ';
                    colDist += '∞  ';
                }
                else {
                    const dist = (0, length_1.lengthToObj)(distLen);
                    lineDist += rightPad('' + dist.lineCount, 3);
                    colDist += rightPad('' + dist.columnCount, 3);
                }
            }
            result.push(lineStr);
            result.push(lineLine);
            result.push(colLine);
            result.push(lineDist);
            result.push(colDist);
            lineIdx++;
        }
        return result;
    }
    class TextEdit extends beforeEditPositionMapper_1.TextEditInfo {
        constructor(startOffset, endOffset, newText) {
            super(startOffset, endOffset, (0, length_1.lengthOfString)(newText));
            this.newText = newText;
        }
    }
    exports.TextEdit = TextEdit;
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
    function applyLineColumnEdits(text, edits) {
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
    function rightPad(str, len) {
        while (str.length < len) {
            str += ' ';
        }
        return str;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVmb3JlRWRpdFBvc2l0aW9uTWFwcGVyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvdGVzdC9jb21tb24vbW9kZWwvYnJhY2tldFBhaXJDb2xvcml6ZXIvYmVmb3JlRWRpdFBvc2l0aW9uTWFwcGVyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVWhHLEtBQUssQ0FBQyxtREFBbUQsRUFBRSxHQUFHLEVBQUU7UUFFL0QsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLElBQUksQ0FBQyxlQUFlLEVBQUUsR0FBRyxFQUFFO1lBQzFCLE1BQU0sQ0FBQyxlQUFlLENBQ3JCLE9BQU8sQ0FDTjtnQkFDQyxZQUFZO2FBQ1osRUFDRDtnQkFDQyxJQUFJLFFBQVEsQ0FBQyxJQUFBLGlCQUFRLEVBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUEsaUJBQVEsRUFBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDO2FBQ2xELENBQ0QsRUFDRDtnQkFDQyw2QkFBNkI7Z0JBRTdCLGdDQUFnQztnQkFDaEMsZ0NBQWdDO2dCQUVoQyxnQ0FBZ0M7Z0JBQ2hDLGdDQUFnQyxFQUFFLGlDQUFpQzthQUNuRSxDQUNELENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxlQUFlLEVBQUUsR0FBRyxFQUFFO1lBQzFCLE1BQU0sQ0FBQyxlQUFlLENBQ3JCLE9BQU8sQ0FDTjtnQkFDQyxZQUFZO2FBQ1osRUFDRDtnQkFDQyxJQUFJLFFBQVEsQ0FBQyxJQUFBLGlCQUFRLEVBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUEsaUJBQVEsRUFBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDO2dCQUNwRCxJQUFJLFFBQVEsQ0FBQyxJQUFBLGlCQUFRLEVBQUMsQ0FBQyxFQUFFLENB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