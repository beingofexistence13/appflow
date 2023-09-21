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
    exports.$CTb = void 0;
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
    let $CTb = class $CTb {
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.capabilities = 2 /* FileSystemProviderCapabilities.FileReadWrite */;
            this.onDidChangeCapabilities = event_1.Event.None;
            this.onDidChangeFile = event_1.Event.None;
            this.a.registerProvider(TRUSTED_DOMAINS_SCHEMA, this);
        }
        stat(resource) {
            return Promise.resolve(TRUSTED_DOMAINS_STAT);
        }
        async readFile(resource) {
            let trustedDomainsContent = this.b.get(trustedDomains_1.$uTb, -1 /* StorageScope.APPLICATION */);
            const configuring = resource.fragment;
            const { defaultTrustedDomains, trustedDomains, userDomains, workspaceDomains } = await this.c.invokeFunction(trustedDomains_1.$yTb);
            if (!trustedDomainsContent ||
                trustedDomainsContent.indexOf(CONFIG_HELP_TEXT_PRE) === -1 ||
                trustedDomainsContent.indexOf(CONFIG_HELP_TEXT_AFTER) === -1 ||
                trustedDomainsContent.indexOf(configuring ?? '') === -1 ||
                [...defaultTrustedDomains, ...trustedDomains, ...userDomains, ...workspaceDomains].some(d => !(0, types_1.$uf)(trustedDomainsContent).includes(d))) {
                trustedDomainsContent = computeTrustedDomainContent(defaultTrustedDomains, trustedDomains, userDomains, workspaceDomains, configuring);
            }
            const buffer = buffer_1.$Fd.fromString(trustedDomainsContent).buffer;
            return buffer;
        }
        writeFile(resource, content, opts) {
            try {
                const trustedDomainsContent = buffer_1.$Fd.wrap(content).toString();
                const trustedDomains = (0, json_1.$Lm)(trustedDomainsContent);
                this.b.store(trustedDomains_1.$uTb, trustedDomainsContent, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                this.b.store(trustedDomains_1.$tTb, JSON.stringify(trustedDomains) || '', -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
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
    exports.$CTb = $CTb;
    exports.$CTb = $CTb = __decorate([
        __param(0, files_1.$6j),
        __param(1, storage_1.$Vo),
        __param(2, instantiation_1.$Ah)
    ], $CTb);
});
//# sourceMappingURL=trustedDomainsFileSystemProvider.js.map