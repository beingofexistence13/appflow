/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/cancellation", "vs/base/test/common/mock", "vs/base/test/common/utils", "vs/workbench/contrib/notebook/browser/viewModel/notebookOutlineEntryFactory"], function (require, exports, assert, cancellation_1, mock_1, utils_1, notebookOutlineEntryFactory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Notebook Symbols', function () {
        (0, utils_1.$bT)();
        const symbolsPerTextModel = {};
        function setSymbolsForTextModel(symbols, textmodelId = 'textId') {
            symbolsPerTextModel[textmodelId] = symbols;
        }
        const executionService = new class extends (0, mock_1.$rT)() {
            getCellExecution() { return undefined; }
        };
        class OutlineModelStub {
            constructor(a) {
                this.a = a;
            }
            getTopLevelSymbols() {
                return symbolsPerTextModel[this.a];
            }
        }
        const outlineModelService = new class extends (0, mock_1.$rT)() {
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
            const entryFactory = new notebookOutlineEntryFactory_1.$vrb(executionService);
            const entries = entryFactory.getOutlineEntries(createCellViewModel(), 0);
            assert.equal(entries.length, 1, 'no entries created');
            assert.equal(entries[0].label, '# code', 'entry should fall back to first line of cell');
        });
        test('Cell with simple symbols', async function () {
            setSymbolsForTextModel([{ name: 'var1', selectionRange: {} }, { name: 'var2', selectionRange: {} }]);
            const entryFactory = new notebookOutlineEntryFactory_1.$vrb(executionService);
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
            const entryFactory = new notebookOutlineEntryFactory_1.$vrb(executionService);
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
            const entryFactory = new notebookOutlineEntryFactory_1.$vrb(executionService);
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
//# sourceMappingURL=notebookSymbols.test.js.map