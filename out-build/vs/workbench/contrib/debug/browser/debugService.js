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
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errorMessage", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/severity", "vs/base/common/uuid", "vs/editor/browser/editorBrowser", "vs/nls!vs/workbench/contrib/debug/browser/debugService", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/debug/common/extensionHostDebug", "vs/platform/dialogs/common/dialogs", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/quickinput/common/quickInput", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/workspace/common/workspace", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/common/views", "vs/workbench/contrib/debug/browser/debugAdapterManager", "vs/workbench/contrib/debug/browser/debugCommands", "vs/workbench/contrib/debug/browser/debugConfigurationManager", "vs/workbench/contrib/debug/browser/debugMemory", "vs/workbench/contrib/debug/browser/debugSession", "vs/workbench/contrib/debug/browser/debugTaskRunner", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugCompoundRoot", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/common/debugStorage", "vs/workbench/contrib/debug/common/debugTelemetry", "vs/workbench/contrib/debug/common/debugUtils", "vs/workbench/contrib/debug/common/debugViewModel", "vs/workbench/contrib/debug/common/disassemblyViewInput", "vs/workbench/contrib/files/common/files", "vs/workbench/services/activity/common/activity", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/panecomposite/browser/panecomposite"], function (require, exports, aria, actions_1, arrays_1, async_1, cancellation_1, errorMessage_1, errors, event_1, lifecycle_1, objects_1, severity_1, uuid_1, editorBrowser_1, nls, commands_1, configuration_1, contextkey_1, extensionHostDebug_1, dialogs_1, files_1, instantiation_1, notification_1, quickInput_1, uriIdentity_1, workspace_1, workspaceTrust_1, views_1, debugAdapterManager_1, debugCommands_1, debugConfigurationManager_1, debugMemory_1, debugSession_1, debugTaskRunner_1, debug_1, debugCompoundRoot_1, debugModel_1, debugStorage_1, debugTelemetry_1, debugUtils_1, debugViewModel_1, disassemblyViewInput_1, files_2, activity_1, editorService_1, extensions_1, layoutService_1, lifecycle_2, panecomposite_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$XRb = exports.$WRb = void 0;
    let $WRb = class $WRb {
        constructor(H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z, $) {
            this.H = H;
            this.I = I;
            this.J = J;
            this.K = K;
            this.L = L;
            this.M = M;
            this.N = N;
            this.O = O;
            this.P = P;
            this.Q = Q;
            this.R = R;
            this.S = S;
            this.T = T;
            this.U = U;
            this.V = V;
            this.W = W;
            this.X = X;
            this.Y = Y;
            this.Z = Z;
            this.$ = $;
            this.p = new lifecycle_1.$jc();
            this.A = false;
            this.D = new Map();
            this.G = false;
            this.z = new Set();
            this.a = new event_1.$fd();
            this.b = new event_1.$fd();
            this.d = new event_1.$fd();
            this.f = new event_1.$fd();
            this.o = this.R.createInstance(debugAdapterManager_1.$ORb, { onDidNewSession: this.onDidNewSession });
            this.p.add(this.o);
            this.m = this.R.createInstance(debugConfigurationManager_1.$PRb, this.o);
            this.p.add(this.m);
            this.g = this.p.add(this.R.createInstance(debugStorage_1.$FFb));
            this.F = this.g.loadChosenEnvironments();
            this.h = this.R.createInstance(debugModel_1.$YFb, this.g);
            this.j = this.R.createInstance(debugTelemetry_1.$URb, this.h);
            this.i = new debugViewModel_1.$VRb(P);
            this.k = this.R.createInstance(debugTaskRunner_1.$TRb);
            this.p.add(this.T.onDidFilesChange(e => this.rb(e)));
            this.p.add(this.Q.onWillShutdown(this.dispose, this));
            this.p.add(this.V.onAttachSession(event => {
                const session = this.h.getSession(event.sessionId, true);
                if (session) {
                    // EH was started in debug mode -> attach to it
                    session.configuration.request = 'attach';
                    session.configuration.port = event.port;
                    session.setSubId(event.subId);
                    this.ib(session);
                }
            }));
            this.p.add(this.V.onTerminateSession(event => {
                const session = this.h.getSession(event.sessionId);
                if (session && session.subId === event.subId) {
                    session.disconnect();
                }
            }));
            this.p.add(this.i.onDidFocusStackFrame(() => {
                this.eb();
            }));
            this.p.add(this.i.onDidFocusSession((session) => {
                this.eb();
                if (session) {
                    this.setExceptionBreakpointFallbackSession(session.getId());
                }
            }));
            this.p.add(event_1.Event.any(this.o.onDidRegisterDebugger, this.m.onDidSelectConfiguration)(() => {
                const debugUxValue = (this.state !== 0 /* State.Inactive */ || (this.m.getAllConfigurations().length > 0 && this.o.hasEnabledDebuggers())) ? 'default' : 'simple';
                this.v.set(debugUxValue);
                this.g.storeDebugUxState(debugUxValue);
            }));
            this.p.add(this.h.onDidChangeCallStack(() => {
                const numberOfSessions = this.h.getSessions().filter(s => !s.parentSession).length;
                this.E?.dispose();
                if (numberOfSessions > 0) {
                    const viewContainer = this.K.getViewContainerByViewId(debug_1.$mG);
                    if (viewContainer) {
                        this.E = this.W.showViewContainerActivity(viewContainer.id, { badge: new activity_1.$IV(numberOfSessions, n => n === 1 ? nls.localize(0, null) : nls.localize(1, null, n)) });
                    }
                }
            }));
            this.p.add(H.onDidActiveEditorChange(() => {
                this.P.bufferChangeEvents(() => {
                    if (H.activeEditor === disassemblyViewInput_1.$GFb.instance) {
                        this.y.set(true);
                    }
                    else {
                        // This key can be initialized a tick after this event is fired
                        this.y?.reset();
                    }
                });
            }));
            this.p.add(this.Q.onBeforeShutdown(() => {
                for (const editor of H.editors) {
                    // Editors will not be valid on window reload, so close them.
                    if (editor.resource?.scheme === debug_1.$mH) {
                        editor.dispose();
                    }
                }
            }));
            this.ab(P);
        }
        ab(contextKeyService) {
            queueMicrotask(() => {
                contextKeyService.bufferChangeEvents(() => {
                    this.q = debug_1.$sG.bindTo(contextKeyService);
                    this.r = debug_1.$uG.bindTo(contextKeyService);
                    this.w = debug_1.$xG.bindTo(contextKeyService);
                    this.u = debug_1.$yG.bindTo(contextKeyService);
                    this.v = debug_1.$wG.bindTo(contextKeyService);
                    this.v.set(this.g.loadDebugUxState());
                    this.x = debug_1.$YG.bindTo(contextKeyService);
                    // Need to set disassemblyViewFocus here to make it in the same context as the debug event handlers
                    this.y = debug_1.$dH.bindTo(contextKeyService);
                });
                const setBreakpointsExistContext = () => this.x.set(!!(this.h.getBreakpoints().length || this.h.getDataBreakpoints().length || this.h.getFunctionBreakpoints().length));
                setBreakpointsExistContext();
                this.p.add(this.h.onDidChangeBreakpoints(() => setBreakpointsExistContext()));
            });
        }
        getModel() {
            return this.h;
        }
        getViewModel() {
            return this.i;
        }
        getConfigurationManager() {
            return this.m;
        }
        getAdapterManager() {
            return this.o;
        }
        sourceIsNotAvailable(uri) {
            this.h.sourceIsNotAvailable(uri);
        }
        dispose() {
            this.p.dispose();
        }
        //---- state management
        get state() {
            const focusedSession = this.i.focusedSession;
            if (focusedSession) {
                return focusedSession.state;
            }
            return this.A ? 1 /* State.Initializing */ : 0 /* State.Inactive */;
        }
        get initializingOptions() {
            return this.B;
        }
        bb(options) {
            if (!this.A) {
                this.A = true;
                this.B = options;
                this.eb();
            }
        }
        cb() {
            if (this.A) {
                this.A = false;
                this.B = undefined;
                this.eb();
            }
        }
        db(id) {
            if (id) {
                const token = this.D.get(id);
                if (token) {
                    token.cancel();
                    this.D.delete(id);
                }
            }
            else {
                this.D.forEach(t => t.cancel());
                this.D.clear();
            }
        }
        eb() {
            const state = this.state;
            if (this.C !== state) {
                this.P.bufferChangeEvents(() => {
                    this.r.set((0, debug_1.$lH)(state));
                    this.u.set(state !== 0 /* State.Inactive */);
                    // Only show the simple ux if debug is not yet started and if no launch.json exists
                    const debugUxValue = ((state !== 0 /* State.Inactive */ && state !== 1 /* State.Initializing */) || (this.o.hasEnabledDebuggers() && this.m.selectedConfiguration.name)) ? 'default' : 'simple';
                    this.v.set(debugUxValue);
                    this.g.storeDebugUxState(debugUxValue);
                });
                this.C = state;
                this.a.fire(state);
            }
        }
        get onDidChangeState() {
            return this.a.event;
        }
        get onDidNewSession() {
            return this.b.event;
        }
        get onWillNewSession() {
            return this.d.event;
        }
        get onDidEndSession() {
            return this.f.event;
        }
        fb() {
            if (!this.G) {
                // Registering fs providers is slow
                // https://github.com/microsoft/vscode/issues/159886
                this.p.add(this.T.registerProvider(debug_1.$mH, new debugMemory_1.$QRb(this)));
                this.G = true;
            }
        }
        //---- life cycle management
        /**
         * main entry point
         * properly manages compounds, checks for errors and handles the initializing state.
         */
        async startDebugging(launch, configOrName, options, saveBeforeStart = !options?.parentSession) {
            const message = options && options.noDebug ? nls.localize(2, null) : nls.localize(3, null);
            const trust = await this.Z.requestWorkspaceTrust({ message });
            if (!trust) {
                return false;
            }
            this.fb();
            this.bb(options);
            this.w.set(true);
            try {
                // make sure to save all files and that the configuration is up to date
                await this.S.activateByEvent('onDebug');
                if (saveBeforeStart) {
                    await (0, debugUtils_1.$tF)(this.U, this.H);
                }
                await this.S.whenInstalledExtensionsRegistered();
                let config;
                let compound;
                if (!configOrName) {
                    configOrName = this.m.selectedConfiguration.name;
                }
                if (typeof configOrName === 'string' && launch) {
                    config = launch.getConfiguration(configOrName);
                    compound = launch.getCompound(configOrName);
                }
                else if (typeof configOrName !== 'string') {
                    config = configOrName;
                }
                if (compound) {
                    // we are starting a compound debug, first do some error checking and than start each configuration in the compound
                    if (!compound.configurations) {
                        throw new Error(nls.localize(4, null));
                    }
                    if (compound.preLaunchTask) {
                        const taskResult = await this.k.runTaskAndCheckErrors(launch?.workspace || this.O.getWorkspace(), compound.preLaunchTask);
                        if (taskResult === 0 /* TaskRunResult.Failure */) {
                            this.cb();
                            return false;
                        }
                    }
                    if (compound.stopAll) {
                        options = { ...options, compoundRoot: new debugCompoundRoot_1.$gF() };
                    }
                    const values = await Promise.all(compound.configurations.map(configData => {
                        const name = typeof configData === 'string' ? configData : configData.name;
                        if (name === compound.name) {
                            return Promise.resolve(false);
                        }
                        let launchForName;
                        if (typeof configData === 'string') {
                            const launchesContainingName = this.m.getLaunches().filter(l => !!l.getConfiguration(name));
                            if (launchesContainingName.length === 1) {
                                launchForName = launchesContainingName[0];
                            }
                            else if (launch && launchesContainingName.length > 1 && launchesContainingName.indexOf(launch) >= 0) {
                                // If there are multiple launches containing the configuration give priority to the configuration in the current launch
                                launchForName = launch;
                            }
                            else {
                                throw new Error(launchesContainingName.length === 0 ? nls.localize(5, null, name)
                                    : nls.localize(6, null, name));
                            }
                        }
                        else if (configData.folder) {
                            const launchesMatchingConfigData = this.m.getLaunches().filter(l => l.workspace && l.workspace.name === configData.folder && !!l.getConfiguration(configData.name));
                            if (launchesMatchingConfigData.length === 1) {
                                launchForName = launchesMatchingConfigData[0];
                            }
                            else {
                                throw new Error(nls.localize(7, null, configData.folder, configData.name, compound.name));
                            }
                        }
                        return this.gb(launchForName, launchForName.getConfiguration(name), options);
                    }));
                    const result = values.every(success => !!success); // Compound launch is a success only if each configuration launched successfully
                    this.cb();
                    return result;
                }
                if (configOrName && !config) {
                    const message = !!launch ? nls.localize(8, null, typeof configOrName === 'string' ? configOrName : configOrName.name) :
                        nls.localize(9, null);
                    throw new Error(message);
                }
                const result = await this.gb(launch, config, options);
                this.cb();
                return result;
            }
            catch (err) {
                // make sure to get out of initializing state, and propagate the result
                this.L.error(err);
                this.cb();
                return Promise.reject(err);
            }
        }
        /**
         * gets the debugger for the type, resolves configurations by providers, substitutes variables and runs prelaunch tasks
         */
        async gb(launch, config, options) {
            // We keep the debug type in a separate variable 'type' so that a no-folder config has no attributes.
            // Storing the type in the config would break extensions that assume that the no-folder case is indicated by an empty config.
            let type;
            if (config) {
                type = config.type;
            }
            else {
                // a no-folder workspace has no launch.config
                config = Object.create(null);
            }
            if (options && options.noDebug) {
                config.noDebug = true;
            }
            else if (options && typeof options.noDebug === 'undefined' && options.parentSession && options.parentSession.configuration.noDebug) {
                config.noDebug = true;
            }
            const unresolvedConfig = (0, objects_1.$Vm)(config);
            let guess;
            let activeEditor;
            if (!type) {
                activeEditor = this.H.activeEditor;
                if (activeEditor && activeEditor.resource) {
                    type = this.F[activeEditor.resource.toString()];
                }
                if (!type) {
                    guess = await this.o.guessDebugger(false);
                    if (guess) {
                        type = guess.type;
                    }
                }
            }
            const initCancellationToken = new cancellation_1.$pd();
            const sessionId = (0, uuid_1.$4f)();
            this.D.set(sessionId, initCancellationToken);
            const configByProviders = await this.m.resolveConfigurationByProviders(launch && launch.workspace ? launch.workspace.uri : undefined, type, config, initCancellationToken.token);
            // a falsy config indicates an aborted launch
            if (configByProviders && configByProviders.type) {
                try {
                    let resolvedConfig = await this.kb(launch, configByProviders);
                    if (!resolvedConfig) {
                        // User cancelled resolving of interactive variables, silently return
                        return false;
                    }
                    if (initCancellationToken.token.isCancellationRequested) {
                        // User cancelled, silently return
                        return false;
                    }
                    const workspace = launch?.workspace || this.O.getWorkspace();
                    const taskResult = await this.k.runTaskAndCheckErrors(workspace, resolvedConfig.preLaunchTask);
                    if (taskResult === 0 /* TaskRunResult.Failure */) {
                        return false;
                    }
                    const cfg = await this.m.resolveDebugConfigurationWithSubstitutedVariables(launch && launch.workspace ? launch.workspace.uri : undefined, type, resolvedConfig, initCancellationToken.token);
                    if (!cfg) {
                        if (launch && type && cfg === null && !initCancellationToken.token.isCancellationRequested) { // show launch.json only for "config" being "null".
                            await launch.openConfigFile({ preserveFocus: true, type }, initCancellationToken.token);
                        }
                        return false;
                    }
                    resolvedConfig = cfg;
                    const dbg = this.o.getDebugger(resolvedConfig.type);
                    if (!dbg || (configByProviders.request !== 'attach' && configByProviders.request !== 'launch')) {
                        let message;
                        if (configByProviders.request !== 'attach' && configByProviders.request !== 'launch') {
                            message = configByProviders.request ? nls.localize(10, null, 'request', configByProviders.request)
                                : nls.localize(11, null, 'request');
                        }
                        else {
                            message = resolvedConfig.type ? nls.localize(12, null, resolvedConfig.type) :
                                nls.localize(13, null);
                        }
                        const actionList = [];
                        actionList.push(new actions_1.$gi('installAdditionalDebuggers', nls.localize(14, null, resolvedConfig.type), undefined, true, async () => this.X.executeCommand('debug.installAdditionalDebuggers', resolvedConfig?.type)));
                        await this.lb(message, actionList);
                        return false;
                    }
                    if (!dbg.enabled) {
                        await this.lb((0, debug_1.$gH)(dbg.type), []);
                        return false;
                    }
                    const result = await this.hb(sessionId, launch?.workspace, { resolved: resolvedConfig, unresolved: unresolvedConfig }, options);
                    if (result && guess && activeEditor && activeEditor.resource) {
                        // Remeber user choice of environment per active editor to make starting debugging smoother #124770
                        this.F[activeEditor.resource.toString()] = guess.type;
                        this.g.storeChosenEnvironments(this.F);
                    }
                    return result;
                }
                catch (err) {
                    if (err && err.message) {
                        await this.lb(err.message);
                    }
                    else if (this.O.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
                        await this.lb(nls.localize(15, null));
                    }
                    if (launch && !initCancellationToken.token.isCancellationRequested) {
                        await launch.openConfigFile({ preserveFocus: true }, initCancellationToken.token);
                    }
                    return false;
                }
            }
            if (launch && type && configByProviders === null && !initCancellationToken.token.isCancellationRequested) { // show launch.json only for "config" being "null".
                await launch.openConfigFile({ preserveFocus: true, type }, initCancellationToken.token);
            }
            return false;
        }
        /**
         * instantiates the new session, initializes the session, registers session listeners and reports telemetry
         */
        async hb(sessionId, root, configuration, options) {
            const session = this.R.createInstance(debugSession_1.$SRb, sessionId, configuration, root, this.h, options);
            if (options?.startedByUser && this.h.getSessions().some(s => s.getLabel() === session.getLabel()) && configuration.resolved.suppressMultipleSessionWarning !== true) {
                // There is already a session with the same name, prompt user #127721
                const result = await this.M.confirm({ message: nls.localize(16, null, session.getLabel()) });
                if (!result.confirmed) {
                    return false;
                }
            }
            this.h.addSession(session);
            // register listeners as the very first thing!
            this.jb(session);
            // since the Session is now properly registered under its ID and hooked, we can announce it
            // this event doesn't go to extensions
            this.d.fire(session);
            const openDebug = this.U.getValue('debug').openDebug;
            // Open debug viewlet based on the visibility of the side bar and openDebug setting. Do not open for 'run without debug'
            if (!configuration.resolved.noDebug && (openDebug === 'openOnSessionStart' || (openDebug !== 'neverOpen' && this.i.firstSessionStart)) && !session.suppressDebugView) {
                await this.I.openPaneComposite(debug_1.$jG, 0 /* ViewContainerLocation.Sidebar */);
            }
            try {
                await this.ib(session);
                const internalConsoleOptions = session.configuration.internalConsoleOptions || this.U.getValue('debug').internalConsoleOptions;
                if (internalConsoleOptions === 'openOnSessionStart' || (this.i.firstSessionStart && internalConsoleOptions === 'openOnFirstSessionStart')) {
                    this.J.openView(debug_1.$rG, false);
                }
                this.i.firstSessionStart = false;
                const showSubSessions = this.U.getValue('debug').showSubSessionsInToolBar;
                const sessions = this.h.getSessions();
                const shownSessions = showSubSessions ? sessions : sessions.filter(s => !s.parentSession);
                if (shownSessions.length > 1) {
                    this.i.setMultiSessionView(true);
                }
                // since the initialized response has arrived announce the new Session (including extensions)
                this.b.fire(session);
                return true;
            }
            catch (error) {
                if (errors.$2(error)) {
                    // don't show 'canceled' error messages to the user #7906
                    return false;
                }
                // Show the repl if some error got logged there #5870
                if (session && session.getReplElements().length > 0) {
                    this.J.openView(debug_1.$rG, false);
                }
                if (session.configuration && session.configuration.request === 'attach' && session.configuration.__autoAttach) {
                    // ignore attach timeouts in auto attach mode
                    return false;
                }
                const errorMessage = error instanceof Error ? error.message : error;
                if (error.showUser !== false) {
                    // Only show the error when showUser is either not defined, or is true #128484
                    await this.lb(errorMessage, (0, errorMessage_1.$ni)(error) ? error.actions : []);
                }
                return false;
            }
        }
        async ib(session, forceFocus = false) {
            const dbgr = this.o.getDebugger(session.configuration.type);
            try {
                await session.initialize(dbgr);
                await session.launchOrAttach(session.configuration);
                const launchJsonExists = !!session.root && !!this.U.getValue('launch', { resource: session.root.uri });
                await this.j.logDebugSessionStart(dbgr, launchJsonExists);
                if (forceFocus || !this.i.focusedSession || (session.parentSession === this.i.focusedSession && session.compact)) {
                    await this.focusStackFrame(undefined, undefined, session);
                }
            }
            catch (err) {
                if (this.i.focusedSession === session) {
                    await this.focusStackFrame(undefined);
                }
                return Promise.reject(err);
            }
        }
        jb(session) {
            const sessionRunningScheduler = new async_1.$Sg(() => {
                // Do not immediatly defocus the stack frame if the session is running
                if (session.state === 3 /* State.Running */ && this.i.focusedSession === session) {
                    this.i.setFocus(undefined, this.i.focusedThread, session, false);
                }
            }, 200);
            this.p.add(session.onDidChangeState(() => {
                if (session.state === 3 /* State.Running */ && this.i.focusedSession === session) {
                    sessionRunningScheduler.schedule();
                }
                if (session === this.i.focusedSession) {
                    this.eb();
                }
            }));
            this.p.add(session.onDidEndAdapter(async (adapterExitEvent) => {
                if (adapterExitEvent) {
                    if (adapterExitEvent.error) {
                        this.L.error(nls.localize(17, null, adapterExitEvent.error.message || adapterExitEvent.error.toString()));
                    }
                    this.j.logDebugSessionStop(session, adapterExitEvent);
                }
                // 'Run without debugging' mode VSCode must terminate the extension host. More details: #3905
                const extensionDebugSession = (0, debugUtils_1.$lF)(session);
                if (extensionDebugSession && extensionDebugSession.state === 3 /* State.Running */ && extensionDebugSession.configuration.noDebug) {
                    this.V.close(extensionDebugSession.getId());
                }
                if (session.configuration.postDebugTask) {
                    const root = session.root ?? this.O.getWorkspace();
                    try {
                        await this.k.runTask(root, session.configuration.postDebugTask);
                    }
                    catch (err) {
                        this.L.error(err);
                    }
                }
                this.cb();
                this.db(session.getId());
                this.f.fire(session);
                const focusedSession = this.i.focusedSession;
                if (focusedSession && focusedSession.getId() === session.getId()) {
                    const { session, thread, stackFrame } = $XRb(this.h, undefined, undefined, undefined, focusedSession);
                    this.i.setFocus(stackFrame, thread, session, false);
                }
                if (this.h.getSessions().length === 0) {
                    this.i.setMultiSessionView(false);
                    if (this.N.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */) && this.U.getValue('debug').openExplorerOnEnd) {
                        this.I.openPaneComposite(files_2.$Mdb, 0 /* ViewContainerLocation.Sidebar */);
                    }
                    // Data breakpoints that can not be persisted should be cleared when a session ends
                    const dataBreakpoints = this.h.getDataBreakpoints().filter(dbp => !dbp.canPersist);
                    dataBreakpoints.forEach(dbp => this.h.removeDataBreakpoints(dbp.getId()));
                    if (this.U.getValue('debug').console.closeOnEnd) {
                        const debugConsoleContainer = this.K.getViewContainerByViewId(debug_1.$rG);
                        if (debugConsoleContainer && this.J.isViewContainerVisible(debugConsoleContainer.id)) {
                            this.J.closeViewContainer(debugConsoleContainer.id);
                        }
                    }
                }
                this.h.removeExceptionBreakpointsForSession(session.getId());
                // session.dispose(); TODO@roblourens
            }));
        }
        async restartSession(session, restartData) {
            if (session.saveBeforeRestart) {
                await (0, debugUtils_1.$tF)(this.U, this.H);
            }
            const isAutoRestart = !!restartData;
            const runTasks = async () => {
                if (isAutoRestart) {
                    // Do not run preLaunch and postDebug tasks for automatic restarts
                    return Promise.resolve(1 /* TaskRunResult.Success */);
                }
                const root = session.root || this.O.getWorkspace();
                await this.k.runTask(root, session.configuration.preRestartTask);
                await this.k.runTask(root, session.configuration.postDebugTask);
                const taskResult1 = await this.k.runTaskAndCheckErrors(root, session.configuration.preLaunchTask);
                if (taskResult1 !== 1 /* TaskRunResult.Success */) {
                    return taskResult1;
                }
                return this.k.runTaskAndCheckErrors(root, session.configuration.postRestartTask);
            };
            const extensionDebugSession = (0, debugUtils_1.$lF)(session);
            if (extensionDebugSession) {
                const taskResult = await runTasks();
                if (taskResult === 1 /* TaskRunResult.Success */) {
                    this.V.reload(extensionDebugSession.getId());
                }
                return;
            }
            // Read the configuration again if a launch.json has been changed, if not just use the inmemory configuration
            let needsToSubstitute = false;
            let unresolved;
            const launch = session.root ? this.m.getLaunch(session.root.uri) : undefined;
            if (launch) {
                unresolved = launch.getConfiguration(session.configuration.name);
                if (unresolved && !(0, objects_1.$Zm)(unresolved, session.unresolvedConfiguration)) {
                    // Take the type from the session since the debug extension might overwrite it #21316
                    unresolved.type = session.configuration.type;
                    unresolved.noDebug = session.configuration.noDebug;
                    needsToSubstitute = true;
                }
            }
            let resolved = session.configuration;
            if (launch && needsToSubstitute && unresolved) {
                const initCancellationToken = new cancellation_1.$pd();
                this.D.set(session.getId(), initCancellationToken);
                const resolvedByProviders = await this.m.resolveConfigurationByProviders(launch.workspace ? launch.workspace.uri : undefined, unresolved.type, unresolved, initCancellationToken.token);
                if (resolvedByProviders) {
                    resolved = await this.kb(launch, resolvedByProviders);
                    if (resolved && !initCancellationToken.token.isCancellationRequested) {
                        resolved = await this.m.resolveDebugConfigurationWithSubstitutedVariables(launch && launch.workspace ? launch.workspace.uri : undefined, unresolved.type, resolved, initCancellationToken.token);
                    }
                }
                else {
                    resolved = resolvedByProviders;
                }
            }
            if (resolved) {
                session.setConfiguration({ resolved, unresolved });
            }
            session.configuration.__restart = restartData;
            if (session.capabilities.supportsRestartRequest) {
                const taskResult = await runTasks();
                if (taskResult === 1 /* TaskRunResult.Success */) {
                    await session.restart();
                }
                return;
            }
            const shouldFocus = !!this.i.focusedSession && session.getId() === this.i.focusedSession.getId();
            // If the restart is automatic  -> disconnect, otherwise -> terminate #55064
            if (isAutoRestart) {
                await session.disconnect(true);
            }
            else {
                await session.terminate(true);
            }
            return new Promise((c, e) => {
                setTimeout(async () => {
                    const taskResult = await runTasks();
                    if (taskResult !== 1 /* TaskRunResult.Success */) {
                        return;
                    }
                    if (!resolved) {
                        return c(undefined);
                    }
                    try {
                        await this.ib(session, shouldFocus);
                        this.b.fire(session);
                        c(undefined);
                    }
                    catch (error) {
                        e(error);
                    }
                }, 300);
            });
        }
        async stopSession(session, disconnect = false, suspend = false) {
            if (session) {
                return disconnect ? session.disconnect(undefined, suspend) : session.terminate();
            }
            const sessions = this.h.getSessions();
            if (sessions.length === 0) {
                this.k.cancel();
                // User might have cancelled starting of a debug session, and in some cases the quick pick is left open
                await this.Y.cancel();
                this.cb();
                this.db(undefined);
            }
            return Promise.all(sessions.map(s => disconnect ? s.disconnect(undefined, suspend) : s.terminate()));
        }
        async kb(launch, config) {
            const dbg = this.o.getDebugger(config.type);
            if (dbg) {
                let folder = undefined;
                if (launch && launch.workspace) {
                    folder = launch.workspace;
                }
                else {
                    const folders = this.O.getWorkspace().folders;
                    if (folders.length === 1) {
                        folder = folders[0];
                    }
                }
                try {
                    return await dbg.substituteVariables(folder, config);
                }
                catch (err) {
                    this.lb(err.message, undefined, !!launch?.getConfiguration(config.name));
                    return undefined; // bail out
                }
            }
            return Promise.resolve(config);
        }
        async lb(message, errorActions = [], promptLaunchJson = true) {
            const configureAction = new actions_1.$gi(debugCommands_1.$AQb, debugCommands_1.$1Qb, undefined, true, () => this.X.executeCommand(debugCommands_1.$AQb));
            // Don't append the standard command if id of any provided action indicates it is a command
            const actions = errorActions.filter((action) => action.id.endsWith('.command')).length > 0 ?
                errorActions :
                [...errorActions, ...(promptLaunchJson ? [configureAction] : [])];
            await this.M.prompt({
                type: severity_1.default.Error,
                message,
                buttons: actions.map(action => ({
                    label: action.label,
                    run: () => action.run()
                })),
                cancelButton: true
            });
        }
        //---- focus management
        async focusStackFrame(_stackFrame, _thread, _session, options) {
            const { stackFrame, thread, session } = $XRb(this.h, _stackFrame, _thread, _session);
            if (stackFrame) {
                const editor = await stackFrame.openInEditor(this.H, options?.preserveFocus ?? true, options?.sideBySide, options?.pinned);
                if (editor) {
                    if (editor.input === disassemblyViewInput_1.$GFb.instance) {
                        // Go to address is invoked via setFocus
                    }
                    else {
                        const control = editor.getControl();
                        if (stackFrame && (0, editorBrowser_1.$iV)(control) && control.hasModel()) {
                            const model = control.getModel();
                            const lineNumber = stackFrame.range.startLineNumber;
                            if (lineNumber >= 1 && lineNumber <= model.getLineCount()) {
                                const lineContent = control.getModel().getLineContent(lineNumber);
                                aria.$$P(nls.localize(18, null, lineContent, thread && thread.stoppedDetails ? `, reason ${thread.stoppedDetails.reason}` : '', stackFrame.source ? stackFrame.source.name : '', stackFrame.range.startLineNumber));
                            }
                        }
                    }
                }
            }
            if (session) {
                this.q.set(session.configuration.type);
            }
            else {
                this.q.reset();
            }
            this.i.setFocus(stackFrame, thread, session, !!options?.explicit);
        }
        //---- watches
        addWatchExpression(name) {
            const we = this.h.addWatchExpression(name);
            if (!name) {
                this.i.setSelectedExpression(we, false);
            }
            this.g.storeWatchExpressions(this.h.getWatchExpressions());
        }
        renameWatchExpression(id, newName) {
            this.h.renameWatchExpression(id, newName);
            this.g.storeWatchExpressions(this.h.getWatchExpressions());
        }
        moveWatchExpression(id, position) {
            this.h.moveWatchExpression(id, position);
            this.g.storeWatchExpressions(this.h.getWatchExpressions());
        }
        removeWatchExpressions(id) {
            this.h.removeWatchExpressions(id);
            this.g.storeWatchExpressions(this.h.getWatchExpressions());
        }
        //---- breakpoints
        canSetBreakpointsIn(model) {
            return this.o.canSetBreakpointsIn(model);
        }
        async enableOrDisableBreakpoints(enable, breakpoint) {
            if (breakpoint) {
                this.h.setEnablement(breakpoint, enable);
                this.g.storeBreakpoints(this.h);
                if (breakpoint instanceof debugModel_1.$SFb) {
                    await this.mb(breakpoint.originalUri);
                }
                else if (breakpoint instanceof debugModel_1.$TFb) {
                    await this.nb();
                }
                else if (breakpoint instanceof debugModel_1.$UFb) {
                    await this.ob();
                }
                else if (breakpoint instanceof debugModel_1.$WFb) {
                    await this.pb();
                }
                else {
                    await this.qb();
                }
            }
            else {
                this.h.enableOrDisableAllBreakpoints(enable);
                this.g.storeBreakpoints(this.h);
                await this.sendAllBreakpoints();
            }
            this.g.storeBreakpoints(this.h);
        }
        async addBreakpoints(uri, rawBreakpoints, ariaAnnounce = true) {
            const breakpoints = this.h.addBreakpoints(uri, rawBreakpoints);
            if (ariaAnnounce) {
                breakpoints.forEach(bp => aria.$_P(nls.localize(19, null, bp.lineNumber, uri.fsPath)));
            }
            // In some cases we need to store breakpoints before we send them because sending them can take a long time
            // And after sending them because the debug adapter can attach adapter data to a breakpoint
            this.g.storeBreakpoints(this.h);
            await this.mb(uri);
            this.g.storeBreakpoints(this.h);
            return breakpoints;
        }
        async updateBreakpoints(uri, data, sendOnResourceSaved) {
            this.h.updateBreakpoints(data);
            this.g.storeBreakpoints(this.h);
            if (sendOnResourceSaved) {
                this.z.add(uri);
            }
            else {
                await this.mb(uri);
                this.g.storeBreakpoints(this.h);
            }
        }
        async removeBreakpoints(id) {
            const toRemove = this.h.getBreakpoints().filter(bp => !id || bp.getId() === id);
            // note: using the debugger-resolved uri for aria to reflect UI state
            toRemove.forEach(bp => aria.$_P(nls.localize(20, null, bp.lineNumber, bp.uri.fsPath)));
            const urisToClear = (0, arrays_1.$Kb)(toRemove, bp => bp.originalUri.toString()).map(bp => bp.originalUri);
            this.h.removeBreakpoints(toRemove);
            this.g.storeBreakpoints(this.h);
            await Promise.all(urisToClear.map(uri => this.mb(uri)));
        }
        setBreakpointsActivated(activated) {
            this.h.setBreakpointsActivated(activated);
            return this.sendAllBreakpoints();
        }
        addFunctionBreakpoint(name, id) {
            this.h.addFunctionBreakpoint(name || '', id);
        }
        async updateFunctionBreakpoint(id, update) {
            this.h.updateFunctionBreakpoint(id, update);
            this.g.storeBreakpoints(this.h);
            await this.nb();
        }
        async removeFunctionBreakpoints(id) {
            this.h.removeFunctionBreakpoints(id);
            this.g.storeBreakpoints(this.h);
            await this.nb();
        }
        async addDataBreakpoint(label, dataId, canPersist, accessTypes, accessType) {
            this.h.addDataBreakpoint(label, dataId, canPersist, accessTypes, accessType);
            this.g.storeBreakpoints(this.h);
            await this.ob();
            this.g.storeBreakpoints(this.h);
        }
        async removeDataBreakpoints(id) {
            this.h.removeDataBreakpoints(id);
            this.g.storeBreakpoints(this.h);
            await this.ob();
        }
        async addInstructionBreakpoint(instructionReference, offset, address, condition, hitCondition) {
            this.h.addInstructionBreakpoint(instructionReference, offset, address, condition, hitCondition);
            this.g.storeBreakpoints(this.h);
            await this.pb();
            this.g.storeBreakpoints(this.h);
        }
        async removeInstructionBreakpoints(instructionReference, offset) {
            this.h.removeInstructionBreakpoints(instructionReference, offset);
            this.g.storeBreakpoints(this.h);
            await this.pb();
        }
        setExceptionBreakpointFallbackSession(sessionId) {
            this.h.setExceptionBreakpointFallbackSession(sessionId);
            this.g.storeBreakpoints(this.h);
        }
        setExceptionBreakpointsForSession(session, data) {
            this.h.setExceptionBreakpointsForSession(session.getId(), data);
            this.g.storeBreakpoints(this.h);
        }
        async setExceptionBreakpointCondition(exceptionBreakpoint, condition) {
            this.h.setExceptionBreakpointCondition(exceptionBreakpoint, condition);
            this.g.storeBreakpoints(this.h);
            await this.qb();
        }
        async sendAllBreakpoints(session) {
            const setBreakpointsPromises = (0, arrays_1.$Kb)(this.h.getBreakpoints(), bp => bp.originalUri.toString())
                .map(bp => this.mb(bp.originalUri, false, session));
            // If sending breakpoints to one session which we know supports the configurationDone request, can make all requests in parallel
            if (session?.capabilities.supportsConfigurationDoneRequest) {
                await Promise.all([
                    ...setBreakpointsPromises,
                    this.nb(session),
                    this.ob(session),
                    this.pb(session),
                    this.qb(session),
                ]);
            }
            else {
                await Promise.all(setBreakpointsPromises);
                await this.nb(session);
                await this.ob(session);
                await this.pb(session);
                // send exception breakpoints at the end since some debug adapters may rely on the order - this was the case before
                // the configurationDone request was introduced.
                await this.qb(session);
            }
        }
        async mb(modelUri, sourceModified = false, session) {
            const breakpointsToSend = this.h.getBreakpoints({ originalUri: modelUri, enabledOnly: true });
            await sendToOneOrAllSessions(this.h, session, async (s) => {
                if (!s.configuration.noDebug) {
                    await s.sendBreakpoints(modelUri, breakpointsToSend, sourceModified);
                }
            });
        }
        async nb(session) {
            const breakpointsToSend = this.h.getFunctionBreakpoints().filter(fbp => fbp.enabled && this.h.areBreakpointsActivated());
            await sendToOneOrAllSessions(this.h, session, async (s) => {
                if (s.capabilities.supportsFunctionBreakpoints && !s.configuration.noDebug) {
                    await s.sendFunctionBreakpoints(breakpointsToSend);
                }
            });
        }
        async ob(session) {
            const breakpointsToSend = this.h.getDataBreakpoints().filter(fbp => fbp.enabled && this.h.areBreakpointsActivated());
            await sendToOneOrAllSessions(this.h, session, async (s) => {
                if (s.capabilities.supportsDataBreakpoints && !s.configuration.noDebug) {
                    await s.sendDataBreakpoints(breakpointsToSend);
                }
            });
        }
        async pb(session) {
            const breakpointsToSend = this.h.getInstructionBreakpoints().filter(fbp => fbp.enabled && this.h.areBreakpointsActivated());
            await sendToOneOrAllSessions(this.h, session, async (s) => {
                if (s.capabilities.supportsInstructionBreakpoints && !s.configuration.noDebug) {
                    await s.sendInstructionBreakpoints(breakpointsToSend);
                }
            });
        }
        qb(session) {
            return sendToOneOrAllSessions(this.h, session, async (s) => {
                const enabledExceptionBps = this.h.getExceptionBreakpointsForSession(s.getId()).filter(exb => exb.enabled);
                if (s.capabilities.supportsConfigurationDoneRequest && (!s.capabilities.exceptionBreakpointFilters || s.capabilities.exceptionBreakpointFilters.length === 0)) {
                    // Only call `setExceptionBreakpoints` as specified in dap protocol #90001
                    return;
                }
                if (!s.configuration.noDebug) {
                    await s.sendExceptionBreakpoints(enabledExceptionBps);
                }
            });
        }
        rb(fileChangesEvent) {
            const toRemove = this.h.getBreakpoints().filter(bp => fileChangesEvent.contains(bp.originalUri, 2 /* FileChangeType.DELETED */));
            if (toRemove.length) {
                this.h.removeBreakpoints(toRemove);
            }
            const toSend = [];
            for (const uri of this.z) {
                if (fileChangesEvent.contains(uri, 0 /* FileChangeType.UPDATED */)) {
                    toSend.push(uri);
                }
            }
            for (const uri of toSend) {
                this.z.delete(uri);
                this.mb(uri, true);
            }
        }
        async runTo(uri, lineNumber, column) {
            let breakpointToRemove;
            let threadToContinue = this.getViewModel().focusedThread;
            const addTempBreakPoint = async () => {
                const bpExists = !!(this.getModel().getBreakpoints({ column, lineNumber, uri }).length);
                if (!bpExists) {
                    const addResult = await this.sb(uri, lineNumber, column);
                    if (addResult.thread) {
                        threadToContinue = addResult.thread;
                    }
                    if (addResult.breakpoint) {
                        breakpointToRemove = addResult.breakpoint;
                    }
                }
                return { threadToContinue, breakpointToRemove };
            };
            const removeTempBreakPoint = (state) => {
                if (state === 2 /* State.Stopped */ || state === 0 /* State.Inactive */) {
                    if (breakpointToRemove) {
                        this.removeBreakpoints(breakpointToRemove.getId());
                    }
                    return true;
                }
                return false;
            };
            await addTempBreakPoint();
            if (this.state === 0 /* State.Inactive */) {
                // If no session exists start the debugger
                const { launch, name, getConfig } = this.getConfigurationManager().selectedConfiguration;
                const config = await getConfig();
                const configOrName = config ? Object.assign((0, objects_1.$Vm)(config), {}) : name;
                const listener = this.onDidChangeState(state => {
                    if (removeTempBreakPoint(state)) {
                        listener.dispose();
                    }
                });
                await this.startDebugging(launch, configOrName, undefined, true);
            }
            if (this.state === 2 /* State.Stopped */) {
                const focusedSession = this.getViewModel().focusedSession;
                if (!focusedSession || !threadToContinue) {
                    return;
                }
                const listener = threadToContinue.session.onDidChangeState(() => {
                    if (removeTempBreakPoint(focusedSession.state)) {
                        listener.dispose();
                    }
                });
                await threadToContinue.continue();
            }
        }
        async sb(uri, lineNumber, column) {
            const debugModel = this.getModel();
            const viewModel = this.getViewModel();
            const breakpoints = await this.addBreakpoints(uri, [{ lineNumber, column }], false);
            const breakpoint = breakpoints?.[0];
            if (!breakpoint) {
                return { breakpoint: undefined, thread: viewModel.focusedThread };
            }
            // If the breakpoint was not initially verified, wait up to 2s for it to become so.
            // Inherently racey if multiple sessions can verify async, but not solvable...
            if (!breakpoint.verified) {
                let listener;
                await (0, async_1.$yg)(new Promise(resolve => {
                    listener = debugModel.onDidChangeBreakpoints(() => {
                        if (breakpoint.verified) {
                            resolve();
                        }
                    });
                }), 2000);
                listener.dispose();
            }
            // Look at paused threads for sessions that verified this bp. Prefer, in order:
            let Score;
            (function (Score) {
                /** The focused thread */
                Score[Score["Focused"] = 0] = "Focused";
                /** Any other stopped thread of a session that verified the bp */
                Score[Score["Verified"] = 1] = "Verified";
                /** Any thread that verified and paused in the same file */
                Score[Score["VerifiedAndPausedInFile"] = 2] = "VerifiedAndPausedInFile";
                /** The focused thread if it verified the breakpoint */
                Score[Score["VerifiedAndFocused"] = 3] = "VerifiedAndFocused";
            })(Score || (Score = {}));
            let bestThread = viewModel.focusedThread;
            let bestScore = 0 /* Score.Focused */;
            for (const sessionId of breakpoint.sessionsThatVerified) {
                const session = debugModel.getSession(sessionId);
                if (!session) {
                    continue;
                }
                const threads = session.getAllThreads().filter(t => t.stopped);
                if (bestScore < 3 /* Score.VerifiedAndFocused */) {
                    if (viewModel.focusedThread && threads.includes(viewModel.focusedThread)) {
                        bestThread = viewModel.focusedThread;
                        bestScore = 3 /* Score.VerifiedAndFocused */;
                    }
                }
                if (bestScore < 2 /* Score.VerifiedAndPausedInFile */) {
                    const pausedInThisFile = threads.find(t => {
                        const top = t.getTopStackFrame();
                        return top && this.$.extUri.isEqual(top.source.uri, uri);
                    });
                    if (pausedInThisFile) {
                        bestThread = pausedInThisFile;
                        bestScore = 2 /* Score.VerifiedAndPausedInFile */;
                    }
                }
                if (bestScore < 1 /* Score.Verified */) {
                    bestThread = threads[0];
                    bestScore = 2 /* Score.VerifiedAndPausedInFile */;
                }
            }
            return { thread: bestThread, breakpoint };
        }
    };
    exports.$WRb = $WRb;
    exports.$WRb = $WRb = __decorate([
        __param(0, editorService_1.$9C),
        __param(1, panecomposite_1.$Yeb),
        __param(2, views_1.$$E),
        __param(3, views_1.$_E),
        __param(4, notification_1.$Yu),
        __param(5, dialogs_1.$oA),
        __param(6, layoutService_1.$Meb),
        __param(7, workspace_1.$Kh),
        __param(8, contextkey_1.$3i),
        __param(9, lifecycle_2.$7y),
        __param(10, instantiation_1.$Ah),
        __param(11, extensions_1.$MF),
        __param(12, files_1.$6j),
        __param(13, configuration_1.$8h),
        __param(14, extensionHostDebug_1.$An),
        __param(15, activity_1.$HV),
        __param(16, commands_1.$Fr),
        __param(17, quickInput_1.$Gq),
        __param(18, workspaceTrust_1.$_z),
        __param(19, uriIdentity_1.$Ck)
    ], $WRb);
    function $XRb(model, stackFrame, thread, session, avoidSession) {
        if (!session) {
            if (stackFrame || thread) {
                session = stackFrame ? stackFrame.thread.session : thread.session;
            }
            else {
                const sessions = model.getSessions();
                const stoppedSession = sessions.find(s => s.state === 2 /* State.Stopped */);
                // Make sure to not focus session that is going down
                session = stoppedSession || sessions.find(s => s !== avoidSession && s !== avoidSession?.parentSession) || (sessions.length ? sessions[0] : undefined);
            }
        }
        if (!thread) {
            if (stackFrame) {
                thread = stackFrame.thread;
            }
            else {
                const threads = session ? session.getAllThreads() : undefined;
                const stoppedThread = threads && threads.find(t => t.stopped);
                thread = stoppedThread || (threads && threads.length ? threads[0] : undefined);
            }
        }
        if (!stackFrame && thread) {
            stackFrame = thread.getTopStackFrame();
        }
        return { session, thread, stackFrame };
    }
    exports.$XRb = $XRb;
    async function sendToOneOrAllSessions(model, session, send) {
        if (session) {
            await send(session);
        }
        else {
            await Promise.all(model.getSessions().map(s => send(s)));
        }
    }
});
//# sourceMappingURL=debugService.js.map