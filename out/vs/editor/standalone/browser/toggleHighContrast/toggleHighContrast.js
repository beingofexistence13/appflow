/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/standalone/common/standaloneTheme", "vs/editor/common/standaloneStrings", "vs/platform/theme/common/theme", "vs/editor/standalone/browser/standaloneThemeService"], function (require, exports, editorExtensions_1, standaloneTheme_1, standaloneStrings_1, theme_1, standaloneThemeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ToggleHighContrast extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.toggleHighContrast',
                label: standaloneStrings_1.ToggleHighContrastNLS.toggleHighContrast,
                alias: 'Toggle High Contrast Theme',
                precondition: undefined
            });
            this._originalThemeName = null;
        }
        run(accessor, editor) {
            const standaloneThemeService = accessor.get(standaloneTheme_1.IStandaloneThemeService);
            const currentTheme = standaloneThemeService.getColorTheme();
            if ((0, theme_1.isHighContrast)(currentTheme.type)) {
                // We must toggle back to the integrator's theme
                standaloneThemeService.setTheme(this._originalThemeName || ((0, theme_1.isDark)(currentTheme.type) ? standaloneThemeService_1.VS_DARK_THEME_NAME : standaloneThemeService_1.VS_LIGHT_THEME_NAME));
                this._originalThemeName = null;
            }
            else {
                standaloneThemeService.setTheme((0, theme_1.isDark)(currentTheme.type) ? standaloneThemeService_1.HC_BLACK_THEME_NAME : standaloneThemeService_1.HC_LIGHT_THEME_NAME);
                this._originalThemeName = currentTheme.themeName;
            }
        }
    }
    (0, editorExtensions_1.registerEditorAction)(ToggleHighContrast);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9nZ2xlSGlnaENvbnRyYXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3N0YW5kYWxvbmUvYnJvd3Nlci90b2dnbGVIaWdoQ29udHJhc3QvdG9nZ2xlSGlnaENvbnRyYXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBU2hHLE1BQU0sa0JBQW1CLFNBQVEsK0JBQVk7UUFJNUM7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLGtDQUFrQztnQkFDdEMsS0FBSyxFQUFFLHlDQUFxQixDQUFDLGtCQUFrQjtnQkFDL0MsS0FBSyxFQUFFLDRCQUE0QjtnQkFDbkMsWUFBWSxFQUFFLFNBQVM7YUFDdkIsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQztRQUNoQyxDQUFDO1FBRU0sR0FBRyxDQUFDLFFBQTBCLEVBQUUsTUFBbUI7WUFDekQsTUFBTSxzQkFBc0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHlDQUF1QixDQUFDLENBQUM7WUFDckUsTUFBTSxZQUFZLEdBQUcsc0JBQXNCLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDNUQsSUFBSSxJQUFBLHNCQUFjLEVBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUN0QyxnREFBZ0Q7Z0JBQ2hELHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLElBQUksQ0FBQyxJQUFBLGNBQU0sRUFBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLDJDQUFrQixDQUFDLENBQUMsQ0FBQyw0Q0FBbUIsQ0FBQyxDQUFDLENBQUM7Z0JBQ25JLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7YUFDL0I7aUJBQU07Z0JBQ04sc0JBQXNCLENBQUMsUUFBUSxDQUFDLElBQUEsY0FBTSxFQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsNENBQW1CLENBQUMsQ0FBQyxDQUFDLDRDQUFtQixDQUFDLENBQUM7Z0JBQ3ZHLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxZQUFZLENBQUMsU0FBUyxDQUFDO2FBQ2pEO1FBQ0YsQ0FBQztLQUNEO0lBRUQsSUFBQSx1Q0FBb0IsRUFBQyxrQkFBa0IsQ0FBQyxDQUFDIn0=