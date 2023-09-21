/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "url", "vs/base/common/types"], function (require, exports, url_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Nq = void 0;
    function getSystemProxyURI(requestURL, env) {
        if (requestURL.protocol === 'http:') {
            return env.HTTP_PROXY || env.http_proxy || null;
        }
        else if (requestURL.protocol === 'https:') {
            return env.HTTPS_PROXY || env.https_proxy || env.HTTP_PROXY || env.http_proxy || null;
        }
        return null;
    }
    async function $Nq(rawRequestURL, env, options = {}) {
        const requestURL = (0, url_1.parse)(rawRequestURL);
        const proxyURL = options.proxyUrl || getSystemProxyURI(requestURL, env);
        if (!proxyURL) {
            return null;
        }
        const proxyEndpoint = (0, url_1.parse)(proxyURL);
        if (!/^https?:$/.test(proxyEndpoint.protocol || '')) {
            return null;
        }
        const opts = {
            host: proxyEndpoint.hostname || '',
            port: proxyEndpoint.port || (proxyEndpoint.protocol === 'https' ? '443' : '80'),
            auth: proxyEndpoint.auth,
            rejectUnauthorized: (0, types_1.$pf)(options.strictSSL) ? options.strictSSL : true,
        };
        return requestURL.protocol === 'http:'
            ? new (await new Promise((resolve_1, reject_1) => { require(['http-proxy-agent'], resolve_1, reject_1); }))(opts)
            : new (await new Promise((resolve_2, reject_2) => { require(['https-proxy-agent'], resolve_2, reject_2); }))(opts);
    }
    exports.$Nq = $Nq;
});
//# sourceMappingURL=proxy.js.map