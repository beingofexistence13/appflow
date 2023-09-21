/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/resources", "vs/base/common/uri", "vs/workbench/services/search/node/ripgrepTextSearchEngine", "vs/workbench/services/search/common/searchExtTypes"], function (require, exports, assert, resources_1, uri_1, ripgrepTextSearchEngine_1, searchExtTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('RipgrepTextSearchEngine', () => {
        test('unicodeEscapesToPCRE2', async () => {
            assert.strictEqual((0, ripgrepTextSearchEngine_1.unicodeEscapesToPCRE2)('\\u1234'), '\\x{1234}');
            assert.strictEqual((0, ripgrepTextSearchEngine_1.unicodeEscapesToPCRE2)('\\u1234\\u0001'), '\\x{1234}\\x{0001}');
            assert.strictEqual((0, ripgrepTextSearchEngine_1.unicodeEscapesToPCRE2)('foo\\u1234bar'), 'foo\\x{1234}bar');
            assert.strictEqual((0, ripgrepTextSearchEngine_1.unicodeEscapesToPCRE2)('\\\\\\u1234'), '\\\\\\x{1234}');
            assert.strictEqual((0, ripgrepTextSearchEngine_1.unicodeEscapesToPCRE2)('foo\\\\\\u1234'), 'foo\\\\\\x{1234}');
            assert.strictEqual((0, ripgrepTextSearchEngine_1.unicodeEscapesToPCRE2)('\\u{1234}'), '\\x{1234}');
            assert.strictEqual((0, ripgrepTextSearchEngine_1.unicodeEscapesToPCRE2)('\\u{1234}\\u{0001}'), '\\x{1234}\\x{0001}');
            assert.strictEqual((0, ripgrepTextSearchEngine_1.unicodeEscapesToPCRE2)('foo\\u{1234}bar'), 'foo\\x{1234}bar');
            assert.strictEqual((0, ripgrepTextSearchEngine_1.unicodeEscapesToPCRE2)('[\\u00A0-\\u00FF]'), '[\\x{00A0}-\\x{00FF}]');
            assert.strictEqual((0, ripgrepTextSearchEngine_1.unicodeEscapesToPCRE2)('foo\\u{123456}7bar'), 'foo\\u{123456}7bar');
            assert.strictEqual((0, ripgrepTextSearchEngine_1.unicodeEscapesToPCRE2)('\\u123'), '\\u123');
            assert.strictEqual((0, ripgrepTextSearchEngine_1.unicodeEscapesToPCRE2)('foo'), 'foo');
            assert.strictEqual((0, ripgrepTextSearchEngine_1.unicodeEscapesToPCRE2)(''), '');
        });
        test('fixRegexNewline - src', () => {
            const ttable = [
                ['foo', 'foo'],
                ['invalid(', 'invalid('],
                ['fo\\no', 'fo\\r?\\no'],
                ['f\\no\\no', 'f\\r?\\no\\r?\\no'],
                ['f[a-z\\n1]', 'f(?:[a-z1]|\\r?\\n)'],
                ['f[\\n-a]', 'f[\\n-a]'],
                ['(?<=\\n)\\w', '(?<=\\n)\\w'],
                ['fo\\n+o', 'fo(?:\\r?\\n)+o'],
                ['fo[^\\n]o', 'fo(?!\\r?\\n)o'],
                ['fo[^\\na-z]o', 'fo(?!\\r?\\n|[a-z])o'],
                ['foo[^\\n]+o', 'foo.+o'],
                ['foo[^\\nzq]+o', 'foo[^zq]+o'],
                ['foo[^\\nzq]+o', 'foo[^zq]+o'],
                // preserves quantifies, #137899
                ['fo[^\\S\\n]*o', 'fo[^\\S]*o'],
                ['fo[^\\S\\n]{3,}o', 'fo[^\\S]{3,}o'],
            ];
            for (const [input, expected] of ttable) {
                assert.strictEqual((0, ripgrepTextSearchEngine_1.fixRegexNewline)(input), expected, `${input} -> ${expected}`);
            }
        });
        test('fixRegexNewline - re', () => {
            function testFixRegexNewline([inputReg, testStr, shouldMatch]) {
                const fixed = (0, ripgrepTextSearchEngine_1.fixRegexNewline)(inputReg);
                const reg = new RegExp(fixed);
                assert.strictEqual(reg.test(testStr), shouldMatch, `${inputReg} => ${reg}, ${testStr}, ${shouldMatch}`);
            }
            [
                ['foo', 'foo', true],
                ['foo\\n', 'foo\r\n', true],
                ['foo\\n\\n', 'foo\n\n', true],
                ['foo\\n\\n', 'foo\r\n\r\n', true],
                ['foo\\n', 'foo\n', true],
                ['foo\\nabc', 'foo\r\nabc', true],
                ['foo\\nabc', 'foo\nabc', true],
                ['foo\\r\\n', 'foo\r\n', true],
                ['foo\\n+abc', 'foo\r\nabc', true],
                ['foo\\n+abc', 'foo\n\n\nabc', true],
                ['foo\\n+abc', 'foo\r\n\r\n\r\nabc', true],
                ['foo[\\n-9]+abc', 'foo1abc', true],
            ].forEach(testFixRegexNewline);
        });
        test('fixNewline - matching', () => {
            function testFixNewline([inputReg, testStr, shouldMatch = true]) {
                const fixed = (0, ripgrepTextSearchEngine_1.fixNewline)(inputReg);
                const reg = new RegExp(fixed);
                assert.strictEqual(reg.test(testStr), shouldMatch, `${inputReg} => ${reg}, ${testStr}, ${shouldMatch}`);
            }
            [
                ['foo', 'foo'],
                ['foo\n', 'foo\r\n'],
                ['foo\n', 'foo\n'],
                ['foo\nabc', 'foo\r\nabc'],
                ['foo\nabc', 'foo\nabc'],
                ['foo\r\n', 'foo\r\n'],
                ['foo\nbarc', 'foobar', false],
                ['foobar', 'foo\nbar', false],
            ].forEach(testFixNewline);
        });
        suite('RipgrepParser', () => {
            const TEST_FOLDER = uri_1.URI.file('/foo/bar');
            function testParser(inputData, expectedResults) {
                const testParser = new ripgrepTextSearchEngine_1.RipgrepParser(1000, TEST_FOLDER.fsPath);
                const actualResults = [];
                testParser.on('result', r => {
                    actualResults.push(r);
                });
                inputData.forEach(d => testParser.handleData(d));
                testParser.flush();
                assert.deepStrictEqual(actualResults, expectedResults);
            }
            function makeRgMatch(relativePath, text, lineNumber, matchRanges) {
                return JSON.stringify({
                    type: 'match',
                    data: {
                        path: {
                            text: relativePath
                        },
                        lines: {
                            text
                        },
                        line_number: lineNumber,
                        absolute_offset: 0,
                        submatches: matchRanges.map(mr => {
                            return {
                                ...mr,
                                match: { text: text.substring(mr.start, mr.end) }
                            };
                        })
                    }
                }) + '\n';
            }
            test('single result', () => {
                testParser([
                    makeRgMatch('file1.js', 'foobar', 4, [{ start: 3, end: 6 }])
                ], [
                    {
                        preview: {
                            text: 'foobar',
                            matches: [new searchExtTypes_1.Range(0, 3, 0, 6)]
                        },
                        uri: (0, resources_1.joinPath)(TEST_FOLDER, 'file1.js'),
                        ranges: [new searchExtTypes_1.Range(3, 3, 3, 6)]
                    }
                ]);
            });
            test('multiple results', () => {
                testParser([
                    makeRgMatch('file1.js', 'foobar', 4, [{ start: 3, end: 6 }]),
                    makeRgMatch('app/file2.js', 'foobar', 4, [{ start: 3, end: 6 }]),
                    makeRgMatch('app2/file3.js', 'foobar', 4, [{ start: 3, end: 6 }]),
                ], [
                    {
                        preview: {
                            text: 'foobar',
                            matches: [new searchExtTypes_1.Range(0, 3, 0, 6)]
                        },
                        uri: (0, resources_1.joinPath)(TEST_FOLDER, 'file1.js'),
                        ranges: [new searchExtTypes_1.Range(3, 3, 3, 6)]
                    },
                    {
                        preview: {
                            text: 'foobar',
                            matches: [new searchExtTypes_1.Range(0, 3, 0, 6)]
                        },
                        uri: (0, resources_1.joinPath)(TEST_FOLDER, 'app/file2.js'),
                        ranges: [new searchExtTypes_1.Range(3, 3, 3, 6)]
                    },
                    {
                        preview: {
                            text: 'foobar',
                            matches: [new searchExtTypes_1.Range(0, 3, 0, 6)]
                        },
                        uri: (0, resources_1.joinPath)(TEST_FOLDER, 'app2/file3.js'),
                        ranges: [new searchExtTypes_1.Range(3, 3, 3, 6)]
                    }
                ]);
            });
            test('chopped-up input chunks', () => {
                const dataStrs = [
                    makeRgMatch('file1.js', 'foo bar', 4, [{ start: 3, end: 7 }]),
                    makeRgMatch('app/file2.js', 'foobar', 4, [{ start: 3, end: 6 }]),
                    makeRgMatch('app2/file3.js', 'foobar', 4, [{ start: 3, end: 6 }]),
                ];
                const dataStr0Space = dataStrs[0].indexOf(' ');
                testParser([
                    dataStrs[0].substring(0, dataStr0Space + 1),
                    dataStrs[0].substring(dataStr0Space + 1),
                    '\n',
                    dataStrs[1].trim(),
                    '\n' + dataStrs[2].substring(0, 25),
                    dataStrs[2].substring(25)
                ], [
                    {
                        preview: {
                            text: 'foo bar',
                            matches: [new searchExtTypes_1.Range(0, 3, 0, 7)]
                        },
                        uri: (0, resources_1.joinPath)(TEST_FOLDER, 'file1.js'),
                        ranges: [new searchExtTypes_1.Range(3, 3, 3, 7)]
                    },
                    {
                        preview: {
                            text: 'foobar',
                            matches: [new searchExtTypes_1.Range(0, 3, 0, 6)]
                        },
                        uri: (0, resources_1.joinPath)(TEST_FOLDER, 'app/file2.js'),
                        ranges: [new searchExtTypes_1.Range(3, 3, 3, 6)]
                    },
                    {
                        preview: {
                            text: 'foobar',
                            matches: [new searchExtTypes_1.Range(0, 3, 0, 6)]
                        },
                        uri: (0, resources_1.joinPath)(TEST_FOLDER, 'app2/file3.js'),
                        ranges: [new searchExtTypes_1.Range(3, 3, 3, 6)]
                    }
                ]);
            });
            test('empty result (#100569)', () => {
                testParser([
                    makeRgMatch('file1.js', 'foobar', 4, []),
                    makeRgMatch('file1.js', '', 5, []),
                ], [
                    {
                        preview: {
                            text: 'foobar',
                            matches: [new searchExtTypes_1.Range(0, 0, 0, 1)]
                        },
                        uri: (0, resources_1.joinPath)(TEST_FOLDER, 'file1.js'),
                        ranges: [new searchExtTypes_1.Range(3, 0, 3, 1)]
                    },
                    {
                        preview: {
                            text: '',
                            matches: [new searchExtTypes_1.Range(0, 0, 0, 0)]
                        },
                        uri: (0, resources_1.joinPath)(TEST_FOLDER, 'file1.js'),
                        ranges: [new searchExtTypes_1.Range(4, 0, 4, 0)]
                    }
                ]);
            });
            test('multiple submatches without newline in between (#131507)', () => {
                testParser([
                    makeRgMatch('file1.js', 'foobarbazquux', 4, [{ start: 0, end: 4 }, { start: 6, end: 10 }]),
                ], [
                    {
                        preview: {
                            text: 'foobarbazquux',
                            matches: [new searchExtTypes_1.Range(0, 0, 0, 4), new searchExtTypes_1.Range(0, 6, 0, 10)]
                        },
                        uri: (0, resources_1.joinPath)(TEST_FOLDER, 'file1.js'),
                        ranges: [new searchExtTypes_1.Range(3, 0, 3, 4), new searchExtTypes_1.Range(3, 6, 3, 10)]
                    }
                ]);
            });
            test('multiple submatches with newline in between (#131507)', () => {
                testParser([
                    makeRgMatch('file1.js', 'foo\nbar\nbaz\nquux', 4, [{ start: 0, end: 5 }, { start: 8, end: 13 }]),
                ], [
                    {
                        preview: {
                            text: 'foo\nbar\nbaz\nquux',
                            matches: [new searchExtTypes_1.Range(0, 0, 1, 1), new searchExtTypes_1.Range(2, 0, 3, 1)]
                        },
                        uri: (0, resources_1.joinPath)(TEST_FOLDER, 'file1.js'),
                        ranges: [new searchExtTypes_1.Range(3, 0, 4, 1), new searchExtTypes_1.Range(5, 0, 6, 1)]
                    }
                ]);
            });
        });
        suite('getRgArgs', () => {
            test('simple includes', () => {
                // Only testing the args that come from includes.
                function testGetRgArgs(includes, expectedFromIncludes) {
                    const query = {
                        pattern: 'test'
                    };
                    const options = {
                        includes: includes,
                        excludes: [],
                        maxResults: 1000,
                        useIgnoreFiles: false,
                        followSymlinks: false,
                        useGlobalIgnoreFiles: false,
                        useParentIgnoreFiles: false,
                        folder: uri_1.URI.file('/some/folder')
                    };
                    const expected = [
                        '--hidden',
                        '--no-require-git',
                        '--ignore-case',
                        ...expectedFromIncludes,
                        '--no-ignore',
                        '--crlf',
                        '--fixed-strings',
                        '--no-config',
                        '--no-ignore-global',
                        '--json',
                        '--',
                        'test',
                        '.'
                    ];
                    const result = (0, ripgrepTextSearchEngine_1.getRgArgs)(query, options);
                    assert.deepStrictEqual(result, expected);
                }
                ([
                    [['a/*', 'b/*'], ['-g', '!*', '-g', '/a', '-g', '/a/*', '-g', '/b', '-g', '/b/*']],
                    [['**/a/*', 'b/*'], ['-g', '!*', '-g', '/b', '-g', '/b/*', '-g', '**/a/*']],
                    [['**/a/*', '**/b/*'], ['-g', '**/a/*', '-g', '**/b/*']],
                    [['foo/*bar/something/**'], ['-g', '!*', '-g', '/foo', '-g', '/foo/*bar', '-g', '/foo/*bar/something', '-g', '/foo/*bar/something/**']],
                ].forEach(([includes, expectedFromIncludes]) => testGetRgArgs(includes, expectedFromIncludes)));
            });
        });
        test('brace expansion for ripgrep', () => {
            function testBraceExpansion(argGlob, expectedGlob) {
                const result = (0, ripgrepTextSearchEngine_1.performBraceExpansionForRipgrep)(argGlob);
                assert.deepStrictEqual(result, expectedGlob);
            }
            [
                ['eep/{a,b}/test', ['eep/a/test', 'eep/b/test']],
                ['eep/{a,b}/{c,d,e}', ['eep/a/c', 'eep/a/d', 'eep/a/e', 'eep/b/c', 'eep/b/d', 'eep/b/e']],
                ['eep/{a,b}/\\{c,d,e}', ['eep/a/{c,d,e}', 'eep/b/{c,d,e}']],
                ['eep/{a,b\\}/test', ['eep/{a,b}/test']],
                ['eep/{a,b\\\\}/test', ['eep/a/test', 'eep/b\\\\/test']],
                ['eep/{a,b\\\\\\}/test', ['eep/{a,b\\\\}/test']],
                ['e\\{ep/{a,b}/test', ['e{ep/a/test', 'e{ep/b/test']],
                ['eep/{a,\\b}/test', ['eep/a/test', 'eep/\\b/test']],
                ['{a/*.*,b/*.*}', ['a/*.*', 'b/*.*']],
                ['{{}', ['{{}']],
                ['aa{{}', ['aa{{}']],
                ['{b{}', ['{b{}']],
                ['{{}c', ['{{}c']],
                ['{{}}', ['{{}}']],
                ['\\{{}}', ['{}']],
                ['{}foo', ['foo']],
                ['bar{ }foo', ['bar foo']],
                ['{}', ['']],
            ].forEach(([includePattern, expectedPatterns]) => testBraceExpansion(includePattern, expectedPatterns));
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmlwZ3JlcFRleHRTZWFyY2hFbmdpbmVVdGlscy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3NlYXJjaC90ZXN0L25vZGUvcmlwZ3JlcFRleHRTZWFyY2hFbmdpbmVVdGlscy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBUWhHLEtBQUssQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7UUFDckMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ3hDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSwrQ0FBcUIsRUFBQyxTQUFTLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUNsRSxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsK0NBQXFCLEVBQUMsZ0JBQWdCLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQ2xGLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSwrQ0FBcUIsRUFBQyxlQUFlLENBQUMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBQzlFLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSwrQ0FBcUIsRUFBQyxhQUFhLENBQUMsRUFBRSxlQUFlLENBQUMsQ0FBQztZQUMxRSxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsK0NBQXFCLEVBQUMsZ0JBQWdCLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1lBRWhGLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSwrQ0FBcUIsRUFBQyxXQUFXLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUNwRSxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsK0NBQXFCLEVBQUMsb0JBQW9CLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQ3RGLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSwrQ0FBcUIsRUFBQyxpQkFBaUIsQ0FBQyxFQUFF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