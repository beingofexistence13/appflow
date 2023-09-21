/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/mock", "vs/base/test/common/utils", "vs/workbench/contrib/debug/browser/rawDebugSession", "vs/workbench/contrib/debug/test/common/mockDebug"], function (require, exports, assert, lifecycle_1, mock_1, utils_1, rawDebugSession_1, mockDebug_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('RawDebugSession', () => {
        let disposables;
        setup(() => {
            disposables = new lifecycle_1.$jc();
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.$bT)();
        function createTestObjects() {
            const debugAdapter = new mockDebug_1.$rfc();
            const dbgr = (0, mock_1.$sT)()({
                type: 'mock-debug'
            });
            const session = new rawDebugSession_1.$RRb(debugAdapter, dbgr, 'sessionId', 'name', new ((0, mock_1.$rT)()), new ((0, mock_1.$rT)()), new ((0, mock_1.$rT)()), new ((0, mock_1.$rT)()));
            disposables.add(session);
            disposables.add(debugAdapter);
            return { debugAdapter, dbgr };
        }
        test('handles startDebugging request success', async () => {
            const { debugAdapter, dbgr } = createTestObjects();
            dbgr.startDebugging.returns(Promise.resolve(true));
            debugAdapter.sendRequestBody('startDebugging', {
                request: 'launch',
                configuration: {
                    type: 'some-other-type'
                }
            });
            const response = await debugAdapter.waitForResponseFromClient('startDebugging');
            assert.strictEqual(response.command, 'startDebugging');
            assert.strictEqual(response.success, true);
        });
        test('handles startDebugging request failure', async () => {
            const { debugAdapter, dbgr } = createTestObjects();
            dbgr.startDebugging.returns(Promise.resolve(false));
            debugAdapter.sendRequestBody('startDebugging', {
                request: 'launch',
                configuration: {
                    type: 'some-other-type'
                }
            });
            const response = await debugAdapter.waitForResponseFromClient('startDebugging');
            assert.strictEqual(response.command, 'startDebugging');
            assert.strictEqual(response.success, false);
        });
    });
});
//# sourceMappingURL=rawDebugSession.test.js.map