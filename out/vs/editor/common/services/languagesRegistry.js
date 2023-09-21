/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/editor/common/services/languagesAssociations", "vs/editor/common/languages/modesRegistry", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform"], function (require, exports, event_1, lifecycle_1, strings_1, languagesAssociations_1, modesRegistry_1, configurationRegistry_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LanguagesRegistry = exports.LanguageIdCodec = void 0;
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    const NULL_LANGUAGE_ID = 'vs.editor.nullLanguage';
    class LanguageIdCodec {
        constructor() {
            this._languageIdToLanguage = [];
            this._languageToLanguageId = new Map();
            this._register(NULL_LANGUAGE_ID, 0 /* LanguageId.Null */);
            this._register(modesRegistry_1.PLAINTEXT_LANGUAGE_ID, 1 /* LanguageId.PlainText */);
            this._nextLanguageId = 2;
        }
        _register(language, languageId) {
            this._languageIdToLanguage[languageId] = language;
            this._languageToLanguageId.set(language, languageId);
        }
        register(language) {
            if (this._languageToLanguageId.has(language)) {
                return;
            }
            const languageId = this._nextLanguageId++;
            this._register(language, languageId);
        }
        encodeLanguageId(languageId) {
            return this._languageToLanguageId.get(languageId) || 0 /* LanguageId.Null */;
        }
        decodeLanguageId(languageId) {
            return this._languageIdToLanguage[languageId] || NULL_LANGUAGE_ID;
        }
    }
    exports.LanguageIdCodec = LanguageIdCodec;
    class LanguagesRegistry extends lifecycle_1.Disposable {
        static { this.instanceCount = 0; }
        constructor(useModesRegistry = true, warnOnOverwrite = false) {
            super();
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            LanguagesRegistry.instanceCount++;
            this._warnOnOverwrite = warnOnOverwrite;
            this.languageIdCodec = new LanguageIdCodec();
            this._dynamicLanguages = [];
            this._languages = {};
            this._mimeTypesMap = {};
            this._nameMap = {};
            this._lowercaseNameMap = {};
            if (useModesRegistry) {
                this._initializeFromRegistry();
                this._register(modesRegistry_1.ModesRegistry.onDidChangeLanguages((m) => {
                    this._initializeFromRegistry();
                }));
            }
        }
        dispose() {
            LanguagesRegistry.instanceCount--;
            super.dispose();
        }
        setDynamicLanguages(def) {
            this._dynamicLanguages = def;
            this._initializeFromRegistry();
        }
        _initializeFromRegistry() {
            this._languages = {};
            this._mimeTypesMap = {};
            this._nameMap = {};
            this._lowercaseNameMap = {};
            (0, languagesAssociations_1.clearPlatformLanguageAssociations)();
            const desc = [].concat(modesRegistry_1.ModesRegistry.getLanguages()).concat(this._dynamicLanguages);
            this._registerLanguages(desc);
        }
        registerLanguage(desc) {
            return modesRegistry_1.ModesRegistry.registerLanguage(desc);
        }
        _registerLanguages(desc) {
            for (const d of desc) {
                this._registerLanguage(d);
            }
            // Rebuild fast path maps
            this._mimeTypesMap = {};
            this._nameMap = {};
            this._lowercaseNameMap = {};
            Object.keys(this._languages).forEach((langId) => {
                const language = this._languages[langId];
                if (language.name) {
                    this._nameMap[language.name] = language.identifier;
                }
                language.aliases.forEach((alias) => {
                    this._lowercaseNameMap[alias.toLowerCase()] = language.identifier;
                });
                language.mimetypes.forEach((mimetype) => {
                    this._mimeTypesMap[mimetype] = language.identifier;
                });
            });
            platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerOverrideIdentifiers(this.getRegisteredLanguageIds());
            this._onDidChange.fire();
        }
        _registerLanguage(lang) {
            const langId = lang.id;
            let resolvedLanguage;
            if (hasOwnProperty.call(this._languages, langId)) {
                resolvedLanguage = this._languages[langId];
            }
            else {
                this.languageIdCodec.register(langId);
                resolvedLanguage = {
                    identifier: langId,
                    name: null,
                    mimetypes: [],
                    aliases: [],
                    extensions: [],
                    filenames: [],
                    configurationFiles: [],
                    icons: []
                };
                this._languages[langId] = resolvedLanguage;
            }
            this._mergeLanguage(resolvedLanguage, lang);
        }
        _mergeLanguage(resolvedLanguage, lang) {
            const langId = lang.id;
            let primaryMime = null;
            if (Array.isArray(lang.mimetypes) && lang.mimetypes.length > 0) {
                resolvedLanguage.mimetypes.push(...lang.mimetypes);
                primaryMime = lang.mimetypes[0];
            }
            if (!primaryMime) {
                primaryMime = `text/x-${langId}`;
                resolvedLanguage.mimetypes.push(primaryMime);
            }
            if (Array.isArray(lang.extensions)) {
                if (lang.configuration) {
                    // insert first as this appears to be the 'primary' language definition
                    resolvedLanguage.extensions = lang.extensions.concat(resolvedLanguage.extensions);
                }
                else {
                    resolvedLanguage.extensions = resolvedLanguage.extensions.concat(lang.extensions);
                }
                for (const extension of lang.extensions) {
                    (0, languagesAssociations_1.registerPlatformLanguageAssociation)({ id: langId, mime: primaryMime, extension: extension }, this._warnOnOverwrite);
                }
            }
            if (Array.isArray(lang.filenames)) {
                for (const filename of lang.filenames) {
                    (0, languagesAssociations_1.registerPlatformLanguageAssociation)({ id: langId, mime: primaryMime, filename: filename }, this._warnOnOverwrite);
                    resolvedLanguage.filenames.push(filename);
                }
            }
            if (Array.isArray(lang.filenamePatterns)) {
                for (const filenamePattern of lang.filenamePatterns) {
                    (0, languagesAssociations_1.registerPlatformLanguageAssociation)({ id: langId, mime: primaryMime, filepattern: filenamePattern }, this._warnOnOverwrite);
                }
            }
            if (typeof lang.firstLine === 'string' && lang.firstLine.length > 0) {
                let firstLineRegexStr = lang.firstLine;
                if (firstLineRegexStr.charAt(0) !== '^') {
                    firstLineRegexStr = '^' + firstLineRegexStr;
                }
                try {
                    const firstLineRegex = new RegExp(firstLineRegexStr);
                    if (!(0, strings_1.regExpLeadsToEndlessLoop)(firstLineRegex)) {
                        (0, languagesAssociations_1.registerPlatformLanguageAssociation)({ id: langId, mime: primaryMime, firstline: firstLineRegex }, this._warnOnOverwrite);
                    }
                }
                catch (err) {
                    // Most likely, the regex was bad
                    console.warn(`[${lang.id}]: Invalid regular expression \`${firstLineRegexStr}\`: `, err);
                }
            }
            resolvedLanguage.aliases.push(langId);
            let langAliases = null;
            if (typeof lang.aliases !== 'undefined' && Array.isArray(lang.aliases)) {
                if (lang.aliases.length === 0) {
                    // signal that this language should not get a name
                    langAliases = [null];
                }
                else {
                    langAliases = lang.aliases;
                }
            }
            if (langAliases !== null) {
                for (const langAlias of langAliases) {
                    if (!langAlias || langAlias.length === 0) {
                        continue;
                    }
                    resolvedLanguage.aliases.push(langAlias);
                }
            }
            const containsAliases = (langAliases !== null && langAliases.length > 0);
            if (containsAliases && langAliases[0] === null) {
                // signal that this language should not get a name
            }
            else {
                const bestName = (containsAliases ? langAliases[0] : null) || langId;
                if (containsAliases || !resolvedLanguage.name) {
                    resolvedLanguage.name = bestName;
                }
            }
            if (lang.configuration) {
                resolvedLanguage.configurationFiles.push(lang.configuration);
            }
            if (lang.icon) {
                resolvedLanguage.icons.push(lang.icon);
            }
        }
        isRegisteredLanguageId(languageId) {
            if (!languageId) {
                return false;
            }
            return hasOwnProperty.call(this._languages, languageId);
        }
        getRegisteredLanguageIds() {
            return Object.keys(this._languages);
        }
        getSortedRegisteredLanguageNames() {
            const result = [];
            for (const languageName in this._nameMap) {
                if (hasOwnProperty.call(this._nameMap, languageName)) {
                    result.push({
                        languageName: languageName,
                        languageId: this._nameMap[languageName]
                    });
                }
            }
            result.sort((a, b) => (0, strings_1.compareIgnoreCase)(a.languageName, b.languageName));
            return result;
        }
        getLanguageName(languageId) {
            if (!hasOwnProperty.call(this._languages, languageId)) {
                return null;
            }
            return this._languages[languageId].name;
        }
        getMimeType(languageId) {
            if (!hasOwnProperty.call(this._languages, languageId)) {
                return null;
            }
            const language = this._languages[languageId];
            return (language.mimetypes[0] || null);
        }
        getExtensions(languageId) {
            if (!hasOwnProperty.call(this._languages, languageId)) {
                return [];
            }
            return this._languages[languageId].extensions;
        }
        getFilenames(languageId) {
            if (!hasOwnProperty.call(this._languages, languageId)) {
                return [];
            }
            return this._languages[languageId].filenames;
        }
        getIcon(languageId) {
            if (!hasOwnProperty.call(this._languages, languageId)) {
                return null;
            }
            const language = this._languages[languageId];
            return (language.icons[0] || null);
        }
        getConfigurationFiles(languageId) {
            if (!hasOwnProperty.call(this._languages, languageId)) {
                return [];
            }
            return this._languages[languageId].configurationFiles || [];
        }
        getLanguageIdByLanguageName(languageName) {
            const languageNameLower = languageName.toLowerCase();
            if (!hasOwnProperty.call(this._lowercaseNameMap, languageNameLower)) {
                return null;
            }
            return this._lowercaseNameMap[languageNameLower];
        }
        getLanguageIdByMimeType(mimeType) {
            if (!mimeType) {
                return null;
            }
            if (hasOwnProperty.call(this._mimeTypesMap, mimeType)) {
                return this._mimeTypesMap[mimeType];
            }
            return null;
        }
        guessLanguageIdByFilepathOrFirstLine(resource, firstLine) {
            if (!resource && !firstLine) {
                return [];
            }
            return (0, languagesAssociations_1.getLanguageIds)(resource, firstLine);
        }
    }
    exports.LanguagesRegistry = LanguagesRegistry;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VzUmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL3NlcnZpY2VzL2xhbmd1YWdlc1JlZ2lzdHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWNoRyxNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQztJQUN2RCxNQUFNLGdCQUFnQixHQUFHLHdCQUF3QixDQUFDO0lBYWxELE1BQWEsZUFBZTtRQU0zQjtZQUhpQiwwQkFBcUIsR0FBYSxFQUFFLENBQUM7WUFDckMsMEJBQXFCLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUM7WUFHbEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsMEJBQWtCLENBQUM7WUFDbEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQ0FBcUIsK0JBQXVCLENBQUM7WUFDNUQsSUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUM7UUFDMUIsQ0FBQztRQUVPLFNBQVMsQ0FBQyxRQUFnQixFQUFFLFVBQXNCO1lBQ3pELElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLENBQUMsR0FBRyxRQUFRLENBQUM7WUFDbEQsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDdEQsQ0FBQztRQUVNLFFBQVEsQ0FBQyxRQUFnQjtZQUMvQixJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQzdDLE9BQU87YUFDUDtZQUNELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUMxQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBRU0sZ0JBQWdCLENBQUMsVUFBa0I7WUFDekMsT0FBTyxJ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