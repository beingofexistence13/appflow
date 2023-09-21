/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/workbench/common/editor"], function (require, exports, instantiation_1, editor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.USE_SPLIT_JSON_SETTING = exports.DEFAULT_SETTINGS_EDITOR_SETTING = exports.FOLDER_SETTINGS_PATH = exports.DEFINE_KEYBINDING_EDITOR_CONTRIB_ID = exports.IPreferencesService = exports.validateSettingsEditorOptions = exports.SettingMatchType = exports.SettingValueType = void 0;
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
    function validateSettingsEditorOptions(options) {
        return {
            // Inherit provided options
            ...options,
            // Enforce some options for settings specifically
            override: editor_1.DEFAULT_EDITOR_ASSOCIATION.id,
            pinned: true
        };
    }
    exports.validateSettingsEditorOptions = validateSettingsEditorOptions;
    exports.IPreferencesService = (0, instantiation_1.createDecorator)('preferencesService');
    exports.DEFINE_KEYBINDING_EDITOR_CONTRIB_ID = 'editor.contrib.defineKeybinding';
    exports.FOLDER_SETTINGS_PATH = '.vscode/settings.json';
    exports.DEFAULT_SETTINGS_EDITOR_SETTING = 'workbench.settings.openDefaultSettings';
    exports.USE_SPLIT_JSON_SETTING = 'workbench.settings.useSplitJSON';
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmVyZW5jZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvcHJlZmVyZW5jZXMvY29tbW9uL3ByZWZlcmVuY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXFCaEcsSUFBWSxnQkFrQlg7SUFsQkQsV0FBWSxnQkFBZ0I7UUFDM0IsaUNBQWEsQ0FBQTtRQUNiLGlDQUFhLENBQUE7UUFDYixxQ0FBaUIsQ0FBQTtRQUNqQix3REFBb0MsQ0FBQTtRQUNwQyx1Q0FBbUIsQ0FBQTtRQUNuQixxQ0FBaUIsQ0FBQTtRQUNqQix1Q0FBbUIsQ0FBQTtRQUNuQixtQ0FBZSxDQUFBO1FBQ2YsdUNBQW1CLENBQUE7UUFDbkIsdUNBQW1CLENBQUE7UUFDbkIsdUNBQW1CLENBQUE7UUFDbkIsd0RBQW9DLENBQUE7UUFDcEMsc0RBQWtDLENBQUE7UUFDbEMscUNBQWlCLENBQUE7UUFDakIsb0RBQWdDLENBQUE7UUFDaEMsZ0RBQTRCLENBQUE7UUFDNUIsd0RBQW9DLENBQUE7SUFDckMsQ0FBQyxFQWxCVyxnQkFBZ0IsZ0NBQWhCLGdCQUFnQixRQWtCM0I7SUEyRkQ7Ozs7T0FJRztJQUNILElBQVksZ0JBS1g7SUFMRCxXQUFZLGdCQUFnQjtRQUMzQix1REFBUSxDQUFBO1FBQ1IscUVBQW9CLENBQUE7UUFDcEIsMkVBQXVCLENBQUE7UUFDdkIsK0RBQWlCLENBQUE7SUFDbEIsQ0FBQyxFQUxXLGdCQUFnQixnQ0FBaEIsZ0JBQWdCLFFBSzNCO0lBdUVELFNBQWdCLDZCQUE2QixDQUFDLE9BQStCO1FBQzVFLE9BQU87WUFDTiwyQkFBMkI7WUFDM0IsR0FBRyxPQUFPO1lBRVYsaURBQWlEO1lBQ2pELFFBQVEsRUFBRSxtQ0FBMEIsQ0FBQyxFQUFFO1lBQ3ZDLE1BQU0sRUFBRSxJQUFJO1NBQ1osQ0FBQztJQUNILENBQUM7SUFURCxzRUFTQztJQVNZLFFBQUEsbUJBQW1CLEdBQUcsSUFBQSwrQkFBZSxFQUFzQixvQkFBb0IsQ0FBQyxDQUFDO0lBd0ZqRixRQUFBLG1DQUFtQyxHQUFHLGlDQUFpQyxDQUFDO0lBS3hFLFFBQUEsb0JBQW9CLEdBQUcsdUJBQXVCLENBQUM7SUFDL0MsUUFBQSwrQkFBK0IsR0FBRyx3Q0FBd0MsQ0FBQztJQUMzRSxRQUFBLHNCQUFzQixHQUFHLGlDQUFpQyxDQUFDIn0=