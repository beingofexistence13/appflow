/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/codicons", "vs/base/common/severity", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/theme/common/iconRegistry", "vs/base/common/themables", "vs/workbench/contrib/terminal/browser/terminalStatusList", "vs/base/test/common/utils", "vs/base/common/lifecycle"], function (require, exports, assert_1, codicons_1, severity_1, testConfigurationService_1, iconRegistry_1, themables_1, terminalStatusList_1, utils_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function statusesEqual(list, expected) {
        (0, assert_1.deepStrictEqual)(list.statuses.map(e => [e.id, e.severity]), expected);
    }
    suite('Workbench - TerminalStatusList', () => {
        let store;
        let list;
        let configService;
        setup(() => {
            store = new lifecycle_1.DisposableStore();
            configService = new testConfigurationService_1.TestConfigurationService();
            list = store.add(new terminalStatusList_1.TerminalStatusList(configService));
        });
        teardown(() => store.dispose());
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('primary', () => {
            (0, assert_1.strictEqual)(list.primary?.id, undefined);
            list.add({ id: 'info1', severity: severity_1.default.Info });
            (0, assert_1.strictEqual)(list.primary?.id, 'info1');
            list.add({ id: 'warning1', severity: severity_1.default.Warning });
            (0, assert_1.strictEqual)(list.primary?.id, 'warning1');
            list.add({ id: 'info2', severity: severity_1.default.Info });
            (0, assert_1.strictEqual)(list.primary?.id, 'warning1');
            list.add({ id: 'warning2', severity: severity_1.default.Warning });
            (0, assert_1.strictEqual)(list.primary?.id, 'warning2');
            list.add({ id: 'info3', severity: severity_1.default.Info });
            (0, assert_1.strictEqual)(list.primary?.id, 'warning2');
            list.add({ id: 'error1', severity: severity_1.default.Error });
            (0, assert_1.strictEqual)(list.primary?.id, 'error1');
            list.add({ id: 'warning3', severity: severity_1.default.Warning });
            (0, assert_1.strictEqual)(list.primary?.id, 'error1');
            list.add({ id: 'error2', severity: severity_1.default.Error });
            (0, assert_1.strictEqual)(list.primary?.id, 'error2');
            list.remove('error1');
            (0, assert_1.strictEqual)(list.primary?.id, 'error2');
            list.remove('error2');
            (0, assert_1.strictEqual)(list.primary?.id, 'warning3');
        });
        test('statuses', () => {
            (0, assert_1.strictEqual)(list.statuses.length, 0);
            list.add({ id: 'info', severity: severity_1.default.Info });
            list.add({ id: 'warning', severity: severity_1.default.Warning });
            list.add({ id: 'error', severity: severity_1.default.Error });
            (0, assert_1.strictEqual)(list.statuses.length, 3);
            statusesEqual(list, [
                ['info', severity_1.default.Info],
                ['warning', severity_1.default.Warning],
                ['error', severity_1.default.Error],
            ]);
            list.remove('info');
            list.remove('warning');
            list.remove('error');
            (0, assert_1.strictEqual)(list.statuses.length, 0);
        });
        test('onDidAddStatus', async () => {
            const result = await new Promise(r => {
                store.add(list.onDidAddStatus(r));
                list.add({ id: 'test', severity: severity_1.default.Info });
            });
            (0, assert_1.deepStrictEqual)(result, { id: 'test', severity: severity_1.default.Info });
        });
        test('onDidRemoveStatus', async () => {
            const result = await new Promise(r => {
                store.add(list.onDidRemoveStatus(r));
                list.add({ id: 'test', severity: severity_1.default.Info });
                list.remove('test');
            });
            (0, assert_1.deepStrictEqual)(result, { id: 'test', severity: severity_1.default.Info });
        });
        test('onDidChangePrimaryStatus', async () => {
            const result = await new Promise(r => {
                store.add(list.onDidRemoveStatus(r));
                list.add({ id: 'test', severity: severity_1.default.Info });
                list.remove('test');
            });
            (0, assert_1.deepStrictEqual)(result, { id: 'test', severity: severity_1.default.Info });
        });
        test('add', () => {
            statusesEqual(list, []);
            list.add({ id: 'info', severity: severity_1.default.Info });
            statusesEqual(list, [
                ['info', severity_1.default.Info]
            ]);
            list.add({ id: 'warning', severity: severity_1.default.Warning });
            statusesEqual(list, [
                ['info', severity_1.default.Info],
                ['warning', severity_1.default.Warning]
            ]);
            list.add({ id: 'error', severity: severity_1.default.Error });
            statusesEqual(list, [
                ['info', severity_1.default.Info],
                ['warning', severity_1.default.Warning],
                ['error', severity_1.default.Error]
            ]);
        });
        test('add should remove animation', () => {
            statusesEqual(list, []);
            list.add({ id: 'info', severity: severity_1.default.Info, icon: iconRegistry_1.spinningLoading });
            statusesEqual(list, [
                ['info', severity_1.default.Info]
            ]);
            (0, assert_1.strictEqual)(list.statuses[0].icon.id, codicons_1.Codicon.play.id, 'loading~spin should be converted to play');
            list.add({ id: 'warning', severity: severity_1.default.Warning, icon: themables_1.ThemeIcon.modify(codicons_1.Codicon.zap, 'spin') });
            statusesEqual(list, [
                ['info', severity_1.default.Info],
                ['warning', severity_1.default.Warning]
            ]);
            (0, assert_1.strictEqual)(list.statuses[1].icon.id, codicons_1.Codicon.zap.id, 'zap~spin should have animation removed only');
        });
        test('add should fire onDidRemoveStatus if same status id with a different object reference was added', () => {
            const eventCalls = [];
            store.add(list.onDidAddStatus(() => eventCalls.push('add')));
            store.add(list.onDidRemoveStatus(() => eventCalls.push('remove')));
            list.add({ id: 'test', severity: severity_1.default.Info });
            list.add({ id: 'test', severity: severity_1.default.Info });
            (0, assert_1.deepStrictEqual)(eventCalls, [
                'add',
                'remove',
                'add'
            ]);
        });
        test('remove', () => {
            list.add({ id: 'info', severity: severity_1.default.Info });
            list.add({ id: 'warning', severity: severity_1.default.Warning });
            list.add({ id: 'error', severity: severity_1.default.Error });
            statusesEqual(list, [
                ['info', severity_1.default.Info],
                ['warning', severity_1.default.Warning],
                ['error', severity_1.default.Error]
            ]);
            list.remove('warning');
            statusesEqual(list, [
                ['info', severity_1.default.Info],
                ['error', severity_1.default.Error]
            ]);
            list.remove('info');
            statusesEqual(list, [
                ['error', severity_1.default.Error]
            ]);
            list.remove('error');
            statusesEqual(list, []);
        });
        test('toggle', () => {
            const status = { id: 'info', severity: severity_1.default.Info };
            list.toggle(status, true);
            statusesEqual(list, [
                ['info', severity_1.default.Info]
            ]);
            list.toggle(status, false);
            statusesEqual(list, []);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxTdGF0dXNMaXN0LnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC90ZXN0L2Jyb3dzZXIvdGVybWluYWxTdGF0dXNMaXN0LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFhaEcsU0FBUyxhQUFhLENBQUMsSUFBd0IsRUFBRSxRQUE4QjtRQUM5RSxJQUFBLHdCQUFlLEVBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUVELEtBQUssQ0FBQyxnQ0FBZ0MsRUFBRSxHQUFHLEVBQUU7UUFDNUMsSUFBSSxLQUFzQixDQUFDO1FBQzNCLElBQUksSUFBd0IsQ0FBQztRQUM3QixJQUFJLGFBQXVDLENBQUM7UUFFNUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLEtBQUssR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUM5QixhQUFhLEdBQUcsSUFBSSxtREFBd0IsRUFBRSxDQUFDO1lBQy9DLElBQUksR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksdUNBQWtCLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUN6RCxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUVoQyxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUU7WUFDcEIsSUFBQSxvQkFBVyxFQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3pDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxrQkFBUSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDbkQsSUFBQSxvQkFBVyxFQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxrQkFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDekQsSUFBQSxvQkFBVyxFQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxrQkFBUSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDbkQsSUFBQSxvQkFBVyxFQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxrQkFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDekQsSUFBQSxvQkFBVyxFQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxrQkFBUSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDbkQsSUFBQSxvQkFBVyxFQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxrQkFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDckQsSUFBQSxvQkFB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