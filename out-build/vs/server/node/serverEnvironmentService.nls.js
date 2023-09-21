/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	"The host name or IP address the server should listen to. If not set, defaults to 'localhost'.",
	"The port the server should listen to. If 0 is passed a random free port is picked. If a range in the format num-num is passed, a free port from the range (end inclusive) is selected.",
	"The path to a socket file for the server to listen to.",
	"A secret that must be included with all requests.",
	"Path to a file that contains the connection token.",
	"Run without a connection token. Only use this if the connection is secured by other means.",
	"If set, the user accepts the server license terms and the server will be started without a user prompt.",
	"Specifies the directory that server data is kept in.",
	"Sets the initial telemetry level. Valid levels are: 'off', 'crash', 'error' and 'all'. If not specified, the server will send telemetry until a client connects, it will then use the clients telemetry setting. Setting this to 'off' is equivalent to --disable-telemetry",
	'The workspace folder to open when no input is specified in the browser URL. A relative or absolute path resolved against the current working directory.',
	'The workspace to open when no input is specified in the browser URL. A relative or absolute path resolved against the current working directory.',
	"Start the server when installing or uninstalling extensions. To be used in combination with 'install-extension', 'install-builtin-extension' and 'uninstall-extension'."
]);