/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/externalServices/common/serviceMachineId", "vs/platform/telemetry/common/telemetryUtils"], function (require, exports, serviceMachineId_1, telemetryUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resolveMarketplaceHeaders = void 0;
    async function resolveMarketplaceHeaders(version, productService, environmentService, configurationService, fileService, storageService, telemetryService) {
        const headers = {
            'X-Market-Client-Id': `VSCode ${version}`,
            'User-Agent': `VSCode ${version} (${productService.nameShort})`
        };
        if ((0, telemetryUtils_1.supportsTelemetry)(productService, environmentService) && (0, telemetryUtils_1.getTelemetryLevel)(configurationService) === 3 /* TelemetryLevel.USAGE */) {
            const serviceMachineId = await (0, serviceMachineId_1.getServiceMachineId)(environmentService, fileService, storageService);
            headers['X-Market-User-Id'] = serviceMachineId;
            // Send machineId as VSCode-SessionId so we can correlate telemetry events across different services
            // machineId can be undefined sometimes (eg: when launching from CLI), so send serviceMachineId instead otherwise
            // Marketplace will reject the request if there is no VSCode-SessionId header
            headers['VSCode-SessionId'] = telemetryService.machineId || serviceMachineId;
        }
        return headers;
    }
    exports.resolveMarketplaceHeaders = resolveMarketplaceHeaders;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2V0cGxhY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9leHRlcm5hbFNlcnZpY2VzL2NvbW1vbi9tYXJrZXRwbGFjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFZekYsS0FBSyxVQUFVLHlCQUF5QixDQUFDLE9BQWUsRUFDOUQsY0FBK0IsRUFDL0Isa0JBQXVDLEVBQ3ZDLG9CQUEyQyxFQUMzQyxXQUF5QixFQUN6QixjQUEyQyxFQUMzQyxnQkFBbUM7UUFFbkMsTUFBTSxPQUFPLEdBQWE7WUFDekIsb0JBQW9CLEVBQUUsVUFBVSxPQUFPLEVBQUU7WUFDekMsWUFBWSxFQUFFLFVBQVUsT0FBTyxLQUFLLGNBQWMsQ0FBQyxTQUFTLEdBQUc7U0FDL0QsQ0FBQztRQUVGLElBQUksSUFBQSxrQ0FBaUIsRUFBQyxjQUFjLEVBQUUsa0JBQWtCLENBQUMsSUFBSSxJQUFBLGtDQUFpQixFQUFDLG9CQUFvQixDQUFDLGlDQUF5QixFQUFFO1lBQzlILE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxJQUFBLHNDQUFtQixFQUFDLGtCQUFrQixFQUFFLFdBQVcsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUNwRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQztZQUMvQyxvR0FBb0c7WUFDcEcsaUhBQWlIO1lBQ2pILDZFQUE2RTtZQUM3RSxPQUFPLENBQUMsa0JBQWtCLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxTQUFTLElBQUksZ0JBQWdCLENBQUM7U0FDN0U7UUFFRCxPQUFPLE9BQU8sQ0FBQztJQUNoQixDQUFDO0lBdkJELDhEQXVCQyJ9