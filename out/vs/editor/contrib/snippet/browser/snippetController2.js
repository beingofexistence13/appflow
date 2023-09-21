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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/types", "vs/editor/browser/editorExtensions", "vs/editor/common/core/position", "vs/editor/common/editorContextKeys", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/suggest/browser/suggest", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/platform/log/common/log", "./snippetSession"], function (require, exports, lifecycle_1, types_1, editorExtensions_1, position_1, editorContextKeys_1, languageConfigurationRegistry_1, languageFeatures_1, suggest_1, nls_1, contextkey_1, log_1, snippetSession_1) {
    "use strict";
    var SnippetController2_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SnippetController2 = void 0;
    const _defaultOptions = {
        overwriteBefore: 0,
        overwriteAfter: 0,
        undoStopBefore: true,
        undoStopAfter: true,
        adjustWhitespace: true,
        clipboardText: undefined,
        overtypingCapturer: undefined
    };
    let SnippetController2 = class SnippetController2 {
        static { SnippetController2_1 = this; }
        static { this.ID = 'snippetController2'; }
        static get(editor) {
            return editor.getContribution(SnippetController2_1.ID);
        }
        static { this.InSnippetMode = new contextkey_1.RawContextKey('inSnippetMode', false, (0, nls_1.localize)('inSnippetMode', "Whether the editor in current in snippet mode")); }
        static { this.HasNextTabstop = new contextkey_1.RawContextKey('hasNextTabstop', false, (0, nls_1.localize)('hasNextTabstop', "Whether there is a next tab stop when in snippet mode")); }
        static { this.HasPrevTabstop = new contextkey_1.RawContextKey('hasPrevTabstop', false, (0, nls_1.localize)('hasPrevTabstop', "Whether there is a previous tab stop when in snippet mode")); }
        constructor(_editor, _logService, _languageFeaturesService, contextKeyService, _languageConfigurationService) {
            this._editor = _editor;
            this._logService = _logService;
            this._languageFeaturesService = _languageFeaturesService;
            this._languageConfigurationService = _languageConfigurationService;
            this._snippetListener = new lifecycle_1.DisposableStore();
            this._modelVersionId = -1;
            this._inSnippet = SnippetController2_1.InSnippetMode.bindTo(contextKeyService);
            this._hasNextTabstop = SnippetController2_1.HasNextTabstop.bindTo(contextKeyService);
            this._hasPrevTabstop = SnippetController2_1.HasPrevTabstop.bindTo(contextKeyService);
        }
        dispose() {
            this._inSnippet.reset();
            this._hasPrevTabstop.reset();
            this._hasNextTabstop.reset();
            this._session?.dispose();
            this._snippetListener.dispose();
        }
        apply(edits, opts) {
            try {
                this._doInsert(edits, typeof opts === 'undefined' ? _defaultOptions : { ..._defaultOptions, ...opts });
            }
            catch (e) {
                this.cancel();
                this._logService.error(e);
                this._logService.error('snippet_error');
                this._logService.error('insert_edits=', edits);
                this._logService.error('existing_template=', this._session ? this._session._logInfo() : '<no_session>');
            }
        }
        insert(template, opts) {
            // this is here to find out more about the yet-not-understood
            // error that sometimes happens when we fail to inserted a nested
            // snippet
            try {
                this._doInsert(template, typeof opts === 'undefined' ? _defaultOptions : { ..._defaultOptions, ...opts });
            }
            catch (e) {
                this.cancel();
                this._logService.error(e);
                this._logService.error('snippet_error');
                this._logService.error('insert_template=', template);
                this._logService.error('existing_template=', this._session ? this._session._logInfo() : '<no_session>');
            }
        }
        _doInsert(template, opts) {
            if (!this._editor.hasModel()) {
                return;
            }
            // don't listen while inserting the snippet
            // as that is the inflight state causing cancelation
            this._snippetListener.clear();
            if (opts.undoStopBefore) {
                this._editor.getModel().pushStackElement();
            }
            // don't merge
            if (this._session && typeof template !== 'string') {
                this.cancel();
            }
            if (!this._session) {
                this._modelVersionId = this._editor.getModel().getAlternativeVersionId();
                this._session = new snippetSession_1.SnippetSession(this._editor, template, opts, this._languageConfigurationService);
                this._session.insert();
            }
            else {
                (0, types_1.assertType)(typeof template === 'string');
                this._session.merge(template, opts);
            }
            if (opts.undoStopAfter) {
                this._editor.getModel().pushStackElement();
            }
            // regster completion item provider when there is any choice element
            if (this._session?.hasChoice) {
                const provider = {
                    _debugDisplayName: 'snippetChoiceCompletions',
                    provideCompletionItems: (model, position) => {
                        if (!this._session || model !== this._editor.getModel() || !position_1.Position.equals(this._editor.getPosition(), position)) {
                            return undefined;
                        }
                        const { activeChoice } = this._session;
                        if (!activeChoice || activeChoice.choice.options.length === 0) {
                            return undefined;
                        }
                        const word = model.getValueInRange(activeChoice.range);
                        const isAnyOfOptions = Boolean(activeChoice.choice.options.find(o => o.value === word));
                        const suggestions = [];
                        for (let i = 0; i < activeChoice.choice.options.length; i++) {
                            const option = activeChoice.choice.options[i];
                            suggestions.push({
                                kind: 13 /* CompletionItemKind.Value */,
                                label: option.value,
                                insertText: option.value,
                                sortText: 'a'.repeat(i + 1),
                                range: activeChoice.range,
                                filterText: isAnyOfOptions ? `${word}_${option.value}` : undefined,
                                command: { id: 'jumpToNextSnippetPlaceholder', title: (0, nls_1.localize)('next', 'Go to next placeholder...') }
                            });
                        }
                        return { suggestions };
                    }
                };
                const model = this._editor.getModel();
                let registration;
                let isRegistered = false;
                const disable = () => {
                    registration?.dispose();
                    isRegistered = false;
                };
                const enable = () => {
                    if (!isRegistered) {
                        registration = this._languageFeaturesService.completionProvider.register({
                            language: model.getLanguageId(),
                            pattern: model.uri.fsPath,
                            scheme: model.uri.scheme,
                            exclusive: true
                        }, provider);
                        this._snippetListener.add(registration);
                        isRegistered = true;
                    }
                };
                this._choiceCompletions = { provider, enable, disable };
            }
            this._updateState();
            this._snippetListener.add(this._editor.onDidChangeModelContent(e => e.isFlush && this.cancel()));
            this._snippetListener.add(this._editor.onDidChangeModel(() => this.cancel()));
            this._snippetListener.add(this._editor.onDidChangeCursorSelection(() => this._updateState()));
        }
        _updateState() {
            if (!this._session || !this._editor.hasModel()) {
                // canceled in the meanwhile
                return;
            }
            if (this._modelVersionId === this._editor.getModel().getAlternativeVersionId()) {
                // undo until the 'before' state happened
                // and makes use cancel snippet mode
                return this.cancel();
            }
            if (!this._session.hasPlaceholder) {
                // don't listen for selection changes and don't
                // update context keys when the snippet is plain text
                return this.cancel();
            }
            if (this._session.isAtLastPlaceholder || !this._session.isSelectionWithinPlaceholders()) {
                this._editor.getModel().pushStackElement();
                return this.cancel();
            }
            this._inSnippet.set(true);
            this._hasPrevTabstop.set(!this._session.isAtFirstPlaceholder);
            this._hasNextTabstop.set(!this._session.isAtLastPlaceholder);
            this._handleChoice();
        }
        _handleChoice() {
            if (!this._session || !this._editor.hasModel()) {
                this._currentChoice = undefined;
                return;
            }
            const { activeChoice } = this._session;
            if (!activeChoice || !this._choiceCompletions) {
                this._choiceCompletions?.disable();
                this._currentChoice = undefined;
                return;
            }
            if (this._currentChoice !== activeChoice.choice) {
                this._currentChoice = activeChoice.choice;
                this._choiceCompletions.enable();
                // trigger suggest with the special choice completion provider
                queueMicrotask(() => {
                    (0, suggest_1.showSimpleSuggestions)(this._editor, this._choiceCompletions.provider);
                });
            }
        }
        finish() {
            while (this._inSnippet.get()) {
                this.next();
            }
        }
        cancel(resetSelection = false) {
            this._inSnippet.reset();
            this._hasPrevTabstop.reset();
            this._hasNextTabstop.reset();
            this._snippetListener.clear();
            this._currentChoice = undefined;
            this._session?.dispose();
            this._session = undefined;
            this._modelVersionId = -1;
            if (resetSelection) {
                // reset selection to the primary cursor when being asked
                // for. this happens when explicitly cancelling snippet mode,
                // e.g. when pressing ESC
                this._editor.setSelections([this._editor.getSelection()]);
            }
        }
        prev() {
            this._session?.prev();
            this._updateState();
        }
        next() {
            this._session?.next();
            this._updateState();
        }
        isInSnippet() {
            return Boolean(this._inSnippet.get());
        }
        getSessionEnclosingRange() {
            if (this._session) {
                return this._session.getEnclosingRange();
            }
            return undefined;
        }
    };
    exports.SnippetController2 = SnippetController2;
    exports.SnippetController2 = SnippetController2 = SnippetController2_1 = __decorate([
        __param(1, log_1.ILogService),
        __param(2, languageFeatures_1.ILanguageFeaturesService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, languageConfigurationRegistry_1.ILanguageConfigurationService)
    ], SnippetController2);
    (0, editorExtensions_1.registerEditorContribution)(SnippetController2.ID, SnippetController2, 4 /* EditorContributionInstantiation.Lazy */);
    const CommandCtor = editorExtensions_1.EditorCommand.bindToContribution(SnippetController2.get);
    (0, editorExtensions_1.registerEditorCommand)(new CommandCtor({
        id: 'jumpToNextSnippetPlaceholder',
        precondition: contextkey_1.ContextKeyExpr.and(SnippetController2.InSnippetMode, SnippetController2.HasNextTabstop),
        handler: ctrl => ctrl.next(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 30,
            kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
            primary: 2 /* KeyCode.Tab */
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new CommandCtor({
        id: 'jumpToPrevSnippetPlaceholder',
        precondition: contextkey_1.ContextKeyExpr.and(SnippetController2.InSnippetMode, SnippetController2.HasPrevTabstop),
        handler: ctrl => ctrl.prev(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 30,
            kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
            primary: 1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new CommandCtor({
        id: 'leaveSnippet',
        precondition: SnippetController2.InSnippetMode,
        handler: ctrl => ctrl.cancel(true),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 30,
            kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
            primary: 9 /* KeyCode.Escape */,
            secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */]
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new CommandCtor({
        id: 'acceptSnippet',
        precondition: SnippetController2.InSnippetMode,
        handler: ctrl => ctrl.finish(),
        // kbOpts: {
        // 	weight: KeybindingWeight.EditorContrib + 30,
        // 	kbExpr: EditorContextKeys.textFocus,
        // 	primary: KeyCode.Enter,
        // }
    }));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25pcHBldENvbnRyb2xsZXIyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvc25pcHBldC9icm93c2VyL3NuaXBwZXRDb250cm9sbGVyMi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBa0NoRyxNQUFNLGVBQWUsR0FBMEI7UUFDOUMsZUFBZSxFQUFFLENBQUM7UUFDbEIsY0FBYyxFQUFFLENBQUM7UUFDakIsY0FBYyxFQUFFLElBQUk7UUFDcEIsYUFBYSxFQUFFLElBQUk7UUFDbkIsZ0JBQWdCLEVBQUUsSUFBSTtRQUN0QixhQUFhLEVBQUUsU0FBUztRQUN4QixrQkFBa0IsRUFBRSxTQUFTO0tBQzdCLENBQUM7SUFFSyxJQUFNLGtCQUFrQixHQUF4QixNQUFNLGtCQUFrQjs7aUJBRVAsT0FBRSxHQUFHLG9CQUFvQixBQUF2QixDQUF3QjtRQUVqRCxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQW1CO1lBQzdCLE9BQU8sTUFBTSxDQUFDLGVBQWUsQ0FBcUIsb0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDMUUsQ0FBQztpQkFFZSxrQkFBYSxHQUFHLElBQUksMEJBQWEsQ0FBQyxlQUFlLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGVBQWUsRUFBRSwrQ0FBK0MsQ0FBQyxDQUFDLEFBQXhILENBQXlIO2lCQUN0SSxtQkFBYyxHQUFHLElBQUksMEJBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsZ0JBQWdCLEVBQUUsdURBQXVELENBQUMsQ0FBQyxBQUFsSSxDQUFtSTtpQkFDakosbUJBQWMsR0FBRyxJQUFJLDBCQUFhLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGdCQUFnQixFQUFFLDJEQUEyRCxDQUFDLENBQUMsQUFBdEksQ0FBdUk7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