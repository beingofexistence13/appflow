/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'notebookFormatSave.formatting',
	'formatNotebook',
	'trimNotebookWhitespace',
	'trimNotebookNewlines',
	'insertFinalNewLine',
	'notebookSaveParticipants.notebookCodeActions',
	'notebookSaveParticipants.cellCodeActions',
	{ key: 'codeaction.get2', comment: ['[configure]({1}) is a link. Only translate `configure`. Do not change brackets and parentheses or {1}'] },
	'codeAction.apply'
]);