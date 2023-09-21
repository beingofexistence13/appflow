/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/base/common/types"], function (require, exports, instantiation_1, themeService_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionData = exports.COLOR_THEME_LIGHT_INITIAL_COLORS = exports.COLOR_THEME_DARK_INITIAL_COLORS = exports.ThemeSettingDefaults = exports.ThemeSettings = exports.themeScopeRegex = exports.THEME_SCOPE_WILDCARD = exports.THEME_SCOPE_CLOSE_PAREN = exports.THEME_SCOPE_OPEN_PAREN = exports.VS_HC_LIGHT_THEME = exports.VS_HC_THEME = exports.VS_DARK_THEME = exports.VS_LIGHT_THEME = exports.IWorkbenchThemeService = void 0;
    exports.IWorkbenchThemeService = (0, instantiation_1.refineServiceDecorator)(themeService_1.IThemeService);
    exports.VS_LIGHT_THEME = 'vs';
    exports.VS_DARK_THEME = 'vs-dark';
    exports.VS_HC_THEME = 'hc-black';
    exports.VS_HC_LIGHT_THEME = 'hc-light';
    exports.THEME_SCOPE_OPEN_PAREN = '[';
    exports.THEME_SCOPE_CLOSE_PAREN = ']';
    exports.THEME_SCOPE_WILDCARD = '*';
    exports.themeScopeRegex = /\[(.+?)\]/g;
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
    exports.COLOR_THEME_DARK_INITIAL_COLORS = {
        'activityBar.background': '#181818',
        'statusBar.background': '#181818',
        'statusBar.noFolderBackground': '#1f1f1f',
    };
    exports.COLOR_THEME_LIGHT_INITIAL_COLORS = {
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
            if (o && (0, types_1.isString)(o._extensionId) && (0, types_1.isBoolean)(o._extensionIsBuiltin) && (0, types_1.isString)(o._extensionName) && (0, types_1.isString)(o._extensionPublisher)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2JlbmNoVGhlbWVTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3RoZW1lcy9jb21tb24vd29ya2JlbmNoVGhlbWVTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVVuRixRQUFBLHNCQUFzQixHQUFHLElBQUEsc0NBQXNCLEVBQXdDLDRCQUFhLENBQUMsQ0FBQztJQUV0RyxRQUFBLGNBQWMsR0FBRyxJQUFJLENBQUM7SUFDdEIsUUFBQSxhQUFhLEdBQUcsU0FBUyxDQUFDO0lBQzFCLFFBQUEsV0FBVyxHQUFHLFVBQVUsQ0FBQztJQUN6QixRQUFBLGlCQUFpQixHQUFHLFVBQVUsQ0FBQztJQUUvQixRQUFBLHNCQUFzQixHQUFHLEdBQUcsQ0FBQztJQUM3QixRQUFBLHVCQUF1QixHQUFHLEdBQUcsQ0FBQztJQUM5QixRQUFBLG9CQUFvQixHQUFHLEdBQUcsQ0FBQztJQUUzQixRQUFBLGVBQWUsR0FBRyxZQUFZLENBQUM7SUFFNUMsSUFBWSxhQWNYO0lBZEQsV0FBWSxhQUFhO1FBQ3hCLHFEQUFvQyxDQUFBO1FBQ3BDLHdEQUF1QyxDQUFBO1FBQ3ZDLGtFQUFpRCxDQUFBO1FBQ2pELHVFQUFzRCxDQUFBO1FBQ3RELCtFQUE4RCxDQUFBO1FBQzlELGdHQUErRSxDQUFBO1FBRS9FLDJFQUEwRCxDQUFBO1FBQzFELDZFQUE0RCxDQUFBO1FBQzVELHNGQUFxRSxDQUFBO1FBQ3JFLDRGQUEyRSxDQUFBO1FBQzNFLHFFQUFvRCxDQUFBO1FBQ3BELDREQUEyQyxDQUFBO0lBQzVDLENBQUMsRUFkVyxhQUFhLDZCQUFiLGFBQWEsUUFjeEI7SUFFRCxJQUFZLG9CQVdYO0lBWEQsV0FBWSxvQkFBb0I7UUFDL0IsZ0VBQXdDLENBQUE7UUFDeEMsa0VBQTBDLENBQUE7UUFDMUMscUVBQTZDLENBQUE7UUFDN0MsNEVBQW9ELENBQUE7UUFFcEQsOERBQXNDLENBQUE7UUFDdEMsZ0VBQXdDLENBQUE7UUFFeEMsbURBQTJCLENBQUE7UUFDM0Isc0RBQThCLENBQUE7SUFDL0IsQ0FBQyxFQVhXLG9CQUFvQixvQ0FBcEIsb0JBQW9CLFFBVy9CO0lBRVksUUFBQSwrQkFBK0IsR0FBRztRQUM5Qyx3QkFBd0IsRUFBRSxTQUFTO1FBQ25DLHNCQUFzQixFQUFFLFNBQVM7UUFDakMsOEJBQThCLEVBQUUsU0FBUztLQUN6QyxDQUFDO0lBRVcsUUFBQSxnQ0FBZ0MsR0FBRztRQUMvQyx3QkFBd0IsRUFBRSxTQUFTO1FBQ25DLHNCQUFzQixFQUFFLFNBQVM7UUFDakMsOEJBQThCLEVBQUUsU0FBUztLQUN6QyxDQUFDO0lBd0pGLElBQWlCLGFBQWEsQ0FhN0I7SUFiRCxXQUFpQixhQUFhO1FBQzdCLFNBQWdCLFlBQVksQ0FBQyxDQUE0QjtZQUN4RCxPQUFPLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxrQkFBa0IsRUFBRSxjQUFjLEVBQUUsQ0FBQyxDQUFDLGFBQWEsRUFBRSxtQkFBbUIsRUFBRSxDQUFDLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUNwSyxDQUFDO1FBRmUsMEJBQVksZUFFM0IsQ0FBQTtRQUNELFNBQWdCLGNBQWMsQ0FBQyxDQUFNO1lBQ3BDLElBQUksQ0FBQyxJQUFJLElBQUEsZ0JBQVEsRUFBQyxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksSUFBQSxpQkFBUyxFQUFDLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLElBQUEsZ0JBQVEsRUFBQyxDQUFDLENBQUMsY0FBYyxDQUFDLElBQUksSUFBQSxnQkFBUSxFQUFDLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFO2dCQUN2SSxPQUFPLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQyxZQUFZLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLG1CQUFtQixFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUMsY0FBYyxFQUFFLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2FBQzlKO1lBQ0QsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUxlLDRCQUFjLGlCQUs3QixDQUFBO1FBQ0QsU0FBZ0IsUUFBUSxDQUFDLFNBQWlCLEVBQUUsSUFBWSxFQUFFLFNBQVMsR0FBRyxLQUFLO1lBQzFFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLEdBQUcsU0FBUyxJQUFJLElBQUksRUFBRSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsU0FBUyxFQUFFLENBQUM7UUFDbkksQ0FBQztRQUZlLHNCQUFRLFdBRXZCLENBQUE7SUFDRixDQUFDLEVBYmdCLGFBQWEsNkJBQWIsYUFBYSxRQWE3QiJ9