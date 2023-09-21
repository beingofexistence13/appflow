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
define(["require", "exports", "vs/base/browser/dom", "vs/nls", "vs/base/common/lifecycle", "vs/editor/common/languages", "vs/base/common/event", "vs/workbench/contrib/comments/browser/commentService", "vs/base/browser/keyboardEvent", "vs/workbench/contrib/comments/browser/commentNode", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/platform/opener/common/opener", "vs/editor/common/languages/language"], function (require, exports, dom, nls, lifecycle_1, languages, event_1, commentService_1, keyboardEvent_1, commentNode_1, markdownRenderer_1, opener_1, language_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CommentThreadBody = void 0;
    let CommentThreadBody = class CommentThreadBody extends lifecycle_1.Disposable {
        get length() {
            return this._commentThread.comments ? this._commentThread.comments.length : 0;
        }
        get activeComment() {
            return this._commentElements.filter(node => node.isEditing)[0];
        }
        constructor(owner, parentResourceUri, container, _options, _commentThread, _pendingEdits, _scopedInstatiationService, _parentCommentThreadWidget, commentService, openerService, languageService) {
            super();
            this.owner = owner;
            this.parentResourceUri = parentResourceUri;
            this.container = container;
            this._options = _options;
            this._commentThread = _commentThread;
            this._pendingEdits = _pendingEdits;
            this._scopedInstatiationService = _scopedInstatiationService;
            this._parentCommentThreadWidget = _parentCommentThreadWidget;
            this.commentService = commentService;
            this.openerService = openerService;
            this.languageService = languageService;
            this._commentElements = [];
            this._focusedComment = undefined;
            this._onDidResize = new event_1.Emitter();
            this.onDidResize = this._onDidResize.event;
            this._commentDisposable = new Map();
            this._register(dom.addDisposableListener(container, dom.EventType.FOCUS_IN, e => {
                // TODO @rebornix, limit T to IRange | ICellRange
                this.commentService.setActiveCommentThread(this._commentThread);
            }));
            this._markdownRenderer = this._register(new markdownRenderer_1.MarkdownRenderer(this._options, this.languageService, this.openerService));
        }
        focus() {
            this._commentsElement.focus();
        }
        display() {
            this._commentsElement = dom.append(this.container, dom.$('div.comments-container'));
            this._commentsElement.setAttribute('role', 'presentation');
            this._commentsElement.tabIndex = 0;
            this._updateAriaLabel();
            this._register(dom.addDisposableListener(this._commentsElement, dom.EventType.KEY_DOWN, (e) => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.equals(16 /* KeyCode.UpArrow */) || event.equals(18 /* KeyCode.DownArrow */)) {
                    const moveFocusWithinBounds = (change) => {
                        if (this._focusedComment === undefined && change >= 0) {
                            return 0;
                        }
                        if (this._focusedComment === undefined && change < 0) {
                            return this._commentElements.length - 1;
                        }
                        const newIndex = this._focusedComment + change;
                        return Math.min(Math.max(0, newIndex), this._commentElements.length - 1);
                    };
                    this._setFocusedComment(event.equals(16 /* KeyCode.UpArrow */) ? moveFocusWithinBounds(-1) : moveFocusWithinBounds(1));
                }
            }));
            this._commentElements = [];
            if (this._commentThread.comments) {
                for (const comment of this._commentThread.comments) {
                    const newCommentNode = this.createNewCommentNode(comment);
                    this._commentElements.push(newCommentNode);
                    this._commentsElement.appendChild(newCommentNode.domNode);
                    if (comment.mode === languages.CommentMode.Editing) {
                        newCommentNode.switchToEditMode();
                    }
                }
            }
            this._resizeObserver = new MutationObserver(this._refresh.bind(this));
            this._resizeObserver.observe(this.container, {
                attributes: true,
                childList: true,
                characterData: true,
                subtree: true
            });
        }
        _refresh() {
            const dimensions = dom.getClientArea(this.container);
            this._onDidResize.fire(dimensions);
        }
        getDimensions() {
            return dom.getClientArea(this.container);
        }
        layout() {
            this._commentElements.forEach(element => {
                element.layout();
            });
        }
        getPendingEdits() {
            const pendingEdits = {};
            this._commentElements.forEach(element => {
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
            const matchedNode = this._commentElements.filter(commentNode => commentNode.comment.uniqueIdInThread === commentUniqueId);
            if (matchedNode && matchedNode.length) {
                const commentThreadCoords = dom.getDomNodePagePosition(this._commentElements[0].domNode);
                const commentCoords = dom.getDomNodePagePosition(matchedNode[0].domNode);
                return {
                    thread: commentThreadCoords,
                    comment: commentCoords
                };
            }
            return;
        }
        updateCommentThread(commentThread) {
            const oldCommentsLen = this._commentElements.length;
            const newCommentsLen = commentThread.comments ? commentThread.comments.length : 0;
            const commentElementsToDel = [];
            const commentElementsToDelIndex = [];
            for (let i = 0; i < oldCommentsLen; i++) {
                const comment = this._commentElements[i].comment;
                const newComment = commentThread.comments ? commentThread.comments.filter(c => c.uniqueIdInThread === comment.uniqueIdInThread) : [];
                if (newComment.length) {
                    this._commentElements[i].update(newComment[0]);
                }
                else {
                    commentElementsToDelIndex.push(i);
                    commentElementsToDel.push(this._commentElements[i]);
                }
            }
            // del removed elements
            for (let i = commentElementsToDel.length - 1; i >= 0; i--) {
                const commentToDelete = commentElementsToDel[i];
                this._commentDisposable.get(commentToDelete)?.dispose();
                this._commentDisposable.delete(commentToDelete);
                this._commentElements.splice(commentElementsToDelIndex[i], 1);
                this._commentsElement.removeChild(commentToDelete.domNode);
            }
            let lastCommentElement = null;
            const newCommentNodeList = [];
            const newCommentsInEditMode = [];
            for (let i = newCommentsLen - 1; i >= 0; i--) {
                const currentComment = commentThread.comments[i];
                const oldCommentNode = this._commentElements.filter(commentNode => commentNode.comment.uniqueIdInThread === currentComment.uniqueIdInThread);
                if (oldCommentNode.length) {
                    lastCommentElement = oldCommentNode[0].domNode;
                    newCommentNodeList.unshift(oldCommentNode[0]);
                }
                else {
                    const newElement = this.createNewCommentNode(currentComment);
                    newCommentNodeList.unshift(newElement);
                    if (lastCommentElement) {
                        this._commentsElement.insertBefore(newElement.domNode, lastCommentElement);
                        lastCommentElement = newElement.domNode;
                    }
                    else {
                        this._commentsElement.appendChild(newElement.domNode);
                        lastCommentElement = newElement.domNode;
                    }
                    if (currentComment.mode === languages.CommentMode.Editing) {
                        newElement.switchToEditMode();
                        newCommentsInEditMode.push(newElement);
                    }
                }
            }
            this._commentThread = commentThread;
            this._commentElements = newCommentNodeList;
            if (newCommentsInEditMode.length) {
                const lastIndex = this._commentElements.indexOf(newCommentsInEditMode[newCommentsInEditMode.length - 1]);
                this._focusedComment = lastIndex;
            }
            this._updateAriaLabel();
            this._setFocusedComment(this._focusedComment);
        }
        _updateAriaLabel() {
            if (this._commentThread.isDocumentCommentThread()) {
                if (this._commentThread.range) {
                    this._commentsElement.ariaLabel = nls.localize('commentThreadAria.withRange', "Comment thread with {0} comments on lines {1} through {2}. {3}.", this._commentThread.comments?.length, this._commentThread.range.startLineNumber, this._commentThread.range.endLineNumber, this._commentThread.label);
                }
                else {
                    this._commentsElement.ariaLabel = nls.localize('commentThreadAria.document', "Comment thread with {0} comments on the entire document. {1}.", this._commentThread.comments?.length, this._commentThread.label);
                }
            }
            else {
                this._commentsElement.ariaLabel = nls.localize('commentThreadAria', "Comment thread with {0} comments. {1}.", this._commentThread.comments?.length, this._commentThread.label);
            }
        }
        _setFocusedComment(value) {
            if (this._focusedComment !== undefined) {
                this._commentElements[this._focusedComment]?.setFocus(false);
            }
            if (this._commentElements.length === 0 || value === undefined) {
                this._focusedComment = undefined;
            }
            else {
                this._focusedComment = Math.min(value, this._commentElements.length - 1);
                this._commentElements[this._focusedComment].setFocus(true);
            }
        }
        createNewCommentNode(comment) {
            const newCommentNode = this._scopedInstatiationService.createInstance(commentNode_1.CommentNode, this._commentThread, comment, this._pendingEdits ? this._pendingEdits[comment.uniqueIdInThread] : undefined, this.owner, this.parentResourceUri, this._parentCommentThreadWidget, this._markdownRenderer);
            this._register(newCommentNode);
            this._commentDisposable.set(newCommentNode, newCommentNode.onDidClick(clickedNode => this._setFocusedComment(this._commentElements.findIndex(commentNode => commentNode.comment.uniqueIdInThread === clickedNode.comment.uniqueIdInThread))));
            return newCommentNode;
        }
        dispose() {
            super.dispose();
            if (this._resizeObserver) {
                this._resizeObserver.disconnect();
                this._resizeObserver = null;
            }
            this._commentDisposable.forEach(v => v.dispose());
        }
    };
    exports.CommentThreadBody = CommentThreadBody;
    exports.CommentThreadBody = CommentThreadBody = __decorate([
        __param(8, commentService_1.ICommentService),
        __param(9, opener_1.IOpenerService),
        __param(10, language_1.ILanguageService)
    ], CommentThreadBody);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudFRocmVhZEJvZHkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jb21tZW50cy9icm93c2VyL2NvbW1lbnRUaHJlYWRCb2R5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW9CekYsSUFBTSxpQkFBaUIsR0FBdkIsTUFBTSxpQkFBMEQsU0FBUSxzQkFBVTtRQVd4RixJQUFJLE1BQU07WUFDVCxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvRSxDQUFDO1FBRUQsSUFBSSxhQUFhO1lBQ2hCLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoRSxDQUFDO1FBR0QsWUFDVSxLQUFhLEVBQ2IsaUJBQXNCLEVBQ3RCLFNBQXNCLEVBQ3ZCLFFBQWtDLEVBQ2xDLGNBQTBDLEVBQzFDLGFBQW9ELEVBQ3BELDBCQUFpRCxFQUNqRCwwQkFBZ0QsRUFDdkMsY0FBdUMsRUFDeEMsYUFBcUMsRUFDbkMsZUFBeUM7WUFFM0QsS0FBSyxFQUFFLENBQUM7WUFaQyxVQUFLLEdBQUwsS0FBSyxDQUFRO1lBQ2Isc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFLO1lBQ3RCLGNBQVMsR0FBVCxTQUFTLENBQWE7WUFDdkIsYUFBUSxHQUFSLFFBQVEsQ0FBMEI7WUFDbEMsbUJBQWMsR0FBZCxjQUFjLENBQTRCO1lBQzFDLGtCQUFhLEdBQWIsYUFBYSxDQUF1QztZQUNwRCwrQkFBMEIsR0FBMUIsMEJBQTBCLENBQXVCO1lBQ2pELCtCQUEwQixHQUExQiww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