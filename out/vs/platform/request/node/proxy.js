/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "url", "vs/base/common/types"], function (require, exports, url_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getProxyAgent = void 0;
    function getSystemProxyURI(requestURL, env) {
        if (requestURL.protocol === 'http:') {
            return env.HTTP_PROXY || env.http_proxy || null;
        }
        else if (requestURL.protocol === 'https:') {
            return env.HTTPS_PROXY || env.https_proxy || env.HTTP_PROXY || env.http_proxy || null;
        }
        return null;
    }
    async function getProxyAgent(rawRequestURL, env, options = {}) {
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
            rejectUnauthorized: (0, types_1.isBoolean)(options.strictSSL) ? options.strictSSL : true,
        };
        return requestURL.protocol === 'http:'
            ? new (await new Promise((resolve_1, reject_1) => { require(['http-proxy-agent'], resolve_1, reject_1); }))(opts)
            : new (await new Promise((resolve_2, reject_2) => { require(['https-proxy-agent'], resolve_2, reject_2); }))(opts);
    }
    exports.getProxyAgent = getProxyAgent;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJveHkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9yZXF1ZXN0L25vZGUvcHJveHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT2hHLFNBQVMsaUJBQWlCLENBQUMsVUFBZSxFQUFFLEdBQXVCO1FBQ2xFLElBQUksVUFBVSxDQUFDLFFBQVEsS0FBSyxPQUFPLEVBQUU7WUFDcEMsT0FBTyxHQUFHLENBQUMsVUFBVSxJQUFJLEdBQUcsQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDO1NBQ2hEO2FBQU0sSUFBSSxVQUFVLENBQUMsUUFBUSxLQUFLLFFBQVEsRUFBRTtZQUM1QyxPQUFPLEdBQUcsQ0FBQyxXQUFXLElBQUksR0FBRyxDQUFDLFdBQVcsSUFBSSxHQUFHLENBQUMsVUFBVSxJQUFJLEdBQUcsQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDO1NBQ3RGO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBT00sS0FBSyxVQUFVLGFBQWEsQ0FBQyxhQUFxQixFQUFFLEdBQXVCLEVBQUUsVUFBb0IsRUFBRTtRQUN6RyxNQUFNLFVBQVUsR0FBRyxJQUFBLFdBQVEsRUFBQyxhQUFhLENBQUMsQ0FBQztRQUMzQyxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxJQUFJLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUV4RSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2QsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUVELE1BQU0sYUFBYSxHQUFHLElBQUEsV0FBUSxFQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXpDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLEVBQUU7WUFDcEQsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUVELE1BQU0sSUFBSSxHQUFHO1lBQ1osSUFBSSxFQUFFLGFBQWEsQ0FBQyxRQUFRLElBQUksRUFBRTtZQUNsQyxJQUFJLEVBQUUsYUFBYSxDQUFDLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUMvRSxJQUFJLEVBQUUsYUFBYSxDQUFDLElBQUk7WUFDeEIsa0JBQWtCLEVBQUUsSUFBQSxpQkFBUyxFQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSTtTQUMzRSxDQUFDO1FBRUYsT0FBTyxVQUFVLENBQUMsUUFBUSxLQUFLLE9BQU87WUFDckMsQ0FBQyxDQUFDLElBQUksQ0FBQyxzREFBYSxrQkFBa0IsMkJBQUMsQ0FBQyxDQUFDLElBQWtCLENBQUM7WUFDNUQsQ0FBQyxDQUFDLElBQUksQ0FBQyxzREFBYSxtQkFBbUIsMkJBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUF4QkQsc0NBd0JDIn0=