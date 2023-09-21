/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'Contributes resource label formatting rules.',
	'URI scheme on which to match the formatter on. For example "file". Simple glob patterns are supported.',
	'URI authority on which to match the formatter on. Simple glob patterns are supported.',
	"Rules for formatting uri resource labels.",
	"Label rules to display. For example: myLabel:/${path}. ${path}, ${scheme}, ${authority} and ${authoritySuffix} are supported as variables.",
	"Separator to be used in the uri label display. '/' or '\' as an example.",
	"Controls whether `${path}` substitutions should have starting separator characters stripped.",
	"Controls if the start of the uri label should be tildified when possible.",
	"Suffix appended to the workspace label.",
	"Untitled (Workspace)",
	"Workspace",
	"{0} (Workspace)",
	"{0} (Workspace)"
]);