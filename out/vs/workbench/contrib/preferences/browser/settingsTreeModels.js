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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/strings", "vs/base/common/types", "vs/base/common/uri", "vs/workbench/contrib/preferences/browser/settingsLayout", "vs/workbench/contrib/preferences/common/preferences", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/configuration/common/configuration", "vs/base/common/lifecycle", "vs/base/common/event", "vs/platform/configuration/common/configurationRegistry", "vs/editor/common/languages/language", "vs/platform/registry/common/platform", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/product/common/productService"], function (require, exports, arrays, strings_1, types_1, uri_1, settingsLayout_1, preferences_1, preferences_2, environmentService_1, configuration_1, lifecycle_1, event_1, configurationRegistry_1, language_1, platform_1, userDataProfile_1, productService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseQuery = exports.SearchResultModel = exports.SearchResultIdx = exports.settingKeyToDisplayFormat = exports.inspectSetting = exports.SettingsTreeModel = exports.SettingsTreeSettingElement = exports.SettingsTreeNewExtensionsElement = exports.SettingsTreeGroupElement = exports.SettingsTreeElement = exports.ONLINE_SERVICES_SETTING_TAG = void 0;
    exports.ONLINE_SERVICES_SETTING_TAG = 'usesOnlineServices';
    class SettingsTreeElement extends lifecycle_1.Disposable {
        constructor(_id) {
            super();
            this._tabbable = false;
            this._onDidChangeTabbable = new event_1.Emitter();
            this.onDidChangeTabbable = this._onDidChangeTabbable.event;
            this.id = _id;
        }
        get tabbable() {
            return this._tabbable;
        }
        set tabbable(value) {
            this._tabbable = value;
            this._onDidChangeTabbable.fire();
        }
    }
    exports.SettingsTreeElement = SettingsTreeElement;
    class SettingsTreeGroupElement extends SettingsTreeElement {
        get children() {
            return this._children;
        }
        set children(newChildren) {
            this._children = newChildren;
            this._childSettingKeys = new Set();
            this._children.forEach(child => {
                if (child instanceof SettingsTreeSettingElement) {
                    this._childSettingKeys.add(child.setting.key);
                }
            });
        }
        constructor(_id, count, label, level, isFirstGroup) {
            super(_id);
            this._childSettingKeys = new Set();
            this._children = [];
            this.count = count;
            this.label = label;
            this.level = level;
            this.isFirstGroup = isFirstGroup;
        }
        /**
         * Returns whether this group contains the given child key (to a depth of 1 only)
         */
        containsSetting(key) {
            return this._childSettingKeys.has(key);
        }
    }
    exports.SettingsTreeGroupElement = SettingsTreeGroupElement;
    class SettingsTreeNewExtensionsElement extends SettingsTreeElement {
        constructor(_id, extensionIds) {
            super(_id);
            this.extensionIds = extensionIds;
        }
    }
    exports.SettingsTreeNewExtensionsElement = SettingsTreeNewExtensionsElement;
    class SettingsTreeSettingElement extends SettingsTreeElement {
        static { this.MAX_DESC_LINES = 20; }
        constructor(setting, parent, settingsTarget, isWorkspaceTrusted, languageFilter, languageService, productService, userDataProfileService, configurationService) {
            super(sanitizeId(parent.id + '_' + setting.key));
            this.settingsTarget = settingsTarget;
            this.isWorkspaceTrusted = isWorkspaceTrusted;
            this.languageFilter = languageFilter;
            this.languageService = languageService;
            this.productService = productService;
            this.userDataProfileService = userDataProfileService;
            this.configurationService = configurationService;
            this._displayCategory = null;
            this._displayLabel = null;
            /**
             * Whether the setting is configured in the selected scope.
             */
            this.isConfigured = false;
            /**
             * Whether the setting requires trusted target
             */
            this.isUntrusted = false;
            /**
             * Whether the setting is under a policy that blocks all changes.
             */
            this.hasPolicyValue = false;
            this.overriddenScopeList = [];
            this.overriddenDefaultsLanguageList = [];
            /**
             * For each language that contributes setting values or default overrides, we can see those values here.
             */
            this.languageOverrideValues = new Map();
            this.setting = setting;
            this.parent = parent;
            // Make sure description and valueType are initialized
            this.initSettingDescription();
            this.initSettingValueType();
        }
        get displayCategory() {
            if (!this._displayCategory) {
                this.initLabels();
            }
            return this._displayCategory;
        }
        get displayLabel() {
            if (!this._displayLabel) {
                this.initLabels();
            }
            return this._displayLabel;
        }
        initLabels() {
            if (this.setting.title) {
                this._displayLabel = this.setting.title;
                this._displayCategory = '';
                return;
            }
            const displayKeyFormat = settingKeyToDisplayFormat(this.setting.key, this.parent.id, this.setting.isLanguageTagSetting);
            this._displayLabel = displayKeyFormat.label;
            this._displayCategory = displayKeyFormat.category;
        }
        initSettingDescription() {
            if (this.setting.description.length > SettingsTreeSettingElement.MAX_DESC_LINES) {
                const truncatedDescLines = this.setting.description.slice(0, SettingsTreeSettingElement.MAX_DESC_LINES);
                truncatedDescLines.push('[...]');
                this.description = truncatedDescLines.join('\n');
            }
            else {
                this.description = this.setting.description.join('\n');
            }
        }
        initSettingValueType() {
            if (isExtensionToggleSetting(this.setting, this.productService)) {
                this.valueType = preferences_2.SettingValueType.ExtensionToggle;
            }
            else if (this.setting.enum && (!this.setting.type || settingTypeEnumRenderable(this.setting.type))) {
                this.valueType = preferences_2.SettingValueType.Enum;
            }
            else if (this.setting.type === 'string') {
                if (this.setting.editPresentation === configurationRegistry_1.EditPresentationTypes.Multiline) {
                    this.valueType = preferences_2.SettingValueType.MultilineString;
                }
                else {
                    this.valueType = preferences_2.SettingValueType.String;
                }
            }
            else if (isExcludeSetting(this.setting)) {
                this.valueType = preferences_2.SettingValueType.Exclude;
            }
            else if (isIncludeSetting(this.setting)) {
                this.valueType = preferences_2.SettingValueType.Include;
            }
            else if (this.setting.type === 'integer') {
                this.valueType = preferences_2.SettingValueType.Integer;
            }
            else if (this.setting.type === 'number') {
                this.valueType = preferences_2.SettingValueType.Number;
            }
            else if (this.setting.type === 'boolean') {
                this.valueType = preferences_2.SettingValueType.Boolean;
            }
            else if (this.setting.type === 'array' && this.setting.arrayItemType &&
                ['string', 'enum', 'number', 'integer'].includes(this.setting.arrayItemType)) {
                this.valueType = preferences_2.SettingValueType.Array;
            }
            else if (Array.isArray(this.setting.type) && this.setting.type.includes(preferences_2.SettingValueType.Null) && this.setting.type.length === 2) {
                if (this.setting.type.includes(preferences_2.SettingValueType.Integer)) {
                    this.valueType = preferences_2.SettingValueType.NullableInteger;
                }
                else if (this.setting.type.includes(preferences_2.SettingValueType.Number)) {
                    this.valueType = preferences_2.SettingValueType.NullableNumber;
                }
                else {
                    this.valueType = preferences_2.SettingValueType.Complex;
                }
            }
            else if (isObjectSetting(this.setting)) {
                if (this.setting.allKeysAreBoolean) {
                    this.valueType = preferences_2.SettingValueType.BooleanObject;
                }
                else {
                    this.valueType = preferences_2.SettingValueType.Object;
                }
            }
            else if (this.setting.isLanguageTagSetting) {
                this.valueType = preferences_2.SettingValueType.LanguageTag;
            }
            else {
                this.valueType = preferences_2.SettingValueType.Complex;
            }
        }
        inspectSelf() {
            const targetToInspect = this.getTargetToInspect(this.setting);
            const inspectResult = inspectSetting(this.setting.key, targetToInspect, this.languageFilter, this.configurationService);
            this.update(inspectResult, this.isWorkspaceTrusted);
        }
        getTargetToInspect(setting) {
            if (!this.userDataProfileService.currentProfile.isDefault && !this.userDataProfileService.currentProfile.useDefaultFlags?.settings) {
                if (setting.scope === 1 /* ConfigurationScope.APPLICATION */) {
                    return 1 /* ConfigurationTarget.APPLICATION */;
                }
                if (this.configurationService.isSettingAppliedForAllProfiles(setting.key) && this.settingsTarget === 3 /* ConfigurationTarget.USER_LOCAL */) {
                    return 1 /* ConfigurationTarget.APPLICATION */;
                }
            }
            return this.settingsTarget;
        }
        update(inspectResult, isWorkspaceTrusted) {
            let { isConfigured, inspected, targetSelector, inspectedLanguageOverrides, languageSelector } = inspectResult;
            switch (targetSelector) {
                case 'workspaceFolderValue':
                case 'workspaceValue':
                    this.isUntrusted = !!this.setting.restricted && !isWorkspaceTrusted;
                    break;
            }
            let displayValue = isConfigured ? inspected[targetSelector] : inspected.defaultValue;
            const overriddenScopeList = [];
            const overriddenDefaultsLanguageList = [];
            if ((languageSelector || targetSelector !== 'workspaceValue') && typeof inspected.workspaceValue !== 'undefined') {
                overriddenScopeList.push('workspace:');
            }
            if ((languageSelector || targetSelector !== 'userRemoteValue') && typeof inspected.userRemoteValue !== 'undefined') {
                overriddenScopeList.push('remote:');
            }
            if ((languageSelector || targetSelector !== 'userLocalValue') && typeof inspected.userLocalValue !== 'undefined') {
                overriddenScopeList.push('user:');
            }
            if (inspected.overrideIdentifiers) {
                for (const overrideIdentifier of inspected.overrideIdentifiers) {
                    const inspectedOverride = inspectedLanguageOverrides.get(overrideIdentifier);
                    if (inspectedOverride) {
                        if (this.languageService.isRegisteredLanguageId(overrideIdentifier)) {
                            if (languageSelector !== overrideIdentifier && typeof inspectedOverride.default?.override !== 'undefined') {
                                overriddenDefaultsLanguageList.push(overrideIdentifier);
                            }
                            if ((languageSelector !== overrideIdentifier || targetSelector !== 'workspaceValue') && typeof inspectedOverride.workspace?.override !== 'undefined') {
                                overriddenScopeList.push(`workspace:${overrideIdentifier}`);
                            }
                            if ((languageSelector !== overrideIdentifier || targetSelector !== 'userRemoteValue') && typeof inspectedOverride.userRemote?.override !== 'undefined') {
                                overriddenScopeList.push(`remote:${overrideIdentifier}`);
                            }
                            if ((languageSelector !== overrideIdentifier || targetSelector !== 'userLocalValue') && typeof inspectedOverride.userLocal?.override !== 'undefined') {
                                overriddenScopeList.push(`user:${overrideIdentifier}`);
                            }
                        }
                        this.languageOverrideValues.set(overrideIdentifier, inspectedOverride);
                    }
                }
            }
            this.overriddenScopeList = overriddenScopeList;
            this.overriddenDefaultsLanguageList = overriddenDefaultsLanguageList;
            // The user might have added, removed, or modified a language filter,
            // so we reset the default value source to the non-language-specific default value source for now.
            this.defaultValueSource = this.setting.nonLanguageSpecificDefaultValueSource;
            if (inspected.policyValue) {
                this.hasPolicyValue = true;
                isConfigured = false; // The user did not manually configure the setting themselves.
                displayValue = inspected.policyValue;
                this.scopeValue = inspected.policyValue;
                this.defaultValue = inspected.defaultValue;
            }
            else if (languageSelector && this.languageOverrideValues.has(languageSelector)) {
                const overrideValues = this.languageOverrideValues.get(languageSelector);
                // In the worst case, go back to using the previous display value.
                // Also, sometimes the override is in the form of a default value override, so consider that second.
                displayValue = (isConfigured ? overrideValues[targetSelector] : overrideValues.defaultValue) ?? displayValue;
                this.scopeValue = isConfigured && overrideValues[targetSelector];
                this.defaultValue = overrideValues.defaultValue ?? inspected.defaultValue;
                const registryValues = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationDefaultsOverrides();
                const overrideValueSource = registryValues.get(`[${languageSelector}]`)?.valuesSources?.get(this.setting.key);
                if (overrideValueSource) {
                    this.defaultValueSource = overrideValueSource;
                }
            }
            else {
                this.scopeValue = isConfigured && inspected[targetSelector];
                this.defaultValue = inspected.defaultValue;
            }
            this.value = displayValue;
            this.isConfigured = isConfigured;
            if (isConfigured || this.setting.tags || this.tags || this.setting.restricted || this.hasPolicyValue) {
                // Don't create an empty Set for all 1000 settings, only if needed
                this.tags = new Set();
                if (isConfigured) {
                    this.tags.add(preferences_1.MODIFIED_SETTING_TAG);
                }
                this.setting.tags?.forEach(tag => this.tags.add(tag));
                if (this.setting.restricted) {
                    this.tags.add(preferences_1.REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG);
                }
                if (this.hasPolicyValue) {
                    this.tags.add(preferences_1.POLICY_SETTING_TAG);
                }
            }
        }
        matchesAllTags(tagFilters) {
            if (!tagFilters?.size) {
                // This setting, which may have tags,
                // matches against a query with no tags.
                return true;
            }
            if (!this.tags) {
                // The setting must inspect itself to get tag information
                // including for the hasPolicy tag.
                this.inspectSelf();
            }
            // Check that the filter tags are a subset of this setting's tags
            return !!this.tags?.size &&
                Array.from(tagFilters).every(tag => this.tags.has(tag));
        }
        matchesScope(scope, isRemote) {
            const configTarget = uri_1.URI.isUri(scope) ? 6 /* ConfigurationTarget.WORKSPACE_FOLDER */ : scope;
            if (!this.setting.scope) {
                return true;
            }
            if (configTarget === 1 /* ConfigurationTarget.APPLICATION */) {
                return configuration_1.APPLICATION_SCOPES.includes(this.setting.scope);
            }
            if (configTarget === 6 /* ConfigurationTarget.WORKSPACE_FOLDER */) {
                return configuration_1.FOLDER_SCOPES.includes(this.setting.scope);
            }
            if (configTarget === 5 /* ConfigurationTarget.WORKSPACE */) {
                return configuration_1.WORKSPACE_SCOPES.includes(this.setting.scope);
            }
            if (configTarget === 4 /* ConfigurationTarget.USER_REMOTE */) {
                return configuration_1.REMOTE_MACHINE_SCOPES.includes(this.setting.scope);
            }
            if (configTarget === 3 /* ConfigurationTarget.USER_LOCAL */) {
                if (isRemote) {
                    return configuration_1.LOCAL_MACHINE_SCOPES.includes(this.setting.scope);
                }
            }
            return true;
        }
        matchesAnyExtension(extensionFilters) {
            if (!extensionFilters || !extensionFilters.size) {
                return true;
            }
            if (!this.setting.extensionInfo) {
                return false;
            }
            return Array.from(extensionFilters).some(extensionId => extensionId.toLowerCase() === this.setting.extensionInfo.id.toLowerCase());
        }
        matchesAnyFeature(featureFilters) {
            if (!featureFilters || !featureFilters.size) {
                return true;
            }
            const features = settingsLayout_1.tocData.children.find(child => child.id === 'features');
            return Array.from(featureFilters).some(filter => {
                if (features && features.children) {
                    const feature = features.children.find(feature => 'features/' + filter === feature.id);
                    if (feature) {
                        const patterns = feature.settings?.map(setting => createSettingMatchRegExp(setting));
                        return patterns && !this.setting.extensionInfo && patterns.some(pattern => pattern.test(this.setting.key.toLowerCase()));
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return false;
                }
            });
        }
        matchesAnyId(idFilters) {
            if (!idFilters || !idFilters.size) {
                return true;
            }
            return idFilters.has(this.setting.key);
        }
        matchesAllLanguages(languageFilter) {
            if (!languageFilter) {
                // We're not filtering by language.
                return true;
            }
            if (!this.languageService.isRegisteredLanguageId(languageFilter)) {
                // We're trying to filter by an invalid language.
                return false;
            }
            // We have a language filter in the search widget at this point.
            // We decide to show all language overridable settings to make the
            // lang filter act more like a scope filter,
            // rather than adding on an implicit @modified as well.
            if (this.setting.scope === 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */) {
                return true;
            }
            return false;
        }
    }
    exports.SettingsTreeSettingElement = SettingsTreeSettingElement;
    function createSettingMatchRegExp(pattern) {
        pattern = (0, strings_1.escapeRegExpCharacters)(pattern)
            .replace(/\\\*/g, '.*');
        return new RegExp(`^${pattern}$`, 'i');
    }
    let SettingsTreeModel = class SettingsTreeModel {
        constructor(_viewState, _isWorkspaceTrusted, _configurationService, _languageService, _userDataProfileService, _productService) {
            this._viewState = _viewState;
            this._isWorkspaceTrusted = _isWorkspaceTrusted;
            this._configurationService = _configurationService;
            this._languageService = _languageService;
            this._userDataProfileService = _userDataProfileService;
            this._productService = _productService;
            this._treeElementsBySettingName = new Map();
        }
        get root() {
            return this._root;
        }
        update(newTocRoot = this._tocRoot) {
            this._treeElementsBySettingName.clear();
            const newRoot = this.createSettingsTreeGroupElement(newTocRoot);
            if (newRoot.children[0] instanceof SettingsTreeGroupElement) {
                newRoot.children[0].isFirstGroup = true;
            }
            if (this._root) {
                this.disposeChildren(this._root.children);
                this._root.children = newRoot.children;
            }
            else {
                this._root = newRoot;
            }
        }
        updateWorkspaceTrust(workspaceTrusted) {
            this._isWorkspaceTrusted = workspaceTrusted;
            this.updateRequireTrustedTargetElements();
        }
        disposeChildren(children) {
            for (const child of children) {
                this.recursiveDispose(child);
            }
        }
        recursiveDispose(element) {
            if (element instanceof SettingsTreeGroupElement) {
                this.disposeChildren(element.children);
            }
            element.dispose();
        }
        getElementsByName(name) {
            return this._treeElementsBySettingName.get(name) ?? null;
        }
        updateElementsByName(name) {
            if (!this._treeElementsBySettingName.has(name)) {
                return;
            }
            this.reinspectSettings(this._treeElementsBySettingName.get(name));
        }
        updateRequireTrustedTargetElements() {
            this.reinspectSettings([...this._treeElementsBySettingName.values()].flat().filter(s => s.isUntrusted));
        }
        reinspectSettings(settings) {
            for (const element of settings) {
                element.inspectSelf();
            }
        }
        createSettingsTreeGroupElement(tocEntry, parent) {
            const depth = parent ? this.getDepth(parent) + 1 : 0;
            const element = new SettingsTreeGroupElement(tocEntry.id, undefined, tocEntry.label, depth, false);
            element.parent = parent;
            const children = [];
            if (tocEntry.settings) {
                const settingChildren = tocEntry.settings.map(s => this.createSettingsTreeSettingElement(s, element))
                    .filter(el => el.setting.deprecationMessage ? el.isConfigured : true);
                children.push(...settingChildren);
            }
            if (tocEntry.children) {
                const groupChildren = tocEntry.children.map(child => this.createSettingsTreeGroupElement(child, element));
                children.push(...groupChildren);
            }
            element.children = children;
            return element;
        }
        getDepth(element) {
            if (element.parent) {
                return 1 + this.getDepth(element.parent);
            }
            else {
                return 0;
            }
        }
        createSettingsTreeSettingElement(setting, parent) {
            const element = new SettingsTreeSettingElement(setting, parent, this._viewState.settingsTarget, this._isWorkspaceTrusted, this._viewState.languageFilter, this._languageService, this._productService, this._userDataProfileService, this._configurationService);
            const nameElements = this._treeElementsBySettingName.get(setting.key) || [];
            nameElements.push(element);
            this._treeElementsBySettingName.set(setting.key, nameElements);
            return element;
        }
    };
    exports.SettingsTreeModel = SettingsTreeModel;
    exports.SettingsTreeModel = SettingsTreeModel = __decorate([
        __param(2, configuration_1.IWorkbenchConfigurationService),
        __param(3, language_1.ILanguageService),
        __param(4, userDataProfile_1.IUserDataProfileService),
        __param(5, productService_1.IProductService)
    ], SettingsTreeModel);
    function inspectSetting(key, target, languageFilter, configurationService) {
        const inspectOverrides = uri_1.URI.isUri(target) ? { resource: target } : undefined;
        const inspected = configurationService.inspect(key, inspectOverrides);
        const targetSelector = target === 1 /* ConfigurationTarget.APPLICATION */ ? 'applicationValue' :
            target === 3 /* ConfigurationTarget.USER_LOCAL */ ? 'userLocalValue' :
                target === 4 /* ConfigurationTarget.USER_REMOTE */ ? 'userRemoteValue' :
                    target === 5 /* ConfigurationTarget.WORKSPACE */ ? 'workspaceValue' :
                        'workspaceFolderValue';
        const targetOverrideSelector = target === 1 /* ConfigurationTarget.APPLICATION */ ? 'application' :
            target === 3 /* ConfigurationTarget.USER_LOCAL */ ? 'userLocal' :
                target === 4 /* ConfigurationTarget.USER_REMOTE */ ? 'userRemote' :
                    target === 5 /* ConfigurationTarget.WORKSPACE */ ? 'workspace' :
                        'workspaceFolder';
        let isConfigured = typeof inspected[targetSelector] !== 'undefined';
        const overrideIdentifiers = inspected.overrideIdentifiers;
        const inspectedLanguageOverrides = new Map();
        // We must reset isConfigured to be false if languageFilter is set, and manually
        // determine whether it can be set to true later.
        if (languageFilter) {
            isConfigured = false;
        }
        if (overrideIdentifiers) {
            // The setting we're looking at has language overrides.
            for (const overrideIdentifier of overrideIdentifiers) {
                inspectedLanguageOverrides.set(overrideIdentifier, configurationService.inspect(key, { overrideIdentifier }));
            }
            // For all language filters, see if there's an override for that filter.
            if (languageFilter) {
                if (inspectedLanguageOverrides.has(languageFilter)) {
                    const overrideValue = inspectedLanguageOverrides.get(languageFilter)[targetOverrideSelector]?.override;
                    if (typeof overrideValue !== 'undefined') {
                        isConfigured = true;
                    }
                }
            }
        }
        return { isConfigured, inspected, targetSelector, inspectedLanguageOverrides, languageSelector: languageFilter };
    }
    exports.inspectSetting = inspectSetting;
    function sanitizeId(id) {
        return id.replace(/[\.\/]/, '_');
    }
    function settingKeyToDisplayFormat(key, groupId = '', isLanguageTagSetting = false) {
        const lastDotIdx = key.lastIndexOf('.');
        let category = '';
        if (lastDotIdx >= 0) {
            category = key.substring(0, lastDotIdx);
            key = key.substring(lastDotIdx + 1);
        }
        groupId = groupId.replace(/\//g, '.');
        category = trimCategoryForGroup(category, groupId);
        category = wordifyKey(category);
        if (isLanguageTagSetting) {
            key = key.replace(/[\[\]]/g, '');
            key = '$(bracket) ' + key;
        }
        const label = wordifyKey(key);
        return { category, label };
    }
    exports.settingKeyToDisplayFormat = settingKeyToDisplayFormat;
    function wordifyKey(key) {
        key = key
            .replace(/\.([a-z0-9])/g, (_, p1) => ` \u203A ${p1.toUpperCase()}`) // Replace dot with spaced '>'
            .replace(/([a-z0-9])([A-Z])/g, '$1 $2') // Camel case to spacing, fooBar => foo Bar
            .replace(/^[a-z]/g, match => match.toUpperCase()) // Upper casing all first letters, foo => Foo
            .replace(/\b\w+\b/g, match => {
            return settingsLayout_1.knownAcronyms.has(match.toLowerCase()) ?
                match.toUpperCase() :
                match;
        });
        for (const [k, v] of settingsLayout_1.knownTermMappings) {
            key = key.replace(new RegExp(`\\b${k}\\b`, 'gi'), v);
        }
        return key;
    }
    /**
     * Removes redundant sections of the category label.
     * A redundant section is a section already reflected in the groupId.
     *
     * @param category The category of the specific setting.
     * @param groupId The author + extension ID.
     * @returns The new category label to use.
     */
    function trimCategoryForGroup(category, groupId) {
        const doTrim = (forward) => {
            // Remove the Insiders portion if the category doesn't use it.
            if (!/insiders$/i.test(category)) {
                groupId = groupId.replace(/-?insiders$/i, '');
            }
            const parts = groupId.split('.')
                .map(part => {
                // Remove hyphens, but only if that results in a match with the category.
                if (part.replace(/-/g, '').toLowerCase() === category.toLowerCase()) {
                    return part.replace(/-/g, '');
                }
                else {
                    return part;
                }
            });
            while (parts.length) {
                const reg = new RegExp(`^${parts.join('\\.')}(\\.|$)`, 'i');
                if (reg.test(category)) {
                    return category.replace(reg, '');
                }
                if (forward) {
                    parts.pop();
                }
                else {
                    parts.shift();
                }
            }
            return null;
        };
        let trimmed = doTrim(true);
        if (trimmed === null) {
            trimmed = doTrim(false);
        }
        if (trimmed === null) {
            trimmed = category;
        }
        return trimmed;
    }
    function isExtensionToggleSetting(setting, productService) {
        return preferences_1.ENABLE_EXTENSION_TOGGLE_SETTINGS &&
            !!productService.extensionRecommendations &&
            !!setting.displayExtensionId;
    }
    function isExcludeSetting(setting) {
        return setting.key === 'files.exclude' ||
            setting.key === 'search.exclude' ||
            setting.key === 'workbench.localHistory.exclude' ||
            setting.key === 'explorer.autoRevealExclude' ||
            setting.key === 'files.readonlyExclude' ||
            setting.key === 'files.watcherExclude';
    }
    function isIncludeSetting(setting) {
        return setting.key === 'files.readonlyInclude';
    }
    function isObjectRenderableSchema({ type }) {
        return type === 'string' || type === 'boolean' || type === 'integer' || type === 'number';
    }
    function isObjectSetting({ type, objectProperties, objectPatternProperties, objectAdditionalProperties }) {
        if (type !== 'object') {
            return false;
        }
        // object can have any shape
        if ((0, types_1.isUndefinedOrNull)(objectProperties) &&
            (0, types_1.isUndefinedOrNull)(objectPatternProperties) &&
            (0, types_1.isUndefinedOrNull)(objectAdditionalProperties)) {
            return false;
        }
        // objectAdditionalProperties allow the setting to have any shape,
        // but if there's a pattern property that handles everything, then every
        // property will match that patternProperty, so we don't need to look at
        // the value of objectAdditionalProperties in that case.
        if ((objectAdditionalProperties === true || objectAdditionalProperties === undefined)
            && !Object.keys(objectPatternProperties ?? {}).includes('.*')) {
            return false;
        }
        const schemas = [...Object.values(objectProperties ?? {}), ...Object.values(objectPatternProperties ?? {})];
        if (objectAdditionalProperties && typeof objectAdditionalProperties === 'object') {
            schemas.push(objectAdditionalProperties);
        }
        // Flatten anyof schemas
        const flatSchemas = schemas.map((schema) => {
            if (Array.isArray(schema.anyOf)) {
                return schema.anyOf;
            }
            return [schema];
        }).flat();
        return flatSchemas.every(isObjectRenderableSchema);
    }
    function settingTypeEnumRenderable(_type) {
        const enumRenderableSettingTypes = ['string', 'boolean', 'null', 'integer', 'number'];
        const type = Array.isArray(_type) ? _type : [_type];
        return type.every(type => enumRenderableSettingTypes.includes(type));
    }
    var SearchResultIdx;
    (function (SearchResultIdx) {
        SearchResultIdx[SearchResultIdx["Local"] = 0] = "Local";
        SearchResultIdx[SearchResultIdx["Remote"] = 1] = "Remote";
        SearchResultIdx[SearchResultIdx["NewExtensions"] = 2] = "NewExtensions";
    })(SearchResultIdx || (exports.SearchResultIdx = SearchResultIdx = {}));
    let SearchResultModel = class SearchResultModel extends SettingsTreeModel {
        constructor(viewState, isWorkspaceTrusted, configurationService, environmentService, languageService, userDataProfileService, productService) {
            super(viewState, isWorkspaceTrusted, configurationService, languageService, userDataProfileService, productService);
            this.environmentService = environmentService;
            this.rawSearchResults = null;
            this.cachedUniqueSearchResults = null;
            this.newExtensionSearchResults = null;
            this.searchResultCount = null;
            this.id = 'searchResultModel';
            this.update({ id: 'searchResultModel', label: '' });
        }
        compareTwoNullableNumbers(a, b) {
            const aOrMax = a ?? Number.MAX_SAFE_INTEGER;
            const bOrMax = b ?? Number.MAX_SAFE_INTEGER;
            if (aOrMax < bOrMax) {
                return -1;
            }
            else if (aOrMax > bOrMax) {
                return 1;
            }
            else {
                return 0;
            }
        }
        sortResults(filterMatches) {
            filterMatches.sort((a, b) => {
                if (a.matchType !== b.matchType) {
                    // Sort by match type if the match types are not the same.
                    // The priority of the match type is given by the SettingMatchType enum.
                    return b.matchType - a.matchType;
                }
                else if (a.matchType === preferences_2.SettingMatchType.RemoteMatch) {
                    // The match types are the same and are RemoteMatch.
                    // Sort by score.
                    return b.score - a.score;
                }
                else {
                    // The match types are the same.
                    if (a.setting.extensionInfo && b.setting.extensionInfo
                        && a.setting.extensionInfo.id === b.setting.extensionInfo.id) {
                        // These settings belong to the same extension.
                        if (a.setting.categoryLabel !== b.setting.categoryLabel
                            && (a.setting.categoryOrder !== undefined || b.setting.categoryOrder !== undefined)
                            && a.setting.categoryOrder !== b.setting.categoryOrder) {
                            // These two settings don't belong to the same category and have different category orders.
                            return this.compareTwoNullableNumbers(a.setting.categoryOrder, b.setting.categoryOrder);
                        }
                        else if (a.setting.categoryLabel === b.setting.categoryLabel
                            && (a.setting.order !== undefined || b.setting.order !== undefined)
                            && a.setting.order !== b.setting.order) {
                            // These two settings belong to the same category, but have different orders.
                            return this.compareTwoNullableNumbers(a.setting.order, b.setting.order);
                        }
                    }
                    // In the worst case, go back to lexicographical order.
                    return b.score - a.score;
                }
            });
            return filterMatches;
        }
        getUniqueResults() {
            if (this.cachedUniqueSearchResults) {
                return this.cachedUniqueSearchResults;
            }
            if (!this.rawSearchResults) {
                return null;
            }
            let combinedFilterMatches = [];
            const localMatchKeys = new Set();
            const localResult = this.rawSearchResults[0 /* SearchResultIdx.Local */];
            if (localResult) {
                localResult.filterMatches.forEach(m => localMatchKeys.add(m.setting.key));
                combinedFilterMatches = localResult.filterMatches;
            }
            const remoteResult = this.rawSearchResults[1 /* SearchResultIdx.Remote */];
            if (remoteResult) {
                remoteResult.filterMatches = remoteResult.filterMatches.filter(m => !localMatchKeys.has(m.setting.key));
                combinedFilterMatches = combinedFilterMatches.concat(remoteResult.filterMatches);
                this.newExtensionSearchResults = this.rawSearchResults[2 /* SearchResultIdx.NewExtensions */];
            }
            // Combine and sort results.
            combinedFilterMatches = this.sortResults(combinedFilterMatches);
            this.cachedUniqueSearchResults = {
                filterMatches: combinedFilterMatches,
                exactMatch: localResult?.exactMatch || remoteResult?.exactMatch
            };
            return this.cachedUniqueSearchResults;
        }
        getRawResults() {
            return this.rawSearchResults || [];
        }
        setResult(order, result) {
            this.cachedUniqueSearchResults = null;
            this.newExtensionSearchResults = null;
            this.rawSearchResults = this.rawSearchResults || [];
            if (!result) {
                delete this.rawSearchResults[order];
                return;
            }
            if (result.exactMatch) {
                this.rawSearchResults = [];
            }
            this.rawSearchResults[order] = result;
            this.updateChildren();
        }
        updateChildren() {
            this.update({
                id: 'searchResultModel',
                label: 'searchResultModel',
                settings: this.getFlatSettings()
            });
            // Save time, filter children in the search model instead of relying on the tree filter, which still requires heights to be calculated.
            const isRemote = !!this.environmentService.remoteAuthority;
            this.root.children = this.root.children
                .filter(child => child instanceof SettingsTreeSettingElement && child.matchesAllTags(this._viewState.tagFilters) && child.matchesScope(this._viewState.settingsTarget, isRemote) && child.matchesAnyExtension(this._viewState.extensionFilters) && child.matchesAnyId(this._viewState.idFilters) && child.matchesAnyFeature(this._viewState.featureFilters) && child.matchesAllLanguages(this._viewState.languageFilter));
            this.searchResultCount = this.root.children.length;
            if (this.newExtensionSearchResults?.filterMatches.length) {
                let resultExtensionIds = this.newExtensionSearchResults.filterMatches
                    .map(result => result.setting)
                    .filter(setting => setting.extensionName && setting.extensionPublisher)
                    .map(setting => `${setting.extensionPublisher}.${setting.extensionName}`);
                resultExtensionIds = arrays.distinct(resultExtensionIds);
                if (resultExtensionIds.length) {
                    const newExtElement = new SettingsTreeNewExtensionsElement('newExtensions', resultExtensionIds);
                    newExtElement.parent = this._root;
                    this._root.children.push(newExtElement);
                }
            }
        }
        getUniqueResultsCount() {
            return this.searchResultCount ?? 0;
        }
        getFlatSettings() {
            return this.getUniqueResults()?.filterMatches.map(m => m.setting) ?? [];
        }
    };
    exports.SearchResultModel = SearchResultModel;
    exports.SearchResultModel = SearchResultModel = __decorate([
        __param(2, configuration_1.IWorkbenchConfigurationService),
        __param(3, environmentService_1.IWorkbenchEnvironmentService),
        __param(4, language_1.ILanguageService),
        __param(5, userDataProfile_1.IUserDataProfileService),
        __param(6, productService_1.IProductService)
    ], SearchResultModel);
    const tagRegex = /(^|\s)@tag:("([^"]*)"|[^"]\S*)/g;
    const extensionRegex = /(^|\s)@ext:("([^"]*)"|[^"]\S*)?/g;
    const featureRegex = /(^|\s)@feature:("([^"]*)"|[^"]\S*)?/g;
    const idRegex = /(^|\s)@id:("([^"]*)"|[^"]\S*)?/g;
    const languageRegex = /(^|\s)@lang:("([^"]*)"|[^"]\S*)?/g;
    function parseQuery(query) {
        /**
         * A helper function to parse the query on one type of regex.
         *
         * @param query The search query
         * @param filterRegex The regex to use on the query
         * @param parsedParts The parts that the regex parses out will be appended to the array passed in here.
         * @returns The query with the parsed parts removed
         */
        function getTagsForType(query, filterRegex, parsedParts) {
            return query.replace(filterRegex, (_, __, quotedParsedElement, unquotedParsedElement) => {
                const parsedElement = unquotedParsedElement || quotedParsedElement;
                if (parsedElement) {
                    parsedParts.push(...parsedElement.split(',').map(s => s.trim()).filter(s => !(0, strings_1.isFalsyOrWhitespace)(s)));
                }
                return '';
            });
        }
        const tags = [];
        query = query.replace(tagRegex, (_, __, quotedTag, tag) => {
            tags.push(tag || quotedTag);
            return '';
        });
        query = query.replace(`@${preferences_1.MODIFIED_SETTING_TAG}`, () => {
            tags.push(preferences_1.MODIFIED_SETTING_TAG);
            return '';
        });
        query = query.replace(`@${preferences_1.POLICY_SETTING_TAG}`, () => {
            tags.push(preferences_1.POLICY_SETTING_TAG);
            return '';
        });
        const extensions = [];
        const features = [];
        const ids = [];
        const langs = [];
        query = getTagsForType(query, extensionRegex, extensions);
        query = getTagsForType(query, featureRegex, features);
        query = getTagsForType(query, idRegex, ids);
        if (preferences_1.ENABLE_LANGUAGE_FILTER) {
            query = getTagsForType(query, languageRegex, langs);
        }
        query = query.trim();
        // For now, only return the first found language filter
        return {
            tags,
            extensionFilters: extensions,
            featureFilters: features,
            idFilters: ids,
            languageFilter: langs.length ? langs[0] : undefined,
            query,
        };
    }
    exports.parseQuery = parseQuery;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3NUcmVlTW9kZWxzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvcHJlZmVyZW5jZXMvYnJvd3Nlci9zZXR0aW5nc1RyZWVNb2RlbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBc0JuRixRQUFBLDJCQUEyQixHQUFHLG9CQUFvQixDQUFDO0lBYWhFLE1BQXNCLG1CQUFvQixTQUFRLHNCQUFVO1FBUTNELFlBQVksR0FBVztZQUN0QixLQUFLLEVBQUUsQ0FBQztZQUxELGNBQVMsR0FBRyxLQUFLLENBQUM7WUFDUCx5QkFBb0IsR0FBRyxJQUFJLGVBQU8sRUFBUSxDQUFDO1lBQ3JELHdCQUFtQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUM7WUFJOUQsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUM7UUFDZixDQUFDO1FBRUQsSUFBSSxRQUFRO1lBQ1gsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ3ZCLENBQUM7UUFFRCxJQUFJLFFBQVEsQ0FBQyxLQUFjO1lBQzFCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNsQyxDQUFDO0tBQ0Q7SUFyQkQsa0RBcUJDO0lBSUQsTUFBYSx3QkFBeUIsU0FBUSxtQkFBbUI7UUFTaEUsSUFBSSxRQUFRO1lBQ1gsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ3ZCLENBQUM7UUFFRCxJQUFJLFFBQVEsQ0FBQyxXQUFxQztZQUNqRCxJQUFJLENBQUMsU0FBUyxHQUFHLFdBQVcsQ0FBQztZQUU3QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNuQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDOUIsSUFBSSxLQUFLLFlBQVksMEJBQTBCLEVBQUU7b0JBQ2hELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDOUM7WUFDRixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxZQUFZLEdBQVcsRUFBRSxLQUF5QixFQUFFLEtBQWEsRUFBRSxLQUFhLEVBQUUsWUFBcUI7WUFDdEcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBbkJKLHNCQUFpQixHQUFnQixJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQzNDLGNBQVMsR0FBNkIsRUFBRSxDQUFDO1lBb0JoRCxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNuQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNuQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNuQixJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztRQUNsQyxDQUFDO1FBRUQ7O1dBRUc7UUFDSCxlQUFlLENBQUMsR0FBVztZQUMxQixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDeEMsQ0FBQztLQUNEO0lBdkNELDREQXVDQztJQUVELE1BQWEsZ0NBQWlDLFNBQVEsbUJBQW1CO1FBQ3hFLFlBQVksR0FBVyxFQUFrQixZQUFzQjtZQUM5RCxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFENkIsaUJBQVksR0FBWixZQUFZLENBQVU7UUFFL0QsQ0FBQztLQUNEO0lBSkQsNEVBSUM7SUFFRCxNQUFhLDBCQUEyQixTQUFRLG1CQUFtQjtpQkFDMUMsbUJBQWMsR0FBRyxFQUFFLEFBQUwsQ0FBTTtRQXVENUMsWUFDQyxPQUFpQixFQUNqQixNQUFnQyxFQUN2QixjQUE4QixFQUN0QixrQkFBMkIsRUFDM0IsY0FBa0MsRUFDbEMsZUFBaUMsRUFDakMsY0FBK0IsRUFDL0Isc0JBQStDLEVBQy9DLG9CQUFvRDtZQUVyRSxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBUnhDLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtZQUN0Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQVM7WUFDM0IsbUJBQWMsR0FBZCxjQUFjLENBQW9CO1lBQ2xDLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQUNqQyxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDL0IsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF5QjtZQUMvQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQWdDO1lBNUQ5RCxxQkFBZ0IsR0FBa0IsSUFBSSxDQUFDO1lBQ3ZDLGtCQUFhLEdBQWtCLElBQUksQ0FBQztZQXVCNUM7O2VBRUc7WUFDSCxpQkFBWSxHQUFHLEtBQUssQ0FBQztZQUVyQjs7ZUFFRztZQUNILGdCQUFXLEdBQUcsS0FBSyxDQUFDO1lBRXBCOztlQUVHO1lBQ0gsbUJBQWMsR0FBRyxLQUFLLENBQUM7WUFHdkIsd0JBQW1CLEdBQWEsRUFBRSxDQUFDO1lBQ25DLG1DQUE4QixHQUFhLEVBQUUsQ0FBQztZQUU5Qzs7ZUFFRztZQUNILDJCQUFzQixHQUE4QyxJQUFJLEdBQUcsRUFBd0MsQ0FBQztZQWlCbkgsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7WUFDdkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7WUFFckIsc0RBQXNEO1lBQ3RELElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1lBQzlCLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBQzdCLENBQUM7UUFFRCxJQUFJLGVBQWU7WUFDbEIsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDM0IsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2FBQ2xCO1lBRUQsT0FBTyxJQUFJLENBQUMsZ0JBQWlCLENBQUM7UUFDL0IsQ0FBQztRQUVELElBQUksWUFBWTtZQUNmLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFO2dCQUN4QixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7YUFDbEI7WUFFRCxPQUFPLElBQUksQ0FBQyxhQUFjLENBQUM7UUFDNUIsQ0FBQztRQUVPLFVBQVU7WUFDakIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRTtnQkFDdkIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztnQkFDeEMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztnQkFDM0IsT0FBTzthQUNQO1lBQ0QsTUFBTSxnQkFBZ0IsR0FBRyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDekgsSUFBSSxDQUFDLGFBQWEsR0FBRyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUM7WUFDNUMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDLFFBQVEsQ0FBQztRQUNuRCxDQUFDO1FBRU8sc0JBQXNCO1lBQzdCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLDBCQUEwQixDQUFDLGNBQWMsRUFBRTtnQkFDaEYsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLDBCQUEwQixDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUN4RyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ2pDLElBQUksQ0FBQyxXQUFXLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2pEO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3ZEO1FBQ0YsQ0FBQztRQUVPLG9CQUFvQjtZQUMzQixJQUFJLHdCQUF3QixDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFO2dCQUNoRSxJQUFJLENBQUMsU0FBUyxHQUFHLDhCQUFnQixDQUFDLGVBQWUsQ0FBQzthQUNsRDtpQkFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7Z0JBQ3JHLElBQUksQ0FBQyxTQUFTLEdBQUcsOEJBQWdCLENBQUMsSUFBSSxDQUFDO2FBQ3ZDO2lCQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO2dCQUMxQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEtBQUssNkNBQXFCLENBQUMsU0FBUyxFQUFFO29CQUN0RSxJQUFJLENBQUMsU0FBUyxHQUFHLDhCQUFnQixDQUFDLGVBQWUsQ0FBQztpQkFDbEQ7cUJBQU07b0JBQ04sSUFBSSxDQUFDLFNBQVMsR0FBRyw4QkFBZ0IsQ0FBQyxNQUFNLENBQUM7aUJBQ3pDO2FBQ0Q7aUJBQU0sSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQzFDLElBQUksQ0FBQyxTQUFTLEdBQUcsOEJBQWdCLENBQUMsT0FBTyxDQUFDO2FBQzFDO2lCQUFNLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUMxQyxJQUFJLENBQUMsU0FBUyxHQUFHLDhCQUFnQixDQUFDLE9BQU8sQ0FBQzthQUMxQztpQkFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtnQkFDM0MsSUFBSSxDQUFDLFNBQVMsR0FBRyw4QkFBZ0IsQ0FBQyxPQUFPLENBQUM7YUFDMUM7aUJBQU0sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7Z0JBQzFDLElBQUksQ0FBQyxTQUFTLEdBQUcsOEJBQWdCLENBQUMsTUFBTSxDQUFDO2FBQ3pDO2lCQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO2dCQUMzQyxJQUFJLENBQUMsU0FBUyxHQUFHLDhCQUFnQixDQUFDLE9BQU8sQ0FBQzthQUMxQztpQkFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWE7Z0JBQ3JFLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEVBQUU7Z0JBQzlFLElBQUksQ0FBQyxTQUFTLEdBQUcsOEJBQWdCLENBQUMsS0FBSyxDQUFDO2FBQ3hDO2lCQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyw4QkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNuSSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyw4QkFBZ0IsQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDekQsSUFBSSxDQUFDLFNBQVMsR0FBRyw4QkFBZ0IsQ0FBQyxlQUFlLENBQUM7aUJBQ2xEO3FCQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLDhCQUFnQixDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUMvRCxJQUFJLENBQUMsU0FBUyxHQUFHLDhCQUFnQixDQUFDLGNBQWMsQ0FBQztpQkFDakQ7cUJBQU07b0JBQ04sSUFBSSxDQUFDLFNBQVMsR0FBRyw4QkFBZ0IsQ0FBQyxPQUFPLENBQUM7aUJBQzFDO2FBQ0Q7aUJBQU0sSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUN6QyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUU7b0JBQ25DLElBQUksQ0FBQyxTQUFTLEdBQUcsOEJBQWdCLENBQUMsYUFBYSxDQUFDO2lCQUNoRDtxQkFBTTtvQkFDTixJQUFJLENBQUMsU0FBUyxHQUFHLDhCQUFnQixDQUFDLE1BQU0sQ0FBQztpQkFDekM7YUFDRDtpQkFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsb0JBQW9CLEVBQUU7Z0JBQzdDLElBQUksQ0FBQyxTQUFTLEdBQUcsOEJBQWdCLENBQUMsV0FBVyxDQUFDO2FBQzlDO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxTQUFTLEdBQUcsOEJBQWdCLENBQUMsT0FBTyxDQUFDO2FBQzFDO1FBQ0YsQ0FBQztRQUVELFdBQVc7WUFDVixNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzlELE1BQU0sYUFBYSxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxlQUFlLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUN4SCxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBRU8sa0JBQWtCLENBQUMsT0FBaUI7WUFDM0MsSUFBSSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxjQUFjLENBQUMsU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLGNBQWMsQ0FBQyxlQUFlLEVBQUUsUUFBUSxFQUFFO2dCQUNuSSxJQUFJLE9BQU8sQ0FBQyxLQUFLLDJDQUFtQyxFQUFFO29CQUNyRCwrQ0FBdUM7aUJBQ3ZDO2dCQUNELElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLDhCQUE4QixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsY0FBYywyQ0FBbUMsRUFBRTtvQkFDcEksK0NBQXVDO2lCQUN2QzthQUNEO1lBQ0QsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDO1FBQzVCLENBQUM7UUFFTyxNQUFNLENBQUMsYUFBNkIsRUFBRSxrQkFBMkI7WUFDeEUsSUFBSSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLDBCQUEwQixFQUFFLGdCQUFnQixFQUFFLEdBQUcsYUFBYSxDQUFDO1lBRTlHLFFBQVEsY0FBYyxFQUFFO2dCQUN2QixLQUFLLHNCQUFzQixDQUFDO2dCQUM1QixLQUFLLGdCQUFnQjtvQkFDcEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztvQkFDcEUsTUFBTTthQUNQO1lBRUQsSUFBSSxZQUFZLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUM7WUFDckYsTUFBTSxtQkFBbUIsR0FBYSxFQUFFLENBQUM7WUFDekMsTUFBTSw4QkFBOEIsR0FBYSxFQUFFLENBQUM7WUFDcEQsSUFBSSxDQUFDLGdCQUFnQixJQUFJLGNBQWMsS0FBSyxnQkFBZ0IsQ0FBQyxJQUFJLE9BQU8sU0FBUyxDQUFDLGNBQWMsS0FBSyxXQUFXLEVBQUU7Z0JBQ2pILG1CQUFtQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUN2QztZQUNELElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxjQUFjLEtBQUssaUJBQWlCLENBQUMsSUFBSSxPQUFPLFNBQVMsQ0FBQyxlQUFlLEtBQUssV0FBVyxFQUFFO2dCQUNuSCxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDcEM7WUFDRCxJQUFJLENBQUMsZ0JBQWdCLElBQUksY0FBYyxLQUFLLGdCQUFnQixDQUFDLElBQUksT0FBTyxTQUFTLENBQUMsY0FBYyxLQUFLLFdBQVcsRUFBRTtnQkFDakgsbUJBQW1CLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ2xDO1lBRUQsSUFBSSxTQUFTLENBQUMsbUJBQW1CLEVBQUU7Z0JBQ2xDLEtBQUssTUFBTSxrQkFBa0IsSUFBSSxTQUFTLENBQUMsbUJBQW1CLEVBQUU7b0JBQy9ELE1BQU0saUJBQWlCLEdBQUcsMEJBQTBCLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7b0JBQzdFLElBQUksaUJBQWlCLEVBQUU7d0JBQ3RCLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxzQkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFOzRCQUNwRSxJQUFJLGdCQUFnQixLQUFLLGtCQUFrQixJQUFJLE9BQU8saUJBQWlCLENBQUMsT0FBTyxFQUFFLFFBQVEsS0FBSyxXQUFXLEVBQUU7Z0NBQzFHLDhCQUE4QixDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDOzZCQUN4RDs0QkFDRCxJQUFJLENBQUMsZ0JBQWdCLEtBQUssa0JBQWtCLElBQUksY0FBYyxLQUFLLGdCQUFnQixDQUFDLElBQUksT0FBTyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsUUFBUSxLQUFLLFdBQVcsRUFBRTtnQ0FDckosbUJBQW1CLENBQUMsSUFBSSxDQUFDLGFBQWEsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDOzZCQUM1RDs0QkFDRCxJQUFJLENBQUMsZ0JBQWdCLEtBQUssa0JBQWtCLElBQUksY0FBYyxLQUFLLGlCQUFpQixDQUFDLElBQUksT0FBTyxpQkFBaUIsQ0FBQyxVQUFVLEVBQUUsUUFBUSxLQUFLLFdBQVcsRUFBRTtnQ0FDdkosbUJBQW1CLENBQUMsSUFBSSxDQUFDLFVBQVUsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDOzZCQUN6RDs0QkFDRCxJQUFJLENBQUMsZ0JBQWdCLEtBQUssa0JBQWtCLElBQUksY0FBYyxLQUFLLGdCQUFnQixDQUFDLElBQUksT0FBTyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsUUFBUSxLQUFLLFdBQVcsRUFBRTtnQ0FDckosbUJBQW1CLENBQUMsSUFBSSxDQUFDLFFBQVEsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDOzZCQUN2RDt5QkFDRDt3QkFDRCxJQUFJLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLGlCQUFpQixDQUFDLENBQUM7cUJBQ3ZFO2lCQUNEO2FBQ0Q7WUFDRCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsbUJBQW1CLENBQUM7WUFDL0MsSUFBSSxDQUFDLDhCQUE4QixHQUFHLDhCQUE4QixDQUFDO1lBRXJFLHFFQUFxRTtZQUNyRSxrR0FBa0c7WUFDbEcsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMscUNBQXFDLENBQUM7WUFFN0UsSUFBSSxTQUFTLENBQUMsV0FBVyxFQUFFO2dCQUMxQixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztnQkFDM0IsWUFBWSxHQUFHLEtBQUssQ0FBQyxDQUFDLDhEQUE4RDtnQkFDcEYsWUFBWSxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQztnQkFDeEMsSUFBSSxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDO2FBQzNDO2lCQUFNLElBQUksZ0JBQWdCLElBQUksSUFBSSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO2dCQUNqRixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFFLENBQUM7Z0JBQzFFLGtFQUFrRTtnQkFDbEUsb0dBQW9HO2dCQUNwRyxZQUFZLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxJQUFJLFlBQVksQ0FBQztnQkFDN0csSUFBSSxDQUFDLFVBQVUsR0FBRyxZQUFZLElBQUksY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUNqRSxJQUFJLENBQUMsWUFBWSxHQUFHLGNBQWMsQ0FBQyxZQUFZLElBQUksU0FBUyxDQUFDLFlBQVksQ0FBQztnQkFFMUUsTUFBTSxjQUFjLEdBQUcsbUJBQVEsQ0FBQyxFQUFFLENBQXlCLGtDQUFVLENBQUMsYUFBYSxDQUFDLENBQUMsaUNBQWlDLEVBQUUsQ0FBQztnQkFDekgsTUFBTSxtQkFBbUIsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksZ0JBQWdCLEdBQUcsQ0FBQyxFQUFFLGFBQWEsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDOUcsSUFBSSxtQkFBbUIsRUFBRTtvQkFDeEIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLG1CQUFtQixDQUFDO2lCQUM5QzthQUNEO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxVQUFVLEdBQUcsWUFBWSxJQUFJLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDNUQsSUFBSSxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDO2FBQzNDO1lBRUQsSUFBSSxDQUFDLEtBQUssR0FBRyxZQUFZLENBQUM7WUFDMUIsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7WUFDakMsSUFBSSxZQUFZLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO2dCQUNyRyxrRUFBa0U7Z0JBQ2xFLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztnQkFDOUIsSUFBSSxZQUFZLEVBQUU7b0JBQ2pCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGtDQUFvQixDQUFDLENBQUM7aUJBQ3BDO2dCQUVELElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBRXZELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUU7b0JBQzVCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLG1EQUFxQyxDQUFDLENBQUM7aUJBQ3JEO2dCQUVELElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtvQkFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsZ0NBQWtCLENBQUMsQ0FBQztpQkFDbEM7YUFDRDtRQUNGLENBQUM7UUFFRCxjQUFjLENBQUMsVUFBd0I7WUFDdEMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUU7Z0JBQ3RCLHFDQUFxQztnQkFDckMsd0NBQXdDO2dCQUN4QyxPQUFPLElBQUksQ0FBQzthQUNaO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ2YseURBQXlEO2dCQUN6RCxtQ0FBbUM7Z0JBQ25DLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzthQUNuQjtZQUVELGlFQUFpRTtZQUNqRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUk7Z0JBQ3ZCLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMzRCxDQUFDO1FBRUQsWUFBWSxDQUFDLEtBQXFCLEVBQUUsUUFBaUI7WUFDcEQsTUFBTSxZQUFZLEdBQUcsU0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLDhDQUFzQyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBRXJGLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRTtnQkFDeEIsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELElBQUksWUFBWSw0Q0FBb0MsRUFBRTtnQkFDckQsT0FBTyxrQ0FBa0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUN2RDtZQUVELElBQUksWUFBWSxpREFBeUMsRUFBRTtnQkFDMUQsT0FBTyw2QkFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ2xEO1lBRUQsSUFBSSxZQUFZLDBDQUFrQyxFQUFFO2dCQUNuRCxPQUFPLGdDQUFnQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3JEO1lBRUQsSUFBSSxZQUFZLDRDQUFvQyxFQUFFO2dCQUNyRCxPQUFPLHFDQUFxQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzFEO1lBRUQsSUFBSSxZQUFZLDJDQUFtQyxFQUFFO2dCQUNwRCxJQUFJLFFBQVEsRUFBRTtvQkFDYixPQUFPLG9DQUFvQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUN6RDthQUNEO1lBRUQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQsbUJBQW1CLENBQUMsZ0JBQThCO1lBQ2pELElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRTtnQkFDaEQsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRTtnQkFDaEMsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsS0FBSyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWMsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUNySSxDQUFDO1FBRUQsaUJBQWlCLENBQUMsY0FBNEI7WUFDN0MsSUFBSSxDQUFDLGNBQWMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUU7Z0JBQzVDLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxNQUFNLFFBQVEsR0FBRyx3QkFBTyxDQUFDLFFBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLFVBQVUsQ0FBQyxDQUFDO1lBRTFFLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQy9DLElBQUksUUFBUSxJQUFJLFFBQVEsQ0FBQyxRQUFRLEVBQUU7b0JBQ2xDLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsV0FBVyxHQUFHLE1BQU0sS0FBSyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3ZGLElBQUksT0FBTyxFQUFFO3dCQUNaLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsd0JBQXdCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzt3QkFDckYsT0FBTyxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7cUJBQ3pIO3lCQUFNO3dCQUNOLE9BQU8sS0FBSyxDQUFDO3FCQUNiO2lCQUNEO3FCQUFNO29CQUNOLE9BQU8sS0FBSyxDQUFDO2lCQUNiO1lBQ0YsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsWUFBWSxDQUFDLFNBQXVCO1lBQ25DLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFO2dCQUNsQyxPQUFPLElBQUksQ0FBQzthQUNaO1lBQ0QsT0FBTyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUVELG1CQUFtQixDQUFDLGNBQXVCO1lBQzFDLElBQUksQ0FBQyxjQUFjLEVBQUU7Z0JBQ3BCLG1DQUFtQztnQkFDbkMsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLHNCQUFzQixDQUFDLGNBQWMsQ0FBQyxFQUFFO2dCQUNqRSxpREFBaUQ7Z0JBQ2pELE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCxnRUFBZ0U7WUFDaEUsa0VBQWtFO1lBQ2xFLDRDQUE0QztZQUM1Qyx1REFBdUQ7WUFDdkQsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssb0RBQTRDLEVBQUU7Z0JBQ25FLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7O0lBaFlGLGdFQWlZQztJQUdELFNBQVMsd0JBQXdCLENBQUMsT0FBZTtRQUNoRCxPQUFPLEdBQUcsSUFBQSxnQ0FBc0IsRUFBQyxPQUFPLENBQUM7YUFDdkMsT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUV6QixPQUFPLElBQUksTUFBTSxDQUFDLElBQUksT0FBTyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVNLElBQU0saUJBQWlCLEdBQXZCLE1BQU0saUJBQWlCO1FBSzdCLFlBQ29CLFVBQW9DLEVBQy9DLG1CQUE0QixFQUNKLHFCQUFzRSxFQUNwRixnQkFBbUQsRUFDNUMsdUJBQWlFLEVBQ3pFLGVBQWlEO1lBTC9DLGVBQVUsR0FBVixVQUFVLENBQTBCO1lBQy9DLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBUztZQUNhLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBZ0M7WUFDbkUscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtZQUMzQiw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQXlCO1lBQ3hELG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtZQVJsRCwrQkFBMEIsR0FBRyxJQUFJLEdBQUcsRUFBd0MsQ0FBQztRQVU5RixDQUFDO1FBRUQsSUFBSSxJQUFJO1lBQ1AsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ25CLENBQUM7UUFFRCxNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRO1lBQ2hDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUV4QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsOEJBQThCLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDaEUsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxZQUFZLHdCQUF3QixFQUFFO2dCQUNqQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBRSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7YUFDcEU7WUFFRCxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ2YsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUMxQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO2FBQ3ZDO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO2FBQ3JCO1FBQ0YsQ0FBQztRQUVELG9CQUFvQixDQUFDLGdCQUF5QjtZQUM3QyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsZ0JBQWdCLENBQUM7WUFDNUMsSUFBSSxDQUFDLGtDQUFrQyxFQUFFLENBQUM7UUFDM0MsQ0FBQztRQUVPLGVBQWUsQ0FBQyxRQUFrQztZQUN6RCxLQUFLLE1BQU0sS0FBSyxJQUFJLFFBQVEsRUFBRTtnQkFDN0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzdCO1FBQ0YsQ0FBQztRQUVPLGdCQUFnQixDQUFDLE9BQTRCO1lBQ3BELElBQUksT0FBTyxZQUFZLHdCQUF3QixFQUFFO2dCQUNoRCxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUN2QztZQUVELE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNuQixDQUFDO1FBRUQsaUJBQWlCLENBQUMsSUFBWTtZQUM3QixPQUFPLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDO1FBQzFELENBQUM7UUFFRCxvQkFBb0IsQ0FBQyxJQUFZO1lBQ2hDLElBQUksQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUMvQyxPQUFPO2FBQ1A7WUFFRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUUsQ0FBQyxDQUFDO1FBQ3BFLENBQUM7UUFFTyxrQ0FBa0M7WUFDekMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUN6RyxDQUFDO1FBRU8saUJBQWlCLENBQUMsUUFBc0M7WUFDL0QsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRLEVBQUU7Z0JBQy9CLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQzthQUN0QjtRQUNGLENBQUM7UUFFTyw4QkFBOEIsQ0FBQyxRQUE2QixFQUFFLE1BQWlDO1lBQ3RHLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyRCxNQUFNLE9BQU8sR0FBRyxJQUFJLHdCQUF3QixDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ25HLE9BQU8sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1lBRXhCLE1BQU0sUUFBUSxHQUE2QixFQUFFLENBQUM7WUFDOUMsSUFBSSxRQUFRLENBQUMsUUFBUSxFQUFFO2dCQUN0QixNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7cUJBQ25HLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN2RSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsZUFBZSxDQUFDLENBQUM7YUFDbEM7WUFFRCxJQUFJLFFBQVEsQ0FBQyxRQUFRLEVBQUU7Z0JBQ3RCLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUMxRyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsYUFBYSxDQUFDLENBQUM7YUFDaEM7WUFFRCxPQUFPLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztZQUU1QixPQUFPLE9BQU8sQ0FBQztRQUNoQixDQUFDO1FBRU8sUUFBUSxDQUFDLE9BQTRCO1lBQzVDLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtnQkFDbkIsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDekM7aUJBQU07Z0JBQ04sT0FBTyxDQUFDLENBQUM7YUFDVDtRQUNGLENBQUM7UUFFTyxnQ0FBZ0MsQ0FBQyxPQUFpQixFQUFFLE1BQWdDO1lBQzNGLE1BQU0sT0FBTyxHQUFHLElBQUksMEJBQTBCLENBQzdDLE9BQU8sRUFDUCxNQUFNLEVBQ04sSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQzlCLElBQUksQ0FBQyxtQkFBbUIsRUFDeEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQzlCLElBQUksQ0FBQyxnQkFBZ0IsRUFDckIsSUFBSSxDQUFDLGVBQWUsRUFDcEIsSUFBSSxDQUFDLHVCQUF1QixFQUM1QixJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztZQUU3QixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDNUUsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMzQixJQUFJLENBQUMsMEJBQTBCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDL0QsT0FBTyxPQUFPLENBQUM7UUFDaEIsQ0FBQztLQUNELENBQUE7SUEzSFksOENBQWlCO2dDQUFqQixpQkFBaUI7UUFRM0IsV0FBQSw4Q0FBOEIsQ0FBQTtRQUM5QixXQUFBLDJCQUFnQixDQUFBO1FBQ2hCLFdBQUEseUNBQXVCLENBQUE7UUFDdkIsV0FBQSxnQ0FBZSxDQUFBO09BWEwsaUJBQWlCLENBMkg3QjtJQVVELFNBQWdCLGNBQWMsQ0FBQyxHQUFXLEVBQUUsTUFBc0IsRUFBRSxjQUFrQyxFQUFFLG9CQUFvRDtRQUMzSixNQUFNLGdCQUFnQixHQUFHLFNBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDOUUsTUFBTSxTQUFTLEdBQUcsb0JBQW9CLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3RFLE1BQU0sY0FBYyxHQUFHLE1BQU0sNENBQW9DLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDdkYsTUFBTSwyQ0FBbUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDN0QsTUFBTSw0Q0FBb0MsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQztvQkFDL0QsTUFBTSwwQ0FBa0MsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzt3QkFDNUQsc0JBQXNCLENBQUM7UUFDM0IsTUFBTSxzQkFBc0IsR0FBRyxNQUFNLDRDQUFvQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUMxRixNQUFNLDJDQUFtQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDeEQsTUFBTSw0Q0FBb0MsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQzFELE1BQU0sMENBQWtDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDO3dCQUN2RCxpQkFBaUIsQ0FBQztRQUN0QixJQUFJLFlBQVksR0FBRyxPQUFPLFNBQVMsQ0FBQyxjQUFjLENBQUMsS0FBSyxXQUFXLENBQUM7UUFFcEUsTUFBTSxtQkFBbUIsR0FBRyxTQUFTLENBQUMsbUJBQW1CLENBQUM7UUFDMUQsTUFBTSwwQkFBMEIsR0FBRyxJQUFJLEdBQUcsRUFBd0MsQ0FBQztRQUVuRixnRkFBZ0Y7UUFDaEYsaURBQWlEO1FBQ2pELElBQUksY0FBYyxFQUFFO1lBQ25CLFlBQVksR0FBRyxLQUFLLENBQUM7U0FDckI7UUFDRCxJQUFJLG1CQUFtQixFQUFFO1lBQ3hCLHVEQUF1RDtZQUN2RCxLQUFLLE1BQU0sa0JBQWtCLElBQUksbUJBQW1CLEVBQUU7Z0JBQ3JELDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDOUc7WUFFRCx3RUFBd0U7WUFDeEUsSUFBSSxjQUFjLEVBQUU7Z0JBQ25CLElBQUksMEJBQTBCLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxFQUFFO29CQUNuRCxNQUFNLGFBQWEsR0FBRywwQkFBMEIsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFFLENBQUMsc0JBQXNCLENBQUMsRUFBRSxRQUFRLENBQUM7b0JBQ3hHLElBQUksT0FBTyxhQUFhLEtBQUssV0FBVyxFQUFFO3dCQUN6QyxZQUFZLEdBQUcsSUFBSSxDQUFDO3FCQUNwQjtpQkFDRDthQUNEO1NBQ0Q7UUFFRCxPQUFPLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxjQUFjLEVBQUUsMEJBQTBCLEVBQUUsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFLENBQUM7SUFDbEgsQ0FBQztJQXpDRCx3Q0F5Q0M7SUFFRCxTQUFTLFVBQVUsQ0FBQyxFQUFVO1FBQzdCLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVELFNBQWdCLHlCQUF5QixDQUFDLEdBQVcsRUFBRSxVQUFrQixFQUFFLEVBQUUsdUJBQWdDLEtBQUs7UUFDakgsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4QyxJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFDbEIsSUFBSSxVQUFVLElBQUksQ0FBQyxFQUFFO1lBQ3BCLFFBQVEsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUN4QyxHQUFHLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDcEM7UUFFRCxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdEMsUUFBUSxHQUFHLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNuRCxRQUFRLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRWhDLElBQUksb0JBQW9CLEVBQUU7WUFDekIsR0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ2pDLEdBQUcsR0FBRyxhQUFhLEdBQUcsR0FBRyxDQUFDO1NBQzFCO1FBRUQsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLE9BQU8sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQW5CRCw4REFtQkM7SUFFRCxTQUFTLFVBQVUsQ0FBQyxHQUFXO1FBQzlCLEdBQUcsR0FBRyxHQUFHO2FBQ1AsT0FBTyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQyw4QkFBOEI7YUFDakcsT0FBTyxDQUFDLG9CQUFvQixFQUFFLE9BQU8sQ0FBQyxDQUFDLDJDQUEyQzthQUNsRixPQUFPLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsNkNBQTZDO2FBQzlGLE9BQU8sQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLEVBQUU7WUFDNUIsT0FBTyw4QkFBYSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUM5QyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztnQkFDckIsS0FBSyxDQUFDO1FBQ1IsQ0FBQyxDQUFDLENBQUM7UUFFSixLQUFLLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksa0NBQWlCLEVBQUU7WUFDdkMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUNyRDtRQUVELE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxTQUFTLG9CQUFvQixDQUFDLFFBQWdCLEVBQUUsT0FBZTtRQUM5RCxNQUFNLE1BQU0sR0FBRyxDQUFDLE9BQWdCLEVBQUUsRUFBRTtZQUNuQyw4REFBOEQ7WUFDOUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ2pDLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxFQUFFLENBQUMsQ0FBQzthQUM5QztZQUNELE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDO2lCQUM5QixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ1gseUVBQXlFO2dCQUN6RSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxLQUFLLFFBQVEsQ0FBQyxXQUFXLEVBQUUsRUFBRTtvQkFDcEUsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztpQkFDOUI7cUJBQU07b0JBQ04sT0FBTyxJQUFJLENBQUM7aUJBQ1o7WUFDRixDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU8sS0FBSyxDQUFDLE1BQU0sRUFBRTtnQkFDcEIsTUFBTSxHQUFHLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQzVELElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTtvQkFDdkIsT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztpQkFDakM7Z0JBRUQsSUFBSSxPQUFPLEVBQUU7b0JBQ1osS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO2lCQUNaO3FCQUFNO29CQUNOLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztpQkFDZDthQUNEO1lBRUQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDLENBQUM7UUFFRixJQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0IsSUFBSSxPQUFPLEtBQUssSUFBSSxFQUFFO1lBQ3JCLE9BQU8sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDeEI7UUFFRCxJQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7WUFDckIsT0FBTyxHQUFHLFFBQVEsQ0FBQztTQUNuQjtRQUVELE9BQU8sT0FBTyxDQUFDO0lBQ2hCLENBQUM7SUFFRCxTQUFTLHdCQUF3QixDQUFDLE9BQWlCLEVBQUUsY0FBK0I7UUFDbkYsT0FBTyw4Q0FBZ0M7WUFDdEMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyx3QkFBd0I7WUFDekMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQztJQUMvQixDQUFDO0lBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxPQUFpQjtRQUMxQyxPQUFPLE9BQU8sQ0FBQyxHQUFHLEtBQUssZUFBZTtZQUNyQyxPQUFPLENBQUMsR0FBRyxLQUFLLGdCQUFnQjtZQUNoQyxPQUFPLENBQUMsR0FBRyxLQUFLLGdDQUFnQztZQUNoRCxPQUFPLENBQUMsR0FBRyxLQUFLLDRCQUE0QjtZQUM1QyxPQUFPLENBQUMsR0FBRyxLQUFLLHVCQUF1QjtZQUN2QyxPQUFPLENBQUMsR0FBRyxLQUFLLHNCQUFzQixDQUFDO0lBQ3pDLENBQUM7SUFFRCxTQUFTLGdCQUFnQixDQUFDLE9BQWlCO1FBQzFDLE9BQU8sT0FBTyxDQUFDLEdBQUcsS0FBSyx1QkFBdUIsQ0FBQztJQUNoRCxDQUFDO0lBRUQsU0FBUyx3QkFBd0IsQ0FBQyxFQUFFLElBQUksRUFBZTtRQUN0RCxPQUFPLElBQUksS0FBSyxRQUFRLElBQUksSUFBSSxLQUFLLFNBQVMsSUFBSSxJQUFJLEtBQUssU0FBUyxJQUFJLElBQUksS0FBSyxRQUFRLENBQUM7SUFDM0YsQ0FBQztJQUVELFNBQVMsZUFBZSxDQUFDLEVBQ3hCLElBQUksRUFDSixnQkFBZ0IsRUFDaEIsdUJBQXVCLEVBQ3ZCLDBCQUEwQixFQUNoQjtRQUNWLElBQUksSUFBSSxLQUFLLFFBQVEsRUFBRTtZQUN0QixPQUFPLEtBQUssQ0FBQztTQUNiO1FBRUQsNEJBQTRCO1FBQzVCLElBQ0MsSUFBQSx5QkFBaUIsRUFBQyxnQkFBZ0IsQ0FBQztZQUNuQyxJQUFBLHlCQUFpQixFQUFDLHVCQUF1QixDQUFDO1lBQzFDLElBQUEseUJBQWlCLEVBQUMsMEJBQTBCLENBQUMsRUFDNUM7WUFDRCxPQUFPLEtBQUssQ0FBQztTQUNiO1FBRUQsa0VBQWtFO1FBQ2xFLHdFQUF3RTtRQUN4RSx3RUFBd0U7UUFDeEUsd0RBQXdEO1FBQ3hELElBQUksQ0FBQywwQkFBMEIsS0FBSyxJQUFJLElBQUksMEJBQTBCLEtBQUssU0FBUyxDQUFDO2VBQ2pGLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsSUFBSSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDL0QsT0FBTyxLQUFLLENBQUM7U0FDYjtRQUVELE1BQU0sT0FBTyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLGdCQUFnQixJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRTVHLElBQUksMEJBQTBCLElBQUksT0FBTywwQkFBMEIsS0FBSyxRQUFRLEVBQUU7WUFDakYsT0FBTyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1NBQ3pDO1FBRUQsd0JBQXdCO1FBQ3hCLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQWlCLEVBQUU7WUFDekQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDaEMsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDO2FBQ3BCO1lBQ0QsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pCLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBRVYsT0FBTyxXQUFXLENBQUMsS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVELFNBQVMseUJBQXlCLENBQUMsS0FBd0I7UUFDMUQsTUFBTSwwQkFBMEIsR0FBRyxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN0RixNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEQsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsMEJBQTBCLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUVELElBQWtCLGVBSWpCO0lBSkQsV0FBa0IsZUFBZTtRQUNoQyx1REFBUyxDQUFBO1FBQ1QseURBQVUsQ0FBQTtRQUNWLHVFQUFpQixDQUFBO0lBQ2xCLENBQUMsRUFKaUIsZUFBZSwrQkFBZixlQUFlLFFBSWhDO0lBRU0sSUFBTSxpQkFBaUIsR0FBdkIsTUFBTSxpQkFBa0IsU0FBUSxpQkFBaUI7UUFRdkQsWUFDQyxTQUFtQyxFQUNuQyxrQkFBMkIsRUFDSyxvQkFBb0QsRUFDdEQsa0JBQXdELEVBQ3BFLGVBQWlDLEVBQzFCLHNCQUErQyxFQUN2RCxjQUErQjtZQUVoRCxLQUFLLENBQUMsU0FBUyxFQUFFLGtCQUFrQixFQUFFLG9CQUFvQixFQUFFLGVBQWUsRUFBRSxzQkFBc0IsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUw5RSx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQThCO1lBWC9FLHFCQUFnQixHQUEyQixJQUFJLENBQUM7WUFDaEQsOEJBQXlCLEdBQXlCLElBQUksQ0FBQztZQUN2RCw4QkFBeUIsR0FBeUIsSUFBSSxDQUFDO1lBQ3ZELHNCQUFpQixHQUFrQixJQUFJLENBQUM7WUFFdkMsT0FBRSxHQUFHLG1CQUFtQixDQUFDO1lBWWpDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsbUJBQW1CLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDckQsQ0FBQztRQUVPLHlCQUF5QixDQUFDLENBQXFCLEVBQUUsQ0FBcUI7WUFDN0UsTUFBTSxNQUFNLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztZQUM1QyxNQUFNLE1BQU0sR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLGdCQUFnQixDQUFDO1lBQzVDLElBQUksTUFBTSxHQUFHLE1BQU0sRUFBRTtnQkFDcEIsT0FBTyxDQUFDLENBQUMsQ0FBQzthQUNWO2lCQUFNLElBQUksTUFBTSxHQUFHLE1BQU0sRUFBRTtnQkFDM0IsT0FBTyxDQUFDLENBQUM7YUFDVDtpQkFBTTtnQkFDTixPQUFPLENBQUMsQ0FBQzthQUNUO1FBQ0YsQ0FBQztRQUVPLFdBQVcsQ0FBQyxhQUE4QjtZQUNqRCxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUMzQixJQUFJLENBQUMsQ0FBQyxTQUFTLEtBQUssQ0FBQyxDQUFDLFNBQVMsRUFBRTtvQkFDaEMsMERBQTBEO29CQUMxRCx3RUFBd0U7b0JBQ3hFLE9BQU8sQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDO2lCQUNqQztxQkFBTSxJQUFJLENBQUMsQ0FBQyxTQUFTLEtBQUssOEJBQWdCLENBQUMsV0FBVyxFQUFFO29CQUN4RCxvREFBb0Q7b0JBQ3BELGlCQUFpQjtvQkFDakIsT0FBTyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7aUJBQ3pCO3FCQUFNO29CQUNOLGdDQUFnQztvQkFDaEMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWEsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWE7MkJBQ2xELENBQUMsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQUU7d0JBQzlELCtDQUErQzt3QkFDL0MsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWEsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWE7K0JBQ25ELENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEtBQUssU0FBUyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsYUFBYSxLQUFLLFNBQVMsQ0FBQzsrQkFDaEYsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUU7NEJBQ3hELDJGQUEyRjs0QkFDM0YsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQzt5QkFDeEY7NkJBQU0sSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWEsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWE7K0JBQzFELENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEtBQUssU0FBUyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxLQUFLLFNBQVMsQ0FBQzsrQkFDaEUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUU7NEJBQ3hDLDZFQUE2RTs0QkFDN0UsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzt5QkFDeEU7cUJBQ0Q7b0JBQ0QsdURBQXVEO29CQUN2RCxPQUFPLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQztpQkFDekI7WUFDRixDQUFDLENBQUMsQ0FBQztZQUNILE9BQU8sYUFBYSxDQUFDO1FBQ3RCLENBQUM7UUFFRCxnQkFBZ0I7WUFDZixJQUFJLElBQUksQ0FBQyx5QkFBeUIsRUFBRTtnQkFDbkMsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUM7YUFDdEM7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFO2dCQUMzQixPQUFPLElBQUksQ0FBQzthQUNaO1lBRUQsSUFBSSxxQkFBcUIsR0FBb0IsRUFBRSxDQUFDO1lBRWhELE1BQU0sY0FBYyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7WUFDakMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGdCQUFnQiwrQkFBdUIsQ0FBQztZQUNqRSxJQUFJLFdBQVcsRUFBRTtnQkFDaEIsV0FBVyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDMUUscUJBQXFCLEdBQUcsV0FBVyxDQUFDLGFBQWEsQ0FBQzthQUNsRDtZQUVELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsZ0NBQXdCLENBQUM7WUFDbkUsSUFBSSxZQUFZLEVBQUU7Z0JBQ2pCLFlBQVksQ0FBQyxhQUFhLEdBQUcsWUFBWSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUN4RyxxQkFBcUIsR0FBRyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUVqRixJQUFJLENBQUMseUJBQXlCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQix1Q0FBK0IsQ0FBQzthQUN0RjtZQUVELDRCQUE0QjtZQUM1QixxQkFBcUIsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFFaEUsSUFBSSxDQUFDLHlCQUF5QixHQUFHO2dCQUNoQyxhQUFhLEVBQUUscUJBQXFCO2dCQUNwQyxVQUFVLEVBQUUsV0FBVyxFQUFFLFVBQVUsSUFBSSxZQUFZLEVBQUUsVUFBVTthQUMvRCxDQUFDO1lBRUYsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUM7UUFDdkMsQ0FBQztRQUVELGFBQWE7WUFDWixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxFQUFFLENBQUM7UUFDcEMsQ0FBQztRQUVELFNBQVMsQ0FBQyxLQUFzQixFQUFFLE1BQTRCO1lBQzdELElBQUksQ0FBQyx5QkFBeUIsR0FBRyxJQUFJLENBQUM7WUFDdEMsSUFBSSxDQUFDLHlCQUF5QixHQUFHLElBQUksQ0FBQztZQUV0QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixJQUFJLEVBQUUsQ0FBQztZQUNwRCxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNaLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNwQyxPQUFPO2FBQ1A7WUFFRCxJQUFJLE1BQU0sQ0FBQyxVQUFVLEVBQUU7Z0JBQ3RCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7YUFDM0I7WUFFRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEdBQUcsTUFBTSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN2QixDQUFDO1FBRUQsY0FBYztZQUNiLElBQUksQ0FBQyxNQUFNLENBQUM7Z0JBQ1gsRUFBRSxFQUFFLG1CQUFtQjtnQkFDdkIsS0FBSyxFQUFFLG1CQUFtQjtnQkFDMUIsUUFBUSxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUU7YUFDaEMsQ0FBQyxDQUFDO1lBRUgsdUlBQXVJO1lBQ3ZJLE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDO1lBRTNELElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUTtpQkFDckMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxZQUFZLDBCQUEwQixJQUFJLEtBQUssQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLElBQUksS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7WUFDM1osSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUVuRCxJQUFJLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxhQUFhLENBQUMsTUFBTSxFQUFFO2dCQUN6RCxJQUFJLGtCQUFrQixHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxhQUFhO3FCQUNuRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBcUIsTUFBTSxDQUFDLE9BQVEsQ0FBQztxQkFDbEQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLGFBQWEsSUFBSSxPQUFPLENBQUMsa0JBQWtCLENBQUM7cUJBQ3RFLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixJQUFJLE9BQU8sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO2dCQUMzRSxrQkFBa0IsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLENBQUM7Z0JBRXpELElBQUksa0JBQWtCLENBQUMsTUFBTSxFQUFFO29CQUM5QixNQUFNLGFBQWEsR0FBRyxJQUFJLGdDQUFnQyxDQUFDLGVBQWUsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO29CQUNoRyxhQUFhLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7b0JBQ2xDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztpQkFDeEM7YUFDRDtRQUNGLENBQUM7UUFFRCxxQkFBcUI7WUFDcEIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLElBQUksQ0FBQyxDQUFDO1FBQ3BDLENBQUM7UUFFTyxlQUFlO1lBQ3RCLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDekUsQ0FBQztLQUNELENBQUE7SUFsS1ksOENBQWlCO2dDQUFqQixpQkFBaUI7UUFXM0IsV0FBQSw4Q0FBOEIsQ0FBQTtRQUM5QixXQUFBLGlEQUE0QixDQUFBO1FBQzVCLFdBQUEsMkJBQWdCLENBQUE7UUFDaEIsV0FBQSx5Q0FBdUIsQ0FBQTtRQUN2QixXQUFBLGdDQUFlLENBQUE7T0FmTCxpQkFBaUIsQ0FrSzdCO0lBV0QsTUFBTSxRQUFRLEdBQUcsaUNBQWlDLENBQUM7SUFDbkQsTUFBTSxjQUFjLEdBQUcsa0NBQWtDLENBQUM7SUFDMUQsTUFBTSxZQUFZLEdBQUcsc0NBQXNDLENBQUM7SUFDNUQsTUFBTSxPQUFPLEdBQUcsaUNBQWlDLENBQUM7SUFDbEQsTUFBTSxhQUFhLEdBQUcsbUNBQW1DLENBQUM7SUFFMUQsU0FBZ0IsVUFBVSxDQUFDLEtBQWE7UUFDdkM7Ozs7Ozs7V0FPRztRQUNILFNBQVMsY0FBYyxDQUFDLEtBQWEsRUFBRSxXQUFtQixFQUFFLFdBQXFCO1lBQ2hGLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLG1CQUFtQixFQUFFLHFCQUFxQixFQUFFLEVBQUU7Z0JBQ3ZGLE1BQU0sYUFBYSxHQUFXLHFCQUFxQixJQUFJLG1CQUFtQixDQUFDO2dCQUMzRSxJQUFJLGFBQWEsRUFBRTtvQkFDbEIsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFBLDZCQUFtQixFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDdEc7Z0JBQ0QsT0FBTyxFQUFFLENBQUM7WUFDWCxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxNQUFNLElBQUksR0FBYSxFQUFFLENBQUM7UUFDMUIsS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDekQsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksU0FBUyxDQUFDLENBQUM7WUFDNUIsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDLENBQUMsQ0FBQztRQUVILEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksa0NBQW9CLEVBQUUsRUFBRSxHQUFHLEVBQUU7WUFDdEQsSUFBSSxDQUFDLElBQUksQ0FBQyxrQ0FBb0IsQ0FBQyxDQUFDO1lBQ2hDLE9BQU8sRUFBRSxDQUFDO1FBQ1gsQ0FBQyxDQUFDLENBQUM7UUFFSCxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLGdDQUFrQixFQUFFLEVBQUUsR0FBRyxFQUFFO1lBQ3BELElBQUksQ0FBQyxJQUFJLENBQUMsZ0NBQWtCLENBQUMsQ0FBQztZQUM5QixPQUFPLEVBQUUsQ0FBQztRQUNYLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxVQUFVLEdBQWEsRUFBRSxDQUFDO1FBQ2hDLE1BQU0sUUFBUSxHQUFhLEVBQUUsQ0FBQztRQUM5QixNQUFNLEdBQUcsR0FBYSxFQUFFLENBQUM7UUFDekIsTUFBTSxLQUFLLEdBQWEsRUFBRSxDQUFDO1FBQzNCLEtBQUssR0FBRyxjQUFjLENBQUMsS0FBSyxFQUFFLGNBQWMsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUMxRCxLQUFLLEdBQUcsY0FBYyxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDdEQsS0FBSyxHQUFHLGNBQWMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRTVDLElBQUksb0NBQXNCLEVBQUU7WUFDM0IsS0FBSyxHQUFHLGNBQWMsQ0FBQyxLQUFLLEVBQUUsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ3BEO1FBRUQsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUVyQix1REFBdUQ7UUFDdkQsT0FBTztZQUNOLElBQUk7WUFDSixnQkFBZ0IsRUFBRSxVQUFVO1lBQzVCLGNBQWMsRUFBRSxRQUFRO1lBQ3hCLFNBQVMsRUFBRSxHQUFHO1lBQ2QsY0FBYyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztZQUNuRCxLQUFLO1NBQ0wsQ0FBQztJQUNILENBQUM7SUExREQsZ0NBMERDIn0=