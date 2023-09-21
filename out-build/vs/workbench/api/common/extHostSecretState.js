/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/api/common/extHost.protocol", "vs/base/common/event", "vs/platform/instantiation/common/instantiation"], function (require, exports, extHost_protocol_1, event_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Jbc = exports.$Ibc = void 0;
    class $Ibc {
        constructor(mainContext) {
            this.b = new event_1.$fd();
            this.onDidChangePassword = this.b.event;
            this.a = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadSecretState);
        }
        async $onDidChangePassword(e) {
            this.b.fire(e);
        }
        get(extensionId, key) {
            return this.a.$getPassword(extensionId, key);
        }
        store(extensionId, key, value) {
            return this.a.$setPassword(extensionId, key, value);
        }
        delete(extensionId, key) {
            return this.a.$deletePassword(extensionId, key);
        }
    }
    exports.$Ibc = $Ibc;
    exports.$Jbc = (0, instantiation_1.$Bh)('IExtHostSecretState');
});
//# sourceMappingURL=extHostSecretState.js.map