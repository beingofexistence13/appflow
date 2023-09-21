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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/aria/aria", "vs/base/common/event", "vs/base/common/history", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/common/services/model", "vs/nls", "vs/platform/actions/browser/toolbar", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/history/browser/contextScopedHistoryWidget", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/common/keybinding", "vs/workbench/browser/style", "vs/workbench/contrib/codeEditor/browser/simpleEditorOptions", "vs/workbench/contrib/chat/browser/chatFollowups", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatWidgetHistoryService", "vs/platform/accessibility/common/accessibility", "vs/base/common/platform"], function (require, exports, dom, aria, event_1, history_1, lifecycle_1, uri_1, codeEditorWidget_1, model_1, nls_1, toolbar_1, actions_1, configuration_1, contextkey_1, contextScopedHistoryWidget_1, instantiation_1, serviceCollection_1, keybinding_1, style_1, simpleEditorOptions_1, chatFollowups_1, chatContextKeys_1, chatWidgetHistoryService_1, accessibility_1, platform_1) {
    "use strict";
    var ChatInputPart_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChatInputPart = void 0;
    const $ = dom.$;
    const INPUT_EDITOR_MAX_HEIGHT = 250;
    let ChatInputPart = class ChatInputPart extends lifecycle_1.Disposable {
        static { ChatInputPart_1 = this; }
        static { this.INPUT_SCHEME = 'chatSessionInput'; }
        static { this._counter = 0; }
        get inputEditor() {
            return this._inputEditor;
        }
        constructor(
        // private readonly editorOptions: ChatEditorOptions, // TODO this should be used
        options, historyService, modelService, instantiationService, contextKeyService, configurationService, keybindingService, accessibilityService) {
            super();
            this.options = options;
            this.historyService = historyService;
            this.modelService = modelService;
            this.instantiationService = instantiationService;
            this.contextKeyService = contextKeyService;
            this.configurationService = configurationService;
            this.keybindingService = keybindingService;
            this.accessibilityService = accessibilityService;
            this._onDidChangeHeight = this._register(new event_1.Emitter());
            this.onDidChangeHeight = this._onDidChangeHeight.event;
            this._onDidFocus = this._register(new event_1.Emitter());
            this.onDidFocus = this._onDidFocus.event;
            this._onDidBlur = this._register(new event_1.Emitter());
            this.onDidBlur = this._onDidBlur.event;
            this._onDidAcceptFollowup = this._register(new event_1.Emitter());
            this.onDidAcceptFollowup = this._onDidAcceptFollowup.event;
            this.inputEditorHeight = 0;
            this.followupsDisposables = this._register(new lifecycle_1.DisposableStore());
            this.inputUri = uri_1.URI.parse(`${ChatInputPart_1.INPUT_SCHEME}:input-${ChatInputPart_1._counter++}`);
            this.inputEditorHasText = chatContextKeys_1.CONTEXT_CHAT_INPUT_HAS_TEXT.bindTo(contextKeyService);
            this.history = new history_1.HistoryNavigator([], 5);
            this._register(this.historyService.onDidClearHistory(() => this.history.clear()));
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("accessibility.verbosity.panelChat" /* AccessibilityVerbositySettingId.Chat */)) {
                    this.inputEditor.updateOptions({ ariaLabel: this._getAriaLabel() });
                }
            }));
        }
        _getAriaLabel() {
            const verbose = this.configurationService.getValue("accessibility.verbosity.panelChat" /* AccessibilityVerbositySettingId.Chat */);
            if (verbose) {
                const kbLabel = this.keybindingService.lookupKeybinding("editor.action.accessibilityHelp" /* AccessibilityCommandId.OpenAccessibilityHelp */)?.getLabel();
                return kbLabel ? (0, nls_1.localize)('actions.chat.accessibiltyHelp', "Chat Input,  Type to ask questions or type / for topics, press enter to send out the request. Use {0} for Chat Accessibility Help.", kbLabel) : (0, nls_1.localize)('chatInput.accessibilityHelpNoKb', "Chat Input,  Type code here and press Enter to run. Use the Chat Accessibility Help command for more information.");
            }
            return (0, nls_1.localize)('chatInput', "Chat Input");
        }
        setState(providerId, inputValue) {
            this.providerId = providerId;
            const history = this.historyService.getHistory(providerId);
            this.history = new history_1.HistoryNavigator(history, 50);
            this.setValue(inputValue);
        }
        get element() {
            return this.container;
        }
        showPreviousValue() {
            this.navigateHistory(true);
        }
        showNextValue() {
            this.navigateHistory(false);
        }
        navigateHistory(previous) {
            const historyInput = (previous ?
                (this.history.previous() ?? this.history.first()) : this.history.next())
                ?? '';
            aria.status(historyInput);
            this.setValue(historyInput);
            this.setHistoryNavigationEnablement(true);
        }
        setValue(value) {
            this.inputEditor.setValue(value);
            // always leave cursor at the end
            this.inputEditor.setPosition({ lineNumber: 1, column: value.length + 1 });
        }
        focus() {
            this._inputEditor.focus();
        }
        hasFocus() {
            return this._inputEditor.hasWidgetFocus();
        }
        async acceptInput(query) {
            const editorValue = this._inputEditor.getValue();
            if (!query && editorValue) {
                // Followups and programmatic messages don't go to history
                this.history.add(editorValue);
            }
            if (this.accessibilityService.isScreenReaderOptimized() && platform_1.isMacintosh) {
                this._acceptInputForVoiceover();
            }
            else {
                this._inputEditor.focus();
                this._inputEditor.setValue('');
            }
        }
        _acceptInputForVoiceover() {
            const domNode = this._inputEditor.getDomNode();
            if (!domNode) {
                return;
            }
            // Remove the input editor from the DOM temporarily to prevent VoiceOver
            // from reading the cleared text (the request) to the user.
            this._inputEditorElement.removeChild(domNode);
            this._inputEditor.setValue('');
            this._inputEditorElement.appendChild(domNode);
            this._inputEditor.focus();
        }
        render(container, initialValue, widget) {
            this.container = dom.append(container, $('.interactive-input-part'));
            this.followupsContainer = dom.append(this.container, $('.interactive-input-followups'));
            const inputAndSideToolbar = dom.append(this.container, $('.interactive-input-and-side-toolbar'));
            const inputContainer = dom.append(inputAndSideToolbar, $('.interactive-input-and-execute-toolbar'));
            const inputScopedContextKeyService = this._register(this.contextKeyService.createScoped(inputContainer));
            chatContextKeys_1.CONTEXT_IN_CHAT_INPUT.bindTo(inputScopedContextKeyService).set(true);
            const scopedInstantiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, inputScopedContextKeyService]));
            const { historyNavigationBackwardsEnablement, historyNavigationForwardsEnablement } = this._register((0, contextScopedHistoryWidget_1.registerAndCreateHistoryNavigationContext)(inputScopedContextKeyService, this));
            this.setHistoryNavigationEnablement = enabled => {
                historyNavigationBackwardsEnablement.set(enabled);
                historyNavigationForwardsEnablement.set(enabled);
            };
            const options = (0, simpleEditorOptions_1.getSimpleEditorOptions)(this.configurationService);
            options.readOnly = false;
            options.ariaLabel = this._getAriaLabel();
            options.fontFamily = style_1.DEFAULT_FONT_FAMILY;
            options.fontSize = 13;
            options.lineHeight = 20;
            options.padding = this.options.renderStyle === 'compact' ? { top: 2, bottom: 2 } : { top: 8, bottom: 8 };
            options.cursorWidth = 1;
            options.wrappingStrategy = 'advanced';
            options.bracketPairColorization = { enabled: false };
            options.suggest = { showIcons: false };
            options.scrollbar = { ...(options.scrollbar ?? {}), vertical: 'hidden' };
            this._inputEditorElement = dom.append(inputContainer, $('.interactive-input-editor'));
            this._inputEditor = this._register(scopedInstantiationService.createInstance(codeEditorWidget_1.CodeEditorWidget, this._inputEditorElement, options, (0, simpleEditorOptions_1.getSimpleCodeEditorWidgetOptions)()));
            this._register(this._inputEditor.onDidChangeModelContent(() => {
                const currentHeight = Math.min(this._inputEditor.getContentHeight(), INPUT_EDITOR_MAX_HEIGHT);
                if (currentHeight !== this.inputEditorHeight) {
                    this.inputEditorHeight = currentHeight;
                    this._onDidChangeHeight.fire();
                }
                // Only allow history navigation when the input is empty.
                // (If this model change happened as a result of a history navigation, this is canceled out by a call in this.navigateHistory)
                const model = this._inputEditor.getModel();
                const inputHasText = !!model && model.getValueLength() > 0;
                this.setHistoryNavigationEnablement(!inputHasText);
                this.inputEditorHasText.set(inputHasText);
            }));
            this._register(this._inputEditor.onDidFocusEditorText(() => {
                this._onDidFocus.fire();
                inputContainer.classList.toggle('focused', true);
            }));
            this._register(this._inputEditor.onDidBlurEditorText(() => {
                inputContainer.classList.toggle('focused', false);
                this._onDidBlur.fire();
            }));
            this.toolbar = this._register(this.instantiationService.createInstance(toolbar_1.MenuWorkbenchToolBar, inputContainer, actions_1.MenuId.ChatExecute, {
                menuOptions: {
                    shouldForwardArgs: true
                }
            }));
            this.toolbar.getElement().classList.add('interactive-execute-toolbar');
            this.toolbar.context = { widget };
            if (this.options.renderStyle === 'compact') {
                const toolbarSide = this._register(this.instantiationService.createInstance(toolbar_1.MenuWorkbenchToolBar, inputAndSideToolbar, actions_1.MenuId.ChatInputSide, {
                    menuOptions: {
                        shouldForwardArgs: true
                    }
                }));
                toolbarSide.getElement().classList.add('chat-side-toolbar');
                toolbarSide.context = { widget };
            }
            this.inputModel = this.modelService.getModel(this.inputUri) || this.modelService.createModel('', null, this.inputUri, true);
            this.inputModel.updateOptions({ bracketColorizationOptions: { enabled: false, independentColorPoolPerBracketType: false } });
            this._inputEditor.setModel(this.inputModel);
            if (initialValue) {
                this.inputModel.setValue(initialValue);
                const lineNumber = this.inputModel.getLineCount();
                this._inputEditor.setPosition({ lineNumber, column: this.inputModel.getLineMaxColumn(lineNumber) });
            }
        }
        async renderFollowups(items) {
            if (!this.options.renderFollowups) {
                return;
            }
            this.followupsDisposables.clear();
            dom.clearNode(this.followupsContainer);
            if (items && items.length > 0) {
                this.followupsDisposables.add(new chatFollowups_1.ChatFollowups(this.followupsContainer, items, undefined, followup => this._onDidAcceptFollowup.fire(followup), this.contextKeyService));
            }
        }
        layout(height, width) {
            return this._layout(height, width);
        }
        _layout(height, width, allowRecurse = true) {
            const followupsHeight = this.followupsContainer.offsetHeight;
            const inputPartBorder = 1;
            const inputPartHorizontalPadding = 40;
            const inputPartVerticalPadding = 24;
            const inputEditorHeight = Math.min(this._inputEditor.getContentHeight(), height - followupsHeight - inputPartHorizontalPadding - inputPartBorder, INPUT_EDITOR_MAX_HEIGHT);
            const inputEditorBorder = 2;
            const inputPartHeight = followupsHeight + inputEditorHeight + inputPartVerticalPadding + inputPartBorder + inputEditorBorder;
            const editorBorder = 2;
            const editorPadding = 8;
            const executeToolbarWidth = this.toolbar.getItemsWidth();
            const sideToolbarWidth = this.options.renderStyle === 'compact' ? 20 : 0;
            const initialEditorScrollWidth = this._inputEditor.getScrollWidth();
            this._inputEditor.layout({ width: width - inputPartHorizontalPadding - editorBorder - editorPadding - executeToolbarWidth - sideToolbarWidth, height: inputEditorHeight });
            if (allowRecurse && initialEditorScrollWidth < 10) {
                // This is probably the initial layout. Now that the editor is layed out with its correct width, it should report the correct contentHeight
                return this._layout(height, width, false);
            }
            return inputPartHeight;
        }
        saveState() {
            const inputHistory = this.history.getHistory();
            this.historyService.saveHistory(this.providerId, inputHistory);
        }
    };
    exports.ChatInputPart = ChatInputPart;
    exports.ChatInputPart = ChatInputPart = ChatInputPart_1 = __decorate([
        __param(1, chatWidgetHistoryService_1.IChatWidgetHistoryService),
        __param(2, model_1.IModelService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, keybinding_1.IKeybindingService),
        __param(7, accessibility_1.IAccessibilityService)
    ], ChatInputPart);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdElucHV0UGFydC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NoYXQvYnJvd3Nlci9jaGF0SW5wdXRQYXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFrQ2hHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFaEIsTUFBTSx1QkFBdUIsR0FBRyxHQUFHLENBQUM7SUFFN0IsSUFBTSxhQUFhLEdBQW5CLE1BQU0sYUFBYyxTQUFRLHNCQUFVOztpQkFDNUIsaUJBQVksR0FBRyxrQkFBa0IsQUFBckIsQ0FBc0I7aUJBQ25DLGFBQVEsR0FBRyxDQUFDLEFBQUosQ0FBSztRQXlCNUIsSUFBSSxXQUFXO1lBQ2QsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQzFCLENBQUM7UUFVRDtRQUNDLGlGQUFpRjtRQUNoRSxPQUEwRSxFQUNoRSxjQUEwRCxFQUN0RSxZQUE0QyxFQUNwQyxvQkFBNEQsRUFDL0QsaUJBQXNELEVBQ25ELG9CQUE0RCxFQUMvRCxpQkFBc0QsRUFDbkQsb0JBQTREO1lBRW5GLEtBQUssRUFBRSxDQUFDO1lBVFMsWUFBTyxHQUFQLE9BQU8sQ0FBbUU7WUFDL0MsbUJBQWMsR0FBZCxjQUFjLENBQTJCO1lBQ3JELGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ25CLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDOUMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUNsQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQzlDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDbEMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQTVDNUUsdUJBQWtCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDeEQsc0JBQWlCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQztZQUVuRCxnQkFBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQ2pELGVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQztZQUVyQyxlQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDaEQsY0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDO1lBRW5DLHlCQUFvQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQXNCLENBQUMsQ0FBQztZQUN4RSx3QkFBbUIsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDO1lBRXZELHNCQUFpQixHQUFHLENBQUMsQ0FBQztZQUl0Qix5QkFBb0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQWUsRUFBRSxDQUFDLENBQUM7WUFpQjVELGFBQVEsR0FBRyxTQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsZUFBYSxDQUFDLFlBQVksVUFBVSxlQUFhLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBZWhHLElBQUksQ0FBQyxrQkFBa0IsR0FBRyw2Q0FBMkIsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksMEJBQWdCLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzNDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDckUsSUFBSSxDQUFDLENBQUMsb0JBQW9CLGdGQUFzQyxFQUFFO29CQUNqRSxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2lCQUNwRTtZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRU8sYUFBYTtZQUNwQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxnRkFBK0MsQ0FBQztZQUNsRyxJQUFJLE9BQU8sRUFBRTtnQkFDWixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsZ0JBQWdCLHNGQUE4QyxFQUFFLFFBQVEsRUFBRSxDQUFDO2dCQUNsSCxPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBQSxjQUFRLEVBQUMsK0JBQStCLEVBQUUsb0lBQW9JLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUEsY0FBUSxFQUFDLGlDQUFpQyxFQUFFLG1IQUFtSCxDQUFDLENBQUM7YUFDN1c7WUFDRCxPQUFPLElBQUEsY0FBUSxFQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBRUQsUUFBUSxDQUFDLFVBQWtCLEVBQUUsVUFBa0I7WUFDOUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7WUFDN0IsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDM0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLDBCQUFnQixDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztZQUVqRCxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzNCLENBQUM7UUFFRCxJQUFJLE9BQU87WUFDVixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDdkIsQ0FBQztRQUVELGlCQUFpQjtZQUNoQixJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVCLENBQUM7UUFFRCxhQUFhO1lBQ1osSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM3QixDQUFDO1FBRU8sZUFBZSxDQUFDLFFBQWlCO1lBQ3hDLE1BQU0sWUFBWSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQy9CLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7bUJBQ3JFLEVBQUUsQ0FBQztZQUVQLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUM1QixJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0MsQ0FBQztRQUVELFFBQVEsQ0FBQyxLQUFhO1lBQ3JCLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2pDLGlDQUFpQztZQUNqQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMzRSxDQUFDO1FBRUQsS0FBSztZQUNKLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUVELFFBQVE7WUFDUCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDM0MsQ0FBQztRQUVELEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBbUM7WUFDcEQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNqRCxJQUFJLENBQUMsS0FBSyxJQUFJLFdBQVcsRUFBRTtnQkFDMUIsMERBQTBEO2dCQUMxRCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUM5QjtZQUVELElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLHVCQUF1QixFQUFFLElBQUksc0JBQVcsRUFBRTtnQkFDdkUsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7YUFDaEM7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDMUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDL0I7UUFDRixDQUFDO1FBRU8sd0JBQXdCO1lBQy9CLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDL0MsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDYixPQUFPO2FBQ1A7WUFDRCx3RUFBd0U7WUFDeEUsMkRBQTJEO1lBQzNELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDL0IsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFFRCxNQUFNLENBQUMsU0FBc0IsRUFBRSxZQUFvQixFQUFFLE1BQW1CO1lBQ3ZFLElBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQztZQUVyRSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLENBQUM7WUFDeEYsTUFBTSxtQkFBbUIsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLHFDQUFxQyxDQUFDLENBQUMsQ0FBQztZQUNqRyxNQUFNLGNBQWMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDLENBQUM7WUFFcEcsTUFBTSw0QkFBNEIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUN6Ryx1Q0FBcUIsQ0FBQyxNQUFNLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckUsTUFBTSwwQkFBMEIsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLElBQUkscUNBQWlCLENBQUMsQ0FBQywrQkFBa0IsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVwSixNQUFNLEVBQUUsb0NBQW9DLEVBQUUsbUNBQW1DLEVBQUUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUEsc0VBQXlDLEVBQUMsNEJBQTRCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNwTCxJQUFJLENBQUMsOEJBQThCLEdBQUcsT0FBTyxDQUFDLEVBQUU7Z0JBQy9DLG9DQUFvQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDbEQsbUNBQW1DLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2xELENBQUMsQ0FBQztZQUVGLE1BQU0sT0FBTyxHQUFHLElBQUEsNENBQXNCLEVBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDbEUsT0FBTyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7WUFDekIsT0FBTyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDekMsT0FBTyxDQUFDLFVBQVUsR0FBRywyQkFBbUIsQ0FBQztZQUN6QyxPQUFPLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztZQUN0QixPQUFPLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztZQUN4QixPQUFPLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUN6RyxPQUFPLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztZQUN4QixPQUFPLENBQUMsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDO1lBQ3RDLE9BQU8sQ0FBQyx1QkFBdUIsR0FBRyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQztZQUNyRCxPQUFPLENBQUMsT0FBTyxHQUFHLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDO1lBQ3ZDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsSUFBSSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUM7WUFFekUsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUM7WUFDdEYsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLDBCQUEwQixDQUFDLGNBQWMsQ0FBQyxtQ0FBZ0IsRUFBRSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsT0FBTyxFQUFFLElBQUEsc0RBQWdDLEdBQUUsQ0FBQyxDQUFDLENBQUM7WUFFdkssSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsRUFBRTtnQkFDN0QsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztnQkFDOUYsSUFBSSxhQUFhLEtBQUssSUFBSSxDQUFDLGlCQUFpQixFQUFFO29CQUM3QyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsYUFBYSxDQUFDO29CQUN2QyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLENBQUM7aUJBQy9CO2dCQUVELHlEQUF5RDtnQkFDekQsOEhBQThIO2dCQUM5SCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUMzQyxNQUFNLFlBQVksR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQzNELElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUNuRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzNDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsb0JBQW9CLENBQUMsR0FBRyxFQUFFO2dCQUMxRCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUN4QixjQUFjLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDbEQsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3pELGNBQWMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFFbEQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN4QixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsOEJBQW9CLEVBQUUsY0FBYyxFQUFFLGdCQUFNLENBQUMsV0FBVyxFQUFFO2dCQUNoSSxXQUFXLEVBQUU7b0JBQ1osaUJBQWlCLEVBQUUsSUFBSTtpQkFDdkI7YUFDRCxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1lBQ3ZFLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUE4QixFQUFFLE1BQU0sRUFBRSxDQUFDO1lBRTdELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEtBQUssU0FBUyxFQUFFO2dCQUMzQyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsOEJBQW9CLEVBQUUsbUJBQW1CLEVBQUUsZ0JBQU0sQ0FBQyxhQUFhLEVBQUU7b0JBQzVJLFdBQVcsRUFBRTt3QkFDWixpQkFBaUIsRUFBRSxJQUFJO3FCQUN2QjtpQkFDRCxDQUFDLENBQUMsQ0FBQztnQkFDSixXQUFXLENBQUMsVUFBVSxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO2dCQUM1RCxXQUFXLENBQUMsT0FBTyxHQUE4QixFQUFFLE1BQU0sRUFBRSxDQUFDO2FBQzVEO1lBRUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzVILElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLEVBQUUsMEJBQTBCLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLGtDQUFrQyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM3SCxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDNUMsSUFBSSxZQUFZLEVBQUU7Z0JBQ2pCLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUN2QyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUNsRCxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDcEc7UUFDRixDQUFDO1FBRUQsS0FBSyxDQUFDLGVBQWUsQ0FBQyxLQUE0QjtZQUNqRCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUU7Z0JBQ2xDLE9BQU87YUFDUDtZQUNELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNsQyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBRXZDLElBQUksS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUM5QixJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLElBQUksNkJBQWEsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQzthQUMxSztRQUNGLENBQUM7UUFFRCxNQUFNLENBQUMsTUFBYyxFQUFFLEtBQWE7WUFDbkMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNwQyxDQUFDO1FBRU8sT0FBTyxDQUFDLE1BQWMsRUFBRSxLQUFhLEVBQUUsWUFBWSxHQUFHLElBQUk7WUFDakUsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQztZQUU3RCxNQUFNLGVBQWUsR0FBRyxDQUFDLENBQUM7WUFDMUIsTUFBTSwwQkFBMEIsR0FBRyxFQUFFLENBQUM7WUFDdEMsTUFBTSx3QkFBd0IsR0FBRyxFQUFFLENBQUM7WUFDcEMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxNQUFNLEdBQUcsZUFBZSxHQUFHLDBCQUEwQixHQUFHLGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO1lBRTNLLE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxDQUFDO1lBQzVCLE1BQU0sZUFBZSxHQUFHLGVBQWUsR0FBRyxpQkFBaUIsR0FBRyx3QkFBd0IsR0FBRyxlQUFlLEdBQUcsaUJBQWlCLENBQUM7WUFFN0gsTUFBTSxZQUFZLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZCLE1BQU0sYUFBYSxHQUFHLENBQUMsQ0FBQztZQUN4QixNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDekQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXpFLE1BQU0sd0JBQXdCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUNwRSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLEdBQUcsMEJBQTBCLEdBQUcsWUFBWSxHQUFHLGFBQWEsR0FBRyxtQkFBbUIsR0FBRyxnQkFBZ0IsRUFBRSxNQUFNLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO1lBRTNLLElBQUksWUFBWSxJQUFJLHdCQUF3QixHQUFHLEVBQUUsRUFBRTtnQkFDbEQsMklBQTJJO2dCQUMzSSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQzthQUMxQztZQUVELE9BQU8sZUFBZSxDQUFDO1FBQ3hCLENBQUM7UUFFRCxTQUFTO1lBQ1IsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUMvQyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ2pFLENBQUM7O0lBbFJXLHNDQUFhOzRCQUFiLGFBQWE7UUEwQ3ZCLFdBQUEsb0RBQXlCLENBQUE7UUFDekIsV0FBQSxxQkFBYSxDQUFBO1FBQ2IsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLCtCQUFrQixDQUFBO1FBQ2xCLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSwrQkFBa0IsQ0FBQTtRQUNsQixXQUFBLHFDQUFxQixDQUFBO09BaERYLGFBQWEsQ0FtUnpCIn0=