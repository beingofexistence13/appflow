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
    exports.CommentService = exports.ICommentService = void 0;
    exports.ICommentService = (0, instantiation_1.createDecorator)('commentService');
    const CONTINUE_ON_COMMENTS = 'comments.continueOnComments';
    let CommentService = class CommentService extends lifecycle_1.Disposable {
        constructor(instantiationService, layoutService, configurationService, contextKeyService, storageService) {
            super();
            this.instantiationService = instantiationService;
            this.layoutService = layoutService;
            this.configurationService = configurationService;
            this.storageService = storageService;
            this._onDidSetDataProvider = this._register(new event_1.Emitter());
            this.onDidSetDataProvider = this._onDidSetDataProvider.event;
            this._onDidDeleteDataProvider = this._register(new event_1.Emitter());
            this.onDidDeleteDataProvider = this._onDidDeleteDataProvider.event;
            this._onDidSetResourceCommentInfos = this._register(new event_1.Emitter());
            this.onDidSetResourceCommentInfos = this._onDidSetResourceCommentInfos.event;
            this._onDidSetAllCommentThreads = this._register(new event_1.Emitter());
            this.onDidSetAllCommentThreads = this._onDidSetAllCommentThreads.event;
            this._onDidUpdateCommentThreads = this._register(new event_1.Emitter());
            this.onDidUpdateCommentThreads = this._onDidUpdateCommentThreads.event;
            this._onDidUpdateNotebookCommentThreads = this._register(new event_1.Emitter());
            this.onDidUpdateNotebookCommentThreads = this._onDidUpdateNotebookCommentThreads.event;
            this._onDidUpdateCommentingRanges = this._register(new event_1.Emitter());
            this.onDidUpdateCommentingRanges = this._onDidUpdateCommentingRanges.event;
            this._onDidChangeActiveCommentThread = this._register(new event_1.Emitter());
            this.onDidChangeActiveCommentThread = this._onDidChangeActiveCommentThread.event;
            this._onDidChangeCurrentCommentThread = this._register(new event_1.Emitter());
            this.onDidChangeCurrentCommentThread = this._onDidChangeCurrentCommentThread.event;
            this._onDidChangeCommentingEnabled = this._register(new event_1.Emitter());
            this.onDidChangeCommentingEnabled = this._onDidChangeCommentingEnabled.event;
            this._onDidChangeActiveCommentingRange = this._register(new event_1.Emitter());
            this.onDidChangeActiveCommentingRange = this._onDidChangeActiveCommentingRange.event;
            this._commentControls = new Map();
            this._commentMenus = new Map();
            this._isCommentingEnabled = true;
            this._continueOnComments = new Map(); // owner -> PendingCommentThread[]
            this._continueOnCommentProviders = new Set();
            this._handleConfiguration();
            this._handleZenMode();
            this._workspaceHasCommenting = commentContextKeys_1.CommentContextKeys.WorkspaceHasCommenting.bindTo(contextKeyService);
            const storageListener = this._register(new lifecycle_1.DisposableStore());
            storageListener.add(this.storageService.onDidChangeValue(1 /* StorageScope.WORKSPACE */, CONTINUE_ON_COMMENTS, storageListener)((v) => {
                if (!v.external) {
                    return;
                }
                const commentsToRestore = this.storageService.getObject(CONTINUE_ON_COMMENTS, 1 /* StorageScope.WORKSPACE */);
                if (!commentsToRestore) {
                    return;
                }
                const changedOwners = this._addContinueOnComments(commentsToRestore);
                for (const owner of changedOwners) {
                    const evt = {
                        owner,
                        pending: this._continueOnComments.get(owner) || [],
                        added: [],
                        removed: [],
                        changed: []
                    };
                    this._onDidUpdateCommentThreads.fire(evt);
                }
            }));
            this._register(storageService.onWillSaveState(() => {
                for (const provider of this._continueOnCommentProviders) {
                    const pendingComments = provider.provideContinueOnComments();
                    this._addContinueOnComments(pendingComments);
                }
                this._saveContinueOnComments();
            }));
        }
        _handleConfiguration() {
            this._isCommentingEnabled = this._defaultCommentingEnablement;
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('comments.visible')) {
                    this.enableCommenting(this._defaultCommentingEnablement);
                }
            }));
        }
        _handleZenMode() {
            let preZenModeValue = this._isCommentingEnabled;
            this._register(this.layoutService.onDidChangeZenMode(e => {
                if (e) {
                    preZenModeValue = this._isCommentingEnabled;
                    this.enableCommenting(false);
                }
                else {
                    this.enableCommenting(preZenModeValue);
                }
            }));
        }
        get _defaultCommentingEnablement() {
            return !!this.configurationService.getValue(commentsConfiguration_1.COMMENTS_SECTION)?.visible;
        }
        get isCommentingEnabled() {
            return this._isCommentingEnabled;
        }
        enableCommenting(enable) {
            if (enable !== this._isCommentingEnabled) {
                this._isCommentingEnabled = enable;
                this._onDidChangeCommentingEnabled.fire(enable);
            }
        }
        /**
         * The current comment thread is the thread that has focus or is being hovered.
         * @param commentThread
         */
        setCurrentCommentThread(commentThread) {
            this._onDidChangeCurrentCommentThread.fire(commentThread);
        }
        /**
         * The active comment thread is the the thread that is currently being edited.
         * @param commentThread
         */
        setActiveCommentThread(commentThread) {
            this._onDidChangeActiveCommentThread.fire(commentThread);
        }
        setDocumentComments(resource, commentInfos) {
            if (commentInfos.length) {
                this._workspaceHasCommenting.set(true);
            }
            this._onDidSetResourceCommentInfos.fire({ resource, commentInfos });
        }
        setWorkspaceComments(owner, commentsByResource) {
            if (commentsByResource.length) {
                this._workspaceHasCommenting.set(true);
            }
            this._onDidSetAllCommentThreads.fire({ ownerId: owner, commentThreads: commentsByResource });
        }
        removeWorkspaceComments(owner) {
            this._onDidSetAllCommentThreads.fire({ ownerId: owner, commentThreads: [] });
        }
        registerCommentController(owner, commentControl) {
            this._commentControls.set(owner, commentControl);
            this._onDidSetDataProvider.fire();
        }
        unregisterCommentController(owner) {
            if (owner) {
                this._commentControls.delete(owner);
            }
            else {
                this._commentControls.clear();
            }
            this._onDidDeleteDataProvider.fire(owner);
        }
        getCommentController(owner) {
            return this._commentControls.get(owner);
        }
        createCommentThreadTemplate(owner, resource, range) {
            const commentController = this._commentControls.get(owner);
            if (!commentController) {
                return;
            }
            commentController.createCommentThreadTemplate(resource, range);
        }
        async updateCommentThreadTemplate(owner, threadHandle, range) {
            const commentController = this._commentControls.get(owner);
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
            if (this._commentMenus.get(owner)) {
                return this._commentMenus.get(owner);
            }
            const menu = this.instantiationService.createInstance(commentMenus_1.CommentMenus);
            this._commentMenus.set(owner, menu);
            return menu;
        }
        updateComments(ownerId, event) {
            const evt = Object.assign({}, event, { owner: ownerId });
            this._onDidUpdateCommentThreads.fire(evt);
        }
        updateNotebookComments(ownerId, event) {
            const evt = Object.assign({}, event, { owner: ownerId });
            this._onDidUpdateNotebookCommentThreads.fire(evt);
        }
        updateCommentingRanges(ownerId) {
            this._workspaceHasCommenting.set(true);
            this._onDidUpdateCommentingRanges.fire({ owner: ownerId });
        }
        async toggleReaction(owner, resource, thread, comment, reaction) {
            const commentController = this._commentControls.get(owner);
            if (commentController) {
                return commentController.toggleReaction(resource, thread, comment, reaction, cancellation_1.CancellationToken.None);
            }
            else {
                throw new Error('Not supported');
            }
        }
        hasReactionHandler(owner) {
            const commentProvider = this._commentControls.get(owner);
            if (commentProvider) {
                return !!commentProvider.features.reactionHandler;
            }
            return false;
        }
        async getDocumentComments(resource) {
            const commentControlResult = [];
            for (const control of this._commentControls.values()) {
                commentControlResult.push(control.getDocumentComments(resource, cancellation_1.CancellationToken.None)
                    .then(documentComments => {
                    // Check that there aren't any continue on comments in the provided comments
                    // This can happen because continue on comments are stored separately from local un-submitted comments.
                    for (const documentCommentThread of documentComments.threads) {
                        if (documentCommentThread.comments?.length === 0 && documentCommentThread.range) {
                            this.removeContinueOnComment({ range: documentCommentThread.range, uri: resource, owner: documentComments.owner });
                        }
                    }
                    const pendingComments = this._continueOnComments.get(documentComments.owner);
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
            this._commentControls.forEach(control => {
                commentControlResult.push(control.getNotebookComments(resource, cancellation_1.CancellationToken.None)
                    .catch(_ => {
                    return null;
                }));
            });
            return Promise.all(commentControlResult);
        }
        registerContinueOnCommentProvider(provider) {
            this._continueOnCommentProviders.add(provider);
            return {
                dispose: () => {
                    this._continueOnCommentProviders.delete(provider);
                }
            };
        }
        _saveContinueOnComments() {
            const commentsToSave = [];
            for (const pendingComments of this._continueOnComments.values()) {
                commentsToSave.push(...pendingComments);
            }
            this.storageService.store(CONTINUE_ON_COMMENTS, commentsToSave, 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
        }
        removeContinueOnComment(pendingComment) {
            const pendingComments = this._continueOnComments.get(pendingComment.owner);
            if (pendingComments) {
                return pendingComments.splice(pendingComments.findIndex(comment => comment.uri.toString() === pendingComment.uri.toString() && range_1.Range.equalsRange(comment.range, pendingComment.range)), 1)[0];
            }
            return undefined;
        }
        _addContinueOnComments(pendingComments) {
            const changedOwners = new Set();
            for (const pendingComment of pendingComments) {
                if (!this._continueOnComments.has(pendingComment.owner)) {
                    this._continueOnComments.set(pendingComment.owner, [pendingComment]);
                    changedOwners.add(pendingComment.owner);
                }
                else {
                    const commentsForOwner = this._continueOnComments.get(pendingComment.owner);
                    if (commentsForOwner.every(comment => (comment.uri.toString() !== pendingComment.uri.toString()) || !range_1.Range.equalsRange(comment.range, pendingComment.range) || (comment.body !== pendingComment.body))) {
                        commentsForOwner.push(pendingComment);
                        changedOwners.add(pendingComment.owner);
                    }
                }
            }
            return changedOwners;
        }
    };
    exports.CommentService = CommentService;
    exports.CommentService = CommentService = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, layoutService_1.IWorkbenchLayoutService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, storage_1.IStorageService)
    ], CommentService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jb21tZW50cy9icm93c2VyL2NvbW1lbnRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW1CbkYsUUFBQSxlQUFlLEdBQUcsSUFBQSwrQkFBZSxFQUFrQixnQkFBZ0IsQ0FBQyxDQUFDO0lBdUZsRixNQUFNLG9CQUFvQixHQUFHLDZCQUE2QixDQUFDO0lBRXBELElBQU0sY0FBYyxHQUFwQixNQUFNLGNBQWUsU0FBUSxzQkFBVTtRQWtEN0MsWUFDd0Isb0JBQThELEVBQzVELGFBQXVELEVBQ3pELG9CQUE0RCxFQUMvRCxpQkFBcUMsRUFDeEMsY0FBZ0Q7WUFFakUsS0FBSyxFQUFFLENBQUM7WUFOa0MseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUMzQyxrQkFBYSxHQUFiLGFBQWEsQ0FBeUI7WUFDeEMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUVqRCxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFwRGpELDBCQUFxQixHQUFrQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUNuRix5QkFBb0IsR0FBZ0IsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQztZQUU3RCw2QkFBd0IsR0FBZ0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBc0IsQ0FBQyxDQUFDO1lBQ2xILDRCQUF1QixHQUE4QixJQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxDQUFDO1lBRWpGLGtDQUE2QixHQUF5QyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUErQixDQUFDLENBQUM7WUFDekksaUNBQTRCLEdBQXVDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxLQUFLLENBQUM7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