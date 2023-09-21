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
            testStorageService = new storage_1.$Zo();
        });
        (0, utils_1.$bT)();
        test('default', function () {
            const props = (0, workbenchCommonProperties_1.$T_b)(testStorageService, (0, os_1.release)(), (0, os_1.hostname)(), commit, version, 'someMachineId', false, process);
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
            const props = (0, workbenchCommonProperties_1.$T_b)(testStorageService, (0, os_1.release)(), (0, os_1.hostname)(), commit, version, 'someMachineId', false, process);
            assert.ok('common.lastSessionDate' in props); // conditional, see below
            assert.ok('common.isNewSession' in props);
            assert.strictEqual(props['common.isNewSession'], '0');
        });
        test('values chance on ask', async function () {
            const props = (0, workbenchCommonProperties_1.$T_b)(testStorageService, (0, os_1.release)(), (0, os_1.hostname)(), commit, version, 'someMachineId', false, process);
            let value1 = props['common.sequence'];
            let value2 = props['common.sequence'];
            assert.ok(value1 !== value2, 'seq');
            value1 = props['timestamp'];
            value2 = props['timestamp'];
            assert.ok(value1 !== value2, 'timestamp');
            value1 = props['common.timesincesessionstart'];
            await (0, async_1.$Hg)(10);
            value2 = props['common.timesincesessionstart'];
            assert.ok(value1 !== value2, 'timesincesessionstart');
        });
    });
});
//# sourceMappingURL=commonProperties.test.js.map