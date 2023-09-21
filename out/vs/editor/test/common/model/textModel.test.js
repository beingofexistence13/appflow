/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/base/test/common/utils", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/languages/modesRegistry", "vs/editor/common/model/textModel", "vs/editor/test/common/testTextModel"], function (require, exports, assert, lifecycle_1, strings_1, utils_1, position_1, range_1, modesRegistry_1, textModel_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function testGuessIndentation(defaultInsertSpaces, defaultTabSize, expectedInsertSpaces, expectedTabSize, text, msg) {
        const m = (0, testTextModel_1.createTextModel)(text.join('\n'), undefined, {
            tabSize: defaultTabSize,
            insertSpaces: defaultInsertSpaces,
            detectIndentation: true
        });
        const r = m.getOptions();
        m.dispose();
        assert.strictEqual(r.insertSpaces, expectedInsertSpaces, msg);
        assert.strictEqual(r.tabSize, expectedTabSize, msg);
    }
    function assertGuess(expectedInsertSpaces, expectedTabSize, text, msg) {
        if (typeof expectedInsertSpaces === 'undefined') {
            // cannot guess insertSpaces
            if (typeof expectedTabSize === 'undefined') {
                // cannot guess tabSize
                testGuessIndentation(true, 13370, true, 13370, text, msg);
                testGuessIndentation(false, 13371, false, 13371, text, msg);
            }
            else if (typeof expectedTabSize === 'number') {
                // can guess tabSize
                testGuessIndentation(true, 13370, true, expectedTabSize, text, msg);
                testGuessIndentation(false, 13371, false, expectedTabSize, text, msg);
            }
            else {
                // can only guess tabSize when insertSpaces is true
                testGuessIndentation(true, 13370, true, expectedTabSize[0], text, msg);
                testGuessIndentation(false, 13371, false, 13371, text, msg);
            }
        }
        else {
            // can guess insertSpaces
            if (typeof expectedTabSize === 'undefined') {
                // cannot guess tabSize
                testGuessIndentation(true, 13370, expectedInsertSpaces, 13370, text, msg);
                testGuessIndentation(false, 13371, expectedInsertSpaces, 13371, text, msg);
            }
            else if (typeof expectedTabSize === 'number') {
                // can guess tabSize
                testGuessIndentation(true, 13370, expectedInsertSpaces, expectedTabSize, text, msg);
                testGuessIndentation(false, 13371, expectedInsertSpaces, expectedTabSize, text, msg);
            }
            else {
                // can only guess tabSize when insertSpaces is true
                if (expectedInsertSpaces === true) {
                    testGuessIndentation(true, 13370, expectedInsertSpaces, expectedTabSize[0], text, msg);
                    testGuessIndentation(false, 13371, expectedInsertSpaces, expectedTabSize[0], text, msg);
                }
                else {
                    testGuessIndentation(true, 13370, expectedInsertSpaces, 13370, text, msg);
                    testGuessIndentation(false, 13371, expectedInsertSpaces, 13371, text, msg);
                }
            }
        }
    }
    suite('TextModelData.fromString', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        function testTextModelDataFromString(text, expected) {
            const { textBuffer, disposable } = (0, textModel_1.createTextBuffer)(text, textModel_1.TextModel.DEFAULT_CREATION_OPTIONS.defaultEOL);
            const actual = {
                EOL: textBuffer.getEOL(),
                lines: textBuffer.getLinesContent(),
                containsRTL: textBuffer.mightContainRTL(),
                isBasicASCII: !textBuffer.mightContainNonBasicASCII()
            };
            assert.deepStrictEqual(actual, expected);
            disposable.dispose();
        }
        test('one line text', () => {
            testTextModelDataFromString('Hello world!', {
                EOL: '\n',
                lines: [
                    'Hello world!'
                ],
                containsRTL: false,
                isBasicASCII: true
            });
        });
        test('multiline text', () => {
            testTextModelDataFromString('Hello,\r\ndear friend\nHow\rare\r\nyou?', {
                EOL: '\r\n',
                lines: [
                    'Hello,',
                    'dear friend',
                    'How',
                    'are',
                    'you?'
                ],
                containsRTL: false,
                isBasicASCII: true
            });
        });
        test('Non Basic ASCII 1', () => {
            testTextModelDataFromString('Hello,\nZürich', {
                EOL: '\n',
                lines: [
                    'Hello,',
                    'Zürich'
                ],
                containsRTL: false,
                isBasicASCII: false
            });
        });
        test('containsRTL 1', () => {
            testTextModelDataFromString('Hello,\nזוהי עובדה מבוססת שדעתו', {
                EOL: '\n',
                lines: [
                    'Hello,',
                    'זוהי עובדה מבוססת שדעתו'
                ],
                containsRTL: true,
                isBasicASCII: false
            });
        });
        test('containsRTL 2', () => {
            testTextModelDataFromString('Hello,\nهناك حقيقة مثبتة منذ زمن طويل', {
                EOL: '\n',
                lines: [
                    'Hello,',
                    'هناك حقيقة مثبتة منذ زمن طويل'
                ],
                containsRTL: true,
                isBasicASCII: false
            });
        });
    });
    suite('Editor Model - TextModel', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('TextModel does not use events internally', () => {
            // Make sure that all model parts receive text model events explicitly
            // to avoid that by any chance an outside listener receives events before
            // the parts and thus are able to access the text model in an inconsistent state.
            //
            // We simply check that there are no listeners attached to text model
            // after instantiation
            const disposables = new lifecycle_1.DisposableStore();
            const instantiationService = (0, testTextModel_1.createModelServices)(disposables);
            const textModel = disposables.add(instantiationService.createInstance(textModel_1.TextModel, '', modesRegistry_1.PLAINTEXT_LANGUAGE_ID, textModel_1.TextModel.DEFAULT_CREATION_OPTIONS, null));
            assert.strictEqual(textModel._hasListeners(), false);
            disposables.dispose();
        });
        test('getValueLengthInRange', () => {
            let m = (0, testTextModel_1.createTextModel)('My First Line\r\nMy Second Line\r\nMy Third Line');
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 1, 1, 1)), ''.length);
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 1, 1, 2)), 'M'.length);
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 2, 1, 3)), 'y'.length);
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 1, 1, 14)), 'My First Line'.length);
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 1, 2, 1)), 'My First Line\r\n'.length);
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 2, 2, 1)), 'y First Line\r\n'.length);
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 2, 2, 2)), 'y First Line\r\nM'.length);
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 2, 2, 1000)), 'y First Line\r\nMy Second Line'.length);
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 2, 3, 1)), 'y First Line\r\nMy Second Line\r\n'.length);
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 2, 3, 1000)), 'y First Line\r\nMy Second Line\r\nMy Third Line'.length);
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 1, 1000, 1000)), 'My First Line\r\nMy Second Line\r\nMy Third Line'.length);
            m.dispose();
            m = (0, testTextModel_1.createTextModel)('My First Line\nMy Second Line\nMy Third Line');
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 1, 1, 1)), ''.length);
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 1, 1, 2)), 'M'.length);
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 2, 1, 3)), 'y'.length);
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 1, 1, 14)), 'My First Line'.length);
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 1, 2, 1)), 'My First Line\n'.length);
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 2, 2, 1)), 'y First Line\n'.length);
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 2, 2, 2)), 'y First Line\nM'.length);
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 2, 2, 1000)), 'y First Line\nMy Second Line'.length);
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 2, 3, 1)), 'y First Line\nMy Second Line\n'.length);
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 2, 3, 1000)), 'y First Line\nMy Second Line\nMy Third Line'.length);
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 1, 1000, 1000)), 'My First Line\nMy Second Line\nMy Third Line'.length);
            m.dispose();
        });
        test('getValueLengthInRange different EOL', () => {
            let m = (0, testTextModel_1.createTextModel)('My First Line\r\nMy Second Line\r\nMy Third Line');
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 1, 2, 1), 0 /* EndOfLinePreference.TextDefined */), 'My First Line\r\n'.length);
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 1, 2, 1), 2 /* EndOfLinePreference.CRLF */), 'My First Line\r\n'.length);
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 1, 2, 1), 1 /* EndOfLinePreference.LF */), 'My First Line\n'.length);
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 1, 1000, 1000), 0 /* EndOfLinePreference.TextDefined */), 'My First Line\r\nMy Second Line\r\nMy Third Line'.length);
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 1, 1000, 1000), 2 /* EndOfLinePreference.CRLF */), 'My First Line\r\nMy Second Line\r\nMy Third Line'.length);
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 1, 1000, 1000), 1 /* EndOfLinePreference.LF */), 'My First Line\nMy Second Line\nMy Third Line'.length);
            m.dispose();
            m = (0, testTextModel_1.createTextModel)('My First Line\nMy Second Line\nMy Third Line');
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 1, 2, 1), 0 /* EndOfLinePreference.TextDefined */), 'My First Line\n'.length);
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 1, 2, 1), 1 /* EndOfLinePreference.LF */), 'My First Line\n'.length);
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 1, 2, 1), 2 /* EndOfLinePreference.CRLF */), 'My First Line\r\n'.length);
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 1, 1000, 1000), 0 /* EndOfLinePreference.TextDefined */), 'My First Line\nMy Second Line\nMy Third Line'.length);
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 1, 1000, 1000), 1 /* EndOfLinePreference.LF */), 'My First Line\nMy Second Line\nMy Third Line'.length);
            assert.strictEqual(m.getValueLengthInRange(new range_1.Range(1, 1, 1000, 1000), 2 /* EndOfLinePreference.CRLF */), 'My First Line\r\nMy Second Line\r\nMy Third Line'.length);
            m.dispose();
        });
        test('guess indentation 1', () => {
            assertGuess(undefined, undefined, [
                'x',
                'x',
                'x',
                'x',
                'x',
                'x',
                'x'
            ], 'no clues');
            assertGuess(false, undefined, [
                '\tx',
                'x',
                'x',
                'x',
                'x',
                'x',
                'x'
            ], 'no spaces, 1xTAB');
            assertGuess(true, 2, [
                '  x',
                'x',
                'x',
                'x',
                'x',
                'x',
                'x'
            ], '1x2');
            assertGuess(false, undefined, [
                '\tx',
                '\tx',
                '\tx',
                '\tx',
                '\tx',
                '\tx',
                '\tx'
            ], '7xTAB');
            assertGuess(undefined, [2], [
                '\tx',
                '  x',
                '\tx',
                '  x',
                '\tx',
                '  x',
                '\tx',
                '  x',
            ], '4x2, 4xTAB');
            assertGuess(false, undefined, [
                '\tx',
                ' x',
                '\tx',
                ' x',
                '\tx',
                ' x',
                '\tx',
                ' x'
            ], '4x1, 4xTAB');
            assertGuess(false, undefined, [
                '\tx',
                '\tx',
                '  x',
                '\tx',
                '  x',
                '\tx',
                '  x',
                '\tx',
                '  x',
            ], '4x2, 5xTAB');
            assertGuess(false, undefined, [
                '\tx',
                '\tx',
                'x',
                '\tx',
                'x',
                '\tx',
                'x',
                '\tx',
                '  x',
            ], '1x2, 5xTAB');
            assertGuess(false, undefined, [
                '\tx',
                '\tx',
                'x',
                '\tx',
                'x',
                '\tx',
                'x',
                '\tx',
                '    x',
            ], '1x4, 5xTAB');
            assertGuess(false, undefined, [
                '\tx',
                '\tx',
                'x',
                '\tx',
                'x',
                '\tx',
                '  x',
                '\tx',
                '    x',
            ], '1x2, 1x4, 5xTAB');
            assertGuess(undefined, undefined, [
                'x',
                ' x',
                ' x',
                ' x',
                ' x',
                ' x',
                ' x',
                ' x'
            ], '7x1 - 1 space is never guessed as an indentation');
            assertGuess(true, undefined, [
                'x',
                '          x',
                ' x',
                ' x',
                ' x',
                ' x',
                ' x',
                ' x'
            ], '1x10, 6x1');
            assertGuess(undefined, undefined, [
                '',
                '  ',
                '    ',
                '      ',
                '        ',
                '          ',
                '            ',
                '              ',
            ], 'whitespace lines don\'t count');
            assertGuess(true, 3, [
                'x',
                '   x',
                '   x',
                '    x',
                'x',
                '   x',
                '   x',
                '    x',
                'x',
                '   x',
                '   x',
                '    x',
            ], '6x3, 3x4');
            assertGuess(true, 5, [
                'x',
                '     x',
                '     x',
                '    x',
                'x',
                '     x',
                '     x',
                '    x',
                'x',
                '     x',
                '     x',
                '    x',
            ], '6x5, 3x4');
            assertGuess(true, 7, [
                'x',
                '       x',
                '       x',
                '     x',
                'x',
                '       x',
                '       x',
                '    x',
                'x',
                '       x',
                '       x',
                '    x',
            ], '6x7, 1x5, 2x4');
            assertGuess(true, 2, [
                'x',
                '  x',
                '  x',
                '  x',
                '  x',
                'x',
                '  x',
                '  x',
                '  x',
                '  x',
            ], '8x2');
            assertGuess(true, 2, [
                'x',
                '  x',
                '  x',
                'x',
                '  x',
                '  x',
                'x',
                '  x',
                '  x',
                'x',
                '  x',
                '  x',
            ], '8x2');
            assertGuess(true, 2, [
                'x',
                '  x',
                '    x',
                'x',
                '  x',
                '    x',
                'x',
                '  x',
                '    x',
                'x',
                '  x',
                '    x',
            ], '4x2, 4x4');
            assertGuess(true, 2, [
                'x',
                '  x',
                '  x',
                '    x',
                'x',
                '  x',
                '  x',
                '    x',
                'x',
                '  x',
                '  x',
                '    x',
            ], '6x2, 3x4');
            assertGuess(true, 2, [
                'x',
                '  x',
                '  x',
                '    x',
                '    x',
                'x',
                '  x',
                '  x',
                '    x',
                '    x',
            ], '4x2, 4x4');
            assertGuess(true, 2, [
                'x',
                '  x',
                '    x',
                '    x',
                'x',
                '  x',
                '    x',
                '    x',
            ], '2x2, 4x4');
            assertGuess(true, 4, [
                'x',
                '    x',
                '    x',
                'x',
                '    x',
                '    x',
                'x',
                '    x',
                '    x',
                'x',
                '    x',
                '    x',
            ], '8x4');
            assertGuess(true, 2, [
                'x',
                '  x',
                '    x',
                '    x',
                '      x',
                'x',
                '  x',
                '    x',
                '    x',
                '      x',
            ], '2x2, 4x4, 2x6');
            assertGuess(true, 2, [
                'x',
                '  x',
                '    x',
                '    x',
                '      x',
                '      x',
                '        x',
            ], '1x2, 2x4, 2x6, 1x8');
            assertGuess(true, 4, [
                'x',
                '    x',
                '    x',
                '    x',
                '     x',
                '        x',
                'x',
                '    x',
                '    x',
                '    x',
                '     x',
                '        x',
            ], '6x4, 2x5, 2x8');
            assertGuess(true, 4, [
                'x',
                '    x',
                '    x',
                '    x',
                '     x',
                '        x',
                '        x',
            ], '3x4, 1x5, 2x8');
            assertGuess(true, 4, [
                'x',
                'x',
                '    x',
                '    x',
                '     x',
                '        x',
                '        x',
                'x',
                'x',
                '    x',
                '    x',
                '     x',
                '        x',
                '        x',
            ], '6x4, 2x5, 4x8');
            assertGuess(true, 3, [
                'x',
                ' x',
                ' x',
                ' x',
                ' x',
                ' x',
                'x',
                '   x',
                '    x',
                '    x',
            ], '5x1, 2x0, 1x3, 2x4');
            assertGuess(false, undefined, [
                '\t x',
                ' \t x',
                '\tx'
            ], 'mixed whitespace 1');
            assertGuess(false, undefined, [
                '\tx',
                '\t    x'
            ], 'mixed whitespace 2');
        });
        test('issue #44991: Wrong indentation size auto-detection', () => {
            assertGuess(true, 4, [
                'a = 10             # 0 space indent',
                'b = 5              # 0 space indent',
                'if a > 10:         # 0 space indent',
                '    a += 1         # 4 space indent      delta 4 spaces',
                '    if b > 5:      # 4 space indent',
                '        b += 1     # 8 space indent      delta 4 spaces',
                '        b += 1     # 8 space indent',
                '        b += 1     # 8 space indent',
                '# comment line 1   # 0 space indent      delta 8 spaces',
                '# comment line 2   # 0 space indent',
                '# comment line 3   # 0 space indent',
                '        b += 1     # 8 space indent      delta 8 spaces',
                '        b += 1     # 8 space indent',
                '        b += 1     # 8 space indent',
            ]);
        });
        test('issue #55818: Broken indentation detection', () => {
            assertGuess(true, 2, [
                '',
                '/* REQUIRE */',
                '',
                'const foo = require ( \'foo\' ),',
                '      bar = require ( \'bar\' );',
                '',
                '/* MY FN */',
                '',
                'function myFn () {',
                '',
                '  const asd = 1,',
                '        dsa = 2;',
                '',
                '  return bar ( foo ( asd ) );',
                '',
                '}',
                '',
                '/* EXPORT */',
                '',
                'module.exports = myFn;',
                '',
            ]);
        });
        test('issue #70832: Broken indentation detection', () => {
            assertGuess(false, undefined, [
                'x',
                'x',
                'x',
                'x',
                '	x',
                '		x',
                '    x',
                '		x',
                '	x',
                '		x',
                '	x',
                '	x',
                '	x',
                '	x',
                'x',
            ]);
        });
        test('issue #62143: Broken indentation detection', () => {
            // works before the fix
            assertGuess(true, 2, [
                'x',
                'x',
                '  x',
                '  x'
            ]);
            // works before the fix
            assertGuess(true, 2, [
                'x',
                '  - item2',
                '  - item3'
            ]);
            // works before the fix
            testGuessIndentation(true, 2, true, 2, [
                'x x',
                '  x',
                '  x',
            ]);
            // fails before the fix
            // empty space inline breaks the indentation guess
            testGuessIndentation(true, 2, true, 2, [
                'x x',
                '  x',
                '  x',
                '    x'
            ]);
            testGuessIndentation(true, 2, true, 2, [
                '<!--test1.md -->',
                '- item1',
                '  - item2',
                '    - item3'
            ]);
        });
        test('issue #84217: Broken indentation detection', () => {
            assertGuess(true, 4, [
                'def main():',
                '    print(\'hello\')',
            ]);
            assertGuess(true, 4, [
                'def main():',
                '    with open(\'foo\') as fp:',
                '        print(fp.read())',
            ]);
        });
        test('validatePosition', () => {
            const m = (0, testTextModel_1.createTextModel)('line one\nline two');
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(0, 0)), new position_1.Position(1, 1));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(0, 1)), new position_1.Position(1, 1));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(1, 1)), new position_1.Position(1, 1));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(1, 2)), new position_1.Position(1, 2));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(1, 30)), new position_1.Position(1, 9));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(2, 0)), new position_1.Position(2, 1));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(2, 1)), new position_1.Position(2, 1));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(2, 2)), new position_1.Position(2, 2));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(2, 30)), new position_1.Position(2, 9));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(3, 0)), new position_1.Position(2, 9));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(3, 1)), new position_1.Position(2, 9));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(3, 30)), new position_1.Position(2, 9));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(30, 30)), new position_1.Position(2, 9));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(-123.123, -0.5)), new position_1.Position(1, 1));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(Number.MIN_VALUE, Number.MIN_VALUE)), new position_1.Position(1, 1));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(Number.MAX_VALUE, Number.MAX_VALUE)), new position_1.Position(2, 9));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(123.23, 47.5)), new position_1.Position(2, 9));
            m.dispose();
        });
        test('validatePosition around high-low surrogate pairs 1', () => {
            const m = (0, testTextModel_1.createTextModel)('a📚b');
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(0, 0)), new position_1.Position(1, 1));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(0, 1)), new position_1.Position(1, 1));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(0, 7)), new position_1.Position(1, 1));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(1, 1)), new position_1.Position(1, 1));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(1, 2)), new position_1.Position(1, 2));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(1, 3)), new position_1.Position(1, 2));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(1, 4)), new position_1.Position(1, 4));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(1, 5)), new position_1.Position(1, 5));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(1, 30)), new position_1.Position(1, 5));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(2, 0)), new position_1.Position(1, 5));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(2, 1)), new position_1.Position(1, 5));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(2, 2)), new position_1.Position(1, 5));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(2, 30)), new position_1.Position(1, 5));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(-123.123, -0.5)), new position_1.Position(1, 1));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(Number.MIN_VALUE, Number.MIN_VALUE)), new position_1.Position(1, 1));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(Number.MAX_VALUE, Number.MAX_VALUE)), new position_1.Position(1, 5));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(123.23, 47.5)), new position_1.Position(1, 5));
            m.dispose();
        });
        test('validatePosition around high-low surrogate pairs 2', () => {
            const m = (0, testTextModel_1.createTextModel)('a📚📚b');
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(1, 1)), new position_1.Position(1, 1));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(1, 2)), new position_1.Position(1, 2));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(1, 3)), new position_1.Position(1, 2));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(1, 4)), new position_1.Position(1, 4));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(1, 5)), new position_1.Position(1, 4));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(1, 6)), new position_1.Position(1, 6));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(1, 7)), new position_1.Position(1, 7));
            m.dispose();
        });
        test('validatePosition handle NaN.', () => {
            const m = (0, testTextModel_1.createTextModel)('line one\nline two');
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(NaN, 1)), new position_1.Position(1, 1));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(1, NaN)), new position_1.Position(1, 1));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(NaN, NaN)), new position_1.Position(1, 1));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(2, NaN)), new position_1.Position(2, 1));
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(NaN, 3)), new position_1.Position(1, 3));
            m.dispose();
        });
        test('issue #71480: validatePosition handle floats', () => {
            const m = (0, testTextModel_1.createTextModel)('line one\nline two');
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(0.2, 1)), new position_1.Position(1, 1), 'a');
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(1.2, 1)), new position_1.Position(1, 1), 'b');
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(1.5, 2)), new position_1.Position(1, 2), 'c');
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(1.8, 3)), new position_1.Position(1, 3), 'd');
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(1, 0.3)), new position_1.Position(1, 1), 'e');
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(2, 0.8)), new position_1.Position(2, 1), 'f');
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(1, 1.2)), new position_1.Position(1, 1), 'g');
            assert.deepStrictEqual(m.validatePosition(new position_1.Position(2, 1.5)), new position_1.Position(2, 1), 'h');
            m.dispose();
        });
        test('issue #71480: validateRange handle floats', () => {
            const m = (0, testTextModel_1.createTextModel)('line one\nline two');
            assert.deepStrictEqual(m.validateRange(new range_1.Range(0.2, 1.5, 0.8, 2.5)), new range_1.Range(1, 1, 1, 1));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1.2, 1.7, 1.8, 2.2)), new range_1.Range(1, 1, 1, 2));
            m.dispose();
        });
        test('validateRange around high-low surrogate pairs 1', () => {
            const m = (0, testTextModel_1.createTextModel)('a📚b');
            assert.deepStrictEqual(m.validateRange(new range_1.Range(0, 0, 0, 1)), new range_1.Range(1, 1, 1, 1));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(0, 0, 0, 7)), new range_1.Range(1, 1, 1, 1));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 1, 1, 1)), new range_1.Range(1, 1, 1, 1));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 1, 1, 2)), new range_1.Range(1, 1, 1, 2));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 1, 1, 3)), new range_1.Range(1, 1, 1, 4));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 1, 1, 4)), new range_1.Range(1, 1, 1, 4));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 1, 1, 5)), new range_1.Range(1, 1, 1, 5));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 2, 1, 2)), new range_1.Range(1, 2, 1, 2));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 2, 1, 3)), new range_1.Range(1, 2, 1, 4));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 2, 1, 4)), new range_1.Range(1, 2, 1, 4));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 2, 1, 5)), new range_1.Range(1, 2, 1, 5));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 3, 1, 3)), new range_1.Range(1, 2, 1, 2));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 3, 1, 4)), new range_1.Range(1, 2, 1, 4));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 3, 1, 5)), new range_1.Range(1, 2, 1, 5));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 4, 1, 4)), new range_1.Range(1, 4, 1, 4));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 4, 1, 5)), new range_1.Range(1, 4, 1, 5));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 5, 1, 5)), new range_1.Range(1, 5, 1, 5));
            m.dispose();
        });
        test('validateRange around high-low surrogate pairs 2', () => {
            const m = (0, testTextModel_1.createTextModel)('a📚📚b');
            assert.deepStrictEqual(m.validateRange(new range_1.Range(0, 0, 0, 1)), new range_1.Range(1, 1, 1, 1));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(0, 0, 0, 7)), new range_1.Range(1, 1, 1, 1));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 1, 1, 1)), new range_1.Range(1, 1, 1, 1));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 1, 1, 2)), new range_1.Range(1, 1, 1, 2));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 1, 1, 3)), new range_1.Range(1, 1, 1, 4));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 1, 1, 4)), new range_1.Range(1, 1, 1, 4));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 1, 1, 5)), new range_1.Range(1, 1, 1, 6));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 1, 1, 6)), new range_1.Range(1, 1, 1, 6));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 1, 1, 7)), new range_1.Range(1, 1, 1, 7));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 2, 1, 2)), new range_1.Range(1, 2, 1, 2));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 2, 1, 3)), new range_1.Range(1, 2, 1, 4));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 2, 1, 4)), new range_1.Range(1, 2, 1, 4));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 2, 1, 5)), new range_1.Range(1, 2, 1, 6));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 2, 1, 6)), new range_1.Range(1, 2, 1, 6));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 2, 1, 7)), new range_1.Range(1, 2, 1, 7));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 3, 1, 3)), new range_1.Range(1, 2, 1, 2));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 3, 1, 4)), new range_1.Range(1, 2, 1, 4));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 3, 1, 5)), new range_1.Range(1, 2, 1, 6));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 3, 1, 6)), new range_1.Range(1, 2, 1, 6));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 3, 1, 7)), new range_1.Range(1, 2, 1, 7));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 4, 1, 4)), new range_1.Range(1, 4, 1, 4));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 4, 1, 5)), new range_1.Range(1, 4, 1, 6));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 4, 1, 6)), new range_1.Range(1, 4, 1, 6));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 4, 1, 7)), new range_1.Range(1, 4, 1, 7));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 5, 1, 5)), new range_1.Range(1, 4, 1, 4));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 5, 1, 6)), new range_1.Range(1, 4, 1, 6));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 5, 1, 7)), new range_1.Range(1, 4, 1, 7));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 6, 1, 6)), new range_1.Range(1, 6, 1, 6));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 6, 1, 7)), new range_1.Range(1, 6, 1, 7));
            assert.deepStrictEqual(m.validateRange(new range_1.Range(1, 7, 1, 7)), new range_1.Range(1, 7, 1, 7));
            m.dispose();
        });
        test('modifyPosition', () => {
            const m = (0, testTextModel_1.createTextModel)('line one\nline two');
            assert.deepStrictEqual(m.modifyPosition(new position_1.Position(1, 1), 0), new position_1.Position(1, 1));
            assert.deepStrictEqual(m.modifyPosition(new position_1.Position(0, 0), 0), new position_1.Position(1, 1));
            assert.deepStrictEqual(m.modifyPosition(new position_1.Position(30, 1), 0), new position_1.Position(2, 9));
            assert.deepStrictEqual(m.modifyPosition(new position_1.Position(1, 1), 17), new position_1.Position(2, 9));
            assert.deepStrictEqual(m.modifyPosition(new position_1.Position(1, 1), 1), new position_1.Position(1, 2));
            assert.deepStrictEqual(m.modifyPosition(new position_1.Position(1, 1), 3), new position_1.Position(1, 4));
            assert.deepStrictEqual(m.modifyPosition(new position_1.Position(1, 2), 10), new position_1.Position(2, 3));
            assert.deepStrictEqual(m.modifyPosition(new position_1.Position(1, 5), 13), new position_1.Position(2, 9));
            assert.deepStrictEqual(m.modifyPosition(new position_1.Position(1, 2), 16), new position_1.Position(2, 9));
            assert.deepStrictEqual(m.modifyPosition(new position_1.Position(2, 9), -17), new position_1.Position(1, 1));
            assert.deepStrictEqual(m.modifyPosition(new position_1.Position(1, 2), -1), new position_1.Position(1, 1));
            assert.deepStrictEqual(m.modifyPosition(new position_1.Position(1, 4), -3), new position_1.Position(1, 1));
            assert.deepStrictEqual(m.modifyPosition(new position_1.Position(2, 3), -10), new position_1.Position(1, 2));
            assert.deepStrictEqual(m.modifyPosition(new position_1.Position(2, 9), -13), new position_1.Position(1, 5));
            assert.deepStrictEqual(m.modifyPosition(new position_1.Position(2, 9), -16), new position_1.Position(1, 2));
            assert.deepStrictEqual(m.modifyPosition(new position_1.Position(1, 2), 17), new position_1.Position(2, 9));
            assert.deepStrictEqual(m.modifyPosition(new position_1.Position(1, 2), 100), new position_1.Position(2, 9));
            assert.deepStrictEqual(m.modifyPosition(new position_1.Position(1, 2), -2), new position_1.Position(1, 1));
            assert.deepStrictEqual(m.modifyPosition(new position_1.Position(1, 2), -100), new position_1.Position(1, 1));
            assert.deepStrictEqual(m.modifyPosition(new position_1.Position(2, 2), -100), new position_1.Position(1, 1));
            assert.deepStrictEqual(m.modifyPosition(new position_1.Position(2, 9), -18), new position_1.Position(1, 1));
            m.dispose();
        });
        test('normalizeIndentation 1', () => {
            const model = (0, testTextModel_1.createTextModel)('', undefined, {
                insertSpaces: false
            });
            assert.strictEqual(model.normalizeIndentation('\t'), '\t');
            assert.strictEqual(model.normalizeIndentation('    '), '\t');
            assert.strictEqual(model.normalizeIndentation('   '), '   ');
            assert.strictEqual(model.normalizeIndentation('  '), '  ');
            assert.strictEqual(model.normalizeIndentation(' '), ' ');
            assert.strictEqual(model.normalizeIndentation(''), '');
            assert.strictEqual(model.normalizeIndentation(' \t    '), '\t\t');
            assert.strictEqual(model.normalizeIndentation(' \t   '), '\t   ');
            assert.strictEqual(model.normalizeIndentation(' \t  '), '\t  ');
            assert.strictEqual(model.normalizeIndentation(' \t '), '\t ');
            assert.strictEqual(model.normalizeIndentation(' \t'), '\t');
            assert.strictEqual(model.normalizeIndentation('\ta'), '\ta');
            assert.strictEqual(model.normalizeIndentation('    a'), '\ta');
            assert.strictEqual(model.normalizeIndentation('   a'), '   a');
            assert.strictEqual(model.normalizeIndentation('  a'), '  a');
            assert.strictEqual(model.normalizeIndentation(' a'), ' a');
            assert.strictEqual(model.normalizeIndentation('a'), 'a');
            assert.strictEqual(model.normalizeIndentation(' \t    a'), '\t\ta');
            assert.strictEqual(model.normalizeIndentation(' \t   a'), '\t   a');
            assert.strictEqual(model.normalizeIndentation(' \t  a'), '\t  a');
            assert.strictEqual(model.normalizeIndentation(' \t a'), '\t a');
            assert.strictEqual(model.normalizeIndentation(' \ta'), '\ta');
            model.dispose();
        });
        test('normalizeIndentation 2', () => {
            const model = (0, testTextModel_1.createTextModel)('');
            assert.strictEqual(model.normalizeIndentation('\ta'), '    a');
            assert.strictEqual(model.normalizeIndentation('    a'), '    a');
            assert.strictEqual(model.normalizeIndentation('   a'), '   a');
            assert.strictEqual(model.normalizeIndentation('  a'), '  a');
            assert.strictEqual(model.normalizeIndentation(' a'), ' a');
            assert.strictEqual(model.normalizeIndentation('a'), 'a');
            assert.strictEqual(model.normalizeIndentation(' \t    a'), '        a');
            assert.strictEqual(model.normalizeIndentation(' \t   a'), '       a');
            assert.strictEqual(model.normalizeIndentation(' \t  a'), '      a');
            assert.strictEqual(model.normalizeIndentation(' \t a'), '     a');
            assert.strictEqual(model.normalizeIndentation(' \ta'), '    a');
            model.dispose();
        });
        test('getLineFirstNonWhitespaceColumn', () => {
            const model = (0, testTextModel_1.createTextModel)([
                'asd',
                ' asd',
                '\tasd',
                '  asd',
                '\t\tasd',
                ' ',
                '  ',
                '\t',
                '\t\t',
                '  \tasd',
                '',
                ''
            ].join('\n'));
            assert.strictEqual(model.getLineFirstNonWhitespaceColumn(1), 1, '1');
            assert.strictEqual(model.getLineFirstNonWhitespaceColumn(2), 2, '2');
            assert.strictEqual(model.getLineFirstNonWhitespaceColumn(3), 2, '3');
            assert.strictEqual(model.getLineFirstNonWhitespaceColumn(4), 3, '4');
            assert.strictEqual(model.getLineFirstNonWhitespaceColumn(5), 3, '5');
            assert.strictEqual(model.getLineFirstNonWhitespaceColumn(6), 0, '6');
            assert.strictEqual(model.getLineFirstNonWhitespaceColumn(7), 0, '7');
            assert.strictEqual(model.getLineFirstNonWhitespaceColumn(8), 0, '8');
            assert.strictEqual(model.getLineFirstNonWhitespaceColumn(9), 0, '9');
            assert.strictEqual(model.getLineFirstNonWhitespaceColumn(10), 4, '10');
            assert.strictEqual(model.getLineFirstNonWhitespaceColumn(11), 0, '11');
            assert.strictEqual(model.getLineFirstNonWhitespaceColumn(12), 0, '12');
            model.dispose();
        });
        test('getLineLastNonWhitespaceColumn', () => {
            const model = (0, testTextModel_1.createTextModel)([
                'asd',
                'asd ',
                'asd\t',
                'asd  ',
                'asd\t\t',
                ' ',
                '  ',
                '\t',
                '\t\t',
                'asd  \t',
                '',
                ''
            ].join('\n'));
            assert.strictEqual(model.getLineLastNonWhitespaceColumn(1), 4, '1');
            assert.strictEqual(model.getLineLastNonWhitespaceColumn(2), 4, '2');
            assert.strictEqual(model.getLineLastNonWhitespaceColumn(3), 4, '3');
            assert.strictEqual(model.getLineLastNonWhitespaceColumn(4), 4, '4');
            assert.strictEqual(model.getLineLastNonWhitespaceColumn(5), 4, '5');
            assert.strictEqual(model.getLineLastNonWhitespaceColumn(6), 0, '6');
            assert.strictEqual(model.getLineLastNonWhitespaceColumn(7), 0, '7');
            assert.strictEqual(model.getLineLastNonWhitespaceColumn(8), 0, '8');
            assert.strictEqual(model.getLineLastNonWhitespaceColumn(9), 0, '9');
            assert.strictEqual(model.getLineLastNonWhitespaceColumn(10), 4, '10');
            assert.strictEqual(model.getLineLastNonWhitespaceColumn(11), 0, '11');
            assert.strictEqual(model.getLineLastNonWhitespaceColumn(12), 0, '12');
            model.dispose();
        });
        test('#50471. getValueInRange with invalid range', () => {
            const m = (0, testTextModel_1.createTextModel)('My First Line\r\nMy Second Line\r\nMy Third Line');
            assert.strictEqual(m.getValueInRange(new range_1.Range(1, NaN, 1, 3)), 'My');
            assert.strictEqual(m.getValueInRange(new range_1.Range(NaN, NaN, NaN, NaN)), '');
            m.dispose();
        });
        test('issue #168836: updating tabSize should also update indentSize when indentSize is set to "tabSize"', () => {
            const m = (0, testTextModel_1.createTextModel)('some text', null, {
                tabSize: 2,
                indentSize: 'tabSize'
            });
            assert.strictEqual(m.getOptions().tabSize, 2);
            assert.strictEqual(m.getOptions().indentSize, 2);
            assert.strictEqual(m.getOptions().originalIndentSize, 'tabSize');
            m.updateOptions({
                tabSize: 4
            });
            assert.strictEqual(m.getOptions().tabSize, 4);
            assert.strictEqual(m.getOptions().indentSize, 4);
            assert.strictEqual(m.getOptions().originalIndentSize, 'tabSize');
            m.dispose();
        });
    });
    suite('TextModel.mightContainRTL', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('nope', () => {
            const model = (0, testTextModel_1.createTextModel)('hello world!');
            assert.strictEqual(model.mightContainRTL(), false);
            model.dispose();
        });
        test('yes', () => {
            const model = (0, testTextModel_1.createTextModel)('Hello,\nזוהי עובדה מבוססת שדעתו');
            assert.strictEqual(model.mightContainRTL(), true);
            model.dispose();
        });
        test('setValue resets 1', () => {
            const model = (0, testTextModel_1.createTextModel)('hello world!');
            assert.strictEqual(model.mightContainRTL(), false);
            model.setValue('Hello,\nזוהי עובדה מבוססת שדעתו');
            assert.strictEqual(model.mightContainRTL(), true);
            model.dispose();
        });
        test('setValue resets 2', () => {
            const model = (0, testTextModel_1.createTextModel)('Hello,\nهناك حقيقة مثبتة منذ زمن طويل');
            assert.strictEqual(model.mightContainRTL(), true);
            model.setValue('hello world!');
            assert.strictEqual(model.mightContainRTL(), false);
            model.dispose();
        });
    });
    suite('TextModel.createSnapshot', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('empty file', () => {
            const model = (0, testTextModel_1.createTextModel)('');
            const snapshot = model.createSnapshot();
            assert.strictEqual(snapshot.read(), null);
            model.dispose();
        });
        test('file with BOM', () => {
            const model = (0, testTextModel_1.createTextModel)(strings_1.UTF8_BOM_CHARACTER + 'Hello');
            assert.strictEqual(model.getLineContent(1), 'Hello');
            const snapshot = model.createSnapshot(true);
            assert.strictEqual(snapshot.read(), strings_1.UTF8_BOM_CHARACTER + 'Hello');
            assert.strictEqual(snapshot.read(), null);
            model.dispose();
        });
        test('regular file', () => {
            const model = (0, testTextModel_1.createTextModel)('My First Line\n\t\tMy Second Line\n    Third Line\n\n1');
            const snapshot = model.createSnapshot();
            assert.strictEqual(snapshot.read(), 'My First Line\n\t\tMy Second Line\n    Third Line\n\n1');
            assert.strictEqual(snapshot.read(), null);
            model.dispose();
        });
        test('large file', () => {
            const lines = [];
            for (let i = 0; i < 1000; i++) {
                lines[i] = 'Just some text that is a bit long such that it can consume some memory';
            }
            const text = lines.join('\n');
            const model = (0, testTextModel_1.createTextModel)(text);
            const snapshot = model.createSnapshot();
            let actual = '';
            // 70999 length => at most 2 read calls are necessary
            const tmp1 = snapshot.read();
            assert.ok(tmp1);
            actual += tmp1;
            const tmp2 = snapshot.read();
            if (tmp2 === null) {
                // all good
            }
            else {
                actual += tmp2;
                assert.strictEqual(snapshot.read(), null);
            }
            assert.strictEqual(actual, text);
            model.dispose();
        });
        test('issue #119632: invalid range', () => {
            const model = (0, testTextModel_1.createTextModel)('hello world!');
            const actual = model._validateRangeRelaxedNoAllocations(new range_1.Range(undefined, 0, undefined, 1));
            assert.deepStrictEqual(actual, new range_1.Range(1, 1, 1, 1));
            model.dispose();
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dE1vZGVsLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvdGVzdC9jb21tb24vbW9kZWwvdGV4dE1vZGVsLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFjaEcsU0FBUyxvQkFBb0IsQ0FBQyxtQkFBNEIsRUFBRSxjQUFzQixFQUFFLG9CQUE2QixFQUFFLGVBQXVCLEVBQUUsSUFBYyxFQUFFLEdBQVk7UUFDdkssTUFBTSxDQUFDLEdBQUcsSUFBQSwrQkFBZSxFQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUNmLFNBQVMsRUFDVDtZQUNDLE9BQU8sRUFBRSxjQUFjO1lBQ3ZCLFlBQVksRUFBRSxtQkFBbUI7WUFDakMsaUJBQWlCLEVBQUUsSUFBSTtTQUN2QixDQUNELENBQUM7UUFDRixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDekIsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRVosTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUFFLG9CQUFvQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzlELE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxlQUFlLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVELFNBQVMsV0FBVyxDQUFDLG9CQUF5QyxFQUFFLGVBQThDLEVBQUUsSUFBYyxFQUFFLEdBQVk7UUFDM0ksSUFBSSxPQUFPLG9CQUFvQixLQUFLLFdBQVcsRUFBRTtZQUNoRCw0QkFBNEI7WUFDNUIsSUFBSSxPQUFPLGVBQWUsS0FBSyxXQUFXLEVBQUU7Z0JBQzNDLHVCQUF1QjtnQkFDdkIsb0JBQW9CLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLENB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Q0FBQyxDQUFDLENBQUM7WUFDbkYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuRixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLG1CQUFRLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXBGLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLG1CQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuRixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLG1CQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25GLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLG1CQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFcEYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENB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RUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25GLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLG1CQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuRixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLG1CQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25GLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLG1CQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVwRixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLG1CQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25GLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFD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LGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RGLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RGLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFdEYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RGLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV0RixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RGLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV0RixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RGLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFdEYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV0RixDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDYixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxpREFBaUQsRUFBRSxHQUFHLEVBQUU7WUFFNUQsTUFBTSxDQUFDLEdBQUcsSUFBQSwrQkFBZSxFQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXBDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV0RixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RGLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RGLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXRGLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RGLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXRGLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RGLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV0RixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RGLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXRGLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXRGLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV0RixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXRGLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNiLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsRUFBRTtZQUUzQixNQUFNLENBQUMsR0FBRyxJQUFBLCtCQUFlLEVBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUNoRCxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLG1CQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BGLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxJQUFJLG1CQUFRLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVyRixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLG1CQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BGLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxJQUFJLG1CQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwRixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLG1CQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JGLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxJQUFJLG1CQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVyRixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyRixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyRixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV0RixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLG1CQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXRGLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxJQUFJLG1CQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JGLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxJQUFJLG1CQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZGLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxJQUFJLG1CQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZGLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxJQUFJLG1CQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXRGLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNiLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHdCQUF3QixFQUFFLEdBQUcsRUFBRTtZQUNuQyxNQUFNLEtBQUssR0FBRyxJQUFBLCtCQUFlLEVBQUMsRUFBRSxFQUMvQixTQUFTLEVBQ1Q7Z0JBQ0MsWUFBWSxFQUFFLEtBQUs7YUFDbkIsQ0FDRCxDQUFDO1lBRUYsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDM0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDM0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDekQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDdkQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDbEUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDbEUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDaEUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDOUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFNUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDL0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDL0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFD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