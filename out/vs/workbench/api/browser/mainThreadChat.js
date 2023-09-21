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
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/base/common/uri", "vs/workbench/api/common/extHost.protocol", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/common/chatContributionService", "vs/workbench/contrib/chat/common/chatModel", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/services/extensions/common/extHostCustomers"], function (require, exports, async_1, event_1, lifecycle_1, marshalling_1, uri_1, extHost_protocol_1, chat_1, chatContributionService_1, chatModel_1, chatService_1, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadChat = void 0;
    let MainThreadChat = class MainThreadChat extends lifecycle_1.Disposable {
        constructor(extHostContext, _chatService, _chatWidgetService, chatContribService) {
            super();
            this._chatService = _chatService;
            this._chatWidgetService = _chatWidgetService;
            this.chatContribService = chatContribService;
            this._providerRegistrations = this._register(new lifecycle_1.DisposableMap());
            this._activeRequestProgressCallbacks = new Map();
            this._stateEmitters = new Map();
            this._responsePartHandlePool = 0;
            this._activeResponsePartPromises = new Map();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostChat);
            this._register(this._chatService.onDidPerformUserAction(e => {
                this._proxy.$onDidPerformUserAction(e);
            }));
        }
        $transferChatSession(sessionId, toWorkspace) {
            const sessionIdStr = this._chatService.getSessionId(sessionId);
            if (!sessionIdStr) {
                throw new Error(`Failed to transfer session. Unknown session provider ID: ${sessionId}`);
            }
            const widget = this._chatWidgetService.getWidgetBySessionId(sessionIdStr);
            const inputValue = widget?.inputEditor.getValue() ?? '';
            this._chatService.transferChatSession({ sessionId: sessionIdStr, inputValue: inputValue }, uri_1.URI.revive(toWorkspace));
        }
        async $registerChatProvider(handle, id) {
            const registration = this.chatContribService.registeredProviders.find(staticProvider => staticProvider.id === id);
            if (!registration) {
                throw new Error(`Provider ${id} must be declared in the package.json.`);
            }
            const unreg = this._chatService.registerProvider({
                id,
                displayName: registration.label,
                prepareSession: async (initialState, token) => {
                    const session = await this._proxy.$prepareChat(handle, initialState, token);
                    if (!session) {
                        return undefined;
                    }
                    const responderAvatarIconUri = session.responderAvatarIconUri ?
                        uri_1.URI.revive(session.responderAvatarIconUri) :
                        registration.extensionIcon;
                    const emitter = new event_1.Emitter();
                    this._stateEmitters.set(session.id, emitter);
                    return {
                        id: session.id,
                        requesterUsername: session.requesterUsername,
                        requesterAvatarIconUri: uri_1.URI.revive(session.requesterAvatarIconUri),
                        responderUsername: session.responderUsername,
                        responderAvatarIconUri,
                        inputPlaceholder: session.inputPlaceholder,
                        onDidChangeState: emitter.event,
                        dispose: () => {
                            emitter.dispose();
                            this._stateEmitters.delete(session.id);
                            this._proxy.$releaseSession(session.id);
                        }
                    };
                },
                resolveRequest: async (session, context, token) => {
                    const dto = await this._proxy.$resolveRequest(handle, session.id, context, token);
                    return {
                        session,
                        ...dto
                    };
                },
                provideReply: async (request, progress, token) => {
                    const id = `${handle}_${request.session.id}`;
                    this._activeRequestProgressCallbacks.set(id, progress);
                    try {
                        const requestDto = {
                            message: request.message,
                            variables: request.variables
                        };
                        const dto = await this._proxy.$provideReply(handle, request.session.id, requestDto, token);
                        return {
                            session: request.session,
                            ...dto
                        };
                    }
                    finally {
                        this._activeRequestProgressCallbacks.delete(id);
                    }
                },
                provideWelcomeMessage: (token) => {
                    return this._proxy.$provideWelcomeMessage(handle, token);
                },
                provideSlashCommands: (session, token) => {
                    return this._proxy.$provideSlashCommands(handle, session.id, token);
                },
                provideFollowups: (session, token) => {
                    return this._proxy.$provideFollowups(handle, session.id, token);
                },
                removeRequest: (session, requestId) => {
                    return this._proxy.$removeRequest(handle, session.id, requestId);
                }
            });
            this._providerRegistrations.set(handle, unreg);
        }
        async $acceptResponseProgress(handle, sessionId, progress, responsePartHandle) {
            const id = `${handle}_${sessionId}`;
            if ('placeholder' in progress) {
                const responsePartId = `${id}_${++this._responsePartHandlePool}`;
                const deferredContentPromise = new async_1.DeferredPromise();
                this._activeResponsePartPromises.set(responsePartId, deferredContentPromise);
                this._activeRequestProgressCallbacks.get(id)?.({ ...progress, resolvedContent: deferredContentPromise.p });
                return this._responsePartHandlePool;
            }
            else if (responsePartHandle) {
                // Complete an existing deferred promise with resolved content
                const responsePartId = `${id}_${responsePartHandle}`;
                const deferredContentPromise = this._activeResponsePartPromises.get(responsePartId);
                if (deferredContentPromise && (0, chatModel_1.isCompleteInteractiveProgressTreeData)(progress)) {
                    const withRevivedUris = (0, marshalling_1.revive)(progress);
                    deferredContentPromise.complete(withRevivedUris);
                    this._activeResponsePartPromises.delete(responsePartId);
                }
                else if (deferredContentPromise && 'content' in progress) {
                    deferredContentPromise.complete(progress.content);
                    this._activeResponsePartPromises.delete(responsePartId);
                }
                return;
            }
            // No need to support standalone tree data that's not attached to a placeholder in API
            if ((0, chatModel_1.isCompleteInteractiveProgressTreeData)(progress)) {
                return;
            }
            this._activeRequestProgressCallbacks.get(id)?.(progress);
        }
        async $acceptChatState(sessionId, state) {
            this._stateEmitters.get(sessionId)?.fire(state);
        }
        $addRequest(context) {
            this._chatService.addRequest(context);
        }
        async $sendRequestToProvider(providerId, message) {
            const widget = await this._chatWidgetService.revealViewForProvider(providerId);
            if (widget && widget.viewModel) {
                this._chatService.sendRequestToProvider(widget.viewModel.sessionId, message);
            }
        }
        async $unregisterChatProvider(handle) {
            this._providerRegistrations.deleteAndDispose(handle);
        }
    };
    exports.MainThreadChat = MainThreadChat;
    exports.MainThreadChat = MainThreadChat = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadChat),
        __param(1, chatService_1.IChatService),
        __param(2, chat_1.IChatWidgetService),
        __param(3, chatContributionService_1.IChatContributionService)
    ], MainThreadChat);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZENoYXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2Jyb3dzZXIvbWFpblRocmVhZENoYXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBZ0J6RixJQUFNLGNBQWMsR0FBcEIsTUFBTSxjQUFlLFNBQVEsc0JBQVU7UUFXN0MsWUFDQyxjQUErQixFQUNqQixZQUEyQyxFQUNyQyxrQkFBdUQsRUFDakQsa0JBQTZEO1lBRXZGLEtBQUssRUFBRSxDQUFDO1lBSnVCLGlCQUFZLEdBQVosWUFBWSxDQUFjO1lBQ3BCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7WUFDaEMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUEwQjtZQWJ2RSwyQkFBc0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUkseUJBQWEsRUFBVSxDQUFDLENBQUM7WUFDckUsb0NBQStCLEdBQUcsSUFBSSxHQUFHLEVBQTJGLENBQUM7WUFDckksbUJBQWMsR0FBRyxJQUFJLEdBQUcsRUFBd0IsQ0FBQztZQUkxRCw0QkFBdUIsR0FBRyxDQUFDLENBQUM7WUFDbkIsZ0NBQTJCLEdBQUcsSUFBSSxHQUFHLEVBQXVHLENBQUM7WUFTN0osSUFBSSxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLGlDQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFbEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUMzRCxJQUFJLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQsb0JBQW9CLENBQUMsU0FBaUIsRUFBRSxXQUEwQjtZQUNqRSxNQUFNLFlBQVksR0FB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