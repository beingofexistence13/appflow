/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/nls", "vs/platform/product/common/productService", "vs/platform/storage/common/storage", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/authentication/common/authentication", "vs/platform/files/common/files", "vs/workbench/services/textfile/common/textfiles", "vs/platform/workspace/common/workspace", "vs/workbench/services/environment/browser/environmentService"], function (require, exports, uri_1, nls_1, productService_1, storage_1, editorService_1, authentication_1, files_1, textfiles_1, workspace_1, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.readStaticTrustedDomains = exports.readAuthenticationTrustedDomains = exports.readWorkspaceTrustedDomains = exports.readTrustedDomains = exports.extractGitHubRemotesFromGitConfig = exports.configureOpenerTrustedDomainsHandler = exports.manageTrustedDomainSettingsCommand = exports.TRUSTED_DOMAINS_CONTENT_STORAGE_KEY = exports.TRUSTED_DOMAINS_STORAGE_KEY = void 0;
    const TRUSTED_DOMAINS_URI = uri_1.URI.parse('trustedDomains:/Trusted Domains');
    exports.TRUSTED_DOMAINS_STORAGE_KEY = 'http.linkProtectionTrustedDomains';
    exports.TRUSTED_DOMAINS_CONTENT_STORAGE_KEY = 'http.linkProtectionTrustedDomainsContent';
    exports.manageTrustedDomainSettingsCommand = {
        id: 'workbench.action.manageTrustedDomain',
        description: {
            description: (0, nls_1.localize)('trustedDomain.manageTrustedDomain', 'Manage Trusted Domains'),
            args: []
        },
        handler: async (accessor) => {
            const editorService = accessor.get(editorService_1.IEditorService);
            editorService.openEditor({ resource: TRUSTED_DOMAINS_URI, languageId: 'jsonc', options: { pinned: true } });
            return;
        }
    };
    async function configureOpenerTrustedDomainsHandler(trustedDomains, domainToConfigure, resource, quickInputService, storageService, editorService, telemetryService) {
        const parsedDomainToConfigure = uri_1.URI.parse(domainToConfigure);
        const toplevelDomainSegements = parsedDomainToConfigure.authority.split('.');
        const domainEnd = toplevelDomainSegements.slice(toplevelDomainSegements.length - 2).join('.');
        const topLevelDomain = '*.' + domainEnd;
        const options = [];
        options.push({
            type: 'item',
            label: (0, nls_1.localize)('trustedDomain.trustDomain', 'Trust {0}', domainToConfigure),
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
                    label: (0, nls_1.localize)('trustedDomain.trustAllPorts', 'Trust {0} on all ports', base),
                    toTrust: base + ':*',
                    id: 'trust'
                });
            }
        }
        else {
            options.push({
                type: 'item',
                label: (0, nls_1.localize)('trustedDomain.trustSubDomain', 'Trust {0} and all its subdomains', domainEnd),
                toTrust: topLevelDomain,
                id: 'trust'
            });
        }
        options.push({
            type: 'item',
            label: (0, nls_1.localize)('trustedDomain.trustAllDomains', 'Trust all domains (disables link protection)'),
            toTrust: '*',
            id: 'trust'
        });
        options.push({
            type: 'item',
            label: (0, nls_1.localize)('trustedDomain.manageTrustedDomains', 'Manage Trusted Domains'),
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
                        storageService.remove(exports.TRUSTED_DOMAINS_CONTENT_STORAGE_KEY, -1 /* StorageScope.APPLICATION */);
                        storageService.store(exports.TRUSTED_DOMAINS_STORAGE_KEY, JSON.stringify([...trustedDomains, itemToTrust]), -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                        return [...trustedDomains, itemToTrust];
                    }
                }
            }
        }
        return [];
    }
    exports.configureOpenerTrustedDomainsHandler = configureOpenerTrustedDomainsHandler;
    // Exported for testing.
    function extractGitHubRemotesFromGitConfig(gitConfig) {
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
    exports.extractGitHubRemotesFromGitConfig = extractGitHubRemotesFromGitConfig;
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
                    return extractGitHubRemotesFromGitConfig(gitConfig);
                }
                catch {
                    return [];
                }
            }))
        ]);
        const set = domains.reduce((set, list) => list.reduce((set, item) => set.add(item), set), new Set());
        return [...set];
    }
    async function readTrustedDomains(accessor) {
        const { defaultTrustedDomains, trustedDomains } = readStaticTrustedDomains(accessor);
        const [workspaceDomains, userDomains] = await Promise.all([readWorkspaceTrustedDomains(accessor), readAuthenticationTrustedDomains(accessor)]);
        return {
            workspaceDomains,
            userDomains,
            defaultTrustedDomains,
            trustedDomains,
        };
    }
    exports.readTrustedDomains = readTrustedDomains;
    async function readWorkspaceTrustedDomains(accessor) {
        const fileService = accessor.get(files_1.IFileService);
        const textFileService = accessor.get(textfiles_1.ITextFileService);
        const workspaceContextService = accessor.get(workspace_1.IWorkspaceContextService);
        return getRemotes(fileService, textFileService, workspaceContextService);
    }
    exports.readWorkspaceTrustedDomains = readWorkspaceTrustedDomains;
    async function readAuthenticationTrustedDomains(accessor) {
        const authenticationService = accessor.get(authentication_1.IAuthenticationService);
        return authenticationService.isAuthenticationProviderRegistered('github') && ((await authenticationService.getSessions('github')) ?? []).length > 0
            ? [`https://github.com`]
            : [];
    }
    exports.readAuthenticationTrustedDomains = readAuthenticationTrustedDomains;
    function readStaticTrustedDomains(accessor) {
        const storageService = accessor.get(storage_1.IStorageService);
        const productService = accessor.get(productService_1.IProductService);
        const environmentService = accessor.get(environmentService_1.IBrowserWorkbenchEnvironmentService);
        const defaultTrustedDomains = [
            ...productService.linkProtectionTrustedDomains ?? [],
            ...environmentService.options?.additionalTrustedDomains ?? []
        ];
        let trustedDomains = [];
        try {
            const trustedDomainsSrc = storageService.get(exports.TRUSTED_DOMAINS_STORAGE_KEY, -1 /* StorageScope.APPLICATION */);
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
    exports.readStaticTrustedDomains = readStaticTrustedDomains;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJ1c3RlZERvbWFpbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi91cmwvYnJvd3Nlci90cnVzdGVkRG9tYWlucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFnQmhHLE1BQU0sbUJBQW1CLEdBQUcsU0FBRyxDQUFDLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO0lBRTVELFFBQUEsMkJBQTJCLEdBQUcsbUNBQW1DLENBQUM7SUFDbEUsUUFBQSxtQ0FBbUMsR0FBRywwQ0FBMEMsQ0FBQztJQUVqRixRQUFBLGtDQUFrQyxHQUFHO1FBQ2pELEVBQUUsRUFBRSxzQ0FBc0M7UUFDMUMsV0FBVyxFQUFFO1lBQ1osV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLG1DQUFtQyxFQUFFLHdCQUF3QixDQUFDO1lBQ3BGLElBQUksRUFBRSxFQUFFO1NBQ1I7UUFDRCxPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQTBCLEVBQUUsRUFBRTtZQUM3QyxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFjLENBQUMsQ0FBQztZQUNuRCxhQUFhLENBQUMsVUFBVSxDQUFDLEVBQUUsUUFBUSxFQUFFLG1CQUFtQixFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM1RyxPQUFPO1FBQ1IsQ0FBQztLQUNELENBQUM7SUFJSyxLQUFLLFVBQVUsb0NBQW9DLENBQ3pELGNBQXdCLEVBQ3hCLGlCQUF5QixFQUN6QixRQUFhLEVBQ2IsaUJBQXFDLEVBQ3JDLGNBQStCLEVBQy9CLGFBQTZCLEVBQzdCLGdCQUFtQztRQUVuQyxNQUFNLHVCQUF1QixHQUFHLFNBQUcsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUM3RCxNQUFNLHVCQUF1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