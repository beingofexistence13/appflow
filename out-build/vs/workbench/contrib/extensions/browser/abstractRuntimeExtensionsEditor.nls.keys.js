/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	{
							key: 'starActivation',
							comment: [
								'{0} will be an extension identifier'
							]
						},
	{
								key: 'workspaceContainsGlobActivation',
								comment: [
									'{0} will be a glob pattern',
									'{1} will be an extension identifier'
								]
							},
	{
								key: 'workspaceContainsFileActivation',
								comment: [
									'{0} will be a file name',
									'{1} will be an extension identifier'
								]
							},
	{
							key: 'workspaceContainsTimeout',
							comment: [
								'{0} will be a glob pattern',
								'{1} will be an extension identifier'
							]
						},
	{
							key: 'startupFinishedActivation',
							comment: [
								'This refers to an extension. {0} will be an activation event.'
							]
						},
	'languageActivation',
	{
							key: 'workspaceGenericActivation',
							comment: [
								'{0} will be an activation event, like e.g. \'language:typescript\', \'debug\', etc.',
								'{1} will be an extension identifier'
							]
						},
	'extensionActivating',
	'unresponsive.title',
	'errors',
	'runtimeExtensions',
	'copy id',
	'disable workspace',
	'disable',
	'showRuntimeExtensions'
]);