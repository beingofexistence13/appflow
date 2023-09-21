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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/platform/instantiation/common/instantiation", "vs/platform/telemetry/common/telemetry", "vs/base/common/arrays", "vs/base/common/event", "vs/platform/environment/common/environment", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/contrib/extensions/browser/exeBasedRecommendations", "vs/workbench/contrib/extensions/browser/workspaceRecommendations", "vs/workbench/contrib/extensions/browser/fileBasedRecommendations", "vs/workbench/contrib/extensions/browser/keymapRecommendations", "vs/workbench/contrib/extensions/browser/languageRecommendations", "vs/workbench/contrib/extensions/browser/configBasedRecommendations", "vs/platform/extensionRecommendations/common/extensionRecommendations", "vs/base/common/async", "vs/base/common/uri", "vs/workbench/contrib/extensions/browser/webRecommendations", "vs/workbench/contrib/extensions/common/extensions", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/workbench/contrib/extensions/browser/remoteRecommendations", "vs/platform/remote/common/remoteExtensionsScanner", "vs/workbench/services/userData/browser/userDataInit"], function (require, exports, lifecycle_1, extensionManagement_1, extensionRecommendations_1, instantiation_1, telemetry_1, arrays_1, event_1, environment_1, lifecycle_2, exeBasedRecommendations_1, workspaceRecommendations_1, fileBasedRecommendations_1, keymapRecommendations_1, languageRecommendations_1, configBasedRecommendations_1, extensionRecommendations_2, async_1, uri_1, webRecommendations_1, extensions_1, extensionManagementUtil_1, remoteRecommendations_1, remoteExtensionsScanner_1, userDataInit_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionRecommendationsService = void 0;
    let ExtensionRecommendationsService = class ExtensionRecommendationsService extends lifecycle_1.Disposable {
        constructor(instantiationService, lifecycleService, galleryService, telemetryService, environmentService, extensionManagementService, extensionRecommendationsManagementService, extensionRecommendationNotificationService, extensionsWorkbenchService, remoteExtensionsScannerService, userDataInitializationService) {
            super();
            this.lifecycleService = lifecycleService;
            this.galleryService = galleryService;
            this.telemetryService = telemetryService;
            this.environmentService = environmentService;
            this.extensionManagementService = extensionManagementService;
            this.extensionRecommendationsManagementService = extensionRecommendationsManagementService;
            this.extensionRecommendationNotificationService = extensionRecommendationNotificationService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.remoteExtensionsScannerService = remoteExtensionsScannerService;
            this.userDataInitializationService = userDataInitializationService;
            this._onDidChangeRecommendations = this._register(new event_1.Emitter());
            this.onDidChangeRecommendations = this._onDidChangeRecommendations.event;
            this.workspaceRecommendations = this._register(instantiationService.createInstance(workspaceRecommendations_1.WorkspaceRecommendations));
            this.fileBasedRecommendations = this._register(instantiationService.createInstance(fileBasedRecommendations_1.FileBasedRecommendations));
            this.configBasedRecommendations = this._register(instantiationService.createInstance(configBasedRecommendations_1.ConfigBasedRecommendations));
            this.exeBasedRecommendations = this._register(instantiationService.createInstance(exeBasedRecommendations_1.ExeBasedRecommendations));
            this.keymapRecommendations = this._register(instantiationService.createInstance(keymapRecommendations_1.KeymapRecommendations));
            this.webRecommendations = this._register(instantiationService.createInstance(webRecommendations_1.WebRecommendations));
            this.languageRecommendations = this._register(instantiationService.createInstance(languageRecommendations_1.LanguageRecommendations));
            this.remoteRecommendations = this._register(instantiationService.createInstance(remoteRecommendations_1.RemoteRecommendations));
            if (!this.isEnabled()) {
                this.sessionSeed = 0;
                this.activationPromise = Promise.resolve();
                return;
            }
            this.sessionSeed = +new Date();
            // Activation
            this.activationPromise = this.activate();
            this._register(this.extensionManagementService.onDidInstallExtensions(e => this.onDidInstallExtensions(e)));
        }
        async activate() {
            try {
                await Promise.allSettled([
                    this.remoteExtensionsScannerService.whenExtensionsReady(),
                    this.userDataInitializationService.whenInitializationFinished(),
                    this.lifecycleService.when(3 /* LifecyclePhase.Restored */)
                ]);
            }
            catch (error) { /* ignore */ }
            // activate all recommendations
            await Promise.all([
                this.workspaceRecommendations.activate(),
                this.configBasedRecommendations.activate(),
                this.fileBasedRecommendations.activate(),
                this.keymapRecommendations.activate(),
                this.languageRecommendations.activate(),
                this.webRecommendations.activate(),
                this.remoteRecommendations.activate()
            ]);
            this._register(event_1.Event.any(this.workspaceRecommendations.onDidChangeRecommendations, this.configBasedRecommendations.onDidChangeRecommendations, this.extensionRecommendationsManagementService.onDidChangeIgnoredRecommendations)(() => this._onDidChangeRecommendations.fire()));
            this._register(this.extensionRecommendationsManagementService.onDidChangeGlobalIgnoredRecommendation(({ extensionId, isRecommended }) => {
                if (!isRecommended) {
                    const reason = this.getAllRecommendationsWithReason()[extensionId];
                    if (reason && reason.reasonId) {
                        this.telemetryService.publicLog2('extensionsRecommendations:ignoreRecommendation', { extensionId, recommendationReason: reason.reasonId });
                    }
                }
            }));
            this.promptWorkspaceRecommendations();
        }
        isEnabled() {
            return this.galleryService.isEnabled() && !this.environmentService.isExtensionDevelopment;
        }
        async activateProactiveRecommendations() {
            await Promise.all([this.exeBasedRecommendations.activate(), this.configBasedRecommendations.activate()]);
        }
        getAllRecommendationsWithReason() {
            /* Activate proactive recommendations */
            this.activateProactiveRecommendations();
            const output = Object.create(null);
            const allRecommendations = [
                ...this.configBasedRecommendations.recommendations,
                ...this.exeBasedRecommendations.recommendations,
                ...this.fileBasedRecommendations.recommendations,
                ...this.workspaceRecommendations.recommendations,
                ...this.keymapRecommendations.recommendations,
                ...this.languageRecommendations.recommendations,
                ...this.webRecommendations.recommendations,
            ];
            for (const { extensionId, reason } of allRecommendations) {
                if (this.isExtensionAllowedToBeRecommended(extensionId)) {
                    output[extensionId.toLowerCase()] = reason;
                }
            }
            return output;
        }
        async getConfigBasedRecommendations() {
            await this.configBasedRecommendations.activate();
            return {
                important: this.toExtensionRecommendations(this.configBasedRecommendations.importantRecommendations),
                others: this.toExtensionRecommendations(this.configBasedRecommendations.otherRecommendations)
            };
        }
        async getOtherRecommendations() {
            await this.activationPromise;
            await this.activateProactiveRecommendations();
            const recommendations = [
                ...this.configBasedRecommendations.otherRecommendations,
                ...this.exeBasedRecommendations.otherRecommendations,
                ...this.webRecommendations.recommendations
            ];
            const extensionIds = (0, arrays_1.distinct)(recommendations.map(e => e.extensionId))
                .filter(extensionId => this.isExtensionAllowedToBeRecommended(extensionId));
            (0, arrays_1.shuffle)(extensionIds, this.sessionSeed);
            return extensionIds;
        }
        async getImportantRecommendations() {
            await this.activateProactiveRecommendations();
            const recommendations = [
                ...this.fileBasedRecommendations.importantRecommendations,
                ...this.configBasedRecommendations.importantRecommendations,
                ...this.exeBasedRecommendations.importantRecommendations,
            ];
            const extensionIds = (0, arrays_1.distinct)(recommendations.map(e => e.extensionId))
                .filter(extensionId => this.isExtensionAllowedToBeRecommended(extensionId));
            (0, arrays_1.shuffle)(extensionIds, this.sessionSeed);
            return extensionIds;
        }
        getKeymapRecommendations() {
            return this.toExtensionRecommendations(this.keymapRecommendations.recommendations);
        }
        getLanguageRecommendations() {
            return this.toExtensionRecommendations(this.languageRecommendations.recommendations);
        }
        getRemoteRecommendations() {
            return this.toExtensionRecommendations(this.remoteRecommendations.recommendations);
        }
        async getWorkspaceRecommendations() {
            if (!this.isEnabled()) {
                return [];
            }
            await this.workspaceRecommendations.activate();
            return this.toExtensionRecommendations(this.workspaceRecommendations.recommendations);
        }
        async getExeBasedRecommendations(exe) {
            await this.exeBasedRecommendations.activate();
            const { important, others } = exe ? this.exeBasedRecommendations.getRecommendations(exe)
                : { important: this.exeBasedRecommendations.importantRecommendations, others: this.exeBasedRecommendations.otherRecommendations };
            return { important: this.toExtensionRecommendations(important), others: this.toExtensionRecommendations(others) };
        }
        getFileBasedRecommendations() {
            return this.toExtensionRecommendations(this.fileBasedRecommendations.recommendations);
        }
        onDidInstallExtensions(results) {
            for (const e of results) {
                if (e.source && !uri_1.URI.isUri(e.source) && e.operation === 2 /* InstallOperation.Install */) {
                    const extRecommendations = this.getAllRecommendationsWithReason() || {};
                    const recommendationReason = extRecommendations[e.source.identifier.id.toLowerCase()];
                    if (recommendationReason) {
                        /* __GDPR__
                            "extensionGallery:install:recommendations" : {
                                "owner": "sandy081",
                                "recommendationReason": { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                                "${include}": [
                                    "${GalleryExtensionTelemetryData}"
                                ]
                            }
                        */
                        this.telemetryService.publicLog('extensionGallery:install:recommendations', { ...e.source.telemetryData, recommendationReason: recommendationReason.reasonId });
                    }
                }
            }
        }
        toExtensionRecommendations(recommendations) {
            const extensionIds = (0, arrays_1.distinct)(recommendations.map(e => e.extensionId))
                .filter(extensionId => this.isExtensionAllowedToBeRecommended(extensionId));
            return extensionIds;
        }
        isExtensionAllowedToBeRecommended(extensionId) {
            return !this.extensionRecommendationsManagementService.ignoredRecommendations.includes(extensionId.toLowerCase());
        }
        async promptWorkspaceRecommendations() {
            const installed = await this.extensionsWorkbenchService.queryLocal();
            const allowedRecommendations = [
                ...this.workspaceRecommendations.recommendations,
                ...this.configBasedRecommendations.importantRecommendations.filter(recommendation => !recommendation.whenNotInstalled || recommendation.whenNotInstalled.every(id => installed.every(local => !(0, extensionManagementUtil_1.areSameExtensions)(local.identifier, { id }))))
            ]
                .map(({ extensionId }) => extensionId)
                .filter(extensionId => this.isExtensionAllowedToBeRecommended(extensionId));
            if (allowedRecommendations.length) {
                await this._registerP((0, async_1.timeout)(5000));
                await this.extensionRecommendationNotificationService.promptWorkspaceRecommendations(allowedRecommendations);
            }
        }
        _registerP(o) {
            this._register((0, lifecycle_1.toDisposable)(() => o.cancel()));
            return o;
        }
    };
    exports.ExtensionRecommendationsService = ExtensionRecommendationsService;
    exports.ExtensionRecommendationsService = ExtensionRecommendationsService = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, lifecycle_2.ILifecycleService),
        __param(2, extensionManagement_1.IExtensionGalleryService),
        __param(3, telemetry_1.ITelemetryService),
        __param(4, environment_1.IEnvironmentService),
        __param(5, extensionManagement_1.IExtensionManagementService),
        __param(6, extensionRecommendations_1.IExtensionIgnoredRecommendationsService),
        __param(7, extensionRecommendations_2.IExtensionRecommendationNotificationService),
        __param(8, extensions_1.IExtensionsWorkbenchService),
        __param(9, remoteExtensionsScanner_1.IRemoteExtensionsScannerService),
        __param(10, userDataInit_1.IUserDataInitializationService)
    ], ExtensionRecommendationsService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uUmVjb21tZW5kYXRpb25zU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2V4dGVuc2lvbnMvYnJvd3Nlci9leHRlbnNpb25SZWNvbW1lbmRhdGlvbnNTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW1DekYsSUFBTSwrQkFBK0IsR0FBckMsTUFBTSwrQkFBZ0MsU0FBUSxzQkFBVTtRQW9COUQsWUFDd0Isb0JBQTJDLEVBQy9DLGdCQUFvRCxFQUM3QyxjQUF5RCxFQUNoRSxnQkFBb0QsRUFDbEQsa0JBQXdELEVBQ2hELDBCQUF3RSxFQUM1RCx5Q0FBbUcsRUFDL0YsMENBQXdHLEVBQ3hILDBCQUF3RSxFQUNwRSw4QkFBZ0YsRUFDakYsNkJBQThFO1lBRTlHLEtBQUssRUFBRSxDQUFDO1lBWDRCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDNUIsbUJBQWMsR0FBZCxjQUFjLENBQTBCO1lBQy9DLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDakMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUMvQiwrQkFBMEIsR0FBMUIsMEJBQTBCLENBQTZCO1lBQzNDLDhDQUF5QyxHQUF6Qyx5Q0FBeUMsQ0FBeUM7WUFDOUUsK0NBQTBDLEdBQTFDLDBDQUEwQyxDQUE2QztZQUN2RywrQkFBMEIsR0FBMUIsMEJBQTBCLENBQTZCO1lBQ25ELG1DQUE4QixHQUE5Qiw4QkFBOEIsQ0FBaUM7WUFDaEUsa0NBQTZCLEdBQTdCLDZCQUE2QixDQUFnQztZQWR2RyxnQ0FBMkIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUNqRSwrQkFBMEIsR0FBRyxJQUFJLENBQUMsMkJBQTJCLENBQUMsS0FBSyxDQUFDO1lBaUI1RSxJQUFJLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsbURBQXdCLENBQUMsQ0FBQyxDQUFDO1lBQzlHLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxtREFBd0IsQ0FBQyxDQUFDLENBQUM7WUFDOUcsSUFBSSxDQUFDLDBCQUEwQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLHVEQUEwQixDQUFDLENBQUMsQ0FBQztZQUNsSCxJQUFJLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsaURBQXVCLENBQUMsQ0FBQyxDQUFDO1lBQzVHLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyw2Q0FBcUIsQ0FBQyxDQUFDLENBQUM7WUFDeEcsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLHVDQUFrQixDQUFDLENBQUMsQ0FBQztZQUNsRyxJQUFJLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsaURBQXVCLENBQUMsQ0FBQyxDQUFDO1lBQzVHLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyw2Q0FBcUIsQ0FBQyxDQUFDLENBQUM7WUFFeEcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRTtnQkFDdEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzNDLE9BQU87YUFDUDtZQUVELElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO1lBRS9CLGFBQWE7WUFDYixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRXpDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3RyxDQUFDO1FBRU8sS0FBSyxDQUFDLFFBQVE7WUFDckIsSUFBSTtnQkFDSCxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUM7b0JBQ3hCLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxtQkFBbUIsRUFBRTtvQkFDekQsSUFBSSxDQUFDLDZCQUE2QixDQUFDLDBCQUEwQixFQUFFO29CQUMvRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxpQ0FBeUI7aUJBQUMsQ0FBQyxDQUFDO2FBQ3ZEO1lBQUMsT0FBTyxLQUFLLEVBQUUsRUFBRSxZQUFZLEVBQUU7WUFFaEMsK0JBQStCO1lBQy9CLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztnQkFDakIsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFFBQVEsRUFBRTtnQkFDeEMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFFBQVEsRUFBRTtnQkFDMUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFFBQVEsRUFBRTtnQkFDeEMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsRUFBRTtnQkFDckMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFFBQVEsRUFBRTtnQkFDdkMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRTtnQkFDbEMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsRUFBRTthQUNyQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLDBCQUEwQixFQUFFLElBQUksQ0FBQywwQkFBMEIsQ0FBQywwQkFBMEIsRUFBRSxJQUFJLENBQUMseUNBQXlDLENBQUMsaUNBQWlDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2pSLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLHNDQUFzQyxDQUFDLENBQUMsRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFFLEVBQUUsRUFBRTtnQkFDdkksSUFBSSxDQUFDLGFBQWEsRUFBRTtvQkFDbkIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLCtCQUErQixFQUFFLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQ25FLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUU7d0JBQzlCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQW1ILGdEQUFnRCxFQUFFLEVBQUUsV0FBVyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO3FCQUM3UDtpQkFDRDtZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsOEJBQThCLEVBQUUsQ0FBQztRQUN2QyxDQUFDO1FBRU8sU0FBUztZQUNoQixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsc0JBQXNCLENBQUM7UUFDM0YsQ0FBQztRQUVPLEtBQUssQ0FBQyxnQ0FBZ0M7WUFDN0MsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDMUcsQ0FBQztRQUVELCtCQUErQjtZQUM5Qix3Q0FBd0M7WUFDeEMsSUFBSSxDQUFDLGdDQUFnQyxFQUFFLENBQUM7WUFFeEMsTUFBTSxNQUFNLEdBQXNGLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFdEgsTUFBTSxrQkFBa0IsR0FBRztnQkFDMUIsR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsZUFBZTtnQkFDbEQsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsZUFBZTtnQkFDL0MsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsZUFBZTtnQkFDaEQsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsZUFBZTtnQkFDaEQsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsZUFBZTtnQkFDN0MsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsZUFBZTtnQkFDL0MsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsZUFBZTthQUMxQyxDQUFDO1lBRUYsS0FBSyxNQUFNLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxJQUFJLGtCQUFrQixFQUFFO2dCQUN6RCxJQUFJLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxXQUFXLENBQUMsRUFBRTtvQkFDeEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQztpQkFDM0M7YUFDRDtZQUVELE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUVELEtBQUssQ0FBQyw2QkFBNkI7WUFDbEMsTUFBTSxJQUFJLENBQUMsMEJBQTBCLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDakQsT0FBTztnQkFDTixTQUFTLEVBQUUsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyx3QkFBd0IsQ0FBQztnQkFDcEcsTUFBTSxFQUFFLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsb0JBQW9CLENBQUM7YUFDN0YsQ0FBQztRQUNILENBQUM7UUFFRCxLQUFLLENBQUMsdUJBQXVCO1lBQzVCLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDO1lBQzdCLE1BQU0sSUFBSSxDQUFDLGdDQUFnQyxFQUFFLENBQUM7WUFFOUMsTUFBTSxlQUFlLEdBQUc7Z0JBQ3ZCLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLG9CQUFvQjtnQkFDdkQsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsb0JBQW9CO2dCQUNwRCxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlO2FBQzFDLENBQUM7WUFFRixNQUFNLFlBQVksR0FBRyxJQUFBLGlCQUFRLEVBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQztpQkFDcEUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFFN0UsSUFBQSxnQkFBTyxFQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFeEMsT0FBTyxZQUFZLENBQUM7UUFDckIsQ0FBQztRQUVELEtBQUssQ0FBQywyQkFBMkI7WUFDaEMsTUFBTSxJQUFJLENBQUMsZ0NBQWdDLEVBQUUsQ0FBQztZQUU5QyxNQUFNLGVBQWUsR0FBRztnQkFDdkIsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsd0JBQXdCO2dCQUN6RCxHQUFHLElBQUksQ0FBQywwQkFBMEIsQ0FBQyx3QkFBd0I7Z0JBQzNELEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLHdCQUF3QjthQUN4RCxDQUFDO1lBRUYsTUFBTSxZQUFZLEdBQUcsSUFBQSxpQkFBUSxFQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7aUJBQ3BFLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBRTdFLElBQUEsZ0JBQU8sRUFBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRXhDLE9BQU8sWUFBWSxDQUFDO1FBQ3JCLENBQUM7UUFFRCx3QkFBd0I7WUFDdkIsT0FBTyxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3BGLENBQUM7UUFFRCwwQkFBMEI7WUFDekIsT0FBTyxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3RGLENBQUM7UUFFRCx3QkFBd0I7WUFDdkIsT0FBTyxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3BGLENBQUM7UUFFRCxLQUFLLENBQUMsMkJBQTJCO1lBQ2hDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUU7Z0JBQ3RCLE9BQU8sRUFBRSxDQUFDO2FBQ1Y7WUFDRCxNQUFNLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUMvQyxPQUFPLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDdkYsQ0FBQztRQUVELEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxHQUFZO1lBQzVDLE1BQU0sSUFBSSxDQUFDLHVCQUF1QixDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzlDLE1BQU0sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDO2dCQUN2RixDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLHdCQUF3QixFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUNuSSxPQUFPLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxTQUFTLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLDBCQUEwQixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDbkgsQ0FBQztRQUVELDJCQUEyQjtZQUMxQixPQUFPLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDdkYsQ0FBQztRQUVPLHNCQUFzQixDQUFDLE9BQTBDO1lBQ3hFLEtBQUssTUFBTSxDQUFDLElBQUksT0FBTyxFQUFFO2dCQUN4QixJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxxQ0FBNkIsRUFBRTtvQkFDakYsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsK0JBQStCLEVBQUUsSUFBSSxFQUFFLENBQUM7b0JBQ3hFLE1BQU0sb0JBQW9CLEdBQUcsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7b0JBQ3RGLElBQUksb0JBQW9CLEVBQUU7d0JBQ3pCOzs7Ozs7OzswQkFRRTt3QkFDRixJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLDBDQUEwQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxvQkFBb0IsRUFBRSxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO3FCQUNoSztpQkFDRDthQUNEO1FBQ0YsQ0FBQztRQUVPLDBCQUEwQixDQUFDLGVBQXVEO1lBQ3pGLE1BQU0sWUFBWSxHQUFHLElBQUEsaUJBQVEsRUFBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2lCQUNwRSxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUNBQWlDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUU3RSxPQUFPLFlBQVksQ0FBQztRQUNyQixDQUFDO1FBRU8saUNBQWlDLENBQUMsV0FBbUI7WUFDNUQsT0FBTyxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDbkgsQ0FBQztRQUVPLEtBQUssQ0FBQyw4QkFBOEI7WUFDM0MsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsMEJBQTBCLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDckUsTUFBTSxzQkFBc0IsR0FBRztnQkFDOUIsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsZUFBZTtnQkFDaEQsR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsd0JBQXdCLENBQUMsTUFBTSxDQUNqRSxjQUFjLENBQUMsRUFBRSxDQUFDLENBQUMsY0FBYyxDQUFDLGdCQUFnQixJQUFJLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFBLDJDQUFpQixFQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMzSztpQkFDQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUM7aUJBQ3JDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBRTdFLElBQUksc0JBQXNCLENBQUMsTUFBTSxFQUFFO2dCQUNsQyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBQSxlQUFPLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDckMsTUFBTSxJQUFJLENBQUMsMENBQTBDLENBQUMsOEJBQThCLENBQUMsc0JBQXNCLENBQUMsQ0FBQzthQUM3RztRQUNGLENBQUM7UUFFTyxVQUFVLENBQUksQ0FBdUI7WUFDNUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMvQyxPQUFPLENBQUMsQ0FBQztRQUNWLENBQUM7S0FDRCxDQUFBO0lBelBZLDBFQUErQjs4Q0FBL0IsK0JBQStCO1FBcUJ6QyxXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsNkJBQWlCLENBQUE7UUFDakIsV0FBQSw4Q0FBd0IsQ0FBQTtRQUN4QixXQUFBLDZCQUFpQixDQUFBO1FBQ2pCLFdBQUEsaUNBQW1CLENBQUE7UUFDbkIsV0FBQSxpREFBMkIsQ0FBQTtRQUMzQixXQUFBLGtFQUF1QyxDQUFBO1FBQ3ZDLFdBQUEsc0VBQTJDLENBQUE7UUFDM0MsV0FBQSx3Q0FBMkIsQ0FBQTtRQUMzQixXQUFBLHlEQUErQixDQUFBO1FBQy9CLFlBQUEsNkNBQThCLENBQUE7T0EvQnBCLCtCQUErQixDQXlQM0MifQ==