/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'Contributed custom editors.',
	'Identifier for the custom editor. This must be unique across all custom editors, so we recommend including your extension id as part of `viewType`. The `viewType` is used when registering custom editors with `vscode.registerCustomEditorProvider` and in the `onCustomEditor:${id}` [activation event](https://code.visualstudio.com/api/references/activation-events).',
	'Human readable name of the custom editor. This is displayed to users when selecting which editor to use.',
	'Set of globs that the custom editor is enabled for.',
	'Glob that the custom editor is enabled for.',
	'Controls if the custom editor is enabled automatically when the user opens a file. This may be overridden by users using the `workbench.editorAssociations` setting.',
	'The editor is automatically used when the user opens a resource, provided that no other default custom editors are registered for that resource.',
	'The editor is not automatically used when the user opens a resource, but a user can switch to the editor using the `Reopen With` command.'
]);