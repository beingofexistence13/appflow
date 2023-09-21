define(["require", "exports", "assert", "vs/editor/contrib/folding/browser/foldingModel", "vs/editor/contrib/folding/browser/hiddenRangeModel", "vs/editor/contrib/folding/browser/indentRangeProvider", "vs/editor/test/common/testTextModel", "./foldingModel.test"], function (require, exports, assert, foldingModel_1, hiddenRangeModel_1, indentRangeProvider_1, testTextModel_1, foldingModel_test_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Hidden Range Model', () => {
        function r(startLineNumber, endLineNumber) {
            return { startLineNumber, endLineNumber };
        }
        function assertRanges(actual, expectedRegions, message) {
            assert.deepStrictEqual(actual.map(r => ({ startLineNumber: r.startLineNumber, endLineNumber: r.endLineNumber })), expectedRegions, message);
        }
        test('hasRanges', () => {
            const lines = [
                /* 1*/ '/**',
                /* 2*/ ' * Comment',
                /* 3*/ ' */',
                /* 4*/ 'class A {',
                /* 5*/ '  void foo() {',
                /* 6*/ '    if (true) {',
                /* 7*/ '      //hello',
                /* 8*/ '    }',
                /* 9*/ '  }',
                /* 10*/ '}'
            ];
            const textModel = (0, testTextModel_1.$O0b)(lines.join('\n'));
            const foldingModel = new foldingModel_1.$c8(textModel, new foldingModel_test_1.$50b(textModel));
            const hiddenRangeModel = new hiddenRangeModel_1.$o8(foldingModel);
            assert.strictEqual(hiddenRangeModel.hasRanges(), false);
            const ranges = (0, indentRangeProvider_1.$r8)(textModel, false, undefined);
            foldingModel.update(ranges);
            foldingModel.toggleCollapseState([foldingModel.getRegionAtLine(1), foldingModel.getRegionAtLine(6)]);
            assertRanges(hiddenRangeModel.hiddenRanges, [r(2, 3), r(7, 7)]);
            assert.strictEqual(hiddenRangeModel.hasRanges(), true);
            assert.strictEqual(hiddenRangeModel.isHidden(1), false);
            assert.strictEqual(hiddenRangeModel.isHidden(2), true);
            assert.strictEqual(hiddenRangeModel.isHidden(3), true);
            assert.strictEqual(hiddenRangeModel.isHidden(4), false);
            assert.strictEqual(hiddenRangeModel.isHidden(5), false);
            assert.strictEqual(hiddenRangeModel.isHidden(6), false);
            assert.strictEqual(hiddenRangeModel.isHidden(7), true);
            assert.strictEqual(hiddenRangeModel.isHidden(8), false);
            assert.strictEqual(hiddenRangeModel.isHidden(9), false);
            assert.strictEqual(hiddenRangeModel.isHidden(10), false);
            foldingModel.toggleCollapseState([foldingModel.getRegionAtLine(4)]);
            assertRanges(hiddenRangeModel.hiddenRanges, [r(2, 3), r(5, 9)]);
            assert.strictEqual(hiddenRangeModel.hasRanges(), true);
            assert.strictEqual(hiddenRangeModel.isHidden(1), false);
            assert.strictEqual(hiddenRangeModel.isHidden(2), true);
            assert.strictEqual(hiddenRangeModel.isHidden(3), true);
            assert.strictEqual(hiddenRangeModel.isHidden(4), false);
            assert.strictEqual(hiddenRangeModel.isHidden(5), true);
            assert.strictEqual(hiddenRangeModel.isHidden(6), true);
            assert.strictEqual(hiddenRangeModel.isHidden(7), true);
            assert.strictEqual(hiddenRangeModel.isHidden(8), true);
            assert.strictEqual(hiddenRangeModel.isHidden(9), true);
            assert.strictEqual(hiddenRangeModel.isHidden(10), false);
            foldingModel.toggleCollapseState([foldingModel.getRegionAtLine(1), foldingModel.getRegionAtLine(6), foldingModel.getRegionAtLine(4)]);
            assertRanges(hiddenRangeModel.hiddenRanges, []);
            assert.strictEqual(hiddenRangeModel.hasRanges(), false);
            assert.strictEqual(hiddenRangeModel.isHidden(1), false);
            assert.strictEqual(hiddenRangeModel.isHidden(2), false);
            assert.strictEqual(hiddenRangeModel.isHidden(3), false);
            assert.strictEqual(hiddenRangeModel.isHidden(4), false);
            assert.strictEqual(hiddenRangeModel.isHidden(5), false);
            assert.strictEqual(hiddenRangeModel.isHidden(6), false);
            assert.strictEqual(hiddenRangeModel.isHidden(7), false);
            assert.strictEqual(hiddenRangeModel.isHidden(8), false);
            assert.strictEqual(hiddenRangeModel.isHidden(9), false);
            assert.strictEqual(hiddenRangeModel.isHidden(10), false);
            textModel.dispose();
        });
    });
});
//# sourceMappingURL=hiddenRangeModel.test.js.map