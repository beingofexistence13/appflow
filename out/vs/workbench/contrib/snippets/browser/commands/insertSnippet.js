/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/editorContextKeys", "vs/editor/common/languages/language", "vs/editor/contrib/snippet/browser/snippetController2", "vs/nls", "vs/platform/clipboard/common/clipboardService", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/snippets/browser/commands/abstractSnippetsActions", "vs/workbench/contrib/snippets/browser/snippetPicker", "vs/workbench/contrib/snippets/browser/snippets", "vs/workbench/contrib/snippets/browser/snippetsFile"], function (require, exports, editorContextKeys_1, language_1, snippetController2_1, nls, clipboardService_1, instantiation_1, abstractSnippetsActions_1, snippetPicker_1, snippets_1, snippetsFile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InsertSnippetAction = void 0;
    class Args {
        static fromUser(arg) {
            if (!arg || typeof arg !== 'object') {
                return Args._empty;
            }
            let { snippet, name, langId } = arg;
            if (typeof snippet !== 'string') {
                snippet = undefined;
            }
            if (typeof name !== 'string') {
                name = undefined;
            }
            if (typeof langId !== 'string') {
                langId = undefined;
            }
            return new Args(snippet, name, langId);
        }
        static { this._empty = new Args(undefined, undefined, undefined); }
        constructor(snippet, name, langId) {
            this.snippet = snippet;
            this.name = name;
            this.langId = langId;
        }
    }
    class InsertSnippetAction extends abstractSnippetsActions_1.SnippetEditorAction {
        constructor() {
            super({
                id: 'editor.action.insertSnippet',
                title: {
                    value: nls.localize('snippet.suggestions.label', "Insert Snippet"),
                    original: 'Insert Snippet'
                },
                f1: true,
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                description: {
                    description: `Insert Snippet`,
                    args: [{
                            name: 'args',
                            schema: {
                                'type': 'object',
                                'properties': {
                                    'snippet': {
                                        'type': 'string'
                                    },
                                    'langId': {
                                        'type': 'string',
                                    },
                                    'name': {
                                        'type': 'string'
                                    }
                                },
                            }
                        }]
                }
            });
        }
        async runEditorCommand(accessor, editor, arg) {
            const languageService = accessor.get(language_1.ILanguageService);
            const snippetService = accessor.get(snippets_1.ISnippetsService);
            if (!editor.hasModel()) {
                return;
            }
            const clipboardService = accessor.get(clipboardService_1.IClipboardService);
            const instaService = accessor.get(instantiation_1.IInstantiationService);
            const snippet = await new Promise((resolve, reject) => {
                const { lineNumber, column } = editor.getPosition();
                const { snippet, name, langId } = Args.fromUser(arg);
                if (snippet) {
                    return resolve(new snippetsFile_1.Snippet(false, [], '', '', '', snippet, '', 1 /* SnippetSource.User */, `random/${Math.random()}`));
                }
                let languageId;
                if (langId) {
                    if (!languageService.isRegisteredLanguageId(langId)) {
                        return resolve(undefined);
                    }
                    languageId = langId;
                }
                else {
                    editor.getModel().tokenization.tokenizeIfCheap(lineNumber);
                    languageId = editor.getModel().getLanguageIdAtPosition(lineNumber, column);
                    // validate the `languageId` to ensure this is a user
                    // facing language with a name and the chance to have
                    // snippets, else fall back to the outer language
                    if (!languageService.getLanguageName(languageId)) {
                        languageId = editor.getModel().getLanguageId();
                    }
                }
                if (name) {
                    // take selected snippet
                    snippetService.getSnippets(languageId, { includeNoPrefixSnippets: true })
                        .then(snippets => snippets.find(snippet => snippet.name === name))
                        .then(resolve, reject);
                }
                else {
                    // let user pick a snippet
                    resolve(instaService.invokeFunction(snippetPicker_1.pickSnippet, languageId));
                }
            });
            if (!snippet) {
                return;
            }
            let clipboardText;
            if (snippet.needsClipboard) {
                clipboardText = await clipboardService.readText();
            }
            editor.focus();
            snippetController2_1.SnippetController2.get(editor)?.insert(snippet.codeSnippet, { clipboardText });
            snippetService.updateUsageTimestamp(snippet);
        }
    }
    exports.InsertSnippetAction = InsertSnippetAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zZXJ0U25pcHBldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NuaXBwZXRzL2Jyb3dzZXIvY29tbWFuZHMvaW5zZXJ0U25pcHBldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFlaEcsTUFBTSxJQUFJO1FBRVQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFRO1lBQ3ZCLElBQUksQ0FBQyxHQUFHLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxFQUFFO2dCQUNwQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7YUFDbkI7WUFDRCxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUM7WUFDcEMsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQUU7Z0JBQ2hDLE9BQU8sR0FBRyxTQUFTLENBQUM7YUFDcEI7WUFDRCxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsRUFBRTtnQkFDN0IsSUFBSSxHQUFHLFNBQVMsQ0FBQzthQUNqQjtZQUNELElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxFQUFFO2dCQUMvQixNQUFNLEdBQUcsU0FBUyxDQUFDO2FBQ25CO1lBQ0QsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3hDLENBQUM7aUJBRXVCLFdBQU0sR0FBRyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRTNFLFlBQ2lCLE9BQTJCLEVBQzNCLElBQXdCLEVBQ3hCLE1BQTBCO1lBRjFCLFlBQU8sR0FBUCxPQUFPLENBQW9CO1lBQzNCLFNBQUksR0FBSixJQUFJLENBQW9CO1lBQ3hCLFdBQU0sR0FBTixNQUFNLENBQW9CO1FBQ3ZDLENBQUM7O0lBR04sTUFBYSxtQkFBb0IsU0FBUSw2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