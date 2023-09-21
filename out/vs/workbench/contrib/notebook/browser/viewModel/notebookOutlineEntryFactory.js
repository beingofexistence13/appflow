/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/markdownRenderer", "vs/nls", "vs/workbench/contrib/notebook/browser/viewModel/foldingModel", "./OutlineEntry", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/editor/common/core/range"], function (require, exports, markdownRenderer_1, nls_1, foldingModel_1, OutlineEntry_1, notebookCommon_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookOutlineEntryFactory = void 0;
    class NotebookOutlineEntryFactory {
        constructor(executionStateService) {
            this.executionStateService = executionStateService;
            this.cellOutlineEntryCache = {};
        }
        getOutlineEntries(cell, index) {
            const entries = [];
            const isMarkdown = cell.cellKind === notebookCommon_1.CellKind.Markup;
            // cap the amount of characters that we look at and use the following logic
            // - for MD prefer headings (each header is an entry)
            // - otherwise use the first none-empty line of the cell (MD or code)
            let content = getCellFirstNonEmptyLine(cell);
            let hasHeader = false;
            if (isMarkdown) {
                const fullContent = cell.getText().substring(0, 10000);
                for (const { depth, text } of (0, foldingModel_1.getMarkdownHeadersInCell)(fullContent)) {
                    hasHeader = true;
                    entries.push(new OutlineEntry_1.OutlineEntry(index++, depth, cell, text, false, false));
                }
                if (!hasHeader) {
                    // no markdown syntax headers, try to find html tags
                    const match = fullContent.match(/<h([1-6]).*>(.*)<\/h\1>/i);
                    if (match) {
                        hasHeader = true;
                        const level = parseInt(match[1]);
                        const text = match[2].trim();
                        entries.push(new OutlineEntry_1.OutlineEntry(index++, level, cell, text, false, false));
                    }
                }
                if (!hasHeader) {
                    content = (0, markdownRenderer_1.renderMarkdownAsPlaintext)({ value: content });
                }
            }
            if (!hasHeader) {
                if (!isMarkdown && cell.model.textModel) {
                    const cachedEntries = this.cellOutlineEntryCache[cell.model.textModel.id];
                    // Gathering symbols from the model is an async operation, but this provider is syncronous.
                    // So symbols need to be precached before this function is called to get the full list.
                    if (cachedEntries) {
                        cachedEntries.forEach((cached) => {
                            entries.push(new OutlineEntry_1.OutlineEntry(index++, cached.level, cell, cached.name, false, false, cached.position, cached.kind));
                        });
                    }
                }
                const exeState = !isMarkdown && this.executionStateService.getCellExecution(cell.uri);
                if (entries.length === 0) {
                    let preview = content.trim();
                    if (preview.length === 0) {
                        // empty or just whitespace
                        preview = (0, nls_1.localize)('empty', "empty cell");
                    }
                    entries.push(new OutlineEntry_1.OutlineEntry(index++, 7, cell, preview, !!exeState, exeState ? exeState.isPaused : false));
                }
            }
            return entries;
        }
        async cacheSymbols(textModel, outlineModelService, cancelToken) {
            const outlineModel = await outlineModelService.getOrCreate(textModel, cancelToken);
            const entries = createOutlineEntries(outlineModel.getTopLevelSymbols(), 7);
            this.cellOutlineEntryCache[textModel.id] = entries;
        }
    }
    exports.NotebookOutlineEntryFactory = NotebookOutlineEntryFactory;
    function createOutlineEntries(symbols, level) {
        const entries = [];
        symbols.forEach(symbol => {
            const position = new range_1.Range(symbol.selectionRange.startLineNumber, symbol.selectionRange.startColumn, symbol.selectionRange.startLineNumber, symbol.selectionRange.startColumn);
            entries.push({ name: symbol.name, position, level, kind: symbol.kind });
            if (symbol.children) {
                entries.push(...createOutlineEntries(symbol.children, level + 1));
            }
        });
        return entries;
    }
    function getCellFirstNonEmptyLine(cell) {
        const textBuffer = cell.textBuffer;
        for (let i = 0; i < textBuffer.getLineCount(); i++) {
            const firstNonWhitespace = textBuffer.getLineFirstNonWhitespaceColumn(i + 1);
            const lineLength = textBuffer.getLineLength(i + 1);
            if (firstNonWhitespace < lineLength) {
                return textBuffer.getLineContent(i + 1);
            }
        }
        return cell.getText().substring(0, 100);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tPdXRsaW5lRW50cnlGYWN0b3J5LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci92aWV3TW9kZWwvbm90ZWJvb2tPdXRsaW5lRW50cnlGYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXNCaEcsTUFBYSwyQkFBMkI7UUFJdkMsWUFDa0IscUJBQXFEO1lBQXJELDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBZ0M7WUFIL0QsMEJBQXFCLEdBQWdDLEVBQUUsQ0FBQztRQUk1RCxDQUFDO1FBRUUsaUJBQWlCLENBQUMsSUFBb0IsRUFBRSxLQUFhO1lBQzNELE1BQU0sT0FBTyxHQUFtQixFQUFFLENBQUM7WUFFbkMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsS0FBSyx5QkFBUSxDQUFDLE1BQU0sQ0FBQztZQUVyRCwyRUFBMkU7WUFDM0UscURBQXFEO1lBQ3JELHFFQUFxRTtZQUNyRSxJQUFJLE9BQU8sR0FBRyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3QyxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUM7WUFFdEIsSUFBSSxVQUFVLEVBQUU7Z0JBQ2YsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3ZELEtBQUssTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxJQUFBLHVDQUF3QixFQUFDLFdBQVcsQ0FBQyxFQUFFO29CQUNwRSxTQUFTLEdBQUcsSUFBSSxDQUFDO29CQUNqQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksMkJBQVksQ0FBQyxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxD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