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
define(["require", "exports", "vs/base/browser/dom", "vs/nls!vs/workbench/contrib/comments/browser/commentThreadBody", "vs/base/common/lifecycle", "vs/editor/common/languages", "vs/base/common/event", "vs/workbench/contrib/comments/browser/commentService", "vs/base/browser/keyboardEvent", "vs/workbench/contrib/comments/browser/commentNode", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/platform/opener/common/opener", "vs/editor/common/languages/language"], function (require, exports, dom, nls, lifecycle_1, languages, event_1, commentService_1, keyboardEvent_1, commentNode_1, markdownRenderer_1, opener_1, language_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$zmb = void 0;
    let $zmb = class $zmb extends lifecycle_1.$kc {
        get length() {
            return this.r.comments ? this.r.comments.length : 0;
        }
        get activeComment() {
            return this.b.filter(node => node.isEditing)[0];
        }
        constructor(owner, parentResourceUri, container, n, r, s, t, u, w, y, z) {
            super();
            this.owner = owner;
            this.parentResourceUri = parentResourceUri;
            this.container = container;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.b = [];
            this.g = undefined;
            this.h = new event_1.$fd();
            this.onDidResize = this.h.event;
            this.j = new Map();
            this.B(dom.$nO(container, dom.$3O.FOCUS_IN, e => {
                // TODO @rebornix, limit T to IRange | ICellRange
                this.w.setActiveCommentThread(this.r);
            }));
            this.m = this.B(new markdownRenderer_1.$K2(this.n, this.z, this.y));
        }
        focus() {
            this.a.focus();
        }
        display() {
            this.a = dom.$0O(this.container, dom.$('div.comments-container'));
            this.a.setAttribute('role', 'presentation');
            this.a.tabIndex = 0;
            this.D();
            this.B(dom.$nO(this.a, dom.$3O.KEY_DOWN, (e) => {
                const event = new keyboardEvent_1.$jO(e);
                if (event.equals(16 /* KeyCode.UpArrow */) || event.equals(18 /* KeyCode.DownArrow */)) {
                    const moveFocusWithinBounds = (change) => {
                        if (this.g === undefined && change >= 0) {
                            return 0;
                        }
                        if (this.g === undefined && change < 0) {
                            return this.b.length - 1;
                        }
                        const newIndex = this.g + change;
                        return Math.min(Math.max(0, newIndex), this.b.length - 1);
                    };
                    this.F(event.equals(16 /* KeyCode.UpArrow */) ? moveFocusWithinBounds(-1) : moveFocusWithinBounds(1));
                }
            }));
            this.b = [];
            if (this.r.comments) {
                for (const comment of this.r.comments) {
                    const newCommentNode = this.G(comment);
                    this.b.push(newCommentNode);
                    this.a.appendChild(newCommentNode.domNode);
                    if (comment.mode === languages.CommentMode.Editing) {
                        newCommentNode.switchToEditMode();
                    }
                }
            }
            this.f = new MutationObserver(this.C.bind(this));
            this.f.observe(this.container, {
                attributes: true,
                childList: true,
                characterData: true,
                subtree: true
            });
        }
        C() {
            const dimensions = dom.$AO(this.container);
            this.h.fire(dimensions);
        }
        getDimensions() {
            return dom.$AO(this.container);
        }
        layout() {
            this.b.forEach(element => {
                element.layout();
            });
        }
        getPendingEdits() {
            const pendingEdits = {};
            this.b.forEach(element => {
                if (element.isEditing) {
                    const pendingEdit = element.getPendingEdit();
                    if (pendingEdit) {
                        pendingEdits[element.comment.uniqueIdInThread] = pendingEdit;
                    }
                }
            });
            return pendingEdits;
        }
        getCommentCoords(commentUniqueId) {
            const matchedNode = this.b.filter(commentNode => commentNode.comment.uniqueIdInThread === commentUniqueId);
            if (matchedNode && matchedNode.length) {
                const commentThreadCoords = dom.$FO(this.b[0].domNode);
                const commentCoords = dom.$FO(matchedNode[0].domNode);
                return {
                    thread: commentThreadCoords,
                    comment: commentCoords
                };
            }
            return;
        }
        updateCommentThread(commentThread) {
            const oldCommentsLen = this.b.length;
            const newCommentsLen = commentThread.comments ? commentThread.comments.length : 0;
            const commentElementsToDel = [];
            const commentElementsToDelIndex = [];
            for (let i = 0; i < oldCommentsLen; i++) {
                const comment = this.b[i].comment;
                const newComment = commentThread.comments ? commentThread.comments.filter(c => c.uniqueIdInThread === comment.uniqueIdInThread) : [];
                if (newComment.length) {
                    this.b[i].update(newComment[0]);
                }
                else {
                    commentElementsToDelIndex.push(i);
                    commentElementsToDel.push(this.b[i]);
                }
            }
            // del removed elements
            for (let i = commentElementsToDel.length - 1; i >= 0; i--) {
                const commentToDelete = commentElementsToDel[i];
                this.j.get(commentToDelete)?.dispose();
                this.j.delete(commentToDelete);
                this.b.splice(commentElementsToDelIndex[i], 1);
                this.a.removeChild(commentToDelete.domNode);
            }
            let lastCommentElement = null;
            const newCommentNodeList = [];
            const newCommentsInEditMode = [];
            for (let i = newCommentsLen - 1; i >= 0; i--) {
                const currentComment = commentThread.comments[i];
                const oldCommentNode = this.b.filter(commentNode => commentNode.comment.uniqueIdInThread === currentComment.uniqueIdInThread);
                if (oldCommentNode.length) {
                    lastCommentElement = oldCommentNode[0].domNode;
                    newCommentNodeList.unshift(oldCommentNode[0]);
                }
                else {
                    const newElement = this.G(currentComment);
                    newCommentNodeList.unshift(newElement);
                    if (lastCommentElement) {
                        this.a.insertBefore(newElement.domNode, lastCommentElement);
                        lastCommentElement = newElement.domNode;
                    }
                    else {
                        this.a.appendChild(newElement.domNode);
                        lastCommentElement = newElement.domNode;
                    }
                    if (currentComment.mode === languages.CommentMode.Editing) {
                        newElement.switchToEditMode();
                        newCommentsInEditMode.push(newElement);
                    }
                }
            }
            this.r = commentThread;
            this.b = newCommentNodeList;
            if (newCommentsInEditMode.length) {
                const lastIndex = this.b.indexOf(newCommentsInEditMode[newCommentsInEditMode.length - 1]);
                this.g = lastIndex;
            }
            this.D();
            this.F(this.g);
        }
        D() {
            if (this.r.isDocumentCommentThread()) {
                if (this.r.range) {
                    this.a.ariaLabel = nls.localize(0, null, this.r.comments?.length, this.r.range.startLineNumber, this.r.range.endLineNumber, this.r.label);
                }
                else {
                    this.a.ariaLabel = nls.localize(1, null, this.r.comments?.length, this.r.label);
                }
            }
            else {
                this.a.ariaLabel = nls.localize(2, null, this.r.comments?.length, this.r.label);
            }
        }
        F(value) {
            if (this.g !== undefined) {
                this.b[this.g]?.setFocus(false);
            }
            if (this.b.length === 0 || value === undefined) {
                this.g = undefined;
            }
            else {
                this.g = Math.min(value, this.b.length - 1);
                this.b[this.g].setFocus(true);
            }
        }
        G(comment) {
            const newCommentNode = this.t.createInstance(commentNode_1.$ymb, this.r, comment, this.s ? this.s[comment.uniqueIdInThread] : undefined, this.owner, this.parentResourceUri, this.u, this.m);
            this.B(newCommentNode);
            this.j.set(newCommentNode, newCommentNode.onDidClick(clickedNode => this.F(this.b.findIndex(commentNode => commentNode.comment.uniqueIdInThread === clickedNode.comment.uniqueIdInThread))));
            return newCommentNode;
        }
        dispose() {
            super.dispose();
            if (this.f) {
                this.f.disconnect();
                this.f = null;
            }
            this.j.forEach(v => v.dispose());
        }
    };
    exports.$zmb = $zmb;
    exports.$zmb = $zmb = __decorate([
        __param(8, commentService_1.$Ilb),
        __param(9, opener_1.$NT),
        __param(10, language_1.$ct)
    ], $zmb);
});
//# sourceMappingURL=commentThreadBody.js.map