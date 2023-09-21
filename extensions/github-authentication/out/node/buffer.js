"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.base64Encode = void 0;
function base64Encode(text) {
    return Buffer.from(text, 'binary').toString('base64');
}
exports.base64Encode = base64Encode;
//# sourceMappingURL=buffer.js.map