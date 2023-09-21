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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/marked/marked", "vs/base/common/network", "vs/base/common/themables", "vs/editor/browser/editorExtensions", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/common/config/editorOptions", "vs/editor/common/core/range", "vs/editor/common/languages/language", "vs/editor/common/languages/modesRegistry", "vs/editor/common/services/model", "vs/editor/contrib/bracketMatching/browser/bracketMatching", "vs/editor/contrib/contextmenu/browser/contextmenu", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/editor/contrib/semanticTokens/browser/viewportSemanticTokens", "vs/editor/contrib/smartSelect/browser/smartSelect", "vs/editor/contrib/wordHighlighter/browser/wordHighlighter", "vs/nls", "vs/platform/accessibility/common/accessibility", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/browser/toolbar", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/list/browser/listService", "vs/platform/log/common/log", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/themeService", "vs/workbench/browser/labels", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/workbench/contrib/chat/browser/chatFollowups", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/contrib/chat/common/chatViewModel", "vs/workbench/contrib/chat/common/chatWordCounter", "vs/workbench/contrib/codeEditor/browser/menuPreventer", "vs/workbench/contrib/codeEditor/browser/selectionClipboard", "vs/workbench/contrib/codeEditor/browser/simpleEditorOptions", "vs/workbench/contrib/files/browser/views/explorerView", "vs/platform/opener/common/opener", "vs/base/common/arrays"], function (require, exports, dom, iconLabels_1, async_1, codicons_1, event_1, htmlContent_1, lifecycle_1, map_1, marked_1, network_1, themables_1, editorExtensions_1, codeEditorWidget_1, editorOptions_1, range_1, language_1, modesRegistry_1, model_1, bracketMatching_1, contextmenu_1, markdownRenderer_1, viewportSemanticTokens_1, smartSelect_1, wordHighlighter_1, nls_1, accessibility_1, menuEntryActionViewItem_1, toolbar_1, actions_1, commands_1, configuration_1, contextkey_1, files_1, instantiation_1, serviceCollection_1, listService_1, log_1, defaultStyles_1, themeService_1, labels_1, accessibleView_1, chatFollowups_1, chatContextKeys_1, chatService_1, chatViewModel_1, chatWordCounter_1, menuPreventer_1, selectionClipboard_1, simpleEditorOptions_1, explorerView_1, opener_1, arrays_1) {
    "use strict";
    var ChatListItemRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChatAccessibilityProvider = exports.ChatListDelegate = exports.ChatListItemRenderer = void 0;
    const $ = dom.$;
    const forceVerboseLayoutTracing = false;
    let ChatListItemRenderer = class ChatListItemRenderer extends lifecycle_1.Disposable {
        static { ChatListItemRenderer_1 = this; }
        static { this.ID = 'item'; }
        constructor(editorOptions, rendererOptions, delegate, instantiationService, configService, logService, commandService, openerService, contextKeyService, chatService) {
            super();
            this.editorOptions = editorOptions;
            this.rendererOptions = rendererOptions;
            this.delegate = delegate;
            this.instantiationService = instantiationService;
            this.configService = configService;
            this.logService = logService;
            this.commandService = commandService;
            this.openerService = openerService;
            this.contextKeyService = contextKeyService;
            this.chatService = chatService;
            this.codeBlocksByResponseId = new Map();
            this.codeBlocksByEditorUri = new map_1.ResourceMap();
            this.fileTreesByResponseId = new Map();
            this.focusedFileTreesByResponseId = new Map();
            this._onDidClickFollowup = this._register(new event_1.Emitter());
            this.onDidClickFollowup = this._onDidClickFollowup.event;
            this._onDidChangeItemHeight = this._register(new event_1.Emitter());
            this.onDidChangeItemHeight = this._onDidChangeItemHeight.event;
            this._currentLayoutWidth = 0;
            this._isVisible = true;
            this._onDidChangeVisibility = this._register(new event_1.Emitter());
            this.renderer = this.instantiationService.createInstance(markdownRenderer_1.MarkdownRenderer, {});
            this._editorPool = this._register(this.instantiationService.createInstance(EditorPool, this.editorOptions));
            this._treePool = this._register(this.instantiationService.createInstance(TreePool, this._onDidChangeVisibility.event));
        }
        get templateId() {
            return ChatListItemRenderer_1.ID;
        }
        traceLayout(method, message) {
            if (forceVerboseLayoutTracing) {
                this.logService.info(`ChatListItemRenderer#${method}: ${message}`);
            }
            else {
                this.logService.trace(`ChatListItemRenderer#${method}: ${message}`);
            }
        }
        progressiveRenderEnabled() {
            return !this.configService.getValue('interactive.experimental.disableProgressiveRendering');
        }
        getProgressiveRenderRate(element) {
            const configuredRate = this.configService.getValue('interactive.experimental.progressiveRenderingRate');
            if (typeof configuredRate === 'number') {
                return configuredRate;
            }
            if (element.isComplete) {
                return 60;
            }
            if (element.contentUpdateTimings && element.contentUpdateTimings.impliedWordLoadRate) {
                // This doesn't account for dead time after the last update. When the previous update is the final one and the model is only waiting for followupQuestions, that's good.
                // When there was one quick update and then you are waiting longer for the next one, that's not good since the rate should be decreasing.
                // If it's an issue, we can change this to be based on the total time from now to the beginning.
                const rateBoost = 1.5;
                return element.contentUpdateTimings.impliedWordLoadRate * rateBoost;
            }
            return 8;
        }
        getCodeBlockInfosForResponse(response) {
            const codeBlocks = this.codeBlocksByResponseId.get(response.id);
            return codeBlocks ?? [];
        }
        getCodeBlockInfoForEditor(uri) {
            return this.codeBlocksByEditorUri.get(uri);
        }
        getFileTreeInfosForResponse(response) {
            const fileTrees = this.fileTreesByResponseId.get(response.id);
            return fileTrees ?? [];
        }
        getLastFocusedFileTreeForResponse(response) {
            const fileTrees = this.fileTreesByResponseId.get(response.id);
            const lastFocusedFileTreeIndex = this.focusedFileTreesByResponseId.get(response.id);
            if (fileTrees?.length && lastFocusedFileTreeIndex !== undefined && lastFocusedFileTreeIndex < fileTrees.length) {
                return fileTrees[lastFocusedFileTreeIndex];
            }
            return undefined;
        }
        setVisible(visible) {
            this._isVisible = visible;
            this._onDidChangeVisibility.fire(visible);
        }
        layout(width) {
            this._currentLayoutWidth = width - 40; // TODO Padding
            this._editorPool.inUse.forEach(editor => {
                editor.layout(this._currentLayoutWidth);
            });
        }
        renderTemplate(container) {
            const templateDisposables = new lifecycle_1.DisposableStore();
            const rowContainer = dom.append(container, $('.interactive-item-container'));
            if (this.rendererOptions.renderStyle === 'compact') {
                rowContainer.classList.add('interactive-item-compact');
            }
            const header = dom.append(rowContainer, $('.header'));
            const user = dom.append(header, $('.user'));
            const avatar = dom.append(user, $('.avatar'));
            const username = dom.append(user, $('h3.username'));
            const value = dom.append(rowContainer, $('.value'));
            const elementDisposables = new lifecycle_1.DisposableStore();
            const contextKeyService = templateDisposables.add(this.contextKeyService.createScoped(rowContainer));
            const scopedInstantiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, contextKeyService]));
            const titleToolbar = templateDisposables.add(scopedInstantiationService.createInstance(toolbar_1.MenuWorkbenchToolBar, header, actions_1.MenuId.ChatMessageTitle, {
                menuOptions: {
                    shouldForwardArgs: true
                },
                actionViewItemProvider: (action, options) => {
                    if (action instanceof actions_1.MenuItemAction && (action.item.id === 'workbench.action.chat.voteDown' || action.item.id === 'workbench.action.chat.voteUp')) {
                        return scopedInstantiationService.createInstance(ChatVoteButton, action, options);
                    }
                    return undefined;
                }
            }));
            const template = { avatar, username, value, rowContainer, elementDisposables, titleToolbar, templateDisposables, contextKeyService };
            return template;
        }
        renderElement(node, index, templateData) {
            const { element } = node;
            const kind = (0, chatViewModel_1.isRequestVM)(element) ? 'request' :
                (0, chatViewModel_1.isResponseVM)(element) ? 'response' :
                    'welcome';
            this.traceLayout('renderElement', `${kind}, index=${index}`);
            chatContextKeys_1.CONTEXT_RESPONSE.bindTo(templateData.contextKeyService).set((0, chatViewModel_1.isResponseVM)(element));
            chatContextKeys_1.CONTEXT_REQUEST.bindTo(templateData.contextKeyService).set((0, chatViewModel_1.isRequestVM)(element));
            chatContextKeys_1.CONTEXT_RESPONSE_HAS_PROVIDER_ID.bindTo(templateData.contextKeyService).set((0, chatViewModel_1.isResponseVM)(element) && !!element.providerResponseId);
            if ((0, chatViewModel_1.isResponseVM)(element)) {
                chatContextKeys_1.CONTEXT_RESPONSE_VOTE.bindTo(templateData.contextKeyService).set(element.vote === chatService_1.InteractiveSessionVoteDirection.Up ? 'up' : element.vote === chatService_1.InteractiveSessionVoteDirection.Down ? 'down' : '');
            }
            else {
                chatContextKeys_1.CONTEXT_RESPONSE_VOTE.bindTo(templateData.contextKeyService).set('');
            }
            templateData.titleToolbar.context = element;
            const isFiltered = !!((0, chatViewModel_1.isResponseVM)(element) && element.errorDetails?.responseIsFiltered);
            chatContextKeys_1.CONTEXT_RESPONSE_FILTERED.bindTo(templateData.contextKeyService).set(isFiltered);
            templateData.rowContainer.classList.toggle('interactive-request', (0, chatViewModel_1.isRequestVM)(element));
            templateData.rowContainer.classList.toggle('interactive-response', (0, chatViewModel_1.isResponseVM)(element));
            templateData.rowContainer.classList.toggle('interactive-welcome', (0, chatViewModel_1.isWelcomeVM)(element));
            templateData.rowContainer.classList.toggle('filtered-response', isFiltered);
            templateData.username.textContent = element.username;
            if (element.avatarIconUri) {
                const avatarIcon = dom.$('img.icon');
                avatarIcon.src = network_1.FileAccess.uriToBrowserUri(element.avatarIconUri).toString(true);
                templateData.avatar.replaceChildren(avatarIcon);
            }
            else {
                const defaultIcon = (0, chatViewModel_1.isRequestVM)(element) ? codicons_1.Codicon.account : codicons_1.Codicon.hubot;
                const avatarIcon = dom.$(themables_1.ThemeIcon.asCSSSelector(defaultIcon));
                templateData.avatar.replaceChildren(avatarIcon);
            }
            // Do a progressive render if
            // - This the last response in the list
            // - And it is not a placeholder response ("Thinking...")
            // - And the response is not complete
            //   - Or, we previously started a progressive rendering of this element (if the element is complete, we will finish progressive rendering with a very fast rate)
            // - And, the feature is not disabled in configuration
            if ((0, chatViewModel_1.isResponseVM)(element) && index === this.delegate.getListLength() - 1 && !element.isPlaceholder && (!element.isComplete || element.renderData) && this.progressiveRenderEnabled()) {
                this.traceLayout('renderElement', `start progressive render ${kind}, index=${index}`);
                const progressiveRenderingDisposables = templateData.elementDisposables.add(new lifecycle_1.DisposableStore());
                const timer = templateData.elementDisposables.add(new async_1.IntervalTimer());
                const runProgressiveRender = (initial) => {
                    try {
                        if (this.doNextProgressiveRender(element, index, templateData, !!initial, progressiveRenderingDisposables)) {
                            timer.cancel();
                        }
                    }
                    catch (err) {
                        // Kill the timer if anything went wrong, avoid getting stuck in a nasty rendering loop.
                        timer.cancel();
                        throw err;
                    }
                };
                timer.cancelAndSet(runProgressiveRender, 50);
                runProgressiveRender(true);
            }
            else if ((0, chatViewModel_1.isResponseVM)(element)) {
                this.basicRenderElement(element.response.value, element, index, templateData);
            }
            else if ((0, chatViewModel_1.isRequestVM)(element)) {
                this.basicRenderElement([new htmlContent_1.MarkdownString(element.messageText)], element, index, templateData);
            }
            else {
                this.renderWelcomeMessage(element, templateData);
            }
        }
        basicRenderElement(value, element, index, templateData) {
            const fillInIncompleteTokens = (0, chatViewModel_1.isResponseVM)(element) && (!element.isComplete || element.isCanceled || element.errorDetails?.responseIsFiltered || element.errorDetails?.responseIsIncomplete);
            dom.clearNode(templateData.value);
            let fileTreeIndex = 0;
            for (const data of value) {
                const result = 'value' in data
                    ? this.renderMarkdown(data, element, templateData.elementDisposables, templateData, fillInIncompleteTokens)
                    : this.renderTreeData(data, element, templateData.elementDisposables, templateData, fileTreeIndex++);
                templateData.value.appendChild(result.element);
                templateData.elementDisposables.add(result);
            }
            if ((0, chatViewModel_1.isResponseVM)(element) && element.errorDetails?.message) {
                const icon = element.errorDetails.responseIsFiltered ? codicons_1.Codicon.info : codicons_1.Codicon.error;
                const errorDetails = dom.append(templateData.value, $('.interactive-response-error-details', undefined, (0, iconLabels_1.renderIcon)(icon)));
                errorDetails.appendChild($('span', undefined, element.errorDetails.message));
            }
            if ((0, chatViewModel_1.isResponseVM)(element) && element.commandFollowups?.length) {
                const followupsContainer = dom.append(templateData.value, $('.interactive-response-followups'));
                templateData.elementDisposables.add(new chatFollowups_1.ChatFollowups(followupsContainer, element.commandFollowups, defaultStyles_1.defaultButtonStyles, followup => {
                    this.chatService.notifyUserAction({
                        providerId: element.providerId,
                        action: {
                            kind: 'command',
                            command: followup
                        }
                    });
                    return this.commandService.executeCommand(followup.commandId, ...(followup.args ?? []));
                }, templateData.contextKeyService));
            }
            const newHeight = templateData.rowContainer.offsetHeight;
            const fireEvent = !element.currentRenderedHeight || element.currentRenderedHeight !== newHeight;
            element.currentRenderedHeight = newHeight;
            if (fireEvent) {
                const disposable = this._register(dom.scheduleAtNextAnimationFrame(() => {
                    disposable.dispose();
                    this._onDidChangeItemHeight.fire({ element, height: newHeight });
                }));
            }
        }
        renderWelcomeMessage(element, templateData) {
            dom.clearNode(templateData.value);
            const slashCommands = this.delegate.getSlashCommands();
            for (const item of element.content) {
                if (Array.isArray(item)) {
                    templateData.elementDisposables.add(new chatFollowups_1.ChatFollowups(templateData.value, item, undefined, followup => this._onDidClickFollowup.fire(followup), templateData.contextKeyService));
                }
                else {
                    const result = this.renderMarkdown(item, element, templateData.elementDisposables, templateData);
                    for (const codeElement of result.element.querySelectorAll('code')) {
                        if (codeElement.textContent && slashCommands.find(command => codeElement.textContent === `/${command.command}`)) {
                            codeElement.classList.add('interactive-slash-command');
                        }
                    }
                    templateData.value.appendChild(result.element);
                    templateData.elementDisposables.add(result);
                }
            }
            const newHeight = templateData.rowContainer.offsetHeight;
            const fireEvent = !element.currentRenderedHeight || element.currentRenderedHeight !== newHeight;
            element.currentRenderedHeight = newHeight;
            if (fireEvent) {
                const disposable = this._register(dom.scheduleAtNextAnimationFrame(() => {
                    disposable.dispose();
                    this._onDidChangeItemHeight.fire({ element, height: newHeight });
                }));
            }
        }
        /**
         *	@returns true if progressive rendering should be considered complete- the element's data is fully rendered or the view is not visible
         */
        doNextProgressiveRender(element, index, templateData, isInRenderElement, disposables) {
            if (!this._isVisible) {
                return true;
            }
            disposables.clear();
            let isFullyRendered = false;
            if (element.isCanceled) {
                this.traceLayout('runProgressiveRender', `canceled, index=${index}`);
                element.renderData = undefined;
                this.basicRenderElement(element.response.value, element, index, templateData);
                isFullyRendered = true;
            }
            else {
                // Figure out what we need to render in addition to what has already been rendered
                const currentResponseData = element.response.value;
                element.renderData ??= { renderedParts: [] };
                const renderedParts = element.renderData.renderedParts;
                const wordCountResults = [];
                const partsToRender = [];
                currentResponseData.forEach((part, index) => {
                    const renderedPart = renderedParts[index];
                    // Is this part completely new?
                    if (!renderedPart) {
                        if (isInteractiveProgressTreeData(part)) {
                            partsToRender[index] = part;
                        }
                        else {
                            const wordCountResult = this.getDataForProgressiveRender(element, part, { renderedWordCount: 0, lastRenderTime: 0 });
                            if (wordCountResult !== undefined) {
                                partsToRender[index] = {
                                    renderedWordCount: wordCountResult.actualWordCount,
                                    lastRenderTime: Date.now(),
                                    isFullyRendered: wordCountResult.isFullString,
                                };
                                wordCountResults[index] = wordCountResult;
                            }
                        }
                    }
                    // Did this part go from being a placeholder string to resolved tree data?
                    else if (isInteractiveProgressTreeData(part) && !isInteractiveProgressTreeData(renderedPart)) {
                        partsToRender[index] = part;
                    }
                    // Did this part's content change?
                    else if (!isInteractiveProgressTreeData(part) && !isInteractiveProgressTreeData(renderedPart)) {
                        const wordCountResult = this.getDataForProgressiveRender(element, part, renderedPart);
                        // Check if there are any new words to render
                        if (wordCountResult !== undefined && renderedPart.renderedWordCount !== wordCountResult?.actualWordCount) {
                            partsToRender[index] = {
                                renderedWordCount: wordCountResult.actualWordCount,
                                lastRenderTime: Date.now(),
                                isFullyRendered: wordCountResult.isFullString,
                            };
                            wordCountResults[index] = wordCountResult;
                        }
                    }
                });
                isFullyRendered = partsToRender.length === 0;
                if (isFullyRendered && element.isComplete) {
                    // Response is done and content is rendered, so do a normal render
                    this.traceLayout('runProgressiveRender', `end progressive render, index=${index} and clearing renderData, response is complete, index=${index}`);
                    element.renderData = undefined;
                    disposables.clear();
                    this.basicRenderElement(element.response.value, element, index, templateData);
                }
                else if (!isFullyRendered) {
                    let hasRenderedOneMarkdownBlock = false;
                    partsToRender.forEach((partToRender, index) => {
                        if (!partToRender) {
                            return;
                        }
                        let result;
                        if (isInteractiveProgressTreeData(partToRender)) {
                            result = this.renderTreeData(partToRender, element, disposables, templateData, index);
                        }
                        // Avoid doing progressive rendering for multiple markdown parts simultaneously
                        else if (!hasRenderedOneMarkdownBlock) {
                            const { value } = wordCountResults[index];
                            const isPlaceholder = isPlaceholderMarkdown(currentResponseData[index]);
                            result = isPlaceholder
                                ? this.renderPlaceholder(new htmlContent_1.MarkdownString(value), templateData)
                                : this.renderMarkdown(new htmlContent_1.MarkdownString(value), element, disposables, templateData, true);
                            hasRenderedOneMarkdownBlock = true;
                        }
                        if (!result) {
                            return;
                        }
                        // Doing the progressive render
                        renderedParts[index] = partToRender;
                        const existingElement = templateData.value.children[index];
                        if (existingElement) {
                            templateData.value.replaceChild(result.element, existingElement);
                        }
                        else {
                            templateData.value.appendChild(result.element);
                        }
                        disposables.add(result);
                    });
                }
                else {
                    // Nothing new to render, not done, keep waiting
                    return false;
                }
            }
            // Some render happened - update the height
            const height = templateData.rowContainer.offsetHeight;
            element.currentRenderedHeight = height;
            if (!isInRenderElement) {
                this._onDidChangeItemHeight.fire({ element, height: templateData.rowContainer.offsetHeight });
            }
            return isFullyRendered;
        }
        renderTreeData(data, element, disposables, templateData, treeDataIndex) {
            const ref = this._treePool.get();
            const tree = ref.object;
            const treeDisposables = new lifecycle_1.DisposableStore();
            treeDisposables.add(tree.onDidOpen((e) => {
                if (e.element && !('children' in e.element)) {
                    this.openerService.open(e.element.uri);
                }
            }));
            treeDisposables.add(tree.onDidChangeCollapseState(() => {
                this._onDidChangeItemHeight.fire({ element, height: templateData.rowContainer.offsetHeight });
            }));
            treeDisposables.add(tree.onContextMenu((e) => {
                e.browserEvent.preventDefault();
                e.browserEvent.stopPropagation();
            }));
            tree.setInput(data).then(() => {
                if (!ref.isStale()) {
                    tree.layout();
                    this._onDidChangeItemHeight.fire({ element, height: templateData.rowContainer.offsetHeight });
                }
            });
            if ((0, chatViewModel_1.isResponseVM)(element)) {
                const fileTreeFocusInfo = {
                    treeDataId: data.uri.toString(),
                    treeIndex: treeDataIndex,
                    focus() {
                        tree.domFocus();
                    }
                };
                treeDisposables.add(tree.onDidFocus(() => {
                    this.focusedFileTreesByResponseId.set(element.id, fileTreeFocusInfo.treeIndex);
                }));
                const fileTrees = this.fileTreesByResponseId.get(element.id) ?? [];
                fileTrees.push(fileTreeFocusInfo);
                this.fileTreesByResponseId.set(element.id, (0, arrays_1.distinct)(fileTrees, (v) => v.treeDataId));
                disposables.add((0, lifecycle_1.toDisposable)(() => this.fileTreesByResponseId.set(element.id, fileTrees.filter(v => v.treeDataId !== data.uri.toString()))));
            }
            return {
                element: tree.getHTMLElement().parentElement,
                dispose: () => {
                    treeDisposables.dispose();
                    ref.dispose();
                }
            };
        }
        renderPlaceholder(markdown, templateData) {
            const codicon = $('.interactive-response-codicon-details', undefined, (0, iconLabels_1.renderIcon)({ id: 'sync~spin' }));
            codicon.classList.add('interactive-response-placeholder-codicon');
            const result = dom.append(templateData.value, codicon);
            const content = this.renderer.render(markdown);
            content.element.className = 'interactive-response-placeholder-content';
            result.appendChild(content.element);
            return { element: result, dispose: () => content.dispose() };
        }
        renderMarkdown(markdown, element, disposables, templateData, fillInIncompleteTokens = false) {
            const disposablesList = [];
            let codeBlockIndex = 0;
            // TODO if the slash commands stay completely dynamic, this isn't quite right
            const slashCommands = this.delegate.getSlashCommands();
            const usedSlashCommand = slashCommands.find(s => markdown.value.startsWith(`/${s.command} `));
            const toRender = usedSlashCommand ? markdown.value.slice(usedSlashCommand.command.length + 2) : markdown.value;
            markdown = new htmlContent_1.MarkdownString(toRender, {
                isTrusted: {
                    // Disable all other config options except isTrusted
                    enabledCommands: typeof markdown.isTrusted === 'object' ? markdown.isTrusted?.enabledCommands : [] ?? []
                }
            });
            const codeblocks = [];
            const result = this.renderer.render(markdown, {
                fillInIncompleteTokens,
                codeBlockRendererSync: (languageId, text) => {
                    const data = { languageId, text, codeBlockIndex: codeBlockIndex++, element, parentContextKeyService: templateData.contextKeyService };
                    const ref = this.renderCodeBlock(data, disposables);
                    // Attach this after updating text/layout of the editor, so it should only be fired when the size updates later (horizontal scrollbar, wrapping)
                    // not during a renderElement OR a progressive render (when we will be firing this event anyway at the end of the render)
                    disposables.add(ref.object.onDidChangeContentHeight(() => {
                        ref.object.layout(this._currentLayoutWidth);
                        this._onDidChangeItemHeight.fire({ element, height: templateData.rowContainer.offsetHeight });
                    }));
                    if ((0, chatViewModel_1.isResponseVM)(element)) {
                        const info = {
                            codeBlockIndex: data.codeBlockIndex,
                            element,
                            focus() {
                                ref.object.focus();
                            }
                        };
                        codeblocks.push(info);
                        this.codeBlocksByEditorUri.set(ref.object.textModel.uri, info);
                        disposables.add((0, lifecycle_1.toDisposable)(() => this.codeBlocksByEditorUri.delete(ref.object.textModel.uri)));
                    }
                    disposablesList.push(ref);
                    return ref.object.element;
                }
            });
            if ((0, chatViewModel_1.isResponseVM)(element)) {
                this.codeBlocksByResponseId.set(element.id, codeblocks);
                disposables.add((0, lifecycle_1.toDisposable)(() => this.codeBlocksByResponseId.delete(element.id)));
            }
            if (usedSlashCommand) {
                const slashCommandElement = $('span.interactive-slash-command', { title: usedSlashCommand.detail }, `/${usedSlashCommand.command} `);
                if (result.element.firstChild?.nodeName.toLowerCase() === 'p') {
                    result.element.firstChild.insertBefore(slashCommandElement, result.element.firstChild.firstChild);
                }
                else {
                    result.element.insertBefore($('p', undefined, slashCommandElement), result.element.firstChild);
                }
            }
            disposablesList.reverse().forEach(d => disposables.add(d));
            return result;
        }
        renderCodeBlock(data, disposables) {
            const ref = this._editorPool.get();
            const editorInfo = ref.object;
            editorInfo.render(data, this._currentLayoutWidth);
            return ref;
        }
        getDataForProgressiveRender(element, data, renderData) {
            const rate = this.getProgressiveRenderRate(element);
            const numWordsToRender = renderData.lastRenderTime === 0 ?
                1 :
                renderData.renderedWordCount +
                    // Additional words to render beyond what's already rendered
                    Math.floor((Date.now() - renderData.lastRenderTime) / 1000 * rate);
            if (numWordsToRender === renderData.renderedWordCount) {
                return undefined;
            }
            return (0, chatWordCounter_1.getNWords)(data.value, numWordsToRender);
        }
        disposeElement(node, index, templateData) {
            templateData.elementDisposables.clear();
        }
        disposeTemplate(templateData) {
            templateData.templateDisposables.dispose();
        }
    };
    exports.ChatListItemRenderer = ChatListItemRenderer;
    exports.ChatListItemRenderer = ChatListItemRenderer = ChatListItemRenderer_1 = __decorate([
        __param(3, instantiation_1.IInstantiationService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, log_1.ILogService),
        __param(6, commands_1.ICommandService),
        __param(7, opener_1.IOpenerService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, chatService_1.IChatService)
    ], ChatListItemRenderer);
    let ChatListDelegate = class ChatListDelegate {
        constructor(logService) {
            this.logService = logService;
        }
        _traceLayout(method, message) {
            if (forceVerboseLayoutTracing) {
                this.logService.info(`ChatListDelegate#${method}: ${message}`);
            }
            else {
                this.logService.trace(`ChatListDelegate#${method}: ${message}`);
            }
        }
        getHeight(element) {
            const kind = (0, chatViewModel_1.isRequestVM)(element) ? 'request' : 'response';
            const height = ('currentRenderedHeight' in element ? element.currentRenderedHeight : undefined) ?? 200;
            this._traceLayout('getHeight', `${kind}, height=${height}`);
            return height;
        }
        getTemplateId(element) {
            return ChatListItemRenderer.ID;
        }
        hasDynamicHeight(element) {
            return true;
        }
    };
    exports.ChatListDelegate = ChatListDelegate;
    exports.ChatListDelegate = ChatListDelegate = __decorate([
        __param(0, log_1.ILogService)
    ], ChatListDelegate);
    let ChatAccessibilityProvider = class ChatAccessibilityProvider {
        constructor(_accessibleViewService) {
            this._accessibleViewService = _accessibleViewService;
        }
        getWidgetRole() {
            return 'list';
        }
        getRole(element) {
            return 'listitem';
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)('chat', "Chat");
        }
        getAriaLabel(element) {
            if ((0, chatViewModel_1.isRequestVM)(element)) {
                return element.messageText;
            }
            if ((0, chatViewModel_1.isResponseVM)(element)) {
                return this._getLabelWithCodeBlockCount(element);
            }
            if ((0, chatViewModel_1.isWelcomeVM)(element)) {
                return element.content.map(c => 'value' in c ? c.value : c.map(followup => followup.message).join('\n')).join('\n');
            }
            return '';
        }
        _getLabelWithCodeBlockCount(element) {
            const accessibleViewHint = this._accessibleViewService.getOpenAriaHint("accessibility.verbosity.panelChat" /* AccessibilityVerbositySettingId.Chat */);
            let label = '';
            let commandFollowUpInfo;
            const commandFollowupLength = element.commandFollowups?.length ?? 0;
            switch (commandFollowupLength) {
                case 0:
                    break;
                case 1:
                    commandFollowUpInfo = (0, nls_1.localize)('commandFollowUpInfo', "Command: {0}", element.commandFollowups[0].title);
                    break;
                default:
                    commandFollowUpInfo = (0, nls_1.localize)('commandFollowUpInfoMany', "Commands: {0}", element.commandFollowups.map(followup => followup.title).join(', '));
            }
            const fileTreeCount = element.response.value.filter((v) => !('value' in v))?.length ?? 0;
            let fileTreeCountHint = '';
            switch (fileTreeCount) {
                case 0:
                    break;
                case 1:
                    fileTreeCountHint = (0, nls_1.localize)('singleFileTreeHint', "1 file tree");
                    break;
                default:
                    fileTreeCountHint = (0, nls_1.localize)('multiFileTreeHint', "{0} file trees", fileTreeCount);
                    break;
            }
            const codeBlockCount = marked_1.marked.lexer(element.response.asString()).filter(token => token.type === 'code')?.length ?? 0;
            switch (codeBlockCount) {
                case 0:
                    label = accessibleViewHint ? (0, nls_1.localize)('noCodeBlocksHint', "{0} {1} {2}", fileTreeCountHint, element.response.asString(), accessibleViewHint) : (0, nls_1.localize)('noCodeBlocks', "{0} {1}", fileTreeCountHint, element.response.asString());
                    break;
                case 1:
                    label = accessibleViewHint ? (0, nls_1.localize)('singleCodeBlockHint', "{0} 1 code block: {1} {2}", fileTreeCountHint, element.response.asString(), accessibleViewHint) : (0, nls_1.localize)('singleCodeBlock', "{0} 1 code block: {1}", fileTreeCountHint, element.response.asString());
                    break;
                default:
                    label = accessibleViewHint ? (0, nls_1.localize)('multiCodeBlockHint', "{0} {1} code blocks: {2}", fileTreeCountHint, codeBlockCount, element.response.asString(), accessibleViewHint) : (0, nls_1.localize)('multiCodeBlock', "{0} {1} code blocks", fileTreeCountHint, codeBlockCount, element.response.asString());
                    break;
            }
            return commandFollowUpInfo ? commandFollowUpInfo + ', ' + label : label;
        }
    };
    exports.ChatAccessibilityProvider = ChatAccessibilityProvider;
    exports.ChatAccessibilityProvider = ChatAccessibilityProvider = __decorate([
        __param(0, accessibleView_1.IAccessibleViewService)
    ], ChatAccessibilityProvider);
    const defaultCodeblockPadding = 10;
    let CodeBlockPart = class CodeBlockPart extends lifecycle_1.Disposable {
        constructor(options, instantiationService, contextKeyService, languageService, modelService, configurationService, accessibilityService) {
            super();
            this.options = options;
            this.languageService = languageService;
            this.modelService = modelService;
            this.configurationService = configurationService;
            this.accessibilityService = accessibilityService;
            this._onDidChangeContentHeight = this._register(new event_1.Emitter());
            this.onDidChangeContentHeight = this._onDidChangeContentHeight.event;
            this.currentScrollWidth = 0;
            this.element = $('.interactive-result-editor-wrapper');
            this.contextKeyService = this._register(contextKeyService.createScoped(this.element));
            const scopedInstantiationService = instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this.contextKeyService]));
            this.toolbar = this._register(scopedInstantiationService.createInstance(toolbar_1.MenuWorkbenchToolBar, this.element, actions_1.MenuId.ChatCodeBlock, {
                menuOptions: {
                    shouldForwardArgs: true
                }
            }));
            this._configureForScreenReader();
            this._register(this.accessibilityService.onDidChangeScreenReaderOptimized(() => this._configureForScreenReader()));
            this._register(this.configurationService.onDidChangeConfiguration((e) => {
                if (e.affectedKeys.has("accessibility.verbosity.panelChat" /* AccessibilityVerbositySettingId.Chat */)) {
                    this._configureForScreenReader();
                }
            }));
            const editorElement = dom.append(this.element, $('.interactive-result-editor'));
            this.editor = this._register(scopedInstantiationService.createInstance(codeEditorWidget_1.CodeEditorWidget, editorElement, {
                ...(0, simpleEditorOptions_1.getSimpleEditorOptions)(this.configurationService),
                readOnly: true,
                lineNumbers: 'off',
                selectOnLineNumbers: true,
                scrollBeyondLastLine: false,
                lineDecorationsWidth: 8,
                dragAndDrop: false,
                padding: { top: defaultCodeblockPadding, bottom: defaultCodeblockPadding },
                mouseWheelZoom: false,
                scrollbar: {
                    alwaysConsumeMouseWheel: false
                },
                ariaLabel: (0, nls_1.localize)('chat.codeBlockHelp', 'Code block'),
                ...this.getEditorOptionsFromConfig()
            }, {
                isSimpleWidget: true,
                contributions: editorExtensions_1.EditorExtensionsRegistry.getSomeEditorContributions([
                    menuPreventer_1.MenuPreventer.ID,
                    selectionClipboard_1.SelectionClipboardContributionID,
                    contextmenu_1.ContextMenuController.ID,
                    wordHighlighter_1.WordHighlighterContribution.ID,
                    viewportSemanticTokens_1.ViewportSemanticTokensContribution.ID,
                    bracketMatching_1.BracketMatchingController.ID,
                    smartSelect_1.SmartSelectController.ID,
                ])
            }));
            this._register(this.options.onDidChange(() => {
                this.editor.updateOptions(this.getEditorOptionsFromConfig());
            }));
            this._register(this.editor.onDidScrollChange(e => {
                this.currentScrollWidth = e.scrollWidth;
            }));
            this._register(this.editor.onDidContentSizeChange(e => {
                if (e.contentHeightChanged) {
                    this._onDidChangeContentHeight.fire(e.contentHeight);
                }
            }));
            this._register(this.editor.onDidBlurEditorWidget(() => {
                this.element.classList.remove('focused');
                wordHighlighter_1.WordHighlighterContribution.get(this.editor)?.stopHighlighting();
            }));
            this._register(this.editor.onDidFocusEditorWidget(() => {
                this.element.classList.add('focused');
                wordHighlighter_1.WordHighlighterContribution.get(this.editor)?.restoreViewState(true);
            }));
            this.textModel = this._register(this.modelService.createModel('', null, undefined));
            this.editor.setModel(this.textModel);
        }
        focus() {
            this.editor.focus();
        }
        updatePaddingForLayout() {
            // scrollWidth = "the width of the content that needs to be scrolled"
            // contentWidth = "the width of the area where content is displayed"
            const horizontalScrollbarVisible = this.currentScrollWidth > this.editor.getLayoutInfo().contentWidth;
            const scrollbarHeight = this.editor.getLayoutInfo().horizontalScrollbarHeight;
            const bottomPadding = horizontalScrollbarVisible ?
                Math.max(defaultCodeblockPadding - scrollbarHeight, 2) :
                defaultCodeblockPadding;
            this.editor.updateOptions({ padding: { top: defaultCodeblockPadding, bottom: bottomPadding } });
        }
        _configureForScreenReader() {
            const toolbarElt = this.toolbar.getElement();
            if (this.accessibilityService.isScreenReaderOptimized()) {
                toolbarElt.style.display = 'block';
                toolbarElt.ariaLabel = this.configurationService.getValue("accessibility.verbosity.panelChat" /* AccessibilityVerbositySettingId.Chat */) ? (0, nls_1.localize)('chat.codeBlock.toolbarVerbose', 'Toolbar for code block which can be reached via tab') : (0, nls_1.localize)('chat.codeBlock.toolbar', 'Code block toolbar');
            }
            else {
                toolbarElt.style.display = '';
            }
        }
        getEditorOptionsFromConfig() {
            return {
                wordWrap: this.options.configuration.resultEditor.wordWrap,
                fontLigatures: this.options.configuration.resultEditor.fontLigatures,
                bracketPairColorization: this.options.configuration.resultEditor.bracketPairColorization,
                fontFamily: this.options.configuration.resultEditor.fontFamily === 'default' ?
                    editorOptions_1.EDITOR_FONT_DEFAULTS.fontFamily :
                    this.options.configuration.resultEditor.fontFamily,
                fontSize: this.options.configuration.resultEditor.fontSize,
                fontWeight: this.options.configuration.resultEditor.fontWeight,
                lineHeight: this.options.configuration.resultEditor.lineHeight,
            };
        }
        layout(width) {
            const realContentHeight = this.editor.getContentHeight();
            const editorBorder = 2;
            this.editor.layout({ width: width - editorBorder, height: realContentHeight });
            this.updatePaddingForLayout();
        }
        render(data, width) {
            this.contextKeyService.updateParent(data.parentContextKeyService);
            if (this.options.configuration.resultEditor.wordWrap === 'on') {
                // Intialize the editor with the new proper width so that getContentHeight
                // will be computed correctly in the next call to layout()
                this.layout(width);
            }
            const text = this.fixCodeText(data.text, data.languageId);
            this.setText(text);
            const vscodeLanguageId = this.languageService.getLanguageIdByLanguageName(data.languageId) ?? undefined;
            this.setLanguage(vscodeLanguageId);
            this.layout(width);
            this.editor.updateOptions({ ariaLabel: (0, nls_1.localize)('chat.codeBlockLabel', "Code block {0}", data.codeBlockIndex + 1) });
            this.toolbar.context = {
                code: data.text,
                codeBlockIndex: data.codeBlockIndex,
                element: data.element,
                languageId: vscodeLanguageId
            };
            if ((0, chatViewModel_1.isResponseVM)(data.element) && data.element.errorDetails?.responseIsFiltered) {
                dom.hide(this.toolbar.getElement());
            }
            else {
                dom.show(this.toolbar.getElement());
            }
        }
        fixCodeText(text, languageId) {
            if (languageId === 'php') {
                if (!text.trim().startsWith('<')) {
                    return `<?php\n${text}\n?>`;
                }
            }
            return text;
        }
        setText(newText) {
            const currentText = this.textModel.getValue(1 /* EndOfLinePreference.LF */);
            if (newText === currentText) {
                return;
            }
            if (newText.startsWith(currentText)) {
                const text = newText.slice(currentText.length);
                const lastLine = this.textModel.getLineCount();
                const lastCol = this.textModel.getLineMaxColumn(lastLine);
                this.textModel.applyEdits([{ range: new range_1.Range(lastLine, lastCol, lastLine, lastCol), text }]);
            }
            else {
                // console.log(`Failed to optimize setText`);
                this.textModel.setValue(newText);
            }
        }
        setLanguage(vscodeLanguageId) {
            this.textModel.setLanguage(vscodeLanguageId ?? modesRegistry_1.PLAINTEXT_LANGUAGE_ID);
        }
    };
    CodeBlockPart = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, language_1.ILanguageService),
        __param(4, model_1.IModelService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, accessibility_1.IAccessibilityService)
    ], CodeBlockPart);
    let EditorPool = class EditorPool extends lifecycle_1.Disposable {
        get inUse() {
            return this._pool.inUse;
        }
        constructor(options, instantiationService) {
            super();
            this.options = options;
            this.instantiationService = instantiationService;
            this._pool = this._register(new ResourcePool(() => this.editorFactory()));
            // TODO listen to changes on options
        }
        editorFactory() {
            return this.instantiationService.createInstance(CodeBlockPart, this.options);
        }
        get() {
            const object = this._pool.get();
            let stale = false;
            return {
                object,
                isStale: () => stale,
                dispose: () => {
                    stale = true;
                    this._pool.release(object);
                }
            };
        }
    };
    EditorPool = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], EditorPool);
    let TreePool = class TreePool extends lifecycle_1.Disposable {
        get inUse() {
            return this._pool.inUse;
        }
        constructor(_onDidChangeVisibility, instantiationService, configService, themeService) {
            super();
            this._onDidChangeVisibility = _onDidChangeVisibility;
            this.instantiationService = instantiationService;
            this.configService = configService;
            this.themeService = themeService;
            this._pool = this._register(new ResourcePool(() => this.treeFactory()));
        }
        treeFactory() {
            const resourceLabels = this.instantiationService.createInstance(labels_1.ResourceLabels, { onDidChangeVisibility: this._onDidChangeVisibility });
            const container = $('.interactive-response-progress-tree');
            (0, explorerView_1.createFileIconThemableTreeContainerScope)(container, this.themeService);
            const tree = this.instantiationService.createInstance(listService_1.WorkbenchCompressibleAsyncDataTree, 'ChatListRenderer', container, new ChatListTreeDelegate(), new ChatListTreeCompressionDelegate(), [new ChatListTreeRenderer(resourceLabels, this.configService.getValue('explorer.decorations'))], new ChatListTreeDataSource(), {
                collapseByDefault: () => false,
                expandOnlyOnTwistieClick: () => false,
                identityProvider: {
                    getId: (e) => e.uri.toString()
                },
                accessibilityProvider: {
                    getAriaLabel: (element) => element.label,
                    getWidgetAriaLabel: () => (0, nls_1.localize)('treeAriaLabel', "File Tree")
                },
                alwaysConsumeMouseWheel: false
            });
            return tree;
        }
        get() {
            const object = this._pool.get();
            let stale = false;
            return {
                object,
                isStale: () => stale,
                dispose: () => {
                    stale = true;
                    this._pool.release(object);
                }
            };
        }
    };
    TreePool = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, themeService_1.IThemeService)
    ], TreePool);
    // TODO does something in lifecycle.ts cover this?
    class ResourcePool extends lifecycle_1.Disposable {
        get inUse() {
            return this._inUse;
        }
        constructor(_itemFactory) {
            super();
            this._itemFactory = _itemFactory;
            this.pool = [];
            this._inUse = new Set;
        }
        get() {
            if (this.pool.length > 0) {
                const item = this.pool.pop();
                this._inUse.add(item);
                return item;
            }
            const item = this._register(this._itemFactory());
            this._inUse.add(item);
            return item;
        }
        release(item) {
            this._inUse.delete(item);
            this.pool.push(item);
        }
    }
    class ChatVoteButton extends menuEntryActionViewItem_1.MenuEntryActionViewItem {
        render(container) {
            super.render(container);
            container.classList.toggle('checked', this.action.checked);
        }
    }
    class ChatListTreeDelegate {
        static { this.ITEM_HEIGHT = 22; }
        getHeight(element) {
            return ChatListTreeDelegate.ITEM_HEIGHT;
        }
        getTemplateId(element) {
            return 'chatListTreeTemplate';
        }
    }
    class ChatListTreeCompressionDelegate {
        isIncompressible(element) {
            return !element.children;
        }
    }
    class ChatListTreeRenderer {
        constructor(labels, decorations) {
            this.labels = labels;
            this.decorations = decorations;
            this.templateId = 'chatListTreeTemplate';
        }
        renderCompressedElements(element, index, templateData, height) {
            templateData.label.element.style.display = 'flex';
            const label = element.element.elements.map((e) => e.label);
            templateData.label.setResource({ resource: element.element.elements[0].uri, name: label }, {
                title: element.element.elements[0].label,
                fileKind: element.children ? files_1.FileKind.FOLDER : files_1.FileKind.FILE,
                extraClasses: ['explorer-item'],
                fileDecorations: this.decorations
            });
        }
        renderTemplate(container) {
            const templateDisposables = new lifecycle_1.DisposableStore();
            const label = templateDisposables.add(this.labels.create(container, { supportHighlights: true }));
            return { templateDisposables, label };
        }
        renderElement(element, index, templateData, height) {
            templateData.label.element.style.display = 'flex';
            const hasExtension = /\.[^/.]+$/.test(element.element.label);
            if (!element.children.length && hasExtension) {
                templateData.label.setFile(element.element.uri, {
                    fileKind: files_1.FileKind.FILE,
                    hidePath: true,
                    fileDecorations: this.decorations,
                });
            }
            else {
                templateData.label.setResource({ resource: element.element.uri, name: element.element.label }, {
                    title: element.element.label,
                    fileKind: files_1.FileKind.FOLDER,
                    fileDecorations: this.decorations
                });
            }
        }
        disposeTemplate(templateData) {
            templateData.templateDisposables.dispose();
        }
    }
    class ChatListTreeDataSource {
        hasChildren(element) {
            return !!element.children;
        }
        async getChildren(element) {
            return element.children ?? [];
        }
    }
    function isInteractiveProgressTreeData(item) {
        return 'label' in item;
    }
    function isPlaceholderMarkdown(item) {
        return 'isPlaceholder' in item;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdExpc3RSZW5kZXJlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NoYXQvYnJvd3Nlci9jaGF0TGlzdFJlbmRlcmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUF5RWhHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFrQmhCLE1BQU0seUJBQXlCLEdBQUcsS0FBSyxDQUFDO0lBV2pDLElBQU0sb0JBQW9CLEdBQTFCLE1BQU0sb0JBQXFCLFNBQVEsc0JBQVU7O2lCQUNuQyxPQUFFLEdBQUcsTUFBTSxBQUFULENBQVU7UUF1QjVCLFlBQ2tCLGFBQWdDLEVBQ2hDLGVBQTZDLEVBQzdDLFFBQStCLEVBQ3pCLG9CQUE0RCxFQUM1RCxhQUFxRCxFQUMvRCxVQUF3QyxFQUNwQyxjQUFnRCxFQUNqRCxhQUE4QyxFQUMxQyxpQkFBc0QsRUFDNUQsV0FBMEM7WUFFeEQsS0FBSyxFQUFFLENBQUM7WUFYUyxrQkFBYSxHQUFiLGFBQWEsQ0FBbUI7WUFDaEMsb0JBQWUsR0FBZixlQUFlLENBQThCO1lBQzdDLGFBQVEsR0FBUixRQUFRLENBQXVCO1lBQ1IseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUMzQyxrQkFBYSxHQUFiLGFBQWEsQ0FBdUI7WUFDOUMsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUNuQixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDaEMsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQ3pCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDM0MsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUEvQnhDLDJCQUFzQixHQUFHLElBQUksR0FBRyxFQUFnQyxDQUFDO1lBQ2pFLDBCQUFxQixHQUFHLElBQUksaUJBQVcsRUFBc0IsQ0FBQztZQUU5RCwwQkFBcUIsR0FBRyxJQUFJLEdBQUcsRUFBK0IsQ0FBQztZQUMvRCxpQ0FBNEIsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztZQUl2RCx3QkFBbUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFzQixDQUFDLENBQUM7WUFDbEYsdUJBQWtCLEdBQThCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUM7WUFFckUsMkJBQXNCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBMkIsQ0FBQyxDQUFDO1lBQzFGLDBCQUFxQixHQUFtQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDO1lBSzNGLHdCQUFtQixHQUFXLENBQUMsQ0FBQztZQUNoQyxlQUFVLEdBQUcsSUFBSSxDQUFDO1lBQ2xCLDJCQUFzQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVcsQ0FBQyxDQUFDO1lBZXZFLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxtQ0FBZ0IsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMvRSxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFDNUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3hILENBQUM7UUFFRCxJQUFJLFVBQVU7WUFDYixPQUFPLHNCQUFvQixDQUFDLEVBQUUsQ0FBQztRQUNoQyxDQUFDO1FBRU8sV0FBVyxDQUFDLE1BQWMsRUFBRSxPQUFlO1lBQ2xELElBQUkseUJBQXlCLEVBQUU7Z0JBQzlCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLHdCQUF3QixNQUFNLEtBQUssT0FBTyxFQUFFLENBQUMsQ0FBQzthQUNuRTtpQkFBTTtnQkFDTixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsTUFBTSxLQUFLLE9BQU8sRUFBRSxDQUFDLENBQUM7YUFDcEU7UUFDRixDQUFDO1FBRU8sd0JBQXdCO1lBQy9CLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxzREFBc0QsQ0FBQyxDQUFDO1FBQzdGLENBQUM7UUFFTyx3QkFBd0IsQ0FBQyxPQUErQjtZQUMvRCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxtREFBbUQsQ0FBQyxDQUFDO1lBQ3hHLElBQUksT0FBTyxjQUFjLEtBQUssUUFBUSxFQUFFO2dCQUN2QyxPQUFPLGNBQWMsQ0FBQzthQUN0QjtZQUVELElBQUksT0FBTyxDQUFDLFVBQVUsRUFBRTtnQkFDdkIsT0FBTyxFQUFFLENBQUM7YUFDVjtZQUVELElBQUksT0FBTyxDQUFDLG9CQUFvQixJQUFJLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxtQkFBbUIsRUFBRTtnQkFDckYsd0tBQXdLO2dCQUN4Syx5SUFBeUk7Z0JBQ3pJLGdHQUFnRztnQkFDaEcsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDO2dCQUN0QixPQUFPLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxtQkFBbUIsR0FBRyxTQUFTLENBQUM7YUFDcEU7WUFFRCxPQUFPLENBQUMsQ0FBQztRQUNWLENBQUM7UUFFRCw0QkFBNEIsQ0FBQyxRQUFnQztZQUM1RCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNoRSxPQUFPLFVBQVUsSUFBSSxFQUFFLENBQUM7UUFDekIsQ0FBQztRQUVELHlCQUF5QixDQUFDLEdBQVE7WUFDakMsT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFFRCwyQkFBMkIsQ0FBQyxRQUFnQztZQUMzRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUM5RCxPQUFPLFNBQVMsSUFBSSxFQUFFLENBQUM7UUFDeEIsQ0FBQztRQUVELGlDQUFpQyxDQUFDLFFBQWdDO1lBQ2pFLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzlELE1BQU0sd0JBQXdCLEdBQUcsSUFBSSxDQUFDLDRCQUE0QixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDcEYsSUFBSSxTQUFTLEVBQUUsTUFBTSxJQUFJLHdCQUF3QixLQUFLLFNBQVMsSUFBSSx3QkFBd0IsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFO2dCQUMvRyxPQUFPLFNBQVMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO2FBQzNDO1lBQ0QsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUVELFVBQVUsQ0FBQyxPQUFnQjtZQUMxQixJQUFJLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQztZQUMxQixJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzNDLENBQUM7UUFFRCxNQUFNLENBQUMsS0FBYTtZQUNuQixJQUFJLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLGVBQWU7WUFDdEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUN2QyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBQ3pDLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELGNBQWMsQ0FBQyxTQUFzQjtZQUNwQyxNQUFNLG1CQUFtQixHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBQ2xELE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLENBQUM7WUFDN0UsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsS0FBSyxTQUFTLEVBQUU7Z0JBQ25ELFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUM7YUFDdkQ7WUFDRCxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUN0RCxNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUM1QyxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUM5QyxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUNwRCxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNwRCxNQUFNLGtCQUFrQixHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBRWpELE1BQU0saUJBQWlCLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUNyRyxNQUFNLDBCQUEwQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsSUFBSSxxQ0FBaUIsQ0FBQyxDQUFDLCtCQUFrQixFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pJLE1BQU0sWUFBWSxHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxjQUFjLENBQUMsOEJBQW9CLEVBQUUsTUFBTSxFQUFFLGdCQUFNLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQzdJLFdBQVcsRUFBRTtvQkFDWixpQkFBaUIsRUFBRSxJQUFJO2lCQUN2QjtnQkFDRCxzQkFBc0IsRUFBRSxDQUFDLE1BQWUsRUFBRSxPQUErQixFQUFFLEVBQUU7b0JBQzVFLElBQUksTUFBTSxZQUFZLHdCQUFjLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxnQ0FBZ0MsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyw4QkFBOEIsQ0FBQyxFQUFFO3dCQUNuSixPQUFPLDBCQUEwQixDQUFDLGNBQWMsQ0FBQyxjQUFjLEVBQUUsTUFBTSxFQUFFLE9BQTBDLENBQUMsQ0FBQztxQkFDckg7b0JBRUQsT0FBTyxTQUFTLENBQUM7Z0JBQ2xCLENBQUM7YUFDRCxDQUFDLENBQUMsQ0FBQztZQUdKLE1BQU0sUUFBUSxHQUEwQixFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxrQkFBa0IsRUFBRSxZQUFZLEVBQUUsbUJBQW1CLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQztZQUM1SixPQUFPLFFBQVEsQ0FBQztRQUNqQixDQUFDO1FBRUQsYUFBYSxDQUFDLElBQXlDLEVBQUUsS0FBYSxFQUFFLFlBQW1DO1lBQzFHLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUM7WUFDekIsTUFBTSxJQUFJLEdBQUcsSUFBQSwyQkFBVyxFQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDOUMsSUFBQSw0QkFBWSxFQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDbkMsU0FBUyxDQUFDO1lBQ1osSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLEVBQUUsR0FBRyxJQUFJLFdBQVcsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUU3RCxrQ0FBZ0IsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDLENBQUMsR0FBRyxDQUFDLElBQUEsNEJBQVksRUFBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ25GLGlDQUFlLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFBLDJCQUFXLEVBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNqRixrREFBZ0MsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDLENBQUMsR0FBRyxDQUFDLElBQUEsNEJBQVksRUFBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDbkksSUFBSSxJQUFBLDRCQUFZLEVBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQzFCLHVDQUFxQixDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyw2Q0FBK0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyw2Q0FBK0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDbk07aUJBQU07Z0JBQ04sdUNBQXFCLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUNyRTtZQUVELFlBQVksQ0FBQyxZQUFZLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztZQUU1QyxNQUFNLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFBLDRCQUFZLEVBQUMsT0FBTyxDQUFDLElBQUksT0FBTyxDQUFDLFlBQVksRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1lBQ3pGLDJDQUF5QixDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFakYsWUFBWSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFLElBQUEsMkJBQVcsRUFBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLFlBQVksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsRUFBRSxJQUFBLDRCQUFZLEVBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUMxRixZQUFZLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUsSUFBQSwyQkFBVyxFQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDeEYsWUFBWSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLG1CQUFtQixFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzVFLFlBQVksQ0FBQyxRQUFRLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUM7WUFFckQsSUFBSSxPQUFPLENBQUMsYUFBYSxFQUFFO2dCQUMxQixNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFtQixVQUFVLENBQUMsQ0FBQztnQkFDdkQsVUFBVSxDQUFDLEdBQUcsR0FBRyxvQkFBVSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNsRixZQUFZLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUNoRDtpQkFBTTtnQkFDTixNQUFNLFdBQVcsR0FBRyxJQUFBLDJCQUFXLEVBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLGtCQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxrQkFBTyxDQUFDLEtBQUssQ0FBQztnQkFDM0UsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxxQkFBUyxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUMvRCxZQUFZLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUNoRDtZQUVELDZCQUE2QjtZQUM3Qix1Q0FBdUM7WUFDdkMseURBQXlEO1lBQ3pELHFDQUFxQztZQUNyQyxpS0FBaUs7WUFDakssc0RBQXNEO1lBQ3RELElBQUksSUFBQSw0QkFBWSxFQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssS0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxFQUFFO2dCQUNyTCxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsRUFBRSw0QkFBNEIsSUFBSSxXQUFXLEtBQUssRUFBRSxDQUFDLENBQUM7Z0JBQ3RGLE1BQU0sK0JBQStCLEdBQUcsWUFBWSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxJQUFJLDJCQUFlLEVBQUUsQ0FBQyxDQUFDO2dCQUNuRyxNQUFNLEtBQUssR0FBRyxZQUFZLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLElBQUkscUJBQWEsRUFBRSxDQUFDLENBQUM7Z0JBQ3ZFLE1BQU0sb0JBQW9CLEdBQUcsQ0FBQyxPQUFpQixFQUFFLEVBQUU7b0JBQ2xELElBQUk7d0JBQ0gsSUFBSSxJQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSwrQkFBK0IsQ0FBQyxFQUFFOzRCQUMzRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7eUJBQ2Y7cUJBQ0Q7b0JBQUMsT0FBTyxHQUFHLEVBQUU7d0JBQ2Isd0ZBQXdGO3dCQUN4RixLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7d0JBQ2YsTUFBTSxHQUFHLENBQUM7cUJBQ1Y7Z0JBQ0YsQ0FBQyxDQUFDO2dCQUNGLEtBQUssQ0FBQyxZQUFZLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQzdDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO2FBQzNCO2lCQUFNLElBQUksSUFBQSw0QkFBWSxFQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNqQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQzthQUM5RTtpQkFBTSxJQUFJLElBQUEsMkJBQVcsRUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDaEMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsSUFBSSw0QkFBYyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7YUFDakc7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQzthQUNqRDtRQUNGLENBQUM7UUFFTyxrQkFBa0IsQ0FBQyxLQUF5RSxFQUFFLE9BQXFCLEVBQUUsS0FBYSxFQUFFLFlBQW1DO1lBQzlLLE1BQU0sc0JBQXNCLEdBQUcsSUFBQSw0QkFBWSxFQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxJQUFJLE9BQU8sQ0FBQyxVQUFVLElBQUksT0FBTyxDQUFDLFlBQVksRUFBRSxrQkFBa0IsSUFBSSxPQUFPLENBQUMsWUFBWSxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFFOUwsR0FBRyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEMsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDO1lBQ3RCLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO2dCQUN6QixNQUFNLE1BQU0sR0FBRyxPQUFPLElBQUksSUFBSTtvQkFDN0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxZQUFZLENBQUMsa0JBQWtCLEVBQUUsWUFBWSxFQUFFLHNCQUFzQixDQUFDO29CQUMzRyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFlBQVksQ0FBQyxrQkFBa0IsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLENBQUMsQ0FBQztnQkFDdEcsWUFBWSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUMvQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzVDO1lBRUQsSUFBSSxJQUFBLDRCQUFZLEVBQUMsT0FBTyxDQUFDLElBQUksT0FBTyxDQUFDLFlBQVksRUFBRSxPQUFPLEVBQUU7Z0JBQzNELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLGtCQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxrQkFBTyxDQUFDLEtBQUssQ0FBQztnQkFDcEYsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxxQ0FBcUMsRUFBRSxTQUFTLEVBQUUsSUFBQSx1QkFBVSxFQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDM0gsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7YUFDN0U7WUFFRCxJQUFJLElBQUEsNEJBQVksRUFBQyxPQUFPLENBQUMsSUFBSSxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxFQUFFO2dCQUM5RCxNQUFNLGtCQUFrQixHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsaUNBQWlDLENBQUMsQ0FBQyxDQUFDO2dCQUNoRyxZQUFZLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLElBQUksNkJBQWEsQ0FDcEQsa0JBQWtCLEVBQ2xCLE9BQU8sQ0FBQyxnQkFBZ0IsRUFDeEIsbUNBQW1CLEVBQ25CLFFBQVEsQ0FBQyxFQUFFO29CQUNWLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUM7d0JBQ2pDLFVBQVUsRUFBRSxPQUFPLENBQUMsVUFBVTt3QkFDOUIsTUFBTSxFQUFFOzRCQUNQLElBQUksRUFBRSxTQUFTOzRCQUNmLE9BQU8sRUFBRSxRQUFRO3lCQUNqQjtxQkFDRCxDQUFDLENBQUM7b0JBQ0gsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pGLENBQUMsRUFDRCxZQUFZLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO2FBQ2xDO1lBRUQsTUFBTSxTQUFTLEdBQUcsWUFBWSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUM7WUFDekQsTUFBTSxTQUFTLEdBQUcsQ0FBQyxPQUFPLENBQUMscUJBQXFCLElBQUksT0FBTyxDQUFDLHFCQUFxQixLQUFLLFNBQVMsQ0FBQztZQUNoRyxPQUFPLENBQUMscUJBQXFCLEdBQUcsU0FBUyxDQUFDO1lBQzFDLElBQUksU0FBUyxFQUFFO2dCQUNkLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLEdBQUcsRUFBRTtvQkFDdkUsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUNyQixJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO2dCQUNsRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ0o7UUFDRixDQUFDO1FBRU8sb0JBQW9CLENBQUMsT0FBcUMsRUFBRSxZQUFtQztZQUN0RyxHQUFHLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNsQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFFdkQsS0FBSyxNQUFNLElBQUksSUFBSSxPQUFPLENBQUMsT0FBTyxFQUFFO2dCQUNuQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ3hCLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsSUFBSSw2QkFBYSxDQUNwRCxZQUFZLENBQUMsS0FBSyxFQUNsQixJQUFJLEVBQ0osU0FBUyxFQUNULFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFDbkQsWUFBWSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztpQkFDbEM7cUJBQU07b0JBQ04sTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUF1QixFQUFFLE9BQU8sRUFBRSxZQUFZLENBQUMsa0JBQWtCLEVBQUUsWUFBWSxDQUFDLENBQUM7b0JBQ3BILEtBQUssTUFBTSxXQUFXLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDbEUsSUFBSSxXQUFXLENBQUMsV0FBVyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsV0FBVyxLQUFLLElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUU7NEJBQ2hILFdBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLENBQUM7eUJBQ3ZEO3FCQUNEO29CQUNELFlBQVksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDL0MsWUFBWSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDNUM7YUFDRDtZQUVELE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDO1lBQ3pELE1BQU0sU0FBUyxHQUFHLENBQUMsT0FBTyxDQUFDLHFCQUFxQixJQUFJLE9BQU8sQ0FBQyxxQkFBcUIsS0FBSyxTQUFTLENBQUM7WUFDaEcsT0FBTyxDQUFDLHFCQUFxQixHQUFHLFNBQVMsQ0FBQztZQUMxQyxJQUFJLFNBQVMsRUFBRTtnQkFDZCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxHQUFHLEVBQUU7b0JBQ3ZFLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDckIsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztnQkFDbEUsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNKO1FBQ0YsQ0FBQztRQUVEOztXQUVHO1FBQ0ssdUJBQXVCLENBQUMsT0FBK0IsRUFBRSxLQUFhLEVBQUUsWUFBbUMsRUFBRSxpQkFBMEIsRUFBRSxXQUE0QjtZQUM1SyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDckIsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUVwQixJQUFJLGVBQWUsR0FBRyxLQUFLLENBQUM7WUFDNUIsSUFBSSxPQUFPLENBQUMsVUFBVSxFQUFFO2dCQUN2QixJQUFJLENBQUMsV0FBVyxDQUFDLHNCQUFzQixFQUFFLG1CQUFtQixLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUNyRSxPQUFPLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztnQkFDL0IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7Z0JBQzlFLGVBQWUsR0FBRyxJQUFJLENBQUM7YUFDdkI7aUJBQU07Z0JBQ04sa0ZBQWtGO2dCQUNsRixNQUFNLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO2dCQUNuRCxPQUFPLENBQUMsVUFBVSxLQUFLLEVBQUUsYUFBYSxFQUFFLEVBQUUsRUFBRSxDQUFDO2dCQUM3QyxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQztnQkFDdkQsTUFBTSxnQkFBZ0IsR0FBdUIsRUFBRSxDQUFDO2dCQUNoRCxNQUFNLGFBQWEsR0FBNkMsRUFBRSxDQUFDO2dCQUVuRSxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUU7b0JBQzNDLE1BQU0sWUFBWSxHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDMUMsK0JBQStCO29CQUMvQixJQUFJLENBQUMsWUFBWSxFQUFFO3dCQUNsQixJQUFJLDZCQUE2QixDQUFDLElBQUksQ0FBQyxFQUFFOzRCQUN4QyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDO3lCQUM1Qjs2QkFBTTs0QkFDTixNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsMkJBQTJCLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLGlCQUFpQixFQUFFLENBQUMsRUFBRSxjQUFjLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQzs0QkFDckgsSUFBSSxlQUFlLEtBQUssU0FBUyxFQUFFO2dDQUNsQyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUc7b0NBQ3RCLGlCQUFpQixFQUFFLGVBQWUsQ0FBQyxlQUFlO29DQUNsRCxjQUFjLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRTtvQ0FDMUIsZUFBZSxFQUFFLGVBQWUsQ0FBQyxZQUFZO2lDQUM3QyxDQUFDO2dDQUNGLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxHQUFHLGVBQWUsQ0FBQzs2QkFDMUM7eUJBQ0Q7cUJBQ0Q7b0JBRUQsMEVBQTBFO3lCQUNyRSxJQUFJLDZCQUE2QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsWUFBWSxDQUFDLEVBQUU7d0JBQzdGLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUM7cUJBQzVCO29CQUVELGtDQUFrQzt5QkFDN0IsSUFBSSxDQUFDLDZCQUE2QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsWUFBWSxDQUFDLEVBQUU7d0JBQzlGLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDO3dCQUN0Riw2Q0FBNkM7d0JBQzdDLElBQUksZUFBZSxLQUFLLFNBQVMsSUFBSSxZQUFZLENBQUMsaUJBQWlCLEtBQUssZUFBZSxFQUFFLGVBQWUsRUFBRTs0QkFDekcsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHO2dDQUN0QixpQkFBaUIsRUFBRSxlQUFlLENBQUMsZUFBZTtnQ0FDbEQsY0FBYyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0NBQzFCLGVBQWUsRUFBRSxlQUFlLENBQUMsWUFBWTs2QkFDN0MsQ0FBQzs0QkFDRixnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxlQUFlLENBQUM7eUJBQzFDO3FCQUNEO2dCQUNGLENBQUMsQ0FBQyxDQUFDO2dCQUVILGVBQWUsR0FBRyxhQUFhLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztnQkFFN0MsSUFBSSxlQUFlLElBQUksT0FBTyxDQUFDLFVBQVUsRUFBRTtvQkFDMUMsa0VBQWtFO29CQUNsRSxJQUFJLENBQUMsV0FBVyxDQUFDLHNCQUFzQixFQUFFLGlDQUFpQyxLQUFLLHlEQUF5RCxLQUFLLEVBQUUsQ0FBQyxDQUFDO29CQUNqSixPQUFPLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztvQkFDL0IsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNwQixJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQztpQkFDOUU7cUJBQU0sSUFBSSxDQUFDLGVBQWUsRUFBRTtvQkFDNUIsSUFBSSwyQkFBMkIsR0FBRyxLQUFLLENBQUM7b0JBQ3hDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxZQUFZLEVBQUUsS0FBSyxFQUFFLEVBQUU7d0JBQzdDLElBQUksQ0FBQyxZQUFZLEVBQUU7NEJBQ2xCLE9BQU87eUJBQ1A7d0JBRUQsSUFBSSxNQUFNLENBQUM7d0JBQ1gsSUFBSSw2QkFBNkIsQ0FBQyxZQUFZLENBQUMsRUFBRTs0QkFDaEQsTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO3lCQUN0Rjt3QkFFRCwrRUFBK0U7NkJBQzFFLElBQUksQ0FBQywyQkFBMkIsRUFBRTs0QkFDdEMsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUMxQyxNQUFNLGFBQWEsR0FBRyxxQkFBcUIsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDOzRCQUN4RSxNQUFNLEdBQUcsYUFBYTtnQ0FDckIsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLDRCQUFjLENBQUMsS0FBSyxDQUFDLEVBQUUsWUFBWSxDQUFDO2dDQUNqRSxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLDRCQUFjLENBQUMsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7NEJBQzVGLDJCQUEyQixHQUFHLElBQUksQ0FBQzt5QkFDbkM7d0JBRUQsSUFBSSxDQUFDLE1BQU0sRUFBRTs0QkFDWixPQUFPO3lCQUNQO3dCQUVELCtCQUErQjt3QkFDL0IsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLFlBQVksQ0FBQzt3QkFDcEMsTUFBTSxlQUFlLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQzNELElBQUksZUFBZSxFQUFFOzRCQUNwQixZQUFZLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLGVBQWUsQ0FBQyxDQUFDO3lCQUNqRTs2QkFBTTs0QkFDTixZQUFZLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7eUJBQy9DO3dCQUNELFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ3pCLENBQUMsQ0FBQyxDQUFDO2lCQUNIO3FCQUFNO29CQUNOLGdEQUFnRDtvQkFDaEQsT0FBTyxLQUFLLENBQUM7aUJBQ2I7YUFDRDtZQUVELDJDQUEyQztZQUMzQyxNQUFNLE1BQU0sR0FBRyxZQUFZLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQztZQUN0RCxPQUFPLENBQUMscUJBQXFCLEdBQUcsTUFBTSxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtnQkFDdkIsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsWUFBWSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO2FBQzlGO1lBRUQsT0FBTyxlQUFlLENBQUM7UUFDeEIsQ0FBQztRQUVPLGNBQWMsQ0FBQyxJQUF1QyxFQUFFLE9BQXFCLEVBQUUsV0FBNEIsRUFBRSxZQUFtQyxFQUFFLGFBQXFCO1lBQzlLLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDakMsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztZQUV4QixNQUFNLGVBQWUsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUM5QyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDeEMsSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUM1QyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUN2QztZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3RELElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFlBQVksQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztZQUMvRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQzVDLENBQUMsQ0FBQyxZQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ2hDLENBQUMsQ0FBQyxZQUFZLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDbEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDN0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsRUFBRTtvQkFDbkIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUNkLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFlBQVksQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztpQkFDOUY7WUFDRixDQUFDLENBQUMsQ0FBQztZQUVILElBQUksSUFBQSw0QkFBWSxFQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUMxQixNQUFNLGlCQUFpQixHQUFHO29CQUN6QixVQUFVLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUU7b0JBQy9CLFNBQVMsRUFBRSxhQUFhO29CQUN4QixLQUFLO3dCQUNKLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDakIsQ0FBQztpQkFDRCxDQUFDO2dCQUVGLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7b0JBQ3hDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDaEYsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFSixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ25FLFNBQVMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztnQkFDbEMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLElBQUEsaUJBQVEsRUFBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUNyRixXQUFXLENBQUMsR0FBRyxDQUFDLElBQUEsd0JBQVksRUFBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzdJO1lBRUQsT0FBTztnQkFDTixPQUFPLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLGFBQWM7Z0JBQzdDLE9BQU8sRUFBRSxHQUFHLEVBQUU7b0JBQ2IsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUMxQixHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ2YsQ0FBQzthQUNELENBQUM7UUFDSCxDQUFDO1FBRU8saUJBQWlCLENBQUMsUUFBeUIsRUFBRSxZQUFtQztZQUN2RixNQUFNLE9BQU8sR0FBRyxDQUFDLENBQUMsdUNBQXVDLEVBQUUsU0FBUyxFQUFFLElBQUEsdUJBQVUsRUFBQyxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdkcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsMENBQTBDLENBQUMsQ0FBQztZQUNsRSxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFdkQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDL0MsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsMENBQTBDLENBQUM7WUFDdkUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFcEMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQzlELENBQUM7UUFFTyxjQUFjLENBQUMsUUFBeUIsRUFBRSxPQUFxQixFQUFFLFdBQTRCLEVBQUUsWUFBbUMsRUFBRSxzQkFBc0IsR0FBRyxLQUFLO1lBQ3pLLE1BQU0sZUFBZSxHQUFrQixFQUFFLENBQUM7WUFDMUMsSUFBSSxjQUFjLEdBQUcsQ0FBQyxDQUFDO1lBRXZCLDZFQUE2RTtZQUM3RSxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDdkQsTUFBTSxnQkFBZ0IsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzlGLE1BQU0sUUFBUSxHQUFHLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1lBQy9HLFFBQVEsR0FBRyxJQUFJLDRCQUFjLENBQUMsUUFBUSxFQUFFO2dCQUN2QyxTQUFTLEVBQUU7b0JBQ1Ysb0RBQW9EO29CQUNwRCxlQUFlLEVBQUUsT0FBTyxRQUFRLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFO2lCQUN4RzthQUNELENBQUMsQ0FBQztZQUVILE1BQU0sVUFBVSxHQUF5QixFQUFFLENBQUM7WUFDNUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO2dCQUM3QyxzQkFBc0I7Z0JBQ3RCLHFCQUFxQixFQUFFLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxFQUFFO29CQUMzQyxNQUFNLElBQUksR0FBRyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxFQUFFLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxZQUFZLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztvQkFDdEksTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7b0JBRXBELGdKQUFnSjtvQkFDaEoseUhBQXlIO29CQUN6SCxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsd0JBQXdCLENBQUMsR0FBRyxFQUFFO3dCQUN4RCxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQzt3QkFDNUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsWUFBWSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO29CQUMvRixDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUVKLElBQUksSUFBQSw0QkFBWSxFQUFDLE9BQU8sQ0FBQyxFQUFFO3dCQUMxQixNQUFNLElBQUksR0FBdUI7NEJBQ2hDLGNBQWMsRUFBRSxJQUFJLENBQUMsY0FBYzs0QkFDbkMsT0FBTzs0QkFDUCxLQUFLO2dDQUNKLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7NEJBQ3BCLENBQUM7eUJBQ0QsQ0FBQzt3QkFDRixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUN0QixJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQzt3QkFDL0QsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQ2pHO29CQUNELGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQzFCLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7Z0JBQzNCLENBQUM7YUFDRCxDQUFDLENBQUM7WUFFSCxJQUFJLElBQUEsNEJBQVksRUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDMUIsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2dCQUN4RCxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUEsd0JBQVksRUFBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDcEY7WUFFRCxJQUFJLGdCQUFnQixFQUFFO2dCQUNyQixNQUFNLG1CQUFtQixHQUFHLENBQUMsQ0FBQyxnQ0FBZ0MsRUFBRSxFQUFFLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsRUFBRSxJQUFJLGdCQUFnQixDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7Z0JBQ3JJLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLFdBQVcsRUFBRSxLQUFLLEdBQUcsRUFBRTtvQkFDOUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLG1CQUFtQixFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUNsRztxQkFBTTtvQkFDTixNQUFNLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxtQkFBbUIsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7aUJBQy9GO2FBQ0Q7WUFFRCxlQUFlLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNELE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUVPLGVBQWUsQ0FBQyxJQUE4QixFQUFFLFdBQTRCO1lBQ25GLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDbkMsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztZQUM5QixVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUVsRCxPQUFPLEdBQUcsQ0FBQztRQUNaLENBQUM7UUFFTywyQkFBMkIsQ0FBQyxPQUErQixFQUFFLElBQXFCLEVBQUUsVUFBeUY7WUFDcEwsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3BELE1BQU0sZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLGNBQWMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDekQsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsVUFBVSxDQUFDLGlCQUFpQjtvQkFDNUIsNERBQTREO29CQUM1RCxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLFVBQVUsQ0FBQyxjQUFjLENBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFFcEUsSUFBSSxnQkFBZ0IsS0FBSyxVQUFVLENBQUMsaUJBQWlCLEVBQUU7Z0JBQ3RELE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBRUQsT0FBTyxJQUFBLDJCQUFTLEVBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFFRCxjQUFjLENBQUMsSUFBeUMsRUFBRSxLQUFhLEVBQUUsWUFBbUM7WUFDM0csWUFBWSxDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3pDLENBQUM7UUFFRCxlQUFlLENBQUMsWUFBbUM7WUFDbEQsWUFBWSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzVDLENBQUM7O0lBcmtCVyxvREFBb0I7bUNBQXBCLG9CQUFvQjtRQTRCOUIsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsaUJBQVcsQ0FBQTtRQUNYLFdBQUEsMEJBQWUsQ0FBQTtRQUNmLFdBQUEsdUJBQWMsQ0FBQTtRQUNkLFdBQUEsK0JBQWtCLENBQUE7UUFDbEIsV0FBQSwwQkFBWSxDQUFBO09BbENGLG9CQUFvQixDQXNrQmhDO0lBRU0sSUFBTSxnQkFBZ0IsR0FBdEIsTUFBTSxnQkFBZ0I7UUFDNUIsWUFDK0IsVUFBdUI7WUFBdkIsZUFBVSxHQUFWLFVBQVUsQ0FBYTtRQUNsRCxDQUFDO1FBRUcsWUFBWSxDQUFDLE1BQWMsRUFBRSxPQUFlO1lBQ25ELElBQUkseUJBQXlCLEVBQUU7Z0JBQzlCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLG9CQUFvQixNQUFNLEtBQUssT0FBTyxFQUFFLENBQUMsQ0FBQzthQUMvRDtpQkFBTTtnQkFDTixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsTUFBTSxLQUFLLE9BQU8sRUFBRSxDQUFDLENBQUM7YUFDaEU7UUFDRixDQUFDO1FBRUQsU0FBUyxDQUFDLE9BQXFCO1lBQzlCLE1BQU0sSUFBSSxHQUFHLElBQUEsMkJBQVcsRUFBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7WUFDM0QsTUFBTSxNQUFNLEdBQUcsQ0FBQyx1QkFBdUIsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxDQUFDO1lBQ3ZHLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLEdBQUcsSUFBSSxZQUFZLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFDNUQsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRUQsYUFBYSxDQUFDLE9BQXFCO1lBQ2xDLE9BQU8sb0JBQW9CLENBQUMsRUFBRSxDQUFDO1FBQ2hDLENBQUM7UUFFRCxnQkFBZ0IsQ0FBQyxPQUFxQjtZQUNyQyxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7S0FDRCxDQUFBO0lBM0JZLDRDQUFnQjsrQkFBaEIsZ0JBQWdCO1FBRTFCLFdBQUEsaUJBQVcsQ0FBQTtPQUZELGdCQUFnQixDQTJCNUI7SUFFTSxJQUFNLHlCQUF5QixHQUEvQixNQUFNLHlCQUF5QjtRQUVyQyxZQUMwQyxzQkFBOEM7WUFBOUMsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF3QjtRQUd4RixDQUFDO1FBQ0QsYUFBYTtZQUNaLE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUVELE9BQU8sQ0FBQyxPQUFxQjtZQUM1QixPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDO1FBRUQsa0JBQWtCO1lBQ2pCLE9BQU8sSUFBQSxjQUFRLEVBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFFRCxZQUFZLENBQUMsT0FBcUI7WUFDakMsSUFBSSxJQUFBLDJCQUFXLEVBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ3pCLE9BQU8sT0FBTyxDQUFDLFdBQVcsQ0FBQzthQUMzQjtZQUVELElBQUksSUFBQSw0QkFBWSxFQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUMxQixPQUFPLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUNqRDtZQUVELElBQUksSUFBQSwyQkFBVyxFQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUN6QixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDcEg7WUFFRCxPQUFPLEVBQUUsQ0FBQztRQUNYLENBQUM7UUFFTywyQkFBMkIsQ0FBQyxPQUErQjtZQUNsRSxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxlQUFlLGdGQUFzQyxDQUFDO1lBQzdHLElBQUksS0FBSyxHQUFXLEVBQUUsQ0FBQztZQUN2QixJQUFJLG1CQUFtQixDQUFDO1lBQ3hCLE1BQU0scUJBQXFCLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixFQUFFLE1BQU0sSUFBSSxDQUFDLENBQUM7WUFDcEUsUUFBUSxxQkFBcUIsRUFBRTtnQkFDOUIsS0FBSyxDQUFDO29CQUNMLE1BQU07Z0JBQ1AsS0FBSyxDQUFDO29CQUNMLG1CQUFtQixHQUFHLElBQUEsY0FBUSxFQUFDLHFCQUFxQixFQUFFLGNBQWMsRUFBRSxPQUFPLENBQUMsZ0JBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQzFHLE1BQU07Z0JBQ1A7b0JBQ0MsbUJBQW1CLEdBQUcsSUFBQSxjQUFRLEVBQUMseUJBQXlCLEVBQUUsZUFBZSxFQUFFLE9BQU8sQ0FBQyxnQkFBaUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDbEo7WUFDRCxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLElBQUksQ0FBQyxDQUFDO1lBQ3pGLElBQUksaUJBQWlCLEdBQUcsRUFBRSxDQUFDO1lBQzNCLFFBQVEsYUFBYSxFQUFFO2dCQUN0QixLQUFLLENBQUM7b0JBQ0wsTUFBTTtnQkFDUCxLQUFLLENBQUM7b0JBQ0wsaUJBQWlCLEdBQUcsSUFBQSxjQUFRLEVBQUMsb0JBQW9CLEVBQUUsYUFBYSxDQUFDLENBQUM7b0JBQ2xFLE1BQU07Z0JBQ1A7b0JBQ0MsaUJBQWlCLEdBQUcsSUFBQSxjQUFRLEVBQUMsbUJBQW1CLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxDQUFDLENBQUM7b0JBQ25GLE1BQU07YUFDUDtZQUNELE1BQU0sY0FBYyxHQUFHLGVBQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDLEVBQUUsTUFBTSxJQUFJLENBQUMsQ0FBQztZQUNySCxRQUFRLGNBQWMsRUFBRTtnQkFDdkIsS0FBSyxDQUFDO29CQUNMLEtBQUssR0FBRyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsSUFBQSxjQUFRLEVBQUMsa0JBQWtCLEVBQUUsYUFBYSxFQUFFLGlCQUFpQixFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBQSxjQUFRLEVBQUMsY0FBYyxFQUFFLFNBQVMsRUFBRSxpQkFBaUIsRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7b0JBQ25PLE1BQU07Z0JBQ1AsS0FBSyxDQUFDO29CQUNMLEtBQUssR0FBRyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsSUFBQSxjQUFRLEVBQUMscUJBQXFCLEVBQUUsMkJBQTJCLEVBQUUsaUJBQWlCLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFBLGNBQVEsRUFBQyxpQkFBaUIsRUFBRSx1QkFBdUIsRUFBRSxpQkFBaUIsRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7b0JBQ3JRLE1BQU07Z0JBQ1A7b0JBQ0MsS0FBSyxHQUFHLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxJQUFBLGNBQVEsRUFBQyxvQkFBb0IsRUFBRSwwQkFBMEIsRUFBRSxpQkFBaUIsRUFBRSxjQUFjLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFBLGNBQVEsRUFBQyxnQkFBZ0IsRUFBRSxxQkFBcUIsRUFBRSxpQkFBaUIsRUFBRSxjQUFjLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO29CQUNoUyxNQUFNO2FBQ1A7WUFDRCxPQUFPLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDekUsQ0FBQztLQUNELENBQUE7SUEzRVksOERBQXlCO3dDQUF6Qix5QkFBeUI7UUFHbkMsV0FBQSx1Q0FBc0IsQ0FBQTtPQUhaLHlCQUF5QixDQTJFckM7SUFvQkQsTUFBTSx1QkFBdUIsR0FBRyxFQUFFLENBQUM7SUFFbkMsSUFBTSxhQUFhLEdBQW5CLE1BQU0sYUFBYyxTQUFRLHNCQUFVO1FBYXJDLFlBQ2tCLE9BQTBCLEVBQ3BCLG9CQUEyQyxFQUM5QyxpQkFBcUMsRUFDdkMsZUFBa0QsRUFDckQsWUFBNEMsRUFDcEMsb0JBQTRELEVBQzVELG9CQUE0RDtZQUVuRixLQUFLLEVBQUUsQ0FBQztZQVJTLFlBQU8sR0FBUCxPQUFPLENBQW1CO1lBR1Isb0JBQWUsR0FBZixlQUFlLENBQWtCO1lBQ3BDLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ25CLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDM0MseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQW5CbkUsOEJBQXlCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBVSxDQUFDLENBQUM7WUFDbkUsNkJBQXdCLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEtBQUssQ0FBQztZQVN4RSx1QkFBa0IsR0FBRyxDQUFDLENBQUM7WUFZOUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsb0NBQW9DLENBQUMsQ0FBQztZQUN2RCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDdEYsTUFBTSwwQkFBMEIsR0FBRyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsSUFBSSxxQ0FBaUIsQ0FBQyxDQUFDLCtCQUFrQixFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6SSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsMEJBQTBCLENBQUMsY0FBYyxDQUFDLDhCQUFvQixFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsZ0JBQU0sQ0FBQyxhQUFhLEVBQUU7Z0JBQ2pJLFdBQVcsRUFBRTtvQkFDWixpQkFBaUIsRUFBRSxJQUFJO2lCQUN2QjthQUNELENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7WUFDakMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsZ0NBQWdDLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ25ILElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3ZFLElBQUksQ0FBQyxDQUFDLFlBQVksQ0FBQyxHQUFHLGdGQUFzQyxFQUFFO29CQUM3RCxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztpQkFDakM7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osTUFBTSxhQUFhLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLENBQUM7WUFDaEYsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLDBCQUEwQixDQUFDLGNBQWMsQ0FBQyxtQ0FBZ0IsRUFBRSxhQUFhLEVBQUU7Z0JBQ3ZHLEdBQUcsSUFBQSw0Q0FBc0IsRUFBQyxJQUFJLENBQUMsb0JBQW9CLENBQUM7Z0JBQ3BELFFBQVEsRUFBRSxJQUFJO2dCQUNkLFdBQVcsRUFBRSxLQUFLO2dCQUNsQixtQkFBbUIsRUFBRSxJQUFJO2dCQUN6QixvQkFBb0IsRUFBRSxLQUFLO2dCQUMzQixvQkFBb0IsRUFBRSxDQUFDO2dCQUN2QixXQUFXLEVBQUUsS0FBSztnQkFDbEIsT0FBTyxFQUFFLEVBQUUsR0FBRyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sRUFBRSx1QkFBdUIsRUFBRTtnQkFDMUUsY0FBYyxFQUFFLEtBQUs7Z0JBQ3JCLFNBQVMsRUFBRTtvQkFDVix1QkFBdUIsRUFBRSxLQUFLO2lCQUM5QjtnQkFDRCxTQUFTLEVBQUUsSUFBQSxjQUFRLEVBQUMsb0JBQW9CLEVBQUUsWUFBWSxDQUFDO2dCQUN2RCxHQUFHLElBQUksQ0FBQywwQkFBMEIsRUFBRTthQUNwQyxFQUFFO2dCQUNGLGNBQWMsRUFBRSxJQUFJO2dCQUNwQixhQUFhLEVBQUUsMkNBQXdCLENBQUMsMEJBQTBCLENBQUM7b0JBQ2xFLDZCQUFhLENBQUMsRUFBRTtvQkFDaEIscURBQWdDO29CQUNoQyxtQ0FBcUIsQ0FBQyxFQUFFO29CQUV4Qiw2Q0FBMkIsQ0FBQyxFQUFFO29CQUM5QiwyREFBa0MsQ0FBQyxFQUFFO29CQUNyQywyQ0FBeUIsQ0FBQyxFQUFFO29CQUM1QixtQ0FBcUIsQ0FBQyxFQUFFO2lCQUN4QixDQUFDO2FBQ0YsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRTtnQkFDNUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUMsQ0FBQztZQUM5RCxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNoRCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQztZQUN6QyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNyRCxJQUFJLENBQUMsQ0FBQyxvQkFBb0IsRUFBRTtvQkFDM0IsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7aUJBQ3JEO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3JELElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDekMsNkNBQTJCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxDQUFDO1lBQ2xFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsR0FBRyxFQUFFO2dCQUN0RCxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ3RDLDZDQUEyQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDcEYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFFRCxLQUFLO1lBQ0osSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNyQixDQUFDO1FBRU8sc0JBQXNCO1lBQzdCLHFFQUFxRTtZQUNyRSxvRUFBb0U7WUFDcEUsTUFBTSwwQkFBMEIsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxZQUFZLENBQUM7WUFDdEcsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQyx5QkFBeUIsQ0FBQztZQUM5RSxNQUFNLGFBQWEsR0FBRywwQkFBMEIsQ0FBQyxDQUFDO2dCQUNqRCxJQUFJLENBQUMsR0FBRyxDQUFDLHVCQUF1QixHQUFHLGVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4RCx1QkFBdUIsQ0FBQztZQUN6QixJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxFQUFFLE9BQU8sRUFBRSxFQUFFLEdBQUcsRUFBRSx1QkFBdUIsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2pHLENBQUM7UUFFTyx5QkFBeUI7WUFDaEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUM3QyxJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyx1QkFBdUIsRUFBRSxFQUFFO2dCQUN4RCxVQUFVLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7Z0JBQ25DLFVBQVUsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsZ0ZBQXNDLENBQUMsQ0FBQyxDQUFDLElBQUEsY0FBUSxFQUFDLCtCQUErQixFQUFFLHFEQUFxRCxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUEsY0FBUSxFQUFDLHdCQUF3QixFQUFFLG9CQUFvQixDQUFDLENBQUM7YUFDOVA7aUJBQU07Z0JBQ04sVUFBVSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO2FBQzlCO1FBRUYsQ0FBQztRQUVPLDBCQUEwQjtZQUNqQyxPQUFPO2dCQUNOLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsUUFBUTtnQkFDMUQsYUFBYSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxhQUFhO2dCQUNwRSx1QkFBdUIsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsdUJBQXVCO2dCQUN4RixVQUFVLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLFVBQVUsS0FBSyxTQUFTLENBQUMsQ0FBQztvQkFDN0Usb0NBQW9CLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQ2pDLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxVQUFVO2dCQUNuRCxRQUFRLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLFFBQVE7Z0JBQzFELFVBQVUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsVUFBVTtnQkFDOUQsVUFBVSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxVQUFVO2FBQzlELENBQUM7UUFDSCxDQUFDO1FBRUQsTUFBTSxDQUFDLEtBQWE7WUFDbkIsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDekQsTUFBTSxZQUFZLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssR0FBRyxZQUFZLEVBQUUsTUFBTSxFQUFFLGlCQUFpQixFQUFFLENBQUMsQ0FBQztZQUMvRSxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztRQUMvQixDQUFDO1FBRUQsTUFBTSxDQUFDLElBQThCLEVBQUUsS0FBYTtZQUNuRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1lBRWxFLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLFFBQVEsS0FBSyxJQUFJLEVBQUU7Z0JBQzlELDBFQUEwRTtnQkFDMUUsMERBQTBEO2dCQUMxRCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ25CO1lBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMxRCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRW5CLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQywyQkFBMkIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksU0FBUyxDQUFDO1lBQ3hHLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUVuQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25CLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUEsY0FBUSxFQUFDLHFCQUFxQixFQUFFLGdCQUFnQixFQUFFLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3JILElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFnQztnQkFDbkQsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO2dCQUNmLGNBQWMsRUFBRSxJQUFJLENBQUMsY0FBYztnQkFDbkMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO2dCQUNyQixVQUFVLEVBQUUsZ0JBQWdCO2FBQzVCLENBQUM7WUFFRixJQUFJLElBQUEsNEJBQVksRUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsa0JBQWtCLEVBQUU7Z0JBQ2hGLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO2FBQ3BDO2lCQUFNO2dCQUNOLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO2FBQ3BDO1FBQ0YsQ0FBQztRQUVPLFdBQVcsQ0FBQyxJQUFZLEVBQUUsVUFBa0I7WUFDbkQsSUFBSSxVQUFVLEtBQUssS0FBSyxFQUFFO2dCQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDakMsT0FBTyxVQUFVLElBQUksTUFBTSxDQUFDO2lCQUM1QjthQUNEO1lBRUQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU8sT0FBTyxDQUFDLE9BQWU7WUFDOUIsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLGdDQUF3QixDQUFDO1lBQ3BFLElBQUksT0FBTyxLQUFLLFdBQVcsRUFBRTtnQkFDNUIsT0FBTzthQUNQO1lBRUQsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxFQUFFO2dCQUNwQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDL0MsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDL0MsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDMUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLGFBQUssQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDOUY7aUJBQU07Z0JBQ04sNkNBQTZDO2dCQUM3QyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUNqQztRQUNGLENBQUM7UUFFTyxXQUFXLENBQUMsZ0JBQW9DO1lBQ3ZELElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLGdCQUFnQixJQUFJLHFDQUFxQixDQUFDLENBQUM7UUFDdkUsQ0FBQztLQUNELENBQUE7SUExTUssYUFBYTtRQWVoQixXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsK0JBQWtCLENBQUE7UUFDbEIsV0FBQSwyQkFBZ0IsQ0FBQTtRQUNoQixXQUFBLHFCQUFhLENBQUE7UUFDYixXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEscUNBQXFCLENBQUE7T0FwQmxCLGFBQWEsQ0EwTWxCO0lBT0QsSUFBTSxVQUFVLEdBQWhCLE1BQU0sVUFBVyxTQUFRLHNCQUFVO1FBR2xDLElBQVcsS0FBSztZQUNmLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFDekIsQ0FBQztRQUVELFlBQ2tCLE9BQTBCLEVBQ0gsb0JBQTJDO1lBRW5GLEtBQUssRUFBRSxDQUFDO1lBSFMsWUFBTyxHQUFQLE9BQU8sQ0FBbUI7WUFDSCx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBR25GLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLFlBQVksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRTFFLG9DQUFvQztRQUNyQyxDQUFDO1FBRU8sYUFBYTtZQUNwQixPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM5RSxDQUFDO1FBRUQsR0FBRztZQUNGLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDaEMsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ2xCLE9BQU87Z0JBQ04sTUFBTTtnQkFDTixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsS0FBSztnQkFDcEIsT0FBTyxFQUFFLEdBQUcsRUFBRTtvQkFDYixLQUFLLEdBQUcsSUFBSSxDQUFDO29CQUNiLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM1QixDQUFDO2FBQ0QsQ0FBQztRQUNILENBQUM7S0FDRCxDQUFBO0lBakNLLFVBQVU7UUFTYixXQUFBLHFDQUFxQixDQUFBO09BVGxCLFVBQVUsQ0FpQ2Y7SUFFRCxJQUFNLFFBQVEsR0FBZCxNQUFNLFFBQVMsU0FBUSxzQkFBVTtRQUdoQyxJQUFXLEtBQUs7WUFDZixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO1FBQ3pCLENBQUM7UUFFRCxZQUNTLHNCQUFzQyxFQUNOLG9CQUEyQyxFQUMzQyxhQUFvQyxFQUM1QyxZQUEyQjtZQUUzRCxLQUFLLEVBQUUsQ0FBQztZQUxBLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBZ0I7WUFDTix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQzNDLGtCQUFhLEdBQWIsYUFBYSxDQUF1QjtZQUM1QyxpQkFBWSxHQUFaLFlBQVksQ0FBZTtZQUczRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxZQUFZLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN6RSxDQUFDO1FBRU8sV0FBVztZQUNsQixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLHVCQUFjLEVBQUUsRUFBRSxxQkFBcUIsRUFBRSxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO1lBRXhJLE1BQU0sU0FBUyxHQUFHLENBQUMsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO1lBQzNELElBQUEsdURBQXdDLEVBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUV2RSxNQUFNLElBQUksR0FBNkcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FDOUosZ0RBQWtDLEVBQ2xDLGtCQUFrQixFQUNsQixTQUFTLEVBQ1QsSUFBSSxvQkFBb0IsRUFBRSxFQUMxQixJQUFJLCtCQUErQixFQUFFLEVBQ3JDLENBQUMsSUFBSSxvQkFBb0IsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLEVBQy9GLElBQUksc0JBQXNCLEVBQUUsRUFDNUI7Z0JBQ0MsaUJBQWlCLEVBQUUsR0FBRyxFQUFFLENBQUMsS0FBSztnQkFDOUIsd0JBQXdCLEVBQUUsR0FBRyxFQUFFLENBQUMsS0FBSztnQkFDckMsZ0JBQWdCLEVBQUU7b0JBQ2pCLEtBQUssRUFBRSxDQUFDLENBQW9DLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFO2lCQUNqRTtnQkFDRCxxQkFBcUIsRUFBRTtvQkFDdEIsWUFBWSxFQUFFLENBQUMsT0FBMEMsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUs7b0JBQzNFLGtCQUFrQixFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUEsY0FBUSxFQUFDLGVBQWUsRUFBRSxXQUFXLENBQUM7aUJBQ2hFO2dCQUNELHVCQUF1QixFQUFFLEtBQUs7YUFDOUIsQ0FBQyxDQUFDO1lBRUosT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQsR0FBRztZQUNGLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDaEMsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ2xCLE9BQU87Z0JBQ04sTUFBTTtnQkFDTixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsS0FBSztnQkFDcEIsT0FBTyxFQUFFLEdBQUcsRUFBRTtvQkFDYixLQUFLLEdBQUcsSUFBSSxDQUFDO29CQUNiLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM1QixDQUFDO2FBQ0QsQ0FBQztRQUNILENBQUM7S0FDRCxDQUFBO0lBM0RLLFFBQVE7UUFTWCxXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSw0QkFBYSxDQUFBO09BWFYsUUFBUSxDQTJEYjtJQUVELGtEQUFrRDtJQUVsRCxNQUFNLFlBQW9DLFNBQVEsc0JBQVU7UUFJM0QsSUFBVyxLQUFLO1lBQ2YsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3BCLENBQUM7UUFFRCxZQUNrQixZQUFxQjtZQUV0QyxLQUFLLEVBQUUsQ0FBQztZQUZTLGlCQUFZLEdBQVosWUFBWSxDQUFTO1lBUnRCLFNBQUksR0FBUSxFQUFFLENBQUM7WUFFeEIsV0FBTSxHQUFHLElBQUksR0FBTSxDQUFDO1FBUzVCLENBQUM7UUFFRCxHQUFHO1lBQ0YsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3pCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFHLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN0QixPQUFPLElBQUksQ0FBQzthQUNaO1lBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztZQUNqRCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0QixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFRCxPQUFPLENBQUMsSUFBTztZQUNkLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RCLENBQUM7S0FDRDtJQUVELE1BQU0sY0FBZSxTQUFRLGlEQUF1QjtRQUMxQyxNQUFNLENBQUMsU0FBc0I7WUFDckMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN4QixTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1RCxDQUFDO0tBQ0Q7SUFFRCxNQUFNLG9CQUFvQjtpQkFDVCxnQkFBVyxHQUFHLEVBQUUsQ0FBQztRQUVqQyxTQUFTLENBQUMsT0FBMEM7WUFDbkQsT0FBTyxvQkFBb0IsQ0FBQyxXQUFXLENBQUM7UUFDekMsQ0FBQztRQUVELGFBQWEsQ0FBQyxPQUEwQztZQUN2RCxPQUFPLHNCQUFzQixDQUFDO1FBQy9CLENBQUM7O0lBR0YsTUFBTSwrQkFBK0I7UUFDcEMsZ0JBQWdCLENBQUMsT0FBMEM7WUFDMUQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7UUFDMUIsQ0FBQztLQUNEO0lBT0QsTUFBTSxvQkFBb0I7UUFHekIsWUFBb0IsTUFBc0IsRUFBVSxXQUEyRDtZQUEzRixXQUFNLEdBQU4sTUFBTSxDQUFnQjtZQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUFnRDtZQUYvRyxlQUFVLEdBQVcsc0JBQXNCLENBQUM7UUFFdUUsQ0FBQztRQUVwSCx3QkFBd0IsQ0FBQyxPQUFnRixFQUFFLEtBQWEsRUFBRSxZQUEyQyxFQUFFLE1BQTBCO1lBQ2hNLFlBQVksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1lBQ2xELE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzNELFlBQVksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUU7Z0JBQzFGLEtBQUssRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLO2dCQUN4QyxRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsZ0JBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGdCQUFRLENBQUMsSUFBSTtnQkFDNUQsWUFBWSxFQUFFLENBQUMsZUFBZSxDQUFDO2dCQUMvQixlQUFlLEVBQUUsSUFBSSxDQUFDLFdBQVc7YUFDakMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUNELGNBQWMsQ0FBQyxTQUFzQjtZQUNwQyxNQUFNLG1CQUFtQixHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBQ2xELE1BQU0sS0FBSyxHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEcsT0FBTyxFQUFFLG1CQUFtQixFQUFFLEtBQUssRUFBRSxDQUFDO1FBQ3ZDLENBQUM7UUFDRCxhQUFhLENBQUMsT0FBMkQsRUFBRSxLQUFhLEVBQUUsWUFBMkMsRUFBRSxNQUEwQjtZQUNoSyxZQUFZLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUNsRCxNQUFNLFlBQVksR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDN0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxJQUFJLFlBQVksRUFBRTtnQkFDN0MsWUFBWSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUU7b0JBQy9DLFFBQVEsRUFBRSxnQkFBUSxDQUFDLElBQUk7b0JBQ3ZCLFFBQVEsRUFBRSxJQUFJO29CQUNkLGVBQWUsRUFBRSxJQUFJLENBQUMsV0FBVztpQkFDakMsQ0FBQyxDQUFDO2FBQ0g7aUJBQU07Z0JBQ04sWUFBWSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUU7b0JBQzlGLEtBQUssRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUs7b0JBQzVCLFFBQVEsRUFBRSxnQkFBUSxDQUFDLE1BQU07b0JBQ3pCLGVBQWUsRUFBRSxJQUFJLENBQUMsV0FBVztpQkFDakMsQ0FBQyxDQUFDO2FBQ0g7UUFDRixDQUFDO1FBQ0QsZUFBZSxDQUFDLFlBQTJDO1lBQzFELFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM1QyxDQUFDO0tBQ0Q7SUFFRCxNQUFNLHNCQUFzQjtRQUMzQixXQUFXLENBQUMsT0FBMEM7WUFDckQsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUMzQixDQUFDO1FBRUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUEwQztZQUMzRCxPQUFPLE9BQU8sQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDO1FBQy9CLENBQUM7S0FDRDtJQUVELFNBQVMsNkJBQTZCLENBQUMsSUFBMkY7UUFDakksT0FBTyxPQUFPLElBQUksSUFBSSxDQUFDO0lBQ3hCLENBQUM7SUFFRCxTQUFTLHFCQUFxQixDQUFDLElBQXNGO1FBQ3BILE9BQU8sZUFBZSxJQUFJLElBQUksQ0FBQztJQUNoQyxDQUFDIn0=