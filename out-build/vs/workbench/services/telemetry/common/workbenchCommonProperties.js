/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/telemetry/common/commonProperties", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils"], function (require, exports, commonProperties_1, telemetry_1, telemetryUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$T_b = void 0;
    function $T_b(storageService, release, hostname, commit, version, machineId, isInternalTelemetry, process, remoteAuthority) {
        const result = (0, commonProperties_1.$0n)(release, hostname, process.arch, commit, version, machineId, isInternalTelemetry);
        const firstSessionDate = storageService.get(telemetry_1.$_k, -1 /* StorageScope.APPLICATION */);
        const lastSessionDate = storageService.get(telemetry_1.$al, -1 /* StorageScope.APPLICATION */);
        // __GDPR__COMMON__ "common.version.shell" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" }
        result['common.version.shell'] = process.versions?.['electron'];
        // __GDPR__COMMON__ "common.version.renderer" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" }
        result['common.version.renderer'] = process.versions?.['chrome'];
        // __GDPR__COMMON__ "common.firstSessionDate" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        result['common.firstSessionDate'] = firstSessionDate;
        // __GDPR__COMMON__ "common.lastSessionDate" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        result['common.lastSessionDate'] = lastSessionDate || '';
        // __GDPR__COMMON__ "common.isNewSession" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        result['common.isNewSession'] = !lastSessionDate ? '1' : '0';
        // __GDPR__COMMON__ "common.remoteAuthority" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" }
        result['common.remoteAuthority'] = (0, telemetryUtils_1.$lo)(remoteAuthority);
        // __GDPR__COMMON__ "common.cli" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        result['common.cli'] = !!process.env['VSCODE_CLI'];
        return result;
    }
    exports.$T_b = $T_b;
});
//# sourceMappingURL=workbenchCommonProperties.js.map