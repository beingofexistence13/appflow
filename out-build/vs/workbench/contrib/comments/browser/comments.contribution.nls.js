/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	"Comments",
	"Controls when the comments panel should open.",
	"This setting is deprecated in favor of `comments.openView`.",
	"The comments view will never be opened.",
	"The comments view will open when a file with comments is active.",
	"If the comments view has not been opened yet during this session it will open the first time during a session that a file with comments is active.",
	"If the comments view has not been opened yet during this session and the comment is not resolved, it will open the first time during a session that a file with comments is active.",
	"Controls when the comments view should open.",
	"Determines if relative time will be used in comment timestamps (ex. '1 day ago').",
	"Controls the visibility of the comments bar and comment threads in editors that have commenting ranges and comments. Comments are still accessible via the Comments view and will cause commenting to be toggled on in the same way running the command \"Comments: Toggle Editor Commenting\" toggles comments.",
	"Controls whether the comments widget scrolls or expands.",
	"Controls whether the comment thread should collapse when the thread is resolved."
]);