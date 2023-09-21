/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/editor/common/languages", "vs/editor/common/services/languageService", "vs/editor/standalone/browser/standaloneServices", "vs/editor/standalone/common/monarch/monarchCompile", "vs/editor/standalone/common/monarch/monarchLexer"], function (require, exports, assert, lifecycle_1, utils_1, languages_1, languageService_1, standaloneServices_1, monarchCompile_1, monarchLexer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Monarch', () => {
        (0, utils_1.$bT)();
        function createMonarchTokenizer(languageService, languageId, language, configurationService) {
            return new monarchLexer_1.$E8b(languageService, null, languageId, (0, monarchCompile_1.$y9b)(languageId, language), configurationService);
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
            const disposables = new lifecycle_1.$jc();
            const languageService = disposables.add(new languageService_1.$jmb());
            const configurationService = new standaloneServices_1.$X8b();
            disposables.add(languageService.registerLanguage({ id: 'sql' }));
            disposables.add(languages_1.$bt.register('sql', disposables.add(createMonarchTokenizer(languageService, 'sql', {
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
                    new languages_1.$4s(0, 'source.test1', 'test1'),
                    new languages_1.$4s(12, 'string.quote.test1', 'test1'),
                    new languages_1.$4s(15, 'token.sql', 'sql'),
                    new languages_1.$4s(61, 'string.quote.test1', 'test1'),
                    new languages_1.$4s(64, 'source.test1', 'test1')
                ],
                [
                    new languages_1.$4s(0, 'source.test1', 'test1'),
                    new languages_1.$4s(12, 'string.quote.test1', 'test1')
                ],
                [
                    new languages_1.$4s(0, 'token.sql', 'sql')
                ],
                [
                    new languages_1.$4s(0, 'token.sql', 'sql')
                ],
                [
                    new languages_1.$4s(0, 'token.sql', 'sql')
                ],
                [
                    new languages_1.$4s(0, 'string.quote.test1', 'test1'),
                    new languages_1.$4s(3, 'source.test1', 'test1')
                ]
            ]);
            disposables.dispose();
        });
        test('microsoft/monaco-editor#1235: Empty Line Handling', () => {
            const disposables = new lifecycle_1.$jc();
            const configurationService = new standaloneServices_1.$X8b();
            const languageService = disposables.add(new languageService_1.$jmb());
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
                [new languages_1.$4s(0, 'comment.test', 'test')],
                [new languages_1.$4s(0, 'comment.test', 'test')],
                [],
                [new languages_1.$4s(0, 'comment.test', 'test')],
                [new languages_1.$4s(0, 'source.test', 'test')],
                [],
                [new languages_1.$4s(0, 'comment.test', 'test')],
                [new languages_1.$4s(0, 'comment.test', 'test')],
                [],
                [new languages_1.$4s(0, 'comment.test', 'test')],
                [],
                [new languages_1.$4s(0, 'source.test', 'test')]
            ]);
            disposables.dispose();
        });
        test('microsoft/monaco-editor#2265: Exit a state at end of line', () => {
            const disposables = new lifecycle_1.$jc();
            const configurationService = new standaloneServices_1.$X8b();
            const languageService = disposables.add(new languageService_1.$jmb());
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
                    new languages_1.$4s(0, 'string.test', 'test'),
                ],
                [
                    new languages_1.$4s(0, '', 'test'),
                    new languages_1.$4s(3, 'number.test', 'test'),
                    new languages_1.$4s(6, '', 'test'),
                    new languages_1.$4s(8, 'number.test', 'test'),
                ],
                [
                    new languages_1.$4s(0, 'string.test', 'test'),
                    new languages_1.$4s(9, '', 'test'),
                    new languages_1.$4s(13, 'number.test', 'test'),
                    new languages_1.$4s(16, '', 'test'),
                    new languages_1.$4s(18, 'number.test', 'test'),
                ]
            ]);
            disposables.dispose();
        });
        test('issue #115662: monarchCompile function need an extra option which can control replacement', () => {
            const disposables = new lifecycle_1.$jc();
            const configurationService = new standaloneServices_1.$X8b();
            const languageService = disposables.add(new languageService_1.$jmb());
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
                    new languages_1.$4s(0, 'ham.test', 'test'),
                ]
            ]);
            const actualTokens2 = getTokens(tokenizer2, lines);
            assert.deepStrictEqual(actualTokens2, [
                [
                    new languages_1.$4s(0, 'ham.test', 'test'),
                ]
            ]);
            disposables.dispose();
        });
        test('microsoft/monaco-editor#2424: Allow to target @@', () => {
            const disposables = new lifecycle_1.$jc();
            const configurationService = new standaloneServices_1.$X8b();
            const languageService = disposables.add(new languageService_1.$jmb());
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
                    new languages_1.$4s(0, 'ham.test', 'test'),
                ]
            ]);
            disposables.dispose();
        });
        test('microsoft/monaco-editor#3025: Check maxTokenizationLineLength before tokenizing', async () => {
            const disposables = new lifecycle_1.$jc();
            const configurationService = new standaloneServices_1.$X8b();
            const languageService = disposables.add(new languageService_1.$jmb());
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
                    new languages_1.$4s(0, 'ham.test', 'test'),
                ], [
                    new languages_1.$4s(0, '', 'test')
                ]
            ]);
            disposables.dispose();
        });
    });
});
//# sourceMappingURL=monarch.test.js.map