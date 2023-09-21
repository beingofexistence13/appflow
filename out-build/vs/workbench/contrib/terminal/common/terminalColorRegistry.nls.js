/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'The background color of the terminal, this allows coloring the terminal differently to the panel.',
	'The foreground color of the terminal.',
	'The foreground color of the terminal cursor.',
	'The background color of the terminal cursor. Allows customizing the color of a character overlapped by a block cursor.',
	'The selection background color of the terminal.',
	'The selection background color of the terminal when it does not have focus.',
	'The selection foreground color of the terminal. When this is null the selection foreground will be retained and have the minimum contrast ratio feature applied.',
	'The default terminal command decoration background color.',
	'The terminal command decoration background color for successful commands.',
	'The terminal command decoration background color for error commands.',
	'The overview ruler cursor color.',
	'The color of the border that separates split panes within the terminal. This defaults to panel.border.',
	'Color of the current search match in the terminal. The color must not be opaque so as not to hide underlying terminal content.',
	'Border color of the other search matches in the terminal.',
	'Border color of the current search match in the terminal.',
	'Color of the other search matches in the terminal. The color must not be opaque so as not to hide underlying terminal content.',
	'Border color of the other search matches in the terminal.',
	'Overview ruler marker color for find matches in the terminal.',
	"Background color when dragging on top of terminals. The color should have transparency so that the terminal contents can still shine through.",
	'Border on the side of the terminal tab in the panel. This defaults to tab.activeBorder.',
	'\'{0}\' ANSI color in the terminal.'
]);