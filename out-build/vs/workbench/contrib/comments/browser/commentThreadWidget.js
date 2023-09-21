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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/languages", "vs/workbench/contrib/comments/browser/commentReply", "vs/workbench/contrib/comments/browser/commentService", "vs/workbench/contrib/comments/browser/commentThreadBody", "vs/workbench/contrib/comments/browser/commentThreadHeader", "vs/workbench/contrib/comments/browser/commentThreadAdditionalActions", "vs/workbench/contrib/comments/common/commentContextKeys", "vs/platform/theme/common/colorRegistry", "vs/workbench/common/theme", "vs/workbench/contrib/comments/browser/commentColors", "vs/platform/contextview/browser/contextView", "vs/workbench/browser/actions/widgetNavigationCommands", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/comments/common/commentsConfiguration", "vs/css!./media/review"], function (require, exports, dom, event_1, lifecycle_1, languages, commentReply_1, commentService_1, commentThreadBody_1, commentThreadHeader_1, commentThreadAdditionalActions_1, commentContextKeys_1, colorRegistry_1, theme_1, commentColors_1, contextView_1, widgetNavigationCommands_1, configuration_1, commentsConfiguration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Emb = exports.$Dmb = void 0;
    exports.$Dmb = 'commenteditordecoration';
    let $Emb = class $Emb extends lifecycle_1.$kc {
        get commentThread() {
            return this.z;
        }
        constructor(container, t, u, w, y, z, C, D, F, G, H, I, contextMenuService, J) {
            super();
            this.container = container;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.h = [];
            this.r = new event_1.$fd();
            this.onDidResize = this.r.event;
            this.j = commentContextKeys_1.CommentContextKeys.commentThreadIsEmpty.bindTo(this.w);
            this.j.set(!z.comments || !z.comments.length);
            this.g = this.I.getCommentMenus(this.t);
            this.a = new commentThreadHeader_1.$Amb(container, {
                collapse: this.collapse.bind(this)
            }, this.g, this.z, this.w, this.y, contextMenuService);
            this.a.updateCommentThread(this.z);
            const bodyElement = dom.$('.body');
            container.appendChild(bodyElement);
            const tracker = this.B(dom.$8O(bodyElement));
            this.B((0, widgetNavigationCommands_1.$Cmb)({
                focusNotifiers: [tracker],
                focusNextWidget: () => {
                    if (!this.c?.isCommentEditorFocused()) {
                        this.c?.expandReplyAreaAndFocusCommentEditor();
                    }
                },
                focusPreviousWidget: () => {
                    if (this.c?.isCommentEditorFocused() && this.z.comments?.length) {
                        this.b.focus();
                    }
                }
            }));
            this.b = this.y.createInstance(commentThreadBody_1.$zmb, this.t, this.u, bodyElement, this.F, this.z, this.D, this.y, this);
            this.B(this.b);
            this.m = dom.$XO(this.container);
            this.n = commentContextKeys_1.CommentContextKeys.commentThreadContext.bindTo(this.w);
            this.n.set(z.contextValue);
            const commentControllerKey = commentContextKeys_1.CommentContextKeys.commentControllerContext.bindTo(this.w);
            const controller = this.I.getCommentController(this.t);
            if (controller?.contextValue) {
                commentControllerKey.set(controller.contextValue);
            }
            this.M();
        }
        L(hasMouse, hasFocus) {
            if (hasMouse || hasFocus) {
                this.I.setCurrentCommentThread(this.commentThread);
            }
            else {
                this.I.setCurrentCommentThread(undefined);
            }
        }
        M() {
            let hasMouse = false;
            let hasFocus = false;
            this.B(dom.$nO(this.container, dom.$3O.MOUSE_ENTER, (e) => {
                if (e.toElement === this.container) {
                    hasMouse = true;
                    this.L(hasMouse, hasFocus);
                }
            }, true));
            this.B(dom.$nO(this.container, dom.$3O.MOUSE_LEAVE, (e) => {
                if (e.fromElement === this.container) {
                    hasMouse = false;
                    this.L(hasMouse, hasFocus);
                }
            }, true));
            this.B(dom.$nO(this.container, dom.$3O.FOCUS_IN, () => {
                hasFocus = true;
                this.L(hasMouse, hasFocus);
            }, true));
            this.B(dom.$nO(this.container, dom.$3O.FOCUS_OUT, () => {
                hasFocus = false;
                this.L(hasMouse, hasFocus);
            }, true));
        }
        updateCommentThread(commentThread) {
            const shouldCollapse = (this.z.collapsibleState === languages.CommentThreadCollapsibleState.Expanded) && (this.s === languages.CommentThreadState.Unresolved)
                && (commentThread.state === languages.CommentThreadState.Resolved);
            this.s = commentThread.state;
            this.z = commentThread;
            (0, lifecycle_1.$fc)(this.h);
            this.h = [];
            this.O();
            this.b.updateCommentThread(commentThread);
            this.j.set(!this.b.length);
            this.a.updateCommentThread(commentThread);
            this.c?.updateCommentThread(commentThread);
            if (this.z.contextValue) {
                this.n.set(this.z.contextValue);
            }
            else {
                this.n.reset();
            }
            if (shouldCollapse && this.J.getValue(commentsConfiguration_1.$Hlb).collapseOnResolve) {
                this.collapse();
            }
        }
        display(lineHeight) {
            const headHeight = Math.ceil(lineHeight * 1.2);
            this.a.updateHeight(headHeight);
            this.b.display();
            // create comment thread only when it supports reply
            if (this.z.canReply) {
                this.P();
            }
            this.Q();
            this.B(this.b.onDidResize(dimension => {
                this.N(dimension);
            }));
            // If there are no existing comments, place focus on the text area. This must be done after show, which also moves focus.
            // if this._commentThread.comments is undefined, it doesn't finish initialization yet, so we don't focus the editor immediately.
            if (this.z.canReply && this.c) {
                this.c.focusIfNeeded();
            }
            this.O();
        }
        N(dimension) {
            this.b.layout();
            this.r.fire(dimension);
        }
        dispose() {
            super.dispose();
            this.L(false, false);
        }
        O() {
            this.h.push(this.z.onDidChangeCanReply(() => {
                if (this.c) {
                    this.c.updateCanReply();
                }
                else {
                    if (this.z.canReply) {
                        this.P();
                    }
                }
            }));
            this.h.push(this.z.onDidChangeComments(async (_) => {
                await this.updateCommentThread(this.z);
            }));
            this.h.push(this.z.onDidChangeLabel(_ => {
                this.a.createThreadLabel();
            }));
        }
        P() {
            this.c = this.y.createInstance(commentReply_1.$umb, this.t, this.b.container, this.z, this.y, this.w, this.g, this.G, this.C, this, this.H.actionRunner);
            this.B(this.c);
        }
        Q() {
            this.f = this.y.createInstance(commentThreadAdditionalActions_1.$Bmb, this.b.container, this.z, this.w, this.g, this.H.actionRunner);
            this.B(this.f);
        }
        getCommentCoords(commentUniqueId) {
            return this.b.getCommentCoords(commentUniqueId);
        }
        getPendingEdits() {
            return this.b.getPendingEdits();
        }
        getPendingComment() {
            if (this.c) {
                return this.c.getPendingComment();
            }
            return undefined;
        }
        getDimensions() {
            return this.b.getDimensions();
        }
        layout(widthInPixel) {
            this.b.layout();
            if (widthInPixel !== undefined) {
                this.c?.layout(widthInPixel);
            }
        }
        focusCommentEditor() {
            this.c?.focusCommentEditor();
        }
        focus() {
            this.b.focus();
        }
        async submitComment() {
            const activeComment = this.b.activeComment;
            if (activeComment) {
                return activeComment.submitComment();
            }
            else if ((this.c?.getPendingComment()?.length ?? 0) > 0) {
                return this.c?.submitComment();
            }
        }
        collapse() {
            this.H.collapse();
        }
        applyTheme(theme, fontInfo) {
            const content = [];
            content.push(`.monaco-editor .review-widget > .body { border-top: 1px solid var(${commentColors_1.$Qlb}) }`);
            content.push(`.monaco-editor .review-widget > .head { background-color: var(${commentColors_1.$Slb}) }`);
            const linkColor = theme.getColor(colorRegistry_1.$Ev);
            if (linkColor) {
                content.push(`.review-widget .body .comment-body a { color: ${linkColor} }`);
            }
            const linkActiveColor = theme.getColor(colorRegistry_1.$Fv);
            if (linkActiveColor) {
                content.push(`.review-widget .body .comment-body a:hover, a:active { color: ${linkActiveColor} }`);
            }
            const focusColor = theme.getColor(colorRegistry_1.$zv);
            if (focusColor) {
                content.push(`.review-widget .body .comment-body a:focus { outline: 1px solid ${focusColor}; }`);
                content.push(`.review-widget .body .monaco-editor.focused { outline: 1px solid ${focusColor}; }`);
            }
            const blockQuoteBackground = theme.getColor(colorRegistry_1.$Hv);
            if (blockQuoteBackground) {
                content.push(`.review-widget .body .review-comment blockquote { background: ${blockQuoteBackground}; }`);
            }
            const blockQuoteBOrder = theme.getColor(colorRegistry_1.$Iv);
            if (blockQuoteBOrder) {
                content.push(`.review-widget .body .review-comment blockquote { border-color: ${blockQuoteBOrder}; }`);
            }
            const border = theme.getColor(theme_1.$M_);
            if (border) {
                content.push(`.review-widget .body .review-comment .review-comment-contents .comment-reactions .action-item a.action-label { border-color: ${border}; }`);
            }
            const hcBorder = theme.getColor(colorRegistry_1.$Av);
            if (hcBorder) {
                content.push(`.review-widget .body .comment-form .review-thread-reply-button { outline-color: ${hcBorder}; }`);
                content.push(`.review-widget .body .monaco-editor { outline: 1px solid ${hcBorder}; }`);
            }
            const errorBorder = theme.getColor(colorRegistry_1.$3v);
            if (errorBorder) {
                content.push(`.review-widget .validation-error { border: 1px solid ${errorBorder}; }`);
            }
            const errorBackground = theme.getColor(colorRegistry_1.$1v);
            if (errorBackground) {
                content.push(`.review-widget .validation-error { background: ${errorBackground}; }`);
            }
            const errorForeground = theme.getColor(colorRegistry_1.$2v);
            if (errorForeground) {
                content.push(`.review-widget .body .comment-form .validation-error { color: ${errorForeground}; }`);
            }
            const fontFamilyVar = '--comment-thread-editor-font-family';
            const fontSizeVar = '--comment-thread-editor-font-size';
            const fontWeightVar = '--comment-thread-editor-font-weight';
            this.container?.style.setProperty(fontFamilyVar, fontInfo.fontFamily);
            this.container?.style.setProperty(fontSizeVar, `${fontInfo.fontSize}px`);
            this.container?.style.setProperty(fontWeightVar, fontInfo.fontWeight);
            content.push(`.review-widget .body code {
			font-family: var(${fontFamilyVar});
			font-weight: var(${fontWeightVar});
		}`);
            this.m.textContent = content.join('\n');
            this.c?.setCommentEditorDecorations();
        }
    };
    exports.$Emb = $Emb;
    exports.$Emb = $Emb = __decorate([
        __param(11, commentService_1.$Ilb),
        __param(12, contextView_1.$WZ),
        __param(13, configuration_1.$8h)
    ], $Emb);
});
//# sourceMappingURL=commentThreadWidget.js.map