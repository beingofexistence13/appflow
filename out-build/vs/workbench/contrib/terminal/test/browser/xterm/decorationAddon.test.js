/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/log/common/log", "vs/workbench/contrib/terminal/browser/xterm/decorationAddon", "vs/platform/terminal/common/capabilities/terminalCapabilityStore", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/terminal/common/capabilities/commandDetectionCapability", "vs/platform/contextview/browser/contextView", "vs/platform/contextview/browser/contextMenuService", "vs/platform/theme/test/common/testThemeService", "vs/platform/theme/common/themeService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/test/browser/workbenchTestServices", "vs/amdX", "vs/base/test/common/utils"], function (require, exports, assert_1, configuration_1, instantiationServiceMock_1, log_1, decorationAddon_1, terminalCapabilityStore_1, testConfigurationService_1, commandDetectionCapability_1, contextView_1, contextMenuService_1, testThemeService_1, themeService_1, lifecycle_1, workbenchTestServices_1, amdX_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('DecorationAddon', () => {
        let decorationAddon;
        let xterm;
        let instantiationService;
        setup(async () => {
            const TerminalCtor = (await (0, amdX_1.$aD)('xterm', 'lib/xterm.js')).Terminal;
            class TestTerminal extends TerminalCtor {
                registerDecoration(decorationOptions) {
                    if (decorationOptions.marker.isDisposed) {
                        return undefined;
                    }
                    const element = document.createElement('div');
                    return { marker: decorationOptions.marker, element, onDispose: () => { }, isDisposed: false, dispose: () => { }, onRender: (element) => { return element; } };
                }
            }
            instantiationService = new instantiationServiceMock_1.$L0b();
            const configurationService = new testConfigurationService_1.$G0b({
                workbench: {
                    hover: { delay: 5 },
                },
                terminal: {
                    integrated: {
                        shellIntegration: {
                            decorationsEnabled: 'both'
                        }
                    }
                }
            });
            instantiationService.stub(themeService_1.$gv, new testThemeService_1.$K0b());
            xterm = new TestTerminal({
                allowProposedApi: true,
                cols: 80,
                rows: 30
            });
            instantiationService.stub(configuration_1.$8h, configurationService);
            instantiationService.stub(contextView_1.$WZ, instantiationService.createInstance(contextMenuService_1.$B4b));
            instantiationService.stub(log_1.$5i, log_1.$fj);
            const capabilities = new terminalCapabilityStore_1.$eib();
            capabilities.add(2 /* TerminalCapability.CommandDetection */, instantiationService.createInstance(commandDetectionCapability_1.$Tq, xterm));
            instantiationService.stub(lifecycle_1.$7y, new workbenchTestServices_1.$Kec());
            decorationAddon = instantiationService.createInstance(decorationAddon_1.$Cib, capabilities);
            xterm.loadAddon(decorationAddon);
        });
        teardown(() => {
            instantiationService.dispose();
        });
        (0, utils_1.$bT)();
        suite('registerDecoration', () => {
            test('should throw when command has no marker', async () => {
                (0, assert_1.throws)(() => decorationAddon.registerCommandDecoration({ command: 'cd src', timestamp: Date.now(), hasOutput: () => false }));
            });
            test('should return undefined when marker has been disposed of', async () => {
                const marker = xterm.registerMarker(1);
                marker?.dispose();
                (0, assert_1.strictEqual)(decorationAddon.registerCommandDecoration({ command: 'cd src', marker, timestamp: Date.now(), hasOutput: () => false }), undefined);
            });
            test('should return decoration when marker has not been disposed of', async () => {
                const marker = xterm.registerMarker(2);
                (0, assert_1.notEqual)(decorationAddon.registerCommandDecoration({ command: 'cd src', marker, timestamp: Date.now(), hasOutput: () => false }), undefined);
            });
            test('should return decoration with mark properties', async () => {
                const marker = xterm.registerMarker(2);
                (0, assert_1.notEqual)(decorationAddon.registerCommandDecoration(undefined, undefined, { marker }), undefined);
            });
        });
    });
});
//# sourceMappingURL=decorationAddon.test.js.map