/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/editorContextKeys", "vs/editor/contrib/snippet/browser/snippetController2", "vs/nls!vs/workbench/contrib/snippets/browser/commands/surroundWithSnippet", "vs/platform/clipboard/common/clipboardService", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/snippets/browser/commands/abstractSnippetsActions", "vs/workbench/contrib/snippets/browser/snippetPicker", "../snippets"], function (require, exports, editorContextKeys_1, snippetController2_1, nls_1, clipboardService_1, contextkey_1, instantiation_1, abstractSnippetsActions_1, snippetPicker_1, snippets_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$mYb = exports.$lYb = void 0;
    async function $lYb(snippetsService, model, position, includeDisabledSnippets) {
        const { lineNumber, column } = position;
        model.tokenization.tokenizeIfCheap(lineNumber);
        const languageId = model.getLanguageIdAtPosition(lineNumber, column);
        const allSnippets = await snippetsService.getSnippets(languageId, { includeNoPrefixSnippets: true, includeDisabledSnippets });
        return allSnippets.filter(snippet => snippet.usesSelection);
    }
    exports.$lYb = $lYb;
    class $mYb extends abstractSnippetsActions_1.$aFb {
        static { this.options = {
            id: 'editor.action.surroundWithSnippet',
            title: {
                value: (0, nls_1.localize)(0, null),
                original: 'Surround With Snippet...'
            }
        }; }
        constructor() {
            super({
                ...$mYb.options,
                precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasNonEmptySelection),
                f1: true,
            });
        }
        async runEditorCommand(accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const instaService = accessor.get(instantiation_1.$Ah);
            const snippetsService = accessor.get(snippets_1.$amb);
            const clipboardService = accessor.get(clipboardService_1.$UZ);
            const snippets = await $lYb(snippetsService, editor.getModel(), editor.getPosition(), true);
            if (!snippets.length) {
                return;
            }
            const snippet = await instaService.invokeFunction(snippetPicker_1.$jYb, snippets);
            if (!snippet) {
                return;
            }
            let clipboardText;
            if (snippet.needsClipboard) {
                clipboardText = await clipboardService.readText();
            }
            editor.focus();
            snippetController2_1.$05.get(editor)?.insert(snippet.codeSnippet, { clipboardText });
            snippetsService.updateUsageTimestamp(snippet);
        }
    }
    exports.$mYb = $mYb;
});
//# sourceMappingURL=surroundWithSnippet.js.map