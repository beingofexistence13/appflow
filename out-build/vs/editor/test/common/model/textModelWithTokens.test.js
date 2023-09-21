/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/languages", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/languages/nullTokenize", "vs/editor/common/languages/language", "vs/editor/test/common/core/testLineToken", "vs/editor/test/common/testTextModel", "vs/base/test/common/utils"], function (require, exports, assert, lifecycle_1, position_1, range_1, languages_1, languageConfigurationRegistry_1, nullTokenize_1, language_1, testLineToken_1, testTextModel_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createTextModelWithBrackets(disposables, text, brackets) {
        const languageId = 'bracketMode2';
        const instantiationService = (0, testTextModel_1.$Q0b)(disposables);
        const languageConfigurationService = instantiationService.get(languageConfigurationRegistry_1.$2t);
        const languageService = instantiationService.get(language_1.$ct);
        disposables.add(languageService.registerLanguage({ id: languageId }));
        disposables.add(languageConfigurationService.register(languageId, { brackets }));
        return disposables.add((0, testTextModel_1.$P0b)(instantiationService, text, languageId));
    }
    suite('TextModelWithTokens', () => {
        (0, utils_1.$bT)();
        function testBrackets(contents, brackets) {
            const languageId = 'testMode';
            const disposables = new lifecycle_1.$jc();
            const instantiationService = (0, testTextModel_1.$Q0b)(disposables);
            const languageConfigurationService = instantiationService.get(languageConfigurationRegistry_1.$2t);
            const languageService = instantiationService.get(language_1.$ct);
            disposables.add(languageService.registerLanguage({ id: languageId }));
            disposables.add(languageConfigurationService.register(languageId, {
                brackets: brackets
            }));
            function toRelaxedFoundBracket(a) {
                if (!a) {
                    return null;
                }
                return {
                    range: a.range.toString(),
                    info: a.bracketInfo,
                };
            }
            const charIsBracket = {};
            const charIsOpenBracket = {};
            const openForChar = {};
            const closeForChar = {};
            brackets.forEach((b) => {
                charIsBracket[b[0]] = true;
                charIsBracket[b[1]] = true;
                charIsOpenBracket[b[0]] = true;
                charIsOpenBracket[b[1]] = false;
                openForChar[b[0]] = b[0];
                closeForChar[b[0]] = b[1];
                openForChar[b[1]] = b[0];
                closeForChar[b[1]] = b[1];
            });
            const expectedBrackets = [];
            for (let lineIndex = 0; lineIndex < contents.length; lineIndex++) {
                const lineText = contents[lineIndex];
                for (let charIndex = 0; charIndex < lineText.length; charIndex++) {
                    const ch = lineText.charAt(charIndex);
                    if (charIsBracket[ch]) {
                        expectedBrackets.push({
                            bracketInfo: languageConfigurationService.getLanguageConfiguration(languageId).bracketsNew.getBracketInfo(ch),
                            range: new range_1.$ks(lineIndex + 1, charIndex + 1, lineIndex + 1, charIndex + 2)
                        });
                    }
                }
            }
            const model = disposables.add((0, testTextModel_1.$P0b)(instantiationService, contents.join('\n'), languageId));
            // findPrevBracket
            {
                let expectedBracketIndex = expectedBrackets.length - 1;
                let currentExpectedBracket = expectedBracketIndex >= 0 ? expectedBrackets[expectedBracketIndex] : null;
                for (let lineNumber = contents.length; lineNumber >= 1; lineNumber--) {
                    const lineText = contents[lineNumber - 1];
                    for (let column = lineText.length + 1; column >= 1; column--) {
                        if (currentExpectedBracket) {
                            if (lineNumber === currentExpectedBracket.range.startLineNumber && column < currentExpectedBracket.range.endColumn) {
                                expectedBracketIndex--;
                                currentExpectedBracket = expectedBracketIndex >= 0 ? expectedBrackets[expectedBracketIndex] : null;
                            }
                        }
                        const actual = model.bracketPairs.findPrevBracket({
                            lineNumber: lineNumber,
                            column: column
                        });
                        assert.deepStrictEqual(toRelaxedFoundBracket(actual), toRelaxedFoundBracket(currentExpectedBracket), 'findPrevBracket of ' + lineNumber + ', ' + column);
                    }
                }
            }
            // findNextBracket
            {
                let expectedBracketIndex = 0;
                let currentExpectedBracket = expectedBracketIndex < expectedBrackets.length ? expectedBrackets[expectedBracketIndex] : null;
                for (let lineNumber = 1; lineNumber <= contents.length; lineNumber++) {
                    const lineText = contents[lineNumber - 1];
                    for (let column = 1; column <= lineText.length + 1; column++) {
                        if (currentExpectedBracket) {
                            if (lineNumber === currentExpectedBracket.range.startLineNumber && column > currentExpectedBracket.range.startColumn) {
                                expectedBracketIndex++;
                                currentExpectedBracket = expectedBracketIndex < expectedBrackets.length ? expectedBrackets[expectedBracketIndex] : null;
                            }
                        }
                        const actual = model.bracketPairs.findNextBracket({
                            lineNumber: lineNumber,
                            column: column
                        });
                        assert.deepStrictEqual(toRelaxedFoundBracket(actual), toRelaxedFoundBracket(currentExpectedBracket), 'findNextBracket of ' + lineNumber + ', ' + column);
                    }
                }
            }
            disposables.dispose();
        }
        test('brackets1', () => {
            testBrackets([
                'if (a == 3) { return (7 * (a + 5)); }'
            ], [
                ['{', '}'],
                ['[', ']'],
                ['(', ')']
            ]);
        });
    });
    function assertIsNotBracket(model, lineNumber, column) {
        const match = model.bracketPairs.matchBracket(new position_1.$js(lineNumber, column));
        assert.strictEqual(match, null, 'is not matching brackets at ' + lineNumber + ', ' + column);
    }
    function assertIsBracket(model, testPosition, expected) {
        expected.sort(range_1.$ks.compareRangesUsingStarts);
        const actual = model.bracketPairs.matchBracket(testPosition);
        actual?.sort(range_1.$ks.compareRangesUsingStarts);
        assert.deepStrictEqual(actual, expected, 'matches brackets at ' + testPosition);
    }
    suite('TextModelWithTokens - bracket matching', () => {
        const languageId = 'bracketMode1';
        let disposables;
        let instantiationService;
        let languageConfigurationService;
        let languageService;
        setup(() => {
            disposables = new lifecycle_1.$jc();
            instantiationService = (0, testTextModel_1.$Q0b)(disposables);
            languageConfigurationService = instantiationService.get(languageConfigurationRegistry_1.$2t);
            languageService = instantiationService.get(language_1.$ct);
            disposables.add(languageService.registerLanguage({ id: languageId }));
            disposables.add(languageConfigurationService.register(languageId, {
                brackets: [
                    ['{', '}'],
                    ['[', ']'],
                    ['(', ')'],
                ]
            }));
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.$bT)();
        test('bracket matching 1', () => {
            const text = ')]}{[(' + '\n' +
                ')]}{[(';
            const model = disposables.add((0, testTextModel_1.$P0b)(instantiationService, text, languageId));
            assertIsNotBracket(model, 1, 1);
            assertIsNotBracket(model, 1, 2);
            assertIsNotBracket(model, 1, 3);
            assertIsBracket(model, new position_1.$js(1, 4), [new range_1.$ks(1, 4, 1, 5), new range_1.$ks(2, 3, 2, 4)]);
            assertIsBracket(model, new position_1.$js(1, 5), [new range_1.$ks(1, 5, 1, 6), new range_1.$ks(2, 2, 2, 3)]);
            assertIsBracket(model, new position_1.$js(1, 6), [new range_1.$ks(1, 6, 1, 7), new range_1.$ks(2, 1, 2, 2)]);
            assertIsBracket(model, new position_1.$js(1, 7), [new range_1.$ks(1, 6, 1, 7), new range_1.$ks(2, 1, 2, 2)]);
            assertIsBracket(model, new position_1.$js(2, 1), [new range_1.$ks(2, 1, 2, 2), new range_1.$ks(1, 6, 1, 7)]);
            assertIsBracket(model, new position_1.$js(2, 2), [new range_1.$ks(2, 2, 2, 3), new range_1.$ks(1, 5, 1, 6)]);
            assertIsBracket(model, new position_1.$js(2, 3), [new range_1.$ks(2, 3, 2, 4), new range_1.$ks(1, 4, 1, 5)]);
            assertIsBracket(model, new position_1.$js(2, 4), [new range_1.$ks(2, 3, 2, 4), new range_1.$ks(1, 4, 1, 5)]);
            assertIsNotBracket(model, 2, 5);
            assertIsNotBracket(model, 2, 6);
            assertIsNotBracket(model, 2, 7);
        });
        test('bracket matching 2', () => {
            const text = 'var bar = {' + '\n' +
                'foo: {' + '\n' +
                '}, bar: {hallo: [{' + '\n' +
                '}, {' + '\n' +
                '}]}}';
            const model = disposables.add((0, testTextModel_1.$P0b)(instantiationService, text, languageId));
            const brackets = [
                [new position_1.$js(1, 11), new range_1.$ks(1, 11, 1, 12), new range_1.$ks(5, 4, 5, 5)],
                [new position_1.$js(1, 12), new range_1.$ks(1, 11, 1, 12), new range_1.$ks(5, 4, 5, 5)],
                [new position_1.$js(2, 6), new range_1.$ks(2, 6, 2, 7), new range_1.$ks(3, 1, 3, 2)],
                [new position_1.$js(2, 7), new range_1.$ks(2, 6, 2, 7), new range_1.$ks(3, 1, 3, 2)],
                [new position_1.$js(3, 1), new range_1.$ks(3, 1, 3, 2), new range_1.$ks(2, 6, 2, 7)],
                [new position_1.$js(3, 2), new range_1.$ks(3, 1, 3, 2), new range_1.$ks(2, 6, 2, 7)],
                [new position_1.$js(3, 9), new range_1.$ks(3, 9, 3, 10), new range_1.$ks(5, 3, 5, 4)],
                [new position_1.$js(3, 10), new range_1.$ks(3, 9, 3, 10), new range_1.$ks(5, 3, 5, 4)],
                [new position_1.$js(3, 17), new range_1.$ks(3, 17, 3, 18), new range_1.$ks(5, 2, 5, 3)],
                [new position_1.$js(3, 18), new range_1.$ks(3, 18, 3, 19), new range_1.$ks(4, 1, 4, 2)],
                [new position_1.$js(3, 19), new range_1.$ks(3, 18, 3, 19), new range_1.$ks(4, 1, 4, 2)],
                [new position_1.$js(4, 1), new range_1.$ks(4, 1, 4, 2), new range_1.$ks(3, 18, 3, 19)],
                [new position_1.$js(4, 2), new range_1.$ks(4, 1, 4, 2), new range_1.$ks(3, 18, 3, 19)],
                [new position_1.$js(4, 4), new range_1.$ks(4, 4, 4, 5), new range_1.$ks(5, 1, 5, 2)],
                [new position_1.$js(4, 5), new range_1.$ks(4, 4, 4, 5), new range_1.$ks(5, 1, 5, 2)],
                [new position_1.$js(5, 1), new range_1.$ks(5, 1, 5, 2), new range_1.$ks(4, 4, 4, 5)],
                [new position_1.$js(5, 2), new range_1.$ks(5, 2, 5, 3), new range_1.$ks(3, 17, 3, 18)],
                [new position_1.$js(5, 3), new range_1.$ks(5, 3, 5, 4), new range_1.$ks(3, 9, 3, 10)],
                [new position_1.$js(5, 4), new range_1.$ks(5, 4, 5, 5), new range_1.$ks(1, 11, 1, 12)],
                [new position_1.$js(5, 5), new range_1.$ks(5, 4, 5, 5), new range_1.$ks(1, 11, 1, 12)],
            ];
            const isABracket = { 1: {}, 2: {}, 3: {}, 4: {}, 5: {} };
            for (let i = 0, len = brackets.length; i < len; i++) {
                const [testPos, b1, b2] = brackets[i];
                assertIsBracket(model, testPos, [b1, b2]);
                isABracket[testPos.lineNumber][testPos.column] = true;
            }
            for (let i = 1, len = model.getLineCount(); i <= len; i++) {
                const line = model.getLineContent(i);
                for (let j = 1, lenJ = line.length + 1; j <= lenJ; j++) {
                    if (!isABracket[i].hasOwnProperty(j)) {
                        assertIsNotBracket(model, i, j);
                    }
                }
            }
        });
    });
    suite('TextModelWithTokens 2', () => {
        (0, utils_1.$bT)();
        test('bracket matching 3', () => {
            const text = [
                'begin',
                '    loop',
                '        if then',
                '        end if;',
                '    end loop;',
                'end;',
                '',
                'begin',
                '    loop',
                '        if then',
                '        end ifa;',
                '    end loop;',
                'end;',
            ].join('\n');
            const disposables = new lifecycle_1.$jc();
            const model = createTextModelWithBrackets(disposables, text, [
                ['if', 'end if'],
                ['loop', 'end loop'],
                ['begin', 'end']
            ]);
            // <if> ... <end ifa> is not matched
            assertIsNotBracket(model, 10, 9);
            // <if> ... <end if> is matched
            assertIsBracket(model, new position_1.$js(3, 9), [new range_1.$ks(3, 9, 3, 11), new range_1.$ks(4, 9, 4, 15)]);
            assertIsBracket(model, new position_1.$js(4, 9), [new range_1.$ks(4, 9, 4, 15), new range_1.$ks(3, 9, 3, 11)]);
            // <loop> ... <end loop> is matched
            assertIsBracket(model, new position_1.$js(2, 5), [new range_1.$ks(2, 5, 2, 9), new range_1.$ks(5, 5, 5, 13)]);
            assertIsBracket(model, new position_1.$js(5, 5), [new range_1.$ks(5, 5, 5, 13), new range_1.$ks(2, 5, 2, 9)]);
            // <begin> ... <end> is matched
            assertIsBracket(model, new position_1.$js(1, 1), [new range_1.$ks(1, 1, 1, 6), new range_1.$ks(6, 1, 6, 4)]);
            assertIsBracket(model, new position_1.$js(6, 1), [new range_1.$ks(6, 1, 6, 4), new range_1.$ks(1, 1, 1, 6)]);
            disposables.dispose();
        });
        test('bracket matching 4', () => {
            const text = [
                'recordbegin',
                '  simplerecordbegin',
                '  endrecord',
                'endrecord',
            ].join('\n');
            const disposables = new lifecycle_1.$jc();
            const model = createTextModelWithBrackets(disposables, text, [
                ['recordbegin', 'endrecord'],
                ['simplerecordbegin', 'endrecord'],
            ]);
            // <recordbegin> ... <endrecord> is matched
            assertIsBracket(model, new position_1.$js(1, 1), [new range_1.$ks(1, 1, 1, 12), new range_1.$ks(4, 1, 4, 10)]);
            assertIsBracket(model, new position_1.$js(4, 1), [new range_1.$ks(4, 1, 4, 10), new range_1.$ks(1, 1, 1, 12)]);
            // <simplerecordbegin> ... <endrecord> is matched
            assertIsBracket(model, new position_1.$js(2, 3), [new range_1.$ks(2, 3, 2, 20), new range_1.$ks(3, 3, 3, 12)]);
            assertIsBracket(model, new position_1.$js(3, 3), [new range_1.$ks(3, 3, 3, 12), new range_1.$ks(2, 3, 2, 20)]);
            disposables.dispose();
        });
        test('issue #95843: Highlighting of closing braces is indicating wrong brace when cursor is behind opening brace', () => {
            const disposables = new lifecycle_1.$jc();
            const instantiationService = (0, testTextModel_1.$Q0b)(disposables);
            const languageConfigurationService = instantiationService.get(languageConfigurationRegistry_1.$2t);
            const languageService = instantiationService.get(language_1.$ct);
            const mode1 = 'testMode1';
            const mode2 = 'testMode2';
            const languageIdCodec = languageService.languageIdCodec;
            disposables.add(languageService.registerLanguage({ id: mode1 }));
            disposables.add(languageService.registerLanguage({ id: mode2 }));
            const encodedMode1 = languageIdCodec.encodeLanguageId(mode1);
            const encodedMode2 = languageIdCodec.encodeLanguageId(mode2);
            const otherMetadata1 = ((encodedMode1 << 0 /* MetadataConsts.LANGUAGEID_OFFSET */)
                | (0 /* StandardTokenType.Other */ << 8 /* MetadataConsts.TOKEN_TYPE_OFFSET */)
                | (1024 /* MetadataConsts.BALANCED_BRACKETS_MASK */)) >>> 0;
            const otherMetadata2 = ((encodedMode2 << 0 /* MetadataConsts.LANGUAGEID_OFFSET */)
                | (0 /* StandardTokenType.Other */ << 8 /* MetadataConsts.TOKEN_TYPE_OFFSET */)
                | (1024 /* MetadataConsts.BALANCED_BRACKETS_MASK */)) >>> 0;
            const tokenizationSupport = {
                getInitialState: () => nullTokenize_1.$uC,
                tokenize: undefined,
                tokenizeEncoded: (line, hasEOL, state) => {
                    switch (line) {
                        case 'function f() {': {
                            const tokens = new Uint32Array([
                                0, otherMetadata1,
                                8, otherMetadata1,
                                9, otherMetadata1,
                                10, otherMetadata1,
                                11, otherMetadata1,
                                12, otherMetadata1,
                                13, otherMetadata1,
                            ]);
                            return new languages_1.$6s(tokens, state);
                        }
                        case '  return <p>{true}</p>;': {
                            const tokens = new Uint32Array([
                                0, otherMetadata1,
                                2, otherMetadata1,
                                8, otherMetadata1,
                                9, otherMetadata2,
                                10, otherMetadata2,
                                11, otherMetadata2,
                                12, otherMetadata2,
                                13, otherMetadata1,
                                17, otherMetadata2,
                                18, otherMetadata2,
                                20, otherMetadata2,
                                21, otherMetadata2,
                                22, otherMetadata2,
                            ]);
                            return new languages_1.$6s(tokens, state);
                        }
                        case '}': {
                            const tokens = new Uint32Array([
                                0, otherMetadata1
                            ]);
                            return new languages_1.$6s(tokens, state);
                        }
                    }
                    throw new Error(`Unexpected`);
                }
            };
            disposables.add(languages_1.$bt.register(mode1, tokenizationSupport));
            disposables.add(languageConfigurationService.register(mode1, {
                brackets: [
                    ['{', '}'],
                    ['[', ']'],
                    ['(', ')']
                ],
            }));
            disposables.add(languageConfigurationService.register(mode2, {
                brackets: [
                    ['{', '}'],
                    ['[', ']'],
                    ['(', ')']
                ],
            }));
            const model = disposables.add((0, testTextModel_1.$P0b)(instantiationService, [
                'function f() {',
                '  return <p>{true}</p>;',
                '}',
            ].join('\n'), mode1));
            model.tokenization.forceTokenization(1);
            model.tokenization.forceTokenization(2);
            model.tokenization.forceTokenization(3);
            assert.deepStrictEqual(model.bracketPairs.matchBracket(new position_1.$js(2, 14)), [new range_1.$ks(2, 13, 2, 14), new range_1.$ks(2, 18, 2, 19)]);
            disposables.dispose();
        });
        test('issue #88075: TypeScript brace matching is incorrect in `${}` strings', () => {
            const disposables = new lifecycle_1.$jc();
            const instantiationService = (0, testTextModel_1.$Q0b)(disposables);
            const languageConfigurationService = instantiationService.get(languageConfigurationRegistry_1.$2t);
            const mode = 'testMode';
            const languageIdCodec = instantiationService.get(language_1.$ct).languageIdCodec;
            const encodedMode = languageIdCodec.encodeLanguageId(mode);
            const otherMetadata = ((encodedMode << 0 /* MetadataConsts.LANGUAGEID_OFFSET */)
                | (0 /* StandardTokenType.Other */ << 8 /* MetadataConsts.TOKEN_TYPE_OFFSET */)) >>> 0;
            const stringMetadata = ((encodedMode << 0 /* MetadataConsts.LANGUAGEID_OFFSET */)
                | (2 /* StandardTokenType.String */ << 8 /* MetadataConsts.TOKEN_TYPE_OFFSET */)) >>> 0;
            const tokenizationSupport = {
                getInitialState: () => nullTokenize_1.$uC,
                tokenize: undefined,
                tokenizeEncoded: (line, hasEOL, state) => {
                    switch (line) {
                        case 'function hello() {': {
                            const tokens = new Uint32Array([
                                0, otherMetadata
                            ]);
                            return new languages_1.$6s(tokens, state);
                        }
                        case '    console.log(`${100}`);': {
                            const tokens = new Uint32Array([
                                0, otherMetadata,
                                16, stringMetadata,
                                19, otherMetadata,
                                22, stringMetadata,
                                24, otherMetadata,
                            ]);
                            return new languages_1.$6s(tokens, state);
                        }
                        case '}': {
                            const tokens = new Uint32Array([
                                0, otherMetadata
                            ]);
                            return new languages_1.$6s(tokens, state);
                        }
                    }
                    throw new Error(`Unexpected`);
                }
            };
            disposables.add(languages_1.$bt.register(mode, tokenizationSupport));
            disposables.add(languageConfigurationService.register(mode, {
                brackets: [
                    ['{', '}'],
                    ['[', ']'],
                    ['(', ')']
                ],
            }));
            const model = disposables.add((0, testTextModel_1.$P0b)(instantiationService, [
                'function hello() {',
                '    console.log(`${100}`);',
                '}'
            ].join('\n'), mode));
            model.tokenization.forceTokenization(1);
            model.tokenization.forceTokenization(2);
            model.tokenization.forceTokenization(3);
            assert.deepStrictEqual(model.bracketPairs.matchBracket(new position_1.$js(2, 23)), null);
            assert.deepStrictEqual(model.bracketPairs.matchBracket(new position_1.$js(2, 20)), null);
            disposables.dispose();
        });
    });
    suite('TextModelWithTokens regression tests', () => {
        (0, utils_1.$bT)();
        test('microsoft/monaco-editor#122: Unhandled Exception: TypeError: Unable to get property \'replace\' of undefined or null reference', () => {
            function assertViewLineTokens(model, lineNumber, forceTokenization, expected) {
                if (forceTokenization) {
                    model.tokenization.forceTokenization(lineNumber);
                }
                const _actual = model.tokenization.getLineTokens(lineNumber).inflate();
                const actual = [];
                for (let i = 0, len = _actual.getCount(); i < len; i++) {
                    actual[i] = {
                        endIndex: _actual.getEndOffset(i),
                        foreground: _actual.getForeground(i)
                    };
                }
                const decode = (token) => {
                    return {
                        endIndex: token.endIndex,
                        foreground: token.getForeground()
                    };
                };
                assert.deepStrictEqual(actual, expected.map(decode));
            }
            let _tokenId = 10;
            const LANG_ID1 = 'indicisiveMode1';
            const LANG_ID2 = 'indicisiveMode2';
            const tokenizationSupport = {
                getInitialState: () => nullTokenize_1.$uC,
                tokenize: undefined,
                tokenizeEncoded: (line, hasEOL, state) => {
                    const myId = ++_tokenId;
                    const tokens = new Uint32Array(2);
                    tokens[0] = 0;
                    tokens[1] = (myId << 15 /* MetadataConsts.FOREGROUND_OFFSET */) >>> 0;
                    return new languages_1.$6s(tokens, state);
                }
            };
            const registration1 = languages_1.$bt.register(LANG_ID1, tokenizationSupport);
            const registration2 = languages_1.$bt.register(LANG_ID2, tokenizationSupport);
            const model = (0, testTextModel_1.$O0b)('A model with\ntwo lines');
            assertViewLineTokens(model, 1, true, [createViewLineToken(12, 1)]);
            assertViewLineTokens(model, 2, true, [createViewLineToken(9, 1)]);
            model.setLanguage(LANG_ID1);
            assertViewLineTokens(model, 1, true, [createViewLineToken(12, 11)]);
            assertViewLineTokens(model, 2, true, [createViewLineToken(9, 12)]);
            model.setLanguage(LANG_ID2);
            assertViewLineTokens(model, 1, false, [createViewLineToken(12, 1)]);
            assertViewLineTokens(model, 2, false, [createViewLineToken(9, 1)]);
            model.dispose();
            registration1.dispose();
            registration2.dispose();
            function createViewLineToken(endIndex, foreground) {
                const metadata = ((foreground << 15 /* MetadataConsts.FOREGROUND_OFFSET */)) >>> 0;
                return new testLineToken_1.$i$b(endIndex, metadata);
            }
        });
        test('microsoft/monaco-editor#133: Error: Cannot read property \'modeId\' of undefined', () => {
            const disposables = new lifecycle_1.$jc();
            const model = createTextModelWithBrackets(disposables, [
                'Imports System',
                'Imports System.Collections.Generic',
                '',
                'Module m1',
                '',
                '\tSub Main()',
                '\tEnd Sub',
                '',
                'End Module',
            ].join('\n'), [
                ['module', 'end module'],
                ['sub', 'end sub']
            ]);
            const actual = model.bracketPairs.matchBracket(new position_1.$js(4, 1));
            assert.deepStrictEqual(actual, [new range_1.$ks(4, 1, 4, 7), new range_1.$ks(9, 1, 9, 11)]);
            disposables.dispose();
        });
        test('issue #11856: Bracket matching does not work as expected if the opening brace symbol is contained in the closing brace symbol', () => {
            const disposables = new lifecycle_1.$jc();
            const model = createTextModelWithBrackets(disposables, [
                'sequence "outer"',
                '     sequence "inner"',
                '     endsequence',
                'endsequence',
            ].join('\n'), [
                ['sequence', 'endsequence'],
                ['feature', 'endfeature']
            ]);
            const actual = model.bracketPairs.matchBracket(new position_1.$js(3, 9));
            assert.deepStrictEqual(actual, [new range_1.$ks(2, 6, 2, 14), new range_1.$ks(3, 6, 3, 17)]);
            disposables.dispose();
        });
        test('issue #63822: Wrong embedded language detected for empty lines', () => {
            const disposables = new lifecycle_1.$jc();
            const instantiationService = (0, testTextModel_1.$Q0b)(disposables);
            const languageService = instantiationService.get(language_1.$ct);
            const outerMode = 'outerMode';
            const innerMode = 'innerMode';
            disposables.add(languageService.registerLanguage({ id: outerMode }));
            disposables.add(languageService.registerLanguage({ id: innerMode }));
            const languageIdCodec = instantiationService.get(language_1.$ct).languageIdCodec;
            const encodedInnerMode = languageIdCodec.encodeLanguageId(innerMode);
            const tokenizationSupport = {
                getInitialState: () => nullTokenize_1.$uC,
                tokenize: undefined,
                tokenizeEncoded: (line, hasEOL, state) => {
                    const tokens = new Uint32Array(2);
                    tokens[0] = 0;
                    tokens[1] = (encodedInnerMode << 0 /* MetadataConsts.LANGUAGEID_OFFSET */) >>> 0;
                    return new languages_1.$6s(tokens, state);
                }
            };
            disposables.add(languages_1.$bt.register(outerMode, tokenizationSupport));
            const model = disposables.add((0, testTextModel_1.$P0b)(instantiationService, 'A model with one line', outerMode));
            model.tokenization.forceTokenization(1);
            assert.strictEqual(model.getLanguageIdAtPosition(1, 1), innerMode);
            disposables.dispose();
        });
    });
    suite('TextModel.getLineIndentGuide', () => {
        (0, utils_1.$bT)();
        function assertIndentGuides(lines, indentSize) {
            const languageId = 'testLang';
            const disposables = new lifecycle_1.$jc();
            const instantiationService = (0, testTextModel_1.$Q0b)(disposables);
            const languageService = instantiationService.get(language_1.$ct);
            disposables.add(languageService.registerLanguage({ id: languageId }));
            const text = lines.map(l => l[4]).join('\n');
            const model = disposables.add((0, testTextModel_1.$P0b)(instantiationService, text, languageId));
            model.updateOptions({ indentSize: indentSize });
            const actualIndents = model.guides.getLinesIndentGuides(1, model.getLineCount());
            const actual = [];
            for (let line = 1; line <= model.getLineCount(); line++) {
                const activeIndentGuide = model.guides.getActiveIndentGuide(line, 1, model.getLineCount());
                actual[line - 1] = [actualIndents[line - 1], activeIndentGuide.startLineNumber, activeIndentGuide.endLineNumber, activeIndentGuide.indent, model.getLineContent(line)];
            }
            assert.deepStrictEqual(actual, lines);
            disposables.dispose();
        }
        test('getLineIndentGuide one level 2', () => {
            assertIndentGuides([
                [0, 2, 4, 1, 'A'],
                [1, 2, 4, 1, '  A'],
                [1, 2, 4, 1, '  A'],
                [1, 2, 4, 1, '  A'],
            ], 2);
        });
        test('getLineIndentGuide two levels', () => {
            assertIndentGuides([
                [0, 2, 5, 1, 'A'],
                [1, 2, 5, 1, '  A'],
                [1, 4, 5, 2, '  A'],
                [2, 4, 5, 2, '    A'],
                [2, 4, 5, 2, '    A'],
            ], 2);
        });
        test('getLineIndentGuide three levels', () => {
            assertIndentGuides([
                [0, 2, 4, 1, 'A'],
                [1, 3, 4, 2, '  A'],
                [2, 4, 4, 3, '    A'],
                [3, 4, 4, 3, '      A'],
                [0, 5, 5, 0, 'A'],
            ], 2);
        });
        test('getLineIndentGuide decreasing indent', () => {
            assertIndentGuides([
                [2, 1, 1, 2, '    A'],
                [1, 1, 1, 2, '  A'],
                [0, 1, 2, 1, 'A'],
            ], 2);
        });
        test('getLineIndentGuide Java', () => {
            assertIndentGuides([
                /* 1*/ [0, 2, 9, 1, 'class A {'],
                /* 2*/ [1, 3, 4, 2, '  void foo() {'],
                /* 3*/ [2, 3, 4, 2, '    console.log(1);'],
                /* 4*/ [2, 3, 4, 2, '    console.log(2);'],
                /* 5*/ [1, 3, 4, 2, '  }'],
                /* 6*/ [1, 2, 9, 1, ''],
                /* 7*/ [1, 8, 8, 2, '  void bar() {'],
                /* 8*/ [2, 8, 8, 2, '    console.log(3);'],
                /* 9*/ [1, 8, 8, 2, '  }'],
                /*10*/ [0, 2, 9, 1, '}'],
                /*11*/ [0, 12, 12, 1, 'interface B {'],
                /*12*/ [1, 12, 12, 1, '  void bar();'],
                /*13*/ [0, 12, 12, 1, '}'],
            ], 2);
        });
        test('getLineIndentGuide Javadoc', () => {
            assertIndentGuides([
                [0, 2, 3, 1, '/**'],
                [1, 2, 3, 1, ' * Comment'],
                [1, 2, 3, 1, ' */'],
                [0, 5, 6, 1, 'class A {'],
                [1, 5, 6, 1, '  void foo() {'],
                [1, 5, 6, 1, '  }'],
                [0, 5, 6, 1, '}'],
            ], 2);
        });
        test('getLineIndentGuide Whitespace', () => {
            assertIndentGuides([
                [0, 2, 7, 1, 'class A {'],
                [1, 2, 7, 1, ''],
                [1, 4, 5, 2, '  void foo() {'],
                [2, 4, 5, 2, '    '],
                [2, 4, 5, 2, '    return 1;'],
                [1, 4, 5, 2, '  }'],
                [1, 2, 7, 1, '      '],
                [0, 2, 7, 1, '}']
            ], 2);
        });
        test('getLineIndentGuide Tabs', () => {
            assertIndentGuides([
                [0, 2, 7, 1, 'class A {'],
                [1, 2, 7, 1, '\t\t'],
                [1, 4, 5, 2, '\tvoid foo() {'],
                [2, 4, 5, 2, '\t \t//hello'],
                [2, 4, 5, 2, '\t    return 2;'],
                [1, 4, 5, 2, '  \t}'],
                [1, 2, 7, 1, '      '],
                [0, 2, 7, 1, '}']
            ], 4);
        });
        test('getLineIndentGuide checker.ts', () => {
            assertIndentGuides([
                /* 1*/ [0, 1, 1, 0, '/// <reference path="binder.ts"/>'],
                /* 2*/ [0, 2, 2, 0, ''],
                /* 3*/ [0, 3, 3, 0, '/* @internal */'],
                /* 4*/ [0, 5, 16, 1, 'namespace ts {'],
                /* 5*/ [1, 5, 16, 1, '    let nextSymbolId = 1;'],
                /* 6*/ [1, 5, 16, 1, '    let nextNodeId = 1;'],
                /* 7*/ [1, 5, 16, 1, '    let nextMergeId = 1;'],
                /* 8*/ [1, 5, 16, 1, '    let nextFlowId = 1;'],
                /* 9*/ [1, 5, 16, 1, ''],
                /*10*/ [1, 11, 15, 2, '    export function getNodeId(node: Node): number {'],
                /*11*/ [2, 12, 13, 3, '        if (!node.id) {'],
                /*12*/ [3, 12, 13, 3, '            node.id = nextNodeId;'],
                /*13*/ [3, 12, 13, 3, '            nextNodeId++;'],
                /*14*/ [2, 12, 13, 3, '        }'],
                /*15*/ [2, 11, 15, 2, '        return node.id;'],
                /*16*/ [1, 11, 15, 2, '    }'],
                /*17*/ [0, 5, 16, 1, '}']
            ], 4);
        });
        test('issue #8425 - Missing indentation lines for first level indentation', () => {
            assertIndentGuides([
                [1, 2, 3, 2, '\tindent1'],
                [2, 2, 3, 2, '\t\tindent2'],
                [2, 2, 3, 2, '\t\tindent2'],
                [1, 2, 3, 2, '\tindent1']
            ], 4);
        });
        test('issue #8952 - Indentation guide lines going through text on .yml file', () => {
            assertIndentGuides([
                [0, 2, 5, 1, 'properties:'],
                [1, 3, 5, 2, '    emailAddress:'],
                [2, 3, 5, 2, '        - bla'],
                [2, 5, 5, 3, '        - length:'],
                [3, 5, 5, 3, '            max: 255'],
                [0, 6, 6, 0, 'getters:']
            ], 4);
        });
        test('issue #11892 - Indent guides look funny', () => {
            assertIndentGuides([
                [0, 2, 7, 1, 'function test(base) {'],
                [1, 3, 6, 2, '\tswitch (base) {'],
                [2, 4, 4, 3, '\t\tcase 1:'],
                [3, 4, 4, 3, '\t\t\treturn 1;'],
                [2, 6, 6, 3, '\t\tcase 2:'],
                [3, 6, 6, 3, '\t\t\treturn 2;'],
                [1, 2, 7, 1, '\t}'],
                [0, 2, 7, 1, '}']
            ], 4);
        });
        test('issue #12398 - Problem in indent guidelines', () => {
            assertIndentGuides([
                [2, 2, 2, 3, '\t\t.bla'],
                [3, 2, 2, 3, '\t\t\tlabel(for)'],
                [0, 3, 3, 0, 'include script']
            ], 4);
        });
        test('issue #49173', () => {
            const model = (0, testTextModel_1.$O0b)([
                'class A {',
                '	public m1(): void {',
                '	}',
                '	public m2(): void {',
                '	}',
                '	public m3(): void {',
                '	}',
                '	public m4(): void {',
                '	}',
                '	public m5(): void {',
                '	}',
                '}',
            ].join('\n'));
            const actual = model.guides.getActiveIndentGuide(2, 4, 9);
            assert.deepStrictEqual(actual, { startLineNumber: 2, endLineNumber: 9, indent: 1 });
            model.dispose();
        });
        test('tweaks - no active', () => {
            assertIndentGuides([
                [0, 1, 1, 0, 'A'],
                [0, 2, 2, 0, 'A']
            ], 2);
        });
        test('tweaks - inside scope', () => {
            assertIndentGuides([
                [0, 2, 2, 1, 'A'],
                [1, 2, 2, 1, '  A']
            ], 2);
        });
        test('tweaks - scope start', () => {
            assertIndentGuides([
                [0, 2, 2, 1, 'A'],
                [1, 2, 2, 1, '  A'],
                [0, 2, 2, 1, 'A']
            ], 2);
        });
        test('tweaks - empty line', () => {
            assertIndentGuides([
                [0, 2, 4, 1, 'A'],
                [1, 2, 4, 1, '  A'],
                [1, 2, 4, 1, ''],
                [1, 2, 4, 1, '  A'],
                [0, 2, 4, 1, 'A']
            ], 2);
        });
    });
});
//# sourceMappingURL=textModelWithTokens.test.js.map