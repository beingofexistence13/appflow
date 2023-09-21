/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/common/resources", "vs/base/common/platform"], function (require, exports, assert, uri_1, resources_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHost API', function () {
        test('issue #51387: originalFSPath', function () {
            if (platform_1.$i) {
                assert.strictEqual((0, resources_1.$9f)(uri_1.URI.file('C:\\test')).charAt(0), 'C');
                assert.strictEqual((0, resources_1.$9f)(uri_1.URI.file('c:\\test')).charAt(0), 'c');
                assert.strictEqual((0, resources_1.$9f)(uri_1.URI.revive(JSON.parse(JSON.stringify(uri_1.URI.file('C:\\test'))))).charAt(0), 'C');
                assert.strictEqual((0, resources_1.$9f)(uri_1.URI.revive(JSON.parse(JSON.stringify(uri_1.URI.file('c:\\test'))))).charAt(0), 'c');
            }
        });
    });
});
//# sourceMappingURL=extHost.api.impl.test.js.map