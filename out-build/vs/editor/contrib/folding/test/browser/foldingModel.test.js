define(["require", "exports", "assert", "vs/base/common/strings", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/model/textModel", "vs/editor/contrib/folding/browser/foldingModel", "vs/editor/contrib/folding/browser/indentRangeProvider", "vs/editor/test/common/testTextModel"], function (require, exports, assert, strings_1, editOperation_1, position_1, range_1, textModel_1, foldingModel_1, indentRangeProvider_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$50b = void 0;
    class $50b {
        static { this.a = textModel_1.$RC.register({
            description: 'test',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            linesDecorationsClassName: 'folding'
        }); }
        static { this.b = textModel_1.$RC.register({
            description: 'test',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            linesDecorationsClassName: 'folding'
        }); }
        static { this.c = textModel_1.$RC.register({
            description: 'test',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            linesDecorationsClassName: 'folding'
        }); }
        constructor(e) {
            this.e = e;
        }
        getDecorationOption(isCollapsed, isHidden) {
            if (isHidden) {
                return $50b.c;
            }
            if (isCollapsed) {
                return $50b.a;
            }
            return $50b.b;
        }
        changeDecorations(callback) {
            return this.e.changeDecorations(callback);
        }
        removeDecorations(decorationIds) {
            this.e.changeDecorations((changeAccessor) => {
                changeAccessor.deltaDecorations(decorationIds, []);
            });
        }
        getDecorations() {
            const decorations = this.e.getAllDecorations();
            const res = [];
            for (const decoration of decorations) {
                if (decoration.options === $50b.c) {
                    res.push({ line: decoration.range.startLineNumber, type: 'hidden' });
                }
                else if (decoration.options === $50b.a) {
                    res.push({ line: decoration.range.startLineNumber, type: 'collapsed' });
                }
                else if (decoration.options === $50b.b) {
                    res.push({ line: decoration.range.startLineNumber, type: 'expanded' });
                }
            }
            return res;
        }
    }
    exports.$50b = $50b;
    suite('Folding Model', () => {
        function r(startLineNumber, endLineNumber, isCollapsed = false) {
            return { startLineNumber, endLineNumber, isCollapsed };
        }
        function d(line, type) {
            return { line, type };
        }
        function assertRegion(actual, expected, message) {
            assert.strictEqual(!!actual, !!expected, message);
            if (actual && expected) {
                assert.strictEqual(actual.startLineNumber, expected.startLineNumber, message);
                assert.strictEqual(actual.endLineNumber, expected.endLineNumber, message);
                assert.strictEqual(actual.isCollapsed, expected.isCollapsed, message);
            }
        }
        function assertFoldedRanges(foldingModel, expectedRegions, message) {
            const actualRanges = [];
            const actual = foldingModel.regions;
            for (let i = 0; i < actual.length; i++) {
                if (actual.isCollapsed(i)) {
                    actualRanges.push(r(actual.getStartLineNumber(i), actual.getEndLineNumber(i)));
                }
            }
            assert.deepStrictEqual(actualRanges, expectedRegions, message);
        }
        function assertRanges(foldingModel, expectedRegions, message) {
            const actualRanges = [];
            const actual = foldingModel.regions;
            for (let i = 0; i < actual.length; i++) {
                actualRanges.push(r(actual.getStartLineNumber(i), actual.getEndLineNumber(i), actual.isCollapsed(i)));
            }
            assert.deepStrictEqual(actualRanges, expectedRegions, message);
        }
        function assertDecorations(foldingModel, expectedDecoration, message) {
            const decorationProvider = foldingModel.decorationProvider;
            assert.deepStrictEqual(decorationProvider.getDecorations(), expectedDecoration, message);
        }
        function assertRegions(actual, expectedRegions, message) {
            assert.deepStrictEqual(actual.map(r => ({ startLineNumber: r.startLineNumber, endLineNumber: r.endLineNumber, isCollapsed: r.isCollapsed })), expectedRegions, message);
        }
        test('getRegionAtLine', () => {
            const lines = [
                /* 1*/ '/**',
                /* 2*/ ' * Comment',
                /* 3*/ ' */',
                /* 4*/ 'class A {',
                /* 5*/ '  void foo() {',
                /* 6*/ '    // comment {',
                /* 7*/ '  }',
                /* 8*/ '}'
            ];
            const textModel = (0, testTextModel_1.$O0b)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.$c8(textModel, new $50b(textModel));
                const ranges = (0, indentRangeProvider_1.$r8)(textModel, false, undefined);
                foldingModel.update(ranges);
                const r1 = r(1, 3, false);
                const r2 = r(4, 7, false);
                const r3 = r(5, 6, false);
                assertRanges(foldingModel, [r1, r2, r3]);
                assertRegion(foldingModel.getRegionAtLine(1), r1, '1');
                assertRegion(foldingModel.getRegionAtLine(2), r1, '2');
                assertRegion(foldingModel.getRegionAtLine(3), r1, '3');
                assertRegion(foldingModel.getRegionAtLine(4), r2, '4');
                assertRegion(foldingModel.getRegionAtLine(5), r3, '5');
                assertRegion(foldingModel.getRegionAtLine(6), r3, '5');
                assertRegion(foldingModel.getRegionAtLine(7), r2, '6');
                assertRegion(foldingModel.getRegionAtLine(8), null, '7');
            }
            finally {
                textModel.dispose();
            }
        });
        test('collapse', () => {
            const lines = [
                /* 1*/ '/**',
                /* 2*/ ' * Comment',
                /* 3*/ ' */',
                /* 4*/ 'class A {',
                /* 5*/ '  void foo() {',
                /* 6*/ '    // comment {',
                /* 7*/ '  }',
                /* 8*/ '}'
            ];
            const textModel = (0, testTextModel_1.$O0b)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.$c8(textModel, new $50b(textModel));
                const ranges = (0, indentRangeProvider_1.$r8)(textModel, false, undefined);
                foldingModel.update(ranges);
                const r1 = r(1, 3, false);
                const r2 = r(4, 7, false);
                const r3 = r(5, 6, false);
                assertRanges(foldingModel, [r1, r2, r3]);
                foldingModel.toggleCollapseState([foldingModel.getRegionAtLine(1)]);
                foldingModel.update(ranges);
                assertRanges(foldingModel, [r(1, 3, true), r2, r3]);
                foldingModel.toggleCollapseState([foldingModel.getRegionAtLine(5)]);
                foldingModel.update(ranges);
                assertRanges(foldingModel, [r(1, 3, true), r2, r(5, 6, true)]);
                foldingModel.toggleCollapseState([foldingModel.getRegionAtLine(7)]);
                foldingModel.update(ranges);
                assertRanges(foldingModel, [r(1, 3, true), r(4, 7, true), r(5, 6, true)]);
                textModel.dispose();
            }
            finally {
                textModel.dispose();
            }
        });
        test('update', () => {
            const lines = [
                /* 1*/ '/**',
                /* 2*/ ' * Comment',
                /* 3*/ ' */',
                /* 4*/ 'class A {',
                /* 5*/ '  void foo() {',
                /* 6*/ '    // comment {',
                /* 7*/ '  }',
                /* 8*/ '}'
            ];
            const textModel = (0, testTextModel_1.$O0b)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.$c8(textModel, new $50b(textModel));
                const ranges = (0, indentRangeProvider_1.$r8)(textModel, false, undefined);
                foldingModel.update(ranges);
                const r1 = r(1, 3, false);
                const r2 = r(4, 7, false);
                const r3 = r(5, 6, false);
                assertRanges(foldingModel, [r1, r2, r3]);
                foldingModel.toggleCollapseState([foldingModel.getRegionAtLine(2), foldingModel.getRegionAtLine(5)]);
                textModel.applyEdits([editOperation_1.$ls.insert(new position_1.$js(4, 1), '//hello\n')]);
                foldingModel.update((0, indentRangeProvider_1.$r8)(textModel, false, undefined));
                assertRanges(foldingModel, [r(1, 3, true), r(5, 8, false), r(6, 7, true)]);
            }
            finally {
                textModel.dispose();
            }
        });
        test('delete', () => {
            const lines = [
                /* 1*/ 'function foo() {',
                /* 2*/ '  switch (x) {',
                /* 3*/ '    case 1:',
                /* 4*/ '      //hello1',
                /* 5*/ '      break;',
                /* 6*/ '    case 2:',
                /* 7*/ '      //hello2',
                /* 8*/ '      break;',
                /* 9*/ '    case 3:',
                /* 10*/ '      //hello3',
                /* 11*/ '      break;',
                /* 12*/ '  }',
                /* 13*/ '}'
            ];
            const textModel = (0, testTextModel_1.$O0b)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.$c8(textModel, new $50b(textModel));
                const ranges = (0, indentRangeProvider_1.$r8)(textModel, false, undefined);
                foldingModel.update(ranges);
                const r1 = r(1, 12, false);
                const r2 = r(2, 11, false);
                const r3 = r(3, 5, false);
                const r4 = r(6, 8, false);
                const r5 = r(9, 11, false);
                assertRanges(foldingModel, [r1, r2, r3, r4, r5]);
                foldingModel.toggleCollapseState([foldingModel.getRegionAtLine(6)]);
                textModel.applyEdits([editOperation_1.$ls.delete(new range_1.$ks(6, 11, 9, 0))]);
                foldingModel.update((0, indentRangeProvider_1.$r8)(textModel, false, undefined));
                assertRanges(foldingModel, [r(1, 9, false), r(2, 8, false), r(3, 5, false), r(6, 8, false)]);
            }
            finally {
                textModel.dispose();
            }
        });
        test('getRegionsInside', () => {
            const lines = [
                /* 1*/ '/**',
                /* 2*/ ' * Comment',
                /* 3*/ ' */',
                /* 4*/ 'class A {',
                /* 5*/ '  void foo() {',
                /* 6*/ '    // comment {',
                /* 7*/ '  }',
                /* 8*/ '}'
            ];
            const textModel = (0, testTextModel_1.$O0b)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.$c8(textModel, new $50b(textModel));
                const ranges = (0, indentRangeProvider_1.$r8)(textModel, false, undefined);
                foldingModel.update(ranges);
                const r1 = r(1, 3, false);
                const r2 = r(4, 7, false);
                const r3 = r(5, 6, false);
                assertRanges(foldingModel, [r1, r2, r3]);
                const region1 = foldingModel.getRegionAtLine(r1.startLineNumber);
                const region2 = foldingModel.getRegionAtLine(r2.startLineNumber);
                const region3 = foldingModel.getRegionAtLine(r3.startLineNumber);
                assertRegions(foldingModel.getRegionsInside(null), [r1, r2, r3], '1');
                assertRegions(foldingModel.getRegionsInside(region1), [], '2');
                assertRegions(foldingModel.getRegionsInside(region2), [r3], '3');
                assertRegions(foldingModel.getRegionsInside(region3), [], '4');
            }
            finally {
                textModel.dispose();
            }
        });
        test('getRegionsInsideWithLevel', () => {
            const lines = [
                /* 1*/ '//#region',
                /* 2*/ '//#endregion',
                /* 3*/ 'class A {',
                /* 4*/ '  void foo() {',
                /* 5*/ '    if (true) {',
                /* 6*/ '        return;',
                /* 7*/ '    }',
                /* 8*/ '    if (true) {',
                /* 9*/ '      return;',
                /* 10*/ '    }',
                /* 11*/ '  }',
                /* 12*/ '}'
            ];
            const textModel = (0, testTextModel_1.$O0b)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.$c8(textModel, new $50b(textModel));
                const ranges = (0, indentRangeProvider_1.$r8)(textModel, false, { start: /^\/\/#region$/, end: /^\/\/#endregion$/ });
                foldingModel.update(ranges);
                const r1 = r(1, 2, false);
                const r2 = r(3, 11, false);
                const r3 = r(4, 10, false);
                const r4 = r(5, 6, false);
                const r5 = r(8, 9, false);
                const region1 = foldingModel.getRegionAtLine(r1.startLineNumber);
                const region2 = foldingModel.getRegionAtLine(r2.startLineNumber);
                const region3 = foldingModel.getRegionAtLine(r3.startLineNumber);
                assertRanges(foldingModel, [r1, r2, r3, r4, r5]);
                assertRegions(foldingModel.getRegionsInside(null, (r, level) => level === 1), [r1, r2], '1');
                assertRegions(foldingModel.getRegionsInside(null, (r, level) => level === 2), [r3], '2');
                assertRegions(foldingModel.getRegionsInside(null, (r, level) => level === 3), [r4, r5], '3');
                assertRegions(foldingModel.getRegionsInside(region2, (r, level) => level === 1), [r3], '4');
                assertRegions(foldingModel.getRegionsInside(region2, (r, level) => level === 2), [r4, r5], '5');
                assertRegions(foldingModel.getRegionsInside(region3, (r, level) => level === 1), [r4, r5], '6');
                assertRegions(foldingModel.getRegionsInside(region2, (r, level) => r.hidesLine(9)), [r3, r5], '7');
                assertRegions(foldingModel.getRegionsInside(region1, (r, level) => level === 1), [], '8');
            }
            finally {
                textModel.dispose();
            }
        });
        test('getRegionAtLine2', () => {
            const lines = [
                /* 1*/ '//#region',
                /* 2*/ 'class A {',
                /* 3*/ '  void foo() {',
                /* 4*/ '    if (true) {',
                /* 5*/ '      //hello',
                /* 6*/ '    }',
                /* 7*/ '',
                /* 8*/ '  }',
                /* 9*/ '}',
                /* 10*/ '//#endregion',
                /* 11*/ ''
            ];
            const textModel = (0, testTextModel_1.$O0b)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.$c8(textModel, new $50b(textModel));
                const ranges = (0, indentRangeProvider_1.$r8)(textModel, false, { start: /^\/\/#region$/, end: /^\/\/#endregion$/ });
                foldingModel.update(ranges);
                const r1 = r(1, 10, false);
                const r2 = r(2, 8, false);
                const r3 = r(3, 7, false);
                const r4 = r(4, 5, false);
                assertRanges(foldingModel, [r1, r2, r3, r4]);
                assertRegions(foldingModel.getAllRegionsAtLine(1), [r1], '1');
                assertRegions(foldingModel.getAllRegionsAtLine(2), [r1, r2].reverse(), '2');
                assertRegions(foldingModel.getAllRegionsAtLine(3), [r1, r2, r3].reverse(), '3');
                assertRegions(foldingModel.getAllRegionsAtLine(4), [r1, r2, r3, r4].reverse(), '4');
                assertRegions(foldingModel.getAllRegionsAtLine(5), [r1, r2, r3, r4].reverse(), '5');
                assertRegions(foldingModel.getAllRegionsAtLine(6), [r1, r2, r3].reverse(), '6');
                assertRegions(foldingModel.getAllRegionsAtLine(7), [r1, r2, r3].reverse(), '7');
                assertRegions(foldingModel.getAllRegionsAtLine(8), [r1, r2].reverse(), '8');
                assertRegions(foldingModel.getAllRegionsAtLine(9), [r1], '9');
                assertRegions(foldingModel.getAllRegionsAtLine(10), [r1], '10');
                assertRegions(foldingModel.getAllRegionsAtLine(11), [], '10');
            }
            finally {
                textModel.dispose();
            }
        });
        test('setCollapseStateRecursivly', () => {
            const lines = [
                /* 1*/ '//#region',
                /* 2*/ '//#endregion',
                /* 3*/ 'class A {',
                /* 4*/ '  void foo() {',
                /* 5*/ '    if (true) {',
                /* 6*/ '        return;',
                /* 7*/ '    }',
                /* 8*/ '',
                /* 9*/ '    if (true) {',
                /* 10*/ '      return;',
                /* 11*/ '    }',
                /* 12*/ '  }',
                /* 13*/ '}'
            ];
            const textModel = (0, testTextModel_1.$O0b)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.$c8(textModel, new $50b(textModel));
                const ranges = (0, indentRangeProvider_1.$r8)(textModel, false, { start: /^\/\/#region$/, end: /^\/\/#endregion$/ });
                foldingModel.update(ranges);
                const r1 = r(1, 2, false);
                const r2 = r(3, 12, false);
                const r3 = r(4, 11, false);
                const r4 = r(5, 6, false);
                const r5 = r(9, 10, false);
                assertRanges(foldingModel, [r1, r2, r3, r4, r5]);
                (0, foldingModel_1.$e8)(foldingModel, true, Number.MAX_VALUE, [4]);
                assertFoldedRanges(foldingModel, [r3, r4, r5], '1');
                (0, foldingModel_1.$e8)(foldingModel, false, Number.MAX_VALUE, [8]);
                assertFoldedRanges(foldingModel, [], '2');
                (0, foldingModel_1.$e8)(foldingModel, true, Number.MAX_VALUE, [12]);
                assertFoldedRanges(foldingModel, [r2, r3, r4, r5], '1');
                (0, foldingModel_1.$e8)(foldingModel, false, Number.MAX_VALUE, [7]);
                assertFoldedRanges(foldingModel, [r2], '1');
                (0, foldingModel_1.$e8)(foldingModel, false);
                assertFoldedRanges(foldingModel, [], '1');
                (0, foldingModel_1.$e8)(foldingModel, true);
                assertFoldedRanges(foldingModel, [r1, r2, r3, r4, r5], '1');
            }
            finally {
                textModel.dispose();
            }
        });
        test('setCollapseStateAtLevel', () => {
            const lines = [
                /* 1*/ '//#region',
                /* 2*/ '//#endregion',
                /* 3*/ 'class A {',
                /* 4*/ '  void foo() {',
                /* 5*/ '    if (true) {',
                /* 6*/ '        return;',
                /* 7*/ '    }',
                /* 8*/ '',
                /* 9*/ '    if (true) {',
                /* 10*/ '      return;',
                /* 11*/ '    }',
                /* 12*/ '  }',
                /* 13*/ '  //#region',
                /* 14*/ '  const bar = 9;',
                /* 15*/ '  //#endregion',
                /* 16*/ '}'
            ];
            const textModel = (0, testTextModel_1.$O0b)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.$c8(textModel, new $50b(textModel));
                const ranges = (0, indentRangeProvider_1.$r8)(textModel, false, { start: /^\s*\/\/#region$/, end: /^\s*\/\/#endregion$/ });
                foldingModel.update(ranges);
                const r1 = r(1, 2, false);
                const r2 = r(3, 15, false);
                const r3 = r(4, 11, false);
                const r4 = r(5, 6, false);
                const r5 = r(9, 10, false);
                const r6 = r(13, 15, false);
                assertRanges(foldingModel, [r1, r2, r3, r4, r5, r6]);
                (0, foldingModel_1.$h8)(foldingModel, 1, true, []);
                assertFoldedRanges(foldingModel, [r1, r2], '1');
                (0, foldingModel_1.$h8)(foldingModel, 1, false, [5]);
                assertFoldedRanges(foldingModel, [r2], '2');
                (0, foldingModel_1.$h8)(foldingModel, 1, false, [1]);
                assertFoldedRanges(foldingModel, [], '3');
                (0, foldingModel_1.$h8)(foldingModel, 2, true, []);
                assertFoldedRanges(foldingModel, [r3, r6], '4');
                (0, foldingModel_1.$h8)(foldingModel, 2, false, [5, 6]);
                assertFoldedRanges(foldingModel, [r3], '5');
                (0, foldingModel_1.$h8)(foldingModel, 3, true, [4, 9]);
                assertFoldedRanges(foldingModel, [r3, r4], '6');
                (0, foldingModel_1.$h8)(foldingModel, 3, false, [4, 9]);
                assertFoldedRanges(foldingModel, [r3], '7');
            }
            finally {
                textModel.dispose();
            }
        });
        test('setCollapseStateLevelsDown', () => {
            const lines = [
                /* 1*/ '//#region',
                /* 2*/ '//#endregion',
                /* 3*/ 'class A {',
                /* 4*/ '  void foo() {',
                /* 5*/ '    if (true) {',
                /* 6*/ '        return;',
                /* 7*/ '    }',
                /* 8*/ '',
                /* 9*/ '    if (true) {',
                /* 10*/ '      return;',
                /* 11*/ '    }',
                /* 12*/ '  }',
                /* 13*/ '}'
            ];
            const textModel = (0, testTextModel_1.$O0b)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.$c8(textModel, new $50b(textModel));
                const ranges = (0, indentRangeProvider_1.$r8)(textModel, false, { start: /^\/\/#region$/, end: /^\/\/#endregion$/ });
                foldingModel.update(ranges);
                const r1 = r(1, 2, false);
                const r2 = r(3, 12, false);
                const r3 = r(4, 11, false);
                const r4 = r(5, 6, false);
                const r5 = r(9, 10, false);
                assertRanges(foldingModel, [r1, r2, r3, r4, r5]);
                (0, foldingModel_1.$e8)(foldingModel, true, 1, [4]);
                assertFoldedRanges(foldingModel, [r3], '1');
                (0, foldingModel_1.$e8)(foldingModel, true, 2, [4]);
                assertFoldedRanges(foldingModel, [r3, r4, r5], '2');
                (0, foldingModel_1.$e8)(foldingModel, false, 2, [3]);
                assertFoldedRanges(foldingModel, [r4, r5], '3');
                (0, foldingModel_1.$e8)(foldingModel, false, 2, [2]);
                assertFoldedRanges(foldingModel, [r4, r5], '4');
                (0, foldingModel_1.$e8)(foldingModel, true, 4, [2]);
                assertFoldedRanges(foldingModel, [r1, r4, r5], '5');
                (0, foldingModel_1.$e8)(foldingModel, false, 4, [2, 3]);
                assertFoldedRanges(foldingModel, [], '6');
            }
            finally {
                textModel.dispose();
            }
        });
        test('setCollapseStateLevelsUp', () => {
            const lines = [
                /* 1*/ '//#region',
                /* 2*/ '//#endregion',
                /* 3*/ 'class A {',
                /* 4*/ '  void foo() {',
                /* 5*/ '    if (true) {',
                /* 6*/ '        return;',
                /* 7*/ '    }',
                /* 8*/ '',
                /* 9*/ '    if (true) {',
                /* 10*/ '      return;',
                /* 11*/ '    }',
                /* 12*/ '  }',
                /* 13*/ '}'
            ];
            const textModel = (0, testTextModel_1.$O0b)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.$c8(textModel, new $50b(textModel));
                const ranges = (0, indentRangeProvider_1.$r8)(textModel, false, { start: /^\/\/#region$/, end: /^\/\/#endregion$/ });
                foldingModel.update(ranges);
                const r1 = r(1, 2, false);
                const r2 = r(3, 12, false);
                const r3 = r(4, 11, false);
                const r4 = r(5, 6, false);
                const r5 = r(9, 10, false);
                assertRanges(foldingModel, [r1, r2, r3, r4, r5]);
                (0, foldingModel_1.$f8)(foldingModel, true, 1, [4]);
                assertFoldedRanges(foldingModel, [r3], '1');
                (0, foldingModel_1.$f8)(foldingModel, true, 2, [4]);
                assertFoldedRanges(foldingModel, [r2, r3], '2');
                (0, foldingModel_1.$f8)(foldingModel, false, 4, [1, 3, 4]);
                assertFoldedRanges(foldingModel, [], '3');
                (0, foldingModel_1.$f8)(foldingModel, true, 2, [10]);
                assertFoldedRanges(foldingModel, [r3, r5], '4');
            }
            finally {
                textModel.dispose();
            }
        });
        test('setCollapseStateUp', () => {
            const lines = [
                /* 1*/ '//#region',
                /* 2*/ '//#endregion',
                /* 3*/ 'class A {',
                /* 4*/ '  void foo() {',
                /* 5*/ '    if (true) {',
                /* 6*/ '        return;',
                /* 7*/ '    }',
                /* 8*/ '',
                /* 9*/ '    if (true) {',
                /* 10*/ '      return;',
                /* 11*/ '    }',
                /* 12*/ '  }',
                /* 13*/ '}'
            ];
            const textModel = (0, testTextModel_1.$O0b)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.$c8(textModel, new $50b(textModel));
                const ranges = (0, indentRangeProvider_1.$r8)(textModel, false, { start: /^\/\/#region$/, end: /^\/\/#endregion$/ });
                foldingModel.update(ranges);
                const r1 = r(1, 2, false);
                const r2 = r(3, 12, false);
                const r3 = r(4, 11, false);
                const r4 = r(5, 6, false);
                const r5 = r(9, 10, false);
                assertRanges(foldingModel, [r1, r2, r3, r4, r5]);
                (0, foldingModel_1.$g8)(foldingModel, true, [5]);
                assertFoldedRanges(foldingModel, [r4], '1');
                (0, foldingModel_1.$g8)(foldingModel, true, [5]);
                assertFoldedRanges(foldingModel, [r3, r4], '2');
                (0, foldingModel_1.$g8)(foldingModel, true, [4]);
                assertFoldedRanges(foldingModel, [r2, r3, r4], '2');
            }
            finally {
                textModel.dispose();
            }
        });
        test('setCollapseStateForMatchingLines', () => {
            const lines = [
                /* 1*/ '/**',
                /* 2*/ ' * the class',
                /* 3*/ ' */',
                /* 4*/ 'class A {',
                /* 5*/ '  /**',
                /* 6*/ '   * the foo',
                /* 7*/ '   */',
                /* 8*/ '  void foo() {',
                /* 9*/ '    /*',
                /* 10*/ '     * the comment',
                /* 11*/ '     */',
                /* 12*/ '  }',
                /* 13*/ '}'
            ];
            const textModel = (0, testTextModel_1.$O0b)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.$c8(textModel, new $50b(textModel));
                const ranges = (0, indentRangeProvider_1.$r8)(textModel, false, { start: /^\/\/#region$/, end: /^\/\/#endregion$/ });
                foldingModel.update(ranges);
                const r1 = r(1, 3, false);
                const r2 = r(4, 12, false);
                const r3 = r(5, 7, false);
                const r4 = r(8, 11, false);
                const r5 = r(9, 11, false);
                assertRanges(foldingModel, [r1, r2, r3, r4, r5]);
                const regExp = new RegExp('^\\s*' + (0, strings_1.$qe)('/*'));
                (0, foldingModel_1.$j8)(foldingModel, regExp, true);
                assertFoldedRanges(foldingModel, [r1, r3, r5], '1');
            }
            finally {
                textModel.dispose();
            }
        });
        test('setCollapseStateForRest', () => {
            const lines = [
                /* 1*/ '//#region',
                /* 2*/ '//#endregion',
                /* 3*/ 'class A {',
                /* 4*/ '  void foo() {',
                /* 5*/ '    if (true) {',
                /* 6*/ '        return;',
                /* 7*/ '    }',
                /* 8*/ '',
                /* 9*/ '    if (true) {',
                /* 10*/ '      return;',
                /* 11*/ '    }',
                /* 12*/ '  }',
                /* 13*/ '}'
            ];
            const textModel = (0, testTextModel_1.$O0b)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.$c8(textModel, new $50b(textModel));
                const ranges = (0, indentRangeProvider_1.$r8)(textModel, false, { start: /^\/\/#region$/, end: /^\/\/#endregion$/ });
                foldingModel.update(ranges);
                const r1 = r(1, 2, false);
                const r2 = r(3, 12, false);
                const r3 = r(4, 11, false);
                const r4 = r(5, 6, false);
                const r5 = r(9, 10, false);
                assertRanges(foldingModel, [r1, r2, r3, r4, r5]);
                (0, foldingModel_1.$i8)(foldingModel, true, [5]);
                assertFoldedRanges(foldingModel, [r1, r5], '1');
                (0, foldingModel_1.$i8)(foldingModel, false, [5]);
                assertFoldedRanges(foldingModel, [], '2');
                (0, foldingModel_1.$i8)(foldingModel, true, [1]);
                assertFoldedRanges(foldingModel, [r2, r3, r4, r5], '3');
                (0, foldingModel_1.$i8)(foldingModel, true, [3]);
                assertFoldedRanges(foldingModel, [r1, r2, r3, r4, r5], '3');
            }
            finally {
                textModel.dispose();
            }
        });
        test('folding decoration', () => {
            const lines = [
                /* 1*/ 'class A {',
                /* 2*/ '  void foo() {',
                /* 3*/ '    if (true) {',
                /* 4*/ '      hoo();',
                /* 5*/ '    }',
                /* 6*/ '  }',
                /* 7*/ '}'
            ];
            const textModel = (0, testTextModel_1.$O0b)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.$c8(textModel, new $50b(textModel));
                const ranges = (0, indentRangeProvider_1.$r8)(textModel, false, undefined);
                foldingModel.update(ranges);
                const r1 = r(1, 6, false);
                const r2 = r(2, 5, false);
                const r3 = r(3, 4, false);
                assertRanges(foldingModel, [r1, r2, r3]);
                assertDecorations(foldingModel, [d(1, 'expanded'), d(2, 'expanded'), d(3, 'expanded')]);
                foldingModel.toggleCollapseState([foldingModel.getRegionAtLine(2)]);
                assertRanges(foldingModel, [r1, r(2, 5, true), r3]);
                assertDecorations(foldingModel, [d(1, 'expanded'), d(2, 'collapsed'), d(3, 'hidden')]);
                foldingModel.update(ranges);
                assertRanges(foldingModel, [r1, r(2, 5, true), r3]);
                assertDecorations(foldingModel, [d(1, 'expanded'), d(2, 'collapsed'), d(3, 'hidden')]);
                foldingModel.toggleCollapseState([foldingModel.getRegionAtLine(1)]);
                assertRanges(foldingModel, [r(1, 6, true), r(2, 5, true), r3]);
                assertDecorations(foldingModel, [d(1, 'collapsed'), d(2, 'hidden'), d(3, 'hidden')]);
                foldingModel.update(ranges);
                assertRanges(foldingModel, [r(1, 6, true), r(2, 5, true), r3]);
                assertDecorations(foldingModel, [d(1, 'collapsed'), d(2, 'hidden'), d(3, 'hidden')]);
                foldingModel.toggleCollapseState([foldingModel.getRegionAtLine(1), foldingModel.getRegionAtLine(3)]);
                assertRanges(foldingModel, [r1, r(2, 5, true), r(3, 4, true)]);
                assertDecorations(foldingModel, [d(1, 'expanded'), d(2, 'collapsed'), d(3, 'hidden')]);
                foldingModel.update(ranges);
                assertRanges(foldingModel, [r1, r(2, 5, true), r(3, 4, true)]);
                assertDecorations(foldingModel, [d(1, 'expanded'), d(2, 'collapsed'), d(3, 'hidden')]);
                textModel.dispose();
            }
            finally {
                textModel.dispose();
            }
        });
        test('fold jumping', () => {
            const lines = [
                /* 1*/ 'class A {',
                /* 2*/ '  void foo() {',
                /* 3*/ '    if (1) {',
                /* 4*/ '      a();',
                /* 5*/ '    } else if (2) {',
                /* 6*/ '      if (true) {',
                /* 7*/ '        b();',
                /* 8*/ '      }',
                /* 9*/ '    } else {',
                /* 10*/ '      c();',
                /* 11*/ '    }',
                /* 12*/ '  }',
                /* 13*/ '}'
            ];
            const textModel = (0, testTextModel_1.$O0b)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.$c8(textModel, new $50b(textModel));
                const ranges = (0, indentRangeProvider_1.$r8)(textModel, false, undefined);
                foldingModel.update(ranges);
                const r1 = r(1, 12, false);
                const r2 = r(2, 11, false);
                const r3 = r(3, 4, false);
                const r4 = r(5, 8, false);
                const r5 = r(6, 7, false);
                const r6 = r(9, 10, false);
                assertRanges(foldingModel, [r1, r2, r3, r4, r5, r6]);
                // Test jump to parent.
                assert.strictEqual((0, foldingModel_1.$l8)(7, foldingModel), 6);
                assert.strictEqual((0, foldingModel_1.$l8)(6, foldingModel), 5);
                assert.strictEqual((0, foldingModel_1.$l8)(5, foldingModel), 2);
                assert.strictEqual((0, foldingModel_1.$l8)(2, foldingModel), 1);
                assert.strictEqual((0, foldingModel_1.$l8)(1, foldingModel), null);
                // Test jump to previous.
                assert.strictEqual((0, foldingModel_1.$m8)(10, foldingModel), 9);
                assert.strictEqual((0, foldingModel_1.$m8)(9, foldingModel), 5);
                assert.strictEqual((0, foldingModel_1.$m8)(5, foldingModel), 3);
                assert.strictEqual((0, foldingModel_1.$m8)(3, foldingModel), null);
                // Test when not on a folding region start line.
                assert.strictEqual((0, foldingModel_1.$m8)(4, foldingModel), 3);
                assert.strictEqual((0, foldingModel_1.$m8)(7, foldingModel), 6);
                assert.strictEqual((0, foldingModel_1.$m8)(8, foldingModel), 6);
                // Test jump to next.
                assert.strictEqual((0, foldingModel_1.$n8)(3, foldingModel), 5);
                assert.strictEqual((0, foldingModel_1.$n8)(5, foldingModel), 9);
                assert.strictEqual((0, foldingModel_1.$n8)(9, foldingModel), null);
                // Test when not on a folding region start line.
                assert.strictEqual((0, foldingModel_1.$n8)(4, foldingModel), 5);
                assert.strictEqual((0, foldingModel_1.$n8)(7, foldingModel), 9);
                assert.strictEqual((0, foldingModel_1.$n8)(8, foldingModel), 9);
            }
            finally {
                textModel.dispose();
            }
        });
        test('fold jumping issue #129503', () => {
            const lines = [
                /* 1*/ '',
                /* 2*/ 'if True:',
                /* 3*/ '  print(1)',
                /* 4*/ 'if True:',
                /* 5*/ '  print(1)',
                /* 6*/ ''
            ];
            const textModel = (0, testTextModel_1.$O0b)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.$c8(textModel, new $50b(textModel));
                const ranges = (0, indentRangeProvider_1.$r8)(textModel, false, undefined);
                foldingModel.update(ranges);
                const r1 = r(2, 3, false);
                const r2 = r(4, 6, false);
                assertRanges(foldingModel, [r1, r2]);
                // Test jump to next.
                assert.strictEqual((0, foldingModel_1.$n8)(1, foldingModel), 2);
                assert.strictEqual((0, foldingModel_1.$n8)(2, foldingModel), 4);
                assert.strictEqual((0, foldingModel_1.$n8)(3, foldingModel), 4);
                assert.strictEqual((0, foldingModel_1.$n8)(4, foldingModel), null);
                assert.strictEqual((0, foldingModel_1.$n8)(5, foldingModel), null);
                assert.strictEqual((0, foldingModel_1.$n8)(6, foldingModel), null);
                // Test jump to previous.
                assert.strictEqual((0, foldingModel_1.$m8)(1, foldingModel), null);
                assert.strictEqual((0, foldingModel_1.$m8)(2, foldingModel), null);
                assert.strictEqual((0, foldingModel_1.$m8)(3, foldingModel), 2);
                assert.strictEqual((0, foldingModel_1.$m8)(4, foldingModel), 2);
                assert.strictEqual((0, foldingModel_1.$m8)(5, foldingModel), 4);
                assert.strictEqual((0, foldingModel_1.$m8)(6, foldingModel), 4);
            }
            finally {
                textModel.dispose();
            }
        });
    });
});
//# sourceMappingURL=foldingModel.test.js.map