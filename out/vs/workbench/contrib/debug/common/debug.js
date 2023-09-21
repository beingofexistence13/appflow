/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation"], function (require, exports, nls, contextkey_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BreakpointWidgetContext = exports.IDebugService = exports.DebuggerString = exports.DebugConfigurationProviderTriggerKind = exports.DEBUG_MEMORY_SCHEME = exports.MemoryRangeType = exports.getStateLabel = exports.State = exports.INTERNAL_CONSOLE_OPTIONS_SCHEMA = exports.DEBUG_SCHEME = exports.BREAKPOINT_EDITOR_CONTRIBUTION_ID = exports.EDITOR_CONTRIBUTION_ID = exports.debuggerDisabledMessage = exports.CONTEXT_FOCUSED_STACK_FRAME_HAS_INSTRUCTION_POINTER_REFERENCE = exports.CONTEXT_LANGUAGE_SUPPORTS_DISASSEMBLE_REQUEST = exports.CONTEXT_DISASSEMBLY_VIEW_FOCUS = exports.CONTEXT_DISASSEMBLE_REQUEST_SUPPORTED = exports.CONTEXT_MULTI_SESSION_DEBUG = exports.CONTEXT_MULTI_SESSION_REPL = exports.CONTEXT_EXCEPTION_WIDGET_VISIBLE = exports.CONTEXT_VARIABLE_IS_READONLY = exports.CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT = exports.CONTEXT_SUSPEND_DEBUGGEE_SUPPORTED = exports.CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED = exports.CONTEXT_BREAK_WHEN_VALUE_IS_READ_SUPPORTED = exports.CONTEXT_BREAK_WHEN_VALUE_IS_ACCESSED_SUPPORTED = exports.CONTEXT_BREAK_WHEN_VALUE_CHANGES_SUPPORTED = exports.CONTEXT_SET_EXPRESSION_SUPPORTED = exports.CONTEXT_SET_VARIABLE_SUPPORTED = exports.CONTEXT_DEBUG_PROTOCOL_VARIABLE_MENU_CONTEXT = exports.CONTEXT_DEBUG_EXTENSION_AVAILABLE = exports.CONTEXT_DEBUGGERS_AVAILABLE = exports.CONTEXT_BREAKPOINTS_EXIST = exports.CONTEXT_STEP_INTO_TARGETS_SUPPORTED = exports.CONTEXT_JUMP_TO_CURSOR_SUPPORTED = exports.CONTEXT_STACK_FRAME_SUPPORTS_RESTART = exports.CONTEXT_RESTART_FRAME_SUPPORTED = exports.CONTEXT_STEP_BACK_SUPPORTED = exports.CONTEXT_FOCUSED_SESSION_IS_ATTACH = exports.CONTEXT_LOADED_SCRIPTS_ITEM_TYPE = exports.CONTEXT_LOADED_SCRIPTS_SUPPORTED = exports.CONTEXT_BREAKPOINT_SUPPORTS_CONDITION = exports.CONTEXT_BREAKPOINT_ITEM_TYPE = exports.CONTEXT_CAN_VIEW_MEMORY = exports.CONTEXT_WATCH_ITEM_TYPE = exports.CONTEXT_CALLSTACK_SESSION_HAS_ONE_THREAD = exports.CONTEXT_CALLSTACK_ITEM_STOPPED = exports.CONTEXT_CALLSTACK_SESSION_IS_ATTACH = exports.CONTEXT_CALLSTACK_ITEM_TYPE = exports.CONTEXT_BREAKPOINT_INPUT_FOCUSED = exports.CONTEXT_EXPRESSION_SELECTED = exports.CONTEXT_VARIABLES_FOCUSED = exports.CONTEXT_WATCH_EXPRESSIONS_EXIST = exports.CONTEXT_WATCH_EXPRESSIONS_FOCUSED = exports.CONTEXT_BREAKPOINTS_FOCUSED = exports.CONTEXT_IN_BREAKPOINT_WIDGET = exports.CONTEXT_BREAKPOINT_WIDGET_VISIBLE = exports.CONTEXT_IN_DEBUG_REPL = exports.CONTEXT_IN_DEBUG_MODE = exports.CONTEXT_HAS_DEBUGGED = exports.CONTEXT_DEBUG_UX = exports.CONTEXT_DEBUG_UX_KEY = exports.CONTEXT_DEBUG_STATE = exports.CONTEXT_DEBUG_CONFIGURATION_TYPE = exports.CONTEXT_DEBUG_TYPE = exports.REPL_VIEW_ID = exports.DEBUG_PANEL_ID = exports.DISASSEMBLY_VIEW_ID = exports.BREAKPOINTS_VIEW_ID = exports.LOADED_SCRIPTS_VIEW_ID = exports.CALLSTACK_VIEW_ID = exports.WATCH_VIEW_ID = exports.VARIABLES_VIEW_ID = exports.VIEWLET_ID = void 0;
    exports.VIEWLET_ID = 'workbench.view.debug';
    exports.VARIABLES_VIEW_ID = 'workbench.debug.variablesView';
    exports.WATCH_VIEW_ID = 'workbench.debug.watchExpressionsView';
    exports.CALLSTACK_VIEW_ID = 'workbench.debug.callStackView';
    exports.LOADED_SCRIPTS_VIEW_ID = 'workbench.debug.loadedScriptsView';
    exports.BREAKPOINTS_VIEW_ID = 'workbench.debug.breakPointsView';
    exports.DISASSEMBLY_VIEW_ID = 'workbench.debug.disassemblyView';
    exports.DEBUG_PANEL_ID = 'workbench.panel.repl';
    exports.REPL_VIEW_ID = 'workbench.panel.repl.view';
    exports.CONTEXT_DEBUG_TYPE = new contextkey_1.RawContextKey('debugType', undefined, { type: 'string', description: nls.localize('debugType', "Debug type of the active debug session. For example 'python'.") });
    exports.CONTEXT_DEBUG_CONFIGURATION_TYPE = new contextkey_1.RawContextKey('debugConfigurationType', undefined, { type: 'string', description: nls.localize('debugConfigurationType', "Debug type of the selected launch configuration. For example 'python'.") });
    exports.CONTEXT_DEBUG_STATE = new contextkey_1.RawContextKey('debugState', 'inactive', { type: 'string', description: nls.localize('debugState', "State that the focused debug session is in. One of the following: 'inactive', 'initializing', 'stopped' or 'running'.") });
    exports.CONTEXT_DEBUG_UX_KEY = 'debugUx';
    exports.CONTEXT_DEBUG_UX = new contextkey_1.RawContextKey(exports.CONTEXT_DEBUG_UX_KEY, 'default', { type: 'string', description: nls.localize('debugUX', "Debug UX state. When there are no debug configurations it is 'simple', otherwise 'default'. Used to decide when to show welcome views in the debug viewlet.") });
    exports.CONTEXT_HAS_DEBUGGED = new contextkey_1.RawContextKey('hasDebugged', false, { type: 'boolean', description: nls.localize('hasDebugged', "True when a debug session has been started at least once, false otherwise.") });
    exports.CONTEXT_IN_DEBUG_MODE = new contextkey_1.RawContextKey('inDebugMode', false, { type: 'boolean', description: nls.localize('inDebugMode', "True when debugging, false otherwise.") });
    exports.CONTEXT_IN_DEBUG_REPL = new contextkey_1.RawContextKey('inDebugRepl', false, { type: 'boolean', description: nls.localize('inDebugRepl', "True when focus is in the debug console, false otherwise.") });
    exports.CONTEXT_BREAKPOINT_WIDGET_VISIBLE = new contextkey_1.RawContextKey('breakpointWidgetVisible', false, { type: 'boolean', description: nls.localize('breakpointWidgetVisibile', "True when breakpoint editor zone widget is visible, false otherwise.") });
    exports.CONTEXT_IN_BREAKPOINT_WIDGET = new contextkey_1.RawContextKey('inBreakpointWidget', false, { type: 'boolean', description: nls.localize('inBreakpointWidget', "True when focus is in the breakpoint editor zone widget, false otherwise.") });
    exports.CONTEXT_BREAKPOINTS_FOCUSED = new contextkey_1.RawContextKey('breakpointsFocused', true, { type: 'boolean', description: nls.localize('breakpointsFocused', "True when the BREAKPOINTS view is focused, false otherwise.") });
    exports.CONTEXT_WATCH_EXPRESSIONS_FOCUSED = new contextkey_1.RawContextKey('watchExpressionsFocused', true, { type: 'boolean', description: nls.localize('watchExpressionsFocused', "True when the WATCH view is focused, false otherwsie.") });
    exports.CONTEXT_WATCH_EXPRESSIONS_EXIST = new contextkey_1.RawContextKey('watchExpressionsExist', false, { type: 'boolean', description: nls.localize('watchExpressionsExist', "True when at least one watch expression exists, false otherwise.") });
    exports.CONTEXT_VARIABLES_FOCUSED = new contextkey_1.RawContextKey('variablesFocused', true, { type: 'boolean', description: nls.localize('variablesFocused', "True when the VARIABLES views is focused, false otherwsie") });
    exports.CONTEXT_EXPRESSION_SELECTED = new contextkey_1.RawContextKey('expressionSelected', false, { type: 'boolean', description: nls.localize('expressionSelected', "True when an expression input box is open in either the WATCH or the VARIABLES view, false otherwise.") });
    exports.CONTEXT_BREAKPOINT_INPUT_FOCUSED = new contextkey_1.RawContextKey('breakpointInputFocused', false, { type: 'boolean', description: nls.localize('breakpointInputFocused', "True when the input box has focus in the BREAKPOINTS view.") });
    exports.CONTEXT_CALLSTACK_ITEM_TYPE = new contextkey_1.RawContextKey('callStackItemType', undefined, { type: 'string', description: nls.localize('callStackItemType', "Represents the item type of the focused element in the CALL STACK view. For example: 'session', 'thread', 'stackFrame'") });
    exports.CONTEXT_CALLSTACK_SESSION_IS_ATTACH = new contextkey_1.RawContextKey('callStackSessionIsAttach', false, { type: 'boolean', description: nls.localize('callStackSessionIsAttach', "True when the session in the CALL STACK view is attach, false otherwise. Used internally for inline menus in the CALL STACK view.") });
    exports.CONTEXT_CALLSTACK_ITEM_STOPPED = new contextkey_1.RawContextKey('callStackItemStopped', false, { type: 'boolean', description: nls.localize('callStackItemStopped', "True when the focused item in the CALL STACK is stopped. Used internaly for inline menus in the CALL STACK view.") });
    exports.CONTEXT_CALLSTACK_SESSION_HAS_ONE_THREAD = new contextkey_1.RawContextKey('callStackSessionHasOneThread', false, { type: 'boolean', description: nls.localize('callStackSessionHasOneThread', "True when the focused session in the CALL STACK view has exactly one thread. Used internally for inline menus in the CALL STACK view.") });
    exports.CONTEXT_WATCH_ITEM_TYPE = new contextkey_1.RawContextKey('watchItemType', undefined, { type: 'string', description: nls.localize('watchItemType', "Represents the item type of the focused element in the WATCH view. For example: 'expression', 'variable'") });
    exports.CONTEXT_CAN_VIEW_MEMORY = new contextkey_1.RawContextKey('canViewMemory', undefined, { type: 'boolean', description: nls.localize('canViewMemory', "Indicates whether the item in the view has an associated memory refrence.") });
    exports.CONTEXT_BREAKPOINT_ITEM_TYPE = new contextkey_1.RawContextKey('breakpointItemType', undefined, { type: 'string', description: nls.localize('breakpointItemType', "Represents the item type of the focused element in the BREAKPOINTS view. For example: 'breakpoint', 'exceptionBreakppint', 'functionBreakpoint', 'dataBreakpoint'") });
    exports.CONTEXT_BREAKPOINT_SUPPORTS_CONDITION = new contextkey_1.RawContextKey('breakpointSupportsCondition', false, { type: 'boolean', description: nls.localize('breakpointSupportsCondition', "True when the focused breakpoint supports conditions.") });
    exports.CONTEXT_LOADED_SCRIPTS_SUPPORTED = new contextkey_1.RawContextKey('loadedScriptsSupported', false, { type: 'boolean', description: nls.localize('loadedScriptsSupported', "True when the focused sessions supports the LOADED SCRIPTS view") });
    exports.CONTEXT_LOADED_SCRIPTS_ITEM_TYPE = new contextkey_1.RawContextKey('loadedScriptsItemType', undefined, { type: 'string', description: nls.localize('loadedScriptsItemType', "Represents the item type of the focused element in the LOADED SCRIPTS view.") });
    exports.CONTEXT_FOCUSED_SESSION_IS_ATTACH = new contextkey_1.RawContextKey('focusedSessionIsAttach', false, { type: 'boolean', description: nls.localize('focusedSessionIsAttach', "True when the focused session is 'attach'.") });
    exports.CONTEXT_STEP_BACK_SUPPORTED = new contextkey_1.RawContextKey('stepBackSupported', false, { type: 'boolean', description: nls.localize('stepBackSupported', "True when the focused session supports 'stepBack' requests.") });
    exports.CONTEXT_RESTART_FRAME_SUPPORTED = new contextkey_1.RawContextKey('restartFrameSupported', false, { type: 'boolean', description: nls.localize('restartFrameSupported', "True when the focused session supports 'restartFrame' requests.") });
    exports.CONTEXT_STACK_FRAME_SUPPORTS_RESTART = new contextkey_1.RawContextKey('stackFrameSupportsRestart', false, { type: 'boolean', description: nls.localize('stackFrameSupportsRestart', "True when the focused stack frame suppots 'restartFrame'.") });
    exports.CONTEXT_JUMP_TO_CURSOR_SUPPORTED = new contextkey_1.RawContextKey('jumpToCursorSupported', false, { type: 'boolean', description: nls.localize('jumpToCursorSupported', "True when the focused session supports 'jumpToCursor' request.") });
    exports.CONTEXT_STEP_INTO_TARGETS_SUPPORTED = new contextkey_1.RawContextKey('stepIntoTargetsSupported', false, { type: 'boolean', description: nls.localize('stepIntoTargetsSupported', "True when the focused session supports 'stepIntoTargets' request.") });
    exports.CONTEXT_BREAKPOINTS_EXIST = new contextkey_1.RawContextKey('breakpointsExist', false, { type: 'boolean', description: nls.localize('breakpointsExist', "True when at least one breakpoint exists.") });
    exports.CONTEXT_DEBUGGERS_AVAILABLE = new contextkey_1.RawContextKey('debuggersAvailable', false, { type: 'boolean', description: nls.localize('debuggersAvailable', "True when there is at least one debug extensions active.") });
    exports.CONTEXT_DEBUG_EXTENSION_AVAILABLE = new contextkey_1.RawContextKey('debugExtensionAvailable', true, { type: 'boolean', description: nls.localize('debugExtensionsAvailable', "True when there is at least one debug extension installed and enabled.") });
    exports.CONTEXT_DEBUG_PROTOCOL_VARIABLE_MENU_CONTEXT = new contextkey_1.RawContextKey('debugProtocolVariableMenuContext', undefined, { type: 'string', description: nls.localize('debugProtocolVariableMenuContext', "Represents the context the debug adapter sets on the focused variable in the VARIABLES view.") });
    exports.CONTEXT_SET_VARIABLE_SUPPORTED = new contextkey_1.RawContextKey('debugSetVariableSupported', false, { type: 'boolean', description: nls.localize('debugSetVariableSupported', "True when the focused session supports 'setVariable' request.") });
    exports.CONTEXT_SET_EXPRESSION_SUPPORTED = new contextkey_1.RawContextKey('debugSetExpressionSupported', false, { type: 'boolean', description: nls.localize('debugSetExpressionSupported', "True when the focused session supports 'setExpression' request.") });
    exports.CONTEXT_BREAK_WHEN_VALUE_CHANGES_SUPPORTED = new contextkey_1.RawContextKey('breakWhenValueChangesSupported', false, { type: 'boolean', description: nls.localize('breakWhenValueChangesSupported', "True when the focused session supports to break when value changes.") });
    exports.CONTEXT_BREAK_WHEN_VALUE_IS_ACCESSED_SUPPORTED = new contextkey_1.RawContextKey('breakWhenValueIsAccessedSupported', false, { type: 'boolean', description: nls.localize('breakWhenValueIsAccessedSupported', "True when the focused breakpoint supports to break when value is accessed.") });
    exports.CONTEXT_BREAK_WHEN_VALUE_IS_READ_SUPPORTED = new contextkey_1.RawContextKey('breakWhenValueIsReadSupported', false, { type: 'boolean', description: nls.localize('breakWhenValueIsReadSupported', "True when the focused breakpoint supports to break when value is read.") });
    exports.CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED = new contextkey_1.RawContextKey('terminateDebuggeeSupported', false, { type: 'boolean', description: nls.localize('terminateDebuggeeSupported', "True when the focused session supports the terminate debuggee capability.") });
    exports.CONTEXT_SUSPEND_DEBUGGEE_SUPPORTED = new contextkey_1.RawContextKey('suspendDebuggeeSupported', false, { type: 'boolean', description: nls.localize('suspendDebuggeeSupported', "True when the focused session supports the suspend debuggee capability.") });
    exports.CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT = new contextkey_1.RawContextKey('variableEvaluateNamePresent', false, { type: 'boolean', description: nls.localize('variableEvaluateNamePresent', "True when the focused variable has an 'evalauteName' field set.") });
    exports.CONTEXT_VARIABLE_IS_READONLY = new contextkey_1.RawContextKey('variableIsReadonly', false, { type: 'boolean', description: nls.localize('variableIsReadonly', "True when the focused variable is read-only.") });
    exports.CONTEXT_EXCEPTION_WIDGET_VISIBLE = new contextkey_1.RawContextKey('exceptionWidgetVisible', false, { type: 'boolean', description: nls.localize('exceptionWidgetVisible', "True when the exception widget is visible.") });
    exports.CONTEXT_MULTI_SESSION_REPL = new contextkey_1.RawContextKey('multiSessionRepl', false, { type: 'boolean', description: nls.localize('multiSessionRepl', "True when there is more than 1 debug console.") });
    exports.CONTEXT_MULTI_SESSION_DEBUG = new contextkey_1.RawContextKey('multiSessionDebug', false, { type: 'boolean', description: nls.localize('multiSessionDebug', "True when there is more than 1 active debug session.") });
    exports.CONTEXT_DISASSEMBLE_REQUEST_SUPPORTED = new contextkey_1.RawContextKey('disassembleRequestSupported', false, { type: 'boolean', description: nls.localize('disassembleRequestSupported', "True when the focused sessions supports disassemble request.") });
    exports.CONTEXT_DISASSEMBLY_VIEW_FOCUS = new contextkey_1.RawContextKey('disassemblyViewFocus', false, { type: 'boolean', description: nls.localize('disassemblyViewFocus', "True when the Disassembly View is focused.") });
    exports.CONTEXT_LANGUAGE_SUPPORTS_DISASSEMBLE_REQUEST = new contextkey_1.RawContextKey('languageSupportsDisassembleRequest', false, { type: 'boolean', description: nls.localize('languageSupportsDisassembleRequest', "True when the language in the current editor supports disassemble request.") });
    exports.CONTEXT_FOCUSED_STACK_FRAME_HAS_INSTRUCTION_POINTER_REFERENCE = new contextkey_1.RawContextKey('focusedStackFrameHasInstructionReference', false, { type: 'boolean', description: nls.localize('focusedStackFrameHasInstructionReference', "True when the focused stack frame has instruction pointer reference.") });
    const debuggerDisabledMessage = (debugType) => nls.localize('debuggerDisabled', "Configured debug type '{0}' is installed but not supported in this environment.", debugType);
    exports.debuggerDisabledMessage = debuggerDisabledMessage;
    exports.EDITOR_CONTRIBUTION_ID = 'editor.contrib.debug';
    exports.BREAKPOINT_EDITOR_CONTRIBUTION_ID = 'editor.contrib.breakpoint';
    exports.DEBUG_SCHEME = 'debug';
    exports.INTERNAL_CONSOLE_OPTIONS_SCHEMA = {
        enum: ['neverOpen', 'openOnSessionStart', 'openOnFirstSessionStart'],
        default: 'openOnFirstSessionStart',
        description: nls.localize('internalConsoleOptions', "Controls when the internal Debug Console should open.")
    };
    var State;
    (function (State) {
        State[State["Inactive"] = 0] = "Inactive";
        State[State["Initializing"] = 1] = "Initializing";
        State[State["Stopped"] = 2] = "Stopped";
        State[State["Running"] = 3] = "Running";
    })(State || (exports.State = State = {}));
    function getStateLabel(state) {
        switch (state) {
            case 1 /* State.Initializing */: return 'initializing';
            case 2 /* State.Stopped */: return 'stopped';
            case 3 /* State.Running */: return 'running';
            default: return 'inactive';
        }
    }
    exports.getStateLabel = getStateLabel;
    var MemoryRangeType;
    (function (MemoryRangeType) {
        MemoryRangeType[MemoryRangeType["Valid"] = 0] = "Valid";
        MemoryRangeType[MemoryRangeType["Unreadable"] = 1] = "Unreadable";
        MemoryRangeType[MemoryRangeType["Error"] = 2] = "Error";
    })(MemoryRangeType || (exports.MemoryRangeType = MemoryRangeType = {}));
    exports.DEBUG_MEMORY_SCHEME = 'vscode-debug-memory';
    var DebugConfigurationProviderTriggerKind;
    (function (DebugConfigurationProviderTriggerKind) {
        /**
         *	`DebugConfigurationProvider.provideDebugConfigurations` is called to provide the initial debug configurations for a newly created launch.json.
         */
        DebugConfigurationProviderTriggerKind[DebugConfigurationProviderTriggerKind["Initial"] = 1] = "Initial";
        /**
         * `DebugConfigurationProvider.provideDebugConfigurations` is called to provide dynamically generated debug configurations when the user asks for them through the UI (e.g. via the "Select and Start Debugging" command).
         */
        DebugConfigurationProviderTriggerKind[DebugConfigurationProviderTriggerKind["Dynamic"] = 2] = "Dynamic";
    })(DebugConfigurationProviderTriggerKind || (exports.DebugConfigurationProviderTriggerKind = DebugConfigurationProviderTriggerKind = {}));
    var DebuggerString;
    (function (DebuggerString) {
        DebuggerString["UnverifiedBreakpoints"] = "unverifiedBreakpoints";
    })(DebuggerString || (exports.DebuggerString = DebuggerString = {}));
    // Debug service interfaces
    exports.IDebugService = (0, instantiation_1.createDecorator)('debugService');
    // Editor interfaces
    var BreakpointWidgetContext;
    (function (BreakpointWidgetContext) {
        BreakpointWidgetContext[BreakpointWidgetContext["CONDITION"] = 0] = "CONDITION";
        BreakpointWidgetContext[BreakpointWidgetContext["HIT_COUNT"] = 1] = "HIT_COUNT";
        BreakpointWidgetContext[BreakpointWidgetContext["LOG_MESSAGE"] = 2] = "LOG_MESSAGE";
    })(BreakpointWidgetContext || (exports.BreakpointWidgetContext = BreakpointWidgetContext = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9kZWJ1Zy9jb21tb24vZGVidWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBMkJuRixRQUFBLFVBQVUsR0FBRyxzQkFBc0IsQ0FBQztJQUVwQyxRQUFBLGlCQUFpQixHQUFHLCtCQUErQixDQUFDO0lBQ3BELFFBQUEsYUFBYSxHQUFHLHNDQUFzQyxDQUFDO0lBQ3ZELFFBQUEsaUJBQWlCLEdBQUcsK0JBQStCLENBQUM7SUFDcEQsUUFBQSxzQkFBc0IsR0FBRyxtQ0FBbUMsQ0FBQztJQUM3RCxRQUFBLG1CQUFtQixHQUFHLGlDQUFpQyxDQUFDO0lBQ3hELFFBQUEsbUJBQW1CLEdBQUcsaUNBQWlDLENBQUM7SUFDeEQsUUFBQSxjQUFjLEdBQUcsc0JBQXNCLENBQUM7SUFDeEMsUUFBQSxZQUFZLEdBQUcsMkJBQTJCLENBQUM7SUFDM0MsUUFBQSxrQkFBa0IsR0FBRyxJQUFJLDBCQUFhLENBQVMsV0FBVyxFQUFFLFNBQVMsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLCtEQUErRCxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3BNLFFBQUEsZ0NBQWdDLEdBQUcsSUFBSSwwQkFBYSxDQUFTLHdCQUF3QixFQUFFLFNBQVMsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLEVBQUUsd0VBQXdFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDclAsUUFBQSxtQkFBbUIsR0FBRyxJQUFJLDBCQUFhLENBQVMsWUFBWSxFQUFFLFVBQVUsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENB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