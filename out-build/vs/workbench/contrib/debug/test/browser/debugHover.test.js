/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/platform/log/common/log", "vs/workbench/contrib/debug/browser/debugHover", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/common/debugSource", "vs/workbench/contrib/debug/test/browser/callStack.test", "vs/workbench/contrib/debug/test/browser/mockDebugModel"], function (require, exports, assert, lifecycle_1, log_1, debugHover_1, debugModel_1, debugSource_1, callStack_test_1, mockDebugModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Debug - Hover', () => {
        let disposables;
        setup(() => {
            disposables = new lifecycle_1.$jc();
        });
        teardown(() => {
            disposables.dispose();
        });
        test('find expression in stack frame', async () => {
            const model = (0, mockDebugModel_1.$ufc)(disposables);
            const session = disposables.add((0, callStack_test_1.$vfc)(model));
            const thread = new class extends debugModel_1.$NFb {
                getCallStack() {
                    return [stackFrame];
                }
            }(session, 'mockthread', 1);
            const firstSource = new debugSource_1.$wF({
                name: 'internalModule.js',
                path: 'a/b/c/d/internalModule.js',
                sourceReference: 10,
            }, 'aDebugSessionId', mockDebugModel_1.$tfc, new log_1.$fj());
            const stackFrame = new class extends debugModel_1.$MFb {
                getScopes() {
                    return Promise.resolve([scope]);
                }
            }(thread, 1, firstSource, 'app.js', 'normal', { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 10 }, 1, true);
            const scope = new class extends debugModel_1.$KFb {
                getChildren() {
                    return Promise.resolve([variableA]);
                }
            }(stackFrame, 1, 'local', 1, false, 10, 10);
            const variableA = new class extends debugModel_1.$JFb {
                getChildren() {
                    return Promise.resolve([variableB]);
                }
            }(session, 1, scope, 2, 'A', 'A', undefined, 0, 0, undefined, {}, 'string');
            const variableB = new debugModel_1.$JFb(session, 1, scope, 2, 'B', 'A.B', undefined, 0, 0, undefined, {}, 'string');
            assert.strictEqual(await (0, debugHover_1.$yRb)(stackFrame, []), undefined);
            assert.strictEqual(await (0, debugHover_1.$yRb)(stackFrame, ['A']), variableA);
            assert.strictEqual(await (0, debugHover_1.$yRb)(stackFrame, ['doesNotExist', 'no']), undefined);
            assert.strictEqual(await (0, debugHover_1.$yRb)(stackFrame, ['a']), undefined);
            assert.strictEqual(await (0, debugHover_1.$yRb)(stackFrame, ['B']), undefined);
            assert.strictEqual(await (0, debugHover_1.$yRb)(stackFrame, ['A', 'B']), variableB);
            assert.strictEqual(await (0, debugHover_1.$yRb)(stackFrame, ['A', 'C']), undefined);
            // We do not search in expensive scopes
            scope.expensive = true;
            assert.strictEqual(await (0, debugHover_1.$yRb)(stackFrame, ['A']), undefined);
        });
    });
});
//# sourceMappingURL=debugHover.test.js.map