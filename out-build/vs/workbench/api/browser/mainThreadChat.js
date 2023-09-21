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
    exports.$gsb = void 0;
    let $gsb = class $gsb extends lifecycle_1.$kc {
        constructor(extHostContext, j, m, n) {
            super();
            this.j = j;
            this.m = m;
            this.n = n;
            this.a = this.B(new lifecycle_1.$sc());
            this.b = new Map();
            this.c = new Map();
            this.g = 0;
            this.h = new Map();
            this.f = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostChat);
            this.B(this.j.onDidPerformUserAction(e => {
                this.f.$onDidPerformUserAction(e);
            }));
        }
        $transferChatSession(sessionId, toWorkspace) {
            const sessionIdStr = this.j.getSessionId(sessionId);
            if (!sessionIdStr) {
                throw new Error(`Failed to transfer session. Unknown session provider ID: ${sessionId}`);
            }
            const widget = this.m.getWidgetBySessionId(sessionIdStr);
            const inputValue = widget?.inputEditor.getValue() ?? '';
            this.j.transferChatSession({ sessionId: sessionIdStr, inputValue: inputValue }, uri_1.URI.revive(toWorkspace));
        }
        async $registerChatProvider(handle, id) {
            const registration = this.n.registeredProviders.find(staticProvider => staticProvider.id === id);
            if (!registration) {
                throw new Error(`Provider ${id} must be declared in the package.json.`);
            }
            const unreg = this.j.registerProvider({
                id,
                displayName: registration.label,
                prepareSession: async (initialState, token) => {
                    const session = await this.f.$prepareChat(handle, initialState, token);
                    if (!session) {
                        return undefined;
                    }
                    const responderAvatarIconUri = session.responderAvatarIconUri ?
                        uri_1.URI.revive(session.responderAvatarIconUri) :
                        registration.extensionIcon;
                    const emitter = new event_1.$fd();
                    this.c.set(session.id, emitter);
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
                            this.c.delete(session.id);
                            this.f.$releaseSession(session.id);
                        }
                    };
                },
                resolveRequest: async (session, context, token) => {
                    const dto = await this.f.$resolveRequest(handle, session.id, context, token);
                    return {
                        session,
                        ...dto
                    };
                },
                provideReply: async (request, progress, token) => {
                    const id = `${handle}_${request.session.id}`;
                    this.b.set(id, progress);
                    try {
                        const requestDto = {
                            message: request.message,
                            variables: request.variables
                        };
                        const dto = await this.f.$provideReply(handle, request.session.id, requestDto, token);
                        return {
                            session: request.session,
                            ...dto
                        };
                    }
                    finally {
                        this.b.delete(id);
                    }
                },
                provideWelcomeMessage: (token) => {
                    return this.f.$provideWelcomeMessage(handle, token);
                },
                provideSlashCommands: (session, token) => {
                    return this.f.$provideSlashCommands(handle, session.id, token);
                },
                provideFollowups: (session, token) => {
                    return this.f.$provideFollowups(handle, session.id, token);
                },
                removeRequest: (session, requestId) => {
                    return this.f.$removeRequest(handle, session.id, requestId);
                }
            });
            this.a.set(handle, unreg);
        }
        async $acceptResponseProgress(handle, sessionId, progress, responsePartHandle) {
            const id = `${handle}_${sessionId}`;
            if ('placeholder' in progress) {
                const responsePartId = `${id}_${++this.g}`;
                const deferredContentPromise = new async_1.$2g();
                this.h.set(responsePartId, deferredContentPromise);
                this.b.get(id)?.({ ...progress, resolvedContent: deferredContentPromise.p });
                return this.g;
            }
            else if (responsePartHandle) {
                // Complete an existing deferred promise with resolved content
                const responsePartId = `${id}_${responsePartHandle}`;
                const deferredContentPromise = this.h.get(responsePartId);
                if (deferredContentPromise && (0, chatModel_1.$CH)(progress)) {
                    const withRevivedUris = (0, marshalling_1.$$g)(progress);
                    deferredContentPromise.complete(withRevivedUris);
                    this.h.delete(responsePartId);
                }
                else if (deferredContentPromise && 'content' in progress) {
                    deferredContentPromise.complete(progress.content);
                    this.h.delete(responsePartId);
                }
                return;
            }
            // No need to support standalone tree data that's not attached to a placeholder in API
            if ((0, chatModel_1.$CH)(progress)) {
                return;
            }
            this.b.get(id)?.(progress);
        }
        async $acceptChatState(sessionId, state) {
            this.c.get(sessionId)?.fire(state);
        }
        $addRequest(context) {
            this.j.addRequest(context);
        }
        async $sendRequestToProvider(providerId, message) {
            const widget = await this.m.revealViewForProvider(providerId);
            if (widget && widget.viewModel) {
                this.j.sendRequestToProvider(widget.viewModel.sessionId, message);
            }
        }
        async $unregisterChatProvider(handle) {
            this.a.deleteAndDispose(handle);
        }
    };
    exports.$gsb = $gsb;
    exports.$gsb = $gsb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadChat),
        __param(1, chatService_1.$FH),
        __param(2, chat_1.$Nqb),
        __param(3, chatContributionService_1.$fsb)
    ], $gsb);
});
//# sourceMappingURL=mainThreadChat.js.map