/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/theme/common/colorRegistry", "vs/platform/registry/common/platform", "vs/workbench/contrib/terminal/common/terminalColorRegistry", "vs/base/common/color", "vs/platform/theme/common/theme", "vs/base/test/common/utils"], function (require, exports, assert, colorRegistry_1, platform_1, terminalColorRegistry_1, color_1, theme_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, terminalColorRegistry_1.$Jfb)();
    const themingRegistry = platform_1.$8m.as(colorRegistry_1.$rv.ColorContribution);
    function getMockTheme(type) {
        const theme = {
            selector: '',
            label: '',
            type: type,
            getColor: (colorId) => themingRegistry.resolveDefaultColor(colorId, theme),
            defines: () => true,
            getTokenStyleMetadata: () => undefined,
            tokenColorMap: [],
            semanticHighlighting: false
        };
        return theme;
    }
    suite('Workbench - TerminalColorRegistry', () => {
        (0, utils_1.$bT)();
        test('hc colors', function () {
            const theme = getMockTheme(theme_1.ColorScheme.HIGH_CONTRAST_DARK);
            const colors = terminalColorRegistry_1.$nfb.map(colorId => color_1.$Os.Format.CSS.formatHexA(theme.getColor(colorId), true));
            assert.deepStrictEqual(colors, [
                '#000000',
                '#cd0000',
                '#00cd00',
                '#cdcd00',
                '#0000ee',
                '#cd00cd',
                '#00cdcd',
                '#e5e5e5',
                '#7f7f7f',
                '#ff0000',
                '#00ff00',
                '#ffff00',
                '#5c5cff',
                '#ff00ff',
                '#00ffff',
                '#ffffff'
            ], 'The high contrast terminal colors should be used when the hc theme is active');
        });
        test('light colors', function () {
            const theme = getMockTheme(theme_1.ColorScheme.LIGHT);
            const colors = terminalColorRegistry_1.$nfb.map(colorId => color_1.$Os.Format.CSS.formatHexA(theme.getColor(colorId), true));
            assert.deepStrictEqual(colors, [
                '#000000',
                '#cd3131',
                '#00bc00',
                '#949800',
                '#0451a5',
                '#bc05bc',
                '#0598bc',
                '#555555',
                '#666666',
                '#cd3131',
                '#14ce14',
                '#b5ba00',
                '#0451a5',
                '#bc05bc',
                '#0598bc',
                '#a5a5a5'
            ], 'The light terminal colors should be used when the light theme is active');
        });
        test('dark colors', function () {
            const theme = getMockTheme(theme_1.ColorScheme.DARK);
            const colors = terminalColorRegistry_1.$nfb.map(colorId => color_1.$Os.Format.CSS.formatHexA(theme.getColor(colorId), true));
            assert.deepStrictEqual(colors, [
                '#000000',
                '#cd3131',
                '#0dbc79',
                '#e5e510',
                '#2472c8',
                '#bc3fbc',
                '#11a8cd',
                '#e5e5e5',
                '#666666',
                '#f14c4c',
                '#23d18b',
                '#f5f543',
                '#3b8eea',
                '#d670d6',
                '#29b8db',
                '#e5e5e5'
            ], 'The dark terminal colors should be used when a dark theme is active');
        });
    });
});
//# sourceMappingURL=terminalColorRegistry.test.js.map