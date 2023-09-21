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
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/editor/common/core/selection", "vs/editor/common/services/editorWorker", "vs/editor/contrib/suggest/browser/wordDistance", "vs/platform/clipboard/common/clipboardService", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/log/common/log", "vs/platform/telemetry/common/telemetry", "./completionModel", "./suggest", "vs/editor/common/services/languageFeatures", "vs/base/common/filters", "vs/base/common/types", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionContextKeys", "vs/editor/contrib/snippet/browser/snippetController2", "vs/platform/environment/common/environment"], function (require, exports, async_1, cancellation_1, errors_1, event_1, lifecycle_1, strings_1, selection_1, editorWorker_1, wordDistance_1, clipboardService_1, configuration_1, contextkey_1, log_1, telemetry_1, completionModel_1, suggest_1, languageFeatures_1, filters_1, types_1, inlineCompletionContextKeys_1, snippetController2_1, environment_1) {
    "use strict";
    var $_5_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$_5 = exports.State = exports.$$5 = void 0;
    class $$5 {
        static shouldAutoTrigger(editor) {
            if (!editor.hasModel()) {
                return false;
            }
            const model = editor.getModel();
            const pos = editor.getPosition();
            model.tokenization.tokenizeIfCheap(pos.lineNumber);
            const word = model.getWordAtPosition(pos);
            if (!word) {
                return false;
            }
            if (word.endColumn !== pos.column &&
                word.startColumn + 1 !== pos.column /* after typing a single character before a word */) {
                return false;
            }
            if (!isNaN(Number(word.word))) {
                return false;
            }
            return true;
        }
        constructor(model, position, triggerOptions) {
            this.leadingLineContent = model.getLineContent(position.lineNumber).substr(0, position.column - 1);
            this.leadingWord = model.getWordUntilPosition(position);
            this.lineNumber = position.lineNumber;
            this.column = position.column;
            this.triggerOptions = triggerOptions;
        }
    }
    exports.$$5 = $$5;
    var State;
    (function (State) {
        State[State["Idle"] = 0] = "Idle";
        State[State["Manual"] = 1] = "Manual";
        State[State["Auto"] = 2] = "Auto";
    })(State || (exports.State = State = {}));
    function canShowQuickSuggest(editor, contextKeyService, configurationService) {
        if (!Boolean(contextKeyService.getContextKeyValue(inlineCompletionContextKeys_1.$95.inlineSuggestionVisible.key))) {
            // Allow if there is no inline suggestion.
            return true;
        }
        const suppressSuggestions = contextKeyService.getContextKeyValue(inlineCompletionContextKeys_1.$95.suppressSuggestions.key);
        if (suppressSuggestions !== undefined) {
            return !suppressSuggestions;
        }
        return !editor.getOption(62 /* EditorOption.inlineSuggest */).suppressSuggestions;
    }
    function canShowSuggestOnTriggerCharacters(editor, contextKeyService, configurationService) {
        if (!Boolean(contextKeyService.getContextKeyValue('inlineSuggestionVisible'))) {
            // Allow if there is no inline suggestion.
            return true;
        }
        const suppressSuggestions = contextKeyService.getContextKeyValue(inlineCompletionContextKeys_1.$95.suppressSuggestions.key);
        if (suppressSuggestions !== undefined) {
            return !suppressSuggestions;
        }
        return !editor.getOption(62 /* EditorOption.inlineSuggest */).suppressSuggestions;
    }
    let $_5 = $_5_1 = class $_5 {
        constructor(n, o, p, q, r, s, t, u, v) {
            this.n = n;
            this.o = o;
            this.p = p;
            this.q = q;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.v = v;
            this.a = new lifecycle_1.$jc();
            this.b = new lifecycle_1.$jc();
            this.c = new async_1.$Qg();
            this.d = undefined;
            this.j = new lifecycle_1.$jc();
            this.k = new event_1.$fd();
            this.l = new event_1.$fd();
            this.m = new event_1.$fd();
            this.onDidCancel = this.k.event;
            this.onDidTrigger = this.l.event;
            this.onDidSuggest = this.m.event;
            this.C = 0;
            this.h = this.n.getSelection() || new selection_1.$ms(1, 1, 1, 1);
            // wire up various listeners
            this.a.add(this.n.onDidChangeModel(() => {
                this.w();
                this.cancel();
            }));
            this.a.add(this.n.onDidChangeModelLanguage(() => {
                this.w();
                this.cancel();
            }));
            this.a.add(this.n.onDidChangeConfiguration(() => {
                this.w();
            }));
            this.a.add(this.u.completionProvider.onDidChange(() => {
                this.w();
                this.x();
            }));
            let editorIsComposing = false;
            this.a.add(this.n.onDidCompositionStart(() => {
                editorIsComposing = true;
            }));
            this.a.add(this.n.onDidCompositionEnd(() => {
                editorIsComposing = false;
                this.z();
            }));
            this.a.add(this.n.onDidChangeCursorSelection(e => {
                // only trigger suggest when the editor isn't composing a character
                if (!editorIsComposing) {
                    this.y(e);
                }
            }));
            this.a.add(this.n.onDidChangeModelContent(() => {
                // only filter completions when the editor isn't composing a character
                // allow-any-unicode-next-line
                // e.g. ¨ + u makes ü but just ¨ cannot be used for filtering
                if (!editorIsComposing && this.d !== undefined) {
                    this.B();
                }
            }));
            this.w();
        }
        dispose() {
            (0, lifecycle_1.$fc)(this.b);
            (0, lifecycle_1.$fc)([this.k, this.m, this.l, this.c]);
            this.a.dispose();
            this.j.dispose();
            this.cancel();
        }
        w() {
            this.b.clear();
            if (this.n.getOption(90 /* EditorOption.readOnly */)
                || !this.n.hasModel()
                || !this.n.getOption(120 /* EditorOption.suggestOnTriggerCharacters */)) {
                return;
            }
            const supportsByTriggerCharacter = new Map();
            for (const support of this.u.completionProvider.all(this.n.getModel())) {
                for (const ch of support.triggerCharacters || []) {
                    let set = supportsByTriggerCharacter.get(ch);
                    if (!set) {
                        set = new Set();
                        set.add((0, suggest_1.$Z5)());
                        supportsByTriggerCharacter.set(ch, set);
                    }
                    set.add(support);
                }
            }
            const checkTriggerCharacter = (text) => {
                if (!canShowSuggestOnTriggerCharacters(this.n, this.s, this.t)) {
                    return;
                }
                if ($$5.shouldAutoTrigger(this.n)) {
                    // don't trigger by trigger characters when this is a case for quick suggest
                    return;
                }
                if (!text) {
                    // came here from the compositionEnd-event
                    const position = this.n.getPosition();
                    const model = this.n.getModel();
                    text = model.getLineContent(position.lineNumber).substr(0, position.column - 1);
                }
                let lastChar = '';
                if ((0, strings_1.$Re)(text.charCodeAt(text.length - 1))) {
                    if ((0, strings_1.$Qe)(text.charCodeAt(text.length - 2))) {
                        lastChar = text.substr(text.length - 2);
                    }
                }
                else {
                    lastChar = text.charAt(text.length - 1);
                }
                const supports = supportsByTriggerCharacter.get(lastChar);
                if (supports) {
                    // keep existing items that where not computed by the
                    // supports/providers that want to trigger now
                    const providerItemsToReuse = new Map();
                    if (this.i) {
                        for (const [provider, items] of this.i.getItemsByProvider()) {
                            if (!supports.has(provider)) {
                                providerItemsToReuse.set(provider, items);
                            }
                        }
                    }
                    this.trigger({
                        auto: true,
                        triggerKind: 1 /* CompletionTriggerKind.TriggerCharacter */,
                        triggerCharacter: lastChar,
                        retrigger: Boolean(this.i),
                        clipboardText: this.i?.clipboardText,
                        completionOptions: { providerFilter: supports, providerItemsToReuse }
                    });
                }
            };
            this.b.add(this.n.onDidType(checkTriggerCharacter));
            this.b.add(this.n.onDidCompositionEnd(() => checkTriggerCharacter()));
        }
        // --- trigger/retrigger/cancel suggest
        get state() {
            if (!this.d) {
                return 0 /* State.Idle */;
            }
            else if (!this.d.auto) {
                return 1 /* State.Manual */;
            }
            else {
                return 2 /* State.Auto */;
            }
        }
        cancel(retrigger = false) {
            if (this.d !== undefined) {
                this.c.cancel();
                this.f?.cancel();
                this.f = undefined;
                this.d = undefined;
                this.i = undefined;
                this.g = undefined;
                this.k.fire({ retrigger });
            }
        }
        clear() {
            this.j.clear();
        }
        x() {
            if (this.d !== undefined) {
                if (!this.n.hasModel() || !this.u.completionProvider.has(this.n.getModel())) {
                    this.cancel();
                }
                else {
                    this.trigger({ auto: this.d.auto, retrigger: true });
                }
            }
        }
        y(e) {
            if (!this.n.hasModel()) {
                return;
            }
            const prevSelection = this.h;
            this.h = this.n.getSelection();
            if (!e.selection.isEmpty()
                || (e.reason !== 0 /* CursorChangeReason.NotSet */ && e.reason !== 3 /* CursorChangeReason.Explicit */)
                || (e.source !== 'keyboard' && e.source !== 'deleteLeft')) {
                // Early exit if nothing needs to be done!
                // Leave some form of early exit check here if you wish to continue being a cursor position change listener ;)
                this.cancel();
                return;
            }
            if (this.d === undefined && e.reason === 0 /* CursorChangeReason.NotSet */) {
                if (prevSelection.containsRange(this.h) || prevSelection.getEndPosition().isBeforeOrEqual(this.h.getPosition())) {
                    // cursor did move RIGHT due to typing -> trigger quick suggest
                    this.A();
                }
            }
            else if (this.d !== undefined && e.reason === 3 /* CursorChangeReason.Explicit */) {
                // suggest is active and something like cursor keys are used to move
                // the cursor. this means we can refilter at the new position
                this.B();
            }
        }
        z() {
            // trigger or refilter when composition ends
            if (this.d === undefined) {
                this.A();
            }
            else {
                this.B();
            }
        }
        A() {
            if (suggest_1.$65.isAllOff(this.n.getOption(88 /* EditorOption.quickSuggestions */))) {
                // not enabled
                return;
            }
            if (this.n.getOption(117 /* EditorOption.suggest */).snippetsPreventQuickSuggestions && snippetController2_1.$05.get(this.n)?.isInSnippet()) {
                // no quick suggestion when in snippet mode
                return;
            }
            this.cancel();
            this.c.cancelAndSet(() => {
                if (this.d !== undefined) {
                    return;
                }
                if (!$$5.shouldAutoTrigger(this.n)) {
                    return;
                }
                if (!this.n.hasModel() || !this.n.hasWidgetFocus()) {
                    return;
                }
                const model = this.n.getModel();
                const pos = this.n.getPosition();
                // validate enabled now
                const config = this.n.getOption(88 /* EditorOption.quickSuggestions */);
                if (suggest_1.$65.isAllOff(config)) {
                    return;
                }
                if (!suggest_1.$65.isAllOn(config)) {
                    // Check the type of the token that triggered this
                    model.tokenization.tokenizeIfCheap(pos.lineNumber);
                    const lineTokens = model.tokenization.getLineTokens(pos.lineNumber);
                    const tokenType = lineTokens.getStandardTokenType(lineTokens.findTokenIndexAtOffset(Math.max(pos.column - 1 - 1, 0)));
                    if (suggest_1.$65.valueFor(config, tokenType) !== 'on') {
                        return;
                    }
                }
                if (!canShowQuickSuggest(this.n, this.s, this.t)) {
                    // do not trigger quick suggestions if inline suggestions are shown
                    return;
                }
                if (!this.u.completionProvider.has(model)) {
                    return;
                }
                // we made it till here -> trigger now
                this.trigger({ auto: true });
            }, this.n.getOption(89 /* EditorOption.quickSuggestionsDelay */));
        }
        B() {
            (0, types_1.$tf)(this.n.hasModel());
            (0, types_1.$tf)(this.d !== undefined);
            const model = this.n.getModel();
            const position = this.n.getPosition();
            const ctx = new $$5(model, position, { ...this.d, refilter: true });
            this.F(ctx);
        }
        trigger(options) {
            if (!this.n.hasModel()) {
                return;
            }
            const model = this.n.getModel();
            const ctx = new $$5(model, this.n.getPosition(), options);
            // Cancel previous requests, change state & update UI
            this.cancel(options.retrigger);
            this.d = options;
            this.l.fire({ auto: options.auto, shy: options.shy ?? false, position: this.n.getPosition() });
            // Capture context when request was sent
            this.g = ctx;
            // Build context for request
            let suggestCtx = { triggerKind: options.triggerKind ?? 0 /* CompletionTriggerKind.Invoke */ };
            if (options.triggerCharacter) {
                suggestCtx = {
                    triggerKind: 1 /* CompletionTriggerKind.TriggerCharacter */,
                    triggerCharacter: options.triggerCharacter
                };
            }
            this.f = new cancellation_1.$pd();
            // kind filter and snippet sort rules
            const snippetSuggestions = this.n.getOption(111 /* EditorOption.snippetSuggestions */);
            let snippetSortOrder = 1 /* SnippetSortOrder.Inline */;
            switch (snippetSuggestions) {
                case 'top':
                    snippetSortOrder = 0 /* SnippetSortOrder.Top */;
                    break;
                // 	↓ that's the default anyways...
                // case 'inline':
                // 	snippetSortOrder = SnippetSortOrder.Inline;
                // 	break;
                case 'bottom':
                    snippetSortOrder = 2 /* SnippetSortOrder.Bottom */;
                    break;
            }
            const { itemKind: itemKindFilter, showDeprecated } = $_5_1.E(this.n);
            const completionOptions = new suggest_1.$Y5(snippetSortOrder, options.completionOptions?.kindFilter ?? itemKindFilter, options.completionOptions?.providerFilter, options.completionOptions?.providerItemsToReuse, showDeprecated);
            const wordDistance = wordDistance_1.$P5.create(this.o, this.n);
            const completions = (0, suggest_1.$35)(this.u.completionProvider, model, this.n.getPosition(), completionOptions, suggestCtx, this.f.token);
            Promise.all([completions, wordDistance]).then(async ([completions, wordDistance]) => {
                this.f?.dispose();
                if (!this.n.hasModel()) {
                    return;
                }
                let clipboardText = options?.clipboardText;
                if (!clipboardText && completions.needsClipboard) {
                    clipboardText = await this.p.readText();
                }
                if (this.d === undefined) {
                    return;
                }
                const model = this.n.getModel();
                // const items = completions.items;
                // if (existing) {
                // 	const cmpFn = getSuggestionComparator(snippetSortOrder);
                // 	items = items.concat(existing.items).sort(cmpFn);
                // }
                const ctx = new $$5(model, this.n.getPosition(), options);
                const fuzzySearchOptions = {
                    ...filters_1.$Jj.default,
                    firstMatchCanBeWeak: !this.n.getOption(117 /* EditorOption.suggest */).matchOnWordStartOnly
                };
                this.i = new completionModel_1.$85(completions.items, this.g.column, {
                    leadingLineContent: ctx.leadingLineContent,
                    characterCountDelta: ctx.column - this.g.column
                }, wordDistance, this.n.getOption(117 /* EditorOption.suggest */), this.n.getOption(111 /* EditorOption.snippetSuggestions */), fuzzySearchOptions, clipboardText);
                // store containers so that they can be disposed later
                this.j.add(completions.disposable);
                this.F(ctx);
                // finally report telemetry about durations
                this.D(completions.durations);
                // report invalid completions by source
                if (!this.v.isBuilt || this.v.isExtensionDevelopment) {
                    for (const item of completions.items) {
                        if (item.isInvalid) {
                            this.r.warn(`[suggest] did IGNORE invalid completion item from ${item.provider._debugDisplayName}`, item.completion);
                        }
                    }
                }
            }).catch(errors_1.$Y);
        }
        D(durations) {
            if (this.C++ % 230 !== 0) {
                return;
            }
            setTimeout(() => {
                this.q.publicLog2('suggest.durations.json', { data: JSON.stringify(durations) });
                this.r.debug('suggest.durations.json', durations);
            });
        }
        static E(editor) {
            // kind filter and snippet sort rules
            const result = new Set();
            // snippet setting
            const snippetSuggestions = editor.getOption(111 /* EditorOption.snippetSuggestions */);
            if (snippetSuggestions === 'none') {
                result.add(27 /* CompletionItemKind.Snippet */);
            }
            // type setting
            const suggestOptions = editor.getOption(117 /* EditorOption.suggest */);
            if (!suggestOptions.showMethods) {
                result.add(0 /* CompletionItemKind.Method */);
            }
            if (!suggestOptions.showFunctions) {
                result.add(1 /* CompletionItemKind.Function */);
            }
            if (!suggestOptions.showConstructors) {
                result.add(2 /* CompletionItemKind.Constructor */);
            }
            if (!suggestOptions.showFields) {
                result.add(3 /* CompletionItemKind.Field */);
            }
            if (!suggestOptions.showVariables) {
                result.add(4 /* CompletionItemKind.Variable */);
            }
            if (!suggestOptions.showClasses) {
                result.add(5 /* CompletionItemKind.Class */);
            }
            if (!suggestOptions.showStructs) {
                result.add(6 /* CompletionItemKind.Struct */);
            }
            if (!suggestOptions.showInterfaces) {
                result.add(7 /* CompletionItemKind.Interface */);
            }
            if (!suggestOptions.showModules) {
                result.add(8 /* CompletionItemKind.Module */);
            }
            if (!suggestOptions.showProperties) {
                result.add(9 /* CompletionItemKind.Property */);
            }
            if (!suggestOptions.showEvents) {
                result.add(10 /* CompletionItemKind.Event */);
            }
            if (!suggestOptions.showOperators) {
                result.add(11 /* CompletionItemKind.Operator */);
            }
            if (!suggestOptions.showUnits) {
                result.add(12 /* CompletionItemKind.Unit */);
            }
            if (!suggestOptions.showValues) {
                result.add(13 /* CompletionItemKind.Value */);
            }
            if (!suggestOptions.showConstants) {
                result.add(14 /* CompletionItemKind.Constant */);
            }
            if (!suggestOptions.showEnums) {
                result.add(15 /* CompletionItemKind.Enum */);
            }
            if (!suggestOptions.showEnumMembers) {
                result.add(16 /* CompletionItemKind.EnumMember */);
            }
            if (!suggestOptions.showKeywords) {
                result.add(17 /* CompletionItemKind.Keyword */);
            }
            if (!suggestOptions.showWords) {
                result.add(18 /* CompletionItemKind.Text */);
            }
            if (!suggestOptions.showColors) {
                result.add(19 /* CompletionItemKind.Color */);
            }
            if (!suggestOptions.showFiles) {
                result.add(20 /* CompletionItemKind.File */);
            }
            if (!suggestOptions.showReferences) {
                result.add(21 /* CompletionItemKind.Reference */);
            }
            if (!suggestOptions.showColors) {
                result.add(22 /* CompletionItemKind.Customcolor */);
            }
            if (!suggestOptions.showFolders) {
                result.add(23 /* CompletionItemKind.Folder */);
            }
            if (!suggestOptions.showTypeParameters) {
                result.add(24 /* CompletionItemKind.TypeParameter */);
            }
            if (!suggestOptions.showSnippets) {
                result.add(27 /* CompletionItemKind.Snippet */);
            }
            if (!suggestOptions.showUsers) {
                result.add(25 /* CompletionItemKind.User */);
            }
            if (!suggestOptions.showIssues) {
                result.add(26 /* CompletionItemKind.Issue */);
            }
            return { itemKind: result, showDeprecated: suggestOptions.showDeprecated };
        }
        F(ctx) {
            if (!this.g) {
                // happens when 24x7 IntelliSense is enabled and still in its delay
                return;
            }
            if (ctx.lineNumber !== this.g.lineNumber) {
                // e.g. happens when pressing Enter while IntelliSense is computed
                this.cancel();
                return;
            }
            if ((0, strings_1.$Ce)(ctx.leadingLineContent) !== (0, strings_1.$Ce)(this.g.leadingLineContent)) {
                // cancel IntelliSense when line start changes
                // happens when the current word gets outdented
                this.cancel();
                return;
            }
            if (ctx.column < this.g.column) {
                // typed -> moved cursor LEFT -> retrigger if still on a word
                if (ctx.leadingWord.word) {
                    this.trigger({ auto: this.g.triggerOptions.auto, retrigger: true });
                }
                else {
                    this.cancel();
                }
                return;
            }
            if (!this.i) {
                // happens when IntelliSense is not yet computed
                return;
            }
            if (ctx.leadingWord.word.length !== 0 && ctx.leadingWord.startColumn > this.g.leadingWord.startColumn) {
                // started a new word while IntelliSense shows -> retrigger but reuse all items that we currently have
                const shouldAutoTrigger = $$5.shouldAutoTrigger(this.n);
                if (shouldAutoTrigger && this.g) {
                    // shouldAutoTrigger forces tokenization, which can cause pending cursor change events to be emitted, which can cause
                    // suggestions to be cancelled, which causes `this._context` to be undefined
                    const map = this.i.getItemsByProvider();
                    this.trigger({
                        auto: this.g.triggerOptions.auto,
                        retrigger: true,
                        clipboardText: this.i.clipboardText,
                        completionOptions: { providerItemsToReuse: map }
                    });
                }
                return;
            }
            if (ctx.column > this.g.column && this.i.getIncompleteProvider().size > 0 && ctx.leadingWord.word.length !== 0) {
                // typed -> moved cursor RIGHT & incomple model & still on a word -> retrigger
                const providerItemsToReuse = new Map();
                const providerFilter = new Set();
                for (const [provider, items] of this.i.getItemsByProvider()) {
                    if (items.length > 0 && items[0].container.incomplete) {
                        providerFilter.add(provider);
                    }
                    else {
                        providerItemsToReuse.set(provider, items);
                    }
                }
                this.trigger({
                    auto: this.g.triggerOptions.auto,
                    triggerKind: 2 /* CompletionTriggerKind.TriggerForIncompleteCompletions */,
                    retrigger: true,
                    clipboardText: this.i.clipboardText,
                    completionOptions: { providerFilter, providerItemsToReuse }
                });
            }
            else {
                // typed -> moved cursor RIGHT -> update UI
                const oldLineContext = this.i.lineContext;
                let isFrozen = false;
                this.i.lineContext = {
                    leadingLineContent: ctx.leadingLineContent,
                    characterCountDelta: ctx.column - this.g.column
                };
                if (this.i.items.length === 0) {
                    const shouldAutoTrigger = $$5.shouldAutoTrigger(this.n);
                    if (!this.g) {
                        // shouldAutoTrigger forces tokenization, which can cause pending cursor change events to be emitted, which can cause
                        // suggestions to be cancelled, which causes `this._context` to be undefined
                        this.cancel();
                        return;
                    }
                    if (shouldAutoTrigger && this.g.leadingWord.endColumn < ctx.leadingWord.startColumn) {
                        // retrigger when heading into a new word
                        this.trigger({ auto: this.g.triggerOptions.auto, retrigger: true });
                        return;
                    }
                    if (!this.g.triggerOptions.auto) {
                        // freeze when IntelliSense was manually requested
                        this.i.lineContext = oldLineContext;
                        isFrozen = this.i.items.length > 0;
                        if (isFrozen && ctx.leadingWord.word.length === 0) {
                            // there were results before but now there aren't
                            // and also we are not on a word anymore -> cancel
                            this.cancel();
                            return;
                        }
                    }
                    else {
                        // nothing left
                        this.cancel();
                        return;
                    }
                }
                this.m.fire({
                    completionModel: this.i,
                    triggerOptions: ctx.triggerOptions,
                    isFrozen,
                });
            }
        }
    };
    exports.$_5 = $_5;
    exports.$_5 = $_5 = $_5_1 = __decorate([
        __param(1, editorWorker_1.$4Y),
        __param(2, clipboardService_1.$UZ),
        __param(3, telemetry_1.$9k),
        __param(4, log_1.$5i),
        __param(5, contextkey_1.$3i),
        __param(6, configuration_1.$8h),
        __param(7, languageFeatures_1.$hF),
        __param(8, environment_1.$Ih)
    ], $_5);
});
//# sourceMappingURL=suggestModel.js.map