/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation"], function (require, exports, contextkey_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getExperimentalExtensionToggleData = exports.ENABLE_EXTENSION_TOGGLE_SETTINGS = exports.ENABLE_LANGUAGE_FILTER = exports.KEYBOARD_LAYOUT_OPEN_PICKER = exports.REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG = exports.WORKSPACE_TRUST_SETTING_TAG = exports.POLICY_SETTING_TAG = exports.GENERAL_TAG_SETTING_TAG = exports.LANGUAGE_SETTING_TAG = exports.ID_SETTING_TAG = exports.FEATURE_SETTING_TAG = exports.EXTENSION_SETTING_TAG = exports.MODIFIED_SETTING_TAG = exports.KEYBINDINGS_EDITOR_SHOW_EXTENSION_KEYBINDINGS = exports.KEYBINDINGS_EDITOR_SHOW_USER_KEYBINDINGS = exports.KEYBINDINGS_EDITOR_SHOW_DEFAULT_KEYBINDINGS = exports.KEYBINDINGS_EDITOR_COMMAND_FOCUS_KEYBINDINGS = exports.KEYBINDINGS_EDITOR_COMMAND_SHOW_SIMILAR = exports.KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND_TITLE = exports.KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND = exports.KEYBINDINGS_EDITOR_COMMAND_COPY = exports.KEYBINDINGS_EDITOR_COMMAND_RESET = exports.KEYBINDINGS_EDITOR_COMMAND_REMOVE = exports.KEYBINDINGS_EDITOR_COMMAND_REJECT_WHEN = exports.KEYBINDINGS_EDITOR_COMMAND_ACCEPT_WHEN = exports.KEYBINDINGS_EDITOR_COMMAND_DEFINE_WHEN = exports.KEYBINDINGS_EDITOR_COMMAND_ADD = exports.KEYBINDINGS_EDITOR_COMMAND_DEFINE = exports.KEYBINDINGS_EDITOR_COMMAND_SORTBY_PRECEDENCE = exports.KEYBINDINGS_EDITOR_COMMAND_RECORD_SEARCH_KEYS = exports.KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_HISTORY = exports.KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS = exports.KEYBINDINGS_EDITOR_COMMAND_SEARCH = exports.CONTEXT_WHEN_FOCUS = exports.CONTEXT_KEYBINDING_FOCUS = exports.CONTEXT_KEYBINDINGS_SEARCH_FOCUS = exports.CONTEXT_KEYBINDINGS_EDITOR = exports.CONTEXT_SETTINGS_ROW_FOCUS = exports.CONTEXT_TOC_ROW_FOCUS = exports.CONTEXT_SETTINGS_SEARCH_FOCUS = exports.CONTEXT_SETTINGS_JSON_EDITOR = exports.CONTEXT_SETTINGS_EDITOR = exports.SETTINGS_EDITOR_COMMAND_SUGGEST_FILTERS = exports.SETTINGS_EDITOR_COMMAND_SHOW_CONTEXT_MENU = exports.SETTINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS = exports.IPreferencesSearchService = void 0;
    exports.IPreferencesSearchService = (0, instantiation_1.createDecorator)('preferencesSearchService');
    exports.SETTINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS = 'settings.action.clearSearchResults';
    exports.SETTINGS_EDITOR_COMMAND_SHOW_CONTEXT_MENU = 'settings.action.showContextMenu';
    exports.SETTINGS_EDITOR_COMMAND_SUGGEST_FILTERS = 'settings.action.suggestFilters';
    exports.CONTEXT_SETTINGS_EDITOR = new contextkey_1.RawContextKey('inSettingsEditor', false);
    exports.CONTEXT_SETTINGS_JSON_EDITOR = new contextkey_1.RawContextKey('inSettingsJSONEditor', false);
    exports.CONTEXT_SETTINGS_SEARCH_FOCUS = new contextkey_1.RawContextKey('inSettingsSearch', false);
    exports.CONTEXT_TOC_ROW_FOCUS = new contextkey_1.RawContextKey('settingsTocRowFocus', false);
    exports.CONTEXT_SETTINGS_ROW_FOCUS = new contextkey_1.RawContextKey('settingRowFocus', false);
    exports.CONTEXT_KEYBINDINGS_EDITOR = new contextkey_1.RawContextKey('inKeybindings', false);
    exports.CONTEXT_KEYBINDINGS_SEARCH_FOCUS = new contextkey_1.RawContextKey('inKeybindingsSearch', false);
    exports.CONTEXT_KEYBINDING_FOCUS = new contextkey_1.RawContextKey('keybindingFocus', false);
    exports.CONTEXT_WHEN_FOCUS = new contextkey_1.RawContextKey('whenFocus', false);
    exports.KEYBINDINGS_EDITOR_COMMAND_SEARCH = 'keybindings.editor.searchKeybindings';
    exports.KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS = 'keybindings.editor.clearSearchResults';
    exports.KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_HISTORY = 'keybindings.editor.clearSearchHistory';
    exports.KEYBINDINGS_EDITOR_COMMAND_RECORD_SEARCH_KEYS = 'keybindings.editor.recordSearchKeys';
    exports.KEYBINDINGS_EDITOR_COMMAND_SORTBY_PRECEDENCE = 'keybindings.editor.toggleSortByPrecedence';
    exports.KEYBINDINGS_EDITOR_COMMAND_DEFINE = 'keybindings.editor.defineKeybinding';
    exports.KEYBINDINGS_EDITOR_COMMAND_ADD = 'keybindings.editor.addKeybinding';
    exports.KEYBINDINGS_EDITOR_COMMAND_DEFINE_WHEN = 'keybindings.editor.defineWhenExpression';
    exports.KEYBINDINGS_EDITOR_COMMAND_ACCEPT_WHEN = 'keybindings.editor.acceptWhenExpression';
    exports.KEYBINDINGS_EDITOR_COMMAND_REJECT_WHEN = 'keybindings.editor.rejectWhenExpression';
    exports.KEYBINDINGS_EDITOR_COMMAND_REMOVE = 'keybindings.editor.removeKeybinding';
    exports.KEYBINDINGS_EDITOR_COMMAND_RESET = 'keybindings.editor.resetKeybinding';
    exports.KEYBINDINGS_EDITOR_COMMAND_COPY = 'keybindings.editor.copyKeybindingEntry';
    exports.KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND = 'keybindings.editor.copyCommandKeybindingEntry';
    exports.KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND_TITLE = 'keybindings.editor.copyCommandTitle';
    exports.KEYBINDINGS_EDITOR_COMMAND_SHOW_SIMILAR = 'keybindings.editor.showConflicts';
    exports.KEYBINDINGS_EDITOR_COMMAND_FOCUS_KEYBINDINGS = 'keybindings.editor.focusKeybindings';
    exports.KEYBINDINGS_EDITOR_SHOW_DEFAULT_KEYBINDINGS = 'keybindings.editor.showDefaultKeybindings';
    exports.KEYBINDINGS_EDITOR_SHOW_USER_KEYBINDINGS = 'keybindings.editor.showUserKeybindings';
    exports.KEYBINDINGS_EDITOR_SHOW_EXTENSION_KEYBINDINGS = 'keybindings.editor.showExtensionKeybindings';
    exports.MODIFIED_SETTING_TAG = 'modified';
    exports.EXTENSION_SETTING_TAG = 'ext:';
    exports.FEATURE_SETTING_TAG = 'feature:';
    exports.ID_SETTING_TAG = 'id:';
    exports.LANGUAGE_SETTING_TAG = 'lang:';
    exports.GENERAL_TAG_SETTING_TAG = 'tag:';
    exports.POLICY_SETTING_TAG = 'hasPolicy';
    exports.WORKSPACE_TRUST_SETTING_TAG = 'workspaceTrust';
    exports.REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG = 'requireTrustedWorkspace';
    exports.KEYBOARD_LAYOUT_OPEN_PICKER = 'workbench.action.openKeyboardLayoutPicker';
    exports.ENABLE_LANGUAGE_FILTER = true;
    exports.ENABLE_EXTENSION_TOGGLE_SETTINGS = true;
    let cachedExtensionToggleData;
    async function getExperimentalExtensionToggleData(workbenchAssignmentService, environmentService, productService) {
        if (!exports.ENABLE_EXTENSION_TOGGLE_SETTINGS) {
            return undefined;
        }
        if (cachedExtensionToggleData) {
            return cachedExtensionToggleData;
        }
        const isTreatment = await workbenchAssignmentService.getTreatment('ExtensionToggleSettings');
        if ((isTreatment || !environmentService.isBuilt) && productService.extensionRecommendations && productService.commonlyUsedSettings) {
            const settingsEditorRecommendedExtensions = {};
            Object.keys(productService.extensionRecommendations).forEach(extensionId => {
                const extensionInfo = productService.extensionRecommendations[extensionId];
                if (extensionInfo.onSettingsEditorOpen) {
                    settingsEditorRecommendedExtensions[extensionId] = extensionInfo;
                }
            });
            cachedExtensionToggleData = {
                settingsEditorRecommendedExtensions,
                commonlyUsed: productService.commonlyUsedSettings
            };
            return cachedExtensionToggleData;
        }
        return undefined;
    }
    exports.getExperimentalExtensionToggleData = getExperimentalExtensionToggleData;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmVyZW5jZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9wcmVmZXJlbmNlcy9jb21tb24vcHJlZmVyZW5jZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBK0JuRixRQUFBLHlCQUF5QixHQUFHLElBQUEsK0JBQWUsRUFBNEIsMEJBQTBCLENBQUMsQ0FBQztJQWFuRyxRQUFBLDRDQUE0QyxHQUFHLG9DQUFvQyxDQUFDO0lBQ3BGLFFBQUEseUNBQXlDLEdBQUcsaUNBQWlDLENBQUM7SUFDOUUsUUFBQSx1Q0FBdUMsR0FBRyxnQ0FBZ0MsQ0FBQztJQUUzRSxRQUFBLHVCQUF1QixHQUFHLElBQUksMEJBQWEsQ0FBVSxrQkFBa0IsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNoRixRQUFBLDRCQUE0QixHQUFHLElBQUksMEJBQWEsQ0FBVSxzQkFBc0IsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN6RixRQUFBLDZCQUE2QixHQUFHLElBQUksMEJBQWEsQ0FBVSxrQkFBa0IsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN0RixRQUFBLHFCQUFxQixHQUFHLElBQUksMEJBQWEsQ0FBVSxxQkFBcUIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNqRixRQUFBLDBCQUEwQixHQUFHLElBQUksMEJBQWEsQ0FBVSxpQkFBaUIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNsRixRQUFBLDBCQUEwQixHQUFHLElBQUksMEJBQWEsQ0FBVSxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDaEYsUUFBQSxnQ0FBZ0MsR0FBRyxJQUFJLDBCQUFhLENBQVUscUJBQXFCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDNUYsUUFBQSx3QkFBd0IsR0FBRyxJQUFJLDBCQUFhLENBQVUsaUJBQWlCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDaEYsUUFBQSxrQkFBa0Is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