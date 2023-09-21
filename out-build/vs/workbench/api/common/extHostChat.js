/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/stopwatch", "vs/nls!vs/workbench/api/common/extHostChat", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTypeConverters"], function (require, exports, async_1, event_1, iterator_1, lifecycle_1, stopwatch_1, nls_1, extHost_protocol_1, typeConvert) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$2cc = void 0;
    class ChatProviderWrapper {
        static { this.a = 0; }
        constructor(extension, provider) {
            this.extension = extension;
            this.provider = provider;
            this.handle = ChatProviderWrapper.a++;
        }
    }
    class $2cc {
        static { this.a = 0; }
        constructor(mainContext, h) {
            this.h = h;
            this.b = new Map();
            this.d = new Map();
            // private readonly _providerResponsesByRequestId = new Map<number, { response: vscode.ProviderResult<vscode.InteractiveResponse | vscode.InteractiveResponseForProgress>; sessionId: number }>();
            this.e = new event_1.$fd();
            this.onDidPerformUserAction = this.e.event;
            this.g = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadChat);
        }
        //#region interactive session
        registerChatProvider(extension, id, provider) {
            const wrapper = new ChatProviderWrapper(extension, provider);
            this.b.set(wrapper.handle, wrapper);
            this.g.$registerChatProvider(wrapper.handle, id);
            return (0, lifecycle_1.$ic)(() => {
                this.g.$unregisterChatProvider(wrapper.handle);
                this.b.delete(wrapper.handle);
            });
        }
        transferChatSession(session, newWorkspace) {
            const sessionId = iterator_1.Iterable.find(this.d.keys(), key => this.d.get(key) === session) ?? 0;
            if (typeof sessionId !== 'number') {
                return;
            }
            this.g.$transferChatSession(sessionId, newWorkspace);
        }
        addChatRequest(context) {
            this.g.$addRequest(context);
        }
        sendInteractiveRequestToProvider(providerId, message) {
            this.g.$sendRequestToProvider(providerId, message);
        }
        async $prepareChat(handle, initialState, token) {
            const entry = this.b.get(handle);
            if (!entry) {
                return undefined;
            }
            const session = await entry.provider.prepareSession(initialState, token);
            if (!session) {
                return undefined;
            }
            const id = $2cc.a++;
            this.d.set(id, session);
            return {
                id,
                requesterUsername: session.requester?.name,
                requesterAvatarIconUri: session.requester?.icon,
                responderUsername: session.responder?.name,
                responderAvatarIconUri: session.responder?.icon,
                inputPlaceholder: session.inputPlaceholder,
            };
        }
        async $resolveRequest(handle, sessionId, context, token) {
            const entry = this.b.get(handle);
            if (!entry) {
                return undefined;
            }
            const realSession = this.d.get(sessionId);
            if (!realSession) {
                return undefined;
            }
            if (!entry.provider.resolveRequest) {
                return undefined;
            }
            const request = await entry.provider.resolveRequest(realSession, context, token);
            if (request) {
                return {
                    message: typeof request.message === 'string' ? request.message : typeConvert.ChatReplyFollowup.from(request.message),
                };
            }
            return undefined;
        }
        async $provideWelcomeMessage(handle, token) {
            const entry = this.b.get(handle);
            if (!entry) {
                return undefined;
            }
            if (!entry.provider.provideWelcomeMessage) {
                return undefined;
            }
            const content = await entry.provider.provideWelcomeMessage(token);
            if (!content) {
                return undefined;
            }
            return content.map(item => {
                if (typeof item === 'string') {
                    return item;
                }
                else {
                    return item.map(f => typeConvert.ChatReplyFollowup.from(f));
                }
            });
        }
        async $provideFollowups(handle, sessionId, token) {
            const entry = this.b.get(handle);
            if (!entry) {
                return undefined;
            }
            const realSession = this.d.get(sessionId);
            if (!realSession) {
                return;
            }
            if (!entry.provider.provideFollowups) {
                return undefined;
            }
            const rawFollowups = await entry.provider.provideFollowups(realSession, token);
            return rawFollowups?.map(f => typeConvert.ChatFollowup.from(f));
        }
        $removeRequest(handle, sessionId, requestId) {
            const entry = this.b.get(handle);
            if (!entry) {
                return;
            }
            const realSession = this.d.get(sessionId);
            if (!realSession) {
                return;
            }
            if (!entry.provider.removeRequest) {
                return;
            }
            entry.provider.removeRequest(realSession, requestId);
        }
        async $provideReply(handle, sessionId, request, token) {
            const entry = this.b.get(handle);
            if (!entry) {
                return undefined;
            }
            const realSession = this.d.get(sessionId);
            if (!realSession) {
                return;
            }
            const requestObj = {
                session: realSession,
                message: typeof request.message === 'string' ? request.message : typeConvert.ChatReplyFollowup.to(request.message),
                variables: {}
            };
            if (request.variables) {
                for (const key of Object.keys(request.variables)) {
                    requestObj.variables[key] = request.variables[key].map(typeConvert.ChatVariable.to);
                }
            }
            const stopWatch = stopwatch_1.$bd.create(false);
            let firstProgress;
            const progressObj = {
                report: (progress) => {
                    if (token.isCancellationRequested) {
                        return;
                    }
                    if (typeof firstProgress === 'undefined') {
                        firstProgress = stopWatch.elapsed();
                    }
                    if ('responseId' in progress) {
                        this.g.$acceptResponseProgress(handle, sessionId, { requestId: progress.responseId });
                    }
                    else if ('placeholder' in progress && 'resolvedContent' in progress) {
                        const resolvedContent = Promise.all([this.g.$acceptResponseProgress(handle, sessionId, { placeholder: progress.placeholder }), progress.resolvedContent]);
                        (0, async_1.$vg)(resolvedContent, token).then((res) => {
                            if (!res) {
                                return; /* Cancelled */
                            }
                            const [progressHandle, progressContent] = res;
                            this.g.$acceptResponseProgress(handle, sessionId, progressContent, progressHandle ?? undefined);
                        });
                    }
                    else if ('content' in progress) {
                        this.g.$acceptResponseProgress(handle, sessionId, {
                            content: typeof progress.content === 'string' ? progress.content : typeConvert.MarkdownString.from(progress.content)
                        });
                    }
                    else {
                        this.g.$acceptResponseProgress(handle, sessionId, progress);
                    }
                }
            };
            let result;
            try {
                result = await entry.provider.provideResponseWithProgress(requestObj, progressObj, token);
                if (!result) {
                    result = { errorDetails: { message: (0, nls_1.localize)(0, null) } };
                }
            }
            catch (err) {
                result = { errorDetails: { message: (0, nls_1.localize)(1, null, err.message), responseIsIncomplete: true } };
                this.h.error(err);
            }
            try {
                // Check that the session has not been released since the request started
                if (realSession.saveState && this.d.has(sessionId)) {
                    const newState = realSession.saveState();
                    this.g.$acceptChatState(sessionId, newState);
                }
            }
            catch (err) {
                this.h.warn(err);
            }
            const timings = { firstProgress: firstProgress ?? 0, totalElapsed: stopWatch.elapsed() };
            return { errorDetails: result.errorDetails, timings };
        }
        async $provideSlashCommands(handle, sessionId, token) {
            const entry = this.b.get(handle);
            if (!entry) {
                return undefined;
            }
            const realSession = this.d.get(sessionId);
            if (!realSession) {
                return undefined;
            }
            if (!entry.provider.provideSlashCommands) {
                return undefined;
            }
            const slashCommands = await entry.provider.provideSlashCommands(realSession, token);
            return slashCommands?.map(c => ({
                ...c,
                kind: typeConvert.CompletionItemKind.from(c.kind)
            }));
        }
        $releaseSession(sessionId) {
            this.d.delete(sessionId);
        }
        async $onDidPerformUserAction(event) {
            this.e.fire(event);
        }
    }
    exports.$2cc = $2cc;
});
//# sourceMappingURL=extHostChat.js.map