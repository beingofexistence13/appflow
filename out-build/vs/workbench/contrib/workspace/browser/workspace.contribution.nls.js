/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	"You are trying to open untrusted files in a workspace which is trusted.",
	"You are trying to open untrusted files in a window which is trusted.",
	"If you don't want to open untrusted files, we recommend to open them in Restricted Mode in a new window as the files may be malicious. See [our docs](https://aka.ms/vscode-workspace-trust) to learn more.",
	"Do you want to allow untrusted files in this workspace?",
	"Do you want to allow untrusted files in this window?",
	"&&Open",
	"Open in &&Restricted Mode",
	"Remember my decision for all workspaces",
	"Do you trust the authors of the files in this workspace?",
	"Do you trust the authors of the files in this folder?",
	"A feature you are trying to use may be a security risk if you do not trust the source of the files or folders you currently have open.",
	"&&Trust Workspace & Continue",
	"&&Trust Folder & Continue",
	"&&Manage",
	"Cancel",
	"If you don't trust the authors of these files, we do not recommend continuing as the files may be malicious. See [our docs](https://aka.ms/vscode-workspace-trust) to learn more.",
	"Do you trust the authors of the files in this folder?",
	"You are adding files that are not currently trusted to a trusted workspace. Do you trust the authors of these new files?",
	'No',
	"Do you trust the authors of the files in this workspace?",
	"Do you trust the authors of the files in this folder?",
	"Trust the authors of all files in the parent folder '{0}'",
	"&&Yes, I trust the authors",
	"Trust folder and enable all features",
	"Trust workspace and enable all features",
	"&&No, I don't trust the authors",
	"Browse folder in restricted mode",
	"Browse workspace in restricted mode",
	"{0} provides features that may automatically execute files in this workspace.",
	"{0} provides features that may automatically execute files in this folder.",
	"If you don't trust the authors of these files, we recommend to continue in restricted mode as the files may be malicious. See [our docs](https://aka.ms/vscode-workspace-trust) to learn more.",
	"Manage",
	"Learn More",
	"Restricted Mode is intended for safe code browsing. Trust this window to enable all features. Use navigation keys to access banner actions.",
	"Restricted Mode is intended for safe code browsing. Trust this folder to enable all features. Use navigation keys to access banner actions.",
	"Restricted Mode is intended for safe code browsing. Trust this workspace to enable all features. Use navigation keys to access banner actions.",
	"Restricted Mode is intended for safe code browsing. Trust this window to enable all features.",
	"Restricted Mode is intended for safe code browsing. Trust this folder to enable all features.",
	"Restricted Mode is intended for safe code browsing. Trust this workspace to enable all features.",
	"This window is trusted.",
	"Restricted Mode: Some features are disabled because this window is not trusted.",
	"Running in Restricted Mode\n\nSome [features are disabled]({0}) because this [window is not trusted]({1}).",
	"This folder is trusted.",
	"Restricted Mode: Some features are disabled because this folder is not trusted.",
	"Running in Restricted Mode\n\nSome [features are disabled]({0}) because this [folder is not trusted]({1}).",
	"This workspace is trusted.",
	"Restricted Mode: Some features are disabled because this workspace is not trusted.",
	"Running in Restricted Mode\n\nSome [features are disabled]({0}) because this [workspace is not trusted]({1}).",
	"Workspace Trust",
	"Workspace Trust Editor",
	"Workspaces",
	"Configure Workspace Trust Settings",
	"Manage Workspace Trust",
	"Controls whether or not Workspace Trust is enabled within VS Code.",
	"Controls when the startup prompt to trust a workspace is shown.",
	"Ask for trust every time an untrusted workspace is opened.",
	"Ask for trust the first time an untrusted workspace is opened.",
	"Do not ask for trust when an untrusted workspace is opened.",
	"Controls when the restricted mode banner is shown.",
	"Show the banner every time an untrusted workspace is open.",
	"Show the banner when an untrusted workspace is opened until dismissed.",
	"Do not show the banner when an untrusted workspace is open.",
	"Controls how to handle opening untrusted files in a trusted workspace. This setting also applies to opening files in an empty window which is trusted via `#{0}#`.",
	"Ask how to handle untrusted files for each workspace. Once untrusted files are introduced to a trusted workspace, you will not be prompted again.",
	"Always allow untrusted files to be introduced to a trusted workspace without prompting.",
	"Always open untrusted files in a separate window in restricted mode without prompting.",
	"Controls whether or not the empty window is trusted by default within VS Code. When used with `#{0}#`, you can enable the full functionality of VS Code without prompting in an empty window."
]);