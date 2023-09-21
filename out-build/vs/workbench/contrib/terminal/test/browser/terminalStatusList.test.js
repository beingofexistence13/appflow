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
            store = new lifecycle_1.$jc();
            configService = new testConfigurationService_1.$G0b();
            list = store.add(new terminalStatusList_1.$lfb(configService));
        });
        teardown(() => store.dispose());
        (0, utils_1.$bT)();
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
            list.add({ id: 'info', severity: severity_1.default.Info, icon: iconRegistry_1.$dv });
            statusesEqual(list, [
                ['info', severity_1.default.Info]
            ]);
            (0, assert_1.strictEqual)(list.statuses[0].icon.id, codicons_1.$Pj.play.id, 'loading~spin should be converted to play');
            list.add({ id: 'warning', severity: severity_1.default.Warning, icon: themables_1.ThemeIcon.modify(codicons_1.$Pj.zap, 'spin') });
            statusesEqual(list, [
                ['info', severity_1.default.Info],
                ['warning', severity_1.default.Warning]
            ]);
            (0, assert_1.strictEqual)(list.statuses[1].icon.id, codicons_1.$Pj.zap.id, 'zap~spin should have animation removed only');
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
//# sourceMappingURL=terminalStatusList.test.js.map