/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "http", "https", "tls", "net", "vs/base/common/uri", "vs/platform/log/common/log", "@vscode/proxy-agent"], function (require, exports, http, https, tls, net, uri_1, log_1, proxy_agent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.connectProxyResolver = void 0;
    const systemCertificatesV2Default = true;
    function connectProxyResolver(extHostWorkspace, configProvider, extensionService, extHostLogService, mainThreadTelemetry, initData) {
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
    exports.connectProxyResolver = connectProxyResolver;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJveHlSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvbm9kZS9wcm94eVJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWlCaEcsTUFBTSwyQkFBMkIsR0FBRyxJQUFJLENBQUM7SUFFekMsU0FBZ0Isb0JBQW9CLENBQ25DLGdCQUEyQyxFQUMzQyxjQUFxQyxFQUNyQyxnQkFBeUMsRUFDekMsaUJBQThCLEVBQzlCLG1CQUE2QyxFQUM3QyxRQUFnQztRQUVoQyxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQztRQUN2RCxNQUFNLGNBQWMsR0FBRyxPQUFPLFlBQVksS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztRQUNwRyxNQUFNLE1BQU0sR0FBcUI7WUFDaEMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQztZQUN2RCx3QkFBd0IsRUFBRSx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLGlCQUFpQixFQUFFLG1CQUFtQixFQUFFLGNBQWMsRUFBRSxFQUFFLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7WUFDeEosV0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO1lBQ3ZFLGVBQWUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFzQixjQUFjLENBQUMsSUFBSSxLQUFLO1lBQ2hILHVCQUF1QixFQUFFLEdBQUcsRUFBRSxD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