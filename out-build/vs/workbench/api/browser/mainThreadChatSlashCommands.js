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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/workbench/api/common/extHost.protocol", "vs/workbench/contrib/chat/common/chatSlashCommands", "vs/workbench/services/extensions/common/extHostCustomers"], function (require, exports, lifecycle_1, marshalling_1, extHost_protocol_1, chatSlashCommands_1, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$8bb = void 0;
    let $8bb = class $8bb {
        constructor(extHostContext, e) {
            this.e = e;
            this.a = new lifecycle_1.$sc;
            this.b = new Map();
            this.c = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostChatSlashCommands);
        }
        dispose() {
            this.a.clearAndDisposeAll();
        }
        $registerCommand(handle, name, detail) {
            if (!this.e.hasCommand(name)) {
                // dynamic slash commands!
                this.e.registerSlashData({
                    command: name,
                    detail
                });
            }
            const d = this.e.registerSlashCallback(name, async (prompt, progress, history, token) => {
                const requestId = Math.random();
                this.b.set(requestId, progress);
                try {
                    return await this.c.$executeCommand(handle, requestId, prompt, { history }, token);
                }
                finally {
                    this.b.delete(requestId);
                }
            });
            this.a.set(handle, d);
        }
        async $handleProgressChunk(requestId, chunk) {
            this.b.get(requestId)?.report((0, marshalling_1.$$g)(chunk));
        }
        $unregisterCommand(handle) {
            this.a.deleteAndDispose(handle);
        }
    };
    exports.$8bb = $8bb;
    exports.$8bb = $8bb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadChatSlashCommands),
        __param(1, chatSlashCommands_1.$WJ)
    ], $8bb);
});
//# sourceMappingURL=mainThreadChatSlashCommands.js.map