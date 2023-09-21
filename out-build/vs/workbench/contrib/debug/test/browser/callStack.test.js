/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "sinon", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/base/common/uuid", "vs/editor/common/core/range", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/log/common/log", "vs/workbench/contrib/debug/browser/callStackEditorContribution", "vs/workbench/contrib/debug/browser/callStackView", "vs/workbench/contrib/debug/browser/debugIcons", "vs/workbench/contrib/debug/browser/debugService", "vs/workbench/contrib/debug/browser/debugSession", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/common/debugSource", "vs/workbench/contrib/debug/test/browser/mockDebugModel", "vs/workbench/contrib/debug/test/common/mockDebug"], function (require, exports, assert, sinon, lifecycle_1, themables_1, uuid_1, range_1, testConfigurationService_1, instantiationServiceMock_1, log_1, callStackEditorContribution_1, callStackView_1, debugIcons_1, debugService_1, debugSession_1, debugModel_1, debugSource_1, mockDebugModel_1, mockDebug_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$vfc = void 0;
    const mockWorkspaceContextService = {
        getWorkspace: () => {
            return {
                folders: []
            };
        }
    };
    function $vfc(model, name = 'mockSession', options) {
        return new debugSession_1.$SRb((0, uuid_1.$4f)(), { resolved: { name, type: 'node', request: 'launch' }, unresolved: undefined }, undefined, model, options, {
            getViewModel() {
                return {
                    updateViews() {
                        // noop
                    }
                };
            }
        }, undefined, undefined, new testConfigurationService_1.$G0b({ debug: { console: { collapseIdenticalLines: true } } }), undefined, mockWorkspaceContextService, undefined, undefined, undefined, mockDebugModel_1.$tfc, new instantiationServiceMock_1.$L0b(), undefined, undefined, new log_1.$fj());
    }
    exports.$vfc = $vfc;
    function createTwoStackFrames(session) {
        const thread = new class extends debugModel_1.$NFb {
            getCallStack() {
                return [firstStackFrame, secondStackFrame];
            }
        }(session, 'mockthread', 1);
        const firstSource = new debugSource_1.$wF({
            name: 'internalModule.js',
            path: 'a/b/c/d/internalModule.js',
            sourceReference: 10,
        }, 'aDebugSessionId', mockDebugModel_1.$tfc, new log_1.$fj());
        const secondSource = new debugSource_1.$wF({
            name: 'internalModule.js',
            path: 'z/x/c/d/internalModule.js',
            sourceReference: 11,
        }, 'aDebugSessionId', mockDebugModel_1.$tfc, new log_1.$fj());
        const firstStackFrame = new debugModel_1.$MFb(thread, 0, firstSource, 'app.js', 'normal', { startLineNumber: 1, startColumn: 2, endLineNumber: 1, endColumn: 10 }, 0, true);
        const secondStackFrame = new debugModel_1.$MFb(thread, 1, secondSource, 'app2.js', 'normal', { startLineNumber: 1, startColumn: 2, endLineNumber: 1, endColumn: 10 }, 1, true);
        return { firstStackFrame, secondStackFrame };
    }
    suite('Debug - CallStack', () => {
        let model;
        let mockRawSession;
        let disposables;
        setup(() => {
            disposables = new lifecycle_1.$jc();
            model = (0, mockDebugModel_1.$ufc)(disposables);
            mockRawSession = new mockDebug_1.$qfc();
        });
        teardown(() => {
            disposables.dispose();
            sinon.restore();
        });
        // Threads
        test('threads simple', () => {
            const threadId = 1;
            const threadName = 'firstThread';
            const session = $vfc(model);
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
            const session = $vfc(model);
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
            const session = $vfc(model);
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
            const session = $vfc(model);
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
            const session = $vfc(model);
            disposables.add(session);
            model.addSession(session);
            const { firstStackFrame, secondStackFrame } = createTwoStackFrames(session);
            assert.strictEqual((0, callStackView_1.$iRb)(firstStackFrame), '.../b/c/d/internalModule.js');
            assert.strictEqual((0, callStackView_1.$iRb)(secondStackFrame), '.../x/c/d/internalModule.js');
        });
        test('stack frame toString()', () => {
            const session = $vfc(model);
            disposables.add(session);
            const thread = new debugModel_1.$NFb(session, 'mockthread', 1);
            const firstSource = new debugSource_1.$wF({
                name: 'internalModule.js',
                path: 'a/b/c/d/internalModule.js',
                sourceReference: 10,
            }, 'aDebugSessionId', mockDebugModel_1.$tfc, new log_1.$fj());
            const stackFrame = new debugModel_1.$MFb(thread, 1, firstSource, 'app', 'normal', { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 10 }, 1, true);
            assert.strictEqual(stackFrame.toString(), 'app (internalModule.js:1)');
            const secondSource = new debugSource_1.$wF(undefined, 'aDebugSessionId', mockDebugModel_1.$tfc, new log_1.$fj());
            const stackFrame2 = new debugModel_1.$MFb(thread, 2, secondSource, 'module', 'normal', { startLineNumber: undefined, startColumn: undefined, endLineNumber: undefined, endColumn: undefined }, 2, true);
            assert.strictEqual(stackFrame2.toString(), 'module');
        });
        test('debug child sessions are added in correct order', () => {
            const session = disposables.add($vfc(model));
            model.addSession(session);
            const secondSession = disposables.add($vfc(model, 'mockSession2'));
            model.addSession(secondSession);
            const firstChild = disposables.add($vfc(model, 'firstChild', { parentSession: session }));
            model.addSession(firstChild);
            const secondChild = disposables.add($vfc(model, 'secondChild', { parentSession: session }));
            model.addSession(secondChild);
            const thirdSession = disposables.add($vfc(model, 'mockSession3'));
            model.addSession(thirdSession);
            const anotherChild = disposables.add($vfc(model, 'secondChild', { parentSession: secondSession }));
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
            const session = $vfc(model);
            disposables.add(session);
            model.addSession(session);
            const { firstStackFrame, secondStackFrame } = createTwoStackFrames(session);
            let decorations = (0, callStackEditorContribution_1.$5Fb)(firstStackFrame, true, false);
            assert.strictEqual(decorations.length, 3);
            assert.deepStrictEqual(decorations[0].range, new range_1.$ks(1, 2, 1, 3));
            assert.strictEqual(decorations[0].options.glyphMarginClassName, themables_1.ThemeIcon.asClassName(debugIcons_1.$9mb));
            assert.deepStrictEqual(decorations[1].range, new range_1.$ks(1, 2, 1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */));
            assert.strictEqual(decorations[1].options.className, 'debug-top-stack-frame-line');
            assert.strictEqual(decorations[1].options.isWholeLine, true);
            decorations = (0, callStackEditorContribution_1.$5Fb)(secondStackFrame, true, false);
            assert.strictEqual(decorations.length, 2);
            assert.deepStrictEqual(decorations[0].range, new range_1.$ks(1, 2, 1, 3));
            assert.strictEqual(decorations[0].options.glyphMarginClassName, themables_1.ThemeIcon.asClassName(debugIcons_1.$0mb));
            assert.deepStrictEqual(decorations[1].range, new range_1.$ks(1, 2, 1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */));
            assert.strictEqual(decorations[1].options.className, 'debug-focused-stack-frame-line');
            assert.strictEqual(decorations[1].options.isWholeLine, true);
            decorations = (0, callStackEditorContribution_1.$5Fb)(firstStackFrame, true, false);
            assert.strictEqual(decorations.length, 3);
            assert.deepStrictEqual(decorations[0].range, new range_1.$ks(1, 2, 1, 3));
            assert.strictEqual(decorations[0].options.glyphMarginClassName, themables_1.ThemeIcon.asClassName(debugIcons_1.$9mb));
            assert.deepStrictEqual(decorations[1].range, new range_1.$ks(1, 2, 1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */));
            assert.strictEqual(decorations[1].options.className, 'debug-top-stack-frame-line');
            assert.strictEqual(decorations[1].options.isWholeLine, true);
            // Inline decoration gets rendered in this case
            assert.strictEqual(decorations[2].options.before?.inlineClassName, 'debug-top-stack-frame-column');
            assert.deepStrictEqual(decorations[2].range, new range_1.$ks(1, 2, 1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */));
        });
        test('contexts', () => {
            const session = $vfc(model);
            disposables.add(session);
            model.addSession(session);
            const { firstStackFrame, secondStackFrame } = createTwoStackFrames(session);
            let context = (0, callStackView_1.$gRb)(firstStackFrame);
            assert.strictEqual(context.sessionId, firstStackFrame.thread.session.getId());
            assert.strictEqual(context.threadId, firstStackFrame.thread.getId());
            assert.strictEqual(context.frameId, firstStackFrame.getId());
            context = (0, callStackView_1.$gRb)(secondStackFrame.thread);
            assert.strictEqual(context.sessionId, secondStackFrame.thread.session.getId());
            assert.strictEqual(context.threadId, secondStackFrame.thread.getId());
            assert.strictEqual(context.frameId, undefined);
            context = (0, callStackView_1.$gRb)(session);
            assert.strictEqual(context.sessionId, session.getId());
            assert.strictEqual(context.threadId, undefined);
            assert.strictEqual(context.frameId, undefined);
            let contributedContext = (0, callStackView_1.$hRb)(firstStackFrame);
            assert.strictEqual(contributedContext, firstStackFrame.source.raw.path);
            contributedContext = (0, callStackView_1.$hRb)(firstStackFrame.thread);
            assert.strictEqual(contributedContext, firstStackFrame.thread.threadId);
            contributedContext = (0, callStackView_1.$hRb)(session);
            assert.strictEqual(contributedContext, session.getId());
        });
        test('focusStackFrameThreadAndSession', () => {
            const threadId1 = 1;
            const threadName1 = 'firstThread';
            const threadId2 = 2;
            const threadName2 = 'secondThread';
            const stoppedReason = 'breakpoint';
            // Add the threads
            const session = new class extends debugSession_1.$SRb {
                get state() {
                    return 2 /* State.Stopped */;
                }
            }((0, uuid_1.$4f)(), { resolved: { name: 'stoppedSession', type: 'node', request: 'launch' }, unresolved: undefined }, undefined, model, undefined, undefined, undefined, undefined, undefined, undefined, mockWorkspaceContextService, undefined, undefined, undefined, mockDebugModel_1.$tfc, new instantiationServiceMock_1.$L0b(), undefined, undefined, new log_1.$fj());
            disposables.add(session);
            const runningSession = $vfc(model);
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
            let toFocus = (0, debugService_1.$XRb)(model, undefined);
            // Verify stopped session and stopped thread get focused
            assert.deepStrictEqual(toFocus, { stackFrame: undefined, thread: thread, session: session });
            toFocus = (0, debugService_1.$XRb)(model, undefined, undefined, runningSession);
            assert.deepStrictEqual(toFocus, { stackFrame: undefined, thread: undefined, session: runningSession });
            toFocus = (0, debugService_1.$XRb)(model, undefined, thread);
            assert.deepStrictEqual(toFocus, { stackFrame: undefined, thread: thread, session: session });
            toFocus = (0, debugService_1.$XRb)(model, undefined, runningThread);
            assert.deepStrictEqual(toFocus, { stackFrame: undefined, thread: runningThread, session: session });
            const stackFrame = new debugModel_1.$MFb(thread, 5, undefined, 'stackframename2', undefined, undefined, 1, true);
            toFocus = (0, debugService_1.$XRb)(model, stackFrame);
            assert.deepStrictEqual(toFocus, { stackFrame: stackFrame, thread: thread, session: session });
        });
    });
});
//# sourceMappingURL=callStack.test.js.map