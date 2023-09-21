/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'shellIntegration.enabled',
	'launchFailed.exitCodeOnlyShellIntegration',
	'shellIntegration.activationFailed',
	{ key: 'shellProcessTooltip.processId', comment: ['The first arg is "PID" which shouldn\'t be translated'] },
	'shellProcessTooltip.commandLine'
]);