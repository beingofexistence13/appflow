/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/network", "vs/base/common/uri", "vs/base/test/common/timeTravelScheduler", "vs/base/test/common/utils", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/configuration/common/configurationService", "vs/platform/files/common/fileService", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/platform/log/common/log", "vs/platform/policy/common/policy", "vs/platform/registry/common/platform"], function (require, exports, assert, buffer_1, event_1, network_1, uri_1, timeTravelScheduler_1, utils_1, configuration_1, configurationRegistry_1, configurationService_1, fileService_1, inMemoryFilesystemProvider_1, log_1, policy_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ConfigurationService.test.ts', () => {
        const disposables = (0, utils_1.$bT)();
        let fileService;
        let settingsResource;
        setup(async () => {
            fileService = disposables.add(new fileService_1.$Dp(new log_1.$fj()));
            const diskFileSystemProvider = disposables.add(new inMemoryFilesystemProvider_1.$rAb());
            disposables.add(fileService.registerProvider(network_1.Schemas.file, diskFileSystemProvider));
            settingsResource = uri_1.URI.file('settings.json');
        });
        test('simple', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            await fileService.writeFile(settingsResource, buffer_1.$Fd.fromString('{ "foo": "bar" }'));
            const testObject = disposables.add(new configurationService_1.$zn(settingsResource, fileService, new policy_1.$_m(), new log_1.$fj()));
            await testObject.initialize();
            const config = testObject.getValue();
            assert.ok(config);
            assert.strictEqual(config.foo, 'bar');
        }));
        test('config gets flattened', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            await fileService.writeFile(settingsResource, buffer_1.$Fd.fromString('{ "testworkbench.editor.tabs": true }'));
            const testObject = disposables.add(new configurationService_1.$zn(settingsResource, fileService, new policy_1.$_m(), new log_1.$fj()));
            await testObject.initialize();
            const config = testObject.getValue();
            assert.ok(config);
            assert.ok(config.testworkbench);
            assert.ok(config.testworkbench.editor);
            assert.strictEqual(config.testworkbench.editor.tabs, true);
        }));
        test('error case does not explode', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            await fileService.writeFile(settingsResource, buffer_1.$Fd.fromString(',,,,'));
            const testObject = disposables.add(new configurationService_1.$zn(settingsResource, fileService, new policy_1.$_m(), new log_1.$fj()));
            await testObject.initialize();
            const config = testObject.getValue();
            assert.ok(config);
        }));
        test('missing file does not explode', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposables.add(new configurationService_1.$zn(uri_1.URI.file('__testFile'), fileService, new policy_1.$_m(), new log_1.$fj()));
            await testObject.initialize();
            const config = testObject.getValue();
            assert.ok(config);
        }));
        test('trigger configuration change event when file does not exist', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposables.add(new configurationService_1.$zn(settingsResource, fileService, new policy_1.$_m(), new log_1.$fj()));
            await testObject.initialize();
            return new Promise((c, e) => {
                disposables.add(event_1.Event.filter(testObject.onDidChangeConfiguration, e => e.source === 2 /* ConfigurationTarget.USER */)(() => {
                    assert.strictEqual(testObject.getValue('foo'), 'bar');
                    c();
                }));
                fileService.writeFile(settingsResource, buffer_1.$Fd.fromString('{ "foo": "bar" }')).catch(e);
            });
        }));
        test('trigger configuration change event when file exists', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposables.add(new configurationService_1.$zn(settingsResource, fileService, new policy_1.$_m(), new log_1.$fj()));
            await fileService.writeFile(settingsResource, buffer_1.$Fd.fromString('{ "foo": "bar" }'));
            await testObject.initialize();
            return new Promise((c) => {
                disposables.add(event_1.Event.filter(testObject.onDidChangeConfiguration, e => e.source === 2 /* ConfigurationTarget.USER */)(async (e) => {
                    assert.strictEqual(testObject.getValue('foo'), 'barz');
                    c();
                }));
                fileService.writeFile(settingsResource, buffer_1.$Fd.fromString('{ "foo": "barz" }'));
            });
        }));
        test('reloadConfiguration', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            await fileService.writeFile(settingsResource, buffer_1.$Fd.fromString('{ "foo": "bar" }'));
            const testObject = disposables.add(new configurationService_1.$zn(settingsResource, fileService, new policy_1.$_m(), new log_1.$fj()));
            await testObject.initialize();
            let config = testObject.getValue();
            assert.ok(config);
            assert.strictEqual(config.foo, 'bar');
            await fileService.writeFile(settingsResource, buffer_1.$Fd.fromString('{ "foo": "changed" }'));
            // force a reload to get latest
            await testObject.reloadConfiguration();
            config = testObject.getValue();
            assert.ok(config);
            assert.strictEqual(config.foo, 'changed');
        }));
        test('model defaults', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const configurationRegistry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
            configurationRegistry.registerConfiguration({
                'id': '_test',
                'type': 'object',
                'properties': {
                    'configuration.service.testSetting': {
                        'type': 'string',
                        'default': 'isSet'
                    }
                }
            });
            let testObject = disposables.add(new configurationService_1.$zn(uri_1.URI.file('__testFile'), fileService, new policy_1.$_m(), new log_1.$fj()));
            await testObject.initialize();
            let setting = testObject.getValue();
            assert.ok(setting);
            assert.strictEqual(setting.configuration.service.testSetting, 'isSet');
            await fileService.writeFile(settingsResource, buffer_1.$Fd.fromString('{ "testworkbench.editor.tabs": true }'));
            testObject = disposables.add(new configurationService_1.$zn(settingsResource, fileService, new policy_1.$_m(), new log_1.$fj()));
            await testObject.initialize();
            setting = testObject.getValue();
            assert.ok(setting);
            assert.strictEqual(setting.configuration.service.testSetting, 'isSet');
            await fileService.writeFile(settingsResource, buffer_1.$Fd.fromString('{ "configuration.service.testSetting": "isChanged" }'));
            await testObject.reloadConfiguration();
            setting = testObject.getValue();
            assert.ok(setting);
            assert.strictEqual(setting.configuration.service.testSetting, 'isChanged');
        }));
        test('lookup', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const configurationRegistry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
            configurationRegistry.registerConfiguration({
                'id': '_test',
                'type': 'object',
                'properties': {
                    'lookup.service.testSetting': {
                        'type': 'string',
                        'default': 'isSet'
                    }
                }
            });
            const testObject = disposables.add(new configurationService_1.$zn(settingsResource, fileService, new policy_1.$_m(), new log_1.$fj()));
            await testObject.initialize();
            let res = testObject.inspect('something.missing');
            assert.strictEqual(res.value, undefined);
            assert.strictEqual(res.defaultValue, undefined);
            assert.strictEqual(res.userValue, undefined);
            assert.strictEqual((0, configuration_1.$_h)(res), false);
            res = testObject.inspect('lookup.service.testSetting');
            assert.strictEqual(res.defaultValue, 'isSet');
            assert.strictEqual(res.value, 'isSet');
            assert.strictEqual(res.userValue, undefined);
            assert.strictEqual((0, configuration_1.$_h)(res), false);
            await fileService.writeFile(settingsResource, buffer_1.$Fd.fromString('{ "lookup.service.testSetting": "bar" }'));
            await testObject.reloadConfiguration();
            res = testObject.inspect('lookup.service.testSetting');
            assert.strictEqual(res.defaultValue, 'isSet');
            assert.strictEqual(res.userValue, 'bar');
            assert.strictEqual(res.value, 'bar');
            assert.strictEqual((0, configuration_1.$_h)(res), true);
        }));
        test('lookup with null', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const configurationRegistry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
            configurationRegistry.registerConfiguration({
                'id': '_testNull',
                'type': 'object',
                'properties': {
                    'lookup.service.testNullSetting': {
                        'type': 'null',
                    }
                }
            });
            const testObject = disposables.add(new configurationService_1.$zn(settingsResource, fileService, new policy_1.$_m(), new log_1.$fj()));
            await testObject.initialize();
            let res = testObject.inspect('lookup.service.testNullSetting');
            assert.strictEqual(res.defaultValue, null);
            assert.strictEqual(res.value, null);
            assert.strictEqual(res.userValue, undefined);
            await fileService.writeFile(settingsResource, buffer_1.$Fd.fromString('{ "lookup.service.testNullSetting": null }'));
            await testObject.reloadConfiguration();
            res = testObject.inspect('lookup.service.testNullSetting');
            assert.strictEqual(res.defaultValue, null);
            assert.strictEqual(res.value, null);
            assert.strictEqual(res.userValue, null);
        }));
    });
});
//# sourceMappingURL=configurationService.test.js.map