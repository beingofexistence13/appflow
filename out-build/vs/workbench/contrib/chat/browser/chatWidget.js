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
    var $zIb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$AIb = exports.$zIb = void 0;
    const $ = dom.$;
    function revealLastElement(list) {
        list.scrollTop = list.scrollHeight - list.renderHeight;
    }
    let $zIb = class $zIb extends lifecycle_1.$kc {
        static { $zIb_1 = this; }
        static { this.CONTRIBS = []; }
        get visible() {
            return this.C;
        }
        set viewModel(viewModel) {
            if (this.G === viewModel) {
                return;
            }
            this.F.clear();
            this.G = viewModel;
            if (viewModel) {
                this.F.add(viewModel);
            }
            this.I = undefined;
            this.H = undefined;
            this.getSlashCommands().then(() => {
                if (!this.S) {
                    this.U();
                }
            });
            this.b.fire();
        }
        get viewModel() {
            return this.G;
        }
        constructor(viewContext, L, M, N, O, chatWidgetService, P, Q, R) {
            super();
            this.viewContext = viewContext;
            this.L = L;
            this.M = M;
            this.N = N;
            this.O = O;
            this.P = P;
            this.Q = Q;
            this.R = R;
            this.a = this.B(new event_1.$fd());
            this.onDidFocus = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidChangeViewModel = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onDidClear = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onDidAcceptInput = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onDidChangeHeight = this.g.event;
            this.y = 0;
            this.C = false;
            this.D = 0;
            this.F = this.B(new lifecycle_1.$jc());
            this.S = false;
            chatContextKeys_1.$JGb.bindTo(M).set(true);
            this.J = chatContextKeys_1.$KGb.bindTo(M);
            this.z = chatContextKeys_1.$EGb.bindTo(M);
            this.B(chatWidgetService.register(this));
        }
        get providerId() {
            return this.viewModel?.providerId || '';
        }
        get inputEditor() {
            return this.n.inputEditor;
        }
        get inputUri() {
            return this.n.inputUri;
        }
        dispose() {
            this.S = true;
            super.dispose();
        }
        render(parent) {
            const viewId = 'viewId' in this.viewContext ? this.viewContext.viewId : undefined;
            this.r = this.B(this.N.createInstance(chatOptions_1.$VGb, viewId, this.L.listForeground, this.L.inputEditorBackground, this.L.resultEditorBackground));
            const renderInputOnTop = this.viewContext.renderInputOnTop ?? false;
            const renderStyle = this.viewContext.renderStyle;
            this.t = dom.$0O(parent, $('.interactive-session'));
            if (renderInputOnTop) {
                this.ab(this.t, { renderFollowups: false, renderStyle });
                this.s = dom.$0O(this.t, $(`.interactive-list`));
            }
            else {
                this.s = dom.$0O(this.t, $(`.interactive-list`));
                this.ab(this.t);
            }
            this.X(this.s, { renderStyle });
            this.B(this.r.onDidChange(() => this.bb()));
            this.bb();
            // Do initial render
            if (this.viewModel) {
                this.U();
                revealLastElement(this.h);
            }
            $zIb_1.CONTRIBS.forEach(contrib => this.B(this.N.createInstance(contrib, this)));
        }
        focusInput() {
            this.n.focus();
        }
        hasInputFocus() {
            return this.n.hasFocus();
        }
        moveFocus(item, type) {
            const items = this.viewModel?.getItems();
            if (!items) {
                return;
            }
            const responseItems = items.filter(i => (0, chatViewModel_1.$Iqb)(i));
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
            if (this.db) {
                this.db.enabled = true;
            }
            this.c.fire();
        }
        U(skipDynamicLayout) {
            if (this.h && this.C) {
                const treeItems = (this.viewModel?.getItems() ?? [])
                    .map(item => {
                    return {
                        element: item,
                        collapsed: false,
                        collapsible: false
                    };
                });
                this.h.setChildren(null, treeItems, {
                    diffIdentityProvider: {
                        getId: (element) => {
                            return (((0, chatViewModel_1.$Iqb)(element) || (0, chatViewModel_1.$Hqb)(element)) ? element.dataId : element.id) +
                                // TODO? We can give the welcome message a proper VM or get rid of the rest of the VMs
                                (((0, chatViewModel_1.$Jqb)(element) && !this.viewModel?.isInitialized) ? '_initializing' : '') +
                                // Ensure re-rendering an element once slash commands are loaded, so the colorization can be applied.
                                `${((0, chatViewModel_1.$Hqb)(element) || (0, chatViewModel_1.$Jqb)(element)) && !!this.H ? '_scLoaded' : ''}` +
                                // If a response is in the process of progressive rendering, we need to ensure that it will
                                // be re-rendered so progressive rendering is restarted, even if the model wasn't updated.
                                `${(0, chatViewModel_1.$Iqb)(element) && element.renderData ? `_${this.y}` : ''}`;
                        },
                    }
                });
                if (!skipDynamicLayout && this.db) {
                    this.layoutDynamicChatTreeItemMode();
                }
                const lastItem = treeItems[treeItems.length - 1]?.element;
                if (lastItem && (0, chatViewModel_1.$Iqb)(lastItem) && lastItem.isComplete) {
                    this.W(lastItem.replyFollowups);
                }
                else {
                    this.W(undefined);
                }
            }
        }
        async W(items) {
            this.n.renderFollowups(items);
            if (this.u) {
                this.layout(this.u.height, this.u.width);
            }
        }
        setVisible(visible) {
            this.C = visible;
            this.y++;
            this.j.setVisible(visible);
            if (visible) {
                this.B((0, async_1.$Ig)(() => {
                    // Progressive rendering paused while hidden, so start it up again.
                    // Do it after a timeout because the container is not visible yet (it should be but offsetHeight returns 0 here)
                    if (this.C) {
                        this.U(true);
                    }
                }, 0));
            }
        }
        async getSlashCommands() {
            if (!this.viewModel) {
                return;
            }
            if (!this.I) {
                this.I = this.O.getSlashCommands(this.viewModel.sessionId, cancellation_1.CancellationToken.None).then(commands => {
                    this.H = commands ?? [];
                    return this.H;
                });
            }
            return this.I;
        }
        X(listContainer, options) {
            const scopedInstantiationService = this.N.createChild(new serviceCollection_1.$zh([contextkey_1.$3i, this.M]));
            const delegate = scopedInstantiationService.createInstance(chatListRenderer_1.$vIb);
            const rendererDelegate = {
                getListLength: () => this.h.getNode(null).visibleChildrenCount,
                getSlashCommands: () => this.H ?? [],
            };
            this.j = this.B(scopedInstantiationService.createInstance(chatListRenderer_1.$uIb, this.r, options, rendererDelegate));
            this.B(this.j.onDidClickFollowup(item => {
                this.acceptInput(item);
            }));
            this.h = scopedInstantiationService.createInstance(listService_1.$t4, 'Chat', listContainer, delegate, [this.j], {
                identityProvider: { getId: (e) => e.id },
                horizontalScrolling: false,
                supportDynamicHeights: true,
                hideTwistiesOfChildlessElements: true,
                accessibilityProvider: this.R.createInstance(chatListRenderer_1.$wIb),
                keyboardNavigationLabelProvider: { getKeyboardNavigationLabel: (e) => (0, chatViewModel_1.$Hqb)(e) ? e.message : (0, chatViewModel_1.$Iqb)(e) ? e.response.value : '' },
                setRowLineHeight: false,
                overrideStyles: {
                    listFocusBackground: this.L.listBackground,
                    listInactiveFocusBackground: this.L.listBackground,
                    listActiveSelectionBackground: this.L.listBackground,
                    listFocusAndSelectionBackground: this.L.listBackground,
                    listInactiveSelectionBackground: this.L.listBackground,
                    listHoverBackground: this.L.listBackground,
                    listBackground: this.L.listBackground,
                    listFocusForeground: this.L.listForeground,
                    listHoverForeground: this.L.listForeground,
                    listInactiveFocusForeground: this.L.listForeground,
                    listInactiveSelectionForeground: this.L.listForeground,
                    listActiveSelectionForeground: this.L.listForeground,
                    listFocusAndSelectionForeground: this.L.listForeground,
                }
            });
            this.h.onContextMenu(e => this.Y(e));
            this.B(this.h.onDidChangeContentHeight(() => {
                this.Z();
            }));
            this.B(this.j.onDidChangeItemHeight(e => {
                this.h.updateElementHeight(e.element, e.height);
            }));
            this.B(this.h.onDidFocus(() => {
                this.a.fire();
                this.J.set(this.h.isDOMFocused());
            }));
            this.B(this.h.onDidBlur(() => this.J.set(false)));
        }
        Y(e) {
            e.browserEvent.preventDefault();
            e.browserEvent.stopPropagation();
            this.P.showContextMenu({
                menuId: actions_1.$Ru.ChatContext,
                menuActionOptions: { shouldForwardArgs: true },
                contextKeyService: this.M,
                getAnchor: () => e.anchor,
                getActionsContext: () => e.element,
            });
        }
        Z() {
            if (this.h.scrollHeight !== this.D) {
                // Due to rounding, the scrollTop + renderHeight will not exactly match the scrollHeight.
                // Consider the tree to be scrolled all the way down if it is within 2px of the bottom.
                const lastElementWasVisible = this.h.scrollTop + this.h.renderHeight >= this.D - 2;
                if (lastElementWasVisible) {
                    dom.$vO(() => {
                        // Can't set scrollTop during this event listener, the list might overwrite the change
                        revealLastElement(this.h);
                    }, 0);
                }
            }
            this.D = this.h.scrollHeight;
        }
        ab(container, options) {
            this.n = this.B(this.N.createInstance(chatInputPart_1.$SGb, {
                renderFollowups: options?.renderFollowups ?? true,
                renderStyle: options?.renderStyle,
            }));
            this.n.render(container, '', this);
            this.B(this.n.onDidFocus(() => this.a.fire()));
            this.B(this.n.onDidAcceptFollowup(followup => this.acceptInput(followup)));
            this.B(this.n.onDidChangeHeight(() => this.u && this.layout(this.u.height, this.u.width)));
        }
        bb() {
            this.t.style.setProperty('--vscode-interactive-result-editor-background-color', this.r.configuration.resultEditor.backgroundColor?.toString() ?? '');
            this.t.style.setProperty('--vscode-interactive-session-foreground', this.r.configuration.foreground?.toString() ?? '');
        }
        setModel(model, viewState) {
            if (!this.t) {
                throw new Error('Call render() before setModel()');
            }
            this.t.setAttribute('data-session-id', model.sessionId);
            this.viewModel = this.N.createInstance(chatViewModel_1.$Kqb, model);
            this.F.add(this.viewModel.onDidChange(e => {
                this.I = undefined;
                this.z.set(this.viewModel.requestInProgress);
                this.U();
                if (e?.kind === 'addRequest') {
                    revealLastElement(this.h);
                    this.focusInput();
                }
            }));
            this.F.add(this.viewModel.onDidDisposeModel(() => {
                // Disposes the viewmodel and listeners
                this.viewModel = undefined;
                this.U();
            }));
            this.n.setState(model.providerId, viewState.inputValue ?? '');
            if (this.h) {
                this.U();
                revealLastElement(this.h);
            }
        }
        getFocus() {
            return this.h.getFocus()[0] ?? undefined;
        }
        reveal(item) {
            this.h.reveal(item);
        }
        focus(item) {
            const items = this.h.getNode(null).children;
            const node = items.find(i => i.element?.id === item.id);
            if (!node) {
                return;
            }
            this.h.setFocus([node.element]);
            this.h.domFocus();
        }
        updateInput(value = '') {
            this.n.setValue(value);
        }
        async acceptInput(query) {
            if (this.viewModel) {
                this.f.fire();
                const editorValue = this.n.inputEditor.getValue();
                this.Q.acceptRequest();
                const input = query ?? editorValue;
                const usedSlashCommand = this.cb(typeof input === 'string' ? input : input.message);
                const result = await this.O.sendRequest(this.viewModel.sessionId, input, usedSlashCommand);
                if (result) {
                    this.n.acceptInput(query);
                    result.responseCompletePromise.then(async () => {
                        const responses = this.viewModel?.getItems().filter(chatViewModel_1.$Iqb);
                        const lastResponse = responses?.[responses.length - 1];
                        this.Q.acceptResponse(lastResponse);
                    });
                }
                else {
                    this.Q.acceptResponse();
                }
            }
        }
        cb(input) {
            return this.H?.find(sc => input.startsWith(`/${sc.command}`));
        }
        getCodeBlockInfosForResponse(response) {
            return this.j.getCodeBlockInfosForResponse(response);
        }
        getCodeBlockInfoForEditor(uri) {
            return this.j.getCodeBlockInfoForEditor(uri);
        }
        getFileTreeInfosForResponse(response) {
            return this.j.getFileTreeInfosForResponse(response);
        }
        getLastFocusedFileTreeForResponse(response) {
            return this.j.getLastFocusedFileTreeForResponse(response);
        }
        focusLastMessage() {
            if (!this.viewModel) {
                return;
            }
            const items = this.h.getNode(null).children;
            const lastItem = items[items.length - 1];
            if (!lastItem) {
                return;
            }
            this.h.setFocus([lastItem.element]);
            this.h.domFocus();
        }
        layout(height, width) {
            width = Math.min(width, 850);
            this.u = new dom.$BO(width, height);
            const inputPartHeight = this.n.layout(height, width);
            const lastElementVisible = this.h.scrollTop + this.h.renderHeight >= this.h.scrollHeight;
            const listHeight = height - inputPartHeight;
            this.h.layout(listHeight, width);
            this.h.getHTMLElement().style.height = `${listHeight}px`;
            this.j.layout(width);
            if (lastElementVisible) {
                revealLastElement(this.h);
            }
            this.s.style.height = `${height - inputPartHeight}px`;
            this.g.fire(height);
        }
        // An alternative to layout, this allows you to specify the number of ChatTreeItems
        // you want to show, and the max height of the container. It will then layout the
        // tree to show that many items.
        // TODO@TylerLeonhardt: This could use some refactoring to make it clear which layout strategy is being used
        setDynamicChatTreeItemLayout(numOfChatTreeItems, maxHeight) {
            this.db = { numOfMessages: numOfChatTreeItems, maxHeight, enabled: true };
            this.B(this.j.onDidChangeItemHeight(() => this.layoutDynamicChatTreeItemMode()));
            const mutableDisposable = this.B(new lifecycle_1.$lc());
            this.B(this.h.onDidScroll((e) => {
                // TODO@TylerLeonhardt this should probably just be disposed when this is disabled
                // and then set up again when it is enabled again
                if (!this.db?.enabled) {
                    return;
                }
                mutableDisposable.value = dom.$vO(() => {
                    if (!e.scrollTopChanged || e.heightChanged || e.scrollHeightChanged) {
                        return;
                    }
                    const renderHeight = e.height;
                    const diff = e.scrollHeight - renderHeight - e.scrollTop;
                    if (diff === 0) {
                        return;
                    }
                    const possibleMaxHeight = (this.db?.maxHeight ?? maxHeight);
                    const width = this.u?.width ?? this.t.offsetWidth;
                    const inputPartHeight = this.n.layout(possibleMaxHeight, width);
                    const newHeight = Math.min(renderHeight + diff, possibleMaxHeight - inputPartHeight);
                    this.layout(newHeight + inputPartHeight, width);
                });
            }));
        }
        updateDynamicChatTreeItemLayout(numOfChatTreeItems, maxHeight) {
            this.db = { numOfMessages: numOfChatTreeItems, maxHeight, enabled: true };
            let hasChanged = false;
            let height = this.u.height;
            let width = this.u.width;
            if (maxHeight < this.u.height) {
                height = maxHeight;
                hasChanged = true;
            }
            const containerWidth = this.t.offsetWidth;
            if (this.u?.width !== containerWidth) {
                width = containerWidth;
                hasChanged = true;
            }
            if (hasChanged) {
                this.layout(height, width);
            }
        }
        get isDynamicChatTreeItemLayoutEnabled() {
            return this.db?.enabled ?? false;
        }
        set isDynamicChatTreeItemLayoutEnabled(value) {
            if (!this.db) {
                return;
            }
            this.db.enabled = value;
        }
        layoutDynamicChatTreeItemMode() {
            if (!this.viewModel || !this.db?.enabled) {
                return;
            }
            const width = this.u?.width ?? this.t.offsetWidth;
            const inputHeight = this.n.layout(this.db.maxHeight, width);
            const totalMessages = this.viewModel.getItems();
            // grab the last N messages
            const messages = totalMessages.slice(-this.db.numOfMessages);
            const needsRerender = messages.some(m => m.currentRenderedHeight === undefined);
            const listHeight = needsRerender
                ? this.db.maxHeight
                : messages.reduce((acc, message) => acc + message.currentRenderedHeight, 0);
            this.layout(Math.min(
            // we add an additional 18px in order to show that there is scrollable content
            inputHeight + listHeight + (totalMessages.length > 2 ? 18 : 0), this.db.maxHeight), width);
            if (needsRerender || !listHeight) {
                // TODO: figure out a better place to reveal the last element
                revealLastElement(this.h);
            }
        }
        saveState() {
            this.n.saveState();
        }
        getViewState() {
            this.n.saveState();
            return { inputValue: this.n.inputEditor.getValue() };
        }
    };
    exports.$zIb = $zIb;
    exports.$zIb = $zIb = $zIb_1 = __decorate([
        __param(2, contextkey_1.$3i),
        __param(3, instantiation_1.$Ah),
        __param(4, chatService_1.$FH),
        __param(5, chat_1.$Nqb),
        __param(6, contextView_1.$WZ),
        __param(7, chat_1.$Pqb),
        __param(8, instantiation_1.$Ah)
    ], $zIb);
    let $AIb = class $AIb {
        get lastFocusedWidget() {
            return this.b;
        }
        constructor(c, d) {
            this.c = c;
            this.d = d;
            this.a = [];
            this.b = undefined;
        }
        getWidgetByInputUri(uri) {
            return this.a.find(w => (0, resources_1.$bg)(w.inputUri, uri));
        }
        getWidgetBySessionId(sessionId) {
            return this.a.find(w => w.viewModel?.sessionId === sessionId);
        }
        async revealViewForProvider(providerId) {
            const viewId = this.d.getViewIdForProvider(providerId);
            const view = await this.c.openView(viewId);
            return view?.widget;
        }
        f(widget) {
            if (widget === this.b) {
                return;
            }
            this.b = widget;
        }
        register(newWidget) {
            if (this.a.some(widget => widget === newWidget)) {
                throw new Error('Cannot register the same widget multiple times');
            }
            this.a.push(newWidget);
            return (0, lifecycle_1.$hc)(newWidget.onDidFocus(() => this.f(newWidget)), (0, lifecycle_1.$ic)(() => this.a.splice(this.a.indexOf(newWidget), 1)));
        }
    };
    exports.$AIb = $AIb;
    exports.$AIb = $AIb = __decorate([
        __param(0, views_1.$$E),
        __param(1, chatContributionService_1.$fsb)
    ], $AIb);
});
//# sourceMappingURL=chatWidget.js.map