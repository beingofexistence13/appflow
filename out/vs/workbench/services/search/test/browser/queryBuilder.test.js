define(["require", "exports", "assert", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/uri", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/workspace/common/workspace", "vs/platform/workspaces/common/workspaces", "vs/workbench/services/search/common/queryBuilder", "vs/workbench/services/path/common/pathService", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/test/common/workbenchTestServices", "vs/platform/environment/common/environment", "vs/platform/workspace/test/common/testWorkspace", "vs/base/common/resources"], function (require, exports, assert, path_1, platform_1, uri_1, configuration_1, testConfigurationService_1, instantiationServiceMock_1, workspace_1, workspaces_1, queryBuilder_1, pathService_1, workbenchTestServices_1, workbenchTestServices_2, environment_1, testWorkspace_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.normalizeExpression = exports.fixPath = exports.getUri = exports.patternsToIExpression = exports.globalGlob = exports.cleanUndefinedQueryValues = exports.assertEqualSearchPathResults = exports.assertEqualQueries = void 0;
    const DEFAULT_EDITOR_CONFIG = {};
    const DEFAULT_USER_CONFIG = { useRipgrep: true, useIgnoreFiles: true, useGlobalIgnoreFiles: true, useParentIgnoreFiles: true };
    const DEFAULT_QUERY_PROPS = {};
    const DEFAULT_TEXT_QUERY_PROPS = { usePCRE2: false };
    suite('QueryBuilder', () => {
        const PATTERN_INFO = { pattern: 'a' };
        const ROOT_1 = fixPath('/foo/root1');
        const ROOT_1_URI = getUri(ROOT_1);
        const ROOT_1_NAMED_FOLDER = (0, workspace_1.toWorkspaceFolder)(ROOT_1_URI);
        const WS_CONFIG_PATH = getUri('/bar/test.code-workspace'); // location of the workspace file (not important except that it is a file URI)
        let instantiationService;
        let queryBuilder;
        let mockConfigService;
        let mockContextService;
        let mockWorkspace;
        setup(() => {
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            mockConfigService = new testConfigurationService_1.TestConfigurationService();
            mockConfigService.setUserConfiguration('search', DEFAULT_USER_CONFIG);
            mockConfigService.setUserConfiguration('editor', DEFAULT_EDITOR_CONFIG);
            instantiationService.stub(configuration_1.IConfigurationService, mockConfigService);
            mockContextService = new workbenchTestServices_2.TestContextService();
            mockWorkspace = new testWorkspace_1.Workspace('workspace', [(0, workspace_1.toWorkspaceFolder)(ROOT_1_URI)]);
            mockContextService.setWorkspace(mockWorkspace);
            instantiationService.stub(workspace_1.IWorkspaceContextService, mockContextService);
            instantiationService.stub(environment_1.IEnvironmentService, workbenchTestServices_1.TestEnvironmentService);
            instantiationService.stub(pathService_1.IPathService, new workbenchTestServices_1.TestPathService());
            queryBuilder = instantiationService.createInstance(queryBuilder_1.QueryBuilder);
        });
        teardown(() => {
            instantiationService.dispose();
        });
        test('simple text pattern', () => {
            assertEqualTextQueries(queryBuilder.text(PATTERN_INFO), {
                folderQueries: [],
                contentPattern: PATTERN_INFO,
                type: 2 /* QueryType.Text */
            });
        });
        test('normalize literal newlines', () => {
            assertEqualTextQueries(queryBuilder.text({ pattern: 'foo\nbar', isRegExp: true }), {
                folderQueries: [],
                contentPattern: {
                    pattern: 'foo\\nbar',
                    isRegExp: true,
                    isMultiline: true
                },
                type: 2 /* QueryType.Text */
            });
            assertEqualTextQueries(queryBuilder.text({ pattern: 'foo\nbar', isRegExp: false }), {
                folderQueries: [],
                contentPattern: {
                    pattern: 'foo\nbar',
                    isRegExp: false,
                    isMultiline: true
                },
                type: 2 /* QueryType.Text */
            });
        });
        test('splits include pattern when expandPatterns enabled', () => {
            assertEqualQueries(queryBuilder.file([ROOT_1_NAMED_FOLDER], { includePattern: '**/foo, **/bar', expandPatterns: true }), {
                folderQueries: [{
                        folder: ROOT_1_URI
                    }],
                type: 1 /* QueryType.File */,
                includePattern: {
                    '**/foo': true,
                    '**/foo/**': true,
                    '**/bar': true,
                    '**/bar/**': true,
                }
            });
        });
        test('does not split include pattern when expandPatterns disabled', () => {
            assertEqualQueries(queryBuilder.file([ROOT_1_NAMED_FOLDER], { includePattern: '**/foo, **/bar' }), {
                folderQueries: [{
                        folder: ROOT_1_URI
                    }],
                type: 1 /* QueryType.File */,
                includePattern: {
                    '**/foo, **/bar': true
                }
            });
        });
        test('includePattern array', () => {
            assertEqualQueries(queryBuilder.file([ROOT_1_NAMED_FOLDER], { includePattern: ['**/foo', '**/bar'] }), {
                folderQueries: [{
                        folder: ROOT_1_URI
                    }],
                type: 1 /* QueryType.File */,
                includePattern: {
                    '**/foo': true,
                    '**/bar': true
                }
            });
        });
        test('includePattern array with expandPatterns', () => {
            assertEqualQueries(queryBuilder.file([ROOT_1_NAMED_FOLDER], { includePattern: ['**/foo', '**/bar'], expandPatterns: true }), {
                folderQueries: [{
                        folder: ROOT_1_URI
                    }],
                type: 1 /* QueryType.File */,
                includePattern: {
                    '**/foo': true,
                    '**/foo/**': true,
                    '**/bar': true,
                    '**/bar/**': true,
                }
            });
        });
        test('folderResources', () => {
            assertEqualTextQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI]), {
                contentPattern: PATTERN_INFO,
                folderQueries: [{ folder: ROOT_1_URI }],
                type: 2 /* QueryType.Text */
            });
        });
        test('simple exclude setting', () => {
            mockConfigService.setUserConfiguration('search', {
                ...DEFAULT_USER_CONFIG,
                exclude: {
                    'bar/**': true,
                    'foo/**': {
                        'when': '$(basename).ts'
                    }
                }
            });
            assertEqualTextQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI], {
                expandPatterns: true // verify that this doesn't affect patterns from configuration
            }), {
                contentPattern: PATTERN_INFO,
                folderQueries: [{
                        folder: ROOT_1_URI,
                        excludePattern: {
                            'bar/**': true,
                            'foo/**': {
                                'when': '$(basename).ts'
                            }
                        }
                    }],
                type: 2 /* QueryType.Text */
            });
        });
        test('simple include', () => {
            assertEqualTextQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI], {
                includePattern: 'bar',
                expandPatterns: true
            }), {
                contentPattern: PATTERN_INFO,
                folderQueries: [{
                        folder: ROOT_1_URI
                    }],
                includePattern: {
                    '**/bar': true,
                    '**/bar/**': true
                },
                type: 2 /* QueryType.Text */
            });
            assertEqualTextQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI], {
                includePattern: 'bar'
            }), {
                contentPattern: PATTERN_INFO,
                folderQueries: [{
                        folder: ROOT_1_URI
                    }],
                includePattern: {
                    'bar': true
                },
                type: 2 /* QueryType.Text */
            });
        });
        test('simple include with ./ syntax', () => {
            assertEqualTextQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI], {
                includePattern: './bar',
                expandPatterns: true
            }), {
                contentPattern: PATTERN_INFO,
                folderQueries: [{
                        folder: ROOT_1_URI,
                        includePattern: {
                            'bar': true,
                            'bar/**': true
                        }
                    }],
                type: 2 /* QueryType.Text */
            });
            assertEqualTextQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI], {
                includePattern: '.\\bar',
                expandPatterns: true
            }), {
                contentPattern: PATTERN_INFO,
                folderQueries: [{
                        folder: ROOT_1_URI,
                        includePattern: {
                            'bar': true,
                            'bar/**': true
                        }
                    }],
                type: 2 /* QueryType.Text */
            });
        });
        test('exclude setting and searchPath', () => {
            mockConfigService.setUserConfiguration('search', {
                ...DEFAULT_USER_CONFIG,
                exclude: {
                    'foo/**/*.js': true,
                    'bar/**': {
                        'when': '$(basename).ts'
                    }
                }
            });
            assertEqualTextQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI], {
                includePattern: './foo',
                expandPatterns: true
            }), {
                contentPattern: PATTERN_INFO,
                folderQueries: [{
                        folder: ROOT_1_URI,
                        includePattern: {
                            'foo': true,
                            'foo/**': true
                        },
                        excludePattern: {
                            'foo/**/*.js': true,
                            'bar/**': {
                                'when': '$(basename).ts'
                            }
                        }
                    }],
                type: 2 /* QueryType.Text */
            });
        });
        test('multiroot exclude settings', () => {
            const ROOT_2 = fixPath('/project/root2');
            const ROOT_2_URI = getUri(ROOT_2);
            const ROOT_3 = fixPath('/project/root3');
            const ROOT_3_URI = getUri(ROOT_3);
            mockWorkspace.folders = (0, workspaces_1.toWorkspaceFolders)([{ path: ROOT_1_URI.fsPath }, { path: ROOT_2_URI.fsPath }, { path: ROOT_3_URI.fsPath }], WS_CONFIG_PATH, resources_1.extUriBiasedIgnorePathCase);
            mockWorkspace.configuration = uri_1.URI.file(fixPath('/config'));
            mockConfigService.setUserConfiguration('search', {
                ...DEFAULT_USER_CONFIG,
                exclude: { 'foo/**/*.js': true }
            }, ROOT_1_URI);
            mockConfigService.setUserConfiguration('search', {
                ...DEFAULT_USER_CONFIG,
                exclude: { 'bar': true }
            }, ROOT_2_URI);
            // There are 3 roots, the first two have search.exclude settings, test that the correct basic query is returned
            assertEqualTextQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI, ROOT_2_URI, ROOT_3_URI]), {
                contentPattern: PATTERN_INFO,
                folderQueries: [
                    { folder: ROOT_1_URI, excludePattern: patternsToIExpression('foo/**/*.js') },
                    { folder: ROOT_2_URI, excludePattern: patternsToIExpression('bar') },
                    { folder: ROOT_3_URI }
                ],
                type: 2 /* QueryType.Text */
            });
            // Now test that it merges the root excludes when an 'include' is used
            assertEqualTextQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI, ROOT_2_URI, ROOT_3_URI], {
                includePattern: './root2/src',
                expandPatterns: true
            }), {
                contentPattern: PATTERN_INFO,
                folderQueries: [
                    {
                        folder: ROOT_2_URI,
                        includePattern: {
                            'src': true,
                            'src/**': true
                        },
                        excludePattern: {
                            'bar': true
                        },
                    }
                ],
                type: 2 /* QueryType.Text */
            });
        });
        test('simple exclude input pattern', () => {
            assertEqualTextQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI], {
                excludePattern: 'foo',
                expandPatterns: true
            }), {
                contentPattern: PATTERN_INFO,
                folderQueries: [{
                        folder: ROOT_1_URI
                    }],
                type: 2 /* QueryType.Text */,
                excludePattern: patternsToIExpression(...globalGlob('foo'))
            });
        });
        test('file pattern trimming', () => {
            const content = 'content';
            assertEqualQueries(queryBuilder.file([], { filePattern: ` ${content} ` }), {
                folderQueries: [],
                filePattern: content,
                type: 1 /* QueryType.File */
            });
        });
        test('exclude ./ syntax', () => {
            assertEqualTextQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI], {
                excludePattern: './bar',
                expandPatterns: true
            }), {
                contentPattern: PATTERN_INFO,
                folderQueries: [{
                        folder: ROOT_1_URI,
                        excludePattern: patternsToIExpression('bar', 'bar/**'),
                    }],
                type: 2 /* QueryType.Text */
            });
            assertEqualTextQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI], {
                excludePattern: './bar/**/*.ts',
                expandPatterns: true
            }), {
                contentPattern: PATTERN_INFO,
                folderQueries: [{
                        folder: ROOT_1_URI,
                        excludePattern: patternsToIExpression('bar/**/*.ts', 'bar/**/*.ts/**'),
                    }],
                type: 2 /* QueryType.Text */
            });
            assertEqualTextQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI], {
                excludePattern: '.\\bar\\**\\*.ts',
                expandPatterns: true
            }), {
                contentPattern: PATTERN_INFO,
                folderQueries: [{
                        folder: ROOT_1_URI,
                        excludePattern: patternsToIExpression('bar/**/*.ts', 'bar/**/*.ts/**'),
                    }],
                type: 2 /* QueryType.Text */
            });
        });
        test('extraFileResources', () => {
            assertEqualTextQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI], { extraFileResources: [getUri('/foo/bar.js')] }), {
                contentPattern: PATTERN_INFO,
                folderQueries: [{
                        folder: ROOT_1_URI
                    }],
                extraFileResources: [getUri('/foo/bar.js')],
                type: 2 /* QueryType.Text */
            });
            assertEqualTextQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI], {
                extraFileResources: [getUri('/foo/bar.js')],
                excludePattern: '*.js',
                expandPatterns: true
            }), {
                contentPattern: PATTERN_INFO,
                folderQueries: [{
                        folder: ROOT_1_URI
                    }],
                excludePattern: patternsToIExpression(...globalGlob('*.js')),
                type: 2 /* QueryType.Text */
            });
            assertEqualTextQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI], {
                extraFileResources: [getUri('/foo/bar.js')],
                includePattern: '*.txt',
                expandPatterns: true
            }), {
                contentPattern: PATTERN_INFO,
                folderQueries: [{
                        folder: ROOT_1_URI
                    }],
                includePattern: patternsToIExpression(...globalGlob('*.txt')),
                type: 2 /* QueryType.Text */
            });
        });
        suite('parseSearchPaths 1', () => {
            test('simple includes', () => {
                function testSimpleIncludes(includePattern, expectedPatterns) {
                    const result = queryBuilder.parseSearchPaths(includePattern);
                    assert.deepStrictEqual({ ...result.pattern }, patternsToIExpression(...expectedPatterns), includePattern);
                    assert.strictEqual(result.searchPaths, undefined);
                }
                [
                    ['a', ['**/a/**', '**/a']],
                    ['a/b', ['**/a/b', '**/a/b/**']],
                    ['a/b,  c', ['**/a/b', '**/c', '**/a/b/**', '**/c/**']],
                    ['a,.txt', ['**/a', '**/a/**', '**/*.txt', '**/*.txt/**']],
                    ['a,,,b', ['**/a', '**/a/**', '**/b', '**/b/**']],
                    ['**/a,b/**', ['**/a', '**/a/**', '**/b/**']]
                ].forEach(([includePattern, expectedPatterns]) => testSimpleIncludes(includePattern, expectedPatterns));
            });
            function testIncludes(includePattern, expectedResult) {
                let actual;
                try {
                    actual = queryBuilder.parseSearchPaths(includePattern);
                }
                catch (_) {
                    actual = { searchPaths: [] };
                }
                assertEqualSearchPathResults(actual, expectedResult, includePattern);
            }
            function testIncludesDataItem([includePattern, expectedResult]) {
                testIncludes(includePattern, expectedResult);
            }
            test('absolute includes', () => {
                const cases = [
                    [
                        fixPath('/foo/bar'),
                        {
                            searchPaths: [{ searchPath: getUri('/foo/bar') }]
                        }
                    ],
                    [
                        fixPath('/foo/bar') + ',' + 'a',
                        {
                            searchPaths: [{ searchPath: getUri('/foo/bar') }],
                            pattern: patternsToIExpression(...globalGlob('a'))
                        }
                    ],
                    [
                        fixPath('/foo/bar') + ',' + fixPath('/1/2'),
                        {
                            searchPaths: [{ searchPath: getUri('/foo/bar') }, { searchPath: getUri('/1/2') }]
                        }
                    ],
                    [
                        fixPath('/foo/bar') + ',' + fixPath('/foo/../foo/bar/fooar/..'),
                        {
                            searchPaths: [{
                                    searchPath: getUri('/foo/bar')
                                }]
                        }
                    ],
                    [
                        fixPath('/foo/bar/**/*.ts'),
                        {
                            searchPaths: [{
                                    searchPath: getUri('/foo/bar'),
                                    pattern: patternsToIExpression('**/*.ts', '**/*.ts/**')
                                }]
                        }
                    ],
                    [
                        fixPath('/foo/bar/*a/b/c'),
                        {
                            searchPaths: [{
                                    searchPath: getUri('/foo/bar'),
                                    pattern: patternsToIExpression('*a/b/c', '*a/b/c/**')
                                }]
                        }
                    ],
                    [
                        fixPath('/*a/b/c'),
                        {
                            searchPaths: [{
                                    searchPath: getUri('/'),
                                    pattern: patternsToIExpression('*a/b/c', '*a/b/c/**')
                                }]
                        }
                    ],
                    [
                        fixPath('/foo/{b,c}ar'),
                        {
                            searchPaths: [{
                                    searchPath: getUri('/foo'),
                                    pattern: patternsToIExpression('{b,c}ar', '{b,c}ar/**')
                                }]
                        }
                    ]
                ];
                cases.forEach(testIncludesDataItem);
            });
            test('relative includes w/single root folder', () => {
                const cases = [
                    [
                        './a',
                        {
                            searchPaths: [{
                                    searchPath: ROOT_1_URI,
                                    pattern: patternsToIExpression('a', 'a/**')
                                }]
                        }
                    ],
                    [
                        './a/',
                        {
                            searchPaths: [{
                                    searchPath: ROOT_1_URI,
                                    pattern: patternsToIExpression('a', 'a/**')
                                }]
                        }
                    ],
                    [
                        './a/*b/c',
                        {
                            searchPaths: [{
                                    searchPath: ROOT_1_URI,
                                    pattern: patternsToIExpression('a/*b/c', 'a/*b/c/**')
                                }]
                        }
                    ],
                    [
                        './a/*b/c, ' + fixPath('/project/foo'),
                        {
                            searchPaths: [
                                {
                                    searchPath: ROOT_1_URI,
                                    pattern: patternsToIExpression('a/*b/c', 'a/*b/c/**')
                                },
                                {
                                    searchPath: getUri('/project/foo')
                                }
                            ]
                        }
                    ],
                    [
                        './a/b/,./c/d',
                        {
                            searchPaths: [{
                                    searchPath: ROOT_1_URI,
                                    pattern: patternsToIExpression('a/b', 'a/b/**', 'c/d', 'c/d/**')
                                }]
                        }
                    ],
                    [
                        '../',
                        {
                            searchPaths: [{
                                    searchPath: getUri('/foo')
                                }]
                        }
                    ],
                    [
                        '..',
                        {
                            searchPaths: [{
                                    searchPath: getUri('/foo')
                                }]
                        }
                    ],
                    [
                        '..\\bar',
                        {
                            searchPaths: [{
                                    searchPath: getUri('/foo/bar')
                                }]
                        }
                    ]
                ];
                cases.forEach(testIncludesDataItem);
            });
            test('relative includes w/two root folders', () => {
                const ROOT_2 = '/project/root2';
                mockWorkspace.folders = (0, workspaces_1.toWorkspaceFolders)([{ path: ROOT_1_URI.fsPath }, { path: getUri(ROOT_2).fsPath }], WS_CONFIG_PATH, resources_1.extUriBiasedIgnorePathCase);
                mockWorkspace.configuration = uri_1.URI.file(fixPath('config'));
                const cases = [
                    [
                        './root1',
                        {
                            searchPaths: [{
                                    searchPath: getUri(ROOT_1)
                                }]
                        }
                    ],
                    [
                        './root2',
                        {
                            searchPaths: [{
                                    searchPath: getUri(ROOT_2),
                                }]
                        }
                    ],
                    [
                        './root1/a/**/b, ./root2/**/*.txt',
                        {
                            searchPaths: [
                                {
                                    searchPath: ROOT_1_URI,
                                    pattern: patternsToIExpression('a/**/b', 'a/**/b/**')
                                },
                                {
                                    searchPath: getUri(ROOT_2),
                                    pattern: patternsToIExpression('**/*.txt', '**/*.txt/**')
                                }
                            ]
                        }
                    ]
                ];
                cases.forEach(testIncludesDataItem);
            });
            test('include ./foldername', () => {
                const ROOT_2 = '/project/root2';
                const ROOT_1_FOLDERNAME = 'foldername';
                mockWorkspace.folders = (0, workspaces_1.toWorkspaceFolders)([{ path: ROOT_1_URI.fsPath, name: ROOT_1_FOLDERNAME }, { path: getUri(ROOT_2).fsPath }], WS_CONFIG_PATH, resources_1.extUriBiasedIgnorePathCase);
                mockWorkspace.configuration = uri_1.URI.file(fixPath('config'));
                const cases = [
                    [
                        './foldername',
                        {
                            searchPaths: [{
                                    searchPath: ROOT_1_URI
                                }]
                        }
                    ],
                    [
                        './foldername/foo',
                        {
                            searchPaths: [{
                                    searchPath: ROOT_1_URI,
                                    pattern: patternsToIExpression('foo', 'foo/**')
                                }]
                        }
                    ]
                ];
                cases.forEach(testIncludesDataItem);
            });
            test('folder with slash in the name', () => {
                const ROOT_2 = '/project/root2';
                const ROOT_2_URI = getUri(ROOT_2);
                const ROOT_1_FOLDERNAME = 'folder/one';
                const ROOT_2_FOLDERNAME = 'folder/two+'; // And another regex character, #126003
                mockWorkspace.folders = (0, workspaces_1.toWorkspaceFolders)([{ path: ROOT_1_URI.fsPath, name: ROOT_1_FOLDERNAME }, { path: ROOT_2_URI.fsPath, name: ROOT_2_FOLDERNAME }], WS_CONFIG_PATH, resources_1.extUriBiasedIgnorePathCase);
                mockWorkspace.configuration = uri_1.URI.file(fixPath('config'));
                const cases = [
                    [
                        './folder/one',
                        {
                            searchPaths: [{
                                    searchPath: ROOT_1_URI
                                }]
                        }
                    ],
                    [
                        './folder/two+/foo/',
                        {
                            searchPaths: [{
                                    searchPath: ROOT_2_URI,
                                    pattern: patternsToIExpression('foo', 'foo/**')
                                }]
                        }
                    ],
                    [
                        './folder/onesomethingelse',
                        { searchPaths: [] }
                    ],
                    [
                        './folder/onesomethingelse/foo',
                        { searchPaths: [] }
                    ],
                    [
                        './folder',
                        { searchPaths: [] }
                    ]
                ];
                cases.forEach(testIncludesDataItem);
            });
            test('relative includes w/multiple ambiguous root folders', () => {
                const ROOT_2 = '/project/rootB';
                const ROOT_3 = '/otherproject/rootB';
                mockWorkspace.folders = (0, workspaces_1.toWorkspaceFolders)([{ path: ROOT_1_URI.fsPath }, { path: getUri(ROOT_2).fsPath }, { path: getUri(ROOT_3).fsPath }], WS_CONFIG_PATH, resources_1.extUriBiasedIgnorePathCase);
                mockWorkspace.configuration = uri_1.URI.file(fixPath('/config'));
                const cases = [
                    [
                        '',
                        {
                            searchPaths: undefined
                        }
                    ],
                    [
                        './',
                        {
                            searchPaths: undefined
                        }
                    ],
                    [
                        './root1',
                        {
                            searchPaths: [{
                                    searchPath: getUri(ROOT_1)
                                }]
                        }
                    ],
                    [
                        './root1,./',
                        {
                            searchPaths: [{
                                    searchPath: getUri(ROOT_1)
                                }]
                        }
                    ],
                    [
                        './rootB',
                        {
                            searchPaths: [
                                {
                                    searchPath: getUri(ROOT_2),
                                },
                                {
                                    searchPath: getUri(ROOT_3),
                                }
                            ]
                        }
                    ],
                    [
                        './rootB/a/**/b, ./rootB/b/**/*.txt',
                        {
                            searchPaths: [
                                {
                                    searchPath: getUri(ROOT_2),
                                    pattern: patternsToIExpression('a/**/b', 'a/**/b/**', 'b/**/*.txt', 'b/**/*.txt/**')
                                },
                                {
                                    searchPath: getUri(ROOT_3),
                                    pattern: patternsToIExpression('a/**/b', 'a/**/b/**', 'b/**/*.txt', 'b/**/*.txt/**')
                                }
                            ]
                        }
                    ],
                    [
                        './root1/**/foo/, bar/',
                        {
                            pattern: patternsToIExpression('**/bar', '**/bar/**'),
                            searchPaths: [
                                {
                                    searchPath: ROOT_1_URI,
                                    pattern: patternsToIExpression('**/foo', '**/foo/**')
                                }
                            ]
                        }
                    ]
                ];
                cases.forEach(testIncludesDataItem);
            });
        });
        suite('parseSearchPaths 2', () => {
            function testIncludes(includePattern, expectedResult) {
                assertEqualSearchPathResults(queryBuilder.parseSearchPaths(includePattern), expectedResult, includePattern);
            }
            function testIncludesDataItem([includePattern, expectedResult]) {
                testIncludes(includePattern, expectedResult);
            }
            (platform_1.isWindows ? test.skip : test)('includes with tilde', () => {
                const userHome = uri_1.URI.file('/');
                const cases = [
                    [
                        '~/foo/bar',
                        {
                            searchPaths: [{ searchPath: getUri(userHome.fsPath, '/foo/bar') }]
                        }
                    ],
                    [
                        '~/foo/bar, a',
                        {
                            searchPaths: [{ searchPath: getUri(userHome.fsPath, '/foo/bar') }],
                            pattern: patternsToIExpression(...globalGlob('a'))
                        }
                    ],
                    [
                        fixPath('/foo/~/bar'),
                        {
                            searchPaths: [{ searchPath: getUri('/foo/~/bar') }]
                        }
                    ],
                ];
                cases.forEach(testIncludesDataItem);
            });
        });
        suite('smartCase', () => {
            test('no flags -> no change', () => {
                const query = queryBuilder.text({
                    pattern: 'a'
                }, []);
                assert(!query.contentPattern.isCaseSensitive);
            });
            test('maintains isCaseSensitive when smartCase not set', () => {
                const query = queryBuilder.text({
                    pattern: 'a',
                    isCaseSensitive: true
                }, []);
                assert(query.contentPattern.isCaseSensitive);
            });
            test('maintains isCaseSensitive when smartCase set', () => {
                const query = queryBuilder.text({
                    pattern: 'a',
                    isCaseSensitive: true
                }, [], {
                    isSmartCase: true
                });
                assert(query.contentPattern.isCaseSensitive);
            });
            test('smartCase determines not case sensitive', () => {
                const query = queryBuilder.text({
                    pattern: 'abcd'
                }, [], {
                    isSmartCase: true
                });
                assert(!query.contentPattern.isCaseSensitive);
            });
            test('smartCase determines case sensitive', () => {
                const query = queryBuilder.text({
                    pattern: 'abCd'
                }, [], {
                    isSmartCase: true
                });
                assert(query.contentPattern.isCaseSensitive);
            });
            test('smartCase determines not case sensitive (regex)', () => {
                const query = queryBuilder.text({
                    pattern: 'ab\\Sd',
                    isRegExp: true
                }, [], {
                    isSmartCase: true
                });
                assert(!query.contentPattern.isCaseSensitive);
            });
            test('smartCase determines case sensitive (regex)', () => {
                const query = queryBuilder.text({
                    pattern: 'ab[A-Z]d',
                    isRegExp: true
                }, [], {
                    isSmartCase: true
                });
                assert(query.contentPattern.isCaseSensitive);
            });
        });
        suite('file', () => {
            test('simple file query', () => {
                const cacheKey = 'asdf';
                const query = queryBuilder.file([ROOT_1_NAMED_FOLDER], {
                    cacheKey,
                    sortByScore: true
                });
                assert.strictEqual(query.folderQueries.length, 1);
                assert.strictEqual(query.cacheKey, cacheKey);
                assert(query.sortByScore);
            });
        });
    });
    function assertEqualTextQueries(actual, expected) {
        expected = {
            ...DEFAULT_TEXT_QUERY_PROPS,
            ...expected
        };
        return assertEqualQueries(actual, expected);
    }
    function assertEqualQueries(actual, expected) {
        expected = {
            ...DEFAULT_QUERY_PROPS,
            ...expected
        };
        const folderQueryToCompareObject = (fq) => {
            return {
                path: fq.folder.fsPath,
                excludePattern: normalizeExpression(fq.excludePattern),
                includePattern: normalizeExpression(fq.includePattern),
                fileEncoding: fq.fileEncoding
            };
        };
        // Avoid comparing URI objects, not a good idea
        if (expected.folderQueries) {
            assert.deepStrictEqual(actual.folderQueries.map(folderQueryToCompareObject), expected.folderQueries.map(folderQueryToCompareObject));
            actual.folderQueries = [];
            expected.folderQueries = [];
        }
        if (expected.extraFileResources) {
            assert.deepStrictEqual(actual.extraFileResources.map(extraFile => extraFile.fsPath), expected.extraFileResources.map(extraFile => extraFile.fsPath));
            delete expected.extraFileResources;
            delete actual.extraFileResources;
        }
        delete actual.usingSearchPaths;
        actual.includePattern = normalizeExpression(actual.includePattern);
        actual.excludePattern = normalizeExpression(actual.excludePattern);
        cleanUndefinedQueryValues(actual);
        assert.deepStrictEqual(actual, expected);
    }
    exports.assertEqualQueries = assertEqualQueries;
    function assertEqualSearchPathResults(actual, expected, message) {
        cleanUndefinedQueryValues(actual);
        assert.deepStrictEqual({ ...actual.pattern }, { ...expected.pattern }, message);
        assert.strictEqual(actual.searchPaths && actual.searchPaths.length, expected.searchPaths && expected.searchPaths.length);
        if (actual.searchPaths) {
            actual.searchPaths.forEach((searchPath, i) => {
                const expectedSearchPath = expected.searchPaths[i];
                assert.deepStrictEqual(searchPath.pattern && { ...searchPath.pattern }, expectedSearchPath.pattern);
                assert.strictEqual(searchPath.searchPath.toString(), expectedSearchPath.searchPath.toString());
            });
        }
    }
    exports.assertEqualSearchPathResults = assertEqualSearchPathResults;
    /**
     * Recursively delete all undefined property values from the search query, to make it easier to
     * assert.deepStrictEqual with some expected object.
     */
    function cleanUndefinedQueryValues(q) {
        for (const key in q) {
            if (q[key] === undefined) {
                delete q[key];
            }
            else if (typeof q[key] === 'object') {
                cleanUndefinedQueryValues(q[key]);
            }
        }
        return q;
    }
    exports.cleanUndefinedQueryValues = cleanUndefinedQueryValues;
    function globalGlob(pattern) {
        return [
            `**/${pattern}/**`,
            `**/${pattern}`
        ];
    }
    exports.globalGlob = globalGlob;
    function patternsToIExpression(...patterns) {
        return patterns.length ?
            patterns.reduce((glob, cur) => { glob[cur] = true; return glob; }, {}) :
            undefined;
    }
    exports.patternsToIExpression = patternsToIExpression;
    function getUri(...slashPathParts) {
        return uri_1.URI.file(fixPath(...slashPathParts));
    }
    exports.getUri = getUri;
    function fixPath(...slashPathParts) {
        if (platform_1.isWindows && slashPathParts.length && !slashPathParts[0].match(/^c:/i)) {
            slashPathParts.unshift('c:');
        }
        return (0, path_1.join)(...slashPathParts);
    }
    exports.fixPath = fixPath;
    function normalizeExpression(expression) {
        if (!expression) {
            return expression;
        }
        const normalized = {};
        Object.keys(expression).forEach(key => {
            normalized[key.replace(/\\/g, '/')] = expression[key];
        });
        return normalized;
    }
    exports.normalizeExpression = normalizeExpression;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnlCdWlsZGVyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvc2VhcmNoL3Rlc3QvYnJvd3Nlci9xdWVyeUJ1aWxkZXIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBdUJBLE1BQU0scUJBQXFCLEdBQUcsRUFBRSxDQUFDO0lBQ2pDLE1BQU0sbUJBQW1CLEdBQUcsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsb0JBQW9CLEVBQUUsSUFBSSxFQUFFLG9CQUFvQixFQUFFLElBQUksRUFBRSxDQUFDO0lBQy9ILE1BQU0sbUJBQW1CLEdBQUcsRUFBRSxDQUFDO0lBQy9CLE1BQU0sd0JBQXdCLEdBQUcsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUM7SUFFckQsS0FBSyxDQUFDLGNBQWMsRUFBRSxHQUFHLEVBQUU7UUFDMUIsTUFBTSxZQUFZLEdBQWlCLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ3BELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNyQyxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEMsTUFBTSxtQkFBbUIsR0FBRyxJQUFBLDZCQUFpQixFQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzFELE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUMsOEVBQThFO1FBRXpJLElBQUksb0JBQThDLENBQUM7UUFDbkQsSUFBSSxZQUEwQixDQUFDO1FBQy9CLElBQUksaUJBQTJDLENBQUM7UUFDaEQsSUFBSSxrQkFBc0MsQ0FBQztRQUMzQyxJQUFJLGFBQXdCLENBQUM7UUFFN0IsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLG9CQUFvQixHQUFHLElBQUksbURBQXdCLEVBQUUsQ0FB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