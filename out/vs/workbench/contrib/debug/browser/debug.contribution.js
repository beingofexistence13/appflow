/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/base/common/platform", "vs/editor/browser/editorExtensions", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/extensions", "vs/platform/quickinput/common/quickAccess", "vs/platform/registry/common/platform", "vs/workbench/browser/editor", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/workbench/common/views", "vs/workbench/contrib/debug/browser/breakpointEditorContribution", "vs/workbench/contrib/debug/browser/breakpointsView", "vs/workbench/contrib/debug/browser/callStackEditorContribution", "vs/workbench/contrib/debug/browser/callStackView", "vs/workbench/contrib/debug/browser/debugColors", "vs/workbench/contrib/debug/browser/debugCommands", "vs/workbench/contrib/debug/browser/debugConsoleQuickAccess", "vs/workbench/contrib/debug/browser/debugEditorActions", "vs/workbench/contrib/debug/browser/debugEditorContribution", "vs/workbench/contrib/debug/browser/debugIcons", "vs/workbench/contrib/debug/browser/debugProgress", "vs/workbench/contrib/debug/browser/debugQuickAccess", "vs/workbench/contrib/debug/browser/debugService", "vs/workbench/contrib/debug/browser/debugStatus", "vs/workbench/contrib/debug/browser/debugTitle", "vs/workbench/contrib/debug/browser/debugToolBar", "vs/workbench/contrib/debug/browser/debugViewlet", "vs/workbench/contrib/debug/browser/disassemblyView", "vs/workbench/contrib/debug/browser/loadedScriptsView", "vs/workbench/contrib/debug/browser/repl", "vs/workbench/contrib/debug/browser/statusbarColorProvider", "vs/workbench/contrib/debug/browser/variablesView", "vs/workbench/contrib/debug/browser/watchExpressionsView", "vs/workbench/contrib/debug/browser/welcomeView", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugContentProvider", "vs/workbench/contrib/debug/common/debugLifecycle", "vs/workbench/contrib/debug/common/disassemblyViewInput", "vs/workbench/services/configuration/common/configuration", "vs/css!./media/debug.contribution", "vs/css!./media/debugHover"], function (require, exports, network_1, platform_1, editorExtensions_1, nls, actions_1, configurationRegistry_1, contextkey_1, descriptors_1, extensions_1, quickAccess_1, platform_2, editor_1, viewPaneContainer_1, contributions_1, editor_2, views_1, breakpointEditorContribution_1, breakpointsView_1, callStackEditorContribution_1, callStackView_1, debugColors_1, debugCommands_1, debugConsoleQuickAccess_1, debugEditorActions_1, debugEditorContribution_1, icons, debugProgress_1, debugQuickAccess_1, debugService_1, debugStatus_1, debugTitle_1, debugToolBar_1, debugViewlet_1, disassemblyView_1, loadedScriptsView_1, repl_1, statusbarColorProvider_1, variablesView_1, watchExpressionsView_1, welcomeView_1, debug_1, debugContentProvider_1, debugLifecycle_1, disassemblyViewInput_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const debugCategory = nls.localize('debugCategory', "Debug");
    (0, debugColors_1.registerColors)();
    (0, extensions_1.registerSingleton)(debug_1.IDebugService, debugService_1.DebugService, 1 /* InstantiationType.Delayed */);
    // Register Debug Workbench Contributions
    platform_2.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(debugStatus_1.DebugStatusContribution, 4 /* LifecyclePhase.Eventually */);
    platform_2.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(debugProgress_1.DebugProgressContribution, 4 /* LifecyclePhase.Eventually */);
    if (platform_1.isWeb) {
        platform_2.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(debugTitle_1.DebugTitleContribution, 4 /* LifecyclePhase.Eventually */);
    }
    platform_2.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(debugToolBar_1.DebugToolBar, 3 /* LifecyclePhase.Restored */);
    platform_2.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(debugContentProvider_1.DebugContentProvider, 4 /* LifecyclePhase.Eventually */);
    platform_2.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(statusbarColorProvider_1.StatusBarColorProvider, 4 /* LifecyclePhase.Eventually */);
    platform_2.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(disassemblyView_1.DisassemblyViewContribution, 4 /* LifecyclePhase.Eventually */);
    platform_2.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(debugLifecycle_1.DebugLifecycle, 4 /* LifecyclePhase.Eventually */);
    // Register Quick Access
    platform_2.Registry.as(quickAccess_1.Extensions.Quickaccess).registerQuickAccessProvider({
        ctor: debugQuickAccess_1.StartDebugQuickAccessProvider,
        prefix: debugCommands_1.DEBUG_QUICK_ACCESS_PREFIX,
        contextKey: 'inLaunchConfigurationsPicker',
        placeholder: nls.localize('startDebugPlaceholder', "Type the name of a launch configuration to run."),
        helpEntries: [{
                description: nls.localize('startDebuggingHelp', "Start Debugging"),
                commandId: debugCommands_1.SELECT_AND_START_ID,
                commandCenterOrder: 50
            }]
    });
    // Register quick access for debug console
    platform_2.Registry.as(quickAccess_1.Extensions.Quickaccess).registerQuickAccessProvider({
        ctor: debugConsoleQuickAccess_1.DebugConsoleQuickAccess,
        prefix: debugCommands_1.DEBUG_CONSOLE_QUICK_ACCESS_PREFIX,
        contextKey: 'inDebugConsolePicker',
        placeholder: nls.localize('tasksQuickAccessPlaceholder', "Type the name of a debug console to open."),
        helpEntries: [{ description: nls.localize('tasksQuickAccessHelp', "Show All Debug Consoles"), commandId: debugCommands_1.SELECT_DEBUG_CONSOLE_ID }]
    });
    (0, editorExtensions_1.registerEditorContribution)('editor.contrib.callStack', callStackEditorContribution_1.CallStackEditorContribution, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    (0, editorExtensions_1.registerEditorContribution)(debug_1.BREAKPOINT_EDITOR_CONTRIBUTION_ID, breakpointEditorContribution_1.BreakpointEditorContribution, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    (0, editorExtensions_1.registerEditorContribution)(debug_1.EDITOR_CONTRIBUTION_ID, debugEditorContribution_1.DebugEditorContribution, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
    const registerDebugCommandPaletteItem = (id, title, when, precondition) => {
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
            when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_DEBUGGERS_AVAILABLE, when),
            group: debugCategory,
            command: {
                id,
                title,
                category: debugCommands_1.DEBUG_COMMAND_CATEGORY,
                precondition
            }
        });
    };
    registerDebugCommandPaletteItem(debugCommands_1.RESTART_SESSION_ID, debugCommands_1.RESTART_LABEL);
    registerDebugCommandPaletteItem(debugCommands_1.TERMINATE_THREAD_ID, { value: nls.localize('terminateThread', "Terminate Thread"), original: 'Terminate Thread' }, debug_1.CONTEXT_IN_DEBUG_MODE);
    registerDebugCommandPaletteItem(debugCommands_1.STEP_OVER_ID, debugCommands_1.STEP_OVER_LABEL, debug_1.CONTEXT_IN_DEBUG_MODE, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
    registerDebugCommandPaletteItem(debugCommands_1.STEP_INTO_ID, debugCommands_1.STEP_INTO_LABEL, debug_1.CONTEXT_IN_DEBUG_MODE, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
    registerDebugCommandPaletteItem(debugCommands_1.STEP_INTO_TARGET_ID, debugCommands_1.STEP_INTO_TARGET_LABEL, debug_1.CONTEXT_IN_DEBUG_MODE, contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_STEP_INTO_TARGETS_SUPPORTED, debug_1.CONTEXT_IN_DEBUG_MODE, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped')));
    registerDebugCommandPaletteItem(debugCommands_1.STEP_OUT_ID, debugCommands_1.STEP_OUT_LABEL, debug_1.CONTEXT_IN_DEBUG_MODE, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
    registerDebugCommandPaletteItem(debugCommands_1.PAUSE_ID, debugCommands_1.PAUSE_LABEL, debug_1.CONTEXT_IN_DEBUG_MODE, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('running'));
    registerDebugCommandPaletteItem(debugCommands_1.DISCONNECT_ID, debugCommands_1.DISCONNECT_LABEL, debug_1.CONTEXT_IN_DEBUG_MODE, contextkey_1.ContextKeyExpr.or(debug_1.CONTEXT_FOCUSED_SESSION_IS_ATTACH, debug_1.CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED));
    registerDebugCommandPaletteItem(debugCommands_1.DISCONNECT_AND_SUSPEND_ID, debugCommands_1.DISCONNECT_AND_SUSPEND_LABEL, debug_1.CONTEXT_IN_DEBUG_MODE, contextkey_1.ContextKeyExpr.or(debug_1.CONTEXT_FOCUSED_SESSION_IS_ATTACH, contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_SUSPEND_DEBUGGEE_SUPPORTED, debug_1.CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED)));
    registerDebugCommandPaletteItem(debugCommands_1.STOP_ID, debugCommands_1.STOP_LABEL, debug_1.CONTEXT_IN_DEBUG_MODE, contextkey_1.ContextKeyExpr.or(debug_1.CONTEXT_FOCUSED_SESSION_IS_ATTACH.toNegated(), debug_1.CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED));
    registerDebugCommandPaletteItem(debugCommands_1.CONTINUE_ID, debugCommands_1.CONTINUE_LABEL, debug_1.CONTEXT_IN_DEBUG_MODE, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
    registerDebugCommandPaletteItem(debugCommands_1.FOCUS_REPL_ID, { value: nls.localize({ comment: ['Debug is a noun in this context, not a verb.'], key: 'debugFocusConsole' }, "Focus on Debug Console View"), original: 'Focus on Debug Console View' });
    registerDebugCommandPaletteItem(debugCommands_1.JUMP_TO_CURSOR_ID, { value: nls.localize('jumpToCursor', "Jump to Cursor"), original: 'Jump to Cursor' }, debug_1.CONTEXT_JUMP_TO_CURSOR_SUPPORTED);
    registerDebugCommandPaletteItem(debugCommands_1.JUMP_TO_CURSOR_ID, { value: nls.localize('SetNextStatement', "Set Next Statement"), original: 'Set Next Statement' }, debug_1.CONTEXT_JUMP_TO_CURSOR_SUPPORTED);
    registerDebugCommandPaletteItem(debugEditorActions_1.RunToCursorAction.ID, { value: debugEditorActions_1.RunToCursorAction.LABEL, original: 'Run to Cursor' }, debug_1.CONTEXT_DEBUGGERS_AVAILABLE);
    registerDebugCommandPaletteItem(debugEditorActions_1.SelectionToReplAction.ID, { value: debugEditorActions_1.SelectionToReplAction.LABEL, original: 'Evaluate in Debug Console' }, debug_1.CONTEXT_IN_DEBUG_MODE);
    registerDebugCommandPaletteItem(debugEditorActions_1.SelectionToWatchExpressionsAction.ID, { value: debugEditorActions_1.SelectionToWatchExpressionsAction.LABEL, original: 'Add to Watch' });
    registerDebugCommandPaletteItem(debugCommands_1.TOGGLE_INLINE_BREAKPOINT_ID, { value: nls.localize('inlineBreakpoint', "Inline Breakpoint"), original: 'Inline Breakpoint' });
    registerDebugCommandPaletteItem(debugCommands_1.DEBUG_START_COMMAND_ID, debugCommands_1.DEBUG_START_LABEL, contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_DEBUGGERS_AVAILABLE, debug_1.CONTEXT_DEBUG_STATE.notEqualsTo((0, debug_1.getStateLabel)(1 /* State.Initializing */))));
    registerDebugCommandPaletteItem(debugCommands_1.DEBUG_RUN_COMMAND_ID, debugCommands_1.DEBUG_RUN_LABEL, contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_DEBUGGERS_AVAILABLE, debug_1.CONTEXT_DEBUG_STATE.notEqualsTo((0, debug_1.getStateLabel)(1 /* State.Initializing */))));
    registerDebugCommandPaletteItem(debugCommands_1.SELECT_AND_START_ID, debugCommands_1.SELECT_AND_START_LABEL, contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_DEBUGGERS_AVAILABLE, debug_1.CONTEXT_DEBUG_STATE.notEqualsTo((0, debug_1.getStateLabel)(1 /* State.Initializing */))));
    registerDebugCommandPaletteItem(debugCommands_1.NEXT_DEBUG_CONSOLE_ID, debugCommands_1.NEXT_DEBUG_CONSOLE_LABEL);
    registerDebugCommandPaletteItem(debugCommands_1.PREV_DEBUG_CONSOLE_ID, debugCommands_1.PREV_DEBUG_CONSOLE_LABEL);
    registerDebugCommandPaletteItem(debugCommands_1.SHOW_LOADED_SCRIPTS_ID, debugCommands_1.OPEN_LOADED_SCRIPTS_LABEL, debug_1.CONTEXT_IN_DEBUG_MODE);
    registerDebugCommandPaletteItem(debugCommands_1.SELECT_DEBUG_CONSOLE_ID, debugCommands_1.SELECT_DEBUG_CONSOLE_LABEL);
    registerDebugCommandPaletteItem(debugCommands_1.SELECT_DEBUG_SESSION_ID, debugCommands_1.SELECT_DEBUG_SESSION_LABEL);
    registerDebugCommandPaletteItem(debugCommands_1.CALLSTACK_TOP_ID, debugCommands_1.CALLSTACK_TOP_LABEL, debug_1.CONTEXT_IN_DEBUG_MODE, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
    registerDebugCommandPaletteItem(debugCommands_1.CALLSTACK_BOTTOM_ID, debugCommands_1.CALLSTACK_BOTTOM_LABEL, debug_1.CONTEXT_IN_DEBUG_MODE, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
    registerDebugCommandPaletteItem(debugCommands_1.CALLSTACK_UP_ID, debugCommands_1.CALLSTACK_UP_LABEL, debug_1.CONTEXT_IN_DEBUG_MODE, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
    registerDebugCommandPaletteItem(debugCommands_1.CALLSTACK_DOWN_ID, debugCommands_1.CALLSTACK_DOWN_LABEL, debug_1.CONTEXT_IN_DEBUG_MODE, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
    // Debug callstack context menu
    const registerDebugViewMenuItem = (menuId, id, title, order, when, precondition, group = 'navigation', icon) => {
        actions_1.MenuRegistry.appendMenuItem(menuId, {
            group,
            when,
            order,
            icon,
            command: {
                id,
                title,
                icon,
                precondition
            }
        });
    };
    registerDebugViewMenuItem(actions_1.MenuId.DebugCallStackContext, debugCommands_1.RESTART_SESSION_ID, debugCommands_1.RESTART_LABEL, 10, debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('session'), undefined, '3_modification');
    registerDebugViewMenuItem(actions_1.MenuId.DebugCallStackContext, debugCommands_1.DISCONNECT_ID, debugCommands_1.DISCONNECT_LABEL, 20, debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('session'), undefined, '3_modification');
    registerDebugViewMenuItem(actions_1.MenuId.DebugCallStackContext, debugCommands_1.DISCONNECT_AND_SUSPEND_ID, debugCommands_1.DISCONNECT_AND_SUSPEND_LABEL, 21, contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('session'), debug_1.CONTEXT_SUSPEND_DEBUGGEE_SUPPORTED, debug_1.CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED), undefined, '3_modification');
    registerDebugViewMenuItem(actions_1.MenuId.DebugCallStackContext, debugCommands_1.STOP_ID, debugCommands_1.STOP_LABEL, 30, debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('session'), undefined, '3_modification');
    registerDebugViewMenuItem(actions_1.MenuId.DebugCallStackContext, debugCommands_1.PAUSE_ID, debugCommands_1.PAUSE_LABEL, 10, contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('thread'), debug_1.CONTEXT_DEBUG_STATE.isEqualTo('running')));
    registerDebugViewMenuItem(actions_1.MenuId.DebugCallStackContext, debugCommands_1.CONTINUE_ID, debugCommands_1.CONTINUE_LABEL, 10, contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('thread'), debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped')));
    registerDebugViewMenuItem(actions_1.MenuId.DebugCallStackContext, debugCommands_1.STEP_OVER_ID, debugCommands_1.STEP_OVER_LABEL, 20, debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('thread'), debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
    registerDebugViewMenuItem(actions_1.MenuId.DebugCallStackContext, debugCommands_1.STEP_INTO_ID, debugCommands_1.STEP_INTO_LABEL, 30, debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('thread'), debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
    registerDebugViewMenuItem(actions_1.MenuId.DebugCallStackContext, debugCommands_1.STEP_OUT_ID, debugCommands_1.STEP_OUT_LABEL, 40, debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('thread'), debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
    registerDebugViewMenuItem(actions_1.MenuId.DebugCallStackContext, debugCommands_1.TERMINATE_THREAD_ID, nls.localize('terminateThread', "Terminate Thread"), 10, debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('thread'), undefined, 'termination');
    registerDebugViewMenuItem(actions_1.MenuId.DebugCallStackContext, debugCommands_1.RESTART_FRAME_ID, nls.localize('restartFrame', "Restart Frame"), 10, contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('stackFrame'), debug_1.CONTEXT_RESTART_FRAME_SUPPORTED), debug_1.CONTEXT_STACK_FRAME_SUPPORTS_RESTART);
    registerDebugViewMenuItem(actions_1.MenuId.DebugCallStackContext, debugCommands_1.COPY_STACK_TRACE_ID, nls.localize('copyStackTrace', "Copy Call Stack"), 20, debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('stackFrame'), undefined, '3_modification');
    registerDebugViewMenuItem(actions_1.MenuId.DebugVariablesContext, variablesView_1.VIEW_MEMORY_ID, nls.localize('viewMemory', "View Binary Data"), 15, debug_1.CONTEXT_CAN_VIEW_MEMORY, debug_1.CONTEXT_IN_DEBUG_MODE, 'inline', icons.debugInspectMemory);
    registerDebugViewMenuItem(actions_1.MenuId.DebugVariablesContext, variablesView_1.SET_VARIABLE_ID, nls.localize('setValue', "Set Value"), 10, contextkey_1.ContextKeyExpr.or(debug_1.CONTEXT_SET_VARIABLE_SUPPORTED, contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT, debug_1.CONTEXT_SET_EXPRESSION_SUPPORTED)), debug_1.CONTEXT_VARIABLE_IS_READONLY.toNegated(), '3_modification');
    registerDebugViewMenuItem(actions_1.MenuId.DebugVariablesContext, variablesView_1.COPY_VALUE_ID, nls.localize('copyValue', "Copy Value"), 10, undefined, undefined, '5_cutcopypaste');
    registerDebugViewMenuItem(actions_1.MenuId.DebugVariablesContext, variablesView_1.COPY_EVALUATE_PATH_ID, nls.localize('copyAsExpression', "Copy as Expression"), 20, debug_1.CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT, undefined, '5_cutcopypaste');
    registerDebugViewMenuItem(actions_1.MenuId.DebugVariablesContext, variablesView_1.ADD_TO_WATCH_ID, nls.localize('addToWatchExpressions', "Add to Watch"), 100, debug_1.CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT, undefined, 'z_commands');
    registerDebugViewMenuItem(actions_1.MenuId.DebugVariablesContext, variablesView_1.BREAK_WHEN_VALUE_IS_READ_ID, nls.localize('breakWhenValueIsRead', "Break on Value Read"), 200, debug_1.CONTEXT_BREAK_WHEN_VALUE_IS_READ_SUPPORTED, undefined, 'z_commands');
    registerDebugViewMenuItem(actions_1.MenuId.DebugVariablesContext, variablesView_1.BREAK_WHEN_VALUE_CHANGES_ID, nls.localize('breakWhenValueChanges', "Break on Value Change"), 210, debug_1.CONTEXT_BREAK_WHEN_VALUE_CHANGES_SUPPORTED, undefined, 'z_commands');
    registerDebugViewMenuItem(actions_1.MenuId.DebugVariablesContext, variablesView_1.BREAK_WHEN_VALUE_IS_ACCESSED_ID, nls.localize('breakWhenValueIsAccessed', "Break on Value Access"), 220, debug_1.CONTEXT_BREAK_WHEN_VALUE_IS_ACCESSED_SUPPORTED, undefined, 'z_commands');
    registerDebugViewMenuItem(actions_1.MenuId.DebugWatchContext, watchExpressionsView_1.ADD_WATCH_ID, watchExpressionsView_1.ADD_WATCH_LABEL, 10, undefined, undefined, '3_modification');
    registerDebugViewMenuItem(actions_1.MenuId.DebugWatchContext, debugCommands_1.EDIT_EXPRESSION_COMMAND_ID, nls.localize('editWatchExpression', "Edit Expression"), 20, debug_1.CONTEXT_WATCH_ITEM_TYPE.isEqualTo('expression'), undefined, '3_modification');
    registerDebugViewMenuItem(actions_1.MenuId.DebugWatchContext, debugCommands_1.SET_EXPRESSION_COMMAND_ID, nls.localize('setValue', "Set Value"), 30, contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_WATCH_ITEM_TYPE.isEqualTo('expression'), debug_1.CONTEXT_SET_EXPRESSION_SUPPORTED), contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_WATCH_ITEM_TYPE.isEqualTo('variable'), debug_1.CONTEXT_SET_VARIABLE_SUPPORTED)), debug_1.CONTEXT_VARIABLE_IS_READONLY.toNegated(), '3_modification');
    registerDebugViewMenuItem(actions_1.MenuId.DebugWatchContext, variablesView_1.COPY_VALUE_ID, nls.localize('copyValue', "Copy Value"), 40, contextkey_1.ContextKeyExpr.or(debug_1.CONTEXT_WATCH_ITEM_TYPE.isEqualTo('expression'), debug_1.CONTEXT_WATCH_ITEM_TYPE.isEqualTo('variable')), debug_1.CONTEXT_IN_DEBUG_MODE, '3_modification');
    registerDebugViewMenuItem(actions_1.MenuId.DebugWatchContext, variablesView_1.VIEW_MEMORY_ID, nls.localize('viewMemory', "View Binary Data"), 10, debug_1.CONTEXT_CAN_VIEW_MEMORY, undefined, 'inline', icons.debugInspectMemory);
    registerDebugViewMenuItem(actions_1.MenuId.DebugWatchContext, debugCommands_1.REMOVE_EXPRESSION_COMMAND_ID, nls.localize('removeWatchExpression', "Remove Expression"), 20, debug_1.CONTEXT_WATCH_ITEM_TYPE.isEqualTo('expression'), undefined, 'inline', icons.watchExpressionRemove);
    registerDebugViewMenuItem(actions_1.MenuId.DebugWatchContext, watchExpressionsView_1.REMOVE_WATCH_EXPRESSIONS_COMMAND_ID, watchExpressionsView_1.REMOVE_WATCH_EXPRESSIONS_LABEL, 20, undefined, undefined, 'z_commands');
    // Touch Bar
    if (platform_1.isMacintosh) {
        const registerTouchBarEntry = (id, title, order, when, iconUri) => {
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.TouchBarContext, {
                command: {
                    id,
                    title,
                    icon: { dark: iconUri }
                },
                when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_DEBUGGERS_AVAILABLE, when),
                group: '9_debug',
                order
            });
        };
        registerTouchBarEntry(debugCommands_1.DEBUG_RUN_COMMAND_ID, debugCommands_1.DEBUG_RUN_LABEL, 0, debug_1.CONTEXT_IN_DEBUG_MODE.toNegated(), network_1.FileAccess.asFileUri('vs/workbench/contrib/debug/browser/media/continue-tb.png'));
        registerTouchBarEntry(debugCommands_1.DEBUG_START_COMMAND_ID, debugCommands_1.DEBUG_START_LABEL, 1, debug_1.CONTEXT_IN_DEBUG_MODE.toNegated(), network_1.FileAccess.asFileUri('vs/workbench/contrib/debug/browser/media/run-with-debugging-tb.png'));
        registerTouchBarEntry(debugCommands_1.CONTINUE_ID, debugCommands_1.CONTINUE_LABEL, 0, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'), network_1.FileAccess.asFileUri('vs/workbench/contrib/debug/browser/media/continue-tb.png'));
        registerTouchBarEntry(debugCommands_1.PAUSE_ID, debugCommands_1.PAUSE_LABEL, 1, contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_IN_DEBUG_MODE, contextkey_1.ContextKeyExpr.notEquals('debugState', 'stopped')), network_1.FileAccess.asFileUri('vs/workbench/contrib/debug/browser/media/pause-tb.png'));
        registerTouchBarEntry(debugCommands_1.STEP_OVER_ID, debugCommands_1.STEP_OVER_LABEL, 2, debug_1.CONTEXT_IN_DEBUG_MODE, network_1.FileAccess.asFileUri('vs/workbench/contrib/debug/browser/media/stepover-tb.png'));
        registerTouchBarEntry(debugCommands_1.STEP_INTO_ID, debugCommands_1.STEP_INTO_LABEL, 3, debug_1.CONTEXT_IN_DEBUG_MODE, network_1.FileAccess.asFileUri('vs/workbench/contrib/debug/browser/media/stepinto-tb.png'));
        registerTouchBarEntry(debugCommands_1.STEP_OUT_ID, debugCommands_1.STEP_OUT_LABEL, 4, debug_1.CONTEXT_IN_DEBUG_MODE, network_1.FileAccess.asFileUri('vs/workbench/contrib/debug/browser/media/stepout-tb.png'));
        registerTouchBarEntry(debugCommands_1.RESTART_SESSION_ID, debugCommands_1.RESTART_LABEL, 5, debug_1.CONTEXT_IN_DEBUG_MODE, network_1.FileAccess.asFileUri('vs/workbench/contrib/debug/browser/media/restart-tb.png'));
        registerTouchBarEntry(debugCommands_1.STOP_ID, debugCommands_1.STOP_LABEL, 6, debug_1.CONTEXT_IN_DEBUG_MODE, network_1.FileAccess.asFileUri('vs/workbench/contrib/debug/browser/media/stop-tb.png'));
    }
    // Editor Title Menu's "Run/Debug" dropdown item
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, { submenu: actions_1.MenuId.EditorTitleRun, rememberDefaultAction: true, title: { value: nls.localize('run', "Run or Debug..."), original: 'Run or Debug...', }, icon: icons.debugRun, group: 'navigation', order: -1 });
    // Debug menu
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarMainMenu, {
        submenu: actions_1.MenuId.MenubarDebugMenu,
        title: {
            value: 'Run',
            original: 'Run',
            mnemonicTitle: nls.localize({ key: 'mRun', comment: ['&& denotes a mnemonic'] }, "&&Run")
        },
        order: 6
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarDebugMenu, {
        group: '1_debug',
        command: {
            id: debugCommands_1.DEBUG_START_COMMAND_ID,
            title: nls.localize({ key: 'miStartDebugging', comment: ['&& denotes a mnemonic'] }, "&&Start Debugging")
        },
        order: 1,
        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarDebugMenu, {
        group: '1_debug',
        command: {
            id: debugCommands_1.DEBUG_RUN_COMMAND_ID,
            title: nls.localize({ key: 'miRun', comment: ['&& denotes a mnemonic'] }, "Run &&Without Debugging")
        },
        order: 2,
        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarDebugMenu, {
        group: '1_debug',
        command: {
            id: debugCommands_1.STOP_ID,
            title: nls.localize({ key: 'miStopDebugging', comment: ['&& denotes a mnemonic'] }, "&&Stop Debugging"),
            precondition: debug_1.CONTEXT_IN_DEBUG_MODE
        },
        order: 3,
        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarDebugMenu, {
        group: '1_debug',
        command: {
            id: debugCommands_1.RESTART_SESSION_ID,
            title: nls.localize({ key: 'miRestart Debugging', comment: ['&& denotes a mnemonic'] }, "&&Restart Debugging"),
            precondition: debug_1.CONTEXT_IN_DEBUG_MODE
        },
        order: 4,
        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
    });
    // Configuration
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarDebugMenu, {
        group: '2_configuration',
        command: {
            id: debugCommands_1.ADD_CONFIGURATION_ID,
            title: nls.localize({ key: 'miAddConfiguration', comment: ['&& denotes a mnemonic'] }, "A&&dd Configuration...")
        },
        order: 2,
        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
    });
    // Step Commands
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarDebugMenu, {
        group: '3_step',
        command: {
            id: debugCommands_1.STEP_OVER_ID,
            title: nls.localize({ key: 'miStepOver', comment: ['&& denotes a mnemonic'] }, "Step &&Over"),
            precondition: debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped')
        },
        order: 1,
        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarDebugMenu, {
        group: '3_step',
        command: {
            id: debugCommands_1.STEP_INTO_ID,
            title: nls.localize({ key: 'miStepInto', comment: ['&& denotes a mnemonic'] }, "Step &&Into"),
            precondition: debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped')
        },
        order: 2,
        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarDebugMenu, {
        group: '3_step',
        command: {
            id: debugCommands_1.STEP_OUT_ID,
            title: nls.localize({ key: 'miStepOut', comment: ['&& denotes a mnemonic'] }, "Step O&&ut"),
            precondition: debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped')
        },
        order: 3,
        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarDebugMenu, {
        group: '3_step',
        command: {
            id: debugCommands_1.CONTINUE_ID,
            title: nls.localize({ key: 'miContinue', comment: ['&& denotes a mnemonic'] }, "&&Continue"),
            precondition: debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped')
        },
        order: 4,
        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
    });
    // New Breakpoints
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarNewBreakpointMenu, {
        group: '1_breakpoints',
        command: {
            id: debugCommands_1.TOGGLE_INLINE_BREAKPOINT_ID,
            title: nls.localize({ key: 'miInlineBreakpoint', comment: ['&& denotes a mnemonic'] }, "Inline Breakp&&oint")
        },
        order: 2,
        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarDebugMenu, {
        group: '4_new_breakpoint',
        title: nls.localize({ key: 'miNewBreakpoint', comment: ['&& denotes a mnemonic'] }, "&&New Breakpoint"),
        submenu: actions_1.MenuId.MenubarNewBreakpointMenu,
        order: 2,
        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
    });
    // Breakpoint actions are registered from breakpointsView.ts
    // Install Debuggers
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarDebugMenu, {
        group: 'z_install',
        command: {
            id: 'debug.installAdditionalDebuggers',
            title: nls.localize({ key: 'miInstallAdditionalDebuggers', comment: ['&& denotes a mnemonic'] }, "&&Install Additional Debuggers...")
        },
        order: 1
    });
    // register repl panel
    const VIEW_CONTAINER = platform_2.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: debug_1.DEBUG_PANEL_ID,
        title: { value: nls.localize({ comment: ['Debug is a noun in this context, not a verb.'], key: 'debugPanel' }, "Debug Console"), original: 'Debug Console' },
        icon: icons.debugConsoleViewIcon,
        ctorDescriptor: new descriptors_1.SyncDescriptor(viewPaneContainer_1.ViewPaneContainer, [debug_1.DEBUG_PANEL_ID, { mergeViewWithContainerWhenSingleView: true }]),
        storageId: debug_1.DEBUG_PANEL_ID,
        hideIfEmpty: true,
        order: 2,
    }, 1 /* ViewContainerLocation.Panel */, { doNotRegisterOpenCommand: true });
    platform_2.Registry.as(views_1.Extensions.ViewsRegistry).registerViews([{
            id: debug_1.REPL_VIEW_ID,
            name: nls.localize({ comment: ['Debug is a noun in this context, not a verb.'], key: 'debugPanel' }, "Debug Console"),
            containerIcon: icons.debugConsoleViewIcon,
            canToggleVisibility: false,
            canMoveView: true,
            when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE,
            ctorDescriptor: new descriptors_1.SyncDescriptor(repl_1.Repl),
            openCommandActionDescriptor: {
                id: 'workbench.debug.action.toggleRepl',
                mnemonicTitle: nls.localize({ key: 'miToggleDebugConsole', comment: ['&& denotes a mnemonic'] }, "De&&bug Console"),
                keybindings: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 55 /* KeyCode.KeyY */ },
                order: 2
            }
        }], VIEW_CONTAINER);
    const viewContainer = platform_2.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: debug_1.VIEWLET_ID,
        title: { value: nls.localize('run and debug', "Run and Debug"), original: 'Run and Debug' },
        openCommandActionDescriptor: {
            id: debug_1.VIEWLET_ID,
            mnemonicTitle: nls.localize({ key: 'miViewRun', comment: ['&& denotes a mnemonic'] }, "&&Run"),
            keybindings: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 34 /* KeyCode.KeyD */ },
            order: 3
        },
        ctorDescriptor: new descriptors_1.SyncDescriptor(debugViewlet_1.DebugViewPaneContainer),
        icon: icons.runViewIcon,
        alwaysUseContainerInfo: true,
        order: 3,
    }, 0 /* ViewContainerLocation.Sidebar */);
    // Register default debug views
    const viewsRegistry = platform_2.Registry.as(views_1.Extensions.ViewsRegistry);
    viewsRegistry.registerViews([{ id: debug_1.VARIABLES_VIEW_ID, name: nls.localize('variables', "Variables"), containerIcon: icons.variablesViewIcon, ctorDescriptor: new descriptors_1.SyncDescriptor(variablesView_1.VariablesView), order: 10, weight: 40, canToggleVisibility: true, canMoveView: true, focusCommand: { id: 'workbench.debug.action.focusVariablesView' }, when: debug_1.CONTEXT_DEBUG_UX.isEqualTo('default') }], viewContainer);
    viewsRegistry.registerViews([{ id: debug_1.WATCH_VIEW_ID, name: nls.localize('watch', "Watch"), containerIcon: icons.watchViewIcon, ctorDescriptor: new descriptors_1.SyncDescriptor(watchExpressionsView_1.WatchExpressionsView), order: 20, weight: 10, canToggleVisibility: true, canMoveView: true, focusCommand: { id: 'workbench.debug.action.focusWatchView' }, when: debug_1.CONTEXT_DEBUG_UX.isEqualTo('default') }], viewContainer);
    viewsRegistry.registerViews([{ id: debug_1.CALLSTACK_VIEW_ID, name: nls.localize('callStack', "Call Stack"), containerIcon: icons.callStackViewIcon, ctorDescriptor: new descriptors_1.SyncDescriptor(callStackView_1.CallStackView), order: 30, weight: 30, canToggleVisibility: true, canMoveView: true, focusCommand: { id: 'workbench.debug.action.focusCallStackView' }, when: debug_1.CONTEXT_DEBUG_UX.isEqualTo('default') }], viewContainer);
    viewsRegistry.registerViews([{ id: debug_1.BREAKPOINTS_VIEW_ID, name: nls.localize('breakpoints', "Breakpoints"), containerIcon: icons.breakpointsViewIcon, ctorDescriptor: new descriptors_1.SyncDescriptor(breakpointsView_1.BreakpointsView), order: 40, weight: 20, canToggleVisibility: true, canMoveView: true, focusCommand: { id: 'workbench.debug.action.focusBreakpointsView' }, when: contextkey_1.ContextKeyExpr.or(debug_1.CONTEXT_BREAKPOINTS_EXIST, debug_1.CONTEXT_DEBUG_UX.isEqualTo('default'), debug_1.CONTEXT_HAS_DEBUGGED) }], viewContainer);
    viewsRegistry.registerViews([{ id: welcomeView_1.WelcomeView.ID, name: welcomeView_1.WelcomeView.LABEL, containerIcon: icons.runViewIcon, ctorDescriptor: new descriptors_1.SyncDescriptor(welcomeView_1.WelcomeView), order: 1, weight: 40, canToggleVisibility: true, when: debug_1.CONTEXT_DEBUG_UX.isEqualTo('simple') }], viewContainer);
    viewsRegistry.registerViews([{ id: debug_1.LOADED_SCRIPTS_VIEW_ID, name: nls.localize('loadedScripts', "Loaded Scripts"), containerIcon: icons.loadedScriptsViewIcon, ctorDescriptor: new descriptors_1.SyncDescriptor(loadedScriptsView_1.LoadedScriptsView), order: 35, weight: 5, canToggleVisibility: true, canMoveView: true, collapsed: true, when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_LOADED_SCRIPTS_SUPPORTED, debug_1.CONTEXT_DEBUG_UX.isEqualTo('default')) }], viewContainer);
    // Register disassembly view
    platform_2.Registry.as(editor_2.EditorExtensions.EditorPane).registerEditorPane(editor_1.EditorPaneDescriptor.create(disassemblyView_1.DisassemblyView, debug_1.DISASSEMBLY_VIEW_ID, nls.localize('disassembly', "Disassembly")), [new descriptors_1.SyncDescriptor(disassemblyViewInput_1.DisassemblyViewInput)]);
    // Register configuration
    const configurationRegistry = platform_2.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        id: 'debug',
        order: 20,
        title: nls.localize('debugConfigurationTitle', "Debug"),
        type: 'object',
        properties: {
            'debug.allowBreakpointsEverywhere': {
                type: 'boolean',
                description: nls.localize({ comment: ['This is the description for a setting'], key: 'allowBreakpointsEverywhere' }, "Allow setting breakpoints in any file."),
                default: false
            },
            'debug.openExplorerOnEnd': {
                type: 'boolean',
                description: nls.localize({ comment: ['This is the description for a setting'], key: 'openExplorerOnEnd' }, "Automatically open the explorer view at the end of a debug session."),
                default: false
            },
            'debug.inlineValues': {
                type: 'string',
                'enum': ['on', 'off', 'auto'],
                description: nls.localize({ comment: ['This is the description for a setting'], key: 'inlineValues' }, "Show variable values inline in editor while debugging."),
                'enumDescriptions': [
                    nls.localize('inlineValues.on', "Always show variable values inline in editor while debugging."),
                    nls.localize('inlineValues.off', "Never show variable values inline in editor while debugging."),
                    nls.localize('inlineValues.focusNoScroll', "Show variable values inline in editor while debugging when the language supports inline value locations."),
                ],
                default: 'auto'
            },
            'debug.toolBarLocation': {
                enum: ['floating', 'docked', 'commandCenter', 'hidden'],
                markdownDescription: nls.localize({ comment: ['This is the description for a setting'], key: 'toolBarLocation' }, "Controls the location of the debug toolbar. Either `floating` in all views, `docked` in the debug view, `commandCenter` (requires `{0}`), or `hidden`.", '#window.commandCenter#', '#window.titleBarStyle#'),
                default: 'floating',
                enumDescriptions: [
                    nls.localize('debugToolBar.floating', "Show debug toolbar in all views."),
                    nls.localize('debugToolBar.docked', "Show debug toolbar only in debug views."),
                    nls.localize('debugToolBar.commandCenter', "Show debug toolbar in the command center."),
                    nls.localize('debugToolBar.hidden', "Do not show debug toolbar."),
                ]
            },
            'debug.showInStatusBar': {
                enum: ['never', 'always', 'onFirstSessionStart'],
                enumDescriptions: [nls.localize('never', "Never show debug in Status bar"), nls.localize('always', "Always show debug in Status bar"), nls.localize('onFirstSessionStart', "Show debug in Status bar only after debug was started for the first time")],
                description: nls.localize({ comment: ['This is the description for a setting'], key: 'showInStatusBar' }, "Controls when the debug Status bar should be visible."),
                default: 'onFirstSessionStart'
            },
            'debug.internalConsoleOptions': debug_1.INTERNAL_CONSOLE_OPTIONS_SCHEMA,
            'debug.console.closeOnEnd': {
                type: 'boolean',
                description: nls.localize('debug.console.closeOnEnd', "Controls if the Debug Console should be automatically closed when the debug session ends."),
                default: false
            },
            'debug.terminal.clearBeforeReusing': {
                type: 'boolean',
                description: nls.localize({ comment: ['This is the description for a setting'], key: 'debug.terminal.clearBeforeReusing' }, "Before starting a new debug session in an integrated or external terminal, clear the terminal."),
                default: false
            },
            'debug.openDebug': {
                enum: ['neverOpen', 'openOnSessionStart', 'openOnFirstSessionStart', 'openOnDebugBreak'],
                default: 'openOnDebugBreak',
                description: nls.localize('openDebug', "Controls when the debug view should open.")
            },
            'debug.showSubSessionsInToolBar': {
                type: 'boolean',
                description: nls.localize({ comment: ['This is the description for a setting'], key: 'showSubSessionsInToolBar' }, "Controls whether the debug sub-sessions are shown in the debug tool bar. When this setting is false the stop command on a sub-session will also stop the parent session."),
                default: false
            },
            'debug.console.fontSize': {
                type: 'number',
                description: nls.localize('debug.console.fontSize', "Controls the font size in pixels in the Debug Console."),
                default: platform_1.isMacintosh ? 12 : 14,
            },
            'debug.console.fontFamily': {
                type: 'string',
                description: nls.localize('debug.console.fontFamily', "Controls the font family in the Debug Console."),
                default: 'default'
            },
            'debug.console.lineHeight': {
                type: 'number',
                description: nls.localize('debug.console.lineHeight', "Controls the line height in pixels in the Debug Console. Use 0 to compute the line height from the font size."),
                default: 0
            },
            'debug.console.wordWrap': {
                type: 'boolean',
                description: nls.localize('debug.console.wordWrap', "Controls if the lines should wrap in the Debug Console."),
                default: true
            },
            'debug.console.historySuggestions': {
                type: 'boolean',
                description: nls.localize('debug.console.historySuggestions', "Controls if the Debug Console should suggest previously typed input."),
                default: true
            },
            'debug.console.collapseIdenticalLines': {
                type: 'boolean',
                description: nls.localize('debug.console.collapseIdenticalLines', "Controls if the Debug Console should collapse identical lines and show a number of occurrences with a badge."),
                default: true
            },
            'debug.console.acceptSuggestionOnEnter': {
                enum: ['off', 'on'],
                description: nls.localize('debug.console.acceptSuggestionOnEnter', "Controls whether suggestions should be accepted on Enter in the Debug Console. Enter is also used to evaluate whatever is typed in the Debug Console."),
                default: 'off'
            },
            'launch': {
                type: 'object',
                description: nls.localize({ comment: ['This is the description for a setting'], key: 'launch' }, "Global debug launch configuration. Should be used as an alternative to 'launch.json' that is shared across workspaces."),
                default: { configurations: [], compounds: [] },
                $ref: configuration_1.launchSchemaId
            },
            'debug.focusWindowOnBreak': {
                type: 'boolean',
                description: nls.localize('debug.focusWindowOnBreak', "Controls whether the workbench window should be focused when the debugger breaks."),
                default: true
            },
            'debug.focusEditorOnBreak': {
                type: 'boolean',
                description: nls.localize('debug.focusEditorOnBreak', "Controls whether the editor should be focused when the debugger breaks."),
                default: true
            },
            'debug.onTaskErrors': {
                enum: ['debugAnyway', 'showErrors', 'prompt', 'abort'],
                enumDescriptions: [nls.localize('debugAnyway', "Ignore task errors and start debugging."), nls.localize('showErrors', "Show the Problems view and do not start debugging."), nls.localize('prompt', "Prompt user."), nls.localize('cancel', "Cancel debugging.")],
                description: nls.localize('debug.onTaskErrors', "Controls what to do when errors are encountered after running a preLaunchTask."),
                default: 'prompt'
            },
            'debug.showBreakpointsInOverviewRuler': {
                type: 'boolean',
                description: nls.localize({ comment: ['This is the description for a setting'], key: 'showBreakpointsInOverviewRuler' }, "Controls whether breakpoints should be shown in the overview ruler."),
                default: false
            },
            'debug.showInlineBreakpointCandidates': {
                type: 'boolean',
                description: nls.localize({ comment: ['This is the description for a setting'], key: 'showInlineBreakpointCandidates' }, "Controls whether inline breakpoints candidate decorations should be shown in the editor while debugging."),
                default: true
            },
            'debug.saveBeforeStart': {
                description: nls.localize('debug.saveBeforeStart', "Controls what editors to save before starting a debug session."),
                enum: ['allEditorsInActiveGroup', 'nonUntitledEditorsInActiveGroup', 'none'],
                enumDescriptions: [
                    nls.localize('debug.saveBeforeStart.allEditorsInActiveGroup', "Save all editors in the active group before starting a debug session."),
                    nls.localize('debug.saveBeforeStart.nonUntitledEditorsInActiveGroup', "Save all editors in the active group except untitled ones before starting a debug session."),
                    nls.localize('debug.saveBeforeStart.none', "Don't save any editors before starting a debug session."),
                ],
                default: 'allEditorsInActiveGroup',
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */
            },
            'debug.confirmOnExit': {
                description: nls.localize('debug.confirmOnExit', "Controls whether to confirm when the window closes if there are active debug sessions."),
                type: 'string',
                enum: ['never', 'always'],
                enumDescriptions: [
                    nls.localize('debug.confirmOnExit.never', "Never confirm."),
                    nls.localize('debug.confirmOnExit.always', "Always confirm if there are debug sessions."),
                ],
                default: 'never'
            },
            'debug.disassemblyView.showSourceCode': {
                type: 'boolean',
                default: true,
                description: nls.localize('debug.disassemblyView.showSourceCode', "Show Source Code in Disassembly View.")
            },
            'debug.autoExpandLazyVariables': {
                type: 'boolean',
                default: false,
                description: nls.localize('debug.autoExpandLazyVariables', "Automatically show values for variables that are lazily resolved by the debugger, such as getters.")
            },
            'debug.enableStatusBarColor': {
                type: 'boolean',
                description: nls.localize('debug.enableStatusBarColor', "Color status bar when debugger is active"),
                default: true
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWcuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvYnJvd3Nlci9kZWJ1Zy5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFzRGhHLE1BQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzdELElBQUEsNEJBQWMsR0FBRSxDQUFDO0lBQ2pCLElBQUEsOEJBQWlCLEVBQUMscUJBQWEsRUFBRSwyQkFBWSxvQ0FBNEIsQ0FBQztJQUUxRSx5Q0FBeUM7SUFDekMsbUJBQVEsQ0FBQyxFQUFFLENBQWtDLDBCQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDLDZCQUE2QixDQUFDLHFDQUF1QixvQ0FBNEIsQ0FBQztJQUM5SixtQkFBUSxDQUFDLEVBQUUsQ0FBa0MsMEJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUMsNkJBQTZCLENBQUMseUNBQXlCLG9DQUE0QixDQUFDO0lBQ2hLLElBQUksZ0JBQUssRUFBRTtRQUNWLG1CQUFRLENBQUMsRUFBRSxDQUFrQywwQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyw2QkFBNkIsQ0FBQyxtQ0FBc0Isb0NBQTRCLENBQUM7S0FDN0o7SUFDRCxtQkFBUSxDQUFDLEVBQUUsQ0FBa0MsMEJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUMsNkJBQTZCLENBQUMsMkJBQVksa0NBQTBCLENBQUM7SUFDakosbUJBQVEsQ0FBQyxFQUFFLENBQWtDLDBCQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDLDZCQUE2QixDQUFDLDJDQUFvQixvQ0FBNEIsQ0FBQztJQUMzSixtQkFBUSxDQUFDLEVBQUUsQ0FBa0MsMEJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUMsNkJBQTZCLENBQUMsK0NBQXNCLG9DQUE0QixDQUFD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