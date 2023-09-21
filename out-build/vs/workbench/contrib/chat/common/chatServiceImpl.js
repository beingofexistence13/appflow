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
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/base/common/stopwatch", "vs/base/common/uri", "vs/nls!vs/workbench/contrib/chat/common/chatServiceImpl", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/progress/common/progress", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/chat/common/chatAgents", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatModel", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/contrib/chat/common/chatSlashCommands", "vs/workbench/contrib/chat/common/chatVariables", "vs/workbench/services/extensions/common/extensions"], function (require, exports, async_1, cancellation_1, event_1, htmlContent_1, iterator_1, lifecycle_1, marshalling_1, stopwatch_1, uri_1, nls_1, commands_1, contextkey_1, instantiation_1, log_1, progress_1, storage_1, telemetry_1, workspace_1, chatAgents_1, chatContextKeys_1, chatModel_1, chatService_1, chatSlashCommands_1, chatVariables_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$YIb = void 0;
    const serializedChatKey = 'interactive.sessions';
    const globalChatKey = 'chat.workspaceTransfer';
    const SESSION_TRANSFER_EXPIRATION_IN_MILLISECONDS = 1000 * 60;
    const maxPersistedSessions = 25;
    let $YIb = class $YIb extends lifecycle_1.$kc {
        get transferredSessionData() {
            return this.m;
        }
        constructor(s, t, u, w, y, z, C, D, F, G) {
            super();
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.c = new Map();
            this.f = new Map();
            this.g = new Map();
            this.n = this.B(new event_1.$fd());
            this.onDidPerformUserAction = this.n.event;
            this.r = this.B(new event_1.$fd());
            this.onDidSubmitSlashCommand = this.r.event;
            this.j = chatContextKeys_1.$LGb.bindTo(this.z);
            const sessionData = s.get(serializedChatKey, 1 /* StorageScope.WORKSPACE */, '');
            if (sessionData) {
                this.h = this.L(sessionData);
                const countsForLog = Object.keys(this.h).length;
                if (countsForLog > 0) {
                    this.I('constructor', `Restored ${countsForLog} persisted sessions`);
                }
            }
            else {
                this.h = {};
            }
            const transferredData = this.M();
            const transferredChat = transferredData?.chat;
            if (transferredChat) {
                this.I('constructor', `Transferred session ${transferredChat.sessionId}`);
                this.h[transferredChat.sessionId] = transferredChat;
                this.m = { sessionId: transferredChat.sessionId, inputValue: transferredData.inputValue };
            }
            this.B(s.onWillSaveState(() => this.H()));
        }
        H() {
            let allSessions = Array.from(this.f.values())
                .filter(session => session.getRequests().length > 0);
            allSessions = allSessions.concat(Object.values(this.h)
                .filter(session => !this.f.has(session.sessionId))
                .filter(session => session.requests.length));
            allSessions.sort((a, b) => (b.creationDate ?? 0) - (a.creationDate ?? 0));
            allSessions = allSessions.slice(0, maxPersistedSessions);
            if (allSessions.length) {
                this.I('onWillSaveState', `Persisting ${allSessions.length} sessions`);
            }
            const serialized = JSON.stringify(allSessions);
            if (allSessions.length) {
                this.I('onWillSaveState', `Persisting ${serialized.length} chars`);
            }
            this.s.store(serializedChatKey, serialized, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        notifyUserAction(action) {
            if (action.action.kind === 'vote') {
                this.y.publicLog2('interactiveSessionVote', {
                    providerId: action.providerId,
                    direction: action.action.direction === chatService_1.InteractiveSessionVoteDirection.Up ? 'up' : 'down'
                });
            }
            else if (action.action.kind === 'copy') {
                this.y.publicLog2('interactiveSessionCopy', {
                    providerId: action.providerId,
                    copyKind: action.action.copyType === chatService_1.InteractiveSessionCopyKind.Action ? 'action' : 'toolbar'
                });
            }
            else if (action.action.kind === 'insert') {
                this.y.publicLog2('interactiveSessionInsert', {
                    providerId: action.providerId,
                    newFile: !!action.action.newFile
                });
            }
            else if (action.action.kind === 'command') {
                const command = commands_1.$Gr.getCommand(action.action.command.commandId);
                const commandId = command ? action.action.command.commandId : 'INVALID';
                this.y.publicLog2('interactiveSessionCommand', {
                    providerId: action.providerId,
                    commandId
                });
            }
            else if (action.action.kind === 'runInTerminal') {
                this.y.publicLog2('interactiveSessionRunInTerminal', {
                    providerId: action.providerId,
                    languageId: action.action.languageId ?? ''
                });
            }
            this.n.fire(action);
        }
        I(method, message) {
            this.t.trace(`ChatService#${method}: ${message}`);
        }
        J(method, message) {
            this.t.error(`ChatService#${method} ${message}`);
        }
        L(sessionData) {
            try {
                const arrayOfSessions = (0, marshalling_1.$$g)(JSON.parse(sessionData)); // Revive serialized URIs in session data
                if (!Array.isArray(arrayOfSessions)) {
                    throw new Error('Expected array');
                }
                const sessions = arrayOfSessions.reduce((acc, session) => {
                    // Revive serialized markdown strings in response data
                    for (const request of session.requests) {
                        if (Array.isArray(request.response)) {
                            request.response = request.response.map((response) => {
                                if (typeof response === 'string') {
                                    return new htmlContent_1.$Xj(response);
                                }
                                return response;
                            });
                        }
                        else if (typeof request.response === 'string') {
                            request.response = [new htmlContent_1.$Xj(request.response)];
                        }
                    }
                    acc[session.sessionId] = session;
                    return acc;
                }, {});
                return sessions;
            }
            catch (err) {
                this.J('deserializeChats', `Malformed session data: ${err}. [${sessionData.substring(0, 20)}${sessionData.length > 20 ? '...' : ''}]`);
                return {};
            }
        }
        M() {
            const data = this.s.getObject(globalChatKey, 0 /* StorageScope.PROFILE */, []);
            const workspaceUri = this.C.getWorkspace().folders[0]?.uri;
            if (!workspaceUri) {
                return;
            }
            const thisWorkspace = workspaceUri.toString();
            const currentTime = Date.now();
            // Only use transferred data if it was created recently
            const transferred = data.find(item => uri_1.URI.revive(item.toWorkspace).toString() === thisWorkspace && (currentTime - item.timestampInMilliseconds < SESSION_TRANSFER_EXPIRATION_IN_MILLISECONDS));
            // Keep data that isn't for the current workspace and that hasn't expired yet
            const filtered = data.filter(item => uri_1.URI.revive(item.toWorkspace).toString() !== thisWorkspace && (currentTime - item.timestampInMilliseconds < SESSION_TRANSFER_EXPIRATION_IN_MILLISECONDS));
            this.s.store(globalChatKey, JSON.stringify(filtered), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            return transferred;
        }
        getHistory() {
            const sessions = Object.values(this.h)
                .filter(session => session.requests.length > 0);
            sessions.sort((a, b) => (b.creationDate ?? 0) - (a.creationDate ?? 0));
            return sessions
                .filter(session => !this.f.has(session.sessionId))
                .filter(session => !session.isImported)
                .map(item => {
                return {
                    sessionId: item.sessionId,
                    title: item.requests[0]?.message || '',
                };
            });
        }
        removeHistoryEntry(sessionId) {
            delete this.h[sessionId];
        }
        startSession(providerId, token) {
            this.I('startSession', `providerId=${providerId}`);
            return this.N(providerId, undefined, token);
        }
        N(providerId, someSessionHistory, token) {
            const model = this.w.createInstance(chatModel_1.$AH, providerId, someSessionHistory);
            this.f.set(model.sessionId, model);
            const modelInitPromise = this.Q(model, token);
            modelInitPromise.catch(err => {
                this.I('startSession', `initializeSession failed: ${err}`);
                model.setInitializationError(err);
                model.dispose();
                this.f.delete(model.sessionId);
            });
            return model;
        }
        O(model) {
            model.startReinitialize();
            this.P(model, cancellation_1.CancellationToken.None);
        }
        P(model, token) {
            const modelInitPromise = this.Q(model, token);
            modelInitPromise.catch(err => {
                this.I('startSession', `initializeSession failed: ${err}`);
                model.setInitializationError(err);
                model.dispose();
                this.f.delete(model.sessionId);
            });
        }
        async Q(model, token) {
            await this.u.activateByEvent(`onInteractiveSession:${model.providerId}`);
            const provider = this.c.get(model.providerId);
            if (!provider) {
                throw new Error(`Unknown provider: ${model.providerId}`);
            }
            let session;
            try {
                session = await provider.prepareSession(model.providerState, token) ?? undefined;
            }
            catch (err) {
                this.I('initializeSession', `Provider initializeSession threw: ${err}`);
            }
            if (!session) {
                throw new Error('Provider returned no session');
            }
            this.I('startSession', `Provider returned session`);
            const welcomeMessage = model.welcomeMessage ? undefined : await provider.provideWelcomeMessage?.(token) ?? undefined;
            const welcomeModel = welcomeMessage && new chatModel_1.$BH(model, welcomeMessage.map(item => typeof item === 'string' ? new htmlContent_1.$Xj(item) : item));
            model.initialize(session, welcomeModel);
        }
        getSession(sessionId) {
            return this.f.get(sessionId);
        }
        getSessionId(sessionProviderId) {
            return iterator_1.Iterable.find(this.f.values(), model => model.session?.id === sessionProviderId)?.sessionId;
        }
        getOrRestoreSession(sessionId) {
            const model = this.f.get(sessionId);
            if (model) {
                return model;
            }
            const sessionData = this.h[sessionId];
            if (!sessionData) {
                return undefined;
            }
            if (sessionId === this.transferredSessionData?.sessionId) {
                this.m = undefined;
            }
            return this.N(sessionData.providerId, sessionData, cancellation_1.CancellationToken.None);
        }
        loadSessionFromContent(data) {
            return this.N(data.providerId, data, cancellation_1.CancellationToken.None);
        }
        async sendRequest(sessionId, request, usedSlashCommand) {
            const messageText = typeof request === 'string' ? request : request.message;
            this.I('sendRequest', `sessionId: ${sessionId}, message: ${messageText.substring(0, 20)}${messageText.length > 20 ? '[...]' : ''}}`);
            if (!messageText.trim()) {
                this.I('sendRequest', 'Rejected empty message');
                return;
            }
            const model = this.f.get(sessionId);
            if (!model) {
                throw new Error(`Unknown session: ${sessionId}`);
            }
            await model.waitForInitialization();
            const provider = this.c.get(model.providerId);
            if (!provider) {
                throw new Error(`Unknown provider: ${model.providerId}`);
            }
            if (this.g.has(sessionId)) {
                this.I('sendRequest', `Session ${sessionId} already has a pending request`);
                return;
            }
            // This method is only returning whether the request was accepted - don't block on the actual request
            return { responseCompletePromise: this.R(model, provider, request, usedSlashCommand) };
        }
        async R(model, provider, message, usedSlashCommand) {
            const resolvedAgent = typeof message === 'string' ? this.U(message) : undefined;
            const request = model.addRequest(message, resolvedAgent);
            const resolvedCommand = typeof message === 'string' && message.startsWith('/') ? await this.S(model.sessionId, message) : message;
            let gotProgress = false;
            const requestType = typeof message === 'string' ?
                (message.startsWith('/') ? 'slashCommand' : 'string') :
                'followup';
            const rawResponsePromise = (0, async_1.$ug)(async (token) => {
                const progressCallback = (progress) => {
                    if (token.isCancellationRequested) {
                        return;
                    }
                    gotProgress = true;
                    if ('content' in progress) {
                        this.I('sendRequest', `Provider returned progress for session ${model.sessionId}, ${typeof progress.content === 'string' ? progress.content.length : progress.content.value.length} chars`);
                    }
                    else if ('placeholder' in progress) {
                        this.I('sendRequest', `Provider returned placeholder for session ${model.sessionId}, ${progress.placeholder}`);
                    }
                    else if ((0, chatModel_1.$CH)(progress)) {
                        // This isn't exposed in API
                        this.I('sendRequest', `Provider returned tree data for session ${model.sessionId}, ${progress.treeData.label}`);
                    }
                    else {
                        this.I('sendRequest', `Provider returned id for session ${model.sessionId}, ${progress.requestId}`);
                    }
                    model.acceptResponseProgress(request, progress);
                };
                const stopWatch = new stopwatch_1.$bd(false);
                const listener = token.onCancellationRequested(() => {
                    this.I('sendRequest', `Request for session ${model.sessionId} was cancelled`);
                    this.y.publicLog2('interactiveSessionProviderInvoked', {
                        providerId: provider.id,
                        timeToFirstProgress: -1,
                        // Normally timings happen inside the EH around the actual provider. For cancellation we can measure how long the user waited before cancelling
                        totalTime: stopWatch.elapsed(),
                        result: 'cancelled',
                        requestType,
                        slashCommand: usedSlashCommand?.command
                    });
                    model.cancelRequest(request);
                });
                try {
                    if (usedSlashCommand?.command) {
                        this.r.fire({ slashCommand: usedSlashCommand.command, sessionId: model.sessionId });
                    }
                    let rawResponse;
                    let slashCommandFollowups = [];
                    if (typeof message === 'string' && resolvedAgent) {
                        const history = [];
                        for (const request of model.getRequests()) {
                            if (typeof request.message !== 'string' || !request.response) {
                                continue;
                            }
                            if ((0, htmlContent_1.$Zj)(request.response.response.value)) {
                                history.push({ role: 1 /* ChatMessageRole.User */, content: request.message });
                                history.push({ role: 2 /* ChatMessageRole.Assistant */, content: request.response.response.value.value });
                            }
                        }
                        const agentResult = await this.G.invokeAgent(resolvedAgent.id, message.substring(resolvedAgent.id.length + 1).trimStart(), new progress_1.$4u(p => {
                            const { content } = p;
                            const data = (0, chatModel_1.$CH)(content) ? content : { content };
                            progressCallback(data);
                        }), history, token);
                        slashCommandFollowups = agentResult?.followUp;
                        rawResponse = { session: model.session };
                    }
                    else if ((typeof resolvedCommand === 'string' && typeof message === 'string' && this.D.hasCommand(resolvedCommand))) {
                        // contributed slash commands
                        // TODO: spell this out in the UI
                        const history = [];
                        for (const request of model.getRequests()) {
                            if (typeof request.message !== 'string' || !request.response) {
                                continue;
                            }
                            if ((0, htmlContent_1.$Zj)(request.response.response.value)) {
                                history.push({ role: 1 /* ChatMessageRole.User */, content: request.message });
                                history.push({ role: 2 /* ChatMessageRole.Assistant */, content: request.response.response.value.value });
                            }
                        }
                        const commandResult = await this.D.executeCommand(resolvedCommand, message.substring(resolvedCommand.length + 1).trimStart(), new progress_1.$4u(p => {
                            const { content } = p;
                            const data = (0, chatModel_1.$CH)(content) ? content : { content };
                            progressCallback(data);
                        }), history, token);
                        slashCommandFollowups = commandResult?.followUp;
                        rawResponse = { session: model.session };
                    }
                    else {
                        const request = {
                            session: model.session,
                            message: resolvedCommand,
                            variables: {}
                        };
                        if (typeof request.message === 'string') {
                            const varResult = await this.F.resolveVariables(request.message, model, token);
                            request.variables = varResult.variables;
                            request.message = varResult.prompt;
                        }
                        rawResponse = await provider.provideReply(request, progressCallback, token);
                    }
                    if (token.isCancellationRequested) {
                        return;
                    }
                    else {
                        if (!rawResponse) {
                            this.I('sendRequest', `Provider returned no response for session ${model.sessionId}`);
                            rawResponse = { session: model.session, errorDetails: { message: (0, nls_1.localize)(0, null) } };
                        }
                        const result = rawResponse.errorDetails?.responseIsFiltered ? 'filtered' :
                            rawResponse.errorDetails && gotProgress ? 'errorWithOutput' :
                                rawResponse.errorDetails ? 'error' :
                                    'success';
                        this.y.publicLog2('interactiveSessionProviderInvoked', {
                            providerId: provider.id,
                            timeToFirstProgress: rawResponse.timings?.firstProgress ?? 0,
                            totalTime: rawResponse.timings?.totalElapsed ?? 0,
                            result,
                            requestType,
                            slashCommand: usedSlashCommand?.command
                        });
                        model.setResponse(request, rawResponse);
                        this.I('sendRequest', `Provider returned response for session ${model.sessionId}`);
                        // TODO refactor this or rethink the API https://github.com/microsoft/vscode-copilot/issues/593
                        if (provider.provideFollowups) {
                            Promise.resolve(provider.provideFollowups(model.session, cancellation_1.CancellationToken.None)).then(providerFollowups => {
                                const allFollowups = providerFollowups?.concat(slashCommandFollowups ?? []);
                                model.setFollowups(request, allFollowups ?? undefined);
                                model.completeResponse(request);
                            });
                        }
                        else if (slashCommandFollowups?.length) {
                            model.setFollowups(request, slashCommandFollowups);
                            model.completeResponse(request);
                        }
                        else {
                            model.completeResponse(request);
                        }
                    }
                }
                finally {
                    listener.dispose();
                }
            });
            this.g.set(model.sessionId, rawResponsePromise);
            rawResponsePromise.finally(() => {
                this.g.delete(model.sessionId);
            });
            return rawResponsePromise;
        }
        async removeRequest(sessionId, requestId) {
            const model = this.f.get(sessionId);
            if (!model) {
                throw new Error(`Unknown session: ${sessionId}`);
            }
            await model.waitForInitialization();
            const provider = this.c.get(model.providerId);
            if (!provider) {
                throw new Error(`Unknown provider: ${model.providerId}`);
            }
            model.removeRequest(requestId);
            provider.removeRequest?.(model.session, requestId);
        }
        async S(sessionId, command) {
            const slashCommands = await this.getSlashCommands(sessionId, cancellation_1.CancellationToken.None);
            for (const slashCommand of slashCommands ?? []) {
                if (command.startsWith(`/${slashCommand.command}`) && this.D.hasCommand(slashCommand.command)) {
                    return slashCommand.command;
                }
            }
            return command;
        }
        U(prompt) {
            prompt = prompt.trim();
            const agents = this.G.getAgents();
            if (!prompt.startsWith('@')) {
                return;
            }
            return agents.find(a => prompt.match(new RegExp(`@${a.id}($|\\s)`)));
        }
        async getSlashCommands(sessionId, token) {
            const model = this.f.get(sessionId);
            if (!model) {
                throw new Error(`Unknown session: ${sessionId}`);
            }
            await model.waitForInitialization();
            const provider = this.c.get(model.providerId);
            if (!provider) {
                throw new Error(`Unknown provider: ${model.providerId}`);
            }
            const serviceResults = this.D.getCommands().map(data => {
                return {
                    command: data.command,
                    detail: data.detail,
                    sortText: data.sortText,
                    executeImmediately: data.executeImmediately
                };
            });
            const mainProviderRequest = provider.provideSlashCommands?.(model.session, token);
            try {
                const providerResults = await mainProviderRequest;
                if (providerResults) {
                    return providerResults.concat(serviceResults);
                }
                return serviceResults;
            }
            catch (e) {
                this.t.error(e);
                return serviceResults;
            }
        }
        async addRequest(context) {
            // This and resolveRequest are not currently used by any scenario, but leave for future use
            // TODO How to decide which session this goes to?
            const model = iterator_1.Iterable.first(this.f.values());
            if (!model) {
                // If no session, create one- how and is the service the right place to decide this?
                this.I('addRequest', 'No session available');
                return;
            }
            const provider = this.c.get(model.providerId);
            if (!provider || !provider.resolveRequest) {
                this.I('addRequest', 'No provider available');
                return undefined;
            }
            this.I('addRequest', `Calling resolveRequest for session ${model.sessionId}`);
            const request = await provider.resolveRequest(model.session, context, cancellation_1.CancellationToken.None);
            if (!request) {
                this.I('addRequest', `Provider returned no request for session ${model.sessionId}`);
                return;
            }
            // Maybe this API should queue a request after the current one?
            this.I('addRequest', `Sending resolved request for session ${model.sessionId}`);
            this.sendRequest(model.sessionId, request.message);
        }
        async sendRequestToProvider(sessionId, message) {
            this.I('sendRequestToProvider', `sessionId: ${sessionId}`);
            await this.sendRequest(sessionId, message.message);
        }
        getProviders() {
            return Array.from(this.c.keys());
        }
        async addCompleteRequest(sessionId, message, response) {
            this.I('addCompleteRequest', `message: ${message}`);
            const model = this.f.get(sessionId);
            if (!model) {
                throw new Error(`Unknown session: ${sessionId}`);
            }
            await model.waitForInitialization();
            const request = model.addRequest(message, undefined);
            if (typeof response.message === 'string') {
                model.acceptResponseProgress(request, { content: response.message });
            }
            else {
                for (const part of response.message) {
                    const progress = (0, htmlContent_1.$Zj)(part) ? { content: part.value } : { treeData: part };
                    model.acceptResponseProgress(request, progress, true);
                }
            }
            model.setResponse(request, {
                session: model.session,
                errorDetails: response.errorDetails,
            });
            if (response.followups !== undefined) {
                model.setFollowups(request, response.followups);
            }
            model.completeResponse(request);
        }
        cancelCurrentRequestForSession(sessionId) {
            this.I('cancelCurrentRequestForSession', `sessionId: ${sessionId}`);
            this.g.get(sessionId)?.cancel();
        }
        clearSession(sessionId) {
            this.I('clearSession', `sessionId: ${sessionId}`);
            const model = this.f.get(sessionId);
            if (!model) {
                throw new Error(`Unknown session: ${sessionId}`);
            }
            this.h[sessionId] = model.toJSON();
            model.dispose();
            this.f.delete(sessionId);
            this.g.get(sessionId)?.cancel();
        }
        registerProvider(provider) {
            this.I('registerProvider', `Adding new chat provider`);
            if (this.c.has(provider.id)) {
                throw new Error(`Provider ${provider.id} already registered`);
            }
            this.c.set(provider.id, provider);
            this.j.set(true);
            Array.from(this.f.values())
                .filter(model => model.providerId === provider.id)
                .forEach(model => this.O(model));
            return (0, lifecycle_1.$ic)(() => {
                this.I('registerProvider', `Disposing chat provider`);
                this.c.delete(provider.id);
                this.j.set(this.c.size > 0);
            });
        }
        getProviderInfos() {
            return Array.from(this.c.values()).map(provider => {
                return {
                    id: provider.id,
                    displayName: provider.displayName
                };
            });
        }
        transferChatSession(transferredSessionData, toWorkspace) {
            const model = iterator_1.Iterable.find(this.f.values(), model => model.sessionId === transferredSessionData.sessionId);
            if (!model) {
                throw new Error(`Failed to transfer session. Unknown session ID: ${transferredSessionData.sessionId}`);
            }
            const existingRaw = this.s.getObject(globalChatKey, 0 /* StorageScope.PROFILE */, []);
            existingRaw.push({
                chat: model.toJSON(),
                timestampInMilliseconds: Date.now(),
                toWorkspace: toWorkspace,
                inputValue: transferredSessionData.inputValue,
            });
            this.s.store(globalChatKey, JSON.stringify(existingRaw), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            this.I('transferChatSession', `Transferred session ${model.sessionId} to workspace ${toWorkspace.toString()}`);
        }
    };
    exports.$YIb = $YIb;
    exports.$YIb = $YIb = __decorate([
        __param(0, storage_1.$Vo),
        __param(1, log_1.$5i),
        __param(2, extensions_1.$MF),
        __param(3, instantiation_1.$Ah),
        __param(4, telemetry_1.$9k),
        __param(5, contextkey_1.$3i),
        __param(6, workspace_1.$Kh),
        __param(7, chatSlashCommands_1.$WJ),
        __param(8, chatVariables_1.$DH),
        __param(9, chatAgents_1.$rH)
    ], $YIb);
});
//# sourceMappingURL=chatServiceImpl.js.map