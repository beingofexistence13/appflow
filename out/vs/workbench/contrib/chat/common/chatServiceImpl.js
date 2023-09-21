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
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/base/common/stopwatch", "vs/base/common/uri", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/progress/common/progress", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/chat/common/chatAgents", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatModel", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/contrib/chat/common/chatSlashCommands", "vs/workbench/contrib/chat/common/chatVariables", "vs/workbench/services/extensions/common/extensions"], function (require, exports, async_1, cancellation_1, event_1, htmlContent_1, iterator_1, lifecycle_1, marshalling_1, stopwatch_1, uri_1, nls_1, commands_1, contextkey_1, instantiation_1, log_1, progress_1, storage_1, telemetry_1, workspace_1, chatAgents_1, chatContextKeys_1, chatModel_1, chatService_1, chatSlashCommands_1, chatVariables_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChatService = void 0;
    const serializedChatKey = 'interactive.sessions';
    const globalChatKey = 'chat.workspaceTransfer';
    const SESSION_TRANSFER_EXPIRATION_IN_MILLISECONDS = 1000 * 60;
    const maxPersistedSessions = 25;
    let ChatService = class ChatService extends lifecycle_1.Disposable {
        get transferredSessionData() {
            return this._transferredSessionData;
        }
        constructor(storageService, logService, extensionService, instantiationService, telemetryService, contextKeyService, workspaceContextService, chatSlashCommandService, chatVariablesService, chatAgentService) {
            super();
            this.storageService = storageService;
            this.logService = logService;
            this.extensionService = extensionService;
            this.instantiationService = instantiationService;
            this.telemetryService = telemetryService;
            this.contextKeyService = contextKeyService;
            this.workspaceContextService = workspaceContextService;
            this.chatSlashCommandService = chatSlashCommandService;
            this.chatVariablesService = chatVariablesService;
            this.chatAgentService = chatAgentService;
            this._providers = new Map();
            this._sessionModels = new Map();
            this._pendingRequests = new Map();
            this._onDidPerformUserAction = this._register(new event_1.Emitter());
            this.onDidPerformUserAction = this._onDidPerformUserAction.event;
            this._onDidSubmitSlashCommand = this._register(new event_1.Emitter());
            this.onDidSubmitSlashCommand = this._onDidSubmitSlashCommand.event;
            this._hasProvider = chatContextKeys_1.CONTEXT_PROVIDER_EXISTS.bindTo(this.contextKeyService);
            const sessionData = storageService.get(serializedChatKey, 1 /* StorageScope.WORKSPACE */, '');
            if (sessionData) {
                this._persistedSessions = this.deserializeChats(sessionData);
                const countsForLog = Object.keys(this._persistedSessions).length;
                if (countsForLog > 0) {
                    this.trace('constructor', `Restored ${countsForLog} persisted sessions`);
                }
            }
            else {
                this._persistedSessions = {};
            }
            const transferredData = this.getTransferredSessionData();
            const transferredChat = transferredData?.chat;
            if (transferredChat) {
                this.trace('constructor', `Transferred session ${transferredChat.sessionId}`);
                this._persistedSessions[transferredChat.sessionId] = transferredChat;
                this._transferredSessionData = { sessionId: transferredChat.sessionId, inputValue: transferredData.inputValue };
            }
            this._register(storageService.onWillSaveState(() => this.saveState()));
        }
        saveState() {
            let allSessions = Array.from(this._sessionModels.values())
                .filter(session => session.getRequests().length > 0);
            allSessions = allSessions.concat(Object.values(this._persistedSessions)
                .filter(session => !this._sessionModels.has(session.sessionId))
                .filter(session => session.requests.length));
            allSessions.sort((a, b) => (b.creationDate ?? 0) - (a.creationDate ?? 0));
            allSessions = allSessions.slice(0, maxPersistedSessions);
            if (allSessions.length) {
                this.trace('onWillSaveState', `Persisting ${allSessions.length} sessions`);
            }
            const serialized = JSON.stringify(allSessions);
            if (allSessions.length) {
                this.trace('onWillSaveState', `Persisting ${serialized.length} chars`);
            }
            this.storageService.store(serializedChatKey, serialized, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        notifyUserAction(action) {
            if (action.action.kind === 'vote') {
                this.telemetryService.publicLog2('interactiveSessionVote', {
                    providerId: action.providerId,
                    direction: action.action.direction === chatService_1.InteractiveSessionVoteDirection.Up ? 'up' : 'down'
                });
            }
            else if (action.action.kind === 'copy') {
                this.telemetryService.publicLog2('interactiveSessionCopy', {
                    providerId: action.providerId,
                    copyKind: action.action.copyType === chatService_1.InteractiveSessionCopyKind.Action ? 'action' : 'toolbar'
                });
            }
            else if (action.action.kind === 'insert') {
                this.telemetryService.publicLog2('interactiveSessionInsert', {
                    providerId: action.providerId,
                    newFile: !!action.action.newFile
                });
            }
            else if (action.action.kind === 'command') {
                const command = commands_1.CommandsRegistry.getCommand(action.action.command.commandId);
                const commandId = command ? action.action.command.commandId : 'INVALID';
                this.telemetryService.publicLog2('interactiveSessionCommand', {
                    providerId: action.providerId,
                    commandId
                });
            }
            else if (action.action.kind === 'runInTerminal') {
                this.telemetryService.publicLog2('interactiveSessionRunInTerminal', {
                    providerId: action.providerId,
                    languageId: action.action.languageId ?? ''
                });
            }
            this._onDidPerformUserAction.fire(action);
        }
        trace(method, message) {
            this.logService.trace(`ChatService#${method}: ${message}`);
        }
        error(method, message) {
            this.logService.error(`ChatService#${method} ${message}`);
        }
        deserializeChats(sessionData) {
            try {
                const arrayOfSessions = (0, marshalling_1.revive)(JSON.parse(sessionData)); // Revive serialized URIs in session data
                if (!Array.isArray(arrayOfSessions)) {
                    throw new Error('Expected array');
                }
                const sessions = arrayOfSessions.reduce((acc, session) => {
                    // Revive serialized markdown strings in response data
                    for (const request of session.requests) {
                        if (Array.isArray(request.response)) {
                            request.response = request.response.map((response) => {
                                if (typeof response === 'string') {
                                    return new htmlContent_1.MarkdownString(response);
                                }
                                return response;
                            });
                        }
                        else if (typeof request.response === 'string') {
                            request.response = [new htmlContent_1.MarkdownString(request.response)];
                        }
                    }
                    acc[session.sessionId] = session;
                    return acc;
                }, {});
                return sessions;
            }
            catch (err) {
                this.error('deserializeChats', `Malformed session data: ${err}. [${sessionData.substring(0, 20)}${sessionData.length > 20 ? '...' : ''}]`);
                return {};
            }
        }
        getTransferredSessionData() {
            const data = this.storageService.getObject(globalChatKey, 0 /* StorageScope.PROFILE */, []);
            const workspaceUri = this.workspaceContextService.getWorkspace().folders[0]?.uri;
            if (!workspaceUri) {
                return;
            }
            const thisWorkspace = workspaceUri.toString();
            const currentTime = Date.now();
            // Only use transferred data if it was created recently
            const transferred = data.find(item => uri_1.URI.revive(item.toWorkspace).toString() === thisWorkspace && (currentTime - item.timestampInMilliseconds < SESSION_TRANSFER_EXPIRATION_IN_MILLISECONDS));
            // Keep data that isn't for the current workspace and that hasn't expired yet
            const filtered = data.filter(item => uri_1.URI.revive(item.toWorkspace).toString() !== thisWorkspace && (currentTime - item.timestampInMilliseconds < SESSION_TRANSFER_EXPIRATION_IN_MILLISECONDS));
            this.storageService.store(globalChatKey, JSON.stringify(filtered), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            return transferred;
        }
        getHistory() {
            const sessions = Object.values(this._persistedSessions)
                .filter(session => session.requests.length > 0);
            sessions.sort((a, b) => (b.creationDate ?? 0) - (a.creationDate ?? 0));
            return sessions
                .filter(session => !this._sessionModels.has(session.sessionId))
                .filter(session => !session.isImported)
                .map(item => {
                return {
                    sessionId: item.sessionId,
                    title: item.requests[0]?.message || '',
                };
            });
        }
        removeHistoryEntry(sessionId) {
            delete this._persistedSessions[sessionId];
        }
        startSession(providerId, token) {
            this.trace('startSession', `providerId=${providerId}`);
            return this._startSession(providerId, undefined, token);
        }
        _startSession(providerId, someSessionHistory, token) {
            const model = this.instantiationService.createInstance(chatModel_1.ChatModel, providerId, someSessionHistory);
            this._sessionModels.set(model.sessionId, model);
            const modelInitPromise = this.initializeSession(model, token);
            modelInitPromise.catch(err => {
                this.trace('startSession', `initializeSession failed: ${err}`);
                model.setInitializationError(err);
                model.dispose();
                this._sessionModels.delete(model.sessionId);
            });
            return model;
        }
        reinitializeModel(model) {
            model.startReinitialize();
            this.startSessionInit(model, cancellation_1.CancellationToken.None);
        }
        startSessionInit(model, token) {
            const modelInitPromise = this.initializeSession(model, token);
            modelInitPromise.catch(err => {
                this.trace('startSession', `initializeSession failed: ${err}`);
                model.setInitializationError(err);
                model.dispose();
                this._sessionModels.delete(model.sessionId);
            });
        }
        async initializeSession(model, token) {
            await this.extensionService.activateByEvent(`onInteractiveSession:${model.providerId}`);
            const provider = this._providers.get(model.providerId);
            if (!provider) {
                throw new Error(`Unknown provider: ${model.providerId}`);
            }
            let session;
            try {
                session = await provider.prepareSession(model.providerState, token) ?? undefined;
            }
            catch (err) {
                this.trace('initializeSession', `Provider initializeSession threw: ${err}`);
            }
            if (!session) {
                throw new Error('Provider returned no session');
            }
            this.trace('startSession', `Provider returned session`);
            const welcomeMessage = model.welcomeMessage ? undefined : await provider.provideWelcomeMessage?.(token) ?? undefined;
            const welcomeModel = welcomeMessage && new chatModel_1.ChatWelcomeMessageModel(model, welcomeMessage.map(item => typeof item === 'string' ? new htmlContent_1.MarkdownString(item) : item));
            model.initialize(session, welcomeModel);
        }
        getSession(sessionId) {
            return this._sessionModels.get(sessionId);
        }
        getSessionId(sessionProviderId) {
            return iterator_1.Iterable.find(this._sessionModels.values(), model => model.session?.id === sessionProviderId)?.sessionId;
        }
        getOrRestoreSession(sessionId) {
            const model = this._sessionModels.get(sessionId);
            if (model) {
                return model;
            }
            const sessionData = this._persistedSessions[sessionId];
            if (!sessionData) {
                return undefined;
            }
            if (sessionId === this.transferredSessionData?.sessionId) {
                this._transferredSessionData = undefined;
            }
            return this._startSession(sessionData.providerId, sessionData, cancellation_1.CancellationToken.None);
        }
        loadSessionFromContent(data) {
            return this._startSession(data.providerId, data, cancellation_1.CancellationToken.None);
        }
        async sendRequest(sessionId, request, usedSlashCommand) {
            const messageText = typeof request === 'string' ? request : request.message;
            this.trace('sendRequest', `sessionId: ${sessionId}, message: ${messageText.substring(0, 20)}${messageText.length > 20 ? '[...]' : ''}}`);
            if (!messageText.trim()) {
                this.trace('sendRequest', 'Rejected empty message');
                return;
            }
            const model = this._sessionModels.get(sessionId);
            if (!model) {
                throw new Error(`Unknown session: ${sessionId}`);
            }
            await model.waitForInitialization();
            const provider = this._providers.get(model.providerId);
            if (!provider) {
                throw new Error(`Unknown provider: ${model.providerId}`);
            }
            if (this._pendingRequests.has(sessionId)) {
                this.trace('sendRequest', `Session ${sessionId} already has a pending request`);
                return;
            }
            // This method is only returning whether the request was accepted - don't block on the actual request
            return { responseCompletePromise: this._sendRequestAsync(model, provider, request, usedSlashCommand) };
        }
        async _sendRequestAsync(model, provider, message, usedSlashCommand) {
            const resolvedAgent = typeof message === 'string' ? this.resolveAgent(message) : undefined;
            const request = model.addRequest(message, resolvedAgent);
            const resolvedCommand = typeof message === 'string' && message.startsWith('/') ? await this.handleSlashCommand(model.sessionId, message) : message;
            let gotProgress = false;
            const requestType = typeof message === 'string' ?
                (message.startsWith('/') ? 'slashCommand' : 'string') :
                'followup';
            const rawResponsePromise = (0, async_1.createCancelablePromise)(async (token) => {
                const progressCallback = (progress) => {
                    if (token.isCancellationRequested) {
                        return;
                    }
                    gotProgress = true;
                    if ('content' in progress) {
                        this.trace('sendRequest', `Provider returned progress for session ${model.sessionId}, ${typeof progress.content === 'string' ? progress.content.length : progress.content.value.length} chars`);
                    }
                    else if ('placeholder' in progress) {
                        this.trace('sendRequest', `Provider returned placeholder for session ${model.sessionId}, ${progress.placeholder}`);
                    }
                    else if ((0, chatModel_1.isCompleteInteractiveProgressTreeData)(progress)) {
                        // This isn't exposed in API
                        this.trace('sendRequest', `Provider returned tree data for session ${model.sessionId}, ${progress.treeData.label}`);
                    }
                    else {
                        this.trace('sendRequest', `Provider returned id for session ${model.sessionId}, ${progress.requestId}`);
                    }
                    model.acceptResponseProgress(request, progress);
                };
                const stopWatch = new stopwatch_1.StopWatch(false);
                const listener = token.onCancellationRequested(() => {
                    this.trace('sendRequest', `Request for session ${model.sessionId} was cancelled`);
                    this.telemetryService.publicLog2('interactiveSessionProviderInvoked', {
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
                        this._onDidSubmitSlashCommand.fire({ slashCommand: usedSlashCommand.command, sessionId: model.sessionId });
                    }
                    let rawResponse;
                    let slashCommandFollowups = [];
                    if (typeof message === 'string' && resolvedAgent) {
                        const history = [];
                        for (const request of model.getRequests()) {
                            if (typeof request.message !== 'string' || !request.response) {
                                continue;
                            }
                            if ((0, htmlContent_1.isMarkdownString)(request.response.response.value)) {
                                history.push({ role: 1 /* ChatMessageRole.User */, content: request.message });
                                history.push({ role: 2 /* ChatMessageRole.Assistant */, content: request.response.response.value.value });
                            }
                        }
                        const agentResult = await this.chatAgentService.invokeAgent(resolvedAgent.id, message.substring(resolvedAgent.id.length + 1).trimStart(), new progress_1.Progress(p => {
                            const { content } = p;
                            const data = (0, chatModel_1.isCompleteInteractiveProgressTreeData)(content) ? content : { content };
                            progressCallback(data);
                        }), history, token);
                        slashCommandFollowups = agentResult?.followUp;
                        rawResponse = { session: model.session };
                    }
                    else if ((typeof resolvedCommand === 'string' && typeof message === 'string' && this.chatSlashCommandService.hasCommand(resolvedCommand))) {
                        // contributed slash commands
                        // TODO: spell this out in the UI
                        const history = [];
                        for (const request of model.getRequests()) {
                            if (typeof request.message !== 'string' || !request.response) {
                                continue;
                            }
                            if ((0, htmlContent_1.isMarkdownString)(request.response.response.value)) {
                                history.push({ role: 1 /* ChatMessageRole.User */, content: request.message });
                                history.push({ role: 2 /* ChatMessageRole.Assistant */, content: request.response.response.value.value });
                            }
                        }
                        const commandResult = await this.chatSlashCommandService.executeCommand(resolvedCommand, message.substring(resolvedCommand.length + 1).trimStart(), new progress_1.Progress(p => {
                            const { content } = p;
                            const data = (0, chatModel_1.isCompleteInteractiveProgressTreeData)(content) ? content : { content };
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
                            const varResult = await this.chatVariablesService.resolveVariables(request.message, model, token);
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
                            this.trace('sendRequest', `Provider returned no response for session ${model.sessionId}`);
                            rawResponse = { session: model.session, errorDetails: { message: (0, nls_1.localize)('emptyResponse', "Provider returned null response") } };
                        }
                        const result = rawResponse.errorDetails?.responseIsFiltered ? 'filtered' :
                            rawResponse.errorDetails && gotProgress ? 'errorWithOutput' :
                                rawResponse.errorDetails ? 'error' :
                                    'success';
                        this.telemetryService.publicLog2('interactiveSessionProviderInvoked', {
                            providerId: provider.id,
                            timeToFirstProgress: rawResponse.timings?.firstProgress ?? 0,
                            totalTime: rawResponse.timings?.totalElapsed ?? 0,
                            result,
                            requestType,
                            slashCommand: usedSlashCommand?.command
                        });
                        model.setResponse(request, rawResponse);
                        this.trace('sendRequest', `Provider returned response for session ${model.sessionId}`);
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
            this._pendingRequests.set(model.sessionId, rawResponsePromise);
            rawResponsePromise.finally(() => {
                this._pendingRequests.delete(model.sessionId);
            });
            return rawResponsePromise;
        }
        async removeRequest(sessionId, requestId) {
            const model = this._sessionModels.get(sessionId);
            if (!model) {
                throw new Error(`Unknown session: ${sessionId}`);
            }
            await model.waitForInitialization();
            const provider = this._providers.get(model.providerId);
            if (!provider) {
                throw new Error(`Unknown provider: ${model.providerId}`);
            }
            model.removeRequest(requestId);
            provider.removeRequest?.(model.session, requestId);
        }
        async handleSlashCommand(sessionId, command) {
            const slashCommands = await this.getSlashCommands(sessionId, cancellation_1.CancellationToken.None);
            for (const slashCommand of slashCommands ?? []) {
                if (command.startsWith(`/${slashCommand.command}`) && this.chatSlashCommandService.hasCommand(slashCommand.command)) {
                    return slashCommand.command;
                }
            }
            return command;
        }
        resolveAgent(prompt) {
            prompt = prompt.trim();
            const agents = this.chatAgentService.getAgents();
            if (!prompt.startsWith('@')) {
                return;
            }
            return agents.find(a => prompt.match(new RegExp(`@${a.id}($|\\s)`)));
        }
        async getSlashCommands(sessionId, token) {
            const model = this._sessionModels.get(sessionId);
            if (!model) {
                throw new Error(`Unknown session: ${sessionId}`);
            }
            await model.waitForInitialization();
            const provider = this._providers.get(model.providerId);
            if (!provider) {
                throw new Error(`Unknown provider: ${model.providerId}`);
            }
            const serviceResults = this.chatSlashCommandService.getCommands().map(data => {
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
                this.logService.error(e);
                return serviceResults;
            }
        }
        async addRequest(context) {
            // This and resolveRequest are not currently used by any scenario, but leave for future use
            // TODO How to decide which session this goes to?
            const model = iterator_1.Iterable.first(this._sessionModels.values());
            if (!model) {
                // If no session, create one- how and is the service the right place to decide this?
                this.trace('addRequest', 'No session available');
                return;
            }
            const provider = this._providers.get(model.providerId);
            if (!provider || !provider.resolveRequest) {
                this.trace('addRequest', 'No provider available');
                return undefined;
            }
            this.trace('addRequest', `Calling resolveRequest for session ${model.sessionId}`);
            const request = await provider.resolveRequest(model.session, context, cancellation_1.CancellationToken.None);
            if (!request) {
                this.trace('addRequest', `Provider returned no request for session ${model.sessionId}`);
                return;
            }
            // Maybe this API should queue a request after the current one?
            this.trace('addRequest', `Sending resolved request for session ${model.sessionId}`);
            this.sendRequest(model.sessionId, request.message);
        }
        async sendRequestToProvider(sessionId, message) {
            this.trace('sendRequestToProvider', `sessionId: ${sessionId}`);
            await this.sendRequest(sessionId, message.message);
        }
        getProviders() {
            return Array.from(this._providers.keys());
        }
        async addCompleteRequest(sessionId, message, response) {
            this.trace('addCompleteRequest', `message: ${message}`);
            const model = this._sessionModels.get(sessionId);
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
                    const progress = (0, htmlContent_1.isMarkdownString)(part) ? { content: part.value } : { treeData: part };
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
            this.trace('cancelCurrentRequestForSession', `sessionId: ${sessionId}`);
            this._pendingRequests.get(sessionId)?.cancel();
        }
        clearSession(sessionId) {
            this.trace('clearSession', `sessionId: ${sessionId}`);
            const model = this._sessionModels.get(sessionId);
            if (!model) {
                throw new Error(`Unknown session: ${sessionId}`);
            }
            this._persistedSessions[sessionId] = model.toJSON();
            model.dispose();
            this._sessionModels.delete(sessionId);
            this._pendingRequests.get(sessionId)?.cancel();
        }
        registerProvider(provider) {
            this.trace('registerProvider', `Adding new chat provider`);
            if (this._providers.has(provider.id)) {
                throw new Error(`Provider ${provider.id} already registered`);
            }
            this._providers.set(provider.id, provider);
            this._hasProvider.set(true);
            Array.from(this._sessionModels.values())
                .filter(model => model.providerId === provider.id)
                .forEach(model => this.reinitializeModel(model));
            return (0, lifecycle_1.toDisposable)(() => {
                this.trace('registerProvider', `Disposing chat provider`);
                this._providers.delete(provider.id);
                this._hasProvider.set(this._providers.size > 0);
            });
        }
        getProviderInfos() {
            return Array.from(this._providers.values()).map(provider => {
                return {
                    id: provider.id,
                    displayName: provider.displayName
                };
            });
        }
        transferChatSession(transferredSessionData, toWorkspace) {
            const model = iterator_1.Iterable.find(this._sessionModels.values(), model => model.sessionId === transferredSessionData.sessionId);
            if (!model) {
                throw new Error(`Failed to transfer session. Unknown session ID: ${transferredSessionData.sessionId}`);
            }
            const existingRaw = this.storageService.getObject(globalChatKey, 0 /* StorageScope.PROFILE */, []);
            existingRaw.push({
                chat: model.toJSON(),
                timestampInMilliseconds: Date.now(),
                toWorkspace: toWorkspace,
                inputValue: transferredSessionData.inputValue,
            });
            this.storageService.store(globalChatKey, JSON.stringify(existingRaw), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            this.trace('transferChatSession', `Transferred session ${model.sessionId} to workspace ${toWorkspace.toString()}`);
        }
    };
    exports.ChatService = ChatService;
    exports.ChatService = ChatService = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, log_1.ILogService),
        __param(2, extensions_1.IExtensionService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, telemetry_1.ITelemetryService),
        __param(5, contextkey_1.IContextKeyService),
        __param(6, workspace_1.IWorkspaceContextService),
        __param(7, chatSlashCommands_1.IChatSlashCommandService),
        __param(8, chatVariables_1.IChatVariablesService),
        __param(9, chatAgents_1.IChatAgentService)
    ], ChatService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFNlcnZpY2VJbXBsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC9jb21tb24vY2hhdFNlcnZpY2VJbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTZCaEcsTUFBTSxpQkFBaUIsR0FBRyxzQkFBc0IsQ0FBQztJQUVqRCxNQUFNLGFBQWEsR0FBRyx3QkFBd0IsQ0FBQztJQU8vQyxNQUFNLDJDQUEyQyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7SUFrRjlELE1BQU0sb0JBQW9CLEdBQUcsRUFBRSxDQUFDO0lBRXpCLElBQU0sV0FBVyxHQUFqQixNQUFNLFdBQVksU0FBUSxzQkFBVTtRQVcxQyxJQUFXLHNCQUFzQjtZQUNoQyxPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQztRQUNyQyxDQUFDO1FBUUQsWUFDa0IsY0FBZ0QsRUFDcEQsVUFBd0MsRUFDbEMsZ0JBQW9ELEVBQ2hELG9CQUE0RCxFQUNoRSxnQkFBb0QsRUFDbkQsaUJBQXNELEVBQ2hELHVCQUFrRSxFQUNsRSx1QkFBa0UsRUFDckUsb0JBQTRELEVBQ2hFLGdCQUFvRDtZQUV2RSxLQUFLLEVBQUUsQ0FBQztZQVgwQixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDbkMsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUNqQixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQy9CLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDL0MscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUNsQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQy9CLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBMEI7WUFDakQsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUEwQjtZQUNwRCx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQy9DLHFCQUFnQixH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