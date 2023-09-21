/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/base/common/marshalling"], function (require, exports, uri_1, marshalling_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteExtensionEnvironmentChannelClient = void 0;
    class RemoteExtensionEnvironmentChannelClient {
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
                profiles: (0, marshalling_1.revive)(data.profiles)
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
    exports.RemoteExtensionEnvironmentChannelClient = RemoteExtensionEnvironmentChannelClient;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlQWdlbnRFbnZpcm9ubWVudENoYW5uZWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvcmVtb3RlL2NvbW1vbi9yZW1vdGVBZ2VudEVudmlyb25tZW50Q2hhbm5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUE0Q2hHLE1BQWEsdUNBQXVDO1FBRW5ELE1BQU0sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsT0FBaUIsRUFBRSxlQUF1QixFQUFFLE9BQTJCO1lBQ3RHLE1BQU0sSUFBSSxHQUFpQztnQkFDMUMsZUFBZTtnQkFDZixPQUFPO2FBQ1AsQ0FBQztZQUVGLE1BQU0sSUFBSSxHQUFHLE1BQU0sT0FBTyxDQUFDLElBQUksQ0FBNkIsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFeEYsT0FBTztnQkFDTixHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7Z0JBQ2IsZUFBZSxFQUFFLElBQUksQ0FBQyxlQUFlO2dCQUNyQyxPQUFPLEVBQUUsU0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO2dCQUNqQyxZQUFZLEVBQUUsU0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO2dCQUMzQyxRQUFRLEVBQUUsU0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO2dCQUNuQyxxQkFBcUIsRUFBRSxTQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztnQkFDN0QsaUJBQWlCLEVBQUUsU0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUM7Z0JBQ3JELG9CQUFvQixFQUFFLFNBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDO2dCQUMzRCxnQkFBZ0IsRUFBRSxTQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztnQkFDbkQsUUFBUSxFQUFFLFNBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFDbkMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUNYLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtnQkFDZixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7Z0JBQ2pCLFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWTtnQkFDL0IsUUFBUSxFQUFFLElBQUEsb0JBQU0sRUFBQyxJQUFJLENBQUMsUUFBUSxDQUFDO2FBQy9CLENBQUM7UUFDSCxDQUFDO1FBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxPQUFpQixFQUFFLGVBQXVCLEVBQUUsaUJBQXlCO1lBQzFHLE1BQU0sSUFBSSxHQUF1QztnQkFDaEQsZUFBZTtnQkFDZixpQkFBaUI7YUFDakIsQ0FBQztZQUNGLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBZ0MsMEJBQTBCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdEYsQ0FBQztRQUVELE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxPQUFpQixFQUFFLE9BQStCO1lBQzFFLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBa0IsbUJBQW1CLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDcEUsQ0FBQztRQUVELE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxPQUFpQixFQUFFLGNBQThCO1lBQzVFLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBTyxzQkFBc0IsRUFBRSxFQUFFLGNBQWMsRUFBRSxDQUFDLENBQUM7UUFDdkUsQ0FBQztRQUVELE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBaUIsRUFBRSxTQUFpQixFQUFFLElBQW9CO1lBQzdFLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBTyxjQUFjLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNoRSxDQUFDO1FBRUQsTUFBTSxDQUFDLGNBQWMsQ0FBQyxPQUFpQjtZQUN0QyxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQU8sZ0JBQWdCLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBaUI7WUFDbEMsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFPLE1BQU0sQ0FBQyxDQUFDO1FBQ2xDLENBQUM7S0FDRDtJQXhERCwwRkF3REMifQ==