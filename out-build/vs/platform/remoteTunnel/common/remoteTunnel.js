/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/nls!vs/platform/remoteTunnel/common/remoteTunnel"], function (require, exports, instantiation_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$c8b = exports.$b8b = exports.$a8b = exports.$_7b = exports.$$7b = exports.TunnelStates = exports.$07b = exports.$97b = void 0;
    exports.$97b = (0, instantiation_1.$Bh)('IRemoteTunnelService');
    exports.$07b = { active: false };
    var TunnelStates;
    (function (TunnelStates) {
        TunnelStates.disconnected = (onTokenFailed) => ({ type: 'disconnected', onTokenFailed });
        TunnelStates.connected = (info, serviceInstallFailed) => ({ type: 'connected', info, serviceInstallFailed });
        TunnelStates.connecting = (progress) => ({ type: 'connecting', progress });
        TunnelStates.uninitialized = { type: 'uninitialized' };
    })(TunnelStates || (exports.TunnelStates = TunnelStates = {}));
    exports.$$7b = 'remote.tunnels.access';
    exports.$_7b = exports.$$7b + '.hostNameOverride';
    exports.$a8b = exports.$$7b + '.preventSleep';
    exports.$b8b = 'remoteTunnelService';
    exports.$c8b = (0, nls_1.localize)(0, null);
});
//# sourceMappingURL=remoteTunnel.js.map