/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/types", "vs/base/common/resources", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/workbench/services/themes/common/workbenchThemeService", "vs/base/common/event"], function (require, exports, nls, types, resources, extensionsRegistry_1, workbenchThemeService_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ThemeRegistry = exports.registerProductIconThemeExtensionPoint = exports.registerFileIconThemeExtensionPoint = exports.registerColorThemeExtensionPoint = void 0;
    function registerColorThemeExtensionPoint() {
        return extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
            extensionPoint: 'themes',
            jsonSchema: {
                description: nls.localize('vscode.extension.contributes.themes', 'Contributes textmate color themes.'),
                type: 'array',
                items: {
                    type: 'object',
                    defaultSnippets: [{ body: { label: '${1:label}', id: '${2:id}', uiTheme: workbenchThemeService_1.VS_DARK_THEME, path: './themes/${3:id}.tmTheme.' } }],
                    properties: {
                        id: {
                            description: nls.localize('vscode.extension.contributes.themes.id', 'Id of the color theme as used in the user settings.'),
                            type: 'string'
                        },
                        label: {
                            description: nls.localize('vscode.extension.contributes.themes.label', 'Label of the color theme as shown in the UI.'),
                            type: 'string'
                        },
                        uiTheme: {
                            description: nls.localize('vscode.extension.contributes.themes.uiTheme', 'Base theme defining the colors around the editor: \'vs\' is the light color theme, \'vs-dark\' is the dark color theme. \'hc-black\' is the dark high contrast theme, \'hc-light\' is the light high contrast theme.'),
                            enum: [workbenchThemeService_1.VS_LIGHT_THEME, workbenchThemeService_1.VS_DARK_THEME, workbenchThemeService_1.VS_HC_THEME, workbenchThemeService_1.VS_HC_LIGHT_THEME]
                        },
                        path: {
                            description: nls.localize('vscode.extension.contributes.themes.path', 'Path of the tmTheme file. The path is relative to the extension folder and is typically \'./colorthemes/awesome-color-theme.json\'.'),
                            type: 'string'
                        }
                    },
                    required: ['path', 'uiTheme']
                }
            }
        });
    }
    exports.registerColorThemeExtensionPoint = registerColorThemeExtensionPoint;
    function registerFileIconThemeExtensionPoint() {
        return extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
            extensionPoint: 'iconThemes',
            jsonSchema: {
                description: nls.localize('vscode.extension.contributes.iconThemes', 'Contributes file icon themes.'),
                type: 'array',
                items: {
                    type: 'object',
                    defaultSnippets: [{ body: { id: '${1:id}', label: '${2:label}', path: './fileicons/${3:id}-icon-theme.json' } }],
                    properties: {
                        id: {
                            description: nls.localize('vscode.extension.contributes.iconThemes.id', 'Id of the file icon theme as used in the user settings.'),
                            type: 'string'
                        },
                        label: {
                            description: nls.localize('vscode.extension.contributes.iconThemes.label', 'Label of the file icon theme as shown in the UI.'),
                            type: 'string'
                        },
                        path: {
                            description: nls.localize('vscode.extension.contributes.iconThemes.path', 'Path of the file icon theme definition file. The path is relative to the extension folder and is typically \'./fileicons/awesome-icon-theme.json\'.'),
                            type: 'string'
                        }
                    },
                    required: ['path', 'id']
                }
            }
        });
    }
    exports.registerFileIconThemeExtensionPoint = registerFileIconThemeExtensionPoint;
    function registerProductIconThemeExtensionPoint() {
        return extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
            extensionPoint: 'productIconThemes',
            jsonSchema: {
                description: nls.localize('vscode.extension.contributes.productIconThemes', 'Contributes product icon themes.'),
                type: 'array',
                items: {
                    type: 'object',
                    defaultSnippets: [{ body: { id: '${1:id}', label: '${2:label}', path: './producticons/${3:id}-product-icon-theme.json' } }],
                    properties: {
                        id: {
                            description: nls.localize('vscode.extension.contributes.productIconThemes.id', 'Id of the product icon theme as used in the user settings.'),
                            type: 'string'
                        },
                        label: {
                            description: nls.localize('vscode.extension.contributes.productIconThemes.label', 'Label of the product icon theme as shown in the UI.'),
                            type: 'string'
                        },
                        path: {
                            description: nls.localize('vscode.extension.contributes.productIconThemes.path', 'Path of the product icon theme definition file. The path is relative to the extension folder and is typically \'./producticons/awesome-product-icon-theme.json\'.'),
                            type: 'string'
                        }
                    },
                    required: ['path', 'id']
                }
            }
        });
    }
    exports.registerProductIconThemeExtensionPoint = registerProductIconThemeExtensionPoint;
    class ThemeRegistry {
        constructor(themesExtPoint, create, idRequired = false, builtInTheme = undefined) {
            this.themesExtPoint = themesExtPoint;
            this.create = create;
            this.idRequired = idRequired;
            this.builtInTheme = builtInTheme;
            this.onDidChangeEmitter = new event_1.Emitter();
            this.onDidChange = this.onDidChangeEmitter.event;
            this.extensionThemes = [];
            this.initialize();
        }
        initialize() {
            this.themesExtPoint.setHandler((extensions, delta) => {
                const previousIds = {};
                const added = [];
                for (const theme of this.extensionThemes) {
                    previousIds[theme.id] = theme;
                }
                this.extensionThemes.length = 0;
                for (const ext of extensions) {
                    const extensionData = workbenchThemeService_1.ExtensionData.fromName(ext.description.publisher, ext.description.name, ext.description.isBuiltin);
                    this.onThemes(extensionData, ext.description.extensionLocation, ext.value, this.extensionThemes, ext.collector);
                }
                for (const theme of this.extensionThemes) {
                    if (!previousIds[theme.id]) {
                        added.push(theme);
                    }
                    else {
                        delete previousIds[theme.id];
                    }
                }
                const removed = Object.values(previousIds);
                this.onDidChangeEmitter.fire({ themes: this.extensionThemes, added, removed });
            });
        }
        onThemes(extensionData, extensionLocation, themeContributions, resultingThemes = [], log) {
            if (!Array.isArray(themeContributions)) {
                log?.error(nls.localize('reqarray', "Extension point `{0}` must be an array.", this.themesExtPoint.name));
                return resultingThemes;
            }
            themeContributions.forEach(theme => {
                if (!theme.path || !types.isString(theme.path)) {
                    log?.error(nls.localize('reqpath', "Expected string in `contributes.{0}.path`. Provided value: {1}", this.themesExtPoint.name, String(theme.path)));
                    return;
                }
                if (this.idRequired && (!theme.id || !types.isString(theme.id))) {
                    log?.error(nls.localize('reqid', "Expected string in `contributes.{0}.id`. Provided value: {1}", this.themesExtPoint.name, String(theme.id)));
                    return;
                }
                const themeLocation = resources.joinPath(extensionLocation, theme.path);
                if (!resources.isEqualOrParent(themeLocation, extensionLocation)) {
                    log?.warn(nls.localize('invalid.path.1', "Expected `contributes.{0}.path` ({1}) to be included inside extension's folder ({2}). This might make the extension non-portable.", this.themesExtPoint.name, themeLocation.path, extensionLocation.path));
                }
                const themeData = this.create(theme, themeLocation, extensionData);
                resultingThemes.push(themeData);
            });
            return resultingThemes;
        }
        findThemeById(themeId) {
            if (this.builtInTheme && this.builtInTheme.id === themeId) {
                return this.builtInTheme;
            }
            const allThemes = this.getThemes();
            for (const t of allThemes) {
                if (t.id === themeId) {
                    return t;
                }
            }
            return undefined;
        }
        findThemeBySettingsId(settingsId, defaultSettingsId) {
            if (this.builtInTheme && this.builtInTheme.settingsId === settingsId) {
                return this.builtInTheme;
            }
            const allThemes = this.getThemes();
            let defaultTheme = undefined;
            for (const t of allThemes) {
                if (t.settingsId === settingsId) {
                    return t;
                }
                if (t.settingsId === defaultSettingsId) {
                    defaultTheme = t;
                }
            }
            return defaultTheme;
        }
        findThemeByExtensionLocation(extLocation) {
            if (extLocation) {
                return this.getThemes().filter(t => t.location && resources.isEqualOrParent(t.location, extLocation));
            }
            return [];
        }
        getThemes() {
            return this.extensionThemes;
        }
        getMarketplaceThemes(manifest, extensionLocation, extensionData) {
            const themes = manifest?.contributes?.[this.themesExtPoint.name];
            if (Array.isArray(themes)) {
                return this.onThemes(extensionData, extensionLocation, themes);
            }
            return [];
        }
    }
    exports.ThemeRegistry = ThemeRegistry;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWVFeHRlbnNpb25Qb2ludHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdGhlbWVzL2NvbW1vbi90aGVtZUV4dGVuc2lvblBvaW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFZaEcsU0FBZ0IsZ0NBQWdDO1FBQy9DLE9BQU8sdUNBQWtCLENBQUMsc0JBQXNCLENBQXlCO1lBQ3hFLGNBQWMsRUFBRSxRQUFRO1lBQ3hCLFVBQVUsRUFBRTtnQkFDWCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxxQ0FBcUMsRUFBRSxvQ0FBb0MsQ0FBQztnQkFDdEcsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsS0FBSyxFQUFFO29CQUNOLElBQUksRUFBRSxRQUFRO29CQUNkLGVBQWUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxxQ0FBYSxFQUFFLElBQUksRUFBRSwyQkFBMkIsRUFBRSxFQUFFLENBQUM7b0JBQzlILFVBQVUsRUFBRTt3QkFDWCxFQUFFLEVBQUU7NEJBQ0gsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsd0NBQXdDLEVBQUUscURBQXFELENBQUM7NEJBQzFILElBQUksRUFBRSxRQUFRO3lCQUNkO3dCQUNELEtBQUssRUFBRTs0QkFDTixXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQywyQ0FBMkMsRUFBRSw4Q0FBOEMsQ0FBQzs0QkFDdEgsSUFBSSxFQUFFLFFBQVE7eUJBQ2Q7d0JBQ0QsT0FBTyxFQUFFOzRCQUNSLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDZDQUE2QyxFQUFFLHNOQUFzTixDQUFDOzRCQUNoUyxJQUFJLEVBQUUsQ0FBQyxzQ0FBYyxFQUFFLHFDQUFhLEVBQUUsbUNB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