/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/theme/common/themeService", "vs/workbench/common/theme", "vs/base/common/platform", "vs/base/browser/dom", "vs/base/browser/browser", "vs/platform/theme/common/colorRegistry", "vs/css!./media/style"], function (require, exports, themeService_1, theme_1, platform_1, dom_1, browser_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$hqb = void 0;
    (0, themeService_1.$mv)((theme, collector) => {
        // Background (helps for subpixel-antialiasing on Windows)
        const workbenchBackground = (0, theme_1.$$$)(theme);
        collector.addRule(`.monaco-workbench { background-color: ${workbenchBackground}; }`);
        // Selection (do NOT remove - https://github.com/microsoft/vscode/issues/169662)
        const windowSelectionBackground = theme.getColor(colorRegistry_1.$Cv);
        if (windowSelectionBackground) {
            collector.addRule(`.monaco-workbench ::selection { background-color: ${windowSelectionBackground}; }`);
        }
        // Update <meta name="theme-color" content=""> based on selected theme
        if (platform_1.$o) {
            const titleBackground = theme.getColor(theme_1.$Sab);
            if (titleBackground) {
                const metaElementId = 'monaco-workbench-meta-theme-color';
                let metaElement = document.getElementById(metaElementId);
                if (!metaElement) {
                    metaElement = (0, dom_1.$YO)();
                    metaElement.name = 'theme-color';
                    metaElement.id = metaElementId;
                }
                metaElement.content = titleBackground.toString();
            }
        }
        // We disable user select on the root element, however on Safari this seems
        // to prevent any text selection in the monaco editor. As a workaround we
        // allow to select text in monaco editor instances.
        if (browser_1.$8N) {
            collector.addRule(`
			body.web {
				touch-action: none;
			}
			.monaco-workbench .monaco-editor .view-lines {
				user-select: text;
				-webkit-user-select: text;
			}
		`);
        }
        // Update body background color to ensure the home indicator area looks similar to the workbench
        if (platform_1.$q && (0, browser_1.$_N)()) {
            collector.addRule(`body { background-color: ${workbenchBackground}; }`);
        }
    });
    /**
     * The best font-family to be used in CSS based on the platform:
     * - Windows: Segoe preferred, fallback to sans-serif
     * - macOS: standard system font, fallback to sans-serif
     * - Linux: standard system font preferred, fallback to Ubuntu fonts
     *
     * Note: this currently does not adjust for different locales.
     */
    exports.$hqb = platform_1.$i ? '"Segoe WPC", "Segoe UI", sans-serif' : platform_1.$j ? '-apple-system, BlinkMacSystemFont, sans-serif' : 'system-ui, "Ubuntu", "Droid Sans", sans-serif';
});
//# sourceMappingURL=style.js.map