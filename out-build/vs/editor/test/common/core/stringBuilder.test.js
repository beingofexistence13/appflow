/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/buffer", "vs/base/test/common/utils", "vs/editor/common/core/stringBuilder"], function (require, exports, assert, buffer_1, utils_1, stringBuilder_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('decodeUTF16LE', () => {
        (0, utils_1.$bT)();
        test('issue #118041: unicode character undo bug 1', () => {
            const buff = new Uint8Array(2);
            (0, buffer_1.$Id)(buff, '﻿'.charCodeAt(0), 0);
            const actual = (0, stringBuilder_1.$Ds)(buff, 0, 1);
            assert.deepStrictEqual(actual, '﻿');
        });
        test('issue #118041: unicode character undo bug 2', () => {
            const buff = new Uint8Array(4);
            (0, buffer_1.$Id)(buff, 'a﻿'.charCodeAt(0), 0);
            (0, buffer_1.$Id)(buff, 'a﻿'.charCodeAt(1), 2);
            const actual = (0, stringBuilder_1.$Ds)(buff, 0, 2);
            assert.deepStrictEqual(actual, 'a﻿');
        });
        test('issue #118041: unicode character undo bug 3', () => {
            const buff = new Uint8Array(6);
            (0, buffer_1.$Id)(buff, 'a﻿b'.charCodeAt(0), 0);
            (0, buffer_1.$Id)(buff, 'a﻿b'.charCodeAt(1), 2);
            (0, buffer_1.$Id)(buff, 'a﻿b'.charCodeAt(2), 4);
            const actual = (0, stringBuilder_1.$Ds)(buff, 0, 3);
            assert.deepStrictEqual(actual, 'a﻿b');
        });
    });
    suite('StringBuilder', () => {
        (0, utils_1.$bT)();
        test('basic', () => {
            const sb = new stringBuilder_1.$Es(100);
            sb.appendASCIICharCode(65 /* CharCode.A */);
            sb.appendASCIICharCode(32 /* CharCode.Space */);
            sb.appendString('😊');
            assert.strictEqual(sb.build(), 'A 😊');
        });
    });
});
//# sourceMappingURL=stringBuilder.test.js.map