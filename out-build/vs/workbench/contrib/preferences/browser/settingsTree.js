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
define(["require", "exports", "vs/base/browser/canIUse", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/markdownRenderer", "vs/base/browser/ui/aria/aria", "vs/base/browser/ui/button/button", "vs/base/browser/ui/iconLabel/simpleIconLabel", "vs/base/browser/ui/inputbox/inputBox", "vs/base/browser/ui/list/list", "vs/base/browser/ui/list/listWidget", "vs/base/browser/ui/selectBox/selectBox", "vs/base/browser/ui/toggle/toggle", "vs/base/browser/ui/toolbar/toolbar", "vs/base/browser/ui/tree/abstractTree", "vs/base/browser/ui/tree/objectTreeModel", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/codicons", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/strings", "vs/base/common/types", "vs/editor/common/languages/language", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/nls!vs/workbench/contrib/preferences/browser/settingsTree", "vs/platform/clipboard/common/clipboardService", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/list/browser/listService", "vs/platform/opener/common/opener", "vs/platform/product/common/productService", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/settingsMerge", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/preferences/browser/preferencesIcons", "vs/workbench/contrib/preferences/browser/settingsEditorSettingIndicators", "vs/workbench/contrib/preferences/browser/settingsTreeModels", "vs/workbench/contrib/preferences/browser/settingsWidgets", "vs/workbench/contrib/preferences/common/preferences", "vs/workbench/contrib/preferences/common/settingsEditorColorRegistry", "vs/workbench/services/configuration/common/configuration", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/preferences/common/preferencesValidation"], function (require, exports, canIUse_1, DOM, keyboardEvent_1, markdownRenderer_1, aria, button_1, simpleIconLabel_1, inputBox_1, list_1, listWidget_1, selectBox_1, toggle_1, toolbar_1, abstractTree_1, objectTreeModel_1, actions_1, arrays_1, codicons_1, errors_1, event_1, lifecycle_1, platform_1, strings_1, types_1, language_1, markdownRenderer_2, nls_1, clipboardService_1, commands_1, configuration_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, listService_1, opener_1, productService_1, telemetry_1, defaultStyles_1, colorRegistry_1, themeService_1, userDataProfile_1, settingsMerge_1, userDataSync_1, extensions_1, preferencesIcons_1, settingsEditorSettingIndicators_1, settingsTreeModels_1, settingsWidgets_1, preferences_1, settingsEditorColorRegistry_1, configuration_2, environmentService_1, extensions_2, preferences_2, preferencesValidation_1) {
    "use strict";
    var $NDb_1, CopySettingIdAction_1, CopySettingAsJSONAction_1, SyncSettingAction_1, ApplySettingToAllProfilesAction_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$1Db = exports.$ZDb = exports.$YDb = exports.$XDb = exports.$WDb = exports.$VDb = exports.$UDb = exports.$TDb = exports.$SDb = exports.$RDb = exports.$QDb = exports.$PDb = exports.$ODb = exports.$NDb = exports.$MDb = exports.$LDb = exports.$KDb = exports.$JDb = void 0;
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
        else if (schema.type === 'string' && (0, types_1.$rf)(schema.enum) && schema.enum.length > 0) {
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
            if ((0, types_1.$rf)(objectProperties) && key in objectProperties) {
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
                    removable: (0, types_1.$sf)(defaultValue),
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
        }).filter(item => !(0, types_1.$sf)(item.value.data));
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
            if ((0, types_1.$rf)(objectProperties) && key in objectProperties) {
                suggestedSchema = objectProperties[key];
            }
            const patternSchema = suggestedSchema ?? patternsAndSchemas.find(({ pattern }) => pattern.test(key))?.schema;
            if ((0, types_1.$rf)(patternSchema)) {
                suggestedSchema = patternSchema;
            }
            else if ((0, types_1.$rf)(objectAdditionalProperties) && typeof objectAdditionalProperties === 'object') {
                suggestedSchema = objectAdditionalProperties;
            }
            if ((0, types_1.$rf)(suggestedSchema)) {
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
    function $JDb(tocData, coreSettingsGroups, logService) {
        const allSettings = getFlatSettings(coreSettingsGroups);
        return {
            tree: _resolveSettingsTree(tocData, allSettings, logService),
            leftoverSettings: allSettings
        };
    }
    exports.$JDb = $JDb;
    function $KDb(groups, target, languageFilter, configurationService) {
        const allSettings = getFlatSettings(groups);
        return [...allSettings].filter(setting => setting.restricted && (0, settingsTreeModels_1.$wDb)(setting.key, target, languageFilter, configurationService).isConfigured);
    }
    exports.$KDb = $KDb;
    function compareNullableIntegers(a, b) {
        const firstElem = a ?? Number.MAX_SAFE_INTEGER;
        const secondElem = b ?? Number.MAX_SAFE_INTEGER;
        return firstElem - secondElem;
    }
    async function $LDb(extensionService, groups) {
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
                label: (0, nls_1.localize)(0, null),
                children: extGroups
            };
        });
    }
    exports.$LDb = $LDb;
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
    function $MDb(pattern) {
        pattern = (0, strings_1.$qe)(pattern)
            .replace(/\\\*/g, '.*');
        return new RegExp(`^${pattern}$`, 'i');
    }
    exports.$MDb = $MDb;
    function settingMatches(s, pattern) {
        let regExp = settingPatternCache.get(pattern);
        if (!regExp) {
            regExp = $MDb(pattern);
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
            element.setAttribute($NDb.ELEMENT_FOCUSABLE_ATTR, 'true');
            element.setAttribute('tabindex', '-1');
        });
    }
    function addChildrenToTabOrder(node) {
        const focusableElements = node.querySelectorAll(`[${$NDb.ELEMENT_FOCUSABLE_ATTR}="true"]`);
        focusableElements.forEach(element => {
            element.removeAttribute($NDb.ELEMENT_FOCUSABLE_ATTR);
            element.setAttribute('tabindex', '0');
        });
    }
    let $NDb = class $NDb extends lifecycle_1.$kc {
        static { $NDb_1 = this; }
        static { this.CONTROL_CLASS = 'setting-control-focus-target'; }
        static { this.CONTROL_SELECTOR = '.' + $NDb_1.CONTROL_CLASS; }
        static { this.CONTENTS_CLASS = 'setting-item-contents'; }
        static { this.CONTENTS_SELECTOR = '.' + $NDb_1.CONTENTS_CLASS; }
        static { this.ALL_ROWS_SELECTOR = '.monaco-list-row'; }
        static { this.SETTING_KEY_ATTR = 'data-key'; }
        static { this.SETTING_ID_ATTR = 'data-id'; }
        static { this.ELEMENT_FOCUSABLE_ATTR = 'data-focusable'; }
        constructor(z, C, D, F, G, H, I, J, L, M, N, O, P, Q) {
            super();
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.M = M;
            this.N = N;
            this.O = O;
            this.P = P;
            this.Q = Q;
            this.c = this.B(new event_1.$fd());
            this.onDidClickOverrideElement = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onDidChangeSetting = this.f.event;
            this.h = this.B(new event_1.$fd());
            this.onDidOpenSettings = this.h.event;
            this.j = this.B(new event_1.$fd());
            this.onDidClickSettingLink = this.j.event;
            this.m = this.B(new event_1.$fd());
            this.onDidFocusSetting = this.m.event;
            this.t = this.B(new event_1.$fd());
            this.onDidChangeIgnoredSettings = this.t.event;
            this.u = this.B(new event_1.$fd());
            this.onDidChangeSettingHeight = this.u.event;
            this.w = this.B(new event_1.$fd());
            this.onApplyFilter = this.w.event;
            this.y = this.B(H.createInstance(markdownRenderer_2.$K2, {}));
            this.n = (0, settingsMerge_1.$Uzb)((0, userDataSync_1.$wgb)(), this.M);
            this.B(this.M.onDidChangeConfiguration(e => {
                this.n = (0, settingsMerge_1.$Uzb)((0, userDataSync_1.$wgb)(), this.M);
                this.t.fire();
            }));
        }
        R(tree, _container, typeClass) {
            _container.classList.add('setting-item');
            _container.classList.add('setting-item-' + typeClass);
            const toDispose = new lifecycle_1.$jc();
            const container = DOM.$0O(_container, $($NDb_1.CONTENTS_SELECTOR));
            container.classList.add('settings-row-inner-container');
            const titleElement = DOM.$0O(container, $('.setting-item-title'));
            const labelCategoryContainer = DOM.$0O(titleElement, $('.setting-item-cat-label-container'));
            const categoryElement = DOM.$0O(labelCategoryContainer, $('span.setting-item-category'));
            const labelElementContainer = DOM.$0O(labelCategoryContainer, $('span.setting-item-label'));
            const labelElement = new simpleIconLabel_1.$LR(labelElementContainer);
            const indicatorsLabel = this.H.createInstance(settingsEditorSettingIndicators_1.$ADb, titleElement);
            toDispose.add(indicatorsLabel);
            const descriptionElement = DOM.$0O(container, $('.setting-item-description'));
            const modifiedIndicatorElement = DOM.$0O(container, $('.setting-item-modified-indicator'));
            modifiedIndicatorElement.title = (0, nls_1.localize)(1, null);
            const valueElement = DOM.$0O(container, $('.setting-item-value'));
            const controlElement = DOM.$0O(valueElement, $('div.setting-item-control'));
            const deprecationWarningElement = DOM.$0O(container, $('.setting-item-deprecation-message'));
            const toolbarContainer = DOM.$0O(container, $('.setting-toolbar-container'));
            const toolbar = this.U(toolbarContainer);
            const template = {
                toDispose,
                elementDisposables: toDispose.add(new lifecycle_1.$jc()),
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
            toDispose.add(DOM.$nO(controlElement, DOM.$3O.MOUSE_DOWN, e => e.stopPropagation()));
            toDispose.add(DOM.$nO(titleElement, DOM.$3O.MOUSE_ENTER, e => container.classList.add('mouseover')));
            toDispose.add(DOM.$nO(titleElement, DOM.$3O.MOUSE_LEAVE, e => container.classList.remove('mouseover')));
            return template;
        }
        S(template) {
            const focusTracker = DOM.$8O(template.containerElement);
            template.toDispose.add(focusTracker);
            focusTracker.onDidBlur(() => {
                if (template.containerElement.classList.contains('focused')) {
                    template.containerElement.classList.remove('focused');
                }
            });
            focusTracker.onDidFocus(() => {
                template.containerElement.classList.add('focused');
                if (template.context) {
                    this.m.fire(template.context);
                }
            });
        }
        U(container) {
            const toggleMenuKeybinding = this.L.lookupKeybinding(preferences_1.$dCb);
            let toggleMenuTitle = (0, nls_1.localize)(2, null);
            if (toggleMenuKeybinding) {
                toggleMenuTitle += ` (${toggleMenuKeybinding && toggleMenuKeybinding.getLabel()})`;
            }
            const toolbar = new toolbar_1.$6R(container, this.J, {
                toggleMenuTitle,
                renderDropdownAsChildElement: !platform_1.$q,
                moreIcon: preferencesIcons_1.$VBb
            });
            return toolbar;
        }
        W(node, index, template) {
            const element = node.element;
            // The element must inspect itself to get information for
            // the modified indicator and the overridden Settings indicators.
            element.inspectSelf();
            template.context = element;
            template.toolbar.context = element;
            const actions = this.C(element.setting, element.settingsTarget);
            actions.forEach(a => (0, lifecycle_1.$ec)(a) && template.elementDisposables.add(a));
            template.toolbar.setActions([], [...this.z, ...actions]);
            const setting = element.setting;
            template.containerElement.classList.toggle('is-configured', element.isConfigured);
            template.containerElement.setAttribute($NDb_1.SETTING_KEY_ATTR, element.setting.key);
            template.containerElement.setAttribute($NDb_1.SETTING_ID_ATTR, element.id);
            const titleTooltip = setting.key + (element.isConfigured ? ' - Modified' : '');
            template.categoryElement.textContent = element.displayCategory ? (element.displayCategory + ': ') : '';
            template.categoryElement.title = titleTooltip;
            template.labelElement.text = element.displayLabel;
            template.labelElement.title = titleTooltip;
            template.descriptionElement.innerText = '';
            if (element.setting.descriptionIsMarkdown) {
                const renderedDescription = this.Y(element, template.containerElement, element.description, template.elementDisposables);
                template.descriptionElement.appendChild(renderedDescription);
            }
            else {
                template.descriptionElement.innerText = element.description;
            }
            template.indicatorsLabel.updateScopeOverrides(element, this.c, this.w);
            template.elementDisposables.add(this.M.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(configuration_2.$oE)) {
                    template.indicatorsLabel.updateScopeOverrides(element, this.c, this.w);
                }
            }));
            const onChange = (value) => this.f.fire({
                key: element.setting.key,
                value,
                type: template.context.valueType,
                manualReset: false,
                scope: element.setting.scope
            });
            const deprecationText = element.setting.deprecationMessage || '';
            if (deprecationText && element.setting.deprecationMessageIsMarkdown) {
                template.deprecationWarningElement.innerText = '';
                template.deprecationWarningElement.appendChild(this.Y(element, template.containerElement, element.setting.deprecationMessage, template.elementDisposables));
            }
            else {
                template.deprecationWarningElement.innerText = deprecationText;
            }
            template.deprecationWarningElement.prepend($('.codicon.codicon-error'));
            template.containerElement.classList.toggle('is-deprecated', !!deprecationText);
            this.Z(element, template, onChange);
            template.indicatorsLabel.updateWorkspaceTrust(element);
            template.indicatorsLabel.updateSyncIgnored(element, this.n);
            template.indicatorsLabel.updateDefaultOverrideIndicator(element);
            template.elementDisposables.add(this.onDidChangeIgnoredSettings(() => {
                template.indicatorsLabel.updateSyncIgnored(element, this.n);
            }));
            this.X(element, template);
            template.elementDisposables.add(element.onDidChangeTabbable(() => {
                this.X(element, template);
            }));
        }
        X(element, template) {
            if (element.tabbable) {
                addChildrenToTabOrder(template.containerElement);
            }
            else {
                removeChildrenFromTabOrder(template.containerElement);
            }
        }
        Y(element, container, text, disposables) {
            // Rewrite `#editor.fontSize#` to link format
            text = fixSettingLinks(text);
            const renderedMarkdown = this.y.render({ value: text, isTrusted: true }, {
                actionHandler: {
                    callback: (content) => {
                        if (content.startsWith('#')) {
                            const e = {
                                source: element,
                                targetKey: content.substring(1)
                            };
                            this.j.fire(e);
                        }
                        else {
                            this.G.open(content, { allowCommands: true }).catch(errors_1.$Y);
                        }
                    },
                    disposables
                },
                asyncRenderCallback: () => {
                    const height = container.clientHeight;
                    if (height) {
                        this.u.fire({ element, height });
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
    exports.$NDb = $NDb;
    exports.$NDb = $NDb = $NDb_1 = __decorate([
        __param(2, themeService_1.$gv),
        __param(3, contextView_1.$VZ),
        __param(4, opener_1.$NT),
        __param(5, instantiation_1.$Ah),
        __param(6, commands_1.$Fr),
        __param(7, contextView_1.$WZ),
        __param(8, keybinding_1.$2D),
        __param(9, configuration_1.$8h),
        __param(10, extensions_2.$MF),
        __param(11, extensions_1.$Pfb),
        __param(12, productService_1.$kj),
        __param(13, telemetry_1.$9k)
    ], $NDb);
    class $ODb {
        constructor() {
            this.templateId = SETTINGS_ELEMENT_TEMPLATE_ID;
        }
        renderTemplate(container) {
            container.classList.add('group-title');
            const template = {
                parent: container,
                toDispose: new lifecycle_1.$jc()
            };
            return template;
        }
        renderElement(element, index, templateData) {
            templateData.parent.innerText = '';
            const labelElement = DOM.$0O(templateData.parent, $('div.settings-group-title-label.settings-row-inner-container'));
            labelElement.classList.add(`settings-group-level-${element.element.level}`);
            labelElement.textContent = element.element.label;
            if (element.element.isFirstGroup) {
                labelElement.classList.add('settings-group-first');
            }
        }
        disposeTemplate(templateData) {
        }
    }
    exports.$ODb = $ODb;
    let $PDb = class $PDb {
        constructor(c) {
            this.c = c;
            this.templateId = SETTINGS_NEW_EXTENSIONS_TEMPLATE_ID;
        }
        renderTemplate(container) {
            const toDispose = new lifecycle_1.$jc();
            container.classList.add('setting-item-new-extensions');
            const button = new button_1.$7Q(container, { title: true, ...defaultStyles_1.$i2 });
            toDispose.add(button);
            toDispose.add(button.onDidClick(() => {
                if (template.context) {
                    this.c.executeCommand('workbench.extensions.action.showExtensionsWithIds', template.context.extensionIds);
                }
            }));
            button.label = (0, nls_1.localize)(3, null);
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
            (0, lifecycle_1.$fc)(template.toDispose);
        }
    };
    exports.$PDb = $PDb;
    exports.$PDb = $PDb = __decorate([
        __param(0, commands_1.$Fr)
    ], $PDb);
    class $QDb extends $NDb {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_COMPLEX_TEMPLATE_ID;
        }
        static { this.ab = (0, nls_1.localize)(4, null); }
        renderTemplate(container) {
            const common = this.R(null, container, 'complex');
            const openSettingsButton = DOM.$0O(common.controlElement, $('a.edit-in-settings-button'));
            openSettingsButton.classList.add($NDb.CONTROL_CLASS);
            openSettingsButton.role = 'button';
            const validationErrorMessageElement = $('.setting-item-validation-message');
            common.containerElement.appendChild(validationErrorMessageElement);
            const template = {
                ...common,
                button: openSettingsButton,
                validationErrorMessageElement
            };
            this.S(template);
            return template;
        }
        renderElement(element, index, templateData) {
            super.W(element, index, templateData);
        }
        Z(dataElement, template, onChange) {
            const plainKey = (0, configuration_1.$fi)(dataElement.setting.key);
            const editLanguageSettingLabel = (0, nls_1.localize)(5, null, plainKey);
            const isLanguageTagSetting = dataElement.setting.isLanguageTagSetting;
            template.button.textContent = isLanguageTagSetting
                ? editLanguageSettingLabel
                : $QDb.ab;
            const onClickOrKeydown = (e) => {
                if (isLanguageTagSetting) {
                    this.w.fire(`@${preferences_1.$MCb}${plainKey}`);
                }
                else {
                    this.h.fire(dataElement.setting.key);
                }
                e.preventDefault();
                e.stopPropagation();
            };
            template.elementDisposables.add(DOM.$nO(template.button, DOM.$3O.CLICK, (e) => {
                onClickOrKeydown(e);
            }));
            template.elementDisposables.add(DOM.$nO(template.button, DOM.$3O.KEY_DOWN, (e) => {
                const ev = new keyboardEvent_1.$jO(e);
                if (ev.equals(10 /* KeyCode.Space */) || ev.equals(3 /* KeyCode.Enter */)) {
                    onClickOrKeydown(e);
                }
            }));
            this.cb(dataElement, template);
            if (isLanguageTagSetting) {
                template.button.setAttribute('aria-label', editLanguageSettingLabel);
            }
            else {
                template.button.setAttribute('aria-label', `${$QDb.ab}: ${dataElement.setting.key}`);
            }
        }
        cb(dataElement, template) {
            const errMsg = dataElement.isConfigured && (0, preferencesValidation_1.$qE)(dataElement.value, dataElement.setting.type);
            if (errMsg) {
                template.containerElement.classList.add('invalid-input');
                template.validationErrorMessageElement.innerText = errMsg;
                return;
            }
            template.containerElement.classList.remove('invalid-input');
        }
    }
    exports.$QDb = $QDb;
    class SettingArrayRenderer extends $NDb {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_ARRAY_TEMPLATE_ID;
        }
        renderTemplate(container) {
            const common = this.R(null, container, 'list');
            const descriptionElement = common.containerElement.querySelector('.setting-item-description');
            const validationErrorMessageElement = $('.setting-item-validation-message');
            descriptionElement.after(validationErrorMessageElement);
            const listWidget = this.H.createInstance(settingsWidgets_1.$EDb, common.controlElement);
            listWidget.domNode.classList.add($NDb.CONTROL_CLASS);
            common.toDispose.add(listWidget);
            const template = {
                ...common,
                listWidget,
                validationErrorMessageElement
            };
            this.S(template);
            common.toDispose.add(listWidget.onDidChangeList(e => {
                const newList = this.ab(template, e);
                template.onChange?.(newList);
            }));
            return template;
        }
        ab(template, e) {
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
            super.W(element, index, templateData);
        }
        Z(dataElement, template, onChange) {
            const value = getListDisplayValue(dataElement);
            const keySuggester = dataElement.setting.enum ? createArraySuggester(dataElement) : undefined;
            template.listWidget.setValue(value, {
                showAddButton: getShowAddButtonList(dataElement, value),
                keySuggester
            });
            template.context = dataElement;
            template.elementDisposables.add((0, lifecycle_1.$ic)(() => {
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
    class AbstractSettingObjectRenderer extends $NDb {
        ab(common, widget) {
            widget.domNode.classList.add($NDb.CONTROL_CLASS);
            common.toDispose.add(widget);
            const descriptionElement = common.containerElement.querySelector('.setting-item-description');
            const validationErrorMessageElement = $('.setting-item-validation-message');
            descriptionElement.after(validationErrorMessageElement);
            const template = {
                ...common,
                validationErrorMessageElement
            };
            if (widget instanceof settingsWidgets_1.$IDb) {
                template.objectCheckboxWidget = widget;
            }
            else {
                template.objectDropdownWidget = widget;
            }
            this.S(template);
            common.toDispose.add(widget.onDidChangeList(e => {
                this.bb(template, e);
            }));
            return template;
        }
        bb(template, e) {
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
                    if ((0, types_1.$rf)(e.item) && e.targetIndex === idx) {
                        newValue[e.item.key.data] = e.item.value.data;
                        newItems.push(e.item);
                    }
                    // All remaining items, but skip the one that we just updated
                    else if ((0, types_1.$sf)(e.item) || e.item.key.data !== item.key.data) {
                        newValue[item.key.data] = item.value.data;
                        newItems.push(item);
                    }
                });
                // Item was deleted
                if ((0, types_1.$sf)(e.item)) {
                    delete newValue[e.originalItem.key.data];
                    const itemToDelete = newItems.findIndex(item => item.key.data === e.originalItem.key.data);
                    const defaultItemValue = defaultValue[e.originalItem.key.data];
                    // Item does not have a default
                    if ((0, types_1.$sf)(defaultValue[e.originalItem.key.data]) && itemToDelete > -1) {
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
            super.W(element, index, templateData);
        }
    }
    class SettingObjectRenderer extends AbstractSettingObjectRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_OBJECT_TEMPLATE_ID;
        }
        renderTemplate(container) {
            const common = this.R(null, container, 'list');
            const widget = this.H.createInstance(settingsWidgets_1.$HDb, common.controlElement);
            return this.ab(common, widget);
        }
        Z(dataElement, template, onChange) {
            const items = getObjectDisplayValue(dataElement);
            const { key, objectProperties, objectPatternProperties, objectAdditionalProperties } = dataElement.setting;
            template.objectDropdownWidget.setValue(items, {
                settingKey: key,
                showAddButton: objectAdditionalProperties === false
                    ? (!areAllPropertiesDefined(Object.keys(objectProperties ?? {}), items) ||
                        (0, types_1.$rf)(objectPatternProperties))
                    : true,
                keySuggester: createObjectKeySuggester(dataElement),
                valueSuggester: createObjectValueSuggester(dataElement)
            });
            template.context = dataElement;
            template.elementDisposables.add((0, lifecycle_1.$ic)(() => {
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
            const common = this.R(null, container, 'list');
            const widget = this.H.createInstance(settingsWidgets_1.$IDb, common.controlElement);
            return this.ab(common, widget);
        }
        bb(template, e) {
            if (template.context) {
                super.bb(template, e);
                // Focus this setting explicitly, in case we were previously
                // focused on another setting and clicked a checkbox/value container
                // for this setting.
                this.m.fire(template.context);
            }
        }
        Z(dataElement, template, onChange) {
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
    class SettingIncludeExcludeRenderer extends $NDb {
        renderTemplate(container) {
            const common = this.R(null, container, 'list');
            const includeExcludeWidget = this.H.createInstance(this.ab() ? settingsWidgets_1.$FDb : settingsWidgets_1.$GDb, common.controlElement);
            includeExcludeWidget.domNode.classList.add($NDb.CONTROL_CLASS);
            common.toDispose.add(includeExcludeWidget);
            const template = {
                ...common,
                includeExcludeWidget
            };
            this.S(template);
            common.toDispose.add(includeExcludeWidget.onDidChangeList(e => this.bb(template, e)));
            return template;
        }
        bb(template, e) {
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
                this.f.fire({
                    key: template.context.setting.key,
                    value: Object.keys(newValue).length === 0 ? undefined : sortKeys(newValue),
                    type: template.context.valueType,
                    manualReset: false,
                    scope: template.context.setting.scope
                });
            }
        }
        renderElement(element, index, templateData) {
            super.W(element, index, templateData);
        }
        Z(dataElement, template, onChange) {
            const value = getIncludeExcludeDisplayValue(dataElement);
            template.includeExcludeWidget.setValue(value);
            template.context = dataElement;
            template.elementDisposables.add((0, lifecycle_1.$ic)(() => {
                template.includeExcludeWidget.cancelEdit();
            }));
        }
    }
    class $RDb extends SettingIncludeExcludeRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_EXCLUDE_TEMPLATE_ID;
        }
        ab() {
            return true;
        }
    }
    exports.$RDb = $RDb;
    class $SDb extends SettingIncludeExcludeRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_INCLUDE_TEMPLATE_ID;
        }
        ab() {
            return false;
        }
    }
    exports.$SDb = $SDb;
    const settingsInputBoxStyles = (0, defaultStyles_1.$t2)({
        inputBackground: settingsEditorColorRegistry_1.$$Cb,
        inputForeground: settingsEditorColorRegistry_1.$_Cb,
        inputBorder: settingsEditorColorRegistry_1.$aDb
    });
    class AbstractSettingTextRenderer extends $NDb {
        constructor() {
            super(...arguments);
            this.ab = 150;
        }
        renderTemplate(_container, useMultiline) {
            const common = this.R(null, _container, 'text');
            const validationErrorMessageElement = DOM.$0O(common.containerElement, $('.setting-item-validation-message'));
            const inputBoxOptions = {
                flexibleHeight: useMultiline,
                flexibleWidth: false,
                flexibleMaxHeight: this.ab,
                inputBoxStyles: settingsInputBoxStyles
            };
            const inputBox = new inputBox_1.$sR(common.controlElement, this.F, inputBoxOptions);
            common.toDispose.add(inputBox);
            common.toDispose.add(inputBox.onDidChange(e => {
                template.onChange?.(e);
            }));
            common.toDispose.add(inputBox);
            inputBox.inputElement.classList.add($NDb.CONTROL_CLASS);
            inputBox.inputElement.tabIndex = 0;
            const template = {
                ...common,
                inputBox,
                validationErrorMessageElement
            };
            this.S(template);
            return template;
        }
        renderElement(element, index, templateData) {
            super.W(element, index, templateData);
        }
        Z(dataElement, template, onChange) {
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
            template.toDispose.add(DOM.$oO(template.inputBox.inputElement, DOM.$3O.KEY_DOWN, e => {
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
        Z(dataElement, template, onChange) {
            const onChangeOverride = (value) => {
                // Ensure the model is up to date since a different value will be rendered as different height when probing the height.
                dataElement.value = value;
                onChange(value);
            };
            super.Z(dataElement, template, onChangeOverride);
            template.elementDisposables.add(template.inputBox.onDidHeightChange(e => {
                const height = template.containerElement.clientHeight;
                // Don't fire event if height is reported as 0,
                // which sometimes happens when clicking onto a new setting.
                if (height) {
                    this.u.fire({
                        element: dataElement,
                        height: template.containerElement.clientHeight
                    });
                }
            }));
            template.inputBox.layout();
        }
    }
    class $TDb extends $NDb {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_ENUM_TEMPLATE_ID;
        }
        renderTemplate(container) {
            const common = this.R(null, container, 'enum');
            const styles = (0, defaultStyles_1.$C2)({
                selectBackground: settingsEditorColorRegistry_1.$4Cb,
                selectForeground: settingsEditorColorRegistry_1.$5Cb,
                selectBorder: settingsEditorColorRegistry_1.$6Cb,
                selectListBorder: settingsEditorColorRegistry_1.$7Cb
            });
            const selectBox = new selectBox_1.$HQ([], 0, this.F, styles, {
                useCustomDrawn: !(platform_1.$q && canIUse_1.$bO.pointerEvents)
            });
            common.toDispose.add(selectBox);
            selectBox.render(common.controlElement);
            const selectElement = common.controlElement.querySelector('select');
            if (selectElement) {
                selectElement.classList.add($NDb.CONTROL_CLASS);
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
            this.S(template);
            return template;
        }
        renderElement(element, index, templateData) {
            super.W(element, index, templateData);
        }
        Z(dataElement, template, onChange) {
            // Make shallow copies here so that we don't modify the actual dataElement later
            const enumItemLabels = dataElement.setting.enumItemLabels ? [...dataElement.setting.enumItemLabels] : [];
            const enumDescriptions = dataElement.setting.enumDescriptions ? [...dataElement.setting.enumDescriptions] : [];
            const settingEnum = [...dataElement.setting.enum];
            const enumDescriptionsAreMarkdown = dataElement.setting.enumDescriptionsAreMarkdown;
            const disposables = new lifecycle_1.$jc();
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
                            this.G.open(content).catch(errors_1.$Y);
                        },
                        disposables: disposables
                    },
                    decoratorRight: (((data === stringifiedDefaultValue) || (createdDefault && index === 0)) ? (0, nls_1.localize)(6, null) : '')
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
    exports.$TDb = $TDb;
    const settingsNumberInputBoxStyles = (0, defaultStyles_1.$t2)({
        inputBackground: settingsEditorColorRegistry_1.$bDb,
        inputForeground: settingsEditorColorRegistry_1.$cDb,
        inputBorder: settingsEditorColorRegistry_1.$dDb
    });
    class $UDb extends $NDb {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_NUMBER_TEMPLATE_ID;
        }
        renderTemplate(_container) {
            const common = super.R(null, _container, 'number');
            const validationErrorMessageElement = DOM.$0O(common.containerElement, $('.setting-item-validation-message'));
            const inputBox = new inputBox_1.$sR(common.controlElement, this.F, { type: 'number', inputBoxStyles: settingsNumberInputBoxStyles });
            common.toDispose.add(inputBox);
            common.toDispose.add(inputBox.onDidChange(e => {
                template.onChange?.(e);
            }));
            common.toDispose.add(inputBox);
            inputBox.inputElement.classList.add($NDb.CONTROL_CLASS);
            inputBox.inputElement.tabIndex = 0;
            const template = {
                ...common,
                inputBox,
                validationErrorMessageElement
            };
            this.S(template);
            return template;
        }
        renderElement(element, index, templateData) {
            super.W(element, index, templateData);
        }
        Z(dataElement, template, onChange) {
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
    exports.$UDb = $UDb;
    class $VDb extends $NDb {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_BOOL_TEMPLATE_ID;
        }
        renderTemplate(_container) {
            _container.classList.add('setting-item');
            _container.classList.add('setting-item-bool');
            const container = DOM.$0O(_container, $($NDb.CONTENTS_SELECTOR));
            container.classList.add('settings-row-inner-container');
            const titleElement = DOM.$0O(container, $('.setting-item-title'));
            const categoryElement = DOM.$0O(titleElement, $('span.setting-item-category'));
            const labelElementContainer = DOM.$0O(titleElement, $('span.setting-item-label'));
            const labelElement = new simpleIconLabel_1.$LR(labelElementContainer);
            const indicatorsLabel = this.H.createInstance(settingsEditorSettingIndicators_1.$ADb, titleElement);
            const descriptionAndValueElement = DOM.$0O(container, $('.setting-item-value-description'));
            const controlElement = DOM.$0O(descriptionAndValueElement, $('.setting-item-bool-control'));
            const descriptionElement = DOM.$0O(descriptionAndValueElement, $('.setting-item-description'));
            const modifiedIndicatorElement = DOM.$0O(container, $('.setting-item-modified-indicator'));
            modifiedIndicatorElement.title = (0, nls_1.localize)(7, null);
            const deprecationWarningElement = DOM.$0O(container, $('.setting-item-deprecation-message'));
            const toDispose = new lifecycle_1.$jc();
            const checkbox = new toggle_1.$KQ({ icon: codicons_1.$Pj.check, actionClassName: 'setting-value-checkbox', isChecked: true, title: '', ...toggle_1.$IQ });
            controlElement.appendChild(checkbox.domNode);
            toDispose.add(checkbox);
            toDispose.add(checkbox.onChange(() => {
                template.onChange(checkbox.checked);
            }));
            // Need to listen for mouse clicks on description and toggle checkbox - use target ID for safety
            // Also have to ignore embedded links - too buried to stop propagation
            toDispose.add(DOM.$nO(descriptionElement, DOM.$3O.MOUSE_DOWN, (e) => {
                const targetElement = e.target;
                // Toggle target checkbox
                if (targetElement.tagName.toLowerCase() !== 'a') {
                    template.checkbox.checked = !template.checkbox.checked;
                    template.onChange(checkbox.checked);
                }
                DOM.$5O.stop(e);
            }));
            checkbox.domNode.classList.add($NDb.CONTROL_CLASS);
            const toolbarContainer = DOM.$0O(container, $('.setting-toolbar-container'));
            const toolbar = this.U(toolbarContainer);
            toDispose.add(toolbar);
            const template = {
                toDispose,
                elementDisposables: toDispose.add(new lifecycle_1.$jc()),
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
            this.S(template);
            // Prevent clicks from being handled by list
            toDispose.add(DOM.$nO(controlElement, 'mousedown', (e) => e.stopPropagation()));
            toDispose.add(DOM.$nO(titleElement, DOM.$3O.MOUSE_ENTER, e => container.classList.add('mouseover')));
            toDispose.add(DOM.$nO(titleElement, DOM.$3O.MOUSE_LEAVE, e => container.classList.remove('mouseover')));
            return template;
        }
        renderElement(element, index, templateData) {
            super.W(element, index, templateData);
        }
        Z(dataElement, template, onChange) {
            template.onChange = undefined;
            template.checkbox.checked = dataElement.value;
            template.checkbox.setTitle(dataElement.setting.key);
            template.onChange = onChange;
        }
    }
    exports.$VDb = $VDb;
    class $WDb extends $NDb {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_EXTENSION_TOGGLE_TEMPLATE_ID;
        }
        renderTemplate(_container) {
            const common = super.R(null, _container, 'extension-toggle');
            const actionButton = new button_1.$7Q(common.containerElement, {
                title: false,
                ...defaultStyles_1.$i2
            });
            actionButton.element.classList.add('setting-item-extension-toggle-button');
            actionButton.label = (0, nls_1.localize)(8, null);
            const template = {
                ...common,
                actionButton
            };
            this.S(template);
            return template;
        }
        renderElement(element, index, templateData) {
            super.W(element, index, templateData);
        }
        Z(dataElement, template, onChange) {
            template.elementDisposables.clear();
            const extensionId = dataElement.setting.displayExtensionId;
            template.elementDisposables.add(template.actionButton.onDidClick(async () => {
                this.Q.publicLog2('ManageExtensionClick', { extensionId });
                this.I.executeCommand('extension.open', extensionId);
            }));
        }
    }
    exports.$WDb = $WDb;
    let $XDb = class $XDb {
        constructor(f, h, j, k, l) {
            this.f = f;
            this.h = h;
            this.j = j;
            this.k = k;
            this.l = l;
            this.c = new event_1.$fd();
            this.d = [
                new actions_1.$gi('settings.resetSetting', (0, nls_1.localize)(9, null), undefined, undefined, async (context) => {
                    if (context instanceof settingsTreeModels_1.$uDb) {
                        if (!context.isUntrusted) {
                            this.c.fire({
                                key: context.setting.key,
                                value: undefined,
                                type: context.setting.type,
                                manualReset: true,
                                scope: context.setting.scope
                            });
                        }
                    }
                }),
                new actions_1.$ii(),
                this.f.createInstance(CopySettingIdAction),
                this.f.createInstance(CopySettingAsJSONAction),
            ];
            const actionFactory = (setting, settingTarget) => this.m(setting, settingTarget);
            const emptyActionFactory = (_) => [];
            const settingRenderers = [
                this.f.createInstance($VDb, this.d, actionFactory),
                this.f.createInstance($UDb, this.d, actionFactory),
                this.f.createInstance(SettingArrayRenderer, this.d, actionFactory),
                this.f.createInstance($QDb, this.d, actionFactory),
                this.f.createInstance(SettingTextRenderer, this.d, actionFactory),
                this.f.createInstance(SettingMultilineTextRenderer, this.d, actionFactory),
                this.f.createInstance($RDb, this.d, actionFactory),
                this.f.createInstance($SDb, this.d, actionFactory),
                this.f.createInstance($TDb, this.d, actionFactory),
                this.f.createInstance(SettingObjectRenderer, this.d, actionFactory),
                this.f.createInstance(SettingBoolObjectRenderer, this.d, actionFactory),
                this.f.createInstance($WDb, [], emptyActionFactory)
            ];
            this.onDidClickOverrideElement = event_1.Event.any(...settingRenderers.map(r => r.onDidClickOverrideElement));
            this.onDidChangeSetting = event_1.Event.any(...settingRenderers.map(r => r.onDidChangeSetting), this.c.event);
            this.onDidOpenSettings = event_1.Event.any(...settingRenderers.map(r => r.onDidOpenSettings));
            this.onDidClickSettingLink = event_1.Event.any(...settingRenderers.map(r => r.onDidClickSettingLink));
            this.onDidFocusSetting = event_1.Event.any(...settingRenderers.map(r => r.onDidFocusSetting));
            this.onDidChangeSettingHeight = event_1.Event.any(...settingRenderers.map(r => r.onDidChangeSettingHeight));
            this.onApplyFilter = event_1.Event.any(...settingRenderers.map(r => r.onApplyFilter));
            this.allRenderers = [
                ...settingRenderers,
                this.f.createInstance($ODb),
                this.f.createInstance($PDb),
            ];
        }
        m(setting, settingTarget) {
            const actions = [];
            if (this.k.isEnabled() && setting.scope !== 1 /* ConfigurationScope.APPLICATION */ && settingTarget === 3 /* ConfigurationTarget.USER_LOCAL */) {
                actions.push(this.f.createInstance(ApplySettingToAllProfilesAction, setting));
            }
            if (this.l.isEnabled() && !setting.disallowSyncIgnore) {
                actions.push(this.f.createInstance(SyncSettingAction, setting));
            }
            if (actions.length) {
                actions.splice(0, 0, new actions_1.$ii());
            }
            return actions;
        }
        cancelSuggesters() {
            this.j.hideContextView();
        }
        showContextMenu(element, settingDOMElement) {
            const toolbarElement = settingDOMElement.querySelector('.monaco-toolbar');
            if (toolbarElement) {
                this.h.showContextMenu({
                    getActions: () => this.d,
                    getAnchor: () => toolbarElement,
                    getActionsContext: () => element
                });
            }
        }
        getSettingDOMElementForDOMElement(domElement) {
            const parent = DOM.$QO(domElement, $NDb.CONTENTS_CLASS);
            if (parent) {
                return parent;
            }
            return null;
        }
        getDOMElementsForSettingKey(treeContainer, key) {
            return treeContainer.querySelectorAll(`[${$NDb.SETTING_KEY_ATTR}="${key}"]`);
        }
        getKeyForDOMElementInSetting(element) {
            const settingElement = this.getSettingDOMElementForDOMElement(element);
            return settingElement && settingElement.getAttribute($NDb.SETTING_KEY_ATTR);
        }
        getIdForDOMElementInSetting(element) {
            const settingElement = this.getSettingDOMElementForDOMElement(element);
            return settingElement && settingElement.getAttribute($NDb.SETTING_ID_ATTR);
        }
    };
    exports.$XDb = $XDb;
    exports.$XDb = $XDb = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, contextView_1.$WZ),
        __param(2, contextView_1.$VZ),
        __param(3, userDataProfile_1.$Ek),
        __param(4, userDataSync_1.$Pgb)
    ], $XDb);
    /**
     * Validate and render any error message. Returns true if the value is invalid.
     */
    function renderValidations(dataElement, template, calledOnStartup) {
        if (dataElement.setting.validator) {
            const errMsg = dataElement.setting.validator(template.inputBox.value);
            if (errMsg) {
                template.containerElement.classList.add('invalid-input');
                template.validationErrorMessageElement.innerText = errMsg;
                const validationError = (0, nls_1.localize)(10, null);
                template.inputBox.inputElement.parentElement.setAttribute('aria-label', [validationError, errMsg].join(' '));
                if (!calledOnStartup) {
                    aria.$_P(validationError + ' ' + errMsg);
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
                const validationError = (0, nls_1.localize)(11, null);
                template.containerElement.setAttribute('aria-label', [dataElement.setting.key, validationError, errMsg].join(' '));
                if (!calledOnStartup) {
                    aria.$_P(validationError + ' ' + errMsg);
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
            const targetDisplayFormat = (0, settingsTreeModels_1.$xDb)(settingKey);
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
    let $YDb = class $YDb {
        constructor(c, d) {
            this.c = c;
            this.d = d;
        }
        filter(element, parentVisibility) {
            // Filter during search
            if (this.c.filterToCategory && element instanceof settingsTreeModels_1.$uDb) {
                if (!this.f(element.setting, this.c.filterToCategory)) {
                    return false;
                }
            }
            // Non-user scope selected
            if (element instanceof settingsTreeModels_1.$uDb && this.c.settingsTarget !== 3 /* ConfigurationTarget.USER_LOCAL */) {
                const isRemote = !!this.d.remoteAuthority;
                if (!element.matchesScope(this.c.settingsTarget, isRemote)) {
                    return false;
                }
            }
            // Group with no visible children
            if (element instanceof settingsTreeModels_1.$sDb) {
                if (typeof element.count === 'number') {
                    return element.count > 0;
                }
                return 2 /* TreeVisibility.Recurse */;
            }
            // Filtered "new extensions" button
            if (element instanceof settingsTreeModels_1.$tDb) {
                if (this.c.tagFilters?.size || this.c.filterToCategory) {
                    return false;
                }
            }
            return true;
        }
        f(setting, group) {
            return group.children.some(child => {
                if (child instanceof settingsTreeModels_1.$sDb) {
                    return this.f(setting, child);
                }
                else if (child instanceof settingsTreeModels_1.$uDb) {
                    return child.setting.key === setting.key;
                }
                else {
                    return false;
                }
            });
        }
    };
    exports.$YDb = $YDb;
    exports.$YDb = $YDb = __decorate([
        __param(1, environmentService_1.$hJ)
    ], $YDb);
    class SettingsTreeDelegate extends list_1.$dQ {
        getTemplateId(element) {
            if (element instanceof settingsTreeModels_1.$sDb) {
                return SETTINGS_ELEMENT_TEMPLATE_ID;
            }
            if (element instanceof settingsTreeModels_1.$uDb) {
                if (element.valueType === preferences_2.SettingValueType.ExtensionToggle) {
                    return SETTINGS_EXTENSION_TOGGLE_TEMPLATE_ID;
                }
                const invalidTypeError = element.isConfigured && (0, preferencesValidation_1.$qE)(element.value, element.setting.type);
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
            if (element instanceof settingsTreeModels_1.$tDb) {
                return SETTINGS_NEW_EXTENSIONS_TEMPLATE_ID;
            }
            throw new Error('unknown element type: ' + element);
        }
        hasDynamicHeight(element) {
            return !(element instanceof settingsTreeModels_1.$sDb);
        }
        d(element) {
            if (element instanceof settingsTreeModels_1.$sDb) {
                return 42;
            }
            return element instanceof settingsTreeModels_1.$uDb && element.valueType === preferences_2.SettingValueType.Boolean ? 78 : 104;
        }
    }
    class $ZDb extends objectTreeModel_1.$gS {
        isCollapsible(element) {
            return false;
        }
        setCollapsed(element, collapsed, recursive) {
            return false;
        }
    }
    exports.$ZDb = $ZDb;
    class SettingsTreeAccessibilityProvider {
        constructor(c, d, f) {
            this.c = c;
            this.d = d;
            this.f = f;
        }
        getAriaLabel(element) {
            if (element instanceof settingsTreeModels_1.$uDb) {
                const ariaLabelSections = [];
                ariaLabelSections.push(`${element.displayCategory} ${element.displayLabel}.`);
                if (element.isConfigured) {
                    const modifiedText = (0, nls_1.localize)(12, null);
                    ariaLabelSections.push(modifiedText);
                }
                const indicatorsLabelAriaLabel = (0, settingsEditorSettingIndicators_1.$BDb)(element, this.c, this.f, this.d);
                if (indicatorsLabelAriaLabel.length) {
                    ariaLabelSections.push(`${indicatorsLabelAriaLabel}.`);
                }
                const descriptionWithoutSettingLinks = (0, markdownRenderer_1.$CQ)({ value: fixSettingLinks(element.description, false) });
                if (descriptionWithoutSettingLinks.length) {
                    ariaLabelSections.push(descriptionWithoutSettingLinks);
                }
                return ariaLabelSections.join(' ');
            }
            else if (element instanceof settingsTreeModels_1.$sDb) {
                return element.label;
            }
            else {
                return element.id;
            }
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)(13, null);
        }
    }
    let $1Db = class $1Db extends listService_1.$t4 {
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
                styleController: id => new listWidget_1.$uQ(DOM.$XO(container), id),
                filter: instantiationService.createInstance($YDb, viewState),
                smoothScrolling: configurationService.getValue('workbench.list.smoothScrolling'),
                multipleSelectionSupport: false,
                findWidgetEnabled: false,
                renderIndentGuides: abstractTree_1.RenderIndentGuides.None
            }, instantiationService, contextKeyService, listService, configurationService);
            this.getHTMLElement().classList.add('settings-editor-tree');
            this.style((0, defaultStyles_1.$A2)({
                listBackground: colorRegistry_1.$ww,
                listActiveSelectionBackground: colorRegistry_1.$ww,
                listActiveSelectionForeground: colorRegistry_1.$uv,
                listFocusAndSelectionBackground: colorRegistry_1.$ww,
                listFocusAndSelectionForeground: colorRegistry_1.$uv,
                listFocusBackground: colorRegistry_1.$ww,
                listFocusForeground: colorRegistry_1.$uv,
                listHoverForeground: colorRegistry_1.$uv,
                listHoverBackground: colorRegistry_1.$ww,
                listHoverOutline: colorRegistry_1.$ww,
                listFocusOutline: colorRegistry_1.$ww,
                listInactiveSelectionBackground: colorRegistry_1.$ww,
                listInactiveSelectionForeground: colorRegistry_1.$uv,
                listInactiveFocusBackground: colorRegistry_1.$ww,
                listInactiveFocusOutline: colorRegistry_1.$ww,
                treeIndentGuidesStroke: undefined,
                treeInactiveIndentGuidesStroke: undefined,
            }));
            this.A.add(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('workbench.list.smoothScrolling')) {
                    this.updateOptions({
                        smoothScrolling: configurationService.getValue('workbench.list.smoothScrolling')
                    });
                }
            }));
        }
        I(user, view, options) {
            return new $ZDb(user, view, options);
        }
    };
    exports.$1Db = $1Db;
    exports.$1Db = $1Db = __decorate([
        __param(3, contextkey_1.$3i),
        __param(4, listService_1.$03),
        __param(5, configuration_2.$mE),
        __param(6, instantiation_1.$Ah),
        __param(7, language_1.$ct),
        __param(8, userDataProfile_1.$Ek)
    ], $1Db);
    let CopySettingIdAction = class CopySettingIdAction extends actions_1.$gi {
        static { CopySettingIdAction_1 = this; }
        static { this.ID = 'settings.copySettingId'; }
        static { this.LABEL = (0, nls_1.localize)(14, null); }
        constructor(c) {
            super(CopySettingIdAction_1.ID, CopySettingIdAction_1.LABEL);
            this.c = c;
        }
        async run(context) {
            if (context) {
                await this.c.writeText(context.setting.key);
            }
            return Promise.resolve(undefined);
        }
    };
    CopySettingIdAction = CopySettingIdAction_1 = __decorate([
        __param(0, clipboardService_1.$UZ)
    ], CopySettingIdAction);
    let CopySettingAsJSONAction = class CopySettingAsJSONAction extends actions_1.$gi {
        static { CopySettingAsJSONAction_1 = this; }
        static { this.ID = 'settings.copySettingAsJSON'; }
        static { this.LABEL = (0, nls_1.localize)(15, null); }
        constructor(c) {
            super(CopySettingAsJSONAction_1.ID, CopySettingAsJSONAction_1.LABEL);
            this.c = c;
        }
        async run(context) {
            if (context) {
                const jsonResult = `"${context.setting.key}": ${JSON.stringify(context.value, undefined, '  ')}`;
                await this.c.writeText(jsonResult);
            }
            return Promise.resolve(undefined);
        }
    };
    CopySettingAsJSONAction = CopySettingAsJSONAction_1 = __decorate([
        __param(0, clipboardService_1.$UZ)
    ], CopySettingAsJSONAction);
    let SyncSettingAction = class SyncSettingAction extends actions_1.$gi {
        static { SyncSettingAction_1 = this; }
        static { this.ID = 'settings.stopSyncingSetting'; }
        static { this.LABEL = (0, nls_1.localize)(16, null); }
        constructor(c, f) {
            super(SyncSettingAction_1.ID, SyncSettingAction_1.LABEL);
            this.c = c;
            this.f = f;
            this.B(event_1.Event.filter(f.onDidChangeConfiguration, e => e.affectsConfiguration('settingsSync.ignoredSettings'))(() => this.update()));
            this.update();
        }
        async update() {
            const ignoredSettings = (0, settingsMerge_1.$Uzb)((0, userDataSync_1.$wgb)(), this.f);
            this.checked = !ignoredSettings.includes(this.c.key);
        }
        async run() {
            // first remove the current setting completely from ignored settings
            let currentValue = [...this.f.getValue('settingsSync.ignoredSettings')];
            currentValue = currentValue.filter(v => v !== this.c.key && v !== `-${this.c.key}`);
            const defaultIgnoredSettings = (0, userDataSync_1.$wgb)();
            const isDefaultIgnored = defaultIgnoredSettings.includes(this.c.key);
            const askedToSync = !this.checked;
            // If asked to sync, then add only if it is ignored by default
            if (askedToSync && isDefaultIgnored) {
                currentValue.push(`-${this.c.key}`);
            }
            // If asked not to sync, then add only if it is not ignored by default
            if (!askedToSync && !isDefaultIgnored) {
                currentValue.push(this.c.key);
            }
            this.f.updateValue('settingsSync.ignoredSettings', currentValue.length ? currentValue : undefined, 2 /* ConfigurationTarget.USER */);
            return Promise.resolve(undefined);
        }
    };
    SyncSettingAction = SyncSettingAction_1 = __decorate([
        __param(1, configuration_1.$8h)
    ], SyncSettingAction);
    let ApplySettingToAllProfilesAction = class ApplySettingToAllProfilesAction extends actions_1.$gi {
        static { ApplySettingToAllProfilesAction_1 = this; }
        static { this.ID = 'settings.applyToAllProfiles'; }
        static { this.LABEL = (0, nls_1.localize)(17, null); }
        constructor(c, f) {
            super(ApplySettingToAllProfilesAction_1.ID, ApplySettingToAllProfilesAction_1.LABEL);
            this.c = c;
            this.f = f;
            this.B(event_1.Event.filter(f.onDidChangeConfiguration, e => e.affectsConfiguration(configuration_2.$oE))(() => this.update()));
            this.update();
        }
        update() {
            const allProfilesSettings = this.f.getValue(configuration_2.$oE);
            this.checked = allProfilesSettings.includes(this.c.key);
        }
        async run() {
            // first remove the current setting completely from ignored settings
            const value = this.f.getValue(configuration_2.$oE) ?? [];
            if (this.checked) {
                value.splice(value.indexOf(this.c.key), 1);
            }
            else {
                value.push(this.c.key);
            }
            const newValue = (0, arrays_1.$Kb)(value);
            if (this.checked) {
                await this.f.updateValue(this.c.key, this.f.inspect(this.c.key).application?.value, 3 /* ConfigurationTarget.USER_LOCAL */);
                await this.f.updateValue(configuration_2.$oE, newValue.length ? newValue : undefined, 3 /* ConfigurationTarget.USER_LOCAL */);
            }
            else {
                await this.f.updateValue(configuration_2.$oE, newValue.length ? newValue : undefined, 3 /* ConfigurationTarget.USER_LOCAL */);
                await this.f.updateValue(this.c.key, this.f.inspect(this.c.key).userLocal?.value, 3 /* ConfigurationTarget.USER_LOCAL */);
            }
        }
    };
    ApplySettingToAllProfilesAction = ApplySettingToAllProfilesAction_1 = __decorate([
        __param(1, configuration_2.$mE)
    ], ApplySettingToAllProfilesAction);
});
//# sourceMappingURL=settingsTree.js.map