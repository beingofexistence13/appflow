/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/contrib/terminal/common/terminal", "vs/platform/configuration/test/common/testConfigurationService", "vs/workbench/test/common/workbenchTestServices", "vs/workbench/contrib/terminal/browser/terminalProfileService", "vs/workbench/contrib/terminal/common/terminalExtensionPoints", "vs/workbench/contrib/terminal/browser/terminal", "vs/base/common/platform", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/configuration/common/configuration", "vs/workbench/services/extensions/common/extensions", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/environment/common/environmentService", "vs/platform/theme/common/themeService", "vs/base/common/codicons", "assert", "vs/base/common/event", "vs/workbench/contrib/terminal/browser/terminalProfileQuickpick", "vs/platform/theme/test/common/testThemeService", "vs/platform/quickinput/common/quickInput"], function (require, exports, instantiationServiceMock_1, terminal_1, testConfigurationService_1, workbenchTestServices_1, terminalProfileService_1, terminalExtensionPoints_1, terminal_2, platform_1, mockKeybindingService_1, configuration_1, extensions_1, contextkey_1, remoteAgentService_1, environmentService_1, themeService_1, codicons_1, assert_1, event_1, terminalProfileQuickpick_1, testThemeService_1, quickInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TestTerminalProfileService extends terminalProfileService_1.$mWb {
        refreshAvailableProfiles() {
            this.hasRefreshedProfiles = this.F();
        }
        refreshAndAwaitAvailableProfiles() {
            this.refreshAvailableProfiles();
            if (!this.hasRefreshedProfiles) {
                throw new Error('has not refreshed profiles yet');
            }
            return this.hasRefreshedProfiles;
        }
    }
    class MockTerminalProfileService {
        constructor() {
            this.availableProfiles = [];
            this.contributedProfiles = [];
        }
        async getPlatformKey() {
            return 'linux';
        }
        getDefaultProfileName() {
            return this._defaultProfileName;
        }
        setProfiles(profiles, contributed) {
            this.availableProfiles = profiles;
            this.contributedProfiles = contributed;
        }
        setDefaultProfileName(name) {
            this._defaultProfileName = name;
        }
    }
    class MockQuickInputService {
        constructor() {
            this._pick = powershellPick;
        }
        async pick(picks, options, token) {
            Promise.resolve(picks);
            return this._pick;
        }
        setPick(pick) {
            this._pick = pick;
        }
    }
    class TestTerminalProfileQuickpick extends terminalProfileQuickpick_1.$rVb {
    }
    class TestTerminalExtensionService extends workbenchTestServices_1.$aec {
        constructor() {
            super(...arguments);
            this._onDidChangeExtensions = new event_1.$fd();
        }
    }
    class TestTerminalContributionService {
        constructor() {
            this.terminalProfiles = [];
        }
        setProfiles(profiles) {
            this.terminalProfiles = profiles;
        }
    }
    class TestTerminalInstanceService {
        constructor() {
            this.a = new Map();
            this.b = true;
        }
        async getBackend(remoteAuthority) {
            return {
                getProfiles: async () => {
                    if (this.b) {
                        return this.a.get(remoteAuthority ?? '') || [];
                    }
                    else {
                        this.b = true;
                        return [];
                    }
                }
            };
        }
        setProfiles(remoteAuthority, profiles) {
            this.a.set(remoteAuthority ?? '', profiles);
        }
        setReturnNone() {
            this.b = false;
        }
    }
    class TestRemoteAgentService {
        setEnvironment(os) {
            this.a = os;
        }
        async getEnvironment() {
            return { os: this.a };
        }
    }
    const defaultTerminalConfig = { profiles: { windows: {}, linux: {}, osx: {} } };
    let powershellProfile = {
        profileName: 'PowerShell',
        path: 'C:\\Powershell.exe',
        isDefault: true,
        icon: codicons_1.$Pj.terminalPowershell
    };
    let jsdebugProfile = {
        extensionIdentifier: 'ms-vscode.js-debug-nightly',
        icon: 'debug',
        id: 'extension.js-debug.debugTerminal',
        title: 'JavaScript Debug Terminal'
    };
    const powershellPick = { label: 'Powershell', profile: powershellProfile, profileName: powershellProfile.profileName };
    const jsdebugPick = { label: 'Javascript Debug Terminal', profile: jsdebugProfile, profileName: jsdebugProfile.title };
    suite('TerminalProfileService', () => {
        let configurationService;
        let terminalInstanceService;
        let terminalProfileService;
        let remoteAgentService;
        let extensionService;
        let environmentService;
        let instantiationService;
        setup(async () => {
            configurationService = new testConfigurationService_1.$G0b({ terminal: { integrated: defaultTerminalConfig } });
            remoteAgentService = new TestRemoteAgentService();
            terminalInstanceService = new TestTerminalInstanceService();
            extensionService = new TestTerminalExtensionService();
            environmentService = { remoteAuthority: undefined };
            instantiationService = new instantiationServiceMock_1.$L0b();
            const themeService = new testThemeService_1.$K0b();
            const terminalContributionService = new TestTerminalContributionService();
            const contextKeyService = new mockKeybindingService_1.$S0b();
            instantiationService.stub(contextkey_1.$3i, contextKeyService);
            instantiationService.stub(extensions_1.$MF, extensionService);
            instantiationService.stub(configuration_1.$8h, configurationService);
            instantiationService.stub(remoteAgentService_1.$jm, remoteAgentService);
            instantiationService.stub(terminalExtensionPoints_1.$kWb, terminalContributionService);
            instantiationService.stub(terminal_2.$Pib, terminalInstanceService);
            instantiationService.stub(environmentService_1.$hJ, environmentService);
            instantiationService.stub(themeService_1.$gv, themeService);
            terminalProfileService = instantiationService.createInstance(TestTerminalProfileService);
            //reset as these properties are changed in each test
            powershellProfile = {
                profileName: 'PowerShell',
                path: 'C:\\Powershell.exe',
                isDefault: true,
                icon: codicons_1.$Pj.terminalPowershell
            };
            jsdebugProfile = {
                extensionIdentifier: 'ms-vscode.js-debug-nightly',
                icon: 'debug',
                id: 'extension.js-debug.debugTerminal',
                title: 'JavaScript Debug Terminal'
            };
            terminalInstanceService.setProfiles(undefined, [powershellProfile]);
            terminalInstanceService.setProfiles('fakeremote', []);
            terminalContributionService.setProfiles([jsdebugProfile]);
            if (platform_1.$i) {
                remoteAgentService.setEnvironment(1 /* OperatingSystem.Windows */);
            }
            else if (platform_1.$k) {
                remoteAgentService.setEnvironment(3 /* OperatingSystem.Linux */);
            }
            else {
                remoteAgentService.setEnvironment(2 /* OperatingSystem.Macintosh */);
            }
            configurationService.setUserConfiguration('terminal', { integrated: defaultTerminalConfig });
        });
        teardown(() => {
            instantiationService.dispose();
        });
        suite('Contributed Profiles', () => {
            test('should filter out contributed profiles set to null (Linux)', async () => {
                remoteAgentService.setEnvironment(3 /* OperatingSystem.Linux */);
                await configurationService.setUserConfiguration('terminal', {
                    integrated: {
                        profiles: {
                            linux: {
                                'JavaScript Debug Terminal': null
                            }
                        }
                    }
                });
                configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: () => true, source: 2 /* ConfigurationTarget.USER */ });
                await terminalProfileService.refreshAndAwaitAvailableProfiles();
                (0, assert_1.deepStrictEqual)(terminalProfileService.availableProfiles, [powershellProfile]);
                (0, assert_1.deepStrictEqual)(terminalProfileService.contributedProfiles, []);
            });
            test('should filter out contributed profiles set to null (Windows)', async () => {
                remoteAgentService.setEnvironment(1 /* OperatingSystem.Windows */);
                await configurationService.setUserConfiguration('terminal', {
                    integrated: {
                        profiles: {
                            windows: {
                                'JavaScript Debug Terminal': null
                            }
                        }
                    }
                });
                configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: () => true, source: 2 /* ConfigurationTarget.USER */ });
                await terminalProfileService.refreshAndAwaitAvailableProfiles();
                (0, assert_1.deepStrictEqual)(terminalProfileService.availableProfiles, [powershellProfile]);
                (0, assert_1.deepStrictEqual)(terminalProfileService.contributedProfiles, []);
            });
            test('should filter out contributed profiles set to null (macOS)', async () => {
                remoteAgentService.setEnvironment(2 /* OperatingSystem.Macintosh */);
                await configurationService.setUserConfiguration('terminal', {
                    integrated: {
                        profiles: {
                            osx: {
                                'JavaScript Debug Terminal': null
                            }
                        }
                    }
                });
                configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: () => true, source: 2 /* ConfigurationTarget.USER */ });
                await terminalProfileService.refreshAndAwaitAvailableProfiles();
                (0, assert_1.deepStrictEqual)(terminalProfileService.availableProfiles, [powershellProfile]);
                (0, assert_1.deepStrictEqual)(terminalProfileService.contributedProfiles, []);
            });
            test('should include contributed profiles', async () => {
                await terminalProfileService.refreshAndAwaitAvailableProfiles();
                (0, assert_1.deepStrictEqual)(terminalProfileService.availableProfiles, [powershellProfile]);
                (0, assert_1.deepStrictEqual)(terminalProfileService.contributedProfiles, [jsdebugProfile]);
            });
        });
        test('should get profiles from remoteTerminalService when there is a remote authority', async () => {
            environmentService = { remoteAuthority: 'fakeremote' };
            instantiationService.stub(environmentService_1.$hJ, environmentService);
            terminalProfileService = instantiationService.createInstance(TestTerminalProfileService);
            await terminalProfileService.hasRefreshedProfiles;
            (0, assert_1.deepStrictEqual)(terminalProfileService.availableProfiles, []);
            (0, assert_1.deepStrictEqual)(terminalProfileService.contributedProfiles, [jsdebugProfile]);
            terminalInstanceService.setProfiles('fakeremote', [powershellProfile]);
            await terminalProfileService.refreshAndAwaitAvailableProfiles();
            (0, assert_1.deepStrictEqual)(terminalProfileService.availableProfiles, [powershellProfile]);
            (0, assert_1.deepStrictEqual)(terminalProfileService.contributedProfiles, [jsdebugProfile]);
        });
        test('should fire onDidChangeAvailableProfiles only when available profiles have changed via user config', async () => {
            powershellProfile.icon = codicons_1.$Pj.lightBulb;
            let calls = [];
            terminalProfileService.onDidChangeAvailableProfiles(e => calls.push(e));
            await configurationService.setUserConfiguration('terminal', {
                integrated: {
                    profiles: {
                        windows: powershellProfile,
                        linux: powershellProfile,
                        osx: powershellProfile
                    }
                }
            });
            await terminalProfileService.hasRefreshedProfiles;
            (0, assert_1.deepStrictEqual)(calls, [
                [powershellProfile]
            ]);
            (0, assert_1.deepStrictEqual)(terminalProfileService.availableProfiles, [powershellProfile]);
            (0, assert_1.deepStrictEqual)(terminalProfileService.contributedProfiles, [jsdebugProfile]);
            calls = [];
            await terminalProfileService.refreshAndAwaitAvailableProfiles();
            (0, assert_1.deepStrictEqual)(calls, []);
        });
        test('should fire onDidChangeAvailableProfiles when available or contributed profiles have changed via remote/localTerminalService', async () => {
            powershellProfile.isDefault = false;
            terminalInstanceService.setProfiles(undefined, [powershellProfile]);
            const calls = [];
            terminalProfileService.onDidChangeAvailableProfiles(e => calls.push(e));
            await terminalProfileService.hasRefreshedProfiles;
            (0, assert_1.deepStrictEqual)(calls, [
                [powershellProfile]
            ]);
            (0, assert_1.deepStrictEqual)(terminalProfileService.availableProfiles, [powershellProfile]);
            (0, assert_1.deepStrictEqual)(terminalProfileService.contributedProfiles, [jsdebugProfile]);
        });
        test('should call refreshAvailableProfiles _onDidChangeExtensions', async () => {
            extensionService._onDidChangeExtensions.fire();
            const calls = [];
            terminalProfileService.onDidChangeAvailableProfiles(e => calls.push(e));
            await terminalProfileService.hasRefreshedProfiles;
            (0, assert_1.deepStrictEqual)(calls, [
                [powershellProfile]
            ]);
            (0, assert_1.deepStrictEqual)(terminalProfileService.availableProfiles, [powershellProfile]);
            (0, assert_1.deepStrictEqual)(terminalProfileService.contributedProfiles, [jsdebugProfile]);
        });
        suite('Profiles Quickpick', () => {
            let quickInputService;
            let mockTerminalProfileService;
            let terminalProfileQuickpick;
            setup(async () => {
                quickInputService = new MockQuickInputService();
                mockTerminalProfileService = new MockTerminalProfileService();
                instantiationService.stub(quickInput_1.$Gq, quickInputService);
                instantiationService.stub(terminal_1.$GM, mockTerminalProfileService);
                terminalProfileQuickpick = instantiationService.createInstance(TestTerminalProfileQuickpick);
            });
            test('setDefault', async () => {
                powershellProfile.isDefault = false;
                mockTerminalProfileService.setProfiles([powershellProfile], [jsdebugProfile]);
                mockTerminalProfileService.setDefaultProfileName(jsdebugProfile.title);
                const result = await terminalProfileQuickpick.showAndGetResult('setDefault');
                (0, assert_1.deepStrictEqual)(result, powershellProfile.profileName);
            });
            test('setDefault to contributed', async () => {
                mockTerminalProfileService.setDefaultProfileName(powershellProfile.profileName);
                quickInputService.setPick(jsdebugPick);
                const result = await terminalProfileQuickpick.showAndGetResult('setDefault');
                const expected = {
                    config: {
                        extensionIdentifier: jsdebugProfile.extensionIdentifier,
                        id: jsdebugProfile.id,
                        options: { color: undefined, icon: 'debug' },
                        title: jsdebugProfile.title,
                    },
                    keyMods: undefined
                };
                (0, assert_1.deepStrictEqual)(result, expected);
            });
            test('createInstance', async () => {
                mockTerminalProfileService.setDefaultProfileName(powershellProfile.profileName);
                const pick = { ...powershellPick, keyMods: { alt: true, ctrlCmd: false } };
                quickInputService.setPick(pick);
                const result = await terminalProfileQuickpick.showAndGetResult('createInstance');
                (0, assert_1.deepStrictEqual)(result, { config: powershellProfile, keyMods: { alt: true, ctrlCmd: false } });
            });
            test('createInstance with contributed', async () => {
                const pick = { ...jsdebugPick, keyMods: { alt: true, ctrlCmd: false } };
                quickInputService.setPick(pick);
                const result = await terminalProfileQuickpick.showAndGetResult('createInstance');
                const expected = {
                    config: {
                        extensionIdentifier: jsdebugProfile.extensionIdentifier,
                        id: jsdebugProfile.id,
                        options: { color: undefined, icon: 'debug' },
                        title: jsdebugProfile.title,
                    },
                    keyMods: { alt: true, ctrlCmd: false }
                };
                (0, assert_1.deepStrictEqual)(result, expected);
            });
        });
    });
});
//# sourceMappingURL=terminalProfileService.integrationTest.js.map