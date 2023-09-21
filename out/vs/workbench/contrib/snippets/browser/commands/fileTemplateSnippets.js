/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/strings", "vs/editor/browser/editorBrowser", "vs/editor/common/languages/language", "vs/editor/contrib/snippet/browser/snippetController2", "vs/nls", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/snippets/browser/commands/abstractSnippetsActions", "vs/workbench/contrib/snippets/browser/snippets", "vs/workbench/services/editor/common/editorService"], function (require, exports, arrays_1, strings_1, editorBrowser_1, language_1, snippetController2_1, nls_1, quickInput_1, abstractSnippetsActions_1, snippets_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ApplyFileSnippetAction = void 0;
    class ApplyFileSnippetAction extends abstractSnippetsActions_1.SnippetsAction {
        static { this.Id = 'workbench.action.populateFileFromSnippet'; }
        constructor() {
            super({
                id: ApplyFileSnippetAction.Id,
                title: {
                    value: (0, nls_1.localize)('label', 'Fill File with Snippet'),
                    original: 'Fill File with Snippet'
                },
                f1: true,
            });
        }
        async run(accessor) {
            const snippetService = accessor.get(snippets_1.ISnippetsService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const editorService = accessor.get(editorService_1.IEditorService);
            const langService = accessor.get(language_1.ILanguageService);
            const editor = (0, editorBrowser_1.getCodeEditor)(editorService.activeTextEditorControl);
            if (!editor || !editor.hasModel()) {
                return;
            }
            const snippets = await snippetService.getSnippets(undefined, { fileTemplateSnippets: true, noRecencySort: true, includeNoPrefixSnippets: true });
            if (snippets.length === 0) {
                return;
            }
            const selection = await this._pick(quickInputService, langService, snippets);
            if (!selection) {
                return;
            }
            if (editor.hasModel()) {
                // apply snippet edit -> replaces everything
                snippetController2_1.SnippetController2.get(editor)?.apply([{
                        range: editor.getModel().getFullModelRange(),
                        template: selection.snippet.body
                    }]);
                // set language if possible
                editor.getModel().setLanguage(langService.createById(selection.langId), ApplyFileSnippetAction.Id);
                editor.focus();
            }
        }
        async _pick(quickInputService, langService, snippets) {
            const all = [];
            for (const snippet of snippets) {
                if ((0, arrays_1.isFalsyOrEmpty)(snippet.scopes)) {
                    all.push({ langId: '', snippet });
                }
                else {
                    for (const langId of snippet.scopes) {
                        all.push({ langId, snippet });
                    }
                }
            }
            const picks = [];
            const groups = (0, arrays_1.groupBy)(all, (a, b) => (0, strings_1.compare)(a.langId, b.langId));
            for (const group of groups) {
                let first = true;
                for (const item of group) {
                    if (first) {
                        picks.push({
                            type: 'separator',
                            label: langService.getLanguageName(item.langId) ?? item.langId
                        });
                        first = false;
                    }
                    picks.push({
                        snippet: item,
                        label: item.snippet.prefix || item.snippet.name,
                        detail: item.snippet.description
                    });
                }
            }
            const pick = await quickInputService.pick(picks, {
                placeHolder: (0, nls_1.localize)('placeholder', 'Select a snippet'),
                matchOnDetail: true,
            });
            return pick?.snippet;
        }
    }
    exports.ApplyFileSnippetAction = ApplyFileSnippetAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZVRlbXBsYXRlU25pcHBldHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zbmlwcGV0cy9icm93c2VyL2NvbW1hbmRzL2ZpbGVUZW1wbGF0ZVNuaXBwZXRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWVoRyxNQUFhLHNCQUF1QixTQUFRLHdDQUFjO2lCQUV6QyxPQUFFLEdBQUcsMENBQTBDLENBQUM7UUFFaEU7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLHNCQUFzQixDQUFDLEVBQUU7Z0JBQzdCLEtBQUssRUFBRTtvQkFDTixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsT0FBTyxFQUFFLHdCQUF3QixDQUFDO29CQUNsRCxRQUFRLEVBQUUsd0JBQXdCO2lCQUNsQztnQkFDRCxFQUFFLEVBQUUsSUFBSTthQUNSLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCO1lBQ25DLE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMkJBQWdCLENBQUMsQ0FBQztZQUN0RCxNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsK0JBQWtCLENBQUMsQ0FBQztZQUMzRCxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFjLENBQUMsQ0FBQztZQUNuRCxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDJCQUFnQixDQUFDLENBQUM7WUFFbkQsTUFBTSxNQUFNLEdBQUcsSUFBQSw2QkFBYSxFQUFDLGFBQWEsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1lBQ3BFLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUU7Z0JBQ2xDLE9BQU87YUFDUDtZQUVELE1BQU0sUUFBUSxHQUFHLE1B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