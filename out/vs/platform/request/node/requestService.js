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
    exports.nodeRequest = exports.RequestService = void 0;
    /**
     * This service exposes the `request` API, while using the global
     * or configured proxy settings.
     */
    let RequestService = class RequestService extends request_1.AbstractRequestService {
        constructor(configurationService, environmentService, logService, loggerService) {
            super(loggerService);
            this.configurationService = configurationService;
            this.environmentService = environmentService;
            this.logService = logService;
            this.configure();
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('http')) {
                    this.configure();
                }
            }));
        }
        configure() {
            const config = this.configurationService.getValue('http');
            this.proxyUrl = config?.proxy;
            this.strictSSL = !!config?.proxyStrictSSL;
            this.authorization = config?.proxyAuthorization;
        }
        async request(options, token) {
            const { proxyUrl, strictSSL } = this;
            let shellEnv = undefined;
            try {
                shellEnv = await (0, shellEnv_1.getResolvedShellEnv)(this.configurationService, this.logService, this.environmentService.args, process.env);
            }
            catch (error) {
                if (!this.shellEnvErrorLogged) {
                    this.shellEnvErrorLogged = true;
                    this.logService.error(`resolving shell environment failed`, (0, errors_1.getErrorMessage)(error));
                }
            }
            const env = {
                ...process.env,
                ...shellEnv
            };
            const agent = options.agent ? options.agent : await (0, proxy_1.getProxyAgent)(options.url || '', env, { proxyUrl, strictSSL });
            options.agent = agent;
            options.strictSSL = strictSSL;
            if (this.authorization) {
                options.headers = {
                    ...(options.headers || {}),
                    'Proxy-Authorization': this.authorization
                };
            }
            return this.logAndRequest(options.isChromiumNetwork ? 'electron' : 'node', options, () => nodeRequest(options, token));
        }
        async resolveProxy(url) {
            return undefined; // currently not implemented in node
        }
    };
    exports.RequestService = RequestService;
    exports.RequestService = RequestService = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, environment_1.INativeEnvironmentService),
        __param(2, log_1.ILogService),
        __param(3, log_1.ILoggerService)
    ], RequestService);
    async function getNodeRequest(options) {
        const endpoint = (0, url_1.parse)(options.url);
        const module = endpoint.protocol === 'https:' ? await new Promise((resolve_1, reject_1) => { require(['https'], resolve_1, reject_1); }) : await new Promise((resolve_2, reject_2) => { require(['http'], resolve_2, reject_2); });
        return module.request;
    }
    async function nodeRequest(options, token) {
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
                rejectUnauthorized: (0, types_1.isBoolean)(options.strictSSL) ? options.strictSSL : true
            };
            if (options.user && options.password) {
                opts.auth = options.user + ':' + options.password;
            }
            const req = rawRequest(opts, (res) => {
                const followRedirects = (0, types_1.isNumber)(options.followRedirects) ? options.followRedirects : 3;
                if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && followRedirects > 0 && res.headers['location']) {
                    nodeRequest({
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
                    resolve({ res, stream: (0, buffer_1.streamToBufferReadableStream)(stream) });
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
                reject(new errors_1.CancellationError());
            });
        });
    }
    exports.nodeRequest = nodeRequest;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9yZXF1ZXN0L25vZGUvcmVxdWVzdFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBcUNoRzs7O09BR0c7SUFDSSxJQUFNLGNBQWMsR0FBcEIsTUFBTSxjQUFlLFNBQVEsZ0NBQXNCO1FBU3pELFlBQ3lDLG9CQUEyQyxFQUN2QyxrQkFBNkMsRUFDM0QsVUFBdUIsRUFDckMsYUFBNkI7WUFFN0MsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBTG1CLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDdkMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUEyQjtZQUMzRCxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBSXJELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNqQixJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNoRSxJQUFJLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDbkMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO2lCQUNqQjtZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRU8sU0FBUztZQUNoQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFpQyxNQUFNLENBQUMsQ0FBQztZQUUxRixJQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sRUFBRSxLQUFLLENBQUM7WUFDOUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQztZQUMxQyxJQUFJLENBQUMsYUFBYSxHQUFHLE1BQU0sRUFBRSxrQkFBa0IsQ0FBQztRQUNqRCxDQUFDO1FBRUQsS0FBSyxDQUFD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