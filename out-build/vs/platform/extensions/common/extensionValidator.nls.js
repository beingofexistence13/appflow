/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	"property publisher must be of type `string`.",
	"property `{0}` is mandatory and must be of type `string`",
	"property `{0}` is mandatory and must be of type `string`",
	"property `{0}` is mandatory and must be of type `object`",
	"property `{0}` is mandatory and must be of type `string`",
	"property `{0}` can be omitted or must be of type `string[]`",
	"property `{0}` can be omitted or must be of type `string[]`",
	"property `{0}` should be omitted if the extension doesn't have a `{1}` or `{2}` property.",
	"property `{0}` can be defined only if property `main` is also defined.",
	"property `{0}` can be omitted or must be of type `string`",
	"Expected `main` ({0}) to be included inside extension's folder ({1}). This might make the extension non-portable.",
	"property `{0}` can be omitted or must be of type `string`",
	"Expected `browser` ({0}) to be included inside extension's folder ({1}). This might make the extension non-portable.",
	"Extension version is not semver compatible.",
	"Could not parse `engines.vscode` value {0}. Please use, for example: ^1.22.0, ^1.22.x, etc.",
	"Version specified in `engines.vscode` ({0}) is not specific enough. For vscode versions before 1.0.0, please define at a minimum the major and minor desired version. E.g. ^0.10.0, 0.10.x, 0.11.0, etc.",
	"Version specified in `engines.vscode` ({0}) is not specific enough. For vscode versions after 1.0.0, please define at a minimum the major desired version. E.g. ^1.10.0, 1.10.x, 1.x.x, 2.x.x, etc.",
	"Extension is not compatible with Code {0}. Extension requires: {1}."
]);