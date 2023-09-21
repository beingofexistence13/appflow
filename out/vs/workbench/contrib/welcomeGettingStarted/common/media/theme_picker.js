/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/nls", "vs/workbench/services/themes/common/workbenchThemeService"], function (require, exports, strings_1, nls_1, workbenchThemeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = () => `
<checklist>
	<div class="theme-picker-row">
		<checkbox when-checked="setTheme:${workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_DARK}" checked-on="config.workbench.colorTheme == '${workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_DARK}'">
			<img width="200" src="./dark.png"/>
			${(0, strings_1.escape)((0, nls_1.localize)('dark', "Dark Modern"))}
		</checkbox>
		<checkbox when-checked="setTheme:${workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_LIGHT}" checked-on="config.workbench.colorTheme == '${workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_LIGHT}'">
			<img width="200" src="./light.png"/>
			${(0, strings_1.escape)((0, nls_1.localize)('light', "Light Modern"))}
		</checkbox>
	</div>
	<div class="theme-picker-row">
		<checkbox when-checked="setTheme:${workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_HC_DARK}" checked-on="config.workbench.colorTheme == '${workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_HC_DARK}'">
			<img width="200" src="./dark-hc.png"/>
			${(0, strings_1.escape)((0, nls_1.localize)('HighContrast', "Dark High Contrast"))}
		</checkbox>
		<checkbox when-checked="setTheme:${workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_HC_LIGHT}" checked-on="config.workbench.colorTheme == '${workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_HC_LIGHT}'">
			<img width="200" src="./light-hc.png"/>
			${(0, strings_1.escape)((0, nls_1.localize)('HighContrastLight', "Light High Contrast"))}
		</checkbox>
	</div>
</checklist>
<checkbox class="theme-picker-link" when-checked="command:workbench.action.selectTheme" checked-on="false">
	${(0, strings_1.escape)((0, nls_1.localize)('seeMore', "See More Themes..."))}
</checkbox>
`;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWVfcGlja2VyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvd2VsY29tZUdldHRpbmdTdGFydGVkL2NvbW1vbi9tZWRpYS90aGVtZV9waWNrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFNaEcsa0JBQWUsR0FBRyxFQUFFLENBQUM7OztxQ0FHZ0IsNENBQW9CLENBQUMsZ0JBQWdCLGlEQUFpRCw0Q0FBb0IsQ0FBQyxnQkFBZ0I7O0tBRTNKLElBQUEsZ0JBQU0sRUFBQyxJQUFBLGNBQVEsRUFBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUM7O3FDQUVQLDRDQUFvQixDQUFDLGlCQUFpQixpREFBaUQsNENBQW9CLENBQUMsaUJBQWlCOztLQUU3SixJQUFBLGdCQUFNLEVBQUMsSUFBQSxjQUFRLEVBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDOzs7O3FDQUlULDRDQUFvQixDQUFDLG1CQUFtQixpREFBaUQsNENBQW9CLENBQUMsbUJBQW1COztLQUVqSyxJQUFBLGdCQUFNLEVBQUMsSUFBQSxjQUFRLEVBQUMsY0FBYyxFQUFFLG9CQUFvQixDQUFDLENBQUM7O3FDQUV0Qiw0Q0FBb0IsQ0FBQyxvQkFBb0IsaURBQWlELDRDQUFvQixDQUFDLG9CQUFvQjs7S0FFbkssSUFBQSxnQkFBTSxFQUFDLElBQUEsY0FBUSxFQUFDLG1CQUFtQixFQUFFLHFCQUFxQixDQUFDLENBQUM7Ozs7O0dBSzlELElBQUEsZ0JBQU0sRUFBQyxJQUFBLGNBQVEsRUFBQyxTQUFTLEVBQUUsb0JBQW9CLENBQUMsQ0FBQzs7Q0FFbkQsQ0FBQyJ9