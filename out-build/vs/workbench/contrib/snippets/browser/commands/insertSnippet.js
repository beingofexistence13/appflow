/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/editorContextKeys", "vs/editor/common/languages/language", "vs/editor/contrib/snippet/browser/snippetController2", "vs/nls!vs/workbench/contrib/snippets/browser/commands/insertSnippet", "vs/platform/clipboard/common/clipboardService", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/snippets/browser/commands/abstractSnippetsActions", "vs/workbench/contrib/snippets/browser/snippetPicker", "vs/workbench/contrib/snippets/browser/snippets", "vs/workbench/contrib/snippets/browser/snippetsFile"], function (require, exports, editorContextKeys_1, language_1, snippetController2_1, nls, clipboardService_1, instantiation_1, abstractSnippetsActions_1, snippetPicker_1, snippets_1, snippetsFile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$kYb = void 0;
    class Args {
        static fromUser(arg) {
            if (!arg || typeof arg !== 'object') {
                return Args.a;
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
        static { this.a = new Args(undefined, undefined, undefined); }
        constructor(snippet, name, langId) {
            this.snippet = snippet;
            this.name = name;
            this.langId = langId;
        }
    }
    class $kYb extends abstractSnippetsActions_1.$aFb {
        constructor() {
            super({
                id: 'editor.action.insertSnippet',
                title: {
                    value: nls.localize(0, null),
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
            const languageService = accessor.get(language_1.$ct);
            const snippetService = accessor.get(snippets_1.$amb);
            if (!editor.hasModel()) {
                return;
            }
            const clipboardService = accessor.get(clipboardService_1.$UZ);
            const instaService = accessor.get(instantiation_1.$Ah);
            const snippet = await new Promise((resolve, reject) => {
                const { lineNumber, column } = editor.getPosition();
                const { snippet, name, langId } = Args.fromUser(arg);
                if (snippet) {
                    return resolve(new snippetsFile_1.$$lb(false, [], '', '', '', snippet, '', 1 /* SnippetSource.User */, `random/${Math.random()}`));
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
                    resolve(instaService.invokeFunction(snippetPicker_1.$jYb, languageId));
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
            snippetController2_1.$05.get(editor)?.insert(snippet.codeSnippet, { clipboardText });
            snippetService.updateUsageTimestamp(snippet);
        }
    }
    exports.$kYb = $kYb;
});
//# sourceMappingURL=insertSnippet.js.map