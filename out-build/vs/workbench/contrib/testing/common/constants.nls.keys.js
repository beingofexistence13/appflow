/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'testState.errored',
	'testState.failed',
	'testState.passed',
	'testState.queued',
	'testState.running',
	'testState.skipped',
	'testState.unset',
	{
	key: 'testing.treeElementLabel',
	comment: ['label then the unit tests state, for example "Addition Tests (Running)"'],
},
	'testGroup.debug',
	'testGroup.run',
	'testGroup.coverage'
]);