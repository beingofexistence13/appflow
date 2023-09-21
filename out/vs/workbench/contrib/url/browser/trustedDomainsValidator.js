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
define(["require", "exports", "vs/base/common/network", "vs/base/common/severity", "vs/base/common/uri", "vs/nls", "vs/platform/dialogs/common/dialogs", "vs/platform/opener/common/opener", "vs/platform/product/common/productService", "vs/platform/quickinput/common/quickInput", "vs/platform/storage/common/storage", "vs/workbench/contrib/url/browser/trustedDomains", "vs/workbench/services/editor/common/editorService", "vs/platform/clipboard/common/clipboardService", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/instantiation", "vs/base/common/async", "vs/workbench/services/authentication/common/authentication", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/url/common/urlGlob", "vs/platform/workspace/common/workspaceTrust", "vs/platform/configuration/common/configuration"], function (require, exports, network_1, severity_1, uri_1, nls_1, dialogs_1, opener_1, productService_1, quickInput_1, storage_1, trustedDomains_1, editorService_1, clipboardService_1, telemetry_1, instantiation_1, async_1, authentication_1, workspace_1, urlGlob_1, workspaceTrust_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isURLDomainTrusted = exports.OpenerValidatorContributions = void 0;
    let OpenerValidatorContributions = class OpenerValidatorContributions {
        constructor(_openerService, _storageService, _dialogService, _productService, _quickInputService, _editorService, _clipboardService, _telemetryService, _instantiationService, _authenticationService, _workspaceContextService, _configurationService, _workspaceTrustService) {
            this._openerService = _openerService;
            this._storageService = _storageService;
            this._dialogService = _dialogService;
            this._productService = _productService;
            this._quickInputService = _quickInputService;
            this._editorService = _editorService;
            this._clipboardService = _clipboardService;
            this._telemetryService = _telemetryService;
            this._instantiationService = _instantiationService;
            this._authenticationService = _authenticationService;
            this._workspaceContextService = _workspaceContextService;
            this._configurationService = _configurationService;
            this._workspaceTrustService = _workspaceTrustService;
            this._openerService.registerValidator({ shouldOpen: (uri, options) => this.validateLink(uri, options) });
            this._readAuthenticationTrustedDomainsResult = new async_1.IdleValue(() => this._instantiationService.invokeFunction(trustedDomains_1.readAuthenticationTrustedDomains));
            this._authenticationService.onDidRegisterAuthenticationProvider(() => {
                this._readAuthenticationTrustedDomainsResult?.dispose();
                this._readAuthenticationTrustedDomainsResult = new async_1.IdleValue(() => this._instantiationService.invokeFunction(trustedDomains_1.readAuthenticationTrustedDomains));
            });
            this._readWorkspaceTrustedDomainsResult = new async_1.IdleValue(() => this._instantiationService.invokeFunction(trustedDomains_1.readWorkspaceTrustedDomains));
            this._workspaceContextService.onDidChangeWorkspaceFolders(() => {
                this._readWorkspaceTrustedDomainsResult?.dispose();
                this._readWorkspaceTrustedDomainsResult = new async_1.IdleValue(() => this._instantiationService.invokeFunction(trustedDomains_1.readWorkspaceTrustedDomains));
            });
        }
        async validateLink(resource, openOptions) {
            if (!(0, opener_1.matchesScheme)(resource, network_1.Schemas.http) && !(0, opener_1.matchesScheme)(resource, network_1.Schemas.https)) {
                return true;
            }
            if (openOptions?.fromWorkspace && this._workspaceTrustService.isWorkspaceTrusted() && !this._configurationService.getValue('workbench.trustedDomains.promptInTrustedWorkspace')) {
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
            const [workspaceDomains, userDomains] = await Promise.all([this._readWorkspaceTrustedDomainsResult.value, this._readAuthenticationTrustedDomainsResult.value]);
            const { defaultTrustedDomains, trustedDomains, } = this._instantiationService.invokeFunction(trustedDomains_1.readStaticTrustedDomains);
            const allTrustedDomains = [...defaultTrustedDomains, ...trustedDomains, ...userDomains, ...workspaceDomains];
            if (isURLDomainTrusted(resourceUri, allTrustedDomains)) {
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
                const { result } = await this._dialogService.prompt({
                    type: severity_1.default.Info,
                    message: (0, nls_1.localize)('openExternalLinkAt', 'Do you want {0} to open the external website?', this._productService.nameShort),
                    detail: typeof originalResource === 'string' ? originalResource : formattedLink,
                    buttons: [
                        {
                            label: (0, nls_1.localize)({ key: 'open', comment: ['&& denotes a mnemonic'] }, '&&Open'),
                            run: () => true
                        },
                        {
                            label: (0, nls_1.localize)({ key: 'copy', comment: ['&& denotes a mnemonic'] }, '&&Copy'),
                            run: () => {
                                this._clipboardService.writeText(typeof originalResource === 'string' ? originalResource : resourceUri.toString(true));
                                return false;
                            }
                        },
                        {
                            label: (0, nls_1.localize)({ key: 'configureTrustedDomains', comment: ['&& denotes a mnemonic'] }, 'Configure &&Trusted Domains'),
                            run: async () => {
                                const pickedDomains = await (0, trustedDomains_1.configureOpenerTrustedDomainsHandler)(trustedDomains, domainToOpen, resourceUri, this._quickInputService, this._storageService, this._editorService, this._telemetryService);
                                // Trust all domains
                                if (pickedDomains.indexOf('*') !== -1) {
                                    return true;
                                }
                                // Trust current domain
                                if (isURLDomainTrusted(resourceUri, pickedDomains)) {
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
    exports.OpenerValidatorContributions = OpenerValidatorContributions;
    exports.OpenerValidatorContributions = OpenerValidatorContributions = __decorate([
        __param(0, opener_1.IOpenerService),
        __param(1, storage_1.IStorageService),
        __param(2, dialogs_1.IDialogService),
        __param(3, productService_1.IProductService),
        __param(4, quickInput_1.IQuickInputService),
        __param(5, editorService_1.IEditorService),
        __param(6, clipboardService_1.IClipboardService),
        __param(7, telemetry_1.ITelemetryService),
        __param(8, instantiation_1.IInstantiationService),
        __param(9, authentication_1.IAuthenticationService),
        __param(10, workspace_1.IWorkspaceContextService),
        __param(11, configuration_1.IConfigurationService),
        __param(12, workspaceTrust_1.IWorkspaceTrustManagementService)
    ], OpenerValidatorContributions);
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
    function isURLDomainTrusted(url, trustedDomains) {
        url = uri_1.URI.parse(normalizeURL(url));
        trustedDomains = trustedDomains.map(normalizeURL);
        if (isLocalhostAuthority(url.authority)) {
            return true;
        }
        for (let i = 0; i < trustedDomains.length; i++) {
            if (trustedDomains[i] === '*') {
                return true;
            }
            if ((0, urlGlob_1.testUrlMatchesGlob)(url, trustedDomains[i])) {
                return true;
            }
        }
        return false;
    }
    exports.isURLDomainTrusted = isURLDomainTrusted;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJ1c3RlZERvbWFpbnNWYWxpZGF0b3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi91cmwvYnJvd3Nlci90cnVzdGVkRG9tYWluc1ZhbGlkYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF3QnpGLElBQU0sNEJBQTRCLEdBQWxDLE1BQU0sNEJBQTRCO1FBS3hDLFlBQ2tDLGNBQThCLEVBQzdCLGVBQWdDLEVBQ2pDLGNBQThCLEVBQzdCLGVBQWdDLEVBQzdCLGtCQUFzQyxFQUMxQyxjQUE4QixFQUMzQixpQkFBb0MsRUFDcEMsaUJBQW9DLEVBQ2hDLHFCQUE0QyxFQUMzQyxzQkFBOEMsRUFDNUMsd0JBQWtELEVBQ3JELHFCQUE0QyxFQUNqQyxzQkFBd0Q7WUFaMUUsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBQzdCLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtZQUNqQyxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUFDN0Isb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBQzdCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7WUFDMUMsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBQzNCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7WUFDcEMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQUNoQywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQzNDLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBd0I7WUFDNUMsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEwQjtZQUNyRCwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQ2pDLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBa0M7WUFFM0csSUFBSSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUs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