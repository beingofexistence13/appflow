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
define(["require", "exports", "vs/base/common/event", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/iconRegistry", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/services/voiceRecognition/electron-sandbox/workbenchVoiceRecognitionService", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/inlineChat/browser/inlineChatController", "vs/workbench/services/editor/common/editorService", "vs/editor/browser/editorBrowser", "vs/platform/commands/common/commands", "vs/base/parts/sandbox/electron-sandbox/globals", "vs/platform/product/common/product", "vs/workbench/common/contextkeys", "vs/workbench/common/views", "vs/workbench/contrib/chat/common/chatContributionService", "vs/workbench/contrib/chat/browser/actions/chatExecuteActions", "vs/workbench/services/layout/browser/layoutService", "vs/css!./media/voiceChatActions"], function (require, exports, event_1, arrays_1, cancellation_1, codicons_1, lifecycle_1, strings_1, nls_1, actions_1, contextkey_1, instantiation_1, iconRegistry_1, chatActions_1, chat_1, chatService_1, workbenchVoiceRecognitionService_1, inlineChat_1, chatContextKeys_1, inlineChatController_1, editorService_1, editorBrowser_1, commands_1, globals_1, product_1, contextkeys_1, views_1, chatContributionService_1, chatExecuteActions_1, layoutService_1) {
    "use strict";
    var VoiceChatSessions_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerVoiceChatActions = void 0;
    const CONTEXT_VOICE_CHAT_GETTING_READY = new contextkey_1.RawContextKey('voiceChatGettingReady', false, { type: 'boolean', description: (0, nls_1.localize)('voiceChatGettingReady', "True when getting ready for receiving voice input from the microphone for voice chat.") });
    const CONTEXT_VOICE_CHAT_IN_PROGRESS = new contextkey_1.RawContextKey('voiceChatInProgress', false, { type: 'boolean', description: (0, nls_1.localize)('voiceChatInProgress', "True when voice recording from microphone is in progress for voice chat.") });
    const CONTEXT_QUICK_VOICE_CHAT_IN_PROGRESS = new contextkey_1.RawContextKey('quickVoiceChatInProgress', false, { type: 'boolean', description: (0, nls_1.localize)('quickVoiceChatInProgress', "True when voice recording from microphone is in progress for quick chat.") });
    const CONTEXT_INLINE_VOICE_CHAT_IN_PROGRESS = new contextkey_1.RawContextKey('inlineVoiceChatInProgress', false, { type: 'boolean', description: (0, nls_1.localize)('inlineVoiceChatInProgress', "True when voice recording from microphone is in progress for inline chat.") });
    const CONTEXT_VOICE_CHAT_IN_VIEW_IN_PROGRESS = new contextkey_1.RawContextKey('voiceChatInViewInProgress', false, { type: 'boolean', description: (0, nls_1.localize)('voiceChatInViewInProgress', "True when voice recording from microphone is in progress in the chat view.") });
    const CONTEXT_VOICE_CHAT_IN_EDITOR_IN_PROGRESS = new contextkey_1.RawContextKey('voiceChatInEditorInProgress', false, { type: 'boolean', description: (0, nls_1.localize)('voiceChatInEditorInProgress', "True when voice recording from microphone is in progress in the chat editor.") });
    class VoiceChatSessionControllerFactory {
        static async create(accessor, context) {
            const chatWidgetService = accessor.get(chat_1.IChatWidgetService);
            const chatService = accessor.get(chatService_1.IChatService);
            const viewsService = accessor.get(views_1.IViewsService);
            const chatContributionService = accessor.get(chatContributionService_1.IChatContributionService);
            const editorService = accessor.get(editorService_1.IEditorService);
            const quickChatService = accessor.get(chat_1.IQuickChatService);
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
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
                        return VoiceChatSessionControllerFactory.doCreateForChatView(chatInput, viewsService, chatContributionService);
                    }
                    if (layoutService.hasFocus("workbench.parts.editor" /* Parts.EDITOR_PART */)) {
                        return VoiceChatSessionControllerFactory.doCreateForChatEditor(chatInput, viewsService, chatContributionService);
                    }
                    return VoiceChatSessionControllerFactory.doCreateForQuickChat(chatInput, quickChatService);
                }
                // Try with the inline chat
                const activeCodeEditor = (0, editorBrowser_1.getCodeEditor)(editorService.activeTextEditorControl);
                if (activeCodeEditor) {
                    const inlineChat = inlineChatController_1.InlineChatController.get(activeCodeEditor);
                    if (inlineChat?.hasFocus()) {
                        return VoiceChatSessionControllerFactory.doCreateForInlineChat(inlineChat);
                    }
                }
            }
            // View Chat
            if (context === 'view') {
                const provider = (0, arrays_1.firstOrDefault)(chatService.getProviderInfos());
                if (provider) {
                    const chatView = await chatWidgetService.revealViewForProvider(provider.id);
                    if (chatView) {
                        return VoiceChatSessionControllerFactory.doCreateForChatView(chatView, viewsService, chatContributionService);
                    }
                }
            }
            // Inline Chat
            if (context === 'inline') {
                const activeCodeEditor = (0, editorBrowser_1.getCodeEditor)(editorService.activeTextEditorControl);
                if (activeCodeEditor) {
                    const inlineChat = inlineChatController_1.InlineChatController.get(activeCodeEditor);
                    if (inlineChat) {
                        return VoiceChatSessionControllerFactory.doCreateForInlineChat(inlineChat);
                    }
                }
            }
            // Quick Chat
            if (context === 'quick') {
                quickChatService.open();
                const quickChat = chatWidgetService.lastFocusedWidget;
                if (quickChat) {
                    return VoiceChatSessionControllerFactory.doCreateForQuickChat(quickChat, quickChatService);
                }
            }
            return undefined;
        }
        static doCreateForChatView(chatView, viewsService, chatContributionService) {
            return VoiceChatSessionControllerFactory.doCreateForChatViewOrEditor('view', chatView, viewsService, chatContributionService);
        }
        static doCreateForChatEditor(chatView, viewsService, chatContributionService) {
            return VoiceChatSessionControllerFactory.doCreateForChatViewOrEditor('editor', chatView, viewsService, chatContributionService);
        }
        static doCreateForChatViewOrEditor(context, chatView, viewsService, chatContributionService) {
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
        static doCreateForQuickChat(quickChat, quickChatService) {
            return {
                context: 'quick',
                onDidAcceptInput: quickChat.onDidAcceptInput,
                onDidCancelInput: quickChatService.onDidClose,
                focusInput: () => quickChat.focusInput(),
                acceptInput: () => quickChat.acceptInput(),
                updateInput: text => quickChat.updateInput(text)
            };
        }
        static doCreateForInlineChat(inlineChat) {
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
        static { this.instance = undefined; }
        static getInstance(instantiationService) {
            if (!VoiceChatSessions_1.instance) {
                VoiceChatSessions_1.instance = instantiationService.createInstance(VoiceChatSessions_1);
            }
            return VoiceChatSessions_1.instance;
        }
        constructor(contextKeyService, voiceRecognitionService) {
            this.contextKeyService = contextKeyService;
            this.voiceRecognitionService = voiceRecognitionService;
            this.voiceChatInProgressKey = CONTEXT_VOICE_CHAT_IN_PROGRESS.bindTo(this.contextKeyService);
            this.voiceChatGettingReadyKey = CONTEXT_VOICE_CHAT_GETTING_READY.bindTo(this.contextKeyService);
            this.quickVoiceChatInProgressKey = CONTEXT_QUICK_VOICE_CHAT_IN_PROGRESS.bindTo(this.contextKeyService);
            this.inlineVoiceChatInProgressKey = CONTEXT_INLINE_VOICE_CHAT_IN_PROGRESS.bindTo(this.contextKeyService);
            this.voiceChatInViewInProgressKey = CONTEXT_VOICE_CHAT_IN_VIEW_IN_PROGRESS.bindTo(this.contextKeyService);
            this.voiceChatInEditorInProgressKey = CONTEXT_VOICE_CHAT_IN_EDITOR_IN_PROGRESS.bindTo(this.contextKeyService);
            this.currentVoiceChatSession = undefined;
            this.voiceChatSessionIds = 0;
        }
        async start(controller) {
            this.stop();
            const voiceChatSessionId = ++this.voiceChatSessionIds;
            this.currentVoiceChatSession = {
                controller,
                disposables: new lifecycle_1.DisposableStore()
            };
            const cts = new cancellation_1.CancellationTokenSource();
            this.currentVoiceChatSession.disposables.add((0, lifecycle_1.toDisposable)(() => cts.dispose(true)));
            this.currentVoiceChatSession.disposables.add(controller.onDidAcceptInput(() => this.stop(voiceChatSessionId, controller.context)));
            this.currentVoiceChatSession.disposables.add(controller.onDidCancelInput(() => this.stop(voiceChatSessionId, controller.context)));
            controller.updateInput('');
            controller.focusInput();
            this.voiceChatGettingReadyKey.set(true);
            const onDidTranscribe = await this.voiceRecognitionService.transcribe(cts.token, {
                onDidCancel: () => this.stop(voiceChatSessionId, controller.context)
            });
            if (cts.token.isCancellationRequested) {
                return;
            }
            this.voiceChatGettingReadyKey.set(false);
            this.voiceChatInProgressKey.set(true);
            switch (controller.context) {
                case 'inline':
                    this.inlineVoiceChatInProgressKey.set(true);
                    break;
                case 'quick':
                    this.quickVoiceChatInProgressKey.set(true);
                    break;
                case 'view':
                    this.voiceChatInViewInProgressKey.set(true);
                    break;
                case 'editor':
                    this.voiceChatInEditorInProgressKey.set(true);
                    break;
            }
            this.registerTranscriptionListener(this.currentVoiceChatSession, onDidTranscribe);
        }
        registerTranscriptionListener(session, onDidTranscribe) {
            let lastText = undefined;
            let lastTextSimilarCount = 0;
            session.disposables.add(onDidTranscribe(text => {
                if (!text && lastText) {
                    text = lastText;
                }
                if (text) {
                    if (lastText && this.isSimilarTranscription(text, lastText)) {
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
        isSimilarTranscription(textA, textB) {
            // Attempt to compare the 2 strings in a way to see
            // if they are similar or not. As such we:
            // - ignore trailing punctuation
            // - collapse all whitespace
            // - compare case insensitive
            return (0, strings_1.equalsIgnoreCase)(textA.replace(/[.,;:!?]+$/, '').replace(/\s+/g, ''), textB.replace(/[.,;:!?]+$/, '').replace(/\s+/g, ''));
        }
        stop(voiceChatSessionId = this.voiceChatSessionIds, context) {
            if (!this.currentVoiceChatSession ||
                this.voiceChatSessionIds !== voiceChatSessionId ||
                (context && this.currentVoiceChatSession.controller.context !== context)) {
                return;
            }
            this.currentVoiceChatSession.disposables.dispose();
            this.currentVoiceChatSession = undefined;
            this.voiceChatGettingReadyKey.set(false);
            this.voiceChatInProgressKey.set(false);
            this.quickVoiceChatInProgressKey.set(false);
            this.inlineVoiceChatInProgressKey.set(false);
            this.voiceChatInViewInProgressKey.set(false);
            this.voiceChatInEditorInProgressKey.set(false);
        }
        accept(voiceChatSessionId = this.voiceChatSessionIds) {
            if (!this.currentVoiceChatSession ||
                this.voiceChatSessionIds !== voiceChatSessionId) {
                return;
            }
            this.currentVoiceChatSession.controller.acceptInput();
        }
    };
    VoiceChatSessions = VoiceChatSessions_1 = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, workbenchVoiceRecognitionService_1.IWorkbenchVoiceRecognitionService)
    ], VoiceChatSessions);
    class VoiceChatInChatViewAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.chat.voiceChatInChatView'; }
        constructor() {
            super({
                id: VoiceChatInChatViewAction.ID,
                title: {
                    value: (0, nls_1.localize)('workbench.action.chat.voiceChatInView.label', "Voice Chat in Chat View"),
                    original: 'Voice Chat in Chat View'
                },
                category: chatActions_1.CHAT_CATEGORY,
                precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                f1: true
            });
        }
        async run(accessor) {
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const controller = await VoiceChatSessionControllerFactory.create(accessor, 'view');
            if (controller) {
                VoiceChatSessions.getInstance(instantiationService).start(controller);
            }
        }
    }
    class InlineVoiceChatAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.chat.inlineVoiceChat'; }
        constructor() {
            super({
                id: InlineVoiceChatAction.ID,
                title: {
                    value: (0, nls_1.localize)('workbench.action.chat.inlineVoiceChat', "Inline Voice Chat"),
                    original: 'Inline Voice Chat'
                },
                category: chatActions_1.CHAT_CATEGORY,
                precondition: contextkey_1.ContextKeyExpr.and(chatContextKeys_1.CONTEXT_PROVIDER_EXISTS, contextkeys_1.ActiveEditorContext),
                f1: true
            });
        }
        async run(accessor) {
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const controller = await VoiceChatSessionControllerFactory.create(accessor, 'inline');
            if (controller) {
                VoiceChatSessions.getInstance(instantiationService).start(controller);
            }
        }
    }
    class QuickVoiceChatAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.chat.quickVoiceChat'; }
        constructor() {
            super({
                id: QuickVoiceChatAction.ID,
                title: {
                    value: (0, nls_1.localize)('workbench.action.chat.quickVoiceChat.label', "Quick Voice Chat"),
                    original: 'Quick Voice Chat'
                },
                category: chatActions_1.CHAT_CATEGORY,
                precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                f1: true
            });
        }
        async run(accessor) {
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const controller = await VoiceChatSessionControllerFactory.create(accessor, 'quick');
            if (controller) {
                VoiceChatSessions.getInstance(instantiationService).start(controller);
            }
        }
    }
    class StartVoiceChatAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.chat.startVoiceChat'; }
        constructor() {
            super({
                id: StartVoiceChatAction.ID,
                title: {
                    value: (0, nls_1.localize)('workbench.action.chat.startVoiceChat', "Start Voice Chat"),
                    original: 'Start Voice Chat'
                },
                icon: codicons_1.Codicon.mic,
                precondition: CONTEXT_VOICE_CHAT_GETTING_READY.negate(),
                menu: [{
                        id: actions_1.MenuId.ChatExecute,
                        when: contextkey_1.ContextKeyExpr.and(CONTEXT_VOICE_CHAT_IN_VIEW_IN_PROGRESS.negate(), CONTEXT_QUICK_VOICE_CHAT_IN_PROGRESS.negate(), CONTEXT_VOICE_CHAT_IN_EDITOR_IN_PROGRESS.negate()),
                        group: 'navigation',
                        order: -1
                    }, {
                        id: inlineChat_1.MENU_INLINE_CHAT_WIDGET,
                        when: CONTEXT_INLINE_VOICE_CHAT_IN_PROGRESS.negate(),
                        group: 'main',
                        order: -1
                    }]
            });
        }
        async run(accessor, context) {
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const commandService = accessor.get(commands_1.ICommandService);
            if ((0, chatExecuteActions_1.isExecuteActionContext)(context)) {
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
    class StopVoiceChatAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.chat.stopVoiceChat'; }
        constructor() {
            super({
                id: StopVoiceChatAction.ID,
                title: {
                    value: (0, nls_1.localize)('workbench.action.chat.stopVoiceChat.label', "Stop Voice Chat"),
                    original: 'Stop Voice Chat'
                },
                category: chatActions_1.CHAT_CATEGORY,
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
            VoiceChatSessions.getInstance(accessor.get(instantiation_1.IInstantiationService)).stop();
        }
    }
    class StopVoiceChatInChatViewAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.chat.stopVoiceChatInChatView'; }
        constructor() {
            super({
                id: StopVoiceChatInChatViewAction.ID,
                title: {
                    value: (0, nls_1.localize)('workbench.action.chat.stopVoiceChatInChatView.label', "Stop Voice Chat (Chat View)"),
                    original: 'Stop Voice Chat (Chat View)'
                },
                category: chatActions_1.CHAT_CATEGORY,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 100,
                    when: CONTEXT_VOICE_CHAT_IN_VIEW_IN_PROGRESS,
                    primary: 9 /* KeyCode.Escape */
                },
                precondition: CONTEXT_VOICE_CHAT_IN_VIEW_IN_PROGRESS,
                icon: iconRegistry_1.spinningLoading,
                menu: [{
                        id: actions_1.MenuId.ChatExecute,
                        when: CONTEXT_VOICE_CHAT_IN_VIEW_IN_PROGRESS,
                        group: 'navigation',
                        order: -1
                    }]
            });
        }
        run(accessor) {
            VoiceChatSessions.getInstance(accessor.get(instantiation_1.IInstantiationService)).stop(undefined, 'view');
        }
    }
    class StopVoiceChatInChatEditorAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.chat.stopVoiceChatInChatEditor'; }
        constructor() {
            super({
                id: StopVoiceChatInChatEditorAction.ID,
                title: {
                    value: (0, nls_1.localize)('workbench.action.chat.stopVoiceChatInChatEditor.label', "Stop Voice Chat (Chat Editor)"),
                    original: 'Stop Voice Chat (Chat Editor)'
                },
                category: chatActions_1.CHAT_CATEGORY,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 100,
                    when: CONTEXT_VOICE_CHAT_IN_EDITOR_IN_PROGRESS,
                    primary: 9 /* KeyCode.Escape */
                },
                precondition: CONTEXT_VOICE_CHAT_IN_EDITOR_IN_PROGRESS,
                icon: iconRegistry_1.spinningLoading,
                menu: [{
                        id: actions_1.MenuId.ChatExecute,
                        when: CONTEXT_VOICE_CHAT_IN_EDITOR_IN_PROGRESS,
                        group: 'navigation',
                        order: -1
                    }]
            });
        }
        run(accessor) {
            VoiceChatSessions.getInstance(accessor.get(instantiation_1.IInstantiationService)).stop(undefined, 'editor');
        }
    }
    class StopQuickVoiceChatAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.chat.stopQuickVoiceChat'; }
        constructor() {
            super({
                id: StopQuickVoiceChatAction.ID,
                title: {
                    value: (0, nls_1.localize)('workbench.action.chat.stopQuickVoiceChat.label', "Stop Voice Chat (Quick Chat)"),
                    original: 'Stop Voice Chat (Quick Chat)'
                },
                category: chatActions_1.CHAT_CATEGORY,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 100,
                    when: CONTEXT_QUICK_VOICE_CHAT_IN_PROGRESS,
                    primary: 9 /* KeyCode.Escape */
                },
                precondition: CONTEXT_QUICK_VOICE_CHAT_IN_PROGRESS,
                icon: iconRegistry_1.spinningLoading,
                menu: [{
                        id: actions_1.MenuId.ChatExecute,
                        when: CONTEXT_QUICK_VOICE_CHAT_IN_PROGRESS,
                        group: 'navigation',
                        order: -1
                    }]
            });
        }
        run(accessor) {
            VoiceChatSessions.getInstance(accessor.get(instantiation_1.IInstantiationService)).stop(undefined, 'quick');
        }
    }
    class StopInlineVoiceChatAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.chat.stopInlineVoiceChat'; }
        constructor() {
            super({
                id: StopInlineVoiceChatAction.ID,
                title: {
                    value: (0, nls_1.localize)('workbench.action.chat.stopInlineVoiceChat.label', "Stop Voice Chat (Inline Editor)"),
                    original: 'Stop Voice Chat (Inline Editor)'
                },
                category: chatActions_1.CHAT_CATEGORY,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 100,
                    when: CONTEXT_INLINE_VOICE_CHAT_IN_PROGRESS,
                    primary: 9 /* KeyCode.Escape */
                },
                precondition: CONTEXT_INLINE_VOICE_CHAT_IN_PROGRESS,
                icon: iconRegistry_1.spinningLoading,
                menu: [{
                        id: inlineChat_1.MENU_INLINE_CHAT_WIDGET,
                        when: CONTEXT_INLINE_VOICE_CHAT_IN_PROGRESS,
                        group: 'main',
                        order: -1
                    }]
            });
        }
        run(accessor) {
            VoiceChatSessions.getInstance(accessor.get(instantiation_1.IInstantiationService)).stop(undefined, 'inline');
        }
    }
    class StopVoiceChatAndSubmitAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.chat.stopVoiceChatAndSubmit'; }
        constructor() {
            super({
                id: StopVoiceChatAndSubmitAction.ID,
                title: {
                    value: (0, nls_1.localize)('workbench.action.chat.stopAndAcceptVoiceChat.label', "Stop Voice Chat and Submit"),
                    original: 'Stop Voice Chat and Submit'
                },
                category: chatActions_1.CHAT_CATEGORY,
                f1: true,
                precondition: CONTEXT_VOICE_CHAT_IN_PROGRESS
            });
        }
        run(accessor) {
            VoiceChatSessions.getInstance(accessor.get(instantiation_1.IInstantiationService)).accept();
        }
    }
    function registerVoiceChatActions() {
        if (typeof globals_1.process.env.VSCODE_VOICE_MODULE_PATH === 'string' && product_1.default.quality !== 'stable') { // TODO@bpasero package
            (0, actions_1.registerAction2)(VoiceChatInChatViewAction);
            (0, actions_1.registerAction2)(QuickVoiceChatAction);
            (0, actions_1.registerAction2)(InlineVoiceChatAction);
            (0, actions_1.registerAction2)(StartVoiceChatAction);
            (0, actions_1.registerAction2)(StopVoiceChatAction);
            (0, actions_1.registerAction2)(StopVoiceChatAndSubmitAction);
            (0, actions_1.registerAction2)(StopVoiceChatInChatViewAction);
            (0, actions_1.registerAction2)(StopVoiceChatInChatEditorAction);
            (0, actions_1.registerAction2)(StopQuickVoiceChatAction);
            (0, actions_1.registerAction2)(StopInlineVoiceChatAction);
        }
    }
    exports.registerVoiceChatActions = registerVoiceChatActions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidm9pY2VDaGF0QWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NoYXQvZWxlY3Ryb24tc2FuZGJveC9hY3Rpb25zL3ZvaWNlQ2hhdEFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQW1DaEcsTUFBTSxnQ0FBZ0MsR0FBRyxJQUFJLDBCQUFhLENBQVUsdUJBQXVCLEVBQUUsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsdUJBQXVCLEVBQUUsdUZBQXVGLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbFEsTUFBTSw4QkFBOEIsR0FBRyxJQUFJLDBCQUFhLENBQVUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMscUJBQXFCLEVBQUUsMEVBQTBFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFL08sTUFBTSxvQ0FBb0MsR0FBRyxJQUFJLDBCQUFhLENBQVUsMEJBQTBCLEVBQUUsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsMEJBQTBCLEVBQUUsMEVBQTBFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDL1AsTUFBTSxxQ0FBcUMsR0FBRyxJQUFJLDBCQUFhLENBQVUsMkJBQTJCLEVBQUUsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsMkJBQTJCLEVBQUUsMkVBQTJFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDblEsTUFBTSxzQ0FBc0MsR0FBRyxJQUFJLDBCQUFhLENBQVUsMkJBQTJCLEVBQUUsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFF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