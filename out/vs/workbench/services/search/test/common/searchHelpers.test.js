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
                const results = (0, searchHelpers_1.editorMatchesToTextSearchResults)([new model_1.FindMatch(new range_1.Range(6, 1, 6, 2), null)], mockTextModel);
                assert.strictEqual(results.length, 1);
                assert.strictEqual(results[0].preview.text, '6\n');
                assertRangesEqual(results[0].preview.matches, [new range_1.Range(0, 0, 0, 1)]);
                assertRangesEqual(results[0].ranges, [new range_1.Range(5, 0, 5, 1)]);
            });
            test('multiple', () => {
                const results = (0, searchHelpers_1.editorMatchesToTextSearchResults)([
                    new model_1.FindMatch(new range_1.Range(6, 1, 6, 2), null),
                    new model_1.FindMatch(new range_1.Range(6, 4, 8, 2), null),
                    new model_1.FindMatch(new range_1.Range(9, 1, 10, 3), null),
                ], mockTextModel);
                assert.strictEqual(results.length, 2);
                assertRangesEqual(results[0].preview.matches, [
                    new range_1.Range(0, 0, 0, 1),
                    new range_1.Range(0, 3, 2, 1),
                ]);
                assertRangesEqual(results[0].ranges, [
                    new range_1.Range(5, 0, 5, 1),
                    new range_1.Range(5, 3, 7, 1),
                ]);
                assert.strictEqual(results[0].preview.text, '6\n7\n8\n');
                assertRangesEqual(results[1].preview.matches, [
                    new range_1.Range(0, 0, 1, 2),
                ]);
                assertRangesEqual(results[1].ranges, [
                    new range_1.Range(8, 0, 9, 2),
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
                            matches: new range_1.Range(0, 0, 0, 10)
                        },
                        ranges: new range_1.Range(0, 0, 0, 10)
                    }];
                assert.deepStrictEqual((0, searchHelpers_1.addContextToEditorMatches)(matches, mockTextModel, getQuery()), matches);
            });
            test('simple', () => {
                const matches = [{
                        preview: {
                            text: 'foo',
                            matches: new range_1.Range(0, 0, 0, 10)
                        },
                        ranges: new range_1.Range(1, 0, 1, 10)
                    }];
                assert.deepStrictEqual((0, searchHelpers_1.addContextToEditorMatches)(matches, mockTextModel, getQuery(1, 2)), [
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
                            matches: new range_1.Range(0, 0, 0, 10)
                        },
                        ranges: new range_1.Range(1, 0, 1, 10)
                    },
                    {
                        preview: {
                            text: 'bar',
                            matches: new range_1.Range(0, 0, 0, 10)
                        },
                        ranges: new range_1.Range(2, 0, 2, 10)
                    }
                ];
                assert.deepStrictEqual((0, searchHelpers_1.addContextToEditorMatches)(matches, mockTextModel, getQuery(1, 2)), [
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
                            matches: new range_1.Range(0, 0, 0, 10)
                        },
                        ranges: new range_1.Range(0, 0, 0, 10)
                    },
                    {
                        preview: {
                            text: 'bar',
                            matches: new range_1.Range(0, 0, 0, 10)
                        },
                        ranges: new range_1.Range(MOCK_LINE_COUNT - 1, 0, MOCK_LINE_COUNT - 1, 10)
                    }
                ];
                assert.deepStrictEqual((0, searchHelpers_1.addContextToEditorMatches)(matches, mockTextModel, getQuery(1, 2)), [
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoSGVscGVycy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3NlYXJjaC90ZXN0L2NvbW1vbi9zZWFyY2hIZWxwZXJzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFRaEcsS0FBSyxDQUFDLGVBQWUsRUFBRSxHQUFHLEVBQUU7UUFDM0IsS0FBSyxDQUFDLGtDQUFrQyxFQUFFLEdBQUcsRUFBRTtZQUM5QyxNQUFNLGFBQWEsR0FBMkI7Z0JBQzdDLGNBQWMsQ0FBQyxVQUFrQjtvQkFDaEMsT0FBTyxFQUFFLEdBQUcsVUFBVSxDQUFDO2dCQUN4QixDQUFDO2FBQ0QsQ0FBQztZQUVGLFNBQVMsaUJBQWlCLENBQUMsTUFBcUMsRUFBRSxRQUF3QjtnQkFDekYsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7b0JBQzNCLHVDQUF1QztvQkFDdkMsTUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO2lCQUM1QztnQkFFRCxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUVuRCxtREFBbUQ7Z0JBQ25ELE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3ZCLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDbEMsTUFBTSxDQUFDLGVBQWUsQ0FDckIsRUFBRSxlQUFlLEVBQUUsQ0FBQyxDQUFDLGVBQWUsRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxhQUFhLEVBQUUsQ0FBQyxDQUFDLGFBQWEsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUMxSCxFQUFFLGVBQWUsRUFBRSxh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