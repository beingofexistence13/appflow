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
    var TabCompletionController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TabCompletionController = void 0;
    let TabCompletionController = class TabCompletionController {
        static { TabCompletionController_1 = this; }
        static { this.ID = 'editor.tabCompletionController'; }
        static { this.ContextKey = new contextkey_1.RawContextKey('hasSnippetCompletions', undefined); }
        static get(editor) {
            return editor.getContribution(TabCompletionController_1.ID);
        }
        constructor(_editor, _snippetService, _clipboardService, _languageFeaturesService, contextKeyService) {
            this._editor = _editor;
            this._snippetService = _snippetService;
            this._clipboardService = _clipboardService;
            this._languageFeaturesService = _languageFeaturesService;
            this._activeSnippets = [];
            this._hasSnippets = TabCompletionController_1.ContextKey.bindTo(contextKeyService);
            this._configListener = this._editor.onDidChangeConfiguration(e => {
                if (e.hasChanged(122 /* EditorOption.tabCompletion */)) {
                    this._update();
                }
            });
            this._update();
        }
        dispose() {
            this._configListener.dispose();
            this._selectionListener?.dispose();
        }
        _update() {
            const enabled = this._editor.getOption(122 /* EditorOption.tabCompletion */) === 'onlySnippets';
            if (this._enabled !== enabled) {
                this._enabled = enabled;
                if (!this._enabled) {
                    this._selectionListener?.dispose();
                }
                else {
                    this._selectionListener = this._editor.onDidChangeCursorSelection(e => this._updateSnippets());
                    if (this._editor.getModel()) {
                        this._updateSnippets();
                    }
                }
            }
        }
        _updateSnippets() {
            // reset first
            this._activeSnippets = [];
            this._completionProvider?.dispose();
            if (!this._editor.hasModel()) {
                return;
            }
            // lots of dance for getting the
            const selection = this._editor.getSelection();
            const model = this._editor.getModel();
            model.tokenization.tokenizeIfCheap(selection.positionLineNumber);
            const id = model.getLanguageIdAtPosition(selection.positionLineNumber, selection.positionColumn);
            const snippets = this._snippetService.getSnippetsSync(id);
            if (!snippets) {
                // nothing for this language
                this._hasSnippets.set(false);
                return;
            }
            if (range_1.Range.isEmpty(selection)) {
                // empty selection -> real text (no whitespace) left of cursor
                const prefix = (0, snippetsService_1.getNonWhitespacePrefix)(model, selection.getPosition());
                if (prefix) {
                    for (const snippet of snippets) {
                        if (prefix.endsWith(snippet.prefix)) {
                            this._activeSnippets.push(snippet);
                        }
                    }
                }
            }
            else if (!range_1.Range.spansMultipleLines(selection) && model.getValueLengthInRange(selection) <= 100) {
                // actual selection -> snippet must be a full match
                const selected = model.getValueInRange(selection);
                if (selected) {
                    for (const snippet of snippets) {
                        if (selected === snippet.prefix) {
                            this._activeSnippets.push(snippet);
                        }
                    }
                }
            }
            const len = this._activeSnippets.length;
            if (len === 0) {
                this._hasSnippets.set(false);
            }
            else if (len === 1) {
                this._hasSnippets.set(true);
            }
            else {
                this._hasSnippets.set(true);
                this._completionProvider = {
                    _debugDisplayName: 'tabCompletion',
                    dispose: () => {
                        registration.dispose();
                    },
                    provideCompletionItems: (_model, position) => {
                        if (_model !== model || !selection.containsPosition(position)) {
                            return;
                        }
                        const suggestions = this._activeSnippets.map(snippet => {
                            const range = range_1.Range.fromPositions(position.delta(0, -snippet.prefix.length), position);
                            return new snippetCompletionProvider_1.SnippetCompletion(snippet, range);
                        });
                        return { suggestions };
                    }
                };
                const registration = this._languageFeaturesService.completionProvider.register({ language: model.getLanguageId(), pattern: model.uri.fsPath, scheme: model.uri.scheme }, this._completionProvider);
            }
        }
        async performSnippetCompletions() {
            if (!this._editor.hasModel()) {
                return;
            }
            if (this._activeSnippets.length === 1) {
                // one -> just insert
                const [snippet] = this._activeSnippets;
                // async clipboard access might be required and in that case
                // we need to check if the editor has changed in flight and then
                // bail out (or be smarter than that)
                let clipboardText;
                if (snippet.needsClipboard) {
                    const state = new editorState_1.EditorState(this._editor, 1 /* CodeEditorStateFlag.Value */ | 4 /* CodeEditorStateFlag.Position */);
                    clipboardText = await this._clipboardService.readText();
                    if (!state.validate(this._editor)) {
                        return;
                    }
                }
                snippetController2_1.SnippetController2.get(this._editor)?.insert(snippet.codeSnippet, {
                    overwriteBefore: snippet.prefix.length, overwriteAfter: 0,
                    clipboardText
                });
            }
            else if (this._activeSnippets.length > 1) {
                // two or more -> show IntelliSense box
                if (this._completionProvider) {
                    (0, suggest_1.showSimpleSuggestions)(this._editor, this._completionProvider);
                }
            }
        }
    };
    exports.TabCompletionController = TabCompletionController;
    exports.TabCompletionController = TabCompletionController = TabCompletionController_1 = __decorate([
        __param(1, snippets_1.ISnippetsService),
        __param(2, clipboardService_1.IClipboardService),
        __param(3, languageFeatures_1.ILanguageFeaturesService),
        __param(4, contextkey_1.IContextKeyService)
    ], TabCompletionController);
    (0, editorExtensions_1.registerEditorContribution)(TabCompletionController.ID, TabCompletionController, 0 /* EditorContributionInstantiation.Eager */); // eager because it needs to define a context key
    const TabCompletionCommand = editorExtensions_1.EditorCommand.bindToContribution(TabCompletionController.get);
    (0, editorExtensions_1.registerEditorCommand)(new TabCompletionCommand({
        id: 'insertSnippet',
        precondition: TabCompletionController.ContextKey,
        handler: x => x.performSnippetCompletions(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */,
            kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.editorTextFocus, editorContextKeys_1.EditorContextKeys.tabDoesNotMoveFocus, snippetController2_1.SnippetController2.InSnippetMode.toNegated()),
            primary: 2 /* KeyCode.Tab */
        }
    }));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFiQ29tcGxldGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NuaXBwZXRzL2Jyb3dzZXIvdGFiQ29tcGxldGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBdUJ6RixJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF1Qjs7aUJBRW5CLE9BQUUsR0FBRyxnQ0FBZ0MsQUFBbkMsQ0FBb0M7aUJBRXRDLGVBQVUsR0FBRyxJQUFJLDBCQUFhLENBQVUsdUJBQXVCLEVBQUUsU0FBUyxDQUFDLEFBQWpFLENBQWtFO1FBRTVGLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBbUI7WUFDN0IsT0FBTyxNQUFNLENBQUMsZUFBZSxDQUEwQix5QkFBdUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNwRixDQUFDO1FBVUQsWUFDa0IsT0FBb0IsRUFDbkIsZUFBa0QsRUFDakQsaUJBQXFELEVBQzlDLHdCQUFtRSxFQUN6RSxpQkFBcUM7WUFKeEMsWUFBTyxHQUFQLE9BQU8sQ0FBYTtZQUNGLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQUNoQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1lBQzdCLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7WUFQdEYsb0JBQWUsR0FBYyxFQUFFLENBQUM7WUFVdkMsSUFBSSxDQUFDLFlBQVksR0FBRyx5QkFBdUIsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDakYsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNoRSxJQUFJLENBQUMsQ0FBQyxVQUFVLHNDQUE0QixFQUFFO29CQUM3QyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7aUJBQ2Y7WUFDRixDQUFDLENBQUMs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