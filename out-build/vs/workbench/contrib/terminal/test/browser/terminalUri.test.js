/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/workbench/contrib/terminal/browser/terminalUri"], function (require, exports, assert_1, utils_1, terminalUri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function fakeDragEvent(data) {
        return {
            dataTransfer: {
                getData: () => {
                    return data;
                }
            }
        };
    }
    suite('terminalUri', () => {
        (0, utils_1.$bT)();
        suite('getTerminalResourcesFromDragEvent', () => {
            test('should give undefined when no terminal resources is in event', () => {
                (0, assert_1.deepStrictEqual)((0, terminalUri_1.$QVb)(fakeDragEvent(''))?.map(e => e.toString()), undefined);
            });
            test('should give undefined when an empty terminal resources array is in event', () => {
                (0, assert_1.deepStrictEqual)((0, terminalUri_1.$QVb)(fakeDragEvent('[]'))?.map(e => e.toString()), undefined);
            });
            test('should return terminal resource when event contains one', () => {
                (0, assert_1.deepStrictEqual)((0, terminalUri_1.$QVb)(fakeDragEvent('["vscode-terminal:/1626874386474/3"]'))?.map(e => e.toString()), ['vscode-terminal:/1626874386474/3']);
            });
            test('should return multiple terminal resources when event contains multiple', () => {
                (0, assert_1.deepStrictEqual)((0, terminalUri_1.$QVb)(fakeDragEvent('["vscode-terminal:/foo/1","vscode-terminal:/bar/2"]'))?.map(e => e.toString()), ['vscode-terminal:/foo/1', 'vscode-terminal:/bar/2']);
            });
        });
        suite('getInstanceFromResource', () => {
            test('should return undefined if there is no match', () => {
                (0, assert_1.strictEqual)((0, terminalUri_1.$RVb)([
                    { resource: (0, terminalUri_1.$PVb)('workspace', 2, 'title') }
                ], (0, terminalUri_1.$PVb)('workspace', 1)), undefined);
            });
            test('should return a result if there is a match', () => {
                const instance = { resource: (0, terminalUri_1.$PVb)('workspace', 2, 'title') };
                (0, assert_1.strictEqual)((0, terminalUri_1.$RVb)([
                    { resource: (0, terminalUri_1.$PVb)('workspace', 1, 'title') },
                    instance,
                    { resource: (0, terminalUri_1.$PVb)('workspace', 3, 'title') }
                ], (0, terminalUri_1.$PVb)('workspace', 2)), instance);
            });
            test('should ignore the fragment', () => {
                const instance = { resource: (0, terminalUri_1.$PVb)('workspace', 2, 'title') };
                (0, assert_1.strictEqual)((0, terminalUri_1.$RVb)([
                    { resource: (0, terminalUri_1.$PVb)('workspace', 1, 'title') },
                    instance,
                    { resource: (0, terminalUri_1.$PVb)('workspace', 3, 'title') }
                ], (0, terminalUri_1.$PVb)('workspace', 2, 'does not match!')), instance);
            });
        });
    });
});
//# sourceMappingURL=terminalUri.test.js.map