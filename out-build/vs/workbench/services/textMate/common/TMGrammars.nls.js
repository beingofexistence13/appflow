/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'Contributes textmate tokenizers.',
	'Language identifier for which this syntax is contributed to.',
	'Textmate scope name used by the tmLanguage file.',
	'Path of the tmLanguage file. The path is relative to the extension folder and typically starts with \'./syntaxes/\'.',
	'A map of scope name to language id if this grammar contains embedded languages.',
	'A map of scope name to token types.',
	'List of language scope names to which this grammar is injected to.',
	'Defines which scope names contain balanced brackets.',
	'Defines which scope names do not contain balanced brackets.'
]);