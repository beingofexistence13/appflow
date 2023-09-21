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
            disposables = new lifecycle_1.DisposableStore();
        });
        teardown(() => {
            disposables.dispose();
        });
        test('find expression in stack frame', async () => {
            const model = (0, mockDebugModel_1.createMockDebugModel)(disposables);
            const session = disposables.add((0, callStack_test_1.createTestSession)(model));
            const thread = new class extends debugModel_1.Thread {
                getCallStack() {
                    return [stackFrame];
                }
            }(session, 'mockthread', 1);
            const firstSource = new debugSource_1.Source({
                name: 'internalModule.js',
                path: 'a/b/c/d/internalModule.js',
                sourceReference: 10,
            }, 'aDebugSessionId', mockDebugModel_1.mockUriIdentityService, new log_1.NullLogService());
            const stackFrame = new class extends debugModel_1.StackFrame {
                getScopes() {
                    return Promise.resolve([scope]);
                }
            }(thread, 1, firstSource, 'app.js', 'normal', { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 10 }, 1, true);
            const scope = new class extends debugModel_1.Scope {
                getChildren() {
                    return Promise.resolve([variableA]);
                }
            }(stackFrame, 1, 'local', 1, false, 10, 10);
            const variableA = new class extends debugModel_1.Variable {
                getChildren() {
                    return Promise.resolve([variableB]);
                }
            }(session, 1, scope, 2, 'A', 'A', undefined, 0, 0, undefined, {}, 'string');
            const variableB = new debugModel_1.Variable(session, 1, scope, 2, 'B', 'A.B', undefined, 0, 0, undefined, {}, 'string');
            assert.strictEqual(await (0, debugHover_1.findExpressionInStackFrame)(stackFrame, []), undefined);
            assert.strictEqual(await (0, debugHover_1.findExpressionInStackFrame)(stackFrame, ['A']), variableA);
            assert.strictEqual(await (0, debugHover_1.findExpressionInStackFrame)(stackFrame, ['doesNotExist', 'no']), undefined);
            assert.strictEqual(await (0, debugHover_1.findExpressionInStackFrame)(stackFrame, ['a']), undefined);
            assert.strictEqual(await (0, debugHover_1.findExpressionInStackFrame)(stackFrame, ['B']), undefined);
            assert.strictEqual(await (0, debugHover_1.findExpressionInStackFrame)(stackFrame, ['A', 'B']), variableB);
            assert.strictEqual(await (0, debugHover_1.findExpressionInStackFrame)(stackFrame, ['A', 'C']), undefined);
            // We do not search in expensive scopes
            scope.expensive = true;
            assert.strictEqual(await (0, debugHover_1.findExpressionInStackFrame)(stackFrame, ['A']), undefined);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdIb3Zlci50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvdGVzdC9icm93c2VyL2RlYnVnSG92ZXIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVloRyxLQUFLLENBQUMsZUFBZSxFQUFFLEdBQUcsRUFBRTtRQUMzQixJQUFJLFdBQTRCLENBQUM7UUFDakMsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztRQUNyQyxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxHQUFHLEVBQUU7WUFDYixXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsZ0NBQWdDLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDakQsTUFBTSxLQUFLLEdBQUcsSUFBQSxxQ0FBb0IsRUFBQyxXQUFXLENBQUMsQ0FBQztZQUNoRCxNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUEsa0NBQWlCLEVBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUUxRCxNQUFNLE1BQU0sR0FBRyxJQUFJLEtBQU0sU0FBUSxtQkFBTTtnQkFDdEIsWUFBWTtvQkFDM0IsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNyQixDQUFDO2FBQ0QsQ0FBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRTVCLE1BQU0sV0FBVyxHQUFHLElBQUksb0JBQU0sQ0FBQztnQkFDOUIsSUFBSSxFQUFFLG1CQUFtQjtnQkFDekIsSUFBSSxFQUFFLDJCQUEyQjtnQkFDakMsZUFBZSxFQUFFLEVBQUU7YUFDbkIsRUFBRSxpQkFBaUIsRUFBRSx1Q0FBc0IsRUFBRSxJQUFJLG9CQUFjLEVBQUUsQ0FBQyxDQUFD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