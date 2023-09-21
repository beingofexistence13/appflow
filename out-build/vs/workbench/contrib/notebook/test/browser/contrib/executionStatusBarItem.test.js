/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/executionStatusBarItemController"], function (require, exports, assert, executionStatusBarItemController_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('notebookBrowser', () => {
        test('formatCellDuration', function () {
            assert.strictEqual((0, executionStatusBarItemController_1.$yFb)(0, false), '0.0s');
            assert.strictEqual((0, executionStatusBarItemController_1.$yFb)(0), '0ms');
            assert.strictEqual((0, executionStatusBarItemController_1.$yFb)(10, false), '0.0s');
            assert.strictEqual((0, executionStatusBarItemController_1.$yFb)(10), '10ms');
            assert.strictEqual((0, executionStatusBarItemController_1.$yFb)(100, false), '0.1s');
            assert.strictEqual((0, executionStatusBarItemController_1.$yFb)(100), '100ms');
            assert.strictEqual((0, executionStatusBarItemController_1.$yFb)(200, false), '0.2s');
            assert.strictEqual((0, executionStatusBarItemController_1.$yFb)(200), '200ms');
            assert.strictEqual((0, executionStatusBarItemController_1.$yFb)(3300), '3.3s');
            assert.strictEqual((0, executionStatusBarItemController_1.$yFb)(180000), '3m 0.0s');
            assert.strictEqual((0, executionStatusBarItemController_1.$yFb)(189412), '3m 9.4s');
        });
    });
});
//# sourceMappingURL=executionStatusBarItem.test.js.map