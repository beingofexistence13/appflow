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
        const configurationService = new testConfigurationService_1.$G0b();
        setup(() => {
            disposables = new lifecycle_1.$jc();
            const fileService = disposables.add(new fileService_1.$Dp(new log_1.$fj()));
            const instantiationService = disposables.add(new instantiationServiceMock_1.$L0b(new serviceCollection_1.$zh([preferences_1.$BE, preferencesService], [configuration_1.$8h, configurationService])));
            _debugConfigurationManager = new debugConfigurationManager_1.$PRb(adapterManager, new workbenchTestServices_2.$6dc(), configurationService, new workbenchTestServices_1.$afc(), instantiationService, new workbenchTestServices_2.$7dc(), new workbenchTestServices_2.$aec(), new workbenchTestServices_1.$uec(), new uriIdentityService_1.$pr(fileService), new contextKeyService_1.$xtb(configurationService));
        });
        teardown(() => disposables.dispose());
        (0, utils_1.$bT)();
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
//# sourceMappingURL=debugConfigurationManager.test.js.map