/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/browser/dom", "vs/base/browser/browser", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/base/common/platform", "vs/workbench/common/editor", "vs/workbench/browser/parts/sidebar/sidebarPart", "vs/workbench/browser/parts/panel/panelPart", "vs/workbench/services/layout/browser/layoutService", "vs/platform/workspace/common/workspace", "vs/platform/storage/common/storage", "vs/platform/configuration/common/configuration", "vs/workbench/services/title/common/titleService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/window/common/window", "vs/workbench/services/host/browser/host", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/browser/ui/grid/grid", "vs/workbench/services/statusbar/browser/statusbar", "vs/platform/files/common/files", "vs/editor/browser/editorBrowser", "vs/base/common/arrays", "vs/base/common/types", "vs/platform/notification/common/notification", "vs/platform/theme/common/themeService", "vs/workbench/common/theme", "vs/base/common/uri", "vs/workbench/common/views", "vs/workbench/common/editor/diffEditorInput", "vs/base/common/performance", "vs/workbench/services/extensions/common/extensions", "vs/platform/log/common/log", "vs/base/common/async", "vs/workbench/services/banner/browser/bannerService", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/browser/parts/auxiliarybar/auxiliaryBarPart", "vs/platform/telemetry/common/telemetry"], function (require, exports, lifecycle_1, event_1, dom_1, browser_1, workingCopyBackup_1, platform_1, editor_1, sidebarPart_1, panelPart_1, layoutService_1, workspace_1, storage_1, configuration_1, titleService_1, lifecycle_2, window_1, host_1, environmentService_1, editorService_1, editorGroupsService_1, grid_1, statusbar_1, files_1, editorBrowser_1, arrays_1, types_1, notification_1, themeService_1, theme_1, uri_1, views_1, diffEditorInput_1, performance_1, extensions_1, log_1, async_1, bannerService_1, panecomposite_1, auxiliaryBarPart_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Layout = void 0;
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
    class Layout extends lifecycle_1.Disposable {
        get dimension() { return this._dimension; }
        get offset() {
            let top = 0;
            let quickPickTop = 0;
            if (this.isVisible("workbench.parts.banner" /* Parts.BANNER_PART */)) {
                top = this.getPart("workbench.parts.banner" /* Parts.BANNER_PART */).maximumHeight;
                quickPickTop = top;
            }
            if (this.isVisible("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */)) {
                top += this.getPart("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */).maximumHeight;
                quickPickTop = top;
            }
            // If the command center is visible then the quickinput should go over the title bar and the banner
            if (this.titleService.isCommandCenterVisible) {
                quickPickTop = 6;
            }
            return { top, quickPickTop };
        }
        constructor(parent) {
            super();
            this.parent = parent;
            //#region Events
            this._onDidChangeZenMode = this._register(new event_1.Emitter());
            this.onDidChangeZenMode = this._onDidChangeZenMode.event;
            this._onDidChangeFullscreen = this._register(new event_1.Emitter());
            this.onDidChangeFullscreen = this._onDidChangeFullscreen.event;
            this._onDidChangeCenteredLayout = this._register(new event_1.Emitter());
            this.onDidChangeCenteredLayout = this._onDidChangeCenteredLayout.event;
            this._onDidChangePanelAlignment = this._register(new event_1.Emitter());
            this.onDidChangePanelAlignment = this._onDidChangePanelAlignment.event;
            this._onDidChangeWindowMaximized = this._register(new event_1.Emitter());
            this.onDidChangeWindowMaximized = this._onDidChangeWindowMaximized.event;
            this._onDidChangePanelPosition = this._register(new event_1.Emitter());
            this.onDidChangePanelPosition = this._onDidChangePanelPosition.event;
            this._onDidChangePartVisibility = this._register(new event_1.Emitter());
            this.onDidChangePartVisibility = this._onDidChangePartVisibility.event;
            this._onDidChangeNotificationsVisibility = this._register(new event_1.Emitter());
            this.onDidChangeNotificationsVisibility = this._onDidChangeNotificationsVisibility.event;
            this._onDidLayout = this._register(new event_1.Emitter());
            this.onDidLayout = this._onDidLayout.event;
            //#endregion
            //#region Properties
            this.hasContainer = true;
            this.container = document.createElement('div');
            //#endregion
            this.parts = new Map();
            this.initialized = false;
            this.disposed = false;
            this._openedDefaultEditors = false;
            this.whenReadyPromise = new async_1.DeferredPromise();
            this.whenReady = this.whenReadyPromise.p;
            this.whenRestoredPromise = new async_1.DeferredPromise();
            this.whenRestored = this.whenRestoredPromise.p;
            this.restored = false;
        }
        initLayout(accessor) {
            // Services
            this.environmentService = accessor.get(environmentService_1.IBrowserWorkbenchEnvironmentService);
            this.configurationService = accessor.get(configuration_1.IConfigurationService);
            this.hostService = accessor.get(host_1.IHostService);
            this.contextService = accessor.get(workspace_1.IWorkspaceContextService);
            this.storageService = accessor.get(storage_1.IStorageService);
            this.workingCopyBackupService = accessor.get(workingCopyBackup_1.IWorkingCopyBackupService);
            this.themeService = accessor.get(themeService_1.IThemeService);
            this.extensionService = accessor.get(extensions_1.IExtensionService);
            this.logService = accessor.get(log_1.ILogService);
            this.telemetryService = accessor.get(telemetry_1.ITelemetryService);
            // Parts
            this.editorService = accessor.get(editorService_1.IEditorService);
            this.editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            this.paneCompositeService = accessor.get(panecomposite_1.IPaneCompositePartService);
            this.viewDescriptorService = accessor.get(views_1.IViewDescriptorService);
            this.titleService = accessor.get(titleService_1.ITitleService);
            this.notificationService = accessor.get(notification_1.INotificationService);
            this.statusBarService = accessor.get(statusbar_1.IStatusbarService);
            accessor.get(bannerService_1.IBannerService);
            // Listeners
            this.registerLayoutListeners();
            // State
            this.initLayoutState(accessor.get(lifecycle_2.ILifecycleService), accessor.get(files_1.IFileService));
        }
        registerLayoutListeners() {
            // Restore editor if hidden
            const showEditorIfHidden = () => {
                if (!this.isVisible("workbench.parts.editor" /* Parts.EDITOR_PART */)) {
                    this.toggleMaximizedPanel();
                }
            };
            // Wait to register these listeners after the editor group service
            // is ready to avoid conflicts on startup
            this.editorGroupService.whenRestored.then(() => {
                // Restore editor part on any editor change
                this._register(this.editorService.onDidVisibleEditorsChange(showEditorIfHidden));
                this._register(this.editorGroupService.onDidActivateGroup(showEditorIfHidden));
                // Revalidate center layout when active editor changes: diff editor quits centered mode.
                this._register(this.editorService.onDidActiveEditorChange(() => this.centerEditorLayout(this.stateModel.getRuntimeValue(LayoutStateKeys.EDITOR_CENTERED))));
            });
            // Configuration changes
            this._register(this.configurationService.onDidChangeConfiguration((e) => {
                if ([
                    LegacyWorkbenchLayoutSettings.ACTIVITYBAR_VISIBLE,
                    LegacyWorkbenchLayoutSettings.SIDEBAR_POSITION,
                    LegacyWorkbenchLayoutSettings.STATUSBAR_VISIBLE,
                    'window.menuBarVisibility',
                    'window.titleBarStyle',
                ].some(setting => e.affectsConfiguration(setting))) {
                    this.doUpdateLayoutConfiguration();
                }
            }));
            // Title Menu changes
            this._register(this.titleService.onDidChangeCommandCenterVisibility(() => this.doUpdateLayoutConfiguration()));
            // Fullscreen changes
            this._register((0, browser_1.onDidChangeFullscreen)(() => this.onFullscreenChanged()));
            // Group changes
            this._register(this.editorGroupService.onDidAddGroup(() => this.centerEditorLayout(this.stateModel.getRuntimeValue(LayoutStateKeys.EDITOR_CENTERED))));
            this._register(this.editorGroupService.onDidRemoveGroup(() => this.centerEditorLayout(this.stateModel.getRuntimeValue(LayoutStateKeys.EDITOR_CENTERED))));
            // Prevent workbench from scrolling #55456
            this._register((0, dom_1.addDisposableListener)(this.container, dom_1.EventType.SCROLL, () => this.container.scrollTop = 0));
            // Menubar visibility changes
            if ((platform_1.isWindows || platform_1.isLinux || platform_1.isWeb) && (0, window_1.getTitleBarStyle)(this.configurationService) === 'custom') {
                this._register(this.titleService.onMenubarVisibilityChange(visible => this.onMenubarToggled(visible)));
            }
            // Theme changes
            this._register(this.themeService.onDidColorThemeChange(() => this.updateStyles()));
            // Window focus changes
            this._register(this.hostService.onDidChangeFocus(e => this.onWindowFocusChanged(e)));
            // WCO changes
            if (platform_1.isWeb && typeof navigator.windowControlsOverlay === 'object') {
                this._register((0, dom_1.addDisposableListener)(navigator.windowControlsOverlay, 'geometrychange', () => this.onDidChangeWCO()));
            }
        }
        onMenubarToggled(visible) {
            if (visible !== this.state.runtime.menuBar.toggled) {
                this.state.runtime.menuBar.toggled = visible;
                const menuBarVisibility = (0, window_1.getMenuBarVisibility)(this.configurationService);
                // The menu bar toggles the title bar in web because it does not need to be shown for window controls only
                if (platform_1.isWeb && menuBarVisibility === 'toggle') {
                    this.workbenchGrid.setViewVisible(this.titleBarPartView, this.shouldShowTitleBar());
                }
                // The menu bar toggles the title bar in full screen for toggle and classic settings
                else if (this.state.runtime.fullscreen && (menuBarVisibility === 'toggle' || menuBarVisibility === 'classic')) {
                    this.workbenchGrid.setViewVisible(this.titleBarPartView, this.shouldShowTitleBar());
                }
                // Move layout call to any time the menubar
                // is toggled to update consumers of offset
                // see issue #115267
                this._onDidLayout.fire(this._dimension);
            }
        }
        onFullscreenChanged() {
            this.state.runtime.fullscreen = (0, browser_1.isFullscreen)();
            // Apply as CSS class
            if (this.state.runtime.fullscreen) {
                this.container.classList.add(LayoutClasses.FULLSCREEN);
            }
            else {
                this.container.classList.remove(LayoutClasses.FULLSCREEN);
                const zenModeExitInfo = this.stateModel.getRuntimeValue(LayoutStateKeys.ZEN_MODE_EXIT_INFO);
                const zenModeActive = this.stateModel.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE);
                if (zenModeExitInfo.transitionedToFullScreen && zenModeActive) {
                    this.toggleZenMode();
                }
            }
            // Change edge snapping accordingly
            this.workbenchGrid.edgeSnapping = this.state.runtime.fullscreen;
            // Changing fullscreen state of the window has an impact
            // on custom title bar visibility, so we need to update
            if ((0, window_1.getTitleBarStyle)(this.configurationService) === 'custom') {
                // Propagate to grid
                this.workbenchGrid.setViewVisible(this.titleBarPartView, this.shouldShowTitleBar());
                this.updateWindowBorder(true);
            }
            this._onDidChangeFullscreen.fire(this.state.runtime.fullscreen);
        }
        onWindowFocusChanged(hasFocus) {
            if (this.state.runtime.hasFocus === hasFocus) {
                return;
            }
            this.state.runtime.hasFocus = hasFocus;
            this.updateWindowBorder();
        }
        doUpdateLayoutConfiguration(skipLayout) {
            // Menubar visibility
            this.updateMenubarVisibility(!!skipLayout);
            // Centered Layout
            this.editorGroupService.whenRestored.then(() => {
                this.centerEditorLayout(this.stateModel.getRuntimeValue(LayoutStateKeys.EDITOR_CENTERED), skipLayout);
            });
        }
        setSideBarPosition(position) {
            const activityBar = this.getPart("workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */);
            const sideBar = this.getPart("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
            const auxiliaryBar = this.getPart("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
            const newPositionValue = (position === 0 /* Position.LEFT */) ? 'left' : 'right';
            const oldPositionValue = (position === 1 /* Position.RIGHT */) ? 'left' : 'right';
            const panelAlignment = this.getPanelAlignment();
            const panelPosition = this.getPanelPosition();
            this.stateModel.setRuntimeValue(LayoutStateKeys.SIDEBAR_POSITON, position);
            // Adjust CSS
            const activityBarContainer = (0, types_1.assertIsDefined)(activityBar.getContainer());
            const sideBarContainer = (0, types_1.assertIsDefined)(sideBar.getContainer());
            const auxiliaryBarContainer = (0, types_1.assertIsDefined)(auxiliaryBar.getContainer());
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
            this.adjustPartPositions(position, panelAlignment, panelPosition);
        }
        updateWindowBorder(skipLayout = false) {
            if (platform_1.isWeb ||
                platform_1.isWindows || // not working well with zooming and window control overlays
                (0, window_1.getTitleBarStyle)(this.configurationService) !== 'custom') {
                return;
            }
            const theme = this.themeService.getColorTheme();
            const activeBorder = theme.getColor(theme_1.WINDOW_ACTIVE_BORDER);
            const inactiveBorder = theme.getColor(theme_1.WINDOW_INACTIVE_BORDER);
            let windowBorder = false;
            if (!this.state.runtime.fullscreen && !this.state.runtime.maximized && (activeBorder || inactiveBorder)) {
                windowBorder = true;
                // If the inactive color is missing, fallback to the active one
                const borderColor = this.state.runtime.hasFocus ? activeBorder : inactiveBorder ?? activeBorder;
                this.container.style.setProperty('--window-border-color', borderColor?.toString() ?? 'transparent');
            }
            if (windowBorder === this.state.runtime.windowBorder) {
                return;
            }
            this.state.runtime.windowBorder = windowBorder;
            this.container.classList.toggle(LayoutClasses.WINDOW_BORDER, windowBorder);
            if (!skipLayout) {
                this.layout();
            }
        }
        updateStyles() {
            this.updateWindowBorder();
        }
        initLayoutState(lifecycleService, fileService) {
            this.stateModel = new LayoutStateModel(this.storageService, this.configurationService, this.contextService, this.parent);
            this.stateModel.load();
            // Both editor and panel should not be hidden on startup
            if (this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_HIDDEN) && this.stateModel.getRuntimeValue(LayoutStateKeys.EDITOR_HIDDEN)) {
                this.stateModel.setRuntimeValue(LayoutStateKeys.EDITOR_HIDDEN, false);
            }
            this.stateModel.onDidChangeState(change => {
                if (change.key === LayoutStateKeys.ACTIVITYBAR_HIDDEN) {
                    this.setActivityBarHidden(change.value);
                }
                if (change.key === LayoutStateKeys.STATUSBAR_HIDDEN) {
                    this.setStatusBarHidden(change.value);
                }
                if (change.key === LayoutStateKeys.SIDEBAR_POSITON) {
                    this.setSideBarPosition(change.value);
                }
                if (change.key === LayoutStateKeys.PANEL_POSITION) {
                    this.setPanelPosition(change.value);
                }
                if (change.key === LayoutStateKeys.PANEL_ALIGNMENT) {
                    this.setPanelAlignment(change.value);
                }
                this.doUpdateLayoutConfiguration();
            });
            // Layout Initialization State
            const initialEditorsState = this.getInitialEditorsState();
            if (initialEditorsState) {
                this.logService.info('Initial editor state', initialEditorsState);
            }
            const initialLayoutState = {
                layout: {
                    editors: initialEditorsState?.layout
                },
                editor: {
                    restoreEditors: this.shouldRestoreEditors(this.contextService, initialEditorsState),
                    editorsToOpen: this.resolveEditorsToOpen(fileService, initialEditorsState),
                },
                views: {
                    defaults: this.getDefaultLayoutViews(this.environmentService, this.storageService),
                    containerToRestore: {}
                }
            };
            // Layout Runtime State
            const layoutRuntimeState = {
                fullscreen: (0, browser_1.isFullscreen)(),
                hasFocus: this.hostService.hasFocus,
                maximized: false,
                windowBorder: false,
                menuBar: {
                    toggled: false,
                },
                zenMode: {
                    transitionDisposables: new lifecycle_1.DisposableStore(),
                }
            };
            this.state = {
                initialization: initialLayoutState,
                runtime: layoutRuntimeState,
            };
            // Sidebar View Container To Restore
            if (this.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */)) {
                // Only restore last viewlet if window was reloaded or we are in development mode
                let viewContainerToRestore;
                if (!this.environmentService.isBuilt || lifecycleService.startupKind === 3 /* StartupKind.ReloadedWindow */ || platform_1.isWeb) {
                    viewContainerToRestore = this.storageService.get(sidebarPart_1.SidebarPart.activeViewletSettingsKey, 1 /* StorageScope.WORKSPACE */, this.viewDescriptorService.getDefaultViewContainer(0 /* ViewContainerLocation.Sidebar */)?.id);
                }
                else {
                    viewContainerToRestore = this.viewDescriptorService.getDefaultViewContainer(0 /* ViewContainerLocation.Sidebar */)?.id;
                }
                if (viewContainerToRestore) {
                    this.state.initialization.views.containerToRestore.sideBar = viewContainerToRestore;
                }
                else {
                    this.stateModel.setRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN, true);
                }
            }
            // Panel View Container To Restore
            if (this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */)) {
                const viewContainerToRestore = this.storageService.get(panelPart_1.PanelPart.activePanelSettingsKey, 1 /* StorageScope.WORKSPACE */, this.viewDescriptorService.getDefaultViewContainer(1 /* ViewContainerLocation.Panel */)?.id);
                if (viewContainerToRestore) {
                    this.state.initialization.views.containerToRestore.panel = viewContainerToRestore;
                }
                else {
                    this.stateModel.setRuntimeValue(LayoutStateKeys.PANEL_HIDDEN, true);
                }
            }
            // Auxiliary Panel to restore
            if (this.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */)) {
                const viewContainerToRestore = this.storageService.get(auxiliaryBarPart_1.AuxiliaryBarPart.activePanelSettingsKey, 1 /* StorageScope.WORKSPACE */, this.viewDescriptorService.getDefaultViewContainer(2 /* ViewContainerLocation.AuxiliaryBar */)?.id);
                if (viewContainerToRestore) {
                    this.state.initialization.views.containerToRestore.auxiliaryBar = viewContainerToRestore;
                }
                else {
                    this.stateModel.setRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN, true);
                }
            }
            // Window border
            this.updateWindowBorder(true);
        }
        getDefaultLayoutViews(environmentService, storageService) {
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
        shouldRestoreEditors(contextService, initialEditorsState) {
            // Restore editors based on a set of rules:
            // - never when running on temporary workspace
            // - not when we have files to open, unless:
            // - always when `window.restoreWindows: preserve`
            if ((0, workspace_1.isTemporaryWorkspace)(contextService.getWorkspace())) {
                return false;
            }
            const forceRestoreEditors = this.configurationService.getValue('window.restoreWindows') === 'preserve';
            return !!forceRestoreEditors || initialEditorsState === undefined;
        }
        willRestoreEditors() {
            return this.state.initialization.editor.restoreEditors;
        }
        async resolveEditorsToOpen(fileService, initialEditorsState) {
            if (initialEditorsState) {
                // Merge editor (single)
                const filesToMerge = (0, arrays_1.coalesce)(await (0, editor_1.pathsToEditors)(initialEditorsState.filesToMerge, fileService, this.logService));
                if (filesToMerge.length === 4 && (0, editor_1.isResourceEditorInput)(filesToMerge[0]) && (0, editor_1.isResourceEditorInput)(filesToMerge[1]) && (0, editor_1.isResourceEditorInput)(filesToMerge[2]) && (0, editor_1.isResourceEditorInput)(filesToMerge[3])) {
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
                const filesToDiff = (0, arrays_1.coalesce)(await (0, editor_1.pathsToEditors)(initialEditorsState.filesToDiff, fileService, this.logService));
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
                const resolvedFilesToOpenOrCreate = await (0, editor_1.pathsToEditors)(initialEditorsState.filesToOpenOrCreate, fileService, this.logService);
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
            else if (this.contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ && this.configurationService.getValue('workbench.startupEditor') === 'newUntitledFile') {
                if (this.editorGroupService.hasRestorableState) {
                    return []; // do not open any empty untitled file if we restored groups/editors from previous session
                }
                const hasBackups = await this.workingCopyBackupService.hasBackups();
                if (hasBackups) {
                    return []; // do not open any empty untitled file if we have backups to restore
                }
                return [{
                        editor: { resource: undefined } // open empty untitled file
                    }];
            }
            return [];
        }
        get openedDefaultEditors() { return this._openedDefaultEditors; }
        getInitialEditorsState() {
            // Check for editors / editor layout from `defaultLayout` options first
            const defaultLayout = this.environmentService.options?.defaultLayout;
            if ((defaultLayout?.editors?.length || defaultLayout?.layout?.editors) && (defaultLayout.force || this.storageService.isNew(1 /* StorageScope.WORKSPACE */))) {
                this._openedDefaultEditors = true;
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
            const { filesToOpenOrCreate, filesToDiff, filesToMerge } = this.environmentService;
            if (filesToOpenOrCreate || filesToDiff || filesToMerge) {
                return { filesToOpenOrCreate, filesToDiff, filesToMerge };
            }
            return undefined;
        }
        isRestored() {
            return this.restored;
        }
        restoreParts() {
            // distinguish long running restore operations that
            // are required for the layout to be ready from those
            // that are needed to signal restoring is done
            const layoutReadyPromises = [];
            const layoutRestoredPromises = [];
            // Restore editors
            layoutReadyPromises.push((async () => {
                (0, performance_1.mark)('code/willRestoreEditors');
                // first ensure the editor part is ready
                await this.editorGroupService.whenReady;
                (0, performance_1.mark)('code/restoreEditors/editorGroupsReady');
                // apply editor layout if any
                if (this.state.initialization.layout?.editors) {
                    this.editorGroupService.applyLayout(this.state.initialization.layout.editors);
                }
                // then see for editors to open as instructed
                // it is important that we trigger this from
                // the overall restore flow to reduce possible
                // flicker on startup: we want any editor to
                // open to get a chance to open first before
                // signaling that layout is restored, but we do
                // not need to await the editors from having
                // fully loaded.
                const editors = await this.state.initialization.editor.editorsToOpen;
                (0, performance_1.mark)('code/restoreEditors/editorsToOpenResolved');
                let openEditorsPromise = undefined;
                if (editors.length) {
                    // we have to map editors to their groups as instructed
                    // by the input. this is important to ensure that we open
                    // the editors in the groups they belong to.
                    const editorGroupsInVisualOrder = this.editorGroupService.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */);
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
                            await this.editorService.openEditors(Array.from(editors), groupId, { validateTrust: true });
                        }
                        catch (error) {
                            this.logService.error(error);
                        }
                    }));
                }
                // do not block the overall layout ready flow from potentially
                // slow editors to resolve on startup
                layoutRestoredPromises.push(Promise.all([
                    openEditorsPromise?.finally(() => (0, performance_1.mark)('code/restoreEditors/editorsOpened')),
                    this.editorGroupService.whenRestored.finally(() => (0, performance_1.mark)('code/restoreEditors/editorGroupsRestored'))
                ]).finally(() => {
                    // the `code/didRestoreEditors` perf mark is specifically
                    // for when visible editors have resolved, so we only mark
                    // if when editor group service has restored.
                    (0, performance_1.mark)('code/didRestoreEditors');
                }));
            })());
            // Restore default views (only when `IDefaultLayout` is provided)
            const restoreDefaultViewsPromise = (async () => {
                if (this.state.initialization.views.defaults?.length) {
                    (0, performance_1.mark)('code/willOpenDefaultViews');
                    const locationsRestored = [];
                    const tryOpenView = (view) => {
                        const location = this.viewDescriptorService.getViewLocationById(view.id);
                        if (location !== null) {
                            const container = this.viewDescriptorService.getViewContainerByViewId(view.id);
                            if (container) {
                                if (view.order >= (locationsRestored?.[location]?.order ?? 0)) {
                                    locationsRestored[location] = { id: container.id, order: view.order };
                                }
                                const containerModel = this.viewDescriptorService.getViewContainerModel(container);
                                containerModel.setCollapsed(view.id, false);
                                containerModel.setVisible(view.id, true);
                                return true;
                            }
                        }
                        return false;
                    };
                    const defaultViews = [...this.state.initialization.views.defaults].reverse().map((v, index) => ({ id: v, order: index }));
                    let i = defaultViews.length;
                    while (i) {
                        i--;
                        if (tryOpenView(defaultViews[i])) {
                            defaultViews.splice(i, 1);
                        }
                    }
                    // If we still have views left over, wait until all extensions have been registered and try again
                    if (defaultViews.length) {
                        await this.extensionService.whenInstalledExtensionsRegistered();
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
                        this.state.initialization.views.containerToRestore.sideBar = locationsRestored[0 /* ViewContainerLocation.Sidebar */].id;
                    }
                    // If we opened a view in the panel, stop any restore there
                    if (locationsRestored[1 /* ViewContainerLocation.Panel */]) {
                        this.state.initialization.views.containerToRestore.panel = locationsRestored[1 /* ViewContainerLocation.Panel */].id;
                    }
                    // If we opened a view in the auxiliary bar, stop any restore there
                    if (locationsRestored[2 /* ViewContainerLocation.AuxiliaryBar */]) {
                        this.state.initialization.views.containerToRestore.auxiliaryBar = locationsRestored[2 /* ViewContainerLocation.AuxiliaryBar */].id;
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
                if (!this.state.initialization.views.containerToRestore.sideBar) {
                    return;
                }
                (0, performance_1.mark)('code/willRestoreViewlet');
                const viewlet = await this.paneCompositeService.openPaneComposite(this.state.initialization.views.containerToRestore.sideBar, 0 /* ViewContainerLocation.Sidebar */);
                if (!viewlet) {
                    await this.paneCompositeService.openPaneComposite(this.viewDescriptorService.getDefaultViewContainer(0 /* ViewContainerLocation.Sidebar */)?.id, 0 /* ViewContainerLocation.Sidebar */); // fallback to default viewlet as needed
                }
                (0, performance_1.mark)('code/didRestoreViewlet');
            })());
            // Restore Panel
            layoutReadyPromises.push((async () => {
                // Restoring views could mean that panel already
                // restored, as such we need to test again
                await restoreDefaultViewsPromise;
                if (!this.state.initialization.views.containerToRestore.panel) {
                    return;
                }
                (0, performance_1.mark)('code/willRestorePanel');
                const panel = await this.paneCompositeService.openPaneComposite(this.state.initialization.views.containerToRestore.panel, 1 /* ViewContainerLocation.Panel */);
                if (!panel) {
                    await this.paneCompositeService.openPaneComposite(this.viewDescriptorService.getDefaultViewContainer(1 /* ViewContainerLocation.Panel */)?.id, 1 /* ViewContainerLocation.Panel */); // fallback to default panel as needed
                }
                (0, performance_1.mark)('code/didRestorePanel');
            })());
            // Restore Auxiliary Bar
            layoutReadyPromises.push((async () => {
                // Restoring views could mean that panel already
                // restored, as such we need to test again
                await restoreDefaultViewsPromise;
                if (!this.state.initialization.views.containerToRestore.auxiliaryBar) {
                    return;
                }
                (0, performance_1.mark)('code/willRestoreAuxiliaryBar');
                const panel = await this.paneCompositeService.openPaneComposite(this.state.initialization.views.containerToRestore.auxiliaryBar, 2 /* ViewContainerLocation.AuxiliaryBar */);
                if (!panel) {
                    await this.paneCompositeService.openPaneComposite(this.viewDescriptorService.getDefaultViewContainer(2 /* ViewContainerLocation.AuxiliaryBar */)?.id, 2 /* ViewContainerLocation.AuxiliaryBar */); // fallback to default panel as needed
                }
                (0, performance_1.mark)('code/didRestoreAuxiliaryBar');
            })());
            // Restore Zen Mode
            const zenModeWasActive = this.stateModel.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE);
            const restoreZenMode = getZenModeConfiguration(this.configurationService).restore;
            if (zenModeWasActive) {
                this.stateModel.setRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE, !restoreZenMode);
                this.toggleZenMode(false, true);
            }
            // Restore Editor Center Mode
            if (this.stateModel.getRuntimeValue(LayoutStateKeys.EDITOR_CENTERED)) {
                this.centerEditorLayout(true, true);
            }
            // Await for promises that we recorded to update
            // our ready and restored states properly.
            async_1.Promises.settled(layoutReadyPromises).finally(() => {
                this.whenReadyPromise.complete();
                async_1.Promises.settled(layoutRestoredPromises).finally(() => {
                    this.restored = true;
                    this.whenRestoredPromise.complete();
                });
            });
        }
        registerPart(part) {
            this.parts.set(part.getId(), part);
        }
        getPart(key) {
            const part = this.parts.get(key);
            if (!part) {
                throw new Error(`Unknown part ${key}`);
            }
            return part;
        }
        registerNotifications(delegate) {
            this._register(delegate.onDidChangeNotificationsVisibility(visible => this._onDidChangeNotificationsVisibility.fire(visible)));
        }
        hasFocus(part) {
            const activeElement = document.activeElement;
            if (!activeElement) {
                return false;
            }
            const container = this.getContainer(part);
            return !!container && (0, dom_1.isAncestorUsingFlowTo)(activeElement, container);
        }
        focusPart(part) {
            switch (part) {
                case "workbench.parts.editor" /* Parts.EDITOR_PART */:
                    this.editorGroupService.activeGroup.focus();
                    break;
                case "workbench.parts.panel" /* Parts.PANEL_PART */: {
                    const activePanel = this.paneCompositeService.getActivePaneComposite(1 /* ViewContainerLocation.Panel */);
                    activePanel?.focus();
                    break;
                }
                case "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */: {
                    const activeViewlet = this.paneCompositeService.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */);
                    activeViewlet?.focus();
                    break;
                }
                case "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */:
                    this.getPart("workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */).focus();
                    break;
                case "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */:
                    this.statusBarService.focus();
                default: {
                    // Title Bar & Banner simply pass focus to container
                    const container = this.getContainer(part);
                    container?.focus();
                }
            }
        }
        getContainer(part) {
            if (!this.parts.get(part)) {
                return undefined;
            }
            return this.getPart(part).getContainer();
        }
        isVisible(part) {
            if (this.initialized) {
                switch (part) {
                    case "workbench.parts.titlebar" /* Parts.TITLEBAR_PART */:
                        return this.workbenchGrid.isViewVisible(this.titleBarPartView);
                    case "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */:
                        return !this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN);
                    case "workbench.parts.panel" /* Parts.PANEL_PART */:
                        return !this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_HIDDEN);
                    case "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */:
                        return !this.stateModel.getRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN);
                    case "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */:
                        return !this.stateModel.getRuntimeValue(LayoutStateKeys.STATUSBAR_HIDDEN);
                    case "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */:
                        return !this.stateModel.getRuntimeValue(LayoutStateKeys.ACTIVITYBAR_HIDDEN);
                    case "workbench.parts.editor" /* Parts.EDITOR_PART */:
                        return !this.stateModel.getRuntimeValue(LayoutStateKeys.EDITOR_HIDDEN);
                    case "workbench.parts.banner" /* Parts.BANNER_PART */:
                        return this.workbenchGrid.isViewVisible(this.bannerPartView);
                    default:
                        return false; // any other part cannot be hidden
                }
            }
            switch (part) {
                case "workbench.parts.titlebar" /* Parts.TITLEBAR_PART */:
                    return this.shouldShowTitleBar();
                case "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */:
                    return !this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN);
                case "workbench.parts.panel" /* Parts.PANEL_PART */:
                    return !this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_HIDDEN);
                case "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */:
                    return !this.stateModel.getRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN);
                case "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */:
                    return !this.stateModel.getRuntimeValue(LayoutStateKeys.STATUSBAR_HIDDEN);
                case "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */:
                    return !this.stateModel.getRuntimeValue(LayoutStateKeys.ACTIVITYBAR_HIDDEN);
                case "workbench.parts.editor" /* Parts.EDITOR_PART */:
                    return !this.stateModel.getRuntimeValue(LayoutStateKeys.EDITOR_HIDDEN);
                default:
                    return false; // any other part cannot be hidden
            }
        }
        shouldShowTitleBar() {
            // Using the native title bar, don't ever show the custom one
            if ((0, window_1.getTitleBarStyle)(this.configurationService) === 'native') {
                return false;
            }
            // with the command center enabled, we should always show
            if (this.configurationService.getValue('window.commandCenter')) {
                return true;
            }
            // macOS desktop does not need a title bar when full screen
            if (platform_1.isMacintosh && platform_1.isNative) {
                return !this.state.runtime.fullscreen;
            }
            // non-fullscreen native must show the title bar
            if (platform_1.isNative && !this.state.runtime.fullscreen) {
                return true;
            }
            // if WCO is visible, we have to show the title bar
            if ((0, browser_1.isWCOEnabled)() && !this.state.runtime.fullscreen) {
                return true;
            }
            // remaining behavior is based on menubar visibility
            switch ((0, window_1.getMenuBarVisibility)(this.configurationService)) {
                case 'classic':
                    return !this.state.runtime.fullscreen || this.state.runtime.menuBar.toggled;
                case 'compact':
                case 'hidden':
                    return false;
                case 'toggle':
                    return this.state.runtime.menuBar.toggled;
                case 'visible':
                    return true;
                default:
                    return platform_1.isWeb ? false : !this.state.runtime.fullscreen || this.state.runtime.menuBar.toggled;
            }
        }
        shouldShowBannerFirst() {
            return platform_1.isWeb && !(0, browser_1.isWCOEnabled)();
        }
        focus() {
            this.focusPart("workbench.parts.editor" /* Parts.EDITOR_PART */);
        }
        getDimension(part) {
            return this.getPart(part).dimension;
        }
        getMaximumEditorDimensions() {
            const panelPosition = this.getPanelPosition();
            const isColumn = panelPosition === 1 /* Position.RIGHT */ || panelPosition === 0 /* Position.LEFT */;
            const takenWidth = (this.isVisible("workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */) ? this.activityBarPartView.minimumWidth : 0) +
                (this.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */) ? this.sideBarPartView.minimumWidth : 0) +
                (this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */) && isColumn ? this.panelPartView.minimumWidth : 0) +
                (this.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */) ? this.auxiliaryBarPartView.minimumWidth : 0);
            const takenHeight = (this.isVisible("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */) ? this.titleBarPartView.minimumHeight : 0) +
                (this.isVisible("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */) ? this.statusBarPartView.minimumHeight : 0) +
                (this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */) && !isColumn ? this.panelPartView.minimumHeight : 0);
            const availableWidth = this.dimension.width - takenWidth;
            const availableHeight = this.dimension.height - takenHeight;
            return new dom_1.Dimension(availableWidth, availableHeight);
        }
        toggleZenMode(skipLayout, restoring = false) {
            this.stateModel.setRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE, !this.stateModel.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE));
            this.state.runtime.zenMode.transitionDisposables.clear();
            const setLineNumbers = (lineNumbers) => {
                const setEditorLineNumbers = (editor) => {
                    // To properly reset line numbers we need to read the configuration for each editor respecting it's uri.
                    if (!lineNumbers && (0, editorBrowser_1.isCodeEditor)(editor) && editor.hasModel()) {
                        const model = editor.getModel();
                        lineNumbers = this.configurationService.getValue('editor.lineNumbers', { resource: model.uri, overrideIdentifier: model.getLanguageId() });
                    }
                    if (!lineNumbers) {
                        lineNumbers = this.configurationService.getValue('editor.lineNumbers');
                    }
                    editor.updateOptions({ lineNumbers });
                };
                if (!lineNumbers) {
                    // Reset line numbers on all editors visible and non-visible
                    for (const editorControl of this.editorService.visibleTextEditorControls) {
                        setEditorLineNumbers(editorControl);
                    }
                }
                else {
                    for (const editorControl of this.editorService.visibleTextEditorControls) {
                        setEditorLineNumbers(editorControl);
                    }
                }
            };
            // Check if zen mode transitioned to full screen and if now we are out of zen mode
            // -> we need to go out of full screen (same goes for the centered editor layout)
            let toggleFullScreen = false;
            const config = getZenModeConfiguration(this.configurationService);
            const zenModeExitInfo = this.stateModel.getRuntimeValue(LayoutStateKeys.ZEN_MODE_EXIT_INFO);
            // Zen Mode Active
            if (this.stateModel.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE)) {
                toggleFullScreen = !this.state.runtime.fullscreen && config.fullScreen && !platform_1.isIOS;
                if (!restoring) {
                    zenModeExitInfo.transitionedToFullScreen = toggleFullScreen;
                    zenModeExitInfo.transitionedToCenteredEditorLayout = !this.isEditorLayoutCentered() && config.centerLayout;
                    zenModeExitInfo.handleNotificationsDoNotDisturbMode = !this.notificationService.doNotDisturbMode;
                    zenModeExitInfo.wasVisible.sideBar = this.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
                    zenModeExitInfo.wasVisible.panel = this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */);
                    zenModeExitInfo.wasVisible.auxiliaryBar = this.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
                    this.stateModel.setRuntimeValue(LayoutStateKeys.ZEN_MODE_EXIT_INFO, zenModeExitInfo);
                }
                this.setPanelHidden(true, true);
                this.setAuxiliaryBarHidden(true, true);
                this.setSideBarHidden(true, true);
                if (config.hideActivityBar) {
                    this.setActivityBarHidden(true, true);
                }
                if (config.hideStatusBar) {
                    this.setStatusBarHidden(true, true);
                }
                if (config.hideLineNumbers) {
                    setLineNumbers('off');
                    this.state.runtime.zenMode.transitionDisposables.add(this.editorService.onDidVisibleEditorsChange(() => setLineNumbers('off')));
                }
                if (config.hideTabs && this.editorGroupService.partOptions.showTabs) {
                    this.state.runtime.zenMode.transitionDisposables.add(this.editorGroupService.enforcePartOptions({ showTabs: false }));
                }
                if (config.silentNotifications && zenModeExitInfo.handleNotificationsDoNotDisturbMode) {
                    this.notificationService.doNotDisturbMode = true;
                }
                this.state.runtime.zenMode.transitionDisposables.add(this.configurationService.onDidChangeConfiguration(e => {
                    if (e.affectsConfiguration(WorkbenchLayoutSettings.ZEN_MODE_SILENT_NOTIFICATIONS)) {
                        const zenModeSilentNotifications = !!this.configurationService.getValue(WorkbenchLayoutSettings.ZEN_MODE_SILENT_NOTIFICATIONS);
                        if (zenModeExitInfo.handleNotificationsDoNotDisturbMode) {
                            this.notificationService.doNotDisturbMode = zenModeSilentNotifications;
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
                    this.setPanelHidden(false, true);
                }
                if (zenModeExitInfo.wasVisible.auxiliaryBar) {
                    this.setAuxiliaryBarHidden(false, true);
                }
                if (zenModeExitInfo.wasVisible.sideBar) {
                    this.setSideBarHidden(false, true);
                }
                if (!this.stateModel.getRuntimeValue(LayoutStateKeys.ACTIVITYBAR_HIDDEN, true)) {
                    this.setActivityBarHidden(false, true);
                }
                if (!this.stateModel.getRuntimeValue(LayoutStateKeys.STATUSBAR_HIDDEN, true)) {
                    this.setStatusBarHidden(false, true);
                }
                if (zenModeExitInfo.transitionedToCenteredEditorLayout) {
                    this.centerEditorLayout(false, true);
                }
                if (zenModeExitInfo.handleNotificationsDoNotDisturbMode) {
                    this.notificationService.doNotDisturbMode = false;
                }
                setLineNumbers();
                this.focus();
                toggleFullScreen = zenModeExitInfo.transitionedToFullScreen && this.state.runtime.fullscreen;
            }
            if (!skipLayout) {
                this.layout();
            }
            if (toggleFullScreen) {
                this.hostService.toggleFullScreen();
            }
            // Event
            this._onDidChangeZenMode.fire(this.stateModel.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE));
        }
        setStatusBarHidden(hidden, skipLayout) {
            this.stateModel.setRuntimeValue(LayoutStateKeys.STATUSBAR_HIDDEN, hidden);
            // Adjust CSS
            if (hidden) {
                this.container.classList.add(LayoutClasses.STATUSBAR_HIDDEN);
            }
            else {
                this.container.classList.remove(LayoutClasses.STATUSBAR_HIDDEN);
            }
            // Propagate to grid
            this.workbenchGrid.setViewVisible(this.statusBarPartView, !hidden);
        }
        createWorkbenchLayout() {
            const titleBar = this.getPart("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */);
            const bannerPart = this.getPart("workbench.parts.banner" /* Parts.BANNER_PART */);
            const editorPart = this.getPart("workbench.parts.editor" /* Parts.EDITOR_PART */);
            const activityBar = this.getPart("workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */);
            const panelPart = this.getPart("workbench.parts.panel" /* Parts.PANEL_PART */);
            const auxiliaryBarPart = this.getPart("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
            const sideBar = this.getPart("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
            const statusBar = this.getPart("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */);
            // View references for all parts
            this.titleBarPartView = titleBar;
            this.bannerPartView = bannerPart;
            this.sideBarPartView = sideBar;
            this.activityBarPartView = activityBar;
            this.editorPartView = editorPart;
            this.panelPartView = panelPart;
            this.auxiliaryBarPartView = auxiliaryBarPart;
            this.statusBarPartView = statusBar;
            const viewMap = {
                ["workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */]: this.activityBarPartView,
                ["workbench.parts.banner" /* Parts.BANNER_PART */]: this.bannerPartView,
                ["workbench.parts.titlebar" /* Parts.TITLEBAR_PART */]: this.titleBarPartView,
                ["workbench.parts.editor" /* Parts.EDITOR_PART */]: this.editorPartView,
                ["workbench.parts.panel" /* Parts.PANEL_PART */]: this.panelPartView,
                ["workbench.parts.sidebar" /* Parts.SIDEBAR_PART */]: this.sideBarPartView,
                ["workbench.parts.statusbar" /* Parts.STATUSBAR_PART */]: this.statusBarPartView,
                ["workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */]: this.auxiliaryBarPartView
            };
            const fromJSON = ({ type }) => viewMap[type];
            const workbenchGrid = grid_1.SerializableGrid.deserialize(this.createGridDescriptor(), { fromJSON }, { proportionalLayout: false });
            this.container.prepend(workbenchGrid.element);
            this.container.setAttribute('role', 'application');
            this.workbenchGrid = workbenchGrid;
            this.workbenchGrid.edgeSnapping = this.state.runtime.fullscreen;
            for (const part of [titleBar, editorPart, activityBar, panelPart, sideBar, statusBar, auxiliaryBarPart, bannerPart]) {
                this._register(part.onDidVisibilityChange((visible) => {
                    if (part === sideBar) {
                        this.setSideBarHidden(!visible, true);
                    }
                    else if (part === panelPart) {
                        this.setPanelHidden(!visible, true);
                    }
                    else if (part === auxiliaryBarPart) {
                        this.setAuxiliaryBarHidden(!visible, true);
                    }
                    else if (part === editorPart) {
                        this.setEditorHidden(!visible, true);
                    }
                    this._onDidChangePartVisibility.fire();
                    this._onDidLayout.fire(this._dimension);
                }));
            }
            this._register(this.storageService.onWillSaveState(willSaveState => {
                if (willSaveState.reason === storage_1.WillSaveStateReason.SHUTDOWN) {
                    // Side Bar Size
                    const sideBarSize = this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN)
                        ? this.workbenchGrid.getViewCachedVisibleSize(this.sideBarPartView)
                        : this.workbenchGrid.getViewSize(this.sideBarPartView).width;
                    this.stateModel.setInitializationValue(LayoutStateKeys.SIDEBAR_SIZE, sideBarSize);
                    // Panel Size
                    const panelSize = this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_HIDDEN)
                        ? this.workbenchGrid.getViewCachedVisibleSize(this.panelPartView)
                        : (this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_POSITION) === 2 /* Position.BOTTOM */ ? this.workbenchGrid.getViewSize(this.panelPartView).height : this.workbenchGrid.getViewSize(this.panelPartView).width);
                    this.stateModel.setInitializationValue(LayoutStateKeys.PANEL_SIZE, panelSize);
                    // Auxiliary Bar Size
                    const auxiliaryBarSize = this.stateModel.getRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN)
                        ? this.workbenchGrid.getViewCachedVisibleSize(this.auxiliaryBarPartView)
                        : this.workbenchGrid.getViewSize(this.auxiliaryBarPartView).width;
                    this.stateModel.setInitializationValue(LayoutStateKeys.AUXILIARYBAR_SIZE, auxiliaryBarSize);
                    this.stateModel.save(true, true);
                }
            }));
        }
        getClientArea() {
            return (0, dom_1.getClientArea)(this.parent);
        }
        layout() {
            if (!this.disposed) {
                this._dimension = this.getClientArea();
                this.logService.trace(`Layout#layout, height: ${this._dimension.height}, width: ${this._dimension.width}`);
                (0, dom_1.position)(this.container, 0, 0, 0, 0, 'relative');
                (0, dom_1.size)(this.container, this._dimension.width, this._dimension.height);
                // Layout the grid widget
                this.workbenchGrid.layout(this._dimension.width, this._dimension.height);
                this.initialized = true;
                // Emit as event
                this._onDidLayout.fire(this._dimension);
            }
        }
        isEditorLayoutCentered() {
            return this.stateModel.getRuntimeValue(LayoutStateKeys.EDITOR_CENTERED);
        }
        centerEditorLayout(active, skipLayout) {
            this.stateModel.setRuntimeValue(LayoutStateKeys.EDITOR_CENTERED, active);
            const activeEditor = this.editorService.activeEditor;
            let isEditorComplex = false;
            if (activeEditor instanceof diffEditorInput_1.DiffEditorInput) {
                isEditorComplex = this.configurationService.getValue('diffEditor.renderSideBySide');
            }
            else if (activeEditor?.hasCapability(256 /* EditorInputCapabilities.MultipleEditors */)) {
                isEditorComplex = true;
            }
            const isCenteredLayoutAutoResizing = this.configurationService.getValue('workbench.editor.centeredLayoutAutoResize');
            if (isCenteredLayoutAutoResizing &&
                (this.editorGroupService.groups.length > 1 || isEditorComplex)) {
                active = false; // disable centered layout for complex editors or when there is more than one group
            }
            if (this.editorGroupService.isLayoutCentered() !== active) {
                this.editorGroupService.centerLayout(active);
                if (!skipLayout) {
                    this.layout();
                }
            }
            this._onDidChangeCenteredLayout.fire(this.stateModel.getRuntimeValue(LayoutStateKeys.EDITOR_CENTERED));
        }
        resizePart(part, sizeChangeWidth, sizeChangeHeight) {
            const sizeChangePxWidth = Math.sign(sizeChangeWidth) * (0, dom_1.computeScreenAwareSize)(Math.abs(sizeChangeWidth));
            const sizeChangePxHeight = Math.sign(sizeChangeHeight) * (0, dom_1.computeScreenAwareSize)(Math.abs(sizeChangeHeight));
            let viewSize;
            switch (part) {
                case "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */:
                    viewSize = this.workbenchGrid.getViewSize(this.sideBarPartView);
                    this.workbenchGrid.resizeView(this.sideBarPartView, {
                        width: viewSize.width + sizeChangePxWidth,
                        height: viewSize.height
                    });
                    break;
                case "workbench.parts.panel" /* Parts.PANEL_PART */:
                    viewSize = this.workbenchGrid.getViewSize(this.panelPartView);
                    this.workbenchGrid.resizeView(this.panelPartView, {
                        width: viewSize.width + (this.getPanelPosition() !== 2 /* Position.BOTTOM */ ? sizeChangePxWidth : 0),
                        height: viewSize.height + (this.getPanelPosition() !== 2 /* Position.BOTTOM */ ? 0 : sizeChangePxHeight)
                    });
                    break;
                case "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */:
                    viewSize = this.workbenchGrid.getViewSize(this.auxiliaryBarPartView);
                    this.workbenchGrid.resizeView(this.auxiliaryBarPartView, {
                        width: viewSize.width + sizeChangePxWidth,
                        height: viewSize.height
                    });
                    break;
                case "workbench.parts.editor" /* Parts.EDITOR_PART */:
                    viewSize = this.workbenchGrid.getViewSize(this.editorPartView);
                    // Single Editor Group
                    if (this.editorGroupService.count === 1) {
                        this.workbenchGrid.resizeView(this.editorPartView, {
                            width: viewSize.width + sizeChangePxWidth,
                            height: viewSize.height + sizeChangePxHeight
                        });
                    }
                    else {
                        const activeGroup = this.editorGroupService.activeGroup;
                        const { width, height } = this.editorGroupService.getSize(activeGroup);
                        this.editorGroupService.setSize(activeGroup, { width: width + sizeChangePxWidth, height: height + sizeChangePxHeight });
                        // After resizing the editor group
                        // if it does not change in either direction
                        // try resizing the full editor part
                        const { width: newWidth, height: newHeight } = this.editorGroupService.getSize(activeGroup);
                        if ((sizeChangePxHeight && height === newHeight) || (sizeChangePxWidth && width === newWidth)) {
                            this.workbenchGrid.resizeView(this.editorPartView, {
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
        setActivityBarHidden(hidden, skipLayout) {
            // Propagate to grid
            this.stateModel.setRuntimeValue(LayoutStateKeys.ACTIVITYBAR_HIDDEN, hidden);
            this.workbenchGrid.setViewVisible(this.activityBarPartView, !hidden);
        }
        setBannerHidden(hidden) {
            this.workbenchGrid.setViewVisible(this.bannerPartView, !hidden);
        }
        setEditorHidden(hidden, skipLayout) {
            this.stateModel.setRuntimeValue(LayoutStateKeys.EDITOR_HIDDEN, hidden);
            // Adjust CSS
            if (hidden) {
                this.container.classList.add(LayoutClasses.EDITOR_HIDDEN);
            }
            else {
                this.container.classList.remove(LayoutClasses.EDITOR_HIDDEN);
            }
            // Propagate to grid
            this.workbenchGrid.setViewVisible(this.editorPartView, !hidden);
            // The editor and panel cannot be hidden at the same time
            if (hidden && !this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */)) {
                this.setPanelHidden(false, true);
            }
        }
        getLayoutClasses() {
            return (0, arrays_1.coalesce)([
                !this.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */) ? LayoutClasses.SIDEBAR_HIDDEN : undefined,
                !this.isVisible("workbench.parts.editor" /* Parts.EDITOR_PART */) ? LayoutClasses.EDITOR_HIDDEN : undefined,
                !this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */) ? LayoutClasses.PANEL_HIDDEN : undefined,
                !this.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */) ? LayoutClasses.AUXILIARYBAR_HIDDEN : undefined,
                !this.isVisible("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */) ? LayoutClasses.STATUSBAR_HIDDEN : undefined,
                this.state.runtime.fullscreen ? LayoutClasses.FULLSCREEN : undefined
            ]);
        }
        setSideBarHidden(hidden, skipLayout) {
            this.stateModel.setRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN, hidden);
            // Adjust CSS
            if (hidden) {
                this.container.classList.add(LayoutClasses.SIDEBAR_HIDDEN);
            }
            else {
                this.container.classList.remove(LayoutClasses.SIDEBAR_HIDDEN);
            }
            // If sidebar becomes hidden, also hide the current active Viewlet if any
            if (hidden && this.paneCompositeService.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */)) {
                this.paneCompositeService.hideActivePaneComposite(0 /* ViewContainerLocation.Sidebar */);
                // Pass Focus to Editor or Panel if Sidebar is now hidden
                const activePanel = this.paneCompositeService.getActivePaneComposite(1 /* ViewContainerLocation.Panel */);
                if (this.hasFocus("workbench.parts.panel" /* Parts.PANEL_PART */) && activePanel) {
                    activePanel.focus();
                }
                else {
                    this.focus();
                }
            }
            // If sidebar becomes visible, show last active Viewlet or default viewlet
            else if (!hidden && !this.paneCompositeService.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */)) {
                const viewletToOpen = this.paneCompositeService.getLastActivePaneCompositeId(0 /* ViewContainerLocation.Sidebar */);
                if (viewletToOpen) {
                    const viewlet = this.paneCompositeService.openPaneComposite(viewletToOpen, 0 /* ViewContainerLocation.Sidebar */, true);
                    if (!viewlet) {
                        this.paneCompositeService.openPaneComposite(this.viewDescriptorService.getDefaultViewContainer(0 /* ViewContainerLocation.Sidebar */)?.id, 0 /* ViewContainerLocation.Sidebar */, true);
                    }
                }
            }
            // Propagate to grid
            this.workbenchGrid.setViewVisible(this.sideBarPartView, !hidden);
        }
        hasViews(id) {
            const viewContainer = this.viewDescriptorService.getViewContainerById(id);
            if (!viewContainer) {
                return false;
            }
            const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
            if (!viewContainerModel) {
                return false;
            }
            return viewContainerModel.activeViewDescriptors.length >= 1;
        }
        adjustPartPositions(sideBarPosition, panelAlignment, panelPosition) {
            // Move activity bar and side bars
            const sideBarSiblingToEditor = panelPosition !== 2 /* Position.BOTTOM */ || !(panelAlignment === 'center' || (sideBarPosition === 0 /* Position.LEFT */ && panelAlignment === 'right') || (sideBarPosition === 1 /* Position.RIGHT */ && panelAlignment === 'left'));
            const auxiliaryBarSiblingToEditor = panelPosition !== 2 /* Position.BOTTOM */ || !(panelAlignment === 'center' || (sideBarPosition === 1 /* Position.RIGHT */ && panelAlignment === 'right') || (sideBarPosition === 0 /* Position.LEFT */ && panelAlignment === 'left'));
            const preMovePanelWidth = !this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */) ? grid_1.Sizing.Invisible(this.workbenchGrid.getViewCachedVisibleSize(this.panelPartView) ?? this.panelPartView.minimumWidth) : this.workbenchGrid.getViewSize(this.panelPartView).width;
            const preMovePanelHeight = !this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */) ? grid_1.Sizing.Invisible(this.workbenchGrid.getViewCachedVisibleSize(this.panelPartView) ?? this.panelPartView.minimumHeight) : this.workbenchGrid.getViewSize(this.panelPartView).height;
            const preMoveSideBarSize = !this.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */) ? grid_1.Sizing.Invisible(this.workbenchGrid.getViewCachedVisibleSize(this.sideBarPartView) ?? this.sideBarPartView.minimumWidth) : this.workbenchGrid.getViewSize(this.sideBarPartView).width;
            const preMoveAuxiliaryBarSize = !this.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */) ? grid_1.Sizing.Invisible(this.workbenchGrid.getViewCachedVisibleSize(this.auxiliaryBarPartView) ?? this.auxiliaryBarPartView.minimumWidth) : this.workbenchGrid.getViewSize(this.auxiliaryBarPartView).width;
            if (sideBarPosition === 0 /* Position.LEFT */) {
                this.workbenchGrid.moveViewTo(this.activityBarPartView, [2, 0]);
                this.workbenchGrid.moveView(this.sideBarPartView, preMoveSideBarSize, sideBarSiblingToEditor ? this.editorPartView : this.activityBarPartView, sideBarSiblingToEditor ? 2 /* Direction.Left */ : 3 /* Direction.Right */);
                if (auxiliaryBarSiblingToEditor) {
                    this.workbenchGrid.moveView(this.auxiliaryBarPartView, preMoveAuxiliaryBarSize, this.editorPartView, 3 /* Direction.Right */);
                }
                else {
                    this.workbenchGrid.moveViewTo(this.auxiliaryBarPartView, [2, -1]);
                }
            }
            else {
                this.workbenchGrid.moveViewTo(this.activityBarPartView, [2, -1]);
                this.workbenchGrid.moveView(this.sideBarPartView, preMoveSideBarSize, sideBarSiblingToEditor ? this.editorPartView : this.activityBarPartView, sideBarSiblingToEditor ? 3 /* Direction.Right */ : 2 /* Direction.Left */);
                if (auxiliaryBarSiblingToEditor) {
                    this.workbenchGrid.moveView(this.auxiliaryBarPartView, preMoveAuxiliaryBarSize, this.editorPartView, 2 /* Direction.Left */);
                }
                else {
                    this.workbenchGrid.moveViewTo(this.auxiliaryBarPartView, [2, 0]);
                }
            }
            // We moved all the side parts based on the editor and ignored the panel
            // Now, we need to put the panel back in the right position when it is next to the editor
            if (panelPosition !== 2 /* Position.BOTTOM */) {
                this.workbenchGrid.moveView(this.panelPartView, preMovePanelWidth, this.editorPartView, panelPosition === 0 /* Position.LEFT */ ? 2 /* Direction.Left */ : 3 /* Direction.Right */);
                this.workbenchGrid.resizeView(this.panelPartView, {
                    height: preMovePanelHeight,
                    width: preMovePanelWidth
                });
            }
            // Moving views in the grid can cause them to re-distribute sizing unnecessarily
            // Resize visible parts to the width they were before the operation
            if (this.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */)) {
                this.workbenchGrid.resizeView(this.sideBarPartView, {
                    height: this.workbenchGrid.getViewSize(this.sideBarPartView).height,
                    width: preMoveSideBarSize
                });
            }
            if (this.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */)) {
                this.workbenchGrid.resizeView(this.auxiliaryBarPartView, {
                    height: this.workbenchGrid.getViewSize(this.auxiliaryBarPartView).height,
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
            this.stateModel.setRuntimeValue(LayoutStateKeys.PANEL_ALIGNMENT, alignment);
            this.adjustPartPositions(this.getSideBarPosition(), alignment, this.getPanelPosition());
            this._onDidChangePanelAlignment.fire(alignment);
        }
        setPanelHidden(hidden, skipLayout) {
            // Return if not initialized fully #105480
            if (!this.workbenchGrid) {
                return;
            }
            const wasHidden = !this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */);
            this.stateModel.setRuntimeValue(LayoutStateKeys.PANEL_HIDDEN, hidden);
            const isPanelMaximized = this.isPanelMaximized();
            const panelOpensMaximized = this.panelOpensMaximized();
            // Adjust CSS
            if (hidden) {
                this.container.classList.add(LayoutClasses.PANEL_HIDDEN);
            }
            else {
                this.container.classList.remove(LayoutClasses.PANEL_HIDDEN);
            }
            // If panel part becomes hidden, also hide the current active panel if any
            let focusEditor = false;
            if (hidden && this.paneCompositeService.getActivePaneComposite(1 /* ViewContainerLocation.Panel */)) {
                this.paneCompositeService.hideActivePaneComposite(1 /* ViewContainerLocation.Panel */);
                focusEditor = platform_1.isIOS ? false : true; // Do not auto focus on ios #127832
            }
            // If panel part becomes visible, show last active panel or default panel
            else if (!hidden && !this.paneCompositeService.getActivePaneComposite(1 /* ViewContainerLocation.Panel */)) {
                let panelToOpen = this.paneCompositeService.getLastActivePaneCompositeId(1 /* ViewContainerLocation.Panel */);
                // verify that the panel we try to open has views before we default to it
                // otherwise fall back to any view that has views still refs #111463
                if (!panelToOpen || !this.hasViews(panelToOpen)) {
                    panelToOpen = this.viewDescriptorService
                        .getViewContainersByLocation(1 /* ViewContainerLocation.Panel */)
                        .find(viewContainer => this.hasViews(viewContainer.id))?.id;
                }
                if (panelToOpen) {
                    const focus = !skipLayout;
                    this.paneCompositeService.openPaneComposite(panelToOpen, 1 /* ViewContainerLocation.Panel */, focus);
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
            this.workbenchGrid.setViewVisible(this.panelPartView, !hidden);
            // If in process of showing, toggle whether or not panel is maximized
            if (!hidden) {
                if (!skipLayout && isPanelMaximized !== panelOpensMaximized) {
                    this.toggleMaximizedPanel();
                }
            }
            else {
                // If in process of hiding, remember whether the panel is maximized or not
                this.stateModel.setRuntimeValue(LayoutStateKeys.PANEL_WAS_LAST_MAXIMIZED, isPanelMaximized);
            }
            if (focusEditor) {
                this.editorGroupService.activeGroup.focus(); // Pass focus to editor group if panel part is now hidden
            }
        }
        toggleMaximizedPanel() {
            const size = this.workbenchGrid.getViewSize(this.panelPartView);
            const panelPosition = this.getPanelPosition();
            const isMaximized = this.isPanelMaximized();
            if (!isMaximized) {
                if (this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */)) {
                    if (panelPosition === 2 /* Position.BOTTOM */) {
                        this.stateModel.setRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_HEIGHT, size.height);
                    }
                    else {
                        this.stateModel.setRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_WIDTH, size.width);
                    }
                }
                this.setEditorHidden(true);
            }
            else {
                this.setEditorHidden(false);
                this.workbenchGrid.resizeView(this.panelPartView, {
                    width: panelPosition === 2 /* Position.BOTTOM */ ? size.width : this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_WIDTH),
                    height: panelPosition === 2 /* Position.BOTTOM */ ? this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_HEIGHT) : size.height
                });
            }
            this.stateModel.setRuntimeValue(LayoutStateKeys.PANEL_WAS_LAST_MAXIMIZED, !isMaximized);
        }
        /**
         * Returns whether or not the panel opens maximized
         */
        panelOpensMaximized() {
            // The workbench grid currently prevents us from supporting panel maximization with non-center panel alignment
            if (this.getPanelAlignment() !== 'center' && this.getPanelPosition() === 2 /* Position.BOTTOM */) {
                return false;
            }
            const panelOpensMaximized = (0, layoutService_1.panelOpensMaximizedFromString)(this.configurationService.getValue(WorkbenchLayoutSettings.PANEL_OPENS_MAXIMIZED));
            const panelLastIsMaximized = this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_WAS_LAST_MAXIMIZED);
            return panelOpensMaximized === 0 /* PanelOpensMaximizedOptions.ALWAYS */ || (panelOpensMaximized === 2 /* PanelOpensMaximizedOptions.REMEMBER_LAST */ && panelLastIsMaximized);
        }
        setAuxiliaryBarHidden(hidden, skipLayout) {
            this.stateModel.setRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN, hidden);
            // Adjust CSS
            if (hidden) {
                this.container.classList.add(LayoutClasses.AUXILIARYBAR_HIDDEN);
            }
            else {
                this.container.classList.remove(LayoutClasses.AUXILIARYBAR_HIDDEN);
            }
            // If auxiliary bar becomes hidden, also hide the current active pane composite if any
            if (hidden && this.paneCompositeService.getActivePaneComposite(2 /* ViewContainerLocation.AuxiliaryBar */)) {
                this.paneCompositeService.hideActivePaneComposite(2 /* ViewContainerLocation.AuxiliaryBar */);
                // Pass Focus to Editor or Panel if Auxiliary Bar is now hidden
                const activePanel = this.paneCompositeService.getActivePaneComposite(1 /* ViewContainerLocation.Panel */);
                if (this.hasFocus("workbench.parts.panel" /* Parts.PANEL_PART */) && activePanel) {
                    activePanel.focus();
                }
                else {
                    this.focus();
                }
            }
            // If auxiliary bar becomes visible, show last active pane composite or default pane composite
            else if (!hidden && !this.paneCompositeService.getActivePaneComposite(2 /* ViewContainerLocation.AuxiliaryBar */)) {
                let panelToOpen = this.paneCompositeService.getLastActivePaneCompositeId(2 /* ViewContainerLocation.AuxiliaryBar */);
                // verify that the panel we try to open has views before we default to it
                // otherwise fall back to any view that has views still refs #111463
                if (!panelToOpen || !this.hasViews(panelToOpen)) {
                    panelToOpen = this.viewDescriptorService
                        .getViewContainersByLocation(2 /* ViewContainerLocation.AuxiliaryBar */)
                        .find(viewContainer => this.hasViews(viewContainer.id))?.id;
                }
                if (panelToOpen) {
                    const focus = !skipLayout;
                    this.paneCompositeService.openPaneComposite(panelToOpen, 2 /* ViewContainerLocation.AuxiliaryBar */, focus);
                }
            }
            // Propagate to grid
            this.workbenchGrid.setViewVisible(this.auxiliaryBarPartView, !hidden);
        }
        setPartHidden(hidden, part) {
            switch (part) {
                case "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */:
                    return this.setActivityBarHidden(hidden);
                case "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */:
                    return this.setSideBarHidden(hidden);
                case "workbench.parts.editor" /* Parts.EDITOR_PART */:
                    return this.setEditorHidden(hidden);
                case "workbench.parts.banner" /* Parts.BANNER_PART */:
                    return this.setBannerHidden(hidden);
                case "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */:
                    return this.setAuxiliaryBarHidden(hidden);
                case "workbench.parts.panel" /* Parts.PANEL_PART */:
                    return this.setPanelHidden(hidden);
            }
        }
        hasWindowBorder() {
            return this.state.runtime.windowBorder;
        }
        getWindowBorderWidth() {
            return this.state.runtime.windowBorder ? 2 : 0;
        }
        getWindowBorderRadius() {
            return this.state.runtime.windowBorder && platform_1.isMacintosh ? '5px' : undefined;
        }
        isPanelMaximized() {
            // the workbench grid currently prevents us from supporting panel maximization with non-center panel alignment
            return (this.getPanelAlignment() === 'center' || this.getPanelPosition() !== 2 /* Position.BOTTOM */) && !this.isVisible("workbench.parts.editor" /* Parts.EDITOR_PART */);
        }
        getSideBarPosition() {
            return this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_POSITON);
        }
        getPanelAlignment() {
            return this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_ALIGNMENT);
        }
        updateMenubarVisibility(skipLayout) {
            const shouldShowTitleBar = this.shouldShowTitleBar();
            if (!skipLayout && this.workbenchGrid && shouldShowTitleBar !== this.isVisible("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */)) {
                this.workbenchGrid.setViewVisible(this.titleBarPartView, shouldShowTitleBar);
            }
        }
        toggleMenuBar() {
            let currentVisibilityValue = (0, window_1.getMenuBarVisibility)(this.configurationService);
            if (typeof currentVisibilityValue !== 'string') {
                currentVisibilityValue = 'classic';
            }
            let newVisibilityValue;
            if (currentVisibilityValue === 'visible' || currentVisibilityValue === 'classic') {
                newVisibilityValue = (0, window_1.getTitleBarStyle)(this.configurationService) === 'native' ? 'toggle' : 'compact';
            }
            else {
                newVisibilityValue = 'classic';
            }
            this.configurationService.updateValue('window.menuBarVisibility', newVisibilityValue);
        }
        getPanelPosition() {
            return this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_POSITION);
        }
        setPanelPosition(position) {
            if (!this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */)) {
                this.setPanelHidden(false);
            }
            const panelPart = this.getPart("workbench.parts.panel" /* Parts.PANEL_PART */);
            const oldPositionValue = (0, layoutService_1.positionToString)(this.getPanelPosition());
            const newPositionValue = (0, layoutService_1.positionToString)(position);
            // Adjust CSS
            const panelContainer = (0, types_1.assertIsDefined)(panelPart.getContainer());
            panelContainer.classList.remove(oldPositionValue);
            panelContainer.classList.add(newPositionValue);
            // Update Styles
            panelPart.updateStyles();
            // Layout
            const size = this.workbenchGrid.getViewSize(this.panelPartView);
            const sideBarSize = this.workbenchGrid.getViewSize(this.sideBarPartView);
            const auxiliaryBarSize = this.workbenchGrid.getViewSize(this.auxiliaryBarPartView);
            let editorHidden = !this.isVisible("workbench.parts.editor" /* Parts.EDITOR_PART */);
            // Save last non-maximized size for panel before move
            if (newPositionValue !== oldPositionValue && !editorHidden) {
                // Save the current size of the panel for the new orthogonal direction
                // If moving down, save the width of the panel
                // Otherwise, save the height of the panel
                if (position === 2 /* Position.BOTTOM */) {
                    this.stateModel.setRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_WIDTH, size.width);
                }
                else if ((0, layoutService_1.positionFromString)(oldPositionValue) === 2 /* Position.BOTTOM */) {
                    this.stateModel.setRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_HEIGHT, size.height);
                }
            }
            if (position === 2 /* Position.BOTTOM */ && this.getPanelAlignment() !== 'center' && editorHidden) {
                this.toggleMaximizedPanel();
                editorHidden = false;
            }
            this.stateModel.setRuntimeValue(LayoutStateKeys.PANEL_POSITION, position);
            const sideBarVisible = this.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
            const auxiliaryBarVisible = this.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
            if (position === 2 /* Position.BOTTOM */) {
                this.workbenchGrid.moveView(this.panelPartView, editorHidden ? size.height : this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_HEIGHT), this.editorPartView, 1 /* Direction.Down */);
            }
            else if (position === 1 /* Position.RIGHT */) {
                this.workbenchGrid.moveView(this.panelPartView, editorHidden ? size.width : this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_WIDTH), this.editorPartView, 3 /* Direction.Right */);
            }
            else {
                this.workbenchGrid.moveView(this.panelPartView, editorHidden ? size.width : this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_WIDTH), this.editorPartView, 2 /* Direction.Left */);
            }
            // Reset sidebar to original size before shifting the panel
            this.workbenchGrid.resizeView(this.sideBarPartView, sideBarSize);
            if (!sideBarVisible) {
                this.setSideBarHidden(true);
            }
            this.workbenchGrid.resizeView(this.auxiliaryBarPartView, auxiliaryBarSize);
            if (!auxiliaryBarVisible) {
                this.setAuxiliaryBarHidden(true);
            }
            if (position === 2 /* Position.BOTTOM */) {
                this.adjustPartPositions(this.getSideBarPosition(), this.getPanelAlignment(), position);
            }
            this._onDidChangePanelPosition.fire(newPositionValue);
        }
        isWindowMaximized() {
            return this.state.runtime.maximized;
        }
        updateWindowMaximizedState(maximized) {
            this.container.classList.toggle(LayoutClasses.MAXIMIZED, maximized);
            if (this.state.runtime.maximized === maximized) {
                return;
            }
            this.state.runtime.maximized = maximized;
            this.updateWindowBorder();
            this._onDidChangeWindowMaximized.fire(maximized);
        }
        getVisibleNeighborPart(part, direction) {
            if (!this.workbenchGrid) {
                return undefined;
            }
            if (!this.isVisible(part)) {
                return undefined;
            }
            const neighborViews = this.workbenchGrid.getNeighborViews(this.getPart(part), direction, false);
            if (!neighborViews) {
                return undefined;
            }
            for (const neighborView of neighborViews) {
                const neighborPart = ["workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */, "workbench.parts.editor" /* Parts.EDITOR_PART */, "workbench.parts.panel" /* Parts.PANEL_PART */, "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */, "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */, "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */, "workbench.parts.titlebar" /* Parts.TITLEBAR_PART */]
                    .find(partId => this.getPart(partId) === neighborView && this.isVisible(partId));
                if (neighborPart !== undefined) {
                    return neighborPart;
                }
            }
            return undefined;
        }
        onDidChangeWCO() {
            const bannerFirst = this.workbenchGrid.getNeighborViews(this.titleBarPartView, 0 /* Direction.Up */, false).length > 0;
            const shouldBannerBeFirst = this.shouldShowBannerFirst();
            if (bannerFirst !== shouldBannerBeFirst) {
                this.workbenchGrid.moveView(this.bannerPartView, grid_1.Sizing.Distribute, this.titleBarPartView, shouldBannerBeFirst ? 0 /* Direction.Up */ : 1 /* Direction.Down */);
            }
            this.workbenchGrid.setViewVisible(this.titleBarPartView, this.shouldShowTitleBar());
        }
        arrangeEditorNodes(nodes, availableHeight, availableWidth) {
            if (!nodes.sideBar && !nodes.auxiliaryBar) {
                nodes.editor.size = availableHeight;
                return nodes.editor;
            }
            const result = [nodes.editor];
            nodes.editor.size = availableWidth;
            if (nodes.sideBar) {
                if (this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_POSITON) === 0 /* Position.LEFT */) {
                    result.splice(0, 0, nodes.sideBar);
                }
                else {
                    result.push(nodes.sideBar);
                }
                nodes.editor.size -= this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN) ? 0 : nodes.sideBar.size;
            }
            if (nodes.auxiliaryBar) {
                if (this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_POSITON) === 1 /* Position.RIGHT */) {
                    result.splice(0, 0, nodes.auxiliaryBar);
                }
                else {
                    result.push(nodes.auxiliaryBar);
                }
                nodes.editor.size -= this.stateModel.getRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN) ? 0 : nodes.auxiliaryBar.size;
            }
            return {
                type: 'branch',
                data: result,
                size: availableHeight
            };
        }
        arrangeMiddleSectionNodes(nodes, availableWidth, availableHeight) {
            const activityBarSize = this.stateModel.getRuntimeValue(LayoutStateKeys.ACTIVITYBAR_HIDDEN) ? 0 : nodes.activityBar.size;
            const sideBarSize = this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN) ? 0 : nodes.sideBar.size;
            const auxiliaryBarSize = this.stateModel.getRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN) ? 0 : nodes.auxiliaryBar.size;
            const panelSize = this.stateModel.getInitializationValue(LayoutStateKeys.PANEL_SIZE) ? 0 : nodes.panel.size;
            const result = [];
            if (this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_POSITION) !== 2 /* Position.BOTTOM */) {
                result.push(nodes.editor);
                nodes.editor.size = availableWidth - activityBarSize - sideBarSize - panelSize - auxiliaryBarSize;
                if (this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_POSITION) === 1 /* Position.RIGHT */) {
                    result.push(nodes.panel);
                }
                else {
                    result.splice(0, 0, nodes.panel);
                }
                if (this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_POSITON) === 0 /* Position.LEFT */) {
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
                const panelAlignment = this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_ALIGNMENT);
                const sideBarPosition = this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_POSITON);
                const sideBarNextToEditor = !(panelAlignment === 'center' || (sideBarPosition === 0 /* Position.LEFT */ && panelAlignment === 'right') || (sideBarPosition === 1 /* Position.RIGHT */ && panelAlignment === 'left'));
                const auxiliaryBarNextToEditor = !(panelAlignment === 'center' || (sideBarPosition === 1 /* Position.RIGHT */ && panelAlignment === 'right') || (sideBarPosition === 0 /* Position.LEFT */ && panelAlignment === 'left'));
                const editorSectionWidth = availableWidth - activityBarSize - (sideBarNextToEditor ? 0 : sideBarSize) - (auxiliaryBarNextToEditor ? 0 : auxiliaryBarSize);
                result.push({
                    type: 'branch',
                    data: [this.arrangeEditorNodes({
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
        createGridDescriptor() {
            const { width, height } = this.stateModel.getInitializationValue(LayoutStateKeys.GRID_SIZE);
            const sideBarSize = this.stateModel.getInitializationValue(LayoutStateKeys.SIDEBAR_SIZE);
            const auxiliaryBarPartSize = this.stateModel.getInitializationValue(LayoutStateKeys.AUXILIARYBAR_SIZE);
            const panelSize = this.stateModel.getInitializationValue(LayoutStateKeys.PANEL_SIZE);
            const titleBarHeight = this.titleBarPartView.minimumHeight;
            const bannerHeight = this.bannerPartView.minimumHeight;
            const statusBarHeight = this.statusBarPartView.minimumHeight;
            const activityBarWidth = this.activityBarPartView.minimumWidth;
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
                visible: !this.stateModel.getRuntimeValue(LayoutStateKeys.ACTIVITYBAR_HIDDEN)
            };
            const sideBarNode = {
                type: 'leaf',
                data: { type: "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */ },
                size: sideBarSize,
                visible: !this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN)
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
                visible: !this.stateModel.getRuntimeValue(LayoutStateKeys.EDITOR_HIDDEN)
            };
            const panelNode = {
                type: 'leaf',
                data: { type: "workbench.parts.panel" /* Parts.PANEL_PART */ },
                size: panelSize,
                visible: !this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_HIDDEN)
            };
            const middleSection = this.arrangeMiddleSectionNodes({
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
                        ...(this.shouldShowBannerFirst() ? titleAndBanner.reverse() : titleAndBanner),
                        {
                            type: 'branch',
                            data: middleSection,
                            size: middleSectionHeight
                        },
                        {
                            type: 'leaf',
                            data: { type: "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */ },
                            size: statusBarHeight,
                            visible: !this.stateModel.getRuntimeValue(LayoutStateKeys.STATUSBAR_HIDDEN)
                        }
                    ]
                },
                orientation: 0 /* Orientation.VERTICAL */,
                width,
                height
            };
            const layoutDescriptor = {
                activityBarVisible: !this.stateModel.getRuntimeValue(LayoutStateKeys.ACTIVITYBAR_HIDDEN),
                sideBarVisible: !this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN),
                auxiliaryBarVisible: !this.stateModel.getRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN),
                panelVisible: !this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_HIDDEN),
                statusbarVisible: !this.stateModel.getRuntimeValue(LayoutStateKeys.STATUSBAR_HIDDEN),
                sideBarPosition: (0, layoutService_1.positionToString)(this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_POSITON)),
                panelPosition: (0, layoutService_1.positionToString)(this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_POSITION)),
            };
            this.telemetryService.publicLog2('startupLayout', layoutDescriptor);
            return result;
        }
        dispose() {
            super.dispose();
            this.disposed = true;
        }
    }
    exports.Layout = Layout;
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
    class LayoutStateModel extends lifecycle_1.Disposable {
        static { this.STORAGE_PREFIX = 'workbench.'; }
        constructor(storageService, configurationService, contextService, container) {
            super();
            this.storageService = storageService;
            this.configurationService = configurationService;
            this.contextService = contextService;
            this.container = container;
            this._onDidChangeState = this._register(new event_1.Emitter());
            this.onDidChangeState = this._onDidChangeState.event;
            this.stateCache = new Map();
            this._register(this.configurationService.onDidChangeConfiguration(configurationChange => this.updateStateFromLegacySettings(configurationChange)));
        }
        updateStateFromLegacySettings(configurationChangeEvent) {
            const isZenMode = this.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE);
            if (configurationChangeEvent.affectsConfiguration(LegacyWorkbenchLayoutSettings.ACTIVITYBAR_VISIBLE) && !isZenMode) {
                this.setRuntimeValueAndFire(LayoutStateKeys.ACTIVITYBAR_HIDDEN, !this.configurationService.getValue(LegacyWorkbenchLayoutSettings.ACTIVITYBAR_VISIBLE));
            }
            if (configurationChangeEvent.affectsConfiguration(LegacyWorkbenchLayoutSettings.STATUSBAR_VISIBLE) && !isZenMode) {
                this.setRuntimeValueAndFire(LayoutStateKeys.STATUSBAR_HIDDEN, !this.configurationService.getValue(LegacyWorkbenchLayoutSettings.STATUSBAR_VISIBLE));
            }
            if (configurationChangeEvent.affectsConfiguration(LegacyWorkbenchLayoutSettings.SIDEBAR_POSITION)) {
                this.setRuntimeValueAndFire(LayoutStateKeys.SIDEBAR_POSITON, (0, layoutService_1.positionFromString)(this.configurationService.getValue(LegacyWorkbenchLayoutSettings.SIDEBAR_POSITION) ?? 'left'));
            }
        }
        updateLegacySettingsFromState(key, value) {
            const isZenMode = this.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE);
            if (key.zenModeIgnore && isZenMode) {
                return;
            }
            if (key === LayoutStateKeys.ACTIVITYBAR_HIDDEN) {
                this.configurationService.updateValue(LegacyWorkbenchLayoutSettings.ACTIVITYBAR_VISIBLE, !value);
            }
            else if (key === LayoutStateKeys.STATUSBAR_HIDDEN) {
                this.configurationService.updateValue(LegacyWorkbenchLayoutSettings.STATUSBAR_VISIBLE, !value);
            }
            else if (key === LayoutStateKeys.SIDEBAR_POSITON) {
                this.configurationService.updateValue(LegacyWorkbenchLayoutSettings.SIDEBAR_POSITION, (0, layoutService_1.positionToString)(value));
            }
        }
        load() {
            let key;
            // Load stored values for all keys
            for (key in LayoutStateKeys) {
                const stateKey = LayoutStateKeys[key];
                const value = this.loadKeyFromStorage(stateKey);
                if (value !== undefined) {
                    this.stateCache.set(stateKey.name, value);
                }
            }
            // Apply legacy settings
            this.stateCache.set(LayoutStateKeys.ACTIVITYBAR_HIDDEN.name, !this.configurationService.getValue(LegacyWorkbenchLayoutSettings.ACTIVITYBAR_VISIBLE));
            this.stateCache.set(LayoutStateKeys.STATUSBAR_HIDDEN.name, !this.configurationService.getValue(LegacyWorkbenchLayoutSettings.STATUSBAR_VISIBLE));
            this.stateCache.set(LayoutStateKeys.SIDEBAR_POSITON.name, (0, layoutService_1.positionFromString)(this.configurationService.getValue(LegacyWorkbenchLayoutSettings.SIDEBAR_POSITION) ?? 'left'));
            // Set dynamic defaults: part sizing and side bar visibility
            const workbenchDimensions = (0, dom_1.getClientArea)(this.container);
            LayoutStateKeys.PANEL_POSITION.defaultValue = (0, layoutService_1.positionFromString)(this.configurationService.getValue(WorkbenchLayoutSettings.PANEL_POSITION) ?? 'bottom');
            LayoutStateKeys.GRID_SIZE.defaultValue = { height: workbenchDimensions.height, width: workbenchDimensions.width };
            LayoutStateKeys.SIDEBAR_SIZE.defaultValue = Math.min(300, workbenchDimensions.width / 4);
            LayoutStateKeys.AUXILIARYBAR_SIZE.defaultValue = Math.min(300, workbenchDimensions.width / 4);
            LayoutStateKeys.PANEL_SIZE.defaultValue = (this.stateCache.get(LayoutStateKeys.PANEL_POSITION.name) ?? LayoutStateKeys.PANEL_POSITION.defaultValue) === 'bottom' ? workbenchDimensions.height / 3 : workbenchDimensions.width / 4;
            LayoutStateKeys.SIDEBAR_HIDDEN.defaultValue = this.contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */;
            // Apply all defaults
            for (key in LayoutStateKeys) {
                const stateKey = LayoutStateKeys[key];
                if (this.stateCache.get(stateKey.name) === undefined) {
                    this.stateCache.set(stateKey.name, stateKey.defaultValue);
                }
            }
            // Register for runtime key changes
            this._register(this.storageService.onDidChangeValue(0 /* StorageScope.PROFILE */, undefined, this._register(new lifecycle_1.DisposableStore()))(storageChangeEvent => {
                let key;
                for (key in LayoutStateKeys) {
                    const stateKey = LayoutStateKeys[key];
                    if (stateKey instanceof RuntimeStateKey && stateKey.scope === 0 /* StorageScope.PROFILE */ && stateKey.target === 0 /* StorageTarget.USER */) {
                        if (`${LayoutStateModel.STORAGE_PREFIX}${stateKey.name}` === storageChangeEvent.key) {
                            const value = this.loadKeyFromStorage(stateKey) ?? stateKey.defaultValue;
                            if (this.stateCache.get(stateKey.name) !== value) {
                                this.stateCache.set(stateKey.name, value);
                                this._onDidChangeState.fire({ key: stateKey, value });
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
                    this.saveKeyToStorage(stateKey);
                }
            }
        }
        getInitializationValue(key) {
            return this.stateCache.get(key.name);
        }
        setInitializationValue(key, value) {
            this.stateCache.set(key.name, value);
        }
        getRuntimeValue(key, fallbackToSetting) {
            if (fallbackToSetting) {
                switch (key) {
                    case LayoutStateKeys.ACTIVITYBAR_HIDDEN:
                        this.stateCache.set(key.name, !this.configurationService.getValue(LegacyWorkbenchLayoutSettings.ACTIVITYBAR_VISIBLE));
                        break;
                    case LayoutStateKeys.STATUSBAR_HIDDEN:
                        this.stateCache.set(key.name, !this.configurationService.getValue(LegacyWorkbenchLayoutSettings.STATUSBAR_VISIBLE));
                        break;
                    case LayoutStateKeys.SIDEBAR_POSITON:
                        this.stateCache.set(key.name, this.configurationService.getValue(LegacyWorkbenchLayoutSettings.SIDEBAR_POSITION) ?? 'left');
                        break;
                }
            }
            return this.stateCache.get(key.name);
        }
        setRuntimeValue(key, value) {
            this.stateCache.set(key.name, value);
            const isZenMode = this.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE);
            if (key.scope === 0 /* StorageScope.PROFILE */) {
                if (!isZenMode || !key.zenModeIgnore) {
                    this.saveKeyToStorage(key);
                    this.updateLegacySettingsFromState(key, value);
                }
            }
        }
        setRuntimeValueAndFire(key, value) {
            const previousValue = this.stateCache.get(key.name);
            if (previousValue === value) {
                return;
            }
            this.setRuntimeValue(key, value);
            this._onDidChangeState.fire({ key, value });
        }
        saveKeyToStorage(key) {
            const value = this.stateCache.get(key.name);
            this.storageService.store(`${LayoutStateModel.STORAGE_PREFIX}${key.name}`, typeof value === 'object' ? JSON.stringify(value) : value, key.scope, key.target);
        }
        loadKeyFromStorage(key) {
            let value = this.storageService.get(`${LayoutStateModel.STORAGE_PREFIX}${key.name}`, key.scope);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvbGF5b3V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQTJGaEcsSUFBSyxhQVNKO0lBVEQsV0FBSyxhQUFhO1FBQ2pCLDZDQUE0QixDQUFBO1FBQzVCLCtDQUE4QixDQUFBO1FBQzlCLHlDQUF3QixDQUFBO1FBQ3hCLHVEQUFzQyxDQUFBO1FBQ3RDLGlEQUFnQyxDQUFBO1FBQ2hDLDBDQUF5QixDQUFBO1FBQ3pCLHdDQUF1QixDQUFBO1FBQ3ZCLHlDQUF3QixDQUFBO0lBQ3pCLENBQUMsRUFUSSxhQUFhLEtBQWIsYUFBYSxRQVNqQjtJQWNELE1BQXNCLE1BQU8sU0FBUSxzQkFBVTtRQXlDOUMsSUFBSSxTQUFTLEtBQWlCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFFdkQsSUFBSSxNQUFNO1lBQ1QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQ1osSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDO1lBQ3JCLElBQUksSUFBSSxDQUFDLFNBQVMsa0RBQW1CLEVBQUU7Z0JBQ3RDLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxrREFBbUIsQ0FBQyxhQUFhLENBQUM7Z0JBQ3BELFlBQVksR0FBRyxHQUFHLENBQUM7YUFDbkI7WUFDRCxJQUFJLElBQUksQ0FBQyxTQUFTLHNEQUFxQixFQUFFO2dCQUN4QyxHQUFHLElBQUksSUFBSSxDQUFDLE9BQU8sc0RBQXFCLENBQUMsYUFBYSxDQUFDO2dCQUN2RCxZQUFZLEdBQUcsR0FBRyxDQUFDO2FBQ25CO1lBQ0QsbUdBQW1HO1lBQ25HLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxzQkFBc0IsRUFBRTtnQkFDN0MsWUFBWSxHQUFHLENBQUMsQ0FBQzthQUNqQjtZQUNELE9BQU8sRUFBRSxHQUFHLEVBQUUs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