/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri"], function (require, exports, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getRemotes = exports.getDomainsOfRemotes = exports.AllowedSecondLevelDomains = void 0;
    const SshProtocolMatcher = /^([^@:]+@)?([^:]+):/;
    const SshUrlMatcher = /^([^@:]+@)?([^:]+):(.+)$/;
    const AuthorityMatcher = /^([^@]+@)?([^:]+)(:\d+)?$/;
    const SecondLevelDomainMatcher = /([^@:.]+\.[^@:.]+)(:\d+)?$/;
    const RemoteMatcher = /^\s*url\s*=\s*(.+\S)\s*$/mg;
    const AnyButDot = /[^.]/g;
    exports.AllowedSecondLevelDomains = [
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
    function getDomainsOfRemotes(text, allowedDomains) {
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
    exports.getDomainsOfRemotes = getDomainsOfRemotes;
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
    function getRemotes(text, stripEndingDotGit = false) {
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
    exports.getRemotes = getRemotes;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnUmVtb3Rlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2V4dGVuc2lvbk1hbmFnZW1lbnQvY29tbW9uL2NvbmZpZ1JlbW90ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBSWhHLE1BQU0sa0JBQWtCLEdBQUcscUJBQXFCLENBQUM7SUFDakQsTUFBTSxhQUFhLEdBQUcsMEJBQTBCLENBQUM7SUFDakQsTUFBTSxnQkFBZ0IsR0FBRywyQkFBMkIsQ0FBQztJQUNyRCxNQUFNLHdCQUF3QixHQUFHLDRCQUE0QixDQUFDO0lBQzlELE1BQU0sYUFBYSxHQUFHLDRCQUE0QixDQUFDO0lBQ25ELE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQztJQUViLFFBQUEseUJBQXlCLEdBQUc7UUFDeEMsWUFBWTtRQUNaLGVBQWU7UUFDZixrQkFBa0I7UUFDbEIsWUFBWTtRQUNaLFlBQVk7UUFDWixtQkFBbUI7UUFDbkIsU0FBUztRQUNULFlBQVk7UUFDWixlQUFlO1FBQ2YsY0FBYztRQUNkLGFBQWE7UUFDYixZQUFZO1FBQ1osV0FBVztLQUNYLENBQUM7SUFFRixTQUFTLG9CQUFvQixDQUFDLE1BQWM7UUFDM0MsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQ3JELE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUNoQyxDQUFDO0lBRUQsU0FBUyxhQUFhLENBQUMsR0FBVztRQUNqQyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7WUFDOUIsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQzVDLElBQUksS0FBSyxF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