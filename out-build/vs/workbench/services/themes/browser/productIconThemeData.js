/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/services/themes/browser/productIconThemeData", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/json", "vs/workbench/services/themes/common/workbenchThemeService", "vs/base/common/jsonErrorMessages", "vs/workbench/services/themes/common/productIconThemeSchema", "vs/base/common/types", "vs/platform/theme/common/iconRegistry", "vs/base/common/themables"], function (require, exports, nls, Paths, resources, Json, workbenchThemeService_1, jsonErrorMessages_1, productIconThemeSchema_1, types_1, iconRegistry_1, themables_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$uzb = exports.$tzb = void 0;
    exports.$tzb = ''; // TODO
    class $uzb {
        static { this.STORAGE_KEY = 'productIconThemeData'; }
        constructor(id, label, settingsId) {
            this.iconThemeDocument = { iconDefinitions: new Map() };
            this.id = id;
            this.label = label;
            this.settingsId = settingsId;
            this.isLoaded = false;
        }
        getIcon(iconContribution) {
            return _resolveIconDefinition(iconContribution, this.iconThemeDocument);
        }
        ensureLoaded(fileService, logService) {
            return !this.isLoaded ? this.a(fileService, logService) : Promise.resolve(this.styleSheetContent);
        }
        reload(fileService, logService) {
            return this.a(fileService, logService);
        }
        async a(fileService, logService) {
            const location = this.location;
            if (!location) {
                return Promise.resolve(this.styleSheetContent);
            }
            const warnings = [];
            this.iconThemeDocument = await _loadProductIconThemeDocument(fileService, location, warnings);
            this.isLoaded = true;
            if (warnings.length) {
                logService.error(nls.localize(0, null, location.toString(), warnings.join('\n')));
            }
            return this.styleSheetContent;
        }
        static fromExtensionTheme(iconTheme, iconThemeLocation, extensionData) {
            const id = extensionData.extensionId + '-' + iconTheme.id;
            const label = iconTheme.label || Paths.$ae(iconTheme.path);
            const settingsId = iconTheme.id;
            const themeData = new $uzb(id, label, settingsId);
            themeData.description = iconTheme.description;
            themeData.location = iconThemeLocation;
            themeData.extensionData = extensionData;
            themeData.watch = iconTheme._watch;
            themeData.isLoaded = false;
            return themeData;
        }
        static createUnloadedTheme(id) {
            const themeData = new $uzb(id, '', '__' + id);
            themeData.isLoaded = false;
            themeData.extensionData = undefined;
            themeData.watch = false;
            return themeData;
        }
        static { this.b = null; }
        static get defaultTheme() {
            let themeData = $uzb.b;
            if (!themeData) {
                themeData = $uzb.b = new $uzb(exports.$tzb, nls.localize(1, null), workbenchThemeService_1.ThemeSettingDefaults.PRODUCT_ICON_THEME);
                themeData.isLoaded = true;
                themeData.extensionData = undefined;
                themeData.watch = false;
            }
            return themeData;
        }
        static fromStorageData(storageService) {
            const input = storageService.get($uzb.STORAGE_KEY, 0 /* StorageScope.PROFILE */);
            if (!input) {
                return undefined;
            }
            try {
                const data = JSON.parse(input);
                const theme = new $uzb('', '', '');
                for (const key in data) {
                    switch (key) {
                        case 'id':
                        case 'label':
                        case 'description':
                        case 'settingsId':
                        case 'styleSheetContent':
                        case 'watch':
                            theme[key] = data[key];
                            break;
                        case 'location':
                            // ignore, no longer restore
                            break;
                        case 'extensionData':
                            theme.extensionData = workbenchThemeService_1.ExtensionData.fromJSONObject(data.extensionData);
                            break;
                    }
                }
                const { iconDefinitions, iconFontDefinitions } = data;
                if (Array.isArray(iconDefinitions) && (0, types_1.$lf)(iconFontDefinitions)) {
                    const restoredIconDefinitions = new Map();
                    for (const entry of iconDefinitions) {
                        const { id, fontCharacter, fontId } = entry;
                        if ((0, types_1.$jf)(id) && (0, types_1.$jf)(fontCharacter)) {
                            if ((0, types_1.$jf)(fontId)) {
                                const iconFontDefinition = iconRegistry_1.IconFontDefinition.fromJSONObject(iconFontDefinitions[fontId]);
                                if (iconFontDefinition) {
                                    restoredIconDefinitions.set(id, { fontCharacter, font: { id: fontId, definition: iconFontDefinition } });
                                }
                            }
                            else {
                                restoredIconDefinitions.set(id, { fontCharacter });
                            }
                        }
                    }
                    theme.iconThemeDocument = { iconDefinitions: restoredIconDefinitions };
                }
                return theme;
            }
            catch (e) {
                return undefined;
            }
        }
        toStorage(storageService) {
            const iconDefinitions = [];
            const iconFontDefinitions = {};
            for (const entry of this.iconThemeDocument.iconDefinitions.entries()) {
                const font = entry[1].font;
                iconDefinitions.push({ id: entry[0], fontCharacter: entry[1].fontCharacter, fontId: font?.id });
                if (font && iconFontDefinitions[font.id] === undefined) {
                    iconFontDefinitions[font.id] = iconRegistry_1.IconFontDefinition.toJSONObject(font.definition);
                }
            }
            const data = JSON.stringify({
                id: this.id,
                label: this.label,
                description: this.description,
                settingsId: this.settingsId,
                styleSheetContent: this.styleSheetContent,
                watch: this.watch,
                extensionData: workbenchThemeService_1.ExtensionData.toJSONObject(this.extensionData),
                iconDefinitions,
                iconFontDefinitions
            });
            storageService.store($uzb.STORAGE_KEY, data, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        }
    }
    exports.$uzb = $uzb;
    function _loadProductIconThemeDocument(fileService, location, warnings) {
        return fileService.readExtensionResource(location).then((content) => {
            const parseErrors = [];
            const contentValue = Json.$Lm(content, parseErrors);
            if (parseErrors.length > 0) {
                return Promise.reject(new Error(nls.localize(2, null, parseErrors.map(e => (0, jsonErrorMessages_1.$mp)(e.error)).join(', '))));
            }
            else if (Json.$Um(contentValue) !== 'object') {
                return Promise.reject(new Error(nls.localize(3, null)));
            }
            else if (!contentValue.iconDefinitions || !Array.isArray(contentValue.fonts) || !contentValue.fonts.length) {
                return Promise.reject(new Error(nls.localize(4, null)));
            }
            const iconThemeDocumentLocationDirname = resources.$hg(location);
            const sanitizedFonts = new Map();
            for (const font of contentValue.fonts) {
                if ((0, types_1.$jf)(font.id) && font.id.match(productIconThemeSchema_1.$gzb)) {
                    const fontId = font.id;
                    let fontWeight = undefined;
                    if ((0, types_1.$jf)(font.weight) && font.weight.match(productIconThemeSchema_1.$izb)) {
                        fontWeight = font.weight;
                    }
                    else {
                        warnings.push(nls.localize(5, null, font.id));
                    }
                    let fontStyle = undefined;
                    if ((0, types_1.$jf)(font.style) && font.style.match(productIconThemeSchema_1.$hzb)) {
                        fontStyle = font.style;
                    }
                    else {
                        warnings.push(nls.localize(6, null, font.id));
                    }
                    const sanitizedSrc = [];
                    if (Array.isArray(font.src)) {
                        for (const s of font.src) {
                            if ((0, types_1.$jf)(s.path) && (0, types_1.$jf)(s.format) && s.format.match(productIconThemeSchema_1.$kzb)) {
                                const iconFontLocation = resources.$ig(iconThemeDocumentLocationDirname, s.path);
                                sanitizedSrc.push({ location: iconFontLocation, format: s.format });
                            }
                            else {
                                warnings.push(nls.localize(7, null, font.id));
                            }
                        }
                    }
                    if (sanitizedSrc.length) {
                        sanitizedFonts.set(fontId, { weight: fontWeight, style: fontStyle, src: sanitizedSrc });
                    }
                    else {
                        warnings.push(nls.localize(8, null, font.id));
                    }
                }
                else {
                    warnings.push(nls.localize(9, null, font.id));
                }
            }
            const iconDefinitions = new Map();
            const primaryFontId = contentValue.fonts[0].id;
            for (const iconId in contentValue.iconDefinitions) {
                const definition = contentValue.iconDefinitions[iconId];
                if ((0, types_1.$jf)(definition.fontCharacter)) {
                    const fontId = definition.fontId ?? primaryFontId;
                    const fontDefinition = sanitizedFonts.get(fontId);
                    if (fontDefinition) {
                        const font = { id: `pi-${fontId}`, definition: fontDefinition };
                        iconDefinitions.set(iconId, { fontCharacter: definition.fontCharacter, font });
                    }
                    else {
                        warnings.push(nls.localize(10, null, iconId));
                    }
                }
                else {
                    warnings.push(nls.localize(11, null, iconId));
                }
            }
            return { iconDefinitions };
        });
    }
    const iconRegistry = (0, iconRegistry_1.$0u)();
    function _resolveIconDefinition(iconContribution, iconThemeDocument) {
        const iconDefinitions = iconThemeDocument.iconDefinitions;
        let definition = iconDefinitions.get(iconContribution.id);
        let defaults = iconContribution.defaults;
        while (!definition && themables_1.ThemeIcon.isThemeIcon(defaults)) {
            // look if an inherited icon has a definition
            const ic = iconRegistry.getIcon(defaults.id);
            if (ic) {
                definition = iconDefinitions.get(ic.id);
                defaults = ic.defaults;
            }
            else {
                return undefined;
            }
        }
        if (definition) {
            return definition;
        }
        if (!themables_1.ThemeIcon.isThemeIcon(defaults)) {
            return defaults;
        }
        return undefined;
    }
});
//# sourceMappingURL=productIconThemeData.js.map