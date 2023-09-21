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
define(["require", "exports", "vs/base/common/async", "vs/base/common/platform", "vs/nls!vs/workbench/api/node/extHostDebugService", "vs/platform/externalTerminal/node/externalTerminalService", "vs/platform/sign/node/signService", "vs/workbench/api/common/extHostDebugService", "vs/workbench/api/common/extHostEditorTabs", "vs/workbench/api/common/extHostExtensionService", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostTerminalService", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostVariableResolverService", "vs/workbench/api/common/extHostWorkspace", "vs/workbench/contrib/debug/node/debugAdapter", "vs/workbench/contrib/debug/node/terminals", "../common/extHostConfiguration"], function (require, exports, async_1, platform, nls, externalTerminalService_1, signService_1, extHostDebugService_1, extHostEditorTabs_1, extHostExtensionService_1, extHostRpcService_1, extHostTerminalService_1, extHostTypes_1, extHostVariableResolverService_1, extHostWorkspace_1, debugAdapter_1, terminals_1, extHostConfiguration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$qdc = void 0;
    let $qdc = class $qdc extends extHostDebugService_1.$qcc {
        constructor(extHostRpcService, workspaceService, extensionService, configurationService, Z, editorTabs, variableResolver) {
            super(extHostRpcService, workspaceService, extensionService, configurationService, editorTabs, variableResolver);
            this.Z = Z;
            this.X = new DebugTerminalCollection();
        }
        K(adapter, session) {
            switch (adapter.type) {
                case 'server':
                    return new debugAdapter_1.$ldc(adapter);
                case 'pipeServer':
                    return new debugAdapter_1.$mdc(adapter);
                case 'executable':
                    return new debugAdapter_1.$ndc(adapter, session.type);
            }
            return super.K(adapter, session);
        }
        T(session, extensionRegistry) {
            const dae = debugAdapter_1.$ndc.platformAdapterExecutable(extensionRegistry.getAllExtensionDescriptions(), session.type);
            if (dae) {
                return new extHostTypes_1.$5K(dae.command, dae.args, dae.options);
            }
            return undefined;
        }
        L() {
            return new signService_1.$k7b();
        }
        async $runInTerminal(args, sessionId) {
            if (args.kind === 'integrated') {
                if (!this.Y) {
                    // React on terminal disposed and check if that is the debug terminal #12956
                    this.Y = this.Z.onDidCloseTerminal(terminal => {
                        this.X.onTerminalClosed(terminal);
                    });
                }
                const configProvider = await this.G.getConfigProvider();
                const shell = this.Z.getDefaultShell(true);
                const shellArgs = this.Z.getDefaultShellArgs(true);
                const terminalName = args.title || nls.localize(0, null);
                const shellConfig = JSON.stringify({ shell, shellArgs });
                let terminal = await this.X.checkout(shellConfig, terminalName);
                let cwdForPrepareCommand;
                let giveShellTimeToInitialize = false;
                if (!terminal) {
                    const options = {
                        shellPath: shell,
                        shellArgs: shellArgs,
                        cwd: args.cwd,
                        name: terminalName,
                        iconPath: new extHostTypes_1.$WK('debug'),
                    };
                    giveShellTimeToInitialize = true;
                    terminal = this.Z.createTerminalFromOptions(options, {
                        isFeatureTerminal: true,
                        useShellEnvironment: true
                    });
                    this.X.insert(terminal, shellConfig);
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
                        else if (platform.$i) {
                            terminal.sendText('cls');
                        }
                        else {
                            terminal.sendText('clear');
                        }
                    }
                }
                const command = (0, terminals_1.$pdc)(shell, args.args, !!args.argsCanBeInterpretedByShell, cwdForPrepareCommand, args.env);
                terminal.sendText(command);
                // Mark terminal as unused when its session ends, see #112055
                const sessionListener = this.onDidTerminateDebugSession(s => {
                    if (s.id === sessionId) {
                        this.X.free(terminal);
                        sessionListener.dispose();
                    }
                });
                return shellProcessId;
            }
            else if (args.kind === 'external') {
                return runInExternalTerminal(args, await this.G.getConfigProvider());
            }
            return super.$runInTerminal(args, sessionId);
        }
    };
    exports.$qdc = $qdc;
    exports.$qdc = $qdc = __decorate([
        __param(0, extHostRpcService_1.$2L),
        __param(1, extHostWorkspace_1.$jbc),
        __param(2, extHostExtensionService_1.$Rbc),
        __param(3, extHostConfiguration_1.$mbc),
        __param(4, extHostTerminalService_1.$Ebc),
        __param(5, extHostEditorTabs_1.$lcc),
        __param(6, extHostVariableResolverService_1.$ncc)
    ], $qdc);
    let externalTerminalService = undefined;
    function runInExternalTerminal(args, configProvider) {
        if (!externalTerminalService) {
            if (platform.$i) {
                externalTerminalService = new externalTerminalService_1.$65b();
            }
            else if (platform.$j) {
                externalTerminalService = new externalTerminalService_1.$75b();
            }
            else if (platform.$k) {
                externalTerminalService = new externalTerminalService_1.$85b();
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
            this.b = new Map();
        }
        /**
         * Delay before a new terminal is a candidate for reuse. See #71850
         */
        static { this.a = 1000; }
        async checkout(config, name) {
            const entries = [...this.b.entries()];
            const promises = entries.map(([terminal, termInfo]) => (0, async_1.$ug)(async (ct) => {
                // Only allow terminals that match the title.  See #123189
                if (terminal.name !== name) {
                    return null;
                }
                if (termInfo.lastUsedAt !== -1 && await (0, terminals_1.$odc)(await terminal.processId)) {
                    return null;
                }
                // important: date check and map operations must be synchronous
                const now = Date.now();
                if (termInfo.lastUsedAt + DebugTerminalCollection.a > now || ct.isCancellationRequested) {
                    return null;
                }
                if (termInfo.config !== config) {
                    return null;
                }
                termInfo.lastUsedAt = now;
                return terminal;
            }));
            return await (0, async_1.$Lg)(promises, (t) => !!t);
        }
        insert(terminal, termConfig) {
            this.b.set(terminal, { lastUsedAt: Date.now(), config: termConfig });
        }
        free(terminal) {
            const info = this.b.get(terminal);
            if (info) {
                info.lastUsedAt = -1;
            }
        }
        onTerminalClosed(terminal) {
            this.b.delete(terminal);
        }
    }
});
//# sourceMappingURL=extHostDebugService.js.map