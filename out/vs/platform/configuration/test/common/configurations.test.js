/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/objects", "vs/base/test/common/utils", "vs/platform/configuration/common/configurationRegistry", "vs/platform/configuration/common/configurations", "vs/platform/registry/common/platform"], function (require, exports, assert, event_1, objects_1, utils_1, configurationRegistry_1, configurations_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('DefaultConfiguration', () => {
        const disposables = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
        setup(() => reset());
        teardown(() => reset());
        function reset() {
            configurationRegistry.deregisterConfigurations(configurationRegistry.getConfigurations());
            const configurationDefaultsOverrides = configurationRegistry.getConfigurationDefaultsOverrides();
            configurationRegistry.deregisterDefaultConfigurations([...configurationDefaultsOverrides.keys()].map(key => ({ extensionId: configurationDefaultsOverrides.get(key)?.source, overrides: { [key]: configurationDefaultsOverrides.get(key)?.value } })));
        }
        test('Test registering a property before initialize', async () => {
            const testObject = disposables.add(new configurations_1.DefaultConfiguration());
            configurationRegistry.registerConfiguration({
                'id': 'a',
                'order': 1,
                'title': 'a',
                'type': 'object',
                'properties': {
                    'a': {
                        'description': 'a',
                        'type': 'boolean',
                        'default': false,
                    }
                }
            });
            const actual = await testObject.initialize();
            assert.strictEqual(actual.getValue('a'), false);
        });
        test('Test registering a property and do not initialize', async () => {
            const testObject = disposables.add(new configurations_1.DefaultConfiguration());
            configurationRegistry.registerConfiguration({
                'id': 'a',
                'order': 1,
                'title': 'a',
                'type': 'object',
                'properties': {
                    'a': {
                        'description': 'a',
                        'type': 'boolean',
                        'default': false,
                    }
                }
            });
            assert.strictEqual(testObject.configurationModel.getValue('a'), undefined);
        });
        test('Test registering a property after initialize', async () => {
            const testObject = disposables.add(new configurations_1.DefaultConfiguration());
            await testObject.initialize();
            const promise = event_1.Event.toPromise(testObject.onDidChangeConfiguration);
            configurationRegistry.registerConfiguration({
                'id': 'a',
                'order': 1,
                'title': 'a',
                'type': 'object',
                'properties': {
                    'defaultConfiguration.testSetting1': {
                        'description': 'a',
                        'type': 'boolean',
                        'default': false,
                    }
                }
            });
            const { defaults: actual, properties } = await promise;
            assert.strictEqual(actual.getValue('defaultConfiguration.testSetting1'), false);
            assert.deepStrictEqual(properties, ['defaultConfiguration.testSetting1']);
        });
        test('Test registering nested properties', async () => {
            const testObject = disposables.add(new configurations_1.DefaultConfiguration());
            configurationRegistry.registerConfiguration({
                'id': 'a',
                'order': 1,
                'title': 'a',
                'type': 'object',
                'properties': {
                    'a.b': {
                        'description': '1',
                        'type': 'object',
                        'default': {},
                    },
                    'a.b.c': {
                        'description': '2',
                        'type': 'object',
                        'default': '2',
                    }
                }
            });
            const actual = await testObject.initialize();
            assert.ok((0, objects_1.equals)(actual.getValue('a'), { b: { c: '2' } }));
            assert.ok((0, objects_1.equals)(actual.contents, { 'a': { b: { c: '2' } } }));
            assert.deepStrictEqual(actual.keys, ['a.b', 'a.b.c']);
        });
        test('Test registering the same property again', async () => {
            const testObject = disposables.add(new configurations_1.DefaultConfiguration());
            configurationRegistry.registerConfiguration({
                'id': 'a',
                'order': 1,
                'title': 'a',
                'type': 'object',
                'properties': {
                    'a': {
                        'description': 'a',
                        'type': 'boolean',
                        'default': true,
                    }
                }
            });
            configurationRegistry.registerConfiguration({
                'id': 'a',
                'order': 1,
                'title': 'a',
                'type': 'object',
                'properties': {
                    'a': {
                        'description': 'a',
                        'type': 'boolean',
                        'default': false,
                    }
                }
            });
            const actual = await testObject.initialize();
            assert.strictEqual(true, actual.getValue('a'));
        });
        test('Test registering an override identifier', async () => {
            const testObject = disposables.add(new configurations_1.DefaultConfiguration());
            configurationRegistry.registerDefaultConfigurations([{
                    overrides: {
                        '[a]': {
                            'b': true
                        }
                    }
                }]);
            const actual = await testObject.initialize();
            assert.ok((0, objects_1.equals)(actual.getValue('[a]'), { 'b': true }));
            assert.ok((0, objects_1.equals)(actual.contents, { '[a]': { 'b': true } }));
            assert.ok((0, objects_1.equals)(actual.overrides, [{ contents: { 'b': true }, identifiers: ['a'], keys: ['b'] }]));
            assert.deepStrictEqual(actual.keys, ['[a]']);
            assert.strictEqual(actual.getOverrideValue('b', 'a'), true);
        });
        test('Test registering a normal property and override identifier', async () => {
            const testObject = disposables.add(new configurations_1.DefaultConfiguration());
            configurationRegistry.registerConfiguration({
                'id': 'a',
                'order': 1,
                'title': 'a',
                'type': 'object',
                'properties': {
                    'b': {
                        'description': 'b',
                        'type': 'boolean',
                        'default': false,
                    }
                }
            });
            configurationRegistry.registerDefaultConfigurations([{
                    overrides: {
                        '[a]': {
                            'b': true
                        }
                    }
                }]);
            const actual = await testObject.initialize();
            assert.deepStrictEqual(actual.getValue('b'), false);
            assert.ok((0, objects_1.equals)(actual.getValue('[a]'), { 'b': true }));
            assert.ok((0, objects_1.equals)(actual.contents, { 'b': false, '[a]': { 'b': true } }));
            assert.ok((0, objects_1.equals)(actual.overrides, [{ contents: { 'b': true }, identifiers: ['a'], keys: ['b'] }]));
            assert.deepStrictEqual(actual.keys, ['b', '[a]']);
            assert.strictEqual(actual.getOverrideValue('b', 'a'), true);
        });
        test('Test normal property is registered after override identifier', async () => {
            const testObject = disposables.add(new configurations_1.DefaultConfiguration());
            const promise = event_1.Event.toPromise(testObject.onDidChangeConfiguration);
            configurationRegistry.registerDefaultConfigurations([{
                    overrides: {
                        '[a]': {
                            'b': true
                        }
                    }
                }]);
            await testObject.initialize();
            configurationRegistry.registerConfiguration({
                'id': 'a',
                'order': 1,
                'title': 'a',
                'type': 'object',
                'properties': {
                    'b': {
                        'description': 'b',
                        'type': 'boolean',
                        'default': false,
                    }
                }
            });
            const { defaults: actual, properties } = await promise;
            assert.deepStrictEqual(actual.getValue('b'), false);
            assert.ok((0, objects_1.equals)(actual.getValue('[a]'), { 'b': true }));
            assert.ok((0, objects_1.equals)(actual.contents, { 'b': false, '[a]': { 'b': true } }));
            assert.ok((0, objects_1.equals)(actual.overrides, [{ contents: { 'b': true }, identifiers: ['a'], keys: ['b'] }]));
            assert.deepStrictEqual(actual.keys, ['[a]', 'b']);
            assert.strictEqual(actual.getOverrideValue('b', 'a'), true);
            assert.deepStrictEqual(properties, ['b']);
        });
        test('Test override identifier is registered after property', async () => {
            const testObject = disposables.add(new configurations_1.DefaultConfiguration());
            const promise = event_1.Event.toPromise(testObject.onDidChangeConfiguration);
            configurationRegistry.registerConfiguration({
                'id': 'a',
                'order': 1,
                'title': 'a',
                'type': 'object',
                'properties': {
                    'b': {
                        'description': 'b',
                        'type': 'boolean',
                        'default': false,
                    }
                }
            });
            await testObject.initialize();
            configurationRegistry.registerDefaultConfigurations([{
                    overrides: {
                        '[a]': {
                            'b': true
                        }
                    }
                }]);
            const { defaults: actual, properties } = await promise;
            assert.deepStrictEqual(actual.getValue('b'), false);
            assert.ok((0, objects_1.equals)(actual.getValue('[a]'), { 'b': true }));
            assert.ok((0, objects_1.equals)(actual.contents, { 'b': false, '[a]': { 'b': true } }));
            assert.ok((0, objects_1.equals)(actual.overrides, [{ contents: { 'b': true }, identifiers: ['a'], keys: ['b'] }]));
            assert.deepStrictEqual(actual.keys, ['b', '[a]']);
            assert.strictEqual(actual.getOverrideValue('b', 'a'), true);
            assert.deepStrictEqual(properties, ['[a]']);
        });
        test('Test register override identifier and property after initialize', async () => {
            const testObject = disposables.add(new configurations_1.DefaultConfiguration());
            await testObject.initialize();
            configurationRegistry.registerConfiguration({
                'id': 'a',
                'order': 1,
                'title': 'a',
                'type': 'object',
                'properties': {
                    'b': {
                        'description': 'b',
                        'type': 'boolean',
                        'default': false,
                    }
                }
            });
            configurationRegistry.registerDefaultConfigurations([{
                    overrides: {
                        '[a]': {
                            'b': true
                        }
                    }
                }]);
            const actual = testObject.configurationModel;
            assert.deepStrictEqual(actual.getValue('b'), false);
            assert.ok((0, objects_1.equals)(actual.getValue('[a]'), { 'b': true }));
            assert.ok((0, objects_1.equals)(actual.contents, { 'b': false, '[a]': { 'b': true } }));
            assert.ok((0, objects_1.equals)(actual.overrides, [{ contents: { 'b': true }, identifiers: ['a'], keys: ['b'] }]));
            assert.deepStrictEqual(actual.keys, ['b', '[a]']);
            assert.strictEqual(actual.getOverrideValue('b', 'a'), true);
        });
        test('Test deregistering a property', async () => {
            const testObject = disposables.add(new configurations_1.DefaultConfiguration());
            const promise = event_1.Event.toPromise(testObject.onDidChangeConfiguration);
            const node = {
                'id': 'a',
                'order': 1,
                'title': 'a',
                'type': 'object',
                'properties': {
                    'a': {
                        'description': 'a',
                        'type': 'boolean',
                        'default': false,
                    }
                }
            };
            configurationRegistry.registerConfiguration(node);
            await testObject.initialize();
            configurationRegistry.deregisterConfigurations([node]);
            const { defaults: actual, properties } = await promise;
            assert.strictEqual(actual.getValue('a'), undefined);
            assert.ok((0, objects_1.equals)(actual.contents, {}));
            assert.deepStrictEqual(actual.keys, []);
            assert.deepStrictEqual(properties, ['a']);
        });
        test('Test deregistering an override identifier', async () => {
            const testObject = disposables.add(new configurations_1.DefaultConfiguration());
            configurationRegistry.registerConfiguration({
                'id': 'a',
                'order': 1,
                'title': 'a',
                'type': 'object',
                'properties': {
                    'b': {
                        'description': 'b',
                        'type': 'boolean',
                        'default': false,
                    }
                }
            });
            const node = {
                overrides: {
                    '[a]': {
                        'b': true
                    }
                }
            };
            configurationRegistry.registerDefaultConfigurations([node]);
            await testObject.initialize();
            configurationRegistry.deregisterDefaultConfigurations([node]);
            assert.deepStrictEqual(testObject.configurationModel.getValue('[a]'), undefined);
            assert.ok((0, objects_1.equals)(testObject.configurationModel.contents, { 'b': false }));
            assert.ok((0, objects_1.equals)(testObject.configurationModel.overrides, []));
            assert.deepStrictEqual(testObject.configurationModel.keys, ['b']);
            assert.strictEqual(testObject.configurationModel.getOverrideValue('b', 'a'), undefined);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbnMudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2NvbmZpZ3VyYXRpb24vdGVzdC9jb21tb24vY29uZmlndXJhdGlvbnMudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVVoRyxLQUFLLENBQUMsc0JBQXNCLEVBQUUsR0FBRyxFQUFFO1FBRWxDLE1BQU0sV0FBVyxHQUFHLElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUM5RCxNQUFNLHFCQUFxQixHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUF5QixrQ0FBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRTVGLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3JCLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBRXhCLFNBQVMsS0FBSztZQUNiLHFCQUFxQixDQUFDLHdCQUF3QixDQUFDLHFCQUFxQixDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQztZQUMxRixNQUFNLDhCQUE4QixHQUFHLHFCQUFxQixDQUFDLGlDQUFpQyxFQUFFLENBQUM7WUFDakcscUJBQXFCLENBQUMsK0JBQStCLENBQUMsQ0FBQyxHQUFHLDhCQUE4QixDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLFdBQVcsRUFBRSw4QkFBOEIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsOEJBQThCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeFAsQ0FBQztRQUVELElBQUksQ0FBQywrQ0FBK0Ms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