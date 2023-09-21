/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'localHistory.category',
	'localHistory.compareWithFile',
	'localHistory.compareWithPrevious',
	'localHistory.selectForCompare',
	'localHistory.compareWithSelected',
	'localHistory.open',
	'localHistory.restore',
	'localHistoryRestore.source',
	'confirmRestoreMessage',
	'confirmRestoreDetail',
	{ key: 'restoreButtonLabel', comment: ['&& denotes a mnemonic'] },
	'unableToRestore',
	'localHistory.restoreViaPicker',
	'restoreViaPicker.filePlaceholder',
	'restoreViaPicker.entryPlaceholder',
	'localHistory.restoreViaPickerMenu',
	'localHistory.rename',
	'renameLocalHistoryEntryTitle',
	'renameLocalHistoryPlaceholder',
	'localHistory.delete',
	'confirmDeleteMessage',
	'confirmDeleteDetail',
	{ key: 'deleteButtonLabel', comment: ['&& denotes a mnemonic'] },
	'localHistory.deleteAll',
	'confirmDeleteAllMessage',
	'confirmDeleteAllDetail',
	{ key: 'deleteAllButtonLabel', comment: ['&& denotes a mnemonic'] },
	'localHistory.create',
	'createLocalHistoryEntryTitle',
	'createLocalHistoryPlaceholder',
	'localHistoryEditorLabel',
	'localHistoryCompareToFileEditorLabel',
	'localHistoryCompareToPreviousEditorLabel'
]);