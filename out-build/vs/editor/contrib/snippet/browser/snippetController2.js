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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/types", "vs/editor/browser/editorExtensions", "vs/editor/common/core/position", "vs/editor/common/editorContextKeys", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/suggest/browser/suggest", "vs/nls!vs/editor/contrib/snippet/browser/snippetController2", "vs/platform/contextkey/common/contextkey", "vs/platform/log/common/log", "./snippetSession"], function (require, exports, lifecycle_1, types_1, editorExtensions_1, position_1, editorContextKeys_1, languageConfigurationRegistry_1, languageFeatures_1, suggest_1, nls_1, contextkey_1, log_1, snippetSession_1) {
    "use strict";
    var $05_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$05 = void 0;
    const _defaultOptions = {
        overwriteBefore: 0,
        overwriteAfter: 0,
        undoStopBefore: true,
        undoStopAfter: true,
        adjustWhitespace: true,
        clipboardText: undefined,
        overtypingCapturer: undefined
    };
    let $05 = class $05 {
        static { $05_1 = this; }
        static { this.ID = 'snippetController2'; }
        static get(editor) {
            return editor.getContribution($05_1.ID);
        }
        static { this.InSnippetMode = new contextkey_1.$2i('inSnippetMode', false, (0, nls_1.localize)(0, null)); }
        static { this.HasNextTabstop = new contextkey_1.$2i('hasNextTabstop', false, (0, nls_1.localize)(1, null)); }
        static { this.HasPrevTabstop = new contextkey_1.$2i('hasPrevTabstop', false, (0, nls_1.localize)(2, null)); }
        constructor(k, l, m, contextKeyService, n) {
            this.k = k;
            this.l = l;
            this.m = m;
            this.n = n;
            this.f = new lifecycle_1.$jc();
            this.g = -1;
            this.a = $05_1.InSnippetMode.bindTo(contextKeyService);
            this.b = $05_1.HasNextTabstop.bindTo(contextKeyService);
            this.c = $05_1.HasPrevTabstop.bindTo(contextKeyService);
        }
        dispose() {
            this.a.reset();
            this.c.reset();
            this.b.reset();
            this.d?.dispose();
            this.f.dispose();
        }
        apply(edits, opts) {
            try {
                this.p(edits, typeof opts === 'undefined' ? _defaultOptions : { ..._defaultOptions, ...opts });
            }
            catch (e) {
                this.cancel();
                this.l.error(e);
                this.l.error('snippet_error');
                this.l.error('insert_edits=', edits);
                this.l.error('existing_template=', this.d ? this.d._logInfo() : '<no_session>');
            }
        }
        insert(template, opts) {
            // this is here to find out more about the yet-not-understood
            // error that sometimes happens when we fail to inserted a nested
            // snippet
            try {
                this.p(template, typeof opts === 'undefined' ? _defaultOptions : { ..._defaultOptions, ...opts });
            }
            catch (e) {
                this.cancel();
                this.l.error(e);
                this.l.error('snippet_error');
                this.l.error('insert_template=', template);
                this.l.error('existing_template=', this.d ? this.d._logInfo() : '<no_session>');
            }
        }
        p(template, opts) {
            if (!this.k.hasModel()) {
                return;
            }
            // don't listen while inserting the snippet
            // as that is the inflight state causing cancelation
            this.f.clear();
            if (opts.undoStopBefore) {
                this.k.getModel().pushStackElement();
            }
            // don't merge
            if (this.d && typeof template !== 'string') {
                this.cancel();
            }
            if (!this.d) {
                this.g = this.k.getModel().getAlternativeVersionId();
                this.d = new snippetSession_1.$l6(this.k, template, opts, this.n);
                this.d.insert();
            }
            else {
                (0, types_1.$tf)(typeof template === 'string');
                this.d.merge(template, opts);
            }
            if (opts.undoStopAfter) {
                this.k.getModel().pushStackElement();
            }
            // regster completion item provider when there is any choice element
            if (this.d?.hasChoice) {
                const provider = {
                    _debugDisplayName: 'snippetChoiceCompletions',
                    provideCompletionItems: (model, position) => {
                        if (!this.d || model !== this.k.getModel() || !position_1.$js.equals(this.k.getPosition(), position)) {
                            return undefined;
                        }
                        const { activeChoice } = this.d;
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
                                command: { id: 'jumpToNextSnippetPlaceholder', title: (0, nls_1.localize)(3, null) }
                            });
                        }
                        return { suggestions };
                    }
                };
                const model = this.k.getModel();
                let registration;
                let isRegistered = false;
                const disable = () => {
                    registration?.dispose();
                    isRegistered = false;
                };
                const enable = () => {
                    if (!isRegistered) {
                        registration = this.m.completionProvider.register({
                            language: model.getLanguageId(),
                            pattern: model.uri.fsPath,
                            scheme: model.uri.scheme,
                            exclusive: true
                        }, provider);
                        this.f.add(registration);
                        isRegistered = true;
                    }
                };
                this.j = { provider, enable, disable };
            }
            this.q();
            this.f.add(this.k.onDidChangeModelContent(e => e.isFlush && this.cancel()));
            this.f.add(this.k.onDidChangeModel(() => this.cancel()));
            this.f.add(this.k.onDidChangeCursorSelection(() => this.q()));
        }
        q() {
            if (!this.d || !this.k.hasModel()) {
                // canceled in the meanwhile
                return;
            }
            if (this.g === this.k.getModel().getAlternativeVersionId()) {
                // undo until the 'before' state happened
                // and makes use cancel snippet mode
                return this.cancel();
            }
            if (!this.d.hasPlaceholder) {
                // don't listen for selection changes and don't
                // update context keys when the snippet is plain text
                return this.cancel();
            }
            if (this.d.isAtLastPlaceholder || !this.d.isSelectionWithinPlaceholders()) {
                this.k.getModel().pushStackElement();
                return this.cancel();
            }
            this.a.set(true);
            this.c.set(!this.d.isAtFirstPlaceholder);
            this.b.set(!this.d.isAtLastPlaceholder);
            this.r();
        }
        r() {
            if (!this.d || !this.k.hasModel()) {
                this.h = undefined;
                return;
            }
            const { activeChoice } = this.d;
            if (!activeChoice || !this.j) {
                this.j?.disable();
                this.h = undefined;
                return;
            }
            if (this.h !== activeChoice.choice) {
                this.h = activeChoice.choice;
                this.j.enable();
                // trigger suggest with the special choice completion provider
                queueMicrotask(() => {
                    (0, suggest_1.$55)(this.k, this.j.provider);
                });
            }
        }
        finish() {
            while (this.a.get()) {
                this.next();
            }
        }
        cancel(resetSelection = false) {
            this.a.reset();
            this.c.reset();
            this.b.reset();
            this.f.clear();
            this.h = undefined;
            this.d?.dispose();
            this.d = undefined;
            this.g = -1;
            if (resetSelection) {
                // reset selection to the primary cursor when being asked
                // for. this happens when explicitly cancelling snippet mode,
                // e.g. when pressing ESC
                this.k.setSelections([this.k.getSelection()]);
            }
        }
        prev() {
            this.d?.prev();
            this.q();
        }
        next() {
            this.d?.next();
            this.q();
        }
        isInSnippet() {
            return Boolean(this.a.get());
        }
        getSessionEnclosingRange() {
            if (this.d) {
                return this.d.getEnclosingRange();
            }
            return undefined;
        }
    };
    exports.$05 = $05;
    exports.$05 = $05 = $05_1 = __decorate([
        __param(1, log_1.$5i),
        __param(2, languageFeatures_1.$hF),
        __param(3, contextkey_1.$3i),
        __param(4, languageConfigurationRegistry_1.$2t)
    ], $05);
    (0, editorExtensions_1.$AV)($05.ID, $05, 4 /* EditorContributionInstantiation.Lazy */);
    const CommandCtor = editorExtensions_1.$rV.bindToContribution($05.get);
    (0, editorExtensions_1.$wV)(new CommandCtor({
        id: 'jumpToNextSnippetPlaceholder',
        precondition: contextkey_1.$Ii.and($05.InSnippetMode, $05.HasNextTabstop),
        handler: ctrl => ctrl.next(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 30,
            kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
            primary: 2 /* KeyCode.Tab */
        }
    }));
    (0, editorExtensions_1.$wV)(new CommandCtor({
        id: 'jumpToPrevSnippetPlaceholder',
        precondition: contextkey_1.$Ii.and($05.InSnippetMode, $05.HasPrevTabstop),
        handler: ctrl => ctrl.prev(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 30,
            kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
            primary: 1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */
        }
    }));
    (0, editorExtensions_1.$wV)(new CommandCtor({
        id: 'leaveSnippet',
        precondition: $05.InSnippetMode,
        handler: ctrl => ctrl.cancel(true),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 30,
            kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
            primary: 9 /* KeyCode.Escape */,
            secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */]
        }
    }));
    (0, editorExtensions_1.$wV)(new CommandCtor({
        id: 'acceptSnippet',
        precondition: $05.InSnippetMode,
        handler: ctrl => ctrl.finish(),
        // kbOpts: {
        // 	weight: KeybindingWeight.EditorContrib + 30,
        // 	kbExpr: EditorContextKeys.textFocus,
        // 	primary: KeyCode.Enter,
        // }
    }));
});
//# sourceMappingURL=snippetController2.js.map