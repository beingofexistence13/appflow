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
    exports.createExtHostComments = void 0;
    function createExtHostComments(mainContext, commands, documents) {
        const proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadComments);
        class ExtHostCommentsImpl {
            static { this.handlePool = 0; }
            constructor() {
                this._commentControllers = new Map();
                this._commentControllersByExtension = new extensions_1.ExtensionIdentifierMap();
                commands.registerArgumentProcessor({
                    processArgument: arg => {
                        if (arg && arg.$mid === 6 /* MarshalledId.CommentController */) {
                            const commentController = this._commentControllers.get(arg.handle);
                            if (!commentController) {
                                return arg;
                            }
                            return commentController.value;
                        }
                        else if (arg && arg.$mid === 7 /* MarshalledId.CommentThread */) {
                            const commentController = this._commentControllers.get(arg.commentControlHandle);
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
                            const commentController = this._commentControllers.get(arg.thread.commentControlHandle);
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
                            const commentController = this._commentControllers.get(arg.thread.commentControlHandle);
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
                            const commentController = this._commentControllers.get(arg.thread.commentControlHandle);
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
                                comment.body = new types.MarkdownString(body);
                            }
                            return comment;
                        }
                        return arg;
                    }
                });
            }
            createCommentController(extension, id, label) {
                const handle = ExtHostCommentsImpl.handlePool++;
                const commentController = new ExtHostCommentController(extension, handle, id, label);
                this._commentControllers.set(commentController.handle, commentController);
                const commentControllers = this._commentControllersByExtension.get(extension.identifier) || [];
                commentControllers.push(commentController);
                this._commentControllersByExtension.set(extension.identifier, commentControllers);
                return commentController.value;
            }
            $createCommentThreadTemplate(commentControllerHandle, uriComponents, range) {
                const commentController = this._commentControllers.get(commentControllerHandle);
                if (!commentController) {
                    return;
                }
                commentController.$createCommentThreadTemplate(uriComponents, range);
            }
            async $updateCommentThreadTemplate(commentControllerHandle, threadHandle, range) {
                const commentController = this._commentControllers.get(commentControllerHandle);
                if (!commentController) {
                    return;
                }
                commentController.$updateCommentThreadTemplate(threadHandle, range);
            }
            $deleteCommentThread(commentControllerHandle, commentThreadHandle) {
                const commentController = this._commentControllers.get(commentControllerHandle);
                commentController?.$deleteCommentThread(commentThreadHandle);
            }
            $provideCommentingRanges(commentControllerHandle, uriComponents, token) {
                const commentController = this._commentControllers.get(commentControllerHandle);
                if (!commentController || !commentController.commentingRangeProvider) {
                    return Promise.resolve(undefined);
                }
                const document = documents.getDocument(uri_1.URI.revive(uriComponents));
                return (0, async_1.asPromise)(async () => {
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
                const commentController = this._commentControllers.get(commentControllerHandle);
                if (!commentController || !commentController.reactionHandler) {
                    return Promise.resolve(undefined);
                }
                return (0, async_1.asPromise)(() => {
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
            static { this._handlePool = 0; }
            set threadId(id) {
                this._id = id;
            }
            get threadId() {
                return this._id;
            }
            get id() {
                return this._id;
            }
            get resource() {
                return this._uri;
            }
            get uri() {
                return this._uri;
            }
            set range(range) {
                if (((range === undefined) !== (this._range === undefined)) || (!range || !this._range || !range.isEqual(this._range))) {
                    this._range = range;
                    this.modifications.range = range;
                    this._onDidUpdateCommentThread.fire();
                }
            }
            get range() {
                return this._range;
            }
            set canReply(state) {
                if (this._canReply !== state) {
                    this._canReply = state;
                    this.modifications.canReply = state;
                    this._onDidUpdateCommentThread.fire();
                }
            }
            get canReply() {
                return this._canReply;
            }
            get label() {
                return this._label;
            }
            set label(label) {
                this._label = label;
                this.modifications.label = label;
                this._onDidUpdateCommentThread.fire();
            }
            get contextValue() {
                return this._contextValue;
            }
            set contextValue(context) {
                this._contextValue = context;
                this.modifications.contextValue = context;
                this._onDidUpdateCommentThread.fire();
            }
            get comments() {
                return this._comments;
            }
            set comments(newComments) {
                this._comments = newComments;
                this.modifications.comments = newComments;
                this._onDidUpdateCommentThread.fire();
            }
            get collapsibleState() {
                return this._collapseState;
            }
            set collapsibleState(newState) {
                this._collapseState = newState;
                this.modifications.collapsibleState = newState;
                this._onDidUpdateCommentThread.fire();
            }
            get state() {
                return this._state;
            }
            set state(newState) {
                this._state = newState;
                this.modifications.state = newState;
                this._onDidUpdateCommentThread.fire();
            }
            get isDisposed() {
                return this._isDiposed;
            }
            constructor(commentControllerId, _commentControllerHandle, _id, _uri, _range, _comments, extensionDescription, _isTemplate) {
                this._commentControllerHandle = _commentControllerHandle;
                this._id = _id;
                this._uri = _uri;
                this._range = _range;
                this._comments = _comments;
                this.extensionDescription = extensionDescription;
                this._isTemplate = _isTemplate;
                this.handle = ExtHostCommentThread._handlePool++;
                this.commentHandle = 0;
                this.modifications = Object.create(null);
                this._onDidUpdateCommentThread = new event_1.Emitter();
                this.onDidUpdateCommentThread = this._onDidUpdateCommentThread.event;
                this._canReply = true;
                this._commentsMap = new Map();
                this._acceptInputDisposables = new lifecycle_1.MutableDisposable();
                this._acceptInputDisposables.value = new lifecycle_1.DisposableStore();
                if (this._id === undefined) {
                    this._id = `${commentControllerId}.${this.handle}`;
                }
                proxy.$createCommentThread(_commentControllerHandle, this.handle, this._id, this._uri, extHostTypeConverter.Range.from(this._range), extensionDescription.identifier, this._isTemplate);
                this._localDisposables = [];
                this._isDiposed = false;
                this._localDisposables.push(this.onDidUpdateCommentThread(() => {
                    this.eventuallyUpdateCommentThread();
                }));
                // set up comments after ctor to batch update events.
                this.comments = _comments;
                this._localDisposables.push({
                    dispose: () => {
                        proxy.$deleteCommentThread(_commentControllerHandle, this.handle);
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
            updateIsTemplate() {
                if (this._isTemplate) {
                    this._isTemplate = false;
                    this.modifications.isTemplate = false;
                }
            }
            eventuallyUpdateCommentThread() {
                if (this._isDiposed) {
                    return;
                }
                this.updateIsTemplate();
                if (!this._acceptInputDisposables.value) {
                    this._acceptInputDisposables.value = new lifecycle_1.DisposableStore();
                }
                const modified = (value) => Object.prototype.hasOwnProperty.call(this.modifications, value);
                const formattedModifications = {};
                if (modified('range')) {
                    formattedModifications.range = extHostTypeConverter.Range.from(this._range);
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
                        this._comments.map(cmt => convertToDTOComment(this, cmt, this._commentsMap, this.extensionDescription));
                }
                if (modified('collapsibleState')) {
                    formattedModifications.collapseState = convertToCollapsibleState(this._collapseState);
                }
                if (modified('canReply')) {
                    formattedModifications.canReply = this.canReply;
                }
                if (modified('state')) {
                    formattedModifications.state = convertToState(this._state);
                }
                if (modified('isTemplate')) {
                    formattedModifications.isTemplate = this._isTemplate;
                }
                this.modifications = {};
                proxy.$updateCommentThread(this._commentControllerHandle, this.handle, this._id, this._uri, formattedModifications);
            }
            getCommentByUniqueId(uniqueId) {
                for (const key of this._commentsMap) {
                    const comment = key[0];
                    const id = key[1];
                    if (uniqueId === id) {
                        return comment;
                    }
                }
                return;
            }
            dispose() {
                this._isDiposed = true;
                this._acceptInputDisposables.dispose();
                this._localDisposables.forEach(disposable => disposable.dispose());
            }
        }
        __decorate([
            (0, decorators_1.debounce)(100)
        ], ExtHostCommentThread.prototype, "eventuallyUpdateCommentThread", null);
        class ExtHostCommentController {
            get id() {
                return this._id;
            }
            get label() {
                return this._label;
            }
            get handle() {
                return this._handle;
            }
            get commentingRangeProvider() {
                return this._commentingRangeProvider;
            }
            set commentingRangeProvider(provider) {
                this._commentingRangeProvider = provider;
                proxy.$updateCommentingRanges(this.handle);
            }
            get reactionHandler() {
                return this._reactionHandler;
            }
            set reactionHandler(handler) {
                this._reactionHandler = handler;
                proxy.$updateCommentControllerFeatures(this.handle, { reactionHandler: !!handler });
            }
            get options() {
                return this._options;
            }
            set options(options) {
                this._options = options;
                proxy.$updateCommentControllerFeatures(this.handle, { options: this._options });
            }
            constructor(_extension, _handle, _id, _label) {
                this._extension = _extension;
                this._handle = _handle;
                this._id = _id;
                this._label = _label;
                this._threads = new Map();
                proxy.$registerCommentController(this.handle, _id, _label, this._extension.identifier.value);
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
                this._localDisposables = [];
                this._localDisposables.push({
                    dispose: () => {
                        proxy.$unregisterCommentController(this.handle);
                    }
                });
            }
            createCommentThread(resource, range, comments) {
                if (range === undefined) {
                    (0, extensions_2.checkProposedApiEnabled)(this._extension, 'fileComments');
                }
                const commentThread = new ExtHostCommentThread(this.id, this.handle, undefined, resource, range, comments, this._extension, false);
                this._threads.set(commentThread.handle, commentThread);
                return commentThread;
            }
            $createCommentThreadTemplate(uriComponents, range) {
                const commentThread = new ExtHostCommentThread(this.id, this.handle, undefined, uri_1.URI.revive(uriComponents), extHostTypeConverter.Range.to(range), [], this._extension, true);
                commentThread.collapsibleState = languages.CommentThreadCollapsibleState.Expanded;
                this._threads.set(commentThread.handle, commentThread);
                return commentThread;
            }
            $updateCommentThreadTemplate(threadHandle, range) {
                const thread = this._threads.get(threadHandle);
                if (thread) {
                    thread.range = extHostTypeConverter.Range.to(range);
                }
            }
            $deleteCommentThread(threadHandle) {
                const thread = this._threads.get(threadHandle);
                thread?.dispose();
                this._threads.delete(threadHandle);
            }
            getCommentThread(handle) {
                return this._threads.get(handle);
            }
            dispose() {
                this._threads.forEach(value => {
                    value.dispose();
                });
                this._localDisposables.forEach(disposable => disposable.dispose());
            }
        }
        function convertToDTOComment(thread, vscodeComment, commentsMap, extension) {
            let commentUniqueId = commentsMap.get(vscodeComment);
            if (!commentUniqueId) {
                commentUniqueId = ++thread.commentHandle;
                commentsMap.set(vscodeComment, commentUniqueId);
            }
            if (vscodeComment.state !== undefined) {
                (0, extensions_2.checkProposedApiEnabled)(extension, 'commentsDraftState');
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
                iconPath: reaction.iconPath ? extHostTypeConverter.pathOrURIToURI(reaction.iconPath) : undefined,
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
    exports.createExtHostComments = createExtHostComments;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdENvbW1lbnRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdENvbW1lbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7OztJQTBCaEcsU0FBZ0IscUJBQXFCLENBQUMsV0FBeUIsRUFBRSxRQUF5QixFQUFFLFNBQTJCO1FBQ3RILE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsOEJBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBRW5FLE1BQU0sbUJBQW1CO3FCQUVULGVBQVUsR0FBRyxDQUFDLEFBQUosQ0FBSztZQVE5QjtnQkFMUSx3QkFBbUIsR0FBa0QsSUFBSSxHQUFHLEVBQTRDLENBQUM7Z0JBRXpILG1DQUE4QixHQUF1RCxJQUFJLG1DQUFzQixFQUE4QixDQUFDO2dCQUtySixRQUFRLENBQUMseUJBQXlCLENBQUM7b0JBQ2xDLGVBQWUsRUFBRSxHQUFHLENBQUMsRUFBRTt3QkFDdEIsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksMkNBQW1DLEVBQUU7NEJBQ3ZELE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7NEJBRW5FLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtnQ0FDdkIsT0FBTyxHQUFHLENBQUM7NkJBQ1g7NEJBRUQsT0FBTyxpQkFBaUIsQ0FBQyxLQUFLLENBQUM7eUJBQy9COzZCQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLHVDQUErQixFQUFFOzRCQUMxRCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUM7NEJBRWpGLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtn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