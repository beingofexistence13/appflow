/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/parts/ipc/browser/ipc.mp", "vs/base/test/common/utils"], function (require, exports, assert, ipc_mp_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('IPC, MessagePorts', () => {
        test('message passing', async () => {
            const { port1, port2 } = new MessageChannel();
            const client1 = new ipc_mp_1.Client(port1, 'client1');
            const client2 = new ipc_mp_1.Client(port2, 'client2');
            client1.registerChannel('client1', {
                call(_, command, arg, cancellationToken) {
                    switch (command) {
                        case 'testMethodClient1': return Promise.resolve('success1');
                        default: return Promise.reject(new Error('not implemented'));
                    }
                },
                listen(_, event, arg) {
                    switch (event) {
                        default: throw new Error('not implemented');
                    }
                }
            });
            client2.registerChannel('client2', {
                call(_, command, arg, cancellationToken) {
                    switch (command) {
                        case 'testMethodClient2': return Promise.resolve('success2');
                        default: return Promise.reject(new Error('not implemented'));
                    }
                },
                listen(_, event, arg) {
                    switch (event) {
                        default: throw new Error('not implemented');
                    }
                }
            });
            const channelClient1 = client2.getChannel('client1');
            assert.strictEqual(await channelClient1.call('testMethodClient1'), 'success1');
            const channelClient2 = client1.getChannel('client2');
            assert.strictEqual(await channelClient2.call('testMethodClient2'), 'success2');
            client1.dispose();
            client2.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXBjLm1wLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL3BhcnRzL2lwYy90ZXN0L2Jyb3dzZXIvaXBjLm1wLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFRaEcsS0FBSyxDQUFDLG1CQUFtQixFQUFFLEdBQUcsRUFBRTtRQUUvQixJQUFJLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDbEMsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO1lBRTlDLE1BQU0sT0FBTyxHQUFHLElBQUksZUFBaUIsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDeEQsTUFBTSxPQUFPLEdBQUcsSUFBSSxlQUFpQixDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztZQUV4RCxPQUFPLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRTtnQkFDbEMsSUFBSSxDQUFDLENBQVUsRUFBRSxPQUFlLEVBQUUsR0FBUSxFQUFFLGlCQUFvQztvQkFDL0UsUUFBUSxPQUFPLEVBQUU7d0JBQ2hCLEtBQUssbUJBQW1CLENBQUMsQ0FBQyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7d0JBQzdELE9BQU8sQ0FBQyxDQUFDLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7cUJBQzdEO2dCQUNGLENBQUM7Z0JBRUQsTUFBTSxDQUFDLENBQVUsRUFBRSxLQUFhLEVBQUUsR0FBUztvQkFDMUMsUUFBUSxLQUFLLEVBQUU7d0JBQ2QsT0FBTyxDQUFDLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO3FCQUM1QztnQkFDRixDQUFDO2FBQ0QsQ0FBQyxDQUFDO1lBRUgsT0FBTyxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUU7Z0JBQ2xDLElBQUksQ0FBQyxDQUFVLEVBQUUsT0FBZSxFQUFFLEdBQVEsRUFBRSxpQkFBb0M7b0JBQy9FLFFBQVEsT0FBTyxFQUFFO3dCQUNoQixLQUFLLG1CQUFtQixDQUFDLENBQUMsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO3dCQUM3RCxPQUFPLENBQUMsQ0FBQyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO3FCQUM3RDtnQkFDRixDQUFDO2dCQUVELE1BQU0sQ0FBQyxDQUFVLEVBQUUsS0FBYSxFQUFFLEdBQVM7b0JBQzFDLFFBQVEsS0FBSyxFQUFFO3dCQUNkLE9BQU8sQ0FBQyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztxQkFDNUM7Z0JBQ0YsQ0FBQzthQUNELENBQUMsQ0FBQztZQUVILE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDckQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUUvRSxNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3JELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFL0UsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2xCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNuQixDQUFDLENBQUMsQ0FBQztRQUVILElBQUEsK0NBQXVDLEdBQUUsQ0FBQztJQUMzQyxDQUFDLENBQUMsQ0FBQyJ9