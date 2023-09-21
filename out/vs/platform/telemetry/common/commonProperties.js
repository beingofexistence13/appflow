/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/base/common/process", "vs/base/common/uuid"], function (require, exports, platform_1, process_1, uuid_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.verifyMicrosoftInternalDomain = exports.resolveCommonProperties = void 0;
    function getPlatformDetail(hostname) {
        if (platform_1.platform === 2 /* Platform.Linux */ && /^penguin(\.|$)/i.test(hostname)) {
            return 'chromebook';
        }
        return undefined;
    }
    function resolveCommonProperties(release, hostname, arch, commit, version, machineId, isInternalTelemetry, product) {
        const result = Object.create(null);
        // __GDPR__COMMON__ "common.machineId" : { "endPoint": "MacAddressHash", "classification": "EndUserPseudonymizedInformation", "purpose": "FeatureInsight" }
        result['common.machineId'] = machineId;
        // __GDPR__COMMON__ "sessionID" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        result['sessionID'] = (0, uuid_1.generateUuid)() + Date.now();
        // __GDPR__COMMON__ "commitHash" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" }
        result['commitHash'] = commit;
        // __GDPR__COMMON__ "version" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        result['version'] = version;
        // __GDPR__COMMON__ "common.platformVersion" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        result['common.platformVersion'] = (release || '').replace(/^(\d+)(\.\d+)?(\.\d+)?(.*)/, '$1$2$3');
        // __GDPR__COMMON__ "common.platform" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        result['common.platform'] = (0, platform_1.PlatformToString)(platform_1.platform);
        // __GDPR__COMMON__ "common.nodePlatform" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" }
        result['common.nodePlatform'] = process_1.platform;
        // __GDPR__COMMON__ "common.nodeArch" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" }
        result['common.nodeArch'] = arch;
        // __GDPR__COMMON__ "common.product" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" }
        result['common.product'] = product || 'desktop';
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
        if (platform_1.isLinuxSnap) {
            // __GDPR__COMMON__ "common.snap" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
            result['common.snap'] = 'true';
        }
        const platformDetail = getPlatformDetail(hostname);
        if (platformDetail) {
            // __GDPR__COMMON__ "common.platformDetail" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
            result['common.platformDetail'] = platformDetail;
        }
        return result;
    }
    exports.resolveCommonProperties = resolveCommonProperties;
    function verifyMicrosoftInternalDomain(domainList) {
        const userDnsDomain = process_1.env['USERDNSDOMAIN'];
        if (!userDnsDomain) {
            return false;
        }
        const domain = userDnsDomain.toLowerCase();
        return domainList.some(msftDomain => domain === msftDomain);
    }
    exports.verifyMicrosoftInternalDomain = verifyMicrosoftInternalDomain;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uUHJvcGVydGllcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3RlbGVtZXRyeS9jb21tb24vY29tbW9uUHJvcGVydGllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFPaEcsU0FBUyxpQkFBaUIsQ0FBQyxRQUFnQjtRQUMxQyxJQUFJLG1CQUFRLDJCQUFtQixJQUFJLGlCQUFpQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUNwRSxPQUFPLFlBQVksQ0FBQztTQUNwQjtRQUVELE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFFRCxTQUFnQix1QkFBdUIsQ0FDdEMsT0FBZSxFQUNmLFFBQWdCLEVBQ2hCLElBQVksRUFDWixNQUEwQixFQUMxQixPQUEyQixFQUMzQixTQUE2QixFQUM3QixtQkFBNEIsRUFDNUIsT0FBZ0I7UUFFaEIsTUFBTSxNQUFNLEdBQXNCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFdEQsMkpBQTJKO1FBQzNKLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLFNBQVMsQ0FBQztRQUN2QyxxR0FBcUc7UUFDckcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUEsbUJBQVksR0FBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNsRCw0R0FBNEc7UUFDNUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLE1BQU0sQ0FBQztRQUM5QixtR0FBbUc7UUFDbkcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLE9BQU8sQ0FBQztRQUM1QixrSEFBa0g7UUFDbEgsTUFBTSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLDRCQUE0QixFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ25HLDJHQUEyRztRQUMzRyxNQUFNLENBQUMsaUJBQWlCLENBQUMsR0FBRyxJQUFBLDJCQUFnQixFQUFDLG1CQUFRLENBQUMsQ0FBQztRQUN2RCxxSEFBcUg7UUFDckgsTUFBTSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsa0JBQVksQ0FBQztRQUM3QyxpSEFBaUg7UUFDakgsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ2pDLGdIQUFnSDtRQUNoSCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxPQUFPLElBQUksU0FBUyxDQUFDO1FBRWhELElBQUksbUJBQW1CLEVBQUU7WUFDeEIsc0lBQXNJO1lBQ3RJLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLG1CQUFtQixDQUFDO1NBQ3BEO1FBRUQsc0RBQXNEO1FBQ3RELElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztRQUNaLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM3QixNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFO1lBQy9CLHFHQUFxRztZQUNyRyxXQUFXLEVBQUU7Z0JBQ1osR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksSUFBSSxFQUFFO2dCQUNyQixVQUFVLEVBQUUsSUFBSTthQUNoQjtZQUNELCtJQUErSTtZQUMvSSw4QkFBOEIsRUFBRTtnQkFDL0IsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxTQUFTO2dCQUNqQyxVQUFVLEVBQUUsSUFBSTthQUNoQjtZQUNELGtJQUFrSTtZQUNsSSxpQkFBaUIsRUFBRTtnQkFDbEIsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRTtnQkFDaEIsVUFBVSxFQUFFLElBQUk7YUFDaEI7U0FDRCxDQUFDLENBQUM7UUFFSCxJQUFJLHNCQUFXLEVBQUU7WUFDaEIsdUdBQXVHO1lBQ3ZHLE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxNQUFNLENBQUM7U0FDL0I7UUFFRCxNQUFNLGNBQWMsR0FBRyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVuRCxJQUFJLGNBQWMsRUFBRTtZQUNuQixpSEFBaUg7WUFDakgsTUFBTSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsY0FBYyxDQUFDO1NBQ2pEO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDO0lBdEVELDBEQXNFQztJQUVELFNBQWdCLDZCQUE2QixDQUFDLFVBQTZCO1FBQzFFLE1BQU0sYUFBYSxHQUFHLGFBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ25CLE9BQU8sS0FBSyxDQUFDO1NBQ2I7UUFFRCxNQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDM0MsT0FBTyxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsTUFBTSxLQUFLLFVBQVUsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFSRCxzRUFRQyJ9