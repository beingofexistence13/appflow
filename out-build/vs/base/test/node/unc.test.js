/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/node/unc"], function (require, exports, assert_1, unc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('UNC', () => {
        test('getUNCHost', () => {
            (0, assert_1.strictEqual)((0, unc_1.getUNCHost)(undefined), undefined);
            (0, assert_1.strictEqual)((0, unc_1.getUNCHost)(null), undefined);
            (0, assert_1.strictEqual)((0, unc_1.getUNCHost)('/'), undefined);
            (0, assert_1.strictEqual)((0, unc_1.getUNCHost)('/foo'), undefined);
            (0, assert_1.strictEqual)((0, unc_1.getUNCHost)('c:'), undefined);
            (0, assert_1.strictEqual)((0, unc_1.getUNCHost)('c:\\'), undefined);
            (0, assert_1.strictEqual)((0, unc_1.getUNCHost)('c:\\foo'), undefined);
            (0, assert_1.strictEqual)((0, unc_1.getUNCHost)('c:\\foo\\\\server\\path'), undefined);
            (0, assert_1.strictEqual)((0, unc_1.getUNCHost)('\\'), undefined);
            (0, assert_1.strictEqual)((0, unc_1.getUNCHost)('\\\\'), undefined);
            (0, assert_1.strictEqual)((0, unc_1.getUNCHost)('\\\\localhost'), undefined);
            (0, assert_1.strictEqual)((0, unc_1.getUNCHost)('\\\\localhost\\'), 'localhost');
            (0, assert_1.strictEqual)((0, unc_1.getUNCHost)('\\\\localhost\\a'), 'localhost');
            (0, assert_1.strictEqual)((0, unc_1.getUNCHost)('\\\\.'), undefined);
            (0, assert_1.strictEqual)((0, unc_1.getUNCHost)('\\\\?'), undefined);
            (0, assert_1.strictEqual)((0, unc_1.getUNCHost)('\\\\.\\localhost'), '.');
            (0, assert_1.strictEqual)((0, unc_1.getUNCHost)('\\\\?\\localhost'), '?');
            (0, assert_1.strictEqual)((0, unc_1.getUNCHost)('\\\\.\\UNC\\localhost'), '.');
            (0, assert_1.strictEqual)((0, unc_1.getUNCHost)('\\\\?\\UNC\\localhost'), '?');
            (0, assert_1.strictEqual)((0, unc_1.getUNCHost)('\\\\.\\UNC\\localhost\\'), 'localhost');
            (0, assert_1.strictEqual)((0, unc_1.getUNCHost)('\\\\?\\UNC\\localhost\\'), 'localhost');
            (0, assert_1.strictEqual)((0, unc_1.getUNCHost)('\\\\.\\UNC\\localhost\\a'), 'localhost');
            (0, assert_1.strictEqual)((0, unc_1.getUNCHost)('\\\\?\\UNC\\localhost\\a'), 'localhost');
        });
    });
});
//# sourceMappingURL=unc.test.js.map