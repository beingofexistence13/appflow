/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'The actual task type. Please note that types starting with a \'$\' are reserved for internal usage.',
	'Additional properties of the task type',
	'Condition which must be true to enable this type of task. Consider using `shellExecutionSupported`, `processExecutionSupported`, and `customExecutionSupported` as appropriate for this task definition. See the [API documentation](https://code.visualstudio.com/api/extension-guides/task-provider#when-clause) for more information.',
	'The task type configuration is missing the required \'taskType\' property',
	'Contributes task kinds'
]);