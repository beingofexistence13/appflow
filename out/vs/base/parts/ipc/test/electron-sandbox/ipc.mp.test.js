/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/parts/ipc/browser/ipc.mp", "vs/base/test/common/utils"], function (require, exports, assert, ipc_mp_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('IPC, MessagePorts', () => {
        test('message port close event', async () => {
            const { port1, port2 } = new MessageChannel();
            const client1 = new ipc_mp_1.Client(port1, 'client1');
            const client2 = new ipc_mp_1.Client(port2, 'client2');
            // This test ensures that Electron's API for the close event
            // does not break because we rely on it to dispose client
            // connections from the server.
            //
            // This event is not provided by browser MessagePort API though.
            const whenClosed = new Promise(resolve => port1.addEventListener('close', () => resolve(true)));
            client2.dispose();
            assert.ok(await whenClosed);
            client1.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXBjLm1wLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL3BhcnRzL2lwYy90ZXN0L2VsZWN0cm9uLXNhbmRib3gvaXBjLm1wLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFNaEcsS0FBSyxDQUFDLG1CQUFtQixFQUFFLEdBQUcsRUFBRTtRQUUvQixJQUFJLENBQUMsMEJBQTBCLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDM0MsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO1lBRTlDLE1BQU0sT0FBTyxHQUFHLElBQUksZUFBaUIsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDeEQsTUFBTSxPQUFPLEdBQUcsSUFBSSxlQUFpQixDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztZQUV4RCw0REFBNEQ7WUFDNUQseURBQXlEO1lBQ3pELCtCQUErQjtZQUMvQixFQUFFO1lBQ0YsZ0VBQWdFO1lBQ2hFLE1BQU0sVUFBVSxHQUFHLElBQUksT0FBTyxDQUFVLE9BQU8sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXpHLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUVsQixNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sVUFBVSxDQUFDLENBQUM7WUFFNUIsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ25CLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO0lBQzNDLENBQUMsQ0FBQyxDQUFDIn0=