/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	"Title",
	"Contribute walkthroughs to help users getting started with your extension.",
	"Unique identifier for this walkthrough.",
	"Title of walkthrough.",
	"Relative path to the icon of the walkthrough. The path is relative to the extension location. If not specified, the icon defaults to the extension icon if available.",
	"Description of walkthrough.",
	"Walkthroughs that match one of these glob patterns appear as 'featured' in workspaces with the specified files. For example, a walkthrough for TypeScript projects might specify `tsconfig.json` here.",
	"Context key expression to control the visibility of this walkthrough.",
	"Steps to complete as part of this walkthrough.",
	"Unique identifier for this step. This is used to keep track of which steps have been completed.",
	"Title of step.",
	"Description of step. Supports ``preformatted``, __italic__, and **bold** text. Use markdown-style links for commands or external links: {0}, {1}, or {2}. Links on their own line will be rendered as buttons.",
	"Deprecated. Use markdown links in the description instead, i.e. {0}, {1}, or {2}",
	"Media to show alongside this step, either an image or markdown content.",
	"Deprecated. Please use `image` or `markdown` instead",
	"Path to an image - or object consisting of paths to light, dark, and hc images - relative to extension directory. Depending on context, the image will be displayed from 400px to 800px wide, with similar bounds on height. To support HIDPI displays, the image will be rendered at 1.5x scaling, for example a 900 physical pixels wide image will be displayed as 600 logical pixels wide.",
	"Path to the image for dark themes, relative to extension directory.",
	"Path to the image for light themes, relative to extension directory.",
	"Path to the image for hc themes, relative to extension directory.",
	"Path to the image for hc light themes, relative to extension directory.",
	"Alternate text to display when the image cannot be loaded or in screen readers.",
	"Path to an svg, color tokens are supported in variables to support theming to match the workbench.",
	"Alternate text to display when the image cannot be loaded or in screen readers.",
	"Deprecated. Please use `image` or `markdown` instead",
	"Path to the markdown document, relative to extension directory.",
	"Events that should trigger this step to become checked off. If empty or not defined, the step will check off when any of the step's buttons or links are clicked; if the step has no buttons or links it will check on when it is selected.",
	'Check off step when a given command is executed anywhere in VS Code.',
	'Check off step when a given link is opened via a walkthrough step.',
	'Check off step when a given view is opened',
	'Check off step when a given setting is changed',
	'Check off step when a context key expression is true.',
	'Check off step when an extension with the given id is installed. If the extension is already installed, the step will start off checked.',
	'Check off step as soon as it is selected.',
	"Signal to mark step as complete.",
	"doneOn is deprecated. By default steps will be checked off when their buttons are clicked, to configure further use completionEvents",
	"Mark step done when the specified command is executed.",
	"Context key expression to control the visibility of this step."
]);