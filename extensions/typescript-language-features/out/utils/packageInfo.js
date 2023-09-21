"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPackageInfo = void 0;
function getPackageInfo(context) {
    const packageJSON = context.extension.packageJSON;
    if (packageJSON && typeof packageJSON === 'object') {
        return {
            name: packageJSON.name ?? '',
            version: packageJSON.version ?? '',
            aiKey: packageJSON.aiKey ?? '',
        };
    }
    return null;
}
exports.getPackageInfo = getPackageInfo;
//# sourceMappingURL=packageInfo.js.map