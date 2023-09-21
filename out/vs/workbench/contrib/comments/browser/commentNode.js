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
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/editor/common/languages", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/comments/browser/commentService", "vs/workbench/contrib/comments/browser/simpleCommentEditor", "vs/editor/common/core/selection", "vs/base/common/event", "vs/platform/notification/common/notification", "vs/base/browser/ui/toolbar/toolbar", "vs/platform/contextview/browser/contextView", "./reactionsAction", "vs/platform/actions/common/actions", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/comments/browser/commentFormActions", "vs/base/browser/ui/mouseCursor/mouseCursor", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/dropdown/dropdownActionViewItem", "vs/base/common/codicons", "vs/base/common/themables", "vs/workbench/contrib/comments/browser/timestamp", "vs/platform/configuration/common/configuration", "vs/base/common/scrollable", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/browser/event", "vs/workbench/contrib/comments/common/commentContextKeys", "vs/base/common/network", "vs/workbench/contrib/comments/common/commentsConfiguration", "vs/base/browser/mouseEvent", "vs/platform/accessibility/common/accessibility"], function (require, exports, nls, dom, languages, actionbar_1, actions_1, lifecycle_1, uri_1, model_1, language_1, instantiation_1, commentService_1, simpleCommentEditor_1, selection_1, event_1, notification_1, toolbar_1, contextView_1, reactionsAction_1, actions_2, menuEntryActionViewItem_1, contextkey_1, commentFormActions_1, mouseCursor_1, actionViewItems_1, dropdownActionViewItem_1, codicons_1, themables_1, timestamp_1, configuration_1, scrollable_1, scrollableElement_1, event_2, commentContextKeys_1, network_1, commentsConfiguration_1, mouseEvent_1, accessibility_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CommentNode = void 0;
    class CommentsActionRunner extends actions_1.ActionRunner {
        async runAction(action, context) {
            await action.run(...context);
        }
    }
    let CommentNode = class CommentNode extends lifecycle_1.Disposable {
        get domNode() {
            return this._domNode;
        }
        constructor(commentThread, comment, pendingEdit, owner, resource, parentThread, markdownRenderer, instantiationService, commentService, modelService, languageService, notificationService, contextMenuService, contextKeyService, configurationService, accessibilityService) {
            super();
            this.commentThread = commentThread;
            this.comment = comment;
            this.pendingEdit = pendingEdit;
            this.owner = owner;
            this.resource = resource;
            this.parentThread = parentThread;
            this.markdownRenderer = markdownRenderer;
            this.instantiationService = instantiationService;
            this.commentService = commentService;
            this.modelService = modelService;
            this.languageService = languageService;
            this.notificationService = notificationService;
            this.contextMenuService = contextMenuService;
            this.configurationService = configurationService;
            this.accessibilityService = accessibilityService;
            this._editAction = null;
            this._commentEditContainer = null;
            this._commentEditor = null;
            this._commentEditorDisposables = [];
            this._commentEditorModel = null;
            this._commentFormActions = null;
            this._commentEditorActions = null;
            this._onDidClick = new event_1.Emitter();
            this.isEditing = false;
            this._domNode = dom.$('div.review-comment');
            this._contextKeyService = contextKeyService.createScoped(this._domNode);
            this._commentContextValue = commentContextKeys_1.CommentContextKeys.commentContext.bindTo(this._contextKeyService);
            if (this.comment.contextValue) {
                this._commentContextValue.set(this.comment.contextValue);
            }
            this._commentMenus = this.commentService.getCommentMenus(this.owner);
            this._domNode.tabIndex = -1;
            const avatar = dom.append(this._domNode, dom.$('div.avatar-container'));
            if (comment.userIconPath) {
                const img = dom.append(avatar, dom.$('img.avatar'));
                img.src = network_1.FileAccess.uriToBrowserUri(uri_1.URI.revive(comment.userIconPath)).toString(true);
                img.onerror = _ => img.remove();
            }
            this._commentDetailsContainer = dom.append(this._domNode, dom.$('.review-comment-contents'));
            this.createHeader(this._commentDetailsContainer);
            this._body = document.createElement(`div`);
            this._body.classList.add('comment-body', mouseCursor_1.MOUSE_CURSOR_TEXT_CSS_CLASS_NAME);
            if (configurationService.getValue(commentsConfiguration_1.COMMENTS_SECTION)?.maxHeight !== false) {
                this._body.classList.add('comment-body-max-height');
            }
            this.createScroll(this._commentDetailsContainer, this._body);
            this.updateCommentBody(this.comment.body);
            if (this.comment.commentReactions && this.comment.commentReactions.length && this.comment.commentReactions.filter(reaction => !!reaction.count).length) {
                this.createReactionsContainer(this._commentDetailsContainer);
            }
            this._domNode.setAttribute('aria-label', `${comment.userName}, ${this.commentBodyValue}`);
            this._domNode.setAttribute('role', 'treeitem');
            this._clearTimeout = null;
            this._register(dom.addDisposableListener(this._domNode, dom.EventType.CLICK, () => this.isEditing || this._onDidClick.fire(this)));
            this._register(dom.addDisposableListener(this._domNode, dom.EventType.CONTEXT_MENU, e => {
                return this.onContextMenu(e);
            }));
            if (pendingEdit) {
                this.switchToEditMode();
            }
            this._register(this.accessibilityService.onDidChangeScreenReaderOptimized(() => {
                this.toggleToolbarHidden(true);
            }));
        }
        createScroll(container, body) {
            this._scrollable = new scrollable_1.Scrollable({
                forceIntegerValues: true,
                smoothScrollDuration: 125,
                scheduleAtNextAnimationFrame: cb => dom.scheduleAtNextAnimationFrame(cb)
            });
            this._scrollableElement = this._register(new scrollableElement_1.SmoothScrollableElement(body, {
                horizontal: 3 /* ScrollbarVisibility.Visible */,
                vertical: 3 /* ScrollbarVisibility.Visible */
            }, this._scrollable));
            this._register(this._scrollableElement.onScroll(e => {
                if (e.scrollLeftChanged) {
                    body.scrollLeft = e.scrollLeft;
                }
                if (e.scrollTopChanged) {
                    body.scrollTop = e.scrollTop;
                }
            }));
            const onDidScrollViewContainer = this._register(new event_2.DomEmitter(body, 'scroll')).event;
            this._register(onDidScrollViewContainer(_ => {
                const position = this._scrollableElement.getScrollPosition();
                const scrollLeft = Math.abs(body.scrollLeft - position.scrollLeft) <= 1 ? undefined : body.scrollLeft;
                const scrollTop = Math.abs(body.scrollTop - position.scrollTop) <= 1 ? undefined : body.scrollTop;
                if (scrollLeft !== undefined || scrollTop !== undefined) {
                    this._scrollableElement.setScrollPosition({ scrollLeft, scrollTop });
                }
            }));
            container.appendChild(this._scrollableElement.getDomNode());
        }
        updateCommentBody(body) {
            this._body.innerText = '';
            this._md = undefined;
            this._plainText = undefined;
            if (typeof body === 'string') {
                this._plainText = dom.append(this._body, dom.$('.comment-body-plainstring'));
                this._plainText.innerText = body;
            }
            else {
                this._md = this.markdownRenderer.render(body).element;
                this._body.appendChild(this._md);
            }
        }
        get onDidClick() {
            return this._onDidClick.event;
        }
        createTimestamp(container) {
            this._timestamp = dom.append(container, dom.$('span.timestamp-container'));
            this.updateTimestamp(this.comment.timestamp);
        }
        updateTimestamp(raw) {
            if (!this._timestamp) {
                return;
            }
            const timestamp = raw !== undefined ? new Date(raw) : undefined;
            if (!timestamp) {
                this._timestampWidget?.dispose();
            }
            else {
                if (!this._timestampWidget) {
                    this._timestampWidget = new timestamp_1.TimestampWidget(this.configurationService, this._timestamp, timestamp);
                    this._register(this._timestampWidget);
                }
                else {
                    this._timestampWidget.setTimestamp(timestamp);
                }
            }
        }
        createHeader(commentDetailsContainer) {
            const header = dom.append(commentDetailsContainer, dom.$(`div.comment-title.${mouseCursor_1.MOUSE_CURSOR_TEXT_CSS_CLASS_NAME}`));
            const infoContainer = dom.append(header, dom.$('comment-header-info'));
            const author = dom.append(infoContainer, dom.$('strong.author'));
            author.innerText = this.comment.userName;
            this.createTimestamp(infoContainer);
            this._isPendingLabel = dom.append(infoContainer, dom.$('span.isPending'));
            if (this.comment.label) {
                this._isPendingLabel.innerText = this.comment.label;
            }
            else {
                this._isPendingLabel.innerText = '';
            }
            this._actionsToolbarContainer = dom.append(header, dom.$('.comment-actions'));
            this.toggleToolbarHidden(true);
            this.createActionsToolbar();
        }
        toggleToolbarHidden(hidden) {
            if (hidden && !this.accessibilityService.isScreenReaderOptimized()) {
                this._actionsToolbarContainer.classList.add('hidden');
            }
            else {
                this._actionsToolbarContainer.classList.remove('hidden');
            }
        }
        getToolbarActions(menu) {
            const contributedActions = menu.getActions({ shouldForwardArgs: true });
            const primary = [];
            const secondary = [];
            const result = { primary, secondary };
            fillInActions(contributedActions, result, false, g => /^inline/.test(g));
            return result;
        }
        get commentNodeContext() {
            return [{
                    thread: this.commentThread,
                    commentUniqueId: this.comment.uniqueIdInThread,
                    $mid: 10 /* MarshalledId.CommentNode */
                },
                {
                    commentControlHandle: this.commentThread.controllerHandle,
                    commentThreadHandle: this.commentThread.commentThreadHandle,
                    $mid: 7 /* MarshalledId.CommentThread */
                }];
        }
        createToolbar() {
            this.toolbar = new toolbar_1.ToolBar(this._actionsToolbarContainer, this.contextMenuService, {
                actionViewItemProvider: action => {
                    if (action.id === reactionsAction_1.ToggleReactionsAction.ID) {
                        return new dropdownActionViewItem_1.DropdownMenuActionViewItem(action, action.menuActions, this.contextMenuService, {
                            actionViewItemProvider: action => this.actionViewItemProvider(action),
                            actionRunner: this.actionRunner,
                            classNames: ['toolbar-toggle-pickReactions', ...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.reactions)],
                            anchorAlignmentProvider: () => 1 /* AnchorAlignment.RIGHT */
                        });
                    }
                    return this.actionViewItemProvider(action);
                },
                orientation: 0 /* ActionsOrientation.HORIZONTAL */
            });
            this.toolbar.context = this.commentNodeContext;
            this.toolbar.actionRunner = new CommentsActionRunner();
            this.registerActionBarListeners(this._actionsToolbarContainer);
            this._register(this.toolbar);
        }
        createActionsToolbar() {
            const actions = [];
            const hasReactionHandler = this.commentService.hasReactionHandler(this.owner);
            if (hasReactionHandler) {
                const toggleReactionAction = this.createReactionPicker(this.comment.commentReactions || []);
                actions.push(toggleReactionAction);
            }
            const menu = this._commentMenus.getCommentTitleActions(this.comment, this._contextKeyService);
            this._register(menu);
            this._register(menu.onDidChange(e => {
                const { primary, secondary } = this.getToolbarActions(menu);
                if (!this.toolbar && (primary.length || secondary.length)) {
                    this.createToolbar();
                }
                this.toolbar.setActions(primary, secondary);
            }));
            const { primary, secondary } = this.getToolbarActions(menu);
            actions.push(...primary);
            if (actions.length || secondary.length) {
                this.createToolbar();
                this.toolbar.setActions(actions, secondary);
            }
        }
        actionViewItemProvider(action) {
            let options = {};
            if (action.id === reactionsAction_1.ToggleReactionsAction.ID) {
                options = { label: false, icon: true };
            }
            else {
                options = { label: false, icon: true };
            }
            if (action.id === reactionsAction_1.ReactionAction.ID) {
                const item = new reactionsAction_1.ReactionActionViewItem(action);
                return item;
            }
            else if (action instanceof actions_2.MenuItemAction) {
                return this.instantiationService.createInstance(menuEntryActionViewItem_1.MenuEntryActionViewItem, action, undefined);
            }
            else if (action instanceof actions_2.SubmenuItemAction) {
                return this.instantiationService.createInstance(menuEntryActionViewItem_1.SubmenuEntryActionViewItem, action, undefined);
            }
            else {
                const item = new actionViewItems_1.ActionViewItem({}, action, options);
                return item;
            }
        }
        async submitComment() {
            if (this._commentEditor && this._commentFormActions) {
                this._commentFormActions.triggerDefaultAction();
            }
        }
        createReactionPicker(reactionGroup) {
            const toggleReactionAction = this._register(new reactionsAction_1.ToggleReactionsAction(() => {
                toggleReactionActionViewItem?.show();
            }, nls.localize('commentToggleReaction', "Toggle Reaction")));
            let reactionMenuActions = [];
            if (reactionGroup && reactionGroup.length) {
                reactionMenuActions = reactionGroup.map((reaction) => {
                    return new actions_1.Action(`reaction.command.${reaction.label}`, `${reaction.label}`, '', true, async () => {
                        try {
                            await this.commentService.toggleReaction(this.owner, this.resource, this.commentThread, this.comment, reaction);
                        }
                        catch (e) {
                            const error = e.message
                                ? nls.localize('commentToggleReactionError', "Toggling the comment reaction failed: {0}.", e.message)
                                : nls.localize('commentToggleReactionDefaultError', "Toggling the comment reaction failed");
                            this.notificationService.error(error);
                        }
                    });
                });
            }
            toggleReactionAction.menuActions = reactionMenuActions;
            const toggleReactionActionViewItem = new dropdownActionViewItem_1.DropdownMenuActionViewItem(toggleReactionAction, toggleReactionAction.menuActions, this.contextMenuService, {
                actionViewItemProvider: action => {
                    if (action.id === reactionsAction_1.ToggleReactionsAction.ID) {
                        return toggleReactionActionViewItem;
                    }
                    return this.actionViewItemProvider(action);
                },
                actionRunner: this.actionRunner,
                classNames: 'toolbar-toggle-pickReactions',
                anchorAlignmentProvider: () => 1 /* AnchorAlignment.RIGHT */
            });
            return toggleReactionAction;
        }
        createReactionsContainer(commentDetailsContainer) {
            this._reactionActionsContainer = dom.append(commentDetailsContainer, dom.$('div.comment-reactions'));
            this._reactionsActionBar = new actionbar_1.ActionBar(this._reactionActionsContainer, {
                actionViewItemProvider: action => {
                    if (action.id === reactionsAction_1.ToggleReactionsAction.ID) {
                        return new dropdownActionViewItem_1.DropdownMenuActionViewItem(action, action.menuActions, this.contextMenuService, {
                            actionViewItemProvider: action => this.actionViewItemProvider(action),
                            actionRunner: this.actionRunner,
                            classNames: ['toolbar-toggle-pickReactions', ...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.reactions)],
                            anchorAlignmentProvider: () => 1 /* AnchorAlignment.RIGHT */
                        });
                    }
                    return this.actionViewItemProvider(action);
                }
            });
            this._register(this._reactionsActionBar);
            const hasReactionHandler = this.commentService.hasReactionHandler(this.owner);
            this.comment.commentReactions.filter(reaction => !!reaction.count).map(reaction => {
                const action = new reactionsAction_1.ReactionAction(`reaction.${reaction.label}`, `${reaction.label}`, reaction.hasReacted && (reaction.canEdit || hasReactionHandler) ? 'active' : '', (reaction.canEdit || hasReactionHandler), async () => {
                    try {
                        await this.commentService.toggleReaction(this.owner, this.resource, this.commentThread, this.comment, reaction);
                    }
                    catch (e) {
                        let error;
                        if (reaction.hasReacted) {
                            error = e.message
                                ? nls.localize('commentDeleteReactionError', "Deleting the comment reaction failed: {0}.", e.message)
                                : nls.localize('commentDeleteReactionDefaultError', "Deleting the comment reaction failed");
                        }
                        else {
                            error = e.message
                                ? nls.localize('commentAddReactionError', "Deleting the comment reaction failed: {0}.", e.message)
                                : nls.localize('commentAddReactionDefaultError', "Deleting the comment reaction failed");
                        }
                        this.notificationService.error(error);
                    }
                }, reaction.iconPath, reaction.count);
                this._reactionsActionBar?.push(action, { label: true, icon: true });
            });
            if (hasReactionHandler) {
                const toggleReactionAction = this.createReactionPicker(this.comment.commentReactions || []);
                this._reactionsActionBar.push(toggleReactionAction, { label: false, icon: true });
            }
        }
        get commentBodyValue() {
            return (typeof this.comment.body === 'string') ? this.comment.body : this.comment.body.value;
        }
        createCommentEditor(editContainer) {
            const container = dom.append(editContainer, dom.$('.edit-textarea'));
            this._commentEditor = this.instantiationService.createInstance(simpleCommentEditor_1.SimpleCommentEditor, container, simpleCommentEditor_1.SimpleCommentEditor.getEditorOptions(this.configurationService), this._contextKeyService, this.parentThread);
            const resource = uri_1.URI.parse(`comment:commentinput-${this.comment.uniqueIdInThread}-${Date.now()}.md`);
            this._commentEditorModel = this.modelService.createModel('', this.languageService.createByFilepathOrFirstLine(resource), resource, false);
            this._commentEditor.setModel(this._commentEditorModel);
            this._commentEditor.setValue(this.pendingEdit ?? this.commentBodyValue);
            this.pendingEdit = undefined;
            this._commentEditor.layout({ width: container.clientWidth - 14, height: 90 });
            this._commentEditor.focus();
            dom.scheduleAtNextAnimationFrame(() => {
                this._commentEditor.layout({ width: container.clientWidth - 14, height: 90 });
                this._commentEditor.focus();
            });
            const lastLine = this._commentEditorModel.getLineCount();
            const lastColumn = this._commentEditorModel.getLineLength(lastLine) + 1;
            this._commentEditor.setSelection(new selection_1.Selection(lastLine, lastColumn, lastLine, lastColumn));
            const commentThread = this.commentThread;
            commentThread.input = {
                uri: this._commentEditor.getModel().uri,
                value: this.commentBodyValue
            };
            this.commentService.setActiveCommentThread(commentThread);
            this._commentEditorDisposables.push(this._commentEditor.onDidFocusEditorWidget(() => {
                commentThread.input = {
                    uri: this._commentEditor.getModel().uri,
                    value: this.commentBodyValue
                };
                this.commentService.setActiveCommentThread(commentThread);
            }));
            this._commentEditorDisposables.push(this._commentEditor.onDidChangeModelContent(e => {
                if (commentThread.input && this._commentEditor && this._commentEditor.getModel().uri === commentThread.input.uri) {
                    const newVal = this._commentEditor.getValue();
                    if (newVal !== commentThread.input.value) {
                        const input = commentThread.input;
                        input.value = newVal;
                        commentThread.input = input;
                        this.commentService.setActiveCommentThread(commentThread);
                    }
                }
            }));
            this._register(this._commentEditor);
            this._register(this._commentEditorModel);
        }
        getPendingEdit() {
            const model = this._commentEditor?.getModel();
            if (model && model.getValueLength() > 0) {
                return model.getValue();
            }
            return undefined;
        }
        removeCommentEditor() {
            this.isEditing = false;
            if (this._editAction) {
                this._editAction.enabled = true;
            }
            this._body.classList.remove('hidden');
            this._commentEditorModel?.dispose();
            this._commentEditorDisposables.forEach(dispose => dispose.dispose());
            this._commentEditorDisposables = [];
            if (this._commentEditor) {
                this._commentEditor.dispose();
                this._commentEditor = null;
            }
            this._commentEditContainer.remove();
        }
        layout() {
            this._commentEditor?.layout();
            const scrollWidth = this._body.scrollWidth;
            const width = dom.getContentWidth(this._body);
            const scrollHeight = this._body.scrollHeight;
            const height = dom.getContentHeight(this._body) + 4;
            this._scrollableElement.setScrollDimensions({ width, scrollWidth, height, scrollHeight });
        }
        switchToEditMode() {
            if (this.isEditing) {
                return;
            }
            this.isEditing = true;
            this._body.classList.add('hidden');
            this._commentEditContainer = dom.append(this._commentDetailsContainer, dom.$('.edit-container'));
            this.createCommentEditor(this._commentEditContainer);
            const formActions = dom.append(this._commentEditContainer, dom.$('.form-actions'));
            const otherActions = dom.append(formActions, dom.$('.other-actions'));
            this.createCommentWidgetFormActions(otherActions);
            const editorActions = dom.append(formActions, dom.$('.editor-actions'));
            this.createCommentWidgetEditorActions(editorActions);
        }
        createCommentWidgetFormActions(container) {
            const menus = this.commentService.getCommentMenus(this.owner);
            const menu = menus.getCommentActions(this.comment, this._contextKeyService);
            this._register(menu);
            this._register(menu.onDidChange(() => {
                this._commentFormActions?.setActions(menu);
            }));
            this._commentFormActions = new commentFormActions_1.CommentFormActions(container, (action) => {
                const text = this._commentEditor.getValue();
                action.run({
                    thread: this.commentThread,
                    commentUniqueId: this.comment.uniqueIdInThread,
                    text: text,
                    $mid: 11 /* MarshalledId.CommentThreadNode */
                });
                this.removeCommentEditor();
            });
            this._register(this._commentFormActions);
            this._commentFormActions.setActions(menu);
        }
        createCommentWidgetEditorActions(container) {
            const menus = this.commentService.getCommentMenus(this.owner);
            const menu = menus.getCommentEditorActions(this._contextKeyService);
            this._register(menu);
            this._register(menu.onDidChange(() => {
                this._commentEditorActions?.setActions(menu);
            }));
            this._commentEditorActions = new commentFormActions_1.CommentFormActions(container, (action) => {
                const text = this._commentEditor.getValue();
                action.run({
                    thread: this.commentThread,
                    commentUniqueId: this.comment.uniqueIdInThread,
                    text: text,
                    $mid: 11 /* MarshalledId.CommentThreadNode */
                });
                this._commentEditor?.focus();
            });
            this._register(this._commentEditorActions);
            this._commentEditorActions.setActions(menu, true);
        }
        setFocus(focused, visible = false) {
            if (focused) {
                this._domNode.focus();
                this.toggleToolbarHidden(false);
                this._actionsToolbarContainer.classList.add('tabfocused');
                this._domNode.tabIndex = 0;
                if (this.comment.mode === languages.CommentMode.Editing) {
                    this._commentEditor?.focus();
                }
            }
            else {
                if (this._actionsToolbarContainer.classList.contains('tabfocused') && !this._actionsToolbarContainer.classList.contains('mouseover')) {
                    this.toggleToolbarHidden(true);
                    this._domNode.tabIndex = -1;
                }
                this._actionsToolbarContainer.classList.remove('tabfocused');
            }
        }
        registerActionBarListeners(actionsContainer) {
            this._register(dom.addDisposableListener(this._domNode, 'mouseenter', () => {
                this.toggleToolbarHidden(false);
                actionsContainer.classList.add('mouseover');
            }));
            this._register(dom.addDisposableListener(this._domNode, 'mouseleave', () => {
                if (actionsContainer.classList.contains('mouseover') && !actionsContainer.classList.contains('tabfocused')) {
                    this.toggleToolbarHidden(true);
                }
                actionsContainer.classList.remove('mouseover');
            }));
        }
        update(newComment) {
            if (newComment.body !== this.comment.body) {
                this.updateCommentBody(newComment.body);
            }
            const isChangingMode = newComment.mode !== undefined && newComment.mode !== this.comment.mode;
            this.comment = newComment;
            if (isChangingMode) {
                if (newComment.mode === languages.CommentMode.Editing) {
                    this.switchToEditMode();
                }
                else {
                    this.removeCommentEditor();
                }
            }
            if (newComment.label) {
                this._isPendingLabel.innerText = newComment.label;
            }
            else {
                this._isPendingLabel.innerText = '';
            }
            // update comment reactions
            this._reactionActionsContainer?.remove();
            this._reactionsActionBar?.clear();
            if (this.comment.commentReactions && this.comment.commentReactions.some(reaction => !!reaction.count)) {
                this.createReactionsContainer(this._commentDetailsContainer);
            }
            if (this.comment.contextValue) {
                this._commentContextValue.set(this.comment.contextValue);
            }
            else {
                this._commentContextValue.reset();
            }
            if (this.comment.timestamp) {
                this.updateTimestamp(this.comment.timestamp);
            }
        }
        onContextMenu(e) {
            const event = new mouseEvent_1.StandardMouseEvent(e);
            this.contextMenuService.showContextMenu({
                getAnchor: () => event,
                menuId: actions_2.MenuId.CommentThreadCommentContext,
                menuActionOptions: { shouldForwardArgs: true },
                contextKeyService: this._contextKeyService,
                actionRunner: new CommentsActionRunner(),
                getActionsContext: () => {
                    return this.commentNodeContext;
                },
            });
        }
        focus() {
            this.domNode.focus();
            if (!this._clearTimeout) {
                this.domNode.classList.add('focus');
                this._clearTimeout = setTimeout(() => {
                    this.domNode.classList.remove('focus');
                }, 3000);
            }
        }
    };
    exports.CommentNode = CommentNode;
    exports.CommentNode = CommentNode = __decorate([
        __param(7, instantiation_1.IInstantiationService),
        __param(8, commentService_1.ICommentService),
        __param(9, model_1.IModelService),
        __param(10, language_1.ILanguageService),
        __param(11, notification_1.INotificationService),
        __param(12, contextView_1.IContextMenuService),
        __param(13, contextkey_1.IContextKeyService),
        __param(14, configuration_1.IConfigurationService),
        __param(15, accessibility_1.IAccessibilityService)
    ], CommentNode);
    function fillInActions(groups, target, useAlternativeActions, isPrimaryGroup = group => group === 'navigation') {
        for (const tuple of groups) {
            let [group, actions] = tuple;
            if (useAlternativeActions) {
                actions = actions.map(a => (a instanceof actions_2.MenuItemAction) && !!a.alt ? a.alt : a);
            }
            if (isPrimaryGroup(group)) {
                const to = Array.isArray(target) ? target : target.primary;
                to.unshift(...actions);
            }
            else {
                const to = Array.isArray(target) ? target : target.secondary;
                if (to.length > 0) {
                    to.push(new actions_1.Separator());
                }
                to.push(...actions);
            }
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudE5vZGUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jb21tZW50cy9icm93c2VyL2NvbW1lbnROb2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWlEaEcsTUFBTSxvQkFBcUIsU0FBUSxzQkFBWTtRQUMzQixLQUFLLENBQUMsU0FBUyxDQUFDLE1BQWUsRUFBRSxPQUFjO1lBQ2pFLE1BQU0sTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDO1FBQzlCLENBQUM7S0FDRDtJQUVNLElBQU0sV0FBVyxHQUFqQixNQUFNLFdBQTJDLFNBQVEsc0JBQVU7UUFpQ3pFLElBQVcsT0FBTztZQUNqQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDdEIsQ0FBQztRQUlELFlBQ1MsYUFBeUMsRUFDMUMsT0FBMEIsRUFDekIsV0FBK0IsRUFDL0IsS0FBYSxFQUNiLFFBQWEsRUFDYixZQUFrQyxFQUNsQyxnQkFBa0MsRUFDbkIsb0JBQW1ELEVBQ3pELGNBQXVDLEVBQ3pDLFlBQW1DLEVBQ2hDLGVBQXlDLEVBQ3JDLG1CQUFpRCxFQUNsRCxrQkFBK0MsRUFDaEQsaUJBQXFDLEVBQ2xDLG9CQUFtRCxFQUNuRCxvQkFBbUQ7WUFFMUUsS0FBSyxFQUFFLENBQUM7WUFqQkEsa0JBQWEsR0FBYixhQUFhLENBQTRCO1lBQzFDLFlBQU8sR0FBUCxPQUFPLENBQW1CO1lBQ3pCLGdCQUFXLEdBQVgsV0FBVyxDQUFvQjtZQUMvQixVQUFLLEdBQUwsS0FBSyxDQUFRO1lBQ2IsYUFBUSxHQUFSLFFBQVEsQ0FBSztZQUNiLGlCQUFZLEdBQVosWUFBWSxDQUFzQjtZQUNsQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1lBQ1gseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUNqRCxtQkFBYyxHQUFk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