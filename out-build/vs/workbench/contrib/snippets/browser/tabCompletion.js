/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/platform/contextkey/common/contextkey", "./snippets", "./snippetsService", "vs/editor/common/core/range", "vs/editor/browser/editorExtensions", "vs/editor/contrib/snippet/browser/snippetController2", "vs/editor/contrib/suggest/browser/suggest", "vs/editor/common/editorContextKeys", "./snippetCompletionProvider", "vs/platform/clipboard/common/clipboardService", "vs/editor/contrib/editorState/browser/editorState", "vs/editor/common/services/languageFeatures"], function (require, exports, contextkey_1, snippets_1, snippetsService_1, range_1, editorExtensions_1, snippetController2_1, suggest_1, editorContextKeys_1, snippetCompletionProvider_1, clipboardService_1, editorState_1, languageFeatures_1) {
    "use strict";
    var $qmb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$qmb = void 0;
    let $qmb = class $qmb {
        static { $qmb_1 = this; }
        static { this.ID = 'editor.tabCompletionController'; }
        static { this.ContextKey = new contextkey_1.$2i('hasSnippetCompletions', undefined); }
        static get(editor) {
            return editor.getContribution($qmb_1.ID);
        }
        constructor(h, i, j, k, contextKeyService) {
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.f = [];
            this.a = $qmb_1.ContextKey.bindTo(contextKeyService);
            this.b = this.h.onDidChangeConfiguration(e => {
                if (e.hasChanged(122 /* EditorOption.tabCompletion */)) {
                    this.l();
                }
            });
            this.l();
        }
        dispose() {
            this.b.dispose();
            this.d?.dispose();
        }
        l() {
            const enabled = this.h.getOption(122 /* EditorOption.tabCompletion */) === 'onlySnippets';
            if (this.c !== enabled) {
                this.c = enabled;
                if (!this.c) {
                    this.d?.dispose();
                }
                else {
                    this.d = this.h.onDidChangeCursorSelection(e => this.m());
                    if (this.h.getModel()) {
                        this.m();
                    }
                }
            }
        }
        m() {
            // reset first
            this.f = [];
            this.g?.dispose();
            if (!this.h.hasModel()) {
                return;
            }
            // lots of dance for getting the
            const selection = this.h.getSelection();
            const model = this.h.getModel();
            model.tokenization.tokenizeIfCheap(selection.positionLineNumber);
            const id = model.getLanguageIdAtPosition(selection.positionLineNumber, selection.positionColumn);
            const snippets = this.i.getSnippetsSync(id);
            if (!snippets) {
                // nothing for this language
                this.a.set(false);
                return;
            }
            if (range_1.$ks.isEmpty(selection)) {
                // empty selection -> real text (no whitespace) left of cursor
                const prefix = (0, snippetsService_1.$pmb)(model, selection.getPosition());
                if (prefix) {
                    for (const snippet of snippets) {
                        if (prefix.endsWith(snippet.prefix)) {
                            this.f.push(snippet);
                        }
                    }
                }
            }
            else if (!range_1.$ks.spansMultipleLines(selection) && model.getValueLengthInRange(selection) <= 100) {
                // actual selection -> snippet must be a full match
                const selected = model.getValueInRange(selection);
                if (selected) {
                    for (const snippet of snippets) {
                        if (selected === snippet.prefix) {
                            this.f.push(snippet);
                        }
                    }
                }
            }
            const len = this.f.length;
            if (len === 0) {
                this.a.set(false);
            }
            else if (len === 1) {
                this.a.set(true);
            }
            else {
                this.a.set(true);
                this.g = {
                    _debugDisplayName: 'tabCompletion',
                    dispose: () => {
                        registration.dispose();
                    },
                    provideCompletionItems: (_model, position) => {
                        if (_model !== model || !selection.containsPosition(position)) {
                            return;
                        }
                        const suggestions = this.f.map(snippet => {
                            const range = range_1.$ks.fromPositions(position.delta(0, -snippet.prefix.length), position);
                            return new snippetCompletionProvider_1.$mmb(snippet, range);
                        });
                        return { suggestions };
                    }
                };
                const registration = this.k.completionProvider.register({ language: model.getLanguageId(), pattern: model.uri.fsPath, scheme: model.uri.scheme }, this.g);
            }
        }
        async performSnippetCompletions() {
            if (!this.h.hasModel()) {
                return;
            }
            if (this.f.length === 1) {
                // one -> just insert
                const [snippet] = this.f;
                // async clipboard access might be required and in that case
                // we need to check if the editor has changed in flight and then
                // bail out (or be smarter than that)
                let clipboardText;
                if (snippet.needsClipboard) {
                    const state = new editorState_1.$s1(this.h, 1 /* CodeEditorStateFlag.Value */ | 4 /* CodeEditorStateFlag.Position */);
                    clipboardText = await this.j.readText();
                    if (!state.validate(this.h)) {
                        return;
                    }
                }
                snippetController2_1.$05.get(this.h)?.insert(snippet.codeSnippet, {
                    overwriteBefore: snippet.prefix.length, overwriteAfter: 0,
                    clipboardText
                });
            }
            else if (this.f.length > 1) {
                // two or more -> show IntelliSense box
                if (this.g) {
                    (0, suggest_1.$55)(this.h, this.g);
                }
            }
        }
    };
    exports.$qmb = $qmb;
    exports.$qmb = $qmb = $qmb_1 = __decorate([
        __param(1, snippets_1.$amb),
        __param(2, clipboardService_1.$UZ),
        __param(3, languageFeatures_1.$hF),
        __param(4, contextkey_1.$3i)
    ], $qmb);
    (0, editorExtensions_1.$AV)($qmb.ID, $qmb, 0 /* EditorContributionInstantiation.Eager */); // eager because it needs to define a context key
    const TabCompletionCommand = editorExtensions_1.$rV.bindToContribution($qmb.get);
    (0, editorExtensions_1.$wV)(new TabCompletionCommand({
        id: 'insertSnippet',
        precondition: $qmb.ContextKey,
        handler: x => x.performSnippetCompletions(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */,
            kbExpr: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.editorTextFocus, editorContextKeys_1.EditorContextKeys.tabDoesNotMoveFocus, snippetController2_1.$05.InSnippetMode.toNegated()),
            primary: 2 /* KeyCode.Tab */
        }
    }));
});
//# sourceMappingURL=tabCompletion.js.map