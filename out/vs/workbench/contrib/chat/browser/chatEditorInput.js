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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/uri", "vs/nls", "vs/workbench/common/editor/editorInput", "vs/workbench/contrib/chat/common/chatService"], function (require, exports, cancellation_1, event_1, lifecycle_1, network_1, uri_1, nls, editorInput_1, chatService_1) {
    "use strict";
    var ChatEditorInput_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChatEditorInputSerializer = exports.ChatUri = exports.ChatEditorModel = exports.ChatEditorInput = void 0;
    let ChatEditorInput = class ChatEditorInput extends editorInput_1.EditorInput {
        static { ChatEditorInput_1 = this; }
        static { this.countsInUse = new Set(); }
        static { this.TypeID = 'workbench.input.chatSession'; }
        static { this.EditorID = 'workbench.editor.chatSession'; }
        static getNewEditorUri() {
            const handle = Math.floor(Math.random() * 1e9);
            return ChatUri.generate(handle);
        }
        static getNextCount() {
            let count = 0;
            while (ChatEditorInput_1.countsInUse.has(count)) {
                count++;
            }
            return count;
        }
        constructor(resource, options, chatService) {
            super();
            this.resource = resource;
            this.options = options;
            this.chatService = chatService;
            const parsed = ChatUri.parse(resource);
            if (typeof parsed?.handle !== 'number') {
                throw new Error('Invalid chat URI');
            }
            this.sessionId = 'sessionId' in options.target ? options.target.sessionId : undefined;
            this.providerId = 'providerId' in options.target ? options.target.providerId : undefined;
            this.inputCount = ChatEditorInput_1.getNextCount();
            ChatEditorInput_1.countsInUse.add(this.inputCount);
            this._register((0, lifecycle_1.toDisposable)(() => ChatEditorInput_1.countsInUse.delete(this.inputCount)));
        }
        get editorId() {
            return ChatEditorInput_1.EditorID;
        }
        get capabilities() {
            return super.capabilities | 8 /* EditorInputCapabilities.Singleton */;
        }
        matches(otherInput) {
            return otherInput instanceof ChatEditorInput_1 && otherInput.resource.toString() === this.resource.toString();
        }
        get typeId() {
            return ChatEditorInput_1.TypeID;
        }
        getName() {
            return this.model?.title || nls.localize('chatEditorName', "Chat") + (this.inputCount > 0 ? ` ${this.inputCount + 1}` : '');
        }
        getLabelExtraClasses() {
            return ['chat-editor-label'];
        }
        async resolve() {
            if (typeof this.sessionId === 'string') {
                this.model = this.chatService.getOrRestoreSession(this.sessionId);
            }
            else if (typeof this.providerId === 'string') {
                this.model = this.chatService.startSession(this.providerId, cancellation_1.CancellationToken.None);
            }
            else if ('data' in this.options.target) {
                this.model = this.chatService.loadSessionFromContent(this.options.target.data);
            }
            if (!this.model) {
                return null;
            }
            this.sessionId = this.model.sessionId;
            this.providerId = this.model.providerId;
            this._register(this.model.onDidChange(() => this._onDidChangeLabel.fire()));
            return this._register(new ChatEditorModel(this.model));
        }
        dispose() {
            super.dispose();
            if (this.sessionId) {
                this.chatService.clearSession(this.sessionId);
            }
        }
    };
    exports.ChatEditorInput = ChatEditorInput;
    exports.ChatEditorInput = ChatEditorInput = ChatEditorInput_1 = __decorate([
        __param(2, chatService_1.IChatService)
    ], ChatEditorInput);
    class ChatEditorModel extends lifecycle_1.Disposable {
        constructor(model) {
            super();
            this.model = model;
            this._onWillDispose = this._register(new event_1.Emitter());
            this.onWillDispose = this._onWillDispose.event;
            this._isDisposed = false;
            this._isResolved = false;
        }
        async resolve() {
            this._isResolved = true;
        }
        isResolved() {
            return this._isResolved;
        }
        isDisposed() {
            return this._isDisposed;
        }
        dispose() {
            super.dispose();
            this._isDisposed = true;
        }
    }
    exports.ChatEditorModel = ChatEditorModel;
    var ChatUri;
    (function (ChatUri) {
        ChatUri.scheme = network_1.Schemas.vscodeChatSesssion;
        function generate(handle) {
            return uri_1.URI.from({ scheme: ChatUri.scheme, path: `chat-${handle}` });
        }
        ChatUri.generate = generate;
        function parse(resource) {
            if (resource.scheme !== ChatUri.scheme) {
                return undefined;
            }
            const match = resource.path.match(/chat-(\d+)/);
            const handleStr = match?.[1];
            if (typeof handleStr !== 'string') {
                return undefined;
            }
            const handle = parseInt(handleStr);
            if (isNaN(handle)) {
                return undefined;
            }
            return { handle };
        }
        ChatUri.parse = parse;
    })(ChatUri || (exports.ChatUri = ChatUri = {}));
    class ChatEditorInputSerializer {
        canSerialize(input) {
            return input instanceof ChatEditorInput;
        }
        serialize(input) {
            if (!(input instanceof ChatEditorInput)) {
                return undefined;
            }
            if (typeof input.sessionId !== 'string') {
                return undefined;
            }
            const obj = {
                options: input.options,
                sessionId: input.sessionId,
                resource: input.resource
            };
            return JSON.stringify(obj);
        }
        deserialize(instantiationService, serializedEditor) {
            try {
                const parsed = JSON.parse(serializedEditor);
                const resource = uri_1.URI.revive(parsed.resource);
                return instantiationService.createInstance(ChatEditorInput, resource, { ...parsed.options, target: { sessionId: parsed.sessionId } });
            }
            catch (err) {
                return undefined;
            }
        }
    }
    exports.ChatEditorInputSerializer = ChatEditorInputSerializer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdEVkaXRvcklucHV0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC9icm93c2VyL2NoYXRFZGl0b3JJbnB1dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBZ0J6RixJQUFNLGVBQWUsR0FBckIsTUFBTSxlQUFnQixTQUFRLHlCQUFXOztpQkFDL0IsZ0JBQVcsR0FBRyxJQUFJLEdBQUcsRUFBVSxBQUFwQixDQUFxQjtpQkFFaEMsV0FBTSxHQUFXLDZCQUE2QixBQUF4QyxDQUF5QztpQkFDL0MsYUFBUSxHQUFXLDhCQUE4QixBQUF6QyxDQUEwQztRQVFsRSxNQUFNLENBQUMsZUFBZTtZQUNyQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUMvQyxPQUFPLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUVELE1BQU0sQ0FBQyxZQUFZO1lBQ2xCLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztZQUNkLE9BQU8saUJBQWUsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUM5QyxLQUFLLEVBQUUsQ0FBQzthQUNSO1lBRUQsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRUQsWUFDVSxRQUFhLEVBQ2IsT0FBMkIsRUFDTCxXQUF5QjtZQUV4RCxLQUFLLEVBQUUsQ0FBQztZQUpDLGFBQVEsR0FBUixRQUFRLENBQUs7WUFDYixZQUFPLEdBQVAsT0FBTyxDQUFvQjtZQUNMLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBSXhELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdkMsSUFBSSxPQUFPLE1B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