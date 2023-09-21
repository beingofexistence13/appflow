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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/marked/marked", "vs/base/common/network", "vs/base/common/themables", "vs/editor/browser/editorExtensions", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/common/config/editorOptions", "vs/editor/common/core/range", "vs/editor/common/languages/language", "vs/editor/common/languages/modesRegistry", "vs/editor/common/services/model", "vs/editor/contrib/bracketMatching/browser/bracketMatching", "vs/editor/contrib/contextmenu/browser/contextmenu", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/editor/contrib/semanticTokens/browser/viewportSemanticTokens", "vs/editor/contrib/smartSelect/browser/smartSelect", "vs/editor/contrib/wordHighlighter/browser/wordHighlighter", "vs/nls!vs/workbench/contrib/chat/browser/chatListRenderer", "vs/platform/accessibility/common/accessibility", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/browser/toolbar", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/list/browser/listService", "vs/platform/log/common/log", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/themeService", "vs/workbench/browser/labels", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/workbench/contrib/chat/browser/chatFollowups", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/contrib/chat/common/chatViewModel", "vs/workbench/contrib/chat/common/chatWordCounter", "vs/workbench/contrib/codeEditor/browser/menuPreventer", "vs/workbench/contrib/codeEditor/browser/selectionClipboard", "vs/workbench/contrib/codeEditor/browser/simpleEditorOptions", "vs/workbench/contrib/files/browser/views/explorerView", "vs/platform/opener/common/opener", "vs/base/common/arrays"], function (require, exports, dom, iconLabels_1, async_1, codicons_1, event_1, htmlContent_1, lifecycle_1, map_1, marked_1, network_1, themables_1, editorExtensions_1, codeEditorWidget_1, editorOptions_1, range_1, language_1, modesRegistry_1, model_1, bracketMatching_1, contextmenu_1, markdownRenderer_1, viewportSemanticTokens_1, smartSelect_1, wordHighlighter_1, nls_1, accessibility_1, menuEntryActionViewItem_1, toolbar_1, actions_1, commands_1, configuration_1, contextkey_1, files_1, instantiation_1, serviceCollection_1, listService_1, log_1, defaultStyles_1, themeService_1, labels_1, accessibleView_1, chatFollowups_1, chatContextKeys_1, chatService_1, chatViewModel_1, chatWordCounter_1, menuPreventer_1, selectionClipboard_1, simpleEditorOptions_1, explorerView_1, opener_1, arrays_1) {
    "use strict";
    var $uIb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$wIb = exports.$vIb = exports.$uIb = void 0;
    const $ = dom.$;
    const forceVerboseLayoutTracing = false;
    let $uIb = class $uIb extends lifecycle_1.$kc {
        static { $uIb_1 = this; }
        static { this.ID = 'item'; }
        constructor(y, z, C, D, F, G, H, I, J, L) {
            super();
            this.y = y;
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.a = new Map();
            this.b = new map_1.$zi();
            this.f = new Map();
            this.g = new Map();
            this.j = this.B(new event_1.$fd());
            this.onDidClickFollowup = this.j.event;
            this.m = this.B(new event_1.$fd());
            this.onDidChangeItemHeight = this.m.event;
            this.t = 0;
            this.u = true;
            this.w = this.B(new event_1.$fd());
            this.h = this.D.createInstance(markdownRenderer_1.$K2, {});
            this.n = this.B(this.D.createInstance(EditorPool, this.y));
            this.r = this.B(this.D.createInstance(TreePool, this.w.event));
        }
        get templateId() {
            return $uIb_1.ID;
        }
        M(method, message) {
            if (forceVerboseLayoutTracing) {
                this.G.info(`ChatListItemRenderer#${method}: ${message}`);
            }
            else {
                this.G.trace(`ChatListItemRenderer#${method}: ${message}`);
            }
        }
        N() {
            return !this.F.getValue('interactive.experimental.disableProgressiveRendering');
        }
        O(element) {
            const configuredRate = this.F.getValue('interactive.experimental.progressiveRenderingRate');
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
            const codeBlocks = this.a.get(response.id);
            return codeBlocks ?? [];
        }
        getCodeBlockInfoForEditor(uri) {
            return this.b.get(uri);
        }
        getFileTreeInfosForResponse(response) {
            const fileTrees = this.f.get(response.id);
            return fileTrees ?? [];
        }
        getLastFocusedFileTreeForResponse(response) {
            const fileTrees = this.f.get(response.id);
            const lastFocusedFileTreeIndex = this.g.get(response.id);
            if (fileTrees?.length && lastFocusedFileTreeIndex !== undefined && lastFocusedFileTreeIndex < fileTrees.length) {
                return fileTrees[lastFocusedFileTreeIndex];
            }
            return undefined;
        }
        setVisible(visible) {
            this.u = visible;
            this.w.fire(visible);
        }
        layout(width) {
            this.t = width - 40; // TODO Padding
            this.n.inUse.forEach(editor => {
                editor.layout(this.t);
            });
        }
        renderTemplate(container) {
            const templateDisposables = new lifecycle_1.$jc();
            const rowContainer = dom.$0O(container, $('.interactive-item-container'));
            if (this.z.renderStyle === 'compact') {
                rowContainer.classList.add('interactive-item-compact');
            }
            const header = dom.$0O(rowContainer, $('.header'));
            const user = dom.$0O(header, $('.user'));
            const avatar = dom.$0O(user, $('.avatar'));
            const username = dom.$0O(user, $('h3.username'));
            const value = dom.$0O(rowContainer, $('.value'));
            const elementDisposables = new lifecycle_1.$jc();
            const contextKeyService = templateDisposables.add(this.J.createScoped(rowContainer));
            const scopedInstantiationService = this.D.createChild(new serviceCollection_1.$zh([contextkey_1.$3i, contextKeyService]));
            const titleToolbar = templateDisposables.add(scopedInstantiationService.createInstance(toolbar_1.$M6, header, actions_1.$Ru.ChatMessageTitle, {
                menuOptions: {
                    shouldForwardArgs: true
                },
                actionViewItemProvider: (action, options) => {
                    if (action instanceof actions_1.$Vu && (action.item.id === 'workbench.action.chat.voteDown' || action.item.id === 'workbench.action.chat.voteUp')) {
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
            const kind = (0, chatViewModel_1.$Hqb)(element) ? 'request' :
                (0, chatViewModel_1.$Iqb)(element) ? 'response' :
                    'welcome';
            this.M('renderElement', `${kind}, index=${index}`);
            chatContextKeys_1.$FGb.bindTo(templateData.contextKeyService).set((0, chatViewModel_1.$Iqb)(element));
            chatContextKeys_1.$GGb.bindTo(templateData.contextKeyService).set((0, chatViewModel_1.$Hqb)(element));
            chatContextKeys_1.$BGb.bindTo(templateData.contextKeyService).set((0, chatViewModel_1.$Iqb)(element) && !!element.providerResponseId);
            if ((0, chatViewModel_1.$Iqb)(element)) {
                chatContextKeys_1.$CGb.bindTo(templateData.contextKeyService).set(element.vote === chatService_1.InteractiveSessionVoteDirection.Up ? 'up' : element.vote === chatService_1.InteractiveSessionVoteDirection.Down ? 'down' : '');
            }
            else {
                chatContextKeys_1.$CGb.bindTo(templateData.contextKeyService).set('');
            }
            templateData.titleToolbar.context = element;
            const isFiltered = !!((0, chatViewModel_1.$Iqb)(element) && element.errorDetails?.responseIsFiltered);
            chatContextKeys_1.$DGb.bindTo(templateData.contextKeyService).set(isFiltered);
            templateData.rowContainer.classList.toggle('interactive-request', (0, chatViewModel_1.$Hqb)(element));
            templateData.rowContainer.classList.toggle('interactive-response', (0, chatViewModel_1.$Iqb)(element));
            templateData.rowContainer.classList.toggle('interactive-welcome', (0, chatViewModel_1.$Jqb)(element));
            templateData.rowContainer.classList.toggle('filtered-response', isFiltered);
            templateData.username.textContent = element.username;
            if (element.avatarIconUri) {
                const avatarIcon = dom.$('img.icon');
                avatarIcon.src = network_1.$2f.uriToBrowserUri(element.avatarIconUri).toString(true);
                templateData.avatar.replaceChildren(avatarIcon);
            }
            else {
                const defaultIcon = (0, chatViewModel_1.$Hqb)(element) ? codicons_1.$Pj.account : codicons_1.$Pj.hubot;
                const avatarIcon = dom.$(themables_1.ThemeIcon.asCSSSelector(defaultIcon));
                templateData.avatar.replaceChildren(avatarIcon);
            }
            // Do a progressive render if
            // - This the last response in the list
            // - And it is not a placeholder response ("Thinking...")
            // - And the response is not complete
            //   - Or, we previously started a progressive rendering of this element (if the element is complete, we will finish progressive rendering with a very fast rate)
            // - And, the feature is not disabled in configuration
            if ((0, chatViewModel_1.$Iqb)(element) && index === this.C.getListLength() - 1 && !element.isPlaceholder && (!element.isComplete || element.renderData) && this.N()) {
                this.M('renderElement', `start progressive render ${kind}, index=${index}`);
                const progressiveRenderingDisposables = templateData.elementDisposables.add(new lifecycle_1.$jc());
                const timer = templateData.elementDisposables.add(new async_1.$Rg());
                const runProgressiveRender = (initial) => {
                    try {
                        if (this.R(element, index, templateData, !!initial, progressiveRenderingDisposables)) {
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
            else if ((0, chatViewModel_1.$Iqb)(element)) {
                this.P(element.response.value, element, index, templateData);
            }
            else if ((0, chatViewModel_1.$Hqb)(element)) {
                this.P([new htmlContent_1.$Xj(element.messageText)], element, index, templateData);
            }
            else {
                this.Q(element, templateData);
            }
        }
        P(value, element, index, templateData) {
            const fillInIncompleteTokens = (0, chatViewModel_1.$Iqb)(element) && (!element.isComplete || element.isCanceled || element.errorDetails?.responseIsFiltered || element.errorDetails?.responseIsIncomplete);
            dom.$lO(templateData.value);
            let fileTreeIndex = 0;
            for (const data of value) {
                const result = 'value' in data
                    ? this.W(data, element, templateData.elementDisposables, templateData, fillInIncompleteTokens)
                    : this.S(data, element, templateData.elementDisposables, templateData, fileTreeIndex++);
                templateData.value.appendChild(result.element);
                templateData.elementDisposables.add(result);
            }
            if ((0, chatViewModel_1.$Iqb)(element) && element.errorDetails?.message) {
                const icon = element.errorDetails.responseIsFiltered ? codicons_1.$Pj.info : codicons_1.$Pj.error;
                const errorDetails = dom.$0O(templateData.value, $('.interactive-response-error-details', undefined, (0, iconLabels_1.$yQ)(icon)));
                errorDetails.appendChild($('span', undefined, element.errorDetails.message));
            }
            if ((0, chatViewModel_1.$Iqb)(element) && element.commandFollowups?.length) {
                const followupsContainer = dom.$0O(templateData.value, $('.interactive-response-followups'));
                templateData.elementDisposables.add(new chatFollowups_1.$PGb(followupsContainer, element.commandFollowups, defaultStyles_1.$i2, followup => {
                    this.L.notifyUserAction({
                        providerId: element.providerId,
                        action: {
                            kind: 'command',
                            command: followup
                        }
                    });
                    return this.H.executeCommand(followup.commandId, ...(followup.args ?? []));
                }, templateData.contextKeyService));
            }
            const newHeight = templateData.rowContainer.offsetHeight;
            const fireEvent = !element.currentRenderedHeight || element.currentRenderedHeight !== newHeight;
            element.currentRenderedHeight = newHeight;
            if (fireEvent) {
                const disposable = this.B(dom.$vO(() => {
                    disposable.dispose();
                    this.m.fire({ element, height: newHeight });
                }));
            }
        }
        Q(element, templateData) {
            dom.$lO(templateData.value);
            const slashCommands = this.C.getSlashCommands();
            for (const item of element.content) {
                if (Array.isArray(item)) {
                    templateData.elementDisposables.add(new chatFollowups_1.$PGb(templateData.value, item, undefined, followup => this.j.fire(followup), templateData.contextKeyService));
                }
                else {
                    const result = this.W(item, element, templateData.elementDisposables, templateData);
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
                const disposable = this.B(dom.$vO(() => {
                    disposable.dispose();
                    this.m.fire({ element, height: newHeight });
                }));
            }
        }
        /**
         *	@returns true if progressive rendering should be considered complete- the element's data is fully rendered or the view is not visible
         */
        R(element, index, templateData, isInRenderElement, disposables) {
            if (!this.u) {
                return true;
            }
            disposables.clear();
            let isFullyRendered = false;
            if (element.isCanceled) {
                this.M('runProgressiveRender', `canceled, index=${index}`);
                element.renderData = undefined;
                this.P(element.response.value, element, index, templateData);
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
                            const wordCountResult = this.Y(element, part, { renderedWordCount: 0, lastRenderTime: 0 });
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
                        const wordCountResult = this.Y(element, part, renderedPart);
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
                    this.M('runProgressiveRender', `end progressive render, index=${index} and clearing renderData, response is complete, index=${index}`);
                    element.renderData = undefined;
                    disposables.clear();
                    this.P(element.response.value, element, index, templateData);
                }
                else if (!isFullyRendered) {
                    let hasRenderedOneMarkdownBlock = false;
                    partsToRender.forEach((partToRender, index) => {
                        if (!partToRender) {
                            return;
                        }
                        let result;
                        if (isInteractiveProgressTreeData(partToRender)) {
                            result = this.S(partToRender, element, disposables, templateData, index);
                        }
                        // Avoid doing progressive rendering for multiple markdown parts simultaneously
                        else if (!hasRenderedOneMarkdownBlock) {
                            const { value } = wordCountResults[index];
                            const isPlaceholder = isPlaceholderMarkdown(currentResponseData[index]);
                            result = isPlaceholder
                                ? this.U(new htmlContent_1.$Xj(value), templateData)
                                : this.W(new htmlContent_1.$Xj(value), element, disposables, templateData, true);
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
                this.m.fire({ element, height: templateData.rowContainer.offsetHeight });
            }
            return isFullyRendered;
        }
        S(data, element, disposables, templateData, treeDataIndex) {
            const ref = this.r.get();
            const tree = ref.object;
            const treeDisposables = new lifecycle_1.$jc();
            treeDisposables.add(tree.onDidOpen((e) => {
                if (e.element && !('children' in e.element)) {
                    this.I.open(e.element.uri);
                }
            }));
            treeDisposables.add(tree.onDidChangeCollapseState(() => {
                this.m.fire({ element, height: templateData.rowContainer.offsetHeight });
            }));
            treeDisposables.add(tree.onContextMenu((e) => {
                e.browserEvent.preventDefault();
                e.browserEvent.stopPropagation();
            }));
            tree.setInput(data).then(() => {
                if (!ref.isStale()) {
                    tree.layout();
                    this.m.fire({ element, height: templateData.rowContainer.offsetHeight });
                }
            });
            if ((0, chatViewModel_1.$Iqb)(element)) {
                const fileTreeFocusInfo = {
                    treeDataId: data.uri.toString(),
                    treeIndex: treeDataIndex,
                    focus() {
                        tree.domFocus();
                    }
                };
                treeDisposables.add(tree.onDidFocus(() => {
                    this.g.set(element.id, fileTreeFocusInfo.treeIndex);
                }));
                const fileTrees = this.f.get(element.id) ?? [];
                fileTrees.push(fileTreeFocusInfo);
                this.f.set(element.id, (0, arrays_1.$Kb)(fileTrees, (v) => v.treeDataId));
                disposables.add((0, lifecycle_1.$ic)(() => this.f.set(element.id, fileTrees.filter(v => v.treeDataId !== data.uri.toString()))));
            }
            return {
                element: tree.getHTMLElement().parentElement,
                dispose: () => {
                    treeDisposables.dispose();
                    ref.dispose();
                }
            };
        }
        U(markdown, templateData) {
            const codicon = $('.interactive-response-codicon-details', undefined, (0, iconLabels_1.$yQ)({ id: 'sync~spin' }));
            codicon.classList.add('interactive-response-placeholder-codicon');
            const result = dom.$0O(templateData.value, codicon);
            const content = this.h.render(markdown);
            content.element.className = 'interactive-response-placeholder-content';
            result.appendChild(content.element);
            return { element: result, dispose: () => content.dispose() };
        }
        W(markdown, element, disposables, templateData, fillInIncompleteTokens = false) {
            const disposablesList = [];
            let codeBlockIndex = 0;
            // TODO if the slash commands stay completely dynamic, this isn't quite right
            const slashCommands = this.C.getSlashCommands();
            const usedSlashCommand = slashCommands.find(s => markdown.value.startsWith(`/${s.command} `));
            const toRender = usedSlashCommand ? markdown.value.slice(usedSlashCommand.command.length + 2) : markdown.value;
            markdown = new htmlContent_1.$Xj(toRender, {
                isTrusted: {
                    // Disable all other config options except isTrusted
                    enabledCommands: typeof markdown.isTrusted === 'object' ? markdown.isTrusted?.enabledCommands : [] ?? []
                }
            });
            const codeblocks = [];
            const result = this.h.render(markdown, {
                fillInIncompleteTokens,
                codeBlockRendererSync: (languageId, text) => {
                    const data = { languageId, text, codeBlockIndex: codeBlockIndex++, element, parentContextKeyService: templateData.contextKeyService };
                    const ref = this.X(data, disposables);
                    // Attach this after updating text/layout of the editor, so it should only be fired when the size updates later (horizontal scrollbar, wrapping)
                    // not during a renderElement OR a progressive render (when we will be firing this event anyway at the end of the render)
                    disposables.add(ref.object.onDidChangeContentHeight(() => {
                        ref.object.layout(this.t);
                        this.m.fire({ element, height: templateData.rowContainer.offsetHeight });
                    }));
                    if ((0, chatViewModel_1.$Iqb)(element)) {
                        const info = {
                            codeBlockIndex: data.codeBlockIndex,
                            element,
                            focus() {
                                ref.object.focus();
                            }
                        };
                        codeblocks.push(info);
                        this.b.set(ref.object.textModel.uri, info);
                        disposables.add((0, lifecycle_1.$ic)(() => this.b.delete(ref.object.textModel.uri)));
                    }
                    disposablesList.push(ref);
                    return ref.object.element;
                }
            });
            if ((0, chatViewModel_1.$Iqb)(element)) {
                this.a.set(element.id, codeblocks);
                disposables.add((0, lifecycle_1.$ic)(() => this.a.delete(element.id)));
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
        X(data, disposables) {
            const ref = this.n.get();
            const editorInfo = ref.object;
            editorInfo.render(data, this.t);
            return ref;
        }
        Y(element, data, renderData) {
            const rate = this.O(element);
            const numWordsToRender = renderData.lastRenderTime === 0 ?
                1 :
                renderData.renderedWordCount +
                    // Additional words to render beyond what's already rendered
                    Math.floor((Date.now() - renderData.lastRenderTime) / 1000 * rate);
            if (numWordsToRender === renderData.renderedWordCount) {
                return undefined;
            }
            return (0, chatWordCounter_1.$Fqb)(data.value, numWordsToRender);
        }
        disposeElement(node, index, templateData) {
            templateData.elementDisposables.clear();
        }
        disposeTemplate(templateData) {
            templateData.templateDisposables.dispose();
        }
    };
    exports.$uIb = $uIb;
    exports.$uIb = $uIb = $uIb_1 = __decorate([
        __param(3, instantiation_1.$Ah),
        __param(4, configuration_1.$8h),
        __param(5, log_1.$5i),
        __param(6, commands_1.$Fr),
        __param(7, opener_1.$NT),
        __param(8, contextkey_1.$3i),
        __param(9, chatService_1.$FH)
    ], $uIb);
    let $vIb = class $vIb {
        constructor(a) {
            this.a = a;
        }
        b(method, message) {
            if (forceVerboseLayoutTracing) {
                this.a.info(`ChatListDelegate#${method}: ${message}`);
            }
            else {
                this.a.trace(`ChatListDelegate#${method}: ${message}`);
            }
        }
        getHeight(element) {
            const kind = (0, chatViewModel_1.$Hqb)(element) ? 'request' : 'response';
            const height = ('currentRenderedHeight' in element ? element.currentRenderedHeight : undefined) ?? 200;
            this.b('getHeight', `${kind}, height=${height}`);
            return height;
        }
        getTemplateId(element) {
            return $uIb.ID;
        }
        hasDynamicHeight(element) {
            return true;
        }
    };
    exports.$vIb = $vIb;
    exports.$vIb = $vIb = __decorate([
        __param(0, log_1.$5i)
    ], $vIb);
    let $wIb = class $wIb {
        constructor(a) {
            this.a = a;
        }
        getWidgetRole() {
            return 'list';
        }
        getRole(element) {
            return 'listitem';
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)(0, null);
        }
        getAriaLabel(element) {
            if ((0, chatViewModel_1.$Hqb)(element)) {
                return element.messageText;
            }
            if ((0, chatViewModel_1.$Iqb)(element)) {
                return this.b(element);
            }
            if ((0, chatViewModel_1.$Jqb)(element)) {
                return element.content.map(c => 'value' in c ? c.value : c.map(followup => followup.message).join('\n')).join('\n');
            }
            return '';
        }
        b(element) {
            const accessibleViewHint = this.a.getOpenAriaHint("accessibility.verbosity.panelChat" /* AccessibilityVerbositySettingId.Chat */);
            let label = '';
            let commandFollowUpInfo;
            const commandFollowupLength = element.commandFollowups?.length ?? 0;
            switch (commandFollowupLength) {
                case 0:
                    break;
                case 1:
                    commandFollowUpInfo = (0, nls_1.localize)(1, null, element.commandFollowups[0].title);
                    break;
                default:
                    commandFollowUpInfo = (0, nls_1.localize)(2, null, element.commandFollowups.map(followup => followup.title).join(', '));
            }
            const fileTreeCount = element.response.value.filter((v) => !('value' in v))?.length ?? 0;
            let fileTreeCountHint = '';
            switch (fileTreeCount) {
                case 0:
                    break;
                case 1:
                    fileTreeCountHint = (0, nls_1.localize)(3, null);
                    break;
                default:
                    fileTreeCountHint = (0, nls_1.localize)(4, null, fileTreeCount);
                    break;
            }
            const codeBlockCount = marked_1.marked.lexer(element.response.asString()).filter(token => token.type === 'code')?.length ?? 0;
            switch (codeBlockCount) {
                case 0:
                    label = accessibleViewHint ? (0, nls_1.localize)(5, null, fileTreeCountHint, element.response.asString(), accessibleViewHint) : (0, nls_1.localize)(6, null, fileTreeCountHint, element.response.asString());
                    break;
                case 1:
                    label = accessibleViewHint ? (0, nls_1.localize)(7, null, fileTreeCountHint, element.response.asString(), accessibleViewHint) : (0, nls_1.localize)(8, null, fileTreeCountHint, element.response.asString());
                    break;
                default:
                    label = accessibleViewHint ? (0, nls_1.localize)(9, null, fileTreeCountHint, codeBlockCount, element.response.asString(), accessibleViewHint) : (0, nls_1.localize)(10, null, fileTreeCountHint, codeBlockCount, element.response.asString());
                    break;
            }
            return commandFollowUpInfo ? commandFollowUpInfo + ', ' + label : label;
        }
    };
    exports.$wIb = $wIb;
    exports.$wIb = $wIb = __decorate([
        __param(0, accessibleView_1.$wqb)
    ], $wIb);
    const defaultCodeblockPadding = 10;
    let CodeBlockPart = class CodeBlockPart extends lifecycle_1.$kc {
        constructor(j, instantiationService, contextKeyService, m, n, r, t) {
            super();
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.t = t;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeContentHeight = this.a.event;
            this.h = 0;
            this.element = $('.interactive-result-editor-wrapper');
            this.g = this.B(contextKeyService.createScoped(this.element));
            const scopedInstantiationService = instantiationService.createChild(new serviceCollection_1.$zh([contextkey_1.$3i, this.g]));
            this.f = this.B(scopedInstantiationService.createInstance(toolbar_1.$M6, this.element, actions_1.$Ru.ChatCodeBlock, {
                menuOptions: {
                    shouldForwardArgs: true
                }
            }));
            this.w();
            this.B(this.t.onDidChangeScreenReaderOptimized(() => this.w()));
            this.B(this.r.onDidChangeConfiguration((e) => {
                if (e.affectedKeys.has("accessibility.verbosity.panelChat" /* AccessibilityVerbositySettingId.Chat */)) {
                    this.w();
                }
            }));
            const editorElement = dom.$0O(this.element, $('.interactive-result-editor'));
            this.b = this.B(scopedInstantiationService.createInstance(codeEditorWidget_1.$uY, editorElement, {
                ...(0, simpleEditorOptions_1.$uqb)(this.r),
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
                ariaLabel: (0, nls_1.localize)(11, null),
                ...this.y()
            }, {
                isSimpleWidget: true,
                contributions: editorExtensions_1.EditorExtensionsRegistry.getSomeEditorContributions([
                    menuPreventer_1.$0lb.ID,
                    selectionClipboard_1.$tqb,
                    contextmenu_1.$X6.ID,
                    wordHighlighter_1.$f$.ID,
                    viewportSemanticTokens_1.$I0.ID,
                    bracketMatching_1.$f1.ID,
                    smartSelect_1.$K0.ID,
                ])
            }));
            this.B(this.j.onDidChange(() => {
                this.b.updateOptions(this.y());
            }));
            this.B(this.b.onDidScrollChange(e => {
                this.h = e.scrollWidth;
            }));
            this.B(this.b.onDidContentSizeChange(e => {
                if (e.contentHeightChanged) {
                    this.a.fire(e.contentHeight);
                }
            }));
            this.B(this.b.onDidBlurEditorWidget(() => {
                this.element.classList.remove('focused');
                wordHighlighter_1.$f$.get(this.b)?.stopHighlighting();
            }));
            this.B(this.b.onDidFocusEditorWidget(() => {
                this.element.classList.add('focused');
                wordHighlighter_1.$f$.get(this.b)?.restoreViewState(true);
            }));
            this.textModel = this.B(this.n.createModel('', null, undefined));
            this.b.setModel(this.textModel);
        }
        focus() {
            this.b.focus();
        }
        u() {
            // scrollWidth = "the width of the content that needs to be scrolled"
            // contentWidth = "the width of the area where content is displayed"
            const horizontalScrollbarVisible = this.h > this.b.getLayoutInfo().contentWidth;
            const scrollbarHeight = this.b.getLayoutInfo().horizontalScrollbarHeight;
            const bottomPadding = horizontalScrollbarVisible ?
                Math.max(defaultCodeblockPadding - scrollbarHeight, 2) :
                defaultCodeblockPadding;
            this.b.updateOptions({ padding: { top: defaultCodeblockPadding, bottom: bottomPadding } });
        }
        w() {
            const toolbarElt = this.f.getElement();
            if (this.t.isScreenReaderOptimized()) {
                toolbarElt.style.display = 'block';
                toolbarElt.ariaLabel = this.r.getValue("accessibility.verbosity.panelChat" /* AccessibilityVerbositySettingId.Chat */) ? (0, nls_1.localize)(12, null) : (0, nls_1.localize)(13, null);
            }
            else {
                toolbarElt.style.display = '';
            }
        }
        y() {
            return {
                wordWrap: this.j.configuration.resultEditor.wordWrap,
                fontLigatures: this.j.configuration.resultEditor.fontLigatures,
                bracketPairColorization: this.j.configuration.resultEditor.bracketPairColorization,
                fontFamily: this.j.configuration.resultEditor.fontFamily === 'default' ?
                    editorOptions_1.EDITOR_FONT_DEFAULTS.fontFamily :
                    this.j.configuration.resultEditor.fontFamily,
                fontSize: this.j.configuration.resultEditor.fontSize,
                fontWeight: this.j.configuration.resultEditor.fontWeight,
                lineHeight: this.j.configuration.resultEditor.lineHeight,
            };
        }
        layout(width) {
            const realContentHeight = this.b.getContentHeight();
            const editorBorder = 2;
            this.b.layout({ width: width - editorBorder, height: realContentHeight });
            this.u();
        }
        render(data, width) {
            this.g.updateParent(data.parentContextKeyService);
            if (this.j.configuration.resultEditor.wordWrap === 'on') {
                // Intialize the editor with the new proper width so that getContentHeight
                // will be computed correctly in the next call to layout()
                this.layout(width);
            }
            const text = this.z(data.text, data.languageId);
            this.C(text);
            const vscodeLanguageId = this.m.getLanguageIdByLanguageName(data.languageId) ?? undefined;
            this.D(vscodeLanguageId);
            this.layout(width);
            this.b.updateOptions({ ariaLabel: (0, nls_1.localize)(14, null, data.codeBlockIndex + 1) });
            this.f.context = {
                code: data.text,
                codeBlockIndex: data.codeBlockIndex,
                element: data.element,
                languageId: vscodeLanguageId
            };
            if ((0, chatViewModel_1.$Iqb)(data.element) && data.element.errorDetails?.responseIsFiltered) {
                dom.$eP(this.f.getElement());
            }
            else {
                dom.$dP(this.f.getElement());
            }
        }
        z(text, languageId) {
            if (languageId === 'php') {
                if (!text.trim().startsWith('<')) {
                    return `<?php\n${text}\n?>`;
                }
            }
            return text;
        }
        C(newText) {
            const currentText = this.textModel.getValue(1 /* EndOfLinePreference.LF */);
            if (newText === currentText) {
                return;
            }
            if (newText.startsWith(currentText)) {
                const text = newText.slice(currentText.length);
                const lastLine = this.textModel.getLineCount();
                const lastCol = this.textModel.getLineMaxColumn(lastLine);
                this.textModel.applyEdits([{ range: new range_1.$ks(lastLine, lastCol, lastLine, lastCol), text }]);
            }
            else {
                // console.log(`Failed to optimize setText`);
                this.textModel.setValue(newText);
            }
        }
        D(vscodeLanguageId) {
            this.textModel.setLanguage(vscodeLanguageId ?? modesRegistry_1.$Yt);
        }
    };
    CodeBlockPart = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, contextkey_1.$3i),
        __param(3, language_1.$ct),
        __param(4, model_1.$yA),
        __param(5, configuration_1.$8h),
        __param(6, accessibility_1.$1r)
    ], CodeBlockPart);
    let EditorPool = class EditorPool extends lifecycle_1.$kc {
        get inUse() {
            return this.a.inUse;
        }
        constructor(b, f) {
            super();
            this.b = b;
            this.f = f;
            this.a = this.B(new ResourcePool(() => this.g()));
            // TODO listen to changes on options
        }
        g() {
            return this.f.createInstance(CodeBlockPart, this.b);
        }
        get() {
            const object = this.a.get();
            let stale = false;
            return {
                object,
                isStale: () => stale,
                dispose: () => {
                    stale = true;
                    this.a.release(object);
                }
            };
        }
    };
    EditorPool = __decorate([
        __param(1, instantiation_1.$Ah)
    ], EditorPool);
    let TreePool = class TreePool extends lifecycle_1.$kc {
        get inUse() {
            return this.a.inUse;
        }
        constructor(b, f, g, h) {
            super();
            this.b = b;
            this.f = f;
            this.g = g;
            this.h = h;
            this.a = this.B(new ResourcePool(() => this.j()));
        }
        j() {
            const resourceLabels = this.f.createInstance(labels_1.$Llb, { onDidChangeVisibility: this.b });
            const container = $('.interactive-response-progress-tree');
            (0, explorerView_1.$tIb)(container, this.h);
            const tree = this.f.createInstance(listService_1.$x4, 'ChatListRenderer', container, new ChatListTreeDelegate(), new ChatListTreeCompressionDelegate(), [new ChatListTreeRenderer(resourceLabels, this.g.getValue('explorer.decorations'))], new ChatListTreeDataSource(), {
                collapseByDefault: () => false,
                expandOnlyOnTwistieClick: () => false,
                identityProvider: {
                    getId: (e) => e.uri.toString()
                },
                accessibilityProvider: {
                    getAriaLabel: (element) => element.label,
                    getWidgetAriaLabel: () => (0, nls_1.localize)(15, null)
                },
                alwaysConsumeMouseWheel: false
            });
            return tree;
        }
        get() {
            const object = this.a.get();
            let stale = false;
            return {
                object,
                isStale: () => stale,
                dispose: () => {
                    stale = true;
                    this.a.release(object);
                }
            };
        }
    };
    TreePool = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, configuration_1.$8h),
        __param(3, themeService_1.$gv)
    ], TreePool);
    // TODO does something in lifecycle.ts cover this?
    class ResourcePool extends lifecycle_1.$kc {
        get inUse() {
            return this.b;
        }
        constructor(f) {
            super();
            this.f = f;
            this.a = [];
            this.b = new Set;
        }
        get() {
            if (this.a.length > 0) {
                const item = this.a.pop();
                this.b.add(item);
                return item;
            }
            const item = this.B(this.f());
            this.b.add(item);
            return item;
        }
        release(item) {
            this.b.delete(item);
            this.a.push(item);
        }
    }
    class ChatVoteButton extends menuEntryActionViewItem_1.$C3 {
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
        constructor(a, b) {
            this.a = a;
            this.b = b;
            this.templateId = 'chatListTreeTemplate';
        }
        renderCompressedElements(element, index, templateData, height) {
            templateData.label.element.style.display = 'flex';
            const label = element.element.elements.map((e) => e.label);
            templateData.label.setResource({ resource: element.element.elements[0].uri, name: label }, {
                title: element.element.elements[0].label,
                fileKind: element.children ? files_1.FileKind.FOLDER : files_1.FileKind.FILE,
                extraClasses: ['explorer-item'],
                fileDecorations: this.b
            });
        }
        renderTemplate(container) {
            const templateDisposables = new lifecycle_1.$jc();
            const label = templateDisposables.add(this.a.create(container, { supportHighlights: true }));
            return { templateDisposables, label };
        }
        renderElement(element, index, templateData, height) {
            templateData.label.element.style.display = 'flex';
            const hasExtension = /\.[^/.]+$/.test(element.element.label);
            if (!element.children.length && hasExtension) {
                templateData.label.setFile(element.element.uri, {
                    fileKind: files_1.FileKind.FILE,
                    hidePath: true,
                    fileDecorations: this.b,
                });
            }
            else {
                templateData.label.setResource({ resource: element.element.uri, name: element.element.label }, {
                    title: element.element.label,
                    fileKind: files_1.FileKind.FOLDER,
                    fileDecorations: this.b
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
//# sourceMappingURL=chatListRenderer.js.map