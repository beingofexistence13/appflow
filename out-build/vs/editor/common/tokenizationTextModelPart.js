/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BackgroundTokenizationState = void 0;
    var BackgroundTokenizationState;
    (function (BackgroundTokenizationState) {
        BackgroundTokenizationState[BackgroundTokenizationState["InProgress"] = 1] = "InProgress";
        BackgroundTokenizationState[BackgroundTokenizationState["Completed"] = 2] = "Completed";
    })(BackgroundTokenizationState || (exports.BackgroundTokenizationState = BackgroundTokenizationState = {}));
});
//# sourceMappingURL=tokenizationTextModelPart.js.map