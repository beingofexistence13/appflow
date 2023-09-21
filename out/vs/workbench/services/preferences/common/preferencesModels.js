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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/json", "vs/base/common/lifecycle", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/keybinding/common/keybinding", "vs/platform/registry/common/platform", "vs/workbench/common/editor/editorModel", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/configuration/common/configuration", "vs/workbench/services/preferences/common/preferencesValidation"], function (require, exports, arrays_1, event_1, json_1, lifecycle_1, range_1, selection_1, nls, configuration_1, configurationRegistry_1, keybinding_1, platform_1, editorModel_1, preferences_1, configuration_2, preferencesValidation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DefaultKeybindingsEditorModel = exports.defaultKeybindingsContents = exports.DefaultRawSettingsEditorModel = exports.DefaultSettingsEditorModel = exports.DefaultSettings = exports.WorkspaceConfigurationEditorModel = exports.Settings2EditorModel = exports.SettingsEditorModel = exports.nullRange = void 0;
    exports.nullRange = { startLineNumber: -1, startColumn: -1, endLineNumber: -1, endColumn: -1 };
    function isNullRange(range) { return range.startLineNumber === -1 && range.startColumn === -1 && range.endLineNumber === -1 && range.endColumn === -1; }
    class AbstractSettingsModel extends editorModel_1.EditorModel {
        constructor() {
            super(...arguments);
            this._currentResultGroups = new Map();
        }
        updateResultGroup(id, resultGroup) {
            if (resultGroup) {
                this._currentResultGroups.set(id, resultGroup);
            }
            else {
                this._currentResultGroups.delete(id);
            }
            this.removeDuplicateResults();
            return this.update();
        }
        /**
         * Remove duplicates between result groups, preferring results in earlier groups
         */
        removeDuplicateResults() {
            const settingKeys = new Set();
            [...this._currentResultGroups.keys()]
                .sort((a, b) => this._currentResultGroups.get(a).order - this._currentResultGroups.get(b).order)
                .forEach(groupId => {
                const group = this._currentResultGroups.get(groupId);
                group.result.filterMatches = group.result.filterMatches.filter(s => !settingKeys.has(s.setting.key));
                group.result.filterMatches.forEach(s => settingKeys.add(s.setting.key));
            });
        }
        filterSettings(filter, groupFilter, settingMatcher) {
            const allGroups = this.filterGroups;
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
        collectMetadata(groups) {
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
        get filterGroups() {
            return this.settingsGroups;
        }
    }
    class SettingsEditorModel extends AbstractSettingsModel {
        constructor(reference, _configurationTarget) {
            super();
            this._configurationTarget = _configurationTarget;
            this._onDidChangeGroups = this._register(new event_1.Emitter());
            this.onDidChangeGroups = this._onDidChangeGroups.event;
            this.settingsModel = reference.object.textEditorModel;
            this._register(this.onWillDispose(() => reference.dispose()));
            this._register(this.settingsModel.onDidChangeContent(() => {
                this._settingsGroups = undefined;
                this._onDidChangeGroups.fire();
            }));
        }
        get uri() {
            return this.settingsModel.uri;
        }
        get configurationTarget() {
            return this._configurationTarget;
        }
        get settingsGroups() {
            if (!this._settingsGroups) {
                this.parse();
            }
            return this._settingsGroups;
        }
        get content() {
            return this.settingsModel.getValue();
        }
        findValueMatches(filter, setting) {
            return this.settingsModel.findMatches(filter, setting.valueRange, false, false, null, false).map(match => match.range);
        }
        isSettingsProperty(property, previousParents) {
            return previousParents.length === 0; // Settings is root
        }
        parse() {
            this._settingsGroups = parse(this.settingsModel, (property, previousParents) => this.isSettingsProperty(property, previousParents));
        }
        update() {
            const resultGroups = [...this._currentResultGroups.values()];
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
            const metadata = this.collectMetadata(resultGroups);
            return {
                allGroups: this.settingsGroups,
                filteredGroups: filteredGroup ? [filteredGroup] : [],
                matches,
                metadata
            };
        }
    }
    exports.SettingsEditorModel = SettingsEditorModel;
    let Settings2EditorModel = class Settings2EditorModel extends AbstractSettingsModel {
        constructor(_defaultSettings, configurationService) {
            super();
            this._defaultSettings = _defaultSettings;
            this._onDidChangeGroups = this._register(new event_1.Emitter());
            this.onDidChangeGroups = this._onDidChangeGroups.event;
            this.dirty = false;
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.source === 7 /* ConfigurationTarget.DEFAULT */) {
                    this.dirty = true;
                    this._onDidChangeGroups.fire();
                }
            }));
            this._register(platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).onDidSchemaChange(e => {
                this.dirty = true;
                this._onDidChangeGroups.fire();
            }));
        }
        /** Doesn't include the "Commonly Used" group */
        get filterGroups() {
            return this.settingsGroups.slice(1);
        }
        get settingsGroups() {
            const groups = this._defaultSettings.getSettingsGroups(this.dirty);
            if (this.additionalGroups?.length) {
                groups.push(...this.additionalGroups);
            }
            this.dirty = false;
            return groups;
        }
        /** For programmatically added groups outside of registered configurations */
        setAdditionalGroups(groups) {
            this.additionalGroups = groups;
        }
        findValueMatches(filter, setting) {
            // TODO @roblou
            return [];
        }
        update() {
            throw new Error('Not supported');
        }
    };
    exports.Settings2EditorModel = Settings2EditorModel;
    exports.Settings2EditorModel = Settings2EditorModel = __decorate([
        __param(1, configuration_1.IConfigurationService)
    ], Settings2EditorModel);
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
                        valueRange: exports.nullRange,
                        descriptionRanges: [],
                        overrides: [],
                        overrideOf: overrideSetting ?? undefined,
                    };
                    if (previousParents.length === settingsPropertyIndex + 1) {
                        settings.push(setting);
                        if (configurationRegistry_1.OVERRIDE_PROPERTY_REGEX.test(name)) {
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
            (0, json_1.visit)(model.getValue(), visitor);
        }
        return settings.length > 0 ? [{
                sections: [
                    {
                        settings
                    }
                ],
                title: '',
                titleRange: exports.nullRange,
                range
            }] : [];
    }
    class WorkspaceConfigurationEditorModel extends SettingsEditorModel {
        constructor() {
            super(...arguments);
            this._configurationGroups = [];
        }
        get configurationGroups() {
            return this._configurationGroups;
        }
        parse() {
            super.parse();
            this._configurationGroups = parse(this.settingsModel, (property, previousParents) => previousParents.length === 0);
        }
        isSettingsProperty(property, previousParents) {
            return property === 'settings' && previousParents.length === 1;
        }
    }
    exports.WorkspaceConfigurationEditorModel = WorkspaceConfigurationEditorModel;
    class DefaultSettings extends lifecycle_1.Disposable {
        constructor(_mostCommonlyUsedSettingsKeys, target) {
            super();
            this._mostCommonlyUsedSettingsKeys = _mostCommonlyUsedSettingsKeys;
            this.target = target;
            this._settingsByName = new Map();
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
        }
        getContent(forceUpdate = false) {
            if (!this._content || forceUpdate) {
                this.initialize();
            }
            return this._content;
        }
        getContentWithoutMostCommonlyUsed(forceUpdate = false) {
            if (!this._contentWithoutMostCommonlyUsed || forceUpdate) {
                this.initialize();
            }
            return this._contentWithoutMostCommonlyUsed;
        }
        getSettingsGroups(forceUpdate = false) {
            if (!this._allSettingsGroups || forceUpdate) {
                this.initialize();
            }
            return this._allSettingsGroups;
        }
        initialize() {
            this._allSettingsGroups = this.parse();
            this._content = this.toContent(this._allSettingsGroups, 0);
            this._contentWithoutMostCommonlyUsed = this.toContent(this._allSettingsGroups, 1);
        }
        parse() {
            const settingsGroups = this.getRegisteredGroups();
            this.initAllSettingsMap(settingsGroups);
            const mostCommonlyUsed = this.getMostCommonlyUsedSettings(settingsGroups);
            return [mostCommonlyUsed, ...settingsGroups];
        }
        getRegisteredGroups() {
            const configurations = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurations().slice();
            const groups = this.removeEmptySettingsGroups(configurations.sort(this.compareConfigurationNodes)
                .reduce((result, config, index, array) => this.parseConfig(config, result, array), []));
            return this.sortGroups(groups);
        }
        sortGroups(groups) {
            groups.forEach(group => {
                group.sections.forEach(section => {
                    section.settings.sort((a, b) => a.key.localeCompare(b.key));
                });
            });
            return groups;
        }
        initAllSettingsMap(allSettingsGroups) {
            this._settingsByName = new Map();
            for (const group of allSettingsGroups) {
                for (const section of group.sections) {
                    for (const setting of section.settings) {
                        this._settingsByName.set(setting.key, setting);
                    }
                }
            }
        }
        getMostCommonlyUsedSettings(allSettingsGroups) {
            const settings = (0, arrays_1.coalesce)(this._mostCommonlyUsedSettingsKeys.map(key => {
                const setting = this._settingsByName.get(key);
                if (setting) {
                    return {
                        description: setting.description,
                        key: setting.key,
                        value: setting.value,
                        keyRange: exports.nullRange,
                        range: exports.nullRange,
                        valueRange: exports.nullRange,
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
                range: exports.nullRange,
                title: nls.localize('commonlyUsed', "Commonly Used"),
                titleRange: exports.nullRange,
                sections: [
                    {
                        settings
                    }
                ]
            };
        }
        parseConfig(config, result, configurations, settingsGroup, seenSettings) {
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
                        settingsGroup = { sections: [{ settings: [] }], id: config.id || '', title: title || '', titleRange: exports.nullRange, order: config.order, range: exports.nullRange, extensionInfo: config.extensionInfo };
                        result.push(settingsGroup);
                    }
                }
                else {
                    settingsGroup.sections[settingsGroup.sections.length - 1].title = title;
                }
            }
            if (config.properties) {
                if (!settingsGroup) {
                    settingsGroup = { sections: [{ settings: [] }], id: config.id || '', title: config.id || '', titleRange: exports.nullRange, order: config.order, range: exports.nullRange, extensionInfo: config.extensionInfo };
                    result.push(settingsGroup);
                }
                const configurationSettings = [];
                for (const setting of [...settingsGroup.sections[settingsGroup.sections.length - 1].settings, ...this.parseSettings(config)]) {
                    if (!seenSettings[setting.key]) {
                        configurationSettings.push(setting);
                        seenSettings[setting.key] = true;
                    }
                }
                if (configurationSettings.length) {
                    settingsGroup.sections[settingsGroup.sections.length - 1].settings = configurationSettings;
                }
            }
            config.allOf?.forEach(c => this.parseConfig(c, result, configurations, settingsGroup, seenSettings));
            return result;
        }
        removeEmptySettingsGroups(settingsGroups) {
            const result = [];
            for (const settingsGroup of settingsGroups) {
                settingsGroup.sections = settingsGroup.sections.filter(section => section.settings.length > 0);
                if (settingsGroup.sections.length) {
                    result.push(settingsGroup);
                }
            }
            return result;
        }
        parseSettings(config) {
            const result = [];
            const settingsObject = config.properties;
            const extensionInfo = config.extensionInfo;
            // Try using the title if the category id wasn't given
            // (in which case the category id is the same as the extension id)
            const categoryLabel = config.extensionInfo?.id === config.id ? config.title : config.id;
            const categoryOrder = config.order;
            for (const key in settingsObject) {
                const prop = settingsObject[key];
                if (this.matchesScope(prop)) {
                    const value = prop.default;
                    let description = (prop.markdownDescription || prop.description || '');
                    if (typeof description !== 'string') {
                        description = '';
                    }
                    const descriptionLines = description.split('\n');
                    const overrides = configurationRegistry_1.OVERRIDE_PROPERTY_REGEX.test(key) ? this.parseOverrideSettings(prop.default) : [];
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
                    if (configurationRegistry_1.OVERRIDE_PROPERTY_REGEX.test(key)) {
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
                        range: exports.nullRange,
                        keyRange: exports.nullRange,
                        valueRange: exports.nullRange,
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
                        validator: (0, preferencesValidation_1.createValidator)(prop),
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
        parseOverrideSettings(overrideSettings) {
            return Object.keys(overrideSettings).map((key) => ({
                key,
                value: overrideSettings[key],
                description: [],
                descriptionIsMarkdown: false,
                range: exports.nullRange,
                keyRange: exports.nullRange,
                valueRange: exports.nullRange,
                descriptionRanges: [],
                overrides: []
            }));
        }
        matchesScope(property) {
            if (!property.scope) {
                return true;
            }
            if (this.target === 6 /* ConfigurationTarget.WORKSPACE_FOLDER */) {
                return configuration_2.FOLDER_SCOPES.indexOf(property.scope) !== -1;
            }
            if (this.target === 5 /* ConfigurationTarget.WORKSPACE */) {
                return configuration_2.WORKSPACE_SCOPES.indexOf(property.scope) !== -1;
            }
            return true;
        }
        compareConfigurationNodes(c1, c2) {
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
        toContent(settingsGroups, startIndex) {
            const builder = new SettingsContentBuilder();
            for (let i = startIndex; i < settingsGroups.length; i++) {
                builder.pushGroup(settingsGroups[i], i === startIndex, i === settingsGroups.length - 1);
            }
            return builder.getContent();
        }
    }
    exports.DefaultSettings = DefaultSettings;
    class DefaultSettingsEditorModel extends AbstractSettingsModel {
        constructor(_uri, reference, defaultSettings) {
            super();
            this._uri = _uri;
            this.defaultSettings = defaultSettings;
            this._onDidChangeGroups = this._register(new event_1.Emitter());
            this.onDidChangeGroups = this._onDidChangeGroups.event;
            this._register(defaultSettings.onDidChange(() => this._onDidChangeGroups.fire()));
            this._model = reference.object.textEditorModel;
            this._register(this.onWillDispose(() => reference.dispose()));
        }
        get uri() {
            return this._uri;
        }
        get target() {
            return this.defaultSettings.target;
        }
        get settingsGroups() {
            return this.defaultSettings.getSettingsGroups();
        }
        get filterGroups() {
            // Don't look at "commonly used" for filter
            return this.settingsGroups.slice(1);
        }
        update() {
            if (this._model.isDisposed()) {
                return undefined;
            }
            // Grab current result groups, only render non-empty groups
            const resultGroups = [...this._currentResultGroups.values()]
                .sort((a, b) => a.order - b.order);
            const nonEmptyResultGroups = resultGroups.filter(group => group.result.filterMatches.length);
            const startLine = (0, arrays_1.tail)(this.settingsGroups).range.endLineNumber + 2;
            const { settingsGroups: filteredGroups, matches } = this.writeResultGroups(nonEmptyResultGroups, startLine);
            const metadata = this.collectMetadata(resultGroups);
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
        writeResultGroups(groups, startLine) {
            const contentBuilderOffset = startLine - 1;
            const builder = new SettingsContentBuilder(contentBuilderOffset);
            const settingsGroups = [];
            const matches = [];
            if (groups.length) {
                builder.pushLine(',');
                groups.forEach(resultGroup => {
                    const settingsGroup = this.getGroup(resultGroup);
                    settingsGroups.push(settingsGroup);
                    matches.push(...this.writeSettingsGroupToBuilder(builder, settingsGroup, resultGroup.result.filterMatches));
                });
            }
            // note: 1-indexed line numbers here
            const groupContent = builder.getContent() + '\n';
            const groupEndLine = this._model.getLineCount();
            const cursorPosition = new selection_1.Selection(startLine, 1, startLine, 1);
            const edit = {
                text: groupContent,
                forceMoveMarkers: true,
                range: new range_1.Range(startLine, 1, groupEndLine, 1)
            };
            this._model.pushEditOperations([cursorPosition], [edit], () => [cursorPosition]);
            // Force tokenization now - otherwise it may be slightly delayed, causing a flash of white text
            const tokenizeTo = Math.min(startLine + 60, this._model.getLineCount());
            this._model.tokenization.forceTokenization(tokenizeTo);
            return { matches, settingsGroups };
        }
        writeSettingsGroupToBuilder(builder, settingsGroup, filterMatches) {
            filterMatches = filterMatches
                .map(filteredMatch => {
                // Fix match ranges to offset from setting start line
                return {
                    setting: filteredMatch.setting,
                    score: filteredMatch.score,
                    matches: filteredMatch.matches && filteredMatch.matches.map(match => {
                        return new range_1.Range(match.startLineNumber - filteredMatch.setting.range.startLineNumber, match.startColumn, match.endLineNumber - filteredMatch.setting.range.startLineNumber, match.endColumn);
                    })
                };
            });
            builder.pushGroup(settingsGroup);
            // builder has rewritten settings ranges, fix match ranges
            const fixedMatches = (0, arrays_1.flatten)(filterMatches
                .map(m => m.matches || [])
                .map((settingMatches, i) => {
                const setting = settingsGroup.sections[0].settings[i];
                return settingMatches.map(range => {
                    return new range_1.Range(range.startLineNumber + setting.range.startLineNumber, range.startColumn, range.endLineNumber + setting.range.startLineNumber, range.endColumn);
                });
            }));
            return fixedMatches;
        }
        copySetting(setting) {
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
                keyRange: exports.nullRange,
                valueRange: exports.nullRange,
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
        getGroup(resultGroup) {
            return {
                id: resultGroup.id,
                range: exports.nullRange,
                title: resultGroup.label,
                titleRange: exports.nullRange,
                sections: [
                    {
                        settings: resultGroup.result.filterMatches.map(m => this.copySetting(m.setting))
                    }
                ]
            };
        }
    }
    exports.DefaultSettingsEditorModel = DefaultSettingsEditorModel;
    class SettingsContentBuilder {
        get lineCountWithOffset() {
            return this._contentByLines.length + this._rangeOffset;
        }
        get lastLine() {
            return this._contentByLines[this._contentByLines.length - 1] || '';
        }
        constructor(_rangeOffset = 0) {
            this._rangeOffset = _rangeOffset;
            this._contentByLines = [];
        }
        pushLine(...lineText) {
            this._contentByLines.push(...lineText);
        }
        pushGroup(settingsGroups, isFirst, isLast) {
            this._contentByLines.push(isFirst ? '[{' : '{');
            const lastSetting = this._pushGroup(settingsGroups, '  ');
            if (lastSetting) {
                // Strip the comma from the last setting
                const lineIdx = lastSetting.range.endLineNumber - this._rangeOffset;
                const content = this._contentByLines[lineIdx - 2];
                this._contentByLines[lineIdx - 2] = content.substring(0, content.length - 1);
            }
            this._contentByLines.push(isLast ? '}]' : '},');
        }
        _pushGroup(group, indent) {
            let lastSetting = null;
            const groupStart = this.lineCountWithOffset + 1;
            for (const section of group.sections) {
                if (section.title) {
                    const sectionTitleStart = this.lineCountWithOffset + 1;
                    this.addDescription([section.title], indent, this._contentByLines);
                    section.titleRange = { startLineNumber: sectionTitleStart, startColumn: 1, endLineNumber: this.lineCountWithOffset, endColumn: this.lastLine.length };
                }
                if (section.settings.length) {
                    for (const setting of section.settings) {
                        this.pushSetting(setting, indent);
                        lastSetting = setting;
                    }
                }
            }
            group.range = { startLineNumber: groupStart, startColumn: 1, endLineNumber: this.lineCountWithOffset, endColumn: this.lastLine.length };
            return lastSetting;
        }
        getContent() {
            return this._contentByLines.join('\n');
        }
        pushSetting(setting, indent) {
            const settingStart = this.lineCountWithOffset + 1;
            this.pushSettingDescription(setting, indent);
            let preValueContent = indent;
            const keyString = JSON.stringify(setting.key);
            preValueContent += keyString;
            setting.keyRange = { startLineNumber: this.lineCountWithOffset + 1, startColumn: preValueContent.indexOf(setting.key) + 1, endLineNumber: this.lineCountWithOffset + 1, endColumn: setting.key.length };
            preValueContent += ': ';
            const valueStart = this.lineCountWithOffset + 1;
            this.pushValue(setting, preValueContent, indent);
            setting.valueRange = { startLineNumber: valueStart, startColumn: preValueContent.length + 1, endLineNumber: this.lineCountWithOffset, endColumn: this.lastLine.length + 1 };
            this._contentByLines[this._contentByLines.length - 1] += ',';
            this._contentByLines.push('');
            setting.range = { startLineNumber: settingStart, startColumn: 1, endLineNumber: this.lineCountWithOffset, endColumn: this.lastLine.length };
        }
        pushSettingDescription(setting, indent) {
            const fixSettingLink = (line) => line.replace(/`#(.*)#`/g, (match, settingName) => `\`${settingName}\``);
            setting.descriptionRanges = [];
            const descriptionPreValue = indent + '// ';
            const deprecationMessageLines = setting.deprecationMessage?.split(/\n/g) ?? [];
            for (let line of [...deprecationMessageLines, ...setting.description]) {
                line = fixSettingLink(line);
                this._contentByLines.push(descriptionPreValue + line);
                setting.descriptionRanges.push({ startLineNumber: this.lineCountWithOffset, startColumn: this.lastLine.indexOf(line) + 1, endLineNumber: this.lineCountWithOffset, endColumn: this.lastLine.length });
            }
            if (setting.enumDescriptions && setting.enumDescriptions.some(desc => !!desc)) {
                setting.enumDescriptions.forEach((desc, i) => {
                    const displayEnum = escapeInvisibleChars(String(setting.enum[i]));
                    const line = desc ?
                        `${displayEnum}: ${fixSettingLink(desc)}` :
                        displayEnum;
                    const lines = line.split(/\n/g);
                    lines[0] = ' - ' + lines[0];
                    this._contentByLines.push(...lines.map(l => `${indent}// ${l}`));
                    setting.descriptionRanges.push({ startLineNumber: this.lineCountWithOffset, startColumn: this.lastLine.indexOf(line) + 1, endLineNumber: this.lineCountWithOffset, endColumn: this.lastLine.length });
                });
            }
        }
        pushValue(setting, preValueConent, indent) {
            const valueString = JSON.stringify(setting.value, null, indent);
            if (valueString && (typeof setting.value === 'object')) {
                if (setting.overrides && setting.overrides.length) {
                    this._contentByLines.push(preValueConent + ' {');
                    for (const subSetting of setting.overrides) {
                        this.pushSetting(subSetting, indent + indent);
                        this._contentByLines.pop();
                    }
                    const lastSetting = setting.overrides[setting.overrides.length - 1];
                    const content = this._contentByLines[lastSetting.range.endLineNumber - 2];
                    this._contentByLines[lastSetting.range.endLineNumber - 2] = content.substring(0, content.length - 1);
                    this._contentByLines.push(indent + '}');
                }
                else {
                    const mulitLineValue = valueString.split('\n');
                    this._contentByLines.push(preValueConent + mulitLineValue[0]);
                    for (let i = 1; i < mulitLineValue.length; i++) {
                        this._contentByLines.push(indent + mulitLineValue[i]);
                    }
                }
            }
            else {
                this._contentByLines.push(preValueConent + valueString);
            }
        }
        addDescription(description, indent, result) {
            for (const line of description) {
                result.push(indent + '// ' + line);
            }
        }
    }
    class RawSettingsContentBuilder extends SettingsContentBuilder {
        constructor(indent = '\t') {
            super(0);
            this.indent = indent;
        }
        pushGroup(settingsGroups) {
            this._pushGroup(settingsGroups, this.indent);
        }
    }
    class DefaultRawSettingsEditorModel extends lifecycle_1.Disposable {
        constructor(defaultSettings) {
            super();
            this.defaultSettings = defaultSettings;
            this._content = null;
            this._register(defaultSettings.onDidChange(() => this._content = null));
        }
        get content() {
            if (this._content === null) {
                const builder = new RawSettingsContentBuilder();
                builder.pushLine('{');
                for (const settingsGroup of this.defaultSettings.getRegisteredGroups()) {
                    builder.pushGroup(settingsGroup);
                }
                builder.pushLine('}');
                this._content = builder.getContent();
            }
            return this._content;
        }
    }
    exports.DefaultRawSettingsEditorModel = DefaultRawSettingsEditorModel;
    function escapeInvisibleChars(enumValue) {
        return enumValue && enumValue
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r');
    }
    function defaultKeybindingsContents(keybindingService) {
        const defaultsHeader = '// ' + nls.localize('defaultKeybindingsHeader', "Override key bindings by placing them into your key bindings file.");
        return defaultsHeader + '\n' + keybindingService.getDefaultKeybindingsContent();
    }
    exports.defaultKeybindingsContents = defaultKeybindingsContents;
    let DefaultKeybindingsEditorModel = class DefaultKeybindingsEditorModel {
        constructor(_uri, keybindingService) {
            this._uri = _uri;
            this.keybindingService = keybindingService;
        }
        get uri() {
            return this._uri;
        }
        get content() {
            if (!this._content) {
                this._content = defaultKeybindingsContents(this.keybindingService);
            }
            return this._content;
        }
        getPreference() {
            return null;
        }
        dispose() {
            // Not disposable
        }
    };
    exports.DefaultKeybindingsEditorModel = DefaultKeybindingsEditorModel;
    exports.DefaultKeybindingsEditorModel = DefaultKeybindingsEditorModel = __decorate([
        __param(1, keybinding_1.IKeybindingService)
    ], DefaultKeybindingsEditorModel);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmVyZW5jZXNNb2RlbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvcHJlZmVyZW5jZXMvY29tbW9uL3ByZWZlcmVuY2VzTW9kZWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXVCbkYsUUFBQSxTQUFTLEdBQVcsRUFBRSxlQUFlLEVBQUUsQ0FBQyxDQUFDLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUM1RyxTQUFTLFdBQVcsQ0FBQyxLQUFhLElBQWEsT0FBTyxLQUFLLENBQUMsZUFBZSxLQUFLLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxXQUFXLEtBQUssQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLGFBQWEsS0FBSyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsU0FBUyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUV6SyxNQUFlLHFCQUFzQixTQUFRLHlCQUFXO1FBQXhEOztZQUVXLHlCQUFvQixHQUFHLElBQUksR0FBRyxFQUE4QixDQUFDO1FBeUZ4RSxDQUFDO1FBdkZBLGlCQUFpQixDQUFDLEVBQVUsRUFBRSxXQUEyQztZQUN4RSxJQUFJLFdBQVcsRUFBRTtnQkFDaEIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsV0FBVyxDQUFDLENBQUM7YUFDL0M7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUNyQztZQUVELElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1lBQzlCLE9BQU8sSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3RCLENBQUM7UUFFRDs7V0FFRztR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