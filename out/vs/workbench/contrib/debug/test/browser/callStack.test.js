/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "sinon", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/base/common/uuid", "vs/editor/common/core/range", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/log/common/log", "vs/workbench/contrib/debug/browser/callStackEditorContribution", "vs/workbench/contrib/debug/browser/callStackView", "vs/workbench/contrib/debug/browser/debugIcons", "vs/workbench/contrib/debug/browser/debugService", "vs/workbench/contrib/debug/browser/debugSession", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/common/debugSource", "vs/workbench/contrib/debug/test/browser/mockDebugModel", "vs/workbench/contrib/debug/test/common/mockDebug"], function (require, exports, assert, sinon, lifecycle_1, themables_1, uuid_1, range_1, testConfigurationService_1, instantiationServiceMock_1, log_1, callStackEditorContribution_1, callStackView_1, debugIcons_1, debugService_1, debugSession_1, debugModel_1, debugSource_1, mockDebugModel_1, mockDebug_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createTestSession = void 0;
    const mockWorkspaceContextService = {
        getWorkspace: () => {
            return {
                folders: []
            };
        }
    };
    function createTestSession(model, name = 'mockSession', options) {
        return new debugSession_1.DebugSession((0, uuid_1.generateUuid)(), { resolved: { name, type: 'node', request: 'launch' }, unresolved: undefined }, undefined, model, options, {
            getViewModel() {
                return {
                    updateViews() {
                        // noop
                    }
                };
            }
        }, undefined, undefined, new testConfigurationService_1.TestConfigurationService({ debug: { console: { collapseIdenticalLines: true } } }), undefined, mockWorkspaceContextService, undefined, undefined, undefined, mockDebugModel_1.mockUriIdentityService, new instantiationServiceMock_1.TestInstantiationService(), undefined, undefined, new log_1.NullLogService());
    }
    exports.createTestSession = createTestSession;
    function createTwoStackFrames(session) {
        const thread = new class extends debugModel_1.Thread {
            getCallStack() {
                return [firstStackFrame, secondStackFrame];
            }
        }(session, 'mockthread', 1);
        const firstSource = new debugSource_1.Source({
            name: 'internalModule.js',
            path: 'a/b/c/d/internalModule.js',
            sourceReference: 10,
        }, 'aDebugSessionId', mockDebugModel_1.mockUriIdentityService, new log_1.NullLogService());
        const secondSource = new debugSource_1.Source({
            name: 'internalModule.js',
            path: 'z/x/c/d/internalModule.js',
            sourceReference: 11,
        }, 'aDebugSessionId', mockDebugModel_1.mockUriIdentityService, new log_1.NullLogService());
        const firstStackFrame = new debugModel_1.StackFrame(thread, 0, firstSource, 'app.js', 'normal', { startLineNumber: 1, startColumn: 2, endLineNumber: 1, endColumn: 10 }, 0, true);
        const secondStackFrame = new debugModel_1.StackFrame(thread, 1, secondSource, 'app2.js', 'normal', { startLineNumber: 1, startColumn: 2, endLineNumber: 1, endColumn: 10 }, 1, true);
        return { firstStackFrame, secondStackFrame };
    }
    suite('Debug - CallStack', () => {
        let model;
        let mockRawSession;
        let disposables;
        setup(() => {
            disposables = new lifecycle_1.DisposableStore();
            model = (0, mockDebugModel_1.createMockDebugModel)(disposables);
            mockRawSession = new mockDebug_1.MockRawSession();
        });
        teardown(() => {
            disposables.dispose();
            sinon.restore();
        });
        // Threads
        test('threads simple', () => {
            const threadId = 1;
            const threadName = 'firstThread';
            const session = createTestSession(model);
            disposables.add(session);
            model.addSession(session);
            assert.strictEqual(model.getSessions(true).length, 1);
            model.rawUpdate({
                sessionId: session.getId(),
                threads: [{
                        id: threadId,
                        name: threadName
                    }]
            });
            assert.strictEqual(session.getThread(threadId).name, threadName);
            model.clearThreads(session.getId(), true);
            assert.strictEqual(session.getThread(threadId), undefined);
            assert.strictEqual(model.getSessions(true).length, 1);
        });
        test('threads multiple with allThreadsStopped', async () => {
            const threadId1 = 1;
            const threadName1 = 'firstThread';
            const threadId2 = 2;
            const threadName2 = 'secondThread';
            const stoppedReason = 'breakpoint';
            // Add the threads
            const session = createTestSession(model);
            disposables.add(session);
            model.addSession(session);
            session['raw'] = mockRawSession;
            model.rawUpdate({
                sessionId: session.getId(),
                threads: [{
                        id: threadId1,
                        name: threadName1
                    }]
            });
            // Stopped event with all threads stopped
            model.rawUpdate({
                sessionId: session.getId(),
                threads: [{
                        id: threadId1,
                        name: threadName1
                    }, {
                        id: threadId2,
                        name: threadName2
                    }],
                stoppedDetails: {
                    reason: stoppedReason,
                    threadId: 1,
                    allThreadsStopped: true
                },
            });
            const thread1 = session.getThread(threadId1);
            const thread2 = session.getThread(threadId2);
            // at the beginning, callstacks are obtainable but not available
            assert.strictEqual(session.getAllThreads().length, 2);
            assert.strictEqual(thread1.name, threadName1);
            assert.strictEqual(thread1.stopped, true);
            assert.strictEqual(thread1.getCallStack().length, 0);
            assert.strictEqual(thread1.stoppedDetails.reason, stoppedReason);
            assert.strictEqual(thread2.name, threadName2);
            assert.strictEqual(thread2.stopped, true);
            assert.strictEqual(thread2.getCallStack().length, 0);
            assert.strictEqual(thread2.stoppedDetails.reason, undefined);
            // after calling getCallStack, the callstack becomes available
            // and results in a request for the callstack in the debug adapter
            await thread1.fetchCallStack();
            assert.notStrictEqual(thread1.getCallStack().length, 0);
            await thread2.fetchCallStack();
            assert.notStrictEqual(thread2.getCallStack().length, 0);
            // calling multiple times getCallStack doesn't result in multiple calls
            // to the debug adapter
            await thread1.fetchCallStack();
            await thread2.fetchCallStack();
            // clearing the callstack results in the callstack not being available
            thread1.clearCallStack();
            assert.strictEqual(thread1.stopped, true);
            assert.strictEqual(thread1.getCallStack().length, 0);
            thread2.clearCallStack();
            assert.strictEqual(thread2.stopped, true);
            assert.strictEqual(thread2.getCallStack().length, 0);
            model.clearThreads(session.getId(), true);
            assert.strictEqual(session.getThread(threadId1), undefined);
            assert.strictEqual(session.getThread(threadId2), undefined);
            assert.strictEqual(session.getAllThreads().length, 0);
        });
        test('allThreadsStopped in multiple events', async () => {
            const threadId1 = 1;
            const threadName1 = 'firstThread';
            const threadId2 = 2;
            const threadName2 = 'secondThread';
            const stoppedReason = 'breakpoint';
            // Add the threads
            const session = createTestSession(model);
            disposables.add(session);
            model.addSession(session);
            session['raw'] = mockRawSession;
            // Stopped event with all threads stopped
            model.rawUpdate({
                sessionId: session.getId(),
                threads: [{
                        id: threadId1,
                        name: threadName1
                    }, {
                        id: threadId2,
                        name: threadName2
                    }],
                stoppedDetails: {
                    reason: stoppedReason,
                    threadId: threadId1,
                    allThreadsStopped: true
                },
            });
            model.rawUpdate({
                sessionId: session.getId(),
                threads: [{
                        id: threadId1,
                        name: threadName1
                    }, {
                        id: threadId2,
                        name: threadName2
                    }],
                stoppedDetails: {
                    reason: stoppedReason,
                    threadId: threadId2,
                    allThreadsStopped: true
                },
            });
            const thread1 = session.getThread(threadId1);
            const thread2 = session.getThread(threadId2);
            assert.strictEqual(thread1.stoppedDetails?.reason, stoppedReason);
            assert.strictEqual(thread2.stoppedDetails?.reason, stoppedReason);
        });
        test('threads multiple without allThreadsStopped', async () => {
            const sessionStub = sinon.spy(mockRawSession, 'stackTrace');
            const stoppedThreadId = 1;
            const stoppedThreadName = 'stoppedThread';
            const runningThreadId = 2;
            const runningThreadName = 'runningThread';
            const stoppedReason = 'breakpoint';
            const session = createTestSession(model);
            disposables.add(session);
            model.addSession(session);
            session['raw'] = mockRawSession;
            // Add the threads
            model.rawUpdate({
                sessionId: session.getId(),
                threads: [{
                        id: stoppedThreadId,
                        name: stoppedThreadName
                    }]
            });
            // Stopped event with only one thread stopped
            model.rawUpdate({
                sessionId: session.getId(),
                threads: [{
                        id: 1,
                        name: stoppedThreadName
                    }, {
                        id: runningThreadId,
                        name: runningThreadName
                    }],
                stoppedDetails: {
                    reason: stoppedReason,
                    threadId: 1,
                    allThreadsStopped: false
                }
            });
            const stoppedThread = session.getThread(stoppedThreadId);
            const runningThread = session.getThread(runningThreadId);
            // the callstack for the stopped thread is obtainable but not available
            // the callstack for the running thread is not obtainable nor available
            assert.strictEqual(stoppedThread.name, stoppedThreadName);
            assert.strictEqual(stoppedThread.stopped, true);
            assert.strictEqual(session.getAllThreads().length, 2);
            assert.strictEqual(stoppedThread.getCallStack().length, 0);
            assert.strictEqual(stoppedThread.stoppedDetails.reason, stoppedReason);
            assert.strictEqual(runningThread.name, runningThreadName);
            assert.strictEqual(runningThread.stopped, false);
            assert.strictEqual(runningThread.getCallStack().length, 0);
            assert.strictEqual(runningThread.stoppedDetails, undefined);
            // after calling getCallStack, the callstack becomes available
            // and results in a request for the callstack in the debug adapter
            await stoppedThread.fetchCallStack();
            assert.notStrictEqual(stoppedThread.getCallStack().length, 0);
            assert.strictEqual(runningThread.getCallStack().length, 0);
            assert.strictEqual(sessionStub.callCount, 1);
            // calling getCallStack on the running thread returns empty array
            // and does not return in a request for the callstack in the debug
            // adapter
            await runningThread.fetchCallStack();
            assert.strictEqual(runningThread.getCallStack().length, 0);
            assert.strictEqual(sessionStub.callCount, 1);
            // clearing the callstack results in the callstack not being available
            stoppedThread.clearCallStack();
            assert.strictEqual(stoppedThread.stopped, true);
            assert.strictEqual(stoppedThread.getCallStack().length, 0);
            model.clearThreads(session.getId(), true);
            assert.strictEqual(session.getThread(stoppedThreadId), undefined);
            assert.strictEqual(session.getThread(runningThreadId), undefined);
            assert.strictEqual(session.getAllThreads().length, 0);
        });
        test('stack frame get specific source name', () => {
            const session = createTestSession(model);
            disposables.add(session);
            model.addSession(session);
            const { firstStackFrame, secondStackFrame } = createTwoStackFrames(session);
            assert.strictEqual((0, callStackView_1.getSpecificSourceName)(firstStackFrame), '.../b/c/d/internalModule.js');
            assert.strictEqual((0, callStackView_1.getSpecificSourceName)(secondStackFrame), '.../x/c/d/internalModule.js');
        });
        test('stack frame toString()', () => {
            const session = createTestSession(model);
            disposables.add(session);
            const thread = new debugModel_1.Thread(session, 'mockthread', 1);
            const firstSource = new debugSource_1.Source({
                name: 'internalModule.js',
                path: 'a/b/c/d/internalModule.js',
                sourceReference: 10,
            }, 'aDebugSessionId', mockDebugModel_1.mockUriIdentityService, new log_1.NullLogService());
            const stackFrame = new debugModel_1.StackFrame(thread, 1, firstSource, 'app', 'normal', { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 10 }, 1, true);
            assert.strictEqual(stackFrame.toString(), 'app (internalModule.js:1)');
            const secondSource = new debugSource_1.Source(undefined, 'aDebugSessionId', mockDebugModel_1.mockUriIdentityService, new log_1.NullLogService());
            const stackFrame2 = new debugModel_1.StackFrame(thread, 2, secondSource, 'module', 'normal', { startLineNumber: undefined, startColumn: undefined, endLineNumber: undefined, endColumn: undefined }, 2, true);
            assert.strictEqual(stackFrame2.toString(), 'module');
        });
        test('debug child sessions are added in correct order', () => {
            const session = disposables.add(createTestSession(model));
            model.addSession(session);
            const secondSession = disposables.add(createTestSession(model, 'mockSession2'));
            model.addSession(secondSession);
            const firstChild = disposables.add(createTestSession(model, 'firstChild', { parentSession: session }));
            model.addSession(firstChild);
            const secondChild = disposables.add(createTestSession(model, 'secondChild', { parentSession: session }));
            model.addSession(secondChild);
            const thirdSession = disposables.add(createTestSession(model, 'mockSession3'));
            model.addSession(thirdSession);
            const anotherChild = disposables.add(createTestSession(model, 'secondChild', { parentSession: secondSession }));
            model.addSession(anotherChild);
            const sessions = model.getSessions();
            assert.strictEqual(sessions[0].getId(), session.getId());
            assert.strictEqual(sessions[1].getId(), firstChild.getId());
            assert.strictEqual(sessions[2].getId(), secondChild.getId());
            assert.strictEqual(sessions[3].getId(), secondSession.getId());
            assert.strictEqual(sessions[4].getId(), anotherChild.getId());
            assert.strictEqual(sessions[5].getId(), thirdSession.getId());
        });
        test('decorations', () => {
            const session = createTestSession(model);
            disposables.add(session);
            model.addSession(session);
            const { firstStackFrame, secondStackFrame } = createTwoStackFrames(session);
            let decorations = (0, callStackEditorContribution_1.createDecorationsForStackFrame)(firstStackFrame, true, false);
            assert.strictEqual(decorations.length, 3);
            assert.deepStrictEqual(decorations[0].range, new range_1.Range(1, 2, 1, 3));
            assert.strictEqual(decorations[0].options.glyphMarginClassName, themables_1.ThemeIcon.asClassName(debugIcons_1.debugStackframe));
            assert.deepStrictEqual(decorations[1].range, new range_1.Range(1, 2, 1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */));
            assert.strictEqual(decorations[1].options.className, 'debug-top-stack-frame-line');
            assert.strictEqual(decorations[1].options.isWholeLine, true);
            decorations = (0, callStackEditorContribution_1.createDecorationsForStackFrame)(secondStackFrame, true, false);
            assert.strictEqual(decorations.length, 2);
            assert.deepStrictEqual(decorations[0].range, new range_1.Range(1, 2, 1, 3));
            assert.strictEqual(decorations[0].options.glyphMarginClassName, themables_1.ThemeIcon.asClassName(debugIcons_1.debugStackframeFocused));
            assert.deepStrictEqual(decorations[1].range, new range_1.Range(1, 2, 1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */));
            assert.strictEqual(decorations[1].options.className, 'debug-focused-stack-frame-line');
            assert.strictEqual(decorations[1].options.isWholeLine, true);
            decorations = (0, callStackEditorContribution_1.createDecorationsForStackFrame)(firstStackFrame, true, false);
            assert.strictEqual(decorations.length, 3);
            assert.deepStrictEqual(decorations[0].range, new range_1.Range(1, 2, 1, 3));
            assert.strictEqual(decorations[0].options.glyphMarginClassName, themables_1.ThemeIcon.asClassName(debugIcons_1.debugStackframe));
            assert.deepStrictEqual(decorations[1].range, new range_1.Range(1, 2, 1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */));
            assert.strictEqual(decorations[1].options.className, 'debug-top-stack-frame-line');
            assert.strictEqual(decorations[1].options.isWholeLine, true);
            // Inline decoration gets rendered in this case
            assert.strictEqual(decorations[2].options.before?.inlineClassName, 'debug-top-stack-frame-column');
            assert.deepStrictEqual(decorations[2].range, new range_1.Range(1, 2, 1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */));
        });
        test('contexts', () => {
            const session = createTestSession(model);
            disposables.add(session);
            model.addSession(session);
            const { firstStackFrame, secondStackFrame } = createTwoStackFrames(session);
            let context = (0, callStackView_1.getContext)(firstStackFrame);
            assert.strictEqual(context.sessionId, firstStackFrame.thread.session.getId());
            assert.strictEqual(context.threadId, firstStackFrame.thread.getId());
            assert.strictEqual(context.frameId, firstStackFrame.getId());
            context = (0, callStackView_1.getContext)(secondStackFrame.thread);
            assert.strictEqual(context.sessionId, secondStackFrame.thread.session.getId());
            assert.strictEqual(context.threadId, secondStackFrame.thread.getId());
            assert.strictEqual(context.frameId, undefined);
            context = (0, callStackView_1.getContext)(session);
            assert.strictEqual(context.sessionId, session.getId());
            assert.strictEqual(context.threadId, undefined);
            assert.strictEqual(context.frameId, undefined);
            let contributedContext = (0, callStackView_1.getContextForContributedActions)(firstStackFrame);
            assert.strictEqual(contributedContext, firstStackFrame.source.raw.path);
            contributedContext = (0, callStackView_1.getContextForContributedActions)(firstStackFrame.thread);
            assert.strictEqual(contributedContext, firstStackFrame.thread.threadId);
            contributedContext = (0, callStackView_1.getContextForContributedActions)(session);
            assert.strictEqual(contributedContext, session.getId());
        });
        test('focusStackFrameThreadAndSession', () => {
            const threadId1 = 1;
            const threadName1 = 'firstThread';
            const threadId2 = 2;
            const threadName2 = 'secondThread';
            const stoppedReason = 'breakpoint';
            // Add the threads
            const session = new class extends debugSession_1.DebugSession {
                get state() {
                    return 2 /* State.Stopped */;
                }
            }((0, uuid_1.generateUuid)(), { resolved: { name: 'stoppedSession', type: 'node', request: 'launch' }, unresolved: undefined }, undefined, model, undefined, undefined, undefined, undefined, undefined, undefined, mockWorkspaceContextService, undefined, undefined, undefined, mockDebugModel_1.mockUriIdentityService, new instantiationServiceMock_1.TestInstantiationService(), undefined, undefined, new log_1.NullLogService());
            disposables.add(session);
            const runningSession = createTestSession(model);
            disposables.add(runningSession);
            model.addSession(runningSession);
            model.addSession(session);
            session['raw'] = mockRawSession;
            model.rawUpdate({
                sessionId: session.getId(),
                threads: [{
                        id: threadId1,
                        name: threadName1
                    }]
            });
            // Stopped event with all threads stopped
            model.rawUpdate({
                sessionId: session.getId(),
                threads: [{
                        id: threadId1,
                        name: threadName1
                    }, {
                        id: threadId2,
                        name: threadName2
                    }],
                stoppedDetails: {
                    reason: stoppedReason,
                    threadId: 1,
                    allThreadsStopped: true
                },
            });
            const thread = session.getThread(threadId1);
            const runningThread = session.getThread(threadId2);
            let toFocus = (0, debugService_1.getStackFrameThreadAndSessionToFocus)(model, undefined);
            // Verify stopped session and stopped thread get focused
            assert.deepStrictEqual(toFocus, { stackFrame: undefined, thread: thread, session: session });
            toFocus = (0, debugService_1.getStackFrameThreadAndSessionToFocus)(model, undefined, undefined, runningSession);
            assert.deepStrictEqual(toFocus, { stackFrame: undefined, thread: undefined, session: runningSession });
            toFocus = (0, debugService_1.getStackFrameThreadAndSessionToFocus)(model, undefined, thread);
            assert.deepStrictEqual(toFocus, { stackFrame: undefined, thread: thread, session: session });
            toFocus = (0, debugService_1.getStackFrameThreadAndSessionToFocus)(model, undefined, runningThread);
            assert.deepStrictEqual(toFocus, { stackFrame: undefined, thread: runningThread, session: session });
            const stackFrame = new debugModel_1.StackFrame(thread, 5, undefined, 'stackframename2', undefined, undefined, 1, true);
            toFocus = (0, debugService_1.getStackFrameThreadAndSessionToFocus)(model, stackFrame);
            assert.deepStrictEqual(toFocus, { stackFrame: stackFrame, thread: thread, session: session });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsbFN0YWNrLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9kZWJ1Zy90ZXN0L2Jyb3dzZXIvY2FsbFN0YWNrLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBdUJoRyxNQUFNLDJCQUEyQixHQUFHO1FBQ25DLFlBQVksRUFBRSxHQUFHLEVBQUU7WUFDbEIsT0FBTztnQkFDTixPQUFPLEVBQUUsRUFBRTthQUNYLENBQUM7UUFDSCxDQUFDO0tBQ00sQ0FBQztJQUVULFNBQWdCLGlCQUFpQixDQUFDLEtBQWlCLEVBQUUsSUFBSSxHQUFHLGFBQWEsRUFBRSxPQUE4QjtRQUN4RyxPQUFPLElBQUksMkJBQVksQ0FBQyxJQUFBLG1CQUFZLEdBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLEVBQUUsU0FBVSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUU7WUFDbkosWUFBWTtnQkFDWCxPQUFPO29CQUNOLFdBQVc7d0JBQ1YsT0FBTztvQkFDUixDQUFDO2lCQUNELENBQUM7WUFDSCxDQUFDO1NBQ2dCLEVBQUUsU0FBVSxFQUFFLFNBQVUsRUFBRSxJQUFJLG1EQUF3QixDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsc0JBQXNCLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsU0FBVSxFQUFFLDJCQUEyQixFQUFFLFNBQVUsRUFBRSxTQUFVLEVBQUUsU0FBVSxFQUFFLHVDQUFzQixFQUFFLElBQUksbURBQXdCLEVBQUUsRUFBRSxTQUFVLEVBQUUsU0FBVSxFQUFFLElBQUksb0JBQWMsRUFBRSxDQUFDLENBQUM7SUFDeFQsQ0FBQztJQVZELDhD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