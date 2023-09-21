/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/standalone/common/standaloneTheme", "vs/editor/common/standaloneStrings", "vs/platform/theme/common/theme", "vs/editor/standalone/browser/standaloneThemeService"], function (require, exports, editorExtensions_1, standaloneTheme_1, standaloneStrings_1, theme_1, standaloneThemeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ToggleHighContrast extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.toggleHighContrast',
                label: standaloneStrings_1.ToggleHighContrastNLS.toggleHighContrast,
                alias: 'Toggle High Contrast Theme',
                precondition: undefined
            });
            this.d = null;
        }
        run(accessor, editor) {
            const standaloneThemeService = accessor.get(standaloneTheme_1.$D8b);
            const currentTheme = standaloneThemeService.getColorTheme();
            if ((0, theme_1.$ev)(currentTheme.type)) {
                // We must toggle back to the integrator's theme
                standaloneThemeService.setTheme(this.d || ((0, theme_1.$fv)(currentTheme.type) ? standaloneThemeService_1.$Q8b : standaloneThemeService_1.$P8b));
                this.d = null;
            }
            else {
                standaloneThemeService.setTheme((0, theme_1.$fv)(currentTheme.type) ? standaloneThemeService_1.$R8b : standaloneThemeService_1.$S8b);
                this.d = currentTheme.themeName;
            }
        }
    }
    (0, editorExtensions_1.$xV)(ToggleHighContrast);
});
//# sourceMappingURL=toggleHighContrast.js.map