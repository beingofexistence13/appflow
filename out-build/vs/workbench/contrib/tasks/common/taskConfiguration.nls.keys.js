/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'ConfigurationParser.invalidCWD',
	'ConfigurationParser.inValidArg',
	'ConfigurationParser.noShell',
	'ConfigurationParser.noName',
	'ConfigurationParser.unknownMatcherKind',
	'ConfigurationParser.invalidVariableReference',
	'ConfigurationParser.noTaskType',
	'ConfigurationParser.noTypeDefinition',
	'ConfigurationParser.missingType',
	'ConfigurationParser.incorrectType',
	'ConfigurationParser.notCustom',
	'ConfigurationParser.noTaskName',
	'taskConfiguration.providerUnavailable',
	'taskConfiguration.noCommandOrDependsOn',
	'taskConfiguration.noCommand',
	{ key: 'TaskParse.noOsSpecificGlobalTasks', comment: ['\"Task version 2.0.0\" refers to the 2.0.0 version of the task system. The \"version 2.0.0\" is not localizable as it is a json key and value.'] }
]);