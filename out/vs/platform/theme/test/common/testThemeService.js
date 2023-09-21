/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/color", "vs/base/common/event", "vs/platform/theme/common/theme"], function (require, exports, color_1, event_1, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestThemeService = exports.TestColorTheme = void 0;
    class TestColorTheme {
        constructor(colors = {}, type = theme_1.ColorScheme.DARK, semanticHighlighting = false) {
            this.colors = colors;
            this.type = type;
            this.semanticHighlighting = semanticHighlighting;
            this.label = 'test';
        }
        getColor(color, useDefault) {
            const value = this.colors[color];
            if (value) {
                return color_1.Color.fromHex(value);
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
    exports.TestColorTheme = TestColorTheme;
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
    class TestThemeService {
        constructor(theme = new TestColorTheme(), fileIconTheme = new TestFileIconTheme(), productIconTheme = new UnthemedProductIconTheme()) {
            this._onThemeChange = new event_1.Emitter();
            this._onFileIconThemeChange = new event_1.Emitter();
            this._onProductIconThemeChange = new event_1.Emitter();
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
    exports.TestThemeService = TestThemeService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdFRoZW1lU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3RoZW1lL3Rlc3QvY29tbW9uL3Rlc3RUaGVtZVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLE1BQWEsY0FBYztRQUkxQixZQUNTLFNBQStDLEVBQUUsRUFDbEQsT0FBTyxtQkFBVyxDQUFDLElBQUksRUFDZCx1QkFBdUIsS0FBSztZQUZwQyxXQUFNLEdBQU4sTUFBTSxDQUEyQztZQUNsRCxTQUFJLEdBQUosSUFBSSxDQUFtQjtZQUNkLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBUTtZQUw3QixVQUFLLEdBQUcsTUFBTSxDQUFDO1FBTTNCLENBQUM7UUFFTCxRQUFRLENBQUMsS0FBYSxFQUFFLFVBQW9CO1lBQzNDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDakMsSUFBSSxLQUFLLEVBQUU7Z0JBQ1YsT0FBTyxhQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzVCO1lBQ0QsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUVELE9BQU8sQ0FBQyxLQUFhO1lBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBRUQscUJBQXFCLENBQUMsSUFBWSxFQUFFLFNBQW1CLEVBQUUsYUFBcUI7WUFDN0UsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUVELElBQUksYUFBYTtZQUNoQixPQUFPLEVBQUUsQ0FBQztRQUNYLENBQUM7S0FDRDtJQTdCRCx3Q0E2QkM7SUFFRCxNQUFNLGlCQUFpQjtRQUF2QjtZQUNDLGlCQUFZLEdBQUcsS0FBSyxDQUFDO1lBQ3JCLG1CQUFjLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLHdCQUFtQixHQUFHLEtBQUssQ0FBQztRQUM3QixDQUFDO0tBQUE7SUFFRCxNQUFNLHdCQUF3QjtRQUM3QixPQUFPLENBQUMsWUFBOEI7WUFDckMsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztLQUNEO0lBRUQsTUFBYSxnQkFBZ0I7UUFVNUIsWUFBWSxLQUFLLEdBQUcsSUFBSSxjQUFjLEVBQUUsRUFBRSxhQUFhLEdBQUcsSUFBSSxpQkFBaUIsRUFBRSxFQUFFLGdCQUFnQixHQUFHLElBQUksd0JBQXdCLEVBQUU7WUFKcEksbUJBQWMsR0FBRyxJQUFJLGVBQU8sRUFBZSxDQUFDO1lBQzVDLDJCQUFzQixHQUFHLElBQUksZUFBTyxFQUFrQixDQUFDO1lBQ3ZELDhCQUF5QixHQUFHLElBQUksZUFBTyxFQUFxQixDQUFDO1lBRzVELElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxjQUFjLEdBQUcsYUFBYSxDQUFDO1lBQ3BDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxnQkFBZ0IsQ0FBQztRQUMzQyxDQUFDO1FBRUQsYUFBYTtZQUNaLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUN6QixDQUFDO1FBRUQsUUFBUSxDQUFDLEtBQWtCO1lBQzFCLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN4QixDQUFDO1FBRUQsZUFBZTtZQUNkLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBRUQsSUFBVyxxQkFBcUI7WUFDL0IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQztRQUNsQyxDQUFDO1FBRUQsZ0JBQWdCO1lBQ2YsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDO1FBQzVCLENBQUM7UUFFRCxJQUFXLHdCQUF3QjtZQUNsQyxPQUFPLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUM7UUFDMUMsQ0FBQztRQUVELG1CQUFtQjtZQUNsQixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztRQUMvQixDQUFDO1FBRUQsSUFBVywyQkFBMkI7WUFDckMsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDO1FBQzdDLENBQUM7S0FDRDtJQWhERCw0Q0FnREMifQ==