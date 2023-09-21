/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	"Debug type of the active debug session. For example 'python'.",
	"Debug type of the selected launch configuration. For example 'python'.",
	"State that the focused debug session is in. One of the following: 'inactive', 'initializing', 'stopped' or 'running'.",
	"Debug UX state. When there are no debug configurations it is 'simple', otherwise 'default'. Used to decide when to show welcome views in the debug viewlet.",
	"True when a debug session has been started at least once, false otherwise.",
	"True when debugging, false otherwise.",
	"True when focus is in the debug console, false otherwise.",
	"True when breakpoint editor zone widget is visible, false otherwise.",
	"True when focus is in the breakpoint editor zone widget, false otherwise.",
	"True when the BREAKPOINTS view is focused, false otherwise.",
	"True when the WATCH view is focused, false otherwsie.",
	"True when at least one watch expression exists, false otherwise.",
	"True when the VARIABLES views is focused, false otherwsie",
	"True when an expression input box is open in either the WATCH or the VARIABLES view, false otherwise.",
	"True when the input box has focus in the BREAKPOINTS view.",
	"Represents the item type of the focused element in the CALL STACK view. For example: 'session', 'thread', 'stackFrame'",
	"True when the session in the CALL STACK view is attach, false otherwise. Used internally for inline menus in the CALL STACK view.",
	"True when the focused item in the CALL STACK is stopped. Used internaly for inline menus in the CALL STACK view.",
	"True when the focused session in the CALL STACK view has exactly one thread. Used internally for inline menus in the CALL STACK view.",
	"Represents the item type of the focused element in the WATCH view. For example: 'expression', 'variable'",
	"Indicates whether the item in the view has an associated memory refrence.",
	"Represents the item type of the focused element in the BREAKPOINTS view. For example: 'breakpoint', 'exceptionBreakppint', 'functionBreakpoint', 'dataBreakpoint'",
	"True when the focused breakpoint supports conditions.",
	"True when the focused sessions supports the LOADED SCRIPTS view",
	"Represents the item type of the focused element in the LOADED SCRIPTS view.",
	"True when the focused session is 'attach'.",
	"True when the focused session supports 'stepBack' requests.",
	"True when the focused session supports 'restartFrame' requests.",
	"True when the focused stack frame suppots 'restartFrame'.",
	"True when the focused session supports 'jumpToCursor' request.",
	"True when the focused session supports 'stepIntoTargets' request.",
	"True when at least one breakpoint exists.",
	"True when there is at least one debug extensions active.",
	"True when there is at least one debug extension installed and enabled.",
	"Represents the context the debug adapter sets on the focused variable in the VARIABLES view.",
	"True when the focused session supports 'setVariable' request.",
	"True when the focused session supports 'setExpression' request.",
	"True when the focused session supports to break when value changes.",
	"True when the focused breakpoint supports to break when value is accessed.",
	"True when the focused breakpoint supports to break when value is read.",
	"True when the focused session supports the terminate debuggee capability.",
	"True when the focused session supports the suspend debuggee capability.",
	"True when the focused variable has an 'evalauteName' field set.",
	"True when the focused variable is read-only.",
	"True when the exception widget is visible.",
	"True when there is more than 1 debug console.",
	"True when there is more than 1 active debug session.",
	"True when the focused sessions supports disassemble request.",
	"True when the Disassembly View is focused.",
	"True when the language in the current editor supports disassemble request.",
	"True when the focused stack frame has instruction pointer reference.",
	"Configured debug type '{0}' is installed but not supported in this environment.",
	"Controls when the internal Debug Console should open."
]);