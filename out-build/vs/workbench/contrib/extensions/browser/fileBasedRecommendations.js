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
define(["require", "exports", "vs/workbench/contrib/extensions/browser/extensionRecommendations", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/workbench/contrib/extensions/common/extensions", "vs/nls!vs/workbench/contrib/extensions/browser/fileBasedRecommendations", "vs/platform/storage/common/storage", "vs/platform/product/common/productService", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/glob", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/platform/extensionRecommendations/common/extensionRecommendations", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/base/common/async", "vs/platform/workspace/common/workspace", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/base/common/types", "vs/editor/common/languages/modesRegistry"], function (require, exports, extensionRecommendations_1, extensionRecommendations_2, extensions_1, nls_1, storage_1, productService_1, network_1, resources_1, glob_1, model_1, language_1, extensionRecommendations_3, arrays_1, lifecycle_1, notebookCommon_1, async_1, workspace_1, extensionManagementUtil_1, types_1, modesRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$UUb = void 0;
    const promptedRecommendationsStorageKey = 'fileBasedRecommendations/promptedRecommendations';
    const recommendationsStorageKey = 'extensionsAssistant/recommendations';
    const milliSecondsInADay = 1000 * 60 * 60 * 24;
    let $UUb = class $UUb extends extensionRecommendations_1.$PUb {
        get recommendations() {
            const recommendations = [];
            [...this.j.keys()]
                .sort((a, b) => {
                if (this.j.get(a).recommendedTime === this.j.get(b).recommendedTime) {
                    if (this.m.has(a)) {
                        return -1;
                    }
                    if (this.m.has(b)) {
                        return 1;
                    }
                }
                return this.j.get(a).recommendedTime > this.j.get(b).recommendedTime ? -1 : 1;
            })
                .forEach(extensionId => {
                recommendations.push({
                    extensionId,
                    reason: {
                        reasonId: 1 /* ExtensionRecommendationReason.File */,
                        reasonText: (0, nls_1.localize)(0, null)
                    }
                });
            });
            return recommendations;
        }
        get importantRecommendations() {
            return this.recommendations.filter(e => this.m.has(e.extensionId));
        }
        get otherRecommendations() {
            return this.recommendations.filter(e => !this.m.has(e.extensionId));
        }
        constructor(n, r, s, productService, t, u, w, y) {
            super();
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.h = new Map();
            this.j = new Map();
            this.m = new Set();
            this.g = {};
            if (productService.extensionRecommendations) {
                for (const [extensionId, recommendation] of Object.entries(productService.extensionRecommendations)) {
                    if (recommendation.onFileOpen) {
                        this.g[extensionId.toLowerCase()] = recommendation.onFileOpen;
                    }
                }
            }
        }
        async c() {
            if ((0, types_1.$wf)(this.g)) {
                return;
            }
            await this.n.whenInitialized;
            const cachedRecommendations = this.N();
            const now = Date.now();
            // Retire existing recommendations if they are older than a week or are not part of this.productService.extensionTips anymore
            Object.entries(cachedRecommendations).forEach(([key, value]) => {
                const diff = (now - value) / milliSecondsInADay;
                if (diff <= 7 && this.g[key]) {
                    this.j.set(key.toLowerCase(), { recommendedTime: value });
                }
            });
            this.B(this.r.onModelAdded(model => this.C(model)));
            this.r.getModels().forEach(model => this.C(model));
        }
        C(model) {
            const uri = model.uri.scheme === network_1.Schemas.vscodeNotebookCell ? notebookCommon_1.CellUri.parse(model.uri)?.notebook : model.uri;
            if (!uri) {
                return;
            }
            const supportedSchemes = (0, arrays_1.$Kb)([network_1.Schemas.untitled, network_1.Schemas.file, network_1.Schemas.vscodeRemote, ...this.y.getWorkspace().folders.map(folder => folder.uri.scheme)]);
            if (!uri || !supportedSchemes.includes(uri.scheme)) {
                return;
            }
            // re-schedule this bit of the operation to be off the critical path - in case glob-match is slow
            this.B((0, async_1.$Ig)(() => this.D(uri, model), 0));
        }
        /**
         * Prompt the user to either install the recommended extension for the file type in the current editor model
         * or prompt to search the marketplace if it has extensions that can support the file type
         */
        D(uri, model, extensionRecommendations) {
            const pattern = (0, resources_1.$gg)(uri).toLowerCase();
            extensionRecommendations = extensionRecommendations ?? this.h.get(pattern) ?? this.g;
            const extensionRecommendationEntries = Object.entries(extensionRecommendations);
            if (extensionRecommendationEntries.length === 0) {
                return;
            }
            const processedPathGlobs = new Map();
            const installed = this.n.local;
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
                        if (processedPathGlobs.get(pathGlob) ?? (0, glob_1.$qj)(condition.pathGlob, uri.with({ fragment: '' }).toString())) {
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
                        if (!condition.whenInstalled.every(id => installed.some(local => (0, extensionManagementUtil_1.$po)({ id }, local.identifier)))) {
                            matched = false;
                        }
                    }
                    if (matched && condition.whenNotInstalled) {
                        if (installed.some(local => condition.whenNotInstalled?.some(id => (0, extensionManagementUtil_1.$po)({ id }, local.identifier)))) {
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
            this.h.set(pattern, recommendationsByPattern);
            if (Object.keys(unmatchedRecommendations).length) {
                if (listenOnLanguageChange) {
                    const disposables = new lifecycle_1.$jc();
                    disposables.add(model.onDidChangeLanguage(() => {
                        // re-schedule this bit of the operation to be off the critical path - in case glob-match is slow
                        disposables.add((0, async_1.$Ig)(() => {
                            if (!disposables.isDisposed) {
                                this.D(uri, model, unmatchedRecommendations);
                                disposables.dispose();
                            }
                        }, 0));
                    }));
                    disposables.add(model.onWillDispose(() => disposables.dispose()));
                }
            }
            if (Object.keys(matchedRecommendations).length) {
                this.F(uri, model, matchedRecommendations);
            }
        }
        F(uri, model, extensionRecommendations) {
            let isImportantRecommendationForLanguage = false;
            const importantRecommendations = new Set();
            const fileBasedRecommendations = new Set();
            for (const [extensionId, conditions] of Object.entries(extensionRecommendations)) {
                for (const condition of conditions) {
                    fileBasedRecommendations.add(extensionId);
                    if (condition.important) {
                        importantRecommendations.add(extensionId);
                        this.m.add(extensionId);
                    }
                    if (condition.languages) {
                        isImportantRecommendationForLanguage = true;
                    }
                }
            }
            // Update file based recommendations
            for (const recommendation of fileBasedRecommendations) {
                const filedBasedRecommendation = this.j.get(recommendation) || { recommendedTime: Date.now(), sources: [] };
                filedBasedRecommendation.recommendedTime = Date.now();
                this.j.set(recommendation, filedBasedRecommendation);
            }
            this.O();
            if (this.u.hasToIgnoreRecommendationNotifications()) {
                return;
            }
            const language = model.getLanguageId();
            const languageName = this.s.getLanguageName(language);
            if (importantRecommendations.size &&
                this.G(languageName && isImportantRecommendationForLanguage && language !== modesRegistry_1.$Yt ? (0, nls_1.localize)(1, null, languageName) : (0, resources_1.$fg)(uri), language, [...importantRecommendations])) {
                return;
            }
        }
        G(name, language, recommendations) {
            recommendations = this.L(recommendations);
            if (recommendations.length === 0) {
                return false;
            }
            recommendations = this.M(recommendations, this.n.local)
                .filter(extensionId => this.m.has(extensionId));
            const promptedRecommendations = language !== modesRegistry_1.$Yt ? this.I()[language] : undefined;
            if (promptedRecommendations) {
                recommendations = recommendations.filter(extensionId => promptedRecommendations.includes(extensionId));
            }
            if (recommendations.length === 0) {
                return false;
            }
            this.H(recommendations, name, language);
            return true;
        }
        async H(extensions, name, language) {
            try {
                const result = await this.u.promptImportantExtensionsInstallNotification({ extensions, name, source: 1 /* RecommendationSource.FILE */ });
                if (result === "reacted" /* RecommendationsNotificationResult.Accepted */) {
                    this.J(language, extensions);
                }
            }
            catch (error) { /* Ignore */ }
        }
        I() {
            return JSON.parse(this.t.get(promptedRecommendationsStorageKey, 0 /* StorageScope.PROFILE */, '{}'));
        }
        J(language, extensions) {
            const promptedRecommendations = this.I();
            promptedRecommendations[language] = (0, arrays_1.$Kb)([...(promptedRecommendations[language] ?? []), ...extensions]);
            this.t.store(promptedRecommendationsStorageKey, JSON.stringify(promptedRecommendations), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
        L(recommendationsToSuggest) {
            const ignoredRecommendations = [...this.w.ignoredRecommendations, ...this.u.ignoredRecommendations];
            return recommendationsToSuggest.filter(id => !ignoredRecommendations.includes(id));
        }
        M(recommendationsToSuggest, installed) {
            const installedExtensionsIds = installed.reduce((result, i) => {
                if (i.enablementState !== 1 /* EnablementState.DisabledByExtensionKind */) {
                    result.add(i.identifier.id.toLowerCase());
                }
                return result;
            }, new Set());
            return recommendationsToSuggest.filter(id => !installedExtensionsIds.has(id.toLowerCase()));
        }
        N() {
            let storedRecommendations = JSON.parse(this.t.get(recommendationsStorageKey, 0 /* StorageScope.PROFILE */, '[]'));
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
        O() {
            const storedRecommendations = {};
            this.j.forEach((value, key) => storedRecommendations[key] = value.recommendedTime);
            this.t.store(recommendationsStorageKey, JSON.stringify(storedRecommendations), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        }
    };
    exports.$UUb = $UUb;
    exports.$UUb = $UUb = __decorate([
        __param(0, extensions_1.$Pfb),
        __param(1, model_1.$yA),
        __param(2, language_1.$ct),
        __param(3, productService_1.$kj),
        __param(4, storage_1.$Vo),
        __param(5, extensionRecommendations_3.$TUb),
        __param(6, extensionRecommendations_2.$0fb),
        __param(7, workspace_1.$Kh)
    ], $UUb);
});
//# sourceMappingURL=fileBasedRecommendations.js.map