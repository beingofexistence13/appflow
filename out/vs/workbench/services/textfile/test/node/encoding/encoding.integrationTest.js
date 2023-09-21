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
            const enc = await terminalEncoding.resolveTerminalEncoding();
            assert.ok(enc.length > 0);
        });
        test('resolve terminal encoding (environment)', async function () {
            process.env['VSCODE_CLI_ENCODING'] = 'utf16le';
            const enc = await terminalEncoding.resolveTerminalEncoding();
            assert.ok(await encoding.encodingExists(enc));
            assert.strictEqual(enc, 'utf16le');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5jb2RpbmcuaW50ZWdyYXRpb25UZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3RleHRmaWxlL3Rlc3Qvbm9kZS9lbmNvZGluZy9lbmNvZGluZy5pbnRlZ3JhdGlvblRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFNaEcsS0FBSyxDQUFDLFVBQVUsRUFBRTtRQUVqQixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXBCLElBQUksQ0FBQyxvQ0FBb0MsRUFBRSxLQUFLO1lBQy9DLE1BQU0sR0FBRyxHQUFHLE1BQU0sZ0JBQWdCLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztZQUM3RCxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDM0IsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMseUNBQXlDLEVBQUUsS0FBSztZQUNwRCxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLEdBQUcsU0FBUyxDQUFDO1lBRS9DLE1BQU0sR0FBRyxHQUFHLE1BQU0sZ0JBQWdCLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztZQUM3RCxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sUUFBUSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzlDLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3BDLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUMifQ==