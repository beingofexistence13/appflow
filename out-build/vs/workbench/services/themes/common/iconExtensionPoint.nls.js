/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'Contributes extension defined themable icons',
	'The identifier of the themable icon',
	'Identifiers can only contain letters, digits and minuses and need to consist of at least two segments in the form `component-iconname`.',
	'The description of the themable icon',
	'The path of the icon font that defines the icon.',
	'The character for the icon in the icon font.',
	'The default of the icon. Either a reference to an extisting ThemeIcon or an icon in an icon font.',
	"'configuration.icons' must be an object with the icon names as properties.",
	"'configuration.icons' keys represent the icon id and can only contain letter, digits and minuses. They need to consist of at least two segments in the form `component-iconname`.",
	"'configuration.icons.description' must be defined and can not be empty",
	"Expected `contributes.icons.default.fontPath` to have file extension 'woff', woff2' or 'ttf', is '{0}'.",
	"Expected `contributes.icons.default.fontPath` ({0}) to be included inside extension's folder ({0}).",
	"'configuration.icons.default' must be either a reference to the id of an other theme icon (string) or a icon definition (object) with properties `fontPath` and `fontCharacter`."
]);