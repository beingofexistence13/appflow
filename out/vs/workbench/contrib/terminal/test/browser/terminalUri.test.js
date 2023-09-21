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
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        suite('getTerminalResourcesFromDragEvent', () => {
            test('should give undefined when no terminal resources is in event', () => {
                (0, assert_1.deepStrictEqual)((0, terminalUri_1.getTerminalResourcesFromDragEvent)(fakeDragEvent(''))?.map(e => e.toString()), undefined);
            });
            test('should give undefined when an empty terminal resources array is in event', () => {
                (0, assert_1.deepStrictEqual)((0, terminalUri_1.getTerminalResourcesFromDragEvent)(fakeDragEvent('[]'))?.map(e => e.toString()), undefined);
            });
            test('should return terminal resource when event contains one', () => {
                (0, assert_1.deepStrictEqual)((0, terminalUri_1.getTerminalResourcesFromDragEvent)(fakeDragEvent('["vscode-terminal:/1626874386474/3"]'))?.map(e => e.toString()), ['vscode-terminal:/1626874386474/3']);
            });
            test('should return multiple terminal resources when event contains multiple', () => {
                (0, assert_1.deepStrictEqual)((0, terminalUri_1.getTerminalResourcesFromDragEvent)(fakeDragEvent('["vscode-terminal:/foo/1","vscode-terminal:/bar/2"]'))?.map(e => e.toString()), ['vscode-terminal:/foo/1', 'vscode-terminal:/bar/2']);
            });
        });
        suite('getInstanceFromResource', () => {
            test('should return undefined if there is no match', () => {
                (0, assert_1.strictEqual)((0, terminalUri_1.getInstanceFromResource)([
                    { resource: (0, terminalUri_1.getTerminalUri)('workspace', 2, 'title') }
                ], (0, terminalUri_1.getTerminalUri)('workspace', 1)), undefined);
            });
            test('should return a result if there is a match', () => {
                const instance = { resource: (0, terminalUri_1.getTerminalUri)('workspace', 2, 'title') };
                (0, assert_1.strictEqual)((0, terminalUri_1.getInstanceFromResource)([
                    { resource: (0, terminalUri_1.getTerminalUri)('workspace', 1, 'title') },
                    instance,
                    { resource: (0, terminalUri_1.getTerminalUri)('workspace', 3, 'title') }
                ], (0, terminalUri_1.getTerminalUri)('workspace', 2)), instance);
            });
            test('should ignore the fragment', () => {
                const instance = { resource: (0, terminalUri_1.getTerminalUri)('workspace', 2, 'title') };
                (0, assert_1.strictEqual)((0, terminalUri_1.getInstanceFromResource)([
                    { resource: (0, terminalUri_1.getTerminalUri)('workspace', 1, 'title') },
                    instance,
                    { resource: (0, terminalUri_1.getTerminalUri)('workspace', 3, 'title') }
                ], (0, terminalUri_1.getTerminalUri)('workspace', 2, 'does not match!')), instance);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxVcmkudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsL3Rlc3QvYnJvd3Nlci90ZXJtaW5hbFVyaS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBTWhHLFNBQVMsYUFBYSxDQUFDLElBQVk7UUFDbEMsT0FBTztZQUNOLFlBQVksRUFBRTtnQkFDYixPQUFPLEVBQUUsR0FBRyxFQUFFO29CQUNiLE9BQU8sSUFBSSxDQUFDO2dCQUNiLENBQUM7YUFDRDtTQUNELENBQUM7SUFDSCxDQUFDO0lBRUQsS0FBSyxDQUFDLGFBQWEsRUFBRSxHQUFHLEVBQUU7UUFDekIsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLEtBQUssQ0FBQyxtQ0FBbUMsRUFBRSxHQUFHLEVBQUU7WUFDL0MsSUFBSSxDQUFDLDhEQUE4RCxFQUFFLEdBQUcsRUFBRTtnQkFDekUsSUFBQSx3QkFBZSxFQUNkLElBQUEsK0NBQWlDLEVBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQzVFLFNBQVMsQ0FDVCxDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsMEVBQTBFLEVBQUUsR0FBRyxFQUFFO2dCQUNyRixJQUFBLHdCQUFlLEVBQ2QsSUFBQSwrQ0FBaUMsRUFBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsRUFDOUUsU0FBUyxDQUNULENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyx5REFBeUQsRUFBRSxHQUFHLEVBQUU7Z0JBQ3BFLElBQUEsd0JB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