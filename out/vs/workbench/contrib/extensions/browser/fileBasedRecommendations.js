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
define(["require", "exports", "vs/workbench/contrib/extensions/browser/extensionRecommendations", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/workbench/contrib/extensions/common/extensions", "vs/nls", "vs/platform/storage/common/storage", "vs/platform/product/common/productService", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/glob", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/platform/extensionRecommendations/common/extensionRecommendations", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/base/common/async", "vs/platform/workspace/common/workspace", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/base/common/types", "vs/editor/common/languages/modesRegistry"], function (require, exports, extensionRecommendations_1, extensionRecommendations_2, extensions_1, nls_1, storage_1, productService_1, network_1, resources_1, glob_1, model_1, language_1, extensionRecommendations_3, arrays_1, lifecycle_1, notebookCommon_1, async_1, workspace_1, extensionManagementUtil_1, types_1, modesRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FileBasedRecommendations = void 0;
    const promptedRecommendationsStorageKey = 'fileBasedRecommendations/promptedRecommendations';
    const recommendationsStorageKey = 'extensionsAssistant/recommendations';
    const milliSecondsInADay = 1000 * 60 * 60 * 24;
    let FileBasedRecommendations = class FileBasedRecommendations extends extensionRecommendations_1.ExtensionRecommendations {
        get recommendations() {
            const recommendations = [];
            [...this.fileBasedRecommendations.keys()]
                .sort((a, b) => {
                if (this.fileBasedRecommendations.get(a).recommendedTime === this.fileBasedRecommendations.get(b).recommendedTime) {
                    if (this.fileBasedImportantRecommendations.has(a)) {
                        return -1;
                    }
                    if (this.fileBasedImportantRecommendations.has(b)) {
                        return 1;
                    }
                }
                return this.fileBasedRecommendations.get(a).recommendedTime > this.fileBasedRecommendations.get(b).recommendedTime ? -1 : 1;
            })
                .forEach(extensionId => {
                recommendations.push({
                    extensionId,
                    reason: {
                        reasonId: 1 /* ExtensionRecommendationReason.File */,
                        reasonText: (0, nls_1.localize)('fileBasedRecommendation', "This extension is recommended based on the files you recently opened.")
                    }
                });
            });
            return recommendations;
        }
        get importantRecommendations() {
            return this.recommendations.filter(e => this.fileBasedImportantRecommendations.has(e.extensionId));
        }
        get otherRecommendations() {
            return this.recommendations.filter(e => !this.fileBasedImportantRecommendations.has(e.extensionId));
        }
        constructor(extensionsWorkbenchService, modelService, languageService, productService, storageService, extensionRecommendationNotificationService, extensionIgnoredRecommendationsService, workspaceContextService) {
            super();
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.modelService = modelService;
            this.languageService = languageService;
            this.storageService = storageService;
            this.extensionRecommendationNotificationService = extensionRecommendationNotificationService;
            this.extensionIgnoredRecommendationsService = extensionIgnoredRecommendationsService;
            this.workspaceContextService = workspaceContextService;
            this.recommendationsByPattern = new Map();
            this.fileBasedRecommendations = new Map();
            this.fileBasedImportantRecommendations = new Set();
            this.fileOpenRecommendations = {};
            if (productService.extensionRecommendations) {
                for (const [extensionId, recommendation] of Object.entries(productService.extensionRecommendations)) {
                    if (recommendation.onFileOpen) {
                        this.fileOpenRecommendations[extensionId.toLowerCase()] = recommendation.onFileOpen;
                    }
                }
            }
        }
        async doActivate() {
            if ((0, types_1.isEmptyObject)(this.fileOpenRecommendations)) {
                return;
            }
            await this.extensionsWorkbenchService.whenInitialized;
            const cachedRecommendations = this.getCachedRecommendations();
            const now = Date.now();
            // Retire existing recommendations if they are older than a week or are not part of this.productService.extensionTips anymore
            Object.entries(cachedRecommendations).forEach(([key, value]) => {
                const diff = (now - value) / milliSecondsInADay;
                if (diff <= 7 && this.fileOpenRecommendations[key]) {
                    this.fileBasedRecommendations.set(key.toLowerCase(), { recommendedTime: value });
                }
            });
            this._register(this.modelService.onModelAdded(model => this.onModelAdded(model)));
            this.modelService.getModels().forEach(model => this.onModelAdded(model));
        }
        onModelAdded(model) {
            const uri = model.uri.scheme === network_1.Schemas.vscodeNotebookCell ? notebookCommon_1.CellUri.parse(model.uri)?.notebook : model.uri;
            if (!uri) {
                return;
            }
            const supportedSchemes = (0, arrays_1.distinct)([network_1.Schemas.untitled, network_1.Schemas.file, network_1.Schemas.vscodeRemote, ...this.workspaceContextService.getWorkspace().folders.map(folder => folder.uri.scheme)]);
            if (!uri || !supportedSchemes.includes(uri.scheme)) {
                return;
            }
            // re-schedule this bit of the operation to be off the critical path - in case glob-match is slow
            this._register((0, async_1.disposableTimeout)(() => this.promptImportantRecommendations(uri, model), 0));
        }
        /**
         * Prompt the user to either install the recommended extension for the file type in the current editor model
         * or prompt to search the marketplace if it has extensions that can support the file type
         */
        promptImportantRecommendations(uri, model, extensionRecommendations) {
            const pattern = (0, resources_1.extname)(uri).toLowerCase();
            extensionRecommendations = extensionRecommendations ?? this.recommendationsByPattern.get(pattern) ?? this.fileOpenRecommendations;
            const extensionRecommendationEntries = Object.entries(extensionRecommendations);
            if (extensionRecommendationEntries.length === 0) {
                return;
            }
            const processedPathGlobs = new Map();
            const installed = this.extensionsWorkbenchService.local;
            const recommendationsByPattern = {};
            const matchedRecommendations = {};
            const unmatchedRecommendations = {};
            let listenOnLanguageChange = false;
            for (const [extensionId, conditions] of extensionRecommendationEntries) {
                const conditionsByPattern = [];
                const matchedConditions = [];
                const unmatchedConditions = [];
                for (const condition of conditions) {
                    let languageMatched = false;
                    let pathGlobMatched = false;
                    const isLanguageCondition = !!condition.languages;
                    const isFileContentCondition = !!condition.contentPattern;
                    if (isLanguageCondition || isFileContentCondition) {
                        conditionsByPattern.push(condition);
                    }
                    if (isLanguageCondition) {
                        if (condition.languages.includes(model.getLanguageId())) {
                            languageMatched = true;
                        }
                    }
                    if (condition.pathGlob) {
                        const pathGlob = condition.pathGlob;
                        if (processedPathGlobs.get(pathGlob) ?? (0, glob_1.match)(condition.pathGlob, uri.with({ fragment: '' }).toString())) {
                            pathGlobMatched = true;
                        }
                        processedPathGlobs.set(pathGlob, pathGlobMatched);
                    }
                    if (!languageMatched && !pathGlobMatched) {
                        // If the language is not matched and the path glob is not matched, then we don't need to check the other conditions
                        continue;
                    }
                    let matched = true;
                    if (matched && condition.whenInstalled) {
                        if (!condition.whenInstalled.every(id => installed.some(local => (0, extensionManagementUtil_1.areSameExtensions)({ id }, local.identifier)))) {
                            matched = false;
                        }
                    }
                    if (matched && condition.whenNotInstalled) {
                        if (installed.some(local => condition.whenNotInstalled?.some(id => (0, extensionManagementUtil_1.areSameExtensions)({ id }, local.identifier)))) {
                            matched = false;
                        }
                    }
                    if (matched && isFileContentCondition) {
                        if (!model.findMatches(condition.contentPattern, false, true, false, null, false).length) {
                            matched = false;
                        }
                    }
                    if (matched) {
                        matchedConditions.push(condition);
                        conditionsByPattern.pop();
                    }
                    else {
                        if (isLanguageCondition || isFileContentCondition) {
                            unmatchedConditions.push(condition);
                            if (isLanguageCondition) {
                                listenOnLanguageChange = true;
                            }
                        }
                    }
                }
                if (matchedConditions.length) {
                    matchedRecommendations[extensionId] = matchedConditions;
                }
                if (unmatchedConditions.length) {
                    unmatchedRecommendations[extensionId] = unmatchedConditions;
                }
                if (conditionsByPattern.length) {
                    recommendationsByPattern[extensionId] = conditionsByPattern;
                }
            }
            this.recommendationsByPattern.set(pattern, recommendationsByPattern);
            if (Object.keys(unmatchedRecommendations).length) {
                if (listenOnLanguageChange) {
                    const disposables = new lifecycle_1.DisposableStore();
                    disposables.add(model.onDidChangeLanguage(() => {
                        // re-schedule this bit of the operation to be off the critical path - in case glob-match is slow
                        disposables.add((0, async_1.disposableTimeout)(() => {
                            if (!disposables.isDisposed) {
                                this.promptImportantRecommendations(uri, model, unmatchedRecommendations);
                                disposables.dispose();
                            }
                        }, 0));
                    }));
                    disposables.add(model.onWillDispose(() => disposables.dispose()));
                }
            }
            if (Object.keys(matchedRecommendations).length) {
                this.promptFromRecommendations(uri, model, matchedRecommendations);
            }
        }
        promptFromRecommendations(uri, model, extensionRecommendations) {
            let isImportantRecommendationForLanguage = false;
            const importantRecommendations = new Set();
            const fileBasedRecommendations = new Set();
            for (const [extensionId, conditions] of Object.entries(extensionRecommendations)) {
                for (const condition of conditions) {
                    fileBasedRecommendations.add(extensionId);
                    if (condition.important) {
                        importantRecommendations.add(extensionId);
                        this.fileBasedImportantRecommendations.add(extensionId);
                    }
                    if (condition.languages) {
                        isImportantRecommendationForLanguage = true;
                    }
                }
            }
            // Update file based recommendations
            for (const recommendation of fileBasedRecommendations) {
                const filedBasedRecommendation = this.fileBasedRecommendations.get(recommendation) || { recommendedTime: Date.now(), sources: [] };
                filedBasedRecommendation.recommendedTime = Date.now();
                this.fileBasedRecommendations.set(recommendation, filedBasedRecommendation);
            }
            this.storeCachedRecommendations();
            if (this.extensionRecommendationNotificationService.hasToIgnoreRecommendationNotifications()) {
                return;
            }
            const language = model.getLanguageId();
            const languageName = this.languageService.getLanguageName(language);
            if (importantRecommendations.size &&
                this.promptRecommendedExtensionForFileType(languageName && isImportantRecommendationForLanguage && language !== modesRegistry_1.PLAINTEXT_LANGUAGE_ID ? (0, nls_1.localize)('languageName', "the {0} language", languageName) : (0, resources_1.basename)(uri), language, [...importantRecommendations])) {
                return;
            }
        }
        promptRecommendedExtensionForFileType(name, language, recommendations) {
            recommendations = this.filterIgnoredOrNotAllowed(recommendations);
            if (recommendations.length === 0) {
                return false;
            }
            recommendations = this.filterInstalled(recommendations, this.extensionsWorkbenchService.local)
                .filter(extensionId => this.fileBasedImportantRecommendations.has(extensionId));
            const promptedRecommendations = language !== modesRegistry_1.PLAINTEXT_LANGUAGE_ID ? this.getPromptedRecommendations()[language] : undefined;
            if (promptedRecommendations) {
                recommendations = recommendations.filter(extensionId => promptedRecommendations.includes(extensionId));
            }
            if (recommendations.length === 0) {
                return false;
            }
            this.promptImportantExtensionsInstallNotification(recommendations, name, language);
            return true;
        }
        async promptImportantExtensionsInstallNotification(extensions, name, language) {
            try {
                const result = await this.extensionRecommendationNotificationService.promptImportantExtensionsInstallNotification({ extensions, name, source: 1 /* RecommendationSource.FILE */ });
                if (result === "reacted" /* RecommendationsNotificationResult.Accepted */) {
                    this.addToPromptedRecommendations(language, extensions);
                }
            }
            catch (error) { /* Ignore */ }
        }
        getPromptedRecommendations() {
            return JSON.parse(this.storageService.get(promptedRecommendationsStorageKey, 0 /* StorageScope.PROFILE */, '{}'));
        }
        addToPromptedRecommendations(language, extensions) {
            const promptedRecommendations = this.getPromptedRecommendations();
            promptedRecommendations[language] = (0, arrays_1.distinct)([...(promptedRecommendations[language] ?? []), ...extensions]);
            this.storageService.store(promptedRecommendationsStorageKey, JSON.stringify(promptedRecommendations), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
        filterIgnoredOrNotAllowed(recommendationsToSuggest) {
            const ignoredRecommendations = [...this.extensionIgnoredRecommendationsService.ignoredRecommendations, ...this.extensionRecommendationNotificationService.ignoredRecommendations];
            return recommendationsToSuggest.filter(id => !ignoredRecommendations.includes(id));
        }
        filterInstalled(recommendationsToSuggest, installed) {
            const installedExtensionsIds = installed.reduce((result, i) => {
                if (i.enablementState !== 1 /* EnablementState.DisabledByExtensionKind */) {
                    result.add(i.identifier.id.toLowerCase());
                }
                return result;
            }, new Set());
            return recommendationsToSuggest.filter(id => !installedExtensionsIds.has(id.toLowerCase()));
        }
        getCachedRecommendations() {
            let storedRecommendations = JSON.parse(this.storageService.get(recommendationsStorageKey, 0 /* StorageScope.PROFILE */, '[]'));
            if (Array.isArray(storedRecommendations)) {
                storedRecommendations = storedRecommendations.reduce((result, id) => { result[id] = Date.now(); return result; }, {});
            }
            const result = {};
            Object.entries(storedRecommendations).forEach(([key, value]) => {
                if (typeof value === 'number') {
                    result[key.toLowerCase()] = value;
                }
            });
            return result;
        }
        storeCachedRecommendations() {
            const storedRecommendations = {};
            this.fileBasedRecommendations.forEach((value, key) => storedRecommendations[key] = value.recommendedTime);
            this.storageService.store(recommendationsStorageKey, JSON.stringify(storedRecommendations), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        }
    };
    exports.FileBasedRecommendations = FileBasedRecommendations;
    exports.FileBasedRecommendations = FileBasedRecommendations = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService),
        __param(1, model_1.IModelService),
        __param(2, language_1.ILanguageService),
        __param(3, productService_1.IProductService),
        __param(4, storage_1.IStorageService),
        __param(5, extensionRecommendations_3.IExtensionRecommendationNotificationService),
        __param(6, extensionRecommendations_2.IExtensionIgnoredRecommendationsService),
        __param(7, workspace_1.IWorkspaceContextService)
    ], FileBasedRecommendations);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZUJhc2VkUmVjb21tZW5kYXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZXh0ZW5zaW9ucy9icm93c2VyL2ZpbGVCYXNlZFJlY29tbWVuZGF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUE0QmhHLE1BQU0saUNBQWlDLEdBQUcsa0RBQWtELENBQUM7SUFDN0YsTUFBTSx5QkFBeUIsR0FBRyxxQ0FBcUMsQ0FBQztJQUN4RSxNQUFNLGtCQUFrQixHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztJQUV4QyxJQUFNLHdCQUF3QixHQUE5QixNQUFNLHdCQUF5QixTQUFRLG1EQUF3QjtRQU9yRSxJQUFJLGVBQWU7WUFDbEIsTUFBTSxlQUFlLEdBQThCLEVBQUUsQ0FBQztZQUN0RCxDQUFDLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksRUFBRSxDQUFDO2lCQUN2QyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2QsSUFBSSxJQUFJLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBRSxDQUFDLGVBQWUsS0FBSyxJQUFJLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBRSxDQUFDLGVBQWUsRUFBRTtvQkFDcEgsSUFBSSxJQUFJLENBQUMsaUNBQWlDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO3dCQUNsRCxPQUFPLENBQUMsQ0FBQyxDQUFDO3FCQUNWO29CQUNELElBQUksSUFBSSxDQUFDLGlDQUFpQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTt3QkFDbEQsT0FBTyxDQUFDLENBQUM7cUJBQ1Q7aUJBQ0Q7Z0JBQ0QsT0FBTyxJQUFJLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBRSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBRSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvSCxDQUFDLENBQUM7aUJBQ0QsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFO2dCQUN0QixlQUFlLENBQUMsSUFBSSxDQUFDO29CQUNwQixXQUFXO29CQUNYLE1BQU0sRUFBRTt3QkFDUCxRQUFRLDRDQUFvQzt3QkFDNUMsVUFBVSxFQUFFLElBQUEsY0FBUSxFQUFDLHlCQUF5QixFQUFFLHVFQUF1RSxDQUFDO3FCQUN4SDtpQkFDRCxDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU8sZUFBZSxDQUFDO1FBQ3hCLENBQUM7UUFFRCxJQUFJLHdCQUF3QjtZQUMzQixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNwRyxDQUFDO1FBRUQsSUFBSSxvQkFBb0I7WUFDdkIsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNyRyxDQUFDO1FBRUQsWUFDOEIsMEJBQXdFLEVBQ3RGLFlBQTRDLEVBQ3pDLGVBQWtELEVBQ25ELGNBQStCLEVBQy9CLGNBQWdELEVBQ3BCLDBDQUF3RyxFQUM1RyxzQ0FBZ0csRUFDL0csdUJBQWtFO1lBRTVGLEtBQUssRUFBRSxDQUFDO1lBVHNDLCtCQUEwQixHQUExQiwwQkFBMEIsQ0FBNkI7WUFDckUsaUJBQVksR0FBWixZQUFZLENBQWU7WUFDeEIsb0JBQWUsR0FBZixlQUFlLENBQWtCO1lBRWxDLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUNILCtDQUEwQyxHQUExQywwQ0FBMEMsQ0FBNkM7WUFDM0YsMkNBQXNDLEdBQXRDLHNDQUFzQyxDQUF5QztZQUM5Riw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQTBCO1lBOUM1RSw2QkFBd0IsR0FBRyxJQUFJLEdBQUcsRUFBbUQsQ0FBQztZQUN0Riw2QkFBd0IsR0FBRyxJQUFJLEdBQUcsRUFBdUMsQ0FBQztZQUMxRSxzQ0FBaUMsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1lBK0N0RSxJQUFJLENBQUMsdUJBQXVCLEdBQUcsRUFBRSxDQUFDO1lBQ2xDLElBQUksY0FBYyxDQUFDLHdCQUF3QixFQUFFO2dCQUM1QyxLQUFLLE1BQU0sQ0FBQyxXQUFXLEVBQUUsY0FBYyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsd0JBQXdCLENBQUMsRUFBRTtvQkFDcEcsSUFBSSxjQUFjLENBQUMsVUFBVSxFQUFFO3dCQUM5QixJQUFJLENBQUMsdUJBQXVCLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsY0FBYyxDQUFDLFVBQVUsQ0FBQztxQkFDcEY7aUJBQ0Q7YUFDRDtRQUNGLENBQUM7UUFFUyxLQUFLLENBQUMsVUFBVTtZQUN6QixJQUFJLElBQUEscUJBQWEsRUFBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsRUFBRTtnQkFDaEQsT0FBTzthQUNQO1lBRUQsTUFBTSxJQUFJLENBQUMsMEJBQTBCLENBQUMsZUFBZSxDQUFDO1lBRXRELE1BQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7WUFDOUQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ3ZCLDZIQUE2SDtZQUM3SCxNQUFNLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRTtnQkFDOUQsTUFBTSxJQUFJLEdBQUcsQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLEdBQUcsa0JBQWtCLENBQUM7Z0JBQ2hELElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ25ELElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7aUJBQ2pGO1lBQ0YsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEYsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDMUUsQ0FBQztRQUVPLFlBQVksQ0FBQyxLQUFpQjtZQUNyQyxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyx3QkFBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDO1lBQzdHLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ1QsT0FBTzthQUNQO1lBRUQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFBLGlCQUFRLEVBQUMsQ0FBQyxpQkFBTyxDQUFDLFFBQVEsRUFBRSxpQkFBTyxDQUFDLElBQUksRUFBRSxpQkFBTyxDQUFDLFlBQVksRUFBRSxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkwsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ25ELE9BQU87YUFDUDtZQUVELGlHQUFpRztZQUNqRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUEseUJBQWlCLEVBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdGLENBQUM7UUFFRDs7O1dBR0c7UUFDSyw4QkFBOEIsQ0FBQyxHQUFRLEVBQUUsS0FBaUIsRUFBRSx3QkFBa0U7WUFDckksTUFBTSxPQUFPLEdBQUcsSUFBQSxtQkFBTyxFQUFDLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzNDLHdCQUF3QixHQUFHLHdCQUF3QixJQUFJLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLHVCQUF1QixDQUFDO1lBQ2xJLE1BQU0sOEJBQThCLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1lBQ2hGLElBQUksOEJBQThCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDaEQsT0FBTzthQUNQO1lBRUQsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLEdBQUcsRUFBbUIsQ0FBQztZQUN0RCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsS0FBSyxDQUFDO1lBQ3hELE1BQU0sd0JBQXdCLEdBQTRDLEVBQUUsQ0FBQztZQUM3RSxNQUFNLHNCQUFzQixHQUE0QyxFQUFFLENBQUM7WUFDM0UsTUFBTSx3QkFBd0IsR0FBNEMsRUFBRSxDQUFDO1lBQzdFLElBQUksc0JBQXNCLEdBQUcsS0FBSyxDQUFDO1lBRW5DLEtBQUssTUFBTSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsSUFBSSw4QkFBOEIsRUFBRTtnQkFDdkUsTUFBTSxtQkFBbUIsR0FBeUIsRUFBRSxDQUFDO2dCQUNyRCxNQUFNLGlCQUFpQixHQUF5QixFQUFFLENBQUM7Z0JBQ25ELE1BQU0sbUJBQW1CLEdBQXlCLEVBQUUsQ0FBQztnQkFDckQsS0FBSyxNQUFNLFNBQVMsSUFBSSxVQUFVLEVBQUU7b0JBQ25DLElBQUksZUFBZSxHQUFHLEtBQUssQ0FBQztvQkFDNUIsSUFBSSxlQUFlLEdBQUcsS0FBSyxDQUFDO29CQUU1QixNQUFNLG1CQUFtQixHQUFHLENBQUMsQ0FBMEIsU0FBVSxDQUFDLFNBQVMsQ0FBQztvQkFDNUUsTUFBTSxzQkFBc0IsR0FBRyxDQUFDLENBQXlCLFNBQVUsQ0FBQyxjQUFjLENBQUM7b0JBQ25GLElBQUksbUJBQW1CLElBQUksc0JBQXNCLEVBQUU7d0JBQ2xELG1CQUFtQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztxQkFDcEM7b0JBRUQsSUFBSSxtQkFBbUIsRUFBRTt3QkFDeEIsSUFBNkIsU0FBVSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDLEVBQUU7NEJBQ2xGLGVBQWUsR0FBRyxJQUFJLENBQUM7eUJBQ3ZCO3FCQUNEO29CQUVELElBQXlCLFNBQVUsQ0FBQyxRQUFRLEVBQUU7d0JBQzdDLE1BQU0sUUFBUSxHQUF3QixTQUFVLENBQUMsUUFBUSxDQUFDO3dCQUMxRCxJQUFJLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFBLFlBQUssRUFBc0IsU0FBVSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRTs0QkFDL0gsZUFBZSxHQUFHLElBQUksQ0FBQzt5QkFDdkI7d0JBQ0Qsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxlQUFlLENBQUMsQ0FBQztxQkFDbEQ7b0JBRUQsSUFBSSxDQUFDLGVBQWUsSUFBSSxDQUFDLGVBQWUsRUFBRTt3QkFDekMsb0hBQW9IO3dCQUNwSCxTQUFTO3FCQUNUO29CQUVELElBQUksT0FBTyxHQUFHLElBQUksQ0FBQztvQkFDbkIsSUFBSSxPQUFPLElBQUksU0FBUyxDQUFDLGFBQWEsRUFBRTt3QkFDdkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUEsMkNBQWlCLEVBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFOzRCQUMvRyxPQUFPLEdBQUcsS0FBSyxDQUFDO3lCQUNoQjtxQkFDRDtvQkFFRCxJQUFJLE9BQU8sSUFBSSxTQUFTLENBQUMsZ0JBQWdCLEVBQUU7d0JBQzFDLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFBLDJDQUFpQixFQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRTs0QkFDakgsT0FBTyxHQUFHLEtBQUssQ0FBQzt5QkFDaEI7cUJBQ0Q7b0JBRUQsSUFBSSxPQUFPLElBQUksc0JBQXNCLEVBQUU7d0JBQ3RDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUF5QixTQUFVLENBQUMsY0FBYyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxNQUFNLEVBQUU7NEJBQ2xILE9BQU8sR0FBRyxLQUFLLENBQUM7eUJBQ2hCO3FCQUNEO29CQUVELElBQUksT0FBTyxFQUFFO3dCQUNaLGlCQUFpQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQzt3QkFDbEMsbUJBQW1CLENBQUMsR0FBRyxFQUFFLENBQUM7cUJBQzFCO3lCQUFNO3dCQUNOLElBQUksbUJBQW1CLElBQUksc0JBQXNCLEVBQUU7NEJBQ2xELG1CQUFtQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQzs0QkFDcEMsSUFBSSxtQkFBbUIsRUFBRTtnQ0FDeEIsc0JBQXNCLEdBQUcsSUFBSSxDQUFDOzZCQUM5Qjt5QkFDRDtxQkFDRDtpQkFFRDtnQkFDRCxJQUFJLGlCQUFpQixDQUFDLE1BQU0sRUFBRTtvQkFDN0Isc0JBQXNCLENBQUMsV0FBVyxDQUFDLEdBQUcsaUJBQWlCLENBQUM7aUJBQ3hEO2dCQUNELElBQUksbUJBQW1CLENBQUMsTUFBTSxFQUFFO29CQUMvQix3QkFBd0IsQ0FBQyxXQUFXLENBQUMsR0FBRyxtQkFBbUIsQ0FBQztpQkFDNUQ7Z0JBQ0QsSUFBSSxtQkFBbUIsQ0FBQyxNQUFNLEVBQUU7b0JBQy9CLHdCQUF3QixDQUFDLFdBQVcsQ0FBQyxHQUFHLG1CQUFtQixDQUFDO2lCQUM1RDthQUNEO1lBRUQsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztZQUNyRSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxNQUFNLEVBQUU7Z0JBQ2pELElBQUksc0JBQXNCLEVBQUU7b0JBQzNCLE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO29CQUMxQyxXQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLEVBQUU7d0JBQzlDLGlHQUFpRzt3QkFDakcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFBLHlCQUFpQixFQUFDLEdBQUcsRUFBRTs0QkFDdEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUU7Z0NBQzVCLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLHdCQUF3QixDQUFDLENBQUM7Z0NBQzFFLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs2QkFDdEI7d0JBQ0YsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ1IsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDSixXQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDbEU7YUFDRDtZQUVELElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLE1BQU0sRUFBRTtnQkFDL0MsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLENBQUMsQ0FBQzthQUNuRTtRQUNGLENBQUM7UUFFTyx5QkFBeUIsQ0FBQyxHQUFRLEVBQUUsS0FBaUIsRUFBRSx3QkFBaUU7WUFDL0gsSUFBSSxvQ0FBb0MsR0FBRyxLQUFLLENBQUM7WUFDakQsTUFBTSx3QkFBd0IsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1lBQ25ELE1BQU0sd0JBQXdCLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztZQUNuRCxLQUFLLE1BQU0sQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFO2dCQUNqRixLQUFLLE1BQU0sU0FBUyxJQUFJLFVBQVUsRUFBRTtvQkFDbkMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO29CQUMxQyxJQUFJLFNBQVMsQ0FBQyxTQUFTLEVBQUU7d0JBQ3hCLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQzt3QkFDMUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztxQkFDeEQ7b0JBQ0QsSUFBNkIsU0FBVSxDQUFDLFNBQVMsRUFBRTt3QkFDbEQsb0NBQW9DLEdBQUcsSUFBSSxDQUFDO3FCQUM1QztpQkFDRDthQUNEO1lBRUQsb0NBQW9DO1lBQ3BDLEtBQUssTUFBTSxjQUFjLElBQUksd0JBQXdCLEVBQUU7Z0JBQ3RELE1BQU0sd0JBQXdCLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxDQUFDO2dCQUNuSSx3QkFBd0IsQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUN0RCxJQUFJLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO2FBQzVFO1lBRUQsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7WUFFbEMsSUFBSSxJQUFJLENBQUMsMENBQTBDLENBQUMsc0NBQXNDLEVBQUUsRUFBRTtnQkFDN0YsT0FBTzthQUNQO1lBRUQsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3ZDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3BFLElBQUksd0JBQXdCLENBQUMsSUFBSTtnQkFDaEMsSUFBSSxDQUFDLHFDQUFxQyxDQUFDLFlBQVksSUFBSSxvQ0FBb0MsSUFBSSxRQUFRLEtBQUsscUNBQXFCLENBQUMsQ0FBQyxDQUFDLElBQUEsY0FBUSxFQUFDLGNBQWMsRUFBRSxrQkFBa0IsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBQSxvQkFBUSxFQUFDLEdBQUcsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLEdBQUcsd0JBQXdCLENBQUMsQ0FBQyxFQUFFO2dCQUM5UCxPQUFPO2FBQ1A7UUFDRixDQUFDO1FBRU8scUNBQXFDLENBQUMsSUFBWSxFQUFFLFFBQWdCLEVBQUUsZUFBeUI7WUFDdEcsZUFBZSxHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNsRSxJQUFJLGVBQWUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNqQyxPQUFPLEtBQUssQ0FBQzthQUNiO1lBRUQsZUFBZSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxLQUFLLENBQUM7aUJBQzVGLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUVqRixNQUFNLHVCQUF1QixHQUFHLFFBQVEsS0FBSyxxQ0FBcUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUM3SCxJQUFJLHVCQUF1QixFQUFFO2dCQUM1QixlQUFlLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO2FBQ3ZHO1lBRUQsSUFBSSxlQUFlLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDakMsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELElBQUksQ0FBQyw0Q0FBNEMsQ0FBQyxlQUFlLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ25GLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVPLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxVQUFvQixFQUFFLElBQVksRUFBRSxRQUFnQjtZQUM5RyxJQUFJO2dCQUNILE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLDBDQUEwQyxDQUFDLDRDQUE0QyxDQUFDLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxNQUFNLG1DQUEyQixFQUFFLENBQUMsQ0FBQztnQkFDM0ssSUFBSSxNQUFNLCtEQUErQyxFQUFFO29CQUMxRCxJQUFJLENBQUMsNEJBQTRCLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2lCQUN4RDthQUNEO1lBQUMsT0FBTyxLQUFLLEVBQUUsRUFBRSxZQUFZLEVBQUU7UUFDakMsQ0FBQztRQUVPLDBCQUEwQjtZQUNqQyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsaUNBQWlDLGdDQUF3QixJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzNHLENBQUM7UUFFTyw0QkFBNEIsQ0FBQyxRQUFnQixFQUFFLFVBQW9CO1lBQzFFLE1BQU0sdUJBQXVCLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7WUFDbEUsdUJBQXVCLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBQSxpQkFBUSxFQUFDLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUM1RyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxpQ0FBaUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLHVCQUF1QixDQUFDLDJEQUEyQyxDQUFDO1FBQ2pKLENBQUM7UUFFTyx5QkFBeUIsQ0FBQyx3QkFBa0M7WUFDbkUsTUFBTSxzQkFBc0IsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLHNCQUFzQixFQUFFLEdBQUcsSUFBSSxDQUFDLDBDQUEwQyxDQUFDLHNCQUFzQixDQUFDLENBQUM7WUFDbEwsT0FBTyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3BGLENBQUM7UUFFTyxlQUFlLENBQUMsd0JBQWtDLEVBQUUsU0FBdUI7WUFDbEYsTUFBTSxzQkFBc0IsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUM3RCxJQUFJLENBQUMsQ0FBQyxlQUFlLG9EQUE0QyxFQUFFO29CQUNsRSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7aUJBQzFDO2dCQUNELE9BQU8sTUFBTSxDQUFDO1lBQ2YsQ0FBQyxFQUFFLElBQUksR0FBRyxFQUFVLENBQUMsQ0FBQztZQUN0QixPQUFPLHdCQUF3QixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDN0YsQ0FBQztRQUVPLHdCQUF3QjtZQUMvQixJQUFJLHFCQUFxQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMseUJBQXlCLGdDQUF3QixJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3ZILElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFO2dCQUN6QyxxQkFBcUIsR0FBRyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQTZCLEVBQUUsQ0FBQyxDQUFDO2FBQ2pKO1lBQ0QsTUFBTSxNQUFNLEdBQThCLEVBQUUsQ0FBQztZQUM3QyxNQUFNLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRTtnQkFDOUQsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7b0JBQzlCLE1BQU0sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUM7aUJBQ2xDO1lBQ0YsQ0FBQyxDQUFDLENBQUM7WUFDSCxPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFFTywwQkFBMEI7WUFDakMsTUFBTSxxQkFBcUIsR0FBOEIsRUFBRSxDQUFDO1lBQzVELElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDMUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMseUJBQXlCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQyw4REFBOEMsQ0FBQztRQUMxSSxDQUFDO0tBQ0QsQ0FBQTtJQXhVWSw0REFBd0I7dUNBQXhCLHdCQUF3QjtRQTBDbEMsV0FBQSx3Q0FBMkIsQ0FBQTtRQUMzQixXQUFBLHFCQUFhLENBQUE7UUFDYixXQUFBLDJCQUFnQixDQUFBO1FBQ2hCLFdBQUEsZ0NBQWUsQ0FBQTtRQUNmLFdBQUEseUJBQWUsQ0FBQTtRQUNmLFdBQUEsc0VBQTJDLENBQUE7UUFDM0MsV0FBQSxrRUFBdUMsQ0FBQTtRQUN2QyxXQUFBLG9DQUF3QixDQUFBO09BakRkLHdCQUF3QixDQXdVcEMifQ==