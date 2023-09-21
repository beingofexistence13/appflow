/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "http", "https", "tls", "net", "vs/base/common/uri", "vs/platform/log/common/log", "@vscode/proxy-agent"], function (require, exports, http, https, tls, net, uri_1, log_1, proxy_agent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ldc = void 0;
    const systemCertificatesV2Default = true;
    function $Ldc(extHostWorkspace, configProvider, extensionService, extHostLogService, mainThreadTelemetry, initData) {
        const useHostProxy = initData.environment.useHostProxy;
        const doUseHostProxy = typeof useHostProxy === 'boolean' ? useHostProxy : !initData.remote.isRemote;
        const params = {
            resolveProxy: url => extHostWorkspace.resolveProxy(url),
            lookupProxyAuthorization: lookupProxyAuthorization.bind(undefined, extHostLogService, mainThreadTelemetry, configProvider, {}, initData.remote.isRemote),
            getProxyURL: () => configProvider.getConfiguration('http').get('proxy'),
            getProxySupport: () => configProvider.getConfiguration('http').get('proxySupport') || 'off',
            getSystemCertificatesV1: () => certSettingV1(configProvider),
            getSystemCertificatesV2: () => certSettingV2(configProvider),
            log: (level, message, ...args) => {
                switch (level) {
                    case proxy_agent_1.LogLevel.Trace:
                        extHostLogService.trace(message, ...args);
                        break;
                    case proxy_agent_1.LogLevel.Debug:
                        extHostLogService.debug(message, ...args);
                        break;
                    case proxy_agent_1.LogLevel.Info:
                        extHostLogService.info(message, ...args);
                        break;
                    case proxy_agent_1.LogLevel.Warning:
                        extHostLogService.warn(message, ...args);
                        break;
                    case proxy_agent_1.LogLevel.Error:
                        extHostLogService.error(message, ...args);
                        break;
                    case proxy_agent_1.LogLevel.Critical:
                        extHostLogService.error(message, ...args);
                        break;
                    case proxy_agent_1.LogLevel.Off: break;
                    default:
                        never(level, message, args);
                        break;
                }
                function never(level, message, ...args) {
                    extHostLogService.error('Unknown log level', level);
                    extHostLogService.error(message, ...args);
                }
            },
            getLogLevel: () => {
                const level = extHostLogService.getLevel();
                switch (level) {
                    case log_1.LogLevel.Trace: return proxy_agent_1.LogLevel.Trace;
                    case log_1.LogLevel.Debug: return proxy_agent_1.LogLevel.Debug;
                    case log_1.LogLevel.Info: return proxy_agent_1.LogLevel.Info;
                    case log_1.LogLevel.Warning: return proxy_agent_1.LogLevel.Warning;
                    case log_1.LogLevel.Error: return proxy_agent_1.LogLevel.Error;
                    case log_1.LogLevel.Off: return proxy_agent_1.LogLevel.Off;
                    default: return never(level);
                }
                function never(level) {
                    extHostLogService.error('Unknown log level', level);
                    return proxy_agent_1.LogLevel.Debug;
                }
            },
            proxyResolveTelemetry: () => { },
            useHostProxy: doUseHostProxy,
            addCertificates: [],
            env: process.env,
        };
        const resolveProxy = (0, proxy_agent_1.createProxyResolver)(params);
        const lookup = createPatchedModules(params, resolveProxy);
        return configureModuleLoading(extensionService, lookup);
    }
    exports.$Ldc = $Ldc;
    function createPatchedModules(params, resolveProxy) {
        return {
            http: Object.assign(http, (0, proxy_agent_1.createHttpPatch)(params, http, resolveProxy)),
            https: Object.assign(https, (0, proxy_agent_1.createHttpPatch)(params, https, resolveProxy)),
            net: Object.assign(net, (0, proxy_agent_1.createNetPatch)(params, net)),
            tls: Object.assign(tls, (0, proxy_agent_1.createTlsPatch)(params, tls))
        };
    }
    function certSettingV1(configProvider) {
        const http = configProvider.getConfiguration('http');
        return !http.get('experimental.systemCertificatesV2', systemCertificatesV2Default) && !!http.get('systemCertificates');
    }
    function certSettingV2(configProvider) {
        const http = configProvider.getConfiguration('http');
        return !!http.get('experimental.systemCertificatesV2', systemCertificatesV2Default) && !!http.get('systemCertificates');
    }
    const modulesCache = new Map();
    function configureModuleLoading(extensionService, lookup) {
        return extensionService.getExtensionPathIndex()
            .then(extensionPaths => {
            const node_module = globalThis._VSCODE_NODE_MODULES.module;
            const original = node_module._load;
            node_module._load = function load(request, parent, isMain) {
                if (request === 'net') {
                    return lookup.net;
                }
                if (request === 'tls') {
                    return lookup.tls;
                }
                if (request !== 'http' && request !== 'https') {
                    return original.apply(this, arguments);
                }
                const ext = extensionPaths.findSubstr(uri_1.URI.file(parent.filename));
                let cache = modulesCache.get(ext);
                if (!cache) {
                    modulesCache.set(ext, cache = {});
                }
                if (!cache[request]) {
                    const mod = lookup[request];
                    cache[request] = { ...mod }; // Copy to work around #93167.
                }
                return cache[request];
            };
        });
    }
    async function lookupProxyAuthorization(extHostLogService, mainThreadTelemetry, configProvider, proxyAuthenticateCache, isRemote, proxyURL, proxyAuthenticate, state) {
        const cached = proxyAuthenticateCache[proxyURL];
        if (proxyAuthenticate) {
            proxyAuthenticateCache[proxyURL] = proxyAuthenticate;
        }
        extHostLogService.trace('ProxyResolver#lookupProxyAuthorization callback', `proxyURL:${proxyURL}`, `proxyAuthenticate:${proxyAuthenticate}`, `proxyAuthenticateCache:${cached}`);
        const header = proxyAuthenticate || cached;
        const authenticate = Array.isArray(header) ? header : typeof header === 'string' ? [header] : [];
        sendTelemetry(mainThreadTelemetry, authenticate, isRemote);
        if (authenticate.some(a => /^(Negotiate|Kerberos)( |$)/i.test(a)) && !state.kerberosRequested) {
            try {
                state.kerberosRequested = true;
                const kerberos = await new Promise((resolve_1, reject_1) => { require(['kerberos'], resolve_1, reject_1); });
                const url = new URL(proxyURL);
                const spn = configProvider.getConfiguration('http').get('proxyKerberosServicePrincipal')
                    || (process.platform === 'win32' ? `HTTP/${url.hostname}` : `HTTP@${url.hostname}`);
                extHostLogService.debug('ProxyResolver#lookupProxyAuthorization Kerberos authentication lookup', `proxyURL:${proxyURL}`, `spn:${spn}`);
                const client = await kerberos.initializeClient(spn);
                const response = await client.step('');
                return 'Negotiate ' + response;
            }
            catch (err) {
                extHostLogService.error('ProxyResolver#lookupProxyAuthorization Kerberos authentication failed', err);
            }
        }
        return undefined;
    }
    let telemetrySent = false;
    function sendTelemetry(mainThreadTelemetry, authenticate, isRemote) {
        if (telemetrySent || !authenticate.length) {
            return;
        }
        telemetrySent = true;
        mainThreadTelemetry.$publicLog2('proxyAuthenticationRequest', {
            authenticationType: authenticate.map(a => a.split(' ')[0]).join(','),
            extensionHostType: isRemote ? 'remote' : 'local',
        });
    }
});
//# sourceMappingURL=proxyResolver.js.map