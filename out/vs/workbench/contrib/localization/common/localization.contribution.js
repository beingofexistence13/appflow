/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls", "vs/platform/actions/common/actions", "vs/workbench/contrib/localization/common/localizationsActions", "vs/workbench/services/extensions/common/extensionsRegistry"], function (require, exports, lifecycle_1, nls_1, actions_1, localizationsActions_1, extensionsRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BaseLocalizationWorkbenchContribution = void 0;
    class BaseLocalizationWorkbenchContribution extends lifecycle_1.Disposable {
        constructor() {
            super();
            // Register action to configure locale and related settings
            (0, actions_1.registerAction2)(localizationsActions_1.ConfigureDisplayLanguageAction);
            (0, actions_1.registerAction2)(localizationsActions_1.ClearDisplayLanguageAction);
            extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
                extensionPoint: 'localizations',
                defaultExtensionKind: ['ui', 'workspace'],
                jsonSchema: {
                    description: (0, nls_1.localize)('vscode.extension.contributes.localizations', "Contributes localizations to the editor"),
                    type: 'array',
                    default: [],
                    items: {
                        type: 'object',
                        required: ['languageId', 'translations'],
                        defaultSnippets: [{ body: { languageId: '', languageName: '', localizedLanguageName: '', translations: [{ id: 'vscode', path: '' }] } }],
                        properties: {
                            languageId: {
                                description: (0, nls_1.localize)('vscode.extension.contributes.localizations.languageId', 'Id of the language into which the display strings are translated.'),
                                type: 'string'
                            },
                            languageName: {
                                description: (0, nls_1.localize)('vscode.extension.contributes.localizations.languageName', 'Name of the language in English.'),
                                type: 'string'
                            },
                            localizedLanguageName: {
                                description: (0, nls_1.localize)('vscode.extension.contributes.localizations.languageNameLocalized', 'Name of the language in contributed language.'),
                                type: 'string'
                            },
                            translations: {
                                description: (0, nls_1.localize)('vscode.extension.contributes.localizations.translations', 'List of translations associated to the language.'),
                                type: 'array',
                                default: [{ id: 'vscode', path: '' }],
                                items: {
                                    type: 'object',
                                    required: ['id', 'path'],
                                    properties: {
                                        id: {
                                            type: 'string',
                                            description: (0, nls_1.localize)('vscode.extension.contributes.localizations.translations.id', "Id of VS Code or Extension for which this translation is contributed to. Id of VS Code is always `vscode` and of extension should be in format `publisherId.extensionName`."),
                                            pattern: '^((vscode)|([a-z0-9A-Z][a-z0-9A-Z-]*)\\.([a-z0-9A-Z][a-z0-9A-Z-]*))$',
                                            patternErrorMessage: (0, nls_1.localize)('vscode.extension.contributes.localizations.translations.id.pattern', "Id should be `vscode` or in format `publisherId.extensionName` for translating VS code or an extension respectively.")
                                        },
                                        path: {
                                            type: 'string',
                                            description: (0, nls_1.localize)('vscode.extension.contributes.localizations.translations.path', "A relative path to a file containing translations for the language.")
                                        }
                                    },
                                    defaultSnippets: [{ body: { id: '', path: '' } }],
                                },
                            }
                        }
                    }
                }
            });
        }
    }
    exports.BaseLocalizationWorkbenchContribution = BaseLocalizationWorkbenchContribution;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxpemF0aW9uLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2xvY2FsaXphdGlvbi9jb21tb24vbG9jYWxpemF0aW9uLmNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFTaEcsTUFBYSxxQ0FBc0MsU0FBUSxzQkFBVTtRQUNwRTtZQUNDLEtBQUssRUFBRSxDQUFDO1lBRVIsMkRBQTJEO1lBQzNELElBQUEseUJBQWUsRUFBQyxxREFBOEIsQ0FBQyxDQUFDO1lBQ2hELElBQUEseUJBQWUsRUFBQyxpREFBMEIsQ0FBQyxDQUFDO1lBRTVDLHVDQUFrQixDQUFDLHNCQUFzQixDQUFDO2dCQUN6QyxjQUFjLEVBQUUsZUFBZTtnQkFDL0Isb0JBQW9CLEVBQUUsQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDO2dCQUN6QyxVQUFVLEVBQUU7b0JBQ1gsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLDRDQUE0QyxFQUFFLHlDQUF5QyxDQUFDO29CQUM5RyxJQUFJLEVBQUUsT0FBTztvQkFDYixPQUFPLEVBQUUsRUFBRTtvQkFDWCxLQUFLLEVBQUU7d0JBQ04sSUFBSSxFQUFFLFFBQVE7d0JBQ2QsUUFBUSxFQUFFLENBQUMsWUFBWSxFQUFFLGNBQWMsQ0FBQzt3QkFDeEMsZUFBZSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUUscUJBQXFCLEVBQUUsRUFBRSxFQUFFLFlBQVksRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7d0JBQ3hJLFVBQVUsRUFBRTs0QkFDWCxVQUFVLEVBQUU7Z0NBQ1gsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLHVEQUF1RCxFQUFFLG1FQUFtRSxDQUFDO2dDQUNuSixJQUFJLEVBQUUsUUFBUTs2QkFDZDs0QkFDRCxZQUFZLEVBQUU7Z0NBQ2IsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLHlEQUF5RCxFQUFFLGtDQUFrQyxDQUFDO2dDQUNwSCxJQUFJLEVBQUUsUUFBUTs2QkFDZDs0QkFDRCxxQkFBcUIsRUFBRTtnQ0FDdEIsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLGtFQUFrRSxFQUFFLCtDQUErQyxDQUFDO2dDQUMxSSxJQUFJLEVBQUUsUUFBUTs2QkFDZDs0QkFDRCxZQUFZLEVBQUU7Z0NBQ2IsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLHlEQUF5RCxFQUFFLGtEQUFrRCxDQUFDO2dDQUNwSSxJQUFJLEVBQUUsT0FBTztnQ0FDYixPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDO2dDQUNyQyxLQUFLLEVBQUU7b0NBQ04sSUFBSSxFQUFFLFFBQVE7b0NBQ2QsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQztvQ0FDeEIsVUFBVSxFQUFFO3dDQUNYLEVBQUUsRUFBRTs0Q0FDSCxJQUFJLEVBQUUsUUFBUTs0Q0FDZCxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsNERBQTRELEVBQUUsNktBQTZLLENBQUM7NENBQ2xRLE9BQU8sRUFBRSxzRUFBc0U7NENBQy9FLG1CQUFtQixFQUFFLElBQUEsY0FBUSxFQUFDLG9FQUFvRSxFQUFFLHNIQUFzSCxDQUFDO3lDQUMzTjt3Q0FDRCxJQUFJLEVBQUU7NENBQ0wsSUFBSSxFQUFFLFFBQVE7NENBQ2QsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLDhEQUE4RCxFQUFFLHFFQUFxRSxDQUFDO3lDQUM1SjtxQ0FDRDtvQ0FDRCxlQUFlLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7aUNBQ2pEOzZCQUNEO3lCQUNEO3FCQUNEO2lCQUNEO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztLQUNEO0lBM0RELHNGQTJEQyJ9