/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'run',
	{
			key: 'openAFileWhichCanBeDebugged',
			comment: [
				'Please do not translate the word "command", it is part of our internal syntax which must not change',
				'{Locked="](command:{0})"}'
			]
		},
	'runAndDebugAction',
	'detectThenRunAndDebug',
	{
			key: 'customizeRunAndDebug',
			comment: [
				'Please do not translate the word "command", it is part of our internal syntax which must not change',
				'{Locked="](command:{0})"}'
			]
		},
	{
			key: 'customizeRunAndDebugOpenFolder',
			comment: [
				'Please do not translate the word "commmand", it is part of our internal syntax which must not change',
				'{Locked="](command:{0})"}'
			]
		},
	'allDebuggersDisabled'
]);