/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/url/browser/trustedDomainsValidator", "vs/base/common/uri", "vs/workbench/contrib/url/browser/trustedDomains"], function (require, exports, assert, trustedDomainsValidator_1, uri_1, trustedDomains_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function linkAllowedByRules(link, rules) {
        assert.ok((0, trustedDomainsValidator_1.isURLDomainTrusted)(uri_1.URI.parse(link), rules), `Link\n${link}\n should be allowed by rules\n${JSON.stringify(rules)}`);
    }
    function linkNotAllowedByRules(link, rules) {
        assert.ok(!(0, trustedDomainsValidator_1.isURLDomainTrusted)(uri_1.URI.parse(link), rules), `Link\n${link}\n should NOT be allowed by rules\n${JSON.stringify(rules)}`);
    }
    suite('GitHub remote extraction', () => {
        test('All known formats', () => {
            assert.deepStrictEqual((0, trustedDomains_1.extractGitHubRemotesFromGitConfig)(`
[remote "1"]
			url = git@github.com:sshgit/vscode.git
[remote "2"]
			url = git@github.com:ssh/vscode
[remote "3"]
			url = https://github.com/httpsgit/vscode.git
[remote "4"]
			url = https://github.com/https/vscode`), [
                'https://github.com/sshgit/vscode/',
                'https://github.com/ssh/vscode/',
                'https://github.com/httpsgit/vscode/',
                'https://github.com/https/vscode/'
            ]);
        });
    });
    suite('Link protection domain matching', () => {
        test('simple', () => {
            linkNotAllowedByRules('https://x.org', []);
            linkAllowedByRules('https://x.org', ['https://x.org']);
            linkAllowedByRules('https://x.org/foo', ['https://x.org']);
            linkNotAllowedByRules('https://x.org', ['http://x.org']);
            linkNotAllowedByRules('http://x.org', ['https://x.org']);
            linkNotAllowedByRules('https://www.x.org', ['https://x.org']);
            linkAllowedByRules('https://www.x.org', ['https://www.x.org', 'https://y.org']);
        });
        test('localhost', () => {
            linkAllowedByRules('https://127.0.0.1', []);
            linkAllowedByRules('https://127.0.0.1:3000', []);
            linkAllowedByRules('https://localhost', []);
            linkAllowedByRules('https://localhost:3000', []);
        });
        test('* star', () => {
            linkAllowedByRules('https://a.x.org', ['https://*.x.org']);
            linkAllowedByRules('https://a.b.x.org', ['https://*.x.org']);
        });
        test('no scheme', () => {
            linkAllowedByRules('https://a.x.org', ['a.x.org']);
            linkAllowedByRules('https://a.x.org', ['*.x.org']);
            linkAllowedByRules('https://a.b.x.org', ['*.x.org']);
            linkAllowedByRules('https://x.org', ['*.x.org']);
        });
        test('sub paths', () => {
            linkAllowedByRules('https://x.org/foo', ['https://x.org/foo']);
            linkAllowedByRules('https://x.org/foo/bar', ['https://x.org/foo']);
            linkAllowedByRules('https://x.org/foo', ['https://x.org/foo/']);
            linkAllowedByRules('https://x.org/foo/bar', ['https://x.org/foo/']);
            linkAllowedByRules('https://x.org/foo', ['x.org/foo']);
            linkAllowedByRules('https://x.org/foo', ['*.org/foo']);
            linkNotAllowedByRules('https://x.org/bar', ['https://x.org/foo']);
            linkNotAllowedByRules('https://x.org/bar', ['x.org/foo']);
            linkNotAllowedByRules('https://x.org/bar', ['*.org/foo']);
            linkAllowedByRules('https://x.org/foo/bar', ['https://x.org/foo']);
            linkNotAllowedByRules('https://x.org/foo2', ['https://x.org/foo']);
            linkNotAllowedByRules('https://www.x.org/foo', ['https://x.org/foo']);
            linkNotAllowedByRules('https://a.x.org/bar', ['https://*.x.org/foo']);
            linkNotAllowedByRules('https://a.b.x.org/bar', ['https://*.x.org/foo']);
            linkAllowedByRules('https://github.com', ['https://github.com/foo/bar', 'https://github.com']);
        });
        test('ports', () => {
            linkNotAllowedByRules('https://x.org:8080/foo/bar', ['https://x.org:8081/foo']);
            linkAllowedByRules('https://x.org:8080/foo/bar', ['https://x.org:*/foo']);
            linkAllowedByRules('https://x.org/foo/bar', ['https://x.org:*/foo']);
            linkAllowedByRules('https://x.org:8080/foo/bar', ['https://x.org:8080/foo']);
        });
        test('ip addresses', () => {
            linkAllowedByRules('http://192.168.1.7/', ['http://192.168.1.7/']);
            linkAllowedByRules('http://192.168.1.7/', ['http://192.168.1.7']);
            linkAllowedByRules('http://192.168.1.7/', ['http://192.168.1.*']);
            linkNotAllowedByRules('http://192.168.1.7:3000/', ['http://192.168.*.6:*']);
            linkAllowedByRules('http://192.168.1.7:3000/', ['http://192.168.1.7:3000/']);
            linkAllowedByRules('http://192.168.1.7:3000/', ['http://192.168.1.7:*']);
            linkAllowedByRules('http://192.168.1.7:3000/', ['http://192.168.1.*:*']);
            linkNotAllowedByRules('http://192.168.1.7:3000/', ['http://192.168.*.6:*']);
        });
        test('scheme match', () => {
            linkAllowedByRules('http://192.168.1.7/', ['http://*']);
            linkAllowedByRules('http://twitter.com', ['http://*']);
            linkAllowedByRules('http://twitter.com/hello', ['http://*']);
            linkNotAllowedByRules('https://192.168.1.7/', ['http://*']);
            linkNotAllowedByRules('https://twitter.com/', ['http://*']);
        });
        test('case normalization', () => {
            // https://github.com/microsoft/vscode/issues/99294
            linkAllowedByRules('https://github.com/microsoft/vscode/issues/new', ['https://github.com/microsoft']);
            linkAllowedByRules('https://github.com/microsoft/vscode/issues/new', ['https://github.com/microsoft']);
        });
        test('ignore query & fragment - https://github.com/microsoft/vscode/issues/156839', () => {
            linkAllowedByRules('https://github.com/login/oauth/authorize?foo=4', ['https://github.com/login/oauth/authorize']);
            linkAllowedByRules('https://github.com/login/oauth/authorize#foo', ['https://github.com/login/oauth/authorize']);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJ1c3RlZERvbWFpbnMudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3VybC90ZXN0L2Jyb3dzZXIvdHJ1c3RlZERvbWFpbnMudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVFoRyxTQUFTLGtCQUFrQixDQUFDLElBQVksRUFBRSxLQUFlO1FBQ3hELE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBQSw0Q0FBa0IsRUFBQyxTQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUFFLFNBQVMsSUFBSSxrQ0FBa0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDL0gsQ0FBQztJQUNELFNBQVMscUJBQXFCLENBQUMsSUFBWSxFQUFFLEtBQWU7UUFDM0QsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUEsNENBQWtCLEVBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRSxTQUFTLElBQUksc0NBQXNDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3BJLENBQUM7SUFFRCxLQUFLLENBQUMsMEJBQTBCLEVBQUUsR0FBRyxFQUFFO1FBQ3RDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUU7WUFDOUIsTUFBTSxDQUFDLGVBQWUsQ0FDckIsSUFBQSxrREFBaUMsRUFDaEM7Ozs7Ozs7O3lDQVFxQyxDQUFDLEVBQ3ZDO2dCQUNDLG1DQUFtQztnQkFDbkMsZ0NBQWdDO2dCQUNoQyxxQ0FBcUM7Z0JBQ3JDLGtDQUFrQzthQUNsQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDO0lBRUgsS0FBSyxDQUFDLGlDQUFpQyxFQUFF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