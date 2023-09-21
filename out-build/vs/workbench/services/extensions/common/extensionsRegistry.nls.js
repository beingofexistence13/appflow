/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	"UI extension kind. In a remote window, such extensions are enabled only when available on the local machine.",
	"Workspace extension kind. In a remote window, such extensions are enabled only when available on the remote.",
	"Engine compatibility.",
	'For VS Code extensions, specifies the VS Code version that the extension is compatible with. Cannot be *. For example: ^0.10.5 indicates compatibility with a minimum VS Code version of 0.10.5.',
	'The publisher of the VS Code extension.',
	'The display name for the extension used in the VS Code gallery.',
	'The categories used by the VS Code gallery to categorize the extension.',
	'Use \'Programming  Languages\' instead',
	'Banner used in the VS Code marketplace.',
	'The banner color on the VS Code marketplace page header.',
	'The color theme for the font used in the banner.',
	'All contributions of the VS Code extension represented by this package.',
	'Sets the extension to be flagged as a Preview in the Marketplace.',
	'Use `enabledApiProposals` instead.',
	'Enable API proposals to try them out. Only valid **during development**. Extensions **cannot be published** with this property. For more details visit: https://code.visualstudio.com/api/advanced-topics/using-proposed-api',
	'Describe the API provided by this extension. For more details visit: https://code.visualstudio.com/api/advanced-topics/remote-extensions#handling-dependencies-with-remote-extensions',
	"Give up entirely the ability to export any APIs. This allows other extensions that depend on this extension to run in a separate extension host process or in a remote machine.",
	'Activation events for the VS Code extension.',
	'An activation event emmited when a webview is loaded of a certain viewType',
	'An activation event emitted whenever a file that resolves to the specified language gets opened.',
	'An activation event emitted whenever the specified command gets invoked.',
	'An activation event emitted whenever a user is about to start debugging or about to setup debug configurations.',
	'An activation event emitted whenever a "launch.json" needs to be created (and all provideDebugConfigurations methods need to be called).',
	'An activation event emitted whenever a list of all debug configurations needs to be created (and all provideDebugConfigurations methods for the "dynamic" scope need to be called).',
	'An activation event emitted whenever a debug session with the specific type is about to be launched (and a corresponding resolveDebugConfiguration method needs to be called).',
	'An activation event emitted whenever a debug session with the specific type is about to be launched and a debug protocol tracker might be needed.',
	'An activation event emitted whenever a folder is opened that contains at least a file matching the specified glob pattern.',
	'An activation event emitted after the start-up finished (after all `*` activated extensions have finished activating).',
	'An activation event emitted whenever tasks of a certain type need to be listed or resolved.',
	'An activation event emitted whenever a file or folder is accessed with the given scheme.',
	'An activation event emitted whenever an edit session is accessed with the given scheme.',
	'An activation event emitted whenever a search is started in the folder with the given scheme.',
	'An activation event emitted whenever the specified view is expanded.',
	'An activation event emitted whenever a system-wide Uri directed towards this extension is open.',
	'An activation event emitted whenever a external uri (such as an http or https link) is being opened.',
	'An activation event emitted whenever the specified custom editor becomes visible.',
	'An activation event emitted whenever the specified notebook document is opened.',
	'An activation event emitted whenever sessions are requested from the specified authentication provider.',
	'An activation event emitted whenever a notebook output renderer is used.',
	'An activation event emitted when a specific terminal profile is launched.',
	'An activation event emitted when a command matches the selector associated with this ID',
	'An activation event emitted when a specified walkthrough is opened.',
	'An activation event emitted on VS Code startup. To ensure a great end user experience, please use this activation event in your extension only when no other activation events combination works in your use-case.',
	'Array of badges to display in the sidebar of the Marketplace\'s extension page.',
	'Badge image URL.',
	'Badge link.',
	'Badge description.',
	"Controls the Markdown rendering engine used in the Marketplace. Either github (default) or standard.",
	"Controls the Q&A link in the Marketplace. Set to marketplace to enable the default Marketplace Q & A site. Set to a string to provide the URL of a custom Q & A site. Set to false to disable Q & A altogether.",
	'Dependencies to other extensions. The identifier of an extension is always ${publisher}.${name}. For example: vscode.csharp.',
	"A set of extensions that can be installed together. The identifier of an extension is always ${publisher}.${name}. For example: vscode.csharp.",
	"Define the kind of an extension. `ui` extensions are installed and run on the local machine while `workspace` extensions run on the remote.",
	"Define an extension which can run only on the local machine when connected to remote window.",
	"Define an extension which can run only on the remote machine when connected remote window.",
	"Define an extension which can run on either side, with a preference towards running on the local machine.",
	"Define an extension which can run on either side, with a preference towards running on the remote machine.",
	"Define an extension which cannot run in a remote context, neither on the local, nor on the remote machine.",
	"Declare the set of supported capabilities by the extension.",
	"Declares whether the extension should be enabled in virtual workspaces. A virtual workspace is a workspace which is not backed by any on-disk resources. When false, this extension will be automatically disabled in virtual workspaces. Default is true.",
	"Declares the level of support for virtual workspaces by the extension.",
	"The extension will be enabled in virtual workspaces with some functionality disabled.",
	"The extension will be enabled in virtual workspaces with all functionality enabled.",
	"The extension will not be enabled in virtual workspaces.",
	"A description of how virtual workspaces affects the extensions behavior and why it is needed. This only applies when `supported` is not `true`.",
	'Declares how the extension should be handled in untrusted workspaces.',
	"Declares the level of support for untrusted workspaces by the extension.",
	"The extension will be enabled in untrusted workspaces with some functionality disabled.",
	"The extension will be enabled in untrusted workspaces with all functionality enabled.",
	"The extension will not be enabled in untrusted workspaces.",
	"A list of configuration keys contributed by the extension that should not use workspace values in untrusted workspaces.",
	"A description of how workspace trust affects the extensions behavior and why it is needed. This only applies when `supported` is not `true`.",
	"Specify the location from where users can sponsor your extension.",
	"URL from where users can sponsor your extension. It must be a valid URL with a HTTP or HTTPS protocol. Example value: https://github.com/sponsors/nvaccess",
	'Script executed before the package is published as a VS Code extension.',
	'Uninstall hook for VS Code extension. Script that gets executed when the extension is completely uninstalled from VS Code which is when VS Code is restarted (shutdown and start) after the extension is uninstalled. Only Node scripts are supported.',
	'The path to a 128x128 pixel icon.',
	'The relative path to a folder containing localization (bundle.l10n.*.json) files. Must be specified if you are using the vscode.l10n API.',
	'The pricing information for the extension. Can be Free (default) or Trial. For more details visit: https://code.visualstudio.com/api/working-with-extensions/publishing-extension#extension-pricing-label',
	"API proposals that the respective extensions can freely use."
]);