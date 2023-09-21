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
            store = new lifecycle_2.DisposableStore();
            dialogService = new testDialogService_1.TestDialogService();
            configurationService = new testConfigurationService_1.TestConfigurationService({
                terminal: {
                    integrated: {
                        fontWeight: 'normal'
                    }
                }
            });
            instantiationService = store.add(new instantiationServiceMock_1.TestInstantiationService());
            instantiationService.stub(configuration_1.IConfigurationService, configurationService);
            instantiationService.stub(contextkey_1.IContextKeyService, instantiationService.createInstance(contextKeyService_1.ContextKeyService));
            instantiationService.stub(lifecycle_1.ILifecycleService, new workbenchTestServices_1.TestLifecycleService());
            instantiationService.stub(themeService_1.IThemeService, new testThemeService_1.TestThemeService());
            instantiationService.stub(terminal_1.ITerminalLogService, new log_1.NullLogService());
            instantiationService.stub(editorService_1.IEditorService, new workbenchTestServices_1.TestEditorService());
            instantiationService.stub(environment_1.IEnvironmentService, workbenchTestServices_1.TestEnvironmentService);
            instantiationService.stub(terminal_2.ITerminalEditorService, new workbenchTestServices_1.TestTerminalEditorService());
            instantiationService.stub(terminal_2.ITerminalGroupService, new workbenchTestServices_1.TestTerminalGroupService());
            instantiationService.stub(terminal_2.ITerminalInstanceService, new workbenchTestServices_1.TestTerminalInstanceService());
            instantiationService.stub(terminal_2.ITerminalInstanceService, 'getBackend', undefined);
            instantiationService.stub(terminal_2.ITerminalInstanceService, 'getRegisteredBackends', []);
            instantiationService.stub(terminal_3.ITerminalProfileService, new workbenchTestServices_1.TestTerminalProfileService());
            instantiationService.stub(remoteAgentService_1.IRemoteAgentService, new workbenchTestServices_1.TestRemoteAgentService());
            instantiationService.stub(remoteAgentService_1.IRemoteAgentService, 'getConnection', null);
            instantiationService.stub(dialogs_1.IDialogService, dialogService);
            terminalService = store.add(instantiationService.createInstance(terminalService_1.TerminalService));
            instantiationService.stub(terminal_2.ITerminalService, terminalService);
        });
        teardown(() => store.dispose());
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        suite('safeDisposeTerminal', () => {
            let onExitEmitter;
            setup(() => {
                onExitEmitter = store.add(new event_1.Emitter());
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxTZXJ2aWNlLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC90ZXN0L2Jyb3dzZXIvdGVybWluYWxTZXJ2aWNlLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUEwQmhHLEtBQUssQ0FBQyw2QkFBNkIsRUFBRSxHQUFHLEVBQUU7UUFDekMsSUFBSSxLQUFzQixDQUFDO1FBQzNCLElBQUksb0JBQThDLENBQUM7UUFDbkQsSUFBSSxlQUFnQyxDQUFDO1FBQ3JDLElBQUksb0JBQThDLENBQUM7UUFDbkQsSUFBSSxhQUFnQyxDQUFDO1FBRXJDLEtBQUssQ0FBQyxLQUFLLElBQUksRUFBRTtZQUNoQixLQUFLLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFDOUIsYUFBYSxHQUFHLElBQUkscUNBQWlCLEVBQUUsQ0FBQztZQUN4QyxvQkFBb0IsR0FBRyxJQUFJLG1EQUF3QixDQUFDO2dCQUNuRCxRQUFRLEVBQUU7b0JBQ1QsVUFBVSxFQUFFO3dCQUNYLFVBQVUsRUFBRSxRQUFRO3FCQUNwQjtpQkFDRDthQUNELENBQUMsQ0FBQztZQUVILG9CQUFvQixHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxtREFBd0IsRUFBRSxDQUFDLENBQUM7WUFDakUsb0JBQW9CLENBQUMsSUFBSSxDQUFDLHFDQUFxQixFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFDdkUsb0JBQW9CLENBQUMsSUFBSSxDQUFDLCtCQUFrQixFQUFFLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxxQ0FBaUIsQ0FBQyxDQUFDLENBQUM7WUFDdEcsb0JBQW9CLENBQUMsSUFBSSxDQUFDLDZCQUFpQixFQUFFLElBQUksNENBQW9CLEVBQUUsQ0FBQyxDQUFDO1lBQ3pFLG9CQUFvQixDQUFDLElBQUksQ0FBQyw0QkFBYSxFQUFFLElB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