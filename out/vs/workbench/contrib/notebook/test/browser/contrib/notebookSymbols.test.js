/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/cancellation", "vs/base/test/common/mock", "vs/base/test/common/utils", "vs/workbench/contrib/notebook/browser/viewModel/notebookOutlineEntryFactory"], function (require, exports, assert, cancellation_1, mock_1, utils_1, notebookOutlineEntryFactory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Notebook Symbols', function () {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        const symbolsPerTextModel = {};
        function setSymbolsForTextModel(symbols, textmodelId = 'textId') {
            symbolsPerTextModel[textmodelId] = symbols;
        }
        const executionService = new class extends (0, mock_1.mock)() {
            getCellExecution() { return undefined; }
        };
        class OutlineModelStub {
            constructor(textId) {
                this.textId = textId;
            }
            getTopLevelSymbols() {
                return symbolsPerTextModel[this.textId];
            }
        }
        const outlineModelService = new class extends (0, mock_1.mock)() {
            getOrCreate(model, arg1) {
                const outline = new OutlineModelStub(model.id);
                return Promise.resolve(outline);
            }
            getDebounceValue(arg0) {
                return 0;
            }
        };
        function createCellViewModel(version = 1, textmodelId = 'textId') {
            return {
                textBuffer: {
                    getLineCount() { return 0; }
                },
                getText() {
                    return '# code';
                },
                model: {
                    textModel: {
                        id: textmodelId,
                        getVersionId() { return version; }
                    }
                }
            };
        }
        test('Cell without symbols cache', function () {
            setSymbolsForTextModel([{ name: 'var', selectionRange: {} }]);
            const entryFactory = new notebookOutlineEntryFactory_1.NotebookOutlineEntryFactory(executionService);
            const entries = entryFactory.getOutlineEntries(createCellViewModel(), 0);
            assert.equal(entries.length, 1, 'no entries created');
            assert.equal(entries[0].label, '# code', 'entry should fall back to first line of cell');
        });
        test('Cell with simple symbols', async function () {
            setSymbolsForTextModel([{ name: 'var1', selectionRange: {} }, { name: 'var2', selectionRange: {} }]);
            const entryFactory = new notebookOutlineEntryFactory_1.NotebookOutlineEntryFactory(executionService);
            const cell = createCellViewModel();
            await entryFactory.cacheSymbols(cell.model.textModel, outlineModelService, cancellation_1.CancellationToken.None);
            const entries = entryFactory.getOutlineEntries(cell, 0);
            assert.equal(entries.length, 2, 'wrong number of outline entries');
            assert.equal(entries[0].label, 'var1');
            // 6 levels for markdown, all code symbols are greater than the max markdown level
            assert.equal(entries[0].level, 7);
            assert.equal(entries[0].index, 0);
            assert.equal(entries[1].label, 'var2');
            assert.equal(entries[1].level, 7);
            assert.equal(entries[1].index, 1);
        });
        test('Cell with nested symbols', async function () {
            setSymbolsForTextModel([
                { name: 'root1', selectionRange: {}, children: [{ name: 'nested1', selectionRange: {} }, { name: 'nested2', selectionRange: {} }] },
                { name: 'root2', selectionRange: {}, children: [{ name: 'nested1', selectionRange: {} }] }
            ]);
            const entryFactory = new notebookOutlineEntryFactory_1.NotebookOutlineEntryFactory(executionService);
            const cell = createCellViewModel();
            await entryFactory.cacheSymbols(cell.model.textModel, outlineModelService, cancellation_1.CancellationToken.None);
            const entries = entryFactory.getOutlineEntries(createCellViewModel(), 0);
            assert.equal(entries.length, 5, 'wrong number of outline entries');
            assert.equal(entries[0].label, 'root1');
            assert.equal(entries[0].level, 7);
            assert.equal(entries[1].label, 'nested1');
            assert.equal(entries[1].level, 8);
            assert.equal(entries[2].label, 'nested2');
            assert.equal(entries[2].level, 8);
            assert.equal(entries[3].label, 'root2');
            assert.equal(entries[3].level, 7);
            assert.equal(entries[4].label, 'nested1');
            assert.equal(entries[4].level, 8);
        });
        test('Multiple Cells with symbols', async function () {
            setSymbolsForTextModel([{ name: 'var1', selectionRange: {} }], '$1');
            setSymbolsForTextModel([{ name: 'var2', selectionRange: {} }], '$2');
            const entryFactory = new notebookOutlineEntryFactory_1.NotebookOutlineEntryFactory(executionService);
            const cell1 = createCellViewModel(1, '$1');
            const cell2 = createCellViewModel(1, '$2');
            await entryFactory.cacheSymbols(cell1.model.textModel, outlineModelService, cancellation_1.CancellationToken.None);
            await entryFactory.cacheSymbols(cell2.model.textModel, outlineModelService, cancellation_1.CancellationToken.None);
            const entries1 = entryFactory.getOutlineEntries(createCellViewModel(1, '$1'), 0);
            const entries2 = entryFactory.getOutlineEntries(createCellViewModel(1, '$2'), 0);
            assert.equal(entries1.length, 1, 'wrong number of outline entries');
            assert.equal(entries1[0].label, 'var1');
            assert.equal(entries2.length, 1, 'wrong number of outline entries');
            assert.equal(entries2[0].label, 'var2');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tTeW1ib2xzLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay90ZXN0L2Jyb3dzZXIvY29udHJpYi9ub3RlYm9va1N5bWJvbHMudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVloRyxLQUFLLENBQUMsa0JBQWtCLEVBQUU7UUFDekIsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRzFDLE1BQU0sbUJBQW1CLEdBQWlDLEVBQUUsQ0FBQztRQUM3RCxTQUFTLHNCQUFzQixDQUFDLE9BQXFCLEVBQUUsV0FBVyxHQUFHLFFBQVE7WUFDNUUsbUJBQW1CLENBQUMsV0FBVyxDQUFDLEdBQUcsT0FBTyxDQUFDO1FBQzVDLENBQUM7UUFFRCxNQUFNLGdCQUFnQixHQUFHLElBQUksS0FBTSxTQUFRLElBQUEsV0FBSSxHQUFrQztZQUN2RSxnQkFBZ0IsS0FBSyxPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUM7U0FDakQsQ0FBQztRQUVGLE1BQU0sZ0JBQWdCO1lBQ3JCLFlBQW9CLE1BQWM7Z0JBQWQsV0FBTSxHQUFOLE1BQU0sQ0FBUTtZQUFJLENBQUM7WUFFdkMsa0JBQWtCO2dCQUNqQixPQUFPLG1CQUFtQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN6QyxDQUFDO1NBQ0Q7UUFDRCxNQUFNLG1CQUFtQixHQUFHLElBQUksS0FBTSxTQUFRLElBQUEsV0FBSSxHQUF3QjtZQUNoRSxXQUFXLENBQUMsS0FBaUIsRUFBRSxJQUFTO2dCQUNoRCxNQUFNLE9BQU8sR0FBRyxJQUFJLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxFQUFFLENBQTRCLENBQUM7Z0JBQzFFLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNqQyxDQUFDO1lBQ1EsZ0JBQWdCLENBQUMsSUFBUztn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