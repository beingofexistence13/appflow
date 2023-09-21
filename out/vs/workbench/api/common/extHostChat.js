/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/stopwatch", "vs/nls", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTypeConverters"], function (require, exports, async_1, event_1, iterator_1, lifecycle_1, stopwatch_1, nls_1, extHost_protocol_1, typeConvert) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostChat = void 0;
    class ChatProviderWrapper {
        static { this._pool = 0; }
        constructor(extension, provider) {
            this.extension = extension;
            this.provider = provider;
            this.handle = ChatProviderWrapper._pool++;
        }
    }
    class ExtHostChat {
        static { this._nextId = 0; }
        constructor(mainContext, logService) {
            this.logService = logService;
            this._chatProvider = new Map();
            this._chatSessions = new Map();
            // private readonly _providerResponsesByRequestId = new Map<number, { response: vscode.ProviderResult<vscode.InteractiveResponse | vscode.InteractiveResponseForProgress>; sessionId: number }>();
            this._onDidPerformUserAction = new event_1.Emitter();
            this.onDidPerformUserAction = this._onDidPerformUserAction.event;
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadChat);
        }
        //#region interactive session
        registerChatProvider(extension, id, provider) {
            const wrapper = new ChatProviderWrapper(extension, provider);
            this._chatProvider.set(wrapper.handle, wrapper);
            this._proxy.$registerChatProvider(wrapper.handle, id);
            return (0, lifecycle_1.toDisposable)(() => {
                this._proxy.$unregisterChatProvider(wrapper.handle);
                this._chatProvider.delete(wrapper.handle);
            });
        }
        transferChatSession(session, newWorkspace) {
            const sessionId = iterator_1.Iterable.find(this._chatSessions.keys(), key => this._chatSessions.get(key) === session) ?? 0;
            if (typeof sessionId !== 'number') {
                return;
            }
            this._proxy.$transferChatSession(sessionId, newWorkspace);
        }
        addChatRequest(context) {
            this._proxy.$addRequest(context);
        }
        sendInteractiveRequestToProvider(providerId, message) {
            this._proxy.$sendRequestToProvider(providerId, message);
        }
        async $prepareChat(handle, initialState, token) {
            const entry = this._chatProvider.get(handle);
            if (!entry) {
                return undefined;
            }
            const session = await entry.provider.prepareSession(initialState, token);
            if (!session) {
                return undefined;
            }
            const id = ExtHostChat._nextId++;
            this._chatSessions.set(id, session);
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
            const entry = this._chatProvider.get(handle);
            if (!entry) {
                return undefined;
            }
            const realSession = this._chatSessions.get(sessionId);
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
            const entry = this._chatProvider.get(handle);
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
            const entry = this._chatProvider.get(handle);
            if (!entry) {
                return undefined;
            }
            const realSession = this._chatSessions.get(sessionId);
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
            const entry = this._chatProvider.get(handle);
            if (!entry) {
                return;
            }
            const realSession = this._chatSessions.get(sessionId);
            if (!realSession) {
                return;
            }
            if (!entry.provider.removeRequest) {
                return;
            }
            entry.provider.removeRequest(realSession, requestId);
        }
        async $provideReply(handle, sessionId, request, token) {
            const entry = this._chatProvider.get(handle);
            if (!entry) {
                return undefined;
            }
            const realSession = this._chatSessions.get(sessionId);
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
            const stopWatch = stopwatch_1.StopWatch.create(false);
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
                        this._proxy.$acceptResponseProgress(handle, sessionId, { requestId: progress.responseId });
                    }
                    else if ('placeholder' in progress && 'resolvedContent' in progress) {
                        const resolvedContent = Promise.all([this._proxy.$acceptResponseProgress(handle, sessionId, { placeholder: progress.placeholder }), progress.resolvedContent]);
                        (0, async_1.raceCancellation)(resolvedContent, token).then((res) => {
                            if (!res) {
                                return; /* Cancelled */
                            }
                            const [progressHandle, progressContent] = res;
                            this._proxy.$acceptResponseProgress(handle, sessionId, progressContent, progressHandle ?? undefined);
                        });
                    }
                    else if ('content' in progress) {
                        this._proxy.$acceptResponseProgress(handle, sessionId, {
                            content: typeof progress.content === 'string' ? progress.content : typeConvert.MarkdownString.from(progress.content)
                        });
                    }
                    else {
                        this._proxy.$acceptResponseProgress(handle, sessionId, progress);
                    }
                }
            };
            let result;
            try {
                result = await entry.provider.provideResponseWithProgress(requestObj, progressObj, token);
                if (!result) {
                    result = { errorDetails: { message: (0, nls_1.localize)('emptyResponse', "Provider returned null response") } };
                }
            }
            catch (err) {
                result = { errorDetails: { message: (0, nls_1.localize)('errorResponse', "Error from provider: {0}", err.message), responseIsIncomplete: true } };
                this.logService.error(err);
            }
            try {
                // Check that the session has not been released since the request started
                if (realSession.saveState && this._chatSessions.has(sessionId)) {
                    const newState = realSession.saveState();
                    this._proxy.$acceptChatState(sessionId, newState);
                }
            }
            catch (err) {
                this.logService.warn(err);
            }
            const timings = { firstProgress: firstProgress ?? 0, totalElapsed: stopWatch.elapsed() };
            return { errorDetails: result.errorDetails, timings };
        }
        async $provideSlashCommands(handle, sessionId, token) {
            const entry = this._chatProvider.get(handle);
            if (!entry) {
                return undefined;
            }
            const realSession = this._chatSessions.get(sessionId);
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
            this._chatSessions.delete(sessionId);
        }
        async $onDidPerformUserAction(event) {
            this._onDidPerformUserAction.fire(event);
        }
    }
    exports.ExtHostChat = ExtHostChat;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdENoYXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0Q2hhdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFnQmhHLE1BQU0sbUJBQW1CO2lCQUVULFVBQUssR0FBRyxDQUFDLEFBQUosQ0FBSztRQUl6QixZQUNVLFNBQWlELEVBQ2pELFFBQVc7WUFEWCxjQUFTLEdBQVQsU0FBUyxDQUF3QztZQUNqRCxhQUFRLEdBQVIsUUFBUSxDQUFHO1lBSlosV0FBTSxHQUFXLG1CQUFtQixDQUFDLEtBQUssRUFBRSxDQUFDO1FBS2xELENBQUM7O0lBR04sTUFBYSxXQUFXO2lCQUNSLFlBQU8sR0FBRyxDQUFDLEFBQUosQ0FBSztRQVkzQixZQUNDLFdBQXlCLEVBQ1IsVUFBdUI7WUFBdkIsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQVp4QixrQkFBYSxHQUFHLElBQUksR0FBRyxFQUFrRSxDQUFDO1lBRTFGLGtCQUFhLEdBQUcsSUFBSSxHQUFHLEVBQXFDLENBQUM7WUFDOUUsa01BQWtNO1lBRWpMLDRCQUF1QixHQUFHLElBQUksZUFBTyxFQUE0QyxDQUFDO1lBQ25GLDJCQUFzQixHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLENBQUM7WUFRM0UsSUFBSSxDQUFDLE1BQU0sR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDLDhCQUFXLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDaEUsQ0FBQztRQUVELDZCQUE2QjtRQUU3QixvQkFBb0IsQ0FBQyxTQUFpRCxFQUFFLEVBQVUsRUFBRSxRQUEyQztZQUM5SCxNQUFNLE9BQU8sR0FBRyxJQUFJLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUM3RCxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE9B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