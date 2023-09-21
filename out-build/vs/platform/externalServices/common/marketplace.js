/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/externalServices/common/serviceMachineId", "vs/platform/telemetry/common/telemetryUtils"], function (require, exports, serviceMachineId_1, telemetryUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$3o = void 0;
    async function $3o(version, productService, environmentService, configurationService, fileService, storageService, telemetryService) {
        const headers = {
            'X-Market-Client-Id': `VSCode ${version}`,
            'User-Agent': `VSCode ${version} (${productService.nameShort})`
        };
        if ((0, telemetryUtils_1.$ho)(productService, environmentService) && (0, telemetryUtils_1.$jo)(configurationService) === 3 /* TelemetryLevel.USAGE */) {
            const serviceMachineId = await (0, serviceMachineId_1.$2o)(environmentService, fileService, storageService);
            headers['X-Market-User-Id'] = serviceMachineId;
            // Send machineId as VSCode-SessionId so we can correlate telemetry events across different services
            // machineId can be undefined sometimes (eg: when launching from CLI), so send serviceMachineId instead otherwise
            // Marketplace will reject the request if there is no VSCode-SessionId header
            headers['VSCode-SessionId'] = telemetryService.machineId || serviceMachineId;
        }
        return headers;
    }
    exports.$3o = $3o;
});
//# sourceMappingURL=marketplace.js.map