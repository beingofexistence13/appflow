/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/common/core/range", "vs/editor/common/model", "vs/workbench/services/search/common/searchHelpers"], function (require, exports, assert, range_1, model_1, searchHelpers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('SearchHelpers', () => {
        suite('editorMatchesToTextSearchResults', () => {
            const mockTextModel = {
                getLineContent(lineNumber) {
                    return '' + lineNumber;
                }
            };
            function assertRangesEqual(actual, expected) {
                if (!Array.isArray(actual)) {
                    // All of these tests are for arrays...
                    throw new Error('Expected array of ranges');
                }
                assert.strictEqual(actual.length, expected.length);
                // These are sometimes Range, sometimes SearchRange
                actual.forEach((r, i) => {
                    const expectedRange = expected[i];
                    assert.deepStrictEqual({ startLineNumber: r.startLineNumber, startColumn: r.startColumn, endLineNumber: r.endLineNumber, endColumn: r.endColumn }, { startLineNumber: expectedRange.startLineNumber, startColumn: expectedRange.startColumn, endLineNumber: expectedRange.endLineNumber, endColumn: expectedRange.endColumn });
                });
            }
            test('simple', () => {
                const results = (0, searchHelpers_1.$NMb)([new model_1.$Bu(new range_1.$ks(6, 1, 6, 2), null)], mockTextModel);
                assert.strictEqual(results.length, 1);
                assert.strictEqual(results[0].preview.text, '6\n');
                assertRangesEqual(results[0].preview.matches, [new range_1.$ks(0, 0, 0, 1)]);
                assertRangesEqual(results[0].ranges, [new range_1.$ks(5, 0, 5, 1)]);
            });
            test('multiple', () => {
                const results = (0, searchHelpers_1.$NMb)([
                    new model_1.$Bu(new range_1.$ks(6, 1, 6, 2), null),
                    new model_1.$Bu(new range_1.$ks(6, 4, 8, 2), null),
                    new model_1.$Bu(new range_1.$ks(9, 1, 10, 3), null),
                ], mockTextModel);
                assert.strictEqual(results.length, 2);
                assertRangesEqual(results[0].preview.matches, [
                    new range_1.$ks(0, 0, 0, 1),
                    new range_1.$ks(0, 3, 2, 1),
                ]);
                assertRangesEqual(results[0].ranges, [
                    new range_1.$ks(5, 0, 5, 1),
                    new range_1.$ks(5, 3, 7, 1),
                ]);
                assert.strictEqual(results[0].preview.text, '6\n7\n8\n');
                assertRangesEqual(results[1].preview.matches, [
                    new range_1.$ks(0, 0, 1, 2),
                ]);
                assertRangesEqual(results[1].ranges, [
                    new range_1.$ks(8, 0, 9, 2),
                ]);
                assert.strictEqual(results[1].preview.text, '9\n10\n');
            });
        });
        suite('addContextToEditorMatches', () => {
            const MOCK_LINE_COUNT = 100;
            const mockTextModel = {
                getLineContent(lineNumber) {
                    if (lineNumber < 1 || lineNumber > MOCK_LINE_COUNT) {
                        throw new Error(`invalid line count: ${lineNumber}`);
                    }
                    return '' + lineNumber;
                },
                getLineCount() {
                    return MOCK_LINE_COUNT;
                }
            };
            function getQuery(beforeContext, afterContext) {
                return {
                    folderQueries: [],
                    type: 2 /* QueryType.Text */,
                    contentPattern: { pattern: 'test' },
                    beforeContext,
                    afterContext
                };
            }
            test('no context', () => {
                const matches = [{
                        preview: {
                            text: 'foo',
                            matches: new range_1.$ks(0, 0, 0, 10)
                        },
                        ranges: new range_1.$ks(0, 0, 0, 10)
                    }];
                assert.deepStrictEqual((0, searchHelpers_1.$OMb)(matches, mockTextModel, getQuery()), matches);
            });
            test('simple', () => {
                const matches = [{
                        preview: {
                            text: 'foo',
                            matches: new range_1.$ks(0, 0, 0, 10)
                        },
                        ranges: new range_1.$ks(1, 0, 1, 10)
                    }];
                assert.deepStrictEqual((0, searchHelpers_1.$OMb)(matches, mockTextModel, getQuery(1, 2)), [
                    {
                        text: '1',
                        lineNumber: 0
                    },
                    ...matches,
                    {
                        text: '3',
                        lineNumber: 2
                    },
                    {
                        text: '4',
                        lineNumber: 3
                    },
                ]);
            });
            test('multiple matches next to each other', () => {
                const matches = [
                    {
                        preview: {
                            text: 'foo',
                            matches: new range_1.$ks(0, 0, 0, 10)
                        },
                        ranges: new range_1.$ks(1, 0, 1, 10)
                    },
                    {
                        preview: {
                            text: 'bar',
                            matches: new range_1.$ks(0, 0, 0, 10)
                        },
                        ranges: new range_1.$ks(2, 0, 2, 10)
                    }
                ];
                assert.deepStrictEqual((0, searchHelpers_1.$OMb)(matches, mockTextModel, getQuery(1, 2)), [
                    {
                        text: '1',
                        lineNumber: 0
                    },
                    ...matches,
                    {
                        text: '4',
                        lineNumber: 3
                    },
                    {
                        text: '5',
                        lineNumber: 4
                    },
                ]);
            });
            test('boundaries', () => {
                const matches = [
                    {
                        preview: {
                            text: 'foo',
                            matches: new range_1.$ks(0, 0, 0, 10)
                        },
                        ranges: new range_1.$ks(0, 0, 0, 10)
                    },
                    {
                        preview: {
                            text: 'bar',
                            matches: new range_1.$ks(0, 0, 0, 10)
                        },
                        ranges: new range_1.$ks(MOCK_LINE_COUNT - 1, 0, MOCK_LINE_COUNT - 1, 10)
                    }
                ];
                assert.deepStrictEqual((0, searchHelpers_1.$OMb)(matches, mockTextModel, getQuery(1, 2)), [
                    matches[0],
                    {
                        text: '2',
                        lineNumber: 1
                    },
                    {
                        text: '3',
                        lineNumber: 2
                    },
                    {
                        text: '' + (MOCK_LINE_COUNT - 1),
                        lineNumber: MOCK_LINE_COUNT - 2
                    },
                    matches[1]
                ]);
            });
        });
    });
});
//# sourceMappingURL=searchHelpers.test.js.map