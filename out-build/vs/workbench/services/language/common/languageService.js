/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls!vs/workbench/services/language/common/languageService", "vs/editor/common/services/languagesAssociations", "vs/base/common/resources", "vs/editor/common/languages/language", "vs/editor/common/services/languageService", "vs/platform/configuration/common/configuration", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/instantiation/common/extensions", "vs/platform/log/common/log"], function (require, exports, nls_1, languagesAssociations_1, resources_1, language_1, languageService_1, configuration_1, environment_1, files_1, extensions_1, extensionsRegistry_1, extensions_2, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$lmb = exports.$kmb = void 0;
    exports.$kmb = extensionsRegistry_1.$2F.registerExtensionPoint({
        extensionPoint: 'languages',
        jsonSchema: {
            description: (0, nls_1.localize)(0, null),
            type: 'array',
            items: {
                type: 'object',
                defaultSnippets: [{ body: { id: '${1:languageId}', aliases: ['${2:label}'], extensions: ['${3:extension}'], configuration: './language-configuration.json' } }],
                properties: {
                    id: {
                        description: (0, nls_1.localize)(1, null),
                        type: 'string'
                    },
                    aliases: {
                        description: (0, nls_1.localize)(2, null),
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    },
                    extensions: {
                        description: (0, nls_1.localize)(3, null),
                        default: ['.foo'],
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    },
                    filenames: {
                        description: (0, nls_1.localize)(4, null),
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    },
                    filenamePatterns: {
                        description: (0, nls_1.localize)(5, null),
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    },
                    mimetypes: {
                        description: (0, nls_1.localize)(6, null),
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    },
                    firstLine: {
                        description: (0, nls_1.localize)(7, null),
                        type: 'string'
                    },
                    configuration: {
                        description: (0, nls_1.localize)(8, null),
                        type: 'string',
                        default: './language-configuration.json'
                    },
                    icon: {
                        type: 'object',
                        description: (0, nls_1.localize)(9, null),
                        properties: {
                            light: {
                                description: (0, nls_1.localize)(10, null),
                                type: 'string'
                            },
                            dark: {
                                description: (0, nls_1.localize)(11, null),
                                type: 'string'
                            }
                        }
                    }
                }
            }
        },
        activationEventsGenerator: (languageContributions, result) => {
            for (const languageContribution of languageContributions) {
                if (languageContribution.id && languageContribution.configuration) {
                    result.push(`onLanguage:${languageContribution.id}`);
                }
            }
        }
    });
    let $lmb = class $lmb extends languageService_1.$jmb {
        constructor(extensionService, configurationService, environmentService, s) {
            super(environmentService.verbose || environmentService.isExtensionDevelopment || !environmentService.isBuilt);
            this.s = s;
            this.n = configurationService;
            this.r = extensionService;
            exports.$kmb.setHandler((extensions) => {
                const allValidLanguages = [];
                for (let i = 0, len = extensions.length; i < len; i++) {
                    const extension = extensions[i];
                    if (!Array.isArray(extension.value)) {
                        extension.collector.error((0, nls_1.localize)(12, null, exports.$kmb.name));
                        continue;
                    }
                    for (let j = 0, lenJ = extension.value.length; j < lenJ; j++) {
                        const ext = extension.value[j];
                        if (isValidLanguageExtensionPoint(ext, extension.description, extension.collector)) {
                            let configuration = undefined;
                            if (ext.configuration) {
                                configuration = (0, resources_1.$ig)(extension.description.extensionLocation, ext.configuration);
                            }
                            allValidLanguages.push({
                                id: ext.id,
                                extensions: ext.extensions,
                                filenames: ext.filenames,
                                filenamePatterns: ext.filenamePatterns,
                                firstLine: ext.firstLine,
                                aliases: ext.aliases,
                                mimetypes: ext.mimetypes,
                                configuration: configuration,
                                icon: ext.icon && {
                                    light: (0, resources_1.$ig)(extension.description.extensionLocation, ext.icon.light),
                                    dark: (0, resources_1.$ig)(extension.description.extensionLocation, ext.icon.dark)
                                }
                            });
                        }
                    }
                }
                this.h.setDynamicLanguages(allValidLanguages);
            });
            this.t();
            this.n.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(files_1.$sk)) {
                    this.t();
                }
            });
            this.r.whenInstalledExtensionsRegistered().then(() => {
                this.t();
            });
            this.B(this.onDidRequestRichLanguageFeatures((languageId) => {
                // extension activation
                this.r.activateByEvent(`onLanguage:${languageId}`);
                this.r.activateByEvent(`onLanguage`);
            }));
        }
        t() {
            const configuration = this.n.getValue();
            // Clear user configured mime associations
            (0, languagesAssociations_1.$emb)();
            // Register based on settings
            if (configuration.files?.associations) {
                Object.keys(configuration.files.associations).forEach(pattern => {
                    const langId = configuration.files.associations[pattern];
                    if (typeof langId !== 'string') {
                        this.s.warn(`Ignoring configured 'files.associations' for '${pattern}' because its type is not a string but '${typeof langId}'`);
                        return; // https://github.com/microsoft/vscode/issues/147284
                    }
                    const mimeType = this.getMimeType(langId) || `text/x-${langId}`;
                    (0, languagesAssociations_1.$cmb)({ id: langId, mime: mimeType, filepattern: pattern });
                });
            }
            this.c.fire();
        }
    };
    exports.$lmb = $lmb;
    exports.$lmb = $lmb = __decorate([
        __param(0, extensions_1.$MF),
        __param(1, configuration_1.$8h),
        __param(2, environment_1.$Ih),
        __param(3, log_1.$5i)
    ], $lmb);
    function isUndefinedOrStringArray(value) {
        if (typeof value === 'undefined') {
            return true;
        }
        if (!Array.isArray(value)) {
            return false;
        }
        return value.every(item => typeof item === 'string');
    }
    function isValidLanguageExtensionPoint(value, extension, collector) {
        if (!value) {
            collector.error((0, nls_1.localize)(13, null, exports.$kmb.name));
            return false;
        }
        if (typeof value.id !== 'string') {
            collector.error((0, nls_1.localize)(14, null, 'id'));
            return false;
        }
        if (!isUndefinedOrStringArray(value.extensions)) {
            collector.error((0, nls_1.localize)(15, null, 'extensions'));
            return false;
        }
        if (!isUndefinedOrStringArray(value.filenames)) {
            collector.error((0, nls_1.localize)(16, null, 'filenames'));
            return false;
        }
        if (typeof value.firstLine !== 'undefined' && typeof value.firstLine !== 'string') {
            collector.error((0, nls_1.localize)(17, null, 'firstLine'));
            return false;
        }
        if (typeof value.configuration !== 'undefined' && typeof value.configuration !== 'string') {
            collector.error((0, nls_1.localize)(18, null, 'configuration'));
            return false;
        }
        if (!isUndefinedOrStringArray(value.aliases)) {
            collector.error((0, nls_1.localize)(19, null, 'aliases'));
            return false;
        }
        if (!isUndefinedOrStringArray(value.mimetypes)) {
            collector.error((0, nls_1.localize)(20, null, 'mimetypes'));
            return false;
        }
        if (typeof value.icon !== 'undefined') {
            if (typeof value.icon !== 'object' || typeof value.icon.light !== 'string' || typeof value.icon.dark !== 'string') {
                collector.error((0, nls_1.localize)(21, null, 'icon', 'light', 'dark'));
                return false;
            }
        }
        return true;
    }
    (0, extensions_2.$mr)(language_1.$ct, $lmb, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=languageService.js.map