/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/services/themes/browser/fileIconThemeData", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/json", "vs/workbench/services/themes/common/workbenchThemeService", "vs/base/common/jsonErrorMessages", "vs/base/browser/dom"], function (require, exports, nls, paths, resources, Json, workbenchThemeService_1, jsonErrorMessages_1, dom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ozb = exports.$nzb = void 0;
    class $nzb {
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
            return !this.isLoaded ? this.a(themeLoader) : Promise.resolve(this.styleSheetContent);
        }
        reload(themeLoader) {
            return this.a(themeLoader);
        }
        a(themeLoader) {
            return themeLoader.load(this);
        }
        static fromExtensionTheme(iconTheme, iconThemeLocation, extensionData) {
            const id = extensionData.extensionId + '-' + iconTheme.id;
            const label = iconTheme.label || paths.$ae(iconTheme.path);
            const settingsId = iconTheme.id;
            const themeData = new $nzb(id, label, settingsId);
            themeData.description = iconTheme.description;
            themeData.location = iconThemeLocation;
            themeData.extensionData = extensionData;
            themeData.watch = iconTheme._watch;
            themeData.isLoaded = false;
            return themeData;
        }
        static { this.b = null; }
        static get noIconTheme() {
            let themeData = $nzb.b;
            if (!themeData) {
                themeData = $nzb.b = new $nzb('', '', null);
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
            const themeData = new $nzb(id, '', '__' + id);
            themeData.isLoaded = false;
            themeData.hasFileIcons = false;
            themeData.hasFolderIcons = false;
            themeData.hidesExplorerArrows = false;
            themeData.extensionData = undefined;
            themeData.watch = false;
            return themeData;
        }
        static fromStorageData(storageService) {
            const input = storageService.get($nzb.STORAGE_KEY, 0 /* StorageScope.PROFILE */);
            if (!input) {
                return undefined;
            }
            try {
                const data = JSON.parse(input);
                const theme = new $nzb('', '', null);
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
            storageService.store($nzb.STORAGE_KEY, data, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        }
    }
    exports.$nzb = $nzb;
    class $ozb {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        load(data) {
            if (!data.location) {
                return Promise.resolve(data.styleSheetContent);
            }
            return this.c(data.location).then(iconThemeDocument => {
                const result = this.d(data.id, data.location, iconThemeDocument);
                data.styleSheetContent = result.content;
                data.hasFileIcons = result.hasFileIcons;
                data.hasFolderIcons = result.hasFolderIcons;
                data.hidesExplorerArrows = result.hidesExplorerArrows;
                data.isLoaded = true;
                return data.styleSheetContent;
            });
        }
        c(location) {
            return this.a.readExtensionResource(location).then((content) => {
                const errors = [];
                const contentValue = Json.$Lm(content, errors);
                if (errors.length > 0) {
                    return Promise.reject(new Error(nls.localize(0, null, errors.map(e => (0, jsonErrorMessages_1.$mp)(e.error)).join(', '))));
                }
                else if (Json.$Um(contentValue) !== 'object') {
                    return Promise.reject(new Error(nls.localize(1, null)));
                }
                return Promise.resolve(contentValue);
            });
        }
        d(id, iconThemeDocumentLocation, iconThemeDocument) {
            const result = { content: '', hasFileIcons: false, hasFolderIcons: false, hidesExplorerArrows: !!iconThemeDocument.hidesExplorerArrows };
            let hasSpecificFileIcons = false;
            if (!iconThemeDocument.iconDefinitions) {
                return result;
            }
            const selectorByDefinitionId = {};
            const coveredLanguages = {};
            const iconThemeDocumentLocationDirname = resources.$hg(iconThemeDocumentLocation);
            function resolvePath(path) {
                return resources.$ig(iconThemeDocumentLocationDirname, path);
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
                    const src = font.src.map(l => `${(0, dom_1.$nP)(resolvePath(l.path))} format('${l.format}')`).join(', ');
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
                        cssRules.push(`${selectors.join(', ')} { content: ' '; background-image: ${(0, dom_1.$nP)(resolvePath(definition.iconPath))}; }`);
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
                for (const languageId of this.b.getRegisteredLanguageIds()) {
                    if (!coveredLanguages[languageId]) {
                        const icon = this.b.getIcon(languageId);
                        if (icon) {
                            const selector = `.show-file-icons .${escapeCSS(languageId)}-lang-file-icon.file-icon::before`;
                            cssRules.push(`${selector} { content: ' '; background-image: ${(0, dom_1.$nP)(icon.dark)}; }`);
                            cssRules.push(`.vs ${selector} { content: ' '; background-image: ${(0, dom_1.$nP)(icon.light)}; }`);
                        }
                    }
                }
            }
            result.content = cssRules.join('\n');
            return result;
        }
    }
    exports.$ozb = $ozb;
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
//# sourceMappingURL=fileIconThemeData.js.map