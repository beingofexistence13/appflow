/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/nls!vs/workbench/contrib/welcomeGettingStarted/common/media/theme_picker", "vs/workbench/services/themes/common/workbenchThemeService"], function (require, exports, strings_1, nls_1, workbenchThemeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = () => `
<checklist>
	<div class="theme-picker-row">
		<checkbox when-checked="setTheme:${workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_DARK}" checked-on="config.workbench.colorTheme == '${workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_DARK}'">
			<img width="200" src="./dark.png"/>
			${(0, strings_1.$pe)((0, nls_1.localize)(0, null))}
		</checkbox>
		<checkbox when-checked="setTheme:${workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_LIGHT}" checked-on="config.workbench.colorTheme == '${workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_LIGHT}'">
			<img width="200" src="./light.png"/>
			${(0, strings_1.$pe)((0, nls_1.localize)(1, null))}
		</checkbox>
	</div>
	<div class="theme-picker-row">
		<checkbox when-checked="setTheme:${workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_HC_DARK}" checked-on="config.workbench.colorTheme == '${workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_HC_DARK}'">
			<img width="200" src="./dark-hc.png"/>
			${(0, strings_1.$pe)((0, nls_1.localize)(2, null))}
		</checkbox>
		<checkbox when-checked="setTheme:${workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_HC_LIGHT}" checked-on="config.workbench.colorTheme == '${workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_HC_LIGHT}'">
			<img width="200" src="./light-hc.png"/>
			${(0, strings_1.$pe)((0, nls_1.localize)(3, null))}
		</checkbox>
	</div>
</checklist>
<checkbox class="theme-picker-link" when-checked="command:workbench.action.selectTheme" checked-on="false">
	${(0, strings_1.$pe)((0, nls_1.localize)(4, null))}
</checkbox>
`;
});
//# sourceMappingURL=theme_picker.js.map