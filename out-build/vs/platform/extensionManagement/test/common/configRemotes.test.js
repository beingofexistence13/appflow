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
            assert.deepStrictEqual((0, configRemotes_1.$LZb)(remote('https://github.com/microsoft/vscode.git'), allowedDomains), ['github.com']);
            assert.deepStrictEqual((0, configRemotes_1.$LZb)(remote('https://git.example.com/gitproject.git'), allowedDomains), ['example.com']);
            assert.deepStrictEqual((0, configRemotes_1.$LZb)(remote('https://username@github2.com/username/repository.git'), allowedDomains), ['github2.com']);
            assert.deepStrictEqual((0, configRemotes_1.$LZb)(remote('https://username:password@github3.com/username/repository.git'), allowedDomains), ['github3.com']);
            assert.deepStrictEqual((0, configRemotes_1.$LZb)(remote('https://username:password@example2.com:1234/username/repository.git'), allowedDomains), ['example2.com']);
            assert.deepStrictEqual((0, configRemotes_1.$LZb)(remote('https://example3.com:1234/username/repository.git'), allowedDomains), ['example3.com']);
        });
        test('SSH remotes', function () {
            assert.deepStrictEqual((0, configRemotes_1.$LZb)(remote('ssh://user@git.server.org/project.git'), allowedDomains), ['server.org']);
        });
        test('SCP-like remotes', function () {
            assert.deepStrictEqual((0, configRemotes_1.$LZb)(remote('git@github.com:microsoft/vscode.git'), allowedDomains), ['github.com']);
            assert.deepStrictEqual((0, configRemotes_1.$LZb)(remote('user@git.server.org:project.git'), allowedDomains), ['server.org']);
            assert.deepStrictEqual((0, configRemotes_1.$LZb)(remote('git.server2.org:project.git'), allowedDomains), ['server2.org']);
        });
        test('Local remotes', function () {
            assert.deepStrictEqual((0, configRemotes_1.$LZb)(remote('/opt/git/project.git'), allowedDomains), []);
            assert.deepStrictEqual((0, configRemotes_1.$LZb)(remote('file:///opt/git/project.git'), allowedDomains), []);
        });
        test('Multiple remotes', function () {
            const config = ['https://github.com/microsoft/vscode.git', 'https://git.example.com/gitproject.git'].map(remote).join('');
            assert.deepStrictEqual((0, configRemotes_1.$LZb)(config, allowedDomains).sort(), ['example.com', 'github.com']);
        });
        test('Non allowed domains are anonymized', () => {
            const config = ['https://github.com/microsoft/vscode.git', 'https://git.foobar.com/gitproject.git'].map(remote).join('');
            assert.deepStrictEqual((0, configRemotes_1.$LZb)(config, allowedDomains).sort(), ['aaaaaa.aaa', 'github.com']);
        });
        test('HTTPS remotes to be hashed', function () {
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('https://github.com/microsoft/vscode.git')), ['github.com/microsoft/vscode.git']);
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('https://git.example.com/gitproject.git')), ['git.example.com/gitproject.git']);
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('https://username@github2.com/username/repository.git')), ['github2.com/username/repository.git']);
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('https://username:password@github3.com/username/repository.git')), ['github3.com/username/repository.git']);
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('https://username:password@example2.com:1234/username/repository.git')), ['example2.com/username/repository.git']);
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('https://example3.com:1234/username/repository.git')), ['example3.com/username/repository.git']);
            // Strip .git
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('https://github.com/microsoft/vscode.git'), true), ['github.com/microsoft/vscode']);
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('https://git.example.com/gitproject.git'), true), ['git.example.com/gitproject']);
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('https://username@github2.com/username/repository.git'), true), ['github2.com/username/repository']);
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('https://username:password@github3.com/username/repository.git'), true), ['github3.com/username/repository']);
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('https://username:password@example2.com:1234/username/repository.git'), true), ['example2.com/username/repository']);
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('https://example3.com:1234/username/repository.git'), true), ['example3.com/username/repository']);
            // Compare Striped .git with no .git
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('https://github.com/microsoft/vscode.git'), true), (0, configRemotes_1.$MZb)(remote('https://github.com/microsoft/vscode')));
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('https://git.example.com/gitproject.git'), true), (0, configRemotes_1.$MZb)(remote('https://git.example.com/gitproject')));
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('https://username@github2.com/username/repository.git'), true), (0, configRemotes_1.$MZb)(remote('https://username@github2.com/username/repository')));
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('https://username:password@github3.com/username/repository.git'), true), (0, configRemotes_1.$MZb)(remote('https://username:password@github3.com/username/repository')));
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('https://username:password@example2.com:1234/username/repository.git'), true), (0, configRemotes_1.$MZb)(remote('https://username:password@example2.com:1234/username/repository')));
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('https://example3.com:1234/username/repository.git'), true), (0, configRemotes_1.$MZb)(remote('https://example3.com:1234/username/repository')));
        });
        test('SSH remotes to be hashed', function () {
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('ssh://user@git.server.org/project.git')), ['git.server.org/project.git']);
            // Strip .git
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('ssh://user@git.server.org/project.git'), true), ['git.server.org/project']);
            // Compare Striped .git with no .git
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('ssh://user@git.server.org/project.git'), true), (0, configRemotes_1.$MZb)(remote('ssh://user@git.server.org/project')));
        });
        test('SCP-like remotes to be hashed', function () {
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('git@github.com:microsoft/vscode.git')), ['github.com/microsoft/vscode.git']);
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('user@git.server.org:project.git')), ['git.server.org/project.git']);
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('git.server2.org:project.git')), ['git.server2.org/project.git']);
            // Strip .git
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('git@github.com:microsoft/vscode.git'), true), ['github.com/microsoft/vscode']);
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('user@git.server.org:project.git'), true), ['git.server.org/project']);
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('git.server2.org:project.git'), true), ['git.server2.org/project']);
            // Compare Striped .git with no .git
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('git@github.com:microsoft/vscode.git'), true), (0, configRemotes_1.$MZb)(remote('git@github.com:microsoft/vscode')));
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('user@git.server.org:project.git'), true), (0, configRemotes_1.$MZb)(remote('user@git.server.org:project')));
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('git.server2.org:project.git'), true), (0, configRemotes_1.$MZb)(remote('git.server2.org:project')));
        });
        test('Local remotes to be hashed', function () {
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('/opt/git/project.git')), []);
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(remote('file:///opt/git/project.git')), []);
        });
        test('Multiple remotes to be hashed', function () {
            const config = ['https://github.com/microsoft/vscode.git', 'https://git.example.com/gitproject.git'].map(remote).join(' ');
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(config), ['github.com/microsoft/vscode.git', 'git.example.com/gitproject.git']);
            // Strip .git
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(config, true), ['github.com/microsoft/vscode', 'git.example.com/gitproject']);
            // Compare Striped .git with no .git
            const noDotGitConfig = ['https://github.com/microsoft/vscode', 'https://git.example.com/gitproject'].map(remote).join(' ');
            assert.deepStrictEqual((0, configRemotes_1.$MZb)(config, true), (0, configRemotes_1.$MZb)(noDotGitConfig));
        });
        function remote(url) {
            return `[remote "origin"]
	url = ${url}
	fetch = +refs/heads/*:refs/remotes/origin/*
`;
        }
    });
});
//# sourceMappingURL=configRemotes.test.js.map