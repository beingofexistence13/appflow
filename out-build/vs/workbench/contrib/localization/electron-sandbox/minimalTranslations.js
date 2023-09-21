/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/localization/electron-sandbox/minimalTranslations"], function (require, exports, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$fac = void 0;
    // The strings localized in this file will get pulled into the manifest of the language packs.
    // So that they are available for VS Code to use without downloading the entire language pack.
    exports.$fac = {
        showLanguagePackExtensions: (0, nls_1.localize)(0, null),
        searchMarketplace: (0, nls_1.localize)(1, null),
        installAndRestartMessage: (0, nls_1.localize)(2, null),
        installAndRestart: (0, nls_1.localize)(3, null)
    };
});
//# sourceMappingURL=minimalTranslations.js.map