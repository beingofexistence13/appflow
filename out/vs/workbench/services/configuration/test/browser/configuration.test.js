/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/resources", "vs/base/common/uri", "vs/base/test/common/utils", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "vs/workbench/services/configuration/browser/configuration", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, event_1, resources_1, uri_1, utils_1, configurationRegistry_1, platform_1, configuration_1, environmentService_1, workbenchTestServices_1, workbenchTestServices_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ConfigurationCache {
        constructor() {
            this.cache = new Map();
        }
        needsCaching(resource) { return false; }
        async read({ type, key }) { return this.cache.get(`${type}:${key}`) || ''; }
        async write({ type, key }, content) { this.cache.set(`${type}:${key}`, content); }
        async remove({ type, key }) { this.cache.delete(`${type}:${key}`); }
    }
    suite('DefaultConfiguration', () => {
        const disposables = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
        const cacheKey = { type: 'defaults', key: 'configurationDefaultsOverrides' };
        let configurationCache;
        setup(() => {
            configurationCache = new ConfigurationCache();
            configurationRegistry.registerConfiguration({
                'id': 'test.configurationDefaultsOverride',
                'type': 'object',
                'properties': {
                    'test.configurationDefaultsOverride': {
                        'type': 'string',
                        'default': 'defaultValue',
                    }
                }
            });
        });
        teardown(() => {
            configurationRegistry.deregisterConfigurations(configurationRegistry.getConfigurations());
            const configurationDefaultsOverrides = configurationRegistry.getConfigurationDefaultsOverrides();
            configurationRegistry.deregisterDefaultConfigurations([...configurationDefaultsOverrides.keys()].map(key => ({ extensionId: configurationDefaultsOverrides.get(key)?.source, overrides: { [key]: configurationDefaultsOverrides.get(key)?.value } })));
        });
        test('configuration default overrides are read from environment', async () => {
            const environmentService = new environmentService_1.BrowserWorkbenchEnvironmentService('', (0, resources_1.joinPath)(uri_1.URI.file('tests').with({ scheme: 'vscode-tests' }), 'logs'), { configurationDefaults: { 'test.configurationDefaultsOverride': 'envOverrideValue' } }, workbenchTestServices_2.TestProductService);
            const testObject = disposables.add(new configuration_1.DefaultConfiguration(configurationCache, environmentService));
            await testObject.initialize();
            assert.deepStrictEqual(testObject.configurationModel.getValue('test.configurationDefaultsOverride'), 'envOverrideValue');
        });
        test('configuration default overrides are read from cache', async () => {
            window.localStorage.setItem(configuration_1.DefaultConfiguration.DEFAULT_OVERRIDES_CACHE_EXISTS_KEY, 'yes');
            await configurationCache.write(cacheKey, JSON.stringify({ 'test.configurationDefaultsOverride': 'overrideValue' }));
            const testObject = disposables.add(new configuration_1.DefaultConfiguration(configurationCache, workbenchTestServices_1.TestEnvironmentService));
            const actual = await testObject.initialize();
            assert.deepStrictEqual(actual.getValue('test.configurationDefaultsOverride'), 'overrideValue');
            assert.deepStrictEqual(testObject.configurationModel.getValue('test.configurationDefaultsOverride'), 'overrideValue');
        });
        test('configuration default overrides are not read from cache when model is read before initialize', async () => {
            window.localStorage.setItem(configuration_1.DefaultConfiguration.DEFAULT_OVERRIDES_CACHE_EXISTS_KEY, 'yes');
            await configurationCache.write(cacheKey, JSON.stringify({ 'test.configurationDefaultsOverride': 'overrideValue' }));
            const testObject = disposables.add(new configuration_1.DefaultConfiguration(configurationCache, workbenchTestServices_1.TestEnvironmentService));
            assert.deepStrictEqual(testObject.configurationModel.getValue('test.configurationDefaultsOverride'), undefined);
        });
        test('configuration default overrides read from cache override environment', async () => {
            const environmentService = new environmentService_1.BrowserWorkbenchEnvironmentService('', (0, resources_1.joinPath)(uri_1.URI.file('tests').with({ scheme: 'vscode-tests' }), 'logs'), { configurationDefaults: { 'test.configurationDefaultsOverride': 'envOverrideValue' } }, workbenchTestServices_2.TestProductService);
            window.localStorage.setItem(configuration_1.DefaultConfiguration.DEFAULT_OVERRIDES_CACHE_EXISTS_KEY, 'yes');
            await configurationCache.write(cacheKey, JSON.stringify({ 'test.configurationDefaultsOverride': 'overrideValue' }));
            const testObject = disposables.add(new configuration_1.DefaultConfiguration(configurationCache, environmentService));
            const actual = await testObject.initialize();
            assert.deepStrictEqual(actual.getValue('test.configurationDefaultsOverride'), 'overrideValue');
        });
        test('configuration default overrides are read from cache when default configuration changed', async () => {
            window.localStorage.setItem(configuration_1.DefaultConfiguration.DEFAULT_OVERRIDES_CACHE_EXISTS_KEY, 'yes');
            await configurationCache.write(cacheKey, JSON.stringify({ 'test.configurationDefaultsOverride': 'overrideValue' }));
            const testObject = disposables.add(new configuration_1.DefaultConfiguration(configurationCache, workbenchTestServices_1.TestEnvironmentService));
            await testObject.initialize();
            const promise = event_1.Event.toPromise(testObject.onDidChangeConfiguration);
            configurationRegistry.registerConfiguration({
                'id': 'test.configurationDefaultsOverride',
                'type': 'object',
                'properties': {
                    'test.configurationDefaultsOverride1': {
                        'type': 'string',
                        'default': 'defaultValue',
                    }
                }
            });
            const { defaults: actual } = await promise;
            assert.deepStrictEqual(actual.getValue('test.configurationDefaultsOverride'), 'overrideValue');
        });
        test('configuration default overrides are not read from cache after reload', async () => {
            window.localStorage.setItem(configuration_1.DefaultConfiguration.DEFAULT_OVERRIDES_CACHE_EXISTS_KEY, 'yes');
            await configurationCache.write(cacheKey, JSON.stringify({ 'test.configurationDefaultsOverride': 'overrideValue' }));
            const testObject = disposables.add(new configuration_1.DefaultConfiguration(configurationCache, workbenchTestServices_1.TestEnvironmentService));
            await testObject.initialize();
            const actual = testObject.reload();
            assert.deepStrictEqual(actual.getValue('test.configurationDefaultsOverride'), 'defaultValue');
        });
        test('cache is reset after reload', async () => {
            window.localStorage.setItem(configuration_1.DefaultConfiguration.DEFAULT_OVERRIDES_CACHE_EXISTS_KEY, 'yes');
            await configurationCache.write(cacheKey, JSON.stringify({ 'test.configurationDefaultsOverride': 'overrideValue' }));
            const testObject = disposables.add(new configuration_1.DefaultConfiguration(configurationCache, workbenchTestServices_1.TestEnvironmentService));
            await testObject.initialize();
            testObject.reload();
            assert.deepStrictEqual(await configurationCache.read(cacheKey), '');
        });
        test('configuration default overrides are written in cache', async () => {
            const testObject = disposables.add(new configuration_1.DefaultConfiguration(configurationCache, workbenchTestServices_1.TestEnvironmentService));
            await testObject.initialize();
            testObject.reload();
            const promise = event_1.Event.toPromise(testObject.onDidChangeConfiguration);
            configurationRegistry.registerDefaultConfigurations([{ overrides: { 'test.configurationDefaultsOverride': 'newoverrideValue' } }]);
            await promise;
            const actual = JSON.parse(await configurationCache.read(cacheKey));
            assert.deepStrictEqual(actual, { 'test.configurationDefaultsOverride': 'newoverrideValue' });
        });
        test('configuration default overrides are removed from cache if there are no overrides', async () => {
            const testObject = disposables.add(new configuration_1.DefaultConfiguration(configurationCache, workbenchTestServices_1.TestEnvironmentService));
            await testObject.initialize();
            const promise = event_1.Event.toPromise(testObject.onDidChangeConfiguration);
            configurationRegistry.registerConfiguration({
                'id': 'test.configurationDefaultsOverride',
                'type': 'object',
                'properties': {
                    'test.configurationDefaultsOverride1': {
                        'type': 'string',
                        'default': 'defaultValue',
                    }
                }
            });
            await promise;
            assert.deepStrictEqual(await configurationCache.read(cacheKey), '');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2NvbmZpZ3VyYXRpb24vdGVzdC9icm93c2VyL2NvbmZpZ3VyYXRpb24udGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQWVoRyxNQUFNLGtCQUFrQjtRQUF4QjtZQUNrQixVQUFLLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUM7UUFLcEQsQ0FBQztRQUpBLFlBQVksQ0FBQyxRQUFhLElBQWEsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3RELEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFvQixJQUFxQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMvRyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBb0IsRUFBRSxPQUFlLElBQW1CLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxJQUFJLEdBQUcsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzSCxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBb0IsSUFBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDckc7SUFFRCxLQUFLLENBQUMsc0JBQXNCLEVBQUUsR0FBRyxFQUFFO1FBRWxDLE1BQU0sV0FBVyxHQUFHLElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUM5RCxNQUFNLHFCQUFxQixHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUF5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