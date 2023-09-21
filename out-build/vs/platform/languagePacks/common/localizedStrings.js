/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/platform/languagePacks/common/localizedStrings"], function (require, exports, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * These are some predefined strings that we test during smoke testing that they are localized
     * correctly. Don't change these strings!!
     */
    const open = nls.localize(0, null);
    const close = nls.localize(1, null);
    const find = nls.localize(2, null);
    exports.default = {
        open: open,
        close: close,
        find: find
    };
});
//# sourceMappingURL=localizedStrings.js.map