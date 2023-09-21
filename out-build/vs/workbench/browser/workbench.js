/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/browser/workbench", "vs/base/common/event", "vs/base/common/async", "vs/base/browser/browser", "vs/base/common/performance", "vs/base/common/errors", "vs/platform/registry/common/platform", "vs/base/common/platform", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/platform/instantiation/common/extensions", "vs/workbench/services/layout/browser/layoutService", "vs/platform/storage/common/storage", "vs/platform/configuration/common/configuration", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/notification/common/notification", "vs/workbench/browser/parts/notifications/notificationsCenter", "vs/workbench/browser/parts/notifications/notificationsAlerts", "vs/workbench/browser/parts/notifications/notificationsStatus", "vs/workbench/browser/parts/notifications/notificationsTelemetry", "vs/workbench/browser/parts/notifications/notificationsCommands", "vs/workbench/browser/parts/notifications/notificationsToasts", "vs/base/browser/ui/aria/aria", "vs/editor/browser/config/fontMeasurements", "vs/editor/common/config/fontInfo", "vs/base/common/errorMessage", "vs/workbench/browser/contextkeys", "vs/base/common/arrays", "vs/platform/instantiation/common/instantiationService", "vs/workbench/browser/layout", "vs/workbench/services/host/browser/host", "vs/platform/dialogs/common/dialogs", "vs/workbench/browser/style"], function (require, exports, nls_1, event_1, async_1, browser_1, performance_1, errors_1, platform_1, platform_2, contributions_1, editor_1, extensions_1, layoutService_1, storage_1, configuration_1, lifecycle_1, notification_1, notificationsCenter_1, notificationsAlerts_1, notificationsStatus_1, notificationsTelemetry_1, notificationsCommands_1, notificationsToasts_1, aria_1, fontMeasurements_1, fontInfo_1, errorMessage_1, contextkeys_1, arrays_1, instantiationService_1, layout_1, host_1, dialogs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$g2b = void 0;
    class $g2b extends layout_1.$f2b {
        constructor(parent, Vb, Wb, logService) {
            super(parent);
            this.Vb = Vb;
            this.Wb = Wb;
            this.Tb = this.B(new event_1.$fd());
            this.onWillShutdown = this.Tb.event;
            this.Ub = this.B(new event_1.$fd());
            this.onDidShutdown = this.Ub.event;
            this.Yb = { message: undefined, time: 0 };
            // Perf: measure workbench startup time
            (0, performance_1.mark)('code/willStartWorkbench');
            this.Xb(logService);
        }
        Xb(logService) {
            // Listen on unhandled rejection events
            window.addEventListener('unhandledrejection', (event) => {
                // See https://developer.mozilla.org/en-US/docs/Web/API/PromiseRejectionEvent
                (0, errors_1.$Y)(event.reason);
                // Prevent the printing of this event to the console
                event.preventDefault();
            });
            // Install handler for unexpected errors
            (0, errors_1.setUnexpectedErrorHandler)(error => this.Zb(error, logService));
            if (typeof window.require?.config === 'function') {
                window.require.config({
                    onError: (err) => {
                        if (err.phase === 'loading') {
                            (0, errors_1.$Y)(new Error((0, nls_1.localize)(0, null, JSON.stringify(err))));
                        }
                        console.error(err);
                    }
                });
            }
        }
        Zb(error, logService) {
            const message = (0, errorMessage_1.$mi)(error, true);
            if (!message) {
                return;
            }
            const now = Date.now();
            if (message === this.Yb.message && now - this.Yb.time <= 1000) {
                return; // Return if error message identical to previous and shorter than 1 second
            }
            this.Yb.time = now;
            this.Yb.message = message;
            // Log it
            logService.error(message);
        }
        startup() {
            try {
                // Configure emitter leak warning threshold
                (0, event_1.$ed)(175);
                // Services
                const instantiationService = this.$b(this.Wb);
                instantiationService.invokeFunction(accessor => {
                    const lifecycleService = accessor.get(lifecycle_1.$7y);
                    const storageService = accessor.get(storage_1.$Vo);
                    const configurationService = accessor.get(configuration_1.$8h);
                    const hostService = accessor.get(host_1.$VT);
                    const dialogService = accessor.get(dialogs_1.$oA);
                    const notificationService = accessor.get(notification_1.$Yu);
                    // Layout
                    this.fb(accessor);
                    // Registries
                    platform_1.$8m.as(contributions_1.Extensions.Workbench).start(accessor);
                    platform_1.$8m.as(editor_1.$GE.EditorFactory).start(accessor);
                    // Context Keys
                    this.B(instantiationService.createInstance(contextkeys_1.$e2b));
                    // Register Listeners
                    this.ac(lifecycleService, storageService, configurationService, hostService, dialogService);
                    // Render Workbench
                    this.fc(instantiationService, notificationService, storageService, configurationService);
                    // Workbench Layout
                    this.Eb();
                    // Layout
                    this.layout();
                    // Restore
                    this.ic(lifecycleService);
                });
                return instantiationService;
            }
            catch (error) {
                (0, errors_1.$Y)(error);
                throw error; // rethrow because this is a critical issue we cannot handle properly here
            }
        }
        $b(serviceCollection) {
            // Layout Service
            serviceCollection.set(layoutService_1.$Meb, this);
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            //
            // NOTE: Please do NOT register services here. Use `registerSingleton()`
            //       from `workbench.common.main.ts` if the service is shared between
            //       desktop and web or `workbench.desktop.main.ts` if the service
            //       is desktop only.
            //
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            // All Contributed Services
            const contributedServices = (0, extensions_1.$nr)();
            for (const [id, descriptor] of contributedServices) {
                serviceCollection.set(id, descriptor);
            }
            const instantiationService = new instantiationService_1.$6p(serviceCollection, true);
            // Wrap up
            instantiationService.invokeFunction(accessor => {
                const lifecycleService = accessor.get(lifecycle_1.$7y);
                // TODO@Sandeep debt around cyclic dependencies
                const configurationService = accessor.get(configuration_1.$8h);
                if (typeof configurationService.acquireInstantiationService === 'function') {
                    configurationService.acquireInstantiationService(instantiationService);
                }
                // Signal to lifecycle that services are set
                lifecycleService.phase = 2 /* LifecyclePhase.Ready */;
            });
            return instantiationService;
        }
        ac(lifecycleService, storageService, configurationService, hostService, dialogService) {
            // Configuration changes
            this.B(configurationService.onDidChangeConfiguration(e => this.cc(e, configurationService)));
            // Font Info
            if (platform_2.$m) {
                this.B(storageService.onWillSaveState(e => {
                    if (e.reason === storage_1.WillSaveStateReason.SHUTDOWN) {
                        this.ec(storageService);
                    }
                }));
            }
            else {
                this.B(lifecycleService.onWillShutdown(() => this.ec(storageService)));
            }
            // Lifecycle
            this.B(lifecycleService.onWillShutdown(event => this.Tb.fire(event)));
            this.B(lifecycleService.onDidShutdown(() => {
                this.Ub.fire();
                this.dispose();
            }));
            // In some environments we do not get enough time to persist state on shutdown.
            // In other cases, VSCode might crash, so we periodically save state to reduce
            // the chance of loosing any state.
            // The window loosing focus is a good indication that the user has stopped working
            // in that window so we pick that at a time to collect state.
            this.B(hostService.onDidChangeFocus(focus => {
                if (!focus) {
                    storageService.flush();
                }
            }));
            // Dialogs showing/hiding
            this.B(dialogService.onWillShowDialog(() => this.container.classList.add('modal-dialog-visible')));
            this.B(dialogService.onDidShowDialog(() => this.container.classList.remove('modal-dialog-visible')));
        }
        cc(e, configurationService) {
            if (!platform_2.$j) {
                return; // macOS only
            }
            if (e && !e.affectsConfiguration('workbench.fontAliasing')) {
                return;
            }
            const aliasing = configurationService.getValue('workbench.fontAliasing');
            if (this.bc === aliasing) {
                return;
            }
            this.bc = aliasing;
            // Remove all
            const fontAliasingValues = ['antialiased', 'none', 'auto'];
            this.container.classList.remove(...fontAliasingValues.map(value => `monaco-font-aliasing-${value}`));
            // Add specific
            if (fontAliasingValues.some(option => option === aliasing)) {
                this.container.classList.add(`monaco-font-aliasing-${aliasing}`);
            }
        }
        dc(storageService, configurationService) {
            const storedFontInfoRaw = storageService.get('editorFontInfo', -1 /* StorageScope.APPLICATION */);
            if (storedFontInfoRaw) {
                try {
                    const storedFontInfo = JSON.parse(storedFontInfoRaw);
                    if (Array.isArray(storedFontInfo)) {
                        fontMeasurements_1.$zU.restoreFontInfo(storedFontInfo);
                    }
                }
                catch (err) {
                    /* ignore */
                }
            }
            fontMeasurements_1.$zU.readFontInfo(fontInfo_1.$Rr.createFromRawSettings(configurationService.getValue('editor'), browser_1.$WN.value));
        }
        ec(storageService) {
            const serializedFontInfo = fontMeasurements_1.$zU.serializeFontInfo();
            if (serializedFontInfo) {
                storageService.store('editorFontInfo', JSON.stringify(serializedFontInfo), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
        }
        fc(instantiationService, notificationService, storageService, configurationService) {
            // ARIA
            (0, aria_1.$0P)(this.container);
            // State specific classes
            const platformClass = platform_2.$i ? 'windows' : platform_2.$k ? 'linux' : 'mac';
            const workbenchClasses = (0, arrays_1.$Fb)([
                'monaco-workbench',
                platformClass,
                platform_2.$o ? 'web' : undefined,
                browser_1.$7N ? 'chromium' : browser_1.$5N ? 'firefox' : browser_1.$8N ? 'safari' : undefined,
                ...this.getLayoutClasses(),
                ...(this.Vb?.extraClasses ? this.Vb.extraClasses : [])
            ]);
            this.container.classList.add(...workbenchClasses);
            document.body.classList.add(platformClass); // used by our fonts
            if (platform_2.$o) {
                document.body.classList.add('web');
            }
            // Apply font aliasing
            this.cc(undefined, configurationService);
            // Warm up font cache information before building up too many dom elements
            this.dc(storageService, configurationService);
            // Create Parts
            for (const { id, role, classes, options } of [
                { id: "workbench.parts.titlebar" /* Parts.TITLEBAR_PART */, role: 'none', classes: ['titlebar'] },
                { id: "workbench.parts.banner" /* Parts.BANNER_PART */, role: 'banner', classes: ['banner'] },
                { id: "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */, role: 'none', classes: ['activitybar', this.getSideBarPosition() === 0 /* Position.LEFT */ ? 'left' : 'right'] },
                { id: "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */, role: 'none', classes: ['sidebar', this.getSideBarPosition() === 0 /* Position.LEFT */ ? 'left' : 'right'] },
                { id: "workbench.parts.editor" /* Parts.EDITOR_PART */, role: 'main', classes: ['editor'], options: { restorePreviousState: this.rb() } },
                { id: "workbench.parts.panel" /* Parts.PANEL_PART */, role: 'none', classes: ['panel', 'basepanel', (0, layoutService_1.$Neb)(this.getPanelPosition())] },
                { id: "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */, role: 'none', classes: ['auxiliarybar', 'basepanel', this.getSideBarPosition() === 0 /* Position.LEFT */ ? 'right' : 'left'] },
                { id: "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */, role: 'status', classes: ['statusbar'] }
            ]) {
                const partContainer = this.gc(id, role, classes);
                (0, performance_1.mark)(`code/willCreatePart/${id}`);
                this.Ab(id).create(partContainer, options);
                (0, performance_1.mark)(`code/didCreatePart/${id}`);
            }
            // Notification Handlers
            this.hc(instantiationService, notificationService);
            // Add Workbench to DOM
            this.eb.appendChild(this.container);
        }
        gc(id, role, classes) {
            const part = document.createElement(role === 'status' ? 'footer' /* Use footer element for status bar #98376 */ : 'div');
            part.classList.add('part', ...classes);
            part.id = id;
            part.setAttribute('role', role);
            if (role === 'status') {
                part.setAttribute('aria-live', 'off');
            }
            return part;
        }
        hc(instantiationService, notificationService) {
            // Instantiate Notification components
            const notificationsCenter = this.B(instantiationService.createInstance(notificationsCenter_1.$a2b, this.container, notificationService.model));
            const notificationsToasts = this.B(instantiationService.createInstance(notificationsToasts_1.$d2b, this.container, notificationService.model));
            this.B(instantiationService.createInstance(notificationsAlerts_1.$b2b, notificationService.model));
            const notificationsStatus = instantiationService.createInstance(notificationsStatus_1.$c2b, notificationService.model);
            this.B(instantiationService.createInstance(notificationsTelemetry_1.$2Ib));
            // Visibility
            this.B(notificationsCenter.onDidChangeVisibility(() => {
                notificationsStatus.update(notificationsCenter.isVisible, notificationsToasts.isVisible);
                notificationsToasts.update(notificationsCenter.isVisible);
            }));
            this.B(notificationsToasts.onDidChangeVisibility(() => {
                notificationsStatus.update(notificationsCenter.isVisible, notificationsToasts.isVisible);
            }));
            // Register Commands
            (0, notificationsCommands_1.$aJb)(notificationsCenter, notificationsToasts, notificationService.model);
            // Register with Layout
            this.registerNotifications({
                onDidChangeNotificationsVisibility: event_1.Event.map(event_1.Event.any(notificationsToasts.onDidChangeVisibility, notificationsCenter.onDidChangeVisibility), () => notificationsToasts.isVisible || notificationsCenter.isVisible)
            });
        }
        ic(lifecycleService) {
            // Ask each part to restore
            try {
                this.zb();
            }
            catch (error) {
                (0, errors_1.$Y)(error);
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
            this.wb.finally(() => Promise.race([
                this.whenRestored,
                (0, async_1.$Hg)(2000)
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
                const eventuallyPhaseScheduler = this.B(new async_1.$Sg(() => {
                    this.B((0, async_1.$Wg)(() => lifecycleService.phase = 4 /* LifecyclePhase.Eventually */, 2500));
                }, 2500));
                eventuallyPhaseScheduler.schedule();
            }));
        }
    }
    exports.$g2b = $g2b;
});
//# sourceMappingURL=workbench.js.map