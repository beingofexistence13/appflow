/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/browser/dom", "vs/base/browser/browser", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/base/common/platform", "vs/workbench/common/editor", "vs/workbench/browser/parts/sidebar/sidebarPart", "vs/workbench/browser/parts/panel/panelPart", "vs/workbench/services/layout/browser/layoutService", "vs/platform/workspace/common/workspace", "vs/platform/storage/common/storage", "vs/platform/configuration/common/configuration", "vs/workbench/services/title/common/titleService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/window/common/window", "vs/workbench/services/host/browser/host", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/browser/ui/grid/grid", "vs/workbench/services/statusbar/browser/statusbar", "vs/platform/files/common/files", "vs/editor/browser/editorBrowser", "vs/base/common/arrays", "vs/base/common/types", "vs/platform/notification/common/notification", "vs/platform/theme/common/themeService", "vs/workbench/common/theme", "vs/base/common/uri", "vs/workbench/common/views", "vs/workbench/common/editor/diffEditorInput", "vs/base/common/performance", "vs/workbench/services/extensions/common/extensions", "vs/platform/log/common/log", "vs/base/common/async", "vs/workbench/services/banner/browser/bannerService", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/browser/parts/auxiliarybar/auxiliaryBarPart", "vs/platform/telemetry/common/telemetry"], function (require, exports, lifecycle_1, event_1, dom_1, browser_1, workingCopyBackup_1, platform_1, editor_1, sidebarPart_1, panelPart_1, layoutService_1, workspace_1, storage_1, configuration_1, titleService_1, lifecycle_2, window_1, host_1, environmentService_1, editorService_1, editorGroupsService_1, grid_1, statusbar_1, files_1, editorBrowser_1, arrays_1, types_1, notification_1, themeService_1, theme_1, uri_1, views_1, diffEditorInput_1, performance_1, extensions_1, log_1, async_1, bannerService_1, panecomposite_1, auxiliaryBarPart_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$f2b = void 0;
    var LayoutClasses;
    (function (LayoutClasses) {
        LayoutClasses["SIDEBAR_HIDDEN"] = "nosidebar";
        LayoutClasses["EDITOR_HIDDEN"] = "noeditorarea";
        LayoutClasses["PANEL_HIDDEN"] = "nopanel";
        LayoutClasses["AUXILIARYBAR_HIDDEN"] = "noauxiliarybar";
        LayoutClasses["STATUSBAR_HIDDEN"] = "nostatusbar";
        LayoutClasses["FULLSCREEN"] = "fullscreen";
        LayoutClasses["MAXIMIZED"] = "maximized";
        LayoutClasses["WINDOW_BORDER"] = "border";
    })(LayoutClasses || (LayoutClasses = {}));
    class $f2b extends lifecycle_1.$kc {
        get dimension() { return this.r; }
        get offset() {
            let top = 0;
            let quickPickTop = 0;
            if (this.isVisible("workbench.parts.banner" /* Parts.BANNER_PART */)) {
                top = this.Ab("workbench.parts.banner" /* Parts.BANNER_PART */).maximumHeight;
                quickPickTop = top;
            }
            if (this.isVisible("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */)) {
                top += this.Ab("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */).maximumHeight;
                quickPickTop = top;
            }
            // If the command center is visible then the quickinput should go over the title bar and the banner
            if (this.R.isCommandCenterVisible) {
                quickPickTop = 6;
            }
            return { top, quickPickTop };
        }
        constructor(eb) {
            super();
            this.eb = eb;
            //#region Events
            this.a = this.B(new event_1.$fd());
            this.onDidChangeZenMode = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidChangeFullscreen = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onDidChangeCenteredLayout = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onDidChangePanelAlignment = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onDidChangeWindowMaximized = this.g.event;
            this.h = this.B(new event_1.$fd());
            this.onDidChangePanelPosition = this.h.event;
            this.j = this.B(new event_1.$fd());
            this.onDidChangePartVisibility = this.j.event;
            this.m = this.B(new event_1.$fd());
            this.onDidChangeNotificationsVisibility = this.m.event;
            this.n = this.B(new event_1.$fd());
            this.onDidLayout = this.n.event;
            //#endregion
            //#region Properties
            this.hasContainer = true;
            this.container = document.createElement('div');
            //#endregion
            this.s = new Map();
            this.t = false;
            this.db = false;
            this.tb = false;
            this.vb = new async_1.$2g();
            this.wb = this.vb.p;
            this.xb = new async_1.$2g();
            this.whenRestored = this.xb.p;
            this.yb = false;
        }
        fb(accessor) {
            // Services
            this.I = accessor.get(environmentService_1.$LT);
            this.L = accessor.get(configuration_1.$8h);
            this.N = accessor.get(host_1.$VT);
            this.U = accessor.get(workspace_1.$Kh);
            this.M = accessor.get(storage_1.$Vo);
            this.W = accessor.get(workingCopyBackup_1.$EA);
            this.Y = accessor.get(themeService_1.$gv);
            this.J = accessor.get(extensions_1.$MF);
            this.$ = accessor.get(log_1.$5i);
            this.ab = accessor.get(telemetry_1.$9k);
            // Parts
            this.O = accessor.get(editorService_1.$9C);
            this.P = accessor.get(editorGroupsService_1.$5C);
            this.Q = accessor.get(panecomposite_1.$Yeb);
            this.S = accessor.get(views_1.$_E);
            this.R = accessor.get(titleService_1.$ZRb);
            this.X = accessor.get(notification_1.$Yu);
            this.Z = accessor.get(statusbar_1.$6$);
            accessor.get(bannerService_1.$_xb);
            // Listeners
            this.gb();
            // State
            this.ob(accessor.get(lifecycle_2.$7y), accessor.get(files_1.$6j));
        }
        gb() {
            // Restore editor if hidden
            const showEditorIfHidden = () => {
                if (!this.isVisible("workbench.parts.editor" /* Parts.EDITOR_PART */)) {
                    this.toggleMaximizedPanel();
                }
            };
            // Wait to register these listeners after the editor group service
            // is ready to avoid conflicts on startup
            this.P.whenRestored.then(() => {
                // Restore editor part on any editor change
                this.B(this.O.onDidVisibleEditorsChange(showEditorIfHidden));
                this.B(this.P.onDidActivateGroup(showEditorIfHidden));
                // Revalidate center layout when active editor changes: diff editor quits centered mode.
                this.B(this.O.onDidActiveEditorChange(() => this.centerEditorLayout(this.cb.getRuntimeValue(LayoutStateKeys.EDITOR_CENTERED))));
            });
            // Configuration changes
            this.B(this.L.onDidChangeConfiguration((e) => {
                if ([
                    LegacyWorkbenchLayoutSettings.ACTIVITYBAR_VISIBLE,
                    LegacyWorkbenchLayoutSettings.SIDEBAR_POSITION,
                    LegacyWorkbenchLayoutSettings.STATUSBAR_VISIBLE,
                    'window.menuBarVisibility',
                    'window.titleBarStyle',
                ].some(setting => e.affectsConfiguration(setting))) {
                    this.kb();
                }
            }));
            // Title Menu changes
            this.B(this.R.onDidChangeCommandCenterVisibility(() => this.kb()));
            // Fullscreen changes
            this.B((0, browser_1.$4N)(() => this.ib()));
            // Group changes
            this.B(this.P.onDidAddGroup(() => this.centerEditorLayout(this.cb.getRuntimeValue(LayoutStateKeys.EDITOR_CENTERED))));
            this.B(this.P.onDidRemoveGroup(() => this.centerEditorLayout(this.cb.getRuntimeValue(LayoutStateKeys.EDITOR_CENTERED))));
            // Prevent workbench from scrolling #55456
            this.B((0, dom_1.$nO)(this.container, dom_1.$3O.SCROLL, () => this.container.scrollTop = 0));
            // Menubar visibility changes
            if ((platform_1.$i || platform_1.$k || platform_1.$o) && (0, window_1.$UD)(this.L) === 'custom') {
                this.B(this.R.onMenubarVisibilityChange(visible => this.hb(visible)));
            }
            // Theme changes
            this.B(this.Y.onDidColorThemeChange(() => this.nb()));
            // Window focus changes
            this.B(this.N.onDidChangeFocus(e => this.jb(e)));
            // WCO changes
            if (platform_1.$o && typeof navigator.windowControlsOverlay === 'object') {
                this.B((0, dom_1.$nO)(navigator.windowControlsOverlay, 'geometrychange', () => this.Pb()));
            }
        }
        hb(visible) {
            if (visible !== this.bb.runtime.menuBar.toggled) {
                this.bb.runtime.menuBar.toggled = visible;
                const menuBarVisibility = (0, window_1.$TD)(this.L);
                // The menu bar toggles the title bar in web because it does not need to be shown for window controls only
                if (platform_1.$o && menuBarVisibility === 'toggle') {
                    this.u.setViewVisible(this.w, this.Bb());
                }
                // The menu bar toggles the title bar in full screen for toggle and classic settings
                else if (this.bb.runtime.fullscreen && (menuBarVisibility === 'toggle' || menuBarVisibility === 'classic')) {
                    this.u.setViewVisible(this.w, this.Bb());
                }
                // Move layout call to any time the menubar
                // is toggled to update consumers of offset
                // see issue #115267
                this.n.fire(this.r);
            }
        }
        ib() {
            this.bb.runtime.fullscreen = (0, browser_1.$3N)();
            // Apply as CSS class
            if (this.bb.runtime.fullscreen) {
                this.container.classList.add(LayoutClasses.FULLSCREEN);
            }
            else {
                this.container.classList.remove(LayoutClasses.FULLSCREEN);
                const zenModeExitInfo = this.cb.getRuntimeValue(LayoutStateKeys.ZEN_MODE_EXIT_INFO);
                const zenModeActive = this.cb.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE);
                if (zenModeExitInfo.transitionedToFullScreen && zenModeActive) {
                    this.toggleZenMode();
                }
            }
            // Change edge snapping accordingly
            this.u.edgeSnapping = this.bb.runtime.fullscreen;
            // Changing fullscreen state of the window has an impact
            // on custom title bar visibility, so we need to update
            if ((0, window_1.$UD)(this.L) === 'custom') {
                // Propagate to grid
                this.u.setViewVisible(this.w, this.Bb());
                this.mb(true);
            }
            this.b.fire(this.bb.runtime.fullscreen);
        }
        jb(hasFocus) {
            if (this.bb.runtime.hasFocus === hasFocus) {
                return;
            }
            this.bb.runtime.hasFocus = hasFocus;
            this.mb();
        }
        kb(skipLayout) {
            // Menubar visibility
            this.updateMenubarVisibility(!!skipLayout);
            // Centered Layout
            this.P.whenRestored.then(() => {
                this.centerEditorLayout(this.cb.getRuntimeValue(LayoutStateKeys.EDITOR_CENTERED), skipLayout);
            });
        }
        lb(position) {
            const activityBar = this.Ab("workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */);
            const sideBar = this.Ab("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
            const auxiliaryBar = this.Ab("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
            const newPositionValue = (position === 0 /* Position.LEFT */) ? 'left' : 'right';
            const oldPositionValue = (position === 1 /* Position.RIGHT */) ? 'left' : 'right';
            const panelAlignment = this.getPanelAlignment();
            const panelPosition = this.getPanelPosition();
            this.cb.setRuntimeValue(LayoutStateKeys.SIDEBAR_POSITON, position);
            // Adjust CSS
            const activityBarContainer = (0, types_1.$uf)(activityBar.getContainer());
            const sideBarContainer = (0, types_1.$uf)(sideBar.getContainer());
            const auxiliaryBarContainer = (0, types_1.$uf)(auxiliaryBar.getContainer());
            activityBarContainer.classList.remove(oldPositionValue);
            sideBarContainer.classList.remove(oldPositionValue);
            activityBarContainer.classList.add(newPositionValue);
            sideBarContainer.classList.add(newPositionValue);
            // Auxiliary Bar has opposite values
            auxiliaryBarContainer.classList.remove(newPositionValue);
            auxiliaryBarContainer.classList.add(oldPositionValue);
            // Update Styles
            activityBar.updateStyles();
            sideBar.updateStyles();
            auxiliaryBar.updateStyles();
            // Move activity bar and side bars
            this.Lb(position, panelAlignment, panelPosition);
        }
        mb(skipLayout = false) {
            if (platform_1.$o ||
                platform_1.$i || // not working well with zooming and window control overlays
                (0, window_1.$UD)(this.L) !== 'custom') {
                return;
            }
            const theme = this.Y.getColorTheme();
            const activeBorder = theme.getColor(theme_1.$fbb);
            const inactiveBorder = theme.getColor(theme_1.$gbb);
            let windowBorder = false;
            if (!this.bb.runtime.fullscreen && !this.bb.runtime.maximized && (activeBorder || inactiveBorder)) {
                windowBorder = true;
                // If the inactive color is missing, fallback to the active one
                const borderColor = this.bb.runtime.hasFocus ? activeBorder : inactiveBorder ?? activeBorder;
                this.container.style.setProperty('--window-border-color', borderColor?.toString() ?? 'transparent');
            }
            if (windowBorder === this.bb.runtime.windowBorder) {
                return;
            }
            this.bb.runtime.windowBorder = windowBorder;
            this.container.classList.toggle(LayoutClasses.WINDOW_BORDER, windowBorder);
            if (!skipLayout) {
                this.layout();
            }
        }
        nb() {
            this.mb();
        }
        ob(lifecycleService, fileService) {
            this.cb = new LayoutStateModel(this.M, this.L, this.U, this.eb);
            this.cb.load();
            // Both editor and panel should not be hidden on startup
            if (this.cb.getRuntimeValue(LayoutStateKeys.PANEL_HIDDEN) && this.cb.getRuntimeValue(LayoutStateKeys.EDITOR_HIDDEN)) {
                this.cb.setRuntimeValue(LayoutStateKeys.EDITOR_HIDDEN, false);
            }
            this.cb.onDidChangeState(change => {
                if (change.key === LayoutStateKeys.ACTIVITYBAR_HIDDEN) {
                    this.Gb(change.value);
                }
                if (change.key === LayoutStateKeys.STATUSBAR_HIDDEN) {
                    this.Db(change.value);
                }
                if (change.key === LayoutStateKeys.SIDEBAR_POSITON) {
                    this.lb(change.value);
                }
                if (change.key === LayoutStateKeys.PANEL_POSITION) {
                    this.setPanelPosition(change.value);
                }
                if (change.key === LayoutStateKeys.PANEL_ALIGNMENT) {
                    this.setPanelAlignment(change.value);
                }
                this.kb();
            });
            // Layout Initialization State
            const initialEditorsState = this.ub();
            if (initialEditorsState) {
                this.$.info('Initial editor state', initialEditorsState);
            }
            const initialLayoutState = {
                layout: {
                    editors: initialEditorsState?.layout
                },
                editor: {
                    restoreEditors: this.qb(this.U, initialEditorsState),
                    editorsToOpen: this.sb(fileService, initialEditorsState),
                },
                views: {
                    defaults: this.pb(this.I, this.M),
                    containerToRestore: {}
                }
            };
            // Layout Runtime State
            const layoutRuntimeState = {
                fullscreen: (0, browser_1.$3N)(),
                hasFocus: this.N.hasFocus,
                maximized: false,
                windowBorder: false,
                menuBar: {
                    toggled: false,
                },
                zenMode: {
                    transitionDisposables: new lifecycle_1.$jc(),
                }
            };
            this.bb = {
                initialization: initialLayoutState,
                runtime: layoutRuntimeState,
            };
            // Sidebar View Container To Restore
            if (this.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */)) {
                // Only restore last viewlet if window was reloaded or we are in development mode
                let viewContainerToRestore;
                if (!this.I.isBuilt || lifecycleService.startupKind === 3 /* StartupKind.ReloadedWindow */ || platform_1.$o) {
                    viewContainerToRestore = this.M.get(sidebarPart_1.$0xb.activeViewletSettingsKey, 1 /* StorageScope.WORKSPACE */, this.S.getDefaultViewContainer(0 /* ViewContainerLocation.Sidebar */)?.id);
                }
                else {
                    viewContainerToRestore = this.S.getDefaultViewContainer(0 /* ViewContainerLocation.Sidebar */)?.id;
                }
                if (viewContainerToRestore) {
                    this.bb.initialization.views.containerToRestore.sideBar = viewContainerToRestore;
                }
                else {
                    this.cb.setRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN, true);
                }
            }
            // Panel View Container To Restore
            if (this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */)) {
                const viewContainerToRestore = this.M.get(panelPart_1.$7xb.activePanelSettingsKey, 1 /* StorageScope.WORKSPACE */, this.S.getDefaultViewContainer(1 /* ViewContainerLocation.Panel */)?.id);
                if (viewContainerToRestore) {
                    this.bb.initialization.views.containerToRestore.panel = viewContainerToRestore;
                }
                else {
                    this.cb.setRuntimeValue(LayoutStateKeys.PANEL_HIDDEN, true);
                }
            }
            // Auxiliary Panel to restore
            if (this.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */)) {
                const viewContainerToRestore = this.M.get(auxiliaryBarPart_1.$8xb.activePanelSettingsKey, 1 /* StorageScope.WORKSPACE */, this.S.getDefaultViewContainer(2 /* ViewContainerLocation.AuxiliaryBar */)?.id);
                if (viewContainerToRestore) {
                    this.bb.initialization.views.containerToRestore.auxiliaryBar = viewContainerToRestore;
                }
                else {
                    this.cb.setRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN, true);
                }
            }
            // Window border
            this.mb(true);
        }
        pb(environmentService, storageService) {
            const defaultLayout = environmentService.options?.defaultLayout;
            if (!defaultLayout) {
                return undefined;
            }
            if (!defaultLayout.force && !storageService.isNew(1 /* StorageScope.WORKSPACE */)) {
                return undefined;
            }
            const { views } = defaultLayout;
            if (views?.length) {
                return views.map(view => view.id);
            }
            return undefined;
        }
        qb(contextService, initialEditorsState) {
            // Restore editors based on a set of rules:
            // - never when running on temporary workspace
            // - not when we have files to open, unless:
            // - always when `window.restoreWindows: preserve`
            if ((0, workspace_1.$3h)(contextService.getWorkspace())) {
                return false;
            }
            const forceRestoreEditors = this.L.getValue('window.restoreWindows') === 'preserve';
            return !!forceRestoreEditors || initialEditorsState === undefined;
        }
        rb() {
            return this.bb.initialization.editor.restoreEditors;
        }
        async sb(fileService, initialEditorsState) {
            if (initialEditorsState) {
                // Merge editor (single)
                const filesToMerge = (0, arrays_1.$Fb)(await (0, editor_1.$4E)(initialEditorsState.filesToMerge, fileService, this.$));
                if (filesToMerge.length === 4 && (0, editor_1.$NE)(filesToMerge[0]) && (0, editor_1.$NE)(filesToMerge[1]) && (0, editor_1.$NE)(filesToMerge[2]) && (0, editor_1.$NE)(filesToMerge[3])) {
                    return [{
                            editor: {
                                input1: { resource: filesToMerge[0].resource },
                                input2: { resource: filesToMerge[1].resource },
                                base: { resource: filesToMerge[2].resource },
                                result: { resource: filesToMerge[3].resource },
                                options: { pinned: true }
                            }
                        }];
                }
                // Diff editor (single)
                const filesToDiff = (0, arrays_1.$Fb)(await (0, editor_1.$4E)(initialEditorsState.filesToDiff, fileService, this.$));
                if (filesToDiff.length === 2) {
                    return [{
                            editor: {
                                original: { resource: filesToDiff[0].resource },
                                modified: { resource: filesToDiff[1].resource },
                                options: { pinned: true }
                            }
                        }];
                }
                // Normal editor (multiple)
                const filesToOpenOrCreate = [];
                const resolvedFilesToOpenOrCreate = await (0, editor_1.$4E)(initialEditorsState.filesToOpenOrCreate, fileService, this.$);
                for (let i = 0; i < resolvedFilesToOpenOrCreate.length; i++) {
                    const resolvedFileToOpenOrCreate = resolvedFilesToOpenOrCreate[i];
                    if (resolvedFileToOpenOrCreate) {
                        filesToOpenOrCreate.push({
                            editor: resolvedFileToOpenOrCreate,
                            viewColumn: initialEditorsState.filesToOpenOrCreate?.[i].viewColumn // take over `viewColumn` from initial state
                        });
                    }
                }
                return filesToOpenOrCreate;
            }
            // Empty workbench configured to open untitled file if empty
            else if (this.U.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ && this.L.getValue('workbench.startupEditor') === 'newUntitledFile') {
                if (this.P.hasRestorableState) {
                    return []; // do not open any empty untitled file if we restored groups/editors from previous session
                }
                const hasBackups = await this.W.hasBackups();
                if (hasBackups) {
                    return []; // do not open any empty untitled file if we have backups to restore
                }
                return [{
                        editor: { resource: undefined } // open empty untitled file
                    }];
            }
            return [];
        }
        get openedDefaultEditors() { return this.tb; }
        ub() {
            // Check for editors / editor layout from `defaultLayout` options first
            const defaultLayout = this.I.options?.defaultLayout;
            if ((defaultLayout?.editors?.length || defaultLayout?.layout?.editors) && (defaultLayout.force || this.M.isNew(1 /* StorageScope.WORKSPACE */))) {
                this.tb = true;
                return {
                    layout: defaultLayout.layout?.editors,
                    filesToOpenOrCreate: defaultLayout?.editors?.map(editor => {
                        return {
                            viewColumn: editor.viewColumn,
                            fileUri: uri_1.URI.revive(editor.uri),
                            openOnlyIfExists: editor.openOnlyIfExists,
                            options: editor.options
                        };
                    })
                };
            }
            // Then check for files to open, create or diff/merge from main side
            const { filesToOpenOrCreate, filesToDiff, filesToMerge } = this.I;
            if (filesToOpenOrCreate || filesToDiff || filesToMerge) {
                return { filesToOpenOrCreate, filesToDiff, filesToMerge };
            }
            return undefined;
        }
        isRestored() {
            return this.yb;
        }
        zb() {
            // distinguish long running restore operations that
            // are required for the layout to be ready from those
            // that are needed to signal restoring is done
            const layoutReadyPromises = [];
            const layoutRestoredPromises = [];
            // Restore editors
            layoutReadyPromises.push((async () => {
                (0, performance_1.mark)('code/willRestoreEditors');
                // first ensure the editor part is ready
                await this.P.whenReady;
                (0, performance_1.mark)('code/restoreEditors/editorGroupsReady');
                // apply editor layout if any
                if (this.bb.initialization.layout?.editors) {
                    this.P.applyLayout(this.bb.initialization.layout.editors);
                }
                // then see for editors to open as instructed
                // it is important that we trigger this from
                // the overall restore flow to reduce possible
                // flicker on startup: we want any editor to
                // open to get a chance to open first before
                // signaling that layout is restored, but we do
                // not need to await the editors from having
                // fully loaded.
                const editors = await this.bb.initialization.editor.editorsToOpen;
                (0, performance_1.mark)('code/restoreEditors/editorsToOpenResolved');
                let openEditorsPromise = undefined;
                if (editors.length) {
                    // we have to map editors to their groups as instructed
                    // by the input. this is important to ensure that we open
                    // the editors in the groups they belong to.
                    const editorGroupsInVisualOrder = this.P.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */);
                    const mapEditorsToGroup = new Map();
                    for (const editor of editors) {
                        const group = editorGroupsInVisualOrder[(editor.viewColumn ?? 1) - 1]; // viewColumn is index+1 based
                        let editorsByGroup = mapEditorsToGroup.get(group.id);
                        if (!editorsByGroup) {
                            editorsByGroup = new Set();
                            mapEditorsToGroup.set(group.id, editorsByGroup);
                        }
                        editorsByGroup.add(editor.editor);
                    }
                    openEditorsPromise = Promise.all(Array.from(mapEditorsToGroup).map(async ([groupId, editors]) => {
                        try {
                            await this.O.openEditors(Array.from(editors), groupId, { validateTrust: true });
                        }
                        catch (error) {
                            this.$.error(error);
                        }
                    }));
                }
                // do not block the overall layout ready flow from potentially
                // slow editors to resolve on startup
                layoutRestoredPromises.push(Promise.all([
                    openEditorsPromise?.finally(() => (0, performance_1.mark)('code/restoreEditors/editorsOpened')),
                    this.P.whenRestored.finally(() => (0, performance_1.mark)('code/restoreEditors/editorGroupsRestored'))
                ]).finally(() => {
                    // the `code/didRestoreEditors` perf mark is specifically
                    // for when visible editors have resolved, so we only mark
                    // if when editor group service has restored.
                    (0, performance_1.mark)('code/didRestoreEditors');
                }));
            })());
            // Restore default views (only when `IDefaultLayout` is provided)
            const restoreDefaultViewsPromise = (async () => {
                if (this.bb.initialization.views.defaults?.length) {
                    (0, performance_1.mark)('code/willOpenDefaultViews');
                    const locationsRestored = [];
                    const tryOpenView = (view) => {
                        const location = this.S.getViewLocationById(view.id);
                        if (location !== null) {
                            const container = this.S.getViewContainerByViewId(view.id);
                            if (container) {
                                if (view.order >= (locationsRestored?.[location]?.order ?? 0)) {
                                    locationsRestored[location] = { id: container.id, order: view.order };
                                }
                                const containerModel = this.S.getViewContainerModel(container);
                                containerModel.setCollapsed(view.id, false);
                                containerModel.setVisible(view.id, true);
                                return true;
                            }
                        }
                        return false;
                    };
                    const defaultViews = [...this.bb.initialization.views.defaults].reverse().map((v, index) => ({ id: v, order: index }));
                    let i = defaultViews.length;
                    while (i) {
                        i--;
                        if (tryOpenView(defaultViews[i])) {
                            defaultViews.splice(i, 1);
                        }
                    }
                    // If we still have views left over, wait until all extensions have been registered and try again
                    if (defaultViews.length) {
                        await this.J.whenInstalledExtensionsRegistered();
                        let i = defaultViews.length;
                        while (i) {
                            i--;
                            if (tryOpenView(defaultViews[i])) {
                                defaultViews.splice(i, 1);
                            }
                        }
                    }
                    // If we opened a view in the sidebar, stop any restore there
                    if (locationsRestored[0 /* ViewContainerLocation.Sidebar */]) {
                        this.bb.initialization.views.containerToRestore.sideBar = locationsRestored[0 /* ViewContainerLocation.Sidebar */].id;
                    }
                    // If we opened a view in the panel, stop any restore there
                    if (locationsRestored[1 /* ViewContainerLocation.Panel */]) {
                        this.bb.initialization.views.containerToRestore.panel = locationsRestored[1 /* ViewContainerLocation.Panel */].id;
                    }
                    // If we opened a view in the auxiliary bar, stop any restore there
                    if (locationsRestored[2 /* ViewContainerLocation.AuxiliaryBar */]) {
                        this.bb.initialization.views.containerToRestore.auxiliaryBar = locationsRestored[2 /* ViewContainerLocation.AuxiliaryBar */].id;
                    }
                    (0, performance_1.mark)('code/didOpenDefaultViews');
                }
            })();
            layoutReadyPromises.push(restoreDefaultViewsPromise);
            // Restore Sidebar
            layoutReadyPromises.push((async () => {
                // Restoring views could mean that sidebar already
                // restored, as such we need to test again
                await restoreDefaultViewsPromise;
                if (!this.bb.initialization.views.containerToRestore.sideBar) {
                    return;
                }
                (0, performance_1.mark)('code/willRestoreViewlet');
                const viewlet = await this.Q.openPaneComposite(this.bb.initialization.views.containerToRestore.sideBar, 0 /* ViewContainerLocation.Sidebar */);
                if (!viewlet) {
                    await this.Q.openPaneComposite(this.S.getDefaultViewContainer(0 /* ViewContainerLocation.Sidebar */)?.id, 0 /* ViewContainerLocation.Sidebar */); // fallback to default viewlet as needed
                }
                (0, performance_1.mark)('code/didRestoreViewlet');
            })());
            // Restore Panel
            layoutReadyPromises.push((async () => {
                // Restoring views could mean that panel already
                // restored, as such we need to test again
                await restoreDefaultViewsPromise;
                if (!this.bb.initialization.views.containerToRestore.panel) {
                    return;
                }
                (0, performance_1.mark)('code/willRestorePanel');
                const panel = await this.Q.openPaneComposite(this.bb.initialization.views.containerToRestore.panel, 1 /* ViewContainerLocation.Panel */);
                if (!panel) {
                    await this.Q.openPaneComposite(this.S.getDefaultViewContainer(1 /* ViewContainerLocation.Panel */)?.id, 1 /* ViewContainerLocation.Panel */); // fallback to default panel as needed
                }
                (0, performance_1.mark)('code/didRestorePanel');
            })());
            // Restore Auxiliary Bar
            layoutReadyPromises.push((async () => {
                // Restoring views could mean that panel already
                // restored, as such we need to test again
                await restoreDefaultViewsPromise;
                if (!this.bb.initialization.views.containerToRestore.auxiliaryBar) {
                    return;
                }
                (0, performance_1.mark)('code/willRestoreAuxiliaryBar');
                const panel = await this.Q.openPaneComposite(this.bb.initialization.views.containerToRestore.auxiliaryBar, 2 /* ViewContainerLocation.AuxiliaryBar */);
                if (!panel) {
                    await this.Q.openPaneComposite(this.S.getDefaultViewContainer(2 /* ViewContainerLocation.AuxiliaryBar */)?.id, 2 /* ViewContainerLocation.AuxiliaryBar */); // fallback to default panel as needed
                }
                (0, performance_1.mark)('code/didRestoreAuxiliaryBar');
            })());
            // Restore Zen Mode
            const zenModeWasActive = this.cb.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE);
            const restoreZenMode = getZenModeConfiguration(this.L).restore;
            if (zenModeWasActive) {
                this.cb.setRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE, !restoreZenMode);
                this.toggleZenMode(false, true);
            }
            // Restore Editor Center Mode
            if (this.cb.getRuntimeValue(LayoutStateKeys.EDITOR_CENTERED)) {
                this.centerEditorLayout(true, true);
            }
            // Await for promises that we recorded to update
            // our ready and restored states properly.
            async_1.Promises.settled(layoutReadyPromises).finally(() => {
                this.vb.complete();
                async_1.Promises.settled(layoutRestoredPromises).finally(() => {
                    this.yb = true;
                    this.xb.complete();
                });
            });
        }
        registerPart(part) {
            this.s.set(part.getId(), part);
        }
        Ab(key) {
            const part = this.s.get(key);
            if (!part) {
                throw new Error(`Unknown part ${key}`);
            }
            return part;
        }
        registerNotifications(delegate) {
            this.B(delegate.onDidChangeNotificationsVisibility(visible => this.m.fire(visible)));
        }
        hasFocus(part) {
            const activeElement = document.activeElement;
            if (!activeElement) {
                return false;
            }
            const container = this.getContainer(part);
            return !!container && (0, dom_1.$PO)(activeElement, container);
        }
        focusPart(part) {
            switch (part) {
                case "workbench.parts.editor" /* Parts.EDITOR_PART */:
                    this.P.activeGroup.focus();
                    break;
                case "workbench.parts.panel" /* Parts.PANEL_PART */: {
                    const activePanel = this.Q.getActivePaneComposite(1 /* ViewContainerLocation.Panel */);
                    activePanel?.focus();
                    break;
                }
                case "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */: {
                    const activeViewlet = this.Q.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */);
                    activeViewlet?.focus();
                    break;
                }
                case "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */:
                    this.Ab("workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */).focus();
                    break;
                case "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */:
                    this.Z.focus();
                default: {
                    // Title Bar & Banner simply pass focus to container
                    const container = this.getContainer(part);
                    container?.focus();
                }
            }
        }
        getContainer(part) {
            if (!this.s.get(part)) {
                return undefined;
            }
            return this.Ab(part).getContainer();
        }
        isVisible(part) {
            if (this.t) {
                switch (part) {
                    case "workbench.parts.titlebar" /* Parts.TITLEBAR_PART */:
                        return this.u.isViewVisible(this.w);
                    case "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */:
                        return !this.cb.getRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN);
                    case "workbench.parts.panel" /* Parts.PANEL_PART */:
                        return !this.cb.getRuntimeValue(LayoutStateKeys.PANEL_HIDDEN);
                    case "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */:
                        return !this.cb.getRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN);
                    case "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */:
                        return !this.cb.getRuntimeValue(LayoutStateKeys.STATUSBAR_HIDDEN);
                    case "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */:
                        return !this.cb.getRuntimeValue(LayoutStateKeys.ACTIVITYBAR_HIDDEN);
                    case "workbench.parts.editor" /* Parts.EDITOR_PART */:
                        return !this.cb.getRuntimeValue(LayoutStateKeys.EDITOR_HIDDEN);
                    case "workbench.parts.banner" /* Parts.BANNER_PART */:
                        return this.u.isViewVisible(this.y);
                    default:
                        return false; // any other part cannot be hidden
                }
            }
            switch (part) {
                case "workbench.parts.titlebar" /* Parts.TITLEBAR_PART */:
                    return this.Bb();
                case "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */:
                    return !this.cb.getRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN);
                case "workbench.parts.panel" /* Parts.PANEL_PART */:
                    return !this.cb.getRuntimeValue(LayoutStateKeys.PANEL_HIDDEN);
                case "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */:
                    return !this.cb.getRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN);
                case "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */:
                    return !this.cb.getRuntimeValue(LayoutStateKeys.STATUSBAR_HIDDEN);
                case "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */:
                    return !this.cb.getRuntimeValue(LayoutStateKeys.ACTIVITYBAR_HIDDEN);
                case "workbench.parts.editor" /* Parts.EDITOR_PART */:
                    return !this.cb.getRuntimeValue(LayoutStateKeys.EDITOR_HIDDEN);
                default:
                    return false; // any other part cannot be hidden
            }
        }
        Bb() {
            // Using the native title bar, don't ever show the custom one
            if ((0, window_1.$UD)(this.L) === 'native') {
                return false;
            }
            // with the command center enabled, we should always show
            if (this.L.getValue('window.commandCenter')) {
                return true;
            }
            // macOS desktop does not need a title bar when full screen
            if (platform_1.$j && platform_1.$m) {
                return !this.bb.runtime.fullscreen;
            }
            // non-fullscreen native must show the title bar
            if (platform_1.$m && !this.bb.runtime.fullscreen) {
                return true;
            }
            // if WCO is visible, we have to show the title bar
            if ((0, browser_1.$aO)() && !this.bb.runtime.fullscreen) {
                return true;
            }
            // remaining behavior is based on menubar visibility
            switch ((0, window_1.$TD)(this.L)) {
                case 'classic':
                    return !this.bb.runtime.fullscreen || this.bb.runtime.menuBar.toggled;
                case 'compact':
                case 'hidden':
                    return false;
                case 'toggle':
                    return this.bb.runtime.menuBar.toggled;
                case 'visible':
                    return true;
                default:
                    return platform_1.$o ? false : !this.bb.runtime.fullscreen || this.bb.runtime.menuBar.toggled;
            }
        }
        Cb() {
            return platform_1.$o && !(0, browser_1.$aO)();
        }
        focus() {
            this.focusPart("workbench.parts.editor" /* Parts.EDITOR_PART */);
        }
        getDimension(part) {
            return this.Ab(part).dimension;
        }
        getMaximumEditorDimensions() {
            const panelPosition = this.getPanelPosition();
            const isColumn = panelPosition === 1 /* Position.RIGHT */ || panelPosition === 0 /* Position.LEFT */;
            const takenWidth = (this.isVisible("workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */) ? this.z.minimumWidth : 0) +
                (this.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */) ? this.C.minimumWidth : 0) +
                (this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */) && isColumn ? this.D.minimumWidth : 0) +
                (this.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */) ? this.F.minimumWidth : 0);
            const takenHeight = (this.isVisible("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */) ? this.w.minimumHeight : 0) +
                (this.isVisible("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */) ? this.H.minimumHeight : 0) +
                (this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */) && !isColumn ? this.D.minimumHeight : 0);
            const availableWidth = this.dimension.width - takenWidth;
            const availableHeight = this.dimension.height - takenHeight;
            return new dom_1.$BO(availableWidth, availableHeight);
        }
        toggleZenMode(skipLayout, restoring = false) {
            this.cb.setRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE, !this.cb.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE));
            this.bb.runtime.zenMode.transitionDisposables.clear();
            const setLineNumbers = (lineNumbers) => {
                const setEditorLineNumbers = (editor) => {
                    // To properly reset line numbers we need to read the configuration for each editor respecting it's uri.
                    if (!lineNumbers && (0, editorBrowser_1.$iV)(editor) && editor.hasModel()) {
                        const model = editor.getModel();
                        lineNumbers = this.L.getValue('editor.lineNumbers', { resource: model.uri, overrideIdentifier: model.getLanguageId() });
                    }
                    if (!lineNumbers) {
                        lineNumbers = this.L.getValue('editor.lineNumbers');
                    }
                    editor.updateOptions({ lineNumbers });
                };
                if (!lineNumbers) {
                    // Reset line numbers on all editors visible and non-visible
                    for (const editorControl of this.O.visibleTextEditorControls) {
                        setEditorLineNumbers(editorControl);
                    }
                }
                else {
                    for (const editorControl of this.O.visibleTextEditorControls) {
                        setEditorLineNumbers(editorControl);
                    }
                }
            };
            // Check if zen mode transitioned to full screen and if now we are out of zen mode
            // -> we need to go out of full screen (same goes for the centered editor layout)
            let toggleFullScreen = false;
            const config = getZenModeConfiguration(this.L);
            const zenModeExitInfo = this.cb.getRuntimeValue(LayoutStateKeys.ZEN_MODE_EXIT_INFO);
            // Zen Mode Active
            if (this.cb.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE)) {
                toggleFullScreen = !this.bb.runtime.fullscreen && config.fullScreen && !platform_1.$q;
                if (!restoring) {
                    zenModeExitInfo.transitionedToFullScreen = toggleFullScreen;
                    zenModeExitInfo.transitionedToCenteredEditorLayout = !this.isEditorLayoutCentered() && config.centerLayout;
                    zenModeExitInfo.handleNotificationsDoNotDisturbMode = !this.X.doNotDisturbMode;
                    zenModeExitInfo.wasVisible.sideBar = this.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
                    zenModeExitInfo.wasVisible.panel = this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */);
                    zenModeExitInfo.wasVisible.auxiliaryBar = this.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
                    this.cb.setRuntimeValue(LayoutStateKeys.ZEN_MODE_EXIT_INFO, zenModeExitInfo);
                }
                this.Mb(true, true);
                this.Ob(true, true);
                this.Jb(true, true);
                if (config.hideActivityBar) {
                    this.Gb(true, true);
                }
                if (config.hideStatusBar) {
                    this.Db(true, true);
                }
                if (config.hideLineNumbers) {
                    setLineNumbers('off');
                    this.bb.runtime.zenMode.transitionDisposables.add(this.O.onDidVisibleEditorsChange(() => setLineNumbers('off')));
                }
                if (config.hideTabs && this.P.partOptions.showTabs) {
                    this.bb.runtime.zenMode.transitionDisposables.add(this.P.enforcePartOptions({ showTabs: false }));
                }
                if (config.silentNotifications && zenModeExitInfo.handleNotificationsDoNotDisturbMode) {
                    this.X.doNotDisturbMode = true;
                }
                this.bb.runtime.zenMode.transitionDisposables.add(this.L.onDidChangeConfiguration(e => {
                    if (e.affectsConfiguration(WorkbenchLayoutSettings.ZEN_MODE_SILENT_NOTIFICATIONS)) {
                        const zenModeSilentNotifications = !!this.L.getValue(WorkbenchLayoutSettings.ZEN_MODE_SILENT_NOTIFICATIONS);
                        if (zenModeExitInfo.handleNotificationsDoNotDisturbMode) {
                            this.X.doNotDisturbMode = zenModeSilentNotifications;
                        }
                    }
                }));
                if (config.centerLayout) {
                    this.centerEditorLayout(true, true);
                }
            }
            // Zen Mode Inactive
            else {
                if (zenModeExitInfo.wasVisible.panel) {
                    this.Mb(false, true);
                }
                if (zenModeExitInfo.wasVisible.auxiliaryBar) {
                    this.Ob(false, true);
                }
                if (zenModeExitInfo.wasVisible.sideBar) {
                    this.Jb(false, true);
                }
                if (!this.cb.getRuntimeValue(LayoutStateKeys.ACTIVITYBAR_HIDDEN, true)) {
                    this.Gb(false, true);
                }
                if (!this.cb.getRuntimeValue(LayoutStateKeys.STATUSBAR_HIDDEN, true)) {
                    this.Db(false, true);
                }
                if (zenModeExitInfo.transitionedToCenteredEditorLayout) {
                    this.centerEditorLayout(false, true);
                }
                if (zenModeExitInfo.handleNotificationsDoNotDisturbMode) {
                    this.X.doNotDisturbMode = false;
                }
                setLineNumbers();
                this.focus();
                toggleFullScreen = zenModeExitInfo.transitionedToFullScreen && this.bb.runtime.fullscreen;
            }
            if (!skipLayout) {
                this.layout();
            }
            if (toggleFullScreen) {
                this.N.toggleFullScreen();
            }
            // Event
            this.a.fire(this.cb.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE));
        }
        Db(hidden, skipLayout) {
            this.cb.setRuntimeValue(LayoutStateKeys.STATUSBAR_HIDDEN, hidden);
            // Adjust CSS
            if (hidden) {
                this.container.classList.add(LayoutClasses.STATUSBAR_HIDDEN);
            }
            else {
                this.container.classList.remove(LayoutClasses.STATUSBAR_HIDDEN);
            }
            // Propagate to grid
            this.u.setViewVisible(this.H, !hidden);
        }
        Eb() {
            const titleBar = this.Ab("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */);
            const bannerPart = this.Ab("workbench.parts.banner" /* Parts.BANNER_PART */);
            const editorPart = this.Ab("workbench.parts.editor" /* Parts.EDITOR_PART */);
            const activityBar = this.Ab("workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */);
            const panelPart = this.Ab("workbench.parts.panel" /* Parts.PANEL_PART */);
            const auxiliaryBarPart = this.Ab("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
            const sideBar = this.Ab("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
            const statusBar = this.Ab("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */);
            // View references for all parts
            this.w = titleBar;
            this.y = bannerPart;
            this.C = sideBar;
            this.z = activityBar;
            this.G = editorPart;
            this.D = panelPart;
            this.F = auxiliaryBarPart;
            this.H = statusBar;
            const viewMap = {
                ["workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */]: this.z,
                ["workbench.parts.banner" /* Parts.BANNER_PART */]: this.y,
                ["workbench.parts.titlebar" /* Parts.TITLEBAR_PART */]: this.w,
                ["workbench.parts.editor" /* Parts.EDITOR_PART */]: this.G,
                ["workbench.parts.panel" /* Parts.PANEL_PART */]: this.D,
                ["workbench.parts.sidebar" /* Parts.SIDEBAR_PART */]: this.C,
                ["workbench.parts.statusbar" /* Parts.STATUSBAR_PART */]: this.H,
                ["workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */]: this.F
            };
            const fromJSON = ({ type }) => viewMap[type];
            const workbenchGrid = grid_1.$iR.deserialize(this.Sb(), { fromJSON }, { proportionalLayout: false });
            this.container.prepend(workbenchGrid.element);
            this.container.setAttribute('role', 'application');
            this.u = workbenchGrid;
            this.u.edgeSnapping = this.bb.runtime.fullscreen;
            for (const part of [titleBar, editorPart, activityBar, panelPart, sideBar, statusBar, auxiliaryBarPart, bannerPart]) {
                this.B(part.onDidVisibilityChange((visible) => {
                    if (part === sideBar) {
                        this.Jb(!visible, true);
                    }
                    else if (part === panelPart) {
                        this.Mb(!visible, true);
                    }
                    else if (part === auxiliaryBarPart) {
                        this.Ob(!visible, true);
                    }
                    else if (part === editorPart) {
                        this.Ib(!visible, true);
                    }
                    this.j.fire();
                    this.n.fire(this.r);
                }));
            }
            this.B(this.M.onWillSaveState(willSaveState => {
                if (willSaveState.reason === storage_1.WillSaveStateReason.SHUTDOWN) {
                    // Side Bar Size
                    const sideBarSize = this.cb.getRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN)
                        ? this.u.getViewCachedVisibleSize(this.C)
                        : this.u.getViewSize(this.C).width;
                    this.cb.setInitializationValue(LayoutStateKeys.SIDEBAR_SIZE, sideBarSize);
                    // Panel Size
                    const panelSize = this.cb.getRuntimeValue(LayoutStateKeys.PANEL_HIDDEN)
                        ? this.u.getViewCachedVisibleSize(this.D)
                        : (this.cb.getRuntimeValue(LayoutStateKeys.PANEL_POSITION) === 2 /* Position.BOTTOM */ ? this.u.getViewSize(this.D).height : this.u.getViewSize(this.D).width);
                    this.cb.setInitializationValue(LayoutStateKeys.PANEL_SIZE, panelSize);
                    // Auxiliary Bar Size
                    const auxiliaryBarSize = this.cb.getRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN)
                        ? this.u.getViewCachedVisibleSize(this.F)
                        : this.u.getViewSize(this.F).width;
                    this.cb.setInitializationValue(LayoutStateKeys.AUXILIARYBAR_SIZE, auxiliaryBarSize);
                    this.cb.save(true, true);
                }
            }));
        }
        Fb() {
            return (0, dom_1.$AO)(this.eb);
        }
        layout() {
            if (!this.db) {
                this.r = this.Fb();
                this.$.trace(`Layout#layout, height: ${this.r.height}, width: ${this.r.width}`);
                (0, dom_1.$EO)(this.container, 0, 0, 0, 0, 'relative');
                (0, dom_1.$DO)(this.container, this.r.width, this.r.height);
                // Layout the grid widget
                this.u.layout(this.r.width, this.r.height);
                this.t = true;
                // Emit as event
                this.n.fire(this.r);
            }
        }
        isEditorLayoutCentered() {
            return this.cb.getRuntimeValue(LayoutStateKeys.EDITOR_CENTERED);
        }
        centerEditorLayout(active, skipLayout) {
            this.cb.setRuntimeValue(LayoutStateKeys.EDITOR_CENTERED, active);
            const activeEditor = this.O.activeEditor;
            let isEditorComplex = false;
            if (activeEditor instanceof diffEditorInput_1.$3eb) {
                isEditorComplex = this.L.getValue('diffEditor.renderSideBySide');
            }
            else if (activeEditor?.hasCapability(256 /* EditorInputCapabilities.MultipleEditors */)) {
                isEditorComplex = true;
            }
            const isCenteredLayoutAutoResizing = this.L.getValue('workbench.editor.centeredLayoutAutoResize');
            if (isCenteredLayoutAutoResizing &&
                (this.P.groups.length > 1 || isEditorComplex)) {
                active = false; // disable centered layout for complex editors or when there is more than one group
            }
            if (this.P.isLayoutCentered() !== active) {
                this.P.centerLayout(active);
                if (!skipLayout) {
                    this.layout();
                }
            }
            this.c.fire(this.cb.getRuntimeValue(LayoutStateKeys.EDITOR_CENTERED));
        }
        resizePart(part, sizeChangeWidth, sizeChangeHeight) {
            const sizeChangePxWidth = Math.sign(sizeChangeWidth) * (0, dom_1.$iP)(Math.abs(sizeChangeWidth));
            const sizeChangePxHeight = Math.sign(sizeChangeHeight) * (0, dom_1.$iP)(Math.abs(sizeChangeHeight));
            let viewSize;
            switch (part) {
                case "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */:
                    viewSize = this.u.getViewSize(this.C);
                    this.u.resizeView(this.C, {
                        width: viewSize.width + sizeChangePxWidth,
                        height: viewSize.height
                    });
                    break;
                case "workbench.parts.panel" /* Parts.PANEL_PART */:
                    viewSize = this.u.getViewSize(this.D);
                    this.u.resizeView(this.D, {
                        width: viewSize.width + (this.getPanelPosition() !== 2 /* Position.BOTTOM */ ? sizeChangePxWidth : 0),
                        height: viewSize.height + (this.getPanelPosition() !== 2 /* Position.BOTTOM */ ? 0 : sizeChangePxHeight)
                    });
                    break;
                case "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */:
                    viewSize = this.u.getViewSize(this.F);
                    this.u.resizeView(this.F, {
                        width: viewSize.width + sizeChangePxWidth,
                        height: viewSize.height
                    });
                    break;
                case "workbench.parts.editor" /* Parts.EDITOR_PART */:
                    viewSize = this.u.getViewSize(this.G);
                    // Single Editor Group
                    if (this.P.count === 1) {
                        this.u.resizeView(this.G, {
                            width: viewSize.width + sizeChangePxWidth,
                            height: viewSize.height + sizeChangePxHeight
                        });
                    }
                    else {
                        const activeGroup = this.P.activeGroup;
                        const { width, height } = this.P.getSize(activeGroup);
                        this.P.setSize(activeGroup, { width: width + sizeChangePxWidth, height: height + sizeChangePxHeight });
                        // After resizing the editor group
                        // if it does not change in either direction
                        // try resizing the full editor part
                        const { width: newWidth, height: newHeight } = this.P.getSize(activeGroup);
                        if ((sizeChangePxHeight && height === newHeight) || (sizeChangePxWidth && width === newWidth)) {
                            this.u.resizeView(this.G, {
                                width: viewSize.width + (sizeChangePxWidth && width === newWidth ? sizeChangePxWidth : 0),
                                height: viewSize.height + (sizeChangePxHeight && height === newHeight ? sizeChangePxHeight : 0)
                            });
                        }
                    }
                    break;
                default:
                    return; // Cannot resize other parts
            }
        }
        Gb(hidden, skipLayout) {
            // Propagate to grid
            this.cb.setRuntimeValue(LayoutStateKeys.ACTIVITYBAR_HIDDEN, hidden);
            this.u.setViewVisible(this.z, !hidden);
        }
        Hb(hidden) {
            this.u.setViewVisible(this.y, !hidden);
        }
        Ib(hidden, skipLayout) {
            this.cb.setRuntimeValue(LayoutStateKeys.EDITOR_HIDDEN, hidden);
            // Adjust CSS
            if (hidden) {
                this.container.classList.add(LayoutClasses.EDITOR_HIDDEN);
            }
            else {
                this.container.classList.remove(LayoutClasses.EDITOR_HIDDEN);
            }
            // Propagate to grid
            this.u.setViewVisible(this.G, !hidden);
            // The editor and panel cannot be hidden at the same time
            if (hidden && !this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */)) {
                this.Mb(false, true);
            }
        }
        getLayoutClasses() {
            return (0, arrays_1.$Fb)([
                !this.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */) ? LayoutClasses.SIDEBAR_HIDDEN : undefined,
                !this.isVisible("workbench.parts.editor" /* Parts.EDITOR_PART */) ? LayoutClasses.EDITOR_HIDDEN : undefined,
                !this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */) ? LayoutClasses.PANEL_HIDDEN : undefined,
                !this.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */) ? LayoutClasses.AUXILIARYBAR_HIDDEN : undefined,
                !this.isVisible("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */) ? LayoutClasses.STATUSBAR_HIDDEN : undefined,
                this.bb.runtime.fullscreen ? LayoutClasses.FULLSCREEN : undefined
            ]);
        }
        Jb(hidden, skipLayout) {
            this.cb.setRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN, hidden);
            // Adjust CSS
            if (hidden) {
                this.container.classList.add(LayoutClasses.SIDEBAR_HIDDEN);
            }
            else {
                this.container.classList.remove(LayoutClasses.SIDEBAR_HIDDEN);
            }
            // If sidebar becomes hidden, also hide the current active Viewlet if any
            if (hidden && this.Q.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */)) {
                this.Q.hideActivePaneComposite(0 /* ViewContainerLocation.Sidebar */);
                // Pass Focus to Editor or Panel if Sidebar is now hidden
                const activePanel = this.Q.getActivePaneComposite(1 /* ViewContainerLocation.Panel */);
                if (this.hasFocus("workbench.parts.panel" /* Parts.PANEL_PART */) && activePanel) {
                    activePanel.focus();
                }
                else {
                    this.focus();
                }
            }
            // If sidebar becomes visible, show last active Viewlet or default viewlet
            else if (!hidden && !this.Q.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */)) {
                const viewletToOpen = this.Q.getLastActivePaneCompositeId(0 /* ViewContainerLocation.Sidebar */);
                if (viewletToOpen) {
                    const viewlet = this.Q.openPaneComposite(viewletToOpen, 0 /* ViewContainerLocation.Sidebar */, true);
                    if (!viewlet) {
                        this.Q.openPaneComposite(this.S.getDefaultViewContainer(0 /* ViewContainerLocation.Sidebar */)?.id, 0 /* ViewContainerLocation.Sidebar */, true);
                    }
                }
            }
            // Propagate to grid
            this.u.setViewVisible(this.C, !hidden);
        }
        Kb(id) {
            const viewContainer = this.S.getViewContainerById(id);
            if (!viewContainer) {
                return false;
            }
            const viewContainerModel = this.S.getViewContainerModel(viewContainer);
            if (!viewContainerModel) {
                return false;
            }
            return viewContainerModel.activeViewDescriptors.length >= 1;
        }
        Lb(sideBarPosition, panelAlignment, panelPosition) {
            // Move activity bar and side bars
            const sideBarSiblingToEditor = panelPosition !== 2 /* Position.BOTTOM */ || !(panelAlignment === 'center' || (sideBarPosition === 0 /* Position.LEFT */ && panelAlignment === 'right') || (sideBarPosition === 1 /* Position.RIGHT */ && panelAlignment === 'left'));
            const auxiliaryBarSiblingToEditor = panelPosition !== 2 /* Position.BOTTOM */ || !(panelAlignment === 'center' || (sideBarPosition === 1 /* Position.RIGHT */ && panelAlignment === 'right') || (sideBarPosition === 0 /* Position.LEFT */ && panelAlignment === 'left'));
            const preMovePanelWidth = !this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */) ? grid_1.Sizing.Invisible(this.u.getViewCachedVisibleSize(this.D) ?? this.D.minimumWidth) : this.u.getViewSize(this.D).width;
            const preMovePanelHeight = !this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */) ? grid_1.Sizing.Invisible(this.u.getViewCachedVisibleSize(this.D) ?? this.D.minimumHeight) : this.u.getViewSize(this.D).height;
            const preMoveSideBarSize = !this.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */) ? grid_1.Sizing.Invisible(this.u.getViewCachedVisibleSize(this.C) ?? this.C.minimumWidth) : this.u.getViewSize(this.C).width;
            const preMoveAuxiliaryBarSize = !this.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */) ? grid_1.Sizing.Invisible(this.u.getViewCachedVisibleSize(this.F) ?? this.F.minimumWidth) : this.u.getViewSize(this.F).width;
            if (sideBarPosition === 0 /* Position.LEFT */) {
                this.u.moveViewTo(this.z, [2, 0]);
                this.u.moveView(this.C, preMoveSideBarSize, sideBarSiblingToEditor ? this.G : this.z, sideBarSiblingToEditor ? 2 /* Direction.Left */ : 3 /* Direction.Right */);
                if (auxiliaryBarSiblingToEditor) {
                    this.u.moveView(this.F, preMoveAuxiliaryBarSize, this.G, 3 /* Direction.Right */);
                }
                else {
                    this.u.moveViewTo(this.F, [2, -1]);
                }
            }
            else {
                this.u.moveViewTo(this.z, [2, -1]);
                this.u.moveView(this.C, preMoveSideBarSize, sideBarSiblingToEditor ? this.G : this.z, sideBarSiblingToEditor ? 3 /* Direction.Right */ : 2 /* Direction.Left */);
                if (auxiliaryBarSiblingToEditor) {
                    this.u.moveView(this.F, preMoveAuxiliaryBarSize, this.G, 2 /* Direction.Left */);
                }
                else {
                    this.u.moveViewTo(this.F, [2, 0]);
                }
            }
            // We moved all the side parts based on the editor and ignored the panel
            // Now, we need to put the panel back in the right position when it is next to the editor
            if (panelPosition !== 2 /* Position.BOTTOM */) {
                this.u.moveView(this.D, preMovePanelWidth, this.G, panelPosition === 0 /* Position.LEFT */ ? 2 /* Direction.Left */ : 3 /* Direction.Right */);
                this.u.resizeView(this.D, {
                    height: preMovePanelHeight,
                    width: preMovePanelWidth
                });
            }
            // Moving views in the grid can cause them to re-distribute sizing unnecessarily
            // Resize visible parts to the width they were before the operation
            if (this.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */)) {
                this.u.resizeView(this.C, {
                    height: this.u.getViewSize(this.C).height,
                    width: preMoveSideBarSize
                });
            }
            if (this.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */)) {
                this.u.resizeView(this.F, {
                    height: this.u.getViewSize(this.F).height,
                    width: preMoveAuxiliaryBarSize
                });
            }
        }
        setPanelAlignment(alignment, skipLayout) {
            // Panel alignment only applies to a panel in the bottom position
            if (this.getPanelPosition() !== 2 /* Position.BOTTOM */) {
                this.setPanelPosition(2 /* Position.BOTTOM */);
            }
            // the workbench grid currently prevents us from supporting panel maximization with non-center panel alignment
            if (alignment !== 'center' && this.isPanelMaximized()) {
                this.toggleMaximizedPanel();
            }
            this.cb.setRuntimeValue(LayoutStateKeys.PANEL_ALIGNMENT, alignment);
            this.Lb(this.getSideBarPosition(), alignment, this.getPanelPosition());
            this.f.fire(alignment);
        }
        Mb(hidden, skipLayout) {
            // Return if not initialized fully #105480
            if (!this.u) {
                return;
            }
            const wasHidden = !this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */);
            this.cb.setRuntimeValue(LayoutStateKeys.PANEL_HIDDEN, hidden);
            const isPanelMaximized = this.isPanelMaximized();
            const panelOpensMaximized = this.Nb();
            // Adjust CSS
            if (hidden) {
                this.container.classList.add(LayoutClasses.PANEL_HIDDEN);
            }
            else {
                this.container.classList.remove(LayoutClasses.PANEL_HIDDEN);
            }
            // If panel part becomes hidden, also hide the current active panel if any
            let focusEditor = false;
            if (hidden && this.Q.getActivePaneComposite(1 /* ViewContainerLocation.Panel */)) {
                this.Q.hideActivePaneComposite(1 /* ViewContainerLocation.Panel */);
                focusEditor = platform_1.$q ? false : true; // Do not auto focus on ios #127832
            }
            // If panel part becomes visible, show last active panel or default panel
            else if (!hidden && !this.Q.getActivePaneComposite(1 /* ViewContainerLocation.Panel */)) {
                let panelToOpen = this.Q.getLastActivePaneCompositeId(1 /* ViewContainerLocation.Panel */);
                // verify that the panel we try to open has views before we default to it
                // otherwise fall back to any view that has views still refs #111463
                if (!panelToOpen || !this.Kb(panelToOpen)) {
                    panelToOpen = this.S
                        .getViewContainersByLocation(1 /* ViewContainerLocation.Panel */)
                        .find(viewContainer => this.Kb(viewContainer.id))?.id;
                }
                if (panelToOpen) {
                    const focus = !skipLayout;
                    this.Q.openPaneComposite(panelToOpen, 1 /* ViewContainerLocation.Panel */, focus);
                }
            }
            // If maximized and in process of hiding, unmaximize before hiding to allow caching of non-maximized size
            if (hidden && isPanelMaximized) {
                this.toggleMaximizedPanel();
            }
            // Don't proceed if we have already done this before
            if (wasHidden === hidden) {
                return;
            }
            // Propagate layout changes to grid
            this.u.setViewVisible(this.D, !hidden);
            // If in process of showing, toggle whether or not panel is maximized
            if (!hidden) {
                if (!skipLayout && isPanelMaximized !== panelOpensMaximized) {
                    this.toggleMaximizedPanel();
                }
            }
            else {
                // If in process of hiding, remember whether the panel is maximized or not
                this.cb.setRuntimeValue(LayoutStateKeys.PANEL_WAS_LAST_MAXIMIZED, isPanelMaximized);
            }
            if (focusEditor) {
                this.P.activeGroup.focus(); // Pass focus to editor group if panel part is now hidden
            }
        }
        toggleMaximizedPanel() {
            const size = this.u.getViewSize(this.D);
            const panelPosition = this.getPanelPosition();
            const isMaximized = this.isPanelMaximized();
            if (!isMaximized) {
                if (this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */)) {
                    if (panelPosition === 2 /* Position.BOTTOM */) {
                        this.cb.setRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_HEIGHT, size.height);
                    }
                    else {
                        this.cb.setRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_WIDTH, size.width);
                    }
                }
                this.Ib(true);
            }
            else {
                this.Ib(false);
                this.u.resizeView(this.D, {
                    width: panelPosition === 2 /* Position.BOTTOM */ ? size.width : this.cb.getRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_WIDTH),
                    height: panelPosition === 2 /* Position.BOTTOM */ ? this.cb.getRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_HEIGHT) : size.height
                });
            }
            this.cb.setRuntimeValue(LayoutStateKeys.PANEL_WAS_LAST_MAXIMIZED, !isMaximized);
        }
        /**
         * Returns whether or not the panel opens maximized
         */
        Nb() {
            // The workbench grid currently prevents us from supporting panel maximization with non-center panel alignment
            if (this.getPanelAlignment() !== 'center' && this.getPanelPosition() === 2 /* Position.BOTTOM */) {
                return false;
            }
            const panelOpensMaximized = (0, layoutService_1.$Peb)(this.L.getValue(WorkbenchLayoutSettings.PANEL_OPENS_MAXIMIZED));
            const panelLastIsMaximized = this.cb.getRuntimeValue(LayoutStateKeys.PANEL_WAS_LAST_MAXIMIZED);
            return panelOpensMaximized === 0 /* PanelOpensMaximizedOptions.ALWAYS */ || (panelOpensMaximized === 2 /* PanelOpensMaximizedOptions.REMEMBER_LAST */ && panelLastIsMaximized);
        }
        Ob(hidden, skipLayout) {
            this.cb.setRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN, hidden);
            // Adjust CSS
            if (hidden) {
                this.container.classList.add(LayoutClasses.AUXILIARYBAR_HIDDEN);
            }
            else {
                this.container.classList.remove(LayoutClasses.AUXILIARYBAR_HIDDEN);
            }
            // If auxiliary bar becomes hidden, also hide the current active pane composite if any
            if (hidden && this.Q.getActivePaneComposite(2 /* ViewContainerLocation.AuxiliaryBar */)) {
                this.Q.hideActivePaneComposite(2 /* ViewContainerLocation.AuxiliaryBar */);
                // Pass Focus to Editor or Panel if Auxiliary Bar is now hidden
                const activePanel = this.Q.getActivePaneComposite(1 /* ViewContainerLocation.Panel */);
                if (this.hasFocus("workbench.parts.panel" /* Parts.PANEL_PART */) && activePanel) {
                    activePanel.focus();
                }
                else {
                    this.focus();
                }
            }
            // If auxiliary bar becomes visible, show last active pane composite or default pane composite
            else if (!hidden && !this.Q.getActivePaneComposite(2 /* ViewContainerLocation.AuxiliaryBar */)) {
                let panelToOpen = this.Q.getLastActivePaneCompositeId(2 /* ViewContainerLocation.AuxiliaryBar */);
                // verify that the panel we try to open has views before we default to it
                // otherwise fall back to any view that has views still refs #111463
                if (!panelToOpen || !this.Kb(panelToOpen)) {
                    panelToOpen = this.S
                        .getViewContainersByLocation(2 /* ViewContainerLocation.AuxiliaryBar */)
                        .find(viewContainer => this.Kb(viewContainer.id))?.id;
                }
                if (panelToOpen) {
                    const focus = !skipLayout;
                    this.Q.openPaneComposite(panelToOpen, 2 /* ViewContainerLocation.AuxiliaryBar */, focus);
                }
            }
            // Propagate to grid
            this.u.setViewVisible(this.F, !hidden);
        }
        setPartHidden(hidden, part) {
            switch (part) {
                case "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */:
                    return this.Gb(hidden);
                case "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */:
                    return this.Jb(hidden);
                case "workbench.parts.editor" /* Parts.EDITOR_PART */:
                    return this.Ib(hidden);
                case "workbench.parts.banner" /* Parts.BANNER_PART */:
                    return this.Hb(hidden);
                case "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */:
                    return this.Ob(hidden);
                case "workbench.parts.panel" /* Parts.PANEL_PART */:
                    return this.Mb(hidden);
            }
        }
        hasWindowBorder() {
            return this.bb.runtime.windowBorder;
        }
        getWindowBorderWidth() {
            return this.bb.runtime.windowBorder ? 2 : 0;
        }
        getWindowBorderRadius() {
            return this.bb.runtime.windowBorder && platform_1.$j ? '5px' : undefined;
        }
        isPanelMaximized() {
            // the workbench grid currently prevents us from supporting panel maximization with non-center panel alignment
            return (this.getPanelAlignment() === 'center' || this.getPanelPosition() !== 2 /* Position.BOTTOM */) && !this.isVisible("workbench.parts.editor" /* Parts.EDITOR_PART */);
        }
        getSideBarPosition() {
            return this.cb.getRuntimeValue(LayoutStateKeys.SIDEBAR_POSITON);
        }
        getPanelAlignment() {
            return this.cb.getRuntimeValue(LayoutStateKeys.PANEL_ALIGNMENT);
        }
        updateMenubarVisibility(skipLayout) {
            const shouldShowTitleBar = this.Bb();
            if (!skipLayout && this.u && shouldShowTitleBar !== this.isVisible("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */)) {
                this.u.setViewVisible(this.w, shouldShowTitleBar);
            }
        }
        toggleMenuBar() {
            let currentVisibilityValue = (0, window_1.$TD)(this.L);
            if (typeof currentVisibilityValue !== 'string') {
                currentVisibilityValue = 'classic';
            }
            let newVisibilityValue;
            if (currentVisibilityValue === 'visible' || currentVisibilityValue === 'classic') {
                newVisibilityValue = (0, window_1.$UD)(this.L) === 'native' ? 'toggle' : 'compact';
            }
            else {
                newVisibilityValue = 'classic';
            }
            this.L.updateValue('window.menuBarVisibility', newVisibilityValue);
        }
        getPanelPosition() {
            return this.cb.getRuntimeValue(LayoutStateKeys.PANEL_POSITION);
        }
        setPanelPosition(position) {
            if (!this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */)) {
                this.Mb(false);
            }
            const panelPart = this.Ab("workbench.parts.panel" /* Parts.PANEL_PART */);
            const oldPositionValue = (0, layoutService_1.$Neb)(this.getPanelPosition());
            const newPositionValue = (0, layoutService_1.$Neb)(position);
            // Adjust CSS
            const panelContainer = (0, types_1.$uf)(panelPart.getContainer());
            panelContainer.classList.remove(oldPositionValue);
            panelContainer.classList.add(newPositionValue);
            // Update Styles
            panelPart.updateStyles();
            // Layout
            const size = this.u.getViewSize(this.D);
            const sideBarSize = this.u.getViewSize(this.C);
            const auxiliaryBarSize = this.u.getViewSize(this.F);
            let editorHidden = !this.isVisible("workbench.parts.editor" /* Parts.EDITOR_PART */);
            // Save last non-maximized size for panel before move
            if (newPositionValue !== oldPositionValue && !editorHidden) {
                // Save the current size of the panel for the new orthogonal direction
                // If moving down, save the width of the panel
                // Otherwise, save the height of the panel
                if (position === 2 /* Position.BOTTOM */) {
                    this.cb.setRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_WIDTH, size.width);
                }
                else if ((0, layoutService_1.$Oeb)(oldPositionValue) === 2 /* Position.BOTTOM */) {
                    this.cb.setRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_HEIGHT, size.height);
                }
            }
            if (position === 2 /* Position.BOTTOM */ && this.getPanelAlignment() !== 'center' && editorHidden) {
                this.toggleMaximizedPanel();
                editorHidden = false;
            }
            this.cb.setRuntimeValue(LayoutStateKeys.PANEL_POSITION, position);
            const sideBarVisible = this.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
            const auxiliaryBarVisible = this.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
            if (position === 2 /* Position.BOTTOM */) {
                this.u.moveView(this.D, editorHidden ? size.height : this.cb.getRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_HEIGHT), this.G, 1 /* Direction.Down */);
            }
            else if (position === 1 /* Position.RIGHT */) {
                this.u.moveView(this.D, editorHidden ? size.width : this.cb.getRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_WIDTH), this.G, 3 /* Direction.Right */);
            }
            else {
                this.u.moveView(this.D, editorHidden ? size.width : this.cb.getRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_WIDTH), this.G, 2 /* Direction.Left */);
            }
            // Reset sidebar to original size before shifting the panel
            this.u.resizeView(this.C, sideBarSize);
            if (!sideBarVisible) {
                this.Jb(true);
            }
            this.u.resizeView(this.F, auxiliaryBarSize);
            if (!auxiliaryBarVisible) {
                this.Ob(true);
            }
            if (position === 2 /* Position.BOTTOM */) {
                this.Lb(this.getSideBarPosition(), this.getPanelAlignment(), position);
            }
            this.h.fire(newPositionValue);
        }
        isWindowMaximized() {
            return this.bb.runtime.maximized;
        }
        updateWindowMaximizedState(maximized) {
            this.container.classList.toggle(LayoutClasses.MAXIMIZED, maximized);
            if (this.bb.runtime.maximized === maximized) {
                return;
            }
            this.bb.runtime.maximized = maximized;
            this.mb();
            this.g.fire(maximized);
        }
        getVisibleNeighborPart(part, direction) {
            if (!this.u) {
                return undefined;
            }
            if (!this.isVisible(part)) {
                return undefined;
            }
            const neighborViews = this.u.getNeighborViews(this.Ab(part), direction, false);
            if (!neighborViews) {
                return undefined;
            }
            for (const neighborView of neighborViews) {
                const neighborPart = ["workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */, "workbench.parts.editor" /* Parts.EDITOR_PART */, "workbench.parts.panel" /* Parts.PANEL_PART */, "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */, "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */, "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */, "workbench.parts.titlebar" /* Parts.TITLEBAR_PART */]
                    .find(partId => this.Ab(partId) === neighborView && this.isVisible(partId));
                if (neighborPart !== undefined) {
                    return neighborPart;
                }
            }
            return undefined;
        }
        Pb() {
            const bannerFirst = this.u.getNeighborViews(this.w, 0 /* Direction.Up */, false).length > 0;
            const shouldBannerBeFirst = this.Cb();
            if (bannerFirst !== shouldBannerBeFirst) {
                this.u.moveView(this.y, grid_1.Sizing.Distribute, this.w, shouldBannerBeFirst ? 0 /* Direction.Up */ : 1 /* Direction.Down */);
            }
            this.u.setViewVisible(this.w, this.Bb());
        }
        Qb(nodes, availableHeight, availableWidth) {
            if (!nodes.sideBar && !nodes.auxiliaryBar) {
                nodes.editor.size = availableHeight;
                return nodes.editor;
            }
            const result = [nodes.editor];
            nodes.editor.size = availableWidth;
            if (nodes.sideBar) {
                if (this.cb.getRuntimeValue(LayoutStateKeys.SIDEBAR_POSITON) === 0 /* Position.LEFT */) {
                    result.splice(0, 0, nodes.sideBar);
                }
                else {
                    result.push(nodes.sideBar);
                }
                nodes.editor.size -= this.cb.getRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN) ? 0 : nodes.sideBar.size;
            }
            if (nodes.auxiliaryBar) {
                if (this.cb.getRuntimeValue(LayoutStateKeys.SIDEBAR_POSITON) === 1 /* Position.RIGHT */) {
                    result.splice(0, 0, nodes.auxiliaryBar);
                }
                else {
                    result.push(nodes.auxiliaryBar);
                }
                nodes.editor.size -= this.cb.getRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN) ? 0 : nodes.auxiliaryBar.size;
            }
            return {
                type: 'branch',
                data: result,
                size: availableHeight
            };
        }
        Rb(nodes, availableWidth, availableHeight) {
            const activityBarSize = this.cb.getRuntimeValue(LayoutStateKeys.ACTIVITYBAR_HIDDEN) ? 0 : nodes.activityBar.size;
            const sideBarSize = this.cb.getRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN) ? 0 : nodes.sideBar.size;
            const auxiliaryBarSize = this.cb.getRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN) ? 0 : nodes.auxiliaryBar.size;
            const panelSize = this.cb.getInitializationValue(LayoutStateKeys.PANEL_SIZE) ? 0 : nodes.panel.size;
            const result = [];
            if (this.cb.getRuntimeValue(LayoutStateKeys.PANEL_POSITION) !== 2 /* Position.BOTTOM */) {
                result.push(nodes.editor);
                nodes.editor.size = availableWidth - activityBarSize - sideBarSize - panelSize - auxiliaryBarSize;
                if (this.cb.getRuntimeValue(LayoutStateKeys.PANEL_POSITION) === 1 /* Position.RIGHT */) {
                    result.push(nodes.panel);
                }
                else {
                    result.splice(0, 0, nodes.panel);
                }
                if (this.cb.getRuntimeValue(LayoutStateKeys.SIDEBAR_POSITON) === 0 /* Position.LEFT */) {
                    result.push(nodes.auxiliaryBar);
                    result.splice(0, 0, nodes.sideBar);
                    result.splice(0, 0, nodes.activityBar);
                }
                else {
                    result.splice(0, 0, nodes.auxiliaryBar);
                    result.push(nodes.sideBar);
                    result.push(nodes.activityBar);
                }
            }
            else {
                const panelAlignment = this.cb.getRuntimeValue(LayoutStateKeys.PANEL_ALIGNMENT);
                const sideBarPosition = this.cb.getRuntimeValue(LayoutStateKeys.SIDEBAR_POSITON);
                const sideBarNextToEditor = !(panelAlignment === 'center' || (sideBarPosition === 0 /* Position.LEFT */ && panelAlignment === 'right') || (sideBarPosition === 1 /* Position.RIGHT */ && panelAlignment === 'left'));
                const auxiliaryBarNextToEditor = !(panelAlignment === 'center' || (sideBarPosition === 1 /* Position.RIGHT */ && panelAlignment === 'right') || (sideBarPosition === 0 /* Position.LEFT */ && panelAlignment === 'left'));
                const editorSectionWidth = availableWidth - activityBarSize - (sideBarNextToEditor ? 0 : sideBarSize) - (auxiliaryBarNextToEditor ? 0 : auxiliaryBarSize);
                result.push({
                    type: 'branch',
                    data: [this.Qb({
                            editor: nodes.editor,
                            sideBar: sideBarNextToEditor ? nodes.sideBar : undefined,
                            auxiliaryBar: auxiliaryBarNextToEditor ? nodes.auxiliaryBar : undefined
                        }, availableHeight - panelSize, editorSectionWidth), nodes.panel],
                    size: editorSectionWidth
                });
                if (!sideBarNextToEditor) {
                    if (sideBarPosition === 0 /* Position.LEFT */) {
                        result.splice(0, 0, nodes.sideBar);
                    }
                    else {
                        result.push(nodes.sideBar);
                    }
                }
                if (!auxiliaryBarNextToEditor) {
                    if (sideBarPosition === 1 /* Position.RIGHT */) {
                        result.splice(0, 0, nodes.auxiliaryBar);
                    }
                    else {
                        result.push(nodes.auxiliaryBar);
                    }
                }
                if (sideBarPosition === 0 /* Position.LEFT */) {
                    result.splice(0, 0, nodes.activityBar);
                }
                else {
                    result.push(nodes.activityBar);
                }
            }
            return result;
        }
        Sb() {
            const { width, height } = this.cb.getInitializationValue(LayoutStateKeys.GRID_SIZE);
            const sideBarSize = this.cb.getInitializationValue(LayoutStateKeys.SIDEBAR_SIZE);
            const auxiliaryBarPartSize = this.cb.getInitializationValue(LayoutStateKeys.AUXILIARYBAR_SIZE);
            const panelSize = this.cb.getInitializationValue(LayoutStateKeys.PANEL_SIZE);
            const titleBarHeight = this.w.minimumHeight;
            const bannerHeight = this.y.minimumHeight;
            const statusBarHeight = this.H.minimumHeight;
            const activityBarWidth = this.z.minimumWidth;
            const middleSectionHeight = height - titleBarHeight - statusBarHeight;
            const titleAndBanner = [
                {
                    type: 'leaf',
                    data: { type: "workbench.parts.titlebar" /* Parts.TITLEBAR_PART */ },
                    size: titleBarHeight,
                    visible: this.isVisible("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */)
                },
                {
                    type: 'leaf',
                    data: { type: "workbench.parts.banner" /* Parts.BANNER_PART */ },
                    size: bannerHeight,
                    visible: false
                }
            ];
            const activityBarNode = {
                type: 'leaf',
                data: { type: "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */ },
                size: activityBarWidth,
                visible: !this.cb.getRuntimeValue(LayoutStateKeys.ACTIVITYBAR_HIDDEN)
            };
            const sideBarNode = {
                type: 'leaf',
                data: { type: "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */ },
                size: sideBarSize,
                visible: !this.cb.getRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN)
            };
            const auxiliaryBarNode = {
                type: 'leaf',
                data: { type: "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */ },
                size: auxiliaryBarPartSize,
                visible: this.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */)
            };
            const editorNode = {
                type: 'leaf',
                data: { type: "workbench.parts.editor" /* Parts.EDITOR_PART */ },
                size: 0,
                visible: !this.cb.getRuntimeValue(LayoutStateKeys.EDITOR_HIDDEN)
            };
            const panelNode = {
                type: 'leaf',
                data: { type: "workbench.parts.panel" /* Parts.PANEL_PART */ },
                size: panelSize,
                visible: !this.cb.getRuntimeValue(LayoutStateKeys.PANEL_HIDDEN)
            };
            const middleSection = this.Rb({
                activityBar: activityBarNode,
                auxiliaryBar: auxiliaryBarNode,
                editor: editorNode,
                panel: panelNode,
                sideBar: sideBarNode
            }, width, middleSectionHeight);
            const result = {
                root: {
                    type: 'branch',
                    size: width,
                    data: [
                        ...(this.Cb() ? titleAndBanner.reverse() : titleAndBanner),
                        {
                            type: 'branch',
                            data: middleSection,
                            size: middleSectionHeight
                        },
                        {
                            type: 'leaf',
                            data: { type: "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */ },
                            size: statusBarHeight,
                            visible: !this.cb.getRuntimeValue(LayoutStateKeys.STATUSBAR_HIDDEN)
                        }
                    ]
                },
                orientation: 0 /* Orientation.VERTICAL */,
                width,
                height
            };
            const layoutDescriptor = {
                activityBarVisible: !this.cb.getRuntimeValue(LayoutStateKeys.ACTIVITYBAR_HIDDEN),
                sideBarVisible: !this.cb.getRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN),
                auxiliaryBarVisible: !this.cb.getRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN),
                panelVisible: !this.cb.getRuntimeValue(LayoutStateKeys.PANEL_HIDDEN),
                statusbarVisible: !this.cb.getRuntimeValue(LayoutStateKeys.STATUSBAR_HIDDEN),
                sideBarPosition: (0, layoutService_1.$Neb)(this.cb.getRuntimeValue(LayoutStateKeys.SIDEBAR_POSITON)),
                panelPosition: (0, layoutService_1.$Neb)(this.cb.getRuntimeValue(LayoutStateKeys.PANEL_POSITION)),
            };
            this.ab.publicLog2('startupLayout', layoutDescriptor);
            return result;
        }
        dispose() {
            super.dispose();
            this.db = true;
        }
    }
    exports.$f2b = $f2b;
    function getZenModeConfiguration(configurationService) {
        return configurationService.getValue(WorkbenchLayoutSettings.ZEN_MODE_CONFIG);
    }
    class WorkbenchLayoutStateKey {
        constructor(name, scope, target, defaultValue) {
            this.name = name;
            this.scope = scope;
            this.target = target;
            this.defaultValue = defaultValue;
        }
    }
    class RuntimeStateKey extends WorkbenchLayoutStateKey {
        constructor(name, scope, target, defaultValue, zenModeIgnore) {
            super(name, scope, target, defaultValue);
            this.zenModeIgnore = zenModeIgnore;
            this.runtime = true;
        }
    }
    class InitializationStateKey extends WorkbenchLayoutStateKey {
        constructor() {
            super(...arguments);
            this.runtime = false;
        }
    }
    const LayoutStateKeys = {
        // Editor
        EDITOR_CENTERED: new RuntimeStateKey('editor.centered', 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */, false),
        // Zen Mode
        ZEN_MODE_ACTIVE: new RuntimeStateKey('zenMode.active', 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */, false),
        ZEN_MODE_EXIT_INFO: new RuntimeStateKey('zenMode.exitInfo', 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */, {
            transitionedToCenteredEditorLayout: false,
            transitionedToFullScreen: false,
            handleNotificationsDoNotDisturbMode: false,
            wasVisible: {
                auxiliaryBar: false,
                panel: false,
                sideBar: false,
            },
        }),
        // Part Sizing
        GRID_SIZE: new InitializationStateKey('grid.size', 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */, { width: 800, height: 600 }),
        SIDEBAR_SIZE: new InitializationStateKey('sideBar.size', 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */, 200),
        AUXILIARYBAR_SIZE: new InitializationStateKey('auxiliaryBar.size', 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */, 200),
        PANEL_SIZE: new InitializationStateKey('panel.size', 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */, 300),
        PANEL_LAST_NON_MAXIMIZED_HEIGHT: new RuntimeStateKey('panel.lastNonMaximizedHeight', 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */, 300),
        PANEL_LAST_NON_MAXIMIZED_WIDTH: new RuntimeStateKey('panel.lastNonMaximizedWidth', 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */, 300),
        PANEL_WAS_LAST_MAXIMIZED: new RuntimeStateKey('panel.wasLastMaximized', 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */, false),
        // Part Positions
        SIDEBAR_POSITON: new RuntimeStateKey('sideBar.position', 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */, 0 /* Position.LEFT */),
        PANEL_POSITION: new RuntimeStateKey('panel.position', 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */, 2 /* Position.BOTTOM */),
        PANEL_ALIGNMENT: new RuntimeStateKey('panel.alignment', 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */, 'center'),
        // Part Visibility
        ACTIVITYBAR_HIDDEN: new RuntimeStateKey('activityBar.hidden', 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */, false, true),
        SIDEBAR_HIDDEN: new RuntimeStateKey('sideBar.hidden', 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */, false),
        EDITOR_HIDDEN: new RuntimeStateKey('editor.hidden', 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */, false),
        PANEL_HIDDEN: new RuntimeStateKey('panel.hidden', 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */, true),
        AUXILIARYBAR_HIDDEN: new RuntimeStateKey('auxiliaryBar.hidden', 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */, true),
        STATUSBAR_HIDDEN: new RuntimeStateKey('statusBar.hidden', 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */, false, true)
    };
    var WorkbenchLayoutSettings;
    (function (WorkbenchLayoutSettings) {
        WorkbenchLayoutSettings["PANEL_POSITION"] = "workbench.panel.defaultLocation";
        WorkbenchLayoutSettings["PANEL_OPENS_MAXIMIZED"] = "workbench.panel.opensMaximized";
        WorkbenchLayoutSettings["ZEN_MODE_CONFIG"] = "zenMode";
        WorkbenchLayoutSettings["ZEN_MODE_SILENT_NOTIFICATIONS"] = "zenMode.silentNotifications";
        WorkbenchLayoutSettings["EDITOR_CENTERED_LAYOUT_AUTO_RESIZE"] = "workbench.editor.centeredLayoutAutoResize";
    })(WorkbenchLayoutSettings || (WorkbenchLayoutSettings = {}));
    var LegacyWorkbenchLayoutSettings;
    (function (LegacyWorkbenchLayoutSettings) {
        LegacyWorkbenchLayoutSettings["ACTIVITYBAR_VISIBLE"] = "workbench.activityBar.visible";
        LegacyWorkbenchLayoutSettings["STATUSBAR_VISIBLE"] = "workbench.statusBar.visible";
        LegacyWorkbenchLayoutSettings["SIDEBAR_POSITION"] = "workbench.sideBar.location";
    })(LegacyWorkbenchLayoutSettings || (LegacyWorkbenchLayoutSettings = {}));
    class LayoutStateModel extends lifecycle_1.$kc {
        static { this.STORAGE_PREFIX = 'workbench.'; }
        constructor(c, f, g, h) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeState = this.a.event;
            this.b = new Map();
            this.B(this.f.onDidChangeConfiguration(configurationChange => this.j(configurationChange)));
        }
        j(configurationChangeEvent) {
            const isZenMode = this.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE);
            if (configurationChangeEvent.affectsConfiguration(LegacyWorkbenchLayoutSettings.ACTIVITYBAR_VISIBLE) && !isZenMode) {
                this.n(LayoutStateKeys.ACTIVITYBAR_HIDDEN, !this.f.getValue(LegacyWorkbenchLayoutSettings.ACTIVITYBAR_VISIBLE));
            }
            if (configurationChangeEvent.affectsConfiguration(LegacyWorkbenchLayoutSettings.STATUSBAR_VISIBLE) && !isZenMode) {
                this.n(LayoutStateKeys.STATUSBAR_HIDDEN, !this.f.getValue(LegacyWorkbenchLayoutSettings.STATUSBAR_VISIBLE));
            }
            if (configurationChangeEvent.affectsConfiguration(LegacyWorkbenchLayoutSettings.SIDEBAR_POSITION)) {
                this.n(LayoutStateKeys.SIDEBAR_POSITON, (0, layoutService_1.$Oeb)(this.f.getValue(LegacyWorkbenchLayoutSettings.SIDEBAR_POSITION) ?? 'left'));
            }
        }
        m(key, value) {
            const isZenMode = this.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE);
            if (key.zenModeIgnore && isZenMode) {
                return;
            }
            if (key === LayoutStateKeys.ACTIVITYBAR_HIDDEN) {
                this.f.updateValue(LegacyWorkbenchLayoutSettings.ACTIVITYBAR_VISIBLE, !value);
            }
            else if (key === LayoutStateKeys.STATUSBAR_HIDDEN) {
                this.f.updateValue(LegacyWorkbenchLayoutSettings.STATUSBAR_VISIBLE, !value);
            }
            else if (key === LayoutStateKeys.SIDEBAR_POSITON) {
                this.f.updateValue(LegacyWorkbenchLayoutSettings.SIDEBAR_POSITION, (0, layoutService_1.$Neb)(value));
            }
        }
        load() {
            let key;
            // Load stored values for all keys
            for (key in LayoutStateKeys) {
                const stateKey = LayoutStateKeys[key];
                const value = this.s(stateKey);
                if (value !== undefined) {
                    this.b.set(stateKey.name, value);
                }
            }
            // Apply legacy settings
            this.b.set(LayoutStateKeys.ACTIVITYBAR_HIDDEN.name, !this.f.getValue(LegacyWorkbenchLayoutSettings.ACTIVITYBAR_VISIBLE));
            this.b.set(LayoutStateKeys.STATUSBAR_HIDDEN.name, !this.f.getValue(LegacyWorkbenchLayoutSettings.STATUSBAR_VISIBLE));
            this.b.set(LayoutStateKeys.SIDEBAR_POSITON.name, (0, layoutService_1.$Oeb)(this.f.getValue(LegacyWorkbenchLayoutSettings.SIDEBAR_POSITION) ?? 'left'));
            // Set dynamic defaults: part sizing and side bar visibility
            const workbenchDimensions = (0, dom_1.$AO)(this.h);
            LayoutStateKeys.PANEL_POSITION.defaultValue = (0, layoutService_1.$Oeb)(this.f.getValue(WorkbenchLayoutSettings.PANEL_POSITION) ?? 'bottom');
            LayoutStateKeys.GRID_SIZE.defaultValue = { height: workbenchDimensions.height, width: workbenchDimensions.width };
            LayoutStateKeys.SIDEBAR_SIZE.defaultValue = Math.min(300, workbenchDimensions.width / 4);
            LayoutStateKeys.AUXILIARYBAR_SIZE.defaultValue = Math.min(300, workbenchDimensions.width / 4);
            LayoutStateKeys.PANEL_SIZE.defaultValue = (this.b.get(LayoutStateKeys.PANEL_POSITION.name) ?? LayoutStateKeys.PANEL_POSITION.defaultValue) === 'bottom' ? workbenchDimensions.height / 3 : workbenchDimensions.width / 4;
            LayoutStateKeys.SIDEBAR_HIDDEN.defaultValue = this.g.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */;
            // Apply all defaults
            for (key in LayoutStateKeys) {
                const stateKey = LayoutStateKeys[key];
                if (this.b.get(stateKey.name) === undefined) {
                    this.b.set(stateKey.name, stateKey.defaultValue);
                }
            }
            // Register for runtime key changes
            this.B(this.c.onDidChangeValue(0 /* StorageScope.PROFILE */, undefined, this.B(new lifecycle_1.$jc()))(storageChangeEvent => {
                let key;
                for (key in LayoutStateKeys) {
                    const stateKey = LayoutStateKeys[key];
                    if (stateKey instanceof RuntimeStateKey && stateKey.scope === 0 /* StorageScope.PROFILE */ && stateKey.target === 0 /* StorageTarget.USER */) {
                        if (`${LayoutStateModel.STORAGE_PREFIX}${stateKey.name}` === storageChangeEvent.key) {
                            const value = this.s(stateKey) ?? stateKey.defaultValue;
                            if (this.b.get(stateKey.name) !== value) {
                                this.b.set(stateKey.name, value);
                                this.a.fire({ key: stateKey, value });
                            }
                        }
                    }
                }
            }));
        }
        save(workspace, global) {
            let key;
            const isZenMode = this.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE);
            for (key in LayoutStateKeys) {
                const stateKey = LayoutStateKeys[key];
                if ((workspace && stateKey.scope === 1 /* StorageScope.WORKSPACE */) ||
                    (global && stateKey.scope === 0 /* StorageScope.PROFILE */)) {
                    if (isZenMode && stateKey instanceof RuntimeStateKey && stateKey.zenModeIgnore) {
                        continue; // Don't write out specific keys while in zen mode
                    }
                    this.r(stateKey);
                }
            }
        }
        getInitializationValue(key) {
            return this.b.get(key.name);
        }
        setInitializationValue(key, value) {
            this.b.set(key.name, value);
        }
        getRuntimeValue(key, fallbackToSetting) {
            if (fallbackToSetting) {
                switch (key) {
                    case LayoutStateKeys.ACTIVITYBAR_HIDDEN:
                        this.b.set(key.name, !this.f.getValue(LegacyWorkbenchLayoutSettings.ACTIVITYBAR_VISIBLE));
                        break;
                    case LayoutStateKeys.STATUSBAR_HIDDEN:
                        this.b.set(key.name, !this.f.getValue(LegacyWorkbenchLayoutSettings.STATUSBAR_VISIBLE));
                        break;
                    case LayoutStateKeys.SIDEBAR_POSITON:
                        this.b.set(key.name, this.f.getValue(LegacyWorkbenchLayoutSettings.SIDEBAR_POSITION) ?? 'left');
                        break;
                }
            }
            return this.b.get(key.name);
        }
        setRuntimeValue(key, value) {
            this.b.set(key.name, value);
            const isZenMode = this.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE);
            if (key.scope === 0 /* StorageScope.PROFILE */) {
                if (!isZenMode || !key.zenModeIgnore) {
                    this.r(key);
                    this.m(key, value);
                }
            }
        }
        n(key, value) {
            const previousValue = this.b.get(key.name);
            if (previousValue === value) {
                return;
            }
            this.setRuntimeValue(key, value);
            this.a.fire({ key, value });
        }
        r(key) {
            const value = this.b.get(key.name);
            this.c.store(`${LayoutStateModel.STORAGE_PREFIX}${key.name}`, typeof value === 'object' ? JSON.stringify(value) : value, key.scope, key.target);
        }
        s(key) {
            let value = this.c.get(`${LayoutStateModel.STORAGE_PREFIX}${key.name}`, key.scope);
            if (value !== undefined) {
                switch (typeof key.defaultValue) {
                    case 'boolean':
                        value = value === 'true';
                        break;
                    case 'number':
                        value = parseInt(value);
                        break;
                    case 'object':
                        value = JSON.parse(value);
                        break;
                }
            }
            return value;
        }
    }
});
//#endregion
//# sourceMappingURL=layout.js.map