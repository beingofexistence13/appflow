/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/editorContextKeys", "vs/editor/contrib/snippet/browser/snippetController2", "vs/nls", "vs/platform/clipboard/common/clipboardService", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/snippets/browser/commands/abstractSnippetsActions", "vs/workbench/contrib/snippets/browser/snippetPicker", "../snippets"], function (require, exports, editorContextKeys_1, snippetController2_1, nls_1, clipboardService_1, contextkey_1, instantiation_1, abstractSnippetsActions_1, snippetPicker_1, snippets_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SurroundWithSnippetEditorAction = exports.getSurroundableSnippets = void 0;
    async function getSurroundableSnippets(snippetsService, model, position, includeDisabledSnippets) {
        const { lineNumber, column } = position;
        model.tokenization.tokenizeIfCheap(lineNumber);
        const languageId = model.getLanguageIdAtPosition(lineNumber, column);
        const allSnippets = await snippetsService.getSnippets(languageId, { includeNoPrefixSnippets: true, includeDisabledSnippets });
        return allSnippets.filter(snippet => snippet.usesSelection);
    }
    exports.getSurroundableSnippets = getSurroundableSnippets;
    class SurroundWithSnippetEditorAction extends abstractSnippetsActions_1.SnippetEditorAction {
        static { this.options = {
            id: 'editor.action.surroundWithSnippet',
            title: {
                value: (0, nls_1.localize)('label', 'Surround With Snippet...'),
                original: 'Surround With Snippet...'
            }
        }; }
        constructor() {
            super({
                ...SurroundWithSnippetEditorAction.options,
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasNonEmptySelection),
                f1: true,
            });
        }
        async runEditorCommand(accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const instaService = accessor.get(instantiation_1.IInstantiationService);
            const snippetsService = accessor.get(snippets_1.ISnippetsService);
            const clipboardService = accessor.get(clipboardService_1.IClipboardService);
            const snippets = await getSurroundableSnippets(snippetsService, editor.getModel(), editor.getPosition(), true);
            if (!snippets.length) {
                return;
            }
            const snippet = await instaService.invokeFunction(snippetPicker_1.pickSnippet, snippets);
            if (!snippet) {
                return;
            }
            let clipboardText;
            if (snippet.needsClipboard) {
                clipboardText = await clipboardService.readText();
            }
            editor.focus();
            snippetController2_1.SnippetController2.get(editor)?.insert(snippet.codeSnippet, { clipboardText });
            snippetsService.updateUsageTimestamp(snippet);
        }
    }
    exports.SurroundWithSnippetEditorAction = SurroundWithSnippetEditorAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Vycm91bmRXaXRoU25pcHBldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NuaXBwZXRzL2Jyb3dzZXIvY29tbWFuZHMvc3Vycm91bmRXaXRoU25pcHBldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFnQnpGLEtBQUssVUFBVSx1QkFBdUIsQ0FBQyxlQUFpQyxFQUFFLEtBQWlCLEVBQUUsUUFBa0IsRUFBRSx1QkFBZ0M7UUFFdkosTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUM7UUFDeEMsS0FBSyxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDL0MsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLHVCQUF1QixDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUVyRSxNQUFNLFdBQVcsR0FBRyxNQUFNLGVBQWUsQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLEVBQUUsdUJBQXVCLEVBQUUsSUFBSSxFQUFFLHVCQUF1QixFQUFFLENBQUMsQ0FBQztRQUM5SCxPQUFPLFdBQVcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQVJELDBEQVFDO0lBRUQsTUFBYSwrQkFBZ0MsU0FBUSw2Q0FBbUI7aUJBRXZELFlBQU8sR0FBRztZQUN6QixFQUFFLEVBQUUsbUNBQW1DO1lBQ3ZDLEtBQUssRUFBRTtnQkFDTixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsT0FBTyxFQUFFLDBCQUEwQixDQUFDO2dCQUNwRCxRQUFRLEVBQUUsMEJBQTBCO2FBQ3BDO1NBQ0QsQ0FBQztRQUVGO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEdBQUcsK0JBQStCLENBQUMsT0FBTztnQkFDMUMsWUFBWSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUMvQixxQ0FBaUIsQ0FBQyxRQUFRLEVBQzFCLHFDQUFpQixDQUFDLG9CQUFvQixDQUN0QztnQkFDRCxFQUFFLEVBQUUsSUFBSTthQUNSLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsUUFBMEIsRUFBRSxNQUFtQjtZQUNyRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFO2dCQUN2QixPQUFPO2FBQ1A7WUFFRCxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFDQUFxQixDQUFDLENBQUM7WUFDekQsTUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywyQkFBZ0IsQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxvQ0FBaUIsQ0FBQyxDQUFDO1lBRXpELE1BQU0sUUFBUSxHQUFHLE1BQU0sdUJBQXVCLENBQUMsZUFBZSxFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRSxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDL0csSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUU7Z0JBQ3JCLE9BQU87YUFDUDtZQUVELE1BQU0sT0FBTyxHQUFHLE1BQU0sWUFBWSxDQUFDLGNBQWMsQ0FBQywyQkFBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3pFLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2IsT0FBTzthQUNQO1lBRUQsSUFBSSxhQUFpQyxDQUFDO1lBQ3RDLElBQUksT0FBTyxDQUFDLGNBQWMsRUFBRTtnQkFDM0IsYUFBYSxHQUFHLE1BQU0sZ0JBQWdCLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDbEQ7WUFFRCxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDZix1Q0FBa0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxDQUFDO1lBQy9FLGVBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMvQyxDQUFDOztJQWhERiwwRUFpREMifQ==