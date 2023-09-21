/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/editor/common/languages", "vs/editor/common/services/languageService", "vs/editor/standalone/browser/standaloneServices", "vs/editor/standalone/common/monarch/monarchCompile", "vs/editor/standalone/common/monarch/monarchLexer"], function (require, exports, assert, lifecycle_1, utils_1, languages_1, languageService_1, standaloneServices_1, monarchCompile_1, monarchLexer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Monarch', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        function createMonarchTokenizer(languageService, languageId, language, configurationService) {
            return new monarchLexer_1.MonarchTokenizer(languageService, null, languageId, (0, monarchCompile_1.compile)(languageId, language), configurationService);
        }
        function getTokens(tokenizer, lines) {
            const actualTokens = [];
            let state = tokenizer.getInitialState();
            for (const line of lines) {
                const result = tokenizer.tokenize(line, true, state);
                actualTokens.push(result.tokens);
                state = result.endState;
            }
            return actualTokens;
        }
        test('Ensure @rematch and nextEmbedded can be used together in Monarch grammar', () => {
            const disposables = new lifecycle_1.DisposableStore();
            const languageService = disposables.add(new languageService_1.LanguageService());
            const configurationService = new standaloneServices_1.StandaloneConfigurationService();
            disposables.add(languageService.registerLanguage({ id: 'sql' }));
            disposables.add(languages_1.TokenizationRegistry.register('sql', disposables.add(createMonarchTokenizer(languageService, 'sql', {
                tokenizer: {
                    root: [
                        [/./, 'token']
                    ]
                }
            }, configurationService))));
            const SQL_QUERY_START = '(SELECT|INSERT|UPDATE|DELETE|CREATE|REPLACE|ALTER|WITH)';
            const tokenizer = disposables.add(createMonarchTokenizer(languageService, 'test1', {
                tokenizer: {
                    root: [
                        [`(\"\"\")${SQL_QUERY_START}`, [{ 'token': 'string.quote', }, { token: '@rematch', next: '@endStringWithSQL', nextEmbedded: 'sql', },]],
                        [/(""")$/, [{ token: 'string.quote', next: '@maybeStringIsSQL', },]],
                    ],
                    maybeStringIsSQL: [
                        [/(.*)/, {
                                cases: {
                                    [`${SQL_QUERY_START}\\b.*`]: { token: '@rematch', next: '@endStringWithSQL', nextEmbedded: 'sql', },
                                    '@default': { token: '@rematch', switchTo: '@endDblDocString', },
                                }
                            }],
                    ],
                    endDblDocString: [
                        ['[^\']+', 'string'],
                        ['\\\\\'', 'string'],
                        ['\'\'\'', 'string', '@popall'],
                        ['\'', 'string']
                    ],
                    endStringWithSQL: [[/"""/, { token: 'string.quote', next: '@popall', nextEmbedded: '@pop', },]],
                }
            }, configurationService));
            const lines = [
                `mysql_query("""SELECT * FROM table_name WHERE ds = '<DATEID>'""")`,
                `mysql_query("""`,
                `SELECT *`,
                `FROM table_name`,
                `WHERE ds = '<DATEID>'`,
                `""")`,
            ];
            const actualTokens = getTokens(tokenizer, lines);
            assert.deepStrictEqual(actualTokens, [
                [
                    new languages_1.Token(0, 'source.test1', 'test1'),
                    new languages_1.Token(12, 'string.quote.test1', 'test1'),
                    new languages_1.Token(15, 'token.sql', 'sql'),
                    new languages_1.Token(61, 'string.quote.test1', 'test1'),
                    new languages_1.Token(64, 'source.test1', 'test1')
                ],
                [
                    new languages_1.Token(0, 'source.test1', 'test1'),
                    new languages_1.Token(12, 'string.quote.test1', 'test1')
                ],
                [
                    new languages_1.Token(0, 'token.sql', 'sql')
                ],
                [
                    new languages_1.Token(0, 'token.sql', 'sql')
                ],
                [
                    new languages_1.Token(0, 'token.sql', 'sql')
                ],
                [
                    new languages_1.Token(0, 'string.quote.test1', 'test1'),
                    new languages_1.Token(3, 'source.test1', 'test1')
                ]
            ]);
            disposables.dispose();
        });
        test('microsoft/monaco-editor#1235: Empty Line Handling', () => {
            const disposables = new lifecycle_1.DisposableStore();
            const configurationService = new standaloneServices_1.StandaloneConfigurationService();
            const languageService = disposables.add(new languageService_1.LanguageService());
            const tokenizer = disposables.add(createMonarchTokenizer(languageService, 'test', {
                tokenizer: {
                    root: [
                        { include: '@comments' },
                    ],
                    comments: [
                        [/\/\/$/, 'comment'],
                        [/\/\//, 'comment', '@comment_cpp'],
                    ],
                    comment_cpp: [
                        [/(?:[^\\]|(?:\\.))+$/, 'comment', '@pop'],
                        [/.+$/, 'comment'],
                        [/$/, 'comment', '@pop']
                        // No possible rule to detect an empty line and @pop?
                    ],
                },
            }, configurationService));
            const lines = [
                `// This comment \\`,
                `   continues on the following line`,
                ``,
                `// This comment does NOT continue \\\\`,
                `   because the escape char was itself escaped`,
                ``,
                `// This comment DOES continue because \\\\\\`,
                `   the 1st '\\' escapes the 2nd; the 3rd escapes EOL`,
                ``,
                `// This comment continues to the following line \\`,
                ``,
                `But the line was empty. This line should not be commented.`,
            ];
            const actualTokens = getTokens(tokenizer, lines);
            assert.deepStrictEqual(actualTokens, [
                [new languages_1.Token(0, 'comment.test', 'test')],
                [new languages_1.Token(0, 'comment.test', 'test')],
                [],
                [new languages_1.Token(0, 'comment.test', 'test')],
                [new languages_1.Token(0, 'source.test', 'test')],
                [],
                [new languages_1.Token(0, 'comment.test', 'test')],
                [new languages_1.Token(0, 'comment.test', 'test')],
                [],
                [new languages_1.Token(0, 'comment.test', 'test')],
                [],
                [new languages_1.Token(0, 'source.test', 'test')]
            ]);
            disposables.dispose();
        });
        test('microsoft/monaco-editor#2265: Exit a state at end of line', () => {
            const disposables = new lifecycle_1.DisposableStore();
            const configurationService = new standaloneServices_1.StandaloneConfigurationService();
            const languageService = disposables.add(new languageService_1.LanguageService());
            const tokenizer = disposables.add(createMonarchTokenizer(languageService, 'test', {
                includeLF: true,
                tokenizer: {
                    root: [
                        [/^\*/, '', '@inner'],
                        [/\:\*/, '', '@inner'],
                        [/[^*:]+/, 'string'],
                        [/[*:]/, 'string']
                    ],
                    inner: [
                        [/\n/, '', '@pop'],
                        [/\d+/, 'number'],
                        [/[^\d]+/, '']
                    ]
                }
            }, configurationService));
            const lines = [
                `PRINT 10 * 20`,
                `*FX200, 3`,
                `PRINT 2*3:*FX200, 3`
            ];
            const actualTokens = getTokens(tokenizer, lines);
            assert.deepStrictEqual(actualTokens, [
                [
                    new languages_1.Token(0, 'string.test', 'test'),
                ],
                [
                    new languages_1.Token(0, '', 'test'),
                    new languages_1.Token(3, 'number.test', 'test'),
                    new languages_1.Token(6, '', 'test'),
                    new languages_1.Token(8, 'number.test', 'test'),
                ],
                [
                    new languages_1.Token(0, 'string.test', 'test'),
                    new languages_1.Token(9, '', 'test'),
                    new languages_1.Token(13, 'number.test', 'test'),
                    new languages_1.Token(16, '', 'test'),
                    new languages_1.Token(18, 'number.test', 'test'),
                ]
            ]);
            disposables.dispose();
        });
        test('issue #115662: monarchCompile function need an extra option which can control replacement', () => {
            const disposables = new lifecycle_1.DisposableStore();
            const configurationService = new standaloneServices_1.StandaloneConfigurationService();
            const languageService = disposables.add(new languageService_1.LanguageService());
            const tokenizer1 = disposables.add(createMonarchTokenizer(languageService, 'test', {
                ignoreCase: false,
                uselessReplaceKey1: '@uselessReplaceKey2',
                uselessReplaceKey2: '@uselessReplaceKey3',
                uselessReplaceKey3: '@uselessReplaceKey4',
                uselessReplaceKey4: '@uselessReplaceKey5',
                uselessReplaceKey5: '@ham' || '',
                tokenizer: {
                    root: [
                        {
                            regex: /@\w+/.test('@ham')
                                ? new RegExp(`^${'@uselessReplaceKey1'}$`)
                                : new RegExp(`^${'@ham'}$`),
                            action: { token: 'ham' }
                        },
                    ],
                },
            }, configurationService));
            const tokenizer2 = disposables.add(createMonarchTokenizer(languageService, 'test', {
                ignoreCase: false,
                tokenizer: {
                    root: [
                        {
                            regex: /@@ham/,
                            action: { token: 'ham' }
                        },
                    ],
                },
            }, configurationService));
            const lines = [
                `@ham`
            ];
            const actualTokens1 = getTokens(tokenizer1, lines);
            assert.deepStrictEqual(actualTokens1, [
                [
                    new languages_1.Token(0, 'ham.test', 'test'),
                ]
            ]);
            const actualTokens2 = getTokens(tokenizer2, lines);
            assert.deepStrictEqual(actualTokens2, [
                [
                    new languages_1.Token(0, 'ham.test', 'test'),
                ]
            ]);
            disposables.dispose();
        });
        test('microsoft/monaco-editor#2424: Allow to target @@', () => {
            const disposables = new lifecycle_1.DisposableStore();
            const configurationService = new standaloneServices_1.StandaloneConfigurationService();
            const languageService = disposables.add(new languageService_1.LanguageService());
            const tokenizer = disposables.add(createMonarchTokenizer(languageService, 'test', {
                ignoreCase: false,
                tokenizer: {
                    root: [
                        {
                            regex: /@@@@/,
                            action: { token: 'ham' }
                        },
                    ],
                },
            }, configurationService));
            const lines = [
                `@@`
            ];
            const actualTokens = getTokens(tokenizer, lines);
            assert.deepStrictEqual(actualTokens, [
                [
                    new languages_1.Token(0, 'ham.test', 'test'),
                ]
            ]);
            disposables.dispose();
        });
        test('microsoft/monaco-editor#3025: Check maxTokenizationLineLength before tokenizing', async () => {
            const disposables = new lifecycle_1.DisposableStore();
            const configurationService = new standaloneServices_1.StandaloneConfigurationService();
            const languageService = disposables.add(new languageService_1.LanguageService());
            // Set maxTokenizationLineLength to 4 so that "ham" works but "hamham" would fail
            await configurationService.updateValue('editor.maxTokenizationLineLength', 4);
            const tokenizer = disposables.add(createMonarchTokenizer(languageService, 'test', {
                tokenizer: {
                    root: [
                        {
                            regex: /ham/,
                            action: { token: 'ham' }
                        },
                    ],
                },
            }, configurationService));
            const lines = [
                'ham',
                'hamham' // length 6, should NOT be tokenized
            ];
            const actualTokens = getTokens(tokenizer, lines);
            assert.deepStrictEqual(actualTokens, [
                [
                    new languages_1.Token(0, 'ham.test', 'test'),
                ], [
                    new languages_1.Token(0, '', 'test')
                ]
            ]);
            disposables.dispose();
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9uYXJjaC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3N0YW5kYWxvbmUvdGVzdC9icm93c2VyL21vbmFyY2gudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQWNoRyxLQUFLLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRTtRQUVyQixJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsU0FBUyxzQkFBc0IsQ0FBQyxlQUFpQyxFQUFFLFVBQWtCLEVBQUUsUUFBMEIsRUFBRSxvQkFBMkM7WUFDN0osT0FBTyxJQUFJLCtCQUFnQixDQUFDLGVBQWUsRUFBRSxJQUFLLEVBQUUsVUFBVSxFQUFFLElBQUEsd0JBQU8sRUFBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztRQUN0SCxDQUFDO1FBRUQsU0FBUyxTQUFTLENBQUMsU0FBMkIsRUFBRSxLQUFlO1lBQzlELE1BQU0sWUFBWSxHQUFjLEVBQUUsQ0FBQztZQUNuQyxJQUFJLEtBQUssR0FBRyxTQUFTLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDeEMsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7Z0JBQ3pCLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDckQsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ2pDLEtBQUssR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO2FBQ3hCO1lBQ0QsT0FBTyxZQUFZLENBQUM7UUFDckIsQ0FBQztRQUVELElBQUksQ0FBQywwRUFBMEUsRUFBRSxHQUFHLEVBQUU7WUFDckYsTUFBTSxXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFDMUMsTUFBTSxlQUFlLEdBQUcsV0FBVyxD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