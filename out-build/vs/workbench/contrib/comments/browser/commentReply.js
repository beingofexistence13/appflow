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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/mouseCursor/mouseCursor", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/common/uuid", "vs/editor/common/languages/language", "vs/editor/common/services/model", "vs/nls!vs/workbench/contrib/comments/browser/commentReply", "vs/platform/configuration/common/configuration", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/contrib/comments/browser/commentFormActions", "vs/workbench/contrib/comments/browser/commentService", "vs/workbench/contrib/comments/common/commentContextKeys", "./simpleCommentEditor"], function (require, exports, dom, mouseCursor_1, lifecycle_1, uri_1, uuid_1, language_1, model_1, nls, configuration_1, colorRegistry_1, themeService_1, commentFormActions_1, commentService_1, commentContextKeys_1, simpleCommentEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$umb = exports.$tmb = void 0;
    const COMMENT_SCHEME = 'comment';
    let INMEM_MODEL_ID = 0;
    exports.$tmb = 'commenteditordecoration';
    let $umb = class $umb extends lifecycle_1.$kc {
        constructor(owner, container, m, n, r, s, t, u, w, y, z, C, D, F, configurationService) {
            super();
            this.owner = owner;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.f = [];
            this.form = dom.$0O(container, dom.$('.comment-form'));
            this.commentEditor = this.B(this.n.createInstance(simpleCommentEditor_1.$smb, this.form, simpleCommentEditor_1.$smb.getEditorOptions(configurationService), r, this.w));
            this.commentEditorIsEmpty = commentContextKeys_1.CommentContextKeys.commentIsEmpty.bindTo(this.r);
            this.commentEditorIsEmpty.set(!this.u);
            const hasExistingComments = this.m.comments && this.m.comments.length > 0;
            const modeId = (0, uuid_1.$4f)() + '-' + (hasExistingComments ? this.m.threadId : ++INMEM_MODEL_ID);
            const params = JSON.stringify({
                extensionId: this.m.extensionId,
                commentThreadId: this.m.threadId
            });
            let resource = uri_1.URI.parse(`${COMMENT_SCHEME}://${this.m.extensionId}/commentinput-${modeId}.md?${params}`); // TODO. Remove params once extensions adopt authority.
            const commentController = this.z.getCommentController(owner);
            if (commentController) {
                resource = resource.with({ authority: commentController.id });
            }
            const model = this.D.createModel(this.u || '', this.C.createByFilepathOrFirstLine(resource), resource, false);
            this.B(model);
            this.commentEditor.setModel(model);
            this.B((this.commentEditor.getModel().onDidChangeContent(() => {
                this.setCommentEditorDecorations();
                this.commentEditorIsEmpty?.set(!this.commentEditor.getValue());
            })));
            this.G(this.commentEditor, this.form);
            this.setCommentEditorDecorations();
            // Only add the additional step of clicking a reply button to expand the textarea when there are existing comments
            if (hasExistingComments) {
                this.O(this.commentEditor, this.form);
            }
            else if (this.m.comments && this.m.comments.length === 0) {
                this.L();
            }
            this.a = dom.$0O(this.form, dom.$('.validation-error.hidden'));
            const formActions = dom.$0O(this.form, dom.$('.form-actions'));
            this.b = dom.$0O(formActions, dom.$('.other-actions'));
            this.H(this.b, model);
            this.c = dom.$0O(formActions, dom.$('.editor-actions'));
            this.I(this.c, model);
        }
        updateCommentThread(commentThread) {
            const isReplying = this.commentEditor.hasTextFocus();
            if (!this.j) {
                this.O(this.commentEditor, this.form);
            }
            if (this.m.comments && this.m.comments.length === 0) {
                this.L();
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
            if (!this.m.comments || !this.m.comments.length) {
                this.commentEditor.focus();
            }
            else if (this.commentEditor.getModel().getValueLength() > 0) {
                this.L();
            }
        }
        focusCommentEditor() {
            this.commentEditor.focus();
        }
        expandReplyAreaAndFocusCommentEditor() {
            this.L();
            this.commentEditor.focus();
        }
        isCommentEditorFocused() {
            return this.commentEditor.hasWidgetFocus();
        }
        getCommentModel() {
            return this.commentEditor.getModel();
        }
        updateCanReply() {
            if (!this.m.canReply) {
                this.form.style.display = 'none';
            }
            else {
                this.form.style.display = 'block';
            }
        }
        async submitComment() {
            return this.g?.triggerDefaultAction();
        }
        setCommentEditorDecorations() {
            const model = this.commentEditor.getModel();
            if (model) {
                const valueLength = model.getValueLength();
                const hasExistingComments = this.m.comments && this.m.comments.length > 0;
                const placeholder = valueLength > 0
                    ? ''
                    : hasExistingComments
                        ? (this.t?.placeHolder || nls.localize(0, null))
                        : (this.t?.placeHolder || nls.localize(1, null));
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
                                color: `${(0, colorRegistry_1.$5y)(colorRegistry_1.$xw, this.F.getColorTheme())?.transparent(0.4)}`
                            }
                        }
                    }];
                this.commentEditor.setDecorationsByType('review-zone-widget', exports.$tmb, decorations);
            }
        }
        G(commentEditor, commentForm) {
            this.f.push(commentEditor.onDidFocusEditorWidget(() => {
                this.m.input = {
                    uri: commentEditor.getModel().uri,
                    value: commentEditor.getValue()
                };
                this.z.setActiveCommentThread(this.m);
            }));
            this.f.push(commentEditor.getModel().onDidChangeContent(() => {
                const modelContent = commentEditor.getValue();
                if (this.m.input && this.m.input.uri === commentEditor.getModel().uri && this.m.input.value !== modelContent) {
                    const newInput = this.m.input;
                    newInput.value = modelContent;
                    this.m.input = newInput;
                }
                this.z.setActiveCommentThread(this.m);
            }));
            this.f.push(this.m.onDidChangeInput(input => {
                const thread = this.m;
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
                        this.u = '';
                        commentForm.classList.remove('expand');
                        commentEditor.getDomNode().style.outline = '';
                        this.a.textContent = '';
                        this.a.classList.add('hidden');
                    }
                }
            }));
        }
        /**
         * Command based actions.
         */
        H(container, model) {
            const menu = this.s.getCommentThreadActions(this.r);
            this.B(menu);
            this.B(menu.onDidChange(() => {
                this.g.setActions(menu);
            }));
            this.g = new commentFormActions_1.$9lb(container, async (action) => {
                this.y?.();
                action.run({
                    thread: this.m,
                    text: this.commentEditor.getValue(),
                    $mid: 9 /* MarshalledId.CommentThreadReply */
                });
                this.N();
            });
            this.B(this.g);
            this.g.setActions(menu);
        }
        I(container, model) {
            const editorMenu = this.s.getCommentEditorActions(this.r);
            this.B(editorMenu);
            this.B(editorMenu.onDidChange(() => {
                this.h.setActions(editorMenu);
            }));
            this.h = new commentFormActions_1.$9lb(container, async (action) => {
                this.y?.();
                action.run({
                    thread: this.m,
                    text: this.commentEditor.getValue(),
                    $mid: 9 /* MarshalledId.CommentThreadReply */
                });
                this.focusCommentEditor();
            });
            this.B(this.h);
            this.h.setActions(editorMenu, true);
        }
        get J() {
            return this.form.classList.contains('expand');
        }
        L() {
            if (!this.J) {
                this.form.classList.add('expand');
                this.commentEditor.focus();
                this.commentEditor.layout();
            }
        }
        M() {
            if (!this.J) {
                this.commentEditor.setValue('');
                this.L();
            }
        }
        N() {
            this.commentEditor.getDomNode().style.outline = '';
            this.commentEditor.setValue('');
            this.u = '';
            this.form.classList.remove('expand');
            this.a.textContent = '';
            this.a.classList.add('hidden');
        }
        O(commentEditor, commentForm) {
            this.j = dom.$0O(commentForm, dom.$(`button.review-thread-reply-button.${mouseCursor_1.$WR}`));
            this.j.title = this.t?.prompt || nls.localize(2, null);
            this.j.textContent = this.t?.prompt || nls.localize(3, null);
            // bind click/escape actions for reviewThreadReplyButton and textArea
            this.B(dom.$nO(this.j, 'click', _ => this.M()));
            this.B(dom.$nO(this.j, 'focus', _ => this.M()));
            commentEditor.onDidBlurEditorWidget(() => {
                if (commentEditor.getModel().getValueLength() === 0 && commentForm.classList.contains('expand')) {
                    commentForm.classList.remove('expand');
                }
            });
        }
    };
    exports.$umb = $umb;
    exports.$umb = $umb = __decorate([
        __param(10, commentService_1.$Ilb),
        __param(11, language_1.$ct),
        __param(12, model_1.$yA),
        __param(13, themeService_1.$gv),
        __param(14, configuration_1.$8h)
    ], $umb);
});
//# sourceMappingURL=commentReply.js.map