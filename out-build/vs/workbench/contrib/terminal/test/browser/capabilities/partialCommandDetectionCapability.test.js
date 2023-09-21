/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/terminal/common/capabilities/partialCommandDetectionCapability", "vs/amdX", "vs/workbench/contrib/terminal/browser/terminalTestHelpers", "vs/base/test/common/utils"], function (require, exports, assert_1, partialCommandDetectionCapability_1, amdX_1, terminalTestHelpers_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('PartialCommandDetectionCapability', () => {
        let xterm;
        let capability;
        let addEvents;
        function assertCommands(expectedLines) {
            (0, assert_1.deepStrictEqual)(capability.commands.map(e => e.line), expectedLines);
            (0, assert_1.deepStrictEqual)(addEvents.map(e => e.line), expectedLines);
        }
        setup(async () => {
            const TerminalCtor = (await (0, amdX_1.$aD)('xterm', 'lib/xterm.js')).Terminal;
            xterm = new TerminalCtor({ allowProposedApi: true, cols: 80 });
            capability = new partialCommandDetectionCapability_1.$hib(xterm);
            addEvents = [];
            capability.onCommandFinished(e => addEvents.push(e));
        });
        (0, utils_1.$bT)();
        test('should not add commands when the cursor position is too close to the left side', async () => {
            assertCommands([]);
            xterm._core._onData.fire('\x0d');
            await (0, terminalTestHelpers_1.$Wfc)(xterm, '\r\n');
            assertCommands([]);
            await (0, terminalTestHelpers_1.$Wfc)(xterm, 'a');
            xterm._core._onData.fire('\x0d');
            await (0, terminalTestHelpers_1.$Wfc)(xterm, '\r\n');
            assertCommands([]);
        });
        test('should add commands when the cursor position is not too close to the left side', async () => {
            assertCommands([]);
            await (0, terminalTestHelpers_1.$Wfc)(xterm, 'ab');
            xterm._core._onData.fire('\x0d');
            await (0, terminalTestHelpers_1.$Wfc)(xterm, '\r\n\r\n');
            assertCommands([0]);
            await (0, terminalTestHelpers_1.$Wfc)(xterm, 'cd');
            xterm._core._onData.fire('\x0d');
            await (0, terminalTestHelpers_1.$Wfc)(xterm, '\r\n');
            assertCommands([0, 2]);
        });
    });
});
//# sourceMappingURL=partialCommandDetectionCapability.test.js.map