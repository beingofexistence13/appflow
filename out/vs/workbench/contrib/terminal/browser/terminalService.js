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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/uri", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/terminal/common/terminal", "vs/platform/terminal/common/terminalStrings", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/iconRegistry", "vs/platform/theme/common/theme", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/workspace/common/workspace", "vs/workbench/common/contextkeys", "vs/workbench/common/views", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/terminalActions", "vs/workbench/contrib/terminal/browser/terminalConfigHelper", "vs/workbench/contrib/terminal/browser/terminalEditorInput", "vs/workbench/contrib/terminal/browser/terminalIcon", "vs/workbench/contrib/terminal/browser/terminalProfileQuickpick", "vs/workbench/contrib/terminal/browser/terminalUri", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/workbench/services/editor/common/editorGroupColumn", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/contrib/terminal/browser/xterm/xtermTerminal", "vs/workbench/contrib/terminal/browser/terminalInstance", "vs/platform/keybinding/common/keybinding", "vs/platform/terminal/common/capabilities/terminalCapabilityStore", "vs/workbench/services/timer/browser/timerService", "vs/base/common/performance", "vs/workbench/contrib/terminal/browser/detachedTerminal", "vs/workbench/contrib/terminal/browser/terminalEvents"], function (require, exports, dom, async_1, decorators_1, event_1, lifecycle_1, network_1, platform_1, uri_1, nls, commands_1, configuration_1, contextkey_1, dialogs_1, instantiation_1, notification_1, terminal_1, terminalStrings_1, colorRegistry_1, iconRegistry_1, theme_1, themeService_1, themables_1, workspace_1, contextkeys_1, views_1, terminal_2, terminalActions_1, terminalConfigHelper_1, terminalEditorInput_1, terminalIcon_1, terminalProfileQuickpick_1, terminalUri_1, terminal_3, terminalContextKey_1, editorGroupColumn_1, editorGroupsService_1, editorService_1, environmentService_1, extensions_1, lifecycle_2, remoteAgentService_1, xtermTerminal_1, terminalInstance_1, keybinding_1, terminalCapabilityStore_1, timerService_1, performance_1, detachedTerminal_1, terminalEvents_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalService = void 0;
    let TerminalService = class TerminalService extends lifecycle_1.Disposable {
        get isProcessSupportRegistered() { return !!this._processSupportContextKey.get(); }
        get connectionState() { return this._connectionState; }
        get whenConnected() { return this._whenConnected.p; }
        get restoredGroupCount() { return this._restoredGroupCount; }
        get configHelper() { return this._configHelper; }
        get instances() {
            return this._terminalGroupService.instances.concat(this._terminalEditorService.instances);
        }
        get detachedXterms() {
            return this._detachedXterms;
        }
        getReconnectedTerminals(reconnectionOwner) {
            return this._reconnectedTerminals.get(reconnectionOwner);
        }
        get defaultLocation() { return this.configHelper.config.defaultLocation === "editor" /* TerminalLocationString.Editor */ ? terminal_1.TerminalLocation.Editor : terminal_1.TerminalLocation.Panel; }
        get activeInstance() {
            // Check if either an editor or panel terminal has focus and return that, regardless of the
            // value of _activeInstance. This avoids terminals created in the panel for example stealing
            // the active status even when it's not focused.
            for (const activeHostTerminal of this._hostActiveTerminals.values()) {
                if (activeHostTerminal?.hasFocus) {
                    return activeHostTerminal;
                }
            }
            // Fallback to the last recorded active terminal if neither have focus
            return this._activeInstance;
        }
        get onDidChangeActiveGroup() { return this._onDidChangeActiveGroup.event; }
        get onDidCreateInstance() { return this._onDidCreateInstance.event; }
        get onDidDisposeInstance() { return this._onDidDisposeInstance.event; }
        get onDidFocusInstance() { return this._onDidFocusInstance.event; }
        get onDidReceiveProcessId() { return this._onDidReceiveProcessId.event; }
        get onDidRequestStartExtensionTerminal() { return this._onDidRequestStartExtensionTerminal.event; }
        get onDidChangeInstanceDimensions() { return this._onDidChangeInstanceDimensions.event; }
        get onDidMaximumDimensionsChange() { return this._onDidMaxiumumDimensionsChange.event; }
        get onDidChangeInstanceCapability() { return this._onDidChangeInstanceCapability.event; }
        get onDidChangeInstances() { return this._onDidChangeInstances.event; }
        get onDidChangeInstanceTitle() { return this._onDidChangeInstanceTitle.event; }
        get onDidChangeInstanceIcon() { return this._onDidChangeInstanceIcon.event; }
        get onDidChangeInstanceColor() { return this._onDidChangeInstanceColor.event; }
        get onDidChangeActiveInstance() { return this._onDidChangeActiveInstance.event; }
        get onDidChangeInstancePrimaryStatus() { return this._onDidChangeInstancePrimaryStatus.event; }
        get onDidInputInstanceData() { return this._onDidInputInstanceData.event; }
        get onDidChangeSelection() { return this._onDidChangeSelection.event; }
        get onDidDisposeGroup() { return this._onDidDisposeGroup.event; }
        get onDidChangeGroups() { return this._onDidChangeGroups.event; }
        get onDidRegisterProcessSupport() { return this._onDidRegisterProcessSupport.event; }
        get onDidChangeConnectionState() { return this._onDidChangeConnectionState.event; }
        constructor(_contextKeyService, _lifecycleService, _logService, _dialogService, _instantiationService, _remoteAgentService, _viewsService, _configurationService, _environmentService, _terminalEditorService, _terminalGroupService, _terminalInstanceService, _editorGroupsService, _terminalProfileService, _extensionService, _notificationService, _workspaceContextService, _commandService, _keybindingService, _timerService) {
            super();
            this._contextKeyService = _contextKeyService;
            this._lifecycleService = _lifecycleService;
            this._logService = _logService;
            this._dialogService = _dialogService;
            this._instantiationService = _instantiationService;
            this._remoteAgentService = _remoteAgentService;
            this._viewsService = _viewsService;
            this._configurationService = _configurationService;
            this._environmentService = _environmentService;
            this._terminalEditorService = _terminalEditorService;
            this._terminalGroupService = _terminalGroupService;
            this._terminalInstanceService = _terminalInstanceService;
            this._editorGroupsService = _editorGroupsService;
            this._terminalProfileService = _terminalProfileService;
            this._extensionService = _extensionService;
            this._notificationService = _notificationService;
            this._workspaceContextService = _workspaceContextService;
            this._commandService = _commandService;
            this._keybindingService = _keybindingService;
            this._timerService = _timerService;
            this._hostActiveTerminals = new Map();
            this._detachedXterms = new Set();
            this._isShuttingDown = false;
            this._backgroundedTerminalInstances = [];
            this._backgroundedTerminalDisposables = new Map();
            this._connectionState = 0 /* TerminalConnectionState.Connecting */;
            this._whenConnected = new async_1.DeferredPromise();
            this._restoredGroupCount = 0;
            this._reconnectedTerminals = new Map();
            this._onDidChangeActiveGroup = this._register(new event_1.Emitter());
            this._onDidCreateInstance = this._register(new event_1.Emitter());
            this._onDidDisposeInstance = this._register(new event_1.Emitter());
            this._onDidFocusInstance = this._register(new event_1.Emitter());
            this._onDidReceiveProcessId = this._register(new event_1.Emitter());
            this._onDidRequestStartExtensionTerminal = this._register(new event_1.Emitter());
            this._onDidChangeInstanceDimensions = this._register(new event_1.Emitter());
            this._onDidMaxiumumDimensionsChange = this._register(new event_1.Emitter());
            this._onDidChangeInstanceCapability = this._register(new event_1.Emitter());
            this._onDidChangeInstances = this._register(new event_1.Emitter());
            this._onDidChangeInstanceTitle = this._register(new event_1.Emitter());
            this._onDidChangeInstanceIcon = this._register(new event_1.Emitter());
            this._onDidChangeInstanceColor = this._register(new event_1.Emitter());
            this._onDidChangeActiveInstance = this._register(new event_1.Emitter());
            this._onDidChangeInstancePrimaryStatus = this._register(new event_1.Emitter());
            this._onDidInputInstanceData = this._register(new event_1.Emitter());
            this._onDidChangeSelection = this._register(new event_1.Emitter());
            this._onDidDisposeGroup = this._register(new event_1.Emitter());
            this._onDidChangeGroups = this._register(new event_1.Emitter());
            this._onDidRegisterProcessSupport = this._register(new event_1.Emitter());
            this._onDidChangeConnectionState = this._register(new event_1.Emitter());
            this._configHelper = this._register(this._instantiationService.createInstance(terminalConfigHelper_1.TerminalConfigHelper));
            // the below avoids having to poll routinely.
            // we update detected profiles when an instance is created so that,
            // for example, we detect if you've installed a pwsh
            this.onDidCreateInstance(() => this._terminalProfileService.refreshAvailableProfiles());
            this._forwardInstanceHostEvents(this._terminalGroupService);
            this._forwardInstanceHostEvents(this._terminalEditorService);
            this._terminalGroupService.onDidChangeActiveGroup(this._onDidChangeActiveGroup.fire, this._onDidChangeActiveGroup);
            this._terminalInstanceService.onDidCreateInstance(instance => {
                this._initInstanceListeners(instance);
                this._onDidCreateInstance.fire(instance);
            });
            // Hide the panel if there are no more instances, provided that VS Code is not shutting
            // down. When shutting down the panel is locked in place so that it is restored upon next
            // launch.
            this._terminalGroupService.onDidChangeActiveInstance(instance => {
                if (!instance && !this._isShuttingDown) {
                    this._terminalGroupService.hidePanel();
                }
                if (instance?.shellType) {
                    this._terminalShellTypeContextKey.set(instance.shellType.toString());
                }
                else if (!instance) {
                    this._terminalShellTypeContextKey.reset();
                }
            });
            this._handleInstanceContextKeys();
            this._terminalShellTypeContextKey = terminalContextKey_1.TerminalContextKeys.shellType.bindTo(this._contextKeyService);
            this._processSupportContextKey = terminalContextKey_1.TerminalContextKeys.processSupported.bindTo(this._contextKeyService);
            this._processSupportContextKey.set(!platform_1.isWeb || this._remoteAgentService.getConnection() !== null);
            this._terminalHasBeenCreated = terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated.bindTo(this._contextKeyService);
            this._terminalCountContextKey = terminalContextKey_1.TerminalContextKeys.count.bindTo(this._contextKeyService);
            this._terminalEditorActive = terminalContextKey_1.TerminalContextKeys.terminalEditorActive.bindTo(this._contextKeyService);
            this.onDidChangeActiveInstance(instance => {
                this._terminalEditorActive.set(!!instance?.target && instance.target === terminal_1.TerminalLocation.Editor);
            });
            _lifecycleService.onBeforeShutdown(async (e) => e.veto(this._onBeforeShutdown(e.reason), 'veto.terminal'));
            _lifecycleService.onWillShutdown(e => this._onWillShutdown(e));
            this.initializePrimaryBackend();
            // Create async as the class depends on `this`
            (0, async_1.timeout)(0).then(() => this._register(this._instantiationService.createInstance(TerminalEditorStyle, document.head)));
        }
        async showProfileQuickPick(type, cwd) {
            const quickPick = this._instantiationService.createInstance(terminalProfileQuickpick_1.TerminalProfileQuickpick);
            const result = await quickPick.showAndGetResult(type);
            if (!result) {
                return;
            }
            if (typeof result === 'string') {
                return;
            }
            const keyMods = result.keyMods;
            if (type === 'createInstance') {
                const activeInstance = this.getDefaultInstanceHost().activeInstance;
                let instance;
                if (result.config && 'id' in result?.config) {
                    await this.createContributedTerminalProfile(result.config.extensionIdentifier, result.config.id, {
                        icon: result.config.options?.icon,
                        color: result.config.options?.color,
                        location: !!(keyMods?.alt && activeInstance) ? { splitActiveTerminal: true } : this.defaultLocation
                    });
                    return;
                }
                else if (result.config && 'profileName' in result.config) {
                    if (keyMods?.alt && activeInstance) {
                        // create split, only valid if there's an active instance
                        instance = await this.createTerminal({ location: { parentTerminal: activeInstance }, config: result.config, cwd });
                    }
                    else {
                        instance = await this.createTerminal({ location: this.defaultLocation, config: result.config, cwd });
                    }
                }
                if (instance && this.defaultLocation !== terminal_1.TerminalLocation.Editor) {
                    this._terminalGroupService.showPanel(true);
                    this.setActiveInstance(instance);
                    return instance;
                }
            }
            return undefined;
        }
        async initializePrimaryBackend() {
            (0, performance_1.mark)('code/terminal/willGetTerminalBackend');
            this._primaryBackend = await this._terminalInstanceService.getBackend(this._environmentService.remoteAuthority);
            (0, performance_1.mark)('code/terminal/didGetTerminalBackend');
            const enableTerminalReconnection = this.configHelper.config.enablePersistentSessions;
            // Connect to the extension host if it's there, set the connection state to connected when
            // it's done. This should happen even when there is no extension host.
            this._connectionState = 0 /* TerminalConnectionState.Connecting */;
            const isPersistentRemote = !!this._environmentService.remoteAuthority && enableTerminalReconnection;
            this._primaryBackend?.onDidRequestDetach(async (e) => {
                const instanceToDetach = this.getInstanceFromResource((0, terminalUri_1.getTerminalUri)(e.workspaceId, e.instanceId));
                if (instanceToDetach) {
                    const persistentProcessId = instanceToDetach?.persistentProcessId;
                    if (persistentProcessId && !instanceToDetach.shellLaunchConfig.isFeatureTerminal && !instanceToDetach.shellLaunchConfig.customPtyImplementation) {
                        if (instanceToDetach.target === terminal_1.TerminalLocation.Editor) {
                            this._terminalEditorService.detachInstance(instanceToDetach);
                        }
                        else {
                            this._terminalGroupService.getGroupForInstance(instanceToDetach)?.removeInstance(instanceToDetach);
                        }
                        await instanceToDetach.detachProcessAndDispose(terminal_1.TerminalExitReason.User);
                        await this._primaryBackend?.acceptDetachInstanceReply(e.requestId, persistentProcessId);
                    }
                    else {
                        // will get rejected without a persistentProcessId to attach to
                        await this._primaryBackend?.acceptDetachInstanceReply(e.requestId, undefined);
                    }
                }
            });
            (0, performance_1.mark)('code/terminal/willReconnect');
            let reconnectedPromise;
            if (isPersistentRemote) {
                reconnectedPromise = this._reconnectToRemoteTerminals();
            }
            else if (enableTerminalReconnection) {
                reconnectedPromise = this._reconnectToLocalTerminals();
            }
            else {
                reconnectedPromise = Promise.resolve();
            }
            reconnectedPromise.then(async () => {
                this._setConnected();
                (0, performance_1.mark)('code/terminal/didReconnect');
                (0, performance_1.mark)('code/terminal/willReplay');
                const instances = await this._reconnectedTerminalGroups?.then(groups => groups.map(e => e.terminalInstances).flat()) ?? [];
                await Promise.all(instances.map(e => new Promise(r => event_1.Event.once(e.onProcessReplayComplete)(r))));
                (0, performance_1.mark)('code/terminal/didReplay');
                (0, performance_1.mark)('code/terminal/willGetPerformanceMarks');
                await Promise.all(Array.from(this._terminalInstanceService.getRegisteredBackends()).map(async (backend) => {
                    this._timerService.setPerformanceMarks(backend.remoteAuthority === undefined ? 'localPtyHost' : 'remotePtyHost', await backend.getPerformanceMarks());
                    backend.setReady();
                }));
                (0, performance_1.mark)('code/terminal/didGetPerformanceMarks');
                this._whenConnected.complete();
            });
        }
        getPrimaryBackend() {
            return this._primaryBackend;
        }
        _forwardInstanceHostEvents(host) {
            host.onDidChangeInstances(this._onDidChangeInstances.fire, this._onDidChangeInstances);
            host.onDidDisposeInstance(this._onDidDisposeInstance.fire, this._onDidDisposeInstance);
            host.onDidChangeActiveInstance(instance => this._evaluateActiveInstance(host, instance));
            host.onDidFocusInstance(instance => {
                this._onDidFocusInstance.fire(instance);
                this._evaluateActiveInstance(host, instance);
            });
            host.onDidChangeInstanceCapability((instance) => {
                this._onDidChangeInstanceCapability.fire(instance);
            });
            this._hostActiveTerminals.set(host, undefined);
        }
        _evaluateActiveInstance(host, instance) {
            // Track the latest active terminal for each host so that when one becomes undefined, the
            // TerminalService's active terminal is set to the last active terminal from the other host.
            // This means if the last terminal editor is closed such that it becomes undefined, the last
            // active group's terminal will be used as the active terminal if available.
            this._hostActiveTerminals.set(host, instance);
            if (instance === undefined) {
                for (const active of this._hostActiveTerminals.values()) {
                    if (active) {
                        instance = active;
                    }
                }
            }
            this._activeInstance = instance;
            this._onDidChangeActiveInstance.fire(instance);
        }
        setActiveInstance(value) {
            // If this was a hideFromUser terminal created by the API this was triggered by show,
            // in which case we need to create the terminal group
            if (value.shellLaunchConfig.hideFromUser) {
                this._showBackgroundTerminal(value);
            }
            if (value.target === terminal_1.TerminalLocation.Editor) {
                this._terminalEditorService.setActiveInstance(value);
            }
            else {
                this._terminalGroupService.setActiveInstance(value);
            }
        }
        async focusActiveInstance() {
            if (!this._activeInstance) {
                return;
            }
            if (this._activeInstance.target === terminal_1.TerminalLocation.Editor) {
                return this._terminalEditorService.focusActiveInstance();
            }
            return this._terminalGroupService.focusActiveInstance();
        }
        async createContributedTerminalProfile(extensionIdentifier, id, options) {
            await this._extensionService.activateByEvent(`onTerminalProfile:${id}`);
            const profileProvider = this._terminalProfileService.getContributedProfileProvider(extensionIdentifier, id);
            if (!profileProvider) {
                this._notificationService.error(`No terminal profile provider registered for id "${id}"`);
                return;
            }
            try {
                await profileProvider.createContributedTerminalProfile(options);
                this._terminalGroupService.setActiveInstanceByIndex(this._terminalGroupService.instances.length - 1);
                await this._terminalGroupService.activeInstance?.focusWhenReady();
            }
            catch (e) {
                this._notificationService.error(e.message);
            }
        }
        async safeDisposeTerminal(instance) {
            // Confirm on kill in the editor is handled by the editor input
            if (instance.target !== terminal_1.TerminalLocation.Editor &&
                instance.hasChildProcesses &&
                (this.configHelper.config.confirmOnKill === 'panel' || this.configHelper.config.confirmOnKill === 'always')) {
                const veto = await this._showTerminalCloseConfirmation(true);
                if (veto) {
                    return;
                }
            }
            return new Promise(r => {
                event_1.Event.once(instance.onExit)(() => r());
                instance.dispose(terminal_1.TerminalExitReason.User);
            });
        }
        _setConnected() {
            this._connectionState = 1 /* TerminalConnectionState.Connected */;
            this._onDidChangeConnectionState.fire();
            this._logService.trace('Pty host ready');
        }
        async _reconnectToRemoteTerminals() {
            const remoteAuthority = this._environmentService.remoteAuthority;
            if (!remoteAuthority) {
                return;
            }
            const backend = await this._terminalInstanceService.getBackend(remoteAuthority);
            if (!backend) {
                return;
            }
            (0, performance_1.mark)('code/terminal/willGetTerminalLayoutInfo');
            const layoutInfo = await backend.getTerminalLayoutInfo();
            (0, performance_1.mark)('code/terminal/didGetTerminalLayoutInfo');
            backend.reduceConnectionGraceTime();
            (0, performance_1.mark)('code/terminal/willRecreateTerminalGroups');
            await this._recreateTerminalGroups(layoutInfo);
            (0, performance_1.mark)('code/terminal/didRecreateTerminalGroups');
            // now that terminals have been restored,
            // attach listeners to update remote when terminals are changed
            this._attachProcessLayoutListeners();
            this._logService.trace('Reconnected to remote terminals');
        }
        async _reconnectToLocalTerminals() {
            const localBackend = await this._terminalInstanceService.getBackend();
            if (!localBackend) {
                return;
            }
            (0, performance_1.mark)('code/terminal/willGetTerminalLayoutInfo');
            const layoutInfo = await localBackend.getTerminalLayoutInfo();
            (0, performance_1.mark)('code/terminal/didGetTerminalLayoutInfo');
            if (layoutInfo && layoutInfo.tabs.length > 0) {
                (0, performance_1.mark)('code/terminal/willRecreateTerminalGroups');
                this._reconnectedTerminalGroups = this._recreateTerminalGroups(layoutInfo);
                (0, performance_1.mark)('code/terminal/didRecreateTerminalGroups');
            }
            // now that terminals have been restored,
            // attach listeners to update local state when terminals are changed
            this._attachProcessLayoutListeners();
            this._logService.trace('Reconnected to local terminals');
        }
        _recreateTerminalGroups(layoutInfo) {
            const groupPromises = [];
            let activeGroup;
            if (layoutInfo) {
                for (const tabLayout of layoutInfo.tabs) {
                    const terminalLayouts = tabLayout.terminals.filter(t => t.terminal && t.terminal.isOrphan);
                    if (terminalLayouts.length) {
                        this._restoredGroupCount += terminalLayouts.length;
                        const promise = this._recreateTerminalGroup(tabLayout, terminalLayouts);
                        groupPromises.push(promise);
                        if (tabLayout.isActive) {
                            activeGroup = promise;
                        }
                        const activeInstance = this.instances.find(t => t.shellLaunchConfig.attachPersistentProcess?.id === tabLayout.activePersistentProcessId);
                        if (activeInstance) {
                            this.setActiveInstance(activeInstance);
                        }
                    }
                }
                if (layoutInfo.tabs.length) {
                    activeGroup?.then(group => this._terminalGroupService.activeGroup = group);
                }
            }
            return Promise.all(groupPromises).then(result => result.filter(e => !!e));
        }
        async _recreateTerminalGroup(tabLayout, terminalLayouts) {
            let lastInstance;
            for (const terminalLayout of terminalLayouts) {
                const attachPersistentProcess = terminalLayout.terminal;
                if (this._lifecycleService.startupKind !== 3 /* StartupKind.ReloadedWindow */ && attachPersistentProcess.type === 'Task') {
                    continue;
                }
                (0, performance_1.mark)(`code/terminal/willRecreateTerminal/${attachPersistentProcess.id}-${attachPersistentProcess.pid}`);
                lastInstance = this.createTerminal({
                    config: { attachPersistentProcess },
                    location: lastInstance ? { parentTerminal: lastInstance } : terminal_1.TerminalLocation.Panel
                });
                lastInstance.then(() => (0, performance_1.mark)(`code/terminal/didRecreateTerminal/${attachPersistentProcess.id}-${attachPersistentProcess.pid}`));
            }
            const group = lastInstance?.then(instance => {
                const g = this._terminalGroupService.getGroupForInstance(instance);
                g?.resizePanes(tabLayout.terminals.map(terminal => terminal.relativeSize));
                return g;
            });
            return group;
        }
        _attachProcessLayoutListeners() {
            this.onDidChangeActiveGroup(() => this._saveState());
            this.onDidChangeActiveInstance(() => this._saveState());
            this.onDidChangeInstances(() => this._saveState());
            // The state must be updated when the terminal is relaunched, otherwise the persistent
            // terminal ID will be stale and the process will be leaked.
            this.onDidReceiveProcessId(() => this._saveState());
            this.onDidChangeInstanceTitle(instance => this._updateTitle(instance));
            this.onDidChangeInstanceIcon(e => this._updateIcon(e.instance, e.userInitiated));
        }
        _handleInstanceContextKeys() {
            const terminalIsOpenContext = terminalContextKey_1.TerminalContextKeys.isOpen.bindTo(this._contextKeyService);
            const updateTerminalContextKeys = () => {
                terminalIsOpenContext.set(this.instances.length > 0);
                this._terminalCountContextKey.set(this.instances.length);
            };
            this.onDidChangeInstances(() => updateTerminalContextKeys());
        }
        async getActiveOrCreateInstance(options) {
            const activeInstance = this.activeInstance;
            // No instance, create
            if (!activeInstance) {
                return this.createTerminal();
            }
            // Active instance, ensure accepts input
            if (!options?.acceptsInput || activeInstance.xterm?.isStdinDisabled !== true) {
                return activeInstance;
            }
            // Active instance doesn't accept input, create and focus
            const instance = await this.createTerminal();
            this.setActiveInstance(instance);
            await this.revealActiveTerminal();
            return instance;
        }
        async revealActiveTerminal() {
            const instance = this.activeInstance;
            if (!instance) {
                return;
            }
            if (instance.target === terminal_1.TerminalLocation.Editor) {
                await this._terminalEditorService.revealActiveEditor();
            }
            else {
                await this._terminalGroupService.showPanel();
            }
        }
        setEditable(instance, data) {
            if (!data) {
                this._editable = undefined;
            }
            else {
                this._editable = { instance: instance, data };
            }
            const pane = this._viewsService.getActiveViewWithId(terminal_3.TERMINAL_VIEW_ID);
            const isEditing = this.isEditable(instance);
            pane?.terminalTabbedView?.setEditable(isEditing);
        }
        isEditable(instance) {
            return !!this._editable && (this._editable.instance === instance || !instance);
        }
        getEditableData(instance) {
            return this._editable && this._editable.instance === instance ? this._editable.data : undefined;
        }
        requestStartExtensionTerminal(proxy, cols, rows) {
            // The initial request came from the extension host, no need to wait for it
            return new Promise(callback => {
                this._onDidRequestStartExtensionTerminal.fire({ proxy, cols, rows, callback });
            });
        }
        _onBeforeShutdown(reason) {
            // Never veto on web as this would block all windows from being closed. This disables
            // process revive as we can't handle it on shutdown.
            if (platform_1.isWeb) {
                this._isShuttingDown = true;
                return false;
            }
            return this._onBeforeShutdownAsync(reason);
        }
        async _onBeforeShutdownAsync(reason) {
            if (this.instances.length === 0) {
                // No terminal instances, don't veto
                return false;
            }
            // Persist terminal _buffer state_, note that even if this happens the dirty terminal prompt
            // still shows as that cannot be revived
            try {
                this._shutdownWindowCount = await this._nativeDelegate?.getWindowCount();
                const shouldReviveProcesses = this._shouldReviveProcesses(reason);
                if (shouldReviveProcesses) {
                    // Attempt to persist the terminal state but only allow 2000ms as we can't block
                    // shutdown. This can happen when in a remote workspace but the other side has been
                    // suspended and is in the process of reconnecting, the message will be put in a
                    // queue in this case for when the connection is back up and running. Aborting the
                    // process is preferable in this case.
                    await Promise.race([
                        this._primaryBackend?.persistTerminalState(),
                        (0, async_1.timeout)(2000)
                    ]);
                }
                // Persist terminal _processes_
                const shouldPersistProcesses = this._configHelper.config.enablePersistentSessions && reason === 3 /* ShutdownReason.RELOAD */;
                if (!shouldPersistProcesses) {
                    const hasDirtyInstances = ((this.configHelper.config.confirmOnExit === 'always' && this.instances.length > 0) ||
                        (this.configHelper.config.confirmOnExit === 'hasChildProcesses' && this.instances.some(e => e.hasChildProcesses)));
                    if (hasDirtyInstances) {
                        return this._onBeforeShutdownConfirmation(reason);
                    }
                }
            }
            catch (err) {
                // Swallow as exceptions should not cause a veto to prevent shutdown
                this._logService.warn('Exception occurred during terminal shutdown', err);
            }
            this._isShuttingDown = true;
            return false;
        }
        setNativeDelegate(nativeDelegate) {
            this._nativeDelegate = nativeDelegate;
        }
        _shouldReviveProcesses(reason) {
            if (!this._configHelper.config.enablePersistentSessions) {
                return false;
            }
            switch (this.configHelper.config.persistentSessionReviveProcess) {
                case 'onExit': {
                    // Allow on close if it's the last window on Windows or Linux
                    if (reason === 1 /* ShutdownReason.CLOSE */ && (this._shutdownWindowCount === 1 && !platform_1.isMacintosh)) {
                        return true;
                    }
                    return reason === 4 /* ShutdownReason.LOAD */ || reason === 2 /* ShutdownReason.QUIT */;
                }
                case 'onExitAndWindowClose': return reason !== 3 /* ShutdownReason.RELOAD */;
                default: return false;
            }
        }
        async _onBeforeShutdownConfirmation(reason) {
            // veto if configured to show confirmation and the user chose not to exit
            const veto = await this._showTerminalCloseConfirmation();
            if (!veto) {
                this._isShuttingDown = true;
            }
            return veto;
        }
        _onWillShutdown(e) {
            // Don't touch processes if the shutdown was a result of reload as they will be reattached
            const shouldPersistTerminals = this._configHelper.config.enablePersistentSessions && e.reason === 3 /* ShutdownReason.RELOAD */;
            for (const instance of [...this._terminalGroupService.instances, ...this._backgroundedTerminalInstances]) {
                if (shouldPersistTerminals && instance.shouldPersist) {
                    instance.detachProcessAndDispose(terminal_1.TerminalExitReason.Shutdown);
                }
                else {
                    instance.dispose(terminal_1.TerminalExitReason.Shutdown);
                }
            }
            // Clear terminal layout info only when not persisting
            if (!shouldPersistTerminals && !this._shouldReviveProcesses(e.reason)) {
                this._primaryBackend?.setTerminalLayoutInfo(undefined);
            }
        }
        _saveState() {
            // Avoid saving state when shutting down as that would override process state to be revived
            if (this._isShuttingDown) {
                return;
            }
            if (!this.configHelper.config.enablePersistentSessions) {
                return;
            }
            const tabs = this._terminalGroupService.groups.map(g => g.getLayoutInfo(g === this._terminalGroupService.activeGroup));
            const state = { tabs };
            this._primaryBackend?.setTerminalLayoutInfo(state);
        }
        _updateTitle(instance) {
            if (!this.configHelper.config.enablePersistentSessions || !instance || !instance.persistentProcessId || !instance.title || instance.isDisposed) {
                return;
            }
            if (instance.staticTitle) {
                this._primaryBackend?.updateTitle(instance.persistentProcessId, instance.staticTitle, terminal_1.TitleEventSource.Api);
            }
            else {
                this._primaryBackend?.updateTitle(instance.persistentProcessId, instance.title, instance.titleSource);
            }
        }
        _updateIcon(instance, userInitiated) {
            if (!this.configHelper.config.enablePersistentSessions || !instance || !instance.persistentProcessId || !instance.icon || instance.isDisposed) {
                return;
            }
            this._primaryBackend?.updateIcon(instance.persistentProcessId, userInitiated, instance.icon, instance.color);
        }
        refreshActiveGroup() {
            this._onDidChangeActiveGroup.fire(this._terminalGroupService.activeGroup);
        }
        getInstanceFromId(terminalId) {
            let bgIndex = -1;
            this._backgroundedTerminalInstances.forEach((terminalInstance, i) => {
                if (terminalInstance.instanceId === terminalId) {
                    bgIndex = i;
                }
            });
            if (bgIndex !== -1) {
                return this._backgroundedTerminalInstances[bgIndex];
            }
            try {
                return this.instances[this._getIndexFromId(terminalId)];
            }
            catch {
                return undefined;
            }
        }
        getInstanceFromIndex(terminalIndex) {
            return this.instances[terminalIndex];
        }
        getInstanceFromResource(resource) {
            return (0, terminalUri_1.getInstanceFromResource)(this.instances, resource);
        }
        isAttachedToTerminal(remoteTerm) {
            return this.instances.some(term => term.processId === remoteTerm.pid);
        }
        moveToEditor(source) {
            if (source.target === terminal_1.TerminalLocation.Editor) {
                return;
            }
            const sourceGroup = this._terminalGroupService.getGroupForInstance(source);
            if (!sourceGroup) {
                return;
            }
            sourceGroup.removeInstance(source);
            this._terminalEditorService.openEditor(source);
        }
        async moveToTerminalView(source, target, side) {
            if (uri_1.URI.isUri(source)) {
                source = this.getInstanceFromResource(source);
            }
            if (!source) {
                return;
            }
            this._terminalEditorService.detachInstance(source);
            if (source.target !== terminal_1.TerminalLocation.Editor) {
                await this._terminalGroupService.showPanel(true);
                return;
            }
            source.target = terminal_1.TerminalLocation.Panel;
            let group;
            if (target) {
                group = this._terminalGroupService.getGroupForInstance(target);
            }
            if (!group) {
                group = this._terminalGroupService.createGroup();
            }
            group.addInstance(source);
            this.setActiveInstance(source);
            await this._terminalGroupService.showPanel(true);
            if (target && side) {
                const index = group.terminalInstances.indexOf(target) + (side === 'after' ? 1 : 0);
                group.moveInstance(source, index);
            }
            // Fire events
            this._onDidChangeInstances.fire();
            this._onDidChangeActiveGroup.fire(this._terminalGroupService.activeGroup);
        }
        _initInstanceListeners(instance) {
            const instanceDisposables = [
                instance.onTitleChanged(this._onDidChangeInstanceTitle.fire, this._onDidChangeInstanceTitle),
                instance.onIconChanged(this._onDidChangeInstanceIcon.fire, this._onDidChangeInstanceIcon),
                instance.onIconChanged(this._onDidChangeInstanceColor.fire, this._onDidChangeInstanceColor),
                instance.onProcessIdReady(this._onDidReceiveProcessId.fire, this._onDidReceiveProcessId),
                instance.statusList.onDidChangePrimaryStatus(() => this._onDidChangeInstancePrimaryStatus.fire(instance)),
                instance.onDimensionsChanged(() => {
                    this._onDidChangeInstanceDimensions.fire(instance);
                    if (this.configHelper.config.enablePersistentSessions && this.isProcessSupportRegistered) {
                        this._saveState();
                    }
                }),
                instance.onMaximumDimensionsChanged(() => this._onDidMaxiumumDimensionsChange.fire(instance)),
                instance.onDidInputData(this._onDidInputInstanceData.fire, this._onDidInputInstanceData),
                instance.onDidFocus(this._onDidChangeActiveInstance.fire, this._onDidChangeActiveInstance),
                instance.onRequestAddInstanceToGroup(async (e) => await this._addInstanceToGroup(instance, e)),
                instance.onDidChangeSelection(this._onDidChangeSelection.fire, this._onDidChangeSelection)
            ];
            instance.onDisposed(() => (0, lifecycle_1.dispose)(instanceDisposables));
        }
        async _addInstanceToGroup(instance, e) {
            const terminalIdentifier = (0, terminalUri_1.parseTerminalUri)(e.uri);
            if (terminalIdentifier.instanceId === undefined) {
                return;
            }
            let sourceInstance = this.getInstanceFromResource(e.uri);
            // Terminal from a different window
            if (!sourceInstance) {
                const attachPersistentProcess = await this._primaryBackend?.requestDetachInstance(terminalIdentifier.workspaceId, terminalIdentifier.instanceId);
                if (attachPersistentProcess) {
                    sourceInstance = await this.createTerminal({ config: { attachPersistentProcess }, resource: e.uri });
                    this._terminalGroupService.moveInstance(sourceInstance, instance, e.side);
                    return;
                }
            }
            // View terminals
            sourceInstance = this._terminalGroupService.getInstanceFromResource(e.uri);
            if (sourceInstance) {
                this._terminalGroupService.moveInstance(sourceInstance, instance, e.side);
                return;
            }
            // Terminal editors
            sourceInstance = this._terminalEditorService.getInstanceFromResource(e.uri);
            if (sourceInstance) {
                this.moveToTerminalView(sourceInstance, instance, e.side);
                return;
            }
            return;
        }
        registerProcessSupport(isSupported) {
            if (!isSupported) {
                return;
            }
            this._processSupportContextKey.set(isSupported);
            this._onDidRegisterProcessSupport.fire();
        }
        // TODO: Remove this, it should live in group/editor servioce
        _getIndexFromId(terminalId) {
            let terminalIndex = -1;
            this.instances.forEach((terminalInstance, i) => {
                if (terminalInstance.instanceId === terminalId) {
                    terminalIndex = i;
                }
            });
            if (terminalIndex === -1) {
                throw new Error(`Terminal with ID ${terminalId} does not exist (has it already been disposed?)`);
            }
            return terminalIndex;
        }
        async _showTerminalCloseConfirmation(singleTerminal) {
            let message;
            if (this.instances.length === 1 || singleTerminal) {
                message = nls.localize('terminalService.terminalCloseConfirmationSingular', "Do you want to terminate the active terminal session?");
            }
            else {
                message = nls.localize('terminalService.terminalCloseConfirmationPlural', "Do you want to terminate the {0} active terminal sessions?", this.instances.length);
            }
            const { confirmed } = await this._dialogService.confirm({
                type: 'warning',
                message,
                primaryButton: nls.localize({ key: 'terminate', comment: ['&& denotes a mnemonic'] }, "&&Terminate")
            });
            return !confirmed;
        }
        getDefaultInstanceHost() {
            if (this.defaultLocation === terminal_1.TerminalLocation.Editor) {
                return this._terminalEditorService;
            }
            return this._terminalGroupService;
        }
        async getInstanceHost(location) {
            if (location) {
                if (location === terminal_1.TerminalLocation.Editor) {
                    return this._terminalEditorService;
                }
                else if (typeof location === 'object') {
                    if ('viewColumn' in location) {
                        return this._terminalEditorService;
                    }
                    else if ('parentTerminal' in location) {
                        return (await location.parentTerminal).target === terminal_1.TerminalLocation.Editor ? this._terminalEditorService : this._terminalGroupService;
                    }
                }
                else {
                    return this._terminalGroupService;
                }
            }
            return this;
        }
        async createTerminal(options) {
            // Await the initialization of available profiles as long as this is not a pty terminal or a
            // local terminal in a remote workspace as profile won't be used in those cases and these
            // terminals need to be launched before remote connections are established.
            if (this._terminalProfileService.availableProfiles.length === 0) {
                const isPtyTerminal = options?.config && 'customPtyImplementation' in options.config;
                const isLocalInRemoteTerminal = this._remoteAgentService.getConnection() && uri_1.URI.isUri(options?.cwd) && options?.cwd.scheme === network_1.Schemas.vscodeFileResource;
                if (!isPtyTerminal && !isLocalInRemoteTerminal) {
                    if (this._connectionState === 0 /* TerminalConnectionState.Connecting */) {
                        (0, performance_1.mark)(`code/terminal/willGetProfiles`);
                    }
                    await this._terminalProfileService.profilesReady;
                    if (this._connectionState === 0 /* TerminalConnectionState.Connecting */) {
                        (0, performance_1.mark)(`code/terminal/didGetProfiles`);
                    }
                }
            }
            const config = options?.config || this._terminalProfileService.getDefaultProfile();
            const shellLaunchConfig = config && 'extensionIdentifier' in config ? {} : this._terminalInstanceService.convertProfileToShellLaunchConfig(config || {});
            // Get the contributed profile if it was provided
            let contributedProfile = config && 'extensionIdentifier' in config ? config : undefined;
            // Get the default profile as a contributed profile if it exists
            if (!contributedProfile && (!options || !options.config)) {
                contributedProfile = await this._terminalProfileService.getContributedDefaultProfile(shellLaunchConfig);
            }
            const splitActiveTerminal = typeof options?.location === 'object' && 'splitActiveTerminal' in options.location ? options.location.splitActiveTerminal : typeof options?.location === 'object' ? 'parentTerminal' in options.location : false;
            await this._resolveCwd(shellLaunchConfig, splitActiveTerminal, options);
            // Launch the contributed profile
            if (contributedProfile) {
                const resolvedLocation = await this.resolveLocation(options?.location);
                let location;
                if (splitActiveTerminal) {
                    location = resolvedLocation === terminal_1.TerminalLocation.Editor ? { viewColumn: editorService_1.SIDE_GROUP } : { splitActiveTerminal: true };
                }
                else {
                    location = typeof options?.location === 'object' && 'viewColumn' in options.location ? options.location : resolvedLocation;
                }
                await this.createContributedTerminalProfile(contributedProfile.extensionIdentifier, contributedProfile.id, {
                    icon: contributedProfile.icon,
                    color: contributedProfile.color,
                    location
                });
                const instanceHost = resolvedLocation === terminal_1.TerminalLocation.Editor ? this._terminalEditorService : this._terminalGroupService;
                const instance = instanceHost.instances[instanceHost.instances.length - 1];
                await instance.focusWhenReady();
                this._terminalHasBeenCreated.set(true);
                return instance;
            }
            if (!shellLaunchConfig.customPtyImplementation && !this.isProcessSupportRegistered) {
                throw new Error('Could not create terminal when process support is not registered');
            }
            if (shellLaunchConfig.hideFromUser) {
                const instance = this._terminalInstanceService.createInstance(shellLaunchConfig, terminal_1.TerminalLocation.Panel);
                this._backgroundedTerminalInstances.push(instance);
                this._backgroundedTerminalDisposables.set(instance.instanceId, [
                    instance.onDisposed(this._onDidDisposeInstance.fire, this._onDidDisposeInstance)
                ]);
                this._terminalHasBeenCreated.set(true);
                return instance;
            }
            this._evaluateLocalCwd(shellLaunchConfig);
            const location = await this.resolveLocation(options?.location) || this.defaultLocation;
            const parent = await this._getSplitParent(options?.location);
            this._terminalHasBeenCreated.set(true);
            if (parent) {
                return this._splitTerminal(shellLaunchConfig, location, parent);
            }
            return this._createTerminal(shellLaunchConfig, location, options);
        }
        async createDetachedTerminal(options) {
            const ctor = await terminalInstance_1.TerminalInstance.getXtermConstructor(this._keybindingService, this._contextKeyService);
            const xterm = this._instantiationService.createInstance(xtermTerminal_1.XtermTerminal, ctor, this._configHelper, options.cols, options.rows, options.colorProvider, options.capabilities || new terminalCapabilityStore_1.TerminalCapabilityStore(), '', undefined, false);
            if (options.readonly) {
                xterm.raw.attachCustomKeyEventHandler(() => false);
            }
            this._detachedXterms.add(xterm);
            const l = xterm.onDidDispose(() => {
                this._detachedXterms.delete(xterm);
                l.dispose();
            });
            return new detachedTerminal_1.DeatachedTerminal(xterm, options, this._instantiationService);
        }
        async _resolveCwd(shellLaunchConfig, splitActiveTerminal, options) {
            const cwd = shellLaunchConfig.cwd;
            if (!cwd) {
                if (options?.cwd) {
                    shellLaunchConfig.cwd = options.cwd;
                }
                else if (splitActiveTerminal && options?.location) {
                    let parent = this.activeInstance;
                    if (typeof options.location === 'object' && 'parentTerminal' in options.location) {
                        parent = await options.location.parentTerminal;
                    }
                    if (!parent) {
                        throw new Error('Cannot split without an active instance');
                    }
                    shellLaunchConfig.cwd = await (0, terminalActions_1.getCwdForSplit)(this.configHelper, parent, this._workspaceContextService.getWorkspace().folders, this._commandService);
                }
            }
        }
        _splitTerminal(shellLaunchConfig, location, parent) {
            let instance;
            // Use the URI from the base instance if it exists, this will correctly split local terminals
            if (typeof shellLaunchConfig.cwd !== 'object' && typeof parent.shellLaunchConfig.cwd === 'object') {
                shellLaunchConfig.cwd = uri_1.URI.from({
                    scheme: parent.shellLaunchConfig.cwd.scheme,
                    authority: parent.shellLaunchConfig.cwd.authority,
                    path: shellLaunchConfig.cwd || parent.shellLaunchConfig.cwd.path
                });
            }
            if (location === terminal_1.TerminalLocation.Editor || parent.target === terminal_1.TerminalLocation.Editor) {
                instance = this._terminalEditorService.splitInstance(parent, shellLaunchConfig);
            }
            else {
                const group = this._terminalGroupService.getGroupForInstance(parent);
                if (!group) {
                    throw new Error(`Cannot split a terminal without a group ${parent}`);
                }
                shellLaunchConfig.parentTerminalId = parent.instanceId;
                instance = group.split(shellLaunchConfig);
            }
            this._addToReconnected(instance);
            return instance;
        }
        _addToReconnected(instance) {
            if (!instance.reconnectionProperties?.ownerId) {
                return;
            }
            const reconnectedTerminals = this._reconnectedTerminals.get(instance.reconnectionProperties.ownerId);
            if (reconnectedTerminals) {
                reconnectedTerminals.push(instance);
            }
            else {
                this._reconnectedTerminals.set(instance.reconnectionProperties.ownerId, [instance]);
            }
        }
        _createTerminal(shellLaunchConfig, location, options) {
            let instance;
            const editorOptions = this._getEditorOptions(options?.location);
            if (location === terminal_1.TerminalLocation.Editor) {
                instance = this._terminalInstanceService.createInstance(shellLaunchConfig, terminal_1.TerminalLocation.Editor);
                this._terminalEditorService.openEditor(instance, editorOptions);
            }
            else {
                // TODO: pass resource?
                const group = this._terminalGroupService.createGroup(shellLaunchConfig);
                instance = group.terminalInstances[0];
            }
            this._addToReconnected(instance);
            return instance;
        }
        async resolveLocation(location) {
            if (location && typeof location === 'object') {
                if ('parentTerminal' in location) {
                    // since we don't set the target unless it's an editor terminal, this is necessary
                    const parentTerminal = await location.parentTerminal;
                    return !parentTerminal.target ? terminal_1.TerminalLocation.Panel : parentTerminal.target;
                }
                else if ('viewColumn' in location) {
                    return terminal_1.TerminalLocation.Editor;
                }
                else if ('splitActiveTerminal' in location) {
                    // since we don't set the target unless it's an editor terminal, this is necessary
                    return !this._activeInstance?.target ? terminal_1.TerminalLocation.Panel : this._activeInstance?.target;
                }
            }
            return location;
        }
        async _getSplitParent(location) {
            if (location && typeof location === 'object' && 'parentTerminal' in location) {
                return location.parentTerminal;
            }
            else if (location && typeof location === 'object' && 'splitActiveTerminal' in location) {
                return this.activeInstance;
            }
            return undefined;
        }
        _getEditorOptions(location) {
            if (location && typeof location === 'object' && 'viewColumn' in location) {
                location.viewColumn = (0, editorGroupColumn_1.columnToEditorGroup)(this._editorGroupsService, this._configurationService, location.viewColumn);
                return location;
            }
            return undefined;
        }
        _evaluateLocalCwd(shellLaunchConfig) {
            // Add welcome message and title annotation for local terminals launched within remote or
            // virtual workspaces
            if (typeof shellLaunchConfig.cwd !== 'string' && shellLaunchConfig.cwd?.scheme === network_1.Schemas.file) {
                if (contextkeys_1.VirtualWorkspaceContext.getValue(this._contextKeyService)) {
                    shellLaunchConfig.initialText = (0, terminalStrings_1.formatMessageForTerminal)(nls.localize('localTerminalVirtualWorkspace', "This shell is open to a {0}local{1} folder, NOT to the virtual folder", '\x1b[3m', '\x1b[23m'), { excludeLeadingNewLine: true, loudFormatting: true });
                    shellLaunchConfig.type = 'Local';
                }
                else if (this._remoteAgentService.getConnection()) {
                    shellLaunchConfig.initialText = (0, terminalStrings_1.formatMessageForTerminal)(nls.localize('localTerminalRemote', "This shell is running on your {0}local{1} machine, NOT on the connected remote machine", '\x1b[3m', '\x1b[23m'), { excludeLeadingNewLine: true, loudFormatting: true });
                    shellLaunchConfig.type = 'Local';
                }
            }
        }
        _showBackgroundTerminal(instance) {
            this._backgroundedTerminalInstances.splice(this._backgroundedTerminalInstances.indexOf(instance), 1);
            const disposables = this._backgroundedTerminalDisposables.get(instance.instanceId);
            if (disposables) {
                (0, lifecycle_1.dispose)(disposables);
            }
            this._backgroundedTerminalDisposables.delete(instance.instanceId);
            instance.shellLaunchConfig.hideFromUser = false;
            this._terminalGroupService.createGroup(instance);
            // Make active automatically if it's the first instance
            if (this.instances.length === 1) {
                this._terminalGroupService.setActiveInstanceByIndex(0);
            }
            this._onDidChangeInstances.fire();
            this._onDidChangeGroups.fire();
        }
        async setContainers(panelContainer, terminalContainer) {
            this._configHelper.panelContainer = panelContainer;
            this._terminalGroupService.setContainer(terminalContainer);
        }
        getEditingTerminal() {
            return this._editingTerminal;
        }
        setEditingTerminal(instance) {
            this._editingTerminal = instance;
        }
        onInstanceEvent(getEvent) {
            return new event_1.DynamicListEventMultiplexer(this.instances, this.onDidCreateInstance, this.onDidDisposeInstance, getEvent);
        }
        onInstanceCapabilityEvent(capabilityId, getEvent) {
            return (0, terminalEvents_1.createInstanceCapabilityEventMultiplexer)(this.instances, this.onDidCreateInstance, this.onDidDisposeInstance, capabilityId, getEvent);
        }
    };
    exports.TerminalService = TerminalService;
    __decorate([
        (0, decorators_1.debounce)(500)
    ], TerminalService.prototype, "_saveState", null);
    __decorate([
        (0, decorators_1.debounce)(500)
    ], TerminalService.prototype, "_updateTitle", null);
    __decorate([
        (0, decorators_1.debounce)(500)
    ], TerminalService.prototype, "_updateIcon", null);
    exports.TerminalService = TerminalService = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, lifecycle_2.ILifecycleService),
        __param(2, terminal_1.ITerminalLogService),
        __param(3, dialogs_1.IDialogService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, remoteAgentService_1.IRemoteAgentService),
        __param(6, views_1.IViewsService),
        __param(7, configuration_1.IConfigurationService),
        __param(8, environmentService_1.IWorkbenchEnvironmentService),
        __param(9, terminal_2.ITerminalEditorService),
        __param(10, terminal_2.ITerminalGroupService),
        __param(11, terminal_2.ITerminalInstanceService),
        __param(12, editorGroupsService_1.IEditorGroupsService),
        __param(13, terminal_3.ITerminalProfileService),
        __param(14, extensions_1.IExtensionService),
        __param(15, notification_1.INotificationService),
        __param(16, workspace_1.IWorkspaceContextService),
        __param(17, commands_1.ICommandService),
        __param(18, keybinding_1.IKeybindingService),
        __param(19, timerService_1.ITimerService)
    ], TerminalService);
    let TerminalEditorStyle = class TerminalEditorStyle extends themeService_1.Themable {
        constructor(container, _terminalService, _themeService, _terminalProfileService, _editorService) {
            super(_themeService);
            this._terminalService = _terminalService;
            this._themeService = _themeService;
            this._terminalProfileService = _terminalProfileService;
            this._editorService = _editorService;
            this._registerListeners();
            this._styleElement = document.createElement('style');
            container.appendChild(this._styleElement);
            this._register((0, lifecycle_1.toDisposable)(() => container.removeChild(this._styleElement)));
            this.updateStyles();
        }
        _registerListeners() {
            this._register(this._terminalService.onDidChangeInstanceIcon(() => this.updateStyles()));
            this._register(this._terminalService.onDidChangeInstanceColor(() => this.updateStyles()));
            this._register(this._terminalService.onDidCreateInstance(() => this.updateStyles()));
            this._register(this._editorService.onDidActiveEditorChange(() => {
                if (this._editorService.activeEditor instanceof terminalEditorInput_1.TerminalEditorInput) {
                    this.updateStyles();
                }
            }));
            this._register(this._editorService.onDidCloseEditor(() => {
                if (this._editorService.activeEditor instanceof terminalEditorInput_1.TerminalEditorInput) {
                    this.updateStyles();
                }
            }));
            this._register(this._terminalProfileService.onDidChangeAvailableProfiles(() => this.updateStyles()));
        }
        updateStyles() {
            super.updateStyles();
            const colorTheme = this._themeService.getColorTheme();
            // TODO: add a rule collector to avoid duplication
            let css = '';
            const productIconTheme = this._themeService.getProductIconTheme();
            // Add icons
            for (const instance of this._terminalService.instances) {
                const icon = instance.icon;
                if (!icon) {
                    continue;
                }
                let uri = undefined;
                if (icon instanceof uri_1.URI) {
                    uri = icon;
                }
                else if (icon instanceof Object && 'light' in icon && 'dark' in icon) {
                    uri = colorTheme.type === theme_1.ColorScheme.LIGHT ? icon.light : icon.dark;
                }
                const iconClasses = (0, terminalIcon_1.getUriClasses)(instance, colorTheme.type);
                if (uri instanceof uri_1.URI && iconClasses && iconClasses.length > 1) {
                    css += (`.monaco-workbench .terminal-tab.${iconClasses[0]}::before` +
                        `{background-image: ${dom.asCSSUrl(uri)};}`);
                }
                if (themables_1.ThemeIcon.isThemeIcon(icon)) {
                    const iconRegistry = (0, iconRegistry_1.getIconRegistry)();
                    const iconContribution = iconRegistry.getIcon(icon.id);
                    if (iconContribution) {
                        const def = productIconTheme.getIcon(iconContribution);
                        if (def) {
                            css += (`.monaco-workbench .terminal-tab.codicon-${icon.id}::before` +
                                `{content: '${def.fontCharacter}' !important; font-family: ${dom.asCSSPropertyValue(def.font?.id ?? 'codicon')} !important;}`);
                        }
                    }
                }
            }
            // Add colors
            const iconForegroundColor = colorTheme.getColor(colorRegistry_1.iconForeground);
            if (iconForegroundColor) {
                css += `.monaco-workbench .show-file-icons .file-icon.terminal-tab::before { color: ${iconForegroundColor}; }`;
            }
            css += (0, terminalIcon_1.getColorStyleContent)(colorTheme, true);
            this._styleElement.textContent = css;
        }
    };
    TerminalEditorStyle = __decorate([
        __param(1, terminal_2.ITerminalService),
        __param(2, themeService_1.IThemeService),
        __param(3, terminal_3.ITerminalProfileService),
        __param(4, editorService_1.IEditorService)
    ], TerminalEditorStyle);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvYnJvd3Nlci90ZXJtaW5hbFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBdUR6RixJQUFNLGVBQWUsR0FBckIsTUFBTSxlQUFnQixTQUFRLHNCQUFVO1FBdUI5QyxJQUFJLDBCQUEwQixLQUFjLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFHNUYsSUFBSSxlQUFlLEtBQThCLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztRQUdoRixJQUFJLGFBQWEsS0FBb0IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFHcEUsSUFBSSxrQkFBa0IsS0FBYSxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7UUFFckUsSUFBSSxZQUFZLEtBQTRCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7UUFDeEUsSUFBSSxTQUFTO1lBQ1osT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDM0YsQ0FBQztRQUNELElBQUksY0FBYztZQUNqQixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUM7UUFDN0IsQ0FBQztRQUtELHVCQUF1QixDQUFDLGlCQUF5QjtZQUNoRCxPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUMxRCxDQUFDO1FBRUQsSUFBSSxlQUFlLEtBQXVCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFN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