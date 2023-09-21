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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/uri", "vs/nls!vs/workbench/contrib/chat/browser/chatEditorInput", "vs/workbench/common/editor/editorInput", "vs/workbench/contrib/chat/common/chatService"], function (require, exports, cancellation_1, event_1, lifecycle_1, network_1, uri_1, nls, editorInput_1, chatService_1) {
    "use strict";
    var $yGb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$AGb = exports.ChatUri = exports.$zGb = exports.$yGb = void 0;
    let $yGb = class $yGb extends editorInput_1.$tA {
        static { $yGb_1 = this; }
        static { this.countsInUse = new Set(); }
        static { this.TypeID = 'workbench.input.chatSession'; }
        static { this.EditorID = 'workbench.editor.chatSession'; }
        static getNewEditorUri() {
            const handle = Math.floor(Math.random() * 1e9);
            return ChatUri.generate(handle);
        }
        static getNextCount() {
            let count = 0;
            while ($yGb_1.countsInUse.has(count)) {
                count++;
            }
            return count;
        }
        constructor(resource, options, m) {
            super();
            this.resource = resource;
            this.options = options;
            this.m = m;
            const parsed = ChatUri.parse(resource);
            if (typeof parsed?.handle !== 'number') {
                throw new Error('Invalid chat URI');
            }
            this.sessionId = 'sessionId' in options.target ? options.target.sessionId : undefined;
            this.providerId = 'providerId' in options.target ? options.target.providerId : undefined;
            this.c = $yGb_1.getNextCount();
            $yGb_1.countsInUse.add(this.c);
            this.B((0, lifecycle_1.$ic)(() => $yGb_1.countsInUse.delete(this.c)));
        }
        get editorId() {
            return $yGb_1.EditorID;
        }
        get capabilities() {
            return super.capabilities | 8 /* EditorInputCapabilities.Singleton */;
        }
        matches(otherInput) {
            return otherInput instanceof $yGb_1 && otherInput.resource.toString() === this.resource.toString();
        }
        get typeId() {
            return $yGb_1.TypeID;
        }
        getName() {
            return this.j?.title || nls.localize(0, null) + (this.c > 0 ? ` ${this.c + 1}` : '');
        }
        getLabelExtraClasses() {
            return ['chat-editor-label'];
        }
        async resolve() {
            if (typeof this.sessionId === 'string') {
                this.j = this.m.getOrRestoreSession(this.sessionId);
            }
            else if (typeof this.providerId === 'string') {
                this.j = this.m.startSession(this.providerId, cancellation_1.CancellationToken.None);
            }
            else if ('data' in this.options.target) {
                this.j = this.m.loadSessionFromContent(this.options.target.data);
            }
            if (!this.j) {
                return null;
            }
            this.sessionId = this.j.sessionId;
            this.providerId = this.j.providerId;
            this.B(this.j.onDidChange(() => this.b.fire()));
            return this.B(new $zGb(this.j));
        }
        dispose() {
            super.dispose();
            if (this.sessionId) {
                this.m.clearSession(this.sessionId);
            }
        }
    };
    exports.$yGb = $yGb;
    exports.$yGb = $yGb = $yGb_1 = __decorate([
        __param(2, chatService_1.$FH)
    ], $yGb);
    class $zGb extends lifecycle_1.$kc {
        constructor(model) {
            super();
            this.model = model;
            this.a = this.B(new event_1.$fd());
            this.onWillDispose = this.a.event;
            this.b = false;
            this.c = false;
        }
        async resolve() {
            this.c = true;
        }
        isResolved() {
            return this.c;
        }
        isDisposed() {
            return this.b;
        }
        dispose() {
            super.dispose();
            this.b = true;
        }
    }
    exports.$zGb = $zGb;
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
    class $AGb {
        canSerialize(input) {
            return input instanceof $yGb;
        }
        serialize(input) {
            if (!(input instanceof $yGb)) {
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
                return instantiationService.createInstance($yGb, resource, { ...parsed.options, target: { sessionId: parsed.sessionId } });
            }
            catch (err) {
                return undefined;
            }
        }
    }
    exports.$AGb = $AGb;
});
//# sourceMappingURL=chatEditorInput.js.map