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
            const TerminalCtor = (await (0, amdX_1.importAMDNodeModule)('xterm', 'lib/xterm.js')).Terminal;
            xterm = new TerminalCtor({ allowProposedApi: true, cols: 80 });
            capability = new partialCommandDetectionCapability_1.PartialCommandDetectionCapability(xterm);
            addEvents = [];
            capability.onCommandFinished(e => addEvents.push(e));
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('should not add commands when the cursor position is too close to the left side', async () => {
            assertCommands([]);
            xterm._core._onData.fire('\x0d');
            await (0, terminalTestHelpers_1.writeP)(xterm, '\r\n');
            assertCommands([]);
            await (0, terminalTestHelpers_1.writeP)(xterm, 'a');
            xterm._core._onData.fire('\x0d');
            await (0, terminalTestHelpers_1.writeP)(xterm, '\r\n');
            assertCommands([]);
        });
        test('should add commands when the cursor position is not too close to the left side', async () => {
            assertCommands([]);
            await (0, terminalTestHelpers_1.writeP)(xterm, 'ab');
            xterm._core._onData.fire('\x0d');
            await (0, terminalTestHelpers_1.writeP)(xterm, '\r\n\r\n');
            assertCommands([0]);
            await (0, terminalTestHelpers_1.writeP)(xterm, 'cd');
            xterm._core._onData.fire('\x0d');
            await (0, terminalTestHelpers_1.writeP)(xterm, '\r\n');
            assertCommands([0, 2]);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFydGlhbENvbW1hbmREZXRlY3Rpb25DYXBhYmlsaXR5LnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC90ZXN0L2Jyb3dzZXIvY2FwYWJpbGl0aWVzL3BhcnRpYWxDb21tYW5kRGV0ZWN0aW9uQ2FwYWJpbGl0eS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBY2hHLEtBQUssQ0FBQyxtQ0FBbUMsRUFBRSxHQUFHLEVBQUU7UUFDL0MsSUFBSSxLQUFtQixDQUFDO1FBQ3hCLElBQUksVUFBNkMsQ0FBQztRQUNsRCxJQUFJLFNBQW9CLENBQUM7UUFFekIsU0FBUyxjQUFjLENBQUMsYUFBdUI7WUFDOUMsSUFBQSx3QkFBZSxFQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQ3JFLElBQUEsd0JBQWUsRUFBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQzVELENBQUM7UUFFRCxLQUFLLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDaEIsTUFBTSxZQUFZLEdBQUcsQ0FBQyxNQUFNLElBQUEsMEJBQW1CLEVBQXlCLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztZQUUzRyxLQUFLLEdBQUcsSUFBSSxZQUFZLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFpQixDQUFDO1lBQy9FLFVBQVUsR0FBRyxJQUFJLHFFQUFpQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzFELFNBQVMsR0FBRyxFQUFFLENBQUM7WUFDZixVQUFVLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsSUFBSSxDQUFDLGdGQUFnRixFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ2pHLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNuQixLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakMsTUFBTSxJQUFBLDRCQUFNLEVBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzVCLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNuQixNQUFNLElBQUEsNEJBQU0sRUFBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDekIsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2pDLE1BQU0sSUFBQSw0QkFBTSxFQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztZQUM1QixjQUFjLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsZ0ZBQWdGLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDakcsY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ25CLE1BQU0sSUFBQSw0QkFBTSxFQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMxQixLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakMsTUFBTSxJQUFBLDRCQUFNLEVBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ2hDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEIsTUFBTSxJQUFBLDRCQUFNLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzFCLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNqQyxNQUFNLElBQUEsNEJBQU0sRUFBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDNUIsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEIsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9