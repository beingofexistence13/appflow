/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/nls!vs/platform/update/common/update.config.contribution", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform"], function (require, exports, platform_1, nls_1, configurationRegistry_1, platform_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const configurationRegistry = platform_2.$8m.as(configurationRegistry_1.$an.Configuration);
    configurationRegistry.registerConfiguration({
        id: 'update',
        order: 15,
        title: (0, nls_1.localize)(0, null),
        type: 'object',
        properties: {
            'update.mode': {
                type: 'string',
                enum: ['none', 'manual', 'start', 'default'],
                default: 'default',
                scope: 1 /* ConfigurationScope.APPLICATION */,
                description: (0, nls_1.localize)(1, null),
                tags: ['usesOnlineServices'],
                enumDescriptions: [
                    (0, nls_1.localize)(2, null),
                    (0, nls_1.localize)(3, null),
                    (0, nls_1.localize)(4, null),
                    (0, nls_1.localize)(5, null)
                ],
                policy: {
                    name: 'UpdateMode',
                    minimumVersion: '1.67',
                }
            },
            'update.channel': {
                type: 'string',
                default: 'default',
                scope: 1 /* ConfigurationScope.APPLICATION */,
                description: (0, nls_1.localize)(6, null),
                deprecationMessage: (0, nls_1.localize)(7, null, 'update.mode')
            },
            'update.enableWindowsBackgroundUpdates': {
                type: 'boolean',
                default: true,
                scope: 1 /* ConfigurationScope.APPLICATION */,
                title: (0, nls_1.localize)(8, null),
                description: (0, nls_1.localize)(9, null),
                included: platform_1.$i && !platform_1.$o
            },
            'update.showReleaseNotes': {
                type: 'boolean',
                default: true,
                scope: 1 /* ConfigurationScope.APPLICATION */,
                description: (0, nls_1.localize)(10, null),
                tags: ['usesOnlineServices']
            }
        }
    });
});
//# sourceMappingURL=update.config.contribution.js.map