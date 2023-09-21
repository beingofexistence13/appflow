/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/workbench/contrib/testing/common/testProfileService", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, lifecycle_1, utils_1, mockKeybindingService_1, testProfileService_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workbench - TestProfileService', () => {
        let t;
        let ds;
        let idCounter = 0;
        teardown(() => {
            ds.dispose();
        });
        (0, utils_1.$bT)();
        setup(() => {
            idCounter = 0;
            ds = new lifecycle_1.$jc();
            t = ds.add(new testProfileService_1.$_sb(new mockKeybindingService_1.$S0b(), ds.add(new workbenchTestServices_1.$7dc())));
        });
        const addProfile = (profile) => {
            const p = {
                controllerId: 'ctrlId',
                group: 2 /* TestRunProfileBitset.Run */,
                isDefault: true,
                label: 'profile',
                profileId: idCounter++,
                hasConfigurationHandler: false,
                tag: null,
                supportsContinuousRun: false,
                ...profile,
            };
            t.addProfile(null, p);
            return p;
        };
        const expectProfiles = (expected, actual) => {
            const e = expected.map(e => e.label).sort();
            const a = actual.sort();
            assert.deepStrictEqual(e, a);
        };
        test('getGroupDefaultProfiles', () => {
            addProfile({ isDefault: true, group: 4 /* TestRunProfileBitset.Debug */, label: 'a' });
            addProfile({ isDefault: false, group: 4 /* TestRunProfileBitset.Debug */, label: 'b' });
            addProfile({ isDefault: true, group: 2 /* TestRunProfileBitset.Run */, label: 'c' });
            addProfile({ isDefault: true, group: 2 /* TestRunProfileBitset.Run */, label: 'd', controllerId: '2' });
            addProfile({ isDefault: false, group: 2 /* TestRunProfileBitset.Run */, label: 'e', controllerId: '2' });
            expectProfiles(t.getGroupDefaultProfiles(2 /* TestRunProfileBitset.Run */), ['c', 'd']);
            expectProfiles(t.getGroupDefaultProfiles(4 /* TestRunProfileBitset.Debug */), ['a']);
        });
        suite('setGroupDefaultProfiles', () => {
            test('applies simple changes', () => {
                const p1 = addProfile({ isDefault: false, group: 4 /* TestRunProfileBitset.Debug */, label: 'a' });
                addProfile({ isDefault: false, group: 4 /* TestRunProfileBitset.Debug */, label: 'b' });
                const p3 = addProfile({ isDefault: false, group: 2 /* TestRunProfileBitset.Run */, label: 'c' });
                addProfile({ isDefault: false, group: 2 /* TestRunProfileBitset.Run */, label: 'd' });
                t.setGroupDefaultProfiles(2 /* TestRunProfileBitset.Run */, [p3]);
                assert.deepStrictEqual(t.getGroupDefaultProfiles(2 /* TestRunProfileBitset.Run */), [p3]);
                assert.deepStrictEqual(t.getGroupDefaultProfiles(4 /* TestRunProfileBitset.Debug */), [p1]);
            });
            test('syncs labels if same', () => {
                const p1 = addProfile({ isDefault: false, group: 4 /* TestRunProfileBitset.Debug */, label: 'a' });
                const p2 = addProfile({ isDefault: false, group: 4 /* TestRunProfileBitset.Debug */, label: 'b' });
                const p3 = addProfile({ isDefault: false, group: 2 /* TestRunProfileBitset.Run */, label: 'a' });
                const p4 = addProfile({ isDefault: false, group: 2 /* TestRunProfileBitset.Run */, label: 'b' });
                t.setGroupDefaultProfiles(2 /* TestRunProfileBitset.Run */, [p3]);
                assert.deepStrictEqual(t.getGroupDefaultProfiles(2 /* TestRunProfileBitset.Run */), [p3]);
                assert.deepStrictEqual(t.getGroupDefaultProfiles(4 /* TestRunProfileBitset.Debug */), [p1]);
                t.setGroupDefaultProfiles(4 /* TestRunProfileBitset.Debug */, [p2]);
                assert.deepStrictEqual(t.getGroupDefaultProfiles(2 /* TestRunProfileBitset.Run */), [p4]);
                assert.deepStrictEqual(t.getGroupDefaultProfiles(4 /* TestRunProfileBitset.Debug */), [p2]);
            });
            test('does not mess up sync for multiple controllers', () => {
                // ctrl a and b both of have their own labels. ctrl c does not and should be unaffected
                const p1 = addProfile({ isDefault: false, controllerId: 'a', group: 4 /* TestRunProfileBitset.Debug */, label: 'a' });
                const p2 = addProfile({ isDefault: false, controllerId: 'b', group: 4 /* TestRunProfileBitset.Debug */, label: 'b1' });
                const p3 = addProfile({ isDefault: false, controllerId: 'b', group: 4 /* TestRunProfileBitset.Debug */, label: 'b2' });
                const p4 = addProfile({ isDefault: false, controllerId: 'c', group: 4 /* TestRunProfileBitset.Debug */, label: 'c1' });
                const p5 = addProfile({ isDefault: false, controllerId: 'a', group: 2 /* TestRunProfileBitset.Run */, label: 'a' });
                const p6 = addProfile({ isDefault: false, controllerId: 'b', group: 2 /* TestRunProfileBitset.Run */, label: 'b1' });
                const p7 = addProfile({ isDefault: false, controllerId: 'b', group: 2 /* TestRunProfileBitset.Run */, label: 'b2' });
                const p8 = addProfile({ isDefault: false, controllerId: 'b', group: 2 /* TestRunProfileBitset.Run */, label: 'b3' });
                // same profile on both
                t.setGroupDefaultProfiles(4 /* TestRunProfileBitset.Debug */, [p3]);
                assert.deepStrictEqual(t.getGroupDefaultProfiles(2 /* TestRunProfileBitset.Run */), [p7]);
                assert.deepStrictEqual(t.getGroupDefaultProfiles(4 /* TestRunProfileBitset.Debug */), [p3]);
                // different profile, other should be unaffected
                t.setGroupDefaultProfiles(2 /* TestRunProfileBitset.Run */, [p8]);
                assert.deepStrictEqual(t.getGroupDefaultProfiles(2 /* TestRunProfileBitset.Run */), [p8]);
                assert.deepStrictEqual(t.getGroupDefaultProfiles(4 /* TestRunProfileBitset.Debug */), [p3]);
                // multiple changes in one go, with unmatched c
                t.setGroupDefaultProfiles(4 /* TestRunProfileBitset.Debug */, [p1, p2, p4]);
                assert.deepStrictEqual(t.getGroupDefaultProfiles(2 /* TestRunProfileBitset.Run */), [p5, p6]);
                assert.deepStrictEqual(t.getGroupDefaultProfiles(4 /* TestRunProfileBitset.Debug */), [p1, p2, p4]);
                // identity
                t.setGroupDefaultProfiles(2 /* TestRunProfileBitset.Run */, [p5, p8]);
                assert.deepStrictEqual(t.getGroupDefaultProfiles(2 /* TestRunProfileBitset.Run */), [p5, p8]);
                assert.deepStrictEqual(t.getGroupDefaultProfiles(4 /* TestRunProfileBitset.Debug */), [p2, p4, p1]);
            });
        });
    });
});
//# sourceMappingURL=testProfileService.test.js.map