/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/contrib/folding/browser/indentRangeProvider", "vs/editor/test/common/testTextModel"], function (require, exports, assert, indentRangeProvider_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function assertRanges(lines, expected, offside, markers) {
        const model = (0, testTextModel_1.createTextModel)(lines.join('\n'));
        const actual = (0, indentRangeProvider_1.computeRanges)(model, offside, markers);
        const actualRanges = [];
        for (let i = 0; i < actual.length; i++) {
            actualRanges[i] = r(actual.getStartLineNumber(i), actual.getEndLineNumber(i), actual.getParentIndex(i));
        }
        assert.deepStrictEqual(actualRanges, expected);
        model.dispose();
    }
    function r(startLineNumber, endLineNumber, parentIndex, marker = false) {
        return { startLineNumber, endLineNumber, parentIndex };
    }
    suite('Indentation Folding', () => {
        test('Fold one level', () => {
            const range = [
                'A',
                '  A',
                '  A',
                '  A'
            ];
            assertRanges(range, [r(1, 4, -1)], true);
            assertRanges(range, [r(1, 4, -1)], false);
        });
        test('Fold two levels', () => {
            const range = [
                'A',
                '  A',
                '  A',
                '    A',
                '    A'
            ];
            assertRanges(range, [r(1, 5, -1), r(3, 5, 0)], true);
            assertRanges(range, [r(1, 5, -1), r(3, 5, 0)], false);
        });
        test('Fold three levels', () => {
            const range = [
                'A',
                '  A',
                '    A',
                '      A',
                'A'
            ];
            assertRanges(range, [r(1, 4, -1), r(2, 4, 0), r(3, 4, 1)], true);
            assertRanges(range, [r(1, 4, -1), r(2, 4, 0), r(3, 4, 1)], false);
        });
        test('Fold decreasing indent', () => {
            const range = [
                '    A',
                '  A',
                'A'
            ];
            assertRanges(range, [], true);
            assertRanges(range, [], false);
        });
        test('Fold Java', () => {
            assertRanges([
                /* 1*/ 'class A {',
                /* 2*/ '  void foo() {',
                /* 3*/ '    console.log();',
                /* 4*/ '    console.log();',
                /* 5*/ '  }',
                /* 6*/ '',
                /* 7*/ '  void bar() {',
                /* 8*/ '    console.log();',
                /* 9*/ '  }',
                /*10*/ '}',
                /*11*/ 'interface B {',
                /*12*/ '  void bar();',
                /*13*/ '}',
            ], [r(1, 9, -1), r(2, 4, 0), r(7, 8, 0), r(11, 12, -1)], false);
        });
        test('Fold Javadoc', () => {
            assertRanges([
                /* 1*/ '/**',
                /* 2*/ ' * Comment',
                /* 3*/ ' */',
                /* 4*/ 'class A {',
                /* 5*/ '  void foo() {',
                /* 6*/ '  }',
                /* 7*/ '}',
            ], [r(1, 3, -1), r(4, 6, -1)], false);
        });
        test('Fold Whitespace Java', () => {
            assertRanges([
                /* 1*/ 'class A {',
                /* 2*/ '',
                /* 3*/ '  void foo() {',
                /* 4*/ '     ',
                /* 5*/ '     return 0;',
                /* 6*/ '  }',
                /* 7*/ '      ',
                /* 8*/ '}',
            ], [r(1, 7, -1), r(3, 5, 0)], false);
        });
        test('Fold Whitespace Python', () => {
            assertRanges([
                /* 1*/ 'def a:',
                /* 2*/ '  pass',
                /* 3*/ '   ',
                /* 4*/ '  def b:',
                /* 5*/ '    pass',
                /* 6*/ '  ',
                /* 7*/ '      ',
                /* 8*/ 'def c: # since there was a deintent here'
            ], [r(1, 5, -1), r(4, 5, 0)], true);
        });
        test('Fold Tabs', () => {
            assertRanges([
                /* 1*/ 'class A {',
                /* 2*/ '\t\t',
                /* 3*/ '\tvoid foo() {',
                /* 4*/ '\t \t//hello',
                /* 5*/ '\t    return 0;',
                /* 6*/ '  \t}',
                /* 7*/ '      ',
                /* 8*/ '}',
            ], [r(1, 7, -1), r(3, 5, 0)], false);
        });
    });
    const markers = {
        start: /^\s*#region\b/,
        end: /^\s*#endregion\b/
    };
    suite('Folding with regions', () => {
        test('Inside region, indented', () => {
            assertRanges([
                /* 1*/ 'class A {',
                /* 2*/ '  #region',
                /* 3*/ '  void foo() {',
                /* 4*/ '     ',
                /* 5*/ '     return 0;',
                /* 6*/ '  }',
                /* 7*/ '  #endregion',
                /* 8*/ '}',
            ], [r(1, 7, -1), r(2, 7, 0, true), r(3, 5, 1)], false, markers);
        });
        test('Inside region, not indented', () => {
            assertRanges([
                /* 1*/ 'var x;',
                /* 2*/ '#region',
                /* 3*/ 'void foo() {',
                /* 4*/ '     ',
                /* 5*/ '     return 0;',
                /* 6*/ '  }',
                /* 7*/ '#endregion',
                /* 8*/ '',
            ], [r(2, 7, -1, true), r(3, 6, 0)], false, markers);
        });
        test('Empty Regions', () => {
            assertRanges([
                /* 1*/ 'var x;',
                /* 2*/ '#region',
                /* 3*/ '#endregion',
                /* 4*/ '#region',
                /* 5*/ '',
                /* 6*/ '#endregion',
                /* 7*/ 'var y;',
            ], [r(2, 3, -1, true), r(4, 6, -1, true)], false, markers);
        });
        test('Nested Regions', () => {
            assertRanges([
                /* 1*/ 'var x;',
                /* 2*/ '#region',
                /* 3*/ '#region',
                /* 4*/ '',
                /* 5*/ '#endregion',
                /* 6*/ '#endregion',
                /* 7*/ 'var y;',
            ], [r(2, 6, -1, true), r(3, 5, 0, true)], false, markers);
        });
        test('Nested Regions 2', () => {
            assertRanges([
                /* 1*/ 'class A {',
                /* 2*/ '  #region',
                /* 3*/ '',
                /* 4*/ '  #region',
                /* 5*/ '',
                /* 6*/ '  #endregion',
                /* 7*/ '  // comment',
                /* 8*/ '  #endregion',
                /* 9*/ '}',
            ], [r(1, 8, -1), r(2, 8, 0, true), r(4, 6, 1, true)], false, markers);
        });
        test('Incomplete Regions', () => {
            assertRanges([
                /* 1*/ 'class A {',
                /* 2*/ '#region',
                /* 3*/ '  // comment',
                /* 4*/ '}',
            ], [r(2, 3, -1)], false, markers);
        });
        test('Incomplete Regions 2', () => {
            assertRanges([
                /* 1*/ '',
                /* 2*/ '#region',
                /* 3*/ '#region',
                /* 4*/ '#region',
                /* 5*/ '  // comment',
                /* 6*/ '#endregion',
                /* 7*/ '#endregion',
                /* 8*/ ' // hello',
            ], [r(3, 7, -1, true), r(4, 6, 0, true)], false, markers);
        });
        test('Indented region before', () => {
            assertRanges([
                /* 1*/ 'if (x)',
                /* 2*/ '  return;',
                /* 3*/ '',
                /* 4*/ '#region',
                /* 5*/ '  // comment',
                /* 6*/ '#endregion',
            ], [r(1, 3, -1), r(4, 6, -1, true)], false, markers);
        });
        test('Indented region before 2', () => {
            assertRanges([
                /* 1*/ 'if (x)',
                /* 2*/ '  log();',
                /* 3*/ '',
                /* 4*/ '    #region',
                /* 5*/ '      // comment',
                /* 6*/ '    #endregion',
            ], [r(1, 6, -1), r(2, 6, 0), r(4, 6, 1, true)], false, markers);
        });
        test('Indented region in-between', () => {
            assertRanges([
                /* 1*/ '#region',
                /* 2*/ '  // comment',
                /* 3*/ '  if (x)',
                /* 4*/ '    return;',
                /* 5*/ '',
                /* 6*/ '#endregion',
            ], [r(1, 6, -1, true), r(3, 5, 0)], false, markers);
        });
        test('Indented region after', () => {
            assertRanges([
                /* 1*/ '#region',
                /* 2*/ '  // comment',
                /* 3*/ '',
                /* 4*/ '#endregion',
                /* 5*/ '  if (x)',
                /* 6*/ '    return;',
            ], [r(1, 4, -1, true), r(5, 6, -1)], false, markers);
        });
        test('With off-side', () => {
            assertRanges([
                /* 1*/ '#region',
                /* 2*/ '  ',
                /* 3*/ '',
                /* 4*/ '#endregion',
                /* 5*/ '',
            ], [r(1, 4, -1, true)], true, markers);
        });
        test('Nested with off-side', () => {
            assertRanges([
                /* 1*/ '#region',
                /* 2*/ '  ',
                /* 3*/ '#region',
                /* 4*/ '',
                /* 5*/ '#endregion',
                /* 6*/ '',
                /* 7*/ '#endregion',
                /* 8*/ '',
            ], [r(1, 7, -1, true), r(3, 5, 0, true)], true, markers);
        });
        test('Issue 35981', () => {
            assertRanges([
                /* 1*/ 'function thisFoldsToEndOfPage() {',
                /* 2*/ '  const variable = []',
                /* 3*/ '    // #region',
                /* 4*/ '    .reduce((a, b) => a,[]);',
                /* 5*/ '}',
                /* 6*/ '',
                /* 7*/ 'function thisFoldsProperly() {',
                /* 8*/ '  const foo = "bar"',
                /* 9*/ '}',
            ], [r(1, 4, -1), r(2, 4, 0), r(7, 8, -1)], false, markers);
        });
        test('Misspelled Markers', () => {
            assertRanges([
                /* 1*/ '#Region',
                /* 2*/ '#endregion',
                /* 3*/ '#regionsandmore',
                /* 4*/ '#endregion',
                /* 5*/ '#region',
                /* 6*/ '#end region',
                /* 7*/ '#region',
                /* 8*/ '#endregionff',
            ], [], true, markers);
        });
        test('Issue 79359', () => {
            assertRanges([
                /* 1*/ '#region',
                /* 2*/ '',
                /* 3*/ 'class A',
                /* 4*/ '  foo',
                /* 5*/ '',
                /* 6*/ 'class A',
                /* 7*/ '  foo',
                /* 8*/ '',
                /* 9*/ '#endregion',
            ], [r(1, 9, -1, true), r(3, 4, 0), r(6, 7, 0)], true, markers);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZW50UmFuZ2VQcm92aWRlci50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvZm9sZGluZy90ZXN0L2Jyb3dzZXIvaW5kZW50UmFuZ2VQcm92aWRlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBYWhHLFNBQVMsWUFBWSxDQUFDLEtBQWUsRUFBRSxRQUErQixFQUFFLE9BQWdCLEVBQUUsT0FBd0I7UUFDakgsTUFBTSxLQUFLLEdBQUcsSUFBQSwrQkFBZSxFQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNoRCxNQUFNLE1BQU0sR0FBRyxJQUFBLG1DQUFhLEVBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUV0RCxNQUFNLFlBQVksR0FBMEIsRUFBRSxDQUFDO1FBQy9DLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3ZDLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDeEc7UUFDRCxNQUFNLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMvQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDakIsQ0FBQztJQUVELFNBQVMsQ0FBQyxDQUFDLGVBQXVCLEVBQUUsYUFBcUIsRUFBRSxXQUFtQixFQUFFLE1BQU0sR0FBRyxLQUFLO1FBQzdGLE9BQU8sRUFBRSxlQUFlLEVBQUUsYUFBYSxFQUFFLFdBQVcs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