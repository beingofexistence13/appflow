/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/browser/ui/list/listWidget", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/list/browser/listService", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/extensions/common/extensions", "vs/editor/browser/editorBrowser", "vs/platform/actions/common/actions", "vs/workbench/services/editor/common/editorService", "vs/editor/common/editorContextKeys", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/debug/browser/breakpointsView", "vs/platform/notification/common/notification", "vs/platform/contextkey/common/contextkeys", "vs/workbench/common/contextkeys", "vs/platform/commands/common/commands", "vs/editor/common/services/textResourceConfiguration", "vs/platform/clipboard/common/clipboardService", "vs/platform/configuration/common/configuration", "vs/platform/quickinput/common/quickInput", "vs/workbench/common/views", "vs/base/common/objects", "vs/base/common/platform", "vs/workbench/contrib/debug/common/debugUtils", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/contrib/debug/common/loadedScriptsPicker", "vs/workbench/contrib/debug/browser/debugSessionPicker", "vs/workbench/contrib/files/common/files"], function (require, exports, nls, listWidget_1, keybindingsRegistry_1, listService_1, debug_1, debugModel_1, extensions_1, editorBrowser_1, actions_1, editorService_1, editorContextKeys_1, contextkey_1, breakpointsView_1, notification_1, contextkeys_1, contextkeys_2, commands_1, textResourceConfiguration_1, clipboardService_1, configuration_1, quickInput_1, views_1, objects_1, platform_1, debugUtils_1, panecomposite_1, loadedScriptsPicker_1, debugSessionPicker_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DEBUG_CONSOLE_QUICK_ACCESS_PREFIX = exports.DEBUG_QUICK_ACCESS_PREFIX = exports.SELECT_DEBUG_SESSION_LABEL = exports.SELECT_DEBUG_CONSOLE_LABEL = exports.CALLSTACK_DOWN_LABEL = exports.CALLSTACK_UP_LABEL = exports.CALLSTACK_BOTTOM_LABEL = exports.CALLSTACK_TOP_LABEL = exports.OPEN_LOADED_SCRIPTS_LABEL = exports.PREV_DEBUG_CONSOLE_LABEL = exports.NEXT_DEBUG_CONSOLE_LABEL = exports.DEBUG_RUN_LABEL = exports.DEBUG_START_LABEL = exports.DEBUG_CONFIGURE_LABEL = exports.SELECT_AND_START_LABEL = exports.FOCUS_SESSION_LABEL = exports.CONTINUE_LABEL = exports.STOP_LABEL = exports.DISCONNECT_AND_SUSPEND_LABEL = exports.DISCONNECT_LABEL = exports.PAUSE_LABEL = exports.STEP_OUT_LABEL = exports.STEP_INTO_TARGET_LABEL = exports.STEP_INTO_LABEL = exports.STEP_OVER_LABEL = exports.RESTART_LABEL = exports.DEBUG_COMMAND_CATEGORY = exports.CALLSTACK_DOWN_ID = exports.CALLSTACK_UP_ID = exports.CALLSTACK_BOTTOM_ID = exports.CALLSTACK_TOP_ID = exports.SHOW_LOADED_SCRIPTS_ID = exports.PREV_DEBUG_CONSOLE_ID = exports.NEXT_DEBUG_CONSOLE_ID = exports.REMOVE_EXPRESSION_COMMAND_ID = exports.SET_EXPRESSION_COMMAND_ID = exports.EDIT_EXPRESSION_COMMAND_ID = exports.DEBUG_RUN_COMMAND_ID = exports.DEBUG_START_COMMAND_ID = exports.DEBUG_CONFIGURE_COMMAND_ID = exports.SELECT_DEBUG_SESSION_ID = exports.SELECT_DEBUG_CONSOLE_ID = exports.SELECT_AND_START_ID = exports.FOCUS_SESSION_ID = exports.JUMP_TO_CURSOR_ID = exports.FOCUS_REPL_ID = exports.CONTINUE_ID = exports.RESTART_FRAME_ID = exports.STOP_ID = exports.DISCONNECT_AND_SUSPEND_ID = exports.DISCONNECT_ID = exports.PAUSE_ID = exports.STEP_OUT_ID = exports.STEP_INTO_TARGET_ID = exports.STEP_INTO_ID = exports.STEP_OVER_ID = exports.TERMINATE_THREAD_ID = exports.RESTART_SESSION_ID = exports.STEP_BACK_ID = exports.REVERSE_CONTINUE_ID = exports.COPY_STACK_TRACE_ID = exports.TOGGLE_INLINE_BREAKPOINT_ID = exports.ADD_CONFIGURATION_ID = void 0;
    exports.ADD_CONFIGURATION_ID = 'debug.addConfiguration';
    exports.TOGGLE_INLINE_BREAKPOINT_ID = 'editor.debug.action.toggleInlineBreakpoint';
    exports.COPY_STACK_TRACE_ID = 'debug.copyStackTrace';
    exports.REVERSE_CONTINUE_ID = 'workbench.action.debug.reverseContinue';
    exports.STEP_BACK_ID = 'workbench.action.debug.stepBack';
    exports.RESTART_SESSION_ID = 'workbench.action.debug.restart';
    exports.TERMINATE_THREAD_ID = 'workbench.action.debug.terminateThread';
    exports.STEP_OVER_ID = 'workbench.action.debug.stepOver';
    exports.STEP_INTO_ID = 'workbench.action.debug.stepInto';
    exports.STEP_INTO_TARGET_ID = 'workbench.action.debug.stepIntoTarget';
    exports.STEP_OUT_ID = 'workbench.action.debug.stepOut';
    exports.PAUSE_ID = 'workbench.action.debug.pause';
    exports.DISCONNECT_ID = 'workbench.action.debug.disconnect';
    exports.DISCONNECT_AND_SUSPEND_ID = 'workbench.action.debug.disconnectAndSuspend';
    exports.STOP_ID = 'workbench.action.debug.stop';
    exports.RESTART_FRAME_ID = 'workbench.action.debug.restartFrame';
    exports.CONTINUE_ID = 'workbench.action.debug.continue';
    exports.FOCUS_REPL_ID = 'workbench.debug.action.focusRepl';
    exports.JUMP_TO_CURSOR_ID = 'debug.jumpToCursor';
    exports.FOCUS_SESSION_ID = 'workbench.action.debug.focusProcess';
    exports.SELECT_AND_START_ID = 'workbench.action.debug.selectandstart';
    exports.SELECT_DEBUG_CONSOLE_ID = 'workbench.action.debug.selectDebugConsole';
    exports.SELECT_DEBUG_SESSION_ID = 'workbench.action.debug.selectDebugSession';
    exports.DEBUG_CONFIGURE_COMMAND_ID = 'workbench.action.debug.configure';
    exports.DEBUG_START_COMMAND_ID = 'workbench.action.debug.start';
    exports.DEBUG_RUN_COMMAND_ID = 'workbench.action.debug.run';
    exports.EDIT_EXPRESSION_COMMAND_ID = 'debug.renameWatchExpression';
    exports.SET_EXPRESSION_COMMAND_ID = 'debug.setWatchExpression';
    exports.REMOVE_EXPRESSION_COMMAND_ID = 'debug.removeWatchExpression';
    exports.NEXT_DEBUG_CONSOLE_ID = 'workbench.action.debug.nextConsole';
    exports.PREV_DEBUG_CONSOLE_ID = 'workbench.action.debug.prevConsole';
    exports.SHOW_LOADED_SCRIPTS_ID = 'workbench.action.debug.showLoadedScripts';
    exports.CALLSTACK_TOP_ID = 'workbench.action.debug.callStackTop';
    exports.CALLSTACK_BOTTOM_ID = 'workbench.action.debug.callStackBottom';
    exports.CALLSTACK_UP_ID = 'workbench.action.debug.callStackUp';
    exports.CALLSTACK_DOWN_ID = 'workbench.action.debug.callStackDown';
    exports.DEBUG_COMMAND_CATEGORY = { original: 'Debug', value: nls.localize('debug', 'Debug') };
    exports.RESTART_LABEL = { value: nls.localize('restartDebug', "Restart"), original: 'Restart' };
    exports.STEP_OVER_LABEL = { value: nls.localize('stepOverDebug', "Step Over"), original: 'Step Over' };
    exports.STEP_INTO_LABEL = { value: nls.localize('stepIntoDebug', "Step Into"), original: 'Step Into' };
    exports.STEP_INTO_TARGET_LABEL = { value: nls.localize('stepIntoTargetDebug', "Step Into Target"), original: 'Step Into Target' };
    exports.STEP_OUT_LABEL = { value: nls.localize('stepOutDebug', "Step Out"), original: 'Step Out' };
    exports.PAUSE_LABEL = { value: nls.localize('pauseDebug', "Pause"), original: 'Pause' };
    exports.DISCONNECT_LABEL = { value: nls.localize('disconnect', "Disconnect"), original: 'Disconnect' };
    exports.DISCONNECT_AND_SUSPEND_LABEL = { value: nls.localize('disconnectSuspend', "Disconnect and Suspend"), original: 'Disconnect and Suspend' };
    exports.STOP_LABEL = { value: nls.localize('stop', "Stop"), original: 'Stop' };
    exports.CONTINUE_LABEL = { value: nls.localize('continueDebug', "Continue"), original: 'Continue' };
    exports.FOCUS_SESSION_LABEL = { value: nls.localize('focusSession', "Focus Session"), original: 'Focus Session' };
    exports.SELECT_AND_START_LABEL = { value: nls.localize('selectAndStartDebugging', "Select and Start Debugging"), original: 'Select and Start Debugging' };
    exports.DEBUG_CONFIGURE_LABEL = nls.localize('openLaunchJson', "Open '{0}'", 'launch.json');
    exports.DEBUG_START_LABEL = { value: nls.localize('startDebug', "Start Debugging"), original: 'Start Debugging' };
    exports.DEBUG_RUN_LABEL = { value: nls.localize('startWithoutDebugging', "Start Without Debugging"), original: 'Start Without Debugging' };
    exports.NEXT_DEBUG_CONSOLE_LABEL = { value: nls.localize('nextDebugConsole', "Focus Next Debug Console"), original: 'Focus Next Debug Console' };
    exports.PREV_DEBUG_CONSOLE_LABEL = { value: nls.localize('prevDebugConsole', "Focus Previous Debug Console"), original: 'Focus Previous Debug Console' };
    exports.OPEN_LOADED_SCRIPTS_LABEL = { value: nls.localize('openLoadedScript', "Open Loaded Script..."), original: 'Open Loaded Script...' };
    exports.CALLSTACK_TOP_LABEL = { value: nls.localize('callStackTop', "Navigate to Top of Call Stack"), original: 'Navigate to Top of Call Stack' };
    exports.CALLSTACK_BOTTOM_LABEL = { value: nls.localize('callStackBottom', "Navigate to Bottom of Call Stack"), original: 'Navigate to Bottom of Call Stack' };
    exports.CALLSTACK_UP_LABEL = { value: nls.localize('callStackUp', "Navigate Up Call Stack"), original: 'Navigate Up Call Stack' };
    exports.CALLSTACK_DOWN_LABEL = { value: nls.localize('callStackDown', "Navigate Down Call Stack"), original: 'Navigate Down Call Stack' };
    exports.SELECT_DEBUG_CONSOLE_LABEL = { value: nls.localize('selectDebugConsole', "Select Debug Console"), original: 'Select Debug Console' };
    exports.SELECT_DEBUG_SESSION_LABEL = { value: nls.localize('selectDebugSession', "Select Debug Session"), original: 'Select Debug Session' };
    exports.DEBUG_QUICK_ACCESS_PREFIX = 'debug ';
    exports.DEBUG_CONSOLE_QUICK_ACCESS_PREFIX = 'debug consoles ';
    function isThreadContext(obj) {
        return obj && typeof obj.sessionId === 'string' && typeof obj.threadId === 'string';
    }
    async function getThreadAndRun(accessor, sessionAndThreadId, run) {
        const debugService = accessor.get(debug_1.IDebugService);
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
        const debugService = accessor.get(debug_1.IDebugService);
        const viewsService = accessor.get(views_1.IViewsService);
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
        if (!viewsService.isViewVisible(debug_1.REPL_VIEW_ID)) {
            await viewsService.openView(debug_1.REPL_VIEW_ID, true);
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
    commands_1.CommandsRegistry.registerCommand({
        id: exports.COPY_STACK_TRACE_ID,
        handler: async (accessor, _, context) => {
            const textResourcePropertiesService = accessor.get(textResourceConfiguration_1.ITextResourcePropertiesService);
            const clipboardService = accessor.get(clipboardService_1.IClipboardService);
            const debugService = accessor.get(debug_1.IDebugService);
            const frame = getFrame(debugService, context);
            if (frame) {
                const eol = textResourcePropertiesService.getEOL(frame.source.uri);
                await clipboardService.writeText(frame.thread.getCallStack().map(sf => sf.toString()).join(eol));
            }
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.REVERSE_CONTINUE_ID,
        handler: async (accessor, _, context) => {
            await getThreadAndRun(accessor, context, thread => thread.reverseContinue());
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.STEP_BACK_ID,
        handler: async (accessor, _, context) => {
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            if (debug_1.CONTEXT_DISASSEMBLY_VIEW_FOCUS.getValue(contextKeyService)) {
                await getThreadAndRun(accessor, context, (thread) => thread.stepBack('instruction'));
            }
            else {
                await getThreadAndRun(accessor, context, (thread) => thread.stepBack());
            }
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.TERMINATE_THREAD_ID,
        handler: async (accessor, _, context) => {
            await getThreadAndRun(accessor, context, thread => thread.terminate());
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.JUMP_TO_CURSOR_ID,
        handler: async (accessor) => {
            const debugService = accessor.get(debug_1.IDebugService);
            const stackFrame = debugService.getViewModel().focusedStackFrame;
            const editorService = accessor.get(editorService_1.IEditorService);
            const activeEditorControl = editorService.activeTextEditorControl;
            const notificationService = accessor.get(notification_1.INotificationService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            if (stackFrame && (0, editorBrowser_1.isCodeEditor)(activeEditorControl) && activeEditorControl.hasModel()) {
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
                            const pick = await quickInputService.pick(picks, { placeHolder: nls.localize('chooseLocation', "Choose the specific location") });
                            if (!pick) {
                                return;
                            }
                            id = pick._id;
                        }
                        return await stackFrame.thread.session.goto(stackFrame.thread.threadId, id).catch(e => notificationService.warn(e));
                    }
                }
            }
            return notificationService.warn(nls.localize('noExecutableCode', "No executable code is associated at the current cursor position."));
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.CALLSTACK_TOP_ID,
        handler: async (accessor, _, context) => {
            const debugService = accessor.get(debug_1.IDebugService);
            goToTopOfCallStack(debugService);
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.CALLSTACK_BOTTOM_ID,
        handler: async (accessor, _, context) => {
            const debugService = accessor.get(debug_1.IDebugService);
            await goToBottomOfCallStack(debugService);
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.CALLSTACK_UP_ID,
        handler: async (accessor, _, context) => {
            const debugService = accessor.get(debug_1.IDebugService);
            navigateCallStack(debugService, false);
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.CALLSTACK_DOWN_ID,
        handler: async (accessor, _, context) => {
            const debugService = accessor.get(debug_1.IDebugService);
            navigateCallStack(debugService, true);
        }
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorContext, {
        command: {
            id: exports.JUMP_TO_CURSOR_ID,
            title: nls.localize('jumpToCursor', "Jump to Cursor"),
            category: exports.DEBUG_COMMAND_CATEGORY
        },
        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_JUMP_TO_CURSOR_SUPPORTED, editorContextKeys_1.EditorContextKeys.editorTextFocus),
        group: 'debug',
        order: 3
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.NEXT_DEBUG_CONSOLE_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
        when: debug_1.CONTEXT_IN_DEBUG_REPL,
        primary: 2048 /* KeyMod.CtrlCmd */ | 12 /* KeyCode.PageDown */,
        mac: { primary: 1024 /* KeyMod.Shift */ | 2048 /* KeyMod.CtrlCmd */ | 94 /* KeyCode.BracketRight */ },
        handler: async (accessor, _, context) => {
            changeDebugConsoleFocus(accessor, true);
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.PREV_DEBUG_CONSOLE_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
        when: debug_1.CONTEXT_IN_DEBUG_REPL,
        primary: 2048 /* KeyMod.CtrlCmd */ | 11 /* KeyCode.PageUp */,
        mac: { primary: 1024 /* KeyMod.Shift */ | 2048 /* KeyMod.CtrlCmd */ | 92 /* KeyCode.BracketLeft */ },
        handler: async (accessor, _, context) => {
            changeDebugConsoleFocus(accessor, false);
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.RESTART_SESSION_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 1024 /* KeyMod.Shift */ | 2048 /* KeyMod.CtrlCmd */ | 63 /* KeyCode.F5 */,
        when: debug_1.CONTEXT_IN_DEBUG_MODE,
        handler: async (accessor, _, context) => {
            const debugService = accessor.get(debug_1.IDebugService);
            const configurationService = accessor.get(configuration_1.IConfigurationService);
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
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.STEP_OVER_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 68 /* KeyCode.F10 */,
        when: debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'),
        handler: async (accessor, _, context) => {
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            if (debug_1.CONTEXT_DISASSEMBLY_VIEW_FOCUS.getValue(contextKeyService)) {
                await getThreadAndRun(accessor, context, (thread) => thread.next('instruction'));
            }
            else {
                await getThreadAndRun(accessor, context, (thread) => thread.next());
            }
        }
    });
    // Windows browsers use F11 for full screen, thus use alt+F11 as the default shortcut
    const STEP_INTO_KEYBINDING = (platform_1.isWeb && platform_1.isWindows) ? (512 /* KeyMod.Alt */ | 69 /* KeyCode.F11 */) : 69 /* KeyCode.F11 */;
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.STEP_INTO_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 10,
        primary: STEP_INTO_KEYBINDING,
        // Use a more flexible when clause to not allow full screen command to take over when F11 pressed a lot of times
        when: debug_1.CONTEXT_DEBUG_STATE.notEqualsTo('inactive'),
        handler: async (accessor, _, context) => {
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            if (debug_1.CONTEXT_DISASSEMBLY_VIEW_FOCUS.getValue(contextKeyService)) {
                await getThreadAndRun(accessor, context, (thread) => thread.stepIn('instruction'));
            }
            else {
                await getThreadAndRun(accessor, context, (thread) => thread.stepIn());
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.STEP_OUT_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 1024 /* KeyMod.Shift */ | 69 /* KeyCode.F11 */,
        when: debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'),
        handler: async (accessor, _, context) => {
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            if (debug_1.CONTEXT_DISASSEMBLY_VIEW_FOCUS.getValue(contextKeyService)) {
                await getThreadAndRun(accessor, context, (thread) => thread.stepOut('instruction'));
            }
            else {
                await getThreadAndRun(accessor, context, (thread) => thread.stepOut());
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.PAUSE_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 2,
        primary: 64 /* KeyCode.F6 */,
        when: debug_1.CONTEXT_DEBUG_STATE.isEqualTo('running'),
        handler: async (accessor, _, context) => {
            await getThreadAndRun(accessor, context, thread => thread.pause());
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.STEP_INTO_TARGET_ID,
        primary: STEP_INTO_KEYBINDING | 2048 /* KeyMod.CtrlCmd */,
        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_STEP_INTO_TARGETS_SUPPORTED, debug_1.CONTEXT_IN_DEBUG_MODE, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped')),
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        handler: async (accessor, _, context) => {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const debugService = accessor.get(debug_1.IDebugService);
            const session = debugService.getViewModel().focusedSession;
            const frame = debugService.getViewModel().focusedStackFrame;
            if (!frame || !session) {
                return;
            }
            const editor = await accessor.get(editorService_1.IEditorService).openEditor({
                resource: frame.source.uri,
                options: { revealIfOpened: true }
            });
            let codeEditor;
            if (editor) {
                const ctrl = editor?.getControl();
                if ((0, editorBrowser_1.isCodeEditor)(ctrl)) {
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
                    qp.placeholder = nls.localize('editor.debug.action.stepIntoTargets.none', "No step targets available");
                }
            });
        }
    });
    async function stopHandler(accessor, _, context, disconnect, suspend) {
        const debugService = accessor.get(debug_1.IDebugService);
        let session;
        if (isSessionContext(context)) {
            session = debugService.getModel().getSession(context.sessionId);
        }
        else {
            session = debugService.getViewModel().focusedSession;
        }
        const configurationService = accessor.get(configuration_1.IConfigurationService);
        const showSubSessions = configurationService.getValue('debug').showSubSessionsInToolBar;
        // Stop should be sent to the root parent session
        while (!showSubSessions && session && session.lifecycleManagedByParent && session.parentSession) {
            session = session.parentSession;
        }
        await debugService.stopSession(session, disconnect, suspend);
    }
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.DISCONNECT_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 1024 /* KeyMod.Shift */ | 63 /* KeyCode.F5 */,
        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_FOCUSED_SESSION_IS_ATTACH, debug_1.CONTEXT_IN_DEBUG_MODE),
        handler: (accessor, _, context) => stopHandler(accessor, _, context, true)
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.DISCONNECT_AND_SUSPEND_ID,
        handler: (accessor, _, context) => stopHandler(accessor, _, context, true, true)
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.STOP_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 1024 /* KeyMod.Shift */ | 63 /* KeyCode.F5 */,
        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_FOCUSED_SESSION_IS_ATTACH.toNegated(), debug_1.CONTEXT_IN_DEBUG_MODE),
        handler: (accessor, _, context) => stopHandler(accessor, _, context, false)
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.RESTART_FRAME_ID,
        handler: async (accessor, _, context) => {
            const debugService = accessor.get(debug_1.IDebugService);
            const notificationService = accessor.get(notification_1.INotificationService);
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
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.CONTINUE_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 10,
        primary: 63 /* KeyCode.F5 */,
        when: debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'),
        handler: async (accessor, _, context) => {
            await getThreadAndRun(accessor, context, thread => thread.continue());
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.SHOW_LOADED_SCRIPTS_ID,
        handler: async (accessor) => {
            await (0, loadedScriptsPicker_1.showLoadedScriptMenu)(accessor);
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.FOCUS_REPL_ID,
        handler: async (accessor) => {
            const viewsService = accessor.get(views_1.IViewsService);
            await viewsService.openView(debug_1.REPL_VIEW_ID, true);
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: 'debug.startFromConfig',
        handler: async (accessor, config) => {
            const debugService = accessor.get(debug_1.IDebugService);
            await debugService.startDebugging(undefined, config);
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.FOCUS_SESSION_ID,
        handler: async (accessor, session) => {
            const debugService = accessor.get(debug_1.IDebugService);
            const editorService = accessor.get(editorService_1.IEditorService);
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
    commands_1.CommandsRegistry.registerCommand({
        id: exports.SELECT_AND_START_ID,
        handler: async (accessor, debugType) => {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const debugService = accessor.get(debug_1.IDebugService);
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
            quickInputService.quickAccess.show(exports.DEBUG_QUICK_ACCESS_PREFIX);
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.SELECT_DEBUG_CONSOLE_ID,
        handler: async (accessor) => {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            quickInputService.quickAccess.show(exports.DEBUG_CONSOLE_QUICK_ACCESS_PREFIX);
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.SELECT_DEBUG_SESSION_ID,
        handler: async (accessor) => {
            (0, debugSessionPicker_1.showDebugSessionMenu)(accessor, exports.SELECT_AND_START_ID);
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.DEBUG_START_COMMAND_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 63 /* KeyCode.F5 */,
        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_DEBUGGERS_AVAILABLE, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('inactive')),
        handler: async (accessor, debugStartOptions) => {
            const debugService = accessor.get(debug_1.IDebugService);
            await (0, debugUtils_1.saveAllBeforeDebugStart)(accessor.get(configuration_1.IConfigurationService), accessor.get(editorService_1.IEditorService));
            const { launch, name, getConfig } = debugService.getConfigurationManager().selectedConfiguration;
            const config = await getConfig();
            const configOrName = config ? Object.assign((0, objects_1.deepClone)(config), debugStartOptions?.config) : name;
            await debugService.startDebugging(launch, configOrName, { noDebug: debugStartOptions?.noDebug, startedByUser: true }, false);
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.DEBUG_RUN_COMMAND_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 2048 /* KeyMod.CtrlCmd */ | 63 /* KeyCode.F5 */,
        mac: { primary: 256 /* KeyMod.WinCtrl */ | 63 /* KeyCode.F5 */ },
        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_DEBUGGERS_AVAILABLE, debug_1.CONTEXT_DEBUG_STATE.notEqualsTo((0, debug_1.getStateLabel)(1 /* State.Initializing */))),
        handler: async (accessor) => {
            const commandService = accessor.get(commands_1.ICommandService);
            await commandService.executeCommand(exports.DEBUG_START_COMMAND_ID, { noDebug: true });
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'debug.toggleBreakpoint',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 5,
        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_BREAKPOINTS_FOCUSED, contextkeys_1.InputFocusedContext.toNegated()),
        primary: 10 /* KeyCode.Space */,
        handler: (accessor) => {
            const listService = accessor.get(listService_1.IListService);
            const debugService = accessor.get(debug_1.IDebugService);
            const list = listService.lastFocusedList;
            if (list instanceof listWidget_1.List) {
                const focused = list.getFocusedElements();
                if (focused && focused.length) {
                    debugService.enableOrDisableBreakpoints(!focused[0].enabled, focused[0]);
                }
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'debug.enableOrDisableBreakpoint',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: undefined,
        when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
        handler: (accessor) => {
            const debugService = accessor.get(debug_1.IDebugService);
            const editorService = accessor.get(editorService_1.IEditorService);
            const control = editorService.activeTextEditorControl;
            if ((0, editorBrowser_1.isCodeEditor)(control)) {
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
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.EDIT_EXPRESSION_COMMAND_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 5,
        when: debug_1.CONTEXT_WATCH_EXPRESSIONS_FOCUSED,
        primary: 60 /* KeyCode.F2 */,
        mac: { primary: 3 /* KeyCode.Enter */ },
        handler: (accessor, expression) => {
            const debugService = accessor.get(debug_1.IDebugService);
            if (!(expression instanceof debugModel_1.Expression)) {
                const listService = accessor.get(listService_1.IListService);
                const focused = listService.lastFocusedList;
                if (focused) {
                    const elements = focused.getFocus();
                    if (Array.isArray(elements) && elements[0] instanceof debugModel_1.Expression) {
                        expression = elements[0];
                    }
                }
            }
            if (expression instanceof debugModel_1.Expression) {
                debugService.getViewModel().setSelectedExpression(expression, false);
            }
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.SET_EXPRESSION_COMMAND_ID,
        handler: async (accessor, expression) => {
            const debugService = accessor.get(debug_1.IDebugService);
            if (expression instanceof debugModel_1.Expression || expression instanceof debugModel_1.Variable) {
                debugService.getViewModel().setSelectedExpression(expression, true);
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'debug.setVariable',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 5,
        when: debug_1.CONTEXT_VARIABLES_FOCUSED,
        primary: 60 /* KeyCode.F2 */,
        mac: { primary: 3 /* KeyCode.Enter */ },
        handler: (accessor) => {
            const listService = accessor.get(listService_1.IListService);
            const debugService = accessor.get(debug_1.IDebugService);
            const focused = listService.lastFocusedList;
            if (focused) {
                const elements = focused.getFocus();
                if (Array.isArray(elements) && elements[0] instanceof debugModel_1.Variable) {
                    debugService.getViewModel().setSelectedExpression(elements[0], false);
                }
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.REMOVE_EXPRESSION_COMMAND_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_WATCH_EXPRESSIONS_FOCUSED, debug_1.CONTEXT_EXPRESSION_SELECTED.toNegated()),
        primary: 20 /* KeyCode.Delete */,
        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */ },
        handler: (accessor, expression) => {
            const debugService = accessor.get(debug_1.IDebugService);
            if (expression instanceof debugModel_1.Expression) {
                debugService.removeWatchExpressions(expression.getId());
                return;
            }
            const listService = accessor.get(listService_1.IListService);
            const focused = listService.lastFocusedList;
            if (focused) {
                let elements = focused.getFocus();
                if (Array.isArray(elements) && elements[0] instanceof debugModel_1.Expression) {
                    const selection = focused.getSelection();
                    if (selection && selection.indexOf(elements[0]) >= 0) {
                        elements = selection;
                    }
                    elements.forEach((e) => debugService.removeWatchExpressions(e.getId()));
                }
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'debug.removeBreakpoint',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_BREAKPOINTS_FOCUSED, debug_1.CONTEXT_BREAKPOINT_INPUT_FOCUSED.toNegated()),
        primary: 20 /* KeyCode.Delete */,
        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */ },
        handler: (accessor) => {
            const listService = accessor.get(listService_1.IListService);
            const debugService = accessor.get(debug_1.IDebugService);
            const list = listService.lastFocusedList;
            if (list instanceof listWidget_1.List) {
                const focused = list.getFocusedElements();
                const element = focused.length ? focused[0] : undefined;
                if (element instanceof debugModel_1.Breakpoint) {
                    debugService.removeBreakpoints(element.getId());
                }
                else if (element instanceof debugModel_1.FunctionBreakpoint) {
                    debugService.removeFunctionBreakpoints(element.getId());
                }
                else if (element instanceof debugModel_1.DataBreakpoint) {
                    debugService.removeDataBreakpoints(element.getId());
                }
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'debug.installAdditionalDebuggers',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: undefined,
        primary: undefined,
        handler: async (accessor, query) => {
            const paneCompositeService = accessor.get(panecomposite_1.IPaneCompositePartService);
            const viewlet = (await paneCompositeService.openPaneComposite(extensions_1.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true))?.getViewPaneContainer();
            let searchFor = `@category:debuggers`;
            if (typeof query === 'string') {
                searchFor += ` ${query}`;
            }
            viewlet.search(searchFor);
            viewlet.focus();
        }
    });
    (0, actions_1.registerAction2)(class AddConfigurationAction extends actions_1.Action2 {
        constructor() {
            super({
                id: exports.ADD_CONFIGURATION_ID,
                title: { value: nls.localize('addConfiguration', "Add Configuration..."), original: 'Add Configuration...' },
                category: exports.DEBUG_COMMAND_CATEGORY,
                f1: true,
                menu: {
                    id: actions_1.MenuId.EditorContent,
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.regex(contextkeys_2.ResourceContextKey.Path.key, /\.vscode[/\\]launch\.json$/), contextkeys_2.ActiveEditorContext.isEqualTo(files_1.TEXT_FILE_EDITOR_ID))
                }
            });
        }
        async run(accessor, launchUri) {
            const manager = accessor.get(debug_1.IDebugService).getConfigurationManager();
            const launch = manager.getLaunches().find(l => l.uri.toString() === launchUri) || manager.selectedConfiguration.launch;
            if (launch) {
                const { editor, created } = await launch.openConfigFile({ preserveFocus: false });
                if (editor && !created) {
                    const codeEditor = editor.getControl();
                    if (codeEditor) {
                        await codeEditor.getContribution(debug_1.EDITOR_CONTRIBUTION_ID)?.addLaunchConfiguration();
                    }
                }
            }
        }
    });
    const inlineBreakpointHandler = (accessor) => {
        const debugService = accessor.get(debug_1.IDebugService);
        const editorService = accessor.get(editorService_1.IEditorService);
        const control = editorService.activeTextEditorControl;
        if ((0, editorBrowser_1.isCodeEditor)(control)) {
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
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 1024 /* KeyMod.Shift */ | 67 /* KeyCode.F9 */,
        when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
        id: exports.TOGGLE_INLINE_BREAKPOINT_ID,
        handler: inlineBreakpointHandler
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorContext, {
        command: {
            id: exports.TOGGLE_INLINE_BREAKPOINT_ID,
            title: nls.localize('addInlineBreakpoint', "Add Inline Breakpoint"),
            category: exports.DEBUG_COMMAND_CATEGORY
        },
        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_IN_DEBUG_MODE, contextkeys_2.PanelFocusContext.toNegated(), editorContextKeys_1.EditorContextKeys.editorTextFocus),
        group: 'debug',
        order: 1
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'debug.openBreakpointToSide',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: debug_1.CONTEXT_BREAKPOINTS_FOCUSED,
        primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
        secondary: [512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */],
        handler: (accessor) => {
            const listService = accessor.get(listService_1.IListService);
            const list = listService.lastFocusedList;
            if (list instanceof listWidget_1.List) {
                const focus = list.getFocusedElements();
                if (focus.length && focus[0] instanceof debugModel_1.Breakpoint) {
                    return (0, breakpointsView_1.openBreakpointSource)(focus[0], true, false, true, accessor.get(debug_1.IDebugService), accessor.get(editorService_1.IEditorService));
                }
            }
            return undefined;
        }
    });
    // When there are no debug extensions, open the debug viewlet when F5 is pressed so the user can read the limitations
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'debug.openView',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE.toNegated(),
        primary: 63 /* KeyCode.F5 */,
        secondary: [2048 /* KeyMod.CtrlCmd */ | 63 /* KeyCode.F5 */],
        handler: async (accessor) => {
            const paneCompositeService = accessor.get(panecomposite_1.IPaneCompositePartService);
            await paneCompositeService.openPaneComposite(debug_1.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdDb21tYW5kcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2RlYnVnL2Jyb3dzZXIvZGVidWdDb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFtQ25GLFFBQUEsb0JBQW9CLEdBQUcsd0JBQXdCLENBQUM7SUFDaEQsUUFBQSwyQkFBMkIsR0FBRyw0Q0FBNEMsQ0FBQztJQUMzRSxRQUFBLG1CQUFtQixHQUFHLHNCQUFzQixDQUFDO0lBQzdDLFFBQUEsbUJBQW1CLEdBQUcsd0NBQXdDLENBQUM7SUFDL0QsUUFBQSxZQUFZLEdBQUcsaUNBQWlDLENBQUM7SUFDakQsUUFBQSxrQkFBa0IsR0FBRyxnQ0FBZ0MsQ0FBQztJQUN0RCxRQUFBLG1CQUFtQixHQUFHLHdDQUF3QyxDQUFDO0lBQy9ELFFBQUEsWUFBWSxHQUFHLGlDQUFpQyxDQUFDO0lBQ2pELFFBQUEsWUFBWSxHQUFHLGlDQUFpQyxDQUFDO0lBQ2pELFFBQUEsbUJBQW1CLEdBQUcsdUNBQXVDLENBQUM7SUFDOUQsUUFBQSxXQUFXLEdBQUcsZ0NBQWdDLENBQUM7SUFDL0MsUUFBQSxRQUFRLEdBQUcsOEJBQThCLENBQUM7SUFDMUMsUUFBQSxhQUFhLEdBQUcsbUNBQW1DLENBQUM7SUFDcEQsUUFBQSx5QkFBeUIsR0FBRyw2Q0FBNkMsQ0FBQztJQUMxRSxRQUFBLE9BQU8sR0FBRyw2QkFBNkIsQ0FBQztJQUN4QyxRQUFBLGdCQUFnQixHQUFHLHFDQUFxQyxDQUFDO0lBQ3pELFFBQUEsV0FBVyxHQUFHLGlDQUFpQyxDQUFDO0lBQ2hELFFBQUEsYUFBYSxHQUFHLGtDQUFrQyxDQUFDO0lBQ25ELFFBQUEsaUJBQWlCLEdBQUcsb0JBQW9CLENBQUM7SUFDekMsUUFBQSxnQkFBZ0IsR0FBRyxxQ0FBcUMsQ0FBQztJQUN6RCxRQUFBLG1CQUFtQixHQUFHLHVD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