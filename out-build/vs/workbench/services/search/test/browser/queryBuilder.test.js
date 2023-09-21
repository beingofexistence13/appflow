define(["require", "exports", "assert", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/uri", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/workspace/common/workspace", "vs/platform/workspaces/common/workspaces", "vs/workbench/services/search/common/queryBuilder", "vs/workbench/services/path/common/pathService", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/test/common/workbenchTestServices", "vs/platform/environment/common/environment", "vs/platform/workspace/test/common/testWorkspace", "vs/base/common/resources"], function (require, exports, assert, path_1, platform_1, uri_1, configuration_1, testConfigurationService_1, instantiationServiceMock_1, workspace_1, workspaces_1, queryBuilder_1, pathService_1, workbenchTestServices_1, workbenchTestServices_2, environment_1, testWorkspace_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$5fc = exports.$4fc = exports.$3fc = exports.$2fc = exports.$1fc = exports.$Zfc = exports.$Yfc = exports.$Xfc = void 0;
    const DEFAULT_EDITOR_CONFIG = {};
    const DEFAULT_USER_CONFIG = { useRipgrep: true, useIgnoreFiles: true, useGlobalIgnoreFiles: true, useParentIgnoreFiles: true };
    const DEFAULT_QUERY_PROPS = {};
    const DEFAULT_TEXT_QUERY_PROPS = { usePCRE2: false };
    suite('QueryBuilder', () => {
        const PATTERN_INFO = { pattern: 'a' };
        const ROOT_1 = $4fc('/foo/root1');
        const ROOT_1_URI = $3fc(ROOT_1);
        const ROOT_1_NAMED_FOLDER = (0, workspace_1.$Wh)(ROOT_1_URI);
        const WS_CONFIG_PATH = $3fc('/bar/test.code-workspace'); // location of the workspace file (not important except that it is a file URI)
        let instantiationService;
        let queryBuilder;
        let mockConfigService;
        let mockContextService;
        let mockWorkspace;
        setup(() => {
            instantiationService = new instantiationServiceMock_1.$L0b();
            mockConfigService = new testConfigurationService_1.$G0b();
            mockConfigService.setUserConfiguration('search', DEFAULT_USER_CONFIG);
            mockConfigService.setUserConfiguration('editor', DEFAULT_EDITOR_CONFIG);
            instantiationService.stub(configuration_1.$8h, mockConfigService);
            mockContextService = new workbenchTestServices_2.$6dc();
            mockWorkspace = new testWorkspace_1.$00b('workspace', [(0, workspace_1.$Wh)(ROOT_1_URI)]);
            mockContextService.setWorkspace(mockWorkspace);
            instantiationService.stub(workspace_1.$Kh, mockContextService);
            instantiationService.stub(environment_1.$Ih, workbenchTestServices_1.$qec);
            instantiationService.stub(pathService_1.$yJ, new workbenchTestServices_1.$5ec());
            queryBuilder = instantiationService.createInstance(queryBuilder_1.$AJ);
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
            $Xfc(queryBuilder.file([ROOT_1_NAMED_FOLDER], { includePattern: '**/foo, **/bar', expandPatterns: true }), {
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
            $Xfc(queryBuilder.file([ROOT_1_NAMED_FOLDER], { includePattern: '**/foo, **/bar' }), {
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
            $Xfc(queryBuilder.file([ROOT_1_NAMED_FOLDER], { includePattern: ['**/foo', '**/bar'] }), {
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
            $Xfc(queryBuilder.file([ROOT_1_NAMED_FOLDER], { includePattern: ['**/foo', '**/bar'], expandPatterns: true }), {
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
            const ROOT_2 = $4fc('/project/root2');
            const ROOT_2_URI = $3fc(ROOT_2);
            const ROOT_3 = $4fc('/project/root3');
            const ROOT_3_URI = $3fc(ROOT_3);
            mockWorkspace.folders = (0, workspaces_1.$lU)([{ path: ROOT_1_URI.fsPath }, { path: ROOT_2_URI.fsPath }, { path: ROOT_3_URI.fsPath }], WS_CONFIG_PATH, resources_1.$_f);
            mockWorkspace.configuration = uri_1.URI.file($4fc('/config'));
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
                    { folder: ROOT_1_URI, excludePattern: $2fc('foo/**/*.js') },
                    { folder: ROOT_2_URI, excludePattern: $2fc('bar') },
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
                excludePattern: $2fc(...$1fc('foo'))
            });
        });
        test('file pattern trimming', () => {
            const content = 'content';
            $Xfc(queryBuilder.file([], { filePattern: ` ${content} ` }), {
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
                        excludePattern: $2fc('bar', 'bar/**'),
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
                        excludePattern: $2fc('bar/**/*.ts', 'bar/**/*.ts/**'),
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
                        excludePattern: $2fc('bar/**/*.ts', 'bar/**/*.ts/**'),
                    }],
                type: 2 /* QueryType.Text */
            });
        });
        test('extraFileResources', () => {
            assertEqualTextQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI], { extraFileResources: [$3fc('/foo/bar.js')] }), {
                contentPattern: PATTERN_INFO,
                folderQueries: [{
                        folder: ROOT_1_URI
                    }],
                extraFileResources: [$3fc('/foo/bar.js')],
                type: 2 /* QueryType.Text */
            });
            assertEqualTextQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI], {
                extraFileResources: [$3fc('/foo/bar.js')],
                excludePattern: '*.js',
                expandPatterns: true
            }), {
                contentPattern: PATTERN_INFO,
                folderQueries: [{
                        folder: ROOT_1_URI
                    }],
                excludePattern: $2fc(...$1fc('*.js')),
                type: 2 /* QueryType.Text */
            });
            assertEqualTextQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI], {
                extraFileResources: [$3fc('/foo/bar.js')],
                includePattern: '*.txt',
                expandPatterns: true
            }), {
                contentPattern: PATTERN_INFO,
                folderQueries: [{
                        folder: ROOT_1_URI
                    }],
                includePattern: $2fc(...$1fc('*.txt')),
                type: 2 /* QueryType.Text */
            });
        });
        suite('parseSearchPaths 1', () => {
            test('simple includes', () => {
                function testSimpleIncludes(includePattern, expectedPatterns) {
                    const result = queryBuilder.parseSearchPaths(includePattern);
                    assert.deepStrictEqual({ ...result.pattern }, $2fc(...expectedPatterns), includePattern);
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
                $Yfc(actual, expectedResult, includePattern);
            }
            function testIncludesDataItem([includePattern, expectedResult]) {
                testIncludes(includePattern, expectedResult);
            }
            test('absolute includes', () => {
                const cases = [
                    [
                        $4fc('/foo/bar'),
                        {
                            searchPaths: [{ searchPath: $3fc('/foo/bar') }]
                        }
                    ],
                    [
                        $4fc('/foo/bar') + ',' + 'a',
                        {
                            searchPaths: [{ searchPath: $3fc('/foo/bar') }],
                            pattern: $2fc(...$1fc('a'))
                        }
                    ],
                    [
                        $4fc('/foo/bar') + ',' + $4fc('/1/2'),
                        {
                            searchPaths: [{ searchPath: $3fc('/foo/bar') }, { searchPath: $3fc('/1/2') }]
                        }
                    ],
                    [
                        $4fc('/foo/bar') + ',' + $4fc('/foo/../foo/bar/fooar/..'),
                        {
                            searchPaths: [{
                                    searchPath: $3fc('/foo/bar')
                                }]
                        }
                    ],
                    [
                        $4fc('/foo/bar/**/*.ts'),
                        {
                            searchPaths: [{
                                    searchPath: $3fc('/foo/bar'),
                                    pattern: $2fc('**/*.ts', '**/*.ts/**')
                                }]
                        }
                    ],
                    [
                        $4fc('/foo/bar/*a/b/c'),
                        {
                            searchPaths: [{
                                    searchPath: $3fc('/foo/bar'),
                                    pattern: $2fc('*a/b/c', '*a/b/c/**')
                                }]
                        }
                    ],
                    [
                        $4fc('/*a/b/c'),
                        {
                            searchPaths: [{
                                    searchPath: $3fc('/'),
                                    pattern: $2fc('*a/b/c', '*a/b/c/**')
                                }]
                        }
                    ],
                    [
                        $4fc('/foo/{b,c}ar'),
                        {
                            searchPaths: [{
                                    searchPath: $3fc('/foo'),
                                    pattern: $2fc('{b,c}ar', '{b,c}ar/**')
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
                                    pattern: $2fc('a', 'a/**')
                                }]
                        }
                    ],
                    [
                        './a/',
                        {
                            searchPaths: [{
                                    searchPath: ROOT_1_URI,
                                    pattern: $2fc('a', 'a/**')
                                }]
                        }
                    ],
                    [
                        './a/*b/c',
                        {
                            searchPaths: [{
                                    searchPath: ROOT_1_URI,
                                    pattern: $2fc('a/*b/c', 'a/*b/c/**')
                                }]
                        }
                    ],
                    [
                        './a/*b/c, ' + $4fc('/project/foo'),
                        {
                            searchPaths: [
                                {
                                    searchPath: ROOT_1_URI,
                                    pattern: $2fc('a/*b/c', 'a/*b/c/**')
                                },
                                {
                                    searchPath: $3fc('/project/foo')
                                }
                            ]
                        }
                    ],
                    [
                        './a/b/,./c/d',
                        {
                            searchPaths: [{
                                    searchPath: ROOT_1_URI,
                                    pattern: $2fc('a/b', 'a/b/**', 'c/d', 'c/d/**')
                                }]
                        }
                    ],
                    [
                        '../',
                        {
                            searchPaths: [{
                                    searchPath: $3fc('/foo')
                                }]
                        }
                    ],
                    [
                        '..',
                        {
                            searchPaths: [{
                                    searchPath: $3fc('/foo')
                                }]
                        }
                    ],
                    [
                        '..\\bar',
                        {
                            searchPaths: [{
                                    searchPath: $3fc('/foo/bar')
                                }]
                        }
                    ]
                ];
                cases.forEach(testIncludesDataItem);
            });
            test('relative includes w/two root folders', () => {
                const ROOT_2 = '/project/root2';
                mockWorkspace.folders = (0, workspaces_1.$lU)([{ path: ROOT_1_URI.fsPath }, { path: $3fc(ROOT_2).fsPath }], WS_CONFIG_PATH, resources_1.$_f);
                mockWorkspace.configuration = uri_1.URI.file($4fc('config'));
                const cases = [
                    [
                        './root1',
                        {
                            searchPaths: [{
                                    searchPath: $3fc(ROOT_1)
                                }]
                        }
                    ],
                    [
                        './root2',
                        {
                            searchPaths: [{
                                    searchPath: $3fc(ROOT_2),
                                }]
                        }
                    ],
                    [
                        './root1/a/**/b, ./root2/**/*.txt',
                        {
                            searchPaths: [
                                {
                                    searchPath: ROOT_1_URI,
                                    pattern: $2fc('a/**/b', 'a/**/b/**')
                                },
                                {
                                    searchPath: $3fc(ROOT_2),
                                    pattern: $2fc('**/*.txt', '**/*.txt/**')
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
                mockWorkspace.folders = (0, workspaces_1.$lU)([{ path: ROOT_1_URI.fsPath, name: ROOT_1_FOLDERNAME }, { path: $3fc(ROOT_2).fsPath }], WS_CONFIG_PATH, resources_1.$_f);
                mockWorkspace.configuration = uri_1.URI.file($4fc('config'));
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
                                    pattern: $2fc('foo', 'foo/**')
                                }]
                        }
                    ]
                ];
                cases.forEach(testIncludesDataItem);
            });
            test('folder with slash in the name', () => {
                const ROOT_2 = '/project/root2';
                const ROOT_2_URI = $3fc(ROOT_2);
                const ROOT_1_FOLDERNAME = 'folder/one';
                const ROOT_2_FOLDERNAME = 'folder/two+'; // And another regex character, #126003
                mockWorkspace.folders = (0, workspaces_1.$lU)([{ path: ROOT_1_URI.fsPath, name: ROOT_1_FOLDERNAME }, { path: ROOT_2_URI.fsPath, name: ROOT_2_FOLDERNAME }], WS_CONFIG_PATH, resources_1.$_f);
                mockWorkspace.configuration = uri_1.URI.file($4fc('config'));
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
                                    pattern: $2fc('foo', 'foo/**')
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
                mockWorkspace.folders = (0, workspaces_1.$lU)([{ path: ROOT_1_URI.fsPath }, { path: $3fc(ROOT_2).fsPath }, { path: $3fc(ROOT_3).fsPath }], WS_CONFIG_PATH, resources_1.$_f);
                mockWorkspace.configuration = uri_1.URI.file($4fc('/config'));
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
                                    searchPath: $3fc(ROOT_1)
                                }]
                        }
                    ],
                    [
                        './root1,./',
                        {
                            searchPaths: [{
                                    searchPath: $3fc(ROOT_1)
                                }]
                        }
                    ],
                    [
                        './rootB',
                        {
                            searchPaths: [
                                {
                                    searchPath: $3fc(ROOT_2),
                                },
                                {
                                    searchPath: $3fc(ROOT_3),
                                }
                            ]
                        }
                    ],
                    [
                        './rootB/a/**/b, ./rootB/b/**/*.txt',
                        {
                            searchPaths: [
                                {
                                    searchPath: $3fc(ROOT_2),
                                    pattern: $2fc('a/**/b', 'a/**/b/**', 'b/**/*.txt', 'b/**/*.txt/**')
                                },
                                {
                                    searchPath: $3fc(ROOT_3),
                                    pattern: $2fc('a/**/b', 'a/**/b/**', 'b/**/*.txt', 'b/**/*.txt/**')
                                }
                            ]
                        }
                    ],
                    [
                        './root1/**/foo/, bar/',
                        {
                            pattern: $2fc('**/bar', '**/bar/**'),
                            searchPaths: [
                                {
                                    searchPath: ROOT_1_URI,
                                    pattern: $2fc('**/foo', '**/foo/**')
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
                $Yfc(queryBuilder.parseSearchPaths(includePattern), expectedResult, includePattern);
            }
            function testIncludesDataItem([includePattern, expectedResult]) {
                testIncludes(includePattern, expectedResult);
            }
            (platform_1.$i ? test.skip : test)('includes with tilde', () => {
                const userHome = uri_1.URI.file('/');
                const cases = [
                    [
                        '~/foo/bar',
                        {
                            searchPaths: [{ searchPath: $3fc(userHome.fsPath, '/foo/bar') }]
                        }
                    ],
                    [
                        '~/foo/bar, a',
                        {
                            searchPaths: [{ searchPath: $3fc(userHome.fsPath, '/foo/bar') }],
                            pattern: $2fc(...$1fc('a'))
                        }
                    ],
                    [
                        $4fc('/foo/~/bar'),
                        {
                            searchPaths: [{ searchPath: $3fc('/foo/~/bar') }]
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
        return $Xfc(actual, expected);
    }
    function $Xfc(actual, expected) {
        expected = {
            ...DEFAULT_QUERY_PROPS,
            ...expected
        };
        const folderQueryToCompareObject = (fq) => {
            return {
                path: fq.folder.fsPath,
                excludePattern: $5fc(fq.excludePattern),
                includePattern: $5fc(fq.includePattern),
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
        actual.includePattern = $5fc(actual.includePattern);
        actual.excludePattern = $5fc(actual.excludePattern);
        $Zfc(actual);
        assert.deepStrictEqual(actual, expected);
    }
    exports.$Xfc = $Xfc;
    function $Yfc(actual, expected, message) {
        $Zfc(actual);
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
    exports.$Yfc = $Yfc;
    /**
     * Recursively delete all undefined property values from the search query, to make it easier to
     * assert.deepStrictEqual with some expected object.
     */
    function $Zfc(q) {
        for (const key in q) {
            if (q[key] === undefined) {
                delete q[key];
            }
            else if (typeof q[key] === 'object') {
                $Zfc(q[key]);
            }
        }
        return q;
    }
    exports.$Zfc = $Zfc;
    function $1fc(pattern) {
        return [
            `**/${pattern}/**`,
            `**/${pattern}`
        ];
    }
    exports.$1fc = $1fc;
    function $2fc(...patterns) {
        return patterns.length ?
            patterns.reduce((glob, cur) => { glob[cur] = true; return glob; }, {}) :
            undefined;
    }
    exports.$2fc = $2fc;
    function $3fc(...slashPathParts) {
        return uri_1.URI.file($4fc(...slashPathParts));
    }
    exports.$3fc = $3fc;
    function $4fc(...slashPathParts) {
        if (platform_1.$i && slashPathParts.length && !slashPathParts[0].match(/^c:/i)) {
            slashPathParts.unshift('c:');
        }
        return (0, path_1.$9d)(...slashPathParts);
    }
    exports.$4fc = $4fc;
    function $5fc(expression) {
        if (!expression) {
            return expression;
        }
        const normalized = {};
        Object.keys(expression).forEach(key => {
            normalized[key.replace(/\\/g, '/')] = expression[key];
        });
        return normalized;
    }
    exports.$5fc = $5fc;
});
//# sourceMappingURL=queryBuilder.test.js.map