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
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errorMessage", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/severity", "vs/base/common/uuid", "vs/editor/browser/editorBrowser", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/debug/common/extensionHostDebug", "vs/platform/dialogs/common/dialogs", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/quickinput/common/quickInput", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/workspace/common/workspace", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/common/views", "vs/workbench/contrib/debug/browser/debugAdapterManager", "vs/workbench/contrib/debug/browser/debugCommands", "vs/workbench/contrib/debug/browser/debugConfigurationManager", "vs/workbench/contrib/debug/browser/debugMemory", "vs/workbench/contrib/debug/browser/debugSession", "vs/workbench/contrib/debug/browser/debugTaskRunner", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugCompoundRoot", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/common/debugStorage", "vs/workbench/contrib/debug/common/debugTelemetry", "vs/workbench/contrib/debug/common/debugUtils", "vs/workbench/contrib/debug/common/debugViewModel", "vs/workbench/contrib/debug/common/disassemblyViewInput", "vs/workbench/contrib/files/common/files", "vs/workbench/services/activity/common/activity", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/panecomposite/browser/panecomposite"], function (require, exports, aria, actions_1, arrays_1, async_1, cancellation_1, errorMessage_1, errors, event_1, lifecycle_1, objects_1, severity_1, uuid_1, editorBrowser_1, nls, commands_1, configuration_1, contextkey_1, extensionHostDebug_1, dialogs_1, files_1, instantiation_1, notification_1, quickInput_1, uriIdentity_1, workspace_1, workspaceTrust_1, views_1, debugAdapterManager_1, debugCommands_1, debugConfigurationManager_1, debugMemory_1, debugSession_1, debugTaskRunner_1, debug_1, debugCompoundRoot_1, debugModel_1, debugStorage_1, debugTelemetry_1, debugUtils_1, debugViewModel_1, disassemblyViewInput_1, files_2, activity_1, editorService_1, extensions_1, layoutService_1, lifecycle_2, panecomposite_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getStackFrameThreadAndSessionToFocus = exports.DebugService = void 0;
    let DebugService = class DebugService {
        constructor(editorService, paneCompositeService, viewsService, viewDescriptorService, notificationService, dialogService, layoutService, contextService, contextKeyService, lifecycleService, instantiationService, extensionService, fileService, configurationService, extensionHostDebugService, activityService, commandService, quickInputService, workspaceTrustRequestService, uriIdentityService) {
            this.editorService = editorService;
            this.paneCompositeService = paneCompositeService;
            this.viewsService = viewsService;
            this.viewDescriptorService = viewDescriptorService;
            this.notificationService = notificationService;
            this.dialogService = dialogService;
            this.layoutService = layoutService;
            this.contextService = contextService;
            this.contextKeyService = contextKeyService;
            this.lifecycleService = lifecycleService;
            this.instantiationService = instantiationService;
            this.extensionService = extensionService;
            this.fileService = fileService;
            this.configurationService = configurationService;
            this.extensionHostDebugService = extensionHostDebugService;
            this.activityService = activityService;
            this.commandService = commandService;
            this.quickInputService = quickInputService;
            this.workspaceTrustRequestService = workspaceTrustRequestService;
            this.uriIdentityService = uriIdentityService;
            this.disposables = new lifecycle_1.DisposableStore();
            this.initializing = false;
            this.sessionCancellationTokens = new Map();
            this.haveDoneLazySetup = false;
            this.breakpointsToSendOnResourceSaved = new Set();
            this._onDidChangeState = new event_1.Emitter();
            this._onDidNewSession = new event_1.Emitter();
            this._onWillNewSession = new event_1.Emitter();
            this._onDidEndSession = new event_1.Emitter();
            this.adapterManager = this.instantiationService.createInstance(debugAdapterManager_1.AdapterManager, { onDidNewSession: this.onDidNewSession });
            this.disposables.add(this.adapterManager);
            this.configurationManager = this.instantiationService.createInstance(debugConfigurationManager_1.ConfigurationManager, this.adapterManager);
            this.disposables.add(this.configurationManager);
            this.debugStorage = this.disposables.add(this.instantiationService.createInstance(debugStorage_1.DebugStorage));
            this.chosenEnvironments = this.debugStorage.loadChosenEnvironments();
            this.model = this.instantiationService.createInstance(debugModel_1.DebugModel, this.debugStorage);
            this.telemetry = this.instantiationService.createInstance(debugTelemetry_1.DebugTelemetry, this.model);
            this.viewModel = new debugViewModel_1.ViewModel(contextKeyService);
            this.taskRunner = this.instantiationService.createInstance(debugTaskRunner_1.DebugTaskRunner);
            this.disposables.add(this.fileService.onDidFilesChange(e => this.onFileChanges(e)));
            this.disposables.add(this.lifecycleService.onWillShutdown(this.dispose, this));
            this.disposables.add(this.extensionHostDebugService.onAttachSession(event => {
                const session = this.model.getSession(event.sessionId, true);
                if (session) {
                    // EH was started in debug mode -> attach to it
                    session.configuration.request = 'attach';
                    session.configuration.port = event.port;
                    session.setSubId(event.subId);
                    this.launchOrAttachToSession(session);
                }
            }));
            this.disposables.add(this.extensionHostDebugService.onTerminateSession(event => {
                const session = this.model.getSession(event.sessionId);
                if (session && session.subId === event.subId) {
                    session.disconnect();
                }
            }));
            this.disposables.add(this.viewModel.onDidFocusStackFrame(() => {
                this.onStateChange();
            }));
            this.disposables.add(this.viewModel.onDidFocusSession((session) => {
                this.onStateChange();
                if (session) {
                    this.setExceptionBreakpointFallbackSession(session.getId());
                }
            }));
            this.disposables.add(event_1.Event.any(this.adapterManager.onDidRegisterDebugger, this.configurationManager.onDidSelectConfiguration)(() => {
                const debugUxValue = (this.state !== 0 /* State.Inactive */ || (this.configurationManager.getAllConfigurations().length > 0 && this.adapterManager.hasEnabledDebuggers())) ? 'default' : 'simple';
                this.debugUx.set(debugUxValue);
                this.debugStorage.storeDebugUxState(debugUxValue);
            }));
            this.disposables.add(this.model.onDidChangeCallStack(() => {
                const numberOfSessions = this.model.getSessions().filter(s => !s.parentSession).length;
                this.activity?.dispose();
                if (numberOfSessions > 0) {
                    const viewContainer = this.viewDescriptorService.getViewContainerByViewId(debug_1.CALLSTACK_VIEW_ID);
                    if (viewContainer) {
                        this.activity = this.activityService.showViewContainerActivity(viewContainer.id, { badge: new activity_1.NumberBadge(numberOfSessions, n => n === 1 ? nls.localize('1activeSession', "1 active session") : nls.localize('nActiveSessions', "{0} active sessions", n)) });
                    }
                }
            }));
            this.disposables.add(editorService.onDidActiveEditorChange(() => {
                this.contextKeyService.bufferChangeEvents(() => {
                    if (editorService.activeEditor === disassemblyViewInput_1.DisassemblyViewInput.instance) {
                        this.disassemblyViewFocus.set(true);
                    }
                    else {
                        // This key can be initialized a tick after this event is fired
                        this.disassemblyViewFocus?.reset();
                    }
                });
            }));
            this.disposables.add(this.lifecycleService.onBeforeShutdown(() => {
                for (const editor of editorService.editors) {
                    // Editors will not be valid on window reload, so close them.
                    if (editor.resource?.scheme === debug_1.DEBUG_MEMORY_SCHEME) {
                        editor.dispose();
                    }
                }
            }));
            this.initContextKeys(contextKeyService);
        }
        initContextKeys(contextKeyService) {
            queueMicrotask(() => {
                contextKeyService.bufferChangeEvents(() => {
                    this.debugType = debug_1.CONTEXT_DEBUG_TYPE.bindTo(contextKeyService);
                    this.debugState = debug_1.CONTEXT_DEBUG_STATE.bindTo(contextKeyService);
                    this.hasDebugged = debug_1.CONTEXT_HAS_DEBUGGED.bindTo(contextKeyService);
                    this.inDebugMode = debug_1.CONTEXT_IN_DEBUG_MODE.bindTo(contextKeyService);
                    this.debugUx = debug_1.CONTEXT_DEBUG_UX.bindTo(contextKeyService);
                    this.debugUx.set(this.debugStorage.loadDebugUxState());
                    this.breakpointsExist = debug_1.CONTEXT_BREAKPOINTS_EXIST.bindTo(contextKeyService);
                    // Need to set disassemblyViewFocus here to make it in the same context as the debug event handlers
                    this.disassemblyViewFocus = debug_1.CONTEXT_DISASSEMBLY_VIEW_FOCUS.bindTo(contextKeyService);
                });
                const setBreakpointsExistContext = () => this.breakpointsExist.set(!!(this.model.getBreakpoints().length || this.model.getDataBreakpoints().length || this.model.getFunctionBreakpoints().length));
                setBreakpointsExistContext();
                this.disposables.add(this.model.onDidChangeBreakpoints(() => setBreakpointsExistContext()));
            });
        }
        getModel() {
            return this.model;
        }
        getViewModel() {
            return this.viewModel;
        }
        getConfigurationManager() {
            return this.configurationManager;
        }
        getAdapterManager() {
            return this.adapterManager;
        }
        sourceIsNotAvailable(uri) {
            this.model.sourceIsNotAvailable(uri);
        }
        dispose() {
            this.disposables.dispose();
        }
        //---- state management
        get state() {
            const focusedSession = this.viewModel.focusedSession;
            if (focusedSession) {
                return focusedSession.state;
            }
            return this.initializing ? 1 /* State.Initializing */ : 0 /* State.Inactive */;
        }
        get initializingOptions() {
            return this._initializingOptions;
        }
        startInitializingState(options) {
            if (!this.initializing) {
                this.initializing = true;
                this._initializingOptions = options;
                this.onStateChange();
            }
        }
        endInitializingState() {
            if (this.initializing) {
                this.initializing = false;
                this._initializingOptions = undefined;
                this.onStateChange();
            }
        }
        cancelTokens(id) {
            if (id) {
                const token = this.sessionCancellationTokens.get(id);
                if (token) {
                    token.cancel();
                    this.sessionCancellationTokens.delete(id);
                }
            }
            else {
                this.sessionCancellationTokens.forEach(t => t.cancel());
                this.sessionCancellationTokens.clear();
            }
        }
        onStateChange() {
            const state = this.state;
            if (this.previousState !== state) {
                this.contextKeyService.bufferChangeEvents(() => {
                    this.debugState.set((0, debug_1.getStateLabel)(state));
                    this.inDebugMode.set(state !== 0 /* State.Inactive */);
                    // Only show the simple ux if debug is not yet started and if no launch.json exists
                    const debugUxValue = ((state !== 0 /* State.Inactive */ && state !== 1 /* State.Initializing */) || (this.adapterManager.hasEnabledDebuggers() && this.configurationManager.selectedConfiguration.name)) ? 'default' : 'simple';
                    this.debugUx.set(debugUxValue);
                    this.debugStorage.storeDebugUxState(debugUxValue);
                });
                this.previousState = state;
                this._onDidChangeState.fire(state);
            }
        }
        get onDidChangeState() {
            return this._onDidChangeState.event;
        }
        get onDidNewSession() {
            return this._onDidNewSession.event;
        }
        get onWillNewSession() {
            return this._onWillNewSession.event;
        }
        get onDidEndSession() {
            return this._onDidEndSession.event;
        }
        lazySetup() {
            if (!this.haveDoneLazySetup) {
                // Registering fs providers is slow
                // https://github.com/microsoft/vscode/issues/159886
                this.disposables.add(this.fileService.registerProvider(debug_1.DEBUG_MEMORY_SCHEME, new debugMemory_1.DebugMemoryFileSystemProvider(this)));
                this.haveDoneLazySetup = true;
            }
        }
        //---- life cycle management
        /**
         * main entry point
         * properly manages compounds, checks for errors and handles the initializing state.
         */
        async startDebugging(launch, configOrName, options, saveBeforeStart = !options?.parentSession) {
            const message = options && options.noDebug ? nls.localize('runTrust', "Running executes build tasks and program code from your workspace.") : nls.localize('debugTrust', "Debugging executes build tasks and program code from your workspace.");
            const trust = await this.workspaceTrustRequestService.requestWorkspaceTrust({ message });
            if (!trust) {
                return false;
            }
            this.lazySetup();
            this.startInitializingState(options);
            this.hasDebugged.set(true);
            try {
                // make sure to save all files and that the configuration is up to date
                await this.extensionService.activateByEvent('onDebug');
                if (saveBeforeStart) {
                    await (0, debugUtils_1.saveAllBeforeDebugStart)(this.configurationService, this.editorService);
                }
                await this.extensionService.whenInstalledExtensionsRegistered();
                let config;
                let compound;
                if (!configOrName) {
                    configOrName = this.configurationManager.selectedConfiguration.name;
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
                        throw new Error(nls.localize({ key: 'compoundMustHaveConfigurations', comment: ['compound indicates a "compounds" configuration item', '"configurations" is an attribute and should not be localized'] }, "Compound must have \"configurations\" attribute set in order to start multiple configurations."));
                    }
                    if (compound.preLaunchTask) {
                        const taskResult = await this.taskRunner.runTaskAndCheckErrors(launch?.workspace || this.contextService.getWorkspace(), compound.preLaunchTask);
                        if (taskResult === 0 /* TaskRunResult.Failure */) {
                            this.endInitializingState();
                            return false;
                        }
                    }
                    if (compound.stopAll) {
                        options = { ...options, compoundRoot: new debugCompoundRoot_1.DebugCompoundRoot() };
                    }
                    const values = await Promise.all(compound.configurations.map(configData => {
                        const name = typeof configData === 'string' ? configData : configData.name;
                        if (name === compound.name) {
                            return Promise.resolve(false);
                        }
                        let launchForName;
                        if (typeof configData === 'string') {
                            const launchesContainingName = this.configurationManager.getLaunches().filter(l => !!l.getConfiguration(name));
                            if (launchesContainingName.length === 1) {
                                launchForName = launchesContainingName[0];
                            }
                            else if (launch && launchesContainingName.length > 1 && launchesContainingName.indexOf(launch) >= 0) {
                                // If there are multiple launches containing the configuration give priority to the configuration in the current launch
                                launchForName = launch;
                            }
                            else {
                                throw new Error(launchesContainingName.length === 0 ? nls.localize('noConfigurationNameInWorkspace', "Could not find launch configuration '{0}' in the workspace.", name)
                                    : nls.localize('multipleConfigurationNamesInWorkspace', "There are multiple launch configurations '{0}' in the workspace. Use folder name to qualify the configuration.", name));
                            }
                        }
                        else if (configData.folder) {
                            const launchesMatchingConfigData = this.configurationManager.getLaunches().filter(l => l.workspace && l.workspace.name === configData.folder && !!l.getConfiguration(configData.name));
                            if (launchesMatchingConfigData.length === 1) {
                                launchForName = launchesMatchingConfigData[0];
                            }
                            else {
                                throw new Error(nls.localize('noFolderWithName', "Can not find folder with name '{0}' for configuration '{1}' in compound '{2}'.", configData.folder, configData.name, compound.name));
                            }
                        }
                        return this.createSession(launchForName, launchForName.getConfiguration(name), options);
                    }));
                    const result = values.every(success => !!success); // Compound launch is a success only if each configuration launched successfully
                    this.endInitializingState();
                    return result;
                }
                if (configOrName && !config) {
                    const message = !!launch ? nls.localize('configMissing', "Configuration '{0}' is missing in 'launch.json'.", typeof configOrName === 'string' ? configOrName : configOrName.name) :
                        nls.localize('launchJsonDoesNotExist', "'launch.json' does not exist for passed workspace folder.");
                    throw new Error(message);
                }
                const result = await this.createSession(launch, config, options);
                this.endInitializingState();
                return result;
            }
            catch (err) {
                // make sure to get out of initializing state, and propagate the result
                this.notificationService.error(err);
                this.endInitializingState();
                return Promise.reject(err);
            }
        }
        /**
         * gets the debugger for the type, resolves configurations by providers, substitutes variables and runs prelaunch tasks
         */
        async createSession(launch, config, options) {
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
            const unresolvedConfig = (0, objects_1.deepClone)(config);
            let guess;
            let activeEditor;
            if (!type) {
                activeEditor = this.editorService.activeEditor;
                if (activeEditor && activeEditor.resource) {
                    type = this.chosenEnvironments[activeEditor.resource.toString()];
                }
                if (!type) {
                    guess = await this.adapterManager.guessDebugger(false);
                    if (guess) {
                        type = guess.type;
                    }
                }
            }
            const initCancellationToken = new cancellation_1.CancellationTokenSource();
            const sessionId = (0, uuid_1.generateUuid)();
            this.sessionCancellationTokens.set(sessionId, initCancellationToken);
            const configByProviders = await this.configurationManager.resolveConfigurationByProviders(launch && launch.workspace ? launch.workspace.uri : undefined, type, config, initCancellationToken.token);
            // a falsy config indicates an aborted launch
            if (configByProviders && configByProviders.type) {
                try {
                    let resolvedConfig = await this.substituteVariables(launch, configByProviders);
                    if (!resolvedConfig) {
                        // User cancelled resolving of interactive variables, silently return
                        return false;
                    }
                    if (initCancellationToken.token.isCancellationRequested) {
                        // User cancelled, silently return
                        return false;
                    }
                    const workspace = launch?.workspace || this.contextService.getWorkspace();
                    const taskResult = await this.taskRunner.runTaskAndCheckErrors(workspace, resolvedConfig.preLaunchTask);
                    if (taskResult === 0 /* TaskRunResult.Failure */) {
                        return false;
                    }
                    const cfg = await this.configurationManager.resolveDebugConfigurationWithSubstitutedVariables(launch && launch.workspace ? launch.workspace.uri : undefined, type, resolvedConfig, initCancellationToken.token);
                    if (!cfg) {
                        if (launch && type && cfg === null && !initCancellationToken.token.isCancellationRequested) { // show launch.json only for "config" being "null".
                            await launch.openConfigFile({ preserveFocus: true, type }, initCancellationToken.token);
                        }
                        return false;
                    }
                    resolvedConfig = cfg;
                    const dbg = this.adapterManager.getDebugger(resolvedConfig.type);
                    if (!dbg || (configByProviders.request !== 'attach' && configByProviders.request !== 'launch')) {
                        let message;
                        if (configByProviders.request !== 'attach' && configByProviders.request !== 'launch') {
                            message = configByProviders.request ? nls.localize('debugRequestNotSupported', "Attribute '{0}' has an unsupported value '{1}' in the chosen debug configuration.", 'request', configByProviders.request)
                                : nls.localize('debugRequesMissing', "Attribute '{0}' is missing from the chosen debug configuration.", 'request');
                        }
                        else {
                            message = resolvedConfig.type ? nls.localize('debugTypeNotSupported', "Configured debug type '{0}' is not supported.", resolvedConfig.type) :
                                nls.localize('debugTypeMissing', "Missing property 'type' for the chosen launch configuration.");
                        }
                        const actionList = [];
                        actionList.push(new actions_1.Action('installAdditionalDebuggers', nls.localize({ key: 'installAdditionalDebuggers', comment: ['Placeholder is the debug type, so for example "node", "python"'] }, "Install {0} Extension", resolvedConfig.type), undefined, true, async () => this.commandService.executeCommand('debug.installAdditionalDebuggers', resolvedConfig?.type)));
                        await this.showError(message, actionList);
                        return false;
                    }
                    if (!dbg.enabled) {
                        await this.showError((0, debug_1.debuggerDisabledMessage)(dbg.type), []);
                        return false;
                    }
                    const result = await this.doCreateSession(sessionId, launch?.workspace, { resolved: resolvedConfig, unresolved: unresolvedConfig }, options);
                    if (result && guess && activeEditor && activeEditor.resource) {
                        // Remeber user choice of environment per active editor to make starting debugging smoother #124770
                        this.chosenEnvironments[activeEditor.resource.toString()] = guess.type;
                        this.debugStorage.storeChosenEnvironments(this.chosenEnvironments);
                    }
                    return result;
                }
                catch (err) {
                    if (err && err.message) {
                        await this.showError(err.message);
                    }
                    else if (this.contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
                        await this.showError(nls.localize('noFolderWorkspaceDebugError', "The active file can not be debugged. Make sure it is saved and that you have a debug extension installed for that file type."));
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
        async doCreateSession(sessionId, root, configuration, options) {
            const session = this.instantiationService.createInstance(debugSession_1.DebugSession, sessionId, configuration, root, this.model, options);
            if (options?.startedByUser && this.model.getSessions().some(s => s.getLabel() === session.getLabel()) && configuration.resolved.suppressMultipleSessionWarning !== true) {
                // There is already a session with the same name, prompt user #127721
                const result = await this.dialogService.confirm({ message: nls.localize('multipleSession', "'{0}' is already running. Do you want to start another instance?", session.getLabel()) });
                if (!result.confirmed) {
                    return false;
                }
            }
            this.model.addSession(session);
            // register listeners as the very first thing!
            this.registerSessionListeners(session);
            // since the Session is now properly registered under its ID and hooked, we can announce it
            // this event doesn't go to extensions
            this._onWillNewSession.fire(session);
            const openDebug = this.configurationService.getValue('debug').openDebug;
            // Open debug viewlet based on the visibility of the side bar and openDebug setting. Do not open for 'run without debug'
            if (!configuration.resolved.noDebug && (openDebug === 'openOnSessionStart' || (openDebug !== 'neverOpen' && this.viewModel.firstSessionStart)) && !session.suppressDebugView) {
                await this.paneCompositeService.openPaneComposite(debug_1.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */);
            }
            try {
                await this.launchOrAttachToSession(session);
                const internalConsoleOptions = session.configuration.internalConsoleOptions || this.configurationService.getValue('debug').internalConsoleOptions;
                if (internalConsoleOptions === 'openOnSessionStart' || (this.viewModel.firstSessionStart && internalConsoleOptions === 'openOnFirstSessionStart')) {
                    this.viewsService.openView(debug_1.REPL_VIEW_ID, false);
                }
                this.viewModel.firstSessionStart = false;
                const showSubSessions = this.configurationService.getValue('debug').showSubSessionsInToolBar;
                const sessions = this.model.getSessions();
                const shownSessions = showSubSessions ? sessions : sessions.filter(s => !s.parentSession);
                if (shownSessions.length > 1) {
                    this.viewModel.setMultiSessionView(true);
                }
                // since the initialized response has arrived announce the new Session (including extensions)
                this._onDidNewSession.fire(session);
                return true;
            }
            catch (error) {
                if (errors.isCancellationError(error)) {
                    // don't show 'canceled' error messages to the user #7906
                    return false;
                }
                // Show the repl if some error got logged there #5870
                if (session && session.getReplElements().length > 0) {
                    this.viewsService.openView(debug_1.REPL_VIEW_ID, false);
                }
                if (session.configuration && session.configuration.request === 'attach' && session.configuration.__autoAttach) {
                    // ignore attach timeouts in auto attach mode
                    return false;
                }
                const errorMessage = error instanceof Error ? error.message : error;
                if (error.showUser !== false) {
                    // Only show the error when showUser is either not defined, or is true #128484
                    await this.showError(errorMessage, (0, errorMessage_1.isErrorWithActions)(error) ? error.actions : []);
                }
                return false;
            }
        }
        async launchOrAttachToSession(session, forceFocus = false) {
            const dbgr = this.adapterManager.getDebugger(session.configuration.type);
            try {
                await session.initialize(dbgr);
                await session.launchOrAttach(session.configuration);
                const launchJsonExists = !!session.root && !!this.configurationService.getValue('launch', { resource: session.root.uri });
                await this.telemetry.logDebugSessionStart(dbgr, launchJsonExists);
                if (forceFocus || !this.viewModel.focusedSession || (session.parentSession === this.viewModel.focusedSession && session.compact)) {
                    await this.focusStackFrame(undefined, undefined, session);
                }
            }
            catch (err) {
                if (this.viewModel.focusedSession === session) {
                    await this.focusStackFrame(undefined);
                }
                return Promise.reject(err);
            }
        }
        registerSessionListeners(session) {
            const sessionRunningScheduler = new async_1.RunOnceScheduler(() => {
                // Do not immediatly defocus the stack frame if the session is running
                if (session.state === 3 /* State.Running */ && this.viewModel.focusedSession === session) {
                    this.viewModel.setFocus(undefined, this.viewModel.focusedThread, session, false);
                }
            }, 200);
            this.disposables.add(session.onDidChangeState(() => {
                if (session.state === 3 /* State.Running */ && this.viewModel.focusedSession === session) {
                    sessionRunningScheduler.schedule();
                }
                if (session === this.viewModel.focusedSession) {
                    this.onStateChange();
                }
            }));
            this.disposables.add(session.onDidEndAdapter(async (adapterExitEvent) => {
                if (adapterExitEvent) {
                    if (adapterExitEvent.error) {
                        this.notificationService.error(nls.localize('debugAdapterCrash', "Debug adapter process has terminated unexpectedly ({0})", adapterExitEvent.error.message || adapterExitEvent.error.toString()));
                    }
                    this.telemetry.logDebugSessionStop(session, adapterExitEvent);
                }
                // 'Run without debugging' mode VSCode must terminate the extension host. More details: #3905
                const extensionDebugSession = (0, debugUtils_1.getExtensionHostDebugSession)(session);
                if (extensionDebugSession && extensionDebugSession.state === 3 /* State.Running */ && extensionDebugSession.configuration.noDebug) {
                    this.extensionHostDebugService.close(extensionDebugSession.getId());
                }
                if (session.configuration.postDebugTask) {
                    const root = session.root ?? this.contextService.getWorkspace();
                    try {
                        await this.taskRunner.runTask(root, session.configuration.postDebugTask);
                    }
                    catch (err) {
                        this.notificationService.error(err);
                    }
                }
                this.endInitializingState();
                this.cancelTokens(session.getId());
                this._onDidEndSession.fire(session);
                const focusedSession = this.viewModel.focusedSession;
                if (focusedSession && focusedSession.getId() === session.getId()) {
                    const { session, thread, stackFrame } = getStackFrameThreadAndSessionToFocus(this.model, undefined, undefined, undefined, focusedSession);
                    this.viewModel.setFocus(stackFrame, thread, session, false);
                }
                if (this.model.getSessions().length === 0) {
                    this.viewModel.setMultiSessionView(false);
                    if (this.layoutService.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */) && this.configurationService.getValue('debug').openExplorerOnEnd) {
                        this.paneCompositeService.openPaneComposite(files_2.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */);
                    }
                    // Data breakpoints that can not be persisted should be cleared when a session ends
                    const dataBreakpoints = this.model.getDataBreakpoints().filter(dbp => !dbp.canPersist);
                    dataBreakpoints.forEach(dbp => this.model.removeDataBreakpoints(dbp.getId()));
                    if (this.configurationService.getValue('debug').console.closeOnEnd) {
                        const debugConsoleContainer = this.viewDescriptorService.getViewContainerByViewId(debug_1.REPL_VIEW_ID);
                        if (debugConsoleContainer && this.viewsService.isViewContainerVisible(debugConsoleContainer.id)) {
                            this.viewsService.closeViewContainer(debugConsoleContainer.id);
                        }
                    }
                }
                this.model.removeExceptionBreakpointsForSession(session.getId());
                // session.dispose(); TODO@roblourens
            }));
        }
        async restartSession(session, restartData) {
            if (session.saveBeforeRestart) {
                await (0, debugUtils_1.saveAllBeforeDebugStart)(this.configurationService, this.editorService);
            }
            const isAutoRestart = !!restartData;
            const runTasks = async () => {
                if (isAutoRestart) {
                    // Do not run preLaunch and postDebug tasks for automatic restarts
                    return Promise.resolve(1 /* TaskRunResult.Success */);
                }
                const root = session.root || this.contextService.getWorkspace();
                await this.taskRunner.runTask(root, session.configuration.preRestartTask);
                await this.taskRunner.runTask(root, session.configuration.postDebugTask);
                const taskResult1 = await this.taskRunner.runTaskAndCheckErrors(root, session.configuration.preLaunchTask);
                if (taskResult1 !== 1 /* TaskRunResult.Success */) {
                    return taskResult1;
                }
                return this.taskRunner.runTaskAndCheckErrors(root, session.configuration.postRestartTask);
            };
            const extensionDebugSession = (0, debugUtils_1.getExtensionHostDebugSession)(session);
            if (extensionDebugSession) {
                const taskResult = await runTasks();
                if (taskResult === 1 /* TaskRunResult.Success */) {
                    this.extensionHostDebugService.reload(extensionDebugSession.getId());
                }
                return;
            }
            // Read the configuration again if a launch.json has been changed, if not just use the inmemory configuration
            let needsToSubstitute = false;
            let unresolved;
            const launch = session.root ? this.configurationManager.getLaunch(session.root.uri) : undefined;
            if (launch) {
                unresolved = launch.getConfiguration(session.configuration.name);
                if (unresolved && !(0, objects_1.equals)(unresolved, session.unresolvedConfiguration)) {
                    // Take the type from the session since the debug extension might overwrite it #21316
                    unresolved.type = session.configuration.type;
                    unresolved.noDebug = session.configuration.noDebug;
                    needsToSubstitute = true;
                }
            }
            let resolved = session.configuration;
            if (launch && needsToSubstitute && unresolved) {
                const initCancellationToken = new cancellation_1.CancellationTokenSource();
                this.sessionCancellationTokens.set(session.getId(), initCancellationToken);
                const resolvedByProviders = await this.configurationManager.resolveConfigurationByProviders(launch.workspace ? launch.workspace.uri : undefined, unresolved.type, unresolved, initCancellationToken.token);
                if (resolvedByProviders) {
                    resolved = await this.substituteVariables(launch, resolvedByProviders);
                    if (resolved && !initCancellationToken.token.isCancellationRequested) {
                        resolved = await this.configurationManager.resolveDebugConfigurationWithSubstitutedVariables(launch && launch.workspace ? launch.workspace.uri : undefined, unresolved.type, resolved, initCancellationToken.token);
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
            const shouldFocus = !!this.viewModel.focusedSession && session.getId() === this.viewModel.focusedSession.getId();
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
                        await this.launchOrAttachToSession(session, shouldFocus);
                        this._onDidNewSession.fire(session);
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
            const sessions = this.model.getSessions();
            if (sessions.length === 0) {
                this.taskRunner.cancel();
                // User might have cancelled starting of a debug session, and in some cases the quick pick is left open
                await this.quickInputService.cancel();
                this.endInitializingState();
                this.cancelTokens(undefined);
            }
            return Promise.all(sessions.map(s => disconnect ? s.disconnect(undefined, suspend) : s.terminate()));
        }
        async substituteVariables(launch, config) {
            const dbg = this.adapterManager.getDebugger(config.type);
            if (dbg) {
                let folder = undefined;
                if (launch && launch.workspace) {
                    folder = launch.workspace;
                }
                else {
                    const folders = this.contextService.getWorkspace().folders;
                    if (folders.length === 1) {
                        folder = folders[0];
                    }
                }
                try {
                    return await dbg.substituteVariables(folder, config);
                }
                catch (err) {
                    this.showError(err.message, undefined, !!launch?.getConfiguration(config.name));
                    return undefined; // bail out
                }
            }
            return Promise.resolve(config);
        }
        async showError(message, errorActions = [], promptLaunchJson = true) {
            const configureAction = new actions_1.Action(debugCommands_1.DEBUG_CONFIGURE_COMMAND_ID, debugCommands_1.DEBUG_CONFIGURE_LABEL, undefined, true, () => this.commandService.executeCommand(debugCommands_1.DEBUG_CONFIGURE_COMMAND_ID));
            // Don't append the standard command if id of any provided action indicates it is a command
            const actions = errorActions.filter((action) => action.id.endsWith('.command')).length > 0 ?
                errorActions :
                [...errorActions, ...(promptLaunchJson ? [configureAction] : [])];
            await this.dialogService.prompt({
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
            const { stackFrame, thread, session } = getStackFrameThreadAndSessionToFocus(this.model, _stackFrame, _thread, _session);
            if (stackFrame) {
                const editor = await stackFrame.openInEditor(this.editorService, options?.preserveFocus ?? true, options?.sideBySide, options?.pinned);
                if (editor) {
                    if (editor.input === disassemblyViewInput_1.DisassemblyViewInput.instance) {
                        // Go to address is invoked via setFocus
                    }
                    else {
                        const control = editor.getControl();
                        if (stackFrame && (0, editorBrowser_1.isCodeEditor)(control) && control.hasModel()) {
                            const model = control.getModel();
                            const lineNumber = stackFrame.range.startLineNumber;
                            if (lineNumber >= 1 && lineNumber <= model.getLineCount()) {
                                const lineContent = control.getModel().getLineContent(lineNumber);
                                aria.alert(nls.localize({ key: 'debuggingPaused', comment: ['First placeholder is the file line content, second placeholder is the reason why debugging is stopped, for example "breakpoint", third is the stack frame name, and last is the line number.'] }, "{0}, debugging paused {1}, {2}:{3}", lineContent, thread && thread.stoppedDetails ? `, reason ${thread.stoppedDetails.reason}` : '', stackFrame.source ? stackFrame.source.name : '', stackFrame.range.startLineNumber));
                            }
                        }
                    }
                }
            }
            if (session) {
                this.debugType.set(session.configuration.type);
            }
            else {
                this.debugType.reset();
            }
            this.viewModel.setFocus(stackFrame, thread, session, !!options?.explicit);
        }
        //---- watches
        addWatchExpression(name) {
            const we = this.model.addWatchExpression(name);
            if (!name) {
                this.viewModel.setSelectedExpression(we, false);
            }
            this.debugStorage.storeWatchExpressions(this.model.getWatchExpressions());
        }
        renameWatchExpression(id, newName) {
            this.model.renameWatchExpression(id, newName);
            this.debugStorage.storeWatchExpressions(this.model.getWatchExpressions());
        }
        moveWatchExpression(id, position) {
            this.model.moveWatchExpression(id, position);
            this.debugStorage.storeWatchExpressions(this.model.getWatchExpressions());
        }
        removeWatchExpressions(id) {
            this.model.removeWatchExpressions(id);
            this.debugStorage.storeWatchExpressions(this.model.getWatchExpressions());
        }
        //---- breakpoints
        canSetBreakpointsIn(model) {
            return this.adapterManager.canSetBreakpointsIn(model);
        }
        async enableOrDisableBreakpoints(enable, breakpoint) {
            if (breakpoint) {
                this.model.setEnablement(breakpoint, enable);
                this.debugStorage.storeBreakpoints(this.model);
                if (breakpoint instanceof debugModel_1.Breakpoint) {
                    await this.sendBreakpoints(breakpoint.originalUri);
                }
                else if (breakpoint instanceof debugModel_1.FunctionBreakpoint) {
                    await this.sendFunctionBreakpoints();
                }
                else if (breakpoint instanceof debugModel_1.DataBreakpoint) {
                    await this.sendDataBreakpoints();
                }
                else if (breakpoint instanceof debugModel_1.InstructionBreakpoint) {
                    await this.sendInstructionBreakpoints();
                }
                else {
                    await this.sendExceptionBreakpoints();
                }
            }
            else {
                this.model.enableOrDisableAllBreakpoints(enable);
                this.debugStorage.storeBreakpoints(this.model);
                await this.sendAllBreakpoints();
            }
            this.debugStorage.storeBreakpoints(this.model);
        }
        async addBreakpoints(uri, rawBreakpoints, ariaAnnounce = true) {
            const breakpoints = this.model.addBreakpoints(uri, rawBreakpoints);
            if (ariaAnnounce) {
                breakpoints.forEach(bp => aria.status(nls.localize('breakpointAdded', "Added breakpoint, line {0}, file {1}", bp.lineNumber, uri.fsPath)));
            }
            // In some cases we need to store breakpoints before we send them because sending them can take a long time
            // And after sending them because the debug adapter can attach adapter data to a breakpoint
            this.debugStorage.storeBreakpoints(this.model);
            await this.sendBreakpoints(uri);
            this.debugStorage.storeBreakpoints(this.model);
            return breakpoints;
        }
        async updateBreakpoints(uri, data, sendOnResourceSaved) {
            this.model.updateBreakpoints(data);
            this.debugStorage.storeBreakpoints(this.model);
            if (sendOnResourceSaved) {
                this.breakpointsToSendOnResourceSaved.add(uri);
            }
            else {
                await this.sendBreakpoints(uri);
                this.debugStorage.storeBreakpoints(this.model);
            }
        }
        async removeBreakpoints(id) {
            const toRemove = this.model.getBreakpoints().filter(bp => !id || bp.getId() === id);
            // note: using the debugger-resolved uri for aria to reflect UI state
            toRemove.forEach(bp => aria.status(nls.localize('breakpointRemoved', "Removed breakpoint, line {0}, file {1}", bp.lineNumber, bp.uri.fsPath)));
            const urisToClear = (0, arrays_1.distinct)(toRemove, bp => bp.originalUri.toString()).map(bp => bp.originalUri);
            this.model.removeBreakpoints(toRemove);
            this.debugStorage.storeBreakpoints(this.model);
            await Promise.all(urisToClear.map(uri => this.sendBreakpoints(uri)));
        }
        setBreakpointsActivated(activated) {
            this.model.setBreakpointsActivated(activated);
            return this.sendAllBreakpoints();
        }
        addFunctionBreakpoint(name, id) {
            this.model.addFunctionBreakpoint(name || '', id);
        }
        async updateFunctionBreakpoint(id, update) {
            this.model.updateFunctionBreakpoint(id, update);
            this.debugStorage.storeBreakpoints(this.model);
            await this.sendFunctionBreakpoints();
        }
        async removeFunctionBreakpoints(id) {
            this.model.removeFunctionBreakpoints(id);
            this.debugStorage.storeBreakpoints(this.model);
            await this.sendFunctionBreakpoints();
        }
        async addDataBreakpoint(label, dataId, canPersist, accessTypes, accessType) {
            this.model.addDataBreakpoint(label, dataId, canPersist, accessTypes, accessType);
            this.debugStorage.storeBreakpoints(this.model);
            await this.sendDataBreakpoints();
            this.debugStorage.storeBreakpoints(this.model);
        }
        async removeDataBreakpoints(id) {
            this.model.removeDataBreakpoints(id);
            this.debugStorage.storeBreakpoints(this.model);
            await this.sendDataBreakpoints();
        }
        async addInstructionBreakpoint(instructionReference, offset, address, condition, hitCondition) {
            this.model.addInstructionBreakpoint(instructionReference, offset, address, condition, hitCondition);
            this.debugStorage.storeBreakpoints(this.model);
            await this.sendInstructionBreakpoints();
            this.debugStorage.storeBreakpoints(this.model);
        }
        async removeInstructionBreakpoints(instructionReference, offset) {
            this.model.removeInstructionBreakpoints(instructionReference, offset);
            this.debugStorage.storeBreakpoints(this.model);
            await this.sendInstructionBreakpoints();
        }
        setExceptionBreakpointFallbackSession(sessionId) {
            this.model.setExceptionBreakpointFallbackSession(sessionId);
            this.debugStorage.storeBreakpoints(this.model);
        }
        setExceptionBreakpointsForSession(session, data) {
            this.model.setExceptionBreakpointsForSession(session.getId(), data);
            this.debugStorage.storeBreakpoints(this.model);
        }
        async setExceptionBreakpointCondition(exceptionBreakpoint, condition) {
            this.model.setExceptionBreakpointCondition(exceptionBreakpoint, condition);
            this.debugStorage.storeBreakpoints(this.model);
            await this.sendExceptionBreakpoints();
        }
        async sendAllBreakpoints(session) {
            const setBreakpointsPromises = (0, arrays_1.distinct)(this.model.getBreakpoints(), bp => bp.originalUri.toString())
                .map(bp => this.sendBreakpoints(bp.originalUri, false, session));
            // If sending breakpoints to one session which we know supports the configurationDone request, can make all requests in parallel
            if (session?.capabilities.supportsConfigurationDoneRequest) {
                await Promise.all([
                    ...setBreakpointsPromises,
                    this.sendFunctionBreakpoints(session),
                    this.sendDataBreakpoints(session),
                    this.sendInstructionBreakpoints(session),
                    this.sendExceptionBreakpoints(session),
                ]);
            }
            else {
                await Promise.all(setBreakpointsPromises);
                await this.sendFunctionBreakpoints(session);
                await this.sendDataBreakpoints(session);
                await this.sendInstructionBreakpoints(session);
                // send exception breakpoints at the end since some debug adapters may rely on the order - this was the case before
                // the configurationDone request was introduced.
                await this.sendExceptionBreakpoints(session);
            }
        }
        async sendBreakpoints(modelUri, sourceModified = false, session) {
            const breakpointsToSend = this.model.getBreakpoints({ originalUri: modelUri, enabledOnly: true });
            await sendToOneOrAllSessions(this.model, session, async (s) => {
                if (!s.configuration.noDebug) {
                    await s.sendBreakpoints(modelUri, breakpointsToSend, sourceModified);
                }
            });
        }
        async sendFunctionBreakpoints(session) {
            const breakpointsToSend = this.model.getFunctionBreakpoints().filter(fbp => fbp.enabled && this.model.areBreakpointsActivated());
            await sendToOneOrAllSessions(this.model, session, async (s) => {
                if (s.capabilities.supportsFunctionBreakpoints && !s.configuration.noDebug) {
                    await s.sendFunctionBreakpoints(breakpointsToSend);
                }
            });
        }
        async sendDataBreakpoints(session) {
            const breakpointsToSend = this.model.getDataBreakpoints().filter(fbp => fbp.enabled && this.model.areBreakpointsActivated());
            await sendToOneOrAllSessions(this.model, session, async (s) => {
                if (s.capabilities.supportsDataBreakpoints && !s.configuration.noDebug) {
                    await s.sendDataBreakpoints(breakpointsToSend);
                }
            });
        }
        async sendInstructionBreakpoints(session) {
            const breakpointsToSend = this.model.getInstructionBreakpoints().filter(fbp => fbp.enabled && this.model.areBreakpointsActivated());
            await sendToOneOrAllSessions(this.model, session, async (s) => {
                if (s.capabilities.supportsInstructionBreakpoints && !s.configuration.noDebug) {
                    await s.sendInstructionBreakpoints(breakpointsToSend);
                }
            });
        }
        sendExceptionBreakpoints(session) {
            return sendToOneOrAllSessions(this.model, session, async (s) => {
                const enabledExceptionBps = this.model.getExceptionBreakpointsForSession(s.getId()).filter(exb => exb.enabled);
                if (s.capabilities.supportsConfigurationDoneRequest && (!s.capabilities.exceptionBreakpointFilters || s.capabilities.exceptionBreakpointFilters.length === 0)) {
                    // Only call `setExceptionBreakpoints` as specified in dap protocol #90001
                    return;
                }
                if (!s.configuration.noDebug) {
                    await s.sendExceptionBreakpoints(enabledExceptionBps);
                }
            });
        }
        onFileChanges(fileChangesEvent) {
            const toRemove = this.model.getBreakpoints().filter(bp => fileChangesEvent.contains(bp.originalUri, 2 /* FileChangeType.DELETED */));
            if (toRemove.length) {
                this.model.removeBreakpoints(toRemove);
            }
            const toSend = [];
            for (const uri of this.breakpointsToSendOnResourceSaved) {
                if (fileChangesEvent.contains(uri, 0 /* FileChangeType.UPDATED */)) {
                    toSend.push(uri);
                }
            }
            for (const uri of toSend) {
                this.breakpointsToSendOnResourceSaved.delete(uri);
                this.sendBreakpoints(uri, true);
            }
        }
        async runTo(uri, lineNumber, column) {
            let breakpointToRemove;
            let threadToContinue = this.getViewModel().focusedThread;
            const addTempBreakPoint = async () => {
                const bpExists = !!(this.getModel().getBreakpoints({ column, lineNumber, uri }).length);
                if (!bpExists) {
                    const addResult = await this.addAndValidateBreakpoints(uri, lineNumber, column);
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
                const configOrName = config ? Object.assign((0, objects_1.deepClone)(config), {}) : name;
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
        async addAndValidateBreakpoints(uri, lineNumber, column) {
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
                await (0, async_1.raceTimeout)(new Promise(resolve => {
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
                        return top && this.uriIdentityService.extUri.isEqual(top.source.uri, uri);
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
    exports.DebugService = DebugService;
    exports.DebugService = DebugService = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, panecomposite_1.IPaneCompositePartService),
        __param(2, views_1.IViewsService),
        __param(3, views_1.IViewDescriptorService),
        __param(4, notification_1.INotificationService),
        __param(5, dialogs_1.IDialogService),
        __param(6, layoutService_1.IWorkbenchLayoutService),
        __param(7, workspace_1.IWorkspaceContextService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, lifecycle_2.ILifecycleService),
        __param(10, instantiation_1.IInstantiationService),
        __param(11, extensions_1.IExtensionService),
        __param(12, files_1.IFileService),
        __param(13, configuration_1.IConfigurationService),
        __param(14, extensionHostDebug_1.IExtensionHostDebugService),
        __param(15, activity_1.IActivityService),
        __param(16, commands_1.ICommandService),
        __param(17, quickInput_1.IQuickInputService),
        __param(18, workspaceTrust_1.IWorkspaceTrustRequestService),
        __param(19, uriIdentity_1.IUriIdentityService)
    ], DebugService);
    function getStackFrameThreadAndSessionToFocus(model, stackFrame, thread, session, avoidSession) {
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
    exports.getStackFrameThreadAndSessionToFocus = getStackFrameThreadAndSessionToFocus;
    async function sendToOneOrAllSessions(model, session, send) {
        if (session) {
            await send(session);
        }
        else {
            await Promise.all(model.getSessions().map(s => send(s)));
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvYnJvd3Nlci9kZWJ1Z1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBdUR6RixJQUFNLFlBQVksR0FBbEIsTUFBTSxZQUFZO1FBK0J4QixZQUNpQixhQUE4QyxFQUNuQyxvQkFBZ0UsRUFDNUUsWUFBNEMsRUFDbkMscUJBQThELEVBQ2hFLG1CQUEwRCxFQUNoRSxhQUE4QyxFQUNyQyxhQUF1RCxFQUN0RCxjQUF5RCxFQUMvRCxpQkFBc0QsRUFDdkQsZ0JBQW9ELEVBQ2hELG9CQUE0RCxFQUNoRSxnQkFBb0QsRUFDekQsV0FBMEMsRUFDakMsb0JBQTRELEVBQ3ZELHlCQUFzRSxFQUNoRixlQUFrRCxFQUNuRCxjQUFnRCxFQUM3QyxpQkFBc0QsRUFDM0MsNEJBQTRFLEVBQ3RGLGtCQUF3RDtZQW5CNUMsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQ2xCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBMkI7WUFDM0QsaUJBQVksR0FBWixZQUFZLENBQWU7WUFDbEIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF3QjtZQUMvQyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXNCO1lBQy9DLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUNwQixrQkFBYSxHQUFiLGFBQWEsQ0FBeUI7WUFDckMsbUJBQWMsR0FBZCxjQUFjLENBQTBCO1lBQzlDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDdEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUMvQix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQy9DLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDeEMsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDaEIseUJBQW9CLEdBQXBC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