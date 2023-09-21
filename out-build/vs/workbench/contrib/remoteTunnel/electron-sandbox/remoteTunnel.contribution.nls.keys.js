/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'remoteTunnel.category',
	'remoteTunnel.actions.turnOn',
	'remoteTunnel.actions.turnOff',
	'remoteTunnel.actions.showLog',
	'remoteTunnel.actions.configure',
	'remoteTunnel.actions.copyToClipboard',
	'remoteTunnel.actions.learnMore',
	{
							key: 'recommend.remoteExtension',
							comment: ['{0} will be a tunnel name, {1} will the link address to the web UI, {6} an extension name. [label](command:commandId) is a markdown link. Only translate the label, do not modify the format']
						},
	'action.showExtension',
	'action.doNotShowAgain',
	{ key: 'initialize.progress.title', comment: ['Only translate \'Looking for remote tunnel\', do not change the format of the rest (markdown link format)'] },
	{ key: 'startTunnel.progress.title', comment: ['Only translate \'Starting remote tunnel\', do not change the format of the rest (markdown link format)'] },
	{
													key: 'remoteTunnel.serviceInstallFailed',
													comment: ['{Locked="](command:{0})"}']
												},
	'accountPreference.placeholder',
	'signed in',
	'others',
	{ key: 'sign in using account', comment: ['{0} will be a auth provider (e.g. Github)'] },
	'tunnel.preview',
	{ key: 'enable', comment: ['&& denotes a mnemonic'] },
	'tunnel.enable.placeholder',
	'tunnel.enable.session',
	'tunnel.enable.session.description',
	'tunnel.enable.service',
	'tunnel.enable.service.description',
	{
									key: 'progress.turnOn.final',
									comment: ['{0} will be the tunnel name, {1} will the link address to the web UI, {6} an extension name, {7} a link to the extension documentation. [label](command:commandId) is a markdown link. Only translate the label, do not modify the format']
								},
	'action.copyToClipboard',
	'action.showExtension',
	'progress.turnOn.failed',
	'remoteTunnel.actions.manage.on.v2',
	'remoteTunnel.actions.manage.connecting',
	'remoteTunnel.turnOffAttached.confirm',
	'remoteTunnel.turnOff.confirm',
	'manage.placeholder',
	{ key: 'manage.title.attached', comment: ['{0} is the tunnel name'] },
	{ key: 'manage.title.orunning', comment: ['{0} is the tunnel name'] },
	'manage.title.off',
	'manage.showLog',
	'manage.tunnelName',
	'remoteTunnelAccess.machineName',
	'remoteTunnelAccess.machineNameRegex',
	'remoteTunnelAccess.preventSleep'
]);