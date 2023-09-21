/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/editorTheme"], function (require, exports, editorTheme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$EW = void 0;
    class $EW {
        constructor(configuration, theme, model) {
            this.configuration = configuration;
            this.theme = new editorTheme_1.$PU(theme);
            this.viewModel = model;
            this.viewLayout = model.viewLayout;
        }
        addEventHandler(eventHandler) {
            this.viewModel.addViewEventHandler(eventHandler);
        }
        removeEventHandler(eventHandler) {
            this.viewModel.removeViewEventHandler(eventHandler);
        }
    }
    exports.$EW = $EW;
});
//# sourceMappingURL=viewContext.js.map