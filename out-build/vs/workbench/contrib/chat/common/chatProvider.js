/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation"], function (require, exports, lifecycle_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$pH = exports.$oH = exports.ChatMessageRole = void 0;
    var ChatMessageRole;
    (function (ChatMessageRole) {
        ChatMessageRole[ChatMessageRole["System"] = 0] = "System";
        ChatMessageRole[ChatMessageRole["User"] = 1] = "User";
        ChatMessageRole[ChatMessageRole["Assistant"] = 2] = "Assistant";
        ChatMessageRole[ChatMessageRole["Function"] = 3] = "Function";
    })(ChatMessageRole || (exports.ChatMessageRole = ChatMessageRole = {}));
    exports.$oH = (0, instantiation_1.$Bh)('chatProviderService');
    class $pH {
        constructor() {
            this.a = new Map();
        }
        registerChatResponseProvider(identifier, provider) {
            if (this.a.has(identifier)) {
                throw new Error(`Chat response provider with identifier ${identifier} is already registered.`);
            }
            this.a.set(identifier, provider);
            return (0, lifecycle_1.$ic)(() => this.a.delete(identifier));
        }
        fetchChatResponse(identifier, messages, options, progress, token) {
            const provider = this.a.get(identifier);
            if (!provider) {
                throw new Error(`Chat response provider with identifier ${identifier} is not registered.`);
            }
            return provider.provideChatResponse(messages, options, progress, token);
        }
    }
    exports.$pH = $pH;
});
//# sourceMappingURL=chatProvider.js.map