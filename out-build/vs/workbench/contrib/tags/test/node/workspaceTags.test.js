/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "crypto", "vs/workbench/contrib/tags/common/workspaceTags"], function (require, exports, assert, crypto, workspaceTags_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Vfc = void 0;
    function hash(value) {
        return crypto.createHash('sha1').update(value.toString()).digest('hex');
    }
    async function asyncHash(value) {
        return hash(value);
    }
    async function $Vfc(text, stripEndingDotGit = false) {
        return (0, workspaceTags_1.$OZb)(text, stripEndingDotGit, remote => asyncHash(remote));
    }
    exports.$Vfc = $Vfc;
    suite('Telemetry - WorkspaceTags', () => {
        test('Single remote hashed', async function () {
            assert.deepStrictEqual(await $Vfc(remote('https://username:password@github3.com/username/repository.git')), [hash('github3.com/username/repository.git')]);
            assert.deepStrictEqual(await $Vfc(remote('ssh://user@git.server.org/project.git')), [hash('git.server.org/project.git')]);
            assert.deepStrictEqual(await $Vfc(remote('user@git.server.org:project.git')), [hash('git.server.org/project.git')]);
            assert.deepStrictEqual(await $Vfc(remote('/opt/git/project.git')), []);
            // Strip .git
            assert.deepStrictEqual(await $Vfc(remote('https://username:password@github3.com/username/repository.git'), true), [hash('github3.com/username/repository')]);
            assert.deepStrictEqual(await $Vfc(remote('ssh://user@git.server.org/project.git'), true), [hash('git.server.org/project')]);
            assert.deepStrictEqual(await $Vfc(remote('user@git.server.org:project.git'), true), [hash('git.server.org/project')]);
            assert.deepStrictEqual(await $Vfc(remote('/opt/git/project.git'), true), []);
            // Compare Striped .git with no .git
            assert.deepStrictEqual(await $Vfc(remote('https://username:password@github3.com/username/repository.git'), true), await $Vfc(remote('https://username:password@github3.com/username/repository')));
            assert.deepStrictEqual(await $Vfc(remote('ssh://user@git.server.org/project.git'), true), await $Vfc(remote('ssh://user@git.server.org/project')));
            assert.deepStrictEqual(await $Vfc(remote('user@git.server.org:project.git'), true), [hash('git.server.org/project')]);
            assert.deepStrictEqual(await $Vfc(remote('/opt/git/project.git'), true), await $Vfc(remote('/opt/git/project')));
        });
        test('Multiple remotes hashed', async function () {
            const config = ['https://github.com/microsoft/vscode.git', 'https://git.example.com/gitproject.git'].map(remote).join(' ');
            assert.deepStrictEqual(await $Vfc(config), [hash('github.com/microsoft/vscode.git'), hash('git.example.com/gitproject.git')]);
            // Strip .git
            assert.deepStrictEqual(await $Vfc(config, true), [hash('github.com/microsoft/vscode'), hash('git.example.com/gitproject')]);
            // Compare Striped .git with no .git
            const noDotGitConfig = ['https://github.com/microsoft/vscode', 'https://git.example.com/gitproject'].map(remote).join(' ');
            assert.deepStrictEqual(await $Vfc(config, true), await $Vfc(noDotGitConfig));
        });
        function remote(url) {
            return `[remote "origin"]
	url = ${url}
	fetch = +refs/heads/*:refs/remotes/origin/*
`;
        }
    });
});
//# sourceMappingURL=workspaceTags.test.js.map