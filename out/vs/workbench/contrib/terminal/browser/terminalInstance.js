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
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/canIUse", "vs/base/browser/dnd", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/decorators", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/labels", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/uri", "vs/editor/browser/config/tabFocus", "vs/nls", "vs/platform/accessibility/common/accessibility", "vs/platform/audioCues/browser/audioCueService", "vs/platform/clipboard/common/clipboardService", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/dialogs/common/dialogs", "vs/platform/dnd/browser/dnd", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/common/keybinding", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/product/common/productService", "vs/platform/quickinput/common/quickInput", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/terminal/common/capabilities/terminalCapabilityStore", "vs/platform/terminal/common/environmentVariableShared", "vs/platform/terminal/common/terminal", "vs/platform/terminal/common/terminalStrings", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/iconRegistry", "vs/platform/theme/common/themeService", "vs/platform/workspace/common/workspace", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/common/theme", "vs/workbench/common/views", "vs/workbench/contrib/terminal/browser/terminalActions", "vs/workbench/contrib/terminal/browser/terminalEditorInput", "vs/workbench/contrib/terminal/browser/terminalExtensions", "vs/workbench/contrib/terminal/browser/terminalIcon", "vs/workbench/contrib/terminal/browser/terminalProcessManager", "vs/workbench/contrib/terminal/browser/terminalRunRecentQuickPick", "vs/workbench/contrib/terminal/browser/terminalStatusList", "vs/workbench/contrib/terminal/browser/terminalUri", "vs/workbench/contrib/terminal/browser/widgets/widgetManager", "vs/workbench/contrib/terminal/browser/xterm/lineDataEventAddon", "vs/workbench/contrib/terminal/browser/xterm/xtermTerminal", "vs/workbench/contrib/terminal/common/history", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminal/common/terminalColorRegistry", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/workbench/contrib/terminal/common/terminalEnvironment", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/history/common/history", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/services/path/common/pathService", "vs/workbench/services/preferences/common/preferences", "vs/amdX"], function (require, exports, browser_1, canIUse_1, dnd_1, dom, keyboardEvent_1, scrollableElement_1, async_1, codicons_1, decorators_1, errors_1, event_1, labels_1, lifecycle_1, network_1, path, platform_1, uri_1, tabFocus_1, nls, accessibility_1, audioCueService_1, clipboardService_1, commands_1, configuration_1, contextkey_1, dialogs_1, dnd_2, files_1, instantiation_1, serviceCollection_1, keybinding_1, notification_1, opener_1, productService_1, quickInput_1, storage_1, telemetry_1, terminalCapabilityStore_1, environmentVariableShared_1, terminal_1, terminalStrings_1, colorRegistry_1, iconRegistry_1, themeService_1, workspace_1, workspaceTrust_1, theme_1, views_1, terminalActions_1, terminalEditorInput_1, terminalExtensions_1, terminalIcon_1, terminalProcessManager_1, terminalRunRecentQuickPick_1, terminalStatusList_1, terminalUri_1, widgetManager_1, lineDataEventAddon_1, xtermTerminal_1, history_1, terminal_2, terminalColorRegistry_1, terminalContextKey_1, terminalEnvironment_1, editorService_1, environmentService_1, history_2, layoutService_1, pathService_1, preferences_1, amdX_1) {
    "use strict";
    var TerminalInstance_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseExitResult = exports.TerminalLabelComputer = exports.TerminalInstance = void 0;
    var Constants;
    (function (Constants) {
        /**
         * The maximum amount of milliseconds to wait for a container before starting to create the
         * terminal process. This period helps ensure the terminal has good initial dimensions to work
         * with if it's going to be a foreground terminal.
         */
        Constants[Constants["WaitForContainerThreshold"] = 100] = "WaitForContainerThreshold";
        Constants[Constants["DefaultCols"] = 80] = "DefaultCols";
        Constants[Constants["DefaultRows"] = 30] = "DefaultRows";
        Constants[Constants["MaxSupportedCols"] = 5000] = "MaxSupportedCols";
        Constants[Constants["MaxCanvasWidth"] = 8000] = "MaxCanvasWidth";
    })(Constants || (Constants = {}));
    let xtermConstructor;
    const shellIntegrationSupportedShellTypes = [
        "bash" /* PosixShellType.Bash */,
        "zsh" /* PosixShellType.Zsh */,
        "pwsh" /* PosixShellType.PowerShell */,
        "pwsh" /* WindowsShellType.PowerShell */
    ];
    let TerminalInstance = class TerminalInstance extends lifecycle_1.Disposable {
        static { TerminalInstance_1 = this; }
        static { this._instanceIdCounter = 1; }
        get domElement() { return this._wrapperElement; }
        get usedShellIntegrationInjection() { return this._usedShellIntegrationInjection; }
        get extEnvironmentVariableCollection() { return this._processManager.extEnvironmentVariableCollection; }
        get waitOnExit() { return this._shellLaunchConfig.attachPersistentProcess?.waitOnExit || this._shellLaunchConfig.waitOnExit; }
        set waitOnExit(value) {
            this._shellLaunchConfig.waitOnExit = value;
        }
        get target() { return this._target; }
        set target(value) { this._target = value; }
        get instanceId() { return this._instanceId; }
        get resource() { return this._resource; }
        get cols() {
            if (this._fixedCols !== undefined) {
                return this._fixedCols;
            }
            if (this._dimensionsOverride && this._dimensionsOverride.cols) {
                if (this._dimensionsOverride.forceExactSize) {
                    return this._dimensionsOverride.cols;
                }
                return Math.min(Math.max(this._dimensionsOverride.cols, 2), this._cols);
            }
            return this._cols;
        }
        get rows() {
            if (this._fixedRows !== undefined) {
                return this._fixedRows;
            }
            if (this._dimensionsOverride && this._dimensionsOverride.rows) {
                if (this._dimensionsOverride.forceExactSize) {
                    return this._dimensionsOverride.rows;
                }
                return Math.min(Math.max(this._dimensionsOverride.rows, 2), this._rows);
            }
            return this._rows;
        }
        get isDisposed() { return this._isDisposed; }
        get fixedCols() { return this._fixedCols; }
        get fixedRows() { return this._fixedRows; }
        get maxCols() { return this._cols; }
        get maxRows() { return this._rows; }
        // TODO: Ideally processId would be merged into processReady
        get processId() { return this._processManager.shellProcessId; }
        // TODO: How does this work with detached processes?
        // TODO: Should this be an event as it can fire twice?
        get processReady() { return this._processManager.ptyProcessReady; }
        get hasChildProcesses() { return this.shellLaunchConfig.attachPersistentProcess?.hasChildProcesses || this._processManager.hasChildProcesses; }
        get reconnectionProperties() { return this.shellLaunchConfig.attachPersistentProcess?.reconnectionProperties || this.shellLaunchConfig.reconnectionProperties; }
        get areLinksReady() { return this._areLinksReady; }
        get initialDataEvents() { return this._initialDataEvents; }
        get exitCode() { return this._exitCode; }
        get exitReason() { return this._exitReason; }
        get hadFocusOnExit() { return this._hadFocusOnExit; }
        get isTitleSetByProcess() { return !!this._messageTitleDisposable.value; }
        get shellLaunchConfig() { return this._shellLaunchConfig; }
        get shellType() { return this._shellType; }
        get os() { return this._processManager.os; }
        get isRemote() { return this._processManager.remoteAuthority !== undefined; }
        get remoteAuthority() { return this._processManager.remoteAuthority; }
        get hasFocus() { return this._wrapperElement.contains(document.activeElement) ?? false; }
        get title() { return this._title; }
        get titleSource() { return this._titleSource; }
        get icon() { return this._getIcon(); }
        get color() { return this._getColor(); }
        get processName() { return this._processName; }
        get sequence() { return this._sequence; }
        get staticTitle() { return this._staticTitle; }
        get workspaceFolder() { return this._workspaceFolder; }
        get cwd() { return this._cwd; }
        get initialCwd() { return this._initialCwd; }
        get description() {
            if (this._description) {
                return this._description;
            }
            const type = this.shellLaunchConfig.attachPersistentProcess?.type || this.shellLaunchConfig.type;
            if (type) {
                if (type === 'Task') {
                    return nls.localize('terminalTypeTask', "Task");
                }
                return nls.localize('terminalTypeLocal', "Local");
            }
            return undefined;
        }
        get userHome() { return this._userHome; }
        get shellIntegrationNonce() { return this._processManager.shellIntegrationNonce; }
        get injectedArgs() { return this._injectedArgs; }
        constructor(_terminalShellTypeContextKey, _terminalInRunCommandPicker, _terminalSuggestWidgetVisibleContextKey, _configHelper, _shellLaunchConfig, _contextKeyService, instantiationService, _terminalProfileResolverService, _pathService, _keybindingService, _notificationService, _preferencesService, _viewsService, _clipboardService, _themeService, _configurationService, _logService, _dialogService, _storageService, _accessibilityService, _productService, _quickInputService, workbenchEnvironmentService, _workspaceContextService, _editorService, _workspaceTrustRequestService, _historyService, _telemetryService, _openerService, _commandService, _audioCueService, _viewDescriptorService) {
            super();
            this._terminalShellTypeContextKey = _terminalShellTypeContextKey;
            this._terminalInRunCommandPicker = _terminalInRunCommandPicker;
            this._terminalSuggestWidgetVisibleContextKey = _terminalSuggestWidgetVisibleContextKey;
            this._configHelper = _configHelper;
            this._shellLaunchConfig = _shellLaunchConfig;
            this._contextKeyService = _contextKeyService;
            this._terminalProfileResolverService = _terminalProfileResolverService;
            this._pathService = _pathService;
            this._keybindingService = _keybindingService;
            this._notificationService = _notificationService;
            this._preferencesService = _preferencesService;
            this._viewsService = _viewsService;
            this._clipboardService = _clipboardService;
            this._themeService = _themeService;
            this._configurationService = _configurationService;
            this._logService = _logService;
            this._dialogService = _dialogService;
            this._storageService = _storageService;
            this._accessibilityService = _accessibilityService;
            this._productService = _productService;
            this._quickInputService = _quickInputService;
            this._workspaceContextService = _workspaceContextService;
            this._editorService = _editorService;
            this._workspaceTrustRequestService = _workspaceTrustRequestService;
            this._historyService = _historyService;
            this._telemetryService = _telemetryService;
            this._openerService = _openerService;
            this._commandService = _commandService;
            this._audioCueService = _audioCueService;
            this._viewDescriptorService = _viewDescriptorService;
            this._contributions = new Map();
            this._latestXtermWriteData = 0;
            this._latestXtermParseData = 0;
            this._title = '';
            this._titleSource = terminal_1.TitleEventSource.Process;
            this._cols = 0;
            this._rows = 0;
            this._cwd = undefined;
            this._initialCwd = undefined;
            this._injectedArgs = undefined;
            this._layoutSettingsChanged = true;
            this._areLinksReady = false;
            this._initialDataEvents = [];
            this._messageTitleDisposable = this._register(new lifecycle_1.MutableDisposable());
            this._widgetManager = new widgetManager_1.TerminalWidgetManager();
            this._dndObserver = this._register(new lifecycle_1.MutableDisposable());
            this._processName = '';
            this._usedShellIntegrationInjection = false;
            this.capabilities = new terminalCapabilityStore_1.TerminalCapabilityStoreMultiplexer();
            this.disableLayout = false;
            // The onExit event is special in that it fires and is disposed after the terminal instance
            // itself is disposed
            this._onExit = new event_1.Emitter();
            this.onExit = this._onExit.event;
            this._onDisposed = this._register(new event_1.Emitter());
            this.onDisposed = this._onDisposed.event;
            this._onProcessIdReady = this._register(new event_1.Emitter());
            this.onProcessIdReady = this._onProcessIdReady.event;
            this._onProcessReplayComplete = this._register(new event_1.Emitter());
            this.onProcessReplayComplete = this._onProcessReplayComplete.event;
            this._onTitleChanged = this._register(new event_1.Emitter());
            this.onTitleChanged = this._onTitleChanged.event;
            this._onIconChanged = this._register(new event_1.Emitter());
            this.onIconChanged = this._onIconChanged.event;
            this._onData = this._register(new event_1.Emitter());
            this.onData = this._onData.event;
            this._onBinary = this._register(new event_1.Emitter());
            this.onBinary = this._onBinary.event;
            this._onLineData = this._register(new event_1.Emitter({
                onDidAddFirstListener: () => this._onLineDataSetup()
            }));
            this.onLineData = this._onLineData.event;
            this._onRequestExtHostProcess = this._register(new event_1.Emitter());
            this.onRequestExtHostProcess = this._onRequestExtHostProcess.event;
            this._onDimensionsChanged = this._register(new event_1.Emitter());
            this.onDimensionsChanged = this._onDimensionsChanged.event;
            this._onMaximumDimensionsChanged = this._register(new event_1.Emitter());
            this.onMaximumDimensionsChanged = this._onMaximumDimensionsChanged.event;
            this._onDidFocus = this._register(new event_1.Emitter());
            this.onDidFocus = this._onDidFocus.event;
            this._onDidRequestFocus = this._register(new event_1.Emitter());
            this.onDidRequestFocus = this._onDidRequestFocus.event;
            this._onDidBlur = this._register(new event_1.Emitter());
            this.onDidBlur = this._onDidBlur.event;
            this._onDidInputData = this._register(new event_1.Emitter());
            this.onDidInputData = this._onDidInputData.event;
            this._onDidChangeSelection = this._register(new event_1.Emitter());
            this.onDidChangeSelection = this._onDidChangeSelection.event;
            this._onRequestAddInstanceToGroup = this._register(new event_1.Emitter());
            this.onRequestAddInstanceToGroup = this._onRequestAddInstanceToGroup.event;
            this._onDidChangeHasChildProcesses = this._register(new event_1.Emitter());
            this.onDidChangeHasChildProcesses = this._onDidChangeHasChildProcesses.event;
            this._onDidRunText = this._register(new event_1.Emitter());
            this.onDidRunText = this._onDidRunText.event;
            this._wrapperElement = document.createElement('div');
            this._wrapperElement.classList.add('terminal-wrapper');
            this._skipTerminalCommands = [];
            this._isExiting = false;
            this._hadFocusOnExit = false;
            this._isVisible = false;
            this._isDisposed = false;
            this._instanceId = TerminalInstance_1._instanceIdCounter++;
            this._hasHadInput = false;
            this._fixedRows = _shellLaunchConfig.attachPersistentProcess?.fixedDimensions?.rows;
            this._fixedCols = _shellLaunchConfig.attachPersistentProcess?.fixedDimensions?.cols;
            this._resource = (0, terminalUri_1.getTerminalUri)(this._workspaceContextService.getWorkspace().id, this.instanceId, this.title);
            if (this._shellLaunchConfig.attachPersistentProcess?.hideFromUser) {
                this._shellLaunchConfig.hideFromUser = this._shellLaunchConfig.attachPersistentProcess.hideFromUser;
            }
            if (this._shellLaunchConfig.attachPersistentProcess?.isFeatureTerminal) {
                this._shellLaunchConfig.isFeatureTerminal = this._shellLaunchConfig.attachPersistentProcess.isFeatureTerminal;
            }
            if (this._shellLaunchConfig.attachPersistentProcess?.type) {
                this._shellLaunchConfig.type = this._shellLaunchConfig.attachPersistentProcess.type;
            }
            if (this.shellLaunchConfig.cwd) {
                const cwdUri = typeof this._shellLaunchConfig.cwd === 'string' ? uri_1.URI.from({
                    scheme: network_1.Schemas.file,
                    path: this._shellLaunchConfig.cwd
                }) : this._shellLaunchConfig.cwd;
                if (cwdUri) {
                    this._workspaceFolder = this._workspaceContextService.getWorkspaceFolder(cwdUri) ?? undefined;
                }
            }
            if (!this._workspaceFolder) {
                const activeWorkspaceRootUri = this._historyService.getLastActiveWorkspaceRoot();
                this._workspaceFolder = activeWorkspaceRootUri ? this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? undefined : undefined;
            }
            const scopedContextKeyService = this._register(_contextKeyService.createScoped(this._wrapperElement));
            this._scopedInstantiationService = instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, scopedContextKeyService]));
            this._terminalFocusContextKey = terminalContextKey_1.TerminalContextKeys.focus.bindTo(scopedContextKeyService);
            this._terminalHasFixedWidth = terminalContextKey_1.TerminalContextKeys.terminalHasFixedWidth.bindTo(scopedContextKeyService);
            this._terminalHasTextContextKey = terminalContextKey_1.TerminalContextKeys.textSelected.bindTo(scopedContextKeyService);
            this._terminalAltBufferActiveContextKey = terminalContextKey_1.TerminalContextKeys.altBufferActive.bindTo(scopedContextKeyService);
            this._terminalShellIntegrationEnabledContextKey = terminalContextKey_1.TerminalContextKeys.terminalShellIntegrationEnabled.bindTo(scopedContextKeyService);
            this._logService.trace(`terminalInstance#ctor (instanceId: ${this.instanceId})`, this._shellLaunchConfig);
            this._register(this.capabilities.onDidAddCapabilityType(e => {
                this._logService.debug('terminalInstance added capability', e);
                if (e === 0 /* TerminalCapability.CwdDetection */) {
                    this.capabilities.get(0 /* TerminalCapability.CwdDetection */)?.onDidChangeCwd(e => {
                        this._cwd = e;
                        this._setTitle(this.title, terminal_1.TitleEventSource.Config);
                        this._scopedInstantiationService.invokeFunction(history_1.getDirectoryHistory)?.add(e, { remoteAuthority: this.remoteAuthority });
                    });
                }
                else if (e === 2 /* TerminalCapability.CommandDetection */) {
                    const commandCapability = this.capabilities.get(2 /* TerminalCapability.CommandDetection */);
                    commandCapability?.onCommandFinished(e => {
                        if (e.command.trim().length > 0) {
                            this._scopedInstantiationService.invokeFunction(history_1.getCommandHistory)?.add(e.command, { shellType: this._shellType });
                        }
                    });
                }
            }));
            this._register(this.capabilities.onDidRemoveCapabilityType(e => this._logService.debug('terminalInstance removed capability', e)));
            // Resolve just the icon ahead of time so that it shows up immediately in the tabs. This is
            // disabled in remote because this needs to be sync and the OS may differ on the remote
            // which would result in the wrong profile being selected and the wrong icon being
            // permanently attached to the terminal. This also doesn't work when the default profile
            // setting is set to null, that's handled after the process is created.
            if (!this.shellLaunchConfig.executable && !workbenchEnvironmentService.remoteAuthority) {
                this._terminalProfileResolverService.resolveIcon(this._shellLaunchConfig, platform_1.OS);
            }
            this._icon = _shellLaunchConfig.attachPersistentProcess?.icon || _shellLaunchConfig.icon;
            // When a custom pty is used set the name immediately so it gets passed over to the exthost
            // and is available when Pseudoterminal.open fires.
            if (this.shellLaunchConfig.customPtyImplementation) {
                this._setTitle(this._shellLaunchConfig.name, terminal_1.TitleEventSource.Api);
            }
            this.statusList = this._scopedInstantiationService.createInstance(terminalStatusList_1.TerminalStatusList);
            this._initDimensions();
            this._processManager = this._createProcessManager();
            this._containerReadyBarrier = new async_1.AutoOpenBarrier(100 /* Constants.WaitForContainerThreshold */);
            this._attachBarrier = new async_1.AutoOpenBarrier(1000);
            this._xtermReadyPromise = this._createXterm();
            this._xtermReadyPromise.then(async () => {
                // Wait for a period to allow a container to be ready
                await this._containerReadyBarrier.wait();
                // Resolve the executable ahead of time if shell integration is enabled, this should not
                // be done for custom PTYs as that would cause extension Pseudoterminal-based terminals
                // to hang in resolver extensions
                if (!this.shellLaunchConfig.customPtyImplementation && this._configHelper.config.shellIntegration?.enabled && !this.shellLaunchConfig.executable) {
                    const os = await this._processManager.getBackendOS();
                    const defaultProfile = (await this._terminalProfileResolverService.getDefaultProfile({ remoteAuthority: this.remoteAuthority, os }));
                    this.shellLaunchConfig.executable = defaultProfile.path;
                    this.shellLaunchConfig.args = defaultProfile.args;
                    if (this.shellLaunchConfig.isExtensionOwnedTerminal) {
                        // Only use default icon and color if they are undefined in the SLC
                        this.shellLaunchConfig.icon ??= defaultProfile.icon;
                        this.shellLaunchConfig.color ??= defaultProfile.color;
                    }
                    else {
                        this.shellLaunchConfig.icon = defaultProfile.icon;
                        this.shellLaunchConfig.color = defaultProfile.color;
                    }
                }
                await this._createProcess();
                // Re-establish the title after reconnect
                if (this.shellLaunchConfig.attachPersistentProcess) {
                    this._cwd = this.shellLaunchConfig.attachPersistentProcess.cwd;
                    this._setTitle(this.shellLaunchConfig.attachPersistentProcess.title, this.shellLaunchConfig.attachPersistentProcess.titleSource);
                    this.setShellType(this.shellType);
                }
                if (this._fixedCols) {
                    await this._addScrollbar();
                }
            }).catch((err) => {
                // Ignore exceptions if the terminal is already disposed
                if (!this._isDisposed) {
                    throw err;
                }
            });
            this._register(this._configurationService.onDidChangeConfiguration(async (e) => {
                if (e.affectsConfiguration("accessibility.verbosity.terminal" /* AccessibilityVerbositySettingId.Terminal */)) {
                    this._setAriaLabel(this.xterm?.raw, this._instanceId, this.title);
                }
                if (e.affectsConfiguration('terminal.integrated')) {
                    this.updateConfig();
                    this.setVisible(this._isVisible);
                }
                const layoutSettings = [
                    "terminal.integrated.fontSize" /* TerminalSettingId.FontSize */,
                    "terminal.integrated.fontFamily" /* TerminalSettingId.FontFamily */,
                    "terminal.integrated.fontWeight" /* TerminalSettingId.FontWeight */,
                    "terminal.integrated.fontWeightBold" /* TerminalSettingId.FontWeightBold */,
                    "terminal.integrated.letterSpacing" /* TerminalSettingId.LetterSpacing */,
                    "terminal.integrated.lineHeight" /* TerminalSettingId.LineHeight */,
                    'editor.fontFamily'
                ];
                if (layoutSettings.some(id => e.affectsConfiguration(id))) {
                    this._layoutSettingsChanged = true;
                    await this._resize();
                }
                if (e.affectsConfiguration("terminal.integrated.unicodeVersion" /* TerminalSettingId.UnicodeVersion */)) {
                    this._updateUnicodeVersion();
                }
                if (e.affectsConfiguration('editor.accessibilitySupport')) {
                    this.updateAccessibilitySupport();
                }
                if (e.affectsConfiguration("terminal.integrated.tabs.title" /* TerminalSettingId.TerminalTitle */) ||
                    e.affectsConfiguration("terminal.integrated.tabs.separator" /* TerminalSettingId.TerminalTitleSeparator */) ||
                    e.affectsConfiguration("terminal.integrated.tabs.description" /* TerminalSettingId.TerminalDescription */)) {
                    this._labelComputer?.refreshLabel(this);
                }
            }));
            this._register(this._workspaceContextService.onDidChangeWorkspaceFolders(() => this._labelComputer?.refreshLabel(this)));
            this._register(this.onDidBlur(() => this.xterm?.suggestController?.hideSuggestWidget()));
            // Clear out initial data events after 10 seconds, hopefully extension hosts are up and
            // running at that point.
            let initialDataEventsTimeout = window.setTimeout(() => {
                initialDataEventsTimeout = undefined;
                this._initialDataEvents = undefined;
            }, 10000);
            this._register((0, lifecycle_1.toDisposable)(() => {
                if (initialDataEventsTimeout) {
                    window.clearTimeout(initialDataEventsTimeout);
                }
            }));
            // Initialize contributions
            const contributionDescs = terminalExtensions_1.TerminalExtensionsRegistry.getTerminalContributions();
            for (const desc of contributionDescs) {
                if (this._contributions.has(desc.id)) {
                    (0, errors_1.onUnexpectedError)(new Error(`Cannot have two terminal contributions with the same id ${desc.id}`));
                    continue;
                }
                let contribution;
                try {
                    contribution = this._scopedInstantiationService.createInstance(desc.ctor, this, this._processManager, this._widgetManager);
                    this._contributions.set(desc.id, contribution);
                }
                catch (err) {
                    (0, errors_1.onUnexpectedError)(err);
                }
                this._xtermReadyPromise.then(xterm => {
                    contribution.xtermReady?.(xterm);
                });
                this.onDisposed(() => {
                    contribution.dispose();
                    this._contributions.delete(desc.id);
                    // Just in case to prevent potential future memory leaks due to cyclic dependency.
                    if ('instance' in contribution) {
                        delete contribution.instance;
                    }
                    if ('_instance' in contribution) {
                        delete contribution._instance;
                    }
                });
            }
        }
        getContribution(id) {
            return this._contributions.get(id);
        }
        _getIcon() {
            if (!this._icon) {
                this._icon = this._processManager.processState >= 2 /* ProcessState.Launching */
                    ? (0, iconRegistry_1.getIconRegistry)().getIcon(this._configurationService.getValue("terminal.integrated.tabs.defaultIcon" /* TerminalSettingId.TabsDefaultIcon */))
                    : undefined;
            }
            return this._icon;
        }
        _getColor() {
            if (this.shellLaunchConfig.color) {
                return this.shellLaunchConfig.color;
            }
            if (this.shellLaunchConfig?.attachPersistentProcess?.color) {
                return this.shellLaunchConfig.attachPersistentProcess.color;
            }
            if (this._processManager.processState >= 2 /* ProcessState.Launching */) {
                return undefined;
            }
            return undefined;
        }
        _initDimensions() {
            // The terminal panel needs to have been created to get the real view dimensions
            if (!this._container) {
                // Set the fallback dimensions if not
                this._cols = 80 /* Constants.DefaultCols */;
                this._rows = 30 /* Constants.DefaultRows */;
                return;
            }
            const computedStyle = window.getComputedStyle(this._container);
            const width = parseInt(computedStyle.width);
            const height = parseInt(computedStyle.height);
            this._evaluateColsAndRows(width, height);
        }
        /**
         * Evaluates and sets the cols and rows of the terminal if possible.
         * @param width The width of the container.
         * @param height The height of the container.
         * @return The terminal's width if it requires a layout.
         */
        _evaluateColsAndRows(width, height) {
            // Ignore if dimensions are undefined or 0
            if (!width || !height) {
                this._setLastKnownColsAndRows();
                return null;
            }
            const dimension = this._getDimension(width, height);
            if (!dimension) {
                this._setLastKnownColsAndRows();
                return null;
            }
            const font = this.xterm ? this.xterm.getFont() : this._configHelper.getFont();
            const newRC = (0, xtermTerminal_1.getXtermScaledDimensions)(font, dimension.width, dimension.height);
            if (!newRC) {
                this._setLastKnownColsAndRows();
                return null;
            }
            if (this._cols !== newRC.cols || this._rows !== newRC.rows) {
                this._cols = newRC.cols;
                this._rows = newRC.rows;
                this._fireMaximumDimensionsChanged();
            }
            return dimension.width;
        }
        _setLastKnownColsAndRows() {
            if (TerminalInstance_1._lastKnownGridDimensions) {
                this._cols = TerminalInstance_1._lastKnownGridDimensions.cols;
                this._rows = TerminalInstance_1._lastKnownGridDimensions.rows;
            }
        }
        _fireMaximumDimensionsChanged() {
            this._onMaximumDimensionsChanged.fire();
        }
        _getDimension(width, height) {
            // The font needs to have been initialized
            const font = this.xterm ? this.xterm.getFont() : this._configHelper.getFont();
            if (!font || !font.charWidth || !font.charHeight) {
                return undefined;
            }
            if (!this.xterm?.raw.element) {
                return undefined;
            }
            const computedStyle = window.getComputedStyle(this.xterm.raw.element);
            const horizontalPadding = parseInt(computedStyle.paddingLeft) + parseInt(computedStyle.paddingRight);
            const verticalPadding = parseInt(computedStyle.paddingTop) + parseInt(computedStyle.paddingBottom);
            TerminalInstance_1._lastKnownCanvasDimensions = new dom.Dimension(Math.min(8000 /* Constants.MaxCanvasWidth */, width - horizontalPadding), height + (this._hasScrollBar && !this._horizontalScrollbar ? -5 /* scroll bar height */ : 0) - 2 /* bottom padding */ - verticalPadding);
            return TerminalInstance_1._lastKnownCanvasDimensions;
        }
        get persistentProcessId() { return this._processManager.persistentProcessId; }
        get shouldPersist() { return this._processManager.shouldPersist && !this.shellLaunchConfig.isTransient && (!this.reconnectionProperties || this._configurationService.getValue('task.reconnection') === true); }
        static getXtermConstructor(keybindingService, contextKeyService) {
            const keybinding = keybindingService.lookupKeybinding("workbench.action.terminal.focusAccessibleBuffer" /* TerminalCommandId.FocusAccessibleBuffer */, contextKeyService);
            if (xtermConstructor) {
                return xtermConstructor;
            }
            xtermConstructor = async_1.Promises.withAsyncBody(async (resolve) => {
                const Terminal = (await (0, amdX_1.importAMDNodeModule)('xterm', 'lib/xterm.js')).Terminal;
                // Localize strings
                Terminal.strings.promptLabel = nls.localize('terminal.integrated.a11yPromptLabel', 'Terminal input');
                Terminal.strings.tooMuchOutput = keybinding ? nls.localize('terminal.integrated.useAccessibleBuffer', 'Use the accessible buffer {0} to manually review output', keybinding.getLabel()) : nls.localize('terminal.integrated.useAccessibleBufferNoKb', 'Use the Terminal: Focus Accessible Buffer command to manually review output');
                resolve(Terminal);
            });
            return xtermConstructor;
        }
        /**
         * Create xterm.js instance and attach data listeners.
         */
        async _createXterm() {
            const Terminal = await TerminalInstance_1.getXtermConstructor(this._keybindingService, this._contextKeyService);
            if (this._isDisposed) {
                throw new errors_1.ErrorNoTelemetry('Terminal disposed of during xterm.js creation');
            }
            const disableShellIntegrationReporting = (this.shellLaunchConfig.hideFromUser || this.shellLaunchConfig.executable === undefined || this.shellType === undefined) || !shellIntegrationSupportedShellTypes.includes(this.shellType);
            const xterm = this._scopedInstantiationService.createInstance(xtermTerminal_1.XtermTerminal, Terminal, this._configHelper, this._cols, this._rows, {
                getBackgroundColor: (theme) => {
                    const terminalBackground = theme.getColor(terminalColorRegistry_1.TERMINAL_BACKGROUND_COLOR);
                    if (terminalBackground) {
                        return terminalBackground;
                    }
                    if (this.target === terminal_1.TerminalLocation.Editor) {
                        return theme.getColor(colorRegistry_1.editorBackground);
                    }
                    const location = this._viewDescriptorService.getViewLocationById(terminal_2.TERMINAL_VIEW_ID);
                    if (location === 1 /* ViewContainerLocation.Panel */) {
                        return theme.getColor(theme_1.PANEL_BACKGROUND);
                    }
                    return theme.getColor(theme_1.SIDE_BAR_BACKGROUND);
                }
            }, this.capabilities, this._processManager.shellIntegrationNonce, this._terminalSuggestWidgetVisibleContextKey, disableShellIntegrationReporting);
            this.xterm = xterm;
            this.updateAccessibilitySupport();
            this.xterm.onDidRequestRunCommand(e => {
                if (e.copyAsHtml) {
                    this.copySelection(true, e.command);
                }
                else {
                    this.sendText(e.command.command, e.noNewLine ? false : true);
                }
            });
            this.xterm.onDidRequestFocus(() => this.focus());
            this.xterm.onDidRequestSendText(e => this.sendText(e, false));
            // Write initial text, deferring onLineFeed listener when applicable to avoid firing
            // onLineData events containing initialText
            const initialTextWrittenPromise = this._shellLaunchConfig.initialText ? new Promise(r => this._writeInitialText(xterm, r)) : undefined;
            const lineDataEventAddon = this._register(new lineDataEventAddon_1.LineDataEventAddon(initialTextWrittenPromise));
            lineDataEventAddon.onLineData(e => this._onLineData.fire(e));
            this._lineDataEventAddon = lineDataEventAddon;
            // Delay the creation of the bell listener to avoid showing the bell when the terminal
            // starts up or reconnects
            setTimeout(() => {
                this._register(xterm.raw.onBell(() => {
                    if (this._configHelper.config.enableBell) {
                        this.statusList.add({
                            id: "bell" /* TerminalStatus.Bell */,
                            severity: notification_1.Severity.Warning,
                            icon: codicons_1.Codicon.bell,
                            tooltip: nls.localize('bellStatus', "Bell")
                        }, this._configHelper.config.bellDuration);
                        this._audioCueService.playSound(audioCueService_1.AudioCue.terminalBell.sound.getSound());
                    }
                }));
            }, 1000);
            this._register(xterm.raw.onSelectionChange(async () => this._onSelectionChange()));
            this._register(xterm.raw.buffer.onBufferChange(() => this._refreshAltBufferContextKey()));
            this._processManager.onProcessData(e => this._onProcessData(e));
            this._register(xterm.raw.onData(async (data) => {
                await this._processManager.write(data);
                this._onDidInputData.fire(this);
            }));
            this._register(xterm.raw.onBinary(data => this._processManager.processBinary(data)));
            // Init winpty compat and link handler after process creation as they rely on the
            // underlying process OS
            this._processManager.onProcessReady(async (processTraits) => {
                if (this._processManager.os) {
                    lineDataEventAddon.setOperatingSystem(this._processManager.os);
                }
                xterm.raw.options.windowsPty = processTraits.windowsPty;
            });
            this._processManager.onRestoreCommands(e => this.xterm?.shellIntegration.deserialize(e));
            this._register(this._viewDescriptorService.onDidChangeLocation(({ views }) => {
                if (views.some(v => v.id === terminal_2.TERMINAL_VIEW_ID)) {
                    xterm.refresh();
                }
            }));
            // Set up updating of the process cwd on key press, this is only needed when the cwd
            // detection capability has not been registered
            if (!this.capabilities.has(0 /* TerminalCapability.CwdDetection */)) {
                let onKeyListener = xterm.raw.onKey(e => {
                    const event = new keyboardEvent_1.StandardKeyboardEvent(e.domEvent);
                    if (event.equals(3 /* KeyCode.Enter */)) {
                        this._updateProcessCwd();
                    }
                });
                this._register(this.capabilities.onDidAddCapabilityType(e => {
                    if (e === 0 /* TerminalCapability.CwdDetection */) {
                        onKeyListener?.dispose();
                        onKeyListener = undefined;
                    }
                }));
            }
            this._pathService.userHome().then(userHome => {
                this._userHome = userHome.fsPath;
            });
            if (this._isVisible) {
                this._open();
            }
            return xterm;
        }
        async _onLineDataSetup() {
            const xterm = this.xterm || await this._xtermReadyPromise;
            xterm.raw.loadAddon(this._lineDataEventAddon);
        }
        async runCommand(commandLine, addNewLine) {
            // Determine whether to send ETX (ctrl+c) before running the command. This should always
            // happen unless command detection can reliably say that a command is being entered and
            // there is no content in the prompt
            if (this.capabilities.get(2 /* TerminalCapability.CommandDetection */)?.hasInput !== false) {
                await this.sendText('\x03', false);
                // Wait a little before running the command to avoid the sequences being echoed while the ^C
                // is being evaluated
                await (0, async_1.timeout)(100);
            }
            // Use bracketed paste mode only when not running the command
            await this.sendText(commandLine, addNewLine, !addNewLine);
        }
        async runRecent(type, filterMode, value) {
            return this._scopedInstantiationService.invokeFunction(terminalRunRecentQuickPick_1.showRunRecentQuickPick, this, this._terminalInRunCommandPicker, type, filterMode, value);
        }
        detachFromElement() {
            this._wrapperElement.remove();
            this._container = undefined;
        }
        attachToElement(container) {
            // The container did not change, do nothing
            if (this._container === container) {
                return;
            }
            this._attachBarrier.open();
            // The container changed, reattach
            this._container = container;
            this._container.appendChild(this._wrapperElement);
            this.xterm?.refresh();
            setTimeout(() => this._initDragAndDrop(container));
        }
        /**
         * Opens the the terminal instance inside the parent DOM element previously set with
         * `attachToElement`, you must ensure the parent DOM element is explicitly visible before
         * invoking this function as it performs some DOM calculations internally
         */
        _open() {
            if (!this.xterm || this.xterm.raw.element) {
                return;
            }
            if (!this._container || !this._container.isConnected) {
                throw new Error('A container element needs to be set with `attachToElement` and be part of the DOM before calling `_open`');
            }
            const xtermElement = document.createElement('div');
            this._wrapperElement.appendChild(xtermElement);
            this._container.appendChild(this._wrapperElement);
            const xterm = this.xterm;
            // Attach the xterm object to the DOM, exposing it to the smoke tests
            this._wrapperElement.xterm = xterm.raw;
            const screenElement = xterm.attachToElement(xtermElement);
            this._register(xterm.shellIntegration.onDidChangeStatus(() => {
                if (this.hasFocus) {
                    this._setShellIntegrationContextKey();
                }
                else {
                    this._terminalShellIntegrationEnabledContextKey.reset();
                }
            }));
            if (!xterm.raw.element || !xterm.raw.textarea) {
                throw new Error('xterm elements not set after open');
            }
            this._setAriaLabel(xterm.raw, this._instanceId, this._title);
            xterm.raw.attachCustomKeyEventHandler((event) => {
                // Disable all input if the terminal is exiting
                if (this._isExiting) {
                    return false;
                }
                const standardKeyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(event);
                const resolveResult = this._keybindingService.softDispatch(standardKeyboardEvent, standardKeyboardEvent.target);
                // Respect chords if the allowChords setting is set and it's not Escape. Escape is
                // handled specially for Zen Mode's Escape, Escape chord, plus it's important in
                // terminals generally
                const isValidChord = resolveResult.kind === 1 /* ResultKind.MoreChordsNeeded */ && this._configHelper.config.allowChords && event.key !== 'Escape';
                if (this._keybindingService.inChordMode || isValidChord) {
                    event.preventDefault();
                    return false;
                }
                const SHOW_TERMINAL_CONFIG_PROMPT_KEY = 'terminal.integrated.showTerminalConfigPrompt';
                const EXCLUDED_KEYS = ['RightArrow', 'LeftArrow', 'UpArrow', 'DownArrow', 'Space', 'Meta', 'Control', 'Shift', 'Alt', '', 'Delete', 'Backspace', 'Tab'];
                // only keep track of input if prompt hasn't already been shown
                if (this._storageService.getBoolean(SHOW_TERMINAL_CONFIG_PROMPT_KEY, -1 /* StorageScope.APPLICATION */, true) &&
                    !EXCLUDED_KEYS.includes(event.key) &&
                    !event.ctrlKey &&
                    !event.shiftKey &&
                    !event.altKey) {
                    this._hasHadInput = true;
                }
                // for keyboard events that resolve to commands described
                // within commandsToSkipShell, either alert or skip processing by xterm.js
                if (resolveResult.kind === 2 /* ResultKind.KbFound */ && resolveResult.commandId && this._skipTerminalCommands.some(k => k === resolveResult.commandId) && !this._configHelper.config.sendKeybindingsToShell) {
                    // don't alert when terminal is opened or closed
                    if (this._storageService.getBoolean(SHOW_TERMINAL_CONFIG_PROMPT_KEY, -1 /* StorageScope.APPLICATION */, true) &&
                        this._hasHadInput &&
                        !terminal_2.TERMINAL_CREATION_COMMANDS.includes(resolveResult.commandId)) {
                        this._notificationService.prompt(notification_1.Severity.Info, nls.localize('keybindingHandling', "Some keybindings don't go to the terminal by default and are handled by {0} instead.", this._productService.nameLong), [
                            {
                                label: nls.localize('configureTerminalSettings', "Configure Terminal Settings"),
                                run: () => {
                                    this._preferencesService.openSettings({ jsonEditor: false, query: `@id:${"terminal.integrated.commandsToSkipShell" /* TerminalSettingId.CommandsToSkipShell */},${"terminal.integrated.sendKeybindingsToShell" /* TerminalSettingId.SendKeybindingsToShell */},${"terminal.integrated.allowChords" /* TerminalSettingId.AllowChords */}` });
                                }
                            }
                        ]);
                        this._storageService.store(SHOW_TERMINAL_CONFIG_PROMPT_KEY, false, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                    }
                    event.preventDefault();
                    return false;
                }
                // Skip processing by xterm.js of keyboard events that match menu bar mnemonics
                if (this._configHelper.config.allowMnemonics && !platform_1.isMacintosh && event.altKey) {
                    return false;
                }
                // If tab focus mode is on, tab is not passed to the terminal
                if (tabFocus_1.TabFocus.getTabFocusMode() && event.key === 'Tab') {
                    return false;
                }
                // Prevent default when shift+tab is being sent to the terminal to avoid it bubbling up
                // and changing focus https://github.com/microsoft/vscode/issues/188329
                if (event.key === 'Tab' && event.shiftKey) {
                    event.preventDefault();
                    return true;
                }
                // Always have alt+F4 skip the terminal on Windows and allow it to be handled by the
                // system
                if (platform_1.isWindows && event.altKey && event.key === 'F4' && !event.ctrlKey) {
                    return false;
                }
                // Fallback to force ctrl+v to paste on browsers that do not support
                // navigator.clipboard.readText
                if (!canIUse_1.BrowserFeatures.clipboard.readText && event.key === 'v' && event.ctrlKey) {
                    return false;
                }
                return true;
            });
            this._register(dom.addDisposableListener(xterm.raw.element, 'mousedown', () => {
                // We need to listen to the mouseup event on the document since the user may release
                // the mouse button anywhere outside of _xterm.element.
                const listener = dom.addDisposableListener(document, 'mouseup', () => {
                    // Delay with a setTimeout to allow the mouseup to propagate through the DOM
                    // before evaluating the new selection state.
                    setTimeout(() => this._refreshSelectionContextKey(), 0);
                    listener.dispose();
                });
            }));
            this._register(dom.addDisposableListener(xterm.raw.element, 'touchstart', () => {
                xterm.raw.focus();
            }));
            // xterm.js currently drops selection on keyup as we need to handle this case.
            this._register(dom.addDisposableListener(xterm.raw.element, 'keyup', () => {
                // Wait until keyup has propagated through the DOM before evaluating
                // the new selection state.
                setTimeout(() => this._refreshSelectionContextKey(), 0);
            }));
            this._register(dom.addDisposableListener(xterm.raw.textarea, 'focus', () => this._setFocus(true)));
            this._register(dom.addDisposableListener(xterm.raw.textarea, 'blur', () => this._setFocus(false)));
            this._register(dom.addDisposableListener(xterm.raw.textarea, 'focusout', () => this._setFocus(false)));
            this._initDragAndDrop(this._container);
            this._widgetManager.attachToElement(screenElement);
            if (this._lastLayoutDimensions) {
                this.layout(this._lastLayoutDimensions);
            }
            this.updateConfig();
            // If IShellLaunchConfig.waitOnExit was true and the process finished before the terminal
            // panel was initialized.
            if (xterm.raw.options.disableStdin) {
                this._attachPressAnyKeyToCloseListener(xterm.raw);
            }
        }
        _setFocus(focused) {
            if (focused) {
                this._terminalFocusContextKey.set(true);
                this._setShellIntegrationContextKey();
                this._onDidFocus.fire(this);
            }
            else {
                this.resetFocusContextKey();
                this._onDidBlur.fire(this);
                this._refreshSelectionContextKey();
            }
        }
        _setShellIntegrationContextKey() {
            if (this.xterm) {
                this._terminalShellIntegrationEnabledContextKey.set(this.xterm.shellIntegration.status === 2 /* ShellIntegrationStatus.VSCode */);
            }
        }
        resetFocusContextKey() {
            this._terminalFocusContextKey.reset();
            this._terminalShellIntegrationEnabledContextKey.reset();
        }
        _initDragAndDrop(container) {
            const dndController = this._register(this._scopedInstantiationService.createInstance(TerminalInstanceDragAndDropController, container));
            dndController.onDropTerminal(e => this._onRequestAddInstanceToGroup.fire(e));
            dndController.onDropFile(async (path) => {
                this.focus();
                await this.sendPath(path, false);
            });
            this._dndObserver.value = new dom.DragAndDropObserver(container, dndController);
        }
        hasSelection() {
            return this.xterm ? this.xterm.raw.hasSelection() : false;
        }
        async copySelection(asHtml, command) {
            const xterm = await this._xtermReadyPromise;
            await xterm.copySelection(asHtml, command);
        }
        get selection() {
            return this.xterm && this.hasSelection() ? this.xterm.raw.getSelection() : undefined;
        }
        clearSelection() {
            this.xterm?.raw.clearSelection();
        }
        _refreshAltBufferContextKey() {
            this._terminalAltBufferActiveContextKey.set(!!(this.xterm && this.xterm.raw.buffer.active === this.xterm.raw.buffer.alternate));
        }
        async _shouldPasteText(text) {
            // Ignore check if the shell is in bracketed paste mode (ie. the shell can handle multi-line
            // text).
            if (this.xterm?.raw.modes.bracketedPasteMode) {
                return true;
            }
            const textForLines = text.split(/\r?\n/);
            // Ignore check when a command is copied with a trailing new line
            if (textForLines.length === 2 && textForLines[1].trim().length === 0) {
                return true;
            }
            // If the clipboard has only one line, no prompt will be triggered
            if (textForLines.length === 1 || !this._configurationService.getValue("terminal.integrated.enableMultiLinePasteWarning" /* TerminalSettingId.EnableMultiLinePasteWarning */)) {
                return true;
            }
            const displayItemsCount = 3;
            const maxPreviewLineLength = 30;
            let detail = nls.localize('preview', "Preview:");
            for (let i = 0; i < Math.min(textForLines.length, displayItemsCount); i++) {
                const line = textForLines[i];
                const cleanedLine = line.length > maxPreviewLineLength ? `${line.slice(0, maxPreviewLineLength)}…` : line;
                detail += `\n${cleanedLine}`;
            }
            if (textForLines.length > displayItemsCount) {
                detail += `\n…`;
            }
            const { confirmed, checkboxChecked } = await this._dialogService.confirm({
                message: nls.localize('confirmMoveTrashMessageFilesAndDirectories', "Are you sure you want to paste {0} lines of text into the terminal?", textForLines.length),
                detail,
                primaryButton: nls.localize({ key: 'multiLinePasteButton', comment: ['&& denotes a mnemonic'] }, "&&Paste"),
                checkbox: {
                    label: nls.localize('doNotAskAgain', "Do not ask me again")
                }
            });
            if (confirmed && checkboxChecked) {
                await this._configurationService.updateValue("terminal.integrated.enableMultiLinePasteWarning" /* TerminalSettingId.EnableMultiLinePasteWarning */, false);
            }
            return confirmed;
        }
        dispose(reason) {
            if (this._isDisposed) {
                return;
            }
            this._isDisposed = true;
            this._logService.trace(`terminalInstance#dispose (instanceId: ${this.instanceId})`);
            (0, lifecycle_1.dispose)(this._widgetManager);
            if (this.xterm?.raw.element) {
                this._hadFocusOnExit = this.hasFocus;
            }
            if (this._wrapperElement.xterm) {
                this._wrapperElement.xterm = undefined;
            }
            if (this._horizontalScrollbar) {
                this._horizontalScrollbar.dispose();
                this._horizontalScrollbar = undefined;
            }
            try {
                this.xterm?.dispose();
            }
            catch (err) {
                // See https://github.com/microsoft/vscode/issues/153486
                this._logService.error('Exception occurred during xterm disposal', err);
            }
            // HACK: Workaround for Firefox bug https://bugzilla.mozilla.org/show_bug.cgi?id=559561,
            // as 'blur' event in xterm.raw.textarea is not triggered on xterm.dispose()
            // See https://github.com/microsoft/vscode/issues/138358
            if (browser_1.isFirefox) {
                this.resetFocusContextKey();
                this._terminalHasTextContextKey.reset();
                this._onDidBlur.fire(this);
            }
            if (this._pressAnyKeyToCloseListener) {
                this._pressAnyKeyToCloseListener.dispose();
                this._pressAnyKeyToCloseListener = undefined;
            }
            if (this._exitReason === undefined) {
                this._exitReason = reason ?? terminal_1.TerminalExitReason.Unknown;
            }
            this._processManager.dispose();
            // Process manager dispose/shutdown doesn't fire process exit, trigger with undefined if it
            // hasn't happened yet
            this._onProcessExit(undefined);
            this._onDisposed.fire(this);
            super.dispose();
        }
        async detachProcessAndDispose(reason) {
            // Detach the process and dispose the instance, without the instance dispose the terminal
            // won't go away. Force persist if the detach was requested by the user (not shutdown).
            await this._processManager.detachFromProcess(reason === terminal_1.TerminalExitReason.User);
            this.dispose(reason);
        }
        focus(force) {
            this._refreshAltBufferContextKey();
            if (!this.xterm) {
                return;
            }
            if (force || !window.getSelection()?.toString()) {
                this.xterm.raw.focus();
                this._onDidRequestFocus.fire();
            }
        }
        async focusWhenReady(force) {
            await this._xtermReadyPromise;
            await this._attachBarrier.wait();
            this.focus(force);
        }
        async paste() {
            if (!this.xterm) {
                return;
            }
            const currentText = await this._clipboardService.readText();
            if (!await this._shouldPasteText(currentText)) {
                return;
            }
            this.focus();
            this.xterm.raw.paste(currentText);
        }
        async pasteSelection() {
            if (!this.xterm) {
                return;
            }
            const currentText = await this._clipboardService.readText('selection');
            if (!await this._shouldPasteText(currentText)) {
                return;
            }
            this.focus();
            this.xterm.raw.paste(currentText);
        }
        async sendText(text, addNewLine, bracketedPasteMode) {
            // Apply bracketed paste sequences if the terminal has the mode enabled, this will prevent
            // the text from triggering keybindings and ensure new lines are handled properly
            if (bracketedPasteMode && this.xterm?.raw.modes.bracketedPasteMode) {
                text = `\x1b[200~${text}\x1b[201~`;
            }
            // Normalize line endings to 'enter' press.
            text = text.replace(/\r?\n/g, '\r');
            if (addNewLine && !text.endsWith('\r')) {
                text += '\r';
            }
            // Send it to the process
            await this._processManager.write(text);
            this._onDidInputData.fire(this);
            this.xterm?.suggestController?.handleNonXtermData(text);
            this.xterm?.scrollToBottom();
            this._onDidRunText.fire();
        }
        async sendPath(originalPath, addNewLine) {
            return this.sendText(await this.preparePathForShell(originalPath), addNewLine);
        }
        async preparePathForShell(originalPath) {
            // Wait for shell type to be ready
            await this.processReady;
            return (0, terminalEnvironment_1.preparePathForShell)(originalPath, this.shellLaunchConfig.executable, this.title, this.shellType, this._processManager.backend, this._processManager.os);
        }
        setVisible(visible) {
            this._isVisible = visible;
            this._wrapperElement.classList.toggle('active', visible);
            if (visible && this.xterm) {
                this._open();
                // Resize to re-evaluate dimensions, this will ensure when switching to a terminal it is
                // using the most up to date dimensions (eg. when terminal is created in the background
                // using cached dimensions of a split terminal).
                this._resize();
                // HACK: Trigger a forced refresh of the viewport to sync the viewport and scroll bar.
                // This is necessary if the number of rows in the terminal has decreased while it was in
                // the background since scrollTop changes take no effect but the terminal's position
                // does change since the number of visible rows decreases.
                // This can likely be removed after https://github.com/xtermjs/xterm.js/issues/291 is
                // fixed upstream.
                setTimeout(() => this.xterm.forceRefresh(), 0);
            }
        }
        scrollDownLine() {
            this.xterm?.scrollDownLine();
        }
        scrollDownPage() {
            this.xterm?.scrollDownPage();
        }
        scrollToBottom() {
            this.xterm?.scrollToBottom();
        }
        scrollUpLine() {
            this.xterm?.scrollUpLine();
        }
        scrollUpPage() {
            this.xterm?.scrollUpPage();
        }
        scrollToTop() {
            this.xterm?.scrollToTop();
        }
        clearBuffer() {
            this._processManager.clearBuffer();
            this.xterm?.clearBuffer();
        }
        _refreshSelectionContextKey() {
            const isActive = !!this._viewsService.getActiveViewWithId(terminal_2.TERMINAL_VIEW_ID);
            let isEditorActive = false;
            const editor = this._editorService.activeEditor;
            if (editor) {
                isEditorActive = editor instanceof terminalEditorInput_1.TerminalEditorInput;
            }
            this._terminalHasTextContextKey.set((isActive || isEditorActive) && this.hasSelection());
        }
        _createProcessManager() {
            let deserializedCollections;
            if (this.shellLaunchConfig.attachPersistentProcess?.environmentVariableCollections) {
                deserializedCollections = (0, environmentVariableShared_1.deserializeEnvironmentVariableCollections)(this.shellLaunchConfig.attachPersistentProcess.environmentVariableCollections);
            }
            const processManager = this._scopedInstantiationService.createInstance(terminalProcessManager_1.TerminalProcessManager, this._instanceId, this._configHelper, this.shellLaunchConfig?.cwd, deserializedCollections, this.shellLaunchConfig.attachPersistentProcess?.shellIntegrationNonce);
            this.capabilities.add(processManager.capabilities);
            processManager.onProcessReady(async (e) => {
                this._onProcessIdReady.fire(this);
                this._initialCwd = await this.getInitialCwd();
                // Set the initial name based on the _resolved_ shell launch config, this will also
                // ensure the resolved icon gets shown
                if (!this._labelComputer) {
                    this._labelComputer = this._register(this._scopedInstantiationService.createInstance(TerminalLabelComputer, this._configHelper));
                    this._register(this._labelComputer.onDidChangeLabel(e => {
                        this._title = e.title;
                        this._description = e.description;
                        this._onTitleChanged.fire(this);
                    }));
                }
                if (this._shellLaunchConfig.name) {
                    this._setTitle(this._shellLaunchConfig.name, terminal_1.TitleEventSource.Api);
                }
                else {
                    // Listen to xterm.js' sequence title change event, trigger this async to ensure
                    // _xtermReadyPromise is ready constructed since this is called from the ctor
                    setTimeout(() => {
                        this._xtermReadyPromise.then(xterm => {
                            this._messageTitleDisposable.value = xterm.raw.onTitleChange(e => this._onTitleChange(e));
                        });
                    });
                    this._setTitle(this._shellLaunchConfig.executable, terminal_1.TitleEventSource.Process);
                }
            });
            processManager.onProcessExit(exitCode => this._onProcessExit(exitCode));
            processManager.onDidChangeProperty(({ type, value }) => {
                switch (type) {
                    case "cwd" /* ProcessPropertyType.Cwd */:
                        this._cwd = value;
                        this._labelComputer?.refreshLabel(this);
                        break;
                    case "initialCwd" /* ProcessPropertyType.InitialCwd */:
                        this._initialCwd = value;
                        this._cwd = this._initialCwd;
                        this._setTitle(this.title, terminal_1.TitleEventSource.Config);
                        this._icon = this._shellLaunchConfig.attachPersistentProcess?.icon || this._shellLaunchConfig.icon;
                        this._onIconChanged.fire({ instance: this, userInitiated: false });
                        break;
                    case "title" /* ProcessPropertyType.Title */:
                        this._setTitle(value ?? '', terminal_1.TitleEventSource.Process);
                        break;
                    case "overrideDimensions" /* ProcessPropertyType.OverrideDimensions */:
                        this.setOverrideDimensions(value, true);
                        break;
                    case "resolvedShellLaunchConfig" /* ProcessPropertyType.ResolvedShellLaunchConfig */:
                        this._setResolvedShellLaunchConfig(value);
                        break;
                    case "shellType" /* ProcessPropertyType.ShellType */:
                        this.setShellType(value);
                        break;
                    case "hasChildProcesses" /* ProcessPropertyType.HasChildProcesses */:
                        this._onDidChangeHasChildProcesses.fire(value);
                        break;
                    case "usedShellIntegrationInjection" /* ProcessPropertyType.UsedShellIntegrationInjection */:
                        this._usedShellIntegrationInjection = true;
                        break;
                }
            });
            processManager.onProcessData(ev => {
                this._initialDataEvents?.push(ev.data);
                this._onData.fire(ev.data);
            });
            processManager.onProcessReplayComplete(() => this._onProcessReplayComplete.fire());
            processManager.onEnvironmentVariableInfoChanged(e => this._onEnvironmentVariableInfoChanged(e));
            processManager.onPtyDisconnect(() => {
                if (this.xterm) {
                    this.xterm.raw.options.disableStdin = true;
                }
                this.statusList.add({
                    id: "disconnected" /* TerminalStatus.Disconnected */,
                    severity: notification_1.Severity.Error,
                    icon: codicons_1.Codicon.debugDisconnect,
                    tooltip: nls.localize('disconnectStatus', "Lost connection to process")
                });
            });
            processManager.onPtyReconnect(() => {
                if (this.xterm) {
                    this.xterm.raw.options.disableStdin = false;
                }
                this.statusList.remove("disconnected" /* TerminalStatus.Disconnected */);
            });
            return processManager;
        }
        async _createProcess() {
            if (this._isDisposed) {
                return;
            }
            const activeWorkspaceRootUri = this._historyService.getLastActiveWorkspaceRoot(network_1.Schemas.file);
            if (activeWorkspaceRootUri) {
                const trusted = await this._trust();
                if (!trusted) {
                    this._onProcessExit({ message: nls.localize('workspaceNotTrustedCreateTerminal', "Cannot launch a terminal process in an untrusted workspace") });
                }
            }
            else if (this._cwd && this._userHome && this._cwd !== this._userHome) {
                // something strange is going on if cwd is not userHome in an empty workspace
                this._onProcessExit({
                    message: nls.localize('workspaceNotTrustedCreateTerminalCwd', "Cannot launch a terminal process in an untrusted workspace with cwd {0} and userHome {1}", this._cwd, this._userHome)
                });
            }
            // Re-evaluate dimensions if the container has been set since the xterm instance was created
            if (this._container && this._cols === 0 && this._rows === 0) {
                this._initDimensions();
                this.xterm?.raw.resize(this._cols || 80 /* Constants.DefaultCols */, this._rows || 30 /* Constants.DefaultRows */);
            }
            const originalIcon = this.shellLaunchConfig.icon;
            await this._processManager.createProcess(this._shellLaunchConfig, this._cols || 80 /* Constants.DefaultCols */, this._rows || 30 /* Constants.DefaultRows */).then(result => {
                if (result) {
                    if ('message' in result) {
                        this._onProcessExit(result);
                    }
                    else if ('injectedArgs' in result) {
                        this._injectedArgs = result.injectedArgs;
                    }
                }
            });
            if (this.xterm?.shellIntegration) {
                this.capabilities.add(this.xterm.shellIntegration.capabilities);
            }
            if (originalIcon !== this.shellLaunchConfig.icon || this.shellLaunchConfig.color) {
                this._icon = this._shellLaunchConfig.attachPersistentProcess?.icon || this._shellLaunchConfig.icon;
                this._onIconChanged.fire({ instance: this, userInitiated: false });
            }
        }
        registerMarker() {
            return this.xterm?.raw.registerMarker();
        }
        addBufferMarker(properties) {
            this.capabilities.get(4 /* TerminalCapability.BufferMarkDetection */)?.addMark(properties);
        }
        scrollToMark(startMarkId, endMarkId, highlight) {
            this.xterm?.markTracker.scrollToClosestMarker(startMarkId, endMarkId, highlight);
        }
        async freePortKillProcess(port, command) {
            await this._processManager?.freePortKillProcess(port);
            this.runCommand(command, false);
        }
        _onProcessData(ev) {
            const messageId = ++this._latestXtermWriteData;
            if (ev.trackCommit) {
                ev.writePromise = new Promise(r => {
                    this.xterm?.raw.write(ev.data, () => {
                        this._latestXtermParseData = messageId;
                        this._processManager.acknowledgeDataEvent(ev.data.length);
                        r();
                    });
                });
            }
            else {
                this.xterm?.raw.write(ev.data, () => {
                    this._latestXtermParseData = messageId;
                    this._processManager.acknowledgeDataEvent(ev.data.length);
                });
            }
        }
        /**
         * Called when either a process tied to a terminal has exited or when a terminal renderer
         * simulates a process exiting (e.g. custom execution task).
         * @param exitCode The exit code of the process, this is undefined when the terminal was exited
         * through user action.
         */
        async _onProcessExit(exitCodeOrError) {
            // Prevent dispose functions being triggered multiple times
            if (this._isExiting) {
                return;
            }
            const parsedExitResult = parseExitResult(exitCodeOrError, this.shellLaunchConfig, this._processManager.processState, this._initialCwd);
            if (this._usedShellIntegrationInjection && this._processManager.processState === 4 /* ProcessState.KilledDuringLaunch */ && parsedExitResult?.code !== 0) {
                this._relaunchWithShellIntegrationDisabled(parsedExitResult?.message);
                this._onExit.fire(exitCodeOrError);
                return;
            }
            this._isExiting = true;
            await this._flushXtermData();
            this._exitCode = parsedExitResult?.code;
            const exitMessage = parsedExitResult?.message;
            this._logService.debug('Terminal process exit', 'instanceId', this.instanceId, 'code', this._exitCode, 'processState', this._processManager.processState);
            // Only trigger wait on exit when the exit was *not* triggered by the
            // user (via the `workbench.action.terminal.kill` command).
            const waitOnExit = this.waitOnExit;
            if (waitOnExit && this._processManager.processState !== 5 /* ProcessState.KilledByUser */) {
                this._xtermReadyPromise.then(xterm => {
                    if (exitMessage) {
                        xterm.raw.write((0, terminalStrings_1.formatMessageForTerminal)(exitMessage));
                    }
                    switch (typeof waitOnExit) {
                        case 'string':
                            xterm.raw.write((0, terminalStrings_1.formatMessageForTerminal)(waitOnExit, { excludeLeadingNewLine: true }));
                            break;
                        case 'function':
                            if (this.exitCode !== undefined) {
                                xterm.raw.write((0, terminalStrings_1.formatMessageForTerminal)(waitOnExit(this.exitCode), { excludeLeadingNewLine: true }));
                            }
                            break;
                    }
                    // Disable all input if the terminal is exiting and listen for next keypress
                    xterm.raw.options.disableStdin = true;
                    if (xterm.raw.textarea) {
                        this._attachPressAnyKeyToCloseListener(xterm.raw);
                    }
                });
            }
            else {
                this.dispose(terminal_1.TerminalExitReason.Process);
                if (exitMessage) {
                    const failedDuringLaunch = this._processManager.processState === 4 /* ProcessState.KilledDuringLaunch */;
                    if (failedDuringLaunch || this._configHelper.config.showExitAlert) {
                        // Always show launch failures
                        this._notificationService.notify({
                            message: exitMessage,
                            severity: notification_1.Severity.Error,
                            actions: { primary: [this._scopedInstantiationService.createInstance(terminalActions_1.TerminalLaunchHelpAction)] }
                        });
                    }
                    else {
                        // Log to help surface the error in case users report issues with showExitAlert
                        // disabled
                        this._logService.warn(exitMessage);
                    }
                }
            }
            // First onExit to consumers, this can happen after the terminal has already been disposed.
            this._onExit.fire(exitCodeOrError);
            // Dispose of the onExit event if the terminal will not be reused again
            if (this._isDisposed) {
                this._onExit.dispose();
            }
        }
        _relaunchWithShellIntegrationDisabled(exitMessage) {
            this._shellLaunchConfig.ignoreShellIntegration = true;
            this.relaunch();
            this.statusList.add({
                id: "shell-integration-attention-needed" /* TerminalStatus.ShellIntegrationAttentionNeeded */,
                severity: notification_1.Severity.Warning,
                icon: codicons_1.Codicon.warning,
                tooltip: (`${exitMessage} ` ?? '') + nls.localize('launchFailed.exitCodeOnlyShellIntegration', 'Disabling shell integration in user settings might help.'),
                hoverActions: [{
                        commandId: "workbench.action.terminal.learnMore" /* TerminalCommandId.ShellIntegrationLearnMore */,
                        label: nls.localize('shellIntegration.learnMore', "Learn more about shell integration"),
                        run: () => {
                            this._openerService.open('https://code.visualstudio.com/docs/editor/integrated-terminal#_shell-integration');
                        }
                    }, {
                        commandId: 'workbench.action.openSettings',
                        label: nls.localize('shellIntegration.openSettings', "Open user settings"),
                        run: () => {
                            this._commandService.executeCommand('workbench.action.openSettings', 'terminal.integrated.shellIntegration.enabled');
                        }
                    }]
            });
            this._telemetryService.publicLog2('terminal/shellIntegrationFailureProcessExit');
        }
        /**
         * Ensure write calls to xterm.js have finished before resolving.
         */
        _flushXtermData() {
            if (this._latestXtermWriteData === this._latestXtermParseData) {
                return Promise.resolve();
            }
            let retries = 0;
            return new Promise(r => {
                const interval = setInterval(() => {
                    if (this._latestXtermWriteData === this._latestXtermParseData || ++retries === 5) {
                        clearInterval(interval);
                        r();
                    }
                }, 20);
            });
        }
        _attachPressAnyKeyToCloseListener(xterm) {
            if (xterm.textarea && !this._pressAnyKeyToCloseListener) {
                this._pressAnyKeyToCloseListener = dom.addDisposableListener(xterm.textarea, 'keypress', (event) => {
                    if (this._pressAnyKeyToCloseListener) {
                        this._pressAnyKeyToCloseListener.dispose();
                        this._pressAnyKeyToCloseListener = undefined;
                        this.dispose(terminal_1.TerminalExitReason.Process);
                        event.preventDefault();
                    }
                });
            }
        }
        _writeInitialText(xterm, callback) {
            if (!this._shellLaunchConfig.initialText) {
                callback?.();
                return;
            }
            const text = typeof this._shellLaunchConfig.initialText === 'string'
                ? this._shellLaunchConfig.initialText
                : this._shellLaunchConfig.initialText?.text;
            if (typeof this._shellLaunchConfig.initialText === 'string') {
                xterm.raw.writeln(text, callback);
            }
            else {
                if (this._shellLaunchConfig.initialText.trailingNewLine) {
                    xterm.raw.writeln(text, callback);
                }
                else {
                    xterm.raw.write(text, callback);
                }
            }
        }
        async reuseTerminal(shell, reset = false) {
            // Unsubscribe any key listener we may have.
            this._pressAnyKeyToCloseListener?.dispose();
            this._pressAnyKeyToCloseListener = undefined;
            const xterm = this.xterm;
            if (xterm) {
                if (!reset) {
                    // Ensure new processes' output starts at start of new line
                    await new Promise(r => xterm.raw.write('\n\x1b[G', r));
                }
                // Print initialText if specified
                if (shell.initialText) {
                    this._shellLaunchConfig.initialText = shell.initialText;
                    await new Promise(r => this._writeInitialText(xterm, r));
                }
                // Clean up waitOnExit state
                if (this._isExiting && this._shellLaunchConfig.waitOnExit) {
                    xterm.raw.options.disableStdin = false;
                    this._isExiting = false;
                }
                if (reset) {
                    xterm.clearDecorations();
                }
            }
            // Dispose the environment info widget if it exists
            this.statusList.remove("relaunch-needed" /* TerminalStatus.RelaunchNeeded */);
            if (!reset) {
                // HACK: Force initialText to be non-falsy for reused terminals such that the
                // conptyInheritCursor flag is passed to the node-pty, this flag can cause a Window to stop
                // responding in Windows 10 1903 so we only want to use it when something is definitely written
                // to the terminal.
                shell.initialText = ' ';
            }
            // Set the new shell launch config
            this._shellLaunchConfig = shell; // Must be done before calling _createProcess()
            await this._processManager.relaunch(this._shellLaunchConfig, this._cols || 80 /* Constants.DefaultCols */, this._rows || 30 /* Constants.DefaultRows */, reset).then(result => {
                if (result) {
                    if ('message' in result) {
                        this._onProcessExit(result);
                    }
                    else if ('injectedArgs' in result) {
                        this._injectedArgs = result.injectedArgs;
                    }
                }
            });
        }
        relaunch() {
            this.reuseTerminal(this._shellLaunchConfig, true);
        }
        _onTitleChange(title) {
            if (this.isTitleSetByProcess) {
                this._setTitle(title, terminal_1.TitleEventSource.Sequence);
            }
        }
        async _trust() {
            return (await this._workspaceTrustRequestService.requestWorkspaceTrust({
                message: nls.localize('terminal.requestTrust', "Creating a terminal process requires executing code")
            })) === true;
        }
        async _onSelectionChange() {
            this._onDidChangeSelection.fire(this);
            if (this._configurationService.getValue("terminal.integrated.copyOnSelection" /* TerminalSettingId.CopyOnSelection */)) {
                if (this.hasSelection()) {
                    await this.copySelection();
                }
            }
        }
        async _updateProcessCwd() {
            if (this._isDisposed || this.shellLaunchConfig.customPtyImplementation) {
                return;
            }
            // reset cwd if it has changed, so file based url paths can be resolved
            try {
                const cwd = await this._refreshProperty("cwd" /* ProcessPropertyType.Cwd */);
                if (typeof cwd !== 'string') {
                    throw new Error(`cwd is not a string ${cwd}`);
                }
            }
            catch (e) {
                // Swallow this as it means the process has been killed
                if (e instanceof Error && e.message === 'Cannot refresh property when process is not set') {
                    return;
                }
                throw e;
            }
        }
        updateConfig() {
            this._setCommandsToSkipShell(this._configHelper.config.commandsToSkipShell);
            this._refreshEnvironmentVariableInfoWidgetState(this._processManager.environmentVariableInfo);
        }
        async _updateUnicodeVersion() {
            this._processManager.setUnicodeVersion(this._configHelper.config.unicodeVersion);
        }
        updateAccessibilitySupport() {
            this.xterm.raw.options.screenReaderMode = this._accessibilityService.isScreenReaderOptimized();
        }
        _setCommandsToSkipShell(commands) {
            const excludeCommands = commands.filter(command => command[0] === '-').map(command => command.slice(1));
            this._skipTerminalCommands = terminal_2.DEFAULT_COMMANDS_TO_SKIP_SHELL.filter(defaultCommand => {
                return !excludeCommands.includes(defaultCommand);
            }).concat(commands);
        }
        layout(dimension) {
            this._lastLayoutDimensions = dimension;
            if (this.disableLayout) {
                return;
            }
            // Don't layout if dimensions are invalid (eg. the container is not attached to the DOM or
            // if display: none
            if (dimension.width <= 0 || dimension.height <= 0) {
                return;
            }
            // Evaluate columns and rows, exclude the wrapper element's margin
            const terminalWidth = this._evaluateColsAndRows(dimension.width, dimension.height);
            if (!terminalWidth) {
                return;
            }
            this._resize();
            // Signal the container is ready
            this._containerReadyBarrier.open();
            // Layout all contributions
            for (const contribution of this._contributions.values()) {
                if (!this.xterm) {
                    this._xtermReadyPromise.then(xterm => contribution.layout?.(xterm, dimension));
                }
                else {
                    contribution.layout?.(this.xterm, dimension);
                }
            }
        }
        async _resize() {
            this._resizeNow(false);
        }
        async _resizeNow(immediate) {
            let cols = this.cols;
            let rows = this.rows;
            if (this.xterm) {
                // Only apply these settings when the terminal is visible so that
                // the characters are measured correctly.
                if (this._isVisible && this._layoutSettingsChanged) {
                    const font = this.xterm.getFont();
                    const config = this._configHelper.config;
                    this.xterm.raw.options.letterSpacing = font.letterSpacing;
                    this.xterm.raw.options.lineHeight = font.lineHeight;
                    this.xterm.raw.options.fontSize = font.fontSize;
                    this.xterm.raw.options.fontFamily = font.fontFamily;
                    this.xterm.raw.options.fontWeight = config.fontWeight;
                    this.xterm.raw.options.fontWeightBold = config.fontWeightBold;
                    // Any of the above setting changes could have changed the dimensions of the
                    // terminal, re-evaluate now.
                    this._initDimensions();
                    cols = this.cols;
                    rows = this.rows;
                    this._layoutSettingsChanged = false;
                }
                if (isNaN(cols) || isNaN(rows)) {
                    return;
                }
                if (cols !== this.xterm.raw.cols || rows !== this.xterm.raw.rows) {
                    if (this._fixedRows || this._fixedCols) {
                        await this._updateProperty("fixedDimensions" /* ProcessPropertyType.FixedDimensions */, { cols: this._fixedCols, rows: this._fixedRows });
                    }
                    this._onDimensionsChanged.fire();
                }
                this.xterm.raw.resize(cols, rows);
                TerminalInstance_1._lastKnownGridDimensions = { cols, rows };
                if (this._isVisible) {
                    this.xterm.forceUnpause();
                }
            }
            if (immediate) {
                // do not await, call setDimensions synchronously
                this._processManager.setDimensions(cols, rows, true);
            }
            else {
                await this._processManager.setDimensions(cols, rows);
            }
        }
        setShellType(shellType) {
            this._shellType = shellType;
            if (shellType) {
                this._terminalShellTypeContextKey.set(shellType?.toString());
            }
        }
        _setAriaLabel(xterm, terminalId, title) {
            const labelParts = [];
            if (xterm && xterm.textarea) {
                if (title && title.length > 0) {
                    labelParts.push(nls.localize('terminalTextBoxAriaLabelNumberAndTitle', "Terminal {0}, {1}", terminalId, title));
                }
                else {
                    labelParts.push(nls.localize('terminalTextBoxAriaLabel', "Terminal {0}", terminalId));
                }
                const screenReaderOptimized = this._accessibilityService.isScreenReaderOptimized();
                if (!screenReaderOptimized) {
                    labelParts.push(nls.localize('terminalScreenReaderMode', "Run the command: Toggle Screen Reader Accessibility Mode for an optimized screen reader experience"));
                }
                const accessibilityHelpKeybinding = this._keybindingService.lookupKeybinding("editor.action.accessibilityHelp" /* AccessibilityCommandId.OpenAccessibilityHelp */)?.getLabel();
                if (this._configurationService.getValue("accessibility.verbosity.terminal" /* AccessibilityVerbositySettingId.Terminal */) && accessibilityHelpKeybinding) {
                    labelParts.push(nls.localize('terminalHelpAriaLabel', "Use {0} for terminal accessibility help", accessibilityHelpKeybinding));
                }
                xterm.textarea.setAttribute('aria-label', labelParts.join('\n'));
            }
        }
        _updateTitleProperties(title, eventSource) {
            if (!title) {
                return this._processName;
            }
            switch (eventSource) {
                case terminal_1.TitleEventSource.Process:
                    if (this._processManager.os === 1 /* OperatingSystem.Windows */) {
                        // Extract the file name without extension
                        title = path.win32.parse(title).name;
                    }
                    else {
                        const firstSpaceIndex = title.indexOf(' ');
                        if (title.startsWith('/')) {
                            title = path.basename(title);
                        }
                        else if (firstSpaceIndex > -1) {
                            title = title.substring(0, firstSpaceIndex);
                        }
                    }
                    this._processName = title;
                    break;
                case terminal_1.TitleEventSource.Api:
                    // If the title has not been set by the API or the rename command, unregister the handler that
                    // automatically updates the terminal name
                    this._staticTitle = title;
                    this._messageTitleDisposable.value = undefined;
                    break;
                case terminal_1.TitleEventSource.Sequence:
                    // On Windows, some shells will fire this with the full path which we want to trim
                    // to show just the file name. This should only happen if the title looks like an
                    // absolute Windows file path
                    this._sequence = title;
                    if (this._processManager.os === 1 /* OperatingSystem.Windows */ &&
                        title.match(/^[a-zA-Z]:\\.+\.[a-zA-Z]{1,3}/)) {
                        this._sequence = path.win32.parse(title).name;
                    }
                    break;
            }
            this._titleSource = eventSource;
            return title;
        }
        setOverrideDimensions(dimensions, immediate = false) {
            if (this._dimensionsOverride && this._dimensionsOverride.forceExactSize && !dimensions && this._rows === 0 && this._cols === 0) {
                // this terminal never had a real size => keep the last dimensions override exact size
                this._cols = this._dimensionsOverride.cols;
                this._rows = this._dimensionsOverride.rows;
            }
            this._dimensionsOverride = dimensions;
            if (immediate) {
                this._resizeNow(true);
            }
            else {
                this._resize();
            }
        }
        async setFixedDimensions() {
            const cols = await this._quickInputService.input({
                title: nls.localize('setTerminalDimensionsColumn', "Set Fixed Dimensions: Column"),
                placeHolder: 'Enter a number of columns or leave empty for automatic width',
                validateInput: async (text) => text.length > 0 && !text.match(/^\d+$/) ? { content: 'Enter a number or leave empty size automatically', severity: notification_1.Severity.Error } : undefined
            });
            if (cols === undefined) {
                return;
            }
            this._fixedCols = this._parseFixedDimension(cols);
            this._labelComputer?.refreshLabel(this);
            this._terminalHasFixedWidth.set(!!this._fixedCols);
            const rows = await this._quickInputService.input({
                title: nls.localize('setTerminalDimensionsRow', "Set Fixed Dimensions: Row"),
                placeHolder: 'Enter a number of rows or leave empty for automatic height',
                validateInput: async (text) => text.length > 0 && !text.match(/^\d+$/) ? { content: 'Enter a number or leave empty size automatically', severity: notification_1.Severity.Error } : undefined
            });
            if (rows === undefined) {
                return;
            }
            this._fixedRows = this._parseFixedDimension(rows);
            this._labelComputer?.refreshLabel(this);
            await this._refreshScrollbar();
            this._resize();
            this.focus();
        }
        _parseFixedDimension(value) {
            if (value === '') {
                return undefined;
            }
            const parsed = parseInt(value);
            if (parsed <= 0) {
                throw new Error(`Could not parse dimension "${value}"`);
            }
            return parsed;
        }
        async toggleSizeToContentWidth() {
            if (!this.xterm?.raw.buffer.active) {
                return;
            }
            if (this._hasScrollBar) {
                this._terminalHasFixedWidth.set(false);
                this._fixedCols = undefined;
                this._fixedRows = undefined;
                this._hasScrollBar = false;
                this._initDimensions();
                await this._resize();
            }
            else {
                // Fixed columns should be at least xterm.js' regular column count
                const proposedCols = Math.max(this.maxCols, Math.min(this.xterm.getLongestViewportWrappedLineLength(), 5000 /* Constants.MaxSupportedCols */));
                // Don't switch to fixed dimensions if the content already fits as it makes the scroll
                // bar look bad being off the edge
                if (proposedCols > this.xterm.raw.cols) {
                    this._fixedCols = proposedCols;
                }
            }
            await this._refreshScrollbar();
            this._labelComputer?.refreshLabel(this);
            this.focus();
        }
        _refreshScrollbar() {
            if (this._fixedCols || this._fixedRows) {
                return this._addScrollbar();
            }
            return this._removeScrollbar();
        }
        async _addScrollbar() {
            const charWidth = (this.xterm ? this.xterm.getFont() : this._configHelper.getFont()).charWidth;
            if (!this.xterm?.raw.element || !this._container || !charWidth || !this._fixedCols) {
                return;
            }
            this._wrapperElement.classList.add('fixed-dims');
            this._hasScrollBar = true;
            this._initDimensions();
            // Always remove a row to make room for the scroll bar
            this._fixedRows = this._rows - 1;
            await this._resize();
            this._terminalHasFixedWidth.set(true);
            if (!this._horizontalScrollbar) {
                this._horizontalScrollbar = this._register(new scrollableElement_1.DomScrollableElement(this._wrapperElement, {
                    vertical: 2 /* ScrollbarVisibility.Hidden */,
                    horizontal: 1 /* ScrollbarVisibility.Auto */,
                    useShadows: false,
                    scrollYToX: false,
                    consumeMouseWheelIfScrollbarIsNeeded: false
                }));
                this._container.appendChild(this._horizontalScrollbar.getDomNode());
            }
            this._horizontalScrollbar.setScrollDimensions({
                width: this.xterm.raw.element.clientWidth,
                scrollWidth: this._fixedCols * charWidth + 40 // Padding + scroll bar
            });
            this._horizontalScrollbar.getDomNode().style.paddingBottom = '16px';
            // work around for https://github.com/xtermjs/xterm.js/issues/3482
            if (platform_1.isWindows) {
                for (let i = this.xterm.raw.buffer.active.viewportY; i < this.xterm.raw.buffer.active.length; i++) {
                    const line = this.xterm.raw.buffer.active.getLine(i);
                    line._line.isWrapped = false;
                }
            }
        }
        async _removeScrollbar() {
            if (!this._container || !this._horizontalScrollbar) {
                return;
            }
            this._horizontalScrollbar.getDomNode().remove();
            this._horizontalScrollbar.dispose();
            this._horizontalScrollbar = undefined;
            this._wrapperElement.remove();
            this._wrapperElement.classList.remove('fixed-dims');
            this._container.appendChild(this._wrapperElement);
        }
        _setResolvedShellLaunchConfig(shellLaunchConfig) {
            this._shellLaunchConfig.args = shellLaunchConfig.args;
            this._shellLaunchConfig.cwd = shellLaunchConfig.cwd;
            this._shellLaunchConfig.executable = shellLaunchConfig.executable;
            this._shellLaunchConfig.env = shellLaunchConfig.env;
        }
        _onEnvironmentVariableInfoChanged(info) {
            if (info.requiresAction) {
                this.xterm?.raw.textarea?.setAttribute('aria-label', nls.localize('terminalStaleTextBoxAriaLabel', "Terminal {0} environment is stale, run the 'Show Environment Information' command for more information", this._instanceId));
            }
            this._refreshEnvironmentVariableInfoWidgetState(info);
        }
        async _refreshEnvironmentVariableInfoWidgetState(info) {
            // Check if the status should exist
            if (!info) {
                this.statusList.remove("relaunch-needed" /* TerminalStatus.RelaunchNeeded */);
                this.statusList.remove("env-var-info-changes-active" /* TerminalStatus.EnvironmentVariableInfoChangesActive */);
                return;
            }
            // Recreate the process seamlessly without informing the use if the following conditions are
            // met.
            if (
            // The change requires a relaunch
            info.requiresAction &&
                // The feature is enabled
                this._configHelper.config.environmentChangesRelaunch &&
                // Has not been interacted with
                !this._processManager.hasWrittenData &&
                // Not a feature terminal or is a reconnecting task terminal (TODO: Need to explain the latter case)
                (!this._shellLaunchConfig.isFeatureTerminal || (this.reconnectionProperties && this._configurationService.getValue('task.reconnection') === true)) &&
                // Not a custom pty
                !this._shellLaunchConfig.customPtyImplementation &&
                // Not an extension owned terminal
                !this._shellLaunchConfig.isExtensionOwnedTerminal &&
                // Not a reconnected or revived terminal
                !this._shellLaunchConfig.attachPersistentProcess &&
                // Not a Windows remote using ConPTY (#187084)
                !(this._processManager.remoteAuthority && this._configHelper.config.windowsEnableConpty && (await this._processManager.getBackendOS()) === 1 /* OperatingSystem.Windows */)) {
                this.relaunch();
                return;
            }
            // Re-create statuses
            const workspaceFolder = (0, terminalEnvironment_1.getWorkspaceForTerminal)(this.shellLaunchConfig.cwd, this._workspaceContextService, this._historyService);
            this.statusList.add(info.getStatus({ workspaceFolder }));
        }
        async getInitialCwd() {
            if (!this._initialCwd) {
                this._initialCwd = this._processManager.initialCwd;
            }
            return this._initialCwd;
        }
        async getCwd() {
            if (this.capabilities.has(0 /* TerminalCapability.CwdDetection */)) {
                return this.capabilities.get(0 /* TerminalCapability.CwdDetection */).getCwd();
            }
            else if (this.capabilities.has(1 /* TerminalCapability.NaiveCwdDetection */)) {
                return this.capabilities.get(1 /* TerminalCapability.NaiveCwdDetection */).getCwd();
            }
            return this._processManager.initialCwd;
        }
        async _refreshProperty(type) {
            await this.processReady;
            return this._processManager.refreshProperty(type);
        }
        async _updateProperty(type, value) {
            return this._processManager.updateProperty(type, value);
        }
        async rename(title) {
            this._setTitle(title, terminal_1.TitleEventSource.Api);
        }
        _setTitle(title, eventSource) {
            const reset = !title;
            title = this._updateTitleProperties(title, eventSource);
            const titleChanged = title !== this._title;
            this._title = title;
            this._labelComputer?.refreshLabel(this, reset);
            this._setAriaLabel(this.xterm?.raw, this._instanceId, this._title);
            if (titleChanged) {
                this._onTitleChanged.fire(this);
            }
        }
        async changeIcon() {
            const items = [];
            for (const icon of (0, codicons_1.getAllCodicons)()) {
                items.push({ label: `$(${icon.id})`, description: `${icon.id}`, icon });
            }
            const result = await this._quickInputService.pick(items, {
                matchOnDescription: true,
                placeHolder: nls.localize('changeIcon', 'Select an icon for the terminal')
            });
            if (result) {
                this._icon = result.icon;
                this._onIconChanged.fire({ instance: this, userInitiated: true });
            }
        }
        async changeColor() {
            const icon = this._getIcon();
            if (!icon) {
                return;
            }
            const colorTheme = this._themeService.getColorTheme();
            const standardColors = (0, terminalIcon_1.getStandardColors)(colorTheme);
            const styleElement = (0, terminalIcon_1.getColorStyleElement)(colorTheme);
            const items = [];
            for (const colorKey of standardColors) {
                const colorClass = (0, terminalIcon_1.getColorClass)(colorKey);
                items.push({
                    label: `$(${codicons_1.Codicon.circleFilled.id}) ${colorKey.replace('terminal.ansi', '')}`, id: colorKey, description: colorKey, iconClasses: [colorClass]
                });
            }
            items.push({ type: 'separator' });
            const showAllColorsItem = { label: 'Reset to default' };
            items.push(showAllColorsItem);
            document.body.appendChild(styleElement);
            const quickPick = this._quickInputService.createQuickPick();
            quickPick.items = items;
            quickPick.matchOnDescription = true;
            quickPick.placeholder = nls.localize('changeColor', 'Select a color for the terminal');
            quickPick.show();
            const disposables = [];
            const result = await new Promise(r => {
                disposables.push(quickPick.onDidHide(() => r(undefined)));
                disposables.push(quickPick.onDidAccept(() => r(quickPick.selectedItems[0])));
            });
            (0, lifecycle_1.dispose)(disposables);
            if (result) {
                this.shellLaunchConfig.color = result.id;
                this._onIconChanged.fire({ instance: this, userInitiated: true });
            }
            quickPick.hide();
            document.body.removeChild(styleElement);
        }
        selectPreviousSuggestion() {
            this.xterm?.suggestController?.selectPreviousSuggestion();
        }
        selectPreviousPageSuggestion() {
            this.xterm?.suggestController?.selectPreviousPageSuggestion();
        }
        selectNextSuggestion() {
            this.xterm?.suggestController?.selectNextSuggestion();
        }
        selectNextPageSuggestion() {
            this.xterm?.suggestController?.selectNextPageSuggestion();
        }
        async acceptSelectedSuggestion(suggestion) {
            this.xterm?.suggestController?.acceptSelectedSuggestion(suggestion);
        }
        hideSuggestWidget() {
            this.xterm?.suggestController?.hideSuggestWidget();
        }
        forceScrollbarVisibility() {
            this._wrapperElement.classList.add('force-scrollbar');
        }
        resetScrollbarVisibility() {
            this._wrapperElement.classList.remove('force-scrollbar');
        }
    };
    exports.TerminalInstance = TerminalInstance;
    __decorate([
        (0, decorators_1.debounce)(50)
    ], TerminalInstance.prototype, "_fireMaximumDimensionsChanged", null);
    __decorate([
        (0, decorators_1.debounce)(1000)
    ], TerminalInstance.prototype, "relaunch", null);
    __decorate([
        (0, decorators_1.debounce)(2000)
    ], TerminalInstance.prototype, "_updateProcessCwd", null);
    __decorate([
        (0, decorators_1.debounce)(50)
    ], TerminalInstance.prototype, "_resize", null);
    exports.TerminalInstance = TerminalInstance = TerminalInstance_1 = __decorate([
        __param(5, contextkey_1.IContextKeyService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, terminal_2.ITerminalProfileResolverService),
        __param(8, pathService_1.IPathService),
        __param(9, keybinding_1.IKeybindingService),
        __param(10, notification_1.INotificationService),
        __param(11, preferences_1.IPreferencesService),
        __param(12, views_1.IViewsService),
        __param(13, clipboardService_1.IClipboardService),
        __param(14, themeService_1.IThemeService),
        __param(15, configuration_1.IConfigurationService),
        __param(16, terminal_1.ITerminalLogService),
        __param(17, dialogs_1.IDialogService),
        __param(18, storage_1.IStorageService),
        __param(19, accessibility_1.IAccessibilityService),
        __param(20, productService_1.IProductService),
        __param(21, quickInput_1.IQuickInputService),
        __param(22, environmentService_1.IWorkbenchEnvironmentService),
        __param(23, workspace_1.IWorkspaceContextService),
        __param(24, editorService_1.IEditorService),
        __param(25, workspaceTrust_1.IWorkspaceTrustRequestService),
        __param(26, history_2.IHistoryService),
        __param(27, telemetry_1.ITelemetryService),
        __param(28, opener_1.IOpenerService),
        __param(29, commands_1.ICommandService),
        __param(30, audioCueService_1.IAudioCueService),
        __param(31, views_1.IViewDescriptorService)
    ], TerminalInstance);
    let TerminalInstanceDragAndDropController = class TerminalInstanceDragAndDropController extends lifecycle_1.Disposable {
        get onDropFile() { return this._onDropFile.event; }
        get onDropTerminal() { return this._onDropTerminal.event; }
        constructor(_container, _layoutService, _viewDescriptorService) {
            super();
            this._container = _container;
            this._layoutService = _layoutService;
            this._viewDescriptorService = _viewDescriptorService;
            this._onDropFile = this._register(new event_1.Emitter());
            this._onDropTerminal = this._register(new event_1.Emitter());
            this._register((0, lifecycle_1.toDisposable)(() => this._clearDropOverlay()));
        }
        _clearDropOverlay() {
            if (this._dropOverlay && this._dropOverlay.parentElement) {
                this._dropOverlay.parentElement.removeChild(this._dropOverlay);
            }
            this._dropOverlay = undefined;
        }
        onDragEnter(e) {
            if (!(0, dnd_2.containsDragType)(e, dnd_1.DataTransfers.FILES, dnd_1.DataTransfers.RESOURCES, "Terminals" /* TerminalDataTransfers.Terminals */, dnd_2.CodeDataTransfers.FILES)) {
                return;
            }
            if (!this._dropOverlay) {
                this._dropOverlay = document.createElement('div');
                this._dropOverlay.classList.add('terminal-drop-overlay');
            }
            // Dragging terminals
            if ((0, dnd_2.containsDragType)(e, "Terminals" /* TerminalDataTransfers.Terminals */)) {
                const side = this._getDropSide(e);
                this._dropOverlay.classList.toggle('drop-before', side === 'before');
                this._dropOverlay.classList.toggle('drop-after', side === 'after');
            }
            if (!this._dropOverlay.parentElement) {
                this._container.appendChild(this._dropOverlay);
            }
        }
        onDragLeave(e) {
            this._clearDropOverlay();
        }
        onDragEnd(e) {
            this._clearDropOverlay();
        }
        onDragOver(e) {
            if (!e.dataTransfer || !this._dropOverlay) {
                return;
            }
            // Dragging terminals
            if ((0, dnd_2.containsDragType)(e, "Terminals" /* TerminalDataTransfers.Terminals */)) {
                const side = this._getDropSide(e);
                this._dropOverlay.classList.toggle('drop-before', side === 'before');
                this._dropOverlay.classList.toggle('drop-after', side === 'after');
            }
            this._dropOverlay.style.opacity = '1';
        }
        async onDrop(e) {
            this._clearDropOverlay();
            if (!e.dataTransfer) {
                return;
            }
            const terminalResources = (0, terminalUri_1.getTerminalResourcesFromDragEvent)(e);
            if (terminalResources) {
                for (const uri of terminalResources) {
                    const side = this._getDropSide(e);
                    this._onDropTerminal.fire({ uri, side });
                }
                return;
            }
            // Check if files were dragged from the tree explorer
            let path;
            const rawResources = e.dataTransfer.getData(dnd_1.DataTransfers.RESOURCES);
            if (rawResources) {
                path = uri_1.URI.parse(JSON.parse(rawResources)[0]);
            }
            const rawCodeFiles = e.dataTransfer.getData(dnd_2.CodeDataTransfers.FILES);
            if (!path && rawCodeFiles) {
                path = uri_1.URI.file(JSON.parse(rawCodeFiles)[0]);
            }
            if (!path && e.dataTransfer.files.length > 0 && e.dataTransfer.files[0].path /* Electron only */) {
                // Check if the file was dragged from the filesystem
                path = uri_1.URI.file(e.dataTransfer.files[0].path);
            }
            if (!path) {
                return;
            }
            this._onDropFile.fire(path);
        }
        _getDropSide(e) {
            const target = this._container;
            if (!target) {
                return 'after';
            }
            const rect = target.getBoundingClientRect();
            return this._getViewOrientation() === 1 /* Orientation.HORIZONTAL */
                ? (e.clientX - rect.left < rect.width / 2 ? 'before' : 'after')
                : (e.clientY - rect.top < rect.height / 2 ? 'before' : 'after');
        }
        _getViewOrientation() {
            const panelPosition = this._layoutService.getPanelPosition();
            const terminalLocation = this._viewDescriptorService.getViewLocationById(terminal_2.TERMINAL_VIEW_ID);
            return terminalLocation === 1 /* ViewContainerLocation.Panel */ && panelPosition === 2 /* Position.BOTTOM */
                ? 1 /* Orientation.HORIZONTAL */
                : 0 /* Orientation.VERTICAL */;
        }
    };
    TerminalInstanceDragAndDropController = __decorate([
        __param(1, layoutService_1.IWorkbenchLayoutService),
        __param(2, views_1.IViewDescriptorService)
    ], TerminalInstanceDragAndDropController);
    var TerminalLabelType;
    (function (TerminalLabelType) {
        TerminalLabelType["Title"] = "title";
        TerminalLabelType["Description"] = "description";
    })(TerminalLabelType || (TerminalLabelType = {}));
    let TerminalLabelComputer = class TerminalLabelComputer extends lifecycle_1.Disposable {
        get title() { return this._title; }
        get description() { return this._description; }
        constructor(_configHelper, _fileService, _workspaceContextService) {
            super();
            this._configHelper = _configHelper;
            this._fileService = _fileService;
            this._workspaceContextService = _workspaceContextService;
            this._title = '';
            this._description = '';
            this._onDidChangeLabel = this._register(new event_1.Emitter());
            this.onDidChangeLabel = this._onDidChangeLabel.event;
        }
        refreshLabel(instance, reset) {
            this._title = this.computeLabel(instance, this._configHelper.config.tabs.title, "title" /* TerminalLabelType.Title */, reset);
            this._description = this.computeLabel(instance, this._configHelper.config.tabs.description, "description" /* TerminalLabelType.Description */);
            if (this._title !== instance.title || this._description !== instance.description || reset) {
                this._onDidChangeLabel.fire({ title: this._title, description: this._description });
            }
        }
        computeLabel(instance, labelTemplate, labelType, reset) {
            const type = instance.shellLaunchConfig.attachPersistentProcess?.type || instance.shellLaunchConfig.type;
            const templateProperties = {
                cwd: instance.cwd || instance.initialCwd || '',
                cwdFolder: '',
                workspaceFolder: instance.workspaceFolder ? path.basename(instance.workspaceFolder.uri.fsPath) : undefined,
                local: type === 'Local' ? type : undefined,
                process: instance.processName,
                sequence: instance.sequence,
                task: type === 'Task' ? type : undefined,
                fixedDimensions: instance.fixedCols
                    ? (instance.fixedRows ? `\u2194${instance.fixedCols} \u2195${instance.fixedRows}` : `\u2194${instance.fixedCols}`)
                    : (instance.fixedRows ? `\u2195${instance.fixedRows}` : ''),
                separator: { label: this._configHelper.config.tabs.separator }
            };
            labelTemplate = labelTemplate.trim();
            if (!labelTemplate) {
                return labelType === "title" /* TerminalLabelType.Title */ ? (instance.processName || '') : '';
            }
            if (!reset && instance.staticTitle && labelType === "title" /* TerminalLabelType.Title */) {
                return instance.staticTitle.replace(/[\n\r\t]/g, '') || templateProperties.process?.replace(/[\n\r\t]/g, '') || '';
            }
            const detection = instance.capabilities.has(0 /* TerminalCapability.CwdDetection */) || instance.capabilities.has(1 /* TerminalCapability.NaiveCwdDetection */);
            const folders = this._workspaceContextService.getWorkspace().folders;
            const multiRootWorkspace = folders.length > 1;
            // Only set cwdFolder if detection is on
            if (templateProperties.cwd && detection && (!instance.shellLaunchConfig.isFeatureTerminal || labelType === "title" /* TerminalLabelType.Title */)) {
                const cwdUri = uri_1.URI.from({
                    scheme: instance.workspaceFolder?.uri.scheme || network_1.Schemas.file,
                    path: instance.cwd ? path.resolve(instance.cwd) : undefined
                });
                // Multi-root workspaces always show cwdFolder to disambiguate them, otherwise only show
                // when it differs from the workspace folder in which it was launched from
                let showCwd = false;
                if (multiRootWorkspace) {
                    showCwd = true;
                }
                else if (instance.workspaceFolder?.uri) {
                    const caseSensitive = this._fileService.hasCapability(instance.workspaceFolder.uri, 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */);
                    showCwd = cwdUri.fsPath.localeCompare(instance.workspaceFolder.uri.fsPath, undefined, { sensitivity: caseSensitive ? 'case' : 'base' }) !== 0;
                }
                if (showCwd) {
                    templateProperties.cwdFolder = path.basename(templateProperties.cwd);
                }
            }
            // Remove special characters that could mess with rendering
            const label = (0, labels_1.template)(labelTemplate, templateProperties).replace(/[\n\r\t]/g, '').trim();
            return label === '' && labelType === "title" /* TerminalLabelType.Title */ ? (instance.processName || '') : label;
        }
    };
    exports.TerminalLabelComputer = TerminalLabelComputer;
    exports.TerminalLabelComputer = TerminalLabelComputer = __decorate([
        __param(1, files_1.IFileService),
        __param(2, workspace_1.IWorkspaceContextService)
    ], TerminalLabelComputer);
    function parseExitResult(exitCodeOrError, shellLaunchConfig, processState, initialCwd) {
        // Only return a message if the exit code is non-zero
        if (exitCodeOrError === undefined || exitCodeOrError === 0) {
            return { code: exitCodeOrError, message: undefined };
        }
        const code = typeof exitCodeOrError === 'number' ? exitCodeOrError : exitCodeOrError.code;
        // Create exit code message
        let message = undefined;
        switch (typeof exitCodeOrError) {
            case 'number': {
                let commandLine = undefined;
                if (shellLaunchConfig.executable) {
                    commandLine = shellLaunchConfig.executable;
                    if (typeof shellLaunchConfig.args === 'string') {
                        commandLine += ` ${shellLaunchConfig.args}`;
                    }
                    else if (shellLaunchConfig.args && shellLaunchConfig.args.length) {
                        commandLine += shellLaunchConfig.args.map(a => ` '${a}'`).join();
                    }
                }
                if (processState === 4 /* ProcessState.KilledDuringLaunch */) {
                    if (commandLine) {
                        message = nls.localize('launchFailed.exitCodeAndCommandLine', "The terminal process \"{0}\" failed to launch (exit code: {1}).", commandLine, code);
                    }
                    else {
                        message = nls.localize('launchFailed.exitCodeOnly', "The terminal process failed to launch (exit code: {0}).", code);
                    }
                }
                else {
                    if (commandLine) {
                        message = nls.localize('terminated.exitCodeAndCommandLine', "The terminal process \"{0}\" terminated with exit code: {1}.", commandLine, code);
                    }
                    else {
                        message = nls.localize('terminated.exitCodeOnly', "The terminal process terminated with exit code: {0}.", code);
                    }
                }
                break;
            }
            case 'object': {
                // Ignore internal errors
                if (exitCodeOrError.message.toString().includes('Could not find pty with id')) {
                    break;
                }
                // Convert conpty code-based failures into human friendly messages
                let innerMessage = exitCodeOrError.message;
                const conptyError = exitCodeOrError.message.match(/.*error code:\s*(\d+).*$/);
                if (conptyError) {
                    const errorCode = conptyError.length > 1 ? parseInt(conptyError[1]) : undefined;
                    switch (errorCode) {
                        case 5:
                            innerMessage = `Access was denied to the path containing your executable "${shellLaunchConfig.executable}". Manage and change your permissions to get this to work`;
                            break;
                        case 267:
                            innerMessage = `Invalid starting directory "${initialCwd}", review your terminal.integrated.cwd setting`;
                            break;
                        case 1260:
                            innerMessage = `Windows cannot open this program because it has been prevented by a software restriction policy. For more information, open Event Viewer or contact your system Administrator`;
                            break;
                    }
                }
                message = nls.localize('launchFailed.errorMessage', "The terminal process failed to launch: {0}.", innerMessage);
                break;
            }
        }
        return { code, message };
    }
    exports.parseExitResult = parseExitResult;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxJbnN0YW5jZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsL2Jyb3dzZXIvdGVybWluYWxJbnN0YW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBdUZoRyxJQUFXLFNBWVY7SUFaRCxXQUFXLFNBQVM7UUFDbkI7Ozs7V0FJRztRQUNILHFGQUErQixDQUFBO1FBRS9CLHdEQUFnQixDQUFBO1FBQ2hCLHdEQUFnQixDQUFBO1FBQ2hCLG9FQUF1QixDQUFBO1FBQ3ZCLGdFQUFxQixDQUFBO0lBQ3RCLENBQUMsRUFaVSxTQUFTLEtBQVQsU0FBUyxRQVluQjtJQUVELElBQUksZ0JBQTJELENBQUM7SUFZaEUsTUFBTSxtQ0FBbUMsR0FBRzs7Ozs7S0FLM0MsQ0FBQztJQUVLLElBQU0sZ0JBQWdCLEdBQXRCLE1BQU0sZ0JBQWlCLFNBQVEsc0JBQVU7O2lCQUdoQyx1QkFBa0IsR0FBRyxDQUFDLEFBQUosQ0FBSztRQXdCdEMsSUFBSSxVQUFVLEtBQWtCLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7UUFvQzlELElBQUksNkJBQTZCLEtBQWMsT0FBTyxJQUFJLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFDO1FBTTVGLElBQUksZ0NBQWdDLEtBQXVELE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUM7UUFLMUosSUFBSSxVQUFVLEtBQXNDLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLHVCQUF1QixFQUFFLFVBQVUsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUMvSixJQUFJLFVBQVUsQ0FBQyxLQUFzQztZQUNwRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FB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