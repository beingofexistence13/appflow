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
    exports.$CH = exports.$BH = exports.$AH = exports.$zH = exports.$yH = exports.$xH = exports.$wH = exports.$vH = exports.$uH = exports.$tH = void 0;
    function $tH(item) {
        return !!item && typeof item.message !== 'undefined';
    }
    exports.$tH = $tH;
    function $uH(item) {
        return !$tH(item);
    }
    exports.$uH = $uH;
    class $vH {
        static { this.b = 0; }
        get id() {
            return this.d;
        }
        get providerRequestId() {
            return this.e;
        }
        get username() {
            return this.session.requesterUsername;
        }
        get avatarIconUri() {
            return this.session.requesterAvatarIconUri;
        }
        constructor(session, message, e) {
            this.session = session;
            this.message = message;
            this.e = e;
            this.d = 'request_' + $vH.b++;
        }
        setProviderRequestId(providerRequestId) {
            this.e = providerRequestId;
        }
    }
    exports.$vH = $vH;
    class $wH {
        get onDidChangeValue() {
            return this.b.event;
        }
        get value() {
            return this.e;
        }
        constructor(value) {
            this.b = new event_1.$fd();
            this.e = Array.isArray(value) ? value : [value];
            this.d = Array.isArray(value) ? value.map((v) => ('value' in v ? { string: v } : { treeData: v })) : [{ string: value }];
            this.f = this.d.map((part) => {
                if ($CH(part)) {
                    return '';
                }
                return part.string.value;
            }).join('\n');
        }
        asString() {
            return this.f;
        }
        updateContent(responsePart, quiet) {
            if (typeof responsePart === 'string' || (0, htmlContent_1.$Zj)(responsePart)) {
                const responsePartLength = this.d.length - 1;
                const lastResponsePart = this.d[responsePartLength];
                if (lastResponsePart.isPlaceholder === true || $CH(lastResponsePart)) {
                    // The last part is resolving or a tree data item, start a new part
                    this.d.push({ string: typeof responsePart === 'string' ? new htmlContent_1.$Xj(responsePart) : responsePart });
                }
                else {
                    // Combine this part with the last, non-resolving string part
                    if ((0, htmlContent_1.$Zj)(responsePart)) {
                        this.d[responsePartLength] = { string: new htmlContent_1.$Xj(lastResponsePart.string.value + responsePart.value, responsePart) };
                    }
                    else {
                        this.d[responsePartLength] = { string: new htmlContent_1.$Xj(lastResponsePart.string.value + responsePart, lastResponsePart.string) };
                    }
                }
                this.g(quiet);
            }
            else if ('placeholder' in responsePart) {
                // Add a new resolving part
                const responsePosition = this.d.push({ string: new htmlContent_1.$Xj(responsePart.placeholder), isPlaceholder: true }) - 1;
                this.g(quiet);
                responsePart.resolvedContent?.then((content) => {
                    // Replace the resolving part's content with the resolved response
                    if (typeof content === 'string') {
                        this.d[responsePosition] = { string: new htmlContent_1.$Xj(content), isPlaceholder: true };
                        this.g(quiet);
                    }
                    else if (content.treeData) {
                        this.d[responsePosition] = { treeData: content.treeData };
                        this.g(quiet);
                    }
                });
            }
            else if ($CH(responsePart)) {
                this.d.push(responsePart);
                this.g(quiet);
            }
        }
        g(quiet) {
            this.e = this.d.map(part => {
                if ($CH(part)) {
                    return part.treeData;
                }
                else if (part.isPlaceholder) {
                    return { ...part.string, isPlaceholder: true };
                }
                return part.string;
            });
            this.f = this.d.map(part => {
                if ($CH(part)) {
                    return '';
                }
                return part.string.value;
            }).join('\n\n');
            if (!quiet) {
                this.b.fire();
            }
        }
    }
    exports.$wH = $wH;
    class $xH extends lifecycle_1.$kc {
        static { this.f = 0; }
        get id() {
            return this.g;
        }
        get providerResponseId() {
            return this.s;
        }
        get isComplete() {
            return this.j;
        }
        get isCanceled() {
            return this.m;
        }
        get vote() {
            return this.n;
        }
        get followups() {
            return this.u;
        }
        get response() {
            return this.h;
        }
        get errorDetails() {
            return this.t;
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
        constructor(_response, session, agent, j = false, m = false, n, s, t, u) {
            super();
            this.session = session;
            this.agent = agent;
            this.j = j;
            this.m = m;
            this.n = n;
            this.s = s;
            this.t = t;
            this.u = u;
            this.b = this.B(new event_1.$fd());
            this.onDidChange = this.b.event;
            this.h = new $wH(_response);
            this.B(this.h.onDidChangeValue(() => this.b.fire()));
            this.g = 'response_' + $xH.f++;
        }
        updateContent(responsePart, quiet) {
            this.h.updateContent(responsePart, quiet);
        }
        setProviderResponseId(providerResponseId) {
            this.s = providerResponseId;
        }
        setErrorDetails(errorDetails) {
            this.t = errorDetails;
            this.b.fire();
        }
        complete() {
            this.j = true;
            this.b.fire();
        }
        cancel() {
            this.j = true;
            this.m = true;
            this.b.fire();
        }
        setFollowups(followups) {
            this.u = followups;
            this.b.fire(); // Fire so that command followups get rendered on the row
        }
        setVote(vote) {
            this.n = vote;
            this.b.fire();
        }
    }
    exports.$xH = $xH;
    function $yH(obj) {
        const data = obj;
        return typeof data === 'object' &&
            typeof data.providerId === 'string' &&
            typeof data.requesterUsername === 'string' &&
            typeof data.responderUsername === 'string';
    }
    exports.$yH = $yH;
    function $zH(obj) {
        const data = obj;
        return $yH(obj) &&
            typeof data.creationDate === 'number' &&
            typeof data.sessionId === 'string';
    }
    exports.$zH = $zH;
    let $AH = class $AH extends lifecycle_1.$kc {
        get session() {
            return this.j;
        }
        get welcomeMessage() {
            return this.m;
        }
        get providerState() {
            return this.n;
        }
        get sessionId() {
            return this.s;
        }
        get inputPlaceholder() {
            return this.j?.inputPlaceholder;
        }
        get requestInProgress() {
            const lastRequest = this.g[this.g.length - 1];
            return !!lastRequest && !!lastRequest.response && !lastRequest.response.isComplete;
        }
        get creationDate() {
            return this.t;
        }
        get requesterUsername() {
            return this.j?.requesterUsername ?? this.z?.requesterUsername ?? '';
        }
        get responderUsername() {
            return this.j?.responderUsername ?? this.z?.responderUsername ?? '';
        }
        get requesterAvatarIconUri() {
            return this.j?.requesterAvatarIconUri ?? this.u;
        }
        get responderAvatarIconUri() {
            return this.j?.responderAvatarIconUri ?? this.w;
        }
        get isInitialized() {
            return this.h.isSettled;
        }
        get isImported() {
            return this.y;
        }
        get title() {
            const firstRequestMessage = this.g[0]?.message;
            const message = typeof firstRequestMessage === 'string' ? firstRequestMessage : firstRequestMessage?.message ?? '';
            return message.split('\n')[0].substring(0, 50);
        }
        constructor(providerId, z, C, D) {
            super();
            this.providerId = providerId;
            this.z = z;
            this.C = C;
            this.D = D;
            this.b = this.B(new event_1.$fd());
            this.onDidDispose = this.b.event;
            this.f = this.B(new event_1.$fd());
            this.onDidChange = this.f.event;
            this.h = new async_1.$2g();
            this.y = false;
            this.y = (!!z && !$zH(z)) || (z?.isImported ?? false);
            this.s = ($zH(z) && z.sessionId) || (0, uuid_1.$4f)();
            this.g = z ? this.F(z) : [];
            this.n = z ? z.providerState : undefined;
            this.t = ($zH(z) && z.creationDate) || Date.now();
            this.u = z?.requesterAvatarIconUri && uri_1.URI.revive(z.requesterAvatarIconUri);
            this.w = z?.responderAvatarIconUri && uri_1.URI.revive(z.responderAvatarIconUri);
        }
        F(obj) {
            const requests = obj.requests;
            if (!Array.isArray(requests)) {
                this.C.error(`Ignoring malformed session data: ${obj}`);
                return [];
            }
            if (obj.welcomeMessage) {
                const content = obj.welcomeMessage.map(item => typeof item === 'string' ? new htmlContent_1.$Xj(item) : item);
                this.m = new $BH(this, content);
            }
            return requests.map((raw) => {
                const request = new $vH(this, raw.message, raw.providerRequestId);
                if (raw.response || raw.responseErrorDetails) {
                    const agent = raw.agent && this.D.getAgents().find(a => a.id === raw.agent.id); // TODO do something reasonable if this agent has disappeared since the last session
                    request.response = new $xH(raw.response ?? [new htmlContent_1.$Xj(raw.response)], this, agent, true, raw.isCanceled, raw.vote, raw.providerRequestId, raw.responseErrorDetails, raw.followups);
                }
                return request;
            });
        }
        startReinitialize() {
            this.j = undefined;
            this.h = new async_1.$2g();
        }
        initialize(session, welcomeMessage) {
            if (this.j || this.h.isSettled) {
                throw new Error('ChatModel is already initialized');
            }
            this.j = session;
            if (!this.m) {
                // Could also have loaded the welcome message from persisted data
                this.m = welcomeMessage;
            }
            this.h.complete();
            if (session.onDidChangeState) {
                this.B(session.onDidChangeState(state => {
                    this.n = state;
                    this.C.trace('ChatModel#acceptNewSessionState');
                }));
            }
            this.f.fire({ kind: 'initialize' });
        }
        setInitializationError(error) {
            if (!this.h.isSettled) {
                this.h.error(error);
            }
        }
        waitForInitialization() {
            return this.h.p;
        }
        getRequests() {
            return this.g;
        }
        addRequest(message, chatAgent) {
            if (!this.j) {
                throw new Error('addRequest: No session');
            }
            const request = new $vH(this, message);
            request.response = new $xH(new htmlContent_1.$Xj(''), this, chatAgent);
            this.g.push(request);
            this.f.fire({ kind: 'addRequest', request });
            return request;
        }
        acceptResponseProgress(request, progress, quiet) {
            if (!this.j) {
                throw new Error('acceptResponseProgress: No session');
            }
            if (!request.response) {
                request.response = new $xH(new htmlContent_1.$Xj(''), this, undefined);
            }
            if (request.response.isComplete) {
                throw new Error('acceptResponseProgress: Adding progress to a completed response');
            }
            if ('content' in progress) {
                request.response.updateContent(progress.content, quiet);
            }
            else if ('placeholder' in progress || $CH(progress)) {
                request.response.updateContent(progress, quiet);
            }
            else {
                request.setProviderRequestId(progress.requestId);
                request.response.setProviderResponseId(progress.requestId);
            }
        }
        removeRequest(requestId) {
            const index = this.g.findIndex(request => request.providerRequestId === requestId);
            const request = this.g[index];
            if (!request.providerRequestId) {
                return;
            }
            if (index !== -1) {
                this.f.fire({ kind: 'removeRequest', requestId: request.providerRequestId, responseId: request.response?.providerResponseId });
                this.g.splice(index, 1);
                request.response?.dispose();
            }
        }
        cancelRequest(request) {
            if (request.response) {
                request.response.cancel();
            }
        }
        setResponse(request, rawResponse) {
            if (!this.j) {
                throw new Error('completeResponse: No session');
            }
            if (!request.response) {
                request.response = new $xH(new htmlContent_1.$Xj(''), this, undefined);
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
            this.f.fire({ kind: 'addResponse', response });
        }
        toExport() {
            return {
                requesterUsername: this.requesterUsername,
                requesterAvatarIconUri: this.requesterAvatarIconUri,
                responderUsername: this.responderUsername,
                responderAvatarIconUri: this.responderAvatarIconUri,
                welcomeMessage: this.m?.content.map(c => {
                    if (Array.isArray(c)) {
                        return c;
                    }
                    else {
                        return c.value;
                    }
                }),
                requests: this.g.map((r) => {
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
                providerState: this.n
            };
        }
        toJSON() {
            return {
                ...this.toExport(),
                sessionId: this.sessionId,
                creationDate: this.t,
                isImported: this.y
            };
        }
        dispose() {
            this.j?.dispose?.();
            this.g.forEach(r => r.response?.dispose());
            this.b.fire();
            if (!this.h.isSettled) {
                this.h.error(new Error('model disposed before initialization'));
            }
            super.dispose();
        }
    };
    exports.$AH = $AH;
    exports.$AH = $AH = __decorate([
        __param(2, log_1.$5i),
        __param(3, chatAgents_1.$rH)
    ], $AH);
    class $BH {
        static { this.b = 0; }
        get id() {
            return this.d;
        }
        constructor(e, content) {
            this.e = e;
            this.content = content;
            this.d = 'welcome_' + $BH.b++;
        }
        get username() {
            return this.e.responderUsername;
        }
        get avatarIconUri() {
            return this.e.responderAvatarIconUri;
        }
    }
    exports.$BH = $BH;
    function $CH(item) {
        return typeof item === 'object' && !!item && 'treeData' in item;
    }
    exports.$CH = $CH;
});
//# sourceMappingURL=chatModel.js.map