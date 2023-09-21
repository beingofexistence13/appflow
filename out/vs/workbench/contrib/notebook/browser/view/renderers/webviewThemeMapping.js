/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.transformWebviewThemeVars = void 0;
    const mapping = new Map([
        ['theme-font-family', 'vscode-font-family'],
        ['theme-font-weight', 'vscode-font-weight'],
        ['theme-font-size', 'vscode-font-size'],
        ['theme-code-font-family', 'vscode-editor-font-family'],
        ['theme-code-font-weight', 'vscode-editor-font-weight'],
        ['theme-code-font-size', 'vscode-editor-font-size'],
        ['theme-scrollbar-background', 'vscode-scrollbarSlider-background'],
        ['theme-scrollbar-hover-background', 'vscode-scrollbarSlider-hoverBackground'],
        ['theme-scrollbar-active-background', 'vscode-scrollbarSlider-activeBackground'],
        ['theme-quote-background', 'vscode-textBlockQuote-background'],
        ['theme-quote-border', 'vscode-textBlockQuote-border'],
        ['theme-code-foreground', 'vscode-textPreformat-foreground'],
        // Editor
        ['theme-background', 'vscode-editor-background'],
        ['theme-foreground', 'vscode-editor-foreground'],
        ['theme-ui-foreground', 'vscode-foreground'],
        ['theme-link', 'vscode-textLink-foreground'],
        ['theme-link-active', 'vscode-textLink-activeForeground'],
        // Buttons
        ['theme-button-background', 'vscode-button-background'],
        ['theme-button-hover-background', 'vscode-button-hoverBackground'],
        ['theme-button-foreground', 'vscode-button-foreground'],
        ['theme-button-secondary-background', 'vscode-button-secondaryBackground'],
        ['theme-button-secondary-hover-background', 'vscode-button-secondaryHoverBackground'],
        ['theme-button-secondary-foreground', 'vscode-button-secondaryForeground'],
        ['theme-button-hover-foreground', 'vscode-button-foreground'],
        ['theme-button-focus-foreground', 'vscode-button-foreground'],
        ['theme-button-secondary-hover-foreground', 'vscode-button-secondaryForeground'],
        ['theme-button-secondary-focus-foreground', 'vscode-button-secondaryForeground'],
        // Inputs
        ['theme-input-background', 'vscode-input-background'],
        ['theme-input-foreground', 'vscode-input-foreground'],
        ['theme-input-placeholder-foreground', 'vscode-input-placeholderForeground'],
        ['theme-input-focus-border-color', 'vscode-focusBorder'],
        // Menus
        ['theme-menu-background', 'vscode-menu-background'],
        ['theme-menu-foreground', 'vscode-menu-foreground'],
        ['theme-menu-hover-background', 'vscode-menu-selectionBackground'],
        ['theme-menu-focus-background', 'vscode-menu-selectionBackground'],
        ['theme-menu-hover-foreground', 'vscode-menu-selectionForeground'],
        ['theme-menu-focus-foreground', 'vscode-menu-selectionForeground'],
        // Errors
        ['theme-error-background', 'vscode-inputValidation-errorBackground'],
        ['theme-error-foreground', 'vscode-foreground'],
        ['theme-warning-background', 'vscode-inputValidation-warningBackground'],
        ['theme-warning-foreground', 'vscode-foreground'],
        ['theme-info-background', 'vscode-inputValidation-infoBackground'],
        ['theme-info-foreground', 'vscode-foreground'],
        // Notebook:
        ['theme-notebook-output-background', 'vscode-notebook-outputContainerBackgroundColor'],
        ['theme-notebook-output-border', 'vscode-notebook-outputContainerBorderColor'],
        ['theme-notebook-cell-selected-background', 'vscode-notebook-selectedCellBackground'],
        ['theme-notebook-symbol-highlight-background', 'vscode-notebook-symbolHighlightBackground'],
        ['theme-notebook-diff-removed-background', 'vscode-diffEditor-removedTextBackground'],
        ['theme-notebook-diff-inserted-background', 'vscode-diffEditor-insertedTextBackground'],
    ]);
    const constants = {
        'theme-input-border-width': '1px',
        'theme-button-primary-hover-shadow': 'none',
        'theme-button-secondary-hover-shadow': 'none',
        'theme-input-border-color': 'transparent',
    };
    /**
     * Transforms base vscode theme variables into generic variables for notebook
     * renderers.
     * @see https://github.com/microsoft/vscode/issues/107985 for context
     * @deprecated
     */
    const transformWebviewThemeVars = (s) => {
        const result = { ...s, ...constants };
        for (const [target, src] of mapping) {
            result[target] = s[src];
        }
        return result;
    };
    exports.transformWebviewThemeVars = transformWebviewThemeVars;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vidmlld1RoZW1lTWFwcGluZy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvdmlldy9yZW5kZXJlcnMvd2Vidmlld1RoZW1lTWFwcGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFJaEcsTUFBTSxPQUFPLEdBQWdDLElBQUksR0FBRyxDQUFDO1FBQ3BELENBQUMsbUJBQW1CLEVBQUUsb0JBQW9CLENBQUM7UUFDM0MsQ0FBQyxtQkFBbUIsRUFBRSxvQkFBb0IsQ0FBQztRQUMzQyxDQUFDLGlCQUFpQixFQUFFLGtCQUFrQixDQUFDO1FBQ3ZDLENBQUMsd0JBQXdCLEVBQUUsMkJBQTJCLENBQUM7UUFDdkQsQ0FBQyx3QkFBd0IsRUFBRSwyQkFBMkIsQ0FBQztRQUN2RCxDQUFDLHNCQUFzQixFQUFFLHlCQUF5QixDQUFDO1FBQ25ELENBQUMsNEJBQTRCLEVBQUUsbUNBQW1DLENBQUM7UUFDbkUsQ0FBQyxrQ0FBa0MsRUFBRSx3Q0FBd0MsQ0FBQztRQUM5RSxDQUFDLG1DQUFtQyxFQUFFLHlDQUF5QyxDQUFDO1FBQ2hGLENBQUMsd0JBQXdCLEVBQUUsa0NBQWtDLENBQUM7UUFDOUQsQ0FBQyxvQkFBb0IsRUFBRSw4QkFBOEIsQ0FBQztRQUN0RCxDQUFDLHVCQUF1QixFQUFFLGlDQUFpQyxDQUFDO1FBQzVELFNBQVM7UUFDVCxDQUFDLGtCQUFrQixFQUFFLDBCQUEwQixDQUFDO1FBQ2hELENBQUMsa0JBQWtCLEVBQUUsMEJBQTBCLENBQUM7UUFDaEQsQ0FBQyxxQkFBcUIsRUFBRSxtQkFBbUIsQ0FBQztRQUM1QyxDQUFDLFlBQVksRUFBRSw0QkFBNEIsQ0FBQztRQUM1QyxDQUFDLG1CQUFtQixFQUFFLGtDQUFrQyxDQUFDO1FBQ3pELFVBQVU7UUFDVixDQUFDLHlCQUF5QixFQUFFLDBCQUEw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