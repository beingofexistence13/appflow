/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/nls!vs/platform/request/common/request", "vs/platform/configuration/common/configurationRegistry", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/registry/common/platform"], function (require, exports, buffer_1, errors_1, lifecycle_1, nls_1, configurationRegistry_1, instantiation_1, log_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Po = exports.$Oo = exports.$No = exports.$Mo = exports.$Lo = exports.$Ko = exports.$Jo = exports.$Io = void 0;
    exports.$Io = (0, instantiation_1.$Bh)('requestService');
    class LoggableHeaders {
        constructor(b) {
            this.b = b;
        }
        toJSON() {
            if (!this.a) {
                const headers = Object.create(null);
                for (const key in this.b) {
                    if (key.toLowerCase() === 'authorization' || key.toLowerCase() === 'proxy-authorization') {
                        headers[key] = '*****';
                    }
                    else {
                        headers[key] = this.b[key];
                    }
                }
                this.a = headers;
            }
            return this.a;
        }
    }
    class $Jo extends lifecycle_1.$kc {
        constructor(loggerService) {
            super();
            this.b = 0;
            this.a = loggerService.createLogger('network', {
                name: (0, nls_1.localize)(0, null),
                when: log_1.$jj.isEqualTo((0, log_1.$hj)(log_1.LogLevel.Trace)).serialize()
            });
        }
        async c(stack, options, request) {
            const prefix = `${stack} #${++this.b}: ${options.url}`;
            this.a.trace(`${prefix} - begin`, options.type, new LoggableHeaders(options.headers ?? {}));
            try {
                const result = await request();
                this.a.trace(`${prefix} - end`, options.type, result.res.statusCode, result.res.headers);
                return result;
            }
            catch (error) {
                this.a.error(`${prefix} - error`, options.type, (0, errors_1.$8)(error));
                throw error;
            }
        }
    }
    exports.$Jo = $Jo;
    function $Ko(context) {
        return (context.res.statusCode && context.res.statusCode >= 200 && context.res.statusCode < 300) || context.res.statusCode === 1223;
    }
    exports.$Ko = $Ko;
    function $Lo(context) {
        return context.res.statusCode === 204;
    }
    exports.$Lo = $Lo;
    async function $Mo(context) {
        if ($Lo(context)) {
            return null;
        }
        const buffer = await (0, buffer_1.$Rd)(context.stream);
        return buffer.toString();
    }
    exports.$Mo = $Mo;
    async function $No(context) {
        if (!$Ko(context)) {
            throw new Error('Server returned ' + context.res.statusCode);
        }
        return $Mo(context);
    }
    exports.$No = $No;
    async function $Oo(context) {
        if (!$Ko(context)) {
            throw new Error('Server returned ' + context.res.statusCode);
        }
        if ($Lo(context)) {
            return null;
        }
        const buffer = await (0, buffer_1.$Rd)(context.stream);
        const str = buffer.toString();
        try {
            return JSON.parse(str);
        }
        catch (err) {
            err.message += ':\n' + str;
            throw err;
        }
    }
    exports.$Oo = $Oo;
    function $Po(scope) {
        registerProxyConfigurations(scope);
    }
    exports.$Po = $Po;
    let proxyConfiguration;
    function registerProxyConfigurations(scope) {
        const configurationRegistry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
        const oldProxyConfiguration = proxyConfiguration;
        proxyConfiguration = {
            id: 'http',
            order: 15,
            title: (0, nls_1.localize)(1, null),
            type: 'object',
            scope,
            properties: {
                'http.proxy': {
                    type: 'string',
                    pattern: '^(https?|socks|socks4a?|socks5h?)://([^:]*(:[^@]*)?@)?([^:]+|\\[[:0-9a-fA-F]+\\])(:\\d+)?/?$|^$',
                    markdownDescription: (0, nls_1.localize)(2, null),
                    restricted: true
                },
                'http.proxyStrictSSL': {
                    type: 'boolean',
                    default: true,
                    description: (0, nls_1.localize)(3, null),
                    restricted: true
                },
                'http.proxyKerberosServicePrincipal': {
                    type: 'string',
                    markdownDescription: (0, nls_1.localize)(4, null),
                    restricted: true
                },
                'http.proxyAuthorization': {
                    type: ['null', 'string'],
                    default: null,
                    markdownDescription: (0, nls_1.localize)(5, null),
                    restricted: true
                },
                'http.proxySupport': {
                    type: 'string',
                    enum: ['off', 'on', 'fallback', 'override'],
                    enumDescriptions: [
                        (0, nls_1.localize)(6, null),
                        (0, nls_1.localize)(7, null),
                        (0, nls_1.localize)(8, null),
                        (0, nls_1.localize)(9, null),
                    ],
                    default: 'override',
                    description: (0, nls_1.localize)(10, null),
                    restricted: true
                },
                'http.systemCertificates': {
                    type: 'boolean',
                    default: true,
                    description: (0, nls_1.localize)(11, null),
                    restricted: true
                }
            }
        };
        configurationRegistry.updateConfigurations({ add: [proxyConfiguration], remove: oldProxyConfiguration ? [oldProxyConfiguration] : [] });
    }
    registerProxyConfigurations(1 /* ConfigurationScope.APPLICATION */);
});
//# sourceMappingURL=request.js.map