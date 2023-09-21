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
define(["require", "exports", "fs", "vs/base/node/pfs", "path", "url", "cookie", "crypto", "vs/base/common/extpath", "vs/base/common/mime", "vs/base/common/platform", "vs/platform/log/common/log", "vs/server/node/serverEnvironmentService", "vs/base/common/path", "vs/base/common/network", "vs/base/common/uuid", "vs/platform/product/common/productService", "vs/platform/request/common/request", "vs/base/common/cancellation", "vs/base/common/uri", "vs/base/common/buffer", "vs/base/common/types", "vs/platform/remote/common/remoteHosts"], function (require, exports, fs_1, pfs_1, path, url, cookie, crypto, extpath_1, mime_1, platform_1, log_1, serverEnvironmentService_1, path_1, network_1, uuid_1, productService_1, request_1, cancellation_1, uri_1, buffer_1, types_1, remoteHosts_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebClientServer = exports.serveFile = exports.CacheControl = exports.serveError = void 0;
    const textMimeType = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.css': 'text/css',
        '.svg': 'image/svg+xml',
    };
    /**
     * Return an error to the client.
     */
    async function serveError(req, res, errorCode, errorMessage) {
        res.writeHead(errorCode, { 'Content-Type': 'text/plain' });
        res.end(errorMessage);
    }
    exports.serveError = serveError;
    var CacheControl;
    (function (CacheControl) {
        CacheControl[CacheControl["NO_CACHING"] = 0] = "NO_CACHING";
        CacheControl[CacheControl["ETAG"] = 1] = "ETAG";
        CacheControl[CacheControl["NO_EXPIRY"] = 2] = "NO_EXPIRY";
    })(CacheControl || (exports.CacheControl = CacheControl = {}));
    /**
     * Serve a file at a given path or 404 if the file is missing.
     */
    async function serveFile(filePath, cacheControl, logService, req, res, responseHeaders) {
        try {
            const stat = await pfs_1.Promises.stat(filePath); // throws an error if file doesn't exist
            if (cacheControl === 1 /* CacheControl.ETAG */) {
                // Check if file modified since
                const etag = `W/"${[stat.ino, stat.size, stat.mtime.getTime()].join('-')}"`; // weak validator (https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag)
                if (req.headers['if-none-match'] === etag) {
                    res.writeHead(304);
                    return void res.end();
                }
                responseHeaders['Etag'] = etag;
            }
            else if (cacheControl === 2 /* CacheControl.NO_EXPIRY */) {
                responseHeaders['Cache-Control'] = 'public, max-age=31536000';
            }
            else if (cacheControl === 0 /* CacheControl.NO_CACHING */) {
                responseHeaders['Cache-Control'] = 'no-store';
            }
            responseHeaders['Content-Type'] = textMimeType[(0, path_1.extname)(filePath)] || (0, mime_1.getMediaMime)(filePath) || 'text/plain';
            res.writeHead(200, responseHeaders);
            // Data
            (0, fs_1.createReadStream)(filePath).pipe(res);
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                logService.error(error);
                console.error(error.toString());
            }
            else {
                console.error(`File not found: ${filePath}`);
            }
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return void res.end('Not found');
        }
    }
    exports.serveFile = serveFile;
    const APP_ROOT = (0, path_1.dirname)(network_1.FileAccess.asFileUri('').fsPath);
    let WebClientServer = class WebClientServer {
        constructor(_connectionToken, _environmentService, _logService, _requestService, _productService) {
            this._connectionToken = _connectionToken;
            this._environmentService = _environmentService;
            this._logService = _logService;
            this._requestService = _requestService;
            this._productService = _productService;
            this._webExtensionResourceUrlTemplate = this._productService.extensionsGallery?.resourceUrlTemplate ? uri_1.URI.parse(this._productService.extensionsGallery.resourceUrlTemplate) : undefined;
            const serverRootPath = (0, remoteHosts_1.getRemoteServerRootPath)(_productService);
            this._staticRoute = `${serverRootPath}/static`;
            this._callbackRoute = `${serverRootPath}/callback`;
            this._webExtensionRoute = `${serverRootPath}/web-extension-resource`;
        }
        /**
         * Handle web resources (i.e. only needed by the web client).
         * **NOTE**: This method is only invoked when the server has web bits.
         * **NOTE**: This method is only invoked after the connection token has been validated.
         */
        async handle(req, res, parsedUrl) {
            try {
                const pathname = parsedUrl.pathname;
                if (pathname.startsWith(this._staticRoute) && pathname.charCodeAt(this._staticRoute.length) === 47 /* CharCode.Slash */) {
                    return this._handleStatic(req, res, parsedUrl);
                }
                if (pathname === '/') {
                    return this._handleRoot(req, res, parsedUrl);
                }
                if (pathname === this._callbackRoute) {
                    // callback support
                    return this._handleCallback(res);
                }
                if (pathname.startsWith(this._webExtensionRoute) && pathname.charCodeAt(this._webExtensionRoute.length) === 47 /* CharCode.Slash */) {
                    // extension resource support
                    return this._handleWebExtensionResource(req, res, parsedUrl);
                }
                return serveError(req, res, 404, 'Not found.');
            }
            catch (error) {
                this._logService.error(error);
                console.error(error.toString());
                return serveError(req, res, 500, 'Internal Server Error.');
            }
        }
        /**
         * Handle HTTP requests for /static/*
         */
        async _handleStatic(req, res, parsedUrl) {
            const headers = Object.create(null);
            // Strip the this._staticRoute from the path
            const normalizedPathname = decodeURIComponent(parsedUrl.pathname); // support paths that are uri-encoded (e.g. spaces => %20)
            const relativeFilePath = normalizedPathname.substring(this._staticRoute.length + 1);
            const filePath = (0, path_1.join)(APP_ROOT, relativeFilePath); // join also normalizes the path
            if (!(0, extpath_1.isEqualOrParent)(filePath, APP_ROOT, !platform_1.isLinux)) {
                return serveError(req, res, 400, `Bad request.`);
            }
            return serveFile(filePath, this._environmentService.isBuilt ? 2 /* CacheControl.NO_EXPIRY */ : 1 /* CacheControl.ETAG */, this._logService, req, res, headers);
        }
        _getResourceURLTemplateAuthority(uri) {
            const index = uri.authority.indexOf('.');
            return index !== -1 ? uri.authority.substring(index + 1) : undefined;
        }
        /**
         * Handle extension resources
         */
        async _handleWebExtensionResource(req, res, parsedUrl) {
            if (!this._webExtensionResourceUrlTemplate) {
                return serveError(req, res, 500, 'No extension gallery service configured.');
            }
            // Strip `/web-extension-resource/` from the path
            const normalizedPathname = decodeURIComponent(parsedUrl.pathname); // support paths that are uri-encoded (e.g. spaces => %20)
            const path = (0, path_1.normalize)(normalizedPathname.substring(this._webExtensionRoute.length + 1));
            const uri = uri_1.URI.parse(path).with({
                scheme: this._webExtensionResourceUrlTemplate.scheme,
                authority: path.substring(0, path.indexOf('/')),
                path: path.substring(path.indexOf('/') + 1)
            });
            if (this._getResourceURLTemplateAuthority(this._webExtensionResourceUrlTemplate) !== this._getResourceURLTemplateAuthority(uri)) {
                return serveError(req, res, 403, 'Request Forbidden');
            }
            const headers = {};
            const setRequestHeader = (header) => {
                const value = req.headers[header];
                if (value && ((0, types_1.isString)(value) || value[0])) {
                    headers[header] = (0, types_1.isString)(value) ? value : value[0];
                }
                else if (header !== header.toLowerCase()) {
                    setRequestHeader(header.toLowerCase());
                }
            };
            setRequestHeader('X-Client-Name');
            setRequestHeader('X-Client-Version');
            setRequestHeader('X-Machine-Id');
            setRequestHeader('X-Client-Commit');
            const context = await this._requestService.request({
                type: 'GET',
                url: uri.toString(true),
                headers
            }, cancellation_1.CancellationToken.None);
            const status = context.res.statusCode || 500;
            if (status !== 200) {
                let text = null;
                try {
                    text = await (0, request_1.asTextOrError)(context);
                }
                catch (error) { /* Ignore */ }
                return serveError(req, res, status, text || `Request failed with status ${status}`);
            }
            const responseHeaders = Object.create(null);
            const setResponseHeader = (header) => {
                const value = context.res.headers[header];
                if (value) {
                    responseHeaders[header] = value;
                }
                else if (header !== header.toLowerCase()) {
                    setResponseHeader(header.toLowerCase());
                }
            };
            setResponseHeader('Cache-Control');
            setResponseHeader('Content-Type');
            res.writeHead(200, responseHeaders);
            const buffer = await (0, buffer_1.streamToBuffer)(context.stream);
            return void res.end(buffer.buffer);
        }
        /**
         * Handle HTTP requests for /
         */
        async _handleRoot(req, res, parsedUrl) {
            const queryConnectionToken = parsedUrl.query[network_1.connectionTokenQueryName];
            if (typeof queryConnectionToken === 'string') {
                // We got a connection token as a query parameter.
                // We want to have a clean URL, so we strip it
                const responseHeaders = Object.create(null);
                responseHeaders['Set-Cookie'] = cookie.serialize(network_1.connectionTokenCookieName, queryConnectionToken, {
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 7 /* 1 week */
                });
                const newQuery = Object.create(null);
                for (const key in parsedUrl.query) {
                    if (key !== network_1.connectionTokenQueryName) {
                        newQuery[key] = parsedUrl.query[key];
                    }
                }
                const newLocation = url.format({ pathname: '/', query: newQuery });
                responseHeaders['Location'] = newLocation;
                res.writeHead(302, responseHeaders);
                return void res.end();
            }
            const getFirstHeader = (headerName) => {
                const val = req.headers[headerName];
                return Array.isArray(val) ? val[0] : val;
            };
            const useTestResolver = (!this._environmentService.isBuilt && this._environmentService.args['use-test-resolver']);
            const remoteAuthority = (useTestResolver
                ? 'test+test'
                : (getFirstHeader('x-original-host') || getFirstHeader('x-forwarded-host') || req.headers.host));
            if (!remoteAuthority) {
                return serveError(req, res, 400, `Bad request.`);
            }
            function asJSON(value) {
                return JSON.stringify(value).replace(/"/g, '&quot;');
            }
            let _wrapWebWorkerExtHostInIframe = undefined;
            if (this._environmentService.args['enable-smoke-test-driver']) {
                // integration tests run at a time when the built output is not yet published to the CDN
                // so we must disable the iframe wrapping because the iframe URL will give a 404
                _wrapWebWorkerExtHostInIframe = false;
            }
            const resolveWorkspaceURI = (defaultLocation) => defaultLocation && uri_1.URI.file(path.resolve(defaultLocation)).with({ scheme: network_1.Schemas.vscodeRemote, authority: remoteAuthority });
            const filePath = network_1.FileAccess.asFileUri(this._environmentService.isBuilt ? 'vs/code/browser/workbench/workbench.html' : 'vs/code/browser/workbench/workbench-dev.html').fsPath;
            const authSessionInfo = !this._environmentService.isBuilt && this._environmentService.args['github-auth'] ? {
                id: (0, uuid_1.generateUuid)(),
                providerId: 'github',
                accessToken: this._environmentService.args['github-auth'],
                scopes: [['user:email'], ['repo']]
            } : undefined;
            const productConfiguration = {
            // embedderIdentifier: 'server-distro',
            // extensionsGallery: this._webExtensionResourceUrlTemplate ? {
            // 	...this._productService.extensionsGallery,
            // 	'resourceUrlTemplate': this._webExtensionResourceUrlTemplate.with({
            // 		scheme: 'http',
            // 		authority: remoteAuthority,
            // 		path: `${this._webExtensionRoute}/${this._webExtensionResourceUrlTemplate.authority}${this._webExtensionResourceUrlTemplate.path}`
            // 	}).toString(true)
            // } : undefined
            };
            if (!this._environmentService.isBuilt) {
                try {
                    const productOverrides = JSON.parse((await pfs_1.Promises.readFile((0, path_1.join)(APP_ROOT, 'product.overrides.json'))).toString());
                    Object.assign(productConfiguration, productOverrides);
                }
                catch (err) { /* Ignore Error */ }
            }
            const workbenchWebConfiguration = {
                remoteAuthority,
                _wrapWebWorkerExtHostInIframe,
                developmentOptions: { enableSmokeTestDriver: this._environmentService.args['enable-smoke-test-driver'] ? true : undefined, logLevel: this._logService.getLevel() },
                settingsSyncOptions: !this._environmentService.isBuilt && this._environmentService.args['enable-sync'] ? { enabled: true } : undefined,
                enableWorkspaceTrust: !this._environmentService.args['disable-workspace-trust'],
                folderUri: resolveWorkspaceURI(this._environmentService.args['default-folder']),
                workspaceUri: resolveWorkspaceURI(this._environmentService.args['default-workspace']),
                productConfiguration,
                callbackRoute: this._callbackRoute
            };
            const nlsBaseUrl = this._productService.extensionsGallery?.nlsBaseUrl;
            const values = {
                WORKBENCH_WEB_CONFIGURATION: asJSON(workbenchWebConfiguration),
                WORKBENCH_AUTH_SESSION: authSessionInfo ? asJSON(authSessionInfo) : '',
                WORKBENCH_WEB_BASE_URL: this._staticRoute,
                WORKBENCH_NLS_BASE_URL: nlsBaseUrl ? `${nlsBaseUrl}${!nlsBaseUrl.endsWith('/') ? '/' : ''}${this._productService.commit}/${this._productService.version}/` : '',
            };
            if (useTestResolver) {
                const bundledExtensions = [];
                for (const extensionPath of ['vscode-test-resolver', 'github-authentication']) {
                    const packageJSON = JSON.parse((await pfs_1.Promises.readFile(network_1.FileAccess.asFileUri(`${network_1.builtinExtensionsPath}/${extensionPath}/package.json`).fsPath)).toString());
                    bundledExtensions.push({ extensionPath, packageJSON });
                }
                values['WORKBENCH_BUILTIN_EXTENSIONS'] = asJSON(bundledExtensions);
            }
            let data;
            try {
                const workbenchTemplate = (await pfs_1.Promises.readFile(filePath)).toString();
                data = workbenchTemplate.replace(/\{\{([^}]+)\}\}/g, (_, key) => values[key] ?? 'undefined');
            }
            catch (e) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                return void res.end('Not found');
            }
            const cspDirectives = [
                'default-src \'self\';',
                'img-src \'self\' https: data: blob:;',
                'media-src \'self\';',
                `script-src 'self' 'unsafe-eval' ${this._getScriptCspHashes(data).join(' ')} 'sha256-fh3TwPMflhsEIpR8g1OYTIMVWhXTLcjQ9kh2tIpmv54=' ${useTestResolver ? '' : `http://${remoteAuthority}`};`,
                'child-src \'self\';',
                `frame-src 'self' https://*.vscode-cdn.net data:;`,
                'worker-src \'self\' data: blob:;',
                'style-src \'self\' \'unsafe-inline\';',
                'connect-src \'self\' ws: wss: https:;',
                'font-src \'self\' blob:;',
                'manifest-src \'self\';'
            ].join(' ');
            const headers = {
                'Content-Type': 'text/html',
                'Content-Security-Policy': cspDirectives
            };
            if (this._connectionToken.type !== 0 /* ServerConnectionTokenType.None */) {
                // At this point we know the client has a valid cookie
                // and we want to set it prolong it to ensure that this
                // client is valid for another 1 week at least
                headers['Set-Cookie'] = cookie.serialize(network_1.connectionTokenCookieName, this._connectionToken.value, {
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 7 /* 1 week */
                });
            }
            res.writeHead(200, headers);
            return void res.end(data);
        }
        _getScriptCspHashes(content) {
            // Compute the CSP hashes for line scripts. Uses regex
            // which means it isn't 100% good.
            const regex = /<script>([\s\S]+?)<\/script>/img;
            const result = [];
            let match;
            while (match = regex.exec(content)) {
                const hasher = crypto.createHash('sha256');
                // This only works on Windows if we strip `\r` from `\r\n`.
                const script = match[1].replace(/\r\n/g, '\n');
                const hash = hasher
                    .update(Buffer.from(script))
                    .digest().toString('base64');
                result.push(`'sha256-${hash}'`);
            }
            return result;
        }
        /**
         * Handle HTTP requests for /callback
         */
        async _handleCallback(res) {
            const filePath = network_1.FileAccess.asFileUri('vs/code/browser/workbench/callback.html').fsPath;
            const data = (await pfs_1.Promises.readFile(filePath)).toString();
            const cspDirectives = [
                'default-src \'self\';',
                'img-src \'self\' https: data: blob:;',
                'media-src \'none\';',
                `script-src 'self' ${this._getScriptCspHashes(data).join(' ')};`,
                'style-src \'self\' \'unsafe-inline\';',
                'font-src \'self\' blob:;'
            ].join(' ');
            res.writeHead(200, {
                'Content-Type': 'text/html',
                'Content-Security-Policy': cspDirectives
            });
            return void res.end(data);
        }
    };
    exports.WebClientServer = WebClientServer;
    exports.WebClientServer = WebClientServer = __decorate([
        __param(1, serverEnvironmentService_1.IServerEnvironmentService),
        __param(2, log_1.ILogService),
        __param(3, request_1.IRequestService),
        __param(4, productService_1.IProductService)
    ], WebClientServer);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViQ2xpZW50U2VydmVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvc2VydmVyL25vZGUvd2ViQ2xpZW50U2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQThCaEcsTUFBTSxZQUFZLEdBQUc7UUFDcEIsT0FBTyxFQUFFLFdBQVc7UUFDcEIsS0FBSyxFQUFFLGlCQUFpQjtRQUN4QixPQUFPLEVBQUUsa0JBQWtCO1FBQzNCLE1BQU0sRUFBRSxVQUFVO1FBQ2xCLE1BQU0sRUFBRSxlQUFlO0tBQ2tCLENBQUM7SUFFM0M7O09BRUc7SUFDSSxLQUFLLFVBQVUsVUFBVSxDQUFDLEdBQXlCLEVBQUUsR0FBd0IsRUFBRSxTQUFpQixFQUFFLFlBQW9CO1FBQzVILEdBQUcsQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUM7UUFDM0QsR0FBRyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN2QixDQUFDO0lBSEQsZ0NBR0M7SUFFRCxJQUFrQixZQUVqQjtJQUZELFdBQWtCLFlBQVk7UUFDN0IsMkRBQVUsQ0FBQTtRQUFFLCtDQUFJLENBQUE7UUFBRSx5REFBUyxDQUFBO0lBQzVCLENBQUMsRUFGaUIsWUFBWSw0QkFBWixZQUFZLFFBRTdCO0lBRUQ7O09BRUc7SUFDSSxLQUFLLFVBQVUsU0FBUyxDQUFDLFFBQWdCLEVBQUUsWUFBMEIsRUFBRSxVQUF1QixFQUFFLEdBQXlCLEVBQUUsR0FBd0IsRUFBRSxlQUF1QztRQUNsTSxJQUFJO1lBQ0gsTUFBTSxJQUFJLEdBQUcsTUFBTSxjQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsd0NBQXdDO1lBQ3BGLElBQUksWUFBWSw4QkFBc0IsRUFBRTtnQkFFdkMsK0JBQStCO2dCQUMvQixNQUFNLElBQUksR0FB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