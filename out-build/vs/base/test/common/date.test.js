/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/date", "vs/base/test/common/utils"], function (require, exports, assert_1, date_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Date', () => {
        (0, utils_1.$bT)();
        suite('fromNow', () => {
            test('appendAgoLabel', () => {
                (0, assert_1.strictEqual)((0, date_1.$6l)(Date.now() - 35000), '35 secs');
                (0, assert_1.strictEqual)((0, date_1.$6l)(Date.now() - 35000, false), '35 secs');
                (0, assert_1.strictEqual)((0, date_1.$6l)(Date.now() - 35000, true), '35 secs ago');
            });
            test('useFullTimeWords', () => {
                (0, assert_1.strictEqual)((0, date_1.$6l)(Date.now() - 35000), '35 secs');
                (0, assert_1.strictEqual)((0, date_1.$6l)(Date.now() - 35000, undefined, false), '35 secs');
                (0, assert_1.strictEqual)((0, date_1.$6l)(Date.now() - 35000, undefined, true), '35 seconds');
            });
            test('disallowNow', () => {
                (0, assert_1.strictEqual)((0, date_1.$6l)(Date.now() - 5000), 'now');
                (0, assert_1.strictEqual)((0, date_1.$6l)(Date.now() - 5000, undefined, undefined, false), 'now');
                (0, assert_1.strictEqual)((0, date_1.$6l)(Date.now() - 5000, undefined, undefined, true), '5 secs');
            });
        });
    });
});
//# sourceMappingURL=date.test.js.map