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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/core/range", "vs/base/common/cancellation", "vs/workbench/contrib/comments/browser/commentMenus", "vs/workbench/services/layout/browser/layoutService", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/comments/common/commentsConfiguration", "vs/platform/contextkey/common/contextkey", "vs/platform/storage/common/storage", "vs/workbench/contrib/comments/common/commentContextKeys"], function (require, exports, instantiation_1, event_1, lifecycle_1, range_1, cancellation_1, commentMenus_1, layoutService_1, configuration_1, commentsConfiguration_1, contextkey_1, storage_1, commentContextKeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Jlb = exports.$Ilb = void 0;
    exports.$Ilb = (0, instantiation_1.$Bh)('commentService');
    const CONTINUE_ON_COMMENTS = 'comments.continueOnComments';
    let $Jlb = class $Jlb extends lifecycle_1.$kc {
        constructor(D, F, G, contextKeyService, H) {
            super();
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.a = this.B(new event_1.$fd());
            this.onDidSetDataProvider = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidDeleteDataProvider = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onDidSetResourceCommentInfos = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onDidSetAllCommentThreads = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onDidUpdateCommentThreads = this.g.event;
            this.h = this.B(new event_1.$fd());
            this.onDidUpdateNotebookCommentThreads = this.h.event;
            this.j = this.B(new event_1.$fd());
            this.onDidUpdateCommentingRanges = this.j.event;
            this.m = this.B(new event_1.$fd());
            this.onDidChangeActiveCommentThread = this.m.event;
            this.n = this.B(new event_1.$fd());
            this.onDidChangeCurrentCommentThread = this.n.event;
            this.r = this.B(new event_1.$fd());
            this.onDidChangeCommentingEnabled = this.r.event;
            this.s = this.B(new event_1.$fd());
            this.onDidChangeActiveCommentingRange = this.s.event;
            this.t = new Map();
            this.u = new Map();
            this.w = true;
            this.z = new Map(); // owner -> PendingCommentThread[]
            this.C = new Set();
            this.I();
            this.J();
            this.y = commentContextKeys_1.CommentContextKeys.WorkspaceHasCommenting.bindTo(contextKeyService);
            const storageListener = this.B(new lifecycle_1.$jc());
            storageListener.add(this.H.onDidChangeValue(1 /* StorageScope.WORKSPACE */, CONTINUE_ON_COMMENTS, storageListener)((v) => {
                if (!v.external) {
                    return;
                }
                const commentsToRestore = this.H.getObject(CONTINUE_ON_COMMENTS, 1 /* StorageScope.WORKSPACE */);
                if (!commentsToRestore) {
                    return;
                }
                const changedOwners = this.N(commentsToRestore);
                for (const owner of changedOwners) {
                    const evt = {
                        owner,
                        pending: this.z.get(owner) || [],
                        added: [],
                        removed: [],
                        changed: []
                    };
                    this.g.fire(evt);
                }
            }));
            this.B(H.onWillSaveState(() => {
                for (const provider of this.C) {
                    const pendingComments = provider.provideContinueOnComments();
                    this.N(pendingComments);
                }
                this.M();
            }));
        }
        I() {
            this.w = this.L;
            this.B(this.G.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('comments.visible')) {
                    this.enableCommenting(this.L);
                }
            }));
        }
        J() {
            let preZenModeValue = this.w;
            this.B(this.F.onDidChangeZenMode(e => {
                if (e) {
                    preZenModeValue = this.w;
                    this.enableCommenting(false);
                }
                else {
                    this.enableCommenting(preZenModeValue);
                }
            }));
        }
        get L() {
            return !!this.G.getValue(commentsConfiguration_1.$Hlb)?.visible;
        }
        get isCommentingEnabled() {
            return this.w;
        }
        enableCommenting(enable) {
            if (enable !== this.w) {
                this.w = enable;
                this.r.fire(enable);
            }
        }
        /**
         * The current comment thread is the thread that has focus or is being hovered.
         * @param commentThread
         */
        setCurrentCommentThread(commentThread) {
            this.n.fire(commentThread);
        }
        /**
         * The active comment thread is the the thread that is currently being edited.
         * @param commentThread
         */
        setActiveCommentThread(commentThread) {
            this.m.fire(commentThread);
        }
        setDocumentComments(resource, commentInfos) {
            if (commentInfos.length) {
                this.y.set(true);
            }
            this.c.fire({ resource, commentInfos });
        }
        setWorkspaceComments(owner, commentsByResource) {
            if (commentsByResource.length) {
                this.y.set(true);
            }
            this.f.fire({ ownerId: owner, commentThreads: commentsByResource });
        }
        removeWorkspaceComments(owner) {
            this.f.fire({ ownerId: owner, commentThreads: [] });
        }
        registerCommentController(owner, commentControl) {
            this.t.set(owner, commentControl);
            this.a.fire();
        }
        unregisterCommentController(owner) {
            if (owner) {
                this.t.delete(owner);
            }
            else {
                this.t.clear();
            }
            this.b.fire(owner);
        }
        getCommentController(owner) {
            return this.t.get(owner);
        }
        createCommentThreadTemplate(owner, resource, range) {
            const commentController = this.t.get(owner);
            if (!commentController) {
                return;
            }
            commentController.createCommentThreadTemplate(resource, range);
        }
        async updateCommentThreadTemplate(owner, threadHandle, range) {
            const commentController = this.t.get(owner);
            if (!commentController) {
                return;
            }
            await commentController.updateCommentThreadTemplate(threadHandle, range);
        }
        disposeCommentThread(owner, threadId) {
            const controller = this.getCommentController(owner);
            controller?.deleteCommentThreadMain(threadId);
        }
        getCommentMenus(owner) {
            if (this.u.get(owner)) {
                return this.u.get(owner);
            }
            const menu = this.D.createInstance(commentMenus_1.$Glb);
            this.u.set(owner, menu);
            return menu;
        }
        updateComments(ownerId, event) {
            const evt = Object.assign({}, event, { owner: ownerId });
            this.g.fire(evt);
        }
        updateNotebookComments(ownerId, event) {
            const evt = Object.assign({}, event, { owner: ownerId });
            this.h.fire(evt);
        }
        updateCommentingRanges(ownerId) {
            this.y.set(true);
            this.j.fire({ owner: ownerId });
        }
        async toggleReaction(owner, resource, thread, comment, reaction) {
            const commentController = this.t.get(owner);
            if (commentController) {
                return commentController.toggleReaction(resource, thread, comment, reaction, cancellation_1.CancellationToken.None);
            }
            else {
                throw new Error('Not supported');
            }
        }
        hasReactionHandler(owner) {
            const commentProvider = this.t.get(owner);
            if (commentProvider) {
                return !!commentProvider.features.reactionHandler;
            }
            return false;
        }
        async getDocumentComments(resource) {
            const commentControlResult = [];
            for (const control of this.t.values()) {
                commentControlResult.push(control.getDocumentComments(resource, cancellation_1.CancellationToken.None)
                    .then(documentComments => {
                    // Check that there aren't any continue on comments in the provided comments
                    // This can happen because continue on comments are stored separately from local un-submitted comments.
                    for (const documentCommentThread of documentComments.threads) {
                        if (documentCommentThread.comments?.length === 0 && documentCommentThread.range) {
                            this.removeContinueOnComment({ range: documentCommentThread.range, uri: resource, owner: documentComments.owner });
                        }
                    }
                    const pendingComments = this.z.get(documentComments.owner);
                    documentComments.pendingCommentThreads = pendingComments?.filter(pendingComment => pendingComment.uri.toString() === resource.toString());
                    return documentComments;
                })
                    .catch(_ => {
                    return null;
                }));
            }
            return Promise.all(commentControlResult);
        }
        async getNotebookComments(resource) {
            const commentControlResult = [];
            this.t.forEach(control => {
                commentControlResult.push(control.getNotebookComments(resource, cancellation_1.CancellationToken.None)
                    .catch(_ => {
                    return null;
                }));
            });
            return Promise.all(commentControlResult);
        }
        registerContinueOnCommentProvider(provider) {
            this.C.add(provider);
            return {
                dispose: () => {
                    this.C.delete(provider);
                }
            };
        }
        M() {
            const commentsToSave = [];
            for (const pendingComments of this.z.values()) {
                commentsToSave.push(...pendingComments);
            }
            this.H.store(CONTINUE_ON_COMMENTS, commentsToSave, 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
        }
        removeContinueOnComment(pendingComment) {
            const pendingComments = this.z.get(pendingComment.owner);
            if (pendingComments) {
                return pendingComments.splice(pendingComments.findIndex(comment => comment.uri.toString() === pendingComment.uri.toString() && range_1.$ks.equalsRange(comment.range, pendingComment.range)), 1)[0];
            }
            return undefined;
        }
        N(pendingComments) {
            const changedOwners = new Set();
            for (const pendingComment of pendingComments) {
                if (!this.z.has(pendingComment.owner)) {
                    this.z.set(pendingComment.owner, [pendingComment]);
                    changedOwners.add(pendingComment.owner);
                }
                else {
                    const commentsForOwner = this.z.get(pendingComment.owner);
                    if (commentsForOwner.every(comment => (comment.uri.toString() !== pendingComment.uri.toString()) || !range_1.$ks.equalsRange(comment.range, pendingComment.range) || (comment.body !== pendingComment.body))) {
                        commentsForOwner.push(pendingComment);
                        changedOwners.add(pendingComment.owner);
                    }
                }
            }
            return changedOwners;
        }
    };
    exports.$Jlb = $Jlb;
    exports.$Jlb = $Jlb = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, layoutService_1.$Meb),
        __param(2, configuration_1.$8h),
        __param(3, contextkey_1.$3i),
        __param(4, storage_1.$Vo)
    ], $Jlb);
});
//# sourceMappingURL=commentService.js.map