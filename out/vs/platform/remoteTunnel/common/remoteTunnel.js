/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/nls"], function (require, exports, instantiation_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LOGGER_NAME = exports.LOG_ID = exports.CONFIGURATION_KEY_PREVENT_SLEEP = exports.CONFIGURATION_KEY_HOST_NAME = exports.CONFIGURATION_KEY_PREFIX = exports.TunnelStates = exports.INACTIVE_TUNNEL_MODE = exports.IRemoteTunnelService = void 0;
    exports.IRemoteTunnelService = (0, instantiation_1.createDecorator)('IRemoteTunnelService');
    exports.INACTIVE_TUNNEL_MODE = { active: false };
    var TunnelStates;
    (function (TunnelStates) {
        TunnelStates.disconnected = (onTokenFailed) => ({ type: 'disconnected', onTokenFailed });
        TunnelStates.connected = (info, serviceInstallFailed) => ({ type: 'connected', info, serviceInstallFailed });
        TunnelStates.connecting = (progress) => ({ type: 'connecting', progress });
        TunnelStates.uninitialized = { type: 'uninitialized' };
    })(TunnelStates || (exports.TunnelStates = TunnelStates = {}));
    exports.CONFIGURATION_KEY_PREFIX = 'remote.tunnels.access';
    exports.CONFIGURATION_KEY_HOST_NAME = exports.CONFIGURATION_KEY_PREFIX + '.hostNameOverride';
    exports.CONFIGURATION_KEY_PREVENT_SLEEP = exports.CONFIGURATION_KEY_PREFIX + '.preventSleep';
    exports.LOG_ID = 'remoteTunnelService';
    exports.LOGGER_NAME = (0, nls_1.localize)('remoteTunnelLog', "Remote Tunnel Service");
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlVHVubmVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vcmVtb3RlVHVubmVsL2NvbW1vbi9yZW1vdGVUdW5uZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBYW5GLFFBQUEsb0JBQW9CLEdBQUcsSUFBQSwrQkFBZSxFQUF1QixzQkFBc0IsQ0FBQyxDQUFDO0lBNkJyRixRQUFBLG9CQUFvQixHQUF1QixFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQztJQU8xRSxJQUFpQixZQUFZLENBc0I1QjtJQXRCRCxXQUFpQixZQUFZO1FBaUJmLHlCQUFZLEdBQUcsQ0FBQyxhQUFvQyxFQUFnQixFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsYUFBYSxFQUFFLENBQUMsQ0FBQztRQUNqSCxzQkFBUyxHQUFHLENBQUMsSUFBb0IsRUFBRSxvQkFBNkIsRUFBYSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLG9CQUFvQixFQUFFLENBQUMsQ0FBQztRQUNwSSx1QkFBVSxHQUFHLENBQUMsUUFBaUIsRUFBYyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUNuRiwwQkFBYSxHQUFrQixFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsQ0FBQztJQUV2RSxDQUFDLEVBdEJnQixZQUFZLDRCQUFaLFlBQVksUUFzQjVCO0lBU1ksUUFBQSx3QkFBd0IsR0FBRyx1QkFBdUIsQ0FBQztJQUNuRCxRQUFBLDJCQUEyQixHQUFHLGdDQUF3QixHQUFHLG1CQUFtQixDQUFDO0lBQzdFLFFBQUEsK0JBQStCLEdBQUcsZ0NBQXdCLEdBQUcsZUFBZSxDQUFDO0lBRTdFLFFBQUEsTUFBTSxHQUFHLHFCQUFxQixDQUFDO0lBQy9CLFFBQUEsV0FBVyxHQUFHLElBQUEsY0FBUSxFQUFDLGlCQUFpQixFQUFFLHVCQUF1QixDQUFDLENBQUMifQ==