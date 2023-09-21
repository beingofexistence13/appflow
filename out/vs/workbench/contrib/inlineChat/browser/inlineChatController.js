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
define(["require", "exports", "vs/base/browser/markdownRenderer", "vs/base/browser/ui/aria/aria", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errorMessage", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/stopwatch", "vs/base/common/types", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/model/textModel", "vs/editor/common/services/editorWorker", "vs/editor/common/services/model", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsController", "vs/nls", "vs/platform/accessibility/common/accessibility", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/workbench/contrib/inlineChat/browser/inlineChatSession", "vs/workbench/contrib/inlineChat/browser/inlineChatStrategies", "vs/workbench/contrib/inlineChat/browser/inlineChatWidget", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/common/chatService", "vs/platform/keybinding/common/keybinding", "vs/base/common/lazy", "vs/platform/progress/common/progress", "vs/base/common/uuid", "vs/editor/common/languages", "vs/base/common/errors"], function (require, exports, markdownRenderer_1, aria, async_1, cancellation_1, errorMessage_1, event_1, lifecycle_1, stopwatch_1, types_1, position_1, range_1, textModel_1, editorWorker_1, model_1, inlineCompletionsController_1, nls_1, accessibility_1, configuration_1, contextkey_1, dialogs_1, instantiation_1, log_1, inlineChatSession_1, inlineChatStrategies_1, inlineChatWidget_1, inlineChat_1, chat_1, chatService_1, keybinding_1, lazy_1, progress_1, uuid_1, languages_1, errors_1) {
    "use strict";
    var InlineChatController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlineChatController = exports.State = void 0;
    var State;
    (function (State) {
        State["CREATE_SESSION"] = "CREATE_SESSION";
        State["INIT_UI"] = "INIT_UI";
        State["WAIT_FOR_INPUT"] = "WAIT_FOR_INPUT";
        State["MAKE_REQUEST"] = "MAKE_REQUEST";
        State["APPLY_RESPONSE"] = "APPLY_RESPONSE";
        State["SHOW_RESPONSE"] = "SHOW_RESPONSE";
        State["PAUSE"] = "PAUSE";
        State["CANCEL"] = "CANCEL";
        State["ACCEPT"] = "DONE";
    })(State || (exports.State = State = {}));
    var Message;
    (function (Message) {
        Message[Message["NONE"] = 0] = "NONE";
        Message[Message["ACCEPT_SESSION"] = 1] = "ACCEPT_SESSION";
        Message[Message["CANCEL_SESSION"] = 2] = "CANCEL_SESSION";
        Message[Message["PAUSE_SESSION"] = 4] = "PAUSE_SESSION";
        Message[Message["CANCEL_REQUEST"] = 8] = "CANCEL_REQUEST";
        Message[Message["CANCEL_INPUT"] = 16] = "CANCEL_INPUT";
        Message[Message["ACCEPT_INPUT"] = 32] = "ACCEPT_INPUT";
        Message[Message["RERUN_INPUT"] = 64] = "RERUN_INPUT";
    })(Message || (Message = {}));
    let InlineChatController = class InlineChatController {
        static { InlineChatController_1 = this; }
        static get(editor) {
            return editor.getContribution(inlineChat_1.INLINE_CHAT_ID);
        }
        static { this._decoBlock = textModel_1.ModelDecorationOptions.register({
            description: 'inline-chat',
            showIfCollapsed: false,
            isWholeLine: true,
            className: 'inline-chat-block-selection',
        }); }
        static { this._promptHistory = []; }
        constructor(_editor, _instaService, _inlineChatSessionService, _editorWorkerService, _logService, _configurationService, _modelService, _dialogService, contextKeyService, _accessibilityService, _keybindingService, _chatAccessibilityService) {
            this._editor = _editor;
            this._instaService = _instaService;
            this._inlineChatSessionService = _inlineChatSessionService;
            this._editorWorkerService = _editorWorkerService;
            this._logService = _logService;
            this._configurationService = _configurationService;
            this._modelService = _modelService;
            this._dialogService = _dialogService;
            this._accessibilityService = _accessibilityService;
            this._keybindingService = _keybindingService;
            this._chatAccessibilityService = _chatAccessibilityService;
            this._historyOffset = -1;
            this._store = new lifecycle_1.DisposableStore();
            this._messages = this._store.add(new event_1.Emitter());
            this.onDidAcceptInput = event_1.Event.filter(this._messages.event, m => m === 32 /* Message.ACCEPT_INPUT */, this._store);
            this.onDidCancelInput = event_1.Event.filter(this._messages.event, m => m === 16 /* Message.CANCEL_INPUT */ || m === 2 /* Message.CANCEL_SESSION */, this._store);
            this._sessionStore = this._store.add(new lifecycle_1.DisposableStore());
            this._stashedSession = this._store.add(new lifecycle_1.MutableDisposable());
            this._ignoreModelContentChanged = false;
            this._ctxHasActiveRequest = inlineChat_1.CTX_INLINE_CHAT_HAS_ACTIVE_REQUEST.bindTo(contextKeyService);
            this._ctxDidEdit = inlineChat_1.CTX_INLINE_CHAT_DID_EDIT.bindTo(contextKeyService);
            this._ctxUserDidEdit = inlineChat_1.CTX_INLINE_CHAT_USER_DID_EDIT.bindTo(contextKeyService);
            this._ctxResponseTypes = inlineChat_1.CTX_INLINE_CHAT_RESPONSE_TYPES.bindTo(contextKeyService);
            this._ctxLastResponseType = inlineChat_1.CTX_INLINE_CHAT_LAST_RESPONSE_TYPE.bindTo(contextKeyService);
            this._ctxLastFeedbackKind = inlineChat_1.CTX_INLINE_CHAT_LAST_FEEDBACK.bindTo(contextKeyService);
            this._zone = new lazy_1.Lazy(() => this._store.add(_instaService.createInstance(inlineChatWidget_1.InlineChatZoneWidget, this._editor)));
            this._store.add(this._editor.onDidChangeModel(async (e) => {
                if (this._activeSession || !e.newModelUrl) {
                    return;
                }
                const existingSession = this._inlineChatSessionService.getSession(this._editor, e.newModelUrl);
                if (!existingSession) {
                    return;
                }
                this._log('session RESUMING', e);
                await this.run({ existingSession });
                this._log('session done or paused');
            }));
            this._log('NEW controller');
        }
        dispose() {
            this._strategy?.dispose();
            this._stashedSession.clear();
            if (this._activeSession) {
                this._inlineChatSessionService.releaseSession(this._activeSession);
            }
            this._store.dispose();
            this._log('controller disposed');
        }
        _log(message, ...more) {
            if (message instanceof Error) {
                this._logService.error(message, ...more);
            }
            else {
                this._logService.trace(`[IE] (editor:${this._editor.getId()})${message}`, ...more);
            }
        }
        getMessage() {
            return this._zone.value.widget.responseContent;
        }
        getId() {
            return inlineChat_1.INLINE_CHAT_ID;
        }
        _getMode() {
            const editMode = this._configurationService.inspect('inlineChat.mode');
            let editModeValue = editMode.value;
            if (this._accessibilityService.isScreenReaderOptimized() && editModeValue === editMode.defaultValue) {
                // By default, use preview mode for screen reader users
                editModeValue = "preview" /* EditMode.Preview */;
            }
            return editModeValue;
        }
        getWidgetPosition() {
            return this._zone.value.position;
        }
        async run(options = {}) {
            try {
                this.finishExistingSession();
                if (this._currentRun) {
                    await this._currentRun;
                }
                this._stashedSession.clear();
                if (options.initialSelection) {
                    this._editor.setSelection(options.initialSelection);
                }
                this._currentRun = this._nextState("CREATE_SESSION" /* State.CREATE_SESSION */, options);
                await this._currentRun;
            }
            catch (error) {
                // this should not happen but when it does make sure to tear down the UI and everything
                (0, errors_1.onUnexpectedError)(error);
                if (this._activeSession) {
                    this._inlineChatSessionService.releaseSession(this._activeSession);
                }
                this["PAUSE" /* State.PAUSE */]();
            }
            finally {
                this._currentRun = undefined;
            }
        }
        // ---- state machine
        _showWidget(initialRender = false, position) {
            (0, types_1.assertType)(this._editor.hasModel());
            let widgetPosition;
            if (initialRender) {
                widgetPosition = position ? position_1.Position.lift(position) : this._editor.getSelection().getEndPosition();
                this._zone.value.setContainerMargins();
                this._zone.value.setWidgetMargins(widgetPosition);
            }
            else {
                (0, types_1.assertType)(this._activeSession);
                (0, types_1.assertType)(this._strategy);
                widgetPosition = this._strategy.getWidgetPosition() ?? this._zone.value.position ?? this._activeSession.wholeRange.value.getEndPosition();
                const needsMargin = this._strategy.needsMargin();
                if (!needsMargin) {
                    this._zone.value.setWidgetMargins(widgetPosition, 0);
                }
                this._zone.value.updateBackgroundColor(widgetPosition, this._activeSession.wholeRange.value);
            }
            this._zone.value.show(widgetPosition);
        }
        async _nextState(state, options) {
            let nextState = state;
            while (nextState) {
                this._log('setState to ', nextState);
                nextState = await this[nextState](options);
            }
        }
        async ["CREATE_SESSION" /* State.CREATE_SESSION */](options) {
            (0, types_1.assertType)(this._activeSession === undefined);
            (0, types_1.assertType)(this._editor.hasModel());
            let session = options.existingSession;
            this._showWidget(true, options.position);
            this._zone.value.widget.updateInfo((0, nls_1.localize)('welcome.1', "AI-generated code may be incorrect"));
            this._zone.value.widget.placeholder = this._getPlaceholderText();
            if (!session) {
                const createSessionCts = new cancellation_1.CancellationTokenSource();
                const msgListener = event_1.Event.once(this._messages.event)(m => {
                    this._log('state=_createSession) message received', m);
                    if (m === 32 /* Message.ACCEPT_INPUT */) {
                        // user accepted the input before having a session
                        options.autoSend = true;
                        this._zone.value.widget.updateProgress(true);
                        this._zone.value.widget.updateInfo((0, nls_1.localize)('welcome.2', "Getting ready..."));
                    }
                    else {
                        createSessionCts.cancel();
                    }
                });
                session = await this._inlineChatSessionService.createSession(this._editor, { editMode: this._getMode(), wholeRange: options.initialRange }, createSessionCts.token);
                createSessionCts.dispose();
                msgListener.dispose();
                if (createSessionCts.token.isCancellationRequested) {
                    return "PAUSE" /* State.PAUSE */;
                }
            }
            delete options.initialRange;
            delete options.existingSession;
            if (!session) {
                this._dialogService.info((0, nls_1.localize)('create.fail', "Failed to start editor chat"), (0, nls_1.localize)('create.fail.detail', "Please consult the error log and try again later."));
                return "CANCEL" /* State.CANCEL */;
            }
            switch (session.editMode) {
                case "live" /* EditMode.Live */:
                    this._strategy = this._instaService.createInstance(inlineChatStrategies_1.LiveStrategy, session, this._editor, this._zone.value.widget);
                    break;
                case "preview" /* EditMode.Preview */:
                    this._strategy = this._instaService.createInstance(inlineChatStrategies_1.PreviewStrategy, session, this._zone.value.widget);
                    break;
                case "livePreview" /* EditMode.LivePreview */:
                default:
                    this._strategy = this._instaService.createInstance(inlineChatStrategies_1.LivePreviewStrategy, session, this._editor, this._zone.value.widget);
                    break;
            }
            this._activeSession = session;
            return "INIT_UI" /* State.INIT_UI */;
        }
        async ["INIT_UI" /* State.INIT_UI */](options) {
            (0, types_1.assertType)(this._activeSession);
            // hide/cancel inline completions when invoking IE
            inlineCompletionsController_1.InlineCompletionsController.get(this._editor)?.hide();
            this._sessionStore.clear();
            const wholeRangeDecoration = this._editor.createDecorationsCollection();
            const updateWholeRangeDecoration = () => {
                wholeRangeDecoration.set([{
                        range: this._activeSession.wholeRange.value,
                        options: InlineChatController_1._decoBlock
                    }]);
            };
            this._sessionStore.add((0, lifecycle_1.toDisposable)(() => wholeRangeDecoration.clear()));
            this._sessionStore.add(this._activeSession.wholeRange.onDidChange(updateWholeRangeDecoration));
            updateWholeRangeDecoration();
            this._zone.value.widget.updateSlashCommands(this._activeSession.session.slashCommands ?? []);
            this._zone.value.widget.placeholder = this._getPlaceholderText();
            this._zone.value.widget.updateInfo(this._activeSession.session.message ?? (0, nls_1.localize)('welcome.1', "AI-generated code may be incorrect"));
            this._zone.value.widget.preferredExpansionState = this._activeSession.lastExpansionState;
            this._zone.value.widget.value = this._activeSession.lastInput?.value ?? this._zone.value.widget.value;
            this._sessionStore.add(this._zone.value.widget.onDidChangeInput(_ => {
                const start = this._zone.value.position;
                if (!start || !this._zone.value.widget.hasFocus() || !this._zone.value.widget.value || !this._editor.hasModel()) {
                    return;
                }
                const nextLine = start.lineNumber + 1;
                if (nextLine >= this._editor.getModel().getLineCount()) {
                    // last line isn't supported
                    return;
                }
                this._editor.revealLine(nextLine, 0 /* ScrollType.Smooth */);
            }));
            this._showWidget(true, options.position);
            this._sessionStore.add(this._editor.onDidChangeModel((e) => {
                const msg = this._activeSession?.lastExchange
                    ? 4 /* Message.PAUSE_SESSION */
                    : 2 /* Message.CANCEL_SESSION */;
                this._log('model changed, pause or cancel session', msg, e);
                this._messages.fire(msg);
            }));
            this._sessionStore.add(this._editor.onDidChangeModelContent(e => {
                if (!this._ignoreModelContentChanged && this._strategy?.hasFocus()) {
                    this._ctxUserDidEdit.set(true);
                }
                if (this._ignoreModelContentChanged || this._strategy?.hasFocus()) {
                    return;
                }
                const wholeRange = this._activeSession.wholeRange;
                let editIsOutsideOfWholeRange = false;
                for (const { range } of e.changes) {
                    editIsOutsideOfWholeRange = !range_1.Range.areIntersectingOrTouching(range, wholeRange.value);
                }
                this._activeSession.recordExternalEditOccurred(editIsOutsideOfWholeRange);
                if (editIsOutsideOfWholeRange) {
                    this._log('text changed outside of whole range, FINISH session');
                    this.finishExistingSession();
                }
            }));
            if (!this._activeSession.lastExchange) {
                return "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */;
            }
            else if (options.isUnstashed) {
                delete options.isUnstashed;
                return "APPLY_RESPONSE" /* State.APPLY_RESPONSE */;
            }
            else {
                return "SHOW_RESPONSE" /* State.SHOW_RESPONSE */;
            }
        }
        _getPlaceholderText() {
            let result = this._activeSession?.session.placeholder ?? (0, nls_1.localize)('default.placeholder', "Ask a question");
            if (InlineChatController_1._promptHistory.length > 0) {
                const kb1 = this._keybindingService.lookupKeybinding('inlineChat.previousFromHistory')?.getLabel();
                const kb2 = this._keybindingService.lookupKeybinding('inlineChat.nextFromHistory')?.getLabel();
                if (kb1 && kb2) {
                    result = (0, nls_1.localize)('default.placeholder.history', "{0} ({1}, {2} for history)", result, kb1, kb2);
                }
            }
            return result;
        }
        async ["WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */](options) {
            (0, types_1.assertType)(this._activeSession);
            (0, types_1.assertType)(this._strategy);
            this._zone.value.widget.placeholder = this._getPlaceholderText();
            if (options.message) {
                this.updateInput(options.message);
                aria.alert(options.message);
                delete options.message;
            }
            let message = 0 /* Message.NONE */;
            if (options.autoSend) {
                message = 32 /* Message.ACCEPT_INPUT */;
                delete options.autoSend;
            }
            else {
                const barrier = new async_1.Barrier();
                const msgListener = event_1.Event.once(this._messages.event)(m => {
                    this._log('state=_waitForInput) message received', m);
                    message = m;
                    barrier.open();
                });
                await barrier.wait();
                msgListener.dispose();
            }
            this._zone.value.widget.selectAll(false);
            if (message & (16 /* Message.CANCEL_INPUT */ | 2 /* Message.CANCEL_SESSION */)) {
                return "CANCEL" /* State.CANCEL */;
            }
            if (message & 1 /* Message.ACCEPT_SESSION */) {
                return "DONE" /* State.ACCEPT */;
            }
            if (message & 4 /* Message.PAUSE_SESSION */) {
                return "PAUSE" /* State.PAUSE */;
            }
            if (message & 64 /* Message.RERUN_INPUT */ && this._activeSession.lastExchange) {
                const { lastExchange } = this._activeSession;
                this._activeSession.addInput(lastExchange.prompt.retry());
                if (lastExchange.response instanceof inlineChatSession_1.EditResponse) {
                    await this._strategy.undoChanges(lastExchange.response);
                }
                return "MAKE_REQUEST" /* State.MAKE_REQUEST */;
            }
            if (!this._zone.value.widget.value) {
                return "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */;
            }
            const input = this._zone.value.widget.value;
            if (!InlineChatController_1._promptHistory.includes(input)) {
                InlineChatController_1._promptHistory.unshift(input);
            }
            const refer = this._activeSession.session.slashCommands?.some(value => value.refer && input.startsWith(`/${value.command}`));
            if (refer) {
                this._log('[IE] seeing refer command, continuing outside editor', this._activeSession.provider.debugName);
                this._editor.setSelection(this._activeSession.wholeRange.value);
                this._instaService.invokeFunction(sendRequest, input);
                if (!this._activeSession.lastExchange) {
                    // DONE when there wasn't any exchange yet. We used the inline chat only as trampoline
                    return "DONE" /* State.ACCEPT */;
                }
                return "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */;
            }
            this._activeSession.addInput(new inlineChatSession_1.SessionPrompt(input));
            return "MAKE_REQUEST" /* State.MAKE_REQUEST */;
        }
        async ["MAKE_REQUEST" /* State.MAKE_REQUEST */]() {
            (0, types_1.assertType)(this._editor.hasModel());
            (0, types_1.assertType)(this._activeSession);
            (0, types_1.assertType)(this._activeSession.lastInput);
            const requestCts = new cancellation_1.CancellationTokenSource();
            let message = 0 /* Message.NONE */;
            const msgListener = event_1.Event.once(this._messages.event)(m => {
                this._log('state=_makeRequest) message received', m);
                message = m;
                requestCts.cancel();
            });
            const typeListener = this._zone.value.widget.onDidChangeInput(() => {
                requestCts.cancel();
            });
            const sw = stopwatch_1.StopWatch.create();
            const request = {
                requestId: (0, uuid_1.generateUuid)(),
                prompt: this._activeSession.lastInput.value,
                attempt: this._activeSession.lastInput.attempt,
                selection: this._editor.getSelection(),
                wholeRange: this._activeSession.wholeRange.value,
                live: this._activeSession.editMode !== "preview" /* EditMode.Preview */ // TODO@jrieken let extension know what document is used for previewing
            };
            this._chatAccessibilityService.acceptRequest();
            const progressEdits = [];
            const progress = new progress_1.Progress(async (data) => {
                this._log('received chunk', data, request);
                if (!request.live) {
                    throw new Error('Progress in NOT supported in non-live mode');
                }
                if (data.message) {
                    this._zone.value.widget.updateToolbar(false);
                    this._zone.value.widget.updateInfo(data.message);
                }
                if (data.edits) {
                    progressEdits.push(data.edits);
                    await this._makeChanges(progressEdits);
                }
            }, { async: true });
            const task = this._activeSession.provider.provideResponse(this._activeSession.session, request, progress, requestCts.token);
            this._log('request started', this._activeSession.provider.debugName, this._activeSession.session, request);
            let response;
            let reply;
            try {
                this._zone.value.widget.updateProgress(true);
                this._zone.value.widget.updateInfo(!this._activeSession.lastExchange ? (0, nls_1.localize)('thinking', "Thinking\u2026") : '');
                this._ctxHasActiveRequest.set(true);
                reply = await (0, async_1.raceCancellationError)(Promise.resolve(task), requestCts.token);
                if (reply?.type === "message" /* InlineChatResponseType.Message */) {
                    response = new inlineChatSession_1.MarkdownResponse(this._activeSession.textModelN.uri, reply);
                }
                else if (reply) {
                    const editResponse = new inlineChatSession_1.EditResponse(this._activeSession.textModelN.uri, this._activeSession.textModelN.getAlternativeVersionId(), reply, progressEdits);
                    if (editResponse.allLocalEdits.length > progressEdits.length) {
                        await this._makeChanges(editResponse.allLocalEdits);
                    }
                    response = editResponse;
                }
                else {
                    response = new inlineChatSession_1.EmptyResponse();
                }
            }
            catch (e) {
                response = new inlineChatSession_1.ErrorResponse(e);
            }
            finally {
                this._ctxHasActiveRequest.set(false);
                this._zone.value.widget.updateProgress(false);
                this._zone.value.widget.updateInfo('');
                this._zone.value.widget.updateToolbar(true);
                this._log('request took', sw.elapsed(), this._activeSession.provider.debugName);
            }
            requestCts.dispose();
            msgListener.dispose();
            typeListener.dispose();
            this._activeSession.addExchange(new inlineChatSession_1.SessionExchange(this._activeSession.lastInput, response));
            if (message & 2 /* Message.CANCEL_SESSION */) {
                return "CANCEL" /* State.CANCEL */;
            }
            else if (message & 4 /* Message.PAUSE_SESSION */) {
                return "PAUSE" /* State.PAUSE */;
            }
            else if (message & 1 /* Message.ACCEPT_SESSION */) {
                return "DONE" /* State.ACCEPT */;
            }
            else {
                return "APPLY_RESPONSE" /* State.APPLY_RESPONSE */;
            }
        }
        async ["APPLY_RESPONSE" /* State.APPLY_RESPONSE */]() {
            (0, types_1.assertType)(this._activeSession);
            (0, types_1.assertType)(this._strategy);
            const { response } = this._activeSession.lastExchange;
            if (response instanceof inlineChatSession_1.EditResponse) {
                // edit response -> complex...
                this._zone.value.widget.updateMarkdownMessage(undefined);
                const canContinue = this._strategy.checkChanges(response);
                if (!canContinue) {
                    return "DONE" /* State.ACCEPT */;
                }
            }
            return "SHOW_RESPONSE" /* State.SHOW_RESPONSE */;
        }
        async _makeChanges(allEdits) {
            (0, types_1.assertType)(this._activeSession);
            (0, types_1.assertType)(this._strategy);
            if (allEdits.length === 0) {
                return;
            }
            // diff-changes from model0 -> modelN+1
            for (const edits of allEdits) {
                const textModelNplus1 = this._modelService.createModel((0, textModel_1.createTextBufferFactoryFromSnapshot)(this._activeSession.textModelN.createSnapshot()), null, undefined, true);
                textModelNplus1.applyEdits(edits.map(languages_1.TextEdit.asEditOperation));
                const diff = await this._editorWorkerService.computeDiff(this._activeSession.textModel0.uri, textModelNplus1.uri, { ignoreTrimWhitespace: false, maxComputationTimeMs: 5000, computeMoves: false }, 'advanced');
                this._activeSession.lastTextModelChanges = diff?.changes ?? [];
                textModelNplus1.dispose();
            }
            // make changes from modelN -> modelN+1
            const lastEdits = allEdits[allEdits.length - 1];
            const moreMinimalEdits = await this._editorWorkerService.computeHumanReadableDiff(this._activeSession.textModelN.uri, lastEdits);
            const editOperations = (moreMinimalEdits ?? lastEdits).map(languages_1.TextEdit.asEditOperation);
            this._log('edits from PROVIDER and after making them MORE MINIMAL', this._activeSession.provider.debugName, lastEdits, moreMinimalEdits);
            try {
                this._ignoreModelContentChanged = true;
                this._activeSession.wholeRange.trackEdits(editOperations);
                await this._strategy.makeChanges(editOperations);
                this._ctxDidEdit.set(this._activeSession.hasChangedText);
            }
            finally {
                this._ignoreModelContentChanged = false;
            }
        }
        async ["SHOW_RESPONSE" /* State.SHOW_RESPONSE */]() {
            (0, types_1.assertType)(this._activeSession);
            (0, types_1.assertType)(this._strategy);
            const { response } = this._activeSession.lastExchange;
            this._showWidget(false);
            let status;
            this._ctxLastResponseType.set(response instanceof inlineChatSession_1.EditResponse || response instanceof inlineChatSession_1.MarkdownResponse
                ? response.raw.type
                : undefined);
            let responseTypes;
            for (const { response } of this._activeSession.exchanges) {
                const thisType = response instanceof inlineChatSession_1.MarkdownResponse
                    ? "onlyMessages" /* InlineChateResponseTypes.OnlyMessages */ : response instanceof inlineChatSession_1.EditResponse
                    ? "onlyEdits" /* InlineChateResponseTypes.OnlyEdits */ : undefined;
                if (responseTypes === undefined) {
                    responseTypes = thisType;
                }
                else if (responseTypes !== thisType) {
                    responseTypes = "mixed" /* InlineChateResponseTypes.Mixed */;
                    break;
                }
            }
            this._ctxResponseTypes.set(responseTypes);
            this._ctxDidEdit.set(this._activeSession.hasChangedText);
            if (response instanceof inlineChatSession_1.EmptyResponse) {
                // show status message
                status = (0, nls_1.localize)('empty', "No results, please refine your input and try again");
                this._zone.value.widget.updateStatus(status, { classes: ['warn'] });
                return "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */;
            }
            else if (response instanceof inlineChatSession_1.ErrorResponse) {
                // show error
                if (!response.isCancellation) {
                    status = response.message;
                    this._zone.value.widget.updateStatus(status, { classes: ['error'] });
                }
            }
            else if (response instanceof inlineChatSession_1.MarkdownResponse) {
                // clear status, show MD message
                const renderedMarkdown = (0, markdownRenderer_1.renderMarkdown)(response.raw.message, { inline: true });
                this._zone.value.widget.updateStatus('');
                this._zone.value.widget.updateMarkdownMessage(renderedMarkdown.element);
                this._zone.value.widget.updateToolbar(true);
                const content = renderedMarkdown.element.textContent;
                if (content) {
                    status = (0, nls_1.localize)('markdownResponseMessage', "{0}", content);
                }
                this._activeSession.lastExpansionState = this._zone.value.widget.expansionState;
            }
            else if (response instanceof inlineChatSession_1.EditResponse) {
                // edit response -> complex...
                this._zone.value.widget.updateMarkdownMessage(undefined);
                this._zone.value.widget.updateToolbar(true);
                const canContinue = this._strategy.checkChanges(response);
                if (!canContinue) {
                    return "DONE" /* State.ACCEPT */;
                }
                status = this._configurationService.getValue('accessibility.verbosity.inlineChat') === true ? (0, nls_1.localize)('editResponseMessage', "Use tab to navigate to the diff editor and review proposed changes.") : '';
                await this._strategy.renderChanges(response);
            }
            this._chatAccessibilityService.acceptResponse(status);
            return "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */;
        }
        async ["PAUSE" /* State.PAUSE */]() {
            this._ctxDidEdit.reset();
            this._ctxUserDidEdit.reset();
            this._ctxLastResponseType.reset();
            this._ctxLastFeedbackKind.reset();
            this._zone.value.hide();
            // Return focus to the editor only if the current focus is within the editor widget
            if (this._editor.hasWidgetFocus()) {
                this._editor.focus();
            }
            this._strategy?.dispose();
            this._strategy = undefined;
            this._activeSession = undefined;
        }
        async ["DONE" /* State.ACCEPT */]() {
            (0, types_1.assertType)(this._activeSession);
            (0, types_1.assertType)(this._strategy);
            this._sessionStore.clear();
            try {
                await this._strategy.apply();
            }
            catch (err) {
                this._dialogService.error((0, nls_1.localize)('err.apply', "Failed to apply changes.", (0, errorMessage_1.toErrorMessage)(err)));
                this._log('FAILED to apply changes');
                this._log(err);
            }
            this._inlineChatSessionService.releaseSession(this._activeSession);
            this["PAUSE" /* State.PAUSE */]();
        }
        async ["CANCEL" /* State.CANCEL */]() {
            (0, types_1.assertType)(this._activeSession);
            (0, types_1.assertType)(this._strategy);
            this._sessionStore.clear();
            const mySession = this._activeSession;
            try {
                await this._strategy.cancel();
            }
            catch (err) {
                this._dialogService.error((0, nls_1.localize)('err.discard', "Failed to discard changes.", (0, errorMessage_1.toErrorMessage)(err)));
                this._log('FAILED to discard changes');
                this._log(err);
            }
            this["PAUSE" /* State.PAUSE */]();
            this._stashedSession.clear();
            if (!mySession.isUnstashed && mySession.lastExchange) {
                // only stash sessions that had edits
                this._stashedSession.value = this._instaService.createInstance(StashedSession, this._editor, mySession);
            }
            else {
                this._inlineChatSessionService.releaseSession(mySession);
            }
        }
        static isEditOrMarkdownResponse(response) {
            return response instanceof inlineChatSession_1.EditResponse || response instanceof inlineChatSession_1.MarkdownResponse;
        }
        // ---- controller API
        acceptInput() {
            this._messages.fire(32 /* Message.ACCEPT_INPUT */);
        }
        updateInput(text) {
            this._zone.value.widget.value = text;
            this._zone.value.widget.selectAll();
        }
        regenerate() {
            this._messages.fire(64 /* Message.RERUN_INPUT */);
        }
        cancelCurrentRequest() {
            this._messages.fire(16 /* Message.CANCEL_INPUT */ | 8 /* Message.CANCEL_REQUEST */);
        }
        arrowOut(up) {
            if (this._zone.value.position && this._editor.hasModel()) {
                const { column } = this._editor.getPosition();
                const { lineNumber } = this._zone.value.position;
                const newLine = up ? lineNumber : lineNumber + 1;
                this._editor.setPosition({ lineNumber: newLine, column });
                this._editor.focus();
            }
        }
        focus() {
            this._zone.value.widget.focus();
        }
        hasFocus() {
            return this._zone.value.widget.hasFocus();
        }
        populateHistory(up) {
            const len = InlineChatController_1._promptHistory.length;
            if (len === 0) {
                return;
            }
            const pos = (len + this._historyOffset + (up ? 1 : -1)) % len;
            const entry = InlineChatController_1._promptHistory[pos];
            this._zone.value.widget.value = entry;
            this._zone.value.widget.selectAll();
            this._historyOffset = pos;
        }
        viewInChat() {
            if (this._activeSession?.lastExchange?.response instanceof inlineChatSession_1.MarkdownResponse) {
                this._instaService.invokeFunction(showMessageResponse, this._activeSession.lastExchange.prompt.value, this._activeSession.lastExchange.response.raw.message.value);
            }
        }
        updateExpansionState(expand) {
            if (this._activeSession) {
                const expansionState = expand ? inlineChatSession_1.ExpansionState.EXPANDED : inlineChatSession_1.ExpansionState.CROPPED;
                this._zone.value.widget.updateMarkdownMessageExpansionState(expansionState);
                this._activeSession.lastExpansionState = expansionState;
            }
        }
        feedbackLast(helpful) {
            if (this._activeSession?.lastExchange && InlineChatController_1.isEditOrMarkdownResponse(this._activeSession.lastExchange.response)) {
                const kind = helpful ? 1 /* InlineChatResponseFeedbackKind.Helpful */ : 0 /* InlineChatResponseFeedbackKind.Unhelpful */;
                this._activeSession.provider.handleInlineChatResponseFeedback?.(this._activeSession.session, this._activeSession.lastExchange.response.raw, kind);
                this._ctxLastFeedbackKind.set(helpful ? 'helpful' : 'unhelpful');
                this._zone.value.widget.updateStatus('Thank you for your feedback!', { resetAfter: 1250 });
            }
        }
        createSnapshot() {
            if (this._activeSession && !this._activeSession.textModel0.equalsTextBuffer(this._activeSession.textModelN.getTextBuffer())) {
                this._activeSession.createSnapshot();
            }
        }
        acceptSession() {
            if (this._activeSession?.lastExchange && InlineChatController_1.isEditOrMarkdownResponse(this._activeSession.lastExchange.response)) {
                this._activeSession.provider.handleInlineChatResponseFeedback?.(this._activeSession.session, this._activeSession.lastExchange.response.raw, 3 /* InlineChatResponseFeedbackKind.Accepted */);
            }
            this._messages.fire(1 /* Message.ACCEPT_SESSION */);
        }
        cancelSession() {
            const result = this._activeSession?.asChangedText();
            if (this._activeSession?.lastExchange && InlineChatController_1.isEditOrMarkdownResponse(this._activeSession.lastExchange.response)) {
                this._activeSession.provider.handleInlineChatResponseFeedback?.(this._activeSession.session, this._activeSession.lastExchange.response.raw, 2 /* InlineChatResponseFeedbackKind.Undone */);
            }
            this._messages.fire(2 /* Message.CANCEL_SESSION */);
            return result;
        }
        finishExistingSession() {
            if (this._activeSession) {
                if (this._activeSession.editMode === "preview" /* EditMode.Preview */) {
                    this._log('finishing existing session, using CANCEL', this._activeSession.editMode);
                    this.cancelSession();
                }
                else {
                    this._log('finishing existing session, using APPLY', this._activeSession.editMode);
                    this.acceptSession();
                }
            }
        }
        unstashLastSession() {
            return this._stashedSession.value?.unstash();
        }
    };
    exports.InlineChatController = InlineChatController;
    exports.InlineChatController = InlineChatController = InlineChatController_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, inlineChatSession_1.IInlineChatSessionService),
        __param(3, editorWorker_1.IEditorWorkerService),
        __param(4, log_1.ILogService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, model_1.IModelService),
        __param(7, dialogs_1.IDialogService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, accessibility_1.IAccessibilityService),
        __param(10, keybinding_1.IKeybindingService),
        __param(11, chat_1.IChatAccessibilityService)
    ], InlineChatController);
    let StashedSession = class StashedSession {
        constructor(editor, session, contextKeyService, _sessionService, _logService) {
            this._sessionService = _sessionService;
            this._logService = _logService;
            this._ctxHasStashedSession = inlineChat_1.CTX_INLINE_CHAT_HAS_STASHED_SESSION.bindTo(contextKeyService);
            // keep session for a little bit, only release when user continues to work (type, move cursor, etc.)
            this._session = session;
            this._ctxHasStashedSession.set(true);
            this._listener = event_1.Event.once(event_1.Event.any(editor.onDidChangeCursorSelection, editor.onDidChangeModelContent, editor.onDidChangeModel))(() => {
                this._session = undefined;
                this._sessionService.releaseSession(session);
                this._ctxHasStashedSession.reset();
            });
        }
        dispose() {
            this._listener.dispose();
            this._ctxHasStashedSession.reset();
            if (this._session) {
                this._sessionService.releaseSession(this._session);
            }
        }
        unstash() {
            if (!this._session) {
                return undefined;
            }
            this._listener.dispose();
            const result = this._session;
            result.markUnstashed();
            this._session = undefined;
            this._logService.debug('[IE] Unstashed session');
            return result;
        }
    };
    StashedSession = __decorate([
        __param(2, contextkey_1.IContextKeyService),
        __param(3, inlineChatSession_1.IInlineChatSessionService),
        __param(4, log_1.ILogService)
    ], StashedSession);
    async function showMessageResponse(accessor, query, response) {
        const chatService = accessor.get(chatService_1.IChatService);
        const providerId = chatService.getProviderInfos()[0]?.id;
        const chatWidgetService = accessor.get(chat_1.IChatWidgetService);
        const widget = await chatWidgetService.revealViewForProvider(providerId);
        if (widget && widget.viewModel) {
            chatService.addCompleteRequest(widget.viewModel.sessionId, query, { message: response });
            widget.focusLastMessage();
        }
    }
    async function sendRequest(accessor, query) {
        const chatService = accessor.get(chatService_1.IChatService);
        const widgetService = accessor.get(chat_1.IChatWidgetService);
        const providerId = chatService.getProviderInfos()[0]?.id;
        const widget = await widgetService.revealViewForProvider(providerId);
        if (!widget) {
            return;
        }
        widget.acceptInput(query);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ2hhdENvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9pbmxpbmVDaGF0L2Jyb3dzZXIvaW5saW5lQ2hhdENvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQXdDaEcsSUFBa0IsS0FVakI7SUFWRCxXQUFrQixLQUFLO1FBQ3RCLDBDQUFpQyxDQUFBO1FBQ2pDLDRCQUFtQixDQUFBO1FBQ25CLDBDQUFpQyxDQUFBO1FBQ2pDLHNDQUE2QixDQUFBO1FBQzdCLDBDQUFpQyxDQUFBO1FBQ2pDLHdDQUErQixDQUFBO1FBQy9CLHdCQUFlLENBQUE7UUFDZiwwQkFBaUIsQ0FBQTtRQUNqQix3QkFBZSxDQUFBO0lBQ2hCLENBQUMsRUFWaUIsS0FBSyxxQkFBTCxLQUFLLFFBVXRCO0lBRUQsSUFBVyxPQVNWO0lBVEQsV0FBVyxPQUFPO1FBQ2pCLHFDQUFRLENBQUE7UUFDUix5REFBdUIsQ0FBQTtRQUN2Qix5REFBdUIsQ0FBQTtRQUN2Qix1REFBc0IsQ0FBQTtRQUN0Qix5REFBdUIsQ0FBQTtRQUN2QixzREFBcUIsQ0FBQTtRQUNyQixzREFBcUIsQ0FBQTtRQUNyQixvREFBb0IsQ0FBQTtJQUNyQixDQUFDLEVBVFUsT0FBTyxLQUFQLE9BQU8sUUFTakI7SUFZTSxJQUFNLG9CQUFvQixHQUExQixNQUFNLG9CQUFvQjs7UUFFaEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFtQjtZQUM3QixPQUFPLE1BQU0sQ0FBQyxlQUFlLENBQXVCLDJCQUFjLENBQUMsQ0FBQztRQUNyRSxDQUFDO2lCQUVjLGVBQVUsR0FBRyxrQ0FBc0IsQ0FBQyxRQUFRLENBQUM7WUFDM0QsV0FBVyxFQUFFLGFBQWE7WUFDMUIsZUFBZSxFQUFFLEtBQUs7WUFDdEIsV0FBVyxFQUFFLElBQUk7WUFDakIsU0FB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