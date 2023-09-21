define(["require", "exports", "assert", "vs/base/common/strings", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/model/textModel", "vs/editor/contrib/folding/browser/foldingModel", "vs/editor/contrib/folding/browser/indentRangeProvider", "vs/editor/test/common/testTextModel"], function (require, exports, assert, strings_1, editOperation_1, position_1, range_1, textModel_1, foldingModel_1, indentRangeProvider_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestDecorationProvider = void 0;
    class TestDecorationProvider {
        static { this.collapsedDecoration = textModel_1.ModelDecorationOptions.register({
            description: 'test',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            linesDecorationsClassName: 'folding'
        }); }
        static { this.expandedDecoration = textModel_1.ModelDecorationOptions.register({
            description: 'test',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            linesDecorationsClassName: 'folding'
        }); }
        static { this.hiddenDecoration = textModel_1.ModelDecorationOptions.register({
            description: 'test',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            linesDecorationsClassName: 'folding'
        }); }
        constructor(model) {
            this.model = model;
        }
        getDecorationOption(isCollapsed, isHidden) {
            if (isHidden) {
                return TestDecorationProvider.hiddenDecoration;
            }
            if (isCollapsed) {
                return TestDecorationProvider.collapsedDecoration;
            }
            return TestDecorationProvider.expandedDecoration;
        }
        changeDecorations(callback) {
            return this.model.changeDecorations(callback);
        }
        removeDecorations(decorationIds) {
            this.model.changeDecorations((changeAccessor) => {
                changeAccessor.deltaDecorations(decorationIds, []);
            });
        }
        getDecorations() {
            const decorations = this.model.getAllDecorations();
            const res = [];
            for (const decoration of decorations) {
                if (decoration.options === TestDecorationProvider.hiddenDecoration) {
                    res.push({ line: decoration.range.startLineNumber, type: 'hidden' });
                }
                else if (decoration.options === TestDecorationProvider.collapsedDecoration) {
                    res.push({ line: decoration.range.startLineNumber, type: 'collapsed' });
                }
                else if (decoration.options === TestDecorationProvider.expandedDecoration) {
                    res.push({ line: decoration.range.startLineNumber, type: 'expanded' });
                }
            }
            return res;
        }
    }
    exports.TestDecorationProvider = TestDecorationProvider;
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
            const textModel = (0, testTextModel_1.createTextModel)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.FoldingModel(textModel, new TestDecorationProvider(textModel));
                const ranges = (0, indentRangeProvider_1.computeRanges)(textModel, false, undefined);
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
            const textModel = (0, testTextModel_1.createTextModel)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.FoldingModel(textModel, new TestDecorationProvider(textModel));
                const ranges = (0, indentRangeProvider_1.computeRanges)(textModel, false, undefined);
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
            const textModel = (0, testTextModel_1.createTextModel)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.FoldingModel(textModel, new TestDecorationProvider(textModel));
                const ranges = (0, indentRangeProvider_1.computeRanges)(textModel, false, undefined);
                foldingModel.update(ranges);
                const r1 = r(1, 3, false);
                const r2 = r(4, 7, false);
                const r3 = r(5, 6, false);
                assertRanges(foldingModel, [r1, r2, r3]);
                foldingModel.toggleCollapseState([foldingModel.getRegionAtLine(2), foldingModel.getRegionAtLine(5)]);
                textModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(4, 1), '//hello\n')]);
                foldingModel.update((0, indentRangeProvider_1.computeRanges)(textModel, false, undefined));
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
            const textModel = (0, testTextModel_1.createTextModel)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.FoldingModel(textModel, new TestDecorationProvider(textModel));
                const ranges = (0, indentRangeProvider_1.computeRanges)(textModel, false, undefined);
                foldingModel.update(ranges);
                const r1 = r(1, 12, false);
                const r2 = r(2, 11, false);
                const r3 = r(3, 5, false);
                const r4 = r(6, 8, false);
                const r5 = r(9, 11, false);
                assertRanges(foldingModel, [r1, r2, r3, r4, r5]);
                foldingModel.toggleCollapseState([foldingModel.getRegionAtLine(6)]);
                textModel.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(6, 11, 9, 0))]);
                foldingModel.update((0, indentRangeProvider_1.computeRanges)(textModel, false, undefined));
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
            const textModel = (0, testTextModel_1.createTextModel)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.FoldingModel(textModel, new TestDecorationProvider(textModel));
                const ranges = (0, indentRangeProvider_1.computeRanges)(textModel, false, undefined);
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
            const textModel = (0, testTextModel_1.createTextModel)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.FoldingModel(textModel, new TestDecorationProvider(textModel));
                const ranges = (0, indentRangeProvider_1.computeRanges)(textModel, false, { start: /^\/\/#region$/, end: /^\/\/#endregion$/ });
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
            const textModel = (0, testTextModel_1.createTextModel)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.FoldingModel(textModel, new TestDecorationProvider(textModel));
                const ranges = (0, indentRangeProvider_1.computeRanges)(textModel, false, { start: /^\/\/#region$/, end: /^\/\/#endregion$/ });
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
            const textModel = (0, testTextModel_1.createTextModel)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.FoldingModel(textModel, new TestDecorationProvider(textModel));
                const ranges = (0, indentRangeProvider_1.computeRanges)(textModel, false, { start: /^\/\/#region$/, end: /^\/\/#endregion$/ });
                foldingModel.update(ranges);
                const r1 = r(1, 2, false);
                const r2 = r(3, 12, false);
                const r3 = r(4, 11, false);
                const r4 = r(5, 6, false);
                const r5 = r(9, 10, false);
                assertRanges(foldingModel, [r1, r2, r3, r4, r5]);
                (0, foldingModel_1.setCollapseStateLevelsDown)(foldingModel, true, Number.MAX_VALUE, [4]);
                assertFoldedRanges(foldingModel, [r3, r4, r5], '1');
                (0, foldingModel_1.setCollapseStateLevelsDown)(foldingModel, false, Number.MAX_VALUE, [8]);
                assertFoldedRanges(foldingModel, [], '2');
                (0, foldingModel_1.setCollapseStateLevelsDown)(foldingModel, true, Number.MAX_VALUE, [12]);
                assertFoldedRanges(foldingModel, [r2, r3, r4, r5], '1');
                (0, foldingModel_1.setCollapseStateLevelsDown)(foldingModel, false, Number.MAX_VALUE, [7]);
                assertFoldedRanges(foldingModel, [r2], '1');
                (0, foldingModel_1.setCollapseStateLevelsDown)(foldingModel, false);
                assertFoldedRanges(foldingModel, [], '1');
                (0, foldingModel_1.setCollapseStateLevelsDown)(foldingModel, true);
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
            const textModel = (0, testTextModel_1.createTextModel)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.FoldingModel(textModel, new TestDecorationProvider(textModel));
                const ranges = (0, indentRangeProvider_1.computeRanges)(textModel, false, { start: /^\s*\/\/#region$/, end: /^\s*\/\/#endregion$/ });
                foldingModel.update(ranges);
                const r1 = r(1, 2, false);
                const r2 = r(3, 15, false);
                const r3 = r(4, 11, false);
                const r4 = r(5, 6, false);
                const r5 = r(9, 10, false);
                const r6 = r(13, 15, false);
                assertRanges(foldingModel, [r1, r2, r3, r4, r5, r6]);
                (0, foldingModel_1.setCollapseStateAtLevel)(foldingModel, 1, true, []);
                assertFoldedRanges(foldingModel, [r1, r2], '1');
                (0, foldingModel_1.setCollapseStateAtLevel)(foldingModel, 1, false, [5]);
                assertFoldedRanges(foldingModel, [r2], '2');
                (0, foldingModel_1.setCollapseStateAtLevel)(foldingModel, 1, false, [1]);
                assertFoldedRanges(foldingModel, [], '3');
                (0, foldingModel_1.setCollapseStateAtLevel)(foldingModel, 2, true, []);
                assertFoldedRanges(foldingModel, [r3, r6], '4');
                (0, foldingModel_1.setCollapseStateAtLevel)(foldingModel, 2, false, [5, 6]);
                assertFoldedRanges(foldingModel, [r3], '5');
                (0, foldingModel_1.setCollapseStateAtLevel)(foldingModel, 3, true, [4, 9]);
                assertFoldedRanges(foldingModel, [r3, r4], '6');
                (0, foldingModel_1.setCollapseStateAtLevel)(foldingModel, 3, false, [4, 9]);
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
            const textModel = (0, testTextModel_1.createTextModel)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.FoldingModel(textModel, new TestDecorationProvider(textModel));
                const ranges = (0, indentRangeProvider_1.computeRanges)(textModel, false, { start: /^\/\/#region$/, end: /^\/\/#endregion$/ });
                foldingModel.update(ranges);
                const r1 = r(1, 2, false);
                const r2 = r(3, 12, false);
                const r3 = r(4, 11, false);
                const r4 = r(5, 6, false);
                const r5 = r(9, 10, false);
                assertRanges(foldingModel, [r1, r2, r3, r4, r5]);
                (0, foldingModel_1.setCollapseStateLevelsDown)(foldingModel, true, 1, [4]);
                assertFoldedRanges(foldingModel, [r3], '1');
                (0, foldingModel_1.setCollapseStateLevelsDown)(foldingModel, true, 2, [4]);
                assertFoldedRanges(foldingModel, [r3, r4, r5], '2');
                (0, foldingModel_1.setCollapseStateLevelsDown)(foldingModel, false, 2, [3]);
                assertFoldedRanges(foldingModel, [r4, r5], '3');
                (0, foldingModel_1.setCollapseStateLevelsDown)(foldingModel, false, 2, [2]);
                assertFoldedRanges(foldingModel, [r4, r5], '4');
                (0, foldingModel_1.setCollapseStateLevelsDown)(foldingModel, true, 4, [2]);
                assertFoldedRanges(foldingModel, [r1, r4, r5], '5');
                (0, foldingModel_1.setCollapseStateLevelsDown)(foldingModel, false, 4, [2, 3]);
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
            const textModel = (0, testTextModel_1.createTextModel)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.FoldingModel(textModel, new TestDecorationProvider(textModel));
                const ranges = (0, indentRangeProvider_1.computeRanges)(textModel, false, { start: /^\/\/#region$/, end: /^\/\/#endregion$/ });
                foldingModel.update(ranges);
                const r1 = r(1, 2, false);
                const r2 = r(3, 12, false);
                const r3 = r(4, 11, false);
                const r4 = r(5, 6, false);
                const r5 = r(9, 10, false);
                assertRanges(foldingModel, [r1, r2, r3, r4, r5]);
                (0, foldingModel_1.setCollapseStateLevelsUp)(foldingModel, true, 1, [4]);
                assertFoldedRanges(foldingModel, [r3], '1');
                (0, foldingModel_1.setCollapseStateLevelsUp)(foldingModel, true, 2, [4]);
                assertFoldedRanges(foldingModel, [r2, r3], '2');
                (0, foldingModel_1.setCollapseStateLevelsUp)(foldingModel, false, 4, [1, 3, 4]);
                assertFoldedRanges(foldingModel, [], '3');
                (0, foldingModel_1.setCollapseStateLevelsUp)(foldingModel, true, 2, [10]);
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
            const textModel = (0, testTextModel_1.createTextModel)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.FoldingModel(textModel, new TestDecorationProvider(textModel));
                const ranges = (0, indentRangeProvider_1.computeRanges)(textModel, false, { start: /^\/\/#region$/, end: /^\/\/#endregion$/ });
                foldingModel.update(ranges);
                const r1 = r(1, 2, false);
                const r2 = r(3, 12, false);
                const r3 = r(4, 11, false);
                const r4 = r(5, 6, false);
                const r5 = r(9, 10, false);
                assertRanges(foldingModel, [r1, r2, r3, r4, r5]);
                (0, foldingModel_1.setCollapseStateUp)(foldingModel, true, [5]);
                assertFoldedRanges(foldingModel, [r4], '1');
                (0, foldingModel_1.setCollapseStateUp)(foldingModel, true, [5]);
                assertFoldedRanges(foldingModel, [r3, r4], '2');
                (0, foldingModel_1.setCollapseStateUp)(foldingModel, true, [4]);
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
            const textModel = (0, testTextModel_1.createTextModel)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.FoldingModel(textModel, new TestDecorationProvider(textModel));
                const ranges = (0, indentRangeProvider_1.computeRanges)(textModel, false, { start: /^\/\/#region$/, end: /^\/\/#endregion$/ });
                foldingModel.update(ranges);
                const r1 = r(1, 3, false);
                const r2 = r(4, 12, false);
                const r3 = r(5, 7, false);
                const r4 = r(8, 11, false);
                const r5 = r(9, 11, false);
                assertRanges(foldingModel, [r1, r2, r3, r4, r5]);
                const regExp = new RegExp('^\\s*' + (0, strings_1.escapeRegExpCharacters)('/*'));
                (0, foldingModel_1.setCollapseStateForMatchingLines)(foldingModel, regExp, true);
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
            const textModel = (0, testTextModel_1.createTextModel)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.FoldingModel(textModel, new TestDecorationProvider(textModel));
                const ranges = (0, indentRangeProvider_1.computeRanges)(textModel, false, { start: /^\/\/#region$/, end: /^\/\/#endregion$/ });
                foldingModel.update(ranges);
                const r1 = r(1, 2, false);
                const r2 = r(3, 12, false);
                const r3 = r(4, 11, false);
                const r4 = r(5, 6, false);
                const r5 = r(9, 10, false);
                assertRanges(foldingModel, [r1, r2, r3, r4, r5]);
                (0, foldingModel_1.setCollapseStateForRest)(foldingModel, true, [5]);
                assertFoldedRanges(foldingModel, [r1, r5], '1');
                (0, foldingModel_1.setCollapseStateForRest)(foldingModel, false, [5]);
                assertFoldedRanges(foldingModel, [], '2');
                (0, foldingModel_1.setCollapseStateForRest)(foldingModel, true, [1]);
                assertFoldedRanges(foldingModel, [r2, r3, r4, r5], '3');
                (0, foldingModel_1.setCollapseStateForRest)(foldingModel, true, [3]);
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
            const textModel = (0, testTextModel_1.createTextModel)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.FoldingModel(textModel, new TestDecorationProvider(textModel));
                const ranges = (0, indentRangeProvider_1.computeRanges)(textModel, false, undefined);
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
            const textModel = (0, testTextModel_1.createTextModel)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.FoldingModel(textModel, new TestDecorationProvider(textModel));
                const ranges = (0, indentRangeProvider_1.computeRanges)(textModel, false, undefined);
                foldingModel.update(ranges);
                const r1 = r(1, 12, false);
                const r2 = r(2, 11, false);
                const r3 = r(3, 4, false);
                const r4 = r(5, 8, false);
                const r5 = r(6, 7, false);
                const r6 = r(9, 10, false);
                assertRanges(foldingModel, [r1, r2, r3, r4, r5, r6]);
                // Test jump to parent.
                assert.strictEqual((0, foldingModel_1.getParentFoldLine)(7, foldingModel), 6);
                assert.strictEqual((0, foldingModel_1.getParentFoldLine)(6, foldingModel), 5);
                assert.strictEqual((0, foldingModel_1.getParentFoldLine)(5, foldingModel), 2);
                assert.strictEqual((0, foldingModel_1.getParentFoldLine)(2, foldingModel), 1);
                assert.strictEqual((0, foldingModel_1.getParentFoldLine)(1, foldingModel), null);
                // Test jump to previous.
                assert.strictEqual((0, foldingModel_1.getPreviousFoldLine)(10, foldingModel), 9);
                assert.strictEqual((0, foldingModel_1.getPreviousFoldLine)(9, foldingModel), 5);
                assert.strictEqual((0, foldingModel_1.getPreviousFoldLine)(5, foldingModel), 3);
                assert.strictEqual((0, foldingModel_1.getPreviousFoldLine)(3, foldingModel), null);
                // Test when not on a folding region start line.
                assert.strictEqual((0, foldingModel_1.getPreviousFoldLine)(4, foldingModel), 3);
                assert.strictEqual((0, foldingModel_1.getPreviousFoldLine)(7, foldingModel), 6);
                assert.strictEqual((0, foldingModel_1.getPreviousFoldLine)(8, foldingModel), 6);
                // Test jump to next.
                assert.strictEqual((0, foldingModel_1.getNextFoldLine)(3, foldingModel), 5);
                assert.strictEqual((0, foldingModel_1.getNextFoldLine)(5, foldingModel), 9);
                assert.strictEqual((0, foldingModel_1.getNextFoldLine)(9, foldingModel), null);
                // Test when not on a folding region start line.
                assert.strictEqual((0, foldingModel_1.getNextFoldLine)(4, foldingModel), 5);
                assert.strictEqual((0, foldingModel_1.getNextFoldLine)(7, foldingModel), 9);
                assert.strictEqual((0, foldingModel_1.getNextFoldLine)(8, foldingModel), 9);
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
            const textModel = (0, testTextModel_1.createTextModel)(lines.join('\n'));
            try {
                const foldingModel = new foldingModel_1.FoldingModel(textModel, new TestDecorationProvider(textModel));
                const ranges = (0, indentRangeProvider_1.computeRanges)(textModel, false, undefined);
                foldingModel.update(ranges);
                const r1 = r(2, 3, false);
                const r2 = r(4, 6, false);
                assertRanges(foldingModel, [r1, r2]);
                // Test jump to next.
                assert.strictEqual((0, foldingModel_1.getNextFoldLine)(1, foldingModel), 2);
                assert.strictEqual((0, foldingModel_1.getNextFoldLine)(2, foldingModel), 4);
                assert.strictEqual((0, foldingModel_1.getNextFoldLine)(3, foldingModel), 4);
                assert.strictEqual((0, foldingModel_1.getNextFoldLine)(4, foldingModel), null);
                assert.strictEqual((0, foldingModel_1.getNextFoldLine)(5, foldingModel), null);
                assert.strictEqual((0, foldingModel_1.getNextFoldLine)(6, foldingModel), null);
                // Test jump to previous.
                assert.strictEqual((0, foldingModel_1.getPreviousFoldLine)(1, foldingModel), null);
                assert.strictEqual((0, foldingModel_1.getPreviousFoldLine)(2, foldingModel), null);
                assert.strictEqual((0, foldingModel_1.getPreviousFoldLine)(3, foldingModel), 2);
                assert.strictEqual((0, foldingModel_1.getPreviousFoldLine)(4, foldingModel), 2);
                assert.strictEqual((0, foldingModel_1.getPreviousFoldLine)(5, foldingModel), 4);
                assert.strictEqual((0, foldingModel_1.getPreviousFoldLine)(6, foldingModel), 4);
            }
            finally {
                textModel.dispose();
            }
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9sZGluZ01vZGVsLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9mb2xkaW5nL3Rlc3QvYnJvd3Nlci9mb2xkaW5nTW9kZWwudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBNEJBLE1BQWEsc0JBQXNCO2lCQUVWLHdCQUFtQixHQUFHLGtDQUFzQixDQUFDLFFBQVEsQ0FBQztZQUM3RSxXQUFXLEVBQUUsTUFBTTtZQUNuQixVQUFVLDREQUFvRDtZQUM5RCx5QkFBeUIsRUFBRSxTQUFTO1NBQ3BDLENBQUMsQ0FBQztpQkFFcUIsdUJBQWtCLEdBQUcsa0NBQXNCLENBQUMsUUFBUSxDQUFDO1lBQzVFLFdBQVcsRUFBRSxNQUFNO1lBQ25CLFVBQVUsNERBQW9EO1lBQzlELHlCQUF5QixFQUFFLFNBQVM7U0FDcEMsQ0FBQyxDQUFDO2lCQUVxQixxQkFBZ0IsR0FBRyxrQ0FBc0IsQ0FBQyxRQUFRLENBQUM7WUFDMUUsV0FBVyxFQUFFLE1BQU07WUFDbkIsVUFBVSw0REFBb0Q7WUFDOUQseUJBQXlCLEVBQUUsU0FBUztTQUNwQyxDQUFDLENBQUM7UUFFSCxZQUFvQixLQUFpQjtZQUFqQixVQUFLLEdBQUwsS0FBSyxDQUFZO1FBQ3JDLENBQUM7UUFFRCxtQkFBbUIsQ0FBQyxXQUFvQixFQUFFLFFBQWlCO1lBQzFELElBQUksUUFBUSxFQUFFO2dCQUNiLE9BQU8sc0JBQXNCLENBQUMsZ0JBQWdCLENBQUM7YUFDL0M7WUFDRCxJQUFJLFdBQVcsRUFBRTtnQkFDaEIsT0FBTyxzQkFBc0IsQ0FBQyxtQkFBbUIsQ0FBQzthQUNsRDtZQUNELE9BQU8sc0JBQXNCLENBQUMsa0JBQWtCLENBQUM7UUFDbEQsQ0FBQztRQUVELGlCQUFpQixDQUFJLFFBQWdFO1lBQ3BGLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FB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