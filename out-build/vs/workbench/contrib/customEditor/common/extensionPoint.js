/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/customEditor/common/extensionPoint", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/workbench/services/language/common/languageService"], function (require, exports, nls, extensionsRegistry_1, languageService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$MTb = void 0;
    const Fields = Object.freeze({
        viewType: 'viewType',
        displayName: 'displayName',
        selector: 'selector',
        priority: 'priority',
    });
    const CustomEditorsContribution = {
        description: nls.localize(0, null),
        type: 'array',
        defaultSnippets: [{
                body: [{
                        [Fields.viewType]: '$1',
                        [Fields.displayName]: '$2',
                        [Fields.selector]: [{
                                filenamePattern: '$3'
                            }],
                    }]
            }],
        items: {
            type: 'object',
            required: [
                Fields.viewType,
                Fields.displayName,
                Fields.selector,
            ],
            properties: {
                [Fields.viewType]: {
                    type: 'string',
                    markdownDescription: nls.localize(1, null),
                },
                [Fields.displayName]: {
                    type: 'string',
                    description: nls.localize(2, null),
                },
                [Fields.selector]: {
                    type: 'array',
                    description: nls.localize(3, null),
                    items: {
                        type: 'object',
                        defaultSnippets: [{
                                body: {
                                    filenamePattern: '$1',
                                }
                            }],
                        properties: {
                            filenamePattern: {
                                type: 'string',
                                description: nls.localize(4, null),
                            },
                        }
                    }
                },
                [Fields.priority]: {
                    type: 'string',
                    markdownDeprecationMessage: nls.localize(5, null),
                    enum: [
                        "default" /* CustomEditorPriority.default */,
                        "option" /* CustomEditorPriority.option */,
                    ],
                    markdownEnumDescriptions: [
                        nls.localize(6, null),
                        nls.localize(7, null),
                    ],
                    default: 'default'
                }
            }
        }
    };
    exports.$MTb = extensionsRegistry_1.$2F.registerExtensionPoint({
        extensionPoint: 'customEditors',
        deps: [languageService_1.$kmb],
        jsonSchema: CustomEditorsContribution,
        activationEventsGenerator: (contribs, result) => {
            for (const contrib of contribs) {
                const viewType = contrib[Fields.viewType];
                if (viewType) {
                    result.push(`onCustomEditor:${viewType}`);
                }
            }
        },
    });
});
//# sourceMappingURL=extensionPoint.js.map