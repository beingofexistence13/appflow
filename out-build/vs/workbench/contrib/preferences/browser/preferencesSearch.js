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
    var $dEb_1, $eEb_1, $fEb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$fEb = exports.$eEb = exports.$dEb = exports.$cEb = void 0;
    let $cEb = class $cEb extends lifecycle_1.$kc {
        constructor(g, h, j, m) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            // This request goes to the shared process but results won't change during a window's lifetime, so cache the results.
            this.c = this.j.getInstalled(1 /* ExtensionType.User */).then(exts => {
                // Filter to enabled extensions that have settings
                return exts
                    .filter(ext => this.m.isEnabled(ext))
                    .filter(ext => ext.manifest && ext.manifest.contributes && ext.manifest.contributes.configuration)
                    .filter(ext => !!ext.identifier.uuid);
            });
        }
        get n() {
            const workbenchSettings = this.h.getValue().workbench.settings;
            return workbenchSettings.enableNaturalLanguageSearch;
        }
        getRemoteSearchProvider(filter, newExtensionsOnly = false) {
            if (!this.n) {
                return undefined;
            }
            if (!this.f) {
                this.f = this.g.createInstance($fEb);
            }
            this.f.setFilter(filter);
            return this.f;
        }
        getLocalSearchProvider(filter) {
            return this.g.createInstance($dEb, filter);
        }
    };
    exports.$cEb = $cEb;
    exports.$cEb = $cEb = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, configuration_1.$8h),
        __param(2, extensionManagement_1.$2n),
        __param(3, extensionManagement_2.$icb)
    ], $cEb);
    function cleanFilter(filter) {
        // Remove " and : which are likely to be copypasted as part of a setting name.
        // Leave other special characters which the user might want to search for.
        return filter
            .replace(/[":]/g, ' ')
            .replace(/  /g, ' ')
            .trim();
    }
    let $dEb = class $dEb {
        static { $dEb_1 = this; }
        static { this.EXACT_MATCH_SCORE = 10000; }
        static { this.START_SCORE = 1000; }
        constructor(c, d) {
            this.c = c;
            this.d = d;
            this.c = cleanFilter(this.c);
        }
        searchModel(preferencesModel, token) {
            if (!this.c) {
                return Promise.resolve(null);
            }
            let orderedScore = $dEb_1.START_SCORE; // Sort is not stable
            const settingMatcher = (setting) => {
                const { matches, matchType } = new $eEb(this.c, setting, true, true, (filter, setting) => preferencesModel.findValueMatches(filter, setting), this.d);
                const score = this.c === setting.key ?
                    $dEb_1.EXACT_MATCH_SCORE :
                    orderedScore--;
                return matches && matches.length ?
                    {
                        matches,
                        matchType,
                        score
                    } :
                    null;
            };
            const filterMatches = preferencesModel.filterSettings(this.c, this.e(this.c), settingMatcher);
            if (filterMatches[0] && filterMatches[0].score === $dEb_1.EXACT_MATCH_SCORE) {
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
        e(filter) {
            const regex = strings.$ye(filter, false, { global: true });
            return (group) => {
                return regex.test(group.title);
            };
        }
    };
    exports.$dEb = $dEb;
    exports.$dEb = $dEb = $dEb_1 = __decorate([
        __param(1, configuration_1.$8h)
    ], $dEb);
    let $eEb = $eEb_1 = class $eEb {
        constructor(searchString, setting, f, g, h, i) {
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.c = new Map();
            this.d = new Map();
            this.e = new Map();
            this.matchType = preferences_1.SettingMatchType.None;
            this.matches = (0, arrays_1.$Kb)(this.j(searchString, setting), (match) => `${match.startLineNumber}_${match.startColumn}_${match.endLineNumber}_${match.endColumn}_`);
        }
        j(searchString, setting) {
            const result = this.k(searchString, setting);
            if (setting.overrides && setting.overrides.length) {
                for (const subSetting of setting.overrides) {
                    const subSettingMatches = new $eEb_1(searchString, subSetting, this.f, this.g, this.h, this.i);
                    const words = searchString.split(' ');
                    const descriptionRanges = this.n(words, this.c, [subSettingMatches.c, subSettingMatches.d, subSettingMatches.e]);
                    const keyRanges = this.n(words, this.d, [subSettingMatches.c, subSettingMatches.d, subSettingMatches.e]);
                    const subSettingKeyRanges = this.n(words, subSettingMatches.d, [this.c, this.d, subSettingMatches.e]);
                    const subSettingValueRanges = this.n(words, subSettingMatches.e, [this.c, this.d, subSettingMatches.d]);
                    result.push(...descriptionRanges, ...keyRanges, ...subSettingKeyRanges, ...subSettingValueRanges);
                    result.push(...subSettingMatches.matches);
                    this.m(keyRanges.length + subSettingKeyRanges.length);
                    this.matchType |= subSettingMatches.matchType;
                }
            }
            return result;
        }
        k(searchString, setting) {
            const registry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration).getConfigurationProperties();
            const schema = registry[setting.key];
            const words = searchString.split(' ');
            const settingKeyAsWords = setting.key.split('.').join(' ');
            const settingValue = this.i.getValue(setting.key);
            for (const word of words) {
                // Whole word match attempts also take place within this loop.
                if (this.g) {
                    for (let lineIndex = 0; lineIndex < setting.description.length; lineIndex++) {
                        const descriptionMatches = (0, filters_1.$Dj)(word, setting.description[lineIndex], true);
                        if (descriptionMatches) {
                            this.c.set(word, descriptionMatches.map(match => this.q(setting, match, lineIndex)));
                        }
                        this.l(word, setting.description[lineIndex]);
                    }
                }
                const keyMatches = (0, filters_1.or)(filters_1.$Dj, filters_1.$Cj)(word, settingKeyAsWords);
                if (keyMatches) {
                    this.d.set(word, keyMatches.map(match => this.p(setting, match)));
                }
                this.l(word, settingKeyAsWords);
                const valueMatches = typeof settingValue === 'string' ? (0, filters_1.$zj)(word, settingValue) : null;
                if (valueMatches) {
                    this.e.set(word, valueMatches.map(match => this.r(setting, match)));
                }
                else if (schema && schema.enum && schema.enum.some(enumValue => typeof enumValue === 'string' && !!(0, filters_1.$zj)(word, enumValue))) {
                    this.e.set(word, []);
                }
                if (typeof settingValue === 'string') {
                    this.l(word, settingValue);
                }
            }
            const descriptionRanges = [];
            if (this.g) {
                for (let lineIndex = 0; lineIndex < setting.description.length; lineIndex++) {
                    const matches = (0, filters_1.or)(filters_1.$zj)(searchString, setting.description[lineIndex] || '') || [];
                    descriptionRanges.push(...matches.map(match => this.q(setting, match, lineIndex)));
                }
                if (descriptionRanges.length === 0) {
                    descriptionRanges.push(...this.n(words, this.c, [this.d, this.e]));
                }
            }
            const keyMatches = (0, filters_1.or)(filters_1.$yj, filters_1.$zj)(searchString, setting.key);
            const keyRanges = keyMatches ? keyMatches.map(match => this.p(setting, match)) : this.n(words, this.d, [this.c, this.e]);
            let valueRanges = [];
            if (typeof settingValue === 'string' && settingValue) {
                const valueMatches = (0, filters_1.or)(filters_1.$yj, filters_1.$zj)(searchString, settingValue);
                valueRanges = valueMatches ? valueMatches.map(match => this.r(setting, match)) : this.n(words, this.e, [this.d, this.c]);
            }
            else {
                valueRanges = this.h(searchString, setting);
            }
            this.m(keyRanges.length);
            return [...descriptionRanges, ...keyRanges, ...valueRanges];
        }
        l(singleWordQuery, lineToSearch) {
            // Trim excess ending characters off the query.
            singleWordQuery = singleWordQuery.toLowerCase().replace(/[\s-\._]+$/, '');
            lineToSearch = lineToSearch.toLowerCase();
            const singleWordRegex = new RegExp(`\\b${strings.$qe(singleWordQuery)}\\b`);
            if (singleWordRegex.test(lineToSearch)) {
                this.matchType |= preferences_1.SettingMatchType.WholeWordMatch;
            }
        }
        m(keyRangesLength) {
            if (keyRangesLength) {
                this.matchType |= preferences_1.SettingMatchType.KeyMatch;
            }
        }
        n(words, from, others) {
            const result = [];
            for (const word of words) {
                const ranges = from.get(word);
                if (ranges) {
                    result.push(...ranges);
                }
                else if (this.f && others.every(o => !o.has(word))) {
                    return [];
                }
            }
            return result;
        }
        p(setting, match) {
            return {
                startLineNumber: setting.keyRange.startLineNumber,
                startColumn: setting.keyRange.startColumn + match.start,
                endLineNumber: setting.keyRange.startLineNumber,
                endColumn: setting.keyRange.startColumn + match.end
            };
        }
        q(setting, match, lineIndex) {
            return {
                startLineNumber: setting.descriptionRanges[lineIndex].startLineNumber,
                startColumn: setting.descriptionRanges[lineIndex].startColumn + match.start,
                endLineNumber: setting.descriptionRanges[lineIndex].endLineNumber,
                endColumn: setting.descriptionRanges[lineIndex].startColumn + match.end
            };
        }
        r(setting, match) {
            return {
                startLineNumber: setting.valueRange.startLineNumber,
                startColumn: setting.valueRange.startColumn + match.start + 1,
                endLineNumber: setting.valueRange.startLineNumber,
                endColumn: setting.valueRange.startColumn + match.end + 1
            };
        }
    };
    exports.$eEb = $eEb;
    exports.$eEb = $eEb = $eEb_1 = __decorate([
        __param(5, configuration_1.$8h)
    ], $eEb);
    class RemoteSearchKeysProvider {
        constructor(f) {
            this.f = f;
            this.c = [];
            this.d = {};
        }
        updateModel(preferencesModel) {
            if (preferencesModel === this.e) {
                return;
            }
            this.e = preferencesModel;
            this.g();
        }
        g() {
            this.c = [];
            this.d = {};
            if (!this.e ||
                !this.f.isEnabled()) {
                return;
            }
            for (const group of this.e.settingsGroups) {
                if (group.id === 'mostCommonlyUsed') {
                    continue;
                }
                for (const section of group.sections) {
                    for (const setting of section.settings) {
                        this.c.push(setting.key);
                        this.d[setting.key] = setting;
                    }
                }
            }
        }
        getSettingKeys() {
            return this.c;
        }
        getSettingsRecord() {
            return this.d;
        }
    }
    let $fEb = class $fEb {
        static { $fEb_1 = this; }
        static { this.c = 0.73; }
        static { this.d = 15; }
        constructor(g) {
            this.g = g;
            this.f = '';
            this.e = new RemoteSearchKeysProvider(g);
        }
        setFilter(filter) {
            this.f = cleanFilter(filter);
        }
        async searchModel(preferencesModel, token) {
            if (!this.f ||
                !this.g.isEnabled()) {
                return null;
            }
            this.e.updateModel(preferencesModel);
            return {
                filterMatches: await this.h(token)
            };
        }
        async h(token) {
            const settingsRecord = this.e.getSettingsRecord();
            const filterMatches = [];
            const relatedInformation = await this.g.getRelatedInformation(this.f, [aiRelatedInformation_1.RelatedInformationType.SettingInformation], token ?? cancellation_1.CancellationToken.None);
            relatedInformation.sort((a, b) => b.weight - a.weight);
            for (const info of relatedInformation) {
                if (info.weight < $fEb_1.c || filterMatches.length === $fEb_1.d) {
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
    exports.$fEb = $fEb;
    exports.$fEb = $fEb = $fEb_1 = __decorate([
        __param(0, aiRelatedInformation_1.$YJ)
    ], $fEb);
    (0, extensions_1.$mr)(preferences_2.$bCb, $cEb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=preferencesSearch.js.map