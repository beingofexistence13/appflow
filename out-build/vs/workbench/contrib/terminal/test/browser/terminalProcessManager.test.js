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
            store = new lifecycle_1.$jc();
            instantiationService = (0, workbenchTestServices_1.$lec)(undefined, store);
            const configurationService = new testConfigurationService_1.$G0b();
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
            instantiationService.stub(configuration_1.$8h, configurationService);
            instantiationService.stub(productService_1.$kj, workbenchTestServices_2.$bec);
            instantiationService.stub(terminal_1.$Zq, new log_1.$fj());
            instantiationService.stub(environmentVariable_1.$sM, instantiationService.createInstance(environmentVariableService_1.$sWb));
            instantiationService.stub(terminal_2.$EM, workbenchTestServices_1.$_ec);
            instantiationService.stub(terminal_3.$Pib, new TestTerminalInstanceService());
            const configHelper = store.add(instantiationService.createInstance(terminalConfigHelper_1.$dib));
            manager = store.add(instantiationService.createInstance(terminalProcessManager_1.$7Vb, 1, configHelper, undefined, undefined, undefined));
        });
        teardown(() => store.dispose());
        (0, utils_1.$bT)();
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
//# sourceMappingURL=terminalProcessManager.test.js.map