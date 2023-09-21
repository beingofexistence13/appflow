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
define(["require", "exports", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/chat/common/chatViewModel", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/workbench/contrib/chat/common/chatModel", "vs/workbench/contrib/chat/common/chatWordCounter"], function (require, exports, event_1, htmlContent_1, lifecycle_1, nls_1, instantiation_1, log_1, chatModel_1, chatWordCounter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Mqb = exports.$Lqb = exports.$Kqb = exports.$Jqb = exports.$Iqb = exports.$Hqb = void 0;
    function $Hqb(item) {
        return !!item && typeof item === 'object' && 'message' in item;
    }
    exports.$Hqb = $Hqb;
    function $Iqb(item) {
        return !!item && typeof item.setVote !== 'undefined';
    }
    exports.$Iqb = $Iqb;
    function $Jqb(item) {
        return !!item && typeof item === 'object' && 'content' in item;
    }
    exports.$Jqb = $Jqb;
    let $Kqb = class $Kqb extends lifecycle_1.$kc {
        get inputPlaceholder() {
            return this.g.inputPlaceholder;
        }
        get sessionId() {
            return this.g.sessionId;
        }
        get requestInProgress() {
            return this.g.requestInProgress;
        }
        get providerId() {
            return this.g.providerId;
        }
        get isInitialized() {
            return this.g.isInitialized;
        }
        constructor(g, h) {
            super();
            this.g = g;
            this.h = h;
            this.a = this.B(new event_1.$fd());
            this.onDidDisposeModel = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidChange = this.b.event;
            this.c = [];
            g.getRequests().forEach((request, i) => {
                this.c.push(new $Lqb(request));
                if (request.response) {
                    this.j(request.response);
                }
            });
            this.B(g.onDidDispose(() => this.a.fire()));
            this.B(g.onDidChange(e => {
                if (e.kind === 'addRequest') {
                    this.c.push(new $Lqb(e.request));
                    if (e.request.response) {
                        this.j(e.request.response);
                    }
                }
                else if (e.kind === 'addResponse') {
                    this.j(e.response);
                }
                else if (e.kind === 'removeRequest') {
                    const requestIdx = this.c.findIndex(item => $Hqb(item) && item.providerRequestId === e.requestId);
                    if (requestIdx >= 0) {
                        this.c.splice(requestIdx, 1);
                    }
                    const responseIdx = e.responseId && this.c.findIndex(item => $Iqb(item) && item.providerResponseId === e.responseId);
                    if (typeof responseIdx === 'number' && responseIdx >= 0) {
                        const items = this.c.splice(responseIdx, 1);
                        const item = items[0];
                        if ($Iqb(item)) {
                            item.dispose();
                        }
                    }
                }
                this.b.fire(e.kind === 'addRequest' ? { kind: 'addRequest' } : null);
            }));
        }
        j(responseModel) {
            const response = this.h.createInstance($Mqb, responseModel);
            this.B(response.onDidChange(() => this.b.fire(null)));
            this.c.push(response);
        }
        getItems() {
            return [...(this.g.welcomeMessage ? [this.g.welcomeMessage] : []), ...this.c];
        }
        dispose() {
            super.dispose();
            this.c
                .filter((item) => item instanceof $Mqb)
                .forEach((item) => item.dispose());
        }
    };
    exports.$Kqb = $Kqb;
    exports.$Kqb = $Kqb = __decorate([
        __param(1, instantiation_1.$Ah)
    ], $Kqb);
    class $Lqb {
        get id() {
            return this._model.id;
        }
        get providerRequestId() {
            return this._model.providerRequestId;
        }
        get dataId() {
            return this.id + (this._model.session.isInitialized ? '' : '_initializing');
        }
        get sessionId() {
            return this._model.session.sessionId;
        }
        get username() {
            return this._model.username;
        }
        get avatarIconUri() {
            return this._model.avatarIconUri;
        }
        get message() {
            return this._model.message;
        }
        get messageText() {
            return typeof this.message === 'string' ? this.message : this.message.message;
        }
        constructor(_model) {
            this._model = _model;
        }
    }
    exports.$Lqb = $Lqb;
    let $Mqb = class $Mqb extends lifecycle_1.$kc {
        get id() {
            return this.h.id;
        }
        get dataId() {
            return this.h.id + `_${this.a}` + (this.h.session.isInitialized ? '' : '_initializing');
        }
        get providerId() {
            return this.h.providerId;
        }
        get providerResponseId() {
            return this.h.providerResponseId;
        }
        get sessionId() {
            return this.h.session.sessionId;
        }
        get username() {
            return this.h.username;
        }
        get avatarIconUri() {
            return this.h.avatarIconUri;
        }
        get response() {
            if (this.c) {
                return new chatModel_1.$wH(new htmlContent_1.$Xj((0, nls_1.localize)(0, null) + '\u2026'));
            }
            return this.h.response;
        }
        get isComplete() {
            return this.h.isComplete;
        }
        get isCanceled() {
            return this.h.isCanceled;
        }
        get isPlaceholder() {
            return this.c;
        }
        get replyFollowups() {
            return this.h.followups?.filter((f) => f.kind === 'reply');
        }
        get commandFollowups() {
            return this.h.followups?.filter((f) => f.kind === 'command');
        }
        get errorDetails() {
            return this.h.errorDetails;
        }
        get vote() {
            return this.h.vote;
        }
        get contentUpdateTimings() {
            return this.g;
        }
        constructor(h, j) {
            super();
            this.h = h;
            this.j = j;
            this.a = 0;
            this.b = this.B(new event_1.$fd());
            this.onDidChange = this.b.event;
            this.c = false;
            this.renderData = undefined;
            this.g = undefined;
            this.c = !h.response.asString() && !h.isComplete;
            if (!h.isComplete) {
                this.g = {
                    loadingStartTime: Date.now(),
                    lastUpdateTime: Date.now(),
                    wordCountAfterLastUpdate: this.c ? 0 : (0, chatWordCounter_1.$Gqb)(h.response.asString()),
                    impliedWordLoadRate: 0
                };
            }
            this.B(h.onDidChange(() => {
                if (this.c && (h.response.value || this.isComplete)) {
                    this.c = false;
                }
                if (this.g) {
                    // This should be true, if the model is changing
                    const now = Date.now();
                    const wordCount = (0, chatWordCounter_1.$Gqb)(h.response.asString());
                    const timeDiff = now - this.g.loadingStartTime;
                    const impliedWordLoadRate = wordCount / (timeDiff / 1000);
                    const renderedWordCount = this.renderData?.renderedParts.reduce((acc, part) => acc += ('label' in part ? 0 : part.renderedWordCount), 0);
                    if (!this.isComplete) {
                        this.m('onDidChange', `Update- got ${wordCount} words over ${timeDiff}ms = ${impliedWordLoadRate} words/s. ${renderedWordCount} words are rendered.`);
                        this.g = {
                            loadingStartTime: this.g.loadingStartTime,
                            lastUpdateTime: now,
                            wordCountAfterLastUpdate: wordCount,
                            impliedWordLoadRate
                        };
                    }
                    else {
                        this.m(`onDidChange`, `Done- got ${wordCount} words over ${timeDiff}ms = ${impliedWordLoadRate} words/s. ${renderedWordCount} words are rendered.`);
                    }
                }
                else {
                    this.j.warn('ChatResponseViewModel#onDidChange: got model update but contentUpdateTimings is not initialized');
                }
                // new data -> new id, new content to render
                this.a++;
                this.b.fire();
            }));
        }
        m(tag, message) {
            this.j.trace(`ChatResponseViewModel#${tag}: ${message}`);
        }
        setVote(vote) {
            this.a++;
            this.h.setVote(vote);
        }
    };
    exports.$Mqb = $Mqb;
    exports.$Mqb = $Mqb = __decorate([
        __param(1, log_1.$5i)
    ], $Mqb);
});
//# sourceMappingURL=chatViewModel.js.map