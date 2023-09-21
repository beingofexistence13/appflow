/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/accessibility/browser/accessibilityConfiguration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/configuration"], function (require, exports, nls_1, configurationRegistry_1, platform_1, contextkey_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$pqb = exports.AccessibleViewProviderId = exports.AccessibilityVerbositySettingId = exports.ViewDimUnfocusedOpacityProperties = exports.AccessibilityWorkbenchSettingId = exports.$oqb = exports.$nqb = exports.$mqb = exports.$lqb = exports.$kqb = exports.$jqb = exports.$iqb = void 0;
    exports.$iqb = new contextkey_1.$2i('accessibilityHelpIsShown', false, true);
    exports.$jqb = new contextkey_1.$2i('accessibleViewIsShown', false, true);
    exports.$kqb = new contextkey_1.$2i('accessibleViewSupportsNavigation', false, true);
    exports.$lqb = new contextkey_1.$2i('accessibleViewVerbosityEnabled', false, true);
    exports.$mqb = new contextkey_1.$2i('accessibleViewGoToSymbolSupported', false, true);
    exports.$nqb = new contextkey_1.$2i('accessibleViewOnLastLine', false, true);
    exports.$oqb = new contextkey_1.$2i('accessibleViewCurrentProviderId', undefined, undefined);
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
        title: (0, nls_1.localize)(0, null),
        type: 'object',
        properties: {
            ["accessibility.verbosity.terminal" /* AccessibilityVerbositySettingId.Terminal */]: {
                description: (0, nls_1.localize)(1, null),
                ...baseProperty
            },
            ["accessibility.verbosity.diffEditor" /* AccessibilityVerbositySettingId.DiffEditor */]: {
                description: (0, nls_1.localize)(2, null),
                ...baseProperty
            },
            ["accessibility.verbosity.panelChat" /* AccessibilityVerbositySettingId.Chat */]: {
                description: (0, nls_1.localize)(3, null),
                ...baseProperty
            },
            ["accessibility.verbosity.inlineChat" /* AccessibilityVerbositySettingId.InlineChat */]: {
                description: (0, nls_1.localize)(4, null),
                ...baseProperty
            },
            ["accessibility.verbosity.inlineCompletions" /* AccessibilityVerbositySettingId.InlineCompletions */]: {
                description: (0, nls_1.localize)(5, null),
                ...baseProperty
            },
            ["accessibility.verbosity.keybindingsEditor" /* AccessibilityVerbositySettingId.KeybindingsEditor */]: {
                description: (0, nls_1.localize)(6, null),
                ...baseProperty
            },
            ["accessibility.verbosity.notebook" /* AccessibilityVerbositySettingId.Notebook */]: {
                description: (0, nls_1.localize)(7, null),
                ...baseProperty
            },
            ["accessibility.verbosity.hover" /* AccessibilityVerbositySettingId.Hover */]: {
                description: (0, nls_1.localize)(8, null),
                ...baseProperty
            },
            ["accessibility.verbosity.notification" /* AccessibilityVerbositySettingId.Notification */]: {
                description: (0, nls_1.localize)(9, null),
                ...baseProperty
            },
            ["accessibility.verbosity.emptyEditorHint" /* AccessibilityVerbositySettingId.EmptyEditorHint */]: {
                description: (0, nls_1.localize)(10, null),
                ...baseProperty
            }
        }
    };
    function $pqb() {
        const registry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
        registry.registerConfiguration(configuration);
        registry.registerConfiguration({
            ...configuration_1.$$y,
            properties: {
                ["accessibility.dimUnfocused.enabled" /* AccessibilityWorkbenchSettingId.DimUnfocusedEnabled */]: {
                    description: (0, nls_1.localize)(11, null),
                    type: 'boolean',
                    default: false,
                    tags: ['accessibility'],
                    scope: 1 /* ConfigurationScope.APPLICATION */,
                },
                ["accessibility.dimUnfocused.opacity" /* AccessibilityWorkbenchSettingId.DimUnfocusedOpacity */]: {
                    markdownDescription: (0, nls_1.localize)(12, null, `\`#${"accessibility.dimUnfocused.enabled" /* AccessibilityWorkbenchSettingId.DimUnfocusedEnabled */}#\``),
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
    exports.$pqb = $pqb;
});
//# sourceMappingURL=accessibilityConfiguration.js.map