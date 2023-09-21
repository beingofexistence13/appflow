/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/test/common/utils", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/contextkey/browser/contextKeyService", "vs/platform/files/common/fileService", "vs/platform/instantiation/common/serviceCollection", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/log/common/log", "vs/platform/uriIdentity/common/uriIdentityService", "vs/workbench/contrib/debug/browser/debugConfigurationManager", "vs/workbench/contrib/debug/common/debug", "vs/workbench/services/preferences/common/preferences", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, cancellation_1, event_1, lifecycle_1, uri_1, utils_1, configuration_1, testConfigurationService_1, contextKeyService_1, fileService_1, serviceCollection_1, instantiationServiceMock_1, log_1, uriIdentityService_1, debugConfigurationManager_1, debug_1, preferences_1, workbenchTestServices_1, workbenchTestServices_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('debugConfigurationManager', () => {
        const configurationProviderType = 'custom-type';
        let _debugConfigurationManager;
        let disposables;
        const adapterManager = {
            getDebugAdapterDescriptor(session, config) {
                return Promise.resolve(undefined);
            },
            activateDebuggers(activationEvent, debugType) {
                return Promise.resolve();
            },
            get onDidDebuggersExtPointRead() {
                return event_1.Event.None;
            }
        };
        const preferencesService = {
            userSettingsResource: uri_1.URI.file('/tmp/settings.json')
        };
        const configurationService = new testConfigurationService_1.TestConfigurationService();
        setup(() => {
            disposables = new lifecycle_1.DisposableStore();
            const fileService = disposables.add(new fileService_1.FileService(new log_1.NullLogService()));
            const instantiationService = disposables.add(new instantiationServiceMock_1.TestInstantiationService(new serviceCollection_1.ServiceCollection([preferences_1.IPreferencesService, preferencesService], [configuration_1.IConfigurationService, configurationService])));
            _debugConfigurationManager = new debugConfigurationManager_1.ConfigurationManager(adapterManager, new workbenchTestServices_2.TestContextService(), configurationService, new workbenchTestServices_1.TestQuickInputService(), instantiationService, new workbenchTestServices_2.TestStorageService(), new workbenchTestServices_2.TestExtensionService(), new workbenchTestServices_1.TestHistoryService(), new uriIdentityService_1.UriIdentityService(fileService), new contextKeyService_1.ContextKeyService(configurationService));
        });
        teardown(() => disposables.dispose());
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('resolves configuration based on type', async () => {
            disposables.add(_debugConfigurationManager.registerDebugConfigurationProvider({
                type: configurationProviderType,
                resolveDebugConfiguration: (folderUri, config, token) => {
                    assert.strictEqual(config.type, configurationProviderType);
                    return Promise.resolve({
                        ...config,
                        configurationResolved: true
                    });
                },
                triggerKind: debug_1.DebugConfigurationProviderTriggerKind.Initial
            }));
            const initialConfig = {
                type: configurationProviderType,
                request: 'launch',
                name: 'configName',
            };
            const resultConfig = await _debugConfigurationManager.resolveConfigurationByProviders(undefined, configurationProviderType, initialConfig, cancellation_1.CancellationToken.None);
            assert.strictEqual(resultConfig.configurationResolved, true, 'Configuration should be updated by test provider');
        });
        test('resolves configuration from second provider if type changes', async () => {
            const secondProviderType = 'second-provider';
            disposables.add(_debugConfigurationManager.registerDebugConfigurationProvider({
                type: configurationProviderType,
                resolveDebugConfiguration: (folderUri, config, token) => {
                    assert.strictEqual(config.type, configurationProviderType);
                    return Promise.resolve({
                        ...config,
                        type: secondProviderType
                    });
                },
                triggerKind: debug_1.DebugConfigurationProviderTriggerKind.Initial
            }));
            disposables.add(_debugConfigurationManager.registerDebugConfigurationProvider({
                type: secondProviderType,
                resolveDebugConfiguration: (folderUri, config, token) => {
                    assert.strictEqual(config.type, secondProviderType);
                    return Promise.resolve({
                        ...config,
                        configurationResolved: true
                    });
                },
                triggerKind: debug_1.DebugConfigurationProviderTriggerKind.Initial
            }));
            const initialConfig = {
                type: configurationProviderType,
                request: 'launch',
                name: 'configName',
            };
            const resultConfig = await _debugConfigurationManager.resolveConfigurationByProviders(undefined, configurationProviderType, initialConfig, cancellation_1.CancellationToken.None);
            assert.strictEqual(resultConfig.type, secondProviderType);
            assert.strictEqual(resultConfig.configurationResolved, true, 'Configuration should be updated by test provider');
        });
        teardown(() => disposables.clear());
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdDb25maWd1cmF0aW9uTWFuYWdlci50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvdGVzdC9icm93c2VyL2RlYnVnQ29uZmlndXJhdGlvbk1hbmFnZXIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQXNCaEcsS0FBSyxDQUFDLDJCQUEyQixFQUFFLEdBQUcsRUFBRTtRQUN2QyxNQUFNLHlCQUF5QixHQUFHLGFBQWEsQ0FBQztRQUNoRCxJQUFJLDBCQUFnRCxDQUFDO1FBQ3JELElBQUksV0FBNEIsQ0FBQztRQUVqQyxNQUFNLGNBQWMsR0FBb0I7WUFDdkMseUJBQXlCLENBQUMsT0FBc0IsRUFBRSxNQUFlO2dCQUNoRSxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbkMsQ0FBQztZQUVELGlCQUFpQixDQUFDLGVBQXVCLEVBQUUsU0FBa0I7Z0JBQzVELE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzFCLENBQUM7WUFFRCxJQUFJLDBCQUEwQjtnQkFDN0IsT0FBTyxhQUFLLENBQUMsSUFBSSxDQUFDO1lBQ25CLENBQUM7U0FDRCxDQUFDO1FBRUYsTUFBTSxrQkFBa0IsR0FBd0I7WUFDL0Msb0JBQW9CLEVBQUUsU0FBRyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQztTQUNwRCxDQUFDO1FBRUYsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLG1EQUF3QixFQUFFLENBQUM7UUFDNUQsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUNwQyxNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUkseUJBQVcsQ0FBQyxJQUFJLG9CQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0UsTUFB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