/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/resources", "vs/base/common/uri", "vs/workbench/services/search/node/ripgrepTextSearchEngine", "vs/workbench/services/search/common/searchExtTypes"], function (require, exports, assert, resources_1, uri_1, ripgrepTextSearchEngine_1, searchExtTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('RipgrepTextSearchEngine', () => {
        test('unicodeEscapesToPCRE2', async () => {
            assert.strictEqual((0, ripgrepTextSearchEngine_1.$Cdc)('\\u1234'), '\\x{1234}');
            assert.strictEqual((0, ripgrepTextSearchEngine_1.$Cdc)('\\u1234\\u0001'), '\\x{1234}\\x{0001}');
            assert.strictEqual((0, ripgrepTextSearchEngine_1.$Cdc)('foo\\u1234bar'), 'foo\\x{1234}bar');
            assert.strictEqual((0, ripgrepTextSearchEngine_1.$Cdc)('\\\\\\u1234'), '\\\\\\x{1234}');
            assert.strictEqual((0, ripgrepTextSearchEngine_1.$Cdc)('foo\\\\\\u1234'), 'foo\\\\\\x{1234}');
            assert.strictEqual((0, ripgrepTextSearchEngine_1.$Cdc)('\\u{1234}'), '\\x{1234}');
            assert.strictEqual((0, ripgrepTextSearchEngine_1.$Cdc)('\\u{1234}\\u{0001}'), '\\x{1234}\\x{0001}');
            assert.strictEqual((0, ripgrepTextSearchEngine_1.$Cdc)('foo\\u{1234}bar'), 'foo\\x{1234}bar');
            assert.strictEqual((0, ripgrepTextSearchEngine_1.$Cdc)('[\\u00A0-\\u00FF]'), '[\\x{00A0}-\\x{00FF}]');
            assert.strictEqual((0, ripgrepTextSearchEngine_1.$Cdc)('foo\\u{123456}7bar'), 'foo\\u{123456}7bar');
            assert.strictEqual((0, ripgrepTextSearchEngine_1.$Cdc)('\\u123'), '\\u123');
            assert.strictEqual((0, ripgrepTextSearchEngine_1.$Cdc)('foo'), 'foo');
            assert.strictEqual((0, ripgrepTextSearchEngine_1.$Cdc)(''), '');
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
                assert.strictEqual((0, ripgrepTextSearchEngine_1.$Ddc)(input), expected, `${input} -> ${expected}`);
            }
        });
        test('fixRegexNewline - re', () => {
            function testFixRegexNewline([inputReg, testStr, shouldMatch]) {
                const fixed = (0, ripgrepTextSearchEngine_1.$Ddc)(inputReg);
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
                const fixed = (0, ripgrepTextSearchEngine_1.$Edc)(inputReg);
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
                const testParser = new ripgrepTextSearchEngine_1.$Adc(1000, TEST_FOLDER.fsPath);
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
                            matches: [new searchExtTypes_1.$iI(0, 3, 0, 6)]
                        },
                        uri: (0, resources_1.$ig)(TEST_FOLDER, 'file1.js'),
                        ranges: [new searchExtTypes_1.$iI(3, 3, 3, 6)]
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
                            matches: [new searchExtTypes_1.$iI(0, 3, 0, 6)]
                        },
                        uri: (0, resources_1.$ig)(TEST_FOLDER, 'file1.js'),
                        ranges: [new searchExtTypes_1.$iI(3, 3, 3, 6)]
                    },
                    {
                        preview: {
                            text: 'foobar',
                            matches: [new searchExtTypes_1.$iI(0, 3, 0, 6)]
                        },
                        uri: (0, resources_1.$ig)(TEST_FOLDER, 'app/file2.js'),
                        ranges: [new searchExtTypes_1.$iI(3, 3, 3, 6)]
                    },
                    {
                        preview: {
                            text: 'foobar',
                            matches: [new searchExtTypes_1.$iI(0, 3, 0, 6)]
                        },
                        uri: (0, resources_1.$ig)(TEST_FOLDER, 'app2/file3.js'),
                        ranges: [new searchExtTypes_1.$iI(3, 3, 3, 6)]
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
                            matches: [new searchExtTypes_1.$iI(0, 3, 0, 7)]
                        },
                        uri: (0, resources_1.$ig)(TEST_FOLDER, 'file1.js'),
                        ranges: [new searchExtTypes_1.$iI(3, 3, 3, 7)]
                    },
                    {
                        preview: {
                            text: 'foobar',
                            matches: [new searchExtTypes_1.$iI(0, 3, 0, 6)]
                        },
                        uri: (0, resources_1.$ig)(TEST_FOLDER, 'app/file2.js'),
                        ranges: [new searchExtTypes_1.$iI(3, 3, 3, 6)]
                    },
                    {
                        preview: {
                            text: 'foobar',
                            matches: [new searchExtTypes_1.$iI(0, 3, 0, 6)]
                        },
                        uri: (0, resources_1.$ig)(TEST_FOLDER, 'app2/file3.js'),
                        ranges: [new searchExtTypes_1.$iI(3, 3, 3, 6)]
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
                            matches: [new searchExtTypes_1.$iI(0, 0, 0, 1)]
                        },
                        uri: (0, resources_1.$ig)(TEST_FOLDER, 'file1.js'),
                        ranges: [new searchExtTypes_1.$iI(3, 0, 3, 1)]
                    },
                    {
                        preview: {
                            text: '',
                            matches: [new searchExtTypes_1.$iI(0, 0, 0, 0)]
                        },
                        uri: (0, resources_1.$ig)(TEST_FOLDER, 'file1.js'),
                        ranges: [new searchExtTypes_1.$iI(4, 0, 4, 0)]
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
                            matches: [new searchExtTypes_1.$iI(0, 0, 0, 4), new searchExtTypes_1.$iI(0, 6, 0, 10)]
                        },
                        uri: (0, resources_1.$ig)(TEST_FOLDER, 'file1.js'),
                        ranges: [new searchExtTypes_1.$iI(3, 0, 3, 4), new searchExtTypes_1.$iI(3, 6, 3, 10)]
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
                            matches: [new searchExtTypes_1.$iI(0, 0, 1, 1), new searchExtTypes_1.$iI(2, 0, 3, 1)]
                        },
                        uri: (0, resources_1.$ig)(TEST_FOLDER, 'file1.js'),
                        ranges: [new searchExtTypes_1.$iI(3, 0, 4, 1), new searchExtTypes_1.$iI(5, 0, 6, 1)]
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
                    const result = (0, ripgrepTextSearchEngine_1.$Bdc)(query, options);
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
                const result = (0, ripgrepTextSearchEngine_1.$Fdc)(argGlob);
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
//# sourceMappingURL=ripgrepTextSearchEngineUtils.test.js.map