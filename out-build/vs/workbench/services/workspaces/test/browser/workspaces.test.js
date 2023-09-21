/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/services/workspaces/browser/workspaces"], function (require, exports, assert, uri_1, workspaces_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workspaces', () => {
        test('workspace identifiers are stable', function () {
            // workspace identifier
            assert.strictEqual((0, workspaces_1.$sU)(uri_1.URI.parse('vscode-remote:/hello/test')).id, '474434e4');
            // single folder identifier
            assert.strictEqual((0, workspaces_1.$tU)(uri_1.URI.parse('vscode-remote:/hello/test'))?.id, '474434e4');
        });
    });
});
//# sourceMappingURL=workspaces.test.js.map