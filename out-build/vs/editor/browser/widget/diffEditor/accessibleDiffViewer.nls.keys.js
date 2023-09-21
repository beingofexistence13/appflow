/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'accessibleDiffViewerInsertIcon',
	'accessibleDiffViewerRemoveIcon',
	'accessibleDiffViewerCloseIcon',
	'label.close',
	'ariaLabel',
	'no_lines_changed',
	'one_line_changed',
	'more_lines_changed',
	{
					key: 'header',
					comment: [
						'This is the ARIA label for a git diff header.',
						'A git diff header looks like this: @@ -154,12 +159,39 @@.',
						'That encodes that at original line 154 (which is now line 159), 12 lines were removed/changed with 39 lines.',
						'Variables 0 and 1 refer to the diff index out of total number of diffs.',
						'Variables 2 and 4 will be numbers (a line number).',
						'Variables 3 and 5 will be "no lines changed", "1 line changed" or "X lines changed", localized separately.'
					]
				},
	'blankLine',
	{ key: 'unchangedLine', comment: ['The placeholders are contents of the line and should not be translated.'] },
	'equalLine',
	'insertLine',
	'deleteLine'
]);