/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	"Workbench",
	"Maps to `Control` on Windows and Linux and to `Command` on macOS.",
	"Maps to `Alt` on Windows and Linux and to `Option` on macOS.",
	"The modifier to be used to add an item in trees and lists to a multi-selection with the mouse (for example in the explorer, open editors and scm view). The 'Open to Side' mouse gestures - if supported - will adapt such that they do not conflict with the multiselect modifier.",
	"Controls how to open items in trees and lists using the mouse (if supported). Note that some trees and lists might choose to ignore this setting if it is not applicable.",
	"Controls whether lists and trees support horizontal scrolling in the workbench. Warning: turning on this setting has a performance implication.",
	"Controls whether clicks in the scrollbar scroll page by page.",
	"Controls tree indentation in pixels.",
	"Controls whether the tree should render indent guides.",
	"Controls whether lists and trees have smooth scrolling.",
	"A multiplier to be used on the `deltaX` and `deltaY` of mouse wheel scroll events.",
	"Scrolling speed multiplier when pressing `Alt`.",
	"Highlight elements when searching. Further up and down navigation will traverse only the highlighted elements.",
	"Filter elements when searching.",
	"Controls the default find mode for lists and trees in the workbench.",
	"Simple keyboard navigation focuses elements which match the keyboard input. Matching is done only on prefixes.",
	"Highlight keyboard navigation highlights elements which match the keyboard input. Further up and down navigation will traverse only the highlighted elements.",
	"Filter keyboard navigation will filter out and hide all the elements which do not match the keyboard input.",
	"Controls the keyboard navigation style for lists and trees in the workbench. Can be simple, highlight and filter.",
	"Please use 'workbench.list.defaultFindMode' and	'workbench.list.typeNavigationMode' instead.",
	"Use fuzzy matching when searching.",
	"Use contiguous matching when searching.",
	"Controls the type of matching used when searching lists and trees in the workbench.",
	"Controls how tree folders are expanded when clicking the folder names. Note that some trees and lists might choose to ignore this setting if it is not applicable.",
	"Controls how type navigation works in lists and trees in the workbench. When set to `trigger`, type navigation begins once the `list.triggerTypeNavigation` command is run."
]);