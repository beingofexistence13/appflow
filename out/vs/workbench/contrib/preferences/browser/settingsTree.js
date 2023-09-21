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
define(["require", "exports", "vs/base/browser/canIUse", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/markdownRenderer", "vs/base/browser/ui/aria/aria", "vs/base/browser/ui/button/button", "vs/base/browser/ui/iconLabel/simpleIconLabel", "vs/base/browser/ui/inputbox/inputBox", "vs/base/browser/ui/list/list", "vs/base/browser/ui/list/listWidget", "vs/base/browser/ui/selectBox/selectBox", "vs/base/browser/ui/toggle/toggle", "vs/base/browser/ui/toolbar/toolbar", "vs/base/browser/ui/tree/abstractTree", "vs/base/browser/ui/tree/objectTreeModel", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/codicons", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/strings", "vs/base/common/types", "vs/editor/common/languages/language", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/nls", "vs/platform/clipboard/common/clipboardService", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/list/browser/listService", "vs/platform/opener/common/opener", "vs/platform/product/common/productService", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/settingsMerge", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/preferences/browser/preferencesIcons", "vs/workbench/contrib/preferences/browser/settingsEditorSettingIndicators", "vs/workbench/contrib/preferences/browser/settingsTreeModels", "vs/workbench/contrib/preferences/browser/settingsWidgets", "vs/workbench/contrib/preferences/common/preferences", "vs/workbench/contrib/preferences/common/settingsEditorColorRegistry", "vs/workbench/services/configuration/common/configuration", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/preferences/common/preferencesValidation"], function (require, exports, canIUse_1, DOM, keyboardEvent_1, markdownRenderer_1, aria, button_1, simpleIconLabel_1, inputBox_1, list_1, listWidget_1, selectBox_1, toggle_1, toolbar_1, abstractTree_1, objectTreeModel_1, actions_1, arrays_1, codicons_1, errors_1, event_1, lifecycle_1, platform_1, strings_1, types_1, language_1, markdownRenderer_2, nls_1, clipboardService_1, commands_1, configuration_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, listService_1, opener_1, productService_1, telemetry_1, defaultStyles_1, colorRegistry_1, themeService_1, userDataProfile_1, settingsMerge_1, userDataSync_1, extensions_1, preferencesIcons_1, settingsEditorSettingIndicators_1, settingsTreeModels_1, settingsWidgets_1, preferences_1, settingsEditorColorRegistry_1, configuration_2, environmentService_1, extensions_2, preferences_2, preferencesValidation_1) {
    "use strict";
    var AbstractSettingRenderer_1, CopySettingIdAction_1, CopySettingAsJSONAction_1, SyncSettingAction_1, ApplySettingToAllProfilesAction_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SettingsTree = exports.NonCollapsibleObjectTreeModel = exports.SettingsTreeFilter = exports.SettingTreeRenderers = exports.SettingsExtensionToggleRenderer = exports.SettingBoolRenderer = exports.SettingNumberRenderer = exports.SettingEnumRenderer = exports.SettingIncludeRenderer = exports.SettingExcludeRenderer = exports.SettingComplexRenderer = exports.SettingNewExtensionsRenderer = exports.SettingGroupRenderer = exports.AbstractSettingRenderer = exports.createSettingMatchRegExp = exports.createTocTreeForExtensionSettings = exports.resolveConfiguredUntrustedSettings = exports.resolveSettingsTree = void 0;
    const $ = DOM.$;
    function getIncludeExcludeDisplayValue(element) {
        const data = element.isConfigured ?
            { ...element.defaultValue, ...element.scopeValue } :
            element.defaultValue;
        return Object.keys(data)
            .filter(key => !!data[key])
            .map(key => {
            const value = data[key];
            const sibling = typeof value === 'boolean' ? undefined : value.when;
            return {
                value: {
                    type: 'string',
                    data: key
                },
                sibling,
                elementType: element.valueType
            };
        });
    }
    function areAllPropertiesDefined(properties, itemsToDisplay) {
        const staticProperties = new Set(properties);
        itemsToDisplay.forEach(({ key }) => staticProperties.delete(key.data));
        return staticProperties.size === 0;
    }
    function getEnumOptionsFromSchema(schema) {
        if (schema.anyOf) {
            return schema.anyOf.map(getEnumOptionsFromSchema).flat();
        }
        const enumDescriptions = schema.enumDescriptions ?? [];
        return (schema.enum ?? []).map((value, idx) => {
            const description = idx < enumDescriptions.length
                ? enumDescriptions[idx]
                : undefined;
            return { value, description };
        });
    }
    function getObjectValueType(schema) {
        if (schema.anyOf) {
            const subTypes = schema.anyOf.map(getObjectValueType);
            if (subTypes.some(type => type === 'enum')) {
                return 'enum';
            }
            return 'string';
        }
        if (schema.type === 'boolean') {
            return 'boolean';
        }
        else if (schema.type === 'string' && (0, types_1.isDefined)(schema.enum) && schema.enum.length > 0) {
            return 'enum';
        }
        else {
            return 'string';
        }
    }
    function getObjectDisplayValue(element) {
        const elementDefaultValue = typeof element.defaultValue === 'object'
            ? element.defaultValue ?? {}
            : {};
        const elementScopeValue = typeof element.scopeValue === 'object'
            ? element.scopeValue ?? {}
            : {};
        const data = element.isConfigured ?
            { ...elementDefaultValue, ...elementScopeValue } :
            elementDefaultValue;
        const { objectProperties, objectPatternProperties, objectAdditionalProperties } = element.setting;
        const patternsAndSchemas = Object
            .entries(objectPatternProperties ?? {})
            .map(([pattern, schema]) => ({
            pattern: new RegExp(pattern),
            schema
        }));
        const wellDefinedKeyEnumOptions = Object.entries(objectProperties ?? {}).map(([key, schema]) => ({ value: key, description: schema.description }));
        return Object.keys(data).map(key => {
            const defaultValue = elementDefaultValue[key];
            if ((0, types_1.isDefined)(objectProperties) && key in objectProperties) {
                if (element.setting.allKeysAreBoolean) {
                    return {
                        key: {
                            type: 'string',
                            data: key
                        },
                        value: {
                            type: 'boolean',
                            data: data[key]
                        },
                        keyDescription: objectProperties[key].description,
                        removable: false
                    };
                }
                const valueEnumOptions = getEnumOptionsFromSchema(objectProperties[key]);
                return {
                    key: {
                        type: 'enum',
                        data: key,
                        options: wellDefinedKeyEnumOptions,
                    },
                    value: {
                        type: getObjectValueType(objectProperties[key]),
                        data: data[key],
                        options: valueEnumOptions,
                    },
                    keyDescription: objectProperties[key].description,
                    removable: (0, types_1.isUndefinedOrNull)(defaultValue),
                };
            }
            // The row is removable if it doesn't have a default value assigned.
            // Otherwise, it is not removable, but its value can be reset to the default.
            const removable = !defaultValue;
            const schema = patternsAndSchemas.find(({ pattern }) => pattern.test(key))?.schema;
            if (schema) {
                const valueEnumOptions = getEnumOptionsFromSchema(schema);
                return {
                    key: { type: 'string', data: key },
                    value: {
                        type: getObjectValueType(schema),
                        data: data[key],
                        options: valueEnumOptions,
                    },
                    keyDescription: schema.description,
                    removable,
                };
            }
            const additionalValueEnums = getEnumOptionsFromSchema(typeof objectAdditionalProperties === 'boolean'
                ? {}
                : objectAdditionalProperties ?? {});
            return {
                key: { type: 'string', data: key },
                value: {
                    type: typeof objectAdditionalProperties === 'object' ? getObjectValueType(objectAdditionalProperties) : 'string',
                    data: data[key],
                    options: additionalValueEnums,
                },
                keyDescription: typeof objectAdditionalProperties === 'object' ? objectAdditionalProperties.description : undefined,
                removable,
            };
        }).filter(item => !(0, types_1.isUndefinedOrNull)(item.value.data));
    }
    function createArraySuggester(element) {
        return (keys, idx) => {
            const enumOptions = [];
            if (element.setting.enum) {
                element.setting.enum.forEach((key, i) => {
                    // include the currently selected value, even if uniqueItems is true
                    if (!element.setting.uniqueItems || (idx !== undefined && key === keys[idx]) || !keys.includes(key)) {
                        const description = element.setting.enumDescriptions?.[i];
                        enumOptions.push({ value: key, description });
                    }
                });
            }
            return enumOptions.length > 0
                ? { type: 'enum', data: enumOptions[0].value, options: enumOptions }
                : undefined;
        };
    }
    function createObjectKeySuggester(element) {
        const { objectProperties } = element.setting;
        const allStaticKeys = Object.keys(objectProperties ?? {});
        return keys => {
            const existingKeys = new Set(keys);
            const enumOptions = [];
            allStaticKeys.forEach(staticKey => {
                if (!existingKeys.has(staticKey)) {
                    enumOptions.push({ value: staticKey, description: objectProperties[staticKey].description });
                }
            });
            return enumOptions.length > 0
                ? { type: 'enum', data: enumOptions[0].value, options: enumOptions }
                : undefined;
        };
    }
    function createObjectValueSuggester(element) {
        const { objectProperties, objectPatternProperties, objectAdditionalProperties } = element.setting;
        const patternsAndSchemas = Object
            .entries(objectPatternProperties ?? {})
            .map(([pattern, schema]) => ({
            pattern: new RegExp(pattern),
            schema
        }));
        return (key) => {
            let suggestedSchema;
            if ((0, types_1.isDefined)(objectProperties) && key in objectProperties) {
                suggestedSchema = objectProperties[key];
            }
            const patternSchema = suggestedSchema ?? patternsAndSchemas.find(({ pattern }) => pattern.test(key))?.schema;
            if ((0, types_1.isDefined)(patternSchema)) {
                suggestedSchema = patternSchema;
            }
            else if ((0, types_1.isDefined)(objectAdditionalProperties) && typeof objectAdditionalProperties === 'object') {
                suggestedSchema = objectAdditionalProperties;
            }
            if ((0, types_1.isDefined)(suggestedSchema)) {
                const type = getObjectValueType(suggestedSchema);
                if (type === 'boolean') {
                    return { type, data: suggestedSchema.default ?? true };
                }
                else if (type === 'enum') {
                    const options = getEnumOptionsFromSchema(suggestedSchema);
                    return { type, data: suggestedSchema.default ?? options[0].value, options };
                }
                else {
                    return { type, data: suggestedSchema.default ?? '' };
                }
            }
            return;
        };
    }
    function isNonNullableNumericType(type) {
        return type === 'number' || type === 'integer';
    }
    function parseNumericObjectValues(dataElement, v) {
        const newRecord = {};
        for (const key in v) {
            // Set to true/false once we're sure of the answer
            let keyMatchesNumericProperty;
            const patternProperties = dataElement.setting.objectPatternProperties;
            const properties = dataElement.setting.objectProperties;
            const additionalProperties = dataElement.setting.objectAdditionalProperties;
            // Match the current record key against the properties of the object
            if (properties) {
                for (const propKey in properties) {
                    if (propKey === key) {
                        keyMatchesNumericProperty = isNonNullableNumericType(properties[propKey].type);
                        break;
                    }
                }
            }
            if (keyMatchesNumericProperty === undefined && patternProperties) {
                for (const patternKey in patternProperties) {
                    if (key.match(patternKey)) {
                        keyMatchesNumericProperty = isNonNullableNumericType(patternProperties[patternKey].type);
                        break;
                    }
                }
            }
            if (keyMatchesNumericProperty === undefined && additionalProperties && typeof additionalProperties !== 'boolean') {
                if (isNonNullableNumericType(additionalProperties.type)) {
                    keyMatchesNumericProperty = true;
                }
            }
            newRecord[key] = keyMatchesNumericProperty ? Number(v[key]) : v[key];
        }
        return newRecord;
    }
    function getListDisplayValue(element) {
        if (!element.value || !Array.isArray(element.value)) {
            return [];
        }
        if (element.setting.arrayItemType === 'enum') {
            let enumOptions = [];
            if (element.setting.enum) {
                enumOptions = element.setting.enum.map((setting, i) => {
                    return {
                        value: setting,
                        description: element.setting.enumDescriptions?.[i]
                    };
                });
            }
            return element.value.map((key) => {
                return {
                    value: {
                        type: 'enum',
                        data: key,
                        options: enumOptions
                    }
                };
            });
        }
        else {
            return element.value.map((key) => {
                return {
                    value: {
                        type: 'string',
                        data: key
                    }
                };
            });
        }
    }
    function getShowAddButtonList(dataElement, listDisplayValue) {
        if (dataElement.setting.enum && dataElement.setting.uniqueItems) {
            return dataElement.setting.enum.length - listDisplayValue.length > 0;
        }
        else {
            return true;
        }
    }
    function resolveSettingsTree(tocData, coreSettingsGroups, logService) {
        const allSettings = getFlatSettings(coreSettingsGroups);
        return {
            tree: _resolveSettingsTree(tocData, allSettings, logService),
            leftoverSettings: allSettings
        };
    }
    exports.resolveSettingsTree = resolveSettingsTree;
    function resolveConfiguredUntrustedSettings(groups, target, languageFilter, configurationService) {
        const allSettings = getFlatSettings(groups);
        return [...allSettings].filter(setting => setting.restricted && (0, settingsTreeModels_1.inspectSetting)(setting.key, target, languageFilter, configurationService).isConfigured);
    }
    exports.resolveConfiguredUntrustedSettings = resolveConfiguredUntrustedSettings;
    function compareNullableIntegers(a, b) {
        const firstElem = a ?? Number.MAX_SAFE_INTEGER;
        const secondElem = b ?? Number.MAX_SAFE_INTEGER;
        return firstElem - secondElem;
    }
    async function createTocTreeForExtensionSettings(extensionService, groups) {
        const extGroupTree = new Map();
        const addEntryToTree = (extensionId, extensionName, childEntry) => {
            if (!extGroupTree.has(extensionId)) {
                const rootEntry = {
                    id: extensionId,
                    label: extensionName,
                    children: []
                };
                extGroupTree.set(extensionId, rootEntry);
            }
            extGroupTree.get(extensionId).children.push(childEntry);
        };
        const processGroupEntry = async (group) => {
            const flatSettings = group.sections.map(section => section.settings).flat();
            const extensionId = group.extensionInfo.id;
            const extension = await extensionService.getExtension(extensionId);
            const extensionName = extension?.displayName ?? extension?.name ?? extensionId;
            // Each group represents a single category of settings.
            // If the extension author forgets to specify an id for the group,
            // fall back to the title given to the group.
            const childEntry = {
                id: group.id || group.title,
                label: group.title,
                order: group.order,
                settings: flatSettings
            };
            addEntryToTree(extensionId, extensionName, childEntry);
        };
        const processPromises = groups.map(g => processGroupEntry(g));
        return Promise.all(processPromises).then(() => {
            const extGroups = [];
            for (const extensionRootEntry of extGroupTree.values()) {
                for (const child of extensionRootEntry.children) {
                    // Sort the individual settings of the child.
                    child.settings?.sort((a, b) => {
                        return compareNullableIntegers(a.order, b.order);
                    });
                }
                if (extensionRootEntry.children.length === 1) {
                    // There is a single category for this extension.
                    // Push a flattened setting.
                    extGroups.push({
                        id: extensionRootEntry.id,
                        label: extensionRootEntry.children[0].label,
                        settings: extensionRootEntry.children[0].settings
                    });
                }
                else {
                    // Sort the categories.
                    extensionRootEntry.children.sort((a, b) => {
                        return compareNullableIntegers(a.order, b.order);
                    });
                    // If there is a category that matches the setting name,
                    // add the settings in manually as "ungrouped" settings.
                    // https://github.com/microsoft/vscode/issues/137259
                    const ungroupedChild = extensionRootEntry.children.find(child => child.label === extensionRootEntry.label);
                    if (ungroupedChild && !ungroupedChild.children) {
                        const groupedChildren = extensionRootEntry.children.filter(child => child !== ungroupedChild);
                        extGroups.push({
                            id: extensionRootEntry.id,
                            label: extensionRootEntry.label,
                            settings: ungroupedChild.settings,
                            children: groupedChildren
                        });
                    }
                    else {
                        // Push all the groups as-is.
                        extGroups.push(extensionRootEntry);
                    }
                }
            }
            // Sort the outermost settings.
            extGroups.sort((a, b) => a.label.localeCompare(b.label));
            return {
                id: 'extensions',
                label: (0, nls_1.localize)('extensions', "Extensions"),
                children: extGroups
            };
        });
    }
    exports.createTocTreeForExtensionSettings = createTocTreeForExtensionSettings;
    function _resolveSettingsTree(tocData, allSettings, logService) {
        let children;
        if (tocData.children) {
            children = tocData.children
                .map(child => _resolveSettingsTree(child, allSettings, logService))
                .filter(child => child.children?.length || child.settings?.length);
        }
        let settings;
        if (tocData.settings) {
            settings = tocData.settings.map(pattern => getMatchingSettings(allSettings, pattern, logService)).flat();
        }
        if (!children && !settings) {
            throw new Error(`TOC node has no child groups or settings: ${tocData.id}`);
        }
        return {
            id: tocData.id,
            label: tocData.label,
            children,
            settings
        };
    }
    const knownDynamicSettingGroups = [
        /^settingsSync\..*/,
        /^sync\..*/,
        /^workbench.fontAliasing$/,
    ];
    function getMatchingSettings(allSettings, pattern, logService) {
        const result = [];
        allSettings.forEach(s => {
            if (settingMatches(s, pattern)) {
                result.push(s);
                allSettings.delete(s);
            }
        });
        if (!result.length && !knownDynamicSettingGroups.some(r => r.test(pattern))) {
            logService.warn(`Settings pattern "${pattern}" doesn't match any settings`);
        }
        return result.sort((a, b) => a.key.localeCompare(b.key));
    }
    const settingPatternCache = new Map();
    function createSettingMatchRegExp(pattern) {
        pattern = (0, strings_1.escapeRegExpCharacters)(pattern)
            .replace(/\\\*/g, '.*');
        return new RegExp(`^${pattern}$`, 'i');
    }
    exports.createSettingMatchRegExp = createSettingMatchRegExp;
    function settingMatches(s, pattern) {
        let regExp = settingPatternCache.get(pattern);
        if (!regExp) {
            regExp = createSettingMatchRegExp(pattern);
            settingPatternCache.set(pattern, regExp);
        }
        return regExp.test(s.key);
    }
    function getFlatSettings(settingsGroups) {
        const result = new Set();
        for (const group of settingsGroups) {
            for (const section of group.sections) {
                for (const s of section.settings) {
                    if (!s.overrides || !s.overrides.length) {
                        result.add(s);
                    }
                }
            }
        }
        return result;
    }
    const SETTINGS_TEXT_TEMPLATE_ID = 'settings.text.template';
    const SETTINGS_MULTILINE_TEXT_TEMPLATE_ID = 'settings.multilineText.template';
    const SETTINGS_NUMBER_TEMPLATE_ID = 'settings.number.template';
    const SETTINGS_ENUM_TEMPLATE_ID = 'settings.enum.template';
    const SETTINGS_BOOL_TEMPLATE_ID = 'settings.bool.template';
    const SETTINGS_ARRAY_TEMPLATE_ID = 'settings.array.template';
    const SETTINGS_EXCLUDE_TEMPLATE_ID = 'settings.exclude.template';
    const SETTINGS_INCLUDE_TEMPLATE_ID = 'settings.include.template';
    const SETTINGS_OBJECT_TEMPLATE_ID = 'settings.object.template';
    const SETTINGS_BOOL_OBJECT_TEMPLATE_ID = 'settings.boolObject.template';
    const SETTINGS_COMPLEX_TEMPLATE_ID = 'settings.complex.template';
    const SETTINGS_NEW_EXTENSIONS_TEMPLATE_ID = 'settings.newExtensions.template';
    const SETTINGS_ELEMENT_TEMPLATE_ID = 'settings.group.template';
    const SETTINGS_EXTENSION_TOGGLE_TEMPLATE_ID = 'settings.extensionToggle.template';
    function removeChildrenFromTabOrder(node) {
        const focusableElements = node.querySelectorAll(`
		[tabindex="0"],
		input:not([tabindex="-1"]),
		select:not([tabindex="-1"]),
		textarea:not([tabindex="-1"]),
		a:not([tabindex="-1"]),
		button:not([tabindex="-1"]),
		area:not([tabindex="-1"])
	`);
        focusableElements.forEach(element => {
            element.setAttribute(AbstractSettingRenderer.ELEMENT_FOCUSABLE_ATTR, 'true');
            element.setAttribute('tabindex', '-1');
        });
    }
    function addChildrenToTabOrder(node) {
        const focusableElements = node.querySelectorAll(`[${AbstractSettingRenderer.ELEMENT_FOCUSABLE_ATTR}="true"]`);
        focusableElements.forEach(element => {
            element.removeAttribute(AbstractSettingRenderer.ELEMENT_FOCUSABLE_ATTR);
            element.setAttribute('tabindex', '0');
        });
    }
    let AbstractSettingRenderer = class AbstractSettingRenderer extends lifecycle_1.Disposable {
        static { AbstractSettingRenderer_1 = this; }
        static { this.CONTROL_CLASS = 'setting-control-focus-target'; }
        static { this.CONTROL_SELECTOR = '.' + AbstractSettingRenderer_1.CONTROL_CLASS; }
        static { this.CONTENTS_CLASS = 'setting-item-contents'; }
        static { this.CONTENTS_SELECTOR = '.' + AbstractSettingRenderer_1.CONTENTS_CLASS; }
        static { this.ALL_ROWS_SELECTOR = '.monaco-list-row'; }
        static { this.SETTING_KEY_ATTR = 'data-key'; }
        static { this.SETTING_ID_ATTR = 'data-id'; }
        static { this.ELEMENT_FOCUSABLE_ATTR = 'data-focusable'; }
        constructor(settingActions, disposableActionFactory, _themeService, _contextViewService, _openerService, _instantiationService, _commandService, _contextMenuService, _keybindingService, _configService, _extensionsService, _extensionsWorkbenchService, _productService, _telemetryService) {
            super();
            this.settingActions = settingActions;
            this.disposableActionFactory = disposableActionFactory;
            this._themeService = _themeService;
            this._contextViewService = _contextViewService;
            this._openerService = _openerService;
            this._instantiationService = _instantiationService;
            this._commandService = _commandService;
            this._contextMenuService = _contextMenuService;
            this._keybindingService = _keybindingService;
            this._configService = _configService;
            this._extensionsService = _extensionsService;
            this._extensionsWorkbenchService = _extensionsWorkbenchService;
            this._productService = _productService;
            this._telemetryService = _telemetryService;
            this._onDidClickOverrideElement = this._register(new event_1.Emitter());
            this.onDidClickOverrideElement = this._onDidClickOverrideElement.event;
            this._onDidChangeSetting = this._register(new event_1.Emitter());
            this.onDidChangeSetting = this._onDidChangeSetting.event;
            this._onDidOpenSettings = this._register(new event_1.Emitter());
            this.onDidOpenSettings = this._onDidOpenSettings.event;
            this._onDidClickSettingLink = this._register(new event_1.Emitter());
            this.onDidClickSettingLink = this._onDidClickSettingLink.event;
            this._onDidFocusSetting = this._register(new event_1.Emitter());
            this.onDidFocusSetting = this._onDidFocusSetting.event;
            this._onDidChangeIgnoredSettings = this._register(new event_1.Emitter());
            this.onDidChangeIgnoredSettings = this._onDidChangeIgnoredSettings.event;
            this._onDidChangeSettingHeight = this._register(new event_1.Emitter());
            this.onDidChangeSettingHeight = this._onDidChangeSettingHeight.event;
            this._onApplyFilter = this._register(new event_1.Emitter());
            this.onApplyFilter = this._onApplyFilter.event;
            this.markdownRenderer = this._register(_instantiationService.createInstance(markdownRenderer_2.MarkdownRenderer, {}));
            this.ignoredSettings = (0, settingsMerge_1.getIgnoredSettings)((0, userDataSync_1.getDefaultIgnoredSettings)(), this._configService);
            this._register(this._configService.onDidChangeConfiguration(e => {
                this.ignoredSettings = (0, settingsMerge_1.getIgnoredSettings)((0, userDataSync_1.getDefaultIgnoredSettings)(), this._configService);
                this._onDidChangeIgnoredSettings.fire();
            }));
        }
        renderCommonTemplate(tree, _container, typeClass) {
            _container.classList.add('setting-item');
            _container.classList.add('setting-item-' + typeClass);
            const toDispose = new lifecycle_1.DisposableStore();
            const container = DOM.append(_container, $(AbstractSettingRenderer_1.CONTENTS_SELECTOR));
            container.classList.add('settings-row-inner-container');
            const titleElement = DOM.append(container, $('.setting-item-title'));
            const labelCategoryContainer = DOM.append(titleElement, $('.setting-item-cat-label-container'));
            const categoryElement = DOM.append(labelCategoryContainer, $('span.setting-item-category'));
            const labelElementContainer = DOM.append(labelCategoryContainer, $('span.setting-item-label'));
            const labelElement = new simpleIconLabel_1.SimpleIconLabel(labelElementContainer);
            const indicatorsLabel = this._instantiationService.createInstance(settingsEditorSettingIndicators_1.SettingsTreeIndicatorsLabel, titleElement);
            toDispose.add(indicatorsLabel);
            const descriptionElement = DOM.append(container, $('.setting-item-description'));
            const modifiedIndicatorElement = DOM.append(container, $('.setting-item-modified-indicator'));
            modifiedIndicatorElement.title = (0, nls_1.localize)('modified', "The setting has been configured in the current scope.");
            const valueElement = DOM.append(container, $('.setting-item-value'));
            const controlElement = DOM.append(valueElement, $('div.setting-item-control'));
            const deprecationWarningElement = DOM.append(container, $('.setting-item-deprecation-message'));
            const toolbarContainer = DOM.append(container, $('.setting-toolbar-container'));
            const toolbar = this.renderSettingToolbar(toolbarContainer);
            const template = {
                toDispose,
                elementDisposables: toDispose.add(new lifecycle_1.DisposableStore()),
                containerElement: container,
                categoryElement,
                labelElement,
                descriptionElement,
                controlElement,
                deprecationWarningElement,
                indicatorsLabel,
                toolbar
            };
            // Prevent clicks from being handled by list
            toDispose.add(DOM.addDisposableListener(controlElement, DOM.EventType.MOUSE_DOWN, e => e.stopPropagation()));
            toDispose.add(DOM.addDisposableListener(titleElement, DOM.EventType.MOUSE_ENTER, e => container.classList.add('mouseover')));
            toDispose.add(DOM.addDisposableListener(titleElement, DOM.EventType.MOUSE_LEAVE, e => container.classList.remove('mouseover')));
            return template;
        }
        addSettingElementFocusHandler(template) {
            const focusTracker = DOM.trackFocus(template.containerElement);
            template.toDispose.add(focusTracker);
            focusTracker.onDidBlur(() => {
                if (template.containerElement.classList.contains('focused')) {
                    template.containerElement.classList.remove('focused');
                }
            });
            focusTracker.onDidFocus(() => {
                template.containerElement.classList.add('focused');
                if (template.context) {
                    this._onDidFocusSetting.fire(template.context);
                }
            });
        }
        renderSettingToolbar(container) {
            const toggleMenuKeybinding = this._keybindingService.lookupKeybinding(preferences_1.SETTINGS_EDITOR_COMMAND_SHOW_CONTEXT_MENU);
            let toggleMenuTitle = (0, nls_1.localize)('settingsContextMenuTitle', "More Actions... ");
            if (toggleMenuKeybinding) {
                toggleMenuTitle += ` (${toggleMenuKeybinding && toggleMenuKeybinding.getLabel()})`;
            }
            const toolbar = new toolbar_1.ToolBar(container, this._contextMenuService, {
                toggleMenuTitle,
                renderDropdownAsChildElement: !platform_1.isIOS,
                moreIcon: preferencesIcons_1.settingsMoreActionIcon
            });
            return toolbar;
        }
        renderSettingElement(node, index, template) {
            const element = node.element;
            // The element must inspect itself to get information for
            // the modified indicator and the overridden Settings indicators.
            element.inspectSelf();
            template.context = element;
            template.toolbar.context = element;
            const actions = this.disposableActionFactory(element.setting, element.settingsTarget);
            actions.forEach(a => (0, lifecycle_1.isDisposable)(a) && template.elementDisposables.add(a));
            template.toolbar.setActions([], [...this.settingActions, ...actions]);
            const setting = element.setting;
            template.containerElement.classList.toggle('is-configured', element.isConfigured);
            template.containerElement.setAttribute(AbstractSettingRenderer_1.SETTING_KEY_ATTR, element.setting.key);
            template.containerElement.setAttribute(AbstractSettingRenderer_1.SETTING_ID_ATTR, element.id);
            const titleTooltip = setting.key + (element.isConfigured ? ' - Modified' : '');
            template.categoryElement.textContent = element.displayCategory ? (element.displayCategory + ': ') : '';
            template.categoryElement.title = titleTooltip;
            template.labelElement.text = element.displayLabel;
            template.labelElement.title = titleTooltip;
            template.descriptionElement.innerText = '';
            if (element.setting.descriptionIsMarkdown) {
                const renderedDescription = this.renderSettingMarkdown(element, template.containerElement, element.description, template.elementDisposables);
                template.descriptionElement.appendChild(renderedDescription);
            }
            else {
                template.descriptionElement.innerText = element.description;
            }
            template.indicatorsLabel.updateScopeOverrides(element, this._onDidClickOverrideElement, this._onApplyFilter);
            template.elementDisposables.add(this._configService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(configuration_2.APPLY_ALL_PROFILES_SETTING)) {
                    template.indicatorsLabel.updateScopeOverrides(element, this._onDidClickOverrideElement, this._onApplyFilter);
                }
            }));
            const onChange = (value) => this._onDidChangeSetting.fire({
                key: element.setting.key,
                value,
                type: template.context.valueType,
                manualReset: false,
                scope: element.setting.scope
            });
            const deprecationText = element.setting.deprecationMessage || '';
            if (deprecationText && element.setting.deprecationMessageIsMarkdown) {
                template.deprecationWarningElement.innerText = '';
                template.deprecationWarningElement.appendChild(this.renderSettingMarkdown(element, template.containerElement, element.setting.deprecationMessage, template.elementDisposables));
            }
            else {
                template.deprecationWarningElement.innerText = deprecationText;
            }
            template.deprecationWarningElement.prepend($('.codicon.codicon-error'));
            template.containerElement.classList.toggle('is-deprecated', !!deprecationText);
            this.renderValue(element, template, onChange);
            template.indicatorsLabel.updateWorkspaceTrust(element);
            template.indicatorsLabel.updateSyncIgnored(element, this.ignoredSettings);
            template.indicatorsLabel.updateDefaultOverrideIndicator(element);
            template.elementDisposables.add(this.onDidChangeIgnoredSettings(() => {
                template.indicatorsLabel.updateSyncIgnored(element, this.ignoredSettings);
            }));
            this.updateSettingTabbable(element, template);
            template.elementDisposables.add(element.onDidChangeTabbable(() => {
                this.updateSettingTabbable(element, template);
            }));
        }
        updateSettingTabbable(element, template) {
            if (element.tabbable) {
                addChildrenToTabOrder(template.containerElement);
            }
            else {
                removeChildrenFromTabOrder(template.containerElement);
            }
        }
        renderSettingMarkdown(element, container, text, disposables) {
            // Rewrite `#editor.fontSize#` to link format
            text = fixSettingLinks(text);
            const renderedMarkdown = this.markdownRenderer.render({ value: text, isTrusted: true }, {
                actionHandler: {
                    callback: (content) => {
                        if (content.startsWith('#')) {
                            const e = {
                                source: element,
                                targetKey: content.substring(1)
                            };
                            this._onDidClickSettingLink.fire(e);
                        }
                        else {
                            this._openerService.open(content, { allowCommands: true }).catch(errors_1.onUnexpectedError);
                        }
                    },
                    disposables
                },
                asyncRenderCallback: () => {
                    const height = container.clientHeight;
                    if (height) {
                        this._onDidChangeSettingHeight.fire({ element, height });
                    }
                },
            });
            disposables.add(renderedMarkdown);
            renderedMarkdown.element.classList.add('setting-item-markdown');
            cleanRenderedMarkdown(renderedMarkdown.element);
            return renderedMarkdown.element;
        }
        disposeTemplate(template) {
            template.toDispose.dispose();
        }
        disposeElement(_element, _index, template, _height) {
            template.elementDisposables?.clear();
        }
    };
    exports.AbstractSettingRenderer = AbstractSettingRenderer;
    exports.AbstractSettingRenderer = AbstractSettingRenderer = AbstractSettingRenderer_1 = __decorate([
        __param(2, themeService_1.IThemeService),
        __param(3, contextView_1.IContextViewService),
        __param(4, opener_1.IOpenerService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, commands_1.ICommandService),
        __param(7, contextView_1.IContextMenuService),
        __param(8, keybinding_1.IKeybindingService),
        __param(9, configuration_1.IConfigurationService),
        __param(10, extensions_2.IExtensionService),
        __param(11, extensions_1.IExtensionsWorkbenchService),
        __param(12, productService_1.IProductService),
        __param(13, telemetry_1.ITelemetryService)
    ], AbstractSettingRenderer);
    class SettingGroupRenderer {
        constructor() {
            this.templateId = SETTINGS_ELEMENT_TEMPLATE_ID;
        }
        renderTemplate(container) {
            container.classList.add('group-title');
            const template = {
                parent: container,
                toDispose: new lifecycle_1.DisposableStore()
            };
            return template;
        }
        renderElement(element, index, templateData) {
            templateData.parent.innerText = '';
            const labelElement = DOM.append(templateData.parent, $('div.settings-group-title-label.settings-row-inner-container'));
            labelElement.classList.add(`settings-group-level-${element.element.level}`);
            labelElement.textContent = element.element.label;
            if (element.element.isFirstGroup) {
                labelElement.classList.add('settings-group-first');
            }
        }
        disposeTemplate(templateData) {
        }
    }
    exports.SettingGroupRenderer = SettingGroupRenderer;
    let SettingNewExtensionsRenderer = class SettingNewExtensionsRenderer {
        constructor(_commandService) {
            this._commandService = _commandService;
            this.templateId = SETTINGS_NEW_EXTENSIONS_TEMPLATE_ID;
        }
        renderTemplate(container) {
            const toDispose = new lifecycle_1.DisposableStore();
            container.classList.add('setting-item-new-extensions');
            const button = new button_1.Button(container, { title: true, ...defaultStyles_1.defaultButtonStyles });
            toDispose.add(button);
            toDispose.add(button.onDidClick(() => {
                if (template.context) {
                    this._commandService.executeCommand('workbench.extensions.action.showExtensionsWithIds', template.context.extensionIds);
                }
            }));
            button.label = (0, nls_1.localize)('newExtensionsButtonLabel', "Show matching extensions");
            button.element.classList.add('settings-new-extensions-button');
            const template = {
                button,
                toDispose
            };
            return template;
        }
        renderElement(element, index, templateData) {
            templateData.context = element.element;
        }
        disposeTemplate(template) {
            (0, lifecycle_1.dispose)(template.toDispose);
        }
    };
    exports.SettingNewExtensionsRenderer = SettingNewExtensionsRenderer;
    exports.SettingNewExtensionsRenderer = SettingNewExtensionsRenderer = __decorate([
        __param(0, commands_1.ICommandService)
    ], SettingNewExtensionsRenderer);
    class SettingComplexRenderer extends AbstractSettingRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_COMPLEX_TEMPLATE_ID;
        }
        static { this.EDIT_IN_JSON_LABEL = (0, nls_1.localize)('editInSettingsJson', "Edit in settings.json"); }
        renderTemplate(container) {
            const common = this.renderCommonTemplate(null, container, 'complex');
            const openSettingsButton = DOM.append(common.controlElement, $('a.edit-in-settings-button'));
            openSettingsButton.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
            openSettingsButton.role = 'button';
            const validationErrorMessageElement = $('.setting-item-validation-message');
            common.containerElement.appendChild(validationErrorMessageElement);
            const template = {
                ...common,
                button: openSettingsButton,
                validationErrorMessageElement
            };
            this.addSettingElementFocusHandler(template);
            return template;
        }
        renderElement(element, index, templateData) {
            super.renderSettingElement(element, index, templateData);
        }
        renderValue(dataElement, template, onChange) {
            const plainKey = (0, configuration_1.getLanguageTagSettingPlainKey)(dataElement.setting.key);
            const editLanguageSettingLabel = (0, nls_1.localize)('editLanguageSettingLabel', "Edit settings for {0}", plainKey);
            const isLanguageTagSetting = dataElement.setting.isLanguageTagSetting;
            template.button.textContent = isLanguageTagSetting
                ? editLanguageSettingLabel
                : SettingComplexRenderer.EDIT_IN_JSON_LABEL;
            const onClickOrKeydown = (e) => {
                if (isLanguageTagSetting) {
                    this._onApplyFilter.fire(`@${preferences_1.LANGUAGE_SETTING_TAG}${plainKey}`);
                }
                else {
                    this._onDidOpenSettings.fire(dataElement.setting.key);
                }
                e.preventDefault();
                e.stopPropagation();
            };
            template.elementDisposables.add(DOM.addDisposableListener(template.button, DOM.EventType.CLICK, (e) => {
                onClickOrKeydown(e);
            }));
            template.elementDisposables.add(DOM.addDisposableListener(template.button, DOM.EventType.KEY_DOWN, (e) => {
                const ev = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (ev.equals(10 /* KeyCode.Space */) || ev.equals(3 /* KeyCode.Enter */)) {
                    onClickOrKeydown(e);
                }
            }));
            this.renderValidations(dataElement, template);
            if (isLanguageTagSetting) {
                template.button.setAttribute('aria-label', editLanguageSettingLabel);
            }
            else {
                template.button.setAttribute('aria-label', `${SettingComplexRenderer.EDIT_IN_JSON_LABEL}: ${dataElement.setting.key}`);
            }
        }
        renderValidations(dataElement, template) {
            const errMsg = dataElement.isConfigured && (0, preferencesValidation_1.getInvalidTypeError)(dataElement.value, dataElement.setting.type);
            if (errMsg) {
                template.containerElement.classList.add('invalid-input');
                template.validationErrorMessageElement.innerText = errMsg;
                return;
            }
            template.containerElement.classList.remove('invalid-input');
        }
    }
    exports.SettingComplexRenderer = SettingComplexRenderer;
    class SettingArrayRenderer extends AbstractSettingRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_ARRAY_TEMPLATE_ID;
        }
        renderTemplate(container) {
            const common = this.renderCommonTemplate(null, container, 'list');
            const descriptionElement = common.containerElement.querySelector('.setting-item-description');
            const validationErrorMessageElement = $('.setting-item-validation-message');
            descriptionElement.after(validationErrorMessageElement);
            const listWidget = this._instantiationService.createInstance(settingsWidgets_1.ListSettingWidget, common.controlElement);
            listWidget.domNode.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
            common.toDispose.add(listWidget);
            const template = {
                ...common,
                listWidget,
                validationErrorMessageElement
            };
            this.addSettingElementFocusHandler(template);
            common.toDispose.add(listWidget.onDidChangeList(e => {
                const newList = this.computeNewList(template, e);
                template.onChange?.(newList);
            }));
            return template;
        }
        computeNewList(template, e) {
            if (template.context) {
                let newValue = [];
                if (Array.isArray(template.context.scopeValue)) {
                    newValue = [...template.context.scopeValue];
                }
                else if (Array.isArray(template.context.value)) {
                    newValue = [...template.context.value];
                }
                if (e.sourceIndex !== undefined) {
                    // A drag and drop occurred
                    const sourceIndex = e.sourceIndex;
                    const targetIndex = e.targetIndex;
                    const splicedElem = newValue.splice(sourceIndex, 1)[0];
                    newValue.splice(targetIndex, 0, splicedElem);
                }
                else if (e.targetIndex !== undefined) {
                    const itemValueData = e.item?.value.data.toString() ?? '';
                    // Delete value
                    if (!e.item?.value.data && e.originalItem.value.data && e.targetIndex > -1) {
                        newValue.splice(e.targetIndex, 1);
                    }
                    // Update value
                    else if (e.item?.value.data && e.originalItem.value.data) {
                        if (e.targetIndex > -1) {
                            newValue[e.targetIndex] = itemValueData;
                        }
                        // For some reason, we are updating and cannot find original value
                        // Just append the value in this case
                        else {
                            newValue.push(itemValueData);
                        }
                    }
                    // Add value
                    else if (e.item?.value.data && !e.originalItem.value.data && e.targetIndex >= newValue.length) {
                        newValue.push(itemValueData);
                    }
                }
                if (template.context.defaultValue &&
                    Array.isArray(template.context.defaultValue) &&
                    template.context.defaultValue.length === newValue.length &&
                    template.context.defaultValue.join() === newValue.join()) {
                    return undefined;
                }
                return newValue;
            }
            return undefined;
        }
        renderElement(element, index, templateData) {
            super.renderSettingElement(element, index, templateData);
        }
        renderValue(dataElement, template, onChange) {
            const value = getListDisplayValue(dataElement);
            const keySuggester = dataElement.setting.enum ? createArraySuggester(dataElement) : undefined;
            template.listWidget.setValue(value, {
                showAddButton: getShowAddButtonList(dataElement, value),
                keySuggester
            });
            template.context = dataElement;
            template.elementDisposables.add((0, lifecycle_1.toDisposable)(() => {
                template.listWidget.cancelEdit();
            }));
            template.onChange = (v) => {
                if (v && !renderArrayValidations(dataElement, template, v, false)) {
                    const itemType = dataElement.setting.arrayItemType;
                    const arrToSave = isNonNullableNumericType(itemType) ? v.map(a => +a) : v;
                    onChange(arrToSave);
                }
                else {
                    // Save the setting unparsed and containing the errors.
                    // renderArrayValidations will render relevant error messages.
                    onChange(v);
                }
            };
            renderArrayValidations(dataElement, template, value.map(v => v.value.data.toString()), true);
        }
    }
    class AbstractSettingObjectRenderer extends AbstractSettingRenderer {
        renderTemplateWithWidget(common, widget) {
            widget.domNode.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
            common.toDispose.add(widget);
            const descriptionElement = common.containerElement.querySelector('.setting-item-description');
            const validationErrorMessageElement = $('.setting-item-validation-message');
            descriptionElement.after(validationErrorMessageElement);
            const template = {
                ...common,
                validationErrorMessageElement
            };
            if (widget instanceof settingsWidgets_1.ObjectSettingCheckboxWidget) {
                template.objectCheckboxWidget = widget;
            }
            else {
                template.objectDropdownWidget = widget;
            }
            this.addSettingElementFocusHandler(template);
            common.toDispose.add(widget.onDidChangeList(e => {
                this.onDidChangeObject(template, e);
            }));
            return template;
        }
        onDidChangeObject(template, e) {
            const widget = (template.objectCheckboxWidget ?? template.objectDropdownWidget);
            if (template.context) {
                const defaultValue = typeof template.context.defaultValue === 'object'
                    ? template.context.defaultValue ?? {}
                    : {};
                const scopeValue = typeof template.context.scopeValue === 'object'
                    ? template.context.scopeValue ?? {}
                    : {};
                const newValue = {};
                const newItems = [];
                widget.items.forEach((item, idx) => {
                    // Item was updated
                    if ((0, types_1.isDefined)(e.item) && e.targetIndex === idx) {
                        newValue[e.item.key.data] = e.item.value.data;
                        newItems.push(e.item);
                    }
                    // All remaining items, but skip the one that we just updated
                    else if ((0, types_1.isUndefinedOrNull)(e.item) || e.item.key.data !== item.key.data) {
                        newValue[item.key.data] = item.value.data;
                        newItems.push(item);
                    }
                });
                // Item was deleted
                if ((0, types_1.isUndefinedOrNull)(e.item)) {
                    delete newValue[e.originalItem.key.data];
                    const itemToDelete = newItems.findIndex(item => item.key.data === e.originalItem.key.data);
                    const defaultItemValue = defaultValue[e.originalItem.key.data];
                    // Item does not have a default
                    if ((0, types_1.isUndefinedOrNull)(defaultValue[e.originalItem.key.data]) && itemToDelete > -1) {
                        newItems.splice(itemToDelete, 1);
                    }
                    else if (itemToDelete > -1) {
                        newItems[itemToDelete].value.data = defaultItemValue;
                    }
                }
                // New item was added
                else if (widget.isItemNew(e.originalItem) && e.item.key.data !== '') {
                    newValue[e.item.key.data] = e.item.value.data;
                    newItems.push(e.item);
                }
                Object.entries(newValue).forEach(([key, value]) => {
                    // value from the scope has changed back to the default
                    if (scopeValue[key] !== value && defaultValue[key] === value) {
                        delete newValue[key];
                    }
                });
                const newObject = Object.keys(newValue).length === 0 ? undefined : newValue;
                if (template.objectCheckboxWidget) {
                    template.objectCheckboxWidget.setValue(newItems);
                }
                else {
                    template.objectDropdownWidget.setValue(newItems);
                }
                template.onChange?.(newObject);
            }
        }
        renderElement(element, index, templateData) {
            super.renderSettingElement(element, index, templateData);
        }
    }
    class SettingObjectRenderer extends AbstractSettingObjectRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_OBJECT_TEMPLATE_ID;
        }
        renderTemplate(container) {
            const common = this.renderCommonTemplate(null, container, 'list');
            const widget = this._instantiationService.createInstance(settingsWidgets_1.ObjectSettingDropdownWidget, common.controlElement);
            return this.renderTemplateWithWidget(common, widget);
        }
        renderValue(dataElement, template, onChange) {
            const items = getObjectDisplayValue(dataElement);
            const { key, objectProperties, objectPatternProperties, objectAdditionalProperties } = dataElement.setting;
            template.objectDropdownWidget.setValue(items, {
                settingKey: key,
                showAddButton: objectAdditionalProperties === false
                    ? (!areAllPropertiesDefined(Object.keys(objectProperties ?? {}), items) ||
                        (0, types_1.isDefined)(objectPatternProperties))
                    : true,
                keySuggester: createObjectKeySuggester(dataElement),
                valueSuggester: createObjectValueSuggester(dataElement)
            });
            template.context = dataElement;
            template.elementDisposables.add((0, lifecycle_1.toDisposable)(() => {
                template.objectDropdownWidget.cancelEdit();
            }));
            template.onChange = (v) => {
                if (v && !renderArrayValidations(dataElement, template, v, false)) {
                    const parsedRecord = parseNumericObjectValues(dataElement, v);
                    onChange(parsedRecord);
                }
                else {
                    // Save the setting unparsed and containing the errors.
                    // renderArrayValidations will render relevant error messages.
                    onChange(v);
                }
            };
            renderArrayValidations(dataElement, template, dataElement.value, true);
        }
    }
    class SettingBoolObjectRenderer extends AbstractSettingObjectRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_BOOL_OBJECT_TEMPLATE_ID;
        }
        renderTemplate(container) {
            const common = this.renderCommonTemplate(null, container, 'list');
            const widget = this._instantiationService.createInstance(settingsWidgets_1.ObjectSettingCheckboxWidget, common.controlElement);
            return this.renderTemplateWithWidget(common, widget);
        }
        onDidChangeObject(template, e) {
            if (template.context) {
                super.onDidChangeObject(template, e);
                // Focus this setting explicitly, in case we were previously
                // focused on another setting and clicked a checkbox/value container
                // for this setting.
                this._onDidFocusSetting.fire(template.context);
            }
        }
        renderValue(dataElement, template, onChange) {
            const items = getObjectDisplayValue(dataElement);
            const { key } = dataElement.setting;
            template.objectCheckboxWidget.setValue(items, {
                settingKey: key
            });
            template.context = dataElement;
            template.onChange = (v) => {
                onChange(v);
            };
        }
    }
    class SettingIncludeExcludeRenderer extends AbstractSettingRenderer {
        renderTemplate(container) {
            const common = this.renderCommonTemplate(null, container, 'list');
            const includeExcludeWidget = this._instantiationService.createInstance(this.isExclude() ? settingsWidgets_1.ExcludeSettingWidget : settingsWidgets_1.IncludeSettingWidget, common.controlElement);
            includeExcludeWidget.domNode.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
            common.toDispose.add(includeExcludeWidget);
            const template = {
                ...common,
                includeExcludeWidget
            };
            this.addSettingElementFocusHandler(template);
            common.toDispose.add(includeExcludeWidget.onDidChangeList(e => this.onDidChangeIncludeExclude(template, e)));
            return template;
        }
        onDidChangeIncludeExclude(template, e) {
            if (template.context) {
                const newValue = { ...template.context.scopeValue };
                // first delete the existing entry, if present
                if (e.originalItem.value.data.toString() in template.context.defaultValue) {
                    // delete a default by overriding it
                    newValue[e.originalItem.value.data.toString()] = false;
                }
                else {
                    delete newValue[e.originalItem.value.data.toString()];
                }
                // then add the new or updated entry, if present
                if (e.item?.value) {
                    if (e.item.value.data.toString() in template.context.defaultValue && !e.item.sibling) {
                        // add a default by deleting its override
                        delete newValue[e.item.value.data.toString()];
                    }
                    else {
                        newValue[e.item.value.data.toString()] = e.item.sibling ? { when: e.item.sibling } : true;
                    }
                }
                function sortKeys(obj) {
                    const sortedKeys = Object.keys(obj)
                        .sort((a, b) => a.localeCompare(b));
                    const retVal = {};
                    for (const key of sortedKeys) {
                        retVal[key] = obj[key];
                    }
                    return retVal;
                }
                this._onDidChangeSetting.fire({
                    key: template.context.setting.key,
                    value: Object.keys(newValue).length === 0 ? undefined : sortKeys(newValue),
                    type: template.context.valueType,
                    manualReset: false,
                    scope: template.context.setting.scope
                });
            }
        }
        renderElement(element, index, templateData) {
            super.renderSettingElement(element, index, templateData);
        }
        renderValue(dataElement, template, onChange) {
            const value = getIncludeExcludeDisplayValue(dataElement);
            template.includeExcludeWidget.setValue(value);
            template.context = dataElement;
            template.elementDisposables.add((0, lifecycle_1.toDisposable)(() => {
                template.includeExcludeWidget.cancelEdit();
            }));
        }
    }
    class SettingExcludeRenderer extends SettingIncludeExcludeRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_EXCLUDE_TEMPLATE_ID;
        }
        isExclude() {
            return true;
        }
    }
    exports.SettingExcludeRenderer = SettingExcludeRenderer;
    class SettingIncludeRenderer extends SettingIncludeExcludeRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_INCLUDE_TEMPLATE_ID;
        }
        isExclude() {
            return false;
        }
    }
    exports.SettingIncludeRenderer = SettingIncludeRenderer;
    const settingsInputBoxStyles = (0, defaultStyles_1.getInputBoxStyle)({
        inputBackground: settingsEditorColorRegistry_1.settingsTextInputBackground,
        inputForeground: settingsEditorColorRegistry_1.settingsTextInputForeground,
        inputBorder: settingsEditorColorRegistry_1.settingsTextInputBorder
    });
    class AbstractSettingTextRenderer extends AbstractSettingRenderer {
        constructor() {
            super(...arguments);
            this.MULTILINE_MAX_HEIGHT = 150;
        }
        renderTemplate(_container, useMultiline) {
            const common = this.renderCommonTemplate(null, _container, 'text');
            const validationErrorMessageElement = DOM.append(common.containerElement, $('.setting-item-validation-message'));
            const inputBoxOptions = {
                flexibleHeight: useMultiline,
                flexibleWidth: false,
                flexibleMaxHeight: this.MULTILINE_MAX_HEIGHT,
                inputBoxStyles: settingsInputBoxStyles
            };
            const inputBox = new inputBox_1.InputBox(common.controlElement, this._contextViewService, inputBoxOptions);
            common.toDispose.add(inputBox);
            common.toDispose.add(inputBox.onDidChange(e => {
                template.onChange?.(e);
            }));
            common.toDispose.add(inputBox);
            inputBox.inputElement.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
            inputBox.inputElement.tabIndex = 0;
            const template = {
                ...common,
                inputBox,
                validationErrorMessageElement
            };
            this.addSettingElementFocusHandler(template);
            return template;
        }
        renderElement(element, index, templateData) {
            super.renderSettingElement(element, index, templateData);
        }
        renderValue(dataElement, template, onChange) {
            template.onChange = undefined;
            template.inputBox.value = dataElement.value;
            template.inputBox.setAriaLabel(dataElement.setting.key);
            template.onChange = value => {
                if (!renderValidations(dataElement, template, false)) {
                    onChange(value);
                }
            };
            renderValidations(dataElement, template, true);
        }
    }
    class SettingTextRenderer extends AbstractSettingTextRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_TEXT_TEMPLATE_ID;
        }
        renderTemplate(_container) {
            const template = super.renderTemplate(_container, false);
            // TODO@9at8: listWidget filters out all key events from input boxes, so we need to come up with a better way
            // Disable ArrowUp and ArrowDown behaviour in favor of list navigation
            template.toDispose.add(DOM.addStandardDisposableListener(template.inputBox.inputElement, DOM.EventType.KEY_DOWN, e => {
                if (e.equals(16 /* KeyCode.UpArrow */) || e.equals(18 /* KeyCode.DownArrow */)) {
                    e.preventDefault();
                }
            }));
            return template;
        }
    }
    class SettingMultilineTextRenderer extends AbstractSettingTextRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_MULTILINE_TEXT_TEMPLATE_ID;
        }
        renderTemplate(_container) {
            return super.renderTemplate(_container, true);
        }
        renderValue(dataElement, template, onChange) {
            const onChangeOverride = (value) => {
                // Ensure the model is up to date since a different value will be rendered as different height when probing the height.
                dataElement.value = value;
                onChange(value);
            };
            super.renderValue(dataElement, template, onChangeOverride);
            template.elementDisposables.add(template.inputBox.onDidHeightChange(e => {
                const height = template.containerElement.clientHeight;
                // Don't fire event if height is reported as 0,
                // which sometimes happens when clicking onto a new setting.
                if (height) {
                    this._onDidChangeSettingHeight.fire({
                        element: dataElement,
                        height: template.containerElement.clientHeight
                    });
                }
            }));
            template.inputBox.layout();
        }
    }
    class SettingEnumRenderer extends AbstractSettingRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_ENUM_TEMPLATE_ID;
        }
        renderTemplate(container) {
            const common = this.renderCommonTemplate(null, container, 'enum');
            const styles = (0, defaultStyles_1.getSelectBoxStyles)({
                selectBackground: settingsEditorColorRegistry_1.settingsSelectBackground,
                selectForeground: settingsEditorColorRegistry_1.settingsSelectForeground,
                selectBorder: settingsEditorColorRegistry_1.settingsSelectBorder,
                selectListBorder: settingsEditorColorRegistry_1.settingsSelectListBorder
            });
            const selectBox = new selectBox_1.SelectBox([], 0, this._contextViewService, styles, {
                useCustomDrawn: !(platform_1.isIOS && canIUse_1.BrowserFeatures.pointerEvents)
            });
            common.toDispose.add(selectBox);
            selectBox.render(common.controlElement);
            const selectElement = common.controlElement.querySelector('select');
            if (selectElement) {
                selectElement.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
                selectElement.tabIndex = 0;
            }
            common.toDispose.add(selectBox.onDidSelect(e => {
                template.onChange?.(e.index);
            }));
            const enumDescriptionElement = common.containerElement.insertBefore($('.setting-item-enumDescription'), common.descriptionElement.nextSibling);
            const template = {
                ...common,
                selectBox,
                selectElement,
                enumDescriptionElement
            };
            this.addSettingElementFocusHandler(template);
            return template;
        }
        renderElement(element, index, templateData) {
            super.renderSettingElement(element, index, templateData);
        }
        renderValue(dataElement, template, onChange) {
            // Make shallow copies here so that we don't modify the actual dataElement later
            const enumItemLabels = dataElement.setting.enumItemLabels ? [...dataElement.setting.enumItemLabels] : [];
            const enumDescriptions = dataElement.setting.enumDescriptions ? [...dataElement.setting.enumDescriptions] : [];
            const settingEnum = [...dataElement.setting.enum];
            const enumDescriptionsAreMarkdown = dataElement.setting.enumDescriptionsAreMarkdown;
            const disposables = new lifecycle_1.DisposableStore();
            template.toDispose.add(disposables);
            let createdDefault = false;
            if (!settingEnum.includes(dataElement.defaultValue)) {
                // Add a new potentially blank default setting
                settingEnum.unshift(dataElement.defaultValue);
                enumDescriptions.unshift('');
                enumItemLabels.unshift('');
                createdDefault = true;
            }
            // Use String constructor in case of null or undefined values
            const stringifiedDefaultValue = escapeInvisibleChars(String(dataElement.defaultValue));
            const displayOptions = settingEnum
                .map(String)
                .map(escapeInvisibleChars)
                .map((data, index) => {
                const description = (enumDescriptions[index] && (enumDescriptionsAreMarkdown ? fixSettingLinks(enumDescriptions[index], false) : enumDescriptions[index]));
                return {
                    text: enumItemLabels[index] ? enumItemLabels[index] : data,
                    detail: enumItemLabels[index] ? data : '',
                    description,
                    descriptionIsMarkdown: enumDescriptionsAreMarkdown,
                    descriptionMarkdownActionHandler: {
                        callback: (content) => {
                            this._openerService.open(content).catch(errors_1.onUnexpectedError);
                        },
                        disposables: disposables
                    },
                    decoratorRight: (((data === stringifiedDefaultValue) || (createdDefault && index === 0)) ? (0, nls_1.localize)('settings.Default', "default") : '')
                };
            });
            template.selectBox.setOptions(displayOptions);
            template.selectBox.setAriaLabel(dataElement.setting.key);
            let idx = settingEnum.indexOf(dataElement.value);
            if (idx === -1) {
                idx = 0;
            }
            template.onChange = undefined;
            template.selectBox.select(idx);
            template.onChange = (idx) => {
                if (createdDefault && idx === 0) {
                    onChange(dataElement.defaultValue);
                }
                else {
                    onChange(settingEnum[idx]);
                }
            };
            template.enumDescriptionElement.innerText = '';
        }
    }
    exports.SettingEnumRenderer = SettingEnumRenderer;
    const settingsNumberInputBoxStyles = (0, defaultStyles_1.getInputBoxStyle)({
        inputBackground: settingsEditorColorRegistry_1.settingsNumberInputBackground,
        inputForeground: settingsEditorColorRegistry_1.settingsNumberInputForeground,
        inputBorder: settingsEditorColorRegistry_1.settingsNumberInputBorder
    });
    class SettingNumberRenderer extends AbstractSettingRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_NUMBER_TEMPLATE_ID;
        }
        renderTemplate(_container) {
            const common = super.renderCommonTemplate(null, _container, 'number');
            const validationErrorMessageElement = DOM.append(common.containerElement, $('.setting-item-validation-message'));
            const inputBox = new inputBox_1.InputBox(common.controlElement, this._contextViewService, { type: 'number', inputBoxStyles: settingsNumberInputBoxStyles });
            common.toDispose.add(inputBox);
            common.toDispose.add(inputBox.onDidChange(e => {
                template.onChange?.(e);
            }));
            common.toDispose.add(inputBox);
            inputBox.inputElement.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
            inputBox.inputElement.tabIndex = 0;
            const template = {
                ...common,
                inputBox,
                validationErrorMessageElement
            };
            this.addSettingElementFocusHandler(template);
            return template;
        }
        renderElement(element, index, templateData) {
            super.renderSettingElement(element, index, templateData);
        }
        renderValue(dataElement, template, onChange) {
            const numParseFn = (dataElement.valueType === 'integer' || dataElement.valueType === 'nullable-integer')
                ? parseInt : parseFloat;
            const nullNumParseFn = (dataElement.valueType === 'nullable-integer' || dataElement.valueType === 'nullable-number')
                ? ((v) => v === '' ? null : numParseFn(v)) : numParseFn;
            template.onChange = undefined;
            template.inputBox.value = typeof dataElement.value === 'number' ?
                dataElement.value.toString() : '';
            template.inputBox.step = dataElement.valueType.includes('integer') ? '1' : 'any';
            template.inputBox.setAriaLabel(dataElement.setting.key);
            template.onChange = value => {
                if (!renderValidations(dataElement, template, false)) {
                    onChange(nullNumParseFn(value));
                }
            };
            renderValidations(dataElement, template, true);
        }
    }
    exports.SettingNumberRenderer = SettingNumberRenderer;
    class SettingBoolRenderer extends AbstractSettingRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_BOOL_TEMPLATE_ID;
        }
        renderTemplate(_container) {
            _container.classList.add('setting-item');
            _container.classList.add('setting-item-bool');
            const container = DOM.append(_container, $(AbstractSettingRenderer.CONTENTS_SELECTOR));
            container.classList.add('settings-row-inner-container');
            const titleElement = DOM.append(container, $('.setting-item-title'));
            const categoryElement = DOM.append(titleElement, $('span.setting-item-category'));
            const labelElementContainer = DOM.append(titleElement, $('span.setting-item-label'));
            const labelElement = new simpleIconLabel_1.SimpleIconLabel(labelElementContainer);
            const indicatorsLabel = this._instantiationService.createInstance(settingsEditorSettingIndicators_1.SettingsTreeIndicatorsLabel, titleElement);
            const descriptionAndValueElement = DOM.append(container, $('.setting-item-value-description'));
            const controlElement = DOM.append(descriptionAndValueElement, $('.setting-item-bool-control'));
            const descriptionElement = DOM.append(descriptionAndValueElement, $('.setting-item-description'));
            const modifiedIndicatorElement = DOM.append(container, $('.setting-item-modified-indicator'));
            modifiedIndicatorElement.title = (0, nls_1.localize)('modified', "The setting has been configured in the current scope.");
            const deprecationWarningElement = DOM.append(container, $('.setting-item-deprecation-message'));
            const toDispose = new lifecycle_1.DisposableStore();
            const checkbox = new toggle_1.Toggle({ icon: codicons_1.Codicon.check, actionClassName: 'setting-value-checkbox', isChecked: true, title: '', ...toggle_1.unthemedToggleStyles });
            controlElement.appendChild(checkbox.domNode);
            toDispose.add(checkbox);
            toDispose.add(checkbox.onChange(() => {
                template.onChange(checkbox.checked);
            }));
            // Need to listen for mouse clicks on description and toggle checkbox - use target ID for safety
            // Also have to ignore embedded links - too buried to stop propagation
            toDispose.add(DOM.addDisposableListener(descriptionElement, DOM.EventType.MOUSE_DOWN, (e) => {
                const targetElement = e.target;
                // Toggle target checkbox
                if (targetElement.tagName.toLowerCase() !== 'a') {
                    template.checkbox.checked = !template.checkbox.checked;
                    template.onChange(checkbox.checked);
                }
                DOM.EventHelper.stop(e);
            }));
            checkbox.domNode.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
            const toolbarContainer = DOM.append(container, $('.setting-toolbar-container'));
            const toolbar = this.renderSettingToolbar(toolbarContainer);
            toDispose.add(toolbar);
            const template = {
                toDispose,
                elementDisposables: toDispose.add(new lifecycle_1.DisposableStore()),
                containerElement: container,
                categoryElement,
                labelElement,
                controlElement,
                checkbox,
                descriptionElement,
                deprecationWarningElement,
                indicatorsLabel,
                toolbar
            };
            this.addSettingElementFocusHandler(template);
            // Prevent clicks from being handled by list
            toDispose.add(DOM.addDisposableListener(controlElement, 'mousedown', (e) => e.stopPropagation()));
            toDispose.add(DOM.addDisposableListener(titleElement, DOM.EventType.MOUSE_ENTER, e => container.classList.add('mouseover')));
            toDispose.add(DOM.addDisposableListener(titleElement, DOM.EventType.MOUSE_LEAVE, e => container.classList.remove('mouseover')));
            return template;
        }
        renderElement(element, index, templateData) {
            super.renderSettingElement(element, index, templateData);
        }
        renderValue(dataElement, template, onChange) {
            template.onChange = undefined;
            template.checkbox.checked = dataElement.value;
            template.checkbox.setTitle(dataElement.setting.key);
            template.onChange = onChange;
        }
    }
    exports.SettingBoolRenderer = SettingBoolRenderer;
    class SettingsExtensionToggleRenderer extends AbstractSettingRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_EXTENSION_TOGGLE_TEMPLATE_ID;
        }
        renderTemplate(_container) {
            const common = super.renderCommonTemplate(null, _container, 'extension-toggle');
            const actionButton = new button_1.Button(common.containerElement, {
                title: false,
                ...defaultStyles_1.defaultButtonStyles
            });
            actionButton.element.classList.add('setting-item-extension-toggle-button');
            actionButton.label = (0, nls_1.localize)('showExtension', "Show Extension");
            const template = {
                ...common,
                actionButton
            };
            this.addSettingElementFocusHandler(template);
            return template;
        }
        renderElement(element, index, templateData) {
            super.renderSettingElement(element, index, templateData);
        }
        renderValue(dataElement, template, onChange) {
            template.elementDisposables.clear();
            const extensionId = dataElement.setting.displayExtensionId;
            template.elementDisposables.add(template.actionButton.onDidClick(async () => {
                this._telemetryService.publicLog2('ManageExtensionClick', { extensionId });
                this._commandService.executeCommand('extension.open', extensionId);
            }));
        }
    }
    exports.SettingsExtensionToggleRenderer = SettingsExtensionToggleRenderer;
    let SettingTreeRenderers = class SettingTreeRenderers {
        constructor(_instantiationService, _contextMenuService, _contextViewService, _userDataProfilesService, _userDataSyncEnablementService) {
            this._instantiationService = _instantiationService;
            this._contextMenuService = _contextMenuService;
            this._contextViewService = _contextViewService;
            this._userDataProfilesService = _userDataProfilesService;
            this._userDataSyncEnablementService = _userDataSyncEnablementService;
            this._onDidChangeSetting = new event_1.Emitter();
            this.settingActions = [
                new actions_1.Action('settings.resetSetting', (0, nls_1.localize)('resetSettingLabel', "Reset Setting"), undefined, undefined, async (context) => {
                    if (context instanceof settingsTreeModels_1.SettingsTreeSettingElement) {
                        if (!context.isUntrusted) {
                            this._onDidChangeSetting.fire({
                                key: context.setting.key,
                                value: undefined,
                                type: context.setting.type,
                                manualReset: true,
                                scope: context.setting.scope
                            });
                        }
                    }
                }),
                new actions_1.Separator(),
                this._instantiationService.createInstance(CopySettingIdAction),
                this._instantiationService.createInstance(CopySettingAsJSONAction),
            ];
            const actionFactory = (setting, settingTarget) => this.getActionsForSetting(setting, settingTarget);
            const emptyActionFactory = (_) => [];
            const settingRenderers = [
                this._instantiationService.createInstance(SettingBoolRenderer, this.settingActions, actionFactory),
                this._instantiationService.createInstance(SettingNumberRenderer, this.settingActions, actionFactory),
                this._instantiationService.createInstance(SettingArrayRenderer, this.settingActions, actionFactory),
                this._instantiationService.createInstance(SettingComplexRenderer, this.settingActions, actionFactory),
                this._instantiationService.createInstance(SettingTextRenderer, this.settingActions, actionFactory),
                this._instantiationService.createInstance(SettingMultilineTextRenderer, this.settingActions, actionFactory),
                this._instantiationService.createInstance(SettingExcludeRenderer, this.settingActions, actionFactory),
                this._instantiationService.createInstance(SettingIncludeRenderer, this.settingActions, actionFactory),
                this._instantiationService.createInstance(SettingEnumRenderer, this.settingActions, actionFactory),
                this._instantiationService.createInstance(SettingObjectRenderer, this.settingActions, actionFactory),
                this._instantiationService.createInstance(SettingBoolObjectRenderer, this.settingActions, actionFactory),
                this._instantiationService.createInstance(SettingsExtensionToggleRenderer, [], emptyActionFactory)
            ];
            this.onDidClickOverrideElement = event_1.Event.any(...settingRenderers.map(r => r.onDidClickOverrideElement));
            this.onDidChangeSetting = event_1.Event.any(...settingRenderers.map(r => r.onDidChangeSetting), this._onDidChangeSetting.event);
            this.onDidOpenSettings = event_1.Event.any(...settingRenderers.map(r => r.onDidOpenSettings));
            this.onDidClickSettingLink = event_1.Event.any(...settingRenderers.map(r => r.onDidClickSettingLink));
            this.onDidFocusSetting = event_1.Event.any(...settingRenderers.map(r => r.onDidFocusSetting));
            this.onDidChangeSettingHeight = event_1.Event.any(...settingRenderers.map(r => r.onDidChangeSettingHeight));
            this.onApplyFilter = event_1.Event.any(...settingRenderers.map(r => r.onApplyFilter));
            this.allRenderers = [
                ...settingRenderers,
                this._instantiationService.createInstance(SettingGroupRenderer),
                this._instantiationService.createInstance(SettingNewExtensionsRenderer),
            ];
        }
        getActionsForSetting(setting, settingTarget) {
            const actions = [];
            if (this._userDataProfilesService.isEnabled() && setting.scope !== 1 /* ConfigurationScope.APPLICATION */ && settingTarget === 3 /* ConfigurationTarget.USER_LOCAL */) {
                actions.push(this._instantiationService.createInstance(ApplySettingToAllProfilesAction, setting));
            }
            if (this._userDataSyncEnablementService.isEnabled() && !setting.disallowSyncIgnore) {
                actions.push(this._instantiationService.createInstance(SyncSettingAction, setting));
            }
            if (actions.length) {
                actions.splice(0, 0, new actions_1.Separator());
            }
            return actions;
        }
        cancelSuggesters() {
            this._contextViewService.hideContextView();
        }
        showContextMenu(element, settingDOMElement) {
            const toolbarElement = settingDOMElement.querySelector('.monaco-toolbar');
            if (toolbarElement) {
                this._contextMenuService.showContextMenu({
                    getActions: () => this.settingActions,
                    getAnchor: () => toolbarElement,
                    getActionsContext: () => element
                });
            }
        }
        getSettingDOMElementForDOMElement(domElement) {
            const parent = DOM.findParentWithClass(domElement, AbstractSettingRenderer.CONTENTS_CLASS);
            if (parent) {
                return parent;
            }
            return null;
        }
        getDOMElementsForSettingKey(treeContainer, key) {
            return treeContainer.querySelectorAll(`[${AbstractSettingRenderer.SETTING_KEY_ATTR}="${key}"]`);
        }
        getKeyForDOMElementInSetting(element) {
            const settingElement = this.getSettingDOMElementForDOMElement(element);
            return settingElement && settingElement.getAttribute(AbstractSettingRenderer.SETTING_KEY_ATTR);
        }
        getIdForDOMElementInSetting(element) {
            const settingElement = this.getSettingDOMElementForDOMElement(element);
            return settingElement && settingElement.getAttribute(AbstractSettingRenderer.SETTING_ID_ATTR);
        }
    };
    exports.SettingTreeRenderers = SettingTreeRenderers;
    exports.SettingTreeRenderers = SettingTreeRenderers = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, contextView_1.IContextMenuService),
        __param(2, contextView_1.IContextViewService),
        __param(3, userDataProfile_1.IUserDataProfilesService),
        __param(4, userDataSync_1.IUserDataSyncEnablementService)
    ], SettingTreeRenderers);
    /**
     * Validate and render any error message. Returns true if the value is invalid.
     */
    function renderValidations(dataElement, template, calledOnStartup) {
        if (dataElement.setting.validator) {
            const errMsg = dataElement.setting.validator(template.inputBox.value);
            if (errMsg) {
                template.containerElement.classList.add('invalid-input');
                template.validationErrorMessageElement.innerText = errMsg;
                const validationError = (0, nls_1.localize)('validationError', "Validation Error.");
                template.inputBox.inputElement.parentElement.setAttribute('aria-label', [validationError, errMsg].join(' '));
                if (!calledOnStartup) {
                    aria.status(validationError + ' ' + errMsg);
                }
                return true;
            }
            else {
                template.inputBox.inputElement.parentElement.removeAttribute('aria-label');
            }
        }
        template.containerElement.classList.remove('invalid-input');
        return false;
    }
    /**
     * Validate and render any error message for arrays. Returns true if the value is invalid.
     */
    function renderArrayValidations(dataElement, template, value, calledOnStartup) {
        template.containerElement.classList.add('invalid-input');
        if (dataElement.setting.validator) {
            const errMsg = dataElement.setting.validator(value);
            if (errMsg && errMsg !== '') {
                template.containerElement.classList.add('invalid-input');
                template.validationErrorMessageElement.innerText = errMsg;
                const validationError = (0, nls_1.localize)('validationError', "Validation Error.");
                template.containerElement.setAttribute('aria-label', [dataElement.setting.key, validationError, errMsg].join(' '));
                if (!calledOnStartup) {
                    aria.status(validationError + ' ' + errMsg);
                }
                return true;
            }
            else {
                template.containerElement.setAttribute('aria-label', dataElement.setting.key);
                template.containerElement.classList.remove('invalid-input');
            }
        }
        return false;
    }
    function cleanRenderedMarkdown(element) {
        for (let i = 0; i < element.childNodes.length; i++) {
            const child = element.childNodes.item(i);
            const tagName = child.tagName && child.tagName.toLowerCase();
            if (tagName === 'img') {
                element.removeChild(child);
            }
            else {
                cleanRenderedMarkdown(child);
            }
        }
    }
    function fixSettingLinks(text, linkify = true) {
        return text.replace(/`#([^#\s`]+)#`|'#([^#\s']+)#'/g, (match, backticksGroup, quotesGroup) => {
            const settingKey = backticksGroup ?? quotesGroup;
            const targetDisplayFormat = (0, settingsTreeModels_1.settingKeyToDisplayFormat)(settingKey);
            const targetName = `${targetDisplayFormat.category}: ${targetDisplayFormat.label}`;
            return linkify ?
                `[${targetName}](#${settingKey} "${settingKey}")` :
                `"${targetName}"`;
        });
    }
    function escapeInvisibleChars(enumValue) {
        return enumValue && enumValue
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r');
    }
    let SettingsTreeFilter = class SettingsTreeFilter {
        constructor(viewState, environmentService) {
            this.viewState = viewState;
            this.environmentService = environmentService;
        }
        filter(element, parentVisibility) {
            // Filter during search
            if (this.viewState.filterToCategory && element instanceof settingsTreeModels_1.SettingsTreeSettingElement) {
                if (!this.settingContainedInGroup(element.setting, this.viewState.filterToCategory)) {
                    return false;
                }
            }
            // Non-user scope selected
            if (element instanceof settingsTreeModels_1.SettingsTreeSettingElement && this.viewState.settingsTarget !== 3 /* ConfigurationTarget.USER_LOCAL */) {
                const isRemote = !!this.environmentService.remoteAuthority;
                if (!element.matchesScope(this.viewState.settingsTarget, isRemote)) {
                    return false;
                }
            }
            // Group with no visible children
            if (element instanceof settingsTreeModels_1.SettingsTreeGroupElement) {
                if (typeof element.count === 'number') {
                    return element.count > 0;
                }
                return 2 /* TreeVisibility.Recurse */;
            }
            // Filtered "new extensions" button
            if (element instanceof settingsTreeModels_1.SettingsTreeNewExtensionsElement) {
                if (this.viewState.tagFilters?.size || this.viewState.filterToCategory) {
                    return false;
                }
            }
            return true;
        }
        settingContainedInGroup(setting, group) {
            return group.children.some(child => {
                if (child instanceof settingsTreeModels_1.SettingsTreeGroupElement) {
                    return this.settingContainedInGroup(setting, child);
                }
                else if (child instanceof settingsTreeModels_1.SettingsTreeSettingElement) {
                    return child.setting.key === setting.key;
                }
                else {
                    return false;
                }
            });
        }
    };
    exports.SettingsTreeFilter = SettingsTreeFilter;
    exports.SettingsTreeFilter = SettingsTreeFilter = __decorate([
        __param(1, environmentService_1.IWorkbenchEnvironmentService)
    ], SettingsTreeFilter);
    class SettingsTreeDelegate extends list_1.CachedListVirtualDelegate {
        getTemplateId(element) {
            if (element instanceof settingsTreeModels_1.SettingsTreeGroupElement) {
                return SETTINGS_ELEMENT_TEMPLATE_ID;
            }
            if (element instanceof settingsTreeModels_1.SettingsTreeSettingElement) {
                if (element.valueType === preferences_2.SettingValueType.ExtensionToggle) {
                    return SETTINGS_EXTENSION_TOGGLE_TEMPLATE_ID;
                }
                const invalidTypeError = element.isConfigured && (0, preferencesValidation_1.getInvalidTypeError)(element.value, element.setting.type);
                if (invalidTypeError) {
                    return SETTINGS_COMPLEX_TEMPLATE_ID;
                }
                if (element.valueType === preferences_2.SettingValueType.Boolean) {
                    return SETTINGS_BOOL_TEMPLATE_ID;
                }
                if (element.valueType === preferences_2.SettingValueType.Integer ||
                    element.valueType === preferences_2.SettingValueType.Number ||
                    element.valueType === preferences_2.SettingValueType.NullableInteger ||
                    element.valueType === preferences_2.SettingValueType.NullableNumber) {
                    return SETTINGS_NUMBER_TEMPLATE_ID;
                }
                if (element.valueType === preferences_2.SettingValueType.MultilineString) {
                    return SETTINGS_MULTILINE_TEXT_TEMPLATE_ID;
                }
                if (element.valueType === preferences_2.SettingValueType.String) {
                    return SETTINGS_TEXT_TEMPLATE_ID;
                }
                if (element.valueType === preferences_2.SettingValueType.Enum) {
                    return SETTINGS_ENUM_TEMPLATE_ID;
                }
                if (element.valueType === preferences_2.SettingValueType.Array) {
                    return SETTINGS_ARRAY_TEMPLATE_ID;
                }
                if (element.valueType === preferences_2.SettingValueType.Exclude) {
                    return SETTINGS_EXCLUDE_TEMPLATE_ID;
                }
                if (element.valueType === preferences_2.SettingValueType.Include) {
                    return SETTINGS_INCLUDE_TEMPLATE_ID;
                }
                if (element.valueType === preferences_2.SettingValueType.Object) {
                    return SETTINGS_OBJECT_TEMPLATE_ID;
                }
                if (element.valueType === preferences_2.SettingValueType.BooleanObject) {
                    return SETTINGS_BOOL_OBJECT_TEMPLATE_ID;
                }
                if (element.valueType === preferences_2.SettingValueType.LanguageTag) {
                    return SETTINGS_COMPLEX_TEMPLATE_ID;
                }
                return SETTINGS_COMPLEX_TEMPLATE_ID;
            }
            if (element instanceof settingsTreeModels_1.SettingsTreeNewExtensionsElement) {
                return SETTINGS_NEW_EXTENSIONS_TEMPLATE_ID;
            }
            throw new Error('unknown element type: ' + element);
        }
        hasDynamicHeight(element) {
            return !(element instanceof settingsTreeModels_1.SettingsTreeGroupElement);
        }
        estimateHeight(element) {
            if (element instanceof settingsTreeModels_1.SettingsTreeGroupElement) {
                return 42;
            }
            return element instanceof settingsTreeModels_1.SettingsTreeSettingElement && element.valueType === preferences_2.SettingValueType.Boolean ? 78 : 104;
        }
    }
    class NonCollapsibleObjectTreeModel extends objectTreeModel_1.ObjectTreeModel {
        isCollapsible(element) {
            return false;
        }
        setCollapsed(element, collapsed, recursive) {
            return false;
        }
    }
    exports.NonCollapsibleObjectTreeModel = NonCollapsibleObjectTreeModel;
    class SettingsTreeAccessibilityProvider {
        constructor(configurationService, languageService, userDataProfilesService) {
            this.configurationService = configurationService;
            this.languageService = languageService;
            this.userDataProfilesService = userDataProfilesService;
        }
        getAriaLabel(element) {
            if (element instanceof settingsTreeModels_1.SettingsTreeSettingElement) {
                const ariaLabelSections = [];
                ariaLabelSections.push(`${element.displayCategory} ${element.displayLabel}.`);
                if (element.isConfigured) {
                    const modifiedText = (0, nls_1.localize)('settings.Modified', 'Modified.');
                    ariaLabelSections.push(modifiedText);
                }
                const indicatorsLabelAriaLabel = (0, settingsEditorSettingIndicators_1.getIndicatorsLabelAriaLabel)(element, this.configurationService, this.userDataProfilesService, this.languageService);
                if (indicatorsLabelAriaLabel.length) {
                    ariaLabelSections.push(`${indicatorsLabelAriaLabel}.`);
                }
                const descriptionWithoutSettingLinks = (0, markdownRenderer_1.renderMarkdownAsPlaintext)({ value: fixSettingLinks(element.description, false) });
                if (descriptionWithoutSettingLinks.length) {
                    ariaLabelSections.push(descriptionWithoutSettingLinks);
                }
                return ariaLabelSections.join(' ');
            }
            else if (element instanceof settingsTreeModels_1.SettingsTreeGroupElement) {
                return element.label;
            }
            else {
                return element.id;
            }
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)('settings', "Settings");
        }
    }
    let SettingsTree = class SettingsTree extends listService_1.WorkbenchObjectTree {
        constructor(container, viewState, renderers, contextKeyService, listService, configurationService, instantiationService, languageService, userDataProfilesService) {
            super('SettingsTree', container, new SettingsTreeDelegate(), renderers, {
                horizontalScrolling: false,
                supportDynamicHeights: true,
                identityProvider: {
                    getId(e) {
                        return e.id;
                    }
                },
                accessibilityProvider: new SettingsTreeAccessibilityProvider(configurationService, languageService, userDataProfilesService),
                styleController: id => new listWidget_1.DefaultStyleController(DOM.createStyleSheet(container), id),
                filter: instantiationService.createInstance(SettingsTreeFilter, viewState),
                smoothScrolling: configurationService.getValue('workbench.list.smoothScrolling'),
                multipleSelectionSupport: false,
                findWidgetEnabled: false,
                renderIndentGuides: abstractTree_1.RenderIndentGuides.None
            }, instantiationService, contextKeyService, listService, configurationService);
            this.getHTMLElement().classList.add('settings-editor-tree');
            this.style((0, defaultStyles_1.getListStyles)({
                listBackground: colorRegistry_1.editorBackground,
                listActiveSelectionBackground: colorRegistry_1.editorBackground,
                listActiveSelectionForeground: colorRegistry_1.foreground,
                listFocusAndSelectionBackground: colorRegistry_1.editorBackground,
                listFocusAndSelectionForeground: colorRegistry_1.foreground,
                listFocusBackground: colorRegistry_1.editorBackground,
                listFocusForeground: colorRegistry_1.foreground,
                listHoverForeground: colorRegistry_1.foreground,
                listHoverBackground: colorRegistry_1.editorBackground,
                listHoverOutline: colorRegistry_1.editorBackground,
                listFocusOutline: colorRegistry_1.editorBackground,
                listInactiveSelectionBackground: colorRegistry_1.editorBackground,
                listInactiveSelectionForeground: colorRegistry_1.foreground,
                listInactiveFocusBackground: colorRegistry_1.editorBackground,
                listInactiveFocusOutline: colorRegistry_1.editorBackground,
                treeIndentGuidesStroke: undefined,
                treeInactiveIndentGuidesStroke: undefined,
            }));
            this.disposables.add(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('workbench.list.smoothScrolling')) {
                    this.updateOptions({
                        smoothScrolling: configurationService.getValue('workbench.list.smoothScrolling')
                    });
                }
            }));
        }
        createModel(user, view, options) {
            return new NonCollapsibleObjectTreeModel(user, view, options);
        }
    };
    exports.SettingsTree = SettingsTree;
    exports.SettingsTree = SettingsTree = __decorate([
        __param(3, contextkey_1.IContextKeyService),
        __param(4, listService_1.IListService),
        __param(5, configuration_2.IWorkbenchConfigurationService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, language_1.ILanguageService),
        __param(8, userDataProfile_1.IUserDataProfilesService)
    ], SettingsTree);
    let CopySettingIdAction = class CopySettingIdAction extends actions_1.Action {
        static { CopySettingIdAction_1 = this; }
        static { this.ID = 'settings.copySettingId'; }
        static { this.LABEL = (0, nls_1.localize)('copySettingIdLabel', "Copy Setting ID"); }
        constructor(clipboardService) {
            super(CopySettingIdAction_1.ID, CopySettingIdAction_1.LABEL);
            this.clipboardService = clipboardService;
        }
        async run(context) {
            if (context) {
                await this.clipboardService.writeText(context.setting.key);
            }
            return Promise.resolve(undefined);
        }
    };
    CopySettingIdAction = CopySettingIdAction_1 = __decorate([
        __param(0, clipboardService_1.IClipboardService)
    ], CopySettingIdAction);
    let CopySettingAsJSONAction = class CopySettingAsJSONAction extends actions_1.Action {
        static { CopySettingAsJSONAction_1 = this; }
        static { this.ID = 'settings.copySettingAsJSON'; }
        static { this.LABEL = (0, nls_1.localize)('copySettingAsJSONLabel', "Copy Setting as JSON"); }
        constructor(clipboardService) {
            super(CopySettingAsJSONAction_1.ID, CopySettingAsJSONAction_1.LABEL);
            this.clipboardService = clipboardService;
        }
        async run(context) {
            if (context) {
                const jsonResult = `"${context.setting.key}": ${JSON.stringify(context.value, undefined, '  ')}`;
                await this.clipboardService.writeText(jsonResult);
            }
            return Promise.resolve(undefined);
        }
    };
    CopySettingAsJSONAction = CopySettingAsJSONAction_1 = __decorate([
        __param(0, clipboardService_1.IClipboardService)
    ], CopySettingAsJSONAction);
    let SyncSettingAction = class SyncSettingAction extends actions_1.Action {
        static { SyncSettingAction_1 = this; }
        static { this.ID = 'settings.stopSyncingSetting'; }
        static { this.LABEL = (0, nls_1.localize)('stopSyncingSetting', "Sync This Setting"); }
        constructor(setting, configService) {
            super(SyncSettingAction_1.ID, SyncSettingAction_1.LABEL);
            this.setting = setting;
            this.configService = configService;
            this._register(event_1.Event.filter(configService.onDidChangeConfiguration, e => e.affectsConfiguration('settingsSync.ignoredSettings'))(() => this.update()));
            this.update();
        }
        async update() {
            const ignoredSettings = (0, settingsMerge_1.getIgnoredSettings)((0, userDataSync_1.getDefaultIgnoredSettings)(), this.configService);
            this.checked = !ignoredSettings.includes(this.setting.key);
        }
        async run() {
            // first remove the current setting completely from ignored settings
            let currentValue = [...this.configService.getValue('settingsSync.ignoredSettings')];
            currentValue = currentValue.filter(v => v !== this.setting.key && v !== `-${this.setting.key}`);
            const defaultIgnoredSettings = (0, userDataSync_1.getDefaultIgnoredSettings)();
            const isDefaultIgnored = defaultIgnoredSettings.includes(this.setting.key);
            const askedToSync = !this.checked;
            // If asked to sync, then add only if it is ignored by default
            if (askedToSync && isDefaultIgnored) {
                currentValue.push(`-${this.setting.key}`);
            }
            // If asked not to sync, then add only if it is not ignored by default
            if (!askedToSync && !isDefaultIgnored) {
                currentValue.push(this.setting.key);
            }
            this.configService.updateValue('settingsSync.ignoredSettings', currentValue.length ? currentValue : undefined, 2 /* ConfigurationTarget.USER */);
            return Promise.resolve(undefined);
        }
    };
    SyncSettingAction = SyncSettingAction_1 = __decorate([
        __param(1, configuration_1.IConfigurationService)
    ], SyncSettingAction);
    let ApplySettingToAllProfilesAction = class ApplySettingToAllProfilesAction extends actions_1.Action {
        static { ApplySettingToAllProfilesAction_1 = this; }
        static { this.ID = 'settings.applyToAllProfiles'; }
        static { this.LABEL = (0, nls_1.localize)('applyToAllProfiles', "Apply Setting to all Profiles"); }
        constructor(setting, configService) {
            super(ApplySettingToAllProfilesAction_1.ID, ApplySettingToAllProfilesAction_1.LABEL);
            this.setting = setting;
            this.configService = configService;
            this._register(event_1.Event.filter(configService.onDidChangeConfiguration, e => e.affectsConfiguration(configuration_2.APPLY_ALL_PROFILES_SETTING))(() => this.update()));
            this.update();
        }
        update() {
            const allProfilesSettings = this.configService.getValue(configuration_2.APPLY_ALL_PROFILES_SETTING);
            this.checked = allProfilesSettings.includes(this.setting.key);
        }
        async run() {
            // first remove the current setting completely from ignored settings
            const value = this.configService.getValue(configuration_2.APPLY_ALL_PROFILES_SETTING) ?? [];
            if (this.checked) {
                value.splice(value.indexOf(this.setting.key), 1);
            }
            else {
                value.push(this.setting.key);
            }
            const newValue = (0, arrays_1.distinct)(value);
            if (this.checked) {
                await this.configService.updateValue(this.setting.key, this.configService.inspect(this.setting.key).application?.value, 3 /* ConfigurationTarget.USER_LOCAL */);
                await this.configService.updateValue(configuration_2.APPLY_ALL_PROFILES_SETTING, newValue.length ? newValue : undefined, 3 /* ConfigurationTarget.USER_LOCAL */);
            }
            else {
                await this.configService.updateValue(configuration_2.APPLY_ALL_PROFILES_SETTING, newValue.length ? newValue : undefined, 3 /* ConfigurationTarget.USER_LOCAL */);
                await this.configService.updateValue(this.setting.key, this.configService.inspect(this.setting.key).userLocal?.value, 3 /* ConfigurationTarget.USER_LOCAL */);
            }
        }
    };
    ApplySettingToAllProfilesAction = ApplySettingToAllProfilesAction_1 = __decorate([
        __param(1, configuration_2.IWorkbenchConfigurationService)
    ], ApplySettingToAllProfilesAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3NUcmVlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvcHJlZmVyZW5jZXMvYnJvd3Nlci9zZXR0aW5nc1RyZWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQXFFaEcsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUVoQixTQUFTLDZCQUE2QixDQUFDLE9BQW1DO1FBQ3pFLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNsQyxFQUFFLEdBQUcsT0FBTyxDQUFDLFlBQVksRUFBRSxHQUFHLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1lBQ3BELE9BQU8sQ0FBQyxZQUFZLENBQUM7UUFFdEIsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzthQUN0QixNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQzFCLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNWLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN4QixNQUFNLE9BQU8sR0FBRyxPQUFPLEtBQUssS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztZQUNwRSxPQUFPO2dCQUNOLEtBQUssRUFBRTtvQkFDTixJQUFJLEVBQUUsUUFBUTtvQkFDZCxJQUFJLEVBQUUsR0FBRztpQkFDVDtnQkFDRCxPQUFPO2dCQUNQLFdBQVcsRUFBRSxPQUFPLENBQUMsU0FBUzthQUM5QixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsU0FBUyx1QkFBdUIsQ0FBQyxVQUFvQixFQUFFLGNBQWlD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