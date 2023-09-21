/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/markdownRenderer", "vs/nls!vs/workbench/contrib/notebook/browser/viewModel/notebookOutlineEntryFactory", "vs/workbench/contrib/notebook/browser/viewModel/foldingModel", "./OutlineEntry", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/editor/common/core/range"], function (require, exports, markdownRenderer_1, nls_1, foldingModel_1, OutlineEntry_1, notebookCommon_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$vrb = void 0;
    class $vrb {
        constructor(b) {
            this.b = b;
            this.a = {};
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
                for (const { depth, text } of (0, foldingModel_1.$3qb)(fullContent)) {
                    hasHeader = true;
                    entries.push(new OutlineEntry_1.$urb(index++, depth, cell, text, false, false));
                }
                if (!hasHeader) {
                    // no markdown syntax headers, try to find html tags
                    const match = fullContent.match(/<h([1-6]).*>(.*)<\/h\1>/i);
                    if (match) {
                        hasHeader = true;
                        const level = parseInt(match[1]);
                        const text = match[2].trim();
                        entries.push(new OutlineEntry_1.$urb(index++, level, cell, text, false, false));
                    }
                }
                if (!hasHeader) {
                    content = (0, markdownRenderer_1.$CQ)({ value: content });
                }
            }
            if (!hasHeader) {
                if (!isMarkdown && cell.model.textModel) {
                    const cachedEntries = this.a[cell.model.textModel.id];
                    // Gathering symbols from the model is an async operation, but this provider is syncronous.
                    // So symbols need to be precached before this function is called to get the full list.
                    if (cachedEntries) {
                        cachedEntries.forEach((cached) => {
                            entries.push(new OutlineEntry_1.$urb(index++, cached.level, cell, cached.name, false, false, cached.position, cached.kind));
                        });
                    }
                }
                const exeState = !isMarkdown && this.b.getCellExecution(cell.uri);
                if (entries.length === 0) {
                    let preview = content.trim();
                    if (preview.length === 0) {
                        // empty or just whitespace
                        preview = (0, nls_1.localize)(0, null);
                    }
                    entries.push(new OutlineEntry_1.$urb(index++, 7, cell, preview, !!exeState, exeState ? exeState.isPaused : false));
                }
            }
            return entries;
        }
        async cacheSymbols(textModel, outlineModelService, cancelToken) {
            const outlineModel = await outlineModelService.getOrCreate(textModel, cancelToken);
            const entries = createOutlineEntries(outlineModel.getTopLevelSymbols(), 7);
            this.a[textModel.id] = entries;
        }
    }
    exports.$vrb = $vrb;
    function createOutlineEntries(symbols, level) {
        const entries = [];
        symbols.forEach(symbol => {
            const position = new range_1.$ks(symbol.selectionRange.startLineNumber, symbol.selectionRange.startColumn, symbol.selectionRange.startLineNumber, symbol.selectionRange.startColumn);
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
//# sourceMappingURL=notebookOutlineEntryFactory.js.map