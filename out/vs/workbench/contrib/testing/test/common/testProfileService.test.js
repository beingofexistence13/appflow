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
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        setup(() => {
            idCounter = 0;
            ds = new lifecycle_1.DisposableStore();
            t = ds.add(new testProfileService_1.TestProfileService(new mockKeybindingService_1.MockContextKeyService(), ds.add(new workbenchTestServices_1.TestStorageService())));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdFByb2ZpbGVTZXJ2aWNlLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXN0aW5nL3Rlc3QvY29tbW9uL3Rlc3RQcm9maWxlU2VydmljZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBWWhHLEtBQUssQ0FBQyxnQ0FBZ0MsRUFBRSxHQUFHLEVBQUU7UUFDNUMsSUFBSSxDQUFxQixDQUFDO1FBQzFCLElBQUksRUFBbUIsQ0FBQztRQUN4QixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7UUFFbEIsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUNiLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNkLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDVixTQUFTLEdBQUcsQ0FBQyxDQUFDO1lBQ2QsRUFBRSxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBQzNCLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksdUNBQWtCLENBQ2hDLElBQUksNkNBQXFCLEVBQUUsRUFDM0IsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLDBDQUFrQixFQUFFLENBQUMsQ0FDaEMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLFVBQVUsR0FBRyxDQUFDLE9BQWlDLEVBQUUsRUFBRTtZQUN4RCxNQUFNLENBQUMsR0FBb0I7Z0JBQzFCLFlBQVksRUFBRSxRQUFRO2dCQUN0QixLQUFLLGtDQUEwQjtnQkFDL0IsU0FBUyxFQUFFLElBQUk7Z0JBQ2YsS0FBSyxFQUFFLFNBQVM7Z0JBQ2hCLFNBQVMsRUFBRSxTQUFTLEVBQUU7Z0JBQ3RCLHVCQUF1QixFQUFFLEtBQUs7Z0JBQzlCLEdBQUcsRUFBRSxJQUFJO2dCQUNU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