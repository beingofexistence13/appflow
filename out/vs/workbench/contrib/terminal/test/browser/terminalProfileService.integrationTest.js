/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/contrib/terminal/common/terminal", "vs/platform/configuration/test/common/testConfigurationService", "vs/workbench/test/common/workbenchTestServices", "vs/workbench/contrib/terminal/browser/terminalProfileService", "vs/workbench/contrib/terminal/common/terminalExtensionPoints", "vs/workbench/contrib/terminal/browser/terminal", "vs/base/common/platform", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/configuration/common/configuration", "vs/workbench/services/extensions/common/extensions", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/environment/common/environmentService", "vs/platform/theme/common/themeService", "vs/base/common/codicons", "assert", "vs/base/common/event", "vs/workbench/contrib/terminal/browser/terminalProfileQuickpick", "vs/platform/theme/test/common/testThemeService", "vs/platform/quickinput/common/quickInput"], function (require, exports, instantiationServiceMock_1, terminal_1, testConfigurationService_1, workbenchTestServices_1, terminalProfileService_1, terminalExtensionPoints_1, terminal_2, platform_1, mockKeybindingService_1, configuration_1, extensions_1, contextkey_1, remoteAgentService_1, environmentService_1, themeService_1, codicons_1, assert_1, event_1, terminalProfileQuickpick_1, testThemeService_1, quickInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TestTerminalProfileService extends terminalProfileService_1.TerminalProfileService {
        refreshAvailableProfiles() {
            this.hasRefreshedProfiles = this._refreshAvailableProfilesNow();
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
    class TestTerminalProfileQuickpick extends terminalProfileQuickpick_1.TerminalProfileQuickpick {
    }
    class TestTerminalExtensionService extends workbenchTestServices_1.TestExtensionService {
        constructor() {
            super(...arguments);
            this._onDidChangeExtensions = new event_1.Emitter();
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
            this._profiles = new Map();
            this._hasReturnedNone = true;
        }
        async getBackend(remoteAuthority) {
            return {
                getProfiles: async () => {
                    if (this._hasReturnedNone) {
                        return this._profiles.get(remoteAuthority ?? '') || [];
                    }
                    else {
                        this._hasReturnedNone = true;
                        return [];
                    }
                }
            };
        }
        setProfiles(remoteAuthority, profiles) {
            this._profiles.set(remoteAuthority ?? '', profiles);
        }
        setReturnNone() {
            this._hasReturnedNone = false;
        }
    }
    class TestRemoteAgentService {
        setEnvironment(os) {
            this._os = os;
        }
        async getEnvironment() {
            return { os: this._os };
        }
    }
    const defaultTerminalConfig = { profiles: { windows: {}, linux: {}, osx: {} } };
    let powershellProfile = {
        profileName: 'PowerShell',
        path: 'C:\\Powershell.exe',
        isDefault: true,
        icon: codicons_1.Codicon.terminalPowershell
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
            configurationService = new testConfigurationService_1.TestConfigurationService({ terminal: { integrated: defaultTerminalConfig } });
            remoteAgentService = new TestRemoteAgentService();
            terminalInstanceService = new TestTerminalInstanceService();
            extensionService = new TestTerminalExtensionService();
            environmentService = { remoteAuthority: undefined };
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            const themeService = new testThemeService_1.TestThemeService();
            const terminalContributionService = new TestTerminalContributionService();
            const contextKeyService = new mockKeybindingService_1.MockContextKeyService();
            instantiationService.stub(contextkey_1.IContextKeyService, contextKeyService);
            instantiationService.stub(extensions_1.IExtensionService, extensionService);
            instantiationService.stub(configuration_1.IConfigurationService, configurationService);
            instantiationService.stub(remoteAgentService_1.IRemoteAgentService, remoteAgentService);
            instantiationService.stub(terminalExtensionPoints_1.ITerminalContributionService, terminalContributionService);
            instantiationService.stub(terminal_2.ITerminalInstanceService, terminalInstanceService);
            instantiationService.stub(environmentService_1.IWorkbenchEnvironmentService, environmentService);
            instantiationService.stub(themeService_1.IThemeService, themeService);
            terminalProfileService = instantiationService.createInstance(TestTerminalProfileService);
            //reset as these properties are changed in each test
            powershellProfile = {
                profileName: 'PowerShell',
                path: 'C:\\Powershell.exe',
                isDefault: true,
                icon: codicons_1.Codicon.terminalPowershell
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
            if (platform_1.isWindows) {
                remoteAgentService.setEnvironment(1 /* OperatingSystem.Windows */);
            }
            else if (platform_1.isLinux) {
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
            instantiationService.stub(environmentService_1.IWorkbenchEnvironmentService, environmentService);
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
            powershellProfile.icon = codicons_1.Codicon.lightBulb;
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
                instantiationService.stub(quickInput_1.IQuickInputService, quickInputService);
                instantiationService.stub(terminal_1.ITerminalProfileService, mockTerminalProfileService);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxQcm9maWxlU2VydmljZS5pbnRlZ3JhdGlvblRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC90ZXN0L2Jyb3dzZXIvdGVybWluYWxQcm9maWxlU2VydmljZS5pbnRlZ3JhdGlvblRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUEyQmhHLE1BQU0sMEJBQTJCLFNBQVEsK0NBQXNCO1FBRXJELHdCQUF3QjtZQUNoQyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLDRCQUE0QixFQUFFLENBQUM7UUFDakUsQ0FBQztRQUNELGdDQUFnQztZQUMvQixJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztZQUNoQyxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFO2dCQUMvQixNQUFNLElBQUksS0FBSyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7YUFDbEQ7WUFDRCxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQztRQUNsQyxDQUFDO0tBQ0Q7SUFFRCxNQUFNLDBCQUEwQjtRQUFoQztZQUdDLHNCQUFpQixHQUFvQyxFQUFFLENBQUM7WUFDeEQsd0JBQW1CLEdBQTZDLEVBQUUsQ0FBQztRQWNwRSxDQUFDO1FBYkEsS0FBSyxDQUFDLGNBQWM7WUFDbkIsT0FBTyxPQUFPLENBQUM7UUFDaEIsQ0FBQztRQUNELHFCQUFxQjtZQUNwQixPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQztRQUNqQyxDQUFDO1FBQ0QsV0FBVyxDQUFDLFFBQTRCLEVBQUUsV0FBd0M7WUFDakYsSUFBSSxDQUFDLGlCQUFpQixHQUFHLFFBQVEsQ0FBQztZQUNsQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsV0FBVyxDQUFDO1FBQ3hDLENBQUM7UUFDRCxxQkFBcUIsQ0FBQyxJQUFZO1lBQ2pDLElBQUksQ0FBQyxtQkFB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