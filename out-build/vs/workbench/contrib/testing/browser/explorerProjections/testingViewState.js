/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/testing/common/testId"], function (require, exports, testId_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$qKb = void 0;
    /**
     * Gets whether the given test ID is collapsed.
     */
    function $qKb(serialized, id) {
        if (!(id instanceof testId_1.$PI)) {
            id = testId_1.$PI.fromString(id);
        }
        let node = serialized;
        for (const part of id.path) {
            if (!node.children?.hasOwnProperty(part)) {
                return undefined;
            }
            node = node.children[part];
        }
        return node.collapsed;
    }
    exports.$qKb = $qKb;
});
//# sourceMappingURL=testingViewState.js.map