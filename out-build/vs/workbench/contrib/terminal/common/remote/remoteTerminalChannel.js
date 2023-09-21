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
define(["require", "exports", "vs/workbench/services/configuration/common/configuration", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/workspace/common/workspace", "vs/platform/terminal/common/environmentVariableShared", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorService", "vs/base/common/network", "vs/platform/label/common/label", "vs/workbench/contrib/terminal/common/environmentVariable", "vs/platform/terminal/common/terminal"], function (require, exports, configuration_1, remoteAuthorityResolver_1, workspace_1, environmentVariableShared_1, configurationResolver_1, editor_1, editorService_1, network_1, label_1, environmentVariable_1, terminal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$6M = exports.$5M = void 0;
    exports.$5M = 'remoteterminal';
    let $6M = class $6M {
        get onPtyHostExit() {
            return this.b.listen("$onPtyHostExitEvent" /* RemoteTerminalChannelEvent.OnPtyHostExitEvent */);
        }
        get onPtyHostStart() {
            return this.b.listen("$onPtyHostStartEvent" /* RemoteTerminalChannelEvent.OnPtyHostStartEvent */);
        }
        get onPtyHostUnresponsive() {
            return this.b.listen("$onPtyHostUnresponsiveEvent" /* RemoteTerminalChannelEvent.OnPtyHostUnresponsiveEvent */);
        }
        get onPtyHostResponsive() {
            return this.b.listen("$onPtyHostResponsiveEvent" /* RemoteTerminalChannelEvent.OnPtyHostResponsiveEvent */);
        }
        get onPtyHostRequestResolveVariables() {
            return this.b.listen("$onPtyHostRequestResolveVariablesEvent" /* RemoteTerminalChannelEvent.OnPtyHostRequestResolveVariablesEvent */);
        }
        get onProcessData() {
            return this.b.listen("$onProcessDataEvent" /* RemoteTerminalChannelEvent.OnProcessDataEvent */);
        }
        get onProcessExit() {
            return this.b.listen("$onProcessExitEvent" /* RemoteTerminalChannelEvent.OnProcessExitEvent */);
        }
        get onProcessReady() {
            return this.b.listen("$onProcessReadyEvent" /* RemoteTerminalChannelEvent.OnProcessReadyEvent */);
        }
        get onProcessReplay() {
            return this.b.listen("$onProcessReplayEvent" /* RemoteTerminalChannelEvent.OnProcessReplayEvent */);
        }
        get onProcessOrphanQuestion() {
            return this.b.listen("$onProcessOrphanQuestion" /* RemoteTerminalChannelEvent.OnProcessOrphanQuestion */);
        }
        get onExecuteCommand() {
            return this.b.listen("$onExecuteCommand" /* RemoteTerminalChannelEvent.OnExecuteCommand */);
        }
        get onDidRequestDetach() {
            return this.b.listen("$onDidRequestDetach" /* RemoteTerminalChannelEvent.OnDidRequestDetach */);
        }
        get onDidChangeProperty() {
            return this.b.listen("$onDidChangeProperty" /* RemoteTerminalChannelEvent.OnDidChangeProperty */);
        }
        constructor(a, b, c, d, e, f, g, h, i, j) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
        }
        restartPtyHost() {
            return this.b.call("$restartPtyHost" /* RemoteTerminalChannelRequest.RestartPtyHost */, []);
        }
        async createProcess(shellLaunchConfig, configuration, activeWorkspaceRootUri, options, shouldPersistTerminal, cols, rows, unicodeVersion) {
            // Be sure to first wait for the remote configuration
            await this.c.whenRemoteConfigurationLoaded();
            // We will use the resolver service to resolve all the variables in the config / launch config
            // But then we will keep only some variables, since the rest need to be resolved on the remote side
            const resolvedVariables = Object.create(null);
            const lastActiveWorkspace = activeWorkspaceRootUri ? this.d.getWorkspaceFolder(activeWorkspaceRootUri) ?? undefined : undefined;
            let allResolvedVariables = undefined;
            try {
                allResolvedVariables = (await this.e.resolveAnyMap(lastActiveWorkspace, {
                    shellLaunchConfig,
                    configuration
                })).resolvedVariables;
            }
            catch (err) {
                this.h.error(err);
            }
            if (allResolvedVariables) {
                for (const [name, value] of allResolvedVariables.entries()) {
                    if (/^config:/.test(name) || name === 'selectedText' || name === 'lineNumber') {
                        resolvedVariables[name] = value;
                    }
                }
            }
            const envVariableCollections = [];
            for (const [k, v] of this.f.collections.entries()) {
                envVariableCollections.push([k, (0, environmentVariableShared_1.$ar)(v.map), (0, environmentVariableShared_1.$br)(v.descriptionMap)]);
            }
            const resolverResult = await this.g.resolveAuthority(this.a);
            const resolverEnv = resolverResult.options && resolverResult.options.extensionHostEnv;
            const workspace = this.d.getWorkspace();
            const workspaceFolders = workspace.folders;
            const activeWorkspaceFolder = activeWorkspaceRootUri ? this.d.getWorkspaceFolder(activeWorkspaceRootUri) : null;
            const activeFileResource = editor_1.$3E.getOriginalUri(this.i.activeEditor, {
                supportSideBySide: editor_1.SideBySideEditor.PRIMARY,
                filterByScheme: [network_1.Schemas.file, network_1.Schemas.vscodeUserData, network_1.Schemas.vscodeRemote]
            });
            const args = {
                configuration,
                resolvedVariables,
                envVariableCollections,
                shellLaunchConfig,
                workspaceId: workspace.id,
                workspaceName: this.j.getWorkspaceLabel(workspace),
                workspaceFolders,
                activeWorkspaceFolder,
                activeFileResource,
                shouldPersistTerminal,
                options,
                cols,
                rows,
                unicodeVersion,
                resolverEnv
            };
            return await this.b.call("$createProcess" /* RemoteTerminalChannelRequest.CreateProcess */, args);
        }
        requestDetachInstance(workspaceId, instanceId) {
            return this.b.call("$requestDetachInstance" /* RemoteTerminalChannelRequest.RequestDetachInstance */, [workspaceId, instanceId]);
        }
        acceptDetachInstanceReply(requestId, persistentProcessId) {
            return this.b.call("$acceptDetachInstanceReply" /* RemoteTerminalChannelRequest.AcceptDetachInstanceReply */, [requestId, persistentProcessId]);
        }
        attachToProcess(id) {
            return this.b.call("$attachToProcess" /* RemoteTerminalChannelRequest.AttachToProcess */, [id]);
        }
        detachFromProcess(id, forcePersist) {
            return this.b.call("$detachFromProcess" /* RemoteTerminalChannelRequest.DetachFromProcess */, [id, forcePersist]);
        }
        listProcesses() {
            return this.b.call("$listProcesses" /* RemoteTerminalChannelRequest.ListProcesses */);
        }
        getLatency() {
            return this.b.call("$getLatency" /* RemoteTerminalChannelRequest.GetLatency */);
        }
        getPerformanceMarks() {
            return this.b.call("$getPerformanceMarks" /* RemoteTerminalChannelRequest.GetPerformanceMarks */);
        }
        reduceConnectionGraceTime() {
            return this.b.call("$reduceConnectionGraceTime" /* RemoteTerminalChannelRequest.ReduceConnectionGraceTime */);
        }
        processBinary(id, data) {
            return this.b.call("$processBinary" /* RemoteTerminalChannelRequest.ProcessBinary */, [id, data]);
        }
        start(id) {
            return this.b.call("$start" /* RemoteTerminalChannelRequest.Start */, [id]);
        }
        input(id, data) {
            return this.b.call("$input" /* RemoteTerminalChannelRequest.Input */, [id, data]);
        }
        acknowledgeDataEvent(id, charCount) {
            return this.b.call("$acknowledgeDataEvent" /* RemoteTerminalChannelRequest.AcknowledgeDataEvent */, [id, charCount]);
        }
        setUnicodeVersion(id, version) {
            return this.b.call("$setUnicodeVersion" /* RemoteTerminalChannelRequest.SetUnicodeVersion */, [id, version]);
        }
        shutdown(id, immediate) {
            return this.b.call("$shutdown" /* RemoteTerminalChannelRequest.Shutdown */, [id, immediate]);
        }
        resize(id, cols, rows) {
            return this.b.call("$resize" /* RemoteTerminalChannelRequest.Resize */, [id, cols, rows]);
        }
        clearBuffer(id) {
            return this.b.call("$clearBuffer" /* RemoteTerminalChannelRequest.ClearBuffer */, [id]);
        }
        getInitialCwd(id) {
            return this.b.call("$getInitialCwd" /* RemoteTerminalChannelRequest.GetInitialCwd */, [id]);
        }
        getCwd(id) {
            return this.b.call("$getCwd" /* RemoteTerminalChannelRequest.GetCwd */, [id]);
        }
        orphanQuestionReply(id) {
            return this.b.call("$orphanQuestionReply" /* RemoteTerminalChannelRequest.OrphanQuestionReply */, [id]);
        }
        sendCommandResult(reqId, isError, payload) {
            return this.b.call("$sendCommandResult" /* RemoteTerminalChannelRequest.SendCommandResult */, [reqId, isError, payload]);
        }
        freePortKillProcess(port) {
            return this.b.call("$freePortKillProcess" /* RemoteTerminalChannelRequest.FreePortKillProcess */, [port]);
        }
        installAutoReply(match, reply) {
            return this.b.call("$installAutoReply" /* RemoteTerminalChannelRequest.InstallAutoReply */, [match, reply]);
        }
        uninstallAllAutoReplies() {
            return this.b.call("$uninstallAllAutoReplies" /* RemoteTerminalChannelRequest.UninstallAllAutoReplies */, []);
        }
        getDefaultSystemShell(osOverride) {
            return this.b.call("$getDefaultSystemShell" /* RemoteTerminalChannelRequest.GetDefaultSystemShell */, [osOverride]);
        }
        getProfiles(profiles, defaultProfile, includeDetectedProfiles) {
            return this.b.call("$getProfiles" /* RemoteTerminalChannelRequest.GetProfiles */, [this.d.getWorkspace().id, profiles, defaultProfile, includeDetectedProfiles]);
        }
        acceptPtyHostResolvedVariables(requestId, resolved) {
            return this.b.call("$acceptPtyHostResolvedVariables" /* RemoteTerminalChannelRequest.AcceptPtyHostResolvedVariables */, [requestId, resolved]);
        }
        getEnvironment() {
            return this.b.call("$getEnvironment" /* RemoteTerminalChannelRequest.GetEnvironment */);
        }
        getWslPath(original, direction) {
            return this.b.call("$getWslPath" /* RemoteTerminalChannelRequest.GetWslPath */, [original, direction]);
        }
        setTerminalLayoutInfo(layout) {
            const workspace = this.d.getWorkspace();
            const args = {
                workspaceId: workspace.id,
                tabs: layout ? layout.tabs : []
            };
            return this.b.call("$setTerminalLayoutInfo" /* RemoteTerminalChannelRequest.SetTerminalLayoutInfo */, args);
        }
        updateTitle(id, title, titleSource) {
            return this.b.call("$updateTitle" /* RemoteTerminalChannelRequest.UpdateTitle */, [id, title, titleSource]);
        }
        updateIcon(id, userInitiated, icon, color) {
            return this.b.call("$updateIcon" /* RemoteTerminalChannelRequest.UpdateIcon */, [id, userInitiated, icon, color]);
        }
        refreshProperty(id, property) {
            return this.b.call("$refreshProperty" /* RemoteTerminalChannelRequest.RefreshProperty */, [id, property]);
        }
        updateProperty(id, property, value) {
            return this.b.call("$updateProperty" /* RemoteTerminalChannelRequest.UpdateProperty */, [id, property, value]);
        }
        getTerminalLayoutInfo() {
            const workspace = this.d.getWorkspace();
            const args = {
                workspaceId: workspace.id,
            };
            return this.b.call("$getTerminalLayoutInfo" /* RemoteTerminalChannelRequest.GetTerminalLayoutInfo */, args);
        }
        reviveTerminalProcesses(workspaceId, state, dateTimeFormatLocate) {
            return this.b.call("$reviveTerminalProcesses" /* RemoteTerminalChannelRequest.ReviveTerminalProcesses */, [workspaceId, state, dateTimeFormatLocate]);
        }
        getRevivedPtyNewId(id) {
            return this.b.call("$getRevivedPtyNewId" /* RemoteTerminalChannelRequest.GetRevivedPtyNewId */, [id]);
        }
        serializeTerminalState(ids) {
            return this.b.call("$serializeTerminalState" /* RemoteTerminalChannelRequest.SerializeTerminalState */, [ids]);
        }
    };
    exports.$6M = $6M;
    exports.$6M = $6M = __decorate([
        __param(2, configuration_1.$mE),
        __param(3, workspace_1.$Kh),
        __param(4, configurationResolver_1.$NM),
        __param(5, environmentVariable_1.$sM),
        __param(6, remoteAuthorityResolver_1.$Jk),
        __param(7, terminal_1.$Zq),
        __param(8, editorService_1.$9C),
        __param(9, label_1.$Vz)
    ], $6M);
});
//# sourceMappingURL=remoteTerminalChannel.js.map