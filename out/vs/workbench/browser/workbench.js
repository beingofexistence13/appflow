/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/event", "vs/base/common/async", "vs/base/browser/browser", "vs/base/common/performance", "vs/base/common/errors", "vs/platform/registry/common/platform", "vs/base/common/platform", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/platform/instantiation/common/extensions", "vs/workbench/services/layout/browser/layoutService", "vs/platform/storage/common/storage", "vs/platform/configuration/common/configuration", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/notification/common/notification", "vs/workbench/browser/parts/notifications/notificationsCenter", "vs/workbench/browser/parts/notifications/notificationsAlerts", "vs/workbench/browser/parts/notifications/notificationsStatus", "vs/workbench/browser/parts/notifications/notificationsTelemetry", "vs/workbench/browser/parts/notifications/notificationsCommands", "vs/workbench/browser/parts/notifications/notificationsToasts", "vs/base/browser/ui/aria/aria", "vs/editor/browser/config/fontMeasurements", "vs/editor/common/config/fontInfo", "vs/base/common/errorMessage", "vs/workbench/browser/contextkeys", "vs/base/common/arrays", "vs/platform/instantiation/common/instantiationService", "vs/workbench/browser/layout", "vs/workbench/services/host/browser/host", "vs/platform/dialogs/common/dialogs", "vs/workbench/browser/style"], function (require, exports, nls_1, event_1, async_1, browser_1, performance_1, errors_1, platform_1, platform_2, contributions_1, editor_1, extensions_1, layoutService_1, storage_1, configuration_1, lifecycle_1, notification_1, notificationsCenter_1, notificationsAlerts_1, notificationsStatus_1, notificationsTelemetry_1, notificationsCommands_1, notificationsToasts_1, aria_1, fontMeasurements_1, fontInfo_1, errorMessage_1, contextkeys_1, arrays_1, instantiationService_1, layout_1, host_1, dialogs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Workbench = void 0;
    class Workbench extends layout_1.Layout {
        constructor(parent, options, serviceCollection, logService) {
            super(parent);
            this.options = options;
            this.serviceCollection = serviceCollection;
            this._onWillShutdown = this._register(new event_1.Emitter());
            this.onWillShutdown = this._onWillShutdown.event;
            this._onDidShutdown = this._register(new event_1.Emitter());
            this.onDidShutdown = this._onDidShutdown.event;
            this.previousUnexpectedError = { message: undefined, time: 0 };
            // Perf: measure workbench startup time
            (0, performance_1.mark)('code/willStartWorkbench');
            this.registerErrorHandler(logService);
        }
        registerErrorHandler(logService) {
            // Listen on unhandled rejection events
            window.addEventListener('unhandledrejection', (event) => {
                // See https://developer.mozilla.org/en-US/docs/Web/API/PromiseRejectionEvent
                (0, errors_1.onUnexpectedError)(event.reason);
                // Prevent the printing of this event to the console
                event.preventDefault();
            });
            // Install handler for unexpected errors
            (0, errors_1.setUnexpectedErrorHandler)(error => this.handleUnexpectedError(error, logService));
            if (typeof window.require?.config === 'function') {
                window.require.config({
                    onError: (err) => {
                        if (err.phase === 'loading') {
                            (0, errors_1.onUnexpectedError)(new Error((0, nls_1.localize)('loaderErrorNative', "Failed to load a required file. Please restart the application to try again. Details: {0}", JSON.stringify(err))));
                        }
                        console.error(err);
                    }
                });
            }
        }
        handleUnexpectedError(error, logService) {
            const message = (0, errorMessage_1.toErrorMessage)(error, true);
            if (!message) {
                return;
            }
            const now = Date.now();
            if (message === this.previousUnexpectedError.message && now - this.previousUnexpectedError.time <= 1000) {
                return; // Return if error message identical to previous and shorter than 1 second
            }
            this.previousUnexpectedError.time = now;
            this.previousUnexpectedError.message = message;
            // Log it
            logService.error(message);
        }
        startup() {
            try {
                // Configure emitter leak warning threshold
                (0, event_1.setGlobalLeakWarningThreshold)(175);
                // Services
                const instantiationService = this.initServices(this.serviceCollection);
                instantiationService.invokeFunction(accessor => {
                    const lifecycleService = accessor.get(lifecycle_1.ILifecycleService);
                    const storageService = accessor.get(storage_1.IStorageService);
                    const configurationService = accessor.get(configuration_1.IConfigurationService);
                    const hostService = accessor.get(host_1.IHostService);
                    const dialogService = accessor.get(dialogs_1.IDialogService);
                    const notificationService = accessor.get(notification_1.INotificationService);
                    // Layout
                    this.initLayout(accessor);
                    // Registries
                    platform_1.Registry.as(contributions_1.Extensions.Workbench).start(accessor);
                    platform_1.Registry.as(editor_1.EditorExtensions.EditorFactory).start(accessor);
                    // Context Keys
                    this._register(instantiationService.createInstance(contextkeys_1.WorkbenchContextKeysHandler));
                    // Register Listeners
                    this.registerListeners(lifecycleService, storageService, configurationService, hostService, dialogService);
                    // Render Workbench
                    this.renderWorkbench(instantiationService, notificationService, storageService, configurationService);
                    // Workbench Layout
                    this.createWorkbenchLayout();
                    // Layout
                    this.layout();
                    // Restore
                    this.restore(lifecycleService);
                });
                return instantiationService;
            }
            catch (error) {
                (0, errors_1.onUnexpectedError)(error);
                throw error; // rethrow because this is a critical issue we cannot handle properly here
            }
        }
        initServices(serviceCollection) {
            // Layout Service
            serviceCollection.set(layoutService_1.IWorkbenchLayoutService, this);
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            //
            // NOTE: Please do NOT register services here. Use `registerSingleton()`
            //       from `workbench.common.main.ts` if the service is shared between
            //       desktop and web or `workbench.desktop.main.ts` if the service
            //       is desktop only.
            //
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            // All Contributed Services
            const contributedServices = (0, extensions_1.getSingletonServiceDescriptors)();
            for (const [id, descriptor] of contributedServices) {
                serviceCollection.set(id, descriptor);
            }
            const instantiationService = new instantiationService_1.InstantiationService(serviceCollection, true);
            // Wrap up
            instantiationService.invokeFunction(accessor => {
                const lifecycleService = accessor.get(lifecycle_1.ILifecycleService);
                // TODO@Sandeep debt around cyclic dependencies
                const configurationService = accessor.get(configuration_1.IConfigurationService);
                if (typeof configurationService.acquireInstantiationService === 'function') {
                    configurationService.acquireInstantiationService(instantiationService);
                }
                // Signal to lifecycle that services are set
                lifecycleService.phase = 2 /* LifecyclePhase.Ready */;
            });
            return instantiationService;
        }
        registerListeners(lifecycleService, storageService, configurationService, hostService, dialogService) {
            // Configuration changes
            this._register(configurationService.onDidChangeConfiguration(e => this.updateFontAliasing(e, configurationService)));
            // Font Info
            if (platform_2.isNative) {
                this._register(storageService.onWillSaveState(e => {
                    if (e.reason === storage_1.WillSaveStateReason.SHUTDOWN) {
                        this.storeFontInfo(storageService);
                    }
                }));
            }
            else {
                this._register(lifecycleService.onWillShutdown(() => this.storeFontInfo(storageService)));
            }
            // Lifecycle
            this._register(lifecycleService.onWillShutdown(event => this._onWillShutdown.fire(event)));
            this._register(lifecycleService.onDidShutdown(() => {
                this._onDidShutdown.fire();
                this.dispose();
            }));
            // In some environments we do not get enough time to persist state on shutdown.
            // In other cases, VSCode might crash, so we periodically save state to reduce
            // the chance of loosing any state.
            // The window loosing focus is a good indication that the user has stopped working
            // in that window so we pick that at a time to collect state.
            this._register(hostService.onDidChangeFocus(focus => {
                if (!focus) {
                    storageService.flush();
                }
            }));
            // Dialogs showing/hiding
            this._register(dialogService.onWillShowDialog(() => this.container.classList.add('modal-dialog-visible')));
            this._register(dialogService.onDidShowDialog(() => this.container.classList.remove('modal-dialog-visible')));
        }
        updateFontAliasing(e, configurationService) {
            if (!platform_2.isMacintosh) {
                return; // macOS only
            }
            if (e && !e.affectsConfiguration('workbench.fontAliasing')) {
                return;
            }
            const aliasing = configurationService.getValue('workbench.fontAliasing');
            if (this.fontAliasing === aliasing) {
                return;
            }
            this.fontAliasing = aliasing;
            // Remove all
            const fontAliasingValues = ['antialiased', 'none', 'auto'];
            this.container.classList.remove(...fontAliasingValues.map(value => `monaco-font-aliasing-${value}`));
            // Add specific
            if (fontAliasingValues.some(option => option === aliasing)) {
                this.container.classList.add(`monaco-font-aliasing-${aliasing}`);
            }
        }
        restoreFontInfo(storageService, configurationService) {
            const storedFontInfoRaw = storageService.get('editorFontInfo', -1 /* StorageScope.APPLICATION */);
            if (storedFontInfoRaw) {
                try {
                    const storedFontInfo = JSON.parse(storedFontInfoRaw);
                    if (Array.isArray(storedFontInfo)) {
                        fontMeasurements_1.FontMeasurements.restoreFontInfo(storedFontInfo);
                    }
                }
                catch (err) {
                    /* ignore */
                }
            }
            fontMeasurements_1.FontMeasurements.readFontInfo(fontInfo_1.BareFontInfo.createFromRawSettings(configurationService.getValue('editor'), browser_1.PixelRatio.value));
        }
        storeFontInfo(storageService) {
            const serializedFontInfo = fontMeasurements_1.FontMeasurements.serializeFontInfo();
            if (serializedFontInfo) {
                storageService.store('editorFontInfo', JSON.stringify(serializedFontInfo), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
        }
        renderWorkbench(instantiationService, notificationService, storageService, configurationService) {
            // ARIA
            (0, aria_1.setARIAContainer)(this.container);
            // State specific classes
            const platformClass = platform_2.isWindows ? 'windows' : platform_2.isLinux ? 'linux' : 'mac';
            const workbenchClasses = (0, arrays_1.coalesce)([
                'monaco-workbench',
                platformClass,
                platform_2.isWeb ? 'web' : undefined,
                browser_1.isChrome ? 'chromium' : browser_1.isFirefox ? 'firefox' : browser_1.isSafari ? 'safari' : undefined,
                ...this.getLayoutClasses(),
                ...(this.options?.extraClasses ? this.options.extraClasses : [])
            ]);
            this.container.classList.add(...workbenchClasses);
            document.body.classList.add(platformClass); // used by our fonts
            if (platform_2.isWeb) {
                document.body.classList.add('web');
            }
            // Apply font aliasing
            this.updateFontAliasing(undefined, configurationService);
            // Warm up font cache information before building up too many dom elements
            this.restoreFontInfo(storageService, configurationService);
            // Create Parts
            for (const { id, role, classes, options } of [
                { id: "workbench.parts.titlebar" /* Parts.TITLEBAR_PART */, role: 'none', classes: ['titlebar'] },
                { id: "workbench.parts.banner" /* Parts.BANNER_PART */, role: 'banner', classes: ['banner'] },
                { id: "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */, role: 'none', classes: ['activitybar', this.getSideBarPosition() === 0 /* Position.LEFT */ ? 'left' : 'right'] },
                { id: "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */, role: 'none', classes: ['sidebar', this.getSideBarPosition() === 0 /* Position.LEFT */ ? 'left' : 'right'] },
                { id: "workbench.parts.editor" /* Parts.EDITOR_PART */, role: 'main', classes: ['editor'], options: { restorePreviousState: this.willRestoreEditors() } },
                { id: "workbench.parts.panel" /* Parts.PANEL_PART */, role: 'none', classes: ['panel', 'basepanel', (0, layoutService_1.positionToString)(this.getPanelPosition())] },
                { id: "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */, role: 'none', classes: ['auxiliarybar', 'basepanel', this.getSideBarPosition() === 0 /* Position.LEFT */ ? 'right' : 'left'] },
                { id: "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */, role: 'status', classes: ['statusbar'] }
            ]) {
                const partContainer = this.createPart(id, role, classes);
                (0, performance_1.mark)(`code/willCreatePart/${id}`);
                this.getPart(id).create(partContainer, options);
                (0, performance_1.mark)(`code/didCreatePart/${id}`);
            }
            // Notification Handlers
            this.createNotificationsHandlers(instantiationService, notificationService);
            // Add Workbench to DOM
            this.parent.appendChild(this.container);
        }
        createPart(id, role, classes) {
            const part = document.createElement(role === 'status' ? 'footer' /* Use footer element for status bar #98376 */ : 'div');
            part.classList.add('part', ...classes);
            part.id = id;
            part.setAttribute('role', role);
            if (role === 'status') {
                part.setAttribute('aria-live', 'off');
            }
            return part;
        }
        createNotificationsHandlers(instantiationService, notificationService) {
            // Instantiate Notification components
            const notificationsCenter = this._register(instantiationService.createInstance(notificationsCenter_1.NotificationsCenter, this.container, notificationService.model));
            const notificationsToasts = this._register(instantiationService.createInstance(notificationsToasts_1.NotificationsToasts, this.container, notificationService.model));
            this._register(instantiationService.createInstance(notificationsAlerts_1.NotificationsAlerts, notificationService.model));
            const notificationsStatus = instantiationService.createInstance(notificationsStatus_1.NotificationsStatus, notificationService.model);
            this._register(instantiationService.createInstance(notificationsTelemetry_1.NotificationsTelemetry));
            // Visibility
            this._register(notificationsCenter.onDidChangeVisibility(() => {
                notificationsStatus.update(notificationsCenter.isVisible, notificationsToasts.isVisible);
                notificationsToasts.update(notificationsCenter.isVisible);
            }));
            this._register(notificationsToasts.onDidChangeVisibility(() => {
                notificationsStatus.update(notificationsCenter.isVisible, notificationsToasts.isVisible);
            }));
            // Register Commands
            (0, notificationsCommands_1.registerNotificationCommands)(notificationsCenter, notificationsToasts, notificationService.model);
            // Register with Layout
            this.registerNotifications({
                onDidChangeNotificationsVisibility: event_1.Event.map(event_1.Event.any(notificationsToasts.onDidChangeVisibility, notificationsCenter.onDidChangeVisibility), () => notificationsToasts.isVisible || notificationsCenter.isVisible)
            });
        }
        restore(lifecycleService) {
            // Ask each part to restore
            try {
                this.restoreParts();
            }
            catch (error) {
                (0, errors_1.onUnexpectedError)(error);
            }
            // Transition into restored phase after layout has restored
            // but do not wait indefinitely on this to account for slow
            // editors restoring. Since the workbench is fully functional
            // even when the visible editors have not resolved, we still
            // want contributions on the `Restored` phase to work before
            // slow editors have resolved. But we also do not want fast
            // editors to resolve slow when too many contributions get
            // instantiated, so we find a middle ground solution via
            // `Promise.race`
            this.whenReady.finally(() => Promise.race([
                this.whenRestored,
                (0, async_1.timeout)(2000)
            ]).finally(() => {
                // Update perf marks only when the layout is fully
                // restored. We want the time it takes to restore
                // editors to be included in these numbers
                function markDidStartWorkbench() {
                    (0, performance_1.mark)('code/didStartWorkbench');
                    performance.measure('perf: workbench create & restore', 'code/didLoadWorkbenchMain', 'code/didStartWorkbench');
                }
                if (this.isRestored()) {
                    markDidStartWorkbench();
                }
                else {
                    this.whenRestored.finally(() => markDidStartWorkbench());
                }
                // Set lifecycle phase to `Restored`
                lifecycleService.phase = 3 /* LifecyclePhase.Restored */;
                // Set lifecycle phase to `Eventually` after a short delay and when idle (min 2.5sec, max 5sec)
                const eventuallyPhaseScheduler = this._register(new async_1.RunOnceScheduler(() => {
                    this._register((0, async_1.runWhenIdle)(() => lifecycleService.phase = 4 /* LifecyclePhase.Eventually */, 2500));
                }, 2500));
                eventuallyPhaseScheduler.schedule();
            }));
        }
    }
    exports.Workbench = Workbench;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2JlbmNoLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvd29ya2JlbmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWdEaEcsTUFBYSxTQUFVLFNBQVEsZUFBTTtRQVFwQyxZQUNDLE1BQW1CLEVBQ0YsT0FBc0MsRUFDdEMsaUJBQW9DLEVBQ3JELFVBQXVCO1lBRXZCLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUpHLFlBQU8sR0FBUCxPQUFPLENBQStCO1lBQ3RDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7WUFUckMsb0JBQWUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFxQixDQUFDLENBQUM7WUFDM0UsbUJBQWMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQztZQUVwQyxtQkFBYyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQzdELGtCQUFhLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUM7WUEwRDNDLDRCQUF1QixHQUFrRCxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDO1lBaERoSCx1Q0FBdUM7WUFDdkMsSUFBQSxrQkFBSSxFQUFDLHlCQUF5QixDQUFDLENBQUM7WUFFaEMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFFTyxvQkFBb0IsQ0FBQyxVQUF1QjtZQUVuRCx1Q0FBdUM7WUFDdkMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLG9CQUFvQixFQUFFLENBQUMsS0FBNEIsRUFBRSxFQUFFO2dCQUU5RSw2RUFBNkU7Z0JBQzdFLElBQUEsMEJBQWlCLEVBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUVo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