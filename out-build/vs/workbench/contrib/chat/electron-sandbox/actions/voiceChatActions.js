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
define(["require", "exports", "vs/base/common/event", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/nls!vs/workbench/contrib/chat/electron-sandbox/actions/voiceChatActions", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/iconRegistry", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/services/voiceRecognition/electron-sandbox/workbenchVoiceRecognitionService", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/inlineChat/browser/inlineChatController", "vs/workbench/services/editor/common/editorService", "vs/editor/browser/editorBrowser", "vs/platform/commands/common/commands", "vs/base/parts/sandbox/electron-sandbox/globals", "vs/platform/product/common/product", "vs/workbench/common/contextkeys", "vs/workbench/common/views", "vs/workbench/contrib/chat/common/chatContributionService", "vs/workbench/contrib/chat/browser/actions/chatExecuteActions", "vs/workbench/services/layout/browser/layoutService", "vs/css!./media/voiceChatActions"], function (require, exports, event_1, arrays_1, cancellation_1, codicons_1, lifecycle_1, strings_1, nls_1, actions_1, contextkey_1, instantiation_1, iconRegistry_1, chatActions_1, chat_1, chatService_1, workbenchVoiceRecognitionService_1, inlineChat_1, chatContextKeys_1, inlineChatController_1, editorService_1, editorBrowser_1, commands_1, globals_1, product_1, contextkeys_1, views_1, chatContributionService_1, chatExecuteActions_1, layoutService_1) {
    "use strict";
    var VoiceChatSessions_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$5ac = void 0;
    const CONTEXT_VOICE_CHAT_GETTING_READY = new contextkey_1.$2i('voiceChatGettingReady', false, { type: 'boolean', description: (0, nls_1.localize)(0, null) });
    const CONTEXT_VOICE_CHAT_IN_PROGRESS = new contextkey_1.$2i('voiceChatInProgress', false, { type: 'boolean', description: (0, nls_1.localize)(1, null) });
    const CONTEXT_QUICK_VOICE_CHAT_IN_PROGRESS = new contextkey_1.$2i('quickVoiceChatInProgress', false, { type: 'boolean', description: (0, nls_1.localize)(2, null) });
    const CONTEXT_INLINE_VOICE_CHAT_IN_PROGRESS = new contextkey_1.$2i('inlineVoiceChatInProgress', false, { type: 'boolean', description: (0, nls_1.localize)(3, null) });
    const CONTEXT_VOICE_CHAT_IN_VIEW_IN_PROGRESS = new contextkey_1.$2i('voiceChatInViewInProgress', false, { type: 'boolean', description: (0, nls_1.localize)(4, null) });
    const CONTEXT_VOICE_CHAT_IN_EDITOR_IN_PROGRESS = new contextkey_1.$2i('voiceChatInEditorInProgress', false, { type: 'boolean', description: (0, nls_1.localize)(5, null) });
    class VoiceChatSessionControllerFactory {
        static async create(accessor, context) {
            const chatWidgetService = accessor.get(chat_1.$Nqb);
            const chatService = accessor.get(chatService_1.$FH);
            const viewsService = accessor.get(views_1.$$E);
            const chatContributionService = accessor.get(chatContributionService_1.$fsb);
            const editorService = accessor.get(editorService_1.$9C);
            const quickChatService = accessor.get(chat_1.$Oqb);
            const layoutService = accessor.get(layoutService_1.$Meb);
            // Currently Focussed Context
            if (context === 'focussed') {
                // Try with the chat widget service, which currently
                // only supports the chat view and quick chat
                // https://github.com/microsoft/vscode/issues/191191
                const chatInput = chatWidgetService.lastFocusedWidget;
                if (chatInput?.hasInputFocus()) {
                    // Unfortunately there does not seem to be a better way
                    // to figure out if the chat widget is in a part or picker
                    if (layoutService.hasFocus("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */) ||
                        layoutService.hasFocus("workbench.parts.panel" /* Parts.PANEL_PART */) ||
                        layoutService.hasFocus("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */)) {
                        return VoiceChatSessionControllerFactory.a(chatInput, viewsService, chatContributionService);
                    }
                    if (layoutService.hasFocus("workbench.parts.editor" /* Parts.EDITOR_PART */)) {
                        return VoiceChatSessionControllerFactory.b(chatInput, viewsService, chatContributionService);
                    }
                    return VoiceChatSessionControllerFactory.d(chatInput, quickChatService);
                }
                // Try with the inline chat
                const activeCodeEditor = (0, editorBrowser_1.$lV)(editorService.activeTextEditorControl);
                if (activeCodeEditor) {
                    const inlineChat = inlineChatController_1.$Qqb.get(activeCodeEditor);
                    if (inlineChat?.hasFocus()) {
                        return VoiceChatSessionControllerFactory.f(inlineChat);
                    }
                }
            }
            // View Chat
            if (context === 'view') {
                const provider = (0, arrays_1.$Mb)(chatService.getProviderInfos());
                if (provider) {
                    const chatView = await chatWidgetService.revealViewForProvider(provider.id);
                    if (chatView) {
                        return VoiceChatSessionControllerFactory.a(chatView, viewsService, chatContributionService);
                    }
                }
            }
            // Inline Chat
            if (context === 'inline') {
                const activeCodeEditor = (0, editorBrowser_1.$lV)(editorService.activeTextEditorControl);
                if (activeCodeEditor) {
                    const inlineChat = inlineChatController_1.$Qqb.get(activeCodeEditor);
                    if (inlineChat) {
                        return VoiceChatSessionControllerFactory.f(inlineChat);
                    }
                }
            }
            // Quick Chat
            if (context === 'quick') {
                quickChatService.open();
                const quickChat = chatWidgetService.lastFocusedWidget;
                if (quickChat) {
                    return VoiceChatSessionControllerFactory.d(quickChat, quickChatService);
                }
            }
            return undefined;
        }
        static a(chatView, viewsService, chatContributionService) {
            return VoiceChatSessionControllerFactory.c('view', chatView, viewsService, chatContributionService);
        }
        static b(chatView, viewsService, chatContributionService) {
            return VoiceChatSessionControllerFactory.c('editor', chatView, viewsService, chatContributionService);
        }
        static c(context, chatView, viewsService, chatContributionService) {
            return {
                context,
                onDidAcceptInput: chatView.onDidAcceptInput,
                // TODO@bpasero cancellation needs to work better for chat editors that are not view bound
                onDidCancelInput: event_1.Event.filter(viewsService.onDidChangeViewVisibility, e => e.id === chatContributionService.getViewIdForProvider(chatView.providerId)),
                focusInput: () => chatView.focusInput(),
                acceptInput: () => chatView.acceptInput(),
                updateInput: text => chatView.updateInput(text)
            };
        }
        static d(quickChat, quickChatService) {
            return {
                context: 'quick',
                onDidAcceptInput: quickChat.onDidAcceptInput,
                onDidCancelInput: quickChatService.onDidClose,
                focusInput: () => quickChat.focusInput(),
                acceptInput: () => quickChat.acceptInput(),
                updateInput: text => quickChat.updateInput(text)
            };
        }
        static f(inlineChat) {
            const inlineChatSession = inlineChat.run();
            return {
                context: 'inline',
                onDidAcceptInput: inlineChat.onDidAcceptInput,
                onDidCancelInput: event_1.Event.any(inlineChat.onDidCancelInput, event_1.Event.fromPromise(inlineChatSession)),
                focusInput: () => inlineChat.focus(),
                acceptInput: () => inlineChat.acceptInput(),
                updateInput: text => inlineChat.updateInput(text)
            };
        }
    }
    let VoiceChatSessions = class VoiceChatSessions {
        static { VoiceChatSessions_1 = this; }
        static { this.a = undefined; }
        static getInstance(instantiationService) {
            if (!VoiceChatSessions_1.a) {
                VoiceChatSessions_1.a = instantiationService.createInstance(VoiceChatSessions_1);
            }
            return VoiceChatSessions_1.a;
        }
        constructor(k, l) {
            this.k = k;
            this.l = l;
            this.b = CONTEXT_VOICE_CHAT_IN_PROGRESS.bindTo(this.k);
            this.c = CONTEXT_VOICE_CHAT_GETTING_READY.bindTo(this.k);
            this.d = CONTEXT_QUICK_VOICE_CHAT_IN_PROGRESS.bindTo(this.k);
            this.f = CONTEXT_INLINE_VOICE_CHAT_IN_PROGRESS.bindTo(this.k);
            this.g = CONTEXT_VOICE_CHAT_IN_VIEW_IN_PROGRESS.bindTo(this.k);
            this.h = CONTEXT_VOICE_CHAT_IN_EDITOR_IN_PROGRESS.bindTo(this.k);
            this.i = undefined;
            this.j = 0;
        }
        async start(controller) {
            this.stop();
            const voiceChatSessionId = ++this.j;
            this.i = {
                controller,
                disposables: new lifecycle_1.$jc()
            };
            const cts = new cancellation_1.$pd();
            this.i.disposables.add((0, lifecycle_1.$ic)(() => cts.dispose(true)));
            this.i.disposables.add(controller.onDidAcceptInput(() => this.stop(voiceChatSessionId, controller.context)));
            this.i.disposables.add(controller.onDidCancelInput(() => this.stop(voiceChatSessionId, controller.context)));
            controller.updateInput('');
            controller.focusInput();
            this.c.set(true);
            const onDidTranscribe = await this.l.transcribe(cts.token, {
                onDidCancel: () => this.stop(voiceChatSessionId, controller.context)
            });
            if (cts.token.isCancellationRequested) {
                return;
            }
            this.c.set(false);
            this.b.set(true);
            switch (controller.context) {
                case 'inline':
                    this.f.set(true);
                    break;
                case 'quick':
                    this.d.set(true);
                    break;
                case 'view':
                    this.g.set(true);
                    break;
                case 'editor':
                    this.h.set(true);
                    break;
            }
            this.m(this.i, onDidTranscribe);
        }
        m(session, onDidTranscribe) {
            let lastText = undefined;
            let lastTextSimilarCount = 0;
            session.disposables.add(onDidTranscribe(text => {
                if (!text && lastText) {
                    text = lastText;
                }
                if (text) {
                    if (lastText && this.n(text, lastText)) {
                        lastTextSimilarCount++;
                    }
                    else {
                        lastTextSimilarCount = 0;
                        lastText = text;
                    }
                    if (lastTextSimilarCount >= 2) {
                        session.controller.acceptInput();
                    }
                    else {
                        session.controller.updateInput(text);
                    }
                }
            }));
        }
        n(textA, textB) {
            // Attempt to compare the 2 strings in a way to see
            // if they are similar or not. As such we:
            // - ignore trailing punctuation
            // - collapse all whitespace
            // - compare case insensitive
            return (0, strings_1.$Me)(textA.replace(/[.,;:!?]+$/, '').replace(/\s+/g, ''), textB.replace(/[.,;:!?]+$/, '').replace(/\s+/g, ''));
        }
        stop(voiceChatSessionId = this.j, context) {
            if (!this.i ||
                this.j !== voiceChatSessionId ||
                (context && this.i.controller.context !== context)) {
                return;
            }
            this.i.disposables.dispose();
            this.i = undefined;
            this.c.set(false);
            this.b.set(false);
            this.d.set(false);
            this.f.set(false);
            this.g.set(false);
            this.h.set(false);
        }
        accept(voiceChatSessionId = this.j) {
            if (!this.i ||
                this.j !== voiceChatSessionId) {
                return;
            }
            this.i.controller.acceptInput();
        }
    };
    VoiceChatSessions = VoiceChatSessions_1 = __decorate([
        __param(0, contextkey_1.$3i),
        __param(1, workbenchVoiceRecognitionService_1.$6_b)
    ], VoiceChatSessions);
    class VoiceChatInChatViewAction extends actions_1.$Wu {
        static { this.ID = 'workbench.action.chat.voiceChatInChatView'; }
        constructor() {
            super({
                id: VoiceChatInChatViewAction.ID,
                title: {
                    value: (0, nls_1.localize)(6, null),
                    original: 'Voice Chat in Chat View'
                },
                category: chatActions_1.$DIb,
                precondition: chatContextKeys_1.$LGb,
                f1: true
            });
        }
        async run(accessor) {
            const instantiationService = accessor.get(instantiation_1.$Ah);
            const controller = await VoiceChatSessionControllerFactory.create(accessor, 'view');
            if (controller) {
                VoiceChatSessions.getInstance(instantiationService).start(controller);
            }
        }
    }
    class InlineVoiceChatAction extends actions_1.$Wu {
        static { this.ID = 'workbench.action.chat.inlineVoiceChat'; }
        constructor() {
            super({
                id: InlineVoiceChatAction.ID,
                title: {
                    value: (0, nls_1.localize)(7, null),
                    original: 'Inline Voice Chat'
                },
                category: chatActions_1.$DIb,
                precondition: contextkey_1.$Ii.and(chatContextKeys_1.$LGb, contextkeys_1.$$cb),
                f1: true
            });
        }
        async run(accessor) {
            const instantiationService = accessor.get(instantiation_1.$Ah);
            const controller = await VoiceChatSessionControllerFactory.create(accessor, 'inline');
            if (controller) {
                VoiceChatSessions.getInstance(instantiationService).start(controller);
            }
        }
    }
    class QuickVoiceChatAction extends actions_1.$Wu {
        static { this.ID = 'workbench.action.chat.quickVoiceChat'; }
        constructor() {
            super({
                id: QuickVoiceChatAction.ID,
                title: {
                    value: (0, nls_1.localize)(8, null),
                    original: 'Quick Voice Chat'
                },
                category: chatActions_1.$DIb,
                precondition: chatContextKeys_1.$LGb,
                f1: true
            });
        }
        async run(accessor) {
            const instantiationService = accessor.get(instantiation_1.$Ah);
            const controller = await VoiceChatSessionControllerFactory.create(accessor, 'quick');
            if (controller) {
                VoiceChatSessions.getInstance(instantiationService).start(controller);
            }
        }
    }
    class StartVoiceChatAction extends actions_1.$Wu {
        static { this.ID = 'workbench.action.chat.startVoiceChat'; }
        constructor() {
            super({
                id: StartVoiceChatAction.ID,
                title: {
                    value: (0, nls_1.localize)(9, null),
                    original: 'Start Voice Chat'
                },
                icon: codicons_1.$Pj.mic,
                precondition: CONTEXT_VOICE_CHAT_GETTING_READY.negate(),
                menu: [{
                        id: actions_1.$Ru.ChatExecute,
                        when: contextkey_1.$Ii.and(CONTEXT_VOICE_CHAT_IN_VIEW_IN_PROGRESS.negate(), CONTEXT_QUICK_VOICE_CHAT_IN_PROGRESS.negate(), CONTEXT_VOICE_CHAT_IN_EDITOR_IN_PROGRESS.negate()),
                        group: 'navigation',
                        order: -1
                    }, {
                        id: inlineChat_1.$Dz,
                        when: CONTEXT_INLINE_VOICE_CHAT_IN_PROGRESS.negate(),
                        group: 'main',
                        order: -1
                    }]
            });
        }
        async run(accessor, context) {
            const instantiationService = accessor.get(instantiation_1.$Ah);
            const commandService = accessor.get(commands_1.$Fr);
            if ((0, chatExecuteActions_1.$MGb)(context)) {
                // if we already get a context when the action is executed
                // from a toolbar within the chat widget, then make sure
                // to move focus into the input field so that the controller
                // is properly retrieved
                // TODO@bpasero this will actually not work if the button
                // is clicked from the inline editor while focus is in a
                // chat input field in a view or picker
                context.widget.focusInput();
            }
            const controller = await VoiceChatSessionControllerFactory.create(accessor, 'focussed');
            if (controller) {
                VoiceChatSessions.getInstance(instantiationService).start(controller);
            }
            else {
                // fallback to Quick Voice Chat command
                commandService.executeCommand(QuickVoiceChatAction.ID);
            }
        }
    }
    class StopVoiceChatAction extends actions_1.$Wu {
        static { this.ID = 'workbench.action.chat.stopVoiceChat'; }
        constructor() {
            super({
                id: StopVoiceChatAction.ID,
                title: {
                    value: (0, nls_1.localize)(10, null),
                    original: 'Stop Voice Chat'
                },
                category: chatActions_1.$DIb,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 100,
                    when: CONTEXT_VOICE_CHAT_IN_PROGRESS,
                    primary: 9 /* KeyCode.Escape */
                },
                precondition: CONTEXT_VOICE_CHAT_IN_PROGRESS
            });
        }
        run(accessor) {
            VoiceChatSessions.getInstance(accessor.get(instantiation_1.$Ah)).stop();
        }
    }
    class StopVoiceChatInChatViewAction extends actions_1.$Wu {
        static { this.ID = 'workbench.action.chat.stopVoiceChatInChatView'; }
        constructor() {
            super({
                id: StopVoiceChatInChatViewAction.ID,
                title: {
                    value: (0, nls_1.localize)(11, null),
                    original: 'Stop Voice Chat (Chat View)'
                },
                category: chatActions_1.$DIb,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 100,
                    when: CONTEXT_VOICE_CHAT_IN_VIEW_IN_PROGRESS,
                    primary: 9 /* KeyCode.Escape */
                },
                precondition: CONTEXT_VOICE_CHAT_IN_VIEW_IN_PROGRESS,
                icon: iconRegistry_1.$dv,
                menu: [{
                        id: actions_1.$Ru.ChatExecute,
                        when: CONTEXT_VOICE_CHAT_IN_VIEW_IN_PROGRESS,
                        group: 'navigation',
                        order: -1
                    }]
            });
        }
        run(accessor) {
            VoiceChatSessions.getInstance(accessor.get(instantiation_1.$Ah)).stop(undefined, 'view');
        }
    }
    class StopVoiceChatInChatEditorAction extends actions_1.$Wu {
        static { this.ID = 'workbench.action.chat.stopVoiceChatInChatEditor'; }
        constructor() {
            super({
                id: StopVoiceChatInChatEditorAction.ID,
                title: {
                    value: (0, nls_1.localize)(12, null),
                    original: 'Stop Voice Chat (Chat Editor)'
                },
                category: chatActions_1.$DIb,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 100,
                    when: CONTEXT_VOICE_CHAT_IN_EDITOR_IN_PROGRESS,
                    primary: 9 /* KeyCode.Escape */
                },
                precondition: CONTEXT_VOICE_CHAT_IN_EDITOR_IN_PROGRESS,
                icon: iconRegistry_1.$dv,
                menu: [{
                        id: actions_1.$Ru.ChatExecute,
                        when: CONTEXT_VOICE_CHAT_IN_EDITOR_IN_PROGRESS,
                        group: 'navigation',
                        order: -1
                    }]
            });
        }
        run(accessor) {
            VoiceChatSessions.getInstance(accessor.get(instantiation_1.$Ah)).stop(undefined, 'editor');
        }
    }
    class StopQuickVoiceChatAction extends actions_1.$Wu {
        static { this.ID = 'workbench.action.chat.stopQuickVoiceChat'; }
        constructor() {
            super({
                id: StopQuickVoiceChatAction.ID,
                title: {
                    value: (0, nls_1.localize)(13, null),
                    original: 'Stop Voice Chat (Quick Chat)'
                },
                category: chatActions_1.$DIb,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 100,
                    when: CONTEXT_QUICK_VOICE_CHAT_IN_PROGRESS,
                    primary: 9 /* KeyCode.Escape */
                },
                precondition: CONTEXT_QUICK_VOICE_CHAT_IN_PROGRESS,
                icon: iconRegistry_1.$dv,
                menu: [{
                        id: actions_1.$Ru.ChatExecute,
                        when: CONTEXT_QUICK_VOICE_CHAT_IN_PROGRESS,
                        group: 'navigation',
                        order: -1
                    }]
            });
        }
        run(accessor) {
            VoiceChatSessions.getInstance(accessor.get(instantiation_1.$Ah)).stop(undefined, 'quick');
        }
    }
    class StopInlineVoiceChatAction extends actions_1.$Wu {
        static { this.ID = 'workbench.action.chat.stopInlineVoiceChat'; }
        constructor() {
            super({
                id: StopInlineVoiceChatAction.ID,
                title: {
                    value: (0, nls_1.localize)(14, null),
                    original: 'Stop Voice Chat (Inline Editor)'
                },
                category: chatActions_1.$DIb,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 100,
                    when: CONTEXT_INLINE_VOICE_CHAT_IN_PROGRESS,
                    primary: 9 /* KeyCode.Escape */
                },
                precondition: CONTEXT_INLINE_VOICE_CHAT_IN_PROGRESS,
                icon: iconRegistry_1.$dv,
                menu: [{
                        id: inlineChat_1.$Dz,
                        when: CONTEXT_INLINE_VOICE_CHAT_IN_PROGRESS,
                        group: 'main',
                        order: -1
                    }]
            });
        }
        run(accessor) {
            VoiceChatSessions.getInstance(accessor.get(instantiation_1.$Ah)).stop(undefined, 'inline');
        }
    }
    class StopVoiceChatAndSubmitAction extends actions_1.$Wu {
        static { this.ID = 'workbench.action.chat.stopVoiceChatAndSubmit'; }
        constructor() {
            super({
                id: StopVoiceChatAndSubmitAction.ID,
                title: {
                    value: (0, nls_1.localize)(15, null),
                    original: 'Stop Voice Chat and Submit'
                },
                category: chatActions_1.$DIb,
                f1: true,
                precondition: CONTEXT_VOICE_CHAT_IN_PROGRESS
            });
        }
        run(accessor) {
            VoiceChatSessions.getInstance(accessor.get(instantiation_1.$Ah)).accept();
        }
    }
    function $5ac() {
        if (typeof globals_1.$P.env.VSCODE_VOICE_MODULE_PATH === 'string' && product_1.default.quality !== 'stable') { // TODO@bpasero package
            (0, actions_1.$Xu)(VoiceChatInChatViewAction);
            (0, actions_1.$Xu)(QuickVoiceChatAction);
            (0, actions_1.$Xu)(InlineVoiceChatAction);
            (0, actions_1.$Xu)(StartVoiceChatAction);
            (0, actions_1.$Xu)(StopVoiceChatAction);
            (0, actions_1.$Xu)(StopVoiceChatAndSubmitAction);
            (0, actions_1.$Xu)(StopVoiceChatInChatViewAction);
            (0, actions_1.$Xu)(StopVoiceChatInChatEditorAction);
            (0, actions_1.$Xu)(StopQuickVoiceChatAction);
            (0, actions_1.$Xu)(StopInlineVoiceChatAction);
        }
    }
    exports.$5ac = $5ac;
});
//# sourceMappingURL=voiceChatActions.js.map