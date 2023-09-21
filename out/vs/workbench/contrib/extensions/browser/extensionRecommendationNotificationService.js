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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensionRecommendations/common/extensionRecommendations", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations"], function (require, exports, arrays_1, async_1, cancellation_1, errors_1, event_1, lifecycle_1, nls_1, configuration_1, extensionManagementUtil_1, extensionRecommendations_1, instantiation_1, notification_1, storage_1, telemetry_1, userDataSync_1, extensionsActions_1, extensions_1, environmentService_1, extensionManagement_1, extensionRecommendations_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionRecommendationNotificationService = void 0;
    const ignoreImportantExtensionRecommendationStorageKey = 'extensionsAssistant/importantRecommendationsIgnore';
    const donotShowWorkspaceRecommendationsStorageKey = 'extensionsAssistant/workspaceRecommendationsIgnore';
    const choiceNever = (0, nls_1.localize)('neverShowAgain', "Don't Show Again");
    class RecommendationsNotification extends lifecycle_1.Disposable {
        constructor(severity, message, choices, notificationService) {
            super();
            this.severity = severity;
            this.message = message;
            this.choices = choices;
            this.notificationService = notificationService;
            this._onDidClose = this._register(new event_1.Emitter());
            this.onDidClose = this._onDidClose.event;
            this._onDidChangeVisibility = this._register(new event_1.Emitter());
            this.onDidChangeVisibility = this._onDidChangeVisibility.event;
            this.cancelled = false;
            this.onDidCloseDisposable = this._register(new lifecycle_1.MutableDisposable());
            this.onDidChangeVisibilityDisposable = this._register(new lifecycle_1.MutableDisposable());
        }
        show() {
            if (!this.notificationHandle) {
                this.updateNotificationHandle(this.notificationService.prompt(this.severity, this.message, this.choices, { sticky: true, onCancel: () => this.cancelled = true }));
            }
        }
        hide() {
            if (this.notificationHandle) {
                this.onDidCloseDisposable.clear();
                this.notificationHandle.close();
                this.cancelled = false;
                this.updateNotificationHandle(this.notificationService.prompt(this.severity, this.message, this.choices, { priority: notification_1.NotificationPriority.SILENT, onCancel: () => this.cancelled = true }));
            }
        }
        isCancelled() {
            return this.cancelled;
        }
        updateNotificationHandle(notificationHandle) {
            this.onDidCloseDisposable.clear();
            this.onDidChangeVisibilityDisposable.clear();
            this.notificationHandle = notificationHandle;
            this.onDidCloseDisposable.value = this.notificationHandle.onDidClose(() => {
                this.onDidCloseDisposable.dispose();
                this.onDidChangeVisibilityDisposable.dispose();
                this._onDidClose.fire();
                this._onDidClose.dispose();
                this._onDidChangeVisibility.dispose();
            });
            this.onDidChangeVisibilityDisposable.value = this.notificationHandle.onDidChangeVisibility((e) => this._onDidChangeVisibility.fire(e));
        }
    }
    let ExtensionRecommendationNotificationService = class ExtensionRecommendationNotificationService extends lifecycle_1.Disposable {
        // Ignored Important Recommendations
        get ignoredRecommendations() {
            return (0, arrays_1.distinct)([...JSON.parse(this.storageService.get(ignoreImportantExtensionRecommendationStorageKey, 0 /* StorageScope.PROFILE */, '[]'))].map(i => i.toLowerCase()));
        }
        constructor(configurationService, storageService, notificationService, telemetryService, instantiationService, extensionsWorkbenchService, extensionManagementService, extensionEnablementService, extensionIgnoredRecommendationsService, userDataSyncEnablementService, workbenchEnvironmentService) {
            super();
            this.configurationService = configurationService;
            this.storageService = storageService;
            this.notificationService = notificationService;
            this.telemetryService = telemetryService;
            this.instantiationService = instantiationService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionManagementService = extensionManagementService;
            this.extensionEnablementService = extensionEnablementService;
            this.extensionIgnoredRecommendationsService = extensionIgnoredRecommendationsService;
            this.userDataSyncEnablementService = userDataSyncEnablementService;
            this.workbenchEnvironmentService = workbenchEnvironmentService;
            this.recommendedExtensions = [];
            this.recommendationSources = [];
            this.pendingNotificaitons = [];
        }
        hasToIgnoreRecommendationNotifications() {
            const config = this.configurationService.getValue('extensions');
            return config.ignoreRecommendations || !!config.showRecommendationsOnlyOnDemand;
        }
        async promptImportantExtensionsInstallNotification(extensionRecommendations) {
            const ignoredRecommendations = [...this.extensionIgnoredRecommendationsService.ignoredRecommendations, ...this.ignoredRecommendations];
            const extensions = extensionRecommendations.extensions.filter(id => !ignoredRecommendations.includes(id));
            if (!extensions.length) {
                return "ignored" /* RecommendationsNotificationResult.Ignored */;
            }
            return this.promptRecommendationsNotification({ ...extensionRecommendations, extensions }, {
                onDidInstallRecommendedExtensions: (extensions) => extensions.forEach(extension => this.telemetryService.publicLog2('extensionRecommendations:popup', { userReaction: 'install', extensionId: extension.identifier.id, source: (0, extensionRecommendations_1.RecommendationSourceToString)(extensionRecommendations.source) })),
                onDidShowRecommendedExtensions: (extensions) => extensions.forEach(extension => this.telemetryService.publicLog2('extensionRecommendations:popup', { userReaction: 'show', extensionId: extension.identifier.id, source: (0, extensionRecommendations_1.RecommendationSourceToString)(extensionRecommendations.source) })),
                onDidCancelRecommendedExtensions: (extensions) => extensions.forEach(extension => this.telemetryService.publicLog2('extensionRecommendations:popup', { userReaction: 'cancelled', extensionId: extension.identifier.id, source: (0, extensionRecommendations_1.RecommendationSourceToString)(extensionRecommendations.source) })),
                onDidNeverShowRecommendedExtensionsAgain: (extensions) => {
                    for (const extension of extensions) {
                        this.addToImportantRecommendationsIgnore(extension.identifier.id);
                        this.telemetryService.publicLog2('extensionRecommendations:popup', { userReaction: 'neverShowAgain', extensionId: extension.identifier.id, source: (0, extensionRecommendations_1.RecommendationSourceToString)(extensionRecommendations.source) });
                    }
                    this.notificationService.prompt(notification_1.Severity.Info, (0, nls_1.localize)('ignoreExtensionRecommendations', "Do you want to ignore all extension recommendations?"), [{
                            label: (0, nls_1.localize)('ignoreAll', "Yes, Ignore All"),
                            run: () => this.setIgnoreRecommendationsConfig(true)
                        }, {
                            label: (0, nls_1.localize)('no', "No"),
                            run: () => this.setIgnoreRecommendationsConfig(false)
                        }]);
                },
            });
        }
        async promptWorkspaceRecommendations(recommendations) {
            if (this.storageService.getBoolean(donotShowWorkspaceRecommendationsStorageKey, 1 /* StorageScope.WORKSPACE */, false)) {
                return;
            }
            let installed = await this.extensionManagementService.getInstalled();
            installed = installed.filter(l => this.extensionEnablementService.getEnablementState(l) !== 1 /* EnablementState.DisabledByExtensionKind */); // Filter extensions disabled by kind
            recommendations = recommendations.filter(extensionId => installed.every(local => !(0, extensionManagementUtil_1.areSameExtensions)({ id: extensionId }, local.identifier)));
            if (!recommendations.length) {
                return;
            }
            await this.promptRecommendationsNotification({ extensions: recommendations, source: 2 /* RecommendationSource.WORKSPACE */, name: (0, nls_1.localize)({ key: 'this repository', comment: ['this repository means the current repository that is opened'] }, "this repository") }, {
                onDidInstallRecommendedExtensions: () => this.telemetryService.publicLog2('extensionWorkspaceRecommendations:popup', { userReaction: 'install' }),
                onDidShowRecommendedExtensions: () => this.telemetryService.publicLog2('extensionWorkspaceRecommendations:popup', { userReaction: 'show' }),
                onDidCancelRecommendedExtensions: () => this.telemetryService.publicLog2('extensionWorkspaceRecommendations:popup', { userReaction: 'cancelled' }),
                onDidNeverShowRecommendedExtensionsAgain: () => {
                    this.telemetryService.publicLog2('extensionWorkspaceRecommendations:popup', { userReaction: 'neverShowAgain' });
                    this.storageService.store(donotShowWorkspaceRecommendationsStorageKey, true, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                },
            });
        }
        async promptRecommendationsNotification({ extensions: extensionIds, source, name, searchValue }, recommendationsNotificationActions) {
            if (this.hasToIgnoreRecommendationNotifications()) {
                return "ignored" /* RecommendationsNotificationResult.Ignored */;
            }
            // Do not show exe based recommendations in remote window
            if (source === 3 /* RecommendationSource.EXE */ && this.workbenchEnvironmentService.remoteAuthority) {
                return "incompatibleWindow" /* RecommendationsNotificationResult.IncompatibleWindow */;
            }
            // Ignore exe recommendation if the window
            // 		=> has shown an exe based recommendation already
            // 		=> or has shown any two recommendations already
            if (source === 3 /* RecommendationSource.EXE */ && (this.recommendationSources.includes(3 /* RecommendationSource.EXE */) || this.recommendationSources.length >= 2)) {
                return "toomany" /* RecommendationsNotificationResult.TooMany */;
            }
            this.recommendationSources.push(source);
            // Ignore exe recommendation if recommendations are already shown
            if (source === 3 /* RecommendationSource.EXE */ && extensionIds.every(id => this.recommendedExtensions.includes(id))) {
                return "ignored" /* RecommendationsNotificationResult.Ignored */;
            }
            const extensions = await this.getInstallableExtensions(extensionIds);
            if (!extensions.length) {
                return "ignored" /* RecommendationsNotificationResult.Ignored */;
            }
            this.recommendedExtensions = (0, arrays_1.distinct)([...this.recommendedExtensions, ...extensionIds]);
            let extensionsMessage = '';
            if (extensions.length === 1) {
                extensionsMessage = (0, nls_1.localize)('extensionFromPublisher', "'{0}' extension from {1}", extensions[0].displayName, extensions[0].publisherDisplayName);
            }
            else {
                const publishers = [...extensions.reduce((result, extension) => result.add(extension.publisherDisplayName), new Set())];
                if (publishers.length > 2) {
                    extensionsMessage = (0, nls_1.localize)('extensionsFromMultiplePublishers', "extensions from {0}, {1} and others", publishers[0], publishers[1]);
                }
                else if (publishers.length === 2) {
                    extensionsMessage = (0, nls_1.localize)('extensionsFromPublishers', "extensions from {0} and {1}", publishers[0], publishers[1]);
                }
                else {
                    extensionsMessage = (0, nls_1.localize)('extensionsFromPublisher', "extensions from {0}", publishers[0]);
                }
            }
            let message = (0, nls_1.localize)('recommended', "Do you want to install the recommended {0} for {1}?", extensionsMessage, name);
            if (source === 3 /* RecommendationSource.EXE */) {
                message = (0, nls_1.localize)({ key: 'exeRecommended', comment: ['Placeholder string is the name of the software that is installed.'] }, "You have {0} installed on your system. Do you want to install the recommended {1} for it?", name, extensionsMessage);
            }
            if (!searchValue) {
                searchValue = source === 2 /* RecommendationSource.WORKSPACE */ ? '@recommended' : extensions.map(extensionId => `@id:${extensionId.identifier.id}`).join(' ');
            }
            return (0, async_1.raceCancellablePromises)([
                this._registerP(this.showRecommendationsNotification(extensions, message, searchValue, source, recommendationsNotificationActions)),
                this._registerP(this.waitUntilRecommendationsAreInstalled(extensions))
            ]);
        }
        showRecommendationsNotification(extensions, message, searchValue, source, { onDidInstallRecommendedExtensions, onDidShowRecommendedExtensions, onDidCancelRecommendedExtensions, onDidNeverShowRecommendedExtensionsAgain }) {
            return (0, async_1.createCancelablePromise)(async (token) => {
                let accepted = false;
                const choices = [];
                const installExtensions = async (isMachineScoped) => {
                    this.runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, searchValue));
                    onDidInstallRecommendedExtensions(extensions);
                    await async_1.Promises.settled([
                        async_1.Promises.settled(extensions.map(extension => this.extensionsWorkbenchService.open(extension, { pinned: true }))),
                        this.extensionManagementService.installGalleryExtensions(extensions.map(e => ({ extension: e.gallery, options: { isMachineScoped } })))
                    ]);
                };
                choices.push({
                    label: (0, nls_1.localize)('install', "Install"),
                    run: () => installExtensions(false),
                    menu: this.userDataSyncEnablementService.isEnabled() && this.userDataSyncEnablementService.isResourceEnabled("extensions" /* SyncResource.Extensions */) ? [{
                            label: (0, nls_1.localize)('install and do no sync', "Install (Do not sync)"),
                            run: () => installExtensions(true)
                        }] : undefined,
                });
                choices.push(...[{
                        label: (0, nls_1.localize)('show recommendations', "Show Recommendations"),
                        run: async () => {
                            onDidShowRecommendedExtensions(extensions);
                            for (const extension of extensions) {
                                this.extensionsWorkbenchService.open(extension, { pinned: true });
                            }
                            this.runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, searchValue));
                        }
                    }, {
                        label: choiceNever,
                        isSecondary: true,
                        run: () => {
                            onDidNeverShowRecommendedExtensionsAgain(extensions);
                        }
                    }]);
                try {
                    accepted = await this.doShowRecommendationsNotification(notification_1.Severity.Info, message, choices, source, token);
                }
                catch (error) {
                    if (!(0, errors_1.isCancellationError)(error)) {
                        throw error;
                    }
                }
                if (accepted) {
                    return "reacted" /* RecommendationsNotificationResult.Accepted */;
                }
                else {
                    onDidCancelRecommendedExtensions(extensions);
                    return "cancelled" /* RecommendationsNotificationResult.Cancelled */;
                }
            });
        }
        waitUntilRecommendationsAreInstalled(extensions) {
            const installedExtensions = [];
            const disposables = new lifecycle_1.DisposableStore();
            return (0, async_1.createCancelablePromise)(async (token) => {
                disposables.add(token.onCancellationRequested(e => disposables.dispose()));
                return new Promise((c, e) => {
                    disposables.add(this.extensionManagementService.onInstallExtension(e => {
                        installedExtensions.push(e.identifier.id.toLowerCase());
                        if (extensions.every(e => installedExtensions.includes(e.identifier.id.toLowerCase()))) {
                            c("reacted" /* RecommendationsNotificationResult.Accepted */);
                        }
                    }));
                });
            });
        }
        /**
         * Show recommendations in Queue
         * At any time only one recommendation is shown
         * If a new recommendation comes in
         * 		=> If no recommendation is visible, show it immediately
         *		=> Otherwise, add to the pending queue
         * 			=> If it is not exe based and has higher or same priority as current, hide the current notification after showing it for 3s.
         * 			=> Otherwise wait until the current notification is hidden.
         */
        async doShowRecommendationsNotification(severity, message, choices, source, token) {
            const disposables = new lifecycle_1.DisposableStore();
            try {
                const recommendationsNotification = disposables.add(new RecommendationsNotification(severity, message, choices, this.notificationService));
                disposables.add(event_1.Event.once(event_1.Event.filter(recommendationsNotification.onDidChangeVisibility, e => !e))(() => this.showNextNotification()));
                if (this.visibleNotification) {
                    const index = this.pendingNotificaitons.length;
                    disposables.add(token.onCancellationRequested(() => this.pendingNotificaitons.splice(index, 1)));
                    this.pendingNotificaitons.push({ recommendationsNotification, source, token });
                    if (source !== 3 /* RecommendationSource.EXE */ && source <= this.visibleNotification.source) {
                        this.hideVisibleNotification(3000);
                    }
                }
                else {
                    this.visibleNotification = { recommendationsNotification, source, from: Date.now() };
                    recommendationsNotification.show();
                }
                await (0, async_1.raceCancellation)(new Promise(c => disposables.add(event_1.Event.once(recommendationsNotification.onDidClose)(c))), token);
                return !recommendationsNotification.isCancelled();
            }
            finally {
                disposables.dispose();
            }
        }
        showNextNotification() {
            const index = this.getNextPendingNotificationIndex();
            const [nextNotificaiton] = index > -1 ? this.pendingNotificaitons.splice(index, 1) : [];
            // Show the next notification after a delay of 500ms (after the current notification is dismissed)
            (0, async_1.timeout)(nextNotificaiton ? 500 : 0)
                .then(() => {
                this.unsetVisibileNotification();
                if (nextNotificaiton) {
                    this.visibleNotification = { recommendationsNotification: nextNotificaiton.recommendationsNotification, source: nextNotificaiton.source, from: Date.now() };
                    nextNotificaiton.recommendationsNotification.show();
                }
            });
        }
        /**
         * Return the recent high priroity pending notification
         */
        getNextPendingNotificationIndex() {
            let index = this.pendingNotificaitons.length - 1;
            if (this.pendingNotificaitons.length) {
                for (let i = 0; i < this.pendingNotificaitons.length; i++) {
                    if (this.pendingNotificaitons[i].source <= this.pendingNotificaitons[index].source) {
                        index = i;
                    }
                }
            }
            return index;
        }
        hideVisibleNotification(timeInMillis) {
            if (this.visibleNotification && !this.hideVisibleNotificationPromise) {
                const visibleNotification = this.visibleNotification;
                this.hideVisibleNotificationPromise = (0, async_1.timeout)(Math.max(timeInMillis - (Date.now() - visibleNotification.from), 0));
                this.hideVisibleNotificationPromise.then(() => visibleNotification.recommendationsNotification.hide());
            }
        }
        unsetVisibileNotification() {
            this.hideVisibleNotificationPromise?.cancel();
            this.hideVisibleNotificationPromise = undefined;
            this.visibleNotification = undefined;
        }
        async getInstallableExtensions(extensionIds) {
            const result = [];
            if (extensionIds.length) {
                const extensions = await this.extensionsWorkbenchService.getExtensions(extensionIds.map(id => ({ id })), { source: 'install-recommendations' }, cancellation_1.CancellationToken.None);
                for (const extension of extensions) {
                    if (extension.gallery && (await this.extensionManagementService.canInstall(extension.gallery))) {
                        result.push(extension);
                    }
                }
            }
            return result;
        }
        async runAction(action) {
            try {
                await action.run();
            }
            finally {
                if ((0, lifecycle_1.isDisposable)(action)) {
                    action.dispose();
                }
            }
        }
        addToImportantRecommendationsIgnore(id) {
            const importantRecommendationsIgnoreList = [...this.ignoredRecommendations];
            if (!importantRecommendationsIgnoreList.includes(id.toLowerCase())) {
                importantRecommendationsIgnoreList.push(id.toLowerCase());
                this.storageService.store(ignoreImportantExtensionRecommendationStorageKey, JSON.stringify(importantRecommendationsIgnoreList), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            }
        }
        setIgnoreRecommendationsConfig(configVal) {
            this.configurationService.updateValue('extensions.ignoreRecommendations', configVal);
        }
        _registerP(o) {
            this._register((0, lifecycle_1.toDisposable)(() => o.cancel()));
            return o;
        }
    };
    exports.ExtensionRecommendationNotificationService = ExtensionRecommendationNotificationService;
    exports.ExtensionRecommendationNotificationService = ExtensionRecommendationNotificationService = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, storage_1.IStorageService),
        __param(2, notification_1.INotificationService),
        __param(3, telemetry_1.ITelemetryService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, extensions_1.IExtensionsWorkbenchService),
        __param(6, extensionManagement_1.IWorkbenchExtensionManagementService),
        __param(7, extensionManagement_1.IWorkbenchExtensionEnablementService),
        __param(8, extensionRecommendations_2.IExtensionIgnoredRecommendationsService),
        __param(9, userDataSync_1.IUserDataSyncEnablementService),
        __param(10, environmentService_1.IWorkbenchEnvironmentService)
    ], ExtensionRecommendationNotificationService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uUmVjb21tZW5kYXRpb25Ob3RpZmljYXRpb25TZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZXh0ZW5zaW9ucy9icm93c2VyL2V4dGVuc2lvblJlY29tbWVuZGF0aW9uTm90aWZpY2F0aW9uU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFzQ2hHLE1BQU0sZ0RBQWdELEdBQUcsb0RBQW9ELENBQUM7SUFDOUcsTUFBTSwyQ0FBMkMsR0FBRyxvREFBb0QsQ0FBQztJQUN6RyxNQUFNLFdBQVcsR0FBRyxJQUFBLGNBQVEsRUFBQyxnQkFBZ0IsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0lBU25FLE1BQU0sMkJBQTRCLFNBQVEsc0JBQVU7UUFXbkQsWUFDa0IsUUFBa0IsRUFDbEIsT0FBZSxFQUNmLE9BQXdCLEVBQ3hCLG1CQUF5QztZQUUxRCxLQUFLLEVBQUUsQ0FBQztZQUxTLGFBQVEsR0FBUixRQUFRLENBQVU7WUFDbEIsWUFBTyxHQUFQLE9BQU8sQ0FBUTtZQUNmLFlBQU8sR0FBUCxPQUFPLENBQWlCO1lBQ3hCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFibkQsZ0JBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUNqRCxlQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUM7WUFFckMsMkJBQXNCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBVyxDQUFDLENBQUM7WUFDL0QsMEJBQXFCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQztZQUczRCxjQUFTLEdBQVksS0FBSyxDQUFDO1lBOEIzQix5QkFBb0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElB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