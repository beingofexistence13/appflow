/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/workbench/services/lifecycle/electron-sandbox/lifecycleService", "vs/workbench/test/electron-sandbox/workbenchTestServices"], function (require, exports, assert, lifecycle_1, utils_1, lifecycleService_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Lifecycleservice', function () {
        let lifecycleService;
        const disposables = new lifecycle_1.DisposableStore();
        class TestLifecycleService extends lifecycleService_1.NativeLifecycleService {
            testHandleBeforeShutdown(reason) {
                return super.handleBeforeShutdown(reason);
            }
            testHandleWillShutdown(reason) {
                return super.handleWillShutdown(reason);
            }
        }
        setup(async () => {
            const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
            lifecycleService = disposables.add(instantiationService.createInstance(TestLifecycleService));
        });
        teardown(async () => {
            disposables.clear();
        });
        test('onBeforeShutdown - final veto called after other vetos', async function () {
            let vetoCalled = false;
            let finalVetoCalled = false;
            const order = [];
            disposables.add(lifecycleService.onBeforeShutdown(e => {
                e.veto(new Promise(resolve => {
                    vetoCalled = true;
                    order.push(1);
                    resolve(false);
                }), 'test');
            }));
            disposables.add(lifecycleService.onBeforeShutdown(e => {
                e.finalVeto(() => {
                    return new Promise(resolve => {
                        finalVetoCalled = true;
                        order.push(2);
                        resolve(true);
                    });
                }, 'test');
            }));
            const veto = await lifecycleService.testHandleBeforeShutdown(2 /* ShutdownReason.QUIT */);
            assert.strictEqual(veto, true);
            assert.strictEqual(vetoCalled, true);
            assert.strictEqual(finalVetoCalled, true);
            assert.strictEqual(order[0], 1);
            assert.strictEqual(order[1], 2);
        });
        test('onBeforeShutdown - final veto not called when veto happened before', async function () {
            let vetoCalled = false;
            let finalVetoCalled = false;
            disposables.add(lifecycleService.onBeforeShutdown(e => {
                e.veto(new Promise(resolve => {
                    vetoCalled = true;
                    resolve(true);
                }), 'test');
            }));
            disposables.add(lifecycleService.onBeforeShutdown(e => {
                e.finalVeto(() => {
                    return new Promise(resolve => {
                        finalVetoCalled = true;
                        resolve(true);
                    });
                }, 'test');
            }));
            const veto = await lifecycleService.testHandleBeforeShutdown(2 /* ShutdownReason.QUIT */);
            assert.strictEqual(veto, true);
            assert.strictEqual(vetoCalled, true);
            assert.strictEqual(finalVetoCalled, false);
        });
        test('onBeforeShutdown - veto with error is treated as veto', async function () {
            disposables.add(lifecycleService.onBeforeShutdown(e => {
                e.veto(new Promise((resolve, reject) => {
                    reject(new Error('Fail'));
                }), 'test');
            }));
            const veto = await lifecycleService.testHandleBeforeShutdown(2 /* ShutdownReason.QUIT */);
            assert.strictEqual(veto, true);
        });
        test('onBeforeShutdown - final veto with error is treated as veto', async function () {
            disposables.add(lifecycleService.onBeforeShutdown(e => {
                e.finalVeto(() => new Promise((resolve, reject) => {
                    reject(new Error('Fail'));
                }), 'test');
            }));
            const veto = await lifecycleService.testHandleBeforeShutdown(2 /* ShutdownReason.QUIT */);
            assert.strictEqual(veto, true);
        });
        test('onWillShutdown - join', async function () {
            let joinCalled = false;
            disposables.add(lifecycleService.onWillShutdown(e => {
                e.join(new Promise(resolve => {
                    joinCalled = true;
                    resolve();
                }), { id: 'test', label: 'test' });
            }));
            await lifecycleService.testHandleWillShutdown(2 /* ShutdownReason.QUIT */);
            assert.strictEqual(joinCalled, true);
        });
        test('onWillShutdown - join with error is handled', async function () {
            let joinCalled = false;
            disposables.add(lifecycleService.onWillShutdown(e => {
                e.join(new Promise((resolve, reject) => {
                    joinCalled = true;
                    reject(new Error('Fail'));
                }), { id: 'test', label: 'test' });
            }));
            await lifecycleService.testHandleWillShutdown(2 /* ShutdownReason.QUIT */);
            assert.strictEqual(joinCalled, true);
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlU2VydmljZS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2xpZmVjeWNsZS90ZXN0L2VsZWN0cm9uLXNhbmRib3gvbGlmZWN5Y2xlU2VydmljZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBU2hHLEtBQUssQ0FBQyxrQkFBa0IsRUFBRTtRQUV6QixJQUFJLGdCQUFzQyxDQUFDO1FBQzNDLE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1FBRTFDLE1BQU0sb0JBQXFCLFNBQVEseUNBQXNCO1lBRXhELHdCQUF3QixDQUFDLE1BQXNCO2dCQUM5QyxPQUFPLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMzQyxDQUFDO1lBRUQsc0JBQXNCLENBQUMsTUFBc0I7Z0JBQzVDLE9BQU8sS0FBSyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3pDLENBQUM7U0FDRDtRQUVELEtBQUssQ0FBQyxLQUFLLElBQUksRUFBRTtZQUNoQixNQUFNLG9CQUFvQixHQUFHLElBQUEscURBQTZCLEVBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ25GLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztRQUMvRixDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxLQUFLLElBQUksRUFBRTtZQUNuQixXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsd0RBQXdELEVBQUUsS0FBSztZQUNuRSxJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUM7WUFDdkIsSUFBSSxlQUFlLEdBQUcsS0FBSyxDQUFDO1lBRTVC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