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
define(["require", "exports", "vs/base/common/event", "vs/base/common/json", "vs/platform/files/common/files", "vs/platform/storage/common/storage", "vs/base/common/buffer", "vs/workbench/contrib/url/browser/trustedDomains", "vs/base/common/types", "vs/platform/instantiation/common/instantiation"], function (require, exports, event_1, json_1, files_1, storage_1, buffer_1, trustedDomains_1, types_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TrustedDomainsFileSystemProvider = void 0;
    const TRUSTED_DOMAINS_SCHEMA = 'trustedDomains';
    const TRUSTED_DOMAINS_STAT = {
        type: files_1.FileType.File,
        ctime: Date.now(),
        mtime: Date.now(),
        size: 0
    };
    const CONFIG_HELP_TEXT_PRE = `// Links matching one or more entries in the list below can be opened without link protection.
// The following examples show what entries can look like:
// - "https://microsoft.com": Matches this specific domain using https
// - "https://microsoft.com:8080": Matches this specific domain on this port using https
// - "https://microsoft.com:*": Matches this specific domain on any port using https
// - "https://microsoft.com/foo": Matches https://microsoft.com/foo and https://microsoft.com/foo/bar,
//   but not https://microsoft.com/foobar or https://microsoft.com/bar
// - "https://*.microsoft.com": Match all domains ending in "microsoft.com" using https
// - "microsoft.com": Match this specific domain using either http or https
// - "*.microsoft.com": Match all domains ending in "microsoft.com" using either http or https
// - "http://192.168.0.1: Matches this specific IP using http
// - "http://192.168.0.*: Matches all IP's with this prefix using http
// - "*": Match all domains using either http or https
//
`;
    const CONFIG_HELP_TEXT_AFTER = `//
// You can use the "Manage Trusted Domains" command to open this file.
// Save this file to apply the trusted domains rules.
`;
    const CONFIG_PLACEHOLDER_TEXT = `[
	// "https://microsoft.com"
]`;
    function computeTrustedDomainContent(defaultTrustedDomains, trustedDomains, userTrustedDomains, workspaceTrustedDomains, configuring) {
        let content = CONFIG_HELP_TEXT_PRE;
        if (defaultTrustedDomains.length > 0) {
            content += `// By default, VS Code trusts "localhost" as well as the following domains:\n`;
            defaultTrustedDomains.forEach(d => {
                content += `// - "${d}"\n`;
            });
        }
        else {
            content += `// By default, VS Code trusts "localhost".\n`;
        }
        if (userTrustedDomains.length) {
            content += `//\n// Additionally, the following domains are trusted based on your logged-in Accounts:\n`;
            userTrustedDomains.forEach(d => {
                content += `// - "${d}"\n`;
            });
        }
        if (workspaceTrustedDomains.length) {
            content += `//\n// Further, the following domains are trusted based on your workspace configuration:\n`;
            workspaceTrustedDomains.forEach(d => {
                content += `// - "${d}"\n`;
            });
        }
        content += CONFIG_HELP_TEXT_AFTER;
        content += configuring ? `\n// Currently configuring trust for ${configuring}\n` : '';
        if (trustedDomains.length === 0) {
            content += CONFIG_PLACEHOLDER_TEXT;
        }
        else {
            content += JSON.stringify(trustedDomains, null, 2);
        }
        return content;
    }
    let TrustedDomainsFileSystemProvider = class TrustedDomainsFileSystemProvider {
        constructor(fileService, storageService, instantiationService) {
            this.fileService = fileService;
            this.storageService = storageService;
            this.instantiationService = instantiationService;
            this.capabilities = 2 /* FileSystemProviderCapabilities.FileReadWrite */;
            this.onDidChangeCapabilities = event_1.Event.None;
            this.onDidChangeFile = event_1.Event.None;
            this.fileService.registerProvider(TRUSTED_DOMAINS_SCHEMA, this);
        }
        stat(resource) {
            return Promise.resolve(TRUSTED_DOMAINS_STAT);
        }
        async readFile(resource) {
            let trustedDomainsContent = this.storageService.get(trustedDomains_1.TRUSTED_DOMAINS_CONTENT_STORAGE_KEY, -1 /* StorageScope.APPLICATION */);
            const configuring = resource.fragment;
            const { defaultTrustedDomains, trustedDomains, userDomains, workspaceDomains } = await this.instantiationService.invokeFunction(trustedDomains_1.readTrustedDomains);
            if (!trustedDomainsContent ||
                trustedDomainsContent.indexOf(CONFIG_HELP_TEXT_PRE) === -1 ||
                trustedDomainsContent.indexOf(CONFIG_HELP_TEXT_AFTER) === -1 ||
                trustedDomainsContent.indexOf(configuring ?? '') === -1 ||
                [...defaultTrustedDomains, ...trustedDomains, ...userDomains, ...workspaceDomains].some(d => !(0, types_1.assertIsDefined)(trustedDomainsContent).includes(d))) {
                trustedDomainsContent = computeTrustedDomainContent(defaultTrustedDomains, trustedDomains, userDomains, workspaceDomains, configuring);
            }
            const buffer = buffer_1.VSBuffer.fromString(trustedDomainsContent).buffer;
            return buffer;
        }
        writeFile(resource, content, opts) {
            try {
                const trustedDomainsContent = buffer_1.VSBuffer.wrap(content).toString();
                const trustedDomains = (0, json_1.parse)(trustedDomainsContent);
                this.storageService.store(trustedDomains_1.TRUSTED_DOMAINS_CONTENT_STORAGE_KEY, trustedDomainsContent, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                this.storageService.store(trustedDomains_1.TRUSTED_DOMAINS_STORAGE_KEY, JSON.stringify(trustedDomains) || '', -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
            }
            catch (err) { }
            return Promise.resolve();
        }
        watch(resource, opts) {
            return {
                dispose() {
                    return;
                }
            };
        }
        mkdir(resource) {
            return Promise.resolve(undefined);
        }
        readdir(resource) {
            return Promise.resolve(undefined);
        }
        delete(resource, opts) {
            return Promise.resolve(undefined);
        }
        rename(from, to, opts) {
            return Promise.resolve(undefined);
        }
    };
    exports.TrustedDomainsFileSystemProvider = TrustedDomainsFileSystemProvider;
    exports.TrustedDomainsFileSystemProvider = TrustedDomainsFileSystemProvider = __decorate([
        __param(0, files_1.IFileService),
        __param(1, storage_1.IStorageService),
        __param(2, instantiation_1.IInstantiationService)
    ], TrustedDomainsFileSystemProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJ1c3RlZERvbWFpbnNGaWxlU3lzdGVtUHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi91cmwvYnJvd3Nlci90cnVzdGVkRG9tYWluc0ZpbGVTeXN0ZW1Qcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFjaEcsTUFBTSxzQkFBc0IsR0FBRyxnQkFBZ0IsQ0FBQztJQUVoRCxNQUFNLG9CQUFvQixHQUFVO1FBQ25DLElBQUksRUFBRSxnQkFBUSxDQUFDLElBQUk7UUFDbkIsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUU7UUFDakIsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUU7UUFDakIsSUFBSSxFQUFFLENBQUM7S0FDUCxDQUFDO0lBRUYsTUFBTSxvQkFBb0IsR0FBRzs7Ozs7Ozs7Ozs7Ozs7Q0FjNUIsQ0FBQztJQUVGLE1BQU0sc0JBQXNCLEdBQUc7OztDQUc5QixDQUFDO0lBRUYsTUFBTSx1QkFBdUIsR0FBRzs7RUFFOUIsQ0FBQztJQUVILFNBQVMsMkJBQTJCLENBQUMscUJBQStCLEVBQUUsY0FBd0IsRUFBRSxrQkFBNEIsRUFBRSx1QkFBaUMsRUFBRSxXQUFvQjtRQUNwTCxJQUFJLE9BQU8sR0FBRyxvQkFBb0IsQ0FBQztRQUVuQyxJQUFJLHFCQUFxQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDckMsT0FBTyxJQUFJLCtFQUErRSxDQUFDO1lBQzNGLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDakMsT0FBTyxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUM7WUFDNUIsQ0FBQyxDQUFDLENBQUM7U0FDSDthQUFNO1lBQ04sT0FBTyxJQUFJLDhDQUE4QyxDQUFDO1NBQzFEO1FBRUQsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEVBQUU7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