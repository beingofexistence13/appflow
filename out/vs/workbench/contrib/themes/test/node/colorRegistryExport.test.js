/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/color", "vs/platform/registry/common/platform", "vs/platform/theme/common/colorRegistry"], function (require, exports, color_1, platform_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ColorRegistry', () => {
        if (process.env.VSCODE_COLOR_REGISTRY_EXPORT) {
            test('exports', () => {
                const themingRegistry = platform_1.Registry.as(colorRegistry_1.Extensions.ColorContribution);
                const colors = themingRegistry.getColors();
                const replacer = (_key, value) => value instanceof color_1.Color ? color_1.Color.Format.CSS.formatHexA(value) : value;
                console.log(`#colors:${JSON.stringify(colors, replacer)}\n`);
            });
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3JSZWdpc3RyeUV4cG9ydC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGhlbWVzL3Rlc3Qvbm9kZS9jb2xvclJlZ2lzdHJ5RXhwb3J0LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFNaEcsS0FBSyxDQUFDLGVBQWUsRUFBRSxHQUFHLEVBQUU7UUFDM0IsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixFQUFFO1lBQzdDLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFO2dCQUNwQixNQUFNLGVBQWUsR0FBRyxtQkFBUSxDQUFDLEVBQUUsQ0FBaUIsMEJBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUNsRixNQUFNLE1BQU0sR0FBRyxlQUFlLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQzNDLE1BQU0sUUFBUSxHQUFHLENBQUMsSUFBWSxFQUFFLEtBQWMsRUFBRSxFQUFFLENBQ2pELEtBQUssWUFBWSxhQUFLLENBQUMsQ0FBQyxDQUFDLGFBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO2dCQUNyRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlELENBQUMsQ0FBQyxDQUFDO1NBQ0g7SUFDRixDQUFDLENBQUMsQ0FBQyJ9