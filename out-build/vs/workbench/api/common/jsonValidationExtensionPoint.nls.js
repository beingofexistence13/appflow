/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'Contributes json schema configuration.',
	'The file pattern (or an array of patterns) to match, for example "package.json" or "*.launch". Exclusion patterns start with \'!\'',
	'A schema URL (\'http:\', \'https:\') or relative path to the extension folder (\'./\').',
	"'configuration.jsonValidation' must be a array",
	"'configuration.jsonValidation.fileMatch' must be defined as a string or an array of strings.",
	"'configuration.jsonValidation.url' must be a URL or relative path",
	"Expected `contributes.{0}.url` ({1}) to be included inside extension's folder ({2}). This might make the extension non-portable.",
	"'configuration.jsonValidation.url' is an invalid relative URL: {0}",
	"'configuration.jsonValidation.url' must be an absolute URL or start with './'  to reference schemas located in the extension."
]);