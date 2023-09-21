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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/editor/common/core/range", "vs/platform/registry/common/platform", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/contrib/comments/browser/commentService", "vs/workbench/contrib/comments/browser/commentsView", "../common/extHost.protocol", "vs/workbench/contrib/comments/browser/commentsTreeViewer", "vs/workbench/common/views", "vs/platform/instantiation/common/descriptors", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/nls", "vs/base/common/network"], function (require, exports, event_1, lifecycle_1, uri_1, range_1, platform_1, extHostCustomers_1, commentService_1, commentsView_1, extHost_protocol_1, commentsTreeViewer_1, views_1, descriptors_1, viewPaneContainer_1, codicons_1, iconRegistry_1, nls_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadComments = exports.MainThreadCommentController = exports.MainThreadCommentThread = void 0;
    class MainThreadCommentThread {
        get input() {
            return this._input;
        }
        set input(value) {
            this._input = value;
            this._onDidChangeInput.fire(value);
        }
        get onDidChangeInput() { return this._onDidChangeInput.event; }
        get label() {
            return this._label;
        }
        set label(label) {
            this._label = label;
            this._onDidChangeLabel.fire(this._label);
        }
        get contextValue() {
            return this._contextValue;
        }
        set contextValue(context) {
            this._contextValue = context;
        }
        get comments() {
            return this._comments;
        }
        set comments(newComments) {
            this._comments = newComments;
            this._onDidChangeComments.fire(this._comments);
        }
        get onDidChangeComments() { return this._onDidChangeComments.event; }
        set range(range) {
            this._range = range;
            this._onDidChangeRange.fire(this._range);
        }
        get range() {
            return this._range;
        }
        get onDidChangeCanReply() { return this._onDidChangeCanReply.event; }
        set canReply(state) {
            this._canReply = state;
            this._onDidChangeCanReply.fire(this._canReply);
        }
        get canReply() {
            return this._canReply;
        }
        get collapsibleState() {
            return this._collapsibleState;
        }
        set collapsibleState(newState) {
            this._collapsibleState = newState;
            this._onDidChangeCollapsibleState.fire(this._collapsibleState);
        }
        get initialCollapsibleState() {
            return this._initialCollapsibleState;
        }
        set initialCollapsibleState(initialCollapsibleState) {
            this._initialCollapsibleState = initialCollapsibleState;
            if (this.collapsibleState === undefined) {
                this.collapsibleState = this.initialCollapsibleState;
            }
            this._onDidChangeInitialCollapsibleState.fire(initialCollapsibleState);
        }
        get isDisposed() {
            return this._isDisposed;
        }
        isDocumentCommentThread() {
            return this._range === undefined || range_1.Range.isIRange(this._range);
        }
        get state() {
            return this._state;
        }
        set state(newState) {
            this._state = newState;
            this._onDidChangeState.fire(this._state);
        }
        get isTemplate() {
            return this._isTemplate;
        }
        constructor(commentThreadHandle, controllerHandle, extensionId, threadId, resource, _range, _canReply, _isTemplate) {
            this.commentThreadHandle = commentThreadHandle;
            this.controllerHandle = controllerHandle;
            this.extensionId = extensionId;
            this.threadId = threadId;
            this.resource = resource;
            this._range = _range;
            this._canReply = _canReply;
            this._isTemplate = _isTemplate;
            this._onDidChangeInput = new event_1.Emitter();
            this._onDidChangeLabel = new event_1.Emitter();
            this.onDidChangeLabel = this._onDidChangeLabel.event;
            this._onDidChangeComments = new event_1.Emitter();
            this._onDidChangeCanReply = new event_1.Emitter();
            this._onDidChangeRange = new event_1.Emitter();
            this.onDidChangeRange = this._onDidChangeRange.event;
            this._onDidChangeCollapsibleState = new event_1.Emitter();
            this.onDidChangeCollapsibleState = this._onDidChangeCollapsibleState.event;
            this._onDidChangeInitialCollapsibleState = new event_1.Emitter();
            this.onDidChangeInitialCollapsibleState = this._onDidChangeInitialCollapsibleState.event;
            this._onDidChangeState = new event_1.Emitter();
            this.onDidChangeState = this._onDidChangeState.event;
            this._isDisposed = false;
            if (_isTemplate) {
                this.comments = [];
            }
        }
        batchUpdate(changes) {
            const modified = (value) => Object.prototype.hasOwnProperty.call(changes, value);
            if (modified('range')) {
                this._range = changes.range;
            }
            if (modified('label')) {
                this._label = changes.label;
            }
            if (modified('contextValue')) {
                this._contextValue = changes.contextValue === null ? undefined : changes.contextValue;
            }
            if (modified('comments')) {
                this._comments = changes.comments;
            }
            if (modified('collapseState')) {
                this.initialCollapsibleState = changes.collapseState;
            }
            if (modified('canReply')) {
                this.canReply = changes.canReply;
            }
            if (modified('state')) {
                this.state = changes.state;
            }
            if (modified('isTemplate')) {
                this._isTemplate = changes.isTemplate;
            }
        }
        dispose() {
            this._isDisposed = true;
            this._onDidChangeCollapsibleState.dispose();
            this._onDidChangeComments.dispose();
            this._onDidChangeInput.dispose();
            this._onDidChangeLabel.dispose();
            this._onDidChangeRange.dispose();
            this._onDidChangeState.dispose();
        }
        toJSON() {
            return {
                $mid: 7 /* MarshalledId.CommentThread */,
                commentControlHandle: this.controllerHandle,
                commentThreadHandle: this.commentThreadHandle,
            };
        }
    }
    exports.MainThreadCommentThread = MainThreadCommentThread;
    class MainThreadCommentController {
        get handle() {
            return this._handle;
        }
        get id() {
            return this._id;
        }
        get contextValue() {
            return this._id;
        }
        get proxy() {
            return this._proxy;
        }
        get label() {
            return this._label;
        }
        get reactions() {
            return this._reactions;
        }
        set reactions(reactions) {
            this._reactions = reactions;
        }
        get options() {
            return this._features.options;
        }
        get features() {
            return this._features;
        }
        constructor(_proxy, _commentService, _handle, _uniqueId, _id, _label, _features) {
            this._proxy = _proxy;
            this._commentService = _commentService;
            this._handle = _handle;
            this._uniqueId = _uniqueId;
            this._id = _id;
            this._label = _label;
            this._features = _features;
            this._threads = new Map();
        }
        updateFeatures(features) {
            this._features = features;
        }
        createCommentThread(extensionId, commentThreadHandle, threadId, resource, range, isTemplate) {
            const thread = new MainThreadCommentThread(commentThreadHandle, this.handle, extensionId, threadId, uri_1.URI.revive(resource).toString(), range, true, isTemplate);
            this._threads.set(commentThreadHandle, thread);
            if (thread.isDocumentCommentThread()) {
                this._commentService.updateComments(this._uniqueId, {
                    added: [thread],
                    removed: [],
                    changed: [],
                    pending: []
                });
            }
            else {
                this._commentService.updateNotebookComments(this._uniqueId, {
                    added: [thread],
                    removed: [],
                    changed: [],
                    pending: []
                });
            }
            return thread;
        }
        updateCommentThread(commentThreadHandle, threadId, resource, changes) {
            const thread = this.getKnownThread(commentThreadHandle);
            thread.batchUpdate(changes);
            if (thread.isDocumentCommentThread()) {
                this._commentService.updateComments(this._uniqueId, {
                    added: [],
                    removed: [],
                    changed: [thread],
                    pending: []
                });
            }
            else {
                this._commentService.updateNotebookComments(this._uniqueId, {
                    added: [],
                    removed: [],
                    changed: [thread],
                    pending: []
                });
            }
        }
        deleteCommentThread(commentThreadHandle) {
            const thread = this.getKnownThread(commentThreadHandle);
            this._threads.delete(commentThreadHandle);
            thread.dispose();
            if (thread.isDocumentCommentThread()) {
                this._commentService.updateComments(this._uniqueId, {
                    added: [],
                    removed: [thread],
                    changed: [],
                    pending: []
                });
            }
            else {
                this._commentService.updateNotebookComments(this._uniqueId, {
                    added: [],
                    removed: [thread],
                    changed: [],
                    pending: []
                });
            }
        }
        deleteCommentThreadMain(commentThreadId) {
            this._threads.forEach(thread => {
                if (thread.threadId === commentThreadId) {
                    this._proxy.$deleteCommentThread(this._handle, thread.commentThreadHandle);
                }
            });
        }
        updateInput(input) {
            const thread = this.activeCommentThread;
            if (thread && thread.input) {
                const commentInput = thread.input;
                commentInput.value = input;
                thread.input = commentInput;
            }
        }
        updateCommentingRanges() {
            this._commentService.updateCommentingRanges(this._uniqueId);
        }
        getKnownThread(commentThreadHandle) {
            const thread = this._threads.get(commentThreadHandle);
            if (!thread) {
                throw new Error('unknown thread');
            }
            return thread;
        }
        async getDocumentComments(resource, token) {
            if (resource.scheme === network_1.Schemas.vscodeNotebookCell) {
                return {
                    owner: this._uniqueId,
                    label: this.label,
                    threads: [],
                    commentingRanges: {
                        resource: resource,
                        ranges: [],
                        fileComments: false
                    }
                };
            }
            const ret = [];
            for (const thread of [...this._threads.keys()]) {
                const commentThread = this._threads.get(thread);
                if (commentThread.resource === resource.toString()) {
                    ret.push(commentThread);
                }
            }
            const commentingRanges = await this._proxy.$provideCommentingRanges(this.handle, resource, token);
            return {
                owner: this._uniqueId,
                label: this.label,
                threads: ret,
                commentingRanges: {
                    resource: resource,
                    ranges: commentingRanges?.ranges || [],
                    fileComments: commentingRanges?.fileComments
                }
            };
        }
        async getNotebookComments(resource, token) {
            if (resource.scheme !== network_1.Schemas.vscodeNotebookCell) {
                return {
                    owner: this._uniqueId,
                    label: this.label,
                    threads: []
                };
            }
            const ret = [];
            for (const thread of [...this._threads.keys()]) {
                const commentThread = this._threads.get(thread);
                if (commentThread.resource === resource.toString()) {
                    ret.push(commentThread);
                }
            }
            return {
                owner: this._uniqueId,
                label: this.label,
                threads: ret
            };
        }
        async toggleReaction(uri, thread, comment, reaction, token) {
            return this._proxy.$toggleReaction(this._handle, thread.commentThreadHandle, uri, comment, reaction);
        }
        getAllComments() {
            const ret = [];
            for (const thread of [...this._threads.keys()]) {
                ret.push(this._threads.get(thread));
            }
            return ret;
        }
        createCommentThreadTemplate(resource, range) {
            this._proxy.$createCommentThreadTemplate(this.handle, resource, range);
        }
        async updateCommentThreadTemplate(threadHandle, range) {
            await this._proxy.$updateCommentThreadTemplate(this.handle, threadHandle, range);
        }
        toJSON() {
            return {
                $mid: 6 /* MarshalledId.CommentController */,
                handle: this.handle
            };
        }
    }
    exports.MainThreadCommentController = MainThreadCommentController;
    const commentsViewIcon = (0, iconRegistry_1.registerIcon)('comments-view-icon', codicons_1.Codicon.commentDiscussion, (0, nls_1.localize)('commentsViewIcon', 'View icon of the comments view.'));
    let MainThreadComments = class MainThreadComments extends lifecycle_1.Disposable {
        constructor(extHostContext, _commentService, _viewsService, _viewDescriptorService) {
            super();
            this._commentService = _commentService;
            this._viewsService = _viewsService;
            this._viewDescriptorService = _viewDescriptorService;
            this._handlers = new Map();
            this._commentControllers = new Map();
            this._activeCommentThreadDisposables = this._register(new lifecycle_1.DisposableStore());
            this._openViewListener = null;
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostComments);
            this._commentService.unregisterCommentController();
            this._register(this._commentService.onDidChangeActiveCommentThread(async (thread) => {
                const handle = thread.controllerHandle;
                const controller = this._commentControllers.get(handle);
                if (!controller) {
                    return;
                }
                this._activeCommentThreadDisposables.clear();
                this._activeCommentThread = thread;
                controller.activeCommentThread = this._activeCommentThread;
            }));
        }
        $registerCommentController(handle, id, label, extensionId) {
            const providerId = `${label}-${extensionId}`;
            this._handlers.set(handle, providerId);
            const provider = new MainThreadCommentController(this._proxy, this._commentService, handle, providerId, id, label, {});
            this._commentService.registerCommentController(providerId, provider);
            this._commentControllers.set(handle, provider);
            const commentsPanelAlreadyConstructed = !!this._viewDescriptorService.getViewDescriptorById(commentsTreeViewer_1.COMMENTS_VIEW_ID);
            if (!commentsPanelAlreadyConstructed) {
                this.registerView(commentsPanelAlreadyConstructed);
            }
            this.registerViewListeners(commentsPanelAlreadyConstructed);
            this._commentService.setWorkspaceComments(String(handle), []);
        }
        $unregisterCommentController(handle) {
            const providerId = this._handlers.get(handle);
            this._handlers.delete(handle);
            this._commentControllers.delete(handle);
            if (typeof providerId !== 'string') {
                return;
                // throw new Error('unknown handler');
            }
            else {
                this._commentService.unregisterCommentController(providerId);
            }
        }
        $updateCommentControllerFeatures(handle, features) {
            const provider = this._commentControllers.get(handle);
            if (!provider) {
                return undefined;
            }
            provider.updateFeatures(features);
        }
        $createCommentThread(handle, commentThreadHandle, threadId, resource, range, extensionId, isTemplate) {
            const provider = this._commentControllers.get(handle);
            if (!provider) {
                return undefined;
            }
            return provider.createCommentThread(extensionId.value, commentThreadHandle, threadId, resource, range, isTemplate);
        }
        $updateCommentThread(handle, commentThreadHandle, threadId, resource, changes) {
            const provider = this._commentControllers.get(handle);
            if (!provider) {
                return undefined;
            }
            return provider.updateCommentThread(commentThreadHandle, threadId, resource, changes);
        }
        $deleteCommentThread(handle, commentThreadHandle) {
            const provider = this._commentControllers.get(handle);
            if (!provider) {
                return;
            }
            return provider.deleteCommentThread(commentThreadHandle);
        }
        $updateCommentingRanges(handle) {
            const provider = this._commentControllers.get(handle);
            if (!provider) {
                return;
            }
            provider.updateCommentingRanges();
        }
        registerView(commentsViewAlreadyRegistered) {
            if (!commentsViewAlreadyRegistered) {
                const VIEW_CONTAINER = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
                    id: commentsTreeViewer_1.COMMENTS_VIEW_ID,
                    title: { value: commentsTreeViewer_1.COMMENTS_VIEW_TITLE, original: commentsTreeViewer_1.COMMENTS_VIEW_ORIGINAL_TITLE },
                    ctorDescriptor: new descriptors_1.SyncDescriptor(viewPaneContainer_1.ViewPaneContainer, [commentsTreeViewer_1.COMMENTS_VIEW_ID, { mergeViewWithContainerWhenSingleView: true }]),
                    storageId: commentsTreeViewer_1.COMMENTS_VIEW_STORAGE_ID,
                    hideIfEmpty: true,
                    icon: commentsViewIcon,
                    order: 10,
                }, 1 /* ViewContainerLocation.Panel */);
                platform_1.Registry.as(views_1.Extensions.ViewsRegistry).registerViews([{
                        id: commentsTreeViewer_1.COMMENTS_VIEW_ID,
                        name: commentsTreeViewer_1.COMMENTS_VIEW_TITLE,
                        canToggleVisibility: false,
                        ctorDescriptor: new descriptors_1.SyncDescriptor(commentsView_1.CommentsPanel),
                        canMoveView: true,
                        containerIcon: commentsViewIcon,
                        focusCommand: {
                            id: 'workbench.action.focusCommentsPanel'
                        }
                    }], VIEW_CONTAINER);
            }
        }
        setComments() {
            [...this._commentControllers.keys()].forEach(handle => {
                const threads = this._commentControllers.get(handle).getAllComments();
                if (threads.length) {
                    const providerId = this.getHandler(handle);
                    this._commentService.setWorkspaceComments(providerId, threads);
                }
            });
        }
        registerViewOpenedListener() {
            if (!this._openViewListener) {
                this._openViewListener = this._viewsService.onDidChangeViewVisibility(e => {
                    if (e.id === commentsTreeViewer_1.COMMENTS_VIEW_ID && e.visible) {
                        this.setComments();
                        if (this._openViewListener) {
                            this._openViewListener.dispose();
                            this._openViewListener = null;
                        }
                    }
                });
            }
        }
        /**
         * If the comments view has never been opened, the constructor for it has not yet run so it has
         * no listeners for comment threads being set or updated. Listen for the view opening for the
         * first time and send it comments then.
         */
        registerViewListeners(commentsPanelAlreadyConstructed) {
            if (!commentsPanelAlreadyConstructed) {
                this.registerViewOpenedListener();
            }
            this._register(this._viewDescriptorService.onDidChangeContainer(e => {
                if (e.views.find(view => view.id === commentsTreeViewer_1.COMMENTS_VIEW_ID)) {
                    this.setComments();
                    this.registerViewOpenedListener();
                }
            }));
            this._register(this._viewDescriptorService.onDidChangeContainerLocation(e => {
                const commentsContainer = this._viewDescriptorService.getViewContainerByViewId(commentsTreeViewer_1.COMMENTS_VIEW_ID);
                if (e.viewContainer.id === commentsContainer?.id) {
                    this.setComments();
                    this.registerViewOpenedListener();
                }
            }));
        }
        getHandler(handle) {
            if (!this._handlers.has(handle)) {
                throw new Error('Unknown handler');
            }
            return this._handlers.get(handle);
        }
    };
    exports.MainThreadComments = MainThreadComments;
    exports.MainThreadComments = MainThreadComments = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadComments),
        __param(1, commentService_1.ICommentService),
        __param(2, views_1.IViewsService),
        __param(3, views_1.IViewDescriptorService)
    ], MainThreadComments);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZENvbW1lbnRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9icm93c2VyL21haW5UaHJlYWRDb21tZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUEwQmhHLE1BQWEsdUJBQXVCO1FBRW5DLElBQUksS0FBSztZQUNSLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNwQixDQUFDO1FBRUQsSUFBSSxLQUFLLENBQUMsS0FBeUM7WUFDbEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFDcEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwQyxDQUFDO1FBR0QsSUFBSSxnQkFBZ0IsS0FBZ0QsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUkxRyxJQUFJLEtBQUs7WUFDUixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDcEIsQ0FBQztRQUVELElBQUksS0FBSyxDQUFDLEtBQXlCO1lBQ2xDLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFDLENBQUM7UUFJRCxJQUFJLFlBQVk7WUFDZixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDM0IsQ0FBQztRQUVELElBQUksWUFBWSxDQUFDLE9BQTJCO1lBQzNDLElBQUksQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDO1FBQzlCLENBQUM7UUFPRCxJQUFXLFFBQVE7WUFDbEIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ3ZCLENBQUM7UUFFRCxJQUFXLFFBQVEsQ0FBQyxXQUE0QztZQUMvRCxJQUFJLENBQUMsU0FBUyxH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