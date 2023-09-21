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
    var SuggestModel_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SuggestModel = exports.State = exports.LineContext = void 0;
    class LineContext {
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
    exports.LineContext = LineContext;
    var State;
    (function (State) {
        State[State["Idle"] = 0] = "Idle";
        State[State["Manual"] = 1] = "Manual";
        State[State["Auto"] = 2] = "Auto";
    })(State || (exports.State = State = {}));
    function canShowQuickSuggest(editor, contextKeyService, configurationService) {
        if (!Boolean(contextKeyService.getContextKeyValue(inlineCompletionContextKeys_1.InlineCompletionContextKeys.inlineSuggestionVisible.key))) {
            // Allow if there is no inline suggestion.
            return true;
        }
        const suppressSuggestions = contextKeyService.getContextKeyValue(inlineCompletionContextKeys_1.InlineCompletionContextKeys.suppressSuggestions.key);
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
        const suppressSuggestions = contextKeyService.getContextKeyValue(inlineCompletionContextKeys_1.InlineCompletionContextKeys.suppressSuggestions.key);
        if (suppressSuggestions !== undefined) {
            return !suppressSuggestions;
        }
        return !editor.getOption(62 /* EditorOption.inlineSuggest */).suppressSuggestions;
    }
    let SuggestModel = SuggestModel_1 = class SuggestModel {
        constructor(_editor, _editorWorkerService, _clipboardService, _telemetryService, _logService, _contextKeyService, _configurationService, _languageFeaturesService, _envService) {
            this._editor = _editor;
            this._editorWorkerService = _editorWorkerService;
            this._clipboardService = _clipboardService;
            this._telemetryService = _telemetryService;
            this._logService = _logService;
            this._contextKeyService = _contextKeyService;
            this._configurationService = _configurationService;
            this._languageFeaturesService = _languageFeaturesService;
            this._envService = _envService;
            this._toDispose = new lifecycle_1.DisposableStore();
            this._triggerCharacterListener = new lifecycle_1.DisposableStore();
            this._triggerQuickSuggest = new async_1.TimeoutTimer();
            this._triggerState = undefined;
            this._completionDisposables = new lifecycle_1.DisposableStore();
            this._onDidCancel = new event_1.Emitter();
            this._onDidTrigger = new event_1.Emitter();
            this._onDidSuggest = new event_1.Emitter();
            this.onDidCancel = this._onDidCancel.event;
            this.onDidTrigger = this._onDidTrigger.event;
            this.onDidSuggest = this._onDidSuggest.event;
            this._telemetryGate = 0;
            this._currentSelection = this._editor.getSelection() || new selection_1.Selection(1, 1, 1, 1);
            // wire up various listeners
            this._toDispose.add(this._editor.onDidChangeModel(() => {
                this._updateTriggerCharacters();
                this.cancel();
            }));
            this._toDispose.add(this._editor.onDidChangeModelLanguage(() => {
                this._updateTriggerCharacters();
                this.cancel();
            }));
            this._toDispose.add(this._editor.onDidChangeConfiguration(() => {
                this._updateTriggerCharacters();
            }));
            this._toDispose.add(this._languageFeaturesService.completionProvider.onDidChange(() => {
                this._updateTriggerCharacters();
                this._updateActiveSuggestSession();
            }));
            let editorIsComposing = false;
            this._toDispose.add(this._editor.onDidCompositionStart(() => {
                editorIsComposing = true;
            }));
            this._toDispose.add(this._editor.onDidCompositionEnd(() => {
                editorIsComposing = false;
                this._onCompositionEnd();
            }));
            this._toDispose.add(this._editor.onDidChangeCursorSelection(e => {
                // only trigger suggest when the editor isn't composing a character
                if (!editorIsComposing) {
                    this._onCursorChange(e);
                }
            }));
            this._toDispose.add(this._editor.onDidChangeModelContent(() => {
                // only filter completions when the editor isn't composing a character
                // allow-any-unicode-next-line
                // e.g. ¨ + u makes ü but just ¨ cannot be used for filtering
                if (!editorIsComposing && this._triggerState !== undefined) {
                    this._refilterCompletionItems();
                }
            }));
            this._updateTriggerCharacters();
        }
        dispose() {
            (0, lifecycle_1.dispose)(this._triggerCharacterListener);
            (0, lifecycle_1.dispose)([this._onDidCancel, this._onDidSuggest, this._onDidTrigger, this._triggerQuickSuggest]);
            this._toDispose.dispose();
            this._completionDisposables.dispose();
            this.cancel();
        }
        _updateTriggerCharacters() {
            this._triggerCharacterListener.clear();
            if (this._editor.getOption(90 /* EditorOption.readOnly */)
                || !this._editor.hasModel()
                || !this._editor.getOption(120 /* EditorOption.suggestOnTriggerCharacters */)) {
                return;
            }
            const supportsByTriggerCharacter = new Map();
            for (const support of this._languageFeaturesService.completionProvider.all(this._editor.getModel())) {
                for (const ch of support.triggerCharacters || []) {
                    let set = supportsByTriggerCharacter.get(ch);
                    if (!set) {
                        set = new Set();
                        set.add((0, suggest_1.getSnippetSuggestSupport)());
                        supportsByTriggerCharacter.set(ch, set);
                    }
                    set.add(support);
                }
            }
            const checkTriggerCharacter = (text) => {
                if (!canShowSuggestOnTriggerCharacters(this._editor, this._contextKeyService, this._configurationService)) {
                    return;
                }
                if (LineContext.shouldAutoTrigger(this._editor)) {
                    // don't trigger by trigger characters when this is a case for quick suggest
                    return;
                }
                if (!text) {
                    // came here from the compositionEnd-event
                    const position = this._editor.getPosition();
                    const model = this._editor.getModel();
                    text = model.getLineContent(position.lineNumber).substr(0, position.column - 1);
                }
                let lastChar = '';
                if ((0, strings_1.isLowSurrogate)(text.charCodeAt(text.length - 1))) {
                    if ((0, strings_1.isHighSurrogate)(text.charCodeAt(text.length - 2))) {
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
                    if (this._completionModel) {
                        for (const [provider, items] of this._completionModel.getItemsByProvider()) {
                            if (!supports.has(provider)) {
                                providerItemsToReuse.set(provider, items);
                            }
                        }
                    }
                    this.trigger({
                        auto: true,
                        triggerKind: 1 /* CompletionTriggerKind.TriggerCharacter */,
                        triggerCharacter: lastChar,
                        retrigger: Boolean(this._completionModel),
                        clipboardText: this._completionModel?.clipboardText,
                        completionOptions: { providerFilter: supports, providerItemsToReuse }
                    });
                }
            };
            this._triggerCharacterListener.add(this._editor.onDidType(checkTriggerCharacter));
            this._triggerCharacterListener.add(this._editor.onDidCompositionEnd(() => checkTriggerCharacter()));
        }
        // --- trigger/retrigger/cancel suggest
        get state() {
            if (!this._triggerState) {
                return 0 /* State.Idle */;
            }
            else if (!this._triggerState.auto) {
                return 1 /* State.Manual */;
            }
            else {
                return 2 /* State.Auto */;
            }
        }
        cancel(retrigger = false) {
            if (this._triggerState !== undefined) {
                this._triggerQuickSuggest.cancel();
                this._requestToken?.cancel();
                this._requestToken = undefined;
                this._triggerState = undefined;
                this._completionModel = undefined;
                this._context = undefined;
                this._onDidCancel.fire({ retrigger });
            }
        }
        clear() {
            this._completionDisposables.clear();
        }
        _updateActiveSuggestSession() {
            if (this._triggerState !== undefined) {
                if (!this._editor.hasModel() || !this._languageFeaturesService.completionProvider.has(this._editor.getModel())) {
                    this.cancel();
                }
                else {
                    this.trigger({ auto: this._triggerState.auto, retrigger: true });
                }
            }
        }
        _onCursorChange(e) {
            if (!this._editor.hasModel()) {
                return;
            }
            const prevSelection = this._currentSelection;
            this._currentSelection = this._editor.getSelection();
            if (!e.selection.isEmpty()
                || (e.reason !== 0 /* CursorChangeReason.NotSet */ && e.reason !== 3 /* CursorChangeReason.Explicit */)
                || (e.source !== 'keyboard' && e.source !== 'deleteLeft')) {
                // Early exit if nothing needs to be done!
                // Leave some form of early exit check here if you wish to continue being a cursor position change listener ;)
                this.cancel();
                return;
            }
            if (this._triggerState === undefined && e.reason === 0 /* CursorChangeReason.NotSet */) {
                if (prevSelection.containsRange(this._currentSelection) || prevSelection.getEndPosition().isBeforeOrEqual(this._currentSelection.getPosition())) {
                    // cursor did move RIGHT due to typing -> trigger quick suggest
                    this._doTriggerQuickSuggest();
                }
            }
            else if (this._triggerState !== undefined && e.reason === 3 /* CursorChangeReason.Explicit */) {
                // suggest is active and something like cursor keys are used to move
                // the cursor. this means we can refilter at the new position
                this._refilterCompletionItems();
            }
        }
        _onCompositionEnd() {
            // trigger or refilter when composition ends
            if (this._triggerState === undefined) {
                this._doTriggerQuickSuggest();
            }
            else {
                this._refilterCompletionItems();
            }
        }
        _doTriggerQuickSuggest() {
            if (suggest_1.QuickSuggestionsOptions.isAllOff(this._editor.getOption(88 /* EditorOption.quickSuggestions */))) {
                // not enabled
                return;
            }
            if (this._editor.getOption(117 /* EditorOption.suggest */).snippetsPreventQuickSuggestions && snippetController2_1.SnippetController2.get(this._editor)?.isInSnippet()) {
                // no quick suggestion when in snippet mode
                return;
            }
            this.cancel();
            this._triggerQuickSuggest.cancelAndSet(() => {
                if (this._triggerState !== undefined) {
                    return;
                }
                if (!LineContext.shouldAutoTrigger(this._editor)) {
                    return;
                }
                if (!this._editor.hasModel() || !this._editor.hasWidgetFocus()) {
                    return;
                }
                const model = this._editor.getModel();
                const pos = this._editor.getPosition();
                // validate enabled now
                const config = this._editor.getOption(88 /* EditorOption.quickSuggestions */);
                if (suggest_1.QuickSuggestionsOptions.isAllOff(config)) {
                    return;
                }
                if (!suggest_1.QuickSuggestionsOptions.isAllOn(config)) {
                    // Check the type of the token that triggered this
                    model.tokenization.tokenizeIfCheap(pos.lineNumber);
                    const lineTokens = model.tokenization.getLineTokens(pos.lineNumber);
                    const tokenType = lineTokens.getStandardTokenType(lineTokens.findTokenIndexAtOffset(Math.max(pos.column - 1 - 1, 0)));
                    if (suggest_1.QuickSuggestionsOptions.valueFor(config, tokenType) !== 'on') {
                        return;
                    }
                }
                if (!canShowQuickSuggest(this._editor, this._contextKeyService, this._configurationService)) {
                    // do not trigger quick suggestions if inline suggestions are shown
                    return;
                }
                if (!this._languageFeaturesService.completionProvider.has(model)) {
                    return;
                }
                // we made it till here -> trigger now
                this.trigger({ auto: true });
            }, this._editor.getOption(89 /* EditorOption.quickSuggestionsDelay */));
        }
        _refilterCompletionItems() {
            (0, types_1.assertType)(this._editor.hasModel());
            (0, types_1.assertType)(this._triggerState !== undefined);
            const model = this._editor.getModel();
            const position = this._editor.getPosition();
            const ctx = new LineContext(model, position, { ...this._triggerState, refilter: true });
            this._onNewContext(ctx);
        }
        trigger(options) {
            if (!this._editor.hasModel()) {
                return;
            }
            const model = this._editor.getModel();
            const ctx = new LineContext(model, this._editor.getPosition(), options);
            // Cancel previous requests, change state & update UI
            this.cancel(options.retrigger);
            this._triggerState = options;
            this._onDidTrigger.fire({ auto: options.auto, shy: options.shy ?? false, position: this._editor.getPosition() });
            // Capture context when request was sent
            this._context = ctx;
            // Build context for request
            let suggestCtx = { triggerKind: options.triggerKind ?? 0 /* CompletionTriggerKind.Invoke */ };
            if (options.triggerCharacter) {
                suggestCtx = {
                    triggerKind: 1 /* CompletionTriggerKind.TriggerCharacter */,
                    triggerCharacter: options.triggerCharacter
                };
            }
            this._requestToken = new cancellation_1.CancellationTokenSource();
            // kind filter and snippet sort rules
            const snippetSuggestions = this._editor.getOption(111 /* EditorOption.snippetSuggestions */);
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
            const { itemKind: itemKindFilter, showDeprecated } = SuggestModel_1._createSuggestFilter(this._editor);
            const completionOptions = new suggest_1.CompletionOptions(snippetSortOrder, options.completionOptions?.kindFilter ?? itemKindFilter, options.completionOptions?.providerFilter, options.completionOptions?.providerItemsToReuse, showDeprecated);
            const wordDistance = wordDistance_1.WordDistance.create(this._editorWorkerService, this._editor);
            const completions = (0, suggest_1.provideSuggestionItems)(this._languageFeaturesService.completionProvider, model, this._editor.getPosition(), completionOptions, suggestCtx, this._requestToken.token);
            Promise.all([completions, wordDistance]).then(async ([completions, wordDistance]) => {
                this._requestToken?.dispose();
                if (!this._editor.hasModel()) {
                    return;
                }
                let clipboardText = options?.clipboardText;
                if (!clipboardText && completions.needsClipboard) {
                    clipboardText = await this._clipboardService.readText();
                }
                if (this._triggerState === undefined) {
                    return;
                }
                const model = this._editor.getModel();
                // const items = completions.items;
                // if (existing) {
                // 	const cmpFn = getSuggestionComparator(snippetSortOrder);
                // 	items = items.concat(existing.items).sort(cmpFn);
                // }
                const ctx = new LineContext(model, this._editor.getPosition(), options);
                const fuzzySearchOptions = {
                    ...filters_1.FuzzyScoreOptions.default,
                    firstMatchCanBeWeak: !this._editor.getOption(117 /* EditorOption.suggest */).matchOnWordStartOnly
                };
                this._completionModel = new completionModel_1.CompletionModel(completions.items, this._context.column, {
                    leadingLineContent: ctx.leadingLineContent,
                    characterCountDelta: ctx.column - this._context.column
                }, wordDistance, this._editor.getOption(117 /* EditorOption.suggest */), this._editor.getOption(111 /* EditorOption.snippetSuggestions */), fuzzySearchOptions, clipboardText);
                // store containers so that they can be disposed later
                this._completionDisposables.add(completions.disposable);
                this._onNewContext(ctx);
                // finally report telemetry about durations
                this._reportDurationsTelemetry(completions.durations);
                // report invalid completions by source
                if (!this._envService.isBuilt || this._envService.isExtensionDevelopment) {
                    for (const item of completions.items) {
                        if (item.isInvalid) {
                            this._logService.warn(`[suggest] did IGNORE invalid completion item from ${item.provider._debugDisplayName}`, item.completion);
                        }
                    }
                }
            }).catch(errors_1.onUnexpectedError);
        }
        _reportDurationsTelemetry(durations) {
            if (this._telemetryGate++ % 230 !== 0) {
                return;
            }
            setTimeout(() => {
                this._telemetryService.publicLog2('suggest.durations.json', { data: JSON.stringify(durations) });
                this._logService.debug('suggest.durations.json', durations);
            });
        }
        static _createSuggestFilter(editor) {
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
        _onNewContext(ctx) {
            if (!this._context) {
                // happens when 24x7 IntelliSense is enabled and still in its delay
                return;
            }
            if (ctx.lineNumber !== this._context.lineNumber) {
                // e.g. happens when pressing Enter while IntelliSense is computed
                this.cancel();
                return;
            }
            if ((0, strings_1.getLeadingWhitespace)(ctx.leadingLineContent) !== (0, strings_1.getLeadingWhitespace)(this._context.leadingLineContent)) {
                // cancel IntelliSense when line start changes
                // happens when the current word gets outdented
                this.cancel();
                return;
            }
            if (ctx.column < this._context.column) {
                // typed -> moved cursor LEFT -> retrigger if still on a word
                if (ctx.leadingWord.word) {
                    this.trigger({ auto: this._context.triggerOptions.auto, retrigger: true });
                }
                else {
                    this.cancel();
                }
                return;
            }
            if (!this._completionModel) {
                // happens when IntelliSense is not yet computed
                return;
            }
            if (ctx.leadingWord.word.length !== 0 && ctx.leadingWord.startColumn > this._context.leadingWord.startColumn) {
                // started a new word while IntelliSense shows -> retrigger but reuse all items that we currently have
                const shouldAutoTrigger = LineContext.shouldAutoTrigger(this._editor);
                if (shouldAutoTrigger && this._context) {
                    // shouldAutoTrigger forces tokenization, which can cause pending cursor change events to be emitted, which can cause
                    // suggestions to be cancelled, which causes `this._context` to be undefined
                    const map = this._completionModel.getItemsByProvider();
                    this.trigger({
                        auto: this._context.triggerOptions.auto,
                        retrigger: true,
                        clipboardText: this._completionModel.clipboardText,
                        completionOptions: { providerItemsToReuse: map }
                    });
                }
                return;
            }
            if (ctx.column > this._context.column && this._completionModel.getIncompleteProvider().size > 0 && ctx.leadingWord.word.length !== 0) {
                // typed -> moved cursor RIGHT & incomple model & still on a word -> retrigger
                const providerItemsToReuse = new Map();
                const providerFilter = new Set();
                for (const [provider, items] of this._completionModel.getItemsByProvider()) {
                    if (items.length > 0 && items[0].container.incomplete) {
                        providerFilter.add(provider);
                    }
                    else {
                        providerItemsToReuse.set(provider, items);
                    }
                }
                this.trigger({
                    auto: this._context.triggerOptions.auto,
                    triggerKind: 2 /* CompletionTriggerKind.TriggerForIncompleteCompletions */,
                    retrigger: true,
                    clipboardText: this._completionModel.clipboardText,
                    completionOptions: { providerFilter, providerItemsToReuse }
                });
            }
            else {
                // typed -> moved cursor RIGHT -> update UI
                const oldLineContext = this._completionModel.lineContext;
                let isFrozen = false;
                this._completionModel.lineContext = {
                    leadingLineContent: ctx.leadingLineContent,
                    characterCountDelta: ctx.column - this._context.column
                };
                if (this._completionModel.items.length === 0) {
                    const shouldAutoTrigger = LineContext.shouldAutoTrigger(this._editor);
                    if (!this._context) {
                        // shouldAutoTrigger forces tokenization, which can cause pending cursor change events to be emitted, which can cause
                        // suggestions to be cancelled, which causes `this._context` to be undefined
                        this.cancel();
                        return;
                    }
                    if (shouldAutoTrigger && this._context.leadingWord.endColumn < ctx.leadingWord.startColumn) {
                        // retrigger when heading into a new word
                        this.trigger({ auto: this._context.triggerOptions.auto, retrigger: true });
                        return;
                    }
                    if (!this._context.triggerOptions.auto) {
                        // freeze when IntelliSense was manually requested
                        this._completionModel.lineContext = oldLineContext;
                        isFrozen = this._completionModel.items.length > 0;
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
                this._onDidSuggest.fire({
                    completionModel: this._completionModel,
                    triggerOptions: ctx.triggerOptions,
                    isFrozen,
                });
            }
        }
    };
    exports.SuggestModel = SuggestModel;
    exports.SuggestModel = SuggestModel = SuggestModel_1 = __decorate([
        __param(1, editorWorker_1.IEditorWorkerService),
        __param(2, clipboardService_1.IClipboardService),
        __param(3, telemetry_1.ITelemetryService),
        __param(4, log_1.ILogService),
        __param(5, contextkey_1.IContextKeyService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, languageFeatures_1.ILanguageFeaturesService),
        __param(8, environment_1.IEnvironmentService)
    ], SuggestModel);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VnZ2VzdE1vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvc3VnZ2VzdC9icm93c2VyL3N1Z2dlc3RNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBMkRoRyxNQUFhLFdBQVc7UUFFdkIsTUFBTSxDQUFDLGlCQUFpQixDQUFDLE1BQW1CO1lBQzNDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUU7Z0JBQ3ZCLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFDRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDaEMsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2pDLEtBQUssQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUVuRCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDMUMsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDVixPQUFPLEtBQUssQ0FBQzthQUNiO1lBQ0QsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLEdBQUcsQ0FBQyxNQUFNO2dCQUNoQyxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsTUFBTSxDQUFDLG1EQUFtRCxFQUFFO2dCQUN6RixPQUFPLEtBQUssQ0FBQzthQUNiO1lBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7Z0JBQzlCLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFRRCxZQUFZLEtBQWlCLEVBQUUsUUFBa0IsRUFBRSxjQUFxQztZQUN2RixJQUFJLENBQUMsa0JBQWtCLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ25HLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQztZQUN0QyxJQUFJLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFDOUIsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7UUFDdEMsQ0FBQztLQUNEO0lBckNELGtDQXFDQztJQUVELElBQWtCLEtBSWpCO0lBSkQsV0FBa0IsS0FBSztRQUN0QixpQ0FBUSxDQUFBO1FBQ1IscUNBQVUsQ0FBQTtRQUNWLGlDQUFRLENBQUE7SUFDVCxDQUFDLEVBSmlCLEtBQUsscUJBQUwsS0FBSyxRQUl0QjtJQUVELFNBQVMsbUJBQW1CLENBQUMsTUFBbUIsRUFBRSxpQkFBcUMsRUFBRSxvQkFBMkM7UUFDbkksSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyx5REFBMkIsQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO1lBQzVHLDBDQUEwQztZQUMxQyxPQUFPLElBQUksQ0FBQztTQUNaO1FBQ0QsTUFBTSxtQkFBbUIsR0FBRyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBc0IseURBQTJCLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDM0ksSUFBSSxtQkFBbUIsS0FBSyxTQUFTLEVBQUU7WUFDdEMsT0FBTyxDQUFDLG1CQUFtQixDQUFDO1NBQzVCO1FBQ0QsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLHFDQUE0QixDQUFDLG1CQUFtQixDQUFDO0lBQzFFLENBQUM7SUFFRCxTQUFTLGlDQUFpQyxDQUFDLE1BQW1CLEVBQUUsaUJBQXFDLEVBQUUsb0JBQTJDO1FBQ2pKLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMseUJBQXlCLENBQUMsQ0FBQyxFQUFFO1lBQzlFLDBDQUEwQztZQUMxQyxPQUFPLElBQUksQ0FBQztTQUNaO1FBQ0QsTUFBTSxtQkFBbUIsR0FBRyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBc0IseURBQTJCLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDM0ksSUFBSSxtQkFBbUIsS0FBSyxTQUFTLEVBQUU7WUFDdEMsT0FBTyxDQUFDLG1CQUFtQixDQUFDO1NBQzVCO1FBQ0QsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLHFDQUE0QixDQUFDLG1CQUFtQixDQUFDO0lBQzFFLENBQUM7SUFFTSxJQUFNLFlBQVksb0JBQWxCLE1BQU0sWUFBWTtRQXFCeEIsWUFDa0IsT0FBb0IsRUFDZixvQkFBMkQsRUFDOUQsaUJBQXFELEVBQ3JELGlCQUFxRCxFQUMzRCxXQUF5QyxFQUNsQyxrQkFBdUQsRUFDcEQscUJBQTZELEVBQzFELHdCQUFtRSxFQUN4RSxXQUFpRDtZQVJyRCxZQUFPLEdBQVAsT0FBTyxDQUFhO1lBQ0UseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtZQUM3QyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1lBQ3BDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7WUFDMUMsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFDakIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtZQUNuQywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQ3pDLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7WUFDdkQsZ0JBQVcsR0FBWCxXQUFXLENBQXFCO1lBNUJ0RCxlQUFVLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFDbkMsOEJBQXlCLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFDbEQseUJBQW9CLEdBQUcsSUFBSSxvQkFBWSxFQUFFLENBQUM7WUFFbkQsa0JBQWEsR0FBc0MsU0FBUyxDQUFDO1lBTXBELDJCQUFzQixHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBQy9DLGlCQUFZLEdBQUcsSUFBSSxlQUFPLEVBQWdCLENBQUM7WUFDM0Msa0JBQWEsR0FBRyxJQUFJLGVBQU8sRUFBaUIsQ0FBQztZQUM3QyxrQkFBYSxHQUFHLElBQUksZUFBTyxFQUFpQixDQUFDO1lBRXJELGdCQUFXLEdBQXdCLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBQzNELGlCQUFZLEdBQXlCLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO1lBQzlELGlCQUFZLEdBQXlCLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO1lBMFovRCxtQkFBYyxHQUFXLENBQUMsQ0FBQztZQTdZbEMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLElBQUksSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRWxGLDRCQUE0QjtZQUM1QixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRTtnQkFDdEQsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7Z0JBQ2hDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNmLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLHdCQUF3QixDQUFDLEdBQUcsRUFBRTtnQkFDOUQsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7Z0JBQ2hDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNmLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLHdCQUF3QixDQUFDLEdBQUcsRUFBRTtnQkFDOUQsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7WUFDakMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFO2dCQUNyRixJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztnQkFDaEMsSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUM7WUFDcEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksaUJBQWlCLEdBQUcsS0FBSyxDQUFDO1lBQzlCLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMscUJBQXFCLENBQUMsR0FBRyxFQUFFO2dCQUMzRCxpQkFBaUIsR0FBRyxJQUFJLENBQUM7WUFDMUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsR0FBRyxFQUFFO2dCQUN6RCxpQkFBaUIsR0FBRyxLQUFLLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQzFCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUMvRCxtRUFBbUU7Z0JBQ25FLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtvQkFDdkIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDeEI7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLEVBQUU7Z0JBQzdELHNFQUFzRTtnQkFDdEUsOEJBQThCO2dCQUM5Qiw2REFBNkQ7Z0JBQzdELElBQUksQ0FBQyxpQkFBaUIsSUFBSSxJQUFJLENBQUMsYUFBYSxLQUFLLFNBQVMsRUFBRTtvQkFDM0QsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7aUJBQ2hDO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1FBQ2pDLENBQUM7UUFFRCxPQUFPO1lBQ04sSUFBQSxtQkFBTyxFQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1lBQ3hDLElBQUEsbUJBQU8sRUFBQyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7WUFDaEcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsc0JBQXNCLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDdEMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2YsQ0FBQztRQUVPLHdCQUF3QjtZQUMvQixJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxFQUFFLENBQUM7WUFFdkMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsZ0NBQXVCO21CQUM3QyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFO21CQUN4QixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxtREFBeUMsRUFBRTtnQkFFckUsT0FBTzthQUNQO1lBRUQsTUFBTSwwQkFBMEIsR0FBRyxJQUFJLEdBQUcsRUFBdUMsQ0FBQztZQUNsRixLQUFLLE1BQU0sT0FBTyxJQUFJLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFO2dCQUNwRyxLQUFLLE1BQU0sRUFBRSxJQUFJLE9BQU8sQ0FBQyxpQkFBaUIsSUFBSSxFQUFFLEVBQUU7b0JBQ2pELElBQUksR0FBRyxHQUFHLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDN0MsSUFBSSxDQUFDLEdBQUcsRUFBRTt3QkFDVCxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQzt3QkFDaEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFBLGtDQUF3QixHQUFFLENBQUMsQ0FBQzt3QkFDcEMsMEJBQTBCLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztxQkFDeEM7b0JBQ0QsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDakI7YUFDRDtZQUdELE1BQU0scUJBQXFCLEdBQUcsQ0FBQyxJQUFhLEVBQUUsRUFBRTtnQkFFL0MsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFO29CQUMxRyxPQUFPO2lCQUNQO2dCQUVELElBQUksV0FBVyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDaEQsNEVBQTRFO29CQUM1RSxPQUFPO2lCQUNQO2dCQUVELElBQUksQ0FBQyxJQUFJLEVBQUU7b0JBQ1YsMENBQTBDO29CQUMxQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRyxDQUFDO29CQUM3QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRyxDQUFDO29CQUN2QyxJQUFJLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO2lCQUNoRjtnQkFFRCxJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7Z0JBQ2xCLElBQUksSUFBQSx3QkFBYyxFQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUNyRCxJQUFJLElBQUEseUJBQWUsRUFBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTt3QkFDdEQsUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztxQkFDeEM7aUJBQ0Q7cUJBQU07b0JBQ04sUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztpQkFDeEM7Z0JBRUQsTUFBTSxRQUFRLEdBQUcsMEJBQTBCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUMxRCxJQUFJLFFBQVEsRUFBRTtvQkFFYixxREFBcUQ7b0JBQ3JELDhDQUE4QztvQkFDOUMsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLEdBQUcsRUFBNEMsQ0FBQztvQkFDakYsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7d0JBQzFCLEtBQUssTUFBTSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsRUFBRTs0QkFDM0UsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0NBQzVCLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7NkJBQzFDO3lCQUNEO3FCQUNEO29CQUVELElBQUksQ0FBQyxPQUFPLENBQUM7d0JBQ1osSUFBSSxFQUFFLElBQUk7d0JBQ1YsV0FBVyxnREFBd0M7d0JBQ25ELGdCQUFnQixFQUFFLFFBQVE7d0JBQzFCLFNBQVMsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDO3dCQUN6QyxhQUFhLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLGFBQWE7d0JBQ25ELGlCQUFpQixFQUFFLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxvQkFBb0IsRUFBRTtxQkFDckUsQ0FBQyxDQUFDO2lCQUNIO1lBQ0YsQ0FBQyxDQUFDO1lBRUYsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7WUFDbEYsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLEdBQUcsRUFBRSxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3JHLENBQUM7UUFFRCx1Q0FBdUM7UUFFdkMsSUFBSSxLQUFLO1lBQ1IsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ3hCLDBCQUFrQjthQUNsQjtpQkFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUU7Z0JBQ3BDLDRCQUFvQjthQUNwQjtpQkFBTTtnQkFDTiwwQkFBa0I7YUFDbEI7UUFDRixDQUFDO1FBRUQsTUFBTSxDQUFDLFlBQXFCLEtBQUs7WUFDaEMsSUFBSSxJQUFJLENBQUMsYUFBYSxLQUFLLFNBQVMsRUFBRTtnQkFDckMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNuQyxJQUFJLENBQUMsYUFBYSxFQUFFLE1BQU0sRUFBRSxDQUFDO2dCQUM3QixJQUFJLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQztnQkFDL0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxTQUFTLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDO2dCQUMxQixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7YUFDdEM7UUFDRixDQUFDO1FBRUQsS0FBSztZQUNKLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNyQyxDQUFDO1FBRU8sMkJBQTJCO1lBQ2xDLElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxTQUFTLEVBQUU7Z0JBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUU7b0JBQy9HLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztpQkFDZDtxQkFBTTtvQkFDTixJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2lCQUNqRTthQUNEO1FBQ0YsQ0FBQztRQUVPLGVBQWUsQ0FBQyxDQUErQjtZQUV0RCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDN0IsT0FBTzthQUNQO1lBRUQsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDO1lBQzdDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDO1lBRXJELElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRTttQkFDdEIsQ0FBQyxDQUFDLENBQUMsTUFBTSxzQ0FBOEIsSUFBSSxDQUFDLENBQUMsTUFBTSx3Q0FBZ0MsQ0FBQzttQkFDcEYsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLFVBQVUsSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFLLFlBQVksQ0FBQyxFQUN4RDtnQkFDRCwwQ0FBMEM7Z0JBQzFDLDhHQUE4RztnQkFDOUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNkLE9BQU87YUFDUDtZQUdELElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxTQUFTLElBQUksQ0FBQyxDQUFDLE1BQU0sc0NBQThCLEVBQUU7Z0JBQy9FLElBQUksYUFBYSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxhQUFhLENBQUMsY0FBYyxFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFO29CQUNoSiwrREFBK0Q7b0JBQy9ELElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO2lCQUM5QjthQUVEO2lCQUFNLElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxTQUFTLElBQUksQ0FBQyxDQUFDLE1BQU0sd0NBQWdDLEVBQUU7Z0JBQ3hGLG9FQUFvRTtnQkFDcEUsNkRBQTZEO2dCQUM3RCxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQzthQUNoQztRQUNGLENBQUM7UUFFTyxpQkFBaUI7WUFDeEIsNENBQTRDO1lBQzVDLElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxTQUFTLEVBQUU7Z0JBQ3JDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO2FBQzlCO2lCQUFNO2dCQUNOLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO2FBQ2hDO1FBQ0YsQ0FBQztRQUVPLHNCQUFzQjtZQUU3QixJQUFJLGlDQUF1QixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsd0NBQStCLENBQUMsRUFBRTtnQkFDNUYsY0FBYztnQkFDZCxPQUFPO2FBQ1A7WUFFRCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxnQ0FBc0IsQ0FBQywrQkFBK0IsSUFBSSx1Q0FBa0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLFdBQVcsRUFBRSxFQUFFO2dCQUN4SSwyQ0FBMkM7Z0JBQzNDLE9BQU87YUFDUDtZQUVELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUVkLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFO2dCQUMzQyxJQUFJLElBQUksQ0FBQyxhQUFhLEtBQUssU0FBUyxFQUFFO29CQUNyQyxPQUFPO2lCQUNQO2dCQUNELElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNqRCxPQUFPO2lCQUNQO2dCQUNELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsRUFBRTtvQkFDL0QsT0FBTztpQkFDUDtnQkFDRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUN0QyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUN2Qyx1QkFBdUI7Z0JBQ3ZCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyx3Q0FBK0IsQ0FBQztnQkFDckUsSUFBSSxpQ0FBdUIsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7b0JBQzdDLE9BQU87aUJBQ1A7Z0JBRUQsSUFBSSxDQUFDLGlDQUF1QixDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDN0Msa0RBQWtEO29CQUNsRCxLQUFLLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQ25ELE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDcEUsTUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3RILElBQUksaUNBQXVCLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsS0FBSyxJQUFJLEVBQUU7d0JBQ2pFLE9BQU87cUJBQ1A7aUJBQ0Q7Z0JBRUQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFO29CQUM1RixtRUFBbUU7b0JBQ25FLE9BQU87aUJBQ1A7Z0JBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ2pFLE9BQU87aUJBQ1A7Z0JBRUQsc0NBQXNDO2dCQUN0QyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFFOUIsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyw2Q0FBb0MsQ0FBQyxDQUFDO1FBQ2hFLENBQUM7UUFFTyx3QkFBd0I7WUFDL0IsSUFBQSxrQkFBVSxFQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNwQyxJQUFBLGtCQUFVLEVBQUMsSUFBSSxDQUFDLGFBQWEsS0FBSyxTQUFTLENBQUMsQ0FBQztZQUU3QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3RDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDNUMsTUFBTSxHQUFHLEdBQUcsSUFBSSxXQUFXLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUN4RixJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3pCLENBQUM7UUFFRCxPQUFPLENBQUMsT0FBOEI7WUFDckMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUU7Z0JBQzdCLE9BQU87YUFDUDtZQUVELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDdEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFeEUscURBQXFEO1lBQ3JELElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQy9CLElBQUksQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDO1lBQzdCLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHLElBQUksS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUVqSCx3Q0FBd0M7WUFDeEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUM7WUFFcEIsNEJBQTRCO1lBQzVCLElBQUksVUFBVSxHQUFzQixFQUFFLFdBQVcsRUFBRSxPQUFPLENBQUMsV0FBVyx3Q0FBZ0MsRUFBRSxDQUFDO1lBQ3pHLElBQUksT0FBTyxDQUFDLGdCQUFnQixFQUFFO2dCQUM3QixVQUFVLEdBQUc7b0JBQ1osV0FBVyxnREFBd0M7b0JBQ25ELGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxnQkFBZ0I7aUJBQzFDLENBQUM7YUFDRjtZQUVELElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxzQ0FBdUIsRUFBRSxDQUFDO1lBRW5ELHFDQUFxQztZQUNyQyxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUywyQ0FBaUMsQ0FBQztZQUNuRixJQUFJLGdCQUFnQixrQ0FBMEIsQ0FBQztZQUMvQyxRQUFRLGtCQUFrQixFQUFFO2dCQUMzQixLQUFLLEtBQUs7b0JBQ1QsZ0JBQWdCLCtCQUF1QixDQUFDO29CQUN4QyxNQUFNO2dCQUNQLG1DQUFtQztnQkFDbkMsaUJBQWlCO2dCQUNqQiwrQ0FBK0M7Z0JBQy9DLFVBQVU7Z0JBQ1YsS0FBSyxRQUFRO29CQUNaLGdCQUFnQixrQ0FBMEIsQ0FBQztvQkFDM0MsTUFBTTthQUNQO1lBRUQsTUFBTSxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLEdBQUcsY0FBWSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNyRyxNQUFNLGlCQUFpQixHQUFHLElBQUksMkJBQWlCLENBQUMsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLGlCQUFpQixFQUFFLFVBQVUsSUFBSSxjQUFjLEVBQUUsT0FBTyxDQUFDLGlCQUFpQixFQUFFLGNBQWMsRUFBRSxPQUFPLENBQUMsaUJBQWlCLEVBQUUsb0JBQW9CLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDdk8sTUFBTSxZQUFZLEdBQUcsMkJBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUVsRixNQUFNLFdBQVcsR0FBRyxJQUFBLGdDQUFzQixFQUN6QyxJQUFJLENBQUMsd0JBQXdCLENBQUMsa0JBQWtCLEVBQ2hELEtBQUssRUFDTCxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUMxQixpQkFBaUIsRUFDakIsVUFBVSxFQUNWLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUN4QixDQUFDO1lBRUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLEVBQUUsRUFBRTtnQkFFbkYsSUFBSSxDQUFDLGFBQWEsRUFBRSxPQUFPLEVBQUUsQ0FBQztnQkFFOUIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUU7b0JBQzdCLE9BQU87aUJBQ1A7Z0JBRUQsSUFBSSxhQUFhLEdBQUcsT0FBTyxFQUFFLGFBQWEsQ0FBQztnQkFDM0MsSUFBSSxDQUFDLGFBQWEsSUFBSSxXQUFXLENBQUMsY0FBYyxFQUFFO29CQUNqRCxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUM7aUJBQ3hEO2dCQUVELElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxTQUFTLEVBQUU7b0JBQ3JDLE9BQU87aUJBQ1A7Z0JBRUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDdEMsbUNBQW1DO2dCQUVuQyxrQkFBa0I7Z0JBQ2xCLDREQUE0RDtnQkFDNUQscURBQXFEO2dCQUNyRCxJQUFJO2dCQUVKLE1BQU0sR0FBRyxHQUFHLElBQUksV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUN4RSxNQUFNLGtCQUFrQixHQUFHO29CQUMxQixHQUFHLDJCQUFpQixDQUFDLE9BQU87b0JBQzVCLG1CQUFtQixFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLGdDQUFzQixDQUFDLG9CQUFvQjtpQkFDdkYsQ0FBQztnQkFDRixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxpQ0FBZSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVMsQ0FBQyxNQUFNLEVBQUU7b0JBQ3JGLGtCQUFrQixFQUFFLEdBQUcsQ0FBQyxrQkFBa0I7b0JBQzFDLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVMsQ0FBQyxNQUFNO2lCQUN2RCxFQUNBLFlBQVksRUFDWixJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsZ0NBQXNCLEVBQzVDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUywyQ0FBaUMsRUFDdkQsa0JBQWtCLEVBQ2xCLGFBQWEsQ0FDYixDQUFDO2dCQUVGLHNEQUFzRDtnQkFDdEQsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBRXhELElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBRXhCLDJDQUEyQztnQkFDM0MsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFdEQsdUNBQXVDO2dCQUN2QyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsRUFBRTtvQkFDekUsS0FBSyxNQUFNLElBQUksSUFBSSxXQUFXLENBQUMsS0FBSyxFQUFFO3dCQUNyQyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7NEJBQ25CLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLHFEQUFxRCxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO3lCQUMvSDtxQkFDRDtpQkFDRDtZQUVGLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQywwQkFBaUIsQ0FBQyxDQUFDO1FBQzdCLENBQUM7UUFJTyx5QkFBeUIsQ0FBQyxTQUE4QjtZQUUvRCxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUUsR0FBRyxHQUFHLEtBQUssQ0FBQyxFQUFFO2dCQUN0QyxPQUFPO2FBQ1A7WUFFRCxVQUFVLENBQUMsR0FBRyxFQUFFO2dCQU9mLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQXFDLHdCQUF3QixFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNySSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUM3RCxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTyxNQUFNLENBQUMsb0JBQW9CLENBQUMsTUFBbUI7WUFDdEQscUNBQXFDO1lBQ3JDLE1BQU0sTUFBTSxHQUFHLElBQUksR0FBRyxFQUFzQixDQUFDO1lBRTdDLGtCQUFrQjtZQUNsQixNQUFNLGtCQUFrQixHQUFHLE1BQU0sQ0FBQyxTQUFTLDJDQUFpQyxDQUFDO1lBQzdFLElBQUksa0JBQWtCLEtBQUssTUFBTSxFQUFFO2dCQUNsQyxNQUFNLENBQUMsR0FBRyxxQ0FBNEIsQ0FBQzthQUN2QztZQUVELGVBQWU7WUFDZixNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsU0FBUyxnQ0FBc0IsQ0FBQztZQUM5RCxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRTtnQkFBRSxNQUFNLENBQUMsR0FBRyxtQ0FBMkIsQ0FBQzthQUFFO1lBQzNFLElBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFO2dCQUFFLE1BQU0sQ0FBQyxHQUFHLHFDQUE2QixDQUFDO2FBQUU7WUFDL0UsSUFBSSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsRUFBRTtnQkFBRSxNQUFNLENBQUMsR0FBRyx3Q0FBZ0MsQ0FBQzthQUFFO1lBQ3JGLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFO2dCQUFFLE1BQU0sQ0FBQyxHQUFHLGtDQUEwQixDQUFDO2FBQUU7WUFDekUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUU7Z0JBQUUsTUFBTSxDQUFDLEdBQUcscUNBQTZCLENBQUM7YUFBRTtZQUMvRSxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRTtnQkFBRSxNQUFNLENBQUMsR0FBRyxrQ0FBMEIsQ0FBQzthQUFFO1lBQzFFLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFO2dCQUFFLE1BQU0sQ0FBQyxHQUFHLG1DQUEyQixDQUFDO2FBQUU7WUFDM0UsSUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFjLEVBQUU7Z0JBQUUsTUFBTSxDQUFDLEdBQUcsc0NBQThCLENBQUM7YUFBRTtZQUNqRixJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRTtnQkFBRSxNQUFNLENBQUMsR0FBRyxtQ0FBMkIsQ0FBQzthQUFFO1lBQzNFLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxFQUFFO2dCQUFFLE1BQU0sQ0FBQyxHQUFHLHFDQUE2QixDQUFDO2FBQUU7WUFDaEYsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLEVBQUU7Z0JBQUUsTUFBTSxDQUFDLEdBQUcsbUNBQTBCLENBQUM7YUFBRTtZQUN6RSxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRTtnQkFBRSxNQUFNLENBQUMsR0FBRyxzQ0FBNkIsQ0FBQzthQUFFO1lBQy9FLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFO2dCQUFFLE1BQU0sQ0FBQyxHQUFHLGtDQUF5QixDQUFDO2FBQUU7WUFDdkUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLEVBQUU7Z0JBQUUsTUFBTSxDQUFDLEdBQUcsbUNBQTBCLENBQUM7YUFBRTtZQUN6RSxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRTtnQkFBRSxNQUFNLENBQUMsR0FBRyxzQ0FBNkIsQ0FBQzthQUFFO1lBQy9FLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFO2dCQUFFLE1BQU0sQ0FBQyxHQUFHLGtDQUF5QixDQUFDO2FBQUU7WUFDdkUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFlLEVBQUU7Z0JBQUUsTUFBTSxDQUFDLEdBQUcsd0NBQStCLENBQUM7YUFBRTtZQUNuRixJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRTtnQkFBRSxNQUFNLENBQUMsR0FBRyxxQ0FBNEIsQ0FBQzthQUFFO1lBQzdFLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFO2dCQUFFLE1BQU0sQ0FBQyxHQUFHLGtDQUF5QixDQUFDO2FBQUU7WUFDdkUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLEVBQUU7Z0JBQUUsTUFBTSxDQUFDLEdBQUcsbUNBQTBCLENBQUM7YUFBRTtZQUN6RSxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRTtnQkFBRSxNQUFNLENBQUMsR0FBRyxrQ0FBeUIsQ0FBQzthQUFFO1lBQ3ZFLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxFQUFFO2dCQUFFLE1BQU0sQ0FBQyxHQUFHLHVDQUE4QixDQUFDO2FBQUU7WUFDakYsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLEVBQUU7Z0JBQUUsTUFBTSxDQUFDLEdBQUcseUNBQWdDLENBQUM7YUFBRTtZQUMvRSxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRTtnQkFBRSxNQUFNLENBQUMsR0FBRyxvQ0FBMkIsQ0FBQzthQUFFO1lBQzNFLElBQUksQ0FBQyxjQUFjLENBQUMsa0JBQWtCLEVBQUU7Z0JBQUUsTUFBTSxDQUFDLEdBQUcsMkNBQWtDLENBQUM7YUFBRTtZQUN6RixJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRTtnQkFBRSxNQUFNLENBQUMsR0FBRyxxQ0FBNEIsQ0FBQzthQUFFO1lBQzdFLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFO2dCQUFFLE1BQU0sQ0FBQyxHQUFHLGtDQUF5QixDQUFDO2FBQUU7WUFDdkUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLEVBQUU7Z0JBQUUsTUFBTSxDQUFDLEdBQUcsbUNBQTBCLENBQUM7YUFBRTtZQUV6RSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxjQUFjLEVBQUUsY0FBYyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQzVFLENBQUM7UUFFTyxhQUFhLENBQUMsR0FBZ0I7WUFFckMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ25CLG1FQUFtRTtnQkFDbkUsT0FBTzthQUNQO1lBRUQsSUFBSSxHQUFHLENBQUMsVUFBVSxLQUFLLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFO2dCQUNoRCxrRUFBa0U7Z0JBQ2xFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDZCxPQUFPO2FBQ1A7WUFFRCxJQUFJLElBQUEsOEJBQW9CLEVBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLEtBQUssSUFBQSw4QkFBb0IsRUFBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLEVBQUU7Z0JBQzVHLDhDQUE4QztnQkFDOUMsK0NBQStDO2dCQUMvQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2QsT0FBTzthQUNQO1lBRUQsSUFBSSxHQUFHLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO2dCQUN0Qyw2REFBNkQ7Z0JBQzdELElBQUksR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUU7b0JBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2lCQUMzRTtxQkFBTTtvQkFDTixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7aUJBQ2Q7Z0JBQ0QsT0FBTzthQUNQO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDM0IsZ0RBQWdEO2dCQUNoRCxPQUFPO2FBQ1A7WUFFRCxJQUFJLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLFdBQVcsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFO2dCQUM3RyxzR0FBc0c7Z0JBQ3RHLE1BQU0saUJBQWlCLEdBQUcsV0FBVyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDdEUsSUFBSSxpQkFBaUIsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO29CQUN2QyxxSEFBcUg7b0JBQ3JILDRFQUE0RTtvQkFDNUUsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLENBQUM7b0JBQ3ZELElBQUksQ0FBQyxPQUFPLENBQUM7d0JBQ1osSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUk7d0JBQ3ZDLFNBQVMsRUFBRSxJQUFJO3dCQUNmLGFBQWEsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYTt3QkFDbEQsaUJBQWlCLEVBQUUsRUFBRSxvQkFBb0IsRUFBRSxHQUFHLEVBQUU7cUJBQ2hELENBQUMsQ0FBQztpQkFDSDtnQkFDRCxPQUFPO2FBQ1A7WUFFRCxJQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLHFCQUFxQixFQUFFLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNySSw4RUFBOEU7Z0JBRTlFLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxHQUFHLEVBQTRDLENBQUM7Z0JBQ2pGLE1BQU0sY0FBYyxHQUFHLElBQUksR0FBRyxFQUEwQixDQUFDO2dCQUN6RCxLQUFLLE1BQU0sQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLEVBQUU7b0JBQzNFLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUU7d0JBQ3RELGNBQWMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7cUJBQzdCO3lCQUFNO3dCQUNOLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7cUJBQzFDO2lCQUNEO2dCQUVELElBQUksQ0FBQyxPQUFPLENBQUM7b0JBQ1osSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUk7b0JBQ3ZDLFdBQVcsK0RBQXVEO29CQUNsRSxTQUFTLEVBQUUsSUFBSTtvQkFDZixhQUFhLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWE7b0JBQ2xELGlCQUFpQixFQUFFLEVBQUUsY0FBYyxFQUFFLG9CQUFvQixFQUFFO2lCQUMzRCxDQUFDLENBQUM7YUFFSDtpQkFBTTtnQkFDTiwyQ0FBMkM7Z0JBQzNDLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUM7Z0JBQ3pELElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFFckIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsR0FBRztvQkFDbkMsa0JBQWtCLEVBQUUsR0FBRyxDQUFDLGtCQUFrQjtvQkFDMUMsbUJBQW1CLEVBQUUsR0FBRyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU07aUJBQ3RELENBQUM7Z0JBRUYsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBRTdDLE1BQU0saUJBQWlCLEdBQUcsV0FBVyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDdEUsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7d0JBQ25CLHFIQUFxSDt3QkFDckgsNEVBQTRFO3dCQUM1RSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7d0JBQ2QsT0FBTztxQkFDUDtvQkFFRCxJQUFJLGlCQUFpQixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRTt3QkFDM0YseUNBQXlDO3dCQUN6QyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQzt3QkFDM0UsT0FBTztxQkFDUDtvQkFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFO3dCQUN2QyxrREFBa0Q7d0JBQ2xELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEdBQUcsY0FBYyxDQUFDO3dCQUNuRCxRQUFRLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO3dCQUVsRCxJQUFJLFFBQVEsSUFBSSxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFOzRCQUNsRCxpREFBaUQ7NEJBQ2pELGtEQUFrRDs0QkFDbEQsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDOzRCQUNkLE9BQU87eUJBQ1A7cUJBRUQ7eUJBQU07d0JBQ04sZUFBZTt3QkFDZixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7d0JBQ2QsT0FBTztxQkFDUDtpQkFDRDtnQkFFRCxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQztvQkFDdkIsZUFBZSxFQUFFLElBQUksQ0FBQyxnQkFBZ0I7b0JBQ3RDLGNBQWMsRUFBRSxHQUFHLENBQUMsY0FBYztvQkFDbEMsUUFBUTtpQkFDUixDQUFDLENBQUM7YUFDSDtRQUNGLENBQUM7S0FDRCxDQUFBO0lBMW1CWSxvQ0FBWTsyQkFBWixZQUFZO1FBdUJ0QixXQUFBLG1DQUFvQixDQUFBO1FBQ3BCLFdBQUEsb0NBQWlCLENBQUE7UUFDakIsV0FBQSw2QkFBaUIsQ0FBQTtRQUNqQixXQUFBLGlCQUFXLENBQUE7UUFDWCxXQUFBLCtCQUFrQixDQUFBO1FBQ2xCLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSwyQ0FBd0IsQ0FBQTtRQUN4QixXQUFBLGlDQUFtQixDQUFBO09BOUJULFlBQVksQ0EwbUJ4QiJ9