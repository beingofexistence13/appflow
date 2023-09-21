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
define(["require", "exports", "vs/base/browser/markdownRenderer", "vs/base/browser/ui/aria/aria", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errorMessage", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/stopwatch", "vs/base/common/types", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/model/textModel", "vs/editor/common/services/editorWorker", "vs/editor/common/services/model", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsController", "vs/nls!vs/workbench/contrib/inlineChat/browser/inlineChatController", "vs/platform/accessibility/common/accessibility", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/workbench/contrib/inlineChat/browser/inlineChatSession", "vs/workbench/contrib/inlineChat/browser/inlineChatStrategies", "vs/workbench/contrib/inlineChat/browser/inlineChatWidget", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/common/chatService", "vs/platform/keybinding/common/keybinding", "vs/base/common/lazy", "vs/platform/progress/common/progress", "vs/base/common/uuid", "vs/editor/common/languages", "vs/base/common/errors"], function (require, exports, markdownRenderer_1, aria, async_1, cancellation_1, errorMessage_1, event_1, lifecycle_1, stopwatch_1, types_1, position_1, range_1, textModel_1, editorWorker_1, model_1, inlineCompletionsController_1, nls_1, accessibility_1, configuration_1, contextkey_1, dialogs_1, instantiation_1, log_1, inlineChatSession_1, inlineChatStrategies_1, inlineChatWidget_1, inlineChat_1, chat_1, chatService_1, keybinding_1, lazy_1, progress_1, uuid_1, languages_1, errors_1) {
    "use strict";
    var $Qqb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Qqb = exports.State = void 0;
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
    let $Qqb = class $Qqb {
        static { $Qqb_1 = this; }
        static get(editor) {
            return editor.getContribution(inlineChat_1.$ez);
        }
        static { this.a = textModel_1.$RC.register({
            description: 'inline-chat',
            showIfCollapsed: false,
            isWholeLine: true,
            className: 'inline-chat-block-selection',
        }); }
        static { this.b = []; }
        constructor(w, x, y, z, A, B, C, D, contextKeyService, E, F, G) {
            this.w = w;
            this.x = x;
            this.y = y;
            this.z = z;
            this.A = A;
            this.B = B;
            this.C = C;
            this.D = D;
            this.E = E;
            this.F = F;
            this.G = G;
            this.c = -1;
            this.f = new lifecycle_1.$jc();
            this.o = this.f.add(new event_1.$fd());
            this.onDidAcceptInput = event_1.Event.filter(this.o.event, m => m === 32 /* Message.ACCEPT_INPUT */, this.f);
            this.onDidCancelInput = event_1.Event.filter(this.o.event, m => m === 16 /* Message.CANCEL_INPUT */ || m === 2 /* Message.CANCEL_SESSION */, this.f);
            this.q = this.f.add(new lifecycle_1.$jc());
            this.s = this.f.add(new lifecycle_1.$lc());
            this.v = false;
            this.h = inlineChat_1.$rz.bindTo(contextKeyService);
            this.k = inlineChat_1.$vz.bindTo(contextKeyService);
            this.l = inlineChat_1.$wz.bindTo(contextKeyService);
            this.j = inlineChat_1.$uz.bindTo(contextKeyService);
            this.i = inlineChat_1.$tz.bindTo(contextKeyService);
            this.n = inlineChat_1.$xz.bindTo(contextKeyService);
            this.g = new lazy_1.$T(() => this.f.add(x.createInstance(inlineChatWidget_1.$Aqb, this.w)));
            this.f.add(this.w.onDidChangeModel(async (e) => {
                if (this.t || !e.newModelUrl) {
                    return;
                }
                const existingSession = this.y.getSession(this.w, e.newModelUrl);
                if (!existingSession) {
                    return;
                }
                this.H('session RESUMING', e);
                await this.run({ existingSession });
                this.H('session done or paused');
            }));
            this.H('NEW controller');
        }
        dispose() {
            this.u?.dispose();
            this.s.clear();
            if (this.t) {
                this.y.releaseSession(this.t);
            }
            this.f.dispose();
            this.H('controller disposed');
        }
        H(message, ...more) {
            if (message instanceof Error) {
                this.A.error(message, ...more);
            }
            else {
                this.A.trace(`[IE] (editor:${this.w.getId()})${message}`, ...more);
            }
        }
        getMessage() {
            return this.g.value.widget.responseContent;
        }
        getId() {
            return inlineChat_1.$ez;
        }
        I() {
            const editMode = this.B.inspect('inlineChat.mode');
            let editModeValue = editMode.value;
            if (this.E.isScreenReaderOptimized() && editModeValue === editMode.defaultValue) {
                // By default, use preview mode for screen reader users
                editModeValue = "preview" /* EditMode.Preview */;
            }
            return editModeValue;
        }
        getWidgetPosition() {
            return this.g.value.position;
        }
        async run(options = {}) {
            try {
                this.finishExistingSession();
                if (this.J) {
                    await this.J;
                }
                this.s.clear();
                if (options.initialSelection) {
                    this.w.setSelection(options.initialSelection);
                }
                this.J = this.L("CREATE_SESSION" /* State.CREATE_SESSION */, options);
                await this.J;
            }
            catch (error) {
                // this should not happen but when it does make sure to tear down the UI and everything
                (0, errors_1.$Y)(error);
                if (this.t) {
                    this.y.releaseSession(this.t);
                }
                this["PAUSE" /* State.PAUSE */]();
            }
            finally {
                this.J = undefined;
            }
        }
        // ---- state machine
        K(initialRender = false, position) {
            (0, types_1.$tf)(this.w.hasModel());
            let widgetPosition;
            if (initialRender) {
                widgetPosition = position ? position_1.$js.lift(position) : this.w.getSelection().getEndPosition();
                this.g.value.setContainerMargins();
                this.g.value.setWidgetMargins(widgetPosition);
            }
            else {
                (0, types_1.$tf)(this.t);
                (0, types_1.$tf)(this.u);
                widgetPosition = this.u.getWidgetPosition() ?? this.g.value.position ?? this.t.wholeRange.value.getEndPosition();
                const needsMargin = this.u.needsMargin();
                if (!needsMargin) {
                    this.g.value.setWidgetMargins(widgetPosition, 0);
                }
                this.g.value.updateBackgroundColor(widgetPosition, this.t.wholeRange.value);
            }
            this.g.value.show(widgetPosition);
        }
        async L(state, options) {
            let nextState = state;
            while (nextState) {
                this.H('setState to ', nextState);
                nextState = await this[nextState](options);
            }
        }
        async ["CREATE_SESSION" /* State.CREATE_SESSION */](options) {
            (0, types_1.$tf)(this.t === undefined);
            (0, types_1.$tf)(this.w.hasModel());
            let session = options.existingSession;
            this.K(true, options.position);
            this.g.value.widget.updateInfo((0, nls_1.localize)(0, null));
            this.g.value.widget.placeholder = this.M();
            if (!session) {
                const createSessionCts = new cancellation_1.$pd();
                const msgListener = event_1.Event.once(this.o.event)(m => {
                    this.H('state=_createSession) message received', m);
                    if (m === 32 /* Message.ACCEPT_INPUT */) {
                        // user accepted the input before having a session
                        options.autoSend = true;
                        this.g.value.widget.updateProgress(true);
                        this.g.value.widget.updateInfo((0, nls_1.localize)(1, null));
                    }
                    else {
                        createSessionCts.cancel();
                    }
                });
                session = await this.y.createSession(this.w, { editMode: this.I(), wholeRange: options.initialRange }, createSessionCts.token);
                createSessionCts.dispose();
                msgListener.dispose();
                if (createSessionCts.token.isCancellationRequested) {
                    return "PAUSE" /* State.PAUSE */;
                }
            }
            delete options.initialRange;
            delete options.existingSession;
            if (!session) {
                this.D.info((0, nls_1.localize)(2, null), (0, nls_1.localize)(3, null));
                return "CANCEL" /* State.CANCEL */;
            }
            switch (session.editMode) {
                case "live" /* EditMode.Live */:
                    this.u = this.x.createInstance(inlineChatStrategies_1.$Dqb, session, this.w, this.g.value.widget);
                    break;
                case "preview" /* EditMode.Preview */:
                    this.u = this.x.createInstance(inlineChatStrategies_1.$Cqb, session, this.g.value.widget);
                    break;
                case "livePreview" /* EditMode.LivePreview */:
                default:
                    this.u = this.x.createInstance(inlineChatStrategies_1.$Eqb, session, this.w, this.g.value.widget);
                    break;
            }
            this.t = session;
            return "INIT_UI" /* State.INIT_UI */;
        }
        async ["INIT_UI" /* State.INIT_UI */](options) {
            (0, types_1.$tf)(this.t);
            // hide/cancel inline completions when invoking IE
            inlineCompletionsController_1.$V8.get(this.w)?.hide();
            this.q.clear();
            const wholeRangeDecoration = this.w.createDecorationsCollection();
            const updateWholeRangeDecoration = () => {
                wholeRangeDecoration.set([{
                        range: this.t.wholeRange.value,
                        options: $Qqb_1.a
                    }]);
            };
            this.q.add((0, lifecycle_1.$ic)(() => wholeRangeDecoration.clear()));
            this.q.add(this.t.wholeRange.onDidChange(updateWholeRangeDecoration));
            updateWholeRangeDecoration();
            this.g.value.widget.updateSlashCommands(this.t.session.slashCommands ?? []);
            this.g.value.widget.placeholder = this.M();
            this.g.value.widget.updateInfo(this.t.session.message ?? (0, nls_1.localize)(4, null));
            this.g.value.widget.preferredExpansionState = this.t.lastExpansionState;
            this.g.value.widget.value = this.t.lastInput?.value ?? this.g.value.widget.value;
            this.q.add(this.g.value.widget.onDidChangeInput(_ => {
                const start = this.g.value.position;
                if (!start || !this.g.value.widget.hasFocus() || !this.g.value.widget.value || !this.w.hasModel()) {
                    return;
                }
                const nextLine = start.lineNumber + 1;
                if (nextLine >= this.w.getModel().getLineCount()) {
                    // last line isn't supported
                    return;
                }
                this.w.revealLine(nextLine, 0 /* ScrollType.Smooth */);
            }));
            this.K(true, options.position);
            this.q.add(this.w.onDidChangeModel((e) => {
                const msg = this.t?.lastExchange
                    ? 4 /* Message.PAUSE_SESSION */
                    : 2 /* Message.CANCEL_SESSION */;
                this.H('model changed, pause or cancel session', msg, e);
                this.o.fire(msg);
            }));
            this.q.add(this.w.onDidChangeModelContent(e => {
                if (!this.v && this.u?.hasFocus()) {
                    this.l.set(true);
                }
                if (this.v || this.u?.hasFocus()) {
                    return;
                }
                const wholeRange = this.t.wholeRange;
                let editIsOutsideOfWholeRange = false;
                for (const { range } of e.changes) {
                    editIsOutsideOfWholeRange = !range_1.$ks.areIntersectingOrTouching(range, wholeRange.value);
                }
                this.t.recordExternalEditOccurred(editIsOutsideOfWholeRange);
                if (editIsOutsideOfWholeRange) {
                    this.H('text changed outside of whole range, FINISH session');
                    this.finishExistingSession();
                }
            }));
            if (!this.t.lastExchange) {
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
        M() {
            let result = this.t?.session.placeholder ?? (0, nls_1.localize)(5, null);
            if ($Qqb_1.b.length > 0) {
                const kb1 = this.F.lookupKeybinding('inlineChat.previousFromHistory')?.getLabel();
                const kb2 = this.F.lookupKeybinding('inlineChat.nextFromHistory')?.getLabel();
                if (kb1 && kb2) {
                    result = (0, nls_1.localize)(6, null, result, kb1, kb2);
                }
            }
            return result;
        }
        async ["WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */](options) {
            (0, types_1.$tf)(this.t);
            (0, types_1.$tf)(this.u);
            this.g.value.widget.placeholder = this.M();
            if (options.message) {
                this.updateInput(options.message);
                aria.$$P(options.message);
                delete options.message;
            }
            let message = 0 /* Message.NONE */;
            if (options.autoSend) {
                message = 32 /* Message.ACCEPT_INPUT */;
                delete options.autoSend;
            }
            else {
                const barrier = new async_1.$Fg();
                const msgListener = event_1.Event.once(this.o.event)(m => {
                    this.H('state=_waitForInput) message received', m);
                    message = m;
                    barrier.open();
                });
                await barrier.wait();
                msgListener.dispose();
            }
            this.g.value.widget.selectAll(false);
            if (message & (16 /* Message.CANCEL_INPUT */ | 2 /* Message.CANCEL_SESSION */)) {
                return "CANCEL" /* State.CANCEL */;
            }
            if (message & 1 /* Message.ACCEPT_SESSION */) {
                return "DONE" /* State.ACCEPT */;
            }
            if (message & 4 /* Message.PAUSE_SESSION */) {
                return "PAUSE" /* State.PAUSE */;
            }
            if (message & 64 /* Message.RERUN_INPUT */ && this.t.lastExchange) {
                const { lastExchange } = this.t;
                this.t.addInput(lastExchange.prompt.retry());
                if (lastExchange.response instanceof inlineChatSession_1.$aqb) {
                    await this.u.undoChanges(lastExchange.response);
                }
                return "MAKE_REQUEST" /* State.MAKE_REQUEST */;
            }
            if (!this.g.value.widget.value) {
                return "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */;
            }
            const input = this.g.value.widget.value;
            if (!$Qqb_1.b.includes(input)) {
                $Qqb_1.b.unshift(input);
            }
            const refer = this.t.session.slashCommands?.some(value => value.refer && input.startsWith(`/${value.command}`));
            if (refer) {
                this.H('[IE] seeing refer command, continuing outside editor', this.t.provider.debugName);
                this.w.setSelection(this.t.wholeRange.value);
                this.x.invokeFunction(sendRequest, input);
                if (!this.t.lastExchange) {
                    // DONE when there wasn't any exchange yet. We used the inline chat only as trampoline
                    return "DONE" /* State.ACCEPT */;
                }
                return "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */;
            }
            this.t.addInput(new inlineChatSession_1.$8pb(input));
            return "MAKE_REQUEST" /* State.MAKE_REQUEST */;
        }
        async ["MAKE_REQUEST" /* State.MAKE_REQUEST */]() {
            (0, types_1.$tf)(this.w.hasModel());
            (0, types_1.$tf)(this.t);
            (0, types_1.$tf)(this.t.lastInput);
            const requestCts = new cancellation_1.$pd();
            let message = 0 /* Message.NONE */;
            const msgListener = event_1.Event.once(this.o.event)(m => {
                this.H('state=_makeRequest) message received', m);
                message = m;
                requestCts.cancel();
            });
            const typeListener = this.g.value.widget.onDidChangeInput(() => {
                requestCts.cancel();
            });
            const sw = stopwatch_1.$bd.create();
            const request = {
                requestId: (0, uuid_1.$4f)(),
                prompt: this.t.lastInput.value,
                attempt: this.t.lastInput.attempt,
                selection: this.w.getSelection(),
                wholeRange: this.t.wholeRange.value,
                live: this.t.editMode !== "preview" /* EditMode.Preview */ // TODO@jrieken let extension know what document is used for previewing
            };
            this.G.acceptRequest();
            const progressEdits = [];
            const progress = new progress_1.$4u(async (data) => {
                this.H('received chunk', data, request);
                if (!request.live) {
                    throw new Error('Progress in NOT supported in non-live mode');
                }
                if (data.message) {
                    this.g.value.widget.updateToolbar(false);
                    this.g.value.widget.updateInfo(data.message);
                }
                if (data.edits) {
                    progressEdits.push(data.edits);
                    await this.N(progressEdits);
                }
            }, { async: true });
            const task = this.t.provider.provideResponse(this.t.session, request, progress, requestCts.token);
            this.H('request started', this.t.provider.debugName, this.t.session, request);
            let response;
            let reply;
            try {
                this.g.value.widget.updateProgress(true);
                this.g.value.widget.updateInfo(!this.t.lastExchange ? (0, nls_1.localize)(7, null) : '');
                this.h.set(true);
                reply = await (0, async_1.$wg)(Promise.resolve(task), requestCts.token);
                if (reply?.type === "message" /* InlineChatResponseType.Message */) {
                    response = new inlineChatSession_1.$_pb(this.t.textModelN.uri, reply);
                }
                else if (reply) {
                    const editResponse = new inlineChatSession_1.$aqb(this.t.textModelN.uri, this.t.textModelN.getAlternativeVersionId(), reply, progressEdits);
                    if (editResponse.allLocalEdits.length > progressEdits.length) {
                        await this.N(editResponse.allLocalEdits);
                    }
                    response = editResponse;
                }
                else {
                    response = new inlineChatSession_1.$0pb();
                }
            }
            catch (e) {
                response = new inlineChatSession_1.$$pb(e);
            }
            finally {
                this.h.set(false);
                this.g.value.widget.updateProgress(false);
                this.g.value.widget.updateInfo('');
                this.g.value.widget.updateToolbar(true);
                this.H('request took', sw.elapsed(), this.t.provider.debugName);
            }
            requestCts.dispose();
            msgListener.dispose();
            typeListener.dispose();
            this.t.addExchange(new inlineChatSession_1.$9pb(this.t.lastInput, response));
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
            (0, types_1.$tf)(this.t);
            (0, types_1.$tf)(this.u);
            const { response } = this.t.lastExchange;
            if (response instanceof inlineChatSession_1.$aqb) {
                // edit response -> complex...
                this.g.value.widget.updateMarkdownMessage(undefined);
                const canContinue = this.u.checkChanges(response);
                if (!canContinue) {
                    return "DONE" /* State.ACCEPT */;
                }
            }
            return "SHOW_RESPONSE" /* State.SHOW_RESPONSE */;
        }
        async N(allEdits) {
            (0, types_1.$tf)(this.t);
            (0, types_1.$tf)(this.u);
            if (allEdits.length === 0) {
                return;
            }
            // diff-changes from model0 -> modelN+1
            for (const edits of allEdits) {
                const textModelNplus1 = this.C.createModel((0, textModel_1.$KC)(this.t.textModelN.createSnapshot()), null, undefined, true);
                textModelNplus1.applyEdits(edits.map(languages_1.$$s.asEditOperation));
                const diff = await this.z.computeDiff(this.t.textModel0.uri, textModelNplus1.uri, { ignoreTrimWhitespace: false, maxComputationTimeMs: 5000, computeMoves: false }, 'advanced');
                this.t.lastTextModelChanges = diff?.changes ?? [];
                textModelNplus1.dispose();
            }
            // make changes from modelN -> modelN+1
            const lastEdits = allEdits[allEdits.length - 1];
            const moreMinimalEdits = await this.z.computeHumanReadableDiff(this.t.textModelN.uri, lastEdits);
            const editOperations = (moreMinimalEdits ?? lastEdits).map(languages_1.$$s.asEditOperation);
            this.H('edits from PROVIDER and after making them MORE MINIMAL', this.t.provider.debugName, lastEdits, moreMinimalEdits);
            try {
                this.v = true;
                this.t.wholeRange.trackEdits(editOperations);
                await this.u.makeChanges(editOperations);
                this.k.set(this.t.hasChangedText);
            }
            finally {
                this.v = false;
            }
        }
        async ["SHOW_RESPONSE" /* State.SHOW_RESPONSE */]() {
            (0, types_1.$tf)(this.t);
            (0, types_1.$tf)(this.u);
            const { response } = this.t.lastExchange;
            this.K(false);
            let status;
            this.i.set(response instanceof inlineChatSession_1.$aqb || response instanceof inlineChatSession_1.$_pb
                ? response.raw.type
                : undefined);
            let responseTypes;
            for (const { response } of this.t.exchanges) {
                const thisType = response instanceof inlineChatSession_1.$_pb
                    ? "onlyMessages" /* InlineChateResponseTypes.OnlyMessages */ : response instanceof inlineChatSession_1.$aqb
                    ? "onlyEdits" /* InlineChateResponseTypes.OnlyEdits */ : undefined;
                if (responseTypes === undefined) {
                    responseTypes = thisType;
                }
                else if (responseTypes !== thisType) {
                    responseTypes = "mixed" /* InlineChateResponseTypes.Mixed */;
                    break;
                }
            }
            this.j.set(responseTypes);
            this.k.set(this.t.hasChangedText);
            if (response instanceof inlineChatSession_1.$0pb) {
                // show status message
                status = (0, nls_1.localize)(8, null);
                this.g.value.widget.updateStatus(status, { classes: ['warn'] });
                return "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */;
            }
            else if (response instanceof inlineChatSession_1.$$pb) {
                // show error
                if (!response.isCancellation) {
                    status = response.message;
                    this.g.value.widget.updateStatus(status, { classes: ['error'] });
                }
            }
            else if (response instanceof inlineChatSession_1.$_pb) {
                // clear status, show MD message
                const renderedMarkdown = (0, markdownRenderer_1.$zQ)(response.raw.message, { inline: true });
                this.g.value.widget.updateStatus('');
                this.g.value.widget.updateMarkdownMessage(renderedMarkdown.element);
                this.g.value.widget.updateToolbar(true);
                const content = renderedMarkdown.element.textContent;
                if (content) {
                    status = (0, nls_1.localize)(9, null, content);
                }
                this.t.lastExpansionState = this.g.value.widget.expansionState;
            }
            else if (response instanceof inlineChatSession_1.$aqb) {
                // edit response -> complex...
                this.g.value.widget.updateMarkdownMessage(undefined);
                this.g.value.widget.updateToolbar(true);
                const canContinue = this.u.checkChanges(response);
                if (!canContinue) {
                    return "DONE" /* State.ACCEPT */;
                }
                status = this.B.getValue('accessibility.verbosity.inlineChat') === true ? (0, nls_1.localize)(10, null) : '';
                await this.u.renderChanges(response);
            }
            this.G.acceptResponse(status);
            return "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */;
        }
        async ["PAUSE" /* State.PAUSE */]() {
            this.k.reset();
            this.l.reset();
            this.i.reset();
            this.n.reset();
            this.g.value.hide();
            // Return focus to the editor only if the current focus is within the editor widget
            if (this.w.hasWidgetFocus()) {
                this.w.focus();
            }
            this.u?.dispose();
            this.u = undefined;
            this.t = undefined;
        }
        async ["DONE" /* State.ACCEPT */]() {
            (0, types_1.$tf)(this.t);
            (0, types_1.$tf)(this.u);
            this.q.clear();
            try {
                await this.u.apply();
            }
            catch (err) {
                this.D.error((0, nls_1.localize)(11, null, (0, errorMessage_1.$mi)(err)));
                this.H('FAILED to apply changes');
                this.H(err);
            }
            this.y.releaseSession(this.t);
            this["PAUSE" /* State.PAUSE */]();
        }
        async ["CANCEL" /* State.CANCEL */]() {
            (0, types_1.$tf)(this.t);
            (0, types_1.$tf)(this.u);
            this.q.clear();
            const mySession = this.t;
            try {
                await this.u.cancel();
            }
            catch (err) {
                this.D.error((0, nls_1.localize)(12, null, (0, errorMessage_1.$mi)(err)));
                this.H('FAILED to discard changes');
                this.H(err);
            }
            this["PAUSE" /* State.PAUSE */]();
            this.s.clear();
            if (!mySession.isUnstashed && mySession.lastExchange) {
                // only stash sessions that had edits
                this.s.value = this.x.createInstance(StashedSession, this.w, mySession);
            }
            else {
                this.y.releaseSession(mySession);
            }
        }
        static O(response) {
            return response instanceof inlineChatSession_1.$aqb || response instanceof inlineChatSession_1.$_pb;
        }
        // ---- controller API
        acceptInput() {
            this.o.fire(32 /* Message.ACCEPT_INPUT */);
        }
        updateInput(text) {
            this.g.value.widget.value = text;
            this.g.value.widget.selectAll();
        }
        regenerate() {
            this.o.fire(64 /* Message.RERUN_INPUT */);
        }
        cancelCurrentRequest() {
            this.o.fire(16 /* Message.CANCEL_INPUT */ | 8 /* Message.CANCEL_REQUEST */);
        }
        arrowOut(up) {
            if (this.g.value.position && this.w.hasModel()) {
                const { column } = this.w.getPosition();
                const { lineNumber } = this.g.value.position;
                const newLine = up ? lineNumber : lineNumber + 1;
                this.w.setPosition({ lineNumber: newLine, column });
                this.w.focus();
            }
        }
        focus() {
            this.g.value.widget.focus();
        }
        hasFocus() {
            return this.g.value.widget.hasFocus();
        }
        populateHistory(up) {
            const len = $Qqb_1.b.length;
            if (len === 0) {
                return;
            }
            const pos = (len + this.c + (up ? 1 : -1)) % len;
            const entry = $Qqb_1.b[pos];
            this.g.value.widget.value = entry;
            this.g.value.widget.selectAll();
            this.c = pos;
        }
        viewInChat() {
            if (this.t?.lastExchange?.response instanceof inlineChatSession_1.$_pb) {
                this.x.invokeFunction(showMessageResponse, this.t.lastExchange.prompt.value, this.t.lastExchange.response.raw.message.value);
            }
        }
        updateExpansionState(expand) {
            if (this.t) {
                const expansionState = expand ? inlineChatSession_1.ExpansionState.EXPANDED : inlineChatSession_1.ExpansionState.CROPPED;
                this.g.value.widget.updateMarkdownMessageExpansionState(expansionState);
                this.t.lastExpansionState = expansionState;
            }
        }
        feedbackLast(helpful) {
            if (this.t?.lastExchange && $Qqb_1.O(this.t.lastExchange.response)) {
                const kind = helpful ? 1 /* InlineChatResponseFeedbackKind.Helpful */ : 0 /* InlineChatResponseFeedbackKind.Unhelpful */;
                this.t.provider.handleInlineChatResponseFeedback?.(this.t.session, this.t.lastExchange.response.raw, kind);
                this.n.set(helpful ? 'helpful' : 'unhelpful');
                this.g.value.widget.updateStatus('Thank you for your feedback!', { resetAfter: 1250 });
            }
        }
        createSnapshot() {
            if (this.t && !this.t.textModel0.equalsTextBuffer(this.t.textModelN.getTextBuffer())) {
                this.t.createSnapshot();
            }
        }
        acceptSession() {
            if (this.t?.lastExchange && $Qqb_1.O(this.t.lastExchange.response)) {
                this.t.provider.handleInlineChatResponseFeedback?.(this.t.session, this.t.lastExchange.response.raw, 3 /* InlineChatResponseFeedbackKind.Accepted */);
            }
            this.o.fire(1 /* Message.ACCEPT_SESSION */);
        }
        cancelSession() {
            const result = this.t?.asChangedText();
            if (this.t?.lastExchange && $Qqb_1.O(this.t.lastExchange.response)) {
                this.t.provider.handleInlineChatResponseFeedback?.(this.t.session, this.t.lastExchange.response.raw, 2 /* InlineChatResponseFeedbackKind.Undone */);
            }
            this.o.fire(2 /* Message.CANCEL_SESSION */);
            return result;
        }
        finishExistingSession() {
            if (this.t) {
                if (this.t.editMode === "preview" /* EditMode.Preview */) {
                    this.H('finishing existing session, using CANCEL', this.t.editMode);
                    this.cancelSession();
                }
                else {
                    this.H('finishing existing session, using APPLY', this.t.editMode);
                    this.acceptSession();
                }
            }
        }
        unstashLastSession() {
            return this.s.value?.unstash();
        }
    };
    exports.$Qqb = $Qqb;
    exports.$Qqb = $Qqb = $Qqb_1 = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, inlineChatSession_1.$bqb),
        __param(3, editorWorker_1.$4Y),
        __param(4, log_1.$5i),
        __param(5, configuration_1.$8h),
        __param(6, model_1.$yA),
        __param(7, dialogs_1.$oA),
        __param(8, contextkey_1.$3i),
        __param(9, accessibility_1.$1r),
        __param(10, keybinding_1.$2D),
        __param(11, chat_1.$Pqb)
    ], $Qqb);
    let StashedSession = class StashedSession {
        constructor(editor, session, contextKeyService, d, f) {
            this.d = d;
            this.f = f;
            this.b = inlineChat_1.$sz.bindTo(contextKeyService);
            // keep session for a little bit, only release when user continues to work (type, move cursor, etc.)
            this.c = session;
            this.b.set(true);
            this.a = event_1.Event.once(event_1.Event.any(editor.onDidChangeCursorSelection, editor.onDidChangeModelContent, editor.onDidChangeModel))(() => {
                this.c = undefined;
                this.d.releaseSession(session);
                this.b.reset();
            });
        }
        dispose() {
            this.a.dispose();
            this.b.reset();
            if (this.c) {
                this.d.releaseSession(this.c);
            }
        }
        unstash() {
            if (!this.c) {
                return undefined;
            }
            this.a.dispose();
            const result = this.c;
            result.markUnstashed();
            this.c = undefined;
            this.f.debug('[IE] Unstashed session');
            return result;
        }
    };
    StashedSession = __decorate([
        __param(2, contextkey_1.$3i),
        __param(3, inlineChatSession_1.$bqb),
        __param(4, log_1.$5i)
    ], StashedSession);
    async function showMessageResponse(accessor, query, response) {
        const chatService = accessor.get(chatService_1.$FH);
        const providerId = chatService.getProviderInfos()[0]?.id;
        const chatWidgetService = accessor.get(chat_1.$Nqb);
        const widget = await chatWidgetService.revealViewForProvider(providerId);
        if (widget && widget.viewModel) {
            chatService.addCompleteRequest(widget.viewModel.sessionId, query, { message: response });
            widget.focusLastMessage();
        }
    }
    async function sendRequest(accessor, query) {
        const chatService = accessor.get(chatService_1.$FH);
        const widgetService = accessor.get(chat_1.$Nqb);
        const providerId = chatService.getProviderInfos()[0]?.id;
        const widget = await widgetService.revealViewForProvider(providerId);
        if (!widget) {
            return;
        }
        widget.acceptInput(query);
    }
});
//# sourceMappingURL=inlineChatController.js.map