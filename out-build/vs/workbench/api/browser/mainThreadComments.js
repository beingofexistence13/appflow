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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/editor/common/core/range", "vs/platform/registry/common/platform", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/contrib/comments/browser/commentService", "vs/workbench/contrib/comments/browser/commentsView", "../common/extHost.protocol", "vs/workbench/contrib/comments/browser/commentsTreeViewer", "vs/workbench/common/views", "vs/platform/instantiation/common/descriptors", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/nls!vs/workbench/api/browser/mainThreadComments", "vs/base/common/network"], function (require, exports, event_1, lifecycle_1, uri_1, range_1, platform_1, extHostCustomers_1, commentService_1, commentsView_1, extHost_protocol_1, commentsTreeViewer_1, views_1, descriptors_1, viewPaneContainer_1, codicons_1, iconRegistry_1, nls_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Pmb = exports.$Omb = exports.$Nmb = void 0;
    class $Nmb {
        get input() {
            return this.a;
        }
        set input(value) {
            this.a = value;
            this.b.fire(value);
        }
        get onDidChangeInput() { return this.b.event; }
        get label() {
            return this.c;
        }
        set label(label) {
            this.c = label;
            this.f.fire(this.c);
        }
        get contextValue() {
            return this.d;
        }
        set contextValue(context) {
            this.d = context;
        }
        get comments() {
            return this.g;
        }
        set comments(newComments) {
            this.g = newComments;
            this.h.fire(this.g);
        }
        get onDidChangeComments() { return this.h.event; }
        set range(range) {
            this.s = range;
            this.j.fire(this.s);
        }
        get range() {
            return this.s;
        }
        get onDidChangeCanReply() { return this.i.event; }
        set canReply(state) {
            this.t = state;
            this.i.fire(this.t);
        }
        get canReply() {
            return this.t;
        }
        get collapsibleState() {
            return this.k;
        }
        set collapsibleState(newState) {
            this.k = newState;
            this.n.fire(this.k);
        }
        get m() {
            return this.l;
        }
        set m(initialCollapsibleState) {
            this.l = initialCollapsibleState;
            if (this.collapsibleState === undefined) {
                this.collapsibleState = this.m;
            }
            this.o.fire(initialCollapsibleState);
        }
        get isDisposed() {
            return this.p;
        }
        isDocumentCommentThread() {
            return this.s === undefined || range_1.$ks.isIRange(this.s);
        }
        get state() {
            return this.q;
        }
        set state(newState) {
            this.q = newState;
            this.r.fire(this.q);
        }
        get isTemplate() {
            return this.u;
        }
        constructor(commentThreadHandle, controllerHandle, extensionId, threadId, resource, s, t, u) {
            this.commentThreadHandle = commentThreadHandle;
            this.controllerHandle = controllerHandle;
            this.extensionId = extensionId;
            this.threadId = threadId;
            this.resource = resource;
            this.s = s;
            this.t = t;
            this.u = u;
            this.b = new event_1.$fd();
            this.f = new event_1.$fd();
            this.onDidChangeLabel = this.f.event;
            this.h = new event_1.$fd();
            this.i = new event_1.$fd();
            this.j = new event_1.$fd();
            this.onDidChangeRange = this.j.event;
            this.n = new event_1.$fd();
            this.onDidChangeCollapsibleState = this.n.event;
            this.o = new event_1.$fd();
            this.onDidChangeInitialCollapsibleState = this.o.event;
            this.r = new event_1.$fd();
            this.onDidChangeState = this.r.event;
            this.p = false;
            if (u) {
                this.comments = [];
            }
        }
        batchUpdate(changes) {
            const modified = (value) => Object.prototype.hasOwnProperty.call(changes, value);
            if (modified('range')) {
                this.s = changes.range;
            }
            if (modified('label')) {
                this.c = changes.label;
            }
            if (modified('contextValue')) {
                this.d = changes.contextValue === null ? undefined : changes.contextValue;
            }
            if (modified('comments')) {
                this.g = changes.comments;
            }
            if (modified('collapseState')) {
                this.m = changes.collapseState;
            }
            if (modified('canReply')) {
                this.canReply = changes.canReply;
            }
            if (modified('state')) {
                this.state = changes.state;
            }
            if (modified('isTemplate')) {
                this.u = changes.isTemplate;
            }
        }
        dispose() {
            this.p = true;
            this.n.dispose();
            this.h.dispose();
            this.b.dispose();
            this.f.dispose();
            this.j.dispose();
            this.r.dispose();
        }
        toJSON() {
            return {
                $mid: 7 /* MarshalledId.CommentThread */,
                commentControlHandle: this.controllerHandle,
                commentThreadHandle: this.commentThreadHandle,
            };
        }
    }
    exports.$Nmb = $Nmb;
    class $Omb {
        get handle() {
            return this.f;
        }
        get id() {
            return this.h;
        }
        get contextValue() {
            return this.h;
        }
        get proxy() {
            return this.c;
        }
        get label() {
            return this.i;
        }
        get reactions() {
            return this.a;
        }
        set reactions(reactions) {
            this.a = reactions;
        }
        get options() {
            return this.j.options;
        }
        get features() {
            return this.j;
        }
        constructor(c, d, f, g, h, i, j) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.b = new Map();
        }
        updateFeatures(features) {
            this.j = features;
        }
        createCommentThread(extensionId, commentThreadHandle, threadId, resource, range, isTemplate) {
            const thread = new $Nmb(commentThreadHandle, this.handle, extensionId, threadId, uri_1.URI.revive(resource).toString(), range, true, isTemplate);
            this.b.set(commentThreadHandle, thread);
            if (thread.isDocumentCommentThread()) {
                this.d.updateComments(this.g, {
                    added: [thread],
                    removed: [],
                    changed: [],
                    pending: []
                });
            }
            else {
                this.d.updateNotebookComments(this.g, {
                    added: [thread],
                    removed: [],
                    changed: [],
                    pending: []
                });
            }
            return thread;
        }
        updateCommentThread(commentThreadHandle, threadId, resource, changes) {
            const thread = this.k(commentThreadHandle);
            thread.batchUpdate(changes);
            if (thread.isDocumentCommentThread()) {
                this.d.updateComments(this.g, {
                    added: [],
                    removed: [],
                    changed: [thread],
                    pending: []
                });
            }
            else {
                this.d.updateNotebookComments(this.g, {
                    added: [],
                    removed: [],
                    changed: [thread],
                    pending: []
                });
            }
        }
        deleteCommentThread(commentThreadHandle) {
            const thread = this.k(commentThreadHandle);
            this.b.delete(commentThreadHandle);
            thread.dispose();
            if (thread.isDocumentCommentThread()) {
                this.d.updateComments(this.g, {
                    added: [],
                    removed: [thread],
                    changed: [],
                    pending: []
                });
            }
            else {
                this.d.updateNotebookComments(this.g, {
                    added: [],
                    removed: [thread],
                    changed: [],
                    pending: []
                });
            }
        }
        deleteCommentThreadMain(commentThreadId) {
            this.b.forEach(thread => {
                if (thread.threadId === commentThreadId) {
                    this.c.$deleteCommentThread(this.f, thread.commentThreadHandle);
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
            this.d.updateCommentingRanges(this.g);
        }
        k(commentThreadHandle) {
            const thread = this.b.get(commentThreadHandle);
            if (!thread) {
                throw new Error('unknown thread');
            }
            return thread;
        }
        async getDocumentComments(resource, token) {
            if (resource.scheme === network_1.Schemas.vscodeNotebookCell) {
                return {
                    owner: this.g,
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
            for (const thread of [...this.b.keys()]) {
                const commentThread = this.b.get(thread);
                if (commentThread.resource === resource.toString()) {
                    ret.push(commentThread);
                }
            }
            const commentingRanges = await this.c.$provideCommentingRanges(this.handle, resource, token);
            return {
                owner: this.g,
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
                    owner: this.g,
                    label: this.label,
                    threads: []
                };
            }
            const ret = [];
            for (const thread of [...this.b.keys()]) {
                const commentThread = this.b.get(thread);
                if (commentThread.resource === resource.toString()) {
                    ret.push(commentThread);
                }
            }
            return {
                owner: this.g,
                label: this.label,
                threads: ret
            };
        }
        async toggleReaction(uri, thread, comment, reaction, token) {
            return this.c.$toggleReaction(this.f, thread.commentThreadHandle, uri, comment, reaction);
        }
        getAllComments() {
            const ret = [];
            for (const thread of [...this.b.keys()]) {
                ret.push(this.b.get(thread));
            }
            return ret;
        }
        createCommentThreadTemplate(resource, range) {
            this.c.$createCommentThreadTemplate(this.handle, resource, range);
        }
        async updateCommentThreadTemplate(threadHandle, range) {
            await this.c.$updateCommentThreadTemplate(this.handle, threadHandle, range);
        }
        toJSON() {
            return {
                $mid: 6 /* MarshalledId.CommentController */,
                handle: this.handle
            };
        }
    }
    exports.$Omb = $Omb;
    const commentsViewIcon = (0, iconRegistry_1.$9u)('comments-view-icon', codicons_1.$Pj.commentDiscussion, (0, nls_1.localize)(0, null));
    let $Pmb = class $Pmb extends lifecycle_1.$kc {
        constructor(extHostContext, j, m, n) {
            super();
            this.j = j;
            this.m = m;
            this.n = n;
            this.b = new Map();
            this.c = new Map();
            this.g = this.B(new lifecycle_1.$jc());
            this.h = null;
            this.a = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostComments);
            this.j.unregisterCommentController();
            this.B(this.j.onDidChangeActiveCommentThread(async (thread) => {
                const handle = thread.controllerHandle;
                const controller = this.c.get(handle);
                if (!controller) {
                    return;
                }
                this.g.clear();
                this.f = thread;
                controller.activeCommentThread = this.f;
            }));
        }
        $registerCommentController(handle, id, label, extensionId) {
            const providerId = `${label}-${extensionId}`;
            this.b.set(handle, providerId);
            const provider = new $Omb(this.a, this.j, handle, providerId, id, label, {});
            this.j.registerCommentController(providerId, provider);
            this.c.set(handle, provider);
            const commentsPanelAlreadyConstructed = !!this.n.getViewDescriptorById(commentsTreeViewer_1.$Wlb);
            if (!commentsPanelAlreadyConstructed) {
                this.r(commentsPanelAlreadyConstructed);
            }
            this.u(commentsPanelAlreadyConstructed);
            this.j.setWorkspaceComments(String(handle), []);
        }
        $unregisterCommentController(handle) {
            const providerId = this.b.get(handle);
            this.b.delete(handle);
            this.c.delete(handle);
            if (typeof providerId !== 'string') {
                return;
                // throw new Error('unknown handler');
            }
            else {
                this.j.unregisterCommentController(providerId);
            }
        }
        $updateCommentControllerFeatures(handle, features) {
            const provider = this.c.get(handle);
            if (!provider) {
                return undefined;
            }
            provider.updateFeatures(features);
        }
        $createCommentThread(handle, commentThreadHandle, threadId, resource, range, extensionId, isTemplate) {
            const provider = this.c.get(handle);
            if (!provider) {
                return undefined;
            }
            return provider.createCommentThread(extensionId.value, commentThreadHandle, threadId, resource, range, isTemplate);
        }
        $updateCommentThread(handle, commentThreadHandle, threadId, resource, changes) {
            const provider = this.c.get(handle);
            if (!provider) {
                return undefined;
            }
            return provider.updateCommentThread(commentThreadHandle, threadId, resource, changes);
        }
        $deleteCommentThread(handle, commentThreadHandle) {
            const provider = this.c.get(handle);
            if (!provider) {
                return;
            }
            return provider.deleteCommentThread(commentThreadHandle);
        }
        $updateCommentingRanges(handle) {
            const provider = this.c.get(handle);
            if (!provider) {
                return;
            }
            provider.updateCommentingRanges();
        }
        r(commentsViewAlreadyRegistered) {
            if (!commentsViewAlreadyRegistered) {
                const VIEW_CONTAINER = platform_1.$8m.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
                    id: commentsTreeViewer_1.$Wlb,
                    title: { value: commentsTreeViewer_1.$Zlb, original: commentsTreeViewer_1.$Ylb },
                    ctorDescriptor: new descriptors_1.$yh(viewPaneContainer_1.$Seb, [commentsTreeViewer_1.$Wlb, { mergeViewWithContainerWhenSingleView: true }]),
                    storageId: commentsTreeViewer_1.$Xlb,
                    hideIfEmpty: true,
                    icon: commentsViewIcon,
                    order: 10,
                }, 1 /* ViewContainerLocation.Panel */);
                platform_1.$8m.as(views_1.Extensions.ViewsRegistry).registerViews([{
                        id: commentsTreeViewer_1.$Wlb,
                        name: commentsTreeViewer_1.$Zlb,
                        canToggleVisibility: false,
                        ctorDescriptor: new descriptors_1.$yh(commentsView_1.$Mmb),
                        canMoveView: true,
                        containerIcon: commentsViewIcon,
                        focusCommand: {
                            id: 'workbench.action.focusCommentsPanel'
                        }
                    }], VIEW_CONTAINER);
            }
        }
        s() {
            [...this.c.keys()].forEach(handle => {
                const threads = this.c.get(handle).getAllComments();
                if (threads.length) {
                    const providerId = this.w(handle);
                    this.j.setWorkspaceComments(providerId, threads);
                }
            });
        }
        t() {
            if (!this.h) {
                this.h = this.m.onDidChangeViewVisibility(e => {
                    if (e.id === commentsTreeViewer_1.$Wlb && e.visible) {
                        this.s();
                        if (this.h) {
                            this.h.dispose();
                            this.h = null;
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
        u(commentsPanelAlreadyConstructed) {
            if (!commentsPanelAlreadyConstructed) {
                this.t();
            }
            this.B(this.n.onDidChangeContainer(e => {
                if (e.views.find(view => view.id === commentsTreeViewer_1.$Wlb)) {
                    this.s();
                    this.t();
                }
            }));
            this.B(this.n.onDidChangeContainerLocation(e => {
                const commentsContainer = this.n.getViewContainerByViewId(commentsTreeViewer_1.$Wlb);
                if (e.viewContainer.id === commentsContainer?.id) {
                    this.s();
                    this.t();
                }
            }));
        }
        w(handle) {
            if (!this.b.has(handle)) {
                throw new Error('Unknown handler');
            }
            return this.b.get(handle);
        }
    };
    exports.$Pmb = $Pmb;
    exports.$Pmb = $Pmb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadComments),
        __param(1, commentService_1.$Ilb),
        __param(2, views_1.$$E),
        __param(3, views_1.$_E)
    ], $Pmb);
});
//# sourceMappingURL=mainThreadComments.js.map