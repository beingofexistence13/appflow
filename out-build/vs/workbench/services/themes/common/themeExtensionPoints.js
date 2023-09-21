/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/services/themes/common/themeExtensionPoints", "vs/base/common/types", "vs/base/common/resources", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/workbench/services/themes/common/workbenchThemeService", "vs/base/common/event"], function (require, exports, nls, types, resources, extensionsRegistry_1, workbenchThemeService_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$szb = exports.$rzb = exports.$qzb = exports.$pzb = void 0;
    function $pzb() {
        return extensionsRegistry_1.$2F.registerExtensionPoint({
            extensionPoint: 'themes',
            jsonSchema: {
                description: nls.localize(0, null),
                type: 'array',
                items: {
                    type: 'object',
                    defaultSnippets: [{ body: { label: '${1:label}', id: '${2:id}', uiTheme: workbenchThemeService_1.$ggb, path: './themes/${3:id}.tmTheme.' } }],
                    properties: {
                        id: {
                            description: nls.localize(1, null),
                            type: 'string'
                        },
                        label: {
                            description: nls.localize(2, null),
                            type: 'string'
                        },
                        uiTheme: {
                            description: nls.localize(3, null),
                            enum: [workbenchThemeService_1.$fgb, workbenchThemeService_1.$ggb, workbenchThemeService_1.$hgb, workbenchThemeService_1.$igb]
                        },
                        path: {
                            description: nls.localize(4, null),
                            type: 'string'
                        }
                    },
                    required: ['path', 'uiTheme']
                }
            }
        });
    }
    exports.$pzb = $pzb;
    function $qzb() {
        return extensionsRegistry_1.$2F.registerExtensionPoint({
            extensionPoint: 'iconThemes',
            jsonSchema: {
                description: nls.localize(5, null),
                type: 'array',
                items: {
                    type: 'object',
                    defaultSnippets: [{ body: { id: '${1:id}', label: '${2:label}', path: './fileicons/${3:id}-icon-theme.json' } }],
                    properties: {
                        id: {
                            description: nls.localize(6, null),
                            type: 'string'
                        },
                        label: {
                            description: nls.localize(7, null),
                            type: 'string'
                        },
                        path: {
                            description: nls.localize(8, null),
                            type: 'string'
                        }
                    },
                    required: ['path', 'id']
                }
            }
        });
    }
    exports.$qzb = $qzb;
    function $rzb() {
        return extensionsRegistry_1.$2F.registerExtensionPoint({
            extensionPoint: 'productIconThemes',
            jsonSchema: {
                description: nls.localize(9, null),
                type: 'array',
                items: {
                    type: 'object',
                    defaultSnippets: [{ body: { id: '${1:id}', label: '${2:label}', path: './producticons/${3:id}-product-icon-theme.json' } }],
                    properties: {
                        id: {
                            description: nls.localize(10, null),
                            type: 'string'
                        },
                        label: {
                            description: nls.localize(11, null),
                            type: 'string'
                        },
                        path: {
                            description: nls.localize(12, null),
                            type: 'string'
                        }
                    },
                    required: ['path', 'id']
                }
            }
        });
    }
    exports.$rzb = $rzb;
    class $szb {
        constructor(c, d, e = false, f = undefined) {
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
            this.b = new event_1.$fd();
            this.onDidChange = this.b.event;
            this.a = [];
            this.g();
        }
        g() {
            this.c.setHandler((extensions, delta) => {
                const previousIds = {};
                const added = [];
                for (const theme of this.a) {
                    previousIds[theme.id] = theme;
                }
                this.a.length = 0;
                for (const ext of extensions) {
                    const extensionData = workbenchThemeService_1.ExtensionData.fromName(ext.description.publisher, ext.description.name, ext.description.isBuiltin);
                    this.h(extensionData, ext.description.extensionLocation, ext.value, this.a, ext.collector);
                }
                for (const theme of this.a) {
                    if (!previousIds[theme.id]) {
                        added.push(theme);
                    }
                    else {
                        delete previousIds[theme.id];
                    }
                }
                const removed = Object.values(previousIds);
                this.b.fire({ themes: this.a, added, removed });
            });
        }
        h(extensionData, extensionLocation, themeContributions, resultingThemes = [], log) {
            if (!Array.isArray(themeContributions)) {
                log?.error(nls.localize(13, null, this.c.name));
                return resultingThemes;
            }
            themeContributions.forEach(theme => {
                if (!theme.path || !types.$jf(theme.path)) {
                    log?.error(nls.localize(14, null, this.c.name, String(theme.path)));
                    return;
                }
                if (this.e && (!theme.id || !types.$jf(theme.id))) {
                    log?.error(nls.localize(15, null, this.c.name, String(theme.id)));
                    return;
                }
                const themeLocation = resources.$ig(extensionLocation, theme.path);
                if (!resources.$cg(themeLocation, extensionLocation)) {
                    log?.warn(nls.localize(16, null, this.c.name, themeLocation.path, extensionLocation.path));
                }
                const themeData = this.d(theme, themeLocation, extensionData);
                resultingThemes.push(themeData);
            });
            return resultingThemes;
        }
        findThemeById(themeId) {
            if (this.f && this.f.id === themeId) {
                return this.f;
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
            if (this.f && this.f.settingsId === settingsId) {
                return this.f;
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
                return this.getThemes().filter(t => t.location && resources.$cg(t.location, extLocation));
            }
            return [];
        }
        getThemes() {
            return this.a;
        }
        getMarketplaceThemes(manifest, extensionLocation, extensionData) {
            const themes = manifest?.contributes?.[this.c.name];
            if (Array.isArray(themes)) {
                return this.h(extensionData, extensionLocation, themes);
            }
            return [];
        }
    }
    exports.$szb = $szb;
});
//# sourceMappingURL=themeExtensionPoints.js.map