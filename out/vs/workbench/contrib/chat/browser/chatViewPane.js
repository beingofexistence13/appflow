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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/common/keybinding", "vs/platform/log/common/log", "vs/platform/opener/common/opener", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/memento", "vs/workbench/common/theme", "vs/workbench/common/views", "vs/workbench/contrib/chat/browser/chatWidget", "vs/workbench/contrib/chat/common/chatService"], function (require, exports, cancellation_1, lifecycle_1, configuration_1, contextkey_1, contextView_1, instantiation_1, serviceCollection_1, keybinding_1, log_1, opener_1, storage_1, telemetry_1, colorRegistry_1, themeService_1, viewPane_1, memento_1, theme_1, views_1, chatWidget_1, chatService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChatViewPane = exports.CHAT_SIDEBAR_PANEL_ID = void 0;
    exports.CHAT_SIDEBAR_PANEL_ID = 'workbench.panel.chatSidebar';
    let ChatViewPane = class ChatViewPane extends viewPane_1.ViewPane {
        static { this.ID = 'workbench.panel.chat.view'; }
        get widget() { return this._widget; }
        constructor(chatViewOptions, options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, storageService, chatService, logService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.chatViewOptions = chatViewOptions;
            this.storageService = storageService;
            this.chatService = chatService;
            this.logService = logService;
            this.modelDisposables = this._register(new lifecycle_1.DisposableStore());
            // View state for the ViewPane is currently global per-provider basically, but some other strictly per-model state will require a separate memento.
            this.memento = new memento_1.Memento('interactive-session-view-' + this.chatViewOptions.providerId, this.storageService);
            this.viewState = this.memento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        updateModel(model) {
            this.modelDisposables.clear();
            model = model ?? (this.chatService.transferredSessionData?.sessionId
                ? this.chatService.getOrRestoreSession(this.chatService.transferredSessionData.sessionId)
                : this.chatService.startSession(this.chatViewOptions.providerId, cancellation_1.CancellationToken.None));
            if (!model) {
                throw new Error('Could not start chat session');
            }
            this._widget.setModel(model, { ...this.viewState });
            this.viewState.sessionId = model.sessionId;
        }
        renderBody(parent) {
            try {
                super.renderBody(parent);
                const scopedInstantiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this.scopedContextKeyService]));
                this._widget = this._register(scopedInstantiationService.createInstance(chatWidget_1.ChatWidget, { viewId: this.id }, {
                    listForeground: theme_1.SIDE_BAR_FOREGROUND,
                    listBackground: this.getBackgroundColor(),
                    inputEditorBackground: this.getBackgroundColor(),
                    resultEditorBackground: colorRegistry_1.editorBackground
                }));
                this._register(this.onDidChangeBodyVisibility(visible => {
                    this._widget.setVisible(visible);
                }));
                this._register(this._widget.onDidClear(() => this.clear()));
                this._widget.render(parent);
                let sessionId;
                if (this.chatService.transferredSessionData) {
                    sessionId = this.chatService.transferredSessionData.sessionId;
                    this.viewState.inputValue = this.chatService.transferredSessionData.inputValue;
                }
                else {
                    sessionId = this.viewState.sessionId;
                }
                const initialModel = sessionId ? this.chatService.getOrRestoreSession(sessionId) : undefined;
                this.updateModel(initialModel);
            }
            catch (e) {
                this.logService.error(e);
                throw e;
            }
        }
        acceptInput(query) {
            this._widget.acceptInput(query);
        }
        async clear() {
            if (this.widget.viewModel) {
                this.chatService.clearSession(this.widget.viewModel.sessionId);
            }
            this.viewState.inputValue = '';
            this.updateModel();
        }
        loadSession(sessionId) {
            if (this.widget.viewModel) {
                this.chatService.clearSession(this.widget.viewModel.sessionId);
            }
            const newModel = this.chatService.getOrRestoreSession(sessionId);
            this.updateModel(newModel);
        }
        focusInput() {
            this._widget.focusInput();
        }
        focus() {
            super.focus();
            this._widget.focusInput();
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            this._widget.layout(height, width);
        }
        saveState() {
            if (this._widget) {
                // Since input history is per-provider, this is handled by a separate service and not the memento here.
                // TODO multiple chat views will overwrite each other
                this._widget.saveState();
                const widgetViewState = this._widget.getViewState();
                this.viewState.inputValue = widgetViewState.inputValue;
                this.memento.saveMemento();
            }
            super.saveState();
        }
    };
    exports.ChatViewPane = ChatViewPane;
    exports.ChatViewPane = ChatViewPane = __decorate([
        __param(2, keybinding_1.IKeybindingService),
        __param(3, contextView_1.IContextMenuService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, contextkey_1.IContextKeyService),
        __param(6, views_1.IViewDescriptorService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, opener_1.IOpenerService),
        __param(9, themeService_1.IThemeService),
        __param(10, telemetry_1.ITelemetryService),
        __param(11, storage_1.IStorageService),
        __param(12, chatService_1.IChatService),
        __param(13, log_1.ILogService)
    ], ChatViewPane);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFZpZXdQYW5lLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC9icm93c2VyL2NoYXRWaWV3UGFuZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFpQ25GLFFBQUEscUJBQXFCLEdBQUcsNkJBQTZCLENBQUM7SUFDNUQsSUFBTSxZQUFZLEdBQWxCLE1BQU0sWUFBYSxTQUFRLG1CQUFRO2lCQUNsQyxPQUFFLEdBQUcsMkJBQTJCLEFBQTlCLENBQStCO1FBR3hDLElBQUksTUFBTSxLQUFpQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBTWpELFlBQ2tCLGVBQWlDLEVBQ2xELE9BQXlCLEVBQ0wsaUJBQXFDLEVBQ3BDLGtCQUF1QyxFQUNyQyxvQkFBMkMsRUFDOUMsaUJBQXFDLEVBQ2pDLHFCQUE2QyxFQUM5QyxvQkFBMkMsRUFDbEQsYUFBNkIsRUFDOUIsWUFBMkIsRUFDdkIsZ0JBQW1DLEVBQ3JDLGNBQWdELEVBQ25ELFdBQTBDLEVBQzNDLFVBQXdDO1lBRXJELEtBQUssQ0FBQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsa0JBQWtCLEVBQUUsb0JBQW9CLEVBQUUsaUJBQWlCLEVBQUUscUJBQXFCLEVBQUUsb0JBQW9CLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBZjFLLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQVdoQixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDbEMsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDMUIsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQWxCOUMscUJBQWdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDJCQUFlLEVBQUUsQ0FBQyxDQUFDO1lBc0JoRSxtSkFBbUo7WUFDbkosSUFBSSxDQUFDLE9BQU8sR0FBRyxJ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