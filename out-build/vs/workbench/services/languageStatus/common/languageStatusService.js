/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/languageFeatureRegistry", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation"], function (require, exports, strings_1, languageFeatureRegistry_1, extensions_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$6I = void 0;
    exports.$6I = (0, instantiation_1.$Bh)('ILanguageStatusService');
    class LanguageStatusServiceImpl {
        constructor() {
            this.c = new languageFeatureRegistry_1.$dF();
            this.onDidChange = this.c.onDidChange;
        }
        addStatus(status) {
            return this.c.register(status.selector, status);
        }
        getLanguageStatus(model) {
            return this.c.ordered(model).sort((a, b) => {
                let res = b.severity - a.severity;
                if (res === 0) {
                    res = (0, strings_1.$Fe)(a.source, b.source);
                }
                if (res === 0) {
                    res = (0, strings_1.$Fe)(a.id, b.id);
                }
                return res;
            });
        }
    }
    (0, extensions_1.$mr)(exports.$6I, LanguageStatusServiceImpl, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=languageStatusService.js.map