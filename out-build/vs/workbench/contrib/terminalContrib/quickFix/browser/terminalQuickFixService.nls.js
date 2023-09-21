/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'Contributes terminal quick fixes.',
	"The ID of the quick fix provider",
	"A regular expression or string to test the command line against",
	"A regular expression or string to match a single line of the output against, which provides groups to be referenced in terminalCommand and uri.\n\nFor example:\n\n `lineMatcher: /git push --set-upstream origin (?<branchName>[^\s]+)/;`\n\n`terminalCommand: 'git push --set-upstream origin ${group:branchName}';`\n",
	"The command exit result to match on",
	"The kind of the resulting quick fix. This changes how the quick fix is presented. Defaults to {0}."
]);