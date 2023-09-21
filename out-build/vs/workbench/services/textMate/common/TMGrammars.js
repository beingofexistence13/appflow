/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/services/textMate/common/TMGrammars", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/workbench/services/language/common/languageService"], function (require, exports, nls, extensionsRegistry_1, languageService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$GBb = void 0;
    exports.$GBb = extensionsRegistry_1.$2F.registerExtensionPoint({
        extensionPoint: 'grammars',
        deps: [languageService_1.$kmb],
        jsonSchema: {
            description: nls.localize(0, null),
            type: 'array',
            defaultSnippets: [{ body: [{ language: '${1:id}', scopeName: 'source.${2:id}', path: './syntaxes/${3:id}.tmLanguage.' }] }],
            items: {
                type: 'object',
                defaultSnippets: [{ body: { language: '${1:id}', scopeName: 'source.${2:id}', path: './syntaxes/${3:id}.tmLanguage.' } }],
                properties: {
                    language: {
                        description: nls.localize(1, null),
                        type: 'string'
                    },
                    scopeName: {
                        description: nls.localize(2, null),
                        type: 'string'
                    },
                    path: {
                        description: nls.localize(3, null),
                        type: 'string'
                    },
                    embeddedLanguages: {
                        description: nls.localize(4, null),
                        type: 'object'
                    },
                    tokenTypes: {
                        description: nls.localize(5, null),
                        type: 'object',
                        additionalProperties: {
                            enum: ['string', 'comment', 'other']
                        }
                    },
                    injectTo: {
                        description: nls.localize(6, null),
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    },
                    balancedBracketScopes: {
                        description: nls.localize(7, null),
                        type: 'array',
                        items: {
                            type: 'string'
                        },
                        default: ['*'],
                    },
                    unbalancedBracketScopes: {
                        description: nls.localize(8, null),
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
//# sourceMappingURL=TMGrammars.js.map