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
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/canIUse", "vs/base/browser/dnd", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/decorators", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/labels", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/uri", "vs/editor/browser/config/tabFocus", "vs/nls!vs/workbench/contrib/terminal/browser/terminalInstance", "vs/platform/accessibility/common/accessibility", "vs/platform/audioCues/browser/audioCueService", "vs/platform/clipboard/common/clipboardService", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/dialogs/common/dialogs", "vs/platform/dnd/browser/dnd", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/common/keybinding", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/product/common/productService", "vs/platform/quickinput/common/quickInput", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/terminal/common/capabilities/terminalCapabilityStore", "vs/platform/terminal/common/environmentVariableShared", "vs/platform/terminal/common/terminal", "vs/platform/terminal/common/terminalStrings", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/iconRegistry", "vs/platform/theme/common/themeService", "vs/platform/workspace/common/workspace", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/common/theme", "vs/workbench/common/views", "vs/workbench/contrib/terminal/browser/terminalActions", "vs/workbench/contrib/terminal/browser/terminalEditorInput", "vs/workbench/contrib/terminal/browser/terminalExtensions", "vs/workbench/contrib/terminal/browser/terminalIcon", "vs/workbench/contrib/terminal/browser/terminalProcessManager", "vs/workbench/contrib/terminal/browser/terminalRunRecentQuickPick", "vs/workbench/contrib/terminal/browser/terminalStatusList", "vs/workbench/contrib/terminal/browser/terminalUri", "vs/workbench/contrib/terminal/browser/widgets/widgetManager", "vs/workbench/contrib/terminal/browser/xterm/lineDataEventAddon", "vs/workbench/contrib/terminal/browser/xterm/xtermTerminal", "vs/workbench/contrib/terminal/common/history", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminal/common/terminalColorRegistry", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/workbench/contrib/terminal/common/terminalEnvironment", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/history/common/history", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/services/path/common/pathService", "vs/workbench/services/preferences/common/preferences", "vs/amdX"], function (require, exports, browser_1, canIUse_1, dnd_1, dom, keyboardEvent_1, scrollableElement_1, async_1, codicons_1, decorators_1, errors_1, event_1, labels_1, lifecycle_1, network_1, path, platform_1, uri_1, tabFocus_1, nls, accessibility_1, audioCueService_1, clipboardService_1, commands_1, configuration_1, contextkey_1, dialogs_1, dnd_2, files_1, instantiation_1, serviceCollection_1, keybinding_1, notification_1, opener_1, productService_1, quickInput_1, storage_1, telemetry_1, terminalCapabilityStore_1, environmentVariableShared_1, terminal_1, terminalStrings_1, colorRegistry_1, iconRegistry_1, themeService_1, workspace_1, workspaceTrust_1, theme_1, views_1, terminalActions_1, terminalEditorInput_1, terminalExtensions_1, terminalIcon_1, terminalProcessManager_1, terminalRunRecentQuickPick_1, terminalStatusList_1, terminalUri_1, widgetManager_1, lineDataEventAddon_1, xtermTerminal_1, history_1, terminal_2, terminalColorRegistry_1, terminalContextKey_1, terminalEnvironment_1, editorService_1, environmentService_1, history_2, layoutService_1, pathService_1, preferences_1, amdX_1) {
    "use strict";
    var $$Vb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$aWb = exports.$_Vb = exports.$$Vb = void 0;
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
    let $$Vb = class $$Vb extends lifecycle_1.$kc {
        static { $$Vb_1 = this; }
        static { this.f = 1; }
        get domElement() { return this.N; }
        get usedShellIntegrationInjection() { return this.xb; }
        get extEnvironmentVariableCollection() { return this.h.extEnvironmentVariableCollection; }
        get waitOnExit() { return this.Xb.attachPersistentProcess?.waitOnExit || this.Xb.waitOnExit; }
        set waitOnExit(value) {
            this.Xb.waitOnExit = value;
        }
        get target() { return this.wb; }
        set target(value) { this.wb = value; }
        get instanceId() { return this.t; }
        get resource() { return this.m; }
        get cols() {
            if (this.Y !== undefined) {
                return this.Y;
            }
            if (this.db && this.db.cols) {
                if (this.db.forceExactSize) {
                    return this.db.cols;
                }
                return Math.min(Math.max(this.db.cols, 2), this.W);
            }
            return this.W;
        }
        get rows() {
            if (this.Z !== undefined) {
                return this.Z;
            }
            if (this.db && this.db.rows) {
                if (this.db.forceExactSize) {
                    return this.db.rows;
                }
                return Math.min(Math.max(this.db.rows, 2), this.X);
            }
            return this.X;
        }
        get isDisposed() { return this.D; }
        get fixedCols() { return this.Y; }
        get fixedRows() { return this.Z; }
        get maxCols() { return this.W; }
        get maxRows() { return this.X; }
        // TODO: Ideally processId would be merged into processReady
        get processId() { return this.h.shellProcessId; }
        // TODO: How does this work with detached processes?
        // TODO: Should this be an event as it can fire twice?
        get processReady() { return this.h.ptyProcessReady; }
        get hasChildProcesses() { return this.shellLaunchConfig.attachPersistentProcess?.hasChildProcesses || this.h.hasChildProcesses; }
        get reconnectionProperties() { return this.shellLaunchConfig.attachPersistentProcess?.reconnectionProperties || this.shellLaunchConfig.reconnectionProperties; }
        get areLinksReady() { return this.eb; }
        get initialDataEvents() { return this.fb; }
        get exitCode() { return this.F; }
        get exitReason() { return this.G; }
        get hadFocusOnExit() { return this.z; }
        get isTitleSetByProcess() { return !!this.jb.value; }
        get shellLaunchConfig() { return this.Xb; }
        get shellType() { return this.I; }
        get os() { return this.h.os; }
        get isRemote() { return this.h.remoteAuthority !== undefined; }
        get remoteAuthority() { return this.h.remoteAuthority; }
        get hasFocus() { return this.N.contains(document.activeElement) ?? false; }
        get title() { return this.J; }
        get titleSource() { return this.L; }
        get icon() { return this.wc(); }
        get color() { return this.xc(); }
        get processName() { return this.pb; }
        get sequence() { return this.qb; }
        get staticTitle() { return this.rb; }
        get workspaceFolder() { return this.sb; }
        get cwd() { return this.$; }
        get initialCwd() { return this.ab; }
        get description() {
            if (this.ob) {
                return this.ob;
            }
            const type = this.shellLaunchConfig.attachPersistentProcess?.type || this.shellLaunchConfig.type;
            if (type) {
                if (type === 'Task') {
                    return nls.localize(0, null);
                }
                return nls.localize(1, null);
            }
            return undefined;
        }
        get userHome() { return this.ub; }
        get shellIntegrationNonce() { return this.h.shellIntegrationNonce; }
        get injectedArgs() { return this.bb; }
        constructor(Tb, Ub, Vb, Wb, Xb, Yb, instantiationService, Zb, $b, ac, bc, cc, dc, ec, fc, gc, hc, ic, jc, kc, lc, mc, workbenchEnvironmentService, nc, oc, pc, qc, rc, sc, tc, uc, vc) {
            super();
            this.Tb = Tb;
            this.Ub = Ub;
            this.Vb = Vb;
            this.Wb = Wb;
            this.Xb = Xb;
            this.Yb = Yb;
            this.Zb = Zb;
            this.$b = $b;
            this.ac = ac;
            this.bc = bc;
            this.cc = cc;
            this.dc = dc;
            this.ec = ec;
            this.fc = fc;
            this.gc = gc;
            this.hc = hc;
            this.ic = ic;
            this.jc = jc;
            this.kc = kc;
            this.lc = lc;
            this.mc = mc;
            this.nc = nc;
            this.oc = oc;
            this.pc = pc;
            this.qc = qc;
            this.rc = rc;
            this.sc = sc;
            this.tc = tc;
            this.uc = uc;
            this.vc = vc;
            this.j = new Map();
            this.u = 0;
            this.w = 0;
            this.J = '';
            this.L = terminal_1.TitleEventSource.Process;
            this.W = 0;
            this.X = 0;
            this.$ = undefined;
            this.ab = undefined;
            this.bb = undefined;
            this.cb = true;
            this.eb = false;
            this.fb = [];
            this.jb = this.B(new lifecycle_1.$lc());
            this.kb = new widgetManager_1.$AKb();
            this.lb = this.B(new lifecycle_1.$lc());
            this.pb = '';
            this.xb = false;
            this.capabilities = new terminalCapabilityStore_1.$fib();
            this.disableLayout = false;
            // The onExit event is special in that it fires and is disposed after the terminal instance
            // itself is disposed
            this.zb = new event_1.$fd();
            this.onExit = this.zb.event;
            this.Ab = this.B(new event_1.$fd());
            this.onDisposed = this.Ab.event;
            this.Bb = this.B(new event_1.$fd());
            this.onProcessIdReady = this.Bb.event;
            this.Cb = this.B(new event_1.$fd());
            this.onProcessReplayComplete = this.Cb.event;
            this.Db = this.B(new event_1.$fd());
            this.onTitleChanged = this.Db.event;
            this.Eb = this.B(new event_1.$fd());
            this.onIconChanged = this.Eb.event;
            this.Fb = this.B(new event_1.$fd());
            this.onData = this.Fb.event;
            this.Gb = this.B(new event_1.$fd());
            this.onBinary = this.Gb.event;
            this.Hb = this.B(new event_1.$fd({
                onDidAddFirstListener: () => this.Ec()
            }));
            this.onLineData = this.Hb.event;
            this.Ib = this.B(new event_1.$fd());
            this.onRequestExtHostProcess = this.Ib.event;
            this.Jb = this.B(new event_1.$fd());
            this.onDimensionsChanged = this.Jb.event;
            this.Kb = this.B(new event_1.$fd());
            this.onMaximumDimensionsChanged = this.Kb.event;
            this.Lb = this.B(new event_1.$fd());
            this.onDidFocus = this.Lb.event;
            this.Mb = this.B(new event_1.$fd());
            this.onDidRequestFocus = this.Mb.event;
            this.Nb = this.B(new event_1.$fd());
            this.onDidBlur = this.Nb.event;
            this.Ob = this.B(new event_1.$fd());
            this.onDidInputData = this.Ob.event;
            this.Pb = this.B(new event_1.$fd());
            this.onDidChangeSelection = this.Pb.event;
            this.Qb = this.B(new event_1.$fd());
            this.onRequestAddInstanceToGroup = this.Qb.event;
            this.Rb = this.B(new event_1.$fd());
            this.onDidChangeHasChildProcesses = this.Rb.event;
            this.Sb = this.B(new event_1.$fd());
            this.onDidRunText = this.Sb.event;
            this.N = document.createElement('div');
            this.N.classList.add('terminal-wrapper');
            this.H = [];
            this.y = false;
            this.z = false;
            this.C = false;
            this.D = false;
            this.t = $$Vb_1.f++;
            this.nb = false;
            this.Z = Xb.attachPersistentProcess?.fixedDimensions?.rows;
            this.Y = Xb.attachPersistentProcess?.fixedDimensions?.cols;
            this.m = (0, terminalUri_1.$PVb)(this.nc.getWorkspace().id, this.instanceId, this.title);
            if (this.Xb.attachPersistentProcess?.hideFromUser) {
                this.Xb.hideFromUser = this.Xb.attachPersistentProcess.hideFromUser;
            }
            if (this.Xb.attachPersistentProcess?.isFeatureTerminal) {
                this.Xb.isFeatureTerminal = this.Xb.attachPersistentProcess.isFeatureTerminal;
            }
            if (this.Xb.attachPersistentProcess?.type) {
                this.Xb.type = this.Xb.attachPersistentProcess.type;
            }
            if (this.shellLaunchConfig.cwd) {
                const cwdUri = typeof this.Xb.cwd === 'string' ? uri_1.URI.from({
                    scheme: network_1.Schemas.file,
                    path: this.Xb.cwd
                }) : this.Xb.cwd;
                if (cwdUri) {
                    this.sb = this.nc.getWorkspaceFolder(cwdUri) ?? undefined;
                }
            }
            if (!this.sb) {
                const activeWorkspaceRootUri = this.qc.getLastActiveWorkspaceRoot();
                this.sb = activeWorkspaceRootUri ? this.nc.getWorkspaceFolder(activeWorkspaceRootUri) ?? undefined : undefined;
            }
            const scopedContextKeyService = this.B(Yb.createScoped(this.N));
            this.g = instantiationService.createChild(new serviceCollection_1.$zh([contextkey_1.$3i, scopedContextKeyService]));
            this.P = terminalContextKey_1.TerminalContextKeys.focus.bindTo(scopedContextKeyService);
            this.Q = terminalContextKey_1.TerminalContextKeys.terminalHasFixedWidth.bindTo(scopedContextKeyService);
            this.R = terminalContextKey_1.TerminalContextKeys.textSelected.bindTo(scopedContextKeyService);
            this.S = terminalContextKey_1.TerminalContextKeys.altBufferActive.bindTo(scopedContextKeyService);
            this.U = terminalContextKey_1.TerminalContextKeys.terminalShellIntegrationEnabled.bindTo(scopedContextKeyService);
            this.hc.trace(`terminalInstance#ctor (instanceId: ${this.instanceId})`, this.Xb);
            this.B(this.capabilities.onDidAddCapabilityType(e => {
                this.hc.debug('terminalInstance added capability', e);
                if (e === 0 /* TerminalCapability.CwdDetection */) {
                    this.capabilities.get(0 /* TerminalCapability.CwdDetection */)?.onDidChangeCwd(e => {
                        this.$ = e;
                        this.nd(this.title, terminal_1.TitleEventSource.Config);
                        this.g.invokeFunction(history_1.$tVb)?.add(e, { remoteAuthority: this.remoteAuthority });
                    });
                }
                else if (e === 2 /* TerminalCapability.CommandDetection */) {
                    const commandCapability = this.capabilities.get(2 /* TerminalCapability.CommandDetection */);
                    commandCapability?.onCommandFinished(e => {
                        if (e.command.trim().length > 0) {
                            this.g.invokeFunction(history_1.$sVb)?.add(e.command, { shellType: this.I });
                        }
                    });
                }
            }));
            this.B(this.capabilities.onDidRemoveCapabilityType(e => this.hc.debug('terminalInstance removed capability', e)));
            // Resolve just the icon ahead of time so that it shows up immediately in the tabs. This is
            // disabled in remote because this needs to be sync and the OS may differ on the remote
            // which would result in the wrong profile being selected and the wrong icon being
            // permanently attached to the terminal. This also doesn't work when the default profile
            // setting is set to null, that's handled after the process is created.
            if (!this.shellLaunchConfig.executable && !workbenchEnvironmentService.remoteAuthority) {
                this.Zb.resolveIcon(this.Xb, platform_1.OS);
            }
            this.ib = Xb.attachPersistentProcess?.icon || Xb.icon;
            // When a custom pty is used set the name immediately so it gets passed over to the exthost
            // and is available when Pseudoterminal.open fires.
            if (this.shellLaunchConfig.customPtyImplementation) {
                this.nd(this.Xb.name, terminal_1.TitleEventSource.Api);
            }
            this.statusList = this.g.createInstance(terminalStatusList_1.$lfb);
            this.yc();
            this.h = this.Mc();
            this.gb = new async_1.$Gg(100 /* Constants.WaitForContainerThreshold */);
            this.hb = new async_1.$Gg(1000);
            this.n = this.Dc();
            this.n.then(async () => {
                // Wait for a period to allow a container to be ready
                await this.gb.wait();
                // Resolve the executable ahead of time if shell integration is enabled, this should not
                // be done for custom PTYs as that would cause extension Pseudoterminal-based terminals
                // to hang in resolver extensions
                if (!this.shellLaunchConfig.customPtyImplementation && this.Wb.config.shellIntegration?.enabled && !this.shellLaunchConfig.executable) {
                    const os = await this.h.getBackendOS();
                    const defaultProfile = (await this.Zb.getDefaultProfile({ remoteAuthority: this.remoteAuthority, os }));
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
                await this.Nc();
                // Re-establish the title after reconnect
                if (this.shellLaunchConfig.attachPersistentProcess) {
                    this.$ = this.shellLaunchConfig.attachPersistentProcess.cwd;
                    this.nd(this.shellLaunchConfig.attachPersistentProcess.title, this.shellLaunchConfig.attachPersistentProcess.titleSource);
                    this.setShellType(this.shellType);
                }
                if (this.Y) {
                    await this.fd();
                }
            }).catch((err) => {
                // Ignore exceptions if the terminal is already disposed
                if (!this.D) {
                    throw err;
                }
            });
            this.B(this.gc.onDidChangeConfiguration(async (e) => {
                if (e.affectsConfiguration("accessibility.verbosity.terminal" /* AccessibilityVerbositySettingId.Terminal */)) {
                    this.bd(this.xterm?.raw, this.t, this.title);
                }
                if (e.affectsConfiguration('terminal.integrated')) {
                    this.updateConfig();
                    this.setVisible(this.C);
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
                    this.cb = true;
                    await this.$c();
                }
                if (e.affectsConfiguration("terminal.integrated.unicodeVersion" /* TerminalSettingId.UnicodeVersion */)) {
                    this.Yc();
                }
                if (e.affectsConfiguration('editor.accessibilitySupport')) {
                    this.updateAccessibilitySupport();
                }
                if (e.affectsConfiguration("terminal.integrated.tabs.title" /* TerminalSettingId.TerminalTitle */) ||
                    e.affectsConfiguration("terminal.integrated.tabs.separator" /* TerminalSettingId.TerminalTitleSeparator */) ||
                    e.affectsConfiguration("terminal.integrated.tabs.description" /* TerminalSettingId.TerminalDescription */)) {
                    this.tb?.refreshLabel(this);
                }
            }));
            this.B(this.nc.onDidChangeWorkspaceFolders(() => this.tb?.refreshLabel(this)));
            this.B(this.onDidBlur(() => this.xterm?.suggestController?.hideSuggestWidget()));
            // Clear out initial data events after 10 seconds, hopefully extension hosts are up and
            // running at that point.
            let initialDataEventsTimeout = window.setTimeout(() => {
                initialDataEventsTimeout = undefined;
                this.fb = undefined;
            }, 10000);
            this.B((0, lifecycle_1.$ic)(() => {
                if (initialDataEventsTimeout) {
                    window.clearTimeout(initialDataEventsTimeout);
                }
            }));
            // Initialize contributions
            const contributionDescs = terminalExtensions_1.TerminalExtensionsRegistry.getTerminalContributions();
            for (const desc of contributionDescs) {
                if (this.j.has(desc.id)) {
                    (0, errors_1.$Y)(new Error(`Cannot have two terminal contributions with the same id ${desc.id}`));
                    continue;
                }
                let contribution;
                try {
                    contribution = this.g.createInstance(desc.ctor, this, this.h, this.kb);
                    this.j.set(desc.id, contribution);
                }
                catch (err) {
                    (0, errors_1.$Y)(err);
                }
                this.n.then(xterm => {
                    contribution.xtermReady?.(xterm);
                });
                this.onDisposed(() => {
                    contribution.dispose();
                    this.j.delete(desc.id);
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
            return this.j.get(id);
        }
        wc() {
            if (!this.ib) {
                this.ib = this.h.processState >= 2 /* ProcessState.Launching */
                    ? (0, iconRegistry_1.$0u)().getIcon(this.gc.getValue("terminal.integrated.tabs.defaultIcon" /* TerminalSettingId.TabsDefaultIcon */))
                    : undefined;
            }
            return this.ib;
        }
        xc() {
            if (this.shellLaunchConfig.color) {
                return this.shellLaunchConfig.color;
            }
            if (this.shellLaunchConfig?.attachPersistentProcess?.color) {
                return this.shellLaunchConfig.attachPersistentProcess.color;
            }
            if (this.h.processState >= 2 /* ProcessState.Launching */) {
                return undefined;
            }
            return undefined;
        }
        yc() {
            // The terminal panel needs to have been created to get the real view dimensions
            if (!this.M) {
                // Set the fallback dimensions if not
                this.W = 80 /* Constants.DefaultCols */;
                this.X = 30 /* Constants.DefaultRows */;
                return;
            }
            const computedStyle = window.getComputedStyle(this.M);
            const width = parseInt(computedStyle.width);
            const height = parseInt(computedStyle.height);
            this.zc(width, height);
        }
        /**
         * Evaluates and sets the cols and rows of the terminal if possible.
         * @param width The width of the container.
         * @param height The height of the container.
         * @return The terminal's width if it requires a layout.
         */
        zc(width, height) {
            // Ignore if dimensions are undefined or 0
            if (!width || !height) {
                this.Ac();
                return null;
            }
            const dimension = this.Cc(width, height);
            if (!dimension) {
                this.Ac();
                return null;
            }
            const font = this.xterm ? this.xterm.getFont() : this.Wb.getFont();
            const newRC = (0, xtermTerminal_1.$Lib)(font, dimension.width, dimension.height);
            if (!newRC) {
                this.Ac();
                return null;
            }
            if (this.W !== newRC.cols || this.X !== newRC.rows) {
                this.W = newRC.cols;
                this.X = newRC.rows;
                this.Bc();
            }
            return dimension.width;
        }
        Ac() {
            if ($$Vb_1.c) {
                this.W = $$Vb_1.c.cols;
                this.X = $$Vb_1.c.rows;
            }
        }
        Bc() {
            this.Kb.fire();
        }
        Cc(width, height) {
            // The font needs to have been initialized
            const font = this.xterm ? this.xterm.getFont() : this.Wb.getFont();
            if (!font || !font.charWidth || !font.charHeight) {
                return undefined;
            }
            if (!this.xterm?.raw.element) {
                return undefined;
            }
            const computedStyle = window.getComputedStyle(this.xterm.raw.element);
            const horizontalPadding = parseInt(computedStyle.paddingLeft) + parseInt(computedStyle.paddingRight);
            const verticalPadding = parseInt(computedStyle.paddingTop) + parseInt(computedStyle.paddingBottom);
            $$Vb_1.b = new dom.$BO(Math.min(8000 /* Constants.MaxCanvasWidth */, width - horizontalPadding), height + (this.vb && !this.O ? -5 /* scroll bar height */ : 0) - 2 /* bottom padding */ - verticalPadding);
            return $$Vb_1.b;
        }
        get persistentProcessId() { return this.h.persistentProcessId; }
        get shouldPersist() { return this.h.shouldPersist && !this.shellLaunchConfig.isTransient && (!this.reconnectionProperties || this.gc.getValue('task.reconnection') === true); }
        static getXtermConstructor(keybindingService, contextKeyService) {
            const keybinding = keybindingService.lookupKeybinding("workbench.action.terminal.focusAccessibleBuffer" /* TerminalCommandId.FocusAccessibleBuffer */, contextKeyService);
            if (xtermConstructor) {
                return xtermConstructor;
            }
            xtermConstructor = async_1.Promises.withAsyncBody(async (resolve) => {
                const Terminal = (await (0, amdX_1.$aD)('xterm', 'lib/xterm.js')).Terminal;
                // Localize strings
                Terminal.strings.promptLabel = nls.localize(2, null);
                Terminal.strings.tooMuchOutput = keybinding ? nls.localize(3, null, keybinding.getLabel()) : nls.localize(4, null);
                resolve(Terminal);
            });
            return xtermConstructor;
        }
        /**
         * Create xterm.js instance and attach data listeners.
         */
        async Dc() {
            const Terminal = await $$Vb_1.getXtermConstructor(this.ac, this.Yb);
            if (this.D) {
                throw new errors_1.$_('Terminal disposed of during xterm.js creation');
            }
            const disableShellIntegrationReporting = (this.shellLaunchConfig.hideFromUser || this.shellLaunchConfig.executable === undefined || this.shellType === undefined) || !shellIntegrationSupportedShellTypes.includes(this.shellType);
            const xterm = this.g.createInstance(xtermTerminal_1.$Kib, Terminal, this.Wb, this.W, this.X, {
                getBackgroundColor: (theme) => {
                    const terminalBackground = theme.getColor(terminalColorRegistry_1.$ofb);
                    if (terminalBackground) {
                        return terminalBackground;
                    }
                    if (this.target === terminal_1.TerminalLocation.Editor) {
                        return theme.getColor(colorRegistry_1.$ww);
                    }
                    const location = this.vc.getViewLocationById(terminal_2.$tM);
                    if (location === 1 /* ViewContainerLocation.Panel */) {
                        return theme.getColor(theme_1.$L_);
                    }
                    return theme.getColor(theme_1.$Iab);
                }
            }, this.capabilities, this.h.shellIntegrationNonce, this.Vb, disableShellIntegrationReporting);
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
            const initialTextWrittenPromise = this.Xb.initialText ? new Promise(r => this.Tc(xterm, r)) : undefined;
            const lineDataEventAddon = this.B(new lineDataEventAddon_1.$0Vb(initialTextWrittenPromise));
            lineDataEventAddon.onLineData(e => this.Hb.fire(e));
            this.yb = lineDataEventAddon;
            // Delay the creation of the bell listener to avoid showing the bell when the terminal
            // starts up or reconnects
            setTimeout(() => {
                this.B(xterm.raw.onBell(() => {
                    if (this.Wb.config.enableBell) {
                        this.statusList.add({
                            id: "bell" /* TerminalStatus.Bell */,
                            severity: notification_1.Severity.Warning,
                            icon: codicons_1.$Pj.bell,
                            tooltip: nls.localize(5, null)
                        }, this.Wb.config.bellDuration);
                        this.uc.playSound(audioCueService_1.$wZ.terminalBell.sound.getSound());
                    }
                }));
            }, 1000);
            this.B(xterm.raw.onSelectionChange(async () => this.Wc()));
            this.B(xterm.raw.buffer.onBufferChange(() => this.Jc()));
            this.h.onProcessData(e => this.Oc(e));
            this.B(xterm.raw.onData(async (data) => {
                await this.h.write(data);
                this.Ob.fire(this);
            }));
            this.B(xterm.raw.onBinary(data => this.h.processBinary(data)));
            // Init winpty compat and link handler after process creation as they rely on the
            // underlying process OS
            this.h.onProcessReady(async (processTraits) => {
                if (this.h.os) {
                    lineDataEventAddon.setOperatingSystem(this.h.os);
                }
                xterm.raw.options.windowsPty = processTraits.windowsPty;
            });
            this.h.onRestoreCommands(e => this.xterm?.shellIntegration.deserialize(e));
            this.B(this.vc.onDidChangeLocation(({ views }) => {
                if (views.some(v => v.id === terminal_2.$tM)) {
                    xterm.refresh();
                }
            }));
            // Set up updating of the process cwd on key press, this is only needed when the cwd
            // detection capability has not been registered
            if (!this.capabilities.has(0 /* TerminalCapability.CwdDetection */)) {
                let onKeyListener = xterm.raw.onKey(e => {
                    const event = new keyboardEvent_1.$jO(e.domEvent);
                    if (event.equals(3 /* KeyCode.Enter */)) {
                        this.Xc();
                    }
                });
                this.B(this.capabilities.onDidAddCapabilityType(e => {
                    if (e === 0 /* TerminalCapability.CwdDetection */) {
                        onKeyListener?.dispose();
                        onKeyListener = undefined;
                    }
                }));
            }
            this.$b.userHome().then(userHome => {
                this.ub = userHome.fsPath;
            });
            if (this.C) {
                this.Fc();
            }
            return xterm;
        }
        async Ec() {
            const xterm = this.xterm || await this.n;
            xterm.raw.loadAddon(this.yb);
        }
        async runCommand(commandLine, addNewLine) {
            // Determine whether to send ETX (ctrl+c) before running the command. This should always
            // happen unless command detection can reliably say that a command is being entered and
            // there is no content in the prompt
            if (this.capabilities.get(2 /* TerminalCapability.CommandDetection */)?.hasInput !== false) {
                await this.sendText('\x03', false);
                // Wait a little before running the command to avoid the sequences being echoed while the ^C
                // is being evaluated
                await (0, async_1.$Hg)(100);
            }
            // Use bracketed paste mode only when not running the command
            await this.sendText(commandLine, addNewLine, !addNewLine);
        }
        async runRecent(type, filterMode, value) {
            return this.g.invokeFunction(terminalRunRecentQuickPick_1.$9Vb, this, this.Ub, type, filterMode, value);
        }
        detachFromElement() {
            this.N.remove();
            this.M = undefined;
        }
        attachToElement(container) {
            // The container did not change, do nothing
            if (this.M === container) {
                return;
            }
            this.hb.open();
            // The container changed, reattach
            this.M = container;
            this.M.appendChild(this.N);
            this.xterm?.refresh();
            setTimeout(() => this.Ic(container));
        }
        /**
         * Opens the the terminal instance inside the parent DOM element previously set with
         * `attachToElement`, you must ensure the parent DOM element is explicitly visible before
         * invoking this function as it performs some DOM calculations internally
         */
        Fc() {
            if (!this.xterm || this.xterm.raw.element) {
                return;
            }
            if (!this.M || !this.M.isConnected) {
                throw new Error('A container element needs to be set with `attachToElement` and be part of the DOM before calling `_open`');
            }
            const xtermElement = document.createElement('div');
            this.N.appendChild(xtermElement);
            this.M.appendChild(this.N);
            const xterm = this.xterm;
            // Attach the xterm object to the DOM, exposing it to the smoke tests
            this.N.xterm = xterm.raw;
            const screenElement = xterm.attachToElement(xtermElement);
            this.B(xterm.shellIntegration.onDidChangeStatus(() => {
                if (this.hasFocus) {
                    this.Hc();
                }
                else {
                    this.U.reset();
                }
            }));
            if (!xterm.raw.element || !xterm.raw.textarea) {
                throw new Error('xterm elements not set after open');
            }
            this.bd(xterm.raw, this.t, this.J);
            xterm.raw.attachCustomKeyEventHandler((event) => {
                // Disable all input if the terminal is exiting
                if (this.y) {
                    return false;
                }
                const standardKeyboardEvent = new keyboardEvent_1.$jO(event);
                const resolveResult = this.ac.softDispatch(standardKeyboardEvent, standardKeyboardEvent.target);
                // Respect chords if the allowChords setting is set and it's not Escape. Escape is
                // handled specially for Zen Mode's Escape, Escape chord, plus it's important in
                // terminals generally
                const isValidChord = resolveResult.kind === 1 /* ResultKind.MoreChordsNeeded */ && this.Wb.config.allowChords && event.key !== 'Escape';
                if (this.ac.inChordMode || isValidChord) {
                    event.preventDefault();
                    return false;
                }
                const SHOW_TERMINAL_CONFIG_PROMPT_KEY = 'terminal.integrated.showTerminalConfigPrompt';
                const EXCLUDED_KEYS = ['RightArrow', 'LeftArrow', 'UpArrow', 'DownArrow', 'Space', 'Meta', 'Control', 'Shift', 'Alt', '', 'Delete', 'Backspace', 'Tab'];
                // only keep track of input if prompt hasn't already been shown
                if (this.jc.getBoolean(SHOW_TERMINAL_CONFIG_PROMPT_KEY, -1 /* StorageScope.APPLICATION */, true) &&
                    !EXCLUDED_KEYS.includes(event.key) &&
                    !event.ctrlKey &&
                    !event.shiftKey &&
                    !event.altKey) {
                    this.nb = true;
                }
                // for keyboard events that resolve to commands described
                // within commandsToSkipShell, either alert or skip processing by xterm.js
                if (resolveResult.kind === 2 /* ResultKind.KbFound */ && resolveResult.commandId && this.H.some(k => k === resolveResult.commandId) && !this.Wb.config.sendKeybindingsToShell) {
                    // don't alert when terminal is opened or closed
                    if (this.jc.getBoolean(SHOW_TERMINAL_CONFIG_PROMPT_KEY, -1 /* StorageScope.APPLICATION */, true) &&
                        this.nb &&
                        !terminal_2.$uM.includes(resolveResult.commandId)) {
                        this.bc.prompt(notification_1.Severity.Info, nls.localize(6, null, this.lc.nameLong), [
                            {
                                label: nls.localize(7, null),
                                run: () => {
                                    this.cc.openSettings({ jsonEditor: false, query: `@id:${"terminal.integrated.commandsToSkipShell" /* TerminalSettingId.CommandsToSkipShell */},${"terminal.integrated.sendKeybindingsToShell" /* TerminalSettingId.SendKeybindingsToShell */},${"terminal.integrated.allowChords" /* TerminalSettingId.AllowChords */}` });
                                }
                            }
                        ]);
                        this.jc.store(SHOW_TERMINAL_CONFIG_PROMPT_KEY, false, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                    }
                    event.preventDefault();
                    return false;
                }
                // Skip processing by xterm.js of keyboard events that match menu bar mnemonics
                if (this.Wb.config.allowMnemonics && !platform_1.$j && event.altKey) {
                    return false;
                }
                // If tab focus mode is on, tab is not passed to the terminal
                if (tabFocus_1.$CU.getTabFocusMode() && event.key === 'Tab') {
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
                if (platform_1.$i && event.altKey && event.key === 'F4' && !event.ctrlKey) {
                    return false;
                }
                // Fallback to force ctrl+v to paste on browsers that do not support
                // navigator.clipboard.readText
                if (!canIUse_1.$bO.clipboard.readText && event.key === 'v' && event.ctrlKey) {
                    return false;
                }
                return true;
            });
            this.B(dom.$nO(xterm.raw.element, 'mousedown', () => {
                // We need to listen to the mouseup event on the document since the user may release
                // the mouse button anywhere outside of _xterm.element.
                const listener = dom.$nO(document, 'mouseup', () => {
                    // Delay with a setTimeout to allow the mouseup to propagate through the DOM
                    // before evaluating the new selection state.
                    setTimeout(() => this.Lc(), 0);
                    listener.dispose();
                });
            }));
            this.B(dom.$nO(xterm.raw.element, 'touchstart', () => {
                xterm.raw.focus();
            }));
            // xterm.js currently drops selection on keyup as we need to handle this case.
            this.B(dom.$nO(xterm.raw.element, 'keyup', () => {
                // Wait until keyup has propagated through the DOM before evaluating
                // the new selection state.
                setTimeout(() => this.Lc(), 0);
            }));
            this.B(dom.$nO(xterm.raw.textarea, 'focus', () => this.Gc(true)));
            this.B(dom.$nO(xterm.raw.textarea, 'blur', () => this.Gc(false)));
            this.B(dom.$nO(xterm.raw.textarea, 'focusout', () => this.Gc(false)));
            this.Ic(this.M);
            this.kb.attachToElement(screenElement);
            if (this.mb) {
                this.layout(this.mb);
            }
            this.updateConfig();
            // If IShellLaunchConfig.waitOnExit was true and the process finished before the terminal
            // panel was initialized.
            if (xterm.raw.options.disableStdin) {
                this.Sc(xterm.raw);
            }
        }
        Gc(focused) {
            if (focused) {
                this.P.set(true);
                this.Hc();
                this.Lb.fire(this);
            }
            else {
                this.resetFocusContextKey();
                this.Nb.fire(this);
                this.Lc();
            }
        }
        Hc() {
            if (this.xterm) {
                this.U.set(this.xterm.shellIntegration.status === 2 /* ShellIntegrationStatus.VSCode */);
            }
        }
        resetFocusContextKey() {
            this.P.reset();
            this.U.reset();
        }
        Ic(container) {
            const dndController = this.B(this.g.createInstance(TerminalInstanceDragAndDropController, container));
            dndController.onDropTerminal(e => this.Qb.fire(e));
            dndController.onDropFile(async (path) => {
                this.focus();
                await this.sendPath(path, false);
            });
            this.lb.value = new dom.$zP(container, dndController);
        }
        hasSelection() {
            return this.xterm ? this.xterm.raw.hasSelection() : false;
        }
        async copySelection(asHtml, command) {
            const xterm = await this.n;
            await xterm.copySelection(asHtml, command);
        }
        get selection() {
            return this.xterm && this.hasSelection() ? this.xterm.raw.getSelection() : undefined;
        }
        clearSelection() {
            this.xterm?.raw.clearSelection();
        }
        Jc() {
            this.S.set(!!(this.xterm && this.xterm.raw.buffer.active === this.xterm.raw.buffer.alternate));
        }
        async Kc(text) {
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
            if (textForLines.length === 1 || !this.gc.getValue("terminal.integrated.enableMultiLinePasteWarning" /* TerminalSettingId.EnableMultiLinePasteWarning */)) {
                return true;
            }
            const displayItemsCount = 3;
            const maxPreviewLineLength = 30;
            let detail = nls.localize(8, null);
            for (let i = 0; i < Math.min(textForLines.length, displayItemsCount); i++) {
                const line = textForLines[i];
                const cleanedLine = line.length > maxPreviewLineLength ? `${line.slice(0, maxPreviewLineLength)}…` : line;
                detail += `\n${cleanedLine}`;
            }
            if (textForLines.length > displayItemsCount) {
                detail += `\n…`;
            }
            const { confirmed, checkboxChecked } = await this.ic.confirm({
                message: nls.localize(9, null, textForLines.length),
                detail,
                primaryButton: nls.localize(10, null),
                checkbox: {
                    label: nls.localize(11, null)
                }
            });
            if (confirmed && checkboxChecked) {
                await this.gc.updateValue("terminal.integrated.enableMultiLinePasteWarning" /* TerminalSettingId.EnableMultiLinePasteWarning */, false);
            }
            return confirmed;
        }
        dispose(reason) {
            if (this.D) {
                return;
            }
            this.D = true;
            this.hc.trace(`terminalInstance#dispose (instanceId: ${this.instanceId})`);
            (0, lifecycle_1.$fc)(this.kb);
            if (this.xterm?.raw.element) {
                this.z = this.hasFocus;
            }
            if (this.N.xterm) {
                this.N.xterm = undefined;
            }
            if (this.O) {
                this.O.dispose();
                this.O = undefined;
            }
            try {
                this.xterm?.dispose();
            }
            catch (err) {
                // See https://github.com/microsoft/vscode/issues/153486
                this.hc.error('Exception occurred during xterm disposal', err);
            }
            // HACK: Workaround for Firefox bug https://bugzilla.mozilla.org/show_bug.cgi?id=559561,
            // as 'blur' event in xterm.raw.textarea is not triggered on xterm.dispose()
            // See https://github.com/microsoft/vscode/issues/138358
            if (browser_1.$5N) {
                this.resetFocusContextKey();
                this.R.reset();
                this.Nb.fire(this);
            }
            if (this.s) {
                this.s.dispose();
                this.s = undefined;
            }
            if (this.G === undefined) {
                this.G = reason ?? terminal_1.TerminalExitReason.Unknown;
            }
            this.h.dispose();
            // Process manager dispose/shutdown doesn't fire process exit, trigger with undefined if it
            // hasn't happened yet
            this.Pc(undefined);
            this.Ab.fire(this);
            super.dispose();
        }
        async detachProcessAndDispose(reason) {
            // Detach the process and dispose the instance, without the instance dispose the terminal
            // won't go away. Force persist if the detach was requested by the user (not shutdown).
            await this.h.detachFromProcess(reason === terminal_1.TerminalExitReason.User);
            this.dispose(reason);
        }
        focus(force) {
            this.Jc();
            if (!this.xterm) {
                return;
            }
            if (force || !window.getSelection()?.toString()) {
                this.xterm.raw.focus();
                this.Mb.fire();
            }
        }
        async focusWhenReady(force) {
            await this.n;
            await this.hb.wait();
            this.focus(force);
        }
        async paste() {
            if (!this.xterm) {
                return;
            }
            const currentText = await this.ec.readText();
            if (!await this.Kc(currentText)) {
                return;
            }
            this.focus();
            this.xterm.raw.paste(currentText);
        }
        async pasteSelection() {
            if (!this.xterm) {
                return;
            }
            const currentText = await this.ec.readText('selection');
            if (!await this.Kc(currentText)) {
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
            await this.h.write(text);
            this.Ob.fire(this);
            this.xterm?.suggestController?.handleNonXtermData(text);
            this.xterm?.scrollToBottom();
            this.Sb.fire();
        }
        async sendPath(originalPath, addNewLine) {
            return this.sendText(await this.preparePathForShell(originalPath), addNewLine);
        }
        async preparePathForShell(originalPath) {
            // Wait for shell type to be ready
            await this.processReady;
            return (0, terminalEnvironment_1.$1M)(originalPath, this.shellLaunchConfig.executable, this.title, this.shellType, this.h.backend, this.h.os);
        }
        setVisible(visible) {
            this.C = visible;
            this.N.classList.toggle('active', visible);
            if (visible && this.xterm) {
                this.Fc();
                // Resize to re-evaluate dimensions, this will ensure when switching to a terminal it is
                // using the most up to date dimensions (eg. when terminal is created in the background
                // using cached dimensions of a split terminal).
                this.$c();
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
            this.h.clearBuffer();
            this.xterm?.clearBuffer();
        }
        Lc() {
            const isActive = !!this.dc.getActiveViewWithId(terminal_2.$tM);
            let isEditorActive = false;
            const editor = this.oc.activeEditor;
            if (editor) {
                isEditorActive = editor instanceof terminalEditorInput_1.$Zib;
            }
            this.R.set((isActive || isEditorActive) && this.hasSelection());
        }
        Mc() {
            let deserializedCollections;
            if (this.shellLaunchConfig.attachPersistentProcess?.environmentVariableCollections) {
                deserializedCollections = (0, environmentVariableShared_1.$fr)(this.shellLaunchConfig.attachPersistentProcess.environmentVariableCollections);
            }
            const processManager = this.g.createInstance(terminalProcessManager_1.$7Vb, this.t, this.Wb, this.shellLaunchConfig?.cwd, deserializedCollections, this.shellLaunchConfig.attachPersistentProcess?.shellIntegrationNonce);
            this.capabilities.add(processManager.capabilities);
            processManager.onProcessReady(async (e) => {
                this.Bb.fire(this);
                this.ab = await this.getInitialCwd();
                // Set the initial name based on the _resolved_ shell launch config, this will also
                // ensure the resolved icon gets shown
                if (!this.tb) {
                    this.tb = this.B(this.g.createInstance($_Vb, this.Wb));
                    this.B(this.tb.onDidChangeLabel(e => {
                        this.J = e.title;
                        this.ob = e.description;
                        this.Db.fire(this);
                    }));
                }
                if (this.Xb.name) {
                    this.nd(this.Xb.name, terminal_1.TitleEventSource.Api);
                }
                else {
                    // Listen to xterm.js' sequence title change event, trigger this async to ensure
                    // _xtermReadyPromise is ready constructed since this is called from the ctor
                    setTimeout(() => {
                        this.n.then(xterm => {
                            this.jb.value = xterm.raw.onTitleChange(e => this.Uc(e));
                        });
                    });
                    this.nd(this.Xb.executable, terminal_1.TitleEventSource.Process);
                }
            });
            processManager.onProcessExit(exitCode => this.Pc(exitCode));
            processManager.onDidChangeProperty(({ type, value }) => {
                switch (type) {
                    case "cwd" /* ProcessPropertyType.Cwd */:
                        this.$ = value;
                        this.tb?.refreshLabel(this);
                        break;
                    case "initialCwd" /* ProcessPropertyType.InitialCwd */:
                        this.ab = value;
                        this.$ = this.ab;
                        this.nd(this.title, terminal_1.TitleEventSource.Config);
                        this.ib = this.Xb.attachPersistentProcess?.icon || this.Xb.icon;
                        this.Eb.fire({ instance: this, userInitiated: false });
                        break;
                    case "title" /* ProcessPropertyType.Title */:
                        this.nd(value ?? '', terminal_1.TitleEventSource.Process);
                        break;
                    case "overrideDimensions" /* ProcessPropertyType.OverrideDimensions */:
                        this.setOverrideDimensions(value, true);
                        break;
                    case "resolvedShellLaunchConfig" /* ProcessPropertyType.ResolvedShellLaunchConfig */:
                        this.hd(value);
                        break;
                    case "shellType" /* ProcessPropertyType.ShellType */:
                        this.setShellType(value);
                        break;
                    case "hasChildProcesses" /* ProcessPropertyType.HasChildProcesses */:
                        this.Rb.fire(value);
                        break;
                    case "usedShellIntegrationInjection" /* ProcessPropertyType.UsedShellIntegrationInjection */:
                        this.xb = true;
                        break;
                }
            });
            processManager.onProcessData(ev => {
                this.fb?.push(ev.data);
                this.Fb.fire(ev.data);
            });
            processManager.onProcessReplayComplete(() => this.Cb.fire());
            processManager.onEnvironmentVariableInfoChanged(e => this.jd(e));
            processManager.onPtyDisconnect(() => {
                if (this.xterm) {
                    this.xterm.raw.options.disableStdin = true;
                }
                this.statusList.add({
                    id: "disconnected" /* TerminalStatus.Disconnected */,
                    severity: notification_1.Severity.Error,
                    icon: codicons_1.$Pj.debugDisconnect,
                    tooltip: nls.localize(12, null)
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
        async Nc() {
            if (this.D) {
                return;
            }
            const activeWorkspaceRootUri = this.qc.getLastActiveWorkspaceRoot(network_1.Schemas.file);
            if (activeWorkspaceRootUri) {
                const trusted = await this.Vc();
                if (!trusted) {
                    this.Pc({ message: nls.localize(13, null) });
                }
            }
            else if (this.$ && this.ub && this.$ !== this.ub) {
                // something strange is going on if cwd is not userHome in an empty workspace
                this.Pc({
                    message: nls.localize(14, null, this.$, this.ub)
                });
            }
            // Re-evaluate dimensions if the container has been set since the xterm instance was created
            if (this.M && this.W === 0 && this.X === 0) {
                this.yc();
                this.xterm?.raw.resize(this.W || 80 /* Constants.DefaultCols */, this.X || 30 /* Constants.DefaultRows */);
            }
            const originalIcon = this.shellLaunchConfig.icon;
            await this.h.createProcess(this.Xb, this.W || 80 /* Constants.DefaultCols */, this.X || 30 /* Constants.DefaultRows */).then(result => {
                if (result) {
                    if ('message' in result) {
                        this.Pc(result);
                    }
                    else if ('injectedArgs' in result) {
                        this.bb = result.injectedArgs;
                    }
                }
            });
            if (this.xterm?.shellIntegration) {
                this.capabilities.add(this.xterm.shellIntegration.capabilities);
            }
            if (originalIcon !== this.shellLaunchConfig.icon || this.shellLaunchConfig.color) {
                this.ib = this.Xb.attachPersistentProcess?.icon || this.Xb.icon;
                this.Eb.fire({ instance: this, userInitiated: false });
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
            await this.h?.freePortKillProcess(port);
            this.runCommand(command, false);
        }
        Oc(ev) {
            const messageId = ++this.u;
            if (ev.trackCommit) {
                ev.writePromise = new Promise(r => {
                    this.xterm?.raw.write(ev.data, () => {
                        this.w = messageId;
                        this.h.acknowledgeDataEvent(ev.data.length);
                        r();
                    });
                });
            }
            else {
                this.xterm?.raw.write(ev.data, () => {
                    this.w = messageId;
                    this.h.acknowledgeDataEvent(ev.data.length);
                });
            }
        }
        /**
         * Called when either a process tied to a terminal has exited or when a terminal renderer
         * simulates a process exiting (e.g. custom execution task).
         * @param exitCode The exit code of the process, this is undefined when the terminal was exited
         * through user action.
         */
        async Pc(exitCodeOrError) {
            // Prevent dispose functions being triggered multiple times
            if (this.y) {
                return;
            }
            const parsedExitResult = $aWb(exitCodeOrError, this.shellLaunchConfig, this.h.processState, this.ab);
            if (this.xb && this.h.processState === 4 /* ProcessState.KilledDuringLaunch */ && parsedExitResult?.code !== 0) {
                this.Qc(parsedExitResult?.message);
                this.zb.fire(exitCodeOrError);
                return;
            }
            this.y = true;
            await this.Rc();
            this.F = parsedExitResult?.code;
            const exitMessage = parsedExitResult?.message;
            this.hc.debug('Terminal process exit', 'instanceId', this.instanceId, 'code', this.F, 'processState', this.h.processState);
            // Only trigger wait on exit when the exit was *not* triggered by the
            // user (via the `workbench.action.terminal.kill` command).
            const waitOnExit = this.waitOnExit;
            if (waitOnExit && this.h.processState !== 5 /* ProcessState.KilledByUser */) {
                this.n.then(xterm => {
                    if (exitMessage) {
                        xterm.raw.write((0, terminalStrings_1.$zKb)(exitMessage));
                    }
                    switch (typeof waitOnExit) {
                        case 'string':
                            xterm.raw.write((0, terminalStrings_1.$zKb)(waitOnExit, { excludeLeadingNewLine: true }));
                            break;
                        case 'function':
                            if (this.exitCode !== undefined) {
                                xterm.raw.write((0, terminalStrings_1.$zKb)(waitOnExit(this.exitCode), { excludeLeadingNewLine: true }));
                            }
                            break;
                    }
                    // Disable all input if the terminal is exiting and listen for next keypress
                    xterm.raw.options.disableStdin = true;
                    if (xterm.raw.textarea) {
                        this.Sc(xterm.raw);
                    }
                });
            }
            else {
                this.dispose(terminal_1.TerminalExitReason.Process);
                if (exitMessage) {
                    const failedDuringLaunch = this.h.processState === 4 /* ProcessState.KilledDuringLaunch */;
                    if (failedDuringLaunch || this.Wb.config.showExitAlert) {
                        // Always show launch failures
                        this.bc.notify({
                            message: exitMessage,
                            severity: notification_1.Severity.Error,
                            actions: { primary: [this.g.createInstance(terminalActions_1.$GVb)] }
                        });
                    }
                    else {
                        // Log to help surface the error in case users report issues with showExitAlert
                        // disabled
                        this.hc.warn(exitMessage);
                    }
                }
            }
            // First onExit to consumers, this can happen after the terminal has already been disposed.
            this.zb.fire(exitCodeOrError);
            // Dispose of the onExit event if the terminal will not be reused again
            if (this.D) {
                this.zb.dispose();
            }
        }
        Qc(exitMessage) {
            this.Xb.ignoreShellIntegration = true;
            this.relaunch();
            this.statusList.add({
                id: "shell-integration-attention-needed" /* TerminalStatus.ShellIntegrationAttentionNeeded */,
                severity: notification_1.Severity.Warning,
                icon: codicons_1.$Pj.warning,
                tooltip: (`${exitMessage} ` ?? '') + nls.localize(15, null),
                hoverActions: [{
                        commandId: "workbench.action.terminal.learnMore" /* TerminalCommandId.ShellIntegrationLearnMore */,
                        label: nls.localize(16, null),
                        run: () => {
                            this.sc.open('https://code.visualstudio.com/docs/editor/integrated-terminal#_shell-integration');
                        }
                    }, {
                        commandId: 'workbench.action.openSettings',
                        label: nls.localize(17, null),
                        run: () => {
                            this.tc.executeCommand('workbench.action.openSettings', 'terminal.integrated.shellIntegration.enabled');
                        }
                    }]
            });
            this.rc.publicLog2('terminal/shellIntegrationFailureProcessExit');
        }
        /**
         * Ensure write calls to xterm.js have finished before resolving.
         */
        Rc() {
            if (this.u === this.w) {
                return Promise.resolve();
            }
            let retries = 0;
            return new Promise(r => {
                const interval = setInterval(() => {
                    if (this.u === this.w || ++retries === 5) {
                        clearInterval(interval);
                        r();
                    }
                }, 20);
            });
        }
        Sc(xterm) {
            if (xterm.textarea && !this.s) {
                this.s = dom.$nO(xterm.textarea, 'keypress', (event) => {
                    if (this.s) {
                        this.s.dispose();
                        this.s = undefined;
                        this.dispose(terminal_1.TerminalExitReason.Process);
                        event.preventDefault();
                    }
                });
            }
        }
        Tc(xterm, callback) {
            if (!this.Xb.initialText) {
                callback?.();
                return;
            }
            const text = typeof this.Xb.initialText === 'string'
                ? this.Xb.initialText
                : this.Xb.initialText?.text;
            if (typeof this.Xb.initialText === 'string') {
                xterm.raw.writeln(text, callback);
            }
            else {
                if (this.Xb.initialText.trailingNewLine) {
                    xterm.raw.writeln(text, callback);
                }
                else {
                    xterm.raw.write(text, callback);
                }
            }
        }
        async reuseTerminal(shell, reset = false) {
            // Unsubscribe any key listener we may have.
            this.s?.dispose();
            this.s = undefined;
            const xterm = this.xterm;
            if (xterm) {
                if (!reset) {
                    // Ensure new processes' output starts at start of new line
                    await new Promise(r => xterm.raw.write('\n\x1b[G', r));
                }
                // Print initialText if specified
                if (shell.initialText) {
                    this.Xb.initialText = shell.initialText;
                    await new Promise(r => this.Tc(xterm, r));
                }
                // Clean up waitOnExit state
                if (this.y && this.Xb.waitOnExit) {
                    xterm.raw.options.disableStdin = false;
                    this.y = false;
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
            this.Xb = shell; // Must be done before calling _createProcess()
            await this.h.relaunch(this.Xb, this.W || 80 /* Constants.DefaultCols */, this.X || 30 /* Constants.DefaultRows */, reset).then(result => {
                if (result) {
                    if ('message' in result) {
                        this.Pc(result);
                    }
                    else if ('injectedArgs' in result) {
                        this.bb = result.injectedArgs;
                    }
                }
            });
        }
        relaunch() {
            this.reuseTerminal(this.Xb, true);
        }
        Uc(title) {
            if (this.isTitleSetByProcess) {
                this.nd(title, terminal_1.TitleEventSource.Sequence);
            }
        }
        async Vc() {
            return (await this.pc.requestWorkspaceTrust({
                message: nls.localize(18, null)
            })) === true;
        }
        async Wc() {
            this.Pb.fire(this);
            if (this.gc.getValue("terminal.integrated.copyOnSelection" /* TerminalSettingId.CopyOnSelection */)) {
                if (this.hasSelection()) {
                    await this.copySelection();
                }
            }
        }
        async Xc() {
            if (this.D || this.shellLaunchConfig.customPtyImplementation) {
                return;
            }
            // reset cwd if it has changed, so file based url paths can be resolved
            try {
                const cwd = await this.ld("cwd" /* ProcessPropertyType.Cwd */);
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
            this.Zc(this.Wb.config.commandsToSkipShell);
            this.kd(this.h.environmentVariableInfo);
        }
        async Yc() {
            this.h.setUnicodeVersion(this.Wb.config.unicodeVersion);
        }
        updateAccessibilitySupport() {
            this.xterm.raw.options.screenReaderMode = this.kc.isScreenReaderOptimized();
        }
        Zc(commands) {
            const excludeCommands = commands.filter(command => command[0] === '-').map(command => command.slice(1));
            this.H = terminal_2.$KM.filter(defaultCommand => {
                return !excludeCommands.includes(defaultCommand);
            }).concat(commands);
        }
        layout(dimension) {
            this.mb = dimension;
            if (this.disableLayout) {
                return;
            }
            // Don't layout if dimensions are invalid (eg. the container is not attached to the DOM or
            // if display: none
            if (dimension.width <= 0 || dimension.height <= 0) {
                return;
            }
            // Evaluate columns and rows, exclude the wrapper element's margin
            const terminalWidth = this.zc(dimension.width, dimension.height);
            if (!terminalWidth) {
                return;
            }
            this.$c();
            // Signal the container is ready
            this.gb.open();
            // Layout all contributions
            for (const contribution of this.j.values()) {
                if (!this.xterm) {
                    this.n.then(xterm => contribution.layout?.(xterm, dimension));
                }
                else {
                    contribution.layout?.(this.xterm, dimension);
                }
            }
        }
        async $c() {
            this.ad(false);
        }
        async ad(immediate) {
            let cols = this.cols;
            let rows = this.rows;
            if (this.xterm) {
                // Only apply these settings when the terminal is visible so that
                // the characters are measured correctly.
                if (this.C && this.cb) {
                    const font = this.xterm.getFont();
                    const config = this.Wb.config;
                    this.xterm.raw.options.letterSpacing = font.letterSpacing;
                    this.xterm.raw.options.lineHeight = font.lineHeight;
                    this.xterm.raw.options.fontSize = font.fontSize;
                    this.xterm.raw.options.fontFamily = font.fontFamily;
                    this.xterm.raw.options.fontWeight = config.fontWeight;
                    this.xterm.raw.options.fontWeightBold = config.fontWeightBold;
                    // Any of the above setting changes could have changed the dimensions of the
                    // terminal, re-evaluate now.
                    this.yc();
                    cols = this.cols;
                    rows = this.rows;
                    this.cb = false;
                }
                if (isNaN(cols) || isNaN(rows)) {
                    return;
                }
                if (cols !== this.xterm.raw.cols || rows !== this.xterm.raw.rows) {
                    if (this.Z || this.Y) {
                        await this.md("fixedDimensions" /* ProcessPropertyType.FixedDimensions */, { cols: this.Y, rows: this.Z });
                    }
                    this.Jb.fire();
                }
                this.xterm.raw.resize(cols, rows);
                $$Vb_1.c = { cols, rows };
                if (this.C) {
                    this.xterm.forceUnpause();
                }
            }
            if (immediate) {
                // do not await, call setDimensions synchronously
                this.h.setDimensions(cols, rows, true);
            }
            else {
                await this.h.setDimensions(cols, rows);
            }
        }
        setShellType(shellType) {
            this.I = shellType;
            if (shellType) {
                this.Tb.set(shellType?.toString());
            }
        }
        bd(xterm, terminalId, title) {
            const labelParts = [];
            if (xterm && xterm.textarea) {
                if (title && title.length > 0) {
                    labelParts.push(nls.localize(19, null, terminalId, title));
                }
                else {
                    labelParts.push(nls.localize(20, null, terminalId));
                }
                const screenReaderOptimized = this.kc.isScreenReaderOptimized();
                if (!screenReaderOptimized) {
                    labelParts.push(nls.localize(21, null));
                }
                const accessibilityHelpKeybinding = this.ac.lookupKeybinding("editor.action.accessibilityHelp" /* AccessibilityCommandId.OpenAccessibilityHelp */)?.getLabel();
                if (this.gc.getValue("accessibility.verbosity.terminal" /* AccessibilityVerbositySettingId.Terminal */) && accessibilityHelpKeybinding) {
                    labelParts.push(nls.localize(22, null, accessibilityHelpKeybinding));
                }
                xterm.textarea.setAttribute('aria-label', labelParts.join('\n'));
            }
        }
        cd(title, eventSource) {
            if (!title) {
                return this.pb;
            }
            switch (eventSource) {
                case terminal_1.TitleEventSource.Process:
                    if (this.h.os === 1 /* OperatingSystem.Windows */) {
                        // Extract the file name without extension
                        title = path.$5d.parse(title).name;
                    }
                    else {
                        const firstSpaceIndex = title.indexOf(' ');
                        if (title.startsWith('/')) {
                            title = path.$ae(title);
                        }
                        else if (firstSpaceIndex > -1) {
                            title = title.substring(0, firstSpaceIndex);
                        }
                    }
                    this.pb = title;
                    break;
                case terminal_1.TitleEventSource.Api:
                    // If the title has not been set by the API or the rename command, unregister the handler that
                    // automatically updates the terminal name
                    this.rb = title;
                    this.jb.value = undefined;
                    break;
                case terminal_1.TitleEventSource.Sequence:
                    // On Windows, some shells will fire this with the full path which we want to trim
                    // to show just the file name. This should only happen if the title looks like an
                    // absolute Windows file path
                    this.qb = title;
                    if (this.h.os === 1 /* OperatingSystem.Windows */ &&
                        title.match(/^[a-zA-Z]:\\.+\.[a-zA-Z]{1,3}/)) {
                        this.qb = path.$5d.parse(title).name;
                    }
                    break;
            }
            this.L = eventSource;
            return title;
        }
        setOverrideDimensions(dimensions, immediate = false) {
            if (this.db && this.db.forceExactSize && !dimensions && this.X === 0 && this.W === 0) {
                // this terminal never had a real size => keep the last dimensions override exact size
                this.W = this.db.cols;
                this.X = this.db.rows;
            }
            this.db = dimensions;
            if (immediate) {
                this.ad(true);
            }
            else {
                this.$c();
            }
        }
        async setFixedDimensions() {
            const cols = await this.mc.input({
                title: nls.localize(23, null),
                placeHolder: 'Enter a number of columns or leave empty for automatic width',
                validateInput: async (text) => text.length > 0 && !text.match(/^\d+$/) ? { content: 'Enter a number or leave empty size automatically', severity: notification_1.Severity.Error } : undefined
            });
            if (cols === undefined) {
                return;
            }
            this.Y = this.dd(cols);
            this.tb?.refreshLabel(this);
            this.Q.set(!!this.Y);
            const rows = await this.mc.input({
                title: nls.localize(24, null),
                placeHolder: 'Enter a number of rows or leave empty for automatic height',
                validateInput: async (text) => text.length > 0 && !text.match(/^\d+$/) ? { content: 'Enter a number or leave empty size automatically', severity: notification_1.Severity.Error } : undefined
            });
            if (rows === undefined) {
                return;
            }
            this.Z = this.dd(rows);
            this.tb?.refreshLabel(this);
            await this.ed();
            this.$c();
            this.focus();
        }
        dd(value) {
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
            if (this.vb) {
                this.Q.set(false);
                this.Y = undefined;
                this.Z = undefined;
                this.vb = false;
                this.yc();
                await this.$c();
            }
            else {
                // Fixed columns should be at least xterm.js' regular column count
                const proposedCols = Math.max(this.maxCols, Math.min(this.xterm.getLongestViewportWrappedLineLength(), 5000 /* Constants.MaxSupportedCols */));
                // Don't switch to fixed dimensions if the content already fits as it makes the scroll
                // bar look bad being off the edge
                if (proposedCols > this.xterm.raw.cols) {
                    this.Y = proposedCols;
                }
            }
            await this.ed();
            this.tb?.refreshLabel(this);
            this.focus();
        }
        ed() {
            if (this.Y || this.Z) {
                return this.fd();
            }
            return this.gd();
        }
        async fd() {
            const charWidth = (this.xterm ? this.xterm.getFont() : this.Wb.getFont()).charWidth;
            if (!this.xterm?.raw.element || !this.M || !charWidth || !this.Y) {
                return;
            }
            this.N.classList.add('fixed-dims');
            this.vb = true;
            this.yc();
            // Always remove a row to make room for the scroll bar
            this.Z = this.X - 1;
            await this.$c();
            this.Q.set(true);
            if (!this.O) {
                this.O = this.B(new scrollableElement_1.$UP(this.N, {
                    vertical: 2 /* ScrollbarVisibility.Hidden */,
                    horizontal: 1 /* ScrollbarVisibility.Auto */,
                    useShadows: false,
                    scrollYToX: false,
                    consumeMouseWheelIfScrollbarIsNeeded: false
                }));
                this.M.appendChild(this.O.getDomNode());
            }
            this.O.setScrollDimensions({
                width: this.xterm.raw.element.clientWidth,
                scrollWidth: this.Y * charWidth + 40 // Padding + scroll bar
            });
            this.O.getDomNode().style.paddingBottom = '16px';
            // work around for https://github.com/xtermjs/xterm.js/issues/3482
            if (platform_1.$i) {
                for (let i = this.xterm.raw.buffer.active.viewportY; i < this.xterm.raw.buffer.active.length; i++) {
                    const line = this.xterm.raw.buffer.active.getLine(i);
                    line._line.isWrapped = false;
                }
            }
        }
        async gd() {
            if (!this.M || !this.O) {
                return;
            }
            this.O.getDomNode().remove();
            this.O.dispose();
            this.O = undefined;
            this.N.remove();
            this.N.classList.remove('fixed-dims');
            this.M.appendChild(this.N);
        }
        hd(shellLaunchConfig) {
            this.Xb.args = shellLaunchConfig.args;
            this.Xb.cwd = shellLaunchConfig.cwd;
            this.Xb.executable = shellLaunchConfig.executable;
            this.Xb.env = shellLaunchConfig.env;
        }
        jd(info) {
            if (info.requiresAction) {
                this.xterm?.raw.textarea?.setAttribute('aria-label', nls.localize(25, null, this.t));
            }
            this.kd(info);
        }
        async kd(info) {
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
                this.Wb.config.environmentChangesRelaunch &&
                // Has not been interacted with
                !this.h.hasWrittenData &&
                // Not a feature terminal or is a reconnecting task terminal (TODO: Need to explain the latter case)
                (!this.Xb.isFeatureTerminal || (this.reconnectionProperties && this.gc.getValue('task.reconnection') === true)) &&
                // Not a custom pty
                !this.Xb.customPtyImplementation &&
                // Not an extension owned terminal
                !this.Xb.isExtensionOwnedTerminal &&
                // Not a reconnected or revived terminal
                !this.Xb.attachPersistentProcess &&
                // Not a Windows remote using ConPTY (#187084)
                !(this.h.remoteAuthority && this.Wb.config.windowsEnableConpty && (await this.h.getBackendOS()) === 1 /* OperatingSystem.Windows */)) {
                this.relaunch();
                return;
            }
            // Re-create statuses
            const workspaceFolder = (0, terminalEnvironment_1.$2M)(this.shellLaunchConfig.cwd, this.nc, this.qc);
            this.statusList.add(info.getStatus({ workspaceFolder }));
        }
        async getInitialCwd() {
            if (!this.ab) {
                this.ab = this.h.initialCwd;
            }
            return this.ab;
        }
        async getCwd() {
            if (this.capabilities.has(0 /* TerminalCapability.CwdDetection */)) {
                return this.capabilities.get(0 /* TerminalCapability.CwdDetection */).getCwd();
            }
            else if (this.capabilities.has(1 /* TerminalCapability.NaiveCwdDetection */)) {
                return this.capabilities.get(1 /* TerminalCapability.NaiveCwdDetection */).getCwd();
            }
            return this.h.initialCwd;
        }
        async ld(type) {
            await this.processReady;
            return this.h.refreshProperty(type);
        }
        async md(type, value) {
            return this.h.updateProperty(type, value);
        }
        async rename(title) {
            this.nd(title, terminal_1.TitleEventSource.Api);
        }
        nd(title, eventSource) {
            const reset = !title;
            title = this.cd(title, eventSource);
            const titleChanged = title !== this.J;
            this.J = title;
            this.tb?.refreshLabel(this, reset);
            this.bd(this.xterm?.raw, this.t, this.J);
            if (titleChanged) {
                this.Db.fire(this);
            }
        }
        async changeIcon() {
            const items = [];
            for (const icon of (0, codicons_1.$Oj)()) {
                items.push({ label: `$(${icon.id})`, description: `${icon.id}`, icon });
            }
            const result = await this.mc.pick(items, {
                matchOnDescription: true,
                placeHolder: nls.localize(26, null)
            });
            if (result) {
                this.ib = result.icon;
                this.Eb.fire({ instance: this, userInitiated: true });
            }
        }
        async changeColor() {
            const icon = this.wc();
            if (!icon) {
                return;
            }
            const colorTheme = this.fc.getColorTheme();
            const standardColors = (0, terminalIcon_1.$Uib)(colorTheme);
            const styleElement = (0, terminalIcon_1.$Vib)(colorTheme);
            const items = [];
            for (const colorKey of standardColors) {
                const colorClass = (0, terminalIcon_1.$Tib)(colorKey);
                items.push({
                    label: `$(${codicons_1.$Pj.circleFilled.id}) ${colorKey.replace('terminal.ansi', '')}`, id: colorKey, description: colorKey, iconClasses: [colorClass]
                });
            }
            items.push({ type: 'separator' });
            const showAllColorsItem = { label: 'Reset to default' };
            items.push(showAllColorsItem);
            document.body.appendChild(styleElement);
            const quickPick = this.mc.createQuickPick();
            quickPick.items = items;
            quickPick.matchOnDescription = true;
            quickPick.placeholder = nls.localize(27, null);
            quickPick.show();
            const disposables = [];
            const result = await new Promise(r => {
                disposables.push(quickPick.onDidHide(() => r(undefined)));
                disposables.push(quickPick.onDidAccept(() => r(quickPick.selectedItems[0])));
            });
            (0, lifecycle_1.$fc)(disposables);
            if (result) {
                this.shellLaunchConfig.color = result.id;
                this.Eb.fire({ instance: this, userInitiated: true });
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
            this.N.classList.add('force-scrollbar');
        }
        resetScrollbarVisibility() {
            this.N.classList.remove('force-scrollbar');
        }
    };
    exports.$$Vb = $$Vb;
    __decorate([
        (0, decorators_1.$7g)(50)
    ], $$Vb.prototype, "Bc", null);
    __decorate([
        (0, decorators_1.$7g)(1000)
    ], $$Vb.prototype, "relaunch", null);
    __decorate([
        (0, decorators_1.$7g)(2000)
    ], $$Vb.prototype, "Xc", null);
    __decorate([
        (0, decorators_1.$7g)(50)
    ], $$Vb.prototype, "$c", null);
    exports.$$Vb = $$Vb = $$Vb_1 = __decorate([
        __param(5, contextkey_1.$3i),
        __param(6, instantiation_1.$Ah),
        __param(7, terminal_2.$EM),
        __param(8, pathService_1.$yJ),
        __param(9, keybinding_1.$2D),
        __param(10, notification_1.$Yu),
        __param(11, preferences_1.$BE),
        __param(12, views_1.$$E),
        __param(13, clipboardService_1.$UZ),
        __param(14, themeService_1.$gv),
        __param(15, configuration_1.$8h),
        __param(16, terminal_1.$Zq),
        __param(17, dialogs_1.$oA),
        __param(18, storage_1.$Vo),
        __param(19, accessibility_1.$1r),
        __param(20, productService_1.$kj),
        __param(21, quickInput_1.$Gq),
        __param(22, environmentService_1.$hJ),
        __param(23, workspace_1.$Kh),
        __param(24, editorService_1.$9C),
        __param(25, workspaceTrust_1.$_z),
        __param(26, history_2.$SM),
        __param(27, telemetry_1.$9k),
        __param(28, opener_1.$NT),
        __param(29, commands_1.$Fr),
        __param(30, audioCueService_1.$sZ),
        __param(31, views_1.$_E)
    ], $$Vb);
    let TerminalInstanceDragAndDropController = class TerminalInstanceDragAndDropController extends lifecycle_1.$kc {
        get onDropFile() { return this.c.event; }
        get onDropTerminal() { return this.f.event; }
        constructor(g, h, j) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.c = this.B(new event_1.$fd());
            this.f = this.B(new event_1.$fd());
            this.B((0, lifecycle_1.$ic)(() => this.m()));
        }
        m() {
            if (this.b && this.b.parentElement) {
                this.b.parentElement.removeChild(this.b);
            }
            this.b = undefined;
        }
        onDragEnter(e) {
            if (!(0, dnd_2.$06)(e, dnd_1.$CP.FILES, dnd_1.$CP.RESOURCES, "Terminals" /* TerminalDataTransfers.Terminals */, dnd_2.$56.FILES)) {
                return;
            }
            if (!this.b) {
                this.b = document.createElement('div');
                this.b.classList.add('terminal-drop-overlay');
            }
            // Dragging terminals
            if ((0, dnd_2.$06)(e, "Terminals" /* TerminalDataTransfers.Terminals */)) {
                const side = this.n(e);
                this.b.classList.toggle('drop-before', side === 'before');
                this.b.classList.toggle('drop-after', side === 'after');
            }
            if (!this.b.parentElement) {
                this.g.appendChild(this.b);
            }
        }
        onDragLeave(e) {
            this.m();
        }
        onDragEnd(e) {
            this.m();
        }
        onDragOver(e) {
            if (!e.dataTransfer || !this.b) {
                return;
            }
            // Dragging terminals
            if ((0, dnd_2.$06)(e, "Terminals" /* TerminalDataTransfers.Terminals */)) {
                const side = this.n(e);
                this.b.classList.toggle('drop-before', side === 'before');
                this.b.classList.toggle('drop-after', side === 'after');
            }
            this.b.style.opacity = '1';
        }
        async onDrop(e) {
            this.m();
            if (!e.dataTransfer) {
                return;
            }
            const terminalResources = (0, terminalUri_1.$QVb)(e);
            if (terminalResources) {
                for (const uri of terminalResources) {
                    const side = this.n(e);
                    this.f.fire({ uri, side });
                }
                return;
            }
            // Check if files were dragged from the tree explorer
            let path;
            const rawResources = e.dataTransfer.getData(dnd_1.$CP.RESOURCES);
            if (rawResources) {
                path = uri_1.URI.parse(JSON.parse(rawResources)[0]);
            }
            const rawCodeFiles = e.dataTransfer.getData(dnd_2.$56.FILES);
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
            this.c.fire(path);
        }
        n(e) {
            const target = this.g;
            if (!target) {
                return 'after';
            }
            const rect = target.getBoundingClientRect();
            return this.s() === 1 /* Orientation.HORIZONTAL */
                ? (e.clientX - rect.left < rect.width / 2 ? 'before' : 'after')
                : (e.clientY - rect.top < rect.height / 2 ? 'before' : 'after');
        }
        s() {
            const panelPosition = this.h.getPanelPosition();
            const terminalLocation = this.j.getViewLocationById(terminal_2.$tM);
            return terminalLocation === 1 /* ViewContainerLocation.Panel */ && panelPosition === 2 /* Position.BOTTOM */
                ? 1 /* Orientation.HORIZONTAL */
                : 0 /* Orientation.VERTICAL */;
        }
    };
    TerminalInstanceDragAndDropController = __decorate([
        __param(1, layoutService_1.$Meb),
        __param(2, views_1.$_E)
    ], TerminalInstanceDragAndDropController);
    var TerminalLabelType;
    (function (TerminalLabelType) {
        TerminalLabelType["Title"] = "title";
        TerminalLabelType["Description"] = "description";
    })(TerminalLabelType || (TerminalLabelType = {}));
    let $_Vb = class $_Vb extends lifecycle_1.$kc {
        get title() { return this.b; }
        get description() { return this.c; }
        constructor(g, h, j) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.b = '';
            this.c = '';
            this.f = this.B(new event_1.$fd());
            this.onDidChangeLabel = this.f.event;
        }
        refreshLabel(instance, reset) {
            this.b = this.computeLabel(instance, this.g.config.tabs.title, "title" /* TerminalLabelType.Title */, reset);
            this.c = this.computeLabel(instance, this.g.config.tabs.description, "description" /* TerminalLabelType.Description */);
            if (this.b !== instance.title || this.c !== instance.description || reset) {
                this.f.fire({ title: this.b, description: this.c });
            }
        }
        computeLabel(instance, labelTemplate, labelType, reset) {
            const type = instance.shellLaunchConfig.attachPersistentProcess?.type || instance.shellLaunchConfig.type;
            const templateProperties = {
                cwd: instance.cwd || instance.initialCwd || '',
                cwdFolder: '',
                workspaceFolder: instance.workspaceFolder ? path.$ae(instance.workspaceFolder.uri.fsPath) : undefined,
                local: type === 'Local' ? type : undefined,
                process: instance.processName,
                sequence: instance.sequence,
                task: type === 'Task' ? type : undefined,
                fixedDimensions: instance.fixedCols
                    ? (instance.fixedRows ? `\u2194${instance.fixedCols} \u2195${instance.fixedRows}` : `\u2194${instance.fixedCols}`)
                    : (instance.fixedRows ? `\u2195${instance.fixedRows}` : ''),
                separator: { label: this.g.config.tabs.separator }
            };
            labelTemplate = labelTemplate.trim();
            if (!labelTemplate) {
                return labelType === "title" /* TerminalLabelType.Title */ ? (instance.processName || '') : '';
            }
            if (!reset && instance.staticTitle && labelType === "title" /* TerminalLabelType.Title */) {
                return instance.staticTitle.replace(/[\n\r\t]/g, '') || templateProperties.process?.replace(/[\n\r\t]/g, '') || '';
            }
            const detection = instance.capabilities.has(0 /* TerminalCapability.CwdDetection */) || instance.capabilities.has(1 /* TerminalCapability.NaiveCwdDetection */);
            const folders = this.j.getWorkspace().folders;
            const multiRootWorkspace = folders.length > 1;
            // Only set cwdFolder if detection is on
            if (templateProperties.cwd && detection && (!instance.shellLaunchConfig.isFeatureTerminal || labelType === "title" /* TerminalLabelType.Title */)) {
                const cwdUri = uri_1.URI.from({
                    scheme: instance.workspaceFolder?.uri.scheme || network_1.Schemas.file,
                    path: instance.cwd ? path.$0d(instance.cwd) : undefined
                });
                // Multi-root workspaces always show cwdFolder to disambiguate them, otherwise only show
                // when it differs from the workspace folder in which it was launched from
                let showCwd = false;
                if (multiRootWorkspace) {
                    showCwd = true;
                }
                else if (instance.workspaceFolder?.uri) {
                    const caseSensitive = this.h.hasCapability(instance.workspaceFolder.uri, 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */);
                    showCwd = cwdUri.fsPath.localeCompare(instance.workspaceFolder.uri.fsPath, undefined, { sensitivity: caseSensitive ? 'case' : 'base' }) !== 0;
                }
                if (showCwd) {
                    templateProperties.cwdFolder = path.$ae(templateProperties.cwd);
                }
            }
            // Remove special characters that could mess with rendering
            const label = (0, labels_1.$jA)(labelTemplate, templateProperties).replace(/[\n\r\t]/g, '').trim();
            return label === '' && labelType === "title" /* TerminalLabelType.Title */ ? (instance.processName || '') : label;
        }
    };
    exports.$_Vb = $_Vb;
    exports.$_Vb = $_Vb = __decorate([
        __param(1, files_1.$6j),
        __param(2, workspace_1.$Kh)
    ], $_Vb);
    function $aWb(exitCodeOrError, shellLaunchConfig, processState, initialCwd) {
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
                        message = nls.localize(28, null, commandLine, code);
                    }
                    else {
                        message = nls.localize(29, null, code);
                    }
                }
                else {
                    if (commandLine) {
                        message = nls.localize(30, null, commandLine, code);
                    }
                    else {
                        message = nls.localize(31, null, code);
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
                message = nls.localize(32, null, innerMessage);
                break;
            }
        }
        return { code, message };
    }
    exports.$aWb = $aWb;
});
//# sourceMappingURL=terminalInstance.js.map