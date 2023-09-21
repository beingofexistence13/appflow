/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'Contributes textmate color themes.',
	'Id of the color theme as used in the user settings.',
	'Label of the color theme as shown in the UI.',
	'Base theme defining the colors around the editor: \'vs\' is the light color theme, \'vs-dark\' is the dark color theme. \'hc-black\' is the dark high contrast theme, \'hc-light\' is the light high contrast theme.',
	'Path of the tmTheme file. The path is relative to the extension folder and is typically \'./colorthemes/awesome-color-theme.json\'.',
	'Contributes file icon themes.',
	'Id of the file icon theme as used in the user settings.',
	'Label of the file icon theme as shown in the UI.',
	'Path of the file icon theme definition file. The path is relative to the extension folder and is typically \'./fileicons/awesome-icon-theme.json\'.',
	'Contributes product icon themes.',
	'Id of the product icon theme as used in the user settings.',
	'Label of the product icon theme as shown in the UI.',
	'Path of the product icon theme definition file. The path is relative to the extension folder and is typically \'./producticons/awesome-product-icon-theme.json\'.',
	"Extension point `{0}` must be an array.",
	"Expected string in `contributes.{0}.path`. Provided value: {1}",
	"Expected string in `contributes.{0}.id`. Provided value: {1}",
	"Expected `contributes.{0}.path` ({1}) to be included inside extension's folder ({2}). This might make the extension non-portable."
]);