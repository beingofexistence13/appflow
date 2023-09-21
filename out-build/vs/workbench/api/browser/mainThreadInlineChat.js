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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/api/browser/mainThreadBulkEdits", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers"], function (require, exports, lifecycle_1, inlineChat_1, uriIdentity_1, mainThreadBulkEdits_1, extHost_protocol_1, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$esb = void 0;
    let $esb = class $esb {
        constructor(extHostContext, d, e) {
            this.d = d;
            this.e = e;
            this.a = new lifecycle_1.$sc();
            this.c = new Map();
            this.b = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostInlineChat);
        }
        dispose() {
            this.a.dispose();
        }
        async $registerInteractiveEditorProvider(handle, label, debugName, supportsFeedback) {
            const unreg = this.d.addProvider({
                debugName,
                label,
                prepareInlineChatSession: async (model, range, token) => {
                    const session = await this.b.$prepareSession(handle, model.uri, range, token);
                    if (!session) {
                        return undefined;
                    }
                    return {
                        ...session,
                        dispose: () => {
                            this.b.$releaseSession(handle, session.id);
                        }
                    };
                },
                provideResponse: async (item, request, progress, token) => {
                    this.c.set(request.requestId, progress);
                    try {
                        const result = await this.b.$provideResponse(handle, item, request, token);
                        if (result?.type === 'bulkEdit') {
                            result.edits = (0, mainThreadBulkEdits_1.$6bb)(result.edits, this.e);
                        }
                        return result;
                    }
                    finally {
                        this.c.delete(request.requestId);
                    }
                },
                handleInlineChatResponseFeedback: !supportsFeedback ? undefined : async (session, response, kind) => {
                    this.b.$handleFeedback(handle, session.id, response.id, kind);
                }
            });
            this.a.set(handle, unreg);
        }
        async $handleProgressChunk(requestId, chunk) {
            this.c.get(requestId)?.report(chunk);
        }
        async $unregisterInteractiveEditorProvider(handle) {
            this.a.deleteAndDispose(handle);
        }
    };
    exports.$esb = $esb;
    exports.$esb = $esb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadInlineChat),
        __param(1, inlineChat_1.$dz),
        __param(2, uriIdentity_1.$Ck)
    ], $esb);
});
//# sourceMappingURL=mainThreadInlineChat.js.map