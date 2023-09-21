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
    exports.$zDb = exports.$yDb = exports.SearchResultIdx = exports.$xDb = exports.$wDb = exports.$vDb = exports.$uDb = exports.$tDb = exports.$sDb = exports.$rDb = exports.$qDb = void 0;
    exports.$qDb = 'usesOnlineServices';
    class $rDb extends lifecycle_1.$kc {
        constructor(_id) {
            super();
            this.c = false;
            this.f = new event_1.$fd();
            this.onDidChangeTabbable = this.f.event;
            this.id = _id;
        }
        get tabbable() {
            return this.c;
        }
        set tabbable(value) {
            this.c = value;
            this.f.fire();
        }
    }
    exports.$rDb = $rDb;
    class $sDb extends $rDb {
        get children() {
            return this.h;
        }
        set children(newChildren) {
            this.h = newChildren;
            this.g = new Set();
            this.h.forEach(child => {
                if (child instanceof $uDb) {
                    this.g.add(child.setting.key);
                }
            });
        }
        constructor(_id, count, label, level, isFirstGroup) {
            super(_id);
            this.g = new Set();
            this.h = [];
            this.count = count;
            this.label = label;
            this.level = level;
            this.isFirstGroup = isFirstGroup;
        }
        /**
         * Returns whether this group contains the given child key (to a depth of 1 only)
         */
        containsSetting(key) {
            return this.g.has(key);
        }
    }
    exports.$sDb = $sDb;
    class $tDb extends $rDb {
        constructor(_id, extensionIds) {
            super(_id);
            this.extensionIds = extensionIds;
        }
    }
    exports.$tDb = $tDb;
    class $uDb extends $rDb {
        static { this.g = 20; }
        constructor(setting, parent, settingsTarget, n, r, t, u, w, y) {
            super(sanitizeId(parent.id + '_' + setting.key));
            this.settingsTarget = settingsTarget;
            this.n = n;
            this.r = r;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.h = null;
            this.j = null;
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
            this.C();
            this.D();
        }
        get displayCategory() {
            if (!this.h) {
                this.z();
            }
            return this.h;
        }
        get displayLabel() {
            if (!this.j) {
                this.z();
            }
            return this.j;
        }
        z() {
            if (this.setting.title) {
                this.j = this.setting.title;
                this.h = '';
                return;
            }
            const displayKeyFormat = $xDb(this.setting.key, this.parent.id, this.setting.isLanguageTagSetting);
            this.j = displayKeyFormat.label;
            this.h = displayKeyFormat.category;
        }
        C() {
            if (this.setting.description.length > $uDb.g) {
                const truncatedDescLines = this.setting.description.slice(0, $uDb.g);
                truncatedDescLines.push('[...]');
                this.description = truncatedDescLines.join('\n');
            }
            else {
                this.description = this.setting.description.join('\n');
            }
        }
        D() {
            if (isExtensionToggleSetting(this.setting, this.u)) {
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
            const targetToInspect = this.F(this.setting);
            const inspectResult = $wDb(this.setting.key, targetToInspect, this.r, this.y);
            this.G(inspectResult, this.n);
        }
        F(setting) {
            if (!this.w.currentProfile.isDefault && !this.w.currentProfile.useDefaultFlags?.settings) {
                if (setting.scope === 1 /* ConfigurationScope.APPLICATION */) {
                    return 1 /* ConfigurationTarget.APPLICATION */;
                }
                if (this.y.isSettingAppliedForAllProfiles(setting.key) && this.settingsTarget === 3 /* ConfigurationTarget.USER_LOCAL */) {
                    return 1 /* ConfigurationTarget.APPLICATION */;
                }
            }
            return this.settingsTarget;
        }
        G(inspectResult, isWorkspaceTrusted) {
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
                        if (this.t.isRegisteredLanguageId(overrideIdentifier)) {
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
                const registryValues = platform_1.$8m.as(configurationRegistry_1.$an.Configuration).getConfigurationDefaultsOverrides();
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
                    this.tags.add(preferences_1.$ICb);
                }
                this.setting.tags?.forEach(tag => this.tags.add(tag));
                if (this.setting.restricted) {
                    this.tags.add(preferences_1.$QCb);
                }
                if (this.hasPolicyValue) {
                    this.tags.add(preferences_1.$OCb);
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
                return configuration_1.$bE.includes(this.setting.scope);
            }
            if (configTarget === 6 /* ConfigurationTarget.WORKSPACE_FOLDER */) {
                return configuration_1.$hE.includes(this.setting.scope);
            }
            if (configTarget === 5 /* ConfigurationTarget.WORKSPACE */) {
                return configuration_1.$gE.includes(this.setting.scope);
            }
            if (configTarget === 4 /* ConfigurationTarget.USER_REMOTE */) {
                return configuration_1.$fE.includes(this.setting.scope);
            }
            if (configTarget === 3 /* ConfigurationTarget.USER_LOCAL */) {
                if (isRemote) {
                    return configuration_1.$eE.includes(this.setting.scope);
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
            const features = settingsLayout_1.$nDb.children.find(child => child.id === 'features');
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
            if (!this.t.isRegisteredLanguageId(languageFilter)) {
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
    exports.$uDb = $uDb;
    function createSettingMatchRegExp(pattern) {
        pattern = (0, strings_1.$qe)(pattern)
            .replace(/\\\*/g, '.*');
        return new RegExp(`^${pattern}$`, 'i');
    }
    let $vDb = class $vDb {
        constructor(f, g, h, i, j, l) {
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.l = l;
            this.e = new Map();
        }
        get root() {
            return this.c;
        }
        update(newTocRoot = this.d) {
            this.e.clear();
            const newRoot = this.r(newTocRoot);
            if (newRoot.children[0] instanceof $sDb) {
                newRoot.children[0].isFirstGroup = true;
            }
            if (this.c) {
                this.n(this.c.children);
                this.c.children = newRoot.children;
            }
            else {
                this.c = newRoot;
            }
        }
        updateWorkspaceTrust(workspaceTrusted) {
            this.g = workspaceTrusted;
            this.p();
        }
        n(children) {
            for (const child of children) {
                this.o(child);
            }
        }
        o(element) {
            if (element instanceof $sDb) {
                this.n(element.children);
            }
            element.dispose();
        }
        getElementsByName(name) {
            return this.e.get(name) ?? null;
        }
        updateElementsByName(name) {
            if (!this.e.has(name)) {
                return;
            }
            this.q(this.e.get(name));
        }
        p() {
            this.q([...this.e.values()].flat().filter(s => s.isUntrusted));
        }
        q(settings) {
            for (const element of settings) {
                element.inspectSelf();
            }
        }
        r(tocEntry, parent) {
            const depth = parent ? this.t(parent) + 1 : 0;
            const element = new $sDb(tocEntry.id, undefined, tocEntry.label, depth, false);
            element.parent = parent;
            const children = [];
            if (tocEntry.settings) {
                const settingChildren = tocEntry.settings.map(s => this.u(s, element))
                    .filter(el => el.setting.deprecationMessage ? el.isConfigured : true);
                children.push(...settingChildren);
            }
            if (tocEntry.children) {
                const groupChildren = tocEntry.children.map(child => this.r(child, element));
                children.push(...groupChildren);
            }
            element.children = children;
            return element;
        }
        t(element) {
            if (element.parent) {
                return 1 + this.t(element.parent);
            }
            else {
                return 0;
            }
        }
        u(setting, parent) {
            const element = new $uDb(setting, parent, this.f.settingsTarget, this.g, this.f.languageFilter, this.i, this.l, this.j, this.h);
            const nameElements = this.e.get(setting.key) || [];
            nameElements.push(element);
            this.e.set(setting.key, nameElements);
            return element;
        }
    };
    exports.$vDb = $vDb;
    exports.$vDb = $vDb = __decorate([
        __param(2, configuration_1.$mE),
        __param(3, language_1.$ct),
        __param(4, userDataProfile_1.$CJ),
        __param(5, productService_1.$kj)
    ], $vDb);
    function $wDb(key, target, languageFilter, configurationService) {
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
    exports.$wDb = $wDb;
    function sanitizeId(id) {
        return id.replace(/[\.\/]/, '_');
    }
    function $xDb(key, groupId = '', isLanguageTagSetting = false) {
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
    exports.$xDb = $xDb;
    function wordifyKey(key) {
        key = key
            .replace(/\.([a-z0-9])/g, (_, p1) => ` \u203A ${p1.toUpperCase()}`) // Replace dot with spaced '>'
            .replace(/([a-z0-9])([A-Z])/g, '$1 $2') // Camel case to spacing, fooBar => foo Bar
            .replace(/^[a-z]/g, match => match.toUpperCase()) // Upper casing all first letters, foo => Foo
            .replace(/\b\w+\b/g, match => {
            return settingsLayout_1.$oDb.has(match.toLowerCase()) ?
                match.toUpperCase() :
                match;
        });
        for (const [k, v] of settingsLayout_1.$pDb) {
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
        return preferences_1.$TCb &&
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
        if ((0, types_1.$sf)(objectProperties) &&
            (0, types_1.$sf)(objectPatternProperties) &&
            (0, types_1.$sf)(objectAdditionalProperties)) {
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
    let $yDb = class $yDb extends $vDb {
        constructor(viewState, isWorkspaceTrusted, configurationService, A, languageService, userDataProfileService, productService) {
            super(viewState, isWorkspaceTrusted, configurationService, languageService, userDataProfileService, productService);
            this.A = A;
            this.w = null;
            this.x = null;
            this.y = null;
            this.z = null;
            this.id = 'searchResultModel';
            this.update({ id: 'searchResultModel', label: '' });
        }
        B(a, b) {
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
        C(filterMatches) {
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
                            return this.B(a.setting.categoryOrder, b.setting.categoryOrder);
                        }
                        else if (a.setting.categoryLabel === b.setting.categoryLabel
                            && (a.setting.order !== undefined || b.setting.order !== undefined)
                            && a.setting.order !== b.setting.order) {
                            // These two settings belong to the same category, but have different orders.
                            return this.B(a.setting.order, b.setting.order);
                        }
                    }
                    // In the worst case, go back to lexicographical order.
                    return b.score - a.score;
                }
            });
            return filterMatches;
        }
        getUniqueResults() {
            if (this.x) {
                return this.x;
            }
            if (!this.w) {
                return null;
            }
            let combinedFilterMatches = [];
            const localMatchKeys = new Set();
            const localResult = this.w[0 /* SearchResultIdx.Local */];
            if (localResult) {
                localResult.filterMatches.forEach(m => localMatchKeys.add(m.setting.key));
                combinedFilterMatches = localResult.filterMatches;
            }
            const remoteResult = this.w[1 /* SearchResultIdx.Remote */];
            if (remoteResult) {
                remoteResult.filterMatches = remoteResult.filterMatches.filter(m => !localMatchKeys.has(m.setting.key));
                combinedFilterMatches = combinedFilterMatches.concat(remoteResult.filterMatches);
                this.y = this.w[2 /* SearchResultIdx.NewExtensions */];
            }
            // Combine and sort results.
            combinedFilterMatches = this.C(combinedFilterMatches);
            this.x = {
                filterMatches: combinedFilterMatches,
                exactMatch: localResult?.exactMatch || remoteResult?.exactMatch
            };
            return this.x;
        }
        getRawResults() {
            return this.w || [];
        }
        setResult(order, result) {
            this.x = null;
            this.y = null;
            this.w = this.w || [];
            if (!result) {
                delete this.w[order];
                return;
            }
            if (result.exactMatch) {
                this.w = [];
            }
            this.w[order] = result;
            this.updateChildren();
        }
        updateChildren() {
            this.update({
                id: 'searchResultModel',
                label: 'searchResultModel',
                settings: this.D()
            });
            // Save time, filter children in the search model instead of relying on the tree filter, which still requires heights to be calculated.
            const isRemote = !!this.A.remoteAuthority;
            this.root.children = this.root.children
                .filter(child => child instanceof $uDb && child.matchesAllTags(this.f.tagFilters) && child.matchesScope(this.f.settingsTarget, isRemote) && child.matchesAnyExtension(this.f.extensionFilters) && child.matchesAnyId(this.f.idFilters) && child.matchesAnyFeature(this.f.featureFilters) && child.matchesAllLanguages(this.f.languageFilter));
            this.z = this.root.children.length;
            if (this.y?.filterMatches.length) {
                let resultExtensionIds = this.y.filterMatches
                    .map(result => result.setting)
                    .filter(setting => setting.extensionName && setting.extensionPublisher)
                    .map(setting => `${setting.extensionPublisher}.${setting.extensionName}`);
                resultExtensionIds = arrays.$Kb(resultExtensionIds);
                if (resultExtensionIds.length) {
                    const newExtElement = new $tDb('newExtensions', resultExtensionIds);
                    newExtElement.parent = this.c;
                    this.c.children.push(newExtElement);
                }
            }
        }
        getUniqueResultsCount() {
            return this.z ?? 0;
        }
        D() {
            return this.getUniqueResults()?.filterMatches.map(m => m.setting) ?? [];
        }
    };
    exports.$yDb = $yDb;
    exports.$yDb = $yDb = __decorate([
        __param(2, configuration_1.$mE),
        __param(3, environmentService_1.$hJ),
        __param(4, language_1.$ct),
        __param(5, userDataProfile_1.$CJ),
        __param(6, productService_1.$kj)
    ], $yDb);
    const tagRegex = /(^|\s)@tag:("([^"]*)"|[^"]\S*)/g;
    const extensionRegex = /(^|\s)@ext:("([^"]*)"|[^"]\S*)?/g;
    const featureRegex = /(^|\s)@feature:("([^"]*)"|[^"]\S*)?/g;
    const idRegex = /(^|\s)@id:("([^"]*)"|[^"]\S*)?/g;
    const languageRegex = /(^|\s)@lang:("([^"]*)"|[^"]\S*)?/g;
    function $zDb(query) {
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
                    parsedParts.push(...parsedElement.split(',').map(s => s.trim()).filter(s => !(0, strings_1.$me)(s)));
                }
                return '';
            });
        }
        const tags = [];
        query = query.replace(tagRegex, (_, __, quotedTag, tag) => {
            tags.push(tag || quotedTag);
            return '';
        });
        query = query.replace(`@${preferences_1.$ICb}`, () => {
            tags.push(preferences_1.$ICb);
            return '';
        });
        query = query.replace(`@${preferences_1.$OCb}`, () => {
            tags.push(preferences_1.$OCb);
            return '';
        });
        const extensions = [];
        const features = [];
        const ids = [];
        const langs = [];
        query = getTagsForType(query, extensionRegex, extensions);
        query = getTagsForType(query, featureRegex, features);
        query = getTagsForType(query, idRegex, ids);
        if (preferences_1.$SCb) {
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
    exports.$zDb = $zDb;
});
//# sourceMappingURL=settingsTreeModels.js.map