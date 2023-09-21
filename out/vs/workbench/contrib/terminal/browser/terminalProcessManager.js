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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/platform", "vs/nls", "vs/platform/terminal/common/terminalStrings", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/product/common/productService", "vs/platform/remote/common/remoteHosts", "vs/platform/telemetry/common/telemetry", "vs/platform/terminal/common/capabilities/naiveCwdDetectionCapability", "vs/platform/terminal/common/capabilities/terminalCapabilityStore", "vs/platform/terminal/common/terminal", "vs/platform/terminal/common/terminalRecorder", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/terminal/browser/environmentVariableInfo", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/common/environmentVariable", "vs/platform/terminal/common/environmentVariableCollection", "vs/platform/terminal/common/environmentVariableShared", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminal/common/terminalEnvironment", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/history/common/history", "vs/workbench/services/path/common/pathService", "vs/workbench/services/remote/common/remoteAgentService", "vs/base/common/severity", "vs/platform/notification/common/notification", "vs/base/common/uuid", "vs/base/common/async"], function (require, exports, event_1, lifecycle_1, network_1, platform_1, nls_1, terminalStrings_1, configuration_1, instantiation_1, productService_1, remoteHosts_1, telemetry_1, naiveCwdDetectionCapability_1, terminalCapabilityStore_1, terminal_1, terminalRecorder_1, workspace_1, environmentVariableInfo_1, terminal_2, environmentVariable_1, environmentVariableCollection_1, environmentVariableShared_1, terminal_3, terminalEnvironment, configurationResolver_1, environmentService_1, history_1, pathService_1, remoteAgentService_1, severity_1, notification_1, uuid_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalProcessManager = void 0;
    var ProcessConstants;
    (function (ProcessConstants) {
        /**
         * The amount of time to consider terminal errors to be related to the launch.
         */
        ProcessConstants[ProcessConstants["ErrorLaunchThresholdDuration"] = 500] = "ErrorLaunchThresholdDuration";
        /**
         * The minimum amount of time between latency requests.
         */
        ProcessConstants[ProcessConstants["LatencyMeasuringInterval"] = 1000] = "LatencyMeasuringInterval";
    })(ProcessConstants || (ProcessConstants = {}));
    var ProcessType;
    (function (ProcessType) {
        ProcessType[ProcessType["Process"] = 0] = "Process";
        ProcessType[ProcessType["PsuedoTerminal"] = 1] = "PsuedoTerminal";
    })(ProcessType || (ProcessType = {}));
    /**
     * Holds all state related to the creation and management of terminal processes.
     *
     * Internal definitions:
     * - Process: The process launched with the terminalProcess.ts file, or the pty as a whole
     * - Pty Process: The pseudoterminal parent process (or the conpty/winpty agent process)
     * - Shell Process: The pseudoterminal child process (ie. the shell)
     */
    let TerminalProcessManager = class TerminalProcessManager extends lifecycle_1.Disposable {
        get persistentProcessId() { return this._process?.id; }
        get shouldPersist() { return !!this.reconnectionProperties || (this._process ? this._process.shouldPersist : false); }
        get hasWrittenData() { return this._hasWrittenData; }
        get hasChildProcesses() { return this._hasChildProcesses; }
        get reconnectionProperties() { return this._shellLaunchConfig?.attachPersistentProcess?.reconnectionProperties || this._shellLaunchConfig?.reconnectionProperties || undefined; }
        get extEnvironmentVariableCollection() { return this._extEnvironmentVariableCollection; }
        constructor(_instanceId, _configHelper, cwd, environmentVariableCollections, shellIntegrationNonce, _historyService, _instantiationService, _logService, _workspaceContextService, _configurationResolverService, _workbenchEnvironmentService, _productService, _remoteAgentService, _pathService, _environmentVariableService, _terminalProfileResolverService, _configurationService, _terminalInstanceService, _telemetryService, _notificationService) {
            super();
            this._instanceId = _instanceId;
            this._configHelper = _configHelper;
            this._historyService = _historyService;
            this._instantiationService = _instantiationService;
            this._logService = _logService;
            this._workspaceContextService = _workspaceContextService;
            this._configurationResolverService = _configurationResolverService;
            this._workbenchEnvironmentService = _workbenchEnvironmentService;
            this._productService = _productService;
            this._remoteAgentService = _remoteAgentService;
            this._pathService = _pathService;
            this._environmentVariableService = _environmentVariableService;
            this._terminalProfileResolverService = _terminalProfileResolverService;
            this._configurationService = _configurationService;
            this._terminalInstanceService = _terminalInstanceService;
            this._telemetryService = _telemetryService;
            this._notificationService = _notificationService;
            this.processState = 1 /* ProcessState.Uninitialized */;
            this.capabilities = new terminalCapabilityStore_1.TerminalCapabilityStore();
            this._isDisposed = false;
            this._process = null;
            this._processType = 0 /* ProcessType.Process */;
            this._preLaunchInputQueue = [];
            this._hasWrittenData = false;
            this._hasChildProcesses = false;
            this._ptyListenersAttached = false;
            this._isDisconnected = false;
            this._dimensions = { cols: 0, rows: 0 };
            this._onPtyDisconnect = this._register(new event_1.Emitter());
            this.onPtyDisconnect = this._onPtyDisconnect.event;
            this._onPtyReconnect = this._register(new event_1.Emitter());
            this.onPtyReconnect = this._onPtyReconnect.event;
            this._onProcessReady = this._register(new event_1.Emitter());
            this.onProcessReady = this._onProcessReady.event;
            this._onProcessStateChange = this._register(new event_1.Emitter());
            this.onProcessStateChange = this._onProcessStateChange.event;
            this._onBeforeProcessData = this._register(new event_1.Emitter());
            this.onBeforeProcessData = this._onBeforeProcessData.event;
            this._onProcessData = this._register(new event_1.Emitter());
            this.onProcessData = this._onProcessData.event;
            this._onProcessReplayComplete = this._register(new event_1.Emitter());
            this.onProcessReplayComplete = this._onProcessReplayComplete.event;
            this._onDidChangeProperty = this._register(new event_1.Emitter());
            this.onDidChangeProperty = this._onDidChangeProperty.event;
            this._onEnvironmentVariableInfoChange = this._register(new event_1.Emitter());
            this.onEnvironmentVariableInfoChanged = this._onEnvironmentVariableInfoChange.event;
            this._onProcessExit = this._register(new event_1.Emitter());
            this.onProcessExit = this._onProcessExit.event;
            this._onRestoreCommands = this._register(new event_1.Emitter());
            this.onRestoreCommands = this._onRestoreCommands.event;
            this._cwdWorkspaceFolder = terminalEnvironment.getWorkspaceForTerminal(cwd, this._workspaceContextService, this._historyService);
            this.ptyProcessReady = this._createPtyProcessReadyPromise();
            this._ackDataBufferer = new AckDataBufferer(e => this._process?.acknowledgeDataEvent(e));
            this._dataFilter = this._instantiationService.createInstance(SeamlessRelaunchDataFilter);
            this._dataFilter.onProcessData(ev => {
                const data = (typeof ev === 'string' ? ev : ev.data);
                const beforeProcessDataEvent = { data };
                this._onBeforeProcessData.fire(beforeProcessDataEvent);
                if (beforeProcessDataEvent.data && beforeProcessDataEvent.data.length > 0) {
                    // This event is used by the caller so the object must be reused
                    if (typeof ev !== 'string') {
                        ev.data = beforeProcessDataEvent.data;
                    }
                    this._onProcessData.fire(typeof ev !== 'string' ? ev : { data: beforeProcessDataEvent.data, trackCommit: false });
                }
            });
            if (cwd && typeof cwd === 'object') {
                this.remoteAuthority = (0, remoteHosts_1.getRemoteAuthority)(cwd);
            }
            else {
                this.remoteAuthority = this._workbenchEnvironmentService.remoteAuthority;
            }
            if (environmentVariableCollections) {
                this._extEnvironmentVariableCollection = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(environmentVariableCollections);
                this._register(this._environmentVariableService.onDidChangeCollections(newCollection => this._onEnvironmentVariableCollectionChange(newCollection)));
                this.environmentVariableInfo = this._instantiationService.createInstance(environmentVariableInfo_1.EnvironmentVariableInfoChangesActive, this._extEnvironmentVariableCollection);
                this._onEnvironmentVariableInfoChange.fire(this.environmentVariableInfo);
            }
            this.shellIntegrationNonce = shellIntegrationNonce ?? (0, uuid_1.generateUuid)();
        }
        async freePortKillProcess(port) {
            try {
                if (this._process?.freePortKillProcess) {
                    await this._process?.freePortKillProcess(port);
                }
            }
            catch (e) {
                this._notificationService.notify({ message: (0, nls_1.localize)('killportfailure', 'Could not kill process listening on port {0}, command exited with error {1}', port, e), severity: severity_1.default.Warning });
            }
        }
        dispose(immediate = false) {
            this._isDisposed = true;
            if (this._process) {
                // If the process was still connected this dispose came from
                // within VS Code, not the process, so mark the process as
                // killed by the user.
                this._setProcessState(5 /* ProcessState.KilledByUser */);
                this._process.shutdown(immediate);
                this._process = null;
            }
            super.dispose();
        }
        _createPtyProcessReadyPromise() {
            return new Promise(c => {
                const listener = this.onProcessReady(() => {
                    this._logService.debug(`Terminal process ready (shellProcessId: ${this.shellProcessId})`);
                    listener.dispose();
                    c(undefined);
                });
            });
        }
        async detachFromProcess(forcePersist) {
            await this._process?.detach?.(forcePersist);
            this._process = null;
        }
        async createProcess(shellLaunchConfig, cols, rows, reset = true) {
            this._shellLaunchConfig = shellLaunchConfig;
            this._dimensions.cols = cols;
            this._dimensions.rows = rows;
            let newProcess;
            if (shellLaunchConfig.customPtyImplementation) {
                this._processType = 1 /* ProcessType.PsuedoTerminal */;
                newProcess = shellLaunchConfig.customPtyImplementation(this._instanceId, cols, rows);
            }
            else {
                const backend = await this._terminalInstanceService.getBackend(this.remoteAuthority);
                if (!backend) {
                    throw new Error(`No terminal backend registered for remote authority '${this.remoteAuthority}'`);
                }
                this.backend = backend;
                // Create variable resolver
                const variableResolver = terminalEnvironment.createVariableResolver(this._cwdWorkspaceFolder, await this._terminalProfileResolverService.getEnvironment(this.remoteAuthority), this._configurationResolverService);
                // resolvedUserHome is needed here as remote resolvers can launch local terminals before
                // they're connected to the remote.
                this.userHome = this._pathService.resolvedUserHome?.fsPath;
                this.os = platform_1.OS;
                if (!!this.remoteAuthority) {
                    const userHomeUri = await this._pathService.userHome();
                    this.userHome = userHomeUri.path;
                    const remoteEnv = await this._remoteAgentService.getEnvironment();
                    if (!remoteEnv) {
                        throw new Error(`Failed to get remote environment for remote authority "${this.remoteAuthority}"`);
                    }
                    this.userHome = remoteEnv.userHome.path;
                    this.os = remoteEnv.os;
                    // this is a copy of what the merged environment collection is on the remote side
                    const env = await this._resolveEnvironment(backend, variableResolver, shellLaunchConfig);
                    const shouldPersist = ((this._configurationService.getValue("task.reconnection" /* TaskSettingId.Reconnection */) && shellLaunchConfig.reconnectionProperties) || !shellLaunchConfig.isFeatureTerminal) && this._configHelper.config.enablePersistentSessions && !shellLaunchConfig.isTransient;
                    if (shellLaunchConfig.attachPersistentProcess) {
                        const result = await backend.attachToProcess(shellLaunchConfig.attachPersistentProcess.id);
                        if (result) {
                            newProcess = result;
                        }
                        else {
                            // Warn and just create a new terminal if attach failed for some reason
                            this._logService.warn(`Attach to process failed for terminal`, shellLaunchConfig.attachPersistentProcess);
                            shellLaunchConfig.attachPersistentProcess = undefined;
                        }
                    }
                    if (!newProcess) {
                        await this._terminalProfileResolverService.resolveShellLaunchConfig(shellLaunchConfig, {
                            remoteAuthority: this.remoteAuthority,
                            os: this.os
                        });
                        const options = {
                            shellIntegration: {
                                enabled: this._configurationService.getValue("terminal.integrated.shellIntegration.enabled" /* TerminalSettingId.ShellIntegrationEnabled */),
                                suggestEnabled: this._configurationService.getValue("terminal.integrated.shellIntegration.suggestEnabled" /* TerminalSettingId.ShellIntegrationSuggestEnabled */),
                                nonce: this.shellIntegrationNonce
                            },
                            windowsEnableConpty: this._configHelper.config.windowsEnableConpty,
                            environmentVariableCollections: this._extEnvironmentVariableCollection?.collections ? (0, environmentVariableShared_1.serializeEnvironmentVariableCollections)(this._extEnvironmentVariableCollection.collections) : undefined,
                            workspaceFolder: this._cwdWorkspaceFolder,
                        };
                        try {
                            newProcess = await backend.createProcess(shellLaunchConfig, '', // TODO: Fix cwd
                            cols, rows, this._configHelper.config.unicodeVersion, env, // TODO:
                            options, shouldPersist);
                        }
                        catch (e) {
                            if (e?.message === 'Could not fetch remote environment') {
                                this._logService.trace(`Could not fetch remote environment, silently failing`);
                                return undefined;
                            }
                            throw e;
                        }
                    }
                    if (!this._isDisposed) {
                        this._setupPtyHostListeners(backend);
                    }
                }
                else {
                    if (shellLaunchConfig.attachPersistentProcess) {
                        const result = shellLaunchConfig.attachPersistentProcess.findRevivedId ? await backend.attachToRevivedProcess(shellLaunchConfig.attachPersistentProcess.id) : await backend.attachToProcess(shellLaunchConfig.attachPersistentProcess.id);
                        if (result) {
                            newProcess = result;
                        }
                        else {
                            // Warn and just create a new terminal if attach failed for some reason
                            this._logService.warn(`Attach to process failed for terminal`, shellLaunchConfig.attachPersistentProcess);
                            shellLaunchConfig.attachPersistentProcess = undefined;
                        }
                    }
                    if (!newProcess) {
                        newProcess = await this._launchLocalProcess(backend, shellLaunchConfig, cols, rows, this.userHome, variableResolver);
                    }
                    if (!this._isDisposed) {
                        this._setupPtyHostListeners(backend);
                    }
                }
            }
            // If the process was disposed during its creation, shut it down and return failure
            if (this._isDisposed) {
                newProcess.shutdown(false);
                return undefined;
            }
            this._process = newProcess;
            this._setProcessState(2 /* ProcessState.Launching */);
            // Add any capabilities inherent to the backend
            if (this.os === 3 /* OperatingSystem.Linux */ || this.os === 2 /* OperatingSystem.Macintosh */) {
                this.capabilities.add(1 /* TerminalCapability.NaiveCwdDetection */, new naiveCwdDetectionCapability_1.NaiveCwdDetectionCapability(this._process));
            }
            this._dataFilter.newProcess(this._process, reset);
            if (this._processListeners) {
                (0, lifecycle_1.dispose)(this._processListeners);
            }
            this._processListeners = [
                newProcess.onProcessReady((e) => {
                    this.shellProcessId = e.pid;
                    this._initialCwd = e.cwd;
                    this._onDidChangeProperty.fire({ type: "initialCwd" /* ProcessPropertyType.InitialCwd */, value: this._initialCwd });
                    this._onProcessReady.fire(e);
                    if (this._preLaunchInputQueue.length > 0 && this._process) {
                        // Send any queued data that's waiting
                        newProcess.input(this._preLaunchInputQueue.join(''));
                        this._preLaunchInputQueue.length = 0;
                    }
                }),
                newProcess.onProcessExit(exitCode => this._onExit(exitCode)),
                newProcess.onDidChangeProperty(({ type, value }) => {
                    switch (type) {
                        case "hasChildProcesses" /* ProcessPropertyType.HasChildProcesses */:
                            this._hasChildProcesses = value;
                            break;
                        case "failedShellIntegrationActivation" /* ProcessPropertyType.FailedShellIntegrationActivation */:
                            this._telemetryService?.publicLog2('terminal/shellIntegrationActivationFailureCustomArgs');
                            break;
                    }
                    this._onDidChangeProperty.fire({ type, value });
                })
            ];
            if (newProcess.onProcessReplayComplete) {
                this._processListeners.push(newProcess.onProcessReplayComplete(() => this._onProcessReplayComplete.fire()));
            }
            if (newProcess.onRestoreCommands) {
                this._processListeners.push(newProcess.onRestoreCommands(e => this._onRestoreCommands.fire(e)));
            }
            setTimeout(() => {
                if (this.processState === 2 /* ProcessState.Launching */) {
                    this._setProcessState(3 /* ProcessState.Running */);
                }
            }, 500 /* ProcessConstants.ErrorLaunchThresholdDuration */);
            const result = await newProcess.start();
            if (result) {
                // Error
                return result;
            }
            // Report the latency to the pty host when idle
            (0, async_1.runWhenIdle)(() => {
                this.backend?.getLatency().then(measurements => {
                    this._logService.info(`Latency measurements for ${this.remoteAuthority ?? 'local'} backend\n${measurements.map(e => `${e.label}: ${e.latency.toFixed(2)}ms`).join('\n')}`);
                });
            });
            return undefined;
        }
        async relaunch(shellLaunchConfig, cols, rows, reset) {
            this.ptyProcessReady = this._createPtyProcessReadyPromise();
            this._logService.trace(`Relaunching terminal instance ${this._instanceId}`);
            // Fire reconnect if needed to ensure the terminal is usable again
            if (this._isDisconnected) {
                this._isDisconnected = false;
                this._onPtyReconnect.fire();
            }
            // Clear data written flag to re-enable seamless relaunch if this relaunch was manually
            // triggered
            this._hasWrittenData = false;
            return this.createProcess(shellLaunchConfig, cols, rows, reset);
        }
        // Fetch any extension environment additions and apply them
        async _resolveEnvironment(backend, variableResolver, shellLaunchConfig) {
            const workspaceFolder = terminalEnvironment.getWorkspaceForTerminal(shellLaunchConfig.cwd, this._workspaceContextService, this._historyService);
            const platformKey = platform_1.isWindows ? 'windows' : (platform_1.isMacintosh ? 'osx' : 'linux');
            const envFromConfigValue = this._configurationService.getValue(`terminal.integrated.env.${platformKey}`);
            this._configHelper.showRecommendations(shellLaunchConfig);
            let baseEnv;
            if (shellLaunchConfig.useShellEnvironment) {
                // TODO: Avoid as any?
                baseEnv = await backend.getShellEnvironment();
            }
            else {
                baseEnv = await this._terminalProfileResolverService.getEnvironment(this.remoteAuthority);
            }
            const env = await terminalEnvironment.createTerminalEnvironment(shellLaunchConfig, envFromConfigValue, variableResolver, this._productService.version, this._configHelper.config.detectLocale, baseEnv);
            if (!this._isDisposed && !shellLaunchConfig.strictEnv && !shellLaunchConfig.hideFromUser) {
                this._extEnvironmentVariableCollection = this._environmentVariableService.mergedCollection;
                this._register(this._environmentVariableService.onDidChangeCollections(newCollection => this._onEnvironmentVariableCollectionChange(newCollection)));
                // For remote terminals, this is a copy of the mergedEnvironmentCollection created on
                // the remote side. Since the environment collection is synced between the remote and
                // local sides immediately this is a fairly safe way of enabling the env var diffing and
                // info widget. While technically these could differ due to the slight change of a race
                // condition, the chance is minimal plus the impact on the user is also not that great
                // if it happens - it's not worth adding plumbing to sync back the resolved collection.
                await this._extEnvironmentVariableCollection.applyToProcessEnvironment(env, { workspaceFolder }, variableResolver);
                if (this._extEnvironmentVariableCollection.getVariableMap({ workspaceFolder }).size) {
                    this.environmentVariableInfo = this._instantiationService.createInstance(environmentVariableInfo_1.EnvironmentVariableInfoChangesActive, this._extEnvironmentVariableCollection);
                    this._onEnvironmentVariableInfoChange.fire(this.environmentVariableInfo);
                }
            }
            return env;
        }
        async _launchLocalProcess(backend, shellLaunchConfig, cols, rows, userHome, variableResolver) {
            await this._terminalProfileResolverService.resolveShellLaunchConfig(shellLaunchConfig, {
                remoteAuthority: undefined,
                os: platform_1.OS
            });
            const activeWorkspaceRootUri = this._historyService.getLastActiveWorkspaceRoot(network_1.Schemas.file);
            const initialCwd = await terminalEnvironment.getCwd(shellLaunchConfig, userHome, variableResolver, activeWorkspaceRootUri, this._configHelper.config.cwd, this._logService);
            const env = await this._resolveEnvironment(backend, variableResolver, shellLaunchConfig);
            const options = {
                shellIntegration: {
                    enabled: this._configurationService.getValue("terminal.integrated.shellIntegration.enabled" /* TerminalSettingId.ShellIntegrationEnabled */),
                    suggestEnabled: this._configurationService.getValue("terminal.integrated.shellIntegration.suggestEnabled" /* TerminalSettingId.ShellIntegrationSuggestEnabled */),
                    nonce: this.shellIntegrationNonce
                },
                windowsEnableConpty: this._configHelper.config.windowsEnableConpty,
                environmentVariableCollections: this._extEnvironmentVariableCollection ? (0, environmentVariableShared_1.serializeEnvironmentVariableCollections)(this._extEnvironmentVariableCollection.collections) : undefined,
                workspaceFolder: this._cwdWorkspaceFolder,
            };
            const shouldPersist = ((this._configurationService.getValue("task.reconnection" /* TaskSettingId.Reconnection */) && shellLaunchConfig.reconnectionProperties) || !shellLaunchConfig.isFeatureTerminal) && this._configHelper.config.enablePersistentSessions && !shellLaunchConfig.isTransient;
            return await backend.createProcess(shellLaunchConfig, initialCwd, cols, rows, this._configHelper.config.unicodeVersion, env, options, shouldPersist);
        }
        _setupPtyHostListeners(backend) {
            if (this._ptyListenersAttached) {
                return;
            }
            this._ptyListenersAttached = true;
            // Mark the process as disconnected is the pty host is unresponsive, the responsive event
            // will fire only when the pty host was already unresponsive
            this._register(backend.onPtyHostUnresponsive(() => {
                this._isDisconnected = true;
                this._onPtyDisconnect.fire();
            }));
            this._ptyResponsiveListener = backend.onPtyHostResponsive(() => {
                this._isDisconnected = false;
                this._onPtyReconnect.fire();
            });
            this._register((0, lifecycle_1.toDisposable)(() => this._ptyResponsiveListener?.dispose()));
            // When the pty host restarts, reconnect is no longer possible so dispose the responsive
            // listener
            this._register(backend.onPtyHostRestart(async () => {
                // When the pty host restarts, reconnect is no longer possible
                if (!this._isDisconnected) {
                    this._isDisconnected = true;
                    this._onPtyDisconnect.fire();
                }
                this._ptyResponsiveListener?.dispose();
                this._ptyResponsiveListener = undefined;
                if (this._shellLaunchConfig) {
                    if (this._shellLaunchConfig.isFeatureTerminal && !this.reconnectionProperties) {
                        // Indicate the process is exited (and gone forever) only for feature terminals
                        // so they can react to the exit, this is particularly important for tasks so
                        // that it knows that the process is not still active. Note that this is not
                        // done for regular terminals because otherwise the terminal instance would be
                        // disposed.
                        this._onExit(-1);
                    }
                    else {
                        // For normal terminals write a message indicating what happened and relaunch
                        // using the previous shellLaunchConfig
                        const message = (0, nls_1.localize)('ptyHostRelaunch', "Restarting the terminal because the connection to the shell process was lost...");
                        this._onProcessData.fire({ data: (0, terminalStrings_1.formatMessageForTerminal)(message, { loudFormatting: true }), trackCommit: false });
                        await this.relaunch(this._shellLaunchConfig, this._dimensions.cols, this._dimensions.rows, false);
                    }
                }
            }));
        }
        async getBackendOS() {
            let os = platform_1.OS;
            if (!!this.remoteAuthority) {
                const remoteEnv = await this._remoteAgentService.getEnvironment();
                if (!remoteEnv) {
                    throw new Error(`Failed to get remote environment for remote authority "${this.remoteAuthority}"`);
                }
                os = remoteEnv.os;
            }
            return os;
        }
        setDimensions(cols, rows, sync) {
            if (sync) {
                this._resize(cols, rows);
                return;
            }
            return this.ptyProcessReady.then(() => this._resize(cols, rows));
        }
        async setUnicodeVersion(version) {
            return this._process?.setUnicodeVersion(version);
        }
        _resize(cols, rows) {
            if (!this._process) {
                return;
            }
            // The child process could already be terminated
            try {
                this._process.resize(cols, rows);
            }
            catch (error) {
                // We tried to write to a closed pipe / channel.
                if (error.code !== 'EPIPE' && error.code !== 'ERR_IPC_CHANNEL_CLOSED') {
                    throw (error);
                }
            }
            this._dimensions.cols = cols;
            this._dimensions.rows = rows;
        }
        async write(data) {
            await this.ptyProcessReady;
            this._dataFilter.disableSeamlessRelaunch();
            this._hasWrittenData = true;
            if (this.shellProcessId || this._processType === 1 /* ProcessType.PsuedoTerminal */) {
                if (this._process) {
                    // Send data if the pty is ready
                    this._process.input(data);
                }
            }
            else {
                // If the pty is not ready, queue the data received to send later
                this._preLaunchInputQueue.push(data);
            }
        }
        async processBinary(data) {
            await this.ptyProcessReady;
            this._dataFilter.disableSeamlessRelaunch();
            this._hasWrittenData = true;
            this._process?.processBinary(data);
        }
        get initialCwd() {
            return this._initialCwd ?? '';
        }
        async refreshProperty(type) {
            if (!this._process) {
                throw new Error('Cannot refresh property when process is not set');
            }
            return this._process.refreshProperty(type);
        }
        async updateProperty(type, value) {
            return this._process?.updateProperty(type, value);
        }
        acknowledgeDataEvent(charCount) {
            this._ackDataBufferer.ack(charCount);
        }
        _onExit(exitCode) {
            this._process = null;
            // If the process is marked as launching then mark the process as killed
            // during launch. This typically means that there is a problem with the
            // shell and args.
            if (this.processState === 2 /* ProcessState.Launching */) {
                this._setProcessState(4 /* ProcessState.KilledDuringLaunch */);
            }
            // If TerminalInstance did not know about the process exit then it was
            // triggered by the process, not on VS Code's side.
            if (this.processState === 3 /* ProcessState.Running */) {
                this._setProcessState(6 /* ProcessState.KilledByProcess */);
            }
            this._onProcessExit.fire(exitCode);
        }
        _setProcessState(state) {
            this.processState = state;
            this._onProcessStateChange.fire();
        }
        _onEnvironmentVariableCollectionChange(newCollection) {
            const diff = this._extEnvironmentVariableCollection.diff(newCollection, { workspaceFolder: this._cwdWorkspaceFolder });
            if (diff === undefined) {
                // If there are no longer differences, remove the stale info indicator
                if (this.environmentVariableInfo instanceof environmentVariableInfo_1.EnvironmentVariableInfoStale) {
                    this.environmentVariableInfo = this._instantiationService.createInstance(environmentVariableInfo_1.EnvironmentVariableInfoChangesActive, this._extEnvironmentVariableCollection);
                    this._onEnvironmentVariableInfoChange.fire(this.environmentVariableInfo);
                }
                return;
            }
            this.environmentVariableInfo = this._instantiationService.createInstance(environmentVariableInfo_1.EnvironmentVariableInfoStale, diff, this._instanceId, newCollection);
            this._onEnvironmentVariableInfoChange.fire(this.environmentVariableInfo);
        }
        async clearBuffer() {
            this._process?.clearBuffer?.();
        }
    };
    exports.TerminalProcessManager = TerminalProcessManager;
    exports.TerminalProcessManager = TerminalProcessManager = __decorate([
        __param(5, history_1.IHistoryService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, terminal_1.ITerminalLogService),
        __param(8, workspace_1.IWorkspaceContextService),
        __param(9, configurationResolver_1.IConfigurationResolverService),
        __param(10, environmentService_1.IWorkbenchEnvironmentService),
        __param(11, productService_1.IProductService),
        __param(12, remoteAgentService_1.IRemoteAgentService),
        __param(13, pathService_1.IPathService),
        __param(14, environmentVariable_1.IEnvironmentVariableService),
        __param(15, terminal_3.ITerminalProfileResolverService),
        __param(16, configuration_1.IConfigurationService),
        __param(17, terminal_2.ITerminalInstanceService),
        __param(18, telemetry_1.ITelemetryService),
        __param(19, notification_1.INotificationService)
    ], TerminalProcessManager);
    class AckDataBufferer {
        constructor(_callback) {
            this._callback = _callback;
            this._unsentCharCount = 0;
        }
        ack(charCount) {
            this._unsentCharCount += charCount;
            while (this._unsentCharCount > 5000 /* FlowControlConstants.CharCountAckSize */) {
                this._unsentCharCount -= 5000 /* FlowControlConstants.CharCountAckSize */;
                this._callback(5000 /* FlowControlConstants.CharCountAckSize */);
            }
        }
    }
    var SeamlessRelaunchConstants;
    (function (SeamlessRelaunchConstants) {
        /**
         * How long to record data events for new terminals.
         */
        SeamlessRelaunchConstants[SeamlessRelaunchConstants["RecordTerminalDuration"] = 10000] = "RecordTerminalDuration";
        /**
         * The maximum duration after a relaunch occurs to trigger a swap.
         */
        SeamlessRelaunchConstants[SeamlessRelaunchConstants["SwapWaitMaximumDuration"] = 3000] = "SwapWaitMaximumDuration";
    })(SeamlessRelaunchConstants || (SeamlessRelaunchConstants = {}));
    /**
     * Filters data events from the process and supports seamlessly restarting swapping out the process
     * with another, delaying the swap in output in order to minimize flickering/clearing of the
     * terminal.
     */
    let SeamlessRelaunchDataFilter = class SeamlessRelaunchDataFilter extends lifecycle_1.Disposable {
        get onProcessData() { return this._onProcessData.event; }
        constructor(_logService) {
            super();
            this._logService = _logService;
            this._disableSeamlessRelaunch = false;
            this._onProcessData = this._register(new event_1.Emitter());
        }
        newProcess(process, reset) {
            // Stop listening to the old process and trigger delayed shutdown (for hang issue #71966)
            this._dataListener?.dispose();
            this._activeProcess?.shutdown(false);
            this._activeProcess = process;
            // Start firing events immediately if:
            // - there's no recorder, which means it's a new terminal
            // - this is not a reset, so seamless relaunch isn't necessary
            // - seamless relaunch is disabled because the terminal has accepted input
            if (!this._firstRecorder || !reset || this._disableSeamlessRelaunch) {
                this._firstDisposable?.dispose();
                [this._firstRecorder, this._firstDisposable] = this._createRecorder(process);
                if (this._disableSeamlessRelaunch && reset) {
                    this._onProcessData.fire('\x1bc');
                }
                this._dataListener = process.onProcessData(e => this._onProcessData.fire(e));
                this._disableSeamlessRelaunch = false;
                return;
            }
            // Trigger a swap if there was a recent relaunch
            if (this._secondRecorder) {
                this.triggerSwap();
            }
            this._swapTimeout = window.setTimeout(() => this.triggerSwap(), 3000 /* SeamlessRelaunchConstants.SwapWaitMaximumDuration */);
            // Pause all outgoing data events
            this._dataListener?.dispose();
            this._firstDisposable?.dispose();
            const recorder = this._createRecorder(process);
            [this._secondRecorder, this._secondDisposable] = recorder;
        }
        /**
         * Disables seamless relaunch for the active process
         */
        disableSeamlessRelaunch() {
            this._disableSeamlessRelaunch = true;
            this._stopRecording();
            this.triggerSwap();
        }
        /**
         * Trigger the swap of the processes if needed (eg. timeout, input)
         */
        triggerSwap() {
            // Clear the swap timeout if it exists
            if (this._swapTimeout) {
                window.clearTimeout(this._swapTimeout);
                this._swapTimeout = undefined;
            }
            // Do nothing if there's nothing being recorder
            if (!this._firstRecorder) {
                return;
            }
            // Clear the first recorder if no second process was attached before the swap trigger
            if (!this._secondRecorder) {
                this._firstRecorder = undefined;
                this._firstDisposable?.dispose();
                return;
            }
            // Generate data for each recorder
            const firstData = this._getDataFromRecorder(this._firstRecorder);
            const secondData = this._getDataFromRecorder(this._secondRecorder);
            // Re-write the terminal if the data differs
            if (firstData === secondData) {
                this._logService.trace(`Seamless terminal relaunch - identical content`);
            }
            else {
                this._logService.trace(`Seamless terminal relaunch - resetting content`);
                // Fire full reset (RIS) followed by the new data so the update happens in the same frame
                this._onProcessData.fire({ data: `\x1bc${secondData}`, trackCommit: false });
            }
            // Set up the new data listener
            this._dataListener?.dispose();
            this._dataListener = this._activeProcess.onProcessData(e => this._onProcessData.fire(e));
            // Replace first recorder with second
            this._firstRecorder = this._secondRecorder;
            this._firstDisposable?.dispose();
            this._firstDisposable = this._secondDisposable;
            this._secondRecorder = undefined;
        }
        _stopRecording() {
            // Continue recording if a swap is coming
            if (this._swapTimeout) {
                return;
            }
            // Stop recording
            this._firstRecorder = undefined;
            this._firstDisposable?.dispose();
            this._secondRecorder = undefined;
            this._secondDisposable?.dispose();
        }
        _createRecorder(process) {
            const recorder = new terminalRecorder_1.TerminalRecorder(0, 0);
            const disposable = process.onProcessData(e => recorder.handleData(typeof e === 'string' ? e : e.data));
            return [recorder, disposable];
        }
        _getDataFromRecorder(recorder) {
            return recorder.generateReplayEventSync().events.filter(e => !!e.data).map(e => e.data).join('');
        }
    };
    SeamlessRelaunchDataFilter = __decorate([
        __param(0, terminal_1.ITerminalLogService)
    ], SeamlessRelaunchDataFilter);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxQcm9jZXNzTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsL2Jyb3dzZXIvdGVybWluYWxQcm9jZXNzTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF1Q2hHLElBQVcsZ0JBU1Y7SUFURCxXQUFXLGdCQUFnQjtRQUMxQjs7V0FFRztRQUNILHlHQUFrQyxDQUFBO1FBQ2xDOztXQUVHO1FBQ0gsa0dBQStCLENBQUE7SUFDaEMsQ0FBQyxFQVRVLGdCQUFnQixLQUFoQixnQkFBZ0IsUUFTMUI7SUFFRCxJQUFXLFdBR1Y7SUFIRCxXQUFXLFdBQVc7UUFDckIsbURBQU8sQ0FBQTtRQUNQLGlFQUFjLENBQUE7SUFDZixDQUFDLEVBSFUsV0FBVyxLQUFYLFdBQVcsUUFHckI7SUFFRDs7Ozs7OztPQU9HO0lBQ0ksSUFBTSxzQkFBc0IsR0FBNUIsTUFBTSxzQkFBdUIsU0FBUSxzQkFBVTtRQXVEckQsSUFBSSxtQkFBbUIsS0FBeUIsT0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDM0UsSUFBSSxhQUFhLEtBQWMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLHNCQUFzQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvSCxJQUFJLGNBQWMsS0FBYyxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBQzlELElBQUksaUJBQWlCLEtBQWMsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1FBQ3BFLElBQUksc0JBQXNCLEtBQTBDLE9BQU8sSUFBSSxDQUFD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