/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/path", "vs/base/common/cancellation", "vs/base/common/uri", "vs/workbench/services/search/common/search", "vs/workbench/services/search/node/textSearchAdapter", "vs/base/test/node/testUtils", "vs/base/common/network"], function (require, exports, assert, path, cancellation_1, uri_1, search_1, textSearchAdapter_1, testUtils_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const TEST_FIXTURES = path.normalize(network_1.FileAccess.asFileUri('vs/workbench/services/search/test/node/fixtures').fsPath);
    const EXAMPLES_FIXTURES = path.join(TEST_FIXTURES, 'examples');
    const MORE_FIXTURES = path.join(TEST_FIXTURES, 'more');
    const TEST_ROOT_FOLDER = { folder: uri_1.URI.file(TEST_FIXTURES) };
    const ROOT_FOLDER_QUERY = [
        TEST_ROOT_FOLDER
    ];
    const MULTIROOT_QUERIES = [
        { folder: uri_1.URI.file(EXAMPLES_FIXTURES) },
        { folder: uri_1.URI.file(MORE_FIXTURES) }
    ];
    function doSearchTest(query, expectedResultCount) {
        const engine = new textSearchAdapter_1.TextSearchEngineAdapter(query);
        let c = 0;
        const results = [];
        return engine.search(new cancellation_1.CancellationTokenSource().token, _results => {
            if (_results) {
                c += _results.reduce((acc, cur) => acc + cur.numMatches, 0);
                results.push(..._results);
            }
        }, () => { }).then(() => {
            if (typeof expectedResultCount === 'function') {
                assert(expectedResultCount(c));
            }
            else {
                assert.strictEqual(c, expectedResultCount, `rg ${c} !== ${expectedResultCount}`);
            }
            return results;
        });
    }
    (0, testUtils_1.flakySuite)('TextSearch-integration', function () {
        test('Text: GameOfLife', () => {
            const config = {
                type: 2 /* QueryType.Text */,
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: 'GameOfLife' },
            };
            return doSearchTest(config, 4);
        });
        test('Text: GameOfLife (RegExp)', () => {
            const config = {
                type: 2 /* QueryType.Text */,
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: 'Game.?fL\\w?fe', isRegExp: true }
            };
            return doSearchTest(config, 4);
        });
        test('Text: GameOfLife (unicode escape sequences)', () => {
            const config = {
                type: 2 /* QueryType.Text */,
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: 'G\\u{0061}m\\u0065OfLife', isRegExp: true }
            };
            return doSearchTest(config, 4);
        });
        test('Text: GameOfLife (unicode escape sequences, force PCRE2)', () => {
            const config = {
                type: 2 /* QueryType.Text */,
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: '(?<!a)G\\u{0061}m\\u0065OfLife', isRegExp: true }
            };
            return doSearchTest(config, 4);
        });
        test('Text: GameOfLife (PCRE2 RegExp)', () => {
            const config = {
                type: 2 /* QueryType.Text */,
                folderQueries: ROOT_FOLDER_QUERY,
                usePCRE2: true,
                contentPattern: { pattern: 'Life(?!P)', isRegExp: true }
            };
            return doSearchTest(config, 8);
        });
        test('Text: GameOfLife (RegExp to EOL)', () => {
            const config = {
                type: 2 /* QueryType.Text */,
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: 'GameOfLife.*', isRegExp: true }
            };
            return doSearchTest(config, 4);
        });
        test('Text: GameOfLife (Word Match, Case Sensitive)', () => {
            const config = {
                type: 2 /* QueryType.Text */,
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: 'GameOfLife', isWordMatch: true, isCaseSensitive: true }
            };
            return doSearchTest(config, 4);
        });
        test('Text: GameOfLife (Word Match, Spaces)', () => {
            const config = {
                type: 2 /* QueryType.Text */,
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: ' GameOfLife ', isWordMatch: true }
            };
            return doSearchTest(config, 1);
        });
        test('Text: GameOfLife (Word Match, Punctuation and Spaces)', () => {
            const config = {
                type: 2 /* QueryType.Text */,
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: ', as =', isWordMatch: true }
            };
            return doSearchTest(config, 1);
        });
        test('Text: Helvetica (UTF 16)', () => {
            const config = {
                type: 2 /* QueryType.Text */,
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: 'Helvetica' }
            };
            return doSearchTest(config, 3);
        });
        test('Text: e', () => {
            const config = {
                type: 2 /* QueryType.Text */,
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: 'e' }
            };
            return doSearchTest(config, 785);
        });
        test('Text: e (with excludes)', () => {
            const config = {
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: 'e' },
                excludePattern: { '**/examples': true }
            };
            return doSearchTest(config, 391);
        });
        test('Text: e (with includes)', () => {
            const config = {
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: 'e' },
                includePattern: { '**/examples/**': true }
            };
            return doSearchTest(config, 394);
        });
        // TODO
        // test('Text: e (with absolute path excludes)', () => {
        // 	const config: any = {
        // 		folderQueries: ROOT_FOLDER_QUERY,
        // 		contentPattern: { pattern: 'e' },
        // 		excludePattern: makeExpression(path.join(TEST_FIXTURES, '**/examples'))
        // 	};
        // 	return doSearchTest(config, 394);
        // });
        // test('Text: e (with mixed absolute/relative path excludes)', () => {
        // 	const config: any = {
        // 		folderQueries: ROOT_FOLDER_QUERY,
        // 		contentPattern: { pattern: 'e' },
        // 		excludePattern: makeExpression(path.join(TEST_FIXTURES, '**/examples'), '*.css')
        // 	};
        // 	return doSearchTest(config, 310);
        // });
        test('Text: sibling exclude', () => {
            const config = {
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: 'm' },
                includePattern: makeExpression('**/site*'),
                excludePattern: { '*.css': { when: '$(basename).less' } }
            };
            return doSearchTest(config, 1);
        });
        test('Text: e (with includes and exclude)', () => {
            const config = {
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: 'e' },
                includePattern: { '**/examples/**': true },
                excludePattern: { '**/examples/small.js': true }
            };
            return doSearchTest(config, 371);
        });
        test('Text: a (capped)', () => {
            const maxResults = 520;
            const config = {
                type: 2 /* QueryType.Text */,
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: 'a' },
                maxResults
            };
            return doSearchTest(config, maxResults);
        });
        test('Text: a (no results)', () => {
            const config = {
                type: 2 /* QueryType.Text */,
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: 'ahsogehtdas' }
            };
            return doSearchTest(config, 0);
        });
        test('Text: -size', () => {
            const config = {
                type: 2 /* QueryType.Text */,
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: '-size' }
            };
            return doSearchTest(config, 9);
        });
        test('Multiroot: Conway', () => {
            const config = {
                type: 2 /* QueryType.Text */,
                folderQueries: MULTIROOT_QUERIES,
                contentPattern: { pattern: 'conway' }
            };
            return doSearchTest(config, 8);
        });
        test('Multiroot: e with partial global exclude', () => {
            const config = {
                type: 2 /* QueryType.Text */,
                folderQueries: MULTIROOT_QUERIES,
                contentPattern: { pattern: 'e' },
                excludePattern: makeExpression('**/*.txt')
            };
            return doSearchTest(config, 394);
        });
        test('Multiroot: e with global excludes', () => {
            const config = {
                type: 2 /* QueryType.Text */,
                folderQueries: MULTIROOT_QUERIES,
                contentPattern: { pattern: 'e' },
                excludePattern: makeExpression('**/*.txt', '**/*.js')
            };
            return doSearchTest(config, 0);
        });
        test('Multiroot: e with folder exclude', () => {
            const config = {
                type: 2 /* QueryType.Text */,
                folderQueries: [
                    { folder: uri_1.URI.file(EXAMPLES_FIXTURES), excludePattern: makeExpression('**/e*.js') },
                    { folder: uri_1.URI.file(MORE_FIXTURES) }
                ],
                contentPattern: { pattern: 'e' }
            };
            return doSearchTest(config, 298);
        });
        test('Text: 语', () => {
            const config = {
                type: 2 /* QueryType.Text */,
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: '语' }
            };
            return doSearchTest(config, 1).then(results => {
                const matchRange = results[0].results[0].ranges;
                assert.deepStrictEqual(matchRange, [{
                        startLineNumber: 0,
                        startColumn: 1,
                        endLineNumber: 0,
                        endColumn: 2
                    }]);
            });
        });
        test('Multiple matches on line: h\\d,', () => {
            const config = {
                type: 2 /* QueryType.Text */,
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: 'h\\d,', isRegExp: true }
            };
            return doSearchTest(config, 15).then(results => {
                assert.strictEqual(results.length, 3);
                assert.strictEqual(results[0].results.length, 1);
                const match = results[0].results[0];
                assert.strictEqual(match.ranges.length, 5);
            });
        });
        test('Search with context matches', () => {
            const config = {
                type: 2 /* QueryType.Text */,
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: 'compiler.typeCheck();' },
                beforeContext: 1,
                afterContext: 2
            };
            return doSearchTest(config, 4).then(results => {
                assert.strictEqual(results.length, 4);
                assert.strictEqual(results[0].results[0].lineNumber, 24);
                assert.strictEqual(results[0].results[0].text, '        compiler.addUnit(prog,"input.ts");');
                // assert.strictEqual((<ITextSearchMatch>results[1].results[0]).preview.text, '        compiler.typeCheck();\n'); // See https://github.com/BurntSushi/ripgrep/issues/1095
                assert.strictEqual(results[2].results[0].lineNumber, 26);
                assert.strictEqual(results[2].results[0].text, '        compiler.emit();');
                assert.strictEqual(results[3].results[0].lineNumber, 27);
                assert.strictEqual(results[3].results[0].text, '');
            });
        });
        suite('error messages', () => {
            test('invalid encoding', () => {
                const config = {
                    type: 2 /* QueryType.Text */,
                    folderQueries: [
                        {
                            ...TEST_ROOT_FOLDER,
                            fileEncoding: 'invalidEncoding'
                        }
                    ],
                    contentPattern: { pattern: 'test' },
                };
                return doSearchTest(config, 0).then(() => {
                    throw new Error('expected fail');
                }, err => {
                    const searchError = (0, search_1.deserializeSearchError)(err);
                    assert.strictEqual(searchError.message, 'Unknown encoding: invalidEncoding');
                    assert.strictEqual(searchError.code, search_1.SearchErrorCode.unknownEncoding);
                });
            });
            test('invalid regex case 1', () => {
                const config = {
                    type: 2 /* QueryType.Text */,
                    folderQueries: ROOT_FOLDER_QUERY,
                    contentPattern: { pattern: ')', isRegExp: true },
                };
                return doSearchTest(config, 0).then(() => {
                    throw new Error('expected fail');
                }, err => {
                    const searchError = (0, search_1.deserializeSearchError)(err);
                    const regexParseErrorForUnclosedParenthesis = 'Regex parse error: unmatched closing parenthesis';
                    assert.strictEqual(searchError.message, regexParseErrorForUnclosedParenthesis);
                    assert.strictEqual(searchError.code, search_1.SearchErrorCode.regexParseError);
                });
            });
            test('invalid regex case 2', () => {
                const config = {
                    type: 2 /* QueryType.Text */,
                    folderQueries: ROOT_FOLDER_QUERY,
                    contentPattern: { pattern: '(?<!a.*)', isRegExp: true },
                };
                return doSearchTest(config, 0).then(() => {
                    throw new Error('expected fail');
                }, err => {
                    const searchError = (0, search_1.deserializeSearchError)(err);
                    const regexParseErrorForLookAround = 'Regex parse error: lookbehind assertion is not fixed length';
                    assert.strictEqual(searchError.message, regexParseErrorForLookAround);
                    assert.strictEqual(searchError.code, search_1.SearchErrorCode.regexParseError);
                });
            });
            test('invalid glob', () => {
                const config = {
                    type: 2 /* QueryType.Text */,
                    folderQueries: ROOT_FOLDER_QUERY,
                    contentPattern: { pattern: 'foo' },
                    includePattern: {
                        '{{}': true
                    }
                };
                return doSearchTest(config, 0).then(() => {
                    throw new Error('expected fail');
                }, err => {
                    const searchError = (0, search_1.deserializeSearchError)(err);
                    assert.strictEqual(searchError.message, 'Error parsing glob \'/{{}\': nested alternate groups are not allowed');
                    assert.strictEqual(searchError.code, search_1.SearchErrorCode.globParseError);
                });
            });
        });
    });
    function makeExpression(...patterns) {
        return patterns.reduce((glob, pattern) => {
            // glob.ts needs forward slashes
            pattern = pattern.replace(/\\/g, '/');
            glob[pattern] = true;
            return glob;
        }, Object.create(null));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dFNlYXJjaC5pbnRlZ3JhdGlvblRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvc2VhcmNoL3Rlc3Qvbm9kZS90ZXh0U2VhcmNoLmludGVncmF0aW9uVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVloRyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFVLENBQUMsU0FBUyxDQUFDLGlEQUFpRCxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDckgsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUMvRCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN2RCxNQUFNLGdCQUFnQixHQUFpQixFQUFFLE1BQU0sRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUM7SUFDM0UsTUFBTSxpQkFBaUIsR0FBbUI7UUFDekMsZ0JBQWdCO0tBQ2hCLENBQUM7SUFFRixNQUFNLGlCQUFpQixHQUFtQjtRQUN6QyxFQUFFLE1BQU0sRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7UUFDdkMsRUFBRSxNQUFNLEVBQUUsU0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRTtLQUNuQyxDQUFDO0lBRUYsU0FBUyxZQUFZLENBQUMsS0FBaUIsRUFBRSxtQkFBc0M7UUFDOUUsTUFBTSxNQUFNLEdBQUcsSUFBSSwyQ0FBdUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVsRCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVixNQUFNLE9BQU8sR0FBMkIsRUFBRSxDQUFDO1FBQzNDLE9BQU8sTUFBTSxDQUFDLE1B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