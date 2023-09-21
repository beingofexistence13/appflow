/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "os", "vs/workbench/services/telemetry/common/workbenchCommonProperties", "vs/platform/storage/common/storage", "vs/base/common/async", "vs/base/test/common/utils"], function (require, exports, assert, os_1, workbenchCommonProperties_1, storage_1, async_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Telemetry - common properties', function () {
        const commit = (undefined);
        const version = (undefined);
        let testStorageService;
        setup(() => {
            testStorageService = new storage_1.InMemoryStorageService();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('default', function () {
            const props = (0, workbenchCommonProperties_1.resolveWorkbenchCommonProperties)(testStorageService, (0, os_1.release)(), (0, os_1.hostname)(), commit, version, 'someMachineId', false, process);
            assert.ok('commitHash' in props);
            assert.ok('sessionID' in props);
            assert.ok('timestamp' in props);
            assert.ok('common.platform' in props);
            assert.ok('common.nodePlatform' in props);
            assert.ok('common.nodeArch' in props);
            assert.ok('common.timesincesessionstart' in props);
            assert.ok('common.sequence' in props);
            // assert.ok('common.version.shell' in first.data); // only when running on electron
            // assert.ok('common.version.renderer' in first.data);
            assert.ok('common.platformVersion' in props, 'platformVersion');
            assert.ok('version' in props);
            assert.ok('common.firstSessionDate' in props, 'firstSessionDate');
            assert.ok('common.lastSessionDate' in props, 'lastSessionDate'); // conditional, see below, 'lastSessionDate'ow
            assert.ok('common.isNewSession' in props, 'isNewSession');
            // machine id et al
            assert.ok('common.machineId' in props, 'machineId');
        });
        test('lastSessionDate when available', function () {
            testStorageService.store('telemetry.lastSessionDate', new Date().toUTCString(), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            const props = (0, workbenchCommonProperties_1.resolveWorkbenchCommonProperties)(testStorageService, (0, os_1.release)(), (0, os_1.hostname)(), commit, version, 'someMachineId', false, process);
            assert.ok('common.lastSessionDate' in props); // conditional, see below
            assert.ok('common.isNewSession' in props);
            assert.strictEqual(props['common.isNewSession'], '0');
        });
        test('values chance on ask', async function () {
            const props = (0, workbenchCommonProperties_1.resolveWorkbenchCommonProperties)(testStorageService, (0, os_1.release)(), (0, os_1.hostname)(), commit, version, 'someMachineId', false, process);
            let value1 = props['common.sequence'];
            let value2 = props['common.sequence'];
            assert.ok(value1 !== value2, 'seq');
            value1 = props['timestamp'];
            value2 = props['timestamp'];
            assert.ok(value1 !== value2, 'timestamp');
            value1 = props['common.timesincesessionstart'];
            await (0, async_1.timeout)(10);
            value2 = props['common.timesincesessionstart'];
            assert.ok(value1 !== value2, 'timesincesessionstart');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uUHJvcGVydGllcy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3RlbGVtZXRyeS90ZXN0L25vZGUvY29tbW9uUHJvcGVydGllcy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBU2hHLEtBQUssQ0FBQywrQkFBK0IsRUFBRTtRQUN0QyxNQUFNLE1BQU0sR0FBVyxDQUFDLFNBQVMsQ0FBRSxDQUFDO1FBQ3BDLE1BQU0sT0FBTyxHQUFXLENBQUMsU0FBUyxDQUFFLENBQUM7UUFDckMsSUFBSSxrQkFBbUMsQ0FBQztRQUV4QyxLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1Ysa0JBQWtCLEdBQUcsSUFBSSxnQ0FBc0IsRUFBRSxDQUFDO1FBQ25ELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDZixNQUFNLEtBQUssR0FBRyxJQUFBLDREQUFnQyxFQUFDLGtCQUFrQixFQUFFLElBQUEsWUFBTyxHQUFFLEVBQUUsSUFBQSxhQUFRLEdBQUUsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDNUksTUFBTSxDQUFDLEVBQUUsQ0FBQyxZQUFZLElBQUksS0FBSyxDQUFDLENBQUM7WUFDakMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxXQUFXLElBQUksS0FBSyxDQUFDLENBQUM7WUFDaEMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxXQUFXLElBQUksS0FBSyxDQUFDLENBQUM7WUFDaEMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsSUFBSSxLQUFLLENBQUMsQ0FBQztZQUN0QyxNQUFNLENBQUMsRUFBRSxDQUFDLHFCQUFxQixJQUFJLEtBQUssQ0FBQyxDQUFDO1lBQzFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsaUJBQWlCLElBQUksS0FBSyxDQUFDLENBQUM7WUFDdEMsTUFBTSxDQUFDLEVBQUUsQ0FBQyw4QkFBOEIsSUFBSSxLQUFLLENBQUMsQ0FBQztZQUNuRCxNQUFNLENBQUMsRUFBRSxDQUFDLGlCQUFpQixJQUFJLEtBQUssQ0FBQyxDQUFDO1lBQ3RDLG9GQUFvRjtZQUNwRixzREFBc0Q7WUFDdEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyx3QkFBd0IsSUFBSSxLQUFLLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQUNoRSxNQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsSUFBSSxLQUFLLENBQUMsQ0FBQztZQUM5QixNQUFNLENBQUMsRUFBRSxDQUFDLHlCQUF5QixJQUFJLEtBQUssRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1lBQ2xFLE1BQU0sQ0FBQyxFQUFFLENBQUMsd0JBQXdCLElBQUksS0FBSyxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQyw4Q0FBOEM7WUFDL0csTUFBTSxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsSUFBSSxLQUFLLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDMUQsbUJBQW1CO1lBQ25CLE1BQU0sQ0FBQyxFQUFFLENBQUMsa0JBQWtCLElBQUksS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3JELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGdDQUFnQyxFQUFFO1lBRXRDLGtCQUFrQixDQUFDLEtBQUssQ0FBQywyQkFBMkIsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxtRUFBa0QsQ0FBQztZQUVqSSxNQUFNLEtBQUssR0FBRyxJQUFBLDREQUFnQyxFQUFDLGtCQUFrQixFQUFFLElBQUEsWUFBTyxHQUFFLEVBQUUsSUFBQSxhQUFRLEdBQUUsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDNUksTUFBTSxDQUFDLEVBQUUsQ0FBQyx3QkFBd0IsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLHlCQUF5QjtZQUN2RSxNQUFNLENBQUMsRUFBRSxDQUFDLHFCQUFxQixJQUFJLEtBQUssQ0FBQyxDQUFDO1lBQzFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdkQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsc0JBQXNCLEVBQUUsS0FBSztZQUNqQyxNQUFNLEtBQUssR0FBRyxJQUFBLDREQUFnQyxFQUFDLGtCQUFrQixFQUFFLElBQUEsWUFBTyxHQUFFLEVBQUUsSUFBQSxhQUFRLEdBQUUsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDNUksSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDdEMsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDdEMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEtBQUssTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRXBDLE1BQU0sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDNUIsTUFBTSxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUM1QixNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sS0FBSyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFFMUMsTUFBTSxHQUFHLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sSUFBQSxlQUFPLEVBQUMsRUFBRSxDQUFDLENBQUM7WUFDbEIsTUFBTSxHQUFHLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxLQUFLLE1BQU0sRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO1FBQ3ZELENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUMifQ==