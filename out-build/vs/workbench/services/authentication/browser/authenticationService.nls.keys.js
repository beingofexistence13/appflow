/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'authentication.id',
	'authentication.label',
	{ key: 'authenticationExtensionPoint', comment: [`'Contributes' means adds here`] },
	'authentication.Placeholder',
	'authentication.missingId',
	'authentication.missingLabel',
	'authentication.idConflict',
	'loading',
	'sign in',
	'confirmAuthenticationAccess',
	{ key: 'allow', comment: ['&& denotes a mnemonic'] },
	{ key: 'deny', comment: ['&& denotes a mnemonic'] },
	'useOtherAccount',
	{
					key: 'selectAccount',
					comment: ['The placeholder {0} is the name of an extension. {1} is the name of the type of account, such as Microsoft or GitHub.']
				},
	'getSessionPlateholder',
	{
					key: 'accessRequest',
					comment: [`The placeholder {0} will be replaced with an authentication provider''s label. {1} will be replaced with an extension name. (1) is to indicate that this menu item contributes to a badge count`]
				},
	{
					key: 'signInRequest',
					comment: [`The placeholder {0} will be replaced with an authentication provider's label. {1} will be replaced with an extension name. (1) is to indicate that this menu item contributes to a badge count.`]
				}
]);