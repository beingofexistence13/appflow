/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$G0 = exports.$F0 = void 0;
    exports.$F0 = 'editor.semanticHighlighting';
    function $G0(model, themeService, configurationService) {
        const setting = configurationService.getValue(exports.$F0, { overrideIdentifier: model.getLanguageId(), resource: model.uri })?.enabled;
        if (typeof setting === 'boolean') {
            return setting;
        }
        return themeService.getColorTheme().semanticHighlighting;
    }
    exports.$G0 = $G0;
});
//# sourceMappingURL=semanticTokensConfig.js.map