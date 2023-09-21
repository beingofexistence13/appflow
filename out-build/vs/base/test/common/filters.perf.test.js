define(["require", "exports", "vs/amdX", "vs/base/common/filters", "vs/base/common/network"], function (require, exports, amdX_1, filters, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const patterns = ['cci', 'ida', 'pos', 'CCI', 'enbled', 'callback', 'gGame', 'cons', 'zyx', 'aBc'];
    const _enablePerf = false;
    function perfSuite(name, callback) {
        if (_enablePerf) {
            suite(name, callback);
        }
    }
    perfSuite('Performance - fuzzyMatch', async function () {
        const uri = network_1.$2f.asBrowserUri('vs/base/test/common/filters.perf.data').toString(true);
        const { data } = await (0, amdX_1.$aD)(uri, '');
        // suiteSetup(() => console.profile());
        // suiteTeardown(() => console.profileEnd());
        console.log(`Matching ${data.length} items against ${patterns.length} patterns (${data.length * patterns.length} operations) `);
        function perfTest(name, match) {
            test(name, () => {
                const t1 = Date.now();
                let count = 0;
                for (let i = 0; i < 2; i++) {
                    for (const pattern of patterns) {
                        const patternLow = pattern.toLowerCase();
                        for (const item of data) {
                            count += 1;
                            match(pattern, patternLow, 0, item, item.toLowerCase(), 0);
                        }
                    }
                }
                const d = Date.now() - t1;
                console.log(name, `${d}ms, ${Math.round(count / d) * 15}/15ms, ${Math.round(count / d)}/1ms`);
            });
        }
        perfTest('fuzzyScore', filters.$Kj);
        perfTest('fuzzyScoreGraceful', filters.$Mj);
        perfTest('fuzzyScoreGracefulAggressive', filters.$Lj);
    });
    perfSuite('Performance - IFilter', async function () {
        const uri = network_1.$2f.asBrowserUri('vs/base/test/common/filters.perf.data').toString(true);
        const { data } = await (0, amdX_1.$aD)(uri, '');
        function perfTest(name, match) {
            test(name, () => {
                const t1 = Date.now();
                let count = 0;
                for (let i = 0; i < 2; i++) {
                    for (const pattern of patterns) {
                        for (const item of data) {
                            count += 1;
                            match(pattern, item);
                        }
                    }
                }
                const d = Date.now() - t1;
                console.log(name, `${d}ms, ${Math.round(count / d) * 15}/15ms, ${Math.round(count / d)}/1ms`);
            });
        }
        perfTest('matchesFuzzy', filters.$Ej);
        perfTest('matchesFuzzy2', filters.$Fj);
        perfTest('matchesPrefix', filters.$yj);
        perfTest('matchesContiguousSubString', filters.$zj);
        perfTest('matchesCamelCase', filters.$Cj);
    });
});
//# sourceMappingURL=filters.perf.test.js.map