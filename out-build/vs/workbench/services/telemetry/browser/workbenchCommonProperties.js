/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/base/common/uuid", "vs/platform/telemetry/common/telemetryUtils", "vs/base/common/objects", "vs/platform/telemetry/common/telemetry", "vs/base/browser/touch"], function (require, exports, Platform, uuid, telemetryUtils_1, objects_1, telemetry_1, touch_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$53b = void 0;
    /**
     * General function to help reduce the individuality of user agents
     * @param userAgent userAgent from browser window
     * @returns A simplified user agent with less detail
     */
    function cleanUserAgent(userAgent) {
        return userAgent.replace(/(\d+\.\d+)(\.\d+)+/g, '$1');
    }
    function $53b(storageService, commit, version, isInternalTelemetry, remoteAuthority, productIdentifier, removeMachineId, resolveAdditionalProperties) {
        const result = Object.create(null);
        const firstSessionDate = storageService.get(telemetry_1.$_k, -1 /* StorageScope.APPLICATION */);
        const lastSessionDate = storageService.get(telemetry_1.$al, -1 /* StorageScope.APPLICATION */);
        let machineId;
        if (!removeMachineId) {
            machineId = storageService.get(telemetry_1.$bl, -1 /* StorageScope.APPLICATION */);
            if (!machineId) {
                machineId = uuid.$4f();
                storageService.store(telemetry_1.$bl, machineId, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
        }
        else {
            machineId = `Redacted-${productIdentifier ?? 'web'}`;
        }
        /**
         * Note: In the web, session date information is fetched from browser storage, so these dates are tied to a specific
         * browser and not the machine overall.
         */
        // __GDPR__COMMON__ "common.firstSessionDate" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        result['common.firstSessionDate'] = firstSessionDate;
        // __GDPR__COMMON__ "common.lastSessionDate" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        result['common.lastSessionDate'] = lastSessionDate || '';
        // __GDPR__COMMON__ "common.isNewSession" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        result['common.isNewSession'] = !lastSessionDate ? '1' : '0';
        // __GDPR__COMMON__ "common.remoteAuthority" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" }
        result['common.remoteAuthority'] = (0, telemetryUtils_1.$lo)(remoteAuthority);
        // __GDPR__COMMON__ "common.machineId" : { "endPoint": "MacAddressHash", "classification": "EndUserPseudonymizedInformation", "purpose": "FeatureInsight" }
        result['common.machineId'] = machineId;
        // __GDPR__COMMON__ "sessionID" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        result['sessionID'] = uuid.$4f() + Date.now();
        // __GDPR__COMMON__ "commitHash" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" }
        result['commitHash'] = commit;
        // __GDPR__COMMON__ "version" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        result['version'] = version;
        // __GDPR__COMMON__ "common.platform" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        result['common.platform'] = Platform.$h(Platform.$t);
        // __GDPR__COMMON__ "common.product" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" }
        result['common.product'] = productIdentifier ?? 'web';
        // __GDPR__COMMON__ "common.userAgent" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        result['common.userAgent'] = Platform.$u ? cleanUserAgent(Platform.$u) : undefined;
        // __GDPR__COMMON__ "common.isTouchDevice" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        result['common.isTouchDevice'] = String(touch_1.$EP.isTouchDevice());
        if (isInternalTelemetry) {
            // __GDPR__COMMON__ "common.msftInternal" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true }
            result['common.msftInternal'] = isInternalTelemetry;
        }
        // dynamic properties which value differs on each call
        let seq = 0;
        const startTime = Date.now();
        Object.defineProperties(result, {
            // __GDPR__COMMON__ "timestamp" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
            'timestamp': {
                get: () => new Date(),
                enumerable: true
            },
            // __GDPR__COMMON__ "common.timesincesessionstart" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true }
            'common.timesincesessionstart': {
                get: () => Date.now() - startTime,
                enumerable: true
            },
            // __GDPR__COMMON__ "common.sequence" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true }
            'common.sequence': {
                get: () => seq++,
                enumerable: true
            }
        });
        if (resolveAdditionalProperties) {
            (0, objects_1.$Ym)(result, resolveAdditionalProperties());
        }
        return result;
    }
    exports.$53b = $53b;
});
//# sourceMappingURL=workbenchCommonProperties.js.map