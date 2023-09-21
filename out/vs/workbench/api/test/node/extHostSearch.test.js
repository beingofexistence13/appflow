/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/resources", "vs/base/common/uri", "vs/base/test/common/mock", "vs/base/test/common/utils", "vs/platform/log/common/log", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostUriTransformerService", "vs/workbench/api/node/extHostSearch", "vs/workbench/api/test/common/testRPCProtocol", "vs/workbench/services/search/common/search", "vs/workbench/services/search/node/textSearchManager"], function (require, exports, assert, arrays_1, async_1, cancellation_1, errors_1, resources_1, uri_1, mock_1, utils_1, log_1, extHost_protocol_1, extHostTypes_1, extHostUriTransformerService_1, extHostSearch_1, testRPCProtocol_1, search_1, textSearchManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let rpcProtocol;
    let extHostSearch;
    let mockMainThreadSearch;
    class MockMainThreadSearch {
        constructor() {
            this.results = [];
        }
        $registerFileSearchProvider(handle, scheme) {
            this.lastHandle = handle;
        }
        $registerTextSearchProvider(handle, scheme) {
            this.lastHandle = handle;
        }
        $unregisterProvider(handle) {
        }
        $handleFileMatch(handle, session, data) {
            this.results.push(...data);
        }
        $handleTextMatch(handle, session, data) {
            this.results.push(...data);
        }
        $handleTelemetry(eventName, data) {
        }
        dispose() {
        }
    }
    let mockPFS;
    function extensionResultIsMatch(data) {
        return !!data.preview;
    }
    suite('ExtHostSearch', () => {
        const disposables = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        async function registerTestTextSearchProvider(provider, scheme = 'file') {
            disposables.add(extHostSearch.registerTextSearchProvider(scheme, provider));
            await rpcProtocol.sync();
        }
        async function registerTestFileSearchProvider(provider, scheme = 'file') {
            disposables.add(extHostSearch.registerFileSearchProvider(scheme, provider));
            await rpcProtocol.sync();
        }
        async function runFileSearch(query, cancel = false) {
            let stats;
            try {
                const cancellation = new cancellation_1.CancellationTokenSource();
                const p = extHostSearch.$provideFileSearchResults(mockMainThreadSearch.lastHandle, 0, query, cancellation.token);
                if (cancel) {
                    await (0, async_1.timeout)(0);
                    cancellation.cancel();
                }
                stats = await p;
            }
            catch (err) {
                if (!(0, errors_1.isCancellationError)(err)) {
                    await rpcProtocol.sync();
                    throw err;
                }
            }
            await rpcProtocol.sync();
            return {
                results: mockMainThreadSearch.results.map(r => uri_1.URI.revive(r)),
                stats: stats
            };
        }
        async function runTextSearch(query) {
            let stats;
            try {
                const cancellation = new cancellation_1.CancellationTokenSource();
                const p = extHostSearch.$provideTextSearchResults(mockMainThreadSearch.lastHandle, 0, query, cancellation.token);
                stats = await p;
            }
            catch (err) {
                if (!(0, errors_1.isCancellationError)(err)) {
                    await rpcProtocol.sync();
                    throw err;
                }
            }
            await rpcProtocol.sync();
            const results = mockMainThreadSearch.results.map(r => ({
                ...r,
                ...{
                    resource: uri_1.URI.revive(r.resource)
                }
            }));
            return { results, stats: stats };
        }
        setup(() => {
            rpcProtocol = new testRPCProtocol_1.TestRPCProtocol();
            mockMainThreadSearch = new MockMainThreadSearch();
            const logService = new log_1.NullLogService();
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadSearch, mockMainThreadSearch);
            mockPFS = {};
            extHostSearch = disposables.add(new class extends extHostSearch_1.NativeExtHostSearch {
                constructor() {
                    super(rpcProtocol, new class extends (0, mock_1.mock)() {
                        constructor() {
                            super(...arguments);
                            this.remote = { isRemote: false, authority: undefined, connectionData: null };
                        }
                    }, new extHostUriTransformerService_1.URITransformerService(null), logService);
                    this._pfs = mockPFS;
                }
                createTextSearchManager(query, provider) {
                    return new textSearchManager_1.NativeTextSearchManager(query, provider, this._pfs);
                }
            });
        });
        teardown(() => {
            return rpcProtocol.sync();
        });
        const rootFolderA = uri_1.URI.file('/foo/bar1');
        const rootFolderB = uri_1.URI.file('/foo/bar2');
        const fancyScheme = 'fancy';
        const fancySchemeFolderA = uri_1.URI.from({ scheme: fancyScheme, path: '/project/folder1' });
        suite('File:', () => {
            function getSimpleQuery(filePattern = '') {
                return {
                    type: 1 /* QueryType.File */,
                    filePattern,
                    folderQueries: [
                        { folder: rootFolderA }
                    ]
                };
            }
            function compareURIs(actual, expected) {
                const sortAndStringify = (arr) => arr.sort().map(u => u.toString());
                assert.deepStrictEqual(sortAndStringify(actual), sortAndStringify(expected));
            }
            test('no results', async () => {
                await registerTestFileSearchProvider({
                    provideFileSearchResults(query, options, token) {
                        return Promise.resolve(null);
                    }
                });
                const { results, stats } = await runFileSearch(getSimpleQuery());
                assert(!stats.limitHit);
                assert(!results.length);
            });
            test('simple results', async () => {
                const reportedResults = [
                    (0, resources_1.joinPath)(rootFolderA, 'file1.ts'),
                    (0, resources_1.joinPath)(rootFolderA, 'file2.ts'),
                    (0, resources_1.joinPath)(rootFolderA, 'subfolder/file3.ts')
                ];
                await registerTestFileSearchProvider({
                    provideFileSearchResults(query, options, token) {
                        return Promise.resolve(reportedResults);
                    }
                });
                const { results, stats } = await runFileSearch(getSimpleQuery());
                assert(!stats.limitHit);
                assert.strictEqual(results.length, 3);
                compareURIs(results, reportedResults);
            });
            test('Search canceled', async () => {
                let cancelRequested = false;
                await registerTestFileSearchProvider({
                    provideFileSearchResults(query, options, token) {
                        return new Promise((resolve, reject) => {
                            function onCancel() {
                                cancelRequested = true;
                                resolve([(0, resources_1.joinPath)(options.folder, 'file1.ts')]); // or reject or nothing?
                            }
                            if (token.isCancellationRequested) {
                                onCancel();
                            }
                            else {
                                disposables.add(token.onCancellationRequested(() => onCancel()));
                            }
                        });
                    }
                });
                const { results } = await runFileSearch(getSimpleQuery(), true);
                assert(cancelRequested);
                assert(!results.length);
            });
            test('provider returns null', async () => {
                await registerTestFileSearchProvider({
                    provideFileSearchResults(query, options, token) {
                        return null;
                    }
                });
                try {
                    await runFileSearch(getSimpleQuery());
                    assert(false, 'Expected to fail');
                }
                catch {
                    // Expected to throw
                }
            });
            test('all provider calls get global include/excludes', async () => {
                await registerTestFileSearchProvider({
                    provideFileSearchResults(query, options, token) {
                        assert(options.excludes.length === 2 && options.includes.length === 2, 'Missing global include/excludes');
                        return Promise.resolve(null);
                    }
                });
                const query = {
                    type: 1 /* QueryType.File */,
                    filePattern: '',
                    includePattern: {
                        'foo': true,
                        'bar': true
                    },
                    excludePattern: {
                        'something': true,
                        'else': true
                    },
                    folderQueries: [
                        { folder: rootFolderA },
                        { folder: rootFolderB }
                    ]
                };
                await runFileSearch(query);
            });
            test('global/local include/excludes combined', async () => {
                await registerTestFileSearchProvider({
                    provideFileSearchResults(query, options, token) {
                        if (options.folder.toString() === rootFolderA.toString()) {
                            assert.deepStrictEqual(options.includes.sort(), ['*.ts', 'foo']);
                            assert.deepStrictEqual(options.excludes.sort(), ['*.js', 'bar']);
                        }
                        else {
                            assert.deepStrictEqual(options.includes.sort(), ['*.ts']);
                            assert.deepStrictEqual(options.excludes.sort(), ['*.js']);
                        }
                        return Promise.resolve(null);
                    }
                });
                const query = {
                    type: 1 /* QueryType.File */,
                    filePattern: '',
                    includePattern: {
                        '*.ts': true
                    },
                    excludePattern: {
                        '*.js': true
                    },
                    folderQueries: [
                        {
                            folder: rootFolderA,
                            includePattern: {
                                'foo': true
                            },
                            excludePattern: {
                                'bar': true
                            }
                        },
                        { folder: rootFolderB }
                    ]
                };
                await runFileSearch(query);
            });
            test('include/excludes resolved correctly', async () => {
                await registerTestFileSearchProvider({
                    provideFileSearchResults(query, options, token) {
                        assert.deepStrictEqual(options.includes.sort(), ['*.jsx', '*.ts']);
                        assert.deepStrictEqual(options.excludes.sort(), []);
                        return Promise.resolve(null);
                    }
                });
                const query = {
                    type: 1 /* QueryType.File */,
                    filePattern: '',
                    includePattern: {
                        '*.ts': true,
                        '*.jsx': false
                    },
                    excludePattern: {
                        '*.js': true,
                        '*.tsx': false
                    },
                    folderQueries: [
                        {
                            folder: rootFolderA,
                            includePattern: {
                                '*.jsx': true
                            },
                            excludePattern: {
                                '*.js': false
                            }
                        }
                    ]
                };
                await runFileSearch(query);
            });
            test('basic sibling exclude clause', async () => {
                const reportedResults = [
                    'file1.ts',
                    'file1.js',
                ];
                await registerTestFileSearchProvider({
                    provideFileSearchResults(query, options, token) {
                        return Promise.resolve(reportedResults
                            .map(relativePath => (0, resources_1.joinPath)(options.folder, relativePath)));
                    }
                });
                const query = {
                    type: 1 /* QueryType.File */,
                    filePattern: '',
                    excludePattern: {
                        '*.js': {
                            when: '$(basename).ts'
                        }
                    },
                    folderQueries: [
                        { folder: rootFolderA }
                    ]
                };
                const { results } = await runFileSearch(query);
                compareURIs(results, [
                    (0, resources_1.joinPath)(rootFolderA, 'file1.ts')
                ]);
            });
            // https://github.com/microsoft/vscode-remotehub/issues/255
            test('include, sibling exclude, and subfolder', async () => {
                const reportedResults = [
                    'foo/file1.ts',
                    'foo/file1.js',
                ];
                await registerTestFileSearchProvider({
                    provideFileSearchResults(query, options, token) {
                        return Promise.resolve(reportedResults
                            .map(relativePath => (0, resources_1.joinPath)(options.folder, relativePath)));
                    }
                });
                const query = {
                    type: 1 /* QueryType.File */,
                    filePattern: '',
                    includePattern: { '**/*.ts': true },
                    excludePattern: {
                        '*.js': {
                            when: '$(basename).ts'
                        }
                    },
                    folderQueries: [
                        { folder: rootFolderA }
                    ]
                };
                const { results } = await runFileSearch(query);
                compareURIs(results, [
                    (0, resources_1.joinPath)(rootFolderA, 'foo/file1.ts')
                ]);
            });
            test('multiroot sibling exclude clause', async () => {
                await registerTestFileSearchProvider({
                    provideFileSearchResults(query, options, token) {
                        let reportedResults;
                        if (options.folder.fsPath === rootFolderA.fsPath) {
                            reportedResults = [
                                'folder/fileA.scss',
                                'folder/fileA.css',
                                'folder/file2.css'
                            ].map(relativePath => (0, resources_1.joinPath)(rootFolderA, relativePath));
                        }
                        else {
                            reportedResults = [
                                'fileB.ts',
                                'fileB.js',
                                'file3.js'
                            ].map(relativePath => (0, resources_1.joinPath)(rootFolderB, relativePath));
                        }
                        return Promise.resolve(reportedResults);
                    }
                });
                const query = {
                    type: 1 /* QueryType.File */,
                    filePattern: '',
                    excludePattern: {
                        '*.js': {
                            when: '$(basename).ts'
                        },
                        '*.css': true
                    },
                    folderQueries: [
                        {
                            folder: rootFolderA,
                            excludePattern: {
                                'folder/*.css': {
                                    when: '$(basename).scss'
                                }
                            }
                        },
                        {
                            folder: rootFolderB,
                            excludePattern: {
                                '*.js': false
                            }
                        }
                    ]
                };
                const { results } = await runFileSearch(query);
                compareURIs(results, [
                    (0, resources_1.joinPath)(rootFolderA, 'folder/fileA.scss'),
                    (0, resources_1.joinPath)(rootFolderA, 'folder/file2.css'),
                    (0, resources_1.joinPath)(rootFolderB, 'fileB.ts'),
                    (0, resources_1.joinPath)(rootFolderB, 'fileB.js'),
                    (0, resources_1.joinPath)(rootFolderB, 'file3.js'),
                ]);
            });
            test('max results = 1', async () => {
                const reportedResults = [
                    (0, resources_1.joinPath)(rootFolderA, 'file1.ts'),
                    (0, resources_1.joinPath)(rootFolderA, 'file2.ts'),
                    (0, resources_1.joinPath)(rootFolderA, 'file3.ts'),
                ];
                let wasCanceled = false;
                await registerTestFileSearchProvider({
                    provideFileSearchResults(query, options, token) {
                        disposables.add(token.onCancellationRequested(() => wasCanceled = true));
                        return Promise.resolve(reportedResults);
                    }
                });
                const query = {
                    type: 1 /* QueryType.File */,
                    filePattern: '',
                    maxResults: 1,
                    folderQueries: [
                        {
                            folder: rootFolderA
                        }
                    ]
                };
                const { results, stats } = await runFileSearch(query);
                assert(stats.limitHit, 'Expected to return limitHit');
                assert.strictEqual(results.length, 1);
                compareURIs(results, reportedResults.slice(0, 1));
                assert(wasCanceled, 'Expected to be canceled when hitting limit');
            });
            test('max results = 2', async () => {
                const reportedResults = [
                    (0, resources_1.joinPath)(rootFolderA, 'file1.ts'),
                    (0, resources_1.joinPath)(rootFolderA, 'file2.ts'),
                    (0, resources_1.joinPath)(rootFolderA, 'file3.ts'),
                ];
                let wasCanceled = false;
                await registerTestFileSearchProvider({
                    provideFileSearchResults(query, options, token) {
                        disposables.add(token.onCancellationRequested(() => wasCanceled = true));
                        return Promise.resolve(reportedResults);
                    }
                });
                const query = {
                    type: 1 /* QueryType.File */,
                    filePattern: '',
                    maxResults: 2,
                    folderQueries: [
                        {
                            folder: rootFolderA
                        }
                    ]
                };
                const { results, stats } = await runFileSearch(query);
                assert(stats.limitHit, 'Expected to return limitHit');
                assert.strictEqual(results.length, 2);
                compareURIs(results, reportedResults.slice(0, 2));
                assert(wasCanceled, 'Expected to be canceled when hitting limit');
            });
            test('provider returns maxResults exactly', async () => {
                const reportedResults = [
                    (0, resources_1.joinPath)(rootFolderA, 'file1.ts'),
                    (0, resources_1.joinPath)(rootFolderA, 'file2.ts'),
                ];
                let wasCanceled = false;
                await registerTestFileSearchProvider({
                    provideFileSearchResults(query, options, token) {
                        disposables.add(token.onCancellationRequested(() => wasCanceled = true));
                        return Promise.resolve(reportedResults);
                    }
                });
                const query = {
                    type: 1 /* QueryType.File */,
                    filePattern: '',
                    maxResults: 2,
                    folderQueries: [
                        {
                            folder: rootFolderA
                        }
                    ]
                };
                const { results, stats } = await runFileSearch(query);
                assert(!stats.limitHit, 'Expected not to return limitHit');
                assert.strictEqual(results.length, 2);
                compareURIs(results, reportedResults);
                assert(!wasCanceled, 'Expected not to be canceled when just reaching limit');
            });
            test('multiroot max results', async () => {
                let cancels = 0;
                await registerTestFileSearchProvider({
                    async provideFileSearchResults(query, options, token) {
                        disposables.add(token.onCancellationRequested(() => cancels++));
                        // Provice results async so it has a chance to invoke every provider
                        await new Promise(r => process.nextTick(r));
                        return [
                            'file1.ts',
                            'file2.ts',
                            'file3.ts',
                        ].map(relativePath => (0, resources_1.joinPath)(options.folder, relativePath));
                    }
                });
                const query = {
                    type: 1 /* QueryType.File */,
                    filePattern: '',
                    maxResults: 2,
                    folderQueries: [
                        {
                            folder: rootFolderA
                        },
                        {
                            folder: rootFolderB
                        }
                    ]
                };
                const { results } = await runFileSearch(query);
                assert.strictEqual(results.length, 2); // Don't care which 2 we got
                assert.strictEqual(cancels, 2, 'Expected all invocations to be canceled when hitting limit');
            });
            test('works with non-file schemes', async () => {
                const reportedResults = [
                    (0, resources_1.joinPath)(fancySchemeFolderA, 'file1.ts'),
                    (0, resources_1.joinPath)(fancySchemeFolderA, 'file2.ts'),
                    (0, resources_1.joinPath)(fancySchemeFolderA, 'subfolder/file3.ts'),
                ];
                await registerTestFileSearchProvider({
                    provideFileSearchResults(query, options, token) {
                        return Promise.resolve(reportedResults);
                    }
                }, fancyScheme);
                const query = {
                    type: 1 /* QueryType.File */,
                    filePattern: '',
                    folderQueries: [
                        {
                            folder: fancySchemeFolderA
                        }
                    ]
                };
                const { results } = await runFileSearch(query);
                compareURIs(results, reportedResults);
            });
        });
        suite('Text:', () => {
            function makePreview(text) {
                return {
                    matches: [new extHostTypes_1.Range(0, 0, 0, text.length)],
                    text
                };
            }
            function makeTextResult(baseFolder, relativePath) {
                return {
                    preview: makePreview('foo'),
                    ranges: [new extHostTypes_1.Range(0, 0, 0, 3)],
                    uri: (0, resources_1.joinPath)(baseFolder, relativePath)
                };
            }
            function getSimpleQuery(queryText) {
                return {
                    type: 2 /* QueryType.Text */,
                    contentPattern: getPattern(queryText),
                    folderQueries: [
                        { folder: rootFolderA }
                    ]
                };
            }
            function getPattern(queryText) {
                return {
                    pattern: queryText
                };
            }
            function assertResults(actual, expected) {
                const actualTextSearchResults = [];
                for (const fileMatch of actual) {
                    // Make relative
                    for (const lineResult of fileMatch.results) {
                        if ((0, search_1.resultIsMatch)(lineResult)) {
                            actualTextSearchResults.push({
                                preview: {
                                    text: lineResult.preview.text,
                                    matches: (0, arrays_1.mapArrayOrNot)(lineResult.preview.matches, m => new extHostTypes_1.Range(m.startLineNumber, m.startColumn, m.endLineNumber, m.endColumn))
                                },
                                ranges: (0, arrays_1.mapArrayOrNot)(lineResult.ranges, r => new extHostTypes_1.Range(r.startLineNumber, r.startColumn, r.endLineNumber, r.endColumn)),
                                uri: fileMatch.resource
                            });
                        }
                        else {
                            actualTextSearchResults.push({
                                text: lineResult.text,
                                lineNumber: lineResult.lineNumber,
                                uri: fileMatch.resource
                            });
                        }
                    }
                }
                const rangeToString = (r) => `(${r.start.line}, ${r.start.character}), (${r.end.line}, ${r.end.character})`;
                const makeComparable = (results) => results
                    .sort((a, b) => {
                    const compareKeyA = a.uri.toString() + ': ' + (extensionResultIsMatch(a) ? a.preview.text : a.text);
                    const compareKeyB = b.uri.toString() + ': ' + (extensionResultIsMatch(b) ? b.preview.text : b.text);
                    return compareKeyB.localeCompare(compareKeyA);
                })
                    .map(r => extensionResultIsMatch(r) ? {
                    uri: r.uri.toString(),
                    range: (0, arrays_1.mapArrayOrNot)(r.ranges, rangeToString),
                    preview: {
                        text: r.preview.text,
                        match: null // Don't care about this right now
                    }
                } : {
                    uri: r.uri.toString(),
                    text: r.text,
                    lineNumber: r.lineNumber
                });
                return assert.deepStrictEqual(makeComparable(actualTextSearchResults), makeComparable(expected));
            }
            test('no results', async () => {
                await registerTestTextSearchProvider({
                    provideTextSearchResults(query, options, progress, token) {
                        return Promise.resolve(null);
                    }
                });
                const { results, stats } = await runTextSearch(getSimpleQuery('foo'));
                assert(!stats.limitHit);
                assert(!results.length);
            });
            test('basic results', async () => {
                const providedResults = [
                    makeTextResult(rootFolderA, 'file1.ts'),
                    makeTextResult(rootFolderA, 'file2.ts')
                ];
                await registerTestTextSearchProvider({
                    provideTextSearchResults(query, options, progress, token) {
                        providedResults.forEach(r => progress.report(r));
                        return Promise.resolve(null);
                    }
                });
                const { results, stats } = await runTextSearch(getSimpleQuery('foo'));
                assert(!stats.limitHit);
                assertResults(results, providedResults);
            });
            test('all provider calls get global include/excludes', async () => {
                await registerTestTextSearchProvider({
                    provideTextSearchResults(query, options, progress, token) {
                        assert.strictEqual(options.includes.length, 1);
                        assert.strictEqual(options.excludes.length, 1);
                        return Promise.resolve(null);
                    }
                });
                const query = {
                    type: 2 /* QueryType.Text */,
                    contentPattern: getPattern('foo'),
                    includePattern: {
                        '*.ts': true
                    },
                    excludePattern: {
                        '*.js': true
                    },
                    folderQueries: [
                        { folder: rootFolderA },
                        { folder: rootFolderB }
                    ]
                };
                await runTextSearch(query);
            });
            test('global/local include/excludes combined', async () => {
                await registerTestTextSearchProvider({
                    provideTextSearchResults(query, options, progress, token) {
                        if (options.folder.toString() === rootFolderA.toString()) {
                            assert.deepStrictEqual(options.includes.sort(), ['*.ts', 'foo']);
                            assert.deepStrictEqual(options.excludes.sort(), ['*.js', 'bar']);
                        }
                        else {
                            assert.deepStrictEqual(options.includes.sort(), ['*.ts']);
                            assert.deepStrictEqual(options.excludes.sort(), ['*.js']);
                        }
                        return Promise.resolve(null);
                    }
                });
                const query = {
                    type: 2 /* QueryType.Text */,
                    contentPattern: getPattern('foo'),
                    includePattern: {
                        '*.ts': true
                    },
                    excludePattern: {
                        '*.js': true
                    },
                    folderQueries: [
                        {
                            folder: rootFolderA,
                            includePattern: {
                                'foo': true
                            },
                            excludePattern: {
                                'bar': true
                            }
                        },
                        { folder: rootFolderB }
                    ]
                };
                await runTextSearch(query);
            });
            test('include/excludes resolved correctly', async () => {
                await registerTestTextSearchProvider({
                    provideTextSearchResults(query, options, progress, token) {
                        assert.deepStrictEqual(options.includes.sort(), ['*.jsx', '*.ts']);
                        assert.deepStrictEqual(options.excludes.sort(), []);
                        return Promise.resolve(null);
                    }
                });
                const query = {
                    type: 2 /* QueryType.Text */,
                    contentPattern: getPattern('foo'),
                    includePattern: {
                        '*.ts': true,
                        '*.jsx': false
                    },
                    excludePattern: {
                        '*.js': true,
                        '*.tsx': false
                    },
                    folderQueries: [
                        {
                            folder: rootFolderA,
                            includePattern: {
                                '*.jsx': true
                            },
                            excludePattern: {
                                '*.js': false
                            }
                        }
                    ]
                };
                await runTextSearch(query);
            });
            test('provider fail', async () => {
                await registerTestTextSearchProvider({
                    provideTextSearchResults(query, options, progress, token) {
                        throw new Error('Provider fail');
                    }
                });
                try {
                    await runTextSearch(getSimpleQuery('foo'));
                    assert(false, 'Expected to fail');
                }
                catch {
                    // expected to fail
                }
            });
            test('basic sibling clause', async () => {
                mockPFS.Promises = {
                    readdir: (_path) => {
                        if (_path === rootFolderA.fsPath) {
                            return Promise.resolve([
                                'file1.js',
                                'file1.ts'
                            ]);
                        }
                        else {
                            return Promise.reject(new Error('Wrong path'));
                        }
                    }
                };
                const providedResults = [
                    makeTextResult(rootFolderA, 'file1.js'),
                    makeTextResult(rootFolderA, 'file1.ts')
                ];
                await registerTestTextSearchProvider({
                    provideTextSearchResults(query, options, progress, token) {
                        providedResults.forEach(r => progress.report(r));
                        return Promise.resolve(null);
                    }
                });
                const query = {
                    type: 2 /* QueryType.Text */,
                    contentPattern: getPattern('foo'),
                    excludePattern: {
                        '*.js': {
                            when: '$(basename).ts'
                        }
                    },
                    folderQueries: [
                        { folder: rootFolderA }
                    ]
                };
                const { results } = await runTextSearch(query);
                assertResults(results, providedResults.slice(1));
            });
            test('multiroot sibling clause', async () => {
                mockPFS.Promises = {
                    readdir: (_path) => {
                        if (_path === (0, resources_1.joinPath)(rootFolderA, 'folder').fsPath) {
                            return Promise.resolve([
                                'fileA.scss',
                                'fileA.css',
                                'file2.css'
                            ]);
                        }
                        else if (_path === rootFolderB.fsPath) {
                            return Promise.resolve([
                                'fileB.ts',
                                'fileB.js',
                                'file3.js'
                            ]);
                        }
                        else {
                            return Promise.reject(new Error('Wrong path'));
                        }
                    }
                };
                await registerTestTextSearchProvider({
                    provideTextSearchResults(query, options, progress, token) {
                        let reportedResults;
                        if (options.folder.fsPath === rootFolderA.fsPath) {
                            reportedResults = [
                                makeTextResult(rootFolderA, 'folder/fileA.scss'),
                                makeTextResult(rootFolderA, 'folder/fileA.css'),
                                makeTextResult(rootFolderA, 'folder/file2.css')
                            ];
                        }
                        else {
                            reportedResults = [
                                makeTextResult(rootFolderB, 'fileB.ts'),
                                makeTextResult(rootFolderB, 'fileB.js'),
                                makeTextResult(rootFolderB, 'file3.js')
                            ];
                        }
                        reportedResults.forEach(r => progress.report(r));
                        return Promise.resolve(null);
                    }
                });
                const query = {
                    type: 2 /* QueryType.Text */,
                    contentPattern: getPattern('foo'),
                    excludePattern: {
                        '*.js': {
                            when: '$(basename).ts'
                        },
                        '*.css': true
                    },
                    folderQueries: [
                        {
                            folder: rootFolderA,
                            excludePattern: {
                                'folder/*.css': {
                                    when: '$(basename).scss'
                                }
                            }
                        },
                        {
                            folder: rootFolderB,
                            excludePattern: {
                                '*.js': false
                            }
                        }
                    ]
                };
                const { results } = await runTextSearch(query);
                assertResults(results, [
                    makeTextResult(rootFolderA, 'folder/fileA.scss'),
                    makeTextResult(rootFolderA, 'folder/file2.css'),
                    makeTextResult(rootFolderB, 'fileB.ts'),
                    makeTextResult(rootFolderB, 'fileB.js'),
                    makeTextResult(rootFolderB, 'file3.js')
                ]);
            });
            test('include pattern applied', async () => {
                const providedResults = [
                    makeTextResult(rootFolderA, 'file1.js'),
                    makeTextResult(rootFolderA, 'file1.ts')
                ];
                await registerTestTextSearchProvider({
                    provideTextSearchResults(query, options, progress, token) {
                        providedResults.forEach(r => progress.report(r));
                        return Promise.resolve(null);
                    }
                });
                const query = {
                    type: 2 /* QueryType.Text */,
                    contentPattern: getPattern('foo'),
                    includePattern: {
                        '*.ts': true
                    },
                    folderQueries: [
                        { folder: rootFolderA }
                    ]
                };
                const { results } = await runTextSearch(query);
                assertResults(results, providedResults.slice(1));
            });
            test('max results = 1', async () => {
                const providedResults = [
                    makeTextResult(rootFolderA, 'file1.ts'),
                    makeTextResult(rootFolderA, 'file2.ts')
                ];
                let wasCanceled = false;
                await registerTestTextSearchProvider({
                    provideTextSearchResults(query, options, progress, token) {
                        disposables.add(token.onCancellationRequested(() => wasCanceled = true));
                        providedResults.forEach(r => progress.report(r));
                        return Promise.resolve(null);
                    }
                });
                const query = {
                    type: 2 /* QueryType.Text */,
                    contentPattern: getPattern('foo'),
                    maxResults: 1,
                    folderQueries: [
                        { folder: rootFolderA }
                    ]
                };
                const { results, stats } = await runTextSearch(query);
                assert(stats.limitHit, 'Expected to return limitHit');
                assertResults(results, providedResults.slice(0, 1));
                assert(wasCanceled, 'Expected to be canceled');
            });
            test('max results = 2', async () => {
                const providedResults = [
                    makeTextResult(rootFolderA, 'file1.ts'),
                    makeTextResult(rootFolderA, 'file2.ts'),
                    makeTextResult(rootFolderA, 'file3.ts')
                ];
                let wasCanceled = false;
                await registerTestTextSearchProvider({
                    provideTextSearchResults(query, options, progress, token) {
                        disposables.add(token.onCancellationRequested(() => wasCanceled = true));
                        providedResults.forEach(r => progress.report(r));
                        return Promise.resolve(null);
                    }
                });
                const query = {
                    type: 2 /* QueryType.Text */,
                    contentPattern: getPattern('foo'),
                    maxResults: 2,
                    folderQueries: [
                        { folder: rootFolderA }
                    ]
                };
                const { results, stats } = await runTextSearch(query);
                assert(stats.limitHit, 'Expected to return limitHit');
                assertResults(results, providedResults.slice(0, 2));
                assert(wasCanceled, 'Expected to be canceled');
            });
            test('provider returns maxResults exactly', async () => {
                const providedResults = [
                    makeTextResult(rootFolderA, 'file1.ts'),
                    makeTextResult(rootFolderA, 'file2.ts')
                ];
                let wasCanceled = false;
                await registerTestTextSearchProvider({
                    provideTextSearchResults(query, options, progress, token) {
                        disposables.add(token.onCancellationRequested(() => wasCanceled = true));
                        providedResults.forEach(r => progress.report(r));
                        return Promise.resolve(null);
                    }
                });
                const query = {
                    type: 2 /* QueryType.Text */,
                    contentPattern: getPattern('foo'),
                    maxResults: 2,
                    folderQueries: [
                        { folder: rootFolderA }
                    ]
                };
                const { results, stats } = await runTextSearch(query);
                assert(!stats.limitHit, 'Expected not to return limitHit');
                assertResults(results, providedResults);
                assert(!wasCanceled, 'Expected not to be canceled');
            });
            test('provider returns early with limitHit', async () => {
                const providedResults = [
                    makeTextResult(rootFolderA, 'file1.ts'),
                    makeTextResult(rootFolderA, 'file2.ts'),
                    makeTextResult(rootFolderA, 'file3.ts')
                ];
                await registerTestTextSearchProvider({
                    provideTextSearchResults(query, options, progress, token) {
                        providedResults.forEach(r => progress.report(r));
                        return Promise.resolve({ limitHit: true });
                    }
                });
                const query = {
                    type: 2 /* QueryType.Text */,
                    contentPattern: getPattern('foo'),
                    maxResults: 1000,
                    folderQueries: [
                        { folder: rootFolderA }
                    ]
                };
                const { results, stats } = await runTextSearch(query);
                assert(stats.limitHit, 'Expected to return limitHit');
                assertResults(results, providedResults);
            });
            test('multiroot max results', async () => {
                let cancels = 0;
                await registerTestTextSearchProvider({
                    async provideTextSearchResults(query, options, progress, token) {
                        disposables.add(token.onCancellationRequested(() => cancels++));
                        await new Promise(r => process.nextTick(r));
                        [
                            'file1.ts',
                            'file2.ts',
                            'file3.ts',
                        ].forEach(f => progress.report(makeTextResult(options.folder, f)));
                        return null;
                    }
                });
                const query = {
                    type: 2 /* QueryType.Text */,
                    contentPattern: getPattern('foo'),
                    maxResults: 2,
                    folderQueries: [
                        { folder: rootFolderA },
                        { folder: rootFolderB }
                    ]
                };
                const { results } = await runTextSearch(query);
                assert.strictEqual(results.length, 2);
                assert.strictEqual(cancels, 2);
            });
            test('works with non-file schemes', async () => {
                const providedResults = [
                    makeTextResult(fancySchemeFolderA, 'file1.ts'),
                    makeTextResult(fancySchemeFolderA, 'file2.ts'),
                    makeTextResult(fancySchemeFolderA, 'file3.ts')
                ];
                await registerTestTextSearchProvider({
                    provideTextSearchResults(query, options, progress, token) {
                        providedResults.forEach(r => progress.report(r));
                        return Promise.resolve(null);
                    }
                }, fancyScheme);
                const query = {
                    type: 2 /* QueryType.Text */,
                    contentPattern: getPattern('foo'),
                    folderQueries: [
                        { folder: fancySchemeFolderA }
                    ]
                };
                const { results } = await runTextSearch(query);
                assertResults(results, providedResults);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFNlYXJjaC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS90ZXN0L25vZGUvZXh0SG9zdFNlYXJjaC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBd0JoRyxJQUFJLFdBQTRCLENBQUM7SUFDakMsSUFBSSxhQUFrQyxDQUFDO0lBRXZDLElBQUksb0JBQTBDLENBQUM7SUFDL0MsTUFBTSxvQkFBb0I7UUFBMUI7WUFHQyxZQUFPLEdBQTBDLEVBQUUsQ0FBQztRQTBCckQsQ0FBQztRQXhCQSwyQkFBMkIsQ0FBQyxNQUFjLEVBQUUsTUFBYztZQUN6RCxJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQztRQUMxQixDQUFDO1FBRUQsMkJBQTJCLENBQUMsTUFBYyxFQUFFLE1BQWM7WUFDekQsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUM7UUFDMUIsQ0FBQztRQUVELG1CQUFtQixDQUFDLE1BQWM7UUFDbEMsQ0FBQztRQUVELGdCQUFnQixDQUFDLE1BQWMsRUFBRSxPQUFlLEVBQUUsSUFBcUI7WUFDdEUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUM1QixDQUFDO1FBRUQsZ0JBQWdCLENBQUMsTUFBYyxFQUFFLE9BQWUsRUFBRSxJQUFzQjtZQUN2RSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQzVCLENBQUM7UUFFRCxnQkFBZ0IsQ0FBQyxTQUFpQixFQUFFLElBQVM7UUFDN0MsQ0FBQztRQUVELE9BQU87UUFDUCxDQUFDO0tBQ0Q7SUFFRCxJQUFJLE9BQTRCLENBQUM7SUFFakMsU0FBUyxzQkFBc0IsQ0FBQyxJQUE2QjtRQUM1RCxPQUFPLENBQUMsQ0FBMEIsSUFBSyxDQUFDLE9BQU8sQ0FBQztJQUNq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