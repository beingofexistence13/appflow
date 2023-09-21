/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/debug/browser/debugCommands", "vs/base/browser/ui/list/listWidget", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/list/browser/listService", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/extensions/common/extensions", "vs/editor/browser/editorBrowser", "vs/platform/actions/common/actions", "vs/workbench/services/editor/common/editorService", "vs/editor/common/editorContextKeys", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/debug/browser/breakpointsView", "vs/platform/notification/common/notification", "vs/platform/contextkey/common/contextkeys", "vs/workbench/common/contextkeys", "vs/platform/commands/common/commands", "vs/editor/common/services/textResourceConfiguration", "vs/platform/clipboard/common/clipboardService", "vs/platform/configuration/common/configuration", "vs/platform/quickinput/common/quickInput", "vs/workbench/common/views", "vs/base/common/objects", "vs/base/common/platform", "vs/workbench/contrib/debug/common/debugUtils", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/contrib/debug/common/loadedScriptsPicker", "vs/workbench/contrib/debug/browser/debugSessionPicker", "vs/workbench/contrib/files/common/files"], function (require, exports, nls, listWidget_1, keybindingsRegistry_1, listService_1, debug_1, debugModel_1, extensions_1, editorBrowser_1, actions_1, editorService_1, editorContextKeys_1, contextkey_1, breakpointsView_1, notification_1, contextkeys_1, contextkeys_2, commands_1, textResourceConfiguration_1, clipboardService_1, configuration_1, quickInput_1, views_1, objects_1, platform_1, debugUtils_1, panecomposite_1, loadedScriptsPicker_1, debugSessionPicker_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$bRb = exports.$aRb = exports.$_Qb = exports.$$Qb = exports.$0Qb = exports.$9Qb = exports.$8Qb = exports.$7Qb = exports.$6Qb = exports.$5Qb = exports.$4Qb = exports.$3Qb = exports.$2Qb = exports.$1Qb = exports.$ZQb = exports.$YQb = exports.$XQb = exports.$WQb = exports.$VQb = exports.$UQb = exports.$TQb = exports.$SQb = exports.$RQb = exports.$QQb = exports.$PQb = exports.$OQb = exports.$NQb = exports.$MQb = exports.$LQb = exports.$KQb = exports.$JQb = exports.$IQb = exports.$HQb = exports.$GQb = exports.$FQb = exports.$EQb = exports.$DQb = exports.$CQb = exports.$BQb = exports.$AQb = exports.$zQb = exports.$yQb = exports.$xQb = exports.$wQb = exports.$vQb = exports.$uQb = exports.$tQb = exports.$sQb = exports.$rQb = exports.$qQb = exports.$pQb = exports.$oQb = exports.$nQb = exports.$mQb = exports.$lQb = exports.$kQb = exports.$jQb = exports.$iQb = exports.$hQb = exports.$gQb = exports.$fQb = exports.$eQb = exports.$dQb = void 0;
    exports.$dQb = 'debug.addConfiguration';
    exports.$eQb = 'editor.debug.action.toggleInlineBreakpoint';
    exports.$fQb = 'debug.copyStackTrace';
    exports.$gQb = 'workbench.action.debug.reverseContinue';
    exports.$hQb = 'workbench.action.debug.stepBack';
    exports.$iQb = 'workbench.action.debug.restart';
    exports.$jQb = 'workbench.action.debug.terminateThread';
    exports.$kQb = 'workbench.action.debug.stepOver';
    exports.$lQb = 'workbench.action.debug.stepInto';
    exports.$mQb = 'workbench.action.debug.stepIntoTarget';
    exports.$nQb = 'workbench.action.debug.stepOut';
    exports.$oQb = 'workbench.action.debug.pause';
    exports.$pQb = 'workbench.action.debug.disconnect';
    exports.$qQb = 'workbench.action.debug.disconnectAndSuspend';
    exports.$rQb = 'workbench.action.debug.stop';
    exports.$sQb = 'workbench.action.debug.restartFrame';
    exports.$tQb = 'workbench.action.debug.continue';
    exports.$uQb = 'workbench.debug.action.focusRepl';
    exports.$vQb = 'debug.jumpToCursor';
    exports.$wQb = 'workbench.action.debug.focusProcess';
    exports.$xQb = 'workbench.action.debug.selectandstart';
    exports.$yQb = 'workbench.action.debug.selectDebugConsole';
    exports.$zQb = 'workbench.action.debug.selectDebugSession';
    exports.$AQb = 'workbench.action.debug.configure';
    exports.$BQb = 'workbench.action.debug.start';
    exports.$CQb = 'workbench.action.debug.run';
    exports.$DQb = 'debug.renameWatchExpression';
    exports.$EQb = 'debug.setWatchExpression';
    exports.$FQb = 'debug.removeWatchExpression';
    exports.$GQb = 'workbench.action.debug.nextConsole';
    exports.$HQb = 'workbench.action.debug.prevConsole';
    exports.$IQb = 'workbench.action.debug.showLoadedScripts';
    exports.$JQb = 'workbench.action.debug.callStackTop';
    exports.$KQb = 'workbench.action.debug.callStackBottom';
    exports.$LQb = 'workbench.action.debug.callStackUp';
    exports.$MQb = 'workbench.action.debug.callStackDown';
    exports.$NQb = { original: 'Debug', value: nls.localize(0, null) };
    exports.$OQb = { value: nls.localize(1, null), original: 'Restart' };
    exports.$PQb = { value: nls.localize(2, null), original: 'Step Over' };
    exports.$QQb = { value: nls.localize(3, null), original: 'Step Into' };
    exports.$RQb = { value: nls.localize(4, null), original: 'Step Into Target' };
    exports.$SQb = { value: nls.localize(5, null), original: 'Step Out' };
    exports.$TQb = { value: nls.localize(6, null), original: 'Pause' };
    exports.$UQb = { value: nls.localize(7, null), original: 'Disconnect' };
    exports.$VQb = { value: nls.localize(8, null), original: 'Disconnect and Suspend' };
    exports.$WQb = { value: nls.localize(9, null), original: 'Stop' };
    exports.$XQb = { value: nls.localize(10, null), original: 'Continue' };
    exports.$YQb = { value: nls.localize(11, null), original: 'Focus Session' };
    exports.$ZQb = { value: nls.localize(12, null), original: 'Select and Start Debugging' };
    exports.$1Qb = nls.localize(13, null, 'launch.json');
    exports.$2Qb = { value: nls.localize(14, null), original: 'Start Debugging' };
    exports.$3Qb = { value: nls.localize(15, null), original: 'Start Without Debugging' };
    exports.$4Qb = { value: nls.localize(16, null), original: 'Focus Next Debug Console' };
    exports.$5Qb = { value: nls.localize(17, null), original: 'Focus Previous Debug Console' };
    exports.$6Qb = { value: nls.localize(18, null), original: 'Open Loaded Script...' };
    exports.$7Qb = { value: nls.localize(19, null), original: 'Navigate to Top of Call Stack' };
    exports.$8Qb = { value: nls.localize(20, null), original: 'Navigate to Bottom of Call Stack' };
    exports.$9Qb = { value: nls.localize(21, null), original: 'Navigate Up Call Stack' };
    exports.$0Qb = { value: nls.localize(22, null), original: 'Navigate Down Call Stack' };
    exports.$$Qb = { value: nls.localize(23, null), original: 'Select Debug Console' };
    exports.$_Qb = { value: nls.localize(24, null), original: 'Select Debug Session' };
    exports.$aRb = 'debug ';
    exports.$bRb = 'debug consoles ';
    function isThreadContext(obj) {
        return obj && typeof obj.sessionId === 'string' && typeof obj.threadId === 'string';
    }
    async function getThreadAndRun(accessor, sessionAndThreadId, run) {
        const debugService = accessor.get(debug_1.$nH);
        let thread;
        if (isThreadContext(sessionAndThreadId)) {
            const session = debugService.getModel().getSession(sessionAndThreadId.sessionId);
            if (session) {
                thread = session.getAllThreads().find(t => t.getId() === sessionAndThreadId.threadId);
            }
        }
        else if (isSessionContext(sessionAndThreadId)) {
            const session = debugService.getModel().getSession(sessionAndThreadId.sessionId);
            if (session) {
                const threads = session.getAllThreads();
                thread = threads.length > 0 ? threads[0] : undefined;
            }
        }
        if (!thread) {
            thread = debugService.getViewModel().focusedThread;
            if (!thread) {
                const focusedSession = debugService.getViewModel().focusedSession;
                const threads = focusedSession ? focusedSession.getAllThreads() : undefined;
                thread = threads && threads.length ? threads[0] : undefined;
            }
        }
        if (thread) {
            await run(thread);
        }
    }
    function isStackFrameContext(obj) {
        return obj && typeof obj.sessionId === 'string' && typeof obj.threadId === 'string' && typeof obj.frameId === 'string';
    }
    function getFrame(debugService, context) {
        if (isStackFrameContext(context)) {
            const session = debugService.getModel().getSession(context.sessionId);
            if (session) {
                const thread = session.getAllThreads().find(t => t.getId() === context.threadId);
                if (thread) {
                    return thread.getCallStack().find(sf => sf.getId() === context.frameId);
                }
            }
        }
        else {
            return debugService.getViewModel().focusedStackFrame;
        }
        return undefined;
    }
    function isSessionContext(obj) {
        return obj && typeof obj.sessionId === 'string';
    }
    async function changeDebugConsoleFocus(accessor, next) {
        const debugService = accessor.get(debug_1.$nH);
        const viewsService = accessor.get(views_1.$$E);
        const sessions = debugService.getModel().getSessions(true).filter(s => s.hasSeparateRepl());
        let currSession = debugService.getViewModel().focusedSession;
        let nextIndex = 0;
        if (sessions.length > 0 && currSession) {
            while (currSession && !currSession.hasSeparateRepl()) {
                currSession = currSession.parentSession;
            }
            if (currSession) {
                const currIndex = sessions.indexOf(currSession);
                if (next) {
                    nextIndex = (currIndex === (sessions.length - 1) ? 0 : (currIndex + 1));
                }
                else {
                    nextIndex = (currIndex === 0 ? (sessions.length - 1) : (currIndex - 1));
                }
            }
        }
        await debugService.focusStackFrame(undefined, undefined, sessions[nextIndex], { explicit: true });
        if (!viewsService.isViewVisible(debug_1.$rG)) {
            await viewsService.openView(debug_1.$rG, true);
        }
    }
    async function navigateCallStack(debugService, down) {
        const frame = debugService.getViewModel().focusedStackFrame;
        if (frame) {
            let callStack = frame.thread.getCallStack();
            let index = callStack.findIndex(elem => elem.frameId === frame.frameId);
            let nextVisibleFrame;
            if (down) {
                if (index >= callStack.length - 1) {
                    if (frame.thread.reachedEndOfCallStack) {
                        goToTopOfCallStack(debugService);
                        return;
                    }
                    else {
                        await debugService.getModel().fetchCallstack(frame.thread, 20);
                        callStack = frame.thread.getCallStack();
                        index = callStack.findIndex(elem => elem.frameId === frame.frameId);
                    }
                }
                nextVisibleFrame = findNextVisibleFrame(true, callStack, index);
            }
            else {
                if (index <= 0) {
                    goToBottomOfCallStack(debugService);
                    return;
                }
                nextVisibleFrame = findNextVisibleFrame(false, callStack, index);
            }
            if (nextVisibleFrame) {
                debugService.focusStackFrame(nextVisibleFrame);
            }
        }
    }
    async function goToBottomOfCallStack(debugService) {
        const thread = debugService.getViewModel().focusedThread;
        if (thread) {
            await debugService.getModel().fetchCallstack(thread);
            const callStack = thread.getCallStack();
            if (callStack.length > 0) {
                const nextVisibleFrame = findNextVisibleFrame(false, callStack, 0); // must consider the next frame up first, which will be the last frame
                if (nextVisibleFrame) {
                    debugService.focusStackFrame(nextVisibleFrame);
                }
            }
        }
    }
    function goToTopOfCallStack(debugService) {
        const thread = debugService.getViewModel().focusedThread;
        if (thread) {
            debugService.focusStackFrame(thread.getTopStackFrame());
        }
    }
    /**
     * Finds next frame that is not skipped by SkipFiles. Skips frame at index and starts searching at next.
     * Must satisfy `0 <= startIndex <= callStack - 1`
     * @param down specifies whether to search downwards if the current file is skipped.
     * @param callStack the call stack to search
     * @param startIndex the index to start the search at
     */
    function findNextVisibleFrame(down, callStack, startIndex) {
        if (startIndex >= callStack.length) {
            startIndex = callStack.length - 1;
        }
        else if (startIndex < 0) {
            startIndex = 0;
        }
        let index = startIndex;
        let currFrame;
        do {
            if (down) {
                if (index === callStack.length - 1) {
                    index = 0;
                }
                else {
                    index++;
                }
            }
            else {
                if (index === 0) {
                    index = callStack.length - 1;
                }
                else {
                    index--;
                }
            }
            currFrame = callStack[index];
            if (!(currFrame.source.presentationHint === 'deemphasize' || currFrame.presentationHint === 'deemphasize')) {
                return currFrame;
            }
        } while (index !== startIndex); // end loop when we've just checked the start index, since that should be the last one checked
        return undefined;
    }
    // These commands are used in call stack context menu, call stack inline actions, command palette, debug toolbar, mac native touch bar
    // When the command is exectued in the context of a thread(context menu on a thread, inline call stack action) we pass the thread id
    // Otherwise when it is executed "globaly"(using the touch bar, debug toolbar, command palette) we do not pass any id and just take whatever is the focussed thread
    // Same for stackFrame commands and session commands.
    commands_1.$Gr.registerCommand({
        id: exports.$fQb,
        handler: async (accessor, _, context) => {
            const textResourcePropertiesService = accessor.get(textResourceConfiguration_1.$GA);
            const clipboardService = accessor.get(clipboardService_1.$UZ);
            const debugService = accessor.get(debug_1.$nH);
            const frame = getFrame(debugService, context);
            if (frame) {
                const eol = textResourcePropertiesService.getEOL(frame.source.uri);
                await clipboardService.writeText(frame.thread.getCallStack().map(sf => sf.toString()).join(eol));
            }
        }
    });
    commands_1.$Gr.registerCommand({
        id: exports.$gQb,
        handler: async (accessor, _, context) => {
            await getThreadAndRun(accessor, context, thread => thread.reverseContinue());
        }
    });
    commands_1.$Gr.registerCommand({
        id: exports.$hQb,
        handler: async (accessor, _, context) => {
            const contextKeyService = accessor.get(contextkey_1.$3i);
            if (debug_1.$dH.getValue(contextKeyService)) {
                await getThreadAndRun(accessor, context, (thread) => thread.stepBack('instruction'));
            }
            else {
                await getThreadAndRun(accessor, context, (thread) => thread.stepBack());
            }
        }
    });
    commands_1.$Gr.registerCommand({
        id: exports.$jQb,
        handler: async (accessor, _, context) => {
            await getThreadAndRun(accessor, context, thread => thread.terminate());
        }
    });
    commands_1.$Gr.registerCommand({
        id: exports.$vQb,
        handler: async (accessor) => {
            const debugService = accessor.get(debug_1.$nH);
            const stackFrame = debugService.getViewModel().focusedStackFrame;
            const editorService = accessor.get(editorService_1.$9C);
            const activeEditorControl = editorService.activeTextEditorControl;
            const notificationService = accessor.get(notification_1.$Yu);
            const quickInputService = accessor.get(quickInput_1.$Gq);
            if (stackFrame && (0, editorBrowser_1.$iV)(activeEditorControl) && activeEditorControl.hasModel()) {
                const position = activeEditorControl.getPosition();
                const resource = activeEditorControl.getModel().uri;
                const source = stackFrame.thread.session.getSourceForUri(resource);
                if (source) {
                    const response = await stackFrame.thread.session.gotoTargets(source.raw, position.lineNumber, position.column);
                    const targets = response?.body.targets;
                    if (targets && targets.length) {
                        let id = targets[0].id;
                        if (targets.length > 1) {
                            const picks = targets.map(t => ({ label: t.label, _id: t.id }));
                            const pick = await quickInputService.pick(picks, { placeHolder: nls.localize(25, null) });
                            if (!pick) {
                                return;
                            }
                            id = pick._id;
                        }
                        return await stackFrame.thread.session.goto(stackFrame.thread.threadId, id).catch(e => notificationService.warn(e));
                    }
                }
            }
            return notificationService.warn(nls.localize(26, null));
        }
    });
    commands_1.$Gr.registerCommand({
        id: exports.$JQb,
        handler: async (accessor, _, context) => {
            const debugService = accessor.get(debug_1.$nH);
            goToTopOfCallStack(debugService);
        }
    });
    commands_1.$Gr.registerCommand({
        id: exports.$KQb,
        handler: async (accessor, _, context) => {
            const debugService = accessor.get(debug_1.$nH);
            await goToBottomOfCallStack(debugService);
        }
    });
    commands_1.$Gr.registerCommand({
        id: exports.$LQb,
        handler: async (accessor, _, context) => {
            const debugService = accessor.get(debug_1.$nH);
            navigateCallStack(debugService, false);
        }
    });
    commands_1.$Gr.registerCommand({
        id: exports.$MQb,
        handler: async (accessor, _, context) => {
            const debugService = accessor.get(debug_1.$nH);
            navigateCallStack(debugService, true);
        }
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorContext, {
        command: {
            id: exports.$vQb,
            title: nls.localize(27, null),
            category: exports.$NQb
        },
        when: contextkey_1.$Ii.and(debug_1.$WG, editorContextKeys_1.EditorContextKeys.editorTextFocus),
        group: 'debug',
        order: 3
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: exports.$GQb,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
        when: debug_1.$zG,
        primary: 2048 /* KeyMod.CtrlCmd */ | 12 /* KeyCode.PageDown */,
        mac: { primary: 1024 /* KeyMod.Shift */ | 2048 /* KeyMod.CtrlCmd */ | 94 /* KeyCode.BracketRight */ },
        handler: async (accessor, _, context) => {
            changeDebugConsoleFocus(accessor, true);
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: exports.$HQb,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
        when: debug_1.$zG,
        primary: 2048 /* KeyMod.CtrlCmd */ | 11 /* KeyCode.PageUp */,
        mac: { primary: 1024 /* KeyMod.Shift */ | 2048 /* KeyMod.CtrlCmd */ | 92 /* KeyCode.BracketLeft */ },
        handler: async (accessor, _, context) => {
            changeDebugConsoleFocus(accessor, false);
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: exports.$iQb,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 1024 /* KeyMod.Shift */ | 2048 /* KeyMod.CtrlCmd */ | 63 /* KeyCode.F5 */,
        when: debug_1.$yG,
        handler: async (accessor, _, context) => {
            const debugService = accessor.get(debug_1.$nH);
            const configurationService = accessor.get(configuration_1.$8h);
            let session;
            if (isSessionContext(context)) {
                session = debugService.getModel().getSession(context.sessionId);
            }
            else {
                session = debugService.getViewModel().focusedSession;
            }
            if (!session) {
                const { launch, name } = debugService.getConfigurationManager().selectedConfiguration;
                await debugService.startDebugging(launch, name, { noDebug: false, startedByUser: true });
            }
            else {
                const showSubSessions = configurationService.getValue('debug').showSubSessionsInToolBar;
                // Stop should be sent to the root parent session
                while (!showSubSessions && session.lifecycleManagedByParent && session.parentSession) {
                    session = session.parentSession;
                }
                session.removeReplExpressions();
                await debugService.restartSession(session);
            }
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: exports.$kQb,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 68 /* KeyCode.F10 */,
        when: debug_1.$uG.isEqualTo('stopped'),
        handler: async (accessor, _, context) => {
            const contextKeyService = accessor.get(contextkey_1.$3i);
            if (debug_1.$dH.getValue(contextKeyService)) {
                await getThreadAndRun(accessor, context, (thread) => thread.next('instruction'));
            }
            else {
                await getThreadAndRun(accessor, context, (thread) => thread.next());
            }
        }
    });
    // Windows browsers use F11 for full screen, thus use alt+F11 as the default shortcut
    const STEP_INTO_KEYBINDING = (platform_1.$o && platform_1.$i) ? (512 /* KeyMod.Alt */ | 69 /* KeyCode.F11 */) : 69 /* KeyCode.F11 */;
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: exports.$lQb,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 10,
        primary: STEP_INTO_KEYBINDING,
        // Use a more flexible when clause to not allow full screen command to take over when F11 pressed a lot of times
        when: debug_1.$uG.notEqualsTo('inactive'),
        handler: async (accessor, _, context) => {
            const contextKeyService = accessor.get(contextkey_1.$3i);
            if (debug_1.$dH.getValue(contextKeyService)) {
                await getThreadAndRun(accessor, context, (thread) => thread.stepIn('instruction'));
            }
            else {
                await getThreadAndRun(accessor, context, (thread) => thread.stepIn());
            }
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: exports.$nQb,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 1024 /* KeyMod.Shift */ | 69 /* KeyCode.F11 */,
        when: debug_1.$uG.isEqualTo('stopped'),
        handler: async (accessor, _, context) => {
            const contextKeyService = accessor.get(contextkey_1.$3i);
            if (debug_1.$dH.getValue(contextKeyService)) {
                await getThreadAndRun(accessor, context, (thread) => thread.stepOut('instruction'));
            }
            else {
                await getThreadAndRun(accessor, context, (thread) => thread.stepOut());
            }
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: exports.$oQb,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 2,
        primary: 64 /* KeyCode.F6 */,
        when: debug_1.$uG.isEqualTo('running'),
        handler: async (accessor, _, context) => {
            await getThreadAndRun(accessor, context, thread => thread.pause());
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: exports.$mQb,
        primary: STEP_INTO_KEYBINDING | 2048 /* KeyMod.CtrlCmd */,
        when: contextkey_1.$Ii.and(debug_1.$XG, debug_1.$yG, debug_1.$uG.isEqualTo('stopped')),
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        handler: async (accessor, _, context) => {
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const debugService = accessor.get(debug_1.$nH);
            const session = debugService.getViewModel().focusedSession;
            const frame = debugService.getViewModel().focusedStackFrame;
            if (!frame || !session) {
                return;
            }
            const editor = await accessor.get(editorService_1.$9C).openEditor({
                resource: frame.source.uri,
                options: { revealIfOpened: true }
            });
            let codeEditor;
            if (editor) {
                const ctrl = editor?.getControl();
                if ((0, editorBrowser_1.$iV)(ctrl)) {
                    codeEditor = ctrl;
                }
            }
            const qp = quickInputService.createQuickPick();
            qp.busy = true;
            qp.show();
            qp.onDidChangeActive(([item]) => {
                if (codeEditor && item && item.target.line !== undefined) {
                    codeEditor.revealLineInCenterIfOutsideViewport(item.target.line);
                    codeEditor.setSelection({
                        startLineNumber: item.target.line,
                        startColumn: item.target.column || 1,
                        endLineNumber: item.target.endLine || item.target.line,
                        endColumn: item.target.endColumn || item.target.column || 1,
                    });
                }
            });
            qp.onDidAccept(() => {
                if (qp.activeItems.length) {
                    session.stepIn(frame.thread.threadId, qp.activeItems[0].target.id);
                }
            });
            qp.onDidHide(() => qp.dispose());
            session.stepInTargets(frame.frameId).then(targets => {
                qp.busy = false;
                if (targets?.length) {
                    qp.items = targets?.map(target => ({ target, label: target.label }));
                }
                else {
                    qp.placeholder = nls.localize(28, null);
                }
            });
        }
    });
    async function stopHandler(accessor, _, context, disconnect, suspend) {
        const debugService = accessor.get(debug_1.$nH);
        let session;
        if (isSessionContext(context)) {
            session = debugService.getModel().getSession(context.sessionId);
        }
        else {
            session = debugService.getViewModel().focusedSession;
        }
        const configurationService = accessor.get(configuration_1.$8h);
        const showSubSessions = configurationService.getValue('debug').showSubSessionsInToolBar;
        // Stop should be sent to the root parent session
        while (!showSubSessions && session && session.lifecycleManagedByParent && session.parentSession) {
            session = session.parentSession;
        }
        await debugService.stopSession(session, disconnect, suspend);
    }
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: exports.$pQb,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 1024 /* KeyMod.Shift */ | 63 /* KeyCode.F5 */,
        when: contextkey_1.$Ii.and(debug_1.$SG, debug_1.$yG),
        handler: (accessor, _, context) => stopHandler(accessor, _, context, true)
    });
    commands_1.$Gr.registerCommand({
        id: exports.$qQb,
        handler: (accessor, _, context) => stopHandler(accessor, _, context, true, true)
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: exports.$rQb,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 1024 /* KeyMod.Shift */ | 63 /* KeyCode.F5 */,
        when: contextkey_1.$Ii.and(debug_1.$SG.toNegated(), debug_1.$yG),
        handler: (accessor, _, context) => stopHandler(accessor, _, context, false)
    });
    commands_1.$Gr.registerCommand({
        id: exports.$sQb,
        handler: async (accessor, _, context) => {
            const debugService = accessor.get(debug_1.$nH);
            const notificationService = accessor.get(notification_1.$Yu);
            const frame = getFrame(debugService, context);
            if (frame) {
                try {
                    await frame.restart();
                }
                catch (e) {
                    notificationService.error(e);
                }
            }
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: exports.$tQb,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 10,
        primary: 63 /* KeyCode.F5 */,
        when: debug_1.$uG.isEqualTo('stopped'),
        handler: async (accessor, _, context) => {
            await getThreadAndRun(accessor, context, thread => thread.continue());
        }
    });
    commands_1.$Gr.registerCommand({
        id: exports.$IQb,
        handler: async (accessor) => {
            await (0, loadedScriptsPicker_1.$bQb)(accessor);
        }
    });
    commands_1.$Gr.registerCommand({
        id: exports.$uQb,
        handler: async (accessor) => {
            const viewsService = accessor.get(views_1.$$E);
            await viewsService.openView(debug_1.$rG, true);
        }
    });
    commands_1.$Gr.registerCommand({
        id: 'debug.startFromConfig',
        handler: async (accessor, config) => {
            const debugService = accessor.get(debug_1.$nH);
            await debugService.startDebugging(undefined, config);
        }
    });
    commands_1.$Gr.registerCommand({
        id: exports.$wQb,
        handler: async (accessor, session) => {
            const debugService = accessor.get(debug_1.$nH);
            const editorService = accessor.get(editorService_1.$9C);
            const stoppedChildSession = debugService.getModel().getSessions().find(s => s.parentSession === session && s.state === 2 /* State.Stopped */);
            if (stoppedChildSession && session.state !== 2 /* State.Stopped */) {
                session = stoppedChildSession;
            }
            await debugService.focusStackFrame(undefined, undefined, session, { explicit: true });
            const stackFrame = debugService.getViewModel().focusedStackFrame;
            if (stackFrame) {
                await stackFrame.openInEditor(editorService, true);
            }
        }
    });
    commands_1.$Gr.registerCommand({
        id: exports.$xQb,
        handler: async (accessor, debugType) => {
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const debugService = accessor.get(debug_1.$nH);
            if (debugType) {
                const configManager = debugService.getConfigurationManager();
                const dynamicProviders = await configManager.getDynamicProviders();
                for (const provider of dynamicProviders) {
                    if (provider.type === debugType) {
                        const pick = await provider.pick();
                        if (pick) {
                            await configManager.selectConfiguration(pick.launch, pick.config.name, pick.config, { type: provider.type });
                            debugService.startDebugging(pick.launch, pick.config, { startedByUser: true });
                            return;
                        }
                    }
                }
            }
            quickInputService.quickAccess.show(exports.$aRb);
        }
    });
    commands_1.$Gr.registerCommand({
        id: exports.$yQb,
        handler: async (accessor) => {
            const quickInputService = accessor.get(quickInput_1.$Gq);
            quickInputService.quickAccess.show(exports.$bRb);
        }
    });
    commands_1.$Gr.registerCommand({
        id: exports.$zQb,
        handler: async (accessor) => {
            (0, debugSessionPicker_1.$cQb)(accessor, exports.$xQb);
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: exports.$BQb,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 63 /* KeyCode.F5 */,
        when: contextkey_1.$Ii.and(debug_1.$ZG, debug_1.$uG.isEqualTo('inactive')),
        handler: async (accessor, debugStartOptions) => {
            const debugService = accessor.get(debug_1.$nH);
            await (0, debugUtils_1.$tF)(accessor.get(configuration_1.$8h), accessor.get(editorService_1.$9C));
            const { launch, name, getConfig } = debugService.getConfigurationManager().selectedConfiguration;
            const config = await getConfig();
            const configOrName = config ? Object.assign((0, objects_1.$Vm)(config), debugStartOptions?.config) : name;
            await debugService.startDebugging(launch, configOrName, { noDebug: debugStartOptions?.noDebug, startedByUser: true }, false);
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: exports.$CQb,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 2048 /* KeyMod.CtrlCmd */ | 63 /* KeyCode.F5 */,
        mac: { primary: 256 /* KeyMod.WinCtrl */ | 63 /* KeyCode.F5 */ },
        when: contextkey_1.$Ii.and(debug_1.$ZG, debug_1.$uG.notEqualsTo((0, debug_1.$lH)(1 /* State.Initializing */))),
        handler: async (accessor) => {
            const commandService = accessor.get(commands_1.$Fr);
            await commandService.executeCommand(exports.$BQb, { noDebug: true });
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'debug.toggleBreakpoint',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 5,
        when: contextkey_1.$Ii.and(debug_1.$CG, contextkeys_1.$93.toNegated()),
        primary: 10 /* KeyCode.Space */,
        handler: (accessor) => {
            const listService = accessor.get(listService_1.$03);
            const debugService = accessor.get(debug_1.$nH);
            const list = listService.lastFocusedList;
            if (list instanceof listWidget_1.$wQ) {
                const focused = list.getFocusedElements();
                if (focused && focused.length) {
                    debugService.enableOrDisableBreakpoints(!focused[0].enabled, focused[0]);
                }
            }
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'debug.enableOrDisableBreakpoint',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: undefined,
        when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
        handler: (accessor) => {
            const debugService = accessor.get(debug_1.$nH);
            const editorService = accessor.get(editorService_1.$9C);
            const control = editorService.activeTextEditorControl;
            if ((0, editorBrowser_1.$iV)(control)) {
                const model = control.getModel();
                if (model) {
                    const position = control.getPosition();
                    if (position) {
                        const bps = debugService.getModel().getBreakpoints({ uri: model.uri, lineNumber: position.lineNumber });
                        if (bps.length) {
                            debugService.enableOrDisableBreakpoints(!bps[0].enabled, bps[0]);
                        }
                    }
                }
            }
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: exports.$DQb,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 5,
        when: debug_1.$DG,
        primary: 60 /* KeyCode.F2 */,
        mac: { primary: 3 /* KeyCode.Enter */ },
        handler: (accessor, expression) => {
            const debugService = accessor.get(debug_1.$nH);
            if (!(expression instanceof debugModel_1.$IFb)) {
                const listService = accessor.get(listService_1.$03);
                const focused = listService.lastFocusedList;
                if (focused) {
                    const elements = focused.getFocus();
                    if (Array.isArray(elements) && elements[0] instanceof debugModel_1.$IFb) {
                        expression = elements[0];
                    }
                }
            }
            if (expression instanceof debugModel_1.$IFb) {
                debugService.getViewModel().setSelectedExpression(expression, false);
            }
        }
    });
    commands_1.$Gr.registerCommand({
        id: exports.$EQb,
        handler: async (accessor, expression) => {
            const debugService = accessor.get(debug_1.$nH);
            if (expression instanceof debugModel_1.$IFb || expression instanceof debugModel_1.$JFb) {
                debugService.getViewModel().setSelectedExpression(expression, true);
            }
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'debug.setVariable',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 5,
        when: debug_1.$FG,
        primary: 60 /* KeyCode.F2 */,
        mac: { primary: 3 /* KeyCode.Enter */ },
        handler: (accessor) => {
            const listService = accessor.get(listService_1.$03);
            const debugService = accessor.get(debug_1.$nH);
            const focused = listService.lastFocusedList;
            if (focused) {
                const elements = focused.getFocus();
                if (Array.isArray(elements) && elements[0] instanceof debugModel_1.$JFb) {
                    debugService.getViewModel().setSelectedExpression(elements[0], false);
                }
            }
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: exports.$FQb,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.$Ii.and(debug_1.$DG, debug_1.$GG.toNegated()),
        primary: 20 /* KeyCode.Delete */,
        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */ },
        handler: (accessor, expression) => {
            const debugService = accessor.get(debug_1.$nH);
            if (expression instanceof debugModel_1.$IFb) {
                debugService.removeWatchExpressions(expression.getId());
                return;
            }
            const listService = accessor.get(listService_1.$03);
            const focused = listService.lastFocusedList;
            if (focused) {
                let elements = focused.getFocus();
                if (Array.isArray(elements) && elements[0] instanceof debugModel_1.$IFb) {
                    const selection = focused.getSelection();
                    if (selection && selection.indexOf(elements[0]) >= 0) {
                        elements = selection;
                    }
                    elements.forEach((e) => debugService.removeWatchExpressions(e.getId()));
                }
            }
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'debug.removeBreakpoint',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.$Ii.and(debug_1.$CG, debug_1.$HG.toNegated()),
        primary: 20 /* KeyCode.Delete */,
        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */ },
        handler: (accessor) => {
            const listService = accessor.get(listService_1.$03);
            const debugService = accessor.get(debug_1.$nH);
            const list = listService.lastFocusedList;
            if (list instanceof listWidget_1.$wQ) {
                const focused = list.getFocusedElements();
                const element = focused.length ? focused[0] : undefined;
                if (element instanceof debugModel_1.$SFb) {
                    debugService.removeBreakpoints(element.getId());
                }
                else if (element instanceof debugModel_1.$TFb) {
                    debugService.removeFunctionBreakpoints(element.getId());
                }
                else if (element instanceof debugModel_1.$UFb) {
                    debugService.removeDataBreakpoints(element.getId());
                }
            }
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'debug.installAdditionalDebuggers',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: undefined,
        primary: undefined,
        handler: async (accessor, query) => {
            const paneCompositeService = accessor.get(panecomposite_1.$Yeb);
            const viewlet = (await paneCompositeService.openPaneComposite(extensions_1.$Ofb, 0 /* ViewContainerLocation.Sidebar */, true))?.getViewPaneContainer();
            let searchFor = `@category:debuggers`;
            if (typeof query === 'string') {
                searchFor += ` ${query}`;
            }
            viewlet.search(searchFor);
            viewlet.focus();
        }
    });
    (0, actions_1.$Xu)(class AddConfigurationAction extends actions_1.$Wu {
        constructor() {
            super({
                id: exports.$dQb,
                title: { value: nls.localize(29, null), original: 'Add Configuration...' },
                category: exports.$NQb,
                f1: true,
                menu: {
                    id: actions_1.$Ru.EditorContent,
                    when: contextkey_1.$Ii.and(contextkey_1.$Ii.regex(contextkeys_2.$Kdb.Path.key, /\.vscode[/\\]launch\.json$/), contextkeys_2.$$cb.isEqualTo(files_1.$7db))
                }
            });
        }
        async run(accessor, launchUri) {
            const manager = accessor.get(debug_1.$nH).getConfigurationManager();
            const launch = manager.getLaunches().find(l => l.uri.toString() === launchUri) || manager.selectedConfiguration.launch;
            if (launch) {
                const { editor, created } = await launch.openConfigFile({ preserveFocus: false });
                if (editor && !created) {
                    const codeEditor = editor.getControl();
                    if (codeEditor) {
                        await codeEditor.getContribution(debug_1.$hH)?.addLaunchConfiguration();
                    }
                }
            }
        }
    });
    const inlineBreakpointHandler = (accessor) => {
        const debugService = accessor.get(debug_1.$nH);
        const editorService = accessor.get(editorService_1.$9C);
        const control = editorService.activeTextEditorControl;
        if ((0, editorBrowser_1.$iV)(control)) {
            const position = control.getPosition();
            if (position && control.hasModel() && debugService.canSetBreakpointsIn(control.getModel())) {
                const modelUri = control.getModel().uri;
                const breakpointAlreadySet = debugService.getModel().getBreakpoints({ lineNumber: position.lineNumber, uri: modelUri })
                    .some(bp => (bp.sessionAgnosticData.column === position.column || (!bp.column && position.column <= 1)));
                if (!breakpointAlreadySet) {
                    debugService.addBreakpoints(modelUri, [{ lineNumber: position.lineNumber, column: position.column > 1 ? position.column : undefined }]);
                }
            }
        }
    };
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 1024 /* KeyMod.Shift */ | 67 /* KeyCode.F9 */,
        when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
        id: exports.$eQb,
        handler: inlineBreakpointHandler
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorContext, {
        command: {
            id: exports.$eQb,
            title: nls.localize(30, null),
            category: exports.$NQb
        },
        when: contextkey_1.$Ii.and(debug_1.$yG, contextkeys_2.$Cdb.toNegated(), editorContextKeys_1.EditorContextKeys.editorTextFocus),
        group: 'debug',
        order: 1
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'debug.openBreakpointToSide',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: debug_1.$CG,
        primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
        secondary: [512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */],
        handler: (accessor) => {
            const listService = accessor.get(listService_1.$03);
            const list = listService.lastFocusedList;
            if (list instanceof listWidget_1.$wQ) {
                const focus = list.getFocusedElements();
                if (focus.length && focus[0] instanceof debugModel_1.$SFb) {
                    return (0, breakpointsView_1.$$Fb)(focus[0], true, false, true, accessor.get(debug_1.$nH), accessor.get(editorService_1.$9C));
                }
            }
            return undefined;
        }
    });
    // When there are no debug extensions, open the debug viewlet when F5 is pressed so the user can read the limitations
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'debug.openView',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: debug_1.$ZG.toNegated(),
        primary: 63 /* KeyCode.F5 */,
        secondary: [2048 /* KeyMod.CtrlCmd */ | 63 /* KeyCode.F5 */],
        handler: async (accessor) => {
            const paneCompositeService = accessor.get(panecomposite_1.$Yeb);
            await paneCompositeService.openPaneComposite(debug_1.$jG, 0 /* ViewContainerLocation.Sidebar */, true);
        }
    });
});
//# sourceMappingURL=debugCommands.js.map