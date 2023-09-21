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
define(["require", "exports", "vs/base/common/async", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/editor/common/languages", "vs/platform/extensions/common/extensions", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "./extHost.protocol", "vs/workbench/services/extensions/common/extensions"], function (require, exports, async_1, decorators_1, event_1, lifecycle_1, uri_1, languages, extensions_1, extHostTypeConverter, types, extHost_protocol_1, extensions_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$fbc = void 0;
    function $fbc(mainContext, commands, documents) {
        const proxy = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadComments);
        class ExtHostCommentsImpl {
            static { this.a = 0; }
            constructor() {
                this.b = new Map();
                this.c = new extensions_1.$Xl();
                commands.registerArgumentProcessor({
                    processArgument: arg => {
                        if (arg && arg.$mid === 6 /* MarshalledId.CommentController */) {
                            const commentController = this.b.get(arg.handle);
                            if (!commentController) {
                                return arg;
                            }
                            return commentController.value;
                        }
                        else if (arg && arg.$mid === 7 /* MarshalledId.CommentThread */) {
                            const commentController = this.b.get(arg.commentControlHandle);
                            if (!commentController) {
                                return arg;
                            }
                            const commentThread = commentController.getCommentThread(arg.commentThreadHandle);
                            if (!commentThread) {
                                return arg;
                            }
                            return commentThread.value;
                        }
                        else if (arg && (arg.$mid === 9 /* MarshalledId.CommentThreadReply */ || arg.$mid === 8 /* MarshalledId.CommentThreadInstance */)) {
                            const commentController = this.b.get(arg.thread.commentControlHandle);
                            if (!commentController) {
                                return arg;
                            }
                            const commentThread = commentController.getCommentThread(arg.thread.commentThreadHandle);
                            if (!commentThread) {
                                return arg;
                            }
                            if (arg.$mid === 8 /* MarshalledId.CommentThreadInstance */) {
                                return commentThread.value;
                            }
                            return {
                                thread: commentThread.value,
                                text: arg.text
                            };
                        }
                        else if (arg && arg.$mid === 10 /* MarshalledId.CommentNode */) {
                            const commentController = this.b.get(arg.thread.commentControlHandle);
                            if (!commentController) {
                                return arg;
                            }
                            const commentThread = commentController.getCommentThread(arg.thread.commentThreadHandle);
                            if (!commentThread) {
                                return arg;
                            }
                            const commentUniqueId = arg.commentUniqueId;
                            const comment = commentThread.getCommentByUniqueId(commentUniqueId);
                            if (!comment) {
                                return arg;
                            }
                            return comment;
                        }
                        else if (arg && arg.$mid === 11 /* MarshalledId.CommentThreadNode */) {
                            const commentController = this.b.get(arg.thread.commentControlHandle);
                            if (!commentController) {
                                return arg;
                            }
                            const commentThread = commentController.getCommentThread(arg.thread.commentThreadHandle);
                            if (!commentThread) {
                                return arg;
                            }
                            const body = arg.text;
                            const commentUniqueId = arg.commentUniqueId;
                            const comment = commentThread.getCommentByUniqueId(commentUniqueId);
                            if (!comment) {
                                return arg;
                            }
                            // If the old comment body was a markdown string, use a markdown string here too.
                            if (typeof comment.body === 'string') {
                                comment.body = body;
                            }
                            else {
                                comment.body = new types.$qK(body);
                            }
                            return comment;
                        }
                        return arg;
                    }
                });
            }
            createCommentController(extension, id, label) {
                const handle = ExtHostCommentsImpl.a++;
                const commentController = new ExtHostCommentController(extension, handle, id, label);
                this.b.set(commentController.handle, commentController);
                const commentControllers = this.c.get(extension.identifier) || [];
                commentControllers.push(commentController);
                this.c.set(extension.identifier, commentControllers);
                return commentController.value;
            }
            $createCommentThreadTemplate(commentControllerHandle, uriComponents, range) {
                const commentController = this.b.get(commentControllerHandle);
                if (!commentController) {
                    return;
                }
                commentController.$createCommentThreadTemplate(uriComponents, range);
            }
            async $updateCommentThreadTemplate(commentControllerHandle, threadHandle, range) {
                const commentController = this.b.get(commentControllerHandle);
                if (!commentController) {
                    return;
                }
                commentController.$updateCommentThreadTemplate(threadHandle, range);
            }
            $deleteCommentThread(commentControllerHandle, commentThreadHandle) {
                const commentController = this.b.get(commentControllerHandle);
                commentController?.$deleteCommentThread(commentThreadHandle);
            }
            $provideCommentingRanges(commentControllerHandle, uriComponents, token) {
                const commentController = this.b.get(commentControllerHandle);
                if (!commentController || !commentController.commentingRangeProvider) {
                    return Promise.resolve(undefined);
                }
                const document = documents.getDocument(uri_1.URI.revive(uriComponents));
                return (0, async_1.$zg)(async () => {
                    const rangesResult = await commentController.commentingRangeProvider.provideCommentingRanges(document, token);
                    let ranges;
                    if (Array.isArray(rangesResult)) {
                        ranges = {
                            ranges: rangesResult,
                            fileComments: false
                        };
                    }
                    else if (rangesResult) {
                        ranges = {
                            ranges: rangesResult.ranges || [],
                            fileComments: rangesResult.fileComments || false
                        };
                    }
                    else {
                        ranges = rangesResult ?? undefined;
                    }
                    return ranges;
                }).then(ranges => {
                    let convertedResult = undefined;
                    if (ranges) {
                        convertedResult = {
                            ranges: ranges.ranges.map(x => extHostTypeConverter.Range.from(x)),
                            fileComments: ranges.fileComments
                        };
                    }
                    return convertedResult;
                });
            }
            $toggleReaction(commentControllerHandle, threadHandle, uri, comment, reaction) {
                const commentController = this.b.get(commentControllerHandle);
                if (!commentController || !commentController.reactionHandler) {
                    return Promise.resolve(undefined);
                }
                return (0, async_1.$zg)(() => {
                    const commentThread = commentController.getCommentThread(threadHandle);
                    if (commentThread) {
                        const vscodeComment = commentThread.getCommentByUniqueId(comment.uniqueIdInThread);
                        if (commentController !== undefined && vscodeComment) {
                            if (commentController.reactionHandler) {
                                return commentController.reactionHandler(vscodeComment, convertFromReaction(reaction));
                            }
                        }
                    }
                    return Promise.resolve(undefined);
                });
            }
        }
        class ExtHostCommentThread {
            static { this.a = 0; }
            set threadId(id) {
                this.n = id;
            }
            get threadId() {
                return this.n;
            }
            get id() {
                return this.n;
            }
            get resource() {
                return this.o;
            }
            get uri() {
                return this.o;
            }
            set range(range) {
                if (((range === undefined) !== (this.p === undefined)) || (!range || !this.p || !range.isEqual(this.p))) {
                    this.p = range;
                    this.b.range = range;
                    this.c.fire();
                }
            }
            get range() {
                return this.p;
            }
            set canReply(state) {
                if (this.d !== state) {
                    this.d = state;
                    this.b.canReply = state;
                    this.c.fire();
                }
            }
            get canReply() {
                return this.d;
            }
            get label() {
                return this.e;
            }
            set label(label) {
                this.e = label;
                this.b.label = label;
                this.c.fire();
            }
            get contextValue() {
                return this.f;
            }
            set contextValue(context) {
                this.f = context;
                this.b.contextValue = context;
                this.c.fire();
            }
            get comments() {
                return this.q;
            }
            set comments(newComments) {
                this.q = newComments;
                this.b.comments = newComments;
                this.c.fire();
            }
            get collapsibleState() {
                return this.g;
            }
            set collapsibleState(newState) {
                this.g = newState;
                this.b.collapsibleState = newState;
                this.c.fire();
            }
            get state() {
                return this.h;
            }
            set state(newState) {
                this.h = newState;
                this.b.state = newState;
                this.c.fire();
            }
            get isDisposed() {
                return this.j;
            }
            constructor(commentControllerId, m, n, o, p, q, extensionDescription, r) {
                this.m = m;
                this.n = n;
                this.o = o;
                this.p = p;
                this.q = q;
                this.extensionDescription = extensionDescription;
                this.r = r;
                this.handle = ExtHostCommentThread.a++;
                this.commentHandle = 0;
                this.b = Object.create(null);
                this.c = new event_1.$fd();
                this.onDidUpdateCommentThread = this.c.event;
                this.d = true;
                this.k = new Map();
                this.l = new lifecycle_1.$lc();
                this.l.value = new lifecycle_1.$jc();
                if (this.n === undefined) {
                    this.n = `${commentControllerId}.${this.handle}`;
                }
                proxy.$createCommentThread(m, this.handle, this.n, this.o, extHostTypeConverter.Range.from(this.p), extensionDescription.identifier, this.r);
                this.i = [];
                this.j = false;
                this.i.push(this.onDidUpdateCommentThread(() => {
                    this.eventuallyUpdateCommentThread();
                }));
                // set up comments after ctor to batch update events.
                this.comments = q;
                this.i.push({
                    dispose: () => {
                        proxy.$deleteCommentThread(m, this.handle);
                    }
                });
                const that = this;
                this.value = {
                    get uri() { return that.uri; },
                    get range() { return that.range; },
                    set range(value) { that.range = value; },
                    get comments() { return that.comments; },
                    set comments(value) { that.comments = value; },
                    get collapsibleState() { return that.collapsibleState; },
                    set collapsibleState(value) { that.collapsibleState = value; },
                    get canReply() { return that.canReply; },
                    set canReply(state) { that.canReply = state; },
                    get contextValue() { return that.contextValue; },
                    set contextValue(value) { that.contextValue = value; },
                    get label() { return that.label; },
                    set label(value) { that.label = value; },
                    get state() { return that.state; },
                    set state(value) { that.state = value; },
                    dispose: () => {
                        that.dispose();
                    }
                };
            }
            s() {
                if (this.r) {
                    this.r = false;
                    this.b.isTemplate = false;
                }
            }
            eventuallyUpdateCommentThread() {
                if (this.j) {
                    return;
                }
                this.s();
                if (!this.l.value) {
                    this.l.value = new lifecycle_1.$jc();
                }
                const modified = (value) => Object.prototype.hasOwnProperty.call(this.b, value);
                const formattedModifications = {};
                if (modified('range')) {
                    formattedModifications.range = extHostTypeConverter.Range.from(this.p);
                }
                if (modified('label')) {
                    formattedModifications.label = this.label;
                }
                if (modified('contextValue')) {
                    /*
                     * null -> cleared contextValue
                     * undefined -> no change
                     */
                    formattedModifications.contextValue = this.contextValue ?? null;
                }
                if (modified('comments')) {
                    formattedModifications.comments =
                        this.q.map(cmt => convertToDTOComment(this, cmt, this.k, this.extensionDescription));
                }
                if (modified('collapsibleState')) {
                    formattedModifications.collapseState = convertToCollapsibleState(this.g);
                }
                if (modified('canReply')) {
                    formattedModifications.canReply = this.canReply;
                }
                if (modified('state')) {
                    formattedModifications.state = convertToState(this.h);
                }
                if (modified('isTemplate')) {
                    formattedModifications.isTemplate = this.r;
                }
                this.b = {};
                proxy.$updateCommentThread(this.m, this.handle, this.n, this.o, formattedModifications);
            }
            getCommentByUniqueId(uniqueId) {
                for (const key of this.k) {
                    const comment = key[0];
                    const id = key[1];
                    if (uniqueId === id) {
                        return comment;
                    }
                }
                return;
            }
            dispose() {
                this.j = true;
                this.l.dispose();
                this.i.forEach(disposable => disposable.dispose());
            }
        }
        __decorate([
            (0, decorators_1.$7g)(100)
        ], ExtHostCommentThread.prototype, "eventuallyUpdateCommentThread", null);
        class ExtHostCommentController {
            get id() {
                return this.h;
            }
            get label() {
                return this.i;
            }
            get handle() {
                return this.g;
            }
            get commentingRangeProvider() {
                return this.b;
            }
            set commentingRangeProvider(provider) {
                this.b = provider;
                proxy.$updateCommentingRanges(this.handle);
            }
            get reactionHandler() {
                return this.c;
            }
            set reactionHandler(handler) {
                this.c = handler;
                proxy.$updateCommentControllerFeatures(this.handle, { reactionHandler: !!handler });
            }
            get options() {
                return this.d;
            }
            set options(options) {
                this.d = options;
                proxy.$updateCommentControllerFeatures(this.handle, { options: this.d });
            }
            constructor(f, g, h, i) {
                this.f = f;
                this.g = g;
                this.h = h;
                this.i = i;
                this.a = new Map();
                proxy.$registerCommentController(this.handle, h, i, this.f.identifier.value);
                const that = this;
                this.value = Object.freeze({
                    id: that.id,
                    label: that.label,
                    get options() { return that.options; },
                    set options(options) { that.options = options; },
                    get commentingRangeProvider() { return that.commentingRangeProvider; },
                    set commentingRangeProvider(commentingRangeProvider) { that.commentingRangeProvider = commentingRangeProvider; },
                    get reactionHandler() { return that.reactionHandler; },
                    set reactionHandler(handler) { that.reactionHandler = handler; },
                    createCommentThread(uri, range, comments) {
                        return that.createCommentThread(uri, range, comments).value;
                    },
                    dispose: () => { that.dispose(); },
                }); // TODO @alexr00 remove this cast when the proposed API is stable
                this.e = [];
                this.e.push({
                    dispose: () => {
                        proxy.$unregisterCommentController(this.handle);
                    }
                });
            }
            createCommentThread(resource, range, comments) {
                if (range === undefined) {
                    (0, extensions_2.$QF)(this.f, 'fileComments');
                }
                const commentThread = new ExtHostCommentThread(this.id, this.handle, undefined, resource, range, comments, this.f, false);
                this.a.set(commentThread.handle, commentThread);
                return commentThread;
            }
            $createCommentThreadTemplate(uriComponents, range) {
                const commentThread = new ExtHostCommentThread(this.id, this.handle, undefined, uri_1.URI.revive(uriComponents), extHostTypeConverter.Range.to(range), [], this.f, true);
                commentThread.collapsibleState = languages.CommentThreadCollapsibleState.Expanded;
                this.a.set(commentThread.handle, commentThread);
                return commentThread;
            }
            $updateCommentThreadTemplate(threadHandle, range) {
                const thread = this.a.get(threadHandle);
                if (thread) {
                    thread.range = extHostTypeConverter.Range.to(range);
                }
            }
            $deleteCommentThread(threadHandle) {
                const thread = this.a.get(threadHandle);
                thread?.dispose();
                this.a.delete(threadHandle);
            }
            getCommentThread(handle) {
                return this.a.get(handle);
            }
            dispose() {
                this.a.forEach(value => {
                    value.dispose();
                });
                this.e.forEach(disposable => disposable.dispose());
            }
        }
        function convertToDTOComment(thread, vscodeComment, commentsMap, extension) {
            let commentUniqueId = commentsMap.get(vscodeComment);
            if (!commentUniqueId) {
                commentUniqueId = ++thread.commentHandle;
                commentsMap.set(vscodeComment, commentUniqueId);
            }
            if (vscodeComment.state !== undefined) {
                (0, extensions_2.$QF)(extension, 'commentsDraftState');
            }
            return {
                mode: vscodeComment.mode,
                contextValue: vscodeComment.contextValue,
                uniqueIdInThread: commentUniqueId,
                body: (typeof vscodeComment.body === 'string') ? vscodeComment.body : extHostTypeConverter.MarkdownString.from(vscodeComment.body),
                userName: vscodeComment.author.name,
                userIconPath: vscodeComment.author.iconPath,
                label: vscodeComment.label,
                commentReactions: vscodeComment.reactions ? vscodeComment.reactions.map(reaction => convertToReaction(reaction)) : undefined,
                state: vscodeComment.state,
                timestamp: vscodeComment.timestamp?.toJSON()
            };
        }
        function convertToReaction(reaction) {
            return {
                label: reaction.label,
                iconPath: reaction.iconPath ? extHostTypeConverter.$1L(reaction.iconPath) : undefined,
                count: reaction.count,
                hasReacted: reaction.authorHasReacted,
            };
        }
        function convertFromReaction(reaction) {
            return {
                label: reaction.label || '',
                count: reaction.count || 0,
                iconPath: reaction.iconPath ? uri_1.URI.revive(reaction.iconPath) : '',
                authorHasReacted: reaction.hasReacted || false
            };
        }
        function convertToCollapsibleState(kind) {
            if (kind !== undefined) {
                switch (kind) {
                    case types.CommentThreadCollapsibleState.Expanded:
                        return languages.CommentThreadCollapsibleState.Expanded;
                    case types.CommentThreadCollapsibleState.Collapsed:
                        return languages.CommentThreadCollapsibleState.Collapsed;
                }
            }
            return languages.CommentThreadCollapsibleState.Collapsed;
        }
        function convertToState(kind) {
            if (kind !== undefined) {
                switch (kind) {
                    case types.CommentThreadState.Unresolved:
                        return languages.CommentThreadState.Unresolved;
                    case types.CommentThreadState.Resolved:
                        return languages.CommentThreadState.Resolved;
                }
            }
            return languages.CommentThreadState.Unresolved;
        }
        return new ExtHostCommentsImpl();
    }
    exports.$fbc = $fbc;
});
//# sourceMappingURL=extHostComments.js.map