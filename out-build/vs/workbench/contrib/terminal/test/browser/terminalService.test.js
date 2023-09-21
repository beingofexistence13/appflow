/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/platform/terminal/common/terminal", "vs/workbench/contrib/terminal/browser/terminalService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/browser/contextKeyService", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/configuration/common/configuration", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/services/editor/common/editorService", "vs/platform/dialogs/common/dialogs", "vs/platform/dialogs/test/common/testDialogService", "vs/workbench/services/remote/common/remoteAgentService", "vs/base/test/common/utils", "vs/base/common/lifecycle", "vs/platform/environment/common/environment", "vs/platform/log/common/log"], function (require, exports, assert_1, event_1, terminal_1, terminalService_1, instantiationServiceMock_1, contextkey_1, contextKeyService_1, testConfigurationService_1, configuration_1, workbenchTestServices_1, terminal_2, lifecycle_1, themeService_1, testThemeService_1, terminal_3, editorService_1, dialogs_1, testDialogService_1, remoteAgentService_1, utils_1, lifecycle_2, environment_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workbench - TerminalService', () => {
        let store;
        let instantiationService;
        let terminalService;
        let configurationService;
        let dialogService;
        setup(async () => {
            store = new lifecycle_2.$jc();
            dialogService = new testDialogService_1.$H0b();
            configurationService = new testConfigurationService_1.$G0b({
                terminal: {
                    integrated: {
                        fontWeight: 'normal'
                    }
                }
            });
            instantiationService = store.add(new instantiationServiceMock_1.$L0b());
            instantiationService.stub(configuration_1.$8h, configurationService);
            instantiationService.stub(contextkey_1.$3i, instantiationService.createInstance(contextKeyService_1.$xtb));
            instantiationService.stub(lifecycle_1.$7y, new workbenchTestServices_1.$Kec());
            instantiationService.stub(themeService_1.$gv, new testThemeService_1.$K0b());
            instantiationService.stub(terminal_1.$Zq, new log_1.$fj());
            instantiationService.stub(editorService_1.$9C, new workbenchTestServices_1.$Eec());
            instantiationService.stub(environment_1.$Ih, workbenchTestServices_1.$qec);
            instantiationService.stub(terminal_2.$Nib, new workbenchTestServices_1.$9ec());
            instantiationService.stub(terminal_2.$Oib, new workbenchTestServices_1.$0ec());
            instantiationService.stub(terminal_2.$Pib, new workbenchTestServices_1.$8ec());
            instantiationService.stub(terminal_2.$Pib, 'getBackend', undefined);
            instantiationService.stub(terminal_2.$Pib, 'getRegisteredBackends', []);
            instantiationService.stub(terminal_3.$GM, new workbenchTestServices_1.$$ec());
            instantiationService.stub(remoteAgentService_1.$jm, new workbenchTestServices_1.$bfc());
            instantiationService.stub(remoteAgentService_1.$jm, 'getConnection', null);
            instantiationService.stub(dialogs_1.$oA, dialogService);
            terminalService = store.add(instantiationService.createInstance(terminalService_1.$cWb));
            instantiationService.stub(terminal_2.$Mib, terminalService);
        });
        teardown(() => store.dispose());
        (0, utils_1.$bT)();
        suite('safeDisposeTerminal', () => {
            let onExitEmitter;
            setup(() => {
                onExitEmitter = store.add(new event_1.$fd());
            });
            test('should not show prompt when confirmOnKill is never', async () => {
                await setConfirmOnKill(configurationService, 'never');
                await terminalService.safeDisposeTerminal({
                    target: terminal_1.TerminalLocation.Editor,
                    hasChildProcesses: true,
                    onExit: onExitEmitter.event,
                    dispose: () => onExitEmitter.fire(undefined)
                });
                await terminalService.safeDisposeTerminal({
                    target: terminal_1.TerminalLocation.Panel,
                    hasChildProcesses: true,
                    onExit: onExitEmitter.event,
                    dispose: () => onExitEmitter.fire(undefined)
                });
            });
            test('should not show prompt when any terminal editor is closed (handled by editor itself)', async () => {
                await setConfirmOnKill(configurationService, 'editor');
                terminalService.safeDisposeTerminal({
                    target: terminal_1.TerminalLocation.Editor,
                    hasChildProcesses: true,
                    onExit: onExitEmitter.event,
                    dispose: () => onExitEmitter.fire(undefined)
                });
                await setConfirmOnKill(configurationService, 'always');
                terminalService.safeDisposeTerminal({
                    target: terminal_1.TerminalLocation.Editor,
                    hasChildProcesses: true,
                    onExit: onExitEmitter.event,
                    dispose: () => onExitEmitter.fire(undefined)
                });
            });
            test('should not show prompt when confirmOnKill is editor and panel terminal is closed', async () => {
                await setConfirmOnKill(configurationService, 'editor');
                terminalService.safeDisposeTerminal({
                    target: terminal_1.TerminalLocation.Panel,
                    hasChildProcesses: true,
                    onExit: onExitEmitter.event,
                    dispose: () => onExitEmitter.fire(undefined)
                });
            });
            test('should show prompt when confirmOnKill is panel and panel terminal is closed', async () => {
                await setConfirmOnKill(configurationService, 'panel');
                // No child process cases
                dialogService.setConfirmResult({ confirmed: false });
                terminalService.safeDisposeTerminal({
                    target: terminal_1.TerminalLocation.Panel,
                    hasChildProcesses: false,
                    onExit: onExitEmitter.event,
                    dispose: () => onExitEmitter.fire(undefined)
                });
                dialogService.setConfirmResult({ confirmed: true });
                terminalService.safeDisposeTerminal({
                    target: terminal_1.TerminalLocation.Panel,
                    hasChildProcesses: false,
                    onExit: onExitEmitter.event,
                    dispose: () => onExitEmitter.fire(undefined)
                });
                // Child process cases
                dialogService.setConfirmResult({ confirmed: false });
                await terminalService.safeDisposeTerminal({
                    target: terminal_1.TerminalLocation.Panel,
                    hasChildProcesses: true,
                    dispose: () => (0, assert_1.fail)()
                });
                dialogService.setConfirmResult({ confirmed: true });
                terminalService.safeDisposeTerminal({
                    target: terminal_1.TerminalLocation.Panel,
                    hasChildProcesses: true,
                    onExit: onExitEmitter.event,
                    dispose: () => onExitEmitter.fire(undefined)
                });
            });
            test('should show prompt when confirmOnKill is always and panel terminal is closed', async () => {
                await setConfirmOnKill(configurationService, 'always');
                // No child process cases
                dialogService.setConfirmResult({ confirmed: false });
                terminalService.safeDisposeTerminal({
                    target: terminal_1.TerminalLocation.Panel,
                    hasChildProcesses: false,
                    onExit: onExitEmitter.event,
                    dispose: () => onExitEmitter.fire(undefined)
                });
                dialogService.setConfirmResult({ confirmed: true });
                terminalService.safeDisposeTerminal({
                    target: terminal_1.TerminalLocation.Panel,
                    hasChildProcesses: false,
                    onExit: onExitEmitter.event,
                    dispose: () => onExitEmitter.fire(undefined)
                });
                // Child process cases
                dialogService.setConfirmResult({ confirmed: false });
                await terminalService.safeDisposeTerminal({
                    target: terminal_1.TerminalLocation.Panel,
                    hasChildProcesses: true,
                    dispose: () => (0, assert_1.fail)()
                });
                dialogService.setConfirmResult({ confirmed: true });
                terminalService.safeDisposeTerminal({
                    target: terminal_1.TerminalLocation.Panel,
                    hasChildProcesses: true,
                    onExit: onExitEmitter.event,
                    dispose: () => onExitEmitter.fire(undefined)
                });
            });
        });
    });
    async function setConfirmOnKill(configurationService, value) {
        await configurationService.setUserConfiguration('terminal', { integrated: { confirmOnKill: value } });
        configurationService.onDidChangeConfigurationEmitter.fire({
            affectsConfiguration: () => true,
            affectedKeys: ['terminal.integrated.confirmOnKill']
        });
    }
});
//# sourceMappingURL=terminalService.test.js.map