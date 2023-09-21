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
                const fbp = new debugModel_1.$TFb('function', true, 'hit condition', 'condition', 'log message');
                const strigified = JSON.stringify(fbp);
                const parsed = JSON.parse(strigified);
                assert.equal(parsed.id, fbp.getId());
            });
        });
        suite('ExceptionBreakpoint', () => {
            test('Restored matches new', () => {
                const ebp = new debugModel_1.$VFb('id', 'label', true, true, 'condition', 'description', 'condition description', false);
                const strigified = JSON.stringify(ebp);
                const parsed = JSON.parse(strigified);
                const newEbp = new debugModel_1.$VFb(parsed.filter, parsed.label, parsed.enabled, parsed.supportsCondition, parsed.condition, parsed.description, parsed.conditionDescription, !!parsed.fallback);
                assert.ok(ebp.matches(newEbp));
            });
        });
        suite('DebugModel', () => {
            test('refreshTopOfCallstack resolves all returned promises when called multiple times', async () => {
                const topFrameDeferred = new async_1.$2g();
                const wholeStackDeferred = new async_1.$2g();
                const fakeThread = (0, mock_1.$sT)()({
                    session: { capabilities: { supportsDelayedStackTraceLoading: true } },
                    getCallStack: () => [],
                    getStaleCallStack: () => [],
                });
                fakeThread.fetchCallStack.callsFake((levels) => {
                    return levels === 1 ? topFrameDeferred.p : wholeStackDeferred.p;
                });
                fakeThread.getId.returns(1);
                const disposable = new lifecycle_1.$jc();
                const storage = disposable.add(new workbenchTestServices_1.$7dc());
                const model = new debugModel_1.$YFb(disposable.add(new mockDebug_1.$sfc(storage)), { isDirty: (e) => false }, undefined, new log_1.$fj());
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
//# sourceMappingURL=debugModel.test.js.map