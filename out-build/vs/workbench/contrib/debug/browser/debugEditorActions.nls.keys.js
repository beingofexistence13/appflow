/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'toggleBreakpointAction',
	{ key: 'miToggleBreakpoint', comment: ['&& denotes a mnemonic'] },
	'conditionalBreakpointEditorAction',
	{ key: 'miConditionalBreakpoint', comment: ['&& denotes a mnemonic'] },
	'logPointEditorAction',
	{ key: 'miLogPoint', comment: ['&& denotes a mnemonic'] },
	'EditBreakpointEditorAction',
	{ key: 'miEditBreakpoint', comment: ['&& denotes a mnemonic'] },
	'openDisassemblyView',
	{ key: 'miDisassemblyView', comment: ['&& denotes a mnemonic'] },
	'toggleDisassemblyViewSourceCode',
	{ key: 'mitogglesource', comment: ['&& denotes a mnemonic'] },
	'runToCursor',
	'evaluateInDebugConsole',
	'addToWatch',
	'showDebugHover',
	'editor.debug.action.stepIntoTargets.notAvailable',
	{ key: 'stepIntoTargets', comment: ['Step Into Targets lets the user step into an exact function he or she is interested in.'] },
	'goToNextBreakpoint',
	'goToPreviousBreakpoint',
	'closeExceptionWidget'
]);