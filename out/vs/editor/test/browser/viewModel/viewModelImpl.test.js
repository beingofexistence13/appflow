/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/viewEventHandler", "vs/editor/test/browser/viewModel/testViewModel"], function (require, exports, assert, utils_1, position_1, range_1, viewEventHandler_1, testViewModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ViewModel', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('issue #21073: SplitLinesCollection: attempt to access a \'newer\' model', () => {
            const text = [''];
            const opts = {
                lineNumbersMinChars: 1
            };
            (0, testViewModel_1.testViewModel)(text, opts, (viewModel, model) => {
                assert.strictEqual(viewModel.getLineCount(), 1);
                viewModel.setViewport(1, 1, 1);
                model.applyEdits([{
                        range: new range_1.Range(1, 1, 1, 1),
                        text: [
                            'line01',
                            'line02',
                            'line03',
                            'line04',
                            'line05',
                            'line06',
                            'line07',
                            'line08',
                            'line09',
                            'line10',
                        ].join('\n')
                    }]);
                assert.strictEqual(viewModel.getLineCount(), 10);
            });
        });
        test('issue #44805: SplitLinesCollection: attempt to access a \'newer\' model', () => {
            const text = [''];
            (0, testViewModel_1.testViewModel)(text, {}, (viewModel, model) => {
                assert.strictEqual(viewModel.getLineCount(), 1);
                model.pushEditOperations([], [{
                        range: new range_1.Range(1, 1, 1, 1),
                        text: '\ninsert1'
                    }], () => ([]));
                model.pushEditOperations([], [{
                        range: new range_1.Range(1, 1, 1, 1),
                        text: '\ninsert2'
                    }], () => ([]));
                model.pushEditOperations([], [{
                        range: new range_1.Range(1, 1, 1, 1),
                        text: '\ninsert3'
                    }], () => ([]));
                const viewLineCount = [];
                viewLineCount.push(viewModel.getLineCount());
                const eventHandler = new class extends viewEventHandler_1.ViewEventHandler {
                    handleEvents(events) {
                        // Access the view model
                        viewLineCount.push(viewModel.getLineCount());
                    }
                };
                viewModel.addViewEventHandler(eventHandler);
                model.undo();
                viewLineCount.push(viewModel.getLineCount());
                assert.deepStrictEqual(viewLineCount, [4, 1, 1, 1, 1]);
                viewModel.removeViewEventHandler(eventHandler);
                eventHandler.dispose();
            });
        });
        test('issue #44805: No visible lines via API call', () => {
            const text = [
                'line1',
                'line2',
                'line3'
            ];
            (0, testViewModel_1.testViewModel)(text, {}, (viewModel, model) => {
                assert.strictEqual(viewModel.getLineCount(), 3);
                viewModel.setHiddenAreas([new range_1.Range(1, 1, 3, 1)]);
                assert.ok(viewModel.getVisibleRanges() !== null);
            });
        });
        test('issue #44805: No visible lines via undoing', () => {
            const text = [
                ''
            ];
            (0, testViewModel_1.testViewModel)(text, {}, (viewModel, model) => {
                assert.strictEqual(viewModel.getLineCount(), 1);
                model.pushEditOperations([], [{
                        range: new range_1.Range(1, 1, 1, 1),
                        text: 'line1\nline2\nline3'
                    }], () => ([]));
                viewModel.setHiddenAreas([new range_1.Range(1, 1, 1, 1)]);
                assert.strictEqual(viewModel.getLineCount(), 2);
                model.undo();
                assert.ok(viewModel.getVisibleRanges() !== null);
            });
        });
        function assertGetPlainTextToCopy(text, ranges, emptySelectionClipboard, expected) {
            (0, testViewModel_1.testViewModel)(text, {}, (viewModel, model) => {
                const actual = viewModel.getPlainTextToCopy(ranges, emptySelectionClipboard, false);
                assert.deepStrictEqual(actual, expected);
            });
        }
        const USUAL_TEXT = [
            '',
            'line2',
            'line3',
            'line4',
            ''
        ];
        test('getPlainTextToCopy 0/1', () => {
            assertGetPlainTextToCopy(USUAL_TEXT, [
                new range_1.Range(2, 2, 2, 2)
            ], false, '');
        });
        test('getPlainTextToCopy 0/1 - emptySelectionClipboard', () => {
            assertGetPlainTextToCopy(USUAL_TEXT, [
                new range_1.Range(2, 2, 2, 2)
            ], true, 'line2\n');
        });
        test('getPlainTextToCopy 1/1', () => {
            assertGetPlainTextToCopy(USUAL_TEXT, [
                new range_1.Range(2, 2, 2, 6)
            ], false, 'ine2');
        });
        test('getPlainTextToCopy 1/1 - emptySelectionClipboard', () => {
            assertGetPlainTextToCopy(USUAL_TEXT, [
                new range_1.Range(2, 2, 2, 6)
            ], true, 'ine2');
        });
        test('getPlainTextToCopy 0/2', () => {
            assertGetPlainTextToCopy(USUAL_TEXT, [
                new range_1.Range(2, 2, 2, 2),
                new range_1.Range(3, 2, 3, 2),
            ], false, '');
        });
        test('getPlainTextToCopy 0/2 - emptySelectionClipboard', () => {
            assertGetPlainTextToCopy(USUAL_TEXT, [
                new range_1.Range(2, 2, 2, 2),
                new range_1.Range(3, 2, 3, 2),
            ], true, 'line2\nline3\n');
        });
        test('getPlainTextToCopy 1/2', () => {
            assertGetPlainTextToCopy(USUAL_TEXT, [
                new range_1.Range(2, 2, 2, 6),
                new range_1.Range(3, 2, 3, 2),
            ], false, 'ine2');
        });
        test('getPlainTextToCopy 1/2 - emptySelectionClipboard', () => {
            assertGetPlainTextToCopy(USUAL_TEXT, [
                new range_1.Range(2, 2, 2, 6),
                new range_1.Range(3, 2, 3, 2),
            ], true, ['ine2', 'line3']);
        });
        test('getPlainTextToCopy 2/2', () => {
            assertGetPlainTextToCopy(USUAL_TEXT, [
                new range_1.Range(2, 2, 2, 6),
                new range_1.Range(3, 2, 3, 6),
            ], false, ['ine2', 'ine3']);
        });
        test('getPlainTextToCopy 2/2 reversed', () => {
            assertGetPlainTextToCopy(USUAL_TEXT, [
                new range_1.Range(3, 2, 3, 6),
                new range_1.Range(2, 2, 2, 6),
            ], false, ['ine2', 'ine3']);
        });
        test('getPlainTextToCopy 0/3 - emptySelectionClipboard', () => {
            assertGetPlainTextToCopy(USUAL_TEXT, [
                new range_1.Range(2, 2, 2, 2),
                new range_1.Range(2, 3, 2, 3),
                new range_1.Range(3, 2, 3, 2),
            ], true, 'line2\nline3\n');
        });
        test('issue #22688 - always use CRLF for clipboard on Windows', () => {
            (0, testViewModel_1.testViewModel)(USUAL_TEXT, {}, (viewModel, model) => {
                model.setEOL(0 /* EndOfLineSequence.LF */);
                const actual = viewModel.getPlainTextToCopy([new range_1.Range(2, 1, 5, 1)], true, true);
                assert.deepStrictEqual(actual, 'line2\r\nline3\r\nline4\r\n');
            });
        });
        test('issue #40926: Incorrect spacing when inserting new line after multiple folded blocks of code', () => {
            (0, testViewModel_1.testViewModel)([
                'foo = {',
                '    foobar: function() {',
                '        this.foobar();',
                '    },',
                '    foobar: function() {',
                '        this.foobar();',
                '    },',
                '    foobar: function() {',
                '        this.foobar();',
                '    },',
                '}',
            ], {}, (viewModel, model) => {
                viewModel.setHiddenAreas([
                    new range_1.Range(3, 1, 3, 1),
                    new range_1.Range(6, 1, 6, 1),
                    new range_1.Range(9, 1, 9, 1),
                ]);
                model.applyEdits([
                    { range: new range_1.Range(4, 7, 4, 7), text: '\n    ' },
                    { range: new range_1.Range(7, 7, 7, 7), text: '\n    ' },
                    { range: new range_1.Range(10, 7, 10, 7), text: '\n    ' }
                ]);
                assert.strictEqual(viewModel.getLineCount(), 11);
            });
        });
        test('normalizePosition with multiple touching injected text', () => {
            (0, testViewModel_1.testViewModel)([
                'just some text'
            ], {}, (viewModel, model) => {
                model.deltaDecorations([], [
                    {
                        range: new range_1.Range(1, 8, 1, 8),
                        options: {
                            description: 'test',
                            before: {
                                content: 'bar'
                            },
                            showIfCollapsed: true
                        }
                    },
                    {
                        range: new range_1.Range(1, 8, 1, 8),
                        options: {
                            description: 'test',
                            before: {
                                content: 'bz'
                            },
                            showIfCollapsed: true
                        }
                    },
                ]);
                // just sobarbzme text
                assert.deepStrictEqual(viewModel.normalizePosition(new position_1.Position(1, 8), 2 /* PositionAffinity.None */), new position_1.Position(1, 8));
                assert.deepStrictEqual(viewModel.normalizePosition(new position_1.Position(1, 9), 2 /* PositionAffinity.None */), new position_1.Position(1, 8));
                assert.deepStrictEqual(viewModel.normalizePosition(new position_1.Position(1, 11), 2 /* PositionAffinity.None */), new position_1.Position(1, 11));
                assert.deepStrictEqual(viewModel.normalizePosition(new position_1.Position(1, 12), 2 /* PositionAffinity.None */), new position_1.Position(1, 11));
                assert.deepStrictEqual(viewModel.normalizePosition(new position_1.Position(1, 13), 2 /* PositionAffinity.None */), new position_1.Position(1, 13));
                assert.deepStrictEqual(viewModel.normalizePosition(new position_1.Position(1, 8), 0 /* PositionAffinity.Left */), new position_1.Position(1, 8));
                assert.deepStrictEqual(viewModel.normalizePosition(new position_1.Position(1, 9), 0 /* PositionAffinity.Left */), new position_1.Position(1, 8));
                assert.deepStrictEqual(viewModel.normalizePosition(new position_1.Position(1, 11), 0 /* PositionAffinity.Left */), new position_1.Position(1, 8));
                assert.deepStrictEqual(viewModel.normalizePosition(new position_1.Position(1, 12), 0 /* PositionAffinity.Left */), new position_1.Position(1, 8));
                assert.deepStrictEqual(viewModel.normalizePosition(new position_1.Position(1, 13), 0 /* PositionAffinity.Left */), new position_1.Position(1, 8));
                assert.deepStrictEqual(viewModel.normalizePosition(new position_1.Position(1, 8), 1 /* PositionAffinity.Right */), new position_1.Position(1, 13));
                assert.deepStrictEqual(viewModel.normalizePosition(new position_1.Position(1, 9), 1 /* PositionAffinity.Right */), new position_1.Position(1, 13));
                assert.deepStrictEqual(viewModel.normalizePosition(new position_1.Position(1, 11), 1 /* PositionAffinity.Right */), new position_1.Position(1, 13));
                assert.deepStrictEqual(viewModel.normalizePosition(new position_1.Position(1, 12), 1 /* PositionAffinity.Right */), new position_1.Position(1, 13));
                assert.deepStrictEqual(viewModel.normalizePosition(new position_1.Position(1, 13), 1 /* PositionAffinity.Right */), new position_1.Position(1, 13));
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld01vZGVsSW1wbC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3Rlc3QvYnJvd3Nlci92aWV3TW9kZWwvdmlld01vZGVsSW1wbC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBV2hHLEtBQUssQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFO1FBRXZCLElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUUxQyxJQUFJLENBQUMseUVBQXlFLEVBQUUsR0FBRyxFQUFFO1lBQ3BGLE1BQU0sSUFBSSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbEIsTUFBTSxJQUFJLEdBQUc7Z0JBQ1osbUJBQW1CLEVBQUUsQ0FBQzthQUN0QixDQUFDO1lBQ0YsSUFBQSw2QkFBYSxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLEVBQUU7Z0JBQzlDLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUVoRCxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBRS9CLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQzt3QkFDakIsS0FBSyxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDNUIsSUFBSSxFQUFFOzRCQUNMLFFBQVE7NEJBQ1IsUUFBUTs0QkFDUixRQUFROzRCQUNSLFFBQVE7NEJBQ1IsUUFBUTs0QkFDUixRQUFROzRCQUNSLFFBQVE7NEJBQ1IsUUFBUTs0QkFDUixRQUFROzRCQUNSLFFBQVE7eUJBQ1IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO3FCQUNaLENBQUMsQ0FBQyxDQUFDO2dCQUVKLE1BQU0sQ0FBQyxXQUFX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