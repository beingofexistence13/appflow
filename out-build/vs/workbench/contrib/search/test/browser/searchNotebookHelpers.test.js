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
            instantiationService = new instantiationServiceMock_1.$L0b();
            instantiationService.stub(model_2.$yA, (0, searchTestCommon_1.$Rfc)(instantiationService));
            instantiationService.stub(notebookEditorService_1.$1rb, (0, searchTestCommon_1.$Sfc)(instantiationService));
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
            const findMatchMds = [new model_1.$Bu(new range_1.$ks(1, 15, 1, 19), ['Test'])];
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
            const findMatchCodeCells = [new model_1.$Bu(new range_1.$ks(1, 8, 1, 12), ['test']),
                new model_1.$Bu(new range_1.$ks(1, 14, 1, 18), ['test']),
                new model_1.$Bu(new range_1.$ks(2, 18, 2, 22), ['Test'])
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
            mdCellFindMatch = new findModel_1.$xob(mdInputCell, 0, findMatchMds, []);
            codeCellFindMatch = new findModel_1.$xob(codeCell, 5, findMatchCodeCells, webviewMatches);
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
                markdownContentResults = (0, searchNotebookHelpers_1.$GMb)(mdCellFindMatch.contentMatches, mdInputCell);
                codeContentResults = (0, searchNotebookHelpers_1.$GMb)(codeCellFindMatch.contentMatches, codeCell);
                codeWebviewResults = (0, searchNotebookHelpers_1.$IMb)(codeCellFindMatch.webviewMatches);
                assert.strictEqual(markdownContentResults.length, 1);
                assert.strictEqual(markdownContentResults[0].preview.text, '# Hello World Test\n');
                assertRangesEqual(markdownContentResults[0].preview.matches, [new range_1.$ks(0, 14, 0, 18)]);
                assertRangesEqual(markdownContentResults[0].ranges, [new range_1.$ks(0, 14, 0, 18)]);
                assert.strictEqual(codeContentResults.length, 2);
                assert.strictEqual(codeContentResults[0].preview.text, 'print("test! testing!!")\n');
                assert.strictEqual(codeContentResults[1].preview.text, 'print("this is a Test")\n');
                assertRangesEqual(codeContentResults[0].preview.matches, [new range_1.$ks(0, 7, 0, 11), new range_1.$ks(0, 13, 0, 17)]);
                assertRangesEqual(codeContentResults[0].ranges, [new range_1.$ks(0, 7, 0, 11), new range_1.$ks(0, 13, 0, 17)]);
                assert.strictEqual(codeWebviewResults.length, 3);
                assert.strictEqual(codeWebviewResults[0].preview.text, 'test! testing!!');
                assert.strictEqual(codeWebviewResults[1].preview.text, 'test! testing!!');
                assert.strictEqual(codeWebviewResults[2].preview.text, 'this is a Test');
                assertRangesEqual(codeWebviewResults[0].preview.matches, [new range_1.$ks(0, 1, 0, 5)]);
                assertRangesEqual(codeWebviewResults[1].preview.matches, [new range_1.$ks(0, 7, 0, 11)]);
                assertRangesEqual(codeWebviewResults[2].preview.matches, [new range_1.$ks(0, 11, 0, 15)]);
                assertRangesEqual(codeWebviewResults[0].ranges, [new range_1.$ks(0, 1, 0, 5)]);
                assertRangesEqual(codeWebviewResults[1].ranges, [new range_1.$ks(0, 7, 0, 11)]);
                assertRangesEqual(codeWebviewResults[2].ranges, [new range_1.$ks(0, 11, 0, 15)]);
            });
            test('convert ITextSearchMatch to MatchInNotebook', () => {
                const mdCellMatch = new searchModel_1.$QMb(aFileMatch(), mdInputCell, 0);
                const markdownCellContentMatchObjs = (0, searchModel_1.$6Mb)(markdownContentResults, mdCellMatch);
                const codeCellMatch = new searchModel_1.$QMb(aFileMatch(), codeCell, 0);
                const codeCellContentMatchObjs = (0, searchModel_1.$6Mb)(codeContentResults, codeCellMatch);
                const codeWebviewContentMatchObjs = (0, searchModel_1.$6Mb)(codeWebviewResults, codeCellMatch);
                assert.strictEqual(markdownCellContentMatchObjs[0].cell.id, mdCellMatch.id);
                assertRangesEqual(markdownCellContentMatchObjs[0].range(), [new range_1.$ks(1, 15, 1, 19)]);
                assert.strictEqual(codeCellContentMatchObjs[0].cell.id, codeCellMatch.id);
                assert.strictEqual(codeCellContentMatchObjs[1].cell.id, codeCellMatch.id);
                assertRangesEqual(codeCellContentMatchObjs[0].range(), [new range_1.$ks(1, 8, 1, 12)]);
                assertRangesEqual(codeCellContentMatchObjs[1].range(), [new range_1.$ks(1, 14, 1, 18)]);
                assertRangesEqual(codeCellContentMatchObjs[2].range(), [new range_1.$ks(2, 18, 2, 22)]);
                assert.strictEqual(codeWebviewContentMatchObjs[0].cell.id, codeCellMatch.id);
                assert.strictEqual(codeWebviewContentMatchObjs[1].cell.id, codeCellMatch.id);
                assert.strictEqual(codeWebviewContentMatchObjs[2].cell.id, codeCellMatch.id);
                assertRangesEqual(codeWebviewContentMatchObjs[0].range(), [new range_1.$ks(1, 2, 1, 6)]);
                assertRangesEqual(codeWebviewContentMatchObjs[1].range(), [new range_1.$ks(1, 8, 1, 12)]);
                assertRangesEqual(codeWebviewContentMatchObjs[2].range(), [new range_1.$ks(1, 12, 1, 16)]);
            });
            function aFileMatch() {
                const rawMatch = {
                    resource: uri_1.URI.file('somepath' + ++counter),
                    results: []
                };
                const searchModel = instantiationService.createInstance(searchModel_1.$2Mb);
                const folderMatch = instantiationService.createInstance(searchModel_1.$TMb, uri_1.URI.file('somepath'), '', 0, {
                    type: 2 /* QueryType.Text */, folderQueries: [{ folder: (0, searchTestCommon_1.$Pfc)() }], contentPattern: {
                        pattern: ''
                    }
                }, searchModel.searchResult, searchModel.searchResult, null);
                return instantiationService.createInstance(searchModel_1.$SMb, {
                    pattern: ''
                }, undefined, undefined, folderMatch, rawMatch, null, '');
            }
        });
    });
});
//# sourceMappingURL=searchNotebookHelpers.test.js.map