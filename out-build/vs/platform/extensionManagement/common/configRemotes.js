/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri"], function (require, exports, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$MZb = exports.$LZb = exports.$KZb = void 0;
    const SshProtocolMatcher = /^([^@:]+@)?([^:]+):/;
    const SshUrlMatcher = /^([^@:]+@)?([^:]+):(.+)$/;
    const AuthorityMatcher = /^([^@]+@)?([^:]+)(:\d+)?$/;
    const SecondLevelDomainMatcher = /([^@:.]+\.[^@:.]+)(:\d+)?$/;
    const RemoteMatcher = /^\s*url\s*=\s*(.+\S)\s*$/mg;
    const AnyButDot = /[^.]/g;
    exports.$KZb = [
        'github.com',
        'bitbucket.org',
        'visualstudio.com',
        'gitlab.com',
        'heroku.com',
        'azurewebsites.net',
        'ibm.com',
        'amazon.com',
        'amazonaws.com',
        'cloudapp.net',
        'rhcloud.com',
        'google.com',
        'azure.com'
    ];
    function stripLowLevelDomains(domain) {
        const match = domain.match(SecondLevelDomainMatcher);
        return match ? match[1] : null;
    }
    function extractDomain(url) {
        if (url.indexOf('://') === -1) {
            const match = url.match(SshProtocolMatcher);
            if (match) {
                return stripLowLevelDomains(match[2]);
            }
            else {
                return null;
            }
        }
        try {
            const uri = uri_1.URI.parse(url);
            if (uri.authority) {
                return stripLowLevelDomains(uri.authority);
            }
        }
        catch (e) {
            // ignore invalid URIs
        }
        return null;
    }
    function $LZb(text, allowedDomains) {
        const domains = new Set();
        let match;
        while (match = RemoteMatcher.exec(text)) {
            const domain = extractDomain(match[1]);
            if (domain) {
                domains.add(domain);
            }
        }
        const allowedDomainsSet = new Set(allowedDomains);
        return Array.from(domains)
            .map(key => allowedDomainsSet.has(key) ? key : key.replace(AnyButDot, 'a'));
    }
    exports.$LZb = $LZb;
    function stripPort(authority) {
        const match = authority.match(AuthorityMatcher);
        return match ? match[2] : null;
    }
    function normalizeRemote(host, path, stripEndingDotGit) {
        if (host && path) {
            if (stripEndingDotGit && path.endsWith('.git')) {
                path = path.substr(0, path.length - 4);
            }
            return (path.indexOf('/') === 0) ? `${host}${path}` : `${host}/${path}`;
        }
        return null;
    }
    function extractRemote(url, stripEndingDotGit) {
        if (url.indexOf('://') === -1) {
            const match = url.match(SshUrlMatcher);
            if (match) {
                return normalizeRemote(match[2], match[3], stripEndingDotGit);
            }
        }
        try {
            const uri = uri_1.URI.parse(url);
            if (uri.authority) {
                return normalizeRemote(stripPort(uri.authority), uri.path, stripEndingDotGit);
            }
        }
        catch (e) {
            // ignore invalid URIs
        }
        return null;
    }
    function $MZb(text, stripEndingDotGit = false) {
        const remotes = [];
        let match;
        while (match = RemoteMatcher.exec(text)) {
            const remote = extractRemote(match[1], stripEndingDotGit);
            if (remote) {
                remotes.push(remote);
            }
        }
        return remotes;
    }
    exports.$MZb = $MZb;
});
//# sourceMappingURL=configRemotes.js.map