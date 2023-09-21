/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/services/themes/common/colorExtensionPoint", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/theme/common/colorRegistry", "vs/base/common/color", "vs/platform/registry/common/platform"], function (require, exports, nls, extensionsRegistry_1, colorRegistry_1, color_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$T$ = void 0;
    const colorRegistry = platform_1.$8m.as(colorRegistry_1.$rv.ColorContribution);
    const colorReferenceSchema = colorRegistry.getColorReferenceSchema();
    const colorIdPattern = '^\\w+[.\\w+]*$';
    const configurationExtPoint = extensionsRegistry_1.$2F.registerExtensionPoint({
        extensionPoint: 'colors',
        jsonSchema: {
            description: nls.localize(0, null),
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        description: nls.localize(1, null),
                        pattern: colorIdPattern,
                        patternErrorMessage: nls.localize(2, null),
                    },
                    description: {
                        type: 'string',
                        description: nls.localize(3, null),
                    },
                    defaults: {
                        type: 'object',
                        properties: {
                            light: {
                                description: nls.localize(4, null),
                                type: 'string',
                                anyOf: [
                                    colorReferenceSchema,
                                    { type: 'string', format: 'color-hex' }
                                ]
                            },
                            dark: {
                                description: nls.localize(5, null),
                                type: 'string',
                                anyOf: [
                                    colorReferenceSchema,
                                    { type: 'string', format: 'color-hex' }
                                ]
                            },
                            highContrast: {
                                description: nls.localize(6, null),
                                type: 'string',
                                anyOf: [
                                    colorReferenceSchema,
                                    { type: 'string', format: 'color-hex' }
                                ]
                            },
                            highContrastLight: {
                                description: nls.localize(7, null),
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
    class $T$ {
        constructor() {
            configurationExtPoint.setHandler((extensions, delta) => {
                for (const extension of delta.added) {
                    const extensionValue = extension.value;
                    const collector = extension.collector;
                    if (!extensionValue || !Array.isArray(extensionValue)) {
                        collector.error(nls.localize(8, null));
                        return;
                    }
                    const parseColorValue = (s, name) => {
                        if (s.length > 0) {
                            if (s[0] === '#') {
                                return color_1.$Os.Format.CSS.parseHex(s);
                            }
                            else {
                                return s;
                            }
                        }
                        collector.error(nls.localize(9, null, name));
                        return color_1.$Os.red;
                    };
                    for (const colorContribution of extensionValue) {
                        if (typeof colorContribution.id !== 'string' || colorContribution.id.length === 0) {
                            collector.error(nls.localize(10, null));
                            return;
                        }
                        if (!colorContribution.id.match(colorIdPattern)) {
                            collector.error(nls.localize(11, null));
                            return;
                        }
                        if (typeof colorContribution.description !== 'string' || colorContribution.id.length === 0) {
                            collector.error(nls.localize(12, null));
                            return;
                        }
                        const defaults = colorContribution.defaults;
                        if (!defaults || typeof defaults !== 'object' || typeof defaults.light !== 'string' || typeof defaults.dark !== 'string') {
                            collector.error(nls.localize(13, null));
                            return;
                        }
                        if (defaults.highContrast && typeof defaults.highContrast !== 'string') {
                            collector.error(nls.localize(14, null));
                            return;
                        }
                        if (defaults.highContrastLight && typeof defaults.highContrastLight !== 'string') {
                            collector.error(nls.localize(15, null));
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
    exports.$T$ = $T$;
});
//# sourceMappingURL=colorExtensionPoint.js.map