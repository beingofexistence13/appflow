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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/json", "vs/base/common/lifecycle", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/nls!vs/workbench/services/preferences/common/preferencesModels", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/keybinding/common/keybinding", "vs/platform/registry/common/platform", "vs/workbench/common/editor/editorModel", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/configuration/common/configuration", "vs/workbench/services/preferences/common/preferencesValidation"], function (require, exports, arrays_1, event_1, json_1, lifecycle_1, range_1, selection_1, nls, configuration_1, configurationRegistry_1, keybinding_1, platform_1, editorModel_1, preferences_1, configuration_2, preferencesValidation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$zE = exports.$yE = exports.$xE = exports.$wE = exports.$vE = exports.$uE = exports.$tE = exports.$sE = exports.$rE = void 0;
    exports.$rE = { startLineNumber: -1, startColumn: -1, endLineNumber: -1, endColumn: -1 };
    function isNullRange(range) { return range.startLineNumber === -1 && range.startColumn === -1 && range.endLineNumber === -1 && range.endColumn === -1; }
    class AbstractSettingsModel extends editorModel_1.$xA {
        constructor() {
            super(...arguments);
            this.n = new Map();
        }
        updateResultGroup(id, resultGroup) {
            if (resultGroup) {
                this.n.set(id, resultGroup);
            }
            else {
                this.n.delete(id);
            }
            this.r();
            return this.w();
        }
        /**
         * Remove duplicates between result groups, preferring results in earlier groups
         */
        r() {
            const settingKeys = new Set();
            [...this.n.keys()]
                .sort((a, b) => this.n.get(a).order - this.n.get(b).order)
                .forEach(groupId => {
                const group = this.n.get(groupId);
                group.result.filterMatches = group.result.filterMatches.filter(s => !settingKeys.has(s.setting.key));
                group.result.filterMatches.forEach(s => settingKeys.add(s.setting.key));
            });
        }
        filterSettings(filter, groupFilter, settingMatcher) {
            const allGroups = this.u;
            const filterMatches = [];
            for (const group of allGroups) {
                const groupMatched = groupFilter(group);
                for (const section of group.sections) {
                    for (const setting of section.settings) {
                        const settingMatchResult = settingMatcher(setting, group);
                        if (groupMatched || settingMatchResult) {
                            filterMatches.push({
                                setting,
                                matches: settingMatchResult && settingMatchResult.matches,
                                matchType: settingMatchResult?.matchType ?? preferences_1.SettingMatchType.None,
                                score: settingMatchResult?.score ?? 0
                            });
                        }
                    }
                }
            }
            return filterMatches;
        }
        getPreference(key) {
            for (const group of this.settingsGroups) {
                for (const section of group.sections) {
                    for (const setting of section.settings) {
                        if (key === setting.key) {
                            return setting;
                        }
                    }
                }
            }
            return undefined;
        }
        t(groups) {
            const metadata = Object.create(null);
            let hasMetadata = false;
            groups.forEach(g => {
                if (g.result.metadata) {
                    metadata[g.id] = g.result.metadata;
                    hasMetadata = true;
                }
            });
            return hasMetadata ? metadata : null;
        }
        get u() {
            return this.settingsGroups;
        }
    }
    class $sE extends AbstractSettingsModel {
        constructor(reference, D) {
            super();
            this.D = D;
            this.C = this.B(new event_1.$fd());
            this.onDidChangeGroups = this.C.event;
            this.z = reference.object.textEditorModel;
            this.B(this.onWillDispose(() => reference.dispose()));
            this.B(this.z.onDidChangeContent(() => {
                this.y = undefined;
                this.C.fire();
            }));
        }
        get uri() {
            return this.z.uri;
        }
        get configurationTarget() {
            return this.D;
        }
        get settingsGroups() {
            if (!this.y) {
                this.G();
            }
            return this.y;
        }
        get content() {
            return this.z.getValue();
        }
        findValueMatches(filter, setting) {
            return this.z.findMatches(filter, setting.valueRange, false, false, null, false).map(match => match.range);
        }
        F(property, previousParents) {
            return previousParents.length === 0; // Settings is root
        }
        G() {
            this.y = parse(this.z, (property, previousParents) => this.F(property, previousParents));
        }
        w() {
            const resultGroups = [...this.n.values()];
            if (!resultGroups.length) {
                return undefined;
            }
            // Transform resultGroups into IFilterResult - ISetting ranges are already correct here
            const filteredSettings = [];
            const matches = [];
            resultGroups.forEach(group => {
                group.result.filterMatches.forEach(filterMatch => {
                    filteredSettings.push(filterMatch.setting);
                    if (filterMatch.matches) {
                        matches.push(...filterMatch.matches);
                    }
                });
            });
            let filteredGroup;
            const modelGroup = this.settingsGroups[0]; // Editable model has one or zero groups
            if (modelGroup) {
                filteredGroup = {
                    id: modelGroup.id,
                    range: modelGroup.range,
                    sections: [{
                            settings: filteredSettings
                        }],
                    title: modelGroup.title,
                    titleRange: modelGroup.titleRange,
                    order: modelGroup.order,
                    extensionInfo: modelGroup.extensionInfo
                };
            }
            const metadata = this.t(resultGroups);
            return {
                allGroups: this.settingsGroups,
                filteredGroups: filteredGroup ? [filteredGroup] : [],
                matches,
                metadata
            };
        }
    }
    exports.$sE = $sE;
    let $tE = class $tE extends AbstractSettingsModel {
        constructor(D, configurationService) {
            super();
            this.D = D;
            this.y = this.B(new event_1.$fd());
            this.onDidChangeGroups = this.y.event;
            this.C = false;
            this.B(configurationService.onDidChangeConfiguration(e => {
                if (e.source === 7 /* ConfigurationTarget.DEFAULT */) {
                    this.C = true;
                    this.y.fire();
                }
            }));
            this.B(platform_1.$8m.as(configurationRegistry_1.$an.Configuration).onDidSchemaChange(e => {
                this.C = true;
                this.y.fire();
            }));
        }
        /** Doesn't include the "Commonly Used" group */
        get u() {
            return this.settingsGroups.slice(1);
        }
        get settingsGroups() {
            const groups = this.D.getSettingsGroups(this.C);
            if (this.z?.length) {
                groups.push(...this.z);
            }
            this.C = false;
            return groups;
        }
        /** For programmatically added groups outside of registered configurations */
        setAdditionalGroups(groups) {
            this.z = groups;
        }
        findValueMatches(filter, setting) {
            // TODO @roblou
            return [];
        }
        w() {
            throw new Error('Not supported');
        }
    };
    exports.$tE = $tE;
    exports.$tE = $tE = __decorate([
        __param(1, configuration_1.$8h)
    ], $tE);
    function parse(model, isSettingsProperty) {
        const settings = [];
        let overrideSetting = null;
        let currentProperty = null;
        let currentParent = [];
        const previousParents = [];
        let settingsPropertyIndex = -1;
        const range = {
            startLineNumber: 0,
            startColumn: 0,
            endLineNumber: 0,
            endColumn: 0
        };
        function onValue(value, offset, length) {
            if (Array.isArray(currentParent)) {
                currentParent.push(value);
            }
            else if (currentProperty) {
                currentParent[currentProperty] = value;
            }
            if (previousParents.length === settingsPropertyIndex + 1 || (previousParents.length === settingsPropertyIndex + 2 && overrideSetting !== null)) {
                // settings value started
                const setting = previousParents.length === settingsPropertyIndex + 1 ? settings[settings.length - 1] : overrideSetting.overrides[overrideSetting.overrides.length - 1];
                if (setting) {
                    const valueStartPosition = model.getPositionAt(offset);
                    const valueEndPosition = model.getPositionAt(offset + length);
                    setting.value = value;
                    setting.valueRange = {
                        startLineNumber: valueStartPosition.lineNumber,
                        startColumn: valueStartPosition.column,
                        endLineNumber: valueEndPosition.lineNumber,
                        endColumn: valueEndPosition.column
                    };
                    setting.range = Object.assign(setting.range, {
                        endLineNumber: valueEndPosition.lineNumber,
                        endColumn: valueEndPosition.column
                    });
                }
            }
        }
        const visitor = {
            onObjectBegin: (offset, length) => {
                if (isSettingsProperty(currentProperty, previousParents)) {
                    // Settings started
                    settingsPropertyIndex = previousParents.length;
                    const position = model.getPositionAt(offset);
                    range.startLineNumber = position.lineNumber;
                    range.startColumn = position.column;
                }
                const object = {};
                onValue(object, offset, length);
                currentParent = object;
                currentProperty = null;
                previousParents.push(currentParent);
            },
            onObjectProperty: (name, offset, length) => {
                currentProperty = name;
                if (previousParents.length === settingsPropertyIndex + 1 || (previousParents.length === settingsPropertyIndex + 2 && overrideSetting !== null)) {
                    // setting started
                    const settingStartPosition = model.getPositionAt(offset);
                    const setting = {
                        description: [],
                        descriptionIsMarkdown: false,
                        key: name,
                        keyRange: {
                            startLineNumber: settingStartPosition.lineNumber,
                            startColumn: settingStartPosition.column + 1,
                            endLineNumber: settingStartPosition.lineNumber,
                            endColumn: settingStartPosition.column + length
                        },
                        range: {
                            startLineNumber: settingStartPosition.lineNumber,
                            startColumn: settingStartPosition.column,
                            endLineNumber: 0,
                            endColumn: 0
                        },
                        value: null,
                        valueRange: exports.$rE,
                        descriptionRanges: [],
                        overrides: [],
                        overrideOf: overrideSetting ?? undefined,
                    };
                    if (previousParents.length === settingsPropertyIndex + 1) {
                        settings.push(setting);
                        if (configurationRegistry_1.$kn.test(name)) {
                            overrideSetting = setting;
                        }
                    }
                    else {
                        overrideSetting.overrides.push(setting);
                    }
                }
            },
            onObjectEnd: (offset, length) => {
                currentParent = previousParents.pop();
                if (settingsPropertyIndex !== -1 && (previousParents.length === settingsPropertyIndex + 1 || (previousParents.length === settingsPropertyIndex + 2 && overrideSetting !== null))) {
                    // setting ended
                    const setting = previousParents.length === settingsPropertyIndex + 1 ? settings[settings.length - 1] : overrideSetting.overrides[overrideSetting.overrides.length - 1];
                    if (setting) {
                        const valueEndPosition = model.getPositionAt(offset + length);
                        setting.valueRange = Object.assign(setting.valueRange, {
                            endLineNumber: valueEndPosition.lineNumber,
                            endColumn: valueEndPosition.column
                        });
                        setting.range = Object.assign(setting.range, {
                            endLineNumber: valueEndPosition.lineNumber,
                            endColumn: valueEndPosition.column
                        });
                    }
                    if (previousParents.length === settingsPropertyIndex + 1) {
                        overrideSetting = null;
                    }
                }
                if (previousParents.length === settingsPropertyIndex) {
                    // settings ended
                    const position = model.getPositionAt(offset);
                    range.endLineNumber = position.lineNumber;
                    range.endColumn = position.column;
                    settingsPropertyIndex = -1;
                }
            },
            onArrayBegin: (offset, length) => {
                const array = [];
                onValue(array, offset, length);
                previousParents.push(currentParent);
                currentParent = array;
                currentProperty = null;
            },
            onArrayEnd: (offset, length) => {
                currentParent = previousParents.pop();
                if (previousParents.length === settingsPropertyIndex + 1 || (previousParents.length === settingsPropertyIndex + 2 && overrideSetting !== null)) {
                    // setting value ended
                    const setting = previousParents.length === settingsPropertyIndex + 1 ? settings[settings.length - 1] : overrideSetting.overrides[overrideSetting.overrides.length - 1];
                    if (setting) {
                        const valueEndPosition = model.getPositionAt(offset + length);
                        setting.valueRange = Object.assign(setting.valueRange, {
                            endLineNumber: valueEndPosition.lineNumber,
                            endColumn: valueEndPosition.column
                        });
                        setting.range = Object.assign(setting.range, {
                            endLineNumber: valueEndPosition.lineNumber,
                            endColumn: valueEndPosition.column
                        });
                    }
                }
            },
            onLiteralValue: onValue,
            onError: (error) => {
                const setting = settings[settings.length - 1];
                if (setting && (isNullRange(setting.range) || isNullRange(setting.keyRange) || isNullRange(setting.valueRange))) {
                    settings.pop();
                }
            }
        };
        if (!model.isDisposed()) {
            (0, json_1.$Sm)(model.getValue(), visitor);
        }
        return settings.length > 0 ? [{
                sections: [
                    {
                        settings
                    }
                ],
                title: '',
                titleRange: exports.$rE,
                range
            }] : [];
    }
    class $uE extends $sE {
        constructor() {
            super(...arguments);
            this.I = [];
        }
        get configurationGroups() {
            return this.I;
        }
        G() {
            super.G();
            this.I = parse(this.z, (property, previousParents) => previousParents.length === 0);
        }
        F(property, previousParents) {
            return property === 'settings' && previousParents.length === 1;
        }
    }
    exports.$uE = $uE;
    class $vE extends lifecycle_1.$kc {
        constructor(r, target) {
            super();
            this.r = r;
            this.target = target;
            this.n = new Map();
            this._onDidChange = this.B(new event_1.$fd());
            this.onDidChange = this._onDidChange.event;
        }
        getContent(forceUpdate = false) {
            if (!this.h || forceUpdate) {
                this.t();
            }
            return this.h;
        }
        getContentWithoutMostCommonlyUsed(forceUpdate = false) {
            if (!this.j || forceUpdate) {
                this.t();
            }
            return this.j;
        }
        getSettingsGroups(forceUpdate = false) {
            if (!this.f || forceUpdate) {
                this.t();
            }
            return this.f;
        }
        t() {
            this.f = this.u();
            this.h = this.J(this.f, 0);
            this.j = this.J(this.f, 1);
        }
        u() {
            const settingsGroups = this.getRegisteredGroups();
            this.y(settingsGroups);
            const mostCommonlyUsed = this.z(settingsGroups);
            return [mostCommonlyUsed, ...settingsGroups];
        }
        getRegisteredGroups() {
            const configurations = platform_1.$8m.as(configurationRegistry_1.$an.Configuration).getConfigurations().slice();
            const groups = this.D(configurations.sort(this.I)
                .reduce((result, config, index, array) => this.C(config, result, array), []));
            return this.w(groups);
        }
        w(groups) {
            groups.forEach(group => {
                group.sections.forEach(section => {
                    section.settings.sort((a, b) => a.key.localeCompare(b.key));
                });
            });
            return groups;
        }
        y(allSettingsGroups) {
            this.n = new Map();
            for (const group of allSettingsGroups) {
                for (const section of group.sections) {
                    for (const setting of section.settings) {
                        this.n.set(setting.key, setting);
                    }
                }
            }
        }
        z(allSettingsGroups) {
            const settings = (0, arrays_1.$Fb)(this.r.map(key => {
                const setting = this.n.get(key);
                if (setting) {
                    return {
                        description: setting.description,
                        key: setting.key,
                        value: setting.value,
                        keyRange: exports.$rE,
                        range: exports.$rE,
                        valueRange: exports.$rE,
                        overrides: [],
                        scope: 4 /* ConfigurationScope.RESOURCE */,
                        type: setting.type,
                        enum: setting.enum,
                        enumDescriptions: setting.enumDescriptions,
                        descriptionRanges: []
                    };
                }
                return null;
            }));
            return {
                id: 'mostCommonlyUsed',
                range: exports.$rE,
                title: nls.localize(0, null),
                titleRange: exports.$rE,
                sections: [
                    {
                        settings
                    }
                ]
            };
        }
        C(config, result, configurations, settingsGroup, seenSettings) {
            seenSettings = seenSettings ? seenSettings : {};
            let title = config.title;
            if (!title) {
                const configWithTitleAndSameId = configurations.find(c => (c.id === config.id) && c.title);
                if (configWithTitleAndSameId) {
                    title = configWithTitleAndSameId.title;
                }
            }
            if (title) {
                if (!settingsGroup) {
                    settingsGroup = result.find(g => g.title === title && g.extensionInfo?.id === config.extensionInfo?.id);
                    if (!settingsGroup) {
                        settingsGroup = { sections: [{ settings: [] }], id: config.id || '', title: title || '', titleRange: exports.$rE, order: config.order, range: exports.$rE, extensionInfo: config.extensionInfo };
                        result.push(settingsGroup);
                    }
                }
                else {
                    settingsGroup.sections[settingsGroup.sections.length - 1].title = title;
                }
            }
            if (config.properties) {
                if (!settingsGroup) {
                    settingsGroup = { sections: [{ settings: [] }], id: config.id || '', title: config.id || '', titleRange: exports.$rE, order: config.order, range: exports.$rE, extensionInfo: config.extensionInfo };
                    result.push(settingsGroup);
                }
                const configurationSettings = [];
                for (const setting of [...settingsGroup.sections[settingsGroup.sections.length - 1].settings, ...this.F(config)]) {
                    if (!seenSettings[setting.key]) {
                        configurationSettings.push(setting);
                        seenSettings[setting.key] = true;
                    }
                }
                if (configurationSettings.length) {
                    settingsGroup.sections[settingsGroup.sections.length - 1].settings = configurationSettings;
                }
            }
            config.allOf?.forEach(c => this.C(c, result, configurations, settingsGroup, seenSettings));
            return result;
        }
        D(settingsGroups) {
            const result = [];
            for (const settingsGroup of settingsGroups) {
                settingsGroup.sections = settingsGroup.sections.filter(section => section.settings.length > 0);
                if (settingsGroup.sections.length) {
                    result.push(settingsGroup);
                }
            }
            return result;
        }
        F(config) {
            const result = [];
            const settingsObject = config.properties;
            const extensionInfo = config.extensionInfo;
            // Try using the title if the category id wasn't given
            // (in which case the category id is the same as the extension id)
            const categoryLabel = config.extensionInfo?.id === config.id ? config.title : config.id;
            const categoryOrder = config.order;
            for (const key in settingsObject) {
                const prop = settingsObject[key];
                if (this.H(prop)) {
                    const value = prop.default;
                    let description = (prop.markdownDescription || prop.description || '');
                    if (typeof description !== 'string') {
                        description = '';
                    }
                    const descriptionLines = description.split('\n');
                    const overrides = configurationRegistry_1.$kn.test(key) ? this.G(prop.default) : [];
                    let listItemType;
                    if (prop.type === 'array' && prop.items && !Array.isArray(prop.items) && prop.items.type) {
                        if (prop.items.enum) {
                            listItemType = 'enum';
                        }
                        else if (!Array.isArray(prop.items.type)) {
                            listItemType = prop.items.type;
                        }
                    }
                    const objectProperties = prop.type === 'object' ? prop.properties : undefined;
                    const objectPatternProperties = prop.type === 'object' ? prop.patternProperties : undefined;
                    const objectAdditionalProperties = prop.type === 'object' ? prop.additionalProperties : undefined;
                    let enumToUse = prop.enum;
                    let enumDescriptions = prop.markdownEnumDescriptions ?? prop.enumDescriptions;
                    let enumDescriptionsAreMarkdown = !!prop.markdownEnumDescriptions;
                    if (listItemType === 'enum' && !Array.isArray(prop.items)) {
                        enumToUse = prop.items.enum;
                        enumDescriptions = prop.items.markdownEnumDescriptions ?? prop.items.enumDescriptions;
                        enumDescriptionsAreMarkdown = !!prop.items.markdownEnumDescriptions;
                    }
                    let allKeysAreBoolean = false;
                    if (prop.type === 'object' && !prop.additionalProperties && prop.properties && Object.keys(prop.properties).length) {
                        allKeysAreBoolean = Object.keys(prop.properties).every(key => {
                            return prop.properties[key].type === 'boolean';
                        });
                    }
                    let isLanguageTagSetting = false;
                    if (configurationRegistry_1.$kn.test(key)) {
                        isLanguageTagSetting = true;
                    }
                    let defaultValueSource;
                    if (!isLanguageTagSetting) {
                        const registeredConfigurationProp = prop;
                        if (registeredConfigurationProp && registeredConfigurationProp.defaultValueSource) {
                            defaultValueSource = registeredConfigurationProp.defaultValueSource;
                        }
                    }
                    result.push({
                        key,
                        value,
                        description: descriptionLines,
                        descriptionIsMarkdown: !!prop.markdownDescription,
                        range: exports.$rE,
                        keyRange: exports.$rE,
                        valueRange: exports.$rE,
                        descriptionRanges: [],
                        overrides,
                        scope: prop.scope,
                        type: prop.type,
                        arrayItemType: listItemType,
                        objectProperties,
                        objectPatternProperties,
                        objectAdditionalProperties,
                        enum: enumToUse,
                        enumDescriptions: enumDescriptions,
                        enumDescriptionsAreMarkdown: enumDescriptionsAreMarkdown,
                        uniqueItems: prop.uniqueItems,
                        tags: prop.tags,
                        disallowSyncIgnore: prop.disallowSyncIgnore,
                        restricted: prop.restricted,
                        extensionInfo: extensionInfo,
                        deprecationMessage: prop.markdownDeprecationMessage || prop.deprecationMessage,
                        deprecationMessageIsMarkdown: !!prop.markdownDeprecationMessage,
                        validator: (0, preferencesValidation_1.$pE)(prop),
                        enumItemLabels: prop.enumItemLabels,
                        allKeysAreBoolean,
                        editPresentation: prop.editPresentation,
                        order: prop.order,
                        nonLanguageSpecificDefaultValueSource: defaultValueSource,
                        isLanguageTagSetting,
                        categoryLabel,
                        categoryOrder
                    });
                }
            }
            return result;
        }
        G(overrideSettings) {
            return Object.keys(overrideSettings).map((key) => ({
                key,
                value: overrideSettings[key],
                description: [],
                descriptionIsMarkdown: false,
                range: exports.$rE,
                keyRange: exports.$rE,
                valueRange: exports.$rE,
                descriptionRanges: [],
                overrides: []
            }));
        }
        H(property) {
            if (!property.scope) {
                return true;
            }
            if (this.target === 6 /* ConfigurationTarget.WORKSPACE_FOLDER */) {
                return configuration_2.$hE.indexOf(property.scope) !== -1;
            }
            if (this.target === 5 /* ConfigurationTarget.WORKSPACE */) {
                return configuration_2.$gE.indexOf(property.scope) !== -1;
            }
            return true;
        }
        I(c1, c2) {
            if (typeof c1.order !== 'number') {
                return 1;
            }
            if (typeof c2.order !== 'number') {
                return -1;
            }
            if (c1.order === c2.order) {
                const title1 = c1.title || '';
                const title2 = c2.title || '';
                return title1.localeCompare(title2);
            }
            return c1.order - c2.order;
        }
        J(settingsGroups, startIndex) {
            const builder = new SettingsContentBuilder();
            for (let i = startIndex; i < settingsGroups.length; i++) {
                builder.pushGroup(settingsGroups[i], i === startIndex, i === settingsGroups.length - 1);
            }
            return builder.getContent();
        }
    }
    exports.$vE = $vE;
    class $wE extends AbstractSettingsModel {
        constructor(C, reference, D) {
            super();
            this.C = C;
            this.D = D;
            this.z = this.B(new event_1.$fd());
            this.onDidChangeGroups = this.z.event;
            this.B(D.onDidChange(() => this.z.fire()));
            this.y = reference.object.textEditorModel;
            this.B(this.onWillDispose(() => reference.dispose()));
        }
        get uri() {
            return this.C;
        }
        get target() {
            return this.D.target;
        }
        get settingsGroups() {
            return this.D.getSettingsGroups();
        }
        get u() {
            // Don't look at "commonly used" for filter
            return this.settingsGroups.slice(1);
        }
        w() {
            if (this.y.isDisposed()) {
                return undefined;
            }
            // Grab current result groups, only render non-empty groups
            const resultGroups = [...this.n.values()]
                .sort((a, b) => a.order - b.order);
            const nonEmptyResultGroups = resultGroups.filter(group => group.result.filterMatches.length);
            const startLine = (0, arrays_1.$qb)(this.settingsGroups).range.endLineNumber + 2;
            const { settingsGroups: filteredGroups, matches } = this.H(nonEmptyResultGroups, startLine);
            const metadata = this.t(resultGroups);
            return resultGroups.length ?
                {
                    allGroups: this.settingsGroups,
                    filteredGroups,
                    matches,
                    metadata
                } :
                undefined;
        }
        /**
         * Translate the ISearchResultGroups to text, and write it to the editor model
         */
        H(groups, startLine) {
            const contentBuilderOffset = startLine - 1;
            const builder = new SettingsContentBuilder(contentBuilderOffset);
            const settingsGroups = [];
            const matches = [];
            if (groups.length) {
                builder.pushLine(',');
                groups.forEach(resultGroup => {
                    const settingsGroup = this.L(resultGroup);
                    settingsGroups.push(settingsGroup);
                    matches.push(...this.I(builder, settingsGroup, resultGroup.result.filterMatches));
                });
            }
            // note: 1-indexed line numbers here
            const groupContent = builder.getContent() + '\n';
            const groupEndLine = this.y.getLineCount();
            const cursorPosition = new selection_1.$ms(startLine, 1, startLine, 1);
            const edit = {
                text: groupContent,
                forceMoveMarkers: true,
                range: new range_1.$ks(startLine, 1, groupEndLine, 1)
            };
            this.y.pushEditOperations([cursorPosition], [edit], () => [cursorPosition]);
            // Force tokenization now - otherwise it may be slightly delayed, causing a flash of white text
            const tokenizeTo = Math.min(startLine + 60, this.y.getLineCount());
            this.y.tokenization.forceTokenization(tokenizeTo);
            return { matches, settingsGroups };
        }
        I(builder, settingsGroup, filterMatches) {
            filterMatches = filterMatches
                .map(filteredMatch => {
                // Fix match ranges to offset from setting start line
                return {
                    setting: filteredMatch.setting,
                    score: filteredMatch.score,
                    matches: filteredMatch.matches && filteredMatch.matches.map(match => {
                        return new range_1.$ks(match.startLineNumber - filteredMatch.setting.range.startLineNumber, match.startColumn, match.endLineNumber - filteredMatch.setting.range.startLineNumber, match.endColumn);
                    })
                };
            });
            builder.pushGroup(settingsGroup);
            // builder has rewritten settings ranges, fix match ranges
            const fixedMatches = (0, arrays_1.$Pb)(filterMatches
                .map(m => m.matches || [])
                .map((settingMatches, i) => {
                const setting = settingsGroup.sections[0].settings[i];
                return settingMatches.map(range => {
                    return new range_1.$ks(range.startLineNumber + setting.range.startLineNumber, range.startColumn, range.endLineNumber + setting.range.startLineNumber, range.endColumn);
                });
            }));
            return fixedMatches;
        }
        J(setting) {
            return {
                description: setting.description,
                scope: setting.scope,
                type: setting.type,
                enum: setting.enum,
                enumDescriptions: setting.enumDescriptions,
                key: setting.key,
                value: setting.value,
                range: setting.range,
                overrides: [],
                overrideOf: setting.overrideOf,
                tags: setting.tags,
                deprecationMessage: setting.deprecationMessage,
                keyRange: exports.$rE,
                valueRange: exports.$rE,
                descriptionIsMarkdown: undefined,
                descriptionRanges: []
            };
        }
        findValueMatches(filter, setting) {
            return [];
        }
        getPreference(key) {
            for (const group of this.settingsGroups) {
                for (const section of group.sections) {
                    for (const setting of section.settings) {
                        if (setting.key === key) {
                            return setting;
                        }
                    }
                }
            }
            return undefined;
        }
        L(resultGroup) {
            return {
                id: resultGroup.id,
                range: exports.$rE,
                title: resultGroup.label,
                titleRange: exports.$rE,
                sections: [
                    {
                        settings: resultGroup.result.filterMatches.map(m => this.J(m.setting))
                    }
                ]
            };
        }
    }
    exports.$wE = $wE;
    class SettingsContentBuilder {
        get f() {
            return this.d.length + this.j;
        }
        get h() {
            return this.d[this.d.length - 1] || '';
        }
        constructor(j = 0) {
            this.j = j;
            this.d = [];
        }
        pushLine(...lineText) {
            this.d.push(...lineText);
        }
        pushGroup(settingsGroups, isFirst, isLast) {
            this.d.push(isFirst ? '[{' : '{');
            const lastSetting = this.k(settingsGroups, '  ');
            if (lastSetting) {
                // Strip the comma from the last setting
                const lineIdx = lastSetting.range.endLineNumber - this.j;
                const content = this.d[lineIdx - 2];
                this.d[lineIdx - 2] = content.substring(0, content.length - 1);
            }
            this.d.push(isLast ? '}]' : '},');
        }
        k(group, indent) {
            let lastSetting = null;
            const groupStart = this.f + 1;
            for (const section of group.sections) {
                if (section.title) {
                    const sectionTitleStart = this.f + 1;
                    this.q([section.title], indent, this.d);
                    section.titleRange = { startLineNumber: sectionTitleStart, startColumn: 1, endLineNumber: this.f, endColumn: this.h.length };
                }
                if (section.settings.length) {
                    for (const setting of section.settings) {
                        this.n(setting, indent);
                        lastSetting = setting;
                    }
                }
            }
            group.range = { startLineNumber: groupStart, startColumn: 1, endLineNumber: this.f, endColumn: this.h.length };
            return lastSetting;
        }
        getContent() {
            return this.d.join('\n');
        }
        n(setting, indent) {
            const settingStart = this.f + 1;
            this.o(setting, indent);
            let preValueContent = indent;
            const keyString = JSON.stringify(setting.key);
            preValueContent += keyString;
            setting.keyRange = { startLineNumber: this.f + 1, startColumn: preValueContent.indexOf(setting.key) + 1, endLineNumber: this.f + 1, endColumn: setting.key.length };
            preValueContent += ': ';
            const valueStart = this.f + 1;
            this.p(setting, preValueContent, indent);
            setting.valueRange = { startLineNumber: valueStart, startColumn: preValueContent.length + 1, endLineNumber: this.f, endColumn: this.h.length + 1 };
            this.d[this.d.length - 1] += ',';
            this.d.push('');
            setting.range = { startLineNumber: settingStart, startColumn: 1, endLineNumber: this.f, endColumn: this.h.length };
        }
        o(setting, indent) {
            const fixSettingLink = (line) => line.replace(/`#(.*)#`/g, (match, settingName) => `\`${settingName}\``);
            setting.descriptionRanges = [];
            const descriptionPreValue = indent + '// ';
            const deprecationMessageLines = setting.deprecationMessage?.split(/\n/g) ?? [];
            for (let line of [...deprecationMessageLines, ...setting.description]) {
                line = fixSettingLink(line);
                this.d.push(descriptionPreValue + line);
                setting.descriptionRanges.push({ startLineNumber: this.f, startColumn: this.h.indexOf(line) + 1, endLineNumber: this.f, endColumn: this.h.length });
            }
            if (setting.enumDescriptions && setting.enumDescriptions.some(desc => !!desc)) {
                setting.enumDescriptions.forEach((desc, i) => {
                    const displayEnum = escapeInvisibleChars(String(setting.enum[i]));
                    const line = desc ?
                        `${displayEnum}: ${fixSettingLink(desc)}` :
                        displayEnum;
                    const lines = line.split(/\n/g);
                    lines[0] = ' - ' + lines[0];
                    this.d.push(...lines.map(l => `${indent}// ${l}`));
                    setting.descriptionRanges.push({ startLineNumber: this.f, startColumn: this.h.indexOf(line) + 1, endLineNumber: this.f, endColumn: this.h.length });
                });
            }
        }
        p(setting, preValueConent, indent) {
            const valueString = JSON.stringify(setting.value, null, indent);
            if (valueString && (typeof setting.value === 'object')) {
                if (setting.overrides && setting.overrides.length) {
                    this.d.push(preValueConent + ' {');
                    for (const subSetting of setting.overrides) {
                        this.n(subSetting, indent + indent);
                        this.d.pop();
                    }
                    const lastSetting = setting.overrides[setting.overrides.length - 1];
                    const content = this.d[lastSetting.range.endLineNumber - 2];
                    this.d[lastSetting.range.endLineNumber - 2] = content.substring(0, content.length - 1);
                    this.d.push(indent + '}');
                }
                else {
                    const mulitLineValue = valueString.split('\n');
                    this.d.push(preValueConent + mulitLineValue[0]);
                    for (let i = 1; i < mulitLineValue.length; i++) {
                        this.d.push(indent + mulitLineValue[i]);
                    }
                }
            }
            else {
                this.d.push(preValueConent + valueString);
            }
        }
        q(description, indent, result) {
            for (const line of description) {
                result.push(indent + '// ' + line);
            }
        }
    }
    class RawSettingsContentBuilder extends SettingsContentBuilder {
        constructor(r = '\t') {
            super(0);
            this.r = r;
        }
        pushGroup(settingsGroups) {
            this.k(settingsGroups, this.r);
        }
    }
    class $xE extends lifecycle_1.$kc {
        constructor(h) {
            super();
            this.h = h;
            this.f = null;
            this.B(h.onDidChange(() => this.f = null));
        }
        get content() {
            if (this.f === null) {
                const builder = new RawSettingsContentBuilder();
                builder.pushLine('{');
                for (const settingsGroup of this.h.getRegisteredGroups()) {
                    builder.pushGroup(settingsGroup);
                }
                builder.pushLine('}');
                this.f = builder.getContent();
            }
            return this.f;
        }
    }
    exports.$xE = $xE;
    function escapeInvisibleChars(enumValue) {
        return enumValue && enumValue
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r');
    }
    function $yE(keybindingService) {
        const defaultsHeader = '// ' + nls.localize(1, null);
        return defaultsHeader + '\n' + keybindingService.getDefaultKeybindingsContent();
    }
    exports.$yE = $yE;
    let $zE = class $zE {
        constructor(f, h) {
            this.f = f;
            this.h = h;
        }
        get uri() {
            return this.f;
        }
        get content() {
            if (!this.d) {
                this.d = $yE(this.h);
            }
            return this.d;
        }
        getPreference() {
            return null;
        }
        dispose() {
            // Not disposable
        }
    };
    exports.$zE = $zE;
    exports.$zE = $zE = __decorate([
        __param(1, keybinding_1.$2D)
    ], $zE);
});
//# sourceMappingURL=preferencesModels.js.map