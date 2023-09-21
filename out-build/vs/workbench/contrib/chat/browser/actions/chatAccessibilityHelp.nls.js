/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'The chat view is comprised of an input box and a request/response list. The input box is used to make requests and the list is used to display responses.',
	'In the input box, use up and down arrows to navigate your request history. Edit input and use enter or the submit button to run a new request.',
	'In the input box, inspect the last response in the accessible view via {0}',
	'With the input box focused, inspect the last response in the accessible view via the Open Accessible View command, which is currently not triggerable by a keybinding.',
	'Chat responses will be announced as they come in. A response will indicate the number of code blocks, if any, and then the rest of the response.',
	'To focus the chat request/response list, which can be navigated with up and down arrows, invoke the Focus Chat command ({0}).',
	'To focus the chat request/response list, which can be navigated with up and down arrows, invoke The Focus Chat List command, which is currently not triggerable by a keybinding.',
	'To focus the input box for chat requests, invoke the Focus Chat Input command ({0})',
	'To focus the input box for chat requests, invoke the Focus Chat Input command, which is currently not triggerable by a keybinding.',
	'To focus the next code block within a response, invoke the Chat: Next Code Block command ({0}).',
	'To focus the next code block within a response, invoke the Chat: Next Code Block command, which is currently not triggerable by a keybinding.',
	'To focus the next file tree within a response, invoke the Chat: Next File Tree command ({0}).',
	'To focus the next file tree within a response, invoke the Chat: Next File Tree command, which is currently not triggerable by a keybinding.',
	'To clear the request/response list, invoke the Chat Clear command ({0}).',
	'To clear the request/response list, invoke the Chat Clear command, which is currently not triggerable by a keybinding.',
	"Inline chat occurs within a code editor and takes into account the current selection. It is useful for making changes to the current editor. For example, fixing diagnostics, documenting or refactoring code. Keep in mind that AI generated code may be incorrect.",
	"It can be activated via code actions or directly using the command: Inline Chat: Start Code Chat ({0}).",
	'In the input box, use {0} and {1} to navigate your request history. Edit input and use enter or the submit button to run a new request.',
	'In the input box, inspect the response in the accessible view via {0}',
	'With the input box focused, inspect the response in the accessible view via the Open Accessible View command, which is currently not triggerable by a keybinding.',
	"Context menu actions may run a request prefixed with a /. Type / to discover such ready-made commands.",
	"If a fix action is invoked, a response will indicate the problem with the current code. A diff editor will be rendered and can be reached by tabbing.",
	"Once in the diff editor, enter review mode with ({0}). Use up and down arrows to navigate lines with the proposed changes.",
	"Tab again to enter the Diff editor with the changes and enter review mode with the Go to Next Difference Command. Use Up/DownArrow to navigate lines with the proposed changes.",
	"Use tab to reach conditional parts like commands, status, message responses and more.",
	"Audio cues can be changed via settings with a prefix of audioCues.chat. By default, if a request takes more than 4 seconds, you will hear an audio cue indicating that progress is still occurring."
]);