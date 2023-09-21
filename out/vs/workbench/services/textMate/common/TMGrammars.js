/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/workbench/services/language/common/languageService"], function (require, exports, nls, extensionsRegistry_1, languageService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.grammarsExtPoint = void 0;
    exports.grammarsExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'grammars',
        deps: [languageService_1.languagesExtPoint],
        jsonSchema: {
            description: nls.localize('vscode.extension.contributes.grammars', 'Contributes textmate tokenizers.'),
            type: 'array',
            defaultSnippets: [{ body: [{ language: '${1:id}', scopeName: 'source.${2:id}', path: './syntaxes/${3:id}.tmLanguage.' }] }],
            items: {
                type: 'object',
                defaultSnippets: [{ body: { language: '${1:id}', scopeName: 'source.${2:id}', path: './syntaxes/${3:id}.tmLanguage.' } }],
                properties: {
                    language: {
                        description: nls.localize('vscode.extension.contributes.grammars.language', 'Language identifier for which this syntax is contributed to.'),
                        type: 'string'
                    },
                    scopeName: {
                        description: nls.localize('vscode.extension.contributes.grammars.scopeName', 'Textmate scope name used by the tmLanguage file.'),
                        type: 'string'
                    },
                    path: {
                        description: nls.localize('vscode.extension.contributes.grammars.path', 'Path of the tmLanguage file. The path is relative to the extension folder and typically starts with \'./syntaxes/\'.'),
                        type: 'string'
                    },
                    embeddedLanguages: {
                        description: nls.localize('vscode.extension.contributes.grammars.embeddedLanguages', 'A map of scope name to language id if this grammar contains embedded languages.'),
                        type: 'object'
                    },
                    tokenTypes: {
                        description: nls.localize('vscode.extension.contributes.grammars.tokenTypes', 'A map of scope name to token types.'),
                        type: 'object',
                        additionalProperties: {
                            enum: ['string', 'comment', 'other']
                        }
                    },
                    injectTo: {
                        description: nls.localize('vscode.extension.contributes.grammars.injectTo', 'List of language scope names to which this grammar is injected to.'),
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    },
                    balancedBracketScopes: {
                        description: nls.localize('vscode.extension.contributes.grammars.balancedBracketScopes', 'Defines which scope names contain balanced brackets.'),
                        type: 'array',
                        items: {
                            type: 'string'
                        },
                        default: ['*'],
                    },
                    unbalancedBracketScopes: {
                        description: nls.localize('vscode.extension.contributes.grammars.unbalancedBracketScopes', 'Defines which scope names do not contain balanced brackets.'),
                        type: 'array',
                        items: {
                            type: 'string'
                        },
                        default: [],
                    },
                },
                required: ['scopeName', 'path']
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVE1HcmFtbWFycy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy90ZXh0TWF0ZS9jb21tb24vVE1HcmFtbWFycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF5Qm5GLFFBQUEsZ0JBQWdCLEdBQStDLHVDQUFrQixDQUFDLHNCQUFzQixDQUE0QjtRQUNoSixjQUFjLEVBQUUsVUFBVTtRQUMxQixJQUFJLEVBQUUsQ0FBQyxtQ0FBaUIsQ0FBQztRQUN6QixVQUFVLEVBQUU7WUFDWCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx1Q0FBdUMsRUFBRSxrQ0FBa0MsQ0FBQztZQUN0RyxJQUFJLEVBQUUsT0FBTztZQUNiLGVBQWUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsZ0NBQWdDLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDM0gsS0FBSyxFQUFFO2dCQUNOLElBQUksRUFBRSxRQUFRO2dCQUNkLGVBQWUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLGdDQUFnQyxFQUFFLEVBQUUsQ0FBQztnQkFDekgsVUFBVSxFQUFFO29CQUNYLFFBQVEsRUFBRTt3QkFDVCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxnREFBZ0QsRUFBRSw4REFBOEQsQ0FBQzt3QkFDM0ksSUFBSSxFQUFFLFFBQVE7cUJBQ2Q7b0JBQ0QsU0FBUyxFQUFFO3dCQUNWLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGlEQUFpRCxFQUFFLGtEQUFrRCxDQUFDO3dCQUNoSSxJQUFJLEVBQUUsUUFBUTtxQkFDZDtvQkFDRCxJQUFJLEVBQUU7d0JBQ0wsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsNENBQTRDLEVBQUUsc0hBQXNILENBQUM7d0JBQy9MLElBQUksRUFBRSxRQUFRO3FCQUNkO29CQUNELGlCQUFpQixFQUFFO3dCQUNsQixXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx5REFBeUQsRUFBRSxpRkFBaUYsQ0FBQzt3QkFDdkssSUFBSSxFQUFFLFFBQVE7cUJBQ2Q7b0JBQ0QsVUFBVSxFQUFFO3dCQUNYLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGtEQUFrRCxFQUFFLHFDQUFxQyxDQUFDO3dCQUNwSCxJQUFJLEVBQUUsUUFBUTt3QkFDZCxvQkFBb0IsRUFBRTs0QkFDckIsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUM7eUJBQ3BDO3FCQUNEO29CQUNELFFBQVEsRUFBRTt3QkFDVCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxnREFBZ0QsRUFBRSxvRUFBb0UsQ0FBQzt3QkFDakosSUFBSSxFQUFFLE9BQU87d0JBQ2IsS0FBSyxFQUFFOzRCQUNOLElBQUksRUFBRSxRQUFRO3lCQUNkO3FCQUNEO29CQUNELHFCQUFxQixFQUFFO3dCQUN0QixXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyw2REFBNkQsRUFBRSxzREFBc0QsQ0FBQzt3QkFDaEosSUFBSSxFQUFFLE9BQU87d0JBQ2IsS0FBSyxFQUFFOzRCQUNOLElBQUksRUFBRSxRQUFRO3lCQUNkO3dCQUNELE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQztxQkFDZDtvQkFDRCx1QkFBdUIsRUFBRTt3QkFDeEIsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsK0RBQStELEVBQUUsNkRBQTZELENBQUM7d0JBQ3pKLElBQUksRUFBRSxPQUFPO3dCQUNiLEtBQUssRUFBRTs0QkFDTixJQUFJLEVBQUUsUUFBUTt5QkFDZDt3QkFDRCxPQUFPLEVBQUUsRUFBRTtxQkFDWDtpQkFDRDtnQkFDRCxRQUFRLEVBQUUsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDO2FBQy9CO1NBQ0Q7S0FDRCxDQUFDLENBQUMifQ==