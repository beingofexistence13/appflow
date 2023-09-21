/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/base/common/uuid", "vs/platform/telemetry/common/telemetryUtils", "vs/base/common/objects", "vs/platform/telemetry/common/telemetry", "vs/base/browser/touch"], function (require, exports, Platform, uuid, telemetryUtils_1, objects_1, telemetry_1, touch_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resolveWorkbenchCommonProperties = void 0;
    /**
     * General function to help reduce the individuality of user agents
     * @param userAgent userAgent from browser window
     * @returns A simplified user agent with less detail
     */
    function cleanUserAgent(userAgent) {
        return userAgent.replace(/(\d+\.\d+)(\.\d+)+/g, '$1');
    }
    function resolveWorkbenchCommonProperties(storageService, commit, version, isInternalTelemetry, remoteAuthority, productIdentifier, removeMachineId, resolveAdditionalProperties) {
        const result = Object.create(null);
        const firstSessionDate = storageService.get(telemetry_1.firstSessionDateStorageKey, -1 /* StorageScope.APPLICATION */);
        const lastSessionDate = storageService.get(telemetry_1.lastSessionDateStorageKey, -1 /* StorageScope.APPLICATION */);
        let machineId;
        if (!removeMachineId) {
            machineId = storageService.get(telemetry_1.machineIdKey, -1 /* StorageScope.APPLICATION */);
            if (!machineId) {
                machineId = uuid.generateUuid();
                storageService.store(telemetry_1.machineIdKey, machineId, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
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
        result['common.remoteAuthority'] = (0, telemetryUtils_1.cleanRemoteAuthority)(remoteAuthority);
        // __GDPR__COMMON__ "common.machineId" : { "endPoint": "MacAddressHash", "classification": "EndUserPseudonymizedInformation", "purpose": "FeatureInsight" }
        result['common.machineId'] = machineId;
        // __GDPR__COMMON__ "sessionID" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        result['sessionID'] = uuid.generateUuid() + Date.now();
        // __GDPR__COMMON__ "commitHash" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" }
        result['commitHash'] = commit;
        // __GDPR__COMMON__ "version" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        result['version'] = version;
        // __GDPR__COMMON__ "common.platform" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        result['common.platform'] = Platform.PlatformToString(Platform.platform);
        // __GDPR__COMMON__ "common.product" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" }
        result['common.product'] = productIdentifier ?? 'web';
        // __GDPR__COMMON__ "common.userAgent" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        result['common.userAgent'] = Platform.userAgent ? cleanUserAgent(Platform.userAgent) : undefined;
        // __GDPR__COMMON__ "common.isTouchDevice" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        result['common.isTouchDevice'] = String(touch_1.Gesture.isTouchDevice());
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
            (0, objects_1.mixin)(result, resolveAdditionalProperties());
        }
        return result;
    }
    exports.resolveWorkbenchCommonProperties = resolveWorkbenchCommonProperties;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2JlbmNoQ29tbW9uUHJvcGVydGllcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy90ZWxlbWV0cnkvYnJvd3Nlci93b3JrYmVuY2hDb21tb25Qcm9wZXJ0aWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVVoRzs7OztPQUlHO0lBQ0gsU0FBUyxjQUFjLENBQUMsU0FBaUI7UUFDeEMsT0FBTyxTQUFTLENBQUMsT0FBTyxDQUFDLHFCQUFxQixFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFRCxTQUFnQixnQ0FBZ0MsQ0FDL0MsY0FBK0IsRUFDL0IsTUFBMEIsRUFDMUIsT0FBMkIsRUFDM0IsbUJBQTRCLEVBQzVCLGVBQXdCLEVBQ3hCLGlCQUEwQixFQUMxQixlQUF5QixFQUN6QiwyQkFBMEQ7UUFFMUQsTUFBTSxNQUFNLEdBQXNCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEQsTUFBTSxnQkFBZ0IsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLHNDQUEwQixvQ0FBNEIsQ0FBQztRQUNuRyxNQUFNLGVBQWUsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLHFDQUF5QixvQ0FBNEIsQ0FBQztRQUVqRyxJQUFJLFNBQTZCLENBQUM7UUFDbEMsSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUNyQixTQUFTLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQyx3QkFBWSxvQ0FBMkIsQ0FBQztZQUN2RSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNmLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ2hDLGNBQWMsQ0FBQyxLQUFLLENBQUMsd0JBQVksRUFBRSxTQUFTLG1FQUFrRCxDQUFDO2FBQy9GO1NBQ0Q7YUFBTTtZQUNOLFNBQVMsR0FBRyxZQUFZLGlCQUFpQixJQUFJLEtB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