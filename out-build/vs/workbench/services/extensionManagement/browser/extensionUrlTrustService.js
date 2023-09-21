/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/extensionManagement/common/extensionUrlTrust", "vs/platform/instantiation/common/extensions"], function (require, exports, extensionUrlTrust_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ExtensionUrlTrustService {
        async isExtensionUrlTrusted() {
            return false;
        }
    }
    (0, extensions_1.$mr)(extensionUrlTrust_1.$9kb, ExtensionUrlTrustService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=extensionUrlTrustService.js.map