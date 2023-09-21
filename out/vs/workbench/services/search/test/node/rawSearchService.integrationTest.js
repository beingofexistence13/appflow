/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/common/event", "vs/base/common/network", "vs/base/common/path", "vs/base/common/uri", "vs/base/test/node/testUtils", "vs/workbench/services/search/common/search", "vs/workbench/services/search/node/rawSearchService"], function (require, exports, assert, async_1, event_1, network_1, path, uri_1, testUtils_1, search_1, rawSearchService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const TEST_FOLDER_QUERIES = [
        { folder: uri_1.URI.file(path.normalize('/some/where')) }
    ];
    const TEST_FIXTURES = path.normalize(network_1.FileAccess.asFileUri('vs/workbench/services/search/test/node/fixtures').fsPath);
    const MULTIROOT_QUERIES = [
        { folder: uri_1.URI.file(path.join(TEST_FIXTURES, 'examples')) },
        { folder: uri_1.URI.file(path.join(TEST_FIXTURES, 'more')) }
    ];
    const stats = {
        fileWalkTime: 0,
        cmdTime: 1,
        directoriesWalked: 2,
        filesWalked: 3
    };
    class TestSearchEngine {
        constructor(result, config) {
            this.result = result;
            this.config = config;
            this.isCanceled = false;
            TestSearchEngine.last = this;
        }
        search(onResult, onProgress, done) {
            const self = this;
            (function next() {
                process.nextTick(() => {
                    if (self.isCanceled) {
                        done(null, {
                            limitHit: false,
                            stats: stats,
                            messages: [],
                        });
                        return;
                    }
                    const result = self.result();
                    if (!result) {
                        done(null, {
                            limitHit: false,
                            stats: stats,
                            messages: [],
                        });
                    }
                    else {
                        onResult(result);
                        next();
                    }
                });
            })();
        }
        cancel() {
            this.isCanceled = true;
        }
    }
    (0, testUtils_1.flakySuite)('RawSearchService', () => {
        const rawSearch = {
            type: 1 /* QueryType.File */,
            folderQueries: TEST_FOLDER_QUERIES,
            filePattern: 'a'
        };
        const rawMatch = {
            base: path.normalize('/some'),
            relativePath: 'where',
            searchPath: undefined
        };
        const match = {
            path: path.normalize('/some/where')
        };
        test('Individual results', async function () {
            let i = 5;
            const Engine = TestSearchEngine.bind(null, () => i-- ? rawMatch : null);
            const service = new rawSearchService_1.SearchService();
            let results = 0;
            const cb = value => {
                if (!Array.isArray(value)) {
                    assert.deepStrictEqual(value, match);
                    results++;
                }
                else {
                    assert.fail(JSON.stringify(value));
                }
            };
            await service.doFileSearchWithEngine(Engine, rawSearch, cb, null, 0);
            return assert.strictEqual(results, 5);
        });
        test('Batch results', async function () {
            let i = 25;
            const Engine = TestSearchEngine.bind(null, () => i-- ? rawMatch : null);
            const service = new rawSearchService_1.SearchService();
            const results = [];
            const cb = value => {
                if (Array.isArray(value)) {
                    value.forEach(m => {
                        assert.deepStrictEqual(m, match);
                    });
                    results.push(value.length);
                }
                else {
                    assert.fail(JSON.stringify(value));
                }
            };
            await service.doFileSearchWithEngine(Engine, rawSearch, cb, undefined, 10);
            assert.deepStrictEqual(results, [10, 10, 5]);
        });
        test('Collect batched results', async function () {
            const uriPath = '/some/where';
            let i = 25;
            const Engine = TestSearchEngine.bind(null, () => i-- ? rawMatch : null);
            const service = new rawSearchService_1.SearchService();
            function fileSearch(config, batchSize) {
                let promise;
                const emitter = new event_1.Emitter({
                    onWillAddFirstListener: () => {
                        promise = (0, async_1.createCancelablePromise)(token => service.doFileSearchWithEngine(Engine, config, p => emitter.fire(p), token, batchSize)
                            .then(c => emitter.fire(c), err => emitter.fire({ type: 'error', error: err })));
                    },
                    onDidRemoveLastListener: () => {
                        promise.cancel();
                    }
                });
                return emitter.event;
            }
            const result = await collectResultsFromEvent(fileSearch(rawSearch, 10));
            result.files.forEach(f => {
                assert.strictEqual(f.path.replace(/\\/g, '/'), uriPath);
            });
            assert.strictEqual(result.files.length, 25, 'Result');
        });
        test('Multi-root with include pattern and maxResults', async function () {
            const service = new rawSearchService_1.SearchService();
            const query = {
                type: 1 /* QueryType.File */,
                folderQueries: MULTIROOT_QUERIES,
                maxResults: 1,
                includePattern: {
                    '*.txt': true,
                    '*.js': true
                },
            };
            const result = await collectResultsFromEvent(service.fileSearch(query));
            assert.strictEqual(result.files.length, 1, 'Result');
        });
        test('Handles maxResults=0 correctly', async function () {
            const service = new rawSearchService_1.SearchService();
            const query = {
                type: 1 /* QueryType.File */,
                folderQueries: MULTIROOT_QUERIES,
                maxResults: 0,
                sortByScore: true,
                includePattern: {
                    '*.txt': true,
                    '*.js': true
                },
            };
            const result = await collectResultsFromEvent(service.fileSearch(query));
            assert.strictEqual(result.files.length, 0, 'Result');
        });
        test('Multi-root with include pattern and exists', async function () {
            const service = new rawSearchService_1.SearchService();
            const query = {
                type: 1 /* QueryType.File */,
                folderQueries: MULTIROOT_QUERIES,
                exists: true,
                includePattern: {
                    '*.txt': true,
                    '*.js': true
                },
            };
            const result = await collectResultsFromEvent(service.fileSearch(query));
            assert.strictEqual(result.files.length, 0, 'Result');
            assert.ok(result.limitHit);
        });
        test('Sorted results', async function () {
            const paths = ['bab', 'bbc', 'abb'];
            const matches = paths.map(relativePath => ({
                base: path.normalize('/some/where'),
                relativePath,
                basename: relativePath,
                size: 3,
                searchPath: undefined
            }));
            const Engine = TestSearchEngine.bind(null, () => matches.shift());
            const service = new rawSearchService_1.SearchService();
            const results = [];
            const cb = value => {
                if (Array.isArray(value)) {
                    results.push(...value.map(v => v.path));
                }
                else {
                    assert.fail(JSON.stringify(value));
                }
            };
            await service.doFileSearchWithEngine(Engine, {
                type: 1 /* QueryType.File */,
                folderQueries: TEST_FOLDER_QUERIES,
                filePattern: 'bb',
                sortByScore: true,
                maxResults: 2
            }, cb, undefined, 1);
            assert.notStrictEqual(typeof TestSearchEngine.last.config.maxResults, 'number');
            assert.deepStrictEqual(results, [path.normalize('/some/where/bbc'), path.normalize('/some/where/bab')]);
        });
        test('Sorted result batches', async function () {
            let i = 25;
            const Engine = TestSearchEngine.bind(null, () => i-- ? rawMatch : null);
            const service = new rawSearchService_1.SearchService();
            const results = [];
            const cb = value => {
                if (Array.isArray(value)) {
                    value.forEach(m => {
                        assert.deepStrictEqual(m, match);
                    });
                    results.push(value.length);
                }
                else {
                    assert.fail(JSON.stringify(value));
                }
            };
            await service.doFileSearchWithEngine(Engine, {
                type: 1 /* QueryType.File */,
                folderQueries: TEST_FOLDER_QUERIES,
                filePattern: 'a',
                sortByScore: true,
                maxResults: 23
            }, cb, undefined, 10);
            assert.deepStrictEqual(results, [10, 10, 3]);
        });
        test('Cached results', function () {
            const paths = ['bcb', 'bbc', 'aab'];
            const matches = paths.map(relativePath => ({
                base: path.normalize('/some/where'),
                relativePath,
                basename: relativePath,
                size: 3,
                searchPath: undefined
            }));
            const Engine = TestSearchEngine.bind(null, () => matches.shift());
            const service = new rawSearchService_1.SearchService();
            const results = [];
            const cb = value => {
                if (Array.isArray(value)) {
                    results.push(...value.map(v => v.path));
                }
                else {
                    assert.fail(JSON.stringify(value));
                }
            };
            return service.doFileSearchWithEngine(Engine, {
                type: 1 /* QueryType.File */,
                folderQueries: TEST_FOLDER_QUERIES,
                filePattern: 'b',
                sortByScore: true,
                cacheKey: 'x'
            }, cb, undefined, -1).then(complete => {
                assert.strictEqual(complete.stats.fromCache, false);
                assert.deepStrictEqual(results, [path.normalize('/some/where/bcb'), path.normalize('/some/where/bbc'), path.normalize('/some/where/aab')]);
            }).then(async () => {
                const results = [];
                const cb = value => {
                    if (Array.isArray(value)) {
                        results.push(...value.map(v => v.path));
                    }
                    else {
                        assert.fail(JSON.stringify(value));
                    }
                };
                try {
                    const complete = await service.doFileSearchWithEngine(Engine, {
                        type: 1 /* QueryType.File */,
                        folderQueries: TEST_FOLDER_QUERIES,
                        filePattern: 'bc',
                        sortByScore: true,
                        cacheKey: 'x'
                    }, cb, undefined, -1);
                    assert.ok(complete.stats.fromCache);
                    assert.deepStrictEqual(results, [path.normalize('/some/where/bcb'), path.normalize('/some/where/bbc')]);
                }
                catch (e) { }
            }).then(() => {
                return service.clearCache('x');
            }).then(async () => {
                matches.push({
                    base: path.normalize('/some/where'),
                    relativePath: 'bc',
                    searchPath: undefined
                });
                const results = [];
                const cb = value => {
                    if (Array.isArray(value)) {
                        results.push(...value.map(v => v.path));
                    }
                    else {
                        assert.fail(JSON.stringify(value));
                    }
                };
                const complete = await service.doFileSearchWithEngine(Engine, {
                    type: 1 /* QueryType.File */,
                    folderQueries: TEST_FOLDER_QUERIES,
                    filePattern: 'bc',
                    sortByScore: true,
                    cacheKey: 'x'
                }, cb, undefined, -1);
                assert.strictEqual(complete.stats.fromCache, false);
                assert.deepStrictEqual(results, [path.normalize('/some/where/bc')]);
            });
        });
    });
    function collectResultsFromEvent(event) {
        const files = [];
        let listener;
        return new Promise((c, e) => {
            listener = event(ev => {
                if ((0, search_1.isSerializedSearchComplete)(ev)) {
                    if ((0, search_1.isSerializedSearchSuccess)(ev)) {
                        c({ files, limitHit: ev.limitHit });
                    }
                    else {
                        e(ev.error);
                    }
                    listener.dispose();
                }
                else if (Array.isArray(ev)) {
                    files.push(...ev);
                }
                else if (ev.path) {
                    files.push(ev);
                }
            });
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmF3U2VhcmNoU2VydmljZS5pbnRlZ3JhdGlvblRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvc2VhcmNoL3Rlc3Qvbm9kZS9yYXdTZWFyY2hTZXJ2aWNlLmludGVncmF0aW9uVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQWFoRyxNQUFNLG1CQUFtQixHQUFHO1FBQzNCLEVBQUUsTUFBTSxFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxFQUFFO0tBQ25ELENBQUM7SUFFRixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFVLENBQUMsU0FBUyxDQUFDLGlEQUFpRCxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDckgsTUFBTSxpQkFBaUIsR0FBbUI7UUFDekMsRUFBRSxNQUFNLEVBQUUsU0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsQ0FBQyxFQUFFO1FBQzFELEVBQUUsTUFBTSxFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRTtLQUN0RCxDQUFDO0lBRUYsTUFBTSxLQUFLLEdBQXVCO1FBQ2pDLFlBQVksRUFBRSxDQUFDO1FBQ2YsT0FBTyxFQUFFLENBQUM7UUFDVixpQkFBaUIsRUFBRSxDQUFDO1FBQ3BCLFdBQVcsRUFBRSxDQUFDO0tBQ2QsQ0FBQztJQUVGLE1BQU0sZ0JBQWdCO1FBTXJCLFlBQW9CLE1BQWtDLEVBQVMsTUFBbUI7WUFBOUQsV0FBTSxHQUFOLE1BQU0sQ0FBNEI7WUFBUyxXQUFNLEdBQU4sTUFBTSxDQUFhO1lBRjFFLGVBQVUsR0FBRyxLQUFLLENBQUM7WUFH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