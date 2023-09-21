define(["require", "exports", "assert", "vs/base/common/cancellation", "vs/editor/contrib/folding/browser/syntaxRangeProvider", "vs/editor/test/common/testTextModel"], function (require, exports, assert, cancellation_1, syntaxRangeProvider_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TestFoldingRangeProvider {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        provideFoldingRanges(model, context, token) {
            if (model === this.a) {
                return this.b;
            }
            return null;
        }
    }
    suite('Syntax folding', () => {
        function r(start, end) {
            return { start, end };
        }
        test('Limit by nesting level', async () => {
            const lines = [
                /* 1*/ '{',
                /* 2*/ '  A',
                /* 3*/ '  {',
                /* 4*/ '    {',
                /* 5*/ '      B',
                /* 6*/ '    }',
                /* 7*/ '    {',
                /* 8*/ '      A',
                /* 9*/ '      {',
                /* 10*/ '         A',
                /* 11*/ '      }',
                /* 12*/ '      {',
                /* 13*/ '        {',
                /* 14*/ '          {',
                /* 15*/ '             A',
                /* 16*/ '          }',
                /* 17*/ '        }',
                /* 18*/ '      }',
                /* 19*/ '    }',
                /* 20*/ '  }',
                /* 21*/ '}',
                /* 22*/ '{',
                /* 23*/ '  A',
                /* 24*/ '}',
            ];
            const r1 = r(1, 20); //0
            const r2 = r(3, 19); //1
            const r3 = r(4, 5); //2
            const r4 = r(7, 18); //2
            const r5 = r(9, 10); //3
            const r6 = r(12, 17); //4
            const r7 = r(13, 16); //5
            const r8 = r(14, 15); //6
            const r9 = r(22, 23); //0
            const model = (0, testTextModel_1.$O0b)(lines.join('\n'));
            const ranges = [r1, r2, r3, r4, r5, r6, r7, r8, r9];
            const providers = [new TestFoldingRangeProvider(model, ranges)];
            async function assertLimit(maxEntries, expectedRanges, message) {
                let reported = false;
                const foldingRangesLimit = { limit: maxEntries, update: (computed, limited) => reported = limited };
                const indentRanges = await new syntaxRangeProvider_1.$x8(model, providers, () => { }, foldingRangesLimit, undefined).compute(cancellation_1.CancellationToken.None);
                const actual = [];
                if (indentRanges) {
                    for (let i = 0; i < indentRanges.length; i++) {
                        actual.push({ start: indentRanges.getStartLineNumber(i), end: indentRanges.getEndLineNumber(i) });
                    }
                    assert.equal(reported, 9 <= maxEntries ? false : maxEntries, 'limited');
                }
                assert.deepStrictEqual(actual, expectedRanges, message);
            }
            await assertLimit(1000, [r1, r2, r3, r4, r5, r6, r7, r8, r9], '1000');
            await assertLimit(9, [r1, r2, r3, r4, r5, r6, r7, r8, r9], '9');
            await assertLimit(8, [r1, r2, r3, r4, r5, r6, r7, r9], '8');
            await assertLimit(7, [r1, r2, r3, r4, r5, r6, r9], '7');
            await assertLimit(6, [r1, r2, r3, r4, r5, r9], '6');
            await assertLimit(5, [r1, r2, r3, r4, r9], '5');
            await assertLimit(4, [r1, r2, r3, r9], '4');
            await assertLimit(3, [r1, r2, r9], '3');
            await assertLimit(2, [r1, r9], '2');
            await assertLimit(1, [r1], '1');
            await assertLimit(0, [], '0');
            model.dispose();
        });
    });
});
//# sourceMappingURL=syntaxFold.test.js.map