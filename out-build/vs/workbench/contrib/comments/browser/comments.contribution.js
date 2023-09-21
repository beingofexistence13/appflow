/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/comments/browser/comments.contribution", "vs/platform/instantiation/common/extensions", "vs/platform/registry/common/platform", "vs/workbench/contrib/comments/browser/commentService", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/contrib/comments/browser/commentsEditorContribution"], function (require, exports, nls, extensions_1, platform_1, commentService_1, configurationRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration({
        id: 'comments',
        order: 20,
        title: nls.localize(0, null),
        type: 'object',
        properties: {
            'comments.openPanel': {
                enum: ['neverOpen', 'openOnSessionStart', 'openOnSessionStartWithComments'],
                default: 'openOnSessionStartWithComments',
                description: nls.localize(1, null),
                restricted: false,
                markdownDeprecationMessage: nls.localize(2, null)
            },
            'comments.openView': {
                enum: ['never', 'file', 'firstFile', 'firstFileUnresolved'],
                enumDescriptions: [nls.localize(3, null), nls.localize(4, null), nls.localize(5, null), nls.localize(6, null)],
                default: 'firstFile',
                description: nls.localize(7, null),
                restricted: false
            },
            'comments.useRelativeTime': {
                type: 'boolean',
                default: true,
                description: nls.localize(8, null)
            },
            'comments.visible': {
                type: 'boolean',
                default: true,
                description: nls.localize(9, null)
            },
            'comments.maxHeight': {
                type: 'boolean',
                default: true,
                description: nls.localize(10, null)
            },
            'comments.collapseOnResolve': {
                type: 'boolean',
                default: true,
                description: nls.localize(11, null)
            }
        }
    });
    (0, extensions_1.$mr)(commentService_1.$Ilb, commentService_1.$Jlb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=comments.contribution.js.map