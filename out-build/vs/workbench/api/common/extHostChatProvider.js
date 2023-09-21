/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTypeConverters", "vs/platform/progress/common/progress", "vs/platform/extensions/common/extensions"], function (require, exports, lifecycle_1, extHost_protocol_1, typeConvert, progress_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$7cc = void 0;
    class $7cc {
        static { this.a = 1; }
        constructor(mainContext, d) {
            this.d = d;
            this.c = new Map();
            //#region --- making request
            this.e = new Map();
            this.f = new extensions_1.$Xl();
            this.b = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadChatProvider);
        }
        registerProvider(extension, identifier, provider, metadata) {
            const handle = $7cc.a++;
            this.c.set(handle, { extension, provider });
            this.b.$registerProvider(handle, identifier, { extension, displayName: metadata.name ?? extension.value });
            return (0, lifecycle_1.$ic)(() => {
                this.b.$unregisterProvider(handle);
                this.c.delete(handle);
            });
        }
        async $provideChatResponse(handle, requestId, messages, options, token) {
            const data = this.c.get(handle);
            if (!data) {
                return;
            }
            const progress = new progress_1.$4u(async (fragment) => {
                if (token.isCancellationRequested) {
                    this.d.warn(`[CHAT](${data.extension.value}) CANNOT send progress because the REQUEST IS CANCELLED`);
                    return;
                }
                await this.b.$handleProgressChunk(requestId, { index: fragment.index, part: fragment.part });
            }, { async: true });
            return data.provider.provideChatResponse(messages.map(typeConvert.ChatMessage.to), options, progress, token);
        }
        allowListExtensionWhile(extension, promise) {
            this.f.set(extension, promise);
            promise.finally(() => this.f.delete(extension));
        }
        async requestChatResponseProvider(from, identifier) {
            // check if a UI command is running/active
            if (!this.f.has(from)) {
                throw new Error('Extension is NOT allowed to make chat requests');
            }
            const that = this;
            return {
                get isRevoked() {
                    return !that.f.has(from);
                },
                async makeRequest(messages, options, progress, token) {
                    if (!that.f.has(from)) {
                        throw new Error('Access to chat has been revoked');
                    }
                    const requestId = (Math.random() * 1e6) | 0;
                    that.e.set(requestId, progress);
                    try {
                        await that.b.$fetchResponse(from, identifier, requestId, messages.map(typeConvert.ChatMessage.from), options, token);
                    }
                    finally {
                        that.e.delete(requestId);
                    }
                },
            };
        }
        async $handleResponseFragment(requestId, chunk) {
            this.e.get(requestId)?.report(chunk);
        }
    }
    exports.$7cc = $7cc;
});
//# sourceMappingURL=extHostChatProvider.js.map