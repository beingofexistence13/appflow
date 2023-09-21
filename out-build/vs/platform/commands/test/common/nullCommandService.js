/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle"], function (require, exports, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$f$b = void 0;
    exports.$f$b = {
        _serviceBrand: undefined,
        onWillExecuteCommand: () => lifecycle_1.$kc.None,
        onDidExecuteCommand: () => lifecycle_1.$kc.None,
        executeCommand() {
            return Promise.resolve(undefined);
        }
    };
});
//# sourceMappingURL=nullCommandService.js.map