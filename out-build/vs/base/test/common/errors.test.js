/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/errorMessage"], function (require, exports, assert, errorMessage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Errors', () => {
        test('Get Error Message', function () {
            assert.strictEqual((0, errorMessage_1.$mi)('Foo Bar'), 'Foo Bar');
            assert.strictEqual((0, errorMessage_1.$mi)(new Error('Foo Bar')), 'Foo Bar');
            let error = new Error();
            error = new Error();
            error.detail = {};
            error.detail.exception = {};
            error.detail.exception.message = 'Foo Bar';
            assert.strictEqual((0, errorMessage_1.$mi)(error), 'Foo Bar');
            assert.strictEqual((0, errorMessage_1.$mi)(error, true), 'Foo Bar');
            assert((0, errorMessage_1.$mi)());
            assert((0, errorMessage_1.$mi)(null));
            assert((0, errorMessage_1.$mi)({}));
            try {
                throw new Error();
            }
            catch (error) {
                assert.strictEqual((0, errorMessage_1.$mi)(error), 'An unknown error occurred. Please consult the log for more details.');
                assert.ok((0, errorMessage_1.$mi)(error, true).length > 'An unknown error occurred. Please consult the log for more details.'.length);
            }
        });
    });
});
//# sourceMappingURL=errors.test.js.map