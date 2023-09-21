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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/mouseCursor/mouseCursor", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/common/uuid", "vs/editor/common/languages/language", "vs/editor/common/services/model", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/contrib/comments/browser/commentFormActions", "vs/workbench/contrib/comments/browser/commentService", "vs/workbench/contrib/comments/common/commentContextKeys", "./simpleCommentEditor"], function (require, exports, dom, mouseCursor_1, lifecycle_1, uri_1, uuid_1, language_1, model_1, nls, configuration_1, colorRegistry_1, themeService_1, commentFormActions_1, commentService_1, commentContextKeys_1, simpleCommentEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CommentReply = exports.COMMENTEDITOR_DECORATION_KEY = void 0;
    const COMMENT_SCHEME = 'comment';
    let INMEM_MODEL_ID = 0;
    exports.COMMENTEDITOR_DECORATION_KEY = 'commenteditordecoration';
    let CommentReply = class CommentReply extends lifecycle_1.Disposable {
        constructor(owner, container, _commentThread, _scopedInstatiationService, _contextKeyService, _commentMenus, _commentOptions, _pendingComment, _parentThread, _actionRunDelegate, commentService, languageService, modelService, themeService, configurationService) {
            super();
            this.owner = owner;
            this._commentThread = _commentThread;
            this._scopedInstatiationService = _scopedInstatiationService;
            this._contextKeyService = _contextKeyService;
            this._commentMenus = _commentMenus;
            this._commentOptions = _commentOptions;
            this._pendingComment = _pendingComment;
            this._parentThread = _parentThread;
            this._actionRunDelegate = _actionRunDelegate;
            this.commentService = commentService;
            this.languageService = languageService;
            this.modelService = modelService;
            this.themeService = themeService;
            this._commentThreadDisposables = [];
            this.form = dom.append(container, dom.$('.comment-form'));
            this.commentEditor = this._register(this._scopedInstatiationService.createInstance(simpleCommentEditor_1.SimpleCommentEditor, this.form, simpleCommentEditor_1.SimpleCommentEditor.getEditorOptions(configurationService), _contextKeyService, this._parentThread));
            this.commentEditorIsEmpty = commentContextKeys_1.CommentContextKeys.commentIsEmpty.bindTo(this._contextKeyService);
            this.commentEditorIsEmpty.set(!this._pendingComment);
            const hasExistingComments = this._commentThread.comments && this._commentThread.comments.length > 0;
            const modeId = (0, uuid_1.generateUuid)() + '-' + (hasExistingComments ? this._commentThread.threadId : ++INMEM_MODEL_ID);
            const params = JSON.stringify({
                extensionId: this._commentThread.extensionId,
                commentThreadId: this._commentThread.threadId
            });
            let resource = uri_1.URI.parse(`${COMMENT_SCHEME}://${this._commentThread.extensionId}/commentinput-${modeId}.md?${params}`); // TODO. Remove params once extensions adopt authority.
            const commentController = this.commentService.getCommentController(owner);
            if (commentController) {
                resource = resource.with({ authority: commentController.id });
            }
            const model = this.modelService.createModel(this._pendingComment || '', this.languageService.createByFilepathOrFirstLine(resource), resource, false);
            this._register(model);
            this.commentEditor.setModel(model);
            this._register((this.commentEditor.getModel().onDidChangeContent(() => {
                this.setCommentEditorDecorations();
                this.commentEditorIsEmpty?.set(!this.commentEditor.getValue());
            })));
            this.createTextModelListener(this.commentEditor, this.form);
            this.setCommentEditorDecorations();
            // Only add the additional step of clicking a reply button to expand the textarea when there are existing comments
            if (hasExistingComments) {
                this.createReplyButton(this.commentEditor, this.form);
            }
            else if (this._commentThread.comments && this._commentThread.comments.length === 0) {
                this.expandReplyArea();
            }
            this._error = dom.append(this.form, dom.$('.validation-error.hidden'));
            const formActions = dom.append(this.form, dom.$('.form-actions'));
            this._formActions = dom.append(formActions, dom.$('.other-actions'));
            this.createCommentWidgetFormActions(this._formActions, model);
            this._editorActions = dom.append(formActions, dom.$('.editor-actions'));
            this.createCommentWidgetEditorActions(this._editorActions, model);
        }
        updateCommentThread(commentThread) {
            const isReplying = this.commentEditor.hasTextFocus();
            if (!this._reviewThreadReplyButton) {
                this.createReplyButton(this.commentEditor, this.form);
            }
            if (this._commentThread.comments && this._commentThread.comments.length === 0) {
                this.expandReplyArea();
            }
            if (isReplying) {
                this.commentEditor.focus();
            }
        }
        getPendingComment() {
            const model = this.commentEditor.getModel();
            if (model && model.getValueLength() > 0) { // checking length is cheap
                return model.getValue();
            }
            return undefined;
        }
        layout(widthInPixel) {
            this.commentEditor.layout({ height: 5 * 18, width: widthInPixel - 54 /* margin 20px * 10 + scrollbar 14px*/ });
        }
        focusIfNeeded() {
            if (!this._commentThread.comments || !this._commentThread.comments.length) {
                this.commentEditor.focus();
            }
            else if (this.commentEditor.getModel().getValueLength() > 0) {
                this.expandReplyArea();
            }
        }
        focusCommentEditor() {
            this.commentEditor.focus();
        }
        expandReplyAreaAndFocusCommentEditor() {
            this.expandReplyArea();
            this.commentEditor.focus();
        }
        isCommentEditorFocused() {
            return this.commentEditor.hasWidgetFocus();
        }
        getCommentModel() {
            return this.commentEditor.getModel();
        }
        updateCanReply() {
            if (!this._commentThread.canReply) {
                this.form.style.display = 'none';
            }
            else {
                this.form.style.display = 'block';
            }
        }
        async submitComment() {
            return this._commentFormActions?.triggerDefaultAction();
        }
        setCommentEditorDecorations() {
            const model = this.commentEditor.getModel();
            if (model) {
                const valueLength = model.getValueLength();
                const hasExistingComments = this._commentThread.comments && this._commentThread.comments.length > 0;
                const placeholder = valueLength > 0
                    ? ''
                    : hasExistingComments
                        ? (this._commentOptions?.placeHolder || nls.localize('reply', "Reply..."))
                        : (this._commentOptions?.placeHolder || nls.localize('newComment', "Type a new comment"));
                const decorations = [{
                        range: {
                            startLineNumber: 0,
                            endLineNumber: 0,
                            startColumn: 0,
                            endColumn: 1
                        },
                        renderOptions: {
                            after: {
                                contentText: placeholder,
                                color: `${(0, colorRegistry_1.resolveColorValue)(colorRegistry_1.editorForeground, this.themeService.getColorTheme())?.transparent(0.4)}`
                            }
                        }
                    }];
                this.commentEditor.setDecorationsByType('review-zone-widget', exports.COMMENTEDITOR_DECORATION_KEY, decorations);
            }
        }
        createTextModelListener(commentEditor, commentForm) {
            this._commentThreadDisposables.push(commentEditor.onDidFocusEditorWidget(() => {
                this._commentThread.input = {
                    uri: commentEditor.getModel().uri,
                    value: commentEditor.getValue()
                };
                this.commentService.setActiveCommentThread(this._commentThread);
            }));
            this._commentThreadDisposables.push(commentEditor.getModel().onDidChangeContent(() => {
                const modelContent = commentEditor.getValue();
                if (this._commentThread.input && this._commentThread.input.uri === commentEditor.getModel().uri && this._commentThread.input.value !== modelContent) {
                    const newInput = this._commentThread.input;
                    newInput.value = modelContent;
                    this._commentThread.input = newInput;
                }
                this.commentService.setActiveCommentThread(this._commentThread);
            }));
            this._commentThreadDisposables.push(this._commentThread.onDidChangeInput(input => {
                const thread = this._commentThread;
                const model = commentEditor.getModel();
                if (thread.input && model && (thread.input.uri !== model.uri)) {
                    return;
                }
                if (!input) {
                    return;
                }
                if (commentEditor.getValue() !== input.value) {
                    commentEditor.setValue(input.value);
                    if (input.value === '') {
                        this._pendingComment = '';
                        commentForm.classList.remove('expand');
                        commentEditor.getDomNode().style.outline = '';
                        this._error.textContent = '';
                        this._error.classList.add('hidden');
                    }
                }
            }));
        }
        /**
         * Command based actions.
         */
        createCommentWidgetFormActions(container, model) {
            const menu = this._commentMenus.getCommentThreadActions(this._contextKeyService);
            this._register(menu);
            this._register(menu.onDidChange(() => {
                this._commentFormActions.setActions(menu);
            }));
            this._commentFormActions = new commentFormActions_1.CommentFormActions(container, async (action) => {
                this._actionRunDelegate?.();
                action.run({
                    thread: this._commentThread,
                    text: this.commentEditor.getValue(),
                    $mid: 9 /* MarshalledId.CommentThreadReply */
                });
                this.hideReplyArea();
            });
            this._register(this._commentFormActions);
            this._commentFormActions.setActions(menu);
        }
        createCommentWidgetEditorActions(container, model) {
            const editorMenu = this._commentMenus.getCommentEditorActions(this._contextKeyService);
            this._register(editorMenu);
            this._register(editorMenu.onDidChange(() => {
                this._commentEditorActions.setActions(editorMenu);
            }));
            this._commentEditorActions = new commentFormActions_1.CommentFormActions(container, async (action) => {
                this._actionRunDelegate?.();
                action.run({
                    thread: this._commentThread,
                    text: this.commentEditor.getValue(),
                    $mid: 9 /* MarshalledId.CommentThreadReply */
                });
                this.focusCommentEditor();
            });
            this._register(this._commentEditorActions);
            this._commentEditorActions.setActions(editorMenu, true);
        }
        get isReplyExpanded() {
            return this.form.classList.contains('expand');
        }
        expandReplyArea() {
            if (!this.isReplyExpanded) {
                this.form.classList.add('expand');
                this.commentEditor.focus();
                this.commentEditor.layout();
            }
        }
        clearAndExpandReplyArea() {
            if (!this.isReplyExpanded) {
                this.commentEditor.setValue('');
                this.expandReplyArea();
            }
        }
        hideReplyArea() {
            this.commentEditor.getDomNode().style.outline = '';
            this.commentEditor.setValue('');
            this._pendingComment = '';
            this.form.classList.remove('expand');
            this._error.textContent = '';
            this._error.classList.add('hidden');
        }
        createReplyButton(commentEditor, commentForm) {
            this._reviewThreadReplyButton = dom.append(commentForm, dom.$(`button.review-thread-reply-button.${mouseCursor_1.MOUSE_CURSOR_TEXT_CSS_CLASS_NAME}`));
            this._reviewThreadReplyButton.title = this._commentOptions?.prompt || nls.localize('reply', "Reply...");
            this._reviewThreadReplyButton.textContent = this._commentOptions?.prompt || nls.localize('reply', "Reply...");
            // bind click/escape actions for reviewThreadReplyButton and textArea
            this._register(dom.addDisposableListener(this._reviewThreadReplyButton, 'click', _ => this.clearAndExpandReplyArea()));
            this._register(dom.addDisposableListener(this._reviewThreadReplyButton, 'focus', _ => this.clearAndExpandReplyArea()));
            commentEditor.onDidBlurEditorWidget(() => {
                if (commentEditor.getModel().getValueLength() === 0 && commentForm.classList.contains('expand')) {
                    commentForm.classList.remove('expand');
                }
            });
        }
    };
    exports.CommentReply = CommentReply;
    exports.CommentReply = CommentReply = __decorate([
        __param(10, commentService_1.ICommentService),
        __param(11, language_1.ILanguageService),
        __param(12, model_1.IModelService),
        __param(13, themeService_1.IThemeService),
        __param(14, configuration_1.IConfigurationService)
    ], CommentReply);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudFJlcGx5LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29tbWVudHMvYnJvd3Nlci9jb21tZW50UmVwbHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBNkJoRyxNQUFNLGNBQWMsR0FBRyxTQUFTLENBQUM7SUFDakMsSUFBSSxjQUFjLEdBQUcsQ0FBQyxDQUFDO0lBQ1YsUUFBQSw0QkFBNEIsR0FBRyx5QkFBeUIsQ0FBQztJQUUvRCxJQUFNLFlBQVksR0FBbEIsTUFBTSxZQUE0QyxTQUFRLHNCQUFVO1FBWTFFLFlBQ1UsS0FBYSxFQUN0QixTQUFzQixFQUNkLGNBQTBDLEVBQzFDLDBCQUFpRCxFQUNqRCxrQkFBc0MsRUFDdEMsYUFBMkIsRUFDM0IsZUFBcUQsRUFDckQsZUFBbUMsRUFDbkMsYUFBbUMsRUFDbkMsa0JBQXVDLEVBQzlCLGNBQXVDLEVBQ3RDLGVBQXlDLEVBQzVDLFlBQW1DLEVBQ25DLFlBQW1DLEVBQzNCLG9CQUEyQztZQUVsRSxLQUFLLEVBQUUsQ0FBQztZQWhCQyxVQUFLLEdBQUwsS0FBSyxDQUFRO1lBRWQsbUJBQWMsR0FBZCxjQUFjLENBQTRCO1lBQzFDLCtCQUEwQixHQUExQiwwQkFBMEIsQ0FBdUI7WUFDakQsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtZQUN0QyxrQkFBYSxHQUFiLGFBQWEsQ0FBYztZQUMzQixvQkFBZSxHQUFmLGVBQWUsQ0FBc0M7WUFDckQsb0JBQWUsR0FBZixlQUFlLENBQW9CO1lBQ25DLGtCQUFhLEdBQWIsYUFBYSxDQUFzQjtZQUNuQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQ3RCLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUM5QixvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFDcEMsaUJBQVksR0FBWixZQUFZLENBQWU7WUFDM0Is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