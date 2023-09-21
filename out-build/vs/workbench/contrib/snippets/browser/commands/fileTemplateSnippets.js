/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/strings", "vs/editor/browser/editorBrowser", "vs/editor/common/languages/language", "vs/editor/contrib/snippet/browser/snippetController2", "vs/nls!vs/workbench/contrib/snippets/browser/commands/fileTemplateSnippets", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/snippets/browser/commands/abstractSnippetsActions", "vs/workbench/contrib/snippets/browser/snippets", "vs/workbench/services/editor/common/editorService"], function (require, exports, arrays_1, strings_1, editorBrowser_1, language_1, snippetController2_1, nls_1, quickInput_1, abstractSnippetsActions_1, snippets_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$bFb = void 0;
    class $bFb extends abstractSnippetsActions_1.$_Eb {
        static { this.Id = 'workbench.action.populateFileFromSnippet'; }
        constructor() {
            super({
                id: $bFb.Id,
                title: {
                    value: (0, nls_1.localize)(0, null),
                    original: 'Fill File with Snippet'
                },
                f1: true,
            });
        }
        async run(accessor) {
            const snippetService = accessor.get(snippets_1.$amb);
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const editorService = accessor.get(editorService_1.$9C);
            const langService = accessor.get(language_1.$ct);
            const editor = (0, editorBrowser_1.$lV)(editorService.activeTextEditorControl);
            if (!editor || !editor.hasModel()) {
                return;
            }
            const snippets = await snippetService.getSnippets(undefined, { fileTemplateSnippets: true, noRecencySort: true, includeNoPrefixSnippets: true });
            if (snippets.length === 0) {
                return;
            }
            const selection = await this.c(quickInputService, langService, snippets);
            if (!selection) {
                return;
            }
            if (editor.hasModel()) {
                // apply snippet edit -> replaces everything
                snippetController2_1.$05.get(editor)?.apply([{
                        range: editor.getModel().getFullModelRange(),
                        template: selection.snippet.body
                    }]);
                // set language if possible
                editor.getModel().setLanguage(langService.createById(selection.langId), $bFb.Id);
                editor.focus();
            }
        }
        async c(quickInputService, langService, snippets) {
            const all = [];
            for (const snippet of snippets) {
                if ((0, arrays_1.$Ib)(snippet.scopes)) {
                    all.push({ langId: '', snippet });
                }
                else {
                    for (const langId of snippet.scopes) {
                        all.push({ langId, snippet });
                    }
                }
            }
            const picks = [];
            const groups = (0, arrays_1.$xb)(all, (a, b) => (0, strings_1.$Fe)(a.langId, b.langId));
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
                placeHolder: (0, nls_1.localize)(1, null),
                matchOnDetail: true,
            });
            return pick?.snippet;
        }
    }
    exports.$bFb = $bFb;
});
//# sourceMappingURL=fileTemplateSnippets.js.map