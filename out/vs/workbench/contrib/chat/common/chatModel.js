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
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/common/uuid", "vs/platform/log/common/log", "vs/workbench/contrib/chat/common/chatAgents"], function (require, exports, async_1, event_1, htmlContent_1, lifecycle_1, uri_1, uuid_1, log_1, chatAgents_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isCompleteInteractiveProgressTreeData = exports.ChatWelcomeMessageModel = exports.ChatModel = exports.isSerializableSessionData = exports.isExportableSessionData = exports.ChatResponseModel = exports.Response = exports.ChatRequestModel = exports.isResponse = exports.isRequest = void 0;
    function isRequest(item) {
        return !!item && typeof item.message !== 'undefined';
    }
    exports.isRequest = isRequest;
    function isResponse(item) {
        return !isRequest(item);
    }
    exports.isResponse = isResponse;
    class ChatRequestModel {
        static { this.nextId = 0; }
        get id() {
            return this._id;
        }
        get providerRequestId() {
            return this._providerRequestId;
        }
        get username() {
            return this.session.requesterUsername;
        }
        get avatarIconUri() {
            return this.session.requesterAvatarIconUri;
        }
        constructor(session, message, _providerRequestId) {
            this.session = session;
            this.message = message;
            this._providerRequestId = _providerRequestId;
            this._id = 'request_' + ChatRequestModel.nextId++;
        }
        setProviderRequestId(providerRequestId) {
            this._providerRequestId = providerRequestId;
        }
    }
    exports.ChatRequestModel = ChatRequestModel;
    class Response {
        get onDidChangeValue() {
            return this._onDidChangeValue.event;
        }
        get value() {
            return this._responseData;
        }
        constructor(value) {
            this._onDidChangeValue = new event_1.Emitter();
            this._responseData = Array.isArray(value) ? value : [value];
            this._responseParts = Array.isArray(value) ? value.map((v) => ('value' in v ? { string: v } : { treeData: v })) : [{ string: value }];
            this._responseRepr = this._responseParts.map((part) => {
                if (isCompleteInteractiveProgressTreeData(part)) {
                    return '';
                }
                return part.string.value;
            }).join('\n');
        }
        asString() {
            return this._responseRepr;
        }
        updateContent(responsePart, quiet) {
            if (typeof responsePart === 'string' || (0, htmlContent_1.isMarkdownString)(responsePart)) {
                const responsePartLength = this._responseParts.length - 1;
                const lastResponsePart = this._responseParts[responsePartLength];
                if (lastResponsePart.isPlaceholder === true || isCompleteInteractiveProgressTreeData(lastResponsePart)) {
                    // The last part is resolving or a tree data item, start a new part
                    this._responseParts.push({ string: typeof responsePart === 'string' ? new htmlContent_1.MarkdownString(responsePart) : responsePart });
                }
                else {
                    // Combine this part with the last, non-resolving string part
                    if ((0, htmlContent_1.isMarkdownString)(responsePart)) {
                        this._responseParts[responsePartLength] = { string: new htmlContent_1.MarkdownString(lastResponsePart.string.value + responsePart.value, responsePart) };
                    }
                    else {
                        this._responseParts[responsePartLength] = { string: new htmlContent_1.MarkdownString(lastResponsePart.string.value + responsePart, lastResponsePart.string) };
                    }
                }
                this._updateRepr(quiet);
            }
            else if ('placeholder' in responsePart) {
                // Add a new resolving part
                const responsePosition = this._responseParts.push({ string: new htmlContent_1.MarkdownString(responsePart.placeholder), isPlaceholder: true }) - 1;
                this._updateRepr(quiet);
                responsePart.resolvedContent?.then((content) => {
                    // Replace the resolving part's content with the resolved response
                    if (typeof content === 'string') {
                        this._responseParts[responsePosition] = { string: new htmlContent_1.MarkdownString(content), isPlaceholder: true };
                        this._updateRepr(quiet);
                    }
                    else if (content.treeData) {
                        this._responseParts[responsePosition] = { treeData: content.treeData };
                        this._updateRepr(quiet);
                    }
                });
            }
            else if (isCompleteInteractiveProgressTreeData(responsePart)) {
                this._responseParts.push(responsePart);
                this._updateRepr(quiet);
            }
        }
        _updateRepr(quiet) {
            this._responseData = this._responseParts.map(part => {
                if (isCompleteInteractiveProgressTreeData(part)) {
                    return part.treeData;
                }
                else if (part.isPlaceholder) {
                    return { ...part.string, isPlaceholder: true };
                }
                return part.string;
            });
            this._responseRepr = this._responseParts.map(part => {
                if (isCompleteInteractiveProgressTreeData(part)) {
                    return '';
                }
                return part.string.value;
            }).join('\n\n');
            if (!quiet) {
                this._onDidChangeValue.fire();
            }
        }
    }
    exports.Response = Response;
    class ChatResponseModel extends lifecycle_1.Disposable {
        static { this.nextId = 0; }
        get id() {
            return this._id;
        }
        get providerResponseId() {
            return this._providerResponseId;
        }
        get isComplete() {
            return this._isComplete;
        }
        get isCanceled() {
            return this._isCanceled;
        }
        get vote() {
            return this._vote;
        }
        get followups() {
            return this._followups;
        }
        get response() {
            return this._response;
        }
        get errorDetails() {
            return this._errorDetails;
        }
        get providerId() {
            return this.session.providerId;
        }
        get username() {
            return this.agent?.metadata.fullName ?? this.session.responderUsername;
        }
        get avatarIconUri() {
            return this.agent?.metadata.icon ?? this.session.responderAvatarIconUri;
        }
        constructor(_response, session, agent, _isComplete = false, _isCanceled = false, _vote, _providerResponseId, _errorDetails, _followups) {
            super();
            this.session = session;
            this.agent = agent;
            this._isComplete = _isComplete;
            this._isCanceled = _isCanceled;
            this._vote = _vote;
            this._providerResponseId = _providerResponseId;
            this._errorDetails = _errorDetails;
            this._followups = _followups;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._response = new Response(_response);
            this._register(this._response.onDidChangeValue(() => this._onDidChange.fire()));
            this._id = 'response_' + ChatResponseModel.nextId++;
        }
        updateContent(responsePart, quiet) {
            this._response.updateContent(responsePart, quiet);
        }
        setProviderResponseId(providerResponseId) {
            this._providerResponseId = providerResponseId;
        }
        setErrorDetails(errorDetails) {
            this._errorDetails = errorDetails;
            this._onDidChange.fire();
        }
        complete() {
            this._isComplete = true;
            this._onDidChange.fire();
        }
        cancel() {
            this._isComplete = true;
            this._isCanceled = true;
            this._onDidChange.fire();
        }
        setFollowups(followups) {
            this._followups = followups;
            this._onDidChange.fire(); // Fire so that command followups get rendered on the row
        }
        setVote(vote) {
            this._vote = vote;
            this._onDidChange.fire();
        }
    }
    exports.ChatResponseModel = ChatResponseModel;
    function isExportableSessionData(obj) {
        const data = obj;
        return typeof data === 'object' &&
            typeof data.providerId === 'string' &&
            typeof data.requesterUsername === 'string' &&
            typeof data.responderUsername === 'string';
    }
    exports.isExportableSessionData = isExportableSessionData;
    function isSerializableSessionData(obj) {
        const data = obj;
        return isExportableSessionData(obj) &&
            typeof data.creationDate === 'number' &&
            typeof data.sessionId === 'string';
    }
    exports.isSerializableSessionData = isSerializableSessionData;
    let ChatModel = class ChatModel extends lifecycle_1.Disposable {
        get session() {
            return this._session;
        }
        get welcomeMessage() {
            return this._welcomeMessage;
        }
        get providerState() {
            return this._providerState;
        }
        get sessionId() {
            return this._sessionId;
        }
        get inputPlaceholder() {
            return this._session?.inputPlaceholder;
        }
        get requestInProgress() {
            const lastRequest = this._requests[this._requests.length - 1];
            return !!lastRequest && !!lastRequest.response && !lastRequest.response.isComplete;
        }
        get creationDate() {
            return this._creationDate;
        }
        get requesterUsername() {
            return this._session?.requesterUsername ?? this.initialData?.requesterUsername ?? '';
        }
        get responderUsername() {
            return this._session?.responderUsername ?? this.initialData?.responderUsername ?? '';
        }
        get requesterAvatarIconUri() {
            return this._session?.requesterAvatarIconUri ?? this._initialRequesterAvatarIconUri;
        }
        get responderAvatarIconUri() {
            return this._session?.responderAvatarIconUri ?? this._initialResponderAvatarIconUri;
        }
        get isInitialized() {
            return this._isInitializedDeferred.isSettled;
        }
        get isImported() {
            return this._isImported;
        }
        get title() {
            const firstRequestMessage = this._requests[0]?.message;
            const message = typeof firstRequestMessage === 'string' ? firstRequestMessage : firstRequestMessage?.message ?? '';
            return message.split('\n')[0].substring(0, 50);
        }
        constructor(providerId, initialData, logService, chatAgentService) {
            super();
            this.providerId = providerId;
            this.initialData = initialData;
            this.logService = logService;
            this.chatAgentService = chatAgentService;
            this._onDidDispose = this._register(new event_1.Emitter());
            this.onDidDispose = this._onDidDispose.event;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._isInitializedDeferred = new async_1.DeferredPromise();
            this._isImported = false;
            this._isImported = (!!initialData && !isSerializableSessionData(initialData)) || (initialData?.isImported ?? false);
            this._sessionId = (isSerializableSessionData(initialData) && initialData.sessionId) || (0, uuid_1.generateUuid)();
            this._requests = initialData ? this._deserialize(initialData) : [];
            this._providerState = initialData ? initialData.providerState : undefined;
            this._creationDate = (isSerializableSessionData(initialData) && initialData.creationDate) || Date.now();
            this._initialRequesterAvatarIconUri = initialData?.requesterAvatarIconUri && uri_1.URI.revive(initialData.requesterAvatarIconUri);
            this._initialResponderAvatarIconUri = initialData?.responderAvatarIconUri && uri_1.URI.revive(initialData.responderAvatarIconUri);
        }
        _deserialize(obj) {
            const requests = obj.requests;
            if (!Array.isArray(requests)) {
                this.logService.error(`Ignoring malformed session data: ${obj}`);
                return [];
            }
            if (obj.welcomeMessage) {
                const content = obj.welcomeMessage.map(item => typeof item === 'string' ? new htmlContent_1.MarkdownString(item) : item);
                this._welcomeMessage = new ChatWelcomeMessageModel(this, content);
            }
            return requests.map((raw) => {
                const request = new ChatRequestModel(this, raw.message, raw.providerRequestId);
                if (raw.response || raw.responseErrorDetails) {
                    const agent = raw.agent && this.chatAgentService.getAgents().find(a => a.id === raw.agent.id); // TODO do something reasonable if this agent has disappeared since the last session
                    request.response = new ChatResponseModel(raw.response ?? [new htmlContent_1.MarkdownString(raw.response)], this, agent, true, raw.isCanceled, raw.vote, raw.providerRequestId, raw.responseErrorDetails, raw.followups);
                }
                return request;
            });
        }
        startReinitialize() {
            this._session = undefined;
            this._isInitializedDeferred = new async_1.DeferredPromise();
        }
        initialize(session, welcomeMessage) {
            if (this._session || this._isInitializedDeferred.isSettled) {
                throw new Error('ChatModel is already initialized');
            }
            this._session = session;
            if (!this._welcomeMessage) {
                // Could also have loaded the welcome message from persisted data
                this._welcomeMessage = welcomeMessage;
            }
            this._isInitializedDeferred.complete();
            if (session.onDidChangeState) {
                this._register(session.onDidChangeState(state => {
                    this._providerState = state;
                    this.logService.trace('ChatModel#acceptNewSessionState');
                }));
            }
            this._onDidChange.fire({ kind: 'initialize' });
        }
        setInitializationError(error) {
            if (!this._isInitializedDeferred.isSettled) {
                this._isInitializedDeferred.error(error);
            }
        }
        waitForInitialization() {
            return this._isInitializedDeferred.p;
        }
        getRequests() {
            return this._requests;
        }
        addRequest(message, chatAgent) {
            if (!this._session) {
                throw new Error('addRequest: No session');
            }
            const request = new ChatRequestModel(this, message);
            request.response = new ChatResponseModel(new htmlContent_1.MarkdownString(''), this, chatAgent);
            this._requests.push(request);
            this._onDidChange.fire({ kind: 'addRequest', request });
            return request;
        }
        acceptResponseProgress(request, progress, quiet) {
            if (!this._session) {
                throw new Error('acceptResponseProgress: No session');
            }
            if (!request.response) {
                request.response = new ChatResponseModel(new htmlContent_1.MarkdownString(''), this, undefined);
            }
            if (request.response.isComplete) {
                throw new Error('acceptResponseProgress: Adding progress to a completed response');
            }
            if ('content' in progress) {
                request.response.updateContent(progress.content, quiet);
            }
            else if ('placeholder' in progress || isCompleteInteractiveProgressTreeData(progress)) {
                request.response.updateContent(progress, quiet);
            }
            else {
                request.setProviderRequestId(progress.requestId);
                request.response.setProviderResponseId(progress.requestId);
            }
        }
        removeRequest(requestId) {
            const index = this._requests.findIndex(request => request.providerRequestId === requestId);
            const request = this._requests[index];
            if (!request.providerRequestId) {
                return;
            }
            if (index !== -1) {
                this._onDidChange.fire({ kind: 'removeRequest', requestId: request.providerRequestId, responseId: request.response?.providerResponseId });
                this._requests.splice(index, 1);
                request.response?.dispose();
            }
        }
        cancelRequest(request) {
            if (request.response) {
                request.response.cancel();
            }
        }
        setResponse(request, rawResponse) {
            if (!this._session) {
                throw new Error('completeResponse: No session');
            }
            if (!request.response) {
                request.response = new ChatResponseModel(new htmlContent_1.MarkdownString(''), this, undefined);
            }
            request.response.setErrorDetails(rawResponse.errorDetails);
        }
        completeResponse(request) {
            if (!request.response) {
                throw new Error('Call setResponse before completeResponse');
            }
            request.response.complete();
        }
        setFollowups(request, followups) {
            if (!request.response) {
                // Maybe something went wrong?
                return;
            }
            request.response.setFollowups(followups);
        }
        setResponseModel(request, response) {
            request.response = response;
            this._onDidChange.fire({ kind: 'addResponse', response });
        }
        toExport() {
            return {
                requesterUsername: this.requesterUsername,
                requesterAvatarIconUri: this.requesterAvatarIconUri,
                responderUsername: this.responderUsername,
                responderAvatarIconUri: this.responderAvatarIconUri,
                welcomeMessage: this._welcomeMessage?.content.map(c => {
                    if (Array.isArray(c)) {
                        return c;
                    }
                    else {
                        return c.value;
                    }
                }),
                requests: this._requests.map((r) => {
                    return {
                        providerRequestId: r.providerRequestId,
                        message: typeof r.message === 'string' ? r.message : r.message.message,
                        response: r.response ? r.response.response.value : undefined,
                        responseErrorDetails: r.response?.errorDetails,
                        followups: r.response?.followups,
                        isCanceled: r.response?.isCanceled,
                        vote: r.response?.vote,
                        agent: r.response?.agent ? {
                            id: r.response.agent.id,
                            description: r.response.agent.metadata.description,
                            fullName: r.response.agent.metadata.fullName,
                            icon: r.response.agent.metadata.icon
                        } : undefined,
                    };
                }),
                providerId: this.providerId,
                providerState: this._providerState
            };
        }
        toJSON() {
            return {
                ...this.toExport(),
                sessionId: this.sessionId,
                creationDate: this._creationDate,
                isImported: this._isImported
            };
        }
        dispose() {
            this._session?.dispose?.();
            this._requests.forEach(r => r.response?.dispose());
            this._onDidDispose.fire();
            if (!this._isInitializedDeferred.isSettled) {
                this._isInitializedDeferred.error(new Error('model disposed before initialization'));
            }
            super.dispose();
        }
    };
    exports.ChatModel = ChatModel;
    exports.ChatModel = ChatModel = __decorate([
        __param(2, log_1.ILogService),
        __param(3, chatAgents_1.IChatAgentService)
    ], ChatModel);
    class ChatWelcomeMessageModel {
        static { this.nextId = 0; }
        get id() {
            return this._id;
        }
        constructor(session, content) {
            this.session = session;
            this.content = content;
            this._id = 'welcome_' + ChatWelcomeMessageModel.nextId++;
        }
        get username() {
            return this.session.responderUsername;
        }
        get avatarIconUri() {
            return this.session.responderAvatarIconUri;
        }
    }
    exports.ChatWelcomeMessageModel = ChatWelcomeMessageModel;
    function isCompleteInteractiveProgressTreeData(item) {
        return typeof item === 'object' && !!item && 'treeData' in item;
    }
    exports.isCompleteInteractiveProgressTreeData = isCompleteInteractiveProgressTreeData;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdE1vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC9jb21tb24vY2hhdE1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQThDaEcsU0FBZ0IsU0FBUyxDQUFDLElBQWE7UUFDdEMsT0FBTyxDQUFDLENBQUMsSUFBSSxJQUFJLE9BQVEsSUFBMEIsQ0FBQyxPQUFPLEtBQUssV0FBVyxDQUFDO0lBQzdFLENBQUM7SUFGRCw4QkFFQztJQUVELFNBQWdCLFVBQVUsQ0FBQyxJQUFhO1FBQ3ZDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUZELGdDQUVDO0lBRUQsTUFBYSxnQkFBZ0I7aUJBQ2IsV0FBTSxHQUFHLENBQUMsQ0FBQztRQUsxQixJQUFXLEVBQUU7WUFDWixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDakIsQ0FBQztRQUVELElBQVcsaUJBQWlCO1lBQzNCLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDO1FBQ2hDLENBQUM7UUFFRCxJQUFXLFFBQVE7WUFDbEIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDO1FBQ3ZDLENBQUM7UUFFRCxJQUFXLGFBQWE7WUFDdkIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLHNCQUFzQixDQUFDO1FBQzVDLENBQUM7UUFFRCxZQUNpQixPQUFrQixFQUNsQixPQUFvQyxFQUM1QyxrQkFBMkI7WUFGbkIsWUFBTyxHQUFQLE9BQU8sQ0FBVztZQUNsQixZQUFPLEdBQVAsT0FBTyxDQUE2QjtZQUM1Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQVM7WUFDbkMsSUFBSSxDQUFDLEdBQUcsR0FBRyxVQUFVLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbkQsQ0FBQztRQUVELG9CQUFvQixDQUFDLGlCQUF5QjtZQUM3QyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsaUJBQWlCLENBQUM7UUFDN0MsQ0FBQzs7SUEvQkYsNENBZ0NDO0lBT0QsTUFBYSxRQUFRO1FBRXBCLElBQVcsZ0JBQWdCO1lBQzFCLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQztRQUNyQyxDQUFDO1FBU0QsSUFBSSxLQUFLO1lBQ1IsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQzNCLENBQUM7UUFFRCxZQUFZLEtBQWdGO1lBaEJwRixzQkFBaUIsR0FBRyxJQUFJLGVBQU8sRUFBUSxDQUFDO1lBaUIvQyxJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM1RCxJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ3RJLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDckQsSUFBSSxxQ0FBcUMsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDaEQsT0FBTyxFQUFFLENBQUM7aUJBQ1Y7Z0JBQ0QsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUMxQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDZixDQUFDO1FBRUQsUUFBUTtZQUNQLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUMzQixDQUFDO1FBRUQsYUFBYSxDQUFDLFlBQXVNLEVBQUUsS0FBZTtZQUNyTyxJQUFJLE9BQU8sWUFBWSxLQUFLLFFBQVEsSUFBSSxJQUFBLDhCQUFnQixFQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUN2RSxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztnQkFDMUQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLENBQUM7Z0JBRWpFLElBQUksZ0JBQWdCLENBQUMsYUFBYSxLQUFLLElBQUksSUFBSSxxQ0FBcUMsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO29CQUN2RyxtRUFBbUU7b0JBQ25FLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLE9BQU8sWUFBWSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSw0QkFBYyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO2lCQUN6SDtxQkFBTTtvQkFDTiw2REFBNkQ7b0JBQzdELElBQUksSUFBQSw4QkFBZ0IsRUFBQyxZQUFZLENBQUMsRUFBRTt3QkFDbkMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksNEJBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLFlBQVksQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLEVBQUUsQ0FBQztxQkFDM0k7eUJBQU07d0JBQ04sSUFBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksNEJBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO3FCQUNoSjtpQkFDRDtnQkFFRCxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3hCO2lCQUFNLElBQUksYUFBYSxJQUFJLFlBQVksRUFBRTtnQkFDekMsMkJBQTJCO2dCQUMzQixNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksNEJBQWMsQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNySSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUV4QixZQUFZLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO29CQUM5QyxrRUFBa0U7b0JBQ2xFLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFO3dCQUNoQyxJQUFJLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSSw0QkFBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsQ0FBQzt3QkFDckcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztxQkFDeEI7eUJBQU0sSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFO3dCQUM1QixJQUFJLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO3dCQUN2RSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO3FCQUN4QjtnQkFDRixDQUFDLENBQUMsQ0FBQzthQUNIO2lCQUFNLElBQUkscUNBQXFDLENBQUMsWUFBWSxDQUFDLEVBQUU7Z0JBQy9ELElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUN2QyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3hCO1FBQ0YsQ0FBQztRQUVPLFdBQVcsQ0FBQyxLQUFlO1lBQ2xDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ25ELElBQUkscUNBQXFDLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ2hELE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztpQkFDckI7cUJBQU0sSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO29CQUM5QixPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsQ0FBQztpQkFDL0M7Z0JBQ0QsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQ3BCLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDbkQsSUFBSSxxQ0FBcUMsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDaEQsT0FBTyxFQUFFLENBQUM7aUJBQ1Y7Z0JBQ0QsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUMxQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFaEIsSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDWCxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLENBQUM7YUFDOUI7UUFDRixDQUFDO0tBQ0Q7SUE1RkQsNEJBNEZDO0lBRUQsTUFBYSxpQkFBa0IsU0FBUSxzQkFBVTtpQkFJakMsV0FBTSxHQUFHLENBQUMsQUFBSixDQUFLO1FBRzFCLElBQVcsRUFBRTtZQUNaLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUNqQixDQUFDO1FBRUQsSUFBVyxrQkFBa0I7WUFDNUIsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUM7UUFDakMsQ0FBQztRQUVELElBQVcsVUFBVTtZQUNwQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDekIsQ0FBQztRQUVELElBQVcsVUFBVTtZQUNwQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDekIsQ0FBQztRQUVELElBQVcsSUFBSTtZQUNkLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNuQixDQUFDO1FBRUQsSUFBVyxTQUFTO1lBQ25CLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUN4QixDQUFDO1FBR0QsSUFBVyxRQUFRO1lBQ2xCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUN2QixDQUFDO1FBRUQsSUFBVyxZQUFZO1lBQ3RCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUMzQixDQUFDO1FBRUQsSUFBVyxVQUFVO1lBQ3BCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUM7UUFDaEMsQ0FBQztRQUVELElBQVcsUUFBUTtZQUNsQixPQUFPLElBQUksQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDO1FBQ3hFLENBQUM7UUFFRCxJQUFXLGFBQWE7WUFDdkIsT0FBTyxJQUFJLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQztRQUN6RSxDQUFDO1FBRUQsWUFDQyxTQUFvRixFQUNwRSxPQUFrQixFQUNsQixLQUFpQyxFQUN6QyxjQUF1QixLQUFLLEVBQzVCLGNBQWMsS0FBSyxFQUNuQixLQUF1QyxFQUN2QyxtQkFBNEIsRUFDNUIsYUFBeUMsRUFDekMsVUFBNEI7WUFFcEMsS0FBSyxFQUFFLENBQUM7WUFUUSxZQUFPLEdBQVAsT0FBTyxDQUFXO1lBQ2xCLFVBQUssR0FBTCxLQUFLLENBQTRCO1lBQ3pDLGdCQUFXLEdBQVgsV0FBVyxDQUFpQjtZQUM1QixnQkFBVyxHQUFYLFdBQVcsQ0FBUTtZQUNuQixVQUFLLEdBQUwsS0FBSyxDQUFrQztZQUN2Qyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQVM7WUFDNUIsa0JBQWEsR0FBYixhQUFhLENBQTRCO1lBQ3pDLGVBQVUsR0FBVixVQUFVLENBQWtCO1lBNURwQixpQkFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQzNELGdCQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7WUE4RDlDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2hGLElBQUksQ0FBQyxHQUFHLEdBQUcsV0FBVyxHQUFHLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3JELENBQUM7UUFFRCxhQUFhLENBQUMsWUFBeU4sRUFBRSxLQUFlO1lBQ3ZQLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBRUQscUJBQXFCLENBQUMsa0JBQTBCO1lBQy9DLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxrQkFBa0IsQ0FBQztRQUMvQyxDQUFDO1FBRUQsZUFBZSxDQUFDLFlBQXdDO1lBQ3ZELElBQUksQ0FBQyxhQUFhLEdBQUcsWUFBWSxDQUFDO1lBQ2xDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVELFFBQVE7WUFDUCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztZQUN4QixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFRCxNQUFNO1lBQ0wsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7WUFDeEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7WUFDeEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBRUQsWUFBWSxDQUFDLFNBQXNDO1lBQ2xELElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1lBQzVCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyx5REFBeUQ7UUFDcEYsQ0FBQztRQUVELE9BQU8sQ0FBQyxJQUFxQztZQUM1QyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUNsQixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzFCLENBQUM7O0lBckdGLDhDQXNHQztJQXdERCxTQUFnQix1QkFBdUIsQ0FBQyxHQUFZO1FBQ25ELE1BQU0sSUFBSSxHQUFHLEdBQTBCLENBQUM7UUFDeEMsT0FBTyxPQUFPLElBQUksS0FBSyxRQUFRO1lBQzlCLE9BQU8sSUFBSSxDQUFDLFVBQVUsS0FBSyxRQUFRO1lBQ25DLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixLQUFLLFFBQVE7WUFDMUMsT0FBTyxJQUFJLENBQUMsaUJBQWlCLEtBQUssUUFBUSxDQUFDO0lBQzdDLENBQUM7SUFORCwwREFNQztJQUVELFNBQWdCLHlCQUF5QixDQUFDLEdBQVk7UUFDckQsTUFBTSxJQUFJLEdBQUcsR0FBNEIsQ0FBQztRQUMxQyxPQUFPLHVCQUF1QixDQUFDLEdBQUcsQ0FBQztZQUNsQyxPQUFPLElBQUksQ0FBQyxZQUFZLEtBQUssUUFBUTtZQUNyQyxPQUFPLElBQUksQ0FBQyxTQUFTLEtBQUssUUFBUSxDQUFDO0lBQ3JDLENBQUM7SUFMRCw4REFLQztJQXdCTSxJQUFNLFNBQVMsR0FBZixNQUFNLFNBQVUsU0FBUSxzQkFBVTtRQVd4QyxJQUFJLE9BQU87WUFDVixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDdEIsQ0FBQztRQUdELElBQUksY0FBYztZQUNqQixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUM7UUFDN0IsQ0FBQztRQUdELElBQUksYUFBYTtZQUNoQixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDNUIsQ0FBQztRQUtELElBQUksU0FBUztZQUNaLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUN4QixDQUFDO1FBRUQsSUFBSSxnQkFBZ0I7WUFDbkIsT0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLGdCQUFnQixDQUFDO1FBQ3hDLENBQUM7UUFFRCxJQUFJLGlCQUFpQjtZQUNwQixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzlELE9BQU8sQ0FBQyxDQUFDLFdBQVcsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLFFBQVEsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDO1FBQ3BGLENBQUM7UUFHRCxJQUFJLFlBQVk7WUFDZixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDM0IsQ0FBQztRQUVELElBQUksaUJBQWlCO1lBQ3BCLE9BQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxpQkFBaUIsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLGlCQUFpQixJQUFJLEVBQUUsQ0FBQztRQUN0RixDQUFDO1FBRUQsSUFBSSxpQkFBaUI7WUFDcEIsT0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLGlCQUFpQixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsaUJBQWlCLElBQUksRUFBRSxDQUFDO1FBQ3RGLENBQUM7UUFHRCxJQUFJLHNCQUFzQjtZQUN6QixPQUFPLElBQUksQ0FBQyxRQUFRLEVBQUUsc0JBQXNCLElBQUksSUFBSSxDQUFDLDhCQUE4QixDQUFDO1FBQ3JGLENBQUM7UUFHRCxJQUFJLHNCQUFzQjtZQUN6QixPQUFPLElBQUksQ0FBQyxRQUFRLEVBQUUsc0JBQXNCLElBQUksSUFBSSxDQUFDLDhCQUE4QixDQUFDO1FBQ3JGLENBQUM7UUFFRCxJQUFJLGFBQWE7WUFDaEIsT0FBTyxJQUFJLENBQUMsc0JBQXNCLENBQUMsU0FBUyxDQUFDO1FBQzlDLENBQUM7UUFHRCxJQUFJLFVBQVU7WUFDYixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDekIsQ0FBQztRQUVELElBQUksS0FBSztZQUNSLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUM7WUFDdkQsTUFBTSxPQUFPLEdBQUcsT0FBTyxtQkFBbUIsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxPQUFPLElBQUksRUFBRSxDQUFDO1lBQ25ILE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFFRCxZQUNpQixVQUFrQixFQUNqQixXQUFvRSxFQUN4RSxVQUF3QyxFQUNsQyxnQkFBb0Q7WUFFdkUsS0FBSyxFQUFFLENBQUM7WUFMUSxlQUFVLEdBQVYsVUFBVSxDQUFRO1lBQ2pCLGdCQUFXLEdBQVgsV0FBVyxDQUF5RDtZQUN2RCxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ2pCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFsRnZELGtCQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDNUQsaUJBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQztZQUVoQyxpQkFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQW9CLENBQUMsQ0FBQztZQUN2RSxnQkFBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBR3ZDLDJCQUFzQixHQUFHLElBQUksdUJBQWUsRUFBUSxDQUFDO1lBNERyRCxnQkFBVyxHQUFHLEtBQUssQ0FBQztZQW1CM0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQyxXQUFXLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsSUFBSSxLQUFLLENBQUMsQ0FBQztZQUNwSCxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMseUJBQXlCLENBQUMsV0FBVyxDQUFDLElBQUksV0FBVyxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUEsbUJBQVksR0FBRSxDQUFDO1lBQ3RHLElBQUksQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDbkUsSUFBSSxDQUFDLGNBQWMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUMxRSxJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMseUJBQXlCLENBQUMsV0FBVyxDQUFDLElBQUksV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUV4RyxJQUFJLENBQUMsOEJBQThCLEdBQUcsV0FBVyxFQUFFLHNCQUFzQixJQUFJLFNBQUcsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDLENBQUM7WUFDNUgsSUFBSSxDQUFDLDhCQUE4QixHQUFHLFdBQVcsRUFBRSxzQkFBc0IsSUFBSSxTQUFHLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQzdILENBQUM7UUFFTyxZQUFZLENBQUMsR0FBd0I7WUFDNUMsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQztZQUM5QixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDN0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsb0NBQW9DLEdBQUcsRUFBRSxDQUFDLENBQUM7Z0JBQ2pFLE9BQU8sRUFBRSxDQUFDO2FBQ1Y7WUFFRCxJQUFJLEdBQUcsQ0FBQyxjQUFjLEVBQUU7Z0JBQ3ZCLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxJQUFJLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLDRCQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMzRyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksdUJBQXVCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2FBQ2xFO1lBRUQsT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBaUMsRUFBRSxFQUFFO2dCQUN6RCxNQUFNLE9BQU8sR0FBRyxJQUFJLGdCQUFnQixDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUMvRSxJQUFJLEdBQUcsQ0FBQyxRQUFRLElBQUksR0FBRyxDQUFDLG9CQUFvQixFQUFFO29CQUM3QyxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxLQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxvRkFBb0Y7b0JBQ3BMLE9BQU8sQ0FBQyxRQUFRLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLENBQUMsSUFBSSw0QkFBYyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLG9CQUFvQixFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztpQkFDMU07Z0JBQ0QsT0FBTyxPQUFPLENBQUM7WUFDaEIsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsaUJBQWlCO1lBQ2hCLElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDO1lBQzFCLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLHVCQUFlLEVBQVEsQ0FBQztRQUMzRCxDQUFDO1FBRUQsVUFBVSxDQUFDLE9BQWMsRUFBRSxjQUFtRDtZQUM3RSxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLHNCQUFzQixDQUFDLFNBQVMsRUFBRTtnQkFDM0QsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO2FBQ3BEO1lBRUQsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7WUFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUU7Z0JBQzFCLGlFQUFpRTtnQkFDakUsSUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7YUFDdEM7WUFFRCxJQUFJLENBQUMsc0JBQXNCLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFdkMsSUFBSSxPQUFPLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQzdCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUMvQyxJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztvQkFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsaUNBQWlDLENBQUMsQ0FBQztnQkFDMUQsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNKO1lBQ0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQztRQUNoRCxDQUFDO1FBRUQsc0JBQXNCLENBQUMsS0FBWTtZQUNsQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFNBQVMsRUFBRTtnQkFDM0MsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUN6QztRQUNGLENBQUM7UUFFRCxxQkFBcUI7WUFDcEIsT0FBTyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFFRCxXQUFXO1lBQ1YsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ3ZCLENBQUM7UUFFRCxVQUFVLENBQUMsT0FBb0MsRUFBRSxTQUEwQjtZQUMxRSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDbkIsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO2FBQzFDO1lBRUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDcEQsT0FBTyxDQUFDLFFBQVEsR0FBRyxJQUFJLGlCQUFpQixDQUFDLElBQUksNEJBQWMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFFbEYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDN0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDeEQsT0FBTyxPQUFPLENBQUM7UUFDaEIsQ0FBQztRQUVELHNCQUFzQixDQUFDLE9BQXlCLEVBQUUsUUFBdUIsRUFBRSxLQUFlO1lBQ3pGLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNuQixNQUFNLElBQUksS0FBSyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7YUFDdEQ7WUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRTtnQkFDdEIsT0FBTyxDQUFDLFFBQVEsR0FBRyxJQUFJLGlCQUFpQixDQUFDLElBQUksNEJBQWMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7YUFDbEY7WUFFRCxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFO2dCQUNoQyxNQUFNLElBQUksS0FBSyxDQUFDLGlFQUFpRSxDQUFDLENBQUM7YUFDbkY7WUFFRCxJQUFJLFNBQVMsSUFBSSxRQUFRLEVBQUU7Z0JBQzFCLE9BQU8sQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDeEQ7aUJBQU0sSUFBSSxhQUFhLElBQUksUUFBUSxJQUFJLHFDQUFxQyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUN4RixPQUFPLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDaEQ7aUJBQU07Z0JBQ04sT0FBTyxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDakQsT0FBTyxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDM0Q7UUFDRixDQUFDO1FBRUQsYUFBYSxDQUFDLFNBQWlCO1lBQzlCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLGlCQUFpQixLQUFLLFNBQVMsQ0FBQyxDQUFDO1lBQzNGLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRTtnQkFDL0IsT0FBTzthQUNQO1lBRUQsSUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQ2pCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLGlCQUFpQixFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFLGtCQUFrQixFQUFFLENBQUMsQ0FBQztnQkFDMUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNoQyxPQUFPLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDO2FBQzVCO1FBQ0YsQ0FBQztRQUVELGFBQWEsQ0FBQyxPQUF5QjtZQUN0QyxJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUU7Z0JBQ3JCLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7YUFDMUI7UUFDRixDQUFDO1FBRUQsV0FBVyxDQUFDLE9BQXlCLEVBQUUsV0FBMEI7WUFDaEUsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ25CLE1BQU0sSUFBSSxLQUFLLENBQUMsOEJBQThCLENBQUMsQ0FBQzthQUNoRDtZQUVELElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFO2dCQUN0QixPQUFPLENBQUMsUUFBUSxHQUFHLElBQUksaUJBQWlCLENBQUMsSUFBSSw0QkFBYyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQzthQUNsRjtZQUVELE9BQU8sQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM1RCxDQUFDO1FBRUQsZ0JBQWdCLENBQUMsT0FBeUI7WUFDekMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUU7Z0JBQ3RCLE1BQU0sSUFBSSxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQzthQUM1RDtZQUVELE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDN0IsQ0FBQztRQUVELFlBQVksQ0FBQyxPQUF5QixFQUFFLFNBQXNDO1lBQzdFLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFO2dCQUN0Qiw4QkFBOEI7Z0JBQzlCLE9BQU87YUFDUDtZQUVELE9BQU8sQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzFDLENBQUM7UUFFRCxnQkFBZ0IsQ0FBQyxPQUF5QixFQUFFLFFBQTJCO1lBQ3RFLE9BQU8sQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1lBQzVCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQzNELENBQUM7UUFFRCxRQUFRO1lBQ1AsT0FBTztnQkFDTixpQkFBaUIsRUFBRSxJQUFJLENBQUMsaUJBQWlCO2dCQUN6QyxzQkFBc0IsRUFBRSxJQUFJLENBQUMsc0JBQXNCO2dCQUNuRCxpQkFBaUIsRUFBRSxJQUFJLENBQUMsaUJBQWlCO2dCQUN6QyxzQkFBc0IsRUFBRSxJQUFJLENBQUMsc0JBQXNCO2dCQUNuRCxjQUFjLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUNyRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7d0JBQ3JCLE9BQU8sQ0FBQyxDQUFDO3FCQUNUO3lCQUFNO3dCQUNOLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQztxQkFDZjtnQkFDRixDQUFDLENBQUM7Z0JBQ0YsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFnQyxFQUFFO29CQUNoRSxPQUFPO3dCQUNOLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxpQkFBaUI7d0JBQ3RDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxPQUFPLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU87d0JBQ3RFLFFBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVM7d0JBQzVELG9CQUFvQixFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsWUFBWTt3QkFDOUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsU0FBUzt3QkFDaEMsVUFBVSxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsVUFBVTt3QkFDbEMsSUFBSSxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsSUFBSTt3QkFDdEIsS0FBSyxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQzs0QkFDMUIsRUFBRSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7NEJBQ3ZCLFdBQVcsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsV0FBVzs0QkFDbEQsUUFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFROzRCQUM1QyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUk7eUJBQ3BDLENBQUMsQ0FBQyxDQUFDLFNBQVM7cUJBQ2IsQ0FBQztnQkFDSCxDQUFDLENBQUM7Z0JBQ0YsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO2dCQUMzQixhQUFhLEVBQUUsSUFBSSxDQUFDLGNBQWM7YUFDbEMsQ0FBQztRQUNILENBQUM7UUFFRCxNQUFNO1lBQ0wsT0FBTztnQkFDTixHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2xCLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUztnQkFDekIsWUFBWSxFQUFFLElBQUksQ0FBQyxhQUFhO2dCQUNoQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFdBQVc7YUFDNUIsQ0FBQztRQUNILENBQUM7UUFFUSxPQUFPO1lBQ2YsSUFBSSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDO1lBQzNCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDMUIsSUFBSSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxTQUFTLEVBQUU7Z0JBQzNDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsc0NBQXNDLENBQUMsQ0FBQyxDQUFDO2FBQ3JGO1lBRUQsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUM7S0FDRCxDQUFBO0lBaFRZLDhCQUFTO3dCQUFULFNBQVM7UUFrRm5CLFdBQUEsaUJBQVcsQ0FBQTtRQUNYLFdBQUEsOEJBQWlCLENBQUE7T0FuRlAsU0FBUyxDQWdUckI7SUFZRCxNQUFhLHVCQUF1QjtpQkFDcEIsV0FBTSxHQUFHLENBQUMsQ0FBQztRQUcxQixJQUFXLEVBQUU7WUFDWixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDakIsQ0FBQztRQUVELFlBQ2tCLE9BQWtCLEVBQ25CLE9BQXFDO1lBRHBDLFlBQU8sR0FBUCxPQUFPLENBQVc7WUFDbkIsWUFBTyxHQUFQLE9BQU8sQ0FBOEI7WUFFckQsSUFBSSxDQUFDLEdBQUcsR0FBRyxVQUFVLEdBQUcsdUJBQXVCLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDMUQsQ0FBQztRQUVELElBQVcsUUFBUTtZQUNsQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUM7UUFDdkMsQ0FBQztRQUVELElBQVcsYUFBYTtZQUN2QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUM7UUFDNUMsQ0FBQzs7SUFyQkYsMERBc0JDO0lBRUQsU0FBZ0IscUNBQXFDLENBQUMsSUFBYTtRQUNsRSxPQUFPLE9BQU8sSUFBSSxLQUFLLFFBQVEsSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLFVBQVUsSUFBSSxJQUFJLENBQUM7SUFDakUsQ0FBQztJQUZELHNGQUVDIn0=