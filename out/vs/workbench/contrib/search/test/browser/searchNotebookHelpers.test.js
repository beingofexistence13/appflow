/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/common/core/range", "vs/editor/common/model", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/search/browser/searchNotebookHelpers", "vs/workbench/contrib/notebook/browser/contrib/find/findModel", "vs/workbench/contrib/search/browser/searchModel", "vs/base/common/uri", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/contrib/search/test/browser/searchTestCommon", "vs/editor/common/services/model", "vs/workbench/contrib/notebook/browser/services/notebookEditorService"], function (require, exports, assert, range_1, model_1, notebookCommon_1, searchNotebookHelpers_1, findModel_1, searchModel_1, uri_1, instantiationServiceMock_1, searchTestCommon_1, model_2, notebookEditorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('searchNotebookHelpers', () => {
        let instantiationService;
        let mdCellFindMatch;
        let codeCellFindMatch;
        let mdInputCell;
        let codeCell;
        let markdownContentResults;
        let codeContentResults;
        let codeWebviewResults;
        let counter = 0;
        setup(() => {
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            instantiationService.stub(model_2.IModelService, (0, searchTestCommon_1.stubModelService)(instantiationService));
            instantiationService.stub(notebookEditorService_1.INotebookEditorService, (0, searchTestCommon_1.stubNotebookEditorService)(instantiationService));
            mdInputCell = {
                cellKind: notebookCommon_1.CellKind.Markup, textBuffer: {
                    getLineContent(lineNumber) {
                        if (lineNumber === 1) {
                            return '# Hello World Test';
                        }
                        else {
                            return '';
                        }
                    }
                }
            };
            const findMatchMds = [new model_1.FindMatch(new range_1.Range(1, 15, 1, 19), ['Test'])];
            codeCell = {
                cellKind: notebookCommon_1.CellKind.Code, textBuffer: {
                    getLineContent(lineNumber) {
                        if (lineNumber === 1) {
                            return 'print("test! testing!!")';
                        }
                        else if (lineNumber === 2) {
                            return 'print("this is a Test")';
                        }
                        else {
                            return '';
                        }
                    }
                }
            };
            const findMatchCodeCells = [new model_1.FindMatch(new range_1.Range(1, 8, 1, 12), ['test']),
                new model_1.FindMatch(new range_1.Range(1, 14, 1, 18), ['test']),
                new model_1.FindMatch(new range_1.Range(2, 18, 2, 22), ['Test'])
            ];
            const webviewMatches = [{
                    index: 0,
                    searchPreviewInfo: {
                        line: 'test! testing!!',
                        range: {
                            start: 1,
                            end: 5
                        }
                    }
                },
                {
                    index: 1,
                    searchPreviewInfo: {
                        line: 'test! testing!!',
                        range: {
                            start: 7,
                            end: 11
                        }
                    }
                },
                {
                    index: 3,
                    searchPreviewInfo: {
                        line: 'this is a Test',
                        range: {
                            start: 11,
                            end: 15
                        }
                    }
                }
            ];
            mdCellFindMatch = new findModel_1.CellFindMatchModel(mdInputCell, 0, findMatchMds, []);
            codeCellFindMatch = new findModel_1.CellFindMatchModel(codeCell, 5, findMatchCodeCells, webviewMatches);
        });
        teardown(() => {
            instantiationService.dispose();
        });
        suite('notebookEditorMatchesToTextSearchResults', () => {
            function assertRangesEqual(actual, expected) {
                if (!Array.isArray(actual)) {
                    actual = [actual];
                }
                assert.strictEqual(actual.length, expected.length);
                actual.forEach((r, i) => {
                    const expectedRange = expected[i];
                    assert.deepStrictEqual({ startLineNumber: r.startLineNumber, startColumn: r.startColumn, endLineNumber: r.endLineNumber, endColumn: r.endColumn }, { startLineNumber: expectedRange.startLineNumber, startColumn: expectedRange.startColumn, endLineNumber: expectedRange.endLineNumber, endColumn: expectedRange.endColumn });
                });
            }
            test('convert CellFindMatchModel to ITextSearchMatch and check results', () => {
                markdownContentResults = (0, searchNotebookHelpers_1.contentMatchesToTextSearchMatches)(mdCellFindMatch.contentMatches, mdInputCell);
                codeContentResults = (0, searchNotebookHelpers_1.contentMatchesToTextSearchMatches)(codeCellFindMatch.contentMatches, codeCell);
                codeWebviewResults = (0, searchNotebookHelpers_1.webviewMatchesToTextSearchMatches)(codeCellFindMatch.webviewMatches);
                assert.strictEqual(markdownContentResults.length, 1);
                assert.strictEqual(markdownContentResults[0].preview.text, '# Hello World Test\n');
                assertRangesEqual(markdownContentResults[0].preview.matches, [new range_1.Range(0, 14, 0, 18)]);
                assertRangesEqual(markdownContentResults[0].ranges, [new range_1.Range(0, 14, 0, 18)]);
                assert.strictEqual(codeContentResults.length, 2);
                assert.strictEqual(codeContentResults[0].preview.text, 'print("test! testing!!")\n');
                assert.strictEqual(codeContentResults[1].preview.text, 'print("this is a Test")\n');
                assertRangesEqual(codeContentResults[0].preview.matches, [new range_1.Range(0, 7, 0, 11), new range_1.Range(0, 13, 0, 17)]);
                assertRangesEqual(codeContentResults[0].ranges, [new range_1.Range(0, 7, 0, 11), new range_1.Range(0, 13, 0, 17)]);
                assert.strictEqual(codeWebviewResults.length, 3);
                assert.strictEqual(codeWebviewResults[0].preview.text, 'test! testing!!');
                assert.strictEqual(codeWebviewResults[1].preview.text, 'test! testing!!');
                assert.strictEqual(codeWebviewResults[2].preview.text, 'this is a Test');
                assertRangesEqual(codeWebviewResults[0].preview.matches, [new range_1.Range(0, 1, 0, 5)]);
                assertRangesEqual(codeWebviewResults[1].preview.matches, [new range_1.Range(0, 7, 0, 11)]);
                assertRangesEqual(codeWebviewResults[2].preview.matches, [new range_1.Range(0, 11, 0, 15)]);
                assertRangesEqual(codeWebviewResults[0].ranges, [new range_1.Range(0, 1, 0, 5)]);
                assertRangesEqual(codeWebviewResults[1].ranges, [new range_1.Range(0, 7, 0, 11)]);
                assertRangesEqual(codeWebviewResults[2].ranges, [new range_1.Range(0, 11, 0, 15)]);
            });
            test('convert ITextSearchMatch to MatchInNotebook', () => {
                const mdCellMatch = new searchModel_1.CellMatch(aFileMatch(), mdInputCell, 0);
                const markdownCellContentMatchObjs = (0, searchModel_1.textSearchMatchesToNotebookMatches)(markdownContentResults, mdCellMatch);
                const codeCellMatch = new searchModel_1.CellMatch(aFileMatch(), codeCell, 0);
                const codeCellContentMatchObjs = (0, searchModel_1.textSearchMatchesToNotebookMatches)(codeContentResults, codeCellMatch);
                const codeWebviewContentMatchObjs = (0, searchModel_1.textSearchMatchesToNotebookMatches)(codeWebviewResults, codeCellMatch);
                assert.strictEqual(markdownCellContentMatchObjs[0].cell.id, mdCellMatch.id);
                assertRangesEqual(markdownCellContentMatchObjs[0].range(), [new range_1.Range(1, 15, 1, 19)]);
                assert.strictEqual(codeCellContentMatchObjs[0].cell.id, codeCellMatch.id);
                assert.strictEqual(codeCellContentMatchObjs[1].cell.id, codeCellMatch.id);
                assertRangesEqual(codeCellContentMatchObjs[0].range(), [new range_1.Range(1, 8, 1, 12)]);
                assertRangesEqual(codeCellContentMatchObjs[1].range(), [new range_1.Range(1, 14, 1, 18)]);
                assertRangesEqual(codeCellContentMatchObjs[2].range(), [new range_1.Range(2, 18, 2, 22)]);
                assert.strictEqual(codeWebviewContentMatchObjs[0].cell.id, codeCellMatch.id);
                assert.strictEqual(codeWebviewContentMatchObjs[1].cell.id, codeCellMatch.id);
                assert.strictEqual(codeWebviewContentMatchObjs[2].cell.id, codeCellMatch.id);
                assertRangesEqual(codeWebviewContentMatchObjs[0].range(), [new range_1.Range(1, 2, 1, 6)]);
                assertRangesEqual(codeWebviewContentMatchObjs[1].range(), [new range_1.Range(1, 8, 1, 12)]);
                assertRangesEqual(codeWebviewContentMatchObjs[2].range(), [new range_1.Range(1, 12, 1, 16)]);
            });
            function aFileMatch() {
                const rawMatch = {
                    resource: uri_1.URI.file('somepath' + ++counter),
                    results: []
                };
                const searchModel = instantiationService.createInstance(searchModel_1.SearchModel);
                const folderMatch = instantiationService.createInstance(searchModel_1.FolderMatch, uri_1.URI.file('somepath'), '', 0, {
                    type: 2 /* QueryType.Text */, folderQueries: [{ folder: (0, searchTestCommon_1.createFileUriFromPathFromRoot)() }], contentPattern: {
                        pattern: ''
                    }
                }, searchModel.searchResult, searchModel.searchResult, null);
                return instantiationService.createInstance(searchModel_1.FileMatch, {
                    pattern: ''
                }, undefined, undefined, folderMatch, rawMatch, null, '');
            }
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoTm90ZWJvb2tIZWxwZXJzLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zZWFyY2gvdGVzdC9icm93c2VyL3NlYXJjaE5vdGVib29rSGVscGVycy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBaUJoRyxLQUFLLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxFQUFFO1FBQ25DLElBQUksb0JBQThDLENBQUM7UUFDbkQsSUFBSSxlQUFtQyxDQUFDO1FBQ3hDLElBQUksaUJBQXFDLENBQUM7UUFDMUMsSUFBSSxXQUEyQixDQUFDO1FBQ2hDLElBQUksUUFBd0IsQ0FBQztRQUU3QixJQUFJLHNCQUEwQyxDQUFDO1FBQy9DLElBQUksa0JBQXNDLENBQUM7UUFDM0MsSUFBSSxrQkFBc0MsQ0FBQztRQUMzQyxJQUFJLE9BQU8sR0FBVyxDQUFDLENBQUM7UUFDeEIsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUVWLG9CQUFvQixHQUFHLElBQUksbURBQXdCLEVBQUUsQ0FBQztZQUN0RCxvQkFBb0IsQ0FBQyxJQUFJLENBQUMscUJBQWEsRUFBRSxJQUFBLG1DQUFnQixFQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztZQUNqRixvQkFBb0IsQ0FBQyxJQUFJLENBQUMsOENBQXNCLEVBQUUsSUFBQSw0Q0FBeUIsRUFBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7WUFDbkcsV0FBVyxHQUFHO2dCQUNiLFFBQVEsRUFBRSx5QkFBUSxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQXVCO29CQUMzRCxjQUFjLENBQUMsVUFBa0I7d0JBQ2hDLElBQUksVUFBVSxLQUFLLENBQUMsRUFBRTs0QkFDckIsT0FBTyxvQkFBb0IsQ0FBQzt5QkFDNUI7NkJBQU07NEJBQ04sT0FBTyxFQUFFLENBQUM7eUJBQ1Y7b0JBQ0YsQ0FBQztpQkFDRDthQUNp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