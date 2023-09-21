/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/json", "vs/workbench/services/themes/common/workbenchThemeService", "vs/base/common/jsonErrorMessages", "vs/workbench/services/themes/common/productIconThemeSchema", "vs/base/common/types", "vs/platform/theme/common/iconRegistry", "vs/base/common/themables"], function (require, exports, nls, Paths, resources, Json, workbenchThemeService_1, jsonErrorMessages_1, productIconThemeSchema_1, types_1, iconRegistry_1, themables_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProductIconThemeData = exports.DEFAULT_PRODUCT_ICON_THEME_ID = void 0;
    exports.DEFAULT_PRODUCT_ICON_THEME_ID = ''; // TODO
    class ProductIconThemeData {
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
            return !this.isLoaded ? this.load(fileService, logService) : Promise.resolve(this.styleSheetContent);
        }
        reload(fileService, logService) {
            return this.load(fileService, logService);
        }
        async load(fileService, logService) {
            const location = this.location;
            if (!location) {
                return Promise.resolve(this.styleSheetContent);
            }
            const warnings = [];
            this.iconThemeDocument = await _loadProductIconThemeDocument(fileService, location, warnings);
            this.isLoaded = true;
            if (warnings.length) {
                logService.error(nls.localize('error.parseicondefs', "Problems processing product icons definitions in {0}:\n{1}", location.toString(), warnings.join('\n')));
            }
            return this.styleSheetContent;
        }
        static fromExtensionTheme(iconTheme, iconThemeLocation, extensionData) {
            const id = extensionData.extensionId + '-' + iconTheme.id;
            const label = iconTheme.label || Paths.basename(iconTheme.path);
            const settingsId = iconTheme.id;
            const themeData = new ProductIconThemeData(id, label, settingsId);
            themeData.description = iconTheme.description;
            themeData.location = iconThemeLocation;
            themeData.extensionData = extensionData;
            themeData.watch = iconTheme._watch;
            themeData.isLoaded = false;
            return themeData;
        }
        static createUnloadedTheme(id) {
            const themeData = new ProductIconThemeData(id, '', '__' + id);
            themeData.isLoaded = false;
            themeData.extensionData = undefined;
            themeData.watch = false;
            return themeData;
        }
        static { this._defaultProductIconTheme = null; }
        static get defaultTheme() {
            let themeData = ProductIconThemeData._defaultProductIconTheme;
            if (!themeData) {
                themeData = ProductIconThemeData._defaultProductIconTheme = new ProductIconThemeData(exports.DEFAULT_PRODUCT_ICON_THEME_ID, nls.localize('defaultTheme', 'Default'), workbenchThemeService_1.ThemeSettingDefaults.PRODUCT_ICON_THEME);
                themeData.isLoaded = true;
                themeData.extensionData = undefined;
                themeData.watch = false;
            }
            return themeData;
        }
        static fromStorageData(storageService) {
            const input = storageService.get(ProductIconThemeData.STORAGE_KEY, 0 /* StorageScope.PROFILE */);
            if (!input) {
                return undefined;
            }
            try {
                const data = JSON.parse(input);
                const theme = new ProductIconThemeData('', '', '');
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
                if (Array.isArray(iconDefinitions) && (0, types_1.isObject)(iconFontDefinitions)) {
                    const restoredIconDefinitions = new Map();
                    for (const entry of iconDefinitions) {
                        const { id, fontCharacter, fontId } = entry;
                        if ((0, types_1.isString)(id) && (0, types_1.isString)(fontCharacter)) {
                            if ((0, types_1.isString)(fontId)) {
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
            storageService.store(ProductIconThemeData.STORAGE_KEY, data, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        }
    }
    exports.ProductIconThemeData = ProductIconThemeData;
    function _loadProductIconThemeDocument(fileService, location, warnings) {
        return fileService.readExtensionResource(location).then((content) => {
            const parseErrors = [];
            const contentValue = Json.parse(content, parseErrors);
            if (parseErrors.length > 0) {
                return Promise.reject(new Error(nls.localize('error.cannotparseicontheme', "Problems parsing product icons file: {0}", parseErrors.map(e => (0, jsonErrorMessages_1.getParseErrorMessage)(e.error)).join(', '))));
            }
            else if (Json.getNodeType(contentValue) !== 'object') {
                return Promise.reject(new Error(nls.localize('error.invalidformat', "Invalid format for product icons theme file: Object expected.")));
            }
            else if (!contentValue.iconDefinitions || !Array.isArray(contentValue.fonts) || !contentValue.fonts.length) {
                return Promise.reject(new Error(nls.localize('error.missingProperties', "Invalid format for product icons theme file: Must contain iconDefinitions and fonts.")));
            }
            const iconThemeDocumentLocationDirname = resources.dirname(location);
            const sanitizedFonts = new Map();
            for (const font of contentValue.fonts) {
                if ((0, types_1.isString)(font.id) && font.id.match(productIconThemeSchema_1.fontIdRegex)) {
                    const fontId = font.id;
                    let fontWeight = undefined;
                    if ((0, types_1.isString)(font.weight) && font.weight.match(productIconThemeSchema_1.fontWeightRegex)) {
                        fontWeight = font.weight;
                    }
                    else {
                        warnings.push(nls.localize('error.fontWeight', 'Invalid font weight in font \'{0}\'. Ignoring setting.', font.id));
                    }
                    let fontStyle = undefined;
                    if ((0, types_1.isString)(font.style) && font.style.match(productIconThemeSchema_1.fontStyleRegex)) {
                        fontStyle = font.style;
                    }
                    else {
                        warnings.push(nls.localize('error.fontStyle', 'Invalid font style in font \'{0}\'. Ignoring setting.', font.id));
                    }
                    const sanitizedSrc = [];
                    if (Array.isArray(font.src)) {
                        for (const s of font.src) {
                            if ((0, types_1.isString)(s.path) && (0, types_1.isString)(s.format) && s.format.match(productIconThemeSchema_1.fontFormatRegex)) {
                                const iconFontLocation = resources.joinPath(iconThemeDocumentLocationDirname, s.path);
                                sanitizedSrc.push({ location: iconFontLocation, format: s.format });
                            }
                            else {
                                warnings.push(nls.localize('error.fontSrc', 'Invalid font source in font \'{0}\'. Ignoring source.', font.id));
                            }
                        }
                    }
                    if (sanitizedSrc.length) {
                        sanitizedFonts.set(fontId, { weight: fontWeight, style: fontStyle, src: sanitizedSrc });
                    }
                    else {
                        warnings.push(nls.localize('error.noFontSrc', 'No valid font source in font \'{0}\'. Ignoring font definition.', font.id));
                    }
                }
                else {
                    warnings.push(nls.localize('error.fontId', 'Missing or invalid font id \'{0}\'. Skipping font definition.', font.id));
                }
            }
            const iconDefinitions = new Map();
            const primaryFontId = contentValue.fonts[0].id;
            for (const iconId in contentValue.iconDefinitions) {
                const definition = contentValue.iconDefinitions[iconId];
                if ((0, types_1.isString)(definition.fontCharacter)) {
                    const fontId = definition.fontId ?? primaryFontId;
                    const fontDefinition = sanitizedFonts.get(fontId);
                    if (fontDefinition) {
                        const font = { id: `pi-${fontId}`, definition: fontDefinition };
                        iconDefinitions.set(iconId, { fontCharacter: definition.fontCharacter, font });
                    }
                    else {
                        warnings.push(nls.localize('error.icon.font', 'Skipping icon definition \'{0}\'. Unknown font.', iconId));
                    }
                }
                else {
                    warnings.push(nls.localize('error.icon.fontCharacter', 'Skipping icon definition \'{0}\'. Unknown fontCharacter.', iconId));
                }
            }
            return { iconDefinitions };
        });
    }
    const iconRegistry = (0, iconRegistry_1.getIconRegistry)();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZHVjdEljb25UaGVtZURhdGEuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdGhlbWVzL2Jyb3dzZXIvcHJvZHVjdEljb25UaGVtZURhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBaUJuRixRQUFBLDZCQUE2QixHQUFHLEVBQUUsQ0FBQyxDQUFDLE9BQU87SUFFeEQsTUFBYSxvQkFBb0I7aUJBRWhCLGdCQUFXLEdBQUcsc0JBQXNCLEFBQXpCLENBQTBCO1FBY3JELFlBQW9CLEVBQVUsRUFBRSxLQUFhLEVBQUUsVUFBa0I7WUFIakUsc0JBQWlCLEdBQTZCLEVBQUUsZUFBZSxFQUFFLElBQUksR0FBRyxFQUFFLEVBQUUsQ0FBQztZQUk1RSxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztZQUNiLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ25CLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1lBQzdCLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLENBQUM7UUFFTSxPQUFPLENBQUMsZ0JBQWtDO1lBQ2hELE9BQU8sc0JBQXNCLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDekUsQ0FBQztRQUVNLFlBQVksQ0FBQyxXQUE0QyxFQUFFLFVBQXVCO1lBQ3hGLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUN0RyxDQUFDO1FBRU0sTUFBTSxDQUFDLFdBQTRDLEVBQUUsVUFBdUI7WUFDbEYsT0FBTyxJQUFJLENBQUMsSUFB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