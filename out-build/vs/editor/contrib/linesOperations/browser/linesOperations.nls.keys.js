/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'lines.copyUp',
	{ key: 'miCopyLinesUp', comment: ['&& denotes a mnemonic'] },
	'lines.copyDown',
	{ key: 'miCopyLinesDown', comment: ['&& denotes a mnemonic'] },
	'duplicateSelection',
	{ key: 'miDuplicateSelection', comment: ['&& denotes a mnemonic'] },
	'lines.moveUp',
	{ key: 'miMoveLinesUp', comment: ['&& denotes a mnemonic'] },
	'lines.moveDown',
	{ key: 'miMoveLinesDown', comment: ['&& denotes a mnemonic'] },
	'lines.sortAscending',
	'lines.sortDescending',
	'lines.deleteDuplicates',
	'lines.trimTrailingWhitespace',
	'lines.delete',
	'lines.indent',
	'lines.outdent',
	'lines.insertBefore',
	'lines.insertAfter',
	'lines.deleteAllLeft',
	'lines.deleteAllRight',
	'lines.joinLines',
	'editor.transpose',
	'editor.transformToUppercase',
	'editor.transformToLowercase',
	'editor.transformToTitlecase',
	'editor.transformToSnakecase',
	'editor.transformToCamelcase',
	'editor.transformToKebabcase'
]);