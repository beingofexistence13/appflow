/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/theme/common/colorRegistry", "vs/platform/registry/common/platform", "vs/workbench/contrib/terminal/common/terminalColorRegistry", "vs/base/common/color", "vs/platform/theme/common/theme", "vs/base/test/common/utils"], function (require, exports, assert, colorRegistry_1, platform_1, terminalColorRegistry_1, color_1, theme_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, terminalColorRegistry_1.registerColors)();
    const themingRegistry = platform_1.Registry.as(colorRegistry_1.Extensions.ColorContribution);
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
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('hc colors', function () {
            const theme = getMockTheme(theme_1.ColorScheme.HIGH_CONTRAST_DARK);
            const colors = terminalColorRegistry_1.ansiColorIdentifiers.map(colorId => color_1.Color.Format.CSS.formatHexA(theme.getColor(colorId), true));
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
            const colors = terminalColorRegistry_1.ansiColorIdentifiers.map(colorId => color_1.Color.Format.CSS.formatHexA(theme.getColor(colorId), true));
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
            const colors = terminalColorRegistry_1.ansiColorIdentifiers.map(colorId => color_1.Color.Format.CSS.formatHexA(theme.getColor(colorId), true));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxDb2xvclJlZ2lzdHJ5LnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC90ZXN0L2NvbW1vbi90ZXJtaW5hbENvbG9yUmVnaXN0cnkudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVdoRyxJQUFBLHNDQUFjLEdBQUUsQ0FBQztJQUVqQixNQUFNLGVBQWUsR0FBRyxtQkFBUSxDQUFDLEVBQUUsQ0FBaUIsMEJBQWtCLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUMxRixTQUFTLFlBQVksQ0FBQyxJQUFpQjtRQUN0QyxNQUFNLEtBQUssR0FBRztZQUNiLFFBQVEsRUFBRSxFQUFFO1lBQ1osS0FBSyxFQUFFLEVBQUU7WUFDVCxJQUFJLEVBQUUsSUFBSTtZQUNWLFFBQVEsRUFBRSxDQUFDLE9BQXdCLEVBQXFCLEVBQUUsQ0FBQyxlQUFlLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQztZQUM5RyxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSTtZQUNuQixxQkFBcUIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxTQUFTO1lBQ3RDLGFBQWEsRUFBRSxFQUFFO1lBQ2pCLG9CQUFvQixFQUFFLEtBQUs7U0FDM0IsQ0FBQztRQUNGLE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQUVELEtBQUssQ0FBQyxtQ0FBbUMsRUFBRSxHQUFHLEVBQUU7UUFDL0MsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDakIsTUFBTSxLQUFLLEdBQUcsWUFBWSxDQUFDLG1CQUFXLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUMzRCxNQUFNLE1BQU0sR0FBRyw0Q0FBb0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxhQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRWhILE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFO2dCQUM5QixTQUFTO2dCQUNULFNBQVM7Z0JBQ1QsU0FBUztnQkFDVCxTQUFTO2dCQUNULFNBQVM7Z0JBQ1QsU0FBUztnQkFDVCxTQUFTO2dCQUNULFNBQVM7Z0JBQ1QsU0FBUztnQkFDVCxTQUFTO2dCQUNULFNBQVM7Z0JBQ1QsU0FBUztnQkFDVCxTQUFTO2dCQUNULFNBQVM7Z0JBQ1QsU0FBUztnQkFDVCxTQUFTO2FBQ1QsRUFBRSw4RUFBOEUsQ0FBQyxDQUFDO1FBRXBGLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUNwQixNQUFNLEtBQUssR0FBRyxZQUFZLENBQUMsbUJBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QyxNQUFNLE1BQU0sR0FBRyw0Q0FBb0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxhQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRWhILE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFO2dCQUM5QixTQUFTO2dCQUNULFNBQVM7Z0JBQ1QsU0FBUztnQkFDVCxTQUFTO2dCQUNULFNBQVM7Z0JBQ1QsU0FBUztnQkFDVCxTQUFTO2dCQUNULFNBQVM7Z0JBQ1QsU0FBUztnQkFDVCxTQUFTO2dCQUNULFNBQVM7Z0JBQ1QsU0FBUztnQkFDVCxTQUFTO2dCQUNULFNBQVM7Z0JBQ1QsU0FBUztnQkFDVCxTQUFTO2FBQ1QsRUFBRSx5RUFBeUUsQ0FBQyxDQUFDO1FBRS9FLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUNuQixNQUFNLEtBQUssR0FBRyxZQUFZLENBQUMsbUJBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3QyxNQUFNLE1BQU0sR0FBRyw0Q0FBb0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxhQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRWhILE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFO2dCQUM5QixTQUFTO2dCQUNULFNBQVM7Z0JBQ1QsU0FBUztnQkFDVCxTQUFTO2dCQUNULFNBQVM7Z0JBQ1QsU0FBUztnQkFDVCxTQUFTO2dCQUNULFNBQVM7Z0JBQ1QsU0FBUztnQkFDVCxTQUFTO2dCQUNULFNBQVM7Z0JBQ1QsU0FBUztnQkFDVCxTQUFTO2dCQUNULFNBQVM7Z0JBQ1QsU0FBUztnQkFDVCxTQUFTO2FBQ1QsRUFBRSxxRUFBcUUsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUMifQ==