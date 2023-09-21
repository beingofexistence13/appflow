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
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/keybindings", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/stopwatch", "vs/base/common/types", "vs/editor/browser/stableEditorScroll", "vs/editor/browser/editorExtensions", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/contrib/snippet/browser/snippetController2", "vs/editor/contrib/snippet/browser/snippetParser", "vs/editor/contrib/suggest/browser/suggestMemory", "vs/editor/contrib/suggest/browser/wordContextKey", "vs/nls!vs/editor/contrib/suggest/browser/suggestController", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "./suggest", "./suggestAlternatives", "./suggestCommitCharacters", "./suggestModel", "./suggestOvertypingCapturer", "./suggestWidget", "vs/platform/telemetry/common/telemetry", "vs/base/common/resources", "vs/base/common/hash"], function (require, exports, aria_1, arrays_1, async_1, cancellation_1, errors_1, event_1, keybindings_1, lifecycle_1, platform, stopwatch_1, types_1, stableEditorScroll_1, editorExtensions_1, editOperation_1, position_1, range_1, editorContextKeys_1, snippetController2_1, snippetParser_1, suggestMemory_1, wordContextKey_1, nls, commands_1, contextkey_1, instantiation_1, log_1, suggest_1, suggestAlternatives_1, suggestCommitCharacters_1, suggestModel_1, suggestOvertypingCapturer_1, suggestWidget_1, telemetry_1, resources_1, hash_1) {
    "use strict";
    var $G6_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$H6 = exports.$G6 = void 0;
    // sticky suggest widget which doesn't disappear on focus out and such
    const _sticky = false;
    class LineSuffix {
        constructor(b, d) {
            this.b = b;
            this.d = d;
            // spy on what's happening right of the cursor. two cases:
            // 1. end of line -> check that it's still end of line
            // 2. mid of line -> add a marker and compute the delta
            const maxColumn = b.getLineMaxColumn(d.lineNumber);
            if (maxColumn !== d.column) {
                const offset = b.getOffsetAt(d);
                const end = b.getPositionAt(offset + 1);
                this.a = b.deltaDecorations([], [{
                        range: range_1.$ks.fromPositions(d, end),
                        options: { description: 'suggest-line-suffix', stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */ }
                    }]);
            }
        }
        dispose() {
            if (this.a && !this.b.isDisposed()) {
                this.b.deltaDecorations(this.a, []);
            }
        }
        delta(position) {
            if (this.b.isDisposed() || this.d.lineNumber !== position.lineNumber) {
                // bail out early if things seems fishy
                return 0;
            }
            // read the marker (in case suggest was triggered at line end) or compare
            // the cursor to the line end.
            if (this.a) {
                const range = this.b.getDecorationRange(this.a[0]);
                const end = this.b.getOffsetAt(range.getStartPosition());
                return end - this.b.getOffsetAt(position);
            }
            else {
                return this.b.getLineMaxColumn(position.lineNumber) - position.column;
            }
        }
    }
    var InsertFlags;
    (function (InsertFlags) {
        InsertFlags[InsertFlags["None"] = 0] = "None";
        InsertFlags[InsertFlags["NoBeforeUndoStop"] = 1] = "NoBeforeUndoStop";
        InsertFlags[InsertFlags["NoAfterUndoStop"] = 2] = "NoAfterUndoStop";
        InsertFlags[InsertFlags["KeepAlternativeSuggestions"] = 4] = "KeepAlternativeSuggestions";
        InsertFlags[InsertFlags["AlternativeOverwriteConfig"] = 8] = "AlternativeOverwriteConfig";
    })(InsertFlags || (InsertFlags = {}));
    let $G6 = class $G6 {
        static { $G6_1 = this; }
        static { this.ID = 'editor.contrib.suggestController'; }
        static get(editor) {
            return editor.getContribution($G6_1.ID);
        }
        constructor(editor, j, k, l, m, n, o) {
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.n = n;
            this.o = o;
            this.b = new lifecycle_1.$lc();
            this.d = new lifecycle_1.$jc();
            this.g = new PriorityRegistry(s => s.priority);
            this.h = new event_1.$fd();
            this.onWillInsertSuggestItem = this.h.event;
            this.editor = editor;
            this.model = m.createInstance(suggestModel_1.$_5, this.editor);
            // default selector
            this.g.register({
                priority: 0,
                select: (model, pos, items) => this.j.select(model, pos, items)
            });
            // context key: update insert/replace mode
            const ctxInsertMode = suggest_1.$V5.InsertMode.bindTo(l);
            ctxInsertMode.set(editor.getOption(117 /* EditorOption.suggest */).insertMode);
            this.d.add(this.model.onDidTrigger(() => ctxInsertMode.set(editor.getOption(117 /* EditorOption.suggest */).insertMode)));
            this.widget = this.d.add(new async_1.$Xg(() => {
                const widget = this.m.createInstance(suggestWidget_1.$C6, this.editor);
                this.d.add(widget);
                this.d.add(widget.onDidSelect(item => this.p(item, 0 /* InsertFlags.None */), this));
                // Wire up logic to accept a suggestion on certain characters
                const commitCharacterController = new suggestCommitCharacters_1.$F6(this.editor, widget, this.model, item => this.p(item, 2 /* InsertFlags.NoAfterUndoStop */));
                this.d.add(commitCharacterController);
                // Wire up makes text edit context key
                const ctxMakesTextEdit = suggest_1.$V5.MakesTextEdit.bindTo(this.l);
                const ctxHasInsertAndReplace = suggest_1.$V5.HasInsertAndReplaceRange.bindTo(this.l);
                const ctxCanResolve = suggest_1.$V5.CanResolve.bindTo(this.l);
                this.d.add((0, lifecycle_1.$ic)(() => {
                    ctxMakesTextEdit.reset();
                    ctxHasInsertAndReplace.reset();
                    ctxCanResolve.reset();
                }));
                this.d.add(widget.onDidFocus(({ item }) => {
                    // (ctx: makesTextEdit)
                    const position = this.editor.getPosition();
                    const startColumn = item.editStart.column;
                    const endColumn = position.column;
                    let value = true;
                    if (this.editor.getOption(1 /* EditorOption.acceptSuggestionOnEnter */) === 'smart'
                        && this.model.state === 2 /* State.Auto */
                        && !item.completion.additionalTextEdits
                        && !(item.completion.insertTextRules & 4 /* CompletionItemInsertTextRule.InsertAsSnippet */)
                        && endColumn - startColumn === item.completion.insertText.length) {
                        const oldText = this.editor.getModel().getValueInRange({
                            startLineNumber: position.lineNumber,
                            startColumn,
                            endLineNumber: position.lineNumber,
                            endColumn
                        });
                        value = oldText !== item.completion.insertText;
                    }
                    ctxMakesTextEdit.set(value);
                    // (ctx: hasInsertAndReplaceRange)
                    ctxHasInsertAndReplace.set(!position_1.$js.equals(item.editInsertEnd, item.editReplaceEnd));
                    // (ctx: canResolve)
                    ctxCanResolve.set(Boolean(item.provider.resolveCompletionItem) || Boolean(item.completion.documentation) || item.completion.detail !== item.completion.label);
                }));
                this.d.add(widget.onDetailsKeyDown(e => {
                    // cmd + c on macOS, ctrl + c on Win / Linux
                    if (e.toKeyCodeChord().equals(new keybindings_1.$yq(true, false, false, false, 33 /* KeyCode.KeyC */)) ||
                        (platform.$j && e.toKeyCodeChord().equals(new keybindings_1.$yq(false, false, false, true, 33 /* KeyCode.KeyC */)))) {
                        e.stopPropagation();
                        return;
                    }
                    if (!e.toKeyCodeChord().isModifierKey()) {
                        this.editor.focus();
                    }
                }));
                return widget;
            }));
            // Wire up text overtyping capture
            this.f = this.d.add(new async_1.$Xg(() => {
                return this.d.add(new suggestOvertypingCapturer_1.$a6(this.editor, this.model));
            }));
            this.a = this.d.add(new async_1.$Xg(() => {
                return this.d.add(new suggestAlternatives_1.$E6(this.editor, this.l));
            }));
            this.d.add(m.createInstance(wordContextKey_1.$s6, editor));
            this.d.add(this.model.onDidTrigger(e => {
                this.widget.value.showTriggered(e.auto, e.shy ? 250 : 50);
                this.b.value = new LineSuffix(this.editor.getModel(), e.position);
            }));
            this.d.add(this.model.onDidSuggest(e => {
                if (e.triggerOptions.shy) {
                    return;
                }
                let index = -1;
                for (const selector of this.g.itemsOrderedByPriorityDesc) {
                    index = selector.select(this.editor.getModel(), this.editor.getPosition(), e.completionModel.items);
                    if (index !== -1) {
                        break;
                    }
                }
                if (index === -1) {
                    index = 0;
                }
                let noFocus = false;
                if (e.triggerOptions.auto) {
                    // don't "focus" item when configured to do
                    const options = this.editor.getOption(117 /* EditorOption.suggest */);
                    if (options.selectionMode === 'never' || options.selectionMode === 'always') {
                        // simple: always or never
                        noFocus = options.selectionMode === 'never';
                    }
                    else if (options.selectionMode === 'whenTriggerCharacter') {
                        // on with trigger character
                        noFocus = e.triggerOptions.triggerKind !== 1 /* CompletionTriggerKind.TriggerCharacter */;
                    }
                    else if (options.selectionMode === 'whenQuickSuggestion') {
                        // without trigger character or when refiltering
                        noFocus = e.triggerOptions.triggerKind === 1 /* CompletionTriggerKind.TriggerCharacter */ && !e.triggerOptions.refilter;
                    }
                }
                this.widget.value.showSuggestions(e.completionModel, index, e.isFrozen, e.triggerOptions.auto, noFocus);
            }));
            this.d.add(this.model.onDidCancel(e => {
                if (!e.retrigger) {
                    this.widget.value.hideWidget();
                }
            }));
            this.d.add(this.editor.onDidBlurEditorWidget(() => {
                if (!_sticky) {
                    this.model.cancel();
                    this.model.clear();
                }
            }));
            // Manage the acceptSuggestionsOnEnter context key
            const acceptSuggestionsOnEnter = suggest_1.$V5.AcceptSuggestionsOnEnter.bindTo(l);
            const updateFromConfig = () => {
                const acceptSuggestionOnEnter = this.editor.getOption(1 /* EditorOption.acceptSuggestionOnEnter */);
                acceptSuggestionsOnEnter.set(acceptSuggestionOnEnter === 'on' || acceptSuggestionOnEnter === 'smart');
            };
            this.d.add(this.editor.onDidChangeConfiguration(() => updateFromConfig()));
            updateFromConfig();
        }
        dispose() {
            this.a.dispose();
            this.d.dispose();
            this.widget.dispose();
            this.model.dispose();
            this.b.dispose();
            this.h.dispose();
        }
        p(event, flags) {
            if (!event || !event.item) {
                this.a.value.reset();
                this.model.cancel();
                this.model.clear();
                return;
            }
            if (!this.editor.hasModel()) {
                return;
            }
            const snippetController = snippetController2_1.$05.get(this.editor);
            if (!snippetController) {
                return;
            }
            this.h.fire({ item: event.item });
            const model = this.editor.getModel();
            const modelVersionNow = model.getAlternativeVersionId();
            const { item } = event;
            //
            const tasks = [];
            const cts = new cancellation_1.$pd();
            // pushing undo stops *before* additional text edits and
            // *after* the main edit
            if (!(flags & 1 /* InsertFlags.NoBeforeUndoStop */)) {
                this.editor.pushUndoStop();
            }
            // compute overwrite[Before|After] deltas BEFORE applying extra edits
            const info = this.getOverwriteInfo(item, Boolean(flags & 8 /* InsertFlags.AlternativeOverwriteConfig */));
            // keep item in memory
            this.j.memorize(model, this.editor.getPosition(), item);
            const isResolved = item.isResolved;
            // telemetry data points: duration of command execution, info about async additional edits (-1=n/a, -2=none, 1=success, 0=failed)
            let _commandExectionDuration = -1;
            let _additionalEditsAppliedAsync = -1;
            if (Array.isArray(item.completion.additionalTextEdits)) {
                // cancel -> stops all listening and closes widget
                this.model.cancel();
                // sync additional edits
                const scrollState = stableEditorScroll_1.$TZ.capture(this.editor);
                this.editor.executeEdits('suggestController.additionalTextEdits.sync', item.completion.additionalTextEdits.map(edit => editOperation_1.$ls.replaceMove(range_1.$ks.lift(edit.range), edit.text)));
                scrollState.restoreRelativeVerticalPositionOfCursor(this.editor);
            }
            else if (!isResolved) {
                // async additional edits
                const sw = new stopwatch_1.$bd();
                let position;
                const docListener = model.onDidChangeContent(e => {
                    if (e.isFlush) {
                        cts.cancel();
                        docListener.dispose();
                        return;
                    }
                    for (const change of e.changes) {
                        const thisPosition = range_1.$ks.getEndPosition(change.range);
                        if (!position || position_1.$js.isBefore(thisPosition, position)) {
                            position = thisPosition;
                        }
                    }
                });
                const oldFlags = flags;
                flags |= 2 /* InsertFlags.NoAfterUndoStop */;
                let didType = false;
                const typeListener = this.editor.onWillType(() => {
                    typeListener.dispose();
                    didType = true;
                    if (!(oldFlags & 2 /* InsertFlags.NoAfterUndoStop */)) {
                        this.editor.pushUndoStop();
                    }
                });
                tasks.push(item.resolve(cts.token).then(() => {
                    if (!item.completion.additionalTextEdits || cts.token.isCancellationRequested) {
                        return undefined;
                    }
                    if (position && item.completion.additionalTextEdits.some(edit => position_1.$js.isBefore(position, range_1.$ks.getStartPosition(edit.range)))) {
                        return false;
                    }
                    if (didType) {
                        this.editor.pushUndoStop();
                    }
                    const scrollState = stableEditorScroll_1.$TZ.capture(this.editor);
                    this.editor.executeEdits('suggestController.additionalTextEdits.async', item.completion.additionalTextEdits.map(edit => editOperation_1.$ls.replaceMove(range_1.$ks.lift(edit.range), edit.text)));
                    scrollState.restoreRelativeVerticalPositionOfCursor(this.editor);
                    if (didType || !(oldFlags & 2 /* InsertFlags.NoAfterUndoStop */)) {
                        this.editor.pushUndoStop();
                    }
                    return true;
                }).then(applied => {
                    this.n.trace('[suggest] async resolving of edits DONE (ms, applied?)', sw.elapsed(), applied);
                    _additionalEditsAppliedAsync = applied === true ? 1 : applied === false ? 0 : -2;
                }).finally(() => {
                    docListener.dispose();
                    typeListener.dispose();
                }));
            }
            let { insertText } = item.completion;
            if (!(item.completion.insertTextRules & 4 /* CompletionItemInsertTextRule.InsertAsSnippet */)) {
                insertText = snippetParser_1.$G5.escape(insertText);
            }
            // cancel -> stops all listening and closes widget
            this.model.cancel();
            snippetController.insert(insertText, {
                overwriteBefore: info.overwriteBefore,
                overwriteAfter: info.overwriteAfter,
                undoStopBefore: false,
                undoStopAfter: false,
                adjustWhitespace: !(item.completion.insertTextRules & 1 /* CompletionItemInsertTextRule.KeepWhitespace */),
                clipboardText: event.model.clipboardText,
                overtypingCapturer: this.f.value
            });
            if (!(flags & 2 /* InsertFlags.NoAfterUndoStop */)) {
                this.editor.pushUndoStop();
            }
            if (item.completion.command) {
                if (item.completion.command.id === $H6.id) {
                    // retigger
                    this.model.trigger({ auto: true, retrigger: true });
                }
                else {
                    // exec command, done
                    const sw = new stopwatch_1.$bd();
                    tasks.push(this.k.executeCommand(item.completion.command.id, ...(item.completion.command.arguments ? [...item.completion.command.arguments] : [])).catch(e => {
                        if (item.completion.extensionId) {
                            (0, errors_1.$Z)(e);
                        }
                        else {
                            (0, errors_1.$Y)(e);
                        }
                    }).finally(() => {
                        _commandExectionDuration = sw.elapsed();
                    }));
                }
            }
            if (flags & 4 /* InsertFlags.KeepAlternativeSuggestions */) {
                this.a.value.set(event, next => {
                    // cancel resolving of additional edits
                    cts.cancel();
                    // this is not so pretty. when inserting the 'next'
                    // suggestion we undo until we are at the state at
                    // which we were before inserting the previous suggestion...
                    while (model.canUndo()) {
                        if (modelVersionNow !== model.getAlternativeVersionId()) {
                            model.undo();
                        }
                        this.p(next, 1 /* InsertFlags.NoBeforeUndoStop */ | 2 /* InsertFlags.NoAfterUndoStop */ | (flags & 8 /* InsertFlags.AlternativeOverwriteConfig */ ? 8 /* InsertFlags.AlternativeOverwriteConfig */ : 0));
                        break;
                    }
                });
            }
            this.r(item);
            // clear only now - after all tasks are done
            Promise.all(tasks).finally(() => {
                this.q(item, model, isResolved, _commandExectionDuration, _additionalEditsAppliedAsync);
                this.model.clear();
                cts.dispose();
            });
        }
        q(item, model, itemResolved, commandExectionDuration, additionalEditsAppliedAsync) {
            if (Math.floor(Math.random() * 100) === 0) {
                // throttle telemetry event because accepting completions happens a lot
                return;
            }
            this.o.publicLog2('suggest.acceptedSuggestion', {
                extensionId: item.extensionId?.value ?? 'unknown',
                providerId: item.provider._debugDisplayName ?? 'unknown',
                kind: item.completion.kind,
                basenameHash: (0, hash_1.$pi)((0, resources_1.$fg)(model.uri)).toString(16),
                languageId: model.getLanguageId(),
                fileExtension: (0, resources_1.$gg)(model.uri),
                resolveInfo: !item.provider.resolveCompletionItem ? -1 : itemResolved ? 1 : 0,
                resolveDuration: item.resolveDuration,
                commandDuration: commandExectionDuration,
                additionalEditsAsync: additionalEditsAppliedAsync
            });
        }
        getOverwriteInfo(item, toggleMode) {
            (0, types_1.$tf)(this.editor.hasModel());
            let replace = this.editor.getOption(117 /* EditorOption.suggest */).insertMode === 'replace';
            if (toggleMode) {
                replace = !replace;
            }
            const overwriteBefore = item.position.column - item.editStart.column;
            const overwriteAfter = (replace ? item.editReplaceEnd.column : item.editInsertEnd.column) - item.position.column;
            const columnDelta = this.editor.getPosition().column - item.position.column;
            const suffixDelta = this.b.value ? this.b.value.delta(this.editor.getPosition()) : 0;
            return {
                overwriteBefore: overwriteBefore + columnDelta,
                overwriteAfter: overwriteAfter + suffixDelta
            };
        }
        r(item) {
            if ((0, arrays_1.$Jb)(item.completion.additionalTextEdits)) {
                const msg = nls.localize(0, null, item.textLabel, item.completion.additionalTextEdits.length);
                (0, aria_1.$$P)(msg);
            }
        }
        triggerSuggest(onlyFrom, auto, noFilter) {
            if (this.editor.hasModel()) {
                this.model.trigger({
                    auto: auto ?? false,
                    completionOptions: { providerFilter: onlyFrom, kindFilter: noFilter ? new Set() : undefined }
                });
                this.editor.revealPosition(this.editor.getPosition(), 0 /* ScrollType.Smooth */);
                this.editor.focus();
            }
        }
        triggerSuggestAndAcceptBest(arg) {
            if (!this.editor.hasModel()) {
                return;
            }
            const positionNow = this.editor.getPosition();
            const fallback = () => {
                if (positionNow.equals(this.editor.getPosition())) {
                    this.k.executeCommand(arg.fallback);
                }
            };
            const makesTextEdit = (item) => {
                if (item.completion.insertTextRules & 4 /* CompletionItemInsertTextRule.InsertAsSnippet */ || item.completion.additionalTextEdits) {
                    // snippet, other editor -> makes edit
                    return true;
                }
                const position = this.editor.getPosition();
                const startColumn = item.editStart.column;
                const endColumn = position.column;
                if (endColumn - startColumn !== item.completion.insertText.length) {
                    // unequal lengths -> makes edit
                    return true;
                }
                const textNow = this.editor.getModel().getValueInRange({
                    startLineNumber: position.lineNumber,
                    startColumn,
                    endLineNumber: position.lineNumber,
                    endColumn
                });
                // unequal text -> makes edit
                return textNow !== item.completion.insertText;
            };
            event_1.Event.once(this.model.onDidTrigger)(_ => {
                // wait for trigger because only then the cancel-event is trustworthy
                const listener = [];
                event_1.Event.any(this.model.onDidTrigger, this.model.onDidCancel)(() => {
                    // retrigger or cancel -> try to type default text
                    (0, lifecycle_1.$fc)(listener);
                    fallback();
                }, undefined, listener);
                this.model.onDidSuggest(({ completionModel }) => {
                    (0, lifecycle_1.$fc)(listener);
                    if (completionModel.items.length === 0) {
                        fallback();
                        return;
                    }
                    const index = this.j.select(this.editor.getModel(), this.editor.getPosition(), completionModel.items);
                    const item = completionModel.items[index];
                    if (!makesTextEdit(item)) {
                        fallback();
                        return;
                    }
                    this.editor.pushUndoStop();
                    this.p({ index, item, model: completionModel }, 4 /* InsertFlags.KeepAlternativeSuggestions */ | 1 /* InsertFlags.NoBeforeUndoStop */ | 2 /* InsertFlags.NoAfterUndoStop */);
                }, undefined, listener);
            });
            this.model.trigger({ auto: false, shy: true });
            this.editor.revealPosition(positionNow, 0 /* ScrollType.Smooth */);
            this.editor.focus();
        }
        acceptSelectedSuggestion(keepAlternativeSuggestions, alternativeOverwriteConfig) {
            const item = this.widget.value.getFocusedItem();
            let flags = 0;
            if (keepAlternativeSuggestions) {
                flags |= 4 /* InsertFlags.KeepAlternativeSuggestions */;
            }
            if (alternativeOverwriteConfig) {
                flags |= 8 /* InsertFlags.AlternativeOverwriteConfig */;
            }
            this.p(item, flags);
        }
        acceptNextSuggestion() {
            this.a.value.next();
        }
        acceptPrevSuggestion() {
            this.a.value.prev();
        }
        cancelSuggestWidget() {
            this.model.cancel();
            this.model.clear();
            this.widget.value.hideWidget();
        }
        focusSuggestion() {
            this.widget.value.focusSelected();
        }
        selectNextSuggestion() {
            this.widget.value.selectNext();
        }
        selectNextPageSuggestion() {
            this.widget.value.selectNextPage();
        }
        selectLastSuggestion() {
            this.widget.value.selectLast();
        }
        selectPrevSuggestion() {
            this.widget.value.selectPrevious();
        }
        selectPrevPageSuggestion() {
            this.widget.value.selectPreviousPage();
        }
        selectFirstSuggestion() {
            this.widget.value.selectFirst();
        }
        toggleSuggestionDetails() {
            this.widget.value.toggleDetails();
        }
        toggleExplainMode() {
            this.widget.value.toggleExplainMode();
        }
        toggleSuggestionFocus() {
            this.widget.value.toggleDetailsFocus();
        }
        resetWidgetSize() {
            this.widget.value.resetPersistedSize();
        }
        forceRenderingAbove() {
            this.widget.value.forceRenderingAbove();
        }
        stopForceRenderingAbove() {
            if (!this.widget.isInitialized) {
                // This method has no effect if the widget is not initialized yet.
                return;
            }
            this.widget.value.stopForceRenderingAbove();
        }
        registerSelector(selector) {
            return this.g.register(selector);
        }
    };
    exports.$G6 = $G6;
    exports.$G6 = $G6 = $G6_1 = __decorate([
        __param(1, suggestMemory_1.$r6),
        __param(2, commands_1.$Fr),
        __param(3, contextkey_1.$3i),
        __param(4, instantiation_1.$Ah),
        __param(5, log_1.$5i),
        __param(6, telemetry_1.$9k)
    ], $G6);
    class PriorityRegistry {
        constructor(b) {
            this.b = b;
            this.a = new Array();
        }
        register(value) {
            if (this.a.indexOf(value) !== -1) {
                throw new Error('Value is already registered');
            }
            this.a.push(value);
            this.a.sort((s1, s2) => this.b(s2) - this.b(s1));
            return {
                dispose: () => {
                    const idx = this.a.indexOf(value);
                    if (idx >= 0) {
                        this.a.splice(idx, 1);
                    }
                }
            };
        }
        get itemsOrderedByPriorityDesc() {
            return this.a;
        }
    }
    class $H6 extends editorExtensions_1.$sV {
        static { this.id = 'editor.action.triggerSuggest'; }
        constructor() {
            super({
                id: $H6.id,
                label: nls.localize(1, null),
                alias: 'Trigger Suggest',
                precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasCompletionItemProvider, suggest_1.$V5.Visible.toNegated()),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 10 /* KeyCode.Space */,
                    secondary: [2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */],
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 10 /* KeyCode.Space */, secondary: [512 /* KeyMod.Alt */ | 9 /* KeyCode.Escape */, 2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */] },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(_accessor, editor, args) {
            const controller = $G6.get(editor);
            if (!controller) {
                return;
            }
            let auto;
            if (args && typeof args === 'object') {
                if (args.auto === true) {
                    auto = true;
                }
            }
            controller.triggerSuggest(undefined, auto, undefined);
        }
    }
    exports.$H6 = $H6;
    (0, editorExtensions_1.$AV)($G6.ID, $G6, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
    (0, editorExtensions_1.$xV)($H6);
    const weight = 100 /* KeybindingWeight.EditorContrib */ + 90;
    const SuggestCommand = editorExtensions_1.$rV.bindToContribution($G6.get);
    (0, editorExtensions_1.$wV)(new SuggestCommand({
        id: 'acceptSelectedSuggestion',
        precondition: contextkey_1.$Ii.and(suggest_1.$V5.Visible, suggest_1.$V5.HasFocusedSuggestion),
        handler(x) {
            x.acceptSelectedSuggestion(true, false);
        },
        kbOpts: [{
                // normal tab
                primary: 2 /* KeyCode.Tab */,
                kbExpr: contextkey_1.$Ii.and(suggest_1.$V5.Visible, editorContextKeys_1.EditorContextKeys.textInputFocus),
                weight,
            }, {
                // accept on enter has special rules
                primary: 3 /* KeyCode.Enter */,
                kbExpr: contextkey_1.$Ii.and(suggest_1.$V5.Visible, editorContextKeys_1.EditorContextKeys.textInputFocus, suggest_1.$V5.AcceptSuggestionsOnEnter, suggest_1.$V5.MakesTextEdit),
                weight,
            }],
        menuOpts: [{
                menuId: suggest_1.$W5,
                title: nls.localize(2, null),
                group: 'left',
                order: 1,
                when: suggest_1.$V5.HasInsertAndReplaceRange.toNegated()
            }, {
                menuId: suggest_1.$W5,
                title: nls.localize(3, null),
                group: 'left',
                order: 1,
                when: contextkey_1.$Ii.and(suggest_1.$V5.HasInsertAndReplaceRange, suggest_1.$V5.InsertMode.isEqualTo('insert'))
            }, {
                menuId: suggest_1.$W5,
                title: nls.localize(4, null),
                group: 'left',
                order: 1,
                when: contextkey_1.$Ii.and(suggest_1.$V5.HasInsertAndReplaceRange, suggest_1.$V5.InsertMode.isEqualTo('replace'))
            }]
    }));
    (0, editorExtensions_1.$wV)(new SuggestCommand({
        id: 'acceptAlternativeSelectedSuggestion',
        precondition: contextkey_1.$Ii.and(suggest_1.$V5.Visible, editorContextKeys_1.EditorContextKeys.textInputFocus, suggest_1.$V5.HasFocusedSuggestion),
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
            primary: 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */,
            secondary: [1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */],
        },
        handler(x) {
            x.acceptSelectedSuggestion(false, true);
        },
        menuOpts: [{
                menuId: suggest_1.$W5,
                group: 'left',
                order: 2,
                when: contextkey_1.$Ii.and(suggest_1.$V5.HasInsertAndReplaceRange, suggest_1.$V5.InsertMode.isEqualTo('insert')),
                title: nls.localize(5, null)
            }, {
                menuId: suggest_1.$W5,
                group: 'left',
                order: 2,
                when: contextkey_1.$Ii.and(suggest_1.$V5.HasInsertAndReplaceRange, suggest_1.$V5.InsertMode.isEqualTo('replace')),
                title: nls.localize(6, null)
            }]
    }));
    // continue to support the old command
    commands_1.$Gr.registerCommandAlias('acceptSelectedSuggestionOnEnter', 'acceptSelectedSuggestion');
    (0, editorExtensions_1.$wV)(new SuggestCommand({
        id: 'hideSuggestWidget',
        precondition: suggest_1.$V5.Visible,
        handler: x => x.cancelSuggestWidget(),
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
            primary: 9 /* KeyCode.Escape */,
            secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */]
        }
    }));
    (0, editorExtensions_1.$wV)(new SuggestCommand({
        id: 'selectNextSuggestion',
        precondition: contextkey_1.$Ii.and(suggest_1.$V5.Visible, contextkey_1.$Ii.or(suggest_1.$V5.MultipleSuggestions, suggest_1.$V5.HasFocusedSuggestion.negate())),
        handler: c => c.selectNextSuggestion(),
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
            primary: 18 /* KeyCode.DownArrow */,
            secondary: [2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */],
            mac: { primary: 18 /* KeyCode.DownArrow */, secondary: [2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */, 256 /* KeyMod.WinCtrl */ | 44 /* KeyCode.KeyN */] }
        }
    }));
    (0, editorExtensions_1.$wV)(new SuggestCommand({
        id: 'selectNextPageSuggestion',
        precondition: contextkey_1.$Ii.and(suggest_1.$V5.Visible, contextkey_1.$Ii.or(suggest_1.$V5.MultipleSuggestions, suggest_1.$V5.HasFocusedSuggestion.negate())),
        handler: c => c.selectNextPageSuggestion(),
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
            primary: 12 /* KeyCode.PageDown */,
            secondary: [2048 /* KeyMod.CtrlCmd */ | 12 /* KeyCode.PageDown */]
        }
    }));
    (0, editorExtensions_1.$wV)(new SuggestCommand({
        id: 'selectLastSuggestion',
        precondition: contextkey_1.$Ii.and(suggest_1.$V5.Visible, contextkey_1.$Ii.or(suggest_1.$V5.MultipleSuggestions, suggest_1.$V5.HasFocusedSuggestion.negate())),
        handler: c => c.selectLastSuggestion()
    }));
    (0, editorExtensions_1.$wV)(new SuggestCommand({
        id: 'selectPrevSuggestion',
        precondition: contextkey_1.$Ii.and(suggest_1.$V5.Visible, contextkey_1.$Ii.or(suggest_1.$V5.MultipleSuggestions, suggest_1.$V5.HasFocusedSuggestion.negate())),
        handler: c => c.selectPrevSuggestion(),
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
            primary: 16 /* KeyCode.UpArrow */,
            secondary: [2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */],
            mac: { primary: 16 /* KeyCode.UpArrow */, secondary: [2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */, 256 /* KeyMod.WinCtrl */ | 46 /* KeyCode.KeyP */] }
        }
    }));
    (0, editorExtensions_1.$wV)(new SuggestCommand({
        id: 'selectPrevPageSuggestion',
        precondition: contextkey_1.$Ii.and(suggest_1.$V5.Visible, contextkey_1.$Ii.or(suggest_1.$V5.MultipleSuggestions, suggest_1.$V5.HasFocusedSuggestion.negate())),
        handler: c => c.selectPrevPageSuggestion(),
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
            primary: 11 /* KeyCode.PageUp */,
            secondary: [2048 /* KeyMod.CtrlCmd */ | 11 /* KeyCode.PageUp */]
        }
    }));
    (0, editorExtensions_1.$wV)(new SuggestCommand({
        id: 'selectFirstSuggestion',
        precondition: contextkey_1.$Ii.and(suggest_1.$V5.Visible, contextkey_1.$Ii.or(suggest_1.$V5.MultipleSuggestions, suggest_1.$V5.HasFocusedSuggestion.negate())),
        handler: c => c.selectFirstSuggestion()
    }));
    (0, editorExtensions_1.$wV)(new SuggestCommand({
        id: 'focusSuggestion',
        precondition: contextkey_1.$Ii.and(suggest_1.$V5.Visible, suggest_1.$V5.HasFocusedSuggestion.negate()),
        handler: x => x.focusSuggestion(),
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
            primary: 2048 /* KeyMod.CtrlCmd */ | 10 /* KeyCode.Space */,
            secondary: [2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */],
            mac: { primary: 256 /* KeyMod.WinCtrl */ | 10 /* KeyCode.Space */, secondary: [2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */] }
        },
    }));
    (0, editorExtensions_1.$wV)(new SuggestCommand({
        id: 'focusAndAcceptSuggestion',
        precondition: contextkey_1.$Ii.and(suggest_1.$V5.Visible, suggest_1.$V5.HasFocusedSuggestion.negate()),
        handler: c => {
            c.focusSuggestion();
            c.acceptSelectedSuggestion(true, false);
        }
    }));
    (0, editorExtensions_1.$wV)(new SuggestCommand({
        id: 'toggleSuggestionDetails',
        precondition: contextkey_1.$Ii.and(suggest_1.$V5.Visible, suggest_1.$V5.HasFocusedSuggestion),
        handler: x => x.toggleSuggestionDetails(),
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
            primary: 2048 /* KeyMod.CtrlCmd */ | 10 /* KeyCode.Space */,
            secondary: [2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */],
            mac: { primary: 256 /* KeyMod.WinCtrl */ | 10 /* KeyCode.Space */, secondary: [2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */] }
        },
        menuOpts: [{
                menuId: suggest_1.$W5,
                group: 'right',
                order: 1,
                when: contextkey_1.$Ii.and(suggest_1.$V5.DetailsVisible, suggest_1.$V5.CanResolve),
                title: nls.localize(7, null)
            }, {
                menuId: suggest_1.$W5,
                group: 'right',
                order: 1,
                when: contextkey_1.$Ii.and(suggest_1.$V5.DetailsVisible.toNegated(), suggest_1.$V5.CanResolve),
                title: nls.localize(8, null)
            }]
    }));
    (0, editorExtensions_1.$wV)(new SuggestCommand({
        id: 'toggleExplainMode',
        precondition: suggest_1.$V5.Visible,
        handler: x => x.toggleExplainMode(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */,
            primary: 2048 /* KeyMod.CtrlCmd */ | 90 /* KeyCode.Slash */,
        }
    }));
    (0, editorExtensions_1.$wV)(new SuggestCommand({
        id: 'toggleSuggestionFocus',
        precondition: suggest_1.$V5.Visible,
        handler: x => x.toggleSuggestionFocus(),
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
            primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 10 /* KeyCode.Space */,
            mac: { primary: 256 /* KeyMod.WinCtrl */ | 512 /* KeyMod.Alt */ | 10 /* KeyCode.Space */ }
        }
    }));
    //#region tab completions
    (0, editorExtensions_1.$wV)(new SuggestCommand({
        id: 'insertBestCompletion',
        precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.textInputFocus, contextkey_1.$Ii.equals('config.editor.tabCompletion', 'on'), wordContextKey_1.$s6.AtEnd, suggest_1.$V5.Visible.toNegated(), suggestAlternatives_1.$E6.OtherSuggestions.toNegated(), snippetController2_1.$05.InSnippetMode.toNegated()),
        handler: (x, arg) => {
            x.triggerSuggestAndAcceptBest((0, types_1.$lf)(arg) ? { fallback: 'tab', ...arg } : { fallback: 'tab' });
        },
        kbOpts: {
            weight,
            primary: 2 /* KeyCode.Tab */
        }
    }));
    (0, editorExtensions_1.$wV)(new SuggestCommand({
        id: 'insertNextSuggestion',
        precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.textInputFocus, contextkey_1.$Ii.equals('config.editor.tabCompletion', 'on'), suggestAlternatives_1.$E6.OtherSuggestions, suggest_1.$V5.Visible.toNegated(), snippetController2_1.$05.InSnippetMode.toNegated()),
        handler: x => x.acceptNextSuggestion(),
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
            primary: 2 /* KeyCode.Tab */
        }
    }));
    (0, editorExtensions_1.$wV)(new SuggestCommand({
        id: 'insertPrevSuggestion',
        precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.textInputFocus, contextkey_1.$Ii.equals('config.editor.tabCompletion', 'on'), suggestAlternatives_1.$E6.OtherSuggestions, suggest_1.$V5.Visible.toNegated(), snippetController2_1.$05.InSnippetMode.toNegated()),
        handler: x => x.acceptPrevSuggestion(),
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
            primary: 1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */
        }
    }));
    (0, editorExtensions_1.$xV)(class extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.resetSuggestSize',
                label: nls.localize(9, null),
                alias: 'Reset Suggest Widget Size',
                precondition: undefined
            });
        }
        run(_accessor, editor) {
            $G6.get(editor)?.resetWidgetSize();
        }
    });
});
//# sourceMappingURL=suggestController.js.map