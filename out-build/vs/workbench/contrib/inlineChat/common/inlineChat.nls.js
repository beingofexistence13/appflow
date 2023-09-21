/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	"Whether a provider for interactive editors exists",
	"Whether the interactive editor input is visible",
	"Whether the interactive editor input is focused",
	"Whether the interactive widget's response is focused",
	"Whether the interactive editor input is empty",
	"Whether the cursor of the iteractive editor input is on the first line",
	"Whether the cursor of the iteractive editor input is on the last line",
	"Whether the cursor of the iteractive editor input is on the start of the input",
	"Whether the cursor of the iteractive editor input is on the end of the input",
	"Whether the interactive editor message is cropped, not cropped or expanded",
	"Whether the cursor of the outer editor is above or below the interactive editor input",
	"Whether interactive editor has an active request",
	"Whether interactive editor has kept a session for quick restore",
	"What type was the last response of the current interactive editor session",
	"What type was the responses have been receieved",
	"Whether interactive editor did change any code",
	"Whether the user did changes ontop of the inline chat",
	"The last kind of feedback that was provided",
	"Whether the document has changed concurrently",
	"Background color of the interactive editor widget",
	"Border color of the interactive editor widget",
	"Shadow color of the interactive editor widget",
	"Background highlighting of the current interactive region. Must be transparent.",
	"Border color of the interactive editor input",
	"Border color of the interactive editor input when focused",
	"Foreground color of the interactive editor input placeholder",
	"Background color of the interactive editor input",
	"Background color of inserted text in the interactive editor input",
	"Background color of removed text in the interactive editor input",
	"Configure if changes crafted in the interactive editor are applied directly to the document or are previewed first.",
	"Changes are applied directly to the document and are highlighted visually via inline or side-by-side diffs. Ending a session will keep the changes.",
	"Changes are previewed only and need to be accepted via the apply button. Ending a session will discard the changes.",
	"Changes are applied directly to the document but can be highlighted via inline diffs. Ending a session will keep the changes.",
	"Enable/disable showing the diff when edits are generated. Works only with inlineChat.mode equal to live or livePreview."
]);