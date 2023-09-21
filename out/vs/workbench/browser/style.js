/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/theme/common/themeService", "vs/workbench/common/theme", "vs/base/common/platform", "vs/base/browser/dom", "vs/base/browser/browser", "vs/platform/theme/common/colorRegistry", "vs/css!./media/style"], function (require, exports, themeService_1, theme_1, platform_1, dom_1, browser_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DEFAULT_FONT_FAMILY = void 0;
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        // Background (helps for subpixel-antialiasing on Windows)
        const workbenchBackground = (0, theme_1.WORKBENCH_BACKGROUND)(theme);
        collector.addRule(`.monaco-workbench { background-color: ${workbenchBackground}; }`);
        // Selection (do NOT remove - https://github.com/microsoft/vscode/issues/169662)
        const windowSelectionBackground = theme.getColor(colorRegistry_1.selectionBackground);
        if (windowSelectionBackground) {
            collector.addRule(`.monaco-workbench ::selection { background-color: ${windowSelectionBackground}; }`);
        }
        // Update <meta name="theme-color" content=""> based on selected theme
        if (platform_1.isWeb) {
            const titleBackground = theme.getColor(theme_1.TITLE_BAR_ACTIVE_BACKGROUND);
            if (titleBackground) {
                const metaElementId = 'monaco-workbench-meta-theme-color';
                let metaElement = document.getElementById(metaElementId);
                if (!metaElement) {
                    metaElement = (0, dom_1.createMetaElement)();
                    metaElement.name = 'theme-color';
                    metaElement.id = metaElementId;
                }
                metaElement.content = titleBackground.toString();
            }
        }
        // We disable user select on the root element, however on Safari this seems
        // to prevent any text selection in the monaco editor. As a workaround we
        // allow to select text in monaco editor instances.
        if (browser_1.isSafari) {
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
        if (platform_1.isIOS && (0, browser_1.isStandalone)()) {
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
    exports.DEFAULT_FONT_FAMILY = platform_1.isWindows ? '"Segoe WPC", "Segoe UI", sans-serif' : platform_1.isMacintosh ? '-apple-system, BlinkMacSystemFont, sans-serif' : 'system-ui, "Ubuntu", "Droid Sans", sans-serif';
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9zdHlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFVaEcsSUFBQSx5Q0FBMEIsRUFBQyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsRUFBRTtRQUUvQywwREFBMEQ7UUFDMUQsTUFBTSxtQkFBbUIsR0FBRyxJQUFBLDRCQUFvQixFQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hELFNBQVMsQ0FBQyxPQUFPLENBQUMseUNBQXlDLG1CQUFtQixLQUFLLENBQUMsQ0FBQztRQUVyRixnRkFBZ0Y7UUFDaEYsTUFBTSx5QkFBeUIsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLG1DQUFtQixDQUFDLENBQUM7UUFDdEUsSUFBSSx5QkFBeUIsRUFBRTtZQUM5QixTQUFTLENBQUMsT0FBTyxDQUFDLHFEQUFxRCx5QkFBeUIsS0FBSyxDQUFDLENBQUM7U0FDdkc7UUFFRCxzRUFBc0U7UUFDdEUsSUFBSSxnQkFBSyxFQUFFO1lBQ1YsTUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxtQ0FBMkIsQ0FBQyxDQUFDO1lBQ3BFLElBQUksZUFBZSxFQUFFO2dCQUNwQixNQUFNLGFBQWEsR0FBRyxtQ0FBbUMsQ0FBQztnQkFDMUQsSUFBSSxXQUFXLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQTJCLENBQUM7Z0JBQ25GLElBQUksQ0FBQyxXQUFXLEVBQUU7b0JBQ2pCLFdBQVcsR0FBRyxJQUFBLHVCQUFpQixHQUFFLENBQUM7b0JBQ2xDLFdBQVcsQ0FBQyxJQUFJLEdBQUcsYUFBYSxDQUFDO29CQUNqQyxXQUFXLENBQUMsRUFBRSxHQUFHLGFBQWEsQ0FBQztpQkFDL0I7Z0JBRUQsV0FBVyxDQUFDLE9BQU8sR0FBRyxlQUFlLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDakQ7U0FDRDtRQUVELDJFQUEyRTtRQUMzRSx5RUFBeUU7UUFDekUsbURBQW1EO1FBQ25ELElBQUksa0JBQVEsRUFBRTtZQUNiLFNBQVMsQ0FBQyxPQUFPLENBQUM7Ozs7Ozs7O0dBUWpCLENBQUMsQ0FBQztTQUNIO1FBRUQsZ0dBQWdHO1FBQ2hHLElBQUksZ0JBQUssSUFBSSxJQUFBLHNCQUFZLEdBQUUsRUFBRTtZQUM1QixTQUFTLENBQUMsT0FBTyxDQUFDLDRCQUE0QixtQkFBbUIsS0FBSyxDQUFDLENBQUM7U0FDeEU7SUFDRixDQUFDLENBQUMsQ0FBQztJQUVIOzs7Ozs7O09BT0c7SUFDVSxRQUFBLG1CQUFtQixHQUFHLG9CQUFTLENBQUMsQ0FBQyxDQUFDLHFDQUFxQyxDQUFDLENBQUMsQ0FBQyxzQkFBVyxDQUFDLENBQUMsQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDLENBQUMsK0NBQStDLENBQUMifQ==