"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLsConfiguration = void 0;
const defaultConfig = {
    markdownFileExtensions: ['md'],
    knownLinkedToFileExtensions: [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'webp',
        'bmp',
        'tiff',
    ],
    excludePaths: [
        '**/.*',
        '**/node_modules/**',
    ]
};
function getLsConfiguration(overrides) {
    return {
        ...defaultConfig,
        ...overrides,
    };
}
exports.getLsConfiguration = getLsConfiguration;
//# sourceMappingURL=config.js.map