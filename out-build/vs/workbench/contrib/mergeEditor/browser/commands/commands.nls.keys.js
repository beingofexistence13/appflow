/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'title',
	'layout.mixed',
	'layout.column',
	'showNonConflictingChanges',
	'layout.showBase',
	'layout.showBaseTop',
	'layout.showBaseCenter',
	'mergeEditor',
	'openfile',
	'merge.goToNextUnhandledConflict',
	'merge.goToPreviousUnhandledConflict',
	'merge.toggleCurrentConflictFromLeft',
	'merge.toggleCurrentConflictFromRight',
	'mergeEditor.compareInput1WithBase',
	'mergeEditor.compareWithBase',
	'mergeEditor.compareInput2WithBase',
	'mergeEditor.compareWithBase',
	'merge.openBaseEditor',
	'merge.acceptAllInput1',
	'merge.acceptAllInput2',
	'mergeEditor.resetResultToBaseAndAutoMerge',
	'mergeEditor.resetResultToBaseAndAutoMerge.short',
	'mergeEditor.resetChoice',
	'mergeEditor.acceptMerge',
	'mergeEditor.acceptMerge.unhandledConflicts.message',
	'mergeEditor.acceptMerge.unhandledConflicts.detail',
	{ key: 'mergeEditor.acceptMerge.unhandledConflicts.accept', comment: ['&& denotes a mnemonic'] }
]);