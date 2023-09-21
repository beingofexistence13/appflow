/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'noDebugResults',
	'customizeLaunchConfig',
	{
					key: 'contributed',
					comment: ['contributed is lower case because it looks better like that in UI. Nothing preceeds it. It is a name of the grouping of debug configurations.']
				},
	'removeLaunchConfig',
	{ key: 'providerAriaLabel', comment: ['Placeholder stands for the provider label. For example "NodeJS".'] },
	'configure',
	"addConfigTo",
	'addConfiguration'
]);