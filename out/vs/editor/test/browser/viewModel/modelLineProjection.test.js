/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/languages", "vs/editor/common/languages/nullTokenize", "vs/editor/common/modelLineProjectionData", "vs/editor/common/viewModel/modelLineProjection", "vs/editor/common/viewModel/monospaceLineBreaksComputer", "vs/editor/common/viewModel/viewModelLines", "vs/editor/test/browser/config/testConfiguration", "vs/editor/test/common/testTextModel"], function (require, exports, assert, utils_1, position_1, range_1, languages, nullTokenize_1, modelLineProjectionData_1, modelLineProjection_1, monospaceLineBreaksComputer_1, viewModelLines_1, testConfiguration_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Editor ViewModel - SplitLinesCollection', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('SplitLine', () => {
            let model1 = createModel('My First LineMy Second LineAnd another one');
            let line1 = createSplitLine([13, 14, 15], [13, 13 + 14, 13 + 14 + 15], 0);
            assert.strictEqual(line1.getViewLineCount(), 3);
            assert.strictEqual(line1.getViewLineContent(model1, 1, 0), 'My First Line');
            assert.strictEqual(line1.getViewLineContent(model1, 1, 1), 'My Second Line');
            assert.strictEqual(line1.getViewLineContent(model1, 1, 2), 'And another one');
            assert.strictEqual(line1.getViewLineMaxColumn(model1, 1, 0), 14);
            assert.strictEqual(line1.getViewLineMaxColumn(model1, 1, 1), 15);
            assert.strictEqual(line1.getViewLineMaxColumn(model1, 1, 2), 16);
            for (let col = 1; col <= 14; col++) {
                assert.strictEqual(line1.getModelColumnOfViewPosition(0, col), col, 'getInputColumnOfOutputPosition(0, ' + col + ')');
            }
            for (let col = 1; col <= 15; col++) {
                assert.strictEqual(line1.getModelColumnOfViewPosition(1, col), 13 + col, 'getInputColumnOfOutputPosition(1, ' + col + ')');
            }
            for (let col = 1; col <= 16; col++) {
                assert.strictEqual(line1.getModelColumnOfViewPosition(2, col), 13 + 14 + col, 'getInputColumnOfOutputPosition(2, ' + col + ')');
            }
            for (let col = 1; col <= 13; col++) {
                assert.deepStrictEqual(line1.getViewPositionOfModelPosition(0, col), pos(0, col), 'getOutputPositionOfInputPosition(' + col + ')');
            }
            for (let col = 1 + 13; col <= 14 + 13; col++) {
                assert.deepStrictEqual(line1.getViewPositionOfModelPosition(0, col), pos(1, col - 13), 'getOutputPositionOfInputPosition(' + col + ')');
            }
            for (let col = 1 + 13 + 14; col <= 15 + 14 + 13; col++) {
                assert.deepStrictEqual(line1.getViewPositionOfModelPosition(0, col), pos(2, col - 13 - 14), 'getOutputPositionOfInputPosition(' + col + ')');
            }
            model1 = createModel('My First LineMy Second LineAnd another one');
            line1 = createSplitLine([13, 14, 15], [13, 13 + 14, 13 + 14 + 15], 4);
            assert.strictEqual(line1.getViewLineCount(), 3);
            assert.strictEqual(line1.getViewLineContent(model1, 1, 0), 'My First Line');
            assert.strictEqual(line1.getViewLineContent(model1, 1, 1), '    My Second Line');
            assert.strictEqual(line1.getViewLineContent(model1, 1, 2), '    And another one');
            assert.strictEqual(line1.getViewLineMaxColumn(model1, 1, 0), 14);
            assert.strictEqual(line1.getViewLineMaxColumn(model1, 1, 1), 19);
            assert.strictEqual(line1.getViewLineMaxColumn(model1, 1, 2), 20);
            const actualViewColumnMapping = [];
            for (let lineIndex = 0; lineIndex < line1.getViewLineCount(); lineIndex++) {
                const actualLineViewColumnMapping = [];
                for (let col = 1; col <= line1.getViewLineMaxColumn(model1, 1, lineIndex); col++) {
                    actualLineViewColumnMapping.push(line1.getModelColumnOfViewPosition(lineIndex, col));
                }
                actualViewColumnMapping.push(actualLineViewColumnMapping);
            }
            assert.deepStrictEqual(actualViewColumnMapping, [
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
                [14, 14, 14, 14, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
                [28, 28, 28, 28, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43],
            ]);
            for (let col = 1; col <= 13; col++) {
                assert.deepStrictEqual(line1.getViewPositionOfModelPosition(0, col), pos(0, col), '6.getOutputPositionOfInputPosition(' + col + ')');
            }
            for (let col = 1 + 13; col <= 14 + 13; col++) {
                assert.deepStrictEqual(line1.getViewPositionOfModelPosition(0, col), pos(1, 4 + col - 13), '7.getOutputPositionOfInputPosition(' + col + ')');
            }
            for (let col = 1 + 13 + 14; col <= 15 + 14 + 13; col++) {
                assert.deepStrictEqual(line1.getViewPositionOfModelPosition(0, col), pos(2, 4 + col - 13 - 14), '8.getOutputPositionOfInputPosition(' + col + ')');
            }
        });
        function withSplitLinesCollection(text, callback) {
            const config = new testConfiguration_1.TestConfiguration({});
            const wrappingInfo = config.options.get(144 /* EditorOption.wrappingInfo */);
            const fontInfo = config.options.get(50 /* EditorOption.fontInfo */);
            const wordWrapBreakAfterCharacters = config.options.get(131 /* EditorOption.wordWrapBreakAfterCharacters */);
            const wordWrapBreakBeforeCharacters = config.options.get(132 /* EditorOption.wordWrapBreakBeforeCharacters */);
            const wrappingIndent = config.options.get(136 /* EditorOption.wrappingIndent */);
            const wordBreak = config.options.get(128 /* EditorOption.wordBreak */);
            const lineBreaksComputerFactory = new monospaceLineBreaksComputer_1.MonospaceLineBreaksComputerFactory(wordWrapBreakBeforeCharacters, wordWrapBreakAfterCharacters);
            const model = (0, testTextModel_1.createTextModel)([
                'int main() {',
                '\tprintf("Hello world!");',
                '}',
                'int main() {',
                '\tprintf("Hello world!");',
                '}',
            ].join('\n'));
            const linesCollection = new viewModelLines_1.ViewModelLinesFromProjectedModel(1, model, lineBreaksComputerFactory, lineBreaksComputerFactory, fontInfo, model.getOptions().tabSize, 'simple', wrappingInfo.wrappingColumn, wrappingIndent, wordBreak);
            callback(model, linesCollection);
            linesCollection.dispose();
            model.dispose();
            config.dispose();
        }
        test('Invalid line numbers', () => {
            const text = [
                'int main() {',
                '\tprintf("Hello world!");',
                '}',
                'int main() {',
                '\tprintf("Hello world!");',
                '}',
            ].join('\n');
            withSplitLinesCollection(text, (model, linesCollection) => {
                assert.strictEqual(linesCollection.getViewLineCount(), 6);
                // getOutputIndentGuide
                assert.deepStrictEqual(linesCollection.getViewLinesIndentGuides(-1, -1), [0]);
                assert.deepStrictEqual(linesCollection.getViewLinesIndentGuides(0, 0), [0]);
                assert.deepStrictEqual(linesCollection.getViewLinesIndentGuides(1, 1), [0]);
                assert.deepStrictEqual(linesCollection.getViewLinesIndentGuides(2, 2), [1]);
                assert.deepStrictEqual(linesCollection.getViewLinesIndentGuides(3, 3), [0]);
                assert.deepStrictEqual(linesCollection.getViewLinesIndentGuides(4, 4), [0]);
                assert.deepStrictEqual(linesCollection.getViewLinesIndentGuides(5, 5), [1]);
                assert.deepStrictEqual(linesCollection.getViewLinesIndentGuides(6, 6), [0]);
                assert.deepStrictEqual(linesCollection.getViewLinesIndentGuides(7, 7), [0]);
                assert.deepStrictEqual(linesCollection.getViewLinesIndentGuides(0, 7), [0, 1, 0, 0, 1, 0]);
                // getOutputLineContent
                assert.strictEqual(linesCollection.getViewLineContent(-1), 'int main() {');
                assert.strictEqual(linesCollection.getViewLineContent(0), 'int main() {');
                assert.strictEqual(linesCollection.getViewLineContent(1), 'int main() {');
                assert.strictEqual(linesCollection.getViewLineContent(2), '\tprintf("Hello world!");');
                assert.strictEqual(linesCollection.getViewLineContent(3), '}');
                assert.strictEqual(linesCollection.getViewLineContent(4), 'int main() {');
                assert.strictEqual(linesCollection.getViewLineContent(5), '\tprintf("Hello world!");');
                assert.strictEqual(linesCollection.getViewLineContent(6), '}');
                assert.strictEqual(linesCollection.getViewLineContent(7), '}');
                // getOutputLineMinColumn
                assert.strictEqual(linesCollection.getViewLineMinColumn(-1), 1);
                assert.strictEqual(linesCollection.getViewLineMinColumn(0), 1);
                assert.strictEqual(linesCollection.getViewLineMinColumn(1), 1);
                assert.strictEqual(linesCollection.getViewLineMinColumn(2), 1);
                assert.strictEqual(linesCollection.getViewLineMinColumn(3), 1);
                assert.strictEqual(linesCollection.getViewLineMinColumn(4), 1);
                assert.strictEqual(linesCollection.getViewLineMinColumn(5), 1);
                assert.strictEqual(linesCollection.getViewLineMinColumn(6), 1);
                assert.strictEqual(linesCollection.getViewLineMinColumn(7), 1);
                // getOutputLineMaxColumn
                assert.strictEqual(linesCollection.getViewLineMaxColumn(-1), 13);
                assert.strictEqual(linesCollection.getViewLineMaxColumn(0), 13);
                assert.strictEqual(linesCollection.getViewLineMaxColumn(1), 13);
                assert.strictEqual(linesCollection.getViewLineMaxColumn(2), 25);
                assert.strictEqual(linesCollection.getViewLineMaxColumn(3), 2);
                assert.strictEqual(linesCollection.getViewLineMaxColumn(4), 13);
                assert.strictEqual(linesCollection.getViewLineMaxColumn(5), 25);
                assert.strictEqual(linesCollection.getViewLineMaxColumn(6), 2);
                assert.strictEqual(linesCollection.getViewLineMaxColumn(7), 2);
                // convertOutputPositionToInputPosition
                assert.deepStrictEqual(linesCollection.convertViewPositionToModelPosition(-1, 1), new position_1.Position(1, 1));
                assert.deepStrictEqual(linesCollection.convertViewPositionToModelPosition(0, 1), new position_1.Position(1, 1));
                assert.deepStrictEqual(linesCollection.convertViewPositionToModelPosition(1, 1), new position_1.Position(1, 1));
                assert.deepStrictEqual(linesCollection.convertViewPositionToModelPosition(2, 1), new position_1.Position(2, 1));
                assert.deepStrictEqual(linesCollection.convertViewPositionToModelPosition(3, 1), new position_1.Position(3, 1));
                assert.deepStrictEqual(linesCollection.convertViewPositionToModelPosition(4, 1), new position_1.Position(4, 1));
                assert.deepStrictEqual(linesCollection.convertViewPositionToModelPosition(5, 1), new position_1.Position(5, 1));
                assert.deepStrictEqual(linesCollection.convertViewPositionToModelPosition(6, 1), new position_1.Position(6, 1));
                assert.deepStrictEqual(linesCollection.convertViewPositionToModelPosition(7, 1), new position_1.Position(6, 1));
                assert.deepStrictEqual(linesCollection.convertViewPositionToModelPosition(8, 1), new position_1.Position(6, 1));
            });
        });
        test('issue #3662', () => {
            const text = [
                'int main() {',
                '\tprintf("Hello world!");',
                '}',
                'int main() {',
                '\tprintf("Hello world!");',
                '}',
            ].join('\n');
            withSplitLinesCollection(text, (model, linesCollection) => {
                linesCollection.setHiddenAreas([
                    new range_1.Range(1, 1, 3, 1),
                    new range_1.Range(5, 1, 6, 1)
                ]);
                const viewLineCount = linesCollection.getViewLineCount();
                assert.strictEqual(viewLineCount, 1, 'getOutputLineCount()');
                const modelLineCount = model.getLineCount();
                for (let lineNumber = 0; lineNumber <= modelLineCount + 1; lineNumber++) {
                    const lineMinColumn = (lineNumber >= 1 && lineNumber <= modelLineCount) ? model.getLineMinColumn(lineNumber) : 1;
                    const lineMaxColumn = (lineNumber >= 1 && lineNumber <= modelLineCount) ? model.getLineMaxColumn(lineNumber) : 1;
                    for (let column = lineMinColumn - 1; column <= lineMaxColumn + 1; column++) {
                        const viewPosition = linesCollection.convertModelPositionToViewPosition(lineNumber, column);
                        // validate view position
                        let viewLineNumber = viewPosition.lineNumber;
                        let viewColumn = viewPosition.column;
                        if (viewLineNumber < 1) {
                            viewLineNumber = 1;
                        }
                        const lineCount = linesCollection.getViewLineCount();
                        if (viewLineNumber > lineCount) {
                            viewLineNumber = lineCount;
                        }
                        const viewMinColumn = linesCollection.getViewLineMinColumn(viewLineNumber);
                        const viewMaxColumn = linesCollection.getViewLineMaxColumn(viewLineNumber);
                        if (viewColumn < viewMinColumn) {
                            viewColumn = viewMinColumn;
                        }
                        if (viewColumn > viewMaxColumn) {
                            viewColumn = viewMaxColumn;
                        }
                        const validViewPosition = new position_1.Position(viewLineNumber, viewColumn);
                        assert.strictEqual(viewPosition.toString(), validViewPosition.toString(), 'model->view for ' + lineNumber + ', ' + column);
                    }
                }
                for (let lineNumber = 0; lineNumber <= viewLineCount + 1; lineNumber++) {
                    const lineMinColumn = linesCollection.getViewLineMinColumn(lineNumber);
                    const lineMaxColumn = linesCollection.getViewLineMaxColumn(lineNumber);
                    for (let column = lineMinColumn - 1; column <= lineMaxColumn + 1; column++) {
                        const modelPosition = linesCollection.convertViewPositionToModelPosition(lineNumber, column);
                        const validModelPosition = model.validatePosition(modelPosition);
                        assert.strictEqual(modelPosition.toString(), validModelPosition.toString(), 'view->model for ' + lineNumber + ', ' + column);
                    }
                }
            });
        });
    });
    suite('SplitLinesCollection', () => {
        const _text = [
            'class Nice {',
            '	function hi() {',
            '		console.log("Hello world");',
            '	}',
            '	function hello() {',
            '		console.log("Hello world, this is a somewhat longer line");',
            '	}',
            '}',
        ];
        const _tokens = [
            [
                { startIndex: 0, value: 1 },
                { startIndex: 5, value: 2 },
                { startIndex: 6, value: 3 },
                { startIndex: 10, value: 4 },
            ],
            [
                { startIndex: 0, value: 5 },
                { startIndex: 1, value: 6 },
                { startIndex: 9, value: 7 },
                { startIndex: 10, value: 8 },
                { startIndex: 12, value: 9 },
            ],
            [
                { startIndex: 0, value: 10 },
                { startIndex: 2, value: 11 },
                { startIndex: 9, value: 12 },
                { startIndex: 10, value: 13 },
                { startIndex: 13, value: 14 },
                { startIndex: 14, value: 15 },
                { startIndex: 27, value: 16 },
            ],
            [
                { startIndex: 0, value: 17 },
            ],
            [
                { startIndex: 0, value: 18 },
                { startIndex: 1, value: 19 },
                { startIndex: 9, value: 20 },
                { startIndex: 10, value: 21 },
                { startIndex: 15, value: 22 },
            ],
            [
                { startIndex: 0, value: 23 },
                { startIndex: 2, value: 24 },
                { startIndex: 9, value: 25 },
                { startIndex: 10, value: 26 },
                { startIndex: 13, value: 27 },
                { startIndex: 14, value: 28 },
                { startIndex: 59, value: 29 },
            ],
            [
                { startIndex: 0, value: 30 },
            ],
            [
                { startIndex: 0, value: 31 },
            ]
        ];
        let model;
        let languageRegistration;
        setup(() => {
            let _lineIndex = 0;
            const tokenizationSupport = {
                getInitialState: () => nullTokenize_1.NullState,
                tokenize: undefined,
                tokenizeEncoded: (line, hasEOL, state) => {
                    const tokens = _tokens[_lineIndex++];
                    const result = new Uint32Array(2 * tokens.length);
                    for (let i = 0; i < tokens.length; i++) {
                        result[2 * i] = tokens[i].startIndex;
                        result[2 * i + 1] = (tokens[i].value << 15 /* MetadataConsts.FOREGROUND_OFFSET */);
                    }
                    return new languages.EncodedTokenizationResult(result, state);
                }
            };
            const LANGUAGE_ID = 'modelModeTest1';
            languageRegistration = languages.TokenizationRegistry.register(LANGUAGE_ID, tokenizationSupport);
            model = (0, testTextModel_1.createTextModel)(_text.join('\n'), LANGUAGE_ID);
            // force tokenization
            model.tokenization.forceTokenization(model.getLineCount());
        });
        teardown(() => {
            model.dispose();
            languageRegistration.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        function assertViewLineTokens(_actual, expected) {
            const actual = [];
            for (let i = 0, len = _actual.getCount(); i < len; i++) {
                actual[i] = {
                    endIndex: _actual.getEndOffset(i),
                    value: _actual.getForeground(i)
                };
            }
            assert.deepStrictEqual(actual, expected);
        }
        function assertMinimapLineRenderingData(actual, expected) {
            if (actual === null && expected === null) {
                assert.ok(true);
                return;
            }
            if (expected === null) {
                assert.ok(false);
            }
            assert.strictEqual(actual.content, expected.content);
            assert.strictEqual(actual.minColumn, expected.minColumn);
            assert.strictEqual(actual.maxColumn, expected.maxColumn);
            assertViewLineTokens(actual.tokens, expected.tokens);
        }
        function assertMinimapLinesRenderingData(actual, expected) {
            assert.strictEqual(actual.length, expected.length);
            for (let i = 0; i < expected.length; i++) {
                assertMinimapLineRenderingData(actual[i], expected[i]);
            }
        }
        function assertAllMinimapLinesRenderingData(splitLinesCollection, all) {
            const lineCount = all.length;
            for (let line = 1; line <= lineCount; line++) {
                assert.strictEqual(splitLinesCollection.getViewLineData(line).content, splitLinesCollection.getViewLineContent(line));
            }
            for (let start = 1; start <= lineCount; start++) {
                for (let end = start; end <= lineCount; end++) {
                    const count = end - start + 1;
                    for (let desired = Math.pow(2, count) - 1; desired >= 0; desired--) {
                        const needed = [];
                        const expected = [];
                        for (let i = 0; i < count; i++) {
                            needed[i] = (desired & (1 << i)) ? true : false;
                            expected[i] = (needed[i] ? all[start - 1 + i] : null);
                        }
                        const actual = splitLinesCollection.getViewLinesData(start, end, needed);
                        assertMinimapLinesRenderingData(actual, expected);
                        // Comment out next line to test all possible combinations
                        break;
                    }
                }
            }
        }
        test('getViewLinesData - no wrapping', () => {
            withSplitLinesCollection(model, 'off', 0, (splitLinesCollection) => {
                assert.strictEqual(splitLinesCollection.getViewLineCount(), 8);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(1, 1), true);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(2, 1), true);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(3, 1), true);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(4, 1), true);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(5, 1), true);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(6, 1), true);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(7, 1), true);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(8, 1), true);
                const _expected = [
                    {
                        content: 'class Nice {',
                        minColumn: 1,
                        maxColumn: 13,
                        tokens: [
                            { endIndex: 5, value: 1 },
                            { endIndex: 6, value: 2 },
                            { endIndex: 10, value: 3 },
                            { endIndex: 12, value: 4 },
                        ]
                    },
                    {
                        content: '	function hi() {',
                        minColumn: 1,
                        maxColumn: 17,
                        tokens: [
                            { endIndex: 1, value: 5 },
                            { endIndex: 9, value: 6 },
                            { endIndex: 10, value: 7 },
                            { endIndex: 12, value: 8 },
                            { endIndex: 16, value: 9 },
                        ]
                    },
                    {
                        content: '		console.log("Hello world");',
                        minColumn: 1,
                        maxColumn: 30,
                        tokens: [
                            { endIndex: 2, value: 10 },
                            { endIndex: 9, value: 11 },
                            { endIndex: 10, value: 12 },
                            { endIndex: 13, value: 13 },
                            { endIndex: 14, value: 14 },
                            { endIndex: 27, value: 15 },
                            { endIndex: 29, value: 16 },
                        ]
                    },
                    {
                        content: '	}',
                        minColumn: 1,
                        maxColumn: 3,
                        tokens: [
                            { endIndex: 2, value: 17 },
                        ]
                    },
                    {
                        content: '	function hello() {',
                        minColumn: 1,
                        maxColumn: 20,
                        tokens: [
                            { endIndex: 1, value: 18 },
                            { endIndex: 9, value: 19 },
                            { endIndex: 10, value: 20 },
                            { endIndex: 15, value: 21 },
                            { endIndex: 19, value: 22 },
                        ]
                    },
                    {
                        content: '		console.log("Hello world, this is a somewhat longer line");',
                        minColumn: 1,
                        maxColumn: 62,
                        tokens: [
                            { endIndex: 2, value: 23 },
                            { endIndex: 9, value: 24 },
                            { endIndex: 10, value: 25 },
                            { endIndex: 13, value: 26 },
                            { endIndex: 14, value: 27 },
                            { endIndex: 59, value: 28 },
                            { endIndex: 61, value: 29 },
                        ]
                    },
                    {
                        minColumn: 1,
                        maxColumn: 3,
                        content: '	}',
                        tokens: [
                            { endIndex: 2, value: 30 },
                        ]
                    },
                    {
                        minColumn: 1,
                        maxColumn: 2,
                        content: '}',
                        tokens: [
                            { endIndex: 1, value: 31 },
                        ]
                    }
                ];
                assertAllMinimapLinesRenderingData(splitLinesCollection, [
                    _expected[0],
                    _expected[1],
                    _expected[2],
                    _expected[3],
                    _expected[4],
                    _expected[5],
                    _expected[6],
                    _expected[7],
                ]);
                splitLinesCollection.setHiddenAreas([new range_1.Range(2, 1, 4, 1)]);
                assert.strictEqual(splitLinesCollection.getViewLineCount(), 5);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(1, 1), true);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(2, 1), false);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(3, 1), false);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(4, 1), false);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(5, 1), true);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(6, 1), true);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(7, 1), true);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(8, 1), true);
                assertAllMinimapLinesRenderingData(splitLinesCollection, [
                    _expected[0],
                    _expected[4],
                    _expected[5],
                    _expected[6],
                    _expected[7],
                ]);
            });
        });
        test('getViewLinesData - with wrapping', () => {
            withSplitLinesCollection(model, 'wordWrapColumn', 30, (splitLinesCollection) => {
                assert.strictEqual(splitLinesCollection.getViewLineCount(), 12);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(1, 1), true);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(2, 1), true);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(3, 1), true);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(4, 1), true);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(5, 1), true);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(6, 1), true);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(7, 1), true);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(8, 1), true);
                const _expected = [
                    {
                        content: 'class Nice {',
                        minColumn: 1,
                        maxColumn: 13,
                        tokens: [
                            { endIndex: 5, value: 1 },
                            { endIndex: 6, value: 2 },
                            { endIndex: 10, value: 3 },
                            { endIndex: 12, value: 4 },
                        ]
                    },
                    {
                        content: '	function hi() {',
                        minColumn: 1,
                        maxColumn: 17,
                        tokens: [
                            { endIndex: 1, value: 5 },
                            { endIndex: 9, value: 6 },
                            { endIndex: 10, value: 7 },
                            { endIndex: 12, value: 8 },
                            { endIndex: 16, value: 9 },
                        ]
                    },
                    {
                        content: '		console.log("Hello ',
                        minColumn: 1,
                        maxColumn: 22,
                        tokens: [
                            { endIndex: 2, value: 10 },
                            { endIndex: 9, value: 11 },
                            { endIndex: 10, value: 12 },
                            { endIndex: 13, value: 13 },
                            { endIndex: 14, value: 14 },
                            { endIndex: 21, value: 15 },
                        ]
                    },
                    {
                        content: '            world");',
                        minColumn: 13,
                        maxColumn: 21,
                        tokens: [
                            { endIndex: 18, value: 15 },
                            { endIndex: 20, value: 16 },
                        ]
                    },
                    {
                        content: '	}',
                        minColumn: 1,
                        maxColumn: 3,
                        tokens: [
                            { endIndex: 2, value: 17 },
                        ]
                    },
                    {
                        content: '	function hello() {',
                        minColumn: 1,
                        maxColumn: 20,
                        tokens: [
                            { endIndex: 1, value: 18 },
                            { endIndex: 9, value: 19 },
                            { endIndex: 10, value: 20 },
                            { endIndex: 15, value: 21 },
                            { endIndex: 19, value: 22 },
                        ]
                    },
                    {
                        content: '		console.log("Hello ',
                        minColumn: 1,
                        maxColumn: 22,
                        tokens: [
                            { endIndex: 2, value: 23 },
                            { endIndex: 9, value: 24 },
                            { endIndex: 10, value: 25 },
                            { endIndex: 13, value: 26 },
                            { endIndex: 14, value: 27 },
                            { endIndex: 21, value: 28 },
                        ]
                    },
                    {
                        content: '            world, this is a ',
                        minColumn: 13,
                        maxColumn: 30,
                        tokens: [
                            { endIndex: 29, value: 28 },
                        ]
                    },
                    {
                        content: '            somewhat longer ',
                        minColumn: 13,
                        maxColumn: 29,
                        tokens: [
                            { endIndex: 28, value: 28 },
                        ]
                    },
                    {
                        content: '            line");',
                        minColumn: 13,
                        maxColumn: 20,
                        tokens: [
                            { endIndex: 17, value: 28 },
                            { endIndex: 19, value: 29 },
                        ]
                    },
                    {
                        content: '	}',
                        minColumn: 1,
                        maxColumn: 3,
                        tokens: [
                            { endIndex: 2, value: 30 },
                        ]
                    },
                    {
                        content: '}',
                        minColumn: 1,
                        maxColumn: 2,
                        tokens: [
                            { endIndex: 1, value: 31 },
                        ]
                    }
                ];
                assertAllMinimapLinesRenderingData(splitLinesCollection, [
                    _expected[0],
                    _expected[1],
                    _expected[2],
                    _expected[3],
                    _expected[4],
                    _expected[5],
                    _expected[6],
                    _expected[7],
                    _expected[8],
                    _expected[9],
                    _expected[10],
                    _expected[11],
                ]);
                splitLinesCollection.setHiddenAreas([new range_1.Range(2, 1, 4, 1)]);
                assert.strictEqual(splitLinesCollection.getViewLineCount(), 8);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(1, 1), true);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(2, 1), false);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(3, 1), false);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(4, 1), false);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(5, 1), true);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(6, 1), true);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(7, 1), true);
                assert.strictEqual(splitLinesCollection.modelPositionIsVisible(8, 1), true);
                assertAllMinimapLinesRenderingData(splitLinesCollection, [
                    _expected[0],
                    _expected[5],
                    _expected[6],
                    _expected[7],
                    _expected[8],
                    _expected[9],
                    _expected[10],
                    _expected[11],
                ]);
            });
        });
        test('getViewLinesData - with wrapping and injected text', () => {
            model.deltaDecorations([], [{
                    range: new range_1.Range(1, 9, 1, 9),
                    options: {
                        description: 'example',
                        after: {
                            content: 'very very long injected text that causes a line break',
                            inlineClassName: 'myClassName'
                        },
                        showIfCollapsed: true,
                    }
                }]);
            withSplitLinesCollection(model, 'wordWrapColumn', 30, (splitLinesCollection) => {
                assert.strictEqual(splitLinesCollection.getViewLineCount(), 14);
                assert.strictEqual(splitLinesCollection.getViewLineMaxColumn(1), 24);
                const _expected = [
                    {
                        content: 'class Nivery very long ',
                        minColumn: 1,
                        maxColumn: 24,
                        tokens: [
                            { endIndex: 5, value: 1 },
                            { endIndex: 6, value: 2 },
                            { endIndex: 8, value: 3 },
                            { endIndex: 23, value: 1 },
                        ]
                    },
                    {
                        content: '    injected text that causes ',
                        minColumn: 5,
                        maxColumn: 31,
                        tokens: [{ endIndex: 30, value: 1 }]
                    },
                    {
                        content: '    a line breakce {',
                        minColumn: 5,
                        maxColumn: 21,
                        tokens: [
                            { endIndex: 16, value: 1 },
                            { endIndex: 18, value: 3 },
                            { endIndex: 20, value: 4 }
                        ]
                    },
                    {
                        content: '	function hi() {',
                        minColumn: 1,
                        maxColumn: 17,
                        tokens: [
                            { endIndex: 1, value: 5 },
                            { endIndex: 9, value: 6 },
                            { endIndex: 10, value: 7 },
                            { endIndex: 12, value: 8 },
                            { endIndex: 16, value: 9 },
                        ]
                    },
                    {
                        content: '		console.log("Hello ',
                        minColumn: 1,
                        maxColumn: 22,
                        tokens: [
                            { endIndex: 2, value: 10 },
                            { endIndex: 9, value: 11 },
                            { endIndex: 10, value: 12 },
                            { endIndex: 13, value: 13 },
                            { endIndex: 14, value: 14 },
                            { endIndex: 21, value: 15 },
                        ]
                    },
                    {
                        content: '            world");',
                        minColumn: 13,
                        maxColumn: 21,
                        tokens: [
                            { endIndex: 18, value: 15 },
                            { endIndex: 20, value: 16 },
                        ]
                    },
                    {
                        content: '	}',
                        minColumn: 1,
                        maxColumn: 3,
                        tokens: [
                            { endIndex: 2, value: 17 },
                        ]
                    },
                    {
                        content: '	function hello() {',
                        minColumn: 1,
                        maxColumn: 20,
                        tokens: [
                            { endIndex: 1, value: 18 },
                            { endIndex: 9, value: 19 },
                            { endIndex: 10, value: 20 },
                            { endIndex: 15, value: 21 },
                            { endIndex: 19, value: 22 },
                        ]
                    },
                    {
                        content: '		console.log("Hello ',
                        minColumn: 1,
                        maxColumn: 22,
                        tokens: [
                            { endIndex: 2, value: 23 },
                            { endIndex: 9, value: 24 },
                            { endIndex: 10, value: 25 },
                            { endIndex: 13, value: 26 },
                            { endIndex: 14, value: 27 },
                            { endIndex: 21, value: 28 },
                        ]
                    },
                    {
                        content: '            world, this is a ',
                        minColumn: 13,
                        maxColumn: 30,
                        tokens: [
                            { endIndex: 29, value: 28 },
                        ]
                    },
                    {
                        content: '            somewhat longer ',
                        minColumn: 13,
                        maxColumn: 29,
                        tokens: [
                            { endIndex: 28, value: 28 },
                        ]
                    },
                    {
                        content: '            line");',
                        minColumn: 13,
                        maxColumn: 20,
                        tokens: [
                            { endIndex: 17, value: 28 },
                            { endIndex: 19, value: 29 },
                        ]
                    },
                    {
                        content: '	}',
                        minColumn: 1,
                        maxColumn: 3,
                        tokens: [
                            { endIndex: 2, value: 30 },
                        ]
                    },
                    {
                        content: '}',
                        minColumn: 1,
                        maxColumn: 2,
                        tokens: [
                            { endIndex: 1, value: 31 },
                        ]
                    }
                ];
                assertAllMinimapLinesRenderingData(splitLinesCollection, [
                    _expected[0],
                    _expected[1],
                    _expected[2],
                    _expected[3],
                    _expected[4],
                    _expected[5],
                    _expected[6],
                    _expected[7],
                    _expected[8],
                    _expected[9],
                    _expected[10],
                    _expected[11],
                ]);
                const data = splitLinesCollection.getViewLinesData(1, 14, new Array(14).fill(true));
                assert.deepStrictEqual(data.map((d) => ({
                    inlineDecorations: d.inlineDecorations?.map((d) => ({
                        startOffset: d.startOffset,
                        endOffset: d.endOffset,
                    })),
                })), [
                    { inlineDecorations: [{ startOffset: 8, endOffset: 23 }] },
                    { inlineDecorations: [{ startOffset: 4, endOffset: 30 }] },
                    { inlineDecorations: [{ startOffset: 4, endOffset: 16 }] },
                    { inlineDecorations: undefined },
                    { inlineDecorations: undefined },
                    { inlineDecorations: undefined },
                    { inlineDecorations: undefined },
                    { inlineDecorations: undefined },
                    { inlineDecorations: undefined },
                    { inlineDecorations: undefined },
                    { inlineDecorations: undefined },
                    { inlineDecorations: undefined },
                    { inlineDecorations: undefined },
                    { inlineDecorations: undefined },
                ]);
            });
        });
        function withSplitLinesCollection(model, wordWrap, wordWrapColumn, callback) {
            const configuration = new testConfiguration_1.TestConfiguration({
                wordWrap: wordWrap,
                wordWrapColumn: wordWrapColumn,
                wrappingIndent: 'indent'
            });
            const wrappingInfo = configuration.options.get(144 /* EditorOption.wrappingInfo */);
            const fontInfo = configuration.options.get(50 /* EditorOption.fontInfo */);
            const wordWrapBreakAfterCharacters = configuration.options.get(131 /* EditorOption.wordWrapBreakAfterCharacters */);
            const wordWrapBreakBeforeCharacters = configuration.options.get(132 /* EditorOption.wordWrapBreakBeforeCharacters */);
            const wrappingIndent = configuration.options.get(136 /* EditorOption.wrappingIndent */);
            const wordBreak = configuration.options.get(128 /* EditorOption.wordBreak */);
            const lineBreaksComputerFactory = new monospaceLineBreaksComputer_1.MonospaceLineBreaksComputerFactory(wordWrapBreakBeforeCharacters, wordWrapBreakAfterCharacters);
            const linesCollection = new viewModelLines_1.ViewModelLinesFromProjectedModel(1, model, lineBreaksComputerFactory, lineBreaksComputerFactory, fontInfo, model.getOptions().tabSize, 'simple', wrappingInfo.wrappingColumn, wrappingIndent, wordBreak);
            callback(linesCollection);
            configuration.dispose();
        }
    });
    function pos(lineNumber, column) {
        return new position_1.Position(lineNumber, column);
    }
    function createSplitLine(splitLengths, breakingOffsetsVisibleColumn, wrappedTextIndentWidth, isVisible = true) {
        return (0, modelLineProjection_1.createModelLineProjection)(createLineBreakData(splitLengths, breakingOffsetsVisibleColumn, wrappedTextIndentWidth), isVisible);
    }
    function createLineBreakData(breakingLengths, breakingOffsetsVisibleColumn, wrappedTextIndentWidth) {
        const sums = [];
        for (let i = 0; i < breakingLengths.length; i++) {
            sums[i] = (i > 0 ? sums[i - 1] : 0) + breakingLengths[i];
        }
        return new modelLineProjectionData_1.ModelLineProjectionData(null, null, sums, breakingOffsetsVisibleColumn, wrappedTextIndentWidth);
    }
    function createModel(text) {
        return {
            tokenization: {
                getLineTokens: (lineNumber) => {
                    return null;
                },
            },
            getLineContent: (lineNumber) => {
                return text;
            },
            getLineLength: (lineNumber) => {
                return text.length;
            },
            getLineMinColumn: (lineNumber) => {
                return 1;
            },
            getLineMaxColumn: (lineNumber) => {
                return text.length + 1;
            },
            getValueInRange: (range, eol) => {
                return text.substring(range.startColumn - 1, range.endColumn - 1);
            }
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWxMaW5lUHJvamVjdGlvbi50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3Rlc3QvYnJvd3Nlci92aWV3TW9kZWwvbW9kZWxMaW5lUHJvamVjdGlvbi50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBc0JoRyxLQUFLLENBQUMseUNBQXlDLEVBQUUsR0FBRyxFQUFFO1FBRXJELElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUUxQyxJQUFJLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRTtZQUN0QixJQUFJLE1BQU0sR0FBRyxXQUFXLENBQUMsNENBQTRDLENBQUMsQ0FBQztZQUN2RSxJQUFJLEtBQUssR0FBRyxlQUFlLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUUxRSxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2hELE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDNUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzdFLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQUM5RSxNQUFNLENBQUMs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QyxDQUFDLENBQUMsQ0FBQztnQkFDdEcsTUFBTSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsa0NBQWtDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckcsTUFBTSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsa0NBQWtDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckcsTUFBTSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsa0NBQWtDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckcsTUFBTSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsa0NBQWtDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckcsTUFBTSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsa0NBQWtDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckcsTUFBTSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsa0NBQWtDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckcsTUFBTSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsa0NBQWtDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckcsTUFBTSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsa0NBQWtD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QUFVLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7Z0JBQzdCLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFO2FBQzdCO1lBQ0Q7Z0JBQ0MsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7YUFDNUI7WUFDRDtnQkFDQyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTtnQkFDNUIsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7Z0JBQzVCLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFO2dCQUM1QixFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTtnQkFDN0IsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7YUFDN0I7WUFDRDtnQkFDQyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTtnQkFDNUIsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7Z0JBQzVCLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFO2dCQUM1QixFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTtnQkFDN0IsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7Z0JBQzdCLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFO2dCQUM3QixFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTthQUM3QjtZQUNEO2dCQUNDLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFO2FBQzVCO1lBQ0Q7Z0JBQ0MsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7YUFDNUI7U0FDRCxDQUFDO1FBRUYsSUFBSSxLQUFnQixDQUFDO1FBQ3JCLElBQUksb0JBQWlDLENBQUM7UUFFdEMsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztZQUNuQixNQUFNLG1CQUFtQixHQUFtQztnQkFDM0QsZUFBZSxFQUFFLEdBQUcsRUFBRSxDQUFDLHdCQUFTO2dCQUNoQyxRQUFRLEVBQUUsU0FBVTtnQkFDcEIsZUFBZSxFQUFFLENBQUMsSUFBWSxFQUFFLE1BQWUsRUFBRSxLQUF1QixFQUF1QyxFQUFFO29CQUNoSCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztvQkFFckMsTUFBTSxNQUFNLEdBQUcsSUFBSSxXQUFXLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDbEQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7d0JBQ3ZDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQzt3QkFDckMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FDbkIsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssNkNBQW9DLENBQ25ELENBQUM7cUJBQ0Y7b0JBQ0QsT0FBTyxJQUFJLFNBQVMsQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQy9ELENBQUM7YUFDRCxDQUFDO1lBQ0YsTUFBTSxXQUFXLEdBQUcsZ0JBQWdCLENBQUM7WUFDckMsb0JBQW9CLEdBQUcsU0FBUyxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztZQUNqRyxLQUFLLEdBQUcsSUFBQSwrQkFBZSxFQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDdkQscUJBQXFCO1lBQ3JCLEtBQUssQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7UUFDNUQsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQ2IsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2hCLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2hDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBTzFDLFNBQVMsb0JBQW9CLENBQUMsT0FBd0IsRUFBRSxRQUE4QjtZQUNyRixNQUFNLE1BQU0sR0FBeUIsRUFBRSxDQUFDO1lBQ3hDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDdkQsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHO29CQUNYLFFBQVEsRUFBRSxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztvQkFDakMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO2lCQUMvQixDQUFDO2FBQ0Y7WUFDRCxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBU0QsU0FBUyw4QkFBOEIsQ0FBQyxNQUFvQixFQUFFLFFBQThDO1lBQzNHLElBQUksTUFBTSxLQUFLLElBQUksSUFBSSxRQUFRLEtBQUssSUFBSSxFQUFFO2dCQUN6QyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNoQixPQUFPO2FBQ1A7WUFDRCxJQUFJLFFBQVEsS0FBSyxJQUFJLEVBQUU7Z0JBQ3RCLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDakI7WUFDRCxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3JELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDekQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN6RCxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBRUQsU0FBUywrQkFBK0IsQ0FBQyxNQUFzQixFQUFFLFFBQXFEO1lBQ3JILE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbkQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3pDLDhCQUE4QixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN2RDtRQUNGLENBQUM7UUFFRCxTQUFTLGtDQUFrQyxDQUFDLG9CQUFzRCxFQUFFLEdBQW9DO1lBQ3ZJLE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7WUFDN0IsS0FBSyxJQUFJLElBQUksR0FBRyxDQUFDLEVBQUUsSUFBSSxJQUFJLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRTtnQkFDN0MsTUFBTSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLG9CQUFvQixDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDdEg7WUFFRCxLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLElBQUksU0FBUyxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUNoRCxLQUFLLElBQUksR0FBRyxHQUFHLEtBQUssRUFBRSxHQUFHLElBQUksU0FBUyxFQUFFLEdBQUcsRUFBRSxFQUFFO29CQUM5QyxNQUFNLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQztvQkFDOUIsS0FBSyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsT0FBTyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRTt3QkFDbkUsTUFBTSxNQUFNLEdBQWMsRUFBRSxDQUFDO3dCQUM3QixNQUFNLFFBQVEsR0FBZ0QsRUFBRSxDQUFDO3dCQUNqRSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFOzRCQUMvQixNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7NEJBQ2hELFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO3lCQUN0RDt3QkFDRCxNQUFNLE1BQU0sR0FBRyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO3dCQUV6RSwrQkFBK0IsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7d0JBQ2xELDBEQUEwRDt3QkFDMUQsTUFBTTtxQkFDTjtpQkFDRDthQUNEO1FBQ0YsQ0FBQztRQUVELElBQUksQ0FBQyxnQ0FBZ0MsRUFBRSxHQUFHLEVBQUU7WUFDM0Msd0JBQXdCLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxFQUFFO2dCQUNsRSxNQUFNLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQy9ELE1BQU0sQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUM1RSxNQUFNLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLHNCQUFzQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDNUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzVFLE1BQU0sQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUM1RSxNQUFNLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLHNCQUFzQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDNUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzVFLE1BQU0sQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUM1RSxNQUFNLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLHNCQUFzQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFNUUsTUFBTSxTQUFTLEdBQW9DO29CQUNsRDt3QkFDQyxPQUFPLEVBQUUsY0FBYzt3QkFDdkIsU0FBUyxFQUFFLENBQUM7d0JBQ1osU0FBUyxFQUFFLEVBQUU7d0JBQ2IsTUFBTSxFQUFFOzRCQUNQLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFOzRCQUN6QixFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRTs0QkFDekIsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUU7NEJBQzFCLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFO3lCQUMxQjtxQkFDRDtvQkFDRDt3QkFDQyxPQUFPLEVBQUUsa0JBQWtCO3dCQUMzQixTQUFTLEVBQUUsQ0FBQzt3QkFDWixTQUFTLEVBQUUsRUFBRTt3QkFDYixNQUFNLEVBQUU7NEJBQ1AsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUU7NEJBQ3pCLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFOzRCQUN6QixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRTs0QkFDMUIsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUU7NEJBQzFCLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFO3lCQUMxQjtxQkFDRDtvQkFDRDt3QkFDQyxPQUFPLEVBQUUsK0JBQStCO3dCQUN4QyxTQUFTLEVBQUUsQ0FBQzt3QkFDWixTQUFTLEVBQUUsRUFBRTt3QkFDYixNQUFNLEVBQUU7NEJBQ1AsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7NEJBQzFCLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFOzRCQUMxQixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTs0QkFDM0IsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7NEJBQzNCLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFOzRCQUMzQixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTs0QkFDM0IsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7eUJBQzNCO3FCQUNEO29CQUNEO3dCQUNDLE9BQU8sRUFBRSxJQUFJO3dCQUNiLFNBQVMsRUFBRSxDQUFDO3dCQUNaLFNBQVMsRUFBRSxDQUFDO3dCQUNaLE1BQU0sRUFBRTs0QkFDUCxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTt5QkFDMUI7cUJBQ0Q7b0JBQ0Q7d0JBQ0MsT0FBTyxFQUFFLHFCQUFxQjt3QkFDOUIsU0FBUyxFQUFFLENBQUM7d0JBQ1osU0FBUyxFQUFFLEVBQUU7d0JBQ2IsTUFBTSxFQUFFOzRCQUNQLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFOzRCQUMxQixFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTs0QkFDMUIsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7NEJBQzNCLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFOzRCQUMzQixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTt5QkFDM0I7cUJBQ0Q7b0JBQ0Q7d0JBQ0MsT0FBTyxFQUFFLCtEQUErRDt3QkFDeEUsU0FBUyxFQUFFLENBQUM7d0JBQ1osU0FBUyxFQUFFLEVBQUU7d0JBQ2IsTUFBTSxFQUFFOzRCQUNQLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFOzRCQUMxQixFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTs0QkFDMUIsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7NEJBQzNCLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFOzRCQUMzQixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTs0QkFDM0IsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7NEJBQzNCLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFO3lCQUMzQjtxQkFDRDtvQkFDRDt3QkFDQyxTQUFTLEVBQUUsQ0FBQzt3QkFDWixTQUFTLEVBQUUsQ0FBQzt3QkFDWixPQUFPLEVBQUUsSUFBSTt3QkFDYixNQUFNLEVBQUU7NEJBQ1AsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7eUJBQzFCO3FCQUNEO29CQUNEO3dCQUNDLFNBQVMsRUFBRSxDQUFDO3dCQUNaLFNBQVMsRUFBRSxDQUFDO3dCQUNaLE9BQU8sRUFBRSxHQUFHO3dCQUNaLE1BQU0sRUFBRTs0QkFDUCxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTt5QkFDMUI7cUJBQ0Q7aUJBQ0QsQ0FBQztnQkFFRixrQ0FBa0MsQ0FBQyxvQkFBb0IsRUFBRTtvQkFDeEQsU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDWixTQUFTLENBQUMsQ0FBQyxDQUFDO29CQUNaLFNBQVMsQ0FBQyxDQUFDLENBQUM7b0JBQ1osU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDWixTQUFTLENBQUMsQ0FBQyxDQUFDO29CQUNaLFNBQVMsQ0FBQyxDQUFDLENBQUM7b0JBQ1osU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDWixTQUFTLENBQUMsQ0FBQyxDQUFDO2lCQUNaLENBQUMsQ0FBQztnQkFFSCxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzdELE1BQU0sQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDL0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzVFLE1BQU0sQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUM3RSxNQUFNLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLHNCQUFzQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDN0UsTUFBTSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzdFLE1BQU0sQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUM1RSxNQUFNLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLHNCQUFzQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDNUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzVFLE1BQU0sQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUU1RSxrQ0FBa0MsQ0FBQyxvQkFBb0IsRUFBRTtvQkFDeEQsU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDWixTQUFTLENBQUMsQ0FBQyxDQUFDO29CQUNaLFNBQVMsQ0FBQyxDQUFDLENBQUM7b0JBQ1osU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDWixTQUFTLENBQUMsQ0FBQyxDQUFDO2lCQUNaLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsa0NBQWtDLEVBQUUsR0FBRyxFQUFFO1lBQzdDLHdCQUF3QixDQUFDLEtBQUssRUFBRSxnQkFBZ0IsRUFBRSxFQUFFLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxFQUFFO2dCQUM5RSxNQUFNLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLGdCQUFnQixFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ2hFLE1BQU0sQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUM1RSxNQUFNLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLHNCQUFzQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDNUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzVFLE1BQU0sQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUM1RSxNQUFNLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLHNCQUFzQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDNUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzVFLE1BQU0sQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUM1RSxNQUFNLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLHNCQUFzQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFNUUsTUFBTSxTQUFTLEdBQW9DO29CQUNsRDt3QkFDQyxPQUFPLEVBQUUsY0FBYzt3QkFDdkIsU0FBUyxFQUFFLENBQUM7d0JBQ1osU0FBUyxFQUFFLEVBQUU7d0JBQ2IsTUFBTSxFQUFFOzRCQUNQLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFOzRCQUN6QixFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRTs0QkFDekIsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUU7NEJBQzFCLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFO3lCQUMxQjtxQkFDRDtvQkFDRDt3QkFDQyxPQUFPLEVBQUUsa0JBQWtCO3dCQUMzQixTQUFTLEVBQUUsQ0FBQzt3QkFDWixTQUFTLEVBQUUsRUFBRTt3QkFDYixNQUFNLEVBQUU7NEJBQ1AsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUU7NEJBQ3pCLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFOzRCQUN6QixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRTs0QkFDMUIsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUU7NEJBQzFCLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFO3lCQUMxQjtxQkFDRDtvQkFDRDt3QkFDQyxPQUFPLEVBQUUsdUJBQXVCO3dCQUNoQyxTQUFTLEVBQUUsQ0FBQzt3QkFDWixTQUFTLEVBQUUsRUFBRTt3QkFDYixNQUFNLEVBQUU7NEJBQ1AsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7NEJBQzFCLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFOzRCQUMxQixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTs0QkFDM0IsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7NEJBQzNCLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFOzRCQUMzQixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTt5QkFDM0I7cUJBQ0Q7b0JBQ0Q7d0JBQ0MsT0FBTyxFQUFFLHNCQUFzQjt3QkFDL0IsU0FBUyxFQUFFLEVBQUU7d0JBQ2IsU0FBUyxFQUFFLEVBQUU7d0JBQ2IsTUFBTSxFQUFFOzRCQUNQLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFOzRCQUMzQixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTt5QkFDM0I7cUJBQ0Q7b0JBQ0Q7d0JBQ0MsT0FBTyxFQUFFLElBQUk7d0JBQ2IsU0FBUyxFQUFFLENBQUM7d0JBQ1osU0FBUyxFQUFFLENBQUM7d0JBQ1osTUFBTSxFQUFFOzRCQUNQLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFO3lCQUMxQjtxQkFDRDtvQkFDRDt3QkFDQyxPQUFPLEVBQUUscUJBQXFCO3dCQUM5QixTQUFTLEVBQUUsQ0FBQzt3QkFDWixTQUFTLEVBQUUsRUFBRTt3QkFDYixNQUFNLEVBQUU7NEJBQ1AsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7NEJBQzFCLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFOzRCQUMxQixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTs0QkFDM0IsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7NEJBQzNCLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFO3lCQUMzQjtxQkFDRDtvQkFDRDt3QkFDQyxPQUFPLEVBQUUsdUJBQXVCO3dCQUNoQyxTQUFTLEVBQUUsQ0FBQzt3QkFDWixTQUFTLEVBQUUsRUFBRTt3QkFDYixNQUFNLEVBQUU7NEJBQ1AsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7NEJBQzFCLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFOzRCQUMxQixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTs0QkFDM0IsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7NEJBQzNCLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFOzRCQUMzQixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTt5QkFDM0I7cUJBQ0Q7b0JBQ0Q7d0JBQ0MsT0FBTyxFQUFFLCtCQUErQjt3QkFDeEMsU0FBUyxFQUFFLEVBQUU7d0JBQ2IsU0FBUyxFQUFFLEVBQUU7d0JBQ2IsTUFBTSxFQUFFOzRCQUNQLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFO3lCQUMzQjtxQkFDRDtvQkFDRDt3QkFDQyxPQUFPLEVBQUUsOEJBQThCO3dCQUN2QyxTQUFTLEVBQUUsRUFBRTt3QkFDYixTQUFTLEVBQUUsRUFBRTt3QkFDYixNQUFNLEVBQUU7NEJBQ1AsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7eUJBQzNCO3FCQUNEO29CQUNEO3dCQUNDLE9BQU8sRUFBRSxxQkFBcUI7d0JBQzlCLFNBQVMsRUFBRSxFQUFFO3dCQUNiLFNBQVMsRUFBRSxFQUFFO3dCQUNiLE1BQU0sRUFBRTs0QkFDUCxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTs0QkFDM0IsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7eUJBQzNCO3FCQUNEO29CQUNEO3dCQUNDLE9BQU8sRUFBRSxJQUFJO3dCQUNiLFNBQVMsRUFBRSxDQUFDO3dCQUNaLFNBQVMsRUFBRSxDQUFDO3dCQUNaLE1BQU0sRUFBRTs0QkFDUCxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTt5QkFDMUI7cUJBQ0Q7b0JBQ0Q7d0JBQ0MsT0FBTyxFQUFFLEdBQUc7d0JBQ1osU0FBUyxFQUFFLENBQUM7d0JBQ1osU0FBUyxFQUFFLENBQUM7d0JBQ1osTUFBTSxFQUFFOzRCQUNQLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFO3lCQUMxQjtxQkFDRDtpQkFDRCxDQUFDO2dCQUVGLGtDQUFrQyxDQUFDLG9CQUFvQixFQUFFO29CQUN4RCxTQUFTLENBQUMsQ0FBQyxDQUFDO29CQUNaLFNBQVMsQ0FBQyxDQUFDLENBQUM7b0JBQ1osU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDWixTQUFTLENBQUMsQ0FBQyxDQUFDO29CQUNaLFNBQVMsQ0FBQyxDQUFDLENBQUM7b0JBQ1osU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDWixTQUFTLENBQUMsQ0FBQyxDQUFDO29CQUNaLFNBQVMsQ0FBQyxDQUFDLENBQUM7b0JBQ1osU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDWixTQUFTLENBQUMsQ0FBQyxDQUFDO29CQUNaLFNBQVMsQ0FBQyxFQUFFLENBQUM7b0JBQ2IsU0FBUyxDQUFDLEVBQUUsQ0FBQztpQkFDYixDQUFDLENBQUM7Z0JBRUgsb0JBQW9CLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM3RCxNQUFNLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQy9ELE1BQU0sQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUM1RSxNQUFNLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLHNCQUFzQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDN0UsTUFBTSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzdFLE1BQU0sQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUM3RSxNQUFNLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLHNCQUFzQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDNUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzVFLE1BQU0sQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUM1RSxNQUFNLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLHNCQUFzQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFNUUsa0NBQWtDLENBQUMsb0JBQW9CLEVBQUU7b0JBQ3hELFNBQVMsQ0FBQyxDQUFDLENBQUM7b0JBQ1osU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDWixTQUFTLENBQUMsQ0FBQyxDQUFDO29CQUNaLFNBQVMsQ0FBQyxDQUFDLENBQUM7b0JBQ1osU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDWixTQUFTLENBQUMsQ0FBQyxDQUFDO29CQUNaLFNBQVMsQ0FBQyxFQUFFLENBQUM7b0JBQ2IsU0FBUyxDQUFDLEVBQUUsQ0FBQztpQkFDYixDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLG9EQUFvRCxFQUFFLEdBQUcsRUFBRTtZQUMvRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQzNCLEtBQUssRUFBRSxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQzVCLE9BQU8sRUFBRTt3QkFDUixXQUFXLEVBQUUsU0FBUzt3QkFDdEIsS0FBSyxFQUFFOzRCQUNOLE9BQU8sRUFBRSx1REFBdUQ7NEJBQ2hFLGVBQWUsRUFBRSxhQUFhO3lCQUM5Qjt3QkFDRCxlQUFlLEVBQUUsSUFBSTtxQkFDckI7aUJBQ0QsQ0FBQyxDQUFDLENBQUM7WUFFSix3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsZ0JBQWdCLEVBQUUsRUFBRSxFQUFFLENBQUMsb0JBQW9CLEVBQUUsRUFBRTtnQkFDOUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUVoRSxNQUFNLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUVyRSxNQUFNLFNBQVMsR0FBb0M7b0JBQ2xEO3dCQUNDLE9BQU8sRUFBRSx5QkFBeUI7d0JBQ2xDLFNBQVMsRUFBRSxDQUFDO3dCQUNaLFNBQVMsRUFBRSxFQUFFO3dCQUNiLE1BQU0sRUFBRTs0QkFDUCxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRTs0QkFDekIsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUU7NEJBQ3pCLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFOzRCQUN6QixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRTt5QkFDMUI7cUJBQ0Q7b0JBQ0Q7d0JBQ0MsT0FBTyxFQUFFLGdDQUFnQzt3QkFDekMsU0FBUyxFQUFFLENBQUM7d0JBQ1osU0FBUyxFQUFFLEVBQUU7d0JBQ2IsTUFBTSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztxQkFDcEM7b0JBQ0Q7d0JBQ0MsT0FBTyxFQUFFLHNCQUFzQjt3QkFDL0IsU0FBUyxFQUFFLENBQUM7d0JBQ1osU0FBUyxFQUFFLEVBQUU7d0JBQ2IsTUFBTSxFQUFFOzRCQUNQLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFOzRCQUMxQixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRTs0QkFDMUIsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUU7eUJBQzFCO3FCQUNEO29CQUNEO3dCQUNDLE9BQU8sRUFBRSxrQkFBa0I7d0JBQzNCLFNBQVMsRUFBRSxDQUFDO3dCQUNaLFNBQVMsRUFBRSxFQUFFO3dCQUNiLE1BQU0sRUFBRTs0QkFDUCxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRTs0QkFDekIsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUU7NEJBQ3pCLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFOzRCQUMxQixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRTs0QkFDMUIsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUU7eUJBQzFCO3FCQUNEO29CQUNEO3dCQUNDLE9BQU8sRUFBRSx1QkFBdUI7d0JBQ2hDLFNBQVMsRUFBRSxDQUFDO3dCQUNaLFNBQVMsRUFBRSxFQUFFO3dCQUNiLE1BQU0sRUFBRTs0QkFDUCxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTs0QkFDMUIsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7NEJBQzFCLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFOzRCQUMzQixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTs0QkFDM0IsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7NEJBQzNCLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFO3lCQUMzQjtxQkFDRDtvQkFDRDt3QkFDQyxPQUFPLEVBQUUsc0JBQXNCO3dCQUMvQixTQUFTLEVBQUUsRUFBRTt3QkFDYixTQUFTLEVBQUUsRUFBRTt3QkFDYixNQUFNLEVBQUU7NEJBQ1AsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7NEJBQzNCLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFO3lCQUMzQjtxQkFDRDtvQkFDRDt3QkFDQyxPQUFPLEVBQUUsSUFBSTt3QkFDYixTQUFTLEVBQUUsQ0FBQzt3QkFDWixTQUFTLEVBQUUsQ0FBQzt3QkFDWixNQUFNLEVBQUU7NEJBQ1AsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7eUJBQzFCO3FCQUNEO29CQUNEO3dCQUNDLE9BQU8sRUFBRSxxQkFBcUI7d0JBQzlCLFNBQVMsRUFBRSxDQUFDO3dCQUNaLFNBQVMsRUFBRSxFQUFFO3dCQUNiLE1BQU0sRUFBRTs0QkFDUCxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTs0QkFDMUIsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7NEJBQzFCLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFOzRCQUMzQixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTs0QkFDM0IsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7eUJBQzNCO3FCQUNEO29CQUNEO3dCQUNDLE9BQU8sRUFBRSx1QkFBdUI7d0JBQ2hDLFNBQVMsRUFBRSxDQUFDO3dCQUNaLFNBQVMsRUFBRSxFQUFFO3dCQUNiLE1BQU0sRUFBRTs0QkFDUCxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTs0QkFDMUIsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7NEJBQzFCLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFOzRCQUMzQixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTs0QkFDM0IsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7NEJBQzNCLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFO3lCQUMzQjtxQkFDRDtvQkFDRDt3QkFDQyxPQUFPLEVBQUUsK0JBQStCO3dCQUN4QyxTQUFTLEVBQUUsRUFBRTt3QkFDYixTQUFTLEVBQUUsRUFBRTt3QkFDYixNQUFNLEVBQUU7NEJBQ1AsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7eUJBQzNCO3FCQUNEO29CQUNEO3dCQUNDLE9BQU8sRUFBRSw4QkFBOEI7d0JBQ3ZDLFNBQVMsRUFBRSxFQUFFO3dCQUNiLFNBQVMsRUFBRSxFQUFFO3dCQUNiLE1BQU0sRUFBRTs0QkFDUCxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTt5QkFDM0I7cUJBQ0Q7b0JBQ0Q7d0JBQ0MsT0FBTyxFQUFFLHFCQUFxQjt3QkFDOUIsU0FBUyxFQUFFLEVBQUU7d0JBQ2IsU0FBUyxFQUFFLEVBQUU7d0JBQ2IsTUFBTSxFQUFFOzRCQUNQLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFOzRCQUMzQixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTt5QkFDM0I7cUJBQ0Q7b0JBQ0Q7d0JBQ0MsT0FBTyxFQUFFLElBQUk7d0JBQ2IsU0FBUyxFQUFFLENBQUM7d0JBQ1osU0FBUyxFQUFFLENBQUM7d0JBQ1osTUFBTSxFQUFFOzRCQUNQLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFO3lCQUMxQjtxQkFDRDtvQkFDRDt3QkFDQyxPQUFPLEVBQUUsR0FBRzt3QkFDWixTQUFTLEVBQUUsQ0FBQzt3QkFDWixTQUFTLEVBQUUsQ0FBQzt3QkFDWixNQUFNLEVBQUU7NEJBQ1AsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7eUJBQzFCO3FCQUNEO2lCQUNELENBQUM7Z0JBRUYsa0NBQWtDLENBQUMsb0JBQW9CLEVBQUU7b0JBQ3hELFNBQVMsQ0FBQyxDQUFDLENBQUM7b0JBQ1osU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDWixTQUFTLENBQUMsQ0FBQyxDQUFDO29CQUNaLFNBQVMsQ0FBQyxDQUFDLENBQUM7b0JBQ1osU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDWixTQUFTLENBQUMsQ0FBQyxDQUFDO29CQUNaLFNBQVMsQ0FBQyxDQUFDLENBQUM7b0JBQ1osU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDWixTQUFTLENBQUMsQ0FBQyxDQUFDO29CQUNaLFNBQVMsQ0FBQyxDQUFDLENBQUM7b0JBQ1osU0FBUyxDQUFDLEVBQUUsQ0FBQztvQkFDYixTQUFTLENBQUMsRUFBRSxDQUFDO2lCQUNiLENBQUMsQ0FBQztnQkFFSCxNQUFNLElBQUksR0FBRyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNwRixNQUFNLENBQUMsZUFBZSxDQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUNoQixpQkFBaUIsRUFBRSxDQUFDLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO3dCQUNuRCxXQUFXLEVBQUUsQ0FBQyxDQUFDLFdBQVc7d0JBQzFCLFNBQVMsRUFBRSxDQUFDLENBQUMsU0FBUztxQkFDdEIsQ0FBQyxDQUFDO2lCQUNILENBQUMsQ0FBQyxFQUNIO29CQUNDLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUU7b0JBQzFELEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUU7b0JBQzFELEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUU7b0JBQzFELEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFFO29CQUNoQyxFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBRTtvQkFDaEMsRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUU7b0JBQ2hDLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFFO29CQUNoQyxFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBRTtvQkFDaEMsRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUU7b0JBQ2hDLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFFO29CQUNoQyxFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBRTtvQkFDaEMsRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUU7b0JBQ2hDLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFFO29CQUNoQyxFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBRTtpQkFDaEMsQ0FDRCxDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVILFNBQVMsd0JBQXdCLENBQUMsS0FBZ0IsRUFBRSxRQUFxRCxFQUFFLGNBQXNCLEVBQUUsUUFBMEU7WUFDNU0sTUFBTSxhQUFhLEdBQUcsSUFBSSxxQ0FBaUIsQ0FBQztnQkFDM0MsUUFBUSxFQUFFLFFBQVE7Z0JBQ2xCLGNBQWMsRUFBRSxjQUFjO2dCQUM5QixjQUFjLEVBQUUsUUFBUTthQUN4QixDQUFDLENBQUM7WUFDSCxNQUFNLFlBQVksR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLEdBQUcscUNBQTJCLENBQUM7WUFDMUUsTUFBTSxRQUFRLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLGdDQUF1QixDQUFDO1lBQ2xFLE1BQU0sNEJBQTRCLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLHFEQUEyQyxDQUFDO1lBQzFHLE1BQU0sNkJBQTZCLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLHNEQUE0QyxDQUFDO1lBQzVHLE1BQU0sY0FBYyxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyx1Q0FBNkIsQ0FBQztZQUM5RSxNQUFNLFNBQVMsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLEdBQUcsa0NBQXdCLENBQUM7WUFFcEUsTUFBTSx5QkFBeUIsR0FBRyxJQUFJLGdFQUFrQyxDQUFDLDZCQUE2QixFQUFFLDRCQUE0QixDQUFDLENBQUM7WUFFdEksTUFBTSxlQUFlLEdBQUcsSUFBSSxpREFBZ0MsQ0FDM0QsQ0FBQyxFQUNELEtBQUssRUFDTCx5QkFBeUIsRUFDekIseUJBQXlCLEVBQ3pCLFFBQVEsRUFDUixLQUFLLENBQUMsVUFBVSxFQUFFLENBQUMsT0FBTyxFQUMxQixRQUFRLEVBQ1IsWUFBWSxDQUFDLGNBQWMsRUFDM0IsY0FBYyxFQUNkLFNBQVMsQ0FDVCxDQUFDO1lBRUYsUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBRTFCLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN6QixDQUFDO0lBQ0YsQ0FBQyxDQUFDLENBQUM7SUFHSCxTQUFTLEdBQUcsQ0FBQyxVQUFrQixFQUFFLE1BQWM7UUFDOUMsT0FBTyxJQUFJLG1CQUFRLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRCxTQUFTLGVBQWUsQ0FBQyxZQUFzQixFQUFFLDRCQUFzQyxFQUFFLHNCQUE4QixFQUFFLFlBQXFCLElBQUk7UUFDakosT0FBTyxJQUFBLCtDQUF5QixFQUFDLG1CQUFtQixDQUFDLFlBQVksRUFBRSw0QkFBNEIsRUFBRSxzQkFBc0IsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3RJLENBQUM7SUFFRCxTQUFTLG1CQUFtQixDQUFDLGVBQXlCLEVBQUUsNEJBQXNDLEVBQUUsc0JBQThCO1FBQzdILE1BQU0sSUFBSSxHQUFhLEVBQUUsQ0FBQztRQUMxQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNoRCxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDekQ7UUFDRCxPQUFPLElBQUksaURBQXVCLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsNEJBQTRCLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztJQUM1RyxDQUFDO0lBRUQsU0FBUyxXQUFXLENBQUMsSUFBWTtRQUNoQyxPQUFPO1lBQ04sWUFBWSxFQUFFO2dCQUNiLGFBQWEsRUFBRSxDQUFDLFVBQWtCLEVBQUUsRUFBRTtvQkFDckMsT0FBTyxJQUFLLENBQUM7Z0JBQ2QsQ0FBQzthQUNEO1lBQ0QsY0FBYyxFQUFFLENBQUMsVUFBa0IsRUFBRSxFQUFFO2dCQUN0QyxPQUFPLElBQUksQ0FBQztZQUNiLENBQUM7WUFDRCxhQUFhLEVBQUUsQ0FBQyxVQUFrQixFQUFFLEVBQUU7Z0JBQ3JDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUNwQixDQUFDO1lBQ0QsZ0JBQWdCLEVBQUUsQ0FBQyxVQUFrQixFQUFFLEVBQUU7Z0JBQ3hDLE9BQU8sQ0FBQyxDQUFDO1lBQ1YsQ0FBQztZQUNELGdCQUFnQixFQUFFLENBQUMsVUFBa0IsRUFBRSxFQUFFO2dCQUN4QyxPQUFPLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLENBQUM7WUFDRCxlQUFlLEVBQUUsQ0FBQyxLQUFhLEVBQUUsR0FBeUIsRUFBRSxFQUFFO2dCQUM3RCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFdBQVcsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNuRSxDQUFDO1NBQ0QsQ0FBQztJQUNILENBQUMifQ==