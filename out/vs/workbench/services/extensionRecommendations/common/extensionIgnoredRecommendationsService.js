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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/instantiation/common/extensions", "vs/platform/storage/common/storage", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/workbench/services/extensionRecommendations/common/workspaceExtensionsConfig"], function (require, exports, arrays_1, event_1, lifecycle_1, extensions_1, storage_1, extensionRecommendations_1, workspaceExtensionsConfig_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionIgnoredRecommendationsService = void 0;
    const ignoredRecommendationsStorageKey = 'extensionsAssistant/ignored_recommendations';
    let ExtensionIgnoredRecommendationsService = class ExtensionIgnoredRecommendationsService extends lifecycle_1.Disposable {
        get globalIgnoredRecommendations() { return [...this._globalIgnoredRecommendations]; }
        get ignoredRecommendations() { return (0, arrays_1.distinct)([...this.globalIgnoredRecommendations, ...this.ignoredWorkspaceRecommendations]); }
        constructor(workspaceExtensionsConfigService, storageService) {
            super();
            this.workspaceExtensionsConfigService = workspaceExtensionsConfigService;
            this.storageService = storageService;
            this._onDidChangeIgnoredRecommendations = this._register(new event_1.Emitter());
            this.onDidChangeIgnoredRecommendations = this._onDidChangeIgnoredRecommendations.event;
            // Global Ignored Recommendations
            this._globalIgnoredRecommendations = [];
            this._onDidChangeGlobalIgnoredRecommendation = this._register(new event_1.Emitter());
            this.onDidChangeGlobalIgnoredRecommendation = this._onDidChangeGlobalIgnoredRecommendation.event;
            // Ignored Workspace Recommendations
            this.ignoredWorkspaceRecommendations = [];
            this._globalIgnoredRecommendations = this.getCachedIgnoredRecommendations();
            this._register(this.storageService.onDidChangeValue(0 /* StorageScope.PROFILE */, ignoredRecommendationsStorageKey, this._register(new lifecycle_1.DisposableStore()))(e => this.onDidStorageChange()));
            this.initIgnoredWorkspaceRecommendations();
        }
        async initIgnoredWorkspaceRecommendations() {
            this.ignoredWorkspaceRecommendations = await this.workspaceExtensionsConfigService.getUnwantedRecommendations();
            this._onDidChangeIgnoredRecommendations.fire();
            this._register(this.workspaceExtensionsConfigService.onDidChangeExtensionsConfigs(async () => {
                this.ignoredWorkspaceRecommendations = await this.workspaceExtensionsConfigService.getUnwantedRecommendations();
                this._onDidChangeIgnoredRecommendations.fire();
            }));
        }
        toggleGlobalIgnoredRecommendation(extensionId, shouldIgnore) {
            extensionId = extensionId.toLowerCase();
            const ignored = this._globalIgnoredRecommendations.indexOf(extensionId) !== -1;
            if (ignored === shouldIgnore) {
                return;
            }
            this._globalIgnoredRecommendations = shouldIgnore ? [...this._globalIgnoredRecommendations, extensionId] : this._globalIgnoredRecommendations.filter(id => id !== extensionId);
            this.storeCachedIgnoredRecommendations(this._globalIgnoredRecommendations);
            this._onDidChangeGlobalIgnoredRecommendation.fire({ extensionId, isRecommended: !shouldIgnore });
            this._onDidChangeIgnoredRecommendations.fire();
        }
        getCachedIgnoredRecommendations() {
            const ignoredRecommendations = JSON.parse(this.ignoredRecommendationsValue);
            return ignoredRecommendations.map(e => e.toLowerCase());
        }
        onDidStorageChange() {
            if (this.ignoredRecommendationsValue !== this.getStoredIgnoredRecommendationsValue() /* This checks if current window changed the value or not */) {
                this._ignoredRecommendationsValue = undefined;
                this._globalIgnoredRecommendations = this.getCachedIgnoredRecommendations();
                this._onDidChangeIgnoredRecommendations.fire();
            }
        }
        storeCachedIgnoredRecommendations(ignoredRecommendations) {
            this.ignoredRecommendationsValue = JSON.stringify(ignoredRecommendations);
        }
        get ignoredRecommendationsValue() {
            if (!this._ignoredRecommendationsValue) {
                this._ignoredRecommendationsValue = this.getStoredIgnoredRecommendationsValue();
            }
            return this._ignoredRecommendationsValue;
        }
        set ignoredRecommendationsValue(ignoredRecommendationsValue) {
            if (this.ignoredRecommendationsValue !== ignoredRecommendationsValue) {
                this._ignoredRecommendationsValue = ignoredRecommendationsValue;
                this.setStoredIgnoredRecommendationsValue(ignoredRecommendationsValue);
            }
        }
        getStoredIgnoredRecommendationsValue() {
            return this.storageService.get(ignoredRecommendationsStorageKey, 0 /* StorageScope.PROFILE */, '[]');
        }
        setStoredIgnoredRecommendationsValue(value) {
            this.storageService.store(ignoredRecommendationsStorageKey, value, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
    };
    exports.ExtensionIgnoredRecommendationsService = ExtensionIgnoredRecommendationsService;
    exports.ExtensionIgnoredRecommendationsService = ExtensionIgnoredRecommendationsService = __decorate([
        __param(0, workspaceExtensionsConfig_1.IWorkspaceExtensionsConfigService),
        __param(1, storage_1.IStorageService)
    ], ExtensionIgnoredRecommendationsService);
    (0, extensions_1.registerSingleton)(extensionRecommendations_1.IExtensionIgnoredRecommendationsService, ExtensionIgnoredRecommendationsService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uSWdub3JlZFJlY29tbWVuZGF0aW9uc1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZXh0ZW5zaW9uUmVjb21tZW5kYXRpb25zL2NvbW1vbi9leHRlbnNpb25JZ25vcmVkUmVjb21tZW5kYXRpb25zU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFVaEcsTUFBTSxnQ0FBZ0MsR0FBRyw2Q0FBNkMsQ0FBQztJQUVoRixJQUFNLHNDQUFzQyxHQUE1QyxNQUFNLHNDQUF1QyxTQUFRLHNCQUFVO1FBU3JFLElBQUksNEJBQTRCLEtBQWUsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBT2hHLElBQUksc0JBQXNCLEtBQWUsT0FBTyxJQUFBLGlCQUFRLEVBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyw0QkFBNEIsRUFBRSxHQUFHLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTVJLFlBQ29DLGdDQUFvRixFQUN0RyxjQUFnRDtZQUVqRSxLQUFLLEVBQUUsQ0FBQztZQUg0QyxxQ0FBZ0MsR0FBaEMsZ0NBQWdDLENBQW1DO1lBQ3JGLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQWhCMUQsdUNBQWtDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDeEUsc0NBQWlDLEdBQUcsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLEtBQUssQ0FBQztZQUUzRixpQ0FBaUM7WUFDekIsa0NBQTZCLEdBQWEsRUFBRSxDQUFDO1lBRTdDLDRDQUF1QyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQTJDLENBQUMsQ0FBQztZQUNoSCwyQ0FBc0MsR0FBRyxJ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