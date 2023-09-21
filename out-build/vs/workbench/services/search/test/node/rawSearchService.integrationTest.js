/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/common/event", "vs/base/common/network", "vs/base/common/path", "vs/base/common/uri", "vs/base/test/node/testUtils", "vs/workbench/services/search/common/search", "vs/workbench/services/search/node/rawSearchService"], function (require, exports, assert, async_1, event_1, network_1, path, uri_1, testUtils_1, search_1, rawSearchService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const TEST_FOLDER_QUERIES = [
        { folder: uri_1.URI.file(path.$7d('/some/where')) }
    ];
    const TEST_FIXTURES = path.$7d(network_1.$2f.asFileUri('vs/workbench/services/search/test/node/fixtures').fsPath);
    const MULTIROOT_QUERIES = [
        { folder: uri_1.URI.file(path.$9d(TEST_FIXTURES, 'examples')) },
        { folder: uri_1.URI.file(path.$9d(TEST_FIXTURES, 'more')) }
    ];
    const stats = {
        fileWalkTime: 0,
        cmdTime: 1,
        directoriesWalked: 2,
        filesWalked: 3
    };
    class TestSearchEngine {
        constructor(b, config) {
            this.b = b;
            this.config = config;
            this.a = false;
            TestSearchEngine.last = this;
        }
        search(onResult, onProgress, done) {
            const self = this;
            (function next() {
                process.nextTick(() => {
                    if (self.a) {
                        done(null, {
                            limitHit: false,
                            stats: stats,
                            messages: [],
                        });
                        return;
                    }
                    const result = self.b();
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
            this.a = true;
        }
    }
    (0, testUtils_1.flakySuite)('RawSearchService', () => {
        const rawSearch = {
            type: 1 /* QueryType.File */,
            folderQueries: TEST_FOLDER_QUERIES,
            filePattern: 'a'
        };
        const rawMatch = {
            base: path.$7d('/some'),
            relativePath: 'where',
            searchPath: undefined
        };
        const match = {
            path: path.$7d('/some/where')
        };
        test('Individual results', async function () {
            let i = 5;
            const Engine = TestSearchEngine.bind(null, () => i-- ? rawMatch : null);
            const service = new rawSearchService_1.$Idc();
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
            const service = new rawSearchService_1.$Idc();
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
            const service = new rawSearchService_1.$Idc();
            function fileSearch(config, batchSize) {
                let promise;
                const emitter = new event_1.$fd({
                    onWillAddFirstListener: () => {
                        promise = (0, async_1.$ug)(token => service.doFileSearchWithEngine(Engine, config, p => emitter.fire(p), token, batchSize)
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
            const service = new rawSearchService_1.$Idc();
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
            const service = new rawSearchService_1.$Idc();
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
            const service = new rawSearchService_1.$Idc();
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
                base: path.$7d('/some/where'),
                relativePath,
                basename: relativePath,
                size: 3,
                searchPath: undefined
            }));
            const Engine = TestSearchEngine.bind(null, () => matches.shift());
            const service = new rawSearchService_1.$Idc();
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
            assert.deepStrictEqual(results, [path.$7d('/some/where/bbc'), path.$7d('/some/where/bab')]);
        });
        test('Sorted result batches', async function () {
            let i = 25;
            const Engine = TestSearchEngine.bind(null, () => i-- ? rawMatch : null);
            const service = new rawSearchService_1.$Idc();
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
                base: path.$7d('/some/where'),
                relativePath,
                basename: relativePath,
                size: 3,
                searchPath: undefined
            }));
            const Engine = TestSearchEngine.bind(null, () => matches.shift());
            const service = new rawSearchService_1.$Idc();
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
                assert.deepStrictEqual(results, [path.$7d('/some/where/bcb'), path.$7d('/some/where/bbc'), path.$7d('/some/where/aab')]);
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
                    assert.deepStrictEqual(results, [path.$7d('/some/where/bcb'), path.$7d('/some/where/bbc')]);
                }
                catch (e) { }
            }).then(() => {
                return service.clearCache('x');
            }).then(async () => {
                matches.push({
                    base: path.$7d('/some/where'),
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
                assert.deepStrictEqual(results, [path.$7d('/some/where/bc')]);
            });
        });
    });
    function collectResultsFromEvent(event) {
        const files = [];
        let listener;
        return new Promise((c, e) => {
            listener = event(ev => {
                if ((0, search_1.$BI)(ev)) {
                    if ((0, search_1.$CI)(ev)) {
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
//# sourceMappingURL=rawSearchService.integrationTest.js.map