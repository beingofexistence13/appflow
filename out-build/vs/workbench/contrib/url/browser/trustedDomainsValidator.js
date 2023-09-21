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
define(["require", "exports", "vs/base/common/network", "vs/base/common/severity", "vs/base/common/uri", "vs/nls!vs/workbench/contrib/url/browser/trustedDomainsValidator", "vs/platform/dialogs/common/dialogs", "vs/platform/opener/common/opener", "vs/platform/product/common/productService", "vs/platform/quickinput/common/quickInput", "vs/platform/storage/common/storage", "vs/workbench/contrib/url/browser/trustedDomains", "vs/workbench/services/editor/common/editorService", "vs/platform/clipboard/common/clipboardService", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/instantiation", "vs/base/common/async", "vs/workbench/services/authentication/common/authentication", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/url/common/urlGlob", "vs/platform/workspace/common/workspaceTrust", "vs/platform/configuration/common/configuration"], function (require, exports, network_1, severity_1, uri_1, nls_1, dialogs_1, opener_1, productService_1, quickInput_1, storage_1, trustedDomains_1, editorService_1, clipboardService_1, telemetry_1, instantiation_1, async_1, authentication_1, workspace_1, urlGlob_1, workspaceTrust_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ETb = exports.$DTb = void 0;
    let $DTb = class $DTb {
        constructor(c, d, e, f, g, h, j, k, l, m, n, o, p) {
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.n = n;
            this.o = o;
            this.p = p;
            this.c.registerValidator({ shouldOpen: (uri, options) => this.validateLink(uri, options) });
            this.b = new async_1.$Xg(() => this.l.invokeFunction(trustedDomains_1.$ATb));
            this.m.onDidRegisterAuthenticationProvider(() => {
                this.b?.dispose();
                this.b = new async_1.$Xg(() => this.l.invokeFunction(trustedDomains_1.$ATb));
            });
            this.a = new async_1.$Xg(() => this.l.invokeFunction(trustedDomains_1.$zTb));
            this.n.onDidChangeWorkspaceFolders(() => {
                this.a?.dispose();
                this.a = new async_1.$Xg(() => this.l.invokeFunction(trustedDomains_1.$zTb));
            });
        }
        async validateLink(resource, openOptions) {
            if (!(0, opener_1.$OT)(resource, network_1.Schemas.http) && !(0, opener_1.$OT)(resource, network_1.Schemas.https)) {
                return true;
            }
            if (openOptions?.fromWorkspace && this.p.isWorkspaceTrusted() && !this.o.getValue('workbench.trustedDomains.promptInTrustedWorkspace')) {
                return true;
            }
            const originalResource = resource;
            let resourceUri;
            if (typeof resource === 'string') {
                resourceUri = uri_1.URI.parse(resource);
            }
            else {
                resourceUri = resource;
            }
            const { scheme, authority, path, query, fragment } = resourceUri;
            const domainToOpen = `${scheme}://${authority}`;
            const [workspaceDomains, userDomains] = await Promise.all([this.a.value, this.b.value]);
            const { defaultTrustedDomains, trustedDomains, } = this.l.invokeFunction(trustedDomains_1.$BTb);
            const allTrustedDomains = [...defaultTrustedDomains, ...trustedDomains, ...userDomains, ...workspaceDomains];
            if ($ETb(resourceUri, allTrustedDomains)) {
                return true;
            }
            else {
                let formattedLink = `${scheme}://${authority}${path}`;
                const linkTail = `${query ? '?' + query : ''}${fragment ? '#' + fragment : ''}`;
                const remainingLength = Math.max(0, 60 - formattedLink.length);
                const linkTailLengthToKeep = Math.min(Math.max(5, remainingLength), linkTail.length);
                if (linkTailLengthToKeep === linkTail.length) {
                    formattedLink += linkTail;
                }
                else {
                    // keep the first char ? or #
                    // add ... and keep the tail end as much as possible
                    formattedLink += linkTail.charAt(0) + '...' + linkTail.substring(linkTail.length - linkTailLengthToKeep + 1);
                }
                const { result } = await this.e.prompt({
                    type: severity_1.default.Info,
                    message: (0, nls_1.localize)(0, null, this.f.nameShort),
                    detail: typeof originalResource === 'string' ? originalResource : formattedLink,
                    buttons: [
                        {
                            label: (0, nls_1.localize)(1, null),
                            run: () => true
                        },
                        {
                            label: (0, nls_1.localize)(2, null),
                            run: () => {
                                this.j.writeText(typeof originalResource === 'string' ? originalResource : resourceUri.toString(true));
                                return false;
                            }
                        },
                        {
                            label: (0, nls_1.localize)(3, null),
                            run: async () => {
                                const pickedDomains = await (0, trustedDomains_1.$wTb)(trustedDomains, domainToOpen, resourceUri, this.g, this.d, this.h, this.k);
                                // Trust all domains
                                if (pickedDomains.indexOf('*') !== -1) {
                                    return true;
                                }
                                // Trust current domain
                                if ($ETb(resourceUri, pickedDomains)) {
                                    return true;
                                }
                                return false;
                            }
                        }
                    ],
                    cancelButton: {
                        run: () => false
                    }
                });
                return result;
            }
        }
    };
    exports.$DTb = $DTb;
    exports.$DTb = $DTb = __decorate([
        __param(0, opener_1.$NT),
        __param(1, storage_1.$Vo),
        __param(2, dialogs_1.$oA),
        __param(3, productService_1.$kj),
        __param(4, quickInput_1.$Gq),
        __param(5, editorService_1.$9C),
        __param(6, clipboardService_1.$UZ),
        __param(7, telemetry_1.$9k),
        __param(8, instantiation_1.$Ah),
        __param(9, authentication_1.$3I),
        __param(10, workspace_1.$Kh),
        __param(11, configuration_1.$8h),
        __param(12, workspaceTrust_1.$$z)
    ], $DTb);
    const rLocalhost = /^localhost(:\d+)?$/i;
    const r127 = /^127.0.0.1(:\d+)?$/;
    function isLocalhostAuthority(authority) {
        return rLocalhost.test(authority) || r127.test(authority);
    }
    /**
     * Case-normalize some case-insensitive URLs, such as github.
     */
    function normalizeURL(url) {
        const caseInsensitiveAuthorities = ['github.com'];
        try {
            const parsed = typeof url === 'string' ? uri_1.URI.parse(url, true) : url;
            if (caseInsensitiveAuthorities.includes(parsed.authority)) {
                return parsed.with({ path: parsed.path.toLowerCase() }).toString(true);
            }
            else {
                return parsed.toString(true);
            }
        }
        catch {
            return url.toString();
        }
    }
    /**
     * Check whether a domain like https://www.microsoft.com matches
     * the list of trusted domains.
     *
     * - Schemes must match
     * - There's no subdomain matching. For example https://microsoft.com doesn't match https://www.microsoft.com
     * - Star matches all subdomains. For example https://*.microsoft.com matches https://www.microsoft.com and https://foo.bar.microsoft.com
     */
    function $ETb(url, trustedDomains) {
        url = uri_1.URI.parse(normalizeURL(url));
        trustedDomains = trustedDomains.map(normalizeURL);
        if (isLocalhostAuthority(url.authority)) {
            return true;
        }
        for (let i = 0; i < trustedDomains.length; i++) {
            if (trustedDomains[i] === '*') {
                return true;
            }
            if ((0, urlGlob_1.$elb)(url, trustedDomains[i])) {
                return true;
            }
        }
        return false;
    }
    exports.$ETb = $ETb;
});
//# sourceMappingURL=trustedDomainsValidator.js.map