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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/extensions/browser/extensionRecommendationNotificationService", "vs/platform/configuration/common/configuration", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensionRecommendations/common/extensionRecommendations", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations"], function (require, exports, arrays_1, async_1, cancellation_1, errors_1, event_1, lifecycle_1, nls_1, configuration_1, extensionManagementUtil_1, extensionRecommendations_1, instantiation_1, notification_1, storage_1, telemetry_1, userDataSync_1, extensionsActions_1, extensions_1, environmentService_1, extensionManagement_1, extensionRecommendations_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$4Ub = void 0;
    const ignoreImportantExtensionRecommendationStorageKey = 'extensionsAssistant/importantRecommendationsIgnore';
    const donotShowWorkspaceRecommendationsStorageKey = 'extensionsAssistant/workspaceRecommendationsIgnore';
    const choiceNever = (0, nls_1.localize)(0, null);
    class RecommendationsNotification extends lifecycle_1.$kc {
        constructor(h, j, m, n) {
            super();
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.a = this.B(new event_1.$fd());
            this.onDidClose = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidChangeVisibility = this.b.event;
            this.g = false;
            this.r = this.B(new lifecycle_1.$lc());
            this.s = this.B(new lifecycle_1.$lc());
        }
        show() {
            if (!this.f) {
                this.t(this.n.prompt(this.h, this.j, this.m, { sticky: true, onCancel: () => this.g = true }));
            }
        }
        hide() {
            if (this.f) {
                this.r.clear();
                this.f.close();
                this.g = false;
                this.t(this.n.prompt(this.h, this.j, this.m, { priority: notification_1.NotificationPriority.SILENT, onCancel: () => this.g = true }));
            }
        }
        isCancelled() {
            return this.g;
        }
        t(notificationHandle) {
            this.r.clear();
            this.s.clear();
            this.f = notificationHandle;
            this.r.value = this.f.onDidClose(() => {
                this.r.dispose();
                this.s.dispose();
                this.a.fire();
                this.a.dispose();
                this.b.dispose();
            });
            this.s.value = this.f.onDidChangeVisibility((e) => this.b.fire(e));
        }
    }
    let $4Ub = class $4Ub extends lifecycle_1.$kc {
        // Ignored Important Recommendations
        get ignoredRecommendations() {
            return (0, arrays_1.$Kb)([...JSON.parse(this.m.get(ignoreImportantExtensionRecommendationStorageKey, 0 /* StorageScope.PROFILE */, '[]'))].map(i => i.toLowerCase()));
        }
        constructor(j, m, n, r, s, t, u, w, y, z, C) {
            super();
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.a = [];
            this.b = [];
            this.h = [];
        }
        hasToIgnoreRecommendationNotifications() {
            const config = this.j.getValue('extensions');
            return config.ignoreRecommendations || !!config.showRecommendationsOnlyOnDemand;
        }
        async promptImportantExtensionsInstallNotification(extensionRecommendations) {
            const ignoredRecommendations = [...this.y.ignoredRecommendations, ...this.ignoredRecommendations];
            const extensions = extensionRecommendations.extensions.filter(id => !ignoredRecommendations.includes(id));
            if (!extensions.length) {
                return "ignored" /* RecommendationsNotificationResult.Ignored */;
            }
            return this.D({ ...extensionRecommendations, extensions }, {
                onDidInstallRecommendedExtensions: (extensions) => extensions.forEach(extension => this.r.publicLog2('extensionRecommendations:popup', { userReaction: 'install', extensionId: extension.identifier.id, source: (0, extensionRecommendations_1.$SUb)(extensionRecommendations.source) })),
                onDidShowRecommendedExtensions: (extensions) => extensions.forEach(extension => this.r.publicLog2('extensionRecommendations:popup', { userReaction: 'show', extensionId: extension.identifier.id, source: (0, extensionRecommendations_1.$SUb)(extensionRecommendations.source) })),
                onDidCancelRecommendedExtensions: (extensions) => extensions.forEach(extension => this.r.publicLog2('extensionRecommendations:popup', { userReaction: 'cancelled', extensionId: extension.identifier.id, source: (0, extensionRecommendations_1.$SUb)(extensionRecommendations.source) })),
                onDidNeverShowRecommendedExtensionsAgain: (extensions) => {
                    for (const extension of extensions) {
                        this.P(extension.identifier.id);
                        this.r.publicLog2('extensionRecommendations:popup', { userReaction: 'neverShowAgain', extensionId: extension.identifier.id, source: (0, extensionRecommendations_1.$SUb)(extensionRecommendations.source) });
                    }
                    this.n.prompt(notification_1.Severity.Info, (0, nls_1.localize)(1, null), [{
                            label: (0, nls_1.localize)(2, null),
                            run: () => this.Q(true)
                        }, {
                            label: (0, nls_1.localize)(3, null),
                            run: () => this.Q(false)
                        }]);
                },
            });
        }
        async promptWorkspaceRecommendations(recommendations) {
            if (this.m.getBoolean(donotShowWorkspaceRecommendationsStorageKey, 1 /* StorageScope.WORKSPACE */, false)) {
                return;
            }
            let installed = await this.u.getInstalled();
            installed = installed.filter(l => this.w.getEnablementState(l) !== 1 /* EnablementState.DisabledByExtensionKind */); // Filter extensions disabled by kind
            recommendations = recommendations.filter(extensionId => installed.every(local => !(0, extensionManagementUtil_1.$po)({ id: extensionId }, local.identifier)));
            if (!recommendations.length) {
                return;
            }
            await this.D({ extensions: recommendations, source: 2 /* RecommendationSource.WORKSPACE */, name: (0, nls_1.localize)(4, null) }, {
                onDidInstallRecommendedExtensions: () => this.r.publicLog2('extensionWorkspaceRecommendations:popup', { userReaction: 'install' }),
                onDidShowRecommendedExtensions: () => this.r.publicLog2('extensionWorkspaceRecommendations:popup', { userReaction: 'show' }),
                onDidCancelRecommendedExtensions: () => this.r.publicLog2('extensionWorkspaceRecommendations:popup', { userReaction: 'cancelled' }),
                onDidNeverShowRecommendedExtensionsAgain: () => {
                    this.r.publicLog2('extensionWorkspaceRecommendations:popup', { userReaction: 'neverShowAgain' });
                    this.m.store(donotShowWorkspaceRecommendationsStorageKey, true, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                },
            });
        }
        async D({ extensions: extensionIds, source, name, searchValue }, recommendationsNotificationActions) {
            if (this.hasToIgnoreRecommendationNotifications()) {
                return "ignored" /* RecommendationsNotificationResult.Ignored */;
            }
            // Do not show exe based recommendations in remote window
            if (source === 3 /* RecommendationSource.EXE */ && this.C.remoteAuthority) {
                return "incompatibleWindow" /* RecommendationsNotificationResult.IncompatibleWindow */;
            }
            // Ignore exe recommendation if the window
            // 		=> has shown an exe based recommendation already
            // 		=> or has shown any two recommendations already
            if (source === 3 /* RecommendationSource.EXE */ && (this.b.includes(3 /* RecommendationSource.EXE */) || this.b.length >= 2)) {
                return "toomany" /* RecommendationsNotificationResult.TooMany */;
            }
            this.b.push(source);
            // Ignore exe recommendation if recommendations are already shown
            if (source === 3 /* RecommendationSource.EXE */ && extensionIds.every(id => this.a.includes(id))) {
                return "ignored" /* RecommendationsNotificationResult.Ignored */;
            }
            const extensions = await this.N(extensionIds);
            if (!extensions.length) {
                return "ignored" /* RecommendationsNotificationResult.Ignored */;
            }
            this.a = (0, arrays_1.$Kb)([...this.a, ...extensionIds]);
            let extensionsMessage = '';
            if (extensions.length === 1) {
                extensionsMessage = (0, nls_1.localize)(5, null, extensions[0].displayName, extensions[0].publisherDisplayName);
            }
            else {
                const publishers = [...extensions.reduce((result, extension) => result.add(extension.publisherDisplayName), new Set())];
                if (publishers.length > 2) {
                    extensionsMessage = (0, nls_1.localize)(6, null, publishers[0], publishers[1]);
                }
                else if (publishers.length === 2) {
                    extensionsMessage = (0, nls_1.localize)(7, null, publishers[0], publishers[1]);
                }
                else {
                    extensionsMessage = (0, nls_1.localize)(8, null, publishers[0]);
                }
            }
            let message = (0, nls_1.localize)(9, null, extensionsMessage, name);
            if (source === 3 /* RecommendationSource.EXE */) {
                message = (0, nls_1.localize)(10, null, name, extensionsMessage);
            }
            if (!searchValue) {
                searchValue = source === 2 /* RecommendationSource.WORKSPACE */ ? '@recommended' : extensions.map(extensionId => `@id:${extensionId.identifier.id}`).join(' ');
            }
            return (0, async_1.$xg)([
                this.R(this.F(extensions, message, searchValue, source, recommendationsNotificationActions)),
                this.R(this.G(extensions))
            ]);
        }
        F(extensions, message, searchValue, source, { onDidInstallRecommendedExtensions, onDidShowRecommendedExtensions, onDidCancelRecommendedExtensions, onDidNeverShowRecommendedExtensionsAgain }) {
            return (0, async_1.$ug)(async (token) => {
                let accepted = false;
                const choices = [];
                const installExtensions = async (isMachineScoped) => {
                    this.O(this.s.createInstance(extensionsActions_1.$3hb, searchValue));
                    onDidInstallRecommendedExtensions(extensions);
                    await async_1.Promises.settled([
                        async_1.Promises.settled(extensions.map(extension => this.t.open(extension, { pinned: true }))),
                        this.u.installGalleryExtensions(extensions.map(e => ({ extension: e.gallery, options: { isMachineScoped } })))
                    ]);
                };
                choices.push({
                    label: (0, nls_1.localize)(11, null),
                    run: () => installExtensions(false),
                    menu: this.z.isEnabled() && this.z.isResourceEnabled("extensions" /* SyncResource.Extensions */) ? [{
                            label: (0, nls_1.localize)(12, null),
                            run: () => installExtensions(true)
                        }] : undefined,
                });
                choices.push(...[{
                        label: (0, nls_1.localize)(13, null),
                        run: async () => {
                            onDidShowRecommendedExtensions(extensions);
                            for (const extension of extensions) {
                                this.t.open(extension, { pinned: true });
                            }
                            this.O(this.s.createInstance(extensionsActions_1.$3hb, searchValue));
                        }
                    }, {
                        label: choiceNever,
                        isSecondary: true,
                        run: () => {
                            onDidNeverShowRecommendedExtensionsAgain(extensions);
                        }
                    }]);
                try {
                    accepted = await this.H(notification_1.Severity.Info, message, choices, source, token);
                }
                catch (error) {
                    if (!(0, errors_1.$2)(error)) {
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
        G(extensions) {
            const installedExtensions = [];
            const disposables = new lifecycle_1.$jc();
            return (0, async_1.$ug)(async (token) => {
                disposables.add(token.onCancellationRequested(e => disposables.dispose()));
                return new Promise((c, e) => {
                    disposables.add(this.u.onInstallExtension(e => {
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
        async H(severity, message, choices, source, token) {
            const disposables = new lifecycle_1.$jc();
            try {
                const recommendationsNotification = disposables.add(new RecommendationsNotification(severity, message, choices, this.n));
                disposables.add(event_1.Event.once(event_1.Event.filter(recommendationsNotification.onDidChangeVisibility, e => !e))(() => this.I()));
                if (this.g) {
                    const index = this.h.length;
                    disposables.add(token.onCancellationRequested(() => this.h.splice(index, 1)));
                    this.h.push({ recommendationsNotification, source, token });
                    if (source !== 3 /* RecommendationSource.EXE */ && source <= this.g.source) {
                        this.L(3000);
                    }
                }
                else {
                    this.g = { recommendationsNotification, source, from: Date.now() };
                    recommendationsNotification.show();
                }
                await (0, async_1.$vg)(new Promise(c => disposables.add(event_1.Event.once(recommendationsNotification.onDidClose)(c))), token);
                return !recommendationsNotification.isCancelled();
            }
            finally {
                disposables.dispose();
            }
        }
        I() {
            const index = this.J();
            const [nextNotificaiton] = index > -1 ? this.h.splice(index, 1) : [];
            // Show the next notification after a delay of 500ms (after the current notification is dismissed)
            (0, async_1.$Hg)(nextNotificaiton ? 500 : 0)
                .then(() => {
                this.M();
                if (nextNotificaiton) {
                    this.g = { recommendationsNotification: nextNotificaiton.recommendationsNotification, source: nextNotificaiton.source, from: Date.now() };
                    nextNotificaiton.recommendationsNotification.show();
                }
            });
        }
        /**
         * Return the recent high priroity pending notification
         */
        J() {
            let index = this.h.length - 1;
            if (this.h.length) {
                for (let i = 0; i < this.h.length; i++) {
                    if (this.h[i].source <= this.h[index].source) {
                        index = i;
                    }
                }
            }
            return index;
        }
        L(timeInMillis) {
            if (this.g && !this.f) {
                const visibleNotification = this.g;
                this.f = (0, async_1.$Hg)(Math.max(timeInMillis - (Date.now() - visibleNotification.from), 0));
                this.f.then(() => visibleNotification.recommendationsNotification.hide());
            }
        }
        M() {
            this.f?.cancel();
            this.f = undefined;
            this.g = undefined;
        }
        async N(extensionIds) {
            const result = [];
            if (extensionIds.length) {
                const extensions = await this.t.getExtensions(extensionIds.map(id => ({ id })), { source: 'install-recommendations' }, cancellation_1.CancellationToken.None);
                for (const extension of extensions) {
                    if (extension.gallery && (await this.u.canInstall(extension.gallery))) {
                        result.push(extension);
                    }
                }
            }
            return result;
        }
        async O(action) {
            try {
                await action.run();
            }
            finally {
                if ((0, lifecycle_1.$ec)(action)) {
                    action.dispose();
                }
            }
        }
        P(id) {
            const importantRecommendationsIgnoreList = [...this.ignoredRecommendations];
            if (!importantRecommendationsIgnoreList.includes(id.toLowerCase())) {
                importantRecommendationsIgnoreList.push(id.toLowerCase());
                this.m.store(ignoreImportantExtensionRecommendationStorageKey, JSON.stringify(importantRecommendationsIgnoreList), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            }
        }
        Q(configVal) {
            this.j.updateValue('extensions.ignoreRecommendations', configVal);
        }
        R(o) {
            this.B((0, lifecycle_1.$ic)(() => o.cancel()));
            return o;
        }
    };
    exports.$4Ub = $4Ub;
    exports.$4Ub = $4Ub = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, storage_1.$Vo),
        __param(2, notification_1.$Yu),
        __param(3, telemetry_1.$9k),
        __param(4, instantiation_1.$Ah),
        __param(5, extensions_1.$Pfb),
        __param(6, extensionManagement_1.$hcb),
        __param(7, extensionManagement_1.$icb),
        __param(8, extensionRecommendations_2.$0fb),
        __param(9, userDataSync_1.$Pgb),
        __param(10, environmentService_1.$hJ)
    ], $4Ub);
});
//# sourceMappingURL=extensionRecommendationNotificationService.js.map