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
    exports.RemoteTerminalChannelClient = exports.REMOTE_TERMINAL_CHANNEL_NAME = void 0;
    exports.REMOTE_TERMINAL_CHANNEL_NAME = 'remoteterminal';
    let RemoteTerminalChannelClient = class RemoteTerminalChannelClient {
        get onPtyHostExit() {
            return this._channel.listen("$onPtyHostExitEvent" /* RemoteTerminalChannelEvent.OnPtyHostExitEvent */);
        }
        get onPtyHostStart() {
            return this._channel.listen("$onPtyHostStartEvent" /* RemoteTerminalChannelEvent.OnPtyHostStartEvent */);
        }
        get onPtyHostUnresponsive() {
            return this._channel.listen("$onPtyHostUnresponsiveEvent" /* RemoteTerminalChannelEvent.OnPtyHostUnresponsiveEvent */);
        }
        get onPtyHostResponsive() {
            return this._channel.listen("$onPtyHostResponsiveEvent" /* RemoteTerminalChannelEvent.OnPtyHostResponsiveEvent */);
        }
        get onPtyHostRequestResolveVariables() {
            return this._channel.listen("$onPtyHostRequestResolveVariablesEvent" /* RemoteTerminalChannelEvent.OnPtyHostRequestResolveVariablesEvent */);
        }
        get onProcessData() {
            return this._channel.listen("$onProcessDataEvent" /* RemoteTerminalChannelEvent.OnProcessDataEvent */);
        }
        get onProcessExit() {
            return this._channel.listen("$onProcessExitEvent" /* RemoteTerminalChannelEvent.OnProcessExitEvent */);
        }
        get onProcessReady() {
            return this._channel.listen("$onProcessReadyEvent" /* RemoteTerminalChannelEvent.OnProcessReadyEvent */);
        }
        get onProcessReplay() {
            return this._channel.listen("$onProcessReplayEvent" /* RemoteTerminalChannelEvent.OnProcessReplayEvent */);
        }
        get onProcessOrphanQuestion() {
            return this._channel.listen("$onProcessOrphanQuestion" /* RemoteTerminalChannelEvent.OnProcessOrphanQuestion */);
        }
        get onExecuteCommand() {
            return this._channel.listen("$onExecuteCommand" /* RemoteTerminalChannelEvent.OnExecuteCommand */);
        }
        get onDidRequestDetach() {
            return this._channel.listen("$onDidRequestDetach" /* RemoteTerminalChannelEvent.OnDidRequestDetach */);
        }
        get onDidChangeProperty() {
            return this._channel.listen("$onDidChangeProperty" /* RemoteTerminalChannelEvent.OnDidChangeProperty */);
        }
        constructor(_remoteAuthority, _channel, _configurationService, _workspaceContextService, _resolverService, _environmentVariableService, _remoteAuthorityResolverService, _logService, _editorService, _labelService) {
            this._remoteAuthority = _remoteAuthority;
            this._channel = _channel;
            this._configurationService = _configurationService;
            this._workspaceContextService = _workspaceContextService;
            this._resolverService = _resolverService;
            this._environmentVariableService = _environmentVariableService;
            this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
            this._logService = _logService;
            this._editorService = _editorService;
            this._labelService = _labelService;
        }
        restartPtyHost() {
            return this._channel.call("$restartPtyHost" /* RemoteTerminalChannelRequest.RestartPtyHost */, []);
        }
        async createProcess(shellLaunchConfig, configuration, activeWorkspaceRootUri, options, shouldPersistTerminal, cols, rows, unicodeVersion) {
            // Be sure to first wait for the remote configuration
            await this._configurationService.whenRemoteConfigurationLoaded();
            // We will use the resolver service to resolve all the variables in the config / launch config
            // But then we will keep only some variables, since the rest need to be resolved on the remote side
            const resolvedVariables = Object.create(null);
            const lastActiveWorkspace = activeWorkspaceRootUri ? this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? undefined : undefined;
            let allResolvedVariables = undefined;
            try {
                allResolvedVariables = (await this._resolverService.resolveAnyMap(lastActiveWorkspace, {
                    shellLaunchConfig,
                    configuration
                })).resolvedVariables;
            }
            catch (err) {
                this._logService.error(err);
            }
            if (allResolvedVariables) {
                for (const [name, value] of allResolvedVariables.entries()) {
                    if (/^config:/.test(name) || name === 'selectedText' || name === 'lineNumber') {
                        resolvedVariables[name] = value;
                    }
                }
            }
            const envVariableCollections = [];
            for (const [k, v] of this._environmentVariableService.collections.entries()) {
                envVariableCollections.push([k, (0, environmentVariableShared_1.serializeEnvironmentVariableCollection)(v.map), (0, environmentVariableShared_1.serializeEnvironmentDescriptionMap)(v.descriptionMap)]);
            }
            const resolverResult = await this._remoteAuthorityResolverService.resolveAuthority(this._remoteAuthority);
            const resolverEnv = resolverResult.options && resolverResult.options.extensionHostEnv;
            const workspace = this._workspaceContextService.getWorkspace();
            const workspaceFolders = workspace.folders;
            const activeWorkspaceFolder = activeWorkspaceRootUri ? this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) : null;
            const activeFileResource = editor_1.EditorResourceAccessor.getOriginalUri(this._editorService.activeEditor, {
                supportSideBySide: editor_1.SideBySideEditor.PRIMARY,
                filterByScheme: [network_1.Schemas.file, network_1.Schemas.vscodeUserData, network_1.Schemas.vscodeRemote]
            });
            const args = {
                configuration,
                resolvedVariables,
                envVariableCollections,
                shellLaunchConfig,
                workspaceId: workspace.id,
                workspaceName: this._labelService.getWorkspaceLabel(workspace),
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
            return await this._channel.call("$createProcess" /* RemoteTerminalChannelRequest.CreateProcess */, args);
        }
        requestDetachInstance(workspaceId, instanceId) {
            return this._channel.call("$requestDetachInstance" /* RemoteTerminalChannelRequest.RequestDetachInstance */, [workspaceId, instanceId]);
        }
        acceptDetachInstanceReply(requestId, persistentProcessId) {
            return this._channel.call("$acceptDetachInstanceReply" /* RemoteTerminalChannelRequest.AcceptDetachInstanceReply */, [requestId, persistentProcessId]);
        }
        attachToProcess(id) {
            return this._channel.call("$attachToProcess" /* RemoteTerminalChannelRequest.AttachToProcess */, [id]);
        }
        detachFromProcess(id, forcePersist) {
            return this._channel.call("$detachFromProcess" /* RemoteTerminalChannelRequest.DetachFromProcess */, [id, forcePersist]);
        }
        listProcesses() {
            return this._channel.call("$listProcesses" /* RemoteTerminalChannelRequest.ListProcesses */);
        }
        getLatency() {
            return this._channel.call("$getLatency" /* RemoteTerminalChannelRequest.GetLatency */);
        }
        getPerformanceMarks() {
            return this._channel.call("$getPerformanceMarks" /* RemoteTerminalChannelRequest.GetPerformanceMarks */);
        }
        reduceConnectionGraceTime() {
            return this._channel.call("$reduceConnectionGraceTime" /* RemoteTerminalChannelRequest.ReduceConnectionGraceTime */);
        }
        processBinary(id, data) {
            return this._channel.call("$processBinary" /* RemoteTerminalChannelRequest.ProcessBinary */, [id, data]);
        }
        start(id) {
            return this._channel.call("$start" /* RemoteTerminalChannelRequest.Start */, [id]);
        }
        input(id, data) {
            return this._channel.call("$input" /* RemoteTerminalChannelRequest.Input */, [id, data]);
        }
        acknowledgeDataEvent(id, charCount) {
            return this._channel.call("$acknowledgeDataEvent" /* RemoteTerminalChannelRequest.AcknowledgeDataEvent */, [id, charCount]);
        }
        setUnicodeVersion(id, version) {
            return this._channel.call("$setUnicodeVersion" /* RemoteTerminalChannelRequest.SetUnicodeVersion */, [id, version]);
        }
        shutdown(id, immediate) {
            return this._channel.call("$shutdown" /* RemoteTerminalChannelRequest.Shutdown */, [id, immediate]);
        }
        resize(id, cols, rows) {
            return this._channel.call("$resize" /* RemoteTerminalChannelRequest.Resize */, [id, cols, rows]);
        }
        clearBuffer(id) {
            return this._channel.call("$clearBuffer" /* RemoteTerminalChannelRequest.ClearBuffer */, [id]);
        }
        getInitialCwd(id) {
            return this._channel.call("$getInitialCwd" /* RemoteTerminalChannelRequest.GetInitialCwd */, [id]);
        }
        getCwd(id) {
            return this._channel.call("$getCwd" /* RemoteTerminalChannelRequest.GetCwd */, [id]);
        }
        orphanQuestionReply(id) {
            return this._channel.call("$orphanQuestionReply" /* RemoteTerminalChannelRequest.OrphanQuestionReply */, [id]);
        }
        sendCommandResult(reqId, isError, payload) {
            return this._channel.call("$sendCommandResult" /* RemoteTerminalChannelRequest.SendCommandResult */, [reqId, isError, payload]);
        }
        freePortKillProcess(port) {
            return this._channel.call("$freePortKillProcess" /* RemoteTerminalChannelRequest.FreePortKillProcess */, [port]);
        }
        installAutoReply(match, reply) {
            return this._channel.call("$installAutoReply" /* RemoteTerminalChannelRequest.InstallAutoReply */, [match, reply]);
        }
        uninstallAllAutoReplies() {
            return this._channel.call("$uninstallAllAutoReplies" /* RemoteTerminalChannelRequest.UninstallAllAutoReplies */, []);
        }
        getDefaultSystemShell(osOverride) {
            return this._channel.call("$getDefaultSystemShell" /* RemoteTerminalChannelRequest.GetDefaultSystemShell */, [osOverride]);
        }
        getProfiles(profiles, defaultProfile, includeDetectedProfiles) {
            return this._channel.call("$getProfiles" /* RemoteTerminalChannelRequest.GetProfiles */, [this._workspaceContextService.getWorkspace().id, profiles, defaultProfile, includeDetectedProfiles]);
        }
        acceptPtyHostResolvedVariables(requestId, resolved) {
            return this._channel.call("$acceptPtyHostResolvedVariables" /* RemoteTerminalChannelRequest.AcceptPtyHostResolvedVariables */, [requestId, resolved]);
        }
        getEnvironment() {
            return this._channel.call("$getEnvironment" /* RemoteTerminalChannelRequest.GetEnvironment */);
        }
        getWslPath(original, direction) {
            return this._channel.call("$getWslPath" /* RemoteTerminalChannelRequest.GetWslPath */, [original, direction]);
        }
        setTerminalLayoutInfo(layout) {
            const workspace = this._workspaceContextService.getWorkspace();
            const args = {
                workspaceId: workspace.id,
                tabs: layout ? layout.tabs : []
            };
            return this._channel.call("$setTerminalLayoutInfo" /* RemoteTerminalChannelRequest.SetTerminalLayoutInfo */, args);
        }
        updateTitle(id, title, titleSource) {
            return this._channel.call("$updateTitle" /* RemoteTerminalChannelRequest.UpdateTitle */, [id, title, titleSource]);
        }
        updateIcon(id, userInitiated, icon, color) {
            return this._channel.call("$updateIcon" /* RemoteTerminalChannelRequest.UpdateIcon */, [id, userInitiated, icon, color]);
        }
        refreshProperty(id, property) {
            return this._channel.call("$refreshProperty" /* RemoteTerminalChannelRequest.RefreshProperty */, [id, property]);
        }
        updateProperty(id, property, value) {
            return this._channel.call("$updateProperty" /* RemoteTerminalChannelRequest.UpdateProperty */, [id, property, value]);
        }
        getTerminalLayoutInfo() {
            const workspace = this._workspaceContextService.getWorkspace();
            const args = {
                workspaceId: workspace.id,
            };
            return this._channel.call("$getTerminalLayoutInfo" /* RemoteTerminalChannelRequest.GetTerminalLayoutInfo */, args);
        }
        reviveTerminalProcesses(workspaceId, state, dateTimeFormatLocate) {
            return this._channel.call("$reviveTerminalProcesses" /* RemoteTerminalChannelRequest.ReviveTerminalProcesses */, [workspaceId, state, dateTimeFormatLocate]);
        }
        getRevivedPtyNewId(id) {
            return this._channel.call("$getRevivedPtyNewId" /* RemoteTerminalChannelRequest.GetRevivedPtyNewId */, [id]);
        }
        serializeTerminalState(ids) {
            return this._channel.call("$serializeTerminalState" /* RemoteTerminalChannelRequest.SerializeTerminalState */, [ids]);
        }
    };
    exports.RemoteTerminalChannelClient = RemoteTerminalChannelClient;
    exports.RemoteTerminalChannelClient = RemoteTerminalChannelClient = __decorate([
        __param(2, configuration_1.IWorkbenchConfigurationService),
        __param(3, workspace_1.IWorkspaceContextService),
        __param(4, configurationResolver_1.IConfigurationResolverService),
        __param(5, environmentVariable_1.IEnvironmentVariableService),
        __param(6, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(7, terminal_1.ITerminalLogService),
        __param(8, editorService_1.IEditorService),
        __param(9, label_1.ILabelService)
    ], RemoteTerminalChannelClient);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlVGVybWluYWxDaGFubmVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvY29tbW9uL3JlbW90ZS9yZW1vdGVUZXJtaW5hbENoYW5uZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBd0JuRixRQUFBLDRCQUE0QixHQUFHLGdCQUFnQixDQUFDO0lBaUN0RCxJQUFNLDJCQUEyQixHQUFqQyxNQUFNLDJCQUEyQjtRQUN2QyxJQUFJLGFBQWE7WUFDaEIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sMkVBQXVELENBQUM7UUFDcEYsQ0FBQztRQUNELElBQUksY0FBYztZQUNqQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSw2RUFBc0QsQ0FBQztRQUNuRixDQUFDO1FBQ0QsSUFBSSxxQkFBcUI7WUFDeEIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sMkZBQTZELENBQUM7UUFDMUYsQ0FBQztRQUNELElBQUksbUJBQW1CO1lBQ3RCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLHVGQUEyRCxDQUFDO1FBQ3hGLENBQUM7UUFDRCxJQUFJLGdDQUFnQztZQUNuQyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxpSEFBaUcsQ0FBQztRQUM5SCxDQUFDO1FBQ0QsSUFBSSxhQUFhO1lBQ2hCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLDJFQUFrRyxDQUFDO1FBQy9ILENBQUM7UUFDRCxJQUFJLGFBQWE7WUFDaEIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sMkVBQTBGLENBQUM7UUFDdkgsQ0FBQztRQUNELElBQUksY0FBYztZQUNqQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSw2RUFBMkYsQ0FBQztRQUN4SCxDQUFDO1FB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