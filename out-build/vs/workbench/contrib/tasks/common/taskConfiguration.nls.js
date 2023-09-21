/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'Warning: options.cwd must be of type string. Ignoring value {0}\n',
	'Error: command argument must either be a string or a quoted string. Provided value is:\n{0}',
	'Warning: shell configuration is only supported when executing tasks in the terminal.',
	'Error: Problem Matcher in declare scope must have a name:\n{0}\n',
	'Warning: the defined problem matcher is unknown. Supported types are string | ProblemMatcher | Array<string | ProblemMatcher>.\n{0}\n',
	'Error: Invalid problemMatcher reference: {0}\n',
	'Error: tasks configuration must have a type property. The configuration will be ignored.\n{0}\n',
	'Error: there is no registered task type \'{0}\'. Did you miss installing an extension that provides a corresponding task provider?',
	'Error: the task configuration \'{0}\' is missing the required property \'type\'. The task configuration will be ignored.',
	'Error: the task configuration \'{0}\' is using an unknown type. The task configuration will be ignored.',
	'Error: tasks is not declared as a custom task. The configuration will be ignored.\n{0}\n',
	'Error: a task must provide a label property. The task will be ignored.\n{0}\n',
	'Warning: {0} tasks are unavailable in the current environment.\n',
	'Error: the task \'{0}\' neither specifies a command nor a dependsOn property. The task will be ignored. Its definition is:\n{1}',
	'Error: the task \'{0}\' doesn\'t define a command. The task will be ignored. Its definition is:\n{1}',
	'Task version 2.0.0 doesn\'t support global OS specific tasks. Convert them to a task with a OS specific command. Affected tasks are:\n{0}'
]);