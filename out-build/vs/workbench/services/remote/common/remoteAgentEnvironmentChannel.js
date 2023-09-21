/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/base/common/marshalling"], function (require, exports, uri_1, marshalling_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$rr = void 0;
    class $rr {
        static async getEnvironmentData(channel, remoteAuthority, profile) {
            const args = {
                remoteAuthority,
                profile
            };
            const data = await channel.call('getEnvironmentData', args);
            return {
                pid: data.pid,
                connectionToken: data.connectionToken,
                appRoot: uri_1.URI.revive(data.appRoot),
                settingsPath: uri_1.URI.revive(data.settingsPath),
                logsPath: uri_1.URI.revive(data.logsPath),
                extensionHostLogsPath: uri_1.URI.revive(data.extensionHostLogsPath),
                globalStorageHome: uri_1.URI.revive(data.globalStorageHome),
                workspaceStorageHome: uri_1.URI.revive(data.workspaceStorageHome),
                localHistoryHome: uri_1.URI.revive(data.localHistoryHome),
                userHome: uri_1.URI.revive(data.userHome),
                os: data.os,
                arch: data.arch,
                marks: data.marks,
                useHostProxy: data.useHostProxy,
                profiles: (0, marshalling_1.$$g)(data.profiles)
            };
        }
        static async getExtensionHostExitInfo(channel, remoteAuthority, reconnectionToken) {
            const args = {
                remoteAuthority,
                reconnectionToken
            };
            return channel.call('getExtensionHostExitInfo', args);
        }
        static getDiagnosticInfo(channel, options) {
            return channel.call('getDiagnosticInfo', options);
        }
        static updateTelemetryLevel(channel, telemetryLevel) {
            return channel.call('updateTelemetryLevel', { telemetryLevel });
        }
        static logTelemetry(channel, eventName, data) {
            return channel.call('logTelemetry', { eventName, data });
        }
        static flushTelemetry(channel) {
            return channel.call('flushTelemetry');
        }
        static async ping(channel) {
            await channel.call('ping');
        }
    }
    exports.$rr = $rr;
});
//# sourceMappingURL=remoteAgentEnvironmentChannel.js.map