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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/api/common/extHost.protocol", "vs/workbench/contrib/chat/common/chatVariables", "vs/workbench/services/extensions/common/extHostCustomers"], function (require, exports, lifecycle_1, extHost_protocol_1, chatVariables_1, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$0bb = void 0;
    let $0bb = class $0bb {
        constructor(extHostContext, c) {
            this.c = c;
            this.b = new lifecycle_1.$sc();
            this.a = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostChatVariables);
        }
        dispose() {
            this.b.clearAndDisposeAll();
        }
        $registerVariable(handle, data) {
            const registration = this.c.registerVariable(data, (messageText, _arg, _model, token) => {
                return this.a.$resolveVariable(handle, messageText, token);
            });
            this.b.set(handle, registration);
        }
        $unregisterVariable(handle) {
            this.b.deleteAndDispose(handle);
        }
    };
    exports.$0bb = $0bb;
    exports.$0bb = $0bb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadChatVariables),
        __param(1, chatVariables_1.$DH)
    ], $0bb);
});
//# sourceMappingURL=mainThreadChatVariables.js.map