/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/parts/sandbox/electron-sandbox/globals"], function (require, exports, assert, globals_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Sandbox', () => {
        test('globals', async () => {
            assert.ok(typeof globals_1.$M.send === 'function');
            assert.ok(typeof globals_1.$O.setZoomLevel === 'function');
            assert.ok(typeof globals_1.$P.platform === 'string');
            const config = await globals_1.$Q.resolveConfiguration();
            assert.ok(config);
            assert.ok(globals_1.$Q.configuration());
        });
    });
});
//# sourceMappingURL=globals.test.js.map