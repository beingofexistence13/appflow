/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/node/terminalEncoding", "vs/workbench/services/textfile/common/encoding"], function (require, exports, assert, terminalEncoding, encoding) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Encoding', function () {
        this.timeout(10000);
        test('resolve terminal encoding (detect)', async function () {
            const enc = await terminalEncoding.$RS();
            assert.ok(enc.length > 0);
        });
        test('resolve terminal encoding (environment)', async function () {
            process.env['VSCODE_CLI_ENCODING'] = 'utf16le';
            const enc = await terminalEncoding.$RS();
            assert.ok(await encoding.$mD(enc));
            assert.strictEqual(enc, 'utf16le');
        });
    });
});
//# sourceMappingURL=encoding.integrationTest.js.map