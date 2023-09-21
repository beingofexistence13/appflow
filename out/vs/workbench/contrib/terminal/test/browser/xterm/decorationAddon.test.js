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
            const TerminalCtor = (await (0, amdX_1.importAMDNodeModule)('xterm', 'lib/xterm.js')).Terminal;
            class TestTerminal extends TerminalCtor {
                registerDecoration(decorationOptions) {
                    if (decorationOptions.marker.isDisposed) {
                        return undefined;
                    }
                    const element = document.createElement('div');
                    return { marker: decorationOptions.marker, element, onDispose: () => { }, isDisposed: false, dispose: () => { }, onRender: (element) => { return element; } };
                }
            }
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            const configurationService = new testConfigurationService_1.TestConfigurationService({
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
            instantiationService.stub(themeService_1.IThemeService, new testThemeService_1.TestThemeService());
            xterm = new TestTerminal({
                allowProposedApi: true,
                cols: 80,
                rows: 30
            });
            instantiationService.stub(configuration_1.IConfigurationService, configurationService);
            instantiationService.stub(contextView_1.IContextMenuService, instantiationService.createInstance(contextMenuService_1.ContextMenuService));
            instantiationService.stub(log_1.ILogService, log_1.NullLogService);
            const capabilities = new terminalCapabilityStore_1.TerminalCapabilityStore();
            capabilities.add(2 /* TerminalCapability.CommandDetection */, instantiationService.createInstance(commandDetectionCapability_1.CommandDetectionCapability, xterm));
            instantiationService.stub(lifecycle_1.ILifecycleService, new workbenchTestServices_1.TestLifecycleService());
            decorationAddon = instantiationService.createInstance(decorationAddon_1.DecorationAddon, capabilities);
            xterm.loadAddon(decorationAddon);
        });
        teardown(() => {
            instantiationService.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdGlvbkFkZG9uLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC90ZXN0L2Jyb3dzZXIveHRlcm0vZGVjb3JhdGlvbkFkZG9uLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFxQmhHLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUU7UUFDN0IsSUFBSSxlQUFnQyxDQUFDO1FBQ3JDLElBQUksS0FBdUIsQ0FBQztRQUM1QixJQUFJLG9CQUE4QyxDQUFDO1FBRW5ELEtBQUssQ0FBQyxLQUFLLElBQUksRUFBRTtZQUNoQixNQUFNLFlBQVksR0FBRyxDQUFDLE1BQU0sSUFBQSwwQkFBbUIsRUFBeUIsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO1lBQzNHLE1BQU0sWUFBYSxTQUFRLFlBQVk7Z0JBQzdCLGtCQUFrQixDQUFDLGlCQUFxQztvQkFDaEUsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFO3dCQUN4QyxPQUFPLFNBQVMsQ0FBQztxQkFDakI7b0JBQ0QsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDOUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLE9BQW9CLEVBQUUsRUFBRSxHQUFHLE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUE0QixDQUFDO2dCQUN0TSxDQUFDO2FBQ0Q7WUFFRCxvQkFBb0IsR0FBRyxJQUFJLG1EQUF3QixFQUFFLENB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