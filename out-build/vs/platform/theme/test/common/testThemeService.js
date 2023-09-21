/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/color", "vs/base/common/event", "vs/platform/theme/common/theme"], function (require, exports, color_1, event_1, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$K0b = exports.$J0b = void 0;
    class $J0b {
        constructor(a = {}, type = theme_1.ColorScheme.DARK, semanticHighlighting = false) {
            this.a = a;
            this.type = type;
            this.semanticHighlighting = semanticHighlighting;
            this.label = 'test';
        }
        getColor(color, useDefault) {
            const value = this.a[color];
            if (value) {
                return color_1.$Os.fromHex(value);
            }
            return undefined;
        }
        defines(color) {
            throw new Error('Method not implemented.');
        }
        getTokenStyleMetadata(type, modifiers, modelLanguage) {
            return undefined;
        }
        get tokenColorMap() {
            return [];
        }
    }
    exports.$J0b = $J0b;
    class TestFileIconTheme {
        constructor() {
            this.hasFileIcons = false;
            this.hasFolderIcons = false;
            this.hidesExplorerArrows = false;
        }
    }
    class UnthemedProductIconTheme {
        getIcon(contribution) {
            return undefined;
        }
    }
    class $K0b {
        constructor(theme = new $J0b(), fileIconTheme = new TestFileIconTheme(), productIconTheme = new UnthemedProductIconTheme()) {
            this._onThemeChange = new event_1.$fd();
            this._onFileIconThemeChange = new event_1.$fd();
            this._onProductIconThemeChange = new event_1.$fd();
            this._colorTheme = theme;
            this._fileIconTheme = fileIconTheme;
            this._productIconTheme = productIconTheme;
        }
        getColorTheme() {
            return this._colorTheme;
        }
        setTheme(theme) {
            this._colorTheme = theme;
            this.fireThemeChange();
        }
        fireThemeChange() {
            this._onThemeChange.fire(this._colorTheme);
        }
        get onDidColorThemeChange() {
            return this._onThemeChange.event;
        }
        getFileIconTheme() {
            return this._fileIconTheme;
        }
        get onDidFileIconThemeChange() {
            return this._onFileIconThemeChange.event;
        }
        getProductIconTheme() {
            return this._productIconTheme;
        }
        get onDidProductIconThemeChange() {
            return this._onProductIconThemeChange.event;
        }
    }
    exports.$K0b = $K0b;
});
//# sourceMappingURL=testThemeService.js.map