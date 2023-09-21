/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/uri", "vs/platform/configuration/common/configurations", "vs/platform/files/common/fileService", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/platform/log/common/log", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "vs/base/common/buffer", "vs/base/common/objects", "vs/platform/policy/common/filePolicyService", "vs/base/test/common/timeTravelScheduler", "vs/base/test/common/utils"], function (require, exports, assert, event_1, uri_1, configurations_1, fileService_1, inMemoryFilesystemProvider_1, log_1, configurationRegistry_1, platform_1, buffer_1, objects_1, filePolicyService_1, timeTravelScheduler_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('PolicyConfiguration', () => {
        const disposables = (0, utils_1.$bT)();
        let testObject;
        let fileService;
        let policyService;
        const policyFile = uri_1.URI.file('policyFile').with({ scheme: 'vscode-tests' });
        const policyConfigurationNode = {
            'id': 'policyConfiguration',
            'order': 1,
            'title': 'a',
            'type': 'object',
            'properties': {
                'policy.settingA': {
                    'type': 'string',
                    'default': 'defaultValueA',
                    policy: {
                        name: 'PolicySettingA',
                        minimumVersion: '1.0.0',
                    }
                },
                'policy.settingB': {
                    'type': 'string',
                    'default': 'defaultValueB',
                    policy: {
                        name: 'PolicySettingB',
                        minimumVersion: '1.0.0',
                    }
                },
                'nonPolicy.setting': {
                    'type': 'boolean',
                    'default': true
                }
            }
        };
        suiteSetup(() => platform_1.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration(policyConfigurationNode));
        suiteTeardown(() => platform_1.$8m.as(configurationRegistry_1.$an.Configuration).deregisterConfigurations([policyConfigurationNode]));
        setup(async () => {
            const defaultConfiguration = disposables.add(new configurations_1.$wn());
            await defaultConfiguration.initialize();
            fileService = disposables.add(new fileService_1.$Dp(new log_1.$fj()));
            const diskFileSystemProvider = disposables.add(new inMemoryFilesystemProvider_1.$rAb());
            disposables.add(fileService.registerProvider(policyFile.scheme, diskFileSystemProvider));
            policyService = disposables.add(new filePolicyService_1.$m7b(policyFile, fileService, new log_1.$fj()));
            testObject = disposables.add(new configurations_1.$yn(defaultConfiguration, policyService, new log_1.$fj()));
        });
        test('initialize: with policies', async () => {
            await fileService.writeFile(policyFile, buffer_1.$Fd.fromString(JSON.stringify({ 'PolicySettingA': 'policyValueA' })));
            await testObject.initialize();
            const acutal = testObject.configurationModel;
            assert.strictEqual(acutal.getValue('policy.settingA'), 'policyValueA');
            assert.strictEqual(acutal.getValue('policy.settingB'), undefined);
            assert.strictEqual(acutal.getValue('nonPolicy.setting'), undefined);
            assert.deepStrictEqual(acutal.keys, ['policy.settingA']);
            assert.deepStrictEqual(acutal.overrides, []);
        });
        test('initialize: no policies', async () => {
            await testObject.initialize();
            const acutal = testObject.configurationModel;
            assert.deepStrictEqual(acutal.keys, []);
            assert.deepStrictEqual(acutal.overrides, []);
            assert.strictEqual(acutal.getValue('policy.settingA'), undefined);
            assert.strictEqual(acutal.getValue('policy.settingB'), undefined);
            assert.strictEqual(acutal.getValue('nonPolicy.setting'), undefined);
        });
        test('initialize: with policies but not registered', async () => {
            await fileService.writeFile(policyFile, buffer_1.$Fd.fromString(JSON.stringify({ 'PolicySettingA': 'policyValueA', 'PolicySettingB': 'policyValueB', 'PolicySettingC': 'policyValueC' })));
            await testObject.initialize();
            const acutal = testObject.configurationModel;
            assert.strictEqual(acutal.getValue('policy.settingA'), 'policyValueA');
            assert.strictEqual(acutal.getValue('policy.settingB'), 'policyValueB');
            assert.strictEqual(acutal.getValue('nonPolicy.setting'), undefined);
            assert.deepStrictEqual(acutal.keys, ['policy.settingA', 'policy.settingB']);
            assert.deepStrictEqual(acutal.overrides, []);
        });
        test('change: when policy is added', async () => {
            await fileService.writeFile(policyFile, buffer_1.$Fd.fromString(JSON.stringify({ 'PolicySettingA': 'policyValueA' })));
            await testObject.initialize();
            await (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
                const promise = event_1.Event.toPromise(testObject.onDidChangeConfiguration);
                await fileService.writeFile(policyFile, buffer_1.$Fd.fromString(JSON.stringify({ 'PolicySettingA': 'policyValueA', 'PolicySettingB': 'policyValueB', 'PolicySettingC': 'policyValueC' })));
                await promise;
            });
            const acutal = testObject.configurationModel;
            assert.strictEqual(acutal.getValue('policy.settingA'), 'policyValueA');
            assert.strictEqual(acutal.getValue('policy.settingB'), 'policyValueB');
            assert.strictEqual(acutal.getValue('nonPolicy.setting'), undefined);
            assert.deepStrictEqual(acutal.keys, ['policy.settingA', 'policy.settingB']);
            assert.deepStrictEqual(acutal.overrides, []);
        });
        test('change: when policy is updated', async () => {
            await fileService.writeFile(policyFile, buffer_1.$Fd.fromString(JSON.stringify({ 'PolicySettingA': 'policyValueA' })));
            await testObject.initialize();
            await (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
                const promise = event_1.Event.toPromise(testObject.onDidChangeConfiguration);
                await fileService.writeFile(policyFile, buffer_1.$Fd.fromString(JSON.stringify({ 'PolicySettingA': 'policyValueAChanged' })));
                await promise;
            });
            const acutal = testObject.configurationModel;
            assert.strictEqual(acutal.getValue('policy.settingA'), 'policyValueAChanged');
            assert.strictEqual(acutal.getValue('policy.settingB'), undefined);
            assert.strictEqual(acutal.getValue('nonPolicy.setting'), undefined);
            assert.deepStrictEqual(acutal.keys, ['policy.settingA']);
            assert.deepStrictEqual(acutal.overrides, []);
        });
        test('change: when policy is removed', async () => {
            await fileService.writeFile(policyFile, buffer_1.$Fd.fromString(JSON.stringify({ 'PolicySettingA': 'policyValueA' })));
            await testObject.initialize();
            await (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
                const promise = event_1.Event.toPromise(testObject.onDidChangeConfiguration);
                await fileService.writeFile(policyFile, buffer_1.$Fd.fromString(JSON.stringify({})));
                await promise;
            });
            const acutal = testObject.configurationModel;
            assert.strictEqual(acutal.getValue('policy.settingA'), undefined);
            assert.strictEqual(acutal.getValue('policy.settingB'), undefined);
            assert.strictEqual(acutal.getValue('nonPolicy.setting'), undefined);
            assert.deepStrictEqual(acutal.keys, []);
            assert.deepStrictEqual(acutal.overrides, []);
        });
        test('change: when policy setting is registered', async () => {
            await fileService.writeFile(policyFile, buffer_1.$Fd.fromString(JSON.stringify({ 'PolicySettingC': 'policyValueC' })));
            await testObject.initialize();
            const promise = event_1.Event.toPromise(testObject.onDidChangeConfiguration);
            policyConfigurationNode.properties['policy.settingC'] = {
                'type': 'string',
                'default': 'defaultValueC',
                policy: {
                    name: 'PolicySettingC',
                    minimumVersion: '1.0.0',
                }
            };
            platform_1.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration((0, objects_1.$Vm)(policyConfigurationNode));
            await promise;
            const acutal = testObject.configurationModel;
            assert.strictEqual(acutal.getValue('policy.settingC'), 'policyValueC');
            assert.strictEqual(acutal.getValue('policy.settingA'), undefined);
            assert.strictEqual(acutal.getValue('policy.settingB'), undefined);
            assert.strictEqual(acutal.getValue('nonPolicy.setting'), undefined);
            assert.deepStrictEqual(acutal.keys, ['policy.settingC']);
            assert.deepStrictEqual(acutal.overrides, []);
        });
        test('change: when policy setting is deregistered', async () => {
            await fileService.writeFile(policyFile, buffer_1.$Fd.fromString(JSON.stringify({ 'PolicySettingA': 'policyValueA' })));
            await testObject.initialize();
            const promise = event_1.Event.toPromise(testObject.onDidChangeConfiguration);
            platform_1.$8m.as(configurationRegistry_1.$an.Configuration).deregisterConfigurations([policyConfigurationNode]);
            await promise;
            const acutal = testObject.configurationModel;
            assert.strictEqual(acutal.getValue('policy.settingA'), undefined);
            assert.strictEqual(acutal.getValue('policy.settingB'), undefined);
            assert.strictEqual(acutal.getValue('nonPolicy.setting'), undefined);
            assert.deepStrictEqual(acutal.keys, []);
            assert.deepStrictEqual(acutal.overrides, []);
        });
    });
});
//# sourceMappingURL=policyConfiguration.test.js.map