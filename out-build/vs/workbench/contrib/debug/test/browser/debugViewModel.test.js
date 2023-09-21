/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/log/common/log", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/common/debugSource", "vs/workbench/contrib/debug/common/debugViewModel", "vs/workbench/contrib/debug/test/browser/mockDebugModel", "vs/workbench/contrib/debug/test/common/mockDebug"], function (require, exports, assert, utils_1, mockKeybindingService_1, log_1, debugModel_1, debugSource_1, debugViewModel_1, mockDebugModel_1, mockDebug_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Debug - View Model', () => {
        let model;
        setup(() => {
            model = new debugViewModel_1.$VRb(new mockKeybindingService_1.$S0b());
        });
        (0, utils_1.$bT)();
        test('focused stack frame', () => {
            assert.strictEqual(model.focusedStackFrame, undefined);
            assert.strictEqual(model.focusedThread, undefined);
            const session = new mockDebug_1.$pfc();
            const thread = new debugModel_1.$NFb(session, 'myThread', 1);
            const source = new debugSource_1.$wF({
                name: 'internalModule.js',
                sourceReference: 11,
                presentationHint: 'deemphasize'
            }, 'aDebugSessionId', mockDebugModel_1.$tfc, new log_1.$fj());
            const frame = new debugModel_1.$MFb(thread, 1, source, 'app.js', 'normal', { startColumn: 1, startLineNumber: 1, endColumn: 1, endLineNumber: 1 }, 0, true);
            model.setFocus(frame, thread, session, false);
            assert.strictEqual(model.focusedStackFrame.getId(), frame.getId());
            assert.strictEqual(model.focusedThread.threadId, 1);
            assert.strictEqual(model.focusedSession.getId(), session.getId());
        });
        test('selected expression', () => {
            assert.strictEqual(model.getSelectedExpression(), undefined);
            const expression = new debugModel_1.$IFb('my expression');
            model.setSelectedExpression(expression, false);
            assert.strictEqual(model.getSelectedExpression()?.expression, expression);
        });
        test('multi session view and changed workbench state', () => {
            assert.strictEqual(model.isMultiSessionView(), false);
            model.setMultiSessionView(true);
            assert.strictEqual(model.isMultiSessionView(), true);
        });
    });
});
//# sourceMappingURL=debugViewModel.test.js.map