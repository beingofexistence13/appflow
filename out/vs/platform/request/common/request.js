/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/nls", "vs/platform/configuration/common/configurationRegistry", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/registry/common/platform"], function (require, exports, buffer_1, errors_1, lifecycle_1, nls_1, configurationRegistry_1, instantiation_1, log_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.updateProxyConfigurationsScope = exports.asJson = exports.asTextOrError = exports.asText = exports.hasNoContent = exports.isSuccess = exports.AbstractRequestService = exports.IRequestService = void 0;
    exports.IRequestService = (0, instantiation_1.createDecorator)('requestService');
    class LoggableHeaders {
        constructor(original) {
            this.original = original;
        }
        toJSON() {
            if (!this.headers) {
                const headers = Object.create(null);
                for (const key in this.original) {
                    if (key.toLowerCase() === 'authorization' || key.toLowerCase() === 'proxy-authorization') {
                        headers[key] = '*****';
                    }
                    else {
                        headers[key] = this.original[key];
                    }
                }
                this.headers = headers;
            }
            return this.headers;
        }
    }
    class AbstractRequestService extends lifecycle_1.Disposable {
        constructor(loggerService) {
            super();
            this.counter = 0;
            this.logger = loggerService.createLogger('network', {
                name: (0, nls_1.localize)('request', "Network Requests"),
                when: log_1.CONTEXT_LOG_LEVEL.isEqualTo((0, log_1.LogLevelToString)(log_1.LogLevel.Trace)).serialize()
            });
        }
        async logAndRequest(stack, options, request) {
            const prefix = `${stack} #${++this.counter}: ${options.url}`;
            this.logger.trace(`${prefix} - begin`, options.type, new LoggableHeaders(options.headers ?? {}));
            try {
                const result = await request();
                this.logger.trace(`${prefix} - end`, options.type, result.res.statusCode, result.res.headers);
                return result;
            }
            catch (error) {
                this.logger.error(`${prefix} - error`, options.type, (0, errors_1.getErrorMessage)(error));
                throw error;
            }
        }
    }
    exports.AbstractRequestService = AbstractRequestService;
    function isSuccess(context) {
        return (context.res.statusCode && context.res.statusCode >= 200 && context.res.statusCode < 300) || context.res.statusCode === 1223;
    }
    exports.isSuccess = isSuccess;
    function hasNoContent(context) {
        return context.res.statusCode === 204;
    }
    exports.hasNoContent = hasNoContent;
    async function asText(context) {
        if (hasNoContent(context)) {
            return null;
        }
        const buffer = await (0, buffer_1.streamToBuffer)(context.stream);
        return buffer.toString();
    }
    exports.asText = asText;
    async function asTextOrError(context) {
        if (!isSuccess(context)) {
            throw new Error('Server returned ' + context.res.statusCode);
        }
        return asText(context);
    }
    exports.asTextOrError = asTextOrError;
    async function asJson(context) {
        if (!isSuccess(context)) {
            throw new Error('Server returned ' + context.res.statusCode);
        }
        if (hasNoContent(context)) {
            return null;
        }
        const buffer = await (0, buffer_1.streamToBuffer)(context.stream);
        const str = buffer.toString();
        try {
            return JSON.parse(str);
        }
        catch (err) {
            err.message += ':\n' + str;
            throw err;
        }
    }
    exports.asJson = asJson;
    function updateProxyConfigurationsScope(scope) {
        registerProxyConfigurations(scope);
    }
    exports.updateProxyConfigurationsScope = updateProxyConfigurationsScope;
    let proxyConfiguration;
    function registerProxyConfigurations(scope) {
        const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
        const oldProxyConfiguration = proxyConfiguration;
        proxyConfiguration = {
            id: 'http',
            order: 15,
            title: (0, nls_1.localize)('httpConfigurationTitle', "HTTP"),
            type: 'object',
            scope,
            properties: {
                'http.proxy': {
                    type: 'string',
                    pattern: '^(https?|socks|socks4a?|socks5h?)://([^:]*(:[^@]*)?@)?([^:]+|\\[[:0-9a-fA-F]+\\])(:\\d+)?/?$|^$',
                    markdownDescription: (0, nls_1.localize)('proxy', "The proxy setting to use. If not set, will be inherited from the `http_proxy` and `https_proxy` environment variables."),
                    restricted: true
                },
                'http.proxyStrictSSL': {
                    type: 'boolean',
                    default: true,
                    description: (0, nls_1.localize)('strictSSL', "Controls whether the proxy server certificate should be verified against the list of supplied CAs."),
                    restricted: true
                },
                'http.proxyKerberosServicePrincipal': {
                    type: 'string',
                    markdownDescription: (0, nls_1.localize)('proxyKerberosServicePrincipal', "Overrides the principal service name for Kerberos authentication with the HTTP proxy. A default based on the proxy hostname is used when this is not set."),
                    restricted: true
                },
                'http.proxyAuthorization': {
                    type: ['null', 'string'],
                    default: null,
                    markdownDescription: (0, nls_1.localize)('proxyAuthorization', "The value to send as the `Proxy-Authorization` header for every network request."),
                    restricted: true
                },
                'http.proxySupport': {
                    type: 'string',
                    enum: ['off', 'on', 'fallback', 'override'],
                    enumDescriptions: [
                        (0, nls_1.localize)('proxySupportOff', "Disable proxy support for extensions."),
                        (0, nls_1.localize)('proxySupportOn', "Enable proxy support for extensions."),
                        (0, nls_1.localize)('proxySupportFallback', "Enable proxy support for extensions, fall back to request options, when no proxy found."),
                        (0, nls_1.localize)('proxySupportOverride', "Enable proxy support for extensions, override request options."),
                    ],
                    default: 'override',
                    description: (0, nls_1.localize)('proxySupport', "Use the proxy support for extensions."),
                    restricted: true
                },
                'http.systemCertificates': {
                    type: 'boolean',
                    default: true,
                    description: (0, nls_1.localize)('systemCertificates', "Controls whether CA certificates should be loaded from the OS. (On Windows and macOS, a reload of the window is required after turning this off.)"),
                    restricted: true
                }
            }
        };
        configurationRegistry.updateConfigurations({ add: [proxyConfiguration], remove: oldProxyConfiguration ? [oldProxyConfiguration] : [] });
    }
    registerProxyConfigurations(1 /* ConfigurationScope.APPLICATION */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3JlcXVlc3QvY29tbW9uL3JlcXVlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBYW5GLFFBQUEsZUFBZSxHQUFHLElBQUEsK0JBQWUsRUFBa0IsZ0JBQWdCLENBQUMsQ0FBQztJQVVsRixNQUFNLGVBQWU7UUFJcEIsWUFBNkIsUUFBa0I7WUFBbEIsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUFJLENBQUM7UUFFcEQsTUFBTTtZQUNMLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNsQixNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNwQyxLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7b0JBQ2hDLElBQUksR0FBRyxDQUFDLFdBQVcsRUFBRSxLQUFLLGVBQWUsSUFBSSxHQUFHLENBQUMsV0FBVyxFQUFFLEtBQUsscUJBQXFCLEVBQUU7d0JBQ3pGLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUM7cUJBQ3ZCO3lCQUFNO3dCQUNOLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3FCQUNsQztpQkFDRDtnQkFDRCxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQzthQUN2QjtZQUNELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUNyQixDQUFDO0tBRUQ7SUFFRCxNQUFzQixzQkFBdUIsU0FBUSxzQkFBVTtRQU85RCxZQUNDLGFBQTZCO1lBRTdCLEtBQUssRUFBRSxDQUFDO1lBTEQsWUFBTyxHQUFHLENBQUMsQ0FBQztZQU1uQixJQUFJLENBQUMsTUFBTSxHQUFHLGFBQWEsQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFF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