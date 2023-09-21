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
    exports.CommentThreadWidget = exports.COMMENTEDITOR_DECORATION_KEY = void 0;
    exports.COMMENTEDITOR_DECORATION_KEY = 'commenteditordecoration';
    let CommentThreadWidget = class CommentThreadWidget extends lifecycle_1.Disposable {
        get commentThread() {
            return this._commentThread;
        }
        constructor(container, _owner, _parentResourceUri, _contextKeyService, _scopedInstantiationService, _commentThread, _pendingComment, _pendingEdits, _markdownOptions, _commentOptions, _containerDelegate, commentService, contextMenuService, configurationService) {
            super();
            this.container = container;
            this._owner = _owner;
            this._parentResourceUri = _parentResourceUri;
            this._contextKeyService = _contextKeyService;
            this._scopedInstantiationService = _scopedInstantiationService;
            this._commentThread = _commentThread;
            this._pendingComment = _pendingComment;
            this._pendingEdits = _pendingEdits;
            this._markdownOptions = _markdownOptions;
            this._commentOptions = _commentOptions;
            this._containerDelegate = _containerDelegate;
            this.commentService = commentService;
            this.configurationService = configurationService;
            this._commentThreadDisposables = [];
            this._onDidResize = new event_1.Emitter();
            this.onDidResize = this._onDidResize.event;
            this._threadIsEmpty = commentContextKeys_1.CommentContextKeys.commentThreadIsEmpty.bindTo(this._contextKeyService);
            this._threadIsEmpty.set(!_commentThread.comments || !_commentThread.comments.length);
            this._commentMenus = this.commentService.getCommentMenus(this._owner);
            this._header = new commentThreadHeader_1.CommentThreadHeader(container, {
                collapse: this.collapse.bind(this)
            }, this._commentMenus, this._commentThread, this._contextKeyService, this._scopedInstantiationService, contextMenuService);
            this._header.updateCommentThread(this._commentThread);
            const bodyElement = dom.$('.body');
            container.appendChild(bodyElement);
            const tracker = this._register(dom.trackFocus(bodyElement));
            this._register((0, widgetNavigationCommands_1.registerNavigableContainer)({
                focusNotifiers: [tracker],
                focusNextWidget: () => {
                    if (!this._commentReply?.isCommentEditorFocused()) {
                        this._commentReply?.expandReplyAreaAndFocusCommentEditor();
                    }
                },
                focusPreviousWidget: () => {
                    if (this._commentReply?.isCommentEditorFocused() && this._commentThread.comments?.length) {
                        this._body.focus();
                    }
                }
            }));
            this._body = this._scopedInstantiationService.createInstance(commentThreadBody_1.CommentThreadBody, this._owner, this._parentResourceUri, bodyElement, this._markdownOptions, this._commentThread, this._pendingEdits, this._scopedInstantiationService, this);
            this._register(this._body);
            this._styleElement = dom.createStyleSheet(this.container);
            this._commentThreadContextValue = commentContextKeys_1.CommentContextKeys.commentThreadContext.bindTo(this._contextKeyService);
            this._commentThreadContextValue.set(_commentThread.contextValue);
            const commentControllerKey = commentContextKeys_1.CommentContextKeys.commentControllerContext.bindTo(this._contextKeyService);
            const controller = this.commentService.getCommentController(this._owner);
            if (controller?.contextValue) {
                commentControllerKey.set(controller.contextValue);
            }
            this.currentThreadListeners();
        }
        updateCurrentThread(hasMouse, hasFocus) {
            if (hasMouse || hasFocus) {
                this.commentService.setCurrentCommentThread(this.commentThread);
            }
            else {
                this.commentService.setCurrentCommentThread(undefined);
            }
        }
        currentThreadListeners() {
            let hasMouse = false;
            let hasFocus = false;
            this._register(dom.addDisposableListener(this.container, dom.EventType.MOUSE_ENTER, (e) => {
                if (e.toElement === this.container) {
                    hasMouse = true;
                    this.updateCurrentThread(hasMouse, hasFocus);
                }
            }, true));
            this._register(dom.addDisposableListener(this.container, dom.EventType.MOUSE_LEAVE, (e) => {
                if (e.fromElement === this.container) {
                    hasMouse = false;
                    this.updateCurrentThread(hasMouse, hasFocus);
                }
            }, true));
            this._register(dom.addDisposableListener(this.container, dom.EventType.FOCUS_IN, () => {
                hasFocus = true;
                this.updateCurrentThread(hasMouse, hasFocus);
            }, true));
            this._register(dom.addDisposableListener(this.container, dom.EventType.FOCUS_OUT, () => {
                hasFocus = false;
                this.updateCurrentThread(hasMouse, hasFocus);
            }, true));
        }
        updateCommentThread(commentThread) {
            const shouldCollapse = (this._commentThread.collapsibleState === languages.CommentThreadCollapsibleState.Expanded) && (this._commentThreadState === languages.CommentThreadState.Unresolved)
                && (commentThread.state === languages.CommentThreadState.Resolved);
            this._commentThreadState = commentThread.state;
            this._commentThread = commentThread;
            (0, lifecycle_1.dispose)(this._commentThreadDisposables);
            this._commentThreadDisposables = [];
            this._bindCommentThreadListeners();
            this._body.updateCommentThread(commentThread);
            this._threadIsEmpty.set(!this._body.length);
            this._header.updateCommentThread(commentThread);
            this._commentReply?.updateCommentThread(commentThread);
            if (this._commentThread.contextValue) {
                this._commentThreadContextValue.set(this._commentThread.contextValue);
            }
            else {
                this._commentThreadContextValue.reset();
            }
            if (shouldCollapse && this.configurationService.getValue(commentsConfiguration_1.COMMENTS_SECTION).collapseOnResolve) {
                this.collapse();
            }
        }
        display(lineHeight) {
            const headHeight = Math.ceil(lineHeight * 1.2);
            this._header.updateHeight(headHeight);
            this._body.display();
            // create comment thread only when it supports reply
            if (this._commentThread.canReply) {
                this._createCommentForm();
            }
            this._createAdditionalActions();
            this._register(this._body.onDidResize(dimension => {
                this._refresh(dimension);
            }));
            // If there are no existing comments, place focus on the text area. This must be done after show, which also moves focus.
            // if this._commentThread.comments is undefined, it doesn't finish initialization yet, so we don't focus the editor immediately.
            if (this._commentThread.canReply && this._commentReply) {
                this._commentReply.focusIfNeeded();
            }
            this._bindCommentThreadListeners();
        }
        _refresh(dimension) {
            this._body.layout();
            this._onDidResize.fire(dimension);
        }
        dispose() {
            super.dispose();
            this.updateCurrentThread(false, false);
        }
        _bindCommentThreadListeners() {
            this._commentThreadDisposables.push(this._commentThread.onDidChangeCanReply(() => {
                if (this._commentReply) {
                    this._commentReply.updateCanReply();
                }
                else {
                    if (this._commentThread.canReply) {
                        this._createCommentForm();
                    }
                }
            }));
            this._commentThreadDisposables.push(this._commentThread.onDidChangeComments(async (_) => {
                await this.updateCommentThread(this._commentThread);
            }));
            this._commentThreadDisposables.push(this._commentThread.onDidChangeLabel(_ => {
                this._header.createThreadLabel();
            }));
        }
        _createCommentForm() {
            this._commentReply = this._scopedInstantiationService.createInstance(commentReply_1.CommentReply, this._owner, this._body.container, this._commentThread, this._scopedInstantiationService, this._contextKeyService, this._commentMenus, this._commentOptions, this._pendingComment, this, this._containerDelegate.actionRunner);
            this._register(this._commentReply);
        }
        _createAdditionalActions() {
            this._additionalActions = this._scopedInstantiationService.createInstance(commentThreadAdditionalActions_1.CommentThreadAdditionalActions, this._body.container, this._commentThread, this._contextKeyService, this._commentMenus, this._containerDelegate.actionRunner);
            this._register(this._additionalActions);
        }
        getCommentCoords(commentUniqueId) {
            return this._body.getCommentCoords(commentUniqueId);
        }
        getPendingEdits() {
            return this._body.getPendingEdits();
        }
        getPendingComment() {
            if (this._commentReply) {
                return this._commentReply.getPendingComment();
            }
            return undefined;
        }
        getDimensions() {
            return this._body.getDimensions();
        }
        layout(widthInPixel) {
            this._body.layout();
            if (widthInPixel !== undefined) {
                this._commentReply?.layout(widthInPixel);
            }
        }
        focusCommentEditor() {
            this._commentReply?.focusCommentEditor();
        }
        focus() {
            this._body.focus();
        }
        async submitComment() {
            const activeComment = this._body.activeComment;
            if (activeComment) {
                return activeComment.submitComment();
            }
            else if ((this._commentReply?.getPendingComment()?.length ?? 0) > 0) {
                return this._commentReply?.submitComment();
            }
        }
        collapse() {
            this._containerDelegate.collapse();
        }
        applyTheme(theme, fontInfo) {
            const content = [];
            content.push(`.monaco-editor .review-widget > .body { border-top: 1px solid var(${commentColors_1.commentThreadStateColorVar}) }`);
            content.push(`.monaco-editor .review-widget > .head { background-color: var(${commentColors_1.commentThreadStateBackgroundColorVar}) }`);
            const linkColor = theme.getColor(colorRegistry_1.textLinkForeground);
            if (linkColor) {
                content.push(`.review-widget .body .comment-body a { color: ${linkColor} }`);
            }
            const linkActiveColor = theme.getColor(colorRegistry_1.textLinkActiveForeground);
            if (linkActiveColor) {
                content.push(`.review-widget .body .comment-body a:hover, a:active { color: ${linkActiveColor} }`);
            }
            const focusColor = theme.getColor(colorRegistry_1.focusBorder);
            if (focusColor) {
                content.push(`.review-widget .body .comment-body a:focus { outline: 1px solid ${focusColor}; }`);
                content.push(`.review-widget .body .monaco-editor.focused { outline: 1px solid ${focusColor}; }`);
            }
            const blockQuoteBackground = theme.getColor(colorRegistry_1.textBlockQuoteBackground);
            if (blockQuoteBackground) {
                content.push(`.review-widget .body .review-comment blockquote { background: ${blockQuoteBackground}; }`);
            }
            const blockQuoteBOrder = theme.getColor(colorRegistry_1.textBlockQuoteBorder);
            if (blockQuoteBOrder) {
                content.push(`.review-widget .body .review-comment blockquote { border-color: ${blockQuoteBOrder}; }`);
            }
            const border = theme.getColor(theme_1.PANEL_BORDER);
            if (border) {
                content.push(`.review-widget .body .review-comment .review-comment-contents .comment-reactions .action-item a.action-label { border-color: ${border}; }`);
            }
            const hcBorder = theme.getColor(colorRegistry_1.contrastBorder);
            if (hcBorder) {
                content.push(`.review-widget .body .comment-form .review-thread-reply-button { outline-color: ${hcBorder}; }`);
                content.push(`.review-widget .body .monaco-editor { outline: 1px solid ${hcBorder}; }`);
            }
            const errorBorder = theme.getColor(colorRegistry_1.inputValidationErrorBorder);
            if (errorBorder) {
                content.push(`.review-widget .validation-error { border: 1px solid ${errorBorder}; }`);
            }
            const errorBackground = theme.getColor(colorRegistry_1.inputValidationErrorBackground);
            if (errorBackground) {
                content.push(`.review-widget .validation-error { background: ${errorBackground}; }`);
            }
            const errorForeground = theme.getColor(colorRegistry_1.inputValidationErrorForeground);
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
            this._styleElement.textContent = content.join('\n');
            this._commentReply?.setCommentEditorDecorations();
        }
    };
    exports.CommentThreadWidget = CommentThreadWidget;
    exports.CommentThreadWidget = CommentThreadWidget = __decorate([
        __param(11, commentService_1.ICommentService),
        __param(12, contextView_1.IContextMenuService),
        __param(13, configuration_1.IConfigurationService)
    ], CommentThreadWidget);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudFRocmVhZFdpZGdldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NvbW1lbnRzL2Jyb3dzZXIvY29tbWVudFRocmVhZFdpZGdldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUErQm5GLFFBQUEsNEJBQTRCLEdBQUcseUJBQXlCLENBQUM7SUFHL0QsSUFBTSxtQkFBbUIsR0FBekIsTUFBTSxtQkFBNEQsU0FBUSxzQkFBVTtRQWUxRixJQUFJLGFBQWE7WUFDaEIsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDO1FBQzVCLENBQUM7UUFFRCxZQUNVLFNBQXNCLEVBQ3ZCLE1BQWMsRUFDZCxrQkFBdUIsRUFDdkIsa0JBQXNDLEVBQ3RDLDJCQUFrRCxFQUNsRCxjQUEwQyxFQUMxQyxlQUFtQyxFQUNuQyxhQUFvRCxFQUNwRCxnQkFBMEMsRUFDMUMsZUFBcUQsRUFDckQsa0JBR1AsRUFDZ0IsY0FBdUMsRUFDbkMsa0JBQXVDLEVBQ3JDLG9CQUFtRDtZQUUxRSxLQUFLLEVBQUUsQ0FBQztZQWxCQyxjQUFTLEdBQVQsU0FBUyxDQUFhO1lBQ3ZCLFdBQU0sR0FBTixNQUFNLENBQVE7WUFDZCx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQUs7WUFDdkIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtZQUN0QyxnQ0FBMkIsR0FBM0IsMkJBQTJCLENBQXVCO1lBQ2xELG1CQUFjLEdBQWQsY0FBYyxDQUE0QjtZQUMxQyxvQkFBZSxHQUFmLGVBQWUsQ0FBb0I7WUFDbkMsa0JBQWEsR0FBYixhQUFhLENBQXVDO1lBQ3BELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBMEI7WUFDMUMsb0JBQWUsR0FBZixlQUFlLENBQXNDO1lBQ3JELHVCQUFrQixHQUFsQixrQkFBa0IsQ0FHekI7WUFDd0IsbUJBQWMsR0FBZCxjQUFjLENB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