/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/workbench/common/editor"], function (require, exports, instantiation_1, editor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$FE = exports.$EE = exports.$DE = exports.$CE = exports.$BE = exports.$AE = exports.SettingMatchType = exports.SettingValueType = void 0;
    var SettingValueType;
    (function (SettingValueType) {
        SettingValueType["Null"] = "null";
        SettingValueType["Enum"] = "enum";
        SettingValueType["String"] = "string";
        SettingValueType["MultilineString"] = "multiline-string";
        SettingValueType["Integer"] = "integer";
        SettingValueType["Number"] = "number";
        SettingValueType["Boolean"] = "boolean";
        SettingValueType["Array"] = "array";
        SettingValueType["Exclude"] = "exclude";
        SettingValueType["Include"] = "include";
        SettingValueType["Complex"] = "complex";
        SettingValueType["NullableInteger"] = "nullable-integer";
        SettingValueType["NullableNumber"] = "nullable-number";
        SettingValueType["Object"] = "object";
        SettingValueType["BooleanObject"] = "boolean-object";
        SettingValueType["LanguageTag"] = "language-tag";
        SettingValueType["ExtensionToggle"] = "extension-toggle";
    })(SettingValueType || (exports.SettingValueType = SettingValueType = {}));
    /**
     * The ways a setting could match a query,
     * sorted in increasing order of relevance.
     * For now, ignore description and value matches.
     */
    var SettingMatchType;
    (function (SettingMatchType) {
        SettingMatchType[SettingMatchType["None"] = 0] = "None";
        SettingMatchType[SettingMatchType["RemoteMatch"] = 1] = "RemoteMatch";
        SettingMatchType[SettingMatchType["WholeWordMatch"] = 2] = "WholeWordMatch";
        SettingMatchType[SettingMatchType["KeyMatch"] = 4] = "KeyMatch";
    })(SettingMatchType || (exports.SettingMatchType = SettingMatchType = {}));
    function $AE(options) {
        return {
            // Inherit provided options
            ...options,
            // Enforce some options for settings specifically
            override: editor_1.$HE.id,
            pinned: true
        };
    }
    exports.$AE = $AE;
    exports.$BE = (0, instantiation_1.$Bh)('preferencesService');
    exports.$CE = 'editor.contrib.defineKeybinding';
    exports.$DE = '.vscode/settings.json';
    exports.$EE = 'workbench.settings.openDefaultSettings';
    exports.$FE = 'workbench.settings.useSplitJSON';
});
//# sourceMappingURL=preferences.js.map