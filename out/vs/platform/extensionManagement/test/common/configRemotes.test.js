/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/extensionManagement/common/configRemotes"], function (require, exports, assert, configRemotes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Config Remotes', () => {
        const allowedDomains = [
            'github.com',
            'github2.com',
            'github3.com',
            'example.com',
            'example2.com',
            'example3.com',
            'server.org',
            'server2.org',
        ];
        test('HTTPS remotes', function () {
            assert.deepStrictEqual((0, configRemotes_1.getDomainsOfRemotes)(remote('https://github.com/microsoft/vscode.git'), allowedDomains), ['github.com']);
            assert.deepStrictEqual((0, configRemotes_1.getDomainsOfRemotes)(remote('https://git.example.com/gitproject.git'), allowedDomains), ['example.com']);
            assert.deepStrictEqual((0, configRemotes_1.getDomainsOfRemotes)(remote('https://username@github2.com/username/repository.git'), allowedDomains), ['github2.com']);
            assert.deepStrictEqual((0, configRemotes_1.getDomainsOfRemotes)(remote('https://username:password@github3.com/username/repository.git'), allowedDomains), ['github3.com']);
            assert.deepStrictEqual((0, configRemotes_1.getDomainsOfRemotes)(remote('https://username:password@example2.com:1234/username/repository.git'), allowedDomains), ['example2.com']);
            assert.deepStrictEqual((0, configRemotes_1.getDomainsOfRemotes)(remote('https://example3.com:1234/username/repository.git'), allowedDomains), ['example3.com']);
        });
        test('SSH remotes', function () {
            assert.deepStrictEqual((0, configRemotes_1.getDomainsOfRemotes)(remote('ssh://user@git.server.org/project.git'), allowedDomains), ['server.org']);
        });
        test('SCP-like remotes', function () {
            assert.deepStrictEqual((0, configRemotes_1.getDomainsOfRemotes)(remote('git@github.com:microsoft/vscode.git'), allowedDomains), ['github.com']);
            assert.deepStrictEqual((0, configRemotes_1.getDomainsOfRemotes)(remote('user@git.server.org:project.git'), allowedDomains), ['server.org']);
            assert.deepStrictEqual((0, configRemotes_1.getDomainsOfRemotes)(remote('git.server2.org:project.git'), allowedDomains), ['server2.org']);
        });
        test('Local remotes', function () {
            assert.deepStrictEqual((0, configRemotes_1.getDomainsOfRemotes)(remote('/opt/git/project.git'), allowedDomains), []);
            assert.deepStrictEqual((0, configRemotes_1.getDomainsOfRemotes)(remote('file:///opt/git/project.git'), allowedDomains), []);
        });
        test('Multiple remotes', function () {
            const config = ['https://github.com/microsoft/vscode.git', 'https://git.example.com/gitproject.git'].map(remote).join('');
            assert.deepStrictEqual((0, configRemotes_1.getDomainsOfRemotes)(config, allowedDomains).sort(), ['example.com', 'github.com']);
        });
        test('Non allowed domains are anonymized', () => {
            const config = ['https://github.com/microsoft/vscode.git', 'https://git.foobar.com/gitproject.git'].map(remote).join('');
            assert.deepStrictEqual((0, configRemotes_1.getDomainsOfRemotes)(config, allowedDomains).sort(), ['aaaaaa.aaa', 'github.com']);
        });
        test('HTTPS remotes to be hashed', function () {
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('https://github.com/microsoft/vscode.git')), ['github.com/microsoft/vscode.git']);
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('https://git.example.com/gitproject.git')), ['git.example.com/gitproject.git']);
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('https://username@github2.com/username/repository.git')), ['github2.com/username/repository.git']);
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('https://username:password@github3.com/username/repository.git')), ['github3.com/username/repository.git']);
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('https://username:password@example2.com:1234/username/repository.git')), ['example2.com/username/repository.git']);
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('https://example3.com:1234/username/repository.git')), ['example3.com/username/repository.git']);
            // Strip .git
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('https://github.com/microsoft/vscode.git'), true), ['github.com/microsoft/vscode']);
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('https://git.example.com/gitproject.git'), true), ['git.example.com/gitproject']);
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('https://username@github2.com/username/repository.git'), true), ['github2.com/username/repository']);
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('https://username:password@github3.com/username/repository.git'), true), ['github3.com/username/repository']);
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('https://username:password@example2.com:1234/username/repository.git'), true), ['example2.com/username/repository']);
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('https://example3.com:1234/username/repository.git'), true), ['example3.com/username/repository']);
            // Compare Striped .git with no .git
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('https://github.com/microsoft/vscode.git'), true), (0, configRemotes_1.getRemotes)(remote('https://github.com/microsoft/vscode')));
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('https://git.example.com/gitproject.git'), true), (0, configRemotes_1.getRemotes)(remote('https://git.example.com/gitproject')));
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('https://username@github2.com/username/repository.git'), true), (0, configRemotes_1.getRemotes)(remote('https://username@github2.com/username/repository')));
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('https://username:password@github3.com/username/repository.git'), true), (0, configRemotes_1.getRemotes)(remote('https://username:password@github3.com/username/repository')));
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('https://username:password@example2.com:1234/username/repository.git'), true), (0, configRemotes_1.getRemotes)(remote('https://username:password@example2.com:1234/username/repository')));
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('https://example3.com:1234/username/repository.git'), true), (0, configRemotes_1.getRemotes)(remote('https://example3.com:1234/username/repository')));
        });
        test('SSH remotes to be hashed', function () {
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('ssh://user@git.server.org/project.git')), ['git.server.org/project.git']);
            // Strip .git
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('ssh://user@git.server.org/project.git'), true), ['git.server.org/project']);
            // Compare Striped .git with no .git
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('ssh://user@git.server.org/project.git'), true), (0, configRemotes_1.getRemotes)(remote('ssh://user@git.server.org/project')));
        });
        test('SCP-like remotes to be hashed', function () {
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('git@github.com:microsoft/vscode.git')), ['github.com/microsoft/vscode.git']);
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('user@git.server.org:project.git')), ['git.server.org/project.git']);
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('git.server2.org:project.git')), ['git.server2.org/project.git']);
            // Strip .git
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('git@github.com:microsoft/vscode.git'), true), ['github.com/microsoft/vscode']);
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('user@git.server.org:project.git'), true), ['git.server.org/project']);
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('git.server2.org:project.git'), true), ['git.server2.org/project']);
            // Compare Striped .git with no .git
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('git@github.com:microsoft/vscode.git'), true), (0, configRemotes_1.getRemotes)(remote('git@github.com:microsoft/vscode')));
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('user@git.server.org:project.git'), true), (0, configRemotes_1.getRemotes)(remote('user@git.server.org:project')));
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('git.server2.org:project.git'), true), (0, configRemotes_1.getRemotes)(remote('git.server2.org:project')));
        });
        test('Local remotes to be hashed', function () {
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('/opt/git/project.git')), []);
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(remote('file:///opt/git/project.git')), []);
        });
        test('Multiple remotes to be hashed', function () {
            const config = ['https://github.com/microsoft/vscode.git', 'https://git.example.com/gitproject.git'].map(remote).join(' ');
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(config), ['github.com/microsoft/vscode.git', 'git.example.com/gitproject.git']);
            // Strip .git
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(config, true), ['github.com/microsoft/vscode', 'git.example.com/gitproject']);
            // Compare Striped .git with no .git
            const noDotGitConfig = ['https://github.com/microsoft/vscode', 'https://git.example.com/gitproject'].map(remote).join(' ');
            assert.deepStrictEqual((0, configRemotes_1.getRemotes)(config, true), (0, configRemotes_1.getRemotes)(noDotGitConfig));
        });
        function remote(url) {
            return `[remote "origin"]
	url = ${url}
	fetch = +refs/heads/*:refs/remotes/origin/*
`;
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnUmVtb3Rlcy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZXh0ZW5zaW9uTWFuYWdlbWVudC90ZXN0L2NvbW1vbi9jb25maWdSZW1vdGVzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFLaEcsS0FBSyxDQUFDLGdCQUFnQixFQUFFLEdBQUcsRUFBRTtRQUU1QixNQUFNLGNBQWMsR0FBRztZQUN0QixZQUFZO1lBQ1osYUFBYTtZQUNiLGFBQWE7WUFDYixhQUFhO1lBQ2IsY0FBYztZQUNkLGNBQWM7WUFDZCxZQUFZO1lBQ1osYUFBYTtTQUNiLENBQUM7UUFFRixJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3JCLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBQSxtQ0FBbUIsRUFBQyxNQUFNLENBQUMseUNBQXlDLENBQUMsRUFBRSxjQUFjLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDL0gsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFBLG1DQUFtQixFQUFDLE1BQU0sQ0FBQyx3Q0FBd0MsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUMvSCxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUEsbUNBQW1CLEVBQUMsTUFBTSxDQUFDLHNEQUFzRCxDQUFDLEVBQUUsY0FBYyxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQzdJLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBQSxtQ0FBbUIsRUFBQyxNQUFNLENBQUMsK0RBQStELENBQUMsRUFBRSxjQUFjLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFDdEosTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFBLG1DQUFtQixFQUFDLE1BQU0sQ0FBQyxxRUFBcUUsQ0FBQyxFQUFFLGNBQWMs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