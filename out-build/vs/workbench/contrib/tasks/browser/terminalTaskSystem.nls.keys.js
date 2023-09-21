/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'TerminalTaskSystem.unknownError',
	'TerminalTaskSystem.taskLoadReporting',
	'dependencyCycle',
	'dependencyFailed',
	'TerminalTaskSystem.nonWatchingMatcher',
	{
						key: 'task.executingInFolder',
						comment: ['The workspace folder the task is running in', 'The task command line or label']
					},
	{
						key: 'task.executing.shellIntegration',
						comment: ['The task command line or label']
					},
	{
						key: 'task.executingInFolder',
						comment: ['The workspace folder the task is running in', 'The task command line or label']
					},
	{
						key: 'task.executing.shell-integration',
						comment: ['The task command line or label']
					},
	{
					key: 'task.executing',
					comment: ['The task command line or label']
				},
	'TerminalTaskSystem',
	'unknownProblemMatcher',
	'closeTerminal',
	'reuseTerminal'
]);