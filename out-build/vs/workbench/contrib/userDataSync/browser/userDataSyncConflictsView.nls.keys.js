/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'explanation',
	{ key: 'workbench.actions.sync.openConflicts', comment: ['This is an action title to show the conflicts between local and remote version of resources'] },
	'workbench.actions.sync.acceptRemote',
	'workbench.actions.sync.acceptLocal',
	{ key: 'remoteResourceName', comment: ['remote as in file in cloud'] },
	'localResourceName',
	'Theirs',
	'Yours'
]);