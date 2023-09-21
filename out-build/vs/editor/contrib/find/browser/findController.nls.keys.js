/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'too.large.for.replaceall',
	'startFindAction',
	{ key: 'miFind', comment: ['&& denotes a mnemonic'] },
	'actions.find.isRegexOverride',
	'actions.find.wholeWordOverride',
	'actions.find.matchCaseOverride',
	'actions.find.preserveCaseOverride',
	'startFindWithArgsAction',
	'startFindWithSelectionAction',
	'findNextMatchAction',
	'findPreviousMatchAction',
	'findMatchAction.goToMatch',
	'findMatchAction.noResults',
	'findMatchAction.inputPlaceHolder',
	'findMatchAction.inputValidationMessage',
	'findMatchAction.inputValidationMessage',
	'nextSelectionMatchFindAction',
	'previousSelectionMatchFindAction',
	'startReplace',
	{ key: 'miReplace', comment: ['&& denotes a mnemonic'] }
]);