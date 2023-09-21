/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/configuration"], function (require, exports, nls_1, configurationRegistry_1, platform_1, contextkey_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerAccessibilityConfiguration = exports.AccessibleViewProviderId = exports.AccessibilityVerbositySettingId = exports.ViewDimUnfocusedOpacityProperties = exports.AccessibilityWorkbenchSettingId = exports.accessibleViewCurrentProviderId = exports.accessibleViewOnLastLine = exports.accessibleViewGoToSymbolSupported = exports.accessibleViewVerbosityEnabled = exports.accessibleViewSupportsNavigation = exports.accessibleViewIsShown = exports.accessibilityHelpIsShown = void 0;
    exports.accessibilityHelpIsShown = new contextkey_1.RawContextKey('accessibilityHelpIsShown', false, true);
    exports.accessibleViewIsShown = new contextkey_1.RawContextKey('accessibleViewIsShown', false, true);
    exports.accessibleViewSupportsNavigation = new contextkey_1.RawContextKey('accessibleViewSupportsNavigation', false, true);
    exports.accessibleViewVerbosityEnabled = new contextkey_1.RawContextKey('accessibleViewVerbosityEnabled', false, true);
    exports.accessibleViewGoToSymbolSupported = new contextkey_1.RawContextKey('accessibleViewGoToSymbolSupported', false, true);
    exports.accessibleViewOnLastLine = new contextkey_1.RawContextKey('accessibleViewOnLastLine', false, true);
    exports.accessibleViewCurrentProviderId = new contextkey_1.RawContextKey('accessibleViewCurrentProviderId', undefined, undefined);
    /**
     * Miscellaneous settings tagged with accessibility and implemented in the accessibility contrib but
     * were better to live under workbench for discoverability.
     */
    var AccessibilityWorkbenchSettingId;
    (function (AccessibilityWorkbenchSettingId) {
        AccessibilityWorkbenchSettingId["DimUnfocusedEnabled"] = "accessibility.dimUnfocused.enabled";
        AccessibilityWorkbenchSettingId["DimUnfocusedOpacity"] = "accessibility.dimUnfocused.opacity";
    })(AccessibilityWorkbenchSettingId || (exports.AccessibilityWorkbenchSettingId = AccessibilityWorkbenchSettingId = {}));
    var ViewDimUnfocusedOpacityProperties;
    (function (ViewDimUnfocusedOpacityProperties) {
        ViewDimUnfocusedOpacityProperties[ViewDimUnfocusedOpacityProperties["Default"] = 0.75] = "Default";
        ViewDimUnfocusedOpacityProperties[ViewDimUnfocusedOpacityProperties["Minimum"] = 0.2] = "Minimum";
        ViewDimUnfocusedOpacityProperties[ViewDimUnfocusedOpacityProperties["Maximum"] = 1] = "Maximum";
    })(ViewDimUnfocusedOpacityProperties || (exports.ViewDimUnfocusedOpacityProperties = ViewDimUnfocusedOpacityProperties = {}));
    var AccessibilityVerbositySettingId;
    (function (AccessibilityVerbositySettingId) {
        AccessibilityVerbositySettingId["Terminal"] = "accessibility.verbosity.terminal";
        AccessibilityVerbositySettingId["DiffEditor"] = "accessibility.verbosity.diffEditor";
        AccessibilityVerbositySettingId["Chat"] = "accessibility.verbosity.panelChat";
        AccessibilityVerbositySettingId["InlineChat"] = "accessibility.verbosity.inlineChat";
        AccessibilityVerbositySettingId["InlineCompletions"] = "accessibility.verbosity.inlineCompletions";
        AccessibilityVerbositySettingId["KeybindingsEditor"] = "accessibility.verbosity.keybindingsEditor";
        AccessibilityVerbositySettingId["Notebook"] = "accessibility.verbosity.notebook";
        AccessibilityVerbositySettingId["Editor"] = "accessibility.verbosity.editor";
        AccessibilityVerbositySettingId["Hover"] = "accessibility.verbosity.hover";
        AccessibilityVerbositySettingId["Notification"] = "accessibility.verbosity.notification";
        AccessibilityVerbositySettingId["EmptyEditorHint"] = "accessibility.verbosity.emptyEditorHint";
    })(AccessibilityVerbositySettingId || (exports.AccessibilityVerbositySettingId = AccessibilityVerbositySettingId = {}));
    var AccessibleViewProviderId;
    (function (AccessibleViewProviderId) {
        AccessibleViewProviderId["Terminal"] = "terminal";
        AccessibleViewProviderId["DiffEditor"] = "diffEditor";
        AccessibleViewProviderId["Chat"] = "panelChat";
        AccessibleViewProviderId["InlineChat"] = "inlineChat";
        AccessibleViewProviderId["InlineCompletions"] = "inlineCompletions";
        AccessibleViewProviderId["KeybindingsEditor"] = "keybindingsEditor";
        AccessibleViewProviderId["Notebook"] = "notebook";
        AccessibleViewProviderId["Editor"] = "editor";
        AccessibleViewProviderId["Hover"] = "hover";
        AccessibleViewProviderId["Notification"] = "notification";
        AccessibleViewProviderId["EmptyEditorHint"] = "emptyEditorHint";
    })(AccessibleViewProviderId || (exports.AccessibleViewProviderId = AccessibleViewProviderId = {}));
    const baseProperty = {
        type: 'boolean',
        default: true,
        tags: ['accessibility']
    };
    const configuration = {
        id: 'accessibility',
        title: (0, nls_1.localize)('accessibilityConfigurationTitle', "Accessibility"),
        type: 'object',
        properties: {
            ["accessibility.verbosity.terminal" /* AccessibilityVerbositySettingId.Terminal */]: {
                description: (0, nls_1.localize)('verbosity.terminal.description', 'Provide information about how to access the terminal accessibility help menu when the terminal is focused'),
                ...baseProperty
            },
            ["accessibility.verbosity.diffEditor" /* AccessibilityVerbositySettingId.DiffEditor */]: {
                description: (0, nls_1.localize)('verbosity.diffEditor.description', 'Provide information about how to navigate changes in the diff editor when it is focused'),
                ...baseProperty
            },
            ["accessibility.verbosity.panelChat" /* AccessibilityVerbositySettingId.Chat */]: {
                description: (0, nls_1.localize)('verbosity.chat.description', 'Provide information about how to access the chat help menu when the chat input is focused'),
                ...baseProperty
            },
            ["accessibility.verbosity.inlineChat" /* AccessibilityVerbositySettingId.InlineChat */]: {
                description: (0, nls_1.localize)('verbosity.interactiveEditor.description', 'Provide information about how to access the inline editor chat accessibility help menu and alert with hints which describe how to use the feature when the input is focused'),
                ...baseProperty
            },
            ["accessibility.verbosity.inlineCompletions" /* AccessibilityVerbositySettingId.InlineCompletions */]: {
                description: (0, nls_1.localize)('verbosity.inlineCompletions.description', 'Provide information about how to access the inline completions hover and accessible view'),
                ...baseProperty
            },
            ["accessibility.verbosity.keybindingsEditor" /* AccessibilityVerbositySettingId.KeybindingsEditor */]: {
                description: (0, nls_1.localize)('verbosity.keybindingsEditor.description', 'Provide information about how to change a keybinding in the keybindings editor when a row is focused'),
                ...baseProperty
            },
            ["accessibility.verbosity.notebook" /* AccessibilityVerbositySettingId.Notebook */]: {
                description: (0, nls_1.localize)('verbosity.notebook', 'Provide information about how to focus the cell container or inner editor when a notebook cell is focused.'),
                ...baseProperty
            },
            ["accessibility.verbosity.hover" /* AccessibilityVerbositySettingId.Hover */]: {
                description: (0, nls_1.localize)('verbosity.hover', 'Provide information about how to open the hover in an accessible view.'),
                ...baseProperty
            },
            ["accessibility.verbosity.notification" /* AccessibilityVerbositySettingId.Notification */]: {
                description: (0, nls_1.localize)('verbosity.notification', 'Provide information about how to open the notification in an accessible view.'),
                ...baseProperty
            },
            ["accessibility.verbosity.emptyEditorHint" /* AccessibilityVerbositySettingId.EmptyEditorHint */]: {
                description: (0, nls_1.localize)('verbosity.emptyEditorHint', 'Provide information about relevant actions in an empty text editor.'),
                ...baseProperty
            }
        }
    };
    function registerAccessibilityConfiguration() {
        const registry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
        registry.registerConfiguration(configuration);
        registry.registerConfiguration({
            ...configuration_1.workbenchConfigurationNodeBase,
            properties: {
                ["accessibility.dimUnfocused.enabled" /* AccessibilityWorkbenchSettingId.DimUnfocusedEnabled */]: {
                    description: (0, nls_1.localize)('dimUnfocusedEnabled', 'Whether to dim unfocused editors and terminals, which makes it more clear where typed input will go to. This works with the majority of editors with the notable exceptions of those that utilize iframes like notebooks and extension webview editors.'),
                    type: 'boolean',
                    default: false,
                    tags: ['accessibility'],
                    scope: 1 /* ConfigurationScope.APPLICATION */,
                },
                ["accessibility.dimUnfocused.opacity" /* AccessibilityWorkbenchSettingId.DimUnfocusedOpacity */]: {
                    markdownDescription: (0, nls_1.localize)('dimUnfocusedOpacity', 'The opacity fraction (0.2 to 1.0) to use for unfocused editors and terminals. This will only take effect when {0} is enabled.', `\`#${"accessibility.dimUnfocused.enabled" /* AccessibilityWorkbenchSettingId.DimUnfocusedEnabled */}#\``),
                    type: 'number',
                    minimum: 0.2 /* ViewDimUnfocusedOpacityProperties.Minimum */,
                    maximum: 1 /* ViewDimUnfocusedOpacityProperties.Maximum */,
                    default: 0.75 /* ViewDimUnfocusedOpacityProperties.Default */,
                    tags: ['accessibility'],
                    scope: 1 /* ConfigurationScope.APPLICATION */,
                }
            }
        });
    }
    exports.registerAccessibilityConfiguration = registerAccessibilityConfiguration;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjZXNzaWJpbGl0eUNvbmZpZ3VyYXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9hY2Nlc3NpYmlsaXR5L2Jyb3dzZXIvYWNjZXNzaWJpbGl0eUNvbmZpZ3VyYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUW5GLFFBQUEsd0JBQXdCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLDBCQUEwQixFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMvRixRQUFBLHFCQUFxQixHQUFHLElBQUksMEJBQWEsQ0FBVSx1QkFBdUIsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDekYsUUFBQSxnQ0FBZ0MsR0FBRyxJQUFJLDBCQUFhLENBQVUsa0NBQWtDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQy9HLFFBQUEsOEJBQThCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLGdDQUFnQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMzRyxRQUFBLGlDQUFpQyxHQUFHLElBQUksMEJBQWEsQ0FBVSxtQ0FBbUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDakgsUUFBQSx3QkFBd0IsR0FBRyxJQUFJLDBCQUFhLENBQVUsMEJBQTBCLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQy9GLFFBQUEsK0JBQStCLEdBQUcsSUFBSSwwQkFBYSxDQUFTLGlDQUFpQyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUVsSTs7O09BR0c7SUFDSCxJQUFrQiwrQkFHakI7SUFIRCxXQUFrQiwrQkFBK0I7UUFDaEQsNkZBQTBELENBQUE7UUFDMUQsNkZBQTBELENBQUE7SUFDM0QsQ0FBQyxFQUhpQiwrQkFBK0IsK0NBQS9CLCtCQUErQixRQUdoRDtJQUVELElBQWtCLGlD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