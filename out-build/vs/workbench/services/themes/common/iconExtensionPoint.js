/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/services/themes/common/iconExtensionPoint", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/theme/common/iconRegistry", "vs/platform/registry/common/platform", "vs/base/common/themables", "vs/base/common/resources", "vs/base/common/path"], function (require, exports, nls, extensionsRegistry_1, iconRegistry_1, platform_1, themables_1, resources, path_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$U$ = void 0;
    const iconRegistry = platform_1.$8m.as(iconRegistry_1.$8u.IconContribution);
    const iconReferenceSchema = iconRegistry.getIconReferenceSchema();
    const iconIdPattern = `^${themables_1.ThemeIcon.iconNameSegment}(-${themables_1.ThemeIcon.iconNameSegment})+$`;
    const iconConfigurationExtPoint = extensionsRegistry_1.$2F.registerExtensionPoint({
        extensionPoint: 'icons',
        jsonSchema: {
            description: nls.localize(0, null),
            type: 'object',
            propertyNames: {
                pattern: iconIdPattern,
                description: nls.localize(1, null),
                patternErrorMessage: nls.localize(2, null),
            },
            additionalProperties: {
                type: 'object',
                properties: {
                    description: {
                        type: 'string',
                        description: nls.localize(3, null),
                    },
                    default: {
                        anyOf: [
                            iconReferenceSchema,
                            {
                                type: 'object',
                                properties: {
                                    fontPath: {
                                        description: nls.localize(4, null),
                                        type: 'string'
                                    },
                                    fontCharacter: {
                                        description: nls.localize(5, null),
                                        type: 'string'
                                    }
                                },
                                required: ['fontPath', 'fontCharacter'],
                                defaultSnippets: [{ body: { fontPath: '${1:myiconfont.woff}', fontCharacter: '${2:\\\\E001}' } }]
                            }
                        ],
                        description: nls.localize(6, null),
                    }
                },
                required: ['description', 'default'],
                defaultSnippets: [{ body: { description: '${1:my icon}', default: { fontPath: '${2:myiconfont.woff}', fontCharacter: '${3:\\\\E001}' } } }]
            },
            defaultSnippets: [{ body: { '${1:my-icon-id}': { description: '${2:my icon}', default: { fontPath: '${3:myiconfont.woff}', fontCharacter: '${4:\\\\E001}' } } } }]
        }
    });
    class $U$ {
        constructor() {
            iconConfigurationExtPoint.setHandler((extensions, delta) => {
                for (const extension of delta.added) {
                    const extensionValue = extension.value;
                    const collector = extension.collector;
                    if (!extensionValue || typeof extensionValue !== 'object') {
                        collector.error(nls.localize(7, null));
                        return;
                    }
                    for (const id in extensionValue) {
                        if (!id.match(iconIdPattern)) {
                            collector.error(nls.localize(8, null));
                            return;
                        }
                        const iconContribution = extensionValue[id];
                        if (typeof iconContribution.description !== 'string' || iconContribution.description.length === 0) {
                            collector.error(nls.localize(9, null));
                            return;
                        }
                        const defaultIcon = iconContribution.default;
                        if (typeof defaultIcon === 'string') {
                            iconRegistry.registerIcon(id, { id: defaultIcon }, iconContribution.description);
                        }
                        else if (typeof defaultIcon === 'object' && typeof defaultIcon.fontPath === 'string' && typeof defaultIcon.fontCharacter === 'string') {
                            const format = (0, path_1.$be)(defaultIcon.fontPath).substring(1);
                            if (['woff', 'woff2', 'ttf'].indexOf(format) === -1) {
                                collector.warn(nls.localize(10, null, format));
                                return;
                            }
                            const extensionLocation = extension.description.extensionLocation;
                            const iconFontLocation = resources.$ig(extensionLocation, defaultIcon.fontPath);
                            if (!resources.$cg(iconFontLocation, extensionLocation)) {
                                collector.warn(nls.localize(11, null, iconFontLocation.path, extensionLocation.path));
                                return;
                            }
                            const fontId = getFontId(extension.description, defaultIcon.fontPath);
                            const definition = iconRegistry.registerIconFont(fontId, { src: [{ location: iconFontLocation, format }] });
                            iconRegistry.registerIcon(id, {
                                fontCharacter: defaultIcon.fontCharacter,
                                font: {
                                    id: fontId,
                                    definition
                                }
                            }, iconContribution.description);
                        }
                        else {
                            collector.error(nls.localize(12, null));
                        }
                    }
                }
                for (const extension of delta.removed) {
                    const extensionValue = extension.value;
                    for (const id in extensionValue) {
                        iconRegistry.deregisterIcon(id);
                    }
                }
            });
        }
    }
    exports.$U$ = $U$;
    function getFontId(description, fontPath) {
        return path_1.$6d.join(description.identifier.value, fontPath);
    }
});
//# sourceMappingURL=iconExtensionPoint.js.map