/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/base/common/types"], function (require, exports, instantiation_1, themeService_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionData = exports.$ogb = exports.$ngb = exports.ThemeSettingDefaults = exports.ThemeSettings = exports.$mgb = exports.$lgb = exports.$kgb = exports.$jgb = exports.$igb = exports.$hgb = exports.$ggb = exports.$fgb = exports.$egb = void 0;
    exports.$egb = (0, instantiation_1.$Ch)(themeService_1.$gv);
    exports.$fgb = 'vs';
    exports.$ggb = 'vs-dark';
    exports.$hgb = 'hc-black';
    exports.$igb = 'hc-light';
    exports.$jgb = '[';
    exports.$kgb = ']';
    exports.$lgb = '*';
    exports.$mgb = /\[(.+?)\]/g;
    var ThemeSettings;
    (function (ThemeSettings) {
        ThemeSettings["COLOR_THEME"] = "workbench.colorTheme";
        ThemeSettings["FILE_ICON_THEME"] = "workbench.iconTheme";
        ThemeSettings["PRODUCT_ICON_THEME"] = "workbench.productIconTheme";
        ThemeSettings["COLOR_CUSTOMIZATIONS"] = "workbench.colorCustomizations";
        ThemeSettings["TOKEN_COLOR_CUSTOMIZATIONS"] = "editor.tokenColorCustomizations";
        ThemeSettings["SEMANTIC_TOKEN_COLOR_CUSTOMIZATIONS"] = "editor.semanticTokenColorCustomizations";
        ThemeSettings["PREFERRED_DARK_THEME"] = "workbench.preferredDarkColorTheme";
        ThemeSettings["PREFERRED_LIGHT_THEME"] = "workbench.preferredLightColorTheme";
        ThemeSettings["PREFERRED_HC_DARK_THEME"] = "workbench.preferredHighContrastColorTheme";
        ThemeSettings["PREFERRED_HC_LIGHT_THEME"] = "workbench.preferredHighContrastLightColorTheme";
        ThemeSettings["DETECT_COLOR_SCHEME"] = "window.autoDetectColorScheme";
        ThemeSettings["DETECT_HC"] = "window.autoDetectHighContrast";
    })(ThemeSettings || (exports.ThemeSettings = ThemeSettings = {}));
    var ThemeSettingDefaults;
    (function (ThemeSettingDefaults) {
        ThemeSettingDefaults["COLOR_THEME_DARK"] = "Default Dark Modern";
        ThemeSettingDefaults["COLOR_THEME_LIGHT"] = "Default Light Modern";
        ThemeSettingDefaults["COLOR_THEME_HC_DARK"] = "Default High Contrast";
        ThemeSettingDefaults["COLOR_THEME_HC_LIGHT"] = "Default High Contrast Light";
        ThemeSettingDefaults["COLOR_THEME_DARK_OLD"] = "Default Dark+";
        ThemeSettingDefaults["COLOR_THEME_LIGHT_OLD"] = "Default Light+";
        ThemeSettingDefaults["FILE_ICON_THEME"] = "vs-seti";
        ThemeSettingDefaults["PRODUCT_ICON_THEME"] = "Default";
    })(ThemeSettingDefaults || (exports.ThemeSettingDefaults = ThemeSettingDefaults = {}));
    exports.$ngb = {
        'activityBar.background': '#181818',
        'statusBar.background': '#181818',
        'statusBar.noFolderBackground': '#1f1f1f',
    };
    exports.$ogb = {
        'activityBar.background': '#f8f8f8',
        'statusBar.background': '#f8f8f8',
        'statusBar.noFolderBackground': '#f8f8f8'
    };
    var ExtensionData;
    (function (ExtensionData) {
        function toJSONObject(d) {
            return d && { _extensionId: d.extensionId, _extensionIsBuiltin: d.extensionIsBuiltin, _extensionName: d.extensionName, _extensionPublisher: d.extensionPublisher };
        }
        ExtensionData.toJSONObject = toJSONObject;
        function fromJSONObject(o) {
            if (o && (0, types_1.$jf)(o._extensionId) && (0, types_1.$pf)(o._extensionIsBuiltin) && (0, types_1.$jf)(o._extensionName) && (0, types_1.$jf)(o._extensionPublisher)) {
                return { extensionId: o._extensionId, extensionIsBuiltin: o._extensionIsBuiltin, extensionName: o._extensionName, extensionPublisher: o._extensionPublisher };
            }
            return undefined;
        }
        ExtensionData.fromJSONObject = fromJSONObject;
        function fromName(publisher, name, isBuiltin = false) {
            return { extensionPublisher: publisher, extensionId: `${publisher}.${name}`, extensionName: name, extensionIsBuiltin: isBuiltin };
        }
        ExtensionData.fromName = fromName;
    })(ExtensionData || (exports.ExtensionData = ExtensionData = {}));
});
//# sourceMappingURL=workbenchThemeService.js.map