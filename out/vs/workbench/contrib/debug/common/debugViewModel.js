/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugUtils"], function (require, exports, event_1, debug_1, debugUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ViewModel = void 0;
    class ViewModel {
        constructor(contextKeyService) {
            this.contextKeyService = contextKeyService;
            this.firstSessionStart = true;
            this._onDidFocusSession = new event_1.Emitter();
            this._onDidFocusThread = new event_1.Emitter();
            this._onDidFocusStackFrame = new event_1.Emitter();
            this._onDidSelectExpression = new event_1.Emitter();
            this._onDidEvaluateLazyExpression = new event_1.Emitter();
            this._onWillUpdateViews = new event_1.Emitter();
            contextKeyService.bufferChangeEvents(() => {
                this.expressionSelectedContextKey = debug_1.CONTEXT_EXPRESSION_SELECTED.bindTo(contextKeyService);
                this.loadedScriptsSupportedContextKey = debug_1.CONTEXT_LOADED_SCRIPTS_SUPPORTED.bindTo(contextKeyService);
                this.stepBackSupportedContextKey = debug_1.CONTEXT_STEP_BACK_SUPPORTED.bindTo(contextKeyService);
                this.focusedSessionIsAttach = debug_1.CONTEXT_FOCUSED_SESSION_IS_ATTACH.bindTo(contextKeyService);
                this.restartFrameSupportedContextKey = debug_1.CONTEXT_RESTART_FRAME_SUPPORTED.bindTo(contextKeyService);
                this.stepIntoTargetsSupported = debug_1.CONTEXT_STEP_INTO_TARGETS_SUPPORTED.bindTo(contextKeyService);
                this.jumpToCursorSupported = debug_1.CONTEXT_JUMP_TO_CURSOR_SUPPORTED.bindTo(contextKeyService);
                this.setVariableSupported = debug_1.CONTEXT_SET_VARIABLE_SUPPORTED.bindTo(contextKeyService);
                this.setExpressionSupported = debug_1.CONTEXT_SET_EXPRESSION_SUPPORTED.bindTo(contextKeyService);
                this.multiSessionDebug = debug_1.CONTEXT_MULTI_SESSION_DEBUG.bindTo(contextKeyService);
                this.terminateDebuggeeSupported = debug_1.CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED.bindTo(contextKeyService);
                this.suspendDebuggeeSupported = debug_1.CONTEXT_SUSPEND_DEBUGGEE_SUPPORTED.bindTo(contextKeyService);
                this.disassembleRequestSupported = debug_1.CONTEXT_DISASSEMBLE_REQUEST_SUPPORTED.bindTo(contextKeyService);
                this.focusedStackFrameHasInstructionPointerReference = debug_1.CONTEXT_FOCUSED_STACK_FRAME_HAS_INSTRUCTION_POINTER_REFERENCE.bindTo(contextKeyService);
            });
        }
        getId() {
            return 'root';
        }
        get focusedSession() {
            return this._focusedSession;
        }
        get focusedThread() {
            return this._focusedThread;
        }
        get focusedStackFrame() {
            return this._focusedStackFrame;
        }
        setFocus(stackFrame, thread, session, explicit) {
            const shouldEmitForStackFrame = this._focusedStackFrame !== stackFrame;
            const shouldEmitForSession = this._focusedSession !== session;
            const shouldEmitForThread = this._focusedThread !== thread;
            this._focusedStackFrame = stackFrame;
            this._focusedThread = thread;
            this._focusedSession = session;
            this.contextKeyService.bufferChangeEvents(() => {
                this.loadedScriptsSupportedContextKey.set(session ? !!session.capabilities.supportsLoadedSourcesRequest : false);
                this.stepBackSupportedContextKey.set(session ? !!session.capabilities.supportsStepBack : false);
                this.restartFrameSupportedContextKey.set(session ? !!session.capabilities.supportsRestartFrame : false);
                this.stepIntoTargetsSupported.set(session ? !!session.capabilities.supportsStepInTargetsRequest : false);
                this.jumpToCursorSupported.set(session ? !!session.capabilities.supportsGotoTargetsRequest : false);
                this.setVariableSupported.set(session ? !!session.capabilities.supportsSetVariable : false);
                this.setExpressionSupported.set(session ? !!session.capabilities.supportsSetExpression : false);
                this.terminateDebuggeeSupported.set(session ? !!session.capabilities.supportTerminateDebuggee : false);
                this.suspendDebuggeeSupported.set(session ? !!session.capabilities.supportSuspendDebuggee : false);
                this.disassembleRequestSupported.set(!!session?.capabilities.supportsDisassembleRequest);
                this.focusedStackFrameHasInstructionPointerReference.set(!!stackFrame?.instructionPointerReference);
                const attach = !!session && (0, debugUtils_1.isSessionAttach)(session);
                this.focusedSessionIsAttach.set(attach);
            });
            if (shouldEmitForSession) {
                this._onDidFocusSession.fire(session);
            }
            // should not call onDidFocusThread if onDidFocusStackFrame is called.
            if (shouldEmitForStackFrame) {
                this._onDidFocusStackFrame.fire({ stackFrame, explicit, session });
            }
            else if (shouldEmitForThread) {
                this._onDidFocusThread.fire({ thread, explicit, session });
            }
        }
        get onDidFocusSession() {
            return this._onDidFocusSession.event;
        }
        get onDidFocusThread() {
            return this._onDidFocusThread.event;
        }
        get onDidFocusStackFrame() {
            return this._onDidFocusStackFrame.event;
        }
        getSelectedExpression() {
            return this.selectedExpression;
        }
        setSelectedExpression(expression, settingWatch) {
            this.selectedExpression = expression ? { expression, settingWatch: settingWatch } : undefined;
            this.expressionSelectedContextKey.set(!!expression);
            this._onDidSelectExpression.fire(this.selectedExpression);
        }
        get onDidSelectExpression() {
            return this._onDidSelectExpression.event;
        }
        get onDidEvaluateLazyExpression() {
            return this._onDidEvaluateLazyExpression.event;
        }
        updateViews() {
            this._onWillUpdateViews.fire();
        }
        get onWillUpdateViews() {
            return this._onWillUpdateViews.event;
        }
        isMultiSessionView() {
            return !!this.multiSessionDebug.get();
        }
        setMultiSessionView(isMultiSessionView) {
            this.multiSessionDebug.set(isMultiSessionView);
        }
        async evaluateLazyExpression(expression) {
            await expression.evaluateLazy();
            this._onDidEvaluateLazyExpression.fire(expression);
        }
    }
    exports.ViewModel = ViewModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdWaWV3TW9kZWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9kZWJ1Zy9jb21tb24vZGVidWdWaWV3TW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT2hHLE1BQWEsU0FBUztRQTZCckIsWUFBb0IsaUJBQXFDO1lBQXJDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUEzQnpELHNCQUFpQixHQUFHLElBQUksQ0FBQztZQU1SLHVCQUFrQixHQUFHLElBQUksZUFBTyxFQUE2QixDQUFDO1lBQzlELHNCQUFpQixHQUFHLElBQUksZUFBTyxFQUEwRixDQUFDO1lBQzFILDBCQUFxQixHQUFHLElBQUksZUFBTyxFQUFrRyxDQUFDO1lBQ3RJLDJCQUFzQixHQUFHLElBQUksZUFBTyxFQUFrRSxDQUFDO1lBQ3ZHLGlDQUE0QixHQUFHLElBQUksZUFBTyxFQUF3QixDQUFDO1lBQ25FLHVCQUFrQixHQUFHLElBQUksZUFBTyxFQUFRLENBQUM7WUFpQnpELGlCQUFpQixDQUFDLGtCQUFrQixDQUFDLEdBQUcsRUFBRTtnQkFDekMsSUFBSSxDQUFDLDRCQUE0QixHQUFHLG1DQUEyQixDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUMxRixJQUFJLENBQUMsZ0NBQWdDLEdBQUcsd0NBQWdDLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0JBQ25HLElBQUksQ0FBQywyQkFBMkIsR0FBRyxtQ0FBMkIsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztnQkFDekYsSUFBSSxDQUFDLHNCQUFzQixHQUFHLHlDQUFpQyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUMxRixJQUFJLENBQUMsK0JBQStCLEdBQUcsdUNBQStCLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENB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