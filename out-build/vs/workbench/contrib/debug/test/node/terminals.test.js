/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/debug/node/terminals"], function (require, exports, assert, terminals_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Debug - prepareCommand', () => {
        test('bash', () => {
            assert.strictEqual((0, terminals_1.$pdc)('bash', ['{$} ('], false).trim(), '\\{\\$\\}\\ \\(');
            assert.strictEqual((0, terminals_1.$pdc)('bash', ['hello', 'world', '--flag=true'], false).trim(), 'hello world --flag=true');
            assert.strictEqual((0, terminals_1.$pdc)('bash', [' space arg '], false).trim(), '\\ space\\ arg\\');
            assert.strictEqual((0, terminals_1.$pdc)('bash', ['{$} ('], true).trim(), '{$} (');
            assert.strictEqual((0, terminals_1.$pdc)('bash', ['hello', 'world', '--flag=true'], true).trim(), 'hello world --flag=true');
            assert.strictEqual((0, terminals_1.$pdc)('bash', [' space arg '], true).trim(), 'space arg');
        });
        test('bash - do not escape > and <', () => {
            assert.strictEqual((0, terminals_1.$pdc)('bash', ['arg1', '>', '> hello.txt', '<', '<input.in'], false).trim(), 'arg1 > \\>\\ hello.txt < \\<input.in');
        });
        test('cmd', () => {
            assert.strictEqual((0, terminals_1.$pdc)('cmd.exe', ['^!< '], false).trim(), '"^^^!^< "');
            assert.strictEqual((0, terminals_1.$pdc)('cmd.exe', ['hello', 'world', '--flag=true'], false).trim(), 'hello world --flag=true');
            assert.strictEqual((0, terminals_1.$pdc)('cmd.exe', [' space arg '], false).trim(), '" space arg "');
            assert.strictEqual((0, terminals_1.$pdc)('cmd.exe', ['"A>0"'], false).trim(), '"""A^>0"""');
            assert.strictEqual((0, terminals_1.$pdc)('cmd.exe', [''], false).trim(), '""');
            assert.strictEqual((0, terminals_1.$pdc)('cmd.exe', ['^!< '], true).trim(), '^!<');
            assert.strictEqual((0, terminals_1.$pdc)('cmd.exe', ['hello', 'world', '--flag=true'], true).trim(), 'hello world --flag=true');
            assert.strictEqual((0, terminals_1.$pdc)('cmd.exe', [' space arg '], true).trim(), 'space arg');
            assert.strictEqual((0, terminals_1.$pdc)('cmd.exe', ['"A>0"'], true).trim(), '"A>0"');
            assert.strictEqual((0, terminals_1.$pdc)('cmd.exe', [''], true).trim(), '');
        });
        test('cmd - do not escape > and <', () => {
            assert.strictEqual((0, terminals_1.$pdc)('cmd.exe', ['arg1', '>', '> hello.txt', '<', '<input.in'], false).trim(), 'arg1 > "^> hello.txt" < ^<input.in');
        });
        test('powershell', () => {
            assert.strictEqual((0, terminals_1.$pdc)('powershell', ['!< '], false).trim(), `& '!< '`);
            assert.strictEqual((0, terminals_1.$pdc)('powershell', ['hello', 'world', '--flag=true'], false).trim(), `& 'hello' 'world' '--flag=true'`);
            assert.strictEqual((0, terminals_1.$pdc)('powershell', [' space arg '], false).trim(), `& ' space arg '`);
            assert.strictEqual((0, terminals_1.$pdc)('powershell', ['"A>0"'], false).trim(), `& '"A>0"'`);
            assert.strictEqual((0, terminals_1.$pdc)('powershell', [''], false).trim(), `& ''`);
            assert.strictEqual((0, terminals_1.$pdc)('powershell', ['!< '], true).trim(), '!<');
            assert.strictEqual((0, terminals_1.$pdc)('powershell', ['hello', 'world', '--flag=true'], true).trim(), 'hello world --flag=true');
            assert.strictEqual((0, terminals_1.$pdc)('powershell', [' space arg '], true).trim(), 'space arg');
            assert.strictEqual((0, terminals_1.$pdc)('powershell', ['"A>0"'], true).trim(), '"A>0"');
            assert.strictEqual((0, terminals_1.$pdc)('powershell', [''], true).trim(), ``);
        });
        test('powershell - do not escape > and <', () => {
            assert.strictEqual((0, terminals_1.$pdc)('powershell', ['arg1', '>', '> hello.txt', '<', '<input.in'], false).trim(), `& 'arg1' > '> hello.txt' < '<input.in'`);
        });
    });
});
//# sourceMappingURL=terminals.test.js.map