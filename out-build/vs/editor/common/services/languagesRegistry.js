/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/editor/common/services/languagesAssociations", "vs/editor/common/languages/modesRegistry", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform"], function (require, exports, event_1, lifecycle_1, strings_1, languagesAssociations_1, modesRegistry_1, configurationRegistry_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$imb = exports.$hmb = void 0;
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    const NULL_LANGUAGE_ID = 'vs.editor.nullLanguage';
    class $hmb {
        constructor() {
            this.e = [];
            this.f = new Map();
            this.g(NULL_LANGUAGE_ID, 0 /* LanguageId.Null */);
            this.g(modesRegistry_1.$Yt, 1 /* LanguageId.PlainText */);
            this.c = 2;
        }
        g(language, languageId) {
            this.e[languageId] = language;
            this.f.set(language, languageId);
        }
        register(language) {
            if (this.f.has(language)) {
                return;
            }
            const languageId = this.c++;
            this.g(language, languageId);
        }
        encodeLanguageId(languageId) {
            return this.f.get(languageId) || 0 /* LanguageId.Null */;
        }
        decodeLanguageId(languageId) {
            return this.e[languageId] || NULL_LANGUAGE_ID;
        }
    }
    exports.$hmb = $hmb;
    class $imb extends lifecycle_1.$kc {
        static { this.instanceCount = 0; }
        constructor(useModesRegistry = true, warnOnOverwrite = false) {
            super();
            this.c = this.B(new event_1.$fd());
            this.onDidChange = this.c.event;
            $imb.instanceCount++;
            this.f = warnOnOverwrite;
            this.languageIdCodec = new $hmb();
            this.g = [];
            this.h = {};
            this.j = {};
            this.n = {};
            this.r = {};
            if (useModesRegistry) {
                this.s();
                this.B(modesRegistry_1.$Xt.onDidChangeLanguages((m) => {
                    this.s();
                }));
            }
        }
        dispose() {
            $imb.instanceCount--;
            super.dispose();
        }
        setDynamicLanguages(def) {
            this.g = def;
            this.s();
        }
        s() {
            this.h = {};
            this.j = {};
            this.n = {};
            this.r = {};
            (0, languagesAssociations_1.$dmb)();
            const desc = [].concat(modesRegistry_1.$Xt.getLanguages()).concat(this.g);
            this._registerLanguages(desc);
        }
        registerLanguage(desc) {
            return modesRegistry_1.$Xt.registerLanguage(desc);
        }
        _registerLanguages(desc) {
            for (const d of desc) {
                this.t(d);
            }
            // Rebuild fast path maps
            this.j = {};
            this.n = {};
            this.r = {};
            Object.keys(this.h).forEach((langId) => {
                const language = this.h[langId];
                if (language.name) {
                    this.n[language.name] = language.identifier;
                }
                language.aliases.forEach((alias) => {
                    this.r[alias.toLowerCase()] = language.identifier;
                });
                language.mimetypes.forEach((mimetype) => {
                    this.j[mimetype] = language.identifier;
                });
            });
            platform_1.$8m.as(configurationRegistry_1.$an.Configuration).registerOverrideIdentifiers(this.getRegisteredLanguageIds());
            this.c.fire();
        }
        t(lang) {
            const langId = lang.id;
            let resolvedLanguage;
            if (hasOwnProperty.call(this.h, langId)) {
                resolvedLanguage = this.h[langId];
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
                this.h[langId] = resolvedLanguage;
            }
            this.u(resolvedLanguage, lang);
        }
        u(resolvedLanguage, lang) {
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
                    (0, languagesAssociations_1.$bmb)({ id: langId, mime: primaryMime, extension: extension }, this.f);
                }
            }
            if (Array.isArray(lang.filenames)) {
                for (const filename of lang.filenames) {
                    (0, languagesAssociations_1.$bmb)({ id: langId, mime: primaryMime, filename: filename }, this.f);
                    resolvedLanguage.filenames.push(filename);
                }
            }
            if (Array.isArray(lang.filenamePatterns)) {
                for (const filenamePattern of lang.filenamePatterns) {
                    (0, languagesAssociations_1.$bmb)({ id: langId, mime: primaryMime, filepattern: filenamePattern }, this.f);
                }
            }
            if (typeof lang.firstLine === 'string' && lang.firstLine.length > 0) {
                let firstLineRegexStr = lang.firstLine;
                if (firstLineRegexStr.charAt(0) !== '^') {
                    firstLineRegexStr = '^' + firstLineRegexStr;
                }
                try {
                    const firstLineRegex = new RegExp(firstLineRegexStr);
                    if (!(0, strings_1.$ze)(firstLineRegex)) {
                        (0, languagesAssociations_1.$bmb)({ id: langId, mime: primaryMime, firstline: firstLineRegex }, this.f);
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
            return hasOwnProperty.call(this.h, languageId);
        }
        getRegisteredLanguageIds() {
            return Object.keys(this.h);
        }
        getSortedRegisteredLanguageNames() {
            const result = [];
            for (const languageName in this.n) {
                if (hasOwnProperty.call(this.n, languageName)) {
                    result.push({
                        languageName: languageName,
                        languageId: this.n[languageName]
                    });
                }
            }
            result.sort((a, b) => (0, strings_1.$He)(a.languageName, b.languageName));
            return result;
        }
        getLanguageName(languageId) {
            if (!hasOwnProperty.call(this.h, languageId)) {
                return null;
            }
            return this.h[languageId].name;
        }
        getMimeType(languageId) {
            if (!hasOwnProperty.call(this.h, languageId)) {
                return null;
            }
            const language = this.h[languageId];
            return (language.mimetypes[0] || null);
        }
        getExtensions(languageId) {
            if (!hasOwnProperty.call(this.h, languageId)) {
                return [];
            }
            return this.h[languageId].extensions;
        }
        getFilenames(languageId) {
            if (!hasOwnProperty.call(this.h, languageId)) {
                return [];
            }
            return this.h[languageId].filenames;
        }
        getIcon(languageId) {
            if (!hasOwnProperty.call(this.h, languageId)) {
                return null;
            }
            const language = this.h[languageId];
            return (language.icons[0] || null);
        }
        getConfigurationFiles(languageId) {
            if (!hasOwnProperty.call(this.h, languageId)) {
                return [];
            }
            return this.h[languageId].configurationFiles || [];
        }
        getLanguageIdByLanguageName(languageName) {
            const languageNameLower = languageName.toLowerCase();
            if (!hasOwnProperty.call(this.r, languageNameLower)) {
                return null;
            }
            return this.r[languageNameLower];
        }
        getLanguageIdByMimeType(mimeType) {
            if (!mimeType) {
                return null;
            }
            if (hasOwnProperty.call(this.j, mimeType)) {
                return this.j[mimeType];
            }
            return null;
        }
        guessLanguageIdByFilepathOrFirstLine(resource, firstLine) {
            if (!resource && !firstLine) {
                return [];
            }
            return (0, languagesAssociations_1.$gmb)(resource, firstLine);
        }
    }
    exports.$imb = $imb;
});
//# sourceMappingURL=languagesRegistry.js.map