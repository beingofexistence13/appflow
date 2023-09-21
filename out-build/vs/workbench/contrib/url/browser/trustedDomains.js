/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/nls!vs/workbench/contrib/url/browser/trustedDomains", "vs/platform/product/common/productService", "vs/platform/storage/common/storage", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/authentication/common/authentication", "vs/platform/files/common/files", "vs/workbench/services/textfile/common/textfiles", "vs/platform/workspace/common/workspace", "vs/workbench/services/environment/browser/environmentService"], function (require, exports, uri_1, nls_1, productService_1, storage_1, editorService_1, authentication_1, files_1, textfiles_1, workspace_1, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$BTb = exports.$ATb = exports.$zTb = exports.$yTb = exports.$xTb = exports.$wTb = exports.$vTb = exports.$uTb = exports.$tTb = void 0;
    const TRUSTED_DOMAINS_URI = uri_1.URI.parse('trustedDomains:/Trusted Domains');
    exports.$tTb = 'http.linkProtectionTrustedDomains';
    exports.$uTb = 'http.linkProtectionTrustedDomainsContent';
    exports.$vTb = {
        id: 'workbench.action.manageTrustedDomain',
        description: {
            description: (0, nls_1.localize)(0, null),
            args: []
        },
        handler: async (accessor) => {
            const editorService = accessor.get(editorService_1.$9C);
            editorService.openEditor({ resource: TRUSTED_DOMAINS_URI, languageId: 'jsonc', options: { pinned: true } });
            return;
        }
    };
    async function $wTb(trustedDomains, domainToConfigure, resource, quickInputService, storageService, editorService, telemetryService) {
        const parsedDomainToConfigure = uri_1.URI.parse(domainToConfigure);
        const toplevelDomainSegements = parsedDomainToConfigure.authority.split('.');
        const domainEnd = toplevelDomainSegements.slice(toplevelDomainSegements.length - 2).join('.');
        const topLevelDomain = '*.' + domainEnd;
        const options = [];
        options.push({
            type: 'item',
            label: (0, nls_1.localize)(1, null, domainToConfigure),
            id: 'trust',
            toTrust: domainToConfigure,
            picked: true
        });
        const isIP = toplevelDomainSegements.length === 4 &&
            toplevelDomainSegements.every(segment => Number.isInteger(+segment) || Number.isInteger(+segment.split(':')[0]));
        if (isIP) {
            if (parsedDomainToConfigure.authority.includes(':')) {
                const base = parsedDomainToConfigure.authority.split(':')[0];
                options.push({
                    type: 'item',
                    label: (0, nls_1.localize)(2, null, base),
                    toTrust: base + ':*',
                    id: 'trust'
                });
            }
        }
        else {
            options.push({
                type: 'item',
                label: (0, nls_1.localize)(3, null, domainEnd),
                toTrust: topLevelDomain,
                id: 'trust'
            });
        }
        options.push({
            type: 'item',
            label: (0, nls_1.localize)(4, null),
            toTrust: '*',
            id: 'trust'
        });
        options.push({
            type: 'item',
            label: (0, nls_1.localize)(5, null),
            id: 'manage'
        });
        const pickedResult = await quickInputService.pick(options, { activeItem: options[0] });
        if (pickedResult && pickedResult.id) {
            switch (pickedResult.id) {
                case 'manage':
                    await editorService.openEditor({
                        resource: TRUSTED_DOMAINS_URI.with({ fragment: resource.toString() }),
                        languageId: 'jsonc',
                        options: { pinned: true }
                    });
                    return trustedDomains;
                case 'trust': {
                    const itemToTrust = pickedResult.toTrust;
                    if (trustedDomains.indexOf(itemToTrust) === -1) {
                        storageService.remove(exports.$uTb, -1 /* StorageScope.APPLICATION */);
                        storageService.store(exports.$tTb, JSON.stringify([...trustedDomains, itemToTrust]), -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                        return [...trustedDomains, itemToTrust];
                    }
                }
            }
        }
        return [];
    }
    exports.$wTb = $wTb;
    // Exported for testing.
    function $xTb(gitConfig) {
        const domains = new Set();
        let match;
        const RemoteMatcher = /^\s*url\s*=\s*(?:git@|https:\/\/)github\.com(?::|\/)(\S*)\s*$/mg;
        while (match = RemoteMatcher.exec(gitConfig)) {
            const repo = match[1].replace(/\.git$/, '');
            if (repo) {
                domains.add(`https://github.com/${repo}/`);
            }
        }
        return [...domains];
    }
    exports.$xTb = $xTb;
    async function getRemotes(fileService, textFileService, contextService) {
        const workspaceUris = contextService.getWorkspace().folders.map(folder => folder.uri);
        const domains = await Promise.race([
            new Promise(resolve => setTimeout(() => resolve([]), 2000)),
            Promise.all(workspaceUris.map(async (workspaceUri) => {
                try {
                    const path = workspaceUri.path;
                    const uri = workspaceUri.with({ path: `${path !== '/' ? path : ''}/.git/config` });
                    const exists = await fileService.exists(uri);
                    if (!exists) {
                        return [];
                    }
                    const gitConfig = (await (textFileService.read(uri, { acceptTextOnly: true }).catch(() => ({ value: '' })))).value;
                    return $xTb(gitConfig);
                }
                catch {
                    return [];
                }
            }))
        ]);
        const set = domains.reduce((set, list) => list.reduce((set, item) => set.add(item), set), new Set());
        return [...set];
    }
    async function $yTb(accessor) {
        const { defaultTrustedDomains, trustedDomains } = $BTb(accessor);
        const [workspaceDomains, userDomains] = await Promise.all([$zTb(accessor), $ATb(accessor)]);
        return {
            workspaceDomains,
            userDomains,
            defaultTrustedDomains,
            trustedDomains,
        };
    }
    exports.$yTb = $yTb;
    async function $zTb(accessor) {
        const fileService = accessor.get(files_1.$6j);
        const textFileService = accessor.get(textfiles_1.$JD);
        const workspaceContextService = accessor.get(workspace_1.$Kh);
        return getRemotes(fileService, textFileService, workspaceContextService);
    }
    exports.$zTb = $zTb;
    async function $ATb(accessor) {
        const authenticationService = accessor.get(authentication_1.$3I);
        return authenticationService.isAuthenticationProviderRegistered('github') && ((await authenticationService.getSessions('github')) ?? []).length > 0
            ? [`https://github.com`]
            : [];
    }
    exports.$ATb = $ATb;
    function $BTb(accessor) {
        const storageService = accessor.get(storage_1.$Vo);
        const productService = accessor.get(productService_1.$kj);
        const environmentService = accessor.get(environmentService_1.$LT);
        const defaultTrustedDomains = [
            ...productService.linkProtectionTrustedDomains ?? [],
            ...environmentService.options?.additionalTrustedDomains ?? []
        ];
        let trustedDomains = [];
        try {
            const trustedDomainsSrc = storageService.get(exports.$tTb, -1 /* StorageScope.APPLICATION */);
            if (trustedDomainsSrc) {
                trustedDomains = JSON.parse(trustedDomainsSrc);
            }
        }
        catch (err) { }
        return {
            defaultTrustedDomains,
            trustedDomains,
        };
    }
    exports.$BTb = $BTb;
});
//# sourceMappingURL=trustedDomains.js.map