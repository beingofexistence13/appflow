/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'Contributes semantic token types.',
	'The identifier of the semantic token type',
	'Identifiers should be in the form letterOrDigit[_-letterOrDigit]*',
	'The super type of the semantic token type',
	'Super types should be in the form letterOrDigit[_-letterOrDigit]*',
	'The description of the semantic token type',
	'Contributes semantic token modifiers.',
	'The identifier of the semantic token modifier',
	'Identifiers should be in the form letterOrDigit[_-letterOrDigit]*',
	'The description of the semantic token modifier',
	'Contributes semantic token scope maps.',
	'Lists the languge for which the defaults are.',
	'Maps a semantic token (described by semantic token selector) to one or more textMate scopes used to represent that token.',
	"'configuration.{0}.id' must be defined and can not be empty",
	"'configuration.{0}.id' must follow the pattern letterOrDigit[-_letterOrDigit]*",
	"'configuration.{0}.superType' must follow the pattern letterOrDigit[-_letterOrDigit]*",
	"'configuration.{0}.description' must be defined and can not be empty",
	"'configuration.semanticTokenType' must be an array",
	"'configuration.semanticTokenModifier' must be an array",
	"'configuration.semanticTokenScopes' must be an array",
	"'configuration.semanticTokenScopes.language' must be a string",
	"'configuration.semanticTokenScopes.scopes' must be defined as an object",
	"'configuration.semanticTokenScopes.scopes' values must be an array of strings",
	"configuration.semanticTokenScopes.scopes': Problems parsing selector {0}."
]);