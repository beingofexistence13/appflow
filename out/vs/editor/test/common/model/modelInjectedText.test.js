/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/editOperation", "vs/editor/common/core/range", "vs/editor/common/textModelEvents", "vs/editor/test/common/testTextModel"], function (require, exports, assert, utils_1, editOperation_1, range_1, textModelEvents_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Editor Model - Injected Text Events', () => {
        const store = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('Basic', () => {
            const thisModel = store.add((0, testTextModel_1.createTextModel)('First Line\nSecond Line'));
            const recordedChanges = new Array();
            store.add(thisModel.onDidChangeContentOrInjectedText((e) => {
                const changes = (e instanceof textModelEvents_1.InternalModelContentChangeEvent ? e.rawContentChangedEvent.changes : e.changes);
                for (const change of changes) {
                    recordedChanges.push(mapChange(change));
                }
            }));
            // Initial decoration
            let decorations = thisModel.deltaDecorations([], [{
                    options: {
                        after: { content: 'injected1' },
                        description: 'test1',
                        showIfCollapsed: true
                    },
                    range: new range_1.Range(1, 1, 1, 1),
                }]);
            assert.deepStrictEqual(recordedChanges.splice(0), [
                {
                    kind: 'lineChanged',
                    line: '[injected1]First Line',
                    lineNumber: 1,
                }
            ]);
            // Decoration change
            decorations = thisModel.deltaDecorations(decorations, [{
                    options: {
                        after: { content: 'injected1' },
                        description: 'test1',
                        showIfCollapsed: true
                    },
                    range: new range_1.Range(2, 1, 2, 1),
                }, {
                    options: {
                        after: { content: 'injected2' },
                        description: 'test2',
                        showIfCollapsed: true
                    },
                    range: new range_1.Range(2, 2, 2, 2),
                }]);
            assert.deepStrictEqual(recordedChanges.splice(0), [
                {
                    kind: 'lineChanged',
                    line: 'First Line',
                    lineNumber: 1,
                },
                {
                    kind: 'lineChanged',
                    line: '[injected1]S[injected2]econd Line',
                    lineNumber: 2,
                }
            ]);
            // Simple Insert
            thisModel.applyEdits([editOperation_1.EditOperation.replace(new range_1.Range(2, 2, 2, 2), 'Hello')]);
            assert.deepStrictEqual(recordedChanges.splice(0), [
                {
                    kind: 'lineChanged',
                    line: '[injected1]SHello[injected2]econd Line',
                    lineNumber: 2,
                }
            ]);
            // Multi-Line Insert
            thisModel.pushEditOperations(null, [editOperation_1.EditOperation.replace(new range_1.Range(2, 2, 2, 2), '\n\n\n')], null);
            assert.deepStrictEqual(thisModel.getAllDecorations(undefined).map(d => ({ description: d.options.description, range: d.range.toString() })), [{
                    'description': 'test1',
                    'range': '[2,1 -> 2,1]'
                },
                {
                    'description': 'test2',
                    'range': '[2,2 -> 5,6]'
                }]);
            assert.deepStrictEqual(recordedChanges.splice(0), [
                {
                    kind: 'lineChanged',
                    line: '[injected1]S',
                    lineNumber: 2,
                },
                {
                    fromLineNumber: 3,
                    kind: 'linesInserted',
                    lines: [
                        '',
                        '',
                        'Hello[injected2]econd Line',
                    ]
                }
            ]);
            // Multi-Line Replace
            thisModel.pushEditOperations(null, [editOperation_1.EditOperation.replace(new range_1.Range(3, 1, 5, 1), '\n\n\n\n\n\n\n\n\n\n\n\n\n')], null);
            assert.deepStrictEqual(recordedChanges.splice(0), [
                {
                    'kind': 'lineChanged',
                    'line': '',
                    'lineNumber': 5,
                },
                {
                    'kind': 'lineChanged',
                    'line': '',
                    'lineNumber': 4,
                },
                {
                    'kind': 'lineChanged',
                    'line': '',
                    'lineNumber': 3,
                },
                {
                    'fromLineNumber': 6,
                    'kind': 'linesInserted',
                    'lines': [
                        '',
                        '',
                        '',
                        '',
                        '',
                        '',
                        '',
                        '',
                        '',
                        '',
                        'Hello[injected2]econd Line',
                    ]
                }
            ]);
            // Multi-Line Replace undo
            assert.strictEqual(thisModel.undo(), undefined);
            assert.deepStrictEqual(recordedChanges.splice(0), [
                {
                    kind: 'lineChanged',
                    line: '[injected1]SHello[injected2]econd Line',
                    lineNumber: 2,
                },
                {
                    kind: 'linesDeleted',
                }
            ]);
        });
    });
    function mapChange(change) {
        if (change.changeType === 2 /* RawContentChangedType.LineChanged */) {
            (change.injectedText || []).every(e => {
                assert.deepStrictEqual(e.lineNumber, change.lineNumber);
            });
            return {
                kind: 'lineChanged',
                line: getDetail(change.detail, change.injectedText),
                lineNumber: change.lineNumber,
            };
        }
        else if (change.changeType === 4 /* RawContentChangedType.LinesInserted */) {
            return {
                kind: 'linesInserted',
                lines: change.detail.map((e, idx) => getDetail(e, change.injectedTexts[idx])),
                fromLineNumber: change.fromLineNumber
            };
        }
        else if (change.changeType === 3 /* RawContentChangedType.LinesDeleted */) {
            return {
                kind: 'linesDeleted',
            };
        }
        else if (change.changeType === 5 /* RawContentChangedType.EOLChanged */) {
            return {
                kind: 'eolChanged'
            };
        }
        else if (change.changeType === 1 /* RawContentChangedType.Flush */) {
            return {
                kind: 'flush'
            };
        }
        return { kind: 'unknown' };
    }
    function getDetail(line, injectedTexts) {
        return textModelEvents_1.LineInjectedText.applyInjectedText(line, (injectedTexts || []).map(t => t.withText(`[${t.options.content}]`)));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWxJbmplY3RlZFRleHQudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci90ZXN0L2NvbW1vbi9tb2RlbC9tb2RlbEluamVjdGVkVGV4dC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBU2hHLEtBQUssQ0FBQyxxQ0FBcUMsRUFBRSxHQUFHLEVBQUU7UUFDakQsTUFBTSxLQUFLLEdBQUcsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRXhELElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO1lBQ2xCLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBQSwrQkFBZSxFQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQztZQUV4RSxNQUFNLGVBQWUsR0FBRyxJQUFJLEtBQUssRUFBVyxDQUFDO1lBRTdDLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGdDQUFnQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQzFELE1BQU0sT0FBTyxHQUFHLENBQUMsQ0FBQyxZQUFZLGlEQUErQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzlHLEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxFQUFFO29CQUM3QixlQUFlLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2lCQUN4QztZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixxQkFBcUI7WUFDckIsSUFBSSxXQUFXLEdBQUcsU0FBUyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUNqRCxPQUFPLEVBQUU7d0JBQ1IsS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRTt3QkFDL0IsV0FBVyxFQUFFLE9BQU87d0JBQ3BCLGVBQWUsRUFBRSxJQUFJO3FCQUNyQjtvQkFDRCxLQUFLLEVBQUUsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUM1QixDQUFDLENBQUMsQ0FBQztZQUNKLE1BQU0sQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDakQ7b0JBQ0MsSUFBSSxFQUFFLGFBQWE7b0JBQ25CLElBQUksRUFBRSx1QkFBdUI7b0JBQzdCLFVBQVUsRUFBRSxDQUFDO2lCQUNiO2FBQ0QsQ0FBQyxDQUFDO1lBRUgsb0JBQW9CO1lBQ3BCLFdBQVcsR0FBRyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLENBQUM7b0JBQ3RELE9BQU8sRUFBRTt3QkFDUixLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFO3dCQUMvQixXQUFXLEVBQUUsT0FBTzt3QkFDcEIsZUFBZSxFQUFFLElBQUk7cUJBQ3JCO29CQUNELEtBQUssRUFBRSxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQzVCLEVBQUU7b0JBQ0YsT0FBTyxFQUFFO3dCQUNSLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUU7d0JBQy9CLFdBQVcsRUFBRSxPQUFPO3dCQUNwQixlQUFlLEVBQUUsSUFBSTtxQkFDckI7b0JBQ0QsS0FBSyxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDNUIsQ0FBQyxDQUFDLENBQUM7WUFDSixNQUFNLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2pEO29CQUNDLElBQUksRUFBRSxhQUFhO29CQUNuQixJQUFJLEVBQUUsWUFBWTtvQkFDbEIsVUFBVSxFQUFFLENBQUM7aUJBQ2I7Z0JBQ0Q7b0JBQ0MsSUFBSSxFQUFFLGFBQWE7b0JBQ25CLElBQUksRUFBRSxtQ0FBbUM7b0JBQ3pDLFVBQVUsRUFBRSxDQUFDO2lCQUNiO2FBQ0QsQ0FBQyxDQUFDO1lBRUgsZ0JBQWdCO1lBQ2hCLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyw2QkFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUUsTUFBTSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNqRDtvQkFDQyxJQUFJLEVBQUUsYUFBYTtvQkFDbkIsSUFBSSxFQUFFLHdDQUF3QztvQkFDOUMsVUFBVSxFQUFFLENBQUM7aUJBQ2I7YUFDRCxDQUFDLENBQUM7WUFFSCxvQkFBb0I7WUFDcEIsU0FBUyxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxDQUFDLDZCQUFhLENBQUMsT0FBTyxDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDbkcsTUFBTSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO29CQUM3SSxhQUFhLEVBQUUsT0FBTztvQkFDdEIsT0FBTyxFQUFFLGNBQWM7aUJBQ3ZCO2dCQUNEO29CQUNDLGFBQWEsRUFBRSxPQUFPO29CQUN0QixPQUFPLEVBQUUsY0FBYztpQkFDdkIsQ0FBQyxDQUFDLENBQUM7WUFDSixNQUFNLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2pEO29CQUNDLElBQUksRUFBRSxhQUFhO29CQUNuQixJQUFJLEVBQUUsY0FBYztvQkFDcEIsVUFBVSxFQUFFLENBQUM7aUJBQ2I7Z0JBQ0Q7b0JBQ0MsY0FBYyxFQUFFLENBQUM7b0JBQ2pCLElBQUksRUFBRSxlQUFlO29CQUNyQixLQUFLLEVBQUU7d0JBQ04sRUFBRTt3QkFDRixFQUFFO3dCQUNGLDRCQUE0QjtxQkFDNUI7aUJBQ0Q7YUFDRCxDQUFDLENBQUM7WUFHSCxxQkFBcUI7WUFDckIsU0FBUyxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxDQUFDLDZCQUFhLENBQUMsT0FBTyxDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLDRCQUE0QixDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN2SCxNQUFNLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2pEO29CQUNDLE1BQU0sRUFBRSxhQUFhO29CQUNyQixNQUFNLEVBQUUsRUFBRTtvQkFDVixZQUFZLEVBQUUsQ0FBQztpQkFDZjtnQkFDRDtvQkFDQyxNQUFNLEVBQUUsYUFBYTtvQkFDckIsTUFBTSxFQUFFLEVBQUU7b0JBQ1YsWUFBWSxFQUFFLENBQUM7aUJBQ2Y7Z0JBQ0Q7b0JBQ0MsTUFBTSxFQUFFLGFBQWE7b0JBQ3JCLE1BQU0sRUFBRSxFQUFFO29CQUNWLFlBQVksRUFBRSxDQUFDO2lCQUNmO2dCQUNEO29CQUNDLGdCQUFnQixFQUFFLENBQUM7b0JBQ25CLE1BQU0sRUFBRSxlQUFlO29CQUN2QixPQUFPLEVBQUU7d0JBQ1IsRUFBRTt3QkFDRixFQUFFO3dCQUNGLEVBQUU7d0JBQ0YsRUFBRTt3QkFDRixFQUFFO3dCQUNGLEVBQUU7d0JBQ0YsRUFBRTt3QkFDRixFQUFFO3dCQUNGLEVBQUU7d0JBQ0YsRUFBRTt3QkFDRiw0QkFBNEI7cUJBQzVCO2lCQUNEO2FBQ0QsQ0FBQyxDQUFDO1lBRUgsMEJBQTBCO1lBQzFCLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ2hELE1BQU0sQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDakQ7b0JBQ0MsSUFBSSxFQUFFLGFBQWE7b0JBQ25CLElBQUksRUFBRSx3Q0FBd0M7b0JBQzlDLFVBQVUsRUFBRSxDQUFDO2lCQUNiO2dCQUNEO29CQUNDLElBQUksRUFBRSxjQUFjO2lCQUNwQjthQUNELENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUM7SUFFSCxTQUFTLFNBQVMsQ0FBQyxNQUFzQjtRQUN4QyxJQUFJLE1BQU0sQ0FBQyxVQUFVLDhDQUFzQyxFQUFFO1lBQzVELENBQUMsTUFBTSxDQUFDLFlBQVksSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3JDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDekQsQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPO2dCQUNOLElBQUksRUFBRSxhQUFhO2dCQUNuQixJQUFJLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQztnQkFDbkQsVUFBVSxFQUFFLE1BQU0sQ0FBQyxVQUFVO2FBQzdCLENBQUM7U0FDRjthQUFNLElBQUksTUFBTSxDQUFDLFVBQVUsZ0RBQXdDLEVBQUU7WUFDckUsT0FBTztnQkFDTixJQUFJLEVBQUUsZUFBZTtnQkFDckIsS0FBSyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQzdFLGNBQWMsRUFBRSxNQUFNLENBQUMsY0FBYzthQUNyQyxDQUFDO1NBQ0Y7YUFBTSxJQUFJLE1BQU0sQ0FBQyxVQUFVLCtDQUF1QyxFQUFFO1lBQ3BFLE9BQU87Z0JBQ04sSUFBSSxFQUFFLGNBQWM7YUFDcEIsQ0FBQztTQUNGO2FBQU0sSUFBSSxNQUFNLENBQUMsVUFBVSw2Q0FBcUMsRUFBRTtZQUNsRSxPQUFPO2dCQUNOLElBQUksRUFBRSxZQUFZO2FBQ2xCLENBQUM7U0FDRjthQUFNLElBQUksTUFBTSxDQUFDLFVBQVUsd0NBQWdDLEVBQUU7WUFDN0QsT0FBTztnQkFDTixJQUFJLEVBQUUsT0FBTzthQUNiLENBQUM7U0FDRjtRQUNELE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVELFNBQVMsU0FBUyxDQUFDLElBQVksRUFBRSxhQUF3QztRQUN4RSxPQUFPLGtDQUFnQixDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxDQUFDLGFBQWEsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2SCxDQUFDIn0=