/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/json", "vs/workbench/services/themes/common/workbenchThemeService", "vs/base/common/jsonErrorMessages", "vs/base/browser/dom"], function (require, exports, nls, paths, resources, Json, workbenchThemeService_1, jsonErrorMessages_1, dom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FileIconThemeLoader = exports.FileIconThemeData = void 0;
    class FileIconThemeData {
        static { this.STORAGE_KEY = 'iconThemeData'; }
        constructor(id, label, settingsId) {
            this.id = id;
            this.label = label;
            this.settingsId = settingsId;
            this.isLoaded = false;
            this.hasFileIcons = false;
            this.hasFolderIcons = false;
            this.hidesExplorerArrows = false;
        }
        ensureLoaded(themeLoader) {
            return !this.isLoaded ? this.load(themeLoader) : Promise.resolve(this.styleSheetContent);
        }
        reload(themeLoader) {
            return this.load(themeLoader);
        }
        load(themeLoader) {
            return themeLoader.load(this);
        }
        static fromExtensionTheme(iconTheme, iconThemeLocation, extensionData) {
            const id = extensionData.extensionId + '-' + iconTheme.id;
            const label = iconTheme.label || paths.basename(iconTheme.path);
            const settingsId = iconTheme.id;
            const themeData = new FileIconThemeData(id, label, settingsId);
            themeData.description = iconTheme.description;
            themeData.location = iconThemeLocation;
            themeData.extensionData = extensionData;
            themeData.watch = iconTheme._watch;
            themeData.isLoaded = false;
            return themeData;
        }
        static { this._noIconTheme = null; }
        static get noIconTheme() {
            let themeData = FileIconThemeData._noIconTheme;
            if (!themeData) {
                themeData = FileIconThemeData._noIconTheme = new FileIconThemeData('', '', null);
                themeData.hasFileIcons = false;
                themeData.hasFolderIcons = false;
                themeData.hidesExplorerArrows = false;
                themeData.isLoaded = true;
                themeData.extensionData = undefined;
                themeData.watch = false;
            }
            return themeData;
        }
        static createUnloadedTheme(id) {
            const themeData = new FileIconThemeData(id, '', '__' + id);
            themeData.isLoaded = false;
            themeData.hasFileIcons = false;
            themeData.hasFolderIcons = false;
            themeData.hidesExplorerArrows = false;
            themeData.extensionData = undefined;
            themeData.watch = false;
            return themeData;
        }
        static fromStorageData(storageService) {
            const input = storageService.get(FileIconThemeData.STORAGE_KEY, 0 /* StorageScope.PROFILE */);
            if (!input) {
                return undefined;
            }
            try {
                const data = JSON.parse(input);
                const theme = new FileIconThemeData('', '', null);
                for (const key in data) {
                    switch (key) {
                        case 'id':
                        case 'label':
                        case 'description':
                        case 'settingsId':
                        case 'styleSheetContent':
                        case 'hasFileIcons':
                        case 'hidesExplorerArrows':
                        case 'hasFolderIcons':
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
                return theme;
            }
            catch (e) {
                return undefined;
            }
        }
        toStorage(storageService) {
            const data = JSON.stringify({
                id: this.id,
                label: this.label,
                description: this.description,
                settingsId: this.settingsId,
                styleSheetContent: this.styleSheetContent,
                hasFileIcons: this.hasFileIcons,
                hasFolderIcons: this.hasFolderIcons,
                hidesExplorerArrows: this.hidesExplorerArrows,
                extensionData: workbenchThemeService_1.ExtensionData.toJSONObject(this.extensionData),
                watch: this.watch
            });
            storageService.store(FileIconThemeData.STORAGE_KEY, data, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        }
    }
    exports.FileIconThemeData = FileIconThemeData;
    class FileIconThemeLoader {
        constructor(fileService, languageService) {
            this.fileService = fileService;
            this.languageService = languageService;
        }
        load(data) {
            if (!data.location) {
                return Promise.resolve(data.styleSheetContent);
            }
            return this.loadIconThemeDocument(data.location).then(iconThemeDocument => {
                const result = this.processIconThemeDocument(data.id, data.location, iconThemeDocument);
                data.styleSheetContent = result.content;
                data.hasFileIcons = result.hasFileIcons;
                data.hasFolderIcons = result.hasFolderIcons;
                data.hidesExplorerArrows = result.hidesExplorerArrows;
                data.isLoaded = true;
                return data.styleSheetContent;
            });
        }
        loadIconThemeDocument(location) {
            return this.fileService.readExtensionResource(location).then((content) => {
                const errors = [];
                const contentValue = Json.parse(content, errors);
                if (errors.length > 0) {
                    return Promise.reject(new Error(nls.localize('error.cannotparseicontheme', "Problems parsing file icons file: {0}", errors.map(e => (0, jsonErrorMessages_1.getParseErrorMessage)(e.error)).join(', '))));
                }
                else if (Json.getNodeType(contentValue) !== 'object') {
                    return Promise.reject(new Error(nls.localize('error.invalidformat', "Invalid format for file icons theme file: Object expected.")));
                }
                return Promise.resolve(contentValue);
            });
        }
        processIconThemeDocument(id, iconThemeDocumentLocation, iconThemeDocument) {
            const result = { content: '', hasFileIcons: false, hasFolderIcons: false, hidesExplorerArrows: !!iconThemeDocument.hidesExplorerArrows };
            let hasSpecificFileIcons = false;
            if (!iconThemeDocument.iconDefinitions) {
                return result;
            }
            const selectorByDefinitionId = {};
            const coveredLanguages = {};
            const iconThemeDocumentLocationDirname = resources.dirname(iconThemeDocumentLocation);
            function resolvePath(path) {
                return resources.joinPath(iconThemeDocumentLocationDirname, path);
            }
            function collectSelectors(associations, baseThemeClassName) {
                function addSelector(selector, defId) {
                    if (defId) {
                        let list = selectorByDefinitionId[defId];
                        if (!list) {
                            list = selectorByDefinitionId[defId] = [];
                        }
                        list.push(selector);
                    }
                }
                if (associations) {
                    let qualifier = '.show-file-icons';
                    if (baseThemeClassName) {
                        qualifier = baseThemeClassName + ' ' + qualifier;
                    }
                    const expanded = '.monaco-tl-twistie.collapsible:not(.collapsed) + .monaco-tl-contents';
                    if (associations.folder) {
                        addSelector(`${qualifier} .folder-icon::before`, associations.folder);
                        result.hasFolderIcons = true;
                    }
                    if (associations.folderExpanded) {
                        addSelector(`${qualifier} ${expanded} .folder-icon::before`, associations.folderExpanded);
                        result.hasFolderIcons = true;
                    }
                    const rootFolder = associations.rootFolder || associations.folder;
                    const rootFolderExpanded = associations.rootFolderExpanded || associations.folderExpanded;
                    if (rootFolder) {
                        addSelector(`${qualifier} .rootfolder-icon::before`, rootFolder);
                        result.hasFolderIcons = true;
                    }
                    if (rootFolderExpanded) {
                        addSelector(`${qualifier} ${expanded} .rootfolder-icon::before`, rootFolderExpanded);
                        result.hasFolderIcons = true;
                    }
                    if (associations.file) {
                        addSelector(`${qualifier} .file-icon::before`, associations.file);
                        result.hasFileIcons = true;
                    }
                    const folderNames = associations.folderNames;
                    if (folderNames) {
                        for (const key in folderNames) {
                            const selectors = [];
                            const name = handleParentFolder(key.toLowerCase(), selectors);
                            selectors.push(`.${escapeCSS(name)}-name-folder-icon`);
                            addSelector(`${qualifier} ${selectors.join('')}.folder-icon::before`, folderNames[key]);
                            result.hasFolderIcons = true;
                        }
                    }
                    const folderNamesExpanded = associations.folderNamesExpanded;
                    if (folderNamesExpanded) {
                        for (const key in folderNamesExpanded) {
                            const selectors = [];
                            const name = handleParentFolder(key.toLowerCase(), selectors);
                            selectors.push(`.${escapeCSS(name)}-name-folder-icon`);
                            addSelector(`${qualifier} ${expanded} ${selectors.join('')}.folder-icon::before`, folderNamesExpanded[key]);
                            result.hasFolderIcons = true;
                        }
                    }
                    const languageIds = associations.languageIds;
                    if (languageIds) {
                        if (!languageIds.jsonc && languageIds.json) {
                            languageIds.jsonc = languageIds.json;
                        }
                        for (const languageId in languageIds) {
                            addSelector(`${qualifier} .${escapeCSS(languageId)}-lang-file-icon.file-icon::before`, languageIds[languageId]);
                            result.hasFileIcons = true;
                            hasSpecificFileIcons = true;
                            coveredLanguages[languageId] = true;
                        }
                    }
                    const fileExtensions = associations.fileExtensions;
                    if (fileExtensions) {
                        for (const key in fileExtensions) {
                            const selectors = [];
                            const name = handleParentFolder(key.toLowerCase(), selectors);
                            const segments = name.split('.');
                            if (segments.length) {
                                for (let i = 0; i < segments.length; i++) {
                                    selectors.push(`.${escapeCSS(segments.slice(i).join('.'))}-ext-file-icon`);
                                }
                                selectors.push('.ext-file-icon'); // extra segment to increase file-ext score
                            }
                            addSelector(`${qualifier} ${selectors.join('')}.file-icon::before`, fileExtensions[key]);
                            result.hasFileIcons = true;
                            hasSpecificFileIcons = true;
                        }
                    }
                    const fileNames = associations.fileNames;
                    if (fileNames) {
                        for (const key in fileNames) {
                            const selectors = [];
                            const fileName = handleParentFolder(key.toLowerCase(), selectors);
                            selectors.push(`.${escapeCSS(fileName)}-name-file-icon`);
                            selectors.push('.name-file-icon'); // extra segment to increase file-name score
                            const segments = fileName.split('.');
                            if (segments.length) {
                                for (let i = 1; i < segments.length; i++) {
                                    selectors.push(`.${escapeCSS(segments.slice(i).join('.'))}-ext-file-icon`);
                                }
                                selectors.push('.ext-file-icon'); // extra segment to increase file-ext score
                            }
                            addSelector(`${qualifier} ${selectors.join('')}.file-icon::before`, fileNames[key]);
                            result.hasFileIcons = true;
                            hasSpecificFileIcons = true;
                        }
                    }
                }
            }
            collectSelectors(iconThemeDocument);
            collectSelectors(iconThemeDocument.light, '.vs');
            collectSelectors(iconThemeDocument.highContrast, '.hc-black');
            collectSelectors(iconThemeDocument.highContrast, '.hc-light');
            if (!result.hasFileIcons && !result.hasFolderIcons) {
                return result;
            }
            const showLanguageModeIcons = iconThemeDocument.showLanguageModeIcons === true || (hasSpecificFileIcons && iconThemeDocument.showLanguageModeIcons !== false);
            const cssRules = [];
            const fonts = iconThemeDocument.fonts;
            const fontSizes = new Map();
            if (Array.isArray(fonts)) {
                const defaultFontSize = fonts[0].size || '150%';
                fonts.forEach(font => {
                    const src = font.src.map(l => `${(0, dom_1.asCSSUrl)(resolvePath(l.path))} format('${l.format}')`).join(', ');
                    cssRules.push(`@font-face { src: ${src}; font-family: '${font.id}'; font-weight: ${font.weight}; font-style: ${font.style}; font-display: block; }`);
                    if (font.size !== undefined && font.size !== defaultFontSize) {
                        fontSizes.set(font.id, font.size);
                    }
                });
                cssRules.push(`.show-file-icons .file-icon::before, .show-file-icons .folder-icon::before, .show-file-icons .rootfolder-icon::before { font-family: '${fonts[0].id}'; font-size: ${defaultFontSize}; }`);
            }
            for (const defId in selectorByDefinitionId) {
                const selectors = selectorByDefinitionId[defId];
                const definition = iconThemeDocument.iconDefinitions[defId];
                if (definition) {
                    if (definition.iconPath) {
                        cssRules.push(`${selectors.join(', ')} { content: ' '; background-image: ${(0, dom_1.asCSSUrl)(resolvePath(definition.iconPath))}; }`);
                    }
                    else if (definition.fontCharacter || definition.fontColor) {
                        const body = [];
                        if (definition.fontColor) {
                            body.push(`color: ${definition.fontColor};`);
                        }
                        if (definition.fontCharacter) {
                            body.push(`content: '${definition.fontCharacter}';`);
                        }
                        const fontSize = definition.fontSize ?? (definition.fontId ? fontSizes.get(definition.fontId) : undefined);
                        if (fontSize) {
                            body.push(`font-size: ${fontSize};`);
                        }
                        if (definition.fontId) {
                            body.push(`font-family: ${definition.fontId};`);
                        }
                        if (showLanguageModeIcons) {
                            body.push(`background-image: unset;`); // potentially set by the language default
                        }
                        cssRules.push(`${selectors.join(', ')} { ${body.join(' ')} }`);
                    }
                }
            }
            if (showLanguageModeIcons) {
                for (const languageId of this.languageService.getRegisteredLanguageIds()) {
                    if (!coveredLanguages[languageId]) {
                        const icon = this.languageService.getIcon(languageId);
                        if (icon) {
                            const selector = `.show-file-icons .${escapeCSS(languageId)}-lang-file-icon.file-icon::before`;
                            cssRules.push(`${selector} { content: ' '; background-image: ${(0, dom_1.asCSSUrl)(icon.dark)}; }`);
                            cssRules.push(`.vs ${selector} { content: ' '; background-image: ${(0, dom_1.asCSSUrl)(icon.light)}; }`);
                        }
                    }
                }
            }
            result.content = cssRules.join('\n');
            return result;
        }
    }
    exports.FileIconThemeLoader = FileIconThemeLoader;
    function handleParentFolder(key, selectors) {
        const lastIndexOfSlash = key.lastIndexOf('/');
        if (lastIndexOfSlash >= 0) {
            const parentFolder = key.substring(0, lastIndexOfSlash);
            selectors.push(`.${escapeCSS(parentFolder)}-name-dir-icon`);
            return key.substring(lastIndexOfSlash + 1);
        }
        return key;
    }
    function escapeCSS(str) {
        str = str.replace(/[\11\12\14\15\40]/g, '/'); // HTML class names can not contain certain whitespace characters, use / instead, which doesn't exist in file names.
        return window.CSS.escape(str);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZUljb25UaGVtZURhdGEuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdGhlbWVzL2Jyb3dzZXIvZmlsZUljb25UaGVtZURhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBY2hHLE1BQWEsaUJBQWlCO2lCQUViLGdCQUFXLEdBQUcsZUFBZSxDQUFDO1FBZ0I5QyxZQUFvQixFQUFVLEVBQUUsS0FBYSxFQUFFLFVBQXlCO1lBQ3ZFLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1lBQ2IsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDbkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7WUFDN0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7WUFDdEIsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7WUFDMUIsSUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7WUFDNUIsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQztRQUNsQyxDQUFDO1FBRU0sWUFBWSxDQUFDLFdBQWdDO1lBQ25ELE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQzFGLENBQUM7UUFFTSxNQUFNLENBQUMsV0FBZ0M7WUFDN0MsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFTyxJQUFJLENBQUMsV0FBZ0M7WUFDNUMsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFRCxNQUFNLENBQUMsa0JBQWtCLENB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