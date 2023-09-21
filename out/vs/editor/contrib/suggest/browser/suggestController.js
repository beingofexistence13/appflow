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
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/keybindings", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/stopwatch", "vs/base/common/types", "vs/editor/browser/stableEditorScroll", "vs/editor/browser/editorExtensions", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/contrib/snippet/browser/snippetController2", "vs/editor/contrib/snippet/browser/snippetParser", "vs/editor/contrib/suggest/browser/suggestMemory", "vs/editor/contrib/suggest/browser/wordContextKey", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "./suggest", "./suggestAlternatives", "./suggestCommitCharacters", "./suggestModel", "./suggestOvertypingCapturer", "./suggestWidget", "vs/platform/telemetry/common/telemetry", "vs/base/common/resources", "vs/base/common/hash"], function (require, exports, aria_1, arrays_1, async_1, cancellation_1, errors_1, event_1, keybindings_1, lifecycle_1, platform, stopwatch_1, types_1, stableEditorScroll_1, editorExtensions_1, editOperation_1, position_1, range_1, editorContextKeys_1, snippetController2_1, snippetParser_1, suggestMemory_1, wordContextKey_1, nls, commands_1, contextkey_1, instantiation_1, log_1, suggest_1, suggestAlternatives_1, suggestCommitCharacters_1, suggestModel_1, suggestOvertypingCapturer_1, suggestWidget_1, telemetry_1, resources_1, hash_1) {
    "use strict";
    var SuggestController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TriggerSuggestAction = exports.SuggestController = void 0;
    // sticky suggest widget which doesn't disappear on focus out and such
    const _sticky = false;
    class LineSuffix {
        constructor(_model, _position) {
            this._model = _model;
            this._position = _position;
            // spy on what's happening right of the cursor. two cases:
            // 1. end of line -> check that it's still end of line
            // 2. mid of line -> add a marker and compute the delta
            const maxColumn = _model.getLineMaxColumn(_position.lineNumber);
            if (maxColumn !== _position.column) {
                const offset = _model.getOffsetAt(_position);
                const end = _model.getPositionAt(offset + 1);
                this._marker = _model.deltaDecorations([], [{
                        range: range_1.Range.fromPositions(_position, end),
                        options: { description: 'suggest-line-suffix', stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */ }
                    }]);
            }
        }
        dispose() {
            if (this._marker && !this._model.isDisposed()) {
                this._model.deltaDecorations(this._marker, []);
            }
        }
        delta(position) {
            if (this._model.isDisposed() || this._position.lineNumber !== position.lineNumber) {
                // bail out early if things seems fishy
                return 0;
            }
            // read the marker (in case suggest was triggered at line end) or compare
            // the cursor to the line end.
            if (this._marker) {
                const range = this._model.getDecorationRange(this._marker[0]);
                const end = this._model.getOffsetAt(range.getStartPosition());
                return end - this._model.getOffsetAt(position);
            }
            else {
                return this._model.getLineMaxColumn(position.lineNumber) - position.column;
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
    let SuggestController = class SuggestController {
        static { SuggestController_1 = this; }
        static { this.ID = 'editor.contrib.suggestController'; }
        static get(editor) {
            return editor.getContribution(SuggestController_1.ID);
        }
        constructor(editor, _memoryService, _commandService, _contextKeyService, _instantiationService, _logService, _telemetryService) {
            this._memoryService = _memoryService;
            this._commandService = _commandService;
            this._contextKeyService = _contextKeyService;
            this._instantiationService = _instantiationService;
            this._logService = _logService;
            this._telemetryService = _telemetryService;
            this._lineSuffix = new lifecycle_1.MutableDisposable();
            this._toDispose = new lifecycle_1.DisposableStore();
            this._selectors = new PriorityRegistry(s => s.priority);
            this._onWillInsertSuggestItem = new event_1.Emitter();
            this.onWillInsertSuggestItem = this._onWillInsertSuggestItem.event;
            this.editor = editor;
            this.model = _instantiationService.createInstance(suggestModel_1.SuggestModel, this.editor);
            // default selector
            this._selectors.register({
                priority: 0,
                select: (model, pos, items) => this._memoryService.select(model, pos, items)
            });
            // context key: update insert/replace mode
            const ctxInsertMode = suggest_1.Context.InsertMode.bindTo(_contextKeyService);
            ctxInsertMode.set(editor.getOption(117 /* EditorOption.suggest */).insertMode);
            this._toDispose.add(this.model.onDidTrigger(() => ctxInsertMode.set(editor.getOption(117 /* EditorOption.suggest */).insertMode)));
            this.widget = this._toDispose.add(new async_1.IdleValue(() => {
                const widget = this._instantiationService.createInstance(suggestWidget_1.SuggestWidget, this.editor);
                this._toDispose.add(widget);
                this._toDispose.add(widget.onDidSelect(item => this._insertSuggestion(item, 0 /* InsertFlags.None */), this));
                // Wire up logic to accept a suggestion on certain characters
                const commitCharacterController = new suggestCommitCharacters_1.CommitCharacterController(this.editor, widget, this.model, item => this._insertSuggestion(item, 2 /* InsertFlags.NoAfterUndoStop */));
                this._toDispose.add(commitCharacterController);
                // Wire up makes text edit context key
                const ctxMakesTextEdit = suggest_1.Context.MakesTextEdit.bindTo(this._contextKeyService);
                const ctxHasInsertAndReplace = suggest_1.Context.HasInsertAndReplaceRange.bindTo(this._contextKeyService);
                const ctxCanResolve = suggest_1.Context.CanResolve.bindTo(this._contextKeyService);
                this._toDispose.add((0, lifecycle_1.toDisposable)(() => {
                    ctxMakesTextEdit.reset();
                    ctxHasInsertAndReplace.reset();
                    ctxCanResolve.reset();
                }));
                this._toDispose.add(widget.onDidFocus(({ item }) => {
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
                    ctxHasInsertAndReplace.set(!position_1.Position.equals(item.editInsertEnd, item.editReplaceEnd));
                    // (ctx: canResolve)
                    ctxCanResolve.set(Boolean(item.provider.resolveCompletionItem) || Boolean(item.completion.documentation) || item.completion.detail !== item.completion.label);
                }));
                this._toDispose.add(widget.onDetailsKeyDown(e => {
                    // cmd + c on macOS, ctrl + c on Win / Linux
                    if (e.toKeyCodeChord().equals(new keybindings_1.KeyCodeChord(true, false, false, false, 33 /* KeyCode.KeyC */)) ||
                        (platform.isMacintosh && e.toKeyCodeChord().equals(new keybindings_1.KeyCodeChord(false, false, false, true, 33 /* KeyCode.KeyC */)))) {
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
            this._overtypingCapturer = this._toDispose.add(new async_1.IdleValue(() => {
                return this._toDispose.add(new suggestOvertypingCapturer_1.OvertypingCapturer(this.editor, this.model));
            }));
            this._alternatives = this._toDispose.add(new async_1.IdleValue(() => {
                return this._toDispose.add(new suggestAlternatives_1.SuggestAlternatives(this.editor, this._contextKeyService));
            }));
            this._toDispose.add(_instantiationService.createInstance(wordContextKey_1.WordContextKey, editor));
            this._toDispose.add(this.model.onDidTrigger(e => {
                this.widget.value.showTriggered(e.auto, e.shy ? 250 : 50);
                this._lineSuffix.value = new LineSuffix(this.editor.getModel(), e.position);
            }));
            this._toDispose.add(this.model.onDidSuggest(e => {
                if (e.triggerOptions.shy) {
                    return;
                }
                let index = -1;
                for (const selector of this._selectors.itemsOrderedByPriorityDesc) {
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
            this._toDispose.add(this.model.onDidCancel(e => {
                if (!e.retrigger) {
                    this.widget.value.hideWidget();
                }
            }));
            this._toDispose.add(this.editor.onDidBlurEditorWidget(() => {
                if (!_sticky) {
                    this.model.cancel();
                    this.model.clear();
                }
            }));
            // Manage the acceptSuggestionsOnEnter context key
            const acceptSuggestionsOnEnter = suggest_1.Context.AcceptSuggestionsOnEnter.bindTo(_contextKeyService);
            const updateFromConfig = () => {
                const acceptSuggestionOnEnter = this.editor.getOption(1 /* EditorOption.acceptSuggestionOnEnter */);
                acceptSuggestionsOnEnter.set(acceptSuggestionOnEnter === 'on' || acceptSuggestionOnEnter === 'smart');
            };
            this._toDispose.add(this.editor.onDidChangeConfiguration(() => updateFromConfig()));
            updateFromConfig();
        }
        dispose() {
            this._alternatives.dispose();
            this._toDispose.dispose();
            this.widget.dispose();
            this.model.dispose();
            this._lineSuffix.dispose();
            this._onWillInsertSuggestItem.dispose();
        }
        _insertSuggestion(event, flags) {
            if (!event || !event.item) {
                this._alternatives.value.reset();
                this.model.cancel();
                this.model.clear();
                return;
            }
            if (!this.editor.hasModel()) {
                return;
            }
            const snippetController = snippetController2_1.SnippetController2.get(this.editor);
            if (!snippetController) {
                return;
            }
            this._onWillInsertSuggestItem.fire({ item: event.item });
            const model = this.editor.getModel();
            const modelVersionNow = model.getAlternativeVersionId();
            const { item } = event;
            //
            const tasks = [];
            const cts = new cancellation_1.CancellationTokenSource();
            // pushing undo stops *before* additional text edits and
            // *after* the main edit
            if (!(flags & 1 /* InsertFlags.NoBeforeUndoStop */)) {
                this.editor.pushUndoStop();
            }
            // compute overwrite[Before|After] deltas BEFORE applying extra edits
            const info = this.getOverwriteInfo(item, Boolean(flags & 8 /* InsertFlags.AlternativeOverwriteConfig */));
            // keep item in memory
            this._memoryService.memorize(model, this.editor.getPosition(), item);
            const isResolved = item.isResolved;
            // telemetry data points: duration of command execution, info about async additional edits (-1=n/a, -2=none, 1=success, 0=failed)
            let _commandExectionDuration = -1;
            let _additionalEditsAppliedAsync = -1;
            if (Array.isArray(item.completion.additionalTextEdits)) {
                // cancel -> stops all listening and closes widget
                this.model.cancel();
                // sync additional edits
                const scrollState = stableEditorScroll_1.StableEditorScrollState.capture(this.editor);
                this.editor.executeEdits('suggestController.additionalTextEdits.sync', item.completion.additionalTextEdits.map(edit => editOperation_1.EditOperation.replaceMove(range_1.Range.lift(edit.range), edit.text)));
                scrollState.restoreRelativeVerticalPositionOfCursor(this.editor);
            }
            else if (!isResolved) {
                // async additional edits
                const sw = new stopwatch_1.StopWatch();
                let position;
                const docListener = model.onDidChangeContent(e => {
                    if (e.isFlush) {
                        cts.cancel();
                        docListener.dispose();
                        return;
                    }
                    for (const change of e.changes) {
                        const thisPosition = range_1.Range.getEndPosition(change.range);
                        if (!position || position_1.Position.isBefore(thisPosition, position)) {
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
                    if (position && item.completion.additionalTextEdits.some(edit => position_1.Position.isBefore(position, range_1.Range.getStartPosition(edit.range)))) {
                        return false;
                    }
                    if (didType) {
                        this.editor.pushUndoStop();
                    }
                    const scrollState = stableEditorScroll_1.StableEditorScrollState.capture(this.editor);
                    this.editor.executeEdits('suggestController.additionalTextEdits.async', item.completion.additionalTextEdits.map(edit => editOperation_1.EditOperation.replaceMove(range_1.Range.lift(edit.range), edit.text)));
                    scrollState.restoreRelativeVerticalPositionOfCursor(this.editor);
                    if (didType || !(oldFlags & 2 /* InsertFlags.NoAfterUndoStop */)) {
                        this.editor.pushUndoStop();
                    }
                    return true;
                }).then(applied => {
                    this._logService.trace('[suggest] async resolving of edits DONE (ms, applied?)', sw.elapsed(), applied);
                    _additionalEditsAppliedAsync = applied === true ? 1 : applied === false ? 0 : -2;
                }).finally(() => {
                    docListener.dispose();
                    typeListener.dispose();
                }));
            }
            let { insertText } = item.completion;
            if (!(item.completion.insertTextRules & 4 /* CompletionItemInsertTextRule.InsertAsSnippet */)) {
                insertText = snippetParser_1.SnippetParser.escape(insertText);
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
                overtypingCapturer: this._overtypingCapturer.value
            });
            if (!(flags & 2 /* InsertFlags.NoAfterUndoStop */)) {
                this.editor.pushUndoStop();
            }
            if (item.completion.command) {
                if (item.completion.command.id === TriggerSuggestAction.id) {
                    // retigger
                    this.model.trigger({ auto: true, retrigger: true });
                }
                else {
                    // exec command, done
                    const sw = new stopwatch_1.StopWatch();
                    tasks.push(this._commandService.executeCommand(item.completion.command.id, ...(item.completion.command.arguments ? [...item.completion.command.arguments] : [])).catch(e => {
                        if (item.completion.extensionId) {
                            (0, errors_1.onUnexpectedExternalError)(e);
                        }
                        else {
                            (0, errors_1.onUnexpectedError)(e);
                        }
                    }).finally(() => {
                        _commandExectionDuration = sw.elapsed();
                    }));
                }
            }
            if (flags & 4 /* InsertFlags.KeepAlternativeSuggestions */) {
                this._alternatives.value.set(event, next => {
                    // cancel resolving of additional edits
                    cts.cancel();
                    // this is not so pretty. when inserting the 'next'
                    // suggestion we undo until we are at the state at
                    // which we were before inserting the previous suggestion...
                    while (model.canUndo()) {
                        if (modelVersionNow !== model.getAlternativeVersionId()) {
                            model.undo();
                        }
                        this._insertSuggestion(next, 1 /* InsertFlags.NoBeforeUndoStop */ | 2 /* InsertFlags.NoAfterUndoStop */ | (flags & 8 /* InsertFlags.AlternativeOverwriteConfig */ ? 8 /* InsertFlags.AlternativeOverwriteConfig */ : 0));
                        break;
                    }
                });
            }
            this._alertCompletionItem(item);
            // clear only now - after all tasks are done
            Promise.all(tasks).finally(() => {
                this._reportSuggestionAcceptedTelemetry(item, model, isResolved, _commandExectionDuration, _additionalEditsAppliedAsync);
                this.model.clear();
                cts.dispose();
            });
        }
        _reportSuggestionAcceptedTelemetry(item, model, itemResolved, commandExectionDuration, additionalEditsAppliedAsync) {
            if (Math.floor(Math.random() * 100) === 0) {
                // throttle telemetry event because accepting completions happens a lot
                return;
            }
            this._telemetryService.publicLog2('suggest.acceptedSuggestion', {
                extensionId: item.extensionId?.value ?? 'unknown',
                providerId: item.provider._debugDisplayName ?? 'unknown',
                kind: item.completion.kind,
                basenameHash: (0, hash_1.hash)((0, resources_1.basename)(model.uri)).toString(16),
                languageId: model.getLanguageId(),
                fileExtension: (0, resources_1.extname)(model.uri),
                resolveInfo: !item.provider.resolveCompletionItem ? -1 : itemResolved ? 1 : 0,
                resolveDuration: item.resolveDuration,
                commandDuration: commandExectionDuration,
                additionalEditsAsync: additionalEditsAppliedAsync
            });
        }
        getOverwriteInfo(item, toggleMode) {
            (0, types_1.assertType)(this.editor.hasModel());
            let replace = this.editor.getOption(117 /* EditorOption.suggest */).insertMode === 'replace';
            if (toggleMode) {
                replace = !replace;
            }
            const overwriteBefore = item.position.column - item.editStart.column;
            const overwriteAfter = (replace ? item.editReplaceEnd.column : item.editInsertEnd.column) - item.position.column;
            const columnDelta = this.editor.getPosition().column - item.position.column;
            const suffixDelta = this._lineSuffix.value ? this._lineSuffix.value.delta(this.editor.getPosition()) : 0;
            return {
                overwriteBefore: overwriteBefore + columnDelta,
                overwriteAfter: overwriteAfter + suffixDelta
            };
        }
        _alertCompletionItem(item) {
            if ((0, arrays_1.isNonEmptyArray)(item.completion.additionalTextEdits)) {
                const msg = nls.localize('aria.alert.snippet', "Accepting '{0}' made {1} additional edits", item.textLabel, item.completion.additionalTextEdits.length);
                (0, aria_1.alert)(msg);
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
                    this._commandService.executeCommand(arg.fallback);
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
                    (0, lifecycle_1.dispose)(listener);
                    fallback();
                }, undefined, listener);
                this.model.onDidSuggest(({ completionModel }) => {
                    (0, lifecycle_1.dispose)(listener);
                    if (completionModel.items.length === 0) {
                        fallback();
                        return;
                    }
                    const index = this._memoryService.select(this.editor.getModel(), this.editor.getPosition(), completionModel.items);
                    const item = completionModel.items[index];
                    if (!makesTextEdit(item)) {
                        fallback();
                        return;
                    }
                    this.editor.pushUndoStop();
                    this._insertSuggestion({ index, item, model: completionModel }, 4 /* InsertFlags.KeepAlternativeSuggestions */ | 1 /* InsertFlags.NoBeforeUndoStop */ | 2 /* InsertFlags.NoAfterUndoStop */);
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
            this._insertSuggestion(item, flags);
        }
        acceptNextSuggestion() {
            this._alternatives.value.next();
        }
        acceptPrevSuggestion() {
            this._alternatives.value.prev();
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
            return this._selectors.register(selector);
        }
    };
    exports.SuggestController = SuggestController;
    exports.SuggestController = SuggestController = SuggestController_1 = __decorate([
        __param(1, suggestMemory_1.ISuggestMemoryService),
        __param(2, commands_1.ICommandService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, log_1.ILogService),
        __param(6, telemetry_1.ITelemetryService)
    ], SuggestController);
    class PriorityRegistry {
        constructor(prioritySelector) {
            this.prioritySelector = prioritySelector;
            this._items = new Array();
        }
        register(value) {
            if (this._items.indexOf(value) !== -1) {
                throw new Error('Value is already registered');
            }
            this._items.push(value);
            this._items.sort((s1, s2) => this.prioritySelector(s2) - this.prioritySelector(s1));
            return {
                dispose: () => {
                    const idx = this._items.indexOf(value);
                    if (idx >= 0) {
                        this._items.splice(idx, 1);
                    }
                }
            };
        }
        get itemsOrderedByPriorityDesc() {
            return this._items;
        }
    }
    class TriggerSuggestAction extends editorExtensions_1.EditorAction {
        static { this.id = 'editor.action.triggerSuggest'; }
        constructor() {
            super({
                id: TriggerSuggestAction.id,
                label: nls.localize('suggest.trigger.label', "Trigger Suggest"),
                alias: 'Trigger Suggest',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasCompletionItemProvider, suggest_1.Context.Visible.toNegated()),
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
            const controller = SuggestController.get(editor);
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
    exports.TriggerSuggestAction = TriggerSuggestAction;
    (0, editorExtensions_1.registerEditorContribution)(SuggestController.ID, SuggestController, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
    (0, editorExtensions_1.registerEditorAction)(TriggerSuggestAction);
    const weight = 100 /* KeybindingWeight.EditorContrib */ + 90;
    const SuggestCommand = editorExtensions_1.EditorCommand.bindToContribution(SuggestController.get);
    (0, editorExtensions_1.registerEditorCommand)(new SuggestCommand({
        id: 'acceptSelectedSuggestion',
        precondition: contextkey_1.ContextKeyExpr.and(suggest_1.Context.Visible, suggest_1.Context.HasFocusedSuggestion),
        handler(x) {
            x.acceptSelectedSuggestion(true, false);
        },
        kbOpts: [{
                // normal tab
                primary: 2 /* KeyCode.Tab */,
                kbExpr: contextkey_1.ContextKeyExpr.and(suggest_1.Context.Visible, editorContextKeys_1.EditorContextKeys.textInputFocus),
                weight,
            }, {
                // accept on enter has special rules
                primary: 3 /* KeyCode.Enter */,
                kbExpr: contextkey_1.ContextKeyExpr.and(suggest_1.Context.Visible, editorContextKeys_1.EditorContextKeys.textInputFocus, suggest_1.Context.AcceptSuggestionsOnEnter, suggest_1.Context.MakesTextEdit),
                weight,
            }],
        menuOpts: [{
                menuId: suggest_1.suggestWidgetStatusbarMenu,
                title: nls.localize('accept.insert', "Insert"),
                group: 'left',
                order: 1,
                when: suggest_1.Context.HasInsertAndReplaceRange.toNegated()
            }, {
                menuId: suggest_1.suggestWidgetStatusbarMenu,
                title: nls.localize('accept.insert', "Insert"),
                group: 'left',
                order: 1,
                when: contextkey_1.ContextKeyExpr.and(suggest_1.Context.HasInsertAndReplaceRange, suggest_1.Context.InsertMode.isEqualTo('insert'))
            }, {
                menuId: suggest_1.suggestWidgetStatusbarMenu,
                title: nls.localize('accept.replace', "Replace"),
                group: 'left',
                order: 1,
                when: contextkey_1.ContextKeyExpr.and(suggest_1.Context.HasInsertAndReplaceRange, suggest_1.Context.InsertMode.isEqualTo('replace'))
            }]
    }));
    (0, editorExtensions_1.registerEditorCommand)(new SuggestCommand({
        id: 'acceptAlternativeSelectedSuggestion',
        precondition: contextkey_1.ContextKeyExpr.and(suggest_1.Context.Visible, editorContextKeys_1.EditorContextKeys.textInputFocus, suggest_1.Context.HasFocusedSuggestion),
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
                menuId: suggest_1.suggestWidgetStatusbarMenu,
                group: 'left',
                order: 2,
                when: contextkey_1.ContextKeyExpr.and(suggest_1.Context.HasInsertAndReplaceRange, suggest_1.Context.InsertMode.isEqualTo('insert')),
                title: nls.localize('accept.replace', "Replace")
            }, {
                menuId: suggest_1.suggestWidgetStatusbarMenu,
                group: 'left',
                order: 2,
                when: contextkey_1.ContextKeyExpr.and(suggest_1.Context.HasInsertAndReplaceRange, suggest_1.Context.InsertMode.isEqualTo('replace')),
                title: nls.localize('accept.insert', "Insert")
            }]
    }));
    // continue to support the old command
    commands_1.CommandsRegistry.registerCommandAlias('acceptSelectedSuggestionOnEnter', 'acceptSelectedSuggestion');
    (0, editorExtensions_1.registerEditorCommand)(new SuggestCommand({
        id: 'hideSuggestWidget',
        precondition: suggest_1.Context.Visible,
        handler: x => x.cancelSuggestWidget(),
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
            primary: 9 /* KeyCode.Escape */,
            secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */]
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new SuggestCommand({
        id: 'selectNextSuggestion',
        precondition: contextkey_1.ContextKeyExpr.and(suggest_1.Context.Visible, contextkey_1.ContextKeyExpr.or(suggest_1.Context.MultipleSuggestions, suggest_1.Context.HasFocusedSuggestion.negate())),
        handler: c => c.selectNextSuggestion(),
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
            primary: 18 /* KeyCode.DownArrow */,
            secondary: [2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */],
            mac: { primary: 18 /* KeyCode.DownArrow */, secondary: [2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */, 256 /* KeyMod.WinCtrl */ | 44 /* KeyCode.KeyN */] }
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new SuggestCommand({
        id: 'selectNextPageSuggestion',
        precondition: contextkey_1.ContextKeyExpr.and(suggest_1.Context.Visible, contextkey_1.ContextKeyExpr.or(suggest_1.Context.MultipleSuggestions, suggest_1.Context.HasFocusedSuggestion.negate())),
        handler: c => c.selectNextPageSuggestion(),
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
            primary: 12 /* KeyCode.PageDown */,
            secondary: [2048 /* KeyMod.CtrlCmd */ | 12 /* KeyCode.PageDown */]
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new SuggestCommand({
        id: 'selectLastSuggestion',
        precondition: contextkey_1.ContextKeyExpr.and(suggest_1.Context.Visible, contextkey_1.ContextKeyExpr.or(suggest_1.Context.MultipleSuggestions, suggest_1.Context.HasFocusedSuggestion.negate())),
        handler: c => c.selectLastSuggestion()
    }));
    (0, editorExtensions_1.registerEditorCommand)(new SuggestCommand({
        id: 'selectPrevSuggestion',
        precondition: contextkey_1.ContextKeyExpr.and(suggest_1.Context.Visible, contextkey_1.ContextKeyExpr.or(suggest_1.Context.MultipleSuggestions, suggest_1.Context.HasFocusedSuggestion.negate())),
        handler: c => c.selectPrevSuggestion(),
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
            primary: 16 /* KeyCode.UpArrow */,
            secondary: [2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */],
            mac: { primary: 16 /* KeyCode.UpArrow */, secondary: [2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */, 256 /* KeyMod.WinCtrl */ | 46 /* KeyCode.KeyP */] }
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new SuggestCommand({
        id: 'selectPrevPageSuggestion',
        precondition: contextkey_1.ContextKeyExpr.and(suggest_1.Context.Visible, contextkey_1.ContextKeyExpr.or(suggest_1.Context.MultipleSuggestions, suggest_1.Context.HasFocusedSuggestion.negate())),
        handler: c => c.selectPrevPageSuggestion(),
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
            primary: 11 /* KeyCode.PageUp */,
            secondary: [2048 /* KeyMod.CtrlCmd */ | 11 /* KeyCode.PageUp */]
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new SuggestCommand({
        id: 'selectFirstSuggestion',
        precondition: contextkey_1.ContextKeyExpr.and(suggest_1.Context.Visible, contextkey_1.ContextKeyExpr.or(suggest_1.Context.MultipleSuggestions, suggest_1.Context.HasFocusedSuggestion.negate())),
        handler: c => c.selectFirstSuggestion()
    }));
    (0, editorExtensions_1.registerEditorCommand)(new SuggestCommand({
        id: 'focusSuggestion',
        precondition: contextkey_1.ContextKeyExpr.and(suggest_1.Context.Visible, suggest_1.Context.HasFocusedSuggestion.negate()),
        handler: x => x.focusSuggestion(),
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
            primary: 2048 /* KeyMod.CtrlCmd */ | 10 /* KeyCode.Space */,
            secondary: [2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */],
            mac: { primary: 256 /* KeyMod.WinCtrl */ | 10 /* KeyCode.Space */, secondary: [2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */] }
        },
    }));
    (0, editorExtensions_1.registerEditorCommand)(new SuggestCommand({
        id: 'focusAndAcceptSuggestion',
        precondition: contextkey_1.ContextKeyExpr.and(suggest_1.Context.Visible, suggest_1.Context.HasFocusedSuggestion.negate()),
        handler: c => {
            c.focusSuggestion();
            c.acceptSelectedSuggestion(true, false);
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new SuggestCommand({
        id: 'toggleSuggestionDetails',
        precondition: contextkey_1.ContextKeyExpr.and(suggest_1.Context.Visible, suggest_1.Context.HasFocusedSuggestion),
        handler: x => x.toggleSuggestionDetails(),
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
            primary: 2048 /* KeyMod.CtrlCmd */ | 10 /* KeyCode.Space */,
            secondary: [2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */],
            mac: { primary: 256 /* KeyMod.WinCtrl */ | 10 /* KeyCode.Space */, secondary: [2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */] }
        },
        menuOpts: [{
                menuId: suggest_1.suggestWidgetStatusbarMenu,
                group: 'right',
                order: 1,
                when: contextkey_1.ContextKeyExpr.and(suggest_1.Context.DetailsVisible, suggest_1.Context.CanResolve),
                title: nls.localize('detail.more', "show less")
            }, {
                menuId: suggest_1.suggestWidgetStatusbarMenu,
                group: 'right',
                order: 1,
                when: contextkey_1.ContextKeyExpr.and(suggest_1.Context.DetailsVisible.toNegated(), suggest_1.Context.CanResolve),
                title: nls.localize('detail.less', "show more")
            }]
    }));
    (0, editorExtensions_1.registerEditorCommand)(new SuggestCommand({
        id: 'toggleExplainMode',
        precondition: suggest_1.Context.Visible,
        handler: x => x.toggleExplainMode(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */,
            primary: 2048 /* KeyMod.CtrlCmd */ | 90 /* KeyCode.Slash */,
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new SuggestCommand({
        id: 'toggleSuggestionFocus',
        precondition: suggest_1.Context.Visible,
        handler: x => x.toggleSuggestionFocus(),
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
            primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 10 /* KeyCode.Space */,
            mac: { primary: 256 /* KeyMod.WinCtrl */ | 512 /* KeyMod.Alt */ | 10 /* KeyCode.Space */ }
        }
    }));
    //#region tab completions
    (0, editorExtensions_1.registerEditorCommand)(new SuggestCommand({
        id: 'insertBestCompletion',
        precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.textInputFocus, contextkey_1.ContextKeyExpr.equals('config.editor.tabCompletion', 'on'), wordContextKey_1.WordContextKey.AtEnd, suggest_1.Context.Visible.toNegated(), suggestAlternatives_1.SuggestAlternatives.OtherSuggestions.toNegated(), snippetController2_1.SnippetController2.InSnippetMode.toNegated()),
        handler: (x, arg) => {
            x.triggerSuggestAndAcceptBest((0, types_1.isObject)(arg) ? { fallback: 'tab', ...arg } : { fallback: 'tab' });
        },
        kbOpts: {
            weight,
            primary: 2 /* KeyCode.Tab */
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new SuggestCommand({
        id: 'insertNextSuggestion',
        precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.textInputFocus, contextkey_1.ContextKeyExpr.equals('config.editor.tabCompletion', 'on'), suggestAlternatives_1.SuggestAlternatives.OtherSuggestions, suggest_1.Context.Visible.toNegated(), snippetController2_1.SnippetController2.InSnippetMode.toNegated()),
        handler: x => x.acceptNextSuggestion(),
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
            primary: 2 /* KeyCode.Tab */
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new SuggestCommand({
        id: 'insertPrevSuggestion',
        precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.textInputFocus, contextkey_1.ContextKeyExpr.equals('config.editor.tabCompletion', 'on'), suggestAlternatives_1.SuggestAlternatives.OtherSuggestions, suggest_1.Context.Visible.toNegated(), snippetController2_1.SnippetController2.InSnippetMode.toNegated()),
        handler: x => x.acceptPrevSuggestion(),
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
            primary: 1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */
        }
    }));
    (0, editorExtensions_1.registerEditorAction)(class extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.resetSuggestSize',
                label: nls.localize('suggest.reset.label', "Reset Suggest Widget Size"),
                alias: 'Reset Suggest Widget Size',
                precondition: undefined
            });
        }
        run(_accessor, editor) {
            SuggestController.get(editor)?.resetWidgetSize();
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VnZ2VzdENvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9zdWdnZXN0L2Jyb3dzZXIvc3VnZ2VzdENvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTZDaEcsc0VBQXNFO0lBQ3RFLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FFbkI7SUFFRixNQUFNLFVBQVU7UUFJZixZQUE2QixNQUFrQixFQUFtQixTQUFvQjtZQUF6RCxXQUFNLEdBQU4sTUFBTSxDQUFZO1lBQW1CLGNBQVMsR0FBVCxTQUFTLENBQVc7WUFDckYsMERBQTBEO1lBQzFELHNEQUFzRDtZQUN0RCx1REFBdUQ7WUFDdkQsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNoRSxJQUFJLFNBQVMsS0FBSyxTQUFTLENBQUMsTUFBTSxFQUFFO2dCQUNuQyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUM3QyxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDN0MsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLENBQUM7d0JBQzNDLEtBQUssRUFBRSxhQUFLLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUM7d0JBQzFDLE9BQU8sRUFBRSxFQUFFLFdBQVcsRUFBRSxxQkFBcUIsRUFBRSxVQUFVLDREQUFvRCxFQUFFO3FCQUMvRyxDQUFDLENBQUMsQ0FBQzthQUNKO1FBQ0YsQ0FBQztRQUVELE9BQU87WUFDTixJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsTUFB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