/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/async", "vs/base/common/platform", "vs/nls", "vs/platform/externalTerminal/node/externalTerminalService", "vs/platform/sign/node/signService", "vs/workbench/api/common/extHostDebugService", "vs/workbench/api/common/extHostEditorTabs", "vs/workbench/api/common/extHostExtensionService", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostTerminalService", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostVariableResolverService", "vs/workbench/api/common/extHostWorkspace", "vs/workbench/contrib/debug/node/debugAdapter", "vs/workbench/contrib/debug/node/terminals", "../common/extHostConfiguration"], function (require, exports, async_1, platform, nls, externalTerminalService_1, signService_1, extHostDebugService_1, extHostEditorTabs_1, extHostExtensionService_1, extHostRpcService_1, extHostTerminalService_1, extHostTypes_1, extHostVariableResolverService_1, extHostWorkspace_1, debugAdapter_1, terminals_1, extHostConfiguration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostDebugService = void 0;
    let ExtHostDebugService = class ExtHostDebugService extends extHostDebugService_1.ExtHostDebugServiceBase {
        constructor(extHostRpcService, workspaceService, extensionService, configurationService, _terminalService, editorTabs, variableResolver) {
            super(extHostRpcService, workspaceService, extensionService, configurationService, editorTabs, variableResolver);
            this._terminalService = _terminalService;
            this._integratedTerminalInstances = new DebugTerminalCollection();
        }
        createDebugAdapter(adapter, session) {
            switch (adapter.type) {
                case 'server':
                    return new debugAdapter_1.SocketDebugAdapter(adapter);
                case 'pipeServer':
                    return new debugAdapter_1.NamedPipeDebugAdapter(adapter);
                case 'executable':
                    return new debugAdapter_1.ExecutableDebugAdapter(adapter, session.type);
            }
            return super.createDebugAdapter(adapter, session);
        }
        daExecutableFromPackage(session, extensionRegistry) {
            const dae = debugAdapter_1.ExecutableDebugAdapter.platformAdapterExecutable(extensionRegistry.getAllExtensionDescriptions(), session.type);
            if (dae) {
                return new extHostTypes_1.DebugAdapterExecutable(dae.command, dae.args, dae.options);
            }
            return undefined;
        }
        createSignService() {
            return new signService_1.SignService();
        }
        async $runInTerminal(args, sessionId) {
            if (args.kind === 'integrated') {
                if (!this._terminalDisposedListener) {
                    // React on terminal disposed and check if that is the debug terminal #12956
                    this._terminalDisposedListener = this._terminalService.onDidCloseTerminal(terminal => {
                        this._integratedTerminalInstances.onTerminalClosed(terminal);
                    });
                }
                const configProvider = await this._configurationService.getConfigProvider();
                const shell = this._terminalService.getDefaultShell(true);
                const shellArgs = this._terminalService.getDefaultShellArgs(true);
                const terminalName = args.title || nls.localize('debug.terminal.title', "Debug Process");
                const shellConfig = JSON.stringify({ shell, shellArgs });
                let terminal = await this._integratedTerminalInstances.checkout(shellConfig, terminalName);
                let cwdForPrepareCommand;
                let giveShellTimeToInitialize = false;
                if (!terminal) {
                    const options = {
                        shellPath: shell,
                        shellArgs: shellArgs,
                        cwd: args.cwd,
                        name: terminalName,
                        iconPath: new extHostTypes_1.ThemeIcon('debug'),
                    };
                    giveShellTimeToInitialize = true;
                    terminal = this._terminalService.createTerminalFromOptions(options, {
                        isFeatureTerminal: true,
                        useShellEnvironment: true
                    });
                    this._integratedTerminalInstances.insert(terminal, shellConfig);
                }
                else {
                    cwdForPrepareCommand = args.cwd;
                }
                terminal.show(true);
                const shellProcessId = await terminal.processId;
                if (giveShellTimeToInitialize) {
                    // give a new terminal some time to initialize the shell
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                else {
                    if (configProvider.getConfiguration('debug.terminal').get('clearBeforeReusing')) {
                        // clear terminal before reusing it
                        if (shell.indexOf('powershell') >= 0 || shell.indexOf('pwsh') >= 0 || shell.indexOf('cmd.exe') >= 0) {
                            terminal.sendText('cls');
                        }
                        else if (shell.indexOf('bash') >= 0) {
                            terminal.sendText('clear');
                        }
                        else if (platform.isWindows) {
                            terminal.sendText('cls');
                        }
                        else {
                            terminal.sendText('clear');
                        }
                    }
                }
                const command = (0, terminals_1.prepareCommand)(shell, args.args, !!args.argsCanBeInterpretedByShell, cwdForPrepareCommand, args.env);
                terminal.sendText(command);
                // Mark terminal as unused when its session ends, see #112055
                const sessionListener = this.onDidTerminateDebugSession(s => {
                    if (s.id === sessionId) {
                        this._integratedTerminalInstances.free(terminal);
                        sessionListener.dispose();
                    }
                });
                return shellProcessId;
            }
            else if (args.kind === 'external') {
                return runInExternalTerminal(args, await this._configurationService.getConfigProvider());
            }
            return super.$runInTerminal(args, sessionId);
        }
    };
    exports.ExtHostDebugService = ExtHostDebugService;
    exports.ExtHostDebugService = ExtHostDebugService = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, extHostWorkspace_1.IExtHostWorkspace),
        __param(2, extHostExtensionService_1.IExtHostExtensionService),
        __param(3, extHostConfiguration_1.IExtHostConfiguration),
        __param(4, extHostTerminalService_1.IExtHostTerminalService),
        __param(5, extHostEditorTabs_1.IExtHostEditorTabs),
        __param(6, extHostVariableResolverService_1.IExtHostVariableResolverProvider)
    ], ExtHostDebugService);
    let externalTerminalService = undefined;
    function runInExternalTerminal(args, configProvider) {
        if (!externalTerminalService) {
            if (platform.isWindows) {
                externalTerminalService = new externalTerminalService_1.WindowsExternalTerminalService();
            }
            else if (platform.isMacintosh) {
                externalTerminalService = new externalTerminalService_1.MacExternalTerminalService();
            }
            else if (platform.isLinux) {
                externalTerminalService = new externalTerminalService_1.LinuxExternalTerminalService();
            }
            else {
                throw new Error('external terminals not supported on this platform');
            }
        }
        const config = configProvider.getConfiguration('terminal');
        return externalTerminalService.runInTerminal(args.title, args.cwd, args.args, args.env || {}, config.external || {});
    }
    class DebugTerminalCollection {
        constructor() {
            this._terminalInstances = new Map();
        }
        /**
         * Delay before a new terminal is a candidate for reuse. See #71850
         */
        static { this.minUseDelay = 1000; }
        async checkout(config, name) {
            const entries = [...this._terminalInstances.entries()];
            const promises = entries.map(([terminal, termInfo]) => (0, async_1.createCancelablePromise)(async (ct) => {
                // Only allow terminals that match the title.  See #123189
                if (terminal.name !== name) {
                    return null;
                }
                if (termInfo.lastUsedAt !== -1 && await (0, terminals_1.hasChildProcesses)(await terminal.processId)) {
                    return null;
                }
                // important: date check and map operations must be synchronous
                const now = Date.now();
                if (termInfo.lastUsedAt + DebugTerminalCollection.minUseDelay > now || ct.isCancellationRequested) {
                    return null;
                }
                if (termInfo.config !== config) {
                    return null;
                }
                termInfo.lastUsedAt = now;
                return terminal;
            }));
            return await (0, async_1.firstParallel)(promises, (t) => !!t);
        }
        insert(terminal, termConfig) {
            this._terminalInstances.set(terminal, { lastUsedAt: Date.now(), config: termConfig });
        }
        free(terminal) {
            const info = this._terminalInstances.get(terminal);
            if (info) {
                info.lastUsedAt = -1;
            }
        }
        onTerminalClosed(terminal) {
            this._terminalInstances.delete(terminal);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdERlYnVnU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvbm9kZS9leHRIb3N0RGVidWdTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTBCekYsSUFBTSxtQkFBbUIsR0FBekIsTUFBTSxtQkFBb0IsU0FBUSw2Q0FBdUI7UUFPL0QsWUFDcUIsaUJBQXFDLEVBQ3RDLGdCQUFtQyxFQUM1QixnQkFBMEMsRUFDN0Msb0JBQTJDLEVBQ3pDLGdCQUFpRCxFQUN0RCxVQUE4QixFQUNoQixnQkFBa0Q7WUFFcEYsS0FBSyxDQUFDLGlCQUFpQixFQUFFLGdCQUFnQixFQUFFLGdCQUFnQixFQUFFLG9CQUFvQixFQUFFLFVBQVUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBSmhGLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBeUI7WUFSbkUsaUNBQTRCLEdBQUcsSUFBSSx1QkFBdUIsRUFBRSxDQUFDO1FBYXJFLENBQUM7UUFFa0Isa0JBQWtCLENBQUMsT0FBMkIsRUFBRSxPQUE0QjtZQUM5RixRQUFRLE9BQU8sQ0FBQyxJQUFJLEVBQUU7Z0JBQ3JCLEtBQUssUUFBUTtvQkFDWixPQUFPLElBQUksaUNBQWtCLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3hDLEtBQUssWUFBWTtvQkFDaEIsT0FBTyxJQUFJLG9DQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUMzQyxLQUFLLFlBQVk7b0JBQ2hCLE9BQU8sSUFBSSxxQ0FBc0IsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQzFEO1lBQ0QsT0FBTyxLQUFLLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFFa0IsdUJBQXVCLENBQUMsT0FBNEIsRUFBRSxpQkFBK0M7WUFD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