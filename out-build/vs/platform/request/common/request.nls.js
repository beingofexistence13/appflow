/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	"Network Requests",
	"HTTP",
	"The proxy setting to use. If not set, will be inherited from the `http_proxy` and `https_proxy` environment variables.",
	"Controls whether the proxy server certificate should be verified against the list of supplied CAs.",
	"Overrides the principal service name for Kerberos authentication with the HTTP proxy. A default based on the proxy hostname is used when this is not set.",
	"The value to send as the `Proxy-Authorization` header for every network request.",
	"Disable proxy support for extensions.",
	"Enable proxy support for extensions.",
	"Enable proxy support for extensions, fall back to request options, when no proxy found.",
	"Enable proxy support for extensions, override request options.",
	"Use the proxy support for extensions.",
	"Controls whether CA certificates should be loaded from the OS. (On Windows and macOS, a reload of the window is required after turning this off.)"
]);