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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/uri", "vs/nls!vs/workbench/contrib/terminal/browser/terminalService", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/terminal/common/terminal", "vs/platform/terminal/common/terminalStrings", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/iconRegistry", "vs/platform/theme/common/theme", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/workspace/common/workspace", "vs/workbench/common/contextkeys", "vs/workbench/common/views", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/terminalActions", "vs/workbench/contrib/terminal/browser/terminalConfigHelper", "vs/workbench/contrib/terminal/browser/terminalEditorInput", "vs/workbench/contrib/terminal/browser/terminalIcon", "vs/workbench/contrib/terminal/browser/terminalProfileQuickpick", "vs/workbench/contrib/terminal/browser/terminalUri", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/workbench/services/editor/common/editorGroupColumn", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/contrib/terminal/browser/xterm/xtermTerminal", "vs/workbench/contrib/terminal/browser/terminalInstance", "vs/platform/keybinding/common/keybinding", "vs/platform/terminal/common/capabilities/terminalCapabilityStore", "vs/workbench/services/timer/browser/timerService", "vs/base/common/performance", "vs/workbench/contrib/terminal/browser/detachedTerminal", "vs/workbench/contrib/terminal/browser/terminalEvents"], function (require, exports, dom, async_1, decorators_1, event_1, lifecycle_1, network_1, platform_1, uri_1, nls, commands_1, configuration_1, contextkey_1, dialogs_1, instantiation_1, notification_1, terminal_1, terminalStrings_1, colorRegistry_1, iconRegistry_1, theme_1, themeService_1, themables_1, workspace_1, contextkeys_1, views_1, terminal_2, terminalActions_1, terminalConfigHelper_1, terminalEditorInput_1, terminalIcon_1, terminalProfileQuickpick_1, terminalUri_1, terminal_3, terminalContextKey_1, editorGroupColumn_1, editorGroupsService_1, editorService_1, environmentService_1, extensions_1, lifecycle_2, remoteAgentService_1, xtermTerminal_1, terminalInstance_1, keybinding_1, terminalCapabilityStore_1, timerService_1, performance_1, detachedTerminal_1, terminalEvents_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$cWb = void 0;
    let $cWb = class $cWb extends lifecycle_1.$kc {
        get isProcessSupportRegistered() { return !!this.n.get(); }
        get connectionState() { return this.F; }
        get whenConnected() { return this.G.p; }
        get restoredGroupCount() { return this.H; }
        get configHelper() { return this.y; }
        get instances() {
            return this.tb.instances.concat(this.sb.instances);
        }
        get detachedXterms() {
            return this.b;
        }
        getReconnectedTerminals(reconnectionOwner) {
            return this.J.get(reconnectionOwner);
        }
        get defaultLocation() { return this.configHelper.config.defaultLocation === "editor" /* TerminalLocationString.Editor */ ? terminal_1.TerminalLocation.Editor : terminal_1.TerminalLocation.Panel; }
        get activeInstance() {
            // Check if either an editor or panel terminal has focus and return that, regardless of the
            // value of _activeInstance. This avoids terminals created in the panel for example stealing
            // the active status even when it's not focused.
            for (const activeHostTerminal of this.a.values()) {
                if (activeHostTerminal?.hasFocus) {
                    return activeHostTerminal;
                }
            }
            // Fallback to the last recorded active terminal if neither have focus
            return this.L;
        }
        get onDidChangeActiveGroup() { return this.N.event; }
        get onDidCreateInstance() { return this.O.event; }
        get onDidDisposeInstance() { return this.P.event; }
        get onDidFocusInstance() { return this.Q.event; }
        get onDidReceiveProcessId() { return this.R.event; }
        get onDidRequestStartExtensionTerminal() { return this.S.event; }
        get onDidChangeInstanceDimensions() { return this.U.event; }
        get onDidMaximumDimensionsChange() { return this.W.event; }
        get onDidChangeInstanceCapability() { return this.X.event; }
        get onDidChangeInstances() { return this.Y.event; }
        get onDidChangeInstanceTitle() { return this.Z.event; }
        get onDidChangeInstanceIcon() { return this.$.event; }
        get onDidChangeInstanceColor() { return this.ab.event; }
        get onDidChangeActiveInstance() { return this.bb.event; }
        get onDidChangeInstancePrimaryStatus() { return this.cb.event; }
        get onDidInputInstanceData() { return this.db.event; }
        get onDidChangeSelection() { return this.eb.event; }
        get onDidDisposeGroup() { return this.fb.event; }
        get onDidChangeGroups() { return this.gb.event; }
        get onDidRegisterProcessSupport() { return this.hb.event; }
        get onDidChangeConnectionState() { return this.ib.event; }
        constructor(jb, kb, lb, mb, nb, ob, pb, qb, rb, sb, tb, ub, vb, wb, xb, yb, zb, Ab, Bb, Cb) {
            super();
            this.jb = jb;
            this.kb = kb;
            this.lb = lb;
            this.mb = mb;
            this.nb = nb;
            this.ob = ob;
            this.pb = pb;
            this.qb = qb;
            this.rb = rb;
            this.sb = sb;
            this.tb = tb;
            this.ub = ub;
            this.vb = vb;
            this.wb = wb;
            this.xb = xb;
            this.yb = yb;
            this.zb = zb;
            this.Ab = Ab;
            this.Bb = Bb;
            this.Cb = Cb;
            this.a = new Map();
            this.b = new Set();
            this.h = false;
            this.j = [];
            this.m = new Map();
            this.F = 0 /* TerminalConnectionState.Connecting */;
            this.G = new async_1.$2g();
            this.H = 0;
            this.J = new Map();
            this.N = this.B(new event_1.$fd());
            this.O = this.B(new event_1.$fd());
            this.P = this.B(new event_1.$fd());
            this.Q = this.B(new event_1.$fd());
            this.R = this.B(new event_1.$fd());
            this.S = this.B(new event_1.$fd());
            this.U = this.B(new event_1.$fd());
            this.W = this.B(new event_1.$fd());
            this.X = this.B(new event_1.$fd());
            this.Y = this.B(new event_1.$fd());
            this.Z = this.B(new event_1.$fd());
            this.$ = this.B(new event_1.$fd());
            this.ab = this.B(new event_1.$fd());
            this.bb = this.B(new event_1.$fd());
            this.cb = this.B(new event_1.$fd());
            this.db = this.B(new event_1.$fd());
            this.eb = this.B(new event_1.$fd());
            this.fb = this.B(new event_1.$fd());
            this.gb = this.B(new event_1.$fd());
            this.hb = this.B(new event_1.$fd());
            this.ib = this.B(new event_1.$fd());
            this.y = this.B(this.nb.createInstance(terminalConfigHelper_1.$dib));
            // the below avoids having to poll routinely.
            // we update detected profiles when an instance is created so that,
            // for example, we detect if you've installed a pwsh
            this.onDidCreateInstance(() => this.wb.refreshAvailableProfiles());
            this.Db(this.tb);
            this.Db(this.sb);
            this.tb.onDidChangeActiveGroup(this.N.fire, this.N);
            this.ub.onDidCreateInstance(instance => {
                this.Ub(instance);
                this.O.fire(instance);
            });
            // Hide the panel if there are no more instances, provided that VS Code is not shutting
            // down. When shutting down the panel is locked in place so that it is restored upon next
            // launch.
            this.tb.onDidChangeActiveInstance(instance => {
                if (!instance && !this.h) {
                    this.tb.hidePanel();
                }
                if (instance?.shellType) {
                    this.f.set(instance.shellType.toString());
                }
                else if (!instance) {
                    this.f.reset();
                }
            });
            this.Lb();
            this.f = terminalContextKey_1.TerminalContextKeys.shellType.bindTo(this.jb);
            this.n = terminalContextKey_1.TerminalContextKeys.processSupported.bindTo(this.jb);
            this.n.set(!platform_1.$o || this.ob.getConnection() !== null);
            this.u = terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated.bindTo(this.jb);
            this.w = terminalContextKey_1.TerminalContextKeys.count.bindTo(this.jb);
            this.c = terminalContextKey_1.TerminalContextKeys.terminalEditorActive.bindTo(this.jb);
            this.onDidChangeActiveInstance(instance => {
                this.c.set(!!instance?.target && instance.target === terminal_1.TerminalLocation.Editor);
            });
            kb.onBeforeShutdown(async (e) => e.veto(this.Mb(e.reason), 'veto.terminal'));
            kb.onWillShutdown(e => this.Qb(e));
            this.initializePrimaryBackend();
            // Create async as the class depends on `this`
            (0, async_1.$Hg)(0).then(() => this.B(this.nb.createInstance(TerminalEditorStyle, document.head)));
        }
        async showProfileQuickPick(type, cwd) {
            const quickPick = this.nb.createInstance(terminalProfileQuickpick_1.$rVb);
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
                    this.tb.showPanel(true);
                    this.setActiveInstance(instance);
                    return instance;
                }
            }
            return undefined;
        }
        async initializePrimaryBackend() {
            (0, performance_1.mark)('code/terminal/willGetTerminalBackend');
            this.s = await this.ub.getBackend(this.rb.remoteAuthority);
            (0, performance_1.mark)('code/terminal/didGetTerminalBackend');
            const enableTerminalReconnection = this.configHelper.config.enablePersistentSessions;
            // Connect to the extension host if it's there, set the connection state to connected when
            // it's done. This should happen even when there is no extension host.
            this.F = 0 /* TerminalConnectionState.Connecting */;
            const isPersistentRemote = !!this.rb.remoteAuthority && enableTerminalReconnection;
            this.s?.onDidRequestDetach(async (e) => {
                const instanceToDetach = this.getInstanceFromResource((0, terminalUri_1.$PVb)(e.workspaceId, e.instanceId));
                if (instanceToDetach) {
                    const persistentProcessId = instanceToDetach?.persistentProcessId;
                    if (persistentProcessId && !instanceToDetach.shellLaunchConfig.isFeatureTerminal && !instanceToDetach.shellLaunchConfig.customPtyImplementation) {
                        if (instanceToDetach.target === terminal_1.TerminalLocation.Editor) {
                            this.sb.detachInstance(instanceToDetach);
                        }
                        else {
                            this.tb.getGroupForInstance(instanceToDetach)?.removeInstance(instanceToDetach);
                        }
                        await instanceToDetach.detachProcessAndDispose(terminal_1.TerminalExitReason.User);
                        await this.s?.acceptDetachInstanceReply(e.requestId, persistentProcessId);
                    }
                    else {
                        // will get rejected without a persistentProcessId to attach to
                        await this.s?.acceptDetachInstanceReply(e.requestId, undefined);
                    }
                }
            });
            (0, performance_1.mark)('code/terminal/willReconnect');
            let reconnectedPromise;
            if (isPersistentRemote) {
                reconnectedPromise = this.Gb();
            }
            else if (enableTerminalReconnection) {
                reconnectedPromise = this.Hb();
            }
            else {
                reconnectedPromise = Promise.resolve();
            }
            reconnectedPromise.then(async () => {
                this.Fb();
                (0, performance_1.mark)('code/terminal/didReconnect');
                (0, performance_1.mark)('code/terminal/willReplay');
                const instances = await this.I?.then(groups => groups.map(e => e.terminalInstances).flat()) ?? [];
                await Promise.all(instances.map(e => new Promise(r => event_1.Event.once(e.onProcessReplayComplete)(r))));
                (0, performance_1.mark)('code/terminal/didReplay');
                (0, performance_1.mark)('code/terminal/willGetPerformanceMarks');
                await Promise.all(Array.from(this.ub.getRegisteredBackends()).map(async (backend) => {
                    this.Cb.setPerformanceMarks(backend.remoteAuthority === undefined ? 'localPtyHost' : 'remotePtyHost', await backend.getPerformanceMarks());
                    backend.setReady();
                }));
                (0, performance_1.mark)('code/terminal/didGetPerformanceMarks');
                this.G.complete();
            });
        }
        getPrimaryBackend() {
            return this.s;
        }
        Db(host) {
            host.onDidChangeInstances(this.Y.fire, this.Y);
            host.onDidDisposeInstance(this.P.fire, this.P);
            host.onDidChangeActiveInstance(instance => this.Eb(host, instance));
            host.onDidFocusInstance(instance => {
                this.Q.fire(instance);
                this.Eb(host, instance);
            });
            host.onDidChangeInstanceCapability((instance) => {
                this.X.fire(instance);
            });
            this.a.set(host, undefined);
        }
        Eb(host, instance) {
            // Track the latest active terminal for each host so that when one becomes undefined, the
            // TerminalService's active terminal is set to the last active terminal from the other host.
            // This means if the last terminal editor is closed such that it becomes undefined, the last
            // active group's terminal will be used as the active terminal if available.
            this.a.set(host, instance);
            if (instance === undefined) {
                for (const active of this.a.values()) {
                    if (active) {
                        instance = active;
                    }
                }
            }
            this.L = instance;
            this.bb.fire(instance);
        }
        setActiveInstance(value) {
            // If this was a hideFromUser terminal created by the API this was triggered by show,
            // in which case we need to create the terminal group
            if (value.shellLaunchConfig.hideFromUser) {
                this.ec(value);
            }
            if (value.target === terminal_1.TerminalLocation.Editor) {
                this.sb.setActiveInstance(value);
            }
            else {
                this.tb.setActiveInstance(value);
            }
        }
        async focusActiveInstance() {
            if (!this.L) {
                return;
            }
            if (this.L.target === terminal_1.TerminalLocation.Editor) {
                return this.sb.focusActiveInstance();
            }
            return this.tb.focusActiveInstance();
        }
        async createContributedTerminalProfile(extensionIdentifier, id, options) {
            await this.xb.activateByEvent(`onTerminalProfile:${id}`);
            const profileProvider = this.wb.getContributedProfileProvider(extensionIdentifier, id);
            if (!profileProvider) {
                this.yb.error(`No terminal profile provider registered for id "${id}"`);
                return;
            }
            try {
                await profileProvider.createContributedTerminalProfile(options);
                this.tb.setActiveInstanceByIndex(this.tb.instances.length - 1);
                await this.tb.activeInstance?.focusWhenReady();
            }
            catch (e) {
                this.yb.error(e.message);
            }
        }
        async safeDisposeTerminal(instance) {
            // Confirm on kill in the editor is handled by the editor input
            if (instance.target !== terminal_1.TerminalLocation.Editor &&
                instance.hasChildProcesses &&
                (this.configHelper.config.confirmOnKill === 'panel' || this.configHelper.config.confirmOnKill === 'always')) {
                const veto = await this.Xb(true);
                if (veto) {
                    return;
                }
            }
            return new Promise(r => {
                event_1.Event.once(instance.onExit)(() => r());
                instance.dispose(terminal_1.TerminalExitReason.User);
            });
        }
        Fb() {
            this.F = 1 /* TerminalConnectionState.Connected */;
            this.ib.fire();
            this.lb.trace('Pty host ready');
        }
        async Gb() {
            const remoteAuthority = this.rb.remoteAuthority;
            if (!remoteAuthority) {
                return;
            }
            const backend = await this.ub.getBackend(remoteAuthority);
            if (!backend) {
                return;
            }
            (0, performance_1.mark)('code/terminal/willGetTerminalLayoutInfo');
            const layoutInfo = await backend.getTerminalLayoutInfo();
            (0, performance_1.mark)('code/terminal/didGetTerminalLayoutInfo');
            backend.reduceConnectionGraceTime();
            (0, performance_1.mark)('code/terminal/willRecreateTerminalGroups');
            await this.Ib(layoutInfo);
            (0, performance_1.mark)('code/terminal/didRecreateTerminalGroups');
            // now that terminals have been restored,
            // attach listeners to update remote when terminals are changed
            this.Kb();
            this.lb.trace('Reconnected to remote terminals');
        }
        async Hb() {
            const localBackend = await this.ub.getBackend();
            if (!localBackend) {
                return;
            }
            (0, performance_1.mark)('code/terminal/willGetTerminalLayoutInfo');
            const layoutInfo = await localBackend.getTerminalLayoutInfo();
            (0, performance_1.mark)('code/terminal/didGetTerminalLayoutInfo');
            if (layoutInfo && layoutInfo.tabs.length > 0) {
                (0, performance_1.mark)('code/terminal/willRecreateTerminalGroups');
                this.I = this.Ib(layoutInfo);
                (0, performance_1.mark)('code/terminal/didRecreateTerminalGroups');
            }
            // now that terminals have been restored,
            // attach listeners to update local state when terminals are changed
            this.Kb();
            this.lb.trace('Reconnected to local terminals');
        }
        Ib(layoutInfo) {
            const groupPromises = [];
            let activeGroup;
            if (layoutInfo) {
                for (const tabLayout of layoutInfo.tabs) {
                    const terminalLayouts = tabLayout.terminals.filter(t => t.terminal && t.terminal.isOrphan);
                    if (terminalLayouts.length) {
                        this.H += terminalLayouts.length;
                        const promise = this.Jb(tabLayout, terminalLayouts);
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
                    activeGroup?.then(group => this.tb.activeGroup = group);
                }
            }
            return Promise.all(groupPromises).then(result => result.filter(e => !!e));
        }
        async Jb(tabLayout, terminalLayouts) {
            let lastInstance;
            for (const terminalLayout of terminalLayouts) {
                const attachPersistentProcess = terminalLayout.terminal;
                if (this.kb.startupKind !== 3 /* StartupKind.ReloadedWindow */ && attachPersistentProcess.type === 'Task') {
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
                const g = this.tb.getGroupForInstance(instance);
                g?.resizePanes(tabLayout.terminals.map(terminal => terminal.relativeSize));
                return g;
            });
            return group;
        }
        Kb() {
            this.onDidChangeActiveGroup(() => this.Rb());
            this.onDidChangeActiveInstance(() => this.Rb());
            this.onDidChangeInstances(() => this.Rb());
            // The state must be updated when the terminal is relaunched, otherwise the persistent
            // terminal ID will be stale and the process will be leaked.
            this.onDidReceiveProcessId(() => this.Rb());
            this.onDidChangeInstanceTitle(instance => this.Sb(instance));
            this.onDidChangeInstanceIcon(e => this.Tb(e.instance, e.userInitiated));
        }
        Lb() {
            const terminalIsOpenContext = terminalContextKey_1.TerminalContextKeys.isOpen.bindTo(this.jb);
            const updateTerminalContextKeys = () => {
                terminalIsOpenContext.set(this.instances.length > 0);
                this.w.set(this.instances.length);
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
                await this.sb.revealActiveEditor();
            }
            else {
                await this.tb.showPanel();
            }
        }
        setEditable(instance, data) {
            if (!data) {
                this.D = undefined;
            }
            else {
                this.D = { instance: instance, data };
            }
            const pane = this.pb.getActiveViewWithId(terminal_3.$tM);
            const isEditing = this.isEditable(instance);
            pane?.terminalTabbedView?.setEditable(isEditing);
        }
        isEditable(instance) {
            return !!this.D && (this.D.instance === instance || !instance);
        }
        getEditableData(instance) {
            return this.D && this.D.instance === instance ? this.D.data : undefined;
        }
        requestStartExtensionTerminal(proxy, cols, rows) {
            // The initial request came from the extension host, no need to wait for it
            return new Promise(callback => {
                this.S.fire({ proxy, cols, rows, callback });
            });
        }
        Mb(reason) {
            // Never veto on web as this would block all windows from being closed. This disables
            // process revive as we can't handle it on shutdown.
            if (platform_1.$o) {
                this.h = true;
                return false;
            }
            return this.Nb(reason);
        }
        async Nb(reason) {
            if (this.instances.length === 0) {
                // No terminal instances, don't veto
                return false;
            }
            // Persist terminal _buffer state_, note that even if this happens the dirty terminal prompt
            // still shows as that cannot be revived
            try {
                this.C = await this.z?.getWindowCount();
                const shouldReviveProcesses = this.Ob(reason);
                if (shouldReviveProcesses) {
                    // Attempt to persist the terminal state but only allow 2000ms as we can't block
                    // shutdown. This can happen when in a remote workspace but the other side has been
                    // suspended and is in the process of reconnecting, the message will be put in a
                    // queue in this case for when the connection is back up and running. Aborting the
                    // process is preferable in this case.
                    await Promise.race([
                        this.s?.persistTerminalState(),
                        (0, async_1.$Hg)(2000)
                    ]);
                }
                // Persist terminal _processes_
                const shouldPersistProcesses = this.y.config.enablePersistentSessions && reason === 3 /* ShutdownReason.RELOAD */;
                if (!shouldPersistProcesses) {
                    const hasDirtyInstances = ((this.configHelper.config.confirmOnExit === 'always' && this.instances.length > 0) ||
                        (this.configHelper.config.confirmOnExit === 'hasChildProcesses' && this.instances.some(e => e.hasChildProcesses)));
                    if (hasDirtyInstances) {
                        return this.Pb(reason);
                    }
                }
            }
            catch (err) {
                // Swallow as exceptions should not cause a veto to prevent shutdown
                this.lb.warn('Exception occurred during terminal shutdown', err);
            }
            this.h = true;
            return false;
        }
        setNativeDelegate(nativeDelegate) {
            this.z = nativeDelegate;
        }
        Ob(reason) {
            if (!this.y.config.enablePersistentSessions) {
                return false;
            }
            switch (this.configHelper.config.persistentSessionReviveProcess) {
                case 'onExit': {
                    // Allow on close if it's the last window on Windows or Linux
                    if (reason === 1 /* ShutdownReason.CLOSE */ && (this.C === 1 && !platform_1.$j)) {
                        return true;
                    }
                    return reason === 4 /* ShutdownReason.LOAD */ || reason === 2 /* ShutdownReason.QUIT */;
                }
                case 'onExitAndWindowClose': return reason !== 3 /* ShutdownReason.RELOAD */;
                default: return false;
            }
        }
        async Pb(reason) {
            // veto if configured to show confirmation and the user chose not to exit
            const veto = await this.Xb();
            if (!veto) {
                this.h = true;
            }
            return veto;
        }
        Qb(e) {
            // Don't touch processes if the shutdown was a result of reload as they will be reattached
            const shouldPersistTerminals = this.y.config.enablePersistentSessions && e.reason === 3 /* ShutdownReason.RELOAD */;
            for (const instance of [...this.tb.instances, ...this.j]) {
                if (shouldPersistTerminals && instance.shouldPersist) {
                    instance.detachProcessAndDispose(terminal_1.TerminalExitReason.Shutdown);
                }
                else {
                    instance.dispose(terminal_1.TerminalExitReason.Shutdown);
                }
            }
            // Clear terminal layout info only when not persisting
            if (!shouldPersistTerminals && !this.Ob(e.reason)) {
                this.s?.setTerminalLayoutInfo(undefined);
            }
        }
        Rb() {
            // Avoid saving state when shutting down as that would override process state to be revived
            if (this.h) {
                return;
            }
            if (!this.configHelper.config.enablePersistentSessions) {
                return;
            }
            const tabs = this.tb.groups.map(g => g.getLayoutInfo(g === this.tb.activeGroup));
            const state = { tabs };
            this.s?.setTerminalLayoutInfo(state);
        }
        Sb(instance) {
            if (!this.configHelper.config.enablePersistentSessions || !instance || !instance.persistentProcessId || !instance.title || instance.isDisposed) {
                return;
            }
            if (instance.staticTitle) {
                this.s?.updateTitle(instance.persistentProcessId, instance.staticTitle, terminal_1.TitleEventSource.Api);
            }
            else {
                this.s?.updateTitle(instance.persistentProcessId, instance.title, instance.titleSource);
            }
        }
        Tb(instance, userInitiated) {
            if (!this.configHelper.config.enablePersistentSessions || !instance || !instance.persistentProcessId || !instance.icon || instance.isDisposed) {
                return;
            }
            this.s?.updateIcon(instance.persistentProcessId, userInitiated, instance.icon, instance.color);
        }
        refreshActiveGroup() {
            this.N.fire(this.tb.activeGroup);
        }
        getInstanceFromId(terminalId) {
            let bgIndex = -1;
            this.j.forEach((terminalInstance, i) => {
                if (terminalInstance.instanceId === terminalId) {
                    bgIndex = i;
                }
            });
            if (bgIndex !== -1) {
                return this.j[bgIndex];
            }
            try {
                return this.instances[this.Wb(terminalId)];
            }
            catch {
                return undefined;
            }
        }
        getInstanceFromIndex(terminalIndex) {
            return this.instances[terminalIndex];
        }
        getInstanceFromResource(resource) {
            return (0, terminalUri_1.$RVb)(this.instances, resource);
        }
        isAttachedToTerminal(remoteTerm) {
            return this.instances.some(term => term.processId === remoteTerm.pid);
        }
        moveToEditor(source) {
            if (source.target === terminal_1.TerminalLocation.Editor) {
                return;
            }
            const sourceGroup = this.tb.getGroupForInstance(source);
            if (!sourceGroup) {
                return;
            }
            sourceGroup.removeInstance(source);
            this.sb.openEditor(source);
        }
        async moveToTerminalView(source, target, side) {
            if (uri_1.URI.isUri(source)) {
                source = this.getInstanceFromResource(source);
            }
            if (!source) {
                return;
            }
            this.sb.detachInstance(source);
            if (source.target !== terminal_1.TerminalLocation.Editor) {
                await this.tb.showPanel(true);
                return;
            }
            source.target = terminal_1.TerminalLocation.Panel;
            let group;
            if (target) {
                group = this.tb.getGroupForInstance(target);
            }
            if (!group) {
                group = this.tb.createGroup();
            }
            group.addInstance(source);
            this.setActiveInstance(source);
            await this.tb.showPanel(true);
            if (target && side) {
                const index = group.terminalInstances.indexOf(target) + (side === 'after' ? 1 : 0);
                group.moveInstance(source, index);
            }
            // Fire events
            this.Y.fire();
            this.N.fire(this.tb.activeGroup);
        }
        Ub(instance) {
            const instanceDisposables = [
                instance.onTitleChanged(this.Z.fire, this.Z),
                instance.onIconChanged(this.$.fire, this.$),
                instance.onIconChanged(this.ab.fire, this.ab),
                instance.onProcessIdReady(this.R.fire, this.R),
                instance.statusList.onDidChangePrimaryStatus(() => this.cb.fire(instance)),
                instance.onDimensionsChanged(() => {
                    this.U.fire(instance);
                    if (this.configHelper.config.enablePersistentSessions && this.isProcessSupportRegistered) {
                        this.Rb();
                    }
                }),
                instance.onMaximumDimensionsChanged(() => this.W.fire(instance)),
                instance.onDidInputData(this.db.fire, this.db),
                instance.onDidFocus(this.bb.fire, this.bb),
                instance.onRequestAddInstanceToGroup(async (e) => await this.Vb(instance, e)),
                instance.onDidChangeSelection(this.eb.fire, this.eb)
            ];
            instance.onDisposed(() => (0, lifecycle_1.$fc)(instanceDisposables));
        }
        async Vb(instance, e) {
            const terminalIdentifier = (0, terminalUri_1.$OVb)(e.uri);
            if (terminalIdentifier.instanceId === undefined) {
                return;
            }
            let sourceInstance = this.getInstanceFromResource(e.uri);
            // Terminal from a different window
            if (!sourceInstance) {
                const attachPersistentProcess = await this.s?.requestDetachInstance(terminalIdentifier.workspaceId, terminalIdentifier.instanceId);
                if (attachPersistentProcess) {
                    sourceInstance = await this.createTerminal({ config: { attachPersistentProcess }, resource: e.uri });
                    this.tb.moveInstance(sourceInstance, instance, e.side);
                    return;
                }
            }
            // View terminals
            sourceInstance = this.tb.getInstanceFromResource(e.uri);
            if (sourceInstance) {
                this.tb.moveInstance(sourceInstance, instance, e.side);
                return;
            }
            // Terminal editors
            sourceInstance = this.sb.getInstanceFromResource(e.uri);
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
            this.n.set(isSupported);
            this.hb.fire();
        }
        // TODO: Remove this, it should live in group/editor servioce
        Wb(terminalId) {
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
        async Xb(singleTerminal) {
            let message;
            if (this.instances.length === 1 || singleTerminal) {
                message = nls.localize(0, null);
            }
            else {
                message = nls.localize(1, null, this.instances.length);
            }
            const { confirmed } = await this.mb.confirm({
                type: 'warning',
                message,
                primaryButton: nls.localize(2, null)
            });
            return !confirmed;
        }
        getDefaultInstanceHost() {
            if (this.defaultLocation === terminal_1.TerminalLocation.Editor) {
                return this.sb;
            }
            return this.tb;
        }
        async getInstanceHost(location) {
            if (location) {
                if (location === terminal_1.TerminalLocation.Editor) {
                    return this.sb;
                }
                else if (typeof location === 'object') {
                    if ('viewColumn' in location) {
                        return this.sb;
                    }
                    else if ('parentTerminal' in location) {
                        return (await location.parentTerminal).target === terminal_1.TerminalLocation.Editor ? this.sb : this.tb;
                    }
                }
                else {
                    return this.tb;
                }
            }
            return this;
        }
        async createTerminal(options) {
            // Await the initialization of available profiles as long as this is not a pty terminal or a
            // local terminal in a remote workspace as profile won't be used in those cases and these
            // terminals need to be launched before remote connections are established.
            if (this.wb.availableProfiles.length === 0) {
                const isPtyTerminal = options?.config && 'customPtyImplementation' in options.config;
                const isLocalInRemoteTerminal = this.ob.getConnection() && uri_1.URI.isUri(options?.cwd) && options?.cwd.scheme === network_1.Schemas.vscodeFileResource;
                if (!isPtyTerminal && !isLocalInRemoteTerminal) {
                    if (this.F === 0 /* TerminalConnectionState.Connecting */) {
                        (0, performance_1.mark)(`code/terminal/willGetProfiles`);
                    }
                    await this.wb.profilesReady;
                    if (this.F === 0 /* TerminalConnectionState.Connecting */) {
                        (0, performance_1.mark)(`code/terminal/didGetProfiles`);
                    }
                }
            }
            const config = options?.config || this.wb.getDefaultProfile();
            const shellLaunchConfig = config && 'extensionIdentifier' in config ? {} : this.ub.convertProfileToShellLaunchConfig(config || {});
            // Get the contributed profile if it was provided
            let contributedProfile = config && 'extensionIdentifier' in config ? config : undefined;
            // Get the default profile as a contributed profile if it exists
            if (!contributedProfile && (!options || !options.config)) {
                contributedProfile = await this.wb.getContributedDefaultProfile(shellLaunchConfig);
            }
            const splitActiveTerminal = typeof options?.location === 'object' && 'splitActiveTerminal' in options.location ? options.location.splitActiveTerminal : typeof options?.location === 'object' ? 'parentTerminal' in options.location : false;
            await this.Yb(shellLaunchConfig, splitActiveTerminal, options);
            // Launch the contributed profile
            if (contributedProfile) {
                const resolvedLocation = await this.resolveLocation(options?.location);
                let location;
                if (splitActiveTerminal) {
                    location = resolvedLocation === terminal_1.TerminalLocation.Editor ? { viewColumn: editorService_1.$$C } : { splitActiveTerminal: true };
                }
                else {
                    location = typeof options?.location === 'object' && 'viewColumn' in options.location ? options.location : resolvedLocation;
                }
                await this.createContributedTerminalProfile(contributedProfile.extensionIdentifier, contributedProfile.id, {
                    icon: contributedProfile.icon,
                    color: contributedProfile.color,
                    location
                });
                const instanceHost = resolvedLocation === terminal_1.TerminalLocation.Editor ? this.sb : this.tb;
                const instance = instanceHost.instances[instanceHost.instances.length - 1];
                await instance.focusWhenReady();
                this.u.set(true);
                return instance;
            }
            if (!shellLaunchConfig.customPtyImplementation && !this.isProcessSupportRegistered) {
                throw new Error('Could not create terminal when process support is not registered');
            }
            if (shellLaunchConfig.hideFromUser) {
                const instance = this.ub.createInstance(shellLaunchConfig, terminal_1.TerminalLocation.Panel);
                this.j.push(instance);
                this.m.set(instance.instanceId, [
                    instance.onDisposed(this.P.fire, this.P)
                ]);
                this.u.set(true);
                return instance;
            }
            this.dc(shellLaunchConfig);
            const location = await this.resolveLocation(options?.location) || this.defaultLocation;
            const parent = await this.bc(options?.location);
            this.u.set(true);
            if (parent) {
                return this.Zb(shellLaunchConfig, location, parent);
            }
            return this.ac(shellLaunchConfig, location, options);
        }
        async createDetachedTerminal(options) {
            const ctor = await terminalInstance_1.$$Vb.getXtermConstructor(this.Bb, this.jb);
            const xterm = this.nb.createInstance(xtermTerminal_1.$Kib, ctor, this.y, options.cols, options.rows, options.colorProvider, options.capabilities || new terminalCapabilityStore_1.$eib(), '', undefined, false);
            if (options.readonly) {
                xterm.raw.attachCustomKeyEventHandler(() => false);
            }
            this.b.add(xterm);
            const l = xterm.onDidDispose(() => {
                this.b.delete(xterm);
                l.dispose();
            });
            return new detachedTerminal_1.$CKb(xterm, options, this.nb);
        }
        async Yb(shellLaunchConfig, splitActiveTerminal, options) {
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
                    shellLaunchConfig.cwd = await (0, terminalActions_1.$EVb)(this.configHelper, parent, this.zb.getWorkspace().folders, this.Ab);
                }
            }
        }
        Zb(shellLaunchConfig, location, parent) {
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
                instance = this.sb.splitInstance(parent, shellLaunchConfig);
            }
            else {
                const group = this.tb.getGroupForInstance(parent);
                if (!group) {
                    throw new Error(`Cannot split a terminal without a group ${parent}`);
                }
                shellLaunchConfig.parentTerminalId = parent.instanceId;
                instance = group.split(shellLaunchConfig);
            }
            this.$b(instance);
            return instance;
        }
        $b(instance) {
            if (!instance.reconnectionProperties?.ownerId) {
                return;
            }
            const reconnectedTerminals = this.J.get(instance.reconnectionProperties.ownerId);
            if (reconnectedTerminals) {
                reconnectedTerminals.push(instance);
            }
            else {
                this.J.set(instance.reconnectionProperties.ownerId, [instance]);
            }
        }
        ac(shellLaunchConfig, location, options) {
            let instance;
            const editorOptions = this.cc(options?.location);
            if (location === terminal_1.TerminalLocation.Editor) {
                instance = this.ub.createInstance(shellLaunchConfig, terminal_1.TerminalLocation.Editor);
                this.sb.openEditor(instance, editorOptions);
            }
            else {
                // TODO: pass resource?
                const group = this.tb.createGroup(shellLaunchConfig);
                instance = group.terminalInstances[0];
            }
            this.$b(instance);
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
                    return !this.L?.target ? terminal_1.TerminalLocation.Panel : this.L?.target;
                }
            }
            return location;
        }
        async bc(location) {
            if (location && typeof location === 'object' && 'parentTerminal' in location) {
                return location.parentTerminal;
            }
            else if (location && typeof location === 'object' && 'splitActiveTerminal' in location) {
                return this.activeInstance;
            }
            return undefined;
        }
        cc(location) {
            if (location && typeof location === 'object' && 'viewColumn' in location) {
                location.viewColumn = (0, editorGroupColumn_1.$4I)(this.vb, this.qb, location.viewColumn);
                return location;
            }
            return undefined;
        }
        dc(shellLaunchConfig) {
            // Add welcome message and title annotation for local terminals launched within remote or
            // virtual workspaces
            if (typeof shellLaunchConfig.cwd !== 'string' && shellLaunchConfig.cwd?.scheme === network_1.Schemas.file) {
                if (contextkeys_1.$Wcb.getValue(this.jb)) {
                    shellLaunchConfig.initialText = (0, terminalStrings_1.$zKb)(nls.localize(3, null, '\x1b[3m', '\x1b[23m'), { excludeLeadingNewLine: true, loudFormatting: true });
                    shellLaunchConfig.type = 'Local';
                }
                else if (this.ob.getConnection()) {
                    shellLaunchConfig.initialText = (0, terminalStrings_1.$zKb)(nls.localize(4, null, '\x1b[3m', '\x1b[23m'), { excludeLeadingNewLine: true, loudFormatting: true });
                    shellLaunchConfig.type = 'Local';
                }
            }
        }
        ec(instance) {
            this.j.splice(this.j.indexOf(instance), 1);
            const disposables = this.m.get(instance.instanceId);
            if (disposables) {
                (0, lifecycle_1.$fc)(disposables);
            }
            this.m.delete(instance.instanceId);
            instance.shellLaunchConfig.hideFromUser = false;
            this.tb.createGroup(instance);
            // Make active automatically if it's the first instance
            if (this.instances.length === 1) {
                this.tb.setActiveInstanceByIndex(0);
            }
            this.Y.fire();
            this.gb.fire();
        }
        async setContainers(panelContainer, terminalContainer) {
            this.y.panelContainer = panelContainer;
            this.tb.setContainer(terminalContainer);
        }
        getEditingTerminal() {
            return this.M;
        }
        setEditingTerminal(instance) {
            this.M = instance;
        }
        onInstanceEvent(getEvent) {
            return new event_1.$md(this.instances, this.onDidCreateInstance, this.onDidDisposeInstance, getEvent);
        }
        onInstanceCapabilityEvent(capabilityId, getEvent) {
            return (0, terminalEvents_1.$bWb)(this.instances, this.onDidCreateInstance, this.onDidDisposeInstance, capabilityId, getEvent);
        }
    };
    exports.$cWb = $cWb;
    __decorate([
        (0, decorators_1.$7g)(500)
    ], $cWb.prototype, "Rb", null);
    __decorate([
        (0, decorators_1.$7g)(500)
    ], $cWb.prototype, "Sb", null);
    __decorate([
        (0, decorators_1.$7g)(500)
    ], $cWb.prototype, "Tb", null);
    exports.$cWb = $cWb = __decorate([
        __param(0, contextkey_1.$3i),
        __param(1, lifecycle_2.$7y),
        __param(2, terminal_1.$Zq),
        __param(3, dialogs_1.$oA),
        __param(4, instantiation_1.$Ah),
        __param(5, remoteAgentService_1.$jm),
        __param(6, views_1.$$E),
        __param(7, configuration_1.$8h),
        __param(8, environmentService_1.$hJ),
        __param(9, terminal_2.$Nib),
        __param(10, terminal_2.$Oib),
        __param(11, terminal_2.$Pib),
        __param(12, editorGroupsService_1.$5C),
        __param(13, terminal_3.$GM),
        __param(14, extensions_1.$MF),
        __param(15, notification_1.$Yu),
        __param(16, workspace_1.$Kh),
        __param(17, commands_1.$Fr),
        __param(18, keybinding_1.$2D),
        __param(19, timerService_1.$kkb)
    ], $cWb);
    let TerminalEditorStyle = class TerminalEditorStyle extends themeService_1.$nv {
        constructor(container, b, c, f, j) {
            super(c);
            this.b = b;
            this.c = c;
            this.f = f;
            this.j = j;
            this.m();
            this.a = document.createElement('style');
            container.appendChild(this.a);
            this.B((0, lifecycle_1.$ic)(() => container.removeChild(this.a)));
            this.updateStyles();
        }
        m() {
            this.B(this.b.onDidChangeInstanceIcon(() => this.updateStyles()));
            this.B(this.b.onDidChangeInstanceColor(() => this.updateStyles()));
            this.B(this.b.onDidCreateInstance(() => this.updateStyles()));
            this.B(this.j.onDidActiveEditorChange(() => {
                if (this.j.activeEditor instanceof terminalEditorInput_1.$Zib) {
                    this.updateStyles();
                }
            }));
            this.B(this.j.onDidCloseEditor(() => {
                if (this.j.activeEditor instanceof terminalEditorInput_1.$Zib) {
                    this.updateStyles();
                }
            }));
            this.B(this.f.onDidChangeAvailableProfiles(() => this.updateStyles()));
        }
        updateStyles() {
            super.updateStyles();
            const colorTheme = this.c.getColorTheme();
            // TODO: add a rule collector to avoid duplication
            let css = '';
            const productIconTheme = this.c.getProductIconTheme();
            // Add icons
            for (const instance of this.b.instances) {
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
                const iconClasses = (0, terminalIcon_1.$Xib)(instance, colorTheme.type);
                if (uri instanceof uri_1.URI && iconClasses && iconClasses.length > 1) {
                    css += (`.monaco-workbench .terminal-tab.${iconClasses[0]}::before` +
                        `{background-image: ${dom.$nP(uri)};}`);
                }
                if (themables_1.ThemeIcon.isThemeIcon(icon)) {
                    const iconRegistry = (0, iconRegistry_1.$0u)();
                    const iconContribution = iconRegistry.getIcon(icon.id);
                    if (iconContribution) {
                        const def = productIconTheme.getIcon(iconContribution);
                        if (def) {
                            css += (`.monaco-workbench .terminal-tab.codicon-${icon.id}::before` +
                                `{content: '${def.fontCharacter}' !important; font-family: ${dom.$oP(def.font?.id ?? 'codicon')} !important;}`);
                        }
                    }
                }
            }
            // Add colors
            const iconForegroundColor = colorTheme.getColor(colorRegistry_1.$yv);
            if (iconForegroundColor) {
                css += `.monaco-workbench .show-file-icons .file-icon.terminal-tab::before { color: ${iconForegroundColor}; }`;
            }
            css += (0, terminalIcon_1.$Wib)(colorTheme, true);
            this.a.textContent = css;
        }
    };
    TerminalEditorStyle = __decorate([
        __param(1, terminal_2.$Mib),
        __param(2, themeService_1.$gv),
        __param(3, terminal_3.$GM),
        __param(4, editorService_1.$9C)
    ], TerminalEditorStyle);
});
//# sourceMappingURL=terminalService.js.map