/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/config/editorOptions", "vs/platform/configuration/common/configuration", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/theme", "vs/workbench/services/themes/common/workbenchThemeService", "vs/workbench/browser/style"], function (require, exports, event_1, lifecycle_1, editorOptions_1, configuration_1, colorRegistry, theme_1, workbenchThemeService_1, style_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$24b = void 0;
    let $24b = class $24b extends lifecycle_1.$kc {
        constructor(c, f) {
            super();
            this.c = c;
            this.f = f;
            this.a = undefined;
            this.b = this.B(new event_1.$fd());
            this.onThemeDataChanged = this.b.event;
            this.B(this.c.onDidColorThemeChange(() => {
                this.g();
            }));
            const webviewConfigurationKeys = ['editor.fontFamily', 'editor.fontWeight', 'editor.fontSize'];
            this.B(this.f.onDidChangeConfiguration(e => {
                if (webviewConfigurationKeys.some(key => e.affectsConfiguration(key))) {
                    this.g();
                }
            }));
        }
        getTheme() {
            return this.c.getColorTheme();
        }
        getWebviewThemeData() {
            if (!this.a) {
                const configuration = this.f.getValue('editor');
                const editorFontFamily = configuration.fontFamily || editorOptions_1.EDITOR_FONT_DEFAULTS.fontFamily;
                const editorFontWeight = configuration.fontWeight || editorOptions_1.EDITOR_FONT_DEFAULTS.fontWeight;
                const editorFontSize = configuration.fontSize || editorOptions_1.EDITOR_FONT_DEFAULTS.fontSize;
                const theme = this.c.getColorTheme();
                const exportedColors = colorRegistry.$tv().getColors().reduce((colors, entry) => {
                    const color = theme.getColor(entry.id);
                    if (color) {
                        colors['vscode-' + entry.id.replace('.', '-')] = color.toString();
                    }
                    return colors;
                }, {});
                const styles = {
                    'vscode-font-family': style_1.$hqb,
                    'vscode-font-weight': 'normal',
                    'vscode-font-size': '13px',
                    'vscode-editor-font-family': editorFontFamily,
                    'vscode-editor-font-weight': editorFontWeight,
                    'vscode-editor-font-size': editorFontSize + 'px',
                    ...exportedColors
                };
                const activeTheme = ApiThemeClassName.fromTheme(theme);
                this.a = { styles, activeTheme, themeLabel: theme.label, themeId: theme.settingsId };
            }
            return this.a;
        }
        g() {
            this.a = undefined;
            this.b.fire();
        }
    };
    exports.$24b = $24b;
    exports.$24b = $24b = __decorate([
        __param(0, workbenchThemeService_1.$egb),
        __param(1, configuration_1.$8h)
    ], $24b);
    var ApiThemeClassName;
    (function (ApiThemeClassName) {
        ApiThemeClassName["light"] = "vscode-light";
        ApiThemeClassName["dark"] = "vscode-dark";
        ApiThemeClassName["highContrast"] = "vscode-high-contrast";
        ApiThemeClassName["highContrastLight"] = "vscode-high-contrast-light";
    })(ApiThemeClassName || (ApiThemeClassName = {}));
    (function (ApiThemeClassName) {
        function fromTheme(theme) {
            switch (theme.type) {
                case theme_1.ColorScheme.LIGHT: return ApiThemeClassName.light;
                case theme_1.ColorScheme.DARK: return ApiThemeClassName.dark;
                case theme_1.ColorScheme.HIGH_CONTRAST_DARK: return ApiThemeClassName.highContrast;
                case theme_1.ColorScheme.HIGH_CONTRAST_LIGHT: return ApiThemeClassName.highContrastLight;
            }
        }
        ApiThemeClassName.fromTheme = fromTheme;
    })(ApiThemeClassName || (ApiThemeClassName = {}));
});
//# sourceMappingURL=themeing.js.map