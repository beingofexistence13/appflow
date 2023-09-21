/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/test/common/mock", "vs/platform/log/common/log", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/test/common/mockDebug", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, async_1, lifecycle_1, mock_1, log_1, debugModel_1, mockDebug_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('DebugModel', () => {
        suite('FunctionBreakpoint', () => {
            test('Id is saved', () => {
                const fbp = new debugModel_1.FunctionBreakpoint('function', true, 'hit condition', 'condition', 'log message');
                const strigified = JSON.stringify(fbp);
                const parsed = JSON.parse(strigified);
                assert.equal(parsed.id, fbp.getId());
            });
        });
        suite('ExceptionBreakpoint', () => {
            test('Restored matches new', () => {
                const ebp = new debugModel_1.ExceptionBreakpoint('id', 'label', true, true, 'condition', 'description', 'condition description', false);
                const strigified = JSON.stringify(ebp);
                const parsed = JSON.parse(strigified);
                const newEbp = new debugModel_1.ExceptionBreakpoint(parsed.filter, parsed.label, parsed.enabled, parsed.supportsCondition, parsed.condition, parsed.description, parsed.conditionDescription, !!parsed.fallback);
                assert.ok(ebp.matches(newEbp));
            });
        });
        suite('DebugModel', () => {
            test('refreshTopOfCallstack resolves all returned promises when called multiple times', async () => {
                const topFrameDeferred = new async_1.DeferredPromise();
                const wholeStackDeferred = new async_1.DeferredPromise();
                const fakeThread = (0, mock_1.mockObject)()({
                    session: { capabilities: { supportsDelayedStackTraceLoading: true } },
                    getCallStack: () => [],
                    getStaleCallStack: () => [],
                });
                fakeThread.fetchCallStack.callsFake((levels) => {
                    return levels === 1 ? topFrameDeferred.p : wholeStackDeferred.p;
                });
                fakeThread.getId.returns(1);
                const disposable = new lifecycle_1.DisposableStore();
                const storage = disposable.add(new workbenchTestServices_1.TestStorageService());
                const model = new debugModel_1.DebugModel(disposable.add(new mockDebug_1.MockDebugStorage(storage)), { isDirty: (e) => false }, undefined, new log_1.NullLogService());
                disposable.add(model);
                let top1Resolved = false;
                let whole1Resolved = false;
                let top2Resolved = false;
                let whole2Resolved = false;
                const result1 = model.refreshTopOfCallstack(fakeThread);
                result1.topCallStack.then(() => top1Resolved = true);
                result1.wholeCallStack.then(() => whole1Resolved = true);
                const result2 = model.refreshTopOfCallstack(fakeThread);
                result2.topCallStack.then(() => top2Resolved = true);
                result2.wholeCallStack.then(() => whole2Resolved = true);
                assert.ok(!top1Resolved);
                assert.ok(!whole1Resolved);
                assert.ok(!top2Resolved);
                assert.ok(!whole2Resolved);
                await topFrameDeferred.complete();
                await result1.topCallStack;
                await result2.topCallStack;
                assert.ok(!whole1Resolved);
                assert.ok(!whole2Resolved);
                await wholeStackDeferred.complete();
                await result1.wholeCallStack;
                await result2.wholeCallStack;
                disposable.dispose();
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdNb2RlbC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvdGVzdC9jb21tb24vZGVidWdNb2RlbC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBV2hHLEtBQUssQ0FBQyxZQUFZLEVBQUUsR0FBRyxFQUFFO1FBQ3hCLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLEVBQUU7WUFDaEMsSUFBSSxDQUFDLGFBQWEsRUFBRSxHQUFHLEVBQUU7Z0JBQ3hCLE1BQU0sR0FBRyxHQUFHLElBQUksK0JBQWtCLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsV0FBVyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUNsRyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN2QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN0QyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDdEMsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVILEtBQUssQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLEVBQUU7WUFDakMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLEdBQUcsRUFBRTtnQkFDakMsTUFBTSxHQUFHLEdBQUcsSUFBSSxnQ0FBbUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRSx1QkFBdUIsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDM0gsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDdkMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDdEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxnQ0FBbUIsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsaUJBQWlCLEVBQUUsTUFBTSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNwTSxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNoQyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUgsS0FBSyxDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUU7WUFDeEIsSUFBSSxDQUFDLGlGQUFpRixFQUFFLEtBQUssSUFBSSxFQUFFO2dCQUNsRyxNQUFNLGdCQUFnQixHQUFHLElBQUksdUJBQWUsRUFBUSxDQUFDO2dCQUNyRCxNQUFNLGtCQUFrQixHQUFHLElBQUksdUJBQWUsRUFBUSxDQUFDO2dCQUN2RCxNQUFNLFVBQVUsR0FBRyxJQUFBLGlCQUFVLEdBQVUsQ0FBQztvQkFDdkMsT0FBTyxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsZ0NBQWdDLEVBQUUsSUFBSSxFQUFFLEVBQVM7b0JBQzVFLFlBQVksRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFO29CQUN0QixpQkFBaUIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFO2lCQUMzQixDQUFDLENBQUM7Z0JBQ0gsVUFBVSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFjLEVBQUUsRUFBRTtvQkFDdEQsT0FBTyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztnQkFDakUsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsVUFBVSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRTVCLE1BQU0sVUFBVSxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO2dCQUN6QyxNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksMENBQWtCLEVBQUUsQ0FBQyxDQUFDO2dCQUN6RCxNQUFNLEtBQUssR0FBRyxJQUFJLHVCQUFVLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLDRCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLFNBQVUsRUFBRSxJQUFJLG9CQUFjLEVBQUUsQ0FBQyxDQUFDO2dCQUNuSixVQUFVLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUV0QixJQUFJLFlBQVksR0FBRyxLQUFLLENBQUM7Z0JBQ3pCLElBQUksY0FBYyxHQUFHLEtBQUssQ0FBQztnQkFDM0IsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDO2dCQUN6QixJQUFJLGNBQWMsR0FBRyxLQUFLLENBQUM7Z0JBQzNCLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxVQUFpQixDQUFDLENBQUM7Z0JBQy9ELE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsQ0FBQztnQkFDckQsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxDQUFDO2dCQUV6RCxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMscUJBQXFCLENBQUMsVUFBaUIsQ0FBQyxDQUFDO2dCQUMvRCxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLENBQUM7Z0JBQ3JELE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsQ0FBQztnQkFFekQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUN6QixNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQzNCLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDekIsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUUzQixNQUFNLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNsQyxNQUFNLE9BQU8sQ0FBQyxZQUFZLENBQUM7Z0JBQzNCLE1BQU0sT0FBTyxDQUFDLFlBQVksQ0FBQztnQkFDM0IsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUMzQixNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBRTNCLE1BQU0sa0JBQWtCLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ3BDLE1BQU0sT0FBTyxDQUFDLGNBQWMsQ0FBQztnQkFDN0IsTUFBTSxPQUFPLENBQUMsY0FBYyxDQUFDO2dCQUU3QixVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDdEIsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDIn0=