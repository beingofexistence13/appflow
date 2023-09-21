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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/log/common/log", "vs/platform/progress/common/progress", "vs/workbench/api/common/extHost.protocol", "vs/workbench/contrib/chat/common/chatProvider", "vs/workbench/services/extensions/common/extHostCustomers"], function (require, exports, lifecycle_1, log_1, progress_1, extHost_protocol_1, chatProvider_1, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$7bb = void 0;
    let $7bb = class $7bb {
        constructor(extHostContext, d, e) {
            this.d = d;
            this.e = e;
            this.b = new lifecycle_1.$sc();
            this.c = new Map();
            this.a = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostChatProvider);
        }
        dispose() {
            this.b.dispose();
        }
        $registerProvider(handle, identifier, metadata) {
            const registration = this.d.registerChatResponseProvider(identifier, {
                metadata,
                provideChatResponse: async (messages, options, progress, token) => {
                    const requestId = (Math.random() * 1e6) | 0;
                    this.c.set(requestId, progress);
                    try {
                        await this.a.$provideChatResponse(handle, requestId, messages, options, token);
                    }
                    finally {
                        this.c.delete(requestId);
                    }
                }
            });
            this.b.set(handle, registration);
        }
        async $handleProgressChunk(requestId, chunk) {
            this.c.get(requestId)?.report(chunk);
        }
        $unregisterProvider(handle) {
            this.b.deleteAndDispose(handle);
        }
        async $fetchResponse(extension, providerId, requestId, messages, options, token) {
            this.e.debug('[CHAT] extension request STARTED', extension.value, requestId);
            const task = this.d.fetchChatResponse(providerId, messages, options, new progress_1.$4u(value => {
                this.a.$handleResponseFragment(requestId, value);
            }), token);
            task.catch(err => {
                this.e.error('[CHAT] extension request ERRORED', err, extension.value, requestId);
            }).finally(() => {
                this.e.debug('[CHAT] extension request DONE', extension.value, requestId);
            });
            return task;
        }
    };
    exports.$7bb = $7bb;
    exports.$7bb = $7bb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadChatProvider),
        __param(1, chatProvider_1.$oH),
        __param(2, log_1.$5i)
    ], $7bb);
});
//# sourceMappingURL=mainThreadChatProvider.js.map