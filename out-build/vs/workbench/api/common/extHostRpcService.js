/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$3L = exports.$2L = void 0;
    exports.$2L = (0, instantiation_1.$Bh)('IExtHostRpcService');
    class $3L {
        constructor(rpcProtocol) {
            this.getProxy = rpcProtocol.getProxy.bind(rpcProtocol);
            this.set = rpcProtocol.set.bind(rpcProtocol);
            this.dispose = rpcProtocol.dispose.bind(rpcProtocol);
            this.assertRegistered = rpcProtocol.assertRegistered.bind(rpcProtocol);
            this.drain = rpcProtocol.drain.bind(rpcProtocol);
        }
    }
    exports.$3L = $3L;
});
//# sourceMappingURL=extHostRpcService.js.map