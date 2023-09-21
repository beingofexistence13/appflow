/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/theme/common/colorRegistry", "vs/base/common/color", "vs/platform/registry/common/platform"], function (require, exports, nls, extensionsRegistry_1, colorRegistry_1, color_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ColorExtensionPoint = void 0;
    const colorRegistry = platform_1.Registry.as(colorRegistry_1.Extensions.ColorContribution);
    const colorReferenceSchema = colorRegistry.getColorReferenceSchema();
    const colorIdPattern = '^\\w+[.\\w+]*$';
    const configurationExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'colors',
        jsonSchema: {
            description: nls.localize('contributes.color', 'Contributes extension defined themable colors'),
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        description: nls.localize('contributes.color.id', 'The identifier of the themable color'),
                        pattern: colorIdPattern,
                        patternErrorMessage: nls.localize('contributes.color.id.format', 'Identifiers must only contain letters, digits and dots and can not start with a dot'),
                    },
                    description: {
                        type: 'string',
                        description: nls.localize('contributes.color.description', 'The description of the themable color'),
                    },
                    defaults: {
                        type: 'object',
                        properties: {
                            light: {
                                description: nls.localize('contributes.defaults.light', 'The default color for light themes. Either a color value in hex (#RRGGBB[AA]) or the identifier of a themable color which provides the default.'),
                                type: 'string',
                                anyOf: [
                                    colorReferenceSchema,
                                    { type: 'string', format: 'color-hex' }
                                ]
                            },
                            dark: {
                                description: nls.localize('contributes.defaults.dark', 'The default color for dark themes. Either a color value in hex (#RRGGBB[AA]) or the identifier of a themable color which provides the default.'),
                                type: 'string',
                                anyOf: [
                                    colorReferenceSchema,
                                    { type: 'string', format: 'color-hex' }
                                ]
                            },
                            highContrast: {
                                description: nls.localize('contributes.defaults.highContrast', 'The default color for high contrast dark themes. Either a color value in hex (#RRGGBB[AA]) or the identifier of a themable color which provides the default. If not provided, the `dark` color is used as default for high contrast dark themes.'),
                                type: 'string',
                                anyOf: [
                                    colorReferenceSchema,
                                    { type: 'string', format: 'color-hex' }
                                ]
                            },
                            highContrastLight: {
                                description: nls.localize('contributes.defaults.highContrastLight', 'The default color for high contrast light themes. Either a color value in hex (#RRGGBB[AA]) or the identifier of a themable color which provides the default. If not provided, the `light` color is used as default for high contrast light themes.'),
                                type: 'string',
                                anyOf: [
                                    colorReferenceSchema,
                                    { type: 'string', format: 'color-hex' }
                                ]
                            }
                        },
                        required: ['light', 'dark']
                    }
                }
            }
        }
    });
    class ColorExtensionPoint {
        constructor() {
            configurationExtPoint.setHandler((extensions, delta) => {
                for (const extension of delta.added) {
                    const extensionValue = extension.value;
                    const collector = extension.collector;
                    if (!extensionValue || !Array.isArray(extensionValue)) {
                        collector.error(nls.localize('invalid.colorConfiguration', "'configuration.colors' must be a array"));
                        return;
                    }
                    const parseColorValue = (s, name) => {
                        if (s.length > 0) {
                            if (s[0] === '#') {
                                return color_1.Color.Format.CSS.parseHex(s);
                            }
                            else {
                                return s;
                            }
                        }
                        collector.error(nls.localize('invalid.default.colorType', "{0} must be either a color value in hex (#RRGGBB[AA] or #RGB[A]) or the identifier of a themable color which provides the default.", name));
                        return color_1.Color.red;
                    };
                    for (const colorContribution of extensionValue) {
                        if (typeof colorContribution.id !== 'string' || colorContribution.id.length === 0) {
                            collector.error(nls.localize('invalid.id', "'configuration.colors.id' must be defined and can not be empty"));
                            return;
                        }
                        if (!colorContribution.id.match(colorIdPattern)) {
                            collector.error(nls.localize('invalid.id.format', "'configuration.colors.id' must only contain letters, digits and dots and can not start with a dot"));
                            return;
                        }
                        if (typeof colorContribution.description !== 'string' || colorContribution.id.length === 0) {
                            collector.error(nls.localize('invalid.description', "'configuration.colors.description' must be defined and can not be empty"));
                            return;
                        }
                        const defaults = colorContribution.defaults;
                        if (!defaults || typeof defaults !== 'object' || typeof defaults.light !== 'string' || typeof defaults.dark !== 'string') {
                            collector.error(nls.localize('invalid.defaults', "'configuration.colors.defaults' must be defined and must contain 'light' and 'dark'"));
                            return;
                        }
                        if (defaults.highContrast && typeof defaults.highContrast !== 'string') {
                            collector.error(nls.localize('invalid.defaults.highContrast', "If defined, 'configuration.colors.defaults.highContrast' must be a string."));
                            return;
                        }
                        if (defaults.highContrastLight && typeof defaults.highContrastLight !== 'string') {
                            collector.error(nls.localize('invalid.defaults.highContrastLight', "If defined, 'configuration.colors.defaults.highContrastLight' must be a string."));
                            return;
                        }
                        colorRegistry.registerColor(colorContribution.id, {
                            light: parseColorValue(defaults.light, 'configuration.colors.defaults.light'),
                            dark: parseColorValue(defaults.dark, 'configuration.colors.defaults.dark'),
                            hcDark: parseColorValue(defaults.highContrast ?? defaults.dark, 'configuration.colors.defaults.highContrast'),
                            hcLight: parseColorValue(defaults.highContrastLight ?? defaults.light, 'configuration.colors.defaults.highContrastLight'),
                        }, colorContribution.description);
                    }
                }
                for (const extension of delta.removed) {
                    const extensionValue = extension.value;
                    for (const colorContribution of extensionValue) {
                        colorRegistry.deregisterColor(colorContribution.id);
                    }
                }
            });
        }
    }
    exports.ColorExtensionPoint = ColorExtensionPoint;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3JFeHRlbnNpb25Qb2ludC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy90aGVtZXMvY29tbW9uL2NvbG9yRXh0ZW5zaW9uUG9pbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBY2hHLE1BQU0sYUFBYSxHQUFtQixtQkFBUSxDQUFDLEVBQUUsQ0FBaUIsMEJBQXVCLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUU3RyxNQUFNLG9CQUFvQixHQUFHLGFBQWEsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO0lBQ3JFLE1BQU0sY0FBYyxHQUFHLGdCQUFnQixDQUFDO0lBRXhDLE1BQU0scUJBQXFCLEdBQUcsdUNBQWtCLENBQUMsc0JBQXNCLENBQXlCO1FBQy9GLGNBQWMsRUFBRSxRQUFRO1FBQ3hCLFVBQVUsRUFBRTtZQUNYLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLG1CQUFtQixFQUFFLCtDQUErQyxDQUFDO1lBQy9GLElBQUksRUFBRSxPQUFPO1lBQ2IsS0FBSyxFQUFFO2dCQUNOLElBQUksRUFBRSxRQUFRO2dCQUNkLFVBQVUsRUFBRTtvQkFDWCxFQUFFLEVBQUU7d0JBQ0gsSUFBSSxFQUFFLFFBQVE7d0JBQ2QsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLEVBQUUsc0NBQXNDLENBQUM7d0JBQ3pGLE9BQU8sRUFBRSxjQUFjO3dCQUN2QixtQkFBbUIsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDZCQUE2QixFQUFFLHFGQUFxRixDQUFDO3FCQUN2SjtvQkFDRCxXQUFXLEVBQUU7d0JBQ1osSUFBSSxFQUFFLFFBQVE7d0JBQ2QsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsK0JBQStCLEVBQUUsdUNBQXVDLENBQUM7cUJBQ25HO29CQUNELFFBQVEsRUFBRTt3QkFDVCxJQUFJLEVB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