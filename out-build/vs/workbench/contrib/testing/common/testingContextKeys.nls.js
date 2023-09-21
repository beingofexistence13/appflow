/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'Indicates whether any test controller has an attached refresh handler.',
	'Indicates whether any test controller is currently refreshing tests.',
	'Indicates whether continuous test mode is on.',
	'Indicates whether any test controller has registered a debug configuration',
	'Indicates whether any test controller has registered a run configuration',
	'Indicates whether any test controller has registered a coverage configuration',
	'Indicates whether any test controller has registered a non-default configuration',
	'Indicates whether any test configuration can be configured',
	'Indicates whether continous test running is supported',
	'Indicates whether the parent of a test is continuously running, set in the menu context of test items',
	'Indicates whether any tests are present in the current editor',
	'Type of the item in the output peek view. Either a "test", "message", "task", or "result".',
	'Controller ID of the current test item',
	'ID of the current test item, set when creating or opening menus on test items',
	'Boolean indicating whether the test item has a URI defined',
	'Boolean indicating whether the test item is hidden',
	'Value set in `testMessage.contextValue`, available in editor/content and testing/message/context',
	'Value available in editor/content and testing/message/context when the result is outdated'
]);