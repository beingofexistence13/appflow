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
define(["require", "exports", "vs/nls!vs/workbench/contrib/comments/browser/commentNode", "vs/base/browser/dom", "vs/editor/common/languages", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/comments/browser/commentService", "vs/workbench/contrib/comments/browser/simpleCommentEditor", "vs/editor/common/core/selection", "vs/base/common/event", "vs/platform/notification/common/notification", "vs/base/browser/ui/toolbar/toolbar", "vs/platform/contextview/browser/contextView", "./reactionsAction", "vs/platform/actions/common/actions", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/comments/browser/commentFormActions", "vs/base/browser/ui/mouseCursor/mouseCursor", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/dropdown/dropdownActionViewItem", "vs/base/common/codicons", "vs/base/common/themables", "vs/workbench/contrib/comments/browser/timestamp", "vs/platform/configuration/common/configuration", "vs/base/common/scrollable", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/browser/event", "vs/workbench/contrib/comments/common/commentContextKeys", "vs/base/common/network", "vs/workbench/contrib/comments/common/commentsConfiguration", "vs/base/browser/mouseEvent", "vs/platform/accessibility/common/accessibility"], function (require, exports, nls, dom, languages, actionbar_1, actions_1, lifecycle_1, uri_1, model_1, language_1, instantiation_1, commentService_1, simpleCommentEditor_1, selection_1, event_1, notification_1, toolbar_1, contextView_1, reactionsAction_1, actions_2, menuEntryActionViewItem_1, contextkey_1, commentFormActions_1, mouseCursor_1, actionViewItems_1, dropdownActionViewItem_1, codicons_1, themables_1, timestamp_1, configuration_1, scrollable_1, scrollableElement_1, event_2, commentContextKeys_1, network_1, commentsConfiguration_1, mouseEvent_1, accessibility_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ymb = void 0;
    class CommentsActionRunner extends actions_1.$hi {
        async u(action, context) {
            await action.run(...context);
        }
    }
    let $ymb = class $ymb extends lifecycle_1.$kc {
        get domNode() {
            return this.b;
        }
        constructor(R, comment, S, U, W, X, Y, Z, ab, bb, db, eb, fb, contextKeyService, gb, hb) {
            super();
            this.R = R;
            this.comment = comment;
            this.S = S;
            this.U = U;
            this.W = W;
            this.X = X;
            this.Y = Y;
            this.Z = Z;
            this.ab = ab;
            this.bb = bb;
            this.db = db;
            this.eb = eb;
            this.fb = fb;
            this.gb = gb;
            this.hb = hb;
            this.m = null;
            this.n = null;
            this.w = null;
            this.y = [];
            this.z = null;
            this.O = null;
            this.P = null;
            this.Q = new event_1.$fd();
            this.isEditing = false;
            this.b = dom.$('div.review-comment');
            this.G = contextKeyService.createScoped(this.b);
            this.H = commentContextKeys_1.CommentContextKeys.commentContext.bindTo(this.G);
            if (this.comment.contextValue) {
                this.H.set(this.comment.contextValue);
            }
            this.I = this.ab.getCommentMenus(this.U);
            this.b.tabIndex = -1;
            const avatar = dom.$0O(this.b, dom.$('div.avatar-container'));
            if (comment.userIconPath) {
                const img = dom.$0O(avatar, dom.$('img.avatar'));
                img.src = network_1.$2f.uriToBrowserUri(uri_1.URI.revive(comment.userIconPath)).toString(true);
                img.onerror = _ => img.remove();
            }
            this.r = dom.$0O(this.b, dom.$('.review-comment-contents'));
            this.mb(this.r);
            this.c = document.createElement(`div`);
            this.c.classList.add('comment-body', mouseCursor_1.$WR);
            if (gb.getValue(commentsConfiguration_1.$Hlb)?.maxHeight !== false) {
                this.c.classList.add('comment-body-max-height');
            }
            this.ib(this.r, this.c);
            this.jb(this.comment.body);
            if (this.comment.commentReactions && this.comment.commentReactions.length && this.comment.commentReactions.filter(reaction => !!reaction.count).length) {
                this.tb(this.r);
            }
            this.b.setAttribute('aria-label', `${comment.userName}, ${this.commentBodyValue}`);
            this.b.setAttribute('role', 'treeitem');
            this.j = null;
            this.B(dom.$nO(this.b, dom.$3O.CLICK, () => this.isEditing || this.Q.fire(this)));
            this.B(dom.$nO(this.b, dom.$3O.CONTEXT_MENU, e => {
                return this.zb(e);
            }));
            if (S) {
                this.switchToEditMode();
            }
            this.B(this.hb.onDidChangeScreenReaderOptimized(() => {
                this.nb(true);
            }));
        }
        ib(container, body) {
            this.J = new scrollable_1.$Nr({
                forceIntegerValues: true,
                smoothScrollDuration: 125,
                scheduleAtNextAnimationFrame: cb => dom.$vO(cb)
            });
            this.L = this.B(new scrollableElement_1.$TP(body, {
                horizontal: 3 /* ScrollbarVisibility.Visible */,
                vertical: 3 /* ScrollbarVisibility.Visible */
            }, this.J));
            this.B(this.L.onScroll(e => {
                if (e.scrollLeftChanged) {
                    body.scrollLeft = e.scrollLeft;
                }
                if (e.scrollTopChanged) {
                    body.scrollTop = e.scrollTop;
                }
            }));
            const onDidScrollViewContainer = this.B(new event_2.$9P(body, 'scroll')).event;
            this.B(onDidScrollViewContainer(_ => {
                const position = this.L.getScrollPosition();
                const scrollLeft = Math.abs(body.scrollLeft - position.scrollLeft) <= 1 ? undefined : body.scrollLeft;
                const scrollTop = Math.abs(body.scrollTop - position.scrollTop) <= 1 ? undefined : body.scrollTop;
                if (scrollLeft !== undefined || scrollTop !== undefined) {
                    this.L.setScrollPosition({ scrollLeft, scrollTop });
                }
            }));
            container.appendChild(this.L.getDomNode());
        }
        jb(body) {
            this.c.innerText = '';
            this.f = undefined;
            this.h = undefined;
            if (typeof body === 'string') {
                this.h = dom.$0O(this.c, dom.$('.comment-body-plainstring'));
                this.h.innerText = body;
            }
            else {
                this.f = this.Y.render(body).element;
                this.c.appendChild(this.f);
            }
        }
        get onDidClick() {
            return this.Q.event;
        }
        kb(container) {
            this.D = dom.$0O(container, dom.$('span.timestamp-container'));
            this.lb(this.comment.timestamp);
        }
        lb(raw) {
            if (!this.D) {
                return;
            }
            const timestamp = raw !== undefined ? new Date(raw) : undefined;
            if (!timestamp) {
                this.F?.dispose();
            }
            else {
                if (!this.F) {
                    this.F = new timestamp_1.$Nlb(this.gb, this.D, timestamp);
                    this.B(this.F);
                }
                else {
                    this.F.setTimestamp(timestamp);
                }
            }
        }
        mb(commentDetailsContainer) {
            const header = dom.$0O(commentDetailsContainer, dom.$(`div.comment-title.${mouseCursor_1.$WR}`));
            const infoContainer = dom.$0O(header, dom.$('comment-header-info'));
            const author = dom.$0O(infoContainer, dom.$('strong.author'));
            author.innerText = this.comment.userName;
            this.kb(infoContainer);
            this.C = dom.$0O(infoContainer, dom.$('span.isPending'));
            if (this.comment.label) {
                this.C.innerText = this.comment.label;
            }
            else {
                this.C.innerText = '';
            }
            this.s = dom.$0O(header, dom.$('.comment-actions'));
            this.nb(true);
            this.rb();
        }
        nb(hidden) {
            if (hidden && !this.hb.isScreenReaderOptimized()) {
                this.s.classList.add('hidden');
            }
            else {
                this.s.classList.remove('hidden');
            }
        }
        ob(menu) {
            const contributedActions = menu.getActions({ shouldForwardArgs: true });
            const primary = [];
            const secondary = [];
            const result = { primary, secondary };
            fillInActions(contributedActions, result, false, g => /^inline/.test(g));
            return result;
        }
        get pb() {
            return [{
                    thread: this.R,
                    commentUniqueId: this.comment.uniqueIdInThread,
                    $mid: 10 /* MarshalledId.CommentNode */
                },
                {
                    commentControlHandle: this.R.controllerHandle,
                    commentThreadHandle: this.R.commentThreadHandle,
                    $mid: 7 /* MarshalledId.CommentThread */
                }];
        }
        qb() {
            this.N = new toolbar_1.$6R(this.s, this.fb, {
                actionViewItemProvider: action => {
                    if (action.id === reactionsAction_1.$vmb.ID) {
                        return new dropdownActionViewItem_1.$CR(action, action.menuActions, this.fb, {
                            actionViewItemProvider: action => this.actionViewItemProvider(action),
                            actionRunner: this.M,
                            classNames: ['toolbar-toggle-pickReactions', ...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.reactions)],
                            anchorAlignmentProvider: () => 1 /* AnchorAlignment.RIGHT */
                        });
                    }
                    return this.actionViewItemProvider(action);
                },
                orientation: 0 /* ActionsOrientation.HORIZONTAL */
            });
            this.N.context = this.pb;
            this.N.actionRunner = new CommentsActionRunner();
            this.yb(this.s);
            this.B(this.N);
        }
        rb() {
            const actions = [];
            const hasReactionHandler = this.ab.hasReactionHandler(this.U);
            if (hasReactionHandler) {
                const toggleReactionAction = this.sb(this.comment.commentReactions || []);
                actions.push(toggleReactionAction);
            }
            const menu = this.I.getCommentTitleActions(this.comment, this.G);
            this.B(menu);
            this.B(menu.onDidChange(e => {
                const { primary, secondary } = this.ob(menu);
                if (!this.N && (primary.length || secondary.length)) {
                    this.qb();
                }
                this.N.setActions(primary, secondary);
            }));
            const { primary, secondary } = this.ob(menu);
            actions.push(...primary);
            if (actions.length || secondary.length) {
                this.qb();
                this.N.setActions(actions, secondary);
            }
        }
        actionViewItemProvider(action) {
            let options = {};
            if (action.id === reactionsAction_1.$vmb.ID) {
                options = { label: false, icon: true };
            }
            else {
                options = { label: false, icon: true };
            }
            if (action.id === reactionsAction_1.$xmb.ID) {
                const item = new reactionsAction_1.$wmb(action);
                return item;
            }
            else if (action instanceof actions_2.$Vu) {
                return this.Z.createInstance(menuEntryActionViewItem_1.$C3, action, undefined);
            }
            else if (action instanceof actions_2.$Uu) {
                return this.Z.createInstance(menuEntryActionViewItem_1.$D3, action, undefined);
            }
            else {
                const item = new actionViewItems_1.$NQ({}, action, options);
                return item;
            }
        }
        async submitComment() {
            if (this.w && this.O) {
                this.O.triggerDefaultAction();
            }
        }
        sb(reactionGroup) {
            const toggleReactionAction = this.B(new reactionsAction_1.$vmb(() => {
                toggleReactionActionViewItem?.show();
            }, nls.localize(0, null)));
            let reactionMenuActions = [];
            if (reactionGroup && reactionGroup.length) {
                reactionMenuActions = reactionGroup.map((reaction) => {
                    return new actions_1.$gi(`reaction.command.${reaction.label}`, `${reaction.label}`, '', true, async () => {
                        try {
                            await this.ab.toggleReaction(this.U, this.W, this.R, this.comment, reaction);
                        }
                        catch (e) {
                            const error = e.message
                                ? nls.localize(1, null, e.message)
                                : nls.localize(2, null);
                            this.eb.error(error);
                        }
                    });
                });
            }
            toggleReactionAction.menuActions = reactionMenuActions;
            const toggleReactionActionViewItem = new dropdownActionViewItem_1.$CR(toggleReactionAction, toggleReactionAction.menuActions, this.fb, {
                actionViewItemProvider: action => {
                    if (action.id === reactionsAction_1.$vmb.ID) {
                        return toggleReactionActionViewItem;
                    }
                    return this.actionViewItemProvider(action);
                },
                actionRunner: this.M,
                classNames: 'toolbar-toggle-pickReactions',
                anchorAlignmentProvider: () => 1 /* AnchorAlignment.RIGHT */
            });
            return toggleReactionAction;
        }
        tb(commentDetailsContainer) {
            this.u = dom.$0O(commentDetailsContainer, dom.$('div.comment-reactions'));
            this.t = new actionbar_1.$1P(this.u, {
                actionViewItemProvider: action => {
                    if (action.id === reactionsAction_1.$vmb.ID) {
                        return new dropdownActionViewItem_1.$CR(action, action.menuActions, this.fb, {
                            actionViewItemProvider: action => this.actionViewItemProvider(action),
                            actionRunner: this.M,
                            classNames: ['toolbar-toggle-pickReactions', ...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.reactions)],
                            anchorAlignmentProvider: () => 1 /* AnchorAlignment.RIGHT */
                        });
                    }
                    return this.actionViewItemProvider(action);
                }
            });
            this.B(this.t);
            const hasReactionHandler = this.ab.hasReactionHandler(this.U);
            this.comment.commentReactions.filter(reaction => !!reaction.count).map(reaction => {
                const action = new reactionsAction_1.$xmb(`reaction.${reaction.label}`, `${reaction.label}`, reaction.hasReacted && (reaction.canEdit || hasReactionHandler) ? 'active' : '', (reaction.canEdit || hasReactionHandler), async () => {
                    try {
                        await this.ab.toggleReaction(this.U, this.W, this.R, this.comment, reaction);
                    }
                    catch (e) {
                        let error;
                        if (reaction.hasReacted) {
                            error = e.message
                                ? nls.localize(3, null, e.message)
                                : nls.localize(4, null);
                        }
                        else {
                            error = e.message
                                ? nls.localize(5, null, e.message)
                                : nls.localize(6, null);
                        }
                        this.eb.error(error);
                    }
                }, reaction.iconPath, reaction.count);
                this.t?.push(action, { label: true, icon: true });
            });
            if (hasReactionHandler) {
                const toggleReactionAction = this.sb(this.comment.commentReactions || []);
                this.t.push(toggleReactionAction, { label: false, icon: true });
            }
        }
        get commentBodyValue() {
            return (typeof this.comment.body === 'string') ? this.comment.body : this.comment.body.value;
        }
        ub(editContainer) {
            const container = dom.$0O(editContainer, dom.$('.edit-textarea'));
            this.w = this.Z.createInstance(simpleCommentEditor_1.$smb, container, simpleCommentEditor_1.$smb.getEditorOptions(this.gb), this.G, this.X);
            const resource = uri_1.URI.parse(`comment:commentinput-${this.comment.uniqueIdInThread}-${Date.now()}.md`);
            this.z = this.bb.createModel('', this.db.createByFilepathOrFirstLine(resource), resource, false);
            this.w.setModel(this.z);
            this.w.setValue(this.S ?? this.commentBodyValue);
            this.S = undefined;
            this.w.layout({ width: container.clientWidth - 14, height: 90 });
            this.w.focus();
            dom.$vO(() => {
                this.w.layout({ width: container.clientWidth - 14, height: 90 });
                this.w.focus();
            });
            const lastLine = this.z.getLineCount();
            const lastColumn = this.z.getLineLength(lastLine) + 1;
            this.w.setSelection(new selection_1.$ms(lastLine, lastColumn, lastLine, lastColumn));
            const commentThread = this.R;
            commentThread.input = {
                uri: this.w.getModel().uri,
                value: this.commentBodyValue
            };
            this.ab.setActiveCommentThread(commentThread);
            this.y.push(this.w.onDidFocusEditorWidget(() => {
                commentThread.input = {
                    uri: this.w.getModel().uri,
                    value: this.commentBodyValue
                };
                this.ab.setActiveCommentThread(commentThread);
            }));
            this.y.push(this.w.onDidChangeModelContent(e => {
                if (commentThread.input && this.w && this.w.getModel().uri === commentThread.input.uri) {
                    const newVal = this.w.getValue();
                    if (newVal !== commentThread.input.value) {
                        const input = commentThread.input;
                        input.value = newVal;
                        commentThread.input = input;
                        this.ab.setActiveCommentThread(commentThread);
                    }
                }
            }));
            this.B(this.w);
            this.B(this.z);
        }
        getPendingEdit() {
            const model = this.w?.getModel();
            if (model && model.getValueLength() > 0) {
                return model.getValue();
            }
            return undefined;
        }
        vb() {
            this.isEditing = false;
            if (this.m) {
                this.m.enabled = true;
            }
            this.c.classList.remove('hidden');
            this.z?.dispose();
            this.y.forEach(dispose => dispose.dispose());
            this.y = [];
            if (this.w) {
                this.w.dispose();
                this.w = null;
            }
            this.n.remove();
        }
        layout() {
            this.w?.layout();
            const scrollWidth = this.c.scrollWidth;
            const width = dom.$IO(this.c);
            const scrollHeight = this.c.scrollHeight;
            const height = dom.$KO(this.c) + 4;
            this.L.setScrollDimensions({ width, scrollWidth, height, scrollHeight });
        }
        switchToEditMode() {
            if (this.isEditing) {
                return;
            }
            this.isEditing = true;
            this.c.classList.add('hidden');
            this.n = dom.$0O(this.r, dom.$('.edit-container'));
            this.ub(this.n);
            const formActions = dom.$0O(this.n, dom.$('.form-actions'));
            const otherActions = dom.$0O(formActions, dom.$('.other-actions'));
            this.wb(otherActions);
            const editorActions = dom.$0O(formActions, dom.$('.editor-actions'));
            this.xb(editorActions);
        }
        wb(container) {
            const menus = this.ab.getCommentMenus(this.U);
            const menu = menus.getCommentActions(this.comment, this.G);
            this.B(menu);
            this.B(menu.onDidChange(() => {
                this.O?.setActions(menu);
            }));
            this.O = new commentFormActions_1.$9lb(container, (action) => {
                const text = this.w.getValue();
                action.run({
                    thread: this.R,
                    commentUniqueId: this.comment.uniqueIdInThread,
                    text: text,
                    $mid: 11 /* MarshalledId.CommentThreadNode */
                });
                this.vb();
            });
            this.B(this.O);
            this.O.setActions(menu);
        }
        xb(container) {
            const menus = this.ab.getCommentMenus(this.U);
            const menu = menus.getCommentEditorActions(this.G);
            this.B(menu);
            this.B(menu.onDidChange(() => {
                this.P?.setActions(menu);
            }));
            this.P = new commentFormActions_1.$9lb(container, (action) => {
                const text = this.w.getValue();
                action.run({
                    thread: this.R,
                    commentUniqueId: this.comment.uniqueIdInThread,
                    text: text,
                    $mid: 11 /* MarshalledId.CommentThreadNode */
                });
                this.w?.focus();
            });
            this.B(this.P);
            this.P.setActions(menu, true);
        }
        setFocus(focused, visible = false) {
            if (focused) {
                this.b.focus();
                this.nb(false);
                this.s.classList.add('tabfocused');
                this.b.tabIndex = 0;
                if (this.comment.mode === languages.CommentMode.Editing) {
                    this.w?.focus();
                }
            }
            else {
                if (this.s.classList.contains('tabfocused') && !this.s.classList.contains('mouseover')) {
                    this.nb(true);
                    this.b.tabIndex = -1;
                }
                this.s.classList.remove('tabfocused');
            }
        }
        yb(actionsContainer) {
            this.B(dom.$nO(this.b, 'mouseenter', () => {
                this.nb(false);
                actionsContainer.classList.add('mouseover');
            }));
            this.B(dom.$nO(this.b, 'mouseleave', () => {
                if (actionsContainer.classList.contains('mouseover') && !actionsContainer.classList.contains('tabfocused')) {
                    this.nb(true);
                }
                actionsContainer.classList.remove('mouseover');
            }));
        }
        update(newComment) {
            if (newComment.body !== this.comment.body) {
                this.jb(newComment.body);
            }
            const isChangingMode = newComment.mode !== undefined && newComment.mode !== this.comment.mode;
            this.comment = newComment;
            if (isChangingMode) {
                if (newComment.mode === languages.CommentMode.Editing) {
                    this.switchToEditMode();
                }
                else {
                    this.vb();
                }
            }
            if (newComment.label) {
                this.C.innerText = newComment.label;
            }
            else {
                this.C.innerText = '';
            }
            // update comment reactions
            this.u?.remove();
            this.t?.clear();
            if (this.comment.commentReactions && this.comment.commentReactions.some(reaction => !!reaction.count)) {
                this.tb(this.r);
            }
            if (this.comment.contextValue) {
                this.H.set(this.comment.contextValue);
            }
            else {
                this.H.reset();
            }
            if (this.comment.timestamp) {
                this.lb(this.comment.timestamp);
            }
        }
        zb(e) {
            const event = new mouseEvent_1.$eO(e);
            this.fb.showContextMenu({
                getAnchor: () => event,
                menuId: actions_2.$Ru.CommentThreadCommentContext,
                menuActionOptions: { shouldForwardArgs: true },
                contextKeyService: this.G,
                actionRunner: new CommentsActionRunner(),
                getActionsContext: () => {
                    return this.pb;
                },
            });
        }
        focus() {
            this.domNode.focus();
            if (!this.j) {
                this.domNode.classList.add('focus');
                this.j = setTimeout(() => {
                    this.domNode.classList.remove('focus');
                }, 3000);
            }
        }
    };
    exports.$ymb = $ymb;
    exports.$ymb = $ymb = __decorate([
        __param(7, instantiation_1.$Ah),
        __param(8, commentService_1.$Ilb),
        __param(9, model_1.$yA),
        __param(10, language_1.$ct),
        __param(11, notification_1.$Yu),
        __param(12, contextView_1.$WZ),
        __param(13, contextkey_1.$3i),
        __param(14, configuration_1.$8h),
        __param(15, accessibility_1.$1r)
    ], $ymb);
    function fillInActions(groups, target, useAlternativeActions, isPrimaryGroup = group => group === 'navigation') {
        for (const tuple of groups) {
            let [group, actions] = tuple;
            if (useAlternativeActions) {
                actions = actions.map(a => (a instanceof actions_2.$Vu) && !!a.alt ? a.alt : a);
            }
            if (isPrimaryGroup(group)) {
                const to = Array.isArray(target) ? target : target.primary;
                to.unshift(...actions);
            }
            else {
                const to = Array.isArray(target) ? target : target.secondary;
                if (to.length > 0) {
                    to.push(new actions_1.$ii());
                }
                to.push(...actions);
            }
        }
    }
});
//# sourceMappingURL=commentNode.js.map