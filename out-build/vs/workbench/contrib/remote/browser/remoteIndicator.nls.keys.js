/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'remote.category',
	'remote.showMenu',
	'remote.close',
	{ key: 'miCloseRemote', comment: ['&& denotes a mnemonic'] },
	'remote.install',
	'host.open',
	'host.open',
	'host.reconnecting',
	'disconnectedFrom',
	{ key: 'host.tooltip', comment: ['{0} is a remote host name, e.g. Dev Container'] },
	{ key: 'workspace.tooltip', comment: ['{0} is a remote workspace name, e.g. GitHub'] },
	{ key: 'workspace.tooltip2', comment: ['[features are not available]({1}) is a link. Only translate `features are not available`. Do not change brackets and parentheses or {0}'] },
	'noHost.tooltip',
	'remoteHost',
	'networkStatusOfflineTooltip',
	'networkStatusHighLatencyTooltip',
	'remote.startActions.help',
	'remote.startActions.install',
	'closeRemoteConnection.title',
	'reloadWindow',
	'closeVirtualWorkspace.title',
	'remoteActions',
	'remote.startActions.installingExtension'
]);