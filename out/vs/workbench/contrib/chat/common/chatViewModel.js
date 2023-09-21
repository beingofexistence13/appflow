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
define(["require", "exports", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/workbench/contrib/chat/common/chatModel", "vs/workbench/contrib/chat/common/chatWordCounter"], function (require, exports, event_1, htmlContent_1, lifecycle_1, nls_1, instantiation_1, log_1, chatModel_1, chatWordCounter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChatResponseViewModel = exports.ChatRequestViewModel = exports.ChatViewModel = exports.isWelcomeVM = exports.isResponseVM = exports.isRequestVM = void 0;
    function isRequestVM(item) {
        return !!item && typeof item === 'object' && 'message' in item;
    }
    exports.isRequestVM = isRequestVM;
    function isResponseVM(item) {
        return !!item && typeof item.setVote !== 'undefined';
    }
    exports.isResponseVM = isResponseVM;
    function isWelcomeVM(item) {
        return !!item && typeof item === 'object' && 'content' in item;
    }
    exports.isWelcomeVM = isWelcomeVM;
    let ChatViewModel = class ChatViewModel extends lifecycle_1.Disposable {
        get inputPlaceholder() {
            return this._model.inputPlaceholder;
        }
        get sessionId() {
            return this._model.sessionId;
        }
        get requestInProgress() {
            return this._model.requestInProgress;
        }
        get providerId() {
            return this._model.providerId;
        }
        get isInitialized() {
            return this._model.isInitialized;
        }
        constructor(_model, instantiationService) {
            super();
            this._model = _model;
            this.instantiationService = instantiationService;
            this._onDidDisposeModel = this._register(new event_1.Emitter());
            this.onDidDisposeModel = this._onDidDisposeModel.event;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._items = [];
            _model.getRequests().forEach((request, i) => {
                this._items.push(new ChatRequestViewModel(request));
                if (request.response) {
                    this.onAddResponse(request.response);
                }
            });
            this._register(_model.onDidDispose(() => this._onDidDisposeModel.fire()));
            this._register(_model.onDidChange(e => {
                if (e.kind === 'addRequest') {
                    this._items.push(new ChatRequestViewModel(e.request));
                    if (e.request.response) {
                        this.onAddResponse(e.request.response);
                    }
                }
                else if (e.kind === 'addResponse') {
                    this.onAddResponse(e.response);
                }
                else if (e.kind === 'removeRequest') {
                    const requestIdx = this._items.findIndex(item => isRequestVM(item) && item.providerRequestId === e.requestId);
                    if (requestIdx >= 0) {
                        this._items.splice(requestIdx, 1);
                    }
                    const responseIdx = e.responseId && this._items.findIndex(item => isResponseVM(item) && item.providerResponseId === e.responseId);
                    if (typeof responseIdx === 'number' && responseIdx >= 0) {
                        const items = this._items.splice(responseIdx, 1);
                        const item = items[0];
                        if (isResponseVM(item)) {
                            item.dispose();
                        }
                    }
                }
                this._onDidChange.fire(e.kind === 'addRequest' ? { kind: 'addRequest' } : null);
            }));
        }
        onAddResponse(responseModel) {
            const response = this.instantiationService.createInstance(ChatResponseViewModel, responseModel);
            this._register(response.onDidChange(() => this._onDidChange.fire(null)));
            this._items.push(response);
        }
        getItems() {
            return [...(this._model.welcomeMessage ? [this._model.welcomeMessage] : []), ...this._items];
        }
        dispose() {
            super.dispose();
            this._items
                .filter((item) => item instanceof ChatResponseViewModel)
                .forEach((item) => item.dispose());
        }
    };
    exports.ChatViewModel = ChatViewModel;
    exports.ChatViewModel = ChatViewModel = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], ChatViewModel);
    class ChatRequestViewModel {
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
    exports.ChatRequestViewModel = ChatRequestViewModel;
    let ChatResponseViewModel = class ChatResponseViewModel extends lifecycle_1.Disposable {
        get id() {
            return this._model.id;
        }
        get dataId() {
            return this._model.id + `_${this._modelChangeCount}` + (this._model.session.isInitialized ? '' : '_initializing');
        }
        get providerId() {
            return this._model.providerId;
        }
        get providerResponseId() {
            return this._model.providerResponseId;
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
        get response() {
            if (this._isPlaceholder) {
                return new chatModel_1.Response(new htmlContent_1.MarkdownString((0, nls_1.localize)('thinking', "Thinking") + '\u2026'));
            }
            return this._model.response;
        }
        get isComplete() {
            return this._model.isComplete;
        }
        get isCanceled() {
            return this._model.isCanceled;
        }
        get isPlaceholder() {
            return this._isPlaceholder;
        }
        get replyFollowups() {
            return this._model.followups?.filter((f) => f.kind === 'reply');
        }
        get commandFollowups() {
            return this._model.followups?.filter((f) => f.kind === 'command');
        }
        get errorDetails() {
            return this._model.errorDetails;
        }
        get vote() {
            return this._model.vote;
        }
        get contentUpdateTimings() {
            return this._contentUpdateTimings;
        }
        constructor(_model, logService) {
            super();
            this._model = _model;
            this.logService = logService;
            this._modelChangeCount = 0;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._isPlaceholder = false;
            this.renderData = undefined;
            this._contentUpdateTimings = undefined;
            this._isPlaceholder = !_model.response.asString() && !_model.isComplete;
            if (!_model.isComplete) {
                this._contentUpdateTimings = {
                    loadingStartTime: Date.now(),
                    lastUpdateTime: Date.now(),
                    wordCountAfterLastUpdate: this._isPlaceholder ? 0 : (0, chatWordCounter_1.countWords)(_model.response.asString()),
                    impliedWordLoadRate: 0
                };
            }
            this._register(_model.onDidChange(() => {
                if (this._isPlaceholder && (_model.response.value || this.isComplete)) {
                    this._isPlaceholder = false;
                }
                if (this._contentUpdateTimings) {
                    // This should be true, if the model is changing
                    const now = Date.now();
                    const wordCount = (0, chatWordCounter_1.countWords)(_model.response.asString());
                    const timeDiff = now - this._contentUpdateTimings.loadingStartTime;
                    const impliedWordLoadRate = wordCount / (timeDiff / 1000);
                    const renderedWordCount = this.renderData?.renderedParts.reduce((acc, part) => acc += ('label' in part ? 0 : part.renderedWordCount), 0);
                    if (!this.isComplete) {
                        this.trace('onDidChange', `Update- got ${wordCount} words over ${timeDiff}ms = ${impliedWordLoadRate} words/s. ${renderedWordCount} words are rendered.`);
                        this._contentUpdateTimings = {
                            loadingStartTime: this._contentUpdateTimings.loadingStartTime,
                            lastUpdateTime: now,
                            wordCountAfterLastUpdate: wordCount,
                            impliedWordLoadRate
                        };
                    }
                    else {
                        this.trace(`onDidChange`, `Done- got ${wordCount} words over ${timeDiff}ms = ${impliedWordLoadRate} words/s. ${renderedWordCount} words are rendered.`);
                    }
                }
                else {
                    this.logService.warn('ChatResponseViewModel#onDidChange: got model update but contentUpdateTimings is not initialized');
                }
                // new data -> new id, new content to render
                this._modelChangeCount++;
                this._onDidChange.fire();
            }));
        }
        trace(tag, message) {
            this.logService.trace(`ChatResponseViewModel#${tag}: ${message}`);
        }
        setVote(vote) {
            this._modelChangeCount++;
            this._model.setVote(vote);
        }
    };
    exports.ChatResponseViewModel = ChatResponseViewModel;
    exports.ChatResponseViewModel = ChatResponseViewModel = __decorate([
        __param(1, log_1.ILogService)
    ], ChatResponseViewModel);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFZpZXdNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NoYXQvY29tbW9uL2NoYXRWaWV3TW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBYWhHLFNBQWdCLFdBQVcsQ0FBQyxJQUFhO1FBQ3hDLE9BQU8sQ0FBQyxDQUFDLElBQUksSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLElBQUksU0FBUyxJQUFJLElBQUksQ0FBQztJQUNoRSxDQUFDO0lBRkQsa0NBRUM7SUFFRCxTQUFnQixZQUFZLENBQUMsSUFBYTtRQUN6QyxPQUFPLENBQUMsQ0FBQyxJQUFJLElBQUksT0FBUSxJQUErQixDQUFDLE9BQU8sS0FBSyxXQUFXLENBQUM7SUFDbEYsQ0FBQztJQUZELG9DQUVDO0lBRUQsU0FBZ0IsV0FBVyxDQUFDLElBQWE7UUFDeEMsT0FBTyxDQUFDLENBQUMsSUFBSSxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsSUFBSSxTQUFTLElBQUksSUFBSSxDQUFDO0lBQ2hFLENBQUM7SUFGRCxrQ0FFQztJQXdFTSxJQUFNLGFBQWEsR0FBbkIsTUFBTSxhQUFjLFNBQVEsc0JBQVU7UUFTNUMsSUFBSSxnQkFBZ0I7WUFDbkIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDO1FBQ3JDLENBQUM7UUFFRCxJQUFJLFNBQVM7WUFDWixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQzlCLENBQUM7UUFFRCxJQUFJLGlCQUFpQjtZQUNwQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUM7UUFDdEMsQ0FBQztRQUVELElBQUksVUFBVTtZQUNiLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7UUFDL0IsQ0FBQztRQUVELElBQUksYUFBYTtZQUNo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