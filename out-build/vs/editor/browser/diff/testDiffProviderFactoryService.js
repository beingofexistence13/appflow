/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/diff/linesDiffComputers"], function (require, exports, lifecycle_1, linesDiffComputers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$x0b = exports.$w0b = void 0;
    class $w0b {
        createDiffProvider() {
            return new $x0b();
        }
    }
    exports.$w0b = $w0b;
    class $x0b {
        constructor() {
            this.onDidChange = () => (0, lifecycle_1.$ic)(() => { });
        }
        computeDiff(original, modified, options, cancellationToken) {
            const result = linesDiffComputers_1.$ZY.getDefault().computeDiff(original.getLinesContent(), modified.getLinesContent(), options);
            return Promise.resolve({
                changes: result.changes,
                quitEarly: result.hitTimeout,
                identical: original.getValue() === modified.getValue(),
                moves: result.moves,
            });
        }
    }
    exports.$x0b = $x0b;
});
//# sourceMappingURL=testDiffProviderFactoryService.js.map