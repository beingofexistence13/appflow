/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "vs/base/common/event", "vs/base/common/objects", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/uri", "vs/base/parts/ipc/node/ipc.net", "vs/workbench/api/node/uriTransformer", "vs/workbench/api/node/extHostCLIServer", "vs/platform/terminal/common/environmentVariableCollection", "vs/platform/terminal/common/environmentVariableShared", "vs/workbench/contrib/terminal/common/terminalEnvironment", "vs/workbench/services/configurationResolver/common/variableResolver", "vs/server/node/extensionHostConnection"], function (require, exports, os, event_1, objects_1, lifecycle_1, path, platform, uri_1, ipc_net_1, uriTransformer_1, extHostCLIServer_1, environmentVariableCollection_1, environmentVariableShared_1, terminalEnvironment, variableResolver_1, extensionHostConnection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteTerminalChannel = void 0;
    class CustomVariableResolver extends variableResolver_1.AbstractVariableResolverService {
        constructor(env, workspaceFolders, activeFileResource, resolvedVariables, extensionService) {
            super({
                getFolderUri: (folderName) => {
                    const found = workspaceFolders.filter(f => f.name === folderName);
                    if (found && found.length > 0) {
                        return found[0].uri;
                    }
                    return undefined;
                },
                getWorkspaceFolderCount: () => {
                    return workspaceFolders.length;
                },
                getConfigurationValue: (folderUri, section) => {
                    return resolvedVariables[`config:${section}`];
                },
                getExecPath: () => {
                    return env['VSCODE_EXEC_PATH'];
                },
                getAppRoot: () => {
                    return env['VSCODE_CWD'];
                },
                getFilePath: () => {
                    if (activeFileResource) {
                        return path.normalize(activeFileResource.fsPath);
                    }
                    return undefined;
                },
                getSelectedText: () => {
                    return resolvedVariables['selectedText'];
                },
                getLineNumber: () => {
                    return resolvedVariables['lineNumber'];
                },
                getExtension: async (id) => {
                    const installed = await extensionService.getInstalled();
                    const found = installed.find(e => e.identifier.id === id);
                    return found && { extensionLocation: found.location };
                },
            }, undefined, Promise.resolve(os.homedir()), Promise.resolve(env));
        }
    }
    class RemoteTerminalChannel extends lifecycle_1.Disposable {
        constructor(_environmentService, _logService, _ptyHostService, _productService, _extensionManagementService, _configurationService) {
            super();
            this._environmentService = _environmentService;
            this._logService = _logService;
            this._ptyHostService = _ptyHostService;
            this._productService = _productService;
            this._extensionManagementService = _extensionManagementService;
            this._configurationService = _configurationService;
            this._lastReqId = 0;
            this._pendingCommands = new Map();
            this._onExecuteCommand = this._register(new event_1.Emitter());
            this.onExecuteCommand = this._onExecuteCommand.event;
        }
        async call(ctx, command, args) {
            switch (command) {
                case "$restartPtyHost" /* RemoteTerminalChannelRequest.RestartPtyHost */: return this._ptyHostService.restartPtyHost.apply(this._ptyHostService, args);
                case "$createProcess" /* RemoteTerminalChannelRequest.CreateProcess */: {
                    const uriTransformer = (0, uriTransformer_1.createURITransformer)(ctx.remoteAuthority);
                    return this._createProcess(uriTransformer, args);
                }
                case "$attachToProcess" /* RemoteTerminalChannelRequest.AttachToProcess */: return this._ptyHostService.attachToProcess.apply(this._ptyHostService, args);
                case "$detachFromProcess" /* RemoteTerminalChannelRequest.DetachFromProcess */: return this._ptyHostService.detachFromProcess.apply(this._ptyHostService, args);
                case "$listProcesses" /* RemoteTerminalChannelRequest.ListProcesses */: return this._ptyHostService.listProcesses.apply(this._ptyHostService, args);
                case "$getLatency" /* RemoteTerminalChannelRequest.GetLatency */: return this._ptyHostService.getLatency.apply(this._ptyHostService, args);
                case "$getPerformanceMarks" /* RemoteTerminalChannelRequest.GetPerformanceMarks */: return this._ptyHostService.getPerformanceMarks.apply(this._ptyHostService, args);
                case "$orphanQuestionReply" /* RemoteTerminalChannelRequest.OrphanQuestionReply */: return this._ptyHostService.orphanQuestionReply.apply(this._ptyHostService, args);
                case "$acceptPtyHostResolvedVariables" /* RemoteTerminalChannelRequest.AcceptPtyHostResolvedVariables */: return this._ptyHostService.acceptPtyHostResolvedVariables.apply(this._ptyHostService, args);
                case "$start" /* RemoteTerminalChannelRequest.Start */: return this._ptyHostService.start.apply(this._ptyHostService, args);
                case "$input" /* RemoteTerminalChannelRequest.Input */: return this._ptyHostService.input.apply(this._ptyHostService, args);
                case "$acknowledgeDataEvent" /* RemoteTerminalChannelRequest.AcknowledgeDataEvent */: return this._ptyHostService.acknowledgeDataEvent.apply(this._ptyHostService, args);
                case "$shutdown" /* RemoteTerminalChannelRequest.Shutdown */: return this._ptyHostService.shutdown.apply(this._ptyHostService, args);
                case "$resize" /* RemoteTerminalChannelRequest.Resize */: return this._ptyHostService.resize.apply(this._ptyHostService, args);
                case "$clearBuffer" /* RemoteTerminalChannelRequest.ClearBuffer */: return this._ptyHostService.clearBuffer.apply(this._ptyHostService, args);
                case "$getInitialCwd" /* RemoteTerminalChannelRequest.GetInitialCwd */: return this._ptyHostService.getInitialCwd.apply(this._ptyHostService, args);
                case "$getCwd" /* RemoteTerminalChannelRequest.GetCwd */: return this._ptyHostService.getCwd.apply(this._ptyHostService, args);
                case "$processBinary" /* RemoteTerminalChannelRequest.ProcessBinary */: return this._ptyHostService.processBinary.apply(this._ptyHostService, args);
                case "$sendCommandResult" /* RemoteTerminalChannelRequest.SendCommandResult */: return this._sendCommandResult(args[0], args[1], args[2]);
                case "$installAutoReply" /* RemoteTerminalChannelRequest.InstallAutoReply */: return this._ptyHostService.installAutoReply.apply(this._ptyHostService, args);
                case "$uninstallAllAutoReplies" /* RemoteTerminalChannelRequest.UninstallAllAutoReplies */: return this._ptyHostService.uninstallAllAutoReplies.apply(this._ptyHostService, args);
                case "$getDefaultSystemShell" /* RemoteTerminalChannelRequest.GetDefaultSystemShell */: return this._getDefaultSystemShell.apply(this, args);
                case "$getProfiles" /* RemoteTerminalChannelRequest.GetProfiles */: return this._getProfiles.apply(this, args);
                case "$getEnvironment" /* RemoteTerminalChannelRequest.GetEnvironment */: return this._getEnvironment();
                case "$getWslPath" /* RemoteTerminalChannelRequest.GetWslPath */: return this._getWslPath(args[0], args[1]);
                case "$getTerminalLayoutInfo" /* RemoteTerminalChannelRequest.GetTerminalLayoutInfo */: return this._ptyHostService.getTerminalLayoutInfo(args);
                case "$setTerminalLayoutInfo" /* RemoteTerminalChannelRequest.SetTerminalLayoutInfo */: return this._ptyHostService.setTerminalLayoutInfo(args);
                case "$serializeTerminalState" /* RemoteTerminalChannelRequest.SerializeTerminalState */: return this._ptyHostService.serializeTerminalState.apply(this._ptyHostService, args);
                case "$reviveTerminalProcesses" /* RemoteTerminalChannelRequest.ReviveTerminalProcesses */: return this._ptyHostService.reviveTerminalProcesses.apply(this._ptyHostService, args);
                case "$getRevivedPtyNewId" /* RemoteTerminalChannelRequest.GetRevivedPtyNewId */: return this._ptyHostService.getRevivedPtyNewId.apply(this._ptyHostService, args);
                case "$setUnicodeVersion" /* RemoteTerminalChannelRequest.SetUnicodeVersion */: return this._ptyHostService.setUnicodeVersion.apply(this._ptyHostService, args);
                case "$reduceConnectionGraceTime" /* RemoteTerminalChannelRequest.ReduceConnectionGraceTime */: return this._reduceConnectionGraceTime();
                case "$updateIcon" /* RemoteTerminalChannelRequest.UpdateIcon */: return this._ptyHostService.updateIcon.apply(this._ptyHostService, args);
                case "$updateTitle" /* RemoteTerminalChannelRequest.UpdateTitle */: return this._ptyHostService.updateTitle.apply(this._ptyHostService, args);
                case "$updateProperty" /* RemoteTerminalChannelRequest.UpdateProperty */: return this._ptyHostService.updateProperty.apply(this._ptyHostService, args);
                case "$refreshProperty" /* RemoteTerminalChannelRequest.RefreshProperty */: return this._ptyHostService.refreshProperty.apply(this._ptyHostService, args);
                case "$requestDetachInstance" /* RemoteTerminalChannelRequest.RequestDetachInstance */: return this._ptyHostService.requestDetachInstance(args[0], args[1]);
                case "$acceptDetachedInstance" /* RemoteTerminalChannelRequest.AcceptDetachedInstance */: return this._ptyHostService.acceptDetachInstanceReply(args[0], args[1]);
                case "$freePortKillProcess" /* RemoteTerminalChannelRequest.FreePortKillProcess */: return this._ptyHostService.freePortKillProcess.apply(this._ptyHostService, args);
                case "$acceptDetachInstanceReply" /* RemoteTerminalChannelRequest.AcceptDetachInstanceReply */: return this._ptyHostService.acceptDetachInstanceReply.apply(this._ptyHostService, args);
            }
            // @ts-expect-error Assert command is the `never` type to ensure all messages are handled
            throw new Error(`IPC Command ${command} not found`);
        }
        listen(_, event, arg) {
            switch (event) {
                case "$onPtyHostExitEvent" /* RemoteTerminalChannelEvent.OnPtyHostExitEvent */: return this._ptyHostService.onPtyHostExit || event_1.Event.None;
                case "$onPtyHostStartEvent" /* RemoteTerminalChannelEvent.OnPtyHostStartEvent */: return this._ptyHostService.onPtyHostStart || event_1.Event.None;
                case "$onPtyHostUnresponsiveEvent" /* RemoteTerminalChannelEvent.OnPtyHostUnresponsiveEvent */: return this._ptyHostService.onPtyHostUnresponsive || event_1.Event.None;
                case "$onPtyHostResponsiveEvent" /* RemoteTerminalChannelEvent.OnPtyHostResponsiveEvent */: return this._ptyHostService.onPtyHostResponsive || event_1.Event.None;
                case "$onPtyHostRequestResolveVariablesEvent" /* RemoteTerminalChannelEvent.OnPtyHostRequestResolveVariablesEvent */: return this._ptyHostService.onPtyHostRequestResolveVariables || event_1.Event.None;
                case "$onProcessDataEvent" /* RemoteTerminalChannelEvent.OnProcessDataEvent */: return this._ptyHostService.onProcessData;
                case "$onProcessReadyEvent" /* RemoteTerminalChannelEvent.OnProcessReadyEvent */: return this._ptyHostService.onProcessReady;
                case "$onProcessExitEvent" /* RemoteTerminalChannelEvent.OnProcessExitEvent */: return this._ptyHostService.onProcessExit;
                case "$onProcessReplayEvent" /* RemoteTerminalChannelEvent.OnProcessReplayEvent */: return this._ptyHostService.onProcessReplay;
                case "$onProcessOrphanQuestion" /* RemoteTerminalChannelEvent.OnProcessOrphanQuestion */: return this._ptyHostService.onProcessOrphanQuestion;
                case "$onExecuteCommand" /* RemoteTerminalChannelEvent.OnExecuteCommand */: return this.onExecuteCommand;
                case "$onDidRequestDetach" /* RemoteTerminalChannelEvent.OnDidRequestDetach */: return this._ptyHostService.onDidRequestDetach || event_1.Event.None;
                case "$onDidChangeProperty" /* RemoteTerminalChannelEvent.OnDidChangeProperty */: return this._ptyHostService.onDidChangeProperty;
            }
            // @ts-expect-error Assert event is the `never` type to ensure all messages are handled
            throw new Error(`IPC Command ${event} not found`);
        }
        async _createProcess(uriTransformer, args) {
            const shellLaunchConfig = {
                name: args.shellLaunchConfig.name,
                executable: args.shellLaunchConfig.executable,
                args: args.shellLaunchConfig.args,
                cwd: (typeof args.shellLaunchConfig.cwd === 'string' || typeof args.shellLaunchConfig.cwd === 'undefined'
                    ? args.shellLaunchConfig.cwd
                    : uri_1.URI.revive(uriTransformer.transformIncoming(args.shellLaunchConfig.cwd))),
                env: args.shellLaunchConfig.env,
                useShellEnvironment: args.shellLaunchConfig.useShellEnvironment,
                reconnectionProperties: args.shellLaunchConfig.reconnectionProperties,
                type: args.shellLaunchConfig.type,
                isFeatureTerminal: args.shellLaunchConfig.isFeatureTerminal
            };
            const baseEnv = await (0, extensionHostConnection_1.buildUserEnvironment)(args.resolverEnv, !!args.shellLaunchConfig.useShellEnvironment, platform.language, this._environmentService, this._logService, this._configurationService);
            this._logService.trace('baseEnv', baseEnv);
            const reviveWorkspaceFolder = (workspaceData) => {
                return {
                    uri: uri_1.URI.revive(uriTransformer.transformIncoming(workspaceData.uri)),
                    name: workspaceData.name,
                    index: workspaceData.index,
                    toResource: () => {
                        throw new Error('Not implemented');
                    }
                };
            };
            const workspaceFolders = args.workspaceFolders.map(reviveWorkspaceFolder);
            const activeWorkspaceFolder = args.activeWorkspaceFolder ? reviveWorkspaceFolder(args.activeWorkspaceFolder) : undefined;
            const activeFileResource = args.activeFileResource ? uri_1.URI.revive(uriTransformer.transformIncoming(args.activeFileResource)) : undefined;
            const customVariableResolver = new CustomVariableResolver(baseEnv, workspaceFolders, activeFileResource, args.resolvedVariables, this._extensionManagementService);
            const variableResolver = terminalEnvironment.createVariableResolver(activeWorkspaceFolder, process.env, customVariableResolver);
            // Get the initial cwd
            const initialCwd = await terminalEnvironment.getCwd(shellLaunchConfig, os.homedir(), variableResolver, activeWorkspaceFolder?.uri, args.configuration['terminal.integrated.cwd'], this._logService);
            shellLaunchConfig.cwd = initialCwd;
            const envPlatformKey = platform.isWindows ? 'terminal.integrated.env.windows' : (platform.isMacintosh ? 'terminal.integrated.env.osx' : 'terminal.integrated.env.linux');
            const envFromConfig = args.configuration[envPlatformKey];
            const env = await terminalEnvironment.createTerminalEnvironment(shellLaunchConfig, envFromConfig, variableResolver, this._productService.version, args.configuration['terminal.integrated.detectLocale'], baseEnv);
            // Apply extension environment variable collections to the environment
            if (!shellLaunchConfig.strictEnv) {
                const entries = [];
                for (const [k, v, d] of args.envVariableCollections) {
                    entries.push([k, { map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)(v), descriptionMap: (0, environmentVariableShared_1.deserializeEnvironmentDescriptionMap)(d) }]);
                }
                const envVariableCollections = new Map(entries);
                const mergedCollection = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(envVariableCollections);
                const workspaceFolder = activeWorkspaceFolder ? activeWorkspaceFolder ?? undefined : undefined;
                await mergedCollection.applyToProcessEnvironment(env, { workspaceFolder }, variableResolver);
            }
            // Fork the process and listen for messages
            this._logService.debug(`Terminal process launching on remote agent`, { shellLaunchConfig, initialCwd, cols: args.cols, rows: args.rows, env });
            // Setup the CLI server to support forwarding commands run from the CLI
            const ipcHandlePath = (0, ipc_net_1.createRandomIPCHandle)();
            env.VSCODE_IPC_HOOK_CLI = ipcHandlePath;
            const persistentProcessId = await this._ptyHostService.createProcess(shellLaunchConfig, initialCwd, args.cols, args.rows, args.unicodeVersion, env, baseEnv, args.options, args.shouldPersistTerminal, args.workspaceId, args.workspaceName);
            const commandsExecuter = {
                executeCommand: (id, ...args) => this._executeCommand(persistentProcessId, id, args, uriTransformer)
            };
            const cliServer = new extHostCLIServer_1.CLIServerBase(commandsExecuter, this._logService, ipcHandlePath);
            this._ptyHostService.onProcessExit(e => e.id === persistentProcessId && cliServer.dispose());
            return {
                persistentTerminalId: persistentProcessId,
                resolvedShellLaunchConfig: shellLaunchConfig
            };
        }
        _executeCommand(persistentProcessId, commandId, commandArgs, uriTransformer) {
            let resolve;
            let reject;
            const result = new Promise((_resolve, _reject) => {
                resolve = _resolve;
                reject = _reject;
            });
            const reqId = ++this._lastReqId;
            this._pendingCommands.set(reqId, { resolve, reject, uriTransformer });
            const serializedCommandArgs = (0, objects_1.cloneAndChange)(commandArgs, (obj) => {
                if (obj && obj.$mid === 1) {
                    // this is UriComponents
                    return uriTransformer.transformOutgoing(obj);
                }
                if (obj && obj instanceof uri_1.URI) {
                    return uriTransformer.transformOutgoingURI(obj);
                }
                return undefined;
            });
            this._onExecuteCommand.fire({
                reqId,
                persistentProcessId,
                commandId,
                commandArgs: serializedCommandArgs
            });
            return result;
        }
        _sendCommandResult(reqId, isError, serializedPayload) {
            const data = this._pendingCommands.get(reqId);
            if (!data) {
                return;
            }
            this._pendingCommands.delete(reqId);
            const payload = (0, objects_1.cloneAndChange)(serializedPayload, (obj) => {
                if (obj && obj.$mid === 1) {
                    // this is UriComponents
                    return data.uriTransformer.transformIncoming(obj);
                }
                return undefined;
            });
            if (isError) {
                data.reject(payload);
            }
            else {
                data.resolve(payload);
            }
        }
        _getDefaultSystemShell(osOverride) {
            return this._ptyHostService.getDefaultSystemShell(osOverride);
        }
        async _getProfiles(workspaceId, profiles, defaultProfile, includeDetectedProfiles) {
            return this._ptyHostService.getProfiles(workspaceId, profiles, defaultProfile, includeDetectedProfiles) || [];
        }
        _getEnvironment() {
            return { ...process.env };
        }
        _getWslPath(original, direction) {
            return this._ptyHostService.getWslPath(original, direction);
        }
        _reduceConnectionGraceTime() {
            return this._ptyHostService.reduceConnectionGraceTime();
        }
    }
    exports.RemoteTerminalChannel = RemoteTerminalChannel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlVGVybWluYWxDaGFubmVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvc2VydmVyL25vZGUvcmVtb3RlVGVybWluYWxDaGFubmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQStCaEcsTUFBTSxzQkFBdUIsU0FBUSxrREFBK0I7UUFDbkUsWUFDQyxHQUFpQyxFQUNqQyxnQkFBb0MsRUFDcEMsa0JBQW1DLEVBQ25DLGlCQUE2QyxFQUM3QyxnQkFBNkM7WUFFN0MsS0FBSyxDQUFDO2dCQUNMLFlBQVksRUFBRSxDQUFDLFVBQWtCLEVBQW1CLEVBQUU7b0JBQ3JELE1BQU0sS0FBSyxHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssVUFBVSxDQUFDLENBQUM7b0JBQ2xFLElBQUksS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO3dCQUM5QixPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7cUJBQ3BCO29CQUNELE9BQU8sU0FBUyxDQUFDO2dCQUNsQixDQUFDO2dCQUNELHVCQUF1QixFQUFFLEdBQVcsRUFBRTtvQkFDckMsT0FBTyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUM7Z0JBQ2hDLENBQUM7Z0JBQ0QscUJBQXFCLEVBQUUsQ0FBQyxTQUFjLEVBQUUsT0FBZSxFQUFzQixFQUFFO29CQUM5RSxPQUFPLGlCQUFpQixDQUFDLFVBQVUsT0FBTyxFQUFFLENBQUMsQ0FBQztnQkFDL0MsQ0FBQztnQkFDRCxXQUFXLEVBQUUsR0FBdUIsRUFBRTtvQkFDckMsT0FBTyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQztnQkFDaEMsQ0FBQztnQkFDRCxVQUFVLEVBQUUsR0FBdUIsRUFBRTtvQkFDcEMsT0FBTyxHQUFHLENBQUMsWUFBWSxDQUFD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