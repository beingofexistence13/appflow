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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/sash/sash", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/layout/browser/layoutService", "vs/platform/quickinput/common/quickInput", "vs/platform/theme/common/colorRegistry", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/browser/chatWidget", "vs/workbench/contrib/chat/common/chatService"], function (require, exports, dom, sash_1, async_1, cancellation_1, event_1, lifecycle_1, contextkey_1, instantiation_1, serviceCollection_1, layoutService_1, quickInput_1, colorRegistry_1, chat_1, chatWidget_1, chatService_1) {
    "use strict";
    var QuickChat_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QuickChatService = void 0;
    let QuickChatService = class QuickChatService extends lifecycle_1.Disposable {
        constructor(quickInputService, chatService, instantiationService) {
            super();
            this.quickInputService = quickInputService;
            this.chatService = chatService;
            this.instantiationService = instantiationService;
            this._onDidClose = this._register(new event_1.Emitter());
            this.onDidClose = this._onDidClose.event;
        }
        get enabled() {
            return this.chatService.getProviderInfos().length > 0;
        }
        get focused() {
            const widget = this._input?.widget;
            if (!widget) {
                return false;
            }
            return dom.isAncestor(document.activeElement, widget);
        }
        toggle(providerId, query) {
            // If the input is already shown, hide it. This provides a toggle behavior of the quick pick
            if (this.focused) {
                this.close();
            }
            else {
                this.open(providerId, query);
            }
        }
        open(providerId, query) {
            if (this._input) {
                return this.focus();
            }
            // Check if any providers are available. If not, show nothing
            // This shouldn't be needed because of the precondition, but just in case
            const providerInfo = providerId
                ? this.chatService.getProviderInfos().find(info => info.id === providerId)
                : this.chatService.getProviderInfos()[0];
            if (!providerInfo) {
                return;
            }
            const disposableStore = new lifecycle_1.DisposableStore();
            this._input = this.quickInputService.createQuickWidget();
            this._input.contextKey = 'chatInputVisible';
            this._input.ignoreFocusOut = true;
            disposableStore.add(this._input);
            this._container ??= dom.$('.interactive-session');
            this._input.widget = this._container;
            this._input.show();
            if (!this._currentChat) {
                this._currentChat = this.instantiationService.createInstance(QuickChat, {
                    providerId: providerInfo.id,
                });
                // show needs to come after the quickpick is shown
                this._currentChat.render(this._container);
            }
            else {
                this._currentChat.show();
            }
            disposableStore.add(this._input.onDidHide(() => {
                disposableStore.dispose();
                this._currentChat.hide();
                this._input = undefined;
                this._onDidClose.fire();
            }));
            this._currentChat.focus();
            if (query) {
                this._currentChat.setValue(query);
                this._currentChat.acceptInput();
            }
        }
        focus() {
            this._currentChat?.focus();
        }
        close() {
            this._input?.dispose();
            this._input = undefined;
        }
        async openInChatView() {
            await this._currentChat?.openChatView();
            this.close();
        }
    };
    exports.QuickChatService = QuickChatService;
    exports.QuickChatService = QuickChatService = __decorate([
        __param(0, quickInput_1.IQuickInputService),
        __param(1, chatService_1.IChatService),
        __param(2, instantiation_1.IInstantiationService)
    ], QuickChatService);
    let QuickChat = class QuickChat extends lifecycle_1.Disposable {
        static { QuickChat_1 = this; }
        // TODO@TylerLeonhardt: be responsive to window size
        static { this.DEFAULT_MIN_HEIGHT = 200; }
        static { this.DEFAULT_HEIGHT_OFFSET = 100; }
        constructor(_options, instantiationService, contextKeyService, chatService, _chatWidgetService, layoutService) {
            super();
            this._options = _options;
            this.instantiationService = instantiationService;
            this.contextKeyService = contextKeyService;
            this.chatService = chatService;
            this._chatWidgetService = _chatWidgetService;
            this.layoutService = layoutService;
            this.maintainScrollTimer = this._register(new lifecycle_1.MutableDisposable());
            this._deferUpdatingDynamicLayout = false;
        }
        clear() {
            this.model?.dispose();
            this.model = undefined;
            this.updateModel();
            this.widget.inputEditor.setValue('');
        }
        focus() {
            if (this.widget) {
                this.widget.focusInput();
                const value = this.widget.inputEditor.getValue();
                if (value) {
                    this.widget.inputEditor.setSelection({
                        startLineNumber: 1,
                        startColumn: 1,
                        endLineNumber: 1,
                        endColumn: value.length + 1
                    });
                }
            }
        }
        hide() {
            this.widget.setVisible(false);
            // Maintain scroll position for a short time so that if the user re-shows the chat
            // the same scroll position will be used.
            this.maintainScrollTimer.value = (0, async_1.disposableTimeout)(() => {
                // At this point, clear this mutable disposable which will be our signal that
                // the timer has expired and we should stop maintaining scroll position
                this.maintainScrollTimer.clear();
            }, 30 * 1000); // 30 seconds
        }
        show() {
            this.widget.setVisible(true);
            // If the mutable disposable is set, then we are keeping the existing scroll position
            // so we should not update the layout.
            if (this._deferUpdatingDynamicLayout) {
                this._deferUpdatingDynamicLayout = false;
                this.widget.updateDynamicChatTreeItemLayout(2, this.maxHeight);
            }
            if (!this.maintainScrollTimer.value) {
                this.widget.layoutDynamicChatTreeItemMode();
            }
        }
        render(parent) {
            if (this.widget) {
                throw new Error('Cannot render quick chat twice');
            }
            const scopedInstantiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([
                contextkey_1.IContextKeyService,
                this._register(this.contextKeyService.createScoped(parent))
            ]));
            this.widget = this._register(scopedInstantiationService.createInstance(chatWidget_1.ChatWidget, { resource: true, renderInputOnTop: true, renderStyle: 'compact' }, {
                listForeground: colorRegistry_1.quickInputForeground,
                listBackground: colorRegistry_1.quickInputBackground,
                inputEditorBackground: colorRegistry_1.inputBackground,
                resultEditorBackground: colorRegistry_1.quickInputBackground
            }));
            this.widget.render(parent);
            this.widget.setVisible(true);
            this.widget.setDynamicChatTreeItemLayout(2, this.maxHeight);
            this.updateModel();
            this.sash = this._register(new sash_1.Sash(parent, { getHorizontalSashTop: () => parent.offsetHeight }, { orientation: 1 /* Orientation.HORIZONTAL */ }));
            this.registerListeners(parent);
        }
        get maxHeight() {
            return this.layoutService.dimension.height - QuickChat_1.DEFAULT_HEIGHT_OFFSET;
        }
        registerListeners(parent) {
            this._register(this.layoutService.onDidLayout(() => {
                if (this.widget.visible) {
                    this.widget.updateDynamicChatTreeItemLayout(2, this.maxHeight);
                }
                else {
                    // If the chat is not visible, then we should defer updating the layout
                    // because it relies on offsetHeight which only works correctly
                    // when the chat is visible.
                    this._deferUpdatingDynamicLayout = true;
                }
            }));
            this._register(this.widget.inputEditor.onDidChangeModelContent((e) => {
                this._currentQuery = this.widget.inputEditor.getValue();
            }));
            this._register(this.widget.onDidClear(() => this.clear()));
            this._register(this.widget.onDidChangeHeight((e) => this.sash.layout()));
            const width = parent.offsetWidth;
            this._register(this.sash.onDidStart(() => {
                this.widget.isDynamicChatTreeItemLayoutEnabled = false;
            }));
            this._register(this.sash.onDidChange((e) => {
                if (e.currentY < QuickChat_1.DEFAULT_MIN_HEIGHT || e.currentY > this.maxHeight) {
                    return;
                }
                this.widget.layout(e.currentY, width);
                this.sash.layout();
            }));
            this._register(this.sash.onDidReset(() => {
                this.widget.isDynamicChatTreeItemLayoutEnabled = true;
                this.widget.layoutDynamicChatTreeItemMode();
            }));
        }
        async acceptInput() {
            return this.widget.acceptInput();
        }
        async openChatView() {
            const widget = await this._chatWidgetService.revealViewForProvider(this._options.providerId);
            if (!widget?.viewModel || !this.model) {
                return;
            }
            for (const request of this.model.getRequests()) {
                if (request.response?.response.value || request.response?.errorDetails) {
                    this.chatService.addCompleteRequest(widget.viewModel.sessionId, request.message, {
                        message: request.response.response.value,
                        errorDetails: request.response.errorDetails,
                        followups: request.response.followups
                    });
                }
                else if (request.message) {
                }
            }
            const value = this.widget.inputEditor.getValue();
            if (value) {
                widget.inputEditor.setValue(value);
            }
            widget.focusInput();
        }
        setValue(value) {
            this.widget.inputEditor.setValue(value);
            this.focus();
        }
        updateModel() {
            this.model ??= this.chatService.startSession(this._options.providerId, cancellation_1.CancellationToken.None);
            if (!this.model) {
                throw new Error('Could not start chat session');
            }
            this.widget.setModel(this.model, { inputValue: this._currentQuery });
        }
    };
    QuickChat = QuickChat_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, chatService_1.IChatService),
        __param(4, chat_1.IChatWidgetService),
        __param(5, layoutService_1.ILayoutService)
    ], QuickChat);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFF1aWNrLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC9icm93c2VyL2NoYXRRdWljay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBb0J6RixJQUFNLGdCQUFnQixHQUF0QixNQUFNLGdCQUFpQixTQUFRLHNCQUFVO1FBVy9DLFlBQ3FCLGlCQUFzRCxFQUM1RCxXQUEwQyxFQUNqQyxvQkFBNEQ7WUFFbkYsS0FBSyxFQUFFLENBQUM7WUFKNkIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUMzQyxnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUNoQix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBWG5FLGdCQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDMUQsZUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDO1FBYTdDLENBQUM7UUFFRCxJQUFJLE9BQU87WUFDVixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFFRCxJQUFJLE9BQU87WUFDVixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQWlDLENBQUM7WUFDOUQsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDWixPQUFPLEtBQUssQ0FBQzthQUNiO1lBQ0QsT0FBTyxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUVELE1BQU0sQ0FBQyxVQUFtQixFQUFFLEtBQTBCO1lBQ3JELDRGQUE0RjtZQUM1RixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2pCLElBQUksQ0FBQyxLQUFL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