/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	"Expected string in `contributes.{0}.path`. Provided value: {1}",
	"When omitting the language, the value of `contributes.{0}.path` must be a `.code-snippets`-file. Provided value: {1}",
	"Unknown language in `contributes.{0}.language`. Provided value: {1}",
	"Expected `contributes.{0}.path` ({1}) to be included inside extension's folder ({2}). This might make the extension non-portable.",
	'Contributes snippets.',
	'Language identifier for which this snippet is contributed to.',
	'Path of the snippets file. The path is relative to the extension folder and typically starts with \'./snippets/\'.',
	"One or more snippets from the extension '{0}' very likely confuse snippet-variables and snippet-placeholders (see https://code.visualstudio.com/docs/editor/userdefinedsnippets#_snippet-syntax for more details)",
	"The snippet file \"{0}\" could not be read."
]);