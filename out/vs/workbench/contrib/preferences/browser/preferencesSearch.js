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
define(["require", "exports", "vs/workbench/services/preferences/common/preferences", "vs/base/common/arrays", "vs/base/common/strings", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/base/common/filters", "vs/platform/instantiation/common/instantiation", "vs/base/common/lifecycle", "vs/workbench/contrib/preferences/common/preferences", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/base/common/cancellation", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/extensions", "vs/workbench/services/aiRelatedInformation/common/aiRelatedInformation"], function (require, exports, preferences_1, arrays_1, strings, platform_1, configurationRegistry_1, filters_1, instantiation_1, lifecycle_1, preferences_2, extensionManagement_1, extensionManagement_2, cancellation_1, configuration_1, extensions_1, aiRelatedInformation_1) {
    "use strict";
    var LocalSearchProvider_1, SettingMatches_1, RemoteSearchProvider_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteSearchProvider = exports.SettingMatches = exports.LocalSearchProvider = exports.PreferencesSearchService = void 0;
    let PreferencesSearchService = class PreferencesSearchService extends lifecycle_1.Disposable {
        constructor(instantiationService, configurationService, extensionManagementService, extensionEnablementService) {
            super();
            this.instantiationService = instantiationService;
            this.configurationService = configurationService;
            this.extensionManagementService = extensionManagementService;
            this.extensionEnablementService = extensionEnablementService;
            // This request goes to the shared process but results won't change during a window's lifetime, so cache the results.
            this._installedExtensions = this.extensionManagementService.getInstalled(1 /* ExtensionType.User */).then(exts => {
                // Filter to enabled extensions that have settings
                return exts
                    .filter(ext => this.extensionEnablementService.isEnabled(ext))
                    .filter(ext => ext.manifest && ext.manifest.contributes && ext.manifest.contributes.configuration)
                    .filter(ext => !!ext.identifier.uuid);
            });
        }
        get remoteSearchAllowed() {
            const workbenchSettings = this.configurationService.getValue().workbench.settings;
            return workbenchSettings.enableNaturalLanguageSearch;
        }
        getRemoteSearchProvider(filter, newExtensionsOnly = false) {
            if (!this.remoteSearchAllowed) {
                return undefined;
            }
            if (!this._remoteSearchProvider) {
                this._remoteSearchProvider = this.instantiationService.createInstance(RemoteSearchProvider);
            }
            this._remoteSearchProvider.setFilter(filter);
            return this._remoteSearchProvider;
        }
        getLocalSearchProvider(filter) {
            return this.instantiationService.createInstance(LocalSearchProvider, filter);
        }
    };
    exports.PreferencesSearchService = PreferencesSearchService;
    exports.PreferencesSearchService = PreferencesSearchService = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, extensionManagement_1.IExtensionManagementService),
        __param(3, extensionManagement_2.IWorkbenchExtensionEnablementService)
    ], PreferencesSearchService);
    function cleanFilter(filter) {
        // Remove " and : which are likely to be copypasted as part of a setting name.
        // Leave other special characters which the user might want to search for.
        return filter
            .replace(/[":]/g, ' ')
            .replace(/  /g, ' ')
            .trim();
    }
    let LocalSearchProvider = class LocalSearchProvider {
        static { LocalSearchProvider_1 = this; }
        static { this.EXACT_MATCH_SCORE = 10000; }
        static { this.START_SCORE = 1000; }
        constructor(_filter, configurationService) {
            this._filter = _filter;
            this.configurationService = configurationService;
            this._filter = cleanFilter(this._filter);
        }
        searchModel(preferencesModel, token) {
            if (!this._filter) {
                return Promise.resolve(null);
            }
            let orderedScore = LocalSearchProvider_1.START_SCORE; // Sort is not stable
            const settingMatcher = (setting) => {
                const { matches, matchType } = new SettingMatches(this._filter, setting, true, true, (filter, setting) => preferencesModel.findValueMatches(filter, setting), this.configurationService);
                const score = this._filter === setting.key ?
                    LocalSearchProvider_1.EXACT_MATCH_SCORE :
                    orderedScore--;
                return matches && matches.length ?
                    {
                        matches,
                        matchType,
                        score
                    } :
                    null;
            };
            const filterMatches = preferencesModel.filterSettings(this._filter, this.getGroupFilter(this._filter), settingMatcher);
            if (filterMatches[0] && filterMatches[0].score === LocalSearchProvider_1.EXACT_MATCH_SCORE) {
                return Promise.resolve({
                    filterMatches: filterMatches.slice(0, 1),
                    exactMatch: true
                });
            }
            else {
                return Promise.resolve({
                    filterMatches
                });
            }
        }
        getGroupFilter(filter) {
            const regex = strings.createRegExp(filter, false, { global: true });
            return (group) => {
                return regex.test(group.title);
            };
        }
    };
    exports.LocalSearchProvider = LocalSearchProvider;
    exports.LocalSearchProvider = LocalSearchProvider = LocalSearchProvider_1 = __decorate([
        __param(1, configuration_1.IConfigurationService)
    ], LocalSearchProvider);
    let SettingMatches = SettingMatches_1 = class SettingMatches {
        constructor(searchString, setting, requireFullQueryMatch, searchDescription, valuesMatcher, configurationService) {
            this.requireFullQueryMatch = requireFullQueryMatch;
            this.searchDescription = searchDescription;
            this.valuesMatcher = valuesMatcher;
            this.configurationService = configurationService;
            this.descriptionMatchingWords = new Map();
            this.keyMatchingWords = new Map();
            this.valueMatchingWords = new Map();
            this.matchType = preferences_1.SettingMatchType.None;
            this.matches = (0, arrays_1.distinct)(this._findMatchesInSetting(searchString, setting), (match) => `${match.startLineNumber}_${match.startColumn}_${match.endLineNumber}_${match.endColumn}_`);
        }
        _findMatchesInSetting(searchString, setting) {
            const result = this._doFindMatchesInSetting(searchString, setting);
            if (setting.overrides && setting.overrides.length) {
                for (const subSetting of setting.overrides) {
                    const subSettingMatches = new SettingMatches_1(searchString, subSetting, this.requireFullQueryMatch, this.searchDescription, this.valuesMatcher, this.configurationService);
                    const words = searchString.split(' ');
                    const descriptionRanges = this.getRangesForWords(words, this.descriptionMatchingWords, [subSettingMatches.descriptionMatchingWords, subSettingMatches.keyMatchingWords, subSettingMatches.valueMatchingWords]);
                    const keyRanges = this.getRangesForWords(words, this.keyMatchingWords, [subSettingMatches.descriptionMatchingWords, subSettingMatches.keyMatchingWords, subSettingMatches.valueMatchingWords]);
                    const subSettingKeyRanges = this.getRangesForWords(words, subSettingMatches.keyMatchingWords, [this.descriptionMatchingWords, this.keyMatchingWords, subSettingMatches.valueMatchingWords]);
                    const subSettingValueRanges = this.getRangesForWords(words, subSettingMatches.valueMatchingWords, [this.descriptionMatchingWords, this.keyMatchingWords, subSettingMatches.keyMatchingWords]);
                    result.push(...descriptionRanges, ...keyRanges, ...subSettingKeyRanges, ...subSettingValueRanges);
                    result.push(...subSettingMatches.matches);
                    this.refreshMatchType(keyRanges.length + subSettingKeyRanges.length);
                    this.matchType |= subSettingMatches.matchType;
                }
            }
            return result;
        }
        _doFindMatchesInSetting(searchString, setting) {
            const registry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationProperties();
            const schema = registry[setting.key];
            const words = searchString.split(' ');
            const settingKeyAsWords = setting.key.split('.').join(' ');
            const settingValue = this.configurationService.getValue(setting.key);
            for (const word of words) {
                // Whole word match attempts also take place within this loop.
                if (this.searchDescription) {
                    for (let lineIndex = 0; lineIndex < setting.description.length; lineIndex++) {
                        const descriptionMatches = (0, filters_1.matchesWords)(word, setting.description[lineIndex], true);
                        if (descriptionMatches) {
                            this.descriptionMatchingWords.set(word, descriptionMatches.map(match => this.toDescriptionRange(setting, match, lineIndex)));
                        }
                        this.checkForWholeWordMatchType(word, setting.description[lineIndex]);
                    }
                }
                const keyMatches = (0, filters_1.or)(filters_1.matchesWords, filters_1.matchesCamelCase)(word, settingKeyAsWords);
                if (keyMatches) {
                    this.keyMatchingWords.set(word, keyMatches.map(match => this.toKeyRange(setting, match)));
                }
                this.checkForWholeWordMatchType(word, settingKeyAsWords);
                const valueMatches = typeof settingValue === 'string' ? (0, filters_1.matchesContiguousSubString)(word, settingValue) : null;
                if (valueMatches) {
                    this.valueMatchingWords.set(word, valueMatches.map(match => this.toValueRange(setting, match)));
                }
                else if (schema && schema.enum && schema.enum.some(enumValue => typeof enumValue === 'string' && !!(0, filters_1.matchesContiguousSubString)(word, enumValue))) {
                    this.valueMatchingWords.set(word, []);
                }
                if (typeof settingValue === 'string') {
                    this.checkForWholeWordMatchType(word, settingValue);
                }
            }
            const descriptionRanges = [];
            if (this.searchDescription) {
                for (let lineIndex = 0; lineIndex < setting.description.length; lineIndex++) {
                    const matches = (0, filters_1.or)(filters_1.matchesContiguousSubString)(searchString, setting.description[lineIndex] || '') || [];
                    descriptionRanges.push(...matches.map(match => this.toDescriptionRange(setting, match, lineIndex)));
                }
                if (descriptionRanges.length === 0) {
                    descriptionRanges.push(...this.getRangesForWords(words, this.descriptionMatchingWords, [this.keyMatchingWords, this.valueMatchingWords]));
                }
            }
            const keyMatches = (0, filters_1.or)(filters_1.matchesPrefix, filters_1.matchesContiguousSubString)(searchString, setting.key);
            const keyRanges = keyMatches ? keyMatches.map(match => this.toKeyRange(setting, match)) : this.getRangesForWords(words, this.keyMatchingWords, [this.descriptionMatchingWords, this.valueMatchingWords]);
            let valueRanges = [];
            if (typeof settingValue === 'string' && settingValue) {
                const valueMatches = (0, filters_1.or)(filters_1.matchesPrefix, filters_1.matchesContiguousSubString)(searchString, settingValue);
                valueRanges = valueMatches ? valueMatches.map(match => this.toValueRange(setting, match)) : this.getRangesForWords(words, this.valueMatchingWords, [this.keyMatchingWords, this.descriptionMatchingWords]);
            }
            else {
                valueRanges = this.valuesMatcher(searchString, setting);
            }
            this.refreshMatchType(keyRanges.length);
            return [...descriptionRanges, ...keyRanges, ...valueRanges];
        }
        checkForWholeWordMatchType(singleWordQuery, lineToSearch) {
            // Trim excess ending characters off the query.
            singleWordQuery = singleWordQuery.toLowerCase().replace(/[\s-\._]+$/, '');
            lineToSearch = lineToSearch.toLowerCase();
            const singleWordRegex = new RegExp(`\\b${strings.escapeRegExpCharacters(singleWordQuery)}\\b`);
            if (singleWordRegex.test(lineToSearch)) {
                this.matchType |= preferences_1.SettingMatchType.WholeWordMatch;
            }
        }
        refreshMatchType(keyRangesLength) {
            if (keyRangesLength) {
                this.matchType |= preferences_1.SettingMatchType.KeyMatch;
            }
        }
        getRangesForWords(words, from, others) {
            const result = [];
            for (const word of words) {
                const ranges = from.get(word);
                if (ranges) {
                    result.push(...ranges);
                }
                else if (this.requireFullQueryMatch && others.every(o => !o.has(word))) {
                    return [];
                }
            }
            return result;
        }
        toKeyRange(setting, match) {
            return {
                startLineNumber: setting.keyRange.startLineNumber,
                startColumn: setting.keyRange.startColumn + match.start,
                endLineNumber: setting.keyRange.startLineNumber,
                endColumn: setting.keyRange.startColumn + match.end
            };
        }
        toDescriptionRange(setting, match, lineIndex) {
            return {
                startLineNumber: setting.descriptionRanges[lineIndex].startLineNumber,
                startColumn: setting.descriptionRanges[lineIndex].startColumn + match.start,
                endLineNumber: setting.descriptionRanges[lineIndex].endLineNumber,
                endColumn: setting.descriptionRanges[lineIndex].startColumn + match.end
            };
        }
        toValueRange(setting, match) {
            return {
                startLineNumber: setting.valueRange.startLineNumber,
                startColumn: setting.valueRange.startColumn + match.start + 1,
                endLineNumber: setting.valueRange.startLineNumber,
                endColumn: setting.valueRange.startColumn + match.end + 1
            };
        }
    };
    exports.SettingMatches = SettingMatches;
    exports.SettingMatches = SettingMatches = SettingMatches_1 = __decorate([
        __param(5, configuration_1.IConfigurationService)
    ], SettingMatches);
    class RemoteSearchKeysProvider {
        constructor(aiRelatedInformationService) {
            this.aiRelatedInformationService = aiRelatedInformationService;
            this.settingKeys = [];
            this.settingsRecord = {};
        }
        updateModel(preferencesModel) {
            if (preferencesModel === this.currentPreferencesModel) {
                return;
            }
            this.currentPreferencesModel = preferencesModel;
            this.refresh();
        }
        refresh() {
            this.settingKeys = [];
            this.settingsRecord = {};
            if (!this.currentPreferencesModel ||
                !this.aiRelatedInformationService.isEnabled()) {
                return;
            }
            for (const group of this.currentPreferencesModel.settingsGroups) {
                if (group.id === 'mostCommonlyUsed') {
                    continue;
                }
                for (const section of group.sections) {
                    for (const setting of section.settings) {
                        this.settingKeys.push(setting.key);
                        this.settingsRecord[setting.key] = setting;
                    }
                }
            }
        }
        getSettingKeys() {
            return this.settingKeys;
        }
        getSettingsRecord() {
            return this.settingsRecord;
        }
    }
    let RemoteSearchProvider = class RemoteSearchProvider {
        static { RemoteSearchProvider_1 = this; }
        static { this.AI_RELATED_INFORMATION_THRESHOLD = 0.73; }
        static { this.AI_RELATED_INFORMATION_MAX_PICKS = 15; }
        constructor(aiRelatedInformationService) {
            this.aiRelatedInformationService = aiRelatedInformationService;
            this._filter = '';
            this._keysProvider = new RemoteSearchKeysProvider(aiRelatedInformationService);
        }
        setFilter(filter) {
            this._filter = cleanFilter(filter);
        }
        async searchModel(preferencesModel, token) {
            if (!this._filter ||
                !this.aiRelatedInformationService.isEnabled()) {
                return null;
            }
            this._keysProvider.updateModel(preferencesModel);
            return {
                filterMatches: await this.getAiRelatedInformationItems(token)
            };
        }
        async getAiRelatedInformationItems(token) {
            const settingsRecord = this._keysProvider.getSettingsRecord();
            const filterMatches = [];
            const relatedInformation = await this.aiRelatedInformationService.getRelatedInformation(this._filter, [aiRelatedInformation_1.RelatedInformationType.SettingInformation], token ?? cancellation_1.CancellationToken.None);
            relatedInformation.sort((a, b) => b.weight - a.weight);
            for (const info of relatedInformation) {
                if (info.weight < RemoteSearchProvider_1.AI_RELATED_INFORMATION_THRESHOLD || filterMatches.length === RemoteSearchProvider_1.AI_RELATED_INFORMATION_MAX_PICKS) {
                    break;
                }
                const pick = info.setting;
                filterMatches.push({
                    setting: settingsRecord[pick],
                    matches: [settingsRecord[pick].range],
                    matchType: preferences_1.SettingMatchType.RemoteMatch,
                    score: info.weight
                });
            }
            return filterMatches;
        }
    };
    exports.RemoteSearchProvider = RemoteSearchProvider;
    exports.RemoteSearchProvider = RemoteSearchProvider = RemoteSearchProvider_1 = __decorate([
        __param(0, aiRelatedInformation_1.IAiRelatedInformationService)
    ], RemoteSearchProvider);
    (0, extensions_1.registerSingleton)(preferences_2.IPreferencesSearchService, PreferencesSearchService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmVyZW5jZXNTZWFyY2guanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9wcmVmZXJlbmNlcy9icm93c2VyL3ByZWZlcmVuY2VzU2VhcmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUEwQnpGLElBQU0sd0JBQXdCLEdBQTlCLE1BQU0sd0JBQXlCLFNBQVEsc0JBQVU7UUFPdkQsWUFDeUMsb0JBQTJDLEVBQzNDLG9CQUEyQyxFQUNyQywwQkFBdUQsRUFDOUMsMEJBQWdFO1lBRXZILEtBQUssRUFBRSxDQUFDO1lBTGdDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDM0MseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUNyQywrQkFBMEIsR0FBMUIsMEJBQTBCLENBQTZCO1lBQzlDLCtCQUEwQixHQUExQiwwQkFBMEIsQ0FBc0M7WUFJdkgscUhBQXFIO1lBQ3JILElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsWUFBWSw0QkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3hHLGtEQUFrRDtnQkFDbEQsT0FBTyxJQUFJO3FCQUNULE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7cUJBQzdELE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxXQUFXLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDO3FCQUNqRyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZ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