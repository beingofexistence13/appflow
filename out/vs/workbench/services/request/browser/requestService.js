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
define(["require", "exports", "vs/platform/configuration/common/configuration", "vs/platform/log/common/log", "vs/platform/request/common/requestIpc", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/request/browser/requestService", "vs/platform/commands/common/commands"], function (require, exports, configuration_1, log_1, requestIpc_1, remoteAgentService_1, requestService_1, commands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserRequestService = void 0;
    let BrowserRequestService = class BrowserRequestService extends requestService_1.RequestService {
        constructor(remoteAgentService, configurationService, loggerService) {
            super(configurationService, loggerService);
            this.remoteAgentService = remoteAgentService;
        }
        async request(options, token) {
            try {
                const context = await super.request(options, token);
                const connection = this.remoteAgentService.getConnection();
                if (connection && context.res.statusCode === 405) {
                    return this._makeRemoteRequest(connection, options, token);
                }
                return context;
            }
            catch (error) {
                const connection = this.remoteAgentService.getConnection();
                if (connection) {
                    return this._makeRemoteRequest(connection, options, token);
                }
                throw error;
            }
        }
        _makeRemoteRequest(connection, options, token) {
            return connection.withChannel('request', channel => new requestIpc_1.RequestChannelClient(channel).request(options, token));
        }
    };
    exports.BrowserRequestService = BrowserRequestService;
    exports.BrowserRequestService = BrowserRequestService = __decorate([
        __param(0, remoteAgentService_1.IRemoteAgentService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, log_1.ILoggerService)
    ], BrowserRequestService);
    // --- Internal commands to help authentication for extensions
    commands_1.CommandsRegistry.registerCommand('_workbench.fetchJSON', async function (accessor, url, method) {
        const result = await fetch(url, { method, headers: { Accept: 'application/json' } });
        if (result.ok) {
            return result.json();
        }
        else {
            throw new Error(result.statusText);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvcmVxdWVzdC9icm93c2VyL3JlcXVlc3RTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVl6RixJQUFNLHFCQUFxQixHQUEzQixNQUFNLHFCQUFzQixTQUFRLCtCQUFjO1FBRXhELFlBQ3VDLGtCQUF1QyxFQUN0RCxvQkFBMkMsRUFDbEQsYUFBNkI7WUFFN0MsS0FBSyxDQUFDLG9CQUFvQixFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBSkwsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtRQUs5RSxDQUFDO1FBRVEsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUF3QixFQUFFLEtBQXdCO1lBQ3hFLElBQUk7Z0JBQ0gsTUFBTSxPQUFPLEdBQUcsTUFBTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDcEQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUMzRCxJQUFJLFVBQVUsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsS0FBSyxHQUFHLEVBQUU7b0JBQ2pELE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7aUJBQzNEO2dCQUNELE9BQU8sT0FBTyxDQUFDO2FBQ2Y7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDZixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQzNELElBQUksVUFBVSxFQUFFO29CQUNmLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7aUJBQzNEO2dCQUNELE1BQU0sS0FBSyxDQUFDO2FBQ1o7UUFDRixDQUFDO1FBRU8sa0JBQWtCLENBQUMsVUFBa0MsRUFBRSxPQUF3QixFQUFFLEtBQXdCO1lBQ2hILE9BQU8sVUFBVSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFJLGlDQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNoSCxDQUFDO0tBQ0QsQ0FBQTtJQTlCWSxzREFBcUI7b0NBQXJCLHFCQUFxQjtRQUcvQixXQUFBLHdDQUFtQixDQUFBO1FBQ25CLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSxvQkFBYyxDQUFBO09BTEoscUJBQXFCLENBOEJqQztJQUVELDhEQUE4RDtJQUU5RCwyQkFBZ0IsQ0FBQyxlQUFlLENBQUMsc0JBQXNCLEVBQUUsS0FBSyxXQUFXLFFBQTBCLEVBQUUsR0FBVyxFQUFFLE1BQWM7UUFDL0gsTUFBTSxNQUFNLEdBQUcsTUFBTSxLQUFLLENBQUMsR0FBRyxFQUFFLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSxrQkFBa0IsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVyRixJQUFJLE1BQU0sQ0FBQyxFQUFFLEVBQUU7WUFDZCxPQUFPLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUNyQjthQUFNO1lBQ04sTUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDbkM7SUFDRixDQUFDLENBQUMsQ0FBQyJ9