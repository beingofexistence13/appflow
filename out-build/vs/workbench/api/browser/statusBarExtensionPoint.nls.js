/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'The identifier of the status bar entry. Must be unique within the extension. The same value must be used when calling the `vscode.window.createStatusBarItem(id, ...)`-API',
	'The name of the entry, like \'Python Language Indicator\', \'Git Status\' etc. Try to keep the length of the name short, yet descriptive enough that users can understand what the status bar item is about.',
	'The text to show for the entry. You can embed icons in the text by leveraging the `$(<name>)`-syntax, like \'Hello $(globe)!\'',
	'The tooltip text for the entry.',
	'The command to execute when the status bar entry is clicked.',
	'The alignment of the status bar entry.',
	'The priority of the status bar entry. Higher value means the item should be shown more to the left.',
	'Defines the role and aria label to be used when the status bar entry is focused.',
	'The role of the status bar entry which defines how a screen reader interacts with it. More about aria roles can be found here https://w3c.github.io/aria/#widget_roles',
	'The aria label of the status bar entry. Defaults to the entry\'s text.',
	"Contributes items to the status bar.",
	"Invalid status bar item contribution."
]);