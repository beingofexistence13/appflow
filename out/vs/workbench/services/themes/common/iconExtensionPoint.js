/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/theme/common/iconRegistry", "vs/platform/registry/common/platform", "vs/base/common/themables", "vs/base/common/resources", "vs/base/common/path"], function (require, exports, nls, extensionsRegistry_1, iconRegistry_1, platform_1, themables_1, resources, path_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IconExtensionPoint = void 0;
    const iconRegistry = platform_1.Registry.as(iconRegistry_1.Extensions.IconContribution);
    const iconReferenceSchema = iconRegistry.getIconReferenceSchema();
    const iconIdPattern = `^${themables_1.ThemeIcon.iconNameSegment}(-${themables_1.ThemeIcon.iconNameSegment})+$`;
    const iconConfigurationExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'icons',
        jsonSchema: {
            description: nls.localize('contributes.icons', 'Contributes extension defined themable icons'),
            type: 'object',
            propertyNames: {
                pattern: iconIdPattern,
                description: nls.localize('contributes.icon.id', 'The identifier of the themable icon'),
                patternErrorMessage: nls.localize('contributes.icon.id.format', 'Identifiers can only contain letters, digits and minuses and need to consist of at least two segments in the form `component-iconname`.'),
            },
            additionalProperties: {
                type: 'object',
                properties: {
                    description: {
                        type: 'string',
                        description: nls.localize('contributes.icon.description', 'The description of the themable icon'),
                    },
                    default: {
                        anyOf: [
                            iconReferenceSchema,
                            {
                                type: 'object',
                                properties: {
                                    fontPath: {
                                        description: nls.localize('contributes.icon.default.fontPath', 'The path of the icon font that defines the icon.'),
                                        type: 'string'
                                    },
                                    fontCharacter: {
                                        description: nls.localize('contributes.icon.default.fontCharacter', 'The character for the icon in the icon font.'),
                                        type: 'string'
                                    }
                                },
                                required: ['fontPath', 'fontCharacter'],
                                defaultSnippets: [{ body: { fontPath: '${1:myiconfont.woff}', fontCharacter: '${2:\\\\E001}' } }]
                            }
                        ],
                        description: nls.localize('contributes.icon.default', 'The default of the icon. Either a reference to an extisting ThemeIcon or an icon in an icon font.'),
                    }
                },
                required: ['description', 'default'],
                defaultSnippets: [{ body: { description: '${1:my icon}', default: { fontPath: '${2:myiconfont.woff}', fontCharacter: '${3:\\\\E001}' } } }]
            },
            defaultSnippets: [{ body: { '${1:my-icon-id}': { description: '${2:my icon}', default: { fontPath: '${3:myiconfont.woff}', fontCharacter: '${4:\\\\E001}' } } } }]
        }
    });
    class IconExtensionPoint {
        constructor() {
            iconConfigurationExtPoint.setHandler((extensions, delta) => {
                for (const extension of delta.added) {
                    const extensionValue = extension.value;
                    const collector = extension.collector;
                    if (!extensionValue || typeof extensionValue !== 'object') {
                        collector.error(nls.localize('invalid.icons.configuration', "'configuration.icons' must be an object with the icon names as properties."));
                        return;
                    }
                    for (const id in extensionValue) {
                        if (!id.match(iconIdPattern)) {
                            collector.error(nls.localize('invalid.icons.id.format', "'configuration.icons' keys represent the icon id and can only contain letter, digits and minuses. They need to consist of at least two segments in the form `component-iconname`."));
                            return;
                        }
                        const iconContribution = extensionValue[id];
                        if (typeof iconContribution.description !== 'string' || iconContribution.description.length === 0) {
                            collector.error(nls.localize('invalid.icons.description', "'configuration.icons.description' must be defined and can not be empty"));
                            return;
                        }
                        const defaultIcon = iconContribution.default;
                        if (typeof defaultIcon === 'string') {
                            iconRegistry.registerIcon(id, { id: defaultIcon }, iconContribution.description);
                        }
                        else if (typeof defaultIcon === 'object' && typeof defaultIcon.fontPath === 'string' && typeof defaultIcon.fontCharacter === 'string') {
                            const format = (0, path_1.extname)(defaultIcon.fontPath).substring(1);
                            if (['woff', 'woff2', 'ttf'].indexOf(format) === -1) {
                                collector.warn(nls.localize('invalid.icons.default.fontPath.extension', "Expected `contributes.icons.default.fontPath` to have file extension 'woff', woff2' or 'ttf', is '{0}'.", format));
                                return;
                            }
                            const extensionLocation = extension.description.extensionLocation;
                            const iconFontLocation = resources.joinPath(extensionLocation, defaultIcon.fontPath);
                            if (!resources.isEqualOrParent(iconFontLocation, extensionLocation)) {
                                collector.warn(nls.localize('invalid.icons.default.fontPath.path', "Expected `contributes.icons.default.fontPath` ({0}) to be included inside extension's folder ({0}).", iconFontLocation.path, extensionLocation.path));
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
                            collector.error(nls.localize('invalid.icons.default', "'configuration.icons.default' must be either a reference to the id of an other theme icon (string) or a icon definition (object) with properties `fontPath` and `fontCharacter`."));
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
    exports.IconExtensionPoint = IconExtensionPoint;
    function getFontId(description, fontPath) {
        return path_1.posix.join(description.identifier.value, fontPath);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbkV4dGVuc2lvblBvaW50LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3RoZW1lcy9jb21tb24vaWNvbkV4dGVuc2lvblBvaW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWtCaEcsTUFBTSxZQUFZLEdBQWtCLG1CQUFRLENBQUMsRUFBRSxDQUFnQix5QkFBc0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBRXhHLE1BQU0sbUJBQW1CLEdBQUcsWUFBWSxDQUFDLHNCQUFzQixFQUFFLENBQUM7SUFDbEUsTUFBTSxhQUFhLEdBQUcsSUFBSSxxQkFBUyxDQUFDLGVBQWUsS0FBSyxxQkFBUyxDQUFDLGVBQWUsS0FBSyxDQUFDO0lBRXZGLE1BQU0seUJBQXlCLEdBQUcsdUNBQWtCLENBQUMsc0JBQXNCLENBQXNCO1FBQ2hHLGNBQWMsRUFBRSxPQUFPO1FBQ3ZCLFVBQVUsRUFBRTtZQUNYLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLG1CQUFtQixFQUFFLDhDQUE4QyxDQUFDO1lBQzlGLElBQUksRUFBRSxRQUFRO1lBQ2QsYUFBYSxFQUFFO2dCQUNkLE9BQU8sRUFBRSxhQUFhO2dCQUN0QixXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxxQ0FBcUMsQ0FBQztnQkFDdkYsbUJBQW1CLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyw0QkFBNEIsRUFBRSx5SUFBeUksQ0FBQzthQUMxTTtZQUNELG9CQUFvQixFQUFFO2dCQUNyQixJQUFJLEVBQUUsUUFBUTtnQkFDZCxVQUFVLEVBQUU7b0JBQ1gsV0FBVyxFQUFFO3dCQUNaLElBQUksRUFBRSxRQUFRO3dCQUNkLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDhCQUE4QixFQUFFLHNDQUFzQyxDQUFDO3FCQUNqRztvQkFDRCxPQUFPLEVBQUU7d0JBQ1IsS0FBSyxFQUFFOzRCQUNOLG1CQUFtQjs0QkFDbkI7Z0NBQ0MsSUFBSSxFQUFFLFFBQVE7Z0NBQ2QsVUFBVSxFQUFFO29DQUNYLFFBQVEsRUFBRTt3Q0FDVCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxtQ0FBbUMsRUFBRSxrREFBa0QsQ0FBQzt3Q0FDbEgsSUFBSSxFQUFFLFFBQVE7cUNBQ2Q7b0NBQ0QsYUFBYSxFQUFFO3dDQUNkLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHdDQUF3QyxFQUFFLDhDQUE4QyxDQUFDO3dDQUNuSCxJQUFJLEVBQUUsUUFBUTtxQ0FDZDtpQ0FDRDtnQ0FDRCxRQUFRLEVBQUUsQ0FBQyxVQUFVLEVBQUUsZUFBZSxDQUFDO2dDQUN2QyxlQUFlLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxzQkFBc0IsRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUFFLEVBQUUsQ0FBQzs2QkFDakc7eUJBQ0Q7d0JBQ0QsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsMEJBQTBCLEVBQUUsbUdBQW1HLENBQUM7cUJBQzFKO2lCQUNEO2dCQUNELFFBQVEsRUFBRSxDQUFDLGFBQWEsRUFBRSxTQUFTLENBQUM7Z0JBQ3BDLGVBQWUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBRSxPQUFPLEVBQUUsRUFBRSxRQUFRLEVBQUUsc0JBQXNCLEVBQUUsYUFBYSxFQUFFLGVBQWUsRUFBRSxFQUFFLEVBQUUsQ0FBQzthQUMzSTtZQUNELGVBQWUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsaUJBQWlCLEVBQUUsRUFBRSxXQUFXLEVBQUUsY0FBYyxFQUFFLE9BQU8sRUFBRSxFQUFFLFFBQVEsRUFBRSxzQkFBc0IsRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7U0FDbEs7S0FDRCxDQUFDLENBQUM7SUFFSCxNQUFhLGtCQUFrQjtRQUU5QjtZQUNDLHlCQUF5QixDQUFDLFVBQVUsQ0FBQyxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsRUFBRTtnQkFDMUQsS0FBSyxNQUFNLFNBQVMsSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFO29CQUNwQyxNQUFNLGNBQWMsR0FBd0IsU0FBUyxDQUFDLEtBQUssQ0FBQztvQkFDNUQsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQztvQkFFdEMsSUFBSSxDQUFDLGNBQWMsSUFBSSxPQUFPLGNBQWMsS0FBSyxRQUFRLEVBQUU7d0JBQzFELFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyw2QkFBNkIsRUFBRSw0RUFBNEUsQ0FBQyxDQUFDLENBQUM7d0JBQzNJLE9BQU87cUJBQ1A7b0JBRUQsS0FBSyxNQUFNLEVBQUUsSUFBSSxjQUFjLEVBQUU7d0JBQ2hDLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxFQUFFOzRCQUM3QixTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMseUJBQXlCLEVBQUUsbUxBQW1MLENBQUMsQ0FBQyxDQUFDOzRCQUM5TyxPQUFPO3lCQUNQO3dCQUNELE1BQU0sZ0JBQWdCLEdBQUcsY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUM1QyxJQUFJLE9BQU8sZ0JBQWdCLENBQUMsV0FBVyxLQUFLLFFBQVEsSUFBSSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTs0QkFDbEcsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLDJCQUEyQixFQUFFLHdFQUF3RSxDQUFDLENBQUMsQ0FBQzs0QkFDckksT0FBTzt5QkFDUDt3QkFDRCxNQUFNLFdBQVcsR0FBRyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUM7d0JBQzdDLElBQUksT0FBTyxXQUFXLEtBQUssUUFBUSxFQUFFOzRCQUNwQyxZQUFZLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQzt5QkFDakY7NkJBQU0sSUFBSSxPQUFPLFdBQVcsS0FBSyxRQUFRLElBQUksT0FBTyxXQUFXLENBQUMsUUFBUSxLQUFLLFFBQVEsSUFBSSxPQUFPLFdBQVcsQ0FBQyxhQUFhLEtBQUssUUFBUSxFQUFFOzRCQUN4SSxNQUFNLE1BQU0sR0FBRyxJQUFBLGNBQU8sRUFBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUMxRCxJQUFJLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0NBQ3BELFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQywwQ0FBMEMsRUFBRSx5R0FBeUcsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO2dDQUM1TCxPQUFPOzZCQUNQOzRCQUNELE1BQU0saUJBQWlCLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQzs0QkFDbEUsTUFBTSxnQkFBZ0IsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQzs0QkFDckYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLEVBQUUsaUJBQWlCLENBQUMsRUFBRTtnQ0FDcEUsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLHFDQUFxQyxFQUFFLHFHQUFxRyxFQUFFLGdCQUFnQixDQUFDLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dDQUMxTixPQUFPOzZCQUNQOzRCQUNELE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQzs0QkFDdEUsTUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDOzRCQUM1RyxZQUFZLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRTtnQ0FDN0IsYUFBYSxFQUFFLFdBQVcsQ0FBQyxhQUFhO2dDQUN4QyxJQUFJLEVBQUU7b0NBQ0wsRUFBRSxFQUFFLE1BQU07b0NBQ1YsVUFBVTtpQ0FDVjs2QkFDRCxFQUFFLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDO3lCQUNqQzs2QkFBTTs0QkFDTixTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsdUJBQXVCLEVBQUUsa0xBQWtMLENBQUMsQ0FBQyxDQUFDO3lCQUMzTztxQkFDRDtpQkFDRDtnQkFDRCxLQUFLLE1BQU0sU0FBUyxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUU7b0JBQ3RDLE1BQU0sY0FBYyxHQUF3QixTQUFTLENBQUMsS0FBSyxDQUFDO29CQUM1RCxLQUFLLE1BQU0sRUFBRSxJQUFJLGNBQWMsRUFBRTt3QkFDaEMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDaEM7aUJBQ0Q7WUFDRixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRDtJQTVERCxnREE0REM7SUFFRCxTQUFTLFNBQVMsQ0FBQyxXQUFrQyxFQUFFLFFBQWdCO1FBQ3RFLE9BQU8sWUFBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztJQUMzRCxDQUFDIn0=