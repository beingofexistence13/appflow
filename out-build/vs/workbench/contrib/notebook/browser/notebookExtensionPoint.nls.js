/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'Contributes notebook document provider.',
	'Type of the notebook.',
	'Human readable name of the notebook.',
	'Set of globs that the notebook is for.',
	'Glob that the notebook is enabled for.',
	'Glob that the notebook is disabled for.',
	'Controls if the custom editor is enabled automatically when the user opens a file. This may be overridden by users using the `workbench.editorAssociations` setting.',
	'The editor is automatically used when the user opens a resource, provided that no other default custom editors are registered for that resource.',
	'The editor is not automatically used when the user opens a resource, but a user can switch to the editor using the `Reopen With` command.',
	'Contributes notebook output renderer provider.',
	'Unique identifier of the notebook output renderer.',
	'Human readable name of the notebook output renderer.',
	'List of kernel dependencies the renderer requires. If any of the dependencies are present in the `NotebookKernel.preloads`, the renderer can be used.',
	'List of soft kernel dependencies the renderer can make use of. If any of the dependencies are present in the `NotebookKernel.preloads`, the renderer will be preferred over renderers that don\'t interact with the kernel.',
	'Messaging is required. The renderer will only be used when it\'s part of an extension that can be run in an extension host.',
	'The renderer is better with messaging available, but it\'s not requried.',
	'The renderer does not require messaging.',
	'Defines how and if the renderer needs to communicate with an extension host, via `createRendererMessaging`. Renderers with stronger messaging requirements may not work in all environments.',
	'Set of globs that the notebook is for.',
	'File to load in the webview to render the extension.',
	'File to load in the webview to render the extension.',
	'Existing renderer that this one extends.',
	'File to load in the webview to render the extension.',
	'Contributes notebook preloads.',
	'Type of the notebook.',
	'Path to file loaded in the webview.',
	'Paths to additional resources that should be allowed in the webview.'
]);