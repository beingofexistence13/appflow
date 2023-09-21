/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "url", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/errors", "vs/base/common/types", "vs/platform/configuration/common/configuration", "vs/platform/environment/common/environment", "vs/platform/shell/node/shellEnv", "vs/platform/log/common/log", "vs/platform/request/common/request", "vs/platform/request/node/proxy", "zlib"], function (require, exports, url_1, async_1, buffer_1, errors_1, types_1, configuration_1, environment_1, shellEnv_1, log_1, request_1, proxy_1, zlib_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Pq = exports.$Oq = void 0;
    /**
     * This service exposes the `request` API, while using the global
     * or configured proxy settings.
     */
    let $Oq = class $Oq extends request_1.$Jo {
        constructor(m, n, r, loggerService) {
            super(loggerService);
            this.m = m;
            this.n = n;
            this.r = r;
            this.s();
            this.B(m.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('http')) {
                    this.s();
                }
            }));
        }
        s() {
            const config = this.m.getValue('http');
            this.f = config?.proxy;
            this.g = !!config?.proxyStrictSSL;
            this.h = config?.proxyAuthorization;
        }
        async request(options, token) {
            const { f: proxyUrl, g: strictSSL } = this;
            let shellEnv = undefined;
            try {
                shellEnv = await (0, shellEnv_1.$Ml)(this.m, this.r, this.n.args, process.env);
            }
            catch (error) {
                if (!this.j) {
                    this.j = true;
                    this.r.error(`resolving shell environment failed`, (0, errors_1.$8)(error));
                }
            }
            const env = {
                ...process.env,
                ...shellEnv
            };
            const agent = options.agent ? options.agent : await (0, proxy_1.$Nq)(options.url || '', env, { proxyUrl, strictSSL });
            options.agent = agent;
            options.strictSSL = strictSSL;
            if (this.h) {
                options.headers = {
                    ...(options.headers || {}),
                    'Proxy-Authorization': this.h
                };
            }
            return this.c(options.isChromiumNetwork ? 'electron' : 'node', options, () => $Pq(options, token));
        }
        async resolveProxy(url) {
            return undefined; // currently not implemented in node
        }
    };
    exports.$Oq = $Oq;
    exports.$Oq = $Oq = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, environment_1.$Jh),
        __param(2, log_1.$5i),
        __param(3, log_1.$6i)
    ], $Oq);
    async function getNodeRequest(options) {
        const endpoint = (0, url_1.parse)(options.url);
        const module = endpoint.protocol === 'https:' ? await new Promise((resolve_1, reject_1) => { require(['https'], resolve_1, reject_1); }) : await new Promise((resolve_2, reject_2) => { require(['http'], resolve_2, reject_2); });
        return module.request;
    }
    async function $Pq(options, token) {
        return async_1.Promises.withAsyncBody(async (resolve, reject) => {
            const endpoint = (0, url_1.parse)(options.url);
            const rawRequest = options.getRawRequest
                ? options.getRawRequest(options)
                : await getNodeRequest(options);
            const opts = {
                hostname: endpoint.hostname,
                port: endpoint.port ? parseInt(endpoint.port) : (endpoint.protocol === 'https:' ? 443 : 80),
                protocol: endpoint.protocol,
                path: endpoint.path,
                method: options.type || 'GET',
                headers: options.headers,
                agent: options.agent,
                rejectUnauthorized: (0, types_1.$pf)(options.strictSSL) ? options.strictSSL : true
            };
            if (options.user && options.password) {
                opts.auth = options.user + ':' + options.password;
            }
            const req = rawRequest(opts, (res) => {
                const followRedirects = (0, types_1.$nf)(options.followRedirects) ? options.followRedirects : 3;
                if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && followRedirects > 0 && res.headers['location']) {
                    $Pq({
                        ...options,
                        url: res.headers['location'],
                        followRedirects: followRedirects - 1
                    }, token).then(resolve, reject);
                }
                else {
                    let stream = res;
                    // Responses from Electron net module should be treated as response
                    // from browser, which will apply gzip filter and decompress the response
                    // using zlib before passing the result to us. Following step can be bypassed
                    // in this case and proceed further.
                    // Refs https://source.chromium.org/chromium/chromium/src/+/main:net/url_request/url_request_http_job.cc;l=1266-1318
                    if (!options.isChromiumNetwork && res.headers['content-encoding'] === 'gzip') {
                        stream = res.pipe((0, zlib_1.createGunzip)());
                    }
                    resolve({ res, stream: (0, buffer_1.$Ud)(stream) });
                }
            });
            req.on('error', reject);
            if (options.timeout) {
                req.setTimeout(options.timeout);
            }
            // Chromium will abort the request if forbidden headers are set.
            // Ref https://source.chromium.org/chromium/chromium/src/+/main:services/network/public/cpp/header_util.cc;l=14-48;
            // for additional context.
            if (options.isChromiumNetwork) {
                req.removeHeader('Content-Length');
            }
            if (options.data) {
                if (typeof options.data === 'string') {
                    req.write(options.data);
                }
            }
            req.end();
            token.onCancellationRequested(() => {
                req.abort();
                reject(new errors_1.$3());
            });
        });
    }
    exports.$Pq = $Pq;
});
//# sourceMappingURL=requestService.js.map