/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/localization/common/localization.contribution", "vs/platform/actions/common/actions", "vs/workbench/contrib/localization/common/localizationsActions", "vs/workbench/services/extensions/common/extensionsRegistry"], function (require, exports, lifecycle_1, nls_1, actions_1, localizationsActions_1, extensionsRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$U4b = void 0;
    class $U4b extends lifecycle_1.$kc {
        constructor() {
            super();
            // Register action to configure locale and related settings
            (0, actions_1.$Xu)(localizationsActions_1.$S4b);
            (0, actions_1.$Xu)(localizationsActions_1.$T4b);
            extensionsRegistry_1.$2F.registerExtensionPoint({
                extensionPoint: 'localizations',
                defaultExtensionKind: ['ui', 'workspace'],
                jsonSchema: {
                    description: (0, nls_1.localize)(0, null),
                    type: 'array',
                    default: [],
                    items: {
                        type: 'object',
                        required: ['languageId', 'translations'],
                        defaultSnippets: [{ body: { languageId: '', languageName: '', localizedLanguageName: '', translations: [{ id: 'vscode', path: '' }] } }],
                        properties: {
                            languageId: {
                                description: (0, nls_1.localize)(1, null),
                                type: 'string'
                            },
                            languageName: {
                                description: (0, nls_1.localize)(2, null),
                                type: 'string'
                            },
                            localizedLanguageName: {
                                description: (0, nls_1.localize)(3, null),
                                type: 'string'
                            },
                            translations: {
                                description: (0, nls_1.localize)(4, null),
                                type: 'array',
                                default: [{ id: 'vscode', path: '' }],
                                items: {
                                    type: 'object',
                                    required: ['id', 'path'],
                                    properties: {
                                        id: {
                                            type: 'string',
                                            description: (0, nls_1.localize)(5, null),
                                            pattern: '^((vscode)|([a-z0-9A-Z][a-z0-9A-Z-]*)\\.([a-z0-9A-Z][a-z0-9A-Z-]*))$',
                                            patternErrorMessage: (0, nls_1.localize)(6, null)
                                        },
                                        path: {
                                            type: 'string',
                                            description: (0, nls_1.localize)(7, null)
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
    exports.$U4b = $U4b;
});
//# sourceMappingURL=localization.contribution.js.map