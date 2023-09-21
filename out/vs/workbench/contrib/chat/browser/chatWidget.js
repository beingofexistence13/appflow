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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/list/browser/listService", "vs/workbench/common/views", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/browser/chatInputPart", "vs/workbench/contrib/chat/browser/chatListRenderer", "vs/workbench/contrib/chat/browser/chatOptions", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatContributionService", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/contrib/chat/common/chatViewModel", "vs/css!./media/chat"], function (require, exports, dom, async_1, cancellation_1, event_1, lifecycle_1, resources_1, actions_1, contextkey_1, contextView_1, instantiation_1, serviceCollection_1, listService_1, views_1, chat_1, chatInputPart_1, chatListRenderer_1, chatOptions_1, chatContextKeys_1, chatContributionService_1, chatService_1, chatViewModel_1) {
    "use strict";
    var ChatWidget_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChatWidgetService = exports.ChatWidget = void 0;
    const $ = dom.$;
    function revealLastElement(list) {
        list.scrollTop = list.scrollHeight - list.renderHeight;
    }
    let ChatWidget = class ChatWidget extends lifecycle_1.Disposable {
        static { ChatWidget_1 = this; }
        static { this.CONTRIBS = []; }
        get visible() {
            return this._visible;
        }
        set viewModel(viewModel) {
            if (this._viewModel === viewModel) {
                return;
            }
            this.viewModelDisposables.clear();
            this._viewModel = viewModel;
            if (viewModel) {
                this.viewModelDisposables.add(viewModel);
            }
            this.slashCommandsPromise = undefined;
            this.lastSlashCommands = undefined;
            this.getSlashCommands().then(() => {
                if (!this._isDisposed) {
                    this.onDidChangeItems();
                }
            });
            this._onDidChangeViewModel.fire();
        }
        get viewModel() {
            return this._viewModel;
        }
        constructor(viewContext, styles, contextKeyService, instantiationService, chatService, chatWidgetService, contextMenuService, _chatAccessibilityService, _instantiationService) {
            super();
            this.viewContext = viewContext;
            this.styles = styles;
            this.contextKeyService = contextKeyService;
            this.instantiationService = instantiationService;
            this.chatService = chatService;
            this.contextMenuService = contextMenuService;
            this._chatAccessibilityService = _chatAccessibilityService;
            this._instantiationService = _instantiationService;
            this._onDidFocus = this._register(new event_1.Emitter());
            this.onDidFocus = this._onDidFocus.event;
            this._onDidChangeViewModel = this._register(new event_1.Emitter());
            this.onDidChangeViewModel = this._onDidChangeViewModel.event;
            this._onDidClear = this._register(new event_1.Emitter());
            this.onDidClear = this._onDidClear.event;
            this._onDidAcceptInput = this._register(new event_1.Emitter());
            this.onDidAcceptInput = this._onDidAcceptInput.event;
            this._onDidChangeHeight = this._register(new event_1.Emitter());
            this.onDidChangeHeight = this._onDidChangeHeight.event;
            this.visibleChangeCount = 0;
            this._visible = false;
            this.previousTreeScrollHeight = 0;
            this.viewModelDisposables = this._register(new lifecycle_1.DisposableStore());
            this._isDisposed = false;
            chatContextKeys_1.CONTEXT_IN_CHAT_SESSION.bindTo(contextKeyService).set(true);
            this.chatListFocused = chatContextKeys_1.CONTEXT_IN_CHAT_LIST.bindTo(contextKeyService);
            this.requestInProgress = chatContextKeys_1.CONTEXT_CHAT_REQUEST_IN_PROGRESS.bindTo(contextKeyService);
            this._register(chatWidgetService.register(this));
        }
        get providerId() {
            return this.viewModel?.providerId || '';
        }
        get inputEditor() {
            return this.inputPart.inputEditor;
        }
        get inputUri() {
            return this.inputPart.inputUri;
        }
        dispose() {
            this._isDisposed = true;
            super.dispose();
        }
        render(parent) {
            const viewId = 'viewId' in this.viewContext ? this.viewContext.viewId : undefined;
            this.editorOptions = this._register(this.instantiationService.createInstance(chatOptions_1.ChatEditorOptions, viewId, this.styles.listForeground, this.styles.inputEditorBackground, this.styles.resultEditorBackground));
            const renderInputOnTop = this.viewContext.renderInputOnTop ?? false;
            const renderStyle = this.viewContext.renderStyle;
            this.container = dom.append(parent, $('.interactive-session'));
            if (renderInputOnTop) {
                this.createInput(this.container, { renderFollowups: false, renderStyle });
                this.listContainer = dom.append(this.container, $(`.interactive-list`));
            }
            else {
                this.listContainer = dom.append(this.container, $(`.interactive-list`));
                this.createInput(this.container);
            }
            this.createList(this.listContainer, { renderStyle });
            this._register(this.editorOptions.onDidChange(() => this.onDidStyleChange()));
            this.onDidStyleChange();
            // Do initial render
            if (this.viewModel) {
                this.onDidChangeItems();
                revealLastElement(this.tree);
            }
            ChatWidget_1.CONTRIBS.forEach(contrib => this._register(this.instantiationService.createInstance(contrib, this)));
        }
        focusInput() {
            this.inputPart.focus();
        }
        hasInputFocus() {
            return this.inputPart.hasFocus();
        }
        moveFocus(item, type) {
            const items = this.viewModel?.getItems();
            if (!items) {
                return;
            }
            const responseItems = items.filter(i => (0, chatViewModel_1.isResponseVM)(i));
            const targetIndex = responseItems.indexOf(item);
            if (targetIndex === undefined) {
                return;
            }
            const indexToFocus = type === 'next' ? targetIndex + 1 : targetIndex - 1;
            if (indexToFocus < 0 || indexToFocus > responseItems.length - 1) {
                return;
            }
            this.focus(responseItems[indexToFocus]);
        }
        clear() {
            if (this._dynamicMessageLayoutData) {
                this._dynamicMessageLayoutData.enabled = true;
            }
            this._onDidClear.fire();
        }
        onDidChangeItems(skipDynamicLayout) {
            if (this.tree && this._visible) {
                const treeItems = (this.viewModel?.getItems() ?? [])
                    .map(item => {
                    return {
                        element: item,
                        collapsed: false,
                        collapsible: false
                    };
                });
                this.tree.setChildren(null, treeItems, {
                    diffIdentityProvider: {
                        getId: (element) => {
                            return (((0, chatViewModel_1.isResponseVM)(element) || (0, chatViewModel_1.isRequestVM)(element)) ? element.dataId : element.id) +
                                // TODO? We can give the welcome message a proper VM or get rid of the rest of the VMs
                                (((0, chatViewModel_1.isWelcomeVM)(element) && !this.viewModel?.isInitialized) ? '_initializing' : '') +
                                // Ensure re-rendering an element once slash commands are loaded, so the colorization can be applied.
                                `${((0, chatViewModel_1.isRequestVM)(element) || (0, chatViewModel_1.isWelcomeVM)(element)) && !!this.lastSlashCommands ? '_scLoaded' : ''}` +
                                // If a response is in the process of progressive rendering, we need to ensure that it will
                                // be re-rendered so progressive rendering is restarted, even if the model wasn't updated.
                                `${(0, chatViewModel_1.isResponseVM)(element) && element.renderData ? `_${this.visibleChangeCount}` : ''}`;
                        },
                    }
                });
                if (!skipDynamicLayout && this._dynamicMessageLayoutData) {
                    this.layoutDynamicChatTreeItemMode();
                }
                const lastItem = treeItems[treeItems.length - 1]?.element;
                if (lastItem && (0, chatViewModel_1.isResponseVM)(lastItem) && lastItem.isComplete) {
                    this.renderFollowups(lastItem.replyFollowups);
                }
                else {
                    this.renderFollowups(undefined);
                }
            }
        }
        async renderFollowups(items) {
            this.inputPart.renderFollowups(items);
            if (this.bodyDimension) {
                this.layout(this.bodyDimension.height, this.bodyDimension.width);
            }
        }
        setVisible(visible) {
            this._visible = visible;
            this.visibleChangeCount++;
            this.renderer.setVisible(visible);
            if (visible) {
                this._register((0, async_1.disposableTimeout)(() => {
                    // Progressive rendering paused while hidden, so start it up again.
                    // Do it after a timeout because the container is not visible yet (it should be but offsetHeight returns 0 here)
                    if (this._visible) {
                        this.onDidChangeItems(true);
                    }
                }, 0));
            }
        }
        async getSlashCommands() {
            if (!this.viewModel) {
                return;
            }
            if (!this.slashCommandsPromise) {
                this.slashCommandsPromise = this.chatService.getSlashCommands(this.viewModel.sessionId, cancellation_1.CancellationToken.None).then(commands => {
                    this.lastSlashCommands = commands ?? [];
                    return this.lastSlashCommands;
                });
            }
            return this.slashCommandsPromise;
        }
        createList(listContainer, options) {
            const scopedInstantiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this.contextKeyService]));
            const delegate = scopedInstantiationService.createInstance(chatListRenderer_1.ChatListDelegate);
            const rendererDelegate = {
                getListLength: () => this.tree.getNode(null).visibleChildrenCount,
                getSlashCommands: () => this.lastSlashCommands ?? [],
            };
            this.renderer = this._register(scopedInstantiationService.createInstance(chatListRenderer_1.ChatListItemRenderer, this.editorOptions, options, rendererDelegate));
            this._register(this.renderer.onDidClickFollowup(item => {
                this.acceptInput(item);
            }));
            this.tree = scopedInstantiationService.createInstance(listService_1.WorkbenchObjectTree, 'Chat', listContainer, delegate, [this.renderer], {
                identityProvider: { getId: (e) => e.id },
                horizontalScrolling: false,
                supportDynamicHeights: true,
                hideTwistiesOfChildlessElements: true,
                accessibilityProvider: this._instantiationService.createInstance(chatListRenderer_1.ChatAccessibilityProvider),
                keyboardNavigationLabelProvider: { getKeyboardNavigationLabel: (e) => (0, chatViewModel_1.isRequestVM)(e) ? e.message : (0, chatViewModel_1.isResponseVM)(e) ? e.response.value : '' },
                setRowLineHeight: false,
                overrideStyles: {
                    listFocusBackground: this.styles.listBackground,
                    listInactiveFocusBackground: this.styles.listBackground,
                    listActiveSelectionBackground: this.styles.listBackground,
                    listFocusAndSelectionBackground: this.styles.listBackground,
                    listInactiveSelectionBackground: this.styles.listBackground,
                    listHoverBackground: this.styles.listBackground,
                    listBackground: this.styles.listBackground,
                    listFocusForeground: this.styles.listForeground,
                    listHoverForeground: this.styles.listForeground,
                    listInactiveFocusForeground: this.styles.listForeground,
                    listInactiveSelectionForeground: this.styles.listForeground,
                    listActiveSelectionForeground: this.styles.listForeground,
                    listFocusAndSelectionForeground: this.styles.listForeground,
                }
            });
            this.tree.onContextMenu(e => this.onContextMenu(e));
            this._register(this.tree.onDidChangeContentHeight(() => {
                this.onDidChangeTreeContentHeight();
            }));
            this._register(this.renderer.onDidChangeItemHeight(e => {
                this.tree.updateElementHeight(e.element, e.height);
            }));
            this._register(this.tree.onDidFocus(() => {
                this._onDidFocus.fire();
                this.chatListFocused.set(this.tree.isDOMFocused());
            }));
            this._register(this.tree.onDidBlur(() => this.chatListFocused.set(false)));
        }
        onContextMenu(e) {
            e.browserEvent.preventDefault();
            e.browserEvent.stopPropagation();
            this.contextMenuService.showContextMenu({
                menuId: actions_1.MenuId.ChatContext,
                menuActionOptions: { shouldForwardArgs: true },
                contextKeyService: this.contextKeyService,
                getAnchor: () => e.anchor,
                getActionsContext: () => e.element,
            });
        }
        onDidChangeTreeContentHeight() {
            if (this.tree.scrollHeight !== this.previousTreeScrollHeight) {
                // Due to rounding, the scrollTop + renderHeight will not exactly match the scrollHeight.
                // Consider the tree to be scrolled all the way down if it is within 2px of the bottom.
                const lastElementWasVisible = this.tree.scrollTop + this.tree.renderHeight >= this.previousTreeScrollHeight - 2;
                if (lastElementWasVisible) {
                    dom.scheduleAtNextAnimationFrame(() => {
                        // Can't set scrollTop during this event listener, the list might overwrite the change
                        revealLastElement(this.tree);
                    }, 0);
                }
            }
            this.previousTreeScrollHeight = this.tree.scrollHeight;
        }
        createInput(container, options) {
            this.inputPart = this._register(this.instantiationService.createInstance(chatInputPart_1.ChatInputPart, {
                renderFollowups: options?.renderFollowups ?? true,
                renderStyle: options?.renderStyle,
            }));
            this.inputPart.render(container, '', this);
            this._register(this.inputPart.onDidFocus(() => this._onDidFocus.fire()));
            this._register(this.inputPart.onDidAcceptFollowup(followup => this.acceptInput(followup)));
            this._register(this.inputPart.onDidChangeHeight(() => this.bodyDimension && this.layout(this.bodyDimension.height, this.bodyDimension.width)));
        }
        onDidStyleChange() {
            this.container.style.setProperty('--vscode-interactive-result-editor-background-color', this.editorOptions.configuration.resultEditor.backgroundColor?.toString() ?? '');
            this.container.style.setProperty('--vscode-interactive-session-foreground', this.editorOptions.configuration.foreground?.toString() ?? '');
        }
        setModel(model, viewState) {
            if (!this.container) {
                throw new Error('Call render() before setModel()');
            }
            this.container.setAttribute('data-session-id', model.sessionId);
            this.viewModel = this.instantiationService.createInstance(chatViewModel_1.ChatViewModel, model);
            this.viewModelDisposables.add(this.viewModel.onDidChange(e => {
                this.slashCommandsPromise = undefined;
                this.requestInProgress.set(this.viewModel.requestInProgress);
                this.onDidChangeItems();
                if (e?.kind === 'addRequest') {
                    revealLastElement(this.tree);
                    this.focusInput();
                }
            }));
            this.viewModelDisposables.add(this.viewModel.onDidDisposeModel(() => {
                // Disposes the viewmodel and listeners
                this.viewModel = undefined;
                this.onDidChangeItems();
            }));
            this.inputPart.setState(model.providerId, viewState.inputValue ?? '');
            if (this.tree) {
                this.onDidChangeItems();
                revealLastElement(this.tree);
            }
        }
        getFocus() {
            return this.tree.getFocus()[0] ?? undefined;
        }
        reveal(item) {
            this.tree.reveal(item);
        }
        focus(item) {
            const items = this.tree.getNode(null).children;
            const node = items.find(i => i.element?.id === item.id);
            if (!node) {
                return;
            }
            this.tree.setFocus([node.element]);
            this.tree.domFocus();
        }
        updateInput(value = '') {
            this.inputPart.setValue(value);
        }
        async acceptInput(query) {
            if (this.viewModel) {
                this._onDidAcceptInput.fire();
                const editorValue = this.inputPart.inputEditor.getValue();
                this._chatAccessibilityService.acceptRequest();
                const input = query ?? editorValue;
                const usedSlashCommand = this.lookupSlashCommand(typeof input === 'string' ? input : input.message);
                const result = await this.chatService.sendRequest(this.viewModel.sessionId, input, usedSlashCommand);
                if (result) {
                    this.inputPart.acceptInput(query);
                    result.responseCompletePromise.then(async () => {
                        const responses = this.viewModel?.getItems().filter(chatViewModel_1.isResponseVM);
                        const lastResponse = responses?.[responses.length - 1];
                        this._chatAccessibilityService.acceptResponse(lastResponse);
                    });
                }
                else {
                    this._chatAccessibilityService.acceptResponse();
                }
            }
        }
        lookupSlashCommand(input) {
            return this.lastSlashCommands?.find(sc => input.startsWith(`/${sc.command}`));
        }
        getCodeBlockInfosForResponse(response) {
            return this.renderer.getCodeBlockInfosForResponse(response);
        }
        getCodeBlockInfoForEditor(uri) {
            return this.renderer.getCodeBlockInfoForEditor(uri);
        }
        getFileTreeInfosForResponse(response) {
            return this.renderer.getFileTreeInfosForResponse(response);
        }
        getLastFocusedFileTreeForResponse(response) {
            return this.renderer.getLastFocusedFileTreeForResponse(response);
        }
        focusLastMessage() {
            if (!this.viewModel) {
                return;
            }
            const items = this.tree.getNode(null).children;
            const lastItem = items[items.length - 1];
            if (!lastItem) {
                return;
            }
            this.tree.setFocus([lastItem.element]);
            this.tree.domFocus();
        }
        layout(height, width) {
            width = Math.min(width, 850);
            this.bodyDimension = new dom.Dimension(width, height);
            const inputPartHeight = this.inputPart.layout(height, width);
            const lastElementVisible = this.tree.scrollTop + this.tree.renderHeight >= this.tree.scrollHeight;
            const listHeight = height - inputPartHeight;
            this.tree.layout(listHeight, width);
            this.tree.getHTMLElement().style.height = `${listHeight}px`;
            this.renderer.layout(width);
            if (lastElementVisible) {
                revealLastElement(this.tree);
            }
            this.listContainer.style.height = `${height - inputPartHeight}px`;
            this._onDidChangeHeight.fire(height);
        }
        // An alternative to layout, this allows you to specify the number of ChatTreeItems
        // you want to show, and the max height of the container. It will then layout the
        // tree to show that many items.
        // TODO@TylerLeonhardt: This could use some refactoring to make it clear which layout strategy is being used
        setDynamicChatTreeItemLayout(numOfChatTreeItems, maxHeight) {
            this._dynamicMessageLayoutData = { numOfMessages: numOfChatTreeItems, maxHeight, enabled: true };
            this._register(this.renderer.onDidChangeItemHeight(() => this.layoutDynamicChatTreeItemMode()));
            const mutableDisposable = this._register(new lifecycle_1.MutableDisposable());
            this._register(this.tree.onDidScroll((e) => {
                // TODO@TylerLeonhardt this should probably just be disposed when this is disabled
                // and then set up again when it is enabled again
                if (!this._dynamicMessageLayoutData?.enabled) {
                    return;
                }
                mutableDisposable.value = dom.scheduleAtNextAnimationFrame(() => {
                    if (!e.scrollTopChanged || e.heightChanged || e.scrollHeightChanged) {
                        return;
                    }
                    const renderHeight = e.height;
                    const diff = e.scrollHeight - renderHeight - e.scrollTop;
                    if (diff === 0) {
                        return;
                    }
                    const possibleMaxHeight = (this._dynamicMessageLayoutData?.maxHeight ?? maxHeight);
                    const width = this.bodyDimension?.width ?? this.container.offsetWidth;
                    const inputPartHeight = this.inputPart.layout(possibleMaxHeight, width);
                    const newHeight = Math.min(renderHeight + diff, possibleMaxHeight - inputPartHeight);
                    this.layout(newHeight + inputPartHeight, width);
                });
            }));
        }
        updateDynamicChatTreeItemLayout(numOfChatTreeItems, maxHeight) {
            this._dynamicMessageLayoutData = { numOfMessages: numOfChatTreeItems, maxHeight, enabled: true };
            let hasChanged = false;
            let height = this.bodyDimension.height;
            let width = this.bodyDimension.width;
            if (maxHeight < this.bodyDimension.height) {
                height = maxHeight;
                hasChanged = true;
            }
            const containerWidth = this.container.offsetWidth;
            if (this.bodyDimension?.width !== containerWidth) {
                width = containerWidth;
                hasChanged = true;
            }
            if (hasChanged) {
                this.layout(height, width);
            }
        }
        get isDynamicChatTreeItemLayoutEnabled() {
            return this._dynamicMessageLayoutData?.enabled ?? false;
        }
        set isDynamicChatTreeItemLayoutEnabled(value) {
            if (!this._dynamicMessageLayoutData) {
                return;
            }
            this._dynamicMessageLayoutData.enabled = value;
        }
        layoutDynamicChatTreeItemMode() {
            if (!this.viewModel || !this._dynamicMessageLayoutData?.enabled) {
                return;
            }
            const width = this.bodyDimension?.width ?? this.container.offsetWidth;
            const inputHeight = this.inputPart.layout(this._dynamicMessageLayoutData.maxHeight, width);
            const totalMessages = this.viewModel.getItems();
            // grab the last N messages
            const messages = totalMessages.slice(-this._dynamicMessageLayoutData.numOfMessages);
            const needsRerender = messages.some(m => m.currentRenderedHeight === undefined);
            const listHeight = needsRerender
                ? this._dynamicMessageLayoutData.maxHeight
                : messages.reduce((acc, message) => acc + message.currentRenderedHeight, 0);
            this.layout(Math.min(
            // we add an additional 18px in order to show that there is scrollable content
            inputHeight + listHeight + (totalMessages.length > 2 ? 18 : 0), this._dynamicMessageLayoutData.maxHeight), width);
            if (needsRerender || !listHeight) {
                // TODO: figure out a better place to reveal the last element
                revealLastElement(this.tree);
            }
        }
        saveState() {
            this.inputPart.saveState();
        }
        getViewState() {
            this.inputPart.saveState();
            return { inputValue: this.inputPart.inputEditor.getValue() };
        }
    };
    exports.ChatWidget = ChatWidget;
    exports.ChatWidget = ChatWidget = ChatWidget_1 = __decorate([
        __param(2, contextkey_1.IContextKeyService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, chatService_1.IChatService),
        __param(5, chat_1.IChatWidgetService),
        __param(6, contextView_1.IContextMenuService),
        __param(7, chat_1.IChatAccessibilityService),
        __param(8, instantiation_1.IInstantiationService)
    ], ChatWidget);
    let ChatWidgetService = class ChatWidgetService {
        get lastFocusedWidget() {
            return this._lastFocusedWidget;
        }
        constructor(viewsService, chatContributionService) {
            this.viewsService = viewsService;
            this.chatContributionService = chatContributionService;
            this._widgets = [];
            this._lastFocusedWidget = undefined;
        }
        getWidgetByInputUri(uri) {
            return this._widgets.find(w => (0, resources_1.isEqual)(w.inputUri, uri));
        }
        getWidgetBySessionId(sessionId) {
            return this._widgets.find(w => w.viewModel?.sessionId === sessionId);
        }
        async revealViewForProvider(providerId) {
            const viewId = this.chatContributionService.getViewIdForProvider(providerId);
            const view = await this.viewsService.openView(viewId);
            return view?.widget;
        }
        setLastFocusedWidget(widget) {
            if (widget === this._lastFocusedWidget) {
                return;
            }
            this._lastFocusedWidget = widget;
        }
        register(newWidget) {
            if (this._widgets.some(widget => widget === newWidget)) {
                throw new Error('Cannot register the same widget multiple times');
            }
            this._widgets.push(newWidget);
            return (0, lifecycle_1.combinedDisposable)(newWidget.onDidFocus(() => this.setLastFocusedWidget(newWidget)), (0, lifecycle_1.toDisposable)(() => this._widgets.splice(this._widgets.indexOf(newWidget), 1)));
        }
    };
    exports.ChatWidgetService = ChatWidgetService;
    exports.ChatWidgetService = ChatWidgetService = __decorate([
        __param(0, views_1.IViewsService),
        __param(1, chatContributionService_1.IChatContributionService)
    ], ChatWidgetService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFdpZGdldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NoYXQvYnJvd3Nlci9jaGF0V2lkZ2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUE4QmhHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFaEIsU0FBUyxpQkFBaUIsQ0FBQyxJQUE4QjtRQUN4RCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztJQUN4RCxDQUFDO0lBY00sSUFBTSxVQUFVLEdBQWhCLE1BQU0sVUFBVyxTQUFRLHNCQUFVOztpQkFDbEIsYUFBUSxHQUFtRCxFQUFFLEFBQXJELENBQXNEO1FBOEJyRixJQUFXLE9BQU87WUFDakIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3RCLENBQUM7UUFNRCxJQUFZLFNBQVMsQ0FBQyxTQUFvQztZQUN6RCxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssU0FBUyxFQUFFO2dCQUNsQyxPQUFPO2FBQ1A7WUFFRCxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxFQUFFLENBQUM7WUFFbEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7WUFDNUIsSUFBSSxTQUFTLEVBQUU7Z0JBQ2QsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUN6QztZQUVELElBQUksQ0FBQyxvQkFBb0IsR0FBRyxTQUFTLENBQUM7WUFDdEMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLFNBQVMsQ0FBQztZQUVuQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNqQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtvQkFDdEIsSUFBSSxD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