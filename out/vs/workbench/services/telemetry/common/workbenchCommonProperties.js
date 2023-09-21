/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/telemetry/common/commonProperties", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils"], function (require, exports, commonProperties_1, telemetry_1, telemetryUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resolveWorkbenchCommonProperties = void 0;
    function resolveWorkbenchCommonProperties(storageService, release, hostname, commit, version, machineId, isInternalTelemetry, process, remoteAuthority) {
        const result = (0, commonProperties_1.resolveCommonProperties)(release, hostname, process.arch, commit, version, machineId, isInternalTelemetry);
        const firstSessionDate = storageService.get(telemetry_1.firstSessionDateStorageKey, -1 /* StorageScope.APPLICATION */);
        const lastSessionDate = storageService.get(telemetry_1.lastSessionDateStorageKey, -1 /* StorageScope.APPLICATION */);
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
        result['common.remoteAuthority'] = (0, telemetryUtils_1.cleanRemoteAuthority)(remoteAuthority);
        // __GDPR__COMMON__ "common.cli" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        result['common.cli'] = !!process.env['VSCODE_CLI'];
        return result;
    }
    exports.resolveWorkbenchCommonProperties = resolveWorkbenchCommonProperties;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2JlbmNoQ29tbW9uUHJvcGVydGllcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy90ZWxlbWV0cnkvY29tbW9uL3dvcmtiZW5jaENvbW1vblByb3BlcnRpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLFNBQWdCLGdDQUFnQyxDQUMvQyxjQUErQixFQUMvQixPQUFlLEVBQ2YsUUFBZ0IsRUFDaEIsTUFBMEIsRUFDMUIsT0FBMkIsRUFDM0IsU0FBaUIsRUFDakIsbUJBQTRCLEVBQzVCLE9BQXFCLEVBQ3JCLGVBQXdCO1FBRXhCLE1BQU0sTUFBTSxHQUFHLElBQUEsMENBQXVCLEVBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLG1CQUFtQixDQUFDLENBQUM7UUFDekgsTUFBTSxnQkFBZ0IsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLHNDQUEwQixvQ0FBNEIsQ0FBQztRQUNuRyxNQUFNLGVBQWUsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLHFDQUF5QixvQ0FBNEIsQ0FBQztRQUVqRyxzSEFBc0g7UUFDdEgsTUFBTSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2hFLHlIQUF5SDtRQUN6SCxNQUFNLENBQUMseUJBQXlCLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDakUsbUhBQW1IO1FBQ25ILE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxHQUFHLGdCQUFnQixDQUFDO1FBQ3JELGtIQUFrSDtRQUNsSCxNQUFNLENBQUMsd0JBQXdCLENBQUMsR0FBRyxlQUFlLElBQUksRUFBRSxDQUFDO1FBQ3pELCtHQUErRztRQUMvRyxNQUFNLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDN0Qsd0hBQXdIO1FBQ3hILE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLElBQUEscUNBQW9CLEVBQUMsZUFBZSxDQUFDLENBQUM7UUFDekUsc0dBQXNHO1FBQ3RHLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUVuRCxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7SUEvQkQsNEVBK0JDIn0=