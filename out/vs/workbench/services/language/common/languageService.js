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
define(["require", "exports", "vs/nls", "vs/editor/common/services/languagesAssociations", "vs/base/common/resources", "vs/editor/common/languages/language", "vs/editor/common/services/languageService", "vs/platform/configuration/common/configuration", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/instantiation/common/extensions", "vs/platform/log/common/log"], function (require, exports, nls_1, languagesAssociations_1, resources_1, language_1, languageService_1, configuration_1, environment_1, files_1, extensions_1, extensionsRegistry_1, extensions_2, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkbenchLanguageService = exports.languagesExtPoint = void 0;
    exports.languagesExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'languages',
        jsonSchema: {
            description: (0, nls_1.localize)('vscode.extension.contributes.languages', 'Contributes language declarations.'),
            type: 'array',
            items: {
                type: 'object',
                defaultSnippets: [{ body: { id: '${1:languageId}', aliases: ['${2:label}'], extensions: ['${3:extension}'], configuration: './language-configuration.json' } }],
                properties: {
                    id: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.languages.id', 'ID of the language.'),
                        type: 'string'
                    },
                    aliases: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.languages.aliases', 'Name aliases for the language.'),
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    },
                    extensions: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.languages.extensions', 'File extensions associated to the language.'),
                        default: ['.foo'],
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    },
                    filenames: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.languages.filenames', 'File names associated to the language.'),
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    },
                    filenamePatterns: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.languages.filenamePatterns', 'File name glob patterns associated to the language.'),
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    },
                    mimetypes: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.languages.mimetypes', 'Mime types associated to the language.'),
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    },
                    firstLine: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.languages.firstLine', 'A regular expression matching the first line of a file of the language.'),
                        type: 'string'
                    },
                    configuration: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.languages.configuration', 'A relative path to a file containing configuration options for the language.'),
                        type: 'string',
                        default: './language-configuration.json'
                    },
                    icon: {
                        type: 'object',
                        description: (0, nls_1.localize)('vscode.extension.contributes.languages.icon', 'A icon to use as file icon, if no icon theme provides one for the language.'),
                        properties: {
                            light: {
                                description: (0, nls_1.localize)('vscode.extension.contributes.languages.icon.light', 'Icon path when a light theme is used'),
                                type: 'string'
                            },
                            dark: {
                                description: (0, nls_1.localize)('vscode.extension.contributes.languages.icon.dark', 'Icon path when a dark theme is used'),
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
    let WorkbenchLanguageService = class WorkbenchLanguageService extends languageService_1.LanguageService {
        constructor(extensionService, configurationService, environmentService, logService) {
            super(environmentService.verbose || environmentService.isExtensionDevelopment || !environmentService.isBuilt);
            this.logService = logService;
            this._configurationService = configurationService;
            this._extensionService = extensionService;
            exports.languagesExtPoint.setHandler((extensions) => {
                const allValidLanguages = [];
                for (let i = 0, len = extensions.length; i < len; i++) {
                    const extension = extensions[i];
                    if (!Array.isArray(extension.value)) {
                        extension.collector.error((0, nls_1.localize)('invalid', "Invalid `contributes.{0}`. Expected an array.", exports.languagesExtPoint.name));
                        continue;
                    }
                    for (let j = 0, lenJ = extension.value.length; j < lenJ; j++) {
                        const ext = extension.value[j];
                        if (isValidLanguageExtensionPoint(ext, extension.description, extension.collector)) {
                            let configuration = undefined;
                            if (ext.configuration) {
                                configuration = (0, resources_1.joinPath)(extension.description.extensionLocation, ext.configuration);
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
                                    light: (0, resources_1.joinPath)(extension.description.extensionLocation, ext.icon.light),
                                    dark: (0, resources_1.joinPath)(extension.description.extensionLocation, ext.icon.dark)
                                }
                            });
                        }
                    }
                }
                this._registry.setDynamicLanguages(allValidLanguages);
            });
            this.updateMime();
            this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(files_1.FILES_ASSOCIATIONS_CONFIG)) {
                    this.updateMime();
                }
            });
            this._extensionService.whenInstalledExtensionsRegistered().then(() => {
                this.updateMime();
            });
            this._register(this.onDidRequestRichLanguageFeatures((languageId) => {
                // extension activation
                this._extensionService.activateByEvent(`onLanguage:${languageId}`);
                this._extensionService.activateByEvent(`onLanguage`);
            }));
        }
        updateMime() {
            const configuration = this._configurationService.getValue();
            // Clear user configured mime associations
            (0, languagesAssociations_1.clearConfiguredLanguageAssociations)();
            // Register based on settings
            if (configuration.files?.associations) {
                Object.keys(configuration.files.associations).forEach(pattern => {
                    const langId = configuration.files.associations[pattern];
                    if (typeof langId !== 'string') {
                        this.logService.warn(`Ignoring configured 'files.associations' for '${pattern}' because its type is not a string but '${typeof langId}'`);
                        return; // https://github.com/microsoft/vscode/issues/147284
                    }
                    const mimeType = this.getMimeType(langId) || `text/x-${langId}`;
                    (0, languagesAssociations_1.registerConfiguredLanguageAssociation)({ id: langId, mime: mimeType, filepattern: pattern });
                });
            }
            this._onDidChange.fire();
        }
    };
    exports.WorkbenchLanguageService = WorkbenchLanguageService;
    exports.WorkbenchLanguageService = WorkbenchLanguageService = __decorate([
        __param(0, extensions_1.IExtensionService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, environment_1.IEnvironmentService),
        __param(3, log_1.ILogService)
    ], WorkbenchLanguageService);
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
            collector.error((0, nls_1.localize)('invalid.empty', "Empty value for `contributes.{0}`", exports.languagesExtPoint.name));
            return false;
        }
        if (typeof value.id !== 'string') {
            collector.error((0, nls_1.localize)('require.id', "property `{0}` is mandatory and must be of type `string`", 'id'));
            return false;
        }
        if (!isUndefinedOrStringArray(value.extensions)) {
            collector.error((0, nls_1.localize)('opt.extensions', "property `{0}` can be omitted and must be of type `string[]`", 'extensions'));
            return false;
        }
        if (!isUndefinedOrStringArray(value.filenames)) {
            collector.error((0, nls_1.localize)('opt.filenames', "property `{0}` can be omitted and must be of type `string[]`", 'filenames'));
            return false;
        }
        if (typeof value.firstLine !== 'undefined' && typeof value.firstLine !== 'string') {
            collector.error((0, nls_1.localize)('opt.firstLine', "property `{0}` can be omitted and must be of type `string`", 'firstLine'));
            return false;
        }
        if (typeof value.configuration !== 'undefined' && typeof value.configuration !== 'string') {
            collector.error((0, nls_1.localize)('opt.configuration', "property `{0}` can be omitted and must be of type `string`", 'configuration'));
            return false;
        }
        if (!isUndefinedOrStringArray(value.aliases)) {
            collector.error((0, nls_1.localize)('opt.aliases', "property `{0}` can be omitted and must be of type `string[]`", 'aliases'));
            return false;
        }
        if (!isUndefinedOrStringArray(value.mimetypes)) {
            collector.error((0, nls_1.localize)('opt.mimetypes', "property `{0}` can be omitted and must be of type `string[]`", 'mimetypes'));
            return false;
        }
        if (typeof value.icon !== 'undefined') {
            if (typeof value.icon !== 'object' || typeof value.icon.light !== 'string' || typeof value.icon.dark !== 'string') {
                collector.error((0, nls_1.localize)('opt.icon', "property `{0}` can be omitted and must be of type `object` with properties `{1}` and `{2}` of type `string`", 'icon', 'light', 'dark'));
                return false;
            }
        }
        return true;
    }
    (0, extensions_2.registerSingleton)(language_1.ILanguageService, WorkbenchLanguageService, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2xhbmd1YWdlL2NvbW1vbi9sYW5ndWFnZVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBNkJuRixRQUFBLGlCQUFpQixHQUFrRCx1Q0FBa0IsQ0FBQyxzQkFBc0IsQ0FBK0I7UUFDdkosY0FBYyxFQUFFLFdBQVc7UUFDM0IsVUFBVSxFQUFFO1lBQ1gsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLHdDQUF3QyxFQUFFLG9DQUFvQyxDQUFDO1lBQ3JHLElBQUksRUFBRSxPQUFPO1lBQ2IsS0FBSyxFQUFFO2dCQUNOLElBQUksRUFBRSxRQUFRO2dCQUNkLGVBQWUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLGlCQUFpQixFQUFFLE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsYUFBYSxFQUFFLCtCQUErQixFQUFFLEVBQUUsQ0FBQztnQkFDL0osVUFBVSxFQUFFO29CQUNYLEVBQUUsRUFBRTt3QkFDSCxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsMkNBQTJDLEVBQUUscUJBQXFCLENBQUM7d0JBQ3pGLElBQUksRUFBRSxRQUFRO3FCQUNkO29CQUNELE9BQU8sRUFBRTt3QkFDUixXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsZ0RBQWdELEVBQUUsZ0NBQWdDLENBQUM7d0JBQ3pHLElBQUksRUFBRSxPQUFPO3dCQUNiLEtBQUssRUFBRTs0QkFDTixJQUFJLEVBQUUsUUFBUTt5QkFDZDtxQkFDRDtvQkFDRCxVQUFVLEVBQUU7d0JBQ1gsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLG1EQUFtRCxFQUFFLDZDQUE2QyxDQUFDO3dCQUN6SCxP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