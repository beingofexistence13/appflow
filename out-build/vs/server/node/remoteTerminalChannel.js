/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "vs/base/common/event", "vs/base/common/objects", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/uri", "vs/base/parts/ipc/node/ipc.net", "vs/workbench/api/node/uriTransformer", "vs/workbench/api/node/extHostCLIServer", "vs/platform/terminal/common/environmentVariableCollection", "vs/platform/terminal/common/environmentVariableShared", "vs/workbench/contrib/terminal/common/terminalEnvironment", "vs/workbench/services/configurationResolver/common/variableResolver", "vs/server/node/extensionHostConnection"], function (require, exports, os, event_1, objects_1, lifecycle_1, path, platform, uri_1, ipc_net_1, uriTransformer_1, extHostCLIServer_1, environmentVariableCollection_1, environmentVariableShared_1, terminalEnvironment, variableResolver_1, extensionHostConnection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$4M = void 0;
    class CustomVariableResolver extends variableResolver_1.$3M {
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
                        return path.$7d(activeFileResource.fsPath);
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
    class $4M extends lifecycle_1.$kc {
        constructor(g, h, j, m, n, r) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.a = 0;
            this.b = new Map();
            this.c = this.B(new event_1.$fd());
            this.onExecuteCommand = this.c.event;
        }
        async call(ctx, command, args) {
            switch (command) {
                case "$restartPtyHost" /* RemoteTerminalChannelRequest.RestartPtyHost */: return this.j.restartPtyHost.apply(this.j, args);
                case "$createProcess" /* RemoteTerminalChannelRequest.CreateProcess */: {
                    const uriTransformer = (0, uriTransformer_1.$qr)(ctx.remoteAuthority);
                    return this.s(uriTransformer, args);
                }
                case "$attachToProcess" /* RemoteTerminalChannelRequest.AttachToProcess */: return this.j.attachToProcess.apply(this.j, args);
                case "$detachFromProcess" /* RemoteTerminalChannelRequest.DetachFromProcess */: return this.j.detachFromProcess.apply(this.j, args);
                case "$listProcesses" /* RemoteTerminalChannelRequest.ListProcesses */: return this.j.listProcesses.apply(this.j, args);
                case "$getLatency" /* RemoteTerminalChannelRequest.GetLatency */: return this.j.getLatency.apply(this.j, args);
                case "$getPerformanceMarks" /* RemoteTerminalChannelRequest.GetPerformanceMarks */: return this.j.getPerformanceMarks.apply(this.j, args);
                case "$orphanQuestionReply" /* RemoteTerminalChannelRequest.OrphanQuestionReply */: return this.j.orphanQuestionReply.apply(this.j, args);
                case "$acceptPtyHostResolvedVariables" /* RemoteTerminalChannelRequest.AcceptPtyHostResolvedVariables */: return this.j.acceptPtyHostResolvedVariables.apply(this.j, args);
                case "$start" /* RemoteTerminalChannelRequest.Start */: return this.j.start.apply(this.j, args);
                case "$input" /* RemoteTerminalChannelRequest.Input */: return this.j.input.apply(this.j, args);
                case "$acknowledgeDataEvent" /* RemoteTerminalChannelRequest.AcknowledgeDataEvent */: return this.j.acknowledgeDataEvent.apply(this.j, args);
                case "$shutdown" /* RemoteTerminalChannelRequest.Shutdown */: return this.j.shutdown.apply(this.j, args);
                case "$resize" /* RemoteTerminalChannelRequest.Resize */: return this.j.resize.apply(this.j, args);
                case "$clearBuffer" /* RemoteTerminalChannelRequest.ClearBuffer */: return this.j.clearBuffer.apply(this.j, args);
                case "$getInitialCwd" /* RemoteTerminalChannelRequest.GetInitialCwd */: return this.j.getInitialCwd.apply(this.j, args);
                case "$getCwd" /* RemoteTerminalChannelRequest.GetCwd */: return this.j.getCwd.apply(this.j, args);
                case "$processBinary" /* RemoteTerminalChannelRequest.ProcessBinary */: return this.j.processBinary.apply(this.j, args);
                case "$sendCommandResult" /* RemoteTerminalChannelRequest.SendCommandResult */: return this.u(args[0], args[1], args[2]);
                case "$installAutoReply" /* RemoteTerminalChannelRequest.InstallAutoReply */: return this.j.installAutoReply.apply(this.j, args);
                case "$uninstallAllAutoReplies" /* RemoteTerminalChannelRequest.UninstallAllAutoReplies */: return this.j.uninstallAllAutoReplies.apply(this.j, args);
                case "$getDefaultSystemShell" /* RemoteTerminalChannelRequest.GetDefaultSystemShell */: return this.w.apply(this, args);
                case "$getProfiles" /* RemoteTerminalChannelRequest.GetProfiles */: return this.y.apply(this, args);
                case "$getEnvironment" /* RemoteTerminalChannelRequest.GetEnvironment */: return this.z();
                case "$getWslPath" /* RemoteTerminalChannelRequest.GetWslPath */: return this.C(args[0], args[1]);
                case "$getTerminalLayoutInfo" /* RemoteTerminalChannelRequest.GetTerminalLayoutInfo */: return this.j.getTerminalLayoutInfo(args);
                case "$setTerminalLayoutInfo" /* RemoteTerminalChannelRequest.SetTerminalLayoutInfo */: return this.j.setTerminalLayoutInfo(args);
                case "$serializeTerminalState" /* RemoteTerminalChannelRequest.SerializeTerminalState */: return this.j.serializeTerminalState.apply(this.j, args);
                case "$reviveTerminalProcesses" /* RemoteTerminalChannelRequest.ReviveTerminalProcesses */: return this.j.reviveTerminalProcesses.apply(this.j, args);
                case "$getRevivedPtyNewId" /* RemoteTerminalChannelRequest.GetRevivedPtyNewId */: return this.j.getRevivedPtyNewId.apply(this.j, args);
                case "$setUnicodeVersion" /* RemoteTerminalChannelRequest.SetUnicodeVersion */: return this.j.setUnicodeVersion.apply(this.j, args);
                case "$reduceConnectionGraceTime" /* RemoteTerminalChannelRequest.ReduceConnectionGraceTime */: return this.D();
                case "$updateIcon" /* RemoteTerminalChannelRequest.UpdateIcon */: return this.j.updateIcon.apply(this.j, args);
                case "$updateTitle" /* RemoteTerminalChannelRequest.UpdateTitle */: return this.j.updateTitle.apply(this.j, args);
                case "$updateProperty" /* RemoteTerminalChannelRequest.UpdateProperty */: return this.j.updateProperty.apply(this.j, args);
                case "$refreshProperty" /* RemoteTerminalChannelRequest.RefreshProperty */: return this.j.refreshProperty.apply(this.j, args);
                case "$requestDetachInstance" /* RemoteTerminalChannelRequest.RequestDetachInstance */: return this.j.requestDetachInstance(args[0], args[1]);
                case "$acceptDetachedInstance" /* RemoteTerminalChannelRequest.AcceptDetachedInstance */: return this.j.acceptDetachInstanceReply(args[0], args[1]);
                case "$freePortKillProcess" /* RemoteTerminalChannelRequest.FreePortKillProcess */: return this.j.freePortKillProcess.apply(this.j, args);
                case "$acceptDetachInstanceReply" /* RemoteTerminalChannelRequest.AcceptDetachInstanceReply */: return this.j.acceptDetachInstanceReply.apply(this.j, args);
            }
            // @ts-expect-error Assert command is the `never` type to ensure all messages are handled
            throw new Error(`IPC Command ${command} not found`);
        }
        listen(_, event, arg) {
            switch (event) {
                case "$onPtyHostExitEvent" /* RemoteTerminalChannelEvent.OnPtyHostExitEvent */: return this.j.onPtyHostExit || event_1.Event.None;
                case "$onPtyHostStartEvent" /* RemoteTerminalChannelEvent.OnPtyHostStartEvent */: return this.j.onPtyHostStart || event_1.Event.None;
                case "$onPtyHostUnresponsiveEvent" /* RemoteTerminalChannelEvent.OnPtyHostUnresponsiveEvent */: return this.j.onPtyHostUnresponsive || event_1.Event.None;
                case "$onPtyHostResponsiveEvent" /* RemoteTerminalChannelEvent.OnPtyHostResponsiveEvent */: return this.j.onPtyHostResponsive || event_1.Event.None;
                case "$onPtyHostRequestResolveVariablesEvent" /* RemoteTerminalChannelEvent.OnPtyHostRequestResolveVariablesEvent */: return this.j.onPtyHostRequestResolveVariables || event_1.Event.None;
                case "$onProcessDataEvent" /* RemoteTerminalChannelEvent.OnProcessDataEvent */: return this.j.onProcessData;
                case "$onProcessReadyEvent" /* RemoteTerminalChannelEvent.OnProcessReadyEvent */: return this.j.onProcessReady;
                case "$onProcessExitEvent" /* RemoteTerminalChannelEvent.OnProcessExitEvent */: return this.j.onProcessExit;
                case "$onProcessReplayEvent" /* RemoteTerminalChannelEvent.OnProcessReplayEvent */: return this.j.onProcessReplay;
                case "$onProcessOrphanQuestion" /* RemoteTerminalChannelEvent.OnProcessOrphanQuestion */: return this.j.onProcessOrphanQuestion;
                case "$onExecuteCommand" /* RemoteTerminalChannelEvent.OnExecuteCommand */: return this.onExecuteCommand;
                case "$onDidRequestDetach" /* RemoteTerminalChannelEvent.OnDidRequestDetach */: return this.j.onDidRequestDetach || event_1.Event.None;
                case "$onDidChangeProperty" /* RemoteTerminalChannelEvent.OnDidChangeProperty */: return this.j.onDidChangeProperty;
            }
            // @ts-expect-error Assert event is the `never` type to ensure all messages are handled
            throw new Error(`IPC Command ${event} not found`);
        }
        async s(uriTransformer, args) {
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
            const baseEnv = await (0, extensionHostConnection_1.$sm)(args.resolverEnv, !!args.shellLaunchConfig.useShellEnvironment, platform.$v, this.g, this.h, this.r);
            this.h.trace('baseEnv', baseEnv);
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
            const customVariableResolver = new CustomVariableResolver(baseEnv, workspaceFolders, activeFileResource, args.resolvedVariables, this.n);
            const variableResolver = terminalEnvironment.$YM(activeWorkspaceFolder, process.env, customVariableResolver);
            // Get the initial cwd
            const initialCwd = await terminalEnvironment.$XM(shellLaunchConfig, os.homedir(), variableResolver, activeWorkspaceFolder?.uri, args.configuration['terminal.integrated.cwd'], this.h);
            shellLaunchConfig.cwd = initialCwd;
            const envPlatformKey = platform.$i ? 'terminal.integrated.env.windows' : (platform.$j ? 'terminal.integrated.env.osx' : 'terminal.integrated.env.linux');
            const envFromConfig = args.configuration[envPlatformKey];
            const env = await terminalEnvironment.$ZM(shellLaunchConfig, envFromConfig, variableResolver, this.m.version, args.configuration['terminal.integrated.detectLocale'], baseEnv);
            // Apply extension environment variable collections to the environment
            if (!shellLaunchConfig.strictEnv) {
                const entries = [];
                for (const [k, v, d] of args.envVariableCollections) {
                    entries.push([k, { map: (0, environmentVariableShared_1.$cr)(v), descriptionMap: (0, environmentVariableShared_1.$dr)(d) }]);
                }
                const envVariableCollections = new Map(entries);
                const mergedCollection = new environmentVariableCollection_1.$gr(envVariableCollections);
                const workspaceFolder = activeWorkspaceFolder ? activeWorkspaceFolder ?? undefined : undefined;
                await mergedCollection.applyToProcessEnvironment(env, { workspaceFolder }, variableResolver);
            }
            // Fork the process and listen for messages
            this.h.debug(`Terminal process launching on remote agent`, { shellLaunchConfig, initialCwd, cols: args.cols, rows: args.rows, env });
            // Setup the CLI server to support forwarding commands run from the CLI
            const ipcHandlePath = (0, ipc_net_1.$th)();
            env.VSCODE_IPC_HOOK_CLI = ipcHandlePath;
            const persistentProcessId = await this.j.createProcess(shellLaunchConfig, initialCwd, args.cols, args.rows, args.unicodeVersion, env, baseEnv, args.options, args.shouldPersistTerminal, args.workspaceId, args.workspaceName);
            const commandsExecuter = {
                executeCommand: (id, ...args) => this.t(persistentProcessId, id, args, uriTransformer)
            };
            const cliServer = new extHostCLIServer_1.$qM(commandsExecuter, this.h, ipcHandlePath);
            this.j.onProcessExit(e => e.id === persistentProcessId && cliServer.dispose());
            return {
                persistentTerminalId: persistentProcessId,
                resolvedShellLaunchConfig: shellLaunchConfig
            };
        }
        t(persistentProcessId, commandId, commandArgs, uriTransformer) {
            let resolve;
            let reject;
            const result = new Promise((_resolve, _reject) => {
                resolve = _resolve;
                reject = _reject;
            });
            const reqId = ++this.a;
            this.b.set(reqId, { resolve, reject, uriTransformer });
            const serializedCommandArgs = (0, objects_1.$Xm)(commandArgs, (obj) => {
                if (obj && obj.$mid === 1) {
                    // this is UriComponents
                    return uriTransformer.transformOutgoing(obj);
                }
                if (obj && obj instanceof uri_1.URI) {
                    return uriTransformer.transformOutgoingURI(obj);
                }
                return undefined;
            });
            this.c.fire({
                reqId,
                persistentProcessId,
                commandId,
                commandArgs: serializedCommandArgs
            });
            return result;
        }
        u(reqId, isError, serializedPayload) {
            const data = this.b.get(reqId);
            if (!data) {
                return;
            }
            this.b.delete(reqId);
            const payload = (0, objects_1.$Xm)(serializedPayload, (obj) => {
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
        w(osOverride) {
            return this.j.getDefaultSystemShell(osOverride);
        }
        async y(workspaceId, profiles, defaultProfile, includeDetectedProfiles) {
            return this.j.getProfiles(workspaceId, profiles, defaultProfile, includeDetectedProfiles) || [];
        }
        z() {
            return { ...process.env };
        }
        C(original, direction) {
            return this.j.getWslPath(original, direction);
        }
        D() {
            return this.j.reduceConnectionGraceTime();
        }
    }
    exports.$4M = $4M;
});
//# sourceMappingURL=remoteTerminalChannel.js.map