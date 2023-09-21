/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/terminal/browser/terminalConfigHelper", "vs/workbench/contrib/terminal/browser/terminalProcessManager", "vs/platform/configuration/test/common/testConfigurationService", "vs/workbench/test/browser/workbenchTestServices", "vs/platform/product/common/productService", "vs/workbench/contrib/terminal/common/environmentVariable", "vs/workbench/contrib/terminal/common/environmentVariableService", "vs/base/common/network", "vs/base/common/uri", "vs/platform/terminal/common/terminal", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminal/browser/terminal", "vs/base/common/lifecycle", "vs/base/common/event", "vs/workbench/test/common/workbenchTestServices", "vs/base/test/common/utils", "vs/platform/log/common/log"], function (require, exports, assert_1, configuration_1, terminalConfigHelper_1, terminalProcessManager_1, testConfigurationService_1, workbenchTestServices_1, productService_1, environmentVariable_1, environmentVariableService_1, network_1, uri_1, terminal_1, terminal_2, terminal_3, lifecycle_1, event_1, workbenchTestServices_2, utils_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TestTerminalChildProcess {
        get capabilities() { return []; }
        constructor(shouldPersist) {
            this.shouldPersist = shouldPersist;
            this.id = 0;
            this.onDidChangeProperty = event_1.Event.None;
            this.onProcessData = event_1.Event.None;
            this.onProcessExit = event_1.Event.None;
            this.onProcessReady = event_1.Event.None;
            this.onProcessTitleChanged = event_1.Event.None;
            this.onProcessShellTypeChanged = event_1.Event.None;
        }
        updateProperty(property, value) {
            throw new Error('Method not implemented.');
        }
        async start() { return undefined; }
        shutdown(immediate) { }
        input(data) { }
        resize(cols, rows) { }
        clearBuffer() { }
        acknowledgeDataEvent(charCount) { }
        async setUnicodeVersion(version) { }
        async getInitialCwd() { return ''; }
        async getCwd() { return ''; }
        async processBinary(data) { }
        refreshProperty(property) { return Promise.resolve(''); }
    }
    class TestTerminalInstanceService {
        getBackend() {
            return {
                onPtyHostExit: event_1.Event.None,
                onPtyHostUnresponsive: event_1.Event.None,
                onPtyHostResponsive: event_1.Event.None,
                onPtyHostRestart: event_1.Event.None,
                onDidMoveWindowInstance: event_1.Event.None,
                onDidRequestDetach: event_1.Event.None,
                createProcess: (shellLaunchConfig, cwd, cols, rows, unicodeVersion, env, windowsEnableConpty, shouldPersist) => new TestTerminalChildProcess(shouldPersist),
                getLatency: () => Promise.resolve([])
            };
        }
    }
    suite('Workbench - TerminalProcessManager', () => {
        let store;
        let instantiationService;
        let manager;
        setup(async () => {
            store = new lifecycle_1.DisposableStore();
            instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, store);
            const configurationService = new testConfigurationService_1.TestConfigurationService();
            await configurationService.setUserConfiguration('editor', { fontFamily: 'foo' });
            await configurationService.setUserConfiguration('terminal', {
                integrated: {
                    fontFamily: 'bar',
                    enablePersistentSessions: true,
                    shellIntegration: {
                        enabled: false
                    }
                }
            });
            instantiationService.stub(configuration_1.IConfigurationService, configurationService);
            instantiationService.stub(productService_1.IProductService, workbenchTestServices_2.TestProductService);
            instantiationService.stub(terminal_1.ITerminalLogService, new log_1.NullLogService());
            instantiationService.stub(environmentVariable_1.IEnvironmentVariableService, instantiationService.createInstance(environmentVariableService_1.EnvironmentVariableService));
            instantiationService.stub(terminal_2.ITerminalProfileResolverService, workbenchTestServices_1.TestTerminalProfileResolverService);
            instantiationService.stub(terminal_3.ITerminalInstanceService, new TestTerminalInstanceService());
            const configHelper = store.add(instantiationService.createInstance(terminalConfigHelper_1.TerminalConfigHelper));
            manager = store.add(instantiationService.createInstance(terminalProcessManager_1.TerminalProcessManager, 1, configHelper, undefined, undefined, undefined));
        });
        teardown(() => store.dispose());
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        suite('process persistence', () => {
            suite('local', () => {
                test('regular terminal should persist', async () => {
                    const p = await manager.createProcess({}, 1, 1, false);
                    (0, assert_1.strictEqual)(p, undefined);
                    (0, assert_1.strictEqual)(manager.shouldPersist, true);
                });
                test('task terminal should not persist', async () => {
                    const p = await manager.createProcess({
                        isFeatureTerminal: true
                    }, 1, 1, false);
                    (0, assert_1.strictEqual)(p, undefined);
                    (0, assert_1.strictEqual)(manager.shouldPersist, false);
                });
            });
            suite('remote', () => {
                const remoteCwd = uri_1.URI.from({
                    scheme: network_1.Schemas.vscodeRemote,
                    path: 'test/cwd'
                });
                test('regular terminal should persist', async () => {
                    const p = await manager.createProcess({
                        cwd: remoteCwd
                    }, 1, 1, false);
                    (0, assert_1.strictEqual)(p, undefined);
                    (0, assert_1.strictEqual)(manager.shouldPersist, true);
                });
                test('task terminal should not persist', async () => {
                    const p = await manager.createProcess({
                        isFeatureTerminal: true,
                        cwd: remoteCwd
                    }, 1, 1, false);
                    (0, assert_1.strictEqual)(p, undefined);
                    (0, assert_1.strictEqual)(manager.shouldPersist, false);
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxQcm9jZXNzTWFuYWdlci50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvdGVzdC9icm93c2VyL3Rlcm1pbmFsUHJvY2Vzc01hbmFnZXIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQXNCaEcsTUFBTSx3QkFBd0I7UUFFN0IsSUFBSSxZQUFZLEtBQUssT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLFlBQ1UsYUFBc0I7WUFBdEIsa0JBQWEsR0FBYixhQUFhLENBQVM7WUFIaEMsT0FBRSxHQUFXLENBQUMsQ0FBQztZQWNmLHdCQUFtQixHQUFHLGFBQUssQ0FBQyxJQUFJLENBQUM7WUFDakMsa0JBQWEsR0FBRyxhQUFLLENBQUMsSUFBSSxDQUFDO1lBQzNCLGtCQUFhLEdBQUcsYUFBSyxDQUFDLElBQUksQ0FBQztZQUMzQixtQkFBYyxHQUFHLGFBQUssQ0FBQyxJQUFJLENBQUM7WUFDNUIsMEJBQXFCLEdBQUcsYUFBSyxDQUFDLElBQUksQ0FBQztZQUNuQyw4QkFBeUIsR0FBRyxhQUFLLENBQUMsSUFBSSxDQUFDO1FBZHZDLENBQUM7UUFDRCxjQUFjLENBQUMsUUFBYSxFQUFFLEtBQVU7WUFDdkMsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFZRCxLQUFLLENBQUMsS0FBSyxLQUF5QixPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDdkQsUUFBUSxDQUFDLFNBQWtCLElBQVUsQ0FBQztRQUN0QyxLQUFLLENBQUMsSUFBWSxJQUFVLENBQUM7UUFDN0IsTUFBTSxDQUFDLElBQVksRUFBRSxJQUFZLElBQVUsQ0FBQztRQUM1QyxXQUFXLEtBQVcsQ0FBQztRQUN2QixvQkFBb0IsQ0FBQyxTQUFpQixJQUFVLENBQUM7UUFDakQsS0FB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